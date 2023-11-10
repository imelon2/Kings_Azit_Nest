import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Index("id_UNIQUE", ["id"], { unique: true })
@Index("uuid_idx", ["uuid"], {})
@Entity("best_hand", { schema: "genesis" })
export class BestHand {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("varchar", { name: "card1", length: 45 })
  card1: string;

  @Column("varchar", { name: "card2", length: 45 })
  card2: string;

  @Column("varchar", { name: "card3", length: 45 })
  card3: string;

  @Column("varchar", { name: "card4", length: 45 })
  card4: string;

  @Column("varchar", { name: "card5", length: 45 })
  card5: string;

  @Column("varchar", { name: "date", nullable: true, length: 255 })
  date: string | null;

  @Column("varchar", { name: "uuid", nullable: true, length: 255 })
  uuid: string | null;
}
