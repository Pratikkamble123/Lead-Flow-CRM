import { useState } from "react";
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from "@/hooks/use-tasks";
import { useLeads } from "@/hooks/use-leads";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { CalendarIcon, Plus, Trash2, Calendar, User as UserIcon, Loader2 } from "lucide-react";

export default function Tasks() {
  const { data: tasks, isLoading } = useTasks();
  const { data: leads } = useLeads();
  
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "", 
    leadId: "none", 
    dueDate: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createTask.mutateAsync({
      title: formData.title,
      leadId: formData.leadId === "none" ? undefined : Number(formData.leadId),
      dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
    });
    setFormData({ title: "", leadId: "none", dueDate: "" });
    setIsCreateOpen(false);
  };

  const handleToggle = (id: number, completed: boolean) => {
    updateTask.mutate({ id, data: { completed } });
  };

  const pendingTasks = tasks?.filter(t => !t.completed) || [];
  const completedTasks = tasks?.filter(t => t.completed) || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold tracking-tight">Tasks</h2>
          <p className="text-muted-foreground mt-1">Keep track of your to-dos and follow-ups.</p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="shadow-md hover:shadow-lg transition-all">
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="title">Task Description *</Label>
                <Input id="title" required placeholder="e.g. Call John regarding proposal" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lead">Related Lead (Optional)</Label>
                <Select value={formData.leadId} onValueChange={(v) => setFormData({...formData, leadId: v})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a lead" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {leads?.map(lead => (
                      <SelectItem key={lead.id} value={lead.id.toString()}>{lead.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input 
                  id="dueDate" 
                  type="date" 
                  value={formData.dueDate} 
                  onChange={e => setFormData({...formData, dueDate: e.target.value})} 
                />
              </div>
              <Button type="submit" className="w-full mt-2" disabled={createTask.isPending}>
                {createTask.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Save Task
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="h-40 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Pending Tasks */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
              Pending <span className="ml-2 bg-primary/10 text-primary text-xs py-0.5 px-2 rounded-full">{pendingTasks.length}</span>
            </h3>
            <div className="space-y-3">
              {pendingTasks.length === 0 ? (
                <div className="text-center p-8 border border-dashed border-border/60 rounded-xl bg-card/30 text-muted-foreground text-sm">
                  You're all caught up! No pending tasks.
                </div>
              ) : (
                pendingTasks.map(task => (
                  <Card key={task.id} className="border border-border/50 shadow-sm hover:shadow-md transition-shadow group">
                    <CardContent className="p-4 flex gap-4 items-start">
                      <Checkbox 
                        className="mt-1 w-5 h-5 rounded-full border-muted-foreground/30 data-[state=checked]:bg-primary" 
                        checked={task.completed} 
                        onCheckedChange={(checked) => handleToggle(task.id, checked as boolean)} 
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground text-base mb-1.5">{task.title}</p>
                        <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
                          {task.dueDate && (
                            <div className={`flex items-center ${new Date(task.dueDate) < new Date() ? 'text-destructive font-medium' : ''}`}>
                              <CalendarIcon className="w-3.5 h-3.5 mr-1" />
                              {format(new Date(task.dueDate), "MMM d, yyyy")}
                            </div>
                          )}
                          {task.leadId && (
                            <div className="flex items-center bg-muted px-2 py-0.5 rounded-md">
                              <UserIcon className="w-3.5 h-3.5 mr-1" />
                              {leads?.find(l => l.id === task.leadId)?.name || 'Unknown Lead'}
                            </div>
                          )}
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => deleteTask.mutate(task.id)}
                        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Completed Tasks */}
          {completedTasks.length > 0 && (
            <div className="opacity-70">
              <h3 className="text-lg font-semibold text-foreground mb-4">Completed</h3>
              <div className="space-y-3">
                {completedTasks.map(task => (
                  <Card key={task.id} className="border border-border/30 shadow-none bg-muted/20">
                    <CardContent className="p-4 flex gap-4 items-start">
                      <Checkbox 
                        className="mt-1 w-5 h-5 rounded-full data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500" 
                        checked={task.completed} 
                        onCheckedChange={(checked) => handleToggle(task.id, checked as boolean)} 
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-muted-foreground line-through text-base mb-1.5">{task.title}</p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => deleteTask.mutate(task.id)}
                        className="text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
