import { Entity, Column, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm'
import { IUIFlow } from '../../Interface'
import { ChatFlow } from './ChatFlow'

@Entity()
export class UIFlow implements IUIFlow {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    name: string

    @Column({ nullable: true })
    description: string

    @Column('text')
    flowData: string

    @Column('uuid')
    chatflowId: string

    @ManyToOne(() => ChatFlow, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'chatflowId' })
    chatflow: ChatFlow

    @Column({ default: false })
    isPublic: boolean

    @Column({ default: false })
    deployed: boolean

    @CreateDateColumn()
    createdDate: Date

    @UpdateDateColumn()
    updatedDate: Date
} 