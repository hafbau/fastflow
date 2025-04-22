import { Entity, Column, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn } from 'typeorm'
import { IUIComponent } from '../../Interface'

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

    @CreateDateColumn()
    createdDate: Date

    @UpdateDateColumn()
    updatedDate: Date
} 