import { EntityRepository, Repository } from 'typeorm'
import { ResourcePermission } from '../entities/ResourcePermission'

@EntityRepository(ResourcePermission)
export class ResourcePermissionRepository extends Repository<ResourcePermission> {
    async findByResource(resourceType: string, resourceId: string): Promise<ResourcePermission[]> {
        return this.find({ where: { resourceType, resourceId } })
    }

    async findByUser(userId: string): Promise<ResourcePermission[]> {
        return this.find({ where: { userId } })
    }

    async findByUserAndResource(userId: string, resourceType: string, resourceId: string): Promise<ResourcePermission[]> {
        return this.find({ where: { userId, resourceType, resourceId } })
    }

    async findByUserAndPermission(userId: string, permission: string): Promise<ResourcePermission[]> {
        return this.find({ where: { userId, permission } })
    }

    async findSpecificPermission(
        userId: string, 
        resourceType: string, 
        resourceId: string, 
        permission: string
    ): Promise<ResourcePermission | null> {
        return this.findOne({ where: { userId, resourceType, resourceId, permission } })
    }

    async hasPermission(
        userId: string, 
        resourceType: string, 
        resourceId: string, 
        permission: string
    ): Promise<boolean> {
        const count = await this.count({ where: { userId, resourceType, resourceId, permission } })
        return count > 0
    }
}