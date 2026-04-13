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
 'AGENT', 'ACTIVE'),

('Sarah', 'Support', 'sarah.s@system.com', 
 '$2a$10$aXgH0RkyK8qIIJwKHUjQ4.uqqfzu3oWJTySmvXB3CVXESBRpgXrXi', 
 'AGENT', 'ACTIVE'),

('Alice', 'Client', 'alice@gmail.com', 
 '$2a$10$aXgH0RkyK8qIIJwKHUjQ4.uqqfzu3oWJTySmvXB3CVXESBRpgXrXi', 
 'CLIENT', 'ACTIVE'),

('Bob', 'Customer', 'bob@outlook.com', 
 '$2a$10$aXgH0RkyK8qIIJwKHUjQ4.uqqfzu3oWJTySmvXB3CVXESBRpgXrXi', 
 'CLIENT', 'ACTIVE');