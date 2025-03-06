/*
  Warnings:

  - You are about to drop the `cloud_family_group_relation` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `cloud_family_group_relation` DROP FOREIGN KEY `fk_group_relation_family`;

-- DropForeignKey
ALTER TABLE `cloud_family_group_relation` DROP FOREIGN KEY `fk_group_relation_group`;

-- DropTable
DROP TABLE `cloud_family_group_relation`;
