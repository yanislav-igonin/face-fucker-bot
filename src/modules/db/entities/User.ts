import {
  Entity, PrimaryColumn, Column, CreateDateColumn, OneToMany,
} from 'typeorm';

/* eslint-disable-next-line import/no-cycle */
import File from './File';

@Entity({ name: 'users' })
export default class User {
  @PrimaryColumn({ unique: true })
  public id!: number;

  @Column({ name: 'is_bot', default: false })
  public isBot!: boolean;

  @Column({ name: 'first_name', default: '' })
  public firstName!: string;

  @Column({ name: 'last_name', default: '' })
  public lastName!: string;

  @Column({ default: '' })
  public username!: string;

  @Column({ name: 'language_code', default: 'en' })
  public languageCode!: string;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  public createdAt!: Date;

  @OneToMany(() => File, (file) => file.user, { onDelete: 'CASCADE' })
  public files!: File[];
}
