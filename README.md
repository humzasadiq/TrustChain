# TrustChain: Supply Chain Integrity  

## Overview  
TrustChain is a secure, tamper-proof system for tracking car parts throughout their lifecycle in repairment and insurance claims.  

It combines ESP32-based RFID scanning with blockchain immutability to ensure authenticity and prevent fraud in the automotive supply chain. 


## Setup  
1. install PlatformIO extension in VSCODE
2. install driver CP210x_VCP_Windows.zip

## Usage
1. In VS Code, go to the PlatformIO Home (house icon on the left).
2. Click Open Project and select the folder containing this repository.
3. ini file will automaticallly install all the required libraries.
4. Click on -> button at bottom strip of vscode to upload the code to the ESP32.
5. After uploading, the ESP32 will start scanning for RFID tags.
6. For NextJS App, run the command "npm i" and "npm run dev" in the terminal after cd into /next/trust-chain/.


## Important
1. Replace "WIFI_SSID" and "WIFI_PASSWORD" with your WiFi credentials in "src/main.cpp".
