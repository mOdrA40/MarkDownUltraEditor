import { SignUp } from "@clerk/react-router";

export default function SignUpPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
            <SignUp
                appearance={{
                    elements: {
                        rootBox: "mx-auto",
                        card: "shadow-xl"
                    }
                }}
                signInUrl="/sign-in"
                afterSignUpUrl="/"
            />
        </div>
    );
} 