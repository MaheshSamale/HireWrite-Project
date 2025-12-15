const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const pool = require('../utils/db');
const result = require('../utils/results');
const config = require('../utils/config');
const authorizeUser = require('../utils/authUser');

const router = express.Router();

// REGISTER ORGANIZATION (Inserts into Organizations table)
router.post('/register', (req, res) => {
    console.log(req.body);
    
    const { name, website, description, email, password } = req.body;
    console.log("Organization register:", email);
    
    // Validation
    if (!name || !email || !password) {
        return res.send(result.createResult('Organization name, email, and password required', null));
    }

    // 1. Check if organization already exists
    const checkSql = `SELECT organization_id FROM Organizations 
                      WHERE email = ? AND is_deleted = FALSE`;
    pool.query(checkSql, [email], (err, checkData) => {
        if (err) return res.send(result.createResult(err, null));
        if (checkData.length > 0) {
            return res.send(result.createResult('Organization email already registered', null));
        }
        
        // 2. Hash password
        bcrypt.hash(password, config.SALT_ROUND, (err, hashedPassword) => {
            if (err || !hashedPassword) {
                return res.send(result.createResult('Password hashing failed', null));
            }
            
            // 3. Create Organization record
            const organization_id = uuidv4();
            const sql = `INSERT INTO Organizations (
                organization_id, name, website, description, email, password, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, NOW())`;
            
            pool.query(sql, [
                organization_id, 
                name, 
                website || null, 
                description || null, 
                email, 
                hashedPassword
            ], (err, data) => {
                if (err) return res.send(result.createResult(err, null));
                
                res.send(result.createResult(null, { 
                    success: true,
                    organization_id,
                    message: 'Organization registered successfully'
                }));
            });
        });
    });
});

// ORGANIZATION LOGIN
router.post('/login', (req, res) => {
    console.log(req.body);
    
    const { email, password } = req.body;
    
    const sql = `SELECT organization_id, name, email, website, logo_url, password 
                 FROM Organizations 
                 WHERE email = ? AND is_deleted = FALSE`;
    
    pool.query(sql, [email], (err, data) => {
        if (err) return res.send(result.createResult(err, null));
        if (data.length === 0) return res.send(result.createResult('Invalid Email', null));
        
        bcrypt.compare(password, data[0].password, (err, passwordStatus) => {
            if (err || !passwordStatus) {
                return res.send(result.createResult('Invalid Password', null));
            }
            
            const payload = { organization_id: data[0].organization_id };
            const token = jwt.sign(payload, config.SECRET);
            const orgData = {
                token,
                organization_id: data[0].organization_id,
                name: data[0].name,
                email: data[0].email,
                website: data[0].website,
                logo_url: data[0].logo_url
            };
            res.send(result.createResult(null, orgData));
        });
    });
});


// ADD RECRUITER (Organization Admin only) - Creates Users + OrgUsers
router.post('/recruiters', authorizeUser, (req, res) => {
    console.log("rectruter called"); // Your debug log
    
    const organization_id = req.headers.organization_id;
    console.log("Organization ID from token:", organization_id);
    
    // Safety check for req.body
    if (!req.body) {
        return res.send(result.createResult('Request body missing', null));
    }
    
    const { email, mobile, name, position, org_role = 'recruiter' } = req.body;
    console.log("Recruiter data:", { email, mobile, name, position });
    
    // Validation
    if (!organization_id) {
        return res.send(result.createResult('Organization token required', null));
    }
    if (!email || !mobile || !name || !position) {
        return res.send(result.createResult('Email, mobile, name, and position required', null));
    }
    
    const defaultPassword = 'Welcome123!';
    
    // 1. Check if user already exists
    const checkUserSql = `SELECT user_id FROM Users WHERE email = ? OR mobile = ? AND is_deleted = FALSE`;
    pool.query(checkUserSql, [email, mobile], (err, checkUsers) => {
        if (err) return res.send(result.createResult(err, null));
        if (checkUsers.length > 0) {
            return res.send(result.createResult('Email or mobile already registered', null));
        }

        // 2. Hash default password
        bcrypt.hash(defaultPassword, config.SALT_ROUND, (err, hashedPassword) => {
            if (err || !hashedPassword) {
                return res.send(result.createResult('Password hashing failed', null));
            }

            // 3. Create Users record (role='recruiter')
            const user_id = uuidv4();
            const userSql = `INSERT INTO Users (user_id, email, mobile, password, role, created_at) 
                            VALUES (?, ?, ?, ?, 'recruiter', NOW())`;
            
            pool.query(userSql, [user_id, email, mobile, hashedPassword], (err, userData) => {
                if (err) return res.send(result.createResult(err, null));

                // 4. Create OrgUsers record
                const recruiter_id = uuidv4();
                const orgUserSql = `INSERT INTO OrgUsers (
                    recruiter_id, user_id, organization_id, name, position, org_role, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, NOW())`;
                
                pool.query(orgUserSql, [
                    recruiter_id, 
                    user_id, 
                    organization_id, 
                    name, 
                    position, 
                    org_role
                ], (err, orgUserData) => {
                    if (err) return res.send(result.createResult(err, null));
                    
                    res.send(result.createResult(null, {
                        success: true,
                        recruiter_id,
                        user_id,
                        organization_id,
                        name,
                        position,
                        org_role,
                        login_credentials: {
                            email,
                            default_password: defaultPassword
                        },
                        message: 'Recruiter added successfully'
                    }));
                });
            });
        });
    });
});

// RECRUITER LOGIN (only role='recruiter')
router.post('/recruiters/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.send(result.createResult('Email and password required', null));
    }

    const sql = `
        SELECT u.user_id, u.email, u.mobile, u.password, u.role,
               ou.recruiter_id, ou.organization_id, ou.name, ou.position, ou.org_role
        FROM Users u
        JOIN OrgUsers ou ON u.user_id = ou.user_id AND ou.is_deleted = FALSE
        WHERE u.email = ? 
          AND u.role = 'recruiter'
          AND u.is_deleted = FALSE
        LIMIT 1
    `;

    pool.query(sql, [email], (err, rows) => {
        if (err) return res.send(result.createResult(err, null));
        if (rows.length === 0) {
            return res.send(result.createResult('Invalid Email or not a recruiter', null));
        }

        const user = rows[0];
        bcrypt.compare(password, user.password, (err2, status) => {
            if (err2 || !status) {
                return res.send(result.createResult('Invalid Password', null));
            }

            const payload = { user_id: user.user_id, role: 'recruiter' };
            const token = jwt.sign(payload, config.SECRET);

            const data = {
                token,
                user_id: user.user_id,
                recruiter_id: user.recruiter_id,
                organization_id: user.organization_id,
                name: user.name,
                email: user.email,
                mobile: user.mobile,
                position: user.position,
                org_role: user.org_role,
                role: 'recruiter'
            };

            res.send(result.createResult(null, data));
        });
    });
});


module.exports = router;
