import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

const paymentSchema = z.object({
  memberId: z.number({
    required_error: "Member is required",
  }),
  amount: z.string().min(1, { message: "Amount is required" }).transform(val => parseFloat(val)),
  paymentMethod: z.string().min(1, { message: "Payment method is required" }),
  reference: z.string().optional(),
  status: z.string().default("paid"),
  membershipId: z.number().optional(),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface PaymentFormProps {
  gymId: number;
  members: any[]; // List of gym members
  onSuccess: () => void;
  payment?: any; // For editing existing payment
}

export function PaymentForm({ gymId, members, onSuccess, payment }: PaymentFormProps) {
  const { toast } = useToast();
  const isEditing = !!payment;

  // Initialize the form with default values or existing payment data
  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      memberId: payment?.memberId || 0,
      amount: payment?.amount ? payment.amount.toString() : "",
      paymentMethod: payment?.paymentMethod || "cash",
      reference: payment?.reference || "",
      status: payment?.status || "paid",
      membershipId: payment?.membershipId,
    },
  });

  // Create or update payment mutation
  const paymentMutation = useMutation({
    mutationFn: async (data: PaymentFormData) => {
      if (isEditing) {
        return await apiRequest("PUT", `/api/payments/${payment.id}`, data);
      } else {
        return await apiRequest("POST", `/api/members/${data.memberId}/payments`, data);
      }
    },
    onSuccess: () => {
      // Invalidate and refetch payments query
      queryClient.invalidateQueries({ queryKey: ["/api/gyms", gymId, "payments"] });
      toast({
        title: `Payment ${isEditing ? "updated" : "recorded"} successfully`,
        description: `The payment has been ${isEditing ? "updated" : "recorded"} successfully.`,
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

  const onSubmit = (data: PaymentFormData) => {
    paymentMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="memberId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Member</FormLabel>
              <Select 
                onValueChange={(value) => field.onChange(parseInt(value))}
                defaultValue={field.value.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a member" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {members.map((member) => (
                    <SelectItem key={member.id} value={member.id.toString()}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount (₹)</FormLabel>
                <FormControl>
                  <Input placeholder="Enter amount" type="number" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="paymentMethod"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payment Method</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="netbanking">Net Banking</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
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
          name="reference"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reference/Description (optional)</FormLabel>
              <FormControl>
                <Input placeholder="Enter reference or description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          className="w-full mt-4"
          disabled={paymentMutation.isPending}
        >
          {paymentMutation.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          {isEditing ? "Update Payment" : "Record Payment"}
        </Button>
      </form>
    </Form>
  );
}
