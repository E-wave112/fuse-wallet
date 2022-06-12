import { MigrationInterface, QueryRunner } from 'typeorm';

export class addTransaction1654585914370 implements MigrationInterface {
  name = 'addTransaction1654585914370';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "Transactions" ("id" SERIAL NOT NULL, "amount" integer NOT NULL DEFAULT '0', "type" character varying NOT NULL, "status" character varying NOT NULL, "reference" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, CONSTRAINT "PK_7761bf9766670b894ff2fdb3700" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "Transactions" ADD CONSTRAINT "FK_f01450fedf7507118ad25dcf41e" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "Transactions" DROP CONSTRAINT "FK_f01450fedf7507118ad25dcf41e"`,
    );
    await queryRunner.query(`DROP TABLE "Transactions"`);
  }
}
