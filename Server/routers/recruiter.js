// routers/recruiter.js
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const pool = require('../utils/db');
const result = require('../utils/results');
const authorizeUser = require('../utils/authUser');

const router = express.Router();

// Create a new job (recruiter)
router.post('/jobs', authorizeUser, (req, res) => {
    const user_id = req.headers.user_id;
    const role = req.headers.role;

    if (role !== 'recruiter') {
        return res.send(result.createResult('Access denied: recruiter only', null));
    }

    const { title, location_type, employment_type, experience_min, experience_max,
            skills_required_json, skills_preferred_json, jd_text } = req.body;

    if (!title || !location_type || !employment_type) {
        return res.send(result.createResult('title, location_type, employment_type are required', null));
    }

    // Get recruiter org_id
    const orgSql = `
        SELECT organization_id 
        FROM OrgUsers 
        WHERE user_id = ? AND is_deleted = FALSE
        LIMIT 1
    `;

    pool.query(orgSql, [user_id], (err, rows) => {
        if (err) return res.send(result.createResult(err, null));
        if (rows.length === 0) {
            return res.send(result.createResult('Recruiter organization not found', null));
        }

        const org_id = rows[0].organization_id;
        const job_id = uuidv4();

        const skillsReq = skills_required_json ? JSON.stringify(skills_required_json) : null;
        const skillsPref = skills_preferred_json ? JSON.stringify(skills_preferred_json) : null;

        const insertSql = `
        INSERT INTO Jobs (
            job_id,
            org_id,
            created_by_user_id,
            title,
            location_type,
            employment_type,
            experience_min,
            experience_max,
            skills_required_json,
            skills_preferred_json,
            jd_text,
            status,
            created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'open', NOW())
    `;

        pool.query(
            insertSql,
            [job_id, org_id, user_id,title, location_type, employment_type,
             experience_min || null, experience_max || null,
             skillsReq, skillsPref, jd_text || null],
            (err2) => {
                if (err2) return res.send(result.createResult(err2, null));

                res.send(result.createResult(null, {
                    job_id,
                    org_id,
                    title,
                    status: 'open',
                    message: 'Job created successfully'
                }));
            }
        );
    });
});


// Get all jobs for current recruiter org
router.get('/jobs', authorizeUser, (req, res) => {
    const user_id = req.headers.user_id;
    const role = req.headers.role;

    if (role !== 'recruiter') {
        return res.send(result.createResult('Access denied: recruiter only', null));
    }

    const orgSql = `
        SELECT organization_id 
        FROM OrgUsers 
        WHERE user_id = ? AND is_deleted = FALSE
        LIMIT 1
    `;

    pool.query(orgSql, [user_id], (err, rows) => {
        if (err) return res.send(result.createResult(err, null));
        if (rows.length === 0) {
            return res.send(result.createResult('Recruiter organization not found', null));
        }

        const org_id = rows[0].organization_id;

        const jobsSql = `
            SELECT job_id, title,jd_text, location_type, skills_required_json,skills_preferred_json,employment_type,
                   experience_min, experience_max, status, created_at
            FROM Jobs
            WHERE org_id = ? AND is_deleted = FALSE
            ORDER BY created_at DESC
        `;

        pool.query(jobsSql, [org_id], (err2, jobs) => {
            if (err2) return res.send(result.createResult(err2, null));
            res.send(result.createResult(null, jobs));
        });
    });
});


// Get all applications for a job (owned by this recruiter org)
router.get('/jobs/:job_id/applications', authorizeUser, (req, res) => {
    const user_id = req.headers.user_id;
    const role = req.headers.role;
    const { job_id } = req.params;

    if (role !== 'recruiter') {
        return res.send(result.createResult('Access denied: recruiter only', null));
    }

    // Ensure job belongs to recruiter org
    const orgSql = `
        SELECT j.job_id
        FROM Jobs j
        JOIN OrgUsers ou ON j.org_id = ou.organization_id
        WHERE j.job_id = ? AND ou.user_id = ? AND j.is_deleted = FALSE
        LIMIT 1
    `;
    pool.query(orgSql, [job_id, user_id], (err, rows) => {
        if (err) return res.send(result.createResult(err, null));
        if (rows.length === 0) {
            return res.send(result.createResult('Job not found or not your organization', null));
        }

        const appSql = `
            SELECT 
                a.application_id,
                a.stage,
                a.decision,
                a.created_at,
                u.user_id,
                u.email,
                u.mobile,
                cp.candidate_id,
                cp.name
            FROM Applications a
            JOIN Users u ON a.user_id = u.user_id
            LEFT JOIN CandidateProfiles cp ON u.user_id = cp.user_id
            WHERE a.job_id = ? AND a.is_deleted = FALSE
            ORDER BY a.created_at DESC
        `;

        pool.query(appSql, [job_id], (err2, apps) => {
            if (err2) return res.send(result.createResult(err2, null));
            res.send(result.createResult(null, apps));
        });
    });
});


// Update stage or decision for an application
router.put('/applications/:application_id/stage', authorizeUser, (req, res) => {
    const user_id = req.headers.user_id;
    const role = req.headers.role;
    const { application_id } = req.params;
    const { stage, decision } = req.body;

    if (role !== 'recruiter') {
        return res.send(result.createResult('Access denied: recruiter only', null));
    }

    const allowedStages = ['applied','shortlisted','interview','offer','hired','rejected'];

    if (!stage || !allowedStages.includes(stage)) {
        return res.send(result.createResult('Invalid stage value', null));
    }

    // Ensure application belongs to recruiter org
    const checkSql = `
        SELECT a.application_id
        FROM Applications a
        JOIN Jobs j ON a.job_id = j.job_id
        JOIN OrgUsers ou ON j.org_id = ou.organization_id
        WHERE a.application_id = ? AND ou.user_id = ? AND a.is_deleted = FALSE
        LIMIT 1
    `;

    pool.query(checkSql, [application_id, user_id], (err, rows) => {
        if (err) return res.send(result.createResult(err, null));
        if (rows.length === 0) {
            return res.send(result.createResult('Application not found or not your organization', null));
        }

        const updateSql = `
            UPDATE Applications
            SET stage = ?, 
                decision = ?, 
                updated_at = NOW(), 
                updated_by = ?
            WHERE application_id = ?
        `;

        pool.query(updateSql, [stage, decision || null, user_id, application_id], (err2) => {
            if (err2) return res.send(result.createResult(err2, null));
            res.send(result.createResult(null, {
                application_id,
                stage,
                decision: decision || null,
                message: 'Application updated'
            }));
        });
    });
});

router.get('/me', authorizeUser, (req, res) => {
    const { user_id, role } = req.headers;
    
    if (role !== 'recruiter') {
        return res.send(result.createResult('Access denied: recruiter only', null));
    }
    
    pool.query(`
        SELECT 
          
            u.user_id, u.email, u.mobile, u.profile_photo_url, u.role,
            ou.recruiter_id, ou.name as recruiter_name, ou.position, ou.org_role,
            o.organization_id, o.name as organization_name, o.website, o.logo_url, o.description,
            
          
            (SELECT COUNT(*) FROM Jobs WHERE created_by_user_id = u.user_id AND is_deleted = 0) as total_jobs,
            (SELECT COUNT(*) FROM Jobs WHERE created_by_user_id = u.user_id AND status = 'open' AND is_deleted = 0) as open_jobs,
            (SELECT COUNT(*) FROM Applications a 
             JOIN Jobs j ON a.job_id = j.job_id 
             WHERE j.created_by_user_id = u.user_id AND a.is_deleted = 0 AND j.is_deleted = 0) as total_applications
            
        FROM Users u 
        JOIN OrgUsers ou ON u.user_id = ou.user_id AND ou.is_deleted = 0
        JOIN Organizations o ON ou.organization_id = o.organization_id AND o.is_deleted = 0
        WHERE u.user_id = ? AND u.is_deleted = 0
        LIMIT 1
    `, [user_id], (err, rows) => {
        if (err || !rows.length) {
            return res.send(result.createResult(err || 'Recruiter profile not found', null));
        }
        
        const profile = rows[0];
        
        // ✅ Debug log - REMOVE in production
        console.log(' Stats:', {
            user_id: user_id,
            total_jobs: profile.total_jobs,
            open_jobs: profile.open_jobs, 
            total_applications: profile.total_applications
        });
        
        res.send(result.createResult(null, {
            profile: {
                user_id: profile.user_id,
                recruiter_id: profile.recruiter_id,
                recruiter_name: profile.recruiter_name,
                email: profile.email,
                mobile: profile.mobile ,
                position: profile.position ,
                org_role: profile.org_role ,
                profile_photo_url: profile.profile_photo_url ,
                has_photo: !!profile.profile_photo_url
            },
            organization: {
                organization_id: profile.organization_id,
                name: profile.organization_name,
                website: profile.website,
                logo_url: profile.logo_url,
                description: profile.description
            },
            stats: {
                total_jobs: parseInt(profile.total_jobs),
                open_jobs: parseInt(profile.open_jobs),
                total_applications: parseInt(profile.total_applications)
            }
        }));
    });
});


module.exports = router;
