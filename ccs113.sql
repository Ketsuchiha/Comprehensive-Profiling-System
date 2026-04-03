-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 03, 2026 at 01:00 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `ccs113`
--

-- --------------------------------------------------------

--
-- Table structure for table `curriculum`
--

CREATE TABLE `curriculum` (
  `curriculum_id` int(11) NOT NULL,
  `program` varchar(100) NOT NULL,
  `version` varchar(20) NOT NULL,
  `cmo_reference` varchar(100) DEFAULT NULL,
  `effectivity_year` year(4) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `curriculum_subjects`
--

CREATE TABLE `curriculum_subjects` (
  `cs_id` int(11) NOT NULL,
  `curriculum_id` int(11) DEFAULT NULL,
  `subject_code` varchar(20) DEFAULT NULL,
  `year_level` int(11) DEFAULT NULL,
  `semester` enum('1st','2nd','Summer') DEFAULT NULL,
  `prerequisite` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `departments`
--

CREATE TABLE `departments` (
  `dept_id` int(11) NOT NULL,
  `dept_name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `events`
--

CREATE TABLE `events` (
  `event_id` int(11) NOT NULL,
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
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `events`
--

INSERT INTO `events` (`event_id`, `title`, `description`, `event_type`, `venue`, `start_date`, `end_date`, `organizer`, `is_mandatory`, `created_by`, `status`, `created_at`) VALUES
(1, 'DSFSADFADS', 'FSADFSA', 'Cultural', 'FSDAFAS', '2026-03-31 09:00:00', '2026-03-31 17:00:00', NULL, 0, NULL, 'Upcoming', '2026-03-31 03:23:35');

-- --------------------------------------------------------

--
-- Table structure for table `event_participants`
--

CREATE TABLE `event_participants` (
  `participation_id` int(11) NOT NULL,
  `event_id` int(11) DEFAULT NULL,
  `participant_id` varchar(20) DEFAULT NULL,
  `participant_type` enum('Student','Faculty') DEFAULT NULL,
  `attendance` enum('Registered','Attended','Absent') DEFAULT 'Registered'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `faculty`
--

CREATE TABLE `faculty` (
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
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `faculty`
--

INSERT INTO `faculty` (`faculty_id`, `first_name`, `middle_name`, `last_name`, `birth_date`, `age`, `gender`, `email`, `contact_no`, `address`, `profile_photo`, `specialization`, `work_experience_years`, `expertise_certificate_path`, `created_at`, `updated_at`) VALUES
('F296fefe0f0f64947bc8', 'Gio', 'Oliveros', 'Calugas', '2004-05-13', NULL, 'Male', 'calugasgio@email.edu.com', '+639212266566', 'fasdfadsfasdfsadfs', NULL, 'Software Developer', 10, NULL, '2026-04-02 03:06:15', '2026-04-02 03:13:36'),
('F67810cb05a784421957', 'Multi', NULL, 'Expert', '2000-01-01', 26, 'Female', 'multi.1774935448@example.com', '', '', NULL, 'Network Security', NULL, NULL, '2026-03-31 05:37:28', '2026-04-02 03:04:56'),
('F6fb6043c547846fa8ed', 'John', 'Xi', 'Doe', '1982-06-16', 43, 'Male', 'fsdaf@email.edu.ph', '+639212200231', 'fdsafsadfsadfaseasdfewas', NULL, 'ethical hacking', NULL, NULL, '2026-04-02 02:52:42', '2026-04-02 03:04:56'),
('Fa5df0128c42b406ebc3', 'Test', NULL, 'Expert', '2000-01-01', 26, 'Female', 'expert.1774932341@example.com', '', '', NULL, 'Ethical Hacking', NULL, NULL, '2026-03-31 04:45:41', '2026-04-02 03:04:56'),
('Ff5edfca52d874e498fc', 'dr.', NULL, 'delacruz', '2000-01-01', 26, 'Male', 'delacruz@gmail.com', '', '', NULL, NULL, NULL, NULL, '2026-03-31 03:56:54', '2026-04-02 03:04:56');

-- --------------------------------------------------------

--
-- Table structure for table `faculty_education`
--

CREATE TABLE `faculty_education` (
  `edu_id` int(11) NOT NULL,
  `faculty_id` varchar(20) DEFAULT NULL,
  `degree` varchar(100) DEFAULT NULL,
  `institution` varchar(150) DEFAULT NULL,
  `year_graduated` year(4) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `faculty_employment`
--

CREATE TABLE `faculty_employment` (
  `faculty_id` varchar(20) NOT NULL,
  `employment_status` enum('Full-time','Part-time','Contractual') DEFAULT NULL,
  `rank` varchar(50) DEFAULT NULL,
  `department_id` int(11) DEFAULT NULL,
  `date_hired` date DEFAULT NULL,
  `tenure_status` varchar(30) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `faculty_employment`
--

INSERT INTO `faculty_employment` (`faculty_id`, `employment_status`, `rank`, `department_id`, `date_hired`, `tenure_status`) VALUES
('F296fefe0f0f64947bc8', NULL, 'Instructor', NULL, '2016-04-01', NULL),
('F67810cb05a784421957', NULL, 'Instructor', NULL, NULL, NULL),
('F6fb6043c547846fa8ed', NULL, 'Instructor', NULL, NULL, NULL),
('Fa5df0128c42b406ebc3', NULL, 'Instructor', NULL, NULL, NULL),
('Ff5edfca52d874e498fc', NULL, 'Instructor', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `faculty_evaluation`
--

CREATE TABLE `faculty_evaluation` (
  `eval_id` int(11) NOT NULL,
  `faculty_id` varchar(20) DEFAULT NULL,
  `semester` varchar(20) DEFAULT NULL,
  `academic_year` varchar(9) DEFAULT NULL,
  `student_eval_score` decimal(5,2) DEFAULT NULL,
  `peer_eval_score` decimal(5,2) DEFAULT NULL,
  `self_eval_score` decimal(5,2) DEFAULT NULL,
  `overall_rating` decimal(5,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `faculty_expertise_certifications`
--

CREATE TABLE `faculty_expertise_certifications` (
  `cert_id` int(11) NOT NULL,
  `faculty_id` varchar(20) NOT NULL,
  `expertise` varchar(150) NOT NULL,
  `certificate_file` varchar(255) NOT NULL,
  `mime_type` varchar(100) DEFAULT 'application/pdf',
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `faculty_expertise_certifications`
--

INSERT INTO `faculty_expertise_certifications` (`cert_id`, `faculty_id`, `expertise`, `certificate_file`, `mime_type`, `uploaded_at`) VALUES
(1, 'F67810cb05a784421957', 'Network Security', '/uploads/faculty-certificates/F67810cb05a784421957-1774935448258.pdf', 'application/pdf', '2026-03-31 05:37:28'),
(2, 'F67810cb05a784421957', 'Ethical Hacking', '/uploads/faculty-certificates/F67810cb05a784421957-1774935448292.pdf', 'application/pdf', '2026-03-31 05:37:28'),
(3, 'F6fb6043c547846fa8ed', 'ethical hacking', '/uploads/faculty-certificates/F6fb6043c547846fa8ed-1775098362438.pdf', 'application/pdf', '2026-04-02 02:52:42'),
(4, 'F296fefe0f0f64947bc8', 'Software Developer', '/uploads/faculty-certificates/F296fefe0f0f64947bc8-1775099175635.pdf', 'application/pdf', '2026-04-02 03:06:15');

-- --------------------------------------------------------

--
-- Table structure for table `faculty_load`
--

CREATE TABLE `faculty_load` (
  `load_id` int(11) NOT NULL,
  `faculty_id` varchar(20) DEFAULT NULL,
  `subject_code` varchar(20) DEFAULT NULL,
  `section` varchar(20) DEFAULT NULL,
  `semester` varchar(20) DEFAULT NULL,
  `academic_year` varchar(9) DEFAULT NULL,
  `teaching_units` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `faculty_research`
--

CREATE TABLE `faculty_research` (
  `research_id` int(11) NOT NULL,
  `faculty_id` varchar(20) DEFAULT NULL,
  `research_title` varchar(200) DEFAULT NULL,
  `publication_type` enum('Journal','Conference','Book') DEFAULT NULL,
  `year_published` year(4) DEFAULT NULL,
  `status` enum('Ongoing','Published','Presented') DEFAULT 'Ongoing'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `lessons`
--

CREATE TABLE `lessons` (
  `lesson_id` int(11) NOT NULL,
  `topic_id` int(11) DEFAULT NULL,
  `title` varchar(200) NOT NULL,
  `content_type` enum('Lecture Notes','Slide Deck','Video','Activity','Reference') DEFAULT 'Lecture Notes',
  `file_path` varchar(255) DEFAULT NULL,
  `external_url` varchar(500) DEFAULT NULL,
  `is_published` tinyint(1) DEFAULT 0,
  `published_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `lessons`
--

INSERT INTO `lessons` (`lesson_id`, `topic_id`, `title`, `content_type`, `file_path`, `external_url`, `is_published`, `published_at`, `created_at`) VALUES
(1, NULL, 'fsadfdsa', NULL, '/uploads/instruments/instrument-1774934581857-12430.docx', NULL, 0, NULL, '2026-03-31 05:23:01'),
(2, NULL, 'dsada', NULL, '/uploads/instruments/instrument-1774935235102-49868.pdf', NULL, 0, NULL, '2026-03-31 05:33:55');

-- --------------------------------------------------------

--
-- Table structure for table `research_documents`
--

CREATE TABLE `research_documents` (
  `rdoc_id` int(11) NOT NULL,
  `project_id` int(11) DEFAULT NULL,
  `doc_label` varchar(100) DEFAULT NULL,
  `file_path` varchar(255) DEFAULT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `research_members`
--

CREATE TABLE `research_members` (
  `member_id` int(11) NOT NULL,
  `project_id` int(11) DEFAULT NULL,
  `member_ref` varchar(20) DEFAULT NULL,
  `member_type` enum('Student','Faculty') DEFAULT NULL,
  `role` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `research_presentations`
--

CREATE TABLE `research_presentations` (
  `presentation_id` int(11) NOT NULL,
  `project_id` int(11) DEFAULT NULL,
  `event_name` varchar(200) DEFAULT NULL,
  `venue` varchar(200) DEFAULT NULL,
  `presentation_date` date DEFAULT NULL,
  `award` varchar(150) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `research_projects`
--

CREATE TABLE `research_projects` (
  `project_id` int(11) NOT NULL,
  `title` varchar(250) NOT NULL,
  `abstract` text DEFAULT NULL,
  `research_type` enum('Thesis','Capstone','Faculty Research','Institutional') DEFAULT 'Capstone',
  `status` enum('Proposal','Ongoing','Completed','Published') DEFAULT 'Proposal',
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `funding_source` varchar(150) DEFAULT NULL,
  `budget` decimal(12,2) DEFAULT NULL,
  `department_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `research_projects`
--

INSERT INTO `research_projects` (`project_id`, `title`, `abstract`, `research_type`, `status`, `start_date`, `end_date`, `funding_source`, `budget`, `department_id`, `created_at`) VALUES
(1, 'DASDSA', 'SDFASFSADFA', '', 'Completed', '2026-03-31', NULL, 'DASDAS', NULL, NULL, '2026-03-31 03:22:39');

-- --------------------------------------------------------

--
-- Table structure for table `rooms`
--

CREATE TABLE `rooms` (
  `room_id` int(11) NOT NULL,
  `room_name` varchar(50) NOT NULL,
  `building` varchar(100) DEFAULT NULL,
  `capacity` int(11) DEFAULT NULL,
  `room_type` enum('Lecture','Laboratory','Seminar','Both') DEFAULT 'Lecture'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `schedules`
--

CREATE TABLE `schedules` (
  `schedule_id` int(11) NOT NULL,
  `subject_code` varchar(20) DEFAULT NULL,
  `section` varchar(20) DEFAULT NULL,
  `faculty_id` varchar(20) DEFAULT NULL,
  `room_id` int(11) DEFAULT NULL,
  `semester` enum('1st','2nd','Summer') DEFAULT NULL,
  `academic_year` varchar(9) DEFAULT NULL,
  `day_of_week` set('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday') DEFAULT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `schedule_type` enum('Lecture','Laboratory') DEFAULT 'Lecture'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `schedules`
--

INSERT INTO `schedules` (`schedule_id`, `subject_code`, `section`, `faculty_id`, `room_id`, `semester`, `academic_year`, `day_of_week`, `start_time`, `end_time`, `schedule_type`) VALUES
(4, 'BIG3758', '1CS-B', 'Ff5edfca52d874e498fc', NULL, NULL, NULL, 'Tuesday', '13:35:00', '13:35:00', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `students`
--

CREATE TABLE `students` (
  `student_id` varchar(20) NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `middle_name` varchar(50) DEFAULT NULL,
  `last_name` varchar(50) NOT NULL,
  `birth_date` date NOT NULL,
  `sex` varchar(10) NOT NULL,
  `civil_status` varchar(20) DEFAULT NULL,
  `contact_number` varchar(15) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `address` text NOT NULL,
  `emergency_contact` varchar(100) NOT NULL,
  `emergency_contact_num` varchar(15) NOT NULL,
  `profile_photo` varchar(255) DEFAULT NULL,
  `nationality` varchar(50) DEFAULT NULL,
  `religion` varchar(50) DEFAULT NULL,
  `skills` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `students`
--

INSERT INTO `students` (`student_id`, `first_name`, `middle_name`, `last_name`, `birth_date`, `sex`, `civil_status`, `contact_number`, `email`, `password`, `address`, `emergency_contact`, `emergency_contact_num`, `profile_photo`, `nationality`, `religion`, `skills`, `created_at`, `updated_at`) VALUES
('2026-2023141', 'Juan', 'Dela', 'Cruz', '2026-04-03', 'Male', 'Single', '+631234567899', 'juan@email.com', 'D2026-04-03', 'fasdfas  fas fasfas fas', 'juan', '+631234567899', NULL, 'filipino', 'Roman Catholic', 'Programming', '2026-04-03 10:30:16', '2026-04-03 10:30:16'),
('423412342134', 'juan', 'juan', 'juan', '2026-04-03', 'Male', 'Single', '+631234567899', 'gio@example.com', '', 'fdsaf asdf asfasdfa sfd asdfa', 'eve casdfasd', '+631234567899', NULL, 'filipino', 'roman catholic', NULL, '2026-04-03 09:56:30', '2026-04-03 09:56:30'),
('TST-1774932343', 'Course', NULL, 'Student', '2004-01-01', 'Male', NULL, '09123456789', 'student.1774932343@example.com', '', 'Sample Address', 'Parent', '09999999999', NULL, NULL, NULL, NULL, '2026-03-31 04:45:43', '2026-03-31 04:45:43');

-- --------------------------------------------------------

--
-- Table structure for table `student_academic`
--

CREATE TABLE `student_academic` (
  `student_id` varchar(20) NOT NULL,
  `program` varchar(100) DEFAULT NULL,
  `major` varchar(100) DEFAULT NULL,
  `track` varchar(100) DEFAULT NULL,
  `year_level` int(11) DEFAULT NULL,
  `section` varchar(20) DEFAULT NULL,
  `admission_type` varchar(30) DEFAULT NULL,
  `enrollment_status` varchar(30) DEFAULT NULL,
  `scholarship_type` varchar(100) DEFAULT NULL,
  `admission_date` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `student_academic`
--

INSERT INTO `student_academic` (`student_id`, `program`, `major`, `track`, `year_level`, `section`, `admission_type`, `enrollment_status`, `scholarship_type`, `admission_date`) VALUES
('2026-2023141', 'BSIT', NULL, NULL, 1, NULL, NULL, 'Enrolled', NULL, NULL),
('423412342134', 'bsit', NULL, NULL, 1, NULL, NULL, 'Enrolled', NULL, NULL),
('TST-1774932343', 'BSCS', NULL, NULL, 2, 'CS-2A', NULL, 'Enrolled', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `student_course_assignments`
--

CREATE TABLE `student_course_assignments` (
  `student_id` varchar(20) NOT NULL,
  `subject_code` varchar(20) NOT NULL,
  `assigned_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `student_documents`
--

CREATE TABLE `student_documents` (
  `doc_id` int(11) NOT NULL,
  `student_id` varchar(20) DEFAULT NULL,
  `doc_type` varchar(100) DEFAULT NULL,
  `file_path` varchar(255) DEFAULT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `student_grades`
--

CREATE TABLE `student_grades` (
  `grade_id` int(11) NOT NULL,
  `student_id` varchar(20) DEFAULT NULL,
  `subject_code` varchar(20) DEFAULT NULL,
  `semester` enum('1st','2nd','Summer') DEFAULT NULL,
  `academic_year` varchar(9) DEFAULT NULL,
  `midterm_grade` decimal(5,2) DEFAULT NULL,
  `final_grade` decimal(5,2) DEFAULT NULL,
  `gpa` decimal(5,2) DEFAULT NULL,
  `remarks` enum('Passed','Failed','Incomplete','Dropped') DEFAULT 'Passed'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `student_internship`
--

CREATE TABLE `student_internship` (
  `internship_id` int(11) NOT NULL,
  `student_id` varchar(20) DEFAULT NULL,
  `company_name` varchar(150) DEFAULT NULL,
  `supervisor` varchar(100) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `hours_rendered` int(11) DEFAULT NULL,
  `eval_grade` decimal(5,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `student_orgs`
--

CREATE TABLE `student_orgs` (
  `org_id` int(11) NOT NULL,
  `student_id` varchar(20) DEFAULT NULL,
  `organization_name` varchar(100) DEFAULT NULL,
  `position` varchar(50) DEFAULT NULL,
  `academic_year` varchar(9) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `subjects`
--

CREATE TABLE `subjects` (
  `subject_code` varchar(20) NOT NULL,
  `subject_name` varchar(150) NOT NULL,
  `units` int(11) NOT NULL DEFAULT 3,
  `lec_hours` int(11) DEFAULT 3,
  `lab_hours` int(11) DEFAULT 0,
  `subject_type` enum('GE','Core','Professional','Elective','Practicum','Capstone') DEFAULT 'Professional'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `subjects`
--

INSERT INTO `subjects` (`subject_code`, `subject_name`, `units`, `lec_hours`, `lab_hours`, `subject_type`) VALUES
('BIG3758', 'Large Payload Subject', 3, 3, 0, 'Professional'),
('CSS113', 'ljhkgkjhgk', 3, 3, 0, 'Professional'),
('DOCX8865', 'Docx Subject', 3, 3, 0, 'Professional'),
('TMP1630', 'Temporary Syllabus', 3, 3, 0, 'Professional'),
('VIEW4202', 'View Test Subject', 3, 3, 0, 'Professional');

-- --------------------------------------------------------

--
-- Table structure for table `syllabus`
--

CREATE TABLE `syllabus` (
  `syllabus_id` int(11) NOT NULL,
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
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `syllabus`
--

INSERT INTO `syllabus` (`syllabus_id`, `subject_code`, `faculty_id`, `semester`, `academic_year`, `course_description`, `course_outcomes`, `grading_system`, `references_biblio`, `approved_by`, `is_approved`, `created_at`) VALUES
(3, 'TMP1630', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, '2026-03-31 05:12:13'),
(4, 'CSS113', 'Ff5edfca52d874e498fc', NULL, NULL, 'DAIMOS System for NIDEC Documentation.docx', NULL, NULL, NULL, NULL, 0, '2026-03-31 05:12:53'),
(5, 'VIEW4202', NULL, NULL, NULL, NULL, NULL, NULL, '/uploads/instruments/instrument-1774934180813-41177.pdf', NULL, 0, '2026-03-31 05:16:20'),
(6, 'BIG3758', NULL, NULL, NULL, NULL, NULL, NULL, '/uploads/instruments/instrument-1774934475856-18605.pdf', NULL, 0, '2026-03-31 05:21:15'),
(7, 'DOCX8865', NULL, NULL, NULL, NULL, NULL, NULL, '/uploads/instruments/instrument-1774934977917-71936.docx', NULL, 0, '2026-03-31 05:29:37'),
(8, 'BIG3758', 'Ff5edfca52d874e498fc', NULL, NULL, 'instrument-1774934977917-71936.docx', NULL, NULL, '/uploads/instruments/instrument-1774935013502-55026.docx', NULL, 0, '2026-03-31 05:30:13'),
(9, 'BIG3758', 'Ff5edfca52d874e498fc', NULL, NULL, 'DAIMOS System for NIDEC Documentation.docx', NULL, NULL, '/uploads/instruments/instrument-1774935027899-70934.docx', NULL, 0, '2026-03-31 05:30:27'),
(10, 'BIG3758', 'Ff5edfca52d874e498fc', NULL, NULL, 'ITEW6-WEEK-10-11-20260316102301.pdf', NULL, NULL, '/uploads/instruments/instrument-1774935275277-35721.pdf', NULL, 0, '2026-03-31 05:34:35');

-- --------------------------------------------------------

--
-- Table structure for table `syllabus_topics`
--

CREATE TABLE `syllabus_topics` (
  `topic_id` int(11) NOT NULL,
  `syllabus_id` int(11) DEFAULT NULL,
  `week_number` int(11) DEFAULT NULL,
  `topic_title` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `teaching_method` varchar(100) DEFAULT NULL,
  `assessment` varchar(150) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `ref_id` varchar(20) NOT NULL,
  `user_type` enum('Student','Faculty','Admin') DEFAULT NULL,
  `username` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `last_login` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `ref_id`, `user_type`, `username`, `password_hash`, `is_active`, `last_login`) VALUES
(1, 'ADM-mne1px9t-b344', 'Admin', 'calugasgio@gmail.com', '$2a$10$nY4geWDwm.6l3HHUnB5d9e5aOb7fdMz4RL.oCpCLpQ9MNPy7knc.m', 1, '2026-03-31 03:34:38'),
(2, 'ADM-mne1ubk4-e5c8', 'Admin', 'newuser_1774927224@example.com', '$2a$10$lQzKGfxuU8N4ezmTIpY3yOEw5p4nYiuBicc.RWYqfFpYIQzfthE1a', 1, NULL),
(3, 'ADM-mne1wq5p-8031', 'Admin', 'dup_email_check@example.com', '$2a$10$ZbjuUCgRIayX8wKK2ymmW.myVPgOjA5Z3UzgKSBDbvZwikMUW0Mq.', 1, NULL),
(6, 'ADM-mne3451g-7a6d', 'Admin', 'admin_1774929362@example.com', '$2a$10$XiqqPiUTchnYRzNOhmpT5.1kLfWsDnLx4nPsDMRQQ53JA5EcCqhOe', 1, NULL),
(8, 'ADM-mne34b6h-22e6', 'Admin', 'admin_dupe_test@example.com', '$2a$10$LdNWnRMU.Y511ctHJS4Ve.4fquY0PyfCo9Jg6DTS05ML2p2mvDWp6', 1, NULL),
(10, 'ADM-mne34ry3-28a4', 'Admin', 'calugasgio68@gmail.com', '$2a$10$67j05YXcDE8Q5D1HX9XJf.D3HBac6uP.7P6NYqaV/ugCPbfTFAB0u', 1, '2026-04-03 10:28:52'),
(11, 'ADM-mne368gy-2b2e', 'Admin', 'bringerdoom31@gmail.com', '$2a$10$JBffaZbwMPwbjX1AQRCdaONioferilXzh6aSXsFQP0vaPWOFDmkFC', 1, NULL),
(12, 'ADM-mne58vfa-e646', 'Admin', 'persist_1774932942276@example.com', '$2a$10$ZC73MuvBhOgqljMOItlds.RPduhSynBlSEh3XjSUmYFJHQ6AW4/ni', 1, NULL),
(14, 'ADM-mnfo1nsi-5bb7', 'Admin', 'gio@gmail.com', '$2a$10$MZ7UiIz/fwWyvlrEFpru5.qfUUiZIkAnLxrsV/Bp954l3amFbExNO', 1, NULL),
(15, 'F6fb6043c547846fa8ed', 'Faculty', 'fsdaf@email.edu.ph', '$2a$10$J.u.o99qH1LSm9icbzTBQuTwk5s1xkHMlm5Fdk0wPhUcxHAmbQM8S', 1, NULL),
(16, 'F296fefe0f0f64947bc8', 'Faculty', 'calugasgio@email.edu.com', '$2a$10$oG8/03h5oM.QuPwVDOjaFeyhCXe.nzc0F2O6j3R.BYHppkeuDi3ny', 1, NULL),
(17, '423412342134', 'Student', 'gio@example.com', '$2a$10$f.QK2/hlWy.e4uYYV2.7HeLJzLh0VLH1uoCA0o0d55Sm7zXMZwItG', 1, NULL),
(18, '2026-2023141', 'Student', 'juan@email.com', '$2a$10$eY.siBm6Q2LqgxN6tXkPpe.CpSxYTAQaff9lAejlGTQMKcwvoBIC2', 1, '2026-04-03 10:40:04');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `curriculum`
--
ALTER TABLE `curriculum`
  ADD PRIMARY KEY (`curriculum_id`);

--
-- Indexes for table `curriculum_subjects`
--
ALTER TABLE `curriculum_subjects`
  ADD PRIMARY KEY (`cs_id`),
  ADD KEY `curriculum_id` (`curriculum_id`),
  ADD KEY `subject_code` (`subject_code`);

--
-- Indexes for table `departments`
--
ALTER TABLE `departments`
  ADD PRIMARY KEY (`dept_id`);

--
-- Indexes for table `events`
--
ALTER TABLE `events`
  ADD PRIMARY KEY (`event_id`);

--
-- Indexes for table `event_participants`
--
ALTER TABLE `event_participants`
  ADD PRIMARY KEY (`participation_id`),
  ADD KEY `event_id` (`event_id`);

--
-- Indexes for table `faculty`
--
ALTER TABLE `faculty`
  ADD PRIMARY KEY (`faculty_id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `faculty_education`
--
ALTER TABLE `faculty_education`
  ADD PRIMARY KEY (`edu_id`),
  ADD KEY `faculty_id` (`faculty_id`);

--
-- Indexes for table `faculty_employment`
--
ALTER TABLE `faculty_employment`
  ADD PRIMARY KEY (`faculty_id`),
  ADD KEY `department_id` (`department_id`);

--
-- Indexes for table `faculty_evaluation`
--
ALTER TABLE `faculty_evaluation`
  ADD PRIMARY KEY (`eval_id`),
  ADD KEY `faculty_id` (`faculty_id`);

--
-- Indexes for table `faculty_expertise_certifications`
--
ALTER TABLE `faculty_expertise_certifications`
  ADD PRIMARY KEY (`cert_id`),
  ADD KEY `faculty_id` (`faculty_id`);

--
-- Indexes for table `faculty_load`
--
ALTER TABLE `faculty_load`
  ADD PRIMARY KEY (`load_id`),
  ADD KEY `faculty_id` (`faculty_id`),
  ADD KEY `subject_code` (`subject_code`);

--
-- Indexes for table `faculty_research`
--
ALTER TABLE `faculty_research`
  ADD PRIMARY KEY (`research_id`),
  ADD KEY `faculty_id` (`faculty_id`);

--
-- Indexes for table `lessons`
--
ALTER TABLE `lessons`
  ADD PRIMARY KEY (`lesson_id`),
  ADD KEY `topic_id` (`topic_id`);

--
-- Indexes for table `research_documents`
--
ALTER TABLE `research_documents`
  ADD PRIMARY KEY (`rdoc_id`),
  ADD KEY `project_id` (`project_id`);

--
-- Indexes for table `research_members`
--
ALTER TABLE `research_members`
  ADD PRIMARY KEY (`member_id`),
  ADD KEY `project_id` (`project_id`);

--
-- Indexes for table `research_presentations`
--
ALTER TABLE `research_presentations`
  ADD PRIMARY KEY (`presentation_id`),
  ADD KEY `project_id` (`project_id`);

--
-- Indexes for table `research_projects`
--
ALTER TABLE `research_projects`
  ADD PRIMARY KEY (`project_id`),
  ADD KEY `department_id` (`department_id`);

--
-- Indexes for table `rooms`
--
ALTER TABLE `rooms`
  ADD PRIMARY KEY (`room_id`);

--
-- Indexes for table `schedules`
--
ALTER TABLE `schedules`
  ADD PRIMARY KEY (`schedule_id`),
  ADD KEY `subject_code` (`subject_code`),
  ADD KEY `faculty_id` (`faculty_id`),
  ADD KEY `room_id` (`room_id`);

--
-- Indexes for table `students`
--
ALTER TABLE `students`
  ADD PRIMARY KEY (`student_id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `student_academic`
--
ALTER TABLE `student_academic`
  ADD PRIMARY KEY (`student_id`);

--
-- Indexes for table `student_course_assignments`
--
ALTER TABLE `student_course_assignments`
  ADD PRIMARY KEY (`student_id`,`subject_code`),
  ADD KEY `student_course_assignments_ibfk_2` (`subject_code`);

--
-- Indexes for table `student_documents`
--
ALTER TABLE `student_documents`
  ADD PRIMARY KEY (`doc_id`),
  ADD KEY `student_id` (`student_id`);

--
-- Indexes for table `student_grades`
--
ALTER TABLE `student_grades`
  ADD PRIMARY KEY (`grade_id`),
  ADD KEY `student_id` (`student_id`),
  ADD KEY `subject_code` (`subject_code`);

--
-- Indexes for table `student_internship`
--
ALTER TABLE `student_internship`
  ADD PRIMARY KEY (`internship_id`),
  ADD KEY `student_id` (`student_id`);

--
-- Indexes for table `student_orgs`
--
ALTER TABLE `student_orgs`
  ADD PRIMARY KEY (`org_id`),
  ADD KEY `student_id` (`student_id`);

--
-- Indexes for table `subjects`
--
ALTER TABLE `subjects`
  ADD PRIMARY KEY (`subject_code`);

--
-- Indexes for table `syllabus`
--
ALTER TABLE `syllabus`
  ADD PRIMARY KEY (`syllabus_id`),
  ADD KEY `subject_code` (`subject_code`),
  ADD KEY `faculty_id` (`faculty_id`);

--
-- Indexes for table `syllabus_topics`
--
ALTER TABLE `syllabus_topics`
  ADD PRIMARY KEY (`topic_id`),
  ADD KEY `syllabus_id` (`syllabus_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `ref_id` (`ref_id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `curriculum`
--
ALTER TABLE `curriculum`
  MODIFY `curriculum_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `curriculum_subjects`
--
ALTER TABLE `curriculum_subjects`
  MODIFY `cs_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `departments`
--
ALTER TABLE `departments`
  MODIFY `dept_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `events`
--
ALTER TABLE `events`
  MODIFY `event_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `event_participants`
--
ALTER TABLE `event_participants`
  MODIFY `participation_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `faculty_education`
--
ALTER TABLE `faculty_education`
  MODIFY `edu_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `faculty_evaluation`
--
ALTER TABLE `faculty_evaluation`
  MODIFY `eval_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `faculty_expertise_certifications`
--
ALTER TABLE `faculty_expertise_certifications`
  MODIFY `cert_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `faculty_load`
--
ALTER TABLE `faculty_load`
  MODIFY `load_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `faculty_research`
--
ALTER TABLE `faculty_research`
  MODIFY `research_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `lessons`
--
ALTER TABLE `lessons`
  MODIFY `lesson_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `research_documents`
--
ALTER TABLE `research_documents`
  MODIFY `rdoc_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `research_members`
--
ALTER TABLE `research_members`
  MODIFY `member_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `research_presentations`
--
ALTER TABLE `research_presentations`
  MODIFY `presentation_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `research_projects`
--
ALTER TABLE `research_projects`
  MODIFY `project_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `rooms`
--
ALTER TABLE `rooms`
  MODIFY `room_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `schedules`
--
ALTER TABLE `schedules`
  MODIFY `schedule_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `student_documents`
--
ALTER TABLE `student_documents`
  MODIFY `doc_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `student_grades`
--
ALTER TABLE `student_grades`
  MODIFY `grade_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `student_internship`
--
ALTER TABLE `student_internship`
  MODIFY `internship_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `student_orgs`
--
ALTER TABLE `student_orgs`
  MODIFY `org_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `syllabus`
--
ALTER TABLE `syllabus`
  MODIFY `syllabus_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `syllabus_topics`
--
ALTER TABLE `syllabus_topics`
  MODIFY `topic_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `curriculum_subjects`
--
ALTER TABLE `curriculum_subjects`
  ADD CONSTRAINT `curriculum_subjects_ibfk_1` FOREIGN KEY (`curriculum_id`) REFERENCES `curriculum` (`curriculum_id`),
  ADD CONSTRAINT `curriculum_subjects_ibfk_2` FOREIGN KEY (`subject_code`) REFERENCES `subjects` (`subject_code`);

--
-- Constraints for table `event_participants`
--
ALTER TABLE `event_participants`
  ADD CONSTRAINT `event_participants_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `events` (`event_id`);

--
-- Constraints for table `faculty_education`
--
ALTER TABLE `faculty_education`
  ADD CONSTRAINT `faculty_education_ibfk_1` FOREIGN KEY (`faculty_id`) REFERENCES `faculty` (`faculty_id`);

--
-- Constraints for table `faculty_employment`
--
ALTER TABLE `faculty_employment`
  ADD CONSTRAINT `faculty_employment_ibfk_1` FOREIGN KEY (`faculty_id`) REFERENCES `faculty` (`faculty_id`),
  ADD CONSTRAINT `faculty_employment_ibfk_2` FOREIGN KEY (`department_id`) REFERENCES `departments` (`dept_id`);

--
-- Constraints for table `faculty_evaluation`
--
ALTER TABLE `faculty_evaluation`
  ADD CONSTRAINT `faculty_evaluation_ibfk_1` FOREIGN KEY (`faculty_id`) REFERENCES `faculty` (`faculty_id`);

--
-- Constraints for table `faculty_expertise_certifications`
--
ALTER TABLE `faculty_expertise_certifications`
  ADD CONSTRAINT `faculty_expertise_certifications_ibfk_1` FOREIGN KEY (`faculty_id`) REFERENCES `faculty` (`faculty_id`) ON DELETE CASCADE;

--
-- Constraints for table `faculty_load`
--
ALTER TABLE `faculty_load`
  ADD CONSTRAINT `faculty_load_ibfk_1` FOREIGN KEY (`faculty_id`) REFERENCES `faculty` (`faculty_id`),
  ADD CONSTRAINT `faculty_load_ibfk_2` FOREIGN KEY (`subject_code`) REFERENCES `subjects` (`subject_code`);

--
-- Constraints for table `faculty_research`
--
ALTER TABLE `faculty_research`
  ADD CONSTRAINT `faculty_research_ibfk_1` FOREIGN KEY (`faculty_id`) REFERENCES `faculty` (`faculty_id`);

--
-- Constraints for table `lessons`
--
ALTER TABLE `lessons`
  ADD CONSTRAINT `lessons_ibfk_1` FOREIGN KEY (`topic_id`) REFERENCES `syllabus_topics` (`topic_id`);

--
-- Constraints for table `research_documents`
--
ALTER TABLE `research_documents`
  ADD CONSTRAINT `research_documents_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `research_projects` (`project_id`);

--
-- Constraints for table `research_members`
--
ALTER TABLE `research_members`
  ADD CONSTRAINT `research_members_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `research_projects` (`project_id`);

--
-- Constraints for table `research_presentations`
--
ALTER TABLE `research_presentations`
  ADD CONSTRAINT `research_presentations_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `research_projects` (`project_id`);

--
-- Constraints for table `research_projects`
--
ALTER TABLE `research_projects`
  ADD CONSTRAINT `research_projects_ibfk_1` FOREIGN KEY (`department_id`) REFERENCES `departments` (`dept_id`);

--
-- Constraints for table `schedules`
--
ALTER TABLE `schedules`
  ADD CONSTRAINT `schedules_ibfk_1` FOREIGN KEY (`subject_code`) REFERENCES `subjects` (`subject_code`),
  ADD CONSTRAINT `schedules_ibfk_2` FOREIGN KEY (`faculty_id`) REFERENCES `faculty` (`faculty_id`),
  ADD CONSTRAINT `schedules_ibfk_3` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`room_id`);

--
-- Constraints for table `student_academic`
--
ALTER TABLE `student_academic`
  ADD CONSTRAINT `student_academic_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`);

--
-- Constraints for table `student_course_assignments`
--
ALTER TABLE `student_course_assignments`
  ADD CONSTRAINT `student_course_assignments_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `student_course_assignments_ibfk_2` FOREIGN KEY (`subject_code`) REFERENCES `subjects` (`subject_code`) ON DELETE CASCADE;

--
-- Constraints for table `student_documents`
--
ALTER TABLE `student_documents`
  ADD CONSTRAINT `student_documents_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`);

--
-- Constraints for table `student_grades`
--
ALTER TABLE `student_grades`
  ADD CONSTRAINT `student_grades_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`),
  ADD CONSTRAINT `student_grades_ibfk_2` FOREIGN KEY (`subject_code`) REFERENCES `subjects` (`subject_code`);

--
-- Constraints for table `student_internship`
--
ALTER TABLE `student_internship`
  ADD CONSTRAINT `student_internship_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`);

--
-- Constraints for table `student_orgs`
--
ALTER TABLE `student_orgs`
  ADD CONSTRAINT `student_orgs_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`);

--
-- Constraints for table `syllabus`
--
ALTER TABLE `syllabus`
  ADD CONSTRAINT `syllabus_ibfk_1` FOREIGN KEY (`subject_code`) REFERENCES `subjects` (`subject_code`),
  ADD CONSTRAINT `syllabus_ibfk_2` FOREIGN KEY (`faculty_id`) REFERENCES `faculty` (`faculty_id`);

--
-- Constraints for table `syllabus_topics`
--
ALTER TABLE `syllabus_topics`
  ADD CONSTRAINT `syllabus_topics_ibfk_1` FOREIGN KEY (`syllabus_id`) REFERENCES `syllabus` (`syllabus_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
