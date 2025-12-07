const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const pool = require('../utils/db');
const result = require('../utils/results');
const config = require('../utils/config');

const router = express.Router();

// REGISTER ORGANIZATION (Inserts into Organizations table)
router.post('/register', (req, res) => {
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

module.exports = router;
