import { UserPlus } from "lucide-react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Link } from "react-router-dom"

export default function Signup() {
  return (
    <div className="flex items-center justify-center h-screen w-full overflow-hidden">
      <div className="mx-auto max-w-sm w-full px-4">
        <div className="border p-6 rounded-lg shadow-sm space-y-4">
          <div className="space-y-2 text-center">
            <UserPlus className="mx-auto h-6 w-6" />
            <h1 className="text-2xl font-bold">Sign Up</h1>
            <p className="text-gray-500">Create an account to get started</p>
          </div>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="John Doe" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" placeholder="name@example.com" required type="email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" required type="password" />
            </div>
            <Button className="w-full mt-2">
              <UserPlus className="mr-2 h-4 w-4" />
              Sign Up
            </Button>
          </div>
          <div className="text-center text-sm pt-2">
            Already have an account?{" "}
            <Link to="/login" className="underline">
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}