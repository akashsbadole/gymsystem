import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/main-layout";
import { StatsCard } from "@/components/dashboard/stats-card";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { MembershipChart } from "@/components/dashboard/membership-chart";
import { RecentPayments } from "@/components/dashboard/recent-payments";
import { NotificationsList } from "@/components/dashboard/notifications-list";
import { Users, CreditCard, TrendingUp, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function Dashboard() {
  const [selectedGymId, setSelectedGymId] = useState<number | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch gyms
  const { data: gyms, isLoading: isLoadingGyms } = useQuery<any[]>({
    queryKey: ["/api/gyms"],
    enabled: !!user,
  });

  // Set selected gym once gyms load
  useEffect(() => {
    if (gyms && gyms.length > 0 && !selectedGymId) {
      setSelectedGymId(gyms[0].id);
    }
  }, [gyms, selectedGymId]);

  // Fetch dashboard data for the selected gym
  const { data: dashboardData, isLoading: isLoadingDashboard } = useQuery<any>({
    queryKey: ["/api/gyms", selectedGymId, "dashboard"],
    enabled: !!selectedGymId,
  });

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
    <MainLayout title="Dashboard">
      <div className="pb-5 mt-2 flex items-center justify-end">
        <Button className="inline-flex items-center px-4 py-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add New Member
        </Button>
      </div>

      {isLoadingDashboard ? (
        <div className="flex justify-center items-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : dashboardData ? (
        <>
          {/* Quick Stats Section */}
          <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              icon={<Users strokeWidth={2} />}
              title="Total Members"
              value={dashboardData?.stats?.totalMembers || 0}
              iconBgColor="bg-primary-100"
              iconColor="text-primary-600"
              link={{ href: "/members", text: "View all" }}
            />
            <StatsCard
              icon={<CreditCard strokeWidth={2} />}
              title="Monthly Revenue"
              value={`₹${(dashboardData?.stats?.monthlyRevenue || 0).toLocaleString('en-IN')}`}
              iconBgColor="bg-secondary-100"
              iconColor="text-secondary-600"
              link={{ href: "/reports", text: "View report" }}
            />
            <StatsCard
              icon={<TrendingUp strokeWidth={2} />}
              title="Active Memberships"
              value={dashboardData?.stats?.activeMembers || 0}
              iconBgColor="bg-accent-100"
              iconColor="text-accent-600"
              link={{ href: "/members", text: "View details" }}
            />
            <StatsCard
              icon={<Clock strokeWidth={2} />}
              title="Expiring This Week"
              value={dashboardData?.stats?.expiringThisWeek || 0}
              iconBgColor="bg-red-100"
              iconColor="text-red-600"
              link={{ 
                href: "/notifications", 
                text: "Send reminders", 
                color: "text-red-600 hover:text-red-500" 
              }}
            />
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <RevenueChart 
              monthlyData={dashboardData?.monthlyRevenue || []} 
              yearlyData={[]} 
            />
            <MembershipChart 
              data={dashboardData?.membershipDistribution || []} 
            />
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <RecentPayments 
              className="lg:col-span-2" 
              payments={dashboardData?.recentPayments || []} 
            />
            <NotificationsList 
              expiring={dashboardData?.expiring || []} 
            />
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Could not load dashboard data</h3>
          <p className="text-gray-500">There was an error loading your dashboard data.</p>
        </div>
      )}
    </MainLayout>
  );
}
