import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const SYMPTOMS = [
  { id: "chronic-cough", label: "Chronic Cough (≥3 weeks)", description: "Persistent cough lasting three weeks or more" },
  { id: "fever", label: "Fever", description: "Elevated body temperature, especially at night" },
  { id: "night-sweats", label: "Night Sweats", description: "Excessive sweating during sleep" },
  { id: "chest-pain", label: "Chest Pain", description: "Pain or discomfort in the chest area" },
  { id: "fatigue", label: "Fatigue", description: "Persistent tiredness and lack of energy" },
  { id: "weight-loss", label: "Weight Loss", description: "Unintentional weight loss" },
  { id: "hemoptysis", label: "Hemoptysis", description: "Coughing up blood or blood-tinged sputum" },
  { id: "loss-appetite", label: "Loss of Appetite", description: "Reduced desire to eat" },
];

type SymptomChecklistProps = {
  selectedSymptoms: string[];
  onSymptomsChange: (symptoms: string[]) => void;
};

export const SymptomChecklist = ({ selectedSymptoms, onSymptomsChange }: SymptomChecklistProps) => {
  const handleSymptomToggle = (symptomId: string) => {
    if (selectedSymptoms.includes(symptomId)) {
      onSymptomsChange(selectedSymptoms.filter((id) => id !== symptomId));
    } else {
      onSymptomsChange([...selectedSymptoms, symptomId]);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {SYMPTOMS.map((symptom) => (
        <div key={symptom.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors border border-transparent hover:border-border">
          <Checkbox
            id={symptom.id}
            checked={selectedSymptoms.includes(symptom.id)}
            onCheckedChange={() => handleSymptomToggle(symptom.id)}
            className="mt-1"
          />
          <div className="flex-1">
            <Label htmlFor={symptom.id} className="font-medium text-sm cursor-pointer">
              {symptom.label}
            </Label>
            <p className="text-xs text-muted-foreground mt-1">{symptom.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};