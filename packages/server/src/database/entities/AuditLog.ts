import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm'

@Entity('audit_logs')
export class AuditLog {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ nullable: true })
    userId: string | null

    @Column()
    action: string

    @Column()
    resourceType: string

    @Column({ nullable: true })
    resourceId: string | null

    @Column({ type: 'jsonb', nullable: true })
    metadata: Record<string, any> | null

    @Column({ nullable: true })
    ipAddress: string | null

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    timestamp: Date

    @CreateDateColumn()
    createdAt: Date
}