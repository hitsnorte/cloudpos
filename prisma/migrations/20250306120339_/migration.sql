-- DropForeignKey
ALTER TABLE `cloud_family_subfamilia` DROP FOREIGN KEY `cloud_family_subfamilia_id_cloud_family_fkey`;

-- DropForeignKey
ALTER TABLE `cloud_family_subfamilia` DROP FOREIGN KEY `cloud_family_subfamilia_id_subfamilia_fkey`;

-- DropForeignKey
ALTER TABLE `cloud_product_relation` DROP FOREIGN KEY `fk_product_relation_product`;

-- DropForeignKey
ALTER TABLE `cloud_product_relation` DROP FOREIGN KEY `fk_product_relation_subfamily`;
