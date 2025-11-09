import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { Activity, Users, FileText, TrendingUp, ArrowLeft, Shield, UserCog } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Session } from "@supabase/supabase-js";

type AnalyticsData = {
  total_assessments: number;
  assessments_with_imaging: number;
  high_confidence: number;
  medium_confidence: number;
  low_confidence: number;
  last_7_days: number;
  last_30_days: number;
};

type AssessmentStats = {
  date: string;
  total_count: number;
  high_confidence_count: number;
  medium_confidence_count: number;
  low_confidence_count: number;
};

type UserRole = {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
};

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [stats, setStats] = useState<AssessmentStats[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        navigate("/auth");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const checkAdminAccess = async () => {
      if (!session?.user) return;

      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .eq('role', 'admin')
          .maybeSingle();

        if (error) throw error;

        if (!data) {
          toast({
            title: "Access Denied",
            description: "You do not have admin privileges.",
            variant: "destructive",
          });
          navigate("/");
          return;
        }

        setIsAdmin(true);
        await loadAnalytics();
      } catch (error) {
        console.error("Error checking admin access:", error);
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      checkAdminAccess();
    }
  }, [session, navigate, toast]);

  const loadAnalytics = async () => {
    try {
      // Load analytics summary
      const { data: analyticsData, error: analyticsError } = await supabase
        .from('admin_analytics')
        .select('*')
        .single();

      if (analyticsError) throw analyticsError;
      setAnalytics(analyticsData);

      // Load daily stats
      const { data: statsData, error: statsError } = await supabase
        .rpc('get_assessment_stats', { days_back: 30 });

      if (statsError) throw statsError;
      setStats(statsData || []);

      // Load user roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('*')
        .order('created_at', { ascending: false });

      if (rolesError) throw rolesError;
      setUserRoles(rolesData || []);
    } catch (error) {
      console.error("Error loading analytics:", error);
      toast({
        title: "Error",
        description: "Failed to load analytics data.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const confidenceData = analytics ? [
    { name: 'High', value: analytics.high_confidence, color: 'hsl(var(--destructive))' },
    { name: 'Medium', value: analytics.medium_confidence, color: 'hsl(var(--accent))' },
    { name: 'Low', value: analytics.low_confidence, color: 'hsl(var(--primary))' },
  ] : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button onClick={() => navigate("/")} variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary" />
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="patients">Patients</TabsTrigger>
            <TabsTrigger value="roles">Roles</TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-6">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-6 bg-gradient-to-br from-card to-card/80">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-primary/10">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Assessments</p>
                    <p className="text-2xl font-bold">{analytics?.total_assessments || 0}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-card to-card/80">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-accent/10">
                    <Activity className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">With Imaging</p>
                    <p className="text-2xl font-bold">{analytics?.assessments_with_imaging || 0}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-card to-card/80">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-primary/10">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Last 7 Days</p>
                    <p className="text-2xl font-bold">{analytics?.last_7_days || 0}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-card to-card/80">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-accent/10">
                    <Users className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Last 30 Days</p>
                    <p className="text-2xl font-bold">{analytics?.last_30_days || 0}</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Confidence Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={confidenceData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {confidenceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Daily Assessment Trends (30 Days)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={stats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="total_count" stroke="hsl(var(--primary))" name="Total" />
                    <Line type="monotone" dataKey="high_confidence_count" stroke="hsl(var(--destructive))" name="High" />
                    <Line type="monotone" dataKey="medium_confidence_count" stroke="hsl(var(--accent))" name="Medium" />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </div>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Confidence Level Breakdown</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={confidenceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </TabsContent>

          <TabsContent value="patients" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Patient Management</h3>
              <p className="text-muted-foreground">
                Patient tracking and management features will be available here.
                Navigate to the History page to view all assessments.
              </p>
              <Button onClick={() => navigate("/history")} className="mt-4">
                View All Assessments
              </Button>
            </Card>
          </TabsContent>

          <TabsContent value="roles" className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">User Roles Management</h3>
                <UserCog className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground mb-4">
                  Total users with roles: {userRoles.length}
                </p>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium">User ID</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Role</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Created</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {userRoles.map((userRole) => (
                        <tr key={userRole.id} className="hover:bg-muted/50">
                          <td className="px-4 py-3 text-sm font-mono">{userRole.user_id.slice(0, 8)}...</td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              userRole.role === 'admin' ? 'bg-destructive/10 text-destructive' :
                              userRole.role === 'clinician' ? 'bg-accent/10 text-accent' :
                              userRole.role === 'radiologist' ? 'bg-primary/10 text-primary' :
                              'bg-muted text-muted-foreground'
                            }`}>
                              {userRole.role}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">
                            {new Date(userRole.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
