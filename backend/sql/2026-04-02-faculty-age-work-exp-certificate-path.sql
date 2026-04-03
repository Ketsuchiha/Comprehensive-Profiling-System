-- Run this migration on your MySQL database (default: ccs113)

USE ccs113;

ALTER TABLE faculty
  ADD COLUMN IF NOT EXISTS age int(11) DEFAULT NULL AFTER birth_date,
  ADD COLUMN IF NOT EXISTS work_experience_years int(11) DEFAULT NULL AFTER specialization,
  ADD COLUMN IF NOT EXISTS expertise_certificate_path varchar(255) DEFAULT NULL AFTER work_experience_years;

-- Backfill age from birth_date where possible.
UPDATE faculty
SET age = TIMESTAMPDIFF(YEAR, birth_date, CURDATE())
WHERE age IS NULL AND birth_date IS NOT NULL;

-- Backfill work experience from date_hired when employment data is present.
UPDATE faculty f
INNER JOIN faculty_employment fe ON fe.faculty_id = f.faculty_id
SET f.work_experience_years = TIMESTAMPDIFF(YEAR, fe.date_hired, CURDATE())
WHERE f.work_experience_years IS NULL AND fe.date_hired IS NOT NULL;
