// app/providers.tsx
'use client';

import { SessionProvider } from "next-auth/react";
import { AuthProvider } from "../context/AuthContext";
import { ReactNode } from "react";
import { KitProvider } from "@/context/kitContext";

export function Providers({ children }: { children: ReactNode }) {
    return (
        <SessionProvider>
            <AuthProvider>
                <KitProvider>
                    {children}
                </KitProvider>
            </AuthProvider>
        </SessionProvider>
    );
}