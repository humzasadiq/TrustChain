import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
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

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="trustchain-theme">
      <Toaster />
      <Router>
        <div className="min-h-screen bg-background text-foreground font-sans antialiased">
          <ShowNavbar>
            <Navbar />
          </ShowNavbar>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/logs" element={<Logging />} />
            <Route path="/about" element={<About />} />
            <Route path="/part/:id" element={<Details type="part" />} />
            <Route path="/order/:id" element={<Details type="order" />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  )
}

export default App
