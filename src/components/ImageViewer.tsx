import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";

type Lesion = {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
};

type ImageViewerProps = {
  imageData: string;
  lesions?: Lesion[];
};

export const ImageViewer = ({ imageData, lesions = [] }: ImageViewerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.src = imageData;

    img.onload = () => {
      // Set canvas dimensions to match image
      const maxWidth = 800;
      const scale = Math.min(maxWidth / img.width, 1);
      const width = img.width * scale;
      const height = img.height * scale;

      canvas.width = width;
      canvas.height = height;
      setImageDimensions({ width, height });

      // Draw image
      ctx.drawImage(img, 0, 0, width, height);

      // Draw lesion overlays
      if (lesions.length > 0) {
        lesions.forEach((lesion, index) => {
          // Convert normalized coordinates to canvas coordinates
          const x = lesion.x * width;
          const y = lesion.y * height;
          const w = lesion.width * width;
          const h = lesion.height * height;

          // Color based on confidence
          const alpha = 0.3;
          if (lesion.confidence > 0.7) {
            ctx.fillStyle = `rgba(239, 68, 68, ${alpha})`; // Red for high confidence
            ctx.strokeStyle = 'rgba(239, 68, 68, 0.8)';
          } else if (lesion.confidence > 0.4) {
            ctx.fillStyle = `rgba(251, 191, 36, ${alpha})`; // Yellow for medium
            ctx.strokeStyle = 'rgba(251, 191, 36, 0.8)';
          } else {
            ctx.fillStyle = `rgba(59, 130, 246, ${alpha})`; // Blue for low
            ctx.strokeStyle = 'rgba(59, 130, 246, 0.8)';
          }

          // Draw rectangle
          ctx.fillRect(x, y, w, h);
          ctx.lineWidth = 3;
          ctx.strokeRect(x, y, w, h);

          // Draw label
          ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
          ctx.fillRect(x, y - 25, 120, 25);
          ctx.fillStyle = 'white';
          ctx.font = '14px sans-serif';
          ctx.fillText(`Lesion ${index + 1} (${Math.round(lesion.confidence * 100)}%)`, x + 5, y - 7);
        });
      }
    };
  }, [imageData, lesions]);

  return (
    <Card className="p-4 bg-gradient-to-br from-card to-card/80 backdrop-blur-sm border-border/50">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Medical Imaging Analysis</h3>
          {lesions.length > 0 && (
            <span className="text-sm text-muted-foreground">
              {lesions.length} lesion{lesions.length !== 1 ? 's' : ''} detected
            </span>
          )}
        </div>
        
        <div className="relative rounded-lg overflow-hidden bg-muted">
          <canvas 
            ref={canvasRef} 
            className="w-full h-auto"
            style={{ maxWidth: '100%', display: 'block' }}
          />
        </div>

        {lesions.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-destructive/30 border-2 border-destructive" />
              <span className="text-xs text-muted-foreground">High Risk (&gt;70%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-accent/30 border-2 border-accent" />
              <span className="text-xs text-muted-foreground">Medium (40-70%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-primary/30 border-2 border-primary" />
              <span className="text-xs text-muted-foreground">Low (&lt;40%)</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
