import NextAuth from "next-auth"
// import GoogleProvider from 'next-auth/providers/google'
import GitHub from "next-auth/providers/GitHub"
import {DrizzleAdapter} from '@auth/drizzle-adapter'
import { db } from "@/db"

export const { handlers, auth } = NextAuth({
    providers: [GitHub],
    adapter: DrizzleAdapter(db),
})