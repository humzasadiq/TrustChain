# TrustChain: Automotive Supply Chain Integrity Platform

## Overview
TrustChain is a comprehensive solution for tracking and verifying automotive parts throughout their lifecycle in repair and insurance claims. The platform combines ESP32-based RFID scanning with blockchain technology to ensure authenticity and prevent fraud in the automotive supply chain.

## Architecture

![TrustChain Architecture](images/image.png)

## Screenshots

### Dashboard
![TrustChain Dashboard](images/dashboard.png)
*Main dashboard showing supply chain overview and key metrics*

### Front Page
![TrustChain Front Page](images/frontpage.png)
*Landing Page*

### Car Order Management
![Car Order System](images/carOrder.png)
*Interface for managing car parts orders and tracking*

### System Logs
![System Logs](images/logs.png)
*Detailed logging system for tracking all platform activities*

### About Us
![About TrustChain](images/AboutUs.png)
*Information about the TrustChain platform and team*

## Tech Stack
- **Frontend**: React.js with Tailwind CSS
- **Backend**: Node.js with Express
- **Blockchain**: Smart Contracts (Solidity)
- **Hardware**: ESP32 with RFID scanning capabilities
- **Database**: Supabase

## Prerequisites
- Node.js (v14 or higher)
- Arduino IDE
- ESP32 board
- CP210x USB-to-UART Bridge driver for Hardware Installation
- MetaMask or compatible Web3 wallet

###  Full Stack Setup:
   ```bash
   # Frontend
   cd frontend
   npm install

   # Backend
   cd backend
   npm install
   ```

### Start the application:
   ```bash
   # Frontend
   cd frontend
   npm run both
   ```
