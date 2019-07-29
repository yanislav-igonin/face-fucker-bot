# Face Fucker Bot

## Startup

### Development
`BOT_TOKEN=... docker-compose -f development.docker-compose.yml up --build`

### Production
`BOT_TOKEN=... RABBIT_URL=... SENTRY_DSN=... POSTGRES_URL=... docker stack deploy -c production.docker-compose.yml face_fucker_bot`