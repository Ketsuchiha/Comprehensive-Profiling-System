-- Run this migration on your MySQL database (default: ccs113)

USE ccs113;

ALTER TABLE students
  ADD COLUMN IF NOT EXISTS skills text DEFAULT NULL AFTER religion;
