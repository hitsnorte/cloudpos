/*
  Warnings:

  - You are about to drop the `cloudproduct` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `cloudproduct`;

-- CreateTable
CREATE TABLE `Cloud_product` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `product_name` VARCHAR(100) NOT NULL,
    `quantity` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
