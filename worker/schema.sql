-- Cloudflare D1 Database Schema for UGC Validation System

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_number TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    text_review TEXT NOT NULL,
    star_rating INTEGER NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, accepted, rejected
    image_urls TEXT, -- JSON array of image URLs
    discount_code TEXT,
    email_sent BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Images table
CREATE TABLE IF NOT EXISTS images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    review_id INTEGER NOT NULL,
    filename TEXT NOT NULL,
    decision TEXT NOT NULL, -- accept, reject
    score INTEGER DEFAULT 0,
    feedback TEXT,
    cloudinary_url TEXT,
    file_size INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (review_id) REFERENCES reviews (id) ON DELETE CASCADE
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reviews_order_number ON reviews(order_number);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at);
CREATE INDEX IF NOT EXISTS idx_images_review_id ON images(review_id);
CREATE INDEX IF NOT EXISTS idx_images_decision ON images(decision);

