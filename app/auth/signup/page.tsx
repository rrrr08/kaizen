"use client";

import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { SignupForm } from "@/components/auth/signup-form";
import { LoadingScreen } from "@/components/ui/loading-screen";

export const dynamic = 'force-dynamic';


function SignupPageContent() {
    return <SignupForm />;
}

function SignupPageFallback() {
    return <LoadingScreen message="LOADING_REGISTRATION_INTERFACE..." />;
}

export default function SignupPage() {
    return (
        <Suspense fallback={<SignupPageFallback />}>
            <SignupPageContent />
        </Suspense>
    );
}