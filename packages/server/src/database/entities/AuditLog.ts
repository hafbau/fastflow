import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm'

@Entity('audit_logs')
export class AuditLog {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ nullable: true, type: 'varchar' })
    userId: string | null

    @Column({ type: 'varchar' })
    action: string

    @Column({ type: 'varchar' })
    resourceType: string

    @Column({ nullable: true, type: 'varchar' })
    resourceId: string | null

    @Column({ type: 'simple-json', nullable: true })
    metadata: Record<string, any> | null

    @Column({ nullable: true, type: 'varchar' })
    ipAddress: string | null

    @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
    timestamp: Date

    @CreateDateColumn()
    createdAt: Date
}