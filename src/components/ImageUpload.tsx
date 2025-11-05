import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, FileImage } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type ImageUploadProps = {
  onImageUpload: (imageData: string | null) => void;
};

export const ImageUpload = ({ onImageUpload }: ImageUploadProps) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid File",
        description: "Please upload an image file (JPEG, PNG, etc.)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Image must be less than 10MB",
        variant: "destructive",
      });
      return;
    }

    setFileName(file.name);

    // Convert to base64
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setPreview(base64);
      onImageUpload(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    setPreview(null);
    setFileName(null);
    onImageUpload(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        id="image-upload"
      />

      {!preview ? (
        <label
          htmlFor="image-upload"
          className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-secondary/50 transition-colors"
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="h-12 w-12 text-muted-foreground mb-3" />
            <p className="mb-2 text-sm text-foreground">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-muted-foreground">Chest X-ray or CT scan (PNG, JPG, JPEG - Max 10MB)</p>
          </div>
        </label>
      ) : (
        <div className="space-y-3">
          <div className="relative w-full h-64 border border-border rounded-lg overflow-hidden bg-muted">
            <img src={preview} alt="Medical scan preview" className="w-full h-full object-contain" />
            <Button
              onClick={handleRemove}
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2 p-3 bg-secondary/50 rounded-lg border border-border">
            <FileImage className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium flex-1 truncate">{fileName}</span>
            <Button onClick={handleRemove} variant="ghost" size="sm">
              Remove
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};