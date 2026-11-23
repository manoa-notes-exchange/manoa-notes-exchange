# How to Build a New Page

Here's one workflow that works for adding a page or feature to **Mānoa Notes Exchange** (Next.js App Router + React Bootstrap + Prisma). Work in whatever way you're comfortable with.

## Things to Keep in Mind
Whatever way you work, a few things to keep in mind so nothing breaks for the team or the live site:
1. Each issue gets its own branch, so `main` stays working for everyone.
2. Before merging, bring the latest main into your branch and run `npm run lint`, `npm run build` and `npm run playwright`. If all three pass, the live site's build and CI will very likely pass too.
3. If your change adds a migration, it goes onto Neon before the merge (see "Changing the Database" in `docs/DATABASE.md`), so the live site finds its new tables already there.
4. When something saves or deletes data, the server checks that the person is signed in and allowed to do it. It finds out who they are from their sign-in, not from what the form sends, since a form can be faked.
5. Secrets (`.env`, passwords, `AUTH_SECRET`, database addresses) stay off GitHub, Discord and screenshots.

Go at your own pace.

## 1. Create a Feature Branch
Create a branch tied to your GitHub issue (for example, `issue-12`), so your work stays off `main` (point 1 above):
```bash
git checkout main
git pull origin main
git checkout -b issue-<number>
```
Before every edit or commit, check that you're on the right branch:
```bash
git branch --show-current
```

## 2. Create the Page
Each page is a folder under `src/app/` with a `page.tsx` file, and the folder name becomes the address. For example, `src/app/profile/page.tsx` is served at `/profile`.

A page that only signed-in users may open can follow the same pattern as `src/app/upload/page.tsx`:
```tsx
import { Container } from 'react-bootstrap';
import { auth } from '@/lib/auth';
import { loggedInProtectedPage } from '@/lib/page-protection';

/** Profile page. Only signed-in users can open it. */
const ProfilePage = async () => {
  const session = await auth();
  loggedInProtectedPage(
    session as {
      user: { email: string; id: string; name: string };
    } | null,
  );
  return (
    <main>
      <Container className="my-4">
        <h1>Profile</h1>
      </Container>
    </main>
  );
};

export default ProfilePage;
```
For an admin-only page, use `adminProtectedPage` from the same file. For a public page, leave the check out.

The `id` in that cast is only the type `loggedInProtectedPage` expects. The session doesn't actually carry the user's id, so `session.user.id` comes back empty (see "Who's Signed In" below).

## 3. Read and Save Data

Before building anything that reads or saves data, read `docs/DATABASE.md`. It shows how a page talks to the database, which tables exist (and which issue adds each planned one), and how to change them safely.

### Reading
A page can query the database directly with `import { prisma } from '@/lib/prisma';`. See `src/app/search/page.tsx` and `src/app/upload/page.tsx`.

When you include related rows, only take the columns you need. `include: { uploader: true }` returns the whole User row, **including the password hash**, and anything a page passes to a `'use client'` component is sent to the browser. Select just the email instead:
```ts
const materials = await prisma.material.findMany({
  where: { hidden: false, offering: { courseId } },
  include: {
    offering: { include: { instructor: true } },
    uploader: { select: { email: true } },
  },
  orderBy: { createdAt: 'desc' },
});
```
Leave out materials with `hidden: true` anywhere students see them; that's how a removed material stays out of sight (#34).

### Who's Signed In
On the server, `const session = await auth();` gives you `session.user.email` and `session.user.role`. There's no user id in the session. (`src/lib/authOptions.ts` puts one in, but that file is an unused template leftover; the app's sign-in runs on `src/lib/auth.ts`.) To get the signed-in user's row, look it up by email, which is unique:
```ts
const user = await prisma.user.findUnique({ where: { email: session.user.email } });
```
Take the user's id (or "who did this") from the session rather than the form (point 4 above), since anyone can send a form with someone else's id in it. (`changePassword` in `dbActions.ts` still takes the email from the form; #38 fixes it, so it isn't a good one to copy.)

### Saving
A simple place for anything that creates, changes or deletes data is a `'use server'` function in `src/lib/dbActions.ts`, called from the form. A request can reach that function without going through your page, so it works best when the function itself does every check (point 4 above). `addMaterial` in `src/lib/dbActions.ts` is a working example you can copy:
1. `await auth()`, and stop if no one is signed in
2. validate every field again on the server with the same Yup schema the form uses (`src/lib/validationSchemas.ts`)
3. look up the user by the session's email
4. check that anything the form points at (an offering, a material) really exists
5. save, then return `{ ok: true }` or `{ ok: false, message }` so the form can show the result

### New Tables or Columns
Edit `prisma/schema.prisma`, run `npx prisma migrate dev --name <short-description>` against your local database, and commit the new folder in `prisma/migrations/`. Bring the latest main into your branch right before you do, and get the migration onto Neon before you merge. The full steps, including what a `schema.prisma` merge conflict means, are in "Changing the Database" in `docs/DATABASE.md`.

### Error Messages Under Form Fields
Bootstrap shows a field's red `invalid-feedback` message only when the input right before it has `is-invalid`. Safari and other WebKit browsers (every iPhone browser too) don't redraw that rule, so the message stays invisible there, and a WebKit test that checks the message fails. One fix is to give the message `d-block` itself when there's an error, the way `FieldError` in `src/components/UploadMaterialForm.tsx` does:
```tsx
<div className={`invalid-feedback${message ? ' d-block' : ''}`}>{message}</div>
```

## 4. Add It to the Navigation
If people should reach the page from the menu, add a link in `src/components/Navbar.tsx` (and `src/components/Footer.tsx` if it belongs there). Links to signed-in pages usually show only when someone is signed in, the same way the existing links do.

## 5. Add a Test
M2 asks for a Playwright test for every page. A simple one opens the page and checks its heading. `tests/john-pages.spec.ts` shows how to sign in as a demo user first, and `tests/upload.spec.ts` shows how to fill in a form and check both a save and a refused entry.

The tests remember sign-ins in `tests/playwright-auth-sessions/`. If sign-in behaves oddly after the sign-in page changes, clear it with `rm -rf tests/playwright-auth-sessions/*` and run the tests again.

## 6. Check Before Merging
Running these three before you merge (point 2 above):
```bash
npm run lint
npm run build
npm run playwright
```
`npm run build` matters even when lint and `npm run dev` look fine: it's what Vercel runs, and it catches errors the others miss. CI runs the tests in Chromium, Firefox and WebKit, so a test can pass in one browser and fail in another.

It also helps to open the page on http://localhost:3000, read the diff line by line (`git diff main`), and click through what you changed.

## 7. Commit and Merge
For example:
```bash
git branch --show-current
git add <the files you changed>
git commit -m "#<number> short description of the change"
git push -u origin issue-<number>
```
If your change added a migration, this is when it's already on Neon (point 3 above, and "Changing the Database" in `docs/DATABASE.md`). Then merge into `main` (we use `git merge`, following Issue Driven Project Management), and close the issue with a screenshot and your effort filled in. If your change added a migration, post in Discord after merging so everyone runs the catching-up steps in `docs/SETUP.md`.
