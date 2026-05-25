import { useState, useEffect, useRef } from "react";

// ── Global CSS Reset ────────────────────────────────────────
const GlobalReset = () => (
  <style>{`
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
    html, body, #root { margin: 0 !important; padding: 0 !important; width: 100%; min-height: 100vh; background: #050709; }
    a { text-decoration: none; }
    ul { list-style: none; }
    button { cursor: pointer; }
  `}</style>
);

// ── Persistent storage helpers ──────────────────────────────
async function getCount() {
  try {
    const r = await window.storage.get("beammcp-visitors", true);
    return r ? parseInt(r.value, 10) : 0;
  } catch { return 0; }
}
async function setCount(n) {
  try { await window.storage.set("beammcp-visitors", String(n), true); } catch {}
}
async function getLikes() {
  try {
    const r = await window.storage.get("beammcp-likes", true);
    return r ? parseInt(r.value, 10) : 0;
  } catch { return 0; }
}
async function setLikesStorage(n) {
  try { await window.storage.set("beammcp-likes", String(n), true); } catch {}
}
async function hasLiked() {
  try {
    const r = await window.storage.get("beammcp-liked-me", false);
    return r ? r.value === "1" : false;
  } catch { return false; }
}
async function markLiked() {
  try { await window.storage.set("beammcp-liked-me", "1", false); } catch {}
}

// ── Counter Widget ───────────────────────────────────────────
function CounterWidget({ visitors, likes, liked, onLike }) {
  const [pop, setPop] = useState(false);
  const handleLike = () => {
    if (liked) return;
    setPop(true);
    setTimeout(() => setPop(false), 600);
    onLike();
  };
  return (
    <div style={{
      position: "fixed", bottom: 28, right: 28, zIndex: 9000,
      display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-end"
    }}>
      <div style={{
        background: "rgba(10,16,30,0.95)", border: "1px solid #1e2d45",
        borderRadius: 12, padding: "10px 16px",
        display: "flex", alignItems: "center", gap: 10,
        backdropFilter: "blur(16px)", boxShadow: "0 8px 32px rgba(0,0,0,0.4)"
      }}>
        <span style={{ fontSize: 16 }}>👁</span>
        <div>
          <div style={{
            fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 18,
            background: "linear-gradient(135deg,#00d4ff,#7b5ea7)", WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent", lineHeight: 1
          }}>{visitors.toLocaleString()}</div>
          <div style={{ fontSize: 9, color: "#5a6a8a", letterSpacing: 1.5, textTransform: "uppercase", marginTop: 2 }}>Visitors</div>
        </div>
      </div>
      <button onClick={handleLike} title={liked ? "Already starred!" : "Star this site!"} style={{
        background: liked ? "rgba(240,165,0,0.15)" : "rgba(10,16,30,0.95)",
        border: liked ? "1px solid #f0a500aa" : "1px solid #1e2d45",
        borderRadius: 12, padding: "10px 16px",
        display: "flex", alignItems: "center", gap: 10,
        backdropFilter: "blur(16px)", boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        cursor: liked ? "default" : "pointer",
        transition: "all 0.3s",
        transform: pop ? "scale(1.18)" : "scale(1)"
      }}>
        <span style={{ fontSize: 18, filter: liked ? "drop-shadow(0 0 6px #f0a500)" : "none", transition: "filter 0.3s" }}>
          {liked ? "⭐" : "☆"}
        </span>
        <div>
          <div style={{
            fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 18,
            color: liked ? "#f0a500" : "#e8f0fe", lineHeight: 1
          }}>{likes.toLocaleString()}</div>
          <div style={{ fontSize: 9, color: "#5a6a8a", letterSpacing: 1.5, textTransform: "uppercase", marginTop: 2 }}>
            {liked ? "Starred!" : "Star site"}
          </div>
        </div>
      </button>
    </div>
  );
}

// ── Animated number ─────────────────────────────────────────
function AnimNum({ value }) {
  const [disp, setDisp] = useState(0);
  useEffect(() => {
    if (!value) return;
    let start = 0;
    const end = value;
    const step = () => {
      start += Math.ceil((end - start) / 8);
      setDisp(start);
      if (start < end) requestAnimationFrame(step);
      else setDisp(end);
    };
    requestAnimationFrame(step);
  }, [value]);
  return <>{disp.toLocaleString()}</>;
}

// ── Main App ─────────────────────────────────────────────────
export default function BeamMCP() {
  const [visitors, setVisitors] = useState(0);
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const didCount = useRef(false);

  useEffect(() => {
    (async () => {
      let v = await getCount();
      const l = await getLikes();
      const hl = await hasLiked();
      if (!didCount.current) {
        didCount.current = true;
        v += 1;
        await setCount(v);
      }
      setVisitors(v);
      setLikes(l);
      setLiked(hl);
      setLoaded(true);
    })();
  }, []);

  const handleLike = async () => {
    const newLikes = likes + 1;
    setLikes(newLikes);
    setLiked(true);
    await setLikesStorage(newLikes);
    await markLiked();
  };

  const G = {
    bg: "#050709", surface: "#0b0f1a", card: "#0f1522", border: "#1a2740",
    accent: "#00d4ff", accent2: "#7b5ea7", accent3: "#f0a500", green: "#00e5a0",
    text: "#eaf1ff", muted: "#5a6a8a",
    beam: "linear-gradient(135deg,#00d4ff 0%,#7b5ea7 55%,#f0a500 100%)",
  };

  const S = {
    wrap: {
      background: G.bg, color: G.text,
      fontFamily: "'DM Mono',monospace",
      minHeight: "100vh", width: "100%",
      overflowX: "hidden", margin: 0, padding: 0,
    },

    /* BANNER */
    banner: {
      background: "linear-gradient(90deg,#0d0900,#1c1100 50%,#0d0900)",
      borderBottom: `1.5px solid ${G.accent3}55`,
      padding: "9px 24px", display: "flex", alignItems: "center",
      justifyContent: "center", gap: 14, flexWrap: "wrap"
    },
    badge: {
      background: G.accent3, color: "#000",
      fontFamily: "'Syne',sans-serif", fontWeight: 800,
      fontSize: 9, letterSpacing: 2.5, textTransform: "uppercase",
      padding: "3px 10px", borderRadius: 2
    },
    bannerText: { fontFamily: "'Syne',sans-serif", fontSize: 12, fontWeight: 600, color: G.accent3 },
    buyBtnTop: {
      background: G.accent3, color: "#000",
      fontFamily: "'Syne',sans-serif", fontWeight: 800,
      fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase",
      border: "none", padding: "7px 16px", borderRadius: 3,
      cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 5
    },

    /* NAV */
    nav: {
      position: "sticky", top: 0, zIndex: 100,
      background: "rgba(5,7,9,0.95)", backdropFilter: "blur(20px)",
      borderBottom: `1px solid ${G.border}`,
      display: "flex", alignItems: "center",
      justifyContent: "space-between", padding: "14px 5%"
    },
    logoWrap: { display: "flex", alignItems: "center", gap: 10, color: G.text },
    logoIcon: {
      width: 34, height: 34, background: G.beam,
      borderRadius: 9, display: "grid", placeItems: "center"
    },
    logoText: { fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 20, letterSpacing: "-1px" },
    navCta: {
      background: "transparent", border: `1px solid ${G.accent}`, color: G.accent,
      fontFamily: "'Syne',sans-serif", fontWeight: 700,
      fontSize: 11, letterSpacing: 1, textTransform: "uppercase",
      padding: "8px 16px", borderRadius: 3
    },

    /* HERO */
    hero: {
      minHeight: "90vh", display: "flex", alignItems: "center",
      justifyContent: "center", padding: "60px 5%",
      position: "relative", overflow: "hidden", textAlign: "center"
    },
    heroGlow: {
      position: "absolute", top: "-10%", left: "50%",
      transform: "translateX(-50%)", width: "800px", height: "500px",
      background: "radial-gradient(ellipse,#00d4ff18 0%,#7b5ea708 45%,transparent 70%)",
      pointerEvents: "none"
    },
    heroGrid: {
      position: "absolute", inset: 0,
      backgroundImage: `linear-gradient(${G.border} 1px,transparent 1px),linear-gradient(90deg,${G.border} 1px,transparent 1px)`,
      backgroundSize: "64px 64px", opacity: 0.22
    },
    badge2: {
      display: "inline-flex", alignItems: "center", gap: 8,
      background: "rgba(0,212,255,0.07)", border: `1px solid rgba(0,212,255,0.2)`,
      color: G.accent, fontSize: 10, letterSpacing: 2.5, textTransform: "uppercase",
      padding: "6px 18px", borderRadius: 100, marginBottom: 28
    },
    h1: {
      fontFamily: "'Syne',sans-serif", fontWeight: 800,
      fontSize: "clamp(40px,7vw,88px)", lineHeight: 0.95,
      letterSpacing: "-3px", marginBottom: 24
    },
    gradText: { background: G.beam, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
    heroSub: {
      fontFamily: "Georgia,serif", fontStyle: "italic", color: G.muted,
      fontSize: "clamp(13px,1.8vw,18px)", lineHeight: 1.75,
      maxWidth: 600, margin: "0 auto 40px"
    },
    btnPrimary: {
      background: G.beam, color: "#fff",
      fontFamily: "'Syne',sans-serif", fontWeight: 700,
      fontSize: 12, letterSpacing: 1, textTransform: "uppercase",
      border: "none", padding: "14px 28px", borderRadius: 4,
      display: "inline-flex", alignItems: "center", gap: 8,
      boxShadow: "0 0 24px rgba(0,212,255,0.2)"
    },
    btnGhost: {
      background: "transparent", color: G.text,
      fontFamily: "'Syne',sans-serif", fontWeight: 600,
      fontSize: 12, letterSpacing: 1, textTransform: "uppercase",
      border: `1px solid ${G.border}`, padding: "14px 28px", borderRadius: 4,
      display: "inline-flex", alignItems: "center", gap: 8
    },

    /* METRICS BAR */
    metricsBar: {
      display: "grid", gridTemplateColumns: "repeat(4,1fr)",
      gap: 1, background: G.border, borderRadius: 12,
      overflow: "hidden", border: `1px solid ${G.border}`, marginTop: 40
    },
    metricCell: { background: G.card, padding: "22px 16px", textAlign: "center" },
    metricVal: {
      fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 30,
      background: G.beam, WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent", letterSpacing: "-1.5px"
    },
    metricLabel: { fontSize: 9, color: G.muted, letterSpacing: 1.5, textTransform: "uppercase", marginTop: 4 },

    /* SECTIONS */
    section: { padding: "88px 5%" },
    sectionAlt: { padding: "88px 5%", background: G.surface },
    eyebrow: {
      fontSize: 10, letterSpacing: 3, textTransform: "uppercase",
      color: G.accent, marginBottom: 12,
      display: "flex", alignItems: "center", gap: 8
    },
    sectionTitle: {
      fontFamily: "'Syne',sans-serif", fontWeight: 800,
      fontSize: "clamp(26px,4vw,46px)", letterSpacing: "-2px",
      lineHeight: 1.05, maxWidth: 680, marginBottom: 52
    },

    /* FEATURES */
    featGrid: {
      display: "grid", gridTemplateColumns: "repeat(3,1fr)",
      gap: 1, background: G.border, borderRadius: 14,
      overflow: "hidden", border: `1px solid ${G.border}`
    },
    feat: { background: G.card, padding: "32px 26px" },
    featIcon: {
      width: 46, height: 46, borderRadius: 12,
      display: "grid", placeItems: "center",
      fontSize: 22, marginBottom: 20
    },
    featH3: { fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 15, letterSpacing: "-0.3px", marginBottom: 8 },
    featP: { fontSize: 12, color: G.muted, lineHeight: 1.8 },
    featTag: {
      display: "inline-block", marginTop: 12, fontSize: 9,
      letterSpacing: 1.5, textTransform: "uppercase",
      color: G.accent, background: "rgba(0,212,255,0.08)",
      border: "1px solid rgba(0,212,255,0.15)", borderRadius: 3, padding: "3px 8px"
    },

    /* PRICING */
    pCard: {
      background: G.card, border: `1px solid ${G.border}`,
      borderRadius: 14, padding: "34px 26px", position: "relative"
    },
    pCardFeat: {
      background: "linear-gradient(145deg,#0a1828,#0f1522)",
      border: `1px solid ${G.accent}`, borderRadius: 14,
      padding: "34px 26px", position: "relative",
      boxShadow: "0 0 40px rgba(0,212,255,0.1)"
    },
    pBadge: {
      position: "absolute", top: -12, left: "50%",
      transform: "translateX(-50%)", background: G.beam,
      color: "#fff", fontFamily: "'Syne',sans-serif",
      fontWeight: 700, fontSize: 9, letterSpacing: 2,
      textTransform: "uppercase", padding: "4px 14px",
      borderRadius: 100, whiteSpace: "nowrap"
    },
    planName: {
      fontFamily: "'Syne',sans-serif", fontWeight: 700,
      fontSize: 11, letterSpacing: 2.5, textTransform: "uppercase",
      color: G.muted, marginBottom: 18
    },
    planPrice: {
      fontFamily: "'Syne',sans-serif", fontWeight: 800,
      fontSize: 50, letterSpacing: "-3px", lineHeight: 1, marginBottom: 4
    },
    planPeriod: { fontSize: 11, color: G.muted, marginBottom: 26 },

    /* DOMAIN */
    domainBlock: {
      margin: "0 5%", background: "linear-gradient(135deg,#0e0800,#1a1100 50%,#0e0800)",
      border: `1px solid ${G.accent3}33`, borderRadius: 20,
      padding: "64px 52px",
      display: "flex", alignItems: "center",
      justifyContent: "space-between", gap: 48, flexWrap: "wrap",
      position: "relative", overflow: "hidden"
    },
    dName: {
      fontFamily: "'Syne',sans-serif", fontWeight: 800,
      fontSize: "clamp(36px,5.5vw,68px)", letterSpacing: "-3px",
      color: "#fff", lineHeight: 0.95, marginBottom: 14
    },
    buyDomBtn: {
      background: G.accent3, color: "#000",
      fontFamily: "'Syne',sans-serif", fontWeight: 800,
      fontSize: 14, letterSpacing: 1.5, textTransform: "uppercase",
      border: "none", padding: "17px 36px", borderRadius: 6,
      display: "flex", alignItems: "center", justifyContent: "center",
      gap: 8, boxShadow: "0 0 36px rgba(240,165,0,0.3)", width: "100%"
    },

    /* FOOTER */
    footer: {
      borderTop: `1px solid ${G.border}`, padding: "44px 5%",
      display: "flex", alignItems: "center",
      justifyContent: "space-between", flexWrap: "wrap", gap: 20
    },
  };

  const features = [
    { icon: "⚡", bg: "rgba(0,212,255,0.1)", title: "Universal MCP Gateway", desc: "One endpoint to route Model Context Protocol requests from any LLM to any system — databases, APIs, file systems.", tag: "MCP Core" },
    { icon: "🔐", bg: "rgba(0,229,160,0.1)", title: "Zero-Trust MCP Security", desc: "Every MCP context packet is signed, encrypted, and verified. Fine-grained permissions per model, tool, and user.", tag: "Security" },
    { icon: "📡", bg: "rgba(240,165,0,0.1)", title: "Real-Time MCP Streaming", desc: "Sub-8ms MCP context delivery via WebSocket and SSE. Your AI models never wait for context.", tag: "Performance" },
    { icon: "🧠", bg: "rgba(123,94,167,0.1)", title: "Semantic Context Cache", desc: "Intelligent caching reduces redundant MCP retrieval by up to 80%. Fewer tokens. Less latency.", tag: "Efficiency" },
    { icon: "🔌", bg: "rgba(0,212,255,0.1)", title: "500+ MCP Connectors", desc: "Pre-built connectors for GitHub, Slack, Notion, Postgres, Salesforce, Jira, Linear, and 490+ more.", tag: "Integrations" },
    { icon: "📊", bg: "rgba(0,229,160,0.1)", title: "MCP Observability", desc: "Full-stack tracing, MCP call histograms, per-tool analytics. Know exactly what your AI is doing.", tag: "Analytics" },
  ];

  return (
    <div style={S.wrap}>
      <GlobalReset />
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400;500&display=swap" rel="stylesheet" />

      {/* ── SALE BANNER ── */}
      <div style={S.banner}>
        <span style={S.badge}>🔥 For Sale</span>
        <span style={S.bannerText}>
          <strong>BeamMCP.com</strong>{" "}
          <span style={{ color: "#aab8d4", fontWeight: 400 }}>— Premium MCP domain available now</span>
        </span>
        <a href="https://www.godaddy.com/domainsearch/find?domainToCheck=BeamMCP.com" target="_blank" rel="noopener" style={S.buyBtnTop}>
          🌐 Buy on GoDaddy
        </a>
      </div>

      {/* ── NAV ── */}
      <nav style={S.nav}>
        <a href="#" style={S.logoWrap}>
          <div style={S.logoIcon}>
            <svg viewBox="0 0 24 24" fill="white" width="18" height="18">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <span style={S.logoText}>Beam<span style={S.gradText}>MCP</span></span>
        </a>
        <div style={{ display: "flex", gap: 28, fontSize: 11, letterSpacing: 1.2, textTransform: "uppercase" }}>
          {["Features", "Protocol", "Pricing", "Domain"].map(l => (
            <a key={l} href={`#${l.toLowerCase()}`} style={{ color: G.muted }}>{l}</a>
          ))}
        </div>
        <a href="https://www.godaddy.com/domainsearch/find?domainToCheck=BeamMCP.com" target="_blank" rel="noopener" style={S.navCta}>
          Buy Domain →
        </a>
      </nav>

      {/* ── HERO ── */}
      <section style={S.hero}>
        <div style={S.heroGrid} />
        <div style={S.heroGlow} />
        <div style={{ position: "relative", zIndex: 2, maxWidth: 900, width: "100%" }}>
          <div style={S.badge2}>
            <span style={{ width: 7, height: 7, background: G.green, borderRadius: "50%", boxShadow: `0 0 8px ${G.green}` }} />
            MCP · Model Context Protocol · AI Infrastructure
          </div>
          <h1 style={S.h1}>
            <span>The Beam for</span><br />
            <span style={S.gradText}>Model Context</span><br />
            <span>Protocol</span>
          </h1>
          <p style={S.heroSub}>
            <strong style={{ color: G.text, fontStyle: "normal" }}>BeamMCP</strong> is the fastest MCP gateway. Connect Claude, GPT-4, or any LLM to any tool via the Model Context Protocol — one integration, infinite reach.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", marginBottom: 44 }}>
            <a href="#features" style={S.btnPrimary}>⚡ Explore BeamMCP</a>
            <a href="#domain" style={S.btnGhost}>🔥 Domain For Sale</a>
          </div>

          {/* ── VISITOR COUNTER IN HERO ── */}
          {loaded && (
            <div style={{
              display: "inline-flex", gap: 24,
              background: "rgba(10,16,30,0.7)",
              border: `1px solid ${G.border}`, borderRadius: 16,
              padding: "18px 32px", backdropFilter: "blur(16px)",
              marginBottom: 36, flexWrap: "wrap", justifyContent: "center"
            }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ ...S.metricVal, fontSize: 36 }}>
                  <AnimNum value={visitors} />
                </div>
                <div style={{ fontSize: 9, color: G.muted, letterSpacing: 2, textTransform: "uppercase", marginTop: 4 }}>
                  👁 Total Visitors
                </div>
              </div>
              <div style={{ width: 1, background: G.border }} />
              <div style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 36, color: liked ? G.accent3 : G.text, lineHeight: 1 }}>
                  <AnimNum value={likes} />
                </div>
                <div style={{ fontSize: 9, color: G.muted, letterSpacing: 2, textTransform: "uppercase", marginTop: 4 }}>
                  ⭐ Stars Given
                </div>
              </div>
              <div style={{ width: 1, background: G.border }} />
              <button onClick={handleLike} style={{
                background: liked ? "rgba(240,165,0,0.15)" : "rgba(0,212,255,0.08)",
                border: `1px solid ${liked ? G.accent3 + "88" : G.accent + "44"}`,
                borderRadius: 10, padding: "8px 20px",
                cursor: liked ? "default" : "pointer",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                transition: "all 0.3s"
              }}>
                <span style={{ fontSize: 28, filter: liked ? `drop-shadow(0 0 8px ${G.accent3})` : "none" }}>
                  {liked ? "⭐" : "☆"}
                </span>
                <span style={{ fontSize: 9, color: liked ? G.accent3 : G.muted, letterSpacing: 1.5, textTransform: "uppercase" }}>
                  {liked ? "Starred!" : "Star this site"}
                </span>
              </button>
            </div>
          )}

          {/* metrics */}
          <div style={S.metricsBar}>
            {[["99.9%", "MCP Uptime SLA"], ["<8ms", "Context Latency"], ["500+", "MCP Connectors"], ["SOC2", "Certified"]].map(([v, l]) => (
              <div key={l} style={S.metricCell}>
                <div style={S.metricVal}>{v}</div>
                <div style={S.metricLabel}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={S.sectionAlt}>
        <div style={S.eyebrow}><span style={{ width: 24, height: 1, background: G.accent, display: "inline-block" }} />Platform Capabilities</div>
        <h2 style={S.sectionTitle}>Everything your MCP stack needs</h2>
        <div style={S.featGrid}>
          {features.map(f => (
            <div key={f.title} style={S.feat}>
              <div style={{ ...S.featIcon, background: f.bg }}>{f.icon}</div>
              <h3 style={S.featH3}>{f.title}</h3>
              <p style={S.featP}>{f.desc}</p>
              <span style={S.featTag}>{f.tag}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="protocol" style={S.section}>
        <div style={S.eyebrow}><span style={{ width: 24, height: 1, background: G.accent, display: "inline-block" }} />MCP Protocol Flow</div>
        <h2 style={S.sectionTitle}>From MCP request to tool action in milliseconds</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 0, maxWidth: 680 }}>
          {[
            ["01", "AI Model Sends an MCP Request", "Your LLM (Claude, GPT-4, Gemini) sends a structured Model Context Protocol request to BeamMCP's gateway endpoint."],
            ["02", "BeamMCP Authenticates via MCP", "The MCP gateway verifies permissions, applies rate limits, and routes the request to the correct MCP tool — in <1ms."],
            ["03", "MCP Tool Executes the Action", "The connected MCP server runs the action — DB query, API call, file read — and returns structured context through the Beam."],
            ["04", "Model Gets Full MCP Context", "Context flows back into the model's reasoning stream. Your AI responds with real-time, tool-augmented intelligence."],
          ].map(([num, title, desc]) => (
            <div key={num} style={{ display: "flex", gap: 24, paddingBottom: 36 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: "50%",
                  background: G.beam, display: "grid", placeItems: "center",
                  fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 13, color: "#fff"
                }}>{num}</div>
                {num !== "04" && <div style={{ width: 2, flex: 1, background: `linear-gradient(to bottom,${G.accent},${G.accent2})`, opacity: 0.25, marginTop: 6 }} />}
              </div>
              <div style={{ paddingTop: 8 }}>
                <h3 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 16, marginBottom: 6, letterSpacing: "-0.3px" }}>{title}</h3>
                <p style={{ fontSize: 12, color: G.muted, lineHeight: 1.8 }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" style={S.sectionAlt}>
        <div style={S.eyebrow}><span style={{ width: 24, height: 1, background: G.accent, display: "inline-block" }} />Plans</div>
        <h2 style={S.sectionTitle}>Simple MCP pricing for every scale</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 20, maxWidth: 980 }}>
          {[
            {
              name: "MCP Starter", price: "$0", period: "Free forever · No credit card",
              items: ["10,000 MCP calls/month", "5 MCP tool connectors", "Community support", "Basic MCP analytics"],
              btn: "Start Free", style: S.pCard,
              btnStyle: { border: `1px solid ${G.border}`, background: "transparent", color: G.text }
            },
            {
              name: "MCP Growth", price: "$79", period: "per month · billed annually",
              items: ["500,000 MCP calls/month", "Unlimited MCP connectors", "Priority MCP support", "Full observability suite", "Context caching", "SSO & team mgmt", "Custom MCP tools"],
              btn: "Start Free Trial", style: S.pCardFeat,
              btnStyle: { background: G.beam, color: "#fff", border: "none" }, badge: "Most Popular"
            },
            {
              name: "MCP Enterprise", price: "Custom", period: "Unlimited · SLA guaranteed",
              items: ["Unlimited MCP calls", "Private cloud deploy", "Dedicated MCP engineer", "Custom SLA & compliance", "SOC2 Type II reports"],
              btn: "Contact Sales", style: S.pCard,
              btnStyle: { border: `1px solid ${G.border}`, background: "transparent", color: G.text }
            },
          ].map(p => (
            <div key={p.name} style={p.style}>
              {p.badge && <div style={S.pBadge}>{p.badge}</div>}
              <div style={S.planName}>{p.name}</div>
              <div style={S.planPrice}>{p.price}</div>
              <div style={S.planPeriod}>{p.period}</div>
              <ul style={{ marginBottom: 24 }}>
                {p.items.map(i => (
                  <li key={i} style={{
                    fontSize: 12, color: G.muted, padding: "8px 0",
                    borderBottom: `1px solid ${G.border}`,
                    display: "flex", alignItems: "center", gap: 10
                  }}>
                    <span style={{ color: G.green, fontWeight: "bold", fontSize: 11 }}>✓</span>{i}
                  </li>
                ))}
              </ul>
              <button style={{
                ...p.btnStyle,
                fontFamily: "'Syne',sans-serif", fontWeight: 700,
                fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase",
                padding: "12px", borderRadius: 5, width: "100%"
              }}>{p.btn}</button>
            </div>
          ))}
        </div>
      </section>

      {/* ── DOMAIN FOR SALE ── */}
      <div id="domain" style={{ padding: "88px 0" }}>
        <div style={S.domainBlock}>
          <div style={{ maxWidth: 600, position: "relative", zIndex: 1 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "rgba(240,165,0,0.1)", border: "1px solid rgba(240,165,0,0.3)",
              color: G.accent3, fontSize: 10, letterSpacing: 2.5, textTransform: "uppercase",
              padding: "5px 14px", borderRadius: 100, marginBottom: 18
            }}>
              🔥 Premium Domain For Sale
            </div>
            <div style={S.dName}>
              Beam<span style={{ color: G.accent3 }}>MCP</span>.com
            </div>
            <p style={{ fontSize: 14, color: G.muted, lineHeight: 1.8, marginBottom: 22 }}>
              Own the defining brand in the <strong style={{ color: "#aab8d4" }}>Model Context Protocol (MCP)</strong> infrastructure space.{" "}
              <strong style={{ color: "#aab8d4" }}>BeamMCP.com</strong> is clean, memorable, and technically precise — perfectly timed as MCP becomes the universal AI standard.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {["🎯 MCP category leader", "⚡ Beam = speed", "🌍 Global .com", "📈 AI era timing", "🔒 Escrow protected"].map(r => (
                <span key={r} style={{
                  background: "rgba(240,165,0,0.07)", border: "1px solid rgba(240,165,0,0.2)",
                  color: "#c8960a", fontSize: 11, padding: "5px 12px", borderRadius: 4
                }}>{r}</span>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, minWidth: 260, position: "relative", zIndex: 1 }}>
            <div style={{ fontSize: 10, color: G.muted, letterSpacing: 1, textTransform: "uppercase" }}>Listed price</div>
            <div style={{
              fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 64,
              letterSpacing: "-3px", color: G.accent3, lineHeight: 1,
              textShadow: `0 0 40px ${G.accent3}44`
            }}>$4,800</div>
            <ul style={{ width: "100%" }}>
              {["Instant transfer via GoDaddy", "Full escrow protection", "Premium .com domain", "MCP + Beam = two trending keywords"].map(p => (
                <li key={p} style={{
                  fontSize: 12, color: G.muted, padding: "7px 0",
                  borderBottom: "1px solid #1a1500",
                  display: "flex", alignItems: "center", gap: 8
                }}>
                  <span style={{ color: G.accent3, fontSize: 9 }}>✦</span>{p}
                </li>
              ))}
            </ul>
            <a href="https://www.godaddy.com/domainsearch/find?domainToCheck=BeamMCP.com" target="_blank" rel="noopener" style={S.buyDomBtn}>
              🌐 Buy BeamMCP.com on GoDaddy
            </a>
            <div style={{ fontSize: 11, color: G.muted, display: "flex", alignItems: "center", gap: 6 }}>
              🔒 Secured by GoDaddy Domain Transfer
            </div>
          </div>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer style={S.footer}>
        <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 18 }}>
          Beam<span style={S.gradText}>MCP</span>
        </div>
        {loaded && (
          <div style={{ display: "flex", gap: 20, alignItems: "center", fontSize: 12, color: G.muted }}>
            <span>👁 <strong style={{ color: G.text }}>{visitors.toLocaleString()}</strong> visitors</span>
            <span>⭐ <strong style={{ color: G.accent3 }}>{likes.toLocaleString()}</strong> stars</span>
          </div>
        )}
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          {["MCP Docs", "GitHub", "Contact"].map(l => (
            <a key={l} href="#" style={{ fontSize: 11, color: G.muted }}>{l}</a>
          ))}
          <a href="https://www.godaddy.com/domainsearch/find?domainToCheck=BeamMCP.com" target="_blank" rel="noopener" style={{ fontSize: 11, color: G.accent3 }}>
            Buy Domain
          </a>
        </div>
      </footer>

      {/* ── FLOATING COUNTER WIDGET ── */}
      {loaded && (
        <CounterWidget visitors={visitors} likes={likes} liked={liked} onLike={handleLike} />
      )}
    </div>
  );
}
