import { SignUp } from "@clerk/react-router";
import { rootAuthLoader } from "@clerk/react-router/ssr.server";
import type { LoaderFunctionArgs } from "react-router";

// Add loader untuk authentication state
export async function loader(args: LoaderFunctionArgs) {
  return rootAuthLoader(args);
}

export default function SignUpCatchAllPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
      <SignUp
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "shadow-xl",
            footerActionLink: "text-blue-600 hover:text-blue-800 font-medium",
          },
        }}
        signInUrl="/sign-in"
      />
    </div>
  );
}
