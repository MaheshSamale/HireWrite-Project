require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./utils/db'); 

const userRouter = require("./routers/user");
const orgRouter = require("./routers/organizations");
const candidateRouter = require("./routers/candidate");
const recruiterRouter = require('./routers/recruiter');
const adminRouter = require('./routers/admin');
const authorizeUser = require('./utils/authUser');

const app = express();

// 1. CORS and JSON parsing first
app.use(cors());
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 2. Static files (images) should be accessible WITHOUT authorization
app.use('/uploads/profiles', express.static(path.join(__dirname, 'uploads', 'profiles')));
app.use('/uploads/resumes', express.static(path.join(__dirname, 'uploads', 'resumes')));

app.get('/', (req, res) => {
    res.send('Hello from server');
});




app.get('/', (req, res) => res.send('Hello from server'));

app.get('/api/health', (req, res) => {
    const sql = `
        SELECT 'users' AS type, COUNT(*) AS count FROM Users
        UNION ALL
        SELECT 'orgs', COUNT(*) FROM Organizations
        UNION ALL
        SELECT 'jobs', COUNT(*) FROM Jobs
    `;
    db.query(sql, (err, rows) => {
        if (err) return res.status(500).json({ status: 'error', error: err.message });
        const data = {};
        rows.forEach(row => { data[row.type] = row.count; });
        res.json({
            status: 'success',
            data: {
                total_users: data.users,
                total_organizations: data.orgs,
                total_jobs: data.jobs
            }
        });
    });
});

console.log('hi')

// 4. Routes (Remember the prefix is /api/...)
app.use('/api/users', userRouter);
app.use(authorizeUser); 
app.use('/api/candidates', candidateRouter);
app.use('/api/organizations', orgRouter);
app.use('/api/recruiters', recruiterRouter);
app.use('/api/admin', adminRouter);

const port = 4000;
app.listen(port, '0.0.0.0', () => {
    console.log(`server is running on ${port}`);
});
