import express, { Request } from 'express'
import documentStoreController from '../../controllers/documentstore'
import { getMulterStorage } from '../../utils'
import { authorize } from '../../middleware/auth/index'

const router = express.Router()

router.post(['/upsert/', '/upsert/:id'],
  authorize({ resourceType: 'documentstore', action: 'update', resourceId: (req: Request) => req.params.id }),
  getMulterStorage().array('files'),
  documentStoreController.upsertDocStoreMiddleware
)

router.post(['/refresh/', '/refresh/:id'],
  authorize({ resourceType: 'documentstore', action: 'update', resourceId: (req: Request) => req.params.id }),
  documentStoreController.refreshDocStoreMiddleware
)

/** Document Store Routes */
// Create document store
router.post('/store',
  authorize({ resourceType: 'documentstore', action: 'create' }),
  documentStoreController.createDocumentStore
)
// List all stores
router.get('/store',
  authorize({ resourceType: 'documentstore', action: 'read' }),
  documentStoreController.getAllDocumentStores
)
// Get specific store
router.get('/store/:id',
  authorize({ resourceType: 'documentstore', action: 'read', resourceId: (req: Request) => req.params.id }),
  documentStoreController.getDocumentStoreById
)
// Update documentStore
router.put('/store/:id',
  authorize({ resourceType: 'documentstore', action: 'update', resourceId: (req: Request) => req.params.id }),
  documentStoreController.updateDocumentStore
)
// Delete documentStore
router.delete('/store/:id',
  authorize({ resourceType: 'documentstore', action: 'delete', resourceId: (req: Request) => req.params.id }),
  documentStoreController.deleteDocumentStore
)
// Get document store configs
router.get('/store-configs/:id/:loaderId',
  authorize({ resourceType: 'documentstore', action: 'read', resourceId: (req: Request) => req.params.id }),
  documentStoreController.getDocStoreConfigs
)

/** Component Nodes = Document Store - Loaders */
// Get all loaders
router.get('/components/loaders', documentStoreController.getDocumentLoaders)

// delete loader from document store
router.delete('/loader/:id/:loaderId',
  authorize({ resourceType: 'documentstore', action: 'update', resourceId: (req: Request) => req.params.id }),
  documentStoreController.deleteLoaderFromDocumentStore
)
// chunking preview
router.post('/loader/preview',
  authorize({ resourceType: 'documentstore', action: 'read' }),
  documentStoreController.previewFileChunks
)
// saving process
router.post('/loader/save',
  authorize({ resourceType: 'documentstore', action: 'create' }),
  documentStoreController.saveProcessingLoader
)
// chunking process
router.post('/loader/process/:loaderId',
  authorize({ resourceType: 'documentstore', action: 'update' }),
  documentStoreController.processLoader
)

/** Document Store - Loaders - Chunks */
// delete specific file chunk from the store
router.delete('/chunks/:storeId/:loaderId/:chunkId',
  authorize({ resourceType: 'documentstore', action: 'update', resourceId: (req: Request) => req.params.storeId }),
  documentStoreController.deleteDocumentStoreFileChunk
)
// edit specific file chunk from the store
router.put('/chunks/:storeId/:loaderId/:chunkId',
  authorize({ resourceType: 'documentstore', action: 'update', resourceId: (req: Request) => req.params.storeId }),
  documentStoreController.editDocumentStoreFileChunk
)
// Get all file chunks from the store
router.get('/chunks/:storeId/:fileId/:pageNo',
  authorize({ resourceType: 'documentstore', action: 'read', resourceId: (req: Request) => req.params.storeId }),
  documentStoreController.getDocumentStoreFileChunks
)

// add chunks to the selected vector store
router.post('/vectorstore/insert',
  authorize({ resourceType: 'documentstore', action: 'update' }),
  documentStoreController.insertIntoVectorStore
)
// save the selected vector store
router.post('/vectorstore/save',
  authorize({ resourceType: 'documentstore', action: 'update' }),
  documentStoreController.saveVectorStoreConfig
)
// delete data from the selected vector store
router.delete('/vectorstore/:storeId',
  authorize({ resourceType: 'documentstore', action: 'delete', resourceId: (req: Request) => req.params.storeId }),
  documentStoreController.deleteVectorStoreFromStore
)
// query the vector store
router.post('/vectorstore/query',
  authorize({ resourceType: 'documentstore', action: 'read' }),
  documentStoreController.queryVectorStore
)
// Get all embedding providers
router.get('/components/embeddings',
  authorize({ resourceType: 'documentstore', action: 'read' }),
  documentStoreController.getEmbeddingProviders
)
// Get all vector store providers
router.get('/components/vectorstore',
  authorize({ resourceType: 'documentstore', action: 'read' }),
  documentStoreController.getVectorStoreProviders
)
// Get all Record Manager providers
router.get('/components/recordmanager',
  authorize({ resourceType: 'documentstore', action: 'read' }),
  documentStoreController.getRecordManagerProviders
)

// update the selected vector store from the playground
router.post('/vectorstore/update',
  authorize({ resourceType: 'documentstore', action: 'update' }),
  documentStoreController.updateVectorStoreConfigOnly
)

// generate docstore tool description
router.post('/generate-tool-desc/:id',
  authorize({ resourceType: 'documentstore', action: 'read', resourceId: (req: Request) => req.params.id }),
  documentStoreController.generateDocStoreToolDesc
)

export default router
