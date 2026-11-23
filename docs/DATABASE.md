# How the Site Talks to the Database

This page explains how data moves between a page and the database, which tables exist, and how to change them safely. It's worth reading before an issue that reads or saves data. For a step-by-step way to build a page, see `docs/BUILD-A-PAGE.md`, which also lists a few things to keep in mind.

## Two Databases, Same Shape
| | Local | Live |
|---|---|---|
| Where | PostgreSQL on your laptop (`manoa_notes` at `127.0.0.1:5432`, or `localhost:5432`, which is the same place) | Neon, in the cloud (its address contains `neon.tech`) |
| Used by | `npm run dev` and the tests, through your `.env` | the live site on Vercel |
| Rows | test data you can rebuild with the seed | real users and uploads, so it's never reset |

Migrations (the folders in `prisma/migrations/`) give both databases the same tables. Rows never travel between them: a material you upload locally stays on your laptop, and applying a migration to Neon only creates empty tables.

## Where Things Live
| What | Where |
|---|---|
| The tables and their columns | `prisma/schema.prisma` |
| Every change to the tables, in order | `prisma/migrations/` |
| Sample data (demo accounts, courses, offerings) | `config/settings.development.json`, loaded by `prisma/seed.ts` when you run `npm run seed` |
| The database connection | `src/lib/prisma.ts`, which uses `DATABASE_URL` from your `.env` |
| Who's signed in | `src/lib/auth.ts` (`src/lib/authOptions.ts` is an unused file left from the class template) |
| Actions that save or delete | `src/lib/dbActions.ts` |
| Form rules, checked in the browser and again on the server | `src/lib/validationSchemas.ts` |
| Pages that read data | `page.tsx` files under `src/app/` |

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
A `page.tsx` without `'use client'` runs on the server, so it can use `prisma` directly. Anything it passes to a `'use client'` component is sent to the browser, so pass only what the page needs (password hashes stay on the server).

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
The browser's checks are for convenience. A request can reach a server action without the form, so the server action repeats every check. `addMaterial` in `src/lib/dbActions.ts` (#26) is a working example you can copy.

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

### What the Rows Look Like
A row doesn't store another row's name, only its id number. On a freshly seeded laptop the ids come out like this (yours can differ):

| `Course` | | `Instructor` | |
|---|---|---|---|
| id 1 | ICS 314 | id 1 | Instructor A |
| id 2 | ICS 311 | id 2 | Instructor B |
| | | id 3 | Instructor C |

| `Offering` id | `courseId` | `instructorId` | `semester` | Reads as |
|---|---|---|---|---|
| 1 | 1 | 1 | Fall 2026 | ICS 314, Fall 2026, Instructor A |
| 2 | 1 | 2 | Fall 2026 | ICS 314, Fall 2026, Instructor B |
| 3 | 1 | 1 | Spring 2027 | ICS 314, Spring 2027, Instructor A |
| 4 | 2 | 3 | Fall 2026 | ICS 311, Fall 2026, Instructor C |

When john@foo.com (User id 2) uploads notes for ICS 314, Fall 2026, Instructor A, the new `Material` row stores `offeringId: 1` and `uploaderId: 2`, plus its own title, type, link and `hidden: false`. A page that lists it follows the numbers back with `include` to show "ICS 314", "Instructor A" and the uploader's email. That's all "points at" means.

### Which Issue Reads and Writes What
| Issue | Reads | Writes |
|---|---|---|
| #26 Upload (done) | Course, Offering, Instructor | Material |
| #27 Save courses | Course, SavedCourse | SavedCourse |
| #31 Admin offerings | Course, Instructor | Offering, Instructor |
| #32 Ratings | Course, Instructor, Rating | Rating |
| #33 Course pages | Course, Offering, Instructor, Material (not hidden) | nothing |
| #34 Reports | Material, Report | Report, Material's `hidden` flag |
| #35 Instructor accounts | User, Instructor, Material, Report | User's role, Instructor's `userId`, Material's outdated note and `hidden` flag, Report |
| #36 Bookmarks | Material, Bookmark | Bookmark |
| #38 Demo logins and data safety | User | User (passwords) |

#10, #13, #28, #37 and #39 don't touch the database in M2. Every "Writes" goes through a server action in `src/lib/dbActions.ts`.

## Things That Trip People Up
- **There's no `session.user.id`.** The session has the user's email and role only (`src/lib/authOptions.ts` does add an id, but that file is an unused template leftover; the app uses `src/lib/auth.ts`). Find the User row with `prisma.user.findUnique({ where: { email: session.user.email } })`. (`changePassword` in `dbActions.ts` still takes the email from the form; #38 fixes it, so it isn't a good one to copy.)
- **Semesters and instructors come from `Offering`.** Course's old `instructor` and `semester` lists are from M1, unused now, and will be dropped in M3.
- **Hidden materials stay out of student views.** Adding `hidden: false` when listing materials keeps them out (#34's Remove sets it).
- **Only select what you need from `User`.** `include: { uploader: true }` brings the password hash along; use `uploader: { select: { email: true } }`.

## Changing the Database
1. Right before you create a migration, bring the latest main into your branch (`git checkout main`, `git pull`, `git checkout issue-NN`, `git merge main`), so yours comes after everyone else's.
2. Edit `prisma/schema.prisma`, then run `npx prisma migrate dev --name <short-description>`. Check the "Datasource" line says your local database. Commit the new folder in `prisma/migrations/`.
3. If `git merge main` shows a conflict in `schema.prisma`, it's usually two new lines in the same model (for example two new lists on `User`). Keep both, then run `npx prisma migrate dev` and `npx prisma generate`. If you're not sure, ask first.
4. If Prisma ever offers to reset your database, answer **N** and ask in Discord. A reset erases your local data, and the prompt usually means something else needs fixing first.
5. Before you merge into main, tell whoever handles the live site. They apply your migration to Neon first, so the new code finds its tables already there. Once it's on Neon, that migration file stays as it is; later changes go in a new one.
6. After merging, post in Discord so everyone runs the catching-up steps in `docs/SETUP.md`.

`migrate dev`, `db seed`, Prisma Studio and the tests are for your local database only. On Neon, the live-site step uses `migrate deploy`, which only adds new migrations.
