// Project Definition Wizard with AI recommendations
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, type ButtonProps } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { Slider } from "@/shared/components/ui/slider";
import { Badge } from "@/shared/components/ui/badge";
import {
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Target,
  Brain,
  Calendar,
  Code,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Plus,
  Rocket,
  Activity,
  Network,
  Loader2,
  Monitor,
  Cpu,
  ShieldCheck,
  Globe,
  Laptop,
  Info,
  X,
  Zap
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/shared/lib/utils";
import { apiClient } from "@/shared/lib/api";
import { useApp } from "@/shared/contexts/AppContext";

const Counter = ({ value, duration = 1000, prefix = "", suffix = "" }: { value: number, duration?: number, prefix?: string, suffix?: string }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) {
      setCount(end);
      return;
    }

    const totalIntervals = 50;
    const increment = (end - start) / totalIntervals;
    const intervalTime = duration / totalIntervals;

    const timer = setInterval(() => {
      start += increment;
      if ((increment > 0 && start >= end) || (increment < 0 && start <= end)) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [value, duration]);

  return (
    <span className="tabular-nums">
      {prefix}{count.toString().padStart(2, '0')}{suffix}
    </span>
  );
};

const steps = [
  { id: 1, title: "Basics", description: "Project name and type" },
  { id: 2, title: "Goals", description: "What are we building?" },
  { id: 3, title: "Timeline", description: "When do we need it?" },
  { id: 4, title: "Tech Stack", description: "What technologies?" },
  { id: 5, title: "Risks", description: "Constraints and priorities" },
  { id: 6, title: "Work Style", description: "How we collaborate" },
  { id: 7, title: "AI Mode", description: "AI automation preference" },
];

const projectTypes = [
  { id: "Greenfield", label: "Greenfield", description: "New project from scratch" },
  { id: "Maintenance", label: "Maintenance", description: "Ongoing support and updates" },
  { id: "Migration", label: "Migration", description: "Moving to new system" },
  { id: "Ops", label: "Ops", description: "Infrastructure and operations" },
];

const domainTags = [
  "Fintech", "E-commerce", "Internal Tools", "Infrastructure",
  "Healthcare", "Education", "SaaS", "Mobile App", "Web App", "API"
];

const workflows = [
  { id: "Agile", label: "Agile", description: "Sprints and iterations" },
  { id: "Kanban", label: "Kanban", description: "Continuous flow" },
  { id: "Ad-hoc", label: "Ad-hoc", description: "Flexible approach" },
];

const collaborationStyles = [
  { id: "Mostly async", label: "Mostly Async", description: "Async communication preferred" },
  { id: "Daily standups", label: "Daily Standups", description: "Daily sync meetings" },
  { id: "Weekly syncs", label: "Weekly Syncs", description: "Weekly coordination" },
];

const aiModes = [
  {
    id: "assist",
    label: "Assist Mode",
    description: "AI only suggests, humans confirm everything",
    icon: Brain
  },
  {
    id: "semi_auto",
    label: "Semi-Auto",
    description: "AI auto-assigns most tasks, asks when unsure",
    icon: Target
  },
  {
    id: "full_auto",
    label: "Full Auto",
    description: "AI runs task detection & assignment",
    icon: Sparkles
  },
];

const ProjectDefinitionWizard = () => {
  const navigate = useNavigate();
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const { currentWorkspace, refreshWorkspaces } = useApp();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [activeLogIndex, setActiveLogIndex] = useState(0);

  const ELITE_LOGS = [
    "INITIALIZING_PROFILE_MAPPING",
    "SCRUTINIZING_GOAL_VECTORS",
    "ALIGNED_TEMPORAL_CHANNELS",
    "RESOLVING_TECH_PROTOCOL",
    "ASSESSING_RISK_FACTORS",
    "OPTIMIZING_WORK_CULTURE",
    "FINALIZING_AI_INTEGRATION"
  ];

  useEffect(() => {
    setIsScanning(true);
    const timer = setTimeout(() => setIsScanning(false), 1500);
    setActiveLogIndex(currentStep - 1);
    return () => clearTimeout(timer);
  }, [currentStep]);

  // Initialize projectName from current workspace
  useState(() => {
    if (currentWorkspace?.name) {
      setFormData(prev => ({ ...prev, projectName: currentWorkspace.name }));
    }
  });

  const [formData, setFormData] = useState({
    projectName: "",
    projectType: "" as "Greenfield" | "Maintenance" | "Migration" | "Ops" | "",
    domainTags: [] as string[],
    goalOneLine: "",
    topOutcomes: ["", "", ""] as [string, string, string],
    inScope: [] as string[],
    outOfScope: [] as string[],
    targetEndDate: "",
    duration: "",
    milestones: [] as Array<{ name: string; targetDate: string }>,
    frontendStack: [] as string[],
    backendStack: [] as string[],
    infraStack: [] as string[],
    speedStabilityCostBias: { speed: 33, stability: 33, cost: 34 },
    deadlineFlexibility: "" as "Flexible" | "Somewhat Flexible" | "Fixed" | "",
    criticalModules: [] as string[],
    workflow: "" as "Agile" | "Kanban" | "Ad-hoc" | "",
    automationMode: "" as "assist" | "semi_auto" | "full_auto" | "",
    cultureMode: "" as "open" | "semi_private" | "privacy_first" | "",
  });

  const [newInScope, setNewInScope] = useState("");
  const [newOutOfScope, setNewOutOfScope] = useState("");
  const [newFrontendTech, setNewFrontendTech] = useState("");
  const [newBackendTech, setNewBackendTech] = useState("");
  const [newInfraPlatform, setNewInfraPlatform] = useState("");
  const [newCriticalModule, setNewCriticalModule] = useState("");
  const [newMilestoneName, setNewMilestoneName] = useState("");
  const [newMilestoneDate, setNewMilestoneDate] = useState("");

  const handleNext = () => {
    if (currentStep < steps.length && canProceed()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.projectName.trim() !== "" && formData.projectType !== "";
      case 2:
        return formData.goalOneLine.trim() !== "" &&
          formData.topOutcomes.every(o => o.trim() !== "");
      case 3:
        return true; // Timeline is optional
      case 4:
        return true; // Tech stack is optional but recommended
      case 5:
        return formData.deadlineFlexibility !== "";
      case 6:
        return formData.workflow !== "";
      case 7:
        return formData.automationMode !== "" && formData.cultureMode !== "";
      default:
        return false;
    }
  };

  const suggestAIMode = (): "assist" | "semi_auto" | "full_auto" => {
    // Simple heuristic based on project type and workflow
    if (formData.projectType === "Maintenance" || formData.workflow === "Ad-hoc") {
      return "assist";
    }
    if (formData.projectType === "Greenfield" && formData.workflow === "Agile") {
      return "semi_auto";
    }
    return "assist"; // Default
  };

  const suggestCultureMode = (): "open" | "semi_private" | "privacy_first" => {
    // Default to open for most cases
    return "open";
  };

  const handleSubmit = async () => {
    if (!workspaceId) {
      toast.error("Workspace ID is required");
      return;
    }

    try {
      setLoading(true);

      // Update workspace name if changed
      if (formData.projectName !== currentWorkspace?.name) {
        await apiClient.updateWorkspace(workspaceId, { name: formData.projectName });
      }

      // Prepare project profile according to new structure
      const projectProfile = {
        projectType: formData.projectType,
        domainTags: formData.domainTags,
        goalOneLine: formData.goalOneLine,
        topOutcomes: formData.topOutcomes.filter(o => o.trim() !== ""),
        inScope: formData.inScope,
        outOfScope: formData.outOfScope,
        targetEndDate: formData.targetEndDate ? new Date(formData.targetEndDate).toISOString() : undefined,
        milestones: formData.milestones.map(m => ({
          name: m.name,
          targetDate: new Date(m.targetDate).toISOString()
        })),
        frontendStack: formData.frontendStack,
        backendStack: formData.backendStack,
        infraStack: formData.infraStack,
        speedStabilityCostBias: formData.speedStabilityCostBias,
        deadlineFlexibility: formData.deadlineFlexibility,
        criticalModules: formData.criticalModules,
        workflow: formData.workflow,
      };

      const aiSettings = {
        automationMode: formData.automationMode || suggestAIMode(),
        cultureMode: formData.cultureMode || suggestCultureMode(),
      };

      await apiClient.saveProjectProfile(workspaceId, {
        projectProfile,
        aiSettings
      });

      toast.success("Project profile saved successfully!");
      await refreshWorkspaces();
      navigate(`/app`);
    } catch (error: any) {
      toast.error(error.message || "Failed to save project profile");
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-foreground tracking-tighter">Project Designation</h2>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Map foundational project parameters</p>
              </div>
            </div>

            <div className="space-y-8">
              <div>
                <div className="flex justify-between items-center px-1 mb-2">
                  <InputLabel className="text-primary/70 mb-0">Identity Assignment</InputLabel>
                  {!formData.projectName && <Badge className="bg-primary/10 text-primary border-primary/20 text-[7px] font-black px-1.5 py-0 rounded-sm">REQUIRED</Badge>}
                </div>
                <div className="relative group/designation">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within/designation:text-primary transition-colors">
                    <Laptop className="w-5 h-5" />
                  </div>
                  <Input
                    id="projectName"
                    value={formData.projectName}
                    onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                    placeholder="e.g. CORTEX_UPGRADE"
                    className="h-16 pl-14 text-xl bg-muted/20 border-border/50 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 text-foreground transition-all rounded-2xl font-black tracking-tight shadow-inner"
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <InputLabel className="text-primary/70 mb-4">Architecture Type</InputLabel>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {projectTypes.map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, projectType: type.id as any })}
                      className={cn(
                        "p-6 rounded-[2rem] border transition-all duration-500 group relative overflow-hidden flex flex-col text-left",
                        formData.projectType === type.id
                          ? "bg-primary/10 border-primary/40 ring-1 ring-primary/20 shadow-xl"
                          : "bg-muted/10 border-white/[0.05] hover:border-primary/30 hover:bg-muted/20"
                      )}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className={cn(
                          "text-lg font-black tracking-tight",
                          formData.projectType === type.id ? "text-primary" : "text-foreground"
                        )}>
                          {type.label}
                        </div>
                        {formData.projectType === type.id && (
                          <CheckCircle2 className="w-5 h-5 text-primary animate-in zoom-in" />
                        )}
                      </div>
                      <div className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-60 leading-relaxed">{type.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <InputLabel className="text-primary/70 mb-4">Domain Specialization</InputLabel>
                <div className="flex flex-wrap gap-2 items-center bg-muted/20 p-4 rounded-2xl border border-border/50">
                  {domainTags.map((tag) => {
                    const isActive = formData.domainTags.includes(tag);
                    return (
                      <Badge
                        key={tag}
                        variant={isActive ? "default" : "secondary"}
                        onClick={() => {
                          const tags = isActive
                            ? formData.domainTags.filter(t => t !== tag)
                            : [...formData.domainTags, tag];
                          setFormData({ ...formData, domainTags: tags });
                        }}
                        className={cn(
                          "cursor-pointer px-4 py-2 rounded-xl transition-all text-[10px] font-bold uppercase tracking-wide group/badge",
                          isActive
                            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                            : "bg-card border border-border text-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/30"
                        )}
                      >
                        {tag} {isActive && <CheckCircle2 className="w-3 h-3 ml-1.5" />}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-foreground tracking-tighter">Strategic Intent</h2>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Define operational objectives & scope</p>
              </div>
            </div>

            <div className="space-y-8">
              <div className="bg-card/20 backdrop-blur-md border border-white/[0.05] p-6 rounded-[2.5rem] shadow-inner">
                <InputLabel className="text-primary/70 mb-4 ml-2">Core Objective (One-Line)</InputLabel>
                <Textarea
                  id="goalOneLine"
                  value={formData.goalOneLine}
                  onChange={(e) => setFormData({ ...formData, goalOneLine: e.target.value })}
                  placeholder="The primary mission of this project..."
                  className="min-h-[120px] text-lg bg-black/20 border-border/40 focus:border-primary/40 focus:ring-primary/10 rounded-2xl resize-none p-6 font-bold tracking-tight shadow-inner"
                />
              </div>

              <div className="bg-card/20 backdrop-blur-md border border-white/[0.05] p-8 rounded-[2.5rem] shadow-inner">
                <InputLabel className="text-primary/70 mb-6 ml-2">Targeted Outcomes</InputLabel>
                <div className="space-y-4">
                  {formData.topOutcomes.map((outcome, idx) => (
                    <div key={idx} className="relative group transition-all duration-500">
                      <div className="absolute left-5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center text-xs font-black shadow-lg">
                        0{idx + 1}
                      </div>
                      <Input
                        value={outcome}
                        onChange={(e) => {
                          const newOutcomes = [...formData.topOutcomes];
                          newOutcomes[idx] = e.target.value;
                          setFormData({ ...formData, topOutcomes: newOutcomes as [string, string, string] });
                        }}
                        placeholder={`Strategic outcome ${idx + 1}...`}
                        className="pl-16 h-14 bg-black/20 border-border/40 focus:border-primary/40 focus:ring-primary/10 rounded-2xl text-sm font-bold tracking-tight shadow-inner"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-card/20 backdrop-blur-md border border-white/[0.05] p-6 rounded-[2.5rem] shadow-inner">
                  <InputLabel className="text-emerald-500/70 mb-4 ml-2">In Scope Protocol</InputLabel>
                  <div className="flex gap-2 mb-4">
                    <Input
                      value={newInScope}
                      onChange={(e) => setNewInScope(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && newInScope.trim()) {
                          setFormData({ ...formData, inScope: [...formData.inScope, newInScope.trim()] });
                          setNewInScope("");
                        }
                      }}
                      placeholder="Add scope item..."
                      className="h-12 bg-black/20 border-emerald-500/20 rounded-xl font-bold text-xs"
                    />
                    <Button
                      type="button"
                      onClick={() => {
                        if (newInScope.trim()) {
                          setFormData({ ...formData, inScope: [...formData.inScope, newInScope.trim()] });
                          setNewInScope("");
                        }
                      }}
                      className="h-12 w-12 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-500 hover:text-white border border-emerald-600/30 p-0"
                    >
                      <Plus className="w-5 h-5" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 min-h-[40px]">
                    {formData.inScope.map((item, idx) => (
                      <Badge key={idx} variant="secondary" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-2 group/badge">
                        {item}
                        <button onClick={() => setFormData({ ...formData, inScope: formData.inScope.filter((_, i) => i !== idx) })} className="hover:text-red-500 transition-colors">
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="bg-card/20 backdrop-blur-md border border-white/[0.05] p-6 rounded-[2.5rem] shadow-inner">
                  <InputLabel className="text-amber-500/70 mb-4 ml-2">Out of Scope Protocol</InputLabel>
                  <div className="flex gap-2 mb-4">
                    <Input
                      value={newOutOfScope}
                      onChange={(e) => setNewOutOfScope(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && newOutOfScope.trim()) {
                          setFormData({ ...formData, outOfScope: [...formData.outOfScope, newOutOfScope.trim()] });
                          setNewOutOfScope("");
                        }
                      }}
                      placeholder="Add non-scope item..."
                      className="h-12 bg-black/20 border-amber-500/20 rounded-xl font-bold text-xs"
                    />
                    <Button
                      type="button"
                      onClick={() => {
                        if (newOutOfScope.trim()) {
                          setFormData({ ...formData, outOfScope: [...formData.outOfScope, newOutOfScope.trim()] });
                          setNewOutOfScope("");
                        }
                      }}
                      className="h-12 w-12 rounded-xl bg-amber-600/20 hover:bg-amber-600 text-amber-500 hover:text-white border border-amber-600/30 p-0"
                    >
                      <Plus className="w-5 h-5" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 min-h-[40px]">
                    {formData.outOfScope.map((item, idx) => (
                      <Badge key={idx} variant="secondary" className="bg-amber-500/10 text-amber-500 border-amber-500/20 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                        {item}
                        <button onClick={() => setFormData({ ...formData, outOfScope: formData.outOfScope.filter((_, i) => i !== idx) })} className="hover:text-red-500 transition-colors">
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-foreground tracking-tighter">Temporal Roadmap</h2>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Map critical deadlines & delivery syncs</p>
              </div>
            </div>

            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-card/20 backdrop-blur-md border border-white/[0.05] p-6 rounded-[2.5rem] shadow-inner">
                  <InputLabel className="text-primary/70 mb-4 ml-2">Target End Sequence</InputLabel>
                  <div className="relative group/date">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within/date:text-primary transition-colors" />
                    <Input
                      id="targetEndDate"
                      type="date"
                      value={formData.targetEndDate}
                      onChange={(e) => setFormData({ ...formData, targetEndDate: e.target.value })}
                      className="pl-12 h-14 bg-black/20 border-border/40 focus:border-primary/40 focus:ring-primary/10 rounded-2xl font-bold tracking-tight shadow-inner"
                    />
                  </div>
                </div>
                <div className="bg-card/20 backdrop-blur-md border border-white/[0.05] p-6 rounded-[2.5rem] shadow-inner">
                  <InputLabel className="text-primary/70 mb-4 ml-2">Estimated Duration</InputLabel>
                  <div className="relative group/duration">
                    <Activity className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within/duration:text-primary transition-colors" />
                    <Input
                      id="duration"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      placeholder="e.g. 12_WEEKS"
                      className="pl-12 h-14 bg-black/20 border-border/40 focus:border-primary/40 focus:ring-primary/10 rounded-2xl font-bold tracking-tight shadow-inner uppercase"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-card/20 backdrop-blur-md border border-white/[0.05] p-10 rounded-[3rem] shadow-inner relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                <InputLabel className="text-primary/70 mb-6">Critical Milestones</InputLabel>
                <div className="flex gap-3 mb-8">
                  <div className="flex-1 relative group/milename">
                    <Input
                      value={newMilestoneName}
                      onChange={(e) => setNewMilestoneName(e.target.value)}
                      placeholder="Milestone Objective..."
                      className="h-14 bg-black/20 border-border/40 focus:border-primary/40 focus:ring-primary/10 rounded-2xl font-bold text-sm px-6"
                    />
                  </div>
                  <div className="w-48 relative group/miledate">
                    <Input
                      type="date"
                      value={newMilestoneDate}
                      onChange={(e) => setNewMilestoneDate(e.target.value)}
                      className="h-14 bg-black/20 border-border/40 focus:border-primary/40 rounded-2xl font-bold px-4"
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={() => {
                      if (newMilestoneName.trim() && newMilestoneDate) {
                        setFormData({
                          ...formData,
                          milestones: [...formData.milestones, { name: newMilestoneName.trim(), targetDate: newMilestoneDate }]
                        });
                        setNewMilestoneName("");
                        setNewMilestoneDate("");
                      }
                    }}
                    className="h-14 w-14 rounded-2xl bg-primary text-black hover:bg-primary/90 p-0 shadow-lg shadow-primary/20"
                  >
                    <Plus className="w-6 h-6" />
                  </Button>
                </div>

                <div className="space-y-4">
                  {formData.milestones.map((milestone, idx) => (
                    <div key={idx} className="flex items-center justify-between p-5 bg-muted/20 rounded-[2.5rem] border border-white/[0.03] transition-all hover:bg-muted/30 group/mile">
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black shadow-lg">
                          0{idx + 1}
                        </div>
                        <div>
                          <div className="font-black text-foreground tracking-tight text-base uppercase">{milestone.name}</div>
                          <div className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-1 opacity-60 flex items-center gap-2">
                            <Calendar className="w-3 h-3 text-primary" />
                            {new Date(milestone.targetDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, milestones: formData.milestones.filter((_, i) => i !== idx) });
                        }}
                        className="p-3 text-muted-foreground hover:text-red-400 opacity-0 group-hover/mile:opacity-100 transition-all hover:bg-red-400/10 rounded-xl"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                  {formData.milestones.length === 0 && (
                    <div className="text-center py-12 bg-black/20 rounded-[2.5rem] border-2 border-dashed border-border/50 text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] opacity-40">
                      Phase targets not defined
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-foreground tracking-tighter">Technological Matrix</h2>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Assign foundational tech protocols</p>
              </div>
            </div>

            <div className="space-y-8">
              {[
                { label: 'Frontend Ecosystem', key: 'frontendStack', icon: Monitor, color: 'text-primary', value: newFrontendTech, setter: setNewFrontendTech },
                { label: 'Backend Architecture', key: 'backendStack', icon: Cpu, color: 'text-primary', value: newBackendTech, setter: setNewBackendTech },
                { label: 'Cloud Infrastructure', key: 'infraStack', icon: Globe, color: 'text-primary', value: newInfraPlatform, setter: setNewInfraPlatform }
              ].map((stack) => (
                <div key={stack.key} className="bg-card/20 backdrop-blur-md border border-white/[0.05] p-8 rounded-[3rem] shadow-inner relative overflow-hidden group/stack">
                  <div className="flex items-center justify-between mb-8 px-2">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-lg">
                        <stack.icon className="w-5 h-5" />
                      </div>
                      <InputLabel className="mb-0 text-base">{stack.label}</InputLabel>
                    </div>
                    <Badge variant="outline" className="border-border/50 text-[8px] font-black uppercase tracking-widest px-2 opacity-40">
                      STACK_INT_V1
                    </Badge>
                  </div>

                  <div className="flex gap-3 mb-8">
                    <Input
                      value={stack.value}
                      onChange={(e) => stack.setter(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && stack.value.trim()) {
                          setFormData({ ...formData, [stack.key]: [...(formData[stack.key as keyof typeof formData] as string[]), stack.value.trim()] });
                          stack.setter("");
                        }
                      }}
                      placeholder={`Add ${stack.label.toLowerCase()} unit...`}
                      className="h-14 bg-black/20 border-border/40 focus:border-primary/40 focus:ring-primary/10 rounded-2xl font-bold text-sm px-6"
                    />
                    <Button
                      type="button"
                      onClick={() => {
                        if (stack.value.trim()) {
                          setFormData({ ...formData, [stack.key]: [...(formData[stack.key as keyof typeof formData] as string[]), stack.value.trim()] });
                          stack.setter("");
                        }
                      }}
                      className="h-14 w-14 rounded-2xl bg-primary text-black hover:bg-primary/90 p-0 shadow-lg"
                    >
                      <Plus className="w-6 h-6" />
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2.5 min-h-[40px]">
                    {(formData[stack.key as keyof typeof formData] as string[]).map((tech, idx) => (
                      <Badge
                        key={idx}
                        variant="secondary"
                        className="bg-muted/30 hover:bg-red-400/10 hover:text-red-400 hover:border-red-400/20 border border-border/50 px-4 py-2.5 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest cursor-pointer group/badge shadow-sm"
                        onClick={() => {
                          const updated = (formData[stack.key as keyof typeof formData] as string[]).filter((_, i) => i !== idx);
                          setFormData({ ...formData, [stack.key]: updated });
                        }}
                      >
                        {tech}
                        <X className="w-3.5 h-3.5 ml-2.5 opacity-40 group-hover/badge:rotate-90 transition-transform" />
                      </Badge>
                    ))}
                    {(formData[stack.key as keyof typeof formData] as string[]).length === 0 && (
                      <p className="text-[10px] font-bold text-muted-foreground/30 uppercase tracking-[0.2em] ml-2 mt-2">No units assigned</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-foreground tracking-tighter">Strategic Equilibrium</h2>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Analyze trade-offs & risk surfaces</p>
              </div>
            </div>

            <div className="space-y-12">
              <div className="bg-card/20 backdrop-blur-md border border-white/[0.05] p-10 rounded-[3rem] shadow-inner relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                <InputLabel className="text-primary/70 mb-10 text-center">Execution Constraints (Project Triangle)</InputLabel>

                <div className="space-y-12 max-w-md mx-auto">
                  {[
                    { label: 'Architectural Speed', key: 'speed', value: formData.speedStabilityCostBias.speed, description: 'Aggressive delivery vs. Technical debt', color: 'bg-primary' },
                    { label: 'System Stability', key: 'stability', value: formData.speedStabilityCostBias.stability, description: 'Scope depth vs. Polished stability', color: 'bg-blue-500' },
                    { label: 'Cost Efficiency', key: 'cost', value: formData.speedStabilityCostBias.cost, description: 'Budget efficiency vs. Infrastructure scale', color: 'bg-orange-500' }
                  ].map((trade) => (
                    <div key={trade.key} className="space-y-4">
                      <div className="flex justify-between items-end">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <div className={cn("w-2 h-2 rounded-full", trade.color)} />
                            <div className="text-sm font-black text-foreground tracking-tight uppercase">{trade.label}</div>
                          </div>
                          <div className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest">{trade.description}</div>
                        </div>
                        <div className="text-xl font-black text-primary font-mono">{trade.value}%</div>
                      </div>
                      <Slider
                        value={[trade.value]}
                        onValueChange={(value) => {
                          const remaining = 100 - value[0];
                          const otherKeys = (['speed', 'stability', 'cost'] as const).filter(k => k !== trade.key);
                          const sumOthers = formData.speedStabilityCostBias[otherKeys[0]] + formData.speedStabilityCostBias[otherKeys[1]];

                          let val1, val2;
                          if (sumOthers === 0) {
                            val1 = Math.floor(remaining / 2);
                            val2 = remaining - val1;
                          } else {
                            val1 = Math.round(remaining * (formData.speedStabilityCostBias[otherKeys[0]] / sumOthers));
                            val2 = remaining - val1;
                          }

                          setFormData({
                            ...formData,
                            speedStabilityCostBias: {
                              ...formData.speedStabilityCostBias,
                              [trade.key]: value[0],
                              [otherKeys[0]]: val1,
                              [otherKeys[1]]: val2
                            }
                          });
                        }}
                        max={100}
                        step={1}
                        className="py-4"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {(["Flexible", "Somewhat Flexible", "Fixed"] as const).map((flex) => (
                  <button
                    key={flex}
                    type="button"
                    onClick={() => setFormData({ ...formData, deadlineFlexibility: flex })}
                    className={cn(
                      "p-8 rounded-[2.5rem] border-2 transition-all duration-500 relative flex flex-col items-center gap-4 group/flex",
                      formData.deadlineFlexibility === flex
                        ? "bg-primary/10 border-primary shadow-[0_0_40px_rgba(var(--primary-rgb),0.15)] shadow-inner"
                        : "bg-card/20 border-white/[0.05] hover:border-primary/30 hover:bg-card/30"
                    )}
                  >
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500",
                      formData.deadlineFlexibility === flex ? "bg-primary text-black" : "bg-muted/30 text-muted-foreground group-hover/flex:text-primary"
                    )}>
                      {flex === 'Flexible' ? <Globe className="w-6 h-6" /> : flex === 'Fixed' ? <ShieldCheck className="w-6 h-6" /> : <Activity className="w-6 h-6" />}
                    </div>
                    <div className="text-center space-y-1">
                      <div className={cn("text-xs font-black uppercase tracking-widest", formData.deadlineFlexibility === flex ? "text-foreground" : "text-muted-foreground")}>{flex}</div>
                      <div className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em]">Temporal Mode</div>
                    </div>
                    {formData.deadlineFlexibility === flex && (
                      <div className="absolute top-4 right-4 h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                    )}
                  </button>
                ))}
              </div>

              <div className="bg-card/20 backdrop-blur-md border border-white/[0.05] p-10 rounded-[3rem] shadow-inner relative overflow-hidden">
                <InputLabel className="text-primary/70 mb-6">Critical Risk Modules</InputLabel>
                <div className="flex gap-3 mb-8">
                  <Input
                    value={newCriticalModule}
                    onChange={(e) => setNewCriticalModule(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && newCriticalModule.trim()) {
                        setFormData({ ...formData, criticalModules: [...formData.criticalModules, newCriticalModule.trim()] });
                        setNewCriticalModule("");
                      }
                    }}
                    placeholder="Identify fault-sensitive domain..."
                    className="h-14 bg-black/20 border-border/40 focus:border-primary/40 focus:ring-primary/10 rounded-2xl font-bold text-sm px-6"
                  />
                  <Button
                    type="button"
                    onClick={() => {
                      if (newCriticalModule.trim()) {
                        setFormData({ ...formData, criticalModules: [...formData.criticalModules, newCriticalModule.trim()] });
                        setNewCriticalModule("");
                      }
                    }}
                    className="h-14 w-14 rounded-2xl bg-primary text-black hover:bg-primary/90 p-0 shadow-lg"
                  >
                    <Plus className="w-6 h-6" />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-3">
                  {formData.criticalModules.map((module, idx) => (
                    <Badge
                      key={idx}
                      variant="outline"
                      className="bg-red-400/5 hover:bg-red-400/10 border-red-400/20 text-red-400 px-5 py-2.5 rounded-2xl transition-all flex items-center gap-3 cursor-pointer group/risk"
                      onClick={() => {
                        setFormData({ ...formData, criticalModules: formData.criticalModules.filter((_, i) => i !== idx) });
                      }}
                    >
                      <Zap className="w-3.5 h-3.5 animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-widest">{module}</span>
                      <X className="w-3.5 h-3.5 ml-1 opacity-40 group-hover/risk:rotate-90 transition-transform" />
                    </Badge>
                  ))}
                  {formData.criticalModules.length === 0 && (
                    <div className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.3em] py-4 w-full text-center border-2 border-dashed border-border/20 rounded-[2rem]">
                      No failure vectors identified
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-foreground tracking-tighter">Operational Blueprint</h2>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Select execution framework & synchronicity</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {workflows.map((wf) => (
                <button
                  key={wf.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, workflow: wf.id as any })}
                  className={cn(
                    "p-8 border-2 rounded-[3rem] text-left transition-all duration-500 relative flex flex-col h-full group/wf",
                    formData.workflow === wf.id
                      ? "bg-primary/10 border-primary shadow-[0_0_40px_rgba(var(--primary-rgb),0.1)] shadow-inner"
                      : "bg-card/20 border-white/[0.05] hover:border-primary/30 hover:bg-card/30"
                  )}
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500",
                      formData.workflow === wf.id ? "bg-primary text-black" : "bg-muted/30 text-muted-foreground group-hover/wf:text-primary"
                    )}>
                      {wf.id === 'Agile' ? <Activity className="w-6 h-6" /> : wf.id === 'Kanban' ? <Network className="w-6 h-6" /> : <Rocket className="w-6 h-6" />}
                    </div>
                    {formData.workflow === wf.id && (
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-black">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                  <div className="space-y-2 flex-1">
                    <div className={cn("text-base font-black tracking-tight uppercase transition-colors", formData.workflow === wf.id ? "text-primary" : "text-foreground")}>{wf.label}</div>
                    <div className="text-[10px] font-bold text-muted-foreground/60 leading-relaxed uppercase tracking-widest">{wf.description}</div>
                  </div>
                  <div className="mt-6 pt-6 border-t border-white/[0.05]">
                    <div className="text-[8px] font-black text-muted-foreground/30 uppercase tracking-[0.2em]">Framework Profile</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 7:
        const suggestedMode = suggestAIMode();
        const cultureModes = [
          { id: "open", label: "Open Paradigm", description: "Transparent communication, all team members can see everything", icon: Globe },
          { id: "semi_private", label: "Hybrid Access", description: "Segmented visibility based on operational relevance", icon: ShieldCheck },
          { id: "privacy_first", label: "Stealth Protocol", description: "Maximum containment, information is isolated by default", icon: Zap }
        ];
        return (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-foreground tracking-tighter">Cortex Configuration</h2>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Finalize AI autonomy & collaborative protocols</p>
              </div>
            </div>

            <div className="space-y-12">
              <div className="p-10 bg-gradient-to-br from-primary/5 via-primary/10 to-transparent rounded-[3rem] flex items-start gap-8 border border-primary/20 relative overflow-hidden group/sug">
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover/sug:opacity-100 transition-opacity duration-1000" />
                <div className="p-4 bg-primary/10 rounded-2xl border border-primary/20 shadow-lg relative z-10">
                  <Brain className="w-8 h-8 text-primary animate-pulse" />
                </div>
                <div className="relative z-10 space-y-2">
                  <div className="text-sm font-black text-primary uppercase tracking-[0.2em]">Cortex Projection</div>
                  <div className="text-lg font-black text-foreground leading-tight">
                    Optimized for {formData.projectType || "standard"} deployment using {formData.workflow || "default"} framework.
                  </div>
                  <div className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest">
                    Recommended: <span className="text-foreground">{aiModes.find(m => m.id === suggestedMode)?.label}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <InputLabel className="text-primary/70 ml-2">Autonomy Mode</InputLabel>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {aiModes.map((mode) => {
                    const Icon = mode.icon;
                    return (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, automationMode: mode.id as any })}
                        className={cn(
                          "p-8 border-2 rounded-[3rem] text-left transition-all duration-500 relative flex flex-col h-full group/ai",
                          formData.automationMode === mode.id
                            ? "bg-primary/10 border-primary shadow-[0_0_40px_rgba(var(--primary-rgb),0.1)] shadow-inner"
                            : "bg-card/20 border-white/[0.05] hover:border-primary/30 hover:bg-card/30"
                        )}
                      >
                        <div className="flex items-center justify-between mb-6">
                          <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500",
                            formData.automationMode === mode.id ? "bg-primary text-black" : "bg-muted/30 text-muted-foreground group-hover/ai:text-primary"
                          )}>
                            <Icon className="w-6 h-6" />
                          </div>
                          {formData.automationMode === mode.id && (
                            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-black">
                              <CheckCircle2 className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                        <div className="space-y-2 flex-1">
                          <div className={cn("text-base font-black tracking-tight uppercase transition-colors", formData.automationMode === mode.id ? "text-primary" : "text-foreground")}>{mode.label}</div>
                          <div className="text-[10px] font-bold text-muted-foreground/60 leading-relaxed uppercase tracking-widest">{mode.description}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-6">
                <InputLabel className="text-primary/70 ml-2">Team Culture Protocol</InputLabel>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {cultureModes.map((mode) => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, cultureMode: mode.id as any })}
                      className={cn(
                        "p-8 border-2 rounded-[3rem] text-left transition-all duration-500 relative flex flex-col h-full group/cult",
                        formData.cultureMode === mode.id
                          ? "bg-primary/10 border-primary shadow-[0_0_40px_rgba(var(--primary-rgb),0.1)] shadow-inner"
                          : "bg-card/20 border-white/[0.05] hover:border-primary/30 hover:bg-card/30"
                      )}
                    >
                      <div className="flex items-center justify-between mb-6">
                        <div className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500",
                          formData.cultureMode === mode.id ? "bg-primary text-black" : "bg-muted/30 text-muted-foreground group-hover/cult:text-primary"
                        )}>
                          <mode.icon className="w-6 h-6" />
                        </div>
                        {formData.cultureMode === mode.id && (
                          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-black">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                      <div className="space-y-2 flex-1">
                        <div className={cn("text-base font-black tracking-tight uppercase transition-colors", formData.cultureMode === mode.id ? "text-primary" : "text-foreground")}>{mode.label}</div>
                        <div className="text-[10px] font-bold text-muted-foreground/60 leading-relaxed uppercase tracking-widest">{mode.description}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const InputLabel = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <Label className={cn("text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-2 block", className)}>{children}</Label>
  );

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 selection:text-primary-foreground font-sans">
      {/* Background Texture */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none fixed"></div>
      <div className="fixed top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[100px] pointer-events-none" />

      <div className="container mx-auto max-w-3xl px-6 py-12 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-16">
          <Button variant="ghost" className="text-muted-foreground hover:text-foreground hover:bg-muted/50 gap-2 h-10 px-4 rounded-xl transition-all font-bold text-xs uppercase tracking-widest" onClick={() => navigate('/app')}>
            <ArrowLeft className="w-3.5 h-3.5" /> Cancel
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)]">
              <Rocket className="w-5 h-5 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-xl tracking-tight leading-none text-foreground">Project Profiler</span>
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mt-1">Strategic Architecture v1.0</span>
            </div>
          </div>
        </div>

        {/* Progress System */}
        <div className="mb-12 relative group/nav">
          <div className="flex justify-between mb-4 px-2">
            <div className="flex items-baseline gap-2">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Deployment Step</span>
              <span className="text-lg font-black text-primary leading-none">{currentStep.toString().padStart(2, '0')}</span>
              <span className="text-xs font-bold text-muted-foreground/50 tracking-widest">/ {steps.length.toString().padStart(2, '0')}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] block mb-0.5">Active Module</span>
              <span className="text-sm font-black text-foreground tracking-tight transition-all group-hover/nav:text-primary">{
                steps[currentStep - 1].title.toUpperCase()
              }</span>
            </div>
          </div>
          <div className="h-2 bg-muted/40 rounded-full overflow-hidden border border-border/20 backdrop-blur-sm">
            <div
              className="h-full bg-gradient-to-r from-primary via-blue-500 to-primary/80 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] rounded-full shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)] bg-[length:200%_auto] animate-shimmer"
              style={{ width: `${(currentStep / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Main Card */}
        <div className="mb-12 min-h-[500px] bg-card/40 backdrop-blur-3xl border border-white/[0.05] rounded-[3.5rem] p-12 md:p-16 shadow-[0_48px_128px_-32px_rgba(0,0,0,0.6)] relative overflow-hidden group/modal transition-all duration-700 hover:shadow-[0_64px_160px_-48px_rgba(0,0,0,0.7)]">
          {/* Glassmorphism Accents */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-50" />
          <div className="absolute -inset-1 bg-gradient-to-br from-primary/5 via-blue-500/5 to-emerald-500/5 rounded-[3.5rem] opacity-0 group-hover/modal:opacity-100 transition-opacity duration-1000 -z-10 blur-3xl" />

          {/* System Log Feed */}
          <div className="absolute top-8 right-12 flex items-center gap-4 animate-in fade-in slide-in-from-right-8 duration-1000 delay-500">
            <div className="flex flex-col items-end">
              <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.25em] leading-none opacity-60">Strategic Log</span>
              <div className="mt-1.5 flex items-center gap-2 py-1 px-3 bg-primary/5 rounded-full border border-primary/10">
                <span className="flex h-1.5 w-1.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary"></span>
                </span>
                <span className="text-[10px] font-black text-primary uppercase tracking-widest font-mono">
                  {loading ? "INITIALIZING_PERSISTENCE" :
                    isScanning ? "REVOLVING_VECTORS" :
                      ELITE_LOGS[activeLogIndex]}
                </span>
              </div>
            </div>
          </div>

          <div className="relative z-10">
            {renderStep()}
          </div>

          {/* Noise Texture Overlay */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.015] pointer-events-none" />
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between border-t border-border pt-8">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={currentStep === 1}
            className="text-muted-foreground hover:text-foreground hover:bg-muted font-bold"
          >
            Previous
          </Button>

          {currentStep < steps.length ? (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className={cn(
                "bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8 h-12 text-base font-black tracking-tight shadow-lg shadow-primary/20",
                !canProceed() && "opacity-50 cursor-not-allowed bg-muted text-muted-foreground shadow-none hover:bg-muted"
              )}
            >
              Continue <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!canProceed() || loading}
              className={cn(
                "bg-emerald-600 hover:bg-emerald-500 text-white rounded-full px-8 h-12 text-base font-black tracking-tight shadow-lg shadow-emerald-500/20",
                (loading || !canProceed()) && "opacity-50 cursor-not-allowed bg-muted text-muted-foreground shadow-none hover:bg-muted"
              )}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Init Profile"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDefinitionWizard;

