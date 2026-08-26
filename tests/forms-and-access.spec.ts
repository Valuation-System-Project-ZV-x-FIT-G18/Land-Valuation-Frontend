import { test, expect } from '@playwright/test'

test.describe('Forms and access control', () => {
  test('validates the public contact form before submission', async ({ page }) => {
    await page.goto('/contact')

    await expect(page.getByRole('button', { name: 'Send Message' })).toBeDisabled()
    await page.getByLabel('Email Address').fill('invalid-email')
    await page.getByLabel('Email Address').blur()

    await expect(page.getByText(/valid email/i)).toBeVisible()
  })

  test('validates the sign-in fields', async ({ page }) => {
    await page.goto('/login')

    await page.getByRole('button', { name: 'Sign In' }).click()
    await expect(page.getByText('Email address is required.')).toBeVisible()
    await expect(page.getByText('Password is required.')).toBeVisible()
  })

  // There is one sign-in page for every role. The old internal/external split
  // still has links in the wild, so both must resolve rather than 404.
  for (const legacy of ['/login/internal', '/login/external']) {
    test(`${legacy} resolves to the single sign-in page`, async ({ page }) => {
      await page.goto(legacy)
      await expect(page).toHaveURL(/\/login$/)
      await expect(page.getByRole('heading', { name: /Sign In/i })).toBeVisible()
    })
  }

  for (const route of [
    '/admin/add-role',
    '/coordinator/applicants',
    '/coordinator/valuations',
    '/technical-officer/nearby',
    '/manager/check-drafts',
    '/applicant/payment',
    '/bank/report',
  ]) {
    test(`protects ${route} when no user is logged in`, async ({ page }) => {
      await page.goto(route)
      await expect(page).toHaveURL(/\/login$/)
      await expect(page.getByRole('heading', { name: /Sign In/i })).toBeVisible()
    })
  }
})
