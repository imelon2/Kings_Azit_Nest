import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { MemberRoles } from "./MemberRoles";

@Entity("role", { schema: "genesis" })
export class Role {
  @PrimaryGeneratedColumn({ type: "bigint", name: "id" })
  id: string;

  @Column("varchar", { name: "name", nullable: true, length: 255 })
  name: string | null;

  @OneToMany(() => MemberRoles, (memberRoles) => memberRoles.roles)
  memberRoles: MemberRoles[];
}
