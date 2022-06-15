import {
    Column,
    Entity,
    BaseEntity,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity('emailver')
export class Emailver extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    // describe an verify token field
    @Column({ type: 'varchar', default: '' })
    verifyToken?: string;

    @Column({ type: 'varchar', default: '' })
    email?: string;

    @Column({ default: 2 + 15 * 60 * 1000, type: 'bigint' })
    verifyTokenExpiry?: number;

    @Column({ default: true })
    valid?: boolean;

    @Column()
    @CreateDateColumn()
    createdAt: Date;

    @Column()
    @UpdateDateColumn()
    updatedAt: Date;
}
