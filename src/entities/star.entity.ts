import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Unique,
  Index,
} from 'typeorm';

@Entity('stars')
@Unique(['userId', 'itemId'])
export class Star {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  userId: string;

  @Column()
  @Index()
  itemId: string;

  @CreateDateColumn()
  createdAt: Date;
}
