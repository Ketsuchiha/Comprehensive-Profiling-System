-- Fix script: ensure valid subject units, add more rooms, and assign rooms to all schedule rows.
-- Safe to run multiple times.

-- =====================================================
-- A) SUBJECT UNITS (random 1..3 when invalid/missing)
-- =====================================================
SET @units_col_exists := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'subjects'
    AND COLUMN_NAME = 'units'
);

SET @add_units_col_sql := IF(
  @units_col_exists = 0,
  'ALTER TABLE subjects ADD COLUMN units TINYINT NULL',
  'SELECT ''subjects.units already exists'' AS info'
);

PREPARE stmt_add_units_col FROM @add_units_col_sql;
EXECUTE stmt_add_units_col;
DEALLOCATE PREPARE stmt_add_units_col;

UPDATE subjects
SET units = FLOOR(1 + RAND() * 3)
WHERE units IS NULL OR units < 1 OR units > 3;

-- =====================================================
-- B) ADD MORE ROOMS (idempotent)
-- =====================================================
INSERT INTO rooms (room_name, building, capacity, room_type)
SELECT 'Room 303', 'Main Building', 45, 'Lecture'
WHERE NOT EXISTS (
  SELECT 1 FROM rooms WHERE room_name = 'Room 303' AND building = 'Main Building'
);

INSERT INTO rooms (room_name, building, capacity, room_type)
SELECT 'Room 304', 'Main Building', 45, 'Lecture'
WHERE NOT EXISTS (
  SELECT 1 FROM rooms WHERE room_name = 'Room 304' AND building = 'Main Building'
);

INSERT INTO rooms (room_name, building, capacity, room_type)
SELECT 'CCS Lab 3', 'Main Building', 40, 'Laboratory'
WHERE NOT EXISTS (
  SELECT 1 FROM rooms WHERE room_name = 'CCS Lab 3' AND building = 'Main Building'
);

INSERT INTO rooms (room_name, building, capacity, room_type)
SELECT 'CCS Lab 4', 'Main Building', 40, 'Laboratory'
WHERE NOT EXISTS (
  SELECT 1 FROM rooms WHERE room_name = 'CCS Lab 4' AND building = 'Main Building'
);

INSERT INTO rooms (room_name, building, capacity, room_type)
SELECT 'Seminar Hall B', 'Annex', 100, 'Seminar'
WHERE NOT EXISTS (
  SELECT 1 FROM rooms WHERE room_name = 'Seminar Hall B' AND building = 'Annex'
);

INSERT INTO rooms (room_name, building, capacity, room_type)
SELECT 'Innovation Hub 2', 'Annex', 60, 'Both'
WHERE NOT EXISTS (
  SELECT 1 FROM rooms WHERE room_name = 'Innovation Hub 2' AND building = 'Annex'
);

-- =====================================================
-- C) ASSIGN A ROOM TO ALL SCHEDULES WITH NULL room_id
-- =====================================================
-- Uses a deterministic distribution across available room_ids.
SET @room_count := (SELECT COUNT(*) FROM rooms);

UPDATE schedules s
SET s.room_id = (
  SELECT r.room_id
  FROM rooms r
  ORDER BY r.room_id
  LIMIT 1 OFFSET MOD(s.schedule_id, @room_count)
)
WHERE s.room_id IS NULL
  AND @room_count > 0;

-- =====================================================
-- D) QUICK VERIFICATION
-- =====================================================
SELECT COUNT(*) AS schedules_without_room
FROM schedules
WHERE room_id IS NULL;

SELECT subject_code, subject_name, units
FROM subjects
ORDER BY subject_code;
