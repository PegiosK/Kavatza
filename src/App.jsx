import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid, Legend,
} from "recharts";
import {
  Wallet, Plus, BarChart3, Settings, Repeat, Target, Download, Upload,
  ChevronLeft, ChevronRight, ChevronDown, X, Pencil, Trash2, Check, ArrowDownLeft, ArrowUpRight,
  PiggyBank, Languages, Receipt, AlertCircle, FolderPlus, RotateCcw, CalendarClock,
} from "lucide-react";

/* ------------------------------------------------------------------ *
 * Lefta — a zero-based envelope budget for Greece (EUR).
 * Local-only. No accounts linked. Data lives on the device.
 * ------------------------------------------------------------------ */

const C = {
  ink: "#1E211F",        // warm near-black
  paper: "#F5F1E8",      // warm paper (the ledger)
  card: "#FFFFFF",
  vault: "#0C3F3A",      // bold deep teal canvas (the stash)
  vaultEdge: "#06211E",
  teal: "#0C3F3A",       // primary action — matches the vault
  tealSoft: "#DCEEE9",   // active-tab mint pill
  coin: "#FFFFFF",       // white, headline text on vault
  coinDim: "#CFE3DE",    // secondary text on vault
  gold: "#D4A72C",       // brass/gold — the money accent (bars, FAB, edit pill)
  goldSoft: "#FBF0D2",
  amber: "#D4A72C",      // brass — goals & due (alias of gold)
  amberSoft: "#FBF0D2",
  clay: "#D2604A",       // overspend / outflow
  claySoft: "#F4E3DC",
  muted: "#8B8579",
  line: "#EEE9DC",       // warm hairline
  green: "#3AA57C",
};

const STORE_KEY = "kavatza_state_v2";

/* ----------------------------- i18n ------------------------------ */
const STR = {
  en: {
    appName: "KABATZA", tagline: "Give every euro a job",
    budget: "Budget", transactions: "Activity", reports: "Reports", more: "More",
    readyToAssign: "Ready to assign", allAssigned: "Every euro has a job",
    moneyWaiting: "waiting to be assigned", overAssigned: "assigned more than you have",
    assigned: "Assigned", activity: "Activity", available: "Available",
    income: "Income — Ready to assign", addMoney: "Add money",
    category: "Category", payee: "Payee / note", memo: "Memo", amount: "Amount", date: "Date",
    outflow: "Spent", inflow: "Received", save: "Save", cancel: "Cancel", delete: "Delete",
    edit: "Edit", done: "Done", recurring: "Scheduled", goals: "Goals", settings: "Settings",
    dataBackup: "Backup & restore", exportJSON: "Export backup (.json)",
    exportCSV: "Export activity (.csv)", importData: "Restore from backup",
    language: "Language", clearAll: "Erase all data", clearAllConfirm:
      "Erase everything and start over? This cannot be undone.",
    dueNow: "Due now", enter: "Enter", target: "Target", toGo: "to go", funded: "funded",
    spendingByCategory: "Spending this month", incomeVsExpense: "Income vs spending",
    noActivity: "No activity yet", noActivityHint: "Tap + to log your first transaction.",
    noScheduled: "Nothing scheduled", noScheduledHint: "Add a recurring bill or paycheck.",
    addTransaction: "Add transaction", newTransaction: "New transaction", editTransaction: "Edit transaction",
    assign: "Assign", setGoal: "Goal", noGoal: "No goal", balanceGoal: "Build a balance",
    monthlyGoal: "Fund it monthly", goalTarget: "Target amount", byDate: "By date (optional)",
    fundGoal: "Fund goal", coverOverspend: "Cover overspending", quickFund: "Quick fund",
    assignedThisMonth: "Assigned this month", addCategory: "Add category", addGroup: "Add category group",
    rename: "Rename", groupName: "Group name", categoryName: "Category name",
    deleteCatConfirm: "Delete this category? Its transactions stay but become uncategorised.",
    deleteGroupConfirm: "Delete this group and all its categories?",
    newSchedule: "New scheduled item", frequency: "Repeats", monthly: "Monthly", weekly: "Weekly",
    biweekly: "Every 2 weeks", yearly: "Yearly", nextDate: "Next date", name: "Name",
    everyEuro: "every euro a job", restored: "Backup restored.", badFile: "That file isn't a valid Lefta backup.",
    uncategorised: "Uncategorised", thisMonth: "this month", needPerMonth: "/mo to reach by date",
    emptyBudget: "Add a category to start budgeting.", spent: "spent", received: "received",
    install: "Tip: keep a backup now and then via “Backup & restore”. Your data lives only on this device.",
    confirm: "Confirm", schedule: "Schedule", manageCats: "Categories & groups", ofWord: "of",
        backupNotice: "Your budget lives only in this browser. Export a backup now and then — Backup & restore, in More.",
    shortcutNotice: "Install as an app — Android: open this page in CHROME → menu ⋮ → 'Add to Home screen' → Add. iPhone: Safari → Share → 'Add to Home Screen'. Avoid Firefox for installing — it has a known bug.",
    gotIt: "Got it",
    srcSalary: "Salary", srcPension: "Pension", srcRents: "Rent income", srcInvest: "Investments",
    accounts: "Accounts", totalSavings: "Total savings", addAccount: "Add account",
    accountName: "Account name", startingBalance: "Starting balance", balance: "Balance",
    noAccounts: "No accounts yet", noAccountsHint: "Add a savings or cash account to track its balance.",
    deleteAccountConfirm: "Delete this account?",
  },
  el: {
    appName: "KABATZA", tagline: "Δώσε δουλειά σε κάθε ευρώ",
    budget: "Προϋπολογισμός", transactions: "Κινήσεις", reports: "Αναφορές", more: "Άλλα",
    readyToAssign: "Για μοίρασμα", allAssigned: "Κάθε ευρώ έχει δουλειά",
    moneyWaiting: "περιμένουν να μοιραστούν", overAssigned: "μοίρασες πιο πολλά απ' όσα έχεις",
    assigned: "Μοιρασμένα", activity: "Κίνηση", available: "Διαθέσιμα",
    income: "Έσοδο — Για μοίρασμα", addMoney: "Προσθήκη χρημάτων",
    category: "Κατηγορία", payee: "Δικαιούχος / σημείωση", memo: "Σημείωση", amount: "Ποσό", date: "Ημ/νία",
    outflow: "Έξοδο", inflow: "Έσοδο", save: "Αποθήκευση", cancel: "Άκυρο", delete: "Διαγραφή",
    edit: "Επεξεργασία", done: "Τέλος", recurring: "Πάγια", goals: "Στόχοι", settings: "Ρυθμίσεις",
    dataBackup: "Αντίγραφο & επαναφορά", exportJSON: "Εξαγωγή αντιγράφου (.json)",
    exportCSV: "Εξαγωγή κινήσεων (.csv)", importData: "Επαναφορά από αντίγραφο",
    language: "Γλώσσα", clearAll: "Διαγραφή όλων", clearAllConfirm:
      "Διαγραφή των πάντων και έναρξη από την αρχή; Δεν αναιρείται.",
    dueNow: "Λήγουν τώρα", enter: "Καταχώρηση", target: "Στόχος", toGo: "απομένουν", funded: "καλυμμένο",
    spendingByCategory: "Έξοδα αυτόν τον μήνα", incomeVsExpense: "Έσοδα vs έξοδα",
    noActivity: "Δεν υπάρχουν κινήσεις", noActivityHint: "Πάτησε + για την πρώτη σου κίνηση.",
    noScheduled: "Τίποτα προγραμματισμένο", noScheduledHint: "Πρόσθεσε πάγιο λογαριασμό ή μισθό.",
    addTransaction: "Προσθήκη κίνησης", newTransaction: "Νέα κίνηση", editTransaction: "Επεξεργασία κίνησης",
    assign: "Μοίρασμα", setGoal: "Στόχος", noGoal: "Χωρίς στόχο", balanceGoal: "Συγκέντρωση ποσού",
    monthlyGoal: "Μηνιαία κάλυψη", goalTarget: "Ποσό στόχου", byDate: "Μέχρι (προαιρετικό)",
    fundGoal: "Κάλυψη στόχου", coverOverspend: "Κάλυψη υπέρβασης", quickFund: "Γρήγορη κατανομή",
    assignedThisMonth: "Μοιρασμένα αυτόν τον μήνα", addCategory: "Προσθήκη κατηγορίας", addGroup: "Προσθήκη ομάδας",
    rename: "Μετονομασία", groupName: "Όνομα ομάδας", categoryName: "Όνομα κατηγορίας",
    deleteCatConfirm: "Διαγραφή κατηγορίας; Οι κινήσεις της μένουν αλλά γίνονται χωρίς κατηγορία.",
    deleteGroupConfirm: "Διαγραφή ομάδας και όλων των κατηγοριών της;",
    newSchedule: "Νέο προγραμματισμένο", frequency: "Επανάληψη", monthly: "Μηνιαία", weekly: "Εβδομαδιαία",
    biweekly: "Κάθε 2 εβδομάδες", yearly: "Ετήσια", nextDate: "Επόμενη ημ/νία", name: "Όνομα",
    everyEuro: "κάθε ευρώ μια δουλειά", restored: "Το αντίγραφο επαναφέρθηκε.", badFile: "Μη έγκυρο αρχείο αντιγράφου Λεφτά.",
    uncategorised: "Χωρίς κατηγορία", thisMonth: "αυτόν τον μήνα", needPerMonth: "/μήνα για τον στόχο",
    emptyBudget: "Πρόσθεσε κατηγορία για να ξεκινήσεις.", spent: "ξοδεύτηκαν", received: "εισπράχθηκαν",
    install: "Συμβουλή: κράτα κάθε τόσο αντίγραφο από το «Αντίγραφο & επαναφορά» για ασφάλεια.",
    confirm: "Επιβεβαίωση", schedule: "Πρόγραμμα", manageCats: "Κατηγορίες & ομάδες", ofWord: "από",
        backupNotice: "Ο προϋπολογισμός σου ζει μόνο σε αυτόν τον browser. Κράτα πού και πού αντίγραφο — «Αντίγραφο & επαναφορά», στο «Άλλα».",
    shortcutNotice: "Εγκατάσταση σαν εφαρμογή — Android: άνοιξε αυτή τη σελίδα στο CHROME → μενού ⋮ → «Προσθήκη στην αρχική οθόνη» → Προσθήκη. iPhone: Safari → Κοινοποίηση → «Προσθήκη σε αρχική οθόνη». Απόφυγε τον Firefox για την εγκατάσταση — έχει γνωστό σφάλμα.",
    gotIt: "Το κατάλαβα",
    srcSalary: "Μισθός", srcPension: "Σύνταξη", srcRents: "Ενοίκια", srcInvest: "Επενδύσεις",
    accounts: "Λογαριασμοί", totalSavings: "Συνολικές αποταμιεύσεις", addAccount: "Προσθήκη λογαριασμού",
    accountName: "Όνομα λογαριασμού", startingBalance: "Αρχικό υπόλοιπο", balance: "Υπόλοιπο",
    noAccounts: "Δεν υπάρχουν λογαριασμοί", noAccountsHint: "Πρόσθεσε έναν λογαριασμό αποταμίευσης ή μετρητών για να παρακολουθείς το υπόλοιπό του.",
    deleteAccountConfirm: "Διαγραφή αυτού του λογαριασμού;",
  },
};

/* --------------------------- helpers ----------------------------- */
const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
const todayISO = () => new Date().toISOString().slice(0, 10);
const monthKey = (iso) => (iso || "").slice(0, 7);
const curMonth = () => todayISO().slice(0, 7);

const eur = new Intl.NumberFormat("el-GR", { style: "currency", currency: "EUR", minimumFractionDigits: 2 });
const eurCompact = new Intl.NumberFormat("el-GR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
const money = (n) => eur.format(n || 0);
const moneyShort = (n) => eurCompact.format(n || 0);

function parseAmount(str) {
  if (typeof str === "number") return str;
  let s = String(str ?? "").trim().replace(/\s|€/g, "");
  if (!s) return NaN;
  const lc = s.lastIndexOf(","), ld = s.lastIndexOf(".");
  if (lc > -1 && ld > -1) s = lc > ld ? s.replace(/\./g, "").replace(",", ".") : s.replace(/,/g, "");
  else if (lc > -1) s = s.replace(",", ".");
  return parseFloat(s);
}

function monthLabel(mk, lang) {
  const [y, m] = mk.split("-").map(Number);
  const d = new Date(y, m - 1, 1);
  return d.toLocaleDateString(lang === "el" ? "el-GR" : "en-GB", { month: "long", year: "numeric" });
}
function shortMonth(mk, lang) {
  const [y, m] = mk.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString(lang === "el" ? "el-GR" : "en-GB", { month: "short" });
}
function addMonthsKey(mk, delta) {
  const [y, m] = mk.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
function advanceDate(iso, freq) {
  const d = new Date(iso + "T00:00:00");
  if (freq === "weekly") d.setDate(d.getDate() + 7);
  else if (freq === "biweekly") d.setDate(d.getDate() + 14);
  else if (freq === "yearly") d.setFullYear(d.getFullYear() + 1);
  else d.setMonth(d.getMonth() + 1);
  return d.toISOString().slice(0, 10);
}
function monthsDiff(fromMk, toIso) {
  const [fy, fm] = fromMk.split("-").map(Number);
  const t = new Date(toIso + "T00:00:00");
  return (t.getFullYear() - fy) * 12 + (t.getMonth() + 1 - fm);
}

/* --------------------------- seed data --------------------------- */
function seedState() {
  const g1 = uid(), g2 = uid(), g3 = uid();
  const cat = (groupId, name, goal = null) => ({ id: uid(), groupId, name, goal });
  return {
    version: 1,
    settings: { lang: "el" },
    groups: [
      { id: g1, name: "Πάγια έξοδα" },
      { id: g2, name: "Καθημερινά" },
      { id: g3, name: "Στόχοι" },
    ],
    categories: [
      cat(g1, "Ενοίκιο"),
      cat(g1, "Δάνεια"),
      cat(g1, "Ρεύμα"),
      cat(g1, "Νερό"),
      cat(g1, "Τηλέφωνο"),
      cat(g1, "Καύσιμα"),
      cat(g2, "Μαναβική"),
      cat(g2, "Φαγητό έξω"),
      cat(g2, "Διασκέδαση"),
      cat(g2, "Συνδρομές"),
      cat(g3, "Έκτακτο ταμείο", { type: "balance", target: 3000, byDate: "" }),
      cat(g3, "Διακοπές", { type: "monthly", target: 150, byDate: "" }),
    ],
    assignments: {},          // { 'YYYY-MM': { catId: amount } }
    transactions: [],         // { id, date, amount, categoryId|null, payee, memo, scheduleId|null }
    schedules: [],            // { id, name, amount, categoryId|null, freq, nextDate, payee }
    accounts: [{ id: uid(), name: "Μετρητά", balance: 0 }],  // { id, name, balance }
  };
}

/* --------------------------- storage ----------------------------- */
/* Native build: data is stored on-device via the WebView's localStorage,
   which persists across app launches. Backups via JSON export are the
   portable safety net. */
function loadState() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return withDefaults(JSON.parse(raw));
  } catch { /* fall through */ }
  return seedState();
}
// Fills in fields added after someone's data was already saved (e.g. "accounts"),
// so old saved state never crashes a screen that expects a newer field to exist.
function withDefaults(state) {
  if (!state.accounts) state.accounts = [];
  return state;
}
function saveState(state) {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch { /* ignore quota */ }
}

/* ====================== small UI primitives ====================== */
function Sheet({ title, onClose, children, t }) {
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(21,32,43,.45)", zIndex: 50,
      display: "flex", alignItems: "flex-end", justifyContent: "center",
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: "100%", maxWidth: 480, background: C.card, borderTopLeftRadius: 22, borderTopRightRadius: 22,
        maxHeight: "92vh", overflowY: "auto", paddingBottom: "max(20px, env(safe-area-inset-bottom))",
        boxShadow: "0 -10px 40px rgba(21,32,43,.25)", animation: "sheetUp .22s ease",
      }}>
        <div style={{
          position: "sticky", top: 0, background: C.card, display: "flex", alignItems: "center",
          justifyContent: "space-between", padding: "16px 18px 10px", borderBottom: `1px solid ${C.line}`, zIndex: 2,
        }}>
          <h2 style={{ font: "600 18px/1.2 'Commissioner', sans-serif", color: C.ink, margin: 0 }}>{title}</h2>
          <button onClick={onClose} aria-label="Close" style={iconBtn}><X size={20} color={C.muted} /></button>
        </div>
        <div style={{ padding: 18 }}>{children}</div>
      </div>
    </div>
  );
}

const iconBtn = {
  background: "transparent", border: "none", padding: 8, borderRadius: 10,
  cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center",
};
const fieldLabel = { display: "block", font: "600 12px/1 'Commissioner', sans-serif", color: C.muted, letterSpacing: ".04em", textTransform: "uppercase", marginBottom: 7 };
const inputStyle = {
  width: "100%", boxSizing: "border-box", padding: "13px 14px", borderRadius: 12, border: `1.5px solid ${C.line}`,
  font: "500 16px 'Commissioner', sans-serif", color: C.ink, background: "#FBFCFC", outline: "none",
};
function Field({ label, children }) {
  return <div style={{ marginBottom: 16 }}><label style={fieldLabel}>{label}</label>{children}</div>;
}
function PrimaryBtn({ children, onClick, color = C.teal, full = true, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width: full ? "100%" : "auto", padding: "14px 18px", borderRadius: 13, border: "none",
      background: disabled ? "#AEB7BD" : color, color: "#fff", font: "600 16px 'Commissioner', sans-serif",
      cursor: disabled ? "default" : "pointer", display: "inline-flex", alignItems: "center",
      justifyContent: "center", gap: 8,
    }}>{children}</button>
  );
}
function GhostBtn({ children, onClick, color = C.muted }) {
  return (
    <button onClick={onClick} style={{
      padding: "12px 16px", borderRadius: 12, border: `1.5px solid ${C.line}`, background: C.card,
      color, font: "600 15px 'Commissioner', sans-serif", cursor: "pointer", display: "inline-flex",
      alignItems: "center", justifyContent: "center", gap: 7,
    }}>{children}</button>
  );
}


class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { crashed: false }; }
  static getDerivedStateFromError() { return { crashed: true }; }
  componentDidCatch(err, info) { console.error("καβάτζα crashed:", err, info); }
  render() {
    if (!this.state.crashed) return this.props.children;
    return (
      <div style={{
        minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", gap: 16, padding: 28, background: "#F1EFE7", textAlign: "center",
        fontFamily: "'Commissioner',sans-serif",
      }}>
        <div style={{ font: "700 19px 'Commissioner',sans-serif", color: "#1E2522" }}>Κάτι πήγε στραβά</div>
        <div style={{ font: "500 14px/1.5 'Commissioner',sans-serif", color: "#71796F", maxWidth: 320 }}>
          Τα δεδομένα σου δεν χάθηκαν — μένουν αποθηκευμένα στη συσκευή. Δοκίμασε να ξαναφορτώσεις την εφαρμογή.
        </div>
        <button onClick={() => window.location.reload()} style={{
          border: "none", background: "#146E68", color: "#fff", borderRadius: 12,
          padding: "12px 22px", font: "600 15px 'Commissioner',sans-serif", cursor: "pointer",
        }}>Ξαναφόρτωση</button>
      </div>
    );
  }
}

/* =========================== main app =========================== */
export default function App() {
  return <ErrorBoundary><AppInner /></ErrorBoundary>;
}
function AppInner() {
  const [state, setState] = useState(loadState);
  const [tab, setTab] = useState("budget");
  const [dispMonth, setDispMonth] = useState(curMonth());
  const [modal, setModal] = useState(null);    // {type, ...}
  const [toast, setToast] = useState(null);
  const fileRef = useRef(null);

  // persist on every change
  useEffect(() => { if (state) saveState(state); }, [state]);

  const lang = state?.settings?.lang || "el";
  const t = useCallback((k) => (STR[lang] && STR[lang][k]) || STR.en[k] || k, [lang]);

  const flash = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2600); };

  /* ---- derived budget math ---- */
  const calc = useMemo(() => {
    if (!state) return null;
    const { transactions, assignments, categories } = state;
    const totalIncome = transactions.filter((x) => x.categoryId === null).reduce((s, x) => s + x.amount, 0);
    let totalAssigned = 0;
    for (const m in assignments) for (const c in assignments[m]) totalAssigned += assignments[m][c] || 0;
    const readyToAssign = totalIncome - totalAssigned;

    const assignedThis = (catId) => (assignments[dispMonth] && assignments[dispMonth][catId]) || 0;
    const activityThis = (catId) =>
      transactions.filter((x) => x.categoryId === catId && monthKey(x.date) === dispMonth)
        .reduce((s, x) => s + x.amount, 0);
    const availableThrough = (catId) => {
      let tot = 0;
      for (const m in assignments) if (m <= dispMonth) tot += assignments[m][catId] || 0;
      for (const x of transactions) if (x.categoryId === catId && monthKey(x.date) <= dispMonth) tot += x.amount;
      return tot;
    };
    const byCat = {};
    for (const c of categories) byCat[c.id] = {
      assigned: assignedThis(c.id), activity: activityThis(c.id), available: availableThrough(c.id),
    };
    return { readyToAssign, byCat, totalIncome, totalAssigned };
  }, [state, dispMonth]);

  const dueSchedules = useMemo(() => {
    if (!state) return [];
    const today = todayISO();
    return state.schedules.filter((s) => s.nextDate <= today);
  }, [state]);

  if (!state || !calc) {
    return <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: C.paper, color: C.muted, font: "500 15px 'Commissioner',sans-serif" }}>…</div>;
  }

  /* ---- mutations ---- */
  const update = (fn) => setState((prev) => { const next = structuredClone(prev); fn(next); return next; });

  const addTx = (tx) => update((s) => { s.transactions.unshift({ id: uid(), scheduleId: null, ...tx }); });
  const editTx = (id, tx) => update((s) => { const i = s.transactions.findIndex((x) => x.id === id); if (i > -1) s.transactions[i] = { ...s.transactions[i], ...tx }; });
  const delTx = (id) => update((s) => { s.transactions = s.transactions.filter((x) => x.id !== id); });

  const setAssigned = (catId, amount) => update((s) => {
    if (!s.assignments[dispMonth]) s.assignments[dispMonth] = {};
    s.assignments[dispMonth][catId] = amount;
  });

  const addCategory = (groupId, name) => update((s) => { s.categories.push({ id: uid(), groupId, name, goal: null }); });
  const renameCategory = (id, name) => update((s) => { const c = s.categories.find((x) => x.id === id); if (c) c.name = name; });
  const setGoal = (id, goal) => update((s) => { const c = s.categories.find((x) => x.id === id); if (c) c.goal = goal; });
  const delCategory = (id) => update((s) => {
    s.categories = s.categories.filter((x) => x.id !== id);
    s.transactions.forEach((x) => { if (x.categoryId === id) x.categoryId = null; });
    for (const m in s.assignments) delete s.assignments[m][id];
    s.schedules.forEach((x) => { if (x.categoryId === id) x.categoryId = null; });
  });
  const addGroup = (name) => update((s) => { s.groups.push({ id: uid(), name }); });
  const renameGroup = (id, name) => update((s) => { const g = s.groups.find((x) => x.id === id); if (g) g.name = name; });
  const delGroup = (id) => update((s) => {
    const catIds = s.categories.filter((c) => c.groupId === id).map((c) => c.id);
    s.groups = s.groups.filter((g) => g.id !== id);
    s.categories = s.categories.filter((c) => c.groupId !== id);
    s.transactions.forEach((x) => { if (catIds.includes(x.categoryId)) x.categoryId = null; });
    for (const m in s.assignments) for (const cid of catIds) delete s.assignments[m][cid];
    s.schedules.forEach((x) => { if (catIds.includes(x.categoryId)) x.categoryId = null; });
  });

  const addSchedule = (sc) => update((s) => { s.schedules.push({ id: uid(), ...sc }); });
  const delSchedule = (id) => update((s) => { s.schedules = s.schedules.filter((x) => x.id !== id); });
  const enterSchedule = (sc) => update((s) => {
    s.transactions.unshift({ id: uid(), date: sc.nextDate, amount: sc.amount, categoryId: sc.categoryId, payee: sc.payee || sc.name, memo: "", scheduleId: sc.id });
    const i = s.schedules.findIndex((x) => x.id === sc.id);
    if (i > -1) s.schedules[i].nextDate = advanceDate(sc.nextDate, sc.freq);
  });

  const setLang = (l) => update((s) => { s.settings.lang = l; });
  const addAccount = (name, balance) => update((s) => { s.accounts.push({ id: uid(), name, balance }); });
  const editAccount = (id, name, balance) => update((s) => { const a = s.accounts.find((x) => x.id === id); if (a) { a.name = name; a.balance = balance; } });
  const delAccount = (id) => update((s) => { s.accounts = s.accounts.filter((x) => x.id !== id); });
  const dismissBackupNotice = () => update((s) => { s.settings.backupNoticeDismissed = true; });
  const clearAll = () => { if (confirm(t("clearAllConfirm"))) { setState(seedState()); flash(t("everyEuro")); } };

  /* ---- backup / restore ---- */
  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    download(blob, `kavatza-backup-${todayISO()}.json`);
  };
  const exportCSV = () => {
    const catName = (id) => id === null ? t("income") : (state.categories.find((c) => c.id === id)?.name || t("uncategorised"));
    const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const rows = [["Date", "Payee", "Category", "Memo", "Amount_EUR"]];
    [...state.transactions].sort((a, b) => a.date.localeCompare(b.date)).forEach((x) =>
      rows.push([x.date, esc(x.payee), esc(catName(x.categoryId)), esc(x.memo), x.amount.toFixed(2)]));
    const blob = new Blob([rows.map((r) => r.join(",")).join("\n")], { type: "text/csv" });
    download(blob, `kavatza-activity-${todayISO()}.csv`);
  };
  const onImport = (e) => {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        const obj = JSON.parse(r.result);
        if (!obj.categories || !obj.transactions || !obj.groups) throw new Error("bad");
        setState(withDefaults(obj)); flash(t("restored"));
      } catch { flash(t("badFile")); }
    };
    r.readAsText(f);
    e.target.value = "";
  };

  const groupsView = state.groups.map((g) => ({
    ...g, cats: state.categories.filter((c) => c.groupId === g.id),
  }));

  return (
    <div style={{ background: C.paper, minHeight: "100vh", display: "flex", justifyContent: "center", fontFamily: "'Commissioner', sans-serif", color: C.ink }}>
      <div style={{ width: "100%", maxWidth: 480, minHeight: "100vh", background: C.paper, position: "relative", paddingBottom: 96 }}>

        {tab === "budget" && (
          <BudgetScreen
            t={t} lang={lang} calc={calc} groupsView={groupsView} dispMonth={dispMonth}
            setDispMonth={setDispMonth} dueCount={dueSchedules.length}
            onCategory={(c) => setModal({ type: "assign", cat: c })}
            onManage={() => setModal({ type: "manage" })}
            onDue={() => setTab("more")}
            backupNotice={!state.settings.backupNoticeDismissed && typeof window !== "undefined" && !window.Capacitor?.isNativePlatform?.()}
            onDismissNotice={dismissBackupNotice}
          />
        )}
        {tab === "transactions" && (
          <TransactionsScreen t={t} lang={lang} state={state}
            onEdit={(tx) => setModal({ type: "tx", tx })} onDelete={delTx} />
        )}
        {tab === "accounts" && (
          <AccountsScreen t={t} accounts={state.accounts} onAdd={() => setModal({ type: "account", account: null })}
            onEdit={(a) => setModal({ type: "account", account: a })} />
        )}
        {tab === "reports" && <ReportsScreen t={t} lang={lang} state={state} dispMonth={dispMonth} />}
        {tab === "more" && (
          <MoreScreen
            t={t} lang={lang} state={state} due={dueSchedules}
            onEnterSchedule={enterSchedule} onDelSchedule={delSchedule}
            onNewSchedule={() => setModal({ type: "schedule" })}
            onManageCats={() => setModal({ type: "manage" })}
            onSetLang={setLang} onExportJSON={exportJSON} onExportCSV={exportCSV}
            onImport={() => fileRef.current?.click()} onClear={clearAll}
          />
        )}

        {/* FAB */}
        <button onClick={() => setModal({ type: "tx", tx: null })} aria-label={t("addTransaction")} style={{
          position: "fixed", bottom: "calc(78px + env(safe-area-inset-bottom))", right: "max(18px, calc(50% - 240px + 18px))",
          width: 58, height: 58, borderRadius: 18, border: "none", background: C.gold, color: C.vault,
          display: "grid", placeItems: "center", cursor: "pointer", zIndex: 30,
          boxShadow: "0 10px 20px rgba(0,0,0,.25)",
        }}><Plus size={26} /></button>

        {/* bottom nav */}
        <nav style={{
          position: "fixed", bottom: 0, left: 0, right: 0, display: "flex", justifyContent: "center",
          background: "rgba(255,255,255,.92)", backdropFilter: "blur(10px)", borderTop: `1px solid ${C.line}`,
          zIndex: 25, paddingBottom: "env(safe-area-inset-bottom)",
        }}>
          <div style={{ width: "100%", maxWidth: 480, display: "grid", gridTemplateColumns: "repeat(5,1fr)" }}>
            <NavBtn icon={Wallet} label={t("budget")} active={tab === "budget"} onClick={() => setTab("budget")} />
            <NavBtn icon={Receipt} label={t("transactions")} active={tab === "transactions"} onClick={() => setTab("transactions")} />
            <NavBtn icon={PiggyBank} label={t("accounts")} active={tab === "accounts"} onClick={() => setTab("accounts")} />
            <NavBtn icon={BarChart3} label={t("reports")} active={tab === "reports"} onClick={() => setTab("reports")} />
            <NavBtn icon={Settings} label={t("more")} active={tab === "more"} onClick={() => setTab("more")} badge={dueSchedules.length} />
          </div>
        </nav>

        {/* modals */}
        {modal?.type === "tx" && (
          <TxSheet t={t} state={state} initial={modal.tx} dispMonth={dispMonth}
            onClose={() => setModal(null)}
            onSave={(tx) => { modal.tx ? editTx(modal.tx.id, tx) : addTx(tx); setModal(null); }}
            onDelete={modal.tx ? () => { delTx(modal.tx.id); setModal(null); } : null} />
        )}
        {modal?.type === "assign" && (
          <AssignSheet t={t} cat={modal.cat} info={calc.byCat[modal.cat.id]} dispMonth={dispMonth} lang={lang}
            onClose={() => setModal(null)}
            onAssign={(amt) => { setAssigned(modal.cat.id, amt); }}
            onSetGoal={(goal) => setGoal(modal.cat.id, goal)} />
        )}
        {modal?.type === "manage" && (
          <ManageSheet t={t} groupsView={groupsView}
            onClose={() => setModal(null)}
            onAddCategory={addCategory} onRenameCategory={renameCategory} onDelCategory={delCategory}
            onAddGroup={addGroup} onRenameGroup={renameGroup} onDelGroup={delGroup} />
        )}
        {modal?.type === "schedule" && (
          <ScheduleSheet t={t} state={state} onClose={() => setModal(null)}
            onSave={(sc) => { addSchedule(sc); setModal(null); }} />
        )}
        {modal?.type === "account" && (
          <AccountSheet t={t} initial={modal.account} onClose={() => setModal(null)}
            onSave={(name, bal) => { modal.account ? editAccount(modal.account.id, name, bal) : addAccount(name, bal); setModal(null); }}
            onDelete={modal.account ? () => { delAccount(modal.account.id); setModal(null); } : null} />
        )}

        <input ref={fileRef} type="file" accept="application/json" onChange={onImport} style={{ display: "none" }} />

        {toast && (
          <div style={{
            position: "fixed", bottom: "calc(96px + env(safe-area-inset-bottom))", left: "50%", transform: "translateX(-50%)",
            background: C.ink, color: "#fff", padding: "11px 18px", borderRadius: 12, font: "600 14px 'Commissioner',sans-serif",
            zIndex: 60, animation: "toastIn .2s ease", maxWidth: 360, textAlign: "center",
          }}>{toast}</div>
        )}
      </div>
    </div>
  );
}

function NavBtn({ icon: Icon, label, active, onClick, badge }) {
  return (
    <button onClick={onClick} style={{
      background: "transparent", border: "none", cursor: "pointer", padding: "8px 0 10px",
      display: "flex", flexDirection: "column", alignItems: "center", gap: 4, position: "relative",
      color: active ? C.teal : C.muted,
    }}>
      <div style={{
        position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
        background: active ? C.tealSoft : "transparent", borderRadius: 14, padding: "5px 12px 4px",
      }}>
      <div style={{ position: "relative" }}>
        <Icon size={22} strokeWidth={active ? 2.4 : 2} />
        {badge > 0 && <span style={{
          position: "absolute", top: -5, right: -9, background: C.clay, color: "#fff", borderRadius: 9,
          minWidth: 16, height: 16, padding: "0 4px", font: "700 10px 'Commissioner',sans-serif",
          display: "grid", placeItems: "center",
        }}>{badge}</span>}
      </div>
      <span style={{ font: `${active ? 700 : 500} 10.5px 'Commissioner',sans-serif`, whiteSpace: "nowrap" }}>{label}</span>
      </div>
    </button>
  );
}

/* ======================== Budget screen ========================= */
function BudgetScreen({ t, lang, calc, groupsView, dispMonth, setDispMonth, onCategory, onManage, dueCount, onDue, backupNotice, onDismissNotice }) {
  const [collapsed, setCollapsed] = useState({});
  const toggleGroup = (id) => setCollapsed((c) => ({ ...c, [id]: !c[id] }));
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerYear, setPickerYear] = useState(() => parseInt(dispMonth.slice(0, 4)));
  const openPicker = () => { setPickerYear(parseInt(dispMonth.slice(0, 4))); setPickerOpen(true); };
  const monthShort = (i) => new Date(2000, i, 1).toLocaleDateString(lang === "el" ? "el-GR" : "en-GB", { month: "short" });
  const rta = calc.readyToAssign;
  const rtaState = Math.abs(rta) < 0.005 ? "zero" : rta > 0 ? "pos" : "neg";
  const msg = rtaState === "zero" ? t("allAssigned") : rtaState === "pos" ? t("moneyWaiting") : t("overAssigned");

  return (
    <div>
      <header style={{
        background: C.vault,
        padding: "calc(16px + env(safe-area-inset-top)) 18px 36px",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <img src="./mascot/mascot-circle.png" alt="" style={{ width: 38, height: 38, borderRadius: "50%", border: "2px solid " + C.gold, display: "block" }} />
            <span style={{
              fontFamily: "'Luckiest Guy',cursive", fontSize: 22, lineHeight: 1, paddingTop: 4, color: "#fff",
              textShadow: "-2px 0 0 #06211E,2px 0 0 #06211E,0 -2px 0 #06211E,0 2px 0 #06211E,-2px -2px 0 #06211E,2px -2px 0 #06211E,-2px 2px 0 #06211E,3px 3px 0 #06211E",
            }}>KABATZA</span>
          </span>
          <button onClick={onManage} style={{ ...iconBtn, background: C.gold, gap: 7, padding: "9px 16px", borderRadius: 100, boxShadow: "0 4px 12px rgba(0,0,0,.25)" }}>
            <span style={{ font: "800 12px 'Commissioner',sans-serif", color: "#12332E", textTransform: "uppercase", letterSpacing: ".04em" }}>{t("edit")}</span>
          </button>
        </div>

        {/* month nav */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 16 }}>
          <button onClick={() => setDispMonth(addMonthsKey(dispMonth, -1))} style={iconBtn} aria-label="previous month"><ChevronLeft size={22} color={C.coinDim} /></button>
          <button onClick={openPicker} style={{ ...iconBtn, gap: 5, minWidth: 150, justifyContent: "center" }}>
            <span style={{ font: "600 15px 'Commissioner',sans-serif", textTransform: "capitalize", color: C.coin }}>{monthLabel(dispMonth, lang)}</span>
            <ChevronDown size={15} color={C.coinDim} />
          </button>
          <button onClick={() => setDispMonth(addMonthsKey(dispMonth, 1))} style={iconBtn} aria-label="next month"><ChevronRight size={22} color={C.coinDim} /></button>
        </div>

        {pickerOpen && (
          <div onClick={() => setPickerOpen(false)} style={{
            position: "fixed", inset: 0, background: "rgba(21,32,43,.5)", zIndex: 55,
            display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
          }}>
            <div onClick={(e) => e.stopPropagation()} style={{
              background: C.card, borderRadius: 20, padding: "18px 16px", width: "100%", maxWidth: 320,
              boxShadow: "0 16px 48px rgba(21,32,43,.35)",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <button onClick={() => setPickerYear((y) => y - 1)} style={iconBtn}><ChevronLeft size={20} color={C.muted} /></button>
                <span style={{ font: "700 17px 'Poppins',sans-serif", color: C.ink }}>{pickerYear}</span>
                <button onClick={() => setPickerYear((y) => y + 1)} style={iconBtn}><ChevronRight size={20} color={C.muted} /></button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 6 }}>
                {Array.from({ length: 12 }, (_, i) => {
                  const mk = `${pickerYear}-${String(i + 1).padStart(2, "0")}`;
                  const sel = mk === dispMonth;
                  return (
                    <button key={i} onClick={() => { setDispMonth(mk); setPickerOpen(false); }} style={{
                      border: "none", cursor: "pointer", padding: "12px 0", borderRadius: 12, textTransform: "capitalize",
                      background: sel ? C.teal : "transparent",
                      font: `${sel ? 700 : 500} 14px 'Commissioner',sans-serif`,
                      color: sel ? "#fff" : C.ink,
                    }}>{monthShort(i)}</button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* the stash */}
        <div style={{ textAlign: "center" }}>
          <div style={{ font: "600 11px 'Commissioner',sans-serif", letterSpacing: ".1em", textTransform: "uppercase", color: C.coinDim }}>
            {t("readyToAssign")}
          </div>
          <div style={{
            font: "700 42px/1.05 'Poppins',sans-serif", letterSpacing: "-.02em", margin: "7px 0 3px",
            color: rtaState === "neg" ? "#F0A08F" : C.coin,
          }}>
            {money(rta)}
          </div>
          <div style={{ font: "500 13px 'Commissioner',sans-serif", color: rtaState === "neg" ? "#F0A08F" : C.coinDim }}>{msg}</div>
        </div>

        {/* assignment gauge */}
        {calc.totalIncome > 0.005 && (
          <div style={{ marginTop: 18 }}>
            <div style={{ height: 6, borderRadius: 4, background: "rgba(243,239,226,.16)", overflow: "hidden" }}>
              <div style={{
                width: `${Math.min(100, (calc.totalAssigned / calc.totalIncome) * 100)}%`, height: "100%",
                background: rtaState === "neg" ? "#F0A08F" : C.coin, borderRadius: 4,
                transition: "width .5s cubic-bezier(.22,1,.36,1)",
              }} />
            </div>
            <div style={{ font: "500 12px 'Commissioner',sans-serif", color: C.coinDim, marginTop: 7, textAlign: "center" }}>
              {t("assigned")} {money(calc.totalAssigned)} {t("ofWord")} {money(calc.totalIncome)}
            </div>
          </div>
        )}

        {dueCount > 0 && (
          <button onClick={onDue} style={{
            marginTop: 14, width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            background: "rgba(243,239,226,.12)", color: C.coin, border: "none", borderRadius: 12, padding: "11px",
            font: "600 14px 'Commissioner',sans-serif", cursor: "pointer",
          }}>
            <CalendarClock size={16} color="#E5C173" /> {dueCount} {t("dueNow")} →
          </button>
        )}
      </header>

      {/* the ledger sheet */}
      <div style={{
        background: C.paper, borderRadius: "22px 22px 0 0", marginTop: -22, position: "relative",
        padding: "20px 14px 0", minHeight: 320,
      }}>
        {backupNotice && (
          <div style={{
            display: "flex", gap: 10, alignItems: "flex-start", background: C.amberSoft,
            border: `1px solid ${C.amber}33`, borderRadius: 14, padding: "12px 14px", marginBottom: 14,
          }}>
            <AlertCircle size={17} color={C.amber} style={{ flexShrink: 0, marginTop: 1 }} />
            <div style={{ flex: 1 }}>
              <div style={{ font: "500 13px/1.45 'Commissioner',sans-serif", color: C.ink }}>{t("backupNotice")}</div>
              <div style={{ font: "500 13px/1.45 'Commissioner',sans-serif", color: C.ink, marginTop: 8 }}>{t("shortcutNotice")}</div>
              <button onClick={onDismissNotice} style={{
                marginTop: 8, border: "none", background: C.amber, color: "#fff", borderRadius: 9,
                padding: "7px 12px", font: "600 13px 'Commissioner',sans-serif", cursor: "pointer",
              }}>{t("gotIt")}</button>
            </div>
          </div>
        )}
        {groupsView.length === 0 && <Empty t={t} text={t("emptyBudget")} />}
        {groupsView.map((g) => {
          const gAssigned = g.cats.reduce((s, c) => s + calc.byCat[c.id].assigned, 0);
          return (
            <section key={g.id} style={{ marginBottom: 16 }}>
              <button onClick={() => toggleGroup(g.id)} style={{
                width: "100%", background: "transparent", border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 6px 8px",
              }}>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <ChevronRight size={15} color={C.muted} style={{ transform: collapsed[g.id] ? "none" : "rotate(90deg)", transition: "transform .15s" }} />
                  <h3 style={{ font: "600 13px 'Commissioner',sans-serif", letterSpacing: ".06em", textTransform: "uppercase", color: C.muted, margin: 0 }}>{g.name}</h3>
                </span>
                <span style={{ font: "600 13px 'Poppins',sans-serif", color: C.muted }}>{money(gAssigned)}</span>
              </button>
              {!collapsed[g.id] && (
              <div style={{ background: C.card, borderRadius: 16, overflow: "hidden", border: `1px solid ${C.line}` }}>
                {g.cats.length === 0 && <div style={{ padding: 16, color: C.muted, font: "500 14px 'Commissioner',sans-serif" }}>—</div>}
                {g.cats.map((c, i) => (
                  <CategoryRow key={c.id} t={t} cat={c} info={calc.byCat[c.id]}
                    last={i === g.cats.length - 1} onClick={() => onCategory(c)} dispMonth={dispMonth} />
                ))}
              </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}

function goalProgress(cat, info, dispMonth) {
  if (!cat.goal) return null;
  const tgt = cat.goal.target || 0;
  if (tgt <= 0) return null;
  if (cat.goal.type === "monthly") {
    return { pct: Math.min(1, info.assigned / tgt), have: info.assigned, target: tgt, kind: "monthly" };
  }
  // balance
  let needPerMonth = null;
  if (cat.goal.byDate) {
    const months = Math.max(1, monthsDiff(dispMonth, cat.goal.byDate));
    const remaining = Math.max(0, tgt - info.available);
    needPerMonth = remaining / months;
  }
  return { pct: Math.min(1, info.available / tgt), have: info.available, target: tgt, kind: "balance", needPerMonth };
}

function CategoryRow({ t, cat, info, last, onClick, dispMonth }) {
  const avail = info.available;
  const availColor = avail < -0.005 ? C.clay : avail > 0.005 ? C.green : C.muted;
  const spent = Math.max(0, -info.activity);   // outflow this month
  const over = spent > info.assigned + 0.005;
  const frac = info.assigned > 0.005 ? Math.min(1, spent / info.assigned) : (spent > 0.005 ? 1 : 0);
  const gp = goalProgress(cat, info, dispMonth);
  return (
    <button onClick={onClick} style={{
      width: "100%", textAlign: "left", background: "transparent", border: "none",
      borderBottom: last ? "none" : `1px solid ${C.line}`, padding: "13px 16px 12px", cursor: "pointer",
      display: "block",
    }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
        <div style={{ font: "600 15px 'Commissioner',sans-serif", color: C.ink, minWidth: 0, flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {cat.name} {gp && <Target size={12} color={C.amber} style={{ verticalAlign: "middle", marginLeft: 2 }} />}
        </div>
        <div style={{ font: "700 16px 'Poppins',sans-serif", color: availColor, flexShrink: 0 }}>{money(avail)}</div>
      </div>

      {/* envelope depletion: spent vs assigned */}
      <div style={{ marginTop: 9, height: 6, background: "#EBE8DB", borderRadius: 4, overflow: "hidden" }}>
        <div style={{
          width: `${frac * 100}%`, height: "100%", borderRadius: 4,
          background: over ? C.clay : C.gold, transition: "width .35s ease",
        }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, font: "500 12px 'Commissioner',sans-serif", color: over ? C.clay : C.muted, marginTop: 5 }}>
        <span>{money(spent)} {t("ofWord")} {money(info.assigned)}</span>
        {gp && (
          <span style={{ color: gp.pct >= 0.999 ? C.green : C.amber }}>
            {t("target")} {moneyShort(gp.have)}/{moneyShort(gp.target)}
          </span>
        )}
      </div>
    </button>
  );
}

function ScreenHead({ title, sub }) {
  return (
    <header style={{ background: C.vault, padding: "calc(18px + env(safe-area-inset-top)) 20px 36px" }}>
      <h1 style={{ font: "700 23px 'Commissioner',sans-serif", margin: 0, letterSpacing: "-.01em", color: C.coin }}>{title}</h1>
      {sub && <div style={{ font: "500 13px 'Commissioner',sans-serif", color: C.coinDim, marginTop: 4, textTransform: "capitalize" }}>{sub}</div>}
    </header>
  );
}
function Ledger({ children }) {
  return (
    <div style={{
      background: C.paper, borderRadius: "22px 22px 0 0", marginTop: -22, position: "relative",
      padding: "20px 14px 0", minHeight: 320,
    }}>{children}</div>
  );
}

function Empty({ t, text, hint, icon: Icon = Wallet }) {
  return (
    <div style={{ textAlign: "center", padding: "48px 24px", color: C.muted }}>
      <Icon size={40} color={C.line} style={{ marginBottom: 12 }} />
      <div style={{ font: "600 16px 'Commissioner',sans-serif", color: C.ink }}>{text}</div>
      {hint && <div style={{ font: "500 14px 'Commissioner',sans-serif", marginTop: 6 }}>{hint}</div>}
    </div>
  );
}

/* ======================== Accounts screen ======================== */
function AccountsScreen({ t, accounts, onAdd, onEdit }) {
  const total = accounts.reduce((s, a) => s + a.balance, 0);
  return (
    <div>
      <ScreenHead title={t("accounts")} />
      <Ledger>
        <div style={{
          background: C.card, border: `1px solid ${C.line}`, borderRadius: 16, padding: "16px 18px",
          display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14,
        }}>
          <span style={{ font: "600 14px 'Commissioner',sans-serif", color: C.muted }}>{t("totalSavings")}</span>
          <span style={{ font: "700 20px 'Poppins',sans-serif", color: C.ink }}>{money(total)}</span>
        </div>

        {accounts.length === 0 ? <Empty t={t} text={t("noAccounts")} hint={t("noAccountsHint")} icon={PiggyBank} /> : (
          <div style={{ background: C.card, borderRadius: 16, overflow: "hidden", border: `1px solid ${C.line}`, marginBottom: 14 }}>
            {accounts.map((a, i) => (
              <button key={a.id} onClick={() => onEdit(a)} style={{
                width: "100%", textAlign: "left", background: "transparent", border: "none", cursor: "pointer",
                borderBottom: i === accounts.length - 1 ? "none" : `1px solid ${C.line}`,
                padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
              }}>
                <span style={{ font: "600 15px 'Commissioner',sans-serif", color: C.ink }}>{a.name}</span>
                <span style={{ font: "700 16px 'Poppins',sans-serif", color: a.balance < 0 ? C.clay : C.ink }}>{money(a.balance)}</span>
              </button>
            ))}
          </div>
        )}

        <GhostBtn onClick={onAdd} color={C.ink}><Plus size={16} />{t("addAccount")}</GhostBtn>
        <div style={{ height: 12 }} />
      </Ledger>
    </div>
  );
}
function AccountSheet({ t, initial, onClose, onSave, onDelete }) {
  const [name, setName] = useState(initial?.name || "");
  const [bal, setBal] = useState(initial ? initial.balance.toString().replace(".", ",") : "");
  const valid = name.trim().length > 0 && !isNaN(parseAmount(bal || "0"));
  const submit = () => {
    const b = parseAmount(bal || "0");
    if (!name.trim() || isNaN(b)) return;
    onSave(name.trim(), b);
  };
  return (
    <Sheet title={initial ? t("edit") : t("addAccount")} onClose={onClose} t={t}>
      <Field label={t("accountName")}>
        <input value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} placeholder="—" autoFocus />
      </Field>
      <Field label={`${initial ? t("balance") : t("startingBalance")} (€)`}>
        <input inputMode="decimal" value={bal} onChange={(e) => setBal(e.target.value)} placeholder="0,00"
          style={{ ...inputStyle, font: "700 20px 'Poppins',sans-serif", textAlign: "right" }} />
      </Field>
      <PrimaryBtn onClick={submit} disabled={!valid}><Check size={18} />{t("save")}</PrimaryBtn>
      {onDelete && (
        <div style={{ marginTop: 10 }}>
          <button onClick={onDelete} style={{ width: "100%", padding: "13px", borderRadius: 12, border: "none", background: C.claySoft, color: C.clay, font: "600 15px 'Commissioner',sans-serif", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
            <Trash2 size={16} />{t("delete")}
          </button>
        </div>
      )}
    </Sheet>
  );
}

/* ===================== Transactions screen ====================== */
function TransactionsScreen({ t, lang, state, onEdit, onDelete }) {
  const catName = (id) => id === null ? t("income") : (state.categories.find((c) => c.id === id)?.name || t("uncategorised"));
  const txs = [...state.transactions].sort((a, b) => b.date.localeCompare(a.date) || 0);
  // group by date
  const groups = [];
  let cur = null;
  for (const x of txs) {
    if (!cur || cur.date !== x.date) { cur = { date: x.date, items: [] }; groups.push(cur); }
    cur.items.push(x);
  }
  const dfmt = (iso) => new Date(iso + "T00:00:00").toLocaleDateString(lang === "el" ? "el-GR" : "en-GB",
    { weekday: "short", day: "numeric", month: "short" });

  return (
    <div>
      <ScreenHead title={t("transactions")} />
      <Ledger>
      {txs.length === 0 ? <Empty t={t} text={t("noActivity")} hint={t("noActivityHint")} icon={Receipt} /> : (
        <div>
          {groups.map((grp) => {
            const dayOut = grp.items.reduce((sum, x) => sum + (x.amount < 0 ? x.amount : 0), 0);
            return (
            <div key={grp.date} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "6px 6px 8px" }}>
                <span style={{ font: "600 12px 'Commissioner',sans-serif", color: C.muted, textTransform: "uppercase", letterSpacing: ".05em" }}>{dfmt(grp.date)}</span>
                {dayOut < -0.005 && <span style={{ font: "600 12px 'Poppins',sans-serif", color: C.muted }}>{money(dayOut)}</span>}
              </div>
              <div style={{ background: C.card, borderRadius: 16, overflow: "hidden", border: `1px solid ${C.line}` }}>
                {grp.items.map((x, i) => {
                  const inflow = x.amount >= 0;
                  return (
                    <button key={x.id} onClick={() => onEdit(x)} style={{
                      width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "13px 14px",
                      background: "transparent", border: "none", borderBottom: i === grp.items.length - 1 ? "none" : `1px solid ${C.line}`,
                      cursor: "pointer", textAlign: "left",
                    }}>
                      <div style={{ width: 38, height: 38, borderRadius: 11, flexShrink: 0, display: "grid", placeItems: "center",
                        background: inflow ? C.goldSoft : C.claySoft }}>
                        {inflow ? <ArrowDownLeft size={18} color={C.vault} /> : <ArrowUpRight size={18} color={C.clay} />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ font: "600 15px 'Commissioner',sans-serif", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {x.payee || (inflow ? t("inflow") : t("outflow"))}
                        </div>
                        <div style={{ font: "500 12px 'Commissioner',sans-serif", color: C.muted, marginTop: 2 }}>{catName(x.categoryId)}</div>
                      </div>
                      <div style={{ font: "700 15px 'Poppins',sans-serif", color: inflow ? C.green : C.ink }}>
                        {inflow ? "+" : ""}{money(x.amount)}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );})}
        </div>
      )}
      </Ledger>
    </div>
  );
}

/* ======================== Reports screen ======================== */
function ReportsScreen({ t, lang, state, dispMonth }) {
  // spending by category, this month
  const spend = useMemo(() => {
    const map = {};
    state.transactions.forEach((x) => {
      if (x.categoryId && x.amount < 0 && monthKey(x.date) === dispMonth) {
        const name = state.categories.find((c) => c.id === x.categoryId)?.name || t("uncategorised");
        map[name] = (map[name] || 0) + Math.abs(x.amount);
      }
    });
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [state, dispMonth, t]);

  // income vs expense, last 6 months
  const trend = useMemo(() => {
    const out = [];
    for (let i = 5; i >= 0; i--) {
      const mk = addMonthsKey(dispMonth, -i);
      let inc = 0, exp = 0;
      state.transactions.forEach((x) => {
        if (monthKey(x.date) !== mk) return;
        if (x.amount > 0) inc += x.amount; else exp += -x.amount;
      });
      out.push({ name: shortMonth(mk, lang), income: Math.round(inc), expense: Math.round(exp) });
    }
    return out;
  }, [state, dispMonth, lang]);

  const palette = [C.teal, "#2A9D8F", C.amber, "#5B8C9E", "#9A6FB0", C.clay, "#3E7C59", "#C98B3A"];
  const totalSpend = spend.reduce((s, x) => s + x.value, 0);

  return (
    <div>
      <ScreenHead title={t("reports")} sub={monthLabel(dispMonth, lang)} />
      <Ledger>
      <div style={{ padding: "0 2px" }}>
        <Card>
          <CardTitle icon={BarChart3}>{t("spendingByCategory")}</CardTitle>
          {spend.length === 0 ? <MiniEmpty t={t} /> : (
            <>
              <div style={{ font: "700 26px 'Poppins',sans-serif", color: C.ink, margin: "2px 0 12px" }}>{money(totalSpend)}</div>
              <ResponsiveContainer width="100%" height={Math.max(140, spend.length * 38)}>
                <BarChart data={spend} layout="vertical" margin={{ left: 0, right: 16, top: 0, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" width={104} tick={{ fontSize: 12, fill: C.ink, fontFamily: "Inter" }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(v) => money(v)} cursor={{ fill: C.paper }}
                    contentStyle={{ borderRadius: 10, border: `1px solid ${C.line}`, fontFamily: "Inter", fontSize: 13 }} />
                  <Bar dataKey="value" radius={[0, 7, 7, 0]} barSize={20}>
                    {spend.map((e, i) => <Cell key={i} fill={palette[i % palette.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </>
          )}
        </Card>

        <Card>
          <CardTitle icon={BarChart3}>{t("incomeVsExpense")}</CardTitle>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={trend} margin={{ left: -10, right: 8, top: 8, bottom: 0 }} barGap={2}>
              <CartesianGrid vertical={false} stroke={C.line} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: C.muted, fontFamily: "Inter" }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v) => moneyShort(v)} tick={{ fontSize: 11, fill: C.muted, fontFamily: "Inter" }} axisLine={false} tickLine={false} width={56} />
              <Tooltip formatter={(v) => money(v)} cursor={{ fill: C.paper }}
                contentStyle={{ borderRadius: 10, border: `1px solid ${C.line}`, fontFamily: "Inter", fontSize: 13 }} />
              <Legend wrapperStyle={{ fontFamily: "Inter", fontSize: 12 }} />
              <Bar name={t("inflow")} dataKey="income" fill={C.teal} radius={[5, 5, 0, 0]} barSize={14} />
              <Bar name={t("outflow")} dataKey="expense" fill={C.clay} radius={[5, 5, 0, 0]} barSize={14} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
      </Ledger>
    </div>
  );
}
function Card({ children }) {
  return <div style={{ background: C.card, borderRadius: 18, border: `1px solid ${C.line}`, padding: 18, marginBottom: 16 }}>{children}</div>;
}
function CardTitle({ icon: Icon, children }) {
  return <div style={{ display: "flex", alignItems: "center", gap: 8, font: "600 15px 'Commissioner',sans-serif", color: C.ink, marginBottom: 6 }}>
    <Icon size={17} color={C.teal} />{children}
  </div>;
}
function MiniEmpty({ t }) {
  return <div style={{ padding: "26px 0", textAlign: "center", color: C.muted, font: "500 14px 'Commissioner',sans-serif" }}>{t("noActivity")}</div>;
}

/* ========================= More screen ========================== */
function MoreScreen({ t, lang, state, due, onEnterSchedule, onDelSchedule, onNewSchedule, onManageCats, onSetLang, onExportJSON, onExportCSV, onImport, onClear }) {
  const catName = (id) => id === null ? t("income") : (state.categories.find((c) => c.id === id)?.name || t("uncategorised"));
  const dfmt = (iso) => new Date(iso + "T00:00:00").toLocaleDateString(lang === "el" ? "el-GR" : "en-GB", { day: "numeric", month: "short", year: "numeric" });
  const freqLabel = { monthly: t("monthly"), weekly: t("weekly"), biweekly: t("biweekly"), yearly: t("yearly") };
  const dueIds = new Set(due.map((d) => d.id));
  const schedules = [...state.schedules].sort((a, b) => a.nextDate.localeCompare(b.nextDate));

  return (
    <div>
      <ScreenHead title={t("more")} />
      <Ledger>
      <div style={{ padding: "0 2px" }}>
        {/* Scheduled */}
        <Card>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <CardTitle icon={Repeat}>{t("recurring")}</CardTitle>
            <button onClick={onNewSchedule} style={{ ...iconBtn, background: C.tealSoft, padding: "7px 11px", gap: 6 }}>
              <Plus size={15} color={C.teal} /><span style={{ font: "600 13px 'Commissioner',sans-serif", color: C.teal }}>{t("schedule")}</span>
            </button>
          </div>
          {schedules.length === 0 ? (
            <div style={{ color: C.muted, font: "500 14px 'Commissioner',sans-serif", padding: "8px 0 4px" }}>{t("noScheduledHint")}</div>
          ) : schedules.map((s) => {
            const isDue = dueIds.has(s.id);
            const inflow = s.amount >= 0;
            return (
              <div key={s.id} style={{
                display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderTop: `1px solid ${C.line}`,
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ font: "600 15px 'Commissioner',sans-serif", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.name}</div>
                  <div style={{ font: "500 12px 'Commissioner',sans-serif", color: isDue ? C.amber : C.muted, marginTop: 2 }}>
                    {catName(s.categoryId)} · {freqLabel[s.freq]} · {dfmt(s.nextDate)}
                  </div>
                </div>
                <div style={{ font: "700 15px 'Poppins',sans-serif", color: inflow ? C.green : C.ink }}>{inflow ? "+" : ""}{money(s.amount)}</div>
                {isDue ? (
                  <button onClick={() => onEnterSchedule(s)} style={{ background: C.teal, color: "#fff", border: "none", borderRadius: 10, padding: "8px 12px", font: "600 13px 'Commissioner',sans-serif", cursor: "pointer" }}>{t("enter")}</button>
                ) : (
                  <button onClick={() => onDelSchedule(s.id)} style={iconBtn}><Trash2 size={17} color={C.muted} /></button>
                )}
              </div>
            );
          })}
        </Card>

        {/* Categories */}
        <Card>
          <button onClick={onManageCats} style={{ width: "100%", background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", padding: 0 }}>
            <CardTitle icon={Target}>{t("manageCats")}</CardTitle>
            <ChevronRight size={20} color={C.muted} />
          </button>
        </Card>

        {/* Backup */}
        <Card>
          <CardTitle icon={Download}>{t("dataBackup")}</CardTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 9, marginTop: 8 }}>
            <GhostBtn onClick={onExportJSON} color={C.ink}><Download size={16} />{t("exportJSON")}</GhostBtn>
            <GhostBtn onClick={onExportCSV} color={C.ink}><Receipt size={16} />{t("exportCSV")}</GhostBtn>
            <GhostBtn onClick={onImport} color={C.ink}><Upload size={16} />{t("importData")}</GhostBtn>
          </div>
        </Card>

        {/* Settings */}
        <Card>
          <CardTitle icon={Languages}>{t("language")}</CardTitle>
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            {[["en", "English"], ["el", "Ελληνικά"]].map(([code, label]) => (
              <button key={code} onClick={() => onSetLang(code)} style={{
                flex: 1, padding: "11px", borderRadius: 11, cursor: "pointer", font: "600 14px 'Commissioner',sans-serif",
                border: `1.5px solid ${lang === code ? C.teal : C.line}`,
                background: lang === code ? C.tealSoft : C.card, color: lang === code ? C.teal : C.muted,
              }}>{label}</button>
            ))}
          </div>
        </Card>

        <Card>
          <button onClick={onClear} style={{ width: "100%", background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 9, color: C.clay, font: "600 15px 'Commissioner',sans-serif", padding: "2px 0" }}>
            <RotateCcw size={18} />{t("clearAll")}
          </button>
        </Card>

        <div style={{ display: "flex", gap: 8, alignItems: "flex-start", padding: "4px 6px 20px", color: C.muted, font: "500 12px/1.5 'Commissioner',sans-serif" }}>
          <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
          <span>{t("install")}</span>
        </div>
      </div>
      </Ledger>
    </div>
  );
}

/* ===================== Transaction sheet ======================== */
function TxSheet({ t, state, initial, dispMonth, onClose, onSave, onDelete }) {
  const [inflow, setInflow] = useState(initial ? initial.amount >= 0 : false);
  const [amount, setAmount] = useState(initial ? Math.abs(initial.amount).toString().replace(".", ",") : "");
  const [catId, setCatId] = useState(initial ? initial.categoryId : (state.categories[0]?.id ?? null));
  // ponytail: income "categories" are labels stored in payee; categoryId stays null
  // so all zero-based math (Ready to assign) is untouched. Promote to real
  // categories only if income reports per source are ever needed.
  const SRC = ["srcSalary", "srcPension", "srcRents", "srcInvest"];
  const [src, setSrc] = useState(() => {
    if (initial && initial.categoryId === null) {
      const hit = SRC.find((k) => t(k) === initial.payee);
      if (hit) return hit;
    }
    return "srcSalary";
  });
  const [payee, setPayee] = useState(initial?.payee || "");
  const [memo, setMemo] = useState(initial?.memo || "");
  const [date, setDate] = useState(initial?.date || todayISO());

  const valid = !isNaN(parseAmount(amount)) && parseAmount(amount) > 0;

  const submit = () => {
    let amt = parseAmount(amount);
    if (isNaN(amt) || amt <= 0) return;
    onSave({
      date, amount: inflow ? Math.abs(amt) : -Math.abs(amt),
      categoryId: inflow ? null : catId,
      payee: inflow ? (payee.trim() || t(src)) : payee.trim(),
      memo: memo.trim(),
    });
  };

  return (
    <Sheet title={initial ? t("editTransaction") : t("newTransaction")} onClose={onClose} t={t}>
      {/* inflow / outflow toggle */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {[[false, t("outflow"), ArrowUpRight], [true, t("inflow"), ArrowDownLeft]].map(([val, label, Icon]) => (
          <button key={String(val)} onClick={() => setInflow(val)} style={{
            flex: 1, padding: "12px", borderRadius: 12, cursor: "pointer", font: "600 14px 'Commissioner',sans-serif",
            display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
            border: `1.5px solid ${inflow === val ? (val ? C.teal : C.ink) : C.line}`,
            background: inflow === val ? (val ? C.tealSoft : C.paper) : C.card,
            color: inflow === val ? (val ? C.teal : C.ink) : C.muted,
          }}><Icon size={16} />{label}</button>
        ))}
      </div>

      <Field label={`${t("amount")} (€)`}>
        <input inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0,00"
          style={{ ...inputStyle, font: "700 22px 'Poppins',sans-serif", textAlign: "right" }} autoFocus={!initial} />
      </Field>

      <Field label={t("category")}>
        {inflow ? (
          <select value={src} onChange={(e) => setSrc(e.target.value)}
            style={{ ...inputStyle, appearance: "none", backgroundColor: "#FBFCFC", backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2371796F' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'><path d='m6 9 6 6 6-6'/></svg>\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 13px center", paddingRight: 40 }}>
            {SRC.map((k) => <option key={k} value={k}>{t(k)}</option>)}
          </select>
        ) : (
          <select value={catId ?? state.categories[0]?.id ?? ""} onChange={(e) => setCatId(e.target.value)}
            style={{ ...inputStyle, appearance: "none", backgroundColor: "#FBFCFC", backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2371796F' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'><path d='m6 9 6 6 6-6'/></svg>\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 13px center", paddingRight: 40 }}>
            {state.groups.map((g) => (
              <optgroup key={g.id} label={g.name}>
                {state.categories.filter((c) => c.groupId === g.id).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </optgroup>
            ))}
          </select>
        )}
      </Field>

      <Field label={t("payee")}>
        <input value={payee} onChange={(e) => setPayee(e.target.value)} style={inputStyle} placeholder="—" />
      </Field>

      <div style={{ display: "flex", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <Field label={t("date")}>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={inputStyle} />
          </Field>
        </div>
      </div>

      <Field label={t("memo")}>
        <input value={memo} onChange={(e) => setMemo(e.target.value)} style={inputStyle} placeholder="—" />
      </Field>

      <PrimaryBtn onClick={submit} disabled={!valid}><Check size={18} />{t("save")}</PrimaryBtn>
      {onDelete && (
        <div style={{ marginTop: 10 }}>
          <button onClick={onDelete} style={{ width: "100%", padding: "13px", borderRadius: 12, border: "none", background: C.claySoft, color: C.clay, font: "600 15px 'Commissioner',sans-serif", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
            <Trash2 size={16} />{t("delete")}
          </button>
        </div>
      )}
    </Sheet>
  );
}

/* ======================== Assign sheet ========================== */
function AssignSheet({ t, cat, info, dispMonth, lang, onClose, onAssign, onSetGoal }) {
  const [amount, setAmount] = useState((info.assigned || 0).toString().replace(".", ","));
  const [goalType, setGoalType] = useState(cat.goal?.type || "none");
  const [goalTarget, setGoalTarget] = useState(cat.goal ? (cat.goal.target || "").toString().replace(".", ",") : "");
  const [goalDate, setGoalDate] = useState(cat.goal?.byDate || "");

  const apply = (amt) => { onAssign(amt); setAmount(amt.toString().replace(".", ",")); };

  const saveAll = () => {
    const amt = parseAmount(amount);
    if (!isNaN(amt)) onAssign(amt);
    if (goalType === "none") onSetGoal(null);
    else {
      const tg = parseAmount(goalTarget);
      onSetGoal({ type: goalType, target: isNaN(tg) ? 0 : tg, byDate: goalType === "balance" ? goalDate : "" });
    }
    onClose();
  };

  // quick fund suggestions
  const overspend = info.available < 0 ? Math.abs(info.available) : 0;
  const goalGap = cat.goal && cat.goal.type === "balance"
    ? Math.max(0, (cat.goal.target || 0) - info.available)
    : cat.goal && cat.goal.type === "monthly"
      ? Math.max(0, (cat.goal.target || 0) - info.assigned) : 0;

  return (
    <Sheet title={cat.name} onClose={onClose} t={t}>
      {/* status strip */}
      <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
        <Stat label={t("assigned")} value={money(info.assigned)} />
        <Stat label={t("activity")} value={money(info.activity)} />
        <Stat label={t("available")} value={money(info.available)} accent={info.available < 0 ? C.clay : info.available > 0 ? C.green : C.muted} />
      </div>

      <Field label={`${t("assignedThisMonth")} (€)`}>
        <input inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)}
          style={{ ...inputStyle, font: "700 22px 'Poppins',sans-serif", textAlign: "right" }} />
      </Field>

      {(overspend > 0.005 || goalGap > 0.005) && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
          {goalGap > 0.005 && (
            <Chip onClick={() => apply((parseAmount(amount) || 0) + Number(goalGap.toFixed(2)))}>
              {t("fundGoal")} +{money(goalGap)}
            </Chip>
          )}
          {overspend > 0.005 && (
            <Chip onClick={() => apply((parseAmount(amount) || 0) + Number(overspend.toFixed(2)))} color={C.clay} bg={C.claySoft}>
              {t("coverOverspend")} +{money(overspend)}
            </Chip>
          )}
        </div>
      )}

      {/* goal config */}
      <div style={{ borderTop: `1px solid ${C.line}`, paddingTop: 16, marginBottom: 16 }}>
        <label style={fieldLabel}>{t("setGoal")}</label>
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          {[["none", t("noGoal")], ["balance", t("balanceGoal")], ["monthly", t("monthlyGoal")]].map(([v, l]) => (
            <button key={v} onClick={() => setGoalType(v)} style={{
              flex: 1, padding: "10px 6px", borderRadius: 11, cursor: "pointer", font: "600 12.5px 'Commissioner',sans-serif",
              border: `1.5px solid ${goalType === v ? C.teal : C.line}`,
              background: goalType === v ? C.tealSoft : C.card, color: goalType === v ? C.teal : C.muted,
            }}>{l}</button>
          ))}
        </div>
        {goalType !== "none" && (
          <Field label={`${t("goalTarget")} (€)`}>
            <input inputMode="decimal" value={goalTarget} onChange={(e) => setGoalTarget(e.target.value)} style={inputStyle} placeholder="0,00" />
          </Field>
        )}
        {goalType === "balance" && (
          <Field label={t("byDate")}>
            <input type="month" value={goalDate} onChange={(e) => setGoalDate(e.target.value)} style={inputStyle} />
          </Field>
        )}
      </div>

      <PrimaryBtn onClick={saveAll}><Check size={18} />{t("save")}</PrimaryBtn>
    </Sheet>
  );
}
function Stat({ label, value, accent = C.ink }) {
  return (
    <div style={{ flex: 1, background: C.paper, borderRadius: 12, padding: "10px 8px", textAlign: "center" }}>
      <div style={{ font: "700 14px 'Poppins',sans-serif", color: accent }}>{value}</div>
      <div style={{ font: "500 10.5px 'Commissioner',sans-serif", color: C.muted, marginTop: 2, textTransform: "uppercase", letterSpacing: ".03em" }}>{label}</div>
    </div>
  );
}
function Chip({ children, onClick, color = C.teal, bg = C.tealSoft }) {
  return <button onClick={onClick} style={{ border: "none", background: bg, color, borderRadius: 10, padding: "9px 13px", font: "600 13px 'Commissioner',sans-serif", cursor: "pointer" }}>{children}</button>;
}

/* ====================== Manage categories ======================= */
function ManageSheet({ t, groupsView, onClose, onAddCategory, onRenameCategory, onDelCategory, onAddGroup, onRenameGroup, onDelGroup }) {
  const askAddCat = (g) => { const n = prompt(t("categoryName")); if (n && n.trim()) onAddCategory(g.id, n.trim()); };
  const askRenameCat = (c) => { const n = prompt(t("rename"), c.name); if (n && n.trim()) onRenameCategory(c.id, n.trim()); };
  const askDelCat = (c) => { if (confirm(t("deleteCatConfirm"))) onDelCategory(c.id); };
  const askAddGroup = () => { const n = prompt(t("groupName")); if (n && n.trim()) onAddGroup(n.trim()); };
  const askRenameGroup = (g) => { const n = prompt(t("rename"), g.name); if (n && n.trim()) onRenameGroup(g.id, n.trim()); };
  const askDelGroup = (g) => { if (confirm(t("deleteGroupConfirm"))) onDelGroup(g.id); };

  return (
    <Sheet title={t("manageCats")} onClose={onClose} t={t}>
      {groupsView.map((g) => (
        <div key={g.id} style={{ marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
            <span style={{ flex: 1, font: "600 13px 'Commissioner',sans-serif", letterSpacing: ".05em", textTransform: "uppercase", color: C.muted }}>{g.name}</span>
            <button onClick={() => askRenameGroup(g)} style={iconBtn}><Pencil size={15} color={C.muted} /></button>
            <button onClick={() => askDelGroup(g)} style={iconBtn}><Trash2 size={15} color={C.clay} /></button>
          </div>
          <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.line}`, overflow: "hidden" }}>
            {g.cats.map((c, i) => (
              <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 6, padding: "11px 14px", borderBottom: i === g.cats.length - 1 ? "none" : `1px solid ${C.line}` }}>
                <span style={{ flex: 1, font: "600 15px 'Commissioner',sans-serif" }}>{c.name} {c.goal && <Target size={12} color={C.amber} style={{ verticalAlign: "middle" }} />}</span>
                <button onClick={() => askRenameCat(c)} style={iconBtn}><Pencil size={15} color={C.muted} /></button>
                <button onClick={() => askDelCat(c)} style={iconBtn}><Trash2 size={15} color={C.clay} /></button>
              </div>
            ))}
            <button onClick={() => askAddCat(g)} style={{ width: "100%", padding: "11px", background: "transparent", border: "none", borderTop: g.cats.length ? `1px solid ${C.line}` : "none", color: C.teal, font: "600 14px 'Commissioner',sans-serif", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <Plus size={16} />{t("addCategory")}
            </button>
          </div>
        </div>
      ))}
      <GhostBtn onClick={askAddGroup} color={C.ink}><FolderPlus size={17} />{t("addGroup")}</GhostBtn>
    </Sheet>
  );
}

/* ====================== Schedule sheet ========================== */
function ScheduleSheet({ t, state, onClose, onSave }) {
  const [name, setName] = useState("");
  const [inflow, setInflow] = useState(false);
  const [amount, setAmount] = useState("");
  const [catId, setCatId] = useState(state.categories[0]?.id ?? "__income__");
  const [freq, setFreq] = useState("monthly");
  const [nextDate, setNextDate] = useState(todayISO());

  const incomeSelected = catId === "__income__";
  const valid = name.trim() && !isNaN(parseAmount(amount)) && parseAmount(amount) > 0;

  const submit = () => {
    const amt = parseAmount(amount); if (!valid) return;
    const isInc = incomeSelected || inflow;
    onSave({
      name: name.trim(), amount: isInc ? Math.abs(amt) : -Math.abs(amt),
      categoryId: incomeSelected ? null : catId, freq, nextDate, payee: name.trim(),
    });
  };

  return (
    <Sheet title={t("newSchedule")} onClose={onClose} t={t}>
      <Field label={t("name")}>
        <input value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} placeholder="—" autoFocus />
      </Field>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {[[false, t("outflow")], [true, t("inflow")]].map(([val, label]) => (
          <button key={String(val)} onClick={() => setInflow(val)} style={{
            flex: 1, padding: "12px", borderRadius: 12, cursor: "pointer", font: "600 14px 'Commissioner',sans-serif",
            border: `1.5px solid ${inflow === val ? (val ? C.teal : C.ink) : C.line}`,
            background: inflow === val ? (val ? C.tealSoft : C.paper) : C.card,
            color: inflow === val ? (val ? C.teal : C.ink) : C.muted,
          }}>{label}</button>
        ))}
      </div>
      <Field label={`${t("amount")} (€)`}>
        <input inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0,00"
          style={{ ...inputStyle, font: "700 20px 'Poppins',sans-serif", textAlign: "right" }} />
      </Field>
      <Field label={t("category")}>
        <select value={catId} onChange={(e) => { setCatId(e.target.value); if (e.target.value === "__income__") setInflow(true); }}
          style={{ ...inputStyle, appearance: "none", backgroundColor: "#FBFCFC", backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2371796F' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'><path d='m6 9 6 6 6-6'/></svg>\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 13px center", paddingRight: 40 }}>
          <option value="__income__">＋ {t("income")}</option>
          {state.groups.map((g) => (
            <optgroup key={g.id} label={g.name}>
              {state.categories.filter((c) => c.groupId === g.id).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </optgroup>
          ))}
        </select>
      </Field>
      <div style={{ display: "flex", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <Field label={t("frequency")}>
            <select value={freq} onChange={(e) => setFreq(e.target.value)} style={{ ...inputStyle, appearance: "none", backgroundColor: "#FBFCFC", backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2371796F' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'><path d='m6 9 6 6 6-6'/></svg>\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 13px center", paddingRight: 40 }}>
              <option value="monthly">{t("monthly")}</option>
              <option value="weekly">{t("weekly")}</option>
              <option value="biweekly">{t("biweekly")}</option>
              <option value="yearly">{t("yearly")}</option>
            </select>
          </Field>
        </div>
        <div style={{ flex: 1 }}>
          <Field label={t("nextDate")}>
            <input type="date" value={nextDate} onChange={(e) => setNextDate(e.target.value)} style={inputStyle} />
          </Field>
        </div>
      </div>
      <PrimaryBtn onClick={submit} disabled={!valid}><Check size={18} />{t("save")}</PrimaryBtn>
    </Sheet>
  );
}

/* --------------------------- utils ------------------------------ */
function download(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
}
