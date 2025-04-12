import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/main-layout";
import { PaymentTable } from "@/components/payments/payment-table";
import { PaymentForm } from "@/components/payments/payment-form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Loader2, Plus, Search } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function PaymentsPage() {
  const [selectedGymId, setSelectedGymId] = useState<number | null>(null);
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
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

  // Fetch payments for the selected gym
  const { data: payments, isLoading: isLoadingPayments } = useQuery<any[]>({
    queryKey: ["/api/gyms", currentGymId, "payments"],
    enabled: !!currentGymId,
  });

  // Fetch members for payment form
  const { data: members } = useQuery<any[]>({
    queryKey: ["/api/gyms", currentGymId, "members"],
    enabled: !!currentGymId,
  });

  // Debug the payment data
  if (payments) {
    console.log('Payments data:', JSON.stringify(payments, null, 2));
  }
  
  // Filter payments based on search, status, and date range
  const filteredPayments = payments?.filter((payment) => {
    // Skip invalid payment objects
    if (!payment) return false;
    
    const matchesSearch =
      searchTerm === "" ||
      payment.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.paymentMethod?.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = statusFilter === "all" || payment.status === statusFilter;
    
    // Safely create date object
    let paymentDate;
    try {
      paymentDate = payment.paymentDate ? new Date(payment.paymentDate) : null;
    } catch (e) {
      console.error("Invalid date format:", payment.paymentDate);
      paymentDate = null;
    }
    
    const matchesDateRange = 
      !paymentDate || 
      ((!startDate || paymentDate >= startDate) &&
       (!endDate || paymentDate <= endDate));
      
    return matchesSearch && matchesStatus && matchesDateRange;
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
    <MainLayout title="Payments">
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
          
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Search payments..."
              className="pl-10 w-full sm:w-[250px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Add Payment Button */}
        <Dialog open={isAddPaymentOpen} onOpenChange={setIsAddPaymentOpen}>
          <DialogTrigger asChild>
            <Button disabled={!currentGymId || !members || members.length === 0}>
              <Plus className="mr-2 h-4 w-4" />
              Record Payment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Record New Payment</DialogTitle>
            </DialogHeader>
            <PaymentForm 
              gymId={currentGymId!} 
              members={members || []}
              onSuccess={() => setIsAddPaymentOpen(false)} 
            />
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Date Filter */}
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
      
      {isLoadingPayments ? (
        <div className="flex justify-center items-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <PaymentTable payments={filteredPayments || []} />
      )}
    </MainLayout>
  );
}
