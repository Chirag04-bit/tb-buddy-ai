import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { Stethoscope, Search, ArrowLeft, FileText, Trash2 } from "lucide-react";
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
  const [session, setSession] = useState<Session | null>(null);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [filteredAssessments, setFilteredAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [confidenceFilter, setConfidenceFilter] = useState<string>("all");
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);

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
      const { data, error } = await supabase
        .from("patient_assessments")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setAssessments(data || []);
      setFilteredAssessments(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load assessment history",
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
        title: "Deleted",
        description: "Assessment deleted successfully",
      });
      loadAssessments();
      setSelectedAssessment(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete assessment",
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
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-accent">
                <Stethoscope className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Assessment History</h1>
                <p className="text-sm text-muted-foreground">Review past diagnostic assessments</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => navigate("/")} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                New Assessment
              </Button>
              <Button onClick={handleSignOut} variant="outline">
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {!selectedAssessment ? (
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex gap-4 flex-col md:flex-row">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by patient name or diagnosis..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={confidenceFilter} onValueChange={setConfidenceFilter}>
                  <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder="Filter by confidence" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Confidence Levels</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </Card>

            <Card className="p-6">
              {loading ? (
                <p className="text-center text-muted-foreground">Loading assessments...</p>
              ) : filteredAssessments.length === 0 ? (
                <p className="text-center text-muted-foreground">No assessments found</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Patient Name</TableHead>
                      <TableHead>Age</TableHead>
                      <TableHead>Gender</TableHead>
                      <TableHead>Confidence</TableHead>
                      <TableHead>Actions</TableHead>
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
                        <TableCell>{assessment.patient_gender}</TableCell>
                        <TableCell>
                          <Badge variant={getConfidenceBadgeVariant(assessment.confidence)}>
                            {assessment.confidence}
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
                              View
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
              Back to List
            </Button>

            <Card className="p-6">
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Patient Information</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Name:</span>
                      <p className="font-medium">{selectedAssessment.patient_name}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Age:</span>
                      <p className="font-medium">{selectedAssessment.patient_age}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Gender:</span>
                      <p className="font-medium">{selectedAssessment.patient_gender}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Duration:</span>
                      <p className="font-medium">{selectedAssessment.symptom_duration}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Symptoms</h3>
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
                    <h3 className="text-lg font-semibold mb-2">Medical History</h3>
                    <p className="text-sm">{selectedAssessment.medical_history}</p>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Diagnostic Summary</h3>
                    <Badge variant={getConfidenceBadgeVariant(selectedAssessment.confidence)}>
                      {selectedAssessment.confidence} Confidence
                    </Badge>
                  </div>
                  <p className="text-sm mb-4">{selectedAssessment.diagnosis_summary}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Key Findings</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {selectedAssessment.findings.map((finding, index) => (
                      <li key={index} className="text-sm">
                        {finding}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Recommendation</h3>
                  <p className="text-sm">{selectedAssessment.recommendation}</p>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-xs text-muted-foreground">
                    Assessment created: {format(new Date(selectedAssessment.created_at), "PPpp")}
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
