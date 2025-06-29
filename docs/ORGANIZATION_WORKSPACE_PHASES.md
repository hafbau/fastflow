# Organization & Workspace Management Implementation Timeline

## Phase 1: Basic Workspace (Week 1-2) ✅ MVP
**Goal**: Single workspace per user, basic isolation

### What to Build:
```javascript
// 1. Simple workspace assignment in proxy
const workspaceMiddleware = (req, res, next) => {
    // For MVP: 1 workspace = 1 user account
    req.workspace = {
        id: req.user.id, // Use user ID as workspace ID initially
        name: req.user.companyName || 'My Workspace'
    };
    next();
};

// 2. Filter chatflows by workspace
app.use('/api/v1/chatflows', (req, res, next) => {
    // Inject workspace filter
    const originalUrl = req.url;
    req.url += (req.url.includes('?') ? '&' : '?') + 
               `category=${req.workspace.id}`;
    next();
});

// 3. Tag new chatflows with workspace
app.post('/api/v1/chatflows', (req, res, next) => {
    req.body.category = req.workspace.id; // Reuse category field
    next();
});
```

### Database (Minimal):
```sql
-- Just extend your auth table
ALTER TABLE users ADD COLUMN workspace_name VARCHAR(255);
ALTER TABLE users ADD COLUMN workspace_settings JSONB;
```

### UI Changes:
- Add workspace name to header (hardcoded component)
- No workspace switching yet

---

## Phase 2: Multi-Workspace (Week 3-4) 🚀 Differentiator
**Goal**: Users can create/switch workspaces, invite team members

### What to Build:

#### Backend:
```javascript
// Workspace API endpoints
app.post('/api/workspaces', async (req, res) => {
    const workspace = await createWorkspace({
        name: req.body.name,
        ownerId: req.user.id
    });
    res.json(workspace);
});

app.get('/api/workspaces', async (req, res) => {
    const workspaces = await getWorkspacesForUser(req.user.id);
    res.json(workspaces);
});

app.post('/api/workspaces/:id/invite', async (req, res) => {
    await inviteToWorkspace(req.params.id, req.body.email);
    res.json({ success: true });
});

// Enhanced middleware
const workspaceMiddleware = async (req, res, next) => {
    const workspaceId = req.headers['x-workspace-id'] || 
                       req.cookies.workspace_id;
    
    req.workspace = await getWorkspace(workspaceId);
    
    // Verify user has access
    const hasAccess = await checkWorkspaceAccess(
        req.user.id, 
        req.workspace.id
    );
    
    if (!hasAccess) {
        return res.status(403).json({ error: 'Access denied' });
    }
    
    next();
};
```

#### Database:
```sql
CREATE TABLE workspaces (
    id UUID PRIMARY KEY,
    name VARCHAR(255),
    owner_id UUID REFERENCES users(id),
    settings JSONB,
    created_at TIMESTAMP
);

CREATE TABLE workspace_members (
    workspace_id UUID REFERENCES workspaces(id),
    user_id UUID REFERENCES users(id),
    role VARCHAR(50), -- 'owner', 'admin', 'member', 'viewer'
    joined_at TIMESTAMP,
    PRIMARY KEY (workspace_id, user_id)
);

-- Track which resources belong to which workspace
CREATE TABLE workspace_resources (
    workspace_id UUID REFERENCES workspaces(id),
    resource_type VARCHAR(50), -- 'chatflow', 'credential', etc
    resource_id VARCHAR(255),  -- ID from Flowise
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP
);
```

#### UI Components:
```tsx
// Workspace Switcher Component
export function WorkspaceSwitcher() {
    const [workspaces] = useWorkspaces();
    const [current, setCurrent] = useCurrentWorkspace();
    
    return (
        <Select value={current.id} onChange={switchWorkspace}>
            {workspaces.map(ws => (
                <Option value={ws.id}>{ws.name}</Option>
            ))}
            <Option value="new">+ Create Workspace</Option>
        </Select>
    );
}

// Invite Team Modal
export function InviteTeamModal() {
    return (
        <Modal>
            <h2>Invite Team Members</h2>
            <EmailInput />
            <RoleSelector />
            <Button>Send Invite</Button>
        </Modal>
    );
}
```

---

## Phase 2.5: Organization Layer (Week 5-6) 🏢 Enterprise
**Goal**: Multiple workspaces under one organization

### What to Build:

#### Database:
```sql
CREATE TABLE organizations (
    id UUID PRIMARY KEY,
    name VARCHAR(255),
    owner_id UUID REFERENCES users(id),
    plan VARCHAR(50), -- 'free', 'pro', 'enterprise'
    settings JSONB
);

-- Workspaces belong to organizations
ALTER TABLE workspaces 
ADD COLUMN organization_id UUID REFERENCES organizations(id);

-- Organization-wide roles
CREATE TABLE organization_members (
    organization_id UUID REFERENCES organizations(id),
    user_id UUID REFERENCES users(id),
    role VARCHAR(50), -- 'owner', 'admin', 'member'
    PRIMARY KEY (organization_id, user_id)
);
```

#### Features:
- Organization-wide settings
- Billing at organization level
- Cross-workspace resource sharing
- Organization admin panel

---

## Phase 3: Advanced Features (Week 7-8+) 🚀

### RBAC (Role-Based Access Control):
```javascript
// Fine-grained permissions
const permissions = {
    chatflow: {
        admin: ['create', 'read', 'update', 'delete', 'execute'],
        member: ['create', 'read', 'update', 'execute'],
        viewer: ['read', 'execute']
    },
    credentials: {
        admin: ['create', 'read', 'update', 'delete'],
        member: ['read'],
        viewer: []
    }
};

// Check permission
const canEdit = await rbac.check(
    user.role, 
    'chatflow', 
    'update',
    resourceId
);
```

### Advanced Workspace Features:
- Workspace templates
- Resource quotas/limits
- Audit logs per workspace
- Workspace analytics
- Custom workspace branding

---

## Implementation Priority:

### Must Have (Phase 1-2):
1. ✅ Basic workspace isolation
2. ✅ Workspace switching
3. ✅ Team invites
4. ✅ Basic roles (owner/member)

### Should Have (Phase 2.5):
1. 🔄 Organizations
2. 🔄 Advanced RBAC
3. 🔄 Billing integration

### Nice to Have (Phase 3+):
1. ⏳ SSO per organization
2. ⏳ Workspace templates
3. ⏳ Advanced analytics
4. ⏳ API keys per workspace

## Quick Decision Tree:

```
Are you B2C (individual users)?
└─> Start with Phase 1 only

Are you B2B (teams)?
└─> Implement Phase 1 + 2 quickly

Are you Enterprise B2B?
└─> Plan for all phases from start
```

## Migration Path:

```bash
Week 1: Basic workspace (reuse category field)
Week 2: Add workspace table, keep backward compat
Week 3: Workspace UI (switcher, settings)
Week 4: Team invites
Week 5: Organizations (if needed)
Week 6+: Advanced RBAC
```

This gives you workspace management early (Week 1-2) with room to grow! 