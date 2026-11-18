# How to Build a New Page

Follow this workflow when adding a new page or feature route to **Mānoa Notes Exchange** (Next.js App Router + React Bootstrap + Prisma).

## 1. Create a Feature Branch
Never commit directly to `main`. Create a branch tied to your GitHub issue (for example, `issue-12`):
```bash
git checkout main
git pull origin main
git checkout -b issue-<number>
