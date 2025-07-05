
import React, { useState, useRef, useEffect } from 'react';
import { Search, Truck, MapPin, Clock, Flame, IceCreamCone, ArrowDown, ArrowUp, RefreshCw, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Stop {
  store_id: string;
  lat: number;
  lng: number;
  urgency: 'high' | 'medium' | 'low';
  item_type: 'perishable' | 'non-perishable';
  address: string;
}

interface Route {
  truck_id: string;
  driver: string;
  urgency_score: number;
  route_distance_km: number;
  eta_minutes: number;
  stops: Stop[];
  traffic_level: 'heavy' | 'medium' | 'low';
}

interface RouteData {
  routes: Route[];
  traffic_overlay: boolean;
}

const RouteOptimizationDashboard = () => {
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [itemTypeFilter, setItemTypeFilter] = useState<string>('all');
  const [trafficFilter, setTrafficFilter] = useState<string>('all');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);

  // Mock data - in real implementation, this would come from props or API
  const mockData: RouteData = {
    routes: [
      {
        truck_id: "TRUCK-91",
        driver: "Alex Singh",
        urgency_score: 8.9,
        route_distance_km: 38.2,
        eta_minutes: 52,
        traffic_level: 'heavy',
        stops: [
          { store_id: "ST001", lat: 12.971, lng: 77.593, urgency: "high", item_type: "perishable", address: "MG Road Store" },
          { store_id: "ST005", lat: 12.965, lng: 77.601, urgency: "medium", item_type: "non-perishable", address: "Brigade Road Store" }
        ]
      },
      {
        truck_id: "TRUCK-45",
        driver: "Priya Sharma",
        urgency_score: 7.2,
        route_distance_km: 42.8,
        eta_minutes: 68,
        traffic_level: 'medium',
        stops: [
          { store_id: "ST003", lat: 12.959, lng: 77.612, urgency: "high", item_type: "perishable", address: "Koramangala Store" },
          { store_id: "ST007", lat: 12.934, lng: 77.627, urgency: "low", item_type: "non-perishable", address: "BTM Layout Store" },
          { store_id: "ST012", lat: 12.928, lng: 77.635, urgency: "medium", item_type: "perishable", address: "JP Nagar Store" }
        ]
      },
      {
        truck_id: "TRUCK-23",
        driver: "Rajesh Kumar",
        urgency_score: 5.8,
        route_distance_km: 28.5,
        eta_minutes: 35,
        traffic_level: 'low',
        stops: [
          { store_id: "ST009", lat: 12.982, lng: 77.586, urgency: "medium", item_type: "non-perishable", address: "Malleshwaram Store" },
          { store_id: "ST015", lat: 12.995, lng: 77.578, urgency: "low", item_type: "non-perishable", address: "Rajajinagar Store" }
        ]
      }
    ],
    traffic_overlay: true
  };

  const filteredRoutes = mockData.routes.filter(route => {
    const matchesSearch = route.truck_id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         route.driver.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesItemType = itemTypeFilter === 'all' || 
                           route.stops.some(stop => stop.item_type === itemTypeFilter);
    
    const matchesTraffic = trafficFilter === 'all' || route.traffic_level === trafficFilter;
    
    const matchesUrgency = urgencyFilter === 'all' || 
                          route.stops.some(stop => stop.urgency === urgencyFilter);
    
    return matchesSearch && matchesItemType && matchesTraffic && matchesUrgency;
  });

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-amber-600 bg-amber-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getTrafficColor = (level: string) => {
    switch (level) {
      case 'heavy': return 'text-red-600';
      case 'medium': return 'text-amber-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
    setTimeout(() => setIsRefreshing(false), 2000);
  };

  const formatETA = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Route Optimization Dashboard</h1>
          <p className="text-gray-600">Real-time delivery route management and optimization</p>
        </div>

        {/* Filters Section */}
        <Card className="mb-6 shadow-lg border-0">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Filters & Controls
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search trucks or drivers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              <Select value={itemTypeFilter} onValueChange={setItemTypeFilter}>
                <SelectTrigger className="border-gray-200">
                  <SelectValue placeholder="Item Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Items</SelectItem>
                  <SelectItem value="perishable">Perishable</SelectItem>
                  <SelectItem value="non-perishable">Non-Perishable</SelectItem>
                </SelectContent>
              </Select>

              <Select value={trafficFilter} onValueChange={setTrafficFilter}>
                <SelectTrigger className="border-gray-200">
                  <SelectValue placeholder="Traffic Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Traffic</SelectItem>
                  <SelectItem value="heavy">Heavy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>

              <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
                <SelectTrigger className="border-gray-200">
                  <SelectValue placeholder="Urgency Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Urgency</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>

              <Button 
                onClick={handleRefresh} 
                disabled={isRefreshing}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map Section */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg border-0 h-[600px]">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  Live Route Map
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 h-[calc(100%-80px)]">
                <div 
                  ref={mapRef}
                  className="w-full h-full bg-gradient-to-br from-blue-100 to-green-100 rounded-b-lg relative overflow-hidden"
                >
                  {/* Map Placeholder - In real implementation, integrate with Mapbox/Google Maps */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="h-16 w-16 text-blue-400 mx-auto mb-4" />
                      <p className="text-gray-600 text-lg font-medium">Interactive Map</p>
                      <p className="text-gray-500 text-sm mt-2">
                        Real-time route visualization with traffic overlays
                      </p>
                    </div>
                  </div>
                  
                  {/* Mock route indicators */}
                  <div className="absolute top-4 left-4 space-y-2">
                    <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-sm">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span className="text-sm font-medium">High Priority Routes</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-sm">
                      <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                      <span className="text-sm font-medium">Medium Priority Routes</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-sm">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-sm font-medium">Normal Priority Routes</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Route List Section */}
          <div className="space-y-4">
            <Card className="shadow-lg border-0">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Truck className="h-5 w-5 text-blue-600" />
                  Active Routes ({filteredRoutes.length})
                </CardTitle>
              </CardHeader>
            </Card>

            <div className="space-y-4 max-h-[520px] overflow-y-auto pr-2">
              {filteredRoutes.map((route) => (
                <Card 
                  key={route.truck_id}
                  className={`cursor-pointer transition-all duration-200 border-0 shadow-md hover:shadow-lg hover:scale-[1.02] ${
                    selectedRoute === route.truck_id ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedRoute(selectedRoute === route.truck_id ? null : route.truck_id)}
                >
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Truck className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{route.truck_id}</h3>
                            <p className="text-sm text-gray-600">{route.driver}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1">
                            <Flame className="h-4 w-4 text-red-500" />
                            <span className="text-sm font-medium">{route.urgency_score}/10</span>
                          </div>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span>ETA: {formatETA(route.eta_minutes)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span>{route.route_distance_km} km</span>
                        </div>
                      </div>

                      {/* Traffic Level */}
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className={`${getTrafficColor(route.traffic_level)} border-current`}>
                          Traffic: {route.traffic_level}
                        </Badge>
                        <div className="flex items-center gap-1">
                          {selectedRoute === route.truck_id ? (
                            <ArrowUp className="h-4 w-4 text-gray-400" />
                          ) : (
                            <ArrowDown className="h-4 w-4 text-gray-400" />
                          )}
                        </div>
                      </div>

                      {/* Expandable Stops */}
                      {selectedRoute === route.truck_id && (
                        <div className="mt-4 pt-3 border-t border-gray-200 space-y-2 animate-in slide-in-from-top-2 duration-200">
                          <h4 className="font-medium text-gray-900 text-sm">Stops ({route.stops.length})</h4>
                          {route.stops.map((stop, index) => (
                            <div key={stop.store_id} className="flex items-center justify-between p-2 bg-white rounded-lg border border-gray-100">
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1">
                                  <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full text-xs flex items-center justify-center font-medium">
                                    {index + 1}
                                  </span>
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">{stop.address}</p>
                                    <p className="text-xs text-gray-500">{stop.store_id}</p>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {stop.item_type === 'perishable' && (
                                  <IceCreamCone className="h-4 w-4 text-blue-500" />
                                )}
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${getUrgencyColor(stop.urgency)} border-current`}
                                >
                                  {stop.urgency}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RouteOptimizationDashboard;
