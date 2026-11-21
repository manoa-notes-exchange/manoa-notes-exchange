import { test, expect } from './auth-utils';

/**
 * Upload page tests (#26).
 * One upload that should save, and one bad link that the form should refuse.
 * Both sign in as john, a regular user from the seed data.
 */
test.slow();

test('john can upload a material with an allowed link', async ({ getUserPage }) => {
  const page = await getUserPage('john@foo.com', 'changeme');
  await page.goto('http://localhost:3000/upload');

  await page.getByLabel('Title').fill('Playwright test notes');
  // The three menus narrow each other (#26), so they're picked in order.
  await page.getByLabel('Course').selectOption('ICS 314');
  await page.getByLabel('Semester').selectOption('Fall 2026');
  await page.getByLabel('Instructor').selectOption({ label: 'Instructor A' });
  await page.getByLabel('Type').selectOption('Study guide');
  await page.getByLabel('Link').fill('https://docs.google.com/document/d/playwright-test/edit');
  await page.getByLabel(/my own work/).check();
  await page.getByRole('button', { name: 'Submit' }).click();

  // addMaterial saved it, so the green popup shows.
  await expect(page.getByText('Your material has been saved.')).toBeVisible({ timeout: 10000 });
});

test('the upload form refuses a link from a site that is not allowed', async ({ getUserPage }) => {
  const page = await getUserPage('john@foo.com', 'changeme');
  await page.goto('http://localhost:3000/upload');

  await page.getByLabel('Title').fill('Should not save');
  await page.getByLabel('Course').selectOption('ICS 311');
  await page.getByLabel('Semester').selectOption('Fall 2026');
  await page.getByLabel('Instructor').selectOption({ label: 'Instructor C' });
  // Looks like Google Drive, but the real host is malicious.example (#26 allowed hosts).
  await page.getByLabel('Link').fill('https://drive.google.com.malicious.example/file/d/abc123');
  await page.getByLabel(/my own work/).check();
  await page.getByRole('button', { name: 'Submit' }).click();

  // The form stops it in the browser: the message shows and nothing is saved.
  await expect(
    page.getByText('Links must be from Google Drive, Google Docs or Slides, or GitHub'),
  ).toBeVisible({ timeout: 5000 });
  await expect(page.getByText('Your material has been saved.')).toHaveCount(0);
});
