-- Seed data for BSIT subjects from provided curriculum images
-- Includes: subjects, faculty (teachers), students, course assignments, and schedules
-- Run this on your MySQL database (default: ccs113)

USE ccs113;

-- 1) SUBJECTS
INSERT INTO subjects (subject_code, subject_name, units, lec_hours, lab_hours, subject_type)
VALUES
  ('ACT101', 'Principles of Accounting', 3, 3, 0, 'GE'),
  ('CCS101', 'Introduction to Computing', 3, 2, 3, 'Core'),
  ('CCS102', 'Computer Programming 1', 3, 2, 3, 'Core'),
  ('CCS103', 'Computer Programming 2', 3, 2, 3, 'Core'),
  ('CCS104', 'Discrete Structures 1', 3, 3, 0, 'Core'),
  ('CCS105', 'Human Computer Interaction 1', 3, 3, 0, 'Professional'),
  ('CCS106', 'Social and Professional Issues', 3, 3, 0, 'GE'),
  ('CCS107', 'Data Structures and Algorithms 1', 3, 2, 3, 'Core'),
  ('CCS108', 'Object-Oriented Programming', 3, 2, 3, 'Professional'),
  ('CCS109', 'System Analysis and Design', 3, 3, 0, 'Professional'),
  ('CCS112', 'Applications Development and Emerging Technologies', 3, 2, 3, 'Professional'),
  ('CCS113', 'Information Assurance and Security', 3, 2, 3, 'Professional'),
  ('COM101', 'Purposive Communication', 3, 3, 0, 'GE'),
  ('ETH101', 'Ethics', 3, 3, 0, 'GE'),
  ('GAD101', 'Gender and Development', 3, 3, 0, 'GE'),
  ('HIS101', 'Readings in Philippine History', 3, 3, 0, 'GE'),
  ('HMN101', 'Art Appreciation', 3, 3, 0, 'GE'),
  ('ITEW1', 'Electronic Commerce', 3, 2, 3, 'Professional'),
  ('ITEW3', 'Server Side Scripting', 3, 2, 3, 'Professional'),
  ('ITEW4', 'Responsive Web Design', 3, 2, 3, 'Professional'),
  ('ITEW6', 'Web Development Frameworks', 3, 2, 3, 'Professional'),
  ('ITP103', 'System Integration and Architecture', 3, 3, 0, 'Professional'),
  ('ITP104', 'Information Management 2', 3, 2, 3, 'Professional'),
  ('ITP105', 'Networking and Communication 2', 3, 2, 3, 'Professional'),
  ('ITP106', 'Human Computer Interaction 2', 3, 3, 0, 'Professional'),
  ('ITP107', 'Mobile Application Development', 3, 2, 3, 'Professional'),
  ('ITP108', 'Capstone Project 1', 3, 3, 0, 'Capstone'),
  ('ITP109', 'Platform Technologies', 3, 2, 3, 'Professional'),
  ('ITP113', 'IT Practicum (500 hours)', 6, 0, 6, 'Practicum'),
  ('MAT101', 'Mathematics in the Modern World', 3, 3, 0, 'GE'),
  ('NSTP1', 'National Service Training Program 1', 3, 3, 0, 'GE'),
  ('NSTP2', 'National Service Training Program 2', 3, 3, 0, 'GE'),
  ('PED101', 'Physical Education 1', 2, 2, 0, 'GE'),
  ('PED102', 'Physical Education 2', 2, 2, 0, 'GE'),
  ('PED103', 'Physical Education 3', 2, 2, 0, 'GE'),
  ('PSY100', 'Understanding the Self', 3, 3, 0, 'GE'),
  ('SOC101', 'The Contemporary World', 3, 3, 0, 'GE'),
  ('STS101', 'Science, Technology and Society', 3, 3, 0, 'GE'),
  ('TEC101', 'Technopreneurship', 3, 3, 0, 'GE')
ON DUPLICATE KEY UPDATE
  subject_name = VALUES(subject_name),
  units = VALUES(units),
  lec_hours = VALUES(lec_hours),
  lab_hours = VALUES(lab_hours),
  subject_type = VALUES(subject_type);

-- 1.1) ACTIVE CURRICULUM + YEAR/SEMESTER/PREREQUISITE MAPPING
INSERT INTO curriculum (program, version, cmo_reference, effectivity_year, is_active, description)
SELECT 'BSIT', '2026', 'CMO-BSIT-2026', 2026, 1, 'BSIT curriculum seeded from provided subject screenshots'
WHERE NOT EXISTS (
  SELECT 1
  FROM curriculum
  WHERE program = 'BSIT' AND version = '2026'
);

UPDATE curriculum
SET is_active = CASE WHEN version = '2026' THEN 1 ELSE is_active END
WHERE program = 'BSIT';

INSERT INTO curriculum_subjects (curriculum_id, subject_code, year_level, semester, prerequisite)
SELECT
  c.curriculum_id,
  seed.subject_code,
  seed.year_level,
  seed.semester,
  seed.prerequisite
FROM (
  SELECT 'CCS101' AS subject_code, 1 AS year_level, '1st' AS semester, NULL AS prerequisite
  UNION ALL SELECT 'CCS102', 1, '1st', NULL
  UNION ALL SELECT 'ETH101', 1, '1st', NULL
  UNION ALL SELECT 'MAT101', 1, '1st', NULL
  UNION ALL SELECT 'NSTP1', 1, '1st', NULL
  UNION ALL SELECT 'PED101', 1, '1st', NULL
  UNION ALL SELECT 'PSY100', 1, '1st', NULL

  UNION ALL SELECT 'CCS103', 1, '2nd', 'CCS102'
  UNION ALL SELECT 'CCS104', 1, '2nd', NULL
  UNION ALL SELECT 'CCS105', 1, '2nd', NULL
  UNION ALL SELECT 'CCS106', 1, '2nd', NULL
  UNION ALL SELECT 'COM101', 1, '2nd', NULL
  UNION ALL SELECT 'GAD101', 1, '2nd', NULL
  UNION ALL SELECT 'NSTP2', 1, '2nd', 'NSTP1'
  UNION ALL SELECT 'PED102', 1, '2nd', 'PED101'

  UNION ALL SELECT 'ACT101', 2, '1st', NULL
  UNION ALL SELECT 'CCS107', 2, '1st', 'CCS103'
  UNION ALL SELECT 'CCS108', 2, '1st', 'CCS103'
  UNION ALL SELECT 'CCS109', 2, '1st', 'CCS108'
  UNION ALL SELECT 'ITEW1', 2, '1st', NULL
  UNION ALL SELECT 'PED103', 2, '1st', 'PED102'
  UNION ALL SELECT 'STS101', 2, '1st', NULL

  UNION ALL SELECT 'HIS101', 2, '2nd', NULL
  UNION ALL SELECT 'ITEW3', 2, '2nd', 'ITEW1'
  UNION ALL SELECT 'ITP103', 2, '2nd', 'CCS109'
  UNION ALL SELECT 'ITP104', 2, '2nd', 'CCS109'
  UNION ALL SELECT 'ITP105', 2, '2nd', 'ITP104'
  UNION ALL SELECT 'ITP106', 2, '2nd', 'CCS105'
  UNION ALL SELECT 'SOC101', 2, '2nd', NULL
  UNION ALL SELECT 'TEC101', 2, '2nd', NULL

  UNION ALL SELECT 'CCS112', 3, '1st', 'CCS109'
  UNION ALL SELECT 'CCS113', 3, '1st', 'ITP105'
  UNION ALL SELECT 'HMN101', 3, '1st', NULL
  UNION ALL SELECT 'ITEW4', 3, '1st', 'ITEW3'
  UNION ALL SELECT 'ITP107', 3, '1st', 'CCS108'
  UNION ALL SELECT 'ITP108', 3, '1st', 'CCS112'
  UNION ALL SELECT 'ITP109', 3, '1st', 'ITP103'

  UNION ALL SELECT 'ITEW6', 4, '1st', 'ITEW4'
  UNION ALL SELECT 'ITP113', 4, '1st', 'ITP108'
) AS seed
INNER JOIN (
  SELECT curriculum_id
  FROM curriculum
  WHERE program = 'BSIT' AND version = '2026'
  ORDER BY curriculum_id DESC
  LIMIT 1
) AS c
WHERE NOT EXISTS (
  SELECT 1
  FROM curriculum_subjects cs
  WHERE cs.curriculum_id = c.curriculum_id
    AND cs.subject_code = seed.subject_code
);

-- 2) FACULTY (TEACHERS)
INSERT INTO faculty (
  faculty_id, first_name, middle_name, last_name, birth_date, age, gender,
  email, contact_no, address, specialization, work_experience_years
)
VALUES
  ('FIT2604001', 'Aira', 'M.', 'Santos', '1988-05-12', 37, 'Female', 'aira.santos.it@ccs.edu.ph', '+639175550001', 'City A', 'Programming and Algorithms', 12),
  ('FIT2604002', 'Mark', 'D.', 'Reyes', '1987-09-03', 38, 'Male', 'mark.reyes.it@ccs.edu.ph', '+639175550002', 'City B', 'Web Development', 13),
  ('FIT2604003', 'Nina', 'L.', 'Flores', '1989-11-24', 36, 'Female', 'nina.flores.it@ccs.edu.ph', '+639175550003', 'City C', 'Systems and Databases', 11),
  ('FIT2604004', 'Allan', 'P.', 'Cruz', '1986-02-18', 40, 'Male', 'allan.cruz.it@ccs.edu.ph', '+639175550004', 'City D', 'Networking and Security', 15),
  ('FIT2604005', 'Claire', 'R.', 'Ramos', '1990-07-09', 35, 'Female', 'claire.ramos.it@ccs.edu.ph', '+639175550005', 'City E', 'HCI and Mobile Development', 10),
  ('FIT2604006', 'Joel', 'T.', 'Bautista', '1985-03-14', 41, 'Male', 'joel.bautista.gened@ccs.edu.ph', '+639175550006', 'City F', 'General Education', 16),
  ('FIT2604007', 'Paolo', 'C.', 'Valdez', '1984-12-05', 41, 'Male', 'paolo.valdez.capstone@ccs.edu.ph', '+639175550007', 'City G', 'Capstone and Emerging Technologies', 17)
ON DUPLICATE KEY UPDATE
  first_name = VALUES(first_name),
  middle_name = VALUES(middle_name),
  last_name = VALUES(last_name),
  birth_date = VALUES(birth_date),
  age = VALUES(age),
  gender = VALUES(gender),
  email = VALUES(email),
  contact_no = VALUES(contact_no),
  address = VALUES(address),
  specialization = VALUES(specialization),
  work_experience_years = VALUES(work_experience_years);

INSERT INTO faculty_employment (faculty_id, employment_status, rank, department_id, date_hired, tenure_status)
VALUES
  ('FIT2604001', 'Full-time', 'Assistant Professor', NULL, '2016-06-01', 'Tenured'),
  ('FIT2604002', 'Full-time', 'Instructor', NULL, '2017-06-01', 'Tenured'),
  ('FIT2604003', 'Full-time', 'Assistant Professor', NULL, '2018-06-01', 'Tenured'),
  ('FIT2604004', 'Full-time', 'Associate Professor', NULL, '2015-06-01', 'Tenured'),
  ('FIT2604005', 'Full-time', 'Instructor', NULL, '2019-06-01', 'Probationary'),
  ('FIT2604006', 'Full-time', 'Instructor', NULL, '2014-06-01', 'Tenured'),
  ('FIT2604007', 'Full-time', 'Associate Professor', NULL, '2013-06-01', 'Tenured')
ON DUPLICATE KEY UPDATE
  employment_status = VALUES(employment_status),
  rank = VALUES(rank),
  department_id = VALUES(department_id),
  date_hired = VALUES(date_hired),
  tenure_status = VALUES(tenure_status);

INSERT INTO users (ref_id, user_type, username, password_hash, is_active)
VALUES
  ('FIT2604001', 'Faculty', 'aira.santos.it@ccs.edu.ph', '$2a$10$9NPVDCsePu1umcpd6qEZi.39g9D9KgOcTM4eosJ5yIKLjawk59nCK', 1),
  ('FIT2604002', 'Faculty', 'mark.reyes.it@ccs.edu.ph', '$2a$10$9NPVDCsePu1umcpd6qEZi.39g9D9KgOcTM4eosJ5yIKLjawk59nCK', 1),
  ('FIT2604003', 'Faculty', 'nina.flores.it@ccs.edu.ph', '$2a$10$9NPVDCsePu1umcpd6qEZi.39g9D9KgOcTM4eosJ5yIKLjawk59nCK', 1),
  ('FIT2604004', 'Faculty', 'allan.cruz.it@ccs.edu.ph', '$2a$10$9NPVDCsePu1umcpd6qEZi.39g9D9KgOcTM4eosJ5yIKLjawk59nCK', 1),
  ('FIT2604005', 'Faculty', 'claire.ramos.it@ccs.edu.ph', '$2a$10$9NPVDCsePu1umcpd6qEZi.39g9D9KgOcTM4eosJ5yIKLjawk59nCK', 1),
  ('FIT2604006', 'Faculty', 'joel.bautista.gened@ccs.edu.ph', '$2a$10$9NPVDCsePu1umcpd6qEZi.39g9D9KgOcTM4eosJ5yIKLjawk59nCK', 1),
  ('FIT2604007', 'Faculty', 'paolo.valdez.capstone@ccs.edu.ph', '$2a$10$9NPVDCsePu1umcpd6qEZi.39g9D9KgOcTM4eosJ5yIKLjawk59nCK', 1)
ON DUPLICATE KEY UPDATE
  user_type = VALUES(user_type),
  username = VALUES(username),
  password_hash = VALUES(password_hash),
  is_active = 1;

-- 3) STUDENTS
INSERT INTO students (
  student_id, first_name, middle_name, last_name, birth_date, sex, civil_status,
  contact_number, email, password, address, emergency_contact, emergency_contact_num,
  nationality, religion, skills
)
VALUES
  ('IT26-1A-0001', 'Liam', 'A.', 'Navarro', '2007-02-15', 'Male', 'Single', '+639181110001', 'liam.navarro@student.ccs.edu.ph', 'N2007-02-15', 'City A', 'Mia Navarro', '+639171110001', 'Filipino', 'Roman Catholic', 'Python, Java'),
  ('IT26-2A-0001', 'Ella', 'B.', 'Santos', '2006-08-22', 'Female', 'Single', '+639181110002', 'ella.santos@student.ccs.edu.ph', 'S2006-08-22', 'City B', 'Rico Santos', '+639171110002', 'Filipino', 'Christian', 'Web Development, SQL'),
  ('IT26-3A-0001', 'Noah', 'C.', 'DelaCruz', '2005-11-03', 'Male', 'Single', '+639181110003', 'noah.delacruz@student.ccs.edu.ph', 'D2005-11-03', 'City C', 'Ana DelaCruz', '+639171110003', 'Filipino', 'Roman Catholic', 'Mobile Development, Networking'),
  ('IT26-4A-0001', 'Mia', 'D.', 'Castillo', '2004-04-21', 'Female', 'Single', '+639181110004', 'mia.castillo@student.ccs.edu.ph', 'C2004-04-21', 'City D', 'Joel Castillo', '+639171110004', 'Filipino', 'Roman Catholic', 'Frameworks, DevOps')
ON DUPLICATE KEY UPDATE
  first_name = VALUES(first_name),
  middle_name = VALUES(middle_name),
  last_name = VALUES(last_name),
  birth_date = VALUES(birth_date),
  sex = VALUES(sex),
  civil_status = VALUES(civil_status),
  contact_number = VALUES(contact_number),
  email = VALUES(email),
  password = VALUES(password),
  address = VALUES(address),
  emergency_contact = VALUES(emergency_contact),
  emergency_contact_num = VALUES(emergency_contact_num),
  nationality = VALUES(nationality),
  religion = VALUES(religion),
  skills = VALUES(skills);

INSERT INTO student_academic (
  student_id, program, major, track, year_level, section,
  admission_type, enrollment_status, scholarship_type, admission_date
)
VALUES
  ('IT26-1A-0001', 'BSIT', NULL, 'Web and Mobile', 1, 'IT-1A', 'Regular', 'Enrolled', NULL, '2026-08-01'),
  ('IT26-2A-0001', 'BSIT', NULL, 'Systems and Networking', 2, 'IT-2A', 'Regular', 'Enrolled', NULL, '2025-08-01'),
  ('IT26-3A-0001', 'BSIT', NULL, 'Systems and Networking', 3, 'IT-3A', 'Regular', 'Enrolled', 'Academic', '2024-08-01'),
  ('IT26-4A-0001', 'BSIT', NULL, 'Web and Mobile', 4, 'IT-4A', 'Regular', 'Enrolled', NULL, '2023-08-01')
ON DUPLICATE KEY UPDATE
  program = VALUES(program),
  major = VALUES(major),
  track = VALUES(track),
  year_level = VALUES(year_level),
  section = VALUES(section),
  admission_type = VALUES(admission_type),
  enrollment_status = VALUES(enrollment_status),
  scholarship_type = VALUES(scholarship_type),
  admission_date = VALUES(admission_date);

INSERT INTO users (ref_id, user_type, username, password_hash, is_active)
VALUES
  ('IT26-1A-0001', 'Student', 'liam.navarro@student.ccs.edu.ph', '$2a$10$9NPVDCsePu1umcpd6qEZi.39g9D9KgOcTM4eosJ5yIKLjawk59nCK', 1),
  ('IT26-2A-0001', 'Student', 'ella.santos@student.ccs.edu.ph', '$2a$10$9NPVDCsePu1umcpd6qEZi.39g9D9KgOcTM4eosJ5yIKLjawk59nCK', 1),
  ('IT26-3A-0001', 'Student', 'noah.delacruz@student.ccs.edu.ph', '$2a$10$9NPVDCsePu1umcpd6qEZi.39g9D9KgOcTM4eosJ5yIKLjawk59nCK', 1),
  ('IT26-4A-0001', 'Student', 'mia.castillo@student.ccs.edu.ph', '$2a$10$9NPVDCsePu1umcpd6qEZi.39g9D9KgOcTM4eosJ5yIKLjawk59nCK', 1)
ON DUPLICATE KEY UPDATE
  user_type = VALUES(user_type),
  username = VALUES(username),
  password_hash = VALUES(password_hash),
  is_active = 1;

-- 4) STUDENT-COURSE ASSIGNMENTS
INSERT IGNORE INTO student_course_assignments (student_id, subject_code)
VALUES
  ('IT26-1A-0001', 'CCS101'),
  ('IT26-1A-0001', 'CCS102'),
  ('IT26-1A-0001', 'ETH101'),
  ('IT26-1A-0001', 'MAT101'),
  ('IT26-1A-0001', 'NSTP1'),
  ('IT26-1A-0001', 'PED101'),
  ('IT26-1A-0001', 'PSY100'),
  ('IT26-1A-0001', 'CCS103'),
  ('IT26-1A-0001', 'CCS104'),
  ('IT26-1A-0001', 'CCS105'),
  ('IT26-1A-0001', 'CCS106'),
  ('IT26-1A-0001', 'COM101'),
  ('IT26-1A-0001', 'GAD101'),
  ('IT26-1A-0001', 'NSTP2'),
  ('IT26-1A-0001', 'PED102'),

  ('IT26-2A-0001', 'ACT101'),
  ('IT26-2A-0001', 'CCS107'),
  ('IT26-2A-0001', 'CCS108'),
  ('IT26-2A-0001', 'CCS109'),
  ('IT26-2A-0001', 'ITEW1'),
  ('IT26-2A-0001', 'PED103'),
  ('IT26-2A-0001', 'STS101'),
  ('IT26-2A-0001', 'HIS101'),
  ('IT26-2A-0001', 'ITEW3'),
  ('IT26-2A-0001', 'ITP103'),
  ('IT26-2A-0001', 'ITP104'),
  ('IT26-2A-0001', 'ITP105'),
  ('IT26-2A-0001', 'ITP106'),
  ('IT26-2A-0001', 'SOC101'),
  ('IT26-2A-0001', 'TEC101'),

  ('IT26-3A-0001', 'CCS112'),
  ('IT26-3A-0001', 'CCS113'),
  ('IT26-3A-0001', 'HMN101'),
  ('IT26-3A-0001', 'ITEW4'),
  ('IT26-3A-0001', 'ITP107'),
  ('IT26-3A-0001', 'ITP108'),
  ('IT26-3A-0001', 'ITP109'),

  ('IT26-4A-0001', 'ITEW6'),
  ('IT26-4A-0001', 'ITP113');

-- 5) SCHEDULES WITH TEACHER ASSIGNMENTS
INSERT INTO schedules (
  subject_code, section, faculty_id, room_id, semester, academic_year, day_of_week, start_time, end_time, schedule_type
)
SELECT
  seed.subject_code,
  seed.section,
  seed.faculty_id,
  NULL,
  seed.semester,
  seed.academic_year,
  seed.day_of_week,
  seed.start_time,
  seed.end_time,
  seed.schedule_type
FROM (
  SELECT 'CCS101' AS subject_code, 'IT-1A' AS section, 'FIT2604001' AS faculty_id, '1st' AS semester, '2026-2027' AS academic_year, 'Monday' AS day_of_week, '08:00:00' AS start_time, '10:00:00' AS end_time, 'Lecture' AS schedule_type
  UNION ALL SELECT 'CCS102', 'IT-1A', 'FIT2604001', '1st', '2026-2027', 'Monday', '10:00:00', '12:00:00', 'Laboratory'
  UNION ALL SELECT 'ETH101', 'IT-1A', 'FIT2604006', '1st', '2026-2027', 'Tuesday', '08:00:00', '10:00:00', 'Lecture'
  UNION ALL SELECT 'MAT101', 'IT-1A', 'FIT2604006', '1st', '2026-2027', 'Tuesday', '10:00:00', '12:00:00', 'Lecture'
  UNION ALL SELECT 'NSTP1', 'IT-1A', 'FIT2604006', '1st', '2026-2027', 'Saturday', '08:00:00', '11:00:00', 'Lecture'
  UNION ALL SELECT 'PED101', 'IT-1A', 'FIT2604006', '1st', '2026-2027', 'Thursday', '13:00:00', '15:00:00', 'Lecture'
  UNION ALL SELECT 'PSY100', 'IT-1A', 'FIT2604006', '1st', '2026-2027', 'Wednesday', '08:00:00', '10:00:00', 'Lecture'

  UNION ALL SELECT 'CCS103', 'IT-1A', 'FIT2604001', '2nd', '2026-2027', 'Monday', '13:00:00', '15:00:00', 'Laboratory'
  UNION ALL SELECT 'CCS104', 'IT-1A', 'FIT2604003', '2nd', '2026-2027', 'Tuesday', '13:00:00', '15:00:00', 'Lecture'
  UNION ALL SELECT 'CCS105', 'IT-1A', 'FIT2604005', '2nd', '2026-2027', 'Wednesday', '10:00:00', '12:00:00', 'Lecture'
  UNION ALL SELECT 'CCS106', 'IT-1A', 'FIT2604006', '2nd', '2026-2027', 'Thursday', '10:00:00', '12:00:00', 'Lecture'
  UNION ALL SELECT 'COM101', 'IT-1A', 'FIT2604006', '2nd', '2026-2027', 'Friday', '08:00:00', '10:00:00', 'Lecture'
  UNION ALL SELECT 'GAD101', 'IT-1A', 'FIT2604006', '2nd', '2026-2027', 'Friday', '10:00:00', '12:00:00', 'Lecture'
  UNION ALL SELECT 'NSTP2', 'IT-1A', 'FIT2604006', '2nd', '2026-2027', 'Saturday', '13:00:00', '16:00:00', 'Lecture'
  UNION ALL SELECT 'PED102', 'IT-1A', 'FIT2604006', '2nd', '2026-2027', 'Thursday', '15:00:00', '17:00:00', 'Lecture'

  UNION ALL SELECT 'ACT101', 'IT-2A', 'FIT2604006', '1st', '2027-2028', 'Monday', '08:00:00', '10:00:00', 'Lecture'
  UNION ALL SELECT 'CCS107', 'IT-2A', 'FIT2604001', '1st', '2027-2028', 'Monday', '10:00:00', '12:00:00', 'Laboratory'
  UNION ALL SELECT 'CCS108', 'IT-2A', 'FIT2604001', '1st', '2027-2028', 'Tuesday', '08:00:00', '10:00:00', 'Laboratory'
  UNION ALL SELECT 'CCS109', 'IT-2A', 'FIT2604003', '1st', '2027-2028', 'Tuesday', '10:00:00', '12:00:00', 'Lecture'
  UNION ALL SELECT 'ITEW1', 'IT-2A', 'FIT2604002', '1st', '2027-2028', 'Wednesday', '08:00:00', '10:00:00', 'Laboratory'
  UNION ALL SELECT 'PED103', 'IT-2A', 'FIT2604006', '1st', '2027-2028', 'Thursday', '13:00:00', '15:00:00', 'Lecture'
  UNION ALL SELECT 'STS101', 'IT-2A', 'FIT2604006', '1st', '2027-2028', 'Friday', '08:00:00', '10:00:00', 'Lecture'

  UNION ALL SELECT 'HIS101', 'IT-2A', 'FIT2604006', '2nd', '2027-2028', 'Monday', '13:00:00', '15:00:00', 'Lecture'
  UNION ALL SELECT 'ITEW3', 'IT-2A', 'FIT2604002', '2nd', '2027-2028', 'Wednesday', '10:00:00', '12:00:00', 'Laboratory'
  UNION ALL SELECT 'ITP103', 'IT-2A', 'FIT2604003', '2nd', '2027-2028', 'Tuesday', '13:00:00', '15:00:00', 'Lecture'
  UNION ALL SELECT 'ITP104', 'IT-2A', 'FIT2604003', '2nd', '2027-2028', 'Thursday', '10:00:00', '12:00:00', 'Laboratory'
  UNION ALL SELECT 'ITP105', 'IT-2A', 'FIT2604004', '2nd', '2027-2028', 'Friday', '10:00:00', '12:00:00', 'Laboratory'
  UNION ALL SELECT 'ITP106', 'IT-2A', 'FIT2604005', '2nd', '2027-2028', 'Wednesday', '13:00:00', '15:00:00', 'Lecture'
  UNION ALL SELECT 'SOC101', 'IT-2A', 'FIT2604006', '2nd', '2027-2028', 'Thursday', '08:00:00', '10:00:00', 'Lecture'
  UNION ALL SELECT 'TEC101', 'IT-2A', 'FIT2604006', '2nd', '2027-2028', 'Friday', '13:00:00', '15:00:00', 'Lecture'

  UNION ALL SELECT 'CCS112', 'IT-3A', 'FIT2604007', '1st', '2028-2029', 'Monday', '08:00:00', '10:00:00', 'Laboratory'
  UNION ALL SELECT 'CCS113', 'IT-3A', 'FIT2604004', '1st', '2028-2029', 'Tuesday', '08:00:00', '10:00:00', 'Laboratory'
  UNION ALL SELECT 'HMN101', 'IT-3A', 'FIT2604006', '1st', '2028-2029', 'Wednesday', '08:00:00', '10:00:00', 'Lecture'
  UNION ALL SELECT 'ITEW4', 'IT-3A', 'FIT2604002', '1st', '2028-2029', 'Thursday', '08:00:00', '10:00:00', 'Laboratory'
  UNION ALL SELECT 'ITP107', 'IT-3A', 'FIT2604005', '1st', '2028-2029', 'Friday', '08:00:00', '10:00:00', 'Laboratory'
  UNION ALL SELECT 'ITP108', 'IT-3A', 'FIT2604007', '1st', '2028-2029', 'Saturday', '08:00:00', '11:00:00', 'Lecture'
  UNION ALL SELECT 'ITP109', 'IT-3A', 'FIT2604004', '1st', '2028-2029', 'Friday', '10:00:00', '12:00:00', 'Laboratory'

  UNION ALL SELECT 'ITEW6', 'IT-4A', 'FIT2604002', '1st', '2029-2030', 'Monday', '08:00:00', '10:00:00', 'Laboratory'
  UNION ALL SELECT 'ITP113', 'IT-4A', 'FIT2604007', '1st', '2029-2030', 'Tuesday', '08:00:00', '12:00:00', 'Laboratory'
) AS seed
WHERE NOT EXISTS (
  SELECT 1
  FROM schedules s
  WHERE s.subject_code = seed.subject_code
    AND s.section = seed.section
    AND s.faculty_id = seed.faculty_id
    AND s.semester = seed.semester
    AND s.academic_year = seed.academic_year
    AND s.day_of_week = seed.day_of_week
    AND s.start_time = seed.start_time
    AND s.end_time = seed.end_time
);
