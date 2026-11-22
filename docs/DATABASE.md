# How the Site Talks to the Database

This page explains how data moves between a page and the database, which tables exist, and how to change them safely. Read it before an issue that reads or saves data. For step-by-step page building, see `docs/BUILD-A-PAGE.md`.

## Two Databases, Same Shape
| | Local | Live |
|---|---|---|
| Where | PostgreSQL on your laptop (`manoa_notes` at `127.0.0.1:5432`) | Neon, in the cloud |
| Used by | `npm run dev` and the tests, through your `.env` | the live site on Vercel |
| Rows | test data you can rebuild with the seed | real users and uploads, never reset |

Migrations (the folders in `prisma/migrations/`) give both databases the same tables. Rows never travel between them: a material you upload locally stays on your laptop, and applying a migration to Neon only creates empty tables.

## Reading: a Page Shows Data
```
Browser ── opens /upload ──▶ src/app/upload/page.tsx  (runs on the server)
                                    │  prisma.offering.findMany(...)
                                    ▼
                              PostgreSQL (local or Neon)
                                    │  rows
                                    ▼
Browser ◀── finished page ─── page.tsx passes the rows to the form
```
A `page.tsx` without `'use client'` runs on the server, so it can use `prisma` directly. Anything it passes to a `'use client'` component is sent to the browser, so pass only what the page needs (never password hashes).

## Saving: a Form Changes Data
```
Browser: form ('use client') ── calls ──▶ server action in src/lib/dbActions.ts
                                             │ 1. auth(): who's signed in?
                                             │ 2. check every field again (Yup schema)
                                             │ 3. find the user by the session's email
                                             │ 4. check what the form points at exists
                                             ▼
                                          prisma.material.create(...) ──▶ PostgreSQL
Browser ◀── { ok: true } or { ok: false, message } ──┘
```
The browser's checks are for convenience. A request can reach a server action without the form, so the server action repeats every check. `addMaterial` in `src/lib/dbActions.ts` (#26) is the example to copy.

One upload, start to finish: the student fills in the Upload form → `addMaterial` checks sign-in, the fields and the link's host (`src/lib/allowedHosts.ts`), finds the student's User row by email, confirms the offering exists → one new row in `Material` → the form shows "Uploaded". Later, #33's course page reads that row and lists it.

## The Tables
A row can only point at a row that already exists. That's why some issues wait on others: a bookmark needs a material to point at, and a material needs an offering.

| Table | One row is | Points at | Status |
|---|---|---|---|
| `User` | an account: email, password hash, role | | live (template). #35 adds the `INSTRUCTOR` role |
| `Course` | a UH course, like ICS 314 | | live (M1) |
| `Instructor` | a person who teaches | a `User`, once #35 links accounts | live (#25) |
| `Offering` | one course in one semester with one instructor | `Course`, `Instructor` | live (#25) |
| `Material` | one shared link, with a `hidden` flag | `Offering`, `User` (the uploader) | live (#26). #35 adds an outdated note |
| `SavedCourse` | a student saved a course | `User`, `Course` | planned (#27) |
| `Rating` | a student's 1 to 5 score | `User`, and a `Course` or an `Instructor` | planned (#32) |
| `Report` | a student reported a material, with a reason and a status | `Material`, `User` | planned (#34) |
| `Bookmark` | a student bookmarked a material | `User`, `Material` | planned (#36) |

```
Course ◀── Offering ──▶ Instructor
              ▲
           Material ──▶ User (uploader)
            ▲      ▲
       Report    Bookmark          SavedCourse ──▶ Course
                                   Rating ──▶ Course or Instructor
       (each of these also points at the User who made it)
```
The issue that adds a planned table decides its exact columns; the table above is the plan from the M2 issues.

## Things That Trip People Up
- **There's no `session.user.id`.** The session has the user's email and role only. Find the User row with `prisma.user.findUnique({ where: { email: session.user.email } })`. (`changePassword` in `dbActions.ts` still takes the email from the form; #38 fixes it, so don't copy that one.)
- **Semesters and instructors come from `Offering`.** Course's old `instructor` and `semester` lists are from M1, unused now, and will be dropped in M3.
- **Students never see hidden materials.** Add `hidden: false` when listing materials (#34's Remove sets it).
- **Only select what you need from `User`.** `include: { uploader: true }` brings the password hash along; use `uploader: { select: { email: true } }`.

## Changing the Database
1. Right before you create a migration, bring the latest main into your branch (`git checkout main`, `git pull`, `git checkout issue-NN`, `git merge main`), so yours comes after everyone else's.
2. Edit `prisma/schema.prisma`, then run `npx prisma migrate dev --name <short-description>`. Check the "Datasource" line says your local database. Commit the new folder in `prisma/migrations/`.
3. If `git merge main` shows a conflict in `schema.prisma`, it's usually two new lines in the same model (for example two new lists on `User`). Keep both, then run `npx prisma migrate dev` and `npx prisma generate`. If you're not sure, ask first.
4. If Prisma ever offers to reset your database, answer **N** and ask in Discord. A reset erases your local data, and the prompt usually means something else needs fixing first.
5. Before you merge into main, tell whoever handles the live site. They apply your migration to Neon first, so the new code finds its tables already there. Once it's on Neon, don't edit that migration file; changes go in a new one.
6. After merging, post in Discord so everyone runs the catching-up steps in `docs/SETUP.md`.

Never run `migrate dev`, `db seed`, Prisma Studio or the tests against Neon.
