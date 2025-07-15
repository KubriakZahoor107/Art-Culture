-- prisma/migrations/20250714_extend_schema/steps.sql

-- =================================================================
--  ДОПОМІЖНІ ПРОЦЕДУРИ ДЛЯ ІДЕМПОТЕНТНОСТІ
-- =================================================================
DROP PROCEDURE IF EXISTS `drop_fk_if_exists`;
DROP PROCEDURE IF EXISTS `add_column_if_not_exists`;
DROP PROCEDURE IF EXISTS `rename_column_if_exists`;

DELIMITER $$

CREATE PROCEDURE `drop_fk_if_exists`(
  IN tbl_name VARCHAR(255),
  IN fk_name  VARCHAR(255)
)
BEGIN
  IF EXISTS (
    SELECT 1
      FROM `information_schema`.`table_constraints`
     WHERE `constraint_schema` = DATABASE()
       AND `table_name`       = tbl_name
       AND `constraint_name`  = fk_name
       AND `constraint_type`  = 'FOREIGN KEY'
  ) THEN
    SET @sql = CONCAT(
      'ALTER TABLE `', tbl_name, '` DROP FOREIGN KEY `', fk_name, '`;'
    );
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
  END IF;
END$$

CREATE PROCEDURE `add_column_if_not_exists`(
  IN tbl_name      VARCHAR(255),
  IN col_name      VARCHAR(255),
  IN col_definition TEXT
)
BEGIN
  IF NOT EXISTS (
    SELECT 1
      FROM `information_schema`.`columns`
     WHERE `table_schema` = DATABASE()
       AND `table_name`   = tbl_name
       AND `column_name`  = col_name
  ) THEN
    SET @sql = CONCAT(
      'ALTER TABLE `', tbl_name, '` ADD COLUMN `',
      col_name, '` ', col_definition, ';'
    );
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
  END IF;
END$$

CREATE PROCEDURE `rename_column_if_exists`(
  IN tbl_name       VARCHAR(255),
  IN old_col_name   VARCHAR(255),
  IN new_col_name   VARCHAR(255),
  IN col_definition TEXT
)
BEGIN
  IF EXISTS (
       SELECT 1
         FROM `information_schema`.`columns`
        WHERE `table_schema` = DATABASE()
          AND `table_name`   = tbl_name
          AND `column_name`  = old_col_name
     )
     AND NOT EXISTS (
       SELECT 1
         FROM `information_schema`.`columns`
        WHERE `table_schema` = DATABASE()
          AND `table_name`   = tbl_name
          AND `column_name`  = new_col_name
     ) THEN
    SET @sql = CONCAT(
      'ALTER TABLE `', tbl_name,
      '` CHANGE COLUMN `', old_col_name,
      '` `', new_col_name, '` ', col_definition, ';'
    );
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
  END IF;
END$$

DELIMITER ;

-- =================================================================
--  ОСНОВНІ ОПЕРАЦІЇ
-- =================================================================

-- 0. Отримуємо будь-який існуючий user.id для значень за замовчуванням
SET @default_user_id = (
  SELECT id
    FROM `user`
   ORDER BY id
   LIMIT 1
);

-- 1. Оновлюємо таблицю Post
CALL drop_fk_if_exists('Post', 'fk_post_creator');
CALL drop_fk_if_exists('Post', 'fk_post_exhibition');
CALL drop_fk_if_exists('Post', 'fk_post_museum');
CALL add_column_if_not_exists('Post', 'creator_id',    'INT NULL');
CALL add_column_if_not_exists('Post', 'exhibition_id', 'INT NULL');
CALL add_column_if_not_exists('Post', 'museum_id',     'INT NULL');
UPDATE `Post`
   SET `creator_id` = @default_user_id
 WHERE `creator_id` IS NULL
    OR `creator_id` NOT IN (SELECT id FROM `user`);
ALTER TABLE `Post`
  ADD CONSTRAINT `fk_post_creator`
    FOREIGN KEY (`creator_id`)    REFERENCES `user`(`id`)         ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `Post`
  ADD CONSTRAINT `fk_post_exhibition`
    FOREIGN KEY (`exhibition_id`) REFERENCES `Exhibition`(`id`)  ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `Post`
  ADD CONSTRAINT `fk_post_museum`
    FOREIGN KEY (`museum_id`)     REFERENCES `user`(`id`)         ON DELETE SET NULL ON UPDATE CASCADE;

-- 2. Оновлюємо таблицю ArtTerm
CALL drop_fk_if_exists('ArtTerm', 'fk_artterm_product');
CALL drop_fk_if_exists('ArtTerm', 'fk_artterm_by_user');
CALL add_column_if_not_exists('ArtTerm', 'highlighted_product_id', 'INT NULL');
CALL add_column_if_not_exists('ArtTerm', 'highlighted_by_id',      'INT NULL');
UPDATE `ArtTerm`
   SET `highlighted_product_id` = (
         SELECT `id` FROM `Product` ORDER BY `id` LIMIT 1
       )
 WHERE `highlighted_product_id` IS NULL
    OR `highlighted_product_id` NOT IN (SELECT id FROM `Product`);
UPDATE `ArtTerm`
   SET `highlighted_by_id` = @default_user_id
 WHERE `highlighted_by_id` IS NULL
    OR `highlighted_by_id` NOT IN (SELECT id FROM `user`);
ALTER TABLE `ArtTerm`
  MODIFY COLUMN `highlighted_product_id` INT NOT NULL;
ALTER TABLE `ArtTerm`
  ADD CONSTRAINT `fk_artterm_product`
    FOREIGN KEY (`highlighted_product_id`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `ArtTerm`
  ADD CONSTRAINT `fk_artterm_by_user`
    FOREIGN KEY (`highlighted_by_id`)       REFERENCES `user`(`id`)    ON DELETE SET NULL ON UPDATE CASCADE;

-- 3. Оновлюємо таблицю Like
CALL drop_fk_if_exists('Like', 'fk_like_user');
CALL drop_fk_if_exists('Like', 'fk_like_post');
CALL drop_fk_if_exists('Like', 'fk_like_product');
CALL drop_fk_if_exists('Like', 'fk_like_exhibition');
CALL drop_fk_if_exists('Like', 'fk_like_liked_user');
CALL add_column_if_not_exists('Like', 'userId',      'INT NOT NULL');
CALL add_column_if_not_exists('Like', 'postId',      'INT NULL');
CALL add_column_if_not_exists('Like', 'productId',   'INT NULL');
CALL add_column_if_not_exists('Like', 'exhibitionId','INT NULL');
CALL add_column_if_not_exists('Like', 'likedUserId', 'INT NULL');
UPDATE `Like`
   SET `userId` = @default_user_id
 WHERE `userId` NOT IN (SELECT id FROM `user`);
ALTER TABLE `Like`
  ADD CONSTRAINT `fk_like_user`
    FOREIGN KEY (`userId`)        REFERENCES `user`(`id`)    ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `Like`
  ADD CONSTRAINT `fk_like_post`
    FOREIGN KEY (`postId`)        REFERENCES `Post`(`id`)    ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `Like`
  ADD CONSTRAINT `fk_like_product`
    FOREIGN KEY (`productId`)     REFERENCES `Product`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `Like`
  ADD CONSTRAINT `fk_like_exhibition`
    FOREIGN KEY (`exhibitionId`)  REFERENCES `Exhibition`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `Like`
  ADD CONSTRAINT `fk_like_liked_user`
    FOREIGN KEY (`likedUserId`)   REFERENCES `user`(`id`)     ON DELETE SET NULL ON UPDATE CASCADE;

-- 4. Оновлюємо таблицю Exhibition
CALL drop_fk_if_exists('Exhibition', 'fk_exhibitions_created_by');
CALL drop_fk_if_exists('Exhibition', 'fk_exhibitions_museum');
CALL rename_column_if_exists('Exhibition','creator_id','created_by_id','INT NULL');
CALL add_column_if_not_exists('Exhibition','museum_id','INT NULL');
UPDATE `Exhibition`
   SET `created_by_id` = @default_user_id
 WHERE `created_by_id` IS NULL
    OR `created_by_id` NOT IN (SELECT id FROM `user`);
ALTER TABLE `Exhibition`
  MODIFY COLUMN `created_by_id` INT NOT NULL;
ALTER TABLE `Exhibition`
  ADD CONSTRAINT `fk_exhibitions_created_by`
    FOREIGN KEY (`created_by_id`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `Exhibition`
  ADD CONSTRAINT `fk_exhibitions_museum`
    FOREIGN KEY (`museum_id`)     REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- 5. Оновлюємо таблицю Product
CALL drop_fk_if_exists('Product', 'fk_products_author');
CALL add_column_if_not_exists('Product','author_id','INT NOT NULL');
CALL add_column_if_not_exists('Product','dateofcreation','VARCHAR(100) NULL');
UPDATE `Product`
   SET `author_id` = @default_user_id
 WHERE `author_id` NOT IN (SELECT id FROM `user`);
ALTER TABLE `Product`
  ADD CONSTRAINT `fk_products_author`
    FOREIGN KEY (`author_id`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- 6. Оновлюємо таблицю museum_logo_images — без UNIQUE
CALL drop_fk_if_exists('museum_logo_images','fk_mli_user');
CALL add_column_if_not_exists('museum_logo_images','user_id','INT NOT NULL');
UPDATE `museum_logo_images`
   SET `user_id` = @default_user_id
 WHERE `user_id` NOT IN (SELECT id FROM `user`);
ALTER TABLE `museum_logo_images`
  ADD CONSTRAINT `fk_mli_user`
    FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- =================================================================
--  Видаляємо допоміжні процедури після використання
-- =================================================================
DROP PROCEDURE IF EXISTS `drop_fk_if_exists`;
DROP PROCEDURE IF EXISTS `add_column_if_not_exists`;
DROP PROCEDURE IF EXISTS `rename_column_if_exists`;
