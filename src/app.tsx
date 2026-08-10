// src/App.tsx
import { useEffect, useMemo, useState } from "react";

type Route = "chat" | "live" | "analytics" | "overlay";
type LiveStatus = "offline" | "starting" | "live" | "stopping" | "error";

type ChatMessage = {
  id: number;
  role: "user" | "hectron";
  text: string;
  time: string;
};

const SCENES = [
  "HECTRON_LIVE",
  "HECTRON_HAPPY",
  "HECTRON_SAD",
  "HECTRON_ANGRY",
  "HECTRON_SURPRISE",
  "HECTRON_BRB",
  "HECTRON_END",
] as const;

function normalizePath(pathname: string): string {
  const path = pathname.replace(/\/+$/, "");
  return path || "/";
}

function routeFromPath(pathname: string): Route {
  const path = normalizePath(pathname);
  if (path === "/overlay") return "overlay";
  if (path === "/chat") return "chat";
  if (path === "/analytics") return "analytics";
  return "live";
}

async function api<T>(path: string, init: RequestInit = {}): Promise<T | null> {
  try {
    const res = await fetch(path, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init.headers || {}),
      },
      cache: "no-store",
    });

    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export default function App() {
  const [route, setRoute] = useState<Route>(() => {
    const path = normalizePath(window.location.pathname);
    if (path === "/" || path === "/index.html") return "live";
    return routeFromPath(path);
  });

  useEffect(() => {
    const onPopState = () => {
      const path = normalizePath(window.location.pathname);
      if (path === "/" || path === "/index.html") {
        setRoute("live");
        return;
      }
      setRoute(routeFromPath(path));
    };

    window.addEventListener("popstate", onPopState);

    const path = normalizePath(window.location.pathname);
    if (path === "/" || path === "/index.html") {
      window.history.replaceState({}, "", "/live");
      setRoute("live");
    }

    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const navigate = (next: Route) => {
    if (next === route) return;
    window.history.pushState({}, "", `/${next}`);
    setRoute(next);
  };

  if (route === "overlay") {
    return <OverlayPage />;
  }

  return (
    <Dashboard
      route={route}
      navigate={navigate}
    />
  );
}

function Dashboard({
  route,
  navigate,
}: {
  route: Exclude<Route, "overlay">;
  navigate: (r: Exclude<Route, "overlay">) => void;
}) {
  return (
    <div className="dashboard-shell">
      <header className="topbar glass">
        <div className="brand">
          <div className="brand-orb" />
          <div>
            <strong>HECTRON</strong>
            <span>AI STREAM SYSTEM</span>
          </div>
        </div>

        <div className="status-pill">
          <span className="status-dot online" />
          ONLINE
        </div>
      </header>

      <main className="content">
        {route === "chat" && <ChatTab />}
        {route === "live" && <LiveTab />}
        {route === "analytics" && <AnalyticsTab />}
      </main>

      <nav className="bottom-nav glass">
        <NavButton active={route === "chat"} label="Chat" icon="◉" onClick={() => navigate("chat")} />
        <NavButton active={route === "live"} label="Live" icon="●" onClick={() => navigate("live")} />
        <NavButton active={route === "analytics"} label="Analytics" icon="⌁" onClick={() => navigate("analytics")} />
      </nav>
    </div>
  );
}

function NavButton({
  active,
  label,
  icon,
  onClick,
}: {
  active: boolean;
  label: string;
  icon: string;
  onClick: () => void;
}) {
  return (
    <button className={`nav-button ${active ? "active" : ""}`} onClick={onClick}>
      <span>{icon}</span>
      <small>{label}</small>
    </button>
  );
}

function ChatTab() {
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      role: "hectron",
      text: "Estoy listo. ¿Qué hacemos?",
      time: "Ahora",
    },
  ]);

  const history = useMemo(
    () =>
      messages.map((m) => ({
        role: m.role === "user" ? ("user" as const) : ("assistant" as const),
        text: m.text,
      })),
    [messages]
  );

  async function send() {
    const text = input.trim();
    if (!text || busy) return;

    setBusy(true);
    setInput("");

    const userMsg: ChatMessage = {
      id: Date.now(),
      role: "user",
      text,
      time: "Ahora",
    };

    setMessages((prev) => [...prev, userMsg]);

    const reply =
      (await api<{ text: string }>("/api/chat", {
        method: "POST",
        body: JSON.stringify({ message: text, history }),
      })) ||
      {
        text: "Mensaje recibido. Bridge eliminado; el panel ya no depende de esa pantalla.",
      };

    const botMsg: ChatMessage = {
      id: Date.now() + 1,
      role: "hectron",
      text: reply.text || "…",
      time: "Ahora",
    };

    setMessages((prev) => [...prev, botMsg]);
    setBusy(false);
  }

  return (
    <section className="tab">
      <div className="section-header">
        <div>
          <span className="eyebrow">HECTRON</span>
          <h1>Chat</h1>
        </div>
        <span className="badge">ONLINE</span>
      </div>

      <div className="chat-window">
        {messages.map((m) => (
          <div key={m.id} className={`message-row ${m.role}`}>
            <article className="message-card glass">
              <div className="message-author">{m.role === "hectron" ? "HECTRON" : "TÚ"}</div>
              <div className="message-text">{m.text}</div>
              <div className="message-time">{m.time}</div>
            </article>
          </div>
        ))}
      </div>

      <div className="chat-input">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") send();
          }}
          placeholder="Habla con Hectron..."
        />
        <button onClick={send} disabled={busy}>
          →
        </button>
      </div>
    </section>
  );
}

function LiveTab() {
  const [status, setStatus] = useState<LiveStatus>("offline");
  const [scene, setScene] = useState<string>("HECTRON_LIVE");
  const [elapsed, setElapsed] = useState(0);
  const [backendOk, setBackendOk] = useState(true);

  useEffect(() => {
    if (status !== "live") return;
    const timer = window.setInterval(() => setElapsed((v) => v + 1), 1000);
    return () => window.clearInterval(timer);
  }, [status]);

  const time = useMemo(() => {
    const hh = String(Math.floor(elapsed / 3600)).padStart(2, "0");
    const mm = String(Math.floor((elapsed % 3600) / 60)).padStart(2, "0");
    const ss = String(elapsed % 60).padStart(2, "0");
    return `${hh}:${mm}:${ss}`;
  }, [elapsed]);

  async function startLive() {
    setStatus("starting");
    const result = await api<{ ok: boolean }>("/api/live/start", {
      method: "POST",
      body: JSON.stringify({ scene }),
    });

    if (!result) {
      setBackendOk(false);
      setStatus("live");
      setElapsed(0);
      return;
    }

    setBackendOk(true);
    setStatus("live");
    setElapsed(0);
  }

  async function stopLive() {
    setStatus("stopping");
    const result = await api<{ ok: boolean }>("/api/live/stop", {
      method: "POST",
    });

    if (!result) {
      setBackendOk(false);
      setStatus("offline");
      setElapsed(0);
      return;
    }

    setBackendOk(true);
    setStatus("offline");
    setElapsed(0);
  }

  async function changeScene(nextScene: string) {
    setScene(nextScene);

    if (status !== "live") return;

    const result = await api<{ ok: boolean }>("/api/live/scene", {
      method: "POST",
      body: JSON.stringify({ scene: nextScene }),
    });

    if (!result) {
      setBackendOk(false);
    } else {
      setBackendOk(true);
    }
  }

  return (
    <section className="tab">
      <div className="section-header">
        <div>
          <span className="eyebrow">TRANSMISSION</span>
          <h1>Live</h1>
        </div>

        <div className={`live-indicator ${status}`}>
          <span />
          {status === "live" ? "EN VIVO" : status === "starting" ? "INICIANDO" : "LISTO"}
        </div>
      </div>

      {!backendOk && <div className="inline-note glass">Modo local activo. El panel ya no depende de una pantalla Bridge visible.</div>}

      <section className="live-card glass">
        <div className="live-avatar">H</div>
        <div className="live-meta">
          <strong>HECTRON</strong>
          <span>IA autónoma</span>
        </div>
        <div className="live-time">{time}</div>
      </section>

      <section className="control-card glass">
        {status !== "live" ? (
          <button className="primary-action" disabled={status === "starting"} onClick={startLive}>
            {status === "starting" ? "INICIANDO..." : "▶ INICIAR LIVE"}
          </button>
        ) : (
          <button className="danger-action" onClick={stopLive}>
            ■ DETENER LIVE
          </button>
        )}
      </section>

      <section className="scene-card glass">
        <div className="section-title">ESCENA</div>
        <div className="scene-grid">
          {SCENES.map((item) => (
            <button
              key={item}
              className={scene === item ? "scene active" : "scene"}
              onClick={() => changeScene(item)}
            >
              {item.replace("HECTRON_", "")}
            </button>
          ))}
        </div>
      </section>
    </section>
  );
}

function AnalyticsTab() {
  const [uptime, setUptime] = useState("00:00:00");
  const [viewers] = useState(0);
  const [messages] = useState(0);
  const [interactions] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setUptime((current) => incrementTime(current));
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="tab">
      <div className="section-header">
        <div>
          <span className="eyebrow">SESSION</span>
          <h1>Analytics</h1>
        </div>
        <span className="badge">LIVE DATA</span>
      </div>

      <div className="metrics-grid">
        <Metric label="VIEWERS" value={viewers} />
        <Metric label="MENSAJES" value={messages} />
        <Metric label="INTERACCIONES" value={interactions} />
        <Metric label="UPTIME" value={uptime} />
      </div>

      <section className="analytics-card glass">
        <span className="eyebrow">ACTIVITY</span>
        <div className="fake-chart">
          {Array.from({ length: 28 }).map((_, i) => (
            <div key={i} style={{ height: `${20 + ((i * 17) % 70)}%` }} />
          ))}
        </div>
      </section>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <article className="metric glass">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function incrementTime(value: string) {
  const [hh, mm, ss] = value.split(":").map(Number);
  let h = hh;
  let m = mm;
  let s = ss + 1;

  if (s >= 60) {
    s = 0;
    m += 1;
  }
  if (m >= 60) {
    m = 0;
    h += 1;
  }

  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
}

function OverlayPage() {
  return (
    <main className="overlay-shell">
      <div className="overlay-badge glass">
        HECTRON · OVERLAY
      </div>
      <div className="overlay-orb" />
      <div className="overlay-ring" />
    </main>
  );
    }
