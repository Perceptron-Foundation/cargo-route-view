import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Area,
  AreaChart
} from 'recharts';
import { 
  Brain, 
  Truck, 
  Clock, 
  Server, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  BarChart3,
  MapPin,
  Package,
  Zap,
  Wifi,
  WifiOff,
  Activity
} from 'lucide-react';

// Types
interface DemandForecast {
  date: string;
  zone: string;
  category: string;
  predicted_volume: number;
  confidence_range: [number, number];
  historical_avg: number;
}

interface TruckLoad {
  truck_id: string;
  capacity: number;
  occupied: number;
  items: Array<{
    name: string;
    volume: number;
    urgency: 'High' | 'Medium' | 'Low';
    perishable: boolean;
  }>;
  load_score: number;
}

interface DeliveryWindow {
  truck_id: string;
  store_id: string;
  store_name: string;
  delivery_eta: string;
  allowed_window: [string, string];
  compliance: boolean;
  delay_risk_score: number;
}

interface ApiStatus {
  service: string;
  status: 'Online' | 'Warning' | 'Offline';
  last_sync: string;
  error?: string;
}

interface PredictiveLogisticsData {
  demand_forecast: DemandForecast[];
  truck_loads: TruckLoad[];
  delivery_windows: DeliveryWindow[];
  api_status: ApiStatus[];
}

interface PredictiveLogisticsIntelligencePanelProps {
  data: PredictiveLogisticsData;
  onOptimizeLoad?: (truckId: string) => void;
  onReconnectApi?: (service: string) => void;
  onViewRouteSchedule?: (truckId: string) => void;
}

const PredictiveLogisticsIntelligencePanel: React.FC<PredictiveLogisticsIntelligencePanelProps> = ({
  data,
  onOptimizeLoad,
  onReconnectApi,
  onViewRouteSchedule
}) => {
  const [selectedZone, setSelectedZone] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showConfidenceBands, setShowConfidenceBands] = useState(true);
  const [selectedTruck, setSelectedTruck] = useState<string>('All');
  const [showNonCompliantOnly, setShowNonCompliantOnly] = useState(false);
  const [viewByRegion, setViewByRegion] = useState(true);

  // Filter demand forecast data
  const filteredDemandData = useMemo(() => {
    return data.demand_forecast.filter(item => {
      const matchesZone = selectedZone === 'All' || item.zone === selectedZone;
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      return matchesZone && matchesCategory;
    });
  }, [data.demand_forecast, selectedZone, selectedCategory]);

  // Get unique zones and categories for filters
  const zones = useMemo(() => {
    const uniqueZones = [...new Set(data.demand_forecast.map(item => item.zone))];
    return ['All', ...uniqueZones];
  }, [data.demand_forecast]);

  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(data.demand_forecast.map(item => item.category))];
    return ['All', ...uniqueCategories];
  }, [data.demand_forecast]);

  const trucks = useMemo(() => {
    const uniqueTrucks = [...new Set(data.delivery_windows.map(window => window.truck_id))];
    return ['All', ...uniqueTrucks];
  }, [data.delivery_windows]);

  // Filter delivery windows
  const filteredDeliveryWindows = useMemo(() => {
    return data.delivery_windows.filter(window => {
      const matchesTruck = selectedTruck === 'All' || window.truck_id === selectedTruck;
      const matchesCompliance = !showNonCompliantOnly || !window.compliance;
      return matchesTruck && matchesCompliance;
    });
  }, [data.delivery_windows, selectedTruck, showNonCompliantOnly]);

  // Helper functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Online': return 'bg-green-100 text-green-800 border-green-200';
      case 'Warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Offline': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'High': return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getLoadScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Predictive Logistics Intelligence Panel</h1>
            <p className="text-gray-600 mt-1">AI-powered demand forecasting, load optimization & delivery planning</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500">
              Last Updated: {new Date().toLocaleTimeString()}
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Refresh Data
            </Button>
          </div>
        </div>

        <Tabs defaultValue="demand" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="demand" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              AI Demand Forecast
            </TabsTrigger>
            <TabsTrigger value="load" className="flex items-center gap-2">
              <Truck className="w-4 h-4" />
              Load Optimization
            </TabsTrigger>
            <TabsTrigger value="windows" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Time Windows
            </TabsTrigger>
            <TabsTrigger value="api" className="flex items-center gap-2">
              <Server className="w-4 h-4" />
              API Status
            </TabsTrigger>
          </TabsList>

          {/* AI Demand Forecasting */}
          <TabsContent value="demand" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Brain className="w-5 h-5 text-blue-600" />
                    AI Demand Forecast (Next 7 Days)
                  </CardTitle>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Model:</span>
                      <Badge variant="outline">LSTM v2.1</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Confidence Bands:</span>
                      <Switch checked={showConfidenceBands} onCheckedChange={setShowConfidenceBands} />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Filters */}
                <div className="flex gap-4 mb-6">
                  <Select value={selectedZone} onValueChange={setSelectedZone}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Select Zone" />
                    </SelectTrigger>
                    <SelectContent>
                      {zones.map(zone => (
                        <SelectItem key={zone} value={zone}>{zone}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Chart */}
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={filteredDemandData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={formatDate}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip 
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-white p-3 border rounded-lg shadow-lg">
                                <p className="font-medium">{formatDate(label)}</p>
                                <p className="text-sm text-gray-600">
                                  Predicted: {data.predicted_volume} units
                                </p>
                                <p className="text-sm text-gray-600">
                                  Historical Avg: {data.historical_avg} units
                                </p>
                                <p className="text-sm text-gray-600">
                                  Growth: {((data.predicted_volume - data.historical_avg) / data.historical_avg * 100).toFixed(1)}%
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Legend />
                      {showConfidenceBands && (
                        <Area
                          type="monotone"
                          dataKey="confidence_range"
                          stroke="#8884d8"
                          fill="#8884d8"
                          fillOpacity={0.1}
                          strokeDasharray="5 5"
                        />
                      )}
                      <Line
                        type="monotone"
                        dataKey="predicted_volume"
                        stroke="#2563eb"
                        strokeWidth={3}
                        dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Load Optimization */}
          <TabsContent value="load" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Truck className="w-5 h-5 text-blue-600" />
                  Truck Load Planner
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {data.truck_loads.map((truck) => (
                    <Card key={truck.truck_id} className="border-2 hover:border-blue-300 transition-colors">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-lg">{truck.truck_id}</CardTitle>
                          <Badge className={getLoadScoreColor(truck.load_score)}>
                            Score: {truck.load_score}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Capacity Progress */}
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span>Capacity Usage</span>
                            <span>{truck.occupied}/{truck.capacity} m³</span>
                          </div>
                          <Progress 
                            value={(truck.occupied / truck.capacity) * 100} 
                            className="h-2"
                          />
                        </div>

                        {/* Items List */}
                        <div>
                          <h4 className="font-medium text-sm mb-2">Assigned Items:</h4>
                          <div className="space-y-2">
                            {truck.items.map((item, index) => (
                              <div key={index} className="flex justify-between items-center text-sm">
                                <div className="flex items-center gap-2">
                                  <Package className="w-3 h-3 text-gray-500" />
                                  <span className="truncate">{item.name}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Badge variant="outline" className="text-xs">
                                    {item.volume}m³
                                  </Badge>
                                  <Badge className={`text-xs ${getUrgencyColor(item.urgency)}`}>
                                    {item.urgency}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-2">
                          <Button 
                            size="sm" 
                            className="flex-1"
                            onClick={() => onOptimizeLoad?.(truck.truck_id)}
                          >
                            <Zap className="w-3 h-3 mr-1" />
                            Optimize Load
                          </Button>
                          <Button size="sm" variant="outline">
                            <BarChart3 className="w-3 h-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Load Distribution Chart */}
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="text-lg">Load Distribution by Truck</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data.truck_loads}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="truck_id" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="occupied" fill="#2563eb" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Delivery Time Windows */}
          <TabsContent value="windows" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    Delivery Time Window Compliance
                  </CardTitle>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">View by:</span>
                      <Select value={viewByRegion ? 'region' : 'truck'} onValueChange={(value) => setViewByRegion(value === 'region')}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="region">Region</SelectItem>
                          <SelectItem value="truck">Truck</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Non-compliant only:</span>
                      <Switch checked={showNonCompliantOnly} onCheckedChange={setShowNonCompliantOnly} />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Filters */}
                <div className="flex gap-4 mb-6">
                  <Select value={selectedTruck} onValueChange={setSelectedTruck}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Select Truck" />
                    </SelectTrigger>
                    <SelectContent>
                      {trucks.map(truck => (
                        <SelectItem key={truck} value={truck}>{truck}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Time Windows Matrix */}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 font-medium">Truck/Store</th>
                        <th className="text-center p-3 font-medium">8-10 AM</th>
                        <th className="text-center p-3 font-medium">10-12 PM</th>
                        <th className="text-center p-3 font-medium">12-2 PM</th>
                        <th className="text-center p-3 font-medium">2-4 PM</th>
                        <th className="text-center p-3 font-medium">4-6 PM</th>
                        <th className="text-center p-3 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDeliveryWindows.map((window, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="p-3">
                            <div>
                              <div className="font-medium">{window.truck_id}</div>
                              <div className="text-sm text-gray-600">{window.store_name}</div>
                            </div>
                          </td>
                          {['8-10', '10-12', '12-2', '2-4', '4-6'].map((timeSlot) => {
                            const deliveryHour = new Date(window.delivery_eta).getHours();
                            const slotStart = parseInt(timeSlot.split('-')[0]);
                            const slotEnd = parseInt(timeSlot.split('-')[1]);
                            const isInSlot = deliveryHour >= slotStart && deliveryHour < slotEnd;
                            const isCompliant = window.compliance && isInSlot;
                            
                            return (
                              <td key={timeSlot} className="p-3 text-center">
                                {isInSlot ? (
                                  <div className="flex flex-col items-center gap-1">
                                    {isCompliant ? (
                                      <CheckCircle className="w-5 h-5 text-green-600" />
                                    ) : (
                                      <XCircle className="w-5 h-5 text-red-600" />
                                    )}
                                    <span className="text-xs text-gray-600">
                                      {formatTime(window.delivery_eta)}
                                    </span>
                                    <Badge 
                                      variant="outline" 
                                      className={`text-xs ${window.delay_risk_score > 70 ? 'border-red-300 text-red-700' : 'border-green-300 text-green-700'}`}
                                    >
                                      Risk: {window.delay_risk_score}%
                                    </Badge>
                                  </div>
                                ) : (
                                  <span className="text-gray-300">-</span>
                                )}
                              </td>
                            );
                          })}
                          <td className="p-3">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => onViewRouteSchedule?.(window.truck_id)}
                            >
                              <MapPin className="w-3 h-3 mr-1" />
                              View Route
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* API Status */}
          <TabsContent value="api" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Server className="w-5 h-5 text-blue-600" />
                  API Integration Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data.api_status.map((api) => (
                    <Card key={api.service} className="border-2">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-base">{api.service}</CardTitle>
                          <div className="flex items-center gap-2">
                            {api.status === 'Online' ? (
                              <Wifi className="w-4 h-4 text-green-600" />
                            ) : api.status === 'Warning' ? (
                              <Activity className="w-4 h-4 text-yellow-600" />
                            ) : (
                              <WifiOff className="w-4 h-4 text-red-600" />
                            )}
                            <Badge className={getStatusColor(api.status)}>
                              {api.status}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="text-sm text-gray-600">
                          Last Sync: {new Date(api.last_sync).toLocaleString()}
                        </div>
                        {api.error && (
                          <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                            {api.error}
                          </div>
                        )}
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => onReconnectApi?.(api.service)}
                          >
                            Reconnect
                          </Button>
                          {api.status !== 'Online' && (
                            <Button size="sm" variant="outline">
                              View Logs
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PredictiveLogisticsIntelligencePanel; 