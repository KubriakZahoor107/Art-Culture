-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN', 'MUSEUM', 'CREATOR', 'EDITOR', 'AUTHOR', 'EXHIBITION');

-- CreateEnum
CREATE TYPE "PostStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "images" TEXT,
    "title" TEXT,
    "bio" TEXT,
    "reset_token" TEXT,
    "reset_token_expiry" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "country" TEXT,
    "house_number" TEXT,
    "lat" DOUBLE PRECISION,
    "lon" DOUBLE PRECISION,
    "postcode" TEXT,
    "state" TEXT,
    "street" TEXT,
    "city" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Post" (
    "id" SERIAL NOT NULL,
    "title_en" VARCHAR(250) NOT NULL,
    "title_uk" VARCHAR(250) NOT NULL,
    "content_en" VARCHAR(5000) NOT NULL,
    "content_uk" VARCHAR(5000) NOT NULL,
    "images" TEXT,
    "status" "PostStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "author_id" INTEGER NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" SERIAL NOT NULL,
    "title_en" VARCHAR(100) NOT NULL,
    "title_uk" VARCHAR(100) NOT NULL,
    "description_en" VARCHAR(1000) NOT NULL,
    "description_uk" VARCHAR(1000) NOT NULL,
    "specs_en" VARCHAR(500),
    "specs_uk" VARCHAR(500),
    "size" VARCHAR(100),
    "style_en" VARCHAR(100),
    "style_uk" VARCHAR(100),
    "technique_en" VARCHAR(100),
    "technique_uk" VARCHAR(100),
    "dateOfCreation" VARCHAR(100),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" "ProductStatus" NOT NULL DEFAULT 'PENDING',
    "author_id" INTEGER,
    "museum_id" INTEGER,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductImage" (
    "id" SERIAL NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "productId" INTEGER NOT NULL,

    CONSTRAINT "ProductImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Exhibition" (
    "id" SERIAL NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "time" VARCHAR(200),
    "endTime" VARCHAR(200),
    "location_en" VARCHAR(500),
    "location_uk" VARCHAR(500),
    "title_en" VARCHAR(150),
    "title_uk" VARCHAR(150),
    "description_en" VARCHAR(500),
    "description_uk" VARCHAR(500),
    "address" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "created_by_id" INTEGER,
    "museum_id" INTEGER,

    CONSTRAINT "Exhibition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExhibitionProduct" (
    "exhibitionId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,

    CONSTRAINT "ExhibitionProduct_pkey" PRIMARY KEY ("exhibitionId","productId")
);

-- CreateTable
CREATE TABLE "ExhibitionImage" (
    "id" SERIAL NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "exhibitionId" INTEGER NOT NULL,

    CONSTRAINT "ExhibitionImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExhibitionArtist" (
    "exhibitionId" INTEGER NOT NULL,
    "artistId" INTEGER NOT NULL,

    CONSTRAINT "ExhibitionArtist_pkey" PRIMARY KEY ("exhibitionId","artistId")
);

-- CreateTable
CREATE TABLE "ArtTerm" (
    "id" SERIAL NOT NULL,
    "title_en" VARCHAR(100) NOT NULL,
    "title_uk" VARCHAR(100) NOT NULL,
    "description_en" TEXT NOT NULL,
    "description_uk" TEXT NOT NULL,
    "content_en" TEXT NOT NULL,
    "content_uk" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "author_id" INTEGER NOT NULL,
    "highlighted_product_id" INTEGER NOT NULL,
    "highlighted_by_id" INTEGER,

    CONSTRAINT "ArtTerm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "museum_logo_images" (
    "id" SERIAL NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "museum_logo_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Like" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,
    "postId" INTEGER,
    "productId" INTEGER,
    "exhibitionId" INTEGER,
    "likedUserId" INTEGER,

    CONSTRAINT "Like_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "museum_logo_images_user_id_key" ON "museum_logo_images"("user_id");

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_museum_id_fkey" FOREIGN KEY ("museum_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductImage" ADD CONSTRAINT "ProductImage_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exhibition" ADD CONSTRAINT "Exhibition_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exhibition" ADD CONSTRAINT "Exhibition_museum_id_fkey" FOREIGN KEY ("museum_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExhibitionProduct" ADD CONSTRAINT "ExhibitionProduct_exhibitionId_fkey" FOREIGN KEY ("exhibitionId") REFERENCES "Exhibition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExhibitionProduct" ADD CONSTRAINT "ExhibitionProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExhibitionImage" ADD CONSTRAINT "ExhibitionImage_exhibitionId_fkey" FOREIGN KEY ("exhibitionId") REFERENCES "Exhibition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExhibitionArtist" ADD CONSTRAINT "ExhibitionArtist_exhibitionId_fkey" FOREIGN KEY ("exhibitionId") REFERENCES "Exhibition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExhibitionArtist" ADD CONSTRAINT "ExhibitionArtist_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArtTerm" ADD CONSTRAINT "ArtTerm_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArtTerm" ADD CONSTRAINT "ArtTerm_highlighted_by_id_fkey" FOREIGN KEY ("highlighted_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "museum_logo_images" ADD CONSTRAINT "museum_logo_images_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_exhibitionId_fkey" FOREIGN KEY ("exhibitionId") REFERENCES "Exhibition"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_likedUserId_fkey" FOREIGN KEY ("likedUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
