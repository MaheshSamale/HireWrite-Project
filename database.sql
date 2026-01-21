DROP DATABASE IF EXISTS hirewrite_database;
CREATE DATABASE hirewrite_database;
USE hirewrite_database;

CREATE TABLE Users (
    user_id CHAR(36) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    mobile VARCHAR(10) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('candidate','recruiter','admin') NOT NULL, -- student to candidate
    profile_photo_url VARCHAR(512),
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by CHAR(36),
    col1 VARCHAR(255),
    col2 VARCHAR(255),
    col3 VARCHAR(255),
    col4 VARCHAR(255)
);

CREATE TABLE Organizations (
    organization_id CHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    website VARCHAR(255),
    description TEXT,
    logo_url VARCHAR(255),
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    col1 VARCHAR(255),
    col2 VARCHAR(255),
    col3 VARCHAR(255),
    col4 VARCHAR(255)
);

CREATE TABLE OrgUsers (
    recruiter_id CHAR(36) PRIMARY KEY,
    user_id CHAR(36),
    organization_id CHAR(36),
    name VARCHAR(255),
    position VARCHAR(128),
    org_role ENUM('owner','recruiter','viewer') NOT NULL,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by CHAR(36),
    col1 VARCHAR(255),
    col2 VARCHAR(255),
    col3 VARCHAR(255),
    col4 VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    FOREIGN KEY (organization_id) REFERENCES Organizations(organization_id)
);

CREATE TABLE CandidateProfiles (
    candidate_id CHAR(36) PRIMARY KEY,
    user_id CHAR(36),
    name VARCHAR(255), 
    skills_json JSON,
    education_json JSON,
    experience_json JSON,
    links_json JSON,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by CHAR(36),
    col1 VARCHAR(255),
    col2 VARCHAR(255),
    col3 VARCHAR(255),
    col4 VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

CREATE TABLE Resumes (
    resume_id CHAR(36) PRIMARY KEY,
    user_id CHAR(36),
    storage_path VARCHAR(512),
    parsed_json JSON,
    template_id CHAR(36),
    source ENUM('uploaded','generated'),
    version_label VARCHAR(128),
    active BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by CHAR(36),
    col1 VARCHAR(255),
    col2 VARCHAR(255),
    col3 VARCHAR(255),
    col4 VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

CREATE TABLE Jobs (
    job_id CHAR(36) PRIMARY KEY,
    org_id CHAR(36),
    title VARCHAR(255),
    created_by_user_id CHAR(36), -- Id of Recruiter Who Has Posted This Job
    location_type ENUM('remote','hybrid','onsite') NOT NULL,
    employment_type ENUM('full-time','part-time','intern','contract') NOT NULL,
    experience_min INT,
    experience_max INT,
    skills_required_json JSON,
    skills_preferred_json JSON,
    jd_text TEXT,
    status ENUM('draft','open','closed') DEFAULT 'open',
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by CHAR(36),
    col1 VARCHAR(255),
    col2 VARCHAR(255),
    col3 VARCHAR(255),
    col4 VARCHAR(255),
    FOREIGN KEY (org_id) REFERENCES Organizations(organization_id)
);

CREATE TABLE Applications (
    application_id CHAR(36) PRIMARY KEY,
    job_id CHAR(36),
    user_id CHAR(36),
    resume_id CHAR(36),
    stage ENUM('applied','shortlisted','interview','offer','hired','rejected') DEFAULT 'applied',
    decision ENUM('offer','reject') DEFAULT NULL,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by CHAR(36),
    col1 VARCHAR(255),
    col2 VARCHAR(255),
    col3 VARCHAR(255),
    col4 VARCHAR(255),
    FOREIGN KEY (job_id) REFERENCES Jobs(job_id),
    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    FOREIGN KEY (resume_id) REFERENCES Resumes(resume_id)
);

CREATE TABLE Scores (
    application_id CHAR(36) PRIMARY KEY,
    keyword_score INT,
    semantic_score INT,
    fit_flag BOOLEAN,
    explanation TEXT,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by CHAR(36),
    col1 VARCHAR(255),
    col2 VARCHAR(255),
    col3 VARCHAR(255),
    col4 VARCHAR(255),
    FOREIGN KEY (application_id) REFERENCES Applications(application_id)
);

CREATE TABLE AdminAudit (
    id CHAR(36) PRIMARY KEY,
    actor_user_id CHAR(36),
    action TEXT,
    target_type ENUM('user','company','job','application'),
    target_id CHAR(36),
    payload_json JSON,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by CHAR(36),
    col1 VARCHAR(255),
    col2 VARCHAR(255),
    col3 VARCHAR(255),
    col4 VARCHAR(255),
    FOREIGN KEY (actor_user_id) REFERENCES Users(user_id)
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
