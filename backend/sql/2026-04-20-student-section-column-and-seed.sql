-- Run this migration on your MySQL database (default: ccs113)

USE ccs113;

ALTER TABLE students
  ADD COLUMN IF NOT EXISTS section varchar(20) DEFAULT NULL AFTER student_id;

ALTER TABLE students
  ADD KEY IF NOT EXISTS idx_students_section (section);

-- Section mapping from the provided students table dump.
-- Update the 'UNASSIGNED' values if you want a specific section for those IDs.
INSERT INTO student_academic (student_id, section)
SELECT seeded.student_id, seeded.section
FROM (
  SELECT '2026-2023141' AS student_id, 'UNASSIGNED' AS section
  UNION ALL SELECT '2026-310001', 'IT-1A'
  UNION ALL SELECT '2026-310002', 'IT-1A'
  UNION ALL SELECT '2026-310003', 'CS-1A'
  UNION ALL SELECT '2026-310004', 'CS-1A'
  UNION ALL SELECT '2026-310005', 'IT-2B'
  UNION ALL SELECT '2026-310006', 'IT-2B'
  UNION ALL SELECT '2026-310007', 'CS-3A'
  UNION ALL SELECT '2026-310008', 'CS-4A'
  UNION ALL SELECT '423412342134', 'UNASSIGNED'
  UNION ALL SELECT 'IT26-1A-0001', 'IT-1A'
  UNION ALL SELECT 'IT26-2A-0001', 'IT-2A'
  UNION ALL SELECT 'IT26-3A-0001', 'IT-3A'
  UNION ALL SELECT 'IT26-4A-0001', 'IT-4A'
) AS seeded
INNER JOIN students s ON s.student_id = seeded.student_id
ON DUPLICATE KEY UPDATE section = VALUES(section);

-- Keep students.section in sync with student_academic.section.
UPDATE students s
LEFT JOIN student_academic sa ON sa.student_id = s.student_id
SET s.section = sa.section
WHERE sa.section IS NOT NULL;
