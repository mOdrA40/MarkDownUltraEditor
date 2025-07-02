import { SignIn } from "@clerk/react-router";

export default function SignInPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
            <SignIn
                appearance={{
                    elements: {
                        rootBox: "mx-auto",
                        card: "shadow-xl"
                    }
                }}
                signUpUrl="/sign-up"
                afterSignInUrl="/"
            />
        </div>
    );
} 