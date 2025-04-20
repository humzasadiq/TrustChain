"use client"

import { useState, useEffect } from "react"
import styles from "./page.module.css"

export default function Home() {
  const [wsStatus, setWsStatus] = useState("disconnected")
  const [lastMessage, setLastMessage] = useState("Waiting for RFID scan...")
  const [scans, setScans] = useState([])
  const [espIpAddress, setEspIpAddress] = useState("")
  const [socket, setSocket] = useState(null)

  useEffect(() => {
    // Get ESP IP from localStorage or prompt user
    const savedIp = localStorage.getItem("esp-ip-address")
    if (savedIp) {
      setEspIpAddress(savedIp)
      connectWebSocket(savedIp)
    }

    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.close()
      }
    }
  }, [])

  const connectWebSocket = (ipAddress) => {
    if (!ipAddress) return

    // Save IP to localStorage
    localStorage.setItem("esp-ip-address", ipAddress)
    setEspIpAddress(ipAddress)

    // Close existing connection if any
    if (socket) {
      socket.close()
    }

    setWsStatus("connecting")

    // Create new WebSocket connection
    const wsUrl = `ws://${ipAddress}/ws`
    const newSocket = new WebSocket(wsUrl)

    newSocket.onopen = () => {
      console.log("WebSocket connected")
      setWsStatus("connected")
    }

    newSocket.onmessage = (event) => {
      console.log("Message received:", event.data)
      setLastMessage(event.data)

      // Parse message to determine if it's entry or exit
      let type = "Unknown"
      if (event.data.includes("[Entry]")) {
        type = "Entry"
      } else if (event.data.includes("[Exit]")) {
        type = "Exit"
      }

      // Add to scans history
      setScans((prev) => [
        {
          id: Date.now(),
          timestamp: new Date().toLocaleTimeString(),
          message: event.data,
          type,
        },
        ...prev.slice(0, 19), // Keep only the last 20 scans
      ])
    }

    newSocket.onclose = () => {
      console.log("WebSocket disconnected")
      setWsStatus("disconnected")

      // Try to reconnect after 5 seconds
      setTimeout(() => {
        if (ipAddress) connectWebSocket(ipAddress)
      }, 5000)
    }

    newSocket.onerror = (error) => {
      console.error("WebSocket error:", error)
      setWsStatus("disconnected")
    }

    setSocket(newSocket)
  }

  const handleIpSubmit = (e) => {
    e.preventDefault()
    connectWebSocket(espIpAddress)
  }

  const resetConnection = () => {
    // Close existing connection if any
    if (socket) {
      socket.close()
    }
    
    // Clear IP address from state and localStorage
    setEspIpAddress("")
    localStorage.removeItem("esp-ip-address")
    setWsStatus("disconnected")
    
    // Reset scans if needed
    // Uncomment the next line if you want to clear scan history on reset
    // setScans([])
  }

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <h1 className={styles.title}>ESP32 RFID Reader</h1>

        {/* Connection Status */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>
            Connection Status
            <span className={`${styles.badge} ${styles[wsStatus]}`}>{wsStatus}</span>
          </h2>
          <div className={styles.cardContent}>
            <form onSubmit={handleIpSubmit} className={styles.form}>
              <input
                type="text"
                value={espIpAddress}
                onChange={(e) => setEspIpAddress(e.target.value)}
                placeholder="ESP32 IP Address (e.g. 192.168.1.100)"
                className={styles.input}
              />
              <button type="submit" className={styles.button}>
                Connect
              </button>
              <button 
                type="button" 
                onClick={resetConnection} 
                className={`${styles.button} ${styles.resetButton}`}
              >
                Reset
              </button>
            </form>
          </div>
        </div>

        {/* Latest Scan */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Latest RFID Scan</h2>
          <div className={styles.cardContent}>
            <div className={styles.codeBlock}>{lastMessage}</div>
          </div>
        </div>

        {/* Scan History */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Scan History</h2>
          <div className={styles.cardContent}>
            <div className={styles.scanList}>
              {scans.length === 0 ? (
                <p className={styles.emptyMessage}>No scans recorded yet</p>
              ) : (
                scans.map((scan) => (
                  <div key={scan.id} className={styles.scanItem}>
                    <span className={`${styles.badge} ${styles[scan.type.toLowerCase()]}`}>{scan.type}</span>
                    <span className={styles.timestamp}>{scan.timestamp}</span>
                    <span className={styles.message}>{scan.message}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
