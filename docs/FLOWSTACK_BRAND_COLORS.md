# FlowStack Brand Colors & Design System

## Primary Brand Colors

### 🟣 Mauveine
- **Hex**: `#9e28b0`
- **RGB**: `158, 40, 176`
- **Usage**: Secondary actions, creative elements, innovation

### 🟠 Giants Orange  
- **Hex**: `#ff5524`
- **RGB**: `255, 85, 36`
- **Usage**: CTAs, alerts, high-energy actions, notifications

### 🟡 Amber
- **Hex**: `#fbbc05`
- **RGB**: `251, 188, 5`
- **Usage**: Warnings, highlights, optimistic messaging

### 🔵 Moonstone
- **Hex**: `#00bfd8`
- **RGB**: `0, 191, 216`
- **Usage**: Success states, positive feedback, data visualization

### 🔷 Royal Blue
- **Hex**: `#2563eb`
- **RGB**: `37, 99, 235`
- **Usage**: Primary buttons, main navigation, trust & reliability

## Color Combinations

### Gradients
1. **Primary Gradient** (Royal Blue → Mauveine)
   ```css
   background: linear-gradient(135deg, #2563eb 0%, #9e28b0 100%);
   ```

2. **Accent Gradient** (Orange → Amber)
   ```css
   background: linear-gradient(135deg, #ff5524 0%, #fbbc05 100%);
   ```

3. **Cool Gradient** (Moonstone → Royal Blue)
   ```css
   background: linear-gradient(135deg, #00bfd8 0%, #2563eb 100%);
   ```

## UI Component Mapping

### Buttons
- **Primary**: Royal Blue (#2563eb)
- **Secondary**: Mauveine (#9e28b0)
- **Danger**: Giants Orange (#ff5524)
- **Success**: Moonstone (#00bfd8)

### States
- **Default**: Royal Blue (#2563eb)
- **Hover**: Mauveine (#9e28b0)
- **Active**: Darker Royal Blue
- **Disabled**: Gray

### Alerts & Notifications
- **Info**: Royal Blue (#2563eb)
- **Success**: Moonstone (#00bfd8)
- **Warning**: Amber (#fbbc05)
- **Error**: Giants Orange (#ff5524)

## Accessibility Notes

### Contrast Ratios
- Royal Blue on white: **8.6:1** ✅ (AAA)
- Mauveine on white: **7.4:1** ✅ (AAA)
- Giants Orange on white: **3.5:1** ⚠️ (AA for large text)
- Amber on white: **1.8:1** ❌ (Use with dark backgrounds)
- Moonstone on white: **2.8:1** ⚠️ (AA for large text)

### Recommendations
1. Use Amber (#fbbc05) only for icons or with dark backgrounds
2. For text, prefer Royal Blue or Mauveine
3. Orange and Moonstone work well for large headings or UI elements

## Implementation in Code

```javascript
// CSS Variables (already in proxy)
:root {
    --flowstack-mauveine: #9e28b0;
    --flowstack-orange: #ff5524;
    --flowstack-amber: #fbbc05;
    --flowstack-moonstone: #00bfd8;
    --flowstack-royal-blue: #2563eb;
}

// JavaScript/React
const colors = {
    primary: '#2563eb',
    secondary: '#9e28b0',
    accent: '#ff5524',
    success: '#00bfd8',
    warning: '#fbbc05'
};

// Tailwind Classes (if using Tailwind)
const tailwindColors = {
    'flowstack-blue': '#2563eb',
    'flowstack-purple': '#9e28b0',
    'flowstack-orange': '#ff5524',
    'flowstack-cyan': '#00bfd8',
    'flowstack-yellow': '#fbbc05'
};
```

## Brand Personality

The FlowStack color palette conveys:
- **Innovation** (Mauveine/Purple)
- **Energy & Action** (Orange)
- **Optimism** (Amber/Yellow)
- **Clarity & Success** (Moonstone/Cyan)
- **Trust & Stability** (Royal Blue)

Together, these colors create a modern, energetic, and trustworthy brand that stands out in the AI/workflow automation space. 