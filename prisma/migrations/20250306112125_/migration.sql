/*
  Warnings:

  - You are about to drop the `cloudfamily` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `cloudfamilygrouprelation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `cloudgroup` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE `cloud_product` MODIFY `product_name` VARCHAR(255) NOT NULL;

-- DropTable
DROP TABLE `cloudfamily`;

-- DropTable
DROP TABLE `cloudfamilygrouprelation`;

-- DropTable
DROP TABLE `cloudgroup`;

-- CreateTable
CREATE TABLE `subfamilia` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cloud_family` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `family_name` VARCHAR(100) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cloud_family_group_relation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cloud_group_id` INTEGER NOT NULL,
    `cloud_family_id` INTEGER NOT NULL,

    INDEX `cloud_family_id`(`cloud_family_id`),
    UNIQUE INDEX `unique_group_family`(`cloud_group_id`, `cloud_family_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cloud_family_subfamilia` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_cloud_family` INTEGER NOT NULL,
    `id_subfamilia` INTEGER NOT NULL,

    INDEX `id_cloud_family`(`id_cloud_family`),
    INDEX `id_subfamilia`(`id_subfamilia`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cloud_groups` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `group_name` VARCHAR(100) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `cloud_family_group_relation` ADD CONSTRAINT `cloud_family_group_relation_ibfk_1` FOREIGN KEY (`cloud_group_id`) REFERENCES `cloud_groups`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `cloud_family_group_relation` ADD CONSTRAINT `cloud_family_group_relation_ibfk_2` FOREIGN KEY (`cloud_family_id`) REFERENCES `cloud_family`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `cloud_family_subfamilia` ADD CONSTRAINT `cloud_family_subfamilia_ibfk_1` FOREIGN KEY (`id_cloud_family`) REFERENCES `cloud_family`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `cloud_family_subfamilia` ADD CONSTRAINT `cloud_family_subfamilia_ibfk_2` FOREIGN KEY (`id_subfamilia`) REFERENCES `subfamilia`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;
