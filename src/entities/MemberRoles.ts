import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { Role } from "./Role";
import { Member } from "./Member";

@Index("FK2tjitfwusgpe5i0qlgwjbhgjk", ["rolesId"], {})
@Index("FKet63dfllh4o5qa9qwm7f5kx9x", ["memberId"], {})
@Entity("member_roles", { schema: "genesis" })
export class MemberRoles {
  // @PrimaryColumn()
  @PrimaryColumn("bigint", { name: "member_id" })
  memberId: string;

  @Column("bigint", { name: "roles_id" })
  rolesId: string;

  @ManyToOne(() => Role, (role) => role.memberRoles, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  
  @JoinColumn([{ name: "roles_id", referencedColumnName: "id" }])
  roles: Role;

  @ManyToOne(() => Member, (member) => member.memberRoles, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "member_id", referencedColumnName: "id" }])
  member: Member;
}
