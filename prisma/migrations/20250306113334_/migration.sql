-- CreateTable
CREATE TABLE `cloud_product_relation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cloud_product_id` INTEGER NOT NULL,
    `id_subfamilia` INTEGER NOT NULL,

    INDEX `cloud_product_relation_id_subfamilia_idx`(`id_subfamilia`),
    UNIQUE INDEX `unique_product_subfamily`(`cloud_product_id`, `id_subfamilia`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `cloud_product_relation` ADD CONSTRAINT `cloud_product_relation_ibfk_1` FOREIGN KEY (`cloud_product_id`) REFERENCES `cloud_product`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `cloud_product_relation` ADD CONSTRAINT `cloud_product_relation_ibfk_2` FOREIGN KEY (`id_subfamilia`) REFERENCES `subfamilia`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- RenameIndex
ALTER TABLE `cloud_family_group_relation` RENAME INDEX `cloud_family_id` TO `cloud_family_group_relation_cloud_family_id_idx`;

-- RenameIndex
ALTER TABLE `cloud_family_subfamilia` RENAME INDEX `id_cloud_family` TO `cloud_family_subfamilia_id_cloud_family_idx`;

-- RenameIndex
ALTER TABLE `cloud_family_subfamilia` RENAME INDEX `id_subfamilia` TO `cloud_family_subfamilia_id_subfamilia_idx`;
