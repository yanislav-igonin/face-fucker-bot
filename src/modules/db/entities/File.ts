import {
  Entity, Column, CreateDateColumn, PrimaryGeneratedColumn, ManyToOne, JoinColumn,
} from 'typeorm';

/* eslint-disable-next-line import/no-cycle */
import User from './User';

@Entity({ name: 'files' })
export default class File {
  @PrimaryGeneratedColumn()
  public id!: number;

  @Column({ name: 'type' })
  public type!: string;

  @Column({ name: 'size' })
  public size!: number;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  public createdAt!: Date;

  /* eslint-disable @typescript-eslint/explicit-function-return-type */
  /* eslint-disable @typescript-eslint/no-unused-vars */
  @ManyToOne((type) => User, (user) => user.files)
  @JoinColumn({ name: 'user_id' })
  public user!: User
}
