import { Entity, Column, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm'
import { IUIComponent } from '../../Interface'
import { Screen } from './Screen'

@Entity()
export class UIComponent implements IUIComponent {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    name: string

    @Column({ nullable: true })
    description: string

    @Column()
    type: string

    @Column()
    category: string

    @Column('text')
    schema: string

    @Column('text')
    template: string

    @Column({ nullable: true })
    icon: string

    @Column('uuid', { nullable: true, select: false })
    screenId?: string

    @ManyToOne(() => Screen, (screen) => screen.components, { 
        nullable: true, 
        onDelete: 'SET NULL', 
        eager: false 
    })
    @JoinColumn({ name: 'screenId', referencedColumnName: 'id' })
    screen?: Screen

    @CreateDateColumn()
    createdDate: Date

    @UpdateDateColumn()
    updatedDate: Date
} 