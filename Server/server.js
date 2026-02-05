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

// 2. Static files (images) should be accessible WITHOUT authorization
app.use('/uploads/profiles', express.static(path.join(__dirname, 'uploads', 'profiles')));
app.use('/uploads/resumes', express.static(path.join(__dirname, 'uploads', 'resumes')));

app.get('/', (req, res) => {
    res.send('Hello from server');
});

// 3. APPLY AUTHENTICATION STRATEGICALLY
// If you want EVERY route protected:
app.use(authorizeUser); 
app.get('/',(req,res)=>{
    res.send('Hello from server')
})
// Add this below your 'Hello from server' route
app.get('/api/health', async (req, res) => {
    const db = require('./utils/db');
    try {
        // This query counts entries in your three main tables
        const [users] = await db.query('SELECT COUNT(*) as count FROM Users');
        const [orgs] = await db.query('SELECT COUNT(*) as count FROM Organizations');
        const [jobs] = await db.query('SELECT COUNT(*) as count FROM Jobs');

        res.json({
            status: 'success',
            data: {
                total_users: users[0].count,
                total_organizations: orgs[0].count,
                total_jobs: jobs[0].count
            }
        });
    } catch (err) {
        res.status(500).json({ status: 'error', error: err.message });
    }
});

console.log('hi')

// 4. Routes (Remember the prefix is /api/...)
app.use('/api/users', userRouter);
app.use('/api/candidates', candidateRouter);
app.use('/api/organizations', orgRouter);
app.use('/api/recruiters', recruiterRouter);
app.use('/api/admin', adminRouter);

const port = 4000;
app.listen(port, '0.0.0.0', () => {
    console.log(`server is running on ${port}`);
});