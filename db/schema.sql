-- Integrated Demand Management (IDM) Platform Schema
-- Designed for UNISA Enterprise Architecture & Strategic Alignment

-- Enable UUID extension if supported
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. UTILITIES & ENUMS
-- Note: Mapped to JS/TS constants to allow portability across DB dialects
CREATE TABLE IF NOT EXISTS initiative_status (
    status_id VARCHAR(50) PRIMARY KEY,
    description TEXT NOT NULL
);

INSERT INTO initiative_status (status_id, description) VALUES
('Draft', 'Initiative is currently a draft saved by the Requester'),
('Submitted', 'Initiative submitted and awaiting Owner acceptance'),
('Accepted', 'Initiative accepted by Owner and assigned to Demand Planner'),
('Declined', 'Initiative declined by Owner or governance committee'),
('Parked', 'Initiative parked by Demand Planner'),
('Reviewed', 'Initiative reviewed and classification/business case uploaded'),
('SolArch', 'Initiative sent for Solutions Architecture Assessment'),
('Assessed', 'Solutions Architecture assessment and report completed'),
('Recommended', 'Recommended by SolArch Committee and assigned to ICT SteerCo'),
('Approved', 'Approved by ICT SteerCo as an official institutional project'),
('Referred Back', 'Referred back to the owner for clarification/updates');

-- 2. INITIATIVES MAIN TABLE
CREATE TABLE IF NOT EXISTS initiatives (
    id VARCHAR(50) PRIMARY KEY,
    request_number VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    request_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Actors
    requester_email VARCHAR(255) NOT NULL,
    requester_name VARCHAR(255) NOT NULL,
    requester_unit VARCHAR(255) NOT NULL,
    owner_email VARCHAR(255) NOT NULL,
    owner_name VARCHAR(255) NOT NULL,
    owner_unit VARCHAR(255) NOT NULL,
    reviewer_email VARCHAR(255),
    reviewer_name VARCHAR(255),
    
    -- Main Intake Form (UC1)
    background TEXT NOT NULL,
    objective TEXT NOT NULL,
    potential_benefits TEXT NOT NULL,
    alignment_strategy VARCHAR(255) NOT NULL,
    
    -- Cascading Capabilities
    capability_type VARCHAR(255) NOT NULL,
    capability_group VARCHAR(255) NOT NULL,
    capability_title VARCHAR(255) NOT NULL,
    
    -- High Level Impact Analysis
    impact_description TEXT NOT NULL,
    budget_estimate DECIMAL(15, 2) NOT NULL,
    affected_parties TEXT NOT NULL,
    time_estimate VARCHAR(100) NOT NULL,
    
    -- Status
    status VARCHAR(50) DEFAULT 'Submitted' REFERENCES initiative_status(status_id),
    decline_reason TEXT,
    
    -- Dates tracking for UC8 Reporting
    acceptance_date TIMESTAMP WITH TIME ZONE,
    review_date TIMESTAMP WITH TIME ZONE,
    assessment_date TIMESTAMP WITH TIME ZONE,
    recommendation_date TIMESTAMP WITH TIME ZONE,
    decision_date TIMESTAMP WITH TIME ZONE,
    handover_date TIMESTAMP WITH TIME ZONE,
    
    -- UC4 Business Case Details
    business_case_status VARCHAR(50) DEFAULT 'In-Progress', -- 'In-Progress', 'Signed-Fully'
    business_case_url TEXT,
    initiative_impact_class VARCHAR(50), -- 'Small (Minor)', 'Medium', 'High'
    
    -- UC5 Solutions Architecture Assessment
    solarch_report_status VARCHAR(50) DEFAULT 'In-Progress', -- 'In-Progress', 'Completed'
    solarch_report_url TEXT,
    
    -- UC6 Meeting Scheduling
    solarch_meeting_date TIMESTAMP WITH TIME ZONE,
    
    -- UC7 ICT SteerCo Scheduling & Priority Rating
    steerco_meeting_date TIMESTAMP WITH TIME ZONE,
    project_priority_score INT, -- 1-100 score from tool
    project_rating VARCHAR(50)  -- 'High', 'Medium', 'Low'
);

-- 3. WORKFLOW HISTORY LOGS FOR AUDITABILITY
CREATE TABLE IF NOT EXISTS workflow_history (
    history_id VARCHAR(50) PRIMARY KEY,
    initiative_id VARCHAR(50) REFERENCES initiatives(id) ON DELETE CASCADE,
    from_status VARCHAR(50),
    to_status VARCHAR(50) NOT NULL,
    updated_by_email VARCHAR(255) NOT NULL,
    updated_by_name VARCHAR(255) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    comments TEXT
);

-- Indexing for high-performance reporting & dashboard tracking
CREATE INDEX idx_initiatives_status ON initiatives(status);
CREATE INDEX idx_initiatives_request_number ON initiatives(request_number);
CREATE INDEX idx_workflow_history_initiative ON workflow_history(initiative_id);
