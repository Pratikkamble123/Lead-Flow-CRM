import { useState } from "react";
import { useGenerateEmail } from "@/hooks/use-ai";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Sparkles, Copy, Check, Wand2, Loader2 } from "lucide-react";

export default function AiEmail() {
  const generateEmail = useGenerateEmail();
  const [formData, setFormData] = useState({
    leadName: "",
    businessType: "",
    goal: "Schedule a discovery call"
  });
  
  const [generatedResult, setGeneratedResult] = useState("");
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await generateEmail.mutateAsync(formData);
      setGeneratedResult(res.emailBody);
      setCopied(false);
    } catch (err) {
      // Error handled by hook
    }
  };

  const handleCopy = () => {
    if (generatedResult) {
      navigator.clipboard.writeText(generatedResult);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
      <div className="mb-8">
        <h2 className="text-3xl font-display font-bold tracking-tight flex items-center gap-2">
          <Sparkles className="w-8 h-8 text-primary" />
          AI Email Generator
        </h2>
        <p className="text-muted-foreground mt-2 text-lg">
          Craft personalized, high-converting outreach emails in seconds.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Form */}
        <Card className="lg:col-span-4 border-border/50 shadow-lg shadow-black/5 bg-card/50 backdrop-blur-sm h-fit">
          <CardHeader>
            <CardTitle className="text-xl">Context</CardTitle>
            <CardDescription>Provide details to generate the perfect message.</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="leadName">Recipient Name</Label>
                <Input 
                  id="leadName" 
                  placeholder="e.g. Sarah Connor" 
                  required
                  value={formData.leadName}
                  onChange={e => setFormData({...formData, leadName: e.target.value})}
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessType">Their Business / Industry</Label>
                <Input 
                  id="businessType" 
                  placeholder="e.g. SaaS Startup, Local Bakery" 
                  required
                  value={formData.businessType}
                  onChange={e => setFormData({...formData, businessType: e.target.value})}
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="goal">Outreach Goal</Label>
                <Textarea 
                  id="goal" 
                  placeholder="What do you want them to do?" 
                  rows={3}
                  required
                  value={formData.goal}
                  onChange={e => setFormData({...formData, goal: e.target.value})}
                  className="resize-none bg-background"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                type="submit" 
                className="w-full h-12 text-base shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all hover:-translate-y-0.5" 
                disabled={generateEmail.isPending}
              >
                {generateEmail.isPending ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <Wand2 className="w-5 h-5 mr-2" />
                )}
                Generate Magic
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Output Result */}
        <Card className="lg:col-span-8 border-border/50 shadow-md min-h-[500px] flex flex-col relative overflow-hidden">
          <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary opacity-50" />
          <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border/30">
            <div className="space-y-1">
              <CardTitle className="text-xl">Generated Draft</CardTitle>
              <CardDescription>Review and copy your message</CardDescription>
            </div>
            {generatedResult && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleCopy}
                className={`transition-all ${copied ? 'bg-green-50 text-green-600 border-green-200 hover:bg-green-50 hover:text-green-600' : ''}`}
              >
                {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                {copied ? 'Copied!' : 'Copy to Clipboard'}
              </Button>
            )}
          </CardHeader>
          <CardContent className="flex-1 p-0 relative">
            {generateEmail.isPending ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground bg-muted/10 backdrop-blur-[2px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                <p className="animate-pulse">Crafting the perfect words...</p>
              </div>
            ) : generatedResult ? (
              <div className="p-6 h-full">
                <Textarea 
                  value={generatedResult}
                  onChange={(e) => setGeneratedResult(e.target.value)}
                  className="w-full h-full min-h-[400px] p-0 border-0 focus-visible:ring-0 text-base leading-relaxed bg-transparent resize-none"
                />
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-12 text-center">
                <div className="w-16 h-16 bg-muted/50 rounded-2xl flex items-center justify-center mb-4">
                  <Sparkles className="w-8 h-8 text-muted-foreground/50" />
                </div>
                <p className="text-lg font-medium text-foreground mb-1">Waiting for instructions</p>
                <p className="max-w-sm">Fill out the context form on the left and hit generate to create a highly personalized email draft.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
