import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Edit, Loader2, Mail, Phone, Plus, Trash2, UserCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const staffSchema = z.object({
  name: z.string().min(3, "Name is required"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().optional(),
  position: z.string().min(2, "Position is required"),
  salary: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
  gymId: z.number(),
});

type StaffFormData = z.infer<typeof staffSchema>;

export default function StaffPage() {
  const [selectedGymId, setSelectedGymId] = useState<number | null>(null);
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<any | null>(null);
  const [deleteStaffId, setDeleteStaffId] = useState<number | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch gyms
  const { data: gyms, isLoading: isLoadingGyms } = useQuery<any[]>({
    queryKey: ["/api/gyms"],
    enabled: !!user,
  });

  // Set selected gym once gyms load
  const hasSelectedGym = selectedGymId !== null;
  const currentGymId = hasSelectedGym ? selectedGymId : gyms?.[0]?.id;

  // Fetch staff for the selected gym
  const { data: staffMembers, isLoading: isLoadingStaff } = useQuery<any[]>({
    queryKey: ["/api/gyms", currentGymId, "staff"],
    enabled: !!currentGymId,
  });

  // Staff form
  const form = useForm<StaffFormData>({
    resolver: zodResolver(staffSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      position: "",
      salary: undefined,
      gymId: currentGymId || 0,
    },
  });

  // Create/update staff mutation
  const staffMutation = useMutation({
    mutationFn: async (data: StaffFormData) => {
      if (editingStaff) {
        await apiRequest("PUT", `/api/staff/${editingStaff.id}`, data);
      } else {
        await apiRequest("POST", `/api/gyms/${data.gymId}/staff`, data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/gyms", currentGymId, "staff"] });
      setIsAddStaffOpen(false);
      setEditingStaff(null);
      form.reset({
        name: "",
        email: "",
        phone: "",
        position: "",
        salary: undefined,
        gymId: currentGymId || 0,
      });
      toast({
        title: "Success",
        description: editingStaff ? "Staff updated successfully" : "Staff added successfully",
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

  // Delete staff mutation
  const deleteStaffMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/staff/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/gyms", currentGymId, "staff"] });
      setDeleteStaffId(null);
      toast({
        title: "Success",
        description: "Staff member removed successfully",
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

  // Handle form submission
  const onSubmit = (data: StaffFormData) => {
    staffMutation.mutate(data);
  };

  // Handle edit staff
  const handleEditStaff = (staff: any) => {
    setEditingStaff(staff);
    form.reset({
      name: staff.name,
      email: staff.email,
      phone: staff.phone || "",
      position: staff.position,
      salary: staff.salary?.toString() || "",
      gymId: staff.gymId,
    });
    setIsAddStaffOpen(true);
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
    <MainLayout title="Staff Management">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6">
        <div>
          {gyms && gyms.length > 1 && (
            <Select 
              value={currentGymId?.toString()} 
              onValueChange={(value) => setSelectedGymId(parseInt(value))}
            >
              <SelectTrigger className="w-[200px]">
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
        </div>
        
        <Dialog 
          open={isAddStaffOpen} 
          onOpenChange={(open) => {
            if (!open) {
              setEditingStaff(null);
              form.reset({
                name: "",
                email: "",
                phone: "",
                position: "",
                salary: undefined,
                gymId: currentGymId || 0,
              });
            }
            setIsAddStaffOpen(open);
          }}
        >
          <DialogTrigger asChild>
            <Button disabled={!currentGymId}>
              <Plus className="mr-2 h-4 w-4" />
              Add Staff Member
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingStaff ? "Edit" : "Add"} Staff Member</DialogTitle>
              <DialogDescription>
                Enter the details of the staff member.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="Email address" type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone (optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Phone number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="position"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Position</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Trainer, Manager" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="salary"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Salary (optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Monthly salary" type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="gymId"
                  render={({ field }) => (
                    <FormItem className="hidden">
                      <FormControl>
                        <Input type="hidden" {...field} value={currentGymId} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button 
                    type="submit"
                    disabled={staffMutation.isPending}
                  >
                    {staffMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    {editingStaff ? "Update" : "Add"} Staff Member
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      
      {isLoadingStaff ? (
        <div className="flex justify-center items-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : staffMembers && staffMembers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {staffMembers.map((staff) => (
            <Card key={staff.id}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-lg">
                  <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center mr-3">
                    <UserCircle className="h-6 w-6 text-primary-600" />
                  </div>
                  {staff.name}
                </CardTitle>
                <div className="text-sm font-medium text-primary-600">
                  {staff.position}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-sm text-gray-600">{staff.email}</span>
                  </div>
                  {staff.phone && (
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-sm text-gray-600">{staff.phone}</span>
                    </div>
                  )}
                  {staff.salary && (
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm text-gray-600">₹{staff.salary.toLocaleString('en-IN')}/month</span>
                    </div>
                  )}
                </div>
                
                <div className="flex mt-4 pt-4 border-t border-gray-100 gap-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEditStaff(staff)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="flex-1 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will remove {staff.name} from your staff. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          className="bg-red-600 hover:bg-red-700"
                          onClick={() => deleteStaffMutation.mutate(staff.id)}
                        >
                          {deleteStaffMutation.isPending && deleteStaffId === staff.id ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : null}
                          Remove
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <UserCircle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No staff members</h3>
          <p className="mt-1 text-sm text-gray-500">Add staff members to your gym location.</p>
          <div className="mt-6">
            <Button onClick={() => setIsAddStaffOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Staff Member
            </Button>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
