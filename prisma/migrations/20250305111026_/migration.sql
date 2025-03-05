-- CreateTable
CREATE TABLE `cloudfamily` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `family_name` VARCHAR(100) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cloudfamilygrouprelation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cloud_group_id` INTEGER NOT NULL,
    `cloud_family_id` INTEGER NOT NULL,

    INDEX `cloud_group_id`(`cloud_group_id`),
    UNIQUE INDEX `unique_group_family`(`cloud_family_id`, `cloud_group_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cloudgroup` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `group_name` VARCHAR(100) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Cloudproduct` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `product_name` VARCHAR(100) NOT NULL,
    `quantity` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
