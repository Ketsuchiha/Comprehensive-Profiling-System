-- CCS Comprehensive Profiling System Database Schema
-- Database: ccs113
-- Compatible with MySQL/MariaDB

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS `ccs113` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `ccs113`;

-- --------------------------------------------------------
-- Table structure for table `departments`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `departments` (
  `dept_id` int(11) NOT NULL AUTO_INCREMENT,
  `dept_name` varchar(100) NOT NULL,
  PRIMARY KEY (`dept_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for table `subjects`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `subjects` (
  `subject_code` varchar(20) NOT NULL,
  `subject_name` varchar(150) NOT NULL,
  `units` int(11) NOT NULL DEFAULT 3,
  `lec_hours` int(11) DEFAULT 3,
  `lab_hours` int(11) DEFAULT 0,
  `subject_type` enum('GE','Core','Professional','Elective','Practicum','Capstone') DEFAULT 'Professional',
  PRIMARY KEY (`subject_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for table `curriculum`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `curriculum` (
  `curriculum_id` int(11) NOT NULL AUTO_INCREMENT,
  `program` varchar(100) NOT NULL,
  `version` varchar(20) NOT NULL,
  `cmo_reference` varchar(100) DEFAULT NULL,
  `effectivity_year` year(4) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `description` text DEFAULT NULL,
  PRIMARY KEY (`curriculum_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for table `curriculum_subjects`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `curriculum_subjects` (
  `cs_id` int(11) NOT NULL AUTO_INCREMENT,
  `curriculum_id` int(11) DEFAULT NULL,
  `subject_code` varchar(20) DEFAULT NULL,
  `year_level` int(11) DEFAULT NULL,
  `semester` enum('1st','2nd','Summer') DEFAULT NULL,
  `prerequisite` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`cs_id`),
  KEY `curriculum_id` (`curriculum_id`),
  KEY `subject_code` (`subject_code`),
  CONSTRAINT `curriculum_subjects_ibfk_1` FOREIGN KEY (`curriculum_id`) REFERENCES `curriculum` (`curriculum_id`),
  CONSTRAINT `curriculum_subjects_ibfk_2` FOREIGN KEY (`subject_code`) REFERENCES `subjects` (`subject_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for table `students`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `students` (
  `student_id` varchar(20) NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `middle_name` varchar(50) DEFAULT NULL,
  `last_name` varchar(50) NOT NULL,
  `birth_date` date NOT NULL,
  `sex` varchar(10) NOT NULL,
  `civil_status` varchar(20) DEFAULT NULL,
  `contact_number` varchar(15) NOT NULL,
  `email` varchar(100) NOT NULL,
  `address` text NOT NULL,
  `emergency_contact` varchar(100) NOT NULL,
  `emergency_contact_num` varchar(15) NOT NULL,
  `profile_photo` varchar(255) DEFAULT NULL,
  `nationality` varchar(50) DEFAULT NULL,
  `religion` varchar(50) DEFAULT NULL,
  `skills` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`student_id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for table `student_academic`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `student_academic` (
  `student_id` varchar(20) NOT NULL,
  `program` varchar(100) DEFAULT NULL,
  `major` varchar(100) DEFAULT NULL,
  `track` varchar(100) DEFAULT NULL,
  `year_level` int(11) DEFAULT NULL,
  `section` varchar(20) DEFAULT NULL,
  `admission_type` varchar(30) DEFAULT NULL,
  `enrollment_status` varchar(30) DEFAULT NULL,
  `scholarship_type` varchar(100) DEFAULT NULL,
  `admission_date` date DEFAULT NULL,
  PRIMARY KEY (`student_id`),
  CONSTRAINT `student_academic_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for table `student_course_assignments`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `student_course_assignments` (
  `student_id` varchar(20) NOT NULL,
  `subject_code` varchar(20) NOT NULL,
  `assigned_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`student_id`, `subject_code`),
  KEY `subject_code` (`subject_code`),
  CONSTRAINT `student_course_assignments_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE,
  CONSTRAINT `student_course_assignments_ibfk_2` FOREIGN KEY (`subject_code`) REFERENCES `subjects` (`subject_code`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for table `student_documents`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `student_documents` (
  `doc_id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` varchar(20) DEFAULT NULL,
  `doc_type` varchar(100) DEFAULT NULL,
  `file_path` varchar(255) DEFAULT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`doc_id`),
  KEY `student_id` (`student_id`),
  CONSTRAINT `student_documents_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for table `student_grades`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `student_grades` (
  `grade_id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` varchar(20) DEFAULT NULL,
  `subject_code` varchar(20) DEFAULT NULL,
  `semester` enum('1st','2nd','Summer') DEFAULT NULL,
  `academic_year` varchar(9) DEFAULT NULL,
  `midterm_grade` decimal(5,2) DEFAULT NULL,
  `final_grade` decimal(5,2) DEFAULT NULL,
  `gpa` decimal(5,2) DEFAULT NULL,
  `remarks` enum('Passed','Failed','Incomplete','Dropped') DEFAULT 'Passed',
  PRIMARY KEY (`grade_id`),
  KEY `student_id` (`student_id`),
  KEY `subject_code` (`subject_code`),
  CONSTRAINT `student_grades_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`),
  CONSTRAINT `student_grades_ibfk_2` FOREIGN KEY (`subject_code`) REFERENCES `subjects` (`subject_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for table `student_internship`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `student_internship` (
  `internship_id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` varchar(20) DEFAULT NULL,
  `company_name` varchar(150) DEFAULT NULL,
  `supervisor` varchar(100) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `hours_rendered` int(11) DEFAULT NULL,
  `eval_grade` decimal(5,2) DEFAULT NULL,
  PRIMARY KEY (`internship_id`),
  KEY `student_id` (`student_id`),
  CONSTRAINT `student_internship_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for table `student_orgs`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `student_orgs` (
  `org_id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` varchar(20) DEFAULT NULL,
  `organization_name` varchar(100) DEFAULT NULL,
  `position` varchar(50) DEFAULT NULL,
  `academic_year` varchar(9) DEFAULT NULL,
  PRIMARY KEY (`org_id`),
  KEY `student_id` (`student_id`),
  CONSTRAINT `student_orgs_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for table `faculty`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `faculty` (
  `faculty_id` varchar(20) NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `middle_name` varchar(50) DEFAULT NULL,
  `last_name` varchar(50) NOT NULL,
  `birth_date` date NOT NULL,
  `age` int(11) DEFAULT NULL,
  `gender` varchar(10) NOT NULL,
  `email` varchar(100) NOT NULL,
  `contact_no` varchar(15) NOT NULL,
  `address` text NOT NULL,
  `profile_photo` varchar(255) DEFAULT NULL,
  `specialization` varchar(150) DEFAULT NULL,
  `work_experience_years` int(11) DEFAULT NULL,
  `expertise_certificate_path` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`faculty_id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for table `faculty_expertise_certifications`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `faculty_expertise_certifications` (
  `cert_id` int(11) NOT NULL AUTO_INCREMENT,
  `faculty_id` varchar(20) NOT NULL,
  `expertise` varchar(150) NOT NULL,
  `certificate_file` varchar(255) NOT NULL,
  `mime_type` varchar(100) DEFAULT 'application/pdf',
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`cert_id`),
  KEY `faculty_id` (`faculty_id`),
  CONSTRAINT `faculty_expertise_certifications_ibfk_1` FOREIGN KEY (`faculty_id`) REFERENCES `faculty` (`faculty_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for table `faculty_education`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `faculty_education` (
  `edu_id` int(11) NOT NULL AUTO_INCREMENT,
  `faculty_id` varchar(20) DEFAULT NULL,
  `degree` varchar(100) DEFAULT NULL,
  `institution` varchar(150) DEFAULT NULL,
  `year_graduated` year(4) DEFAULT NULL,
  PRIMARY KEY (`edu_id`),
  KEY `faculty_id` (`faculty_id`),
  CONSTRAINT `faculty_education_ibfk_1` FOREIGN KEY (`faculty_id`) REFERENCES `faculty` (`faculty_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for table `faculty_employment`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `faculty_employment` (
  `faculty_id` varchar(20) NOT NULL,
  `employment_status` enum('Full-time','Part-time','Contractual') DEFAULT NULL,
  `rank` varchar(50) DEFAULT NULL,
  `department_id` int(11) DEFAULT NULL,
  `date_hired` date DEFAULT NULL,
  `tenure_status` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`faculty_id`),
  KEY `department_id` (`department_id`),
  CONSTRAINT `faculty_employment_ibfk_1` FOREIGN KEY (`faculty_id`) REFERENCES `faculty` (`faculty_id`),
  CONSTRAINT `faculty_employment_ibfk_2` FOREIGN KEY (`department_id`) REFERENCES `departments` (`dept_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for table `faculty_evaluation`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `faculty_evaluation` (
  `eval_id` int(11) NOT NULL AUTO_INCREMENT,
  `faculty_id` varchar(20) DEFAULT NULL,
  `semester` varchar(20) DEFAULT NULL,
  `academic_year` varchar(9) DEFAULT NULL,
  `student_eval_score` decimal(5,2) DEFAULT NULL,
  `peer_eval_score` decimal(5,2) DEFAULT NULL,
  `self_eval_score` decimal(5,2) DEFAULT NULL,
  `overall_rating` decimal(5,2) DEFAULT NULL,
  PRIMARY KEY (`eval_id`),
  KEY `faculty_id` (`faculty_id`),
  CONSTRAINT `faculty_evaluation_ibfk_1` FOREIGN KEY (`faculty_id`) REFERENCES `faculty` (`faculty_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for table `faculty_load`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `faculty_load` (
  `load_id` int(11) NOT NULL AUTO_INCREMENT,
  `faculty_id` varchar(20) DEFAULT NULL,
  `subject_code` varchar(20) DEFAULT NULL,
  `section` varchar(20) DEFAULT NULL,
  `semester` varchar(20) DEFAULT NULL,
  `academic_year` varchar(9) DEFAULT NULL,
  `teaching_units` int(11) DEFAULT NULL,
  PRIMARY KEY (`load_id`),
  KEY `faculty_id` (`faculty_id`),
  KEY `subject_code` (`subject_code`),
  CONSTRAINT `faculty_load_ibfk_1` FOREIGN KEY (`faculty_id`) REFERENCES `faculty` (`faculty_id`),
  CONSTRAINT `faculty_load_ibfk_2` FOREIGN KEY (`subject_code`) REFERENCES `subjects` (`subject_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for table `faculty_research`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `faculty_research` (
  `research_id` int(11) NOT NULL AUTO_INCREMENT,
  `faculty_id` varchar(20) DEFAULT NULL,
  `research_title` varchar(200) DEFAULT NULL,
  `publication_type` enum('Journal','Conference','Book') DEFAULT NULL,
  `year_published` year(4) DEFAULT NULL,
  `status` enum('Ongoing','Published','Presented') DEFAULT 'Ongoing',
  PRIMARY KEY (`research_id`),
  KEY `faculty_id` (`faculty_id`),
  CONSTRAINT `faculty_research_ibfk_1` FOREIGN KEY (`faculty_id`) REFERENCES `faculty` (`faculty_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for table `events`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `events` (
  `event_id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `event_type` enum('Academic','Seminar','Sports','Cultural','Organizational','Other') DEFAULT 'Academic',
  `venue` varchar(200) DEFAULT NULL,
  `start_date` datetime NOT NULL,
  `end_date` datetime NOT NULL,
  `organizer` varchar(150) DEFAULT NULL,
  `is_mandatory` tinyint(1) DEFAULT 0,
  `created_by` varchar(20) DEFAULT NULL,
  `status` enum('Upcoming','Ongoing','Completed','Cancelled') DEFAULT 'Upcoming',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`event_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for table `event_participants`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `event_participants` (
  `participation_id` int(11) NOT NULL AUTO_INCREMENT,
  `event_id` int(11) DEFAULT NULL,
  `participant_id` varchar(20) DEFAULT NULL,
  `participant_type` enum('Student','Faculty') DEFAULT NULL,
  `attendance` enum('Registered','Attended','Absent') DEFAULT 'Registered',
  PRIMARY KEY (`participation_id`),
  KEY `event_id` (`event_id`),
  CONSTRAINT `event_participants_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `events` (`event_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for table `rooms`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `rooms` (
  `room_id` int(11) NOT NULL AUTO_INCREMENT,
  `room_name` varchar(50) NOT NULL,
  `building` varchar(100) DEFAULT NULL,
  `capacity` int(11) DEFAULT NULL,
  `room_type` enum('Lecture','Laboratory','Seminar','Both') DEFAULT 'Lecture',
  PRIMARY KEY (`room_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for table `schedules`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `schedules` (
  `schedule_id` int(11) NOT NULL AUTO_INCREMENT,
  `subject_code` varchar(20) DEFAULT NULL,
  `section` varchar(20) DEFAULT NULL,
  `faculty_id` varchar(20) DEFAULT NULL,
  `room_id` int(11) DEFAULT NULL,
  `semester` enum('1st','2nd','Summer') DEFAULT NULL,
  `academic_year` varchar(9) DEFAULT NULL,
  `day_of_week` set('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday') DEFAULT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `schedule_type` enum('Lecture','Laboratory') DEFAULT 'Lecture',
  PRIMARY KEY (`schedule_id`),
  KEY `subject_code` (`subject_code`),
  KEY `faculty_id` (`faculty_id`),
  KEY `room_id` (`room_id`),
  CONSTRAINT `schedules_ibfk_1` FOREIGN KEY (`subject_code`) REFERENCES `subjects` (`subject_code`),
  CONSTRAINT `schedules_ibfk_2` FOREIGN KEY (`faculty_id`) REFERENCES `faculty` (`faculty_id`),
  CONSTRAINT `schedules_ibfk_3` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`room_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for table `research_projects`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `research_projects` (
  `project_id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(250) NOT NULL,
  `abstract` text DEFAULT NULL,
  `research_type` enum('Thesis','Capstone','Faculty Research','Institutional') DEFAULT 'Capstone',
  `status` enum('Proposal','Ongoing','Completed','Published') DEFAULT 'Proposal',
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `funding_source` varchar(150) DEFAULT NULL,
  `budget` decimal(12,2) DEFAULT NULL,
  `department_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`project_id`),
  KEY `department_id` (`department_id`),
  CONSTRAINT `research_projects_ibfk_1` FOREIGN KEY (`department_id`) REFERENCES `departments` (`dept_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for table `research_members`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `research_members` (
  `member_id` int(11) NOT NULL AUTO_INCREMENT,
  `project_id` int(11) DEFAULT NULL,
  `member_ref` varchar(20) DEFAULT NULL,
  `member_type` enum('Student','Faculty') DEFAULT NULL,
  `role` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`member_id`),
  KEY `project_id` (`project_id`),
  CONSTRAINT `research_members_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `research_projects` (`project_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for table `research_documents`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `research_documents` (
  `rdoc_id` int(11) NOT NULL AUTO_INCREMENT,
  `project_id` int(11) DEFAULT NULL,
  `doc_label` varchar(100) DEFAULT NULL,
  `file_path` varchar(255) DEFAULT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`rdoc_id`),
  KEY `project_id` (`project_id`),
  CONSTRAINT `research_documents_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `research_projects` (`project_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for table `research_presentations`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `research_presentations` (
  `presentation_id` int(11) NOT NULL AUTO_INCREMENT,
  `project_id` int(11) DEFAULT NULL,
  `event_name` varchar(200) DEFAULT NULL,
  `venue` varchar(200) DEFAULT NULL,
  `presentation_date` date DEFAULT NULL,
  `award` varchar(150) DEFAULT NULL,
  PRIMARY KEY (`presentation_id`),
  KEY `project_id` (`project_id`),
  CONSTRAINT `research_presentations_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `research_projects` (`project_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for table `syllabus`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `syllabus` (
  `syllabus_id` int(11) NOT NULL AUTO_INCREMENT,
  `subject_code` varchar(20) DEFAULT NULL,
  `faculty_id` varchar(20) DEFAULT NULL,
  `semester` enum('1st','2nd','Summer') DEFAULT NULL,
  `academic_year` varchar(9) DEFAULT NULL,
  `course_description` text DEFAULT NULL,
  `course_outcomes` text DEFAULT NULL,
  `grading_system` text DEFAULT NULL,
  `references_biblio` text DEFAULT NULL,
  `approved_by` varchar(100) DEFAULT NULL,
  `is_approved` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`syllabus_id`),
  KEY `subject_code` (`subject_code`),
  KEY `faculty_id` (`faculty_id`),
  CONSTRAINT `syllabus_ibfk_1` FOREIGN KEY (`subject_code`) REFERENCES `subjects` (`subject_code`),
  CONSTRAINT `syllabus_ibfk_2` FOREIGN KEY (`faculty_id`) REFERENCES `faculty` (`faculty_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for table `syllabus_topics`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `syllabus_topics` (
  `topic_id` int(11) NOT NULL AUTO_INCREMENT,
  `syllabus_id` int(11) DEFAULT NULL,
  `week_number` int(11) DEFAULT NULL,
  `topic_title` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `teaching_method` varchar(100) DEFAULT NULL,
  `assessment` varchar(150) DEFAULT NULL,
  PRIMARY KEY (`topic_id`),
  KEY `syllabus_id` (`syllabus_id`),
  CONSTRAINT `syllabus_topics_ibfk_1` FOREIGN KEY (`syllabus_id`) REFERENCES `syllabus` (`syllabus_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for table `lessons`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `lessons` (
  `lesson_id` int(11) NOT NULL AUTO_INCREMENT,
  `topic_id` int(11) DEFAULT NULL,
  `title` varchar(200) NOT NULL,
  `content_type` enum('Lecture Notes','Slide Deck','Video','Activity','Reference') DEFAULT 'Lecture Notes',
  `file_path` varchar(255) DEFAULT NULL,
  `external_url` varchar(500) DEFAULT NULL,
  `is_published` tinyint(1) DEFAULT 0,
  `published_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`lesson_id`),
  KEY `topic_id` (`topic_id`),
  CONSTRAINT `lessons_ibfk_1` FOREIGN KEY (`topic_id`) REFERENCES `syllabus_topics` (`topic_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for table `users`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `user_id` int(11) NOT NULL AUTO_INCREMENT,
  `ref_id` varchar(20) NOT NULL,
  `user_type` enum('Student','Faculty','Admin') DEFAULT NULL,
  `username` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `last_login` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `ref_id` (`ref_id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
