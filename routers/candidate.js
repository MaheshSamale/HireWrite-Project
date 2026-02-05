const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const pool = require('../utils/db');
const result = require('../utils/results');
const config = require('../utils/config');

const multer = require('multer');
const fs = require('fs');
const path = require('path');

const authorizeUser = require('../utils/authUser');  
const router = express.Router();



// Create resumes upload folder if not exists
const resumesDir = path.join(__dirname, '..', 'uploads', 'resumes');
if (!fs.existsSync(resumesDir)) {
    fs.mkdirSync(resumesDir, { recursive: true });
}

const resumeStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, resumesDir);
    },
    filename: function (req, file, cb) {
        const userId = req.headers.user_id || 'unknown';
        const ext = path.extname(file.originalname) || '.pdf';
        cb(null, `${userId}-${Date.now()}${ext}`);
    }
});

const resumeUpload = multer({
    storage: resumeStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    fileFilter: (req, file, cb) => {
        const allowed = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        if (!allowed.includes(file.mimetype)) {
            return cb(new Error('Only PDF/DOC/DOCX resumes are allowed'));
        }
        cb(null, true);
    }
});

// POST /api/candidates/resumes (upload resume)
router.post('/resumes', authorizeUser, resumeUpload.single('resume'), (req, res) => {
    const user_id = req.headers.user_id;

    if (!user_id) {
        return res.send(result.createResult('User ID missing from token', null));
    }
    if (!req.file) {
        return res.send(result.createResult('Resume file is required', null));
    }

    const resume_id = uuidv4();
    const storage_path = `/uploads/resumes/${req.file.filename}`;
    const source = 'uploaded';
    const version_label = req.body.version_label || 'Default Resume';

    // parsed_json can be null for now (to be filled by parser/AI later)
    const insertSql = `
        INSERT INTO Resumes (
            resume_id, user_id, storage_path, parsed_json, template_id, source, version_label, active, created_at
        ) VALUES (?, ?, ?, ?, NULL, ?, ?, FALSE, NOW())
    `;

    pool.query(
        insertSql,
        [resume_id, user_id, storage_path, null, source, version_label],
        (err, data) => {
            if (err) return res.send(result.createResult(err, null));

            res.send(result.createResult(null, {
                resume_id,
                user_id,
                storage_path,
                source,
                version_label,
                message: 'Resume uploaded successfully'
            }));
        }
    );
});



// GET /api/candidates/resumes
router.get('/resumes', authorizeUser, (req, res) => {
    const user_id = req.headers.user_id;

    const sql = `
        SELECT resume_id, user_id, storage_path, template_id, source, version_label, active, created_at
        FROM Resumes
        WHERE user_id = ? AND is_deleted = FALSE
        ORDER BY created_at DESC
    `;

    pool.query(sql, [user_id], (err, rows) => {
        if (err) return res.send(result.createResult(err, null));
        res.send(result.createResult(null, rows));
    });
});


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
    console.log(req.body)
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
            // UPDATE existing profile - 
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
router.get('/recommended/jobs', (req, res) => {
    console.log("Recommended Jobs: route hit");

    const user_id = req.headers.user_id;
    console.log("Recommended Jobs: user_id =", user_id);

    if (!user_id) {
        console.log("Recommended Jobs: user_id missing");
        return res.send(result.createResult('User ID missing from token', null));
    }

    // 1) Get candidate skills
    const profileSql = `
        SELECT skills_json FROM CandidateProfiles 
        WHERE user_id = ? AND is_deleted = FALSE
    `;
    console.log("Recommended Jobs: profileSql =", profileSql);

    pool.query(profileSql, [user_id], (err, profiles) => {
        console.log("Recommended Jobs: profile query result -> err =", err, "profiles =", profiles);

        if (err) {
            return res.send(result.createResult(err, null));
        }
        if (!profiles || profiles.length === 0) {
            console.log("Recommended Jobs: no profile found");
            return res.send(result.createResult('Profile not found', null));
        }

        let candidateSkills = [];
        const rawSkills = profiles[0].skills_json;
        console.log("Recommended Jobs: raw skills_json =", rawSkills, "type =", typeof rawSkills);

        try {
            if (typeof rawSkills === 'string') {
                candidateSkills = JSON.parse(rawSkills || '[]');
            } else if (Array.isArray(rawSkills)) {
                candidateSkills = rawSkills;
            } else {
                candidateSkills = [];
            }
        } catch (e) {
            console.log("Recommended Jobs: JSON parse error =", e.message);
            candidateSkills = [];
        }

        console.log("Recommended Jobs: candidateSkills =", candidateSkills);

        if (!candidateSkills || candidateSkills.length === 0) {
            console.log("Recommended Jobs: empty skills, returning empty jobs list");
            return res.send(result.createResult(null, {
                jobs: [],
                message: 'No skills found in profile, cannot recommend jobs'
            }));
        }

        // 2) Build dynamic LIKE conditions for each skill
        const likeConditions = [];
        const likeParams = [];

        candidateSkills.forEach(skill => {
            likeConditions.push('j.skills_required_json LIKE ?');
            likeConditions.push('j.skills_preferred_json LIKE ?');
            const pattern = `%${skill}%`;
            likeParams.push(pattern, pattern);
        });

        const whereLikes = likeConditions.join(' OR ');

        const sql = `
            SELECT 
                j.job_id, j.title, j.location_type, j.employment_type,
                j.experience_min, j.experience_max, j.jd_text,
                o.name as organization_name,
                (LENGTH(j.skills_required_json) + LENGTH(j.skills_preferred_json)) as match_score
            FROM Jobs j
            JOIN Organizations o ON j.org_id = o.organization_id
            WHERE j.status = 'open' AND j.is_deleted = FALSE AND o.is_deleted = FALSE
              AND (${whereLikes})
            ORDER BY match_score DESC, j.created_at DESC
            LIMIT 10
        `;

        console.log("Recommended Jobs: jobs SQL =", sql);
        console.log("Recommended Jobs: likeParams =", likeParams);

        // 3) Query matching jobs
        pool.query(sql, likeParams, (err2, jobs) => {
            console.log("Recommended Jobs: jobs query result -> err2 =", err2, "jobs =", jobs);

            if (err2) return res.send(result.createResult(err2, null));

            return res.send(result.createResult(null, {
                jobs,
                message: `Found ${jobs.length} jobs matching your skills: ${candidateSkills.join(', ')}`
            }));
        });
    });
});



// Apply For Job
router.post('/applications', authorizeUser, (req, res) => {
    const user_id = req.headers.user_id;
    const { job_id, resume_id } = req.body;

    console.log('Apply API:', { user_id, job_id, resume_id });

    if (!job_id || !resume_id) {
        return res.send(result.createResult('job_id and resume_id are required', null));
    }

    // 1) Check job exists and is open
    const jobSql = `
        SELECT job_id FROM Jobs 
        WHERE job_id = ? AND status = 'open' AND is_deleted = FALSE
    `;
    pool.query(jobSql, [job_id], (errJob, jobRows) => {
        if (errJob) return res.send(result.createResult(errJob, null));
        if (jobRows.length === 0) {
            return res.send(result.createResult('Job not found or not open', null));
        }

        // 2) Check resume belongs to this user and not deleted
        const resumeSql = `
            SELECT resume_id FROM Resumes 
            WHERE resume_id = ? AND user_id = ? AND is_deleted = FALSE
        `;
        pool.query(resumeSql, [resume_id, user_id], (errRes, resRows) => {
            if (errRes) return res.send(result.createResult(errRes, null));
            if (resRows.length === 0) {
                return res.send(result.createResult('Resume not found for this user', null));
            }

            // 3) Prevent duplicate application to same job
            const checkSql = `
                SELECT application_id 
                FROM Applications 
                WHERE job_id = ? AND user_id = ? AND is_deleted = FALSE
            `;
            pool.query(checkSql, [job_id, user_id], (errCheck, checkRows) => {
                if (errCheck) return res.send(result.createResult(errCheck, null));
                if (checkRows.length > 0) {
                    return res.send(result.createResult('Already applied to this job', null));
                }

                // 4) Insert application
                const application_id = uuidv4();
                const insertSql = `
                    INSERT INTO Applications (
                        application_id, job_id, user_id, resume_id, stage, created_at
                    ) VALUES (?, ?, ?, ?, 'applied', NOW())
                `;

                pool.query(insertSql, [application_id, job_id, user_id, resume_id], (errIns) => {
                    if (errIns) return res.send(result.createResult(errIns, null));

                    res.send(result.createResult(null, {
                        application_id,
                        job_id,
                        user_id,
                        resume_id,
                        stage: 'applied',
                        message: 'Application submitted successfully'
                    }));
                });
            });
        });
    });
});


// GET /api/candidates/applications
router.get('/applications', authorizeUser, (req, res) => {
    const user_id = req.headers.user_id;

    console.log('Get My Applications: user_id =', user_id);

    const sql = `
        SELECT 
            a.application_id,
            a.job_id,
            a.resume_id,
            a.stage,
            a.decision,
            a.created_at,
            j.title,
            j.location_type,
            j.employment_type,
            j.status AS job_status,
            o.name AS organization_name,
            o.logo_url
        FROM Applications a
        JOIN Jobs j ON a.job_id = j.job_id
        JOIN Organizations o ON j.org_id = o.organization_id
        WHERE a.user_id = ?
          AND a.is_deleted = FALSE
        ORDER BY a.created_at DESC
    `;

    pool.query(sql, [user_id], (err, rows) => {
        if (err) return res.send(result.createResult(err, null));
        res.send(result.createResult(null, rows));
    });
});



module.exports = router;  

