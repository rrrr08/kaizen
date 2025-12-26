"use client";

import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { LoadingScreen } from "@/components/ui/loading-screen";

export const dynamic = 'force-dynamic';

function LoginPageContent() {
    return <LoginForm />;
}

function LoginPageFallback() {
    return <LoadingScreen message="LOADING_LOGIN_INTERFACE..." />;
}

export default function LoginPage() {
    return (
        <Suspense fallback={<LoginPageFallback />}>
            <LoginPageContent />
        </Suspense>
    );
}