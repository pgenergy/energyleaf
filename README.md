# Energyleaf

Monorepo for the energyleaf project.

## Installation

You will need to use pnpm as packagemanager: [download here](https://pnpm.io/installation).
In order to use a local database, you will need docker: [download here](https://docker.com).

Install dependencies:

```bash
    pnpm install
```

## Enviroment Variables

To ensure no secrets are leaked, all sensitive variables are stored in an .env file.
To start the project you need to rename the .env.sample file to .env

Ask a team member to get the information needed.

## Running the project

Run the project in development mode:

```bash
    pnpm dev
    
    # start docker if using local db
    docker-compose up -d
```

To build the project:

```bash
    pnpm build
```

## Use database

To use the database and make changes to the schema. You need to install the pscale cli: [download here](https://planetscale.com/features/cli)

### Make schema changes

#### Remote database setup

If you want to make changes to the remote database you will need to create a branch.
To create a branch in [planetscale](https://planetscale.com). Then connect to that branch via the pscale cli.

```bash
    # Step can be ignored if only local
    pscale connect energyleaf <branch_name> --port 3309
```

after you are connected push your changes to the database

#### Local database

The local database will be run in a docker container.

```bash
    DB_NAME=energyleaf
    DB_USER=root
    DB_PASSWORD=root
    DB_PORT=3306
```

to reset the db either delete the data folder in the root dir or use db:push

#### Push changes

```bash
    # Local (needs docker running)
    pnpm db:push

    # Remote (needs pscale cli)
    pnpm db:push:prod
```

you then can create a deploy request either via cli or the dashboard at [planetscale](https://planetscale.com)

### Use studio

Via the studio you can see the and browse the data currently in the database

```bash
    # Local (needs docker running)
    pnpm db:studio

    # Remote (needs pscale cli)
    pnpm db:studio:prod
```

## Resources

-   [Next.js](https://nextjs.org/docs)
-   [Planetscale](https://planetscale.com/docs)
-   [DrizzleORM](https://orm.drizzle.team/docs/overview)
-   [TurboRepo](https://turbo.build/repo/docs)
-   [Typescript](https://www.typescriptlang.org/docs/)
