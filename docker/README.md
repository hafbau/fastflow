# Fastflow Docker Hub Image

Starts Fastflow from [DockerHub Image](https://hub.docker.com/r/leadevs/fastflow)

## Usage

1. Create `.env` file and specify the `PORT` (refer to `.env.example`)
2. `docker compose up -d`
3. Open [http://localhost:3000](http://localhost:3000)
4. You can bring the containers down by `docker compose stop`

## 🔒 Authentication

1. Create `.env` file and specify the `PORT`, `FASTFLOW_USERNAME`, and `FASTFLOW_PASSWORD` (refer to `.env.example`)
2. Pass `FASTFLOW_USERNAME` and `FASTFLOW_PASSWORD` to the `docker-compose.yml` file:
    ```
    environment:
        - PORT=${PORT}
        - FASTFLOW_USERNAME=${FASTFLOW_USERNAME}
        - FASTFLOW_PASSWORD=${FASTFLOW_PASSWORD}
    ```
3. `docker compose up -d`
4. Open [http://localhost:3000](http://localhost:3000)
5. You can bring the containers down by `docker compose stop`

## 🌱 Env Variables

If you like to persist your data (flows, logs, apikeys, credentials), set these variables in the `.env` file inside `docker` folder:

-   DATABASE_PATH=/root/.fastflow
-   APIKEY_PATH=/root/.fastflow
-   LOG_PATH=/root/.fastflow/logs
-   SECRETKEY_PATH=/root/.fastflow
-   BLOB_STORAGE_PATH=/root/.fastflow/storage

Fastflow also support different environment variables to configure your instance. Read [more](https://docs.flowiseai.com/environment-variables)
