import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { CarFront, RefreshCw } from 'lucide-react';

// Color palette for chart
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1'];

const BrandDistribution = () => {
  const [brandData, setBrandData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBrandData = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/get-all-orders');
      
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      
      const data = await response.json();
      if (data.success && data.orders) {
        // Process brand distribution
        const brandCounts = {};
        
        data.orders.forEach(order => {
          const brand = order.brand || 'Unknown';
          brandCounts[brand] = (brandCounts[brand] || 0) + 1;
        });
        
        // Convert to array for the chart
        const chartData = Object.keys(brandCounts).map(brand => ({
          name: brand,
          value: brandCounts[brand]
        }));
        
        // Sort by value (descending)
        chartData.sort((a, b) => b.value - a.value);
        
        setBrandData(chartData);
      } else {
        setError('No orders found or error in response');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrandData();
  }, []);

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background p-2 border border-border rounded shadow-md text-sm">
          <p className="font-medium">{`${payload[0].name}: ${payload[0].value}`}</p>
          <p className="text-muted-foreground text-xs">{`${Math.round((payload[0].value / brandData.reduce((acc, curr) => acc + curr.value, 0)) * 100)}%`}</p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Brand Distribution</CardTitle>
          <CardDescription>Vehicle brands in the system</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex justify-center items-center h-[250px]">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Brand Distribution</CardTitle>
          <CardDescription>Vehicle brands in the system</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-col items-center justify-center h-[250px]">
            <p className="text-sm text-muted-foreground mb-2">Failed to load brand data</p>
            <Button variant="outline" size="sm" onClick={fetchBrandData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (brandData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Brand Distribution</CardTitle>
          <CardDescription>Vehicle brands in the system</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-col items-center justify-center h-[250px] text-center">
            <CarFront className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No brand data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg font-medium">Brand Distribution</CardTitle>
            <CardDescription>Vehicle brands in the system</CardDescription>
          </div>
          <Button variant="outline" size="icon" onClick={fetchBrandData}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={brandData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                innerRadius={30}
                fill="#8884d8"
                dataKey="value"
              >
                {brandData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default BrandDistribution; 