import { test, expect } from '@playwright/test'
import { addViaUi, resetBackend } from './helpers'

test.describe('Multi-position support (spec calls out Josh Wells)', () => {
  test.beforeEach(async ({ request, page }) => {
    await resetBackend(request)
    await page.goto('/')
  })

  test('the same jersey number can appear at LT and RT simultaneously', async ({
    page,
  }) => {
    await addViaUi(page, { position: 'LT', number: 78, name: 'Josh Wells', depth: 1 })
    await addViaUi(page, { position: 'RT', number: 78, name: 'Josh Wells', depth: 1 })

    const ltRow = page.locator('tbody tr', {
      has: page.locator('.pos', { hasText: /^LT$/ }),
    })
    const rtRow = page.locator('tbody tr', {
      has: page.locator('.pos', { hasText: /^RT$/ }),
    })

    await expect(ltRow.locator('.chip')).toContainText('Josh Wells')
    await expect(rtRow.locator('.chip')).toContainText('Josh Wells')

    // Both chips have the #78 jersey label
    await expect(ltRow.locator('.chip__num')).toHaveText('#78')
    await expect(rtRow.locator('.chip__num')).toHaveText('#78')
  })
})
