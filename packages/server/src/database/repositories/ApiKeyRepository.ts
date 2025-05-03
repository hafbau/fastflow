import { EntityRepository, Repository } from 'typeorm'
import { ApiKey } from '../entities/ApiKey'

@EntityRepository(ApiKey)
export class ApiKeyRepository extends Repository<ApiKey> {
    async findBySupabaseUser(supabaseUserId: string): Promise<ApiKey[]> {
        return this.find({ where: { supabaseUserId } })
    }

    async findByApiKey(apiKey: string): Promise<ApiKey | null> {
        return this.findOne({ where: { apiKey } })
    }

    async findByOrganization(organizationId: string): Promise<ApiKey[]> {
        return this.find({ where: { organizationId } })
    }

    async findByWorkspace(workspaceId: string): Promise<ApiKey[]> {
        return this.find({ where: { workspaceId } })
    }

    async findWithOrganizationAndWorkspace(id: string): Promise<ApiKey | null> {
        return this.createQueryBuilder('apiKey')
            .leftJoinAndSelect('apiKey.organization', 'organization')
            .leftJoinAndSelect('apiKey.workspace', 'workspace')
            .where('apiKey.id = :id', { id })
            .getOne()
    }
}