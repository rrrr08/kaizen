
import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth } from "@/app/api/auth/firebase-admin";
import { sendEmail } from "@/lib/email-service";
import { getPasswordResetTemplate } from "@/lib/email-templates";

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        const auth = getAdminAuth();

        // 1. Check if user exists
        let user;
        try {
            user = await auth.getUserByEmail(email);
        } catch (error: any) {
            if (error.code === 'auth/user-not-found') {
                // Return success even if user not found for security (obscurity)
                // But we'll log it for our own debugging
                console.log(`Reset requested for non-existent email: ${email}`);
                return NextResponse.json({ success: true });
            }
            throw error;
        }

        // 2. Generate secure reset link
        const actionCodeSettings = {
            url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/login`,
            handleCodeInApp: false,
        };

        const resetLink = await auth.generatePasswordResetLink(email, actionCodeSettings);

        // 3. Send email via internal SMTP
        const emailResult = await sendEmail({
            to: email,
            subject: "Reset Your Joy Juncture Password",
            html: getPasswordResetTemplate(user.displayName || user.email?.split('@')[0] || 'Explorer', resetLink),
        });

        if (!emailResult.success) {
            throw new Error(`Email transmission failed: ${emailResult.error}`);
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Custom reset password error:", error);
        return NextResponse.json(
            { error: error.message || "An internal error occurred during reset protocol" },
            { status: 500 }
        );
    }
}
