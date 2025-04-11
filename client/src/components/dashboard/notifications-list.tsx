import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format, addDays, isAfter, isBefore } from "date-fns";
import { BellRing, Clock, CreditCard, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";

interface MembershipExpiry {
  id: number;
  memberId: number;
  startDate: string;
  endDate: string;
  member?: {
    id: number;
    name: string;
    email?: string;
    phone?: string;
  };
  plan?: {
    id: number;
    name: string;
    type: string;
  };
}

interface NotificationsListProps {
  expiring: MembershipExpiry[];
  className?: string;
}

export function NotificationsList({ expiring, className }: NotificationsListProps) {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'expiry',
      title: `${expiring?.length || 0} memberships expiring this week`,
      message: 'Send automatic renewal reminders to members with expiring memberships.',
      action: 'Send Reminders',
      read: false,
    },
    {
      id: 2,
      type: 'inquiry',
      title: 'New inquiry from Amit Sharma',
      message: 'Asking about personal training sessions and pricing details.',
      action: 'View Inquiry',
      read: false,
    },
    {
      id: 3,
      type: 'success',
      title: 'Monthly revenue target achieved',
      message: 'Your gym has surpassed the monthly revenue target by 15%.',
      action: 'View Report',
      read: false,
    },
    {
      id: 4,
      type: 'member',
      title: 'New member registered',
      message: 'Neha Patel just registered for a Monthly Premium plan.',
      action: 'View Profile',
      read: false,
    },
  ]);
  
  const { toast } = useToast();
  
  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      // In a real app, you would call an API endpoint
      // await apiRequest("PUT", "/api/notifications/read-all", {});
      return Promise.resolve();
    },
    onSuccess: () => {
      setNotifications(notifications.map(notif => ({ ...notif, read: true })));
      toast({
        title: "Success",
        description: "All notifications marked as read",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Send reminders mutation
  const sendRemindersMutation = useMutation({
    mutationFn: async () => {
      // In a real app, you would call an API endpoint to send reminders
      // For each expiring membership
      return Promise.resolve();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: `Reminders sent to ${expiring?.length || 0} members`,
      });
      
      // Mark the notification as read
      const updatedNotifications = [...notifications];
      const expiryNotif = updatedNotifications.find(n => n.type === 'expiry');
      if (expiryNotif) {
        expiryNotif.read = true;
      }
      setNotifications(updatedNotifications);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Handle action click
  const handleActionClick = (type: string) => {
    if (type === 'expiry') {
      sendRemindersMutation.mutate();
    } else {
      toast({
        title: "Action Clicked",
        description: `You clicked on ${type} action`,
      });
    }
  };
  
  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'expiry':
        return (
          <div className="flex-shrink-0 bg-red-100 rounded-md p-2">
            <Clock className="h-5 w-5 text-red-600" />
          </div>
        );
      case 'inquiry':
        return (
          <div className="flex-shrink-0 bg-yellow-100 rounded-md p-2">
            <BellRing className="h-5 w-5 text-yellow-600" />
          </div>
        );
      case 'success':
        return (
          <div className="flex-shrink-0 bg-green-100 rounded-md p-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'member':
        return (
          <div className="flex-shrink-0 bg-primary-100 rounded-md p-2">
            <UserPlus className="h-5 w-5 text-primary-600" />
          </div>
        );
      default:
        return (
          <div className="flex-shrink-0 bg-gray-100 rounded-md p-2">
            <BellRing className="h-5 w-5 text-gray-600" />
          </div>
        );
    }
  };
  
  return (
    <Card className={cn("shadow", className)}>
      <CardHeader className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
        <CardTitle className="text-lg leading-6 font-medium text-gray-900">Notifications</CardTitle>
        <Button 
          variant="outline" 
          size="sm"
          className="text-primary-600 bg-primary-100 hover:bg-primary-200 hover:text-primary-700"
          onClick={() => markAllAsReadMutation.mutate()}
          disabled={markAllAsReadMutation.isPending || notifications.every(n => n.read)}
        >
          Mark all as read
        </Button>
      </CardHeader>
      
      <CardContent className="p-5">
        <ul className="divide-y divide-gray-200">
          {notifications.map((notification) => (
            <li key={notification.id} className={cn("py-4", !notification.read && "bg-gray-50")}>
              <div className="flex">
                {getNotificationIcon(notification.type)}
                <div className="ml-3">
                  <p className={cn(
                    "text-sm font-medium",
                    notification.read ? "text-gray-600" : "text-gray-900"
                  )}>
                    {notification.title}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">{notification.message}</p>
                  <div className="mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleActionClick(notification.type)}
                    >
                      {notification.action}
                    </Button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
        
        <div className="mt-4 text-center">
          <Button variant="link" className="text-sm font-medium text-primary-600 hover:text-primary-500">
            View all notifications
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
