-- Enable vector extension for reasoning semantic drift tracking
CREATE EXTENSION IF NOT EXISTS vector;

-- Applications Table
CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    app_key VARCHAR(64) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- A/B Experiments Rule Table
CREATE TABLE IF NOT EXISTS ab_experiments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    app_id UUID REFERENCES applications(id) ON DELETE CASCADE,
    experiment_key VARCHAR(128) NOT NULL,
    variant_a_name VARCHAR(64) DEFAULT 'A',
    variant_b_name VARCHAR(64) DEFAULT 'B',
    split_percentage INT CHECK (split_percentage BETWEEN 0 AND 100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(app_id, experiment_key)
);

-- Sticky A/B Variant Assignments Table
CREATE TABLE IF NOT EXISTS ab_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    experiment_id UUID REFERENCES ab_experiments(id) ON DELETE CASCADE,
    entity_id VARCHAR(255) NOT NULL,
    assigned_variant VARCHAR(64) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(experiment_id, entity_id)
);

-- Session User Feedback Table
CREATE TABLE IF NOT EXISTS session_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    app_id UUID REFERENCES applications(id) ON DELETE CASCADE,
    session_id VARCHAR(255) NOT NULL,
    entity_id VARCHAR(255) NOT NULL,
    vote INT NOT NULL CHECK (vote IN (-1, 1)),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Reasoning Vector Embeddings (Semantic Drift Tracking)
CREATE TABLE IF NOT EXISTS reasoning_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(255) NOT NULL,
    turn_index INT NOT NULL,
    agent_identity VARCHAR(255) NOT NULL,
    reasoning_text TEXT NOT NULL,
    embedding vector(1536),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reasoning_embeddings_session ON reasoning_embeddings(session_id);

-- Insert Default Application Record
INSERT INTO applications (app_key, name) 
VALUES ('app_live_8832109', 'Default AX Application') 
ON CONFLICT (app_key) DO NOTHING;
