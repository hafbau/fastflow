import { Init1693840429259 } from './1693840429259-Init'
import { ModifyChatFlow1693997791471 } from './1693997791471-ModifyChatFlow'
import { ModifyChatMessage1693999022236 } from './1693999022236-ModifyChatMessage'
import { ModifyCredential1693999261583 } from './1693999261583-ModifyCredential'
import { ModifyTool1694001465232 } from './1694001465232-ModifyTool'
import { AddApiConfig1694099200729 } from './1694099200729-AddApiConfig'
import { AddAnalytic1694432361423 } from './1694432361423-AddAnalytic'
import { AddChatHistory1694658767766 } from './1694658767766-AddChatHistory'
import { AddAssistantEntity1699325775451 } from './1699325775451-AddAssistantEntity'
import { AddUsedToolsToChatMessage1699481607341 } from './1699481607341-AddUsedToolsToChatMessage'
import { AddCategoryToChatFlow1699900910291 } from './1699900910291-AddCategoryToChatFlow'
import { AddFileAnnotationsToChatMessage1700271021237 } from './1700271021237-AddFileAnnotationsToChatMessage'
import { AddFileUploadsToChatMessage1701788586491 } from './1701788586491-AddFileUploadsToChatMessage'
import { AddVariableEntity1699325775451 } from './1702200925471-AddVariableEntity'
import { AddSpeechToText1706364937060 } from './1706364937060-AddSpeechToText'
import { AddFeedback1707213626553 } from './1707213626553-AddFeedback'
import { AddUpsertHistoryEntity1709814301358 } from './1709814301358-AddUpsertHistoryEntity'
import { AddLead1710832127079 } from './1710832127079-AddLead'
import { AddLeadToChatMessage1711538023578 } from './1711538023578-AddLeadToChatMessage'
import { AddVectorStoreConfigToDocStore1715861032479 } from './1715861032479-AddVectorStoreConfigToDocStore'
import { AddDocumentStore1711637331047 } from './1711637331047-AddDocumentStore'
import { AddAgentReasoningToChatMessage1714679514451 } from './1714679514451-AddAgentReasoningToChatMessage'
import { CreateUserLifecycleTables1714348587000 } from './1714348587000-CreateUserLifecycleTables'
import { CreateCustomRoleTables1714348588000 } from './1714348588000-CreateCustomRoleTables'
import { AddTypeToChatFlow1716300000000 } from './1716300000000-AddTypeToChatFlow'
import { AddApiKey1720230151480 } from './1720230151480-AddApiKey'
import { AddActionToChatMessage1721078251523 } from './1721078251523-AddActionToChatMessage'
import { LongTextColumn1722301395521 } from './1722301395521-LongTextColumn'
import { AddCustomTemplate1725629836652 } from './1725629836652-AddCustomTemplate'
import { AddArtifactsToChatMessage1726156258465 } from './1726156258465-AddArtifactsToChatMessage'
import { AddFollowUpPrompts1726666302024 } from './1726666302024-AddFollowUpPrompts'
import { AddTypeToAssistant1733011290987 } from './1733011290987-AddTypeToAssistant'
import { CreateMultiTenancyTables1746196962000 } from './1746196962000-CreateMultiTenancyTables'
import { AddMultiTenancyToExistingTables1746197062000 } from './1746197062000-AddMultiTenancyToExistingTables'
import { AddMissingTypeColumnToRoleTable1746197501000 } from './1746197501000-AddMissingTypeColumnToRoleTable'
import { OrganizationSlugMigration1746197502000 } from './1746197502000-OrganizationSlugMigration'
import { UserProfileMigration1746197503000 } from './1746197503000-UserProfileMigration'
import { WorkspaceMemberMigration1746197504000 } from './1746197504000-WorkspaceMemberMigration'
import { AddScopeToPermissionTable1746197600000 } from './1746197600000-AddScopeToPermissionTable'
import { AddNameToPermissionTable1746197700000 } from './1746197700000-AddNameToPermissionTable'
import { CreateAuditLogsTable1746921360887 } from './1746921360887-CreateAuditLogsTable'
import { CreateAccessReviewTables1746922802000 } from './1746922802000-CreateAccessReviewTables'
import { CreateInvitationTable1746950000000 } from './1746950000000-CreateInvitationTable'

export const mysqlMigrations = [
    Init1693840429259,
    ModifyChatFlow1693997791471,
    ModifyChatMessage1693999022236,
    ModifyCredential1693999261583,
    ModifyTool1694001465232,
    AddApiConfig1694099200729,
    AddAnalytic1694432361423,
    AddChatHistory1694658767766,
    AddAssistantEntity1699325775451,
    AddUsedToolsToChatMessage1699481607341,
    AddCategoryToChatFlow1699900910291,
    AddFileAnnotationsToChatMessage1700271021237,
    AddVariableEntity1699325775451,
    AddFileUploadsToChatMessage1701788586491,
    AddSpeechToText1706364937060,
    AddUpsertHistoryEntity1709814301358,
    AddFeedback1707213626553,
    AddDocumentStore1711637331047,
    AddLead1710832127079,
    AddLeadToChatMessage1711538023578,
    AddAgentReasoningToChatMessage1714679514451,
    CreateUserLifecycleTables1714348587000,
    CreateCustomRoleTables1714348588000,
    AddTypeToChatFlow1716300000000,
    AddVectorStoreConfigToDocStore1715861032479,
    AddApiKey1720230151480,
    AddActionToChatMessage1721078251523,
    LongTextColumn1722301395521,
    AddCustomTemplate1725629836652,
    AddArtifactsToChatMessage1726156258465,
    AddFollowUpPrompts1726666302024,
    AddTypeToAssistant1733011290987,
    CreateMultiTenancyTables1746196962000,
    AddMultiTenancyToExistingTables1746197062000,
    AddMissingTypeColumnToRoleTable1746197501000,
    OrganizationSlugMigration1746197502000,
    UserProfileMigration1746197503000,
    WorkspaceMemberMigration1746197504000,
    AddScopeToPermissionTable1746197600000,
    AddNameToPermissionTable1746197700000,
    CreateAuditLogsTable1746921360887,
    CreateAccessReviewTables1746922802000,
    CreateInvitationTable1746950000000
]