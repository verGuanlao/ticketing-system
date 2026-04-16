USE `TicketingSystem`;

-- 1. SEED USERS (3 Admins, 12 Agents, 16 Clients total)
SET @pw = '$2a$10$aXgH0RkyK8qIIJwKHUjQ4.uqqfzu3oWJTySmvXB3CVXESBRpgXrXi';

INSERT IGNORE INTO `users` (`first_name`, `last_name`, `email`, `password`, `role`, `status`) VALUES
-- Admins
('Robert', 'Miller', 'robert.admin@system.com', @pw, 'ADMIN', 'ACTIVE'),
('Elizabeth', 'Garcia', 'e.garcia@system.com', @pw, 'ADMIN', 'ACTIVE'),
('David', 'Smith', 'david.s@system.com', @pw, 'ADMIN', 'ACTIVE'),

-- Support Agents
('James', 'Wilson', 'j.wilson@support.com', @pw, 'SUPPORT_AGENT', 'ACTIVE'),
('Maria', 'Rodriguez', 'm.rodriguez@support.com', @pw, 'SUPPORT_AGENT', 'ACTIVE'),
('Christopher', 'Lee', 'c.lee@support.com', @pw, 'SUPPORT_AGENT', 'ACTIVE'),
('Jennifer', 'Martinez', 'j.martinez@support.com', @pw, 'SUPPORT_AGENT', 'ACTIVE'),
('Michael', 'Anderson', 'm.anderson@support.com', @pw, 'SUPPORT_AGENT', 'ACTIVE'),
('Linda', 'Taylor', 'l.taylor@support.com', @pw, 'SUPPORT_AGENT', 'ACTIVE'),
('William', 'Thomas', 'w.thomas@support.com', @pw, 'SUPPORT_AGENT', 'ACTIVE'),
('Barbara', 'Moore', 'b.moore@support.com', @pw, 'SUPPORT_AGENT', 'ACTIVE'),
('Richard', 'Jackson', 'r.jackson@support.com', @pw, 'SUPPORT_AGENT', 'ACTIVE'),
('Susan', 'Martin', 's.martin@support.com', @pw, 'SUPPORT_AGENT', 'ACTIVE'),
('Joseph', 'Thompson', 'j.thompson@support.com', @pw, 'SUPPORT_AGENT', 'ACTIVE'),
('Thomas', 'White', 't.white@support.com', @pw, 'SUPPORT_AGENT', 'ACTIVE'),

-- Clients
('Alice', 'Johnson', 'alice.j@gmail.com', @pw, 'CLIENT', 'ACTIVE'),
('Bob', 'Williams', 'bob.w@outlook.com', @pw, 'CLIENT', 'ACTIVE'),
('Lili', 'Osborn', 'lili.o@yahoo.com', @pw, 'CLIENT', 'ACTIVE'),
('Kevin', 'Brown', 'k.brown@gmail.com', @pw, 'CLIENT', 'ACTIVE'),
('Sarah', 'Davis', 's.davis@outlook.com', @pw, 'CLIENT', 'ACTIVE'),
('Daniel', 'Lopez', 'd.lopez@gmail.com', @pw, 'CLIENT', 'ACTIVE'),
('Karen', 'Hernandez', 'k.hernandez@company.com', @pw, 'CLIENT', 'ACTIVE'),
('Steven', 'Clark', 's.clark@gmail.com', @pw, 'CLIENT', 'ACTIVE'),
('Nancy', 'Lewis', 'n.lewis@outlook.com', @pw, 'CLIENT', 'ACTIVE'),
('Paul', 'Walker', 'p.walker@gmail.com', @pw, 'CLIENT', 'ACTIVE'),
('Sandra', 'Hall', 's.hall@gmail.com', @pw, 'CLIENT', 'ACTIVE'),
('Mark', 'Allen', 'm.allen@outlook.com', @pw, 'CLIENT', 'ACTIVE'),
('Ashley', 'Young', 'a.young@gmail.com', @pw, 'CLIENT', 'ACTIVE'),
('George', 'King', 'g.king@outlook.com', @pw, 'CLIENT', 'ACTIVE'),
('Donna', 'Wright', 'd.wright@gmail.com', @pw, 'CLIENT', 'ACTIVE'),
('Kenneth', 'Scott', 'k.scott@gmail.com', @pw, 'CLIENT', 'ACTIVE');

-- 2. SEED CATEGORIES
INSERT IGNORE INTO `categories` (`name`) VALUES
('Unspecified'),
('Hardware'),
('Software'),
('Network'),
('Access & Permissions'),
('Email'),
('Printer'),
('Application Support'),
('Account Management'),
('Billing & Payments'),
('Facilities'),
('General Inquiry');

-- 3. GENERATE 50 TICKETS
INSERT INTO `tickets` 
(`title`, `description`, `priority`, `status`, `created_date`, `resolved_date`, `category_id`, `created_by`, `assigned_agent`)
WITH RECURSIVE seq AS (
    SELECT 1 AS n 
    UNION ALL 
    SELECT n + 1 FROM seq WHERE n < 50
)
SELECT 
    CONCAT(ELT(FLOOR(1 + RAND() * 6), 'Broken', 'Fix', 'Access to', 'Inquiry:', 'Update', 'Error with'), ' ', 
           (SELECT name FROM categories ORDER BY RAND() LIMIT 1), ' #', n) AS title,
    'Auto-generated ticket for testing purposes.' AS description,
    FLOOR(1 + RAND() * 4) AS priority,
    @status := ELT(FLOOR(1 + RAND() * 5), 'PENDING', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED') AS status,
    @dt := DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 365) DAY) AS created_date,
    IF(@status IN ('RESOLVED', 'CLOSED'), DATE_ADD(@dt, INTERVAL FLOOR(1 + RAND() * 168) HOUR), NULL) AS resolved_date,
    (SELECT id FROM categories ORDER BY RAND() LIMIT 1) AS category_id,
    (SELECT id FROM users WHERE role = 'CLIENT' ORDER BY RAND() LIMIT 1) AS created_by,
    IF(@status = 'PENDING', NULL, (SELECT id FROM users WHERE role = 'SUPPORT_AGENT' ORDER BY RAND() LIMIT 1)) AS assigned_agent
FROM seq;