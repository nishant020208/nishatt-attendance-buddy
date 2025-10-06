import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Image as ImageIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Subject, TimetableEntry } from "@/types/attendance";

interface TimetableImageUploadProps {
  subjects: Subject[];
  onSubjectsExtracted: (subjects: { name: string; code: string }[]) => void;
  onTimetableExtracted: (entries: { day: string; subjectCode: string; time: string }[]) => void;
}

export const TimetableImageUpload = ({ 
  subjects,
  onSubjectsExtracted, 
  onTimetableExtracted 
}: TimetableImageUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image size should be less than 10MB");
      return;
    }

    setIsUploading(true);

    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64Data = event.target?.result as string;
        setPreviewUrl(base64Data);

        try {
          console.log('Sending image to AI for extraction...');
          const { data, error } = await supabase.functions.invoke('extract-timetable', {
            body: { imageData: base64Data }
          });

          if (error) throw error;

          if (!data.success) {
            throw new Error(data.error || "Failed to extract timetable");
          }

          console.log('Extracted data:', data.data);

          // Process extracted subjects first
          const newSubjects = data.data.subjects || [];
          const timetableEntries = data.data.timetable || [];

          if (newSubjects.length === 0 && timetableEntries.length === 0) {
            toast.error("Could not extract timetable data from the image. Please ensure the image is clear and contains a timetable.");
            return;
          }

          // Add subjects first
          if (newSubjects.length > 0) {
            onSubjectsExtracted(newSubjects);
          }

          // Wait a bit for subjects to be added, then add timetable entries
          setTimeout(() => {
            if (timetableEntries.length > 0) {
              onTimetableExtracted(timetableEntries);
            }
            
            const successMsg = [];
            if (newSubjects.length > 0) successMsg.push(`${newSubjects.length} subjects`);
            if (timetableEntries.length > 0) successMsg.push(`${timetableEntries.length} schedule entries`);
            
            toast.success(`Successfully extracted ${successMsg.join(' and ')} from your timetable!`);
          }, 500);

        } catch (err) {
          console.error('Error extracting timetable:', err);
          toast.error("Failed to extract timetable from image. Please try again.");
        } finally {
          setIsUploading(false);
        }
      };

      reader.onerror = () => {
        toast.error("Failed to read image file");
        setIsUploading(false);
      };

      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Error processing image:', err);
      toast.error("Failed to process image");
      setIsUploading(false);
    }
  };

  return (
    <Card className="p-6 gradient-card border-0 shadow-lg">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <ImageIcon className="h-5 w-5 text-primary" />
        Upload Timetable Image
      </h3>
      
      <p className="text-sm text-muted-foreground mb-4">
        Upload an image of your timetable and AI will automatically extract subjects and schedule information.
      </p>

      <div className="space-y-4">
        {previewUrl && (
          <div className="relative rounded-lg overflow-hidden border border-border">
            <img 
              src={previewUrl} 
              alt="Timetable preview" 
              className="w-full h-auto max-h-64 object-contain bg-muted"
            />
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            className="relative w-full sm:flex-1"
            disabled={isUploading}
          >
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isUploading}
            />
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Choose Image
              </>
            )}
          </Button>
        </div>

        <div className="text-xs text-muted-foreground">
          <p>Supported formats: JPG, PNG, WEBP (max 10MB)</p>
          <p className="mt-1">Tip: Ensure the timetable is clearly visible with good lighting</p>
        </div>
      </div>
    </Card>
  );
};
