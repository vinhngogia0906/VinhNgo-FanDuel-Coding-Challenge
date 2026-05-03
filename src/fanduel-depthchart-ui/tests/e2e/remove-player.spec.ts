import { test, expect } from '@playwright/test'
import { addViaUi, resetBackend } from './helpers'

test.describe('Remove player', () => {
  test.beforeEach(async ({ request, page }) => {
    await resetBackend(request)
    await page.goto('/')
  })

  test('clicking ✕ removes the player and the chart compacts', async ({ page }) => {
    await addViaUi(page, { position: 'LWR', number: 13, name: 'Mike Evans', depth: 0 })
    await addViaUi(page, { position: 'LWR', number: 1, name: 'Jaelon Darden', depth: 1 })
    await addViaUi(page, { position: 'LWR', number: 10, name: 'Scott Miller', depth: 2 })

    const lwrRow = page.locator('tbody tr', {
      has: page.locator('.pos', { hasText: 'LWR' }),
    })
    await expect(lwrRow.locator('.chip')).toHaveCount(3)

    // Remove Mike Evans
    await page.getByRole('button', { name: /remove mike evans from lwr/i }).click()

    // Toast confirms; chart compacts to two chips
    await expect(page.getByRole('status').filter({ hasText: 'Removed Mike Evans' })).toBeVisible()
    await expect(lwrRow.locator('.chip')).toHaveCount(2)
    await expect(lwrRow).not.toContainText('Mike Evans')
    await expect(lwrRow.locator('.chip').nth(0)).toContainText('Jaelon Darden')
    await expect(lwrRow.locator('.chip').nth(1)).toContainText('Scott Miller')
  })

  test('removing the last player at a position drops the row entirely', async ({
    page,
  }) => {
    await addViaUi(page, { position: 'QB', number: 12, name: 'Tom Brady', depth: 0 })

    await expect(page.locator('tbody tr')).toHaveCount(1)

    await page.getByRole('button', { name: /remove tom brady from qb/i }).click()

    // Once the only player is gone, the chart returns to the empty state.
    await expect(page.getByText(/no players yet/i)).toBeVisible()
    await expect(page.locator('table')).toHaveCount(0)
  })
})
