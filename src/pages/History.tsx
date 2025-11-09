import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUserRole } from "@/hooks/use-user-role";
import { Stethoscope, Search, ArrowLeft, FileText, Trash2, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import type { Session } from "@supabase/supabase-js";

type Assessment = {
  id: string;
  patient_name: string;
  patient_age: number;
  patient_gender: string;
  symptom_duration: string;
  medical_history: string | null;
  symptoms: string[];
  confidence: string;
  diagnosis_summary: string;
  findings: string[];
  recommendation: string;
  created_at: string;
};

const History = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [session, setSession] = useState<Session | null>(null);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [filteredAssessments, setFilteredAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [confidenceFilter, setConfidenceFilter] = useState<string>("all");
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const { userRole, isAdmin, hasElevatedAccess } = useUserRole(session);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        navigate("/auth");
      } else {
        loadAssessments();
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

  const loadAssessments = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("patient_assessments")
        .select("*")
        .order("created_at", { ascending: false });

      // If not admin, only show user's own assessments
      if (!isAdmin && session?.user) {
        query = query.eq('user_id', session.user.id);
      }

      const { data, error } = await query;

      if (error) throw error;

      setAssessments(data || []);
      setFilteredAssessments(data || []);
    } catch (error) {
      toast({
        title: t("error"),
        description: t("errorLoadHistory"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = assessments;

    if (searchTerm) {
      filtered = filtered.filter(
        (a) =>
          a.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.diagnosis_summary.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (confidenceFilter !== "all") {
      filtered = filtered.filter((a) => a.confidence === confidenceFilter);
    }

    setFilteredAssessments(filtered);
  }, [searchTerm, confidenceFilter, assessments]);

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("patient_assessments")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: t("deleted"),
        description: t("deletedDesc"),
      });
      loadAssessments();
      setSelectedAssessment(null);
    } catch (error) {
      toast({
        title: t("error"),
        description: t("errorDelete"),
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const getConfidenceBadgeVariant = (confidence: string) => {
    switch (confidence.toLowerCase()) {
      case "high":
        return "destructive";
      case "medium":
        return "default";
      case "low":
        return "secondary";
      default:
        return "outline";
    }
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

      <header className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary via-primary to-accent shadow-lg">
                <Stethoscope className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {t("assessmentHistory")}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {isAdmin ? "Viewing all patient assessments (Admin)" : t("reviewPast")}
                </p>
              </div>
            </div>
            <div className="flex gap-2 items-center">
              {hasElevatedAccess && (
                <Badge variant="outline" className="gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {userRole?.toUpperCase()}
                </Badge>
              )}
              <LanguageSwitcher />
              <Button onClick={() => navigate("/")} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t("newAssessment")}
              </Button>
              <Button onClick={handleSignOut} variant="outline">
                {t("signOut")}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-7xl relative">
        {!selectedAssessment ? (
          <div className="space-y-6">
            <Card className="p-6 shadow-card bg-gradient-to-br from-card to-card/80 backdrop-blur-sm border-border/50">
              <div className="flex gap-4 flex-col md:flex-row">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t("searchPlaceholder")}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-background/50 backdrop-blur-sm"
                  />
                </div>
                <Select value={confidenceFilter} onValueChange={setConfidenceFilter}>
                  <SelectTrigger className="w-full md:w-[200px] bg-background/50 backdrop-blur-sm">
                    <SelectValue placeholder={t("filterByConfidence")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("allConfidenceLevels")}</SelectItem>
                    <SelectItem value="high">{t("high")}</SelectItem>
                    <SelectItem value="medium">{t("medium")}</SelectItem>
                    <SelectItem value="low">{t("low")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </Card>

            <Card className="p-6 shadow-card bg-gradient-to-br from-card to-card/80 backdrop-blur-sm border-border/50">
              {loading ? (
                <p className="text-center text-muted-foreground">{t("loadingAssessments")}</p>
              ) : filteredAssessments.length === 0 ? (
                <p className="text-center text-muted-foreground">{t("noAssessments")}</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("date")}</TableHead>
                      <TableHead>{t("name")}</TableHead>
                      <TableHead>{t("age")}</TableHead>
                      <TableHead>{t("gender")}</TableHead>
                      <TableHead>{t("confidenceLevel")}</TableHead>
                      <TableHead>{t("actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAssessments.map((assessment) => (
                      <TableRow key={assessment.id}>
                        <TableCell>
                          {format(new Date(assessment.created_at), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell className="font-medium">{assessment.patient_name}</TableCell>
                        <TableCell>{assessment.patient_age}</TableCell>
                        <TableCell className="capitalize">{assessment.patient_gender}</TableCell>
                        <TableCell>
                          <Badge variant={getConfidenceBadgeVariant(assessment.confidence)}>
                            {t(assessment.confidence.toLowerCase())}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedAssessment(assessment)}
                            >
                              <FileText className="h-4 w-4 mr-1" />
                              {t("view")}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(assessment.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Card>
          </div>
        ) : (
          <div className="space-y-6">
            <Button onClick={() => setSelectedAssessment(null)} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t("backToList")}
            </Button>

            <Card className="p-6 shadow-card bg-gradient-to-br from-card to-card/80 backdrop-blur-sm border-border/50">
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">{t("patientInfo")}</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">{t("name")}:</span>
                      <p className="font-medium">{selectedAssessment.patient_name}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">{t("age")}:</span>
                      <p className="font-medium">{selectedAssessment.patient_age}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">{t("gender")}:</span>
                      <p className="font-medium capitalize">{selectedAssessment.patient_gender}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">{t("symptomDuration")}:</span>
                      <p className="font-medium">{selectedAssessment.symptom_duration}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">{t("symptomsAssessment")}</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedAssessment.symptoms.map((symptom, index) => (
                      <Badge key={index} variant="outline">
                        {symptom}
                      </Badge>
                    ))}
                  </div>
                </div>

                {selectedAssessment.medical_history && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">{t("medicalHistory")}</h3>
                    <p className="text-sm">{selectedAssessment.medical_history}</p>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">{t("diagnosticResults")}</h3>
                    <Badge variant={getConfidenceBadgeVariant(selectedAssessment.confidence)}>
                      {t(selectedAssessment.confidence.toLowerCase())} {t("confidenceLevel")}
                    </Badge>
                  </div>
                  <p className="text-sm mb-4">{selectedAssessment.diagnosis_summary}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">{t("keyFindings")}</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {selectedAssessment.findings.map((finding, index) => (
                      <li key={index} className="text-sm">
                        {finding}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">{t("recommendation")}</h3>
                  <p className="text-sm">{selectedAssessment.recommendation}</p>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-xs text-muted-foreground">
                    {t("date")}: {format(new Date(selectedAssessment.created_at), "PPpp")}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default History;