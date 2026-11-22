# How to Build a New Page

Follow this workflow when adding a new page or feature route to **Mānoa Notes Exchange** (Next.js App Router + React Bootstrap + Prisma).

## 1. Create a Feature Branch
Never commit directly to `main`. Create a branch tied to your GitHub issue (for example, `issue-12`):
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

A page that only signed-in users may open follows the same pattern as `src/app/upload/page.tsx`:
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

The `id` in that cast is only the type `loggedInProtectedPage` expects. The session doesn't actually carry the user's id, so don't read `session.user.id` anywhere (see "Who's Signed In" below).

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
On the server, `const session = await auth();` gives you `session.user.email` and `session.user.role`. There's no user id in the session. To get the signed-in user's row, look it up by email, which is unique:
```ts
const user = await prisma.user.findUnique({ where: { email: session.user.email } });
```
Never take the user's id (or "who did this") from the form. Anyone can send a form with someone else's id in it. (`changePassword` in `dbActions.ts` still takes the email from the form; #38 fixes it, so don't copy that one.)

### Saving
Put anything that creates, changes or deletes data in a `'use server'` function in `src/lib/dbActions.ts`, and call it from the form. A request can reach that function without going through your page, so the function itself must do every check. `addMaterial` in `src/lib/dbActions.ts` is the pattern to copy:
1. `await auth()`, and stop if no one is signed in
2. validate every field again on the server with the same Yup schema the form uses (`src/lib/validationSchemas.ts`)
3. look up the user by the session's email
4. check that anything the form points at (an offering, a material) really exists
5. save, then return `{ ok: true }` or `{ ok: false, message }` so the form can show the result

### New Tables or Columns
Edit `prisma/schema.prisma`, run `npx prisma migrate dev --name <short-description>` against your local database, and commit the new folder in `prisma/migrations/`. Bring the latest main into your branch right before you do, and get the migration onto Neon before you merge. The full steps, including what a `schema.prisma` merge conflict means, are in "Changing the Database" in `docs/DATABASE.md`.

### Error Messages Under Form Fields
Bootstrap shows a field's red `invalid-feedback` message only when the input right before it has `is-invalid`. Safari and other WebKit browsers (every iPhone browser too) don't redraw that rule, so the message stays invisible there, and a WebKit test that checks the message fails. Give the message `d-block` itself when there's an error, the way `FieldError` in `src/components/UploadMaterialForm.tsx` does:
```tsx
<div className={`invalid-feedback${message ? ' d-block' : ''}`}>{message}</div>
```

## 4. Add It to the Navigation
If people should reach the page from the menu, add a link in `src/components/Navbar.tsx` (and `src/components/Footer.tsx` if it belongs there). Show links to signed-in pages only when someone is signed in, the same way the existing links do.

## 5. Add a Test
Add a Playwright test in `tests/` that opens the page and checks its heading. `tests/john-pages.spec.ts` shows how to sign in as a demo user first, and `tests/upload.spec.ts` shows how to fill in a form and check both a save and a refused entry.

The tests remember sign-ins in `tests/playwright-auth-sessions/`. If sign-in behaves oddly after the sign-in page changes, clear it with `rm -rf tests/playwright-auth-sessions/*` and run the tests again.

## 6. Check Before Merging
```bash
npm run lint
npm run build
npm run playwright
```
`npm run build` matters even when lint and `npm run dev` look fine: it's what Vercel runs, and it catches errors the others miss. CI runs the tests in Chromium, Firefox and WebKit, so a test can pass in one browser and fail in another.

Then open the page on http://localhost:3000, read the diff line by line (`git diff main`), and click through what you changed.

## 7. Commit, Merge and Tell the Team
```bash
git branch --show-current
git add <the files you changed>
git commit -m "#<number> short description of the change"
git push -u origin issue-<number>
```
If your change added a migration, it must already be on Neon before this step (see "Changing the Database" in `docs/DATABASE.md`). Then merge into `main` (we use `git merge`, following Issue Driven Project Management), and close the issue with your effort filled in. If your change added a migration, post in Discord after merging so everyone runs the catching-up steps in `docs/SETUP.md`.
