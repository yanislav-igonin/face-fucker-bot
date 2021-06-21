import {
  Entity, Column, CreateDateColumn, PrimaryGeneratedColumn, ManyToOne, JoinColumn,
} from 'typeorm';

/* eslint-disable-next-line import/no-cycle */
import { User } from './User';

@Entity({ name: 'files' })
export class File {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'type' })
  type!: string;

  @Column({ name: 'size' })
  size!: number;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @ManyToOne(() => User, (user) => user.files)
  @JoinColumn({ name: 'user_id' })
  user!: User;
}
