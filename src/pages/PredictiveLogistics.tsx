import React from 'react';
import PredictiveLogisticsIntelligencePanel from '@/components/PredictiveLogisticsIntelligencePanel';
import NavigationHeader from '@/components/NavigationHeader';

// Import the type from the component file
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

// Sample data for demonstration
const sampleData: PredictiveLogisticsData = {
  demand_forecast: [
    {
      date: "2025-01-06",
      zone: "Southwest",
      category: "Dairy",
      predicted_volume: 820,
      confidence_range: [780, 860] as [number, number],
      historical_avg: 740
    },
    {
      date: "2025-01-07",
      zone: "Southwest",
      category: "Dairy",
      predicted_volume: 890,
      confidence_range: [850, 930],
      historical_avg: 780
    },
    {
      date: "2025-01-08",
      zone: "Southwest",
      category: "Dairy",
      predicted_volume: 760,
      confidence_range: [720, 800],
      historical_avg: 720
    },
    {
      date: "2025-01-09",
      zone: "Southwest",
      category: "Dairy",
      predicted_volume: 950,
      confidence_range: [910, 990],
      historical_avg: 820
    },
    {
      date: "2025-01-10",
      zone: "Southwest",
      category: "Dairy",
      predicted_volume: 880,
      confidence_range: [840, 920],
      historical_avg: 760
    },
    {
      date: "2025-01-11",
      zone: "Southwest",
      category: "Dairy",
      predicted_volume: 920,
      confidence_range: [880, 960],
      historical_avg: 800
    },
    {
      date: "2025-01-12",
      zone: "Southwest",
      category: "Dairy",
      predicted_volume: 850,
      confidence_range: [810, 890],
      historical_avg: 750
    },
    {
      date: "2025-01-06",
      zone: "Northeast",
      category: "Produce",
      predicted_volume: 650,
      confidence_range: [620, 680],
      historical_avg: 580
    },
    {
      date: "2025-01-07",
      zone: "Northeast",
      category: "Produce",
      predicted_volume: 720,
      confidence_range: [690, 750],
      historical_avg: 640
    },
    {
      date: "2025-01-08",
      zone: "Northeast",
      category: "Produce",
      predicted_volume: 680,
      confidence_range: [650, 710],
      historical_avg: 600
    },
    {
      date: "2025-01-09",
      zone: "Northeast",
      category: "Produce",
      predicted_volume: 780,
      confidence_range: [750, 810],
      historical_avg: 680
    },
    {
      date: "2025-01-10",
      zone: "Northeast",
      category: "Produce",
      predicted_volume: 710,
      confidence_range: [680, 740],
      historical_avg: 620
    },
    {
      date: "2025-01-11",
      zone: "Northeast",
      category: "Produce",
      predicted_volume: 750,
      confidence_range: [720, 780],
      historical_avg: 660
    },
    {
      date: "2025-01-12",
      zone: "Northeast",
      category: "Produce",
      predicted_volume: 690,
      confidence_range: [660, 720],
      historical_avg: 600
    }
  ],
  truck_loads: [
    {
      truck_id: "TR001",
      capacity: 120,
      occupied: 78,
      items: [
        { name: "Fresh Milk 1L", volume: 12, urgency: "High", perishable: true },
        { name: "Yogurt 250ml", volume: 8, urgency: "High", perishable: true },
        { name: "Cheese 500g", volume: 15, urgency: "Medium", perishable: true },
        { name: "Butter 250g", volume: 6, urgency: "Low", perishable: true },
        { name: "Cream 200ml", volume: 10, urgency: "High", perishable: true },
        { name: "Ice Cream 1L", volume: 27, urgency: "Medium", perishable: true }
      ],
      load_score: 89
    },
    {
      truck_id: "TR002",
      capacity: 100,
      occupied: 92,
      items: [
        { name: "Apples 1kg", volume: 20, urgency: "Medium", perishable: true },
        { name: "Bananas 2kg", volume: 15, urgency: "High", perishable: true },
        { name: "Tomatoes 1kg", volume: 12, urgency: "High", perishable: true },
        { name: "Lettuce 500g", volume: 8, urgency: "High", perishable: true },
        { name: "Carrots 1kg", volume: 10, urgency: "Low", perishable: true },
        { name: "Potatoes 5kg", volume: 27, urgency: "Low", perishable: true }
      ],
      load_score: 76
    },
    {
      truck_id: "TR003",
      capacity: 150,
      occupied: 45,
      items: [
        { name: "Bread Loaf", volume: 15, urgency: "Medium", perishable: true },
        { name: "Cereal 500g", volume: 12, urgency: "Low", perishable: false },
        { name: "Pasta 1kg", volume: 18, urgency: "Low", perishable: false }
      ],
      load_score: 45
    },
    {
      truck_id: "TR004",
      capacity: 80,
      occupied: 65,
      items: [
        { name: "Chicken 1kg", volume: 25, urgency: "High", perishable: true },
        { name: "Beef 1kg", volume: 20, urgency: "Medium", perishable: true },
        { name: "Fish 500g", volume: 20, urgency: "High", perishable: true }
      ],
      load_score: 82
    }
  ],
  delivery_windows: [
    {
      truck_id: "TR001",
      store_id: "ST005",
      store_name: "Walmart Downtown",
      delivery_eta: "2025-01-06T10:45:00",
      allowed_window: ["2025-01-06T10:00:00", "2025-01-06T12:00:00"],
      compliance: true,
      delay_risk_score: 15
    },
    {
      truck_id: "TR001",
      store_id: "ST012",
      store_name: "Target Mall",
      delivery_eta: "2025-01-06T14:30:00",
      allowed_window: ["2025-01-06T14:00:00", "2025-01-06T16:00:00"],
      compliance: true,
      delay_risk_score: 25
    },
    {
      truck_id: "TR002",
      store_id: "ST008",
      store_name: "Kroger Express",
      delivery_eta: "2025-01-06T11:15:00",
      allowed_window: ["2025-01-06T10:00:00", "2025-01-06T12:00:00"],
      compliance: true,
      delay_risk_score: 35
    },
    {
      truck_id: "TR002",
      store_id: "ST015",
      store_name: "Safeway Central",
      delivery_eta: "2025-01-06T15:45:00",
      allowed_window: ["2025-01-06T14:00:00", "2025-01-06T16:00:00"],
      compliance: false,
      delay_risk_score: 85
    },
    {
      truck_id: "TR003",
      store_id: "ST003",
      store_name: "Whole Foods Market",
      delivery_eta: "2025-01-06T09:30:00",
      allowed_window: ["2025-01-06T08:00:00", "2025-01-06T10:00:00"],
      compliance: true,
      delay_risk_score: 20
    },
    {
      truck_id: "TR004",
      store_id: "ST020",
      store_name: "Trader Joe's",
      delivery_eta: "2025-01-06T13:20:00",
      allowed_window: ["2025-01-06T12:00:00", "2025-01-06T14:00:00"],
      compliance: true,
      delay_risk_score: 40
    }
  ],
  api_status: [
    { 
      service: "ML_Forecast", 
      status: "Online", 
      last_sync: "2025-01-05T22:01:00" 
    },
    { 
      service: "TrafficAPI", 
      status: "Warning", 
      last_sync: "2025-01-05T21:47:00", 
      error: "Rate Limit Hit" 
    },
    { 
      service: "WMS", 
      status: "Online", 
      last_sync: "2025-01-05T22:15:00" 
    },
    { 
      service: "ERP", 
      status: "Online", 
      last_sync: "2025-01-05T22:10:00" 
    },
    { 
      service: "RouteOptimizer", 
      status: "Offline", 
      last_sync: "2025-01-05T20:30:00", 
      error: "Service Unavailable" 
    },
    { 
      service: "InventorySystem", 
      status: "Online", 
      last_sync: "2025-01-05T22:05:00" 
    }
  ]
};

const PredictiveLogisticsPage = () => {
  const handleOptimizeLoad = (truckId: string) => {
    console.log(`Optimizing load for truck: ${truckId}`);
    // In a real implementation, this would trigger an API call
  };

  const handleReconnectApi = (service: string) => {
    console.log(`Reconnecting to service: ${service}`);
    // In a real implementation, this would trigger a reconnection
  };

  const handleViewRouteSchedule = (truckId: string) => {
    console.log(`Viewing route schedule for truck: ${truckId}`);
    // In a real implementation, this would open a modal or navigate to route details
  };

  return (
    <div>
      <NavigationHeader />
      <PredictiveLogisticsIntelligencePanel
        data={sampleData}
        onOptimizeLoad={handleOptimizeLoad}
        onReconnectApi={handleReconnectApi}
        onViewRouteSchedule={handleViewRouteSchedule}
      />
    </div>
  );
};

export default PredictiveLogisticsPage; 