/* eslint-disable */
import { Entity, Column, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm'
import { AssistantType, IAssistant } from '../../Interface'
import { Organization } from './Organization'
import { Workspace } from './Workspace'

@Entity()
export class Assistant implements IAssistant {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ type: 'text' })
    details: string

    @Column({ type: 'uuid' })
    credential: string

    @Column({ nullable: true })
    iconSrc?: string

    @Column({ nullable: true, type: 'text' })
    type?: AssistantType

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
