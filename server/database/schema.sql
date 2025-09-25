-- Database schema for UGC Validation System

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_number VARCHAR(50) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    text_review TEXT NOT NULL,
    discount_code VARCHAR(20),
    email_sent BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'pending', -- pending, accepted, rejected
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Images table
CREATE TABLE IF NOT EXISTS images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    review_id INTEGER NOT NULL,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    width INTEGER,
    height INTEGER,
    validation_result TEXT, -- JSON with validation details
    decision VARCHAR(20) NOT NULL, -- accept, reject
    quality_score INTEGER,
    feedback TEXT,
    has_people BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (review_id) REFERENCES reviews (id) ON DELETE CASCADE
);

-- Validation logs table
CREATE TABLE IF NOT EXISTS validation_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    review_id INTEGER,
    image_id INTEGER,
    action VARCHAR(50) NOT NULL, -- validation_start, validation_complete, validation_error
    details TEXT, -- JSON with action details
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (review_id) REFERENCES reviews (id) ON DELETE SET NULL,
    FOREIGN KEY (image_id) REFERENCES images (id) ON DELETE SET NULL
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reviews_order_number ON reviews(order_number);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at);
CREATE INDEX IF NOT EXISTS idx_images_review_id ON images(review_id);
CREATE INDEX IF NOT EXISTS idx_images_decision ON images(decision);
CREATE INDEX IF NOT EXISTS idx_validation_logs_review_id ON validation_logs(review_id);
CREATE INDEX IF NOT EXISTS idx_validation_logs_created_at ON validation_logs(created_at);
