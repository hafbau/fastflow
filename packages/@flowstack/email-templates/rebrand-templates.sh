#!/bin/bash

# Script to copy and rebrand email templates from Flowise to FlowStack

CORE_TEMPLATES="/Users/hafizsuara/Projects/flowstack/core/packages/server/src/enterprise/emails"
FLOWSTACK_TEMPLATES="/Users/hafizsuara/Projects/flowstack/packages/@flowstack/email-templates"

# Copy all template files
for template in "$CORE_TEMPLATES"/*.hbs; do
    filename=$(basename "$template")
    echo "Processing $filename..."
    
    # Copy and replace branding
    sed -e 's/FlowiseAI/FlowStack/g' \
        -e 's/Flowise/FlowStack/g' \
        -e 's/flowise_logo\.png/flowstack_logo.png/g' \
        -e 's/auth\.flowiseai\.com/getflowstack.ai/g' \
        -e 's/flowise_email_bg\.svg/flowstack_email_bg.svg/g' \
        -e 's/https:\/\/twitter\.com\/FlowiseAI/https:\/\/twitter.com\/FlowStack/g' \
        -e 's/https:\/\/github\.com\/FlowiseAI\/Flowise/https:\/\/github.com\/FlowStack/g' \
        -e 's/👋//g' \
        "$template" > "$FLOWSTACK_TEMPLATES/$filename"
done

# For templates that don't have logos, use text-based branding
for template in "$FLOWSTACK_TEMPLATES"/*.hbs; do
    # Replace logo image with text if it exists
    sed -i '' '/<img.*flowise_logo\.png.*>/,/<\/td>/c\
<td style="width: 150px; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt;">\
    <div style="font-family: Inter, -apple-system, Helvetica; font-size: 28px; font-weight: 700; color: #ffffff;">\
        FlowStack\
    </div>\
</td>' "$template"
done

echo "Email templates rebranded successfully!"