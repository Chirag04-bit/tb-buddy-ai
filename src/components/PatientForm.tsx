import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PatientData } from "@/pages/Index";

type PatientFormProps = {
  onSubmit: (data: PatientData) => void;
};

export const PatientForm = ({ onSubmit }: PatientFormProps) => {
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
              <div><span className="font-medium">Name:</span> {formData.name}</div>
              <div><span className="font-medium">Age:</span> {formData.age}</div>
              <div><span className="font-medium">Gender:</span> {formData.gender}</div>
              <div><span className="font-medium">Duration:</span> {formData.duration}</div>
            </div>
            {formData.history && (
              <div className="text-sm">
                <span className="font-medium">History:</span> {formData.history}
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
          <Label htmlFor="name">Full Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter patient name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="age">Age *</Label>
          <Input
            id="age"
            type="number"
            min="0"
            max="120"
            value={formData.age}
            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
            placeholder="Enter age"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="gender">Gender *</Label>
          <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
            <SelectTrigger id="gender">
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
          <Label htmlFor="duration">Symptom Duration *</Label>
          <Select value={formData.duration} onValueChange={(value) => setFormData({ ...formData, duration: value })}>
            <SelectTrigger id="duration">
              <SelectValue placeholder="Select duration" />
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
        <Label htmlFor="history">Medical History (Optional)</Label>
        <textarea
          id="history"
          className="w-full min-h-[80px] p-3 rounded-lg border border-input bg-background text-foreground resize-none focus:ring-2 focus:ring-ring focus:border-transparent"
          value={formData.history}
          onChange={(e) => setFormData({ ...formData, history: e.target.value })}
          placeholder="Any relevant medical history (respiratory conditions, immune system issues, etc.)"
        />
      </div>

      <Button type="submit" className="w-full">
        Save Patient Information
      </Button>
    </form>
  );
};