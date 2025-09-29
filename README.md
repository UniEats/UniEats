## Subprojects

- [Backend](./backend/HELP.md)
- [Frontend](./frontend/README.md)

## Docker

Docker is an abstraction layer that allows applications to run in a loosely isolated context called a container

Install docker and docker-compose following the instructions in https://docs.docker.com/get-docker/

## Running

Review the environment variables in .env and start the system:

```bash
docker compose up -d --build --remove-orphans
```
