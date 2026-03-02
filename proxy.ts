import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Declare custom metadata type for Clerk
interface CustomJwtPayload {
    metadata?: {
        role?: string;
    }
}

const isProtectedRoute = createRouteMatcher([
    "/dashboard(.*)",
    "/admin(.*)",
]);

const isAdminRoute = createRouteMatcher([
    "/admin(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
    const { userId, sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as any)?.role;

    // Removed aggressive Post-login Redirect logic for Superadmins to allow Impersonation of /dashboard.

    if (isProtectedRoute(req)) {
        // Basic protection (signed in)
        if (!userId) {
            return (await auth()).redirectToSignIn();
        }

        // Admin protection
        if (isAdminRoute(req)) {
            if (role !== 'super_admin') {
                return NextResponse.redirect(new URL('/dashboard', req.url));
            }
        }
    }
});

export const config = {
    matcher: [
        "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
        "/(api|trpc)(.*)",
    ],
};
