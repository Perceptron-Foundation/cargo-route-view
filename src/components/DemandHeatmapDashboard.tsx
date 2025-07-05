import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, AlertTriangle } from "lucide-react";

interface StoreData {
  store_id: string;
  lat: number;
  lng: number;
  store_name: string;
  current_demand_score: number;
  top_requested_items: Array<{
    item: string;
    quantity: number;
    perishable: boolean;
    shelf_hours_left?: number;
  }>;
  has_stockout: boolean;
}

interface PerishableItem {
  item: string;
  urgency: "Critical" | "Medium" | "Normal";
  shelf_life_remaining_hrs: number;
  destination_store: string;
  route_id: string;
}

const DemandHeatmapDashboard = () => {
  const [selectedStore, setSelectedStore] = useState<StoreData | null>(null);
  const [showPerishablePanel, setShowPerishablePanel] = useState(false);
  const [demandThreshold, setDemandThreshold] = useState([20]);
  const [perishabilityFilter, setPerishabilityFilter] = useState("All");
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showPerishableOverlay, setShowPerishableOverlay] = useState(true);
  const [showStockoutPins, setShowStockoutPins] = useState(true);
  const [timeSlider, setTimeSlider] = useState([0]);

  // Mock data
  const storesData: StoreData[] = [
    {
      store_id: "ST001",
      lat: 12.9716,
      lng: 77.5946,
      store_name: "Walmart Koramangala",
      current_demand_score: 95,
      top_requested_items: [
        { item: "Fresh Milk 1L", quantity: 85, perishable: true, shelf_hours_left: 8 },
        { item: "Bread Loaf", quantity: 40, perishable: true, shelf_hours_left: 16 },
        { item: "Detergent", quantity: 22, perishable: false }
      ],
      has_stockout: true
    },
    {
      store_id: "ST002",
      lat: 12.9352,
      lng: 77.6245,
      store_name: "BigBasket BTM",
      current_demand_score: 78,
      top_requested_items: [
        { item: "Yogurt 250ml", quantity: 60, perishable: true, shelf_hours_left: 6 },
        { item: "Fresh Vegetables", quantity: 45, perishable: true, shelf_hours_left: 12 }
      ],
      has_stockout: false
    },
    {
      store_id: "ST003",
      lat: 12.9145,
      lng: 77.6340,
      store_name: "More Store JP Nagar",
      current_demand_score: 65,
      top_requested_items: [
        { item: "Chicken 1kg", quantity: 30, perishable: true, shelf_hours_left: 4 },
        { item: "Rice 5kg", quantity: 25, perishable: false }
      ],
      has_stockout: false
    }
  ];

  const perishableItems: PerishableItem[] = [
    {
      item: "Fresh Milk 1L",
      urgency: "Critical",
      shelf_life_remaining_hrs: 8,
      destination_store: "ST001",
      route_id: "R101"
    },
    {
      item: "Yogurt 250ml",
      urgency: "Critical",
      shelf_life_remaining_hrs: 6,
      destination_store: "ST002",
      route_id: "R102"
    },
    {
      item: "Chicken 1kg",
      urgency: "Critical",
      shelf_life_remaining_hrs: 4,
      destination_store: "ST003",
      route_id: "R103"
    }
  ];

  const filteredStores = useMemo(() => {
    return storesData.filter(store => store.current_demand_score >= demandThreshold[0]);
  }, [demandThreshold, storesData]);

  const getDemandColor = (score: number) => {
    if (score >= 80) return "bg-red-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "Critical": return "bg-red-100 text-red-800 border-red-200";
      case "Medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default: return "bg-green-100 text-green-800 border-green-200";
    }
  };

  const getShelfLifePercentage = (hours: number) => {
    const maxHours = 48; // Assuming 48 hours as max shelf life
    return Math.max(0, (hours / maxHours) * 100);
  };

  // Deterministic marker placement for demo (not production!)
  const getMarkerPosition = (store: StoreData) => {
    // Only for mock/demo: Use store_id numbers to generate positions
    const num = parseInt(store.store_id.replace(/\D/g, "")) || 1;
    return {
      left: `${20 + (num * 13) % 60}%`,
      top: `${20 + (num * 23) % 60}%`
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Demand Heatmap & Perishability Monitor</h1>
            <p className="text-gray-600 mt-1">Real-time geospatial demand analysis with perishability urgency</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500">
              Last Synced: {new Date().toLocaleTimeString()}
            </div>
            <Button 
              onClick={() => setShowPerishablePanel(!showPerishablePanel)}
              variant={showPerishablePanel ? "default" : "outline"}
              className="flex items-center gap-2"
            >
              <Bell className="w-4 h-4" />
              Perishable Alerts ({perishableItems.filter(item => item.urgency === "Critical").length})
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Panel */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Filters & Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Demand Threshold */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Demand Threshold: {demandThreshold[0]}
                  </label>
                  <Slider
                    value={demandThreshold}
                    onValueChange={setDemandThreshold}
                    max={100}
                    min={0}
                    step={10}
                    className="w-full"
                  />
                </div>

                {/* Layer Toggles */}
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Map Layers</h4>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Demand Heatmap</span>
                    <Switch checked={showHeatmap} onCheckedChange={setShowHeatmap} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Perishable Risk</span>
                    <Switch checked={showPerishableOverlay} onCheckedChange={setShowPerishableOverlay} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Stockout Pins</span>
                    <Switch checked={showStockoutPins} onCheckedChange={setShowStockoutPins} />
                  </div>
                </div>

                {/* Time Travel Slider */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Historical View (Days Ago): {timeSlider[0]}
                  </label>
                  <Slider
                    value={timeSlider}
                    onValueChange={setTimeSlider}
                    max={7}
                    min={0}
                    step={1}
                    className="w-full"
                  />
                </div>

                {/* Legend */}
                <div className="border-t pt-4">
                  <h4 className="font-medium text-sm mb-3">Legend</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded"></div>
                      <span>High Demand (80+)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                      <span>Medium Demand (60-79)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded"></div>
                      <span>Low Demand (&lt;60)</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Map Area */}
          <div className={`${showPerishablePanel ? "lg:col-span-2" : "lg:col-span-3"} transition-all duration-300`}>
            <Card className="h-[600px]">
              <CardContent className="p-0 h-full relative">
                {/* Map Placeholder */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-green-100 rounded-lg overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-gray-400 mb-4">🗺️</div>
                      <p className="text-gray-600 font-medium">Interactive Demand Heatmap</p>
                      <p className="text-gray-500 text-sm">Map integration ready for Mapbox/Google Maps</p>
                    </div>
                  </div>

                  {/* Store Markers */}
                  {filteredStores.map((store) => {
                    const pos = getMarkerPosition(store);
                    return (
                      <div
                        key={store.store_id}
                        className={`absolute w-8 h-8 rounded-full ${getDemandColor(store.current_demand_score)} 
                          cursor-pointer transform -translate-x-4 -translate-y-4 flex items-center justify-center
                          hover:scale-110 transition-transform shadow-lg border-2 border-white`}
                        style={pos}
                        onClick={() => setSelectedStore(store)}
                        title={`${store.store_name} - Demand: ${store.current_demand_score}`}
                      >
                        <span className="text-white text-xs font-bold">{store.current_demand_score}</span>
                        {store.has_stockout && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-600 rounded-full border border-white">
                            <AlertTriangle className="w-2 h-2 text-white" />
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Heatmap Overlay */}
                  {showHeatmap && (
                    <div className="absolute inset-0 bg-gradient-radial from-red-300/30 via-yellow-300/20 to-transparent"></div>
                  )}
                </div>

                {/* Store Details Popup */}
                {selectedStore && (
                  <div className="absolute top-4 left-4 bg-white rounded-lg shadow-xl p-4 max-w-xs z-10 border">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-sm">{selectedStore.store_name}</h3>
                      <button 
                        onClick={() => setSelectedStore(null)}
                        className="text-gray-400 hover:text-gray-600"
                      >×</button>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span>Demand Score:</span>
                        <Badge className={getDemandColor(selectedStore.current_demand_score)}>
                          {selectedStore.current_demand_score}
                        </Badge>
                      </div>
                      <div>
                        <span className="font-medium">Top Items:</span>
                        <ul className="mt-1 space-y-1">
                          {selectedStore.top_requested_items.slice(0, 3).map((item, idx) => (
                            <li key={idx} className="flex justify-between">
                              <span className={item.perishable ? "text-orange-600" : ""}>{item.item}</span>
                              <span className="text-gray-500">{item.quantity}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      {selectedStore.has_stockout && (
                        <div className="bg-red-50 text-red-700 p-2 rounded text-xs">
                          ⚠️ Stockout Alert
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Perishable Items Panel */}
          {showPerishablePanel && (
            <div className="lg:col-span-1">
              <Card className="h-[600px]">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    Perishable Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 overflow-y-auto">
                  {perishableItems.map((item, index) => (
                    <div key={index} className="border rounded-lg p-3 space-y-3">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium text-sm">{item.item}</h4>
                        <Badge className={`text-xs ${getUrgencyColor(item.urgency)}`}>
                          {item.urgency}
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-gray-600">
                          <span>Shelf Life</span>
                          <span>{item.shelf_life_remaining_hrs}h left</span>
                        </div>
                        
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all ${
                              item.shelf_life_remaining_hrs < 8 ? "bg-red-500" : 
                              item.shelf_life_remaining_hrs < 24 ? "bg-yellow-500" : "bg-green-500"
                            }`}
                            style={{ width: `${getShelfLifePercentage(item.shelf_life_remaining_hrs)}%` }}
                          ></div>
                        </div>

                        <div className="text-xs text-gray-500">
                          Destination: {storesData.find(s => s.store_id === item.destination_store)?.store_name}
                        </div>

                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="text-xs flex-1">
                            View Route
                          </Button>
                          <Button size="sm" className="text-xs flex-1">
                            Re-prioritize
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="pt-4 border-t">
                    <Button className="w-full" variant="destructive">
                      Emergency Restock Protocol
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Critical Alerts</p>
                  <p className="text-2xl font-bold text-red-600">
                    {perishableItems.filter(item => item.urgency === "Critical").length}
                  </p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">High Demand Stores</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {storesData.filter(store => store.current_demand_score >= 80).length}
                  </p>
                </div>
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">🔥</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Stockout Locations</p>
                  <p className="text-2xl font-bold text-red-600">
                    {storesData.filter(store => store.has_stockout).length}
                  </p>
                </div>
                <Bell className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Demand Score</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {Math.round(storesData.reduce((acc, store) => acc + store.current_demand_score, 0) / storesData.length)}
                  </p>
                </div>
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">📊</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DemandHeatmapDashboard;
