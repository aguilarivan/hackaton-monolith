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

const demoUser: User = {
  id: randomUUID(),
  email: "demo@dayzero.app",
  passwordHash: bcrypt.hashSync("password123", 10),
  name: "Demo User",
  createdAt: Date.now(),
}
usersByEmail.set(demoUser.email, demoUser)

export async function findUserByEmail(email: string): Promise<User | undefined> {
  return usersByEmail.get(email.toLowerCase().trim())
}

export async function validatePassword(user: User, password: string): Promise<boolean> {
  return bcrypt.compare(password, user.passwordHash)
}
