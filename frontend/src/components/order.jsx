import React, { useRef, useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Car, ShieldCheck, Upload, X } from "lucide-react";
import { setupThreeJsScene } from "../lib/three-utils";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function Order() {
  const initialFormData = {
    name: "",
    rfid: "",
    brand: "",
    bodyType: "",
    engineType: "",
    description: ""
  };

  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);
  const [isSceneReady, setIsSceneReady] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle select changes separately
  const handleSelectChange = (value, name) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.name || !formData.rfid || !formData.brand) {
      toast.error("Please fill in all required fields");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Create a FormData object to handle file upload
      const formDataToSend = new FormData();
      
      // Add all text fields
      formDataToSend.append("name", formData.name);
      formDataToSend.append("car_rfid", formData.rfid);
      formDataToSend.append("brand", formData.brand);
      formDataToSend.append("body_type", formData.bodyType || "");
      formDataToSend.append("engine_type", formData.engineType || "");
      formDataToSend.append("engine_cc", formData.enginecc || "");
      formDataToSend.append("description", formData.description || "");
      
      // Add the image file if exists
      if (imageFile) {
        formDataToSend.append("carImage", imageFile);
      }

      // Add your API call here
      const response = await fetch('http://localhost:5000/api/create-order', {
        method: 'POST',
        body: formDataToSend // FormData automatically sets content-type with boundary
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create order');
      }

      const data = await response.json();
      toast.success("Vehicle registered successfully!");
      setFormData(initialFormData);
      setImageFile(null);
      setImagePreview(null);
    } catch (error) {
      console.error('Registration error:', error);
      toast.error("Failed to register vehicle. Please try again.");
    } finally {
      setLoading(false);
    }
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

  const handleCarUpload = (e) => {
    const file = e.target.files[0];
    
    if (!file) return;
    
    // File validation
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload a valid image file (JPEG, PNG, GIF, WEBP)");
      return;
    }
    
    if (file.size > maxSize) {
      toast.error("Image file must be smaller than 5MB");
      return;
    }
    
    // Store the file
    setImageFile(file);
    
    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      
      // Use fileInputRef to update the input value for UI consistency
      if (fileInputRef.current) {
        // Create a DataTransfer object to set files
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileInputRef.current.files = dataTransfer.files;
      }
      
      // Then process the file as normal
      handleCarUpload({ target: { files: [file] } });
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-[#F2FDFF] dark:bg-background flex flex-col pt-20">
      <div className="container mx-auto py-8 px-4 flex-grow">
        <h1 className="text-3xl font-bold mb-8 text-center">Vehicle Registration</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="flex items-center justify-center">
            <Card className="w-full max-w-md border-none shadow-lg bg-[#E7FFFE] dark:bg-primary/5">
              <div>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Car className="h-6 w-6 text-primary" />
                    <CardTitle>Vehicle Details</CardTitle>
                  </div>
                  <CardDescription>Enter vehicle and RFID information</CardDescription>
                </CardHeader>
              </div>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Car Model Name *</Label>
                    <Input 
                      id="name" 
                      name="name" 
                      value={formData.name} 
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rfid">Car RFID *</Label>
                    <Input 
                      id="rfid" 
                      name="rfid" 
                      value={formData.rfid} 
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="brand">Car Brand *</Label>
                    <Input 
                      id="brand" 
                      name="brand" 
                      value={formData.brand} 
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bodyType">Body Type</Label>
                    <Select
                      value={formData.bodyType}
                      onValueChange={(value) => handleSelectChange(value, 'bodyType')}
                    >
                      <SelectTrigger className="w-full border border-gray-500">
                        <SelectValue placeholder="Select body type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="sedan">Sedan</SelectItem>
                          <SelectItem value="hatchback">Hatchback</SelectItem>
                          <SelectItem value="hardtop">Hardtop</SelectItem>
                          <SelectItem value="coupe">Coupe</SelectItem>
                          <SelectItem value="suv">SUV</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="engineType">Engine Type</Label>
                    <Select
                      value={formData.engineType}
                      onValueChange={(value) => handleSelectChange(value, 'engineType')}
                    >
                      <SelectTrigger className="w-full border border-gray-500">
                        <SelectValue placeholder="Select engine type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="petrol">Petrol</SelectItem>
                          <SelectItem value="diesel">Diesel</SelectItem>
                          <SelectItem value="electric">CNG</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="enginecc">Engine CC</Label>
                    <Input 
                      id="enginecc" 
                      name="enginecc" 
                      value={formData.enginecc} 
                      onChange={handleChange}
                      placeholder="Enter engine cc"
                      type="number"
                      min="1000"
                      max="5000"
                      step="100"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea 
                      id="description" 
                      name="description" 
                      value={formData.description} 
                      onChange={handleChange}
                      placeholder="Additional details about the vehicle..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="picture">Car Image</Label>
                    
                    {imagePreview ? (
                      <div className="relative mt-2 mb-4">
                        <div className="relative h-48 rounded-lg overflow-hidden">
                          <img 
                            src={imagePreview} 
                            alt="Car preview" 
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={removeImage}
                            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {imageFile?.name} ({(imageFile?.size / 1024 / 1024).toFixed(2)} MB)
                        </p>
                      </div>
                    ) : (
                      <div className="relative">
                        <div 
                          className="flex justify-center w-full h-32 mt-2 px-4 transition border-2 border-dashed rounded-md appearance-none cursor-pointer hover:border-gray-400 focus:outline-none" 
                          onDragOver={handleDragOver}
                          onDrop={handleDrop}
                        >
                          <span className="flex items-center space-x-2">
                            <Upload className="w-6 h-6 text-gray-600" />
                            <span className="font-medium text-gray-600">
                              Drop image here, or{" "}
                              <span className="text-blue-600 underline">browse</span>
                            </span>
                          </span>
                          <Input
                            ref={fileInputRef}
                            id="picture"
                            type="file"
                            accept="image/*"
                            onChange={handleCarUpload}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={loading}
                  >
                    {loading ? "Registering..." : "Register Vehicle"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Right side - 3D canvas */}
          <div className="h-full rounded-lg overflow-hidden shadow-lg">
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