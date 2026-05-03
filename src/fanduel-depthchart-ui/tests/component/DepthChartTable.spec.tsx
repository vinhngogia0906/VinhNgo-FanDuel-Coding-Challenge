import { test, expect } from '@playwright/experimental-ct-react'
import { DepthChartTable } from '../../src/components/DepthChartTable'

test.describe('DepthChartTable', () => {
  test('shows the friendly empty state when there are no players', async ({ mount }) => {
    const component = await mount(
      <DepthChartTable chart={{}} onRemoved={() => {}} onError={() => {}} />,
    )

    await expect(component.getByText(/no players yet/i)).toBeVisible()
    await expect(component.locator('table')).toHaveCount(0)
  })

  test('renders rows in alphabetical position order with a chip per player', async ({
    mount,
  }) => {
    const chart = {
      QB: [{ number: 12, name: 'Tom Brady' }, { number: 11, name: 'Blaine Gabbert' }],
      LWR: [{ number: 13, name: 'Mike Evans' }],
      LT: [{ number: 78, name: 'Josh Wells' }],
    }

    const component = await mount(
      <DepthChartTable chart={chart} onRemoved={() => {}} onError={() => {}} />,
    )

    const rows = component.locator('tbody tr')
    await expect(rows).toHaveCount(3)
    await expect(rows.nth(0).locator('.pos')).toHaveText('LT')
    await expect(rows.nth(1).locator('.pos')).toHaveText('LWR')
    await expect(rows.nth(2).locator('.pos')).toHaveText('QB')

    // QB row has both players in source order
    const qbChips = rows.nth(2).locator('.chip')
    await expect(qbChips).toHaveCount(2)
    await expect(qbChips.nth(0)).toContainText('#12')
    await expect(qbChips.nth(0)).toContainText('Tom Brady')
    await expect(qbChips.nth(1)).toContainText('Blaine Gabbert')
  })

  test('clicking ✕ calls onRemoved with the player name on success', async ({
    mount,
    page,
  }) => {
    await page.route('**/QB/12**', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ number: 12, name: 'Tom Brady' }),
      }),
    )

    const removed: string[] = []
    const errors: string[] = []
    const chart = { QB: [{ number: 12, name: 'Tom Brady' }] }

    const component = await mount(
      <DepthChartTable
        chart={chart}
        onRemoved={n => removed.push(n)}
        onError={msg => errors.push(msg)}
      />,
    )

    await component.getByRole('button', { name: /remove tom brady from qb/i }).click()

    await expect.poll(() => removed).toEqual(['Tom Brady'])
    expect(errors).toEqual([])
  })

  test('routes API failures through onError', async ({ mount, page }) => {
    await page.route('**/QB/12**', route =>
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ title: 'Internal server error.' }),
      }),
    )

    const removed: string[] = []
    const errors: string[] = []
    const chart = { QB: [{ number: 12, name: 'Tom Brady' }] }

    const component = await mount(
      <DepthChartTable
        chart={chart}
        onRemoved={n => removed.push(n)}
        onError={msg => errors.push(msg)}
      />,
    )

    await component.getByRole('button', { name: /remove tom brady from qb/i }).click()

    await expect.poll(() => errors.length).toBeGreaterThan(0)
    expect(removed).toEqual([])
  })

  test('table caption is screen-reader-only (visually-hidden)', async ({ mount }) => {
    const chart = { QB: [{ number: 12, name: 'Tom Brady' }] }
    const component = await mount(
      <DepthChartTable chart={chart} onRemoved={() => {}} onError={() => {}} />,
    )
    // The caption exists in the DOM but is clipped off-screen — confirm the
    // class is applied. Visual-hidden elements are still queryable.
    await expect(component.locator('caption.visually-hidden')).toHaveText(
      /depth chart by position/i,
    )
  })
})
