import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

type LoginRequest = z.infer<typeof api.auth.login.input>;
type RegisterRequest = z.infer<typeof api.auth.register.input>;

export function useAuth() {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: user, isLoading, error } = useQuery({
    queryKey: [api.auth.me.path],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      if (!token) return null;
      
      const res = await fetch(api.auth.me.path, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem("token");
        }
        return null;
      }
      const data = await res.json();
      return api.auth.me.responses[200].parse(data).user;
    },
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginRequest) => {
      const res = await apiRequest(
        api.auth.login.method,
        api.auth.login.path,
        credentials
      );
      const data = await res.json();
      return api.auth.login.responses[200].parse(data);
    },
    onSuccess: (data) => {
      localStorage.setItem("token", data.token);
      queryClient.setQueryData([api.auth.me.path], data.user);
      setLocation("/");
      toast({ title: "Welcome back!" });
    },
    onError: (err: Error) => {
      toast({
        title: "Login failed",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: RegisterRequest) => {
      const res = await apiRequest(
        api.auth.register.method,
        api.auth.register.path,
        credentials
      );
      const data = await res.json();
      return api.auth.register.responses[201].parse(data);
    },
    onSuccess: (data) => {
      localStorage.setItem("token", data.token);
      queryClient.setQueryData([api.auth.me.path], data.user);
      setLocation("/");
      toast({ title: "Account created successfully!" });
    },
    onError: (err: Error) => {
      toast({
        title: "Registration failed",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  const logout = () => {
    localStorage.removeItem("token");
    queryClient.setQueryData([api.auth.me.path], null);
    setLocation("/auth");
    toast({ title: "Logged out successfully" });
  };

  return {
    user,
    isLoading,
    error,
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    register: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    logout,
  };
}
