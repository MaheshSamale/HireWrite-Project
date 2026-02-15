# HireWrite: AI-Powered Recruitment Ecosystem

**HireWrite** is a next-generation recruitment platform designed to bridge the gap between traditional applicant tracking and modern Artificial Intelligence. By leveraging **Google Gemini AI**, HireWrite moves beyond simple keyword matching to provide semantic analysis, automated job descriptions, and objective candidate scoring.

---

## 🌟 Key Features

* **🤖 AI-Powered Scoring:** Automatically calculates a "Fitment Score" between candidate resumes and Job Descriptions using Gemini AI.
* **✍️ Smart JD Generation:** Recruiters can generate high-impact job descriptions in seconds via AI integration.
* **🏢 Multi-Tenant Architecture:** Dedicated workflows for Candidates, Recruiters, Organizations, and Super Admins.
* **📊 Dynamic Dashboards:** Real-time statistics for application tracking, hiring pipelines, and user management.
* **📎 Resume Management:** Secure PDF/Docx upload and storage for candidate profiles.

---

## 🛠️ Tech Stack

| Layer | Technologies Used |
| --- | --- |
| **Frontend** | React Native (React Navigation, Axios, AsyncStorage), React.js |
| **Backend** | Node.js, Express.js (35+ REST APIs) |
| **Database** | MySQL |
| **AI Engine** | Google Gemini AI (Generative AI SDK) |
| **Auth** | JWT (JSON Web Tokens) & Bcrypt |

---

## 🌐 Live Demo

Experience the platform live:

* **Web Dashboard:** [HireWrite Vercel App](https://hire-write-project-ci5c.vercel.app/)
* **Demo Credentials:** * **Email:** `m@123`
* **Password:** `123`
*(Note: Demo credentials reset periodically)*



---

## 📡 Complete API Reference

### **1. Admin Module** (`/api/admin`)

* `POST /register` – Register a new system administrator.
* `POST /login` – Admin authentication.
* `GET /dashboard` – High-level stats (Total Users, Orgs, Jobs, Apps).
* `GET /profile` – Get current admin profile details.
* `GET /users` – List all active candidates and recruiters.
* `GET /blockedUsers` – View list of soft-deleted/restricted users.
* `POST /blockUser` – Restrict access for a specific user.
* `POST /unblockUser` – Restore access for a blocked user.
* `GET /organizations` – List all registered companies.
* `GET /jobs` – Global job listing with stage filters.
* `GET /audit` – View logs of administrative actions.

### **2. Candidate Module** (`/api/candidates`)

* `POST /register` – Create a new candidate account.
* `POST /login` – Candidate authentication.
* `POST /profile` – Create or update professional details.
* `GET /profile` – Retrieve personal professional profile.
* `GET /jobs/explore` – Browse and search for open job listings.
* `GET /jobs/:jobId` – Get full details for a specific job post.
* `POST /jobs/:jobId/apply` – Submit an application for a role.
* `GET /applications` – Track status of all personal applications.
* `POST /resumes` – Upload resume files (PDF/Docx).
* `GET /resumes` – List all uploaded resumes for the user.
* `POST /jobs/:jobId/gemini-score` – **AI Feature:** Calculate match score against JD.
* `GET /stats` – Personal application success/stage metrics.

### **3. Recruiter Module** (`/api/recruiters`)

* `POST /jobs/generate-description` – **AI Feature:** Generate JDs using Gemini.
* `POST /jobs` – Create and publish a new job opening.
* `PUT /jobs/status` – Toggle job status (Open/Closed).
* `GET /jobs` – List all jobs managed by the recruiter.
* `GET /jobs/:jobId/applications` – View all candidates for a specific job.
* `PUT /applications/:applicationId/stage` – Move candidates through the pipeline.
* `GET /profile` – Get recruiter and organization summary.

### **4. Organization Module** (`/api/organizations`)

* `POST /register` – Register a new organization entity.
* `POST /login` – Organization-level management login.
* `POST /recruiters` – Add new recruiter accounts to the organization.
* `POST /recruiters/login` – Specialized login for recruiter access.
* `GET /recruiters` – List all recruiters associated with the organization.
* `GET /jobs` – View all jobs posted under the organization banner.
* `GET /jobs/:jobId` – Detailed analytics for a specific organizational job.

### **5. User Module** (`/api/users`)

* `POST /profile-photo` – Upload and update user profile pictures.

---

## 👥 Contributors

We are a team of dedicated developers focused on modernizing the recruitment landscape.

* **Mahesh Samale** – [GitHub Profile](https://www.google.com/search?q=https://github.com/MaheshSamale)
* **Rutuja Jadhav** – [GitHub Profile](https://github.com/Rutuja-coder08)
* **Shikha Kashyap** – [GitHub Profile](https://github.com/shikha-kashyap)
* **Vijay Shinde** – [GitHub Profile](https://github.com/Vijay-shinde96)

