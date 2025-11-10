import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Activity, ArrowLeft, Droplets, Utensils, AlertCircle, Hospital } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";

const Treatments = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        navigate("/auth");
      }
    });
  }, [navigate]);

  if (!session) return null;

  const treatmentCategories = [
    {
      icon: Droplets,
      title: "Home Remedies",
      description: "Simple steps for relief at home",
      color: "from-blue-500 to-cyan-500",
      treatments: [
        "Drink warm water with honey for sore throat",
        "Gargle with salt water for throat inflammation",
        "Steam inhalation for congestion relief",
        "Rest and adequate sleep for recovery"
      ]
    },
    {
      icon: Utensils,
      title: "Lifestyle & Diet",
      description: "Nutrition and habits for better health",
      color: "from-green-500 to-emerald-500",
      treatments: [
        "Stay hydrated - drink 8-10 glasses of water daily",
        "Eat vitamin C rich foods (citrus fruits, bell peppers)",
        "Avoid cold drinks and ice cream during illness",
        "Include ginger and turmeric in your diet"
      ]
    },
    {
      icon: Activity,
      title: "Medical Treatments",
      description: "Clinical approaches and therapies",
      color: "from-purple-500 to-pink-500",
      treatments: [
        "Antibiotics for bacterial infections (prescribed by doctor)",
        "Antivirals for viral infections (as prescribed)",
        "Pain relievers like Paracetamol (consult doctor)",
        "Physical therapy for mobility issues"
      ]
    },
    {
      icon: AlertCircle,
      title: "When to See a Doctor",
      description: "Warning signs requiring medical attention",
      color: "from-red-500 to-orange-500",
      treatments: [
        "Fever persisting for more than 3 days",
        "Difficulty breathing or chest pain",
        "Severe headache with stiff neck",
        "Persistent vomiting or diarrhea",
        "Blood in cough, stool, or urine",
        "Sudden severe abdominal pain"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-5">
          <div className="flex items-center gap-4">
            <Button onClick={() => navigate("/")} variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Treatment Guide</h1>
                <p className="text-sm text-muted-foreground">Learn about treatments and when to seek help</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Search */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <Input
              placeholder="Search treatments or conditions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-lg"
            />
          </CardContent>
        </Card>

        {/* Treatment Categories */}
        <div className="grid gap-6">
          {treatmentCategories.map((category, index) => {
            const Icon = category.icon;
            return (
              <Card key={index} className="overflow-hidden">
                <CardHeader className={`bg-gradient-to-r ${category.color} text-white`}>
                  <div className="flex items-center gap-3">
                    <Icon className="h-6 w-6" />
                    <div>
                      <CardTitle className="text-white">{category.title}</CardTitle>
                      <CardDescription className="text-white/90">{category.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <ul className="space-y-3">
                    {category.treatments.map((treatment, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>{treatment}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Disclaimer */}
        <Card className="mt-8 bg-gradient-to-br from-warning/10 to-destructive/10 border-warning">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-warning">
              <Hospital className="h-5 w-5" />
              Important Medical Disclaimer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-muted-foreground">
            <p>
              ⚠️ <strong>This information is for educational purposes only.</strong> Always consult a licensed healthcare professional before starting any treatment.
            </p>
            <p>
              💊 Never self-medicate without proper medical guidance. What works for others may not be suitable for you.
            </p>
            <p>
              🚨 In case of emergency, call your local emergency number immediately or visit the nearest hospital.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Treatments;
