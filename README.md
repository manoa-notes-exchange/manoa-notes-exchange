# Mānoa Notes Exchange

[![ci](https://github.com/manoa-notes-exchange/manoa-notes-exchange/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/manoa-notes-exchange/manoa-notes-exchange/actions/workflows/ci.yml)

**Mānoa Notes Exchange** is a course-scoped notes repository for University of Hawaiʻi at Mānoa students to upload, browse, rate, and download lecture notes organized by course, semester, and instructor.

* **Project Home Page (User Guide & Developer Guide):** https://manoa-notes-exchange.github.io/
* **Live Application:** https://manoa-notes-exchange.vercel.app/

## Developer Documentation

* **[docs/SETUP.md](docs/SETUP.md)** — Local environment setup, PostgreSQL database creation, `.env` configuration, Prisma migrations, seeding, and running the dev server.
* **[docs/BUILD-A-PAGE.md](docs/BUILD-A-PAGE.md)** — Patterns and conventions for adding new pages, components, and server actions.
* **[docs/DATABASE.md](docs/DATABASE.md)** — Prisma schema overview, models (`User`, `Course`, `Offering`, `Note`, `Rating`, `Flag`), and data access patterns.

## Quick Start

1. Install PostgreSQL and create the local database (`manoa_notes_exchange`):
   ```bash
   createdb manoa_notes_exchange
   ```
2. Clone the repository and install dependencies:
   ```bash
   git clone [https://github.com/manoa-notes-exchange/manoa-notes-exchange.git](https://github.com/manoa-notes-exchange/manoa-notes-exchange.git)
   cd manoa-notes-exchange
   npm install
   ```
3. Copy `sample.env` to `.env` and update `DATABASE_URL` and `NEXTAUTH_SECRET` (see [docs/SETUP.md](docs/SETUP.md) for details).
4. Run database migrations and seed the database:
   ```bash
   npx prisma migrate dev
   npm run seed
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```
   Open http://localhost:3000 in your browser.
   