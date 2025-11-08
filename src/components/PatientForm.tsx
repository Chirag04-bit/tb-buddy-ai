import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { PatientData } from "@/pages/Index";

type PatientFormProps = {
  onSubmit: (data: PatientData) => void;
};

export const PatientForm = ({ onSubmit }: PatientFormProps) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    duration: "",
    history: "",
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.age || !formData.gender || !formData.duration) {
      return;
    }

    onSubmit({
      name: formData.name,
      age: parseInt(formData.age),
      gender: formData.gender,
      duration: formData.duration,
      history: formData.history,
    });
    
    setIsSubmitted(true);
  };

  const handleEdit = () => {
    setIsSubmitted(false);
  };

  if (isSubmitted) {
    return (
      <div className="space-y-3 p-4 bg-secondary/50 rounded-lg border border-border">
        <div className="flex justify-between items-start">
          <div className="space-y-2 flex-1">
            <p className="text-sm text-muted-foreground">Patient Details Saved</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><span className="font-medium">{t("patientName")}:</span> {formData.name}</div>
              <div><span className="font-medium">{t("age")}:</span> {formData.age}</div>
              <div><span className="font-medium">{t("gender")}:</span> {formData.gender}</div>
              <div><span className="font-medium">{t("symptomDuration")}:</span> {formData.duration}</div>
            </div>
            {formData.history && (
              <div className="text-sm">
                <span className="font-medium">{t("medicalHistory")}:</span> {formData.history}
              </div>
            )}
          </div>
          <Button onClick={handleEdit} variant="outline" size="sm">
            Edit
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">{t("patientName")} *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder={t("patientName")}
            required
            className="bg-background/50 backdrop-blur-sm"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="age">{t("age")} *</Label>
          <Input
            id="age"
            type="number"
            min="0"
            max="120"
            value={formData.age}
            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
            placeholder={t("age")}
            required
            className="bg-background/50 backdrop-blur-sm"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="gender">{t("gender")} *</Label>
          <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
            <SelectTrigger id="gender" className="bg-background/50 backdrop-blur-sm">
              <SelectValue placeholder={t("gender")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">{t("male")}</SelectItem>
              <SelectItem value="female">{t("female")}</SelectItem>
              <SelectItem value="other">{t("other")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="duration">{t("symptomDuration")} *</Label>
          <Select value={formData.duration} onValueChange={(value) => setFormData({ ...formData, duration: value })}>
            <SelectTrigger id="duration" className="bg-background/50 backdrop-blur-sm">
              <SelectValue placeholder={t("symptomDuration")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="less-than-1-week">Less than 1 week</SelectItem>
              <SelectItem value="1-2-weeks">1-2 weeks</SelectItem>
              <SelectItem value="2-3-weeks">2-3 weeks</SelectItem>
              <SelectItem value="3-4-weeks">3-4 weeks</SelectItem>
              <SelectItem value="more-than-4-weeks">More than 4 weeks</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="history">{t("medicalHistory")}</Label>
        <textarea
          id="history"
          className="w-full min-h-[80px] p-3 rounded-lg border border-input bg-background/50 backdrop-blur-sm text-foreground resize-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
          value={formData.history}
          onChange={(e) => setFormData({ ...formData, history: e.target.value })}
          placeholder={t("medicalHistoryPlaceholder")}
        />
      </div>

      <Button type="submit" className="w-full bg-gradient-to-r from-primary to-accent">
        Save Patient Information
      </Button>
    </form>
  );
};