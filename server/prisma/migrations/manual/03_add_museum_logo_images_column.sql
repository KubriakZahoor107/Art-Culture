ALTER TABLE `museum_logo_images`
  ADD COLUMN `user_id` INT NOT NULL UNIQUE;
ALTER TABLE `museum_logo_images`
  ADD CONSTRAINT `uq_mli_user` UNIQUE (`user_id`),
  ADD CONSTRAINT `fk_mli_user`
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`);
