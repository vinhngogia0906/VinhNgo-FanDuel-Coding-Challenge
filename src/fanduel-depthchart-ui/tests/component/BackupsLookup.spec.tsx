import { test, expect } from '@playwright/experimental-ct-react'
import { BackupsLookup } from '../../src/components/BackupsLookup'

const chart = {
  QB: [
    { number: 12, name: 'Tom Brady' },
    { number: 11, name: 'Blaine Gabbert' },
    { number: 2, name: 'Kyle Trask' },
  ],
  LWR: [{ number: 13, name: 'Mike Evans' }],
}

test.describe('BackupsLookup', () => {
  test('renders chips for each backup when the result is non-empty', async ({
    mount,
    page,
  }) => {
    await page.route('**/QB/12/backups**', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { number: 11, name: 'Blaine Gabbert' },
          { number: 2, name: 'Kyle Trask' },
        ]),
      }),
    )

    const component = await mount(
      <BackupsLookup chart={chart} onError={() => {}} />,
    )

    await component.getByLabel('Jersey number').fill('12')
    await component.getByRole('button', { name: /lookup/i }).click()

    const items = component.locator('.backups-list li')
    await expect(items).toHaveCount(2)
    await expect(items.nth(0)).toContainText('Blaine Gabbert')
    await expect(items.nth(1)).toContainText('Kyle Trask')
  })

  test('shows "No backups for QB #2 (Kyle Trask)" when the result is empty and the player IS at the position', async ({
    mount,
    page,
  }) => {
    await page.route('**/QB/2/backups**', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      }),
    )

    const component = await mount(
      <BackupsLookup chart={chart} onError={() => {}} />,
    )

    await component.getByLabel('Jersey number').fill('2')
    await component.getByRole('button', { name: /lookup/i }).click()

    await expect(component.getByText(/no backups for qb #2 \(kyle trask\)/i)).toBeVisible()
  })

  test('omits the parenthetical name when the player is NOT at the queried position', async ({
    mount,
    page,
  }) => {
    // Mike Evans (#13) is on LWR, not QB. The empty-state copy should not
    // resolve to a name because the chart prop has no QB entry for #13.
    await page.route('**/QB/13/backups**', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      }),
    )

    const component = await mount(
      <BackupsLookup chart={chart} onError={() => {}} />,
    )

    await component.getByLabel('Jersey number').fill('13')
    await component.getByRole('button', { name: /lookup/i }).click()

    const empty = component.getByText(/no backups for qb #13/i)
    await expect(empty).toBeVisible()
    await expect(empty).not.toContainText('(')
  })

  test('uppercases the position before calling the API', async ({ mount, page }) => {
    let calledUrl: string | null = null
    await page.route('**/backups**', route => {
      calledUrl = route.request().url()
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      })
    })

    const component = await mount(
      <BackupsLookup chart={chart} onError={() => {}} />,
    )

    const positionInput = component.getByLabel('Position')
    await positionInput.fill('lwr')
    await expect(positionInput).toHaveValue('LWR')

    await component.getByLabel('Jersey number').fill('13')
    await component.getByRole('button', { name: /lookup/i }).click()

    await expect.poll(() => calledUrl).toContain('/LWR/13/backups')
  })
})
