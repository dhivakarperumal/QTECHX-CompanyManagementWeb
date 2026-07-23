import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./ChatBot.css";

// ─── Intent Detection ─────────────────────────────────────────────────────────
const EMPLOYEE_KEYWORDS = ["employee", "employees", "staff", "team member", "headcount", "hire", "onboard", "workforce"];
const ATTENDANCE_KEYWORDS = ["attendance", "present", "absent", "late", "check in", "check out", "punch", "working hours"];
const LEAVE_KEYWORDS = ["leave", "vacation", "day off", "time off", "holiday", "sick leave", "casual leave"];
const PAYROLL_KEYWORDS = ["payroll", "salary", "pay", "payment", "wage", "compensation", "increment", "bonus", "appraisal"];
const TASK_KEYWORDS = ["task", "tasks", "todo", "to-do", "assignment", "work item", "pending", "completed task", "deadline"];
const PROJECT_KEYWORDS = ["project", "projects", "milestone", "sprint", "deliverable", "client project"];
const REPORT_KEYWORDS = ["report", "reports", "analytics", "summary", "performance", "kpi", "metrics", "stats", "statistics"];
const DEPARTMENT_KEYWORDS = ["department", "departments", "division", "team", "unit"];
const SUPPORT_KEYWORDS = ["help", "support", "contact", "admin", "issue", "problem", "complaint", "assist"];
const GREETING_KEYWORDS = ["hi", "hello", "hey", "good morning", "good afternoon", "good evening", "hii", "hai"];

function detectIntent(text) {
  const lower = text.toLowerCase().trim();
  if (GREETING_KEYWORDS.some((k) => lower === k || lower.startsWith(k + " "))) return "greeting";
  if (ATTENDANCE_KEYWORDS.some((k) => lower.includes(k))) return "attendance";
  if (LEAVE_KEYWORDS.some((k) => lower.includes(k))) return "leave";
  if (PAYROLL_KEYWORDS.some((k) => lower.includes(k))) return "payroll";
  if (TASK_KEYWORDS.some((k) => lower.includes(k))) return "tasks";
  if (PROJECT_KEYWORDS.some((k) => lower.includes(k))) return "projects";
  if (REPORT_KEYWORDS.some((k) => lower.includes(k))) return "reports";
  if (DEPARTMENT_KEYWORDS.some((k) => lower.includes(k))) return "departments";
  if (EMPLOYEE_KEYWORDS.some((k) => lower.includes(k))) return "employees";
  if (SUPPORT_KEYWORDS.some((k) => lower.includes(k))) return "support";
  return "unknown";
}

// ─── Quick Actions ────────────────────────────────────────────────────────────
const QUICK_ACTIONS = [
  {
    label: "Employees", message: "Show employee info",
    color: "#f97316", bg: "rgba(249,115,22,0.15)",
    icon: <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  },
  {
    label: "Attendance", message: "Show attendance info",
    color: "#3b82f6", bg: "rgba(59,130,246,0.15)",
    icon: <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  },
  {
    label: "Leave Requests", message: "Show leave request info",
    color: "#f59e0b", bg: "rgba(245,158,11,0.15)",
    icon: <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  },
  {
    label: "Payroll", message: "Show payroll info",
    color: "#10b981", bg: "rgba(16,185,129,0.15)",
    icon: <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  },
  {
    label: "Tasks", message: "Show task info",
    color: "#8b5cf6", bg: "rgba(139,92,246,0.15)",
    icon: <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
  },
  {
    label: "Projects", message: "Show project info",
    color: "#ec4899", bg: "rgba(236,72,153,0.15)",
    icon: <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
  },
  {
    label: "Reports", message: "Show reports and analytics",
    color: "#06b6d4", bg: "rgba(6,182,212,0.15)",
    icon: <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  },
  {
    label: "Contact Admin", message: "Contact admin or support",
    color: "#ef4444", bg: "rgba(239,68,68,0.15)",
    icon: <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.78a16 16 0 0 0 6.29 6.29l1.64-1.64a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
  },
];

// ─── Intent Responses ─────────────────────────────────────────────────────────
function getBotResponse(intent, text) {
  switch (intent) {
    case "greeting":
      return {
        type: "text",
        text: `👋 Hello! I'm **QTechx Assistant**, your company management helper.\n\nI can assist you with:\n• 👥 Employee management\n• 📅 Attendance tracking\n• 🏖️ Leave requests\n• 💰 Payroll & salary\n• ✅ Tasks & projects\n• 📊 Reports & analytics\n\nHow can I help you today?`,
      };
    case "employees":
      return {
        type: "info_cards",
        text: "👥 Here's what I can help with for **Employees**:",
        cards: [
          { icon: "👤", title: "Add New Employee", desc: "Onboard a new team member to the system", link: "/admin/employees", color: "#f97316" },
          { icon: "📋", title: "View All Employees", desc: "See the full list of staff and their details", link: "/admin/employees", color: "#3b82f6" },
          { icon: "🏢", title: "By Department", desc: "Browse employees filtered by department", link: "/admin/departments", color: "#8b5cf6" },
          { icon: "📈", title: "Performance", desc: "Check employee performance metrics", link: "/admin/reports", color: "#10b981" },
        ],
      };
    case "attendance":
      return {
        type: "info_cards",
        text: "📅 Here's what I can help with for **Attendance**:",
        cards: [
          { icon: "✅", title: "Today's Attendance", desc: "View who is present and absent today", link: "/admin/attendance", color: "#10b981" },
          { icon: "📊", title: "Attendance Report", desc: "Monthly attendance summary and stats", link: "/admin/attendance", color: "#3b82f6" },
          { icon: "⏰", title: "Late Arrivals", desc: "Track late check-ins and early departures", link: "/admin/attendance", color: "#f59e0b" },
          { icon: "📆", title: "Mark Attendance", desc: "Manually mark attendance for employees", link: "/admin/attendance", color: "#f97316" },
        ],
      };
    case "leave":
      return {
        type: "info_cards",
        text: "🏖️ Here's what I can help with for **Leave Management**:",
        cards: [
          { icon: "📥", title: "Pending Requests", desc: "Review and approve pending leave applications", link: "/admin/leave", color: "#f59e0b" },
          { icon: "✅", title: "Approved Leaves", desc: "List of all approved leave requests", link: "/admin/leave", color: "#10b981" },
          { icon: "❌", title: "Rejected Leaves", desc: "History of declined leave requests", link: "/admin/leave", color: "#ef4444" },
          { icon: "📋", title: "Leave Balance", desc: "Check remaining leave days for employees", link: "/admin/leave", color: "#8b5cf6" },
        ],
      };
    case "payroll":
      return {
        type: "info_cards",
        text: "💰 Here's what I can help with for **Payroll**:",
        cards: [
          { icon: "💸", title: "Run Payroll", desc: "Process this month's salary payments", link: "/admin/payroll", color: "#10b981" },
          { icon: "📄", title: "Pay Slips", desc: "Generate and download employee pay slips", link: "/admin/payroll", color: "#3b82f6" },
          { icon: "📊", title: "Salary Report", desc: "View payroll summary and expense breakdown", link: "/admin/payroll", color: "#f97316" },
          { icon: "📈", title: "Increment & Bonus", desc: "Manage salary increments and bonuses", link: "/admin/payroll", color: "#8b5cf6" },
        ],
      };
    case "tasks":
      return {
        type: "info_cards",
        text: "✅ Here's what I can help with for **Tasks**:",
        cards: [
          { icon: "📝", title: "Create Task", desc: "Assign a new task to an employee", link: "/admin/tasks", color: "#f97316" },
          { icon: "⏳", title: "Pending Tasks", desc: "View all tasks not yet completed", link: "/admin/tasks", color: "#f59e0b" },
          { icon: "✅", title: "Completed Tasks", desc: "See tasks that have been finished", link: "/admin/tasks", color: "#10b981" },
          { icon: "🚨", title: "Overdue Tasks", desc: "Tasks that are past their deadline", link: "/admin/tasks", color: "#ef4444" },
        ],
      };
    case "projects":
      return {
        type: "info_cards",
        text: "🗂️ Here's what I can help with for **Projects**:",
        cards: [
          { icon: "➕", title: "New Project", desc: "Start a new project and assign a team", link: "/admin/projects", color: "#f97316" },
          { icon: "🔄", title: "Active Projects", desc: "See all currently running projects", link: "/admin/projects", color: "#3b82f6" },
          { icon: "✅", title: "Completed Projects", desc: "View successfully delivered projects", link: "/admin/projects", color: "#10b981" },
          { icon: "📊", title: "Project Reports", desc: "Progress reports and milestone tracking", link: "/admin/projects", color: "#8b5cf6" },
        ],
      };
    case "reports":
      return {
        type: "info_cards",
        text: "📊 Here's what I can help with for **Reports & Analytics**:",
        cards: [
          { icon: "👥", title: "Employee Report", desc: "Full workforce summary and stats", link: "/admin/reports", color: "#3b82f6" },
          { icon: "📅", title: "Attendance Report", desc: "Daily, weekly, and monthly attendance data", link: "/admin/reports", color: "#f97316" },
          { icon: "💰", title: "Payroll Report", desc: "Salary expense and payroll history", link: "/admin/reports", color: "#10b981" },
          { icon: "📈", title: "Performance Report", desc: "KPIs, task completion, and productivity", link: "/admin/reports", color: "#8b5cf6" },
        ],
      };
    case "departments":
      return {
        type: "info_cards",
        text: "🏢 Here's what I can help with for **Departments**:",
        cards: [
          { icon: "➕", title: "Add Department", desc: "Create a new department in the system", link: "/admin/departments", color: "#f97316" },
          { icon: "📋", title: "All Departments", desc: "View all departments and their headcounts", link: "/admin/departments", color: "#3b82f6" },
          { icon: "👥", title: "Department Staff", desc: "See all employees in a specific department", link: "/admin/departments", color: "#8b5cf6" },
          { icon: "📊", title: "Department Report", desc: "Performance and stats by department", link: "/admin/reports", color: "#10b981" },
        ],
      };
    case "support":
      return {
        type: "support",
        text: "🛠️ How would you like to get support?",
      };
    default:
      return {
        type: "text",
        text: `🤔 I didn't quite catch that. Here's what I can help you with:\n\n• 👥 **Employees** — manage staff\n• 📅 **Attendance** — track check-ins\n• 🏖️ **Leave** — approve/reject requests\n• 💰 **Payroll** — run salaries\n• ✅ **Tasks** — manage work items\n• 🗂️ **Projects** — track deliverables\n• 📊 **Reports** — analytics & KPIs\n\nTry typing one of the above topics!`,
      };
  }
}

// ─── Main ChatBot Component ───────────────────────────────────────────────────
const ChatBot = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Welcome message on open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: Date.now(),
          from: "bot",
          type: "welcome",
          text: `👋 Hello! I'm **QTechx Assistant** — your smart company management helper.\n\nI can help you with employees, attendance, leaves, payroll, tasks, projects, and more!\n\nWhat would you like to do today?`,
        },
      ]);
    }
  }, [isOpen]);

  // Scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 300);
  }, [isOpen]);

  const handleSend = (overrideText) => {
    const text = (overrideText ?? input).trim();
    if (!text) return;

    const userMsg = { id: Date.now(), from: "user", type: "text", text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    setTimeout(() => {
      const intent = detectIntent(text);
      const response = getBotResponse(intent, text);
      const botMsg = { id: Date.now() + 1, from: "bot", ...response };
      setMessages((prev) => [...prev, botMsg]);
      setLoading(false);
    }, 800);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="chatbot-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="chatbot-panel">
        {/* Header */}
        <div className="chatbot-header" style={{ background: "linear-gradient(135deg, #1a1b23 0%, #0d0d12 100%)", borderBottom: "1px solid rgba(249,115,22,0.2)" }}>
          <div className="chatbot-header-info">
            <div className="chatbot-avatar" style={{ background: "linear-gradient(135deg, rgba(249,115,22,0.3), rgba(249,115,22,0.1))", border: "1px solid rgba(249,115,22,0.4)", boxShadow: "0 0 14px rgba(249,115,22,0.2)" }}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#f97316" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                <circle cx="12" cy="16" r="1" fill="#f97316"/>
              </svg>
            </div>
            <div>
              <div className="chatbot-header-title" style={{ color: "#fff", fontWeight: 700 }}>QTechx Assistant</div>
              <div className="chatbot-header-status" style={{ color: "rgba(255,255,255,0.5)" }}>
                <span className="status-dot" style={{ background: "#10b981", boxShadow: "0 0 6px #10b981" }} /> Company Management AI
              </div>
            </div>
          </div>
          <button className="chatbot-close-btn" onClick={onClose} style={{ background: "rgba(255,255,255,0.08)", color: "#fff" }}>✕</button>
        </div>

        {/* Messages */}
        <div className="chatbot-messages" style={{ background: "#0d0d12" }}>
          {messages.map((msg) => (
            <MessageBubble key={msg.id} msg={msg} navigate={navigate} onClose={onClose} />
          ))}

          {loading && (
            <div className="chatbot-msg bot-msg">
              <div className="typing-indicator">
                <span /><span /><span />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Quick Actions */}
        {messages.length <= 1 && (
          <div className="chatbot-quick-actions" style={{ background: "#0d0d12", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="quick-actions-label" style={{ color: "rgba(255,255,255,0.4)" }}>Quick Actions</div>
            <div className="quick-actions-grid">
              {QUICK_ACTIONS.map((qa) => (
                <button
                  key={qa.label}
                  className="quick-action-chip"
                  onClick={() => handleSend(qa.message)}
                  style={{
                    "--chip-color": qa.color,
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "#fff",
                  }}
                >
                  <span className="chip-icon" style={{ color: qa.color, background: qa.bg }}>
                    {qa.icon}
                  </span>
                  {qa.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="chatbot-input-area" style={{ background: "#13141c", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <input
            ref={inputRef}
            className="chatbot-input"
            placeholder="Ask about employees, tasks, payroll…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{ background: "rgba(255,255,255,0.05)", color: "#fff", border: "1px solid rgba(255,255,255,0.1)" }}
          />
          <button
            className="chatbot-send-btn"
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            style={{ background: "linear-gradient(135deg, #f97316, #ea6a10)" }}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Message Bubble ───────────────────────────────────────────────────────────
const MessageBubble = ({ msg, navigate, onClose }) => {
  if (msg.from === "user") {
    return (
      <div className="chatbot-msg user-msg">
        <div className="msg-bubble user-bubble" style={{ background: "linear-gradient(135deg, #f97316, #ea6a10)", color: "#fff" }}>
          {msg.text}
        </div>
      </div>
    );
  }

  return (
    <div className="chatbot-msg bot-msg">
      <div className="bot-avatar-sm" style={{ fontSize: "16px" }}>🤖</div>
      <div className="bot-content">

        {/* Plain text / welcome */}
        {(msg.type === "text" || msg.type === "welcome") && (
          <div className="msg-bubble bot-bubble" style={{ background: "rgba(255,255,255,0.06)", color: "#e5e7eb", border: "1px solid rgba(255,255,255,0.08)", whiteSpace: "pre-line" }}>
            {msg.text.split("**").map((part, i) =>
              i % 2 === 1 ? <strong key={i} style={{ color: "#f97316" }}>{part}</strong> : part
            )}
          </div>
        )}

        {/* Info Cards */}
        {msg.type === "info_cards" && (
          <div>
            <div className="msg-bubble bot-bubble" style={{ background: "rgba(255,255,255,0.06)", color: "#e5e7eb", border: "1px solid rgba(255,255,255,0.08)", marginBottom: "10px" }}>
              {msg.text.split("**").map((part, i) =>
                i % 2 === 1 ? <strong key={i} style={{ color: "#f97316" }}>{part}</strong> : part
              )}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              {msg.cards.map((card, i) => (
                <button
                  key={i}
                  onClick={() => { navigate(card.link); onClose(); }}
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: `1px solid ${card.color}30`,
                    borderRadius: "12px",
                    padding: "10px",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = `${card.color}15`; e.currentTarget.style.borderColor = `${card.color}60`; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.borderColor = `${card.color}30`; }}
                >
                  <div style={{ fontSize: "20px", marginBottom: "4px" }}>{card.icon}</div>
                  <div style={{ color: "#fff", fontSize: "11px", fontWeight: 600, marginBottom: "2px" }}>{card.title}</div>
                  <div style={{ color: "rgba(255,255,255,0.45)", fontSize: "10px", lineHeight: "1.3" }}>{card.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Support */}
        {msg.type === "support" && (
          <div>
            <div className="msg-bubble bot-bubble" style={{ background: "rgba(255,255,255,0.06)", color: "#e5e7eb", border: "1px solid rgba(255,255,255,0.08)", marginBottom: "10px" }}>
              {msg.text}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              {[
                { label: "Email Admin", href: "mailto:admin@qtechx.com", color: "#f97316", icon: "📧" },
                { label: "Call Support", href: "tel:+919876543210", color: "#10b981", icon: "📞" },
                { label: "WhatsApp", href: "https://wa.me/919876543210", color: "#25d366", icon: "💬" },
                { label: "Raise Ticket", href: "/admin", color: "#8b5cf6", icon: "🎫" },
              ].map((opt) => (
                <a
                  key={opt.label}
                  href={opt.href}
                  target={opt.href.startsWith("http") ? "_blank" : "_self"}
                  rel="noreferrer"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    background: "rgba(255,255,255,0.04)",
                    border: `1px solid ${opt.color}30`,
                    borderRadius: "12px",
                    padding: "10px 12px",
                    textDecoration: "none",
                    color: "#fff",
                    fontSize: "12px",
                    fontWeight: 500,
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = `${opt.color}15`; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
                >
                  <span style={{ fontSize: "18px" }}>{opt.icon}</span>
                  {opt.label}
                </a>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ChatBot;
