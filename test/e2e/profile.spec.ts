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

    const nextPageRequest = page.waitForRequest(
      request => {
        const url = new URL(request.url())
        return url.pathname.endsWith('/-/v1/search') && url.searchParams.get('from') === '50'
      },
      { timeout: 15000 },
    )

    for (let attempt = 0; attempt < 5; attempt++) {
      await page.evaluate(() => {
        const scrollingElement = document.scrollingElement ?? document.documentElement
        scrollingElement.scrollTop = scrollingElement.scrollHeight
        window.dispatchEvent(new Event('scroll'))
      })
      await page.waitForTimeout(250)
      if (new URL(page.url()).searchParams.get('page') === '2') break
    }
    await nextPageRequest
    await expect(page).toHaveURL(/[?&]page=2(?:&|$)/)

    const scrollTop = await page.evaluate(() => window.scrollY)
    expect(scrollTop).toBeGreaterThan(0)
    await page.waitForTimeout(500)
    expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0)
  })
})
