-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 20, 2026 at 06:10 AM
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

--
-- Dumping data for table `curriculum`
--

INSERT INTO `curriculum` (`curriculum_id`, `program`, `version`, `cmo_reference`, `effectivity_year`, `is_active`, `description`) VALUES
(1, 'BSIT', '2026', 'CMO-BSIT-2026', '2026', 1, 'BSIT curriculum seeded from provided subject screenshots');

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

--
-- Dumping data for table `curriculum_subjects`
--

INSERT INTO `curriculum_subjects` (`cs_id`, `curriculum_id`, `subject_code`, `year_level`, `semester`, `prerequisite`) VALUES
(1, 1, 'CCS101', 1, '1st', NULL),
(2, 1, 'CCS102', 1, '1st', NULL),
(3, 1, 'ETH101', 1, '1st', NULL),
(4, 1, 'MAT101', 1, '1st', NULL),
(5, 1, 'NSTP1', 1, '1st', NULL),
(6, 1, 'PED101', 1, '1st', NULL),
(7, 1, 'PSY100', 1, '1st', NULL),
(8, 1, 'CCS103', 1, '2nd', 'CCS102'),
(9, 1, 'CCS104', 1, '2nd', NULL),
(10, 1, 'CCS105', 1, '2nd', NULL),
(11, 1, 'CCS106', 1, '2nd', NULL),
(12, 1, 'COM101', 1, '2nd', NULL),
(13, 1, 'GAD101', 1, '2nd', NULL),
(14, 1, 'NSTP2', 1, '2nd', 'NSTP1'),
(15, 1, 'PED102', 1, '2nd', 'PED101'),
(16, 1, 'ACT101', 2, '1st', NULL),
(17, 1, 'CCS107', 2, '1st', 'CCS103'),
(18, 1, 'CCS108', 2, '1st', 'CCS103'),
(19, 1, 'CCS109', 2, '1st', 'CCS108'),
(20, 1, 'ITEW1', 2, '1st', NULL),
(21, 1, 'PED103', 2, '1st', 'PED102'),
(22, 1, 'STS101', 2, '1st', NULL),
(23, 1, 'HIS101', 2, '2nd', NULL),
(24, 1, 'ITEW3', 2, '2nd', 'ITEW1'),
(25, 1, 'ITP103', 2, '2nd', 'CCS109'),
(26, 1, 'ITP104', 2, '2nd', 'CCS109'),
(27, 1, 'ITP105', 2, '2nd', 'ITP104'),
(28, 1, 'ITP106', 2, '2nd', 'CCS105'),
(29, 1, 'SOC101', 2, '2nd', NULL),
(30, 1, 'TEC101', 2, '2nd', NULL),
(31, 1, 'CCS112', 3, '1st', 'CCS109'),
(32, 1, 'CCS113', 3, '1st', 'ITP105'),
(33, 1, 'HMN101', 3, '1st', NULL),
(34, 1, 'ITEW4', 3, '1st', 'ITEW3'),
(35, 1, 'ITP107', 3, '1st', 'CCS108'),
(36, 1, 'ITP108', 3, '1st', 'CCS112'),
(37, 1, 'ITP109', 3, '1st', 'ITP103'),
(38, 1, 'ITEW6', 4, '1st', 'ITEW4'),
(39, 1, 'ITP113', 4, '1st', 'ITP108');

-- --------------------------------------------------------

--
-- Table structure for table `departments`
--

CREATE TABLE `departments` (
  `dept_id` int(11) NOT NULL,
  `dept_name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `departments`
--

INSERT INTO `departments` (`dept_id`, `dept_name`) VALUES
(101, 'Computer Science'),
(102, 'Information Technology'),
(103, 'Data Science'),
(104, 'Cybersecurity'),
(105, 'Multimedia Arts');

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
(1, 'DSFSADFADS', 'FSADFSA', 'Cultural', 'FSDAFAS', '2026-03-31 09:00:00', '2026-03-31 17:00:00', NULL, 0, NULL, 'Upcoming', '2026-03-31 03:23:35'),
(2, 'Computer Science f sad fsda fsadf sad', 'fsdf asfwe sdf asfas fsd fsadf ', 'Academic', '4th Floor', '2026-04-19 09:00:00', '2026-04-19 17:00:00', NULL, 0, NULL, 'Upcoming', '2026-04-18 21:23:42'),
(3, 'fsdfsadf', 'fsdfsadfasd', 'Cultural', 'fsdafsad', '2026-06-13 01:00:00', '2026-06-13 09:00:00', NULL, 0, NULL, 'Ongoing', '2026-04-18 21:24:01'),
(101, 'Freshmen Orientation 2026', 'Orientation program for incoming CCS freshmen.', 'Academic', 'Seminar Hall A', '2026-08-20 08:00:00', '2026-08-20 12:00:00', 'CCS Student Affairs', 1, 'ADM-mne1px9t-b344', 'Upcoming', '2026-04-18 22:29:34'),
(102, 'Hackathon Kickoff', 'Opening ceremony and briefing for 24-hour hackathon.', 'Seminar', 'Innovation Hub', '2026-09-05 09:00:00', '2026-09-05 11:00:00', 'CCS Innovation Club', 0, 'ADM-mne1px9t-b344', 'Upcoming', '2026-04-18 22:29:34'),
(103, 'Intramurals E-Sports Qualifiers', 'Department-level e-sports qualifiers.', 'Sports', 'Main Gym', '2026-09-18 13:00:00', '2026-09-18 18:00:00', 'College Sports Unit', 0, 'ADM-mne1px9t-b344', 'Upcoming', '2026-04-18 22:29:34'),
(104, 'Research Colloquium', 'Presentation of ongoing capstone and thesis projects.', 'Academic', 'Room 301', '2026-10-02 09:00:00', '2026-10-02 16:00:00', 'CCS Research Council', 1, 'ADM-mne1px9t-b344', 'Upcoming', '2026-04-18 22:29:34'),
(105, 'Cybersecurity Awareness Week', 'Talk series on cyber hygiene and best practices.', 'Organizational', 'Seminar Hall A', '2026-10-12 08:00:00', '2026-10-16 17:00:00', 'Cybersecurity Department', 0, 'ADM-mne1px9t-b344', 'Upcoming', '2026-04-18 22:29:34'),
(106, 'Year-End Cultural Night', 'Performances and recognition program.', 'Cultural', 'Open Grounds', '2026-12-10 17:00:00', '2026-12-10 21:00:00', 'Student Council', 0, 'ADM-mne1px9t-b344', 'Upcoming', '2026-04-18 22:29:34');

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

--
-- Dumping data for table `event_participants`
--

INSERT INTO `event_participants` (`participation_id`, `event_id`, `participant_id`, `participant_type`, `attendance`) VALUES
(1, 101, '2026-310001', 'Student', 'Registered'),
(2, 101, '2026-310002', 'Student', 'Registered'),
(3, 101, '2026-310003', 'Student', 'Registered'),
(4, 101, 'F2604SAMP001', 'Faculty', 'Registered'),
(5, 102, '2026-310005', 'Student', 'Registered'),
(6, 102, '2026-310006', 'Student', 'Registered'),
(7, 102, 'F2604SAMP002', 'Faculty', 'Registered'),
(8, 103, '2026-310007', 'Student', 'Registered'),
(9, 103, '2026-310008', 'Student', 'Registered'),
(10, 104, '2026-310007', 'Student', 'Registered'),
(11, 104, '2026-310008', 'Student', 'Registered'),
(12, 104, 'F2604SAMP003', 'Faculty', 'Registered'),
(13, 105, '2026-310004', 'Student', 'Registered'),
(14, 105, 'F2604SAMP006', 'Faculty', 'Registered'),
(15, 106, '2026-310001', 'Student', 'Registered'),
(16, 106, '2026-310003', 'Student', 'Registered'),
(17, 106, '2026-310005', 'Student', 'Registered');

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
('F2604SAMP001', 'Maria', 'Lopez', 'Santos', '1988-04-12', 38, 'Female', 'maria.santos@ccs.edu.ph', '+639171110001', 'Brgy. San Isidro, City A', NULL, 'Software Engineering', 12, NULL, '2026-04-18 22:29:34', '2026-04-18 22:29:34'),
('F2604SAMP002', 'Carlo', 'M.', 'Reyes', '1986-09-03', 39, 'Male', 'carlo.reyes@ccs.edu.ph', '+639171110002', 'Brgy. Riverside, City A', NULL, 'Web Development', 14, NULL, '2026-04-18 22:29:34', '2026-04-18 22:29:34'),
('F2604SAMP003', 'Nina', 'T.', 'Ortega', '1990-01-25', 36, 'Female', 'nina.ortega@ccs.edu.ph', '+639171110003', 'Brgy. Mabini, City B', NULL, 'Database Systems', 10, NULL, '2026-04-18 22:29:34', '2026-04-18 22:29:34'),
('F2604SAMP004', 'Leo', 'P.', 'Navarro', '1985-07-18', 40, 'Male', 'leo.navarro@ccs.edu.ph', '+639171110004', 'Brgy. Poblacion, City C', NULL, 'Computer Networks', 15, NULL, '2026-04-18 22:29:34', '2026-04-18 22:29:34'),
('F2604SAMP005', 'Paula', 'R.', 'Mendoza', '1991-11-09', 34, 'Female', 'paula.mendoza@ccs.edu.ph', '+639171110005', 'Brgy. Balite, City B', NULL, 'Human-Computer Interaction', 9, NULL, '2026-04-18 22:29:34', '2026-04-18 22:29:34'),
('F2604SAMP006', 'Ramon', 'D.', 'Villanueva', '1987-02-14', 39, 'Male', 'ramon.villanueva@ccs.edu.ph', '+639171110006', 'Brgy. San Roque, City D', NULL, 'Cybersecurity', 13, NULL, '2026-04-18 22:29:34', '2026-04-18 22:29:34'),
('F296fefe0f0f64947bc8', 'Gio', 'Oliveros', 'Calugas', '2004-05-12', 21, 'Male', 'calugasgio@email.edu.com', '+639212266566', 'fasdfadsfasdfsadfs', NULL, 'Software Developer', 10, NULL, '2026-04-02 03:06:15', '2026-04-18 21:00:32'),
('F67810cb05a784421957', 'Multi', NULL, 'Expert', '2000-01-01', 26, 'Female', 'multi.1774935448@example.com', '', '', NULL, 'Network Security', NULL, NULL, '2026-03-31 05:37:28', '2026-04-02 03:04:56'),
('F6fb6043c547846fa8ed', 'John', 'Xi', 'Doe', '1982-06-16', 43, 'Male', 'fsdaf@email.edu.ph', '+639212200231', 'fdsafsadfsadfaseasdfewas', NULL, 'ethical hacking', NULL, NULL, '2026-04-02 02:52:42', '2026-04-02 03:04:56'),
('Ff5edfca52d874e498fc', 'dr.', NULL, 'delacruz', '2000-01-01', 26, 'Male', 'delacruz@gmail.com', '', '', NULL, NULL, NULL, NULL, '2026-03-31 03:56:54', '2026-04-02 03:04:56'),
('FIT2604001', 'Aira', 'M.', 'Santos', '1988-05-12', 37, 'Female', 'aira.santos.it@ccs.edu.ph', '+639175550001', 'City A', NULL, 'Programming and Algorithms', 12, NULL, '2026-04-18 22:40:51', '2026-04-18 22:40:51'),
('FIT2604002', 'Mark', 'D.', 'Reyes', '1987-09-03', 38, 'Male', 'mark.reyes.it@ccs.edu.ph', '+639175550002', 'City B', NULL, 'Web Development', 13, NULL, '2026-04-18 22:40:51', '2026-04-18 22:40:51'),
('FIT2604003', 'Nina', 'L.', 'Flores', '1989-11-24', 36, 'Female', 'nina.flores.it@ccs.edu.ph', '+639175550003', 'City C', NULL, 'Systems and Databases', 11, NULL, '2026-04-18 22:40:51', '2026-04-18 22:40:51'),
('FIT2604004', 'Allan', 'P.', 'Cruz', '1986-02-18', 40, 'Male', 'allan.cruz.it@ccs.edu.ph', '+639175550004', 'City D', NULL, 'Networking and Security', 15, NULL, '2026-04-18 22:40:51', '2026-04-18 22:40:51'),
('FIT2604005', 'Claire', 'R.', 'Ramos', '1990-07-09', 35, 'Female', 'claire.ramos.it@ccs.edu.ph', '+639175550005', 'City E', NULL, 'HCI and Mobile Development', 10, NULL, '2026-04-18 22:40:51', '2026-04-18 22:40:51'),
('FIT2604006', 'Joel', 'T.', 'Bautista', '1985-03-14', 41, 'Male', 'joel.bautista.gened@ccs.edu.ph', '+639175550006', 'City F', NULL, 'General Education', 16, NULL, '2026-04-18 22:40:51', '2026-04-18 22:40:51'),
('FIT2604007', 'Paolo', 'C.', 'Valdez', '1984-12-05', 41, 'Male', 'paolo.valdez.capstone@ccs.edu.ph', '+639175550007', 'City G', NULL, 'Capstone and Emerging Technologies', 17, NULL, '2026-04-18 22:40:51', '2026-04-18 22:40:51');

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
  `assigned_section` varchar(20) DEFAULT NULL,
  `date_hired` date DEFAULT NULL,
  `tenure_status` varchar(30) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `faculty_employment`
--

INSERT INTO `faculty_employment` (`faculty_id`, `employment_status`, `rank`, `department_id`, `assigned_section`, `date_hired`, `tenure_status`) VALUES
('F2604SAMP001', 'Full-time', 'Assistant Professor', 102, NULL, '2016-06-01', 'Tenured'),
('F2604SAMP002', 'Full-time', 'Instructor', 102, NULL, '2018-07-15', 'Probationary'),
('F2604SAMP003', 'Full-time', 'Assistant Professor', 103, NULL, '2017-06-10', 'Tenured'),
('F2604SAMP004', 'Full-time', 'Associate Professor', 104, NULL, '2014-06-03', 'Tenured'),
('F2604SAMP005', 'Part-time', 'Instructor', 105, NULL, '2021-08-01', 'Non-Tenured'),
('F2604SAMP006', 'Full-time', 'Assistant Professor', 104, NULL, '2015-06-22', 'Tenured'),
('F296fefe0f0f64947bc8', NULL, 'Assistant Professor', NULL, NULL, '2016-04-18', NULL),
('F67810cb05a784421957', NULL, 'Instructor', NULL, NULL, NULL, NULL),
('F6fb6043c547846fa8ed', NULL, 'Instructor', NULL, NULL, NULL, NULL),
('Ff5edfca52d874e498fc', NULL, 'Instructor', NULL, NULL, NULL, NULL),
('FIT2604001', 'Full-time', 'Assistant Professor', NULL, NULL, '2016-06-01', 'Tenured'),
('FIT2604002', 'Full-time', 'Instructor', NULL, NULL, '2017-06-01', 'Tenured'),
('FIT2604003', 'Full-time', 'Assistant Professor', NULL, NULL, '2018-06-01', 'Tenured'),
('FIT2604004', 'Full-time', 'Associate Professor', NULL, NULL, '2015-06-01', 'Tenured'),
('FIT2604005', 'Full-time', 'Instructor', NULL, NULL, '2019-06-01', 'Probationary'),
('FIT2604006', 'Full-time', 'Instructor', NULL, NULL, '2014-06-01', 'Tenured'),
('FIT2604007', 'Full-time', 'Associate Professor', NULL, NULL, '2013-06-01', 'Tenured');

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
(4, 'F296fefe0f0f64947bc8', 'Software Developer', '/uploads/faculty-certificates/F296fefe0f0f64947bc8-1775099175635.pdf', 'application/pdf', '2026-04-02 03:06:15'),
(5, 'F2604SAMP001', 'Software Engineering', '/uploads/faculty-certificates/F2604SAMP001-software-eng.pdf', 'application/pdf', '2026-04-18 22:29:34'),
(6, 'F2604SAMP002', 'Web Development', '/uploads/faculty-certificates/F2604SAMP002-web-dev.pdf', 'application/pdf', '2026-04-18 22:29:34'),
(7, 'F2604SAMP003', 'Database Administration', '/uploads/faculty-certificates/F2604SAMP003-database-admin.pdf', 'application/pdf', '2026-04-18 22:29:34'),
(8, 'F2604SAMP004', 'Network Administration', '/uploads/faculty-certificates/F2604SAMP004-net-admin.pdf', 'application/pdf', '2026-04-18 22:29:34'),
(9, 'F2604SAMP005', 'User Experience Design', '/uploads/faculty-certificates/F2604SAMP005-ux-design.pdf', 'application/pdf', '2026-04-18 22:29:34'),
(10, 'F2604SAMP006', 'Ethical Hacking', '/uploads/faculty-certificates/F2604SAMP006-ethical-hacking.pdf', 'application/pdf', '2026-04-18 22:29:34');

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

--
-- Dumping data for table `rooms`
--

INSERT INTO `rooms` (`room_id`, `room_name`, `building`, `capacity`, `room_type`) VALUES
(201, 'CCS Lab 1', 'Main Building', 40, 'Laboratory'),
(202, 'CCS Lab 2', 'Main Building', 35, 'Laboratory'),
(203, 'Room 301', 'Main Building', 45, 'Lecture'),
(204, 'Room 302', 'Main Building', 45, 'Lecture'),
(205, 'Seminar Hall A', 'Annex', 120, 'Seminar'),
(206, 'Innovation Hub', 'Annex', 60, 'Both');

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
(4, 'BIG3758', '1CS-B', 'Ff5edfca52d874e498fc', NULL, NULL, NULL, 'Tuesday', '13:35:00', '13:35:00', NULL),
(5, 'CSA101', 'IT-1A', 'F2604SAMP002', 201, '1st', '2026-2027', 'Monday,Wednesday', '08:00:00', '09:30:00', 'Laboratory'),
(6, 'ITN101', 'IT-1A', 'F2604SAMP002', 202, '1st', '2026-2027', 'Tuesday,Thursday', '09:30:00', '11:00:00', 'Laboratory'),
(7, 'CSA102', 'IT-1A', 'F2604SAMP001', 203, '1st', '2026-2027', 'Friday', '10:00:00', '13:00:00', 'Lecture'),
(8, 'CSA101', 'CS-1A', 'F2604SAMP001', 203, '1st', '2026-2027', 'Monday,Wednesday', '13:00:00', '14:30:00', 'Lecture'),
(9, 'CSA102', 'CS-1A', 'F2604SAMP003', 204, '1st', '2026-2027', 'Tuesday,Thursday', '13:00:00', '14:30:00', 'Lecture'),
(10, 'DSA220', 'CS-1A', 'F2604SAMP003', 201, '1st', '2026-2027', 'Friday', '14:30:00', '17:30:00', 'Laboratory'),
(11, 'ITN201', 'IT-2B', 'F2604SAMP001', 202, '1st', '2026-2027', 'Monday,Wednesday', '10:00:00', '11:30:00', 'Laboratory'),
(12, 'DBS205', 'IT-2B', 'F2604SAMP003', 201, '1st', '2026-2027', 'Tuesday,Thursday', '15:00:00', '16:30:00', 'Laboratory'),
(13, 'NET301', 'IT-2B', 'F2604SAMP004', 202, '1st', '2026-2027', 'Friday', '08:00:00', '11:00:00', 'Laboratory'),
(14, 'SE402', 'CS-4A', 'F2604SAMP001', 205, '1st', '2026-2027', 'Saturday', '09:00:00', '12:00:00', 'Lecture'),
(15, 'HCI210', 'CS-3A', 'F2604SAMP005', 206, '1st', '2026-2027', 'Saturday', '13:00:00', '16:00:00', ''),
(16, 'CYS330', 'CS-4A', 'F2604SAMP006', 202, '1st', '2026-2027', 'Thursday', '17:00:00', '19:00:00', 'Laboratory'),
(17, 'CCS101', 'IT-1A', 'FIT2604001', NULL, '1st', '2026-2027', 'Monday', '08:00:00', '10:00:00', 'Lecture'),
(18, 'CCS102', 'IT-1A', 'FIT2604001', NULL, '1st', '2026-2027', 'Monday', '10:00:00', '12:00:00', 'Laboratory'),
(19, 'ETH101', 'IT-1A', 'FIT2604006', NULL, '1st', '2026-2027', 'Tuesday', '08:00:00', '10:00:00', 'Lecture'),
(20, 'MAT101', 'IT-1A', 'FIT2604006', NULL, '1st', '2026-2027', 'Tuesday', '10:00:00', '12:00:00', 'Lecture'),
(21, 'NSTP1', 'IT-1A', 'FIT2604006', NULL, '1st', '2026-2027', 'Saturday', '08:00:00', '11:00:00', 'Lecture'),
(22, 'PED101', 'IT-1A', 'FIT2604006', NULL, '1st', '2026-2027', 'Thursday', '13:00:00', '15:00:00', 'Lecture'),
(23, 'PSY100', 'IT-1A', 'FIT2604006', NULL, '1st', '2026-2027', 'Wednesday', '08:00:00', '10:00:00', 'Lecture'),
(24, 'CCS103', 'IT-1A', 'FIT2604001', NULL, '2nd', '2026-2027', 'Monday', '13:00:00', '15:00:00', 'Laboratory'),
(25, 'CCS104', 'IT-1A', 'FIT2604003', NULL, '2nd', '2026-2027', 'Tuesday', '13:00:00', '15:00:00', 'Lecture'),
(26, 'CCS105', 'IT-1A', 'FIT2604005', NULL, '2nd', '2026-2027', 'Wednesday', '10:00:00', '12:00:00', 'Lecture'),
(27, 'CCS106', 'IT-1A', 'FIT2604006', NULL, '2nd', '2026-2027', 'Thursday', '10:00:00', '12:00:00', 'Lecture'),
(28, 'COM101', 'IT-1A', 'FIT2604006', NULL, '2nd', '2026-2027', 'Friday', '08:00:00', '10:00:00', 'Lecture'),
(29, 'GAD101', 'IT-1A', 'FIT2604006', NULL, '2nd', '2026-2027', 'Friday', '10:00:00', '12:00:00', 'Lecture'),
(30, 'NSTP2', 'IT-1A', 'FIT2604006', NULL, '2nd', '2026-2027', 'Saturday', '13:00:00', '16:00:00', 'Lecture'),
(31, 'PED102', 'IT-1A', 'FIT2604006', NULL, '2nd', '2026-2027', 'Thursday', '15:00:00', '17:00:00', 'Lecture'),
(32, 'ACT101', 'IT-2A', 'FIT2604006', NULL, '1st', '2027-2028', 'Monday', '08:00:00', '10:00:00', 'Lecture'),
(33, 'CCS107', 'IT-2A', 'FIT2604001', NULL, '1st', '2027-2028', 'Monday', '10:00:00', '12:00:00', 'Laboratory'),
(34, 'CCS108', 'IT-2A', 'FIT2604001', NULL, '1st', '2027-2028', 'Tuesday', '08:00:00', '10:00:00', 'Laboratory'),
(35, 'CCS109', 'IT-2A', 'FIT2604003', NULL, '1st', '2027-2028', 'Tuesday', '10:00:00', '12:00:00', 'Lecture'),
(36, 'ITEW1', 'IT-2A', 'FIT2604002', NULL, '1st', '2027-2028', 'Wednesday', '08:00:00', '10:00:00', 'Laboratory'),
(37, 'PED103', 'IT-2A', 'FIT2604006', NULL, '1st', '2027-2028', 'Thursday', '13:00:00', '15:00:00', 'Lecture'),
(38, 'STS101', 'IT-2A', 'FIT2604006', NULL, '1st', '2027-2028', 'Friday', '08:00:00', '10:00:00', 'Lecture'),
(39, 'HIS101', 'IT-2A', 'FIT2604006', NULL, '2nd', '2027-2028', 'Monday', '13:00:00', '15:00:00', 'Lecture'),
(40, 'ITEW3', 'IT-2A', 'FIT2604002', NULL, '2nd', '2027-2028', 'Wednesday', '10:00:00', '12:00:00', 'Laboratory'),
(41, 'ITP103', 'IT-2A', 'FIT2604003', NULL, '2nd', '2027-2028', 'Tuesday', '13:00:00', '15:00:00', 'Lecture'),
(42, 'ITP104', 'IT-2A', 'FIT2604003', NULL, '2nd', '2027-2028', 'Thursday', '10:00:00', '12:00:00', 'Laboratory'),
(43, 'ITP105', 'IT-2A', 'FIT2604004', NULL, '2nd', '2027-2028', 'Friday', '10:00:00', '12:00:00', 'Laboratory'),
(44, 'ITP106', 'IT-2A', 'FIT2604005', NULL, '2nd', '2027-2028', 'Wednesday', '13:00:00', '15:00:00', 'Lecture'),
(45, 'SOC101', 'IT-2A', 'FIT2604006', NULL, '2nd', '2027-2028', 'Thursday', '08:00:00', '10:00:00', 'Lecture'),
(46, 'TEC101', 'IT-2A', 'FIT2604006', NULL, '2nd', '2027-2028', 'Friday', '13:00:00', '15:00:00', 'Lecture'),
(47, 'CCS112', 'IT-3A', 'FIT2604007', NULL, '1st', '2028-2029', 'Monday', '08:00:00', '10:00:00', 'Laboratory'),
(48, 'CCS113', 'IT-3A', 'FIT2604004', NULL, '1st', '2028-2029', 'Tuesday', '08:00:00', '10:00:00', 'Laboratory'),
(49, 'HMN101', 'IT-3A', 'FIT2604006', NULL, '1st', '2028-2029', 'Wednesday', '08:00:00', '10:00:00', 'Lecture'),
(50, 'ITEW4', 'IT-3A', 'FIT2604002', NULL, '1st', '2028-2029', 'Thursday', '08:00:00', '10:00:00', 'Laboratory'),
(51, 'ITP107', 'IT-3A', 'FIT2604005', NULL, '1st', '2028-2029', 'Friday', '08:00:00', '10:00:00', 'Laboratory'),
(52, 'ITP108', 'IT-3A', 'FIT2604007', NULL, '1st', '2028-2029', 'Saturday', '08:00:00', '11:00:00', 'Lecture'),
(53, 'ITP109', 'IT-3A', 'FIT2604004', NULL, '1st', '2028-2029', 'Friday', '10:00:00', '12:00:00', 'Laboratory'),
(80, 'ITEW6', 'IT-4A', 'FIT2604002', NULL, '1st', '2029-2030', 'Monday', '08:00:00', '10:00:00', 'Laboratory'),
(81, 'ITP113', 'IT-4A', 'FIT2604007', NULL, '1st', '2029-2030', 'Tuesday', '08:00:00', '12:00:00', 'Laboratory');

-- --------------------------------------------------------

--
-- Table structure for table `students`
--

CREATE TABLE `students` (
  `student_id` varchar(20) NOT NULL,
  `section` varchar(20) DEFAULT NULL,
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

INSERT INTO `students` (`student_id`, `section`, `first_name`, `middle_name`, `last_name`, `birth_date`, `sex`, `civil_status`, `contact_number`, `email`, `password`, `address`, `emergency_contact`, `emergency_contact_num`, `profile_photo`, `nationality`, `religion`, `skills`, `created_at`, `updated_at`) VALUES
('2026-2023141', 'IT-3D', 'Juan', 'Dela', 'Cruz', '2026-04-03', 'Male', 'Single', '+631234567899', 'juan@email.com', 'D2026-04-03', 'blk 71 lot 52 phase 1 mabuhay city of cabuyao laguna', 'juan', '+631234567899', NULL, 'filipino', 'Roman Catholic', 'Programming', '2026-04-03 10:30:16', '2026-04-20 04:06:24'),
('2026-310001', 'IT-1A', 'Ariana', 'M.', 'Delos Reyes', '2006-03-14', 'Female', 'Single', '+639151000001', 'ariana.delosreyes@student.ccs.edu.ph', 'D2006-03-14', 'Zone 1, City A', 'Maya Delos Reyes', '+639171111001', NULL, 'Filipino', 'Roman Catholic', 'HTML, CSS, React', '2026-04-18 22:29:34', '2026-04-20 03:48:36'),
('2026-310002', 'IT-1A', 'Bryan', 'C.', 'Luna', '2005-10-22', 'Male', 'Single', '+639151000002', 'bryan.luna@student.ccs.edu.ph', 'L2005-10-22', 'Zone 2, City A', 'Carla Luna', '+639171111002', NULL, 'Filipino', 'Roman Catholic', 'JavaScript, Node.js', '2026-04-18 22:29:34', '2026-04-20 03:48:36'),
('2026-310003', 'CS-1A', 'Camille', 'A.', 'Soriano', '2006-01-07', 'Female', 'Single', '+639151000003', 'camille.soriano@student.ccs.edu.ph', 'S2006-01-07', 'Zone 3, City B', 'Andrei Soriano', '+639171111003', NULL, 'Filipino', 'Christian', 'Python, SQL', '2026-04-18 22:29:34', '2026-04-20 03:48:36'),
('2026-310004', 'CS-1A', 'Daniel', 'R.', 'Pineda', '2005-06-30', 'Male', 'Single', '+639151000004', 'daniel.pineda@student.ccs.edu.ph', 'P2005-06-30', 'Zone 4, City B', 'Rina Pineda', '+639171111004', NULL, 'Filipino', 'Roman Catholic', 'C++, Data Structures', '2026-04-18 22:29:34', '2026-04-20 03:48:36'),
('2026-310005', 'IT-2B', 'Elaine', 'T.', 'Francisco', '2004-12-19', 'Female', 'Single', '+639151000005', 'elaine.francisco@student.ccs.edu.ph', 'F2004-12-19', 'Zone 1, City C', 'Tomas Francisco', '+639171111005', NULL, 'Filipino', 'Roman Catholic', 'UI/UX, Figma', '2026-04-18 22:29:34', '2026-04-20 03:48:36'),
('2026-310006', 'IT-2B', 'Francis', 'J.', 'Aguirre', '2004-09-11', 'Male', 'Single', '+639151000006', 'francis.aguirre@student.ccs.edu.ph', 'A2004-09-11', 'Zone 2, City C', 'Janet Aguirre', '+639171111006', NULL, 'Filipino', 'Christian', 'Laravel, MySQL', '2026-04-18 22:29:34', '2026-04-20 03:48:36'),
('2026-310007', 'CS-3A', 'Grace', 'L.', 'Torres', '2003-05-27', 'Female', 'Single', '+639151000007', 'grace.torres@student.ccs.edu.ph', 'T2003-05-27', 'Zone 3, City D', 'Luis Torres', '+639171111007', NULL, 'Filipino', 'Roman Catholic', 'Data Analytics, Power BI', '2026-04-18 22:29:34', '2026-04-20 03:48:36'),
('2026-310008', 'CS-4A', 'Harold', 'N.', 'Valdez', '2003-08-08', 'Male', 'Single', '+639151000008', 'harold.valdez@student.ccs.edu.ph', 'V2003-08-08', 'Zone 4, City D', 'Nena Valdez', '+639171111008', NULL, 'Filipino', 'Roman Catholic', 'Networking, Linux', '2026-04-18 22:29:34', '2026-04-20 03:48:36'),
('423412342134', 'UNASSIGNED', 'juan', 'juan', 'juan', '2026-04-03', 'Male', 'Single', '+631234567899', 'gio@example.com', 'password', 'fdsaf asdf asfasdfa sfd asdfa', 'eve casdfasd', '+631234567899', NULL, 'filipino', 'roman catholic', NULL, '2026-04-03 09:56:30', '2026-04-20 03:53:21'),
('IT26-1A-0001', 'IT-1A', 'Liam', 'A.', 'Navarro', '2007-02-15', 'Male', 'Single', '+639181110001', 'liam.navarro@student.ccs.edu.ph', 'N2007-02-15', 'City A', 'Mia Navarro', '+639171110001', NULL, 'Filipino', 'Roman Catholic', 'Python, Java', '2026-04-18 22:40:51', '2026-04-20 03:48:36'),
('IT26-2A-0001', 'IT-2A', 'Ella', 'B.', 'Santos', '2006-08-22', 'Female', 'Single', '+639181110002', 'ella.santos@student.ccs.edu.ph', 'S2006-08-22', 'City B', 'Rico Santos', '+639171110002', NULL, 'Filipino', 'Christian', 'Web Development, SQL', '2026-04-18 22:40:51', '2026-04-20 03:48:36'),
('IT26-3A-0001', 'IT-3A', 'Noah', 'C.', 'DelaCruz', '2005-11-03', 'Male', 'Single', '+639181110003', 'noah.delacruz@student.ccs.edu.ph', 'D2005-11-03', 'City C', 'Ana DelaCruz', '+639171110003', NULL, 'Filipino', 'Roman Catholic', 'Mobile Development, Networking', '2026-04-18 22:40:51', '2026-04-20 03:48:36'),
('IT26-4A-0001', 'IT-4A', 'Mia', 'D.', 'Castillo', '2004-04-21', 'Female', 'Single', '+639181110004', 'mia.castillo@student.ccs.edu.ph', 'C2004-04-21', 'City D', 'Joel Castillo', '+639171110004', NULL, 'Filipino', 'Roman Catholic', 'Frameworks, DevOps', '2026-04-18 22:45:29', '2026-04-20 03:48:36');

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
('2026-2023141', 'BSIT', NULL, NULL, 1, 'IT-3D', NULL, 'Enrolled', NULL, NULL),
('2026-310001', 'BSIT', NULL, 'Web and Mobile', 1, 'IT-1A', 'Regular', 'Enrolled', NULL, '2026-08-15'),
('2026-310002', 'BSIT', NULL, 'Web and Mobile', 1, 'IT-1A', 'Regular', 'Enrolled', NULL, '2026-08-15'),
('2026-310003', 'BSCS', NULL, 'Software Engineering', 1, 'CS-1A', 'Regular', 'Enrolled', 'Academic', '2026-08-15'),
('2026-310004', 'BSCS', NULL, 'Software Engineering', 1, 'CS-1A', 'Regular', 'Enrolled', NULL, '2026-08-15'),
('2026-310005', 'BSIT', NULL, 'Network and Security', 2, 'IT-2B', 'Regular', 'Enrolled', NULL, '2025-08-15'),
('2026-310006', 'BSIT', NULL, 'Network and Security', 2, 'IT-2B', 'Regular', 'Enrolled', NULL, '2025-08-15'),
('2026-310007', 'BSCS', NULL, 'Data Science', 3, 'CS-3A', 'Regular', 'Enrolled', 'CHED', '2024-08-15'),
('2026-310008', 'BSCS', NULL, 'Data Science', 4, 'CS-4A', 'Regular', 'Enrolled', NULL, '2023-08-15'),
('423412342134', 'bsit', NULL, NULL, 1, 'UNASSIGNED', NULL, 'Enrolled', NULL, NULL),
('IT26-1A-0001', 'BSIT', NULL, 'Web and Mobile', 1, 'IT-1A', 'Regular', 'Enrolled', NULL, '2026-08-01'),
('IT26-2A-0001', 'BSIT', NULL, 'Systems and Networking', 2, 'IT-2A', 'Regular', 'Enrolled', NULL, '2025-08-01'),
('IT26-3A-0001', 'BSIT', NULL, 'Systems and Networking', 3, 'IT-3A', 'Regular', 'Enrolled', 'Academic', '2024-08-01'),
('IT26-4A-0001', 'BSIT', NULL, 'Web and Mobile', 4, 'IT-4A', 'Regular', 'Enrolled', NULL, '2023-08-01');

-- --------------------------------------------------------

--
-- Table structure for table `student_course_assignments`
--

CREATE TABLE `student_course_assignments` (
  `student_id` varchar(20) NOT NULL,
  `subject_code` varchar(20) NOT NULL,
  `assigned_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `student_course_assignments`
--

INSERT INTO `student_course_assignments` (`student_id`, `subject_code`, `assigned_at`) VALUES
('2026-310001', 'CSA101', '2026-04-18 22:29:34'),
('2026-310001', 'CSA102', '2026-04-18 22:29:34'),
('2026-310001', 'ITN101', '2026-04-18 22:29:34'),
('2026-310002', 'CSA101', '2026-04-18 22:29:34'),
('2026-310002', 'CSA102', '2026-04-18 22:29:34'),
('2026-310002', 'ITN101', '2026-04-18 22:29:34'),
('2026-310003', 'CSA101', '2026-04-18 22:29:34'),
('2026-310003', 'CSA102', '2026-04-18 22:29:34'),
('2026-310003', 'DSA220', '2026-04-18 22:29:34'),
('2026-310004', 'CSA101', '2026-04-18 22:29:34'),
('2026-310004', 'CSA102', '2026-04-18 22:29:34'),
('2026-310004', 'DSA220', '2026-04-18 22:29:34'),
('2026-310005', 'DBS205', '2026-04-18 22:29:34'),
('2026-310005', 'ITN201', '2026-04-18 22:29:34'),
('2026-310005', 'NET301', '2026-04-18 22:29:34'),
('2026-310006', 'DBS205', '2026-04-18 22:29:34'),
('2026-310006', 'ITN201', '2026-04-18 22:29:34'),
('2026-310006', 'NET301', '2026-04-18 22:29:34'),
('2026-310007', 'CYS330', '2026-04-18 22:29:34'),
('2026-310007', 'HCI210', '2026-04-18 22:29:34'),
('2026-310007', 'SE402', '2026-04-18 22:29:34'),
('2026-310008', 'CYS330', '2026-04-18 22:29:34'),
('2026-310008', 'HCI210', '2026-04-18 22:29:34'),
('2026-310008', 'SE402', '2026-04-18 22:29:34'),
('IT26-1A-0001', 'CCS101', '2026-04-18 22:40:51'),
('IT26-1A-0001', 'CCS102', '2026-04-18 22:40:51'),
('IT26-1A-0001', 'CCS103', '2026-04-18 22:40:51'),
('IT26-1A-0001', 'CCS104', '2026-04-18 22:40:51'),
('IT26-1A-0001', 'CCS105', '2026-04-18 22:40:51'),
('IT26-1A-0001', 'CCS106', '2026-04-18 22:40:51'),
('IT26-1A-0001', 'COM101', '2026-04-18 22:40:51'),
('IT26-1A-0001', 'ETH101', '2026-04-18 22:40:51'),
('IT26-1A-0001', 'GAD101', '2026-04-18 22:40:51'),
('IT26-1A-0001', 'MAT101', '2026-04-18 22:40:51'),
('IT26-1A-0001', 'NSTP1', '2026-04-18 22:40:51'),
('IT26-1A-0001', 'NSTP2', '2026-04-18 22:40:51'),
('IT26-1A-0001', 'PED101', '2026-04-18 22:40:51'),
('IT26-1A-0001', 'PED102', '2026-04-18 22:40:51'),
('IT26-1A-0001', 'PSY100', '2026-04-18 22:40:51'),
('IT26-2A-0001', 'ACT101', '2026-04-18 22:40:51'),
('IT26-2A-0001', 'CCS107', '2026-04-18 22:40:51'),
('IT26-2A-0001', 'CCS108', '2026-04-18 22:40:51'),
('IT26-2A-0001', 'CCS109', '2026-04-18 22:40:51'),
('IT26-2A-0001', 'HIS101', '2026-04-18 22:40:51'),
('IT26-2A-0001', 'ITEW1', '2026-04-18 22:40:51'),
('IT26-2A-0001', 'ITEW3', '2026-04-18 22:40:51'),
('IT26-2A-0001', 'ITP103', '2026-04-18 22:40:51'),
('IT26-2A-0001', 'ITP104', '2026-04-18 22:40:51'),
('IT26-2A-0001', 'ITP105', '2026-04-18 22:40:51'),
('IT26-2A-0001', 'ITP106', '2026-04-18 22:40:51'),
('IT26-2A-0001', 'PED103', '2026-04-18 22:40:51'),
('IT26-2A-0001', 'SOC101', '2026-04-18 22:40:51'),
('IT26-2A-0001', 'STS101', '2026-04-18 22:40:51'),
('IT26-2A-0001', 'TEC101', '2026-04-18 22:40:51'),
('IT26-3A-0001', 'CCS112', '2026-04-18 22:40:51'),
('IT26-3A-0001', 'CCS113', '2026-04-18 22:40:51'),
('IT26-3A-0001', 'HMN101', '2026-04-18 22:40:51'),
('IT26-3A-0001', 'ITEW4', '2026-04-18 22:40:51'),
('IT26-3A-0001', 'ITP107', '2026-04-18 22:40:51'),
('IT26-3A-0001', 'ITP108', '2026-04-18 22:40:51'),
('IT26-3A-0001', 'ITP109', '2026-04-18 22:40:51'),
('IT26-4A-0001', 'ITEW6', '2026-04-18 22:45:29'),
('IT26-4A-0001', 'ITP113', '2026-04-18 22:45:29');

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

--
-- Dumping data for table `student_grades`
--

INSERT INTO `student_grades` (`grade_id`, `student_id`, `subject_code`, `semester`, `academic_year`, `midterm_grade`, `final_grade`, `gpa`, `remarks`) VALUES
(1, '2026-310005', 'ITN201', '1st', '2025-2026', 1.75, 1.50, 1.62, 'Passed'),
(2, '2026-310005', 'DBS205', '1st', '2025-2026', 2.00, 1.75, 1.88, 'Passed'),
(3, '2026-310006', 'ITN201', '1st', '2025-2026', 2.25, 2.00, 2.12, 'Passed'),
(4, '2026-310006', 'DBS205', '1st', '2025-2026', 2.00, 2.25, 2.12, 'Passed'),
(5, '2026-310007', 'SE402', '2nd', '2025-2026', 1.50, 1.25, 1.37, 'Passed'),
(6, '2026-310007', 'HCI210', '2nd', '2025-2026', 1.75, 1.50, 1.62, 'Passed'),
(7, '2026-310008', 'SE402', '2nd', '2025-2026', 1.75, 1.50, 1.62, 'Passed'),
(8, '2026-310008', 'CYS330', '2nd', '2025-2026', 2.00, 1.75, 1.88, 'Passed');

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

--
-- Dumping data for table `student_internship`
--

INSERT INTO `student_internship` (`internship_id`, `student_id`, `company_name`, `supervisor`, `start_date`, `end_date`, `hours_rendered`, `eval_grade`) VALUES
(1, '2026-310007', 'Innovatech Solutions', 'Engr. Paolo Dizon', '2026-01-15', '2026-04-15', 360, 1.50),
(2, '2026-310008', 'NetSecure Labs', 'Ms. Karen Yulo', '2026-01-15', '2026-04-15', 360, 1.75);

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

--
-- Dumping data for table `student_orgs`
--

INSERT INTO `student_orgs` (`org_id`, `student_id`, `organization_name`, `position`, `academic_year`) VALUES
(1, '2026-310001', 'Junior Developers Guild', 'Member', '2026-2027'),
(2, '2026-310002', 'Junior Developers Guild', 'Treasurer', '2026-2027'),
(3, '2026-310003', 'Computing Society', 'Secretary', '2026-2027'),
(4, '2026-310004', 'Computing Society', 'Member', '2026-2027'),
(5, '2026-310005', 'Network Enthusiasts Club', 'Vice President', '2026-2027'),
(6, '2026-310006', 'Network Enthusiasts Club', 'Member', '2026-2027'),
(7, '2026-310007', 'Data Science Circle', 'President', '2026-2027'),
(8, '2026-310008', 'Data Science Circle', 'Member', '2026-2027');

-- --------------------------------------------------------

--
-- Table structure for table `student_violations`
--

CREATE TABLE `student_violations` (
  `violation_id` int(11) NOT NULL,
  `student_id` varchar(20) NOT NULL,
  `violation_type` varchar(120) NOT NULL,
  `subject_context` varchar(120) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `severity` enum('Minor','Warning','Serious','Major') DEFAULT 'Warning',
  `status` enum('Active','Resolved','Dismissed') DEFAULT 'Active',
  `incident_date` date NOT NULL,
  `reported_by` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
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
('ACT101', 'Principles of Accounting', 3, 3, 0, 'GE'),
('BIG3758', 'Large Payload Subject', 3, 3, 0, 'Professional'),
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
('CSA101', 'Introduction to Programming', 3, 2, 3, 'Core'),
('CSA102', 'Discrete Structures', 3, 3, 0, 'Core'),
('CSS113', 'ljhkgkjhgk', 3, 3, 0, 'Professional'),
('CYS330', 'Ethical Hacking Fundamentals', 3, 2, 3, 'Professional'),
('DBS205', 'Database Management Systems', 3, 2, 3, 'Professional'),
('DOCX8865', 'Docx Subject', 3, 3, 0, 'Professional'),
('DSA220', 'Data Structures and Algorithms', 3, 2, 3, 'Core'),
('ETH101', 'Ethics', 3, 3, 0, 'GE'),
('GAD101', 'Gender and Development', 3, 3, 0, 'GE'),
('HCI210', 'Human Computer Interaction', 3, 3, 0, 'Professional'),
('HIS101', 'Readings in Philippine History', 3, 3, 0, 'GE'),
('HMN101', 'Art Appreciation', 3, 3, 0, 'GE'),
('ITEW1', 'Electronic Commerce', 3, 2, 3, 'Professional'),
('ITEW3', 'Server Side Scripting', 3, 2, 3, 'Professional'),
('ITEW4', 'Responsive Web Design', 3, 2, 3, 'Professional'),
('ITEW6', 'Web Development Frameworks', 3, 2, 3, 'Professional'),
('ITN101', 'Web Development Fundamentals', 3, 2, 3, 'Professional'),
('ITN201', 'Object-Oriented Programming', 3, 2, 3, 'Professional'),
('ITP103', 'System Integration and Architecture', 3, 3, 0, 'Professional'),
('ITP104', 'Information Management 2', 3, 2, 3, 'Professional'),
('ITP105', 'Networking and Communication 2', 3, 2, 3, 'Professional'),
('ITP106', 'Human Computer Interaction 2', 3, 3, 0, 'Professional'),
('ITP107', 'Mobile Application Development', 3, 2, 3, 'Professional'),
('ITP108', 'Capstone Project 1', 3, 3, 0, 'Capstone'),
('ITP109', 'Platform Technologies', 3, 2, 3, 'Professional'),
('ITP113', 'IT Practicum (500 hours)', 6, 0, 6, 'Practicum'),
('MAT101', 'Mathematics in the Modern World', 3, 3, 0, 'GE'),
('NET301', 'Computer Networks', 3, 2, 3, 'Professional'),
('NSTP1', 'National Service Training Program 1', 3, 3, 0, 'GE'),
('NSTP2', 'National Service Training Program 2', 3, 3, 0, 'GE'),
('PED101', 'Physical Education 1', 2, 2, 0, 'GE'),
('PED102', 'Physical Education 2', 2, 2, 0, 'GE'),
('PED103', 'Physical Education 3', 2, 2, 0, 'GE'),
('PSY100', 'Understanding the Self', 3, 3, 0, 'GE'),
('SE402', 'Software Engineering 2', 3, 3, 0, 'Capstone'),
('SOC101', 'The Contemporary World', 3, 3, 0, 'GE'),
('STS101', 'Science, Technology and Society', 3, 3, 0, 'GE'),
('TEC101', 'Technopreneurship', 3, 3, 0, 'GE'),
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
(15, 'F6fb6043c547846fa8ed', 'Faculty', 'fsdaf@email.edu.ph', '$2a$10$qNd6BeEDQtilRQPa0yBjqeQ1zMROIcrsGikKFcXEBkqSEfg94yKS2', 1, NULL),
(16, 'F296fefe0f0f64947bc8', 'Faculty', 'calugasgio@email.edu.com', '$2a$10$OZKOwbo1t4EtpVgpcd6nF.ggjgy2RQnYlOZyMiU3MKMJ6ZxoEe9cO', 1, NULL),
(17, '423412342134', 'Student', 'gio@example.com', '$2a$10$f.QK2/hlWy.e4uYYV2.7HeLJzLh0VLH1uoCA0o0d55Sm7zXMZwItG', 1, NULL),
(18, '2026-2023141', 'Student', 'juan@email.com', '$2a$10$Od2aJc7yYuk37oV1etROEez/I7Rf0aEa0ix8odsTe1cu1qsEFeg6y', 1, '2026-04-20 03:14:13'),
(19, 'ADM-mo4ozpp2-a2a5', 'Admin', 'giomcgrey@gmail.com', '$2a$10$Qmeglk264v6djEEfT/1mJ.AM9.R..viXPEJX74RUZuN7FyvtRJwvu', 1, '2026-04-20 03:14:19'),
(20, 'F2604SAMP001', 'Faculty', 'maria.santos@ccs.edu.ph', '$2a$10$nbATdxxkXmfbEjzjUUr8reO30r4coUA/OCSwBVlvLpRZH5NX7cKie', 1, NULL),
(21, 'F2604SAMP002', 'Faculty', 'carlo.reyes@ccs.edu.ph', '$2a$10$BBtmFoklbnKdQQN0ffgTxuWFABX4BMKhNxU9UTEAA6rDXULl9/zt6', 1, NULL),
(22, 'F2604SAMP003', 'Faculty', 'nina.ortega@ccs.edu.ph', '$2a$10$9ztPwrueGOuPm9sk6umM..p20o4c/4we11dH6nR3SXFDkmCPwEyxe', 1, '2026-04-20 03:22:25'),
(23, 'F2604SAMP004', 'Faculty', 'leo.navarro@ccs.edu.ph', '$2a$10$Xz/DmbDj4pJopgMQ.MGcMOHokH.d.jWtBd8bRW0QeA/YntDl78SkS', 1, NULL),
(24, 'F2604SAMP005', 'Faculty', 'paula.mendoza@ccs.edu.ph', '$2a$10$rauLsEfUsnCTM4lW9n7v.e96lRwqwheRvx5xCr.L4eiJl3E/8rl/u', 1, NULL),
(25, 'F2604SAMP006', 'Faculty', 'ramon.villanueva@ccs.edu.ph', '$2a$10$osPJ.dTIMOCWS6APuHpameBN9ajyuzsRhFArOsrkQs/D7djFaTZ8W', 1, NULL),
(26, '2026-310001', 'Student', 'ariana.delosreyes@student.ccs.edu.ph', '$2a$10$9NPVDCsePu1umcpd6qEZi.39g9D9KgOcTM4eosJ5yIKLjawk59nCK', 1, NULL),
(27, '2026-310002', 'Student', 'bryan.luna@student.ccs.edu.ph', '$2a$10$9NPVDCsePu1umcpd6qEZi.39g9D9KgOcTM4eosJ5yIKLjawk59nCK', 1, NULL),
(28, '2026-310003', 'Student', 'camille.soriano@student.ccs.edu.ph', '$2a$10$9NPVDCsePu1umcpd6qEZi.39g9D9KgOcTM4eosJ5yIKLjawk59nCK', 1, NULL),
(29, '2026-310004', 'Student', 'daniel.pineda@student.ccs.edu.ph', '$2a$10$9NPVDCsePu1umcpd6qEZi.39g9D9KgOcTM4eosJ5yIKLjawk59nCK', 1, NULL),
(30, '2026-310005', 'Student', 'elaine.francisco@student.ccs.edu.ph', '$2a$10$9NPVDCsePu1umcpd6qEZi.39g9D9KgOcTM4eosJ5yIKLjawk59nCK', 1, NULL),
(31, '2026-310006', 'Student', 'francis.aguirre@student.ccs.edu.ph', '$2a$10$9NPVDCsePu1umcpd6qEZi.39g9D9KgOcTM4eosJ5yIKLjawk59nCK', 1, NULL),
(32, '2026-310007', 'Student', 'grace.torres@student.ccs.edu.ph', '$2a$10$9NPVDCsePu1umcpd6qEZi.39g9D9KgOcTM4eosJ5yIKLjawk59nCK', 1, '2026-04-18 22:30:22'),
(33, '2026-310008', 'Student', 'harold.valdez@student.ccs.edu.ph', '$2a$10$9NPVDCsePu1umcpd6qEZi.39g9D9KgOcTM4eosJ5yIKLjawk59nCK', 1, NULL),
(34, 'FIT2604001', 'Faculty', 'aira.santos.it@ccs.edu.ph', '$2a$10$sl/9YLdiqJ.YKuiZijcVu.2dudd0D7dCp2Nt/7VDaZzLMoVt1Hv2.', 1, NULL),
(35, 'FIT2604002', 'Faculty', 'mark.reyes.it@ccs.edu.ph', '$2a$10$8tDPfy./y6/k5Q2mzIuGYOJXU2dtg8JYwTtksiLOz/vdvUEb932n6', 1, NULL),
(36, 'FIT2604003', 'Faculty', 'nina.flores.it@ccs.edu.ph', '$2a$10$IGQEYawP0R./lhHqZwYda.rsdlM/ZrVRAl2rnio2YJ0PODLdwjN/6', 1, NULL),
(37, 'FIT2604004', 'Faculty', 'allan.cruz.it@ccs.edu.ph', '$2a$10$yCNPk4ajgWC.tptpuPaC3uBj025m0LlY3vOlbWQPnYThYhZAM.rkS', 1, NULL),
(38, 'FIT2604005', 'Faculty', 'claire.ramos.it@ccs.edu.ph', '$2a$10$3u3oewvTCoesC97NP13PduFbwg/bmE9X2fMGy1/ciuaqTvNLUv/Im', 1, NULL),
(39, 'FIT2604006', 'Faculty', 'joel.bautista.gened@ccs.edu.ph', '$2a$10$Sa2sx0mA.2oWIZ5D1GZ6f.ax4OlooAWcm/kAoS3KnZpM40SsiYQFi', 1, NULL),
(40, 'FIT2604007', 'Faculty', 'paolo.valdez.capstone@ccs.edu.ph', '$2a$10$lTcg2R721mSvI0gLRlgUIuSBe42hGXfCL9qUJEuvi4rg9hsz4RjLW', 1, NULL),
(41, 'IT26-1A-0001', 'Student', 'liam.navarro@student.ccs.edu.ph', '$2a$10$9NPVDCsePu1umcpd6qEZi.39g9D9KgOcTM4eosJ5yIKLjawk59nCK', 1, NULL),
(42, 'IT26-2A-0001', 'Student', 'ella.santos@student.ccs.edu.ph', '$2a$10$9NPVDCsePu1umcpd6qEZi.39g9D9KgOcTM4eosJ5yIKLjawk59nCK', 1, NULL),
(43, 'IT26-3A-0001', 'Student', 'noah.delacruz@student.ccs.edu.ph', '$2a$10$9NPVDCsePu1umcpd6qEZi.39g9D9KgOcTM4eosJ5yIKLjawk59nCK', 1, NULL),
(51, 'IT26-4A-0001', 'Student', 'mia.castillo@student.ccs.edu.ph', '$2a$10$OIZi7Igweec1x1vAa9WSdefXwsV2l3A666FjRVps53meftVeSig4.', 1, '2026-04-20 03:53:51'),
(59, 'F67810cb05a784421957', 'Faculty', 'multi.1774935448@example.com', '$2a$10$m5ox46M4ql6L./HHsYd8N.U.M1rE7Eokl71UoNTt2O78vfK0nia4e', 1, NULL),
(61, 'Ff5edfca52d874e498fc', 'Faculty', 'delacruz@gmail.com', '$2a$10$6Lbfz2G5k/Ggl9e30LDBvu2vEnyjA.bDeoPGlpTEe4R/VmzLe2Fe.', 1, NULL),
(69, 'ZZ-SECTION-0001', 'Student', 'zz.section.0001@test.local', '$2a$10$kUUJ2hSdYFW1mDP68PeGjOLFniUeHIP5iEVJkPsfWoKDnzfGEMcUm', 1, NULL),
(70, 'ZZ-SECTION-0002', 'Student', 'zz.section.0002@test.local', '$2a$10$LX9d6iriqN7ocjpFcyeqZeilGuW.KInQnNFS75ogDCXLMDqZT9OG2', 1, NULL);

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
  ADD PRIMARY KEY (`event_id`),
  ADD KEY `idx_events_start_date` (`start_date`),
  ADD KEY `idx_events_status` (`status`),
  ADD KEY `idx_events_type_start_date` (`event_type`,`start_date`);

--
-- Indexes for table `event_participants`
--
ALTER TABLE `event_participants`
  ADD PRIMARY KEY (`participation_id`),
  ADD KEY `event_id` (`event_id`),
  ADD KEY `idx_event_participants_event_participant` (`event_id`,`participant_id`,`participant_type`);

--
-- Indexes for table `faculty`
--
ALTER TABLE `faculty`
  ADD PRIMARY KEY (`faculty_id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_faculty_last_first` (`last_name`,`first_name`),
  ADD KEY `idx_faculty_specialization` (`specialization`);

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
  ADD KEY `department_id` (`department_id`),
  ADD KEY `idx_faculty_employment_date_hired` (`date_hired`),
  ADD KEY `idx_faculty_employment_assigned_section` (`assigned_section`);

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
  ADD KEY `topic_id` (`topic_id`),
  ADD KEY `idx_lessons_created_at` (`created_at`),
  ADD KEY `idx_lessons_topic_created` (`topic_id`,`created_at`);

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
  ADD KEY `room_id` (`room_id`),
  ADD KEY `idx_schedules_section_day_start` (`section`,`day_of_week`,`start_time`),
  ADD KEY `idx_schedules_academic_semester` (`academic_year`,`semester`),
  ADD KEY `idx_schedules_day_start` (`day_of_week`,`start_time`);

--
-- Indexes for table `students`
--
ALTER TABLE `students`
  ADD PRIMARY KEY (`student_id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_students_last_first` (`last_name`,`first_name`),
  ADD KEY `idx_students_skills_prefix` (`skills`(100)),
  ADD KEY `idx_students_section` (`section`);

--
-- Indexes for table `student_academic`
--
ALTER TABLE `student_academic`
  ADD PRIMARY KEY (`student_id`),
  ADD KEY `idx_student_academic_program_year_section` (`program`,`year_level`,`section`),
  ADD KEY `idx_student_academic_section` (`section`);

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
-- Indexes for table `student_violations`
--
ALTER TABLE `student_violations`
  ADD PRIMARY KEY (`violation_id`),
  ADD KEY `student_id` (`student_id`),
  ADD KEY `status` (`status`),
  ADD KEY `incident_date` (`incident_date`);

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
  ADD KEY `faculty_id` (`faculty_id`),
  ADD KEY `idx_syllabus_created_at` (`created_at`),
  ADD KEY `idx_syllabus_subject_created` (`subject_code`,`created_at`),
  ADD KEY `idx_syllabus_faculty_created` (`faculty_id`,`created_at`);

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
  MODIFY `curriculum_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `curriculum_subjects`
--
ALTER TABLE `curriculum_subjects`
  MODIFY `cs_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=40;

--
-- AUTO_INCREMENT for table `departments`
--
ALTER TABLE `departments`
  MODIFY `dept_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=106;

--
-- AUTO_INCREMENT for table `events`
--
ALTER TABLE `events`
  MODIFY `event_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=107;

--
-- AUTO_INCREMENT for table `event_participants`
--
ALTER TABLE `event_participants`
  MODIFY `participation_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

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
  MODIFY `cert_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

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
  MODIFY `room_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=207;

--
-- AUTO_INCREMENT for table `schedules`
--
ALTER TABLE `schedules`
  MODIFY `schedule_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=82;

--
-- AUTO_INCREMENT for table `student_documents`
--
ALTER TABLE `student_documents`
  MODIFY `doc_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `student_grades`
--
ALTER TABLE `student_grades`
  MODIFY `grade_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `student_internship`
--
ALTER TABLE `student_internship`
  MODIFY `internship_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `student_orgs`
--
ALTER TABLE `student_orgs`
  MODIFY `org_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `student_violations`
--
ALTER TABLE `student_violations`
  MODIFY `violation_id` int(11) NOT NULL AUTO_INCREMENT;

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
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=71;

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
-- Constraints for table `student_violations`
--
ALTER TABLE `student_violations`
  ADD CONSTRAINT `student_violations_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE;

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
