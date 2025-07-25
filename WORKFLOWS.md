# n8n Workflow Version Control Guide

This setup enables you to version control your n8n workflows alongside your Docker stack configuration.

## 🔄 Available Methods

### Method 1: Git Integration (Recommended)
n8n has built-in git support for workflow version control.

**Setup:**
- ✅ Already configured in `docker-compose.yml`
- ✅ Workflows folder mounted to `/home/node/.n8n/workflows`
- ✅ Git integration enabled via environment variables

**Usage:**
1. Enable git integration in n8n settings
2. Configure your git repository in n8n
3. Workflows automatically sync to `./workflows/` folder
4. Commit and push changes with your main repository

### Method 2: Manual Export/Import
Export workflows as JSON files for version control.

**Export Workflows:**
```bash
# Windows
.\scripts\backup-workflows.bat

# Linux/Mac
./scripts/backup-workflows.sh
```

**Manual Steps:**
1. Go to http://localhost:8080 (n8n interface)
2. Navigate to "Workflows" tab
3. Select workflow(s) to export
4. Click "Export" button
5. Save JSON files to `./workflows/exports/`
6. Commit to git

### Method 3: API-Based Export
Automate workflow exports using n8n's REST API.

```bash
# Get all workflows
curl -X GET 'http://localhost:8080/api/v1/workflows' \
  -H 'Content-Type: application/json'

# Get specific workflow
curl -X GET 'http://localhost:8080/api/v1/workflows/{workflow-id}' \
  -H 'Content-Type: application/json'
```

## 📁 Directory Structure

```
n8n-docker-caddy/
├── workflows/                 # Git-tracked workflows
│   ├── .gitkeep              # Ensures folder is tracked
│   └── exports/              # Manual exports
│       ├── README.md         # Export instructions
│       └── *.json           # Exported workflow files
└── scripts/
    ├── backup-workflows.sh   # Linux/Mac backup script
    └── backup-workflows.bat  # Windows backup script
```

## 🚀 Getting Started

1. **Access n8n**: http://localhost:8080
2. **Create workflows** in the n8n interface
3. **Enable git integration** in n8n settings (Settings > Version Control)
4. **Configure repository** to sync with `./workflows/` folder
5. **Commit changes** using standard git workflow

## 🔧 Configuration Details

The Docker setup includes:
- **Workflow persistence**: `./workflows:/home/node/.n8n/workflows`
- **Git integration**: `N8N_VERSION_CONTROL_ENABLED=true`
- **Workflow folder**: `N8N_VERSION_CONTROL_GIT_FOLDER=/home/node/.n8n/workflows`

## 📝 Best Practices

1. **Use descriptive workflow names** for easy identification
2. **Export workflows regularly** as backup
3. **Document workflow purposes** in descriptions
4. **Test workflows** before committing to main branch
5. **Use branches** for experimental workflows

## 🔍 Troubleshooting

**Workflows not syncing?**
- Check n8n logs: `docker-compose logs n8n`
- Verify git integration is enabled in n8n settings
- Ensure proper file permissions on `./workflows/` folder

**Cannot access workflows folder?**
- Restart Docker stack: `docker-compose restart`
- Check volume mounts: `docker-compose config`

## 🌐 Integration with Kraken API

Your workflows can now use the Kraken API service:
- **Kraken endpoints**: http://localhost:8080/kraken/*
- **Test dashboard**: http://localhost:8080/kraken/test
- **API documentation**: Available in kraken service

This enables automated trading, market data analysis, and custom cryptocurrency workflows!
