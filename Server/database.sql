-- 1. Create the Database
CREATE DATABASE IF NOT EXISTS hirewrite_database;
USE hirewrite_database;

-- 2. Users Table
CREATE TABLE Users (
    user_id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    mobile VARCHAR(20) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('candidate', 'employer', 'admin') DEFAULT 'candidate',
    profile_photo_url TEXT,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 3. Organizations Table
CREATE TABLE Organizations (
    organization_id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    logo_url TEXT,
    website TEXT,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Jobs Table
CREATE TABLE Jobs (
    job_id VARCHAR(36) PRIMARY KEY,
    org_id VARCHAR(36),
    title VARCHAR(255) NOT NULL,
    jd_text TEXT,
    location_type VARCHAR(50),
    employment_type VARCHAR(50),
    experience_min INT,
    experience_max INT,
    skills_required_json JSON,
    skills_preferred_json JSON,
    status ENUM('open', 'closed') DEFAULT 'open',
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (org_id) REFERENCES Organizations(organization_id)
);

-- 5. Candidate Profiles Table
CREATE TABLE CandidateProfiles (
    candidate_id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) UNIQUE, -- One profile per user
    name VARCHAR(255) NOT NULL,
    skills_json JSON,
    education_json JSON,
    experience_json JSON,
    links_json JSON,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

-- 6. Resumes Table
CREATE TABLE Resumes (
    resume_id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36),
    storage_path TEXT NOT NULL,
    parsed_json JSON,
    template_id VARCHAR(36),
    source VARCHAR(50),
    version_label VARCHAR(100),
    active BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

-- 7. Applications Table (WITH UNIQUE CONSTRAINT)
CREATE TABLE Applications (
    application_id VARCHAR(36) PRIMARY KEY,
    job_id VARCHAR(36),
    user_id VARCHAR(36),
    resume_id VARCHAR(36),
    stage VARCHAR(50) DEFAULT 'applied',
    decision ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES Jobs(job_id),
    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    FOREIGN KEY (resume_id) REFERENCES Resumes(resume_id),
    -- Prevents duplicate applications for the same job
    CONSTRAINT unique_application UNIQUE (user_id, job_id) 
);

-- 8. Job Fitment Scores Table (WITH UNIQUE CONSTRAINT)
CREATE TABLE JobFitmentScores (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36),
    job_id VARCHAR(36),
    keyword_score INT,
    semantic_score INT,
    fit_flag BOOLEAN,
    explanation TEXT,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    FOREIGN KEY (job_id) REFERENCES Jobs(job_id),
    -- Prevents duplicate AI scores for the same job
    CONSTRAINT unique_fitment UNIQUE (user_id, job_id)
);

CREATE INDEX idx_users_email ON Users(email);
CREATE INDEX idx_users_role ON Users(role);
CREATE INDEX idx_jobs_org_id ON Jobs(org_id);
CREATE INDEX idx_jobs_status ON Jobs(status);
CREATE INDEX idx_applications_job_id ON Applications(job_id);
CREATE INDEX idx_applications_user_id ON Applications(user_id);
CREATE INDEX idx_applications_stage ON Applications(stage);
CREATE INDEX idx_orgusers_user_id ON OrgUsers(user_id);
CREATE INDEX idx_orgusers_org_id ON OrgUsers(organization_id);


ALTER TABLE Applications 
ADD CONSTRAINT unique_user_job_application 
UNIQUE (user_id, job_id);





-- ALTER TABLE JobFitmentScores ADD UNIQUE INDEX unique_user_job (user_id, job_id);



-- DELETE FROM JobFitmentScores 
-- WHERE id NOT IN (
--     SELECT id FROM (
--         SELECT id FROM JobFitmentScores t1
--         INNER JOIN (
--             SELECT user_id as uid, job_id as jid, MAX(created_at) as max_date
--             FROM JobFitmentScores
--             GROUP BY user_id, job_id
--         ) t2 ON t1.user_id = t2.uid AND t1.job_id = t2.jid AND t1.created_at = t2.max_date
--     ) as temp
-- );