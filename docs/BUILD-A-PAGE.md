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

## 3. Read and Save Data
- **Reading:** a page can query the database directly, for example `const courses = await prisma.course.findMany();` with `import { prisma } from '@/lib/prisma';`. See `src/app/search/page.tsx`.
- **Saving:** put anything that creates, changes or deletes data in a `'use server'` function in `src/lib/dbActions.ts`, and call it from the form. A request can reach that function without going through your page, so the function itself must check who is signed in (`await auth()`) and validate every field on the server, not only in the browser.
- **New tables or columns:** edit `prisma/schema.prisma`, then run `npx prisma migrate dev --name <short-description>` against your local database. Commit the new folder in `prisma/migrations/`.

## 4. Add It to the Navigation
If people should reach the page from the menu, add a link in `src/components/Navbar.tsx` (and `src/components/Footer.tsx` if it belongs there). Show links to signed-in pages only when someone is signed in, the same way the existing links do.

## 5. Add a Test
Add a Playwright test in `tests/` that opens the page and checks its heading. `tests/john-pages.spec.ts` shows how to sign in as a demo user first.

## 6. Check Before Merging
```bash
npm run lint
npm run build
npm run playwright
```
Then open the page on http://localhost:3000, read the diff line by line (`git diff main`), and click through what you changed.

## 7. Commit, Merge and Tell the Team
```bash
git branch --show-current
git add <the files you changed>
git commit -m "#<number> short description of the change"
git push -u origin issue-<number>
```
Then merge into `main` (we use `git merge`, following Issue Driven Project Management), and close the issue with your effort filled in. If your change added a migration or seed data, tell whoever handles the live site so it gets applied to Neon the same day.
