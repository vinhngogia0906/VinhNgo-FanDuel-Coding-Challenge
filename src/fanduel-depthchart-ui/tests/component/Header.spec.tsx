import { test, expect } from '@playwright/experimental-ct-react'
import { Header } from '../../src/components/Header'

test.describe('Header', () => {
  test('renders the page title and the team / sport meta', async ({ mount }) => {
    const component = await mount(<Header team="TB" sport="NFL" />)

    await expect(component.getByRole('heading', { level: 1 })).toHaveText(
      'FanDuel Depth Chart',
    )
    await expect(component.getByText('TB / NFL')).toBeVisible()
  })

  test('exposes the team/sport pair as an accessible label for screen readers', async ({
    mount,
  }) => {
    const component = await mount(<Header team="TB" sport="NFL" />)
    await expect(component.getByLabel(/team tb, sport nfl/i)).toBeVisible()
  })
})
