import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Phone, ArrowLeft, AlertCircle, Heart, Brain, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";

const Emergency = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        navigate("/auth");
      }
    });
  }, [navigate]);

  if (!session) return null;

  const emergencyNumbers = [
    {
      icon: AlertCircle,
      title: "National Emergency",
      numbers: [
        { country: "India", number: "108", description: "All emergencies" },
        { country: "USA", number: "911", description: "All emergencies" },
        { country: "UK", number: "999", description: "All emergencies" },
        { country: "Australia", number: "000", description: "All emergencies" }
      ],
      color: "from-red-500 to-rose-500"
    },
    {
      icon: Heart,
      title: "Ambulance Service",
      numbers: [
        { country: "India", number: "102", description: "Ambulance" },
        { country: "India", number: "108", description: "Free ambulance" }
      ],
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Brain,
      title: "Mental Health Helpline",
      numbers: [
        { country: "India", number: "1800-599-0019", description: "NIMHANS Helpline" },
        { country: "USA", number: "988", description: "Suicide & Crisis Lifeline" },
        { country: "UK", number: "116 123", description: "Samaritans" }
      ],
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Shield,
      title: "Poison Control",
      numbers: [
        { country: "India", number: "1066", description: "Poison Information Center" },
        { country: "USA", number: "1-800-222-1222", description: "Poison Control" }
      ],
      color: "from-orange-500 to-yellow-500"
    }
  ];

  const emergencyGuidelines = [
    {
      title: "When to Call Emergency Services",
      items: [
        "Severe chest pain or difficulty breathing",
        "Uncontrolled bleeding or severe injuries",
        "Loss of consciousness or seizures",
        "Suspected heart attack or stroke symptoms",
        "Severe allergic reactions (anaphylaxis)",
        "Poisoning or drug overdose",
        "Suicidal thoughts or severe mental health crisis"
      ]
    },
    {
      title: "What to Tell Emergency Services",
      items: [
        "Your exact location with landmarks",
        "Nature of the emergency",
        "Number of people involved",
        "Condition of the patient(s)",
        "Any immediate dangers present",
        "Your callback number"
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
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-red-500 to-rose-500 shadow-lg">
                <Phone className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Emergency Contacts</h1>
                <p className="text-sm text-muted-foreground">Quick access to emergency services</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Warning Banner */}
        <Card className="mb-8 border-destructive bg-destructive/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-6 w-6 text-destructive mt-1 flex-shrink-0" />
              <div>
                <p className="font-bold text-destructive text-lg mb-2">
                  🚨 In Life-Threatening Emergency - Call Immediately!
                </p>
                <p className="text-muted-foreground">
                  Don't wait. If you or someone needs immediate medical attention, call emergency services right now. 
                  Stay calm and follow the operator's instructions.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Numbers */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {emergencyNumbers.map((category, index) => {
            const Icon = category.icon;
            return (
              <Card key={index} className="overflow-hidden">
                <CardHeader className={`bg-gradient-to-r ${category.color} text-white`}>
                  <div className="flex items-center gap-3">
                    <Icon className="h-6 w-6" />
                    <CardTitle className="text-white">{category.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-3">
                  {category.numbers.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <p className="font-semibold">{item.country}</p>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                      <Button 
                        variant="default" 
                        size="sm"
                        className="gap-2"
                        onClick={() => window.open(`tel:${item.number}`)}
                      >
                        <Phone className="h-3 w-3" />
                        {item.number}
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Guidelines */}
        <div className="grid md:grid-cols-2 gap-6">
          {emergencyGuidelines.map((guideline, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle>{guideline.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {guideline.items.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-primary mt-1">✓</span>
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Resources */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Remember</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-muted-foreground">
              💗 <strong>Your safety and health matter to us.</strong> Stay calm — help is available 24/7.
            </p>
            <p className="text-muted-foreground">
              📱 Save these numbers in your phone for quick access during emergencies.
            </p>
            <p className="text-muted-foreground">
              🏥 Know the location of your nearest hospital or emergency room.
            </p>
            <p className="text-muted-foreground">
              🧘 For non-emergency medical advice, contact your primary care physician or local health clinic.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Emergency;
