import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Loader2 } from "lucide-react";

export default function AuthPage() {
  const { login, register, isLoggingIn, isRegistering } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await login({ email, password });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    await register({ name, email, password });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 p-4">
      <div className="absolute inset-0 z-[-1] overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[100px]" />
        <div className="absolute top-[60%] -right-[10%] w-[40%] h-[40%] rounded-full bg-accent/50 blur-[100px]" />
      </div>

      <div className="mb-8 flex items-center gap-3">
        <div className="bg-primary text-primary-foreground p-2 rounded-xl shadow-lg shadow-primary/20">
          <Sparkles className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-display font-bold tracking-tight">LeadFlow CRM</h1>
      </div>

      <Card className="w-full max-w-md shadow-xl shadow-black/5 border-border/50 glass-panel">
        <Tabs defaultValue="login" className="w-full">
          <CardHeader className="px-6 pt-6 pb-2">
            <TabsList className="w-full grid grid-cols-2 bg-muted/50 p-1">
              <TabsTrigger value="login" className="rounded-md">Log In</TabsTrigger>
              <TabsTrigger value="register" className="rounded-md">Sign Up</TabsTrigger>
            </TabsList>
          </CardHeader>
          
          <CardContent className="px-6 pb-6 pt-4">
            <TabsContent value="login" className="mt-0 outline-none">
              <div className="mb-6">
                <CardTitle className="text-2xl mb-1">Welcome back</CardTitle>
                <CardDescription>Enter your credentials to access your account.</CardDescription>
              </div>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input 
                    id="login-email" 
                    type="email" 
                    placeholder="Enter your email address" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="focus-visible:ring-primary/20"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="login-password">Password</Label>
                  </div>
                  <Input 
                    id="login-password" 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="focus-visible:ring-primary/20"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-11 text-base shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5" 
                  disabled={isLoggingIn}
                >
                  {isLoggingIn ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                  Sign In
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register" className="mt-0 outline-none">
              <div className="mb-6">
                <CardTitle className="text-2xl mb-1">Create an account</CardTitle>
                <CardDescription>Start managing your leads and tasks today.</CardDescription>
              </div>
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-name">Full Name</Label>
                  <Input 
                    id="register-name" 
                    placeholder="Enter your name" 
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-email">Email</Label>
                  <Input 
                    id="register-email" 
                    type="email" 
                    placeholder="Enter your email address" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password">Password</Label>
                  <Input 
                    id="register-password" 
                    type="password" 
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-11 text-base shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5" 
                  disabled={isRegistering}
                >
                  {isRegistering ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                  Create Account
                </Button>
              </form>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
}
