import { test, expect } from '@playwright/test'

test.describe('Forms and access control', () => {
  test('validates the valuation request form before submission', async ({ page }) => {
    await page.goto('/request-valuation')

    await expect(page.getByRole('button', { name: 'Submit Request' })).toBeDisabled()
    await page.getByLabel('Email Address').fill('invalid-email')
    await page.getByLabel('Email Address').blur()

    await expect(page.getByText(/valid email/i)).toBeVisible()
  })

  test('validates internal login fields', async ({ page }) => {
    await page.goto('/login/internal')

    await page.getByRole('button', { name: 'Sign In' }).click()
    await expect(page.getByText(/Coordinator ID is required/i)).toBeVisible()
    await expect(page.getByText('Password is required.')).toBeVisible()
  })

  test('switches external login from bank to loan applicant', async ({ page }) => {
    await page.goto('/login/external')

    await expect(page.getByLabel('Branch Code')).toBeVisible()
    await page.getByLabel('Role').selectOption('Loan Applicant')
    await expect(page.getByLabel('NIC Number')).toBeVisible()
  })

  for (const route of [
    '/admin/add-role',
    '/coordinator/create-project',
    '/technical-officer/nearby',
    '/manager/check-drafts',
    '/applicant/payment',
    '/bank/report',
  ]) {
    test(`protects ${route} when no user is logged in`, async ({ page }) => {
      await page.goto(route)
      await expect(page).toHaveURL(/\/login\/internal$/)
      await expect(page.getByRole('heading', { name: /Internal Login/i })).toBeVisible()
    })
  }
})
