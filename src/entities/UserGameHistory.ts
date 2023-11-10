import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Member } from "./Member";

@Index("uuid_idx", ["userUuid"], {})
@Entity("user_game_history", { schema: "genesis" })
export class UserGameHistory {
  @Column("varchar", { name: "user_uuid", length: 255 })
  userUuid: string;

  @Column("varchar", { name: "game_date", length: 45 })
  gameDate: string;

  @Column("varchar", { name: "game_id", length: 45 })
  gameId: string;

  @Column("int", { name: "point", nullable: true })
  point: number | null;

  @Column("int", { name: "prize_amount", nullable: true })
  prizeAmount: number | null;

  @Column("varchar", { name: "prize_type", nullable: true, length: 45 })
  prizeType: string | null;

  @Column("int", { name: "place", nullable: true })
  place: number | null;

  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @ManyToOne(() => Member, (member) => member.userGameHistories, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "user_uuid", referencedColumnName: "uuid" }])
  userUu: Member;
}
