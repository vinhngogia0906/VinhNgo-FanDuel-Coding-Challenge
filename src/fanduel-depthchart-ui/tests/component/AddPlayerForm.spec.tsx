import { test, expect } from '@playwright/experimental-ct-react'
import { AddPlayerForm } from '../../src/components/AddPlayerForm'

test.describe('AddPlayerForm', () => {
  test('submits the canonical Tom Brady payload, calls onAdded, clears the form', async ({
    mount,
    page,
  }) => {
    let receivedBody: Record<string, unknown> | null = null
    await page.route('**/depthchart/**', route => {
      receivedBody = route.request().postDataJSON()
      return route.fulfill({ status: 204 })
    })

    const added: string[] = []
    const errors: string[] = []
    const component = await mount(
      <AddPlayerForm
        onAdded={name => added.push(name)}
        onError={msg => errors.push(msg)}
      />,
    )

    await component.getByLabel('Jersey number').fill('12')
    await component.getByLabel('Player name').fill('Tom Brady')
    await component.getByLabel('Depth (optional)').fill('0')
    await component.getByRole('button', { name: /add player/i }).click()

    await expect.poll(() => added).toEqual(['Tom Brady'])
    expect(errors).toEqual([])
    expect(receivedBody).toMatchObject({
      position: 'QB',
      number: 12,
      name: 'Tom Brady',
      depth: 0,
    })

    // Form clears after successful add — Position resets to default 'QB',
    // other fields go blank.
    await expect(component.getByLabel('Player name')).toHaveValue('')
    await expect(component.getByLabel('Jersey number')).toHaveValue('')
    await expect(component.getByLabel('Position')).toHaveValue('QB')
  })

  test('uppercases the position before submitting (lwr -> LWR)', async ({ mount, page }) => {
    let receivedPosition: unknown = null
    await page.route('**/depthchart/**', route => {
      receivedPosition = route.request().postDataJSON()?.position
      return route.fulfill({ status: 204 })
    })

    const component = await mount(
      <AddPlayerForm onAdded={() => {}} onError={() => {}} />,
    )

    // Replace the default 'QB' with lowercase 'lwr' — visible input should
    // show 'LWR' immediately because of the onChange uppercase rule.
    const positionInput = component.getByLabel('Position')
    await positionInput.fill('lwr')
    await expect(positionInput).toHaveValue('LWR')

    await component.getByLabel('Jersey number').fill('13')
    await component.getByLabel('Player name').fill('Mike Evans')
    await component.getByRole('button', { name: /add player/i }).click()

    await expect.poll(() => receivedPosition).toBe('LWR')
  })

  test('surfaces FluentValidation field errors via onError', async ({ mount, page }) => {
    await page.route('**/depthchart/**', route =>
      route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          title: 'One or more validation errors occurred.',
          errors: {
            'Request.Number': ['Jersey number must be between 0 and 99.'],
          },
        }),
      }),
    )

    const errors: string[] = []
    const component = await mount(
      <AddPlayerForm
        onAdded={() => errors.push('UNEXPECTED_ON_ADDED')}
        onError={msg => errors.push(msg)}
      />,
    )

    // Bypass the HTML max=99 by triggering submit via keyboard after a value
    // the input control accepts. Fill name first so we hit server validation.
    await component.getByLabel('Jersey number').fill('99')
    await component.getByLabel('Player name').fill('X')
    await component.getByRole('button', { name: /add player/i }).click()

    await expect
      .poll(() => errors.find(e => e.includes('Jersey number must be between 0 and 99')))
      .toBeTruthy()
  })

  test('blocks submission and reports a friendly error when name is whitespace-only', async ({
    mount,
    page,
  }) => {
    let networkHits = 0
    await page.route('**/depthchart/**', route => {
      networkHits++
      return route.fulfill({ status: 204 })
    })

    const errors: string[] = []
    const component = await mount(
      <AddPlayerForm
        onAdded={() => errors.push('UNEXPECTED_ON_ADDED')}
        onError={msg => errors.push(msg)}
      />,
    )

    // Fill name with spaces only (HTML required attribute is satisfied by the
    // string of spaces — our component must trim and reject before the API).
    await component.getByLabel('Jersey number').fill('12')
    await component.getByLabel('Player name').fill('   ')
    await component.getByRole('button', { name: /add player/i }).click()

    await expect.poll(() => errors).toEqual(['Name is required.'])
    expect(networkHits).toBe(0)
  })
})
