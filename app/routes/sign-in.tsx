import { useEffect } from 'react';
import { useNavigate } from 'react-router';

export default function SignInPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to home - sign in should only be accessible via modal
    console.log('Sign-in route accessed directly, redirecting to home');
    navigate('/', { replace: true });
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Redirecting...</h2>
        <p className="text-gray-600">Please use the Sign In button in the app.</p>
      </div>
    </div>
  );
}
