"use client"

import { Link } from "react-router-dom"
import { Shield, LayoutDashboard, LogOut } from 'lucide-react'
import { Button } from "./ui/button"
import wave1 from "../wave1.png"
import { useState, useEffect } from "react"

export default function Home() {
  const taglines = [
    "Secure, transparent, and reliable blockchain solutions for your business",
    "Building trust through immutable ledger technology",
    "Revolutionizing data integrity with blockchain innovation",
    "Enterprise-grade security for your digital assets",
    "Decentralized solutions for a centralized world",
  ]

  const [currentTagline, setCurrentTagline] = useState(taglines[0])
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    let taglineIndex = 0

    const intervalId = setInterval(() => {
      setIsVisible(false)

      setTimeout(() => {
        taglineIndex = (taglineIndex + 1) % taglines.length
        setCurrentTagline(taglines[taglineIndex])
        setIsVisible(true)
      }, 500) // Wait for fade out before changing text
    }, 3000) // Change every 3 seconds

    return () => clearInterval(intervalId)
  }, [])

  return (
    <div className="flex min-h-[calc(100vh-4rem)] relative overflow-hidden dark:bg-background bg-background">
      {/* Left side content */}
      <div className="flex-1 flex flex-col justify-center px-4 md:px-12 lg:px-20 z-10">
        <div className="space-y-8 max-w-[600px] mx-auto text-center">
          <div className="flex justify-center">
            <Shield className="h-24 w-24 text-primary" />
          </div>
          <h1 className="text-5xl font-bold tracking-tighter sm:text-6xl md:text-7xl">TrustChain</h1>
          <div className="h-20">
            {" "}
            {/* Fixed height container to prevent layout shift */}
            <p
              className={`text-muted-foreground text-xl md:text-2xl transition-opacity duration-500 ${isVisible ? "opacity-100" : "opacity-0"}`}
            >
              {currentTagline}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row pt-6 gap-6 justify-center">
            <Link to="/dashboard">
              <Button size="lg" className="gap-2 text-lg px-6 py-6">
                <LayoutDashboard className="h-5 w-5" />
                Dashboard
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="gap-2 text-lg px-6 py-6">
              <LogOut className="h-5 w-5" />
              Leave for now
            </Button>
          </div>
        </div>
      </div>

      {/* Right side image */}
      <div className="hidden md:block md:w-1/2 lg:w-[45%] relative">
        <div
          className="absolute inset-0 bg-no-repeat bg-center bg-contain"
          style={{
            backgroundImage: `url(${wave1})`,
            backgroundSize: "contain",
            backgroundPosition: "center right",
          }}
        />
      </div>
    </div>
  )
}
