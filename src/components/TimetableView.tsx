import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Subject, TimetableEntry } from "@/types/attendance";
import { Plus, Trash2, Clock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { TimetableImageUpload } from "./TimetableImageUpload";

interface TimetableViewProps {
  subjects: Subject[];
  timetable: TimetableEntry[];
  onAddToTimetable: (day: string, subjectId: string, time: string) => void;
  onRemoveFromTimetable: (id: string) => void;
  onAddSubject: (name: string, code: string) => void;
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export const TimetableView = ({ subjects, timetable, onAddToTimetable, onRemoveFromTimetable, onAddSubject }: TimetableViewProps) => {
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [time, setTime] = useState("");

  const handleAdd = () => {
    if (!selectedDay || !selectedSubject || !time) {
      toast.error("Please fill all fields");
      return;
    }

    onAddToTimetable(selectedDay, selectedSubject, time);
    setSelectedDay("");
    setSelectedSubject("");
    setTime("");
  };

  const getTimetableForDay = (day: string) => {
    return timetable
      .filter(entry => entry.day === day)
      .sort((a, b) => a.time.localeCompare(b.time));
  };

  const handleSubjectsExtracted = (extractedSubjects: { name: string; code: string }[]) => {
    extractedSubjects.forEach(subject => {
      const exists = subjects.find(s => s.code.toLowerCase() === subject.code.toLowerCase());
      if (!exists) {
        onAddSubject(subject.name, subject.code);
      }
    });
  };

  const handleTimetableExtracted = (entries: { day: string; subjectCode: string; time: string }[]) => {
    entries.forEach(entry => {
      const subject = subjects.find(s => s.code.toLowerCase() === entry.subjectCode.toLowerCase());
      if (subject) {
        const duplicate = timetable.find(
          t => t.day === entry.day && t.subjectId === subject.id && t.time === entry.time
        );
        if (!duplicate) {
          onAddToTimetable(entry.day, subject.id, entry.time);
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      <TimetableImageUpload 
        subjects={subjects}
        onSubjectsExtracted={handleSubjectsExtracted}
        onTimetableExtracted={handleTimetableExtracted}
      />
      <Card className="p-4 sm:p-6 gradient-card border-0 shadow-lg">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Add to Timetable
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <Select value={selectedDay} onValueChange={setSelectedDay}>
            <SelectTrigger className="touch-manipulation">
              <SelectValue placeholder="Select Day" />
            </SelectTrigger>
            <SelectContent>
              {DAYS.map(day => (
                <SelectItem key={day} value={day}>{day}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger className="touch-manipulation">
              <SelectValue placeholder="Select Subject" />
            </SelectTrigger>
            <SelectContent>
              {subjects.map(subject => (
                <SelectItem key={subject.id} value={subject.id}>
                  {subject.code} - {subject.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background touch-manipulation"
          />
        </div>

        <Button onClick={handleAdd} className="w-full sm:w-auto gradient-primary">
          <Plus className="h-4 w-4 mr-2" />
          Add to Timetable
        </Button>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {DAYS.map(day => {
          const dayEntries = getTimetableForDay(day);
          return (
            <Card key={day} className="p-4 gradient-card border-0 shadow-md">
              <h4 className="font-semibold mb-3 text-sm sm:text-base">{day}</h4>
              {dayEntries.length === 0 ? (
                <p className="text-sm text-muted-foreground">No classes</p>
              ) : (
                <div className="space-y-2">
                  {dayEntries.map(entry => {
                    const subject = subjects.find(s => s.id === entry.subjectId);
                    return (
                      <div key={entry.id} className="flex items-center justify-between gap-2 p-2 bg-muted/50 rounded-lg">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{subject?.code}</p>
                          <p className="text-xs text-muted-foreground">{entry.time}</p>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => onRemoveFromTimetable(entry.id)}
                          className="h-8 w-8 flex-shrink-0"
                        >
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};
