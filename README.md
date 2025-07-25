# n8n-kraken-stack

A comprehensive Docker stack combining n8n workflow automation with Kraken cryptocurrency API integration. This project provides a production-ready environment for building automated trading workflows and cryptocurrency data analysis.

## 🚀 Features

- **n8n Workflow Automation**: Self-hosted n8n instance with persistent data
- **Caddy Reverse Proxy**: Automatic HTTPS with Let's Encrypt
- **Kraken API Service**: RESTful API for cryptocurrency trading operations
- **Docker Compose**: Multi-service orchestration with development tools
- **Security Best Practices**: Non-root containers, environment variable management
- **Development Ready**: Hot reloading, logging, and health checks

## 📋 Services Overview

| Service | Port | Description |
|---------|------|-------------|
| n8n | 5678 | Workflow automation platform |
| Caddy | 80/443 | Reverse proxy with automatic HTTPS |
| Kraken API | 3240 | Cryptocurrency API service |

## 🛠 Prerequisites

Self-hosting requires technical knowledge including:

- Docker and Docker Compose
- Basic understanding of containers and networking
- Server management and security practices
- Environment variable configuration
- Domain management (for production HTTPS)

**Important**: Mistakes can lead to data loss, security issues, and downtime. For beginners, consider [n8n Cloud](https://n8n.io/cloud/).

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/n8n-kraken-stack.git
cd n8n-kraken-stack
```

### 2. Environment Configuration

Copy the environment template:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your configuration:

```env
# n8n Configuration
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=your-username
N8N_BASIC_AUTH_PASSWORD=your-secure-password

# Kraken API Configuration (Required for Kraken service)
KRAKEN_API_KEY=your-kraken-api-key
KRAKEN_API_SECRET=your-kraken-api-secret

# Optional: Caddy Configuration
DOMAIN_NAME=your-domain.com
```

### 3. Start Services

For development:
```bash
docker-compose up -d
```

For production:
```bash
docker-compose -f docker-compose.yml up -d
```

### 4. Access Services

- **n8n**: http://localhost:5678
- **Kraken API Health**: http://localhost:3240/health
- **Kraken API Docs**: See API section below

## 🔑 Kraken API Setup

### Obtaining API Credentials

1. Log into your [Kraken account](https://www.kraken.com/)
2. Go to Settings → API
3. Create a new API key with required permissions:
   - **Query Funds**: For balance endpoints
   - **Query Open Orders & Trades**: For trading data
   - **Query Closed Orders & Trades**: For historical data

### API Endpoints

#### Health & System
| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/health` | GET | Service health check | No |
| `/api/time` | GET | Kraken server time | No |
| `/api/system-status` | GET | Kraken system status | No |

#### Market Data (Public)
| Endpoint | Method | Description | Required Params | Optional Params |
|----------|--------|-------------|-----------------|-----------------|
| `/api/assets` | GET | Asset information | None | `asset`, `aclass` |
| `/api/asset-pairs` | GET | Tradable asset pairs | None | `pair`, `info` |
| `/api/ticker` | GET | Ticker information | `pair` | None |
| `/api/ohlc` | GET | OHLC candlestick data | `pair` | `interval`, `since` |
| `/api/depth` | GET | Order book depth | `pair` | `count` |
| `/api/trades` | GET | Recent trades | `pair` | `since` |
| `/api/spread` | GET | Recent spread data | `pair` | `since` |

#### Account Data (Private)
| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/balance` | GET | Account balance | Yes |

### Example API Calls

#### Public Market Data
```bash
# System status
curl http://localhost:3240/api/system-status

# Get all assets
curl http://localhost:3240/api/assets

# Get specific assets
curl "http://localhost:3240/api/assets?asset=XBT,ETH"

# Get all tradable pairs
curl http://localhost:3240/api/asset-pairs

# Get Bitcoin ticker
curl "http://localhost:3240/api/ticker?pair=XXBTZUSD"

# Get OHLC data (1 hour intervals)
curl "http://localhost:3240/api/ohlc?pair=XXBTZUSD&interval=60"

# Get order book depth (top 10)
curl "http://localhost:3240/api/depth?pair=XXBTZUSD&count=10"

# Get recent trades
curl "http://localhost:3240/api/trades?pair=XXBTZUSD"

# Get spread data
curl "http://localhost:3240/api/spread?pair=XXBTZUSD"
```

#### Private Account Data
```bash
# Health check
curl http://localhost:3240/health

# Get server time
curl http://localhost:3240/api/time

# Get account balance (requires API credentials)
curl http://localhost:3240/api/balance
```

#### Parameter Details

**Asset Pairs**: Use Kraken's format (e.g., `XXBTZUSD`, `XETHZUSD`, `ADAUSD`)

**OHLC Intervals**: 1, 5, 15, 30, 60, 240, 1440, 10080, 21600 (minutes)

**Timestamps**: Unix timestamp format for `since` parameters

## 🏗 Development

### Project Structure

```
n8n-kraken-stack/
├── docker-compose.yml          # Main orchestration
├── .env                        # Public environment variables
├── .env.local                  # Private credentials (git-ignored)
├── .env.local.example          # Environment template
├── caddy_config/
│   └── Caddyfile              # Reverse proxy configuration
├── kraken/
│   ├── Dockerfile             # Multi-stage build
│   ├── package.json           # Node.js dependencies
│   └── index.js               # Express API server
└── local_files/               # n8n persistent data
```

### Development Workflow

1. **Start development environment**:
   ```bash
   docker-compose up -d
   ```

2. **View logs**:
   ```bash
   # All services
   docker-compose logs -f
   
   # Specific service
   docker-compose logs -f kraken
   ```

3. **Restart specific service**:
   ```bash
   docker-compose restart kraken
   ```

4. **Update dependencies**:
   ```bash
   # Rebuild after package.json changes
   docker-compose build kraken
   ```

### Hot Reloading

The Kraken service uses nodemon for automatic restart on code changes:
- Source code is mounted as a volume
- Changes to `kraken/index.js` trigger automatic restart
- Check logs to see restart notifications

## 🔒 Security Considerations

### Environment Variables
- Never commit `.env.local` to version control
- Use strong passwords for n8n authentication
- Restrict Kraken API key permissions to minimum required
- Consider IP whitelisting for API keys in production

### Production Deployment
- Use a proper domain with HTTPS (Caddy handles this automatically)
- Regularly update Docker images
- Monitor container logs
- Backup n8n data regularly
- Use secrets management in production environments

### Container Security
- All services run as non-root users
- Multi-stage builds minimize attack surface
- Health checks ensure service reliability
- Resource limits prevent container abuse

## 📊 Monitoring & Logging

### Health Checks
All services include health checks:
- **n8n**: Built-in health endpoint
- **Caddy**: Process-based health check
- **Kraken**: Custom health endpoint

### Log Management
```bash
# View real-time logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f kraken

# Export logs
docker-compose logs > logs.txt
```

## 🚀 Production Deployment

### Domain Configuration
1. Point your domain to your server's IP
2. Update `DOMAIN_NAME` in `.env.local`
3. Caddy will automatically obtain SSL certificates

### Scaling Considerations
- Use Docker Swarm or Kubernetes for multi-node deployments
- Consider external databases for n8n in high-availability setups
- Implement proper backup strategies
- Monitor resource usage and scale accordingly

## 🐛 Troubleshooting

### Common Issues

**Kraken API Authentication Errors**:
```bash
# Check environment variables
docker-compose exec kraken env | grep KRAKEN

# Verify API key permissions in Kraken web interface
# Ensure API key has "Query Funds" permission
```

**Port Conflicts**:
```bash
# Check if ports are already in use
netstat -tulpn | grep :3240
netstat -tulpn | grep :5678
```

**Container Build Issues**:
```bash
# Force rebuild
docker-compose build --no-cache kraken

# Clean Docker system
docker system prune -f
```

### Getting Help

- [n8n Community Forum](https://community.n8n.io/)
- [Kraken API Documentation](https://docs.kraken.com/rest/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)

## 📚 Additional Resources

- [DigitalOcean Tutorial](https://docs.n8n.io/hosting/server-setups/digital-ocean/)
- [Hetzner Cloud Tutorial](https://docs.n8n.io/hosting/server-setups/hetzner/)
- [n8n Self-Hosting Guide](https://docs.n8n.io/hosting/)
- [Kraken API Documentation](https://docs.kraken.com/rest/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

This software is provided for educational and development purposes. Trading cryptocurrencies involves significant risk. Always test thoroughly before using with real funds. The authors are not responsible for any financial losses.
