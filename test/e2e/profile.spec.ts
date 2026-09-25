import { expect, test } from './test-utils'

test.describe('User profile pagination', () => {
  test('keeps the scroll position when loading the next page', async ({ page, goto }) => {
    await goto('/~scroll-test?p=npm', { waitUntil: 'hydration' })
    await expect(page.locator('[data-result-index="0"]')).toBeVisible()

    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
    await expect(page).toHaveURL(/[?&]page=2(?:&|$)/)

    const scrollTop = await page.evaluate(() => window.scrollY)
    expect(scrollTop).toBeGreaterThan(0)
    await page.waitForTimeout(500)
    expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0)
  })
})
