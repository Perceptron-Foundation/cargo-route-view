import React, { useState, useRef, useEffect } from 'react';
import { 
  Truck, MapPin, Clock, Flame, IceCreamCone, AlertTriangle, Bell, 
  RefreshCw, BarChart3, Eye, EyeOff, Filter, Settings, TrendingUp,
  Package, Store, Route, Zap, Shield, Thermometer, Navigation
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import NavigationHeader from './NavigationHeader';
import mapboxgl from "mapbox-gl";

interface Vehicle {
  truck_id: string;
  lat: number;
  lng: number;
  route_polyline: [number, number][];
  current_congestion_level: 'low' | 'medium' | 'high';
  delayed_minutes: number;
  eta_minutes: number;
  items_onboard: {
    item: string;
    perishable: boolean;
    expiry_hours: number;
  }[];
  driver: string;
  route_distance_km: number;
  last_reroute_timestamp: string;
}

interface HeatZone {
  lat: number;
  lng: number;
  severity: 'low' | 'medium' | 'high';
  radius: number;
}

interface DashboardSummary {
  total_deliveries: number;
  delayed_deliveries: number;
  critical_stockouts: number;
  perishable_risks: number;
  active_vehicles: number;
}

interface DeliveryStats {
  time_blocks: string[];
  avg_delays: number[];
}

interface Alert {
  id: string;
  type: 'congestion' | 'perishable' | 'demand_surge' | 'stockout';
  message: string;
  severity: 'high' | 'medium' | 'low';
  timestamp: string;
  vehicle_id?: string;
  action_required: boolean;
}

interface TrafficData {
  vehicles: Vehicle[];
  heat_zones: HeatZone[];
  dashboard_summary: DashboardSummary;
  delivery_stats: DeliveryStats;
  alerts: Alert[];
}

const TrafficAwareSmartDashboard = () => {
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [timeRange, setTimeRange] = useState('live');
  const [showTrafficHeatmap, setShowTrafficHeatmap] = useState(true);
  const [showVehicleRoutes, setShowVehicleRoutes] = useState(true);
  const [showWarehousePins, setShowWarehousePins] = useState(true);
  const [congestionFilter, setCongestionFilter] = useState('all');
  const [zoneFilter, setZoneFilter] = useState('all');
  const [deliveryTypeFilter, setDeliveryTypeFilter] = useState('all');
  const [mapContainer]= useState(useRef<HTMLDivElement>(null));

  useEffect(() => {
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
    const map = new mapboxgl.Map({
      container: mapContainer.current!,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [77.5946, 12.9716],
      zoom: 11,
    });
    return () => map.remove();
  }, []);

  // Mock data based on the sample payload
  const mockData: TrafficData = {
    vehicles: [
      {
        truck_id: "TR-092",
        lat: 12.941,
        lng: 77.612,
        route_polyline: [[12.941, 77.612], [12.945, 77.615], [12.950, 77.620]],
        current_congestion_level: "high",
        delayed_minutes: 17,
        eta_minutes: 45,
        items_onboard: [
          { item: "Yogurt", perishable: true, expiry_hours: 6 },
          { item: "Toilet Paper", perishable: false, expiry_hours: 0 }
        ],
        driver: "Alex Singh",
        route_distance_km: 28.5,
        last_reroute_timestamp: "2025-01-15T14:30:00Z"
      },
      {
        truck_id: "TR-045",
        lat: 12.935,
        lng: 77.605,
        route_polyline: [[12.935, 77.605], [12.940, 77.610], [12.945, 77.615]],
        current_congestion_level: "medium",
        delayed_minutes: 8,
        eta_minutes: 32,
        items_onboard: [
          { item: "Fresh Milk", perishable: true, expiry_hours: 12 },
          { item: "Bread", perishable: true, expiry_hours: 8 }
        ],
        driver: "Priya Sharma",
        route_distance_km: 22.3,
        last_reroute_timestamp: "2025-01-15T14:25:00Z"
      },
      {
        truck_id: "TR-078",
        lat: 12.950,
        lng: 77.625,
        route_polyline: [[12.950, 77.625], [12.955, 77.630], [12.960, 77.635]],
        current_congestion_level: "low",
        delayed_minutes: 2,
        eta_minutes: 18,
        items_onboard: [
          { item: "Canned Goods", perishable: false, expiry_hours: 0 },
          { item: "Paper Towels", perishable: false, expiry_hours: 0 }
        ],
        driver: "Rajesh Kumar",
        route_distance_km: 15.7,
        last_reroute_timestamp: "2025-01-15T14:20:00Z"
      }
    ],
    heat_zones: [
      { lat: 12.940, lng: 77.610, severity: "high", radius: 500 },
      { lat: 12.945, lng: 77.615, severity: "medium", radius: 300 },
      { lat: 12.950, lng: 77.620, severity: "low", radius: 200 }
    ],
    dashboard_summary: {
      total_deliveries: 192,
      delayed_deliveries: 27,
      critical_stockouts: 11,
      perishable_risks: 8,
      active_vehicles: 35
    },
    delivery_stats: {
      time_blocks: ["11 AM", "12 PM", "1 PM", "2 PM", "3 PM", "4 PM"],
      avg_delays: [2, 7, 15, 9, 12, 8]
    },
    alerts: [
      {
        id: "1",
        type: "congestion",
        message: "Truck TR-092 is stuck in heavy congestion — reroute?",
        severity: "high",
        timestamp: "2025-01-15T14:35:00Z",
        vehicle_id: "TR-092",
        action_required: true
      },
      {
        id: "2",
        type: "perishable",
        message: "5 perishables onboard will expire within 6 hours",
        severity: "medium",
        timestamp: "2025-01-15T14:30:00Z",
        vehicle_id: "TR-045",
        action_required: true
      },
      {
        id: "3",
        type: "demand_surge",
        message: "Demand surge in Zone B: +37% orders today",
        severity: "low",
        timestamp: "2025-01-15T14:25:00Z",
        action_required: false
      }
    ]
  };

  const filteredVehicles = mockData.vehicles.filter(vehicle => {
    const matchesCongestion = congestionFilter === 'all' || vehicle.current_congestion_level === congestionFilter;
    const matchesDeliveryType = deliveryTypeFilter === 'all' || 
      (deliveryTypeFilter === 'perishable' && vehicle.items_onboard.some(item => item.perishable)) ||
      (deliveryTypeFilter === 'non-perishable' && vehicle.items_onboard.every(item => !item.perishable));
    
    return matchesCongestion && matchesDeliveryType;
  });

  const getCongestionColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-50 border-red-200 text-red-800';
      case 'medium': return 'bg-amber-50 border-amber-200 text-amber-800';
      case 'low': return 'bg-blue-50 border-blue-200 text-blue-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setIsRefreshing(false);
      setLastUpdated(new Date());
    }, 2000);
  };

  const formatETA = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getDeliveryStatusPercentage = () => {
    const onTime = mockData.dashboard_summary.total_deliveries - mockData.dashboard_summary.delayed_deliveries;
    return (onTime / mockData.dashboard_summary.total_deliveries) * 100;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <NavigationHeader />
      <div className="max-w-7xl mx-auto p-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Traffic-Aware Smart Dashboard</h1>
          <p className="text-gray-600">Real-time supply chain operations with traffic intelligence</p>
        </div>

        {/* Controls Bar */}
        <Card className="mb-6 shadow-lg border-0">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Label htmlFor="traffic-heatmap" className="text-sm font-medium">Traffic Heatmap</Label>
                  <Switch
                    id="traffic-heatmap"
                    checked={showTrafficHeatmap}
                    onCheckedChange={setShowTrafficHeatmap}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="vehicle-routes" className="text-sm font-medium">Vehicle Routes</Label>
                  <Switch
                    id="vehicle-routes"
                    checked={showVehicleRoutes}
                    onCheckedChange={setShowVehicleRoutes}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="warehouse-pins" className="text-sm font-medium">Warehouse Pins</Label>
                  <Switch
                    id="warehouse-pins"
                    checked={showWarehousePins}
                    onCheckedChange={setShowWarehousePins}
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="live">Live</SelectItem>
                    <SelectItem value="6h">Last 6h</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
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

                <div className="text-sm text-gray-500">
                  Last Updated: {lastUpdated.toLocaleTimeString()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Map Section */}
          <div className="lg:col-span-3">
            <Card className="shadow-lg border-0 h-[600px]">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    Live Traffic-Aware Map
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-green-600 border-green-200">
                      {filteredVehicles.length} Active Vehicles
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0 h-[calc(100%-80px)]">
                <div style={{ position: "relative", width: "100%", height: "100%" }}>
                  {/* Mapbox Map Container */}
                  <div ref={mapContainer} style={{ width: "100%", height: "100%", borderRadius: "12px", position: "absolute", top: 0, left: 0, zIndex: 0 }} />
                  {/* Map Controls Overlay (Legend) */}
                  <div className="absolute top-4 left-4 space-y-2" style={{ zIndex: 2 }}>
                    <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-sm">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span className="text-sm font-medium">High Congestion</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-sm">
                      <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                      <span className="text-sm font-medium">Medium Congestion</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-sm">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-sm font-medium">Low Congestion</span>
                    </div>
                  </div>                  
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-4">
            {/* Summary Metrics */}
            <Card className="shadow-lg border-0">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  Supply Chain KPIs
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{mockData.dashboard_summary.total_deliveries}</div>
                    <div className="text-xs text-gray-600">Total Deliveries</div>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{mockData.dashboard_summary.delayed_deliveries}</div>
                    <div className="text-xs text-gray-600">Delayed</div>
                  </div>
                  <div className="text-center p-3 bg-amber-50 rounded-lg">
                    <div className="text-2xl font-bold text-amber-600">{mockData.dashboard_summary.critical_stockouts}</div>
                    <div className="text-xs text-gray-600">Stockouts</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{mockData.dashboard_summary.perishable_risks}</div>
                    <div className="text-xs text-gray-600">Perishable Risks</div>
                  </div>
                </div>

                {/* Delivery Status Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>On-Time Delivery Rate</span>
                    <span>{getDeliveryStatusPercentage().toFixed(1)}%</span>
                  </div>
                  <Progress value={getDeliveryStatusPercentage()} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Congestion Timeline */}
            <Card className="shadow-lg border-0">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  Congestion Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockData.delivery_stats.time_blocks.map((time, index) => (
                    <div key={time} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{time}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              mockData.delivery_stats.avg_delays[index] > 10 ? 'bg-red-500' :
                              mockData.delivery_stats.avg_delays[index] > 5 ? 'bg-amber-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${(mockData.delivery_stats.avg_delays[index] / 20) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500">{mockData.delivery_stats.avg_delays[index]}m</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Alerts Feed */}
            <Card className="shadow-lg border-0">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Bell className="h-5 w-5 text-blue-600" />
                  Live Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {mockData.alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-3 rounded-lg border ${getAlertColor(alert.severity)}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{alert.message}</p>
                          <p className="text-xs opacity-75 mt-1">
                            {new Date(alert.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                        {alert.action_required && (
                          <Button size="sm" variant="outline" className="ml-2">
                            Action
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom Section - Vehicle Details */}
        <div className="mt-6">
          <Card className="shadow-lg border-0">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Truck className="h-5 w-5 text-blue-600" />
                  Active Vehicles ({filteredVehicles.length})
                </CardTitle>
                <div className="flex items-center gap-4">
                  <Select value={congestionFilter} onValueChange={setCongestionFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Congestion" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={deliveryTypeFilter} onValueChange={setDeliveryTypeFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="perishable">Perishable</SelectItem>
                      <SelectItem value="non-perishable">Non-Perishable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredVehicles.map((vehicle) => (
                  <Card
                    key={vehicle.truck_id}
                    className={`cursor-pointer transition-all duration-200 border-0 shadow-md hover:shadow-lg hover:scale-[1.02] ${
                      selectedVehicle === vehicle.truck_id ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedVehicle(selectedVehicle === vehicle.truck_id ? null : vehicle.truck_id)}
                  >
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${
                              vehicle.current_congestion_level === 'high' ? 'bg-red-100' :
                              vehicle.current_congestion_level === 'medium' ? 'bg-amber-100' : 'bg-green-100'
                            }`}>
                              <Truck className={`h-4 w-4 ${
                                vehicle.current_congestion_level === 'high' ? 'text-red-600' :
                                vehicle.current_congestion_level === 'medium' ? 'text-amber-600' : 'text-green-600'
                              }`} />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{vehicle.truck_id}</h3>
                              <p className="text-sm text-gray-600">{vehicle.driver}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge 
                              variant="outline" 
                              className={`${getCongestionColor(vehicle.current_congestion_level)}`}
                            >
                              {vehicle.current_congestion_level}
                            </Badge>
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span>ETA: {formatETA(vehicle.eta_minutes)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span>{vehicle.route_distance_km} km</span>
                          </div>
                          {vehicle.delayed_minutes > 0 && (
                            <div className="flex items-center gap-2 col-span-2">
                              <AlertTriangle className="h-4 w-4 text-red-500" />
                              <span className="text-red-600">Delayed: {vehicle.delayed_minutes}m</span>
                            </div>
                          )}
                        </div>

                        {/* Items Onboard */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-gray-400" />
                            <span className="text-sm font-medium">Items Onboard ({vehicle.items_onboard.length})</span>
                          </div>
                          <div className="space-y-1">
                            {vehicle.items_onboard.slice(0, 2).map((item, index) => (
                              <div key={index} className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-1">
                                  {item.perishable && <IceCreamCone className="h-3 w-3 text-blue-500" />}
                                  <span>{item.item}</span>
                                </div>
                                {item.perishable && (
                                  <Badge variant="outline" className="text-xs">
                                    {item.expiry_hours}h
                                  </Badge>
                                )}
                              </div>
                            ))}
                            {vehicle.items_onboard.length > 2 && (
                              <div className="text-xs text-gray-500">
                                +{vehicle.items_onboard.length - 2} more items
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        {selectedVehicle === vehicle.truck_id && (
                          <div className="flex gap-2 pt-2 border-t border-gray-200">
                            <Button size="sm" variant="outline" className="flex-1">
                              <Route className="h-3 w-3 mr-1" />
                              Reroute
                            </Button>
                            <Button size="sm" variant="outline" className="flex-1">
                              <Eye className="h-3 w-3 mr-1" />
                              Details
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TrafficAwareSmartDashboard; 