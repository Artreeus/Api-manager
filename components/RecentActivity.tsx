'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Key } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

interface RecentActivityProps {
  userId: string;
}

interface ActivityItem {
  _id: string;
  label: string;
  provider: string;
  environment: string;
  lastAccessed: string;
}

export function RecentActivity({ userId }: RecentActivityProps) {
  const [recentKeys, setRecentKeys] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRecentActivity();
  }, [userId]);

  const fetchRecentActivity = async () => {
    try {
      const response = await fetch('/api/keys/stats');
      if (response.ok) {
        const data = await response.json();
        setRecentKeys(data.recentlyAccessed || []);
      }
    } catch (error) {
      console.error('Failed to fetch recent activity:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getEnvironmentColor = (environment: string) => {
    switch (environment) {
      case 'production':
        return 'bg-red-100 text-red-800';
      case 'staging':
        return 'bg-yellow-100 text-yellow-800';
      case 'development':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Recent Activity
        </CardTitle>
        <CardDescription>
          Recently accessed API keys
        </CardDescription>
      </CardHeader>
      <CardContent>
        {recentKeys.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Key className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No recent activity</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentKeys.map((key) => (
              <div key={key._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-sm">{key.label}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs capitalize">
                      {key.provider}
                    </Badge>
                    <Badge className={`text-xs ${getEnvironmentColor(key.environment)}`}>
                      {key.environment}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(key.lastAccessed), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}