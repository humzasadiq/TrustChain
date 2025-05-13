import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Layers, Clock, RefreshCw, CheckCircle, XCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '../ui/badge';

const RecentEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/get-stage-events');
      
      if (!response.ok) {
        throw new Error('Failed to fetch stage events');
      }
      
      const data = await response.json();
      if (data.success && data.eventResult) {
        // Only get the 5 most recent events
        const recentEvents = Array.isArray(data.eventResult) 
          ? data.eventResult.slice(0, 2) 
          : [];
        setEvents(recentEvents);
      } else {
        setError('No events found or error in response');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return 'Unknown time';
    const date = new Date(dateTimeStr);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Get status icon and color
  const getStatusDetails = (status) => {
    if (!status) return { icon: <AlertCircle className="h-4 w-4" />, color: 'text-muted-foreground' };
    
    const statusLower = status.toLowerCase();
    
    if (statusLower === 'present') {
      return { 
        icon: <CheckCircle className="h-4 w-4" />, 
        color: 'text-green-500',
        bgColor: 'bg-green-50 dark:bg-green-950/30',
        variant: 'success'
      };
    } else if (statusLower === 'left') {
      return { 
        icon: <XCircle className="h-4 w-4" />, 
        color: 'text-orange-500',
        bgColor: 'bg-orange-50 dark:bg-orange-950/30',
        variant: 'default'
      };
    }
    
    return { 
      icon: <AlertCircle className="h-4 w-4" />, 
      color: 'text-muted-foreground',
      bgColor: 'bg-muted/50',
      variant: 'outline'
    };
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Recent Events</CardTitle>
          <CardDescription>Latest RFID tracking events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-48">
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
          <CardTitle className="text-lg font-medium">Recent Events</CardTitle>
          <CardDescription>Latest RFID tracking events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-48">
            <p className="text-sm text-muted-foreground mb-2">Failed to load events</p>
            <Button variant="outline" size="sm" onClick={fetchEvents}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
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
            <CardTitle className="text-lg font-medium">Recent Events</CardTitle>
            <CardDescription>Latest RFID tracking events</CardDescription>
          </div>
          <Button variant="outline" size="icon" onClick={fetchEvents}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {events.length > 0 ? (
          <div className="space-y-5">
            {events.map((event, index) => {
              const statusDetails = getStatusDetails(event.status);
              return (
                <div key={event.id || index} className="flex items-start gap-3">
                  <div className={`p-2 rounded-full ${statusDetails.bgColor} ${statusDetails.color} mt-0.5`}>
                    {statusDetails.icon}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate max-w-[160px]">{event.uid}</span>
                      <Badge variant={statusDetails.variant}>{event.status}</Badge>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <span>Stage: {event.stage}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">{formatDateTime(event.timestamp)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <Layers className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No recent events found</p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Link to="/logs" className="w-full">
          <Button variant="outline" className="w-full">
            View All Events
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default RecentEvents; 