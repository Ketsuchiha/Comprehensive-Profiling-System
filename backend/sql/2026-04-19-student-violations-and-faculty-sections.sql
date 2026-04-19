-- Run this migration on your MySQL database (default: ccs113)

USE ccs113;

ALTER TABLE faculty_employment
  ADD COLUMN IF NOT EXISTS assigned_section varchar(20) DEFAULT NULL AFTER department_id;

CREATE TABLE IF NOT EXISTS student_violations (
  violation_id int(11) NOT NULL AUTO_INCREMENT,
  student_id varchar(20) NOT NULL,
  violation_type varchar(120) NOT NULL,
  subject_context varchar(120) DEFAULT NULL,
  description text DEFAULT NULL,
  severity enum('Minor','Warning','Serious','Major') DEFAULT 'Warning',
  status enum('Active','Resolved','Dismissed') DEFAULT 'Active',
  incident_date date NOT NULL,
  reported_by varchar(100) DEFAULT NULL,
  created_at timestamp NOT NULL DEFAULT current_timestamp(),
  updated_at timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (violation_id),
  KEY student_id (student_id),
  KEY status (status),
  KEY incident_date (incident_date),
  CONSTRAINT student_violations_ibfk_1 FOREIGN KEY (student_id)
    REFERENCES students (student_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
