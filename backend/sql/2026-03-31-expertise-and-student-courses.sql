-- Run this migration on your MySQL database (for example: ccs113)

USE ccs113;

CREATE TABLE IF NOT EXISTS student_course_assignments (
  student_id varchar(20) NOT NULL,
  subject_code varchar(20) NOT NULL,
  assigned_at timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (student_id, subject_code),
  CONSTRAINT student_course_assignments_ibfk_1 FOREIGN KEY (student_id)
    REFERENCES students (student_id) ON DELETE CASCADE,
  CONSTRAINT student_course_assignments_ibfk_2 FOREIGN KEY (subject_code)
    REFERENCES subjects (subject_code) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS faculty_expertise_certifications (
  cert_id int(11) NOT NULL AUTO_INCREMENT,
  faculty_id varchar(20) NOT NULL,
  expertise varchar(150) NOT NULL,
  certificate_file varchar(255) NOT NULL,
  mime_type varchar(100) DEFAULT 'application/pdf',
  uploaded_at timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (cert_id),
  KEY faculty_id (faculty_id),
  CONSTRAINT faculty_expertise_certifications_ibfk_1 FOREIGN KEY (faculty_id)
    REFERENCES faculty (faculty_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
