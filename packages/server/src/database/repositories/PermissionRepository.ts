import { EntityRepository, Repository } from 'typeorm'
import { Permission } from '../entities/Permission'

@EntityRepository(Permission)
export class PermissionRepository extends Repository<Permission> {
    async findByResourceAndAction(resourceType: string, action: string): Promise<Permission | null> {
        return this.findOne({ where: { resourceType, action } })
    }

    async findByResourceType(resourceType: string): Promise<Permission[]> {
        return this.find({ where: { resourceType } })
    }

    async findByRole(roleId: string): Promise<Permission[]> {
        return this.createQueryBuilder('permission')
            .innerJoin('permission.roles', 'rolePermission', 'rolePermission.roleId = :roleId', { roleId })
            .getMany()
    }

    async findByUser(userId: string): Promise<Permission[]> {
        return this.createQueryBuilder('permission')
            .innerJoin('permission.roles', 'rolePermission')
            .innerJoin('rolePermission.role', 'role')
            .innerJoin('role.userRoles', 'userRole', 'userRole.userId = :userId', { userId })
            .getMany()
    }
}