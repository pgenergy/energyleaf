
# Energyleaf

Monorepo for the energyleaf project.


## Installation

You will need to use pnpm as packagemanager: [download here](https://pnpm.io/installation).


Install dependencies:
```bash
    pnpm install
```

## Enviroment Variables
To ensure no secrets are leaked, all sensitive variables are stored in an .env file.
To start the project you need to rename the .env.sampel file to .env

Ask a team member to get the information needed.

## Running the project

Run the project in development mode:

```bash
    pnpm dev
```

To build the project:
```bash
    pnpm build
```

## Use database
To use the database and make changes to the schema. You need to install the pscale cli: [download here](https://planetscale.com/features/cli)

### Make schema changes
First you need to create a branch in [planetscale](https://planetscale.com). Then connect to that branch via the pscale cli.

```bash
    pscale connect energyleaf <branch_name> --port 3309
```

after you are connected push your changes to the database

```bash
    pnpm db:push
```

you then can create a deploy request either via cli or the dashboard at [planetscale](https://planetscale.com)

### Use studio
Via the studio you can see the and browse the data currently in the database

```bash
    pnpm db:studio
```

## Resources

- [Next.js](https://nextjs.org/docs)
- [Planetscale](https://planetscale.com/docs)
- [DrizzleORM](https://orm.drizzle.team/docs/overview)
- [TurboRepo](https://turbo.build/repo/docs)
- [Typescript](https://www.typescriptlang.org/docs/)
