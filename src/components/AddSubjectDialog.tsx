import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { toast } from "sonner";

interface AddSubjectDialogProps {
  onAddSubject: (name: string, code: string) => void;
}

export const AddSubjectDialog = ({ onAddSubject }: AddSubjectDialogProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !code.trim()) {
      toast.error("Please fill all fields");
      return;
    }

    onAddSubject(name.trim(), code.trim());
    setName("");
    setCode("");
    setOpen(false);
    toast.success(`${name} added successfully!`);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gradient-primary shadow-glow">
          <Plus className="h-4 w-4 mr-2" />
          Add Subject
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Subject</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Subject Name</Label>
            <Input
              id="name"
              placeholder="e.g., Data Structures"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="touch-manipulation"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="code">Subject Code</Label>
            <Input
              id="code"
              placeholder="e.g., CS201"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="touch-manipulation"
            />
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1 gradient-primary">
              Add Subject
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
