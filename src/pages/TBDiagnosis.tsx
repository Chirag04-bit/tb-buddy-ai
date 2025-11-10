import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PatientForm } from "@/components/PatientForm";
import { SymptomChecklist } from "@/components/SymptomChecklist";
import { ImageUpload } from "@/components/ImageUpload";
import { DiagnosticResults } from "@/components/DiagnosticResults";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Stethoscope, Activity, History, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUserRole } from "@/hooks/use-user-role";
import type { Session } from "@supabase/supabase-js";

export type PatientData = {
  name: string;
  age: number;
  gender: string;
  duration: string;
  history: string;
};

export type DiagnosisResult = {
  summary: string;
  findings: string[];
  confidence: "low" | "medium" | "high";
  confidenceScore: number;
  classification: "no_tb" | "possible_tb" | "likely_tb";
  recommendation: string;
  disclaimer: string;
  lesions?: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
    confidence: number;
  }>;
};

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [session, setSession] = useState<Session | null>(null);
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [labResults, setLabResults] = useState<string>("");
  const [imageData, setImageData] = useState<string | null>(null);
  const [results, setResults] = useState<DiagnosisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
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

  const handleAnalyze = async () => {
    if (!patientData) {
      toast({
        title: t("missingInfo"),
        description: t("missingInfoDesc"),
        variant: "destructive",
      });
      return;
    }

    if (symptoms.length === 0) {
      toast({
        title: t("missingSymptoms"),
        description: t("missingSymptomsDesc"),
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setResults(null);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-diagnosis", {
        body: {
          patientData,
          symptoms,
          labResults,
          imageData,
        },
      });

      if (error) throw error;

      setResults(data as DiagnosisResult);
      toast({
        title: t("analysisComplete"),
        description: t("analysisCompleteDesc"),
      });
    } catch (error) {
      console.error("Analysis error:", error);
      toast({
        title: t("analysisFailed"),
        description: error instanceof Error ? error.message : "Failed to analyze patient data.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setPatientData(null);
    setSymptoms([]);
    setLabResults("");
    setImageData(null);
    setResults(null);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      {/* Decorative background elements */}
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
                <Stethoscope className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {t("appTitle")}
                </h1>
                <p className="text-sm text-muted-foreground">{t("appSubtitle")}</p>
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
              <Button onClick={() => navigate("/history")} variant="outline" className="gap-2">
                <History className="h-4 w-4" />
                {t("history")}
              </Button>
              <Button onClick={handleSignOut} variant="outline">
                {t("signOut")}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-6xl relative">
        {!results ? (
          <div className="space-y-6">
            {/* Patient Information */}
            <Card className="p-6 shadow-card bg-gradient-to-br from-card to-card/80 backdrop-blur-sm border-border/50">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">{t("patientInfo")}</h2>
              </div>
              <PatientForm onSubmit={setPatientData} />
            </Card>

            {/* Symptoms */}
            <Card className="p-6 shadow-card bg-gradient-to-br from-card to-card/80 backdrop-blur-sm border-border/50">
              <h2 className="text-xl font-semibold mb-4">{t("symptomsAssessment")}</h2>
              <SymptomChecklist selectedSymptoms={symptoms} onSymptomsChange={setSymptoms} />
            </Card>

            {/* Lab Results */}
            <Card className="p-6 shadow-card bg-gradient-to-br from-card to-card/80 backdrop-blur-sm border-border/50">
              <h2 className="text-xl font-semibold mb-4">{t("labResults")}</h2>
              <textarea
                className="w-full min-h-[100px] p-3 rounded-lg border border-input bg-background/50 backdrop-blur-sm text-foreground resize-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                placeholder={t("labResultsPlaceholder")}
                value={labResults}
                onChange={(e) => setLabResults(e.target.value)}
              />
            </Card>

            {/* Image Upload */}
            <Card className="p-6 shadow-card bg-gradient-to-br from-card to-card/80 backdrop-blur-sm border-border/50">
              <h2 className="text-xl font-semibold mb-4">{t("medicalImaging")}</h2>
              <ImageUpload onImageUpload={setImageData} />
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center pt-2">
              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                size="lg"
                className="min-w-[200px] bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all shadow-lg hover:shadow-xl"
              >
                {isAnalyzing ? t("analyzing") : t("generateDiagnosis")}
              </Button>
              <Button onClick={handleReset} variant="outline" size="lg">
                {t("resetForm")}
              </Button>
            </div>
          </div>
        ) : (
          <DiagnosticResults 
            results={results} 
            onReset={handleReset}
            patientData={patientData}
            imageData={imageData}
            symptoms={symptoms}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-12 py-6 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p className="font-medium">{t("footerText")}</p>
          <p className="mt-1">{t("footerSubtext")}</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;