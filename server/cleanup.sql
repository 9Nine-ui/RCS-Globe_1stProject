USE rsc_globe_db;

-- Disable foreign key checks temporarily
SET FOREIGN_KEY_CHECKS = 0;

-- Truncate all tables (remove all data while keeping the structure)
TRUNCATE TABLE chart_data;
TRUNCATE TABLE data_imports;
TRUNCATE TABLE users;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;