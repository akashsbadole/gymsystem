import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps
} from "recharts";
import { cn } from "@/lib/utils";

interface DataPoint {
  period: string;
  amount: number;
}

interface RevenueChartProps {
  monthlyData?: DataPoint[];
  yearlyData?: DataPoint[];
  className?: string;
}

export function RevenueChart({ monthlyData = [], yearlyData = [], className }: RevenueChartProps) {
  const [view, setView] = useState<'monthly' | 'yearly'>('monthly');
  
  const data = view === 'monthly' ? monthlyData : yearlyData;
  
  // Calculate statistics
  const totalRevenue = data.reduce((sum, item) => sum + item.amount, 0);
  const average = data.length > 0 ? totalRevenue / data.length : 0;
  
  // Calculate growth (comparing last period to the period before)
  const calculateGrowth = () => {
    if (data.length < 2) return 0;
    const current = data[data.length - 1].amount;
    const previous = data[data.length - 2].amount;
    if (previous === 0) return 100; // Avoid division by zero
    return ((current - previous) / previous) * 100;
  };
  
  const growth = calculateGrowth();
  
  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-sm rounded-md">
          <p className="font-medium">{`${label}`}</p>
          <p className="text-primary-600">{`₹${payload[0].value?.toLocaleString('en-IN')}`}</p>
        </div>
      );
    }
    return null;
  };
  
  // Format amount to Indian currency format
  const formatAmount = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  return (
    <Card className={cn("shadow overflow-hidden", className)}>
      <CardHeader className="p-5 pb-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg leading-6 font-medium text-gray-900">Revenue Overview</CardTitle>
          <div className="flex items-center">
            <span className="relative z-0 inline-flex shadow-sm rounded-md">
              <Button
                type="button"
                variant={view === 'monthly' ? "default" : "outline"}
                className={cn(
                  "relative inline-flex items-center px-4 py-2 rounded-l-md text-sm font-medium focus:z-10",
                  view === 'monthly' ? "bg-primary text-white" : "text-gray-700"
                )}
                onClick={() => setView('monthly')}
              >
                Monthly
              </Button>
              <Button
                type="button"
                variant={view === 'yearly' ? "default" : "outline"}
                className={cn(
                  "relative inline-flex items-center px-4 py-2 rounded-r-md text-sm font-medium focus:z-10",
                  view === 'yearly' ? "bg-primary text-white" : "text-gray-700"
                )}
                onClick={() => setView('yearly')}
              >
                Yearly
              </Button>
            </span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-5">
        <div className="mt-4 chart-container" style={{ height: 240 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="period"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6B7280' }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6B7280' }}
                tickFormatter={(tick) => `₹${tick < 1000 ? tick : `${Math.round(tick / 1000)}k`}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="amount" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 grid grid-cols-3 gap-4 border-t border-gray-200 pt-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Revenue</p>
            <p className="text-lg font-semibold text-gray-900">{formatAmount(totalRevenue)}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Average</p>
            <p className="text-lg font-semibold text-gray-900">{formatAmount(average)}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Growth</p>
            <p className={cn(
              "text-lg font-semibold",
              growth > 0 ? "text-green-600" : growth < 0 ? "text-red-600" : "text-gray-600"
            )}>
              {growth > 0 ? `+${growth.toFixed(1)}%` : `${growth.toFixed(1)}%`}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
