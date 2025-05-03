import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm'

@Entity('resource_permission')
export class ResourcePermission {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ length: 100 })
    resourceType: string

    @Column({ type: 'uuid' })
    resourceId: string

    @Column({ type: 'uuid' })
    userId: string

    @Column({ length: 50 })
    permission: string
}