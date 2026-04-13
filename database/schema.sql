SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `TicketingSystem`.`messages`;
DROP TABLE IF EXISTS `TicketingSystem`.`tickets`;
SET FOREIGN_KEY_CHECKS = 1;

-- -----------------------------------------------------
-- Schema TicketingSystem
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `TicketingSystem` DEFAULT CHARACTER SET utf8 ;
USE `TicketingSystem` ;

-- -----------------------------------------------------
-- Table `TicketingSystem`.`users`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `TicketingSystem`.`users` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `first_name` VARCHAR(45) NOT NULL,
  `last_name` VARCHAR(45) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `role` VARCHAR(45) NOT NULL DEFAULT 'CLIENT',
  `status` VARCHAR(45) NOT NULL DEFAULT 'OFFLINE',
  UNIQUE INDEX `id_UNIQUE` (`id` ASC) INVISIBLE,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `email_UNIQUE` (`email` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `TicketingSystem`.`categories`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `TicketingSystem`.`categories` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC) VISIBLE,
  UNIQUE INDEX `name_UNIQUE` (`name` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `TicketingSystem`.`tickets`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `TicketingSystem`.`tickets` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(45) NOT NULL,
  `description` VARCHAR(255) NULL,
  `priority` INT NOT NULL DEFAULT 1,
  `status` VARCHAR(45) NOT NULL DEFAULT 'OPEN',
  `created_date` DATETIME NOT NULL,
  `resolved_date` DATETIME NULL,
  `category_id` BIGINT NOT NULL,
  `created_by` BIGINT NOT NULL,
  `assigned_agent` BIGINT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC) VISIBLE,
  INDEX `fk_tickets_categories_idx` (`category_id` ASC) VISIBLE,
  INDEX `fk_tickets_users1_idx` (`created_by` ASC) VISIBLE,
  INDEX `fk_tickets_users2_idx` (`assigned_agent` ASC) VISIBLE,
  CONSTRAINT `fk_tickets_categories`
    FOREIGN KEY (`category_id`)
    REFERENCES `TicketingSystem`.`categories` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_tickets_users1`
    FOREIGN KEY (`created_by`)
    REFERENCES `TicketingSystem`.`users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_tickets_users2`
    FOREIGN KEY (`assigned_agent`)
    REFERENCES `TicketingSystem`.`users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `TicketingSystem`.`messages`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `TicketingSystem`.`messages` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `text` VARCHAR(255) NOT NULL,
  `timestamp` DATETIME NOT NULL,
  `ticket_id` BIGINT NOT NULL,
  `sender_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC) VISIBLE,
  INDEX `fk_messages_tickets1_idx` (`ticket_id` ASC) VISIBLE,
  INDEX `fk_messages_users1_idx` (`sender_id` ASC) VISIBLE,
  CONSTRAINT `fk_messages_tickets1`
    FOREIGN KEY (`ticket_id`)
    REFERENCES `TicketingSystem`.`tickets` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_messages_users1`
    FOREIGN KEY (`sender_id`)
    REFERENCES `TicketingSystem`.`users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;