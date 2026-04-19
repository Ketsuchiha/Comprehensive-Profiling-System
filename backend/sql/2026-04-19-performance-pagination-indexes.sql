-- Performance indexes for paginated/list queries
-- Safe to run multiple times.

USE ccs113;

DELIMITER $$

CREATE PROCEDURE ensure_index_if_missing(
  IN p_table_name VARCHAR(64),
  IN p_index_name VARCHAR(64),
  IN p_index_columns VARCHAR(255)
)
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = DATABASE()
      AND table_name = p_table_name
  )
  AND NOT EXISTS (
    SELECT 1
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = p_table_name
      AND index_name = p_index_name
  ) THEN
    SET @sql = CONCAT(
      'CREATE INDEX ',
      p_index_name,
      ' ON ',
      p_table_name,
      ' (',
      p_index_columns,
      ')'
    );

    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
  END IF;
END$$

DELIMITER ;

-- Events
CALL ensure_index_if_missing('events', 'idx_events_start_date', 'start_date');
CALL ensure_index_if_missing('events', 'idx_events_status', 'status');
CALL ensure_index_if_missing('events', 'idx_events_type_start_date', 'event_type, start_date');

-- Event participants
CALL ensure_index_if_missing('event_participants', 'idx_event_participants_event_participant', 'event_id, participant_id, participant_type');

-- Faculty
CALL ensure_index_if_missing('faculty', 'idx_faculty_last_first', 'last_name, first_name');
CALL ensure_index_if_missing('faculty', 'idx_faculty_specialization', 'specialization');

-- Faculty employment
CALL ensure_index_if_missing('faculty_employment', 'idx_faculty_employment_date_hired', 'date_hired');
CALL ensure_index_if_missing('faculty_employment', 'idx_faculty_employment_assigned_section', 'assigned_section');

-- Students
CALL ensure_index_if_missing('students', 'idx_students_last_first', 'last_name, first_name');
CALL ensure_index_if_missing('students', 'idx_students_skills_prefix', 'skills(100)');

-- Student academic profile
CALL ensure_index_if_missing('student_academic', 'idx_student_academic_program_year_section', 'program, year_level, section');
CALL ensure_index_if_missing('student_academic', 'idx_student_academic_section', 'section');

-- Schedules
CALL ensure_index_if_missing('schedules', 'idx_schedules_section_day_start', 'section, day_of_week, start_time');
CALL ensure_index_if_missing('schedules', 'idx_schedules_academic_semester', 'academic_year, semester');
CALL ensure_index_if_missing('schedules', 'idx_schedules_day_start', 'day_of_week, start_time');

-- Instruments (syllabus + lessons)
CALL ensure_index_if_missing('syllabus', 'idx_syllabus_created_at', 'created_at');
CALL ensure_index_if_missing('syllabus', 'idx_syllabus_subject_created', 'subject_code, created_at');
CALL ensure_index_if_missing('syllabus', 'idx_syllabus_faculty_created', 'faculty_id, created_at');

CALL ensure_index_if_missing('lessons', 'idx_lessons_created_at', 'created_at');
CALL ensure_index_if_missing('lessons', 'idx_lessons_topic_created', 'topic_id, created_at');

DROP PROCEDURE IF EXISTS ensure_index_if_missing;
