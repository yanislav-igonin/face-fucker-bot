import {
  Entity, PrimaryColumn, Column, CreateDateColumn, OneToMany,
} from 'typeorm';

/* eslint-disable-next-line import/no-cycle */
import File from './File';

@Entity({ name: 'users' })
export default class User {
  @PrimaryColumn({ unique: true })
  id!: number;

  @Column({ name: 'is_bot', default: false })
  isBot!: boolean;

  @Column({ name: 'first_name', default: '' })
  firstName!: string;

  @Column({ name: 'last_name', default: '' })
  lastName!: string;

  @Column({ default: '' })
  username!: string;

  @Column({ name: 'language_code', default: 'en' })
  languageCode!: string;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @OneToMany(() => File, (file) => file.user, { onDelete: 'CASCADE' })
  files!: File[];
}
