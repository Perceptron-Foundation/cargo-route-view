
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertTriangle, Bell, Leaf, IceCreamCone } from 'lucide-react';

interface InventoryItem {
  store_id: string;
  store_name: string;
  item_id: string;
  item_name: string;
  quantity: number;
  safety_threshold: number;
  perishable: boolean;
  last_refill_date: string;
  restocking_priority: 'High' | 'Medium' | 'Low';
}

interface InventoryMonitoringDashboardProps {
  inventory?: InventoryItem[];
}

const mockInventoryData: InventoryItem[] = [
  {
    store_id: "ST001",
    store_name: "Walmart - Austin Downtown",
    item_id: "P121",
    item_name: "Fresh Milk 1L",
    quantity: 4,
    safety_threshold: 10,
    perishable: true,
    last_refill_date: "2025-07-01",
    restocking_priority: "High"
  },
  {
    store_id: "ST001",
    store_name: "Walmart - Austin Downtown",
    item_id: "P122",
    item_name: "Organic Bananas",
    quantity: 0,
    safety_threshold: 15,
    perishable: true,
    last_refill_date: "2025-06-30",
    restocking_priority: "High"
  },
  {
    store_id: "ST002",
    store_name: "Target - Houston Central",
    item_id: "NP201",
    item_name: "Canned Beans",
    quantity: 25,
    safety_threshold: 20,
    perishable: false,
    last_refill_date: "2025-07-02",
    restocking_priority: "Medium"
  },
  {
    store_id: "ST003",
    store_name: "HEB - Dallas North",
    item_id: "P123",
    item_name: "Greek Yogurt",
    quantity: 3,
    safety_threshold: 12,
    perishable: true,
    last_refill_date: "2025-07-01",
    restocking_priority: "High"
  },
  {
    store_id: "ST002",
    store_name: "Target - Houston Central",
    item_id: "NP202",
    item_name: "Pasta Sauce",
    quantity: 45,
    safety_threshold: 30,
    perishable: false,
    last_refill_date: "2025-07-03",
    restocking_priority: "Low"
  },
  {
    store_id: "ST004",
    store_name: "Kroger - San Antonio West",
    item_id: "P124",
    item_name: "Fresh Bread",
    quantity: 0,
    safety_threshold: 8,
    perishable: true,
    last_refill_date: "2025-06-29",
    restocking_priority: "High"
  }
];

const InventoryMonitoringDashboard: React.FC<InventoryMonitoringDashboardProps> = ({ 
  inventory = mockInventoryData 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [stockStatusFilter, setStockStatusFilter] = useState('all');
  const [itemTypeFilter, setItemTypeFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  const getStockStatus = (item: InventoryItem) => {
    if (item.quantity === 0) return 'critical';
    if (item.quantity < item.safety_threshold) return 'low';
    return 'healthy';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'bg-red-50 border-l-4 border-red-500';
      case 'low': return 'bg-amber-50 border-l-4 border-amber-500';
      default: return 'bg-green-50 border-l-4 border-green-500';
    }
  };

  const filteredInventory = useMemo(() => {
    return inventory.filter(item => {
      const matchesSearch = item.store_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.item_name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const stockStatus = getStockStatus(item);
      const matchesStockStatus = stockStatusFilter === 'all' || stockStatusFilter === stockStatus;
      
      const matchesItemType = itemTypeFilter === 'all' || 
                             (itemTypeFilter === 'perishable' && item.perishable) ||
                             (itemTypeFilter === 'non-perishable' && !item.perishable);
      
      const matchesPriority = priorityFilter === 'all' || item.restocking_priority === priorityFilter;
      
      return matchesSearch && matchesStockStatus && matchesItemType && matchesPriority;
    });
  }, [inventory, searchTerm, stockStatusFilter, itemTypeFilter, priorityFilter]);

  const storeOverview = useMemo(() => {
    const storeStockouts = inventory.reduce((acc, item) => {
      const status = getStockStatus(item);
      if (status === 'critical' || status === 'low') {
        if (!acc[item.store_id]) {
          acc[item.store_id] = { name: item.store_name, count: 0, critical: 0 };
        }
        acc[item.store_id].count++;
        if (status === 'critical') acc[item.store_id].critical++;
      }
      return acc;
    }, {} as Record<string, { name: string; count: number; critical: number }>);

    return Object.entries(storeStockouts)
      .sort(([,a], [,b]) => b.critical - a.critical || b.count - a.count)
      .slice(0, 3);
  }, [inventory]);

  const alertSummary = useMemo(() => {
    const critical = inventory.filter(item => getStockStatus(item) === 'critical').length;
    const low = inventory.filter(item => getStockStatus(item) === 'low').length;
    const stores = new Set(inventory.filter(item => getStockStatus(item) !== 'healthy').map(item => item.store_id)).size;
    
    return { critical, low, stores };
  }, [inventory]);

  const handleReplenishment = (item: InventoryItem) => {
    console.log('Triggering replenishment for:', item);
    // This would typically trigger an API call
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Inventory Monitoring</h1>
            <p className="text-gray-600 mt-1">Real-time inventory levels across all stores</p>
          </div>
          <div className="text-sm text-gray-500">
            Last Synced: {new Date().toLocaleTimeString()}
          </div>
        </div>

        {/* Store Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {storeOverview.map(([storeId, data]) => (
            <Card key={storeId} className="border-l-4 border-red-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  {data.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Critical Stockouts:</span>
                    <Badge variant="destructive">{data.critical}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Low Stock Items:</span>
                    <Badge variant="secondary">{data.count - data.critical}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Alerts Summary */}
        <Card className="border-l-4 border-amber-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-amber-500" />
              System Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{alertSummary.critical}</div>
                <div className="text-sm text-gray-600">Critical Stockouts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-600">{alertSummary.low}</div>
                <div className="text-sm text-gray-600">Low Stock Items</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{alertSummary.stores}</div>
                <div className="text-sm text-gray-600">Stores Affected</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters & Search</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <Input
                placeholder="Search stores or items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="md:col-span-2"
              />
              <Select value={stockStatusFilter} onValueChange={setStockStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Stock Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="low">Low Stock</SelectItem>
                  <SelectItem value="healthy">Healthy</SelectItem>
                </SelectContent>
              </Select>
              <Select value={itemTypeFilter} onValueChange={setItemTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Item Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="perishable">Perishable</SelectItem>
                  <SelectItem value="non-perishable">Non-perishable</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Inventory Table */}
        <Card>
          <CardHeader>
            <CardTitle>Inventory Overview</CardTitle>
            <CardDescription>
              Showing {filteredInventory.length} of {inventory.length} items
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Store</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Current Qty</TableHead>
                    <TableHead>Safety Level</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Last Refill</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInventory.map((item, index) => {
                    const status = getStockStatus(item);
                    return (
                      <TableRow key={index} className={getStatusColor(status)}>
                        <TableCell className="font-medium">
                          <div>
                            <div className="font-semibold">{item.store_name}</div>
                            <div className="text-sm text-gray-500">{item.store_id}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {item.perishable ? (
                              <IceCreamCone className="h-4 w-4 text-blue-500" />
                            ) : (
                              <Leaf className="h-4 w-4 text-green-500" />
                            )}
                            {item.item_name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`font-semibold ${
                            status === 'critical' ? 'text-red-600' : 
                            status === 'low' ? 'text-amber-600' : 'text-green-600'
                          }`}>
                            {item.quantity}
                          </span>
                        </TableCell>
                        <TableCell>{item.safety_threshold}</TableCell>
                        <TableCell>
                          <Badge variant={item.perishable ? "default" : "secondary"}>
                            {item.perishable ? "Perishable" : "Non-perishable"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            item.restocking_priority === 'High' ? "destructive" :
                            item.restocking_priority === 'Medium' ? "default" : "secondary"
                          }>
                            {item.restocking_priority}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {new Date(item.last_refill_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                size="sm" 
                                variant={status === 'critical' ? "destructive" : "outline"}
                                onClick={() => setSelectedItem(item)}
                              >
                                {status === 'critical' ? 'Urgent Restock' : 'Send Replenishment'}
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Confirm Replenishment</DialogTitle>
                                <DialogDescription>
                                  Are you sure you want to send a replenishment request for {item.item_name} 
                                  at {item.store_name}?
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <strong>Current Stock:</strong> {item.quantity}
                                  </div>
                                  <div>
                                    <strong>Safety Level:</strong> {item.safety_threshold}
                                  </div>
                                  <div>
                                    <strong>Priority:</strong> {item.restocking_priority}
                                  </div>
                                  <div>
                                    <strong>Type:</strong> {item.perishable ? "Perishable" : "Non-perishable"}
                                  </div>
                                </div>
                                <div className="flex gap-2 justify-end">
                                  <Button variant="outline">Cancel</Button>
                                  <Button onClick={() => handleReplenishment(item)}>
                                    Confirm Replenishment
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InventoryMonitoringDashboard;
