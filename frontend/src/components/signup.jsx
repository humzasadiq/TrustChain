import { useState } from "react";
import { UserPlus, ShieldCheck } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Link, useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "./ui/alert";
import { useAuth } from "../context/AuthContext";

export default function Signup() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    firstName: "",
    lastName: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signup } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Combine firstName and lastName to create a username if not provided
    const username = formData.username || `${formData.firstName.toLowerCase()}${formData.lastName.toLowerCase()}`;

    try {
      const result = await signup({
        username,
        email: formData.email,
        password: formData.password,
      });

      if (result.success) {
        // Redirect to dashboard
        navigate("/dashboard");
      } else {
        setError(result.message || "Signup failed");
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
              <UserPlus className="mx-auto h-6 w-6" />
              <h1 className="text-2xl font-bold">Sign Up</h1>
              <p className="text-gray-500">Create an account to get started</p>
            </div>
            
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input 
                  id="firstName" 
                  placeholder="John" 
                  required 
                  className="bg-[#F2FDFF]"
                  value={formData.firstName}
                  onChange={handleChange} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input 
                  id="lastName" 
                  placeholder="Doe" 
                  required 
                  className="bg-[#F2FDFF]"
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username (optional)</Label>
                <Input 
                  id="username" 
                  placeholder="johndoe" 
                  className="bg-[#F2FDFF]"
                  value={formData.username}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  placeholder="name@example.com" 
                  required 
                  type="email" 
                  className="bg-[#F2FDFF]"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  required 
                  type="password" 
                  className="bg-[#F2FDFF]"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
              <Button className="w-full mt-2" type="submit" disabled={loading}>
                {loading ? (
                  "Creating Account..."
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Sign Up
                  </>
                )}
              </Button>
            </form>
            <div className="text-center text-sm pt-2">
              Already have an account?{" "}
              <Link to="/login" className="underline">
                Login
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