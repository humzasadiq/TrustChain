import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { ThemeProvider } from "./components/theme-provider"
import Navbar from "./components/navbar"
import Home from "./components/home"
import Dashboard from "./components/dashboard"
import Login from "./components/login"
import Signup from "./components/signup"
import About from "./components/about"
import "./App.css"
import "./index.css"
import Details from "./components/Details"
import ShowNavbar from "./components/showNavbar"
import { Toaster } from "sonner"
import Logging from "./components/logging"
import Order from "./components/order"
import ProtectedRoute from "./components/ProtectedRoute"
import { AuthProvider } from "./context/AuthContext"

function App() {
  const AuthCallback = () => {
    return <div>Processing authentication...</div>;
  };

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Router>
        <AuthProvider>
          <ShowNavbar>
            <Navbar />
          </ShowNavbar>
          <Toaster richColors />
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/about" element={<About />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/dashboard" element={<Dashboard />} />
            
            {/* All protected routes */}
            <Route element={<ProtectedRoute />}>
              
              <Route path="/part/:id" element={<Details type="part" />} />
              <Route path="/order/:id" element={<Details type="order" />} />
              <Route path="/logs" element={<Logging />} />
              <Route path="/sad" element={<Order />} />
            </Route>

          </Routes>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  )
}

export default App