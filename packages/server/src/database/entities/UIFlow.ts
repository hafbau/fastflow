import { Entity, Column, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm'
import { IUIFlow } from '../../Interface'
import { ChatFlow } from './ChatFlow'
import { Screen } from './Screen'

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

    @OneToMany(() => Screen, (screen) => screen.uiFlow)
    screens: Screen[]

    @Column({ default: false })
    isPublic: boolean

    @Column({ default: false })
    deployed: boolean

    @CreateDateColumn()
    createdDate: Date

    @UpdateDateColumn()
    updatedDate: Date
} 