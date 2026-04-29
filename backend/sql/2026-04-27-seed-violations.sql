-- Seed Student Violations Test Data
-- This script inserts sample violation records for testing the violation management system

-- Insert sample violations with different statuses and severities
-- Format: (student_id, violation_type, subject_context, description, severity, status, incident_date, reported_by_name)

INSERT INTO student_violations (student_id, violation_type, subject_context, description, severity, status, incident_date, reported_by_name) VALUES
-- Active violations
('CS-2024-001', 'Attendance', 'CCS113 - Object Oriented Programming', 'Absent for 3 consecutive sessions without notice', 'Minor', 'Active', '2026-04-20 10:00:00', 'Dr. Maria Santos'),
('CS-2024-002', 'Cheating', 'CCS113 - Object Oriented Programming', 'Suspected plagiarism on midterm exam. Similar code structure to student CS-2024-003', 'Serious', 'Active', '2026-04-19 14:30:00', 'Prof. John Cruz'),
('CS-2024-003', 'Late Submission', 'CCS113 - Object Oriented Programming', 'Project submission 5 days late without valid reason', 'Minor', 'Active', '2026-04-21 09:15:00', 'Dr. Maria Santos'),
('IT-2024-005', 'Disruptive Behavior', 'IT 401 - Systems Administration', 'Interrupting lectures and arguing with instructor', 'Warning', 'Active', '2026-04-18 11:45:00', 'Prof. Robert Lee'),
('CS-2024-010', 'Academic Dishonesty', 'CCS113 - Object Oriented Programming', 'Unauthorized collaboration on individual assignment', 'Major', 'Active', '2026-04-22 08:30:00', 'Dr. Maria Santos'),

-- Resolved violations
('CS-2024-004', 'Attendance', 'CCS113 - Object Oriented Programming', 'Absent for 2 sessions. Student provided medical certificate.', 'Minor', 'Resolved', '2026-04-15 10:00:00', 'Dr. Maria Santos'),
('IT-2024-006', 'Late Submission', 'IT 301 - Database Design', 'Assignment submitted 2 days late. Extension was granted.', 'Minor', 'Resolved', '2026-04-16 15:20:00', 'Prof. Sarah Wilson'),
('CS-2024-007', 'Improper Conduct', 'CCS113 - Object Oriented Programming', 'Disrespectful language during class discussion. Student apologized.', 'Warning', 'Resolved', '2026-04-14 13:00:00', 'Dr. Maria Santos'),

-- Dismissed violations
('IT-2024-008', 'Attendance', 'IT 205 - Network Basics', 'Flagged as absent but was present - system error', 'Minor', 'Dismissed', '2026-04-17 10:00:00', 'System Admin'),
('CS-2024-009', 'Code Quality', 'CCS113 - Object Oriented Programming', 'Initial concern about naming conventions resolved after code review', 'Minor', 'Dismissed', '2026-04-12 16:45:00', 'Dr. Maria Santos'),

-- Additional recent violations for comprehensive testing
('CS-2024-011', 'Incomplete Assignment', 'CCS113 - Object Oriented Programming', 'Submitted incomplete project without explanation', 'Warning', 'Active', '2026-04-23 11:00:00', 'Dr. Maria Santos'),
('IT-2024-012', 'Attendance', 'IT 401 - Systems Administration', 'Absent from practical session', 'Minor', 'Active', '2026-04-24 09:30:00', 'Prof. Robert Lee'),
('CS-2024-013', 'Plagiarism', 'CCS113 - Object Oriented Programming', 'Portion of code found in online repository', 'Serious', 'Resolved', '2026-04-13 14:00:00', 'Prof. John Cruz'),
('IT-2024-014', 'Disruptive Behavior', 'IT 301 - Database Design', 'Excessive phone usage during class', 'Minor', 'Dismissed', '2026-04-11 10:15:00', 'Prof. Sarah Wilson'),
('CS-2024-015', 'Missed Deadline', 'CCS113 - Object Oriented Programming', 'Final project not submitted by deadline', 'Major', 'Active', '2026-04-25 23:59:00', 'Dr. Maria Santos'),
('IT-2024-016', 'Cheating', 'IT 205 - Network Basics', 'Copying answers from peer during quiz', 'Serious', 'Resolved', '2026-04-10 10:30:00', 'Prof. Andrew Martinez'),
('CS-2024-017', 'Attendance', 'CCS113 - Object Oriented Programming', 'Skipped class on exam day', 'Major', 'Active', '2026-04-26 09:00:00', 'Dr. Maria Santos'),
('IT-2024-018', 'Late Submission', 'IT 401 - Systems Administration', 'Lab report submitted 1 week late', 'Minor', 'Resolved', '2026-04-09 17:30:00', 'Prof. Robert Lee');
