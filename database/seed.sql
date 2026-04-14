USE `TicketingSystem` ;

-- Passwords: 
-- admin123 -> $2a$10$8K1p/a0.pZpGZ7RWVf.2O.E5L1p.QG2Z8Z7RWVf.2O.E5L1p.QG2Z
-- agent123 -> $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgdtY74SokV3QiduTQq8GiCmeLN6
-- client123 -> $2a$10$P7X8Y9Z0A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W

INSERT IGNORE INTO `users` 
(`first_name`, `last_name`, `email`, `password`, `role`, `status`) 
VALUES
('Admin', 'User', 'admin@system.com', 
 '$2a$10$cfDQxUuhKmJQCQNFvjN.L.Hj8cG8zmfJmMTFUPQGfJTOgPVU9CbqG', 
 'ADMIN', 'ACTIVE'),

('John', 'Agent', 'john.agent@system.com', 
 '$2a$10$aXgH0RkyK8qIIJwKHUjQ4.uqqfzu3oWJTySmvXB3CVXESBRpgXrXi', 
 'SUPPORT_AGENT', 'ACTIVE'),

('Sarah', 'Support', 'sarah.s@system.com', 
 '$2a$10$aXgH0RkyK8qIIJwKHUjQ4.uqqfzu3oWJTySmvXB3CVXESBRpgXrXi', 
 'SUPPORT_AGENT', 'ACTIVE'),

('Alice', 'Client', 'alice@gmail.com', 
 '$2a$10$aXgH0RkyK8qIIJwKHUjQ4.uqqfzu3oWJTySmvXB3CVXESBRpgXrXi', 
 'CLIENT', 'ACTIVE'),

('Bob', 'Customer', 'bob@outlook.com', 
 '$2a$10$aXgH0RkyK8qIIJwKHUjQ4.uqqfzu3oWJTySmvXB3CVXESBRpgXrXi', 
 'CLIENT', 'ACTIVE'),

 ('Lili', 'Osborn', 'lili@outlook.com', 
 '$2a$10$aXgH0RkyK8qIIJwKHUjQ4.uqqfzu3oWJTySmvXB3CVXESBRpgXrXi', 
 'CLIENT', 'ACTIVE');

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


INSERT INTO `TicketingSystem`.`tickets`
(`title`, `description`, `priority`, `status`, `created_date`, `resolved_date`, `category_id`, `created_by`, `assigned_agent`)
VALUES
-- Ticket 1: Resolved
('Laptop not booting', 'Client reports laptop fails to start.', 2, 'RESOLVED',
 '2026-04-09 10:15:00', '2026-04-11 14:30:00', 
 (SELECT id FROM `TicketingSystem`.`categories` WHERE name='Hardware'),
 (SELECT id FROM `TicketingSystem`.`users` WHERE email='alice@gmail.com'),
 (SELECT id FROM `TicketingSystem`.`users` WHERE email='john.agent@system.com')),

-- Ticket 2: Open
('VPN connection issue', 'Unable to connect to company VPN.', 3, 'OPEN',
 '2026-04-12 09:45:00', NULL, 
 (SELECT id FROM `TicketingSystem`.`categories` WHERE name='Network'),
 (SELECT id FROM `TicketingSystem`.`users` WHERE email='bob@outlook.com'),
 (SELECT id FROM `TicketingSystem`.`users` WHERE email='sarah.s@system.com')),

-- Ticket 3: In Progress
('Password reset required', 'User cannot access account, needs reset.', 1, 'IN_PROGRESS',
 '2026-04-10 16:20:00', NULL, 
 (SELECT id FROM `TicketingSystem`.`categories` WHERE name='Access & Permissions'),
 (SELECT id FROM `TicketingSystem`.`users` WHERE email='lili@outlook.com'),
 (SELECT id FROM `TicketingSystem`.`users` WHERE email='john.agent@system.com')),

-- Ticket 4: Resolved
('Email not syncing', 'Client email not syncing on mobile.', 2, 'RESOLVED',
 '2026-04-08 11:00:00', '2026-04-09 15:45:00', 
 (SELECT id FROM `TicketingSystem`.`categories` WHERE name='Email'),
 (SELECT id FROM `TicketingSystem`.`users` WHERE email='bob@outlook.com'),
 (SELECT id FROM `TicketingSystem`.`users` WHERE email='sarah.s@system.com')),

-- Ticket 5: Open
('Printer jam', 'Office printer constantly jamming.', 3, 'OPEN',
 '2026-04-12 13:10:00', NULL, 
 (SELECT id FROM `TicketingSystem`.`categories` WHERE name='Printer'),
 (SELECT id FROM `TicketingSystem`.`users` WHERE email='alice@gmail.com'),
 (SELECT id FROM `TicketingSystem`.`users` WHERE email='john.agent@system.com'));
