-- DropForeignKey
ALTER TABLE `cloud_family_subfamilia` DROP FOREIGN KEY `fk_subfamilia_family`;

-- DropForeignKey
ALTER TABLE `cloud_family_subfamilia` DROP FOREIGN KEY `fk_subfamilia_subfamily`;

-- CreateIndex
CREATE INDEX `cloud_product_relation_cloud_product_id_idx` ON `cloud_product_relation`(`cloud_product_id`);

-- AddForeignKey
ALTER TABLE `cloud_family_subfamilia` ADD CONSTRAINT `cloud_family_subfamilia_id_cloud_family_fkey` FOREIGN KEY (`id_cloud_family`) REFERENCES `cloud_family`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `cloud_family_subfamilia` ADD CONSTRAINT `cloud_family_subfamilia_id_subfamilia_fkey` FOREIGN KEY (`id_subfamilia`) REFERENCES `subfamilia`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;
