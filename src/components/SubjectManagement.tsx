import { Subject } from "@/types/attendance";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Plus, Database } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface SubjectManagementProps {
  subjects: Subject[];
  onAddSubject: (name: string, code: string) => void;
  onDeleteSubject: (id: string) => void;
}

export const SubjectManagement = ({ subjects, onAddSubject, onDeleteSubject }: SubjectManagementProps) => {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState<Subject | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !code.trim()) {
      toast.error("Please fill all fields");
      return;
    }

    onAddSubject(name.trim(), code.trim());
    setName("");
    setCode("");
    toast.success(`${name} added successfully!`);
  };

  const handleDeleteClick = (subject: Subject) => {
    setSubjectToDelete(subject);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (subjectToDelete) {
      onDeleteSubject(subjectToDelete.id);
      toast.success(`${subjectToDelete.name} deleted successfully!`);
      setDeleteDialogOpen(false);
      setSubjectToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-2 border-primary/20 shadow-glow backdrop-blur-sm bg-card/95">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Plus className="h-6 w-6 text-primary" />
            Add New Subject
          </CardTitle>
          <CardDescription>Create a new subject entry in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="subject-name" className="text-sm font-semibold">Subject Name</Label>
                <Input
                  id="subject-name"
                  placeholder="e.g., Data Structures"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="border-primary/30 focus-visible:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject-code" className="text-sm font-semibold">Subject Code</Label>
                <Input
                  id="subject-code"
                  placeholder="e.g., CS201"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="border-primary/30 focus-visible:ring-primary"
                />
              </div>
            </div>
            <Button type="submit" className="w-full gradient-primary shadow-glow">
              <Plus className="h-4 w-4 mr-2" />
              Add Subject
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-2 border-primary/20 shadow-glow backdrop-blur-sm bg-card/95">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Database className="h-6 w-6 text-primary" />
            Subject Database
          </CardTitle>
          <CardDescription>
            Manage all subjects ({subjects.length} total)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {subjects.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Database className="h-16 w-16 mx-auto mb-4 opacity-20" />
              <p className="text-lg">No subjects in database</p>
              <p className="text-sm">Add your first subject above</p>
            </div>
          ) : (
            <div className="space-y-3">
              {subjects.map((subject) => (
                <div
                  key={subject.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary/50 transition-all duration-200 bg-gradient-to-r from-card to-muted/20"
                >
                  <div className="space-y-1">
                    <h3 className="font-semibold text-lg">{subject.name}</h3>
                    <p className="text-sm text-muted-foreground font-mono">
                      Code: {subject.code}
                    </p>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span className="font-mono">
                        Classes: {subject.totalClasses}
                      </span>
                      <span className="font-mono">
                        Attended: {subject.attended}
                      </span>
                      <span className="font-mono">
                        {subject.totalClasses > 0 
                          ? `${((subject.attended / subject.totalClasses) * 100).toFixed(1)}%`
                          : '0%'}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteClick(subject)}
                    className="shadow-md hover:shadow-lg transition-shadow"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Subject</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{subjectToDelete?.name}"? This will remove all
              associated attendance records and timetable entries. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
