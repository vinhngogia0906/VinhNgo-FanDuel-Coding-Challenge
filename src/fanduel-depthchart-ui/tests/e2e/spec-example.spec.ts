import { test, expect } from '@playwright/test'
import { addViaUi, resetBackend } from './helpers'

const QB = [
  { position: 'QB', number: 12, name: 'Tom Brady', depth: 0 },
  { position: 'QB', number: 11, name: 'Blaine Gabbert', depth: 1 },
  { position: 'QB', number: 2, name: 'Kyle Trask', depth: 2 },
] as const

const LWR = [
  { position: 'LWR', number: 13, name: 'Mike Evans', depth: 0 },
  { position: 'LWR', number: 1, name: 'Jaelon Darden', depth: 1 },
  { position: 'LWR', number: 10, name: 'Scott Miller', depth: 2 },
] as const

test.describe('Spec example (canonical demo)', () => {
  test.beforeEach(async ({ request, page }) => {
    await resetBackend(request)
    await page.goto('/')
  })

  test('replays the spec sample end-to-end through the UI', async ({ page }) => {
    // Add the QB and LWR trios.
    for (const p of [...QB, ...LWR]) {
      await addViaUi(page, p)
    }

    // The chart now has two rows (LWR before QB alphabetically).
    const qbRow = page.locator('tbody tr', {
      has: page.locator('.pos', { hasText: 'QB' }),
    })
    const lwrRow = page.locator('tbody tr', {
      has: page.locator('.pos', { hasText: 'LWR' }),
    })

    await expect(qbRow.locator('.chip')).toHaveCount(3)
    await expect(qbRow.locator('.chip').nth(0)).toContainText('Tom Brady')
    await expect(qbRow.locator('.chip').nth(1)).toContainText('Blaine Gabbert')
    await expect(qbRow.locator('.chip').nth(2)).toContainText('Kyle Trask')

    await expect(lwrRow.locator('.chip')).toHaveCount(3)

    // Backups for Tom Brady (#12) — should be Gabbert + Trask.
    const lookupForm = page.getByRole('form', { name: /look up backups/i })
    await lookupForm.getByLabel('Position').fill('QB')
    await lookupForm.getByLabel('Jersey number').fill('12')
    await lookupForm.getByRole('button', { name: /lookup/i }).click()

    const result = page.locator('.backups-list')
    await expect(result.locator('li')).toHaveCount(2)
    await expect(result).toContainText('Blaine Gabbert')
    await expect(result).toContainText('Kyle Trask')
  })

  test('backups for a third-string player returns the friendly empty state', async ({
    page,
  }) => {
    for (const p of QB) {
      await addViaUi(page, p)
    }

    const lookupForm = page.getByRole('form', { name: /look up backups/i })
    await lookupForm.getByLabel('Position').fill('QB')
    await lookupForm.getByLabel('Jersey number').fill('2')
    await lookupForm.getByRole('button', { name: /lookup/i }).click()

    await expect(
      page.getByText(/no backups for qb #2 \(kyle trask\)/i),
    ).toBeVisible()
  })

  test('backups for a player NOT at the queried position returns empty', async ({
    page,
  }) => {
    // Mike Evans (#13) is on LWR. Querying QB #13 must return empty per the
    // spec's prose: "An empty list should be returned if the given player is
    // not listed in the depth chart at that position."
    for (const p of [...QB, ...LWR]) {
      await addViaUi(page, p)
    }

    const lookupForm = page.getByRole('form', { name: /look up backups/i })
    await lookupForm.getByLabel('Position').fill('QB')
    await lookupForm.getByLabel('Jersey number').fill('13')
    await lookupForm.getByRole('button', { name: /lookup/i }).click()

    const empty = page.getByText(/no backups for qb #13/i)
    await expect(empty).toBeVisible()
    await expect(empty).not.toContainText('(')
  })
})
