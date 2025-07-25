# Setup Guide for n8n-kraken-stack

This guide will help you set up your new repository on GitHub and deploy the stack.

## 🚀 GitHub Repository Setup

### Step 1: Create a New Repository on GitHub

1. Go to [GitHub](https://github.com) and sign in to your account
2. Click the "+" icon in the top right corner
3. Select "New repository"
4. Configure your repository:
   - **Repository name**: `n8n-kraken-stack`
   - **Description**: "Docker stack for n8n workflow automation with Kraken cryptocurrency API integration"
   - **Visibility**: Choose Public or Private based on your preference
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
5. Click "Create repository"

### Step 2: Connect Your Local Repository

After creating the repository on GitHub, connect your local repository:

```bash
# Add your new GitHub repository as origin
git remote add origin https://github.com/YOUR_USERNAME/n8n-kraken-stack.git

# Push your code to GitHub
git push -u origin main
```

**Replace `YOUR_USERNAME` with your actual GitHub username.**

### Step 3: Verify the Push

1. Refresh your GitHub repository page
2. You should see all your files and the commit history
3. The README.md should display properly with all the documentation

## 🛠 Local Development Setup

### Prerequisites

- Docker and Docker Compose installed
- Kraken account with API access
- Basic familiarity with command line

### Quick Start

1. **Clone your new repository**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/n8n-kraken-stack.git
   cd n8n-kraken-stack
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.local.example .env.local
   ```

3. **Edit `.env.local`** with your Kraken API credentials:
   ```env
   KRAKEN_API_KEY=your_actual_api_key
   KRAKEN_API_SECRET=your_actual_api_secret
   ```

4. **Start the stack**:
   ```bash
   docker-compose up -d
   ```

5. **Verify services are running**:
   ```bash
   # Check service status
   docker-compose ps
   
   # Test Kraken API
   curl http://localhost:3240/health
   
   # Access n8n
   # Open http://localhost:5678 in your browser
   ```

## 🔧 Development Workflow

### Making Changes

1. **Edit code** in the `kraken/` directory
2. **Changes are automatically detected** by nodemon
3. **View logs** to see restart notifications:
   ```bash
   docker-compose logs -f kraken
   ```

### Testing API Endpoints

```bash
# Health check
curl http://localhost:3240/health

# Server time (no auth required)
curl http://localhost:3240/api/time

# Account balance (requires valid API credentials)
curl http://localhost:3240/api/balance
```

### Updating Dependencies

If you modify `package.json`:

```bash
# Rebuild the container
docker-compose build kraken

# Restart with new image
docker-compose up -d kraken
```

## 📝 Next Steps

1. **Customize your stack** by adding more API endpoints to the Kraken service
2. **Create n8n workflows** that use your Kraken API endpoints
3. **Set up monitoring** for production deployments
4. **Configure domain and HTTPS** for production use

## 🆘 Troubleshooting

### Common Issues

**Port conflicts**:
```bash
# Check if ports are in use
netstat -an | findstr :3240
netstat -an | findstr :5678
```

**Container build issues**:
```bash
# Clean rebuild
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

**API authentication errors**:
- Verify your Kraken API key has the correct permissions
- Check that `.env.local` is properly formatted
- Ensure no extra spaces in API key/secret values

### Getting Help

- Check the main [README.md](README.md) for comprehensive documentation
- Review Docker Compose logs: `docker-compose logs`
- Visit the [n8n Community Forum](https://community.n8n.io/)
- Check [Kraken API Documentation](https://docs.kraken.com/rest/)

## ✅ Success Checklist

- [ ] Repository created on GitHub
- [ ] Local repository connected to GitHub
- [ ] Code pushed to GitHub
- [ ] `.env.local` configured with API credentials
- [ ] Docker services running successfully
- [ ] Kraken API endpoints responding
- [ ] n8n accessible in browser
- [ ] Ready to build workflows!

---

**Happy automating!** 🚀
