import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User, ImagePlus, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  image?: string;
}

interface ChatTabProps {
  subjects: any[];
  timetable: any[];
  onSubjectsExtracted: (subjects: { name: string; code: string }[]) => void;
  onTimetableExtracted: (entries: { day: string; subjectCode: string; time: string }[]) => void;
}

export const ChatTab = ({ subjects, timetable, onSubjectsExtracted, onTimetableExtracted }: ChatTabProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file",
        description: "Please upload an image file",
        variant: "destructive"
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive"
      });
      return;
    }

    setIsProcessingImage(true);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = reader.result as string;
        setUploadedImage(base64Image);

        // Add user message with image
        const userMessage: Message = { 
          role: 'user', 
          content: 'I uploaded a timetable image. Please extract the subjects and schedule.',
          image: base64Image
        };
        setMessages(prev => [...prev, userMessage]);

        try {
          // Call extract-timetable function
          const { data, error } = await supabase.functions.invoke('extract-timetable', {
            body: { imageData: base64Image }
          });

          if (error) throw error;

          const { subjects: extractedSubjects, timetable: extractedTimetable } = data;

          // Add to timetable
          if (extractedSubjects && extractedSubjects.length > 0) {
            onSubjectsExtracted(extractedSubjects);
          }
          
          if (extractedTimetable && extractedTimetable.length > 0) {
            onTimetableExtracted(extractedTimetable);
          }

          // Add assistant response
          const assistantMessage: Message = {
            role: 'assistant',
            content: `I've extracted your timetable!\n\nFound ${extractedSubjects?.length || 0} subjects and ${extractedTimetable?.length || 0} timetable entries. They have been added to your timetable.`
          };
          setMessages(prev => [...prev, assistantMessage]);

          toast({
            title: "Timetable extracted",
            description: "Your timetable has been added successfully!",
          });

          setUploadedImage(null);
        } catch (error) {
          console.error('Image processing error:', error);
          toast({
            title: "Error",
            description: "Failed to extract timetable from image. Please try again.",
            variant: "destructive"
          });
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('File reading error:', error);
      toast({
        title: "Error",
        description: "Failed to read the image file",
        variant: "destructive"
      });
    } finally {
      setIsProcessingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('chat', {
        body: {
          messages: [...messages, userMessage],
          timetable,
          subjects
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.choices[0].message.content
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: "Error",
        description: "Failed to get response from AI. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px]">
      <Card className="flex-1 mb-4 p-4">
        <ScrollArea className="h-full pr-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <Bot className="w-12 h-12 mb-4" />
              <p className="text-center">Ask me anything about your attendance!</p>
              <p className="text-sm text-center mt-2">
                I can help you decide which classes to attend, check your attendance status, and more.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex gap-3 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                      <Bot className="w-5 h-5 text-primary-foreground" />
                    </div>
                  )}
                   <div
                    className={`rounded-lg px-4 py-2 max-w-[80%] ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    {message.image && (
                      <img 
                        src={message.image} 
                        alt="Uploaded timetable" 
                        className="max-w-full h-auto rounded mb-2"
                      />
                    )}
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                  {message.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5" />
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-primary-foreground animate-pulse" />
                  </div>
                  <div className="bg-muted rounded-lg px-4 py-2">
                    <p className="text-sm">Thinking...</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </Card>
      <div className="flex gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          disabled={isProcessingImage || isLoading}
        >
          {isProcessingImage ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <ImagePlus className="w-4 h-4" />
          )}
        </Button>
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Ask about your attendance or upload timetable image..."
          disabled={isLoading || isProcessingImage}
        />
        <Button onClick={sendMessage} disabled={isLoading || !input.trim() || isProcessingImage}>
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
