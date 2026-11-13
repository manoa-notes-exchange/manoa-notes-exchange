import { test, expect } from './auth-utils';

test.slow();
test('can authenticate a specific user', async ({ getUserPage }) => {

  // Call the getUserPage fixture with users signin info to get authenticated session for user
  const customUserPage = await getUserPage('john@foo.com', 'changeme');

  // Navigate to the home page and wait for post-login indicator
  await customUserPage.goto('http://localhost:3000/');
  await expect(
    customUserPage.getByRole('button', { name: 'john@foo.com' })
  ).toBeVisible({ timeout: 10000 });

  // Check the shared navbar from #2. Search inside the navbar only,
  // because the footer also has a 'Manoa Notes Exchange' link.
  const navbar = customUserPage.getByRole('navigation');
  await expect(
    navbar.getByRole('link', { name: 'Manoa Notes Exchange' })
  ).toBeVisible({ timeout: 5000 });
  await expect(
    navbar.getByRole('link', { name: 'My Home' })
  ).toBeVisible({ timeout: 5000 });
  await expect(
    navbar.getByRole('link', { name: 'Search Courses' })
  ).toBeVisible({ timeout: 5000 });
  await expect(
    navbar.getByRole('link', { name: 'Upload' })
  ).toBeVisible({ timeout: 5000 });

  // A regular user should not see the Admin link
  await expect(
    navbar.getByRole('link', { name: 'Admin' })
  ).toHaveCount(0);

  // Page checks (click each link, check its heading) get added in #13 once the pages exist

});
