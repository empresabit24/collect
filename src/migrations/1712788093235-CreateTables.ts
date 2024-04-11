import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTables1712788093235 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log("CREANDO TABLA 'receivable'");
    await queryRunner.query(`
          CREATE TABLE IF NOT EXISTS "sch_main"."receivable"(
          "id_receivable" SERIAL PRIMARY KEY,
          "idcliente" INT NOT NULL,
          "description" TEXT NOT NULL,
          "total_amount" DECIMAL(10,2) NOT NULL,
          "pending_amount" DECIMAL (10,2) NOT NULL DEFAULT 0,
          "payday_limit" TIMESTAMP WITH TIME ZONE NOT NULL,
          "iddocumentoventa" INT,
           CONSTRAINT fk_documentoventa
               FOREIGN KEY (iddocumentoventa)
               REFERENCES "sch_main"."documentosventa"("iddocumentoventa"),
           CONSTRAINT fk_cliente
               FOREIGN KEY ("idcliente")
               REFERENCES "sch_main"."clientes"("idcliente")
          )
        `);

    console.log("CREANDO TABLA 'collect'");
    await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "sch_main"."collect" (
                "id_collect" SERIAL PRIMARY KEY,
                "id_receivable" INT NOT NULL,
                "idformapago" INT NOT NULL,
                "amount" DECIMAL(10,2) NOT NULL,
                "payment_date" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT fk_formapago
                    FOREIGN KEY (idformapago)
                    REFERENCES "sch_main"."formaspago"("idformapago"),
                CONSTRAINT fk_id_receivable
                    FOREIGN KEY ("id_receivable")
                    REFERENCES "sch_main"."receivable"("id_receivable")
            )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP TABLE IF EXISTS sch_main.collect;
            DROP TABLE IF EXISTS sch_main.receivable;
        `);
  }
}
