import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm'
import { DocumentStoreStatus, IDocumentStore } from '../../Interface'
import { Organization } from './Organization'
import { Workspace } from './Workspace'

@Entity()
export class DocumentStore implements IDocumentStore {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ nullable: false, type: 'text' })
    name: string

    @Column({ nullable: true, type: 'text' })
    description: string

    @Column({ nullable: true, type: 'text' })
    loaders: string

    @Column({ nullable: true, type: 'text' })
    whereUsed: string

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

    @Column({ nullable: false, type: 'text' })
    status: DocumentStoreStatus

    @Column({ nullable: true, type: 'text' })
    vectorStoreConfig: string | null

    @Column({ nullable: true, type: 'text' })
    embeddingConfig: string | null

    @Column({ nullable: true, type: 'text' })
    recordManagerConfig: string | null
}
