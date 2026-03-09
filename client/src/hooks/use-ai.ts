import { useMutation } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

type GenerateEmailRequest = z.infer<typeof api.ai.generateEmail.input>;

export function useGenerateEmail() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: GenerateEmailRequest) => {
      const res = await apiRequest(
        api.ai.generateEmail.method,
        api.ai.generateEmail.path,
        data
      );
      const resData = await res.json();
      return api.ai.generateEmail.responses[200].parse(resData);
    },
    onError: (err: Error) => {
      toast({ 
        title: "AI Generation Failed", 
        description: err.message, 
        variant: "destructive" 
      });
    },
  });
}
