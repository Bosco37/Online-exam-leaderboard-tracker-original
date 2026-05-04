CREATE DATABASE IF NOT EXISTS leaderboard_db;
USE leaderboard_db;

CREATE TABLE IF NOT EXISTS scores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_name VARCHAR(100) NOT NULL,
    exam_name VARCHAR(100) NOT NULL,
    score INT NOT NULL,
    exam_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert some dummy data to see the leaderboard immediately!
INSERT INTO scores (student_name, exam_name, score) VALUES 
('Alice Smith', 'Python Basics', 95),
('Bob Johnson', 'Computer Networks', 88),
('Charlie Brown', 'Data Structures', 92);
