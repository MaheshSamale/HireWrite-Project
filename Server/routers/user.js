const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pool = require('../utils/db');
const result = require('../utils/results');
const authorizeUser = require('../utils/authUser');


const router = express.Router();

// // REGISTER (Users + CandidateProfiles)
// router.post('/register', (req, res) => {
//     const { name, email, mobile, password } = req.body;
//     console.log("Candidate register:", email);
    
//     if (!name || !email || !mobile || !password) {
//         return res.send(result.createResult('Name, email, mobile, and password required', null));
//     }

//     const checkSql = `SELECT user_id FROM Users WHERE email = ? OR mobile = ? AND is_deleted = FALSE`;
//     pool.query(checkSql, [email, mobile], (err, checkData) => {
//         if (err) return res.send(result.createResult(err, null));
//         if (checkData.length > 0) return res.send(result.createResult("Email or mobile already registered", null));
        
//         bcrypt.hash(password, config.SALT_ROUND, (err, hashedPassword) => {
//             if (err || !hashedPassword) {
//                 return res.send(result.createResult('Password hashing failed', null));
//             }
            
//             const user_id = uuidv4();
//             const userSql = `INSERT INTO Users (user_id, email, mobile, password, role, created_at) 
//                             VALUES (?, ?, ?, ?, 'candidate', NOW())`;
            
//             pool.query(userSql, [user_id, email, mobile, hashedPassword], (err, userData) => {
//                 if (err) return res.send(result.createResult(err, null));
                
//                 const candidate_id = uuidv4();
//                 const profileSql = `INSERT INTO CandidateProfiles (candidate_id, user_id, name, created_at) 
//                                    VALUES (?, ?, ?, NOW())`;
                
//                 pool.query(profileSql, [candidate_id, user_id, name], (err, profileData) => {
//                     if (err) return res.send(result.createResult(err, null));
                    
//                     const responseData = { user_id, candidate_id, message: 'Candidate registered successfully' };
//                     res.send(result.createResult(null, responseData));
//                 });
//             });
//         });
//     });
// });

// // LOGIN
// router.post('/login', (req, res) => {
//     const { email, password } = req.body;

//     if (!email || !password) {
//         return res.send(result.createResult('Email and password required', null));
//     }

//     const sql = `
//         SELECT u.user_id, u.email, u.mobile, u.password, u.role, cp.candidate_id, cp.name
//         FROM Users u
//         LEFT JOIN CandidateProfiles cp ON u.user_id = cp.user_id AND cp.is_deleted = FALSE
//         WHERE u.email = ?
//           AND u.role = 'candidate'
//           AND u.is_deleted = FALSE
//         LIMIT 1
//     `;

//     pool.query(sql, [email], (err, rows) => {
//         if (err) return res.send(result.createResult(err, null));
//         if (rows.length === 0) {
//             return res.send(result.createResult('Invalid Email or not a candidate', null));
//         }

//         const user = rows[0];
//         bcrypt.compare(password, user.password, (err2, status) => {
//             if (err2 || !status) {
//                 return res.send(result.createResult('Invalid Password', null));
//             }

//             const payload = { user_id: user.user_id, role: 'candidate' };
//             const token = jwt.sign(payload, config.SECRET);

//             const data = {
//                 token,
//                 user_id: user.user_id,
//                 candidate_id: user.candidate_id,
//                 name: user.name,
//                 email: user.email,
//                 mobile: user.mobile,
//                 role: 'candidate'
//             };

//             res.send(result.createResult(null, data));
//         });
//     });
// });


// Create uploads folder if not exists
const uploadDir = path.join(__dirname, '..', 'uploads', 'profiles');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const userId = req.headers.user_id || 'unknown';
        const ext = path.extname(file.originalname);
        cb(null, `${userId}-${Date.now()}${ext}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
    fileFilter: (req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/jpg'];
        if (!allowed.includes(file.mimetype)) {
            return cb(new Error('Only JPG/PNG images are allowed'));
        }
        cb(null, true);
    }
});




// Ensure 'photo' matches the frontend key
router.post('/profile-photo', authorizeUser, upload.single('photo'), (req, res) => {
    // 1. Check if authorizeUser middleware correctly attached user_id
    // If not, use req.headers.user_id as a fallback
    const user_id = req.user?.user_id || req.headers.user_id;
    
    if (!user_id) {
        return res.status(400).json({ status: 'error', message: 'User ID missing' });
    }

    // 2. Check if Multer actually saved the file
    if (!req.file) {
        return res.status(400).json({ status: 'error', message: 'No file uploaded or invalid file type' });
    }

    // 3. Construct the URL
    const photoUrl = `/uploads/profiles/${req.file.filename}`;

    // 4. Update Database
    const sql = `UPDATE Users 
                 SET profile_photo_url = ?, updated_at = NOW() 
                 WHERE user_id = ? AND is_deleted = FALSE`;

    pool.query(sql, [photoUrl, user_id], (err, resultData) => {
        if (err) {
            console.error("Database Error:", err);
            return res.status(500).json({ status: 'error', message: 'Database update failed' });
        }

        if (resultData.affectedRows === 0) {
            return res.status(404).json({ status: 'error', message: 'User not found or already deleted' });
        }

        // 5. Success response
        res.status(200).json({
            status: 'success',
            data: {
                user_id,
                profile_photo_url: photoUrl,
                message: 'Profile photo updated successfully'
            }
        });
    });
});




module.exports = router;  
