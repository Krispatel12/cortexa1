import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Search,
  MoreHorizontal,
  Mail,
  Shield,
  Clock,
  TrendingUp,
  AlertCircle,
  Loader2,
  UserPlus,
  LayoutGrid,
  List,
  AlertTriangle
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Badge } from "@/shared/components/ui/badge";
import { Progress } from "@/shared/components/ui/progress";
import { cn } from "@/shared/lib/utils";
import { useApp } from "@/shared/contexts/AppContext";
import { apiClient } from "@/shared/lib/api"; // API Client
import { toast } from "sonner";
import { InviteModal } from "@/features/organization/components/InviteModal";
import { PendingMembersSection } from "@/features/organization/components/PendingMembersSection";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";

interface TeamMember {
  _id: string;
  name: string;
  email?: string; // Only visible to Omni/Org Admin
  role: 'omni' | 'crew' | 'guest';
  specialization?: string | null;
  joinedAt?: string; // Only visible to Omni/Org Admin
  status?: 'active' | 'removed' | 'invited'; // Added 'invited' status
  pendingRoleDecision?: boolean; // Only visible to Omni/Org Admin
  online?: boolean;
}

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  available: { bg: "bg-success", text: "text-success", label: "Available" },
  busy: { bg: "bg-warning", text: "text-warning", label: "Busy" },
  dnd: { bg: "bg-destructive", text: "text-destructive", label: "Do Not Disturb" },
};

const Team = () => {
  const { currentWorkspace, user } = useApp();
  const navigate = useNavigate();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [omnis, setOmnis] = useState<TeamMember[]>([]);
  const [crew, setCrew] = useState<TeamMember[]>([]);
  const [pendingCrew, setPendingCrew] = useState<TeamMember[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [viewerRole, setViewerRole] = useState<'org_admin' | 'omni' | 'crew'>('crew');
  const [canSeeFullInfo, setCanSeeFullInfo] = useState(false);
  const [filteredMembers, setFilteredMembers] = useState<TeamMember[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'members' | 'manage' | 'insights'>('members');
  const [viewMode, setViewMode] = useState<'grid' | 'table' | 'squads'>('squads');
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  const [inviteCode, setInviteCode] = useState("");
  const [inviteCodeLoading, setInviteCodeLoading] = useState(false);
  const [inviteCodeOpen, setInviteCodeOpen] = useState(false);

  useEffect(() => {
    if (currentWorkspace) {
      loadMembers();
    }
  }, [currentWorkspace, activeTab]);

  useEffect(() => {
    filterMembers();
  }, [members, searchQuery, currentWorkspace, viewerRole]);

  // Check permissions
  const isOrgAdmin = currentWorkspace?.role === 'org_admin';
  const isOmni = currentWorkspace?.role === 'omni';
  // Allow Omni OR Org Admin to manage
  const canManage = isOrgAdmin || isOmni;

  const loadMembers = async () => {
    if (!currentWorkspace) return;
    try {
      setLoading(true);
      const data = await apiClient.getWorkspaceMembers(currentWorkspace._id);

      // If the backend returns these arrays directly
      setMembers(data.members || []);
      setOmnis(data.omnis || []);
      setCrew(data.crew || []);
      setPendingCrew(data.pendingCrew || []);
      setStats(data.stats);

      // Process Invites and add to members list for display
      if (data.invites && Array.isArray(data.invites)) {
        const inviteMembers: TeamMember[] = data.invites.map((invite: any) => ({
          _id: invite._id,
          name: invite.email.split('@')[0], // Use email prefix as temp name
          email: invite.email,
          role: invite.invitedRole,
          specialization: invite.squad || invite.invitedSpecialization, // Use squad map
          status: 'invited',
          online: false
        }));

        // Merge invites into members for display
        setMembers(prev => [...prev, ...inviteMembers]);
      }

      // If backend says we can see full info
      setCanSeeFullInfo(!!data.canSeeFullInfo);

      // Update viewer role if returned
      if (data.viewerRole) {
        setViewerRole(data.viewerRole);
      }

    } catch (error: any) {
      console.error("Failed to load members:", error);
      toast.error("Failed to load team members");
    } finally {
      setLoading(false);
    }
  };

  const filterMembers = () => {
    let filtered = [...members];

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(m =>
        m.name.toLowerCase().includes(q) ||
        (m.email && m.email.toLowerCase().includes(q)) ||
        (m.specialization && m.specialization.toLowerCase().includes(q))
      );
    }

    setFilteredMembers(filtered);
  };

  const handleGenerateInviteCode = async () => {
    if (!currentWorkspace) return;
    try {
      setInviteCodeLoading(true);
      const res = await apiClient.createInvite(currentWorkspace._id);
      setInviteCode(res.invite.code);
      setInviteCodeOpen(true);
    } catch (error: any) {
      toast.error(error.message || "Failed to generate invite code");
    } finally {
      setInviteCodeLoading(false);
    }
  };

  const handleInviteSuccess = () => {
    setInviteModalOpen(false);
    toast.success("Invitation sent successfully");
    loadMembers();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  {/* Search and View Toggle */ }
  return (
    <div className="p-6 lg:p-10 h-full flex flex-col max-w-[1600px] mx-auto w-full">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-8 animate-fade-in">
        <div className="relative max-w-md w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search team members..."
            className="pl-9 w-full sm:w-[300px]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* View Toggle */}
        <div className="flex items-center bg-white/5 backdrop-blur-md rounded-xl p-1 border border-white/10 shadow-sm">
          <button
            onClick={() => setViewMode('grid')}
            className={cn(
              "p-2 rounded-lg transition-all duration-300",
              viewMode === 'grid' ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
            )}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={cn(
              "p-2 rounded-lg transition-all duration-300",
              viewMode === 'table' ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
            )}
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('squads')}
            className={cn(
              "p-2 rounded-lg transition-all duration-300",
              viewMode === 'squads' ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
            )}
          >
            <Users className="w-4 h-4" />
          </button>
        </div>
      </div>

      {
        loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="glass-card rounded-[24px] p-12 text-center animate-slide-up flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-muted/30 flex items-center justify-center mb-6 animate-pulse-slow">
              <Users className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="font-bold text-xl mb-2 text-foreground">No members found</h3>
            <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
              {searchQuery ? 'Try a different search term to find what you are looking for.' : 'Your team is empty. Start by inviting some extraordinary people.'}
            </p>
            {!searchQuery && (
              <div className="flex flex-col sm:flex-row gap-3 justify-center w-full max-w-md">
                <Button variant="outline" onClick={handleGenerateInviteCode} disabled={inviteCodeLoading} className="h-12 border-primary/20 hover:bg-primary/5 hover:text-primary transition-all">
                  {inviteCodeLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Users className="w-4 h-4 mr-2" />
                      Generate Invite Code
                    </>
                  )}
                </Button>
                <Button className="h-12 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25" onClick={() => setInviteModalOpen(true)}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Invite First Member
                </Button>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Tab Content */}
            {activeTab === 'members' && (
              <>
                {/* Pending Members Section - Only show in Members tab if canManage */}
                {canManage && pendingCrew.length > 0 && currentWorkspace && (
                  <div className="mb-6">
                    <PendingMembersSection
                      workspaceId={currentWorkspace._id}
                      isOrgAdmin={isOrgAdmin}
                      onUpdate={handleInviteSuccess}
                    />
                  </div>
                )}

                {viewMode === 'grid' ? (
                  /* Team Grid */
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
                    {filteredMembers.map((member) => (
                      <div key={member._id} className="glass-card rounded-[22px] p-5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group">
                        <div className="flex items-start justify-between mb-5">
                          <div className="flex items-center gap-4 min-w-0">
                            <div className="relative shrink-0">
                              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-transparent border border-white/10 flex items-center justify-center text-primary font-bold text-lg group-hover:scale-105 transition-transform duration-300">
                                {getInitials(member.name)}
                              </div>
                              <span className={cn("absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-[3px] border-card", member.online ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" : "bg-slate-500/30")} />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-semibold flex items-center gap-2 min-w-0">
                                  <span className="truncate max-w-[180px]">
                                    {member.name}
                                  </span>
                                  {user?._id && String(member._id) === String(user._id) && (
                                    <Badge variant="outline" className="text-[10px] px-2 py-0.5 whitespace-nowrap">
                                      you
                                    </Badge>
                                  )}
                                </h3>
                                {member.role === 'omni' && (
                                  <Badge variant="omni" className="text-[10px] shrink-0">
                                    <Shield className="w-3 h-3 mr-0.5" />
                                    Omni
                                  </Badge>
                                )}
                              </div>
                              {canSeeFullInfo && member.email && (
                                <p className="text-sm text-muted-foreground truncate">{member.email}</p>
                              )}
                              {!canSeeFullInfo && member.specialization && (
                                <p className="text-sm text-muted-foreground truncate">{member.specialization}</p>
                              )}
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon-sm" className="shrink-0">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44">
                              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(member.email || '')}>
                                Copy email
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(member.name)}>
                                Copy name
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <div className="flex items-center gap-2 mb-4 flex-wrap">
                          <span className={cn("text-[10px] font-semibold px-2.5 py-1 rounded-full border", member.online ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-slate-500/10 text-slate-500 border-slate-500/20")}>
                            {member.online ? 'ONLINE' : 'OFFLINE'}
                          </span>
                          <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-muted-foreground capitalize">
                            {member.role}
                          </span>
                          {member.specialization && (
                            <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                              {member.specialization}
                            </span>
                          )}
                          {canSeeFullInfo && member.joinedAt && (
                            <span className="text-[10px] text-muted-foreground/60 ml-auto flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(member.joinedAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>

                        <div className="mt-4 pt-4 border-t border-white/5">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full hover:bg-primary/10 hover:text-primary transition-all group-hover:bg-primary group-hover:text-primary-foreground"
                            onClick={() => navigate(`/chat?userId=${member._id}`)}
                          >
                            <Mail className="w-4 h-4 mr-2" />
                            Message
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : viewMode === 'table' ? (
                  /* Team Table */
                  <div className="glass-card rounded-[24px] border border-white/10 shadow-sm overflow-hidden animate-slide-up">
                    <Table>
                      <TableHeader className="bg-white/5">
                        <TableRow className="border-white/5 hover:bg-transparent">
                          <TableHead className="text-muted-foreground font-semibold">Member</TableHead>
                          {canSeeFullInfo && <TableHead className="text-muted-foreground font-semibold">Email</TableHead>}
                          <TableHead className="text-muted-foreground font-semibold">Status</TableHead>
                          <TableHead className="text-muted-foreground font-semibold">Role</TableHead>
                          <TableHead className="text-muted-foreground font-semibold">Specialization</TableHead>
                          {canSeeFullInfo && <TableHead className="text-muted-foreground font-semibold">Joined</TableHead>}
                          <TableHead className="text-right text-muted-foreground font-semibold">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredMembers.map((member) => (
                          <TableRow key={member._id} className="border-white/5 hover:bg-white/5 transition-colors group">
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary text-xs font-bold border border-white/10 group-hover:scale-110 transition-transform">
                                  {getInitials(member.name)}
                                </div>
                                <div className="flex flex-col">
                                  <span className="flex items-center gap-2 font-semibold">
                                    {member.name}
                                    {user?._id && String(member._id) === String(user._id) && (
                                      <Badge variant="outline" className="text-[9px] h-4 px-1 bg-primary/10 text-primary border-primary/20">YOU</Badge>
                                    )}
                                  </span>
                                </div>
                              </div>
                            </TableCell>
                            {canSeeFullInfo && <TableCell className="text-muted-foreground/80 text-sm">{member.email}</TableCell>}
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <span className={cn("w-1.5 h-1.5 rounded-full shadow-[0_0_8px_currentColor]", member.online ? "bg-emerald-500 text-emerald-500" : "bg-slate-500 text-slate-500")} />
                                <span className={cn("text-xs font-medium", member.online ? "text-emerald-500" : "text-slate-500")}>
                                  {member.online ? 'Online' : 'Offline'}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {member.role === 'omni' ? (
                                <Badge variant="default" className="text-[10px] bg-indigo-500 hover:bg-indigo-600 shadow-lg shadow-indigo-500/20 border-0">
                                  <Shield className="w-3 h-3 mr-1" />
                                  Omni
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="text-[10px] capitalize bg-white/10 hover:bg-white/20 text-foreground border-0">{member.role}</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {member.specialization ? (
                                <Badge variant="outline" className="text-[10px] border-white/10 bg-white/5 text-muted-foreground">{member.specialization}</Badge>
                              ) : (
                                <span className="text-muted-foreground/40 text-xs italic">Unassigned</span>
                              )}
                            </TableCell>
                            {canSeeFullInfo && <TableCell className="text-muted-foreground text-xs">
                              {member.joinedAt ? new Date(member.joinedAt).toLocaleDateString() : '-'}
                            </TableCell>}
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  onClick={() => navigate(`/chat?userId=${member._id}`)}
                                  className="hover:bg-primary/10 hover:text-primary rounded-lg w-8 h-8"
                                >
                                  <Mail className="w-4 h-4" />
                                </Button>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon-sm" className="hover:bg-white/10 rounded-lg w-8 h-8">
                                      <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="glass-card border-white/10">
                                    <DropdownMenuItem onClick={() => navigator.clipboard.writeText(member.email || '')} className="focus:bg-white/10">
                                      Copy Email
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : viewMode === 'squads' ? (
                  /* Squads View (New Requirement) */
                  <div className="space-y-8 animate-slide-up">
                    {(() => {
                      // Filter distinct squads, ensuring 'Unassigned' is handled
                      const squads = Array.from(new Set(filteredMembers.map(m => m.specialization || 'Unassigned'))).sort();

                      if (squads.length === 0 && filteredMembers.length > 0 && !squads.includes('Unassigned')) squads.push('Unassigned');

                      return squads.map(squadName => {
                        const squadMembers = filteredMembers.filter(m => (m.specialization || 'Unassigned') === squadName);
                        const count = squadMembers.length;
                        const isUnderstaffed = count < 5;
                        const isCritical = count === 0;

                        return (
                          <div key={squadName} className="space-y-4">
                            <div className="flex items-center gap-4">
                              <h3 className="text-xl font-bold flex items-center gap-3">
                                {squadName}
                                <Badge variant={isCritical ? "destructive" : isUnderstaffed ? "secondary" : "default"} className={cn("text-[10px] uppercase", isUnderstaffed && "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20")}>
                                  {isCritical ? "Critical" : isUnderstaffed ? "Growth / Recruitment" : "Strong"}
                                </Badge>
                              </h3>
                              {isUnderstaffed && (
                                <div className="flex items-center gap-1.5 text-xs text-amber-500 font-bold uppercase tracking-wider animate-pulse">
                                  <AlertTriangle className="w-3.5 h-3.5" />
                                  Hitcount Low ({count}/5)
                                </div>
                              )}
                            </div>
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                              {squadMembers.map(member => (
                                <div key={member._id} className="glass-card rounded-[22px] p-5 border border-white/5 hover:border-primary/30 transition-all">
                                  <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-4">
                                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-white/10 to-transparent flex items-center justify-center font-bold text-lg border border-white/10">
                                        {getInitials(member.name)}
                                      </div>
                                      <div>
                                        <p className="font-bold text-sm text-foreground">{member.name}</p>
                                        <p className="text-xs text-muted-foreground capitalize">{member.role}</p>
                                      </div>
                                    </div>
                                    <span className={cn("w-2 h-2 rounded-full", member.online ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-slate-500/30")} />
                                  </div>
                                  <div className="mt-4 pt-4 border-t border-white/5 flex gap-2">
                                    <Button variant="ghost" size="sm" className="w-full text-xs h-8" onClick={() => navigate(`/chat?userId=${member._id}`)}>
                                      <Mail className="w-3.5 h-3.5 mr-2" /> Message
                                    </Button>
                                  </div>
                                </div>
                              ))}
                              {/* Action Card for Understaffed Squads */}
                              {isUnderstaffed && (
                                <div
                                  onClick={handleGenerateInviteCode}
                                  className="rounded-[22px] border border-dashed border-amber-500/30 bg-amber-500/5 p-5 flex flex-col items-center justify-center cursor-pointer hover:bg-amber-500/10 transition-all group min-h-[140px]"
                                >
                                  <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-lg shadow-amber-500/10">
                                    <UserPlus className="w-5 h-5" />
                                  </div>
                                  <p className="text-xs font-bold text-amber-500 uppercase tracking-widest">Recruit Specialist</p>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                ) : null}
              </>
            )}

            {activeTab === 'manage' && canManage && (
              <div className="space-y-6">
                <div className="bg-card rounded-2xl border border-border shadow-soft p-6">
                  <h3 className="font-semibold mb-4">Invite & Manage</h3>
                  <div className="space-y-4">
                    {pendingCrew.length > 0 && currentWorkspace && (
                      <PendingMembersSection
                        workspaceId={currentWorkspace._id}
                        isOrgAdmin={isOrgAdmin}
                        onUpdate={handleInviteSuccess}
                      />
                    )}
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={handleGenerateInviteCode} disabled={inviteCodeLoading}>
                        {inviteCodeLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Users className="w-4 h-4 mr-2" />
                            Generate Invite Code
                          </>
                        )}
                      </Button>
                      <Button variant="gradient" onClick={() => setInviteModalOpen(true)}>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Invite Member
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'insights' && canManage && (
              <div className="space-y-6">
                <div className="bg-card rounded-2xl border border-border shadow-soft p-6">
                  <h3 className="font-semibold mb-4">Team Insights</h3>
                  {stats && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Total</p>
                        <p className="text-2xl font-bold">{stats.total}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Omnis</p>
                        <p className="text-2xl font-bold">{stats.omnis}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Crew</p>
                        <p className="text-2xl font-bold">{stats.crew}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Pending</p>
                        <p className="text-2xl font-bold">{stats.pendingCrew}</p>
                      </div>
                    </div>
                  )}
                  {pendingCrew.length > 0 && (
                    <div className="mt-6">
                      <h4 className="font-medium mb-3">Pending Role Decisions</h4>
                      <p className="text-sm text-muted-foreground">
                        {pendingCrew.length} member{pendingCrew.length !== 1 ? 's' : ''} need role/specialization finalized
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )
      }

      {/* New Invite Modal */}
      {
        currentWorkspace && (
          <InviteModal
            open={inviteModalOpen}
            onOpenChange={setInviteModalOpen}
            workspaceId={currentWorkspace._id}
            isOrgAdmin={isOrgAdmin}
            onSuccess={handleInviteSuccess}
          />
        )
      }

      {/* Invite Code Dialog */}
      <Dialog open={inviteCodeOpen} onOpenChange={setInviteCodeOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Invite Code Generated</DialogTitle>
            <DialogDescription>
              Share this code with your teammate. They can join from “Join Workspace” using this code.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="p-4 rounded-xl border border-border bg-muted/40 text-center">
              <p className="text-3xl font-mono font-bold tracking-widest select-all">{inviteCode}</p>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Code does not expire until used. You can regenerate anytime.
            </p>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(inviteCode);
                toast.success("Invite code copied");
              }}
              className="w-full sm:w-auto"
            >
              Copy Code
            </Button>
            <Button
              variant="gradient"
              onClick={() => {
                const link = `${window.location.origin}/join-workspace?code=${inviteCode}`;
                navigator.clipboard.writeText(link);
                toast.success("Invite link copied");
              }}
              className="w-full sm:w-auto"
            >
              Copy Invite Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div >
  );
};

export default Team;
