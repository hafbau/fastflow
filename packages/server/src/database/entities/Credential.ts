/* eslint-disable */
import { Entity, Column, PrimaryGeneratedColumn, Index, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm'
import { ICredential } from '../../Interface'
import { Organization } from './Organization'
import { Workspace } from './Workspace'

@Entity()
export class Credential implements ICredential {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    name: string

    @Column()
    credentialName: string

    @Column({ type: 'text' })
    encryptedData: string

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

    @Column({ type: 'timestamp' })
    @CreateDateColumn()
    createdDate: Date

    @Column({ type: 'timestamp' })
    @UpdateDateColumn()
    updatedDate: Date
}
