const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const pool = require('../utils/db');
const result = require('../utils/results');
const config = require('../utils/config');
const authorizeUser = require('../utils/authUser');

const router = express.Router();

/**
 * Helper function to log admin audit events.
 * @param {string} actor_user_id - The ID of the admin performing the action.
 * @param {string} action - The action performed (e.g., 'BLOCK_USER').
 * @param {string} target_type - The type of target (e.g., 'user', 'company').
 * @param {string} target_id - The ID of the target entity.
 * @param {object} payload - Additional details about the action.
 */
function logAdminAudit(actor_user_id, action, target_type, target_id, payload) {
    const auditId = uuidv4();
    const auditSql = `
        INSERT INTO AdminAudit (id, actor_user_id, action, target_type, target_id, payload_json, updated_by)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    pool.query(auditSql, [auditId, actor_user_id, action, target_type, target_id, JSON.stringify(payload), actor_user_id],
        (err) => {
            if (err) console.error('AUDIT LOG FAILED:', err.message);
        }
    );
}

// ==========================================
// AUTHENTICATION ROUTES
// ==========================================

/*
 * POST /api/admin/register
 * Registers a new admin user.
 */
router.post('/register', (req, res) => {
    const { name, email, mobile, password } = req.body;
    console.log("Admin register:", email);

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
 * POST /api/admin/login
 * Logs in an admin user.
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

// ==========================================
// DASHBOARD & PROFILE
// ==========================================

/*
 * GET /api/admin/dashboard
 * Returns dashboard statistics.
 */
router.get('/dashboard', authorizeUser, (req, res) => {
    const role = req.headers.role;
    if (role !== 'admin') {
        return res.send(result.createResult('Access denied: admin only', null));
    }

    const sql = `
        SELECT 'users' AS type, COUNT(*) AS total FROM Users WHERE role != "admin"  AND is_deleted = FALSE
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
 * GET /api/admin/profile
 * Returns the logged-in admin's profile.
 */
router.get('/profile', authorizeUser, (req, res) => {
    console.log('Fetching admin profile');
    const role = req.headers.role;
    if (role !== 'admin') {
        return res.send(result.createResult('Access denied: admin only', null));
    }

    const sql = `
        SELECT user_id, email, mobile, role, profile_photo_url, created_at, updated_at
        FROM Users
        WHERE role = 'admin' AND is_deleted = FALSE AND user_id = ?
    `;

    pool.query(sql, [req.headers.user_id], (err, profile) => {
        if (err) return res.send(result.createResult(err, null));
        res.send(result.createResult(null, profile));
    });
});

// ==========================================
// USER MANAGEMENT
// ==========================================

/*
 * GET /api/admin/users
 * Lists active users (excluding admins).
 */
router.get('/users', authorizeUser, (req, res) => {
    const role = req.headers.role;
    if (role !== 'admin') {
        return res.send(result.createResult('Access denied: admin only', null));
    }
    const { user_role } = req.query;
    let sql = `
        SELECT 
            u.user_id, 
            u.email, 
            u.mobile, 
            u.profile_photo_url,
            u.role, 
            u.is_deleted, 
            u.created_at,
            COALESCE(cp.name, ou.name, '') as name
        FROM Users u
        LEFT JOIN CandidateProfiles cp ON u.user_id = cp.user_id AND cp.is_deleted = 0
        LEFT JOIN OrgUsers ou ON u.user_id = ou.user_id AND ou.is_deleted = 0
        WHERE u.role != 'admin' AND u.is_deleted = 0
    `;
    const params = [];

    if (user_role) {
        sql += ' AND u.role = ?';
        params.push(user_role);
    }

    sql += ' ORDER BY u.created_at DESC';

    pool.query(sql, params, (err, rows) => {
        if (err) return res.send(result.createResult(err, null));
        res.send(result.createResult(null, rows));
    });
});

/*
 * GET /api/admin/blockedUsers
 * Lists blocked users.
 */
router.get('/blockedUsers', authorizeUser, (req, res) => {
    const role = req.headers.role;
    if (role !== 'admin') {
        return res.send(result.createResult('Access denied: admin only', null));
    }

    const { user_role } = req.query;
    let sql = `
        SELECT 
            u.user_id, 
            u.email, 
            u.mobile, 
            u.profile_photo_url,
            u.role, 
            u.is_deleted, 
            u.created_at,
            COALESCE(cp.name, ou.name, '') as name
        FROM Users u
        LEFT JOIN CandidateProfiles cp ON u.user_id = cp.user_id AND cp.is_deleted = 0 
        LEFT JOIN OrgUsers ou ON u.user_id = ou.user_id AND ou.is_deleted = 0 
        WHERE u.role != 'admin' AND u.is_deleted = 1
    `;
    const params = [];

    if (user_role) {
        sql += ' AND u.role = ?';
        params.push(user_role);
    }

    sql += ' ORDER BY u.created_at DESC';

    pool.query(sql, params, (err, rows) => {
        if (err) return res.send(result.createResult(err, null));
        res.send(result.createResult(null, rows));
    });
});

/*
 * PATCH /api/admin/users/:user_id/block
 * Blocks a user.
 */
router.patch('/users/:user_id/block', authorizeUser, (req, res) => {
    const role = req.headers.role;
    const actor_user_id = req.headers.user_id;

    if (role !== 'admin') {
        return res.send(result.createResult('Access denied: admin only', null));
    }

    const { user_id } = req.params;
    if (!user_id) {
        return res.send(result.createResult('User ID required', null));
    }

    const checkSql = `SELECT user_id, role FROM Users WHERE user_id = ? AND role != 'admin' AND is_deleted = FALSE`;
    pool.query(checkSql, [user_id], (err, checkRows) => {
        if (err) return res.send(result.createResult(err, null));
        if (checkRows.length === 0) {
            return res.send(result.createResult('User not found or is admin', null));
        }

        const updateSql = `UPDATE Users SET is_deleted = TRUE, updated_at = NOW(), updated_by = ? WHERE user_id = ?`;
        pool.query(updateSql, [actor_user_id, user_id], (err, updateResult) => {
            if (err) return res.send(result.createResult(err, null));

            logAdminAudit(actor_user_id, 'BLOCK_USER', 'user', user_id, { reason: "Admin blocked user" });

            res.send(result.createResult(null, {
                message: 'User blocked successfully',
                user_id,
                timestamp: new Date().toISOString()
            }));
        });
    });
});

/*
 * PATCH /api/admin/users/:user_id/unblock
 * Unblocks a user.
 */
router.patch('/users/:user_id/unblock', authorizeUser, (req, res) => {
    const role = req.headers.role;
    const actor_user_id = req.headers.user_id;

    if (role !== 'admin') {
        return res.send(result.createResult('Access denied: admin only', null));
    }

    const { user_id } = req.params;

    const checkSql = `SELECT user_id FROM Users WHERE user_id = ? AND is_deleted = TRUE`;
    pool.query(checkSql, [user_id], (err, checkRows) => {
        if (err) return res.send(result.createResult(err, null));
        if (checkRows.length === 0) {
            return res.send(result.createResult('Blocked user not found', null));
        }

        const updateSql = `UPDATE Users SET is_deleted = FALSE, updated_at = NOW(), updated_by = ? WHERE user_id = ?`;
        pool.query(updateSql, [actor_user_id, user_id], (err) => {
            if (err) return res.send(result.createResult(err, null));

            logAdminAudit(actor_user_id, 'UNBLOCK_USER', 'user', user_id, { reason: "Admin unblocked user" });
            res.send(result.createResult(null, { message: 'User unblocked successfully', user_id }));
        });
    });
});

// ==========================================
// ORGANIZATION MANAGEMENT
// ==========================================

/*
 * GET /api/admin/organizations
 * Lists active organizations.
 */
// Helper function for Audit Logging (Ensure this exists in your file)
function logAdminAudit(actor_user_id, action, target_type, target_id, payload) {
    const auditId = uuidv4();
    const auditSql = `
        INSERT INTO AdminAudit (id, actor_user_id, action, target_type, target_id, payload_json, updated_by)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    pool.query(auditSql, [auditId, actor_user_id, action, target_type, target_id, JSON.stringify(payload), actor_user_id], 
        (err) => { if (err) console.error('AUDIT LOG FAILED:', err.message); }
    );
}

/*
 * 1. LIST ACTIVE ORGANIZATIONS (Unblocked)
 * GET /api/admin/organizations
 * Logic: Fetch where is_deleted = 0
 */
router.get('/organizations', authorizeUser, (req, res) => {
    const role = req.headers.role;
    
    // 1. Admin Authorization
    if (role !== 'admin') {
        return res.send(result.createResult('Access denied: admin only', null));
    }

    // 2. Query for Active Organizations (is_deleted = 0)
    const sql = `
        SELECT 
            organization_id, 
            name, 
            email, 
            website, 
            description, 
            logo_url, 
            created_at,
            updated_at
        FROM Organizations
        WHERE is_deleted = 0
        ORDER BY created_at DESC
    `;

    pool.query(sql, [], (err, rows) => {
        if (err) return res.send(result.createResult(err, null));
        res.send(result.createResult(null, rows));
    });
});

/*
 * 2. LIST BLOCKED ORGANIZATIONS
 * GET /api/admin/organizations/blocked
 * Logic: Fetch where is_deleted = 1
 */
router.get('/organizations/blocked', authorizeUser, (req, res) => {
    const role = req.headers.role;
    
    // 1. Admin Authorization
    if (role !== 'admin') {
        return res.send(result.createResult('Access denied: admin only', null));
    }

    // 2. Query for Blocked Organizations (is_deleted = 1)
    const sql = `
        SELECT 
            organization_id, 
            name, 
            email, 
            website, 
            logo_url, 
            description, 
            created_at,
            updated_at
        FROM Organizations
        WHERE is_deleted = 1
        ORDER BY updated_at DESC
    `;

    pool.query(sql, (err, rows) => {
        if (err) {
            console.error('Blocked organizations query error:', err);
            return res.send(result.createResult(err, null));
        }
        
        res.send(result.createResult(null, {
            blocked_organizations: rows,
            total_count: rows.length
        }));
    });
});

/*
 * 3. BLOCK AN ORGANIZATION
 * PATCH /api/admin/organizations/:organization_id/block
 * Logic: Set is_deleted = 1
 */
router.patch('/organizations/:organization_id/block', authorizeUser, (req, res) => {
    const role = req.headers.role;
    const actor_user_id = req.headers.user_id;
    
    // 1. Admin Authorization
    if (role !== 'admin') {
        return res.send(result.createResult('Access denied: admin only', null));
    }

    const { organization_id } = req.params;

    // 2. Check if organization exists and is currently ACTIVE (is_deleted = 0)
    const checkSql = `SELECT organization_id, name FROM Organizations WHERE organization_id = ? AND is_deleted = 0`;
    
    pool.query(checkSql, [organization_id], (err, checkRows) => {
        if (err) return res.send(result.createResult(err, null));
        
        if (checkRows.length === 0) {
            return res.send(result.createResult('Organization not found or already blocked', null));
        }

        // 3. Update Status to Blocked (is_deleted = 1)
        const updateSql = `UPDATE Organizations SET is_deleted = 1, updated_at = NOW() WHERE organization_id = ?`;
        
        pool.query(updateSql, [organization_id], (err) => {
            if (err) return res.send(result.createResult(err, null));

            // 4. Audit Log
            const reason = req.body?.reason || 'Admin blocked organization';
            logAdminAudit(actor_user_id, 'BLOCK_ORG', 'company', organization_id, {
                organization_name: checkRows[0].name,
                reason: reason
            });

            res.send(result.createResult(null, { 
                message: 'Organization blocked successfully', 
                organization_id,
                organization_name: checkRows[0].name
            }));
        });
    });
});

/*
 * 4. UNBLOCK AN ORGANIZATION
 * PATCH /api/admin/organizations/:organization_id/unblock
 * Logic: Set is_deleted = 0
 */
router.patch('/organizations/:organization_id/unblock', authorizeUser, (req, res) => {
    const role = req.headers.role;
    const actor_user_id = req.headers.user_id;
    
    // 1. Admin Authorization
    if (role !== 'admin') {
        return res.send(result.createResult('Access denied: admin only', null));
    }

    const { organization_id } = req.params;

    // 2. Check if organization exists and is currently BLOCKED (is_deleted = 1)
    const checkSql = `SELECT organization_id, name FROM Organizations WHERE organization_id = ? AND is_deleted = 1`;
    
    pool.query(checkSql, [organization_id], (err, checkRows) => {
        if (err) return res.send(result.createResult(err, null));
        
        if (checkRows.length === 0) {
            return res.send(result.createResult('Blocked organization not found or already active', null));
        }

        // 3. Update Status to Active (is_deleted = 0)
        const updateSql = `UPDATE Organizations SET is_deleted = 0, updated_at = NOW() WHERE organization_id = ?`;
        
        pool.query(updateSql, [organization_id], (err) => {
            if (err) return res.send(result.createResult(err, null));

            // 4. Audit Log
            const reason = req.body?.reason || 'Admin unblocked organization';
            logAdminAudit(actor_user_id, 'UNBLOCK_ORG', 'company', organization_id, {
                organization_name: checkRows[0].name,
                reason: reason
            });

            res.send(result.createResult(null, { 
                message: 'Organization unblocked successfully', 
                organization_id,
                organization_name: checkRows[0].name
            }));
        });
    });
});

// ==========================================
// JOB MANAGEMENT
// ==========================================

/*
 * GET /api/admin/job
 * Lists jobs.
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
 * PATCH /api/admin/jobs/:job_id/close
 * Closes a job.
 */
router.patch('/jobs/:job_id/close', authorizeUser, (req, res) => {
    const role = req.headers.role;
    const actor_user_id = req.headers.user_id;

    if (role !== 'admin') {
        return res.send(result.createResult('Access denied: admin only', null));
    }

    const { job_id } = req.params;

    const checkSql = `SELECT job_id FROM Jobs WHERE job_id = ? AND status = 'open' AND is_deleted = FALSE`;
    pool.query(checkSql, [job_id], (err, checkRows) => {
        if (err) return res.send(result.createResult(err, null));
        if (checkRows.length === 0) {
            return res.send(result.createResult('Open job not found', null));
        }

        const updateSql = `UPDATE Jobs SET status = 'closed', updated_at = NOW() WHERE job_id = ?`;
        pool.query(updateSql, [job_id], (err) => {
            if (err) return res.send(result.createResult(err, null));

            logAdminAudit(actor_user_id, 'CLOSE_JOB', 'job', job_id, { reason: "Admin closed job" });
            res.send(result.createResult(null, { message: 'Job closed successfully', job_id }));
        });
    });
});

// ==========================================
// APPLICATION MANAGEMENT
// ==========================================

/*
 * GET /api/admin/application
 * Lists applications.
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

// ==========================================
// AUDIT LOGS
// ==========================================

/*
 * GET /api/admin/audit
 * View audit logs.
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
