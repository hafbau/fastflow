import { EntityRepository, Repository } from 'typeorm'
import { OrganizationMember } from '../entities/OrganizationMember'

@EntityRepository(OrganizationMember)
export class OrganizationMemberRepository extends Repository<OrganizationMember> {
    async findByOrganization(organizationId: string): Promise<OrganizationMember[]> {
        return this.find({ where: { organizationId } })
    }

    async findByUser(userId: string): Promise<OrganizationMember[]> {
        return this.find({ where: { userId } })
    }

    async findByOrganizationAndUser(organizationId: string, userId: string): Promise<OrganizationMember | null> {
        return this.findOne({ where: { organizationId, userId } })
    }

    async findWithOrganization(id: string): Promise<OrganizationMember | null> {
        return this.createQueryBuilder('member')
            .leftJoinAndSelect('member.organization', 'organization')
            .where('member.id = :id', { id })
            .getOne()
    }

    async isMember(organizationId: string, userId: string): Promise<boolean> {
        const count = await this.count({ where: { organizationId, userId } })
        return count > 0
    }
}