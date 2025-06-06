import express from 'express'
import apikeyRouter from './apikey'
import assistantsRouter from './assistants'
import attachmentsRouter from './attachments'
import auditLogsRouter from './audit-logs'
import chatMessageRouter from './chat-messages'
import chatflowsRouter from './chatflows'
import chatflowsStreamingRouter from './chatflows-streaming'
import chatflowsUploadsRouter from './chatflows-uploads'
import componentsCredentialsRouter from './components-credentials'
import componentsCredentialsIconRouter from './components-credentials-icon'
import credentialsRouter from './credentials'
import documentStoreRouter from './documentstore'
import exportImportRouter from './export-import'
import feedbackRouter from './feedback'
import fetchLinksRouter from './fetch-links'
import flowConfigRouter from './flow-config'
import getUploadFileRouter from './get-upload-file'
import getUploadPathRouter from './get-upload-path'
import internalChatmessagesRouter from './internal-chat-messages'
import internalPredictionRouter from './internal-predictions'
import invitationsRouter from './invitations'
import leadsRouter from './leads'
import loadPromptRouter from './load-prompts'
import marketplacesRouter from './marketplaces'
import nodeConfigRouter from './node-configs'
import nodeCustomFunctionRouter from './node-custom-functions'
import nodeIconRouter from './node-icons'
import nodeLoadMethodRouter from './node-load-methods'
import nodesRouter from './nodes'
import openaiAssistantsRouter from './openai-assistants'
import openaiAssistantsFileRouter from './openai-assistants-files'
import openaiAssistantsVectorStoreRouter from './openai-assistants-vector-store'
import openaiRealtimeRouter from './openai-realtime'
import organizationsRouter from './organizations'
import organizationChatflowsRouter from './organization-chatflows'
import workspaceChatflowsRouter from './workspace-chatflows'
import pingRouter from './ping'
import predictionRouter from './predictions'
import promptListsRouter from './prompts-lists'
import publicChatbotRouter from './public-chatbots'
import publicChatflowsRouter from './public-chatflows'
import statsRouter from './stats'
import toolsRouter from './tools'
import upsertHistoryRouter from './upsert-history'
import variablesRouter from './variables'
import searchRouter from './search'
import vectorRouter from './vectors'
import verifyRouter from './verify'
import versionRouter from './versions'
import workspacesRouter from './workspaces'
import nvidiaNimRouter from './nvidia-nim'
import userRouter from './userRoutes'
import rateLimitRouter from './rate-limit'
import rolesPermissionsRouter from './roles-permissions'
import resourcePermissionsRouter from './resource-permissions'
import customRolesRouter from './custom-roles'
import accessReviewRouter from './accessReview.routes'
import userLifecycleRouter from './userLifecycle.routes'
import fineGrainedPermissionRouter from './fineGrainedPermissionRoutes'
import analyticsRouter from './analytics.routes'

const router = express.Router()

router.use('/', invitationsRouter)
router.use('/ping', pingRouter)
router.use('/apikey', apikeyRouter)
router.use('/assistants', assistantsRouter)
router.use('/attachments', attachmentsRouter)
router.use('/audit-logs', auditLogsRouter)
router.use('/chatflows', chatflowsRouter)
router.use('/chatflows-streaming', chatflowsStreamingRouter)
router.use('/chatmessage', chatMessageRouter)
router.use('/components-credentials', componentsCredentialsRouter)
router.use('/components-credentials-icon', componentsCredentialsIconRouter)
router.use('/chatflows-uploads', chatflowsUploadsRouter)
router.use('/credentials', credentialsRouter)
router.use('/document-store', documentStoreRouter)
router.use('/export-import', exportImportRouter)
router.use('/feedback', feedbackRouter)
router.use('/fetch-links', fetchLinksRouter)
router.use('/flow-config', flowConfigRouter)
router.use('/internal-chatmessage', internalChatmessagesRouter)
router.use('/internal-prediction', internalPredictionRouter)
router.use('/get-upload-file', getUploadFileRouter)
router.use('/get-upload-path', getUploadPathRouter)
router.use('/leads', leadsRouter)
router.use('/load-prompt', loadPromptRouter)
router.use('/marketplaces', marketplacesRouter)
router.use('/node-config', nodeConfigRouter)
router.use('/node-custom-function', nodeCustomFunctionRouter)
router.use('/node-icon', nodeIconRouter)
router.use('/node-load-method', nodeLoadMethodRouter)
router.use('/nodes', nodesRouter)
router.use('/openai-assistants', openaiAssistantsRouter)
router.use('/openai-assistants-file', openaiAssistantsFileRouter)
router.use('/openai-assistants-vector-store', openaiAssistantsVectorStoreRouter)
router.use('/openai-realtime', openaiRealtimeRouter)
router.use('/prediction', predictionRouter)
router.use('/prompts-list', promptListsRouter)
router.use('/public-chatbotConfig', publicChatbotRouter)
router.use('/public-chatflows', publicChatflowsRouter)
router.use('/organizations', organizationsRouter)
router.use('/organizations/:organizationId/chatflows', organizationChatflowsRouter)
router.use('/search', searchRouter)
router.use('/stats', statsRouter)
router.use('/tools', toolsRouter)
router.use('/users', userRouter)
router.use('/variables', variablesRouter)
router.use('/vector', vectorRouter)
router.use('/verify', verifyRouter)
router.use('/version', versionRouter)
router.use('/workspaces', workspacesRouter)
router.use('/workspaces/:workspaceId/chatflows', workspaceChatflowsRouter)
router.use('/upsert-history', upsertHistoryRouter)
router.use('/nvidia-nim', nvidiaNimRouter)
router.use('/rate-limit', rateLimitRouter)
router.use('/roles-permissions', rolesPermissionsRouter)
router.use('/resource-permissions', resourcePermissionsRouter)
router.use('/custom-roles', customRolesRouter)
router.use('/access-reviews', accessReviewRouter)
router.use('/user-lifecycle', userLifecycleRouter)
router.use('/permissions', fineGrainedPermissionRouter)
router.use('/analytics', analyticsRouter)

export default router
