import { EntityRepository, Repository } from 'typeorm'
import { RolePermission } from '../entities/RolePermission'

@EntityRepository(RolePermission)
export class RolePermissionRepository extends Repository<RolePermission> {
    async findByRole(roleId: string): Promise<RolePermission[]> {
        return this.find({ where: { roleId } })
    }

    async findByPermission(permissionId: string): Promise<RolePermission[]> {
        return this.find({ where: { permissionId } })
    }

    async findByRoleAndPermission(roleId: string, permissionId: string): Promise<RolePermission | null> {
        return this.findOne({ where: { roleId, permissionId } })
    }

    async findWithRelations(id: string): Promise<RolePermission | null> {
        return this.createQueryBuilder('rolePermission')
            .leftJoinAndSelect('rolePermission.role', 'role')
            .leftJoinAndSelect('rolePermission.permission', 'permission')
            .where('rolePermission.id = :id', { id })
            .getOne()
    }
}