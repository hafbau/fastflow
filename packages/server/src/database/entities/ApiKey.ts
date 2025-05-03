import { Column, Entity, PrimaryColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm'
import { IApiKey } from '../../Interface'
import { Organization } from './Organization'
import { Workspace } from './Workspace'

@Entity('apikey')
export class ApiKey implements IApiKey {
    @PrimaryColumn({ type: 'varchar', length: 20 })
    id: string

    @Column({ type: 'text' })
    apiKey: string

    @Column({ type: 'text' })
    apiSecret: string

    @Column({ type: 'text' })
    keyName: string

    @Column({ type: 'uuid', nullable: true })
    organizationId?: string

    @ManyToOne(() => Organization, { nullable: true })
    @JoinColumn({ name: 'organizationId' })
    organization?: Organization

    @Column({ type: 'uuid', nullable: true })
    workspaceId?: string

    @ManyToOne(() => Workspace, { nullable: true })
    @JoinColumn({ name: 'workspaceId' })
    workspace?: Workspace

    @Column({ type: 'uuid', nullable: true })
    supabaseUserId?: string

    @Column({ type: 'timestamp' })
    @UpdateDateColumn()
    updatedDate: Date
}
