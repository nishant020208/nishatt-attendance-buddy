import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, LogIn, UserPlus, KeyRound, ArrowLeft, Eye, EyeOff, Sparkles } from "lucide-react";
import { z } from "zod";
import { AnimatedBackground3D } from "@/components/AnimatedBackground3D";
import { motion, AnimatePresence } from "framer-motion";

const authSchema = z.object({
  email: z.string().email('Invalid email address').max(255, 'Email too long'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password too long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

type AuthMode = 'signin' | 'signup' | 'forgot';

export const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<AuthMode>('signin');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !confirmPassword) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match",
        variant: "destructive"
      });
      return;
    }

    const validation = authSchema.safeParse({ email, password });
    if (!validation.success) {
      const firstError = validation.error.errors[0];
      toast({
        title: "Validation error",
        description: firstError.message,
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: validation.data.email,
        password: validation.data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        if (error.message.includes("already registered")) {
          toast({
            title: "Account exists",
            description: "This email is already registered. Please sign in instead.",
            variant: "destructive"
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: "Success!",
          description: "Account created successfully. You can now sign in.",
        });
        setMode('signin');
        setPassword("");
        setConfirmPassword("");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create account",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Missing information",
        description: "Please enter both email and password",
        variant: "destructive"
      });
      return;
    }

    const emailValidation = z.string().email().safeParse(email);
    if (!emailValidation.success) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: emailValidation.data,
        password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          toast({
            title: "Invalid credentials",
            description: "Email or password is incorrect. Please try again.",
            variant: "destructive"
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: "Welcome back!",
          description: "You've been signed in successfully.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to sign in",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Missing email",
        description: "Please enter your email address",
        variant: "destructive"
      });
      return;
    }

    const emailValidation = z.string().email().safeParse(email);
    if (!emailValidation.success) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(emailValidation.data, {
        redirectTo: `${window.location.origin}/auth`,
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Check your email",
        description: "We've sent you a password reset link.",
      });
      setMode('signin');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send reset email",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    },
    exit: { 
      opacity: 0, 
      y: -20, 
      scale: 0.95,
      transition: { duration: 0.3 }
    }
  };

  const inputVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.1, duration: 0.4 }
    })
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 overflow-hidden relative">
      <AnimatedBackground3D variant="auth" />
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-background/80 via-background/60 to-background/80 backdrop-blur-[2px]" />
      
      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="relative z-10 w-full max-w-md"
        >
          <Card className="glass-effect border-primary/30 shadow-2xl backdrop-blur-xl overflow-hidden">
            {/* Animated border gradient */}
            <div className="absolute inset-0 rounded-lg overflow-hidden">
              <div className="absolute inset-[-2px] bg-gradient-to-r from-primary via-accent to-primary animate-spin-slow opacity-20" 
                   style={{ animationDuration: '8s' }} />
            </div>
            
            <div className="relative bg-card/90 rounded-lg">
              <CardHeader className="text-center space-y-4 pb-4">
                <motion.div 
                  className="flex justify-center"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                >
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-primary to-accent shadow-glow relative overflow-hidden">
                    <div className="absolute inset-0 bg-white/20 animate-pulse" />
                    <Calendar className="w-10 h-10 text-white relative z-10" />
                  </div>
                </motion.div>
                <div>
                  <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                    Nishatt
                  </CardTitle>
                  <CardDescription className="text-base mt-2 text-muted-foreground/80">
                    {mode === 'forgot' 
                      ? 'Reset your password' 
                      : 'Track your attendance with style'}
                  </CardDescription>
                </div>
              </CardHeader>
              
              <CardContent className="pt-2">
                {mode === 'forgot' ? (
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <motion.div 
                      className="space-y-2"
                      variants={inputVariants}
                      custom={0}
                      initial="hidden"
                      animate="visible"
                    >
                      <Label htmlFor="forgot-email" className="text-sm font-medium">Email Address</Label>
                      <div className="relative group">
                        <Input
                          id="forgot-email"
                          type="email"
                          placeholder="your.email@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="border-primary/30 focus-visible:ring-primary bg-background/50 h-12 pl-4 transition-all duration-300 group-hover:border-primary/50"
                        />
                        <div className="absolute inset-0 rounded-md bg-gradient-to-r from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                      </div>
                    </motion.div>
                    
                    <motion.div
                      variants={inputVariants}
                      custom={1}
                      initial="hidden"
                      animate="visible"
                    >
                      <Button 
                        type="submit" 
                        className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]" 
                        disabled={loading}
                      >
                        {loading ? (
                          <span className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 animate-spin" />
                            Sending...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <KeyRound className="w-4 h-4" />
                            Send Reset Link
                          </span>
                        )}
                      </Button>
                    </motion.div>
                    
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full gap-2"
                      onClick={() => setMode('signin')}
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back to Sign In
                    </Button>
                  </form>
                ) : (
                  <Tabs value={mode} onValueChange={(v) => setMode(v as AuthMode)} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6 bg-muted/50 p-1">
                      <TabsTrigger 
                        value="signin" 
                        className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-white transition-all duration-300"
                      >
                        <LogIn className="w-4 h-4" />
                        Sign In
                      </TabsTrigger>
                      <TabsTrigger 
                        value="signup"
                        className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-white transition-all duration-300"
                      >
                        <UserPlus className="w-4 h-4" />
                        Sign Up
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="signin">
                      <form onSubmit={handleSignIn} className="space-y-4">
                        <motion.div 
                          className="space-y-2"
                          variants={inputVariants}
                          custom={0}
                          initial="hidden"
                          animate="visible"
                        >
                          <Label htmlFor="signin-email" className="text-sm font-medium">ID</Label>
                          <div className="relative group">
                            <Input
                              id="signin-email"
                              type="email"
                              placeholder="your.email@example.com"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              required
                              className="border-primary/30 focus-visible:ring-primary bg-background/50 h-12 pl-4 transition-all duration-300 group-hover:border-primary/50"
                            />
                          </div>
                        </motion.div>
                        
                        <motion.div 
                          className="space-y-2"
                          variants={inputVariants}
                          custom={1}
                          initial="hidden"
                          animate="visible"
                        >
                          <Label htmlFor="signin-password" className="text-sm font-medium">Password</Label>
                          <div className="relative group">
                            <Input
                              id="signin-password"
                              type={showPassword ? "text" : "password"}
                              placeholder="••••••••"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              required
                              className="border-primary/30 focus-visible:ring-primary bg-background/50 h-12 pl-4 pr-12 transition-all duration-300 group-hover:border-primary/50"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-transparent"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </Button>
                          </div>
                        </motion.div>
                        
                        <motion.div
                          variants={inputVariants}
                          custom={2}
                          initial="hidden"
                          animate="visible"
                        >
                          <Button 
                            type="submit" 
                            className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]" 
                            disabled={loading}
                          >
                            {loading ? (
                              <span className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4 animate-spin" />
                                Signing in...
                              </span>
                            ) : "Sign In"}
                          </Button>
                        </motion.div>
                        
                        <Button
                          type="button"
                          variant="link"
                          className="w-full text-muted-foreground hover:text-primary"
                          onClick={() => setMode('forgot')}
                        >
                          Forgot your password?
                        </Button>
                      </form>
                    </TabsContent>
                    
                    <TabsContent value="signup">
                      <form onSubmit={handleSignUp} className="space-y-4">
                        <motion.div 
                          className="space-y-2"
                          variants={inputVariants}
                          custom={0}
                          initial="hidden"
                          animate="visible"
                        >
                          <Label htmlFor="signup-email" className="text-sm font-medium">ID</Label>
                          <div className="relative group">
                            <Input
                              id="signup-email"
                              type="email"
                              placeholder="your.email@example.com"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              required
                              className="border-primary/30 focus-visible:ring-primary bg-background/50 h-12 pl-4 transition-all duration-300 group-hover:border-primary/50"
                            />
                          </div>
                        </motion.div>
                        
                        <motion.div 
                          className="space-y-2"
                          variants={inputVariants}
                          custom={1}
                          initial="hidden"
                          animate="visible"
                        >
                          <Label htmlFor="signup-password" className="text-sm font-medium">Create Password</Label>
                          <div className="relative group">
                            <Input
                              id="signup-password"
                              type={showPassword ? "text" : "password"}
                              placeholder="••••••••"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              required
                              minLength={8}
                              className="border-primary/30 focus-visible:ring-primary bg-background/50 h-12 pl-4 pr-12 transition-all duration-300 group-hover:border-primary/50"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-transparent"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Min 8 chars with uppercase, lowercase & number
                          </p>
                        </motion.div>
                        
                        <motion.div 
                          className="space-y-2"
                          variants={inputVariants}
                          custom={2}
                          initial="hidden"
                          animate="visible"
                        >
                          <Label htmlFor="signup-confirm-password" className="text-sm font-medium">Confirm Password</Label>
                          <div className="relative group">
                            <Input
                              id="signup-confirm-password"
                              type={showPassword ? "text" : "password"}
                              placeholder="••••••••"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              required
                              minLength={8}
                              className="border-primary/30 focus-visible:ring-primary bg-background/50 h-12 pl-4 transition-all duration-300 group-hover:border-primary/50"
                            />
                          </div>
                        </motion.div>
                        
                        <motion.div
                          variants={inputVariants}
                          custom={3}
                          initial="hidden"
                          animate="visible"
                        >
                          <Button 
                            type="submit" 
                            className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]" 
                            disabled={loading}
                          >
                            {loading ? (
                              <span className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4 animate-spin" />
                                Creating account...
                              </span>
                            ) : "Create Account"}
                          </Button>
                        </motion.div>
                      </form>
                    </TabsContent>
                  </Tabs>
                )}
              </CardContent>
            </div>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
