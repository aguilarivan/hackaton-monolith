import { randomUUID } from "node:crypto"
import bcrypt from "bcryptjs"

export interface User {
  id: string
  email: string
  passwordHash: string
  name: string
  createdAt: number
}

// In-memory store — resets on every server restart (consistent with flow-store.ts)
const usersByEmail = new Map<string, User>()

async function seedDemoUser() {
  const hash = await bcrypt.hash("password123", 10)
  const user: User = {
    id: randomUUID(),
    email: "demo@dayzero.app",
    passwordHash: hash,
    name: "Demo User",
    createdAt: Date.now(),
  }
  usersByEmail.set(user.email, user)
}

seedDemoUser()

export async function findUserByEmail(email: string): Promise<User | undefined> {
  return usersByEmail.get(email.toLowerCase().trim())
}

export async function validatePassword(user: User, password: string): Promise<boolean> {
  return bcrypt.compare(password, user.passwordHash)
}
