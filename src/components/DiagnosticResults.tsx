import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, AlertTriangle, ArrowLeft } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { DiagnosisResult } from "@/pages/Index";

type DiagnosticResultsProps = {
  results: DiagnosisResult;
  onReset: () => void;
};

export const DiagnosticResults = ({ results, onReset }: DiagnosticResultsProps) => {
  const { t } = useLanguage();
  
  const getConfidenceBadge = (confidence: string) => {
    switch (confidence) {
      case "high":
        return <Badge className="bg-destructive text-destructive-foreground">{t("high")} {t("confidenceLevel")}</Badge>;
      case "medium":
        return <Badge className="bg-warning text-warning-foreground">{t("medium")} {t("confidenceLevel")}</Badge>;
      case "low":
        return <Badge className="bg-muted text-muted-foreground">{t("low")} {t("confidenceLevel")}</Badge>;
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
          <h2 className="text-2xl font-bold">{t("diagnosticResults")}</h2>
          <p className="text-sm text-muted-foreground">AI-generated assessment based on provided information</p>
        </div>
      </div>

      {/* Confidence Level */}
      <Card className="p-6 shadow-elevated border-l-4 border-l-primary bg-gradient-to-br from-card to-card/80 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          {getConfidenceIcon(results.confidence)}
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-1">Assessment {t("confidenceLevel")}</h3>
            {getConfidenceBadge(results.confidence)}
          </div>
        </div>
      </Card>

      {/* Summary */}
      <Card className="p-6 shadow-card bg-gradient-to-br from-card to-card/80 backdrop-blur-sm">
        <h3 className="text-lg font-semibold mb-3">Summary</h3>
        <p className="text-foreground leading-relaxed">{results.summary}</p>
      </Card>

      {/* Key Findings */}
      <Card className="p-6 shadow-card bg-gradient-to-br from-card to-card/80 backdrop-blur-sm">
        <h3 className="text-lg font-semibold mb-4">{t("keyFindings")}</h3>
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
      <Card className="p-6 shadow-card bg-gradient-to-br from-secondary/20 to-secondary/10 backdrop-blur-sm">
        <h3 className="text-lg font-semibold mb-3">{t("recommendation")}</h3>
        <p className="text-foreground leading-relaxed">{results.recommendation}</p>
      </Card>

      {/* Disclaimer */}
      <Card className="p-6 shadow-card border-l-4 border-l-warning bg-gradient-to-br from-warning/5 to-warning/10">
        <div className="flex gap-3">
          <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-warning mb-2">{t("disclaimer")}</h3>
            <p className="text-sm text-foreground leading-relaxed">{t("disclaimerText")}</p>
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center pt-4">
        <Button onClick={onReset} size="lg" className="min-w-[200px] bg-gradient-to-r from-primary to-accent">
          Start New Assessment
        </Button>
      </div>
    </div>
  );
};