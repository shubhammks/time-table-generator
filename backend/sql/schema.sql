-- Create database
CREATE DATABASE IF NOT EXISTS timetable_db;
USE timetable_db;

-- User table
CREATE TABLE USER (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL
);

-- Department table
CREATE TABLE DEPARTMENT (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type ENUM('school','college') NOT NULL
);

-- Teacher table
CREATE TABLE TEACHER (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    department_id INT,
    FOREIGN KEY (department_id) REFERENCES DEPARTMENT(id)
);

-- Class table
CREATE TABLE CLASS (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    number_of_divisions INT NOT NULL,
    department_id INT,
    FOREIGN KEY (department_id) REFERENCES DEPARTMENT(id)
);

-- Division table
CREATE TABLE DIVISION (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    class_id INT,
    FOREIGN KEY (class_id) REFERENCES CLASS(id)
);

-- Batch table
CREATE TABLE BATCH (
    id INT AUTO_INCREMENT PRIMARY KEY,
    number INT NOT NULL,
    division_id INT,
    FOREIGN KEY (division_id) REFERENCES DIVISION(id)
);

-- Subject table
CREATE TABLE SUBJECT (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type ENUM('lecture','lab','tutorial') NOT NULL,
    hours_per_week INT NOT NULL,
    class_id INT,
    FOREIGN KEY (class_id) REFERENCES CLASS(id)
);

-- Subject-Teacher mapping
CREATE TABLE SUBJECT_TEACHER (
    id INT AUTO_INCREMENT PRIMARY KEY,
    subject_id INT,
    teacher_id INT,
    division_id INT,
    batch_id INT,
    FOREIGN KEY (subject_id) REFERENCES SUBJECT(id),
    FOREIGN KEY (teacher_id) REFERENCES TEACHER(id),
    FOREIGN KEY (division_id) REFERENCES DIVISION(id),
    FOREIGN KEY (batch_id) REFERENCES BATCH(id)
);

-- Room table
CREATE TABLE ROOM (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_number VARCHAR(50) NOT NULL,
    type ENUM('classroom','lab','tutorial') NOT NULL,
    capacity INT,
    floor INT,
    department_id INT,
    FOREIGN KEY (department_id) REFERENCES DEPARTMENT(id)
);

-- Timetable table
CREATE TABLE TIMETABLE (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    class_id INT,
    is_published BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES CLASS(id)
);

-- Schedule entry
CREATE TABLE SCHEDULE_ENTRY (
    id INT AUTO_INCREMENT PRIMARY KEY,
    timetable_id INT,
    day_index INT,
    period_index INT,
    subject_id INT,
    teacher_id INT,
    room_id INT,
    division_id INT,
    batch_id INT,
    FOREIGN KEY (timetable_id) REFERENCES TIMETABLE(id),
    FOREIGN KEY (subject_id) REFERENCES SUBJECT(id),
    FOREIGN KEY (teacher_id) REFERENCES TEACHER(id),
    FOREIGN KEY (room_id) REFERENCES ROOM(id),
    FOREIGN KEY (division_id) REFERENCES DIVISION(id),
    FOREIGN KEY (batch_id) REFERENCES BATCH(id)
);
