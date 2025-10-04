# Read Me First

This is a combination of things that can be used as they are, and incredibly contrived examples.

There are bad practices left in because they allow easy demonstrations, but which would be unacceptable
in production code. For example, users should not be able to sign up as admins with zero checks

## Subprojects

### [Backend](./backend/README.md)

Java/Spring Boot project used to implement the domain logic

### [Frontend](./frontend/README.md)

Typescript/React project used to present an user-friendly way to interact with the business logic

### [Ingress](./ingress/README.md)

Docker only. Redirects http requests to other containers depending on its configuration

Used to have multiple containers under a single http domain

## Docker

Docker is an abstraction layer that allows applications to run in a loosely isolated context called a container

Install docker and docker-compose following the instructions in https://docs.docker.com/get-docker/

Every project has a Dockerfile that specifies how its code should be run

### Running

To run the whole system in docker compose

1. Review the environment variables in .env

2. Start the system
   ```bash
   docker compose up -d --build --remove-orphans
   ```

## CI/CD

This project is designed to deploy to a server we have in the cloud

![Server layout, showing how all the containers nest](docs/server.png)

# Integrantes
- Calderón Máximo
- Cuello Milagros
- Molina Steven
- Moore Juan Ignacio
- Rehl Juana 
- Tripaldi Ulises

## Links Externos
[Jira](https://milagroscuello.atlassian.net/jira/software/projects/GPI/boards/34?atlOrigin=eyJpIjoiOTBhOWU2MjhkNDY2NDUyZDkzYjZkYWU5MTQ4ODlkOTAiLCJwIjoiaiJ9)

[User Persona y Mapa de Empatía](https://app.mural.co/t/grupo055925/m/grupo055925/1758658521797/dc0244d316ab9183a658b6f56afa6ee7c28c0966?sender=ubea8249a725d876538f90781)

[Cronograma y Roles](https://docs.google.com/spreadsheets/d/14a-IVLZZfmVnnkXXC1Du5CFg4KpsjTTV77lqSyEgMHk/edit?usp=sharing)

[Escenarios](https://drive.google.com/file/d/1bJ7Qa6A3Ql_2V1_rXYYQAIARyBDYhW0_/view?usp=sharing)

[MVP y Backlog](https://docs.google.com/document/d/1RmiKCfuDoR9Ev6Z0rYH0lLAbwZxCqqRDEN6AUV57Nj4/edit?usp=sharing)
