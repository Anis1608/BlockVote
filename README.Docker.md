# Docker Deployment Guide - Blockchain Voting System

This guide explains how to deploy the Blockchain Voting System using Docker and Docker Compose.

## Prerequisites

- Docker Engine 20.10 or higher
- Docker Compose 2.0 or higher
- At least 4GB of available RAM
- At least 10GB of available disk space

## Quick Start

### 1. Environment Setup

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit the `.env` file and add your configuration:

```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
SECRET_KEY=your-secret-key-here
STELLAR_SERVER=https://horizon-testnet.stellar.org
```

### 2. Build and Start All Services

```bash
docker-compose up -d
```

This command will:
- Build the Backend and Frontend Docker images
- Pull MongoDB and Redis images
- Create a dedicated network for all services
- Start all containers in detached mode

### 3. Access the Application

- **Frontend**: http://localhost
- **Backend API**: http://localhost:5000/api
- **MongoDB**: localhost:27017
- **Redis**: localhost:6379

### 4. View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb
docker-compose logs -f redis
```

### 5. Stop All Services

```bash
docker-compose down
```

To also remove volumes (database data):

```bash
docker-compose down -v
```

## Service Details

### MongoDB
- **Image**: mongo:7.0
- **Port**: 27017
- **Credentials**: 
  - Username: `admin`
  - Password: `blockvote_admin_2024`
- **Volume**: `mongodb_data` (persistent storage)

### Redis
- **Image**: redis:7-alpine
- **Port**: 6379
- **Password**: `blockvote_redis_2024`
- **Volume**: `redis_data` (persistent storage)

### Backend
- **Build**: ./Backend/Dockerfile
- **Port**: 5000
- **Dependencies**: MongoDB, Redis
- **Volume**: `backend_uploads` (for file uploads)

### Frontend
- **Build**: ./Frontend/Dockerfile (multi-stage with nginx)
- **Port**: 80
- **Dependencies**: Backend

## Development vs Production

### Development Mode

For development, continue using your existing setup:

```bash
# Backend
cd Backend
npm install
nodemon index

# Frontend
cd Frontend
npm install
npm run dev
```

### Production Mode

Use Docker Compose for production deployment as described above.

## Useful Commands

### Rebuild Services

```bash
# Rebuild all services
docker-compose build

# Rebuild specific service
docker-compose build backend
docker-compose build frontend
```

### Restart Services

```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart backend
```

### Execute Commands in Containers

```bash
# Access backend shell
docker-compose exec backend sh

# Access MongoDB shell
docker-compose exec mongodb mongosh -u admin -p blockvote_admin_2024

# Access Redis CLI
docker-compose exec redis redis-cli -a blockvote_redis_2024
```

### Check Service Health

```bash
docker-compose ps
```

### View Resource Usage

```bash
docker stats
```

## Troubleshooting

### Port Already in Use

If you get port conflicts, modify the port mappings in `docker-compose.yml`:

```yaml
ports:
  - "8080:80"  # Frontend on port 8080 instead of 80
  - "5001:5000"  # Backend on port 5001 instead of 5000
```

### Database Connection Issues

1. Check if MongoDB is healthy:
   ```bash
   docker-compose ps mongodb
   ```

2. View MongoDB logs:
   ```bash
   docker-compose logs mongodb
   ```

3. Verify connection string in backend logs:
   ```bash
   docker-compose logs backend | grep -i mongo
   ```

### Frontend Not Loading

1. Check nginx logs:
   ```bash
   docker-compose logs frontend
   ```

2. Verify the build completed successfully:
   ```bash
   docker-compose build frontend
   ```

### Clear Everything and Start Fresh

```bash
# Stop and remove containers, networks, and volumes
docker-compose down -v

# Remove images
docker-compose down --rmi all

# Rebuild and start
docker-compose up -d --build
```

## Production Deployment Checklist

- [ ] Update all passwords in `.env` file
- [ ] Use strong `SECRET_KEY`
- [ ] Configure proper email credentials
- [ ] Set up SSL/TLS certificates (use nginx-proxy or traefik)
- [ ] Configure firewall rules
- [ ] Set up automated backups for MongoDB
- [ ] Configure log rotation
- [ ] Set up monitoring (Prometheus, Grafana)
- [ ] Use production MongoDB URI if using cloud database
- [ ] Use production Redis URI if using cloud cache

## Backup and Restore

### Backup MongoDB

```bash
docker-compose exec mongodb mongodump --username admin --password blockvote_admin_2024 --authenticationDatabase admin --out /data/backup
docker cp blockvote-mongodb:/data/backup ./backup
```

### Restore MongoDB

```bash
docker cp ./backup blockvote-mongodb:/data/backup
docker-compose exec mongodb mongorestore --username admin --password blockvote_admin_2024 --authenticationDatabase admin /data/backup
```

## Support

For issues or questions, please refer to the main README.md or contact the development team.
