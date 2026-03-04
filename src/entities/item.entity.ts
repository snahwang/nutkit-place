import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('items')
export class Item {
  @PrimaryColumn()
  itemId: string;

  @Column()
  type: string;

  @Column()
  @Index()
  name: string;

  @Column({ default: '' })
  description: string;

  @Column({ type: 'text', default: '' })
  detailDescription: string;

  @Column({ type: 'jsonb', default: [] })
  tags: string[];

  @Column({ default: 'published' })
  @Index()
  status: string;

  @Column({ type: 'jsonb', nullable: true })
  installActions: Record<string, any> | null;

  @Column({ default: '' })
  githubUrl: string;

  @Column({ default: '' })
  authorId: string;

  @Column({ default: '' })
  authorName: string;

  @Column({ default: '' })
  authorEmail: string;

  @Column({ default: 0 })
  starCount: number;

  @Column({ default: 0 })
  viewCount: number;

  @Column({ default: '' })
  icon: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
