import express from 'express'
import apikeyRouter from './apikey'
import assistantsRouter from './assistants'
import attachmentsRouter from './attachments'
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
import pingRouter from './ping'
import predictionRouter from './predictions'
import promptListsRouter from './prompts-lists'
import publicChatbotRouter from './public-chatbots'
import publicChatflowsRouter from './public-chatflows'
import screensRouter from './screens'
import statsRouter from './stats'
import toolsRouter from './tools'
import uiComponentsRouter from './uicomponents'
import upsertHistoryRouter from './upsert-history'
import variablesRouter from './variables'
import vectorRouter from './vectors'
import verifyRouter from './verify'
import versionRouter from './versions'
import nvidiaNimRouter from './nvidia-nim'

const router = express.Router()

router.use('/ping', pingRouter)
router.use('/apikey', apikeyRouter)
router.use('/verify', verifyRouter)
router.use('/chatflows', chatflowsRouter)
router.use('/chatflows-streaming', chatflowsStreamingRouter)
router.use('/chatflows-uploads', chatflowsUploadsRouter)
router.use('/public-chatbots', publicChatbotRouter)
router.use('/public-chatflows', publicChatflowsRouter)
router.use('/components-credentials', componentsCredentialsRouter)
router.use('/components-credentials-icon', componentsCredentialsIconRouter)
router.use('/credentials', credentialsRouter)
router.use('/node-icons', nodeIconRouter)
router.use('/node-configs', nodeConfigRouter)
router.use('/node-load-methods', nodeLoadMethodRouter)
router.use('/node-custom-functions', nodeCustomFunctionRouter)
router.use('/nodes', nodesRouter)
router.use('/chat-messages', chatMessageRouter)
router.use('/internal-chat-messages', internalChatmessagesRouter)
router.use('/predictions', predictionRouter)
router.use('/internal-predictions', internalPredictionRouter)
router.use('/flow-config', flowConfigRouter)
router.use('/marketplaces', marketplacesRouter)
router.use('/load-prompts', loadPromptRouter)
router.use('/prompts-lists', promptListsRouter)
router.use('/export-import', exportImportRouter)
router.use('/leads', leadsRouter)
router.use('/documentstore', documentStoreRouter)
router.use('/get-upload-path', getUploadPathRouter)
router.use('/get-upload-file', getUploadFileRouter)
router.use('/feedback', feedbackRouter)
router.use('/attachments', attachmentsRouter)
router.use('/assistants', assistantsRouter)
router.use('/upsert-history', upsertHistoryRouter)
router.use('/variables', variablesRouter)
router.use('/vectors', vectorRouter)
router.use('/stats', statsRouter)
router.use('/versions', versionRouter)
router.use('/tools', toolsRouter)
router.use('/ui-components', uiComponentsRouter)
router.use('/openai-assistants', openaiAssistantsRouter)
router.use('/openai-assistants-files', openaiAssistantsFileRouter)
router.use('/openai-assistants-vector-store', openaiAssistantsVectorStoreRouter)
router.use('/openai-realtime', openaiRealtimeRouter)
router.use('/nvidia-nim', nvidiaNimRouter)
router.use('/screens', screensRouter)

export default router
