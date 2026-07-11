import React, { useState } from "react";
import { 
  ClipboardList, 
  Plus, 
  Calendar, 
  Clock, 
  User, 
  UserCheck, 
  CheckCircle, 
  AlertTriangle, 
  Flame,
  Activity
} from "lucide-react";

export const DutyClinics: React.FC = () => {
  const [shifts, setShifts] = useState([
    { id: "1", date: "2026-07-05", type: "Cornea OPD", time: "09:00 AM - 04:00 PM", status: "Active", leadConsultant: "Dr. Nair" },
    { id: "2", date: "2026-07-06", type: "OT Cataract Day", time: "08:00 AM - 05:00 PM", status: "Scheduled", leadConsultant: "Dr. Nair" },
    { id: "3", date: "2026-07-07", type: "On-Call Emergency", time: "24-Hours Duty", status: "Scheduled", leadConsultant: "Dr. Mehta" },
    { id: "4", date: "2026-07-03", type: "Glaucoma OPD Specialty", time: "09:00 AM - 04:00 PM", status: "Completed", leadConsultant: "Dr. Sharma" },
  ]);

  const [leaves, setLeaves] = useState([
    { startDate: "2026-08-10", endDate: "2026-08-14", days: 5, type: "Conference Leave", reason: "YOSICON 2026 abstract presentation", status: "Approved" },
    { startDate: "2026-06-20", endDate: "2026-06-21", days: 2, type: "Casual Leave", reason: "Family wellness checkup", status: "Completed" }
  ]);

  const [isAddingShift, setIsAddingShift] = useState(false);
  const [shiftDate, setShiftDate] = useState(new Date().toISOString().split("T")[0]);
  const [shiftType, setShiftType] = useState("Cornea OPD");
  const [shiftTime, setShiftTime] = useState("09:00 AM - 04:00 PM");
  const [shiftConsultant, setShiftConsultant] = useState("Dr. Nair");

  const [isAddingLeave, setIsAddingLeave] = useState(false);
  const [leaveStart, setLeaveStart] = useState("");
  const [leaveEnd, setLeaveEnd] = useState("");
  const [leaveType, setLeaveType] = useState("Conference Leave");
  const [leaveReason, setLeaveReason] = useState("");

  const handleAddShift = (e: React.FormEvent) => {
    e.preventDefault();
    const newShift = {
      id: "shift_" + Date.now(),
      date: shiftDate,
      type: shiftType,
      time: shiftTime,
      status: "Scheduled",
      leadConsultant: shiftConsultant
    };
    setShifts([newShift, ...shifts]);
    setIsAddingShift(false);
  };

  const handleAddLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveStart || !leaveEnd) return;

    const start = new Date(leaveStart);
    const end = new Date(leaveEnd);
    const daysDiff = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) + 1);

    const newLeave = {
      startDate: leaveStart,
      endDate: leaveEnd,
      days: daysDiff,
      type: leaveType,
      reason: leaveReason.trim() || "Regular clinical leave",
      status: "Pending Approval"
    };

    setLeaves([newLeave, ...leaves]);
    setIsAddingLeave(false);
    setLeaveReason("");
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-900 dark:text-white font-sans" id="duty_clinics_panel">
      {/* Page Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-emerald-500 dark:text-emerald-400" /> Duty Roster & Clinic Scheduler
        </h1>
        <p className="text-xs text-slate-500 dark:text-white/50 mt-1">Manage residency assignments, on-call schedules, and medical academic leaves</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Roster & Scheduled Shifts (Left 7/12) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/40 pb-2.5">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">Active Clinical Assignments</h2>
                <p className="text-[10px] text-slate-400 dark:text-white/40">Daily stations and consult rotations</p>
              </div>
              <button
                onClick={() => setIsAddingShift(!isAddingShift)}
                className="px-3 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-xl text-xs font-bold text-emerald-600 dark:text-emerald-300 transition"
              >
                {isAddingShift ? "Cancel" : "Add Roster Shift"}
              </button>
            </div>

            {isAddingShift ? (
              <form onSubmit={handleAddShift} className="space-y-3 bg-slate-50 dark:bg-zinc-950/40 p-4 rounded-xl border border-slate-200 dark:border-white/5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-400 dark:text-white/40 uppercase">Shift Date</label>
                    <input
                      type="date"
                      value={shiftDate}
                      onChange={(e) => setShiftDate(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-950 border border-slate-200 dark:border-white/10 rounded-lg text-xs py-1.5 px-3 focus:outline-none focus:border-emerald-500 text-slate-900 dark:text-white"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-400 dark:text-white/40 uppercase">Clinical Station</label>
                    <select
                      value={shiftType}
                      onChange={(e) => setShiftType(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-950 border border-slate-200 dark:border-white/10 rounded-lg text-xs py-1.5 px-3 focus:outline-none focus:border-emerald-500 text-slate-900 dark:text-white"
                    >
                      <option value="Cornea OPD">Cornea OPD (Anterior segment)</option>
                      <option value="OT Cataract Day">OT Cataract Day (Surgical)</option>
                      <option value="On-Call Emergency">On-Call Emergency (Trauma)</option>
                      <option value="Glaucoma OPD Specialty">Glaucoma OPD Specialty</option>
                      <option value="Retina OPD Clinic">Retina OPD Clinic</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-400 dark:text-white/40 uppercase">Timing Roster</label>
                    <input
                      type="text"
                      value={shiftTime}
                      onChange={(e) => setShiftTime(e.target.value)}
                      placeholder="e.g. 09:00 AM - 04:00 PM"
                      className="w-full bg-white dark:bg-zinc-950 border border-slate-200 dark:border-white/10 rounded-lg text-xs py-1.5 px-3 focus:outline-none focus:border-emerald-500 text-slate-900 dark:text-white"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-400 dark:text-white/40 uppercase">Lead Consultant</label>
                    <input
                      type="text"
                      value={shiftConsultant}
                      onChange={(e) => setShiftConsultant(e.target.value)}
                      placeholder="e.g. Dr. Nair"
                      className="w-full bg-white dark:bg-zinc-950 border border-slate-200 dark:border-white/10 rounded-lg text-xs py-1.5 px-3 focus:outline-none focus:border-emerald-500 text-slate-900 dark:text-white"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white dark:text-zinc-950 font-bold px-4 py-1.5 rounded-lg text-xs transition cursor-pointer font-sans"
                >
                  Schedule Shift
                </button>
              </form>
            ) : (
              <div className="space-y-3">
                {shifts.map((s) => (
                  <div key={s.id} className="bg-slate-50/40 dark:bg-white/[0.01] border border-slate-150 dark:border-white/5 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-slate-250 dark:hover:border-white/10 transition">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-slate-100 dark:bg-zinc-950 border border-slate-200 dark:border-white/5 flex items-center justify-center text-xs text-slate-500 dark:text-white/40">
                        🗓️
                      </div>
                      <div>
                        <span className="block text-xs font-bold text-slate-800 dark:text-white leading-none">{s.type}</span>
                        <span className="block text-[10px] text-slate-400 dark:text-white/40 font-mono mt-1.5 flex items-center gap-1.5">
                          <Clock className="h-3 w-3" /> {s.time}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center font-mono">
                      <div className="text-right">
                        <span className="block text-[10px] text-slate-550 dark:text-white/50">Lead: {s.leadConsultant}</span>
                        <span className="block text-[9px] text-slate-400 dark:text-white/30">{s.date}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded font-bold text-[9px] uppercase tracking-wide border ${
                        s.status === "Active" 
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" 
                          : s.status === "Completed"
                            ? "bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-white/60 border-transparent"
                            : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                      }`}>
                        {s.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Leave Requests & Planner (Right 5/12) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/40 pb-2.5">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">Academic & Casual Leaves</h2>
                <p className="text-[10px] text-slate-400 dark:text-white/40">Monitor quotas and request status</p>
              </div>
              <button
                onClick={() => setIsAddingLeave(!isAddingLeave)}
                className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-xl text-xs font-bold text-emerald-600 dark:text-emerald-300 transition"
              >
                {isAddingLeave ? "View Leaves" : "Request Leave"}
              </button>
            </div>

            {isAddingLeave ? (
              <form onSubmit={handleAddLeave} className="space-y-3 bg-slate-50 dark:bg-zinc-950/40 p-4 rounded-xl border border-slate-200 dark:border-white/5">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-400 dark:text-white/40 uppercase">Start Date</label>
                    <input
                      type="date"
                      value={leaveStart}
                      onChange={(e) => setLeaveStart(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-950 border border-slate-200 dark:border-white/10 rounded-lg text-xs py-1.5 px-3 focus:outline-none focus:border-emerald-500 text-slate-900 dark:text-white"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-400 dark:text-white/40 uppercase">End Date</label>
                    <input
                      type="date"
                      value={leaveEnd}
                      onChange={(e) => setLeaveEnd(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-950 border border-slate-200 dark:border-white/10 rounded-lg text-xs py-1.5 px-3 focus:outline-none focus:border-emerald-500 text-slate-900 dark:text-white"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 dark:text-white/40 uppercase">Leave Category</label>
                  <select
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value)}
                    className="w-full bg-white dark:bg-zinc-950 border border-slate-200 dark:border-white/10 rounded-lg text-xs py-1.5 px-3 focus:outline-none focus:border-emerald-500 text-slate-900 dark:text-white"
                  >
                    <option value="Conference Leave">Conference Leave (Academic)</option>
                    <option value="Casual Leave">Casual Leave</option>
                    <option value="Sick Leave">Medical / Sick Leave</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 dark:text-white/40 uppercase">Reason / Description</label>
                  <input
                    type="text"
                    value={leaveReason}
                    onChange={(e) => setLeaveReason(e.target.value)}
                    placeholder="e.g. Attending ophthalmic conference"
                    className="w-full bg-white dark:bg-zinc-950 border border-slate-200 dark:border-white/10 rounded-lg text-xs py-1.5 px-3 focus:outline-none focus:border-emerald-500 text-slate-900 dark:text-white"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-400 text-white dark:text-zinc-950 font-bold py-1.5 rounded-lg text-xs transition cursor-pointer font-sans"
                >
                  Submit Request
                </button>
              </form>
            ) : (
              <div className="space-y-3.5">
                {leaves.map((l, i) => (
                  <div key={i} className="bg-slate-50/40 dark:bg-white/[0.01] border border-slate-150 dark:border-white/5 rounded-xl p-3.5 space-y-2 hover:border-slate-250 dark:hover:border-white/10 transition">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="block text-xs font-bold text-slate-900 dark:text-white">{l.type}</span>
                        <span className="block text-[9px] text-slate-400 dark:text-white/40 font-mono mt-1">Reason: {l.reason}</span>
                      </div>
                      <span className={`px-1.5 py-0.5 rounded font-bold text-[8px] font-mono uppercase border ${
                        l.status === "Approved" || l.status === "Completed"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                      }`}>
                        {l.status}
                      </span>
                    </div>
                    <div className="border-t border-slate-150 dark:border-white/5 pt-2 flex items-center justify-between text-[10px] text-slate-400 dark:text-white/40 font-mono">
                      <span>Duration: <strong className="text-slate-700 dark:text-white/70">{l.days} days</strong></span>
                      <span>{l.startDate} to {l.endDate}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
