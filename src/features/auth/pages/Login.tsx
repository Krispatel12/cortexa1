import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { ArrowLeft, Loader2, Building2, Globe, Sparkles, Mail, Lock, CheckCircle2, AlertCircle, Key, LayoutGrid } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/shared/lib/api";
import { cn } from "@/shared/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { ReactiveCharacters, InteractionState } from "@/features/auth/components/ReactiveCharacters";

// --- Micro-Animation Components ---

const MotionInputContainer = ({ children, className }: { children: React.ReactNode; className?: string }) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <motion.div
            initial={false}
            animate={{ scale: isFocused ? 1.02 : 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className={cn("relative group", className)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
        >
            <motion.div
                className="absolute inset-0 rounded-xl bg-primary/20 transition-opacity duration-300 blur-sm -z-10"
                animate={{ opacity: isFocused ? 1 : 0 }}
                layoutId="glow"
            />
            {children}
        </motion.div>
    );
};

const MorphingButton = ({
    loading,
    onClick,
    disabled,
    children,
    className
}: {
    loading: boolean;
    onClick?: () => void;
    disabled?: boolean;
    children: React.ReactNode;
    className?: string;
}) => {
    return (
        <motion.button
            layout
            type="submit"
            onClick={onClick}
            disabled={disabled}
            initial={{ borderRadius: "0.75rem" }}
            animate={{
                width: loading ? "56px" : "100%",
                borderRadius: loading ? "50px" : "0.75rem",
                backgroundColor: loading ? "var(--primary)" : "" // Ensure color consistency if needed
            }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }} // Smooth morph
            className={cn(
                "relative h-14 overflow-hidden flex items-center justify-center font-bold text-lg text-white shadow-lg transition-all active:scale-[0.98]",
                !loading && "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 hover:scale-[1.01]",
                loading && "bg-primary cursor-default",
                className
            )}
        >
            <AnimatePresence mode="popLayout">
                {loading ? (
                    <motion.div
                        key="loader"
                        initial={{ opacity: 0, scale: 0.5, rotate: -180 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        exit={{ opacity: 0, scale: 0.5, rotate: 180 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Loader2 className="w-6 h-6 animate-spin" />
                    </motion.div>
                ) : (
                    <motion.div
                        key="content"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="w-full"
                    >
                        {children}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.button>
    );
};

// --- Main Component ---

const Login = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Core State: 'organization' vs 'project'
    const [activeTab, setActiveTab] = useState<'organization' | 'project'>('organization');

    const [loading, setLoading] = useState<boolean>(false);

    // Form State
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorShake, setErrorShake] = useState(0); // Key to trigger shake

    // Character Interaction State
    const [charState, setCharState] = useState<InteractionState>('idle');
    const [errorMessage, setErrorMessage] = useState("");

    // Initialize tab from URL
    useEffect(() => {
        const context = searchParams.get("context");
        if (context === "project") {
            setActiveTab("project");
        } else {
            setActiveTab("organization");
        }
    }, [searchParams]);

    const triggerShake = (msg?: string) => {
        setErrorShake(prev => prev + 1);
        setCharState('error');
        if (msg) setErrorMessage(msg);
        setTimeout(() => {
            setCharState('idle');
            setErrorMessage(""); // Reset message after idle
        }, 2000);
    };




    const handleLogin = async (e?: React.FormEvent) => {
        e?.preventDefault();
        setCharState('checking');

        if (!email || !password) {
            triggerShake("Missing Credentials");
            toast.error("Please enter email and password");
            return;
        }

        if (!email.includes('@')) {
            triggerShake("Invalid Email");
            toast.error("Please enter a valid email");
            return;
        }

        setLoading(true);
        try {
            const normalizedEmail = email.toLowerCase().trim();

            if (activeTab === 'organization') {
                await apiClient.tenancyLogin({ email: normalizedEmail, password });
                navigate("/app/org-admin");
            } else {
                await apiClient.login({ email: normalizedEmail, password });

                // Check for pending invite redirect
                const pendingInvite = localStorage.getItem('pending_invite_code');
                if (pendingInvite) {
                    navigate(`/join-workspace?code=${pendingInvite}`);
                } else {
                    navigate("/app");
                }
            }

            setCharState('success');
            toast.success(`Welcome back!`);

        } catch (error: any) {
            triggerShake("Invalid Credentials");
            toast.error("Invalid credentials");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex bg-background text-foreground overflow-hidden selection:bg-primary/30 selection:text-primary-foreground mesh-gradient-bg">

            {/* Background Texture */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none"></div>

            {/* Deep Ambient Background Animation */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-primary/5 blur-[120px] animate-fluid" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/5 blur-[100px] animate-fluid animation-delay-2000" />
            </div>

            {/* Left Panel - Visuals (Desktop) */}
            <div className="hidden lg:flex flex-col justify-center w-[45%] p-12 relative z-10 h-screen border-r border-white/5 bg-background/30 backdrop-blur-sm">

                {/* Brand */}
                <div className="absolute top-12 left-12 flex items-center gap-3 animate-fade-in-up">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/20 border border-white/10">
                        <Building2 className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <span className="text-2xl font-bold tracking-tight text-foreground">Cortexa</span>
                </div>

                {/* AI Core Interaction Zone */}
                <div className="relative w-full max-w-lg mb-12 self-center animate-float">
                    <ReactiveCharacters state={charState} errorMessage={errorMessage} />
                </div>

                <div className="text-center px-8 animate-slide-up">
                    <h2 className="text-3xl font-black mb-4 tracking-tight">System Access</h2>
                    <p className="text-muted-foreground font-light leading-relaxed">
                        Authenticate to enter the neural command grid. <br /> Secure connection established.
                    </p>
                </div>
            </div>

            {/* Right Panel - Login Form */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 relative z-10">
                <Button
                    variant="ghost"
                    className="absolute top-6 left-6 lg:left-auto lg:right-6 text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => navigate('/welcome')}
                >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Return to Hub
                </Button>

                <div className="w-full max-w-[440px] space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">

                    {/* Header */}
                    <div className="space-y-2">
                        <h2 className="text-4xl font-bold tracking-tighter text-white">
                            {activeTab === 'organization' ? 'Enterprise Access' : 'Tactical Login'}
                        </h2>
                        <p className="text-muted-foreground/80 font-light text-base">
                            {activeTab === 'organization'
                                ? 'Manage your organization domain and settings.'
                                : 'Access your project workspace and mission data.'}
                        </p>
                    </div>

                    {/* Glass Card Container */}
                    <motion.div
                        key={errorShake}
                        animate={{ x: [0, -10, 10, -5, 5, 0] }}
                        transition={{ duration: 0.4 }}
                        className="card-prism p-8 rounded-3xl border-t border-white/10"
                    >
                        {/* Forms */}
                        <div className="relative z-10 min-h-[280px]">
                            <motion.form
                                key="login-form"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                                onSubmit={handleLogin}
                                className="space-y-6"
                                noValidate
                            >
                                <div className="space-y-5">
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-muted-foreground font-medium text-xs ml-1">
                                            {activeTab === 'organization' ? 'Admin Work Email' : 'Crew Member Email'}
                                        </Label>
                                        <MotionInputContainer>
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                                                <Mail className="w-4 h-4" />
                                            </div>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                onFocus={() => setCharState('email')}
                                                onBlur={() => setCharState('idle')}
                                                placeholder={activeTab === 'organization' ? "admin@company.com" : "operative@unit.com"}
                                                className="h-14 pl-12 bg-black/40 border-white/10 text-white placeholder:text-muted-foreground/30 focus:border-primary/50 focus:bg-black/60 rounded-xl transition-all text-sm"
                                                autoFocus
                                            />
                                        </MotionInputContainer>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center px-1">
                                            <Label htmlFor="password" className="text-muted-foreground font-medium text-xs">Password</Label>
                                            <span className="text-xs font-medium text-primary cursor-pointer hover:text-primary/80 transition-colors">Forgot password?</span>
                                        </div>
                                        <MotionInputContainer>
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                                                <Lock className="w-4 h-4" />
                                            </div>
                                            <Input
                                                id="password"
                                                type="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                onFocus={() => setCharState('password')}
                                                onBlur={() => setCharState('idle')}
                                                placeholder="••••••••"
                                                className="h-14 pl-12 bg-black/40 border-white/10 text-white placeholder:text-muted-foreground/30 focus:border-primary/50 focus:bg-black/60 rounded-xl transition-all text-sm"
                                            />
                                        </MotionInputContainer>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4">
                                    <MorphingButton loading={loading} className="w-full">
                                        Secure Login
                                    </MorphingButton>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        className="w-full text-muted-foreground hover:text-white hover:bg-white/5 text-xs font-mono uppercase tracking-widest"
                                        onClick={() => navigate(activeTab === 'organization' ? '/register/organization' : '/register/project')}
                                    >
                                        [ No Account? Register ]
                                    </Button>
                                </div>
                            </motion.form>
                        </div>
                    </motion.div>

                    <div className="text-center pt-4">
                        <p className="text-muted-foreground font-mono text-[10px] mb-4 uppercase tracking-widest opacity-70">
                            New Unit Detected?
                        </p>
                        <button
                            onClick={() => navigate(activeTab === 'organization' ? '/register/organization' : '/register/project')}
                            className="group relative px-6 py-2 rounded-full overflow-hidden bg-background border border-white/10 hover:border-primary/50 transition-all duration-500 hover:shadow-[0_0_20px_-5px_rgba(var(--primary-rgb),0.3)]"
                        >
                            <span className="relative z-10 text-xs font-bold uppercase tracking-widest group-hover:text-primary transition-colors">
                                {activeTab === 'organization' ? "Register Organization" : "Initialize Project"}
                            </span>
                            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Login;

