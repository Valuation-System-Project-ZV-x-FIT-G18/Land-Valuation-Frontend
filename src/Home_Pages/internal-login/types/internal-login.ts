// Types for the internal login page.

// The user info the backend returns after a successful login.
export type LoggedInUser = {
  userId: string
  name: string
  role: string
}
