import { useState, useEffect, useRef } from "react";

// ── Global CSS Reset + Responsive + Animations ─────────────
const GlobalReset = () => (
  <style>{`
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
    html, body, #root {
      margin: 0 !important; padding: 0 !important;
      width: 100%; min-height: 100vh; background: #050709;
      -webkit-text-size-adjust: 100%;
    }
    a { text-decoration: none; color: inherit; }
    ul { list-style: none; }
    button { cursor: pointer; font-family: inherit; }
    img { max-width: 100%; }

    /* ── Animations ── */
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(40px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes floatY {
      0%, 100% { transform: translateY(0px); }
      50%       { transform: translateY(-12px); }
    }
    @keyframes pulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(240,165,0,0.4); }
      50%       { box-shadow: 0 0 0 10px rgba(240,165,0,0); }
    }
    @keyframes gradShift {
      0%   { background-position: 0% 50%; }
      50%  { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    @keyframes glow {
      0%, 100% { opacity: 0.5; }
      50%       { opacity: 1; }
    }

    /* ── Scroll reveal ── */
    .reveal {
      opacity: 0;
      transform: translateY(32px);
      transition: opacity 0.7s ease, transform 0.7s ease;
    }
    .reveal.visible { opacity: 1; transform: translateY(0); }

    /* ── Hero animations ── */
    .hero-a1 { animation: fadeUp 0.9s 0.0s ease both; }
    .hero-a2 { animation: fadeUp 0.9s 0.15s ease both; }
    .hero-a3 { animation: fadeUp 0.9s 0.3s ease both; }
    .hero-a4 { animation: fadeUp 0.9s 0.45s ease both; }
    .hero-a5 { animation: fadeUp 0.9s 0.6s ease both; }

    /* ── Float card ── */
    .float-card { animation: floatY 5s ease-in-out infinite; }

    /* ── Pulse badge ── */
    .pulse-badge { animation: pulse 2.5s ease-in-out infinite; }

    /* ── Hover effects ── */
    .feat-card {
      transition: transform 0.3s ease, border-color 0.3s ease !important;
    }
    .feat-card:hover {
      transform: translateY(-5px) !important;
      border-color: rgba(0,212,255,0.35) !important;
    }
    .plan-card { transition: transform 0.3s ease; }
    .plan-card:hover { transform: translateY(-6px); }
    .buy-btn { transition: transform 0.25s ease, box-shadow 0.25s ease !important; }
    .buy-btn:hover {
      transform: scale(1.03) !important;
      box-shadow: 0 0 52px rgba(240,165,0,0.55) !important;
    }
    .nav-link { transition: color 0.2s; }
    .nav-link:hover { color: #00d4ff !important; }

    /* ── Mobile nav hamburger ── */
    .mob-menu {
      display: none;
      flex-direction: column;
      gap: 5px;
      cursor: pointer;
      padding: 4px;
    }
    .mob-menu span {
      display: block; width: 22px; height: 2px;
      background: #eaf1ff; border-radius: 2px;
      transition: all 0.3s;
    }

    /* ── Responsive breakpoints ── */

    /* Tablet */
    @media (max-width: 900px) {
      .feat-grid { grid-template-columns: repeat(2,1fr) !important; }
      .metrics-bar { grid-template-columns: repeat(2,1fr) !important; }
      .domain-block { flex-direction: column !important; padding: 40px 28px !important; }
      .nav-links { display: none !important; }
      .mob-menu { display: flex !important; }
      .nav-cta-desk { display: none !important; }
    }

    /* Mobile */
    @media (max-width: 600px) {
      .feat-grid { grid-template-columns: 1fr !important; }
      .metrics-bar { grid-template-columns: repeat(2,1fr) !important; }
      .hero-counter-inner { flex-direction: column !important; gap: 16px !important; padding: 18px 20px !important; }
      .hero-divider { display: none !important; }
      .pricing-grid { grid-template-columns: 1fr !important; }
      .footer-inner { flex-direction: column !important; align-items: flex-start !important; gap: 16px !important; }
      .banner-text { display: none !important; }
      .domain-buy-card { min-width: unset !important; width: 100% !important; }
      .section-title { font-size: 26px !important; }
      .hero-h1 { font-size: 38px !important; letter-spacing: -1.5px !important; }
      .section-pad { padding: 56px 5% !important; }
      .hero-pad { padding: 40px 5% 48px !important; }
    }
  `}</style>
);

// ── Scroll Reveal Hook ──────────────────────────────────────
function useScrollReveal() {
  useEffect(() => {
    const run = () => {
      const els = document.querySelectorAll(".reveal");
      const io = new IntersectionObserver(
        entries => entries.forEach(e => {
          if (e.isIntersecting) { e.target.classList.add("visible"); io.unobserve(e.target); }
        }),
        { threshold: 0.1 }
      );
      els.forEach(el => io.observe(el));
      return () => io.disconnect();
    };
    const t = setTimeout(run, 100);
    return () => clearTimeout(t);
  }, []);
}

// ── Storage helpers ─────────────────────────────────────────
async function getCount() {
  try { const r = await window.storage.get("beammcp-visitors", true); return r ? parseInt(r.value,10) : 0; } catch { return 0; }
}
async function setCount(n) { try { await window.storage.set("beammcp-visitors", String(n), true); } catch {} }
async function getLikes() {
  try { const r = await window.storage.get("beammcp-likes", true); return r ? parseInt(r.value,10) : 0; } catch { return 0; }
}
async function setLikesStorage(n) { try { await window.storage.set("beammcp-likes", String(n), true); } catch {} }
async function hasLiked() {
  try { const r = await window.storage.get("beammcp-liked-me", false); return r ? r.value === "1" : false; } catch { return false; }
}
async function markLiked() { try { await window.storage.set("beammcp-liked-me", "1", false); } catch {} }

// ── Floating counter widget ─────────────────────────────────
function CounterWidget({ visitors, likes, liked, onLike }) {
  const [pop, setPop] = useState(false);
  const handle = () => {
    if (liked) return;
    setPop(true); setTimeout(() => setPop(false), 600); onLike();
  };
  const box = {
    background: "rgba(10,16,30,0.95)", border: "1px solid #1e2d45",
    borderRadius: 12, padding: "9px 14px",
    display: "flex", alignItems: "center", gap: 9,
    backdropFilter: "blur(16px)", boxShadow: "0 8px 32px rgba(0,0,0,0.4)"
  };
  return (
    <div style={{ position:"fixed", bottom:20, right:16, zIndex:9000, display:"flex", flexDirection:"column", gap:8, alignItems:"flex-end" }}>
      <div style={box}>
        <span style={{ fontSize:15 }}>👁</span>
        <div>
          <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:16, background:"linear-gradient(135deg,#00d4ff,#7b5ea7)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", lineHeight:1 }}>{visitors.toLocaleString()}</div>
          <div style={{ fontSize:8, color:"#5a6a8a", letterSpacing:1.5, textTransform:"uppercase", marginTop:1 }}>Visitors</div>
        </div>
      </div>
      <button onClick={handle} style={{ ...box, background: liked ? "rgba(240,165,0,0.15)" : "rgba(10,16,30,0.95)", border: liked ? "1px solid #f0a500aa" : "1px solid #1e2d45", cursor: liked ? "default" : "pointer", transform: pop ? "scale(1.18)" : "scale(1)", transition:"all 0.3s" }}>
        <span style={{ fontSize:16, filter: liked ? "drop-shadow(0 0 6px #f0a500)" : "none" }}>{liked ? "⭐" : "☆"}</span>
        <div>
          <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:16, color: liked ? "#f0a500" : "#e8f0fe", lineHeight:1 }}>{likes.toLocaleString()}</div>
          <div style={{ fontSize:8, color:"#5a6a8a", letterSpacing:1.5, textTransform:"uppercase", marginTop:1 }}>{liked ? "Starred!" : "Star"}</div>
        </div>
      </button>
    </div>
  );
}

// ── Animated number ─────────────────────────────────────────
function AnimNum({ value }) {
  const [d, setD] = useState(0);
  useEffect(() => {
    if (!value) return;
    let s = 0;
    const step = () => { s += Math.ceil((value - s) / 8); setD(s); if (s < value) requestAnimationFrame(step); else setD(value); };
    requestAnimationFrame(step);
  }, [value]);
  return <>{d.toLocaleString()}</>;
}

// ── Mobile Nav ──────────────────────────────────────────────
function MobNav({ open, onClose, G }) {
  if (!open) return null;
  return (
    <div style={{
      position:"fixed", inset:0, zIndex:200,
      background:"rgba(5,7,9,0.97)", backdropFilter:"blur(24px)",
      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:32
    }}>
      <button onClick={onClose} style={{ position:"absolute", top:20, right:20, background:"none", border:"none", color:"#eaf1ff", fontSize:28, lineHeight:1 }}>✕</button>
      {["Features","Protocol","Pricing","Domain"].map(l => (
        <a key={l} href={`#${l.toLowerCase()}`} onClick={onClose} style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:28, color:"#eaf1ff", letterSpacing:"-0.5px" }}>{l}</a>
      ))}
      <a href="https://www.godaddy.com/domainsearch/find?domainToCheck=BeamMCP.com" target="_blank" rel="noopener" onClick={onClose}
        style={{ background:G.accent3, color:"#000", fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:14, letterSpacing:1, textTransform:"uppercase", border:"none", padding:"14px 32px", borderRadius:6, marginTop:8 }}>
        🌐 Buy Domain
      </a>
    </div>
  );
}

// ── Main ────────────────────────────────────────────────────
export default function BeamMCP() {
  const [visitors, setVisitors] = useState(0);
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const didCount = useRef(false);
  useScrollReveal();

  useEffect(() => {
    (async () => {
      let v = await getCount();
      const l = await getLikes();
      const hl = await hasLiked();
      if (!didCount.current) { didCount.current = true; v += 1; await setCount(v); }
      setVisitors(v); setLikes(l); setLiked(hl); setLoaded(true);
    })();
  }, []);

  const handleLike = async () => {
    const n = likes + 1; setLikes(n); setLiked(true);
    await setLikesStorage(n); await markLiked();
  };

  const G = {
    bg:"#050709", surface:"#0b0f1a", card:"#0f1522", border:"#1a2740",
    accent:"#00d4ff", accent2:"#7b5ea7", accent3:"#f0a500", green:"#00e5a0",
    text:"#eaf1ff", muted:"#5a6a8a",
    beam:"linear-gradient(135deg,#00d4ff 0%,#7b5ea7 55%,#f0a500 100%)",
  };

  const features = [
    { icon:"⚡", bg:"rgba(0,212,255,0.1)",   title:"Universal MCP Gateway",    desc:"One endpoint to route Model Context Protocol requests from any LLM to any system — databases, APIs, file systems.", tag:"MCP Core" },
    { icon:"🔐", bg:"rgba(0,229,160,0.1)",   title:"Zero-Trust MCP Security",  desc:"Every MCP context packet is signed, encrypted, and verified. Fine-grained permissions per model, tool, and user.", tag:"Security" },
    { icon:"📡", bg:"rgba(240,165,0,0.1)",   title:"Real-Time MCP Streaming",  desc:"Sub-8ms MCP context delivery via WebSocket and SSE. Your AI models never wait for context.", tag:"Performance" },
    { icon:"🧠", bg:"rgba(123,94,167,0.1)",  title:"Semantic Context Cache",   desc:"Intelligent caching reduces redundant MCP retrieval by up to 80%. Fewer tokens. Less latency.", tag:"Efficiency" },
    { icon:"🔌", bg:"rgba(0,212,255,0.1)",   title:"500+ MCP Connectors",      desc:"Pre-built connectors for GitHub, Slack, Notion, Postgres, Salesforce, Jira, Linear, and 490+ more.", tag:"Integrations" },
    { icon:"📊", bg:"rgba(0,229,160,0.1)",   title:"MCP Observability",        desc:"Full-stack tracing, MCP call histograms, per-tool analytics. Know exactly what your AI is doing.", tag:"Analytics" },
  ];

  return (
    <div style={{ background:G.bg, color:G.text, fontFamily:"'DM Mono',monospace", minHeight:"100vh", width:"100%", overflowX:"hidden", margin:0, padding:0 }}>
      <GlobalReset />
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400;500&display=swap" rel="stylesheet" />

      <MobNav open={menuOpen} onClose={() => setMenuOpen(false)} G={G} />

      {/* ── BANNER ── */}
      <div style={{ background:"linear-gradient(90deg,#0d0900,#1c1100 50%,#0d0900)", borderBottom:`1.5px solid ${G.accent3}55`, padding:"8px 20px", display:"flex", alignItems:"center", justifyContent:"center", gap:12, flexWrap:"wrap" }}>
        <span style={{ background:G.accent3, color:"#000", fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:9, letterSpacing:2, textTransform:"uppercase", padding:"3px 9px", borderRadius:2, flexShrink:0 }}>🔥 For Sale</span>
        <span className="banner-text" style={{ fontFamily:"'Syne',sans-serif", fontSize:11, fontWeight:600, color:G.accent3 }}>
          <strong>BeamMCP.com</strong> <span style={{ color:"#aab8d4", fontWeight:400 }}>— Premium MCP domain</span>
        </span>
        <a href="https://www.godaddy.com/domainsearch/find?domainToCheck=BeamMCP.com" target="_blank" rel="noopener"
          style={{ background:G.accent3, color:"#000", fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:10, letterSpacing:1, textTransform:"uppercase", border:"none", padding:"6px 14px", borderRadius:3, flexShrink:0, display:"inline-flex", alignItems:"center", gap:4 }}>
          🌐 Buy on GoDaddy
        </a>
      </div>

      {/* ── NAV ── */}
      <nav style={{ position:"sticky", top:0, zIndex:100, background:"rgba(5,7,9,0.95)", backdropFilter:"blur(20px)", borderBottom:`1px solid ${G.border}`, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"13px 5%" }}>
        <a href="#" style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:32, height:32, background:G.beam, borderRadius:8, display:"grid", placeItems:"center", flexShrink:0 }}>
            <svg viewBox="0 0 24 24" fill="white" width="16" height="16"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
          </div>
          <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:18, letterSpacing:"-0.8px" }}>
            Beam<span style={{ background:G.beam, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>MCP</span>
          </span>
        </a>

        {/* desktop links */}
        <div className="nav-links" style={{ display:"flex", gap:28, fontSize:11, letterSpacing:1.2, textTransform:"uppercase" }}>
          {["Features","Protocol","Pricing","Domain"].map(l => (
            <a key={l} href={`#${l.toLowerCase()}`} className="nav-link" style={{ color:G.muted }}>{l}</a>
          ))}
        </div>

        <a href="https://www.godaddy.com/domainsearch/find?domainToCheck=BeamMCP.com" target="_blank" rel="noopener" className="nav-cta-desk"
          style={{ background:"transparent", border:`1px solid ${G.accent}`, color:G.accent, fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:10, letterSpacing:1, textTransform:"uppercase", padding:"8px 16px", borderRadius:3 }}>
          Buy Domain →
        </a>

        {/* hamburger */}
        <div className="mob-menu" onClick={() => setMenuOpen(true)}>
          <span/><span/><span/>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="hero-pad" style={{ minHeight:"88vh", display:"flex", alignItems:"center", justifyContent:"center", padding:"60px 5%", position:"relative", overflow:"hidden", textAlign:"center" }}>
        {/* grid bg */}
        <div style={{ position:"absolute", inset:0, backgroundImage:`linear-gradient(${G.border} 1px,transparent 1px),linear-gradient(90deg,${G.border} 1px,transparent 1px)`, backgroundSize:"56px 56px", opacity:0.2 }} />
        {/* glow */}
        <div style={{ position:"absolute", top:"-8%", left:"50%", transform:"translateX(-50%)", width:"min(800px,140vw)", height:"400px", background:"radial-gradient(ellipse,#00d4ff18 0%,#7b5ea708 45%,transparent 70%)", pointerEvents:"none" }} />

        <div style={{ position:"relative", zIndex:2, maxWidth:860, width:"100%" }}>
          {/* badge */}
          <div className="hero-a1" style={{ display:"inline-flex", alignItems:"center", gap:7, background:"rgba(0,212,255,0.07)", border:`1px solid rgba(0,212,255,0.2)`, color:G.accent, fontSize:9, letterSpacing:2.5, textTransform:"uppercase", padding:"5px 16px", borderRadius:100, marginBottom:24 }}>
            <span style={{ width:6, height:6, background:G.green, borderRadius:"50%", boxShadow:`0 0 7px ${G.green}` }} />
            MCP · Model Context Protocol · AI Infrastructure
          </div>

          <h1 className="hero-a2 hero-h1" style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"clamp(36px,7vw,86px)", lineHeight:0.95, letterSpacing:"-2.5px", marginBottom:22 }}>
            <span>The Beam for</span><br/>
            <span style={{ background:G.beam, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>Model Context</span><br/>
            <span>Protocol</span>
          </h1>

          <p className="hero-a3" style={{ fontFamily:"Georgia,serif", fontStyle:"italic", color:G.muted, fontSize:"clamp(13px,1.8vw,17px)", lineHeight:1.8, maxWidth:580, margin:"0 auto 36px" }}>
            <strong style={{ color:G.text, fontStyle:"normal" }}>BeamMCP</strong> is the fastest MCP gateway. Connect Claude, GPT-4, or any LLM to any tool via the Model Context Protocol — one integration, infinite reach.
          </p>

          <div className="hero-a3" style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap", marginBottom:36 }}>
            <a href="#features" style={{ background:G.beam, color:"#fff", fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:11, letterSpacing:1, textTransform:"uppercase", border:"none", padding:"13px 24px", borderRadius:4, display:"inline-flex", alignItems:"center", gap:7, boxShadow:"0 0 24px rgba(0,212,255,0.2)" }}>⚡ Explore BeamMCP</a>
            <a href="#domain" style={{ background:"transparent", color:G.text, fontFamily:"'Syne',sans-serif", fontWeight:600, fontSize:11, letterSpacing:1, textTransform:"uppercase", border:`1px solid ${G.border}`, padding:"13px 24px", borderRadius:4, display:"inline-flex", alignItems:"center", gap:7 }}>🔥 Domain For Sale</a>
          </div>

          {/* visitor counter */}
          {loaded && (
            <div className="hero-a4 hero-counter-inner" style={{ display:"inline-flex", gap:20, background:"rgba(10,16,30,0.7)", border:`1px solid ${G.border}`, borderRadius:14, padding:"16px 28px", backdropFilter:"blur(16px)", marginBottom:32, flexWrap:"wrap", justifyContent:"center", alignItems:"center" }}>
              <div style={{ textAlign:"center" }}>
                <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:32, background:G.beam, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", lineHeight:1 }}><AnimNum value={visitors}/></div>
                <div style={{ fontSize:8, color:G.muted, letterSpacing:2, textTransform:"uppercase", marginTop:3 }}>👁 Total Visitors</div>
              </div>
              <div className="hero-divider" style={{ width:1, height:40, background:G.border }} />
              <div style={{ textAlign:"center" }}>
                <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:32, color: liked ? G.accent3 : G.text, lineHeight:1 }}><AnimNum value={likes}/></div>
                <div style={{ fontSize:8, color:G.muted, letterSpacing:2, textTransform:"uppercase", marginTop:3 }}>⭐ Stars Given</div>
              </div>
              <div className="hero-divider" style={{ width:1, height:40, background:G.border }} />
              <button onClick={handleLike} style={{ background: liked ? "rgba(240,165,0,0.15)" : "rgba(0,212,255,0.08)", border:`1px solid ${liked ? G.accent3+"88" : G.accent+"44"}`, borderRadius:10, padding:"8px 18px", cursor: liked ? "default" : "pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:3, transition:"all 0.3s" }}>
                <span style={{ fontSize:26, filter: liked ? `drop-shadow(0 0 8px ${G.accent3})` : "none" }}>{liked ? "⭐" : "☆"}</span>
                <span style={{ fontSize:8, color: liked ? G.accent3 : G.muted, letterSpacing:1.5, textTransform:"uppercase" }}>{liked ? "Starred!" : "Star this site"}</span>
              </button>
            </div>
          )}

          {/* metrics */}
          <div className="hero-a5 metrics-bar" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:1, background:G.border, borderRadius:10, overflow:"hidden", border:`1px solid ${G.border}`, marginTop:8 }}>
            {[["99.9%","MCP Uptime SLA"],["<8ms","Context Latency"],["500+","MCP Connectors"],["SOC2","Certified"]].map(([v,l]) => (
              <div key={l} style={{ background:G.card, padding:"18px 10px", textAlign:"center" }}>
                <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"clamp(18px,3vw,28px)", background:G.beam, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", letterSpacing:"-1px" }}>{v}</div>
                <div style={{ fontSize:8, color:G.muted, letterSpacing:1.5, textTransform:"uppercase", marginTop:3 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="section-pad" style={{ padding:"80px 5%", background:G.surface }}>
        <div className="reveal" style={{ fontSize:10, letterSpacing:3, textTransform:"uppercase", color:G.accent, marginBottom:10, display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ width:22, height:1, background:G.accent, display:"inline-block" }} />Platform Capabilities
        </div>
        <h2 className="reveal section-title" style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"clamp(24px,4vw,44px)", letterSpacing:"-2px", lineHeight:1.05, maxWidth:640, marginBottom:44 }}>
          Everything your MCP stack needs
        </h2>
        <div className="feat-grid" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:1, background:G.border, borderRadius:12, overflow:"hidden", border:`1px solid ${G.border}` }}>
          {features.map(f => (
            <div key={f.title} className="reveal feat-card" style={{ background:G.card, padding:"28px 22px" }}>
              <div style={{ width:44, height:44, borderRadius:11, background:f.bg, display:"grid", placeItems:"center", fontSize:20, marginBottom:16 }}>{f.icon}</div>
              <h3 style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:14, letterSpacing:"-0.2px", marginBottom:7 }}>{f.title}</h3>
              <p style={{ fontSize:12, color:G.muted, lineHeight:1.8 }}>{f.desc}</p>
              <span style={{ display:"inline-block", marginTop:10, fontSize:9, letterSpacing:1.5, textTransform:"uppercase", color:G.accent, background:"rgba(0,212,255,0.08)", border:"1px solid rgba(0,212,255,0.15)", borderRadius:3, padding:"3px 7px" }}>{f.tag}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── PROTOCOL ── */}
      <section id="protocol" className="section-pad" style={{ padding:"80px 5%" }}>
        <div className="reveal" style={{ fontSize:10, letterSpacing:3, textTransform:"uppercase", color:G.accent, marginBottom:10, display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ width:22, height:1, background:G.accent, display:"inline-block" }} />MCP Protocol Flow
        </div>
        <h2 className="reveal section-title" style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"clamp(24px,4vw,44px)", letterSpacing:"-2px", lineHeight:1.05, maxWidth:640, marginBottom:44 }}>
          From MCP request to tool action in milliseconds
        </h2>
        <div style={{ display:"flex", flexDirection:"column", maxWidth:660 }}>
          {[
            ["01","AI Model Sends an MCP Request","Your LLM (Claude, GPT-4, Gemini) sends a structured Model Context Protocol request to BeamMCP's gateway endpoint."],
            ["02","BeamMCP Authenticates via MCP","The MCP gateway verifies permissions, applies rate limits, and routes the request to the correct MCP tool — in <1ms."],
            ["03","MCP Tool Executes the Action","The connected MCP server runs the action — DB query, API call, file read — and returns structured context through the Beam."],
            ["04","Model Gets Full MCP Context","Context flows back into the model's reasoning stream. Your AI responds with real-time, tool-augmented intelligence."],
          ].map(([num,title,desc]) => (
            <div key={num} className="reveal" style={{ display:"flex", gap:20, paddingBottom:32 }}>
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", flexShrink:0 }}>
                <div style={{ width:38, height:38, borderRadius:"50%", background:G.beam, display:"grid", placeItems:"center", fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:12, color:"#fff", flexShrink:0 }}>{num}</div>
                {num !== "04" && <div style={{ width:2, flex:1, background:`linear-gradient(to bottom,${G.accent},${G.accent2})`, opacity:0.22, marginTop:5 }} />}
              </div>
              <div style={{ paddingTop:7 }}>
                <h3 style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:15, marginBottom:5, letterSpacing:"-0.2px" }}>{title}</h3>
                <p style={{ fontSize:12, color:G.muted, lineHeight:1.8 }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="section-pad" style={{ padding:"80px 5%", background:G.surface }}>
        <div className="reveal" style={{ fontSize:10, letterSpacing:3, textTransform:"uppercase", color:G.accent, marginBottom:10, display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ width:22, height:1, background:G.accent, display:"inline-block" }} />Plans
        </div>
        <h2 className="reveal section-title" style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"clamp(24px,4vw,44px)", letterSpacing:"-2px", lineHeight:1.05, maxWidth:640, marginBottom:44 }}>
          Simple MCP pricing for every scale
        </h2>
        <div className="pricing-grid" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))", gap:18, maxWidth:960 }}>
          {[
            { name:"MCP Starter", price:"$0", period:"Free forever · No credit card", items:["10,000 MCP calls/month","5 MCP tool connectors","Community support","Basic MCP analytics"], btn:"Start Free", featured:false },
            { name:"MCP Growth", price:"$79", period:"per month · billed annually", items:["500,000 MCP calls/month","Unlimited MCP connectors","Priority MCP support","Full observability suite","Context caching","SSO & team mgmt","Custom MCP tools"], btn:"Start Free Trial", featured:true, badge:"Most Popular" },
            { name:"MCP Enterprise", price:"Custom", period:"Unlimited · SLA guaranteed", items:["Unlimited MCP calls","Private cloud deploy","Dedicated MCP engineer","Custom SLA & compliance","SOC2 Type II reports"], btn:"Contact Sales", featured:false },
          ].map(p => (
            <div key={p.name} className="reveal plan-card" style={{ background: p.featured ? "linear-gradient(145deg,#0a1828,#0f1522)" : G.card, border:`1px solid ${p.featured ? G.accent : G.border}`, borderRadius:12, padding:"30px 22px", position:"relative", boxShadow: p.featured ? "0 0 40px rgba(0,212,255,0.1)" : "none" }}>
              {p.badge && <div style={{ position:"absolute", top:-11, left:"50%", transform:"translateX(-50%)", background:G.beam, color:"#fff", fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:8, letterSpacing:2, textTransform:"uppercase", padding:"3px 12px", borderRadius:100, whiteSpace:"nowrap" }}>{p.badge}</div>}
              <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:10, letterSpacing:2.5, textTransform:"uppercase", color:G.muted, marginBottom:16 }}>{p.name}</div>
              <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:46, letterSpacing:"-2.5px", lineHeight:1, marginBottom:3 }}>{p.price}</div>
              <div style={{ fontSize:11, color:G.muted, marginBottom:22 }}>{p.period}</div>
              <ul style={{ marginBottom:22 }}>
                {p.items.map(i => (
                  <li key={i} style={{ fontSize:12, color:G.muted, padding:"7px 0", borderBottom:`1px solid ${G.border}`, display:"flex", alignItems:"center", gap:9 }}>
                    <span style={{ color:G.green, fontWeight:"bold", fontSize:11 }}>✓</span>{i}
                  </li>
                ))}
              </ul>
              <button style={{ background: p.featured ? G.beam : "transparent", color: p.featured ? "#fff" : G.text, border: p.featured ? "none" : `1px solid ${G.border}`, fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:11, letterSpacing:1.5, textTransform:"uppercase", padding:"11px", borderRadius:5, width:"100%" }}>{p.btn}</button>
            </div>
          ))}
        </div>
      </section>

      {/* ── DOMAIN FOR SALE ── */}
      <div id="domain" style={{ padding:"80px 0" }}>
        <div className="domain-block" style={{ margin:"0 5%", background:"linear-gradient(135deg,#0e0800,#1a1100 50%,#0e0800)", border:`1px solid ${G.accent3}33`, borderRadius:18, padding:"52px 44px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:36, flexWrap:"wrap", position:"relative", overflow:"hidden" }}>
          {/* bg orb */}
          <div style={{ position:"absolute", top:"-50px", right:"-50px", width:280, height:280, borderRadius:"50%", background:"radial-gradient(circle,rgba(240,165,0,0.12) 0%,transparent 70%)", pointerEvents:"none", zIndex:0 }} />

          {/* LEFT */}
          <div className="reveal" style={{ maxWidth:560, position:"relative", zIndex:1, flex:"1 1 280px" }}>
            <div className="pulse-badge" style={{ display:"inline-flex", alignItems:"center", gap:7, background:"rgba(240,165,0,0.1)", border:"1px solid rgba(240,165,0,0.4)", color:G.accent3, fontSize:9, letterSpacing:2.5, textTransform:"uppercase", padding:"5px 14px", borderRadius:100, marginBottom:18 }}>
              🔥 Premium Domain For Sale
            </div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"clamp(34px,5.5vw,64px)", letterSpacing:"-2.5px", color:"#fff", lineHeight:0.95, marginBottom:14 }}>
              Beam<span style={{ color:G.accent3 }}>MCP</span>.com
            </div>
            <p style={{ fontSize:13, color:G.muted, lineHeight:1.9, marginBottom:22 }}>
              Own the defining brand in the{" "}
              <strong style={{ color:"#c8d8f4" }}>Model Context Protocol (MCP)</strong> infrastructure space.{" "}
              <strong style={{ color:"#c8d8f4" }}>BeamMCP.com</strong> is clean, memorable, and technically precise — perfectly timed as MCP becomes the universal AI standard.
            </p>
            <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
              {["🎯 MCP category leader","⚡ Beam = speed","🌍 Global .com","📈 AI era timing","🔒 Escrow protected"].map(r => (
                <span key={r} style={{ background:"rgba(240,165,0,0.07)", border:"1px solid rgba(240,165,0,0.22)", color:"#c8960a", fontSize:10, padding:"5px 11px", borderRadius:5 }}>{r}</span>
              ))}
            </div>
          </div>

          {/* RIGHT — buy card */}
          <div className="float-card reveal domain-buy-card" style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:14, minWidth:260, position:"relative", zIndex:1, background:"rgba(15,10,0,0.75)", border:"1px solid rgba(240,165,0,0.25)", borderRadius:18, padding:"32px 24px", backdropFilter:"blur(20px)", boxShadow:"0 20px 60px rgba(0,0,0,0.5)", flex:"0 0 auto" }}>
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:20, color:G.accent3, letterSpacing:"-0.8px", textAlign:"center" }}>BeamMCP.com</div>
            <div style={{ width:"100%", height:1, background:"rgba(240,165,0,0.15)" }} />
            <ul style={{ width:"100%" }}>
              {["Instant transfer via GoDaddy","Full escrow protection","Premium .com domain","MCP + Beam trending keywords"].map(item => (
                <li key={item} style={{ fontSize:12, color:G.muted, padding:"7px 0", borderBottom:"1px solid rgba(240,165,0,0.08)", display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ color:G.accent3, fontSize:9 }}>✦</span>{item}
                </li>
              ))}
            </ul>
            <a href="https://www.godaddy.com/domainsearch/find?domainToCheck=BeamMCP.com" target="_blank" rel="noopener" className="buy-btn"
              style={{ background:G.accent3, color:"#000", fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:13, letterSpacing:1.5, textTransform:"uppercase", border:"none", padding:"15px 28px", borderRadius:6, display:"flex", alignItems:"center", justifyContent:"center", gap:7, boxShadow:"0 0 32px rgba(240,165,0,0.28)", width:"100%", textDecoration:"none" }}>
              🌐 Buy on GoDaddy
            </a>
            <div style={{ fontSize:10, color:G.muted, display:"flex", alignItems:"center", gap:5 }}>🔒 Secured via GoDaddy Escrow</div>
          </div>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop:`1px solid ${G.border}`, padding:"36px 5%" }}>
        <div className="footer-inner" style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:16 }}>
          <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:17 }}>
            Beam<span style={{ background:G.beam, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>MCP</span>
          </div>
          {loaded && (
            <div style={{ display:"flex", gap:16, alignItems:"center", fontSize:12, color:G.muted }}>
              <span>👁 <strong style={{ color:G.text }}>{visitors.toLocaleString()}</strong> visitors</span>
              <span>⭐ <strong style={{ color:G.accent3 }}>{likes.toLocaleString()}</strong> stars</span>
            </div>
          )}
          <div style={{ display:"flex", gap:18, flexWrap:"wrap" }}>
            {["MCP Docs","GitHub","Contact"].map(l => (
              <a key={l} href="#" style={{ fontSize:11, color:G.muted }}>{l}</a>
            ))}
            <a href="https://www.godaddy.com/domainsearch/find?domainToCheck=BeamMCP.com" target="_blank" rel="noopener" style={{ fontSize:11, color:G.accent3 }}>Buy Domain</a>
          </div>
        </div>
      </footer>

      {/* ── FLOATING WIDGET ── */}
      {loaded && <CounterWidget visitors={visitors} likes={likes} liked={liked} onLike={handleLike} />}
    </div>
  );
}
