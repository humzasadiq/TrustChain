import { useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Google from "/Google.svg";

export default function SignInWithGoogleButton() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { handleGoogleCallback } = useAuth();

  useEffect(() => {
    const code = searchParams.get("code");
    const error = searchParams.get("error");
    
    if (error) {
      navigate(`/login?error=${error}`);
      return;
    }

    if (code && location.pathname === "/auth/callback") {
      handleGoogleAuthCallback(code);
    }
  }, [location, searchParams]);

  const handleGoogleAuthCallback = async (code) => {
    try {
      const result = await handleGoogleCallback(code);
      
      if (result.success) {
        navigate("/dashboard");
      } else {
        console.error("Google login failed:", result.message);
        navigate("/login?error=google_auth_failed");
      }
    } catch (error) {
      console.error("Error during Google authentication:", error);
      navigate("/login?error=google_auth_error");
    }
  };

  const handleSignInWithGoogle = () => {
    const callbackUrl = encodeURIComponent(
      window.location.origin + "/auth/callback"
    );
    const googleAuthUrl = `https://bpknnlauvzwxsacrdvxg.supabase.co/auth/v1/authorize?provider=google&redirect_to=${callbackUrl}`;
    window.location.href = googleAuthUrl;
  };

  return (
    <button
      className="cursor-pointer text-black flex gap-2 items-center justify-center w-full bg-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-zinc-100 transition-all ease-in duration-200 border border-gray-300 mt-2"
      onClick={handleSignInWithGoogle}
      type="button"
    >
      <img src={Google} className="size-6" alt="Google Logo" />
      Sign In With Google
    </button>
  );
}