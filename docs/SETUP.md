# Developer Setup Guide — Mānoa Notes Exchange

This guide walks through setting up the **Mānoa Notes Exchange** repository locally for development and testing.

## Prerequisites
- **Node.js** (v20 or later recommended) and **npm**
- **Git** (or GitHub Desktop)
- **PostgreSQL** (running locally) or a configured `DATABASE_URL` in `.env`

## 1. Clone the Repository
```bash
git clone https://github.com/manoa-notes-exchange/manoa-notes-exchange.git
cd manoa-notes-exchange
```

## 2. Install Dependencies
```bash
npm install
```

## 3. Create a Local Database
Start PostgreSQL, then create an empty database for the app. On WSL Ubuntu:
```bash
sudo service postgresql start
createdb manoa_notes
```
If `createdb` asks for a role that doesn't exist, create the database from `psql` instead with `CREATE DATABASE manoa_notes;`.

## 4. Create Your `.env` File
Copy the sample file, then edit the copy:
```bash
cp sample.env .env
```
In `.env`:
- Set `DATABASE_URL` to your **local** database, for example `postgresql://<your-user>:<your-password>@127.0.0.1:5432/manoa_notes?sslmode=disable`. If your password has special characters, URL-encode them.
- Replace `AUTH_SECRET` with your own value. The one in `sample.env` is public, so never use it anywhere real. Generate one with:
  ```bash
  openssl rand -base64 32
  ```

`.env` is in `.gitignore`, so it never gets committed. Never paste its contents into a chat, an issue or a screenshot, and never put the live site's database address in it.

If you ever exported `DATABASE_URL` in your terminal for another project, clear it first. A variable set in the shell overrides `.env`, so Prisma could otherwise talk to the wrong database:
```bash
unset DATABASE_URL
```

## 5. Create the Tables
```bash
npx prisma migrate dev
npx prisma generate
```
`migrate dev` builds the tables from the files in `prisma/migrations/`. Check that the "Datasource" line Prisma prints names your local database. Only ever run `migrate dev` against your own local database: it can offer to reset (erase) the database, so answer **N** if it ever asks.

## 6. Add the Starter Data
```bash
npm run seed
```
This adds the demo accounts and sample courses listed in `config/settings.development.json`.

## 7. Run the App
```bash
npm run dev
```
Open http://localhost:3000 and sign in with one of the demo accounts from `config/settings.development.json`. Those passwords are public and only for your local copy.

## 8. Check Your Work Before Merging
```bash
npm run lint
npm run build
npm run playwright
```
The first time you run the tests, install the test browsers with `npx playwright install`. Then click through the pages you changed on http://localhost:3000.

## The Live Site
The live site runs on Vercel with its own database on Neon. Vercel redeploys automatically when `main` changes. Database changes (new migrations or seed data) are applied to Neon separately by whoever handles the live site, so tell them when your merge adds a migration. Never run `migrate dev`, `db seed` or the tests against Neon.
