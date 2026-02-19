"use client";

import { useState, useEffect } from "react";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.NEON_DATABASE_URL!);

interface Task {
  id: number;
  title: string;
  description: string | null;
  status: string;
  assignee: string;
  priority: string | null;
  created_at: string;
  updated_at: string;
}

interface Content {
  id: number;
  title: string;
  stage: string;
  script: string | null;
  thumbnail_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface CalendarEvent {
  id: number;
  title: string;
  description: string | null;
  scheduled_at: string;
  type: string;
  completed: boolean;
  created_at: string;
}

interface Memory {
  id: number;
  title: string;
  content: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

interface TeamMember {
  id: number;
  name: string;
  role: string;
  status: string;
  avatar: string | null;
  description: string | null;
}

const contentStages = ["idea", "scripting", "thumbnail", "filming", "editing", "published"];

const styles: Record<string, React.CSSProperties> = {
  container: { padding: "24px", minHeight: "100vh" },
  header: { marginBottom: "32px" },
  title: { fontSize: "2.5rem", fontWeight: "bold", color: "#fff", marginBottom: "8px" },
  subtitle: { color: "#9ca3af", fontSize: "1rem" },
  tabsContainer: { display: "flex", gap: "8px", marginBottom: "24px", overflowX: "auto", paddingBottom: "8px" },
  tab: { padding: "8px 16px", borderRadius: "8px", fontWeight: "500", cursor: "pointer", border: "none", transition: "all 0.2s" },
  card: { backgroundColor: "#1e293b", borderRadius: "12px", padding: "24px" },
  cardTitle: { fontSize: "1.5rem", fontWeight: "bold", color: "#fff", marginBottom: "16px" },
  input: { flex: 1, backgroundColor: "#1f2937", color: "#fff", padding: "8px 16px", borderRadius: "8px", border: "1px solid #374151" },
  button: { padding: "8px 24px", borderRadius: "8px", cursor: "pointer", border: "none", fontWeight: "500" },
};

export default function MissionControl() {
  const [activeTab, setActiveTab] = useState("tasks");
  const [searchQuery, setSearchQuery] = useState("");
  const [newTask, setNewTask] = useState("");
  const [newContent, setNewContent] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [content, setContent] = useState<Content[]>([]);
  const [calendar, setCalendar] = useState<CalendarEvent[]>([]);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  const tabs = [
    { id: "tasks", label: "📋 Tasks", color: "#3b82f6" },
    { id: "content", label: "🎬 Content", color: "#8b5cf6" },
    { id: "calendar", label: "📅 Calendar", color: "#10b981" },
    { id: "memories", label: "🧠 Memory", color: "#f59e0b" },
    { id: "team", label: "👥 Team", color: "#ec4899" },
    { id: "office", label: "🏢 Office", color: "#f97316" },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const NEON_DATABASE_URL = "postgresql://neondb_owner:npg_GS20nVEkYwjH@ep-gentle-fog-aitx6ob9-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
      const db = neon(NEON_DATABASE_URL);
      
      const [tasksData, contentData, calendarData, memoriesData, teamData] = await Promise.all([
        db("SELECT * FROM tasks ORDER BY created_at DESC"),
        db("SELECT * FROM content ORDER BY created_at DESC"),
        db("SELECT * FROM calendar ORDER BY scheduled_at ASC"),
        db("SELECT * FROM memories ORDER BY created_at DESC"),
        db("SELECT * FROM team")
      ]);
      
      setTasks(tasksData);
      setContent(contentData);
      setCalendar(calendarData);
      setMemories(memoriesData);
      setTeam(teamData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }

  const addTask = async () => {
    if (!newTask.trim()) return;
    try {
      const NEON_DATABASE_URL = "postgresql://neondb_owner:npg_GS20nVEkYwjH@ep-gentle-fog-aitx6ob9-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
      const db = neon(NEON_DATABASE_URL);
      await db("INSERT INTO tasks (title, status, assignee) VALUES ($1, 'todo', 'jamil')", [newTask]);
      setNewTask("");
      fetchData();
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  const addContent = async () => {
    if (!newContent.trim()) return;
    try {
      const NEON_DATABASE_URL = "postgresql://neondb_owner:npg_GS20nVEkYwjH@ep-gentle-fog-aitx6ob9-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
      const db = neon(NEON_DATABASE_URL);
      await db("INSERT INTO content (title, stage) VALUES ($1, 'idea')", [newContent]);
      setNewContent("");
      fetchData();
    } catch (error) {
      console.error("Error adding content:", error);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      todo: "#6b7280",
      in_progress: "#3b82f6",
      done: "#10b981",
    };
    return colors[status] || "#6b7280";
  };

  const getPriorityColor = (priority: string | null) => {
    const colors: Record<string, string> = {
      high: "#f87171",
      medium: "#fbbf24",
      low: "#34d399",
    };
    return colors[priority || ""] || "#9ca3af";
  };

  const getTeamStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      working: "#10b981",
      idle: "#fbbf24",
      active: "#3b82f6",
    };
    return colors[status] || "#6b7280";
  };

  if (loading) {
    return (
      <div style={{ ...styles.container, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "2rem", marginBottom: "16px" }}>⏳</div>
          <p style={{ color: "#9ca3af" }}>Loading Mission Control...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>🎯 Mission Control</h1>
        <p style={styles.subtitle}>Track everything Oto is working on • Connected to Neon DB</p>
      </header>

      <div style={styles.tabsContainer}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              ...styles.tab,
              backgroundColor: activeTab === tab.id ? tab.color : "#374151",
              color: activeTab === tab.id ? "#fff" : "#9ca3af",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "tasks" && (
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>📋 Tasks Board</h2>
          <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Add new task..."
              style={styles.input}
              onKeyDown={(e) => e.key === "Enter" && addTask()}
            />
            <button
              onClick={addTask}
              style={{ ...styles.button, backgroundColor: "#3b82f6", color: "#fff" }}
            >
              Add
            </button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "16px" }}>
            {(["todo", "in_progress", "done"] as const).map((status) => (
              <div key={status} style={{ backgroundColor: "#111827", borderRadius: "8px", padding: "16px" }}>
                <h3 style={{ fontWeight: "bold", color: "#fff", marginBottom: "12px", textTransform: "capitalize" }}>
                  {status.replace("_", " ")} ({tasks.filter((t) => t.status === status).length})
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {tasks.filter((t) => t.status === status).map((task) => (
                    <div
                      key={task.id}
                      style={{
                        backgroundColor: "#1f2937",
                        borderRadius: "8px",
                        padding: "12px",
                        cursor: "pointer",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#fff", fontWeight: "500" }}>{task.title}</span>
                        <span style={{ fontSize: "12px", color: getPriorityColor(task.priority) }}>
                          {task.priority || ""}
                        </span>
                      </div>
                      <div style={{ marginTop: "8px", fontSize: "12px", color: "#9ca3af" }}>
                        {task.assignee === "jamil" ? "👤 Jamil" : "🤖 Oto"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "content" && (
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>🎬 Content Pipeline</h2>
          <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
            <input
              type="text"
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="Add new content idea..."
              style={styles.input}
              onKeyDown={(e) => e.key === "Enter" && addContent()}
            />
            <button
              onClick={addContent}
              style={{ ...styles.button, backgroundColor: "#8b5cf6", color: "#fff" }}
            >
              Add
            </button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "8px" }}>
            {contentStages.map((stage) => (
              <div key={stage} style={{ backgroundColor: "#111827", borderRadius: "8px", padding: "12px", minHeight: "200px" }}>
                <h3 style={{ fontWeight: "bold", color: "#fff", fontSize: "14px", marginBottom: "12px", textTransform: "capitalize" }}>
                  {stage} ({content.filter((c) => c.stage === stage).length})
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {content.filter((c) => c.stage === stage).map((item) => (
                    <div
                      key={item.id}
                      style={{
                        backgroundColor: "#1f2937",
                        borderRadius: "8px",
                        padding: "8px",
                        cursor: "pointer",
                      }}
                    >
                      <p style={{ color: "#fff", fontSize: "13px" }}>{item.title}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "calendar" && (
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>📅 Calendar</h2>
          <p style={{ color: "#9ca3af", marginBottom: "16px" }}>Scheduled tasks and cron jobs</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {calendar.map((event) => (
              <div
                key={event.id}
                style={{
                  backgroundColor: "#111827",
                  borderRadius: "8px",
                  padding: "16px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <h3 style={{ color: "#fff", fontWeight: "500" }}>{event.title}</h3>
                  <p style={{ color: "#9ca3af", fontSize: "14px" }}>
                    {new Date(event.scheduled_at).toLocaleString()} • {event.type}
                  </p>
                </div>
                <span
                  style={{
                    padding: "8px 16px",
                    borderRadius: "8px",
                    backgroundColor: event.completed ? "#10b981" : "#4b5563",
                    color: "#fff",
                    fontSize: "14px",
                  }}
                >
                  {event.completed ? "✓ Done" : "○ Pending"}
                </span>
              </div>
            ))}
            {calendar.length === 0 && (
              <p style={{ color: "#6b7280", textAlign: "center", padding: "32px" }}>No scheduled events</p>
            )}
          </div>
        </div>
      )}

      {activeTab === "memories" && (
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>🧠 Memory</h2>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search memories..."
            style={{ ...styles.input, width: "100%", marginBottom: "16px" }}
          />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "16px" }}>
            {memories
              .filter(
                (m) =>
                  m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  m.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  m.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
              )
              .map((memory) => (
                <div key={memory.id} style={{ backgroundColor: "#111827", borderRadius: "8px", padding: "16px" }}>
                  <h3 style={{ color: "#fff", fontWeight: "bold", marginBottom: "8px" }}>{memory.title}</h3>
                  <p style={{ color: "#9ca3af", fontSize: "14px", marginBottom: "12px" }}>{memory.content}</p>
                  <div style={{ display: "flex", gap: "8px" }}>
                    {(memory.tags || []).map((tag) => (
                      <span
                        key={tag}
                        style={{
                          backgroundColor: "rgba(245, 158, 11, 0.2)",
                          color: "#fbbf24",
                          padding: "4px 8px",
                          borderRadius: "4px",
                          fontSize: "12px",
                        }}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {activeTab === "team" && (
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>👥 Team</h2>
          <p style={{ color: "#9ca3af", marginBottom: "16px" }}>Your agents and sub-agents</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "16px" }}>
            {team.map((member) => (
              <div key={member.id} style={{ backgroundColor: "#111827", borderRadius: "8px", padding: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "50%",
                      backgroundColor: getTeamStatusColor(member.status),
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "24px",
                    }}
                  >
                    {member.avatar || "🤖"}
                  </div>
                  <div>
                    <h3 style={{ color: "#fff", fontWeight: "bold" }}>{member.name}</h3>
                    <p style={{ color: "#9ca3af", fontSize: "14px" }}>{member.role}</p>
                  </div>
                </div>
                <p style={{ color: "#6b7280", fontSize: "13px" }}>{member.description}</p>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "12px" }}>
                  <div
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      backgroundColor: getTeamStatusColor(member.status),
                    }}
                  ></div>
                  <span style={{ fontSize: "12px", color: "#9ca3af", textTransform: "capitalize" }}>{member.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "office" && (
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>🏢 Digital Office</h2>
          <p style={{ color: "#9ca3af", marginBottom: "16px" }}>Watch your agents work in real-time</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "16px" }}>
            {team.map((member) => (
              <div key={member.id} style={{ backgroundColor: "#111827", borderRadius: "8px", padding: "16px", textAlign: "center" }}>
                <div
                  style={{
                    width: "80px",
                    height: "80px",
                    margin: "0 auto 12px",
                    borderRadius: "50%",
                    backgroundColor: getTeamStatusColor(member.status),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "36px",
                  }}
                >
                  {member.status === "working" ? "💻" : member.status === "idle" ? "☕" : "👀"}
                </div>
                <h3 style={{ color: "#fff", fontWeight: "bold" }}>{member.name}</h3>
                <p style={{ color: "#9ca3af", fontSize: "14px", textTransform: "capitalize" }}>{member.status}</p>
                {member.status === "working" && (
                  <div style={{ marginTop: "12px" }}>
                    <div
                      style={{
                        height: "8px",
                        backgroundColor: "#374151",
                        borderRadius: "4px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          backgroundColor: "#10b981",
                          width: "60%",
                        }}
                      ></div>
                    </div>
                    <p style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px" }}>Working on tasks...</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
