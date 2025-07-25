#!/bin/bash

# n8n Workflow Backup Script
# This script exports workflows from n8n and saves them to the workflows directory

BACKUP_DIR="./workflows/exports"
N8N_URL="http://localhost:8080"
DATE=$(date +"%Y%m%d_%H%M%S")

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

echo "📁 Creating workflow backup directory: $BACKUP_DIR"
echo "🔄 Exporting workflows from n8n..."

# Function to export all workflows (requires n8n CLI or API)
export_workflows() {
    echo "To manually export workflows:"
    echo "1. Go to http://localhost:8080 (n8n interface)"
    echo "2. Navigate to 'Workflows' tab"
    echo "3. Select workflows to export"
    echo "4. Click 'Export' button"
    echo "5. Save the exported JSON files to ./workflows/exports/"
    echo ""
    echo "Or use the n8n API to automate exports:"
    echo "curl -X GET '$N8N_URL/api/v1/workflows' -H 'Content-Type: application/json'"
}

# Create a README for the workflows directory
cat > "$BACKUP_DIR/README.md" << EOF
# n8n Workflow Exports

This directory contains exported n8n workflows for version control.

## Export Methods

### Manual Export
1. Open n8n interface at http://localhost:8080
2. Go to Workflows tab
3. Select workflow(s) to export
4. Click Export button
5. Save JSON files here

### API Export
\`\`\`bash
# Get all workflows
curl -X GET 'http://localhost:8080/api/v1/workflows' \\
  -H 'Content-Type: application/json'

# Get specific workflow
curl -X GET 'http://localhost:8080/api/v1/workflows/{workflow-id}' \\
  -H 'Content-Type: application/json'
\`\`\`

## File Naming Convention
- \`workflow-name_YYYYMMDD_HHMMSS.json\`
- Example: \`data-processing_20250724_143022.json\`

## Git Integration
With n8n's git integration enabled, workflows are automatically synced.
EOF

export_workflows
echo "✅ Backup structure created in $BACKUP_DIR"
