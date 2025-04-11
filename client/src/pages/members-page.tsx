import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/main-layout";
import { MemberTable } from "@/components/members/member-table";
import { MemberForm } from "@/components/members/member-form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Search } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function MembersPage() {
  const [selectedGymId, setSelectedGymId] = useState<number | null>(null);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { user } = useAuth();

  // Fetch gyms
  const { data: gyms, isLoading: isLoadingGyms } = useQuery<any[]>({
    queryKey: ["/api/gyms"],
    enabled: !!user,
  });

  // Set selected gym once gyms load
  const hasSelectedGym = selectedGymId !== null;
  const currentGymId = hasSelectedGym ? selectedGymId : gyms?.[0]?.id;

  // Fetch members for the selected gym
  const { data: members, isLoading: isLoadingMembers } = useQuery<any[]>({
    queryKey: ["/api/gyms", currentGymId, "members"],
    enabled: !!currentGymId,
  });

  // Filter members based on search term and status
  const filteredMembers = members?.filter((member) => {
    const matchesSearch =
      searchTerm === "" ||
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.phone.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && member.active) ||
      (statusFilter === "inactive" && !member.active);
      
    return matchesSearch && matchesStatus;
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
    <MainLayout title="Members">
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
              placeholder="Search members..."
              className="pl-10 w-full sm:w-[300px]"
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
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Add Member Button */}
        <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
          <DialogTrigger asChild>
            <Button disabled={!currentGymId}>
              <Plus className="mr-2 h-4 w-4" />
              Add Member
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Add New Member</DialogTitle>
            </DialogHeader>
            <MemberForm 
              gymId={currentGymId!} 
              onSuccess={() => setIsAddMemberOpen(false)} 
            />
          </DialogContent>
        </Dialog>
      </div>
      
      {isLoadingMembers ? (
        <div className="flex justify-center items-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <MemberTable 
          members={filteredMembers || []} 
          gymId={currentGymId}
        />
      )}
    </MainLayout>
  );
}
