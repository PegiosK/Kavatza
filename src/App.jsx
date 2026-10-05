import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import catRichImg from "./assets/mascot/cat-rich.webp";
import catBrokeImg from "./assets/mascot/cat-broke.jpg";
import catExpenseImg from "./assets/mascot/cat-expense.webp";
import catIncomeImg from "./assets/mascot/cat-income.webp";
import catEmptyImg from "./assets/mascot/cat-empty.webp";
import catOverspendImg from "./assets/mascot/cat-overspend.webp";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid, Legend,
} from "recharts";
import {
  Wallet, Plus, BarChart3, Settings, Repeat, Target, Download, Upload,
  ChevronLeft, ChevronRight, ChevronDown, GripVertical, X, Pencil, Trash2, Check, ArrowDownLeft, ArrowUpRight,
  PiggyBank, Languages, Receipt, AlertCircle, FolderPlus, RotateCcw, CalendarClock,
  ArrowLeftRight, ArrowUpDown, Landmark, HelpCircle,
} from "lucide-react";

/* ------------------------------------------------------------------ *
 * KABATZA (καβάτζα) — a zero-based envelope budget for Greece (EUR).
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
  gold: "#A97B24",       // brass — the money accent (bars, FAB, edit pill)
  goldSoft: "#F5EDDA",
  amber: "#A97B24",      // brass — goals & due (alias of gold)
  amberSoft: "#F5EDDA",
  clay: "#D2604A",       // overspend / outflow
  claySoft: "#F4E3DC",
  muted: "#8B8579",
  line: "#EEE9DC",       // warm hairline
  green: "#3AA57C",
};

const STORE_KEY = "kavatza_state_v2";
const TUTORIAL_KEY = "kavatza_tutorial_seen_v1";

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
    everyEuro: "every euro a job", restored: "Backup restored.", badFile: "That file isn't a valid KABATZA backup.",
    uncategorised: "Uncategorised", thisMonth: "this month", needPerMonth: "/mo to reach by date",
    emptyBudget: "Add a category to start budgeting.", spent: "spent", received: "received",
    install: "Tip: keep a backup now and then via “Backup & restore”. Your data lives only on this device.",
    confirm: "Confirm", schedule: "Schedule", manageCats: "Categories & groups", ofWord: "of",
        backupNotice: "Your budget lives only in this browser. Export a backup now and then — Backup & restore, in More.",
    shortcutNotice: "To install as an app — open this link in Google Chrome → menu ⋮ → 'Add to Home screen' → Add.",
    gotIt: "Got it",
    srcSalary: "Salary", srcPension: "Pension", srcRents: "Rent income", srcInvest: "Investments",
    accounts: "Accounts", totalSavings: "Total savings", addAccount: "Add account",
    accountName: "Account name", startingBalance: "Starting balance", balance: "Balance",
    noAccounts: "No accounts yet", noAccountsHint: "Add a savings or cash account to track its balance.",
    deleteAccountConfirm: "Delete this account?",
    move: "Move", moveMoney: "Move money", from: "From", to: "To", allAvailable: "All available",
    willGoNegative: "The source will go negative.", moved: "Moved", coverFromCategory: "From another category",
    targets: "Targets", scopeMonth: "This month only", scopeForward: "This month onward",
    targetsHint: "Each amount is assigned every month until you change it. Tap a spending figure to use it.",
    spentSoFar: "So far", lastMonth: "Last month", avg3: "3-mo avg",
    savings: "Savings", fromSavings: "From savings", toSavings: "To savings", account: "Account",
    assignTo: "Assign to", readyToAssignOpt: "Ready to assign (assign later)", exceedsBalance: "More than this account's balance.",
    deletedAccount: "Deleted account", leftovers: "Leftovers", allLeftovers: "All leftovers",
    savingsGoal: "Savings goal", goalThisMonth: "This month's goal", transfer: "Transfer",
    incomeBySource: "Income by source", incomeSources: "Income sources", addSource: "Add income source", sourceName: "Source name",
    deleteSourceConfirm: "Delete this source? Income you've already entered stays, without a source.",
    reorder: "Reorder", reorderHint: "Drag the ⠿ handle to change the order. A category can also be dropped into another group.",
    finalGoal: "Final amount goal", finalAmount: "Final amount", stillNeeded: "still needed", goalDone: "Goal reached",
    perMonthUntil: "a month until", goalExpired: "expired", neededThisMonth: "needed this month", removeGoal: "Remove goal",
    removeGoalMsg: "The money stays in the category this month. Whatever is left when the month closes goes back to Ready to assign.",
    goalMoneyNote: "Money held by goal categories is already set aside — don't move it to savings as well.",
    help: "Help", tutorial: "Mini tutorial", tutorialTitle: "Welcome to KABATZA", editBudget: "Edit budget",
    tutorialSub: "Give every euro a job before you spend it.",
    tutorialFull: "Give every euro a purpose: start with the money you actually have and assign all of it: everyday spending, bills that must be paid, savings, or bigger goals like future purchases, holidays or trips!\n\nKeep assigning until available money is zero. This does not mean you spent your money. It means you already know where you want every euro to be used.\nWhen you spend, record the expense and the amount is deducted from the matching purpose.\n\nThe app’s goal is not to make you stop spending. It is to spend consciously so that, in the end, you achieve what you truly want.\n\nThe cat will follow you with tips and advice 😊",
    next: "Next", back: "Back", start: "Start budgeting", skip: "Skip",
    tutCatTitle: "Budget", tutCatBody: "In the “Budget” tab you’ll find the main expense and goal categories. You can change them with the pencil at the top right.",
    tutTxTitle: "Transactions", tutTxBody: "Here you add and remove every income and expense. Income appears in available money. Expenses fill the bar you have budgeted.",
    tutAccTitle: "Accounts", tutAccBody: "Here you can add the money you have saved, in investments or in cash.",
    tutorialLocal: "Everything stays on this device. Reopen this guide anytime from More → Mini tutorial.",
    catRichTitle: "Living large", catRich: "Spending is inside the plan — the cat is feeling rich.",
    catBrokeTitle: "Broke cat alert", catBroke: "This month’s spending passed what you assigned — cover it before the cat sells the sofa.",
    catNeutralTitle: "The cat is watching", catNeutral: "Assign money and log spending to set the cat’s mood.",
    catRemain: "We still have {x} for this expense.",
    catEmpty: "No money left. We need to take it from somewhere else. Reduce another expense or a goal.",
    catIncomeTitle: "Money in!",
    catIncome: "{x} just landed in your available money. Give every euro a job!",
    catEmptyTitle: "Pockets are empty",
    catOverspendTitle: "Target overspent",
    catOverspend: "Careful! You passed this category's target. Move money from somewhere else to cover it.",
    fixEntry: "Fix this entry",
    moveFromOverspent: "This category is already overspent — moving money out of it frees nothing, it only makes it worse. Cover it from another category or from Ready to assign.",
    coverOverspend: "Cover overspend",
    ok: "OK",
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
    everyEuro: "κάθε ευρώ μια δουλειά", restored: "Το αντίγραφο επαναφέρθηκε.", badFile: "Μη έγκυρο αρχείο αντιγράφου KABATZA.",
    uncategorised: "Χωρίς κατηγορία", thisMonth: "αυτόν τον μήνα", needPerMonth: "/μήνα για τον στόχο",
    emptyBudget: "Πρόσθεσε κατηγορία για να ξεκινήσεις.", spent: "ξοδεύτηκαν", received: "εισπράχθηκαν",
    install: "Συμβουλή: κράτα κάθε τόσο αντίγραφο από το «Αντίγραφο & επαναφορά» για ασφάλεια.",
    confirm: "Επιβεβαίωση", schedule: "Πρόγραμμα", manageCats: "Κατηγορίες & ομάδες", ofWord: "από",
        backupNotice: "Ο προϋπολογισμός σου ζει μόνο σε αυτόν τον browser. Κράτα πού και πού αντίγραφο — «Αντίγραφο & επαναφορά», στο «Άλλα».",
    shortcutNotice: "Για εγκατάσταση σαν εφαρμογή — Άνοιξε το link στο Google Chrome → μενού ⋮ → «Προσθήκη στην αρχική οθόνη» → Προσθήκη.",
    gotIt: "Το κατάλαβα",
    srcSalary: "Μισθός", srcPension: "Σύνταξη", srcRents: "Ενοίκια", srcInvest: "Επενδύσεις",
    accounts: "Λογαριασμοί", totalSavings: "Συνολικές αποταμιεύσεις", addAccount: "Προσθήκη λογαριασμού",
    accountName: "Όνομα λογαριασμού", startingBalance: "Αρχικό υπόλοιπο", balance: "Υπόλοιπο",
    noAccounts: "Δεν υπάρχουν λογαριασμοί", noAccountsHint: "Πρόσθεσε έναν λογαριασμό αποταμίευσης ή μετρητών για να παρακολουθείς το υπόλοιπό του.",
    deleteAccountConfirm: "Διαγραφή αυτού του λογαριασμού;",
    move: "Μεταφορά", moveMoney: "Μεταφορά χρημάτων", from: "Από", to: "Προς", allAvailable: "Όλο το διαθέσιμο",
    willGoNegative: "Η πηγή θα βγει αρνητική.", moved: "Μεταφέρθηκαν", coverFromCategory: "Από άλλη κατηγορία",
    targets: "Στόχοι", scopeMonth: "Μόνο αυτόν τον μήνα", scopeForward: "Από αυτόν και μετά",
    targetsHint: "Κάθε ποσό μοιράζεται κάθε μήνα μέχρι να το αλλάξεις. Πάτησε ένα ποσό εξόδων για να το χρησιμοποιήσεις.",
    spentSoFar: "Μέχρι τώρα", lastMonth: "Προηγ. μήνας", avg3: "Μ.Ο. 3μ",
    savings: "Αποταμίευση", fromSavings: "Από αποταμίευση", toSavings: "Προς αποταμίευση", account: "Λογαριασμός",
    assignTo: "Μοίρασμα σε", readyToAssignOpt: "Για μοίρασμα (αργότερα)", exceedsBalance: "Ξεπερνά το υπόλοιπο του λογαριασμού.",
    deletedAccount: "Διαγραμμένος λογαριασμός", leftovers: "Περισσεύματα", allLeftovers: "Όλα τα περισσεύματα",
    savingsGoal: "Στόχος αποταμίευσης", goalThisMonth: "Στόχος μήνα", transfer: "Μεταφορά",
    incomeBySource: "Έσοδα ανά πηγή", incomeSources: "Πηγές εσόδων", addSource: "Νέα πηγή εσόδων", sourceName: "Όνομα πηγής",
    deleteSourceConfirm: "Διαγραφή πηγής; Τα έσοδα που έχεις ήδη καταχωρίσει μένουν, χωρίς πηγή.",
    reorder: "Ταξινόμηση", reorderHint: "Σύρε από τη λαβή ⠿ για να αλλάξεις σειρά. Μια κατηγορία μπορεί να πάει και σε άλλη ομάδα.",
    finalGoal: "Στόχος τελικού ποσού", finalAmount: "Τελικό ποσό", stillNeeded: "λείπουν", goalDone: "Ο στόχος ολοκληρώθηκε",
    perMonthUntil: "τον μήνα μέχρι", goalExpired: "έληξε", neededThisMonth: "λείπουν αυτόν τον μήνα", removeGoal: "Αφαίρεση στόχου",
    removeGoalMsg: "Τα χρήματα μένουν στην κατηγορία αυτόν τον μήνα. Ό,τι περισσέψει στο κλείσιμο του μήνα επιστρέφει στο «Για μοίρασμα».",
    goalMoneyNote: "Τα χρήματα των κατηγοριών-στόχων είναι ήδη δεσμευμένα — μην τα μεταφέρεις και εδώ.",
    help: "Βοήθεια", tutorial: "Μίνι οδηγός", tutorialTitle: "Καλώς ήρθες στο KABATZA", editBudget: "Επεξεργασία budget",
    tutorialSub: "Δώσε δουλειά σε κάθε ευρώ πριν το ξοδέψεις.",
    tutorialFull: "Δώσε σε κάθε ευρώ έναν σκοπό: Ξεκινά από τα διαθέσιμα χρήματα που έχεις και μοίρασέ τα όλα: Καθημερινά έξοδα, λογαριασμοί που θα πρέπει να πληρωθούν, αποταμίευση ή μεγαλύτερους στόχους, όπως μελλοντικές αγορές, διακοπές ή ταξίδια!\n\nΣυνέχισε να τα μοιράζεις μέχρι τα διαθέσιμα χρήματα να μηδενιστούν”. Αυτό δεν σημαίνει ότι ξόδεψες τα χρήματά σου. Σημαίνει ότι ξέρεις ήδη πού θέλεις να χρησιμοποιηθεί κάθε ευρώ.\nΌταν ξοδεύεις, καταχωρείς το έξοδο και το ποσό αφαιρείται από τον αντίστοιχο σκοπό.\n\nΣκοπός του app δεν είναι να σταματήσεις να ξοδεύεις. Είναι να ξοδεύεις συνειδητά ώστε στο τέλος να καταφέρνεις αυτά που πραγματικά θέλεις.\n\nΟ γάτος θα σε παρακολουθεί με tips και συμβουλές 😊",
    next: "Επόμενο", back: "Πίσω", start: "Ξεκίνα τον προϋπολογισμό", skip: "Παράλειψη",
    tutCatTitle: "Προϋπολογισμός", tutCatBody: "Στο tab “Προϋπολογισμός” θα βρεις τις βασικές κατηγορίες εξόδων και στόχων. Μπορείς να τις τροποποιήσεις με το μολύβι πάνω δεξιά.",
    tutTxTitle: "Κινήσεις", tutTxBody: "Εδώ προσθέτεις και αφαιρείς κάθε έσοδο και έξοδο αντίστοιχα. Τα έσοδα θα εμφανίζονται στα διαθέσιμα χρήματα. Τα έξοδα συμπληρώνουν την μπάρα που έχεις προϋπολογίσει",
    tutAccTitle: "Λογαριασμοί", tutAccBody: "Εδώ μπορείς να προσθέσεις τα χρήματα που έχεις αποταμιευμένα, σε επενδύσεις ή σε ρευστό",
    tutorialLocal: "Όλα μένουν στη συσκευή. Ξαναδές τον οδηγό όποτε θες από Άλλα → Μίνι οδηγός.",
    catRichTitle: "Ζει χαμένα", catRich: "Τα έξοδα είναι μέσα στο πλάνο — η γάτα νιώθει πλούσια.",
    catBrokeTitle: "Άφραγκη γάτα", catBroke: "Τα έξοδα πέρασαν όσα μοίρασες — κάλυψέ τα πριν πουλήσει τον καναπέ.",
    catNeutralTitle: "Η γάτα παρακολουθεί", catNeutral: "Μοίρασε χρήματα και καταχώρησε έξοδα για να διαμορφωθεί η διάθεσή της.",
    catRemain: "Έχουμε ακόμη {x} για αυτό το έξοδο.",
    catEmpty: "Δεν έχουμε άλλα λεφτά. Πρέπει να πάρουμε από κάπου αλλού. Μείωσε κάποιο άλλο έξοδο ή στόχο.",
    catIncomeTitle: "Μπήκαν λεφτά!",
    catIncome: "Μπήκαν {x} στα διαθέσιμα χρήματα. Δώσε σε κάθε ευρώ έναν σκοπό!",
    catEmptyTitle: "Τελείωσαν τα λεφτά",
    catOverspendTitle: "Ξεπέρασες τον στόχο",
    catOverspend: "Προσοχή! Ξεπέρασες τον στόχο αυτής της κατηγορίας. Μετακίνησε χρήματα από κάπου αλλού για να τον καλύψεις.",
    fixEntry: "Διόρθωση κίνησης",
    moveFromOverspent: "Αυτή η κατηγορία είναι ήδη εκτός budget — η μετακίνηση από εδώ δεν ελευθερώνει χρήματα, την κάνει χειρότερη. Κάλυψέ την από άλλη κατηγορία ή από το «Για μοίρασμα».",
    coverOverspend: "Κάλυψη υπέρβασης",
    ok: "Εντάξει",
  },
};

/* --------------------------- helpers ----------------------------- */
const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
// Local-date formatting: toISOString() is UTC and shifts dates back a day in Greece (UTC+2/+3).
const fmtLocal = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const todayISO = () => fmtLocal(new Date());
const round2 = (n) => Math.round(n * 100) / 100;
const toInput = (n) => (n ? String(round2(n)).replace(".", ",") : "");
const RTA = "__rta__";                 // "Για μοίρασμα" as a move/transfer source
const ALL = "__all__";                 // "all category leftovers" as a transfer source
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
// Works with "YYYY-MM" (<input type="month">) and "YYYY-MM-DD".
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

// Final-amount goal on a category: progress is the category's balance (like YNAB "have a balance of").
// With a date, the monthly share is what's missing spread over the months left (this one included).
function goalInfo(goal, available, assigned, mk) {
  if (!goal?.target) return null;
  const remaining = Math.max(0, goal.target - available);
  const expired = !!goal.byDate && goal.byDate.slice(0, 7) < mk;
  let perMonth = null, left = 0;
  if (goal.byDate && !expired) {
    const months = Math.max(1, monthsDiff(mk, goal.byDate) + 1);
    perMonth = Math.max(0, (goal.target - (available - assigned)) / months);
    left = Math.max(0, perMonth - assigned);
  }
  return { target: goal.target, byDate: goal.byDate, balance: available, remaining, expired, perMonth, left };
}

// Income sources: the four built-in ones keep a translation key as id (name null = translated);
// ones you add have their own name. Income transactions point to a source by id (tx.source).
const DEFAULT_SOURCES = () => ["srcSalary", "srcPension", "srcRents", "srcInvest"].map((id) => ({ id, name: null }));
const srcLabel = (t, sources, id) => {
  const x = (sources || []).find((v) => v.id === id);
  return x ? (x.name || t(x.id)) : t("income");
};

/* --------------------------- seed data --------------------------- */
function seedState() {
  const g1 = uid(), g2 = uid(), g3 = uid();
  const cat = (groupId, name) => ({ id: uid(), groupId, name, plan: [] });
  return {
    version: 5,
    settings: { lang: "el" },
    groups: [
      { id: g1, name: "Πάγια έξοδα" },
      { id: g2, name: "Καθημερινά" },
      { id: g3, name: "Στόχοι", isGoals: true },
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
      cat(g3, "Έκτακτο ταμείο"),
      cat(g3, "Διακοπές"),
    ],
    assignments: {},          // { 'YYYY-MM': { catId: amount } }
    transactions: [],         // { id, date, amount, categoryId|null, source?, payee, memo, scheduleId|null, accountId? }
                              // accountId set = savings transfer: +amount into the budget, −amount into savings
    schedules: [],            // { id, name, amount, categoryId|null, freq, nextDate, payee }
    accounts: [{ id: uid(), name: "Μετρητά", balance: 0 }],  // { id, name, balance }
    incomeSources: DEFAULT_SOURCES(),
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
// v3: category goals merged into a repeating assignment ("plan"). A monthly goal becomes a plan
// from this month; old goals are parked in legacyGoal, never deleted.
function withDefaults(state) {
  if (!state.accounts) state.accounts = [];
  if (!state.incomeSources) state.incomeSources = DEFAULT_SOURCES();
  if (!state.schedules) state.schedules = [];
  if (!state.assignments) state.assignments = {};
  if (!state.settings) state.settings = { lang: "el" };
  const nowMk = curMonth();
  state.categories = state.categories.map((c) => {
    if (c.plan) return c;
    const { goal, ...rest } = c;
    if (!goal) return { ...rest, plan: [] };
    const plan = goal.type === "monthly" && goal.target > 0 ? [{ from: nowMk, amount: goal.target }] : [];
    return { ...rest, plan, legacyGoal: goal };
  });
  // v4: final-amount goals live on categories only. Old "build a balance" goals come back as
  // final-amount goals; savings-account goals become categories in the "Στόχοι" group.
  if ((state.version || 0) < 4) {
    for (const c of state.categories) {
      if (!c.goal && c.legacyGoal?.type === "balance" && c.legacyGoal.target > 0) {
        c.goal = { target: c.legacyGoal.target, byDate: c.legacyGoal.byDate || "" };
        c.roll = { since: nowMk, until: null };
      }
    }
    const withGoal = state.accounts.filter((a) => a.goal?.target > 0);
    if (withGoal.length) {
      let g = state.groups.find((x) => x.name === "Στόχοι");
      if (!g) { g = { id: uid(), name: "Στόχοι" }; state.groups.push(g); }
      for (const a of withGoal) {
        state.categories.push({ id: uid(), groupId: g.id, name: a.name, plan: [],
          goal: { target: a.goal.target, byDate: a.goal.byDate || "" }, roll: { since: nowMk, until: null } });
      }
    }
    for (const a of state.accounts) delete a.goal;
  }
  // v5: final-amount goals are a "Στόχοι"-group-only feature — flag that group.
  if ((state.version || 0) < 5) {
    if (!state.groups.some((g) => g.isGoals)) {
      const g = state.groups.find((x) => x.name === "Στόχοι" || x.name === "Goals");
      if (g) g.isGoals = true;
    }
  }
  state.version = 5;
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


/* -------------------- mascot + onboarding -------------------- */
function effectiveAssigned(state, catId, mk) {
  const override = state?.assignments?.[mk]?.[catId];
  if (override !== undefined) return override || 0;
  return planFor(state?.categories?.find((c) => c.id === catId)?.plan, mk) || 0;
}
function monthBudgetHealth(state, dispMonth) {
  if (!state) return { status: "neutral", assigned: 0, spent: 0 };
  let assigned = 0, spent = 0;
  for (const c of state.categories || []) assigned += effectiveAssigned(state, c.id, dispMonth);
  state.transactions.forEach((x) => {
    if (x.categoryId && x.amount < 0 && monthKey(x.date) === dispMonth) spent += -x.amount;
  });
  if (assigned <= 0.005 && spent <= 0.005) return { status: "neutral", assigned, spent };
  return { status: spent > assigned + 0.005 ? "broke" : "rich", assigned, spent };
}
function expenseFeedback(state, tx) {
  const mk = monthKey(tx.date);
  const assigned = effectiveAssigned(state, tx.categoryId, mk);
  const spentBefore = (state?.transactions || []).reduce((sum, x) =>
    sum + (x.categoryId === tx.categoryId && x.amount < 0 && monthKey(x.date) === mk ? -x.amount : 0), 0);
  const remaining = assigned - (spentBefore + Math.abs(tx.amount));
  if (remaining >= -0.005) return { kind: "expense", remaining };
  const cat = state?.categories?.find((c) => c.id === tx.categoryId);
  return { kind: cat?.goal ? "overspend" : "empty", remaining };
}

function MascotBadge({ status = "neutral", size = 44, src: srcOverride }) {
  const broke = status === "broke";
  const src = srcOverride || (broke ? catBrokeImg : catRichImg);
  return (
    <img src={src} alt="" width={size} height={size} loading="eager" decoding="async" style={{
      width: size, height: size, objectFit: "cover", display: "block", flexShrink: 0,
      borderRadius: broke ? Math.max(10, size * 0.22) : "50%",
      border: `2px solid ${broke ? C.clay : C.gold}`,
      filter: status === "neutral" ? "grayscale(.55) opacity(.88)" : "none",
      animation: status === "rich" ? "mascotBounce 2.4s ease-in-out infinite" : "none",
      background: C.paper,
    }} />
  );
}

function TutorialSheet({ t, onClose }) {
  const [page, setPage] = useState(0);
  const pages = [
    { key: "general", icon: Wallet, status: "rich", title: t("tutorialTitle"), body: t("tutorialFull"), pre: true },
    { key: "cats", icon: Pencil, status: "neutral", title: t("tutCatTitle"), body: t("tutCatBody") },
    { key: "tx", icon: Receipt, status: "broke", title: t("tutTxTitle"), body: t("tutTxBody") },
    { key: "acc", icon: PiggyBank, status: "rich", title: t("tutAccTitle"), body: t("tutAccBody") },
  ];
  const cur = pages[page];
  const last = page === pages.length - 1;
  const MockCats = () => (
    <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 14, overflow: "hidden", marginTop: 12 }}>
      {[["Μαναβική", 0.62], ["Φαγητό έξω", 0.34], ["Στόχοι", 0.86]].map(([name, w], i) => (
        <div key={name} style={{ padding: "11px 12px", borderTop: i ? `1px solid ${C.line}` : "none", position: "relative" }}>
          <div style={{ display: "flex", justifyContent: "space-between", font: "600 13px 'Commissioner',sans-serif", color: C.ink }}><span>{name}</span><span style={{ color: C.muted }}>€</span></div>
          <div style={{ height: 6, borderRadius: 4, background: "#EBE8DB", marginTop: 8, overflow: "hidden" }}><div style={{ width: `${w * 100}%`, height: "100%", background: i === 1 ? C.clay : C.gold }} /></div>
          {i === 0 && <span className="tut-float" style={{ position: "absolute", right: 10, top: -7, background: C.gold, borderRadius: 100, padding: 6, boxShadow: "0 8px 16px rgba(0,0,0,.22)" }}><Pencil size={15} color="#12332E" /></span>}
        </div>
      ))}
    </div>
  );
  const MockTx = () => (
    <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
      {[["Μισθός", "+1.200 €", C.green], ["Σούπερ μάρκετ", "-84,20 €", C.ink], ["Καφές", "-3,50 €", C.ink]].map(([name, amt, col], i) => (
        <div key={name} className={`tut-slide tut-delay-${i + 1}`} style={{ display: "flex", alignItems: "center", gap: 10, background: C.card, border: `1px solid ${C.line}`, borderRadius: 13, padding: "10px 12px" }}>
          <span style={{ width: 32, height: 32, borderRadius: 10, display: "grid", placeItems: "center", background: i === 0 ? C.tealSoft : C.claySoft }}>{i === 0 ? <ArrowDownLeft size={16} color={C.teal} /> : <ArrowUpRight size={16} color={C.clay} />}</span>
          <span style={{ flex: 1, font: "600 13px 'Commissioner',sans-serif", color: C.ink }}>{name}</span>
          <span style={{ font: "700 13px 'Poppins',sans-serif", color: col }}>{amt}</span>
        </div>
      ))}
    </div>
  );
  const MockAcc = () => (
    <div style={{ marginTop: 12 }}>
      <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 14, padding: "12px 14px", display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ font: "600 13px 'Commissioner',sans-serif", color: C.muted }}>{t("totalSavings")}</span>
        <span style={{ font: "700 16px 'Poppins',sans-serif", color: C.ink }}>8.450 €</span>
      </div>
      {[["Μετρητά", "1.200 €"], ["Επενδύσεις", "6.800 €"], ["Ρευστό", "450 €"]].map(([name, amt], i) => (
        <div key={name} className={`tut-slide tut-delay-${i + 1}`} style={{ display: "flex", alignItems: "center", gap: 10, background: C.card, border: `1px solid ${C.line}`, borderRadius: 13, padding: "10px 12px", marginBottom: 8 }}>
          <span style={{ width: 32, height: 32, borderRadius: 10, display: "grid", placeItems: "center", background: C.goldSoft }}><PiggyBank size={16} color={C.gold} /></span>
          <span style={{ flex: 1, font: "600 13px 'Commissioner',sans-serif", color: C.ink }}>{name}</span>
          <span style={{ font: "700 13px 'Poppins',sans-serif", color: C.ink }}>{amt}</span>
        </div>
      ))}
    </div>
  );
  return (
    <Sheet title={t("tutorial")} onClose={onClose} t={t}>
      <div key={cur.key} className="tut-pop">
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
          <MascotBadge status={cur.status} size={62} />
          <div>
            <div style={{ font: "700 17px 'Commissioner',sans-serif", color: C.ink }}>{cur.title}</div>
            <div style={{ font: "600 12px 'Commissioner',sans-serif", color: C.muted, marginTop: 3 }}>{page + 1} / {pages.length}</div>
          </div>
        </div>
        <div style={{ background: C.paper, border: `1px solid ${C.line}`, borderRadius: 16, padding: "14px 15px", font: "500 14px/1.55 'Commissioner',sans-serif", color: C.ink, whiteSpace: cur.pre ? "pre-line" : "normal", position: "relative", overflow: "hidden", marginBottom: 12 }}>
          <span className="tut-shine" aria-hidden="true" />
          {cur.body}
          {cur.key === "cats" && <MockCats />}
          {cur.key === "tx" && <MockTx />}
          {cur.key === "acc" && <MockAcc />}
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: 7, margin: "4px 0 14px" }}>
        {pages.map((p, i) => <button key={p.key} onClick={() => setPage(i)} aria-label={`page ${i + 1}`} style={{ width: i === page ? 22 : 8, height: 8, borderRadius: 99, border: "none", cursor: "pointer", background: i === page ? C.teal : C.line, transition: "all .25s ease" }} />)}
      </div>
      <div style={{ display: "flex", gap: 9 }}>
        {page > 0 && <GhostBtn onClick={() => setPage(page - 1)}><ChevronLeft size={16} />{t("back")}</GhostBtn>}
        <div style={{ flex: 1 }}>{last ? <PrimaryBtn onClick={onClose}><Check size={18} />{t("start")}</PrimaryBtn> : <PrimaryBtn onClick={() => setPage(page + 1)}>{t("next")}<ChevronRight size={18} /></PrimaryBtn>}</div>
      </div>
      <div style={{ marginTop: 8 }}><GhostBtn onClick={onClose}>{t("skip")}</GhostBtn></div>
    </Sheet>
  );
}

const CAT_FEEDBACK_KINDS = {
  expense: {
    img: catExpenseImg, titleKey: "catRichTitle", good: true,
    msg: (t, f) => t("catRemain").replace("{x}", money(Math.max(0, f.remaining || 0))),
  },
  income: {
    img: catIncomeImg, titleKey: "catIncomeTitle", good: true,
    msg: (t, f) => t("catIncome").replace("{x}", money(Math.max(0, f.amount || 0))),
  },
  empty: {
    img: catEmptyImg, titleKey: "catEmptyTitle", good: false,
    msg: (t) => t("catEmpty"),
  },
  overspend: {
    img: catOverspendImg, titleKey: "catOverspendTitle", good: false,
    msg: (t) => t("catOverspend"),
  },
};
function CatFeedbackSheet({ t, feedback, onClose, onEdit }) {
  const kind = CAT_FEEDBACK_KINDS[feedback.kind] || CAT_FEEDBACK_KINDS[feedback.status === "broke" ? "empty" : "expense"];
  const color = kind.good ? C.teal : C.clay;
  return (
    <Sheet title={t(kind.titleKey)} onClose={onClose} t={t}>
      <div className="tut-pop" style={{ textAlign: "center", paddingTop: 6 }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
          <img src={kind.img} alt="" width={150} height={150} style={{
            width: 150, height: 150, objectFit: "cover", borderRadius: "50%",
            border: `3px solid ${kind.good ? C.gold : C.clay}`,
            animation: kind.good ? "mascotBounce 2.4s ease-in-out infinite" : "none",
            background: C.paper,
          }} />
        </div>
        <div style={{ font: "700 20px/1.35 'Commissioner',sans-serif", color, background: kind.good ? C.tealSoft : C.claySoft, borderRadius: 16, padding: "14px 16px", marginBottom: 16 }}>{kind.msg(t, feedback)}</div>
        <PrimaryBtn onClick={onClose} color={color}><Check size={18} />{t("ok")}</PrimaryBtn>
        {onEdit && <div style={{ marginTop: 10 }}><GhostBtn onClick={onEdit}><Pencil size={16} />{t("fixEntry")}</GhostBtn></div>}
      </div>
    </Sheet>
  );
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
  const [tutorialOpen, setTutorialOpen] = useState(() => { try { return !localStorage.getItem(TUTORIAL_KEY); } catch { return false; } });
  const [catFeedback, setCatFeedback] = useState(null);
  const fileRef = useRef(null);

  // persist on every change
  useEffect(() => { if (state) saveState(state); }, [state]);

  const lang = state?.settings?.lang || "el";
  const t = useCallback((k) => (STR[lang] && STR[lang][k]) || STR.en[k] || k, [lang]);
  // lang="el" makes uppercase labels drop the tonos (ΓΙΑ ΜΟΙΡΑΣΜΑ, not ΜΟΊΡΑΣΜΑ)
  useEffect(() => { document.documentElement.lang = lang; }, [lang]);

  const flash = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2600); };
  const closeTutorial = () => { setTutorialOpen(false); try { localStorage.setItem(TUTORIAL_KEY, "1"); } catch {} };

  /* ---- derived budget math ---- */
  // One pass over transactions → per-category, per-month activity.
  const calc = useMemo(() => {
    if (!state) return null;
    const { transactions, assignments, categories } = state;
    const nowMk = curMonth();
    const act = {};               // catId -> { "YYYY-MM": sum }
    let totalIncome = 0;
    for (const x of transactions) {
      if (x.categoryId === null) { totalIncome += x.amount; continue; }
      const mk = monthKey(x.date);
      const m = act[x.categoryId] || (act[x.categoryId] = {});
      m[mk] = (m[mk] || 0) + x.amount;
    }
    // Plans count up to the later of this month and the month on screen,
    // so looking ahead shows what "Για μοίρασμα" will be once those months are assigned.
    const horizon = dispMonth > nowMk ? dispMonth : nowMk;
    const prev = [1, 2, 3].map((i) => addMonthsKey(dispMonth, -i));
    let totalAssigned = 0;
    const byCat = {};
    for (const c of categories) {
      const a = act[c.id] || {};
      const months = new Set();
      for (const m in assignments) if (c.id in assignments[m]) months.add(m);
      if (c.plan?.length) for (let m = c.plan[0].from; m <= horizon; m = addMonthsKey(m, 1)) months.add(m);
      const assignedIn = (m) => assignments[m]?.[c.id] ?? planFor(c.plan, m);
      for (const m in a) months.add(m);
      // Months where the category keeps its leftovers: while it has a final-amount goal
      // (c.roll = { since, until }; until = month the goal was removed, null while active).
      const keeps = (m) => !!c.roll && m >= c.roll.since && (!c.roll.until || m <= c.roll.until);
      const sorted = [...months].sort();
      const last = sorted[sorted.length - 1];
      let carry = 0, available = 0;
      for (let m = sorted[0]; sorted.length && (m <= horizon || m <= last); m = addMonthsKey(m, 1)) {
        const asg = m <= horizon ? assignedIn(m) : (assignments[m]?.[c.id] ?? 0);
        const actM = a[m] || 0;
        let avail;
        if (keeps(m)) {
          // goal category: what's assigned goes in and stays; overspending isn't carried
          avail = carry + asg + actM;
          totalAssigned += asg;
          if (avail < 0) { totalAssigned -= avail; carry = 0; } else carry = avail;
          // goal removed: once that month has closed, what's left goes back to "Για μοίρασμα"
          if (!keeps(addMonthsKey(m, 1)) && m < nowMk) { totalAssigned -= carry; carry = 0; }
        } else {
          // Each month stands alone: closed months use up only what was spent (the rest went back
          // to "Για μοίρασμα"); this and coming months hold back what's assigned, or more if overspent.
          avail = asg + actM;
          totalAssigned += m < nowMk ? -actM : Math.max(asg, -actM);
          carry = 0;
        }
        if (m === dispMonth) available = avail;
      }
      if (!sorted.length || dispMonth < sorted[0]) available = 0;
      const hist = prev.filter((m) => m in a).map((m) => -a[m]);   // only months with activity count
      byCat[c.id] = {
        assigned: assignedIn(dispMonth),
        planned: planFor(c.plan, dispMonth),
        activity: a[dispMonth] || 0,
        available,
        spent: -(a[dispMonth] || 0),
        lastSpent: prev[0] in a ? -a[prev[0]] : null,
        avgSpent: hist.length ? hist.reduce((s, v) => s + v, 0) / hist.length : null,
        goal: goalInfo(c.goal, available, assignedIn(dispMonth), dispMonth),
      };
    }
    return { readyToAssign: totalIncome - totalAssigned, byCat, totalIncome, totalAssigned };
  }, [state, dispMonth]);

  const dueSchedules = useMemo(() => {
    if (!state) return [];
    const today = todayISO();
    return state.schedules.filter((s) => s.nextDate <= today);
  }, [state]);

  const budgetHealth = useMemo(() => monthBudgetHealth(state, dispMonth), [state, dispMonth]);

  if (!state || !calc) {
    return <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: C.paper, color: C.muted, font: "500 15px 'Commissioner',sans-serif" }}>…</div>;
  }

  /* ---- mutations ---- */
  const update = (fn) => setState((prev) => { const next = structuredClone(prev); fn(next); return next; });

  // A savings transfer moves an account's balance the opposite way to the budget:
  // +amount into the budget = −amount from the account. sign −1 undoes it.
  const applyTransfer = (s, tx, sign = 1) => {
    const a = tx?.accountId && s.accounts.find((x) => x.id === tx.accountId);
    if (a) a.balance = round2(a.balance - sign * tx.amount);
  };
  const addTx = (tx) => { const id = uid(); update((s) => { s.transactions.unshift({ id, scheduleId: null, ...tx }); }); return id; };
  const editTx = (id, tx) => update((s) => { const i = s.transactions.findIndex((x) => x.id === id); if (i > -1) s.transactions[i] = { ...s.transactions[i], ...tx }; });
  const delTx = (id) => update((s) => {
    applyTransfer(s, s.transactions.find((x) => x.id === id), -1);
    s.transactions = s.transactions.filter((x) => x.id !== id);
  });

  const monthAssign = (s) => s.assignments[dispMonth] || (s.assignments[dispMonth] = {});
  // Adjust this month's assignment relative to what's in effect (explicit, else the plan).
  const addAssigned = (s, cid, delta) => {
    const cur = s.assignments[dispMonth]?.[cid] ?? planFor(s.categories.find((c) => c.id === cid)?.plan, dispMonth);
    monthAssign(s)[cid] = round2(cur + delta);
  };
  const setAssigned = (catId, amount) => update((s) => { monthAssign(s)[catId] = round2(amount); });
  // scope "month": this month only. "forward": repeats every month from here until changed.
  const setAssignments = (entries, scope) => update((s) => {
    for (const { catId, amount } of entries) {
      if (scope === "month") { monthAssign(s)[catId] = amount; continue; }
      const c = s.categories.find((x) => x.id === catId); if (!c) continue;
      c.plan = setPlan(c.plan, dispMonth, amount);
      for (const m in s.assignments) if (m >= dispMonth) delete s.assignments[m][catId];
    }
  });
  // Final-amount goal. Setting one starts keeping leftovers from this month;
  // removing it keeps them through this month only (then they return to "Για μοίρασμα").
  const setCatGoal = (catId, goal) => update((s) => {
    const c = s.categories.find((x) => x.id === catId); if (!c) return;
    if (goal) {
      if (!c.goal) {
        const continues = c.roll?.until && c.roll.until >= addMonthsKey(dispMonth, -1);
        c.roll = continues ? { since: c.roll.since, until: null } : { since: dispMonth, until: null };
      }
      c.goal = goal;
    } else if (c.goal) {
      c.goal = null;
      if (c.roll) c.roll = dispMonth < c.roll.since ? null : { ...c.roll, until: dispMonth };
    }
  });
  const moveMoney = (fromId, toId, amt) => update((s) => {
    if (fromId !== RTA) addAssigned(s, fromId, -amt);
    if (toId !== RTA) addAssigned(s, toId, amt);
  });
  // tx.amount > 0: from savings into the budget; `cat` assigns it straight on (this month).
  // tx.amount < 0: into savings; `cat` = RTA, one category's leftover, or ALL category leftovers.
  const saveTransfer = (id, tx, cat) => {
    const takes = tx.amount >= 0 || !cat || cat === RTA ? []
      : cat === ALL ? Object.entries(calc.byCat).filter(([, v]) => !v.goal && v.available > 0.005).map(([cid, v]) => [cid, v.available])
      : [[cat, -tx.amount]];
    update((s) => {
      const i = s.transactions.findIndex((x) => x.id === id);
      if (i > -1) { applyTransfer(s, s.transactions[i], -1); s.transactions[i] = { ...s.transactions[i], ...tx }; applyTransfer(s, s.transactions[i]); }
      else { const nt = { id: uid(), categoryId: null, scheduleId: null, payee: "", ...tx }; s.transactions.unshift(nt); applyTransfer(s, nt); }
      if (cat && tx.amount > 0) addAssigned(s, cat, tx.amount);
      for (const [cid, amt] of takes) addAssigned(s, cid, -amt);
    });
  };

  const addCategory = (groupId, name) => update((s) => { s.categories.push({ id: uid(), groupId, name, plan: [] }); });
  const renameCategory = (id, name) => update((s) => { const c = s.categories.find((x) => x.id === id); if (c) c.name = name; });
  const delCategory = (id) => update((s) => {
    s.categories = s.categories.filter((x) => x.id !== id);
    s.transactions.forEach((x) => { if (x.categoryId === id) x.categoryId = null; });
    for (const m in s.assignments) delete s.assignments[m][id];
    s.schedules.forEach((x) => { if (x.categoryId === id) x.categoryId = null; });
  });
  const addGroup = (name) => update((s) => { s.groups.push({ id: uid(), name }); });
  const renameGroup = (id, name) => update((s) => { const g = s.groups.find((x) => x.id === id); if (g) g.name = name; });
  // dir −1 = up, +1 = down; the Budget screen lists groups in this order
  const moveGroup = (id, dir) => update((s) => {
    const i = s.groups.findIndex((x) => x.id === id), j = i + dir;
    if (i < 0 || j < 0 || j >= s.groups.length) return;
    [s.groups[i], s.groups[j]] = [s.groups[j], s.groups[i]];
  });
  // Move a category to position `toIndex` of group `toGroupId` (counted without the category itself).
  const moveCategory = (id, toGroupId, toIndex) => update((s) => {
    const i = s.categories.findIndex((c) => c.id === id); if (i < 0) return;
    const [c] = s.categories.splice(i, 1);
    c.groupId = toGroupId;
    const at = s.categories.reduce((acc, x, k) => (x.groupId === toGroupId ? [...acc, k] : acc), []);
    s.categories.splice(toIndex < at.length ? at[toIndex] : at.length ? at[at.length - 1] + 1 : s.categories.length, 0, c);
  });
  const addSource = (name) => update((s) => { s.incomeSources.push({ id: uid(), name }); });
  const renameSource = (id, name) => update((s) => { const x = s.incomeSources.find((v) => v.id === id); if (x) x.name = name; });
  const delSource = (id) => update((s) => { s.incomeSources = s.incomeSources.filter((v) => v.id !== id); });
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
    s.transactions.unshift({ id: uid(), date: sc.nextDate, amount: sc.amount, categoryId: sc.categoryId, ...(sc.source ? { source: sc.source } : {}), payee: sc.payee || sc.name, memo: "", scheduleId: sc.id });
    const i = s.schedules.findIndex((x) => x.id === sc.id);
    if (i > -1) s.schedules[i].nextDate = advanceDate(sc.nextDate, sc.freq);
  });

  const setLang = (l) => update((s) => { s.settings.lang = l; });
  const addAccount = (name, balance) => update((s) => { s.accounts.push({ id: uid(), name, balance }); });
  const editAccount = (id, name, balance) => update((s) => { const a = s.accounts.find((x) => x.id === id); if (a) { a.name = name; a.balance = balance; } });
  const delAccount = (id) => update((s) => { s.accounts = s.accounts.filter((x) => x.id !== id); });
  const dismissBackupNotice = () => update((s) => { s.settings.backupNoticeDismissed = true; });
  const clearAll = () => { setState(seedState()); flash(t("everyEuro")); };

  const accName = (id) => state.accounts.find((a) => a.id === id)?.name || t("deletedAccount");
  const txLabel = (x) => x.accountId
    ? `${x.amount >= 0 ? t("fromSavings") : t("toSavings")}: ${accName(x.accountId)}`
    : x.categoryId === null ? (x.source ? srcLabel(t, state.incomeSources, x.source)
      // older income kept its source only in the payee
      : state.incomeSources.map((v) => srcLabel(t, state.incomeSources, v.id)).find((l) => l === x.payee) || t("income"))
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
            health={budgetHealth}
            onCategory={(c) => setModal({ type: "assign", catId: c.id })}
            onManage={() => setModal({ type: "manage" })}
            onTargets={() => setModal({ type: "targets" })}
            onMove={() => setModal({ type: "move" })}
            onHelp={() => setTutorialOpen(true)}
            onDue={() => setTab("more")}
            backupNotice={!state.settings.backupNoticeDismissed && typeof window !== "undefined" && !window.Capacitor?.isNativePlatform?.()}
            onDismissNotice={dismissBackupNotice}
          />
        )}
        {tab === "transactions" && (
          <TransactionsScreen t={t} lang={lang} state={state} txLabel={txLabel}
            onEdit={(tx) => setModal(tx.accountId ? { type: "savings", tx } : { type: "tx", tx })} />
        )}
        {tab === "accounts" && (
          <AccountsScreen t={t} accounts={state.accounts} onAdd={() => setModal({ type: "account", account: null })}
            onEdit={(a) => setModal({ type: "account", account: a })}
            onTransfer={() => setModal({ type: "savings", dir: "out" })} />
        )}
        {tab === "reports" && <ReportsScreen t={t} lang={lang} state={state} dispMonth={dispMonth} txLabel={txLabel} />}
        {tab === "more" && (
          <MoreScreen
            t={t} lang={lang} state={state} due={dueSchedules}
            onEnterSchedule={enterSchedule} onDelSchedule={delSchedule}
            onNewSchedule={() => setModal({ type: "schedule" })}
            onManageCats={() => setModal({ type: "manage" })}
            onSetLang={setLang} onExportJSON={exportJSON} onExportCSV={exportCSV}
            onImport={() => fileRef.current?.click()} onClear={clearAll}
            onOpenTutorial={() => setTutorialOpen(true)}
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
            onSave={(tx) => {
              if (modal.tx) editTx(modal.tx.id, tx);
              else {
                const id = addTx(tx);
                if (tx.amount < 0 && tx.categoryId) setCatFeedback({ ...expenseFeedback(state, tx), tx: { ...tx, id } });
                else if (tx.amount > 0 && tx.categoryId === null && !tx.accountId) setCatFeedback({ kind: "income", amount: tx.amount, tx: { ...tx, id } });
              }
              setModal(null);
            }}
            onDelete={modal.tx ? () => { delTx(modal.tx.id); setModal(null); } : null} />
        )}
        {modal?.type === "assign" && (() => {
          const cat = state.categories.find((c) => c.id === modal.catId);
          if (!cat) return null;
          const allowGoal = !!state.groups.find((g) => g.id === cat.groupId)?.isGoals || !!cat.goal;
          return (
            <AssignSheet t={t} cat={cat} allowGoal={allowGoal} info={calc.byCat[cat.id]} dispMonth={dispMonth} lang={lang}
              hasAccounts={state.accounts.length > 0}
              onClose={() => setModal(null)}
              onAssign={(amt) => setAssigned(cat.id, amt)}
              onSetAmount={(amt, scope) => setAssignments([{ catId: cat.id, amount: amt }], scope)}
              onSetGoal={(goal) => setCatGoal(cat.id, goal)}
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
            onAddAccount={() => setModal({ type: "account", account: null, back: modal })}
            onSave={(tx, cat) => { saveTransfer(modal.tx?.id, tx, cat); setModal(modal.back || null); }}
            onDelete={modal.tx ? () => { delTx(modal.tx.id); setModal(null); } : null} />
        )}
        {modal?.type === "manage" && (
          <ManageSheet t={t} groupsView={groupsView}
            onClose={() => setModal(null)}
            onAddCategory={addCategory} onRenameCategory={renameCategory} onDelCategory={delCategory}
            onAddGroup={addGroup} onRenameGroup={renameGroup} onDelGroup={delGroup} onMoveGroup={moveGroup} onMoveCategory={moveCategory}
            sources={state.incomeSources.map((v) => ({ id: v.id, label: srcLabel(t, state.incomeSources, v.id) }))}
            onAddSource={addSource} onRenameSource={renameSource} onDelSource={delSource} />
        )}
        {modal?.type === "schedule" && (
          <ScheduleSheet t={t} state={state} onClose={() => setModal(null)}
            onSave={(sc) => { addSchedule(sc); setModal(null); }} />
        )}
        {modal?.type === "account" && (
          <AccountSheet t={t} initial={modal.account} onClose={() => setModal(modal.back || null)}
            onSave={(name, bal) => { modal.account ? editAccount(modal.account.id, name, bal) : addAccount(name, bal); setModal(modal.back || null); }}
            onDelete={modal.account ? () => { delAccount(modal.account.id); setModal(null); } : null} />
        )}

        {tutorialOpen && <TutorialSheet t={t} onClose={closeTutorial} />}
        {catFeedback && (
          <CatFeedbackSheet t={t} feedback={catFeedback} onClose={() => setCatFeedback(null)}
            onEdit={catFeedback.tx ? () => { const tx = catFeedback.tx; setCatFeedback(null); setModal({ type: "tx", tx }); } : null} />
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
function BudgetScreen({ t, lang, calc, groupsView, dispMonth, setDispMonth, onCategory, onManage, dueCount, onDue, backupNotice, onDismissNotice, onTargets, onMove, onHelp, health }) {
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
          <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <MascotBadge status={health?.status || "neutral"} size={84} />
            <span style={{
              fontFamily: "'Luckiest Guy',cursive", fontSize: 26, lineHeight: 1, paddingTop: 6, color: "#fff",
              textShadow: "-2px 0 0 #06211E,2px 0 0 #06211E,0 -2px 0 #06211E,0 2px 0 #06211E,-2px -2px 0 #06211E,2px -2px 0 #06211E,-2px 2px 0 #06211E,3px 3px 0 #06211E",
            }}>KABATZA</span>
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button onClick={onHelp} aria-label={t("help")} style={{ ...iconBtn, background: "rgba(243,239,226,.14)", width: 42, height: 42, borderRadius: "50%" }}>
              <HelpCircle size={21} color={C.coin} />
            </button>
            <button onClick={onManage} aria-label={t("edit")} style={{ ...iconBtn, background: C.gold, width: 50, height: 50, borderRadius: "50%", boxShadow: "0 4px 12px rgba(0,0,0,.25)", animation: "pulseGlow 2.6s ease-in-out infinite" }}>
              <Pencil size={23} color="#12332E" />
            </button>
          </span>
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

        {/* budget actions */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 8, marginTop: 16 }}>
          {[[Target, t("targets"), onTargets], [ArrowLeftRight, t("move"), onMove]].map(([Icon, label, fn]) => (
            <button key={label} onClick={fn} style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "10px 4px",
              background: "rgba(243,239,226,.12)", color: C.coin, border: "none", borderRadius: 12, cursor: "pointer",
              font: "600 12.5px 'Commissioner',sans-serif",
            }}><Icon size={18} color="#E5C173" />{label}</button>
          ))}
        </div>

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
                  <CategoryRow key={c.id} t={t} lang={lang} cat={c} info={calc.byCat[c.id]}
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

// Final-amount goal: balance against the goal, what's still needed, and the monthly share if dated.
function GoalLines({ t, lang, g }) {
  const done = g.remaining <= 0.005;
  return (
    <>
      <div style={{ marginTop: 9, height: 6, background: "#EBE8DB", borderRadius: 4, overflow: "hidden" }}>
        <div style={{ width: `${Math.max(0, Math.min(1, g.balance / g.target)) * 100}%`, height: "100%", borderRadius: 4, background: done ? C.green : C.gold, transition: "width .35s ease" }} />
      </div>
      <div style={{ font: "500 12px 'Commissioner',sans-serif", color: C.muted, marginTop: 5 }}>
        {money(Math.max(0, g.balance))} {t("ofWord")} {money(g.target)} · {done
          ? <b style={{ color: C.green }}>{t("goalDone")}</b>
          : <b style={{ color: C.ink }}>{t("stillNeeded")} {money(g.remaining)}</b>}
      </div>
      {g.byDate && (
        <div style={{ font: "500 12px 'Commissioner',sans-serif", color: g.expired ? C.clay : C.muted, marginTop: 2 }}>
          {g.expired
            ? `${t("goalExpired")} · ${monthLabel(g.byDate.slice(0, 7), lang)}`
            : !done && `${money(g.perMonth)} ${t("perMonthUntil")} ${monthLabel(g.byDate.slice(0, 7), lang)}`}
        </div>
      )}
    </>
  );
}

function CategoryRow({ t, lang, cat, info, last, onClick, dispMonth }) {
  const avail = info.available;
  const availColor = avail < -0.005 ? C.clay : avail > 0.005 ? C.green : C.muted;
  const spent = Math.max(0, -info.activity);   // outflow this month
  const over = avail < -0.005;
  const frac = info.assigned > 0.005 ? Math.min(1, spent / info.assigned) : (spent > 0.005 ? 1 : 0);
  return (
    <button onClick={onClick} style={{
      width: "100%", textAlign: "left", background: "transparent", border: "none",
      borderBottom: last ? "none" : `1px solid ${C.line}`, padding: "13px 16px 12px", cursor: "pointer",
      display: "block",
    }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
        <div style={{ font: "600 15px 'Commissioner',sans-serif", color: C.ink, minWidth: 0, flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {cat.name} {info.goal && <Target size={12} color={C.gold} style={{ verticalAlign: "middle", marginLeft: 2 }} />}
          {info.planned > 0 && <Repeat size={12} color={C.gold} style={{ verticalAlign: "middle", marginLeft: 2 }} />}
        </div>
        <div style={{ font: "700 16px 'Poppins',sans-serif", color: availColor, flexShrink: 0 }}>{money(avail)}</div>
      </div>

      {info.goal ? <GoalLines t={t} lang={lang} g={info.goal} /> : (<>
      {/* envelope depletion: spent vs assigned */}
      <div style={{ marginTop: 9, height: 6, background: "#EBE8DB", borderRadius: 4, overflow: "hidden" }}>
        <div style={{
          width: `${frac * 100}%`, height: "100%", borderRadius: 4,
          background: over ? C.clay : C.gold, transition: "width .35s ease",
        }} />
      </div>
      <div style={{ font: "500 12px 'Commissioner',sans-serif", color: over ? C.clay : C.muted, marginTop: 5 }}>
        {money(spent)} {t("ofWord")} {money(info.assigned)}
      </div>
      </>)}
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
function AccountsScreen({ t, accounts, onAdd, onEdit, onTransfer }) {
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
                padding: "14px 16px", display: "block",
              }}>
                <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                  <span style={{ font: "600 15px 'Commissioner',sans-serif", color: C.ink }}>{a.name}</span>
                  <span style={{ font: "700 16px 'Poppins',sans-serif", color: a.balance < 0 ? C.clay : C.ink }}>{money(a.balance)}</span>
                </span>
              </button>
            ))}
          </div>
        )}

        <div style={{ display: "flex", gap: 8 }}>
          <GhostBtn onClick={onAdd} color={C.ink}><Plus size={16} />{t("addAccount")}</GhostBtn>
          {accounts.length > 0 && <GhostBtn onClick={onTransfer} color={C.ink}><ArrowLeftRight size={16} />{t("transfer")}</GhostBtn>}
        </div>
        <div style={{ height: 12 }} />
      </Ledger>
    </div>
  );
}
function AccountSheet({ t, initial, onClose, onSave, onDelete }) {
  const [name, setName] = useState(initial?.name || "");
  const [bal, setBal] = useState(initial ? initial.balance.toString().replace(".", ",") : "");
  const [confirmDel, setConfirmDel] = useState(false);
  const valid = name.trim().length > 0 && !isNaN(parseAmount(bal || "0"));
  const submit = () => {
    const b = parseAmount(bal || "0");
    if (!valid) return;
    onSave(name.trim(), round2(b));
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
      {confirmDel && <ConfirmDialog t={t} message={t("deleteAccountConfirm")} onCancel={() => setConfirmDel(false)} onConfirm={onDelete} />}
      {onDelete && (
        <div style={{ marginTop: 10 }}>
          <button onClick={() => setConfirmDel(true)} style={{ width: "100%", padding: "13px", borderRadius: 12, border: "none", background: C.claySoft, color: C.clay, font: "600 15px 'Commissioner',sans-serif", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
            <Trash2 size={16} />{t("delete")}
          </button>
        </div>
      )}
    </Sheet>
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
                  const transfer = !!x.accountId;
                  return (
                    <button key={x.id} onClick={() => onEdit(x)} style={{
                      width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "13px 14px",
                      background: "transparent", border: "none", borderBottom: i === grp.items.length - 1 ? "none" : `1px solid ${C.line}`,
                      cursor: "pointer", textAlign: "left",
                    }}>
                      <div style={{ width: 38, height: 38, borderRadius: 11, flexShrink: 0, display: "grid", placeItems: "center",
                        background: transfer ? C.tealSoft : inflow ? C.goldSoft : C.claySoft }}>
                        {transfer ? <Landmark size={18} color={C.vault} />
                          : inflow ? <ArrowDownLeft size={18} color={C.vault} /> : <ArrowUpRight size={18} color={C.clay} />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ font: "600 15px 'Commissioner',sans-serif", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {x.payee || x.memo || (transfer ? t("savings") : inflow ? t("inflow") : t("outflow"))}
                        </div>
                        <div style={{ font: "500 12px 'Commissioner',sans-serif", color: C.muted, marginTop: 2 }}>{txLabel(x)}</div>
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
function ReportsScreen({ t, lang, state, dispMonth, txLabel }) {
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

  // income by source, this month (savings transfers aren't income)
  const income = useMemo(() => {
    const map = {};
    for (const x of state.transactions) {
      if (x.categoryId !== null || x.accountId || x.amount <= 0 || monthKey(x.date) !== dispMonth) continue;
      const name = txLabel(x);
      map[name] = (map[name] || 0) + x.amount;
    }
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [state, dispMonth, txLabel]);
  const totalIncome = income.reduce((s, x) => s + x.value, 0);

  // income vs expense, last 6 months
  const trend = useMemo(() => {
    const out = [];
    for (let i = 5; i >= 0; i--) {
      const mk = addMonthsKey(dispMonth, -i);
      let inc = 0, exp = 0;
      state.transactions.forEach((x) => {
        if (monthKey(x.date) !== mk || x.accountId) return;
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
          <CardTitle icon={ArrowDownLeft}>{t("incomeBySource")}</CardTitle>
          {income.length === 0 ? <MiniEmpty t={t} /> : (
            <>
              <div style={{ font: "700 26px 'Poppins',sans-serif", color: C.ink, margin: "2px 0 12px" }}>{money(totalIncome)}</div>
              {income.map((x) => (
                <div key={x.name} style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10, font: "600 14px 'Commissioner',sans-serif", color: C.ink }}>
                    <span>{x.name}</span>
                    <span style={{ fontFamily: "'Poppins',sans-serif" }}>
                      {money(x.value)} <span style={{ font: "500 12px 'Commissioner',sans-serif", color: C.muted }}>· {Math.round((x.value / totalIncome) * 100)}%</span>
                    </span>
                  </div>
                  <div style={{ marginTop: 6, height: 6, background: "#EBE8DB", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ width: `${(x.value / totalIncome) * 100}%`, height: "100%", borderRadius: 4, background: C.teal }} />
                  </div>
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
function MoreScreen({ t, lang, state, due, onEnterSchedule, onDelSchedule, onNewSchedule, onManageCats, onSetLang, onExportJSON, onExportCSV, onImport, onClear, onOpenTutorial }) {
  const [confirmClear, setConfirmClear] = useState(false);
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

        {/* Tutorial */}
        <Card>
          <button onClick={onOpenTutorial} style={{ width: "100%", background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, padding: 0, textAlign: "start" }}>
            <MascotBadge status="rich" size={46} />
            <span style={{ flex: 1 }}>
              <span style={{ display: "block", font: "700 15px 'Commissioner',sans-serif", color: C.ink }}>{t("tutorial")}</span>
              <span style={{ display: "block", font: "500 12.5px 'Commissioner',sans-serif", color: C.muted, marginTop: 2 }}>{t("tutorialSub")}</span>
            </span>
            <ChevronRight size={20} color={C.muted} />
          </button>
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
          <button onClick={() => setConfirmClear(true)} style={{ width: "100%", background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 9, color: C.clay, font: "600 15px 'Commissioner',sans-serif", padding: "2px 0" }}>
            <RotateCcw size={18} />{t("clearAll")}
          </button>
        </Card>

        <div style={{ display: "flex", gap: 8, alignItems: "flex-start", padding: "4px 6px 20px", color: C.muted, font: "500 12px/1.5 'Commissioner',sans-serif" }}>
          <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
          <span>{t("install")}</span>
        </div>
      </div>
      </Ledger>
      {confirmClear && <ConfirmDialog t={t} title={t("clearAll")} message={t("clearAllConfirm")} confirmText={t("clearAll")}
        onCancel={() => setConfirmClear(false)} onConfirm={() => { setConfirmClear(false); onClear(); }} />}
    </div>
  );
}

/* ===================== Transaction sheet ======================== */
function TxSheet({ t, state, initial, dispMonth, onClose, onSave, onDelete }) {
  const [inflow, setInflow] = useState(initial ? initial.amount >= 0 : false);
  const [amount, setAmount] = useState(initial ? Math.abs(initial.amount).toString().replace(".", ",") : "");
  const [catId, setCatId] = useState(initial ? initial.categoryId : (state.categories[0]?.id ?? null));
  // Income keeps categoryId null (so "Για μοίρασμα" math is untouched) and points to a source by id.
  const SRC = state.incomeSources.map((v) => v.id);
  const label = (id) => srcLabel(t, state.incomeSources, id);
  const [src, setSrc] = useState(() => {
    if (initial && initial.categoryId === null) {
      if (SRC.includes(initial.source)) return initial.source;
      const hit = SRC.find((k) => label(k) === initial.payee);   // older entries kept the source in the payee
      if (hit) return hit;
    }
    return SRC[0] || "";
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
      ...(inflow ? { source: src } : {}),
      payee: inflow ? (payee.trim() || label(src)) : payee.trim(),
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
            {SRC.length ? SRC.map((k) => <option key={k} value={k}>{label(k)}</option>) : <option value="">{t("income")}</option>}
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
function AssignSheet({ t, cat, allowGoal, info, dispMonth, lang, hasAccounts, onClose, onAssign, onSetAmount, onSetGoal, onMove, onFromSavings }) {
  const [amount, setAmount] = useState(toInput(info.assigned));
  const [goalAmt, setGoalAmt] = useState(toInput(cat.goal?.target));
  const [goalDate, setGoalDate] = useState(cat.goal?.byDate || "");
  const [goalDirty, setGoalDirty] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const g = info.goal;
  const [scope, setScope] = useState("forward");
  const [dirty, setDirty] = useState(false);   // only the amount field / scope toggle commit a repeating change
  const edit = (v) => { setAmount(v); setDirty(true); };

  // one-off top-ups (cover overspending) apply to this month only
  const apply = (amt) => { onAssign(amt); setAmount(toInput(amt)); };

  // Persist edits without closing (also used before jumping to Move / Savings).
  const commit = () => {
    if (goalDirty) {
      const gt = parseAmount(goalAmt);
      if (!isNaN(gt) && gt > 0) onSetGoal({ target: round2(gt), byDate: goalDate });
      setGoalDirty(false);
    }
    if (!dirty) return;
    const v = amount.trim() === "" ? 0 : parseAmount(amount);
    if (!isNaN(v)) onSetAmount(round2(v), scope);
    setDirty(false);
  };

  const overspend = info.available < 0 ? -info.available : 0;

  return (
    <Sheet title={cat.name} onClose={onClose} t={t}>
      {/* status strip */}
      <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
        <Stat label={t("assigned")} value={money(info.assigned)} />
        <Stat label={t("activity")} value={money(info.activity)} />
        <Stat label={t("available")} value={money(info.available)} accent={info.available < 0 ? C.clay : info.available > 0 ? C.green : C.muted} />
      </div>

      <Field label={`${t("assignedThisMonth")} · ${monthLabel(dispMonth, lang)} (€)`}>
        <input inputMode="decimal" value={amount} onChange={(e) => edit(e.target.value)} placeholder="0,00"
          style={{ ...inputStyle, font: "700 22px 'Poppins',sans-serif", textAlign: "right" }} />
        <SpendHints t={t} info={info} onPick={(v) => edit(toInput(v))} />
      </Field>
      <Segmented value={scope} onChange={(v) => { setScope(v); setDirty(true); }}
        options={[["month", t("scopeMonth")], ["forward", t("scopeForward")]]} />

      {overspend > 0.005 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
          <Chip onClick={() => apply(round2(info.assigned + overspend))} color={C.clay} bg={C.claySoft}>
            {t("coverOverspend")} +{money(overspend)}
          </Chip>
          <Chip onClick={() => { commit(); onMove({ toId: cat.id, amount: overspend }); }} color={C.clay} bg={C.claySoft}>
            {t("coverFromCategory")}
          </Chip>
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
        <GhostBtn color={C.ink} onClick={() => { commit(); onMove(info.available > 0.005 ? { fromId: cat.id } : { toId: cat.id }); }}>
          <ArrowLeftRight size={16} />{t("move")}
        </GhostBtn>
        {hasAccounts && (
          <GhostBtn color={C.ink} onClick={() => { commit(); onFromSavings({ catId: cat.id, amount: round2(overspend) }); }}>
            <Landmark size={16} />{t("fromSavings")}
          </GhostBtn>
        )}
      </div>

      {/* final-amount goal (YNAB "have a balance of"): only for categories in the "Στόχοι" group */}
      {allowGoal && (
      <div style={{ borderTop: `1px solid ${C.line}`, paddingTop: 16, marginBottom: 16 }}>
        <label style={fieldLabel}>{t("finalGoal")}</label>
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <Field label={`${t("finalAmount")} (€)`}>
              <input inputMode="decimal" value={goalAmt} onChange={(e) => { setGoalAmt(e.target.value); setGoalDirty(true); }} placeholder="—" style={inputStyle} />
            </Field>
          </div>
          <div style={{ flex: 1 }}>
            <Field label={t("byDate")}>
              <input type="month" value={goalDate} onChange={(e) => { setGoalDate(e.target.value); setGoalDirty(true); }} style={inputStyle} />
            </Field>
          </div>
        </div>
        {g && (
          <>
            <GoalLines t={t} lang={lang} g={g} />
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, marginTop: 12 }}>
              {g.left > 0.005 && (
                <Chip onClick={() => apply(round2(info.assigned + g.left))}>
                  {t("neededThisMonth")} +{money(g.left)}
                </Chip>
              )}
              <button onClick={() => setConfirmRemove(true)} style={{ border: "none", background: "transparent", color: C.clay, font: "600 13px 'Commissioner',sans-serif", cursor: "pointer", padding: "6px 0" }}>
                {t("removeGoal")}
              </button>
            </div>
          </>
        )}
      </div>
      )}
      {confirmRemove && (
        <ConfirmDialog t={t} title={t("removeGoal")} message={t("removeGoalMsg")} confirmText={t("removeGoal")}
          onCancel={() => setConfirmRemove(false)}
          onConfirm={() => { setConfirmRemove(false); onSetGoal(null); setGoalAmt(""); setGoalDate(""); setGoalDirty(false); }} />
      )}

      <PrimaryBtn onClick={() => { commit(); onClose(); }}><Check size={18} />{t("save")}</PrimaryBtn>
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
function ManageSheet({ t, groupsView, onClose, onAddCategory, onRenameCategory, onDelCategory, onAddGroup, onRenameGroup, onDelGroup, onMoveGroup, onMoveCategory, sources, onAddSource, onRenameSource, onDelSource }) {
  const [dialog, setDialog] = useState(null);
  const [sorting, setSorting] = useState(false);
  const close = () => setDialog(null);

  /* ---- Reorder mode (like YNAB's "Reorder"): drag ⠿ handles, touch or mouse ----
     refs: "g:<id>" group box, "h:<id>" group header, "c:<id>" category row.
     The dragged item follows the finger by measuring its untransformed position each move,
     so it stays put when the layout changes (groups folding to titles, swaps re-rendering). */
  const refs = useRef({});
  const gv = useRef(groupsView); gv.current = groupsView;
  const [drag, setDrag] = useState(null);            // { kind: "g"|"c", id, ty }
  const shownTy = useRef(0); shownTy.current = drag?.ty || 0;

  // what the dragged item swaps with next, and how
  const groupTarget = (id, down) => {
    const gs = gv.current, i = gs.findIndex((g) => g.id === id), j = down ? i + 1 : i - 1;
    if (i < 0 || j < 0 || j >= gs.length) return null;
    return { key: "g:" + gs[j].id, apply: () => onMoveGroup(id, down ? 1 : -1) };
  };
  const catTarget = (id, down) => {
    const gs = gv.current, gi = gs.findIndex((g) => g.cats.some((c) => c.id === id));
    if (gi < 0) return null;
    const cats = gs[gi].cats, ci = cats.findIndex((c) => c.id === id);
    if (down) {
      if (ci < cats.length - 1) return { key: "c:" + cats[ci + 1].id, apply: () => onMoveCategory(id, gs[gi].id, ci + 1) };
      if (gi < gs.length - 1) return { key: "h:" + gs[gi + 1].id, apply: () => onMoveCategory(id, gs[gi + 1].id, 0) };
    } else {
      if (ci > 0) return { key: "c:" + cats[ci - 1].id, apply: () => onMoveCategory(id, gs[gi].id, ci - 1) };
      if (gi > 0) return { key: "h:" + gs[gi].id, apply: () => onMoveCategory(id, gs[gi - 1].id, gs[gi - 1].cats.length) };
    }
    return null;
  };

  const startDrag = (e, kind, id) => {
    e.preventDefault();
    const key = kind + ":" + id;
    const st = { grab: e.clientY - refs.current[key].getBoundingClientRect().top, lock: false };
    const move = (ev) => {
      const el = refs.current[key]; if (!el) return;
      const r = el.getBoundingClientRect();
      const top = ev.clientY - st.grab;
      const ty = top - (r.top - shownTy.current);
      if (!st.lock) {
        const down = ty > 0, mid = top + r.height / 2;
        const tg = kind === "g" ? groupTarget(id, down) : catTarget(id, down);
        const nr = tg && refs.current[tg.key]?.getBoundingClientRect();
        if (nr && (down ? mid > nr.top + nr.height / 2 : mid < nr.top + nr.height / 2)) {
          st.lock = true;                              // one swap per layout: wait for React to re-render
          tg.apply();
          requestAnimationFrame(() => requestAnimationFrame(() => { st.lock = false; }));
        }
      }
      setDrag({ kind, id, ty });
    };
    const end = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
      setDrag(null);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
    setDrag({ kind, id, ty: 0 });
  };
  const lifted = (on, extra) => ({
    position: "relative", zIndex: on ? 5 : "auto",
    transform: on ? `translateY(${drag.ty}px)` : "none",
    boxShadow: on ? "0 14px 30px rgba(21,32,43,.22)" : "none",
    transition: on ? "none" : "transform .15s ease", ...extra,
  });
  const handle = (kind, id) => (
    <span onPointerDown={(e) => startDrag(e, kind, id)} aria-label={`drag-${kind}`}
      style={{ display: "inline-flex", padding: "6px 4px", cursor: "grab", touchAction: "none", userSelect: "none" }}>
      <GripVertical size={18} color={C.muted} />
    </span>
  );

  return (
    <Sheet title={t("manageCats")} onClose={onClose} t={t}>
      <button onClick={() => setSorting((v) => !v)} style={{
        width: "100%", border: "none", cursor: "pointer", marginBottom: 14,
        background: sorting ? C.teal : C.gold, color: sorting ? "#fff" : "#12332E",
        borderRadius: 14, padding: "13px 16px",
        font: "800 14.5px 'Commissioner',sans-serif", textTransform: "uppercase", letterSpacing: ".06em",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 9,
        boxShadow: "0 5px 14px rgba(0,0,0,.22)",
      }}>{sorting ? <><Check size={19} />{t("done")}</> : <><ArrowUpDown size={19} />{t("reorder")}</>}</button>

      {sorting ? (
        <>
          <div style={{ font: "500 13px/1.45 'Commissioner',sans-serif", color: C.muted, margin: "-4px 0 14px" }}>{t("reorderHint")}</div>
          {groupsView.map((g) => (
            <div key={g.id} ref={(el) => { refs.current["g:" + g.id] = el; }}
              style={lifted(drag?.kind === "g" && drag.id === g.id, { marginBottom: 12, background: C.card, border: `1px solid ${C.line}`, borderRadius: 14 })}>
              <div ref={(el) => { refs.current["h:" + g.id] = el; }} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 10px" }}>
                {handle("g", g.id)}
                <span style={{ font: "600 13px 'Commissioner',sans-serif", letterSpacing: ".05em", textTransform: "uppercase", color: C.muted }}>{g.name}</span>
              </div>
              {drag?.kind !== "g" && g.cats.map((c, ci) => (
                <div key={c.id} ref={(el) => { refs.current["c:" + c.id] = el; }}
                  style={lifted(drag?.kind === "c" && drag.id === c.id, {
                    display: "flex", alignItems: "center", gap: 6, padding: "3px 10px", borderTop: `1px solid ${C.line}`,
                    background: C.card, borderRadius: drag?.id === c.id ? 10 : ci === g.cats.length - 1 ? "0 0 13px 13px" : 0,
                  })}>
                  {handle("c", c.id)}
                  <span style={{ font: "600 15px 'Commissioner',sans-serif", color: C.ink }}>{c.name}</span>
                </div>
              ))}
            </div>
          ))}
        </>
      ) : (
        <>
          {/* income sources ("categories" for income) */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ font: "600 13px 'Commissioner',sans-serif", letterSpacing: ".05em", textTransform: "uppercase", color: C.teal, marginBottom: 8 }}>{t("incomeSources")}</div>
            <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.line}`, overflow: "hidden" }}>
              {sources.map((v) => (
                <div key={v.id} style={{ display: "flex", alignItems: "center", gap: 6, padding: "11px 14px", borderBottom: `1px solid ${C.line}` }}>
                  <ArrowDownLeft size={15} color={C.teal} />
                  <span style={{ flex: 1, font: "600 15px 'Commissioner',sans-serif" }}>{v.label}</span>
                  <button onClick={() => setDialog({ kind: "renameSrc", id: v.id, name: v.label })} aria-label={t("rename")} style={iconBtn}><Pencil size={15} color={C.muted} /></button>
                  <button onClick={() => setDialog({ kind: "delSrc", id: v.id })} aria-label={t("delete")} style={iconBtn}><Trash2 size={15} color={C.clay} /></button>
                </div>
              ))}
              <button onClick={() => setDialog({ kind: "addSrc" })} style={{ width: "100%", padding: "11px", background: "transparent", border: "none", color: C.teal, font: "600 14px 'Commissioner',sans-serif", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <Plus size={16} />{t("addSource")}
              </button>
            </div>
          </div>

          {groupsView.map((g) => (
            <div key={g.id} style={{ marginBottom: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                <span style={{ flex: 1, font: "600 13px 'Commissioner',sans-serif", letterSpacing: ".05em", textTransform: "uppercase", color: C.muted }}>{g.name}</span>
                <button onClick={() => setDialog({ kind: "renameGroup", id: g.id, name: g.name })} aria-label={t("rename")} style={iconBtn}><Pencil size={15} color={C.muted} /></button>
                <button onClick={() => setDialog({ kind: "delGroup", id: g.id })} aria-label={t("delete")} style={iconBtn}><Trash2 size={15} color={C.clay} /></button>
              </div>
              <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.line}`, overflow: "hidden" }}>
                {g.cats.map((c, i) => (
                  <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 6, padding: "11px 14px", borderBottom: i === g.cats.length - 1 ? "none" : `1px solid ${C.line}` }}>
                    <span style={{ flex: 1, font: "600 15px 'Commissioner',sans-serif" }}>{c.name} {c.plan?.some((st) => st.amount > 0) && <Repeat size={12} color={C.gold} style={{ verticalAlign: "middle" }} />}</span>
                    <button onClick={() => setDialog({ kind: "renameCat", id: c.id, name: c.name })} aria-label={t("rename")} style={iconBtn}><Pencil size={15} color={C.muted} /></button>
                    <button onClick={() => setDialog({ kind: "delCat", id: c.id })} aria-label={t("delete")} style={iconBtn}><Trash2 size={15} color={C.clay} /></button>
                  </div>
                ))}
                <button onClick={() => setDialog({ kind: "addCat", groupId: g.id })} style={{ width: "100%", padding: "11px", background: "transparent", border: "none", borderTop: g.cats.length ? `1px solid ${C.line}` : "none", color: C.teal, font: "600 14px 'Commissioner',sans-serif", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  <Plus size={16} />{t("addCategory")}
                </button>
              </div>
            </div>
          ))}
          <GhostBtn onClick={() => setDialog({ kind: "addGroup" })} color={C.ink}><FolderPlus size={17} />{t("addGroup")}</GhostBtn>
        </>
      )}

      {dialog?.kind === "addSrc" && <PromptDialog t={t} title={t("addSource")} label={t("sourceName")} onCancel={close} onSubmit={(n) => { onAddSource(n); close(); }} />}
      {dialog?.kind === "renameSrc" && <PromptDialog t={t} title={t("rename")} label={t("sourceName")} initial={dialog.name} onCancel={close} onSubmit={(n) => { onRenameSource(dialog.id, n); close(); }} />}
      {dialog?.kind === "delSrc" && <ConfirmDialog t={t} message={t("deleteSourceConfirm")} onCancel={close} onConfirm={() => { onDelSource(dialog.id); close(); }} />}
      {dialog?.kind === "addCat" && <PromptDialog t={t} title={t("addCategory")} label={t("categoryName")} onCancel={close} onSubmit={(n) => { onAddCategory(dialog.groupId, n); close(); }} />}
      {dialog?.kind === "renameCat" && <PromptDialog t={t} title={t("rename")} label={t("categoryName")} initial={dialog.name} onCancel={close} onSubmit={(n) => { onRenameCategory(dialog.id, n); close(); }} />}
      {dialog?.kind === "delCat" && <ConfirmDialog t={t} message={t("deleteCatConfirm")} onCancel={close} onConfirm={() => { onDelCategory(dialog.id); close(); }} />}
      {dialog?.kind === "addGroup" && <PromptDialog t={t} title={t("addGroup")} label={t("groupName")} onCancel={close} onSubmit={(n) => { onAddGroup(n); close(); }} />}
      {dialog?.kind === "renameGroup" && <PromptDialog t={t} title={t("rename")} label={t("groupName")} initial={dialog.name} onCancel={close} onSubmit={(n) => { onRenameGroup(dialog.id, n); close(); }} />}
      {dialog?.kind === "delGroup" && <ConfirmDialog t={t} message={t("deleteGroupConfirm")} onCancel={close} onConfirm={() => { onDelGroup(dialog.id); close(); }} />}
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

/* ===================== dialogs & small controls ================= */
function Dialog({ children, onClose }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(21,32,43,.45)", zIndex: 70, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 360, background: C.card, borderRadius: 18, padding: 18, boxShadow: "0 20px 60px rgba(21,32,43,.3)" }}>{children}</div>
    </div>
  );
}
function PromptDialog({ t, title, label, initial = "", onCancel, onSubmit }) {
  const [v, setV] = useState(initial);
  const ok = v.trim().length > 0;
  return (
    <Dialog onClose={onCancel}>
      <h3 style={{ font: "600 17px 'Commissioner',sans-serif", margin: "0 0 14px", color: C.ink }}>{title}</h3>
      {label && <label style={fieldLabel}>{label}</label>}
      <input autoFocus value={v} onChange={(e) => setV(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && ok) onSubmit(v.trim()); }} style={{ ...inputStyle, marginBottom: 16 }} />
      <div style={{ display: "flex", gap: 8 }}>
        <GhostBtn onClick={onCancel}>{t("cancel")}</GhostBtn>
        <div style={{ flex: 1 }}><PrimaryBtn onClick={() => ok && onSubmit(v.trim())} disabled={!ok}>{t("save")}</PrimaryBtn></div>
      </div>
    </Dialog>
  );
}
function ConfirmDialog({ t, title, message, confirmText, onCancel, onConfirm }) {
  return (
    <Dialog onClose={onCancel}>
      {title && <h3 style={{ font: "600 17px 'Commissioner',sans-serif", margin: "0 0 8px", color: C.ink }}>{title}</h3>}
      <p style={{ font: "500 14px/1.5 'Commissioner',sans-serif", color: C.muted, margin: "0 0 16px" }}>{message}</p>
      <div style={{ display: "flex", gap: 8 }}>
        <GhostBtn onClick={onCancel}>{t("cancel")}</GhostBtn>
        <div style={{ flex: 1 }}><PrimaryBtn onClick={onConfirm} color={C.clay}>{confirmText || t("delete")}</PrimaryBtn></div>
      </div>
    </Dialog>
  );
}
function Segmented({ value, options, onChange }) {
  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
      {options.map(([v, label, Icon]) => (
        <button key={String(v)} onClick={() => onChange(v)} style={{
          flex: 1, padding: "11px 6px", borderRadius: 12, cursor: "pointer", font: "600 13.5px 'Commissioner',sans-serif",
          display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
          border: `1.5px solid ${value === v ? C.teal : C.line}`,
          background: value === v ? C.tealSoft : C.card, color: value === v ? C.teal : C.muted,
        }}>{Icon && <Icon size={16} />}{label}</button>
      ))}
    </div>
  );
}
// Tappable spending figures: this month so far, last month, 3-month average.
function SpendHints({ t, info, onPick }) {
  const items = [[t("spentSoFar"), info.spent], [t("lastMonth"), info.lastSpent], [t("avg3"), info.avgSpent]]
    .filter(([, v]) => v != null && v > 0.005);
  if (!items.length) return null;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 7 }}>
      {items.map(([label, v]) => (
        <button key={label} onClick={() => onPick(Math.ceil(v))} style={{
          border: `1px solid ${C.line}`, background: C.paper, color: C.ink, borderRadius: 8, padding: "5px 8px",
          font: "500 12px 'Commissioner',sans-serif", cursor: "pointer",
        }}>{label} <b style={{ fontFamily: "'Poppins',sans-serif" }}>{moneyShort(Math.ceil(v))}</b></button>
      ))}
    </div>
  );
}
const selectStyle = { ...inputStyle, appearance: "none", backgroundColor: "#FBFCFC", backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2371796F' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'><path d='m6 9 6 6 6-6'/></svg>\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 13px center", paddingRight: 40 };
const amountStyle = { ...inputStyle, font: "700 22px 'Poppins',sans-serif", textAlign: "right" };
function DangerBtn({ children, onClick }) {
  return (
    <button onClick={onClick} style={{ width: "100%", marginTop: 10, padding: "13px", borderRadius: 12, border: "none", background: C.claySoft, color: C.clay, font: "600 15px 'Commissioner',sans-serif", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
      {children}
    </button>
  );
}

/* ========================= Move sheet =========================== */
function MoveSheet({ t, groupsView, calc, preset, onClose, onMove }) {
  const cats = groupsView.flatMap((g) => g.cats);
  const av = (id) => (id === RTA ? calc.readyToAssign : calc.byCat[id]?.available ?? 0);
  const pick = (pred, cmp) => cats.filter(pred).sort(cmp)[0]?.id;
  // Defaults: to = most overspent category, from = category with the most available.
  const defTo = preset.toId ?? pick((c) => av(c.id) < -0.005 && c.id !== preset.fromId, (a, b) => av(a.id) - av(b.id)) ?? RTA;
  const defFrom = preset.fromId ?? pick((c) => av(c.id) > 0.005 && c.id !== defTo, (a, b) => av(b.id) - av(a.id)) ?? RTA;
  const [fromId, setFromId] = useState(defFrom);
  const [toId, setToId] = useState(defTo);
  const [amount, setAmount] = useState(toInput(preset.amount));
  const amt = parseAmount(amount);
  // Money already spent can't be "moved out" — an overspent category may only receive, never give.
  const fromOver = fromId !== RTA && av(fromId) < -0.005;
  const valid = !isNaN(amt) && amt > 0 && fromId !== toId && !fromOver;
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
        {toId !== RTA && av(toId) < -0.005 && <Chip onClick={() => setAmount(toInput(-av(toId)))}>{t("coverOverspend")} {money(-av(toId))}</Chip>}
        {valid && amt > av(fromId) + 0.005 && <span style={{ font: "500 13px 'Commissioner',sans-serif", color: C.clay }}>{t("willGoNegative")}</span>}
      </div>
      {fromOver && (
        <div style={{ display: "flex", gap: 9, alignItems: "flex-start", background: C.claySoft, borderRadius: 12, padding: "11px 13px", marginBottom: 14 }}>
          <AlertCircle size={17} color={C.clay} style={{ flexShrink: 0, marginTop: 1 }} />
          <span style={{ font: "500 13px/1.45 'Commissioner',sans-serif", color: C.clay }}>{t("moveFromOverspent")}</span>
        </div>
      )}
      <PrimaryBtn onClick={() => valid && onMove(fromId, toId, round2(amt))} disabled={!valid}><ArrowLeftRight size={18} />{t("move")}</PrimaryBtn>
    </Sheet>
  );
}

/* ======================= Targets sheet ========================== */
// Every category's monthly amount on one screen, with actual spending next to it.
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
      <div style={{ font: "500 13px/1.45 'Commissioner',sans-serif", color: C.muted, margin: "-6px 0 16px" }}>{t("targetsHint")}</div>
      {groupsView.map((g) => g.cats.length > 0 && (
        <section key={g.id} style={{ marginBottom: 16 }}>
          <h3 style={{ font: "600 13px 'Commissioner',sans-serif", color: C.muted, margin: "0 0 8px 2px" }}>{g.name}</h3>
          <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.line}` }}>
            {g.cats.map((c, i) => (
              <div key={c.id} style={{ padding: "11px 14px", borderBottom: i === g.cats.length - 1 ? "none" : `1px solid ${C.line}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ flex: 1, minWidth: 0, font: "600 15px 'Commissioner',sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</span>
                  <input inputMode="decimal" value={vals[c.id] ?? ""} onChange={(e) => set(c.id, e.target.value)} placeholder="—" aria-label={c.name}
                    style={{ ...inputStyle, width: 112, padding: "9px 10px", font: "600 16px 'Poppins',sans-serif", textAlign: "right" }} />
                </div>
                <SpendHints t={t} info={calc.byCat[c.id]} onPick={(v) => set(c.id, toInput(v))} />
              </div>
            ))}
          </div>
        </section>
      ))}
      <div style={{ position: "sticky", bottom: 0, background: C.card, paddingTop: 8 }}>
        <PrimaryBtn onClick={save}><Check size={18} />{t("save")}</PrimaryBtn>
      </div>
    </Sheet>
  );
}

/* ======================= Savings transfer ======================= */
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
        <Empty t={t} icon={PiggyBank} text={t("noAccounts")} hint={t("noAccountsHint")} />
        <PrimaryBtn onClick={onAddAccount}><Plus size={18} />{t("addAccount")}</PrimaryBtn>
      </Sheet>
    );
  }

  const av = (id) => calc.byCat[id]?.available ?? 0;
  // goal categories keep their money, so "all leftovers" never includes them
  const leftTotal = round2(Object.values(calc.byCat).reduce((s, v) => s + (v.goal ? 0 : Math.max(0, v.available)), 0));
  const pickFrom = (v) => {
    setFrom(v);
    if (v === ALL) setAmount(toInput(leftTotal));
    else if (v !== RTA) setAmount(toInput(Math.max(0, av(v))));
  };
  const acc = state.accounts.find((a) => a.id === accountId);
  const showFrom = dir === "out" && !init;
  const amt = parseAmount(amount);
  const valid = !isNaN(amt) && amt > 0 && accountId;
  // balance available to draw from, counting this transfer's own amount back in when editing
  const bal = (acc?.balance ?? 0) + (init?.accountId === accountId ? Math.max(0, init.amount) : 0);
  const hasGoalCats = Object.values(calc.byCat).some((v) => v.goal);

  return (
    <Sheet title={t("savings")} onClose={onClose} t={t}>
      <Segmented value={dir} onChange={setDir}
        options={[["in", t("fromSavings"), ArrowDownLeft], ["out", t("toSavings"), ArrowUpRight]]} />
      <Field label={t("account")}>
        <select value={accountId} onChange={(e) => setAccountId(e.target.value)} style={selectStyle}>
          {!acc && <option value={accountId}>{t("deletedAccount")}</option>}
          {state.accounts.map((a) => <option key={a.id} value={a.id}>{a.name} ({money(a.balance)})</option>)}
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
          <div style={{ font: "500 13px 'Commissioner',sans-serif", color: C.clay, marginTop: 6 }}>{t("exceedsBalance")}</div>
        )}
        {showFrom && from !== ALL && valid && amt > (from === RTA ? calc.readyToAssign : av(from)) + 0.005 && (
          <div style={{ font: "500 13px 'Commissioner',sans-serif", color: C.clay, marginTop: 6 }}>{t("willGoNegative")}</div>
        )}
        {dir === "out" && hasGoalCats && (
          <div style={{ font: "500 12.5px/1.45 'Commissioner',sans-serif", color: C.muted, marginTop: 8 }}>{t("goalMoneyNote")}</div>
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

/* --------------------------- utils ------------------------------ */
function download(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
}
