import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { User, Heart, Hospital, Activity, ArrowLeft, Plus, Trash2 } from "lucide-react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import type { Session } from "@supabase/supabase-js";

interface Profile {
  full_name: string;
  date_of_birth: string;
  gender: string;
  phone: string;
  emergency_contact: string;
  blood_type: string;
}

interface MedicalHistory {
  id: string;
  condition_name: string;
  diagnosed_date: string;
  status: string;
  notes: string;
}

interface FavoriteHospital {
  id: string;
  hospital_name: string;
  address: string;
  phone: string;
  notes: string;
}

interface HealthMetric {
  id: string;
  metric_type: string;
  value: number;
  unit: string;
  recorded_at: string;
  notes: string;
}

export default function Profile() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [profile, setProfile] = useState<Profile>({
    full_name: "",
    date_of_birth: "",
    gender: "",
    phone: "",
    emergency_contact: "",
    blood_type: ""
  });

  const [medicalHistory, setMedicalHistory] = useState<MedicalHistory[]>([]);
  const [favoriteHospitals, setFavoriteHospitals] = useState<FavoriteHospital[]>([]);
  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>([]);

  const [newCondition, setNewCondition] = useState({ condition_name: "", diagnosed_date: "", status: "active", notes: "" });
  const [newHospital, setNewHospital] = useState({ hospital_name: "", address: "", phone: "", notes: "" });
  const [newMetric, setNewMetric] = useState({ metric_type: "", value: "", unit: "", notes: "" });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        navigate("/auth");
      } else {
        loadProfileData();
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadProfileData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profileData) {
        setProfile({
          full_name: profileData.full_name || "",
          date_of_birth: profileData.date_of_birth || "",
          gender: profileData.gender || "",
          phone: profileData.phone || "",
          emergency_contact: profileData.emergency_contact || "",
          blood_type: profileData.blood_type || ""
        });
      }

      // Load medical history
      const { data: historyData } = await supabase
        .from("medical_history")
        .select("*")
        .eq("user_id", user.id)
        .order("diagnosed_date", { ascending: false });
      if (historyData) setMedicalHistory(historyData);

      // Load favorite hospitals
      const { data: hospitalsData } = await supabase
        .from("favorite_hospitals")
        .select("*")
        .eq("user_id", user.id);
      if (hospitalsData) setFavoriteHospitals(hospitalsData);

      // Load health metrics
      const { data: metricsData } = await supabase
        .from("health_metrics")
        .select("*")
        .eq("user_id", user.id)
        .order("recorded_at", { ascending: false })
        .limit(10);
      if (metricsData) setHealthMetrics(metricsData);

    } catch (error) {
      console.error("Error loading profile:", error);
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("profiles")
        .upsert({
          user_id: user.id,
          ...profile
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully"
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      });
    }
  };

  const addMedicalHistory = async () => {
    if (!newCondition.condition_name) return;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("medical_history")
        .insert({
          user_id: user.id,
          ...newCondition
        })
        .select()
        .single();

      if (error) throw error;

      setMedicalHistory([data, ...medicalHistory]);
      setNewCondition({ condition_name: "", diagnosed_date: "", status: "active", notes: "" });
      
      toast({
        title: "Success",
        description: "Medical history added"
      });
    } catch (error) {
      console.error("Error adding medical history:", error);
      toast({
        title: "Error",
        description: "Failed to add medical history",
        variant: "destructive"
      });
    }
  };

  const deleteMedicalHistory = async (id: string) => {
    try {
      const { error } = await supabase
        .from("medical_history")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setMedicalHistory(medicalHistory.filter(h => h.id !== id));
      toast({
        title: "Success",
        description: "Medical history deleted"
      });
    } catch (error) {
      console.error("Error deleting medical history:", error);
      toast({
        title: "Error",
        description: "Failed to delete medical history",
        variant: "destructive"
      });
    }
  };

  const addFavoriteHospital = async () => {
    if (!newHospital.hospital_name) return;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("favorite_hospitals")
        .insert({
          user_id: user.id,
          ...newHospital
        })
        .select()
        .single();

      if (error) throw error;

      setFavoriteHospitals([...favoriteHospitals, data]);
      setNewHospital({ hospital_name: "", address: "", phone: "", notes: "" });
      
      toast({
        title: "Success",
        description: "Hospital added to favorites"
      });
    } catch (error) {
      console.error("Error adding hospital:", error);
      toast({
        title: "Error",
        description: "Failed to add hospital",
        variant: "destructive"
      });
    }
  };

  const deleteFavoriteHospital = async (id: string) => {
    try {
      const { error } = await supabase
        .from("favorite_hospitals")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setFavoriteHospitals(favoriteHospitals.filter(h => h.id !== id));
      toast({
        title: "Success",
        description: "Hospital removed from favorites"
      });
    } catch (error) {
      console.error("Error deleting hospital:", error);
      toast({
        title: "Error",
        description: "Failed to remove hospital",
        variant: "destructive"
      });
    }
  };

  const addHealthMetric = async () => {
    if (!newMetric.metric_type || !newMetric.value || !newMetric.unit) return;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("health_metrics")
        .insert({
          user_id: user.id,
          metric_type: newMetric.metric_type,
          value: parseFloat(newMetric.value),
          unit: newMetric.unit,
          notes: newMetric.notes
        })
        .select()
        .single();

      if (error) throw error;

      setHealthMetrics([data, ...healthMetrics]);
      setNewMetric({ metric_type: "", value: "", unit: "", notes: "" });
      
      toast({
        title: "Success",
        description: "Health metric added"
      });
    } catch (error) {
      console.error("Error adding metric:", error);
      toast({
        title: "Error",
        description: "Failed to add health metric",
        variant: "destructive"
      });
    }
  };

  const deleteHealthMetric = async (id: string) => {
    try {
      const { error } = await supabase
        .from("health_metrics")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setHealthMetrics(healthMetrics.filter(m => m.id !== id));
      toast({
        title: "Success",
        description: "Health metric deleted"
      });
    } catch (error) {
      console.error("Error deleting metric:", error);
      toast({
        title: "Error",
        description: "Failed to delete health metric",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={() => navigate("/")} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
          <LanguageSwitcher />
        </div>

        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-2 text-foreground">My Profile</h1>
          <p className="text-muted-foreground mb-8">Manage your health information and preferences</p>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="profile" className="gap-2">
                <User className="h-4 w-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="medical" className="gap-2">
                <Heart className="h-4 w-4" />
                Medical History
              </TabsTrigger>
              <TabsTrigger value="hospitals" className="gap-2">
                <Hospital className="h-4 w-4" />
                Hospitals
              </TabsTrigger>
              <TabsTrigger value="metrics" className="gap-2">
                <Activity className="h-4 w-4" />
                Health Metrics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Update your personal and emergency contact details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Full Name</Label>
                      <Input
                        id="full_name"
                        value={profile.full_name}
                        onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="date_of_birth">Date of Birth</Label>
                      <Input
                        id="date_of_birth"
                        type="date"
                        value={profile.date_of_birth}
                        onChange={(e) => setProfile({ ...profile, date_of_birth: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender</Label>
                      <Select value={profile.gender} onValueChange={(value) => setProfile({ ...profile, gender: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="blood_type">Blood Type</Label>
                      <Select value={profile.blood_type} onValueChange={(value) => setProfile({ ...profile, blood_type: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select blood type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A+">A+</SelectItem>
                          <SelectItem value="A-">A-</SelectItem>
                          <SelectItem value="B+">B+</SelectItem>
                          <SelectItem value="B-">B-</SelectItem>
                          <SelectItem value="AB+">AB+</SelectItem>
                          <SelectItem value="AB-">AB-</SelectItem>
                          <SelectItem value="O+">O+</SelectItem>
                          <SelectItem value="O-">O-</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={profile.phone}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emergency_contact">Emergency Contact</Label>
                      <Input
                        id="emergency_contact"
                        value={profile.emergency_contact}
                        onChange={(e) => setProfile({ ...profile, emergency_contact: e.target.value })}
                      />
                    </div>
                  </div>
                  <Button onClick={updateProfile} className="w-full">Save Profile</Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="medical">
              <Card>
                <CardHeader>
                  <CardTitle>Medical History</CardTitle>
                  <CardDescription>Track your medical conditions and diagnoses</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="condition">Condition</Label>
                        <Input
                          id="condition"
                          placeholder="e.g., Diabetes, Hypertension"
                          value={newCondition.condition_name}
                          onChange={(e) => setNewCondition({ ...newCondition, condition_name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="diagnosed">Diagnosed Date</Label>
                        <Input
                          id="diagnosed"
                          type="date"
                          value={newCondition.diagnosed_date}
                          onChange={(e) => setNewCondition({ ...newCondition, diagnosed_date: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Select value={newCondition.status} onValueChange={(value) => setNewCondition({ ...newCondition, status: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                            <SelectItem value="managed">Managed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                          id="notes"
                          placeholder="Additional details..."
                          value={newCondition.notes}
                          onChange={(e) => setNewCondition({ ...newCondition, notes: e.target.value })}
                        />
                      </div>
                    </div>
                    <Button onClick={addMedicalHistory} className="w-full gap-2">
                      <Plus className="h-4 w-4" />
                      Add Condition
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {medicalHistory.map((history) => (
                      <Card key={history.id}>
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg">{history.condition_name}</h3>
                              <div className="text-sm text-muted-foreground mt-2 space-y-1">
                                <p>Diagnosed: {history.diagnosed_date || "Not specified"}</p>
                                <p>Status: <span className="capitalize">{history.status}</span></p>
                                {history.notes && <p>Notes: {history.notes}</p>}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteMedicalHistory(history.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {medicalHistory.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">No medical history added yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="hospitals">
              <Card>
                <CardHeader>
                  <CardTitle>Favorite Hospitals</CardTitle>
                  <CardDescription>Save your preferred hospitals for quick access</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="hospital_name">Hospital Name</Label>
                        <Input
                          id="hospital_name"
                          placeholder="e.g., City Hospital"
                          value={newHospital.hospital_name}
                          onChange={(e) => setNewHospital({ ...newHospital, hospital_name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="hospital_phone">Phone</Label>
                        <Input
                          id="hospital_phone"
                          placeholder="Contact number"
                          value={newHospital.phone}
                          onChange={(e) => setNewHospital({ ...newHospital, phone: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="hospital_address">Address</Label>
                        <Input
                          id="hospital_address"
                          placeholder="Full address"
                          value={newHospital.address}
                          onChange={(e) => setNewHospital({ ...newHospital, address: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="hospital_notes">Notes</Label>
                        <Textarea
                          id="hospital_notes"
                          placeholder="Why you prefer this hospital..."
                          value={newHospital.notes}
                          onChange={(e) => setNewHospital({ ...newHospital, notes: e.target.value })}
                        />
                      </div>
                    </div>
                    <Button onClick={addFavoriteHospital} className="w-full gap-2">
                      <Plus className="h-4 w-4" />
                      Add Hospital
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {favoriteHospitals.map((hospital) => (
                      <Card key={hospital.id}>
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg">{hospital.hospital_name}</h3>
                              <div className="text-sm text-muted-foreground mt-2 space-y-1">
                                {hospital.address && <p>📍 {hospital.address}</p>}
                                {hospital.phone && <p>📞 {hospital.phone}</p>}
                                {hospital.notes && <p>💬 {hospital.notes}</p>}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteFavoriteHospital(hospital.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {favoriteHospitals.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">No favorite hospitals added yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="metrics">
              <Card>
                <CardHeader>
                  <CardTitle>Health Metrics</CardTitle>
                  <CardDescription>Track your health measurements over time</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="metric_type">Metric Type</Label>
                        <Select value={newMetric.metric_type} onValueChange={(value) => setNewMetric({ ...newMetric, metric_type: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="weight">Weight</SelectItem>
                            <SelectItem value="blood_pressure_systolic">Blood Pressure (Systolic)</SelectItem>
                            <SelectItem value="blood_pressure_diastolic">Blood Pressure (Diastolic)</SelectItem>
                            <SelectItem value="heart_rate">Heart Rate</SelectItem>
                            <SelectItem value="blood_sugar">Blood Sugar</SelectItem>
                            <SelectItem value="temperature">Temperature</SelectItem>
                            <SelectItem value="oxygen_saturation">Oxygen Saturation</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="value">Value</Label>
                        <Input
                          id="value"
                          type="number"
                          step="0.1"
                          placeholder="e.g., 70"
                          value={newMetric.value}
                          onChange={(e) => setNewMetric({ ...newMetric, value: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="unit">Unit</Label>
                        <Input
                          id="unit"
                          placeholder="e.g., kg, mmHg"
                          value={newMetric.unit}
                          onChange={(e) => setNewMetric({ ...newMetric, unit: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2 md:col-span-3">
                        <Label htmlFor="metric_notes">Notes</Label>
                        <Textarea
                          id="metric_notes"
                          placeholder="Additional context..."
                          value={newMetric.notes}
                          onChange={(e) => setNewMetric({ ...newMetric, notes: e.target.value })}
                        />
                      </div>
                    </div>
                    <Button onClick={addHealthMetric} className="w-full gap-2">
                      <Plus className="h-4 w-4" />
                      Add Metric
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {healthMetrics.map((metric) => (
                      <Card key={metric.id}>
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-baseline gap-2">
                                <h3 className="font-semibold text-lg capitalize">{metric.metric_type.replace(/_/g, ' ')}</h3>
                                <span className="text-2xl font-bold text-primary">{metric.value} {metric.unit}</span>
                              </div>
                              <div className="text-sm text-muted-foreground mt-2 space-y-1">
                                <p>Recorded: {new Date(metric.recorded_at).toLocaleString()}</p>
                                {metric.notes && <p>Notes: {metric.notes}</p>}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteHealthMetric(metric.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {healthMetrics.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">No health metrics tracked yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
