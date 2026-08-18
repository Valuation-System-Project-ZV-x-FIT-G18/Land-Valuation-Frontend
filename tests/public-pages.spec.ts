import { test, expect } from '@playwright/test'

test.describe('Public website', () => {
  test('shows the home page and public navigation', async ({ page }) => {
    await page.goto('/')

    await expect(page).toHaveTitle(/Land Valuation/i)
    await expect(page.getByRole('link', { name: 'CODEHUB home' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'About' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Services' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Contact' })).toBeVisible()
  })

  for (const route of [
    ['/about', /About CODEHUB/i],
    ['/services', /Our Services/i],
    ['/contact', /Contact Us/i],
    ['/request-valuation', /Request a Land Valuation/i],
  ] as const) {
    test(`loads ${route[0]}`, async ({ page }) => {
      await page.goto(route[0])
      await expect(page.getByRole('heading', { name: route[1] })).toBeVisible()
    })
  }

  test('lists all core services', async ({ page }) => {
    await page.goto('/services')

    for (const service of [
      'Land Valuation',
      'Site Inspection',
      'Site Photography',
      'GPS & Mapping',
      'AI Report Drafting',
      'Bank-Ready Reports',
    ]) {
      await expect(page.getByRole('heading', { name: service })).toBeVisible()
    }
  })
})
