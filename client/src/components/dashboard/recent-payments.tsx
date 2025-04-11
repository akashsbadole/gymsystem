import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";

interface Payment {
  id: number;
  memberId: number;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  status: string;
  reference?: string;
  member?: {
    id: number;
    name: string;
    email?: string;
  };
}

interface RecentPaymentsProps {
  payments: Payment[];
  className?: string;
}

export function RecentPayments({ payments, className }: RecentPaymentsProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const paymentsPerPage = 5;
  
  // Calculate pagination
  const indexOfLastPayment = currentPage * paymentsPerPage;
  const indexOfFirstPayment = indexOfLastPayment - paymentsPerPage;
  const currentPayments = payments.slice(indexOfFirstPayment, indexOfLastPayment);
  const totalPages = Math.ceil(payments.length / paymentsPerPage);
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    
    // Check if the date is today
    if (date.toDateString() === now.toDateString()) {
      return `Today, ${format(date, "h:mm a")}`;
    }
    
    // Check if the date is yesterday
    if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${format(date, "h:mm a")}`;
    }
    
    // Otherwise, return formatted date
    return format(date, "MMM d, h:mm a");
  };
  
  // Get status badge style
  const getStatusBadgeStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleExportClick = () => {
    // In a real application, you would implement an export functionality here
    alert("Export functionality would be implemented here");
  };

  return (
    <Card className={cn("shadow", className)}>
      <CardHeader className="px-5 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg leading-6 font-medium text-gray-900">Recent Payments</CardTitle>
          <Button variant="outline" size="sm" onClick={handleExportClick}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </CardHeader>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="bg-white divide-y divide-gray-200">
            {currentPayments.length > 0 ? (
              currentPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-600">
                          {payment.member?.name
                            ? payment.member.name.split(' ').map(n => n[0]).join('').toUpperCase()
                            : 'U'}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {payment.member?.name || 'Unknown Member'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {payment.member?.email || ''}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {payment.reference || 'Standard Membership'}
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatCurrency(payment.amount)}</div>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <span className={cn(
                      "px-2 inline-flex text-xs leading-5 font-semibold rounded-full",
                      getStatusBadgeStyle(payment.status)
                    )}>
                      {payment.status}
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(payment.paymentDate)}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                  No recent payments found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {payments.length > 0 && (
        <CardContent className="bg-gray-50 px-5 py-3 border-t border-gray-200 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{indexOfFirstPayment + 1}</span> to{" "}
              <span className="font-medium">
                {Math.min(indexOfLastPayment, payments.length)}
              </span>{" "}
              of <span className="font-medium">{payments.length}</span> payments
            </p>
          </div>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
