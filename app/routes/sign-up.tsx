import { SignUp } from '@clerk/react-router';

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
      <SignUp
        appearance={{
          elements: {
            rootBox: 'mx-auto',
            card: 'shadow-xl',
            footerActionLink: 'text-blue-600 hover:text-blue-800 font-medium',
          },
        }}
        signInUrl="/sign-in"
      />
    </div>
  );
}
