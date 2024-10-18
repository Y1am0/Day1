import NextAuth from "next-auth"
import GoogleProvider from 'next-auth/providers/google'
import GitHubProvider from "next-auth/providers/GitHub"
import {DrizzleAdapter} from '@auth/drizzle-adapter'
import { db } from "@/db"

export const { handlers, auth } = NextAuth({
    providers: [GitHubProvider, GoogleProvider],
    adapter: DrizzleAdapter(db),
    session: {strategy: "jwt"},
    callbacks: {
        async session({token, session}) {
            if (token.sub && session.user) {
                session.user.id = token.sub
            }

            return session;
        }
    }
})