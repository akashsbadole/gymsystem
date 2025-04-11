import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

const memberSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters" }),
  email: z.string().email({ message: "Please enter a valid email" }).optional().or(z.literal("")),
  phone: z.string().min(10, { message: "Phone number must be at least 10 characters" }),
  address: z.string().optional().or(z.literal("")),
  dateOfBirth: z.string().optional().or(z.literal("")),
  gender: z.string().optional().or(z.literal("")),
  emergencyContact: z.string().optional().or(z.literal("")),
  active: z.boolean().default(true),
  gymId: z.number(),
});

type MemberFormData = z.infer<typeof memberSchema>;

interface MemberFormProps {
  gymId: number;
  onSuccess: () => void;
  member?: any; // For editing existing member
}

export function MemberForm({ gymId, onSuccess, member }: MemberFormProps) {
  const { toast } = useToast();
  const isEditing = !!member;

  // Initialize the form with default values or existing member data
  const form = useForm<MemberFormData>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      name: member?.name || "",
      email: member?.email || "",
      phone: member?.phone || "",
      address: member?.address || "",
      dateOfBirth: member?.dateOfBirth ? new Date(member.dateOfBirth).toISOString().split("T")[0] : "",
      gender: member?.gender || "",
      emergencyContact: member?.emergencyContact || "",
      active: member?.active !== undefined ? member.active : true,
      gymId: gymId,
    },
  });

  // Create or update member mutation
  const memberMutation = useMutation({
    mutationFn: async (data: MemberFormData) => {
      if (isEditing) {
        return await apiRequest("PUT", `/api/members/${member.id}`, data);
      } else {
        return await apiRequest("POST", `/api/gyms/${gymId}/members`, data);
      }
    },
    onSuccess: () => {
      // Invalidate and refetch members query
      queryClient.invalidateQueries({ queryKey: ["/api/gyms", gymId, "members"] });
      toast({
        title: `Member ${isEditing ? "updated" : "added"} successfully`,
        description: `The member has been ${isEditing ? "updated" : "added"} to your gym.`,
      });
      onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: MemberFormData) => {
    memberMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter member's full name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email (optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Enter email address" type="email" {...field} />
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
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="Enter phone number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address (optional)</FormLabel>
              <FormControl>
                <Input placeholder="Enter residential address" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="dateOfBirth"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date of Birth (optional)</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gender (optional)</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="emergencyContact"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Emergency Contact (optional)</FormLabel>
              <FormControl>
                <Input placeholder="Emergency contact name and number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                  className="h-4 w-4 mt-1"
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Active Member</FormLabel>
                <FormDescription>
                  Is this member currently active at your gym?
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          className="w-full"
          disabled={memberMutation.isPending}
        >
          {memberMutation.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          {isEditing ? "Update Member" : "Add Member"}
        </Button>
      </form>
    </Form>
  );
}
