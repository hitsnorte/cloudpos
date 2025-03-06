-- DropForeignKey
ALTER TABLE `cloud_family_group_relation` DROP FOREIGN KEY `cloud_family_group_relation_ibfk_1`;

-- AddForeignKey
ALTER TABLE `cloud_family_group_relation` ADD CONSTRAINT `fk_cloud_group_relation_group` FOREIGN KEY (`cloud_group_id`) REFERENCES `cloud_groups`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;
