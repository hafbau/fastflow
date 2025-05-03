import { EntityRepository, Repository } from 'typeorm'
import { UserRole } from '../entities/UserRole'

@EntityRepository(UserRole)
export class UserRoleRepository extends Repository<UserRole> {
    async findByUser(userId: string): Promise<UserRole[]> {
        return this.find({ where: { userId } })
    }

    async findByRole(roleId: string): Promise<UserRole[]> {
        return this.find({ where: { roleId } })
    }

    async findByWorkspace(workspaceId: string): Promise<UserRole[]> {
        return this.find({ where: { workspaceId } })
    }

    async findByUserAndWorkspace(userId: string, workspaceId: string): Promise<UserRole[]> {
        return this.find({ where: { userId, workspaceId } })
    }

    async findByUserAndRole(userId: string, roleId: string): Promise<UserRole | null> {
        return this.findOne({ where: { userId, roleId } })
    }

    async findWithRelations(id: string): Promise<UserRole | null> {
        return this.createQueryBuilder('userRole')
            .leftJoinAndSelect('userRole.role', 'role')
            .leftJoinAndSelect('userRole.workspace', 'workspace')
            .where('userRole.id = :id', { id })
            .getOne()
    }
}