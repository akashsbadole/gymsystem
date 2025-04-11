import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface MembershipDistributionItem {
  type: string;
  count: number;
}

interface MembershipChartProps {
  data: MembershipDistributionItem[];
  className?: string;
}

const COLORS = ['#3B82F6', '#10B981', '#F97316'];
const TYPE_LABELS = {
  'monthly': 'Monthly Plan',
  'quarterly': 'Quarterly Plan',
  'annual': 'Annual Plan'
};

export function MembershipChart({ data, className }: MembershipChartProps) {
  const [location, setLocation] = useState('all');
  
  // Calculate total
  const totalMembers = data.reduce((sum, item) => sum + item.count, 0);
  
  // For visual presentation, convert raw data to chart data with percentages
  const chartData = data.map((item, index) => ({
    name: TYPE_LABELS[item.type as keyof typeof TYPE_LABELS] || item.type,
    value: item.count,
    percentage: totalMembers > 0 ? Math.round((item.count / totalMembers) * 100) : 0,
    color: COLORS[index % COLORS.length]
  }));

  return (
    <Card className={className}>
      <CardHeader className="p-5 pb-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg leading-6 font-medium text-gray-900">Membership Distribution</CardTitle>
          <div>
            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="mumbai">Mumbai Center</SelectItem>
                <SelectItem value="delhi">Delhi Branch</SelectItem>
                <SelectItem value="bangalore">Bangalore Hub</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-5">
        <div className="mt-4 chart-container flex items-center justify-center" style={{ height: 240 }}>
          {totalMembers > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip 
                  formatter={(value, name) => [`${value} members`, name]}
                  contentStyle={{ backgroundColor: 'white', borderRadius: '4px', border: '1px solid #E5E7EB' }}
                />
                <text
                  x="50%"
                  y="50%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-2xl font-bold"
                  fill="#111827"
                >
                  {totalMembers}
                </text>
                <text
                  x="50%"
                  y="60%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-xs"
                  fill="#6B7280"
                >
                  Active Members
                </text>
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center w-full h-full">
              <div className="text-3xl font-bold text-gray-800">0</div>
              <div className="text-sm text-gray-500">Active Members</div>
            </div>
          )}
        </div>
        
        <div className="mt-6 grid grid-cols-1 gap-4">
          {chartData.map((item, index) => (
            <div key={index} className="flex items-center">
              <span className="h-4 w-4 rounded-full mr-2" style={{ backgroundColor: item.color }}></span>
              <span className="text-sm text-gray-700 flex-1">{item.name}</span>
              <span className="text-sm font-medium text-gray-900">{item.value} members ({item.percentage}%)</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
