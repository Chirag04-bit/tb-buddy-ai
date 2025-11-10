import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, AlertTriangle, XCircle, FileText, RotateCcw, Download } from "lucide-react";
import { DiagnosisResult, PatientData } from "@/pages/TBDiagnosis";
import { useLanguage } from "@/contexts/LanguageContext";
import { jsPDF } from "jspdf";
import { ImageViewer } from "./ImageViewer";

type DiagnosticResultsProps = {
  results: DiagnosisResult;
  onReset: () => void;
  patientData?: PatientData;
  imageData?: string | null;
  symptoms?: string[];
};

export const DiagnosticResults = ({ results, onReset, patientData, imageData, symptoms }: DiagnosticResultsProps) => {
  const { t } = useLanguage();

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case "high": return "text-destructive";
      case "medium": return "text-accent";
      case "low": return "text-primary";
      default: return "text-muted-foreground";
    }
  };

  const getClassificationInfo = (classification: string) => {
    switch (classification) {
      case "no_tb":
        return { icon: CheckCircle2, color: "text-primary", bgColor: "bg-primary/10", label: "No TB Detected" };
      case "possible_tb":
        return { icon: AlertTriangle, color: "text-accent", bgColor: "bg-accent/10", label: "Possible TB - Further Tests Recommended" };
      case "likely_tb":
        return { icon: XCircle, color: "text-destructive", bgColor: "bg-destructive/10", label: "Likely TB - Immediate Action Required" };
      default:
        return { icon: FileText, color: "text-muted-foreground", bgColor: "bg-muted", label: "Unknown" };
    }
  };

  const generatePDF = async () => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;
    let yPos = margin;

    // Header
    pdf.setFillColor(37, 99, 235);
    pdf.rect(0, 0, pageWidth, 25, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('TB Diagnostic Report', margin, 15);
    
    yPos = 35;
    pdf.setTextColor(0, 0, 0);

    // Patient Information
    if (patientData) {
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Patient Information', margin, yPos);
      yPos += 8;
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Name: ${patientData.name}`, margin, yPos);
      yPos += 6;
      pdf.text(`Age: ${patientData.age} | Gender: ${patientData.gender}`, margin, yPos);
      yPos += 6;
      pdf.text(`Symptom Duration: ${patientData.duration}`, margin, yPos);
      yPos += 6;
      if (patientData.history) {
        pdf.text(`Medical History: ${patientData.history}`, margin, yPos, { maxWidth: pageWidth - 2 * margin });
        yPos += 10;
      }
    }

    // Symptoms
    if (symptoms && symptoms.length > 0) {
      yPos += 5;
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Reported Symptoms', margin, yPos);
      yPos += 8;
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      symptoms.forEach(symptom => {
        pdf.text(`• ${symptom}`, margin + 5, yPos);
        yPos += 5;
      });
    }

    // X-ray Image
    if (imageData) {
      yPos += 10;
      if (yPos > pageHeight - 80) {
        pdf.addPage();
        yPos = margin;
      }
      
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Medical Imaging', margin, yPos);
      yPos += 8;
      
      try {
        const imgWidth = 80;
        const imgHeight = 80;
        pdf.addImage(imageData, 'JPEG', margin, yPos, imgWidth, imgHeight);
        yPos += imgHeight + 10;
      } catch (error) {
        console.error('Error adding image to PDF:', error);
      }
    }

    // New page for results
    pdf.addPage();
    yPos = margin;

    // Diagnostic Results
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('AI Diagnostic Analysis', margin, yPos);
    yPos += 10;

    // Classification
    const classificationInfo = getClassificationInfo(results.classification);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Classification: ${classificationInfo.label}`, margin, yPos);
    yPos += 8;

    // Confidence Score
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Confidence Score: ${results.confidenceScore}% (${results.confidence.toUpperCase()})`, margin, yPos);
    yPos += 10;

    // Summary
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Summary', margin, yPos);
    yPos += 6;
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    const summaryLines = pdf.splitTextToSize(results.summary, pageWidth - 2 * margin);
    pdf.text(summaryLines, margin, yPos);
    yPos += summaryLines.length * 5 + 5;

    // Findings
    if (results.findings.length > 0) {
      yPos += 5;
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Key Findings', margin, yPos);
      yPos += 6;
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      results.findings.forEach(finding => {
        if (yPos > pageHeight - 20) {
          pdf.addPage();
          yPos = margin;
        }
        const findingLines = pdf.splitTextToSize(`• ${finding}`, pageWidth - 2 * margin - 5);
        pdf.text(findingLines, margin + 5, yPos);
        yPos += findingLines.length * 5 + 2;
      });
    }

    // Recommendations
    yPos += 5;
    if (yPos > pageHeight - 40) {
      pdf.addPage();
      yPos = margin;
    }
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Recommendations', margin, yPos);
    yPos += 6;
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    const recLines = pdf.splitTextToSize(results.recommendation, pageWidth - 2 * margin);
    pdf.text(recLines, margin, yPos);
    yPos += recLines.length * 5 + 10;

    // Disclaimer
    yPos += 5;
    if (yPos > pageHeight - 30) {
      pdf.addPage();
      yPos = margin;
    }
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'italic');
    pdf.setTextColor(100, 100, 100);
    const disclaimerLines = pdf.splitTextToSize(results.disclaimer, pageWidth - 2 * margin);
    pdf.text(disclaimerLines, margin, yPos);

    // Footer
    pdf.setFontSize(8);
    pdf.setTextColor(150, 150, 150);
    pdf.text(`Generated on ${new Date().toLocaleString()}`, margin, pageHeight - 10);
    pdf.text('TB Diagnostic Assistant - AI-Powered Analysis', pageWidth - margin - 60, pageHeight - 10);

    // Save PDF
    pdf.save(`TB_Report_${patientData?.name || 'Patient'}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const classificationInfo = getClassificationInfo(results.classification);
  const ConfidenceIcon = classificationInfo.icon;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <Card className="p-6 shadow-card bg-gradient-to-br from-card to-card/80 backdrop-blur-sm border-border/50">
        <div className="flex items-start gap-4 mb-6">
          <div className={`p-3 rounded-full ${classificationInfo.bgColor}`}>
            <ConfidenceIcon className={`h-8 w-8 ${classificationInfo.color}`} />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2">{classificationInfo.label}</h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Confidence Score:</span>
                <span className={`text-lg font-bold ${getConfidenceColor(results.confidence)}`}>
                  {results.confidenceScore}%
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Level:</span>
                <span className={`text-sm font-semibold ${getConfidenceColor(results.confidence)}`}>
                  {results.confidence.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">{t("summary")}</h3>
          <p className="text-foreground leading-relaxed">{results.summary}</p>
        </div>

        {/* Key Findings */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">{t("keyFindings")}</h3>
          <ul className="space-y-2">
            {results.findings.map((finding, index) => (
              <li key={index} className="flex items-start gap-2">
                <div className="min-w-2 h-2 rounded-full bg-primary mt-2" />
                <span className="text-foreground">{finding}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Recommendations */}
        <div className="mb-6 p-4 rounded-lg bg-secondary/20 border border-border">
          <h3 className="text-lg font-semibold mb-3">{t("recommendation")}</h3>
          <p className="text-foreground leading-relaxed">{results.recommendation}</p>
        </div>

        {/* Image Viewer with Lesion Overlays */}
        {imageData && (
          <div className="mt-6">
            <ImageViewer imageData={imageData} lesions={results.lesions} />
          </div>
        )}

        <Alert className="bg-muted/50 border-muted-foreground/20">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <strong>{t("disclaimer")}:</strong> {results.disclaimer}
          </AlertDescription>
        </Alert>

        <div className="flex gap-4 justify-center mt-6">
          <Button onClick={generatePDF} size="lg" className="bg-gradient-to-r from-primary to-accent">
            <Download className="mr-2 h-4 w-4" />
            Download PDF Report
          </Button>
          <Button onClick={onReset} variant="outline" size="lg">
            <RotateCcw className="mr-2 h-4 w-4" />
            {t("newAssessment")}
          </Button>
        </div>
      </Card>
    </div>
  );
};
