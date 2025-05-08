import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { ThemeProvider } from "./components/theme-provider"
import Navbar from "./components/navbar"
import Home from "./components/home"
import Dashboard from "./components/dashboard"
// import Random from "./components/random"
import Login from "./components/login"
import Signup from "./components/signup"
import "./App.css"
import "./index.css"
import ProductDetails from "./components/ProductDetails"
import ShowNavbar from "./components/showNavbar"

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="trustchain-theme">
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
            <Route path="/catalog/:id" element={<ProductDetails/>} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  )
}

export default App
