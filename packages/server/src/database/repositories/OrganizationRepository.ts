import { EntityRepository, Repository } from 'typeorm'
import { Organization } from '../entities/Organization'

@EntityRepository(Organization)
export class OrganizationRepository extends Repository<Organization> {
    async findBySlug(slug: string): Promise<Organization | null> {
        return this.findOne({ where: { slug } })
    }

    async findByUser(userId: string): Promise<Organization[]> {
        return this.createQueryBuilder('organization')
            .innerJoin('organization.members', 'member', 'member.userId = :userId', { userId })
            .getMany()
    }

    async findWithWorkspaces(id: string): Promise<Organization | null> {
        return this.createQueryBuilder('organization')
            .leftJoinAndSelect('organization.workspaces', 'workspace')
            .where('organization.id = :id', { id })
            .getOne()
    }

    async findWithMembers(id: string): Promise<Organization | null> {
        return this.createQueryBuilder('organization')
            .leftJoinAndSelect('organization.members', 'member')
            .where('organization.id = :id', { id })
            .getOne()
    }
}