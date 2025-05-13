import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Warehouse, RefreshCw, ArrowRight, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const InventorySummary = () => {
  const [inventoryData, setInventoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalItems, setTotalItems] = useState(0);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/get-inventory');
      
      if (!response.ok) {
        throw new Error('Failed to fetch inventory data');
      }
      
      const data = await response.json();
      if (!data.error) {
        // Process stage distribution
        const stageCounts = {};
        const items = Array.isArray(data) ? data : [];
        
        setTotalItems(items.length);
        
        items.forEach(item => {
          const stage = item.stage || 'Unassigned';
          stageCounts[stage] = (stageCounts[stage] || 0) + 1;
        });
        
        // Convert to array for the chart
        const chartData = Object.keys(stageCounts).map(stage => ({
          name: stage,
          count: stageCounts[stage]
        }));
        
        // Sort by count (descending)
        chartData.sort((a, b) => b.count - a.count);
        
        setInventoryData(chartData);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background p-2 border border-border rounded shadow-md text-sm">
          <p className="font-medium">{`${label}`}</p>
          <p>{`Count: ${payload[0].value}`}</p>
          <p className="text-muted-foreground text-xs">{`${Math.round((payload[0].value / totalItems) * 100)}% of inventory`}</p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Inventory Status</CardTitle>
          <CardDescription>Parts distribution by stage</CardDescription>
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
          <CardTitle className="text-lg font-medium">Inventory Status</CardTitle>
          <CardDescription>Parts distribution by stage</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-col items-center justify-center h-[250px]">
            <p className="text-sm text-muted-foreground mb-2">Failed to load inventory data</p>
            <Button variant="outline" size="sm" onClick={fetchInventory}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (inventoryData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Inventory Status</CardTitle>
          <CardDescription>Parts distribution by stage</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-col items-center justify-center h-[250px] text-center">
            <Package className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No inventory data available</p>
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
            <CardTitle className="text-lg font-medium">Inventory Status</CardTitle>
            <CardDescription>Parts distribution by stage ({totalItems} total items)</CardDescription>
          </div>
          <Button variant="outline" size="icon" onClick={fetchInventory}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={inventoryData}
              margin={{
                top: 20,
                right: 20,
                left: 20,
                bottom: 60,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45} 
                textAnchor="end"
                height={60}
                interval={0}
                tick={{ fontSize: 12 }}
              />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" fill="#0088FE" name="Count" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
      <CardFooter>
        <Link to="/inventory" className="w-full">
          <Button variant="outline" className="w-full">
            <Warehouse className="h-4 w-4 mr-2" />
            View Inventory
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default InventorySummary; 