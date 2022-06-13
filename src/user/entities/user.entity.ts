import {
  Column,
  Entity,
  BaseEntity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  // BeforeInsert,
} from 'typeorm';

@Entity('User')
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: '' })
  firstName?: string;

  @Column({ default: '' })
  lastName?: string;

  @Column({ default: '' })
  email?: string;

  @Column()
  pin?: string;

  @Column()
  phone?: string;

  @Column({ default: '' })
  transactionPin?: string;

  @Column({ default: false })
  verified?: boolean;

  @Column({ default: '' })
  privateKey?: string;

  @Column({ default: '' })
  resetToken?: string;

  @Column({ default: 10000, type: 'bigint' })
  resetTokenExpiry?: number;

  // describe a date of birth field
  @Column({ default: '' })
  dob?: string;

  @Column({ default: false })
  isAdmin?: boolean;

  @Column({ type: 'varchar', default: '' })
  deviceId?: string;

  @Column({ type: 'varchar', default: '' })
  deviceIp?: string;

  @Column({ type: 'varchar', default: '' })
  deviceModel?: string;

  @Column({
    type: 'enum',
    enum: ['android', 'ios', 'web'],
    default: 'web',
  })
  platform?: string;

  @Column({ type: 'varchar', default: '' })
  lastLoggedIn?: string;

  // All transactions done by a user
  @OneToMany(() => User, (user) => user.id)
  beneficiaries: User[];

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;
}
