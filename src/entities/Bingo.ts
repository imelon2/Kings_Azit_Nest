import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("bingo", { schema: "genesis" })
export class Bingo {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("varchar", { name: "user_uuid", length: 255 })
  userUuid: string;

  @Column("tinyint", { name: "field1" })
  field1: number;

  @Column("tinyint", { name: "field2" })
  field2: number;

  @Column("tinyint", { name: "field3" })
  field3: number;

  @Column("tinyint", { name: "field4" })
  field4: number;

  @Column("tinyint", { name: "field5" })
  field5: number;

  @Column("tinyint", { name: "field6" })
  field6: number;

  @Column("tinyint", { name: "field7" })
  field7: number;

  @Column("tinyint", { name: "field8" })
  field8: number;

  @Column("tinyint", { name: "field9" })
  field9: number;

  @Column("tinyint", { name: "field10" })
  field10: number;

  @Column("tinyint", { name: "field11" })
  field11: number;

  @Column("tinyint", { name: "field12" })
  field12: number;

  @Column("tinyint", { name: "field13" })
  field13: number;

  @Column("tinyint", { name: "field14" })
  field14: number;

  @Column("tinyint", { name: "field15" })
  field15: number;

  @Column("tinyint", { name: "field16" })
  field16: number;
}
