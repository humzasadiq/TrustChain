"use client"

import React, { useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Badge } from "./ui/badge"
import esp from "./images/esp321.png"
import ir from "./images/ir.png"
import rfid from "./images/rfid.png"

import {
  Cpu,
  Radio,
  Truck,
  Package,
  Factory,
  Warehouse,
  Zap,
  CheckCircle2,
  ArrowRight,
  Github,
  Twitter,
  Linkedin,
  ShieldCheck
} from "lucide-react"
import { motion } from "framer-motion"
import { Link } from "react-router-dom"

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 1.2 },
  },
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.4,
    },
  },
}

const MotionCard = motion(Card)

export default function About() {

  // Fix for hydration issues with framer-motion
  const [isMounted, setIsMounted] = React.useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  return (
    <div className="w-full bg-[#F2FDFF] dark:bg-primary/0.5 pt-16">
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 py-12 space-y-20 ">
        {/* Hero Section */}
        <motion.div initial="hidden" animate="visible" variants={fadeIn} className="text-center space-y-6 ">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
            About <span className="text-primary">TrustChain</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Building trust through transparent, secure, and traceable supply chain management
          </p>
        </motion.div>

        {/* Overview Section */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeIn}
        >
          <Card className="border-none bg-[#E7FFFE] dark:bg-primary/5 shadow-lg overflow-hidden">
            <CardHeader className=" dark:bg-transparent  rounded-t-lg h-20">
              <CardTitle className="text-2xl mt-2">What is TrustChain?</CardTitle>
              <CardDescription>A next-generation supply chain management system</CardDescription>
            </CardHeader>
            <CardContent className="pb-8 px-6 ">
              <div className="prose dark:prose-invert max-w-none">
                <p>
                  TrustChain is an innovative supply chain management system that leverages blockchain technology, IoT
                  devices, and RFID tracking to create a transparent, secure, and efficient supply chain ecosystem. Our
                  platform enables real-time tracking of materials and products as they move through different stages of
                  the supply chain, from raw materials to final delivery.
                </p>
                <p>
                  By implementing TrustChain, businesses can ensure product authenticity, reduce fraud, minimize delays,
                  and build trust with their customers and partners. Every transaction and movement is recorded on an
                  immutable ledger, providing a complete audit trail and enabling full traceability of products.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Supply Chain Process */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="space-y-8"
        >
          <motion.h2 variants={fadeIn} className="text-3xl font-bold text-center ">
            The Supply Chain Process
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div variants={fadeIn}> 
              <MotionCard className="border-none bg-[#E7FFFE] dark:bg-primary/5 shadow-md hover:shadow-lg transition-shadow h-full">
                <CardHeader className="pb-4">
                  <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-2 bg-slate-50 dark:bg-white">
                    <Warehouse className="h-6 w-6 text-black" />
                  </div>
                  <CardTitle>Raw Materials</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Raw materials are tagged with RFID and enter the supply chain. Each material is scanned and
                    registered in the blockchain.
                  </p>
                </CardContent>
              </MotionCard>
            </motion.div>

            <motion.div variants={fadeIn}>
              <MotionCard className="border-none bg-[#E7FFFE] dark:bg-primary/5 shadow-md hover:shadow-lg transition-shadow h-full">
                <CardHeader className="pb-4">
                  <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-2 bg-slate-50 dark:bg-white">
                    <Factory className="h-6 w-6 text-black" />
                  </div>
                  <CardTitle>Manufacturing</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Materials are combined and processed into finished or semi-finished products. Each step is tracked
                    and verified.
                  </p>
                </CardContent>
              </MotionCard>
            </motion.div>

            <motion.div variants={fadeIn}>
              <MotionCard className="border-none bg-[#E7FFFE] dark:bg-primary/5 shadow-md hover:shadow-lg transition-shadow h-full">
                <CardHeader className="pb-4">
                  <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-2 bg-slate-50 dark:bg-white">
                    <Package className="h-6 w-6 text-black" />
                  </div>
                  <CardTitle>Packaging</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Products are packaged and prepared for distribution. Package information is linked to the product's
                    digital identity.
                  </p>
                </CardContent>
              </MotionCard>
            </motion.div>

            <motion.div variants={fadeIn}>
              <MotionCard className="border-none bg-[#E7FFFE] dark:bg-primary/5 shadow-md hover:shadow-lg transition-shadow h-full">
                <CardHeader className="pb-4">
                  <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-2 bg-slate-50 dark:bg-white">
                    <Truck className="h-6 w-6 text-black" />
                  </div>
                  <CardTitle>Shipping</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Products are shipped to distributors or directly to customers. Location and condition are monitored
                    throughout transit.
                  </p>
                </CardContent>
              </MotionCard>
            </motion.div>
          </div>
        </motion.div>

        {/* Technology Section */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeIn}
          className="space-y-8"
        >
          <h2 className="text-3xl font-bold text-center">Our Technology</h2>
          <Tabs defaultValue="overview" className="w-full ">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 bg-muted/50 dark:bg-primary/0.5 rounded-lg p-1">
              <TabsTrigger value="overview" className="data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary bg-[#E7FFFE] dark:bg-primary/5 ">Overview</TabsTrigger>
              <TabsTrigger value="hardware" className="data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary bg-[#E7FFFE] dark:bg-primary/5">Hardware</TabsTrigger>
              <TabsTrigger value="software" className="data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary bg-[#E7FFFE] dark:bg-primary/5">Software</TabsTrigger>
              <TabsTrigger value="blockchain" className="data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary bg-[#E7FFFE] dark:bg-primary/5">Blockchain</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="mt-6">
              <Card className="border-none shadow-md bg-[#E7FFFE] dark:bg-primary/5">
                <CardContent className="pt-6">
                  <div className="prose dark:prose-invert max-w-none">
                    <p>
                      TrustChain combines cutting-edge hardware and software technologies to create a seamless, secure
                      supply chain management system. Our solution integrates ESP32 microcontrollers, IR sensors, RFID
                      technology, and blockchain to provide real-time tracking and verification at every stage of the
                      supply chain.
                    </p>
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-center my-8">
                      <div className="flex flex-col items-center">
                        <Cpu className="h-12 w-12 text-primary mb-2" />
                        <span className="text-sm font-medium">IoT Devices</span>
                      </div>
                      <ArrowRight className="hidden md:block h-6 w-6 text-muted-foreground" />
                      <div className="flex flex-col items-center">
                        <Radio className="h-12 w-12 text-primary mb-2" />
                        <span className="text-sm font-medium">RFID Technology</span>
                      </div>
                      <ArrowRight className="hidden md:block h-6 w-6 text-muted-foreground" />
                      <div className="flex flex-col items-center">
                        <Zap className="h-12 w-12 text-primary mb-2" />
                        <span className="text-sm font-medium">Real-time Processing</span>
                      </div>
                      <ArrowRight className="hidden md:block h-6 w-6 text-muted-foreground" />
                      <div className="flex flex-col items-center">
                        <CheckCircle2 className="h-12 w-12 text-primary mb-2" />
                        <span className="text-sm font-medium">Verified Records</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="hardware" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-none shadow-md bg-[#E7FFFE] dark:bg-primary/5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Cpu className="h-5 w-5" /> ESP32 Microcontroller
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="aspect-video relative overflow-hidden rounded-md bg-muted">
                      <img
                        src={esp}
                        alt="ESP32 Microcontroller"
                        className="object-cover w-full h-full transition-transform duration-300 hover:scale-110 bg-[#E7FFFE] dark:bg-primary/5"
                      />
                    </div>
                    <div className="prose dark:prose-invert max-w-none">
                      <p>
                        ESP32 is a family of low-cost, energy-efficient microcontrollers that integrate both Wi-Fi and
                        Bluetooth capabilities. In TrustChain, ESP32 devices serve as the brain of our IoT
                        infrastructure, collecting data from sensors and communicating with the central system.
                      </p>
                      <ol className="ml-4" style={{ listStyleType: 'upper-roman' }}>
                        <li>Dual-core processor up to 240MHz</li>
                        <li>Integrated Wi-Fi and Bluetooth</li>
                        <li>Ultra-low power consumption</li>
                        <li>Rich peripheral interface</li>
                      </ol>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-md bg-[#E7FFFE] dark:bg-primary/5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Radio className="h-5 w-5" /> IR Sensors & RFID Technology
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="aspect-video relative overflow-hidden rounded-md bg-muted ">
                        <img
                          src={ir}
                          alt="IR Sensor"
                          className="object-cover w-full h-full transition-transform duration-300 hover:scale-110 bg-[#E7FFFE] dark:bg-primary/5"
                        />
                      </div>
                      <div className="aspect-video relative overflow-hidden rounded-md bg-muted">
                        <img
                          src={rfid}
                          alt="RFID Technology"
                          className="object-cover w-full h-full transition-transform duration-300 hover:scale-110 bg-[#E7FFFE] dark:bg-primary/5"
                        />
                      </div>
                    </div>
                    <div className="prose dark:prose-invert max-w-none">
                      <p>
                        Our system uses IR sensors to detect the entry and exit of materials at each stage. RFID tags
                        and scanners provide detailed identification and tracking of individual items throughout the
                        supply chain.
                      </p>
                      <br />
                      <h4>IR Sensors</h4>
                      <ol className="ml-4" style={{ listStyleType: 'upper-roman' }}>
                        <li>Detect movement through production stages</li>
                        <li>Trigger automatic scanning events</li>
                      </ol>
                      <br/>
                      <h4>RFID Technology</h4>
                      <ol className="ml-4" style={{ listStyleType: 'upper-roman' }}>
                        <li>Unique identification for each item</li>
                        <li>Contactless scanning capability</li>
                        <li>Durable tags suitable for various environments</li>
                      </ol>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="software" className="mt-6">
              <Card className="border-none shadow-md bg-[#E7FFFE] dark:bg-primary/5">
                <CardContent className="pt-6">
                  <div className="prose dark:prose-invert max-w-none">
                    <p>
                      TrustChain's software platform provides a comprehensive solution for managing and visualizing the
                      entire supply chain. Our dashboard offers real-time insights, alerts, and analytics to help
                      businesses make informed decisions.
                    </p>

                    <h3>Key Software Features: </h3>
                    <ul className="ml-5" style={{ listStyleType: 'disc' }}>
                      <li>
                        <strong>Real-time Tracking:</strong> Monitor the location and status of materials and products
                        in real-time
                      </li>
                      <li>
                        <strong>Automated Alerts:</strong> Receive notifications about delays, anomalies, or potential
                        issues
                      </li>
                      <li>
                        <strong>Analytics Dashboard:</strong> Gain insights into supply chain performance and identify
                        optimization opportunities
                      </li>
                      <li>
                        <strong>Integration Capabilities:</strong> Connect with existing ERP, WMS, and other business
                        systems
                      </li>
                      <li>
                        <strong>Mobile Access:</strong> Access critical information from anywhere using our mobile
                        application
                      </li>
                    </ul>

                    <div className="bg-muted p-4 rounded-md my-4 bg-slate-70 ">
                      <h4>Technology Stack</h4>
                      <div className="flex flex-wrap gap-2 mt-2 ">
                        <Badge variant="outline">React</Badge>
                        <Badge variant="outline">Node.js</Badge>
                        <Badge variant="outline">MongoDB</Badge>
                        <Badge variant="outline">WebSockets</Badge>
                        <Badge variant="outline">REST API</Badge>
                        <Badge variant="outline">JWT Authentication</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="blockchain" className="mt-6">
              <Card className="border-none shadow-md bg-[#E7FFFE] dark:bg-primary/5">
                <CardContent className="pt-6">
                  <div className="prose dark:prose-invert max-w-none">
                    <p>
                      Blockchain technology is at the core of TrustChain's security and transparency features. By
                      recording each transaction and movement on an immutable ledger, we ensure that the supply chain
                      data cannot be tampered with or falsified.
                    </p>

                    <h3>Blockchain Benefits :</h3>
                    <ul className="ml-5" style={{ listStyleType: 'disc' }}>
                      <li>
                        <strong>Immutability:</strong> Once recorded, data cannot be altered or deleted
                      </li>
                      <li>
                        <strong>Transparency:</strong> All authorized parties have access to the same information
                      </li>
                      <li>
                        <strong>Traceability:</strong> Complete history of each product from origin to destination
                      </li>
                      <li>
                        <strong>Smart Contracts:</strong> Automated execution of agreements when predefined conditions
                        are met
                      </li>
                      <li>
                        <strong>Reduced Fraud:</strong> Verification of authenticity at every stage
                      </li>
                    </ul>

                    <p>
                      Our blockchain implementation is designed to be energy-efficient and scalable, addressing common
                      concerns about blockchain technology while providing all the benefits of a distributed ledger
                      system.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* How It Works Section */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeIn}
          className="space-y-8"
        >
          <h2 className="text-3xl font-bold text-center ">How It Works</h2>
          <Card className="border-none shadow-lg overflow-hidden bg-[#E7FFFE] dark:bg-primary/5">
            <CardContent className="p-0">
              <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="bg-[#E7FFFE] dark:bg-primary/5 p-8">
                  <h3 className="text-xl font-semibold mb-4">The Process</h3>
                  <ol className="space-y-6">
                    <li className="flex gap-4">
                      <div className="bg-white text-black rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="font-medium">1</span>
                      </div>
                      <div>
                        <h4 className="font-medium">Material Tagging</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Each raw material or component is tagged with an RFID chip containing a unique identifier.
                        </p>
                      </div>
                    </li>
                    <li className="flex gap-4">
                      <div className="bg-white text-black rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="font-medium">2</span>
                      </div>
                      <div>
                        <h4 className="font-medium">Stage Entry Detection</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          IR sensors detect when materials enter a new production stage, triggering the RFID scanner.
                        </p>
                      </div>
                    </li>
                    <li className="flex gap-4">
                      <div className="bg-white text-black rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="font-medium">3</span>
                      </div>
                      <div>
                        <h4 className="font-medium">RFID Scanning</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          The RFID scanner reads the tag information and sends it to the ESP32 microcontroller.
                        </p>
                      </div>
                    </li>
                    <li className="flex gap-4">
                      <div className="bg-white text-black rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="font-medium">4</span>
                      </div>
                      <div>
                        <h4 className="font-medium">Data Transmission</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          The ESP32 processes the data and transmits it to the central system via Wi-Fi.
                        </p>
                      </div>
                    </li>
                    <li className="flex gap-4">
                      <div className="bg-white text-black rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="font-medium">5</span>
                      </div>
                      <div>
                        <h4 className="font-medium">Blockchain Recording</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          The transaction is verified and recorded on the blockchain, creating an immutable record.
                        </p>
                      </div>
                    </li>
                  </ol>
                </div>
                <div className="p-8">
                  <h3 className="text-xl font-semibold mb-4">Technical Implementation</h3>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium">ESP32 Configuration</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Our ESP32 devices are programmed to handle multiple tasks simultaneously:
                      </p>
                      <ul className="text-sm text-muted-foreground mt-2 list-disc pl-5 space-y-1">
                        <li>Monitor IR sensors for entry/exit events</li>
                        <li>Control RFID scanners and process tag data</li>
                        <li>Maintain secure Wi-Fi connection to the central system</li>
                        <li>Buffer data in case of connectivity issues</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium">Sensor Integration</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        IR sensors are strategically placed at entry and exit points of each production stage. They
                        trigger the RFID scanning process and help track the flow of materials.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium">RFID Technology</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        We use high-frequency (13.56 MHz) RFID tags and readers for reliable performance in industrial
                        environments. Each production stage has dedicated RFID scanners to track materials.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium">Real-time Communication</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        WebSocket connections enable real-time updates to the dashboard, allowing stakeholders to
                        monitor the supply chain as events occur.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Benefits Section */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="space-y-8 "
        >
          <motion.h2 variants={fadeIn} className="text-3xl font-bold text-center ">
            Benefits of TrustChain
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6  ">
            {[
              {
                title: "Enhanced Transparency",
                description:
                  "Complete visibility into the supply chain, allowing all stakeholders to track products from origin to destination.",
              },
              {
                title: "Improved Efficiency",
                description:
                  "Automated tracking and reporting reduce manual processes and minimize errors, leading to faster operations.",
              },
              {
                title: "Fraud Prevention",
                description:
                  "Immutable blockchain records make it virtually impossible to introduce counterfeit products into the supply chain.",
              },
              {
                title: "Quality Assurance",
                description:
                  "Real-time monitoring helps identify quality issues early, reducing waste and improving product quality.",
              },
              {
                title: "Regulatory Compliance",
                description:
                  "Comprehensive tracking and documentation simplify compliance with industry regulations and standards.",
              },
              {
                title: "Consumer Trust",
                description:
                  "Provide end consumers with verifiable information about product origins, manufacturing processes, and authenticity.",
              },
            ].map((benefit, index) => (
              <motion.div key={index} variants={fadeIn}>
                <MotionCard className="border-none shadow-md hover:shadow-lg transition-shadow h-full bg-[#E7FFFE] dark:bg-primary/5">
                  <CardHeader>
                    <CardTitle>{benefit.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{benefit.description}</p>
                  </CardContent>
                </MotionCard>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="w-full bg-[#E7FFFE] dark:bg-primary/5 mt-20 py-12 border-t border-slate-200 dark:border-slate-800">
        <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mr-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-700" />
                </div>
                <h3 className="text-xl font-bold flex items-center gap-2">
                  TrustChain
                </h3>
              </div>
              <p className="text-muted-foreground mb-4 max-w-md">
                Building trust through transparent, secure, and traceable supply chain management. Our innovative
                platform helps businesses ensure product authenticity and build customer confidence.
              </p>
              <div className="flex space-x-4">
                <a href="https://twitter.com" target="_blank" className="text-muted-foreground hover:text-primary transition-colors">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="https://github.com/humzasadiq/TrustChain" target="_blank" className="text-muted-foreground hover:text-primary transition-colors">
                  <Github className="h-5 w-5" />
                </a>
                <a href="https://linkedin.com" target="_blank" className="text-muted-foreground hover:text-primary transition-colors">
                  <Linkedin className="h-5 w-5" />
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/dashboard" className="text-muted-foreground hover:text-primary transition-colors">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link to="/logs" className="text-muted-foreground hover:text-primary transition-colors">
                    Logs
                  </Link>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                    About Us
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2">
                <li className="text-muted-foreground">NED University of Engineering and Tech.</li>
                <li className="text-muted-foreground">Karachi, Pakistan</li>
                <li className="text-muted-foreground">info@trustchain.pk</li>
                <li className="text-muted-foreground">+92 300 1234567</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} TrustChain. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
