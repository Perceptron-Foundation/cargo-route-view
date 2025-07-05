
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";

const NavigationHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 mb-6">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Smart Retail Supply Chain</h1>
        <div className="flex gap-2">
          <Button
            variant={location.pathname === "/" ? "default" : "outline"}
            onClick={() => navigate("/")}
          >
            Route Optimization
          </Button>
          <Button
            variant={location.pathname === "/inventory" ? "default" : "outline"}
            onClick={() => navigate("/inventory")}
          >
            Inventory Monitoring
          </Button>
          <Button
            variant={location.pathname === "/demand-heatmap" ? "default" : "outline"}
            onClick={() => navigate("/demand-heatmap")}
          >
            Demand Heatmap
          </Button>
          <Button
            variant={location.pathname === "/traffic-dashboard" ? "default" : "outline"}
            onClick={() => navigate("/traffic-dashboard")}
          >
            Traffic Dashboard
          </Button>
          <Button
            variant={location.pathname === "/predictive-logistics" ? "default" : "outline"}
            onClick={() => navigate("/predictive-logistics")}
          >
            Predictive Logistics
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NavigationHeader;
