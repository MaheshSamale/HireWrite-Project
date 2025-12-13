const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const pool = require('../utils/db');
const result = require('../utils/results');
const config = require('../utils/config');

const authorizeUser = require('../utils/authUser');  
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

    if (!email || !password) {
        return res.send(result.createResult('Email and password required', null));
    }

    const sql = `
        SELECT u.user_id, u.email, u.mobile, u.password, u.role, cp.candidate_id, cp.name
        FROM Users u
        LEFT JOIN CandidateProfiles cp ON u.user_id = cp.user_id AND cp.is_deleted = FALSE
        WHERE u.email = ?
          AND u.role = 'candidate'
          AND u.is_deleted = FALSE
        LIMIT 1
    `;

    pool.query(sql, [email], (err, rows) => {
        if (err) return res.send(result.createResult(err, null));
        if (rows.length === 0) {
            return res.send(result.createResult('Invalid Email or not a candidate', null));
        }

        const user = rows[0];
        bcrypt.compare(password, user.password, (err2, status) => {
            if (err2 || !status) {
                return res.send(result.createResult('Invalid Password', null));
            }

            const payload = { user_id: user.user_id, role: 'candidate' };
            const token = jwt.sign(payload, config.SECRET);

            const data = {
                token,
                user_id: user.user_id,
                candidate_id: user.candidate_id,
                name: user.name,
                email: user.email,
                mobile: user.mobile,
                role: 'candidate'
            };

            res.send(result.createResult(null, data));
        });
    });
});


// CREATE/UPDATE Profile (uses req.headers.user_id)
router.post('/profile', authorizeUser, (req, res) => {
    const user_id = req.headers.user_id;
    const { name, skills_json, education_json, experience_json, links_json } = req.body;
    
    console.log("Profile data received:", { name, skills_json, education_json });
    
    if (!name) {
        return res.send(result.createResult('Name is required', null));
    }

    const skills = skills_json ? JSON.stringify(skills_json) : null;
    const edu = education_json ? JSON.stringify(education_json) : null;
    const exp = experience_json ? JSON.stringify(experience_json) : null;
    const links = links_json ? JSON.stringify(links_json) : null;

    console.log("JSON strings prepared:", { skills, edu, exp, links });

    const checkSql = `SELECT candidate_id FROM CandidateProfiles 
                      WHERE user_id = ? AND is_deleted = FALSE`;
    pool.query(checkSql, [user_id], (err, rows) => {
        if (err) return res.send(result.createResult(err, null));

        if (rows.length === 0) {
            // CREATE new profile
            const candidate_id = uuidv4();
            const insertSql = `INSERT INTO CandidateProfiles 
                (candidate_id, user_id, name, skills_json, education_json, experience_json, links_json, created_at) 
                VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`;
            
            pool.query(insertSql, [candidate_id, user_id, name, skills, edu, exp, links], (err2, data) => {
                if (err2) return res.send(result.createResult(err2, null));
                res.send(result.createResult(null, { candidate_id, user_id, name, message: 'Profile created' }));
            });
        } else {
            // UPDATE existing profile - ✅ FIXED SQL
            const candidate_id = rows[0].candidate_id;
            const updateSql = `UPDATE CandidateProfiles SET 
                name = ?, 
                skills_json = ?, 
                education_json = ?, 
                experience_json = ?, 
                links_json = ?, 
                updated_at = NOW() 
                WHERE candidate_id = ?`;
            
            // ✅ Proper parameterized query (no raw SQL injection)
            pool.query(updateSql, [name, skills, edu, exp, links, candidate_id], (err2, data) => {
                if (err2) return res.send(result.createResult(err2, null));
                res.send(result.createResult(null, { candidate_id, user_id, name, message: 'Profile updated' }));
            });
        }
    });
});




// GET Profile/Dashboard Data
router.get('/me', authorizeUser, (req, res) => {
    const user_id = req.headers.user_id;  // From your middleware
    
    const sql = `
        SELECT u.user_id, u.email, u.mobile, u.role, u.profile_photo_url,
               cp.candidate_id, cp.name, cp.skills_json, cp.education_json, 
               cp.experience_json, cp.links_json
        FROM Users u
        LEFT JOIN CandidateProfiles cp ON u.user_id = cp.user_id AND cp.is_deleted = FALSE
        WHERE u.user_id = ? AND u.is_deleted = FALSE
    `;
    
    pool.query(sql, [user_id], (err, rows) => {
        if (err) return res.send(result.createResult(err, null));
        if (rows.length === 0) return res.send(result.createResult('Profile not found', null));
        
        res.send(result.createResult(null, rows[0]));
    });
});

// GET all open jobs (paginated)
router.get('/jobs', authorizeUser, (req, res) => {
    const user_id = req.headers.user_id;
    const { page = 1, limit = 10, location_type, employment_type, skills } = req.query;
    
    const offset = (page - 1) * limit;
    
    let sql = `
        SELECT 
            j.job_id, j.title, j.location_type, j.employment_type,
            j.experience_min, j.experience_max, j.jd_text, j.status,
            o.name as organization_name, o.logo_url,
            j.created_at
        FROM Jobs j
        JOIN Organizations o ON j.org_id = o.organization_id
        WHERE j.status = 'open' AND j.is_deleted = FALSE AND o.is_deleted = FALSE
    `;
    
    const params = [];
    
    // Filters
    if (location_type) {
        sql += ` AND j.location_type = ?`;
        params.push(location_type);
    }
    if (employment_type) {
        sql += ` AND j.employment_type = ?`;
        params.push(employment_type);
    }
    if (skills) {
        sql += ` AND (j.skills_required_json LIKE ? OR j.skills_preferred_json LIKE ?)`;
        params.push(`%${skills}%`, `%${skills}%`);
    }
    
    sql += ` ORDER BY j.created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));
    
    pool.query(sql, params, (err, jobs) => {
        if (err) return res.send(result.createResult(err, null));
        
        // Count total for pagination
        const countSql = sql.replace('SELECT j.job_id, j.title...', 'SELECT COUNT(*) as total')
                           .replace('ORDER BY j.created_at DESC LIMIT ? OFFSET ?', '');
        
        pool.query(countSql, params.slice(0, -2), (err2, countResult) => {
            res.send(result.createResult(null, {
                jobs,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: countResult[0].total,
                    total_pages: Math.ceil(countResult[0].total / limit)
                }
            }));
        });
    });
});


// GET single job details
router.get('/jobs/:job_id', authorizeUser, (req, res) => {
    const user_id = req.headers.user_id;
    const { job_id } = req.params;
    
    const sql = `
        SELECT 
            j.job_id, j.title, j.location_type, j.employment_type,
            j.experience_min, j.experience_max, 
            j.skills_required_json, j.skills_preferred_json, j.jd_text,
            o.name as organization_name, o.website, o.logo_url
        FROM Jobs j
        JOIN Organizations o ON j.org_id = o.organization_id
        WHERE j.job_id = ? AND j.status = 'open' AND j.is_deleted = FALSE
    `;
    
    pool.query(sql, [job_id], (err, job) => {
        if (err) return res.send(result.createResult(err, null));
        if (job.length === 0) return res.send(result.createResult('Job not found', null));
        
        res.send(result.createResult(null, job[0]));
    });
});


// GET recommended jobs based on candidate skills
router.get('/jobs/recommended', authorizeUser, (req, res) => {
    const user_id = req.headers.user_id;
    
    // Get candidate skills first
    const profileSql = `
        SELECT skills_json FROM CandidateProfiles 
        WHERE user_id = ? AND is_deleted = FALSE
    `;
    
    pool.query(profileSql, [user_id], (err, profiles) => {
        if (err) return res.send(result.createResult(err, null));
        if (profiles.length === 0) return res.send(result.createResult('Profile not found', null));
        
        let candidateSkills = [];
        try {
            candidateSkills = JSON.parse(profiles[0].skills_json || '[]');
        } catch (e) {
            candidateSkills = [];
        }
        
        // Find jobs matching candidate skills
        const sql = `
            SELECT 
                j.job_id, j.title, j.location_type, j.employment_type,
                j.experience_min, j.experience_max, j.jd_text,
                o.name as organization_name,
                (LENGTH(j.skills_required_json) + LENGTH(j.skills_preferred_json)) as match_score
            FROM Jobs j
            JOIN Organizations o ON j.org_id = o.organization_id
            WHERE j.status = 'open' AND j.is_deleted = FALSE AND o.is_deleted = FALSE
            AND (j.skills_required_json LIKE ? OR j.skills_preferred_json LIKE ?)
            ORDER BY match_score DESC, j.created_at DESC
            LIMIT 10
        `;
        
        const skillSearch = `%${candidateSkills.join('%') || ''}%`;
        pool.query(sql, [skillSearch, skillSearch], (err2, jobs) => {
            if (err2) return res.send(result.createResult(err2, null));
            res.send(result.createResult(null, {
                jobs,
                message: `Found ${jobs.length} jobs matching your skills: ${candidateSkills.join(', ')}`
            }));
        });
    });
});


module.exports = router;  

