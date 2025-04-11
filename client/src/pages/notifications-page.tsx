import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { BellRing, Check, CheckCircle, Clock, Loader2, MailOpen, RefreshCw } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";

const createNotificationSchema = z.object({
  title: z.string().min(3, "Title is required"),
  message: z.string().min(10, "Message is required"),
  type: z.string(),
});

type NotificationType = z.infer<typeof createNotificationSchema>;

export default function NotificationsPage() {
  const [selectedTab, setSelectedTab] = useState("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Get notifications
  const { data: notifications, isLoading: isLoadingNotifications } = useQuery<any[]>({
    queryKey: ["/api/notifications"],
    enabled: !!user,
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("PUT", "/api/notifications/read-all", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
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

  // Mark single notification as read
  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("PUT", `/api/notifications/${id}/read`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Create notification form
  const form = useForm<NotificationType>({
    resolver: zodResolver(createNotificationSchema),
    defaultValues: {
      title: "",
      message: "",
      type: "general",
    },
  });

  // Create notification mutation
  const createNotificationMutation = useMutation({
    mutationFn: async (data: NotificationType) => {
      await apiRequest("POST", "/api/notifications", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      setIsCreateOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Notification created successfully",
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

  // Filter notifications based on selected tab
  const filteredNotifications = notifications?.filter((notification) => {
    if (selectedTab === "all") return true;
    if (selectedTab === "unread") return !notification.isRead;
    return notification.type === selectedTab;
  });

  // Handle create notification form submission
  const onSubmit = (data: NotificationType) => {
    createNotificationMutation.mutate(data);
  };

  // Format relative date
  const formatRelativeDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else if (diffInHours < 48) {
      return "Yesterday";
    } else {
      return format(date, "MMM d, yyyy");
    }
  };

  // Get notification icon based on type
  const getNotificationIcon = (type: string, isRead: boolean) => {
    if (type === "payment") {
      return <div className="flex-shrink-0 bg-green-100 rounded-md p-2">
        <CheckCircle className="h-5 w-5 text-green-600" />
      </div>;
    } else if (type === "membership") {
      return <div className="flex-shrink-0 bg-red-100 rounded-md p-2">
        <Clock className="h-5 w-5 text-red-600" />
      </div>;
    } else {
      return <div className="flex-shrink-0 bg-primary-100 rounded-md p-2">
        <BellRing className="h-5 w-5 text-primary-600" />
      </div>;
    }
  };

  if (isLoadingNotifications) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Notifications">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full sm:w-auto">
          <TabsList className="grid grid-cols-4 w-full sm:w-auto">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread">Unread</TabsTrigger>
            <TabsTrigger value="payment">Payments</TabsTrigger>
            <TabsTrigger value="membership">Memberships</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex mt-4 sm:mt-0 gap-2">
          <Button 
            variant="outline" 
            onClick={() => markAllAsReadMutation.mutate()}
            disabled={markAllAsReadMutation.isPending}
          >
            {markAllAsReadMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <MailOpen className="mr-2 h-4 w-4" />
            )}
            Mark All as Read
          </Button>
          
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>Create Notification</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create New Notification</DialogTitle>
                <DialogDescription>
                  Create a notification to be sent to your account.
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Notification title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Enter notification message" rows={4} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="general">General</SelectItem>
                            <SelectItem value="payment">Payment</SelectItem>
                            <SelectItem value="membership">Membership</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter>
                    <Button 
                      type="submit"
                      disabled={createNotificationMutation.isPending}
                    >
                      {createNotificationMutation.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      Create Notification
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <div className="space-y-4">
        {filteredNotifications && filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification) => (
            <Card key={notification.id} className={notification.isRead ? "" : "border-l-4 border-l-primary"}>
              <CardContent className="p-5">
                <div className="flex items-start">
                  {getNotificationIcon(notification.type, notification.isRead)}
                  <div className="ml-3 flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                        <p className="text-sm text-gray-500 mt-1">{notification.message}</p>
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatRelativeDate(notification.createdAt)}
                      </span>
                    </div>
                    
                    {!notification.isRead && (
                      <div className="mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => markAsReadMutation.mutate(notification.id)}
                          disabled={markAsReadMutation.isPending}
                        >
                          <Check className="mr-2 h-4 w-4" />
                          Mark as Read
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-12">
            <BellRing className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No notifications</h3>
            <p className="mt-1 text-sm text-gray-500">
              {selectedTab === "all" 
                ? "You don't have any notifications yet." 
                : selectedTab === "unread"
                  ? "You don't have any unread notifications."
                  : `You don't have any ${selectedTab} notifications.`}
            </p>
            <div className="mt-6">
              <Button onClick={() => setIsCreateOpen(true)}>Create Notification</Button>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
