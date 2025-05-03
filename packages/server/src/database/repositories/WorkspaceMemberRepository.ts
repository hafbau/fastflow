import { EntityRepository, Repository } from 'typeorm'
import { WorkspaceMember } from '../entities/WorkspaceMember'

@EntityRepository(WorkspaceMember)
export class WorkspaceMemberRepository extends Repository<WorkspaceMember> {
    async findByWorkspace(workspaceId: string): Promise<WorkspaceMember[]> {
        return this.find({ where: { workspaceId } })
    }

    async findByUser(userId: string): Promise<WorkspaceMember[]> {
        return this.find({ where: { userId } })
    }

    async findByWorkspaceAndUser(workspaceId: string, userId: string): Promise<WorkspaceMember | null> {
        return this.findOne({ where: { workspaceId, userId } })
    }

    async findWithWorkspace(id: string): Promise<WorkspaceMember | null> {
        return this.createQueryBuilder('member')
            .leftJoinAndSelect('member.workspace', 'workspace')
            .where('member.id = :id', { id })
            .getOne()
    }

    async isMember(workspaceId: string, userId: string): Promise<boolean> {
        const count = await this.count({ where: { workspaceId, userId } })
        return count > 0
    }
}