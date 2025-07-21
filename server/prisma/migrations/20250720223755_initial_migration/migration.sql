-- CreateTable
CREATE TABLE `user` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` ENUM('USER', 'ADMIN', 'MUSEUM', 'CREATOR', 'EDITOR', 'AUTHOR', 'EXHIBITION') NOT NULL DEFAULT 'USER',
    `title` VARCHAR(191) NULL,
    `bio` VARCHAR(191) NULL,
    `images` JSON NULL,
    `resetToken` VARCHAR(191) NULL,
    `resetTokenExpiry` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `country` VARCHAR(191) NULL,
    `house_number` VARCHAR(191) NULL,
    `lat` DOUBLE NULL,
    `lon` DOUBLE NULL,
    `postcode` VARCHAR(191) NULL,
    `state` VARCHAR(191) NULL,
    `street` VARCHAR(191) NULL,
    `city` VARCHAR(191) NULL,

    UNIQUE INDEX `user_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Post` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title_en` VARCHAR(250) NOT NULL,
    `title_uk` VARCHAR(250) NOT NULL,
    `content_en` VARCHAR(5000) NOT NULL,
    `content_uk` VARCHAR(5000) NOT NULL,
    `author_id` INTEGER NOT NULL,
    `images` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `creator_id` INTEGER NULL,
    `exhibition_id` INTEGER NULL,
    `museum_id` INTEGER NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',

    INDEX `Post_author_id_fkey`(`author_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Product` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title_en` VARCHAR(100) NOT NULL,
    `title_uk` VARCHAR(100) NOT NULL,
    `description_en` VARCHAR(1000) NOT NULL,
    `description_uk` VARCHAR(1000) NOT NULL,
    `specs_en` VARCHAR(500) NULL,
    `specs_uk` VARCHAR(500) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `authorId` INTEGER NOT NULL,
    `museumId` INTEGER NULL,
    `size` VARCHAR(100) NULL,
    `style_en` VARCHAR(100) NULL,
    `style_uk` VARCHAR(100) NULL,
    `technique_en` VARCHAR(100) NULL,
    `technique_uk` VARCHAR(100) NULL,
    `dateofcreation` VARCHAR(100) NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',

    INDEX `Product_authorId_fkey`(`authorId`),
    INDEX `Product_museumId_fkey`(`museumId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductImage` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `imageUrl` VARCHAR(191) NOT NULL,
    `productId` INTEGER NOT NULL,

    INDEX `ProductImage_productId_fkey`(`productId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Exhibition` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `time` VARCHAR(200) NULL,
    `createdById` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `description_en` VARCHAR(500) NULL,
    `description_uk` VARCHAR(500) NULL,
    `location_en` VARCHAR(500) NULL,
    `location_uk` VARCHAR(500) NULL,
    `title_en` VARCHAR(150) NULL,
    `title_uk` VARCHAR(150) NULL,
    `address` VARCHAR(191) NULL,
    `latitude` DOUBLE NULL,
    `longitude` DOUBLE NULL,
    `endTime` VARCHAR(200) NULL,
    `museumId` INTEGER NULL,

    INDEX `Exhibition_createdById_fkey`(`createdById`),
    INDEX `Exhibition_museumId_fkey`(`museumId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ExhibitionProduct` (
    `exhibitionId` INTEGER NOT NULL,
    `productId` INTEGER NOT NULL,

    INDEX `ExhibitionProduct_productId_fkey`(`productId`),
    PRIMARY KEY (`exhibitionId`, `productId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ExhibitionImage` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `imageUrl` VARCHAR(191) NOT NULL,
    `exhibitionId` INTEGER NOT NULL,

    INDEX `ExhibitionImage_exhibitionId_fkey`(`exhibitionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ExhibitionArtist` (
    `exhibitionId` INTEGER NOT NULL,
    `artistId` INTEGER NOT NULL,

    INDEX `ExhibitionArtist_artistId_fkey`(`artistId`),
    PRIMARY KEY (`exhibitionId`, `artistId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ArtTerm` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title_en` VARCHAR(100) NOT NULL,
    `title_uk` VARCHAR(100) NOT NULL,
    `description_en` TEXT NOT NULL,
    `description_uk` TEXT NOT NULL,
    `content_en` TEXT NOT NULL,
    `content_uk` TEXT NOT NULL,
    `author_id` INTEGER NOT NULL,
    `highlighted_product_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `ArtTerm_author_id_fkey`(`author_id`),
    INDEX `ArtTerm_highlighted_product_id_fkey`(`highlighted_product_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `museum_logo_images` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `imageUrl` VARCHAR(191) NOT NULL,
    `userId` INTEGER NOT NULL,

    INDEX `Museum_logo_images_userId_fkey`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Like` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `postId` INTEGER NULL,
    `productId` INTEGER NULL,
    `exhibitionId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `likedUserId` INTEGER NULL,

    INDEX `Like_exhibitionId_idx`(`exhibitionId`),
    INDEX `Like_likedUserId_idx`(`likedUserId`),
    INDEX `Like_postId_idx`(`postId`),
    INDEX `Like_productId_idx`(`productId`),
    INDEX `Like_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Post` ADD CONSTRAINT `Post_author_id_fkey` FOREIGN KEY (`author_id`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_museumId_fkey` FOREIGN KEY (`museumId`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductImage` ADD CONSTRAINT `ProductImage_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Exhibition` ADD CONSTRAINT `Exhibition_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Exhibition` ADD CONSTRAINT `Exhibition_museumId_fkey` FOREIGN KEY (`museumId`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ExhibitionProduct` ADD CONSTRAINT `ExhibitionProduct_exhibitionId_fkey` FOREIGN KEY (`exhibitionId`) REFERENCES `Exhibition`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ExhibitionProduct` ADD CONSTRAINT `ExhibitionProduct_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ExhibitionImage` ADD CONSTRAINT `ExhibitionImage_exhibitionId_fkey` FOREIGN KEY (`exhibitionId`) REFERENCES `Exhibition`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ExhibitionArtist` ADD CONSTRAINT `ExhibitionArtist_artistId_fkey` FOREIGN KEY (`artistId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ExhibitionArtist` ADD CONSTRAINT `ExhibitionArtist_exhibitionId_fkey` FOREIGN KEY (`exhibitionId`) REFERENCES `Exhibition`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ArtTerm` ADD CONSTRAINT `ArtTerm_author_id_fkey` FOREIGN KEY (`author_id`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ArtTerm` ADD CONSTRAINT `ArtTerm_highlighted_product_id_fkey` FOREIGN KEY (`highlighted_product_id`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `museum_logo_images` ADD CONSTRAINT `museum_logo_images_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Like` ADD CONSTRAINT `Like_exhibitionId_fkey` FOREIGN KEY (`exhibitionId`) REFERENCES `Exhibition`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Like` ADD CONSTRAINT `Like_likedUserId_fkey` FOREIGN KEY (`likedUserId`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Like` ADD CONSTRAINT `Like_postId_fkey` FOREIGN KEY (`postId`) REFERENCES `Post`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Like` ADD CONSTRAINT `Like_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Like` ADD CONSTRAINT `Like_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
