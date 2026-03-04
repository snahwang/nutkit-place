import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { Tag } from './tag.entity';

@Entity('tag_groups')
export class TagGroup {
  @PrimaryColumn()
  groupId: string;

  @Column()
  groupName: string;

  @OneToMany(() => Tag, (tag) => tag.group, { eager: true })
  tags: Tag[];
}
