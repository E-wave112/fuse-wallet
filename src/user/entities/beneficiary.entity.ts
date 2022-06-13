import {
    Column,
    Entity,
    BaseEntity,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity('beneficiary')
export class Emailver extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    // describe an beneficiary owner
    @Column({ type: 'varchar', default: '' })
    rootUser?: string;

    // describe the added beneficiary
    @Column({ type: 'varchar', default: '' })
    addedUser?: string;

    @Column()
    @CreateDateColumn()
    createdAt: Date;

    @Column()
    @UpdateDateColumn()
    updatedAt: Date;
}
