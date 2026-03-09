import { useDashboardStats } from "@/hooks/use-dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TrendingUp, Clock, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { useRecentActivity } from "@/hooks/use-recent-activity";
export default function Dashboard() {
  const { data: stats, isLoading } = useDashboardStats();
const { data: activities = [], isLoading: activityLoading } = useRecentActivity();
  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Leads",
      value: stats?.totalLeads || 0,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
      trend: "+12% from last month"
    },
    {
      title: "Converted Leads",
      value: stats?.convertedLeads || 0,
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/20",
      trend: "+4% from last month"
    },
    {
      title: "Pending Leads",
      value: stats?.pendingLeads || 0,
      icon: Clock,
      color: "text-amber-600",
      bgColor: "bg-amber-100 dark:bg-amber-900/20",
      trend: "Requires attention"
    },
    {
      title: "Total Tasks",
      value: stats?.totalTasks || 0,
      icon: CheckCircle2,
      color: "text-indigo-600",
      bgColor: "bg-indigo-100 dark:bg-indigo-900/20",
      trend: "Across all projects"
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-display font-bold tracking-tight">Overview</h2>
        <p className="text-muted-foreground mt-1">Here's what's happening with your business today.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <Card key={i} className="hover:shadow-lg transition-all duration-300 border-border/50 bg-card overflow-hidden group">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2.5 rounded-xl ${stat.bgColor} group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-display font-bold text-foreground">
                {stat.value}
              </div>
              <p className="text-xs text-muted-foreground mt-2 font-medium">
                {stat.trend}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-2 border-border/50 shadow-sm min-h-[400px]">
          <CardHeader>
            <CardTitle className="font-display">Recent Activity</CardTitle>
          </CardHeader>
         <CardContent className="h-[300px] overflow-y-auto">
  {activityLoading ? (
    <div className="flex justify-center items-center h-full">
      <Loader2 className="w-6 h-6 animate-spin text-primary" />
    </div>
  ) : activities.length === 0 ? (
    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
      <TrendingUp className="w-8 h-8 mb-3 opacity-40" />
      <p>No recent activity yet</p>
    </div>
  ) : (
    <div className="space-y-4">
      {activities.map((activity: any) => (
        <div key={activity.id} className="flex items-start gap-3 border-b pb-3">
          <div className="w-2 h-2 bg-primary rounded-full mt-2" />
          <div>
            <p className="text-sm font-medium">{activity.message}</p>
            <p className="text-xs text-muted-foreground">
              {new Date(activity.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  )}
</CardContent>
        </Card>
        <Card className="col-span-1 border-border/50 shadow-sm min-h-[400px] bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader>
            <CardTitle className="font-display">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <a href="/leads" className="block p-4 rounded-xl border border-border/50 bg-background hover:border-primary/30 hover:shadow-md transition-all group">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-lg text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-medium text-sm text-foreground">Add New Lead</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">Enter a new prospect</p>
                </div>
              </div>
            </a>
            <a href="/ai-email" className="block p-4 rounded-xl border border-border/50 bg-background hover:border-primary/30 hover:shadow-md transition-all group">
              <div className="flex items-center gap-3">
                <div className="bg-accent/50 p-2 rounded-lg text-accent-foreground group-hover:bg-accent-foreground group-hover:text-white transition-colors">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-medium text-sm text-foreground">Generate Email</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">Use AI to draft outreach</p>
                </div>
              </div>
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
