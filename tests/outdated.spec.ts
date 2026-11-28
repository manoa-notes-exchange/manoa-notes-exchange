import { test, expect } from './auth-utils';

/**
 * Mark outdated tests (#38).
 * instructor@foo.com is Instructor A (from the seed), so it may mark materials in
 * Instructor A's offerings. john is a regular student and never sees the button.
 */
test.slow();

test('an instructor marks their own material outdated, then clears it', async ({ getUserPage }, testInfo) => {
  const page = await getUserPage('instructor@foo.com', 'changeme');

  // Upload a material of our own to an Instructor A offering, so this test needs no other test's data.
  const title = `Outdated check ${testInfo.project.name} ${Date.now()}`;
  await page.goto('http://localhost:3000/upload');
  await page.getByLabel('Title').fill(title);
  await page.getByLabel('Course').selectOption('ICS 314');
  await page.getByLabel('Semester').selectOption('Fall 2026');
  await page.getByLabel('Instructor').selectOption({ label: 'Instructor A' });
  await page.getByLabel('Type').selectOption('Notes');
  await page.getByLabel('Link').fill('https://docs.google.com/document/d/outdated-check/edit');
  await page.getByLabel(/my own work/).check();
  await page.getByRole('button', { name: 'Submit' }).click();
  await expect(page.getByText('Your material has been saved.')).toBeVisible({ timeout: 10000 });

  // Open ICS 314's page from Search and find that material's card.
  await page.goto('http://localhost:3000/search');
  await page.locator('.card', { has: page.getByRole('heading', { name: 'ICS 314', exact: true }) })
    .getByText('View materials').click();
  const card = page.getByTestId('material-card').filter({ hasText: title });
  await expect(card).toBeVisible({ timeout: 10000 });

  // Mark it outdated with a reason. Save stays disabled until there is one.
  await card.getByRole('button', { name: 'Mark outdated' }).click();
  await expect(card.getByRole('button', { name: 'Save note' })).toBeDisabled();
  await card.getByLabel('Why is this outdated?').fill('The midterm format changed this year.');
  await card.getByRole('button', { name: 'Save note' }).click();
  await expect(card.getByText('The midterm format changed this year.')).toBeVisible({ timeout: 10000 });

  // Clear it again.
  await card.getByRole('button', { name: 'Clear outdated' }).click();
  await expect(card.getByText('The midterm format changed this year.')).toHaveCount(0, { timeout: 10000 });
});

test('a student sees no Mark outdated buttons, and My Home loads', async ({ getUserPage }) => {
  const page = await getUserPage('john@foo.com', 'changeme');

  await page.goto('http://localhost:3000/search');
  await page.locator('.card', { has: page.getByRole('heading', { name: 'ICS 314', exact: true }) })
    .getByText('View materials').click();
  await expect(page.getByRole('heading', { name: 'ICS 314: Software Engineering I' })).toBeVisible({ timeout: 10000 });
  await expect(page.getByRole('button', { name: 'Mark outdated' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Clear outdated' })).toHaveCount(0);

  // My Home's real "New in your saved courses" panel (#38).
  await page.goto('http://localhost:3000/home');
  await expect(page.getByText('New in your saved courses')).toBeVisible({ timeout: 10000 });
});
