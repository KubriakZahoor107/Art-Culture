ALTER TABLE `products`
  ADD COLUMN `author_id`       INT    NOT NULL,
  ADD COLUMN `dateofcreation`  VARCHAR(100) NULL;
ALTER TABLE `products`
  ADD CONSTRAINT `fk_prod_author`
    FOREIGN KEY (`author_id`) REFERENCES `users`(`id`);
