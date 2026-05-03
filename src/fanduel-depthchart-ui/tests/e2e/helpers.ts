import type { APIRequestContext } from '@playwright/test'

/**
 * The .NET engine API base URL. In CI this is the docker-compose engine
 * service published on the host. Locally it's whatever you launched
 * `dotnet run` on (or `docker compose up engine -d`).
 */
export const API_BASE =
  process.env.E2E_API_BASE ?? 'http://localhost:5113/api/sports/nfl/teams/TB/depthchart'

const TEST_NUMBERS = [1, 2, 10, 11, 12, 13, 78]
const TEST_POSITIONS = ['QB', 'LWR', 'LT', 'RT']

/**
 * The backend has no admin reset endpoint by design (the spec only defines
 * four operations). Between tests we DELETE every (position, number) we
 * might have created. 404s are silently fine because DELETE on a missing
 * player is a no-op contract per the spec.
 */
export async function resetBackend(request: APIRequestContext): Promise<void> {
  for (const pos of TEST_POSITIONS) {
    for (const n of TEST_NUMBERS) {
      await request.delete(`${API_BASE}/${pos}/${n}`).catch(() => undefined)
    }
  }
}

export type AddPayload = {
  position: string
  number: number
  name: string
  depth?: number
}

/**
 * Drive the Add player form via the UI rather than the API — exercises
 * the full UI → API → UI loop.
 */
export async function addViaUi(
  page: import('@playwright/test').Page,
  payload: AddPayload,
): Promise<void> {
  const form = page.getByRole('form', { name: /add player/i })
  await form.getByLabel('Position').fill(payload.position)
  await form.getByLabel('Jersey number').fill(String(payload.number))
  await form.getByLabel('Player name').fill(payload.name)
  if (payload.depth !== undefined) {
    await form.getByLabel('Depth (optional)').fill(String(payload.depth))
  }
  await form.getByRole('button', { name: /add player/i }).click()

  // Wait for the success toast, which only appears after a 2xx response.
  await page.getByRole('status').filter({ hasText: `Added ${payload.name}` }).first().waitFor()
}
