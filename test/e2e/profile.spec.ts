import { expect, test } from './test-utils'

test.describe('User profile pagination', () => {
  test('keeps the scroll position when loading the next page', async ({ page, goto }) => {
    await goto('/~scroll-test?p=npm', { waitUntil: 'hydration' })
    await expect(page.locator('[data-result-index="0"]')).toBeVisible()

    const initialState = await page.evaluate(() => ({
      scrollHeight: document.documentElement.scrollHeight,
      innerHeight: window.innerHeight,
      cards: document.querySelectorAll('[data-result-index]').length,
    }))
    expect(initialState.scrollHeight).toBeGreaterThan(initialState.innerHeight)
    expect(initialState.cards).toBeGreaterThan(1)

    await page.locator('main').hover()
    for (let attempt = 0; attempt < 5; attempt++) {
      await page.keyboard.press('End')
      await page.waitForTimeout(250)
      if (new URL(page.url()).searchParams.get('page') === '2') break
    }
    await expect(page).toHaveURL(/[?&]page=2(?:&|$)/)

    const scrollTop = await page.evaluate(() => window.scrollY)
    expect(scrollTop).toBeGreaterThan(0)
    await page.waitForTimeout(500)
    expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0)
  })
})
