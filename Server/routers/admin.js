const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const pool = require('../utils/db');
const result = require('../utils/results');
const config = require('../utils/config');

const authorizeUser = require('../utils/authUser');  
const router = express.Router();

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
                            VALUES (?, ?, ?, ?, 'admin', NOW())`;

            pool.query(userSql, [user_id, email, mobile, hashedPassword], (err, userData) => {
                if (err) return res.send(result.createResult(err, null));
                res.send(result.createResult(null, { user_id, message: 'Admin registered successfully' }));
            });
        });
    });
});

/*
 * ADMIN LOGIN
 * POST /api/admin/login
 * Body: { email, password }
 */
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.send(result.createResult('Email and password are required', null));
    }

    const sql = `
        SELECT user_id, email, mobile, password, role
        FROM Users
        WHERE email = ? AND role = 'admin' AND is_deleted = FALSE
        LIMIT 1
    `;

    pool.query(sql, [email], (err, rows) => {
        if (err) return res.send(result.createResult(err, null));
        if (rows.length === 0) {
            return res.send(result.createResult('Invalid email or not an admin', null));
        }

        const user = rows[0];

        bcrypt.compare(password, user.password, (err2, status) => {
            if (err2 || !status) {
                return res.send(result.createResult('Invalid password', null));
            }

            const payload = { user_id: user.user_id, role: 'admin' }; 
            const token = jwt.sign(payload, config.SECRET);

            res.send(
                result.createResult(null, {
                    token,
                    user_id: user.user_id,
                    email: user.email,
                    mobile: user.mobile,
                    role: 'admin'
                })
            );
        });
    });
});



/*
 * ADMIN DASHBOARD COUNTS
 * GET /api/admin/dashboard
 * Headers: { token: <admin_jwt> }
 */
router.get('/dashboard', authorizeUser, (req, res) => {
    const role = req.headers.role;
    if (role !== 'admin') {
        return res.send(result.createResult('Access denied: admin only', null));
    }

    const sql = `
        SELECT 'users' AS type, COUNT(*) AS total FROM Users WHERE is_deleted = FALSE
        UNION ALL
        SELECT 'organizations', COUNT(*) FROM Organizations WHERE is_deleted = FALSE
        UNION ALL
        SELECT 'jobs', COUNT(*) FROM Jobs WHERE is_deleted = FALSE
        UNION ALL
        SELECT 'applications', COUNT(*) FROM Applications WHERE is_deleted = FALSE
    `;

    pool.query(sql, [], (err, rows) => {
        if (err) return res.send(result.createResult(err, null));

        const summary = {};
        rows.forEach((r) => {
            summary[r.type] = r.total;
        });

        res.send(result.createResult(null, summary));
    });
});


/*
 * ADMIN – LIST USERS
 * GET /api/admin/users?user_role=candidate|recruiter|admin (optional)
 */
router.get('/users', authorizeUser, (req, res) => {
    const role = req.headers.role;
    if (role !== 'admin') {
        return res.send(result.createResult('Access denied: admin only', null));
    }

    const { user_role } = req.query;

    let sql = `
        SELECT user_id, email, mobile, role, is_deleted, created_at
        FROM Users
        WHERE 1=1
    `;
    const params = [];

    if (user_role) {
        sql += ' AND role = ?';
        params.push(user_role);
    }

    sql += ' ORDER BY created_at DESC';

    pool.query(sql, params, (err, rows) => {
        if (err) return res.send(result.createResult(err, null));
        res.send(result.createResult(null, rows));
    });
});

/*
 * ADMIN – LIST ORGANIZATIONS
 * GET /api/admin/organizations
 */
router.get('/organizations', authorizeUser, (req, res) => {
    const role = req.headers.role;
    if (role !== 'admin') {
        return res.send(result.createResult('Access denied: admin only', null));
    }

    const sql = `
        SELECT organization_id, name, email, website, logo_url, is_deleted, created_at
        FROM Organizations
        ORDER BY created_at DESC
    `;

    pool.query(sql, [], (err, rows) => {
        if (err) return res.send(result.createResult(err, null));
        res.send(result.createResult(null, rows));
    });
});



/*
 * ADMIN – LIST JOBS
 * GET /api/admin/job?status=open|closed|draft (optional)
 */

router.get('/job', authorizeUser, (req, res) => {
    const role = req.headers.role;
    if (role !== 'admin') {
        return res.send(result.createResult('Access denied: admin only', null));
    }

    const { status } = req.query;

    let sql = `
        SELECT 
            j.job_id,
            j.title,
            j.status,
            j.location_type,
            j.employment_type,
            j.created_at,
            j.is_deleted,
            o.name AS organization_name
        FROM Jobs j
        JOIN Organizations o ON j.org_id = o.organization_id
        WHERE 1=1
    `;
    const params = [];

    if (status) {
        sql += ' AND j.status = ?';
        params.push(status);
    }

    sql += ' ORDER BY j.created_at DESC';

    pool.query(sql, params, (err, rows) => {
        if (err) return res.send(result.createResult(err, null));
        res.send(result.createResult(null, rows));
    });
});


/*
 * ADMIN – LIST APPLICATIONS
 * GET /api/admin/applications?stage=applied|shortlisted|... (optional)
 */
router.get('/application', authorizeUser, (req, res) => {
    const role = req.headers.role;
    if (role !== 'admin') {
        return res.send(result.createResult('Access denied: admin only', null));
    }

    const { stage } = req.query;

    let sql = `
        SELECT 
            a.application_id,
            a.stage,
            a.decision,
            a.created_at,
            a.is_deleted,
            j.job_id,
            j.title,
            o.name AS organization_name,
            u.user_id,
            u.email
        FROM Applications a
        JOIN Jobs j ON a.job_id = j.job_id
        JOIN Organizations o ON j.org_id = o.organization_id
        JOIN Users u ON a.user_id = u.user_id
        WHERE 1=1
    `;
    const params = [];

    if (stage) {
        sql += ' AND a.stage = ?';
        params.push(stage);
    }

    sql += ' ORDER BY a.created_at DESC';

    pool.query(sql, params, (err, rows) => {
        if (err) return res.send(result.createResult(err, null));
        res.send(result.createResult(null, rows));
    });
});



/*
 * ADMIN – VIEW AUDIT LOGS
 * GET /api/admin/audit?target_type=user|company|job|application&target_id=...&limit=50
 */
router.get('/audit', authorizeUser, (req, res) => {
    const role = req.headers.role;
    if (role !== 'admin') {
        return res.send(result.createResult('Access denied: admin only', null));
    }

    const { target_type, target_id, limit = 50 } = req.query;

    let sql = `
        SELECT 
            id,
            actor_user_id,
            action,
            target_type,
            target_id,
            payload_json,
            created_at
        FROM AdminAudit
        WHERE is_deleted = FALSE
    `;
    const params = [];

    if (target_type) {
        sql += ' AND target_type = ?';
        params.push(target_type);
    }
    if (target_id) {
        sql += ' AND target_id = ?';
        params.push(target_id);
    }

    sql += ' ORDER BY created_at DESC LIMIT ?';
    params.push(parseInt(limit));

    pool.query(sql, params, (err, rows) => {
        if (err) return res.send(result.createResult(err, null));
        res.send(result.createResult(null, rows));
    });
});



module.exports = router;  