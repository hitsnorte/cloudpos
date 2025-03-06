-- DropForeignKey
ALTER TABLE `cloud_family_group_relation` DROP FOREIGN KEY `cloud_family_group_relation_ibfk_2`;

-- DropForeignKey
ALTER TABLE `cloud_family_group_relation` DROP FOREIGN KEY `fk_cloud_group_relation_group`;

-- DropForeignKey
ALTER TABLE `cloud_family_subfamilia` DROP FOREIGN KEY `cloud_family_subfamilia_ibfk_1`;

-- DropForeignKey
ALTER TABLE `cloud_family_subfamilia` DROP FOREIGN KEY `cloud_family_subfamilia_ibfk_2`;

-- DropForeignKey
ALTER TABLE `cloud_product_relation` DROP FOREIGN KEY `cloud_product_relation_ibfk_1`;

-- DropForeignKey
ALTER TABLE `cloud_product_relation` DROP FOREIGN KEY `cloud_product_relation_ibfk_2`;

-- AddForeignKey
ALTER TABLE `cloud_family_group_relation` ADD CONSTRAINT `fk_group_relation_group` FOREIGN KEY (`cloud_group_id`) REFERENCES `cloud_groups`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `cloud_family_group_relation` ADD CONSTRAINT `fk_group_relation_family` FOREIGN KEY (`cloud_family_id`) REFERENCES `cloud_family`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `cloud_family_subfamilia` ADD CONSTRAINT `fk_subfamilia_family` FOREIGN KEY (`id_cloud_family`) REFERENCES `cloud_family`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `cloud_family_subfamilia` ADD CONSTRAINT `fk_subfamilia_subfamily` FOREIGN KEY (`id_subfamilia`) REFERENCES `subfamilia`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `cloud_product_relation` ADD CONSTRAINT `fk_product_relation_product` FOREIGN KEY (`cloud_product_id`) REFERENCES `cloud_product`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `cloud_product_relation` ADD CONSTRAINT `fk_product_relation_subfamily` FOREIGN KEY (`id_subfamilia`) REFERENCES `subfamilia`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;
