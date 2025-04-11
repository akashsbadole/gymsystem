import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DatePicker } from "@/components/ui/date-picker";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Download, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

const COLORS = ['#3B82F6', '#10B981', '#F97316', '#A855F7', '#EC4899', '#F43F5E', '#06B6D4'];

export default function ReportsPage() {
  const [selectedGymId, setSelectedGymId] = useState<number | null>(null);
  const [reportType, setReportType] = useState("revenue");
  const [periodType, setPeriodType] = useState("monthly");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const { user } = useAuth();

  // Fetch gyms
  const { data: gyms, isLoading: isLoadingGyms } = useQuery<any[]>({
    queryKey: ["/api/gyms"],
    enabled: !!user,
  });

  // Set selected gym once gyms load
  const hasSelectedGym = selectedGymId !== null;
  const currentGymId = hasSelectedGym ? selectedGymId : gyms?.[0]?.id;

  // Fetch dashboard data for the selected gym
  const { data: dashboardData, isLoading: isLoadingDashboard } = useQuery<any>({
    queryKey: ["/api/gyms", currentGymId, "dashboard"],
    enabled: !!currentGymId,
  });

  // Mock report data generation based on dashboard data and filters
  // In a real application, you would have specific API endpoints for reports
  const generateReportData = () => {
    if (!dashboardData) return [];
    
    if (reportType === "revenue") {
      return dashboardData.monthlyRevenue;
    } else if (reportType === "membership") {
      return dashboardData.membershipDistribution.map((item: any) => ({
        name: item.type === 'monthly' ? 'Monthly' : item.type === 'quarterly' ? 'Quarterly' : 'Annual',
        value: item.count
      }));
    } else {
      // For attendance, we'd normally fetch from a dedicated endpoint
      // This is just placeholder data based on active members
      return [
        { name: 'Mon', value: Math.floor(dashboardData.stats.activeMembers * 0.6) },
        { name: 'Tue', value: Math.floor(dashboardData.stats.activeMembers * 0.7) },
        { name: 'Wed', value: Math.floor(dashboardData.stats.activeMembers * 0.8) },
        { name: 'Thu', value: Math.floor(dashboardData.stats.activeMembers * 0.65) },
        { name: 'Fri', value: Math.floor(dashboardData.stats.activeMembers * 0.9) },
        { name: 'Sat', value: Math.floor(dashboardData.stats.activeMembers * 0.5) },
        { name: 'Sun', value: Math.floor(dashboardData.stats.activeMembers * 0.4) }
      ];
    }
  };

  const reportData = generateReportData();

  const handleExportReport = () => {
    // In a real application, you would implement report export functionality
    // This could be CSV, PDF, or Excel export
    alert("Report export functionality would be implemented here");
  };

  if (isLoadingGyms) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  if (gyms && gyms.length === 0) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No gyms found</h3>
          <p className="text-gray-500 mb-6">You haven't added any gyms yet. Add your first gym to get started.</p>
          <Button>Add New Gym</Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Reports">
      <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:justify-between sm:items-center mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Gym Selector */}
          {gyms && gyms.length > 1 && (
            <Select 
              value={currentGymId?.toString()} 
              onValueChange={(value) => setSelectedGymId(parseInt(value))}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select gym" />
              </SelectTrigger>
              <SelectContent>
                {gyms.map((gym) => (
                  <SelectItem key={gym.id} value={gym.id.toString()}>
                    {gym.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          
          {/* Report Type Selector */}
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Report Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="revenue">Revenue Report</SelectItem>
              <SelectItem value="membership">Membership Distribution</SelectItem>
              <SelectItem value="attendance">Attendance Report</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Period Type Selector */}
          {reportType === "revenue" && (
            <Select value={periodType} onValueChange={setPeriodType}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
        
        {/* Export Button */}
        <Button onClick={handleExportReport} disabled={isLoadingDashboard}>
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>
      
      {/* Date Range Selector */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">From:</span>
          <DatePicker
            selected={startDate}
            onSelect={setStartDate}
            className="w-[150px]"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">To:</span>
          <DatePicker
            selected={endDate}
            onSelect={setEndDate}
            className="w-[150px]"
          />
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => {
            setStartDate(undefined);
            setEndDate(undefined);
          }}
        >
          Clear Dates
        </Button>
      </div>
      
      {isLoadingDashboard ? (
        <div className="flex justify-center items-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <Card className="shadow">
          <CardHeader>
            <CardTitle>
              {reportType === "revenue" 
                ? "Revenue Report" 
                : reportType === "membership" 
                  ? "Membership Distribution" 
                  : "Attendance Report"}
            </CardTitle>
            <CardDescription>
              {reportType === "revenue" 
                ? `Showing ${periodType} revenue data` 
                : reportType === "membership" 
                  ? "Current membership plan distribution" 
                  : "Weekly attendance pattern"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] w-full">
              {reportType === "membership" ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={reportData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={150}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {reportData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} members`, 'Count']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={reportData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis 
                      dataKey={reportType === "revenue" ? "period" : "name"}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(value) => reportType === "revenue" ? `₹${value}` : `${value}`}
                    />
                    <Tooltip 
                      formatter={(value) => [
                        reportType === "revenue" ? `₹${value}` : `${value} ${reportType === "attendance" ? "members" : ""}`,
                        reportType === "revenue" ? "Revenue" : reportType === "attendance" ? "Attendance" : "Count"
                      ]} 
                    />
                    <Bar 
                      dataKey={reportType === "revenue" ? "amount" : "value"} 
                      fill="#3B82F6" 
                      radius={[4, 4, 0, 0]} 
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </MainLayout>
  );
}
