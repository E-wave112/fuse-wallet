import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity('Transactions')
export class Transactions extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, (user) => user.id, {
        onDelete: 'CASCADE',
        eager: true,
    })
    @JoinColumn()
    user: User;

    @Column({ default: 0 })
    amount: number;

    @Column()
    type: string;

    @Column()
    status: string;

    @Column()
    reference: string;

    @Column()
    narration: string;

    @Column()
    @CreateDateColumn()
    createdAt: Date;

    @Column()
    @UpdateDateColumn()
    updatedAt: Date;
}
