import React, { useRef, useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Car, ShieldCheck } from "lucide-react";
import { setupThreeJsScene } from "../lib/three-utils";

export default function Order() {
  const [formData, setFormData] = useState({ name: "", rfid: "", description: "" });
  const containerRef = useRef(null);
  const [isSceneReady, setIsSceneReady] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
  };

  useEffect(() => {
    if (!containerRef.current) return;

    // Wait for layout
    const frame = requestAnimationFrame(() => {
      const cleanup = setupThreeJsScene(containerRef.current);
      setIsSceneReady(true);
      return cleanup;
    });

    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="min-h-screen bg-[#F2FDFF] dark:bg-background flex flex-col pt-20">
      <div className="container mx-auto py-8 px-4 flex-grow">
        <h1 className="text-3xl font-bold mb-8 text-center">Vehicle Registration</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="flex items-center justify-center">
            <Card className="w-full max-w-md border-none shadow-lg bg-[#E7FFFE] dark:bg-primary/5">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Car className="h-6 w-6 text-primary" />
                  <CardTitle>Vehicle Details</CardTitle>
                </div>
                <CardDescription>Enter vehicle and RFID information</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Owner Name</Label>
                    <Input id="name" name="name" value={formData.name} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rfid">Car RFID</Label>
                    <Input id="rfid" name="rfid" value={formData.rfid} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" name="description" value={formData.description} onChange={handleChange} />
                  </div>
                  <Button type="submit" className="w-full">Register Vehicle</Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Right side - 3D canvas */}
          <div className="h-[500px] rounded-lg overflow-hidden shadow-lg">
            <div
              ref={containerRef}
              className="w-full h-full bg-gradient-to-br from-[#E7FFFE] to-[#F2FDFF] dark:from-primary/5 dark:to-black/20"
            />
          </div>
        </div>
      </div>

      <footer className="bg-[#E7FFFE] dark:bg-primary/5 py-6 border-t border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="flex items-center mb-4 sm:mb-0">
              <ShieldCheck className="h-5 w-5 text-primary mr-2" />
              <span className="text-sm font-medium">TrustChain</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} TrustChain. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
