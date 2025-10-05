import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Share2, Download, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface TimetableCodeDialogProps {
  timetable: any[];
  onImportTimetable: (timetable: any[]) => void;
}

export const TimetableCodeDialog = ({ timetable, onImportTimetable }: TimetableCodeDialogProps) => {
  const [generatedCode, setGeneratedCode] = useState("");
  const [importCode, setImportCode] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const generateCode = async () => {
    if (timetable.length === 0) {
      toast({
        title: "No timetable",
        description: "Add some classes to your timetable first!",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Not authenticated",
          description: "Please sign in to generate codes",
          variant: "destructive"
        });
        return;
      }

      // Generate a random 6-character code
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      const { error } = await supabase
        .from('timetable_codes')
        .insert({
          code,
          timetable_data: timetable,
          user_id: user.id
        });

      if (error) throw error;

      setGeneratedCode(code);
      toast({
        title: "Code generated!",
        description: "Share this code with other students to share your timetable.",
      });
    } catch (error) {
      console.error('Error generating code:', error);
      toast({
        title: "Error",
        description: "Failed to generate code. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const importTimetable = async () => {
    if (!importCode.trim()) return;

    setIsImporting(true);
    try {
      const { data, error } = await supabase
        .from('timetable_codes')
        .select('timetable_data')
        .eq('code', importCode.toUpperCase())
        .single();

      if (error || !data) {
        toast({
          title: "Code not found",
          description: "Please check the code and try again.",
          variant: "destructive"
        });
        return;
      }

      // Ensure timetable_data is an array
      const timetableData = Array.isArray(data.timetable_data) 
        ? data.timetable_data 
        : [];
      
      onImportTimetable(timetableData);
      setImportCode("");
      toast({
        title: "Timetable imported!",
        description: "The timetable has been added to your schedule.",
      });
    } catch (error) {
      console.error('Error importing timetable:', error);
      toast({
        title: "Error",
        description: "Failed to import timetable. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Copied!",
      description: "Code copied to clipboard",
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Share2 className="w-4 h-4 mr-2" />
          Share/Import
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share or Import Timetable</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* Generate Code Section */}
          <div className="space-y-3">
            <Label>Share Your Timetable</Label>
            <p className="text-sm text-muted-foreground">
              Generate a code to share your timetable with other students
            </p>
            <Button 
              onClick={generateCode} 
              disabled={isGenerating}
              className="w-full"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Generate Code
            </Button>
            {generatedCode && (
              <div className="flex gap-2">
                <Input value={generatedCode} readOnly className="font-mono text-lg" />
                <Button onClick={copyCode} variant="outline" size="icon">
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            )}
          </div>

          {/* Import Code Section */}
          <div className="space-y-3 pt-6 border-t">
            <Label>Import Timetable</Label>
            <p className="text-sm text-muted-foreground">
              Enter a code to import someone else's timetable
            </p>
            <div className="flex gap-2">
              <Input
                value={importCode}
                onChange={(e) => setImportCode(e.target.value)}
                placeholder="Enter code"
                className="font-mono uppercase"
              />
              <Button 
                onClick={importTimetable} 
                disabled={isImporting || !importCode.trim()}
              >
                <Download className="w-4 h-4 mr-2" />
                Import
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
