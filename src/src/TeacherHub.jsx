import { useState, useEffect, useRef } from "react";

/* ════════════════════════════════════════════════════════════════
   BROWNIE BEAR ACADEMY — TEACHER HUB
   Core build: Today Dashboard + Observation System
   Brand palette drawn from the Brownie Bear Academy logo:
   soft sage, warm cream, gentle brown, dusty blue, soft yellow, terracotta
   ════════════════════════════════════════════════════════════════ */

/* Live palette — mutated by applyTheme(themeKey). JSX reads from here directly. */
const c = {
  sage:    "#8BA678",
  sageDk:  "#6B8659",
  sageLt:  "#E8EEDF",
  cream:   "#FDF8EF",
  paper:   "#F7F0E1",
  brown:   "#6E4A2F",
  brownLt: "#A8855F",
  ink:     "#4A3826",
  blue:    "#9BB8CE",
  blueLt:  "#E4EDF3",
  yellow:  "#F0C572",
  yellowLt:"#FBF0D6",
  terra:   "#C8765A",
  terraLt: "#F3DDD3",
  blush:   "#E8B4A0",
  white:   "#FFFFFF",
  line:    "#E7DEC9",
};
const applyTheme = (key) => {
  const t = THEMES[key] || THEMES.sage;
  Object.keys(c).forEach(k => { if (t[k] !== undefined) c[k] = t[k]; });
};

const FONT_DISPLAY = "'Georgia', 'Times New Roman', serif";
const FONT_BODY = "'Trebuchet MS', 'Segoe UI', sans-serif";

/* ─── Responsive hook — drives tablet/laptop layouts ────────────── */
function useViewport() {
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 1024);
  useEffect(() => {
    const onR = () => setW(window.innerWidth);
    window.addEventListener("resize", onR);
    return () => window.removeEventListener("resize", onR);
  }, []);
  return {
    w,
    isPhone: w < 640,           // narrow / phone
    isTabletPortrait: w >= 640 && w < 900,
    isCompact: w < 900,         // phone + tablet portrait — stack columns
    isLaptop: w >= 900,
  };
}

/* ─── Assessment stages — defaults; teachers can customise via Manage ─ */
const DEFAULT_STAGES = [
  { key: 0, label: "Not yet",    short: "—",  color: "#D8CFBC", desc: "No evidence recorded yet." },
  { key: 1, label: "Emerging",   short: "E",  color: "#E8B4A0", desc: "Beginning to show this with support." },
  { key: 2, label: "Developing", short: "D",  color: "#F0C572", desc: "Showing this more often, growing in confidence." },
  { key: 3, label: "Secure",     short: "S",  color: "#8BA678", desc: "Confident and consistent across contexts." },
  { key: 4, label: "Embedded",   short: "Em", color: "#6B8659", desc: "Deeply established — applies it independently and creatively." },
];
let STAGES_REGISTRY = DEFAULT_STAGES;
const syncStages = (custom) => {
  if (custom && Array.isArray(custom) && custom.length >= 2) {
    // Re-key so key === array index
    STAGES_REGISTRY = custom.map((s, i) => ({ ...s, key: i }));
  } else {
    STAGES_REGISTRY = DEFAULT_STAGES;
  }
};
const liveStages = () => STAGES_REGISTRY;
const stageOf = (k) => STAGES_REGISTRY[k] || STAGES_REGISTRY[0];

/* Preset stage scales teachers can swap in with one tap */
const STAGE_PRESETS = {
  default: { name: "Emerging → Embedded", stages: DEFAULT_STAGES },
  growing: { name: "Beginning → Embedded", stages: [
    { key: 0, label: "Not yet",   short: "—",  color: "#D8CFBC", desc: "No evidence yet." },
    { key: 1, label: "Beginning", short: "B",  color: "#E8B4A0", desc: "Just starting." },
    { key: 2, label: "Growing",   short: "G",  color: "#F0C572", desc: "Showing more often." },
    { key: 3, label: "Confident", short: "C",  color: "#8BA678", desc: "Confident across contexts." },
    { key: 4, label: "Embedded",  short: "Em", color: "#6B8659", desc: "Independent and creative." },
  ]},
  frequency: { name: "Not yet → Consistent", stages: [
    { key: 0, label: "Not yet",     short: "—",  color: "#D8CFBC", desc: "Not observed." },
    { key: 1, label: "Sometimes",   short: "S",  color: "#E8B4A0", desc: "Occasionally." },
    { key: 2, label: "Often",       short: "O",  color: "#F0C572", desc: "Frequently." },
    { key: 3, label: "Consistent",  short: "C",  color: "#8BA678", desc: "Almost always." },
  ]},
  scale5: { name: "1 to 5 scale", stages: [
    { key: 0, label: "0",  short: "0", color: "#D8CFBC", desc: "Not assessed." },
    { key: 1, label: "1",  short: "1", color: "#E8B4A0", desc: "" },
    { key: 2, label: "2",  short: "2", color: "#F4C57A", desc: "" },
    { key: 3, label: "3",  short: "3", color: "#F0C572", desc: "" },
    { key: 4, label: "4",  short: "4", color: "#8BA678", desc: "" },
    { key: 5, label: "5",  short: "5", color: "#6B8659", desc: "" },
  ]},
  simple: { name: "Working on it → Got it", stages: [
    { key: 0, label: "Not yet",       short: "—", color: "#D8CFBC", desc: "" },
    { key: 1, label: "Working on it", short: "W", color: "#F0C572", desc: "" },
    { key: 2, label: "Got it!",       short: "✓", color: "#8BA678", desc: "" },
  ]},
};

/* ─── Themes — teachers personalise the whole look from Manage ────── */
const THEMES = {
  sage: {
    name: "Sage", desc: "Calm sage & cream",
    sage: "#8BA678", sageDk: "#6B8659", sageLt: "#E8EEDF",
    cream: "#FDF8EF", paper: "#F7F0E1", brown: "#6E4A2F", brownLt: "#A8855F",
    ink: "#4A3826", blue: "#9BB8CE", blueLt: "#E4EDF3",
    yellow: "#F0C572", yellowLt: "#FBF0D6",
    terra: "#C8765A", terraLt: "#F3DDD3", blush: "#E8B4A0",
    white: "#FFFFFF", line: "#E7DEC9",
  },
  sand: {
    name: "Sand", desc: "Warm sandy neutrals",
    sage: "#B89968", sageDk: "#8E7345", sageLt: "#F1E6CC",
    cream: "#FBF4E4", paper: "#F2E7CC", brown: "#6B4A2A", brownLt: "#A0825D",
    ink: "#4A3826", blue: "#B4A485", blueLt: "#EBE3D1",
    yellow: "#E8B868", yellowLt: "#F5E5BD",
    terra: "#C28760", terraLt: "#F0D7C5", blush: "#DDB390",
    white: "#FFFFFF", line: "#E5D8BD",
  },
  cocoa: {
    name: "Cocoa", desc: "Cosy chocolate browns",
    sage: "#9D7B5A", sageDk: "#704F32", sageLt: "#EBDCC8",
    cream: "#FAF1E2", paper: "#EFDFC6", brown: "#5C3A1F", brownLt: "#8E6A47",
    ink: "#3D2618", blue: "#A99078", blueLt: "#E5D8C5",
    yellow: "#D9A85F", yellowLt: "#F0E0BE",
    terra: "#B5694A", terraLt: "#EDD0BE", blush: "#D9A487",
    white: "#FFFFFF", line: "#DFCEB4",
  },
  peach: {
    name: "Muted Peach", desc: "Soft, dusty peach",
    sage: "#C58A75", sageDk: "#9D6353", sageLt: "#F5DBCF",
    cream: "#FDF4ED", paper: "#F7E2D5", brown: "#6E4231", brownLt: "#A57563",
    ink: "#4A2A1E", blue: "#B49EA0", blueLt: "#EADFE0",
    yellow: "#E8B07A", yellowLt: "#F6DEC2",
    terra: "#B26452", terraLt: "#EDD0C2", blush: "#E3A48B",
    white: "#FFFFFF", line: "#EBD4C2",
  },
  dusty: {
    name: "Dusty Blue", desc: "Cool, peaceful blues",
    sage: "#7A9BB5", sageDk: "#536F87", sageLt: "#D8E4EE",
    cream: "#F6F8FB", paper: "#E5ECF2", brown: "#3D5160", brownLt: "#778A9A",
    ink: "#2E3D49", blue: "#9BB8CE", blueLt: "#E4EDF3",
    yellow: "#D7B98C", yellowLt: "#F0E2C9",
    terra: "#A77B6B", terraLt: "#E8D5CC", blush: "#C4A5A0",
    white: "#FFFFFF", line: "#D5DDE5",
  },
  forest: {
    name: "Forest Calm", desc: "Deep, grounding green",
    sage: "#6B8E5C", sageDk: "#48663C", sageLt: "#DCE5D2",
    cream: "#F5F4EA", paper: "#E5E5D2", brown: "#3F4A2F", brownLt: "#7A856A",
    ink: "#2D3624", blue: "#88A088", blueLt: "#DCE6DA",
    yellow: "#C9B070", yellowLt: "#EAE0BE",
    terra: "#8E6A4C", terraLt: "#DACFC0", blush: "#B8A088",
    white: "#FFFFFF", line: "#D5D5BD",
  },
};

const DENSITY = {
  compact: { name: "Compact", scale: 0.92, pad: 14 },
  calm:    { name: "Calm",    scale: 1.00, pad: 18 },
  large:   { name: "Large",   scale: 1.10, pad: 22 },
};

/* ─── Storage helpers (persist across sessions) ─────────────────── */
const store = {
  async get(key, fallback) {
    try {
      const r = await window.storage.get(key);
      return r ? JSON.parse(r.value) : fallback;
    } catch { return fallback; }
  },
  async set(key, value) {
    try { await window.storage.set(key, JSON.stringify(value)); } catch {}
  },
};

/* ─── Bear mark (simple, calm, on-brand) ────────────────────────── */
const BearMark = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <ellipse cx="17" cy="20" rx="7.5" ry="8" fill="#B68A5E" />
    <ellipse cx="47" cy="20" rx="7.5" ry="8" fill="#B68A5E" />
    <ellipse cx="17" cy="20" rx="3.5" ry="4" fill="#D9B98C" />
    <ellipse cx="47" cy="20" rx="3.5" ry="4" fill="#D9B98C" />
    <ellipse cx="32" cy="37" rx="18" ry="19" fill="#B68A5E" />
    <ellipse cx="32" cy="42" rx="11" ry="10" fill="#E4CBA4" />
    <circle cx="25.5" cy="33" r="2.6" fill="#3D2A1A" />
    <circle cx="38.5" cy="33" r="2.6" fill="#3D2A1A" />
    <circle cx="26.4" cy="32.2" r="0.9" fill="#fff" />
    <circle cx="39.4" cy="32.2" r="0.9" fill="#fff" />
    <ellipse cx="32" cy="39" rx="3.2" ry="2.4" fill="#3D2A1A" />
    <circle cx="21" cy="39" r="3" fill="#E8B4A0" opacity="0.55" />
    <circle cx="43" cy="39" r="3" fill="#E8B4A0" opacity="0.55" />
    {/* graduation cap */}
    <polygon points="32,6 50,13 32,20 14,13" fill={c.terra} />
    <rect x="29" y="16" width="6" height="5" fill="#4D3320" opacity="0.25" />
    <line x1="50" y1="13" x2="50" y2="22" stroke={c.yellow} strokeWidth="1.5" />
    <circle cx="50" cy="23" r="1.8" fill={c.yellow} />
  </svg>
);

/* ─── Developmental pathways (original BBA framework) ───────────── */
const PATHWAYS = [
  { id: "emotional",  label: "Emotional Security",        color: c.blush,  icon: "💛" },
  { id: "language",   label: "Communication & Language",  color: c.blue,   icon: "💬" },
  { id: "fineMotor",  label: "Fine Motor Foundations",    color: c.terra,  icon: "✋" },
  { id: "grossMotor", label: "Gross Motor Confidence",    color: c.sage,   icon: "🤸" },
  { id: "literacy",   label: "Early Literacy Readiness",  color: c.yellow, icon: "📖" },
  { id: "sound",      label: "Sound & Symbol Awareness",  color: c.brownLt,icon: "🔤" },
  { id: "social",     label: "Social Confidence",         color: c.blue,   icon: "🤝" },
  { id: "curiosity",  label: "Curiosity & Inquiry",       color: c.sage,   icon: "🔍" },
  { id: "creative",   label: "Creative Expression",       color: c.terra,  icon: "🎨" },
  { id: "independence",label:"Independence & Self-Help",  color: c.yellow, icon: "🌟" },
  { id: "problem",    label: "Problem Solving",           color: c.brownLt,icon: "🧩" },
  { id: "regulation", label: "Regulation & Resilience",   color: c.blush,  icon: "🌈" },
];

/* ─── Quick-tag observation skills per pathway (defaults) ───────── */
const QUICK_SKILLS = {
  emotional:   ["settled at drop-off","sought comfort appropriately","showed pride in work","separated confidently"],
  language:    ["used new vocabulary","spoke in full sentence","listened & responded","asked a question"],
  fineMotor:   ["used pincer grip","controlled scissors","threaded beads","drew with intent"],
  grossMotor:  ["climbed with confidence","balanced steadily","threw / caught","ran & changed direction"],
  literacy:    ["recognised own name","handled book correctly","made marks with meaning","retold a story"],
  sound:       ["heard initial sound","clapped syllables","noticed rhyme","linked sound to letter"],
  social:      ["played cooperatively","took turns","resolved a conflict","invited a friend in"],
  curiosity:   ["investigated independently","asked 'why'","explored new material","made a prediction"],
  creative:    ["created representational art","used imagination in play","explored colour / texture","made music"],
  independence:["dressed independently","tidied up","poured own drink","managed toileting"],
  problem:     ["tried multiple solutions","used trial & error","sequenced steps","sorted / classified"],
  regulation:  ["used calming strategy","waited patiently","coped with change","named a feeling"],
};

/* ─── Live registries — teacher edits flow through these so every
   pathway lookup reflects custom names, custom pathways, hidden
   defaults, custom skills and custom order — without threading props
   through every component. The root keeps them in sync with state. */
const REGISTRY = {
  labels: {},   // { [pathwayId]: "Custom name" }
  skills: {},   // { [pathwayId]: ["skill", ...] }
  custom: [],   // [{ id, label, color, icon }, ...] teacher-added pathways
  hidden: {},   // { [pathwayId]: true } default pathways the teacher turned off
  order: null,  // [pathwayId, ...] optional custom order; null = default order
};
const syncRegistry = (state) => {
  REGISTRY.labels = state.labels || {};
  REGISTRY.skills = state.skills || {};
  REGISTRY.custom = state.custom || [];
  REGISTRY.hidden = state.hidden || {};
  REGISTRY.order  = state.order || null;
};

/* All available pathway base objects (defaults + custom), keyed lookup */
const allPathwayBases = () => [...PATHWAYS, ...REGISTRY.custom];

const pathway = (id) => {
  const base = allPathwayBases().find(p => p.id === id) || PATHWAYS[0];
  const custom = REGISTRY.labels[base.id];
  return custom ? { ...base, label: custom } : base;
};

/* The active, visible, ordered pathway list — what users see everywhere */
const livePathways = () => {
  const all = allPathwayBases();
  const visible = all.filter(p => !REGISTRY.hidden[p.id]);
  if (REGISTRY.order) {
    const ordered = REGISTRY.order
      .map(id => visible.find(p => p.id === id))
      .filter(Boolean);
    const rest = visible.filter(p => !REGISTRY.order.includes(p.id));
    return [...ordered, ...rest].map(p => pathway(p.id));
  }
  return visible.map(p => pathway(p.id));
};

const getSkills = (pid) => REGISTRY.skills[pid] || QUICK_SKILLS[pid] || [];

/* Palette of colour + icon options when adding a new pathway */
const PATHWAY_COLORS = [
  c.sage, c.terra, c.blue, c.yellow, c.blush, c.brown, c.brownLt,
  "#A89BC7", "#7FA88E", "#D89B7B", "#8FB3CB", "#C9A86B", "#B07A8E",
];
const PATHWAY_ICONS = [
  "🌱","🌟","🌈","🌿","🌸","🌳","☀️","🌙","🦋","🐝",
  "🎵","🎨","🎭","📚","✏️","🧩","🔍","🔬","🧮","🗝️",
  "💛","💬","✋","🤸","📖","🔤","🤝","🌼","🎯","🎲",
];

/* ─── Seed children (teacher can edit/add) ──────────────────────── */
const SEED_CHILDREN = [
  { id: "c1", name: "Ava Whitlock",   dob: "2021-03-14", keyPerson: true,  interests: ["dinosaurs","water play","puzzles"], strengths: ["persistent","kind to friends"], support: ["needs warning before transitions"] },
  { id: "c2", name: "Noah Brennan",   dob: "2021-07-02", keyPerson: true,  interests: ["construction","vehicles"],          strengths: ["great gross motor","curious"],    support: ["building expressive language"] },
  { id: "c3", name: "Mia Castellano", dob: "2020-11-21", keyPerson: false, interests: ["mark-making","role play"],           strengths: ["imaginative","verbal"],           support: ["sharing resources"] },
  { id: "c4", name: "Leo Fairbanks",  dob: "2021-01-09", keyPerson: true,  interests: ["music","outdoor play","animals"],   strengths: ["confident","sociable"],           support: ["fine motor — pencil grip","sitting at carpet"] },
  { id: "c5", name: "Sofia Adeyemi",  dob: "2021-05-30", keyPerson: false, interests: ["books","small world","drawing"],    strengths: ["focused","caring"],               support: ["joining group play"] },
];

/* ─── Planning: learning areas of the room ──────────────────────── */
const PLAN_AREAS = [
  { id: "invitation", label: "Invitation to play", icon: "🎁", color: c.yellow },
  { id: "provocation",label: "Provocation",        icon: "✨", color: c.blush },
  { id: "sensory",    label: "Sensory & messy",    icon: "🌾", color: c.terra },
  { id: "literacy",   label: "Books & mark-making",icon: "📖", color: c.blue },
  { id: "construction",label:"Construction & blocks",icon:"🧱",color: c.brownLt },
  { id: "role",       label: "Role play & small world", icon: "🏠", color: c.blush },
  { id: "creative",   label: "Creative & art",     icon: "🎨", color: c.terra },
  { id: "outdoor",    label: "Outdoor learning",   icon: "🌳", color: c.sage },
  { id: "group",      label: "Small-group focus",  icon: "👥", color: c.sageDk },
];
const planArea = (id) => PLAN_AREAS.find(a => a.id === id) || PLAN_AREAS[0];

/* ─── Idea library — quick, realistic activity seeds per pathway ── */
const IDEA_LIBRARY = {
  emotional: [
    "Calm-corner basket: soft toys, family photo cards, a feelings book",
    "'How I'm feeling' pebble check-in at the welcome mat",
    "Buddy drop-off — a familiar friend greets a child who finds mornings hard",
  ],
  language: [
    "Story basket with props — children retell the tale in their own words",
    "Talking tub: a mystery object to describe and ask questions about",
    "Narrate-as-you-play alongside a quieter child during free flow",
  ],
  fineMotor: [
    "Tweezers & pompom transfer trays graded by size",
    "Threading station — laces, beads, pasta, cut straws",
    "Dough disco with rollers, scissors and loose parts",
  ],
  grossMotor: [
    "Obstacle course: balance beam, tunnel, stepping stones",
    "Ribbon sticks and scarves for big-arm movement to music",
    "Watering cans and large brushes for outdoor 'painting' with water",
  ],
  literacy: [
    "Name-card matching in the writing area with real photos",
    "Mark-making invitation: clipboards outdoors as 'site inspectors'",
    "Favourite story re-read three times this week, then story-mapping",
  ],
  sound: [
    "Sound walk — stop, close eyes, name what you can hear",
    "Syllable clapping with children's names at carpet time",
    "Rhyming object pairs hidden in the sand tray",
  ],
  social: [
    "Two-person only station to scaffold turn-taking",
    "Co-operative parachute or large-build group challenge",
    "Sharing social story revisited before busy free-flow",
  ],
  curiosity: [
    "Provocation: mirrors, magnifiers and natural treasures on a light source",
    "'I wonder…' question of the day displayed at child height",
    "Mystery bag — predict, feel, reveal, discuss",
  ],
  creative: [
    "Open-ended junk-modelling trolley with tape and connectors",
    "Colour-mixing investigation at the easel",
    "Clay and natural tools — no end product expected",
  ],
  independence: [
    "Self-registration photo cards on arrival",
    "Snack-time jobs rota — pouring, serving, wiping",
    "Dressing frames and real coats with a 'flip and flip' routine",
  ],
  problem: [
    "Loose-parts ramp run — how far can the ball travel?",
    "Sorting and classifying trays — children choose the rule",
    "Construction challenge card: 'build a bridge for the small bears'",
  ],
  regulation: [
    "Breathing buddies — soft toy on the tummy, slow breaths",
    "Visual 'now and next' cards for the daily rhythm",
    "Movement break box: cards for stretches and heavy-muscle work",
  ],
};

const WEEKDAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday"];


/* ════════════════════════════════════════════════════════════════
   ROOT
   ════════════════════════════════════════════════════════════════ */
export default function TeacherHub() {
  const [view, setView] = useState("today");      // today | observations | assessment | planning | family | manage | child | terms | privacy | licence
  const [loaded, setLoaded] = useState(false);
  const vp = useViewport();

  const [children, setChildren] = useState(SEED_CHILDREN);
  const [observations, setObservations] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [dayNotes, setDayNotes] = useState("");
  const [focusIds, setFocusIds] = useState([]);
  const [climate, setClimate] = useState(3);
  const [wellbeing, setWellbeing] = useState(null);
  const [activeChild, setActiveChild] = useState(null);
  /* assessment: { [childId]: { [pathwayId]: { stage, target, note, updated } } } */
  const [assessment, setAssessment] = useState({});
  /* framework customisation — teachers can rename pathways & edit skill tags */
  const [pathwayLabels, setPathwayLabels] = useState({}); // { [pathwayId]: "custom label" }
  const [customSkills, setCustomSkills] = useState({});   // { [pathwayId]: ["skill", ...] } — overrides default when present
  const [customPathways, setCustomPathways] = useState([]); // teacher-added pathways
  const [hiddenPathways, setHiddenPathways] = useState({}); // { [pathwayId]: true }
  const [pathwayOrder, setPathwayOrder] = useState(null);   // [pathwayId, ...] or null
  /* assessment stages — null = use defaults; array = teacher-customised */
  const [customStages, setCustomStages] = useState(null);
  /* groups — teachers can build interest/intervention/friendship/wellbeing/custom groups */
  const [groups, setGroups] = useState([]);                 // [{ id, name, kind, color, icon, childIds, note }]
  /* settings */
  const [theme, setTheme] = useState("sage");
  const [density, setDensity] = useState("calm");
  /* planning: array of plan items { id, day, week, title, area, pathwayId, groupIds, note, done } */
  const [plans, setPlans] = useState([]);
  const [planWeek, setPlanWeek] = useState(0); // 0 = this week, 1 = next week
  /* lesson plans: structured, date-stamped lesson plans with evidence */
  const [lessons, setLessons] = useState([]);
  /* saved lesson templates — reusable plan structures a teacher or school keeps */
  const [lessonTemplates, setLessonTemplates] = useState([]);
  /* family: array of messages { id, childId, kind, ts, title, body, sent } */
  const [familyMessages, setFamilyMessages] = useState([]);

  const [capture, setCapture] = useState(false);   // observation composer open

  /* load persisted data */
  useEffect(() => {
    (async () => {
      const [ch, obs, rem, dn, fi, cl, wb, asm, plab, cskill, pl, fm, cpw, hpw, pord, cst, gr, th, ds, les, lestmpl] = await Promise.all([
        store.get("bba_children", SEED_CHILDREN),
        store.get("bba_observations", []),
        store.get("bba_reminders", [
          { id: "r1", text: "Print Ava's learning journey for parents' evening", done: false },
          { id: "r2", text: "Restock the mark-making provocation table", done: false },
        ]),
        store.get("bba_dayNotes", ""),
        store.get("bba_focusIds", ["c4","c2"]),
        store.get("bba_climate", 3),
        store.get("bba_wellbeing_" + new Date().toISOString().slice(0,10), null),
        store.get("bba_assessment", {}),
        store.get("bba_pathwayLabels", {}),
        store.get("bba_customSkills", {}),
        store.get("bba_plans", []),
        store.get("bba_familyMessages", []),
        store.get("bba_customPathways", []),
        store.get("bba_hiddenPathways", {}),
        store.get("bba_pathwayOrder", null),
        store.get("bba_customStages", null),
        store.get("bba_groups", []),
        store.get("bba_theme", "sage"),
        store.get("bba_density", "calm"),
        store.get("bba_lessons", []),
        store.get("bba_lessonTemplates", []),
      ]);
      setChildren(ch); setObservations(obs); setReminders(rem);
      setDayNotes(dn); setFocusIds(fi); setClimate(cl); setWellbeing(wb);
      setAssessment(asm); setPathwayLabels(plab); setCustomSkills(cskill);
      setPlans(pl); setFamilyMessages(fm);
      setCustomPathways(cpw); setHiddenPathways(hpw); setPathwayOrder(pord);
      setCustomStages(cst); setGroups(gr);
      setTheme(th); setDensity(ds);
      setLessons(les);
      setLessonTemplates(lestmpl);
      syncRegistry({ labels: plab, skills: cskill, custom: cpw, hidden: hpw, order: pord });
      syncStages(cst);
      applyTheme(th);
      setLoaded(true);
    })();
  }, []);

  /* keep the live registry in sync so every pathway() reflects edits */
  useEffect(() => {
    syncRegistry({
      labels: pathwayLabels, skills: customSkills,
      custom: customPathways, hidden: hiddenPathways, order: pathwayOrder,
    });
  }, [pathwayLabels, customSkills, customPathways, hiddenPathways, pathwayOrder]);

  /* keep stages registry in sync */
  useEffect(() => { syncStages(customStages); }, [customStages]);

  /* apply theme — palette mutates, force a render via theme state already triggers it */
  useEffect(() => { applyTheme(theme); }, [theme]);

  /* persist on change (after initial load) */
  useEffect(() => { if (loaded) store.set("bba_children", children); }, [children, loaded]);
  useEffect(() => { if (loaded) store.set("bba_observations", observations); }, [observations, loaded]);
  useEffect(() => { if (loaded) store.set("bba_reminders", reminders); }, [reminders, loaded]);
  useEffect(() => { if (loaded) store.set("bba_dayNotes", dayNotes); }, [dayNotes, loaded]);
  useEffect(() => { if (loaded) store.set("bba_focusIds", focusIds); }, [focusIds, loaded]);
  useEffect(() => { if (loaded) store.set("bba_climate", climate); }, [climate, loaded]);
  useEffect(() => { if (loaded) store.set("bba_wellbeing_" + new Date().toISOString().slice(0,10), wellbeing); }, [wellbeing, loaded]);
  useEffect(() => { if (loaded) store.set("bba_assessment", assessment); }, [assessment, loaded]);
  useEffect(() => { if (loaded) store.set("bba_pathwayLabels", pathwayLabels); }, [pathwayLabels, loaded]);
  useEffect(() => { if (loaded) store.set("bba_customSkills", customSkills); }, [customSkills, loaded]);
  useEffect(() => { if (loaded) store.set("bba_customPathways", customPathways); }, [customPathways, loaded]);
  useEffect(() => { if (loaded) store.set("bba_hiddenPathways", hiddenPathways); }, [hiddenPathways, loaded]);
  useEffect(() => { if (loaded) store.set("bba_pathwayOrder", pathwayOrder); }, [pathwayOrder, loaded]);
  useEffect(() => { if (loaded) store.set("bba_customStages", customStages); }, [customStages, loaded]);
  useEffect(() => { if (loaded) store.set("bba_groups", groups); }, [groups, loaded]);
  useEffect(() => { if (loaded) store.set("bba_theme", theme); }, [theme, loaded]);
  useEffect(() => { if (loaded) store.set("bba_density", density); }, [density, loaded]);
  useEffect(() => { if (loaded) store.set("bba_plans", plans); }, [plans, loaded]);
  useEffect(() => { if (loaded) store.set("bba_lessons", lessons); }, [lessons, loaded]);
  useEffect(() => { if (loaded) store.set("bba_lessonTemplates", lessonTemplates); }, [lessonTemplates, loaded]);
  useEffect(() => { if (loaded) store.set("bba_familyMessages", familyMessages); }, [familyMessages, loaded]);

  /* live pathways list & skills — read through the synced registry */
  const pathways = livePathways();
  const skillsFor = (pid) => getSkills(pid);

  const addObservation = (obs) => setObservations(prev => [obs, ...prev]);
  const updateObservation = (id, patch) =>
    setObservations(prev => prev.map(o => o.id === id ? { ...o, ...patch } : o));
  const deleteObservation = (id) =>
    setObservations(prev => prev.filter(o => o.id !== id));
  const duplicateObservation = (id) => {
    const orig = observations.find(o => o.id === id);
    if (!orig) return;
    setObservations(prev => [
      { ...orig, id: "o" + Date.now(), ts: Date.now(), draft: true, pinned: false, archived: false,
        groupId: undefined, groupSize: undefined },
      ...prev,
    ]);
  };

  /* ---- children management ---- */
  const addChild = (data) => {
    const id = "c" + Date.now();
    setChildren(prev => [...prev, {
      id, name: data.name, dob: data.dob, keyPerson: !!data.keyPerson,
      photo: data.photo || null,
      interests: [], strengths: [], support: [],
    }]);
    return id;
  };
  const updateChild = (id, patch) =>
    setChildren(prev => prev.map(x => x.id === id ? { ...x, ...patch } : x));
  const removeChild = (id) => {
    setChildren(prev => prev.filter(x => x.id !== id));
    setObservations(prev => prev.filter(o => o.childId !== id));
    setAssessment(prev => { const n = { ...prev }; delete n[id]; return n; });
    setFocusIds(prev => prev.filter(f => f !== id));
  };

  /* ---- framework management ---- */
  const renamePathway = (pid, label) =>
    setPathwayLabels(prev => ({ ...prev, [pid]: label }));
  const resetPathwayName = (pid) =>
    setPathwayLabels(prev => { const n = { ...prev }; delete n[pid]; return n; });
  const setSkillsForPathway = (pid, list) =>
    setCustomSkills(prev => ({ ...prev, [pid]: list }));
  const resetSkillsForPathway = (pid) =>
    setCustomSkills(prev => { const n = { ...prev }; delete n[pid]; return n; });

  /* ---- custom pathway management ---- */
  const addPathway = ({ label, icon, color }) => {
    const id = "p_" + Date.now().toString(36);
    const newPw = { id, label: label.trim(), icon: icon || "🌱", color: color || c.sage };
    setCustomPathways(prev => [...prev, newPw]);
    // Place new pathway at the end of any custom order
    if (pathwayOrder) setPathwayOrder([...pathwayOrder, id]);
    return id;
  };
  const removeCustomPathway = (pid) => {
    setCustomPathways(prev => prev.filter(p => p.id !== pid));
    setPathwayLabels(prev => { const n = { ...prev }; delete n[pid]; return n; });
    setCustomSkills(prev => { const n = { ...prev }; delete n[pid]; return n; });
    setHiddenPathways(prev => { const n = { ...prev }; delete n[pid]; return n; });
    setPathwayOrder(prev => prev ? prev.filter(id => id !== pid) : prev);
    // Strip this pathway out of assessments
    setAssessment(prev => {
      const out = {};
      for (const cid in prev) {
        out[cid] = {};
        for (const p in prev[cid]) if (p !== pid) out[cid][p] = prev[cid][p];
      }
      return out;
    });
    // Clear pathwayId on observations that used it (keep the obs, lose the tag)
    setObservations(prev => prev.map(o => o.pathwayId === pid ? { ...o, pathwayId: "" } : o));
  };
  const togglePathwayHidden = (pid) =>
    setHiddenPathways(prev => {
      const n = { ...prev };
      if (n[pid]) delete n[pid]; else n[pid] = true;
      return n;
    });
  const movePathway = (pid, delta) => {
    // Build current full ordering, move pid by delta, save
    const all = allPathwayBases().map(b => b.id);
    let order = pathwayOrder ? [...pathwayOrder] : all;
    // Ensure every existing id appears in order
    all.forEach(id => { if (!order.includes(id)) order.push(id); });
    order = order.filter(id => all.includes(id));
    const idx = order.indexOf(pid);
    if (idx < 0) return;
    const newIdx = idx + delta;
    if (newIdx < 0 || newIdx >= order.length) return;
    [order[idx], order[newIdx]] = [order[newIdx], order[idx]];
    setPathwayOrder(order);
  };
  const resetOrder = () => setPathwayOrder(null);
  /* Drag-and-drop reorder — takes the new full ordering */
  const reorderPathways = (newOrder) => setPathwayOrder(newOrder);

  /* ---- assessment stage management ---- */
  const applyStagePreset = (presetKey) => {
    const preset = STAGE_PRESETS[presetKey];
    if (preset) setCustomStages(presetKey === "default" ? null : preset.stages);
  };
  const updateStage = (idx, patch) => {
    const base = customStages || DEFAULT_STAGES;
    const next = base.map((s, i) => i === idx ? { ...s, ...patch } : s);
    setCustomStages(next);
  };
  const addStage = () => {
    const base = customStages || DEFAULT_STAGES;
    const newStage = {
      key: base.length, label: "New stage",
      short: (base.length).toString(),
      color: "#B89968", desc: "",
    };
    setCustomStages([...base, newStage]);
  };
  const removeStage = (idx) => {
    const base = customStages || DEFAULT_STAGES;
    if (base.length <= 2 || idx === 0) return; // keep at least 2, never remove "Not yet"
    const next = base.filter((_, i) => i !== idx);
    setCustomStages(next);
    // Clamp any existing assessment stages above the new max
    const maxKey = next.length - 1;
    setAssessment(prev => {
      const out = {};
      for (const cid in prev) {
        out[cid] = {};
        for (const pid in prev[cid]) {
          const cell = prev[cid][pid];
          out[cid][pid] = cell.stage > maxKey ? { ...cell, stage: maxKey } : cell;
        }
      }
      return out;
    });
  };
  const moveStage = (idx, delta) => {
    const base = customStages || DEFAULT_STAGES;
    const newIdx = idx + delta;
    if (newIdx < 1 || newIdx >= base.length || idx === 0) return; // never move "Not yet"
    const next = [...base];
    [next[idx], next[newIdx]] = [next[newIdx], next[idx]];
    setCustomStages(next);
  };
  const resetStages = () => setCustomStages(null);

  /* ---- group management ---- */
  const addGroup = (data) => {
    const id = "g_" + Date.now().toString(36);
    setGroups(prev => [...prev, {
      id, name: data.name, kind: data.kind || "custom",
      color: data.color || c.sage, icon: data.icon || "👥",
      childIds: data.childIds || [], note: data.note || "",
    }]);
    return id;
  };
  const updateGroup = (id, patch) =>
    setGroups(prev => prev.map(g => g.id === id ? { ...g, ...patch } : g));
  const removeGroup = (id) =>
    setGroups(prev => prev.filter(g => g.id !== id));
  const toggleChildInGroup = (groupId, childId) =>
    setGroups(prev => prev.map(g => {
      if (g.id !== groupId) return g;
      const has = g.childIds.includes(childId);
      return { ...g, childIds: has ? g.childIds.filter(x => x !== childId) : [...g.childIds, childId] };
    }));

  /* ---- child photo upload ---- */
  const setChildPhoto = (id, photoDataUrl) =>
    setChildren(prev => prev.map(x => x.id === id ? { ...x, photo: photoDataUrl } : x));

  /* assessment helpers */
  const setAssessmentCell = (childId, pathwayId, patch) =>
    setAssessment(prev => ({
      ...prev,
      [childId]: {
        ...(prev[childId] || {}),
        [pathwayId]: {
          stage: 0, target: "", note: "",
          ...((prev[childId] || {})[pathwayId] || {}),
          ...patch,
          updated: Date.now(),
        },
      },
    }));

  /* ---- planning helpers ---- */
  const addPlan = (data) =>
    setPlans(prev => [...prev, { id: "p" + Date.now() + Math.random().toString(36).slice(2,6), done: false, ...data }]);
  const updatePlan = (id, patch) =>
    setPlans(prev => prev.map(p => p.id === id ? { ...p, ...patch } : p));
  const removePlan = (id) =>
    setPlans(prev => prev.filter(p => p.id !== id));

  /* ---- lesson plan helpers (date-stamped, structured) ---- */
  const addLesson = (data) => {
    const id = "L" + Date.now().toString(36);
    const now = Date.now();
    setLessons(prev => [{ id, created: now, updated: now, ...data }, ...prev]);
    return id;
  };
  const updateLesson = (id, patch) =>
    setLessons(prev => prev.map(l => l.id === id ? { ...l, ...patch, updated: Date.now() } : l));
  const removeLesson = (id) =>
    setLessons(prev => prev.filter(l => l.id !== id));
  const duplicateLesson = (id) => {
    const orig = lessons.find(l => l.id === id);
    if (!orig) return;
    const now = Date.now();
    setLessons(prev => [{
      ...orig, id: "L" + now.toString(36), created: now, updated: now,
      title: orig.title + " (copy)", evidence: [],
    }, ...prev]);
  };

  /* ---- lesson template helpers (reusable plan structures) ---- */
  /* Save a lesson's structure as a template — strips date, evidence, focus children */
  const saveAsTemplate = (lessonData, templateName) => {
    const id = "T" + Date.now().toString(36);
    const { date, evidence, childIds, created, updated, id: _lid, ...structure } = lessonData;
    setLessonTemplates(prev => [{
      id, name: templateName || lessonData.title || "Untitled template",
      created: Date.now(),
      structure: { ...structure, childIds: [], evidence: [] },
    }, ...prev]);
    return id;
  };
  const removeTemplate = (id) =>
    setLessonTemplates(prev => prev.filter(t => t.id !== id));
  const renameTemplate = (id, name) =>
    setLessonTemplates(prev => prev.map(t => t.id === id ? { ...t, name } : t));

  /* ---- family message helpers ---- */
  const addFamilyMessage = (data) =>
    setFamilyMessages(prev => [{ id: "f" + Date.now(), ts: Date.now(), sent: false, ...data }, ...prev]);
  const updateFamilyMessage = (id, patch) =>
    setFamilyMessages(prev => prev.map(m => m.id === id ? { ...m, ...patch } : m));
  const removeFamilyMessage = (id) =>
    setFamilyMessages(prev => prev.filter(m => m.id !== id));

  const openChild = (id) => { setActiveChild(id); setView("child"); };

  if (!loaded) {
    return (
      <div style={{
        fontFamily: FONT_BODY, background: c.cream, minHeight: "100vh",
        display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 14,
      }}>
        <BearMark size={56} />
        <div style={{ color: c.brownLt, fontSize: 14, letterSpacing: 0.5 }}>Opening your Teacher Hub…</div>
      </div>
    );
  }

  return (
    <div style={{
      fontFamily: FONT_BODY, background: c.cream, minHeight: "100vh", color: c.ink,
      backgroundImage: `radial-gradient(${c.paper} 1px, transparent 1px)`,
      backgroundSize: "22px 22px",
    }}>
      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 9px; height: 9px; }
        ::-webkit-scrollbar-thumb { background: ${c.line}; border-radius: 6px; }
        @keyframes rise { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
        .rise { animation: rise .4s ease both; }
        .tap { transition: transform .12s ease, box-shadow .2s ease, background .2s ease; }
        .tap:active { transform: scale(.97); }
        @media print {
          .no-print { display: none !important; }
          body { background: #fff !important; }
        }
      `}</style>

      <TopBar view={view} setView={setView} onCapture={() => setCapture(true)} vp={vp} />

      <div style={{
        maxWidth: 1180, margin: "0 auto",
        padding: vp.isPhone ? "16px 12px 130px" : vp.isCompact ? "20px 16px 130px" : "24px 24px 120px",
      }}>
        {view === "today" && (
          <TodayDashboard
            children={children} observations={observations}
            reminders={reminders} setReminders={setReminders}
            dayNotes={dayNotes} setDayNotes={setDayNotes}
            focusIds={focusIds} setFocusIds={setFocusIds}
            climate={climate} setClimate={setClimate}
            wellbeing={wellbeing} setWellbeing={setWellbeing}
            onCapture={() => setCapture(true)}
            openChild={openChild}
            gotoObs={() => setView("observations")}
            gotoAssessment={() => setView("assessment")}
            gotoManage={() => setView("manage")}
            assessment={assessment}
            pathways={pathways}
            vp={vp}
          />
        )}
        {view === "observations" && (
          <ObservationSystem
            children={children} observations={observations}
            onCapture={() => setCapture(true)}
            updateObservation={updateObservation}
            deleteObservation={deleteObservation}
            duplicateObservation={duplicateObservation}
            openChild={openChild}
            pathways={pathways}
            gotoManage={() => setView("manage")}
            vp={vp}
          />
        )}
        {view === "assessment" && (
          <AssessmentTracker
            children={children} observations={observations}
            assessment={assessment} setAssessmentCell={setAssessmentCell}
            openChild={openChild} pathways={pathways}
            gotoManage={() => setView("manage")}
            vp={vp}
          />
        )}
        {view === "planning" && (
          <PlanningHub
            children={children} observations={observations}
            assessment={assessment} plans={plans}
            addPlan={addPlan} updatePlan={updatePlan} removePlan={removePlan}
            lessons={lessons} addLesson={addLesson} updateLesson={updateLesson}
            removeLesson={removeLesson} duplicateLesson={duplicateLesson}
            lessonTemplates={lessonTemplates} saveAsTemplate={saveAsTemplate}
            removeTemplate={removeTemplate} renameTemplate={renameTemplate}
            planWeek={planWeek} setPlanWeek={setPlanWeek}
            pathways={pathways} openChild={openChild}
            vp={vp}
          />
        )}
        {view === "family" && (
          <FamilyHub
            children={children} observations={observations}
            assessment={assessment} familyMessages={familyMessages}
            addFamilyMessage={addFamilyMessage}
            updateFamilyMessage={updateFamilyMessage}
            removeFamilyMessage={removeFamilyMessage}
            pathways={pathways} openChild={openChild}
            vp={vp}
          />
        )}
        {view === "manage" && (
          <ManageHub
            children={children}
            observations={observations}
            assessment={assessment}
            addChild={addChild} updateChild={updateChild} removeChild={removeChild}
            pathways={pathways}
            skillsFor={skillsFor}
            renamePathway={renamePathway} resetPathwayName={resetPathwayName}
            setSkillsForPathway={setSkillsForPathway} resetSkillsForPathway={resetSkillsForPathway}
            pathwayLabels={pathwayLabels} customSkills={customSkills}
            customPathways={customPathways} hiddenPathways={hiddenPathways} pathwayOrder={pathwayOrder}
            addPathway={addPathway} removeCustomPathway={removeCustomPathway}
            togglePathwayHidden={togglePathwayHidden}
            movePathway={movePathway} resetOrder={resetOrder}
            reorderPathways={reorderPathways}
            applyStagePreset={applyStagePreset} resetStages={resetStages}
            updateStage={updateStage} addStage={addStage} removeStage={removeStage} moveStage={moveStage}
            customStages={customStages}
            groups={groups} addGroup={addGroup} updateGroup={updateGroup} removeGroup={removeGroup}
            toggleChildInGroup={toggleChildInGroup}
            theme={theme} setTheme={setTheme}
            density={density} setDensity={setDensity}
            openChild={openChild}
            vp={vp}
          />
        )}
        {view === "child" && activeChild && (
          <ChildProfile
            child={children.find(x => x.id === activeChild)}
            observations={observations.filter(o => o.childId === activeChild)}
            assessment={assessment[activeChild] || {}}
            setAssessmentCell={setAssessmentCell}
            onBack={() => setView("observations")}
            onCapture={() => setCapture(true)}
            updateChild={(patch) => updateChild(activeChild, patch)}
            removeChild={() => { removeChild(activeChild); setView("manage"); }}
            pathways={pathways}
            vp={vp}
          />
        )}
        {(view === "terms" || view === "privacy" || view === "licence") && (
          <LegalPage which={view} onBack={() => setView("today")} setView={setView} vp={vp} />
        )}
      </div>

      {/* Global footer — copyright + legal links */}
      {view !== "child" && (
        <AppFooter setView={setView} vp={vp} />
      )}

      {/* Floating quick-capture */}
      <button
        className="no-print tap"
        onClick={() => setCapture(true)}
        style={{
          position: "fixed", right: vp.isPhone ? 14 : 22, bottom: vp.isPhone ? 16 : 24, zIndex: 60,
          background: c.sage, color: c.white, border: "none",
          borderRadius: 30, padding: vp.isPhone ? "13px 18px" : "15px 22px",
          fontSize: vp.isPhone ? 14 : 15, fontWeight: 700,
          fontFamily: FONT_BODY, cursor: "pointer",
          boxShadow: "0 8px 22px rgba(110,74,47,0.28)",
          display: "flex", alignItems: "center", gap: 9,
        }}
      >
        <span style={{ fontSize: 19 }}>＋</span> {vp.isPhone ? "Capture" : "Capture observation"}
      </button>

      {capture && (
        <ObservationComposer
          children={children}
          onClose={() => setCapture(false)}
          onSave={(obs) => { addObservation(obs); setCapture(false); }}
        />
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   TOP BAR
   ════════════════════════════════════════════════════════════════ */
function TopBar({ view, setView, onCapture, vp }) {
  const tabs = [
    { id: "today", label: "Today", icon: "🌿" },
    { id: "observations", label: "Observations", icon: "📝" },
    { id: "assessment", label: "Assessment", icon: "📊" },
    { id: "planning", label: "Planning", icon: "🗓️" },
    { id: "family", label: "Family", icon: "💌" },
    { id: "manage", label: "Manage", icon: "⚙️" },
  ];
  return (
    <div className="no-print" style={{
      background: c.cream + "F2", backdropFilter: "blur(8px)",
      borderBottom: `1px solid ${c.line}`, position: "sticky", top: 0, zIndex: 50,
    }}>
      <div style={{
        maxWidth: 1180, margin: "0 auto",
        padding: vp.isPhone ? "10px 12px" : "12px 18px",
        display: "flex", alignItems: "center",
        gap: vp.isCompact ? 8 : 16,
        flexWrap: vp.isCompact ? "wrap" : "nowrap",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
          <BearMark size={vp.isPhone ? 34 : 40} />
          <div style={{ lineHeight: 1.15 }}>
            <div style={{
              fontFamily: FONT_DISPLAY, fontSize: vp.isPhone ? 15 : 18, fontWeight: 700, color: c.brown,
            }}>Brownie Bear Academy</div>
            <div style={{ fontSize: vp.isPhone ? 9.5 : 11, color: c.sageDk, letterSpacing: 2, textTransform: "uppercase" }}>
              Teacher Hub
            </div>
          </div>
        </div>

        {!vp.isCompact && <div style={{ flex: 1 }} />}

        <div style={{
          display: "flex", gap: 4, background: c.white, padding: 4,
          borderRadius: 12, border: `1px solid ${c.line}`,
          marginLeft: vp.isCompact ? 0 : 0,
          width: vp.isCompact ? "100%" : "auto",
          overflowX: "auto",
        }}>
          {tabs.map(t => (
            <button key={t.id} className="tap" onClick={() => setView(t.id)} style={{
              border: "none", cursor: "pointer", fontFamily: FONT_BODY,
              padding: vp.isPhone ? "8px 9px" : "8px 14px", borderRadius: 9,
              fontSize: vp.isPhone ? 11.5 : 13, fontWeight: 600,
              background: view === t.id ? c.sage : "transparent",
              color: view === t.id ? c.white : c.brownLt,
              flex: vp.isCompact ? 1 : "none",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
              whiteSpace: "nowrap",
            }}>
              <span style={{ fontSize: vp.isPhone ? 13 : 12 }}>{t.icon}</span>
              <span style={{ display: vp.isPhone ? "none" : "inline" }}>{t.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   SHARED UI BITS
   ════════════════════════════════════════════════════════════════ */
function Card({ children, style, pad = 18, className = "" }) {
  return (
    <div className={className} style={{
      background: c.white, border: `1px solid ${c.line}`, borderRadius: 18,
      padding: pad, boxShadow: "0 2px 10px rgba(110,74,47,0.05)", ...style,
    }}>{children}</div>
  );
}

function SectionLabel({ children, hint }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 12 }}>
      <h2 style={{
        margin: 0, fontFamily: FONT_DISPLAY, fontSize: 17, color: c.brown, fontWeight: 700,
      }}>{children}</h2>
      {hint && <span style={{ fontSize: 11.5, color: c.brownLt }}>{hint}</span>}
    </div>
  );
}

function Pill({ children, color = c.sage, bg, onClick, active }) {
  return (
    <span onClick={onClick} className={onClick ? "tap" : ""} style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "4px 10px", borderRadius: 20, fontSize: 11.5, fontWeight: 600,
      background: bg || (active ? color : color + "22"),
      color: active ? c.white : color,
      border: `1px solid ${color}${active ? "" : "44"}`,
      cursor: onClick ? "pointer" : "default",
    }}>{children}</span>
  );
}

function Avatar({ name, size = 38, color = c.sage, photo }) {
  const initials = (name || "").split(" ").map(w => w[0]).slice(0, 2).join("");
  if (photo) {
    return (
      <div style={{
        width: size, height: size, borderRadius: "50%", flexShrink: 0,
        backgroundImage: `url(${photo})`, backgroundSize: "cover", backgroundPosition: "center",
        border: `1.5px solid ${color}55`,
      }} />
    );
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: color + "26", color: color === c.sage ? c.sageDk : color,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontWeight: 700, fontSize: size * 0.36, fontFamily: FONT_BODY,
      border: `1.5px solid ${color}55`,
    }}>{initials}</div>
  );
}

function ageOf(dob) {
  const d = new Date(dob), n = new Date();
  let y = n.getFullYear() - d.getFullYear();
  let m = n.getMonth() - d.getMonth();
  if (m < 0) { y--; m += 12; }
  return `${y}y ${m}m`;
}
function timeAgo(ts) {
  const s = (Date.now() - ts) / 1000;
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s/60)}m ago`;
  if (s < 86400) return `${Math.floor(s/3600)}h ago`;
  return new Date(ts).toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

/* ════════════════════════════════════════════════════════════════
   TODAY DASHBOARD
   ════════════════════════════════════════════════════════════════ */
function TodayDashboard({
  children, observations, reminders, setReminders, dayNotes, setDayNotes,
  focusIds, setFocusIds, climate, setClimate, wellbeing, setWellbeing,
  onCapture, openChild, gotoObs, gotoAssessment, gotoManage, assessment, pathways, vp,
}) {
  const today = new Date();
  const dateStr = today.toLocaleDateString(undefined, {
    weekday: "long", day: "numeric", month: "long",
  });
  const todays = observations.filter(o =>
    new Date(o.ts).toDateString() === today.toDateString());
  const drafts = observations.filter(o => o.draft);
  const newReminderRef = useRef();

  const toggleReminder = (id) =>
    setReminders(reminders.map(r => r.id === id ? { ...r, done: !r.done } : r));
  const addReminder = () => {
    const v = newReminderRef.current.value.trim();
    if (!v) return;
    setReminders([...reminders, { id: "r" + Date.now(), text: v, done: false }]);
    newReminderRef.current.value = "";
  };
  const removeReminder = (id) => setReminders(reminders.filter(r => r.id !== id));

  const toggleFocus = (id) =>
    setFocusIds(focusIds.includes(id) ? focusIds.filter(f => f !== id) : [...focusIds, id]);

  /* observation coverage — who hasn't been observed in 7+ days */
  const weekAgo = Date.now() - 7 * 86400000;
  const lastSeen = {};
  observations.forEach(o => {
    if (!lastSeen[o.childId] || o.ts > lastSeen[o.childId]) lastSeen[o.childId] = o.ts;
  });
  const needAttention = children.filter(ch => !lastSeen[ch.id] || lastSeen[ch.id] < weekAgo);

  const climateFaces = ["🌧️","⛅","🌤️","☀️","🌈"];
  const climateWords = ["Tough day","Unsettled","Steady","Calm & happy","Wonderful"];

  return (
    <div className="rise">
      {/* Greeting */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: vp.isPhone ? 11.5 : 12.5, color: c.sageDk, letterSpacing: 1.5, textTransform: "uppercase" }}>
          {dateStr}
        </div>
        <h1 style={{
          margin: "3px 0 0", fontFamily: FONT_DISPLAY,
          fontSize: vp.isPhone ? 21 : 26, color: c.brown, fontWeight: 700, lineHeight: 1.2,
        }}>Good {today.getHours() < 12 ? "morning" : today.getHours() < 17 ? "afternoon" : "evening"} — here's your day</h1>
      </div>

      {/* Top stat strip */}
      <div style={{
        display: "grid",
        gridTemplateColumns: vp.isPhone ? "1fr 1fr" : "repeat(auto-fit,minmax(150px,1fr))",
        gap: vp.isPhone ? 8 : 12, marginBottom: 16,
      }}>
        <StatTile label="Observations today" value={todays.length} icon="📝" tone={c.sage} />
        <StatTile label="Unfinished drafts" value={drafts.length} icon="✏️" tone={c.terra}
          onClick={drafts.length ? gotoObs : null} />
        <StatTile label="Focus children" value={focusIds.length} icon="🎯" tone={c.blue} />
        <StatTile label="Need an observation" value={needAttention.length} icon="🐻" tone={c.yellow} />
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: vp.isCompact ? "1fr" : "1.55fr 1fr",
        gap: 16,
      }}>
        {/* LEFT COLUMN */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Quick capture banner */}
          <Card style={{
            background: `linear-gradient(135deg, ${c.sageLt}, ${c.white})`,
            borderColor: c.sage + "55",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: vp.isPhone ? "wrap" : "nowrap" }}>
              <div style={{ fontSize: 30 }}>🌿</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: FONT_DISPLAY, fontSize: 16, color: c.brown, fontWeight: 700 }}>
                  Saw a learning moment?
                </div>
                <div style={{ fontSize: 12.5, color: c.brownLt, marginTop: 2 }}>
                  Capture it in under 30 seconds — tag it, add a photo, move on. Write it up properly later.
                </div>
              </div>
              <button className="tap" onClick={onCapture} style={{
                background: c.sage, color: c.white, border: "none", borderRadius: 12,
                padding: "11px 18px", fontWeight: 700, fontSize: 13.5, cursor: "pointer",
                fontFamily: FONT_BODY, whiteSpace: "nowrap",
              }}>＋ Quick capture</button>
            </div>
          </Card>

          {/* Daily rhythm */}
          <Card>
            <SectionLabel hint="your classroom flow">Today's rhythm</SectionLabel>
            <DailyRhythm />
          </Card>

          {/* Focus children */}
          <Card>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <h2 style={{ margin: 0, fontFamily: FONT_DISPLAY, fontSize: 17, color: c.brown, fontWeight: 700 }}>
                  Focus children
                </h2>
                <span style={{ fontSize: 11.5, color: c.brownLt }}>tap a child to add or remove</span>
              </div>
              <button className="tap" onClick={gotoManage} style={{
                background: c.white, border: `1px solid ${c.line}`, borderRadius: 8,
                padding: "5px 10px", fontSize: 11, fontWeight: 700, color: c.sageDk,
                cursor: "pointer", fontFamily: FONT_BODY, whiteSpace: "nowrap",
              }}>⚙️ Manage class</button>
            </div>
            <div style={{ fontSize: 12, color: c.brownLt, marginBottom: 10 }}>
              A gentle shortlist of who you're keeping a closer eye on today.
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {children.map(ch => {
                const on = focusIds.includes(ch.id);
                return (
                  <button key={ch.id} className="tap" onClick={() => toggleFocus(ch.id)} style={{
                    display: "flex", alignItems: "center", gap: 8, cursor: "pointer",
                    padding: "7px 12px 7px 7px", borderRadius: 30, fontFamily: FONT_BODY,
                    background: on ? c.sage : c.white,
                    border: `1.5px solid ${on ? c.sage : c.line}`,
                    color: on ? c.white : c.ink,
                  }}>
                    <Avatar name={ch.name} photo={ch.photo} size={26} color={on ? c.white : c.sage} />
                    <span style={{ fontSize: 12.5, fontWeight: 600 }}>{ch.name.split(" ")[0]}</span>
                  </button>
                );
              })}
            </div>
            {focusIds.length > 0 && (
              <div style={{
                marginTop: 12, paddingTop: 12, borderTop: `1px dashed ${c.line}`,
                display: "flex", flexDirection: "column", gap: 8,
              }}>
                {focusIds.map(id => {
                  const ch = children.find(x => x.id === id);
                  if (!ch) return null;
                  return (
                    <div key={id} style={{
                      display: "flex", alignItems: "center", gap: 10,
                      background: c.paper, borderRadius: 12, padding: "8px 11px",
                    }}>
                      <Avatar name={ch.name} photo={ch.photo} size={32} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: c.brown }}>{ch.name}</div>
                        <div style={{ fontSize: 11, color: c.brownLt, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {ch.support && ch.support.length ? "Support: " + ch.support[0] : "Interests: " + (ch.interests||[]).slice(0,2).join(", ")}
                        </div>
                      </div>
                      <button className="tap" onClick={() => openChild(id)} style={{
                        background: c.white, border: `1px solid ${c.line}`, borderRadius: 8,
                        padding: "5px 10px", fontSize: 11.5, fontWeight: 600, color: c.sageDk,
                        cursor: "pointer", fontFamily: FONT_BODY,
                      }}>Open</button>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Coverage / who needs an observation */}
          <Card style={needAttention.length ? { borderColor: c.yellow + "88", background: c.yellowLt } : {}}>
            <SectionLabel hint="so no child is overlooked">Observation coverage</SectionLabel>
            {needAttention.length === 0 ? (
              <div style={{ fontSize: 13, color: c.sageDk, display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ fontSize: 18 }}>🌟</span>
                Every child has been observed in the last week. Lovely.
              </div>
            ) : (
              <>
                <div style={{ fontSize: 12.5, color: c.brownLt, marginBottom: 10 }}>
                  These children haven't had an observation in 7+ days — a good moment to notice them today:
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {needAttention.map(ch => (
                    <button key={ch.id} className="tap" onClick={onCapture} style={{
                      display: "flex", alignItems: "center", gap: 7, cursor: "pointer",
                      background: c.white, border: `1.5px solid ${c.yellow}`, borderRadius: 30,
                      padding: "6px 12px 6px 6px", fontFamily: FONT_BODY,
                    }}>
                      <Avatar name={ch.name} photo={ch.photo} size={24} color={c.yellow} />
                      <span style={{ fontSize: 12, fontWeight: 600, color: c.brown }}>{ch.name.split(" ")[0]}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </Card>

          {/* Assessment snapshot */}
          <Card>
            <SectionLabel hint="tap to open the full tracker">Assessment snapshot</SectionLabel>
            <AssessmentSnapshot
              children={children} assessment={assessment}
              gotoAssessment={gotoAssessment}
            />
          </Card>
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>


          {/* Teacher wellbeing */}
          <Card style={{ background: `linear-gradient(135deg, ${c.terraLt}, ${c.white})`, borderColor: c.terra + "44" }}>
            <SectionLabel>Your wellbeing check</SectionLabel>
            <div style={{ fontSize: 12, color: c.brownLt, marginBottom: 10 }}>
              You look after everyone else. How are <em>you</em> arriving today?
            </div>
            <div style={{ display: "flex", gap: 6, justifyContent: "space-between" }}>
              {[
                { e: "😔", l: "Drained" },
                { e: "😐", l: "Tired" },
                { e: "🙂", l: "Okay" },
                { e: "😊", l: "Good" },
                { e: "🤩", l: "Great" },
              ].map((m, i) => (
                <button key={i} className="tap" onClick={() => setWellbeing(i)} style={{
                  flex: 1, cursor: "pointer", fontFamily: FONT_BODY,
                  background: wellbeing === i ? c.terra : c.white,
                  border: `1.5px solid ${wellbeing === i ? c.terra : c.line}`,
                  borderRadius: 12, padding: "8px 2px",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
                }}>
                  <span style={{ fontSize: 19 }}>{m.e}</span>
                  <span style={{
                    fontSize: 9.5, fontWeight: 600,
                    color: wellbeing === i ? c.white : c.brownLt,
                  }}>{m.l}</span>
                </button>
              ))}
            </div>
            {wellbeing !== null && wellbeing <= 1 && (
              <div style={{
                marginTop: 11, fontSize: 12, color: c.brown, background: c.white,
                borderRadius: 10, padding: "9px 11px", lineHeight: 1.5,
                border: `1px solid ${c.terra}33`,
              }}>
                🤍 A hard start is allowed. Keep today small — one good observation, one calm transition.
                That's enough. Ask for a five-minute break if you can.
              </div>
            )}
          </Card>

          {/* Emotional climate */}
          <Card>
            <SectionLabel hint="the room as a whole">Emotional climate</SectionLabel>
            <div style={{ textAlign: "center", padding: "4px 0" }}>
              <div style={{ fontSize: 40 }}>{climateFaces[climate]}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: c.brown, marginTop: 2 }}>
                {climateWords[climate]}
              </div>
            </div>
            <input
              type="range" min={0} max={4} value={climate}
              onChange={e => setClimate(+e.target.value)}
              style={{ width: "100%", accentColor: c.sage, marginTop: 6 }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginTop: 2 }}>
              {climateFaces.map((f, i) => <span key={i} style={{ opacity: i === climate ? 1 : 0.35 }}>{f}</span>)}
            </div>
          </Card>

          {/* Wellbeing Toolkit — expanded */}
          <WellbeingToolkit />

          {/* Reminders */}
          <Card>
            <SectionLabel hint="small things, off your mind">Reminders</SectionLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {reminders.length === 0 && (
                <div style={{ fontSize: 12.5, color: c.brownLt }}>Nothing pending — a clear mind.</div>
              )}
              {reminders.map(r => (
                <div key={r.id} style={{
                  display: "flex", alignItems: "center", gap: 9,
                  background: r.done ? c.sageLt : c.paper, borderRadius: 10, padding: "8px 10px",
                }}>
                  <button className="tap" onClick={() => toggleReminder(r.id)} style={{
                    width: 19, height: 19, borderRadius: 6, flexShrink: 0, cursor: "pointer",
                    border: `2px solid ${r.done ? c.sage : c.brownLt}`,
                    background: r.done ? c.sage : c.white,
                    color: c.white, fontSize: 12, lineHeight: 1, fontWeight: 900,
                  }}>{r.done ? "✓" : ""}</button>
                  <span style={{
                    flex: 1, fontSize: 12.5,
                    textDecoration: r.done ? "line-through" : "none",
                    color: r.done ? c.brownLt : c.ink,
                  }}>{r.text}</span>
                  <button onClick={() => removeReminder(r.id)} style={{
                    border: "none", background: "none", cursor: "pointer",
                    color: c.brownLt, fontSize: 15, lineHeight: 1,
                  }}>×</button>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 6, marginTop: 9 }}>
              <input
                ref={newReminderRef} placeholder="Add a reminder…"
                onKeyDown={e => e.key === "Enter" && addReminder()}
                style={{
                  flex: 1, border: `1px solid ${c.line}`, borderRadius: 9, padding: "8px 10px",
                  fontSize: 12.5, fontFamily: FONT_BODY, background: c.cream, color: c.ink, outline: "none",
                }}
              />
              <button className="tap" onClick={addReminder} style={{
                border: "none", background: c.brown, color: c.white, borderRadius: 9,
                padding: "0 14px", fontSize: 17, cursor: "pointer", fontWeight: 700,
              }}>＋</button>
            </div>
          </Card>

          {/* Quick notes */}
          <Card>
            <SectionLabel hint="a scratchpad — saved automatically">Quick notes</SectionLabel>
            <textarea
              value={dayNotes} onChange={e => setDayNotes(e.target.value)}
              placeholder="Jot anything — a parent message to pass on, a resource that ran out, a thought for tomorrow's planning…"
              style={{
                width: "100%", minHeight: 90, resize: "vertical", border: `1px solid ${c.line}`,
                borderRadius: 11, padding: "10px 12px", fontSize: 12.5, fontFamily: FONT_BODY,
                background: c.cream, color: c.ink, outline: "none", lineHeight: 1.55,
              }}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatTile({ label, value, icon, tone, onClick }) {
  return (
    <div onClick={onClick || undefined} className={onClick ? "tap" : ""} style={{
      background: c.white, border: `1px solid ${c.line}`, borderRadius: 15,
      padding: "13px 15px", display: "flex", alignItems: "center", gap: 11,
      cursor: onClick ? "pointer" : "default",
      boxShadow: "0 2px 8px rgba(110,74,47,0.04)",
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 11, background: tone + "26",
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19,
      }}>{icon}</div>
      <div>
        <div style={{ fontSize: 22, fontWeight: 800, color: c.brown, fontFamily: FONT_DISPLAY, lineHeight: 1 }}>
          {value}
        </div>
        <div style={{ fontSize: 10.5, color: c.brownLt, marginTop: 3, letterSpacing: 0.3 }}>{label}</div>
      </div>
    </div>
  );
}

function DailyRhythm() {
  const DEFAULT_BLOCKS = [
    { id: "b1",  time: "8:30",  label: "Welcome & free-flow play",     tone: c.sage },
    { id: "b2",  time: "9:30",  label: "Carpet — song, story & talk",  tone: c.yellow },
    { id: "b3",  time: "9:50",  label: "Focused activities & provocations", tone: c.blue },
    { id: "b4",  time: "10:30", label: "Snack & self-help routines",   tone: c.terra },
    { id: "b5",  time: "10:50", label: "Outdoor learning",             tone: c.sage },
    { id: "b6",  time: "11:45", label: "Tidy-up & wind-down",          tone: c.brownLt },
    { id: "b7",  time: "12:00", label: "Lunch",                        tone: c.yellow },
    { id: "b8",  time: "13:00", label: "Quiet rest & calm corner",     tone: c.blue },
    { id: "b9",  time: "13:45", label: "Child-led exploration",        tone: c.sage },
    { id: "b10", time: "15:00", label: "Reflection circle & goodbyes", tone: c.terra },
  ];
  const TONE_OPTIONS = [
    { key: "sage",    color: c.sage,    name: "Sage" },
    { key: "yellow",  color: c.yellow,  name: "Yellow" },
    { key: "blue",    color: c.blue,    name: "Blue" },
    { key: "terra",   color: c.terra,   name: "Terra" },
    { key: "blush",   color: c.blush,   name: "Blush" },
    { key: "brownLt", color: c.brownLt, name: "Sand" },
  ];

  const [blocks, setBlocks] = useState(DEFAULT_BLOCKS);
  const [loaded, setLoaded] = useState(false);
  const [editingId, setEditingId] = useState(null);  // block id being edited (or "new")
  const [draft, setDraft] = useState({ time: "", label: "", tone: c.sage });

  useEffect(() => {
    (async () => {
      const stored = await store.get("bba_rhythm_blocks", DEFAULT_BLOCKS);
      setBlocks(stored && stored.length ? stored : DEFAULT_BLOCKS);
      setLoaded(true);
    })();
  }, []);
  useEffect(() => { if (loaded) store.set("bba_rhythm_blocks", blocks); }, [blocks, loaded]);

  const toMin = (t) => {
    if (!t) return 0;
    const [h, m] = t.split(":").map(Number);
    return (h || 0) * 60 + (m || 0);
  };
  const sortedBlocks = [...blocks].sort((a, b) => toMin(a.time) - toMin(b.time));
  const now = new Date();
  const mins = now.getHours() * 60 + now.getMinutes();
  let currentId = null;
  sortedBlocks.forEach(b => { if (mins >= toMin(b.time)) currentId = b.id; });

  const startEdit = (b) => {
    setEditingId(b.id);
    setDraft({ time: b.time, label: b.label, tone: b.tone });
  };
  const startNew = () => {
    // Suggest a sensible default time — 30 min after the last block
    const last = sortedBlocks[sortedBlocks.length - 1];
    let suggested = "12:00";
    if (last) {
      const m = toMin(last.time) + 30;
      suggested = `${Math.floor(m / 60).toString().padStart(2, "0")}:${(m % 60).toString().padStart(2, "0")}`;
    }
    setEditingId("new");
    setDraft({ time: suggested, label: "", tone: c.sage });
  };
  const cancelEdit = () => { setEditingId(null); setDraft({ time: "", label: "", tone: c.sage }); };
  const saveEdit = () => {
    if (!draft.label.trim() || !draft.time) return;
    if (editingId === "new") {
      setBlocks(prev => [...prev, {
        id: "b" + Date.now(), time: draft.time, label: draft.label.trim(), tone: draft.tone,
      }]);
    } else {
      setBlocks(prev => prev.map(b => b.id === editingId
        ? { ...b, time: draft.time, label: draft.label.trim(), tone: draft.tone }
        : b));
    }
    cancelEdit();
  };
  const removeBlock = (id) => {
    setBlocks(prev => prev.filter(b => b.id !== id));
    cancelEdit();
  };
  const resetToDefaults = () => {
    setBlocks(DEFAULT_BLOCKS);
    cancelEdit();
  };

  return (
    <div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {sortedBlocks.map((b) => {
          const current = b.id === currentId;
          const isEditing = editingId === b.id;
          if (isEditing) {
            return (
              <RhythmEditor key={b.id} draft={draft} setDraft={setDraft}
                onSave={saveEdit} onCancel={cancelEdit}
                onRemove={() => removeBlock(b.id)}
                toneOptions={TONE_OPTIONS} canRemove={blocks.length > 1} />
            );
          }
          return (
            <button key={b.id} onClick={() => startEdit(b)} className="tap" style={{
              display: "flex", alignItems: "center", gap: 11,
              padding: "8px 10px", borderRadius: 10, cursor: "pointer",
              background: current ? b.tone + "22" : "transparent",
              border: current ? `1px solid ${b.tone}66` : `1px solid transparent`,
              fontFamily: FONT_BODY, textAlign: "left", width: "100%",
              transition: "background .15s, border-color .15s",
            }}>
              <div style={{
                fontSize: 11.5, fontWeight: 700, color: c.brownLt, width: 46, flexShrink: 0,
                fontFamily: FONT_DISPLAY,
              }}>{b.time}</div>
              <div style={{
                width: 8, height: 8, borderRadius: "50%", background: b.tone, flexShrink: 0,
              }} />
              <div style={{
                fontSize: 12.5, color: current ? c.brown : c.ink,
                fontWeight: current ? 700 : 500, flex: 1, minWidth: 0,
              }}>{b.label}</div>
              {current && (
                <span style={{
                  fontSize: 10, fontWeight: 700, color: b.tone,
                  background: c.white, borderRadius: 20, padding: "2px 8px",
                  border: `1px solid ${b.tone}66`, marginRight: 4,
                }}>now</span>
              )}
              <span style={{ color: c.brownLt, fontSize: 11, opacity: 0.5 }}>✎</span>
            </button>
          );
        })}

        {/* Inline new-block editor */}
        {editingId === "new" && (
          <RhythmEditor draft={draft} setDraft={setDraft}
            onSave={saveEdit} onCancel={cancelEdit}
            toneOptions={TONE_OPTIONS} canRemove={false} isNew />
        )}
      </div>

      {/* Footer actions */}
      <div style={{
        display: "flex", gap: 8, marginTop: 10, paddingTop: 10,
        borderTop: `1px dashed ${c.line}`,
      }}>
        <button className="tap" onClick={startNew} disabled={editingId === "new"} style={{
          flex: 1, background: editingId === "new" ? c.cream : c.sageLt,
          color: c.sageDk, border: `1.5px dashed ${c.sage}66`, borderRadius: 9,
          padding: "9px", fontSize: 12, fontWeight: 700,
          cursor: editingId === "new" ? "default" : "pointer", fontFamily: FONT_BODY,
        }}>＋ Add a block</button>
        <button className="tap" onClick={resetToDefaults} title="Reset to default rhythm" style={{
          background: c.white, color: c.brownLt, border: `1px solid ${c.line}`,
          borderRadius: 9, padding: "9px 14px", fontSize: 11.5, fontWeight: 700,
          cursor: "pointer", fontFamily: FONT_BODY,
        }}>↺ Reset</button>
      </div>
      <div style={{ fontSize: 10.5, color: c.brownLt, marginTop: 6, fontStyle: "italic" }}>
        Tap any block to edit it · blocks sort by time automatically
      </div>
    </div>
  );
}

function RhythmEditor({ draft, setDraft, onSave, onCancel, onRemove, toneOptions, canRemove, isNew }) {
  return (
    <div style={{
      background: c.sageLt, border: `1.5px solid ${c.sage}`, borderRadius: 11,
      padding: "10px 12px", marginTop: 2, marginBottom: 2,
    }}>
      <div style={{ display: "flex", gap: 7, marginBottom: 8, alignItems: "center" }}>
        <input
          type="time" value={draft.time}
          onChange={(e) => setDraft({ ...draft, time: e.target.value })}
          style={{
            width: 90, border: `1px solid ${c.line}`, borderRadius: 8,
            padding: "7px 9px", fontSize: 12.5, fontFamily: FONT_BODY,
            background: c.white, color: c.ink, outline: "none",
            fontWeight: 700,
          }}
        />
        <input
          value={draft.label}
          onChange={(e) => setDraft({ ...draft, label: e.target.value })}
          onKeyDown={(e) => {
            if (e.key === "Enter") onSave();
            if (e.key === "Escape") onCancel();
          }}
          placeholder="e.g. Story time, Snack, Group game…"
          autoFocus
          style={{
            flex: 1, minWidth: 0, border: `1px solid ${c.line}`, borderRadius: 8,
            padding: "7px 10px", fontSize: 12.5, fontFamily: FONT_BODY,
            background: c.white, color: c.ink, outline: "none",
          }}
        />
      </div>
      <div style={{ display: "flex", gap: 5, marginBottom: 9, flexWrap: "wrap" }}>
        {toneOptions.map(t => {
          const on = draft.tone === t.color;
          return (
            <button key={t.key} className="tap" onClick={() => setDraft({ ...draft, tone: t.color })} style={{
              cursor: "pointer", fontFamily: FONT_BODY, fontSize: 10.5, fontWeight: 700,
              padding: "4px 9px", borderRadius: 20,
              background: on ? t.color : t.color + "22",
              color: on ? c.white : c.ink,
              border: `1.5px solid ${t.color}${on ? "" : "55"}`,
              display: "flex", alignItems: "center", gap: 4,
            }}>
              <span style={{
                width: 8, height: 8, borderRadius: "50%", background: t.color,
                border: on ? `1.5px solid ${c.white}` : "none",
              }} />
              {t.name}
            </button>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        <button className="tap" onClick={onCancel} style={{
          background: c.white, color: c.brownLt, border: `1px solid ${c.line}`,
          borderRadius: 8, padding: "6px 12px", fontSize: 11.5, fontWeight: 700,
          cursor: "pointer", fontFamily: FONT_BODY,
        }}>Cancel</button>
        <div style={{ flex: 1 }} />
        {!isNew && canRemove && (
          <button className="tap" onClick={onRemove} style={{
            background: "transparent", color: c.terra, border: `1px solid ${c.terra}55`,
            borderRadius: 8, padding: "6px 12px", fontSize: 11.5, fontWeight: 700,
            cursor: "pointer", fontFamily: FONT_BODY,
          }}>🗑 Remove</button>
        )}
        <button className="tap" onClick={onSave}
          disabled={!draft.label.trim() || !draft.time} style={{
          background: c.sage, color: c.white, border: "none",
          borderRadius: 8, padding: "6px 14px", fontSize: 11.5, fontWeight: 700,
          cursor: (!draft.label.trim() || !draft.time) ? "not-allowed" : "pointer",
          opacity: (!draft.label.trim() || !draft.time) ? 0.5 : 1,
          fontFamily: FONT_BODY,
        }}>{isNew ? "＋ Add" : "Save"}</button>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   OBSERVATION COMPOSER  (fast capture + AI-assisted wording)
   ════════════════════════════════════════════════════════════════ */
function ObservationComposer({ children, onClose, onSave }) {
  const [step, setStep] = useState(1);          // 1 capture · 2 refine
  const [childId, setChildId] = useState("");
  const [groupIds, setGroupIds] = useState([]);
  const [isGroup, setIsGroup] = useState(false);
  const [rawNote, setRawNote] = useState("");
  const [pathwayId, setPathwayId] = useState("");
  const [skills, setSkills] = useState([]);
  const [photo, setPhoto] = useState(null);
  const [polished, setPolished] = useState("");
  const [nextStep, setNextStep] = useState("");
  const fileRef = useRef();

  const toggleSkill = (s) =>
    setSkills(skills.includes(s) ? skills.filter(x => x !== s) : [...skills, s]);
  const toggleGroupChild = (id) =>
    setGroupIds(groupIds.includes(id) ? groupIds.filter(x => x !== id) : [...groupIds, id]);

  const onPhoto = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => setPhoto(r.result);
    r.readAsDataURL(f);
  };

  const canCapture = isGroup ? groupIds.length > 0 : !!childId;
  const childName = (id) => children.find(c => c.id === id)?.name || "the child";

  /* sentence starters — gentle scaffolding, no AI, teacher writes it */
  const STARTERS = [
    "Today I noticed…",
    "… showed me that they can…",
    "With growing confidence, … ",
    "… was deeply involved in…",
    "A clear next step is to…",
  ];
  const insertStarter = (s) =>
    setPolished(prev => (prev ? prev + (prev.endsWith(" ") ? "" : " ") : "") + s + " ");

  const goRefine = () => {
    setStep(2);
    if (!polished) setPolished(rawNote);
  };

  const save = (asDraft) => {
    const base = {
      id: "o" + Date.now(),
      ts: Date.now(),
      pathwayId, skills, photo,
      raw: rawNote,
      text: polished || rawNote,
      nextStep,
      draft: asDraft,
    };
    if (isGroup) {
      // store one observation per child in the group, linked
      const gid = "g" + Date.now();
      groupIds.forEach((id, i) => {
        onSave({ ...base, id: base.id + "_" + i, childId: id, groupId: gid, groupSize: groupIds.length });
      });
    } else {
      onSave({ ...base, childId });
    }
  };

  return (
    <div className="no-print" style={{
      position: "fixed", inset: 0, zIndex: 80, background: "rgba(74,56,38,0.32)",
      backdropFilter: "blur(3px)", display: "flex", alignItems: "flex-end", justifyContent: "center",
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="rise" style={{
        background: c.cream, width: "100%", maxWidth: 620, maxHeight: "94vh", overflowY: "auto",
        borderRadius: "22px 22px 0 0", border: `1px solid ${c.line}`,
        boxShadow: "0 -10px 40px rgba(74,56,38,0.25)",
      }}>
        {/* header */}
        <div style={{
          position: "sticky", top: 0, background: c.cream, zIndex: 2,
          padding: "16px 20px 12px", borderBottom: `1px solid ${c.line}`,
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <div style={{
            width: 30, height: 30, borderRadius: 9, background: c.sage + "26",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
          }}>📝</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 16, fontWeight: 700, color: c.brown }}>
              {step === 1 ? "Quick capture" : "Refine & save"}
            </div>
            <div style={{ fontSize: 11, color: c.brownLt }}>
              {step === 1 ? "Tag the moment now — under 30 seconds" : "Tidy the wording, add a next step"}
            </div>
          </div>
          <button onClick={onClose} className="tap" style={{
            border: "none", background: c.white, borderRadius: 9, width: 30, height: 30,
            fontSize: 17, color: c.brownLt, cursor: "pointer", border: `1px solid ${c.line}`,
          }}>×</button>
        </div>

        {/* step dots */}
        <div style={{ display: "flex", gap: 6, padding: "10px 20px 0" }}>
          {[1,2].map(s => (
            <div key={s} style={{
              flex: 1, height: 4, borderRadius: 3,
              background: step >= s ? c.sage : c.line,
            }} />
          ))}
        </div>

        {step === 1 && (
          <div style={{ padding: "14px 20px 20px" }}>
            {/* group toggle */}
            <div style={{ display: "flex", gap: 6, marginBottom: 13 }}>
              <ModeBtn active={!isGroup} onClick={() => setIsGroup(false)} label="One child" icon="🧒" />
              <ModeBtn active={isGroup} onClick={() => setIsGroup(true)} label="Group" icon="👥" />
            </div>

            {/* child select */}
            <FieldLabel>{isGroup ? "Which children?" : "Which child?"}</FieldLabel>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 15 }}>
              {children.map(ch => {
                const on = isGroup ? groupIds.includes(ch.id) : childId === ch.id;
                return (
                  <button key={ch.id} className="tap"
                    onClick={() => isGroup ? toggleGroupChild(ch.id) : setChildId(ch.id)}
                    style={{
                      display: "flex", alignItems: "center", gap: 7, cursor: "pointer",
                      padding: "5px 11px 5px 5px", borderRadius: 30, fontFamily: FONT_BODY,
                      background: on ? c.sage : c.white,
                      border: `1.5px solid ${on ? c.sage : c.line}`,
                      color: on ? c.white : c.ink,
                    }}>
                    <Avatar name={ch.name} photo={ch.photo} size={24} color={on ? c.white : c.sage} />
                    <span style={{ fontSize: 12, fontWeight: 600 }}>{ch.name.split(" ")[0]}</span>
                  </button>
                );
              })}
            </div>

            {/* rough note */}
            <FieldLabel>What did you see? <span style={{ color: c.brownLt, fontWeight: 400 }}>— rough notes are fine</span></FieldLabel>
            <textarea
              value={rawNote} onChange={e => setRawNote(e.target.value)}
              placeholder="e.g. built tall tower with blocks, counted to 6, knocked it down laughing, tried again straight away"
              style={{
                width: "100%", minHeight: 70, resize: "vertical", border: `1px solid ${c.line}`,
                borderRadius: 12, padding: "10px 12px", fontSize: 13, fontFamily: FONT_BODY,
                background: c.white, color: c.ink, outline: "none", lineHeight: 1.55, marginBottom: 15,
              }}
            />

            {/* pathway */}
            <FieldLabel>Developmental focus</FieldLabel>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 15 }}>
              {livePathways().map(p => {
                const on = pathwayId === p.id;
                return (
                  <button key={p.id} className="tap"
                    onClick={() => { setPathwayId(on ? "" : p.id); setSkills([]); }}
                    style={{
                      cursor: "pointer", fontFamily: FONT_BODY, fontSize: 11.5, fontWeight: 600,
                      padding: "5px 10px", borderRadius: 20,
                      background: on ? p.color : p.color + "1F",
                      color: on ? c.white : c.ink,
                      border: `1px solid ${p.color}${on ? "" : "55"}`,
                    }}>
                    {p.icon} {p.label}
                  </button>
                );
              })}
            </div>

            {/* quick skills */}
            {pathwayId && (
              <>
                <FieldLabel>Quick-tag what you noticed</FieldLabel>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 15 }}>
                  {getSkills(pathwayId).map(s => {
                    const on = skills.includes(s);
                    return (
                      <button key={s} className="tap" onClick={() => toggleSkill(s)} style={{
                        cursor: "pointer", fontFamily: FONT_BODY, fontSize: 11.5, fontWeight: 600,
                        padding: "5px 10px", borderRadius: 20,
                        background: on ? c.brown : c.white,
                        color: on ? c.white : c.brownLt,
                        border: `1px solid ${on ? c.brown : c.line}`,
                      }}>
                        {on ? "✓ " : ""}{s}
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {/* photo */}
            <FieldLabel>Photo <span style={{ color: c.brownLt, fontWeight: 400 }}>— optional</span></FieldLabel>
            <div style={{ marginBottom: 18 }}>
              {photo ? (
                <div style={{ position: "relative", display: "inline-block" }}>
                  <img src={photo} alt="" style={{
                    maxHeight: 120, borderRadius: 12, border: `1px solid ${c.line}`, display: "block",
                  }} />
                  <button onClick={() => setPhoto(null)} className="tap" style={{
                    position: "absolute", top: 6, right: 6, border: "none",
                    background: "rgba(74,56,38,0.8)", color: c.white, borderRadius: 8,
                    width: 24, height: 24, cursor: "pointer", fontSize: 14,
                  }}>×</button>
                </div>
              ) : (
                <button className="tap" onClick={() => fileRef.current.click()} style={{
                  display: "flex", alignItems: "center", gap: 8, cursor: "pointer",
                  background: c.white, border: `1.5px dashed ${c.sage}88`, borderRadius: 12,
                  padding: "11px 16px", fontFamily: FONT_BODY, fontSize: 12.5,
                  color: c.sageDk, fontWeight: 600,
                }}>
                  <span style={{ fontSize: 16 }}>📷</span> Add a photo
                </button>
              )}
              <input ref={fileRef} type="file" accept="image/*" capture="environment"
                onChange={onPhoto} style={{ display: "none" }} />
            </div>

            {/* actions */}
            <div style={{ display: "flex", gap: 8 }}>
              <button className="tap" disabled={!canCapture}
                onClick={() => save(true)}
                style={{
                  flex: 1, cursor: canCapture ? "pointer" : "not-allowed",
                  background: c.white, color: canCapture ? c.brown : c.brownLt,
                  border: `1.5px solid ${c.line}`, borderRadius: 12, padding: "12px",
                  fontFamily: FONT_BODY, fontSize: 13, fontWeight: 700,
                  opacity: canCapture ? 1 : 0.55,
                }}>
                Save as draft
              </button>
              <button className="tap" disabled={!canCapture}
                onClick={goRefine}
                style={{
                  flex: 1.4, cursor: canCapture ? "pointer" : "not-allowed",
                  background: canCapture ? c.sage : c.line, color: c.white,
                  border: "none", borderRadius: 12, padding: "12px",
                  fontFamily: FONT_BODY, fontSize: 13, fontWeight: 700,
                }}>
                Refine & write up →
              </button>
            </div>
            <div style={{ fontSize: 10.5, color: c.brownLt, textAlign: "center", marginTop: 9 }}>
              Drafts wait for you in Observations — finish them when you have a quiet moment.
            </div>
          </div>
        )}

        {step === 2 && (
          <div style={{ padding: "14px 20px 20px" }}>
            {/* summary chip row */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
              {(isGroup ? groupIds : [childId]).map(id => (
                <Pill key={id} color={c.sage}>{childName(id).split(" ")[0]}</Pill>
              ))}
              {pathwayId && <Pill color={pathway(pathwayId).color}>{pathway(pathwayId).icon} {pathway(pathwayId).label}</Pill>}
            </div>

            {/* Sentence starters — gentle scaffolding, teacher writes */}
            <div style={{
              background: `linear-gradient(135deg, ${c.blueLt}, ${c.white})`,
              border: `1px solid ${c.blue}66`, borderRadius: 14, padding: 13, marginBottom: 14,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 9 }}>
                <span style={{ fontSize: 16 }}>✍️</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: c.brown }}>Sentence starters</div>
                  <div style={{ fontSize: 11, color: c.brownLt }}>
                    Tap one to drop it into your observation — then write in your own words.
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {STARTERS.map((s, i) => (
                  <button key={i} className="tap" onClick={() => insertStarter(s)} style={{
                    background: c.white, color: c.brown, border: `1px solid ${c.blue}66`,
                    borderRadius: 20, padding: "5px 11px", fontSize: 11.5, fontWeight: 600,
                    cursor: "pointer", fontFamily: FONT_BODY,
                  }}>{s}</button>
                ))}
              </div>
            </div>

            {/* observation text */}
            <FieldLabel>Observation</FieldLabel>
            <textarea
              value={polished} onChange={e => setPolished(e.target.value)}
              placeholder="Write the observation in your own words — what the child did, and the learning it shows."
              style={{
                width: "100%", minHeight: 130, resize: "vertical", border: `1px solid ${c.line}`,
                borderRadius: 12, padding: "11px 13px", fontSize: 13, fontFamily: FONT_BODY,
                background: c.white, color: c.ink, outline: "none", lineHeight: 1.6, marginBottom: 14,
              }}
            />

            {/* next step */}
            <FieldLabel>Next step <span style={{ color: c.brownLt, fontWeight: 400 }}>— what you'll plan next</span></FieldLabel>
            <textarea
              value={nextStep} onChange={e => setNextStep(e.target.value)}
              placeholder="One concrete next step…"
              style={{
                width: "100%", minHeight: 56, resize: "vertical", border: `1px solid ${c.line}`,
                borderRadius: 12, padding: "11px 13px", fontSize: 13, fontFamily: FONT_BODY,
                background: c.white, color: c.ink, outline: "none", lineHeight: 1.55, marginBottom: 16,
              }}
            />

            {photo && (
              <img src={photo} alt="" style={{
                maxHeight: 110, borderRadius: 12, border: `1px solid ${c.line}`,
                display: "block", marginBottom: 16,
              }} />
            )}

            <div style={{ display: "flex", gap: 8 }}>
              <button className="tap" onClick={() => setStep(1)} style={{
                cursor: "pointer", background: c.white, color: c.brownLt,
                border: `1.5px solid ${c.line}`, borderRadius: 12, padding: "12px 16px",
                fontFamily: FONT_BODY, fontSize: 13, fontWeight: 700,
              }}>← Back</button>
              <button className="tap" onClick={() => save(true)} style={{
                flex: 1, cursor: "pointer", background: c.white, color: c.brown,
                border: `1.5px solid ${c.line}`, borderRadius: 12, padding: "12px",
                fontFamily: FONT_BODY, fontSize: 13, fontWeight: 700,
              }}>Save as draft</button>
              <button className="tap" onClick={() => save(false)} style={{
                flex: 1.3, cursor: "pointer", background: c.sage, color: c.white,
                border: "none", borderRadius: 12, padding: "12px",
                fontFamily: FONT_BODY, fontSize: 13, fontWeight: 700,
              }}>✓ Save observation</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ModeBtn({ active, onClick, label, icon }) {
  return (
    <button className="tap" onClick={onClick} style={{
      flex: 1, cursor: "pointer", fontFamily: FONT_BODY, fontSize: 12.5, fontWeight: 700,
      padding: "9px", borderRadius: 11,
      background: active ? c.brown : c.white,
      color: active ? c.white : c.brownLt,
      border: `1.5px solid ${active ? c.brown : c.line}`,
      display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
    }}>
      <span>{icon}</span> {label}
    </button>
  );
}

function FieldLabel({ children }) {
  return (
    <div style={{
      fontSize: 11.5, fontWeight: 700, color: c.brown, marginBottom: 7,
      letterSpacing: 0.2,
    }}>{children}</div>
  );
}

/* ════════════════════════════════════════════════════════════════
   OBSERVATION SYSTEM  (list, filter, drafts, export)
   ════════════════════════════════════════════════════════════════ */
function ObservationSystem({
  children, observations, onCapture, updateObservation, deleteObservation, duplicateObservation, openChild, gotoManage, vp,
}) {
  const [filterChild, setFilterChild] = useState("");
  const [filterPathway, setFilterPathway] = useState("");
  const [showDrafts, setShowDrafts] = useState("active"); // active | drafts | done | pinned | archived
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(null);

  let list = [...observations];
  // Default views hide archived; "archived" view shows only archived
  if (showDrafts === "archived") list = list.filter(o => o.archived);
  else list = list.filter(o => !o.archived);
  if (filterChild) list = list.filter(o => o.childId === filterChild);
  if (filterPathway) list = list.filter(o => o.pathwayId === filterPathway);
  if (showDrafts === "drafts") list = list.filter(o => o.draft);
  if (showDrafts === "done") list = list.filter(o => !o.draft);
  if (showDrafts === "pinned") list = list.filter(o => o.pinned);
  if (search.trim()) {
    const q = search.toLowerCase();
    list = list.filter(o =>
      (o.text || "").toLowerCase().includes(q) ||
      (o.raw || "").toLowerCase().includes(q) ||
      (o.skills || []).some(s => s.toLowerCase().includes(q)));
  }
  // Pinned first, then by timestamp
  list.sort((a,b) => {
    if (!!a.pinned !== !!b.pinned) return a.pinned ? -1 : 1;
    return b.ts - a.ts;
  });

  const childName = (id) => children.find(c => c.id === id)?.name || "Unknown";
  const draftCount = observations.filter(o => o.draft && !o.archived).length;
  const pinnedCount = observations.filter(o => o.pinned && !o.archived).length;
  const archivedCount = observations.filter(o => o.archived).length;

  /* group rendering: collapse linked group observations into one card row */
  const seenGroups = new Set();

  const exportHTML = () => {
    const rows = list.map(o => {
      const p = o.pathwayId ? pathway(o.pathwayId) : null;
      return `
        <div class="obs">
          <div class="obs-h">
            <strong>${childName(o.childId)}</strong>
            <span class="meta">${new Date(o.ts).toLocaleDateString(undefined,{day:"numeric",month:"long",year:"numeric"})}
            ${o.draft ? ' &middot; <em style="color:#C8765A">draft</em>' : ''}</span>
          </div>
          ${p ? `<div class="tag" style="background:${p.color}22;color:#4A3826;border:1px solid ${p.color}">${p.icon} ${p.label}</div>` : ''}
          ${(o.skills||[]).map(s=>`<span class="skill">${s}</span>`).join("")}
          <p>${(o.text||o.raw||"").replace(/</g,"&lt;")}</p>
          ${o.nextStep ? `<div class="next"><strong>Next step:</strong> ${o.nextStep.replace(/</g,"&lt;")}</div>` : ''}
          ${o.photo ? `<img src="${o.photo}" />` : ''}
        </div>`;
    }).join("");
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Brownie Bear Academy — Observations Export</title>
      <style>
        body{font-family:Georgia,serif;color:#4A3826;max-width:780px;margin:30px auto;padding:0 24px;background:#FDF8EF;}
        h1{color:#6E4A2F;font-size:24px;margin-bottom:2px;}
        .sub{color:#8BA678;letter-spacing:2px;text-transform:uppercase;font-size:12px;margin-bottom:24px;}
        .obs{background:#fff;border:1px solid #E7DEC9;border-radius:14px;padding:16px 18px;margin-bottom:14px;}
        .obs-h{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:6px;}
        .meta{font-size:12px;color:#A8855F;}
        .tag{display:inline-block;font-size:11px;font-weight:bold;padding:3px 9px;border-radius:20px;margin:2px 4px 6px 0;}
        .skill{display:inline-block;font-size:10.5px;background:#F7F0E1;color:#6E4A2F;padding:2px 8px;border-radius:20px;margin:2px 4px 2px 0;}
        p{font-size:14px;line-height:1.6;}
        .next{background:#E8EEDF;border-radius:9px;padding:8px 11px;font-size:13px;margin-top:6px;}
        img{max-width:240px;border-radius:10px;margin-top:8px;display:block;}
        @media print{body{background:#fff;}}
      </style></head><body>
      <h1>Brownie Bear Academy</h1>
      <div class="sub">Observation Records &middot; ${new Date().toLocaleDateString(undefined,{day:"numeric",month:"long",year:"numeric"})}</div>
      ${rows || "<p>No observations match the current filters.</p>"}
      </body></html>`;
    const w = window.open("", "_blank");
    if (w) { w.document.write(html); w.document.close(); }
  };

  return (
    <div className="rise">
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
        <h1 style={{
          margin: 0, fontFamily: FONT_DISPLAY, fontSize: 24, color: c.brown, fontWeight: 700,
        }}>Observations</h1>
        <div style={{ flex: 1 }} />
        <button className="tap no-print" onClick={exportHTML} style={{
          background: c.white, border: `1.5px solid ${c.line}`, borderRadius: 11,
          padding: "9px 14px", fontSize: 12.5, fontWeight: 700, color: c.brown,
          cursor: "pointer", fontFamily: FONT_BODY,
        }}>⤓ Export / print</button>
        <button className="tap no-print" onClick={onCapture} style={{
          background: c.sage, border: "none", borderRadius: 11,
          padding: "9px 15px", fontSize: 12.5, fontWeight: 700, color: c.white,
          cursor: "pointer", fontFamily: FONT_BODY,
        }}>＋ Capture</button>
      </div>
      <div style={{ fontSize: 12.5, color: c.brownLt, marginBottom: 16 }}>
        {observations.length} total · {draftCount} {draftCount === 1 ? "draft" : "drafts"} waiting ·
        searchable & filterable · everything saved automatically
      </div>

      {/* filters */}
      <Card className="no-print" pad={13} style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 7, flexWrap: "wrap", alignItems: "center" }}>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="🔍 Search observations, skills, words…"
            style={{
              flex: "1 1 220px", border: `1px solid ${c.line}`, borderRadius: 10,
              padding: "9px 12px", fontSize: 12.5, fontFamily: FONT_BODY,
              background: c.cream, color: c.ink, outline: "none",
            }}
          />
          <div style={{ display: "flex", gap: 4, background: c.cream, padding: 3, borderRadius: 10, border: `1px solid ${c.line}`, overflowX: "auto" }}>
            {[
              ["active","All", null],
              ["drafts","Drafts", draftCount],
              ["done","Finished", null],
              ["pinned","📌 Pinned", pinnedCount],
              ["archived","Archived", archivedCount],
            ].map(([k,l,count]) => (
              <button key={k} className="tap" onClick={() => setShowDrafts(k)} style={{
                border: "none", cursor: "pointer", fontFamily: FONT_BODY, fontSize: 11.5, fontWeight: 600,
                padding: "6px 11px", borderRadius: 7, whiteSpace: "nowrap",
                background: showDrafts === k ? c.brown : "transparent",
                color: showDrafts === k ? c.white : c.brownLt,
              }}>{l}{count != null && count > 0 ? ` · ${count}` : ""}</button>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
          <Pill color={c.sage} active={!filterChild} onClick={() => setFilterChild("")}>All children</Pill>
          {children.map(ch => (
            <Pill key={ch.id} color={c.sage} active={filterChild === ch.id}
              onClick={() => setFilterChild(filterChild === ch.id ? "" : ch.id)}>
              {ch.name.split(" ")[0]}
            </Pill>
          ))}
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 7, alignItems: "center" }}>
          <Pill color={c.brownLt} active={!filterPathway} onClick={() => setFilterPathway("")}>All pathways</Pill>
          {livePathways().map(p => (
            <Pill key={p.id} color={p.color} active={filterPathway === p.id}
              onClick={() => setFilterPathway(filterPathway === p.id ? "" : p.id)}>
              {p.icon} {p.label}
            </Pill>
          ))}
          {gotoManage && (
            <button className="tap" onClick={gotoManage} style={{
              background: c.white, border: `1.5px dashed ${c.sage}88`, borderRadius: 20,
              padding: "5px 12px", fontSize: 11.5, fontWeight: 700, color: c.sageDk,
              cursor: "pointer", fontFamily: FONT_BODY,
            }}>✎ Add or edit pathways</button>
          )}
        </div>
      </Card>

      {/* list */}
      {list.length === 0 ? (
        <Card style={{ textAlign: "center", padding: 40 }}>
          <div style={{ fontSize: 34, marginBottom: 8 }}>🌱</div>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 16, color: c.brown, fontWeight: 700 }}>
            {observations.length === 0 ? "No observations yet" : "Nothing matches those filters"}
          </div>
          <div style={{ fontSize: 12.5, color: c.brownLt, marginTop: 4 }}>
            {observations.length === 0
              ? "Tap Capture to record your first learning moment."
              : "Try clearing a filter or search term."}
          </div>
        </Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
          {list.map(o => {
            if (o.groupId) {
              if (seenGroups.has(o.groupId)) return null;
              seenGroups.add(o.groupId);
            }
            const groupMembers = o.groupId
              ? observations.filter(x => x.groupId === o.groupId)
              : null;
            return (
              <ObservationCard
                key={o.id} o={o}
                groupMembers={groupMembers}
                childName={childName}
                expanded={expanded === o.id}
                onToggle={() => setExpanded(expanded === o.id ? null : o.id)}
                updateObservation={updateObservation}
                deleteObservation={deleteObservation}
                duplicateObservation={duplicateObservation}
                openChild={openChild}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function ObservationCard({
  o, groupMembers, childName, expanded, onToggle,
  updateObservation, deleteObservation, duplicateObservation, openChild,
}) {
  const p = o.pathwayId ? pathway(o.pathwayId) : null;
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(o.text || o.raw || "");
  const [next, setNext] = useState(o.nextStep || "");

  const saveEdit = () => {
    updateObservation(o.id, { text, nextStep: next });
    if (groupMembers) {
      groupMembers.forEach(m => m.id !== o.id && updateObservation(m.id, { text, nextStep: next }));
    }
    setEditing(false);
  };
  const markDone = () => {
    updateObservation(o.id, { draft: false });
    if (groupMembers) groupMembers.forEach(m => updateObservation(m.id, { draft: false }));
  };
  const togglePin = (e) => {
    e?.stopPropagation();
    updateObservation(o.id, { pinned: !o.pinned });
    if (groupMembers) groupMembers.forEach(m => m.id !== o.id && updateObservation(m.id, { pinned: !o.pinned }));
  };
  const toggleArchive = () => {
    updateObservation(o.id, { archived: !o.archived });
    if (groupMembers) groupMembers.forEach(m => m.id !== o.id && updateObservation(m.id, { archived: !o.archived }));
  };
  const duplicate = () => {
    if (duplicateObservation) duplicateObservation(o.id);
  };
  const remove = () => {
    if (groupMembers) groupMembers.forEach(m => deleteObservation(m.id));
    else deleteObservation(o.id);
  };

  return (
    <Card pad={0} style={{
      overflow: "hidden",
      borderColor: o.pinned ? c.yellow + "AA" : o.draft ? c.terra + "66" : c.line,
      borderWidth: o.pinned ? 2 : 1, borderStyle: "solid",
      opacity: o.archived ? 0.7 : 1,
    }}>
      {/* header row */}
      <div onClick={onToggle} className="tap" style={{
        display: "flex", alignItems: "center", gap: 11, padding: "13px 15px", cursor: "pointer",
        background: o.pinned ? c.yellowLt + "AA" : o.draft ? c.terraLt + "88" : c.white,
      }}>
        {groupMembers ? (
          <div style={{
            width: 38, height: 38, borderRadius: "50%", background: c.blue + "26",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
            border: `1.5px solid ${c.blue}55`, flexShrink: 0,
          }}>👥</div>
        ) : (
          <Avatar name={childName(o.childId)} size={38} />
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: c.brown }}>
            {groupMembers
              ? `Group · ${groupMembers.length} children`
              : childName(o.childId)}
            {o.draft && (
              <span style={{
                marginLeft: 8, fontSize: 10, fontWeight: 700, color: c.terra,
                background: c.white, border: `1px solid ${c.terra}66`,
                borderRadius: 20, padding: "1px 7px",
              }}>draft</span>
            )}
            {o.pinned && (
              <span style={{
                marginLeft: 6, fontSize: 11, color: c.brown,
              }} title="Pinned">📌</span>
            )}
            {o.archived && (
              <span style={{
                marginLeft: 8, fontSize: 10, fontWeight: 700, color: c.brownLt,
                background: c.paper, border: `1px solid ${c.line}`,
                borderRadius: 20, padding: "1px 7px",
              }}>archived</span>
            )}
          </div>
          <div style={{
            fontSize: 11.5, color: c.brownLt, whiteSpace: "nowrap",
            overflow: "hidden", textOverflow: "ellipsis",
          }}>
            {timeAgo(o.ts)} · {(o.text || o.raw || "untitled").slice(0, 60)}
            {(o.text || o.raw || "").length > 60 ? "…" : ""}
          </div>
        </div>
        {p && (
          <div style={{
            fontSize: 16, width: 30, height: 30, borderRadius: 9, flexShrink: 0,
            background: p.color + "26", display: "flex", alignItems: "center", justifyContent: "center",
          }} title={p.label}>{p.icon}</div>
        )}
        <div style={{ fontSize: 13, color: c.brownLt, transform: expanded ? "rotate(180deg)" : "none", transition: "transform .2s" }}>⌄</div>
      </div>

      {/* expanded body */}
      {expanded && (
        <div style={{ padding: "4px 15px 15px", borderTop: `1px solid ${c.line}` }}>
          {groupMembers && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5, margin: "11px 0 4px" }}>
              {groupMembers.map(m => (
                <Pill key={m.id} color={c.sage} onClick={() => openChild(m.childId)}>
                  {childName(m.childId).split(" ")[0]}
                </Pill>
              ))}
            </div>
          )}
          {p && (
            <div style={{ margin: "11px 0 8px" }}>
              <Pill color={p.color}>{p.icon} {p.label}</Pill>
            </div>
          )}
          {(o.skills || []).length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 11 }}>
              {o.skills.map(s => (
                <span key={s} style={{
                  fontSize: 10.5, background: c.paper, color: c.brown,
                  padding: "3px 9px", borderRadius: 20, fontWeight: 600,
                }}>{s}</span>
              ))}
            </div>
          )}

          {editing ? (
            <>
              <FieldLabel>Observation</FieldLabel>
              <textarea value={text} onChange={e => setText(e.target.value)} style={{
                width: "100%", minHeight: 90, resize: "vertical", border: `1px solid ${c.line}`,
                borderRadius: 11, padding: "10px 12px", fontSize: 13, fontFamily: FONT_BODY,
                background: c.cream, color: c.ink, outline: "none", lineHeight: 1.6, marginBottom: 10,
              }} />
              <FieldLabel>Next step</FieldLabel>
              <textarea value={next} onChange={e => setNext(e.target.value)} style={{
                width: "100%", minHeight: 54, resize: "vertical", border: `1px solid ${c.line}`,
                borderRadius: 11, padding: "10px 12px", fontSize: 13, fontFamily: FONT_BODY,
                background: c.cream, color: c.ink, outline: "none", lineHeight: 1.55, marginBottom: 11,
              }} />
              <div style={{ display: "flex", gap: 7 }}>
                <button className="tap" onClick={() => setEditing(false)} style={{
                  cursor: "pointer", background: c.white, color: c.brownLt,
                  border: `1.5px solid ${c.line}`, borderRadius: 10, padding: "9px 14px",
                  fontFamily: FONT_BODY, fontSize: 12.5, fontWeight: 700,
                }}>Cancel</button>
                <button className="tap" onClick={saveEdit} style={{
                  cursor: "pointer", background: c.sage, color: c.white, border: "none",
                  borderRadius: 10, padding: "9px 16px", fontFamily: FONT_BODY,
                  fontSize: 12.5, fontWeight: 700,
                }}>Save changes</button>
              </div>
            </>
          ) : (
            <>
              <p style={{
                fontSize: 13.5, lineHeight: 1.65, color: c.ink, margin: "0 0 11px",
                fontFamily: FONT_DISPLAY,
              }}>{o.text || o.raw || <em style={{ color: c.brownLt }}>No write-up yet — this is a draft.</em>}</p>

              {o.nextStep && (
                <div style={{
                  background: c.sageLt, borderRadius: 11, padding: "10px 12px", marginBottom: 11,
                  borderLeft: `3px solid ${c.sage}`,
                }}>
                  <div style={{ fontSize: 10.5, fontWeight: 700, color: c.sageDk, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 2 }}>
                    Next step
                  </div>
                  <div style={{ fontSize: 12.5, color: c.ink, lineHeight: 1.5 }}>{o.nextStep}</div>
                </div>
              )}

              {o.photo && (
                <img src={o.photo} alt="" style={{
                  maxHeight: 200, borderRadius: 12, border: `1px solid ${c.line}`,
                  display: "block", marginBottom: 11,
                }} />
              )}

              <div style={{
                fontSize: 11, color: c.brownLt, marginBottom: 11,
              }}>
                Recorded {new Date(o.ts).toLocaleString(undefined, {
                  weekday: "short", day: "numeric", month: "short",
                  hour: "2-digit", minute: "2-digit",
                })}
              </div>

              <div className="no-print" style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                <button className="tap" onClick={() => setEditing(true)} style={{
                  cursor: "pointer", background: c.white, color: c.brown,
                  border: `1.5px solid ${c.line}`, borderRadius: 10, padding: "8px 13px",
                  fontFamily: FONT_BODY, fontSize: 12, fontWeight: 700,
                }}>✎ Edit</button>
                {o.draft && (
                  <button className="tap" onClick={markDone} style={{
                    cursor: "pointer", background: c.sage, color: c.white, border: "none",
                    borderRadius: 10, padding: "8px 13px", fontFamily: FONT_BODY,
                    fontSize: 12, fontWeight: 700,
                  }}>✓ Mark finished</button>
                )}
                <button className="tap" onClick={togglePin} style={{
                  cursor: "pointer",
                  background: o.pinned ? c.yellow : c.white,
                  color: o.pinned ? c.brown : c.brownLt,
                  border: `1.5px solid ${o.pinned ? c.yellow : c.line}`,
                  borderRadius: 10, padding: "8px 13px",
                  fontFamily: FONT_BODY, fontSize: 12, fontWeight: 700,
                }}>📌 {o.pinned ? "Pinned" : "Pin"}</button>
                {duplicateObservation && !groupMembers && (
                  <button className="tap" onClick={duplicate} style={{
                    cursor: "pointer", background: c.white, color: c.brown,
                    border: `1.5px solid ${c.line}`, borderRadius: 10, padding: "8px 13px",
                    fontFamily: FONT_BODY, fontSize: 12, fontWeight: 700,
                  }}>⎘ Duplicate</button>
                )}
                <button className="tap" onClick={toggleArchive} style={{
                  cursor: "pointer", background: c.white, color: c.brownLt,
                  border: `1.5px solid ${c.line}`, borderRadius: 10, padding: "8px 13px",
                  fontFamily: FONT_BODY, fontSize: 12, fontWeight: 700,
                }}>{o.archived ? "↺ Unarchive" : "📦 Archive"}</button>
                {!groupMembers && (
                  <button className="tap" onClick={() => openChild(o.childId)} style={{
                    cursor: "pointer", background: c.white, color: c.sageDk,
                    border: `1.5px solid ${c.line}`, borderRadius: 10, padding: "8px 13px",
                    fontFamily: FONT_BODY, fontSize: 12, fontWeight: 700,
                  }}>Open child profile →</button>
                )}
                <div style={{ flex: 1 }} />
                <button className="tap" onClick={remove} style={{
                  cursor: "pointer", background: "transparent", color: c.terra,
                  border: `1px solid ${c.terra}55`, borderRadius: 10, padding: "8px 13px",
                  fontFamily: FONT_BODY, fontSize: 12, fontWeight: 700,
                }}>Delete</button>
              </div>
            </>
          )}
        </div>
      )}
    </Card>
  );
}

/* ════════════════════════════════════════════════════════════════
   CHILD PROFILE  (snapshot + their observations + export)
   ════════════════════════════════════════════════════════════════ */
function ChildProfile({ child, observations, assessment, setAssessmentCell, onBack, onCapture, updateChild, removeChild, vp }) {
  const [tab, setTab] = useState("timeline"); // timeline | assessment | about
  const [confirmRemove, setConfirmRemove] = useState(false);
  if (!child) return null;

  const finished = observations.filter(o => !o.draft);
  const byPathway = {};
  finished.forEach(o => {
    if (o.pathwayId) byPathway[o.pathwayId] = (byPathway[o.pathwayId] || 0) + 1;
  });

  const exportJourney = () => {
    const obsRows = [...observations].sort((a,b)=>b.ts-a.ts).map(o => {
      const p = o.pathwayId ? pathway(o.pathwayId) : null;
      return `<div class="obs">
        <div class="meta">${new Date(o.ts).toLocaleDateString(undefined,{day:"numeric",month:"long",year:"numeric"})}${o.draft?' &middot; <em>draft</em>':''}</div>
        ${p?`<span class="tag" style="background:${p.color}22;border:1px solid ${p.color}">${p.icon} ${p.label}</span>`:''}
        <p>${(o.text||o.raw||"").replace(/</g,"&lt;")}</p>
        ${o.nextStep?`<div class="next"><strong>Next step:</strong> ${o.nextStep.replace(/</g,"&lt;")}</div>`:''}
        ${o.photo?`<img src="${o.photo}"/>`:''}
      </div>`;
    }).join("");
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${child.name} — Learning Journey</title>
      <style>
        body{font-family:Georgia,serif;color:#4A3826;max-width:760px;margin:30px auto;padding:0 24px;background:#FDF8EF;}
        h1{color:#6E4A2F;margin-bottom:0;}
        .sub{color:#8BA678;letter-spacing:2px;text-transform:uppercase;font-size:12px;margin-bottom:6px;}
        .card{background:#fff;border:1px solid #E7DEC9;border-radius:14px;padding:16px 18px;margin-bottom:14px;}
        .obs{background:#fff;border:1px solid #E7DEC9;border-radius:14px;padding:14px 16px;margin-bottom:12px;}
        .meta{font-size:12px;color:#A8855F;margin-bottom:5px;}
        .tag{display:inline-block;font-size:11px;font-weight:bold;padding:3px 9px;border-radius:20px;margin-bottom:6px;color:#4A3826;}
        p{font-size:14px;line-height:1.6;}
        .next{background:#E8EEDF;border-radius:9px;padding:8px 11px;font-size:13px;margin-top:6px;}
        img{max-width:240px;border-radius:10px;margin-top:8px;display:block;}
        .chips span{display:inline-block;background:#F7F0E1;border-radius:20px;padding:3px 10px;font-size:12px;margin:2px 4px 2px 0;}
        @media print{body{background:#fff;}}
      </style></head><body>
      <div class="sub">Brownie Bear Academy &middot; Learning Journey</div>
      <h1>${child.name}</h1>
      <div class="meta">Age ${ageOf(child.dob)} &middot; ${finished.length} observations</div>
      <div class="card">
        <strong>Interests:</strong><div class="chips">${(child.interests||[]).map(i=>`<span>${i}</span>`).join("")||"—"}</div>
        <strong>Strengths:</strong><div class="chips">${(child.strengths||[]).map(i=>`<span>${i}</span>`).join("")||"—"}</div>
        <strong>Support strategies:</strong><div class="chips">${(child.support||[]).map(i=>`<span>${i}</span>`).join("")||"—"}</div>
      </div>
      ${obsRows||"<p>No observations recorded yet.</p>"}
      </body></html>`;
    const w = window.open("", "_blank");
    if (w) { w.document.write(html); w.document.close(); }
  };

  return (
    <div className="rise">
      <button className="tap no-print" onClick={onBack} style={{
        border: "none", background: "none", color: c.sageDk, cursor: "pointer",
        fontFamily: FONT_BODY, fontSize: 12.5, fontWeight: 700, marginBottom: 12,
        display: "flex", alignItems: "center", gap: 5,
      }}>← Back to observations</button>

      {/* header card */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 15, alignItems: "center", flexWrap: "wrap" }}>
          <Avatar name={child.name} photo={child.photo} size={62} />
          <div style={{ flex: 1, minWidth: 160 }}>
            <h1 style={{
              margin: 0, fontFamily: FONT_DISPLAY, fontSize: 23, color: c.brown, fontWeight: 700,
            }}>{child.name}</h1>
            <div style={{ fontSize: 12.5, color: c.brownLt, marginTop: 2 }}>
              Age {ageOf(child.dob)} · {finished.length} finished observation{finished.length===1?"":"s"}
              {child.keyPerson && " · your key child"}
            </div>
          </div>
          <div className="no-print" style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
            <button className="tap" onClick={exportJourney} style={{
              background: c.white, border: `1.5px solid ${c.line}`, borderRadius: 11,
              padding: "9px 13px", fontSize: 12, fontWeight: 700, color: c.brown,
              cursor: "pointer", fontFamily: FONT_BODY,
            }}>⤓ Learning journey</button>
            <button className="tap" onClick={onCapture} style={{
              background: c.sage, border: "none", borderRadius: 11,
              padding: "9px 14px", fontSize: 12, fontWeight: 700, color: c.white,
              cursor: "pointer", fontFamily: FONT_BODY,
            }}>＋ Observe</button>
            {removeChild && (
              <button className="tap" onClick={() => setConfirmRemove(true)} style={{
                background: "transparent", border: `1px solid ${c.terra}55`, borderRadius: 11,
                padding: "9px 12px", fontSize: 12, fontWeight: 700, color: c.terra,
                cursor: "pointer", fontFamily: FONT_BODY,
              }}>🗑 Remove</button>
            )}
          </div>
        </div>

        {confirmRemove && (
          <ConfirmModal
            title={`Remove ${child.name}?`}
            body={`This permanently deletes ${child.name}'s profile, all their observations and assessment records. This cannot be undone.`}
            confirmLabel="Remove child"
            onCancel={() => setConfirmRemove(false)}
            onConfirm={() => { setConfirmRemove(false); removeChild(); }}
          />
        )}

        {/* pathway snapshot */}
        {Object.keys(byPathway).length > 0 && (
          <div style={{ marginTop: 15, paddingTop: 14, borderTop: `1px solid ${c.line}` }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: c.brown, marginBottom: 8, letterSpacing: 0.3 }}>
              EVIDENCE ACROSS PATHWAYS
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {Object.entries(byPathway).sort((a,b)=>b[1]-a[1]).map(([pid,n]) => {
                const p = pathway(pid);
                return (
                  <div key={pid} style={{
                    display: "flex", alignItems: "center", gap: 6,
                    background: p.color + "1F", border: `1px solid ${p.color}55`,
                    borderRadius: 20, padding: "4px 10px",
                  }}>
                    <span style={{ fontSize: 12 }}>{p.icon}</span>
                    <span style={{ fontSize: 11.5, fontWeight: 600, color: c.ink }}>{p.label}</span>
                    <span style={{
                      fontSize: 10.5, fontWeight: 800, color: c.white, background: p.color,
                      borderRadius: 10, padding: "0 6px", minWidth: 16, textAlign: "center",
                    }}>{n}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Card>

      {/* tabs */}
      <div className="no-print" style={{ display: "flex", gap: 4, marginBottom: 14, flexWrap: "wrap" }}>
        {[["timeline","Learning timeline"],["assessment","Assessment"],["about","About this child"]].map(([k,l]) => (
          <button key={k} className="tap" onClick={() => setTab(k)} style={{
            border: "none", cursor: "pointer", fontFamily: FONT_BODY, fontSize: 12.5, fontWeight: 700,
            padding: "9px 16px", borderRadius: 10,
            background: tab === k ? c.brown : c.white,
            color: tab === k ? c.white : c.brownLt,
            borderBottom: tab === k ? `2px solid ${c.brown}` : `1px solid ${c.line}`,
          }}>{l}</button>
        ))}
      </div>

      {tab === "timeline" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
          {observations.length === 0 ? (
            <Card style={{ textAlign: "center", padding: 36 }}>
              <div style={{ fontSize: 30, marginBottom: 6 }}>🌱</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: c.brown, fontFamily: FONT_DISPLAY }}>
                No observations for {child.name.split(" ")[0]} yet
              </div>
              <div style={{ fontSize: 12, color: c.brownLt, marginTop: 3 }}>
                Their learning journey begins with your first capture.
              </div>
            </Card>
          ) : (
            [...observations].sort((a,b)=>b.ts-a.ts).map(o => {
              const p = o.pathwayId ? pathway(o.pathwayId) : null;
              return (
                <Card key={o.id} style={{ borderColor: o.draft ? c.terra + "55" : c.line }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 7 }}>
                    <div style={{ fontSize: 11.5, fontWeight: 700, color: c.sageDk, fontFamily: FONT_DISPLAY }}>
                      {new Date(o.ts).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" })}
                    </div>
                    {o.draft && <Pill color={c.terra}>draft</Pill>}
                    {p && <span style={{ marginLeft: "auto" }}><Pill color={p.color}>{p.icon} {p.label}</Pill></span>}
                  </div>
                  {(o.skills||[]).length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 8 }}>
                      {o.skills.map(s => (
                        <span key={s} style={{
                          fontSize: 10, background: c.paper, color: c.brown,
                          padding: "2px 8px", borderRadius: 20, fontWeight: 600,
                        }}>{s}</span>
                      ))}
                    </div>
                  )}
                  <p style={{ margin: "0 0 8px", fontSize: 13.5, lineHeight: 1.65, fontFamily: FONT_DISPLAY, color: c.ink }}>
                    {o.text || o.raw || <em style={{ color: c.brownLt }}>Draft — no write-up yet.</em>}
                  </p>
                  {o.nextStep && (
                    <div style={{
                      background: c.sageLt, borderRadius: 10, padding: "8px 11px",
                      borderLeft: `3px solid ${c.sage}`, marginBottom: o.photo ? 8 : 0,
                    }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: c.sageDk, textTransform: "uppercase", letterSpacing: 0.4 }}>Next step · </span>
                      <span style={{ fontSize: 12, color: c.ink }}>{o.nextStep}</span>
                    </div>
                  )}
                  {o.photo && (
                    <img src={o.photo} alt="" style={{
                      maxHeight: 170, borderRadius: 10, border: `1px solid ${c.line}`, display: "block",
                    }} />
                  )}
                </Card>
              );
            })
          )}
        </div>
      )}

      {tab === "assessment" && (
        <div style={{
          display: "grid",
          gridTemplateColumns: vp && vp.isLaptop ? "1fr 1fr" : "1fr",
          gap: 12,
        }}>
          {livePathways().map(p => {
            const cell = (assessment || {})[p.id] || {};
            const ev = observations.filter(o => o.pathwayId === p.id && !o.draft).length;
            return (
              <PathwayAssessCard
                key={p.id} pathway={p} cell={cell} evidenceCount={ev}
                onChange={(patch) => setAssessmentCell(child.id, p.id, patch)}
              />
            );
          })}
        </div>
      )}

      {tab === "about" && (
        <AboutChild child={child} updateChild={updateChild} />
      )}
    </div>
  );
}

function AboutChild({ child, updateChild }) {
  const fields = [
    { key: "interests", label: "Interests", icon: "✨", color: c.yellow,
      hint: "What lights them up — fuel for planning." },
    { key: "strengths", label: "Strengths", icon: "💪", color: c.sage,
      hint: "What they can already do well." },
    { key: "support", label: "Support strategies", icon: "🤝", color: c.terra,
      hint: "What helps them thrive — share with the whole team." },
  ];
  const [draftInputs, setDraftInputs] = useState({});

  const addItem = (key) => {
    const v = (draftInputs[key] || "").trim();
    if (!v) return;
    updateChild({ [key]: [...(child[key] || []), v] });
    setDraftInputs({ ...draftInputs, [key]: "" });
  };
  const removeItem = (key, idx) => {
    updateChild({ [key]: child[key].filter((_, i) => i !== idx) });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
      {fields.map(f => (
        <Card key={f.key}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 9, background: f.color + "30",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15,
            }}>{f.icon}</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: c.brown, fontFamily: FONT_DISPLAY }}>{f.label}</div>
              <div style={{ fontSize: 11, color: c.brownLt }}>{f.hint}</div>
            </div>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, margin: "10px 0" }}>
            {(child[f.key] || []).length === 0 && (
              <span style={{ fontSize: 12, color: c.brownLt, fontStyle: "italic" }}>Nothing noted yet.</span>
            )}
            {(child[f.key] || []).map((item, i) => (
              <span key={i} style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                background: f.color + "1F", border: `1px solid ${f.color}66`,
                borderRadius: 20, padding: "4px 6px 4px 11px", fontSize: 12, fontWeight: 600, color: c.ink,
              }}>
                {item}
                <button onClick={() => removeItem(f.key, i)} className="tap" style={{
                  border: "none", background: c.white, borderRadius: "50%", width: 17, height: 17,
                  cursor: "pointer", color: c.brownLt, fontSize: 12, lineHeight: 1,
                }}>×</button>
              </span>
            ))}
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <input
              value={draftInputs[f.key] || ""}
              onChange={e => setDraftInputs({ ...draftInputs, [f.key]: e.target.value })}
              onKeyDown={e => e.key === "Enter" && addItem(f.key)}
              placeholder={`Add to ${f.label.toLowerCase()}…`}
              style={{
                flex: 1, border: `1px solid ${c.line}`, borderRadius: 9, padding: "8px 11px",
                fontSize: 12.5, fontFamily: FONT_BODY, background: c.cream, color: c.ink, outline: "none",
              }}
            />
            <button className="tap" onClick={() => addItem(f.key)} style={{
              border: "none", background: f.color, color: c.white, borderRadius: 9,
              padding: "0 14px", fontSize: 16, cursor: "pointer", fontWeight: 700,
            }}>＋</button>
          </div>
        </Card>
      ))}
      <div style={{
        fontSize: 11.5, color: c.brownLt, textAlign: "center", padding: "4px 20px",
        lineHeight: 1.6,
      }}>
        These notes feed straight into the child's exported learning journey — and help any adult
        in the room support this child consistently.
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   ASSESSMENT SNAPSHOT  (compact card for the dashboard)
   ════════════════════════════════════════════════════════════════ */
function AssessmentSnapshot({ children, assessment, gotoAssessment }) {
  // class average stage across all your pathways
  let cells = 0, sum = 0;
  children.forEach(ch => {
    PATHWAYS.forEach(p => {
      const cell = (assessment[ch.id] || {})[p.id];
      if (cell && cell.stage > 0) { cells++; sum += cell.stage; }
    });
  });
  const totalPossible = children.length * PATHWAYS.length;
  const coverage = totalPossible ? Math.round((cells / totalPossible) * 100) : 0;
  const avg = cells ? (sum / cells) : 0;

  return (
    <div>
      <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
        <div style={{
          flex: 1, background: c.sageLt, borderRadius: 12, padding: "11px 13px", textAlign: "center",
        }}>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 22, fontWeight: 800, color: c.sageDk }}>
            {coverage}%
          </div>
          <div style={{ fontSize: 10.5, color: c.brownLt, marginTop: 2 }}>pathways assessed</div>
        </div>
        <div style={{
          flex: 1, background: c.yellowLt, borderRadius: 12, padding: "11px 13px", textAlign: "center",
        }}>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 22, fontWeight: 800, color: c.brown }}>
            {avg ? stageOf(Math.round(avg)).label : "—"}
          </div>
          <div style={{ fontSize: 10.5, color: c.brownLt, marginTop: 2 }}>class average stage</div>
        </div>
      </div>
      <button className="tap" onClick={gotoAssessment} style={{
        width: "100%", background: c.brown, color: c.white, border: "none",
        borderRadius: 11, padding: "11px", fontSize: 12.5, fontWeight: 700,
        cursor: "pointer", fontFamily: FONT_BODY,
      }}>Open assessment tracker →</button>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   STAGE PICKER  (shared dot-selector for a single pathway cell)
   ════════════════════════════════════════════════════════════════ */
function StagePicker({ value, onChange, size = 30 }) {
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {liveStages().map(s => {
        const on = value === s.key;
        const filled = value >= s.key && s.key > 0;
        return (
          <button
            key={s.key}
            className="tap"
            title={`${s.label} — ${s.desc}`}
            onClick={() => onChange(on ? 0 : s.key)}
            style={{
              width: size, height: size, borderRadius: 9, cursor: "pointer",
              border: `2px solid ${on ? s.color : (filled ? s.color + "99" : c.line)}`,
              background: on ? s.color : (filled ? s.color + "44" : c.white),
              color: on ? c.white : (filled ? c.ink : c.brownLt),
              fontWeight: 800, fontSize: size * 0.36, fontFamily: FONT_BODY,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}
          >{s.short}</button>
        );
      })}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   ASSESSMENT TRACKER  (class grid + per-child + export)
   ════════════════════════════════════════════════════════════════ */
function AssessmentTracker({
  children, observations, assessment, setAssessmentCell, openChild, pathways, gotoManage, vp,
}) {
  const [mode, setMode] = useState("class");      // class | child
  const [activeChildId, setActiveChildId] = useState(children[0]?.id || "");

  if (children.length === 0) {
    return (
      <div className="rise">
        <Card style={{ textAlign: "center", padding: 44 }}>
          <div style={{ fontSize: 34, marginBottom: 8 }}>🧒</div>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 17, color: c.brown, fontWeight: 700 }}>
            No children to assess yet
          </div>
          <div style={{ fontSize: 12.5, color: c.brownLt, marginTop: 4, marginBottom: 16 }}>
            Add children to your class first — then you can track their progress across all your pathways.
          </div>
          <button className="tap" onClick={gotoManage} style={{
            background: c.sage, color: c.white, border: "none", borderRadius: 11,
            padding: "11px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: FONT_BODY,
          }}>⚙️ Go to Manage → add children</button>
        </Card>
      </div>
    );
  }

  /* observation counts per child per pathway — used as evidence hints */
  const evidenceCount = (childId, pathwayId) =>
    observations.filter(o => o.childId === childId && o.pathwayId === pathwayId && !o.draft).length;

  /* ---- class-wide stats ---- */
  const childStats = children.map(ch => {
    const cells = livePathways().map(p => (assessment[ch.id] || {})[p.id]?.stage || 0);
    const assessed = cells.filter(s => s > 0);
    const avg = assessed.length ? assessed.reduce((a,b)=>a+b,0) / assessed.length : 0;
    return { ch, cells, assessed: assessed.length, avg };
  });

  /* ---- export: class summary ---- */
  const exportClassSummary = () => {
    const head = `<tr><th>Child</th>${livePathways().map(p=>`<th title="${p.label}">${p.icon}</th>`).join("")}<th>Assessed</th><th>Avg</th></tr>`;
    const rows = childStats.map(({ ch, cells, assessed, avg }) => {
      const tds = cells.map(s => {
        const st = stageOf(s);
        return `<td style="background:${s>0?st.color+'55':'#fff'};text-align:center;font-weight:bold;font-size:11px">${s>0?st.short:'·'}</td>`;
      }).join("");
      return `<tr><td style="font-weight:bold">${ch.name}</td>${tds}<td style="text-align:center">${assessed}/${livePathways().length}</td><td style="text-align:center;font-weight:bold">${avg?stageOf(Math.round(avg)).label:'—'}</td></tr>`;
    }).join("");
    const legend = liveStages().filter(s=>s.key>0).map(s=>`<span style="display:inline-block;margin-right:14px"><b style="background:${s.color}55;padding:2px 7px;border-radius:5px">${s.short}</b> ${s.label}</span>`).join("");
    const pathKey = livePathways().map(p=>`<span style="display:inline-block;margin-right:12px;font-size:12px">${p.icon} ${p.label}</span>`).join("");
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Brownie Bear Academy — Class Assessment Summary</title>
      <style>
        body{font-family:Georgia,serif;color:#4A3826;max-width:900px;margin:30px auto;padding:0 24px;background:#FDF8EF;}
        h1{color:#6E4A2F;margin-bottom:0;}
        .sub{color:#8BA678;letter-spacing:2px;text-transform:uppercase;font-size:12px;margin-bottom:18px;}
        table{border-collapse:collapse;width:100%;background:#fff;border:1px solid #E7DEC9;border-radius:10px;overflow:hidden;}
        th,td{border:1px solid #E7DEC9;padding:7px 9px;font-size:12px;}
        th{background:#F7F0E1;color:#6E4A2F;}
        .box{background:#fff;border:1px solid #E7DEC9;border-radius:10px;padding:12px 14px;margin:14px 0;font-size:12px;line-height:1.9;}
        @media print{body{background:#fff;}}
      </style></head><body>
      <div class="sub">Brownie Bear Academy &middot; Assessment</div>
      <h1>Class Assessment Summary</h1>
      <div class="sub" style="letter-spacing:0;text-transform:none;color:#A8855F;font-size:13px">${new Date().toLocaleDateString(undefined,{day:"numeric",month:"long",year:"numeric"})} &middot; ${children.length} children &middot; ${livePathways().length} development pathways</div>
      <table>${head}${rows}</table>
      <div class="box"><b>Stages:</b><br/>${legend}</div>
      <div class="box"><b>Pathways:</b><br/>${pathKey}</div>
      </body></html>`;
    const w = window.open("", "_blank");
    if (w) { w.document.write(html); w.document.close(); }
  };

  /* ---- export: single child report ---- */
  const exportChildReport = (childId) => {
    const ch = children.find(x => x.id === childId);
    if (!ch) return;
    const rows = livePathways().map(p => {
      const cell = (assessment[childId] || {})[p.id] || {};
      const st = stageOf(cell.stage || 0);
      const ev = evidenceCount(childId, p.id);
      return `<tr>
        <td style="font-weight:bold">${p.icon} ${p.label}</td>
        <td style="text-align:center;background:${cell.stage>0?st.color+'55':'#fff'};font-weight:bold">${cell.stage>0?st.label:'Not yet assessed'}</td>
        <td style="text-align:center">${ev}</td>
        <td>${(cell.target||'').replace(/</g,'&lt;')||'<span style="color:#A8855F">—</span>'}</td>
        <td>${(cell.note||'').replace(/</g,'&lt;')||'<span style="color:#A8855F">—</span>'}</td>
      </tr>`;
    }).join("");
    const assessed = livePathways().filter(p => ((assessment[childId]||{})[p.id]?.stage||0) > 0).length;
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${ch.name} — Progress Report</title>
      <style>
        body{font-family:Georgia,serif;color:#4A3826;max-width:820px;margin:30px auto;padding:0 24px;background:#FDF8EF;}
        h1{color:#6E4A2F;margin-bottom:0;}
        .sub{color:#8BA678;letter-spacing:2px;text-transform:uppercase;font-size:12px;}
        .meta{color:#A8855F;font-size:13px;margin:4px 0 18px;}
        table{border-collapse:collapse;width:100%;background:#fff;border:1px solid #E7DEC9;border-radius:10px;overflow:hidden;}
        th,td{border:1px solid #E7DEC9;padding:9px 11px;font-size:12.5px;vertical-align:top;}
        th{background:#F7F0E1;color:#6E4A2F;text-align:left;}
        .foot{background:#E8EEDF;border-radius:10px;padding:12px 15px;margin-top:16px;font-size:12.5px;line-height:1.6;}
        @media print{body{background:#fff;}}
      </style></head><body>
      <div class="sub">Brownie Bear Academy &middot; Progress Report</div>
      <h1>${ch.name}</h1>
      <div class="meta">Age ${ageOf(ch.dob)} &middot; ${assessed}/${livePathways().length} pathways assessed &middot; ${new Date().toLocaleDateString(undefined,{day:"numeric",month:"long",year:"numeric"})}</div>
      <table>
        <tr><th style="width:30%">Development pathway</th><th>Current stage</th><th>Evidence</th><th>Next-step target</th><th>Teacher note</th></tr>
        ${rows}
      </table>
      <div class="foot">Stages move Emerging → Developing → Secure → Embedded. "Evidence" shows finished observations linked to that pathway. This report reflects the child's learning at this point in time and celebrates progress at their own pace.</div>
      </body></html>`;
    const w = window.open("", "_blank");
    if (w) { w.document.write(html); w.document.close(); }
  };

  return (
    <div className="rise">
      {/* header */}
      <div style={{
        display: "flex", alignItems: vp.isPhone ? "flex-start" : "center",
        gap: 12, marginBottom: 6, flexWrap: "wrap",
      }}>
        <div style={{ flex: 1, minWidth: 180 }}>
          <h1 style={{
            margin: 0, fontFamily: FONT_DISPLAY, fontSize: vp.isPhone ? 21 : 24,
            color: c.brown, fontWeight: 700,
          }}>Assessment Tracker</h1>
          <div style={{ fontSize: 12.5, color: c.brownLt, marginTop: 3 }}>
            {livePathways().length} development pathways · {liveStages().filter(s => s.key > 0).map(s => s.label).join(" → ")} · everything saved automatically
          </div>
        </div>
        <button className="tap no-print" onClick={exportClassSummary} style={{
          background: c.white, border: `1.5px solid ${c.line}`, borderRadius: 11,
          padding: "9px 14px", fontSize: 12.5, fontWeight: 700, color: c.brown,
          cursor: "pointer", fontFamily: FONT_BODY,
        }}>⤓ Export class summary</button>
      </div>

      {/* mode switch */}
      <div className="no-print" style={{
        display: "flex", gap: 4, background: c.white, padding: 4, borderRadius: 12,
        border: `1px solid ${c.line}`, marginTop: 14, marginBottom: 16,
        width: vp.isCompact ? "100%" : "fit-content",
      }}>
        {[["class","📋 Class grid"],["child","🧒 Per child"]].map(([k,l]) => (
          <button key={k} className="tap" onClick={() => setMode(k)} style={{
            border: "none", cursor: "pointer", fontFamily: FONT_BODY, fontSize: 13, fontWeight: 700,
            padding: "9px 18px", borderRadius: 9,
            background: mode === k ? c.sage : "transparent",
            color: mode === k ? c.white : c.brownLt,
            flex: vp.isCompact ? 1 : "none",
          }}>{l}</button>
        ))}
      </div>

      {/* stage legend */}
      <Card pad={13} style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: vp.isPhone ? 8 : 16, alignItems: "center" }}>
          <span style={{ fontSize: 11.5, fontWeight: 700, color: c.brown }}>Stages:</span>
          {liveStages().filter(s => s.key > 0).map(s => (
            <div key={s.key} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{
                width: 22, height: 22, borderRadius: 7, background: s.color,
                color: c.white, fontWeight: 800, fontSize: 10,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>{s.short}</div>
              <span style={{ fontSize: 11.5, color: c.ink, fontWeight: 600 }}>{s.label}</span>
            </div>
          ))}
          {gotoManage && (
            <button className="tap no-print" onClick={gotoManage} style={{
              background: c.white, border: `1.5px dashed ${c.sage}88`, borderRadius: 20,
              padding: "4px 11px", fontSize: 10.5, fontWeight: 700, color: c.sageDk,
              cursor: "pointer", fontFamily: FONT_BODY, marginLeft: "auto",
            }}>✎ Edit stages</button>
          )}
        </div>
      </Card>

      {mode === "class" && (
        <ClassGrid
          children={children} assessment={assessment} setAssessmentCell={setAssessmentCell}
          childStats={childStats} evidenceCount={evidenceCount}
          onOpenChild={(id) => { setActiveChildId(id); setMode("child"); }}
          gotoManage={gotoManage}
          vp={vp}
        />
      )}

      {mode === "child" && (
        <PerChildAssessment
          children={children}
          activeChildId={activeChildId} setActiveChildId={setActiveChildId}
          assessment={assessment} setAssessmentCell={setAssessmentCell}
          evidenceCount={evidenceCount}
          exportChildReport={exportChildReport}
          openChild={openChild}
          gotoManage={gotoManage}
          vp={vp}
        />
      )}
    </div>
  );
}

/* ─── CLASS GRID — every child × every pathway ──────────────────── */
function ClassGrid({
  children, assessment, setAssessmentCell, childStats, evidenceCount, onOpenChild, gotoManage, vp,
}) {
  const [activePathway, setActivePathway] = useState(PATHWAYS[0].id);

  /* On laptop: full scrollable matrix. On compact: one pathway at a time. */
  if (vp.isCompact) {
    const p = pathway(activePathway);
    return (
      <div>
        {/* pathway selector */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14, alignItems: "center" }}>
          {livePathways().map(pw => (
            <Pill key={pw.id} color={pw.color} active={activePathway === pw.id}
              onClick={() => setActivePathway(pw.id)}>
              {pw.icon} {vp.isPhone ? "" : pw.label}
            </Pill>
          ))}
          {gotoManage && (
            <button className="tap" onClick={gotoManage} title="Add or edit pathways" style={{
              background: c.white, border: `1.5px dashed ${c.sage}88`, borderRadius: 20,
              padding: "5px 11px", fontSize: 11, fontWeight: 700, color: c.sageDk,
              cursor: "pointer", fontFamily: FONT_BODY,
            }}>✎ {vp.isPhone ? "Edit" : "Add or edit pathways"}</button>
          )}
        </div>
        <Card pad={vp.isPhone ? 13 : 16}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 6 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10, background: p.color + "30",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17,
            }}>{p.icon}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 16, fontWeight: 700, color: c.brown }}>
                {p.label}
              </div>
              <div style={{ fontSize: 11, color: c.brownLt }}>Tap a stage for each child</div>
            </div>
            {gotoManage && (
              <button className="tap" onClick={gotoManage} title="Edit this pathway in Manage" style={{
                background: c.white, border: `1px solid ${c.line}`, borderRadius: 8,
                padding: "5px 10px", fontSize: 10.5, fontWeight: 700, color: c.sageDk,
                cursor: "pointer", fontFamily: FONT_BODY, whiteSpace: "nowrap",
              }}>✎ Edit pathway</button>
            )}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 9, marginTop: 12 }}>
            {children.map(ch => {
              const cell = (assessment[ch.id] || {})[activePathway] || {};
              const ev = evidenceCount(ch.id, activePathway);
              return (
                <div key={ch.id} style={{
                  background: c.cream, borderRadius: 12, padding: "10px 11px",
                  border: `1px solid ${c.line}`,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 9 }}>
                    <Avatar name={ch.name} photo={ch.photo} size={28} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: c.brown }}>{ch.name}</div>
                      <div style={{ fontSize: 10.5, color: c.brownLt }}>
                        {ev} observation{ev===1?"":"s"} linked
                      </div>
                    </div>
                    <button className="tap" onClick={() => onOpenChild(ch.id)} style={{
                      background: c.white, border: `1px solid ${c.line}`, borderRadius: 8,
                      padding: "4px 9px", fontSize: 10.5, fontWeight: 700, color: c.sageDk,
                      cursor: "pointer", fontFamily: FONT_BODY,
                    }}>Details</button>
                  </div>
                  <StagePicker
                    value={cell.stage || 0}
                    onChange={(v) => setAssessmentCell(ch.id, activePathway, { stage: v })}
                    size={vp.isPhone ? 32 : 34}
                  />
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    );
  }

  /* Laptop: scrollable matrix */
  return (
    <Card pad={0} style={{ overflow: "hidden" }}>
      <div style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 820 }}>
          <thead>
            <tr>
              <th style={{
                position: "sticky", left: 0, zIndex: 2, background: c.paper,
                padding: "12px 14px", textAlign: "left", fontFamily: FONT_DISPLAY,
                fontSize: 12.5, color: c.brown, borderBottom: `2px solid ${c.line}`,
                borderRight: `2px solid ${c.line}`, minWidth: 150,
              }}>Child</th>
              {livePathways().map(p => (
                <th key={p.id} title={p.label} style={{
                  padding: "12px 6px", borderBottom: `2px solid ${c.line}`,
                  background: p.color + "1A", minWidth: 58,
                }}>
                  <div style={{ fontSize: 17 }}>{p.icon}</div>
                  <div style={{
                    fontSize: 8.5, color: c.brownLt, marginTop: 3, lineHeight: 1.2,
                    fontWeight: 600,
                  }}>{p.label.split(" ")[0]}</div>
                </th>
              ))}
              <th style={{
                padding: "12px 10px", borderBottom: `2px solid ${c.line}`,
                background: c.paper, fontSize: 11, color: c.brown, minWidth: 80,
              }}>Average</th>
            </tr>
          </thead>
          <tbody>
            {childStats.map(({ ch, avg, assessed }) => (
              <tr key={ch.id}>
                <td style={{
                  position: "sticky", left: 0, zIndex: 1, background: c.white,
                  padding: "9px 14px", borderBottom: `1px solid ${c.line}`,
                  borderRight: `2px solid ${c.line}`,
                }}>
                  <button className="tap" onClick={() => onOpenChild(ch.id)} style={{
                    display: "flex", alignItems: "center", gap: 8, cursor: "pointer",
                    background: "none", border: "none", fontFamily: FONT_BODY, padding: 0,
                  }}>
                    <Avatar name={ch.name} photo={ch.photo} size={30} />
                    <div style={{ textAlign: "left" }}>
                      <div style={{ fontSize: 12.5, fontWeight: 700, color: c.brown }}>{ch.name}</div>
                      <div style={{ fontSize: 10, color: c.brownLt }}>{assessed}/{livePathways().length} assessed</div>
                    </div>
                  </button>
                </td>
                {livePathways().map(p => {
                  const cell = (assessment[ch.id] || {})[p.id] || {};
                  const stage = cell.stage || 0;
                  const st = stageOf(stage);
                  const ev = evidenceCount(ch.id, p.id);
                  return (
                    <td key={p.id} style={{
                      borderBottom: `1px solid ${c.line}`, borderRight: `1px solid ${c.line}`,
                      padding: 4, textAlign: "center",
                      background: stage > 0 ? st.color + "26" : c.white,
                    }}>
                      <select
                        value={stage}
                        onChange={(e) => setAssessmentCell(ch.id, p.id, { stage: +e.target.value })}
                        style={{
                          width: 44, border: `1.5px solid ${stage>0?st.color:c.line}`,
                          borderRadius: 7, padding: "5px 2px", fontFamily: FONT_BODY,
                          fontWeight: 800, fontSize: 11, cursor: "pointer",
                          background: stage > 0 ? st.color : c.white,
                          color: stage > 0 ? c.white : c.brownLt, textAlign: "center",
                          appearance: "none", outline: "none",
                        }}
                      >
                        {liveStages().map(s => (
                          <option key={s.key} value={s.key} style={{ background: c.white, color: c.ink }}>
                            {s.short}
                          </option>
                        ))}
                      </select>
                      {ev > 0 && (
                        <div style={{ fontSize: 8, color: c.brownLt, marginTop: 2 }}>
                          {ev}📝
                        </div>
                      )}
                    </td>
                  );
                })}
                <td style={{
                  borderBottom: `1px solid ${c.line}`, textAlign: "center",
                  padding: "9px 8px", background: c.paper,
                }}>
                  <div style={{
                    fontSize: 11, fontWeight: 800,
                    color: avg ? stageOf(Math.round(avg)).color : c.brownLt,
                  }}>{avg ? stageOf(Math.round(avg)).label : "—"}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{
        padding: "10px 14px", fontSize: 11, color: c.brownLt,
        borderTop: `1px solid ${c.line}`, background: c.cream,
      }}>
        Tap a child's name for their full pathway detail · 📝 shows linked observations · scroll sideways to see every pathway
      </div>
    </Card>
  );
}

/* ─── PER-CHILD ASSESSMENT — pathway cards with stage, target, note ─ */
function PerChildAssessment({
  children, activeChildId, setActiveChildId, assessment, setAssessmentCell,
  evidenceCount, exportChildReport, openChild, vp,
}) {
  const child = children.find(x => x.id === activeChildId) || children[0];
  if (!child) return null;
  const childAsm = assessment[child.id] || {};

  const assessedCount = livePathways().filter(p => (childAsm[p.id]?.stage || 0) > 0).length;
  const stages = livePathways().map(p => childAsm[p.id]?.stage || 0).filter(s => s > 0);
  const avg = stages.length ? stages.reduce((a,b)=>a+b,0) / stages.length : 0;

  return (
    <div>
      {/* child selector */}
      <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 16 }}>
        {children.map(ch => {
          const on = ch.id === activeChildId;
          return (
            <button key={ch.id} className="tap" onClick={() => setActiveChildId(ch.id)} style={{
              display: "flex", alignItems: "center", gap: 7, cursor: "pointer",
              padding: "6px 13px 6px 6px", borderRadius: 30, fontFamily: FONT_BODY,
              background: on ? c.sage : c.white,
              border: `1.5px solid ${on ? c.sage : c.line}`,
              color: on ? c.white : c.ink,
            }}>
              <Avatar name={ch.name} photo={ch.photo} size={26} color={on ? c.white : c.sage} />
              <span style={{ fontSize: 12.5, fontWeight: 600 }}>{ch.name.split(" ")[0]}</span>
            </button>
          );
        })}
      </div>

      {/* child header */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
          <Avatar name={child.name} photo={child.photo} size={54} />
          <div style={{ flex: 1, minWidth: 150 }}>
            <h2 style={{
              margin: 0, fontFamily: FONT_DISPLAY, fontSize: 20, color: c.brown, fontWeight: 700,
            }}>{child.name}</h2>
            <div style={{ fontSize: 12, color: c.brownLt, marginTop: 2 }}>
              Age {ageOf(child.dob)} · {assessedCount}/{livePathways().length} pathways assessed
              {avg ? ` · class stage average: ${stageOf(Math.round(avg)).label}` : ""}
            </div>
          </div>
          <div className="no-print" style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
            <button className="tap" onClick={() => exportChildReport(child.id)} style={{
              background: c.brown, border: "none", borderRadius: 11,
              padding: "9px 14px", fontSize: 12, fontWeight: 700, color: c.white,
              cursor: "pointer", fontFamily: FONT_BODY,
            }}>⤓ Download progress report</button>
            <button className="tap" onClick={() => openChild(child.id)} style={{
              background: c.white, border: `1.5px solid ${c.line}`, borderRadius: 11,
              padding: "9px 13px", fontSize: 12, fontWeight: 700, color: c.brown,
              cursor: "pointer", fontFamily: FONT_BODY,
            }}>Open profile →</button>
          </div>
        </div>

        {/* progress bar across pathways */}
        <div style={{ marginTop: 15 }}>
          <div style={{
            display: "flex", height: 10, borderRadius: 6, overflow: "hidden",
            border: `1px solid ${c.line}`, background: c.cream,
          }}>
            {livePathways().map(p => {
              const s = childAsm[p.id]?.stage || 0;
              return (
                <div key={p.id} title={`${p.label}: ${stageOf(s).label}`} style={{
                  flex: 1, background: s > 0 ? stageOf(s).color : "transparent",
                  borderRight: `1px solid ${c.cream}`,
                }} />
              );
            })}
          </div>
          <div style={{ fontSize: 10.5, color: c.brownLt, marginTop: 5 }}>
            Each segment is one pathway — colour shows the current stage
          </div>
        </div>
      </Card>

      {/* pathway cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: vp.isLaptop ? "1fr 1fr" : "1fr",
        gap: 12,
      }}>
        {livePathways().map(p => {
          const cell = childAsm[p.id] || {};
          const ev = evidenceCount(child.id, p.id);
          return (
            <PathwayAssessCard
              key={p.id} pathway={p} cell={cell} evidenceCount={ev}
              onChange={(patch) => setAssessmentCell(child.id, p.id, patch)}
            />
          );
        })}
      </div>
    </div>
  );
}

function PathwayAssessCard({ pathway: p, cell, evidenceCount, onChange }) {
  const [open, setOpen] = useState(false);
  const stage = cell.stage || 0;
  const st = stageOf(stage);
  return (
    <Card pad={14} style={{ borderColor: stage > 0 ? p.color + "66" : c.line }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 11, background: p.color + "2A",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0,
        }}>{p.icon}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: c.brown, fontFamily: FONT_DISPLAY }}>
            {p.label}
          </div>
          <div style={{ fontSize: 10.5, color: c.brownLt, marginTop: 1 }}>
            {evidenceCount > 0
              ? `${evidenceCount} observation${evidenceCount===1?"":"s"} linked`
              : "No observations linked yet"}
          </div>
        </div>
        <div style={{
          fontSize: 10, fontWeight: 800, color: stage > 0 ? c.white : c.brownLt,
          background: stage > 0 ? st.color : c.cream,
          border: `1px solid ${stage > 0 ? st.color : c.line}`,
          borderRadius: 20, padding: "3px 9px", whiteSpace: "nowrap",
        }}>{st.label}</div>
      </div>

      {/* stage picker */}
      <div style={{ marginTop: 12, marginBottom: 4 }}>
        <StagePicker value={stage} onChange={(v) => onChange({ stage: v })} size={34} />
      </div>
      <div style={{ fontSize: 10.5, color: c.brownLt, fontStyle: "italic", minHeight: 14 }}>
        {stage > 0 ? st.desc : "Tap a stage above to begin assessing."}
      </div>

      {/* expandable target + note */}
      <button className="tap no-print" onClick={() => setOpen(!open)} style={{
        marginTop: 10, width: "100%", background: open ? p.color + "1A" : c.cream,
        border: `1px solid ${open ? p.color + "55" : c.line}`, borderRadius: 9,
        padding: "7px 11px", fontSize: 11.5, fontWeight: 700, color: c.brown,
        cursor: "pointer", fontFamily: FONT_BODY, textAlign: "left",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <span>
          {cell.target || cell.note ? "✎ Next-step target & note" : "＋ Add next-step target & note"}
        </span>
        <span style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .2s" }}>⌄</span>
      </button>

      {open && (
        <div style={{ marginTop: 9 }}>
          <FieldLabel>Next-step target</FieldLabel>
          <textarea
            value={cell.target || ""}
            onChange={(e) => onChange({ target: e.target.value })}
            placeholder={`One concrete next step for ${p.label.toLowerCase()}…`}
            style={{
              width: "100%", minHeight: 48, resize: "vertical", border: `1px solid ${c.line}`,
              borderRadius: 9, padding: "8px 10px", fontSize: 12, fontFamily: FONT_BODY,
              background: c.cream, color: c.ink, outline: "none", lineHeight: 1.5, marginBottom: 9,
            }}
          />
          <FieldLabel>Teacher note</FieldLabel>
          <textarea
            value={cell.note || ""}
            onChange={(e) => onChange({ note: e.target.value })}
            placeholder="Anything worth recording — context, a quote, a question…"
            style={{
              width: "100%", minHeight: 48, resize: "vertical", border: `1px solid ${c.line}`,
              borderRadius: 9, padding: "8px 10px", fontSize: 12, fontFamily: FONT_BODY,
              background: c.cream, color: c.ink, outline: "none", lineHeight: 1.5,
            }}
          />
        </div>
      )}

      {/* collapsed preview of target */}
      {!open && cell.target && (
        <div style={{
          marginTop: 8, background: c.sageLt, borderRadius: 9, padding: "7px 10px",
          borderLeft: `3px solid ${c.sage}`,
        }}>
          <span style={{ fontSize: 9.5, fontWeight: 700, color: c.sageDk, textTransform: "uppercase", letterSpacing: 0.4 }}>Target · </span>
          <span style={{ fontSize: 11.5, color: c.ink }}>{cell.target}</span>
        </div>
      )}
    </Card>
  );
}

/* ════════════════════════════════════════════════════════════════
   MANAGE HUB — roster + framework editing
   Teachers add/edit/remove children, rename pathways, edit skill tags
   ════════════════════════════════════════════════════════════════ */
function ManageHub({
  children, observations, assessment,
  addChild, updateChild, removeChild,
  pathways, skillsFor,
  renamePathway, resetPathwayName,
  setSkillsForPathway, resetSkillsForPathway,
  pathwayLabels, customSkills,
  customPathways, hiddenPathways, pathwayOrder,
  addPathway, removeCustomPathway, togglePathwayHidden,
  movePathway, resetOrder, reorderPathways,
  // New:
  applyStagePreset, resetStages, updateStage, addStage, removeStage, moveStage, customStages,
  groups, addGroup, updateGroup, removeGroup, toggleChildInGroup,
  theme, setTheme, density, setDensity,
  openChild, vp,
}) {
  const [section, setSection] = useState("children"); // children | framework
  const [editingChild, setEditingChild] = useState(null); // child object or {new:true}
  const [confirmRemove, setConfirmRemove] = useState(null);
  const [addingPathway, setAddingPathway] = useState(false);
  const [confirmRemovePathway, setConfirmRemovePathway] = useState(null);
  /* Tap-to-reorder: when a pathway is "picked up" the user taps a target slot to drop it */
  const [movingId, setMovingId] = useState(null);

  const obsCount = (id) => observations.filter(o => o.childId === id).length;
  const asmCount = (id) =>
    livePathways().filter(p => (assessment[id] || {})[p.id]?.stage > 0).length;

  /* Build the full ordered list including hidden ones (for the order list) */
  const orderedAllPathways = (() => {
    const all = allPathwayBases().map(b => pathway(b.id));
    if (pathwayOrder) {
      const ordered = pathwayOrder.map(id => all.find(p => p.id === id)).filter(Boolean);
      const rest = all.filter(p => !pathwayOrder.includes(p.id));
      return [...ordered, ...rest];
    }
    return all;
  })();

  return (
    <div className="rise">
      <div style={{ marginBottom: 6 }}>
        <h1 style={{
          margin: 0, fontFamily: FONT_DISPLAY, fontSize: vp.isPhone ? 21 : 24,
          color: c.brown, fontWeight: 700,
        }}>Manage</h1>
        <div style={{ fontSize: 12.5, color: c.brownLt, marginTop: 3 }}>
          Make the hub yours — add children, edit your class list, rename pathways and adjust skill tags.
        </div>
      </div>

      {/* section switch */}
      <div className="no-print" style={{
        display: "flex", gap: 4, background: c.white, padding: 4, borderRadius: 12,
        border: `1px solid ${c.line}`, marginTop: 14, marginBottom: 16,
        overflowX: "auto",
      }}>
        {[
          ["children","🧒 Children"],
          ["groups","👥 Groups"],
          ["framework","🧭 Pathways"],
          ["stages","📊 Stages"],
          ["look","🎨 Look & feel"],
        ].map(([k,l]) => (
          <button key={k} className="tap" onClick={() => setSection(k)} style={{
            border: "none", cursor: "pointer", fontFamily: FONT_BODY, fontSize: 12.5, fontWeight: 700,
            padding: "9px 14px", borderRadius: 9, whiteSpace: "nowrap",
            background: section === k ? c.sage : "transparent",
            color: section === k ? c.white : c.brownLt,
          }}>{l}</button>
        ))}
      </div>

      {/* ─── CHILDREN ─── */}
      {section === "children" && (
        <div>
          <Card style={{
            marginBottom: 14, display: "flex", alignItems: "center", gap: 12,
            background: `linear-gradient(135deg, ${c.sageLt}, ${c.white})`,
            borderColor: c.sage + "55", flexWrap: "wrap",
          }}>
            <div style={{ fontSize: 26 }}>🧒</div>
            <div style={{ flex: 1, minWidth: 160 }}>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 15, fontWeight: 700, color: c.brown }}>
                Your class — {children.length} {children.length === 1 ? "child" : "children"}
              </div>
              <div style={{ fontSize: 12, color: c.brownLt, marginTop: 1 }}>
                Add a new child, or tap any child to edit their name, date of birth or key-person status.
              </div>
            </div>
            <button className="tap" onClick={() => setEditingChild({ new: true })} style={{
              background: c.sage, color: c.white, border: "none", borderRadius: 11,
              padding: "11px 17px", fontWeight: 700, fontSize: 13, cursor: "pointer",
              fontFamily: FONT_BODY, whiteSpace: "nowrap",
            }}>＋ Add child</button>
          </Card>

          <div style={{
            display: "grid",
            gridTemplateColumns: vp.isPhone ? "1fr" : vp.isCompact ? "1fr 1fr" : "1fr 1fr 1fr",
            gap: 11,
          }}>
            {children.map(ch => (
              <Card key={ch.id} pad={14}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <Avatar name={ch.name} photo={ch.photo} size={42} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: c.brown }}>{ch.name}</div>
                    <div style={{ fontSize: 11, color: c.brownLt }}>
                      Age {ageOf(ch.dob)}{ch.keyPerson ? " · key child" : ""}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                  <div style={{
                    flex: 1, background: c.paper, borderRadius: 9, padding: "6px 8px", textAlign: "center",
                  }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: c.brown, fontFamily: FONT_DISPLAY }}>
                      {obsCount(ch.id)}
                    </div>
                    <div style={{ fontSize: 9.5, color: c.brownLt }}>observations</div>
                  </div>
                  <div style={{
                    flex: 1, background: c.paper, borderRadius: 9, padding: "6px 8px", textAlign: "center",
                  }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: c.brown, fontFamily: FONT_DISPLAY }}>
                      {asmCount(ch.id)}/{livePathways().length}
                    </div>
                    <div style={{ fontSize: 9.5, color: c.brownLt }}>assessed</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button className="tap" onClick={() => setEditingChild(ch)} style={{
                    flex: 1, background: c.white, color: c.brown, border: `1.5px solid ${c.line}`,
                    borderRadius: 9, padding: "7px", fontSize: 11.5, fontWeight: 700,
                    cursor: "pointer", fontFamily: FONT_BODY,
                  }}>✎ Edit</button>
                  <button className="tap" onClick={() => openChild(ch.id)} style={{
                    flex: 1, background: c.white, color: c.sageDk, border: `1.5px solid ${c.line}`,
                    borderRadius: 9, padding: "7px", fontSize: 11.5, fontWeight: 700,
                    cursor: "pointer", fontFamily: FONT_BODY,
                  }}>Profile →</button>
                  <button className="tap" onClick={() => setConfirmRemove(ch)} style={{
                    background: "transparent", color: c.terra, border: `1px solid ${c.terra}55`,
                    borderRadius: 9, padding: "7px 10px", fontSize: 11.5, fontWeight: 700,
                    cursor: "pointer", fontFamily: FONT_BODY,
                  }}>🗑</button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ─── FRAMEWORK ─── */}
      {section === "framework" && (
        <div>
          <Card style={{
            marginBottom: 14, background: `linear-gradient(135deg, ${c.blueLt}, ${c.white})`,
            borderColor: c.blue + "66",
          }}>
            <div style={{ display: "flex", gap: 11, alignItems: "flex-start", flexWrap: "wrap" }}>
              <div style={{ fontSize: 24 }}>🧭</div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ fontFamily: FONT_DISPLAY, fontSize: 15, fontWeight: 700, color: c.brown }}>
                  Your development framework
                </div>
                <div style={{ fontSize: 12, color: c.brownLt, marginTop: 2, lineHeight: 1.55 }}>
                  Pathways shape every observation and assessment. Add your own, rename or hide
                  ones you don't use, reorder them, and tailor the quick-tag skills. Changes apply
                  everywhere instantly and save automatically.
                </div>
              </div>
              <button className="tap" onClick={() => setAddingPathway(true)} style={{
                background: c.sage, color: c.white, border: "none", borderRadius: 11,
                padding: "10px 15px", fontWeight: 700, fontSize: 12.5, cursor: "pointer",
                fontFamily: FONT_BODY, whiteSpace: "nowrap",
              }}>＋ Add pathway</button>
            </div>
          </Card>

          {/* Order list — tap-to-move (touch-friendly, no drag) */}
          <Card pad={12} style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 9, flexWrap: "wrap", gap: 8 }}>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: c.brown, letterSpacing: 0.2 }}>
                Order & visibility
              </div>
              <div style={{ fontSize: 10.5, color: movingId ? c.sageDk : c.brownLt, fontStyle: "italic" }}>
                {movingId
                  ? "Now tap any row to move the selected pathway there"
                  : "Tap ⇅ on a row, then tap where you want it"}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {orderedAllPathways.map((p, idx) => {
                const isCustom = customPathways.some(cp => cp.id === p.id);
                const isHidden = !!hiddenPathways[p.id];
                const isSelected = movingId === p.id;
                const isMoveTarget = movingId && movingId !== p.id;

                const handleRowTap = () => {
                  if (!movingId) return;
                  if (movingId === p.id) { setMovingId(null); return; }
                  // Reorder: move selected to this row's position
                  const ids = orderedAllPathways.map(x => x.id);
                  const from = ids.indexOf(movingId);
                  const to = ids.indexOf(p.id);
                  if (from < 0 || to < 0) { setMovingId(null); return; }
                  ids.splice(from, 1);
                  ids.splice(to, 0, movingId);
                  if (reorderPathways) reorderPathways(ids);
                  setMovingId(null);
                };

                return (
                  <div key={p.id}
                    onClick={handleRowTap}
                    className={isMoveTarget ? "tap" : ""}
                    style={{
                      display: "flex", alignItems: "center", gap: 8,
                      background: isSelected ? c.sage + "22"
                        : isMoveTarget ? c.sageLt + "66"
                        : isHidden ? c.paper : c.white,
                      border: `1.5px solid ${
                        isSelected ? c.sage
                        : isMoveTarget ? c.sage + "55"
                        : c.line}`,
                      borderRadius: 9, padding: "8px 9px",
                      opacity: isHidden ? 0.65 : 1,
                      cursor: isMoveTarget ? "pointer" : "default",
                      transition: "background .15s, border-color .15s",
                    }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 8, background: p.color + "2A",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 14, flexShrink: 0,
                    }}>{p.icon}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 700, color: c.brown }}>
                        {p.label}
                        {isCustom && (
                          <span style={{
                            marginLeft: 7, fontSize: 9.5, fontWeight: 700, color: c.sageDk,
                            background: c.sageLt, borderRadius: 20, padding: "1px 7px",
                          }}>custom</span>
                        )}
                        {isSelected && (
                          <span style={{
                            marginLeft: 7, fontSize: 9.5, fontWeight: 700, color: c.white,
                            background: c.sage, borderRadius: 20, padding: "2px 8px",
                          }}>moving…</span>
                        )}
                      </div>
                    </div>

                    {isSelected ? (
                      <button className="tap" onClick={(e) => { e.stopPropagation(); setMovingId(null); }} style={{
                        background: c.white, border: `1px solid ${c.line}`, borderRadius: 7,
                        padding: "0 10px", height: 28, fontSize: 11, fontWeight: 700,
                        color: c.brownLt, cursor: "pointer", fontFamily: FONT_BODY,
                      }}>Cancel</button>
                    ) : (
                      <>
                        <button className="tap"
                          onClick={(e) => { e.stopPropagation(); setMovingId(p.id); }}
                          disabled={!!movingId}
                          title="Move this pathway"
                          style={{
                            background: c.white, border: `1px solid ${c.line}`, borderRadius: 7,
                            width: 32, height: 28, fontSize: 13, fontWeight: 700,
                            color: movingId ? c.line : c.brownLt,
                            cursor: movingId ? "default" : "pointer", fontFamily: FONT_BODY,
                          }}>⇅</button>
                        <button className="tap"
                          onClick={(e) => { e.stopPropagation(); movePathway(p.id, -1); }}
                          disabled={idx === 0 || !!movingId}
                          title="Move up one"
                          style={{
                            background: c.white, border: `1px solid ${c.line}`, borderRadius: 7,
                            width: 28, height: 28, fontSize: 11,
                            color: (idx === 0 || movingId) ? c.line : c.brownLt,
                            cursor: (idx === 0 || movingId) ? "default" : "pointer", fontFamily: FONT_BODY,
                          }}>▲</button>
                        <button className="tap"
                          onClick={(e) => { e.stopPropagation(); movePathway(p.id, 1); }}
                          disabled={idx === orderedAllPathways.length - 1 || !!movingId}
                          title="Move down one"
                          style={{
                            background: c.white, border: `1px solid ${c.line}`, borderRadius: 7,
                            width: 28, height: 28, fontSize: 11,
                            color: (idx === orderedAllPathways.length - 1 || movingId) ? c.line : c.brownLt,
                            cursor: (idx === orderedAllPathways.length - 1 || movingId) ? "default" : "pointer", fontFamily: FONT_BODY,
                          }}>▼</button>
                        <button className="tap"
                          onClick={(e) => { e.stopPropagation(); togglePathwayHidden(p.id); }}
                          disabled={!!movingId}
                          title={isHidden ? "Show pathway" : "Hide pathway"} style={{
                          background: c.white, border: `1px solid ${c.line}`, borderRadius: 7,
                          padding: "0 9px", height: 28, fontSize: 10.5, fontWeight: 700,
                          color: movingId ? c.line : (isHidden ? c.sageDk : c.brownLt),
                          cursor: movingId ? "default" : "pointer", fontFamily: FONT_BODY,
                        }}>{isHidden ? "Show" : "Hide"}</button>
                        {isCustom && (
                          <button className="tap"
                            onClick={(e) => { e.stopPropagation(); setConfirmRemovePathway(p); }}
                            disabled={!!movingId}
                            title="Delete custom pathway" style={{
                            background: "transparent", border: `1px solid ${c.terra}55`, borderRadius: 7,
                            width: 28, height: 28, fontSize: 12,
                            color: movingId ? c.line : c.terra,
                            cursor: movingId ? "default" : "pointer", fontFamily: FONT_BODY,
                          }}>🗑</button>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
            {movingId && (
              <button className="tap" onClick={() => setMovingId(null)} style={{
                marginTop: 10, width: "100%", background: c.cream, color: c.brown,
                border: `1px solid ${c.line}`, borderRadius: 9,
                padding: "8px", fontSize: 11.5, fontWeight: 700,
                cursor: "pointer", fontFamily: FONT_BODY,
              }}>Cancel move</button>
            )}
            {pathwayOrder && !movingId && (
              <button className="tap" onClick={resetOrder} style={{
                marginTop: 10, background: "none", border: "none", color: c.brownLt,
                fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: FONT_BODY,
                textDecoration: "underline",
              }}>↺ Reset to default order</button>
            )}
          </Card>

          <div style={{
            display: "grid",
            gridTemplateColumns: vp.isLaptop ? "1fr 1fr" : "1fr",
            gap: 12,
          }}>
            {orderedAllPathways.filter(p => !hiddenPathways[p.id]).map(p => {
              const basePathway = allPathwayBases().find(bp => bp.id === p.id);
              return (
                <PathwayEditor
                  key={p.id}
                  pathway={p}
                  baseLabel={basePathway?.label || p.label}
                  isRenamed={!!pathwayLabels[p.id]}
                  skills={skillsFor(p.id)}
                  isCustomSkills={!!customSkills[p.id]}
                  onRename={(label) => renamePathway(p.id, label)}
                  onResetName={() => resetPathwayName(p.id)}
                  onSetSkills={(list) => setSkillsForPathway(p.id, list)}
                  onResetSkills={() => resetSkillsForPathway(p.id)}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* ─── GROUPS ─── */}
      {section === "groups" && (
        <GroupsManager
          groups={groups} children={children}
          addGroup={addGroup} updateGroup={updateGroup} removeGroup={removeGroup}
          toggleChildInGroup={toggleChildInGroup}
          vp={vp}
        />
      )}

      {/* ─── STAGES ─── */}
      {section === "stages" && (
        <StagesManager
          stages={liveStages()} isCustom={!!customStages}
          applyStagePreset={applyStagePreset} resetStages={resetStages}
          updateStage={updateStage} addStage={addStage} removeStage={removeStage}
          moveStage={moveStage}
          vp={vp}
        />
      )}

      {/* ─── LOOK & FEEL ─── */}
      {section === "look" && (
        <LookAndFeel
          theme={theme} setTheme={setTheme}
          density={density} setDensity={setDensity}
          vp={vp}
        />
      )}

      {/* add pathway modal */}
      {addingPathway && (
        <PathwayAddModal
          onClose={() => setAddingPathway(false)}
          onSave={(data) => { addPathway(data); setAddingPathway(false); }}
        />
      )}

      {/* remove custom pathway confirmation */}
      {confirmRemovePathway && (
        <ConfirmModal
          title={`Delete "${confirmRemovePathway.label}"?`}
          body={`This removes the pathway from the framework and clears any assessments recorded against it. Observations tagged to it will remain but lose their tag. This cannot be undone.`}
          confirmLabel="Delete pathway"
          onCancel={() => setConfirmRemovePathway(null)}
          onConfirm={() => { removeCustomPathway(confirmRemovePathway.id); setConfirmRemovePathway(null); }}
        />
      )}

      {/* child add/edit modal */}
      {editingChild && (
        <ChildEditModal
          child={editingChild.new ? null : editingChild}
          onClose={() => setEditingChild(null)}
          onSave={(data) => {
            if (editingChild.new) addChild(data);
            else updateChild(editingChild.id, data);
            setEditingChild(null);
          }}
        />
      )}

      {/* remove confirmation */}
      {confirmRemove && (
        <ConfirmModal
          title={`Remove ${confirmRemove.name}?`}
          body={`This will permanently delete ${confirmRemove.name}'s profile, their ${obsCount(confirmRemove.id)} observation(s) and all assessment records. This cannot be undone.`}
          confirmLabel="Remove child"
          onCancel={() => setConfirmRemove(null)}
          onConfirm={() => { removeChild(confirmRemove.id); setConfirmRemove(null); }}
        />
      )}
    </div>
  );
}

/* ─── Pathway editor card ───────────────────────────────────────── */
function PathwayEditor({
  pathway: p, baseLabel, isRenamed, skills, isCustomSkills,
  onRename, onResetName, onSetSkills, onResetSkills,
}) {
  const [open, setOpen] = useState(false);
  const [labelDraft, setLabelDraft] = useState(p.label);
  const [newSkill, setNewSkill] = useState("");

  const commitLabel = () => {
    const v = labelDraft.trim();
    if (v && v !== baseLabel) onRename(v);
    else if (!v || v === baseLabel) onResetName();
  };
  const addSkill = () => {
    const v = newSkill.trim();
    if (!v) return;
    onSetSkills([...skills, v]);
    setNewSkill("");
  };
  const removeSkill = (idx) => onSetSkills(skills.filter((_, i) => i !== idx));

  return (
    <Card pad={14} style={{ borderColor: p.color + "66" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 11, background: p.color + "2A",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0,
        }}>{p.icon}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: c.brown, fontFamily: FONT_DISPLAY }}>
            {p.label}
          </div>
          <div style={{ fontSize: 10.5, color: c.brownLt }}>
            {skills.length} skill tag{skills.length === 1 ? "" : "s"}
            {isRenamed && " · renamed"}{isCustomSkills && " · custom skills"}
          </div>
        </div>
        <button className="tap" onClick={() => setOpen(!open)} style={{
          background: open ? p.color + "1F" : c.cream, border: `1px solid ${open ? p.color + "55" : c.line}`,
          borderRadius: 9, padding: "7px 11px", fontSize: 11.5, fontWeight: 700, color: c.brown,
          cursor: "pointer", fontFamily: FONT_BODY,
        }}>{open ? "▲ Close" : "✎ Edit"}</button>
      </div>

      {open && (
        <div style={{ marginTop: 12 }}>
          {/* rename */}
          <FieldLabel>Pathway name</FieldLabel>
          <div style={{ display: "flex", gap: 6, marginBottom: 4 }}>
            <input
              value={labelDraft}
              onChange={(e) => setLabelDraft(e.target.value)}
              onBlur={commitLabel}
              onKeyDown={(e) => e.key === "Enter" && (commitLabel(), e.target.blur())}
              style={{
                flex: 1, border: `1px solid ${c.line}`, borderRadius: 9, padding: "8px 10px",
                fontSize: 12.5, fontFamily: FONT_BODY, background: c.cream, color: c.ink, outline: "none",
              }}
            />
            {isRenamed && (
              <button className="tap" onClick={() => { onResetName(); setLabelDraft(baseLabel); }} style={{
                background: c.white, border: `1px solid ${c.line}`, borderRadius: 9,
                padding: "0 11px", fontSize: 11, fontWeight: 700, color: c.brownLt,
                cursor: "pointer", fontFamily: FONT_BODY, whiteSpace: "nowrap",
              }}>↺ Reset</button>
            )}
          </div>
          <div style={{ fontSize: 10, color: c.brownLt, marginBottom: 12 }}>
            Default: "{baseLabel}"
          </div>

          {/* skills */}
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
            <FieldLabel>Quick-tag skills</FieldLabel>
            {isCustomSkills && (
              <button className="tap" onClick={onResetSkills} style={{
                background: "none", border: "none", color: c.brownLt, fontSize: 10.5,
                fontWeight: 700, cursor: "pointer", fontFamily: FONT_BODY, textDecoration: "underline",
              }}>↺ Reset to defaults</button>
            )}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 9 }}>
            {skills.length === 0 && (
              <span style={{ fontSize: 11.5, color: c.brownLt, fontStyle: "italic" }}>
                No skills yet — add some below.
              </span>
            )}
            {skills.map((s, i) => (
              <span key={i} style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                background: p.color + "1F", border: `1px solid ${p.color}66`,
                borderRadius: 20, padding: "4px 6px 4px 11px", fontSize: 11.5, fontWeight: 600, color: c.ink,
              }}>
                {s}
                <button className="tap" onClick={() => removeSkill(i)} style={{
                  border: "none", background: c.white, borderRadius: "50%", width: 17, height: 17,
                  cursor: "pointer", color: c.brownLt, fontSize: 12, lineHeight: 1,
                }}>×</button>
              </span>
            ))}
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <input
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addSkill()}
              placeholder="Add a skill tag…"
              style={{
                flex: 1, border: `1px solid ${c.line}`, borderRadius: 9, padding: "8px 10px",
                fontSize: 12, fontFamily: FONT_BODY, background: c.cream, color: c.ink, outline: "none",
              }}
            />
            <button className="tap" onClick={addSkill} style={{
              border: "none", background: p.color, color: c.white, borderRadius: 9,
              padding: "0 14px", fontSize: 16, cursor: "pointer", fontWeight: 700,
            }}>＋</button>
          </div>
        </div>
      )}
    </Card>
  );
}

/* ─── Child add / edit modal ────────────────────────────────────── */
function ChildEditModal({ child, onClose, onSave }) {
  const [name, setName] = useState(child?.name || "");
  const [dob, setDob] = useState(child?.dob || "");
  const [keyPerson, setKeyPerson] = useState(child?.keyPerson || false);
  const [photo, setPhoto] = useState(child?.photo || null);
  const [error, setError] = useState("");
  const fileRef = useRef();

  const onPhotoChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    // Compress: scale to max 240px so dataURL stays small
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const max = 240;
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, w, h);
        setPhoto(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(f);
  };

  const save = () => {
    if (!name.trim()) { setError("Please enter the child's name."); return; }
    if (!dob) { setError("Please enter a date of birth."); return; }
    onSave({ name: name.trim(), dob, keyPerson, photo });
  };

  return (
    <div className="no-print" style={{
      position: "fixed", inset: 0, zIndex: 90, background: "rgba(74,56,38,0.34)",
      backdropFilter: "blur(3px)", display: "flex", alignItems: "center", justifyContent: "center",
      padding: 16,
    }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="rise" style={{
        background: c.cream, width: "100%", maxWidth: 420, maxHeight: "92vh", overflowY: "auto",
        borderRadius: 20, border: `1px solid ${c.line}`, boxShadow: "0 16px 50px rgba(74,56,38,0.3)",
      }}>
        <div style={{
          padding: "16px 20px", borderBottom: `1px solid ${c.line}`,
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 9, background: c.sage + "26",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
          }}>🧒</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 16, fontWeight: 700, color: c.brown }}>
              {child ? "Edit child" : "Add a child"}
            </div>
            <div style={{ fontSize: 11, color: c.brownLt }}>
              {child ? "Update their details" : "Add a new child to your class"}
            </div>
          </div>
          <button onClick={onClose} className="tap" style={{
            border: `1px solid ${c.line}`, background: c.white, borderRadius: 9, width: 30, height: 30,
            fontSize: 17, color: c.brownLt, cursor: "pointer",
          }}>×</button>
        </div>

        <div style={{ padding: "16px 20px 20px" }}>
          {/* Photo */}
          <FieldLabel>Photo <span style={{ color: c.brownLt, fontWeight: 400 }}>— optional</span></FieldLabel>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
            <div onClick={() => fileRef.current.click()} className="tap" style={{
              width: 72, height: 72, borderRadius: "50%", cursor: "pointer", flexShrink: 0,
              border: `2px dashed ${c.sage}66`, background: photo ? "transparent" : c.sageLt,
              backgroundImage: photo ? `url(${photo})` : "none",
              backgroundSize: "cover", backgroundPosition: "center",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 24, color: c.sageDk,
            }}>{!photo && "📷"}</div>
            <div style={{ flex: 1, fontSize: 11.5, color: c.brownLt, lineHeight: 1.55 }}>
              {photo ? "Tap to change photo." : "Tap to upload a photo from the device. Optional — initials work too."}
              {photo && (
                <button onClick={() => setPhoto(null)} className="tap" style={{
                  display: "block", marginTop: 6,
                  background: "none", border: "none", color: c.terra, fontSize: 11, fontWeight: 700,
                  cursor: "pointer", fontFamily: FONT_BODY, textDecoration: "underline", padding: 0,
                }}>Remove photo</button>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" capture="user"
              onChange={onPhotoChange} style={{ display: "none" }} />
          </div>

          <FieldLabel>Full name</FieldLabel>
          <input
            value={name} onChange={(e) => { setName(e.target.value); setError(""); }}
            placeholder="e.g. Ava Whitlock" autoFocus
            style={{
              width: "100%", border: `1px solid ${c.line}`, borderRadius: 10, padding: "10px 12px",
              fontSize: 13, fontFamily: FONT_BODY, background: c.white, color: c.ink, outline: "none",
              marginBottom: 13,
            }}
          />
          <FieldLabel>Date of birth</FieldLabel>
          <input
            type="date" value={dob} onChange={(e) => { setDob(e.target.value); setError(""); }}
            style={{
              width: "100%", border: `1px solid ${c.line}`, borderRadius: 10, padding: "10px 12px",
              fontSize: 13, fontFamily: FONT_BODY, background: c.white, color: c.ink, outline: "none",
              marginBottom: 13,
            }}
          />
          <label className="tap" style={{
            display: "flex", alignItems: "center", gap: 10, cursor: "pointer",
            background: keyPerson ? c.sageLt : c.white, border: `1.5px solid ${keyPerson ? c.sage : c.line}`,
            borderRadius: 11, padding: "11px 13px", marginBottom: 6,
          }}>
            <div style={{
              width: 20, height: 20, borderRadius: 6, flexShrink: 0,
              border: `2px solid ${keyPerson ? c.sage : c.brownLt}`,
              background: keyPerson ? c.sage : c.white, color: c.white,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, fontWeight: 900,
            }} onClick={() => setKeyPerson(!keyPerson)}>{keyPerson ? "✓" : ""}</div>
            <div onClick={() => setKeyPerson(!keyPerson)}>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: c.brown }}>This is one of my key children</div>
              <div style={{ fontSize: 10.5, color: c.brownLt }}>Flags them across the hub as your key-person responsibility</div>
            </div>
          </label>

          {error && (
            <div style={{
              fontSize: 11.5, color: c.terra, background: c.terraLt, borderRadius: 8,
              padding: "7px 10px", marginTop: 8,
            }}>{error}</div>
          )}

          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            <button className="tap" onClick={onClose} style={{
              flex: 1, background: c.white, color: c.brownLt, border: `1.5px solid ${c.line}`,
              borderRadius: 11, padding: "11px", fontFamily: FONT_BODY, fontSize: 13, fontWeight: 700,
              cursor: "pointer",
            }}>Cancel</button>
            <button className="tap" onClick={save} style={{
              flex: 1.4, background: c.sage, color: c.white, border: "none",
              borderRadius: 11, padding: "11px", fontFamily: FONT_BODY, fontSize: 13, fontWeight: 700,
              cursor: "pointer",
            }}>{child ? "Save changes" : "Add child"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Reusable confirm modal ────────────────────────────────────── */
function ConfirmModal({ title, body, confirmLabel, onCancel, onConfirm }) {
  return (
    <div className="no-print" style={{
      position: "fixed", inset: 0, zIndex: 95, background: "rgba(74,56,38,0.36)",
      backdropFilter: "blur(3px)", display: "flex", alignItems: "center", justifyContent: "center",
      padding: 16,
    }} onClick={onCancel}>
      <div onClick={(e) => e.stopPropagation()} className="rise" style={{
        background: c.cream, width: "100%", maxWidth: 380, borderRadius: 18,
        border: `1px solid ${c.line}`, boxShadow: "0 16px 50px rgba(74,56,38,0.3)",
        padding: "20px 22px",
      }}>
        <div style={{ fontSize: 26, marginBottom: 8 }}>⚠️</div>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 16, fontWeight: 700, color: c.brown, marginBottom: 6 }}>
          {title}
        </div>
        <div style={{ fontSize: 12.5, color: c.ink, lineHeight: 1.6, marginBottom: 16 }}>
          {body}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="tap" onClick={onCancel} style={{
            flex: 1, background: c.white, color: c.brown, border: `1.5px solid ${c.line}`,
            borderRadius: 11, padding: "11px", fontFamily: FONT_BODY, fontSize: 13, fontWeight: 700,
            cursor: "pointer",
          }}>Keep</button>
          <button className="tap" onClick={onConfirm} style={{
            flex: 1.2, background: c.terra, color: c.white, border: "none",
            borderRadius: 11, padding: "11px", fontFamily: FONT_BODY, fontSize: 13, fontWeight: 700,
            cursor: "pointer",
          }}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   PLANNING HUB
   Weekly plan board · interest-led suggestions · idea library ·
   automatic next-step linking from observations & assessment
   ════════════════════════════════════════════════════════════════ */
function PlanningHub({
  children, observations, assessment, plans,
  addPlan, updatePlan, removePlan,
  lessons, addLesson, updateLesson, removeLesson, duplicateLesson,
  lessonTemplates, saveAsTemplate, removeTemplate, renameTemplate,
  planWeek, setPlanWeek, pathways, openChild, vp,
}) {
  const [composer, setComposer] = useState(null); // { day } or null
  const [tab, setTab] = useState("board"); // board | suggestions | library

  const weekPlans = plans.filter(p => (p.week || 0) === planWeek);
  const weekLabel = planWeek === 0 ? "This week" : "Next week";

  /* ---- gather next steps waiting to be planned ---- */
  const nextSteps = [];
  observations.forEach(o => {
    if (o.nextStep && !o.draft) {
      const linked = plans.some(p => p.fromObs === o.id);
      if (!linked) nextSteps.push({
        type: "observation", id: o.id, childId: o.childId,
        text: o.nextStep, pathwayId: o.pathwayId, ts: o.ts,
      });
    }
  });
  Object.entries(assessment).forEach(([childId, paths]) => {
    Object.entries(paths).forEach(([pathwayId, cell]) => {
      if (cell.target) {
        const linked = plans.some(p => p.fromTarget === childId + ":" + pathwayId);
        if (!linked) nextSteps.push({
          type: "target", id: childId + ":" + pathwayId, childId,
          text: cell.target, pathwayId, ts: cell.updated || 0,
        });
      }
    });
  });
  nextSteps.sort((a, b) => b.ts - a.ts);

  /* ---- interest-led suggestions: cluster children by shared interest ---- */
  const interestMap = {};
  children.forEach(ch => (ch.interests || []).forEach(intr => {
    const key = intr.toLowerCase().trim();
    if (!interestMap[key]) interestMap[key] = { label: intr, childIds: [] };
    interestMap[key].childIds.push(ch.id);
  }));
  const interestClusters = Object.values(interestMap)
    .sort((a, b) => b.childIds.length - a.childIds.length);

  const childName = (id) => children.find(x => x.id === id)?.name || "—";

  /* ---- export weekly plan ---- */
  const exportPlan = () => {
    const dayBlocks = WEEKDAYS.map(day => {
      const items = weekPlans.filter(p => p.day === day);
      const rows = items.length ? items.map(p => {
        const a = planArea(p.area);
        const pw = p.pathwayId ? pathway(p.pathwayId) : null;
        const who = (p.groupIds || []).length
          ? (p.groupIds || []).map(childName).join(", ")
          : "Whole class / continuous provision";
        return `<div class="item">
          <div class="item-h"><b>${a.icon} ${p.title}</b> <span class="area">${a.label}</span></div>
          ${pw ? `<span class="tag">${pw.icon} ${pw.label}</span>` : ""}
          <div class="who">For: ${who}</div>
          ${p.note ? `<div class="note">${p.note.replace(/</g, "&lt;")}</div>` : ""}
        </div>`;
      }).join("") : `<div class="empty">No focused activities planned — continuous provision.</div>`;
      return `<div class="day"><h3>${day}</h3>${rows}</div>`;
    }).join("");
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Brownie Bear Academy — Weekly Plan</title>
      <style>
        body{font-family:Georgia,serif;color:#4A3826;max-width:880px;margin:30px auto;padding:0 24px;background:#FDF8EF;}
        h1{color:#6E4A2F;margin-bottom:0;}
        .sub{color:#8BA678;letter-spacing:2px;text-transform:uppercase;font-size:12px;margin-bottom:18px;}
        .day{background:#fff;border:1px solid #E7DEC9;border-radius:12px;padding:14px 16px;margin-bottom:12px;}
        .day h3{margin:0 0 8px;color:#6E4A2F;font-size:15px;border-bottom:2px solid #E7DEC9;padding-bottom:5px;}
        .item{background:#FBF7EE;border-radius:9px;padding:9px 11px;margin-bottom:7px;}
        .item-h{font-size:13px;}.area{color:#A8855F;font-size:11px;}
        .tag{display:inline-block;background:#E8EEDF;border-radius:20px;padding:2px 9px;font-size:11px;margin:4px 0;}
        .who{font-size:11.5px;color:#7A4A2E;margin-top:3px;}
        .note{font-size:12px;margin-top:4px;line-height:1.5;}
        .empty{font-size:12px;color:#A8855F;font-style:italic;}
        @media print{body{background:#fff;}}
      </style></head><body>
      <div class="sub">Brownie Bear Academy &middot; Weekly Plan</div>
      <h1>${weekLabel}'s Plan</h1>
      <div class="sub" style="letter-spacing:0;text-transform:none;color:#A8855F;font-size:13px">${new Date().toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" })} &middot; ${children.length} children</div>
      ${dayBlocks}
      </body></html>`;
    const w = window.open("", "_blank");
    if (w) { w.document.write(html); w.document.close(); }
  };

  return (
    <div className="rise">
      {/* header */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 6, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 180 }}>
          <h1 style={{ margin: 0, fontFamily: FONT_DISPLAY, fontSize: vp.isPhone ? 21 : 24, color: c.brown, fontWeight: 700 }}>
            Planning Hub
          </h1>
          <div style={{ fontSize: 12.5, color: c.brownLt, marginTop: 3 }}>
            Plan from what you've seen — observations and targets flow straight into your week
          </div>
        </div>
        <button className="tap no-print" onClick={exportPlan} style={{
          background: c.white, border: `1.5px solid ${c.line}`, borderRadius: 11,
          padding: "9px 14px", fontSize: 12.5, fontWeight: 700, color: c.brown,
          cursor: "pointer", fontFamily: FONT_BODY,
        }}>⤓ Export weekly plan</button>
      </div>

      {/* tab switch */}
      <div className="no-print" style={{
        display: "flex", gap: 4, background: c.white, padding: 4, borderRadius: 12,
        border: `1px solid ${c.line}`, marginTop: 14, marginBottom: 16,
        width: vp.isCompact ? "100%" : "fit-content",
      }}>
        {[["board", "🗓️ Weekly board"], ["lessons", "📋 Lesson plans"], ["suggestions", "💡 Plan from learning"], ["library", "📚 Idea library"]].map(([k, l]) => (
          <button key={k} className="tap" onClick={() => setTab(k)} style={{
            border: "none", cursor: "pointer", fontFamily: FONT_BODY, fontSize: vp.isPhone ? 11 : 12.5, fontWeight: 700,
            padding: vp.isPhone ? "9px 7px" : "9px 14px", borderRadius: 9,
            background: tab === k ? c.sage : "transparent",
            color: tab === k ? c.white : c.brownLt,
            flex: vp.isCompact ? 1 : "none", whiteSpace: "nowrap",
          }}>{l}</button>
        ))}
      </div>

      {/* ===================== LESSON PLANS ===================== */}
      {tab === "lessons" && (
        <LessonPlans
          lessons={lessons} children={children} pathways={pathways}
          addLesson={addLesson} updateLesson={updateLesson}
          removeLesson={removeLesson} duplicateLesson={duplicateLesson}
          lessonTemplates={lessonTemplates} saveAsTemplate={saveAsTemplate}
          removeTemplate={removeTemplate} renameTemplate={renameTemplate}
          vp={vp}
        />
      )}

      {/* ===================== WEEKLY BOARD ===================== */}
      {tab === "board" && (
        <>
          {/* week toggle + count */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
            <div style={{
              display: "flex", gap: 4, background: c.white, padding: 4,
              borderRadius: 10, border: `1px solid ${c.line}`,
            }}>
              {[[0, "This week"], [1, "Next week"]].map(([k, l]) => (
                <button key={k} className="tap" onClick={() => setPlanWeek(k)} style={{
                  border: "none", cursor: "pointer", fontFamily: FONT_BODY, fontSize: 12, fontWeight: 700,
                  padding: "7px 14px", borderRadius: 7,
                  background: planWeek === k ? c.brown : "transparent",
                  color: planWeek === k ? c.white : c.brownLt,
                }}>{l}</button>
              ))}
            </div>
            <div style={{ fontSize: 12, color: c.brownLt }}>
              {weekPlans.length} activit{weekPlans.length === 1 ? "y" : "ies"} planned
            </div>
          </div>

          {/* day columns */}
          <div style={{
            display: "grid",
            gridTemplateColumns: vp.isLaptop ? "repeat(5, 1fr)" : vp.isTabletPortrait ? "repeat(2, 1fr)" : "1fr",
            gap: 12,
          }}>
            {WEEKDAYS.map(day => {
              const items = weekPlans.filter(p => p.day === day);
              return (
                <div key={day} style={{
                  background: c.white, border: `1px solid ${c.line}`, borderRadius: 14,
                  padding: 12, display: "flex", flexDirection: "column", gap: 9,
                  minHeight: vp.isLaptop ? 220 : "auto",
                }}>
                  <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    borderBottom: `2px solid ${c.line}`, paddingBottom: 7,
                  }}>
                    <span style={{ fontFamily: FONT_DISPLAY, fontSize: 14, fontWeight: 700, color: c.brown }}>{day}</span>
                    <button className="tap no-print" onClick={() => setComposer({ day })} style={{
                      border: "none", background: c.sageLt, color: c.sageDk,
                      borderRadius: 8, width: 26, height: 26, cursor: "pointer",
                      fontSize: 16, fontWeight: 700, lineHeight: 1,
                    }}>＋</button>
                  </div>
                  {items.length === 0 && (
                    <div style={{ fontSize: 11.5, color: c.brownLt, fontStyle: "italic", padding: "8px 2px" }}>
                      Continuous provision — tap ＋ to add a focus.
                    </div>
                  )}
                  {items.map(p => (
                    <PlanCard key={p.id} plan={p} childName={childName}
                      onToggle={() => updatePlan(p.id, { done: !p.done })}
                      onRemove={() => removePlan(p.id)} />
                  ))}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ================= PLAN FROM LEARNING ================= */}
      {tab === "suggestions" && (
        <div style={{ display: "grid", gridTemplateColumns: vp.isLaptop ? "1fr 1fr" : "1fr", gap: 16 }}>
          {/* next steps waiting */}
          <Card>
            <SectionLabel hint="from your observations & assessment targets">Next steps waiting to be planned</SectionLabel>
            {nextSteps.length === 0 ? (
              <div style={{ fontSize: 13, color: c.sageDk, display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ fontSize: 18 }}>🌟</span>
                Every next step has been planned for. Beautifully on top of it.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                {nextSteps.slice(0, 12).map(ns => {
                  const pw = ns.pathwayId ? pathway(ns.pathwayId) : null;
                  return (
                    <div key={ns.type + ns.id} style={{
                      background: c.cream, border: `1px solid ${c.line}`, borderRadius: 11, padding: "10px 11px",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 5 }}>
                        <Avatar name={childName(ns.childId)} size={22} />
                        <span style={{ fontSize: 11.5, fontWeight: 700, color: c.brown }}>{childName(ns.childId)}</span>
                        <span style={{
                          fontSize: 9, fontWeight: 700, color: c.brownLt, background: c.white,
                          border: `1px solid ${c.line}`, borderRadius: 20, padding: "1px 7px",
                        }}>{ns.type === "target" ? "assessment target" : "observation"}</span>
                        {pw && <span style={{ marginLeft: "auto", fontSize: 13 }} title={pw.label}>{pw.icon}</span>}
                      </div>
                      <div style={{ fontSize: 12.5, color: c.ink, lineHeight: 1.5, marginBottom: 8 }}>{ns.text}</div>
                      <button className="tap" onClick={() => setComposer({
                        day: WEEKDAYS[0],
                        prefill: {
                          title: ns.text.length > 50 ? ns.text.slice(0, 48) + "…" : ns.text,
                          note: ns.text, pathwayId: ns.pathwayId || "", groupIds: [ns.childId],
                          area: "group",
                          fromObs: ns.type === "observation" ? ns.id : undefined,
                          fromTarget: ns.type === "target" ? ns.id : undefined,
                        },
                      })} style={{
                        background: c.sage, color: c.white, border: "none", borderRadius: 8,
                        padding: "6px 12px", fontSize: 11.5, fontWeight: 700, cursor: "pointer", fontFamily: FONT_BODY,
                      }}>＋ Add to plan</button>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* interest clusters */}
          <Card>
            <SectionLabel hint="children grouped by what they love">Interest-led grouping</SectionLabel>
            {interestClusters.length === 0 ? (
              <div style={{ fontSize: 12.5, color: c.brownLt }}>
                Add interests to children's profiles and they'll cluster here for group planning.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                {interestClusters.slice(0, 8).map(cluster => (
                  <div key={cluster.label} style={{
                    background: c.cream, border: `1px solid ${c.line}`, borderRadius: 11, padding: "10px 11px",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: c.brown, textTransform: "capitalize" }}>
                        {cluster.label}
                      </span>
                      <span style={{
                        fontSize: 10, fontWeight: 700, color: c.white, background: c.sage,
                        borderRadius: 10, padding: "1px 7px",
                      }}>{cluster.childIds.length} {cluster.childIds.length === 1 ? "child" : "children"}</span>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 8 }}>
                      {cluster.childIds.map(id => (
                        <span key={id} onClick={() => openChild(id)} className="tap" style={{
                          fontSize: 11, background: c.white, border: `1px solid ${c.line}`,
                          borderRadius: 20, padding: "3px 9px", cursor: "pointer", color: c.ink, fontWeight: 600,
                        }}>{childName(id).split(" ")[0]}</span>
                      ))}
                    </div>
                    <button className="tap" onClick={() => setComposer({
                      day: WEEKDAYS[0],
                      prefill: {
                        title: cluster.label.charAt(0).toUpperCase() + cluster.label.slice(1) + " group activity",
                        note: "Interest-led small group for children who love " + cluster.label + ".",
                        groupIds: cluster.childIds, area: "group", pathwayId: "",
                      },
                    })} style={{
                      background: c.white, color: c.sageDk, border: `1.5px solid ${c.sage}`, borderRadius: 8,
                      padding: "6px 12px", fontSize: 11.5, fontWeight: 700, cursor: "pointer", fontFamily: FONT_BODY,
                    }}>＋ Plan for this group</button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ==================== IDEA LIBRARY ==================== */}
      {tab === "library" && (
        <div style={{
          display: "grid",
          gridTemplateColumns: vp.isLaptop ? "1fr 1fr" : "1fr",
          gap: 12,
        }}>
          {pathways.map(p => (
            <Card key={p.id} pad={14} style={{ borderColor: p.color + "55" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 10 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 10, background: p.color + "2A",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
                }}>{p.icon}</div>
                <div style={{ fontFamily: FONT_DISPLAY, fontSize: 14, fontWeight: 700, color: c.brown }}>{p.label}</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {(IDEA_LIBRARY[p.id] || []).map((idea, i) => (
                  <div key={i} style={{
                    display: "flex", gap: 8, alignItems: "flex-start",
                    background: c.cream, borderRadius: 9, padding: "8px 10px",
                  }}>
                    <span style={{ fontSize: 12.5, color: c.ink, lineHeight: 1.45, flex: 1 }}>{idea}</span>
                    <button className="tap no-print" onClick={() => setComposer({
                      day: WEEKDAYS[0],
                      prefill: { title: idea.length > 48 ? idea.slice(0, 46) + "…" : idea, note: idea, pathwayId: p.id, area: "invitation", groupIds: [] },
                    })} style={{
                      border: "none", background: p.color + "33", color: c.brown,
                      borderRadius: 7, padding: "4px 9px", fontSize: 10.5, fontWeight: 700,
                      cursor: "pointer", fontFamily: FONT_BODY, whiteSpace: "nowrap", flexShrink: 0,
                    }}>＋ Plan</button>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      {composer && (
        <PlanComposer
          children={children} pathways={pathways}
          day={composer.day} prefill={composer.prefill}
          week={planWeek}
          onClose={() => setComposer(null)}
          onSave={(data) => { addPlan(data); setComposer(null); }}
        />
      )}
    </div>
  );
}

function PlanCard({ plan, childName, onToggle, onRemove }) {
  const a = planArea(plan.area);
  const pw = plan.pathwayId ? pathway(plan.pathwayId) : null;
  const who = (plan.groupIds || []).length
    ? (plan.groupIds || []).map(id => childName(id).split(" ")[0]).join(", ")
    : "Whole class";
  return (
    <div style={{
      background: plan.done ? c.sageLt : c.cream,
      border: `1px solid ${plan.done ? c.sage + "66" : c.line}`,
      borderLeft: `4px solid ${a.color}`, borderRadius: 10, padding: "9px 10px",
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 7 }}>
        <button className="tap no-print" onClick={onToggle} style={{
          width: 17, height: 17, borderRadius: 5, flexShrink: 0, cursor: "pointer", marginTop: 1,
          border: `2px solid ${plan.done ? c.sage : c.brownLt}`,
          background: plan.done ? c.sage : c.white,
          color: c.white, fontSize: 11, lineHeight: 1, fontWeight: 900,
        }}>{plan.done ? "✓" : ""}</button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 12, fontWeight: 700, color: c.brown, lineHeight: 1.35,
            textDecoration: plan.done ? "line-through" : "none",
          }}>{a.icon} {plan.title}</div>
          <div style={{ fontSize: 10, color: c.brownLt, marginTop: 2 }}>{a.label} · {who}</div>
          {pw && (
            <div style={{
              display: "inline-block", marginTop: 5, fontSize: 9.5, fontWeight: 700,
              background: pw.color + "26", color: c.ink, border: `1px solid ${pw.color}55`,
              borderRadius: 20, padding: "1px 7px",
            }}>{pw.icon} {pw.label}</div>
          )}
          {plan.note && plan.note !== plan.title && (
            <div style={{ fontSize: 10.5, color: c.ink, marginTop: 5, lineHeight: 1.45 }}>{plan.note}</div>
          )}
          {(plan.fromObs || plan.fromTarget) && (
            <div style={{ fontSize: 9, color: c.sageDk, marginTop: 4, fontStyle: "italic" }}>
              ↳ planned from {plan.fromTarget ? "an assessment target" : "an observation"}
            </div>
          )}
        </div>
        <button className="tap no-print" onClick={onRemove} style={{
          border: "none", background: "none", cursor: "pointer", color: c.brownLt,
          fontSize: 15, lineHeight: 1, flexShrink: 0,
        }}>×</button>
      </div>
    </div>
  );
}

function PlanComposer({ children, pathways, day, prefill, week, onClose, onSave }) {
  const [title, setTitle] = useState(prefill?.title || "");
  const [area, setArea] = useState(prefill?.area || "invitation");
  const [pathwayId, setPathwayId] = useState(prefill?.pathwayId || "");
  const [groupIds, setGroupIds] = useState(prefill?.groupIds || []);
  const [note, setNote] = useState(prefill?.note || "");
  const [selectedDay, setSelectedDay] = useState(day || WEEKDAYS[0]);

  const toggleChild = (id) =>
    setGroupIds(groupIds.includes(id) ? groupIds.filter(x => x !== id) : [...groupIds, id]);

  const save = () => {
    if (!title.trim()) return;
    onSave({
      day: selectedDay, week, title: title.trim(), area, pathwayId,
      groupIds, note: note.trim(),
      fromObs: prefill?.fromObs, fromTarget: prefill?.fromTarget,
    });
  };

  return (
    <div className="no-print" style={{
      position: "fixed", inset: 0, zIndex: 80, background: "rgba(74,56,38,0.32)",
      backdropFilter: "blur(3px)", display: "flex", alignItems: "flex-end", justifyContent: "center",
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="rise" style={{
        background: c.cream, width: "100%", maxWidth: 580, maxHeight: "94vh", overflowY: "auto",
        borderRadius: "22px 22px 0 0", border: `1px solid ${c.line}`,
        boxShadow: "0 -10px 40px rgba(74,56,38,0.25)",
      }}>
        <div style={{
          position: "sticky", top: 0, background: c.cream, zIndex: 2,
          padding: "16px 20px 12px", borderBottom: `1px solid ${c.line}`,
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <div style={{
            width: 30, height: 30, borderRadius: 9, background: c.sage + "26",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
          }}>🗓️</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 16, fontWeight: 700, color: c.brown }}>
              Add to the plan
            </div>
            <div style={{ fontSize: 11, color: c.brownLt }}>A focused activity for your week</div>
          </div>
          <button onClick={onClose} className="tap" style={{
            border: `1px solid ${c.line}`, background: c.white, borderRadius: 9, width: 30, height: 30,
            fontSize: 17, color: c.brownLt, cursor: "pointer",
          }}>×</button>
        </div>

        <div style={{ padding: "14px 20px 20px" }}>
          <FieldLabel>Activity title</FieldLabel>
          <input value={title} onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Dinosaur small-world with number rocks"
            style={{
              width: "100%", border: `1px solid ${c.line}`, borderRadius: 10, padding: "10px 12px",
              fontSize: 13, fontFamily: FONT_BODY, background: c.white, color: c.ink, outline: "none",
              marginBottom: 15,
            }} />

          <FieldLabel>Day</FieldLabel>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 15 }}>
            {WEEKDAYS.map(d => (
              <button key={d} className="tap" onClick={() => setSelectedDay(d)} style={{
                cursor: "pointer", fontFamily: FONT_BODY, fontSize: 12, fontWeight: 700,
                padding: "7px 13px", borderRadius: 20,
                background: selectedDay === d ? c.brown : c.white,
                color: selectedDay === d ? c.white : c.brownLt,
                border: `1.5px solid ${selectedDay === d ? c.brown : c.line}`,
              }}>{d}</button>
            ))}
          </div>

          <FieldLabel>Learning area</FieldLabel>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 15 }}>
            {PLAN_AREAS.map(a => {
              const on = area === a.id;
              return (
                <button key={a.id} className="tap" onClick={() => setArea(a.id)} style={{
                  cursor: "pointer", fontFamily: FONT_BODY, fontSize: 11.5, fontWeight: 600,
                  padding: "5px 10px", borderRadius: 20,
                  background: on ? a.color : a.color + "1F",
                  color: on ? c.white : c.ink,
                  border: `1px solid ${a.color}${on ? "" : "55"}`,
                }}>{a.icon} {a.label}</button>
              );
            })}
          </div>

          <FieldLabel>Developmental focus <span style={{ color: c.brownLt, fontWeight: 400 }}>— optional</span></FieldLabel>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 15 }}>
            {pathways.map(p => {
              const on = pathwayId === p.id;
              return (
                <button key={p.id} className="tap" onClick={() => setPathwayId(on ? "" : p.id)} style={{
                  cursor: "pointer", fontFamily: FONT_BODY, fontSize: 11.5, fontWeight: 600,
                  padding: "5px 10px", borderRadius: 20,
                  background: on ? p.color : p.color + "1F",
                  color: on ? c.white : c.ink,
                  border: `1px solid ${p.color}${on ? "" : "55"}`,
                }}>{p.icon} {p.label}</button>
              );
            })}
          </div>

          <FieldLabel>Who is it for? <span style={{ color: c.brownLt, fontWeight: 400 }}>— leave empty for whole class</span></FieldLabel>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 15 }}>
            {children.map(ch => {
              const on = groupIds.includes(ch.id);
              return (
                <button key={ch.id} className="tap" onClick={() => toggleChild(ch.id)} style={{
                  display: "flex", alignItems: "center", gap: 6, cursor: "pointer",
                  padding: "5px 11px 5px 5px", borderRadius: 30, fontFamily: FONT_BODY,
                  background: on ? c.sage : c.white,
                  border: `1.5px solid ${on ? c.sage : c.line}`,
                  color: on ? c.white : c.ink,
                }}>
                  <Avatar name={ch.name} photo={ch.photo} size={22} color={on ? c.white : c.sage} />
                  <span style={{ fontSize: 11.5, fontWeight: 600 }}>{ch.name.split(" ")[0]}</span>
                </button>
              );
            })}
          </div>

          <FieldLabel>Notes & set-up <span style={{ color: c.brownLt, fontWeight: 400 }}>— optional</span></FieldLabel>
          <textarea value={note} onChange={e => setNote(e.target.value)}
            placeholder="Resources to prepare, key questions to ask, how to extend it…"
            style={{
              width: "100%", minHeight: 70, resize: "vertical", border: `1px solid ${c.line}`,
              borderRadius: 11, padding: "10px 12px", fontSize: 12.5, fontFamily: FONT_BODY,
              background: c.white, color: c.ink, outline: "none", lineHeight: 1.55, marginBottom: 16,
            }} />

          <div style={{ display: "flex", gap: 8 }}>
            <button className="tap" onClick={onClose} style={{
              cursor: "pointer", background: c.white, color: c.brownLt,
              border: `1.5px solid ${c.line}`, borderRadius: 12, padding: "12px 16px",
              fontFamily: FONT_BODY, fontSize: 13, fontWeight: 700,
            }}>Cancel</button>
            <button className="tap" disabled={!title.trim()} onClick={save} style={{
              flex: 1, cursor: title.trim() ? "pointer" : "not-allowed",
              background: title.trim() ? c.sage : c.line, color: c.white,
              border: "none", borderRadius: 12, padding: "12px",
              fontFamily: FONT_BODY, fontSize: 13, fontWeight: 700,
            }}>✓ Add to plan</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   FAMILY COMMUNICATION HUB
   Learning stories · progress summaries · celebration cards ·
   home-learning ideas — all AI-assisted, warm & professional
   ════════════════════════════════════════════════════════════════ */
const FAMILY_KINDS = [
  { id: "story",       label: "Learning story",     icon: "📖", color: c.blue,
    blurb: "A warm narrative of a special learning moment." },
  { id: "summary",     label: "Progress summary",   icon: "🌱", color: c.sage,
    blurb: "A gentle round-up of how a child is growing." },
  { id: "celebration", label: "Celebration card",   icon: "🎉", color: c.yellow,
    blurb: "A short, joyful 'guess what they did today!'" },
  { id: "home",        label: "Home-learning idea", icon: "🏡", color: c.terra,
    blurb: "A simple, no-pressure idea to try at home." },
];
const familyKind = (id) => FAMILY_KINDS.find(k => k.id === id) || FAMILY_KINDS[0];

function FamilyHub({
  children, observations, assessment, familyMessages,
  addFamilyMessage, updateFamilyMessage, removeFamilyMessage,
  pathways, openChild, vp,
}) {
  const [composer, setComposer] = useState(null); // { childId, kind } | null
  const [filterChild, setFilterChild] = useState("");

  const childName = (id) => children.find(x => x.id === id)?.name || "—";

  let list = [...familyMessages];
  if (filterChild) list = list.filter(m => m.childId === filterChild);
  list.sort((a, b) => b.ts - a.ts);

  const draftCount = familyMessages.filter(m => !m.sent).length;

  /* export all messages for a printable parent pack */
  const exportPack = () => {
    const rows = list.map(m => {
      const k = familyKind(m.kind);
      return `<div class="msg">
        <div class="msg-h"><b>${k.icon} ${m.title}</b>
        <span class="meta">${childName(m.childId)} &middot; ${new Date(m.ts).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" })}${m.sent ? "" : " &middot; <em>draft</em>"}</span></div>
        <div class="kind">${k.label}</div>
        <p>${(m.body || "").replace(/</g, "&lt;").replace(/\n/g, "<br/>")}</p>
      </div>`;
    }).join("");
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Brownie Bear Academy — Family Communications</title>
      <style>
        body{font-family:Georgia,serif;color:#4A3826;max-width:780px;margin:30px auto;padding:0 24px;background:#FDF8EF;}
        h1{color:#6E4A2F;margin-bottom:0;}
        .sub{color:#8BA678;letter-spacing:2px;text-transform:uppercase;font-size:12px;margin-bottom:20px;}
        .msg{background:#fff;border:1px solid #E7DEC9;border-radius:14px;padding:16px 18px;margin-bottom:14px;}
        .msg-h{display:flex;justify-content:space-between;align-items:baseline;flex-wrap:wrap;gap:6px;}
        .meta{font-size:12px;color:#A8855F;}
        .kind{display:inline-block;background:#E8EEDF;border-radius:20px;padding:2px 10px;font-size:11px;margin:6px 0;}
        p{font-size:14px;line-height:1.65;}
        @media print{body{background:#fff;}}
      </style></head><body>
      <div class="sub">Brownie Bear Academy &middot; Family Communications</div>
      <h1>Family Communication Pack</h1>
      <div class="sub" style="letter-spacing:0;text-transform:none;color:#A8855F;font-size:13px">${new Date().toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" })}</div>
      ${rows || "<p>No messages yet.</p>"}
      </body></html>`;
    const w = window.open("", "_blank");
    if (w) { w.document.write(html); w.document.close(); }
  };

  return (
    <div className="rise">
      {/* header */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 6, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 180 }}>
          <h1 style={{ margin: 0, fontFamily: FONT_DISPLAY, fontSize: vp.isPhone ? 21 : 24, color: c.brown, fontWeight: 700 }}>
            Family Communication
          </h1>
          <div style={{ fontSize: 12.5, color: c.brownLt, marginTop: 3 }}>
            Warm, professional updates for parents — written with you, in seconds
          </div>
        </div>
        <button className="tap no-print" onClick={exportPack} style={{
          background: c.white, border: `1.5px solid ${c.line}`, borderRadius: 11,
          padding: "9px 14px", fontSize: 12.5, fontWeight: 700, color: c.brown,
          cursor: "pointer", fontFamily: FONT_BODY,
        }}>⤓ Export pack</button>
      </div>

      {/* create-new tiles */}
      <div style={{
        display: "grid",
        gridTemplateColumns: vp.isPhone ? "1fr 1fr" : "repeat(4, 1fr)",
        gap: 10, marginTop: 14, marginBottom: 18,
      }}>
        {FAMILY_KINDS.map(k => (
          <button key={k.id} className="tap no-print" onClick={() => setComposer({ childId: children[0]?.id || "", kind: k.id })} style={{
            background: c.white, border: `1.5px solid ${k.color}66`, borderRadius: 14,
            padding: "13px 12px", cursor: "pointer", fontFamily: FONT_BODY, textAlign: "left",
          }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10, background: k.color + "2A",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, marginBottom: 8,
            }}>{k.icon}</div>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: c.brown }}>{k.label}</div>
            <div style={{ fontSize: 10.5, color: c.brownLt, marginTop: 2, lineHeight: 1.4 }}>{k.blurb}</div>
          </button>
        ))}
      </div>

      {/* filter */}
      <Card className="no-print" pad={12} style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: 11.5, fontWeight: 700, color: c.brown, marginRight: 2 }}>Filter:</span>
          <Pill color={c.sage} active={!filterChild} onClick={() => setFilterChild("")}>All children</Pill>
          {children.map(ch => (
            <Pill key={ch.id} color={c.sage} active={filterChild === ch.id}
              onClick={() => setFilterChild(filterChild === ch.id ? "" : ch.id)}>
              {ch.name.split(" ")[0]}
            </Pill>
          ))}
        </div>
      </Card>

      {/* message list */}
      <div style={{ fontSize: 12, color: c.brownLt, marginBottom: 10 }}>
        {familyMessages.length} message{familyMessages.length === 1 ? "" : "s"} ·
        {" "}{draftCount} draft{draftCount === 1 ? "" : "s"} · all saved automatically
      </div>

      {list.length === 0 ? (
        <Card style={{ textAlign: "center", padding: 40 }}>
          <div style={{ fontSize: 34, marginBottom: 8 }}>💌</div>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 16, color: c.brown, fontWeight: 700 }}>
            {familyMessages.length === 0 ? "No family messages yet" : "Nothing matches that filter"}
          </div>
          <div style={{ fontSize: 12.5, color: c.brownLt, marginTop: 4 }}>
            {familyMessages.length === 0
              ? "Pick a card type above to write your first one."
              : "Try clearing the filter."}
          </div>
        </Card>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: vp.isLaptop ? "1fr 1fr" : "1fr",
          gap: 12,
        }}>
          {list.map(m => (
            <FamilyMessageCard key={m.id} m={m} childName={childName}
              onEdit={() => setComposer({ editId: m.id, childId: m.childId, kind: m.kind })}
              onToggleSent={() => updateFamilyMessage(m.id, { sent: !m.sent })}
              onRemove={() => removeFamilyMessage(m.id)}
              openChild={openChild} />
          ))}
        </div>
      )}

      {composer && (
        <FamilyComposer
          children={children} observations={observations} assessment={assessment}
          pathways={pathways}
          editMessage={composer.editId ? familyMessages.find(m => m.id === composer.editId) : null}
          initialChildId={composer.childId} initialKind={composer.kind}
          onClose={() => setComposer(null)}
          onSave={(data) => {
            if (composer.editId) updateFamilyMessage(composer.editId, data);
            else addFamilyMessage(data);
            setComposer(null);
          }}
        />
      )}
    </div>
  );
}

function FamilyMessageCard({ m, childName, onEdit, onToggleSent, onRemove, openChild }) {
  const k = familyKind(m.kind);
  return (
    <Card pad={0} style={{ overflow: "hidden", borderColor: m.sent ? c.line : k.color + "66" }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 9, padding: "11px 13px",
        background: k.color + "14", borderBottom: `1px solid ${c.line}`,
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 9, background: k.color + "2E",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0,
        }}>{k.icon}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: c.brown }}>{m.title}</div>
          <div style={{ fontSize: 10.5, color: c.brownLt }}>
            {k.label} · <span onClick={() => openChild(m.childId)} className="tap" style={{ cursor: "pointer", textDecoration: "underline" }}>{childName(m.childId)}</span>
          </div>
        </div>
        <span style={{
          fontSize: 9.5, fontWeight: 700, borderRadius: 20, padding: "2px 8px",
          background: m.sent ? c.sageLt : c.white,
          color: m.sent ? c.sageDk : c.terra,
          border: `1px solid ${m.sent ? c.sage + "66" : c.terra + "66"}`,
        }}>{m.sent ? "✓ shared" : "draft"}</span>
      </div>
      <div style={{ padding: "11px 13px" }}>
        <p style={{
          margin: "0 0 11px", fontSize: 12.5, lineHeight: 1.6, color: c.ink,
          fontFamily: FONT_DISPLAY, whiteSpace: "pre-wrap",
        }}>{m.body}</p>
        <div style={{ fontSize: 10, color: c.brownLt, marginBottom: 10 }}>
          {new Date(m.ts).toLocaleString(undefined, { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
        </div>
        <div className="no-print" style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <button className="tap" onClick={onEdit} style={{
            cursor: "pointer", background: c.white, color: c.brown,
            border: `1.5px solid ${c.line}`, borderRadius: 9, padding: "7px 12px",
            fontFamily: FONT_BODY, fontSize: 11.5, fontWeight: 700,
          }}>✎ Edit</button>
          <button className="tap" onClick={onToggleSent} style={{
            cursor: "pointer", background: m.sent ? c.white : c.sage,
            color: m.sent ? c.sageDk : c.white,
            border: `1.5px solid ${m.sent ? c.line : c.sage}`, borderRadius: 9, padding: "7px 12px",
            fontFamily: FONT_BODY, fontSize: 11.5, fontWeight: 700,
          }}>{m.sent ? "Mark as draft" : "✓ Mark as shared"}</button>
          <div style={{ flex: 1 }} />
          <button className="tap" onClick={onRemove} style={{
            cursor: "pointer", background: "transparent", color: c.terra,
            border: `1px solid ${c.terra}55`, borderRadius: 9, padding: "7px 11px",
            fontFamily: FONT_BODY, fontSize: 11.5, fontWeight: 700,
          }}>Delete</button>
        </div>
      </div>
    </Card>
  );
}

function FamilyComposer({
  children, observations, assessment, pathways,
  editMessage, initialChildId, initialKind, onClose, onSave,
}) {
  const [childId, setChildId] = useState(editMessage?.childId || initialChildId || children[0]?.id || "");
  const [kind, setKind] = useState(editMessage?.kind || initialKind || "story");
  const [title, setTitle] = useState(editMessage?.title || "");
  const [body, setBody] = useState(editMessage?.body || "");
  const [sourceObsId, setSourceObsId] = useState("");

  const child = children.find(x => x.id === childId);
  const childObs = observations.filter(o => o.childId === childId && !o.draft);
  const k = familyKind(kind);

  /* Insert a sentence-starter or a template based on the chosen kind & source obs */
  const childFirst = (child?.name || "your child").split(" ")[0];
  const sourceObs = childObs.find(o => o.id === sourceObsId);

  const templates = {
    story: [
      { label: "Opening", text: `This week, ${childFirst} surprised me with…` },
      { label: "What they did", text: sourceObs ? `${childFirst} ${(sourceObs.text || sourceObs.raw || "").trim()}` : `${childFirst} was deeply involved in…` },
      { label: "Why it matters", text: `What I love about this is that it shows…` },
      { label: "Closing", text: `It's a real joy to watch ${childFirst} grow in confidence here.` },
    ],
    summary: [
      { label: "Opening", text: `Here is a little update on how ${childFirst} has been growing recently.` },
      { label: "Strengths", text: `${childFirst} is showing real confidence with…` },
      { label: "Growing edge", text: `An area we are gently encouraging is…` },
      { label: "At home", text: `Something that could support this at home is…` },
    ],
    celebration: [
      { label: "The moment", text: `You'll want to hear this — today ${childFirst}…` },
      { label: "Warm close", text: `We were all so proud. A lovely moment.` },
    ],
    home: [
      { label: "One idea", text: `If you'd like a little idea to try at home this week — ${childFirst} has been enjoying…` },
      { label: "How to play", text: `You could simply…` },
      { label: "No pressure", text: `No need for anything special — five minutes of play is plenty.` },
    ],
  };
  const currentTemplates = templates[kind] || [];

  const insertTemplate = (text) => {
    setBody(prev => (prev ? prev.trim() + "\n\n" : "") + text);
  };
  const applyAllTemplates = () => {
    const text = currentTemplates.map(t => t.text).join("\n\n");
    setBody(text);
    if (!title.trim()) {
      const defaultTitles = {
        story: `${childFirst}'s learning story`,
        summary: `How ${childFirst} is growing`,
        celebration: `A lovely moment with ${childFirst}`,
        home: `An idea to try at home`,
      };
      setTitle(defaultTitles[kind] || "");
    }
  };

  const save = (asSent) => {
    if (!title.trim() && !body.trim()) return;
    onSave({
      childId, kind,
      title: title.trim() || k.label,
      body: body.trim(),
      sent: asSent,
    });
  };

  return (
    <div className="no-print" style={{
      position: "fixed", inset: 0, zIndex: 80, background: "rgba(74,56,38,0.32)",
      backdropFilter: "blur(3px)", display: "flex", alignItems: "flex-end", justifyContent: "center",
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="rise" style={{
        background: c.cream, width: "100%", maxWidth: 600, maxHeight: "94vh", overflowY: "auto",
        borderRadius: "22px 22px 0 0", border: `1px solid ${c.line}`,
        boxShadow: "0 -10px 40px rgba(74,56,38,0.25)",
      }}>
        <div style={{
          position: "sticky", top: 0, background: c.cream, zIndex: 2,
          padding: "16px 20px 12px", borderBottom: `1px solid ${c.line}`,
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <div style={{
            width: 30, height: 30, borderRadius: 9, background: k.color + "2E",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
          }}>{k.icon}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 16, fontWeight: 700, color: c.brown }}>
              {editMessage ? "Edit message" : "New family message"}
            </div>
            <div style={{ fontSize: 11, color: c.brownLt }}>Written with you — warm and professional</div>
          </div>
          <button onClick={onClose} className="tap" style={{
            border: `1px solid ${c.line}`, background: c.white, borderRadius: 9, width: 30, height: 30,
            fontSize: 17, color: c.brownLt, cursor: "pointer",
          }}>×</button>
        </div>

        <div style={{ padding: "14px 20px 20px" }}>
          {/* kind */}
          <FieldLabel>Message type</FieldLabel>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 15 }}>
            {FAMILY_KINDS.map(fk => {
              const on = kind === fk.id;
              return (
                <button key={fk.id} className="tap" onClick={() => setKind(fk.id)} style={{
                  cursor: "pointer", fontFamily: FONT_BODY, fontSize: 11.5, fontWeight: 600,
                  padding: "5px 11px", borderRadius: 20,
                  background: on ? fk.color : fk.color + "1F",
                  color: on ? c.white : c.ink,
                  border: `1px solid ${fk.color}${on ? "" : "55"}`,
                }}>{fk.icon} {fk.label}</button>
              );
            })}
          </div>

          {/* child */}
          <FieldLabel>Which child?</FieldLabel>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 15 }}>
            {children.map(ch => {
              const on = childId === ch.id;
              return (
                <button key={ch.id} className="tap" onClick={() => { setChildId(ch.id); setSourceObsId(""); }} style={{
                  display: "flex", alignItems: "center", gap: 6, cursor: "pointer",
                  padding: "5px 11px 5px 5px", borderRadius: 30, fontFamily: FONT_BODY,
                  background: on ? c.sage : c.white,
                  border: `1.5px solid ${on ? c.sage : c.line}`,
                  color: on ? c.white : c.ink,
                }}>
                  <Avatar name={ch.name} photo={ch.photo} size={22} color={on ? c.white : c.sage} />
                  <span style={{ fontSize: 11.5, fontWeight: 600 }}>{ch.name.split(" ")[0]}</span>
                </button>
              );
            })}
          </div>

          {/* optional source observation */}
          {childObs.length > 0 && (
            <>
              <FieldLabel>Base it on an observation <span style={{ color: c.brownLt, fontWeight: 400 }}>— optional</span></FieldLabel>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 15 }}>
                <button className="tap" onClick={() => setSourceObsId("")} style={{
                  textAlign: "left", cursor: "pointer", fontFamily: FONT_BODY,
                  background: !sourceObsId ? c.sageLt : c.white,
                  border: `1.5px solid ${!sourceObsId ? c.sage : c.line}`,
                  borderRadius: 9, padding: "8px 11px", fontSize: 11.5, color: c.ink, fontWeight: 600,
                }}>✦ Write freely — no specific observation</button>
                {childObs.slice(0, 5).map(o => {
                  const on = sourceObsId === o.id;
                  const pw = o.pathwayId ? pathway(o.pathwayId) : null;
                  return (
                    <button key={o.id} className="tap" onClick={() => setSourceObsId(o.id)} style={{
                      textAlign: "left", cursor: "pointer", fontFamily: FONT_BODY,
                      background: on ? c.sageLt : c.white,
                      border: `1.5px solid ${on ? c.sage : c.line}`,
                      borderRadius: 9, padding: "8px 11px",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                        <span style={{ fontSize: 10, color: c.brownLt }}>
                          {new Date(o.ts).toLocaleDateString(undefined, { day: "numeric", month: "short" })}
                        </span>
                        {pw && <span style={{ fontSize: 11 }}>{pw.icon}</span>}
                      </div>
                      <div style={{ fontSize: 11.5, color: c.ink, lineHeight: 1.4 }}>
                        {(o.text || o.raw || "").slice(0, 90)}{(o.text || o.raw || "").length > 90 ? "…" : ""}
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* Template helper — gentle scaffolding, teacher writes */}
          <div style={{
            background: `linear-gradient(135deg, ${c.blueLt}, ${c.white})`,
            border: `1px solid ${c.blue}66`, borderRadius: 14, padding: 13, marginBottom: 14,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 9, flexWrap: "wrap" }}>
              <span style={{ fontSize: 16 }}>✍️</span>
              <div style={{ flex: 1, minWidth: 140 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: c.brown }}>
                  {k.label} templates
                </div>
                <div style={{ fontSize: 11, color: c.brownLt }}>
                  Tap a section to drop it into your message — edit freely.
                </div>
              </div>
              <button className="tap" onClick={applyAllTemplates} style={{
                background: c.blue, color: c.white, border: "none", borderRadius: 10,
                padding: "7px 12px", fontSize: 11.5, fontWeight: 700,
                cursor: "pointer", fontFamily: FONT_BODY, whiteSpace: "nowrap",
              }}>Use full template</button>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {currentTemplates.map((t, i) => (
                <button key={i} className="tap" onClick={() => insertTemplate(t.text)} style={{
                  background: c.white, color: c.brown, border: `1px solid ${c.blue}66`,
                  borderRadius: 20, padding: "5px 11px", fontSize: 11.5, fontWeight: 600,
                  cursor: "pointer", fontFamily: FONT_BODY,
                }}>＋ {t.label}</button>
              ))}
            </div>
          </div>

          {/* title + body */}
          <FieldLabel>Title</FieldLabel>
          <input value={title} onChange={e => setTitle(e.target.value)}
            placeholder={`e.g. ${k.id === "celebration" ? "A wonderful moment today" : k.id === "home" ? "A little idea to try at home" : "How " + (child?.name?.split(" ")[0] || "your child") + " is growing"}`}
            style={{
              width: "100%", border: `1px solid ${c.line}`, borderRadius: 10, padding: "10px 12px",
              fontSize: 13, fontFamily: FONT_BODY, background: c.white, color: c.ink, outline: "none",
              marginBottom: 12,
            }} />

          <FieldLabel>Message</FieldLabel>
          <textarea value={body} onChange={e => setBody(e.target.value)}
            placeholder="Write the message here — or tap a template above to drop in a starter, then edit freely."
            style={{
              width: "100%", minHeight: 150, resize: "vertical", border: `1px solid ${c.line}`,
              borderRadius: 12, padding: "11px 13px", fontSize: 13, fontFamily: FONT_BODY,
              background: c.white, color: c.ink, outline: "none", lineHeight: 1.6, marginBottom: 16,
            }} />

          <div style={{ display: "flex", gap: 8 }}>
            <button className="tap" onClick={() => save(false)} style={{
              flex: 1, cursor: "pointer", background: c.white, color: c.brown,
              border: `1.5px solid ${c.line}`, borderRadius: 12, padding: "12px",
              fontFamily: FONT_BODY, fontSize: 13, fontWeight: 700,
            }}>Save as draft</button>
            <button className="tap" onClick={() => save(true)} style={{
              flex: 1.3, cursor: "pointer", background: c.sage, color: c.white,
              border: "none", borderRadius: 12, padding: "12px",
              fontFamily: FONT_BODY, fontSize: 13, fontWeight: 700,
            }}>✓ Save &amp; mark shared</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Add Pathway modal ─────────────────────────────────────────── */
function PathwayAddModal({ onClose, onSave }) {
  const [label, setLabel] = useState("");
  const [icon, setIcon] = useState(PATHWAY_ICONS[0]);
  const [color, setColor] = useState(PATHWAY_COLORS[0]);
  const [error, setError] = useState("");

  const save = () => {
    if (!label.trim()) { setError("Please give the pathway a name."); return; }
    if (label.trim().length > 40) { setError("Keep the name under 40 characters."); return; }
    onSave({ label: label.trim(), icon, color });
  };

  return (
    <div className="no-print" style={{
      position: "fixed", inset: 0, zIndex: 95, background: "rgba(74,56,38,0.36)",
      backdropFilter: "blur(3px)", display: "flex", alignItems: "center", justifyContent: "center",
      padding: 16,
    }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="rise" style={{
        background: c.cream, width: "100%", maxWidth: 460, maxHeight: "92vh", overflowY: "auto",
        borderRadius: 20, border: `1px solid ${c.line}`,
        boxShadow: "0 16px 50px rgba(74,56,38,0.3)",
      }}>
        <div style={{
          padding: "16px 20px", borderBottom: `1px solid ${c.line}`,
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 9, background: color + "26",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17,
          }}>{icon}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 16, fontWeight: 700, color: c.brown }}>
              Add a new pathway
            </div>
            <div style={{ fontSize: 11, color: c.brownLt }}>
              Build out your framework — give it a name, icon and colour
            </div>
          </div>
          <button onClick={onClose} className="tap" style={{
            border: `1px solid ${c.line}`, background: c.white, borderRadius: 9, width: 30, height: 30,
            fontSize: 17, color: c.brownLt, cursor: "pointer",
          }}>×</button>
        </div>

        <div style={{ padding: "16px 20px 20px" }}>
          <FieldLabel>Pathway name</FieldLabel>
          <input
            value={label} onChange={(e) => { setLabel(e.target.value); setError(""); }}
            placeholder="e.g. Outdoor Curiosity"
            autoFocus
            style={{
              width: "100%", border: `1px solid ${c.line}`, borderRadius: 10, padding: "10px 12px",
              fontSize: 13, fontFamily: FONT_BODY, background: c.white, color: c.ink, outline: "none",
              marginBottom: 14,
            }}
          />

          <FieldLabel>Icon</FieldLabel>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(36px, 1fr))",
            gap: 5, marginBottom: 14,
            maxHeight: 140, overflowY: "auto",
            background: c.white, border: `1px solid ${c.line}`, borderRadius: 10, padding: 7,
          }}>
            {PATHWAY_ICONS.map((ic) => (
              <button key={ic} className="tap" onClick={() => setIcon(ic)} style={{
                width: 36, height: 36, borderRadius: 8, cursor: "pointer", fontSize: 18,
                background: icon === ic ? color + "33" : "transparent",
                border: `1.5px solid ${icon === ic ? color : "transparent"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>{ic}</button>
            ))}
          </div>

          <FieldLabel>Colour</FieldLabel>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
            {PATHWAY_COLORS.map((co) => (
              <button key={co} className="tap" onClick={() => setColor(co)} title={co} style={{
                width: 32, height: 32, borderRadius: 9, cursor: "pointer",
                background: co,
                border: `2.5px solid ${color === co ? c.brown : "transparent"}`,
                boxShadow: `0 0 0 1px ${c.line}`,
              }} />
            ))}
          </div>

          {/* Preview */}
          <div style={{
            background: color + "1A", border: `1px solid ${color}66`,
            borderRadius: 12, padding: 12, marginBottom: 14,
            display: "flex", alignItems: "center", gap: 11,
          }}>
            <div style={{
              width: 38, height: 38, borderRadius: 11, background: color + "33",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0,
            }}>{icon}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: c.brown, fontFamily: FONT_DISPLAY }}>
                {label.trim() || "Your new pathway"}
              </div>
              <div style={{ fontSize: 10.5, color: c.brownLt, marginTop: 1 }}>
                Preview — this is how it will look across the hub
              </div>
            </div>
          </div>

          {error && (
            <div style={{
              fontSize: 11.5, color: c.terra, background: c.terraLt, borderRadius: 8,
              padding: "7px 10px", marginBottom: 10,
            }}>{error}</div>
          )}

          <div style={{ display: "flex", gap: 8 }}>
            <button className="tap" onClick={onClose} style={{
              flex: 1, background: c.white, color: c.brownLt, border: `1.5px solid ${c.line}`,
              borderRadius: 11, padding: "11px", fontFamily: FONT_BODY, fontSize: 13, fontWeight: 700,
              cursor: "pointer",
            }}>Cancel</button>
            <button className="tap" onClick={save} style={{
              flex: 1.4, background: c.sage, color: c.white, border: "none",
              borderRadius: 11, padding: "11px", fontFamily: FONT_BODY, fontSize: 13, fontWeight: 700,
              cursor: "pointer",
            }}>＋ Add pathway</button>
          </div>
          <div style={{ fontSize: 10.5, color: c.brownLt, marginTop: 9, lineHeight: 1.55 }}>
            Once added you can edit its name and skills, hide it, reorder it, or delete it — all from here.
          </div>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   GROUPS MANAGER
   ════════════════════════════════════════════════════════════════ */
const GROUP_KINDS = [
  { id: "interest",     label: "Interest",     icon: "✨", color: "#F0C572" },
  { id: "intervention", label: "Intervention", icon: "🤝", color: "#C8765A" },
  { id: "friendship",   label: "Friendship",   icon: "💛", color: "#E8B4A0" },
  { id: "learning",     label: "Learning",     icon: "📚", color: "#9BB8CE" },
  { id: "wellbeing",    label: "Wellbeing",    icon: "🌿", color: "#8BA678" },
  { id: "custom",       label: "Custom",       icon: "👥", color: "#A8855F" },
];
const groupKind = (id) => GROUP_KINDS.find(k => k.id === id) || GROUP_KINDS[5];

function GroupsManager({ groups, children, addGroup, updateGroup, removeGroup, toggleChildInGroup, vp }) {
  const [editing, setEditing] = useState(null);     // group object or { new: true }
  const [confirmRemove, setConfirmRemove] = useState(null);
  const [openGroupId, setOpenGroupId] = useState(null);

  return (
    <div>
      <Card style={{
        marginBottom: 14, background: `linear-gradient(135deg, ${c.yellowLt}, ${c.white})`,
        borderColor: c.yellow + "66",
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 11, flexWrap: "wrap" }}>
          <div style={{ fontSize: 24 }}>👥</div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 15, fontWeight: 700, color: c.brown }}>
              Your groups
            </div>
            <div style={{ fontSize: 12, color: c.brownLt, marginTop: 2, lineHeight: 1.55 }}>
              Build flexible groupings for interest-based planning, gentle intervention support,
              friendship work, learning groups or your own custom kinds. A child can be in many groups.
            </div>
          </div>
          <button className="tap" onClick={() => setEditing({ new: true })} style={{
            background: c.sage, color: c.white, border: "none", borderRadius: 11,
            padding: "10px 15px", fontWeight: 700, fontSize: 12.5, cursor: "pointer",
            fontFamily: FONT_BODY, whiteSpace: "nowrap",
          }}>＋ New group</button>
        </div>
      </Card>

      {groups.length === 0 ? (
        <Card style={{ textAlign: "center", padding: 36 }}>
          <div style={{ fontSize: 28, marginBottom: 6 }}>🌱</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: c.brown, fontFamily: FONT_DISPLAY }}>
            No groups yet
          </div>
          <div style={{ fontSize: 12, color: c.brownLt, marginTop: 3, marginBottom: 12 }}>
            Groups make planning, observations and family communication feel more connected to real children.
          </div>
          <button className="tap" onClick={() => setEditing({ new: true })} style={{
            background: c.sage, color: c.white, border: "none", borderRadius: 11,
            padding: "9px 18px", fontWeight: 700, fontSize: 12.5, cursor: "pointer", fontFamily: FONT_BODY,
          }}>＋ Create your first group</button>
        </Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {groups.map(g => {
            const k = groupKind(g.kind);
            const isOpen = openGroupId === g.id;
            const groupColor = g.color || k.color;
            return (
              <Card key={g.id} pad={0} style={{ borderColor: groupColor + "55", overflow: "hidden" }}>
                <div onClick={() => setOpenGroupId(isOpen ? null : g.id)}
                  className="tap" style={{
                  display: "flex", alignItems: "center", gap: 11, padding: "12px 14px",
                  cursor: "pointer",
                }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 10, background: groupColor + "26",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
                  }}>{g.icon || k.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: c.brown, fontFamily: FONT_DISPLAY }}>
                      {g.name}
                    </div>
                    <div style={{ fontSize: 11, color: c.brownLt, marginTop: 1 }}>
                      {k.label} group · {g.childIds.length} {g.childIds.length === 1 ? "child" : "children"}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: -4, paddingRight: 6 }}>
                    {g.childIds.slice(0, 4).map((cid, i) => {
                      const ch = children.find(x => x.id === cid);
                      if (!ch) return null;
                      return (
                        <div key={cid} style={{ marginLeft: i === 0 ? 0 : -8 }}>
                          <Avatar name={ch.name} photo={ch.photo} size={26} />
                        </div>
                      );
                    })}
                    {g.childIds.length > 4 && (
                      <div style={{
                        marginLeft: -8, width: 26, height: 26, borderRadius: "50%",
                        background: c.paper, border: `1.5px solid ${c.line}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 9.5, fontWeight: 700, color: c.brownLt,
                      }}>+{g.childIds.length - 4}</div>
                    )}
                  </div>
                  <span style={{ color: c.brownLt, fontSize: 13, transform: isOpen ? "rotate(180deg)" : "none", transition: "transform .2s" }}>⌄</span>
                </div>

                {isOpen && (
                  <div style={{ padding: "4px 14px 14px", borderTop: `1px solid ${c.line}` }}>
                    {g.note && (
                      <div style={{
                        background: c.cream, borderRadius: 9, padding: "8px 11px",
                        fontSize: 12, color: c.ink, lineHeight: 1.55, marginTop: 11, marginBottom: 11,
                        fontStyle: "italic", borderLeft: `3px solid ${groupColor}`,
                      }}>{g.note}</div>
                    )}
                    <div style={{ fontSize: 11.5, fontWeight: 700, color: c.brown, margin: "10px 0 7px" }}>
                      Members — tap to add or remove
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 11 }}>
                      {children.map(ch => {
                        const on = g.childIds.includes(ch.id);
                        return (
                          <button key={ch.id} className="tap"
                            onClick={() => toggleChildInGroup(g.id, ch.id)} style={{
                            display: "flex", alignItems: "center", gap: 7, cursor: "pointer",
                            padding: "5px 11px 5px 5px", borderRadius: 30, fontFamily: FONT_BODY,
                            background: on ? groupColor : c.white,
                            border: `1.5px solid ${on ? groupColor : c.line}`,
                            color: on ? c.white : c.ink,
                          }}>
                            <Avatar name={ch.name} photo={ch.photo} size={22}
                              color={on ? c.white : c.sage} />
                            <span style={{ fontSize: 11.5, fontWeight: 600 }}>{ch.name.split(" ")[0]}</span>
                          </button>
                        );
                      })}
                    </div>

                    <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                      <button className="tap" onClick={() => setEditing(g)} style={{
                        background: c.white, color: c.brown, border: `1.5px solid ${c.line}`,
                        borderRadius: 9, padding: "7px 13px", fontSize: 11.5, fontWeight: 700,
                        cursor: "pointer", fontFamily: FONT_BODY,
                      }}>✎ Edit group</button>
                      <button className="tap" onClick={() => setConfirmRemove(g)} style={{
                        background: "transparent", color: c.terra, border: `1px solid ${c.terra}55`,
                        borderRadius: 9, padding: "7px 12px", fontSize: 11.5, fontWeight: 700,
                        cursor: "pointer", fontFamily: FONT_BODY,
                      }}>🗑 Delete</button>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {editing && (
        <GroupEditModal
          group={editing.new ? null : editing}
          children={children}
          onClose={() => setEditing(null)}
          onSave={(data) => {
            if (editing.new) addGroup(data);
            else updateGroup(editing.id, data);
            setEditing(null);
          }}
        />
      )}

      {confirmRemove && (
        <ConfirmModal
          title={`Delete the "${confirmRemove.name}" group?`}
          body="Children will stay in your class — only this group is removed. This cannot be undone."
          confirmLabel="Delete group"
          onCancel={() => setConfirmRemove(null)}
          onConfirm={() => { removeGroup(confirmRemove.id); setConfirmRemove(null); }}
        />
      )}
    </div>
  );
}

function GroupEditModal({ group, children, onClose, onSave }) {
  const [name, setName] = useState(group?.name || "");
  const [kind, setKind] = useState(group?.kind || "interest");
  const [icon, setIcon] = useState(group?.icon || groupKind(group?.kind || "interest").icon);
  const [color, setColor] = useState(group?.color || groupKind(group?.kind || "interest").color);
  const [note, setNote] = useState(group?.note || "");
  const [childIds, setChildIds] = useState(group?.childIds || []);
  const [error, setError] = useState("");

  const toggleChild = (id) => setChildIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const k = groupKind(kind);

  const save = () => {
    if (!name.trim()) { setError("Please name the group."); return; }
    onSave({ name: name.trim(), kind, icon, color, note: note.trim(), childIds });
  };

  return (
    <div className="no-print" style={{
      position: "fixed", inset: 0, zIndex: 90, background: "rgba(74,56,38,0.34)",
      backdropFilter: "blur(3px)", display: "flex", alignItems: "center", justifyContent: "center",
      padding: 16,
    }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="rise" style={{
        background: c.cream, width: "100%", maxWidth: 480, maxHeight: "92vh", overflowY: "auto",
        borderRadius: 20, border: `1px solid ${c.line}`, boxShadow: "0 16px 50px rgba(74,56,38,0.3)",
      }}>
        <div style={{
          padding: "16px 20px", borderBottom: `1px solid ${c.line}`,
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 9, background: color + "26",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
          }}>{icon}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 16, fontWeight: 700, color: c.brown }}>
              {group ? "Edit group" : "New group"}
            </div>
            <div style={{ fontSize: 11, color: c.brownLt }}>
              {group ? "Update the group" : "Create a flexible grouping of children"}
            </div>
          </div>
          <button onClick={onClose} className="tap" style={{
            border: `1px solid ${c.line}`, background: c.white, borderRadius: 9, width: 30, height: 30,
            fontSize: 17, color: c.brownLt, cursor: "pointer",
          }}>×</button>
        </div>

        <div style={{ padding: "16px 20px 20px" }}>
          <FieldLabel>Group name</FieldLabel>
          <input
            value={name} onChange={(e) => { setName(e.target.value); setError(""); }}
            placeholder="e.g. Dinosaur explorers, Quiet calm corner, Pencil grip support"
            autoFocus
            style={{
              width: "100%", border: `1px solid ${c.line}`, borderRadius: 10, padding: "10px 12px",
              fontSize: 13, fontFamily: FONT_BODY, background: c.white, color: c.ink, outline: "none",
              marginBottom: 14,
            }}
          />

          <FieldLabel>Group type</FieldLabel>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
            {GROUP_KINDS.map(gk => {
              const on = kind === gk.id;
              return (
                <button key={gk.id} className="tap" onClick={() => {
                  setKind(gk.id);
                  if (!group) { setIcon(gk.icon); setColor(gk.color); }
                }} style={{
                  cursor: "pointer", fontFamily: FONT_BODY, fontSize: 11.5, fontWeight: 600,
                  padding: "6px 11px", borderRadius: 20,
                  background: on ? gk.color : gk.color + "1F",
                  color: on ? c.white : c.ink,
                  border: `1px solid ${gk.color}${on ? "" : "55"}`,
                }}>{gk.icon} {gk.label}</button>
              );
            })}
          </div>

          <FieldLabel>Colour</FieldLabel>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
            {PATHWAY_COLORS.map(co => (
              <button key={co} className="tap" onClick={() => setColor(co)} style={{
                width: 28, height: 28, borderRadius: 9, cursor: "pointer", background: co,
                border: `2.5px solid ${color === co ? c.brown : "transparent"}`,
                boxShadow: `0 0 0 1px ${c.line}`,
              }} />
            ))}
          </div>

          <FieldLabel>Icon</FieldLabel>
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(34px,1fr))",
            gap: 5, marginBottom: 14, maxHeight: 100, overflowY: "auto",
            background: c.white, border: `1px solid ${c.line}`, borderRadius: 10, padding: 7,
          }}>
            {PATHWAY_ICONS.map(ic => (
              <button key={ic} className="tap" onClick={() => setIcon(ic)} style={{
                width: 32, height: 32, borderRadius: 8, cursor: "pointer", fontSize: 17,
                background: icon === ic ? color + "33" : "transparent",
                border: `1.5px solid ${icon === ic ? color : "transparent"}`,
              }}>{ic}</button>
            ))}
          </div>

          <FieldLabel>Members</FieldLabel>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
            {children.map(ch => {
              const on = childIds.includes(ch.id);
              return (
                <button key={ch.id} className="tap" onClick={() => toggleChild(ch.id)} style={{
                  display: "flex", alignItems: "center", gap: 6, cursor: "pointer",
                  padding: "5px 11px 5px 5px", borderRadius: 30, fontFamily: FONT_BODY,
                  background: on ? color : c.white,
                  border: `1.5px solid ${on ? color : c.line}`,
                  color: on ? c.white : c.ink,
                }}>
                  <Avatar name={ch.name} photo={ch.photo} size={22}
                    color={on ? c.white : c.sage} />
                  <span style={{ fontSize: 11.5, fontWeight: 600 }}>{ch.name.split(" ")[0]}</span>
                </button>
              );
            })}
          </div>

          <FieldLabel>Notes <span style={{ color: c.brownLt, fontWeight: 400 }}>— optional</span></FieldLabel>
          <textarea
            value={note} onChange={(e) => setNote(e.target.value)}
            placeholder="What this group is for, gentle context, anything worth remembering…"
            style={{
              width: "100%", minHeight: 64, resize: "vertical", border: `1px solid ${c.line}`,
              borderRadius: 11, padding: "10px 12px", fontSize: 12.5, fontFamily: FONT_BODY,
              background: c.white, color: c.ink, outline: "none", lineHeight: 1.55, marginBottom: 14,
            }}
          />

          {error && (
            <div style={{
              fontSize: 11.5, color: c.terra, background: c.terraLt, borderRadius: 8,
              padding: "7px 10px", marginBottom: 8,
            }}>{error}</div>
          )}

          <div style={{ display: "flex", gap: 8 }}>
            <button className="tap" onClick={onClose} style={{
              flex: 1, background: c.white, color: c.brownLt, border: `1.5px solid ${c.line}`,
              borderRadius: 11, padding: "11px", fontFamily: FONT_BODY, fontSize: 13, fontWeight: 700,
              cursor: "pointer",
            }}>Cancel</button>
            <button className="tap" onClick={save} style={{
              flex: 1.4, background: c.sage, color: c.white, border: "none",
              borderRadius: 11, padding: "11px", fontFamily: FONT_BODY, fontSize: 13, fontWeight: 700,
              cursor: "pointer",
            }}>{group ? "Save group" : "Create group"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   STAGES MANAGER  — fully editable assessment stages
   ════════════════════════════════════════════════════════════════ */
function StagesManager({
  stages, isCustom, applyStagePreset, resetStages,
  updateStage, addStage, removeStage, moveStage, vp,
}) {
  return (
    <div>
      <Card style={{
        marginBottom: 14, background: `linear-gradient(135deg, ${c.blueLt}, ${c.white})`,
        borderColor: c.blue + "66",
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 11, flexWrap: "wrap" }}>
          <div style={{ fontSize: 24 }}>📊</div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 15, fontWeight: 700, color: c.brown }}>
              Assessment stages
            </div>
            <div style={{ fontSize: 12, color: c.brownLt, marginTop: 2, lineHeight: 1.55 }}>
              These are the levels of progress every pathway moves through. Use a preset, or build
              your own language and number of stages. The first stage ("Not yet") is always kept as a default.
            </div>
          </div>
        </div>
      </Card>

      {/* Presets */}
      <Card pad={14} style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 11.5, fontWeight: 700, color: c.brown, marginBottom: 9, letterSpacing: 0.2 }}>
          Quick presets — tap one to swap in
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
          {Object.entries(STAGE_PRESETS).map(([key, preset]) => (
            <button key={key} className="tap" onClick={() => applyStagePreset(key)} style={{
              background: c.white, color: c.brown, border: `1.5px solid ${c.line}`,
              borderRadius: 11, padding: "9px 13px", fontSize: 11.5, fontWeight: 700,
              cursor: "pointer", fontFamily: FONT_BODY,
            }}>{preset.name}</button>
          ))}
        </div>
        {isCustom && (
          <button className="tap" onClick={resetStages} style={{
            marginTop: 10, background: "none", border: "none", color: c.brownLt,
            fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: FONT_BODY,
            textDecoration: "underline", padding: 0,
          }}>↺ Reset to default stages</button>
        )}
      </Card>

      {/* Live preview */}
      <Card pad={14} style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 11.5, fontWeight: 700, color: c.brown, marginBottom: 9 }}>
          How it will look in the assessment grid
        </div>
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          {stages.map(s => (
            <div key={s.key} style={{
              minWidth: 38, height: 38, borderRadius: 9,
              background: s.key > 0 ? s.color : c.cream,
              color: s.key > 0 ? c.white : c.brownLt,
              border: `2px solid ${s.key > 0 ? s.color : c.line}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 800, fontSize: 12, fontFamily: FONT_BODY, padding: "0 8px",
            }}>{s.short}</div>
          ))}
        </div>
      </Card>

      {/* Stage editor list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 11 }}>
        {stages.map((s, idx) => (
          <StageEditorRow key={idx} stage={s} idx={idx} totalStages={stages.length}
            onChange={(patch) => updateStage(idx, patch)}
            onRemove={() => removeStage(idx)}
            onMove={(delta) => moveStage(idx, delta)} />
        ))}
      </div>

      <button className="tap" onClick={addStage} style={{
        width: "100%", background: c.sageLt, color: c.sageDk,
        border: `1.5px dashed ${c.sage}66`, borderRadius: 11,
        padding: "12px", fontSize: 12.5, fontWeight: 700,
        cursor: "pointer", fontFamily: FONT_BODY,
      }}>＋ Add a stage</button>
    </div>
  );
}

function StageEditorRow({ stage, idx, totalStages, onChange, onRemove, onMove }) {
  const isNotYet = idx === 0;
  const [labelDraft, setLabelDraft] = useState(stage.label);
  const [shortDraft, setShortDraft] = useState(stage.short);
  const [descDraft, setDescDraft] = useState(stage.desc);
  // Keep drafts in sync if preset changes externally
  useEffect(() => { setLabelDraft(stage.label); }, [stage.label]);
  useEffect(() => { setShortDraft(stage.short); }, [stage.short]);
  useEffect(() => { setDescDraft(stage.desc); }, [stage.desc]);

  return (
    <Card pad={12} style={{ borderColor: stage.color + "66" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 9, flexWrap: "wrap" }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: isNotYet ? c.cream : stage.color,
          color: isNotYet ? c.brownLt : c.white,
          border: `2px solid ${isNotYet ? c.line : stage.color}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontWeight: 800, fontSize: 13, flexShrink: 0,
        }}>{stage.short}</div>
        <div style={{ flex: 1, minWidth: 140 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: c.brown }}>{stage.label}</div>
          <div style={{ fontSize: 10.5, color: c.brownLt, marginTop: 1 }}>
            {isNotYet ? "Default starting stage — kept for all classes" : `Stage ${idx} of ${totalStages - 1}`}
          </div>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          <button className="tap" onClick={() => onMove(-1)} disabled={idx <= 1} style={{
            background: c.white, border: `1px solid ${c.line}`, borderRadius: 7,
            width: 28, height: 28, fontSize: 11, color: idx <= 1 ? c.line : c.brownLt,
            cursor: idx <= 1 ? "default" : "pointer", fontFamily: FONT_BODY,
          }}>▲</button>
          <button className="tap" onClick={() => onMove(1)} disabled={isNotYet || idx >= totalStages - 1} style={{
            background: c.white, border: `1px solid ${c.line}`, borderRadius: 7,
            width: 28, height: 28, fontSize: 11,
            color: (isNotYet || idx >= totalStages - 1) ? c.line : c.brownLt,
            cursor: (isNotYet || idx >= totalStages - 1) ? "default" : "pointer", fontFamily: FONT_BODY,
          }}>▼</button>
          {!isNotYet && totalStages > 2 && (
            <button className="tap" onClick={onRemove} title="Remove stage" style={{
              background: "transparent", border: `1px solid ${c.terra}55`, borderRadius: 7,
              width: 28, height: 28, fontSize: 12, color: c.terra,
              cursor: "pointer", fontFamily: FONT_BODY,
            }}>🗑</button>
          )}
        </div>
      </div>

      {!isNotYet && (
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 8 }}>
          <div>
            <FieldLabel>Stage name</FieldLabel>
            <input value={labelDraft}
              onChange={(e) => setLabelDraft(e.target.value)}
              onBlur={() => onChange({ label: labelDraft.trim() || stage.label })}
              onKeyDown={(e) => e.key === "Enter" && e.target.blur()}
              style={{
                width: "100%", border: `1px solid ${c.line}`, borderRadius: 9, padding: "8px 10px",
                fontSize: 12.5, fontFamily: FONT_BODY, background: c.cream, color: c.ink, outline: "none",
              }}
            />
          </div>
          <div>
            <FieldLabel>Short tag</FieldLabel>
            <input value={shortDraft} maxLength={3}
              onChange={(e) => setShortDraft(e.target.value)}
              onBlur={() => onChange({ short: shortDraft.trim() || stage.short })}
              onKeyDown={(e) => e.key === "Enter" && e.target.blur()}
              style={{
                width: "100%", border: `1px solid ${c.line}`, borderRadius: 9, padding: "8px 10px",
                fontSize: 12.5, fontFamily: FONT_BODY, background: c.cream, color: c.ink, outline: "none",
                textAlign: "center", fontWeight: 700,
              }}
            />
          </div>
        </div>
      )}
      {!isNotYet && (
        <div style={{ marginTop: 9 }}>
          <FieldLabel>What this stage means</FieldLabel>
          <input value={descDraft}
            onChange={(e) => setDescDraft(e.target.value)}
            onBlur={() => onChange({ desc: descDraft.trim() })}
            placeholder="e.g. Beginning to show this with support."
            style={{
              width: "100%", border: `1px solid ${c.line}`, borderRadius: 9, padding: "8px 10px",
              fontSize: 12, fontFamily: FONT_BODY, background: c.cream, color: c.ink, outline: "none",
            }}
          />
        </div>
      )}
      {!isNotYet && (
        <div style={{ marginTop: 9 }}>
          <FieldLabel>Colour</FieldLabel>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {PATHWAY_COLORS.map(co => (
              <button key={co} className="tap" onClick={() => onChange({ color: co })} style={{
                width: 26, height: 26, borderRadius: 8, cursor: "pointer", background: co,
                border: `2.5px solid ${stage.color === co ? c.brown : "transparent"}`,
                boxShadow: `0 0 0 1px ${c.line}`,
              }} />
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

/* ════════════════════════════════════════════════════════════════
   LOOK & FEEL — themes + density
   ════════════════════════════════════════════════════════════════ */
function LookAndFeel({ theme, setTheme, density, setDensity, vp }) {
  return (
    <div>
      <Card style={{
        marginBottom: 14, background: `linear-gradient(135deg, ${c.terraLt}, ${c.white})`,
        borderColor: c.terra + "44",
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 11, flexWrap: "wrap" }}>
          <div style={{ fontSize: 24 }}>🎨</div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 15, fontWeight: 700, color: c.brown }}>
              Make it yours
            </div>
            <div style={{ fontSize: 12, color: c.brownLt, marginTop: 2, lineHeight: 1.55 }}>
              Choose a calming palette for your classroom and a comfortable layout density.
              Both apply instantly and remember themselves next time you sign in.
            </div>
          </div>
        </div>
      </Card>

      <Card pad={14} style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: c.brown, marginBottom: 9 }}>
          Theme
        </div>
        <div style={{
          display: "grid",
          gridTemplateColumns: vp.isPhone ? "1fr 1fr" : vp.isCompact ? "1fr 1fr 1fr" : "repeat(3, 1fr)",
          gap: 9,
        }}>
          {Object.entries(THEMES).map(([key, t]) => {
            const on = theme === key;
            return (
              <button key={key} className="tap" onClick={() => setTheme(key)} style={{
                cursor: "pointer", border: `2px solid ${on ? t.sage : c.line}`,
                borderRadius: 14, padding: 11, background: t.cream,
                fontFamily: FONT_BODY, textAlign: "left",
                boxShadow: on ? `0 4px 14px ${t.sage}33` : "none",
                transition: "all .2s",
              }}>
                {/* swatch row */}
                <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
                  {[t.sage, t.terra, t.yellow, t.blue, t.brown].map((col, i) => (
                    <div key={i} style={{
                      flex: 1, height: 22, borderRadius: 5, background: col,
                      border: `1px solid ${t.line}`,
                    }} />
                  ))}
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: t.brown }}>
                  {t.name}{on && <span style={{ marginLeft: 6, fontSize: 10, color: t.sage }}>✓ active</span>}
                </div>
                <div style={{ fontSize: 10.5, color: t.brownLt, marginTop: 1 }}>{t.desc}</div>
              </button>
            );
          })}
        </div>
      </Card>

      <Card pad={14} style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: c.brown, marginBottom: 9 }}>
          Layout density
        </div>
        <div style={{ display: "flex", gap: 7 }}>
          {Object.entries(DENSITY).map(([key, d]) => {
            const on = density === key;
            return (
              <button key={key} className="tap" onClick={() => setDensity(key)} style={{
                flex: 1, cursor: "pointer", fontFamily: FONT_BODY,
                background: on ? c.sage : c.white, color: on ? c.white : c.brown,
                border: `1.5px solid ${on ? c.sage : c.line}`, borderRadius: 11,
                padding: "11px 8px", fontSize: 12.5, fontWeight: 700,
              }}>{d.name}</button>
            );
          })}
        </div>
        <div style={{ fontSize: 11, color: c.brownLt, marginTop: 7, lineHeight: 1.5 }}>
          {density === "large"
            ? "Larger tap targets and roomier spacing — great when teaching with the device in your hand."
            : density === "compact"
            ? "More content visible at once — best on laptops."
            : "Balanced spacing for everyday classroom use."}
        </div>
      </Card>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   WELLBEING TOOLKIT  — class energy + sensory breaks + calm corner
   Self-contained, uses its own storage keys
   ════════════════════════════════════════════════════════════════ */
function WellbeingToolkit() {
  const today = new Date().toISOString().slice(0, 10);
  const [energy, setEnergy] = useState(2); // 0..4
  const [sensoryDone, setSensoryDone] = useState([]);
  const [calmNote, setCalmNote] = useState("");
  const [transitionSupports, setTransitionSupports] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const [e, s, n, t] = await Promise.all([
        store.get("bba_wb_energy_" + today, 2),
        store.get("bba_wb_sensory_" + today, []),
        store.get("bba_wb_calmNote", ""),
        store.get("bba_wb_transitions", [
          "Soft chime instead of a clap",
          "Five-minute warning before tidy-up",
          "Sing the same gentle transition song",
        ]),
      ]);
      setEnergy(e); setSensoryDone(s); setCalmNote(n); setTransitionSupports(t);
      setLoaded(true);
    })();
  }, []);
  useEffect(() => { if (loaded) store.set("bba_wb_energy_" + today, energy); }, [energy, loaded]);
  useEffect(() => { if (loaded) store.set("bba_wb_sensory_" + today, sensoryDone); }, [sensoryDone, loaded]);
  useEffect(() => { if (loaded) store.set("bba_wb_calmNote", calmNote); }, [calmNote, loaded]);
  useEffect(() => { if (loaded) store.set("bba_wb_transitions", transitionSupports); }, [transitionSupports, loaded]);

  const SENSORY_BREAKS = [
    { id: "stretch",   icon: "🌿", label: "Soft body stretch" },
    { id: "breath",    icon: "🌬️", label: "Three slow breaths together" },
    { id: "wall",      icon: "🤲", label: "Wall pushes (heavy work)" },
    { id: "song",      icon: "🎵", label: "Quiet song with hand actions" },
    { id: "water",     icon: "💧", label: "Water at the basin" },
    { id: "shake",     icon: "✨", label: "Shake-it-off wiggle break" },
    { id: "sit",       icon: "🌳", label: "Sit on the grass for 2 minutes" },
    { id: "story",     icon: "📖", label: "One soft picture book together" },
  ];

  const toggleSensory = (id) =>
    setSensoryDone(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const addTransition = (text) => {
    if (!text.trim()) return;
    setTransitionSupports(prev => [...prev, text.trim()]);
  };
  const removeTransition = (idx) =>
    setTransitionSupports(prev => prev.filter((_, i) => i !== idx));

  const energyLabels = ["Very still", "Quiet", "Steady", "Lively", "Bouncing off the walls"];
  const energyColors = [c.blue, c.sage, c.yellow, c.terra, c.terra];

  return (
    <Card style={{
      background: `linear-gradient(180deg, ${c.sageLt}66, ${c.white})`,
      borderColor: c.sage + "55",
    }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 4 }}>
        <h2 style={{ margin: 0, fontFamily: FONT_DISPLAY, fontSize: 17, color: c.brown, fontWeight: 700 }}>
          🌿 Wellbeing toolkit
        </h2>
      </div>
      <div style={{ fontSize: 12, color: c.brownLt, marginBottom: 12, lineHeight: 1.55 }}>
        Tools for the rhythm of your day — for the room and for you.
      </div>

      {/* Class energy meter */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 11.5, fontWeight: 700, color: c.brown, marginBottom: 6 }}>
          Class energy right now
        </div>
        <div style={{
          background: c.white, border: `1px solid ${c.line}`, borderRadius: 11, padding: "10px 12px",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 7 }}>
            <span style={{ fontSize: 18 }}>
              {energy <= 1 ? "💤" : energy === 2 ? "🌿" : energy === 3 ? "🎈" : "⚡"}
            </span>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: energyColors[energy] }}>
              {energyLabels[energy]}
            </span>
          </div>
          <input
            type="range" min={0} max={4} value={energy}
            onChange={(e) => setEnergy(+e.target.value)}
            style={{ width: "100%", accentColor: energyColors[energy] }}
          />
          {(energy === 0 || energy >= 3) && (
            <div style={{
              marginTop: 8, fontSize: 11, color: c.brown, background: c.cream,
              borderRadius: 8, padding: "7px 10px", lineHeight: 1.5,
              border: `1px solid ${c.line}`,
            }}>
              {energy === 0 && "💤 Children look low. A gentle wake-up song, a snack, or fresh air might lift the room."}
              {energy === 3 && "🎈 Lots of bright energy. A wall-push or breath break before the next focused activity will help."}
              {energy === 4 && "⚡ Over-stimulation can build up here. A sensory break and softer voices help bring the room down gently."}
            </div>
          )}
        </div>
      </div>

      {/* Sensory breaks */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 6 }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: c.brown }}>
            Sensory breaks · {sensoryDone.length} used today
          </div>
          {sensoryDone.length > 0 && (
            <button onClick={() => setSensoryDone([])} className="tap" style={{
              background: "none", border: "none", color: c.brownLt, fontSize: 10.5,
              fontWeight: 700, cursor: "pointer", fontFamily: FONT_BODY, textDecoration: "underline",
            }}>Reset</button>
          )}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {SENSORY_BREAKS.map(b => {
            const on = sensoryDone.includes(b.id);
            return (
              <button key={b.id} className="tap" onClick={() => toggleSensory(b.id)} style={{
                display: "flex", alignItems: "center", gap: 6, cursor: "pointer",
                background: on ? c.sage : c.white,
                color: on ? c.white : c.ink,
                border: `1.5px solid ${on ? c.sage : c.line}`,
                borderRadius: 20, padding: "5px 10px",
                fontSize: 11.5, fontWeight: 600, fontFamily: FONT_BODY,
                opacity: on ? 0.85 : 1,
                textDecoration: on ? "line-through" : "none",
              }}>
                <span>{b.icon}</span> {b.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Calm corner note */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 11.5, fontWeight: 700, color: c.brown, marginBottom: 6 }}>
          Calm corner notes
        </div>
        <textarea
          value={calmNote} onChange={(e) => setCalmNote(e.target.value)}
          placeholder="Anything to remember about the calm corner — who used it today, what helped, what to refill, gentle observations…"
          style={{
            width: "100%", minHeight: 60, resize: "vertical", border: `1px solid ${c.line}`,
            borderRadius: 11, padding: "10px 12px", fontSize: 12, fontFamily: FONT_BODY,
            background: c.white, color: c.ink, outline: "none", lineHeight: 1.55,
          }}
        />
      </div>

      {/* Transition supports */}
      <div>
        <div style={{ fontSize: 11.5, fontWeight: 700, color: c.brown, marginBottom: 6 }}>
          Transition supports
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 7 }}>
          {transitionSupports.map((t, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 8,
              background: c.paper, borderRadius: 9, padding: "7px 10px",
            }}>
              <span style={{ fontSize: 11.5, color: c.ink, flex: 1, lineHeight: 1.45 }}>{t}</span>
              <button onClick={() => removeTransition(i)} className="tap" style={{
                border: "none", background: "none", cursor: "pointer",
                color: c.brownLt, fontSize: 15, lineHeight: 1, padding: "0 4px",
              }}>×</button>
            </div>
          ))}
        </div>
        <TransitionAdder onAdd={addTransition} />
      </div>
    </Card>
  );
}

function TransitionAdder({ onAdd }) {
  const [text, setText] = useState("");
  const submit = () => {
    if (!text.trim()) return;
    onAdd(text);
    setText("");
  };
  return (
    <div style={{ display: "flex", gap: 6 }}>
      <input
        value={text} onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        placeholder="Add a support that works for your class…"
        style={{
          flex: 1, border: `1px solid ${c.line}`, borderRadius: 9, padding: "8px 10px",
          fontSize: 12, fontFamily: FONT_BODY, background: c.white, color: c.ink, outline: "none",
        }}
      />
      <button className="tap" onClick={submit} style={{
        border: "none", background: c.sage, color: c.white, borderRadius: 9,
        padding: "0 14px", fontSize: 16, cursor: "pointer", fontWeight: 700,
      }}>＋</button>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   LESSON PLANS — structured, date-stamped, editable, exportable
   Template modelled on early-years learning-experience plans
   ════════════════════════════════════════════════════════════════ */

/* ─── Lesson planning libraries — tap-to-insert content ─────────────
   Teachers can build a plan from proven options instead of a blank page.
   Everything inserted stays fully editable afterwards. ──────────────── */

/* IB PYP key concepts — the eight that drive inquiry */
const PYP_KEY_CONCEPTS = [
  { label: "Form",         text: "What is it like? Children notice features, parts and qualities." },
  { label: "Function",     text: "How does it work? Children explore how things behave and are used." },
  { label: "Causation",    text: "Why is it the way it is? Children wonder about reasons and consequences." },
  { label: "Change",       text: "How is it changing? Children notice growth, transformation and movement." },
  { label: "Connection",   text: "How is it linked to other things? Children find relationships and patterns." },
  { label: "Perspective",  text: "What are the points of view? Children hear different ideas and feelings." },
  { label: "Responsibility", text: "What is our role? Children explore care, choices and looking after things." },
  { label: "Reflection",   text: "How do we know? Children think back on what and how they learned." },
];

/* Reggio-inspired guiding ideas */
const REGGIO_CONCEPTS = [
  { label: "The hundred languages", text: "Children express ideas in many ways — drawing, building, movement, clay, role-play." },
  { label: "The environment as teacher", text: "The space, light and materials are arranged to invite curiosity and independence." },
  { label: "The image of the child", text: "Children are capable, curious and full of potential — the plan follows their lead." },
  { label: "Documentation", text: "Children's words, marks and creations are gathered to make learning visible." },
  { label: "Relationships", text: "Learning grows through connection — with peers, adults, family and the wider world." },
];

/* Curriculum-area approach options */
const APPROACH_OPTIONS = [
  { id: "pyp",    label: "IB PYP inquiry", icon: "🌍", concepts: PYP_KEY_CONCEPTS },
  { id: "reggio", label: "Reggio Emilia",  icon: "🎨", concepts: REGGIO_CONCEPTS },
  { id: "eyfs",   label: "Play-based / EYFS", icon: "🧸", concepts: [
    { label: "Playing & exploring", text: "Children investigate, experience and 'have a go'." },
    { label: "Active learning", text: "Children concentrate, persevere and enjoy achievements." },
    { label: "Creating & thinking critically", text: "Children have their own ideas, make links and choose ways to do things." },
  ]},
  { id: "montessori", label: "Montessori", icon: "🪵", concepts: [
    { label: "Prepared environment", text: "Ordered, beautiful materials are within the child's reach to choose freely." },
    { label: "The absorbent mind", text: "Young children take in learning effortlessly through their senses and movement." },
    { label: "Independence", text: "The child is supported to 'help me do it myself'." },
  ]},
];

/* Ready-made learning intentions, grouped by area */
const INTENTION_LIBRARY = {
  "Communication & language": [
    "Listen to and join in with stories, songs and rhymes",
    "Use new vocabulary through the day in different contexts",
    "Speak in longer sentences to share ideas and feelings",
    "Ask and answer questions to extend understanding",
  ],
  "Early literacy": [
    "Notice, name and describe shapes, marks and letters in everyday life",
    "Handle books with care and talk about what is happening",
    "Make marks with meaning and talk about them",
    "Hear and say the initial sounds in familiar words",
  ],
  "Early maths": [
    "Notice, name and describe basic shapes in the classroom and daily life",
    "Count objects with one number for each item",
    "Compare quantities using more, fewer and the same",
    "Recognise and continue simple patterns",
  ],
  "Physical & fine motor": [
    "Strengthen fine motor skills through squeezing, threading and gluing",
    "Move with control and coordination in different ways",
    "Use one-handed tools such as scissors and tweezers with growing skill",
    "Show increasing control when holding a pencil or brush",
  ],
  "Personal, social & emotional": [
    "Use speaking, questioning and peer collaboration to deepen learning",
    "Take turns and share resources with growing independence",
    "Name and talk about feelings in themselves and others",
    "Show care and kindness towards friends and the environment",
  ],
  "Understanding the world": [
    "Explore and notice changes in the natural world",
    "Talk about people and roles in their community",
    "Use senses to investigate materials and living things",
    "Make simple predictions and observations",
  ],
};

/* Lesson-flow templates — whole structures teachers can drop in */
const FLOW_TEMPLATES = {
  "Inquiry session": [
    { title: "Tuning in", minutes: "10", grouping: "Whole group", notes: "Spark curiosity — a provocation, story, mystery object or question. Listen to what children already know and wonder." },
    { title: "Finding out", minutes: "15", grouping: "Small groups", notes: "Hands-on exploration of materials. Teacher observes, asks open questions and documents children's thinking." },
    { title: "Sorting out", minutes: "15", grouping: "Small groups", notes: "Children represent what they've discovered — drawing, building, talking. Make the learning visible." },
    { title: "Reflecting", minutes: "10", grouping: "Whole group", notes: "Come together to share. 'What did you notice? What are you still wondering?'" },
  ],
  "Station rotations": [
    { title: "Tuning in", minutes: "10", grouping: "Whole group", notes: "Introduce the focus with a song, movement game or mystery bag. Explain the stations simply." },
    { title: "Station 1", minutes: "8", grouping: "Small group", notes: "Materials:\nActivity:\nPrompts:" },
    { title: "Station 2", minutes: "8", grouping: "Small group", notes: "Materials:\nActivity:\nPrompts:" },
    { title: "Station 3", minutes: "8", grouping: "Small group", notes: "Materials:\nActivity:\nPrompts:" },
    { title: "Station 4", minutes: "8", grouping: "Small group", notes: "Materials:\nActivity:\nPrompts:" },
    { title: "Reflection circle", minutes: "10", grouping: "Whole group", notes: "Each child shares one thing they made or discovered." },
  ],
  "Provocation & free flow": [
    { title: "Gentle welcome", minutes: "10", grouping: "Whole group", notes: "Settle the room, share the provocation set out for today." },
    { title: "Free-flow exploration", minutes: "30", grouping: "Child-led", notes: "Children move freely between invitations to play. Adults observe, scaffold and capture observations." },
    { title: "Coming together", minutes: "10", grouping: "Whole group", notes: "Reflect on discoveries, celebrate ideas, tidy together." },
  ],
  "Adult-led focus": [
    { title: "Warm-up", minutes: "5", grouping: "Whole group", notes: "Short, playful hook linked to the learning intention." },
    { title: "Teach & model", minutes: "10", grouping: "Whole group", notes: "Demonstrate clearly, thinking aloud. Keep it short and visual." },
    { title: "Guided practice", minutes: "20", grouping: "Small groups", notes: "Children try it with support. Teacher works with a focus group." },
    { title: "Review", minutes: "10", grouping: "Whole group", notes: "Share work, celebrate effort, note next steps." },
  ],
};

/* Common grouping options for flow sections */
const GROUPING_OPTIONS = [
  "Whole group", "Small groups", "Pairs", "Stations",
  "Child-led", "Adult-led", "1:1 support", "Outdoor",
];

/* Ready-made differentiation ideas */
const SUPPORT_IDEAS = [
  "Big, bold outlines and jumbo materials for easier handling",
  "Hand-over-hand support and modelling alongside the child",
  "Fewer steps, with clear visual prompts at each one",
  "Extra time and a calm, low-distraction space",
  "A trusted peer or adult close by for reassurance",
  "Pre-teach key vocabulary with real objects",
];
const CHALLENGE_IDEAS = [
  "Open-ended prompts that invite children to invent and combine ideas",
  "Encourage children to explain their thinking to a friend",
  "Add a fine-motor or problem-solving twist for extra stretch",
  "Invite children to lead or teach part of the activity",
  "Offer a related question to investigate independently",
  "Introduce richer vocabulary and encourage its use",
];
const RESOURCE_IDEAS = [
  "Playdough, easy-grip cutters and stampers",
  "Laminated mats and dry-erase markers",
  "Collage paper, glue sticks and a large shared sheet",
  "Sensory tray with sand, rice or salt",
  "Loose parts — buttons, pebbles, shells, corks",
  "Books linked to the topic for the reading corner",
  "Outdoor materials — sticks, leaves, chalk, water",
];

/* A fresh blank lesson with the standard early-years structure */
const blankLesson = () => ({
  title: "",
  date: new Date().toISOString().slice(0, 10),
  unit: "",
  author: "",
  subject: "",
  duration: "",
  approach: "",                // chosen framework (pyp / reggio / eyfs / montessori / "")
  intentions: [""],            // learning intentions
  keyConcepts: [                // form / connection / function style
    { id: "kc1", label: "Form", text: "" },
    { id: "kc2", label: "Connection", text: "" },
    { id: "kc3", label: "Function", text: "" },
  ],
  flow: [                       // lesson flow sections
    { id: "f1", title: "Tuning in", minutes: "10", grouping: "Whole group", notes: "" },
    { id: "f2", title: "Main activity", minutes: "20", grouping: "Small groups", notes: "" },
    { id: "f3", title: "Reflection & closure", minutes: "10", grouping: "Whole group", notes: "" },
  ],
  support: [""],                // differentiation — support
  challenge: [""],              // differentiation — challenge
  resources: [""],              // tools & resources
  pathwayIds: [],               // linked development pathways
  childIds: [],                 // focus children
  evidence: [],                 // [{ id, name, dataUrl, kind }]
  reflection: "",               // post-lesson reflection
});

function LessonPlans({
  lessons, children, pathways,
  addLesson, updateLesson, removeLesson, duplicateLesson,
  lessonTemplates, saveAsTemplate, removeTemplate, renameTemplate, vp,
}) {
  const [editingId, setEditingId] = useState(null);   // lesson id, "new", or null
  const [confirmRemove, setConfirmRemove] = useState(null);
  const [startFromTemplate, setStartFromTemplate] = useState(null); // template structure to seed a new lesson
  const [showTemplates, setShowTemplates] = useState(false);
  const [confirmRemoveTemplate, setConfirmRemoveTemplate] = useState(null);

  const fmtDate = (d) => {
    if (!d) return "";
    try {
      return new Date(d + "T00:00:00").toLocaleDateString(undefined,
        { weekday: "short", day: "numeric", month: "short", year: "numeric" });
    } catch { return d; }
  };

  /* ---- editing view ---- */
  if (editingId) {
    const existing = editingId === "new" ? null : lessons.find(l => l.id === editingId);
    /* When starting from a template, seed a fresh lesson with today's date */
    const seed = (editingId === "new" && startFromTemplate)
      ? {
          ...startFromTemplate,
          date: new Date().toISOString().slice(0, 10),
          evidence: [], childIds: [], reflection: "",
        }
      : existing;
    return (
      <LessonEditor
        lesson={seed}
        forceNew={editingId === "new"}
        children={children} pathways={pathways}
        onClose={() => { setEditingId(null); setStartFromTemplate(null); }}
        onSave={(data) => {
          if (editingId === "new") addLesson(data);
          else updateLesson(editingId, data);
          setEditingId(null); setStartFromTemplate(null);
        }}
        onSaveAsTemplate={saveAsTemplate}
        vp={vp}
      />
    );
  }

  /* ---- list view ---- */
  const sorted = [...lessons].sort((a, b) => (b.created || 0) - (a.created || 0));

  return (
    <div>
      <Card style={{
        marginBottom: 14, background: `linear-gradient(135deg, ${c.sageLt}, ${c.white})`,
        borderColor: c.sage + "55",
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 11, flexWrap: "wrap" }}>
          <div style={{ fontSize: 24 }}>📋</div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 15, fontWeight: 700, color: c.brown }}>
              Lesson plans
            </div>
            <div style={{ fontSize: 12, color: c.brownLt, marginTop: 2, lineHeight: 1.55 }}>
              A calm, structured template for play-based learning experiences. Every plan is
              date-stamped, fully editable, holds photo evidence, and exports as a professional
              printable document.
            </div>
          </div>
          <button className="tap" onClick={() => setEditingId("new")} style={{
            background: c.sage, color: c.white, border: "none", borderRadius: 11,
            padding: "10px 15px", fontWeight: 700, fontSize: 12.5, cursor: "pointer",
            fontFamily: FONT_BODY, whiteSpace: "nowrap",
          }}>＋ New lesson plan</button>
        </div>
        <div style={{ display: "flex", gap: 7, marginTop: 11, flexWrap: "wrap" }}>
          <button className="tap" onClick={() => exportLesson(blankLesson(), children, true)} style={{
            background: c.white, color: c.brown, border: `1.5px solid ${c.line}`,
            borderRadius: 9, padding: "8px 13px", fontSize: 11.5, fontWeight: 700,
            cursor: "pointer", fontFamily: FONT_BODY,
          }}>⤓ Download blank template</button>
          <span style={{ fontSize: 10.5, color: c.brownLt, alignSelf: "center", lineHeight: 1.4 }}>
            Prefer paper? Print an empty template and fill it in by hand.
          </span>
        </div>
      </Card>

      {/* ---- Saved templates — reusable plan structures ---- */}
      <Card pad={0} style={{ marginBottom: 14, overflow: "hidden" }}>
        <button className="tap" onClick={() => setShowTemplates(!showTemplates)} style={{
          display: "flex", alignItems: "center", gap: 9, width: "100%",
          background: "transparent", border: "none", cursor: "pointer",
          padding: "13px 15px", fontFamily: FONT_BODY, textAlign: "left",
        }}>
          <span style={{ fontSize: 16 }}>⭐</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 14, fontWeight: 700, color: c.brown }}>
              My saved templates
            </div>
            <div style={{ fontSize: 10.5, color: c.brownLt, marginTop: 1 }}>
              {lessonTemplates.length === 0
                ? "Save any lesson's structure to reuse it in one tap"
                : `${lessonTemplates.length} reusable structure${lessonTemplates.length === 1 ? "" : "s"}`}
            </div>
          </div>
          <span style={{
            fontSize: 12, color: c.brownLt, fontWeight: 700,
            transform: showTemplates ? "rotate(180deg)" : "none", transition: "transform .2s",
          }}>⌄</span>
        </button>
        {showTemplates && (
          <div style={{ padding: "2px 15px 15px", borderTop: `1px solid ${c.line}` }}>
            {lessonTemplates.length === 0 ? (
              <div style={{ fontSize: 11.5, color: c.brownLt, lineHeight: 1.6, paddingTop: 10 }}>
                When you've built a lesson you'd happily teach again — a circle-time routine,
                a station rotation, a weekly maths structure — open it and tap
                <b style={{ color: c.brown }}> "Save as template"</b>. It'll appear here, ready
                to start a fresh plan from in one tap.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingTop: 10 }}>
                {lessonTemplates.map(t => (
                  <div key={t.id} style={{
                    display: "flex", alignItems: "center", gap: 9,
                    background: c.cream, border: `1px solid ${c.line}`,
                    borderRadius: 10, padding: "9px 11px",
                  }}>
                    <span style={{ fontSize: 15 }}>⭐</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 700, color: c.brown }}>{t.name}</div>
                      <div style={{ fontSize: 10, color: c.brownLt }}>
                        {(t.structure?.flow?.length || 0)} flow section{(t.structure?.flow?.length || 0) === 1 ? "" : "s"}
                        {t.structure?.approach ? " · " + t.structure.approach + " style" : ""}
                      </div>
                    </div>
                    <button className="tap" onClick={() => {
                      setStartFromTemplate(t.structure);
                      setEditingId("new");
                    }} style={{
                      background: c.sage, color: c.white, border: "none", borderRadius: 8,
                      padding: "7px 12px", fontSize: 11, fontWeight: 700,
                      cursor: "pointer", fontFamily: FONT_BODY, whiteSpace: "nowrap",
                    }}>Use</button>
                    <button className="tap" onClick={() => {
                      const name = prompt("Rename template:", t.name);
                      if (name && name.trim()) renameTemplate(t.id, name.trim());
                    }} style={{
                      background: c.white, color: c.brownLt, border: `1px solid ${c.line}`,
                      borderRadius: 8, width: 30, height: 30, fontSize: 12,
                      cursor: "pointer", fontFamily: FONT_BODY,
                    }}>✎</button>
                    <button className="tap" onClick={() => setConfirmRemoveTemplate(t)} style={{
                      background: "transparent", color: c.terra, border: `1px solid ${c.terra}55`,
                      borderRadius: 8, width: 30, height: 30, fontSize: 12,
                      cursor: "pointer", fontFamily: FONT_BODY,
                    }}>🗑</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Card>

      {sorted.length === 0 ? (
        <Card style={{ textAlign: "center", padding: 40 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>📋</div>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 16, color: c.brown, fontWeight: 700 }}>
            No lesson plans yet
          </div>
          <div style={{ fontSize: 12.5, color: c.brownLt, marginTop: 4, marginBottom: 14 }}>
            Create your first one — the template guides you through learning intentions,
            lesson flow, differentiation and resources.
          </div>
          <button className="tap" onClick={() => setEditingId("new")} style={{
            background: c.sage, color: c.white, border: "none", borderRadius: 11,
            padding: "10px 20px", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: FONT_BODY,
          }}>＋ Create your first lesson plan</button>
        </Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
          {sorted.map(l => {
            const pwTags = (l.pathwayIds || []).map(id => pathway(id)).filter(Boolean);
            return (
              <Card key={l.id} pad={0} style={{ overflow: "hidden" }}>
                <div style={{ padding: "13px 15px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <div style={{
                      width: 42, height: 42, borderRadius: 11, background: c.sage + "22",
                      display: "flex", flexDirection: "column", alignItems: "center",
                      justifyContent: "center", flexShrink: 0, lineHeight: 1,
                    }}>
                      <span style={{ fontSize: 9, fontWeight: 700, color: c.sageDk, textTransform: "uppercase" }}>
                        {l.date ? new Date(l.date + "T00:00:00").toLocaleDateString(undefined, { month: "short" }) : "—"}
                      </span>
                      <span style={{ fontSize: 17, fontWeight: 800, color: c.brown, fontFamily: FONT_DISPLAY }}>
                        {l.date ? new Date(l.date + "T00:00:00").getDate() : "?"}
                      </span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14.5, fontWeight: 700, color: c.brown, fontFamily: FONT_DISPLAY }}>
                        {l.title || "Untitled lesson plan"}
                      </div>
                      <div style={{ fontSize: 11, color: c.brownLt, marginTop: 2 }}>
                        {fmtDate(l.date)}
                        {l.subject ? " · " + l.subject : ""}
                        {l.duration ? " · " + l.duration : ""}
                      </div>
                      {pwTags.length > 0 && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 7 }}>
                          {pwTags.map(p => (
                            <span key={p.id} style={{
                              fontSize: 10, fontWeight: 600, color: c.ink,
                              background: p.color + "22", border: `1px solid ${p.color}55`,
                              borderRadius: 20, padding: "2px 8px",
                            }}>{p.icon} {p.label}</span>
                          ))}
                        </div>
                      )}
                      {(l.evidence || []).length > 0 && (
                        <div style={{ fontSize: 10.5, color: c.sageDk, marginTop: 6, fontWeight: 600 }}>
                          📎 {l.evidence.length} piece{l.evidence.length === 1 ? "" : "s"} of evidence attached
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div style={{
                  display: "flex", gap: 6, padding: "9px 15px",
                  borderTop: `1px solid ${c.line}`, background: c.cream, flexWrap: "wrap",
                }}>
                  <button className="tap" onClick={() => setEditingId(l.id)} style={{
                    background: c.white, color: c.brown, border: `1.5px solid ${c.line}`,
                    borderRadius: 9, padding: "7px 13px", fontSize: 11.5, fontWeight: 700,
                    cursor: "pointer", fontFamily: FONT_BODY,
                  }}>✎ Open & edit</button>
                  <button className="tap" onClick={() => exportLesson(l, children)} style={{
                    background: c.white, color: c.sageDk, border: `1.5px solid ${c.line}`,
                    borderRadius: 9, padding: "7px 13px", fontSize: 11.5, fontWeight: 700,
                    cursor: "pointer", fontFamily: FONT_BODY,
                  }}>⤓ Export / print</button>
                  <button className="tap" onClick={() => duplicateLesson(l.id)} style={{
                    background: c.white, color: c.brown, border: `1.5px solid ${c.line}`,
                    borderRadius: 9, padding: "7px 13px", fontSize: 11.5, fontWeight: 700,
                    cursor: "pointer", fontFamily: FONT_BODY,
                  }}>⎘ Duplicate</button>
                  <div style={{ flex: 1 }} />
                  <button className="tap" onClick={() => setConfirmRemove(l)} style={{
                    background: "transparent", color: c.terra, border: `1px solid ${c.terra}55`,
                    borderRadius: 9, padding: "7px 12px", fontSize: 11.5, fontWeight: 700,
                    cursor: "pointer", fontFamily: FONT_BODY,
                  }}>Delete</button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {confirmRemove && (
        <ConfirmModal
          title={`Delete "${confirmRemove.title || "this lesson plan"}"?`}
          body="This permanently removes the lesson plan and any evidence attached to it. This cannot be undone."
          confirmLabel="Delete lesson plan"
          onCancel={() => setConfirmRemove(null)}
          onConfirm={() => { removeLesson(confirmRemove.id); setConfirmRemove(null); }}
        />
      )}

      {confirmRemoveTemplate && (
        <ConfirmModal
          title={`Delete the "${confirmRemoveTemplate.name}" template?`}
          body="This removes the saved structure. Lesson plans already created from it are not affected."
          confirmLabel="Delete template"
          onCancel={() => setConfirmRemoveTemplate(null)}
          onConfirm={() => { removeTemplate(confirmRemoveTemplate.id); setConfirmRemoveTemplate(null); }}
        />
      )}
    </div>
  );
}

/* ─── InsertPicker — a calm, collapsible "tap to insert" panel ───── */
function InsertPicker({ label, icon, items, onPick, accent }) {
  const [open, setOpen] = useState(false);
  const tone = accent || c.sage;
  return (
    <div style={{ marginBottom: 10 }}>
      <button className="tap" onClick={() => setOpen(!open)} style={{
        display: "flex", alignItems: "center", gap: 7, width: "100%",
        background: open ? tone + "1A" : c.cream,
        border: `1.5px dashed ${tone}77`, borderRadius: 10,
        padding: "9px 12px", cursor: "pointer", fontFamily: FONT_BODY,
      }}>
        <span style={{ fontSize: 14 }}>{icon || "💡"}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: c.brown, flex: 1, textAlign: "left" }}>
          {label}
        </span>
        <span style={{
          fontSize: 11, color: tone, fontWeight: 700,
          transform: open ? "rotate(180deg)" : "none", transition: "transform .2s",
        }}>⌄</span>
      </button>
      {open && (
        <div style={{
          display: "flex", flexWrap: "wrap", gap: 6, padding: "10px 4px 2px",
        }}>
          {items.map((it, i) => (
            <button key={i} className="tap"
              onClick={() => onPick(it)}
              style={{
                background: c.white, color: c.ink, cursor: "pointer",
                border: `1px solid ${tone}66`, borderRadius: 9,
                padding: "7px 11px", fontSize: 11.5, fontWeight: 600,
                fontFamily: FONT_BODY, textAlign: "left", lineHeight: 1.4,
                maxWidth: "100%",
              }}>
              <span style={{ color: tone, fontWeight: 800, marginRight: 4 }}>＋</span>
              {typeof it === "string" ? it : (it.label || it.title)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Lesson editor — the structured, editable template ─────────── */
function LessonEditor({ lesson, forceNew, children, pathways, onClose, onSave, onSaveAsTemplate, vp }) {
  const [d, setD] = useState(() => lesson ? JSON.parse(JSON.stringify(lesson)) : blankLesson());
  const set = (patch) => setD(prev => ({ ...prev, ...patch }));

  /* generic list-field helpers (intentions, support, challenge, resources) */
  const listAdd = (field) => set({ [field]: [...d[field], ""] });
  const listSet = (field, i, val) => set({ [field]: d[field].map((x, ix) => ix === i ? val : x) });
  const listRemove = (field, i) => set({ [field]: d[field].filter((_, ix) => ix !== i) });

  /* key concepts */
  const kcSet = (i, patch) => set({ keyConcepts: d.keyConcepts.map((k, ix) => ix === i ? { ...k, ...patch } : k) });
  const kcAdd = () => set({ keyConcepts: [...d.keyConcepts, { id: "kc" + Date.now(), label: "New concept", text: "" }] });
  const kcRemove = (i) => set({ keyConcepts: d.keyConcepts.filter((_, ix) => ix !== i) });

  /* lesson flow sections */
  const flowSet = (i, patch) => set({ flow: d.flow.map((f, ix) => ix === i ? { ...f, ...patch } : f) });
  const flowAdd = () => set({ flow: [...d.flow, { id: "f" + Date.now(), title: "New section", minutes: "10", grouping: "Whole group", notes: "" }] });
  const flowRemove = (i) => set({ flow: d.flow.filter((_, ix) => ix !== i) });
  const flowMove = (i, delta) => {
    const j = i + delta;
    if (j < 0 || j >= d.flow.length) return;
    const next = [...d.flow];
    [next[i], next[j]] = [next[j], next[i]];
    set({ flow: next });
  };

  /* pathways + children toggles */
  const togglePathway = (id) => set({
    pathwayIds: d.pathwayIds.includes(id) ? d.pathwayIds.filter(x => x !== id) : [...d.pathwayIds, id],
  });
  const toggleChild = (id) => set({
    childIds: d.childIds.includes(id) ? d.childIds.filter(x => x !== id) : [...d.childIds, id],
  });

  /* ---- tap-to-insert helpers ---- */
  /* add an item to a bullet list — fills the first empty slot, else appends */
  const insertIntoList = (field, value) => {
    setD(prev => {
      const list = [...prev[field]];
      const emptyIdx = list.findIndex(x => !x || !x.trim());
      if (emptyIdx >= 0) list[emptyIdx] = value;
      else list.push(value);
      return { ...prev, [field]: list };
    });
  };
  /* apply a framework — sets approach and replaces key concepts with that framework's set */
  const applyApproach = (approachId) => {
    const opt = APPROACH_OPTIONS.find(a => a.id === approachId);
    if (!opt) return;
    setD(prev => ({
      ...prev,
      approach: approachId,
      keyConcepts: opt.concepts.map((kc, i) => ({
        id: "kc" + Date.now() + i, label: kc.label, text: kc.text,
      })),
    }));
  };
  /* insert one key concept (from the active framework or generic) */
  const insertKeyConcept = (kc) => {
    setD(prev => {
      const list = [...prev.keyConcepts];
      const emptyIdx = list.findIndex(x => !x.text || !x.text.trim());
      const item = { id: "kc" + Date.now() + Math.random().toString(36).slice(2,5), label: kc.label, text: kc.text };
      if (emptyIdx >= 0) list[emptyIdx] = item;
      else list.push(item);
      return { ...prev, keyConcepts: list };
    });
  };
  /* apply a whole lesson-flow template */
  const applyFlowTemplate = (templateName) => {
    const tmpl = FLOW_TEMPLATES[templateName];
    if (!tmpl) return;
    setD(prev => ({
      ...prev,
      flow: tmpl.map((f, i) => ({ id: "f" + Date.now() + i, ...f })),
    }));
  };

  /* evidence upload — compress images, keep small */
  const fileRef = useRef();
  const onEvidence = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach(f => {
      const reader = new FileReader();
      reader.onload = () => {
        if (f.type.startsWith("image/")) {
          const img = new Image();
          img.onload = () => {
            const max = 900;
            const scale = Math.min(1, max / Math.max(img.width, img.height));
            const canvas = document.createElement("canvas");
            canvas.width = Math.round(img.width * scale);
            canvas.height = Math.round(img.height * scale);
            canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
            setD(prev => ({ ...prev, evidence: [...prev.evidence, {
              id: "ev" + Date.now() + Math.random().toString(36).slice(2, 5),
              name: f.name, kind: "image", dataUrl: canvas.toDataURL("image/jpeg", 0.8),
            }]}));
          };
          img.src = reader.result;
        } else {
          setD(prev => ({ ...prev, evidence: [...prev.evidence, {
            id: "ev" + Date.now() + Math.random().toString(36).slice(2, 5),
            name: f.name, kind: "file", dataUrl: reader.result,
          }]}));
        }
      };
      reader.readAsDataURL(f);
    });
    e.target.value = "";
  };
  const removeEvidence = (id) => set({ evidence: d.evidence.filter(ev => ev.id !== id) });

  const canSave = d.title.trim().length > 0;

  /* ---- shared styles ---- */
  const inputStyle = {
    width: "100%", border: `1px solid ${c.line}`, borderRadius: 9, padding: "9px 11px",
    fontSize: 12.5, fontFamily: FONT_BODY, background: c.white, color: c.ink, outline: "none",
  };
  const sectionCard = { marginBottom: 12 };

  /* Quick Plan shows only the essentials open; Detailed opens everything.
     A section can always be folded/unfolded by tapping its header. */
  const ESSENTIAL_SECTIONS = ["overview", "intentions", "flow", "resources"];
  const ALL_SECTIONS = ["overview", "intentions", "concepts", "flow", "differentiation", "resources", "links", "evidence", "reflection"];
  const isExisting = !!lesson && !forceNew;   // editing a real saved plan (not a fresh/templated one)
  const [mode, setMode] = useState(isExisting ? "detailed" : "quick");
  const [openSections, setOpenSections] = useState(() => {
    const init = {};
    ALL_SECTIONS.forEach(s => { init[s] = isExisting ? true : ESSENTIAL_SECTIONS.includes(s); });
    return init;
  });
  const toggleSection = (key) =>
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  const applyMode = (m) => {
    setMode(m);
    const next = {};
    ALL_SECTIONS.forEach(s => { next[s] = m === "detailed" ? true : ESSENTIAL_SECTIONS.includes(s); });
    setOpenSections(next);
  };

  /* count of filled items per section — shown as a gentle summary when folded */
  const sectionSummary = (key) => {
    const filled = (arr) => (arr || []).filter(x => x && (typeof x === "string" ? x.trim() : (x.text || "").trim())).length;
    switch (key) {
      case "overview": return [d.title, d.subject, d.duration].filter(x => x && x.trim()).length + " filled";
      case "intentions": { const n = filled(d.intentions); return n ? `${n} intention${n>1?"s":""}` : "empty"; }
      case "concepts": { const n = filled(d.keyConcepts); return n ? `${n} concept${n>1?"s":""}` : "empty"; }
      case "flow": return `${d.flow.length} section${d.flow.length>1?"s":""}`;
      case "differentiation": { const n = filled(d.support) + filled(d.challenge); return n ? `${n} idea${n>1?"s":""}` : "empty"; }
      case "resources": { const n = filled(d.resources); return n ? `${n} item${n>1?"s":""}` : "empty"; }
      case "links": { const n = d.pathwayIds.length + d.childIds.length; return n ? `${n} linked` : "none yet"; }
      case "evidence": { const n = d.evidence.length; return n ? `${n} attached` : "none yet"; }
      case "reflection": return d.reflection && d.reflection.trim() ? "written" : "after the lesson";
      default: return "";
    }
  };

  /* Collapsible section card — a render FUNCTION, not a component, so typing
     inside it never remounts the inputs (which was stealing the cursor). */
  const renderSection = ({ sectionKey, icon, title, hint, optional, body }) => {
    const open = !!openSections[sectionKey];
    return (
      <Card key={sectionKey} style={sectionCard} pad={0}>
        <button className="tap" onClick={() => toggleSection(sectionKey)} style={{
          display: "flex", alignItems: "center", gap: 9, width: "100%",
          background: "transparent", border: "none", cursor: "pointer",
          padding: open ? "15px 16px 4px" : "15px 16px", fontFamily: FONT_BODY,
          textAlign: "left",
        }}>
          <span style={{ fontSize: 15 }}>{icon}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 14.5, fontWeight: 700, color: c.brown }}>
              {title}
              {optional && <span style={{ fontSize: 10, fontWeight: 600, color: c.brownLt, marginLeft: 6 }}>optional</span>}
            </div>
            {open
              ? (hint && <div style={{ fontSize: 10.5, color: c.brownLt, marginTop: 2 }}>{hint}</div>)
              : <div style={{ fontSize: 10.5, color: c.brownLt, marginTop: 2 }}>{sectionSummary(sectionKey)}</div>}
          </div>
          <span style={{
            fontSize: 12, color: c.brownLt, fontWeight: 700,
            transform: open ? "rotate(180deg)" : "none", transition: "transform .2s",
          }}>⌄</span>
        </button>
        {open && <div style={{ padding: "8px 16px 16px" }}>{body}</div>}
      </Card>
    );
  };

  /* editable bullet list — also a render function for the same reason */
  const renderBulletList = (field, placeholder, accent) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {d[field].map((val, i) => (
        <div key={i} style={{ display: "flex", gap: 6, alignItems: "flex-start" }}>
          <div style={{
            width: 7, height: 7, borderRadius: "50%", background: accent || c.sage,
            marginTop: 13, flexShrink: 0,
          }} />
          <textarea
            value={val}
            onChange={(e) => listSet(field, i, e.target.value)}
            placeholder={placeholder}
            rows={1}
            style={{ ...inputStyle, resize: "vertical", minHeight: 36, lineHeight: 1.5 }}
          />
          {d[field].length > 1 && (
            <button className="tap" onClick={() => listRemove(field, i)} style={{
              border: `1px solid ${c.line}`, background: c.white, borderRadius: 8,
              width: 32, height: 36, fontSize: 14, color: c.brownLt, cursor: "pointer",
              flexShrink: 0,
            }}>×</button>
          )}
        </div>
      ))}
      <button className="tap" onClick={() => listAdd(field)} style={{
        alignSelf: "flex-start", background: "none", border: "none",
        color: c.sageDk, fontSize: 11.5, fontWeight: 700, cursor: "pointer",
        fontFamily: FONT_BODY, padding: "2px 0",
      }}>＋ Add another</button>
    </div>
  );

  return (
    <div className="rise">
      {/* sticky header */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10, marginBottom: 12, flexWrap: "wrap",
      }}>
        <button className="tap" onClick={onClose} style={{
          background: c.white, border: `1.5px solid ${c.line}`, borderRadius: 10,
          padding: "8px 13px", fontSize: 12, fontWeight: 700, color: c.brown,
          cursor: "pointer", fontFamily: FONT_BODY,
        }}>← Back</button>
        <div style={{ flex: 1, minWidth: 120 }}>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 17, fontWeight: 700, color: c.brown }}>
            {lesson ? "Edit lesson plan" : "New lesson plan"}
          </div>
        </div>
        <button className="tap" onClick={() => canSave && onSave(d)} disabled={!canSave} style={{
          background: canSave ? c.sage : c.line, color: c.white, border: "none",
          borderRadius: 10, padding: "9px 18px", fontSize: 12.5, fontWeight: 700,
          cursor: canSave ? "pointer" : "not-allowed", fontFamily: FONT_BODY,
        }}>✓ Save lesson</button>
      </div>

      {/* Quick vs Detailed mode */}
      <Card pad={11} style={{ marginBottom: 12, background: `linear-gradient(135deg, ${c.sageLt}, ${c.white})`, borderColor: c.sage + "55" }}>
        <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
          {[
            ["quick", "🌿 Quick plan", "Just the essentials — done in a few minutes"],
            ["detailed", "📖 Detailed", "Every section, for full documentation"],
          ].map(([k, l]) => (
            <button key={k} className="tap" onClick={() => applyMode(k)} style={{
              flex: 1, cursor: "pointer", fontFamily: FONT_BODY,
              background: mode === k ? c.sage : c.white,
              color: mode === k ? c.white : c.brown,
              border: `1.5px solid ${mode === k ? c.sage : c.line}`,
              borderRadius: 10, padding: "9px 8px", fontSize: 12.5, fontWeight: 700,
            }}>{l}</button>
          ))}
        </div>
        <div style={{ fontSize: 10.5, color: c.brownLt, lineHeight: 1.5 }}>
          {mode === "quick"
            ? "Quick plan keeps it light — Concepts, Differentiation, Links, Evidence and Reflection are folded away. Tap any section to open it whenever you need it."
            : "Every section is open. Fold away anything you don't need by tapping its header."}
        </div>
      </Card>

      {/* ---- overview ---- */}
      {renderSection({ sectionKey: "overview", icon: "🧸", title: "Lesson overview",
        hint: "The essentials — title, when, and what it covers", body: (
        <>
        <FieldLabel>Lesson title</FieldLabel>
        <input value={d.title} onChange={(e) => set({ title: e.target.value })}
          placeholder="e.g. Fantastic Shapes! — a pre-writing experience"
          style={{ ...inputStyle, marginBottom: 11 }} />

        <div style={{ display: "grid", gridTemplateColumns: vp.isPhone ? "1fr" : "1fr 1fr", gap: 10 }}>
          <div>
            <FieldLabel>Date</FieldLabel>
            <input type="date" value={d.date} onChange={(e) => set({ date: e.target.value })}
              style={inputStyle} />
          </div>
          <div>
            <FieldLabel>Duration</FieldLabel>
            <input value={d.duration} onChange={(e) => set({ duration: e.target.value })}
              placeholder="e.g. 50 minutes" style={inputStyle} />
          </div>
          <div>
            <FieldLabel>Subject / area</FieldLabel>
            <input value={d.subject} onChange={(e) => set({ subject: e.target.value })}
              placeholder="e.g. Mathematics, Literacy" style={inputStyle} />
          </div>
          <div>
            <FieldLabel>Unit / topic</FieldLabel>
            <input value={d.unit} onChange={(e) => set({ unit: e.target.value })}
              placeholder="e.g. How We Express Ourselves" style={inputStyle} />
          </div>
          <div>
            <FieldLabel>Planned by</FieldLabel>
            <input value={d.author} onChange={(e) => set({ author: e.target.value })}
              placeholder="Your name" style={inputStyle} />
          </div>
        </div>

        {/* framework approach — tap to set the planning lens */}
        <div style={{ marginTop: 13 }}>
          <FieldLabel>Planning approach <span style={{ color: c.brownLt, fontWeight: 400 }}>— optional, shapes your key concepts</span></FieldLabel>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {APPROACH_OPTIONS.map(a => {
              const on = d.approach === a.id;
              return (
                <button key={a.id} className="tap" onClick={() => applyApproach(a.id)} style={{
                  cursor: "pointer", fontFamily: FONT_BODY, fontSize: 11.5, fontWeight: 700,
                  padding: "7px 12px", borderRadius: 20,
                  background: on ? c.sage : c.white,
                  color: on ? c.white : c.brown,
                  border: `1.5px solid ${on ? c.sage : c.line}`,
                }}>{a.icon} {a.label}</button>
              );
            })}
          </div>
          <div style={{ fontSize: 10.5, color: c.brownLt, marginTop: 6, lineHeight: 1.5 }}>
            Choosing one fills the Key Concepts section with that framework's ideas — you can still edit or replace them.
          </div>
        </div>
        </>
      )})}

      {/* ---- learning intentions ---- */}
      {renderSection({ sectionKey: "intentions", icon: "🎯", title: "Learning intentions",
        hint: "What you want the children to notice, learn or be able to do", body: (
        <>
        {Object.entries(INTENTION_LIBRARY).map(([area, list]) => (
          <InsertPicker key={area}
            label={"Add from: " + area} icon="🎯" items={list} accent={c.sage}
            onPick={(val) => insertIntoList("intentions", val)} />
        ))}
        <div style={{ marginTop: 4 }}>
          {renderBulletList("intentions", "e.g. Notice, name and describe basic shapes in everyday life", c.sage)}
        </div>
        </>
      )})}

      {/* ---- key concepts ---- */}
      {renderSection({ sectionKey: "concepts", icon: "🪴", title: "Key concepts", optional: true,
        hint: "The big ideas underpinning the learning — rename these to suit your framework", body: (
        <>
        <InsertPicker label="Add an IB PYP-style key concept" icon="🌍"
          items={PYP_KEY_CONCEPTS} accent={c.blue}
          onPick={(kc) => insertKeyConcept(kc)} />
        <InsertPicker label="Add a Reggio-inspired idea" icon="🎨"
          items={REGGIO_CONCEPTS} accent={c.terra}
          onPick={(kc) => insertKeyConcept(kc)} />
        <div style={{ display: "flex", flexDirection: "column", gap: 9, marginTop: 4 }}>
          {d.keyConcepts.map((kc, i) => (
            <div key={kc.id} style={{
              background: c.cream, borderRadius: 10, padding: 10, border: `1px solid ${c.line}`,
            }}>
              <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
                <input value={kc.label} onChange={(e) => kcSet(i, { label: e.target.value })}
                  placeholder="Concept" style={{
                    ...inputStyle, width: 130, fontWeight: 700, background: c.white,
                  }} />
                <div style={{ flex: 1 }} />
                {d.keyConcepts.length > 1 && (
                  <button className="tap" onClick={() => kcRemove(i)} style={{
                    border: `1px solid ${c.line}`, background: c.white, borderRadius: 8,
                    width: 32, fontSize: 14, color: c.brownLt, cursor: "pointer",
                  }}>×</button>
                )}
              </div>
              <textarea value={kc.text} onChange={(e) => kcSet(i, { text: e.target.value })}
                placeholder="Describe this concept in child-friendly terms…"
                rows={2} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }} />
            </div>
          ))}
        </div>
        <button className="tap" onClick={kcAdd} style={{
          marginTop: 8, background: "none", border: "none", color: c.sageDk,
          fontSize: 11.5, fontWeight: 700, cursor: "pointer", fontFamily: FONT_BODY,
        }}>＋ Add a concept</button>
        </>
      )})}

      {/* ---- lesson flow ---- */}
      {renderSection({ sectionKey: "flow", icon: "🌊", title: "Lesson flow",
        hint: "The shape of the session — tap ▲▼ to reorder sections", body: (
        <>
        <InsertPicker label="Start from a flow template" icon="🌊"
          items={Object.keys(FLOW_TEMPLATES)} accent={c.blue}
          onPick={(name) => applyFlowTemplate(name)} />
        <div style={{ fontSize: 10.5, color: c.brownLt, marginBottom: 8, marginLeft: 2, fontStyle: "italic" }}>
          A template replaces the sections below — then edit freely.
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          {d.flow.map((f, i) => (
            <div key={f.id} style={{
              background: c.cream, borderRadius: 10, padding: 10, border: `1px solid ${c.line}`,
            }}>
              <div style={{ display: "flex", gap: 6, marginBottom: 7, alignItems: "center" }}>
                <span style={{
                  width: 22, height: 22, borderRadius: "50%", background: c.sage,
                  color: c.white, fontSize: 11, fontWeight: 800, flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>{i + 1}</span>
                <input value={f.title} onChange={(e) => flowSet(i, { title: e.target.value })}
                  placeholder="Section name" style={{ ...inputStyle, fontWeight: 700, flex: 1 }} />
                <button className="tap" onClick={() => flowMove(i, -1)} disabled={i === 0} style={{
                  border: `1px solid ${c.line}`, background: c.white, borderRadius: 7,
                  width: 28, height: 32, fontSize: 10, color: i === 0 ? c.line : c.brownLt,
                  cursor: i === 0 ? "default" : "pointer", flexShrink: 0,
                }}>▲</button>
                <button className="tap" onClick={() => flowMove(i, 1)} disabled={i === d.flow.length - 1} style={{
                  border: `1px solid ${c.line}`, background: c.white, borderRadius: 7,
                  width: 28, height: 32, fontSize: 10,
                  color: i === d.flow.length - 1 ? c.line : c.brownLt,
                  cursor: i === d.flow.length - 1 ? "default" : "pointer", flexShrink: 0,
                }}>▼</button>
                {d.flow.length > 1 && (
                  <button className="tap" onClick={() => flowRemove(i)} style={{
                    border: `1px solid ${c.terra}55`, background: "transparent", borderRadius: 7,
                    width: 28, height: 32, fontSize: 12, color: c.terra, cursor: "pointer", flexShrink: 0,
                  }}>🗑</button>
                )}
              </div>
              <div style={{ display: "flex", gap: 6, marginBottom: 7 }}>
                <input value={f.minutes} onChange={(e) => flowSet(i, { minutes: e.target.value })}
                  placeholder="Mins" style={{ ...inputStyle, width: 70, textAlign: "center" }} />
                <input value={f.grouping} onChange={(e) => flowSet(i, { grouping: e.target.value })}
                  placeholder="Grouping"
                  style={{ ...inputStyle, flex: 1 }} />
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 7 }}>
                {GROUPING_OPTIONS.map(g => (
                  <button key={g} className="tap" onClick={() => flowSet(i, { grouping: g })} style={{
                    cursor: "pointer", fontFamily: FONT_BODY, fontSize: 10, fontWeight: 600,
                    padding: "3px 8px", borderRadius: 20,
                    background: f.grouping === g ? c.sage : c.white,
                    color: f.grouping === g ? c.white : c.brownLt,
                    border: `1px solid ${f.grouping === g ? c.sage : c.line}`,
                  }}>{g}</button>
                ))}
              </div>
              <textarea value={f.notes} onChange={(e) => flowSet(i, { notes: e.target.value })}
                placeholder="What happens, prompts to use, inquiry questions…"
                rows={3} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.55 }} />
            </div>
          ))}
        </div>
        <button className="tap" onClick={flowAdd} style={{
          marginTop: 8, background: c.sageLt, border: `1.5px dashed ${c.sage}66`,
          borderRadius: 9, padding: "9px 14px", color: c.sageDk,
          fontSize: 11.5, fontWeight: 700, cursor: "pointer", fontFamily: FONT_BODY, width: "100%",
        }}>＋ Add a section (e.g. a station, a transition, outdoor time)</button>
        </>
      )})}

      {/* ---- differentiation ---- */}
      {renderSection({ sectionKey: "differentiation", icon: "💡", title: "Differentiation", optional: true,
        hint: "How you'll meet every child where they are", body: (
        <>
        <FieldLabel>Support — for children who need a gentler way in</FieldLabel>
        <InsertPicker label="Add a support idea" icon="💙"
          items={SUPPORT_IDEAS} accent={c.blue}
          onPick={(val) => insertIntoList("support", val)} />
        <div style={{ marginBottom: 14 }}>
          {renderBulletList("support", "e.g. Big, bold outlines for tracing; hand-over-hand support", c.blue)}
        </div>
        <FieldLabel>Challenge — for children ready to stretch further</FieldLabel>
        <InsertPicker label="Add a challenge idea" icon="🧡"
          items={CHALLENGE_IDEAS} accent={c.terra}
          onPick={(val) => insertIntoList("challenge", val)} />
        {renderBulletList("challenge", "e.g. Combine shapes to invent new ones; try tiny shapes for fine motor", c.terra)}
        </>
      )})}

      {/* ---- resources ---- */}
      {renderSection({ sectionKey: "resources", icon: "🧺", title: "Tools & resources",
        hint: "Everything you'll gather beforehand", body: (
        <>
        <InsertPicker label="Add a common resource" icon="🧺"
          items={RESOURCE_IDEAS} accent={c.yellow}
          onPick={(val) => insertIntoList("resources", val)} />
        {renderBulletList("resources", "e.g. Playdough, easy-grip cutters, laminated shape mats", c.yellow)}
        </>
      )})}

      {/* ---- links: pathways + children ---- */}
      {renderSection({ sectionKey: "links", icon: "🔗", title: "Links", optional: true,
        hint: "Connect this lesson to your framework and focus children", body: (
        <>
        <FieldLabel>Development pathways this supports</FieldLabel>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
          {livePathways().map(p => {
            const on = d.pathwayIds.includes(p.id);
            return (
              <button key={p.id} className="tap" onClick={() => togglePathway(p.id)} style={{
                cursor: "pointer", fontFamily: FONT_BODY, fontSize: 11, fontWeight: 600,
                padding: "5px 10px", borderRadius: 20,
                background: on ? p.color : p.color + "1F",
                color: on ? c.white : c.ink,
                border: `1px solid ${p.color}${on ? "" : "55"}`,
              }}>{p.icon} {p.label}</button>
            );
          })}
        </div>
        <FieldLabel>Focus children <span style={{ color: c.brownLt, fontWeight: 400 }}>— optional</span></FieldLabel>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {children.map(ch => {
            const on = d.childIds.includes(ch.id);
            return (
              <button key={ch.id} className="tap" onClick={() => toggleChild(ch.id)} style={{
                display: "flex", alignItems: "center", gap: 6, cursor: "pointer",
                padding: "4px 10px 4px 4px", borderRadius: 30, fontFamily: FONT_BODY,
                background: on ? c.sage : c.white,
                border: `1.5px solid ${on ? c.sage : c.line}`,
                color: on ? c.white : c.ink,
              }}>
                <Avatar name={ch.name} photo={ch.photo} size={20} color={on ? c.white : c.sage} />
                <span style={{ fontSize: 11, fontWeight: 600 }}>{ch.name.split(" ")[0]}</span>
              </button>
            );
          })}
        </div>
        </>
      )})}

      {/* ---- evidence ---- */}
      {renderSection({ sectionKey: "evidence", icon: "📎", title: "Evidence", optional: true,
        hint: "Photos of the activity, children's work, displays — captured against this date", body: (
        <>
        {d.evidence.length > 0 && (
          <div style={{
            display: "grid", gridTemplateColumns: vp.isPhone ? "1fr 1fr" : "1fr 1fr 1fr",
            gap: 8, marginBottom: 10,
          }}>
            {d.evidence.map(ev => (
              <div key={ev.id} style={{
                position: "relative", borderRadius: 10, overflow: "hidden",
                border: `1px solid ${c.line}`, background: c.cream,
              }}>
                {ev.kind === "image" ? (
                  <img src={ev.dataUrl} alt={ev.name} style={{
                    width: "100%", height: 96, objectFit: "cover", display: "block",
                  }} />
                ) : (
                  <div style={{
                    height: 96, display: "flex", flexDirection: "column", alignItems: "center",
                    justifyContent: "center", gap: 4, padding: 8,
                  }}>
                    <span style={{ fontSize: 24 }}>📄</span>
                    <span style={{
                      fontSize: 9.5, color: c.brownLt, textAlign: "center",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "100%",
                    }}>{ev.name}</span>
                  </div>
                )}
                <button className="tap" onClick={() => removeEvidence(ev.id)} style={{
                  position: "absolute", top: 4, right: 4,
                  width: 24, height: 24, borderRadius: "50%", border: "none",
                  background: "rgba(74,56,38,0.78)", color: c.white, fontSize: 13,
                  cursor: "pointer", lineHeight: 1,
                }}>×</button>
              </div>
            ))}
          </div>
        )}
        <button className="tap" onClick={() => fileRef.current && fileRef.current.click()} style={{
          width: "100%", background: c.sageLt, border: `1.5px dashed ${c.sage}66`,
          borderRadius: 10, padding: "12px", color: c.sageDk,
          fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: FONT_BODY,
        }}>📷 Upload photos or files</button>
        <input ref={fileRef} type="file" accept="image/*,.pdf" multiple capture="environment"
          onChange={onEvidence} style={{ display: "none" }} />
        </>
      )})}

      {/* ---- reflection ---- */}
      {renderSection({ sectionKey: "reflection", icon: "🌙", title: "Reflection", optional: true,
        hint: "After the lesson — what worked, what you'd change, what the children showed you", body: (
        <textarea value={d.reflection} onChange={(e) => set({ reflection: e.target.value })}
          placeholder="Filled in after teaching — celebrate what went well and note next steps…"
          rows={4} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }} />
      )})}

      {/* save as template */}
      {onSaveAsTemplate && (
        <button className="tap" onClick={() => {
          if (!canSave) { return; }
          const suggested = d.title ? d.title + " — template" : "My lesson template";
          const name = prompt("Save this lesson's structure as a reusable template.\n\nName it:", suggested);
          if (name && name.trim()) {
            onSaveAsTemplate(d, name.trim());
            alert("Saved. You'll find it under \"My saved templates\" on the Lesson plans screen.");
          }
        }} style={{
          width: "100%", marginBottom: 10, background: c.yellowLt,
          color: c.brown, border: `1.5px solid ${c.yellow}`, borderRadius: 11,
          padding: "11px", fontFamily: FONT_BODY, fontSize: 12.5, fontWeight: 700,
          cursor: "pointer",
        }}>⭐ Save this structure as a reusable template</button>
      )}

      {/* footer actions */}
      <div style={{ display: "flex", gap: 8, marginTop: 4, marginBottom: 30 }}>
        <button className="tap" onClick={onClose} style={{
          flex: 1, background: c.white, color: c.brownLt, border: `1.5px solid ${c.line}`,
          borderRadius: 11, padding: "12px", fontFamily: FONT_BODY, fontSize: 13, fontWeight: 700,
          cursor: "pointer",
        }}>Cancel</button>
        <button className="tap" onClick={() => canSave && onSave(d)} disabled={!canSave} style={{
          flex: 1.6, background: canSave ? c.sage : c.line, color: c.white, border: "none",
          borderRadius: 11, padding: "12px", fontFamily: FONT_BODY, fontSize: 13, fontWeight: 700,
          cursor: canSave ? "pointer" : "not-allowed",
        }}>✓ Save lesson plan</button>
      </div>
    </div>
  );
}

/* ─── Professional lesson plan export — printable HTML document ─── */
function exportLesson(l, children, blank) {
  const esc = (s) => String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  /* For a blank printable template, draw write-on lines instead of content */
  const lines = (n) => Array.from({ length: n || 3 })
    .map(() => `<div class="wline"></div>`).join("");
  const fmtDate = (d) => {
    if (!d) return "—";
    try {
      return new Date(d + "T00:00:00").toLocaleDateString(undefined,
        { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    } catch { return d; }
  };
  const childName = (id) => (children.find(x => x.id === id)?.name) || "—";
  const pwTags = (l.pathwayIds || []).map(id => pathway(id)).filter(Boolean);
  const focusKids = (l.childIds || []).map(childName);

  const bulletList = (arr) => {
    const items = (arr || []).filter(x => x && x.trim());
    if (!items.length) return `<p class="empty">—</p>`;
    if (blank) return lines(3);
    return `<ul>${items.map(x => `<li>${esc(x)}</li>`).join("")}</ul>`;
  };

  const metaRow = blank
    ? `<span><b>Subject</b> ____________</span><span><b>Unit</b> ____________</span><span><b>Duration</b> ________</span><span><b>Planned by</b> ____________</span>`
    : [
        l.subject && `<span><b>Subject</b> ${esc(l.subject)}</span>`,
        l.unit && `<span><b>Unit</b> ${esc(l.unit)}</span>`,
        l.duration && `<span><b>Duration</b> ${esc(l.duration)}</span>`,
        l.author && `<span><b>Planned by</b> ${esc(l.author)}</span>`,
      ].filter(Boolean).join("");

  const keyConceptsHtml = blank
    ? `<li><b>____________</b> ${lines(1)}</li><li><b>____________</b> ${lines(1)}</li><li><b>____________</b> ${lines(1)}</li>`
    : (l.keyConcepts || [])
        .filter(k => k.text && k.text.trim())
        .map(k => `<li><b>${esc(k.label)}</b> — ${esc(k.text)}</li>`).join("");

  const flowHtml = blank
    ? [1,2,3,4].map(n => `
      <div class="flow">
        <div class="flow-head">
          <span class="flow-num">${n}</span>
          <span class="flow-title">____________________</span>
          <span class="flow-meta">____ min &middot; ____________</span>
        </div>
        <div class="flow-notes">${lines(3)}</div>
      </div>`).join("")
    : (l.flow || []).map((f, i) => `
      <div class="flow">
        <div class="flow-head">
          <span class="flow-num">${i + 1}</span>
          <span class="flow-title">${esc(f.title)}</span>
          <span class="flow-meta">${esc(f.minutes || "")}${f.minutes ? " min" : ""}${f.grouping ? " &middot; " + esc(f.grouping) : ""}</span>
        </div>
        ${f.notes && f.notes.trim() ? `<div class="flow-notes">${esc(f.notes).replace(/\n/g, "<br/>")}</div>` : ""}
      </div>`).join("");

  const evidenceHtml = (l.evidence || []).filter(e => e.kind === "image").map(e =>
    `<figure><img src="${e.dataUrl}" alt="${esc(e.name)}"/><figcaption>${esc(e.name)}</figcaption></figure>`
  ).join("");
  const evidenceFiles = (l.evidence || []).filter(e => e.kind !== "image");

  const html = `<!doctype html><html><head><meta charset="utf-8"/>
<title>${esc(l.title || "Lesson Plan")}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: Georgia, 'Times New Roman', serif; color: #4A3826;
    margin: 0; padding: 40px; background: #FDF8EF; line-height: 1.6; }
  .sheet { max-width: 820px; margin: 0 auto; background: #fff;
    border: 1px solid #E7DEC9; border-radius: 14px; overflow: hidden; }
  .head { background: linear-gradient(135deg, #E8EEDF, #fff); padding: 28px 34px;
    border-bottom: 3px solid #8BA678; }
  .kicker { font-family: 'Trebuchet MS', sans-serif; font-size: 11px; font-weight: bold;
    letter-spacing: 1.5px; text-transform: uppercase; color: #8BA678; }
  h1 { margin: 4px 0 10px; font-size: 27px; color: #6E4A2F; }
  .date { font-family: 'Trebuchet MS', sans-serif; font-size: 13px; color: #6E4A2F;
    font-weight: bold; }
  .meta { font-family: 'Trebuchet MS', sans-serif; font-size: 11.5px; color: #A8855F;
    margin-top: 8px; display: flex; flex-wrap: wrap; gap: 16px; }
  .meta b { color: #6E4A2F; }
  .body { padding: 26px 34px 34px; }
  h2 { font-size: 16px; color: #6B8659; margin: 24px 0 8px;
    border-bottom: 1px solid #E7DEC9; padding-bottom: 5px; }
  h2:first-child { margin-top: 0; }
  ul { margin: 6px 0; padding-left: 22px; }
  li { margin: 4px 0; font-size: 13.5px; }
  .empty { color: #A8855F; font-style: italic; font-size: 13px; }
  .tags { display: flex; flex-wrap: wrap; gap: 6px; margin: 8px 0; }
  .tag { font-family: 'Trebuchet MS', sans-serif; font-size: 11px; font-weight: bold;
    background: #E8EEDF; color: #4A3826; border-radius: 20px; padding: 3px 11px; }
  .flow { border: 1px solid #E7DEC9; border-radius: 10px; padding: 11px 13px;
    margin: 8px 0; background: #FDF8EF; }
  .flow-head { display: flex; align-items: center; gap: 9px; flex-wrap: wrap; }
  .flow-num { width: 22px; height: 22px; border-radius: 50%; background: #8BA678;
    color: #fff; font-family: 'Trebuchet MS', sans-serif; font-size: 12px; font-weight: bold;
    display: inline-flex; align-items: center; justify-content: center; }
  .flow-title { font-weight: bold; font-size: 14.5px; color: #6E4A2F; }
  .flow-meta { font-family: 'Trebuchet MS', sans-serif; font-size: 11px; color: #A8855F; }
  .flow-notes { font-size: 13px; margin-top: 7px; padding-left: 31px; }
  .cols { display: flex; gap: 22px; flex-wrap: wrap; }
  .col { flex: 1; min-width: 220px; }
  .col h3 { font-family: 'Trebuchet MS', sans-serif; font-size: 12px; color: #6E4A2F;
    text-transform: uppercase; letter-spacing: 0.5px; margin: 4px 0; }
  figure { margin: 0; }
  .evidence { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 8px; }
  .evidence img { width: 100%; border-radius: 9px; border: 1px solid #E7DEC9; display: block; }
  figcaption { font-family: 'Trebuchet MS', sans-serif; font-size: 10.5px; color: #A8855F;
    margin-top: 3px; }
  .reflection { background: #E4EDF3; border-left: 4px solid #9BB8CE; border-radius: 8px;
    padding: 12px 15px; font-size: 13.5px; }
  .wline { border-bottom: 1.5px dotted #C9BFA5; height: 19px; margin: 7px 0; }
  .foot { text-align: center; font-family: 'Trebuchet MS', sans-serif; font-size: 10.5px;
    color: #A8855F; margin-top: 26px; padding-top: 14px; border-top: 1px solid #E7DEC9; }
  @media print { body { background: #fff; padding: 0; } .sheet { border: none; } }
</style></head><body>
<div class="sheet">
  <div class="head">
    <div class="kicker">Learning Experience &middot; Lesson Plan${blank ? " &middot; Blank Template" : ""}</div>
    <h1>${blank ? "________________________________" : esc(l.title || "Untitled lesson plan")}</h1>
    <div class="date">${blank ? "Date: ______________________" : fmtDate(l.date)}</div>
    ${metaRow ? `<div class="meta">${metaRow}</div>` : ""}
  </div>
  <div class="body">
    ${blank ? `<p style="font-size:12px;color:#A8855F;font-style:italic">A blank planning template — print it and fill it in by hand, or use it as a guide.</p>` : ""}
    <h2>Learning Intentions</h2>
    ${bulletList(l.intentions)}

    ${keyConceptsHtml ? `<h2>Key Concepts</h2><ul>${keyConceptsHtml}</ul>` : ""}

    <h2>Lesson Flow</h2>
    ${flowHtml || `<p class="empty">No sections added.</p>`}

    <h2>Differentiation</h2>
    <div class="cols">
      <div class="col">
        <h3>Support</h3>
        ${bulletList(l.support)}
      </div>
      <div class="col">
        <h3>Challenge</h3>
        ${bulletList(l.challenge)}
      </div>
    </div>

    <h2>Tools &amp; Resources</h2>
    ${bulletList(l.resources)}

    ${pwTags.length || focusKids.length ? `<h2>Links</h2>` : ""}
    ${pwTags.length ? `<div class="tags">${pwTags.map(p => `<span class="tag">${p.icon} ${esc(p.label)}</span>`).join("")}</div>` : ""}
    ${focusKids.length ? `<p style="font-size:13px"><b>Focus children:</b> ${focusKids.map(esc).join(", ")}</p>` : ""}

    ${evidenceHtml ? `<h2>Evidence</h2><div class="evidence">${evidenceHtml}</div>` : ""}
    ${evidenceFiles.length ? `<p style="font-size:12.5px;color:#A8855F">Attached files: ${evidenceFiles.map(e => esc(e.name)).join(", ")}</p>` : ""}

    ${(l.reflection && l.reflection.trim())
      ? `<h2>Reflection</h2><div class="reflection">${esc(l.reflection).replace(/\n/g, "<br/>")}</div>`
      : blank ? `<h2>Reflection</h2>${lines(4)}` : ""}

    <div class="foot">
      Created with care by Brownie Bear Academy &middot; Teacher Hub<br/>
      Exported ${new Date().toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" })}
    </div>
  </div>
</div>
<script>window.onload = function(){ setTimeout(function(){ window.print(); }, 350); };</script>
</body></html>`;

  const w = window.open("", "_blank");
  if (w) { w.document.write(html); w.document.close(); }
}

/* ════════════════════════════════════════════════════════════════
   GLOBAL FOOTER — copyright line + legal links
   Elegant, minimal, unobtrusive. Sits at the foot of every screen.
   ════════════════════════════════════════════════════════════════ */
function AppFooter({ setView, vp }) {
  const year = new Date().getFullYear();
  const link = (label, target) => (
    <button className="tap no-print" onClick={() => { setView(target); window.scrollTo(0, 0); }}
      style={{
        background: "none", border: "none", cursor: "pointer", fontFamily: FONT_BODY,
        fontSize: 11, fontWeight: 600, color: c.brownLt, padding: "2px 4px",
        textDecoration: "underline", textUnderlineOffset: 2,
      }}>{label}</button>
  );
  return (
    <footer className="no-print" style={{
      marginTop: 30, padding: vp.isPhone ? "20px 16px 26px" : "24px 22px 30px",
      borderTop: `1px solid ${c.line}`, background: c.cream,
      display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <BearMark size={22} />
        <span style={{
          fontFamily: FONT_DISPLAY, fontSize: 13, fontWeight: 700, color: c.brown,
        }}>Brownie Bear Academy</span>
      </div>
      <div style={{
        display: "flex", flexWrap: "wrap", justifyContent: "center", gap: vp.isPhone ? 2 : 6,
      }}>
        {link("Terms of Use", "terms")}
        <span style={{ color: c.line, fontSize: 11 }}>·</span>
        {link("Privacy Policy", "privacy")}
        <span style={{ color: c.line, fontSize: 11 }}>·</span>
        {link("Licence", "licence")}
      </div>
      <div style={{
        fontSize: 10.5, color: c.brownLt, textAlign: "center", lineHeight: 1.6, maxWidth: 440,
      }}>
        © {year} Brownie Bear Academy. All rights reserved.<br />
        Unauthorised reproduction, redistribution, or resale prohibited.
      </div>
    </footer>
  );
}

/* ════════════════════════════════════════════════════════════════
   LEGAL PAGES — Terms of Use · Privacy Policy · Licence
   Calm, readable, teacher-friendly. Honest about an early-stage product.
   ════════════════════════════════════════════════════════════════ */
function LegalPage({ which, onBack, setView, vp }) {
  const title = which === "terms" ? "Terms of Use"
    : which === "privacy" ? "Privacy Policy"
    : "Content Licence";
  const intro = which === "terms"
    ? "Thank you for using Brownie Bear Academy. These terms explain how the app may be used. We've kept them short and plain — no dense legal jargon."
    : which === "privacy"
    ? "Your trust matters to us. This page explains, simply and honestly, what happens to the information you enter into Brownie Bear Academy."
    : "This page explains who owns the content and resources in Brownie Bear Academy, and how you're welcome to use them.";

  /* a calm section block */
  const Block = ({ heading, children }) => (
    <div style={{ marginBottom: 22 }}>
      <h2 style={{
        fontFamily: FONT_DISPLAY, fontSize: 15.5, fontWeight: 700, color: c.brown,
        margin: "0 0 8px",
      }}>{heading}</h2>
      <div style={{ fontSize: 13, color: c.ink, lineHeight: 1.7 }}>{children}</div>
    </div>
  );
  const Item = ({ children }) => (
    <div style={{ display: "flex", gap: 8, marginBottom: 6, alignItems: "flex-start" }}>
      <span style={{ color: c.sage, fontWeight: 800, flexShrink: 0, marginTop: 1 }}>·</span>
      <span>{children}</span>
    </div>
  );
  const lastUpdated = "May 2026";

  return (
    <div className="rise" style={{ maxWidth: 680, margin: "0 auto" }}>
      <button className="tap" onClick={onBack} style={{
        background: c.white, border: `1.5px solid ${c.line}`, borderRadius: 10,
        padding: "8px 14px", fontSize: 12, fontWeight: 700, color: c.brown,
        cursor: "pointer", fontFamily: FONT_BODY, marginBottom: 16,
      }}>← Back to the app</button>

      <Card style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 8 }}>
          <BearMark size={34} />
          <div>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 19, fontWeight: 700, color: c.brown }}>
              {title}
            </div>
            <div style={{ fontSize: 10.5, color: c.brownLt, fontWeight: 600 }}>
              Brownie Bear Academy · Last updated {lastUpdated}
            </div>
          </div>
        </div>
        <div style={{ fontSize: 12.5, color: c.brownLt, lineHeight: 1.65 }}>{intro}</div>
      </Card>

      <Card>
        {which === "terms" && (
          <div>
            <Block heading="Who can use Brownie Bear Academy">
              Brownie Bear Academy is made for early years educators. It is intended for
              genuine educational use — planning, observation and assessment for the
              children in your own setting.
            </Block>
            <Block heading="How you may use it">
              <Item>Use it for your own teaching, classroom and personal professional practice.</Item>
              <Item>Create, edit, export and print your own plans, observations and documents.</Item>
              <Item>Share exported documents with the parents and colleagues of the children you teach.</Item>
            </Block>
            <Block heading="What is not allowed">
              <Item>Reselling, sublicensing or charging others for access to the app or its content.</Item>
              <Item>Redistributing, publishing or sharing the app or paid resources publicly or online.</Item>
              <Item>Copying, cloning or reproducing the platform, its design, its code or its branding.</Item>
              <Item>Presenting the app, its resources or its characters as your own work.</Item>
            </Block>
            <Block heading="Ownership">
              The Brownie Bear Academy app — including its design, code, written content,
              resources, name, bear character and branding — belongs to Brownie Bear Academy.
              Using the app does not transfer any ownership to you. See our Content Licence
              for what your use does include.
            </Block>
            <Block heading="An honest note on this early version">
              Brownie Bear Academy is an early-stage product. In this version, the
              information you enter is saved on your own device (see our Privacy Policy).
              We can't guarantee the app will be free of interruptions or that data will
              never be lost, so please keep your own copies of anything important. We're
              improving the app continuously and value your patience and feedback.
            </Block>
            <Block heading="Limitation of liability">
              Brownie Bear Academy is provided "as is". To the fullest extent permitted by
              law, we are not liable for any loss of data, loss of work, or other indirect
              losses arising from use of the app. You remain responsible for your own
              professional judgement and record-keeping.
            </Block>
            <Block heading="Changes to these terms">
              We may update these terms as the product grows. When we do, we'll update the
              date at the top of this page. Continuing to use the app means you accept the
              current version.
            </Block>
            <Block heading="Ending access for misuse">
              If the app is used in a way that breaks these terms — particularly resale,
              redistribution or copying — we may suspend or end access to it.
            </Block>
            <Block heading="Governing approach">
              These terms are written to be fair and reasonable for educators worldwide.
              Any disputes will be handled in good faith and in line with the laws
              applicable where Brownie Bear Academy operates.
            </Block>
          </div>
        )}

        {which === "privacy" && (
          <div>
            <Block heading="What information the app holds">
              Brownie Bear Academy stores the things you type into it — your lesson plans,
              observations, assessment notes, children's names and any details, photos or
              notes you choose to add. It only holds what you enter; we don't collect
              anything in the background.
            </Block>
            <Block heading="Where your information is stored">
              In this version, everything is saved <b>locally on your own device</b>, inside
              your browser's storage. It stays on that device and is not sent to us or to
              anyone else. This means your information is private to you — but it also means
              it won't automatically appear on a different device or browser, and clearing
              your browser data will remove it. Please keep your own backups of anything
              important.
            </Block>
            <Block heading="Cloud saving in the future">
              As Brownie Bear Academy grows, we plan to offer optional secure cloud accounts
              so your work can sync across devices and be backed up. If and when that
              arrives, we'll update this policy clearly and explain exactly what changes
              before you opt in.
            </Block>
            <Block heading="Information about children">
              Any details you record about children are entered and controlled by you. You
              are responsible for ensuring you have the right permissions from your setting
              and families to record that information, and for handling it in line with
              your setting's safeguarding and data policies. Brownie Bear Academy is a tool
              that holds what you enter on your device — it does not make you compliant with
              any particular regulation on its own.
            </Block>
            <Block heading="We do not sell your information">
              We will never sell your information or the information you record about
              children. That is a firm commitment.
            </Block>
            <Block heading="Cookies and analytics">
              The current version uses only the storage needed to make the app work. If we
              later add basic, privacy-respecting analytics to understand how the app is
              used, we will update this page and keep it minimal.
            </Block>
            <Block heading="Getting in touch">
              Questions about privacy? We'd genuinely like to hear from you.
              Contact: <b>[ add your contact email here ]</b>
            </Block>
          </div>
        )}

        {which === "licence" && (
          <div>
            <Block heading="What this covers">
              This licence applies to everything created by Brownie Bear Academy —
              worksheets, stories, printables, lesson plans, activity packs, the app's
              interface and design, the Brownie Bear Academy name, and the bear character
              and branding.
            </Block>
            <Block heading="Who owns it">
              All of this content and branding belongs to Brownie Bear Academy. It is
              protected by copyright.
            </Block>
            <Block heading="What your use includes">
              <Item>You may use Brownie Bear Academy resources for your own classroom and personal teaching.</Item>
              <Item>You may print and use resources with the children in your own setting.</Item>
              <Item>Buying or accessing a resource gives you the right to use it — it does not transfer ownership to you.</Item>
            </Block>
            <Block heading="What is not permitted">
              <Item>Reselling, sharing or giving away resources to others.</Item>
              <Item>Uploading resources to public websites, social media or file-sharing platforms.</Item>
              <Item>Reproducing resources, the app design, or the bear character for your own products.</Item>
              <Item>Removing or altering Brownie Bear Academy branding or copyright marks.</Item>
            </Block>
            <Block heading="Need a wider licence?">
              If you'd like to use Brownie Bear Academy across a whole school or nursery
              group, or in another way not covered above, we're happy to arrange a suitable
              licence — just get in touch.
            </Block>
          </div>
        )}

        {/* gentle disclaimer */}
        <div style={{
          marginTop: 6, padding: "11px 13px", borderRadius: 10,
          background: c.sageLt, border: `1px solid ${c.sage}44`,
          fontSize: 11, color: c.brownLt, lineHeight: 1.6,
        }}>
          This page is written in plain language to be clear and fair. It is not legal
          advice. As Brownie Bear Academy grows, having these documents reviewed by a
          qualified professional is recommended.
        </div>
      </Card>

      {/* cross-links to the other legal pages */}
      <div style={{ display: "flex", gap: 8, marginTop: 14, marginBottom: 10, flexWrap: "wrap" }}>
        {[["terms", "Terms of Use"], ["privacy", "Privacy Policy"], ["licence", "Content Licence"]]
          .filter(([k]) => k !== which)
          .map(([k, label]) => (
            <button key={k} className="tap" onClick={() => { setView(k); window.scrollTo(0, 0); }}
              style={{
                flex: 1, minWidth: 130, background: c.white, border: `1.5px solid ${c.line}`,
                borderRadius: 10, padding: "10px 12px", fontSize: 12, fontWeight: 700,
                color: c.brown, cursor: "pointer", fontFamily: FONT_BODY,
              }}>Read our {label} →</button>
          ))}
      </div>
    </div>
  );
}
