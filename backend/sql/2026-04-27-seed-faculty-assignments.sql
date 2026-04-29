-- Seed data for faculty assignments
-- Adds schedules and faculty_load records for Isabella I. Santos (FBULK260005)

-- Insert schedules for Isabella Santos
INSERT INTO `schedules` (`subject_code`, `section`, `faculty_id`, `room_id`, `semester`, `academic_year`, `day_of_week`, `start_time`, `end_time`, `schedule_type`) VALUES
('CSA101', 'IT-1A', 'FBULK260005', 201, '1st', '2026-2027', 'Monday,Wednesday', '08:00:00', '09:30:00', 'Lecture'),
('CSA102', 'IT-1B', 'FBULK260005', 202, '1st', '2026-2027', 'Tuesday,Thursday', '10:00:00', '11:30:00', 'Lecture'),
('HCI210', 'CS-3A', 'FBULK260005', 203, '1st', '2026-2027', 'Friday', '13:00:00', '15:00:00', 'Laboratory'),
('DSA220', 'IT-2A', 'FBULK260005', 204, '1st', '2026-2027', 'Saturday', '09:00:00', '12:00:00', 'Laboratory'),
('ITN201', 'IT-2B', 'FBULK260005', 205, '2nd', '2026-2027', 'Monday,Wednesday', '14:00:00', '15:30:00', 'Lecture'),
('NET301', 'CS-3B', 'FBULK260005', 206, '2nd', '2026-2027', 'Tuesday,Thursday', '15:00:00', '16:30:00', 'Laboratory');

-- Insert faculty load records for Isabella Santos
INSERT INTO `faculty_load` (`faculty_id`, `subject_code`, `section`, `teaching_units`, `semester`, `academic_year`) VALUES
('FBULK260005', 'CSA101', 'IT-1A', 3, '1st', '2026-2027'),
('FBULK260005', 'CSA102', 'IT-1B', 3, '1st', '2026-2027'),
('FBULK260005', 'HCI210', 'CS-3A', 2, '1st', '2026-2027'),
('FBULK260005', 'DSA220', 'IT-2A', 3, '1st', '2026-2027'),
('FBULK260005', 'ITN201', 'IT-2B', 3, '2nd', '2026-2027'),
('FBULK260005', 'NET301', 'CS-3B', 3, '2nd', '2026-2027');
