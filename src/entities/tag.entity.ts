import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { TagGroup } from './tag-group.entity';

@Entity('tags')
export class Tag {
  @PrimaryColumn()
  tagId: string;

  @Column()
  label: string;

  @Column()
  groupId: string;

  @Column({ default: 0 })
  order: number;

  @ManyToOne(() => TagGroup, (group) => group.tags)
  @JoinColumn({ name: 'groupId' })
  group: TagGroup;
}
