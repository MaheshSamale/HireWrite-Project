Yethe tumchya project sathi updated `README.md` dile aahe, jyamadhe sarva contributors ani tech stack chi mahiti samavishta aahe:

---

# HireWrite: AI-Powered Recruitment Ecosystem

**HireWrite** he ek pudhchya pidhiche recruitment platform aahe, je paramparik applicant tracking ani modern Artificial Intelligence yanchyatil antar kami karte. **Google Gemini AI** cha vapar karun, HireWrite fakt keyword matching chya pudhe jaun semantic analysis, automated job descriptions ani objective candidate scoring pradan karte.

---

## Key Features

* ** AI-Powered Scoring:** Gemini AI cha vapar karun candidate resume ani Job Description yanchyatil "Fitment Score" calculate karte.
* ** Smart JD Generation:** Recruiters kahi sekandat AI chya madatine high-impact job descriptions tayar karu shaktat.
* ** Multi-Tenant Architecture:** Candidates, Recruiters, Organizations, ani Super Admins sathi swatantra workflow.
* ** Dynamic Dashboards:** Application tracking, hiring pipelines, ani user management sathi real-time statistics.
* ** Resume Management:** Candidate profiles sathi surakshit PDF/Docx upload ani storage.

---

## Tech Stack

* **Frontend (Mobile & Web):** React Native (React Navigation, Axios, AsyncStorage) & React.js
* **Backend:** Node.js, Express.js (35+ REST APIs)
* **Database:** MySQL
* **AI Engine:** Google Gemini AI (Generative AI SDK)
* **Authentication:** JWT (JSON Web Tokens) & Bcrypt

---

## Live Demo

Experience the platform live:

* **Web Dashboard:** [https://hire-write-project-ci5c.vercel.app/](https://hire-write-project-ci5c.vercel.app/)
* **Demo Credentials:** * **Email:** `m@123`
* **Password:** `123`
*(Tip: Demo credentials veloveli reset kele jatat)*



---

## Complete API Reference

### **1. Admin Module** (`/api/admin`)

* `POST /register` – Navin admin nondani.
* `POST /login` – Admin authentication.
* `GET /dashboard` – System-wide stats (Users, Orgs, Jobs, Apps).
* `GET /users` – Sarva active candidates ani recruiters chi yadi.
* `POST /blockUser` / `POST /unblockUser` – User access management.
* `GET /audit` – Admin actions che logs.

### **2. Candidate Module** (`/api/candidates`)

* `POST /profile` – Professional details set up karne.
* `GET /jobs/explore` – AI-ready job listings pahane.
* `POST /jobs/:jobId/apply` – Job sathi application dene.
* `POST /resumes` – PDF/Docx upload karne.
* `POST /jobs/:jobId/gemini-score` – **AI Feature:** Fitment Analysis.

### **3. Recruiter Module** (`/api/recruiters`)

* `POST /jobs/generate-description` – **AI Feature:** AI JD Writer.
* `POST /jobs` – Navin job post karne.
* `PUT /applications/:applicationId/stage` – Pipeline management (Interview/Offer).

### **4. Organization Module** (`/api/organizations`)

* `POST /register` – Navin sansthechi nondani.
* `POST /recruiters` – Hiring teams manage karne.

---

## Contributors

* **Mahesh Samale** (@MaheshSamale)
* **Rutuja Jadhav** (@Rutuja-coder08)
* **Shikha Kashyap** (@shikha-kashyap)
* **Vijay Shinde** (@Vijay-shinde96)

---

**Source Code & APKs:** [GitHub Repo]

---
