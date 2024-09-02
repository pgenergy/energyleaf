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

### Generate migration files

Make changes to the schema file. Then generate the migration file.

```bash
    pnpm pg:generate
```

To generate a migration file without changes to the schema.

```bash
    pnpm pg:generate:empty --name <migration_name>
```

### Apply migration

To apply the migration to the database.

```bash
    pnpm pg:migrate
```

### Use studio

Via the studio you can see the and browse the data currently in the database

```bash
    pnpm pg:studio
```

## Resources

-   [Next.js](https://nextjs.org/docs)
-   [DrizzleORM](https://orm.drizzle.team/docs/overview)
-   [TurboRepo](https://turbo.build/repo/docs)
-   [Typescript](https://www.typescriptlang.org/docs/)
