import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid, Legend,
} from "recharts";
import {
  Wallet, Plus, BarChart3, Settings, Repeat, Target, Download, Upload,
  ChevronLeft, ChevronRight, X, Pencil, Trash2, Check, ArrowDownLeft, ArrowUpRight,
  PiggyBank, Languages, Receipt, AlertCircle, FolderPlus, RotateCcw, CalendarClock,
  ArrowLeftRight, ArrowUpDown, Landmark,
} from "lucide-react";

/* ------------------------------------------------------------------ *
 * καβάτζα — a zero-based envelope budget for Greece (EUR).
 * Local-only. No accounts linked. Data lives on the device.
 * ------------------------------------------------------------------ */

const C = {
  ink: "#15202B",
  paper: "#EEF1F2",
  card: "#FFFFFF",
  teal: "#146E68",
  tealSoft: "#E3F0EE",
  amber: "#B9791C",
  amberSoft: "#FBF0DD",
  clay: "#C24B3F",
  claySoft: "#FAE5E2",
  muted: "#6A7681",
  line: "#E1E6E8",
  green: "#1C8A5B",
};

const STORE_KEY = "kavatza_state_v1";

/* ----------------------------- i18n ------------------------------ */
const STR = {
  en: {
    appName: "καβάτζα", tagline: "Give every euro a job",
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
    everyEuro: "every euro a job", restored: "Backup restored.", badFile: "That file isn't a valid καβάτζα backup.",
    uncategorised: "Uncategorised", thisMonth: "this month", needPerMonth: "/mo to reach by date",
    emptyBudget: "Add a category to start budgeting.", spent: "spent", received: "received",
    install: "Tip: keep a backup now and then via “Backup & restore”. Your data lives only on this device.",
    confirm: "Confirm", schedule: "Schedule", manageCats: "Categories & groups",
    move: "Move", moveMoney: "Move money", from: "From", to: "To", allAvailable: "All available",
    willGoNegative: "The source will go negative.", moved: "Moved", coverFromCategory: "From another category",
    targets: "Targets", monthTargets: "Targets for", scopeMonth: "This month only", scopeForward: "This month onward",
    spentSoFar: "So far", lastMonth: "Last month", avg3: "3-mo avg",
    targetsHint: "Each amount is assigned every month until you change it. Tap a spending figure to use it.",
    incomeSources: "Income sources", addSource: "Add source", sourceName: "Source name",
    deleteSourceConfirm: "Delete this source? Its income stays, without a source.", incomeBySource: "Income by source",
    leftovers: "Leftovers", noSource: "Income (no source)", allLeftovers: "All leftovers",
    monthTarget: "Monthly target", spentLabel: "Spent", savingsGoal: "Savings goal", goalThisMonth: "This month's goal",
    savings: "Savings", savingsAccounts: "Savings accounts", addAccount: "Add account", editAccount: "Edit account",
    accountName: "Account name", currentBalance: "Current balance", fromSavings: "From savings", toSavings: "To savings",
    account: "Account", assignTo: "Assign to", readyToAssignOpt: "Ready to assign (assign later)",
    exceedsBalance: "More than this account's balance.", noAccounts: "No savings accounts yet",
    noAccountsHint: "Add one to bring savings into your budget.", deletedAccount: "Deleted account",
    deleteAccountConfirm: "Delete this account? Its transfers stay in your activity.",
  },
  el: {
    appName: "καβάτζα", tagline: "Δώσε δουλειά σε κάθε ευρώ",
    budget: "Προϋπολογισμός", transactions: "Κινήσεις", reports: "Αναφορές", more: "Περισσότερα",
    readyToAssign: "Προς κατανομή", allAssigned: "Κάθε ευρώ έχει δουλειά",
    moneyWaiting: "περιμένουν κατανομή", overAssigned: "κατένειμες παραπάνω απ' όσα έχεις",
    assigned: "Κατανομή", activity: "Κίνηση", available: "Διαθέσιμα",
    income: "Έσοδο — Προς κατανομή", addMoney: "Προσθήκη χρημάτων",
    category: "Κατηγορία", payee: "Δικαιούχος / σημείωση", memo: "Σημείωση", amount: "Ποσό", date: "Ημ/νία",
    outflow: "Έξοδο", inflow: "Έσοδο", save: "Αποθήκευση", cancel: "Άκυρο", delete: "Διαγραφή",
    edit: "Επεξεργασία", done: "Τέλος", recurring: "Προγραμματισμένα", goals: "Στόχοι", settings: "Ρυθμίσεις",
    dataBackup: "Αντίγραφο & επαναφορά", exportJSON: "Εξαγωγή αντιγράφου (.json)",
    exportCSV: "Εξαγωγή κινήσεων (.csv)", importData: "Επαναφορά από αντίγραφο",
    language: "Γλώσσα", clearAll: "Διαγραφή όλων", clearAllConfirm:
      "Διαγραφή των πάντων και έναρξη από την αρχή; Δεν αναιρείται.",
    dueNow: "Λήγουν τώρα", enter: "Καταχώρηση", target: "Στόχος", toGo: "απομένουν", funded: "καλυμμένο",
    spendingByCategory: "Έξοδα αυτόν τον μήνα", incomeVsExpense: "Έσοδα vs έξοδα",
    noActivity: "Δεν υπάρχουν κινήσεις", noActivityHint: "Πάτησε + για την πρώτη σου κίνηση.",
    noScheduled: "Τίποτα προγραμματισμένο", noScheduledHint: "Πρόσθεσε πάγιο λογαριασμό ή μισθό.",
    addTransaction: "Προσθήκη κίνησης", newTransaction: "Νέα κίνηση", editTransaction: "Επεξεργασία κίνησης",
    assign: "Κατανομή", setGoal: "Στόχος", noGoal: "Χωρίς στόχο", balanceGoal: "Συγκέντρωση ποσού",
    monthlyGoal: "Μηνιαία κάλυψη", goalTarget: "Ποσό στόχου", byDate: "Μέχρι (προαιρετικό)",
    fundGoal: "Κάλυψη στόχου", coverOverspend: "Κάλυψη υπέρβασης", quickFund: "Γρήγορη κατανομή",
    assignedThisMonth: "Κατανομή αυτόν τον μήνα", addCategory: "Προσθήκη κατηγορίας", addGroup: "Προσθήκη ομάδας",
    rename: "Μετονομασία", groupName: "Όνομα ομάδας", categoryName: "Όνομα κατηγορίας",
    deleteCatConfirm: "Διαγραφή κατηγορίας; Οι κινήσεις της μένουν αλλά γίνονται χωρίς κατηγορία.",
    deleteGroupConfirm: "Διαγραφή ομάδας και όλων των κατηγοριών της;",
    newSchedule: "Νέο προγραμματισμένο", frequency: "Επανάληψη", monthly: "Μηνιαία", weekly: "Εβδομαδιαία",
    biweekly: "Κάθε 2 εβδομάδες", yearly: "Ετήσια", nextDate: "Επόμενη ημ/νία", name: "Όνομα",
    everyEuro: "κάθε ευρώ μια δουλειά", restored: "Το αντίγραφο επαναφέρθηκε.", badFile: "Μη έγκυρο αρχείο αντιγράφου καβάτζα.",
    uncategorised: "Χωρίς κατηγορία", thisMonth: "αυτόν τον μήνα", needPerMonth: "/μήνα για τον στόχο",
    emptyBudget: "Πρόσθεσε κατηγορία για να ξεκινήσεις.", spent: "ξοδεύτηκαν", received: "εισπράχθηκαν",
    install: "Συμβουλή: κράτα κάθε τόσο αντίγραφο από το «Αντίγραφο & επαναφορά» για ασφάλεια.",
    confirm: "Επιβεβαίωση", schedule: "Πρόγραμμα", manageCats: "Κατηγορίες & ομάδες",
    move: "Μεταφορά", moveMoney: "Μεταφορά χρημάτων", from: "Από", to: "Προς", allAvailable: "Όλο το διαθέσιμο",
    willGoNegative: "Η πηγή θα βγει αρνητική.", moved: "Μεταφέρθηκαν", coverFromCategory: "Από άλλη κατηγορία",
    targets: "Στόχοι", monthTargets: "Στόχοι για", scopeMonth: "Μόνο αυτόν τον μήνα", scopeForward: "Από αυτόν και μετά",
    spentSoFar: "Μέχρι τώρα", lastMonth: "Προηγ. μήνας", avg3: "Μ.Ο. 3μ",
    targetsHint: "Κάθε ποσό κατανέμεται κάθε μήνα μέχρι να το αλλάξεις. Πάτησε ένα ποσό εξόδων για να το χρησιμοποιήσεις.",
    incomeSources: "Πηγές εσόδων", addSource: "Νέα πηγή", sourceName: "Όνομα πηγής",
    deleteSourceConfirm: "Διαγραφή πηγής; Τα έσοδά της μένουν, χωρίς πηγή.", incomeBySource: "Έσοδα ανά πηγή",
    leftovers: "Περισσεύματα", noSource: "Έσοδο (χωρίς πηγή)", allLeftovers: "Όλα τα περισσεύματα",
    monthTarget: "Στόχος μήνα", spentLabel: "Έξοδα", savingsGoal: "Στόχος αποταμίευσης", goalThisMonth: "Στόχος μήνα",
    savings: "Αποταμίευση", savingsAccounts: "Λογαριασμοί αποταμίευσης", addAccount: "Νέος λογαριασμός", editAccount: "Επεξεργασία λογαριασμού",
    accountName: "Όνομα λογαριασμού", currentBalance: "Τρέχον υπόλοιπο", fromSavings: "Από αποταμίευση", toSavings: "Προς αποταμίευση",
    account: "Λογαριασμός", assignTo: "Κατανομή σε", readyToAssignOpt: "Προς κατανομή (αργότερα)",
    exceedsBalance: "Ξεπερνά το υπόλοιπο του λογαριασμού.", noAccounts: "Δεν υπάρχουν λογαριασμοί αποταμίευσης",
    noAccountsHint: "Πρόσθεσε έναν για να φέρνεις αποταμιεύσεις στον προϋπολογισμό.", deletedAccount: "Διαγραμμένος λογαριασμός",
    deleteAccountConfirm: "Διαγραφή λογαριασμού; Οι μεταφορές του μένουν στις κινήσεις.",
  },
};

/* --------------------------- helpers ----------------------------- */
const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
// Local-date formatting: toISOString() is UTC and shifts dates back a day in Greece (UTC+2/+3).
const fmtLocal = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const todayISO = () => fmtLocal(new Date());
const round2 = (n) => Math.round(n * 100) / 100;
const RTA = "__rta__";
const ALL = "__all__";                 // "all category leftovers" as a transfer source
const INC = "__income__";              // select value prefix: "__income__:<sourceId>"
const isInc = (v) => String(v).startsWith(INC);
const srcOf = (v) => String(v).split(":")[1] || null;
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
  return fmtLocal(d);
}
// Works with "YYYY-MM" (the goal's <input type="month">) and "YYYY-MM-DD".
function monthsDiff(fromMk, toDate) {
  const [fy, fm] = fromMk.split("-").map(Number);
  const [ty, tm] = toDate.slice(0, 7).split("-").map(Number);
  return (ty - fy) * 12 + (tm - fm);
}

/* Repeating assignment ("plan"): cat.plan = [{ from: "YYYY-MM", amount }], sorted.
   A month with no explicit assignment gets the last plan step starting on or before it. */
function planFor(plan, mk) {
  let v = 0;
  for (const st of plan || []) { if (st.from <= mk) v = st.amount; else break; }
  return v;
}
const setPlan = (plan, mk, amount) => [...(plan || []).filter((st) => st.from < mk), { from: mk, amount }];
// Old-style monthly target (v3/v4 saves), only used to migrate them into plans.
function targetFor(goal, mk) {
  let v = goal?.target || 0;
  for (const st of goal?.steps || []) { if (st.from <= mk) v = st.amount; else break; }
  return v;
}

// Savings-account goal: monthly amount to reach goal.target by goal.byDate, and what's still missing this month.
function accountNeed(acc, bal, inThisMonth, mk) {
  const g = acc.goal;
  if (!g?.target || !g.byDate) return null;
  const months = Math.max(1, monthsDiff(mk, g.byDate) + 1);
  const perMonth = Math.max(0, (g.target - (bal - inThisMonth)) / months);
  return { perMonth, left: Math.max(0, perMonth - inThisMonth) };
}

/* --------------------------- seed data --------------------------- */
function seedState() {
  const g1 = uid(), g2 = uid();
  const src = (name) => ({ id: uid(), name });
  const cat = (groupId, name) => ({ id: uid(), groupId, name, plan: [] });
  return {
    version: 5,
    settings: { lang: "el" },
    groups: [
      { id: g1, name: "Άμεσες υποχρεώσεις" },
      { id: g2, name: "Ποιότητα ζωής" },
    ],
    categories: [
      cat(g1, "Σούπερ μάρκετ"),
      cat(g1, "Ενοίκιο / δάνειο"),
      cat(g1, "Λογαριασμοί (ΔΕΗ/ΕΥΔΑΠ)"),
      cat(g1, "Κινητό & internet"),
      cat(g1, "Μετακινήσεις & καύσιμα"),
      cat(g2, "Φαγητό έξω"),
      cat(g2, "Διασκέδαση"),
      cat(g2, "Συνδρομές"),
    ],
    incomeSources: [src("Μισθός"), src("Ενοίκια"), src("Επενδύσεις"), src("Λοιπά έσοδα")],
    accounts: [],             // savings accounts (off-budget): { id, name, opening, goal?: { target, byDate } }
    assignments: {},          // { 'YYYY-MM': { catId: amount } }
    transactions: [],         // { id, date, amount, categoryId|null, sourceId?, payee, memo, scheduleId|null, accountId? }
                              // accountId set = savings transfer: +amount into budget (Ready to assign), −amount back to savings
    schedules: [],            // { id, name, amount, categoryId|null, freq, nextDate, payee }
  };
}

/* --------------------------- storage ----------------------------- */
/* Native build: data is stored on-device via the WebView's localStorage,
   which persists across app launches. Backups via JSON export are the
   portable safety net. */
function loadState() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return migrate(JSON.parse(raw));
  } catch { /* fall through */ }
  return seedState();
}
// Fill in keys missing from older saves/backups (v1 had no accounts).
// v3: category targets are monthly only — "build a balance" goals moved to savings accounts.
function migrate(obj) {
  const base = seedState();
  const s = { ...base, ...obj, settings: { ...base.settings, ...(obj.settings || {}) }, version: 5 };
  // v5: target merged into assignment — a monthly target becomes a repeating assignment from this month.
  // Old goals are parked in legacyGoal, never deleted.
  const nowMk = curMonth();
  s.categories = s.categories.map((c) => {
    if (c.plan || !c.goal) return { ...c, plan: c.plan || [] };
    const { goal, ...rest } = c;
    if (goal.type === "balance") return { ...rest, plan: [], legacyGoal: goal };
    const amt = targetFor(goal, nowMk);
    const later = (goal.steps || []).filter((st) => st.from > nowMk);
    return { ...rest, legacyGoal: goal, plan: [...(amt > 0 ? [{ from: nowMk, amount: amt }] : []), ...later] };
  });
  return s;
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
          <h2 style={{ font: "600 18px/1.2 'Inter', sans-serif", color: C.ink, margin: 0 }}>{title}</h2>
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
const fieldLabel = { display: "block", font: "600 12px/1 'Inter', sans-serif", color: C.muted, letterSpacing: ".04em", textTransform: "uppercase", marginBottom: 7 };
const inputStyle = {
  width: "100%", boxSizing: "border-box", padding: "13px 14px", borderRadius: 12, border: `1.5px solid ${C.line}`,
  font: "500 16px 'Inter', sans-serif", color: C.ink, background: "#FBFCFC", outline: "none",
};
function Field({ label, children }) {
  return <div style={{ marginBottom: 16 }}><label style={fieldLabel}>{label}</label>{children}</div>;
}
function PrimaryBtn({ children, onClick, color = C.teal, full = true, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width: full ? "100%" : "auto", padding: "14px 18px", borderRadius: 13, border: "none",
      background: disabled ? "#AEB7BD" : color, color: "#fff", font: "600 16px 'Inter', sans-serif",
      cursor: disabled ? "default" : "pointer", display: "inline-flex", alignItems: "center",
      justifyContent: "center", gap: 8,
    }}>{children}</button>
  );
}
function GhostBtn({ children, onClick, color = C.muted }) {
  return (
    <button onClick={onClick} style={{
      padding: "12px 16px", borderRadius: 12, border: `1.5px solid ${C.line}`, background: C.card,
      color, font: "600 15px 'Inter', sans-serif", cursor: "pointer", display: "inline-flex",
      alignItems: "center", justifyContent: "center", gap: 7,
    }}>{children}</button>
  );
}

function Dialog({ children, onClose }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(21,32,43,.45)", zIndex: 70, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 360, background: C.card, borderRadius: 18, padding: 18, boxShadow: "0 20px 60px rgba(21,32,43,.3)", animation: "sheetUp .18s ease" }}>{children}</div>
    </div>
  );
}
function PromptDialog({ t, title, label, initial = "", confirmText, onCancel, onSubmit }) {
  const [v, setV] = useState(initial);
  const ok = v.trim().length > 0;
  return (
    <Dialog onClose={onCancel}>
      <h3 style={{ font: "600 17px 'Inter',sans-serif", margin: "0 0 14px", color: C.ink }}>{title}</h3>
      {label && <label style={fieldLabel}>{label}</label>}
      <input autoFocus value={v} onChange={(e) => setV(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && ok) onSubmit(v.trim()); }} style={{ ...inputStyle, marginBottom: 16 }} />
      <div style={{ display: "flex", gap: 8 }}>
        <GhostBtn onClick={onCancel}>{t("cancel")}</GhostBtn>
        <div style={{ flex: 1 }}><PrimaryBtn onClick={() => ok && onSubmit(v.trim())} disabled={!ok}>{confirmText || t("save")}</PrimaryBtn></div>
      </div>
    </Dialog>
  );
}
function ConfirmDialog({ t, title, message, confirmText, onCancel, onConfirm }) {
  return (
    <Dialog onClose={onCancel}>
      {title && <h3 style={{ font: "600 17px 'Inter',sans-serif", margin: "0 0 8px", color: C.ink }}>{title}</h3>}
      <p style={{ font: "500 14px/1.5 'Inter',sans-serif", color: C.muted, margin: "0 0 16px" }}>{message}</p>
      <div style={{ display: "flex", gap: 8 }}>
        <GhostBtn onClick={onCancel}>{t("cancel")}</GhostBtn>
        <div style={{ flex: 1 }}><PrimaryBtn onClick={onConfirm} color={C.clay}>{confirmText || t("delete")}</PrimaryBtn></div>
      </div>
    </Dialog>
  );
}
// Two-or-three-way segmented control used across sheets.
function Segmented({ value, options, onChange }) {
  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
      {options.map(([v, label, Icon]) => (
        <button key={String(v)} onClick={() => onChange(v)} style={{
          flex: 1, padding: "11px 6px", borderRadius: 12, cursor: "pointer", font: "600 13.5px 'Inter',sans-serif",
          display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
          border: `1.5px solid ${value === v ? C.teal : C.line}`,
          background: value === v ? C.tealSoft : C.card, color: value === v ? C.teal : C.muted,
        }}>{Icon && <Icon size={16} />}{label}</button>
      ))}
    </div>
  );
}
const selectStyle = { ...inputStyle, appearance: "none", background: "#FBFCFC" };
// Income sources first (each one adds to Ready to assign), then spending categories.
function CategorySelect({ t, state, value, onChange }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} style={selectStyle}>
      <optgroup label={t("income")}>
        {value === INC && <option value={INC}>＋ {t("inflow")}</option>}
        {state.incomeSources.map((v) => <option key={v.id} value={`${INC}:${v.id}`}>＋ {v.name}</option>)}
      </optgroup>
      {state.groups.map((g) => (
        <optgroup key={g.id} label={g.name}>
          {state.categories.filter((c) => c.groupId === g.id).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </optgroup>
      ))}
    </select>
  );
}
const amountStyle = { ...inputStyle, font: "700 22px 'Space Grotesk',sans-serif", textAlign: "right" };
const toInput = (n) => (n ? String(round2(n)).replace(".", ",") : "");

/* =========================== main app =========================== */
export default function App() {
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
  // lang="el" makes uppercase labels drop the tonos (ΠΡΟΣ ΚΑΤΑΝΟΜΗ, not ΚΑΤΑΝΟΜΉ)
  useEffect(() => { document.documentElement.lang = lang; }, [lang]);

  const flash = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2600); };

  /* ---- derived budget math ---- */
  // One pass over transactions → per-category, per-month activity (was O(categories × transactions)).
  const calc = useMemo(() => {
    if (!state) return null;
    const { transactions, assignments, categories, accounts } = state;
    const act = {};               // catId -> { "YYYY-MM": sum }
    const accFlow = {};           // accountId -> sum of transfers into the budget
    const accIn = {};             // accountId -> paid into savings this calendar month
    const nowMk = curMonth();
    let totalIncome = 0;
    for (const x of transactions) {
      if (x.accountId) {
        accFlow[x.accountId] = (accFlow[x.accountId] || 0) + x.amount;
        if (monthKey(x.date) === nowMk) accIn[x.accountId] = (accIn[x.accountId] || 0) - x.amount;
      }
      if (x.categoryId === null) { totalIncome += x.amount; continue; }
      const mk = monthKey(x.date);
      const m = act[x.categoryId] || (act[x.categoryId] = {});
      m[mk] = (m[mk] || 0) + x.amount;
    }
    // Plans count up to the later of this month and the month being viewed,
    // so looking ahead shows what Ready to assign will be once those months are assigned.
    const horizon = dispMonth > nowMk ? dispMonth : nowMk;
    let totalAssigned = 0;

    const prev = [1, 2, 3].map((i) => addMonthsKey(dispMonth, -i));
    const byCat = {};
    for (const c of categories) {
      const a = act[c.id] || {};
      const months = new Set();
      for (const m in assignments) if (c.id in assignments[m]) months.add(m);
      if (c.plan?.length) for (let m = c.plan[0].from; m <= horizon; m = addMonthsKey(m, 1)) months.add(m);
      const assignedIn = (m) => assignments[m]?.[c.id] ?? planFor(c.plan, m);
      let available = 0;
      for (const m of months) {
        const v = assignedIn(m);
        totalAssigned += v;
        if (m <= dispMonth) available += v;
      }
      for (const m in a) if (m <= dispMonth) available += a[m];
      const hist = prev.filter((m) => m in a).map((m) => -a[m]);   // only months with activity count
      byCat[c.id] = {
        assigned: assignedIn(dispMonth),
        planned: planFor(c.plan, dispMonth),
        activity: a[dispMonth] || 0,
        available,
        spent: -(a[dispMonth] || 0),
        lastSpent: prev[0] in a ? -a[prev[0]] : null,
        avgSpent: hist.length ? hist.reduce((s, v) => s + v, 0) / hist.length : null,
      };
    }
    const accBal = {};
    const accNeed = {};
    for (const ac of accounts) {
      accBal[ac.id] = round2((ac.opening || 0) - (accFlow[ac.id] || 0));
      accNeed[ac.id] = accountNeed(ac, accBal[ac.id], accIn[ac.id] || 0, nowMk);
    }
    const savingsTotal = Object.values(accBal).reduce((s, v) => s + v, 0);
    return { readyToAssign: totalIncome - totalAssigned, byCat, totalIncome, accBal, accFlow, accNeed, savingsTotal };
  }, [state, dispMonth]);

  const dueSchedules = useMemo(() => {
    if (!state) return [];
    const today = todayISO();
    return state.schedules.filter((s) => s.nextDate <= today);
  }, [state]);

  if (!state || !calc) {
    return <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: C.paper, color: C.muted, font: "500 15px 'Inter',sans-serif" }}>…</div>;
  }

  /* ---- mutations ---- */
  const update = (fn) => setState((prev) => { const next = structuredClone(prev); fn(next); return next; });
  const monthAssign = (s) => s.assignments[dispMonth] || (s.assignments[dispMonth] = {});
  // Adjust this month's assignment relative to what's in effect (explicit, else the plan).
  const addAssigned = (s, cid, delta) => {
    const cur = s.assignments[dispMonth]?.[cid] ?? planFor(s.categories.find((c) => c.id === cid)?.plan, dispMonth);
    monthAssign(s)[cid] = round2(cur + delta);
  };

  const addTx = (tx) => update((s) => { s.transactions.unshift({ id: uid(), scheduleId: null, ...tx }); });
  const editTx = (id, tx) => update((s) => { const i = s.transactions.findIndex((x) => x.id === id); if (i > -1) s.transactions[i] = { ...s.transactions[i], ...tx }; });
  const delTx = (id) => update((s) => { s.transactions = s.transactions.filter((x) => x.id !== id); });

  const setAssigned = (catId, amount) => update((s) => { monthAssign(s)[catId] = round2(amount); });
  const moveMoney = (fromId, toId, amt) => update((s) => {
    if (fromId !== RTA) addAssigned(s, fromId, -amt);
    if (toId !== RTA) addAssigned(s, toId, amt);
  });

  const addCategory = (groupId, name) => update((s) => { s.categories.push({ id: uid(), groupId, name, plan: [] }); });
  const renameCategory = (id, name) => update((s) => { const c = s.categories.find((x) => x.id === id); if (c) c.name = name; });
  // scope "month": this month only (explicit). "forward": repeats every month from here until changed.
  const setAssignments = (entries, scope) => update((s) => {
    for (const { catId, amount } of entries) {
      if (scope === "month") { monthAssign(s)[catId] = amount; continue; }
      const c = s.categories.find((x) => x.id === catId); if (!c) continue;
      c.plan = setPlan(c.plan, dispMonth, amount);
      for (const m in s.assignments) if (m >= dispMonth) delete s.assignments[m][catId];
    }
  });
  const delCategory = (id) => update((s) => {
    s.categories = s.categories.filter((x) => x.id !== id);
    s.transactions.forEach((x) => { if (x.categoryId === id) x.categoryId = null; });
    for (const m in s.assignments) delete s.assignments[m][id];
    s.schedules.forEach((x) => { if (x.categoryId === id) x.categoryId = null; });
  });
  const addGroup = (name) => update((s) => { s.groups.push({ id: uid(), name }); });
  const addSource = (name) => update((s) => { s.incomeSources.push({ id: uid(), name }); });
  const renameSource = (id, name) => update((s) => { const x = s.incomeSources.find((v) => v.id === id); if (x) x.name = name; });
  const delSource = (id) => update((s) => {
    s.incomeSources = s.incomeSources.filter((v) => v.id !== id);
    s.schedules.forEach((x) => { if (x.sourceId === id) x.sourceId = null; });
  });
  const renameGroup = (id, name) => update((s) => { const g = s.groups.find((x) => x.id === id); if (g) g.name = name; });
  const delGroup = (id) => update((s) => {
    const catIds = s.categories.filter((c) => c.groupId === id).map((c) => c.id);
    s.groups = s.groups.filter((g) => g.id !== id);
    s.categories = s.categories.filter((c) => c.groupId !== id);
    s.transactions.forEach((x) => { if (catIds.includes(x.categoryId)) x.categoryId = null; });
    for (const m in s.assignments) for (const cid of catIds) delete s.assignments[m][cid];
    s.schedules.forEach((x) => { if (catIds.includes(x.categoryId)) x.categoryId = null; });
  });

  // savings accounts: balance = opening − transfers into the budget
  const saveAccount = (acc, balance) => update((s) => {
    const opening = round2(balance + (calc.accFlow[acc.id] || 0));
    const i = s.accounts.findIndex((x) => x.id === acc.id);
    if (i > -1) s.accounts[i] = { ...s.accounts[i], name: acc.name, goal: acc.goal, opening };
    else s.accounts.push({ id: acc.id, name: acc.name, goal: acc.goal, opening });
  });
  const delAccount = (id) => update((s) => { s.accounts = s.accounts.filter((x) => x.id !== id); });
  // tx.amount > 0: from savings into Ready to assign; `cat` assigns it straight on (this month).
  // tx.amount < 0: into savings; `cat` = RTA, a category's leftover, or ALL category leftovers.
  const saveTransfer = (id, tx, cat) => {
    const takes = tx.amount >= 0 || !cat || cat === RTA ? []
      : cat === ALL ? Object.entries(calc.byCat).filter(([, v]) => v.available > 0.005).map(([cid, v]) => [cid, v.available])
      : [[cat, -tx.amount]];
    update((s) => {
      const i = s.transactions.findIndex((x) => x.id === id);
      if (i > -1) s.transactions[i] = { ...s.transactions[i], ...tx };
      else s.transactions.unshift({ id: uid(), categoryId: null, scheduleId: null, payee: "", ...tx });
      if (cat && tx.amount > 0) addAssigned(s, cat, tx.amount);
      for (const [cid, amt] of takes) addAssigned(s, cid, -amt);
    });
  };

  const addSchedule = (sc) => update((s) => { s.schedules.push({ id: uid(), ...sc }); });
  const delSchedule = (id) => update((s) => { s.schedules = s.schedules.filter((x) => x.id !== id); });
  const enterSchedule = (sc) => update((s) => {
    s.transactions.unshift({ id: uid(), date: sc.nextDate, amount: sc.amount, categoryId: sc.categoryId, sourceId: sc.sourceId || null, payee: sc.payee || sc.name, memo: "", scheduleId: sc.id });
    const i = s.schedules.findIndex((x) => x.id === sc.id);
    if (i > -1) s.schedules[i].nextDate = advanceDate(sc.nextDate, sc.freq);
  });

  const setLang = (l) => update((s) => { s.settings.lang = l; });
  const clearAll = () => { setState(seedState()); flash(t("everyEuro")); };

  const accName = (id) => state.accounts.find((a) => a.id === id)?.name || t("deletedAccount");
  const txLabel = (x) => x.accountId
    ? `${x.amount >= 0 ? t("fromSavings") : t("toSavings")}: ${accName(x.accountId)}`
    : x.categoryId === null ? (state.incomeSources.find((v) => v.id === x.sourceId)?.name || t("noSource"))
    : (state.categories.find((c) => c.id === x.categoryId)?.name || t("uncategorised"));

  /* ---- backup / restore ---- */
  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    download(blob, `kavatza-backup-${todayISO()}.json`);
  };
  const exportCSV = () => {
    const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const rows = [["Date", "Payee", "Category", "Memo", "Amount_EUR"]];
    [...state.transactions].sort((a, b) => a.date.localeCompare(b.date)).forEach((x) =>
      rows.push([x.date, esc(x.payee), esc(txLabel(x)), esc(x.memo), x.amount.toFixed(2)]));
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
        setState(migrate(obj)); flash(t("restored"));
      } catch { flash(t("badFile")); }
    };
    r.readAsText(f);
    e.target.value = "";
  };

  const groupsView = state.groups.map((g) => ({
    ...g, cats: state.categories.filter((c) => c.groupId === g.id),
  }));

  return (
    <div style={{ background: C.paper, minHeight: "100vh", display: "flex", justifyContent: "center", fontFamily: "'Inter', sans-serif", color: C.ink }}>
      <div style={{ width: "100%", maxWidth: 480, minHeight: "100vh", background: C.paper, position: "relative", paddingTop: "env(safe-area-inset-top)", paddingBottom: 96 }}>

        {tab === "budget" && (
          <BudgetScreen
            t={t} lang={lang} calc={calc} groupsView={groupsView} dispMonth={dispMonth}
            setDispMonth={setDispMonth} dueCount={dueSchedules.length} hasAccounts={state.accounts.length > 0} accounts={state.accounts}
            onSaveTo={(acc) => setModal({ type: "savings", dir: "out", accountId: acc.id, amount: calc.accNeed[acc.id]?.left })}
            onCategory={(c) => setModal({ type: "assign", catId: c.id })}
            onManage={() => setModal({ type: "manage" })}
            onDue={() => setTab("more")}
            onTargets={() => setModal({ type: "targets" })}
            onMove={() => setModal({ type: "move" })}
            onSavings={() => setModal({ type: "savings" })}
          />
        )}
        {tab === "transactions" && (
          <TransactionsScreen t={t} lang={lang} state={state} txLabel={txLabel}
            onEdit={(tx) => setModal(tx.accountId ? { type: "savings", tx } : { type: "tx", tx })} />
        )}
        {tab === "reports" && <ReportsScreen t={t} lang={lang} state={state} dispMonth={dispMonth} setDispMonth={setDispMonth} />}
        {tab === "more" && (
          <MoreScreen
            t={t} lang={lang} state={state} due={dueSchedules} calc={calc} txLabel={txLabel}
            onAccount={(acc) => setModal({ type: "account", acc })}
            onSavings={() => setModal({ type: "savings" })}
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
          width: 58, height: 58, borderRadius: 20, border: "none", background: C.ink, color: "#fff",
          display: "grid", placeItems: "center", cursor: "pointer", zIndex: 30,
          boxShadow: "0 8px 24px rgba(21,32,43,.32)",
        }}><Plus size={26} /></button>

        {/* bottom nav */}
        <nav style={{
          position: "fixed", bottom: 0, left: 0, right: 0, display: "flex", justifyContent: "center",
          background: "rgba(255,255,255,.92)", backdropFilter: "blur(10px)", borderTop: `1px solid ${C.line}`,
          zIndex: 25, paddingBottom: "env(safe-area-inset-bottom)",
        }}>
          <div style={{ width: "100%", maxWidth: 480, display: "grid", gridTemplateColumns: "repeat(4,1fr)" }}>
            <NavBtn icon={Wallet} label={t("budget")} active={tab === "budget"} onClick={() => setTab("budget")} />
            <NavBtn icon={Receipt} label={t("transactions")} active={tab === "transactions"} onClick={() => setTab("transactions")} />
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
        {modal?.type === "assign" && (() => {
          const cat = state.categories.find((c) => c.id === modal.catId);
          if (!cat) return null;
          return (
            <AssignSheet t={t} cat={cat} info={calc.byCat[cat.id]} dispMonth={dispMonth} lang={lang}
              hasAccounts={state.accounts.length > 0}
              onClose={() => setModal(null)}
              onAssign={(amt) => setAssigned(cat.id, amt)}
              onSetAmount={(amt, scope) => setAssignments([{ catId: cat.id, amount: amt }], scope)}
              onMove={(preset) => setModal({ type: "move", ...preset, back: modal })}
              onFromSavings={(preset) => setModal({ type: "savings", ...preset, back: modal })} />
          );
        })()}
        {modal?.type === "move" && (
          <MoveSheet t={t} groupsView={groupsView} calc={calc} preset={modal}
            onClose={() => setModal(modal.back || null)}
            onMove={(from, to, amt) => { moveMoney(from, to, amt); flash(`${t("moved")} ${money(amt)}`); setModal(modal.back || null); }} />
        )}
        {modal?.type === "targets" && (
          <TargetsSheet t={t} lang={lang} groupsView={groupsView} calc={calc} dispMonth={dispMonth}
            onClose={() => setModal(null)}
            onSave={(entries, scope) => { setAssignments(entries, scope); setModal(null); }} />
        )}
        {modal?.type === "savings" && (
          <SavingsSheet t={t} lang={lang} state={state} calc={calc} groupsView={groupsView} preset={modal} dispMonth={dispMonth}
            onClose={() => setModal(modal.back || null)}
            onAddAccount={() => setModal({ type: "account", back: modal })}
            onSave={(tx, catId) => { saveTransfer(modal.tx?.id, tx, catId); setModal(modal.back || null); }}
            onDelete={modal.tx ? () => { delTx(modal.tx.id); setModal(null); } : null} />
        )}
        {modal?.type === "account" && (
          <AccountSheet t={t} initial={modal.acc} balance={modal.acc ? calc.accBal[modal.acc.id] : 0}
            onClose={() => setModal(modal.back || null)}
            onSave={(acc, bal) => { saveAccount(acc, bal); setModal(modal.back || null); }}
            onDelete={modal.acc ? () => { delAccount(modal.acc.id); setModal(null); } : null} />
        )}
        {modal?.type === "manage" && (
          <ManageSheet t={t} groupsView={groupsView}
            onClose={() => setModal(null)}
            onAddCategory={addCategory} onRenameCategory={renameCategory} onDelCategory={delCategory}
            onAddGroup={addGroup} onRenameGroup={renameGroup} onDelGroup={delGroup}
            sources={state.incomeSources} onAddSource={addSource} onRenameSource={renameSource} onDelSource={delSource} />
        )}
        {modal?.type === "schedule" && (
          <ScheduleSheet t={t} state={state} onClose={() => setModal(null)}
            onSave={(sc) => { addSchedule(sc); setModal(null); }} />
        )}

        <input ref={fileRef} type="file" accept="application/json" onChange={onImport} style={{ display: "none" }} />

        {toast && (
          <div style={{
            position: "fixed", bottom: "calc(96px + env(safe-area-inset-bottom))", left: "50%", transform: "translateX(-50%)",
            background: C.ink, color: "#fff", padding: "11px 18px", borderRadius: 12, font: "600 14px 'Inter',sans-serif",
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
      background: "transparent", border: "none", cursor: "pointer", padding: "10px 0 12px",
      display: "flex", flexDirection: "column", alignItems: "center", gap: 4, position: "relative",
      color: active ? C.teal : C.muted,
    }}>
      <div style={{ position: "relative" }}>
        <Icon size={22} strokeWidth={active ? 2.4 : 2} />
        {badge > 0 && <span style={{
          position: "absolute", top: -5, right: -9, background: C.clay, color: "#fff", borderRadius: 9,
          minWidth: 16, height: 16, padding: "0 4px", font: "700 10px 'Inter',sans-serif",
          display: "grid", placeItems: "center",
        }}>{badge}</span>}
      </div>
      <span style={{ font: `${active ? 600 : 500} 11px 'Inter',sans-serif` }}>{label}</span>
    </button>
  );
}

function MonthNav({ lang, dispMonth, setDispMonth, small }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: small ? "flex-start" : "center", gap: small ? 4 : 14, margin: small ? "4px 0 0 -8px" : "0 0 14px" }}>
      <button onClick={() => setDispMonth(addMonthsKey(dispMonth, -1))} aria-label="‹" style={iconBtn}><ChevronLeft size={small ? 20 : 22} color={C.ink} /></button>
      <span style={{ font: `600 ${small ? 14 : 16}px 'Inter',sans-serif`, minWidth: small ? 120 : 150, textAlign: "center", textTransform: "capitalize" }}>
        {monthLabel(dispMonth, lang)}
      </span>
      <button onClick={() => setDispMonth(addMonthsKey(dispMonth, 1))} aria-label="›" style={iconBtn}><ChevronRight size={small ? 20 : 22} color={C.ink} /></button>
    </div>
  );
}

/* ======================== Budget screen ========================= */
function BudgetScreen({ t, lang, calc, groupsView, dispMonth, setDispMonth, onCategory, onManage, dueCount, onDue, onTargets, onMove, onSavings, hasAccounts, accounts, onSaveTo }) {
  const rta = calc.readyToAssign;
  const rtaState = Math.abs(rta) < 0.005 ? "zero" : rta > 0 ? "pos" : "neg";
  const bg = rtaState === "zero" ? C.tealSoft : rtaState === "pos" ? C.teal : C.claySoft;
  const fg = rtaState === "pos" ? "#fff" : rtaState === "neg" ? C.clay : C.teal;
  const msg = rtaState === "zero" ? t("allAssigned") : rtaState === "pos" ? t("moneyWaiting") : t("overAssigned");

  return (
    <div>
      <header style={{ padding: "20px 18px 12px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <PiggyBank size={22} color={C.teal} />
            <span style={{ font: "700 19px 'Inter',sans-serif", letterSpacing: "-.01em" }}>{t("appName")}</span>
          </div>
          <button onClick={onManage} style={{ ...iconBtn, border: `1.5px solid ${C.line}`, background: C.card, gap: 6, padding: "8px 12px" }}>
            <Pencil size={15} color={C.muted} /><span style={{ font: "600 13px 'Inter',sans-serif", color: C.muted }}>{t("edit")}</span>
          </button>
        </div>

        <MonthNav lang={lang} dispMonth={dispMonth} setDispMonth={setDispMonth} />

        {/* signature: Ready to assign */}
        <div style={{
          background: bg, borderRadius: 18, padding: "18px 20px", textAlign: "center",
          animation: rtaState === "pos" ? "pulseGlow 2.6s ease-in-out infinite" : "none",
          border: rtaState === "zero" ? `1.5px solid ${C.teal}33` : "none",
        }}>
          <div style={{ font: "600 11px 'Inter',sans-serif", letterSpacing: ".08em", textTransform: "uppercase", color: fg, opacity: .85 }}>
            {t("readyToAssign")}
          </div>
          <div style={{ font: "700 38px/1.05 'Space Grotesk',sans-serif", color: fg, margin: "6px 0 2px", letterSpacing: "-.02em" }}>
            {money(rta)}
          </div>
          <div style={{ font: "500 13px 'Inter',sans-serif", color: fg, opacity: .85 }}>{msg}</div>
        </div>

        {/* budget actions */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginTop: 10 }}>
          <ActionBtn icon={Target} label={t("targets")} onClick={onTargets} />
          <ActionBtn icon={ArrowLeftRight} label={t("move")} onClick={onMove} />
          <ActionBtn icon={Landmark} label={t("savings")} sub={hasAccounts ? moneyShort(calc.savingsTotal) : null} onClick={onSavings} />
        </div>

        {dueCount > 0 && (
          <button onClick={onDue} style={{
            marginTop: 12, width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            background: C.amberSoft, color: C.amber, border: "none", borderRadius: 12, padding: "11px",
            font: "600 14px 'Inter',sans-serif", cursor: "pointer",
          }}>
            <CalendarClock size={17} /> {dueCount} {t("dueNow")} →
          </button>
        )}
      </header>

      {/* categories */}
      <div style={{ padding: "4px 14px 0" }}>
        {groupsView.length === 0 && <Empty t={t} text={t("emptyBudget")} />}
        {groupsView.map((g) => {
          const gAssigned = g.cats.reduce((s, c) => s + calc.byCat[c.id].assigned, 0);
          return (
            <section key={g.id} style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", padding: "4px 6px 8px" }}>
                <h3 style={{ font: "600 13px 'Inter',sans-serif", letterSpacing: ".06em", textTransform: "uppercase", color: C.muted, margin: 0 }}>{g.name}</h3>
                <span style={{ font: "600 13px 'Space Grotesk',sans-serif", color: C.muted }}>{money(gAssigned)}</span>
              </div>
              <div style={{ background: C.card, borderRadius: 16, overflow: "hidden", border: `1px solid ${C.line}` }}>
                {g.cats.length === 0 && <div style={{ padding: 16, color: C.muted, font: "500 14px 'Inter',sans-serif" }}>—</div>}
                {g.cats.map((c, i) => (
                  <CategoryRow key={c.id} t={t} cat={c} info={calc.byCat[c.id]}
                    last={i === g.cats.length - 1} onClick={() => onCategory(c)} dispMonth={dispMonth} />
                ))}
              </div>
            </section>
          );
        })}

        {/* savings goals live on the accounts; tap to pay in this month's share */}
        {accounts.length > 0 && (
          <section style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", padding: "4px 6px 8px" }}>
              <h3 style={{ font: "600 13px 'Inter',sans-serif", letterSpacing: ".06em", textTransform: "uppercase", color: C.muted, margin: 0 }}>{t("savings")}</h3>
              <span style={{ font: "600 13px 'Space Grotesk',sans-serif", color: C.muted }}>{money(calc.savingsTotal)}</span>
            </div>
            <div style={{ background: C.card, borderRadius: 16, overflow: "hidden", border: `1px solid ${C.line}` }}>
              {accounts.map((a, i) => (
                <AccountRow key={a.id} t={t} acc={a} bal={calc.accBal[a.id]} need={calc.accNeed[a.id]} pad divider={i > 0} onClick={() => onSaveTo(a)} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function ActionBtn({ icon: Icon, label, sub, onClick }) {
  return (
    <button onClick={onClick} style={{
      background: C.card, border: `1px solid ${C.line}`, borderRadius: 14, padding: "10px 4px", cursor: "pointer",
      display: "flex", flexDirection: "column", alignItems: "center", gap: 3, color: C.ink,
    }}>
      <Icon size={18} color={C.teal} />
      <span style={{ font: "600 12.5px 'Inter',sans-serif" }}>{label}</span>
      {sub && <span style={{ font: "600 11px 'Space Grotesk',sans-serif", color: C.muted }}>{sub}</span>}
    </button>
  );
}

function ProgressBar({ pct, color }) {
  return (
    <div style={{ height: 5, background: C.paper, borderRadius: 4, overflow: "hidden" }}>
      <div style={{ width: `${Math.max(0, Math.min(1, pct)) * 100}%`, height: "100%", background: color, borderRadius: 4, transition: "width .3s" }} />
    </div>
  );
}

function AccountRow({ t, acc, bal, need, onClick, pad, divider = true }) {
  const g = acc.goal;
  return (
    <button onClick={onClick} style={{
      width: "100%", display: "block", textAlign: "left", background: "transparent", cursor: "pointer",
      border: "none", borderTop: divider ? `1px solid ${C.line}` : "none", padding: pad ? "13px 16px" : "12px 0",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ flex: 1, minWidth: 0, font: "600 15px 'Inter',sans-serif", color: C.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {acc.name} {g?.target > 0 && <Target size={12} color={C.amber} style={{ verticalAlign: "middle" }} />}
        </span>
        <span style={{ font: "700 16px 'Space Grotesk',sans-serif", color: C.ink }}>{money(bal)}</span>
      </div>
      {g?.target > 0 && (
        <div style={{ marginTop: 9 }}>
          <ProgressBar pct={bal / g.target} color={bal >= g.target - 0.005 ? C.green : C.amber} />
          <div style={{ font: "500 11px 'Inter',sans-serif", color: C.muted, marginTop: 4 }}>
            {money(bal)} / {money(g.target)}
            {need && need.perMonth > 0.005 && <> · {money(need.perMonth)} {t("needPerMonth")}</>}
          </div>
        </div>
      )}
    </button>
  );
}

function CategoryRow({ t, cat, info, last, onClick }) {
  const avail = info.available;
  const availColor = avail < -0.005 ? C.clay : avail > 0.005 ? C.green : C.muted;
  const spent = Math.max(0, info.spent);
  // bar: spending against what the category had to spend this month (available + spent)
  const base = Math.max(0, info.available + spent);
  const over = info.available < -0.005;
  return (
    <button onClick={onClick} style={{
      width: "100%", textAlign: "left", background: "transparent", border: "none",
      borderBottom: last ? "none" : `1px solid ${C.line}`, padding: "13px 16px", cursor: "pointer",
      display: "block",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ font: "600 15px 'Inter',sans-serif", color: C.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {cat.name} {info.planned > 0 && <Repeat size={12} color={C.teal} style={{ verticalAlign: "middle", marginLeft: 2 }} />}
          </div>
          <div style={{ font: "500 12px 'Inter',sans-serif", color: C.muted, marginTop: 3 }}>
            {t("assigned")} {money(info.assigned)} · {t("activity")} {money(info.activity)}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ font: "700 16px 'Space Grotesk',sans-serif", color: availColor }}>{money(avail)}</div>
          <div style={{ font: "500 11px 'Inter',sans-serif", color: C.muted }}>{t("available")}</div>
        </div>
      </div>
      {(base > 0.005 || spent > 0.005) && (
        <div style={{ marginTop: 9 }}>
          <ProgressBar pct={base > 0.005 ? spent / base : 1} color={over ? C.clay : C.teal} />
          <div style={{ font: "500 11px 'Inter',sans-serif", color: over ? C.clay : C.muted, marginTop: 4 }}>
            {t("spentLabel")} {money(spent)} / {money(base)}
          </div>
        </div>
      )}
    </button>
  );
}

function Empty({ t, text, hint, icon: Icon = Wallet }) {
  return (
    <div style={{ textAlign: "center", padding: "48px 24px", color: C.muted }}>
      <Icon size={40} color={C.line} style={{ marginBottom: 12 }} />
      <div style={{ font: "600 16px 'Inter',sans-serif", color: C.ink }}>{text}</div>
      {hint && <div style={{ font: "500 14px 'Inter',sans-serif", marginTop: 6 }}>{hint}</div>}
    </div>
  );
}

/* ===================== Transactions screen ====================== */
function TransactionsScreen({ t, lang, state, txLabel, onEdit }) {
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
      <header style={{ padding: "22px 20px 8px" }}>
        <h1 style={{ font: "700 24px 'Inter',sans-serif", margin: 0, letterSpacing: "-.01em" }}>{t("transactions")}</h1>
      </header>
      {txs.length === 0 ? <Empty t={t} text={t("noActivity")} hint={t("noActivityHint")} icon={Receipt} /> : (
        <div style={{ padding: "0 14px" }}>
          {groups.map((grp) => (
            <div key={grp.date} style={{ marginBottom: 14 }}>
              <div style={{ font: "600 12px 'Inter',sans-serif", color: C.muted, textTransform: "uppercase", letterSpacing: ".05em", padding: "8px 6px" }}>{dfmt(grp.date)}</div>
              <div style={{ background: C.card, borderRadius: 16, overflow: "hidden", border: `1px solid ${C.line}` }}>
                {grp.items.map((x, i) => {
                  const inflow = x.amount >= 0;
                  const transfer = !!x.accountId;
                  return (
                    <button key={x.id} onClick={() => onEdit(x)} style={{
                      width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "13px 14px",
                      background: "transparent", border: "none", borderBottom: i === grp.items.length - 1 ? "none" : `1px solid ${C.line}`,
                      cursor: "pointer", textAlign: "left",
                    }}>
                      <div style={{ width: 38, height: 38, borderRadius: 11, flexShrink: 0, display: "grid", placeItems: "center",
                        background: transfer ? C.amberSoft : inflow ? C.tealSoft : C.paper }}>
                        {transfer ? <Landmark size={18} color={C.amber} />
                          : inflow ? <ArrowDownLeft size={18} color={C.teal} /> : <ArrowUpRight size={18} color={C.muted} />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ font: "600 15px 'Inter',sans-serif", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {x.payee || x.memo || (transfer ? t("savings") : inflow ? t("inflow") : t("outflow"))}
                        </div>
                        <div style={{ font: "500 12px 'Inter',sans-serif", color: C.muted, marginTop: 2 }}>{txLabel(x)}</div>
                      </div>
                      <div style={{ font: "700 15px 'Space Grotesk',sans-serif", color: inflow ? C.green : C.ink }}>
                        {inflow ? "+" : ""}{money(x.amount)}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ======================== Reports screen ======================== */
function ReportsScreen({ t, lang, state, dispMonth, setDispMonth }) {
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
        if (monthKey(x.date) !== mk || x.accountId) return;   // savings transfers aren't income or spending
        if (x.amount > 0) inc += x.amount; else exp += -x.amount;
      });
      out.push({ name: shortMonth(mk, lang), income: Math.round(inc), expense: Math.round(exp) });
    }
    return out;
  }, [state, dispMonth, lang]);

  // income by source, this month (savings transfers excluded)
  const incomeBySrc = useMemo(() => {
    const map = {};
    for (const x of state.transactions) {
      if (x.categoryId !== null || x.accountId || x.amount <= 0 || monthKey(x.date) !== dispMonth) continue;
      const name = state.incomeSources.find((v) => v.id === x.sourceId)?.name || t("noSource");
      map[name] = (map[name] || 0) + x.amount;
    }
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [state, dispMonth, t]);
  const totalInc = incomeBySrc.reduce((s, [, v]) => s + v, 0);

  const palette = [C.teal, "#2A9D8F", C.amber, "#5B8C9E", "#9A6FB0", C.clay, "#3E7C59", "#C98B3A"];
  const totalSpend = spend.reduce((s, x) => s + x.value, 0);

  return (
    <div>
      <header style={{ padding: "22px 20px 8px" }}>
        <h1 style={{ font: "700 24px 'Inter',sans-serif", margin: 0, letterSpacing: "-.01em" }}>{t("reports")}</h1>
        <MonthNav lang={lang} dispMonth={dispMonth} setDispMonth={setDispMonth} small />
      </header>

      <div style={{ padding: "8px 16px" }}>
        <Card>
          <CardTitle icon={BarChart3}>{t("spendingByCategory")}</CardTitle>
          {spend.length === 0 ? <MiniEmpty t={t} /> : (
            <>
              <div style={{ font: "700 26px 'Space Grotesk',sans-serif", color: C.ink, margin: "2px 0 12px" }}>{money(totalSpend)}</div>
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
          <CardTitle icon={ArrowDownLeft}>{t("incomeBySource")}</CardTitle>
          {incomeBySrc.length === 0 ? <MiniEmpty t={t} /> : (
            <>
              <div style={{ font: "700 26px 'Space Grotesk',sans-serif", color: C.ink, margin: "2px 0 12px" }}>{money(totalInc)}</div>
              {incomeBySrc.map(([name, v]) => (
                <div key={name} style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", font: "500 13px 'Inter',sans-serif", marginBottom: 4 }}>
                    <span>{name}</span><span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600 }}>{money(v)}</span>
                  </div>
                  <ProgressBar pct={v / totalInc} color={C.teal} />
                </div>
              ))}
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
    </div>
  );
}
function Card({ children }) {
  return <div style={{ background: C.card, borderRadius: 18, border: `1px solid ${C.line}`, padding: 18, marginBottom: 16 }}>{children}</div>;
}
function CardTitle({ icon: Icon, children }) {
  return <div style={{ display: "flex", alignItems: "center", gap: 8, font: "600 15px 'Inter',sans-serif", color: C.ink, marginBottom: 6 }}>
    <Icon size={17} color={C.teal} />{children}
  </div>;
}
function MiniEmpty({ t }) {
  return <div style={{ padding: "26px 0", textAlign: "center", color: C.muted, font: "500 14px 'Inter',sans-serif" }}>{t("noActivity")}</div>;
}

/* ========================= More screen ========================== */
function MoreScreen({ t, lang, state, due, calc, txLabel, onAccount, onSavings, onEnterSchedule, onDelSchedule, onNewSchedule, onManageCats, onSetLang, onExportJSON, onExportCSV, onImport, onClear }) {
  const [confirmClear, setConfirmClear] = useState(false);
  const dfmt = (iso) => new Date(iso + "T00:00:00").toLocaleDateString(lang === "el" ? "el-GR" : "en-GB", { day: "numeric", month: "short", year: "numeric" });
  const freqLabel = { monthly: t("monthly"), weekly: t("weekly"), biweekly: t("biweekly"), yearly: t("yearly") };
  const dueIds = new Set(due.map((d) => d.id));
  const schedules = [...state.schedules].sort((a, b) => a.nextDate.localeCompare(b.nextDate));

  return (
    <div>
      <header style={{ padding: "22px 20px 8px" }}>
        <h1 style={{ font: "700 24px 'Inter',sans-serif", margin: 0, letterSpacing: "-.01em" }}>{t("more")}</h1>
      </header>

      <div style={{ padding: "8px 16px" }}>
        {/* Scheduled */}
        <Card>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <CardTitle icon={Repeat}>{t("recurring")}</CardTitle>
            <button onClick={onNewSchedule} style={{ ...iconBtn, background: C.tealSoft, padding: "7px 11px", gap: 6 }}>
              <Plus size={15} color={C.teal} /><span style={{ font: "600 13px 'Inter',sans-serif", color: C.teal }}>{t("schedule")}</span>
            </button>
          </div>
          {schedules.length === 0 ? (
            <div style={{ color: C.muted, font: "500 14px 'Inter',sans-serif", padding: "8px 0 4px" }}>{t("noScheduledHint")}</div>
          ) : schedules.map((s) => {
            const isDue = dueIds.has(s.id);
            const inflow = s.amount >= 0;
            return (
              <div key={s.id} style={{
                display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderTop: `1px solid ${C.line}`,
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ font: "600 15px 'Inter',sans-serif", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.name}</div>
                  <div style={{ font: "500 12px 'Inter',sans-serif", color: isDue ? C.amber : C.muted, marginTop: 2 }}>
                    {txLabel(s)} · {freqLabel[s.freq]} · {dfmt(s.nextDate)}
                  </div>
                </div>
                <div style={{ font: "700 15px 'Space Grotesk',sans-serif", color: inflow ? C.green : C.ink }}>{inflow ? "+" : ""}{money(s.amount)}</div>
                {isDue ? (
                  <button onClick={() => onEnterSchedule(s)} style={{ background: C.teal, color: "#fff", border: "none", borderRadius: 10, padding: "8px 12px", font: "600 13px 'Inter',sans-serif", cursor: "pointer" }}>{t("enter")}</button>
                ) : (
                  <button onClick={() => onDelSchedule(s.id)} style={iconBtn}><Trash2 size={17} color={C.muted} /></button>
                )}
              </div>
            );
          })}
        </Card>

        {/* Savings accounts */}
        <Card>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <CardTitle icon={Landmark}>{t("savingsAccounts")}</CardTitle>
            <button onClick={() => onAccount(null)} style={{ ...iconBtn, background: C.tealSoft, padding: "7px 11px", gap: 6 }}>
              <Plus size={15} color={C.teal} /><span style={{ font: "600 13px 'Inter',sans-serif", color: C.teal }}>{t("account")}</span>
            </button>
          </div>
          {state.accounts.length === 0 ? (
            <div style={{ color: C.muted, font: "500 14px 'Inter',sans-serif", padding: "8px 0 4px" }}>{t("noAccountsHint")}</div>
          ) : (
            <>
              {state.accounts.map((a) => (
                <AccountRow key={a.id} t={t} acc={a} bal={calc.accBal[a.id]} need={calc.accNeed[a.id]} onClick={() => onAccount(a)} />
              ))}
              <div style={{ marginTop: 6 }}><GhostBtn onClick={onSavings} color={C.ink}><ArrowLeftRight size={16} />{t("move")}</GhostBtn></div>
            </>
          )}
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
                flex: 1, padding: "11px", borderRadius: 11, cursor: "pointer", font: "600 14px 'Inter',sans-serif",
                border: `1.5px solid ${lang === code ? C.teal : C.line}`,
                background: lang === code ? C.tealSoft : C.card, color: lang === code ? C.teal : C.muted,
              }}>{label}</button>
            ))}
          </div>
        </Card>

        <Card>
          <button onClick={() => setConfirmClear(true)} style={{ width: "100%", background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 9, color: C.clay, font: "600 15px 'Inter',sans-serif", padding: "2px 0" }}>
            <RotateCcw size={18} />{t("clearAll")}
          </button>
        </Card>

        <div style={{ display: "flex", gap: 8, alignItems: "flex-start", padding: "4px 6px 20px", color: C.muted, font: "500 12px/1.5 'Inter',sans-serif" }}>
          <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
          <span>{t("install")}</span>
        </div>
      </div>
      {confirmClear && <ConfirmDialog t={t} title={t("clearAll")} message={t("clearAllConfirm")} confirmText={t("clearAll")}
        onCancel={() => setConfirmClear(false)} onConfirm={() => { setConfirmClear(false); onClear(); }} />}
    </div>
  );
}

/* ===================== Transaction sheet ======================== */
function TxSheet({ t, state, initial, dispMonth, onClose, onSave, onDelete }) {
  const [inflow, setInflow] = useState(initial ? initial.amount >= 0 : false);
  const [amount, setAmount] = useState(initial ? Math.abs(initial.amount).toString().replace(".", ",") : "");
  const [catId, setCatId] = useState(initial
    ? (initial.categoryId ?? (initial.sourceId ? `${INC}:${initial.sourceId}` : INC))
    : (state.categories[0]?.id ?? INC));
  const [payee, setPayee] = useState(initial?.payee || "");
  const [memo, setMemo] = useState(initial?.memo || "");
  const [date, setDate] = useState(initial?.date || todayISO());

  const incomeSelected = isInc(catId);

  const valid = !isNaN(parseAmount(amount)) && parseAmount(amount) > 0;

  const submit = () => {
    let amt = parseAmount(amount);
    if (isNaN(amt) || amt <= 0) return;
    const isInc = incomeSelected || inflow;
    const signed = isInc ? Math.abs(amt) : -Math.abs(amt);
    onSave({
      date, amount: signed,
      categoryId: incomeSelected ? null : catId, sourceId: incomeSelected ? srcOf(catId) : null,
      payee: payee.trim(), memo: memo.trim(),
    });
  };

  return (
    <Sheet title={initial ? t("editTransaction") : t("newTransaction")} onClose={onClose} t={t}>
      {/* inflow / outflow toggle — hidden for income, which is always an inflow */}
      {!incomeSelected && <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {[[false, t("outflow"), ArrowUpRight], [true, t("inflow"), ArrowDownLeft]].map(([val, label, Icon]) => (
          <button key={String(val)} onClick={() => setInflow(val)} style={{
            flex: 1, padding: "12px", borderRadius: 12, cursor: "pointer", font: "600 14px 'Inter',sans-serif",
            display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
            border: `1.5px solid ${inflow === val ? (val ? C.teal : C.ink) : C.line}`,
            background: inflow === val ? (val ? C.tealSoft : C.paper) : C.card,
            color: inflow === val ? (val ? C.teal : C.ink) : C.muted,
          }}><Icon size={16} />{label}</button>
        ))}
      </div>}

      <Field label={`${t("amount")} (€)`}>
        <input inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0,00"
          style={{ ...inputStyle, font: "700 22px 'Space Grotesk',sans-serif", textAlign: "right" }} autoFocus={!initial} />
      </Field>

      <Field label={t("category")}>
        <CategorySelect t={t} state={state} value={catId} onChange={(v) => { setCatId(v); if (isInc(v)) setInflow(true); }} />
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
          <button onClick={onDelete} style={{ width: "100%", padding: "13px", borderRadius: 12, border: "none", background: C.claySoft, color: C.clay, font: "600 15px 'Inter',sans-serif", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
            <Trash2 size={16} />{t("delete")}
          </button>
        </div>
      )}
    </Sheet>
  );
}

/* ======================== Assign sheet ========================== */
// Tappable spending figures: this month so far, last month, 3-month average → used as a target.
function SpendHints({ t, info, onPick }) {
  const items = [[t("spentSoFar"), info.spent], [t("lastMonth"), info.lastSpent], [t("avg3"), info.avgSpent]]
    .filter(([, v]) => v != null && v > 0.005);
  if (!items.length) return null;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 7 }}>
      {items.map(([label, v]) => (
        <button key={label} onClick={() => onPick(Math.ceil(v))} style={{
          border: `1px solid ${C.line}`, background: C.paper, color: C.ink, borderRadius: 8, padding: "5px 8px",
          font: "500 12px 'Inter',sans-serif", cursor: "pointer",
        }}>{label} <b style={{ fontFamily: "'Space Grotesk',sans-serif" }}>{moneyShort(Math.ceil(v))}</b></button>
      ))}
    </div>
  );
}
function DangerBtn({ children, onClick }) {
  return (
    <button onClick={onClick} style={{ width: "100%", marginTop: 10, padding: "13px", borderRadius: 12, border: "none", background: C.claySoft, color: C.clay, font: "600 15px 'Inter',sans-serif", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
      {children}
    </button>
  );
}

function AssignSheet({ t, cat, info, dispMonth, lang, hasAccounts, onClose, onAssign, onSetAmount, onMove, onFromSavings }) {
  const [amount, setAmount] = useState(toInput(info.assigned));
  const [scope, setScope] = useState("forward");
  const [dirty, setDirty] = useState(false);   // only the amount field / scope toggle commit a repeating change
  const edit = (v) => { setAmount(v); setDirty(true); };

  // one-off top-ups (cover overspending) apply to this month only
  const apply = (amt) => { onAssign(amt); setAmount(toInput(amt)); };

  // Persist edits without closing (also used before jumping to Move / Savings).
  const commit = () => {
    if (!dirty) return;
    const v = amount.trim() === "" ? 0 : parseAmount(amount);
    if (!isNaN(v)) onSetAmount(round2(v), scope);
    setDirty(false);
  };

  const overspend = info.available < 0 ? -info.available : 0;
  const shortfall = round2(overspend);

  return (
    <Sheet title={cat.name} onClose={onClose} t={t}>
      {/* status strip */}
      <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
        <Stat label={t("assigned")} value={money(info.assigned)} />
        <Stat label={t("activity")} value={money(info.activity)} />
        <Stat label={t("available")} value={money(info.available)} accent={info.available < 0 ? C.clay : info.available > 0 ? C.green : C.muted} />
      </div>

      <Field label={`${t("assignedThisMonth")} · ${monthLabel(dispMonth, lang)} (€)`}>
        <input inputMode="decimal" value={amount} onChange={(e) => edit(e.target.value)} placeholder="0,00" style={amountStyle} />
        <SpendHints t={t} info={info} onPick={(v) => edit(toInput(v))} />
      </Field>
      <Segmented value={scope} onChange={(v) => { setScope(v); setDirty(true); }}
        options={[["month", t("scopeMonth")], ["forward", t("scopeForward")]]} />

      {overspend > 0.005 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
          {overspend > 0.005 && (
            <>
              <Chip onClick={() => apply((parseAmount(amount) || 0) + round2(overspend))} color={C.clay} bg={C.claySoft}>
                {t("coverOverspend")} +{money(overspend)}
              </Chip>
              <Chip onClick={() => { commit(); onMove({ toId: cat.id, amount: overspend }); }} color={C.clay} bg={C.claySoft}>
                {t("coverFromCategory")}
              </Chip>
            </>
          )}
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
        <GhostBtn color={C.ink} onClick={() => { commit(); onMove(info.available > 0.005 ? { fromId: cat.id } : { toId: cat.id }); }}>
          <ArrowLeftRight size={16} />{t("move")}
        </GhostBtn>
        {hasAccounts && (
          <GhostBtn color={C.ink} onClick={() => { commit(); onFromSavings({ catId: cat.id, amount: shortfall }); }}>
            <Landmark size={16} />{t("fromSavings")}
          </GhostBtn>
        )}
      </div>

      <PrimaryBtn onClick={() => { commit(); onClose(); }}><Check size={18} />{t("save")}</PrimaryBtn>
    </Sheet>
  );
}

/* ========================= Move sheet =========================== */
function MoveSheet({ t, groupsView, calc, preset, onClose, onMove }) {
  const cats = groupsView.flatMap((g) => g.cats);
  const av = (id) => (id === RTA ? calc.readyToAssign : calc.byCat[id]?.available ?? 0);
  const pick = (pred, cmp) => cats.filter(pred).sort(cmp)[0]?.id;
  // Sensible defaults: to = most overspent category, from = category with the most available.
  const defTo = preset.toId ?? pick((c) => av(c.id) < -0.005 && c.id !== preset.fromId, (a, b) => av(a.id) - av(b.id)) ?? RTA;
  const defFrom = preset.fromId ?? pick((c) => av(c.id) > 0.005 && c.id !== defTo, (a, b) => av(b.id) - av(a.id)) ?? RTA;

  const [fromId, setFromId] = useState(defFrom);
  const [toId, setToId] = useState(defTo);
  const [amount, setAmount] = useState(toInput(preset.amount));
  const amt = parseAmount(amount);
  const valid = !isNaN(amt) && amt > 0 && fromId !== toId;

  const options = (
    <>
      <option value={RTA}>{t("readyToAssign")} ({money(calc.readyToAssign)})</option>
      {groupsView.map((g) => (
        <optgroup key={g.id} label={g.name}>
          {g.cats.map((c) => <option key={c.id} value={c.id}>{c.name} ({money(av(c.id))})</option>)}
        </optgroup>
      ))}
    </>
  );

  return (
    <Sheet title={t("moveMoney")} onClose={onClose} t={t}>
      <Field label={t("from")}>
        <select value={fromId} onChange={(e) => setFromId(e.target.value)} style={selectStyle}>{options}</select>
      </Field>
      <div style={{ display: "flex", justifyContent: "center", margin: "-8px 0 6px" }}>
        <button onClick={() => { setFromId(toId); setToId(fromId); }} aria-label="⇅" style={{ ...iconBtn, background: C.paper, borderRadius: 20 }}>
          <ArrowUpDown size={18} color={C.teal} />
        </button>
      </div>
      <Field label={t("to")}>
        <select value={toId} onChange={(e) => setToId(e.target.value)} style={selectStyle}>{options}</select>
      </Field>
      <Field label={`${t("amount")} (€)`}>
        <input inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0,00" style={amountStyle} autoFocus={!preset.amount} />
      </Field>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16, alignItems: "center" }}>
        {av(fromId) > 0.005 && <Chip onClick={() => setAmount(toInput(av(fromId)))}>{t("allAvailable")} {money(av(fromId))}</Chip>}
        {valid && amt > av(fromId) + 0.005 && <span style={{ font: "500 13px 'Inter',sans-serif", color: C.clay }}>{t("willGoNegative")}</span>}
      </div>
      <PrimaryBtn onClick={() => valid && onMove(fromId, toId, round2(amt))} disabled={!valid}><ArrowLeftRight size={18} />{t("move")}</PrimaryBtn>
    </Sheet>
  );
}

/* ======================= Targets sheet ========================== */
// Every category's target for the month on one screen, with actual spending next to it.
function TargetsSheet({ t, lang, groupsView, calc, dispMonth, onClose, onSave }) {
  const init = {};
  for (const g of groupsView) for (const c of g.cats) init[c.id] = toInput(calc.byCat[c.id].assigned);
  const [vals, setVals] = useState(init);
  const [scope, setScope] = useState("forward");
  const set = (id, v) => setVals((p) => ({ ...p, [id]: v }));

  const save = () => {
    const entries = [];
    for (const id in vals) {
      if (vals[id] === init[id]) continue;
      const n = vals[id].trim() === "" ? 0 : parseAmount(vals[id]);
      if (!isNaN(n) && n >= 0) entries.push({ catId: id, amount: round2(n) });
    }
    onSave(entries, scope);
  };

  return (
    <Sheet title={`${t("targets")} · ${monthLabel(dispMonth, lang)}`} onClose={onClose} t={t}>
      <Segmented value={scope} onChange={setScope} options={[["month", t("scopeMonth")], ["forward", t("scopeForward")]]} />
      <div style={{ font: "500 13px/1.45 'Inter',sans-serif", color: C.muted, margin: "-6px 0 16px" }}>{t("targetsHint")}</div>
      {groupsView.map((g) => g.cats.length > 0 && (
        <section key={g.id} style={{ marginBottom: 16 }}>
          <h3 style={{ font: "600 13px 'Inter',sans-serif", color: C.muted, margin: "0 0 8px 2px" }}>{g.name}</h3>
          <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.line}` }}>
            {g.cats.map((c, i) => {
              const info = calc.byCat[c.id];
              return (
                <div key={c.id} style={{ padding: "11px 14px", borderBottom: i === g.cats.length - 1 ? "none" : `1px solid ${C.line}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ flex: 1, minWidth: 0, font: "600 15px 'Inter',sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {c.name}
                    </span>
                    <input inputMode="decimal" value={vals[c.id] ?? ""} onChange={(e) => set(c.id, e.target.value)} placeholder="—"
                      aria-label={c.name}
                      style={{ ...inputStyle, width: 112, padding: "9px 10px", font: "600 16px 'Space Grotesk',sans-serif", textAlign: "right" }} />
                  </div>
                  <SpendHints t={t} info={info} onPick={(v) => set(c.id, toInput(v))} />
                </div>
              );
            })}
          </div>
        </section>
      ))}
      <div style={{ position: "sticky", bottom: 0, background: C.card, paddingTop: 8 }}>
        <PrimaryBtn onClick={save}><Check size={18} />{t("save")}</PrimaryBtn>
      </div>
    </Sheet>
  );
}

/* ======================= Savings sheets ========================= */
function SavingsSheet({ t, lang, state, calc, groupsView, preset, dispMonth, onClose, onAddAccount, onSave, onDelete }) {
  const init = preset.tx;
  const [dir, setDir] = useState(init ? (init.amount >= 0 ? "in" : "out") : preset.dir || "in");
  const [accountId, setAccountId] = useState(init?.accountId ?? preset.accountId ?? state.accounts[0]?.id ?? "");
  const [amount, setAmount] = useState(init ? toInput(Math.abs(init.amount)) : toInput(preset.amount));
  const [catId, setCatId] = useState(preset.catId ?? "");
  const [from, setFrom] = useState(preset.from ?? RTA);      // where money going INTO savings comes from
  const [date, setDate] = useState(init?.date || todayISO());
  const [memo, setMemo] = useState(init?.memo || "");

  if (!init && state.accounts.length === 0) {
    return (
      <Sheet title={t("savings")} onClose={onClose} t={t}>
        <Empty t={t} icon={Landmark} text={t("noAccounts")} hint={t("noAccountsHint")} />
        <PrimaryBtn onClick={onAddAccount}><Plus size={18} />{t("addAccount")}</PrimaryBtn>
      </Sheet>
    );
  }

  const av = (id) => calc.byCat[id]?.available ?? 0;
  const leftTotal = round2(Object.values(calc.byCat).reduce((s, v) => s + Math.max(0, v.available), 0));
  const pickFrom = (v) => {
    setFrom(v);
    if (v === ALL) setAmount(toInput(leftTotal));
    else if (v !== RTA) setAmount(toInput(Math.max(0, av(v))));
  };
  const showFrom = dir === "out" && !init;
  const amt = parseAmount(amount);
  const valid = !isNaN(amt) && amt > 0 && accountId;
  // balance available to draw from, counting this transfer's own amount back in when editing
  const bal = (calc.accBal[accountId] ?? 0) + (init?.accountId === accountId ? Math.max(0, init.amount) : 0);

  return (
    <Sheet title={t("savings")} onClose={onClose} t={t}>
      <Segmented value={dir} onChange={setDir}
        options={[["in", t("fromSavings"), ArrowDownLeft], ["out", t("toSavings"), ArrowUpRight]]} />
      <Field label={t("account")}>
        <select value={accountId} onChange={(e) => setAccountId(e.target.value)} style={selectStyle}>
          {!state.accounts.some((a) => a.id === accountId) && <option value={accountId}>{t("deletedAccount")}</option>}
          {state.accounts.map((a) => <option key={a.id} value={a.id}>{a.name} ({money(calc.accBal[a.id])})</option>)}
        </select>
      </Field>
      {showFrom && (
        <Field label={t("from")}>
          <select value={from} onChange={(e) => pickFrom(e.target.value)} style={selectStyle}>
            <option value={RTA}>{t("readyToAssign")} ({money(calc.readyToAssign)})</option>
            <option value={ALL}>{t("allLeftovers")} ({money(leftTotal)})</option>
            {groupsView.map((g) => (
              <optgroup key={g.id} label={g.name}>
                {g.cats.map((c) => <option key={c.id} value={c.id}>{c.name} ({money(av(c.id))})</option>)}
              </optgroup>
            ))}
          </select>
        </Field>
      )}
      <Field label={`${t("amount")} (€)`}>
        <input inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0,00"
          readOnly={showFrom && from === ALL} style={amountStyle} autoFocus={!init && !preset.amount} />
        {dir === "in" && valid && amt > bal + 0.005 && (
          <div style={{ font: "500 13px 'Inter',sans-serif", color: C.clay, marginTop: 6 }}>{t("exceedsBalance")}</div>
        )}
        {showFrom && from !== ALL && valid && amt > (from === RTA ? calc.readyToAssign : av(from)) + 0.005 && (
          <div style={{ font: "500 13px 'Inter',sans-serif", color: C.clay, marginTop: 6 }}>{t("willGoNegative")}</div>
        )}
        {showFrom && from === RTA && calc.accNeed[accountId]?.left > 0.005 && (
          <div style={{ marginTop: 8 }}>
            <Chip onClick={() => setAmount(toInput(round2(calc.accNeed[accountId].left)))}>{t("goalThisMonth")} +{money(calc.accNeed[accountId].left)}</Chip>
          </div>
        )}
      </Field>
      {dir === "in" && !init && (
        <Field label={t("assignTo")}>
          <select value={catId} onChange={(e) => setCatId(e.target.value)} style={selectStyle}>
            <option value="">{t("readyToAssignOpt")}</option>
            {groupsView.map((g) => (
              <optgroup key={g.id} label={g.name}>
                {g.cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </optgroup>
            ))}
          </select>
        </Field>
      )}
      <Field label={t("date")}>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={inputStyle} />
      </Field>
      <Field label={t("memo")}>
        <input value={memo} onChange={(e) => setMemo(e.target.value)} style={inputStyle} placeholder="—" />
      </Field>
      <PrimaryBtn disabled={!valid} onClick={() => valid && onSave({
        accountId, amount: dir === "in" ? round2(amt) : -round2(amt), date,
        memo: memo.trim() || (showFrom && from === ALL ? `${t("leftovers")} ${monthLabel(dispMonth, lang)}` : ""),
      }, dir === "in" ? catId : (showFrom ? from : ""))}>
        <Check size={18} />{t("save")}
      </PrimaryBtn>
      {onDelete && <DangerBtn onClick={onDelete}><Trash2 size={16} />{t("delete")}</DangerBtn>}
    </Sheet>
  );
}

function AccountSheet({ t, initial, balance, onClose, onSave, onDelete }) {
  const [name, setName] = useState(initial?.name || "");
  const [bal, setBal] = useState(initial ? toInput(balance) : "");
  const [goal, setGoal] = useState(toInput(initial?.goal?.target));
  const [byDate, setByDate] = useState(initial?.goal?.byDate || "");
  const [confirmDel, setConfirmDel] = useState(false);
  const b = bal.trim() === "" ? 0 : parseAmount(bal);
  const g = goal.trim() === "" ? 0 : parseAmount(goal);
  const valid = name.trim() && !isNaN(b) && !isNaN(g);
  return (
    <Sheet title={initial ? t("editAccount") : t("addAccount")} onClose={onClose} t={t}>
      <Field label={t("accountName")}>
        <input value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} placeholder="—" autoFocus={!initial} />
      </Field>
      <Field label={`${t("currentBalance")} (€)`}>
        <input inputMode="decimal" value={bal} onChange={(e) => setBal(e.target.value)} placeholder="0,00" style={amountStyle} />
      </Field>
      <div style={{ display: "flex", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <Field label={`${t("savingsGoal")} (€)`}>
            <input inputMode="decimal" value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="—" style={inputStyle} />
          </Field>
        </div>
        <div style={{ flex: 1 }}>
          <Field label={t("byDate")}>
            <input type="month" value={byDate} onChange={(e) => setByDate(e.target.value)} style={inputStyle} />
          </Field>
        </div>
      </div>
      <PrimaryBtn disabled={!valid} onClick={() => valid && onSave({ id: initial?.id || uid(), name: name.trim(), goal: g > 0 ? { target: round2(g), byDate } : null }, round2(b))}>
        <Check size={18} />{t("save")}
      </PrimaryBtn>
      {onDelete && <DangerBtn onClick={() => setConfirmDel(true)}><Trash2 size={16} />{t("delete")}</DangerBtn>}
      {confirmDel && <ConfirmDialog t={t} message={t("deleteAccountConfirm")} onCancel={() => setConfirmDel(false)} onConfirm={onDelete} />}
    </Sheet>
  );
}

function Stat({ label, value, accent = C.ink }) {
  return (
    <div style={{ flex: 1, background: C.paper, borderRadius: 12, padding: "10px 8px", textAlign: "center" }}>
      <div style={{ font: "700 14px 'Space Grotesk',sans-serif", color: accent }}>{value}</div>
      <div style={{ font: "500 10.5px 'Inter',sans-serif", color: C.muted, marginTop: 2, textTransform: "uppercase", letterSpacing: ".03em" }}>{label}</div>
    </div>
  );
}
function Chip({ children, onClick, color = C.teal, bg = C.tealSoft }) {
  return <button onClick={onClick} style={{ border: "none", background: bg, color, borderRadius: 10, padding: "9px 13px", font: "600 13px 'Inter',sans-serif", cursor: "pointer" }}>{children}</button>;
}

/* ====================== Manage categories ======================= */
function ManageSheet({ t, groupsView, onClose, onAddCategory, onRenameCategory, onDelCategory, onAddGroup, onRenameGroup, onDelGroup, sources, onAddSource, onRenameSource, onDelSource }) {
  const [dialog, setDialog] = useState(null);
  const close = () => setDialog(null);
  return (
    <Sheet title={t("manageCats")} onClose={onClose} t={t}>
      <div style={{ marginBottom: 18 }}>
        <div style={{ font: "600 13px 'Inter',sans-serif", letterSpacing: ".05em", textTransform: "uppercase", color: C.teal, marginBottom: 8 }}>{t("incomeSources")}</div>
        <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.line}`, overflow: "hidden" }}>
          {sources.map((v) => (
            <div key={v.id} style={{ display: "flex", alignItems: "center", gap: 6, padding: "11px 14px", borderBottom: `1px solid ${C.line}` }}>
              <span style={{ flex: 1, font: "600 15px 'Inter',sans-serif" }}>{v.name}</span>
              <button onClick={() => setDialog({ kind: "renameSrc", id: v.id, name: v.name })} aria-label={t("rename")} style={iconBtn}><Pencil size={15} color={C.muted} /></button>
              <button onClick={() => setDialog({ kind: "delSrc", id: v.id })} aria-label={t("delete")} style={iconBtn}><Trash2 size={15} color={C.clay} /></button>
            </div>
          ))}
          <button onClick={() => setDialog({ kind: "addSrc" })} style={{ width: "100%", padding: "11px", background: "transparent", border: "none", color: C.teal, font: "600 14px 'Inter',sans-serif", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <Plus size={16} />{t("addSource")}
          </button>
        </div>
      </div>
      {groupsView.map((g) => (
        <div key={g.id} style={{ marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
            <span style={{ flex: 1, font: "600 13px 'Inter',sans-serif", letterSpacing: ".05em", textTransform: "uppercase", color: C.muted }}>{g.name}</span>
            <button onClick={() => setDialog({ kind: "renameGroup", id: g.id, name: g.name })} aria-label={t("rename")} style={iconBtn}><Pencil size={15} color={C.muted} /></button>
            <button onClick={() => setDialog({ kind: "delGroup", id: g.id })} aria-label={t("delete")} style={iconBtn}><Trash2 size={15} color={C.clay} /></button>
          </div>
          <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.line}`, overflow: "hidden" }}>
            {g.cats.map((c, i) => (
              <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 6, padding: "11px 14px", borderBottom: i === g.cats.length - 1 ? "none" : `1px solid ${C.line}` }}>
                <span style={{ flex: 1, font: "600 15px 'Inter',sans-serif" }}>{c.name} {c.plan?.some((st) => st.amount > 0) && <Repeat size={12} color={C.teal} style={{ verticalAlign: "middle" }} />}</span>
                <button onClick={() => setDialog({ kind: "renameCat", id: c.id, name: c.name })} aria-label={t("rename")} style={iconBtn}><Pencil size={15} color={C.muted} /></button>
                <button onClick={() => setDialog({ kind: "delCat", id: c.id })} aria-label={t("delete")} style={iconBtn}><Trash2 size={15} color={C.clay} /></button>
              </div>
            ))}
            <button onClick={() => setDialog({ kind: "addCat", groupId: g.id })} style={{ width: "100%", padding: "11px", background: "transparent", border: "none", borderTop: g.cats.length ? `1px solid ${C.line}` : "none", color: C.teal, font: "600 14px 'Inter',sans-serif", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <Plus size={16} />{t("addCategory")}
            </button>
          </div>
        </div>
      ))}
      <GhostBtn onClick={() => setDialog({ kind: "addGroup" })} color={C.ink}><FolderPlus size={17} />{t("addGroup")}</GhostBtn>

      {dialog?.kind === "addCat" && <PromptDialog t={t} title={t("addCategory")} label={t("categoryName")} onCancel={close} onSubmit={(n) => { onAddCategory(dialog.groupId, n); close(); }} />}
      {dialog?.kind === "renameCat" && <PromptDialog t={t} title={t("rename")} label={t("categoryName")} initial={dialog.name} onCancel={close} onSubmit={(n) => { onRenameCategory(dialog.id, n); close(); }} />}
      {dialog?.kind === "delCat" && <ConfirmDialog t={t} message={t("deleteCatConfirm")} onCancel={close} onConfirm={() => { onDelCategory(dialog.id); close(); }} />}
      {dialog?.kind === "addGroup" && <PromptDialog t={t} title={t("addGroup")} label={t("groupName")} onCancel={close} onSubmit={(n) => { onAddGroup(n); close(); }} />}
      {dialog?.kind === "renameGroup" && <PromptDialog t={t} title={t("rename")} label={t("groupName")} initial={dialog.name} onCancel={close} onSubmit={(n) => { onRenameGroup(dialog.id, n); close(); }} />}
      {dialog?.kind === "addSrc" && <PromptDialog t={t} title={t("addSource")} label={t("sourceName")} onCancel={close} onSubmit={(n) => { onAddSource(n); close(); }} />}
      {dialog?.kind === "renameSrc" && <PromptDialog t={t} title={t("rename")} label={t("sourceName")} initial={dialog.name} onCancel={close} onSubmit={(n) => { onRenameSource(dialog.id, n); close(); }} />}
      {dialog?.kind === "delSrc" && <ConfirmDialog t={t} message={t("deleteSourceConfirm")} onCancel={close} onConfirm={() => { onDelSource(dialog.id); close(); }} />}
      {dialog?.kind === "delGroup" && <ConfirmDialog t={t} message={t("deleteGroupConfirm")} onCancel={close} onConfirm={() => { onDelGroup(dialog.id); close(); }} />}
    </Sheet>
  );
}

/* ====================== Schedule sheet ========================== */
function ScheduleSheet({ t, state, onClose, onSave }) {
  const [name, setName] = useState("");
  const [inflow, setInflow] = useState(false);
  const [amount, setAmount] = useState("");
  const [catId, setCatId] = useState(state.categories[0]?.id ?? INC);
  const [freq, setFreq] = useState("monthly");
  const [nextDate, setNextDate] = useState(todayISO());

  const incomeSelected = isInc(catId);
  const valid = name.trim() && !isNaN(parseAmount(amount)) && parseAmount(amount) > 0;

  const submit = () => {
    const amt = parseAmount(amount); if (!valid) return;
    const isInc = incomeSelected || inflow;
    onSave({
      name: name.trim(), amount: isInc ? Math.abs(amt) : -Math.abs(amt),
      categoryId: incomeSelected ? null : catId, sourceId: incomeSelected ? srcOf(catId) : null, freq, nextDate, payee: name.trim(),
    });
  };

  return (
    <Sheet title={t("newSchedule")} onClose={onClose} t={t}>
      <Field label={t("name")}>
        <input value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} placeholder="—" autoFocus />
      </Field>
      {!incomeSelected && <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {[[false, t("outflow")], [true, t("inflow")]].map(([val, label]) => (
          <button key={String(val)} onClick={() => setInflow(val)} style={{
            flex: 1, padding: "12px", borderRadius: 12, cursor: "pointer", font: "600 14px 'Inter',sans-serif",
            border: `1.5px solid ${inflow === val ? (val ? C.teal : C.ink) : C.line}`,
            background: inflow === val ? (val ? C.tealSoft : C.paper) : C.card,
            color: inflow === val ? (val ? C.teal : C.ink) : C.muted,
          }}>{label}</button>
        ))}
      </div>}
      <Field label={`${t("amount")} (€)`}>
        <input inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0,00"
          style={{ ...inputStyle, font: "700 20px 'Space Grotesk',sans-serif", textAlign: "right" }} />
      </Field>
      <Field label={t("category")}>
        <CategorySelect t={t} state={state} value={catId} onChange={(v) => { setCatId(v); if (isInc(v)) setInflow(true); }} />
      </Field>
      <div style={{ display: "flex", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <Field label={t("frequency")}>
            <select value={freq} onChange={(e) => setFreq(e.target.value)} style={{ ...inputStyle, appearance: "none", background: "#FBFCFC" }}>
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
