const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const pool = require('../utils/db');
const result = require('../utils/results');
const config = require('../utils/config');

const router = express.Router();

// REGISTER (Users + CandidateProfiles)
router.post('/register', (req, res) => {
    const { name, email, mobile, password } = req.body;
    console.log("Candidate register:", email);
    
    if (!name || !email || !mobile || !password) {
        return res.send(result.createResult('Name, email, mobile, and password required', null));
    }

    const checkSql = `SELECT user_id FROM Users WHERE email = ? OR mobile = ? AND is_deleted = FALSE`;
    pool.query(checkSql, [email, mobile], (err, checkData) => {
        if (err) return res.send(result.createResult(err, null));
        if (checkData.length > 0) return res.send(result.createResult("Email or mobile already registered", null));
        
        bcrypt.hash(password, config.SALT_ROUND, (err, hashedPassword) => {
            if (err || !hashedPassword) {
                return res.send(result.createResult('Password hashing failed', null));
            }
            
            const user_id = uuidv4();
            const userSql = `INSERT INTO Users (user_id, email, mobile, password, role, created_at) 
                            VALUES (?, ?, ?, ?, 'candidate', NOW())`;
            
            pool.query(userSql, [user_id, email, mobile, hashedPassword], (err, userData) => {
                if (err) return res.send(result.createResult(err, null));
                
                const candidate_id = uuidv4();
                const profileSql = `INSERT INTO CandidateProfiles (candidate_id, user_id, name, created_at) 
                                   VALUES (?, ?, ?, NOW())`;
                
                pool.query(profileSql, [candidate_id, user_id, name], (err, profileData) => {
                    if (err) return res.send(result.createResult(err, null));
                    
                    const responseData = { user_id, candidate_id, message: 'Candidate registered successfully' };
                    res.send(result.createResult(null, responseData));
                });
            });
        });
    });
});

// LOGIN
router.post('/login', (req, res) => {
    const { email, password } = req.body;
    const sql = `SELECT u.user_id, u.email, u.mobile, u.password, u.role, cp.name 
                 FROM Users u LEFT JOIN CandidateProfiles cp ON u.user_id = cp.user_id 
                 WHERE u.email = ? AND u.is_deleted = FALSE`;
    
    pool.query(sql, [email], (err, data) => {
        if (err) return res.send(result.createResult(err, null));
        if (data.length == 0) return res.send(result.createResult("Invalid Email", null));
        
        bcrypt.compare(password, data[0].password, (err, passwordStatus) => {
            if (err || !passwordStatus) {
                return res.send(result.createResult('Invalid Password', null));
            }
            
            const payload = { user_id: data[0].user_id };
            const token = jwt.sign(payload, config.SECRET);
            const userData = {
                token, user_id: data[0].user_id, name: data[0].name || null,
                email: data[0].email, mobile: data[0].mobile, role: data[0].role
            };
            res.send(result.createResult(null, userData));
        });
    });
});



module.exports = router;  
