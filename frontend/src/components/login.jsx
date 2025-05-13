import { useState } from "react";
import { LogIn, ShieldCheck } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Alert, AlertDescription } from "./ui/alert";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await login(email, password);
      
      if (result.success) {
        console.log("Login successful, navigating to dashboard...");
        
        // Add a slightly longer delay to ensure token is properly set
        setTimeout(() => {
          navigate("/dashboard", { replace: true });
          toast.success("Login successful!");
        }, 300);
      } else {
        setError(result.message || "Login failed");
        toast.error(result.message || "Login failed");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-col items-center justify-between min-h-screen bg-[#F2FDFF] dark:bg-primary/2 pt-18">
        <div className="mx-auto max-w-sm w-full px-4 py-6">
          <div className="border p-6 rounded-lg shadow-sm space-y-4 bg-[#E7FFFE] dark:bg-primary/5">
            <div className="space-y-2 text-center">
              <LogIn className="mx-auto h-6 w-6" />
              <h1 className="text-2xl font-bold">Login</h1>
              <p className="text-gray-500">Enter your credentials to access your account</p>
            </div>
            
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  placeholder="name@example.com" 
                  required 
                  type="email" 
                  className="bg-[#F2FDFF]"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  required 
                  type="password" 
                  className="bg-[#F2FDFF]"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button className="w-full mt-2" type="submit" disabled={loading}>
                {loading ? (
                  "Logging in..."
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Login
                  </>
                )}
              </Button>
            </form>
            <div className="text-center text-sm pt-2">
              Don't have an account?{" "}
              <Link to="/signup" className="underline">
                Sign up
              </Link>
            </div>
          </div>
        </div>
        <footer className="bg-[#F2FDFF] dark:bg-primary/5 py-6 border-t border-slate-200 dark:border-slate-800 w-full">
          <div className="container mx-auto px-4">
            <div className="flex flex-col sm:flex-row justify-between items-center">
              <div className="flex items-center mb-4 sm:mb-0">
                <ShieldCheck className="h-5 w-5 text-primary mr-2" />
                <span className="text-sm font-medium">TrustChain</span>
              </div>
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} TrustChain. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}