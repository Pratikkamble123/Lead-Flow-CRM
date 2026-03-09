import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

type CreateLeadRequest = z.infer<typeof api.leads.create.input>;
type UpdateLeadRequest = z.infer<typeof api.leads.update.input>;

export function useLeads() {
  return useQuery({
    queryKey: [api.leads.list.path],
    queryFn: async () => {
      const res = await fetch(api.leads.list.path, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      if (!res.ok) throw new Error("Failed to fetch leads");
      const data = await res.json();
      return api.leads.list.responses[200].parse(data);
    },
  });
}

export function useCreateLead() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (lead: CreateLeadRequest) => {
      const res = await apiRequest(api.leads.create.method, api.leads.create.path, lead);
      const data = await res.json();
      return api.leads.create.responses[201].parse(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.leads.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.dashboard.stats.path] });
      toast({ title: "Lead created successfully" });
    },
    onError: (err: Error) => {
      toast({ title: "Failed to create lead", description: err.message, variant: "destructive" });
    },
  });
}

export function useUpdateLead() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateLeadRequest }) => {
      const url = buildUrl(api.leads.update.path, { id });
      const res = await apiRequest(api.leads.update.method, url, data);
      const resData = await res.json();
      return api.leads.update.responses[200].parse(resData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.leads.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.dashboard.stats.path] });
      toast({ title: "Lead updated" });
    },
    onError: (err: Error) => {
      toast({ title: "Failed to update lead", description: err.message, variant: "destructive" });
    },
  });
}

export function useDeleteLead() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.leads.delete.path, { id });
      await apiRequest(api.leads.delete.method, url);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.leads.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.dashboard.stats.path] });
      toast({ title: "Lead deleted" });
    },
    onError: (err: Error) => {
      toast({ title: "Failed to delete lead", description: err.message, variant: "destructive" });
    },
  });
}
