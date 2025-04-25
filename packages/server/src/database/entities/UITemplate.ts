import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm'
import { IUITemplate } from '../../Interface'
import { getDbConfig } from '../../utils'

const dbConfig = getDbConfig()

@Entity()
export class UITemplate implements IUITemplate {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    name: string

    @Column({ nullable: true })
    description?: string

    @Column()
    version: string

    @Column({ nullable: true })
    category?: string

    @Column('simple-array', { nullable: true })
    tags?: string[]

    @Column({
        type: dbConfig.type === 'sqlite' ? 'text' : dbConfig.type === 'postgres' ? 'jsonb' : 'json'
    })
    data: {
        screens: Array<{
            id: string
            name: string
            components: Array<any>
        }>
        flowData: {
            nodes: any[]
            edges: any[]
        },
        metadata?: Record<string, any>
    }

    @CreateDateColumn()
    createdDate: Date

    @UpdateDateColumn()
    updatedDate: Date
} 