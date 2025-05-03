import { EntityRepository, Repository, IsNull } from 'typeorm'
import { Role } from '../entities/Role'

@EntityRepository(Role)
export class RoleRepository extends Repository<Role> {
    async findByName(name: string, organizationId?: string): Promise<Role | null> {
        return this.findOne({ where: { name, organizationId } })
    }

    async findByOrganization(organizationId: string): Promise<Role[]> {
        return this.find({ where: { organizationId } })
    }

    async findWithPermissions(id: string): Promise<Role | null> {
        return this.createQueryBuilder('role')
            .leftJoinAndSelect('role.permissions', 'rolePermission')
            .leftJoinAndSelect('rolePermission.permission', 'permission')
            .where('role.id = :id', { id })
            .getOne()
    }

    async findSystemRoles(): Promise<Role[]> {
        return this.find({ where: { organizationId: IsNull() } })
    }

    async findByUser(userId: string): Promise<Role[]> {
        return this.createQueryBuilder('role')
            .innerJoin('role.userRoles', 'userRole', 'userRole.userId = :userId', { userId })
            .getMany()
    }
}