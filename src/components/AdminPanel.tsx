import { useState, useEffect } from "react";
import { getSupabaseClient } from "../lib/supabase";
import { ShieldCheck, UserMinus, ShieldAlert, Sparkles, BarChart2, Eye, CheckCircle2, X } from "lucide-react";
import { UserProfile } from "../types";

export function AdminPanel() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [totalSwipes, setTotalSwipes] = useState(0);
  const [totalMatches, setTotalMatches] = useState(0);
  const [loading, setLoading] = useState(true);
  const [previewAadharUrl, setPreviewAadharUrl] = useState<string | null>(null);

  const supabaseClient = getSupabaseClient();

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // Fetch all users
      const { data: profiles, error: err1 } = await supabaseClient.from("profiles").select("*");
      if (profiles) {
        const mapped = profiles.map((p: any) => ({
          ...p,
          uid: p.id,
          displayName: p.display_name,
          photoURL: p.photo_url,
          alcoholPreferences: p.alcohol_preferences,
          smokePreferences: p.smoke_preferences,
          safetyVerified: p.safety_verified,
          musicVibes: p.music_vibes,
          preferredPlaces: p.preferred_places,
          aadharNumber: p.aadhar_number,
          aadharURL: p.aadhar_url,
          verificationStatus: p.verification_status || "unverified"
        }));
        setUsers(mapped);
      }

      // Fetch swipes count
      const { data: swipes, error: err2 } = await supabaseClient.from("swipes").select("id");
      if (swipes) setTotalSwipes(swipes.length);

      // Fetch matches count
      const { data: matches, error: err3 } = await supabaseClient.from("matches").select("id");
      if (matches) setTotalMatches(matches.length);

    } catch (error) {
      console.error("Error fetching admin metrics:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const approveVerification = async (userId: string) => {
    try {
      await supabaseClient
        .from("profiles")
        .update({ safety_verified: true, verification_status: "verified" })
        .eq("id", userId);
      fetchAdminData();
    } catch (error) {
      console.error("Error approving verification", error);
    }
  };

  const rejectVerification = async (userId: string) => {
    try {
      await supabaseClient
        .from("profiles")
        .update({ safety_verified: false, verification_status: "rejected" })
        .eq("id", userId);
      fetchAdminData();
    } catch (error) {
      console.error("Error rejecting verification", error);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!window.confirm("Are you sure you want to remove this user from the lounge?")) return;
    try {
      await supabaseClient.from("profiles").delete().eq("id", userId);
      setUsers(prev => prev.filter(u => u.uid !== userId));
      fetchAdminData();
    } catch (error) {
      console.error("Error deleting user", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-8 h-8 border-4 border-bumble-yellow border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 w-full max-w-5xl mx-auto">
      {/* Admin Panel Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-white flex items-center gap-2">
            <Sparkles className="w-7 h-7 text-bumble-yellow" />
            Lounge Admin Console
          </h2>
          <p className="text-slate-400 text-xs mt-1">Review system metrics, moderate profiles, and manage verification badges.</p>
        </div>
        <button 
          onClick={fetchAdminData}
          className="bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider cursor-pointer"
        >
          Refresh Data
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center gap-4">
          <div className="p-3 bg-bumble-yellow/10 rounded-xl">
            <BarChart2 className="w-6 h-6 text-bumble-yellow" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-black tracking-wider text-slate-500 block">Total Lounge Members</span>
            <span className="text-2xl font-black text-white">{users.length}</span>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center gap-4">
          <div className="p-3 bg-sky-500/10 rounded-xl">
            <Sparkles className="w-6 h-6 text-sky-400" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-black tracking-wider text-slate-500 block">Total Swipes Cast</span>
            <span className="text-2xl font-black text-white">{totalSwipes}</span>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 rounded-xl">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-black tracking-wider text-slate-500 block">Matches Connected</span>
            <span className="text-2xl font-black text-white">{totalMatches}</span>
          </div>
        </div>
      </div>

      {/* User Moderation Table */}
      <div className="bg-white/5 border border-white/10 rounded-[24px] overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10">
          <h3 className="font-bold text-white text-sm">Lounge Members List</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-[9px] uppercase tracking-wider text-slate-500 font-black">
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Drink Profile</th>
                <th className="px-6 py-4">Aadhar Card Verification Details</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map((user) => (
                <tr key={user.uid} className="hover:bg-white/5 text-slate-300 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-800 border border-white/10 shrink-0">
                        <img 
                          src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} 
                          alt={user.displayName} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <span className="font-bold text-white block">{user.displayName}</span>
                        <span className="text-[10px] text-slate-500 block">{user.gender}, {user.age} yrs</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs">
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {user.alcoholPreferences?.slice(0, 2).map(p => (
                        <span key={p} className="bg-bumble-yellow/10 text-bumble-yellow px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider">{p}</span>
                      )) || "None"}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-semibold">
                    {user.aadharNumber ? (
                      <div className="flex items-center gap-2">
                        <span>No: **** **** {user.aadharNumber.slice(-4)}</span>
                        {user.aadharURL && (
                          <button 
                            onClick={() => setPreviewAadharUrl(user.aadharURL || null)}
                            className="bg-white/10 hover:bg-white/20 border border-white/20 p-1.5 rounded-full text-slate-300 cursor-pointer hover:scale-105 transition-all"
                            title="Preview Aadhar Card Image"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-500 text-[10px] italic font-normal">Not Submitted</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${user.safetyVerified ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-slate-700"}`} />
                        <span className="text-[10px] font-black uppercase tracking-wider">{user.safetyVerified ? "Verified" : "Unverified"}</span>
                      </div>
                      <span className={`text-[9px] uppercase font-bold ${
                        user.verificationStatus === "verified" ? "text-emerald-400" :
                        user.verificationStatus === "pending" ? "text-amber-400 animate-pulse" :
                        user.verificationStatus === "rejected" ? "text-rose-400" :
                        "text-slate-500"
                      }`}>{user.verificationStatus}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {user.verificationStatus === "pending" && (
                        <>
                          <button
                            onClick={() => approveVerification(user.uid || (user as any).id)}
                            className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full hover:scale-105 transition-transform cursor-pointer"
                            title="Approve Aadhar"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => rejectVerification(user.uid || (user as any).id)}
                            className="p-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-full hover:scale-105 transition-transform cursor-pointer"
                            title="Reject Aadhar"
                          >
                            <ShieldAlert className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => deleteUser(user.uid || (user as any).id)}
                        className="p-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full hover:scale-105 transition-transform cursor-pointer"
                        title="Remove User"
                      >
                        <UserMinus className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Aadhar Image Preview Modal */}
      {previewAadharUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
          <div className="absolute top-6 right-6">
            <button 
              onClick={() => setPreviewAadharUrl(null)}
              className="p-3 bg-white/5 border border-white/10 rounded-full text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="bg-[#18181c] border border-white/10 p-4 rounded-3xl max-w-2xl w-full">
            <h3 className="text-sm font-black uppercase text-slate-400 tracking-wider mb-4">Submitted Aadhar Card Preview</h3>
            <div className="w-full aspect-[1.6] rounded-2xl overflow-hidden border border-white/10 bg-slate-900 flex items-center justify-center">
              <img src={previewAadharUrl} alt="Aadhar Preview" className="w-full h-full object-contain" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
