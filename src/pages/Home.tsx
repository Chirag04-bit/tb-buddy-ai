import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Heart, 
  Stethoscope, 
  MessageSquare, 
  Pill, 
  MapPin, 
  Shield,
  Activity,
  Hospital,
  Phone,
  History,
  LogOut,
  User
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useUserRole } from "@/hooks/use-user-role";
import type { Session } from "@supabase/supabase-js";

const Home = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const { isAdmin } = useUserRole(session);

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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  if (!session) {
    return null;
  }

  const features = [
    {
      icon: Stethoscope,
      title: "TB Detection Assistant",
      description: "Advanced AI-powered tuberculosis screening and diagnosis support",
      gradient: "from-blue-500 to-cyan-500",
      path: "/tb-diagnosis",
      iconBg: "bg-blue-500"
    },
    {
      icon: MessageSquare,
      title: "Symptom Checker",
      description: "Describe your symptoms and get personalized health guidance",
      gradient: "from-purple-500 to-pink-500",
      path: "/symptom-checker",
      iconBg: "bg-purple-500"
    },
    {
      icon: Activity,
      title: "Treatment Guide",
      description: "Learn about treatments, home remedies, and when to see a doctor",
      gradient: "from-green-500 to-emerald-500",
      path: "/treatments",
      iconBg: "bg-green-500"
    },
    {
      icon: Pill,
      title: "Medicine Information",
      description: "Find details about medications, dosages, and precautions",
      gradient: "from-orange-500 to-red-500",
      path: "/medicines",
      iconBg: "bg-orange-500"
    },
    {
      icon: Hospital,
      title: "Nearby Hospitals",
      description: "Locate nearby hospitals and emergency care facilities",
      gradient: "from-indigo-500 to-blue-500",
      path: "/hospitals",
      iconBg: "bg-indigo-500"
    },
    {
      icon: Phone,
      title: "Emergency Contacts",
      description: "Quick access to emergency helplines and support services",
      gradient: "from-red-500 to-rose-500",
      path: "/emergency",
      iconBg: "bg-red-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      {/* Decorative background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary via-primary to-accent shadow-lg">
                <Heart className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Lovable Health Assistant
                </h1>
                <p className="text-sm text-muted-foreground">Your caring health companion 💕</p>
              </div>
            </div>
            <div className="flex gap-2 items-center">
              <LanguageSwitcher />
              {isAdmin && (
                <Button onClick={() => navigate("/admin")} variant="outline" className="gap-2">
                  <Shield className="h-4 w-4" />
                  Admin
                </Button>
              )}
              <Button onClick={() => navigate("/profile")} variant="outline" className="gap-2">
                <User className="h-4 w-4" />
                Profile
              </Button>
              <Button onClick={() => navigate("/history")} variant="outline" className="gap-2">
                <History className="h-4 w-4" />
                History
              </Button>
              <Button onClick={handleSignOut} variant="outline" className="gap-2">
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 relative">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Welcome to Lovable Health
          </h2>
          <p className="text-lg text-muted-foreground">
            Your personal health assistant is here to help you understand symptoms, learn about treatments, 
            find medicines, and locate nearby hospitals. We're here to guide you with care and accurate information.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={index}
                className="group cursor-pointer transition-all duration-300 hover:shadow-elevated hover:scale-105 bg-gradient-to-br from-card to-card/80 backdrop-blur-sm border-border/50"
                onClick={() => navigate(feature.path)}
              >
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg ${feature.iconBg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="outline" 
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                  >
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Quick Info Section */}
      <section className="container mx-auto px-4 py-12 relative">
        <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-2xl">Important Disclaimer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              ⚠️ <strong>This platform is for educational and informational purposes only.</strong> 
              The information provided should not replace professional medical advice, diagnosis, or treatment.
            </p>
            <p>
              💊 Always consult a licensed healthcare professional before taking any medication or making health decisions.
            </p>
            <p>
              🚨 In case of emergency, call your local emergency number immediately or visit the nearest hospital.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border mt-12 py-6 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p className="font-medium">Lovable Health Assistant - Caring for Your Health 💗</p>
          <p className="mt-1">Your safety and health matter to us. Stay calm — we're here to guide you.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
