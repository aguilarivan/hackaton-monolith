import { randomUUID } from "node:crypto"
import bcrypt from "bcryptjs"

export interface User {
  id: string
  email: string
  passwordHash: string
  name: string
  createdAt: number
}

// Anclar el Map a globalThis para que sobreviva hot-reloads en dev mode
declare global {
  // eslint-disable-next-line no-var
  var __usersByEmail: Map<string, User> | undefined
}

const usersByEmail: Map<string, User> =
  globalThis.__usersByEmail ?? (globalThis.__usersByEmail = new Map())

// Seed demo user si no existe todavía
if (!usersByEmail.has("demo@dayzero.app")) {
  usersByEmail.set("demo@dayzero.app", {
    id: randomUUID(),
    email: "demo@dayzero.app",
    passwordHash: bcrypt.hashSync("password123", 10),
    name: "Demo User",
    createdAt: Date.now(),
  })
}

export async function findUserByEmail(email: string): Promise<User | undefined> {
  return usersByEmail.get(email.toLowerCase().trim())
}

export async function validatePassword(user: User, password: string): Promise<boolean> {
  return bcrypt.compare(password, user.passwordHash)
}
