const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
// Add this import at top
const pool = require('../utils/db');
const result = require('../utils/results');
const config = require('../utils/config');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { GoogleGenAI } = require("@google/genai");

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




// 🔥 PURE GEMINI + AUTO-SAVE to JobFitmentScores
router.post('/jobs/:jobId/gemini-score', authorizeUser, async (req, res) => {
    console.log('🌟 === PURE GEMINI + SAVE TO DB START ===');
    
    try {
      const userId = req.headers.user_id;
      const { jobId } = req.params;
      
      console.log('👤 User:', userId, 'Job:', jobId);
      
      // 1. Get candidate skills
      const [candidateRows] = await pool.promise().query(`
        SELECT skills_json, experience_json
        FROM CandidateProfiles 
        WHERE user_id = ? AND is_deleted = 0
      `, [userId]);
      
      if (!candidateRows[0]) {
        return res.status(404).json({ error: 'Candidate not found' });
      }
      
      // 2. Get job details
      const [jobs] = await pool.promise().query(`
        SELECT title, jd_text, skills_required_json
        FROM Jobs WHERE job_id = ? AND status = 'open'
      `, [jobId]);
      
      if (!jobs[0]) {
        return res.status(404).json({ error: 'Job not found' });
      }
      
      const job = jobs[0];
      console.log('💼 Job:', job.title);
      console.log('🎯 Skills:', candidateRows[0].skills_json);
      
      // 3. PURE GEMINI CALL
      console.log('🤖 Calling Gemini 2.5 Flash...');
     const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      
      const prompt = `Score candidate fit (0-100) for this job:
  
  JOB: ${job.title}
  JD: ${job.jd_text?.substring(0, 1500)}
  REQUIRED: ${JSON.stringify(job.skills_required_json || {})}
  
  CANDIDATE SKILLS: ${JSON.stringify(candidateRows[0].skills_json || [])}
  
  Return ONLY this format:
  Score: [NUMBER]
  Explanation: [TEXT]`;
  
      console.log('📤 Prompt sent');
      const result = await model.generateContent(prompt);
      const text = await result.response.text();
      
      console.log('📥 Gemini:', text);
      
      // 4. Parse response
      const scoreMatch = text.match(/Score:\s*(\d+)/i);
      const explanationMatch = text.match(/Explanation:\s*(.+)/is);
      
      const score = Math.min(100, Math.max(0, parseInt(scoreMatch?.[1]) || 50));
      const explanation = explanationMatch?.[1]?.trim() || 'AI analysis complete';
      
      console.log('✅ Score:', score, 'Explanation:', explanation);
      
      // 🔥 5. SAVE TO JobFitmentScores IMMEDIATELY
// 🔥 5. UPSERT logic
console.log('💾 UPSERTING TO JobFitmentScores...');

// Define the ID here so it's available for the query and the final response
const scoreId = uuidv4(); 

const upsertSql = `
  INSERT INTO JobFitmentScores (
    id, user_id, job_id, keyword_score, semantic_score, fit_flag, explanation, created_at
  )
  VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
  ON DUPLICATE KEY UPDATE 
    keyword_score = VALUES(keyword_score),
    semantic_score = VALUES(semantic_score),
    fit_flag = VALUES(fit_flag),
    explanation = VALUES(explanation),
    updated_at = NOW()
`;

await pool.promise().query(upsertSql, [
    uuidv4(), 
    userId, 
    jobId,
    score,
    score,
    score > 60 ? 1 : 0,
    explanation.substring(0, 500)
  ]);

console.log('✅ DB SYNCED (Inserted or Updated)!');

// 6. Response
const response = {
  fitmentScore: score / 100,
  keywordMatch: score,
  explanation,
  aiPowered: true,
  rawGemini: text,
  savedToDb: true,
  scoreId // Now this will work perfectly!
};    
      
      console.log('📤 Response:', response);
      console.log('🌟 === GEMINI + DB SUCCESS ===');
      
      res.json(response);
      
    } catch (error) {
      console.error('💥 GEMINI ERROR:', error.message);
      res.status(500).json({ error: 'Gemini failed', details: error.message });
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
    
    // 1. Define the base SELECT and JOINs
    let selectClause = `
        SELECT 
            j.job_id, j.title, j.location_type, j.employment_type,
            j.experience_min, j.experience_max, j.jd_text, j.status,
            o.name as organization_name, o.logo_url,
            j.created_at,
            jfs.semantic_score, jfs.explanation as ai_explanation
    `;

    let fromClause = `
        FROM Jobs j
        JOIN Organizations o ON j.org_id = o.organization_id
        LEFT JOIN JobFitmentScores jfs ON j.job_id = jfs.job_id AND jfs.user_id = ?
        WHERE j.status = 'open' AND j.is_deleted = FALSE AND o.is_deleted = FALSE
    `;
    
    const queryParams = [user_id]; // Start with user_id for the LEFT JOIN
    let filterSql = "";

    // 2. Add dynamic filters
    if (location_type) {
        filterSql += ` AND j.location_type = ?`;
        queryParams.push(location_type);
    }
    if (employment_type) {
        filterSql += ` AND j.employment_type = ?`;
        queryParams.push(employment_type);
    }
    if (skills) {
        filterSql += ` AND (j.skills_required_json LIKE ? OR j.skills_preferred_json LIKE ?)`;
        queryParams.push(`%${skills}%`, `%${skills}%`);
    }
    
    // 3. Main Data Query
    const dataSql = `${selectClause} ${fromClause} ${filterSql} ORDER BY j.created_at DESC LIMIT ? OFFSET ?`;
    const dataParams = [...queryParams, parseInt(limit), parseInt(offset)];

    pool.query(dataSql, dataParams, (err, jobs) => {
        if (err) return res.send(result.createResult(err, null));
        
        // 4. Count Query (uses the same fromClause and filterSql but different SELECT)
        const countSql = `SELECT COUNT(*) as total ${fromClause} ${filterSql}`;
        
        pool.query(countSql, queryParams, (err2, countResult) => {
            if (err2) return res.send(result.createResult(err2, null));

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
            -- Application core
            a.application_id,
            a.job_id,
            a.resume_id,
            a.stage,
            a.decision,
            a.created_at,
            
            -- Job details
            j.title,
            j.location_type,
            j.employment_type,
            j.experience_min,
            j.experience_max,
            j.status AS job_status,
            
            -- Organization
            o.name AS organization_name,
            o.logo_url,
            o.website,
            
            -- ✅ RESUME DETAILS (your main request)
            r.storage_path AS resume_url,
            -- ❌ Removed r.filename (doesn't exist)
            r.version_label,
            r.source,
            r.active AS resume_active,
            
            -- ✅ CANDIDATE PROFILE
            cp.name AS candidate_name,
            cp.skills_json,
            
            -- ✅ JOB FITMENT SCORES (your actual table)
            jfs.keyword_score,
            jfs.semantic_score,
            jfs.fit_flag,
            jfs.explanation AS ai_explanation
        FROM Applications a
        JOIN Jobs j ON a.job_id = j.job_id
        JOIN Organizations o ON j.org_id = o.organization_id
        LEFT JOIN Resumes r ON a.resume_id = r.resume_id 
            AND r.user_id = ? AND r.is_deleted = FALSE
        LEFT JOIN CandidateProfiles cp ON a.user_id = cp.user_id 
            AND cp.is_deleted = FALSE
        LEFT JOIN JobFitmentScores jfs ON a.user_id = jfs.user_id 
            AND a.job_id = jfs.job_id 
            AND jfs.is_deleted = FALSE
        WHERE a.user_id = ?
          AND a.is_deleted = FALSE
          AND j.status = 'open'
          AND o.is_deleted = FALSE
        ORDER BY a.created_at DESC
    `;

    pool.query(sql, [user_id, user_id], (err, rows) => {
        if (err) {
            console.error('Applications query error:', err);
            return res.send(result.createResult(err, null));
        }
        
        console.log(`✅ Found ${rows.length} applications with JobFitmentScores`);
        res.send(result.createResult(null, rows));
    });
});



// GET /api/candidates/applications/:applicationId/resume
router.get('/applications/:applicationId/resume', authorizeUser, (req, res) => {
    const user_id = req.headers.user_id;  // ✅ Already set by your authorizeUser middleware
    const { applicationId } = req.params;

    console.log('Get Resume by Application: user_id =', user_id, 'applicationId =', applicationId);

    if (!applicationId) {
        return res.send(result.createResult('applicationId is required', null));
    }

    // 1) Verify application belongs to this user and get resume_id
    const appSql = `
        SELECT 
            a.application_id,
            a.job_id,
            a.resume_id,
            a.stage,
            a.created_at
        FROM Applications a
        WHERE a.application_id = ? 
          AND a.user_id = ? 
          AND a.is_deleted = FALSE
    `;

    pool.query(appSql, [applicationId, user_id], (errApp, appRows) => {
        if (errApp) {
            console.error('Application query error:', errApp);
            return res.send(result.createResult(errApp, null));
        }
        
        if (appRows.length === 0) {
            return res.send(result.createResult('Application not found or you do not have access', null));
        }

        const resume_id = appRows[0].resume_id;

        // 2) Get resume details using the resume_id from application
        const resumeSql = `
            SELECT 
                resume_id,
                user_id,
                storage_path,
                filename,
                parsed_json,
                source,
                version_label,
                active,
                created_at
            FROM Resumes
            WHERE resume_id = ? 
              AND user_id = ? 
              AND is_deleted = FALSE
        `;

        pool.query(resumeSql, [resume_id, user_id], (errResume, resumeRows) => {
            if (errResume) {
                console.error('Resume query error:', errResume);
                return res.send(result.createResult(errResume, null));
            }
            
            if (resumeRows.length === 0) {
                return res.send(result.createResult('Resume not found for this application', null));
            }

            const resume = resumeRows[0];
            
            // ✅ Combined response with application + resume context
            const responseData = {
                application: {
                    application_id: appRows[0].application_id,
                    job_id: appRows[0].job_id,
                    stage: appRows[0].stage,
                    created_at: appRows[0].created_at
                },
                resume: {
                    resume_id: resume.resume_id,
                    storage_path: resume.storage_path,
                    filename: resume.filename || path.basename(resume.storage_path),
                    version_label: resume.version_label,
                    source: resume.source,
                    active: resume.active,
                    parsed_json: resume.parsed_json, // For AI-parsed resume data
                    created_at: resume.created_at
                },
                message: 'Resume details retrieved successfully'
            };

            console.log('✅ Resume served for application:', applicationId);
            res.send(result.createResult(null, responseData));
        });
    });
});

// GET /api/candidates/fitment/:jobId - Get fitment by job_id + user_id
router.get('/fitment/:jobId', authorizeUser, (req, res) => {
    const user_id = req.headers.user_id;  // ✅ From your token middleware
    const { jobId } = req.params;
    
    console.log('🔍 === SINGLE FITMENT BY JOB ===', { user_id, jobId });
    
    const sql = `
        SELECT 
            -- Fitment scores (LATEST)
            jfs.id, jfs.keyword_score, jfs.semantic_score, jfs.fit_flag, 
            jfs.explanation, jfs.created_at,
            
            -- Job details
            j.title, j.jd_text, j.location_type, j.employment_type,
            j.experience_min, j.experience_max, j.skills_required_json,
            
            -- Organization
            o.name as organization_name, o.logo_url, o.website,
            
            -- Candidate profile
            cp.name as candidate_name, cp.skills_json
            
        FROM JobFitmentScores jfs
        JOIN Jobs j ON jfs.job_id = j.job_id AND j.status = 'open' AND j.is_deleted = 0
        JOIN Organizations o ON j.org_id = o.organization_id AND o.is_deleted = 0
        JOIN CandidateProfiles cp ON jfs.user_id = cp.user_id AND cp.is_deleted = 0
        
        WHERE jfs.user_id = ? AND jfs.job_id = ? AND jfs.is_deleted = 0
        ORDER BY jfs.created_at DESC 
        LIMIT 1
    `;
    
    pool.query(sql, [user_id, jobId], (err, rows) => {
        if (err) {
            console.error('💥 Fitment query error:', err);
            return res.send(result.createResult(err, null));
        }
        
        if (rows.length === 0) {
            console.log('❌ No fitment score found');
            return res.send(result.createResult('No fitment score found for this job', null));
        }
        
        const fitment = rows[0];
        console.log('✅ Fitment found:', fitment.semantic_score, '%');
        
        res.send(result.createResult(null, {
            fitmentScore: fitment.semantic_score / 100,
            keywordScore: fitment.keyword_score,
            fitFlag: fitment.fit_flag,
            explanation: fitment.explanation,
            scoreId: fitment.id,
            createdAt: fitment.created_at,
            
            // Full job details
            job: {
                job_id: fitment.job_id,
                title: fitment.title,
                organization_name: fitment.organization_name,
                location_type: fitment.location_type,
                employment_type: fitment.employment_type,
                experience_min: fitment.experience_min,
                experience_max: fitment.experience_max,
                skills_required: fitment.skills_required_json
            },
            
            // Candidate skills
            candidateSkills: fitment.skills_json
        }));
    });
});


// Add this to your candidate.js router
router.get('/stats/applications', authorizeUser, (req, res) => {
    const user_id = req.headers.user_id;

    const sql = `
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN stage = 'applied' THEN 1 ELSE 0 END) as applied,
            SUM(CASE WHEN stage = 'interview' THEN 1 ELSE 0 END) as interview,
            SUM(CASE WHEN stage = 'offer' THEN 1 ELSE 0 END) as offer,
            SUM(CASE WHEN stage = 'rejected' THEN 1 ELSE 0 END) as rejected
        FROM Applications 
        WHERE user_id = ? AND is_deleted = FALSE
    `;

    pool.query(sql, [user_id], (err, rows) => {
        if (err) return res.send(result.createResult(err, null));
        
        const summary = {
            total: rows[0].total || 0,
            applied: rows[0].applied || 0,
            interview: rows[0].interview || 0,
            offer: rows[0].offer || 0,
            rejected: rows[0].rejected || 0
        };

        // Success rate calculation
        const successRate = summary.total > 0 
            ? Math.round((summary.offer / summary.total) * 100) 
            : 0;

        // This response perfectly matches Home.js: stats?.summary?.total, stats?.successRate, etc.
        res.send(result.createResult(null, {
            summary,
            successRate,
            lastUpdated: new Date().toISOString(),
            message: summary.total === 0 
                ? "Start your journey! Apply to your first job today." 
                : "You're doing great! Keep tracking your applications here."
        }));
    });
});


module.exports = router;  

