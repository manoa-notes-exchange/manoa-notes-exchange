import { test, expect } from './auth-utils';

test.slow();
test('test access to admin page', async ({ getUserPage }) => {
  // Call the getUserPage fixture with admin signin info to get authenticated session for admin
  const adminPage = await getUserPage('admin@foo.com', 'changeme');

  // Navigate to the home page and wait for post-login indicator
  await adminPage.goto('http://localhost:3000/');
  await expect(
    adminPage.getByRole('button', { name: 'admin@foo.com' }),
  ).toBeVisible({ timeout: 10000 });

  // Check for Admin link in navigation
  await expect(
    adminPage.getByRole('link', { name: 'Admin' }),
  ).toBeVisible({ timeout: 5000 });

  // Test Admin adminPage
  await adminPage.getByRole('link', { name: 'Admin' }).click();
  await expect(
    adminPage.getByRole('heading', { name: 'Admin', exact: true }),
  ).toBeVisible({ timeout: 5000 });
  await expect(
    adminPage.getByText('Add a semester offering'),
  ).toBeVisible({ timeout: 5000 });
});

test('admin can add a semester offering and sees duplicate warning', async ({ getUserPage }) => {
  const adminPage = await getUserPage('admin@foo.com', 'changeme');
  const uniqueInstructor = `Test Instructor ${Date.now()}`;

  await adminPage.goto('http://localhost:3000/admin');
  await expect(
    adminPage.getByText('Add a semester offering'),
  ).toBeVisible({ timeout: 10000 });

  // Add a new instructor inline and create a new offering
  await adminPage.getByLabel('Instructor', { exact: true }).selectOption('__new__');
  await adminPage.getByLabel('New instructor name').fill(uniqueInstructor);
  await adminPage.getByLabel('Semester').selectOption('Fall');
  await adminPage.getByLabel('Year').fill('2028');
  await adminPage.getByRole('button', { name: 'Add offering' }).click();

  await expect(
    adminPage.getByText('Added offering for Fall 2028.'),
  ).toBeVisible({ timeout: 10000 });

  // Re-select the newly created instructor and attempt a duplicate submission
  await adminPage.getByLabel('Instructor', { exact: true }).selectOption({ label: uniqueInstructor });
  await adminPage.getByRole('button', { name: 'Add offering' }).click();

  await expect(
    adminPage.getByText(/already exists\./),
  ).toBeVisible({ timeout: 10000 });
});
