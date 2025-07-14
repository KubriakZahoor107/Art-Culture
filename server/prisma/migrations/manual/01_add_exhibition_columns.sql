ALTER TABLE `exhibitions`
  ADD COLUMN `created_by_id` INT NOT NULL,
  ADD COLUMN `museum_id`       INT NULL;
ALTER TABLE `exhibitions`
  ADD CONSTRAINT `fk_exh_created_by`
    FOREIGN KEY (`created_by_id`) REFERENCES `users`(`id`),
  ADD CONSTRAINT `fk_exh_museum`
    FOREIGN KEY (`museum_id`)     REFERENCES `users`(`id`);
