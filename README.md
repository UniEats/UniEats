# Read Me First

## Subprojects

- [Backend](./backend/README.md)
- [Frontend](./frontend/README.md)
- [Ingress](./ingress/README.md)

## Docker

Docker is an abstraction layer that allows applications to run in a loosely isolated context called a container

Install docker and docker-compose following the instructions in https://docs.docker.com/get-docker/

### Running

Review the environment variables in .env and start the system:

```bash
docker compose up -d --build --remove-orphans
```

## CI/CD

This project is designed to deploy to a server we have in the cloud

![Server layout, showing how all the containers nest](docs/server.png)
