import { useState, useEffect } from "react";

const SUPABASE_URL = "https://shkezgfdvtghvavezbel.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNoa2V6Z2ZkdnRnaHZhdmV6YmVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwNDkwNzgsImV4cCI6MjA5NjYyNTA3OH0.TQIgnnXX35CvlIXE2AQj8Z_I8mVmE5jg8UM5vs0Eb5o";

const PEOPLE = [
  { name: "Lena", phone: "+1 (310) 339-6117" },
  { name: "Angela", phone: "+1 (310) 995-6204" },
  { name: "Kayla", phone: "+1 (310) 678-6271" },
  { name: "Karina", phone: "(424) 289-5993" },
  { name: "Trinity", phone: "+1 (310) 590-0582" },
  { name: "Bobby", phone: "+1 (310) 902-4203" },
  { name: "Des", phone: "+1 (951) 850-9681" },
  { name: "Noah", phone: "(310) 570-3232" },
];

const COMPLETED = ["Venue", "Taco Cart", "DJ"];
const STATUS_ORDER = ["Want to Do", "Working On It", "Finished"];

const STATUS_COLORS = {
  "Want to Do":    { bg: "#FFF3CD", border: "#F0C040", text: "#7A5C00", dot: "#F0C040" },
  "Working On It": { bg: "#D6EAFF", border: "#4A9EE0", text: "#0A4A7A", dot: "#4A9EE0" },
  "Finished":      { bg: "#D4EDDA", border: "#4CAF7D", text: "#1A5C35", dot: "#4CAF7D" },
};

async function fetchTasks() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/tasks?order=id`, {
    headers: {
      apikey: SUPABASE_ANON,
      Authorization: `Bearer ${SUPABASE_ANON}`,
    },
  });
  return res.json();
}

async function updateTask(id, fields) {
  await fetch(`${SUPABASE_URL}/rest/v1/tasks?id=eq.${id}`, {
    method: "PATCH",
    headers: {
      apikey: SUPABASE_ANON,
      Authorization: `Bearer ${SUPABASE_ANON}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(fields),
  });
}

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTask, setActiveTask] = useState(null);
  const [saving, setSaving] = useState(null);

  useEffect(() => {
    fetchTasks().then(data => {
      setTasks(data);
      setLoading(false);
    });
    const interval = setInterval(() => {
      fetchTasks().then(setTasks);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  async function cycleStatus(task) {
    const next = STATUS_ORDER[(STATUS_ORDER.indexOf(task.status) + 1) % STATUS_ORDER.length];
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: next } : t));
    setSaving(task.id);
    await updateTask(task.id, { status: next });
    setSaving(null);
  }

  async function setAssignee(task, name) {
    const next = task.assignee === name ? null : name;
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, assignee: next } : t));
    setActiveTask(null);
    setSaving(task.id);
    await updateTask(task.id, { assignee: next });
    setSaving(null);
  }

  const finished = tasks.filter(t => t.status === "Finished").length;

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
      fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
      paddingBottom: 60,
    }}>
      <div style={{
        background: "rgba(255,255,255,0.05)",
        borderBottom: "1px solid rgba(255,255,255,0.1)",
        padding: "24px 20px 20px",
        textAlign: "center",
        backdropFilter: "blur(10px)",
      }}>
        <div style={{ fontSize: 28, marginBottom: 4 }}>🌊🌴</div>
        <h1 style={{
          color: "#fff",
          fontSize: 20,
          fontWeight: 800,
          margin: "0 0 4px",
          textTransform: "uppercase",
          letterSpacing: "2px",
        }}>Venice Party Tracker</h1>
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, margin: 0 }}>
          {loading ? "Loading..." : `${finished} of ${tasks.length} tasks finished · ${COMPLETED.length} locked in ✓`}
        </p>
        <div style={{ height: 4, background: "rgba(255,255,255,0.1)", borderRadius: 2, marginTop: 14, overflow: "hidden" }}>
          <div style={{
            height: "100%",
            width: tasks.length ? `${(finished / tasks.length) * 100}%` : "0%",
            background: "linear-gradient(90deg, #4CAF7D, #4A9EE0)",
            borderRadius: 2,
            transition: "width 0.4s ease",
          }} />
        </div>
        <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 11, margin: "8px 0 0" }}>
          🔄 Live — syncs every 8 seconds
        </p>
      </div>

      <div style={{ maxWidth: 520, margin: "0 auto", padding: "0 16px" }}>
        <Section label="THE CREW">
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {PEOPLE.map(p => (
              <div key={p.name} style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "rgba(255,255,255,0.06)",
                borderRadius: 10,
                padding: "10px 14px",
                border: "1px solid rgba(255,255,255,0.08)",
              }}>
                <span style={{ color: "#fff", fontWeight: 600, fontSize: 15 }}>{p.name}</span>
                <a href={`tel:${p.phone.replace(/\D/g, "")}`} style={{
                  color: "rgba(255,255,255,0.5)",
                  fontSize: 13,
                  textDecoration: "none",
                  fontFamily: "monospace",
                }}>{p.phone}</a>
              </div>
            ))}
          </div>
        </Section>

        <Section label="LOCKED IN ✓">
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {COMPLETED.map(label => (
              <div key={label} style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: "rgba(76,175,125,0.12)",
                border: "1px solid rgba(76,175,125,0.3)",
                borderRadius: 10,
                padding: "10px 14px",
              }}>
                <span style={{ color: "#4CAF7D", fontSize: 16 }}>✓</span>
                <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 15, textDecoration: "line-through" }}>{label}</span>
              </div>
            ))}
          </div>
        </Section>

        <Section label="STILL NEED">
          {loading ? (
            <p style={{ color: "rgba(255,255,255,0.4)", textAlign: "center", padding: 20 }}>Loading tasks...</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {tasks.map(task => {
                const sc = STATUS_COLORS[task.status] || STATUS_COLORS["Want to Do"];
                const isOpen = activeTask === task.id;
                return (
                  <div key={task.id} style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 12,
                    overflow: "hidden",
                    opacity: saving === task.id ? 0.7 : 1,
                    transition: "opacity 0.2s",
                  }}>
                    <div style={{ padding: "12px 14px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                        <span style={{ color: "#fff", fontSize: 15, fontWeight: 600, flex: 1, lineHeight: 1.3 }}>
                          {task.label}
                        </span>
                        {saving === task.id && (
                          <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 11 }}>saving...</span>
                        )}
                      </div>
                      <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                        <button onClick={() => cycleStatus(task)} style={{
                          background: sc.bg,
                          border: `1px solid ${sc.border}`,
                          color: sc.text,
                          borderRadius: 20,
                          padding: "4px 12px",
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                        }}>
                          <span style={{ width: 7, height: 7, borderRadius: "50%", background: sc.dot, display: "inline-block" }} />
                          {task.status}
                        </button>
                        <button onClick={() => setActiveTask(isOpen ? null : task.id)} style={{
                          background: task.assignee ? "rgba(74,158,224,0.15)" : "rgba(255,255,255,0.08)",
                          border: `1px solid ${task.assignee ? "#4A9EE0" : "rgba(255,255,255,0.15)"}`,
                          color: task.assignee ? "#4A9EE0" : "rgba(255,255,255,0.5)",
                          borderRadius: 20,
                          padding: "4px 12px",
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: "pointer",
                        }}>
                          {task.assignee ? `👤 ${task.assignee}` : "Assign →"}
                        </button>
                      </div>
                    </div>
                    {isOpen && (
                      <div style={{
                        borderTop: "1px solid rgba(255,255,255,0.08)",
                        padding: "10px 14px",
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 7,
                      }}>
                        {PEOPLE.map(p => (
                          <button key={p.name} onClick={() => setAssignee(task, p.name)} style={{
                            background: task.assignee === p.name ? "#4A9EE0" : "rgba(255,255,255,0.08)",
                            color: task.assignee === p.name ? "#fff" : "rgba(255,255,255,0.7)",
                            border: "none",
                            borderRadius: 20,
                            padding: "5px 12px",
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: "pointer",
                          }}>
                            {p.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Section>
      </div>
    </div>
  );
}

function Section({ label, children }) {
  return (
    <div style={{ marginTop: 28 }}>
      <p style={{
        color: "rgba(255,255,255,0.35)",
        fontSize: 11,
        fontWeight: 800,
        letterSpacing: "1.5px",
        textTransform: "uppercase",
        margin: "0 0 10px",
      }}>{label}</p>
      {children}
    </div>
  );
}
