import { MigrationInterface, QueryRunner } from 'typeorm';

export class newMigration1655092342021 implements MigrationInterface {
    name = 'newMigration1655092342021';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE \`User\` (\`id\` varchar(36) NOT NULL, \`firstName\` varchar(255) NOT NULL DEFAULT '', \`lastName\` varchar(255) NOT NULL DEFAULT '', \`email\` varchar(255) NOT NULL DEFAULT '', \`pin\` varchar(255) NOT NULL, \`phone\` varchar(255) NOT NULL, \`transactionPin\` varchar(255) NOT NULL DEFAULT '', \`verified\` tinyint NOT NULL DEFAULT 0, \`privateKey\` varchar(255) NOT NULL DEFAULT '', \`resetToken\` varchar(255) NOT NULL DEFAULT '', \`resetTokenExpiry\` bigint NOT NULL DEFAULT '10000', \`dob\` varchar(255) NOT NULL DEFAULT '', \`isAdmin\` tinyint NOT NULL DEFAULT 0, \`deviceId\` varchar(255) NOT NULL DEFAULT '', \`deviceIp\` varchar(255) NOT NULL DEFAULT '', \`deviceModel\` varchar(255) NOT NULL DEFAULT '', \`platform\` enum ('android', 'ios', 'web') NOT NULL DEFAULT 'web', \`lastLoggedIn\` varchar(255) NOT NULL DEFAULT '', \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `CREATE TABLE \`Transactions\` (\`id\` int NOT NULL AUTO_INCREMENT, \`amount\` int NOT NULL DEFAULT '0', \`type\` varchar(255) NOT NULL, \`status\` varchar(255) NOT NULL, \`reference\` varchar(255) NOT NULL, \`narration\` varchar(255) NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`userId\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `CREATE TABLE \`beneficiary\` (\`id\` varchar(36) NOT NULL, \`rootUser\` varchar(255) NOT NULL DEFAULT '', \`addedUser\` varchar(255) NOT NULL DEFAULT '', \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `CREATE TABLE \`emailver\` (\`id\` varchar(36) NOT NULL, \`verifyToken\` varchar(255) NOT NULL DEFAULT '', \`email\` varchar(255) NOT NULL DEFAULT '', \`verifyTokenExpiry\` bigint NOT NULL DEFAULT '900002', \`valid\` tinyint NOT NULL DEFAULT 1, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `CREATE TABLE \`Wallet\` (\`id\` varchar(36) NOT NULL, \`balance\` int NOT NULL DEFAULT '0', \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`userId\` varchar(36) NULL, UNIQUE INDEX \`REL_2f7aa51d6746fc8fc8ed63ddfb\` (\`userId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `ALTER TABLE \`Transactions\` ADD CONSTRAINT \`FK_f01450fedf7507118ad25dcf41e\` FOREIGN KEY (\`userId\`) REFERENCES \`User\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE \`Wallet\` ADD CONSTRAINT \`FK_2f7aa51d6746fc8fc8ed63ddfbc\` FOREIGN KEY (\`userId\`) REFERENCES \`User\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE \`Wallet\` DROP FOREIGN KEY \`FK_2f7aa51d6746fc8fc8ed63ddfbc\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`Transactions\` DROP FOREIGN KEY \`FK_f01450fedf7507118ad25dcf41e\``,
        );
        await queryRunner.query(
            `DROP INDEX \`REL_2f7aa51d6746fc8fc8ed63ddfb\` ON \`Wallet\``,
        );
        await queryRunner.query(`DROP TABLE \`Wallet\``);
        await queryRunner.query(`DROP TABLE \`emailver\``);
        await queryRunner.query(`DROP TABLE \`beneficiary\``);
        await queryRunner.query(`DROP TABLE \`Transactions\``);
        await queryRunner.query(`DROP TABLE \`User\``);
    }
}
