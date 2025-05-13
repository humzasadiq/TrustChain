"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const formatTimespan = (date) => {
  if (!date) return "00:00:00:00"
  const inputDate = date instanceof Date ? date : new Date(date)
  const now = new Date()
  const diffMs = now.getTime() - inputDate.getTime()

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000)

  return `${days}:${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
}

export default function IPStatusMonitor() {
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const ipAddress = "10.238.198.246" // ESP32 IP address

  const checkIPStatus = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/check-ip?ip=${ipAddress}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      if (data.error) {
        throw new Error(data.error)
      }

      setStatus({
        isAlive: data.isAlive,
        lastChecked: new Date(),
        upSince: data.upSince ? new Date(data.upSince) : null,
        downSince: data.downSince ? new Date(data.downSince) : null,
        latency: data.latency
      })
    } catch (error) {
      console.error("Failed to ping device:", error)
      setStatus(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkIPStatus()
    const interval = setInterval(checkIPStatus, 60000)
    const timer = setInterval(() => {
      setStatus(prev => prev && { ...prev, lastChecked: new Date() })
    }, 1000)

    return () => {
      clearInterval(interval)
      clearInterval(timer)
    }
  }, [])
  
  return (
    <Card className="w-full max-w-md bg-[#E7FFFE] dark:bg-primary/5 ">
      <CardHeader>
        <CardTitle className="text-lg font-medium">Assembly Line Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">ESP32 Status</h3>
            {status && (
              <Badge
                className={`${
                  status.isAlive ? "bg-emerald-500 hover:bg-emerald-600" : "bg-red-500 hover:bg-red-600"
                } text-xs font-medium`}
              >
                {status.isAlive ? "Online" : "Offline"}
              </Badge>
            )}
          </div>

          {loading ? (
            <p className="text-xs text-zinc-400">Checking status...</p>
          ) : status ? (
            <div className="space-y-1">
              {status.isAlive ? (
                <>
                  <p className="text-xs text-zinc-400">
                    Uptime: {formatTimespan(status.upSince)}
                  </p>
                  <p className="text-xs text-zinc-400">
                    Latency: {status.latency}ms
                  </p>
                </>
              ) : (
                <p className="text-xs text-zinc-400">
                  Downtime: {formatTimespan(status.downSince)}
                </p>
              )}
            </div>
          ) : (
            <p className="text-xs text-zinc-400">Unable to fetch status</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
