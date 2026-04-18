import { useState, useEffect, useCallback } from "react";

const API = "http://localhost:3001/api";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const urgencyColors = {
  CRITICAL: { bg: "#ff2d2d", text: "#fff", glow: "0 0 20px rgba(255,45,45,0.5)" },
  HIGH:     { bg: "#ff8c00", text: "#fff", glow: "0 0 20px rgba(255,140,0,0.4)" },
  MEDIUM:   { bg: "#f5c400", text: "#000", glow: "0 0 20px rgba(245,196,0,0.3)" },
  LOW:      { bg: "#00c875", text: "#fff", glow: "0 0 20px rgba(0,200,117,0.3)" },
};

const difficultyLabel = (d) => ["", "Easy", "Simple", "Medium", "Hard", "Expert"][d] || d;
const difficultyColor = (d) => ["", "#00c875", "#7bc67e", "#f5c400", "#ff8c00", "#ff2d2d"][d];

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ─── Components ───────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, accent }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.03)",
      border: `1px solid ${accent}33`,
      borderRadius: 16,
      padding: "20px 24px",
      display: "flex",
      flexDirection: "column",
      gap: 4,
      transition: "all 0.2s",
    }}
      onMouseEnter={e => e.currentTarget.style.border = `1px solid ${accent}88`}
      onMouseLeave={e => e.currentTarget.style.border = `1px solid ${accent}33`}
    >
      <span style={{ fontSize: 11, fontFamily: "'Space Mono', monospace", color: "#888", letterSpacing: "0.12em", textTransform: "uppercase" }}>{label}</span>
      <span style={{ fontSize: 36, fontWeight: 700, color: accent, fontFamily: "'Syne', sans-serif", lineHeight: 1 }}>{value}</span>
      {sub && <span style={{ fontSize: 12, color: "#666", fontFamily: "'Space Mono', monospace" }}>{sub}</span>}
    </div>
  );
}

function InsightBanner({ message }) {
  if (!message) return null;
  const isGood = message.startsWith("✅") || message.startsWith("🌟");
  return (
    <div style={{
      background: isGood ? "rgba(0,200,117,0.08)" : "rgba(255,140,0,0.08)",
      border: `1px solid ${isGood ? "#00c87544" : "#ff8c0044"}`,
      borderLeft: `4px solid ${isGood ? "#00c875" : "#ff8c00"}`,
      borderRadius: "0 12px 12px 0",
      padding: "12px 16px",
      fontSize: 13,
      color: "#ccc",
      fontFamily: "'Space Mono', monospace",
      lineHeight: 1.6,
      margin: "4px 0",
    }}>
      {message}
    </div>
  );
}

function UrgencyBadge({ label }) {
  const c = urgencyColors[label] || urgencyColors.LOW;
  return (
    <span style={{
      background: c.bg,
      color: c.text,
      boxShadow: c.glow,
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: "0.1em",
      padding: "3px 8px",
      borderRadius: 6,
      fontFamily: "'Space Mono', monospace",
    }}>{label}</span>
  );
}

function AssignmentCard({ a, onComplete, onMissed, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const isOverdue = a.daysLeft < 0;
  const isDueToday = a.daysLeft === 0;

  return (
    <div style={{
      background: "rgba(255,255,255,0.02)",
      border: isOverdue ? "1px solid #ff2d2d44" : "1px solid rgba(255,255,255,0.07)",
      borderRadius: 14,
      padding: "16px 20px",
      display: "flex",
      flexDirection: "column",
      gap: 10,
      transition: "all 0.2s",
      opacity: a.completed ? 0.5 : 1,
    }}
      onMouseEnter={e => !a.completed && (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
      onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
          <UrgencyBadge label={a.urgencyLabel} />
          <span style={{
            fontSize: 15,
            fontWeight: 600,
            color: a.completed ? "#555" : "#eee",
            fontFamily: "'Syne', sans-serif",
            textDecoration: a.completed ? "line-through" : "none",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}>{a.title}</span>
        </div>
        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
          <button onClick={() => setExpanded(!expanded)} style={btnStyle("#ffffff11", "#ffffff22")}>
            {expanded ? "▲" : "▼"}
          </button>
          {!a.completed && (
            <>
              <button onClick={() => onComplete(a.id)} style={btnStyle("#00c87511", "#00c87533")} title="Mark complete">✓</button>
              <button onClick={() => onMissed(a.id)} style={btnStyle("#ff8c0011", "#ff8c0033")} title="Mark missed">✗</button>
            </>
          )}
          <button onClick={() => onDelete(a.id)} style={btnStyle("#ff2d2d11", "#ff2d2d33")} title="Delete">🗑</button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <Chip label="Due" value={formatDate(a.deadline)} color={isOverdue ? "#ff2d2d" : isDueToday ? "#ff8c00" : "#888"} />
        <Chip label="Days left" value={isOverdue ? `${Math.abs(a.daysLeft)}d OVERDUE` : isDueToday ? "TODAY" : `${a.daysLeft}d`} color={isOverdue ? "#ff2d2d" : isDueToday ? "#ff8c00" : "#aaa"} />
        <Chip label="Difficulty" value={difficultyLabel(a.difficulty)} color={difficultyColor(a.difficulty)} />
        <Chip label="Est. hours" value={`${a.estimatedHours}h`} color="#7c9cbf" />
        <Chip label="Urgency" value={a.urgencyScore} color="#bc8fff" />
      </div>

      {expanded && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingTop: 8, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <Chip label="Start by" value={formatDate(a.optimalStartDate)} color="#00c875" />
            <Chip label="Start days before" value={`${a.startDaysBefore}d`} color="#00c875" />
            <Chip label="Procrastination score" value={a.procrastinationScore} color={a.procrastinationScore > 5 ? "#ff8c00" : "#aaa"} />
          </div>
          <InsightBanner message={a.insight} />
        </div>
      )}
    </div>
  );
}

function Chip({ label, value, color }) {
  return (
    <span style={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <span style={{ fontSize: 9, color: "#555", fontFamily: "'Space Mono', monospace", textTransform: "uppercase", letterSpacing: "0.1em" }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: color || "#aaa", fontFamily: "'Space Mono', monospace" }}>{value}</span>
    </span>
  );
}

function btnStyle(bg, hover) {
  return {
    background: bg,
    border: "1px solid rgba(255,255,255,0.08)",
    color: "#aaa",
    borderRadius: 8,
    padding: "4px 8px",
    cursor: "pointer",
    fontSize: 13,
    transition: "all 0.15s",
    fontFamily: "inherit",
  };
}

function AddForm({ onAdd, loading }) {
  const [form, setForm] = useState({ title: "", deadline: "", difficulty: "3", estimatedHours: "" });
  const [error, setError] = useState("");

  const today = new Date().toISOString().split("T")[0];

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.deadline || !form.estimatedHours) {
      setError("All fields are required.");
      return;
    }
    if (form.deadline < today) {
      setError("Deadline must be in the future.");
      return;
    }
    setError("");
    await onAdd(form);
    setForm({ title: "", deadline: "", difficulty: "3", estimatedHours: "" });
  };

  const inputStyle = {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 10,
    padding: "10px 14px",
    color: "#eee",
    fontSize: 14,
    fontFamily: "'Space Mono', monospace",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
    transition: "border 0.15s",
  };

  return (
    <div style={{
      background: "rgba(255,255,255,0.02)",
      border: "1px solid rgba(255,255,255,0.09)",
      borderRadius: 16,
      padding: "20px 24px",
      display: "flex",
      flexDirection: "column",
      gap: 14,
    }}>
      <h3 style={{ margin: 0, color: "#eee", fontFamily: "'Syne', sans-serif", fontSize: 16 }}>+ New Assignment</h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <input
          style={{ ...inputStyle, gridColumn: "1 / -1" }}
          placeholder="Assignment title…"
          value={form.title}
          onChange={e => setForm({ ...form, title: e.target.value })}
          onKeyDown={e => e.key === "Enter" && handleSubmit()}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <label style={{ fontSize: 10, color: "#555", fontFamily: "'Space Mono', monospace", textTransform: "uppercase", letterSpacing: "0.1em" }}>Deadline</label>
          <input type="date" style={inputStyle} min={today} value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <label style={{ fontSize: 10, color: "#555", fontFamily: "'Space Mono', monospace", textTransform: "uppercase", letterSpacing: "0.1em" }}>Est. Hours</label>
          <input type="number" style={inputStyle} placeholder="e.g. 8" min="0.5" step="0.5" value={form.estimatedHours} onChange={e => setForm({ ...form, estimatedHours: e.target.value })} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4, gridColumn: "1 / -1" }}>
          <label style={{ fontSize: 10, color: "#555", fontFamily: "'Space Mono', monospace", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            Difficulty: <span style={{ color: difficultyColor(parseInt(form.difficulty)) }}>{difficultyLabel(parseInt(form.difficulty))}</span>
          </label>
          <input
            type="range" min="1" max="5" value={form.difficulty}
            onChange={e => setForm({ ...form, difficulty: e.target.value })}
            style={{ accentColor: difficultyColor(parseInt(form.difficulty)), cursor: "pointer" }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#444", fontFamily: "'Space Mono', monospace" }}>
            <span>Easy</span><span>Simple</span><span>Medium</span><span>Hard</span><span>Expert</span>
          </div>
        </div>
      </div>
      {error && <span style={{ fontSize: 12, color: "#ff6b6b", fontFamily: "'Space Mono', monospace" }}>{error}</span>}
      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{
          background: "linear-gradient(135deg, #7c9cbf, #bc8fff)",
          border: "none",
          borderRadius: 10,
          padding: "11px 20px",
          color: "#fff",
          fontSize: 14,
          fontWeight: 700,
          fontFamily: "'Syne', sans-serif",
          cursor: loading ? "not-allowed" : "pointer",
          opacity: loading ? 0.7 : 1,
          letterSpacing: "0.04em",
          transition: "opacity 0.15s",
        }}
      >
        {loading ? "Adding…" : "Add Assignment →"}
      </button>
    </div>
  );
}

function DailyPlan({ plan }) {
  if (!plan) return null;
  return (
    <div style={{
      background: "rgba(0,200,117,0.04)",
      border: "1px solid rgba(0,200,117,0.15)",
      borderRadius: 16,
      padding: "20px 24px",
      display: "flex",
      flexDirection: "column",
      gap: 12,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ margin: 0, color: "#00c875", fontFamily: "'Syne', sans-serif", fontSize: 16 }}>📅 Today's Plan</h3>
        <span style={{ fontSize: 11, color: "#555", fontFamily: "'Space Mono', monospace" }}>{plan.date}</span>
      </div>
      <InsightBanner message={plan.behaviorInsight} />
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <Chip label="Tasks today" value={plan.tasks.length} color="#00c875" />
        <Chip label="Hours needed" value={`~${plan.totalHoursNeeded}h`} color="#7c9cbf" />
        <Chip label="Missed deadlines" value={plan.missedDeadlines} color={plan.missedDeadlines > 0 ? "#ff8c00" : "#555"} />
        <Chip label="Procrastination score" value={plan.procrastinationScore} color={plan.procrastinationScore > 5 ? "#ff2d2d" : plan.procrastinationScore > 3 ? "#ff8c00" : "#00c875"} />
      </div>
      {plan.tasks.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontSize: 10, color: "#555", fontFamily: "'Space Mono', monospace", textTransform: "uppercase", letterSpacing: "0.1em" }}>Priority Order</span>
          {plan.tasks.map((t, i) => (
            <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: "rgba(255,255,255,0.02)", borderRadius: 8 }}>
              <span style={{ fontSize: 11, color: "#444", fontFamily: "'Space Mono', monospace", width: 20 }}>#{i + 1}</span>
              <UrgencyBadge label={t.urgencyLabel} />
              <span style={{ fontSize: 13, color: "#ccc", fontFamily: "'Syne', sans-serif", flex: 1 }}>{t.title}</span>
              <span style={{ fontSize: 11, color: "#555", fontFamily: "'Space Mono', monospace" }}>{t.daysLeft <= 0 ? "OVERDUE" : `${t.daysLeft}d`}</span>
            </div>
          ))}
        </div>
      )}
      {plan.tasks.length === 0 && (
        <div style={{ textAlign: "center", padding: "20px", color: "#555", fontFamily: "'Space Mono', monospace", fontSize: 13 }}>
          🎉 No urgent tasks for today. Stay ahead of upcoming deadlines!
        </div>
      )}
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [assignments, setAssignments] = useState([]);
  const [stats, setStats] = useState(null);
  const [dailyPlan, setDailyPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [tab, setTab] = useState("assignments");
  const [filter, setFilter] = useState("all");
  const [toast, setToast] = useState("");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [a, s, d] = await Promise.all([
        fetch(`${API}/assignments`).then(r => r.json()),
        fetch(`${API}/stats`).then(r => r.json()),
        fetch(`${API}/daily-plan`).then(r => r.json()),
      ]);
      
      setAssignments(a);
      setStats(s);
      setDailyPlan(d);
    } catch (e) {
      showToast("❌ Cannot connect to backend. Is it running on port 3001?");
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleAdd = async (form) => {
    setAdding(true);
    try {
      const res = await fetch(`${API}/assignments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          deadline: form.deadline,
          difficulty: form.difficulty,
          estimatedHours: form.estimatedHours,
        }),
      });
      if (!res.ok) throw new Error();
      showToast("✅ Assignment added!");
      await fetchAll();
    } catch {
      showToast("❌ Failed to add assignment.");
    }
    setAdding(false);
  };

  const handleComplete = async (id) => {
    await fetch(`${API}/assignments/${id}/complete`, { method: "PATCH" });
    showToast("✅ Marked complete! Behavior updated.");
    await fetchAll();
  };

  const handleMissed = async (id) => {
    if (!window.confirm("Mark this deadline as missed? This will increase your procrastination score.")) return;
    await fetch(`${API}/assignments/${id}/missed`, { method: "PATCH" });
    showToast("⚠️ Deadline marked as missed. Score adjusted.");
    await fetchAll();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this assignment?")) return;
    await fetch(`${API}/assignments/${id}`, { method: "DELETE" });
    showToast("🗑 Assignment deleted.");
    await fetchAll();
  };

  const filtered = assignments.filter(a => {
    if (filter === "active") return !a.completed && !a.missed;
    if (filter === "completed") return a.completed;
    if (filter === "missed") return a.missed;
    if (filter === "overdue") return !a.completed && a.daysLeft < 0;
    return true;
  });

  const tabStyle = (active) => ({
    padding: "8px 18px",
    borderRadius: 8,
    border: "none",
    background: active ? "rgba(255,255,255,0.09)" : "transparent",
    color: active ? "#eee" : "#555",
    cursor: "pointer",
    fontSize: 13,
    fontFamily: "'Syne', sans-serif",
    fontWeight: active ? 700 : 400,
    transition: "all 0.15s",
  });

  const filterStyle = (active) => ({
    padding: "4px 12px",
    borderRadius: 6,
    border: `1px solid ${active ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.06)"}`,
    background: active ? "rgba(255,255,255,0.07)" : "transparent",
    color: active ? "#ddd" : "#555",
    cursor: "pointer",
    fontSize: 11,
    fontFamily: "'Space Mono', monospace",
    letterSpacing: "0.06em",
    transition: "all 0.15s",
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Space+Mono:wght@400;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0c0c0e; color: #eee; min-height: 100vh; }
        input[type=date]::-webkit-calendar-picker-indicator { filter: invert(0.6); cursor: pointer; }
        input:focus { border-color: rgba(124,156,191,0.5) !important; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
      `}</style>

      {/* Background grid */}
      <div style={{ position: "fixed", inset: 0, backgroundImage: "radial-gradient(circle at 20% 20%, rgba(124,156,191,0.05) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(188,143,255,0.04) 0%, transparent 50%)", pointerEvents: "none" }} />

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", top: 20, right: 20, background: "#1a1a1e", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "10px 18px", fontSize: 13, color: "#ddd", fontFamily: "'Space Mono', monospace", zIndex: 9999, boxShadow: "0 8px 32px rgba(0,0,0,0.6)", maxWidth: 360 }}>
          {toast}
        </div>
      )}

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "24px 20px", display: "flex", flexDirection: "column", gap: 24 }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 26, background: "linear-gradient(135deg, #7c9cbf, #bc8fff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: "-0.02em" }}>
              Smart Planner
            </h1>
            <p style={{ fontSize: 12, color: "#444", fontFamily: "'Space Mono', monospace", marginTop: 2 }}>AI-powered assignment behavior analysis</p>
          </div>
          <button onClick={fetchAll} disabled={loading} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 10, padding: "8px 14px", color: "#666", cursor: "pointer", fontSize: 13, fontFamily: "'Space Mono', monospace", transition: "all 0.15s" }}>
            {loading ? "…" : "↻ Refresh"}
          </button>
        </div>

        {/* Stats */}
        {stats && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
            <StatCard label="Total" value={stats.total} sub="assignments" accent="#7c9cbf" />
            <StatCard label="Active" value={stats.active} sub="in progress" accent="#bc8fff" />
            <StatCard label="Completed" value={stats.completed} sub="done" accent="#00c875" />
            <StatCard label="Missed" value={stats.missed} sub="deadlines" accent="#ff8c00" />
            <StatCard label="Procrastination" value={stats.procrastinationScore} sub={stats.procrastinationScore > 5 ? "⚠ high" : "✓ ok"} accent={stats.procrastinationScore > 5 ? "#ff2d2d" : "#00c875"} />
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: 4 }}>
          {["assignments", "today", "add"].map(t => (
            <button key={t} onClick={() => setTab(t)} style={tabStyle(tab === t)}>
              {t === "assignments" ? "📋 All Assignments" : t === "today" ? "📅 Today's Plan" : "➕ Add New"}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === "add" && <AddForm onAdd={handleAdd} loading={adding} />}

        {tab === "today" && <DailyPlan plan={dailyPlan} />}

        {tab === "assignments" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Filters */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {["all", "active", "completed", "missed", "overdue"].map(f => (
                <button key={f} onClick={() => setFilter(f)} style={filterStyle(filter === f)}>
                  {f.toUpperCase()} {f === "all" ? `(${assignments.length})` : `(${assignments.filter(a => {
                    if (f === "active") return !a.completed && !a.missed;
                    if (f === "completed") return a.completed;
                    if (f === "missed") return a.missed;
                    if (f === "overdue") return !a.completed && a.daysLeft < 0;
                    return true;
                  }).length})`}
                </button>
              ))}
            </div>

            {loading && <div style={{ textAlign: "center", color: "#444", fontFamily: "'Space Mono', monospace", fontSize: 13, padding: 40 }}>Loading…</div>}
            {!loading && filtered.length === 0 && (
              <div style={{ textAlign: "center", color: "#333", fontFamily: "'Space Mono', monospace", fontSize: 13, padding: 60, border: "1px dashed rgba(255,255,255,0.06)", borderRadius: 16 }}>
                No assignments in this filter.<br /><span style={{ color: "#555" }}>Click ➕ Add New to get started.</span>
              </div>
            )}
            {filtered.map(a => (
              <AssignmentCard key={a.id} a={a} onComplete={handleComplete} onMissed={handleMissed} onDelete={handleDelete} />
            ))}
          </div>
        )}

        <div style={{ textAlign: "center", paddingTop: 8 }}>
          <span style={{ fontSize: 10, color: "#2a2a2e", fontFamily: "'Space Mono', monospace" }}>SMART PLANNER v1.0 · AI BEHAVIOR ANALYSIS · LOCAL DATA</span>
        </div>
      </div>
    </>
  );
}
