-- Database initialization script for Timetable Management System
-- This script creates the database and initial setup

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS timetable_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Use the database
USE timetable_db;

-- Create user for the application (will be used by the application)
-- Note: In production, use strong passwords and appropriate privileges
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, INDEX, ALTER ON timetable_db.* TO 'timetable_user'@'%';
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, INDEX, ALTER ON timetable_db.* TO 'timetable_user'@'localhost';

-- Flush privileges to ensure the changes take effect
FLUSH PRIVILEGES;

-- Set timezone (adjust as needed)
SET time_zone = '+05:30'; -- IST timezone

-- Create indexes for better performance (these will be created by SQLAlchemy too, but adding explicitly for clarity)

-- Note: The actual table creation is handled by SQLAlchemy models
-- This script mainly focuses on database-level configuration and optimization

-- Performance optimization settings
SET GLOBAL innodb_buffer_pool_size = 256M;
SET GLOBAL max_connections = 1000;

-- Enable general query log for debugging (disable in production)
-- SET GLOBAL general_log = 'ON';
-- SET GLOBAL general_log_file = '/var/log/mysql/general.log';

-- Create a procedure to show table status (useful for monitoring)
DELIMITER //

CREATE PROCEDURE IF NOT EXISTS ShowTableStats()
BEGIN
    SELECT 
        TABLE_NAME,
        TABLE_ROWS,
        AVG_ROW_LENGTH,
        DATA_LENGTH,
        INDEX_LENGTH,
        (DATA_LENGTH + INDEX_LENGTH) AS TOTAL_SIZE
    FROM 
        information_schema.TABLES 
    WHERE 
        TABLE_SCHEMA = 'timetable_db'
    ORDER BY 
        TOTAL_SIZE DESC;
END //

DELIMITER ;

-- Create a procedure to optimize all tables
DELIMITER //

CREATE PROCEDURE IF NOT EXISTS OptimizeAllTables()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE table_name VARCHAR(255);
    DECLARE cur CURSOR FOR 
        SELECT TABLE_NAME 
        FROM information_schema.TABLES 
        WHERE TABLE_SCHEMA = 'timetable_db';
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    OPEN cur;

    read_loop: LOOP
        FETCH cur INTO table_name;
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        SET @sql = CONCAT('OPTIMIZE TABLE ', table_name);
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END LOOP;

    CLOSE cur;
END //

DELIMITER ;

-- Insert initial configuration data (this will be handled by the seed script)
-- But we can add some basic configurations here if needed

COMMIT;
