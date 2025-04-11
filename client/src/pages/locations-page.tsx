import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Building, Edit, Loader2, MapPin, Phone, Plus, Trash2 } from "lucide-react";
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

const gymSchema = z.object({
  name: z.string().min(3, "Name is required"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  zipcode: z.string().min(5, "Zipcode is required"),
  phone: z.string().optional(),
  email: z.string().email("Enter a valid email").optional(),
});

type GymFormData = z.infer<typeof gymSchema>;

export default function LocationsPage() {
  const [isAddLocationOpen, setIsAddLocationOpen] = useState(false);
  const [editingGym, setEditingGym] = useState<any | null>(null);
  const [deleteGymId, setDeleteGymId] = useState<number | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Get gyms
  const { data: gyms, isLoading: isLoadingGyms } = useQuery<any[]>({
    queryKey: ["/api/gyms"],
    enabled: !!user,
  });

  // Create gym form
  const form = useForm<GymFormData>({
    resolver: zodResolver(gymSchema),
    defaultValues: {
      name: "",
      address: "",
      city: "",
      state: "",
      zipcode: "",
      phone: "",
      email: "",
    },
  });

  // Create gym mutation
  const createGymMutation = useMutation({
    mutationFn: async (data: GymFormData) => {
      if (editingGym) {
        await apiRequest("PUT", `/api/gyms/${editingGym.id}`, data);
      } else {
        await apiRequest("POST", "/api/gyms", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/gyms"] });
      setIsAddLocationOpen(false);
      setEditingGym(null);
      form.reset();
      toast({
        title: "Success",
        description: editingGym ? "Gym updated successfully" : "Gym created successfully",
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

  // Delete gym mutation
  const deleteGymMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/gyms/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/gyms"] });
      setDeleteGymId(null);
      toast({
        title: "Success",
        description: "Gym deleted successfully",
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
  const onSubmit = (data: GymFormData) => {
    createGymMutation.mutate(data);
  };

  // Handle edit gym
  const handleEditGym = (gym: any) => {
    setEditingGym(gym);
    form.reset({
      name: gym.name,
      address: gym.address,
      city: gym.city,
      state: gym.state,
      zipcode: gym.zipcode,
      phone: gym.phone || "",
      email: gym.email || "",
    });
    setIsAddLocationOpen(true);
  };

  // Handle delete gym
  const handleDeleteGym = (id: number) => {
    deleteGymMutation.mutate(id);
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

  return (
    <MainLayout title="Locations">
      <div className="flex justify-end mb-6">
        <Dialog 
          open={isAddLocationOpen} 
          onOpenChange={(open) => {
            if (!open) {
              setEditingGym(null);
              form.reset();
            }
            setIsAddLocationOpen(open);
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Location
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>{editingGym ? "Edit" : "Add"} Gym Location</DialogTitle>
              <DialogDescription>
                Enter the details of your gym location.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gym Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter gym name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input placeholder="Street address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="City" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State</FormLabel>
                        <FormControl>
                          <Input placeholder="State" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="zipcode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Zipcode</FormLabel>
                        <FormControl>
                          <Input placeholder="Zipcode" {...field} />
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
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Email address" type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button 
                    type="submit"
                    disabled={createGymMutation.isPending}
                  >
                    {createGymMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    {editingGym ? "Update" : "Add"} Location
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {gyms && gyms.length > 0 ? (
          gyms.map((gym) => (
            <Card key={gym.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center">
                  <Building className="mr-2 h-5 w-5 text-primary" />
                  {gym.name}
                </CardTitle>
                <CardDescription>
                  <div className="flex items-start mt-1">
                    <MapPin className="mr-2 h-4 w-4 text-gray-500 mt-0.5" />
                    <span>
                      {gym.address}, {gym.city}, {gym.state}, {gym.zipcode}
                    </span>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-3">
                {gym.phone && (
                  <div className="flex items-center mb-2">
                    <Phone className="mr-2 h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{gym.phone}</span>
                  </div>
                )}
                {gym.email && (
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm text-gray-600">{gym.email}</span>
                  </div>
                )}
              </CardContent>
              <CardFooter className="border-t pt-4 flex justify-between">
                <Button variant="outline" size="sm" onClick={() => handleEditGym(gym)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete the gym location "{gym.name}" and all associated data including members, payments, and memberships.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        className="bg-red-600 hover:bg-red-700"
                        onClick={() => handleDeleteGym(gym.id)}
                      >
                        {deleteGymMutation.isPending && deleteGymId === gym.id ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <Building className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No gym locations</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by adding your first gym location.</p>
            <div className="mt-6">
              <Button onClick={() => setIsAddLocationOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Location
              </Button>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
