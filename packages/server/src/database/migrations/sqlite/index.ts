import { Init1693835579790 } from './1693835579790-Init'
import { ModifyChatFlow1693920824108 } from './1693920824108-ModifyChatFlow'
import { ModifyChatMessage1693921865247 } from './1693921865247-ModifyChatMessage'
import { ModifyCredential1693923551694 } from './1693923551694-ModifyCredential'
import { ModifyTool1693924207475 } from './1693924207475-ModifyTool'
import { AddApiConfig1694090982460 } from './1694090982460-AddApiConfig'
import { AddAnalytic1694432361423 } from './1694432361423-AddAnalytic'
import { AddChatHistory1694657778173 } from './1694657778173-AddChatHistory'
import { AddAssistantEntity1699325775451 } from './1699325775451-AddAssistantEntity'
import { AddUsedToolsToChatMessage1699481607341 } from './1699481607341-AddUsedToolsToChatMessage'
import { AddCategoryToChatFlow1699900910291 } from './1699900910291-AddCategoryToChatFlow'
import { AddFileAnnotationsToChatMessage1700271021237 } from './1700271021237-AddFileAnnotationsToChatMessage'
import { AddFileUploadsToChatMessage1701788586491 } from './1701788586491-AddFileUploadsToChatMessage'
import { AddVariableEntity1699325775451 } from './1702200925471-AddVariableEntity'
import { AddSpeechToText1706364937060 } from './1706364937060-AddSpeechToText'
import { AddFeedback1707213619308 } from './1707213619308-AddFeedback'
import { AddUpsertHistoryEntity1709814301358 } from './1709814301358-AddUpsertHistoryEntity'
import { AddLead1710832117612 } from './1710832117612-AddLead'
import { AddLeadToChatMessage1711537986113 } from './1711537986113-AddLeadToChatMessage'
import { AddVectorStoreConfigToDocStore1715861032479 } from './1715861032479-AddVectorStoreConfigToDocStore'
import { AddDocumentStore1711637331047 } from './1711637331047-AddDocumentStore'
import { AddAgentReasoningToChatMessage1714679514451 } from './1714679514451-AddAgentReasoningToChatMessage'
import { AddTypeToChatFlow1716300000000 } from './1716300000000-AddTypeToChatFlow'
import { AddApiKey1720230151480 } from './1720230151480-AddApiKey'
import { AddActionToChatMessage1721078251523 } from './1721078251523-AddActionToChatMessage'
import { AddArtifactsToChatMessage1726156258465 } from './1726156258465-AddArtifactsToChatMessage'
import { AddCustomTemplate1725629836652 } from './1725629836652-AddCustomTemplate'
import { AddFollowUpPrompts1726666294213 } from './1726666294213-AddFollowUpPrompts'
import { AddTypeToAssistant1733011290987 } from './1733011290987-AddTypeToAssistant'
import { CreateMultiTenancyTables1746196962000 } from './1746196962000-CreateMultiTenancyTables'
import { AddMultiTenancyToExistingTables1746197062000 } from './1746197062000-AddMultiTenancyToExistingTables'
import { AddMissingTypeColumnToRoleTable1746197501000 } from './1746197501000-AddMissingTypeColumnToRoleTable'
import { OrganizationSlugMigration1746197502000 } from './1746197502000-OrganizationSlugMigration'
import { UserProfileMigration1746197503000 } from './1746197503000-UserProfileMigration'
import { WorkspaceMemberMigration1746197504000 } from './1746197504000-WorkspaceMemberMigration'
import { AddScopeToPermissionTable1746197600000 } from './1746197600000-AddScopeToPermissionTable'
import { AddNameToPermissionTable1746197700000 } from './1746197700000-AddNameToPermissionTable'
import { CreateUserLifecycleTables1714348587000 } from './1714348587000-CreateUserLifecycleTables'
import { CreateCustomRoleTables1714348588000 } from './1714348588000-CreateCustomRoleTables'
import { UserProfileCamelCaseMigration1746841100000 } from './1746841100000-UserProfileCamelCaseMigration'
import { CreateAuditLogsTable1746921360887 } from './1746921360887-CreateAuditLogsTable'
import { CreateAccessReviewTables1746922802000 } from './1746922802000-CreateAccessReviewTables'
import { CreateInvitationTable1746950000000 } from './1746950000000-CreateInvitationTable'

export const sqliteMigrations = [
    Init1693835579790,
    ModifyChatFlow1693920824108,
    ModifyChatMessage1693921865247,
    ModifyCredential1693923551694,
    ModifyTool1693924207475,
    AddApiConfig1694090982460,
    AddAnalytic1694432361423,
    AddChatHistory1694657778173,
    AddAssistantEntity1699325775451,
    AddUsedToolsToChatMessage1699481607341,
    AddCategoryToChatFlow1699900910291,
    AddFileAnnotationsToChatMessage1700271021237,
    AddVariableEntity1699325775451,
    AddFileUploadsToChatMessage1701788586491,
    AddSpeechToText1706364937060,
    AddUpsertHistoryEntity1709814301358,
    AddFeedback1707213619308,
    AddDocumentStore1711637331047,
    AddLead1710832117612,
    AddLeadToChatMessage1711537986113,
    AddAgentReasoningToChatMessage1714679514451,
    CreateUserLifecycleTables1714348587000,
    CreateCustomRoleTables1714348588000,
    AddTypeToChatFlow1716300000000,
    AddVectorStoreConfigToDocStore1715861032479,
    AddApiKey1720230151480,
    AddActionToChatMessage1721078251523,
    AddArtifactsToChatMessage1726156258465,
    AddCustomTemplate1725629836652,
    AddFollowUpPrompts1726666294213,
    AddTypeToAssistant1733011290987,
    CreateMultiTenancyTables1746196962000,
    AddMultiTenancyToExistingTables1746197062000,
    AddMissingTypeColumnToRoleTable1746197501000,
    OrganizationSlugMigration1746197502000,
    UserProfileMigration1746197503000,
    UserProfileCamelCaseMigration1746841100000,
    WorkspaceMemberMigration1746197504000,
    AddScopeToPermissionTable1746197600000,
    AddNameToPermissionTable1746197700000,
    CreateAuditLogsTable1746921360887,
    CreateAccessReviewTables1746922802000,
    CreateInvitationTable1746950000000
]