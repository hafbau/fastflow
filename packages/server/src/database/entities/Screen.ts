import { Entity, Column, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm'
import { UIFlow } from './UIFlow'
import { UIComponent } from './UIComponent'
import { IScreen } from '../../Interface'

@Entity()
export class Screen implements IScreen {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    path: string

    @Column('simple-json', { nullable: true })
    queryParameters: Record<string, any>

    @Column('simple-json', { nullable: true })
    pathParameters: Record<string, any>

    @Column()
    title: string

    @Column('text', { nullable: true })
    description: string

    @Column('simple-json', { nullable: true })
    metadata: Record<string, any>

    @Column('uuid')
    uiFlowId: string

    @ManyToOne(() => UIFlow, (uiFlow) => uiFlow.screens, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'uiFlowId' })
    uiFlow: UIFlow

    @OneToMany(() => UIComponent, (uiComponent) => uiComponent.screen)
    components: UIComponent[]

    @CreateDateColumn()
    createdDate: Date

    @UpdateDateColumn()
    updatedDate: Date
} 