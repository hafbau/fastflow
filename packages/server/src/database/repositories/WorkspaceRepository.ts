import { EntityRepository, Repository } from 'typeorm'
import { Workspace } from '../entities/Workspace'

@EntityRepository(Workspace)
export class WorkspaceRepository extends Repository<Workspace> {
    async findBySlug(organizationId: string, slug: string): Promise<Workspace | null> {
        return this.findOne({ where: { organizationId, slug } })
    }

    async findByUser(userId: string): Promise<Workspace[]> {
        return this.createQueryBuilder('workspace')
            .innerJoin('workspace.members', 'member', 'member.userId = :userId', { userId })
            .getMany()
    }

    async findByOrganization(organizationId: string): Promise<Workspace[]> {
        return this.find({ where: { organizationId } })
    }

    async findWithMembers(id: string): Promise<Workspace | null> {
        return this.createQueryBuilder('workspace')
            .leftJoinAndSelect('workspace.members', 'member')
            .where('workspace.id = :id', { id })
            .getOne()
    }

    async findWithOrganization(id: string): Promise<Workspace | null> {
        return this.createQueryBuilder('workspace')
            .leftJoinAndSelect('workspace.organization', 'organization')
            .where('workspace.id = :id', { id })
            .getOne()
    }
}