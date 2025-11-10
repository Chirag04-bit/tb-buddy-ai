import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Pill, ArrowLeft, AlertTriangle, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";

const Medicines = () => {
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

  const commonMedicines = [
    {
      name: "Paracetamol",
      genericName: "Acetaminophen",
      uses: ["Fever", "Mild to moderate pain", "Headache"],
      dosage: "500-1000mg every 4-6 hours (Max: 4g/day)",
      sideEffects: ["Nausea", "Allergic reactions (rare)", "Liver damage (overdose)"],
      precautions: "Avoid alcohol. Do not exceed recommended dose. Not for liver disease patients.",
      category: "Pain Relief"
    },
    {
      name: "Ibuprofen",
      genericName: "Ibuprofen",
      uses: ["Pain", "Inflammation", "Fever"],
      dosage: "200-400mg every 4-6 hours (Max: 1200mg/day)",
      sideEffects: ["Stomach upset", "Heartburn", "Dizziness"],
      precautions: "Take with food. Avoid in stomach ulcers. Not for prolonged use without consultation.",
      category: "Anti-inflammatory"
    },
    {
      name: "Amoxicillin",
      genericName: "Amoxicillin",
      uses: ["Bacterial infections", "Respiratory infections", "Ear infections"],
      dosage: "250-500mg every 8 hours (as prescribed)",
      sideEffects: ["Diarrhea", "Nausea", "Allergic rash"],
      precautions: "Complete full course. Report allergic reactions immediately. Prescription required.",
      category: "Antibiotic"
    },
    {
      name: "Cetirizine",
      genericName: "Cetirizine",
      uses: ["Allergies", "Hay fever", "Hives", "Itching"],
      dosage: "10mg once daily",
      sideEffects: ["Drowsiness", "Dry mouth", "Fatigue"],
      precautions: "May cause drowsiness. Avoid driving after taking. Stay hydrated.",
      category: "Antihistamine"
    },
    {
      name: "Omeprazole",
      genericName: "Omeprazole",
      uses: ["Acid reflux", "Heartburn", "Stomach ulcers"],
      dosage: "20-40mg once daily before breakfast",
      sideEffects: ["Headache", "Nausea", "Diarrhea"],
      precautions: "Not for immediate relief. May take 1-4 days to work. Long-term use needs monitoring.",
      category: "Proton Pump Inhibitor"
    }
  ];

  const filteredMedicines = commonMedicines.filter(med =>
    med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    med.uses.some(use => use.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 shadow-lg">
                <Pill className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Medicine Information</h1>
                <p className="text-sm text-muted-foreground">Learn about common medications</p>
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
              placeholder="Search medicines by name or condition..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-lg"
            />
          </CardContent>
        </Card>

        {/* Warning Banner */}
        <Card className="mb-8 border-warning bg-warning/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-warning mt-1 flex-shrink-0" />
              <div className="space-y-2">
                <p className="font-semibold text-warning">Important Medication Safety Notice</p>
                <p className="text-sm text-muted-foreground">
                  This information is for educational purposes only. <strong>Always consult a licensed healthcare professional before taking any medication.</strong> Self-medication can be dangerous. Dosages may vary based on age, weight, and medical conditions.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Medicines Grid */}
        <div className="grid gap-6">
          {filteredMedicines.map((medicine, index) => (
            <Card key={index} className="overflow-hidden hover:shadow-elevated transition-shadow">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">{medicine.name}</CardTitle>
                    <CardDescription className="text-base">
                      Generic: {medicine.genericName}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary">{medicine.category}</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                {/* Uses */}
                <div>
                  <h4 className="font-semibold flex items-center gap-2 mb-2">
                    <Info className="h-4 w-4 text-primary" />
                    Common Uses
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {medicine.uses.map((use, idx) => (
                      <Badge key={idx} variant="outline">{use}</Badge>
                    ))}
                  </div>
                </div>

                {/* Dosage */}
                <div>
                  <h4 className="font-semibold mb-2">💊 Typical Dosage</h4>
                  <p className="text-muted-foreground bg-muted p-3 rounded-lg">
                    {medicine.dosage}
                  </p>
                </div>

                {/* Side Effects */}
                <div>
                  <h4 className="font-semibold mb-2">⚠️ Possible Side Effects</h4>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    {medicine.sideEffects.map((effect, idx) => (
                      <li key={idx}>{effect}</li>
                    ))}
                  </ul>
                </div>

                {/* Precautions */}
                <div className="bg-warning/5 border border-warning/20 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2 text-warning">🔒 Precautions</h4>
                  <p className="text-sm">{medicine.precautions}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredMedicines.length === 0 && (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              No medicines found matching your search. Try different keywords.
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Medicines;
