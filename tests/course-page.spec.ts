import { test, expect } from '@playwright/test';

/**
 * Course page tests (#32).
 * Course pages are open to everyone, so these run signed out.
 */
test.slow();

test('View materials on Search opens that course\'s own page', async ({ page }) => {
  await page.goto('http://localhost:3000/search');

  // Find the ICS 314 card (from the seed) and click its View materials button.
  const card = page.locator('.card', {
    has: page.getByRole('heading', { name: 'ICS 314', exact: true }),
  });
  await card.getByText('View materials').click();

  // It lands on /courses/<id>, not the old sample page at /courses.
  await expect(page).toHaveURL(/\/courses\/\d+$/, { timeout: 10000 });
  await expect(
    page.getByRole('heading', { name: 'ICS 314: Software Engineering I' }),
  ).toBeVisible();

  // Either real materials or the "No materials yet" invitation, never a blank page.
  await expect(
    page.getByTestId('material-card').or(page.getByText(/No materials yet/)).first(),
  ).toBeVisible();
});

test('a course id that does not exist shows the not-found page', async ({ page }) => {
  await page.goto('http://localhost:3000/courses/999999');
  await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
});

test('plain /courses sends visitors to Search', async ({ page }) => {
  await page.goto('http://localhost:3000/courses');
  await expect(page).toHaveURL(/\/search/, { timeout: 10000 });
});
