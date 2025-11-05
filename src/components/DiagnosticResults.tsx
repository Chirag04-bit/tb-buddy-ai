import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, AlertTriangle, ArrowLeft } from "lucide-react";
import { DiagnosisResult } from "@/pages/Index";

type DiagnosticResultsProps = {
  results: DiagnosisResult;
  onReset: () => void;
};

export const DiagnosticResults = ({ results, onReset }: DiagnosticResultsProps) => {
  const getConfidenceBadge = (confidence: string) => {
    switch (confidence) {
      case "high":
        return <Badge className="bg-destructive text-destructive-foreground">High Confidence</Badge>;
      case "medium":
        return <Badge className="bg-warning text-warning-foreground">Medium Confidence</Badge>;
      case "low":
        return <Badge className="bg-muted text-muted-foreground">Low Confidence</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  const getConfidenceIcon = (confidence: string) => {
    switch (confidence) {
      case "high":
        return <AlertCircle className="h-6 w-6 text-destructive" />;
      case "medium":
        return <AlertTriangle className="h-6 w-6 text-warning" />;
      case "low":
        return <CheckCircle2 className="h-6 w-6 text-success" />;
      default:
        return <AlertCircle className="h-6 w-6 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button onClick={onReset} variant="outline" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Form
        </Button>
        <div>
          <h2 className="text-2xl font-bold">Diagnostic Analysis Complete</h2>
          <p className="text-sm text-muted-foreground">AI-generated assessment based on provided information</p>
        </div>
      </div>

      {/* Confidence Level */}
      <Card className="p-6 shadow-elevated border-l-4 border-l-primary">
        <div className="flex items-center gap-4">
          {getConfidenceIcon(results.confidence)}
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-1">Assessment Confidence</h3>
            {getConfidenceBadge(results.confidence)}
          </div>
        </div>
      </Card>

      {/* Summary */}
      <Card className="p-6 shadow-card">
        <h3 className="text-lg font-semibold mb-3">Summary</h3>
        <p className="text-foreground leading-relaxed">{results.summary}</p>
      </Card>

      {/* Key Findings */}
      <Card className="p-6 shadow-card">
        <h3 className="text-lg font-semibold mb-4">Key Findings</h3>
        <ul className="space-y-2">
          {results.findings.map((finding, index) => (
            <li key={index} className="flex items-start gap-2">
              <div className="min-w-2 h-2 rounded-full bg-primary mt-2" />
              <span className="text-foreground">{finding}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* Recommendations */}
      <Card className="p-6 shadow-card bg-secondary/30">
        <h3 className="text-lg font-semibold mb-3">Recommended Next Steps</h3>
        <p className="text-foreground leading-relaxed">{results.recommendation}</p>
      </Card>

      {/* Disclaimer */}
      <Card className="p-6 shadow-card border-l-4 border-l-warning bg-warning/5">
        <div className="flex gap-3">
          <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-warning mb-2">Medical Disclaimer</h3>
            <p className="text-sm text-foreground leading-relaxed">{results.disclaimer}</p>
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center pt-4">
        <Button onClick={onReset} size="lg" className="min-w-[200px]">
          Start New Assessment
        </Button>
      </div>
    </div>
  );
};