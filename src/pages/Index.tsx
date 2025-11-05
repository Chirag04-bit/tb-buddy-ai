import { useState } from "react";
import { PatientForm } from "@/components/PatientForm";
import { SymptomChecklist } from "@/components/SymptomChecklist";
import { ImageUpload } from "@/components/ImageUpload";
import { DiagnosticResults } from "@/components/DiagnosticResults";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Stethoscope, Activity } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  recommendation: string;
  disclaimer: string;
};

const Index = () => {
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [labResults, setLabResults] = useState<string>("");
  const [imageData, setImageData] = useState<string | null>(null);
  const [results, setResults] = useState<DiagnosisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!patientData) {
      toast({
        title: "Missing Information",
        description: "Please fill out the patient information form.",
        variant: "destructive",
      });
      return;
    }

    if (symptoms.length === 0) {
      toast({
        title: "Missing Symptoms",
        description: "Please select at least one symptom.",
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
        title: "Analysis Complete",
        description: "Diagnostic analysis has been generated successfully.",
      });
    } catch (error) {
      console.error("Analysis error:", error);
      toast({
        title: "Analysis Failed",
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-accent">
              <Stethoscope className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">TB Detection Assistant</h1>
              <p className="text-sm text-muted-foreground">AI-Powered Tuberculosis Diagnostic Support</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {!results ? (
          <div className="space-y-6">
            {/* Patient Information */}
            <Card className="p-6 shadow-card">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Patient Information</h2>
              </div>
              <PatientForm onSubmit={setPatientData} />
            </Card>

            {/* Symptoms */}
            <Card className="p-6 shadow-card">
              <h2 className="text-xl font-semibold mb-4">Symptoms Assessment</h2>
              <SymptomChecklist selectedSymptoms={symptoms} onSymptomsChange={setSymptoms} />
            </Card>

            {/* Lab Results */}
            <Card className="p-6 shadow-card">
              <h2 className="text-xl font-semibold mb-4">Laboratory Results (Optional)</h2>
              <textarea
                className="w-full min-h-[100px] p-3 rounded-lg border border-input bg-background text-foreground resize-none focus:ring-2 focus:ring-ring focus:border-transparent"
                placeholder="Enter any available lab test results (e.g., sputum microscopy, GeneXpert, Mantoux test)..."
                value={labResults}
                onChange={(e) => setLabResults(e.target.value)}
              />
            </Card>

            {/* Image Upload */}
            <Card className="p-6 shadow-card">
              <h2 className="text-xl font-semibold mb-4">Medical Imaging</h2>
              <ImageUpload onImageUpload={setImageData} />
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center">
              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                size="lg"
                className="min-w-[200px] bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
              >
                {isAnalyzing ? "Analyzing..." : "Generate Diagnosis"}
              </Button>
              <Button onClick={handleReset} variant="outline" size="lg">
                Reset Form
              </Button>
            </div>
          </div>
        ) : (
          <DiagnosticResults results={results} onReset={handleReset} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-12 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>TB Detection Assistant - For Educational and Screening Purposes Only</p>
          <p className="mt-1">Always consult qualified healthcare professionals for medical advice</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;