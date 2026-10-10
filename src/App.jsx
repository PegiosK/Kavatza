import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import catRichImg from "./mascot/cat-rich.webp";
import catBrokeImg from "./mascot/cat-broke.jpg";
import catExpenseImg from "./mascot/cat-expense.webp";
import catIncomeImg from "./mascot/cat-income.webp";
import catEmptyImg from "./mascot/cat-empty.webp";
import catOverspendImg from "./mascot/cat-overspend.webp";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid, Legend,
} from "recharts";
import {
  Wallet, Plus, BarChart3, Settings, Repeat, Target, Download, Upload,
  ChevronLeft, ChevronRight, ChevronDown, GripVertical, X, Pencil, Trash2, Check, ArrowDownLeft, ArrowUpRight,
  PiggyBank, Languages, Receipt, AlertCircle, FolderPlus, RotateCcw, CalendarClock,
  ArrowLeftRight, ArrowUpDown, Landmark, HelpCircle,
} from "lucide-react";

// Load and decode every cat mood once at startup, so a mood change never waits for the
// network (web) or a first-time decode (web and APK). About 370 KB in total.
const CAT_IMAGES = [catRichImg, catBrokeImg, catExpenseImg, catIncomeImg, catEmptyImg, catOverspendImg];
const preloadedCats = CAT_IMAGES.map((src) => {
  if (typeof Image === "undefined") return null;
  const im = new Image();
  im.src = src;
  im.decode?.().catch(() => {});
  return im;                                         // kept referenced so the decoded image stays in memory
});

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
    addMoney: "Add", removeMoney: "Remove", goalAmount: "Goal amount", balanceWord: "Balance",
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
    targets: "Monthly amounts", scopeMonth: "This month only", scopeForward: "This month onward",
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
    expenseKind: "Expense", incomeKind: "Income", adjustment: "Adjustment", increase: "Increase", decrease: "Decrease",
    accCash: "Cash", accChecking: "Current account", accSavings: "Savings account", accCard: "Credit card",
    accInvest: "Investments", accLoan: "Loan", accountType: "Account type",
    onBudget: "In the budget", tracking: "Tracking only", onBudgetHint: "Its money counts in Ready to assign.",
    trackingHint: "Shows its balance only — not part of the budget.",
    balanceToday: "Balance today", debtToday: "Debt today", loanToday: "Loan balance today",
    realBalance: "Real balance today", realDebt: "Real debt today", reconcile: "Reconcile",
    reconcileHint: "Type what your bank shows today. Any difference is entered as an «Adjustment».",
    reconciled: "The balance matches.", cardPayments: "Card payments", debtWord: "Debt",
    needToPay: "{x} missing to pay it off", paidOff: "Fully covered",
    deleteAccountTx: "Delete this account? Its transactions ({n}) will be deleted too.",
    deleteCatConfirmN: "Delete this category? Its transactions ({n}) stay as «Uncategorised» expenses.",
    deleteGroupConfirmN: "Delete this group and all its categories? Their transactions ({n}) stay as «Uncategorised» expenses.",
    payCard: "Pay the card",
    wzTitle: "Accounts & cards", wzNext: "Next", wzFinish: "Finish",
    wzIntro: "This version knows which account each euro is in and handles credit cards the way YNAB does.\n\nA few quick steps move your current data over. Nothing is deleted.",
    wzBackup: "First, keep a copy of your data just in case.",
    wzAccounts: "Your accounts", wzAccountsHint: "Set each account's type and its real balance today. Add any card or account that's missing.",
    wzDefault: "Where did your existing entries happen?", wzDefaultHint: "Your existing transactions and scheduled items go to this account. You can change any of them later.",
    wzCards: "Paid by card this month", wzCardsHint: "Tick this month's expenses you paid by credit card. They move to the card and their money goes to «Card payments».",
    wzOrphans: "Expenses without a category", wzOrphansHint: "These expenses lost their category when a category was deleted. Pick one for each.",
    wzSummary: "Ready", wzStartAdded: "Starting balances added to Ready to assign", wzRtaNow: "Ready to assign after the move",
    wzNeedBudgetAcc: "Add at least one account that isn't a card or loan.",
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
    addMoney: "Πρόσθεσε", removeMoney: "Αφαίρεσε", goalAmount: "Ποσό στόχου", balanceWord: "Υπόλοιπο",
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
    targets: "Μηνιαία ποσά", scopeMonth: "Μόνο αυτόν τον μήνα", scopeForward: "Από αυτόν και μετά",
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
    catRichTitle: "Λεφτά υπάρχουν", catRich: "Τα έξοδα είναι μέσα στο πλάνο — η γάτα νιώθει πλούσια.",
    catBrokeTitle: "Άφραγκη γάτα", catBroke: "Τα έξοδα πέρασαν όσα μοίρασες — κάλυψέ τα πριν πουλήσει τον καναπέ.",
    catNeutralTitle: "Η γάτα παρακολουθεί", catNeutral: "Μοίρασε χρήματα και καταχώρησε έξοδα για να διαμορφωθεί η διάθεσή της.",
    catRemain: "Έχουμε ακόμη {x} για αυτό το έξοδο.",
    catEmpty: "Δεν έχουμε άλλα λεφτά. Πρέπει να πάρουμε από κάπου αλλού. Μείωσε κάποιο άλλο έξοδο ή στόχο.",
    catIncomeTitle: "Κονομήσαμε πάλι",
    catIncome: "Μπήκαν {x} στα διαθέσιμα χρήματα. Δώσε σε κάθε ευρώ έναν σκοπό!",
    catEmptyTitle: "Μείναμε ταπί",
    catOverspendTitle: "Σπάσαμε τον κουμπαρά",
    catOverspend: "Προσοχή! Ξεπέρασες τον στόχο αυτής της κατηγορίας. Μετακίνησε χρήματα από κάπου αλλού για να τον καλύψεις.",
    fixEntry: "Διόρθωση κίνησης",
    moveFromOverspent: "Αυτή η κατηγορία είναι ήδη εκτός budget — η μετακίνηση από εδώ δεν ελευθερώνει χρήματα, την κάνει χειρότερη. Κάλυψέ την από άλλη κατηγορία ή από το «Για μοίρασμα».",
    coverOverspend: "Κάλυψη υπέρβασης",
    ok: "Εντάξει",
    expenseKind: "Έξοδο", incomeKind: "Έσοδο", adjustment: "Προσαρμογή", increase: "Αύξηση", decrease: "Μείωση",
    accCash: "Μετρητά", accChecking: "Τρεχούμενος", accSavings: "Ταμιευτήριο", accCard: "Πιστωτική κάρτα",
    accInvest: "Επενδύσεις", accLoan: "Δάνειο", accountType: "Τύπος λογαριασμού",
    onBudget: "Στον προϋπολογισμό", tracking: "Παρακολούθηση", onBudgetHint: "Τα χρήματά του μετράνε στο «Για μοίρασμα».",
    trackingHint: "Δείχνει μόνο το υπόλοιπο — δεν μπαίνει στον προϋπολογισμό.",
    balanceToday: "Υπόλοιπο σήμερα", debtToday: "Οφειλή σήμερα", loanToday: "Υπόλοιπο δανείου σήμερα",
    realBalance: "Πραγματικό υπόλοιπο σήμερα", realDebt: "Πραγματική οφειλή σήμερα", reconcile: "Συμφωνία",
    reconcileHint: "Γράψε ό,τι δείχνει σήμερα η τράπεζα. Αν διαφέρει, η διαφορά καταχωρείται ως «Προσαρμογή».",
    reconciled: "Το υπόλοιπο συμφωνεί.", cardPayments: "Πληρωμές καρτών", debtWord: "Οφειλή",
    needToPay: "λείπουν {x} για την εξόφληση", paidOff: "Καλύπτεται πλήρως",
    deleteAccountTx: "Διαγραφή λογαριασμού; Θα διαγραφούν και οι κινήσεις του ({n}).",
    deleteCatConfirmN: "Διαγραφή κατηγορίας; Οι κινήσεις της ({n}) μένουν ως έξοδα «Χωρίς κατηγορία».",
    deleteGroupConfirmN: "Διαγραφή ομάδας και όλων των κατηγοριών της; Οι κινήσεις τους ({n}) μένουν ως έξοδα «Χωρίς κατηγορία».",
    payCard: "Πληρωμή κάρτας",
    wzTitle: "Λογαριασμοί & κάρτες", wzNext: "Επόμενο", wzFinish: "Ολοκλήρωση",
    wzIntro: "Η νέα έκδοση ξέρει σε ποιον λογαριασμό βρίσκεται κάθε ευρώ και χειρίζεται τις πιστωτικές κάρτες όπως το YNAB.\n\nΜε λίγα βήματα περνάμε τα δεδομένα σου. Τίποτα δεν διαγράφεται.",
    wzBackup: "Πρώτα κράτα ένα αντίγραφο των δεδομένων σου, για σιγουριά.",
    wzAccounts: "Οι λογαριασμοί σου", wzAccountsHint: "Διάλεξε τον τύπο κάθε λογαριασμού και γράψε το πραγματικό υπόλοιπο σήμερα. Πρόσθεσε όποια κάρτα ή λογαριασμό λείπει.",
    wzDefault: "Από πού έγιναν οι κινήσεις σου;", wzDefaultHint: "Οι κινήσεις και τα πάγια που ήδη έχεις μπαίνουν σε αυτόν τον λογαριασμό. Μπορείς να αλλάξεις όποια θες αργότερα.",
    wzCards: "Πληρωμένα με κάρτα αυτόν τον μήνα", wzCardsHint: "Τσέκαρε τα έξοδα αυτού του μήνα που πλήρωσες με πιστωτική. Πάνε στην κάρτα και τα χρήματά τους στις «Πληρωμές καρτών».",
    wzOrphans: "Έξοδα χωρίς κατηγορία", wzOrphansHint: "Αυτά τα έξοδα έχασαν την κατηγορία τους όταν διαγράφηκε μια κατηγορία. Διάλεξε κατηγορία για το καθένα.",
    wzSummary: "Έτοιμο", wzStartAdded: "Αρχικά υπόλοιπα που προστίθενται στο «Για μοίρασμα»", wzRtaNow: "«Για μοίρασμα» μετά τη μεταφορά",
    wzNeedBudgetAcc: "Χρειάζεται τουλάχιστον ένας λογαριασμός που δεν είναι κάρτα ή δάνειο.",
  },
};

/* --------------------------- helpers ----------------------------- */
const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
// Local-date formatting: toISOString() is UTC and shifts dates back a day in Greece (UTC+2/+3).
const fmtLocal = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const todayISO = () => fmtLocal(new Date());
const round2 = (n) => Math.round(n * 100) / 100;
const toInput = (n) => (n ? String(round2(n)).replace(".", ",") : "");
const RTA = "__rta__";                 // "Για μοίρασμα" as a move source
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
function goalInfo(goal, available) {
  if (!goal?.target) return null;
  return { target: goal.target, balance: available, remaining: Math.max(0, goal.target - Math.max(0, available)) };
}

// Income sources: the four built-in ones keep a translation key as id (name null = translated);
// ones you add have their own name. Income transactions point to a source by id (tx.source).
const DEFAULT_SOURCES = () => ["srcSalary", "srcPension", "srcRents", "srcInvest"].map((id) => ({ id, name: null }));
const srcLabel = (t, sources, id) => {
  const x = (sources || []).find((v) => v.id === id);
  return x ? (x.name || t(x.id)) : t("income");
};

/* Accounts (v7). Budget accounts (cash, current, savings, card) hold the money you budget;
   tracking accounts (investments, loans) only show a balance. Balances are computed from
   transactions — a "start" transaction carries each account's opening balance.
   Transaction kinds:
     expense  — amount < 0 (a refund is > 0), accountId, categoryId (null = «Χωρίς κατηγορία»)
     income   — amount > 0, accountId, source; goes to «Για μοίρασμα»
     transfer — amount > 0, from accountId to toAccountId; budget → tracking needs a category
     start / adjust — opening balance / reconciliation difference on accountId */
const ACC_TYPES = ["checking", "savings", "cash", "card", "invest", "loan"];
const TRACKING_TYPES = new Set(["invest", "loan"]);
const ACC_TYPE_KEY = { cash: "accCash", checking: "accChecking", savings: "accSavings", card: "accCard", invest: "accInvest", loan: "accLoan" };
const isOnBudget = (a) => !!a && !TRACKING_TYPES.has(a.type);
const isDebtType = (type) => type === "card" || type === "loan";
const txKind = (x) => x.kind || (x.categoryId === null && x.amount > 0 ? "income" : "expense");

// Default account for a new entry: the one used last, else the first budget account (income never goes to a card).
function defaultAccountId(state, kind) {
  const ok = (a) => isOnBudget(a) && !(kind === "income" && a.type === "card");
  return (state.accounts.find((a) => a.id === state.settings?.lastAccountId && ok(a)) || state.accounts.find(ok))?.id ?? null;
}

function accountBalances(state) {
  const bal = {};
  for (const a of state.accounts || []) bal[a.id] = 0;
  for (const x of state.transactions || []) {
    if (txKind(x) === "transfer") {
      if (x.accountId in bal) bal[x.accountId] -= x.amount;
      if (x.toAccountId in bal) bal[x.toAccountId] += x.amount;
    } else if (x.accountId in bal) bal[x.accountId] += x.amount;
  }
  for (const k in bal) bal[k] = round2(bal[k]);
  return bal;
}

/* --------------------------- seed data --------------------------- */
function seedState() {
  const g1 = uid(), g2 = uid(), g3 = uid();
  const cat = (groupId, name) => ({ id: uid(), groupId, name, plan: [] });
  const cash = uid();
  return {
    version: 7,
    settings: { lang: "el", lastAccountId: cash },
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
    transactions: [],         // { id, kind, date, amount, accountId, toAccountId?, categoryId|null, source?, payee, memo, scheduleId|null }
    schedules: [],            // { id, name, amount, categoryId|null, accountId, freq, nextDate, payee }
    accounts: [{ id: cash, name: "Μετρητά", type: "cash" }],  // { id, name, type } — balance is computed
                              // a card's payment category is the category with cardId = the card's id
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
  // v6: «Στόχοι» categories are expenses without a time limit — no monthly amount.
  // Repeating amounts stop from this month on (past months stay as they were).
  if ((state.version || 0) < 6) {
    const goalGroups = new Set(state.groups.filter((g) => g.isGoals).map((g) => g.id));
    for (const c of state.categories) {
      if (goalGroups.has(c.groupId) && c.plan?.some((st) => st.amount > 0 && (st.from >= nowMk || planFor(c.plan, nowMk) > 0)))
        c.plan = setPlan(c.plan, nowMk, 0);
    }
  }
  // v7: accounts with types and computed balances, transaction kinds, card payment categories.
  // Older data stays at v6 until the one-time wizard (MigrationWizard) converts it.
  if ((state.version || 0) >= 7) {
    for (const a of state.accounts) if (!a.type) a.type = "cash";
    for (const x of state.transactions) if (!x.kind) x.kind = txKind(x);
    return state;
  }
  state.version = 6;
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


/* ------------------------- budget math ------------------------- */
/* «Για μοίρασμα» = money that came in − money held by categories.
   Comes in: income, opening balances / adjustments of budget accounts (not cards),
   transfers from a tracking account into the budget.
   Held by a category in a month:
     regular — closed months: what was used (leftovers go back); this & later months: what's assigned.
               Overspending paid in cash (or any non-card account) comes straight out of «Για μοίρασμα».
     «Στόχοι» / keeping leftovers / card payment — what's assigned stays and carries over.
   Card purchases (YNAB style), in date order inside each category and month: the part the category
   still has money for is "funded" — that money moves to the card's payment category. The rest is
   card debt: it doesn't touch «Για μοίρασμα», the payment category shows what's missing.
   Payment category = its own assignments + funded purchases − payments (transfers into the card). */
function computeBudget(state, dispMonth) {
  const { transactions, assignments, categories, groups, accounts } = state;
  const accById = Object.fromEntries((accounts || []).map((a) => [a.id, a]));
  // an unknown account (shouldn't happen) counts as a plain budget account, so no entry silently drops out
  const on = (id) => !accById[id] || isOnBudget(accById[id]);
  const isCardAcc = (id) => accById[id]?.type === "card";
  const catById = Object.fromEntries(categories.map((c) => [c.id, c]));
  const goalGroups = new Set(groups.filter((g) => g.isGoals).map((g) => g.id));
  const nowMk = curMonth();
  const balances = accountBalances(state);

  let inflows = 0, held = 0;
  const catTx = {};     // catId -> [{ m, amt, card, date, i }]
  const pay = {};       // cardId -> { month: payment-category activity }
  const addPay = (cardId, m, v) => { const p = pay[cardId] || (pay[cardId] = {}); p[m] = (p[m] || 0) + v; };

  transactions.forEach((x, i) => {
    const m = monthKey(x.date), kind = txKind(x);
    if (kind === "income") {
      if (!on(x.accountId)) return;
      inflows += x.amount;
      if (isCardAcc(x.accountId)) addPay(x.accountId, m, -x.amount);   // came in and paid the card at once
      return;
    }
    if (kind === "start" || kind === "adjust") {
      if (on(x.accountId) && !isCardAcc(x.accountId)) inflows += x.amount;   // card balance = debt, not money
      return;
    }
    let acc, amt;
    if (kind === "transfer") {
      const fOn = on(x.accountId), tOn = on(x.toAccountId);
      if (fOn && tOn) {                       // between budget accounts: only card payments matter
        if (isCardAcc(x.toAccountId)) addPay(x.toAccountId, m, -x.amount);
        if (isCardAcc(x.accountId)) addPay(x.accountId, m, x.amount);
        return;
      }
      if (!fOn && tOn) { if (!isCardAcc(x.toAccountId)) inflows += x.amount; return; }
      if (!fOn) return;                       // tracking → tracking
      acc = x.accountId; amt = -x.amount;     // budget → tracking: spent from a category
    } else {
      if (!on(x.accountId)) return;
      acc = x.accountId; amt = x.amount;
    }
    const cat = catById[x.categoryId];
    if (!cat || cat.cardId) {                 // «Χωρίς κατηγορία»: straight from «Για μοίρασμα»
      held -= amt;
      if (isCardAcc(acc)) addPay(acc, m, -amt);
      return;
    }
    (catTx[cat.id] || (catTx[cat.id] = [])).push({ m, amt, card: isCardAcc(acc) ? acc : null, date: x.date, i });
  });

  const horizon = dispMonth > nowMk ? dispMonth : nowMk;
  const prev = [1, 2, 3].map((k) => addMonthsKey(dispMonth, -k));
  const byCat = {};
  // payment categories last: they receive what the other categories fund
  const ordered = [...categories.filter((c) => !c.cardId), ...categories.filter((c) => c.cardId)];
  for (const c of ordered) {
    const isCard = !!c.cardId;
    const list = (catTx[c.id] || []).sort((a, b) => a.date.localeCompare(b.date) || b.i - a.i);
    const byM = {}, act = {};
    if (isCard) Object.assign(act, pay[c.cardId] || {});
    else for (const it of list) { (byM[it.m] || (byM[it.m] = [])).push(it); act[it.m] = (act[it.m] || 0) + it.amt; }
    const months = new Set(Object.keys(act));
    for (const m in assignments) if (c.id in assignments[m]) months.add(m);
    if (c.plan?.length) for (let m = c.plan[0].from; m <= horizon; m = addMonthsKey(m, 1)) months.add(m);
    const assignedIn = (m) => assignments[m]?.[c.id] ?? planFor(c.plan, m);
    // «Στόχοι» are expenses without a time limit: they always keep their balance, like card payments.
    // c.roll = { since, until }: months a category kept its leftovers under an older goal.
    const isGoal = goalGroups.has(c.groupId);
    const keeps = (m) => isCard || isGoal || (!!c.roll && m >= c.roll.since && (!c.roll.until || m <= c.roll.until));
    const sorted = [...months].sort();
    const last = sorted[sorted.length - 1];
    let carry = 0, available = 0;
    for (let m = sorted[0]; sorted.length && (m <= horizon || m <= last); m = addMonthsKey(m, 1)) {
      const asg = m <= horizon ? assignedIn(m) : (assignments[m]?.[c.id] ?? 0);
      const k = keeps(m);
      let r = (k ? carry : 0) + asg, unfunded = 0;
      if (isCard) r += act[m] || 0;
      else for (const it of byM[m] || []) {
        if (it.card) {
          if (it.amt < 0) {
            const funded = Math.min(-it.amt, Math.max(0, r));
            unfunded += -it.amt - funded;
            addPay(it.card, m, funded);
          } else addPay(it.card, m, -it.amt);   // refund on the card
        }
        r += it.amt;
      }
      const cashOver = Math.max(0, -r - unfunded);
      if (k) {
        held += asg + cashOver;
        carry = Math.max(0, r);
        // leftovers stop being kept: once that month has closed, they go back to «Για μοίρασμα»
        if (!keeps(addMonthsKey(m, 1)) && m < nowMk) { held -= carry; carry = 0; }
      } else {
        held += m < nowMk ? asg - Math.max(0, r) + cashOver : asg + cashOver;
        carry = 0;
      }
      if (m === dispMonth) available = r;
    }
    if (!sorted.length || dispMonth < sorted[0]) available = 0;
    const hist = prev.filter((m) => m in act).map((m) => -act[m]);
    const debt = isCard ? Math.max(0, -(balances[c.cardId] || 0)) : 0;
    byCat[c.id] = {
      assigned: assignedIn(dispMonth),
      planned: planFor(c.plan, dispMonth),
      activity: act[dispMonth] || 0,
      available,
      spent: -(act[dispMonth] || 0),
      lastSpent: prev[0] in act ? -act[prev[0]] : null,
      avgSpent: hist.length ? hist.reduce((s, v) => s + v, 0) / hist.length : null,
      isGoal,
      isCard,
      debt,
      need: isCard ? round2(Math.max(0, debt - Math.max(0, available))) : 0,
      goal: goalInfo(c.goal, available),
    };
  }
  return { readyToAssign: round2(inflows - held), byCat, totalIncome: inflows, totalAssigned: held, balances };
}

// Header cat: is this month's spending inside what the categories have? (card payments excluded)
function monthBudgetHealth(calc) {
  if (!calc) return { status: "neutral", assigned: 0, spent: 0 };
  let assigned = 0, spent = 0;
  for (const v of Object.values(calc.byCat)) {
    if (v.isCard) continue;
    assigned += v.available - v.activity;
    spent += -v.activity;
  }
  if (assigned <= 0.005 && spent <= 0.005) return { status: "neutral", assigned, spent };
  return { status: spent > assigned + 0.005 ? "broke" : "rich", assigned, spent };
}
// Popup after a new expense, from the state before it was saved.
function expenseFeedback(state, tx) {
  const info = computeBudget(state, monthKey(tx.date)).byCat[tx.categoryId];
  if (!info) return null;
  const remaining = info.available - Math.abs(tx.amount);
  if (remaining >= -0.005) return { kind: "expense", remaining };
  const cat = state.categories.find((c) => c.id === tx.categoryId);
  return { kind: cat?.goal || info.isGoal ? "overspend" : "empty", remaining };
}

/* -------------------- mascot + onboarding -------------------- */
function MascotBadge({ status = "neutral", size = 44, src: srcOverride }) {
  const broke = status === "broke";
  const src = srcOverride || (broke ? catBrokeImg : catRichImg);
  return (
    <img src={src} alt="" width={size} height={size} loading="eager" decoding="async" style={{
      width: size, height: size, objectFit: "cover", display: "block", flexShrink: 0,
      borderRadius: "50%",                        // every mood is a round medallion; broke keeps its red rim
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
  const migrating = !!state && (state.version || 0) < 7;      // v6 data waits for the one-time wizard
  const calc = useMemo(() => (state && !migrating ? computeBudget(state, dispMonth) : null), [state, dispMonth, migrating]);

  const dueSchedules = useMemo(() => {
    if (!state) return [];
    const today = todayISO();
    return state.schedules.filter((s) => s.nextDate <= today);
  }, [state]);

  const budgetHealth = useMemo(() => monthBudgetHealth(calc), [calc]);

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    download(blob, `kavatza-backup-${todayISO()}.json`);
  };

  const loading = <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: C.paper, color: C.muted, font: "500 15px 'Commissioner',sans-serif" }}>…</div>;
  if (!state) return loading;
  if (migrating) return <MigrationWizard t={t} state={state} onExport={exportJSON} onDone={(s) => { setState(s); setDispMonth(curMonth()); }} />;
  if (!calc) return loading;

  /* ---- mutations ---- */
  const update = (fn) => setState((prev) => { const next = structuredClone(prev); fn(next); return next; });

  // the account used last is the default next time
  const remember = (s, tx) => {
    if (["expense", "income", "transfer"].includes(tx.kind) && isOnBudget(s.accounts.find((a) => a.id === tx.accountId))) s.settings.lastAccountId = tx.accountId;
  };
  const addTx = (tx) => { const id = uid(); update((s) => { s.transactions.unshift({ id, scheduleId: null, ...tx }); remember(s, tx); }); return id; };
  const editTx = (id, tx) => update((s) => {
    const i = s.transactions.findIndex((x) => x.id === id);
    if (i > -1) s.transactions[i] = { id, scheduleId: s.transactions[i].scheduleId ?? null, ...tx };
  });
  const delTx = (id) => update((s) => { s.transactions = s.transactions.filter((x) => x.id !== id); });

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

  const addCategory = (groupId, name) => update((s) => { s.categories.push({ id: uid(), groupId, name, plan: [] }); });
  const renameCategory = (id, name) => update((s) => { const c = s.categories.find((x) => x.id === id); if (c) c.name = name; });
  // A deleted category's transactions stay expenses, «Χωρίς κατηγορία» (taken from «Για μοίρασμα»).
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
    if (i < 0 || j < 0 || j >= s.groups.length || s.groups[j].isCards) return;   // card payments stay on top
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
  const txCountFor = (catIds) => state.transactions.filter((x) => catIds.includes(x.categoryId)).length;

  const addSchedule = (sc) => update((s) => { s.schedules.push({ id: uid(), ...sc }); });
  const delSchedule = (id) => update((s) => { s.schedules = s.schedules.filter((x) => x.id !== id); });
  const enterSchedule = (sc) => update((s) => {
    const kind = sc.categoryId === null && sc.amount > 0 ? "income" : "expense";
    const accountId = s.accounts.some((a) => a.id === sc.accountId) ? sc.accountId : defaultAccountId(s, kind);
    s.transactions.unshift({ id: uid(), kind, date: sc.nextDate, amount: sc.amount, accountId, categoryId: sc.categoryId, ...(sc.source ? { source: sc.source } : {}), payee: sc.payee || sc.name, memo: "", scheduleId: sc.id });
    const i = s.schedules.findIndex((x) => x.id === sc.id);
    if (i > -1) s.schedules[i].nextDate = advanceDate(sc.nextDate, sc.freq);
  });

  const setLang = (l) => update((s) => { s.settings.lang = l; });
  // A card gets its payment category, in the «Πληρωμές καρτών» group at the top of the budget.
  const addAccount = (name, type, balance) => update((s) => {
    const id = uid();
    s.accounts.push({ id, name, type });
    if (type === "card") {
      let g = s.groups.find((x) => x.isCards);
      if (!g) { g = { id: uid(), name: t("cardPayments"), isCards: true }; s.groups.unshift(g); }
      s.categories.push({ id: uid(), groupId: g.id, name, plan: [], cardId: id });
    }
    if (Math.abs(balance) > 0.004) s.transactions.unshift({ id: uid(), kind: "start", date: todayISO(), amount: round2(balance), accountId: id, categoryId: null, payee: "", memo: "", scheduleId: null });
  });
  const renameAccount = (id, name) => update((s) => {
    const a = s.accounts.find((x) => x.id === id); if (a) a.name = name;
    const c = s.categories.find((x) => x.cardId === id); if (c) c.name = name;
  });
  // «Συμφωνία»: the difference from the real balance is entered as an adjustment
  const reconcileAccount = (id, real) => {
    const diff = round2(real - (calc.balances[id] || 0));
    if (Math.abs(diff) < 0.005) { flash(t("reconciled")); return; }
    addTx({ kind: "adjust", date: todayISO(), amount: diff, accountId: id, categoryId: null, payee: "", memo: "" });
    flash(`${t("adjustment")} ${diff > 0 ? "+" : ""}${money(diff)}`);
  };
  const delAccount = (id) => update((s) => {
    s.accounts = s.accounts.filter((x) => x.id !== id);
    s.transactions = s.transactions.filter((x) => x.accountId !== id && x.toAccountId !== id);
    const pc = s.categories.find((c) => c.cardId === id);
    if (pc) {
      s.categories = s.categories.filter((c) => c.id !== pc.id);
      for (const m in s.assignments) delete s.assignments[m][pc.id];
      if (!s.categories.some((c) => c.groupId === pc.groupId)) s.groups = s.groups.filter((g) => g.id !== pc.groupId);
    }
    s.schedules.forEach((x) => { if (x.accountId === id) x.accountId = null; });
    if (s.settings.lastAccountId === id) delete s.settings.lastAccountId;
  });
  const accTxCount = (id) => state.transactions.filter((x) => x.accountId === id || x.toAccountId === id).length;
  const dismissBackupNotice = () => update((s) => { s.settings.backupNoticeDismissed = true; });
  const clearAll = () => { setState(seedState()); flash(t("everyEuro")); };

  const accName = (id) => state.accounts.find((a) => a.id === id)?.name || t("deletedAccount");
  const catName = (id) => state.categories.find((c) => c.id === id)?.name || t("uncategorised");
  // What an entry is: its category, income source, the accounts of a transfer, or opening balance / adjustment.
  const txWhat = (x) => {
    const k = txKind(x);
    if (k === "income") return x.source ? srcLabel(t, state.incomeSources, x.source)
      // older income kept its source only in the payee
      : state.incomeSources.map((v) => srcLabel(t, state.incomeSources, v.id)).find((l) => l === x.payee) || t("income");
    if (k === "transfer") return `${accName(x.accountId)} → ${accName(x.toAccountId)}${x.categoryId ? ` · ${catName(x.categoryId)}` : ""}`;
    if (k === "start") return t("startingBalance");
    if (k === "adjust") return t("adjustment");
    return catName(x.categoryId);
  };
  const txLabel = (x) => {
    const k = txKind(x);
    return k === "transfer" ? txWhat(x) : k === "start" || k === "adjust" ? accName(x.accountId) : `${txWhat(x)} · ${accName(x.accountId)}`;
  };

  /* ---- backup / restore ---- */
  const exportCSV = () => {
    const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const rows = [["Date", "Account", "Payee", "Category", "Memo", "Amount_EUR"]];
    [...state.transactions].sort((a, b) => a.date.localeCompare(b.date)).forEach((x) => {
      const tr = txKind(x) === "transfer";
      rows.push([x.date, esc(tr ? `${accName(x.accountId)} → ${accName(x.toAccountId)}` : accName(x.accountId)), esc(x.payee),
        esc(tr ? (x.categoryId ? catName(x.categoryId) : "") : txWhat(x)), esc(x.memo), x.amount.toFixed(2)]);
    });
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
            onEdit={(tx) => setModal({ type: "tx", tx })} />
        )}
        {tab === "accounts" && (
          <AccountsScreen t={t} accounts={state.accounts} balances={calc.balances} onAdd={() => setModal({ type: "account", account: null })}
            onEdit={(a) => setModal({ type: "account", account: a })}
            onTransfer={() => setModal({ type: "tx", tx: null, kind: "transfer" })} />
        )}
        {tab === "reports" && <ReportsScreen t={t} lang={lang} state={state} dispMonth={dispMonth} txWhat={txWhat} />}
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
          <TxSheet t={t} state={state} balances={calc.balances} initial={modal.tx} presetCat={modal.presetCat} presetTo={modal.presetTo} presetKind={modal.kind}
            onClose={() => setModal(modal.back || null)}
            onSave={(tx) => {
              if (modal.tx) editTx(modal.tx.id, tx);
              else {
                const id = addTx(tx);
                const fb = tx.kind === "expense" && tx.amount < 0 && tx.categoryId ? expenseFeedback(state, tx)
                  : tx.kind === "income" ? { kind: "income", amount: tx.amount } : null;
                if (fb) setCatFeedback({ ...fb, tx: { ...tx, id } });
              }
              setModal(null);
            }}
            onDelete={modal.tx ? () => { delTx(modal.tx.id); setModal(null); } : null} />
        )}
        {modal?.type === "assign" && (() => {
          const cat = state.categories.find((c) => c.id === modal.catId);
          if (!cat) return null;
          return (
            <AssignSheet t={t} cat={cat} isGoal={calc.byCat[cat.id].isGoal} info={calc.byCat[cat.id]} dispMonth={dispMonth} lang={lang}
              onClose={() => setModal(null)}
              onAssign={(amt) => setAssigned(cat.id, amt)}
              onSetAmount={(amt, scope) => setAssignments([{ catId: cat.id, amount: amt }], scope)}
              onSetGoal={(goal) => setCatGoal(cat.id, goal)}
              onMove={(preset) => setModal({ type: "move", ...preset, back: modal })}
              onNewTx={() => setModal(cat.cardId ? { type: "tx", tx: null, presetTo: cat.cardId, back: modal } : { type: "tx", tx: null, presetCat: cat.id })} />
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
        {modal?.type === "manage" && (
          <ManageSheet t={t} groupsView={groupsView.filter((g) => !g.isCards)} txCount={txCountFor}
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
          <AccountSheet t={t} initial={modal.account} balance={modal.account ? calc.balances[modal.account.id] || 0 : 0}
            txCount={modal.account ? accTxCount(modal.account.id) : 0}
            onClose={() => setModal(modal.back || null)}
            onSave={(name, type, bal) => { modal.account ? renameAccount(modal.account.id, name) : addAccount(name, type, bal); setModal(modal.back || null); }}
            onReconcile={(real) => { reconcileAccount(modal.account.id, real); setModal(null); }}
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
    </>
  );
}

// Card payment category: what's set aside against the card's debt, and what's still missing.
function CardLines({ t, info }) {
  if (info.debt <= 0.005) return null;
  const missing = info.need > 0.005;
  return (
    <>
      <div style={{ marginTop: 9, height: 6, background: "#EBE8DB", borderRadius: 4, overflow: "hidden" }}>
        <div style={{ width: `${Math.max(0, Math.min(1, info.available / info.debt)) * 100}%`, height: "100%", borderRadius: 4, background: missing ? C.gold : C.green, transition: "width .35s ease" }} />
      </div>
      <div style={{ font: "500 12px 'Commissioner',sans-serif", color: C.muted, marginTop: 5 }}>
        {t("debtWord")} {money(info.debt)} · {missing
          ? <b style={{ color: C.clay }}>{t("needToPay").replace("{x}", money(info.need))}</b>
          : <b style={{ color: C.green }}>{t("paidOff")}</b>}
      </div>
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

      {info.isCard ? <CardLines t={t} info={info} /> : info.isGoal ? (info.goal && <GoalLines t={t} lang={lang} g={info.goal} />) : info.goal ? <GoalLines t={t} lang={lang} g={info.goal} /> : (<>
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
function AccountsScreen({ t, accounts, balances, onAdd, onEdit, onTransfer }) {
  const sections = [
    ["onBudget", accounts.filter(isOnBudget)],
    ["tracking", accounts.filter((a) => !isOnBudget(a))],
  ].filter(([, list]) => list.length);
  return (
    <div>
      <ScreenHead title={t("accounts")} />
      <Ledger>
        {accounts.length === 0 && <Empty t={t} text={t("noAccounts")} hint={t("noAccountsHint")} icon={PiggyBank} />}
        {sections.map(([key, list]) => {
          const total = round2(list.reduce((s, a) => s + (balances[a.id] || 0), 0));
          return (
            <section key={key} style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "4px 6px 8px" }}>
                <h3 style={{ font: "600 13px 'Commissioner',sans-serif", letterSpacing: ".06em", textTransform: "uppercase", color: C.muted, margin: 0 }}>{t(key)}</h3>
                <span style={{ font: "700 15px 'Poppins',sans-serif", color: total < 0 ? C.clay : C.ink }}>{money(total)}</span>
              </div>
              <div style={{ background: C.card, borderRadius: 16, overflow: "hidden", border: `1px solid ${C.line}` }}>
                {list.map((a, i) => {
                  const b = balances[a.id] || 0;
                  return (
                    <button key={a.id} onClick={() => onEdit(a)} style={{
                      width: "100%", textAlign: "left", background: "transparent", border: "none", cursor: "pointer",
                      borderBottom: i === list.length - 1 ? "none" : `1px solid ${C.line}`,
                      padding: "13px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
                    }}>
                      <span style={{ minWidth: 0 }}>
                        <span style={{ display: "block", font: "600 15px 'Commissioner',sans-serif", color: C.ink }}>{a.name}</span>
                        <span style={{ display: "block", font: "500 12px 'Commissioner',sans-serif", color: C.muted, marginTop: 2 }}>{t(ACC_TYPE_KEY[a.type])}</span>
                      </span>
                      <span style={{ font: "700 16px 'Poppins',sans-serif", color: b < -0.005 ? C.clay : C.ink, flexShrink: 0 }}>{money(b)}</span>
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}

        <div style={{ display: "flex", gap: 8 }}>
          <GhostBtn onClick={onAdd} color={C.ink}><Plus size={16} />{t("addAccount")}</GhostBtn>
          {accounts.length > 1 && <GhostBtn onClick={onTransfer} color={C.ink}><ArrowLeftRight size={16} />{t("transfer")}</GhostBtn>}
        </div>
        <div style={{ height: 12 }} />
      </Ledger>
    </div>
  );
}

// Account types, budget ones first.
function AccountTypeSelect({ t, value, onChange }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} style={selectStyle}>
      <optgroup label={t("onBudget")}>
        {ACC_TYPES.filter((x) => !TRACKING_TYPES.has(x)).map((x) => <option key={x} value={x}>{t(ACC_TYPE_KEY[x])}</option>)}
      </optgroup>
      <optgroup label={t("tracking")}>
        {ACC_TYPES.filter((x) => TRACKING_TYPES.has(x)).map((x) => <option key={x} value={x}>{t(ACC_TYPE_KEY[x])}</option>)}
      </optgroup>
    </select>
  );
}
// Cards and loans are entered as what you owe (a positive number) and kept as a negative balance.
const balanceLabel = (t, type, real) => type === "card" ? t(real ? "realDebt" : "debtToday")
  : type === "loan" ? t("loanToday") : t(real ? "realBalance" : "balanceToday");
const signedBalance = (type, n) => (isDebtType(type) ? -Math.abs(n) : n);

function AccountSheet({ t, initial, balance, txCount, onClose, onSave, onReconcile, onDelete }) {
  const [name, setName] = useState(initial?.name || "");
  const [type, setType] = useState(initial?.type || "checking");
  const [bal, setBal] = useState("");
  const [real, setReal] = useState("");
  const [confirmDel, setConfirmDel] = useState(false);
  const valid = name.trim().length > 0 && !isNaN(parseAmount(bal || "0"));
  const realN = parseAmount(real);
  const submit = () => {
    if (!valid) return;
    onSave(name.trim(), type, round2(signedBalance(type, parseAmount(bal || "0"))));
  };
  const debt = isDebtType(initial?.type);
  return (
    <Sheet title={initial ? initial.name : t("addAccount")} onClose={onClose} t={t}>
      <Field label={t("accountName")}>
        <input value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} placeholder="—" autoFocus={!initial} />
      </Field>
      {initial ? (
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <Stat label={t(ACC_TYPE_KEY[initial.type])} value={money(balance)} accent={balance < -0.005 ? C.clay : C.ink} />
        </div>
      ) : (
        <>
          <Field label={t("accountType")}>
            <AccountTypeSelect t={t} value={type} onChange={setType} />
            <div style={{ font: "500 12.5px/1.45 'Commissioner',sans-serif", color: C.muted, marginTop: 6 }}>{t(TRACKING_TYPES.has(type) ? "trackingHint" : "onBudgetHint")}</div>
          </Field>
          <Field label={`${balanceLabel(t, type)} (€)`}>
            <input inputMode="decimal" value={bal} onChange={(e) => setBal(e.target.value)} placeholder="0,00" style={amountStyle} />
          </Field>
        </>
      )}
      <PrimaryBtn onClick={submit} disabled={!valid}><Check size={18} />{t("save")}</PrimaryBtn>

      {initial && (
        <div style={{ marginTop: 18, paddingTop: 16, borderTop: `1px solid ${C.line}` }}>
          <Field label={`${balanceLabel(t, initial.type, true)} (€)`}>
            <div style={{ display: "flex", gap: 8 }}>
              <input inputMode="decimal" value={real} onChange={(e) => setReal(e.target.value)} placeholder={toInput(debt ? -balance : balance) || "0,00"}
                style={{ ...amountStyle, flex: 1, minWidth: 0 }} />
              <GhostBtn color={C.teal} onClick={() => !isNaN(realN) && onReconcile(round2(signedBalance(initial.type, realN)))}>
                <Check size={16} />{t("reconcile")}
              </GhostBtn>
            </div>
            <div style={{ font: "500 12.5px/1.45 'Commissioner',sans-serif", color: C.muted, marginTop: 6 }}>{t("reconcileHint")}</div>
          </Field>
        </div>
      )}

      {confirmDel && <ConfirmDialog t={t} message={txCount ? t("deleteAccountTx").replace("{n}", txCount) : t("deleteAccountConfirm")}
        onCancel={() => setConfirmDel(false)} onConfirm={onDelete} />}
      {onDelete && <DangerBtn onClick={() => setConfirmDel(true)}><Trash2 size={16} />{t("delete")}</DangerBtn>}
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
            const dayOut = grp.items.reduce((sum, x) => sum + (txKind(x) === "expense" && x.amount < 0 ? x.amount : 0), 0);
            return (
            <div key={grp.date} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "6px 6px 8px" }}>
                <span style={{ font: "600 12px 'Commissioner',sans-serif", color: C.muted, textTransform: "uppercase", letterSpacing: ".05em" }}>{dfmt(grp.date)}</span>
                {dayOut < -0.005 && <span style={{ font: "600 12px 'Poppins',sans-serif", color: C.muted }}>{money(dayOut)}</span>}
              </div>
              <div style={{ background: C.card, borderRadius: 16, overflow: "hidden", border: `1px solid ${C.line}` }}>
                {grp.items.map((x, i) => {
                  const kind = txKind(x);
                  const transfer = kind === "transfer";
                  const balanceTx = kind === "start" || kind === "adjust";
                  const inflow = !transfer && x.amount >= 0;
                  return (
                    <button key={x.id} onClick={() => onEdit(x)} style={{
                      width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "13px 14px",
                      background: "transparent", border: "none", borderBottom: i === grp.items.length - 1 ? "none" : `1px solid ${C.line}`,
                      cursor: "pointer", textAlign: "left",
                    }}>
                      <div style={{ width: 38, height: 38, borderRadius: 11, flexShrink: 0, display: "grid", placeItems: "center",
                        background: transfer || balanceTx ? C.tealSoft : inflow ? C.goldSoft : C.claySoft }}>
                        {transfer ? <ArrowLeftRight size={18} color={C.vault} /> : balanceTx ? <Landmark size={18} color={C.vault} />
                          : inflow ? <ArrowDownLeft size={18} color={C.vault} /> : <ArrowUpRight size={18} color={C.clay} />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ font: "600 15px 'Commissioner',sans-serif", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {x.payee || x.memo || (transfer ? t("transfer") : kind === "start" ? t("startingBalance") : kind === "adjust" ? t("adjustment") : inflow ? t("inflow") : t("outflow"))}
                        </div>
                        <div style={{ font: "500 12px 'Commissioner',sans-serif", color: C.muted, marginTop: 2 }}>{txLabel(x)}</div>
                      </div>
                      <div style={{ font: "700 15px 'Poppins',sans-serif", color: inflow ? C.green : C.ink, flexShrink: 0 }}>
                        {inflow && !transfer ? "+" : ""}{money(x.amount)}
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
function ReportsScreen({ t, lang, state, dispMonth, txWhat }) {
  // spending by category, this month (transfers, opening balances and adjustments aren't spending)
  const spend = useMemo(() => {
    const map = {};
    state.transactions.forEach((x) => {
      if (txKind(x) === "expense" && x.amount < 0 && monthKey(x.date) === dispMonth) {
        const name = state.categories.find((c) => c.id === x.categoryId)?.name || t("uncategorised");
        map[name] = (map[name] || 0) + Math.abs(x.amount);
      }
    });
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [state, dispMonth, t]);

  // income by source, this month
  const income = useMemo(() => {
    const map = {};
    for (const x of state.transactions) {
      if (txKind(x) !== "income" || monthKey(x.date) !== dispMonth) continue;
      const name = txWhat(x);
      map[name] = (map[name] || 0) + x.amount;
    }
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [state, dispMonth, txWhat]);
  const totalIncome = income.reduce((s, x) => s + x.value, 0);

  // income vs expense, last 6 months
  const trend = useMemo(() => {
    const out = [];
    for (let i = 5; i >= 0; i--) {
      const mk = addMonthsKey(dispMonth, -i);
      let inc = 0, exp = 0;
      state.transactions.forEach((x) => {
        if (monthKey(x.date) !== mk) return;
        const k = txKind(x);
        if (k === "income") inc += x.amount; else if (k === "expense" && x.amount < 0) exp += -x.amount;
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
  const catName = (s) => s.categoryId === null ? (s.amount > 0 ? t("income") : t("uncategorised")) : (state.categories.find((c) => c.id === s.categoryId)?.name || t("uncategorised"));
  const accName = (id) => state.accounts.find((a) => a.id === id)?.name;
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
                    {catName(s)}{accName(s.accountId) ? ` · ${accName(s.accountId)}` : ""} · {freqLabel[s.freq]} · {dfmt(s.nextDate)}
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
// Expense / income / transfer between accounts. Opening balances and adjustments
// (made by «Συμφωνία») open here too, with just an amount that goes up or down.
function TxSheet({ t, state, balances, initial, presetCat, presetTo, presetKind, onClose, onSave, onDelete }) {
  const accounts = state.accounts;
  const budgetAccs = accounts.filter(isOnBudget);
  const incomeAccs = budgetAccs.filter((a) => a.type !== "card");
  const firstKind = initial ? txKind(initial) : presetTo ? "transfer" : presetKind || "expense";
  const balanceTx = firstKind === "start" || firstKind === "adjust";
  const [kind, setKind] = useState(firstKind);
  const [amount, setAmount] = useState(initial ? Math.abs(initial.amount).toString().replace(".", ",") : "");
  const [up, setUp] = useState(initial ? initial.amount >= 0 : true);          // opening balance / adjustment sign
  const spendCats = state.categories.filter((c) => !c.cardId);
  const wasUncat = !!initial && txKind(initial) === "expense" && initial.categoryId === null;   // «Χωρίς κατηγορία» stays possible
  const [catId, setCatId] = useState(initial ? (initial.categoryId ?? (wasUncat ? null : spendCats[0]?.id ?? null)) : (presetCat ?? spendCats[0]?.id ?? null));
  const pick = (list, prefer) => (list.find((a) => a.id === prefer) || list.find((a) => a.id === state.settings.lastAccountId) || list[0])?.id ?? "";
  const [accountId, setAccountId] = useState(initial?.accountId ?? (presetTo ? pick(budgetAccs.filter((a) => a.id !== presetTo)) : ""));
  const [toId, setToId] = useState(initial?.toAccountId ?? presetTo ?? "");
  // Income keeps categoryId null and points to a source by id.
  const SRC = state.incomeSources.map((v) => v.id);
  const label = (id) => srcLabel(t, state.incomeSources, id);
  const [src, setSrc] = useState(() => {
    if (initial && txKind(initial) === "income") {
      if (SRC.includes(initial.source)) return initial.source;
      const hit = SRC.find((k) => label(k) === initial.payee);   // older entries kept the source in the payee
      if (hit) return hit;
    }
    return SRC[0] || "";
  });
  const [payee, setPayee] = useState(initial?.payee || "");
  const [memo, setMemo] = useState(initial?.memo || "");
  const [date, setDate] = useState(initial?.date || todayISO());

  // the account list depends on the kind; keep the chosen one when it fits, else the default
  const accList = kind === "income" ? incomeAccs : kind === "expense" ? budgetAccs : accounts;
  const acc = accList.some((a) => a.id === accountId) ? accountId : pick(accList);
  const toList = accounts.filter((a) => a.id !== acc);
  const to = toList.some((a) => a.id === toId) ? toId : (toList[0]?.id ?? "");
  const accById = (id) => accounts.find((a) => a.id === id);
  // money leaving the budget for a tracking account (investment, loan) is spent from a category
  const needsCat = kind === "transfer" && isOnBudget(accById(acc)) && !isOnBudget(accById(to));
  const cat = kind === "transfer" && !spendCats.some((c) => c.id === catId) ? spendCats[0]?.id ?? null : catId;

  const amt = parseAmount(amount);
  const valid = !isNaN(amt) && amt > 0 && !!acc && (kind !== "transfer" || (!!to && (!needsCat || !!cat)));

  const submit = () => {
    if (!valid) return;
    const a = round2(Math.abs(amt));
    const base = { kind, date, accountId: acc, payee: payee.trim(), memo: memo.trim() };
    if (kind === "expense") onSave({ ...base, amount: -a, categoryId: catId || null });
    else if (kind === "income") onSave({ ...base, amount: a, categoryId: null, source: src, payee: payee.trim() || label(src) });
    else if (kind === "transfer") onSave({ ...base, amount: a, toAccountId: to, categoryId: needsCat ? cat : null });
    else onSave({ ...base, amount: up ? a : -a, categoryId: null });
  };

  const accOpt = (a) => <option key={a.id} value={a.id}>{a.name} ({money(balances[a.id] || 0)})</option>;
  const catSelect = (value, onChange, withNone) => (
    <select value={value ?? ""} onChange={(e) => onChange(e.target.value || null)} style={selectStyle}>
      {withNone && <option value="">{t("uncategorised")}</option>}
      {state.groups.filter((g) => !g.isCards).map((g) => (
        <optgroup key={g.id} label={g.name}>
          {spendCats.filter((c) => c.groupId === g.id).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </optgroup>
      ))}
    </select>
  );

  const title = balanceTx ? t(firstKind === "start" ? "startingBalance" : "adjustment") : initial ? t("editTransaction") : t("newTransaction");
  return (
    <Sheet title={title} onClose={onClose} t={t}>
      {balanceTx ? (
        <Segmented value={up} onChange={setUp} options={[[true, t("increase"), ArrowDownLeft], [false, t("decrease"), ArrowUpRight]]} />
      ) : (
        <Segmented value={kind} onChange={setKind}
          options={[["expense", t("expenseKind"), ArrowUpRight], ["income", t("incomeKind"), ArrowDownLeft], ["transfer", t("transfer"), ArrowLeftRight]]} />
      )}

      <Field label={`${t("amount")} (€)`}>
        <input inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0,00"
          style={amountStyle} autoFocus={!initial} />
      </Field>

      <Field label={kind === "transfer" ? t("from") : t("account")}>
        <select value={acc} onChange={(e) => setAccountId(e.target.value)} style={selectStyle}>
          {kind === "transfer" && accounts.some((a) => !isOnBudget(a)) ? (
            <>
              <optgroup label={t("onBudget")}>{budgetAccs.map(accOpt)}</optgroup>
              <optgroup label={t("tracking")}>{accounts.filter((a) => !isOnBudget(a)).map(accOpt)}</optgroup>
            </>
          ) : accList.map(accOpt)}
        </select>
      </Field>

      {kind === "transfer" && (
        <Field label={t("to")}>
          <select value={to} onChange={(e) => setToId(e.target.value)} style={selectStyle}>{toList.map(accOpt)}</select>
        </Field>
      )}

      {kind === "expense" && (
        <Field label={t("category")}>{catSelect(catId, setCatId, wasUncat)}</Field>
      )}
      {needsCat && <Field label={t("category")}>{catSelect(cat, setCatId, false)}</Field>}
      {kind === "income" && (
        <Field label={t("category")}>
          <select value={src} onChange={(e) => setSrc(e.target.value)} style={selectStyle}>
            {SRC.length ? SRC.map((k) => <option key={k} value={k}>{label(k)}</option>) : <option value="">{t("income")}</option>}
          </select>
        </Field>
      )}

      {!balanceTx && (
        <Field label={t("payee")}>
          <input value={payee} onChange={(e) => setPayee(e.target.value)} style={inputStyle} placeholder="—" />
        </Field>
      )}

      <Field label={t("date")}>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={inputStyle} />
      </Field>

      <Field label={t("memo")}>
        <input value={memo} onChange={(e) => setMemo(e.target.value)} style={inputStyle} placeholder="—" />
      </Field>

      <PrimaryBtn onClick={submit} disabled={!valid}><Check size={18} />{t("save")}</PrimaryBtn>
      {onDelete && <DangerBtn onClick={onDelete}><Trash2 size={16} />{t("delete")}</DangerBtn>}
    </Sheet>
  );
}

/* ======================== Assign sheet ========================== */
function AssignSheet({ t, cat, isGoal: isGoalCat, info, dispMonth, lang, onClose, onAssign, onSetAmount, onSetGoal, onMove, onNewTx }) {
  // mode "set": type this month's total (regular categories). "add" / "sub": type an amount to add or
  // take away, this month only, like YNAB's + / − on the number pad. «Στόχοι» and card payment
  // categories keep their balance, so they only add or take away.
  const isGoal = isGoalCat || info.isCard;
  const [mode, setMode] = useState(isGoal ? "add" : "set");
  const [amount, setAmount] = useState(isGoal ? "" : toInput(info.assigned));
  const [goalAmt, setGoalAmt] = useState(toInput(cat.goal?.target));
  const [goalDirty, setGoalDirty] = useState(false);
  const [scope, setScope] = useState("forward");
  const [dirty, setDirty] = useState(false);   // only the amount field / scope toggle commit a change
  const edit = (v) => { setAmount(v); setDirty(true); };
  const pickMode = (m) => {
    const next = mode === m && !isGoal ? "set" : m;            // tapping the active + / − again goes back to the total
    setMode(next); setDirty(false);
    setAmount(next === "set" ? toInput(info.assigned) : "");
  };

  // one-off top-ups (cover overspending) apply to this month only
  const apply = (amt) => { onAssign(amt); setAmount(mode === "set" ? toInput(amt) : ""); };

  const typed = amount.trim() === "" ? 0 : parseAmount(amount);
  const delta = mode === "add" ? typed : mode === "sub" ? -typed : 0;

  // Persist edits without closing (also used before jumping to Move / Savings / New transaction).
  const commit = () => {
    if (goalDirty) {
      const gt = goalAmt.trim() === "" ? 0 : parseAmount(goalAmt);
      if (!isNaN(gt)) onSetGoal(gt > 0 ? { target: round2(gt) } : null);
      setGoalDirty(false);
    }
    if (!dirty || isNaN(typed)) return;
    if (mode === "set") onSetAmount(round2(typed), scope);
    else if (typed > 0) onAssign(round2(info.assigned + delta));   // taken from / returned to «Για μοίρασμα»
    setDirty(false);
    if (mode !== "set") setAmount("");
  };

  const overspend = info.available < 0 ? -info.available : 0;
  const pm = (m, label) => (
    <button onClick={() => pickMode(m)} aria-label={label} style={{
      width: 52, flex: "none", borderRadius: 12, cursor: "pointer", font: "700 24px 'Poppins',sans-serif",
      border: `1.5px solid ${mode === m ? C.teal : C.line}`, background: mode === m ? C.tealSoft : C.card, color: mode === m ? C.teal : C.muted,
    }}>{m === "add" ? "+" : "−"}</button>
  );

  return (
    <Sheet title={cat.name} onClose={onClose} t={t}>
      {/* status strip — monthly figures, so not for «Στόχοι» (their line under the target says it all) */}
      {!isGoal && (
        <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
          <Stat label={t("assigned")} value={money(info.assigned)} />
          <Stat label={t("activity")} value={money(info.activity)} />
          <Stat label={t("available")} value={money(info.available)} accent={info.available < 0 ? C.clay : info.available > 0 ? C.green : C.muted} />
        </div>
      )}

      {info.isCard && (
        <div style={{ margin: "0 0 16px" }}>
          <div style={{ font: "500 13px 'Commissioner',sans-serif", color: C.muted }}>{t("balanceWord")}: <b style={{ color: C.ink }}>{money(info.available)}</b></div>
          <CardLines t={t} info={info} />
        </div>
      )}
      {isGoalCat && (
        <>
          <Field label={`${t("goalAmount")} (€)`}>
            <input inputMode="decimal" value={goalAmt} onChange={(e) => { setGoalAmt(e.target.value); setGoalDirty(true); }} placeholder="—"
              style={{ ...inputStyle, font: "700 22px 'Poppins',sans-serif", textAlign: "right" }} />
          </Field>
          {info.goal
            ? <div style={{ margin: "-6px 0 16px" }}><GoalLines t={t} lang={lang} g={info.goal} /></div>
            : <div style={{ margin: "-6px 0 16px", font: "500 13px 'Commissioner',sans-serif", color: C.muted }}>{t("balanceWord")}: <b style={{ color: C.ink }}>{money(info.available)}</b></div>}
        </>
      )}

      <Field label={mode === "set" ? `${t("assignedThisMonth")} · ${monthLabel(dispMonth, lang)} (€)` : `${mode === "add" ? t("addMoney") : t("removeMoney")} (€)`}>
        <div style={{ display: "flex", gap: 8, alignItems: "stretch" }}>
          {pm("sub", t("removeMoney"))}
          <input inputMode="decimal" value={amount} onChange={(e) => edit(e.target.value)} placeholder="0,00"
            style={{ ...inputStyle, flex: 1, minWidth: 0, font: "700 22px 'Poppins',sans-serif", textAlign: "right" }} />
          {pm("add", t("addMoney"))}
        </div>
        {mode !== "set" && typed > 0 && !isNaN(typed) && (
          <div style={{ font: "500 13px 'Commissioner',sans-serif", color: C.muted, marginTop: 7 }}>
            {isGoal ? t("balanceWord") : t("assigned")}: {money(isGoal ? info.available : info.assigned)} → <b style={{ color: C.ink }}>{money((isGoal ? info.available : info.assigned) + delta)}</b>
          </div>
        )}
        {mode === "set" && <SpendHints t={t} info={info} onPick={(v) => edit(toInput(v))} />}
      </Field>
      {mode === "set" && (
        <Segmented value={scope} onChange={(v) => { setScope(v); setDirty(true); }}
          options={[["month", t("scopeMonth")], ["forward", t("scopeForward")]]} />
      )}

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

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
        <GhostBtn color={C.ink} onClick={() => { commit(); onNewTx(); }}>
          <Receipt size={16} />{info.isCard ? t("payCard") : t("newTransaction")}
        </GhostBtn>
        <GhostBtn color={C.ink} onClick={() => { commit(); onMove(info.available > 0.005 ? { fromId: cat.id } : { toId: cat.id }); }}>
          <ArrowLeftRight size={16} />{t("move")}
        </GhostBtn>
      </div>

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
function ManageSheet({ t, groupsView, txCount, onClose, onAddCategory, onRenameCategory, onDelCategory, onAddGroup, onRenameGroup, onDelGroup, onMoveGroup, onMoveCategory, sources, onAddSource, onRenameSource, onDelSource }) {
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
      {dialog?.kind === "delCat" && <ConfirmDialog t={t} message={t("deleteCatConfirmN").replace("{n}", txCount([dialog.id]))} onCancel={close} onConfirm={() => { onDelCategory(dialog.id); close(); }} />}
      {dialog?.kind === "addGroup" && <PromptDialog t={t} title={t("addGroup")} label={t("groupName")} onCancel={close} onSubmit={(n) => { onAddGroup(n); close(); }} />}
      {dialog?.kind === "renameGroup" && <PromptDialog t={t} title={t("rename")} label={t("groupName")} initial={dialog.name} onCancel={close} onSubmit={(n) => { onRenameGroup(dialog.id, n); close(); }} />}
      {dialog?.kind === "delGroup" && <ConfirmDialog t={t} message={t("deleteGroupConfirmN").replace("{n}", txCount((groupsView.find((g) => g.id === dialog.id)?.cats || []).map((c) => c.id)))} onCancel={close} onConfirm={() => { onDelGroup(dialog.id); close(); }} />}
    </Sheet>
  );
}

/* ====================== Schedule sheet ========================== */
function ScheduleSheet({ t, state, onClose, onSave }) {
  const [name, setName] = useState("");
  const [inflow, setInflow] = useState(false);
  const [amount, setAmount] = useState("");
  const spendCats = state.categories.filter((c) => !c.cardId);
  const [catId, setCatId] = useState(spendCats[0]?.id ?? "__income__");
  const [accountId, setAccountId] = useState("");
  const [freq, setFreq] = useState("monthly");
  const [nextDate, setNextDate] = useState(todayISO());

  const incomeSelected = catId === "__income__";
  const isInc = incomeSelected || inflow;
  // same accounts as a new entry: budget accounts, never a card for income; default = the last one used
  const accs = state.accounts.filter((a) => isOnBudget(a) && !(isInc && a.type === "card"));
  const acc = accs.some((a) => a.id === accountId) ? accountId : (accs.find((a) => a.id === state.settings.lastAccountId) || accs[0])?.id ?? "";
  const valid = name.trim() && !isNaN(parseAmount(amount)) && parseAmount(amount) > 0 && !!acc;

  const submit = () => {
    const amt = parseAmount(amount); if (!valid) return;
    onSave({
      name: name.trim(), amount: isInc ? Math.abs(amt) : -Math.abs(amt),
      categoryId: incomeSelected ? null : catId, accountId: acc, freq, nextDate, payee: name.trim(),
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
          {state.groups.filter((g) => !g.isCards).map((g) => (
            <optgroup key={g.id} label={g.name}>
              {spendCats.filter((c) => c.groupId === g.id).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </optgroup>
          ))}
        </select>
      </Field>
      <Field label={t("account")}>
        <select value={acc} onChange={(e) => setAccountId(e.target.value)} style={selectStyle}>
          {accs.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
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
function TargetsSheet({ t, lang, groupsView: allGroups, calc, dispMonth, onClose, onSave }) {
  const groupsView = allGroups.filter((g) => !g.isGoals && !g.isCards);   // «Στόχοι» and card payments have no monthly amount
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

/* ================= One-time move to accounts & cards (v6 → v7) ================= */
// accs: [{ id, name, type, real }] with real = today's balance (cards and loans negative).
function migrateToV7(old, { accs, defAcc, cardOf, orphanCat, cardGroupName }) {
  const s = structuredClone(old);
  s.accounts = accs.map((a) => ({ id: a.id, name: a.name.trim(), type: a.type }));
  const cardIds = new Set(s.accounts.filter((a) => a.type === "card").map((a) => a.id));
  if (cardIds.size) {
    const g = { id: uid(), name: cardGroupName, isCards: true };
    s.groups.unshift(g);
    for (const a of s.accounts) if (cardIds.has(a.id)) s.categories.push({ id: uid(), groupId: g.id, name: a.name, plan: [], cardId: a.id });
  }
  s.transactions = s.transactions.map((x) => {
    if (x.accountId) {          // the old savings transfer: + into the budget, − into savings
      const out = x.amount < 0;
      return { ...x, kind: "transfer", amount: Math.abs(x.amount), categoryId: null,
        accountId: out ? defAcc : x.accountId, toAccountId: out ? x.accountId : defAcc };
    }
    if (x.categoryId === null && x.amount > 0) return { ...x, kind: "income", accountId: defAcc };
    return { ...x, kind: "expense", categoryId: x.categoryId ?? (orphanCat[x.id] || null),
      accountId: cardIds.has(cardOf[x.id]) ? cardOf[x.id] : defAcc };
  });
  // opening balance = today's real balance − what the existing entries already add up to
  const bal = accountBalances(s);
  const today = todayISO();
  for (const a of accs) {
    const diff = round2(a.real - (bal[a.id] || 0));
    if (Math.abs(diff) > 0.004) s.transactions.unshift({ id: uid(), kind: "start", date: today, amount: diff, accountId: a.id, categoryId: null, payee: "", memo: "", scheduleId: null });
  }
  s.schedules = s.schedules.map((sc) => ({ ...sc, accountId: defAcc }));
  s.settings = { ...s.settings, lastAccountId: defAcc };
  s.version = 7;
  return s;
}

function MigrationWizard({ t, state, onExport, onDone }) {
  const nowMk = curMonth();
  const num = (v) => (String(v).trim() === "" ? 0 : parseAmount(v));
  const usedByOld = new Set(state.transactions.filter((x) => x.accountId).map((x) => x.accountId));
  const [accs, setAccs] = useState(() => state.accounts.map((a) => ({
    id: a.id, name: a.name, type: /μετρητ|cash/i.test(a.name) ? "cash" : "checking", real: toInput(a.balance),
  })));
  const [defAcc, setDefAcc] = useState("");
  const [cardOf, setCardOf] = useState({});          // txId → card id
  const [orphanCat, setOrphanCat] = useState({});    // txId → category id
  const [step, setStep] = useState(0);
  const [exported, setExported] = useState(false);

  const setAcc = (id, patch) => setAccs((list) => list.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  const cards = accs.filter((a) => a.type === "card");
  const cashAccs = accs.filter((a) => isOnBudget(a) && a.type !== "card");
  const def = cashAccs.some((a) => a.id === defAcc) ? defAcc
    : [...cashAccs].sort((a, b) => (num(b.real) || 0) - (num(a.real) || 0))[0]?.id ?? "";
  const cardTx = state.transactions.filter((x) => !x.accountId && x.amount < 0 && monthKey(x.date) === nowMk)
    .sort((a, b) => a.date.localeCompare(b.date));
  const orphans = state.transactions.filter((x) => !x.accountId && x.categoryId === null && x.amount < 0)
    .sort((a, b) => a.date.localeCompare(b.date));
  const steps = ["intro", "accounts", "default", ...(cards.length && cardTx.length ? ["cards"] : []), ...(orphans.length ? ["orphans"] : []), "summary"];
  const cur = steps[Math.min(step, steps.length - 1)];
  const accsOk = accs.every((a) => a.name.trim() && !isNaN(num(a.real))) && cashAccs.length > 0;

  const catName = (id) => state.categories.find((c) => c.id === id)?.name || t("uncategorised");
  const dfmt = (iso) => new Date(iso + "T00:00:00").toLocaleDateString("el-GR", { day: "numeric", month: "short" });
  const draft = cur === "summary" ? migrateToV7(state, {
    accs: accs.map((a) => ({ ...a, real: round2(signedBalance(a.type, num(a.real))) })),
    defAcc: def, cardOf, orphanCat, cardGroupName: t("cardPayments"),
  }) : null;
  const draftCalc = draft ? computeBudget(draft, nowMk) : null;
  const startAdded = draft ? round2(draft.transactions.filter((x) => x.kind === "start" && isOnBudget(draft.accounts.find((a) => a.id === x.accountId)) && draft.accounts.find((a) => a.id === x.accountId)?.type !== "card").reduce((s, x) => s + x.amount, 0)) : 0;

  const next = () => (cur === "summary" ? onDone(draft) : setStep(step + 1));
  const canNext = cur === "accounts" ? accsOk : cur === "default" ? !!def : true;
  const box = { background: C.card, border: `1px solid ${C.line}`, borderRadius: 16, padding: 14, marginBottom: 12 };
  const hint = (k) => <div style={{ font: "500 14px/1.55 'Commissioner',sans-serif", color: C.muted, margin: "0 2px 14px", whiteSpace: "pre-line" }}>{t(k)}</div>;
  const rowLine = (x) => (
    <span style={{ flex: 1, minWidth: 0 }}>
      <span style={{ display: "block", font: "600 14px 'Commissioner',sans-serif", color: C.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{x.payee || catName(x.categoryId)}</span>
      <span style={{ display: "block", font: "500 12px 'Commissioner',sans-serif", color: C.muted, marginTop: 2 }}>{dfmt(x.date)}{x.payee ? ` · ${catName(x.categoryId)}` : ""}</span>
    </span>
  );

  return (
    <div style={{ background: C.paper, minHeight: "100vh", display: "flex", justifyContent: "center", fontFamily: "'Commissioner', sans-serif", color: C.ink }}>
      <div style={{ width: "100%", maxWidth: 480, minHeight: "100vh", background: C.paper, paddingBottom: 110 }}>
        <header style={{ background: C.vault, padding: "calc(18px + env(safe-area-inset-top)) 20px 36px", display: "flex", alignItems: "center", gap: 14 }}>
          <MascotBadge status="rich" size={58} />
          <div>
            <h1 style={{ font: "700 22px 'Commissioner',sans-serif", margin: 0, color: C.coin }}>{t("wzTitle")}</h1>
            <div style={{ display: "flex", gap: 6, marginTop: 9 }}>
              {steps.map((s, i) => <span key={s} style={{ width: i === step ? 22 : 8, height: 8, borderRadius: 99, background: i <= step ? C.gold : "rgba(243,239,226,.25)", transition: "all .25s ease" }} />)}
            </div>
          </div>
        </header>
        <Ledger>
          {cur === "intro" && (
            <>
              {hint("wzIntro")}
              <div style={box}>
                <div style={{ font: "500 14px/1.5 'Commissioner',sans-serif", color: C.ink, marginBottom: 12 }}>{t("wzBackup")}</div>
                <GhostBtn color={C.ink} onClick={() => { onExport(); setExported(true); }}>{exported ? <Check size={16} color={C.green} /> : <Download size={16} />}{t("exportJSON")}</GhostBtn>
              </div>
            </>
          )}

          {cur === "accounts" && (
            <>
              <h2 style={{ font: "700 18px 'Commissioner',sans-serif", margin: "0 2px 6px" }}>{t("wzAccounts")}</h2>
              {hint("wzAccountsHint")}
              {accs.map((a) => (
                <div key={a.id} style={box}>
                  <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                    <input value={a.name} onChange={(e) => setAcc(a.id, { name: e.target.value })} placeholder={t("accountName")} aria-label={t("accountName")} style={{ ...inputStyle, flex: 1, minWidth: 0 }} />
                    {!usedByOld.has(a.id) && (
                      <button onClick={() => setAccs((list) => list.filter((x) => x.id !== a.id))} aria-label={t("delete")} style={iconBtn}><Trash2 size={17} color={C.clay} /></button>
                    )}
                  </div>
                  <div style={{ marginBottom: 10 }}><AccountTypeSelect t={t} value={a.type} onChange={(v) => setAcc(a.id, { type: v })} /></div>
                  <label style={fieldLabel}>{balanceLabel(t, a.type)} (€)</label>
                  <input inputMode="decimal" value={a.real} onChange={(e) => setAcc(a.id, { real: e.target.value })} placeholder="0,00" aria-label={`${a.name} ${balanceLabel(t, a.type)}`} style={amountStyle} />
                </div>
              ))}
              <GhostBtn color={C.ink} onClick={() => setAccs((list) => [...list, { id: uid(), name: "", type: "card", real: "" }])}><Plus size={16} />{t("addAccount")}</GhostBtn>
              {cashAccs.length === 0 && <div style={{ font: "500 13px 'Commissioner',sans-serif", color: C.clay, marginTop: 10 }}>{t("wzNeedBudgetAcc")}</div>}
            </>
          )}

          {cur === "default" && (
            <>
              <h2 style={{ font: "700 18px 'Commissioner',sans-serif", margin: "0 2px 6px" }}>{t("wzDefault")}</h2>
              {hint("wzDefaultHint")}
              <Segmented value={def} onChange={setDefAcc} options={cashAccs.map((a) => [a.id, a.name])} />
            </>
          )}

          {cur === "cards" && (
            <>
              <h2 style={{ font: "700 18px 'Commissioner',sans-serif", margin: "0 2px 6px" }}>{t("wzCards")}</h2>
              {hint("wzCardsHint")}
              <div style={{ ...box, padding: 0, overflow: "hidden" }}>
                {cardTx.map((x, i) => {
                  const on = cards.some((c) => c.id === cardOf[x.id]);
                  return (
                    <div key={x.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", borderTop: i ? `1px solid ${C.line}` : "none" }}>
                      <input type="checkbox" checked={on} aria-label={x.payee || catName(x.categoryId)}
                        onChange={(e) => setCardOf((m) => ({ ...m, [x.id]: e.target.checked ? cards[0].id : undefined }))}
                        style={{ width: 20, height: 20, accentColor: C.teal, flexShrink: 0 }} />
                      {rowLine(x)}
                      {on && cards.length > 1 && (
                        <select value={cardOf[x.id]} onChange={(e) => setCardOf((m) => ({ ...m, [x.id]: e.target.value }))} style={{ ...selectStyle, width: 120, padding: "8px 30px 8px 9px", fontSize: 13, backgroundPosition: "right 8px center" }}>
                          {cards.map((c) => <option key={c.id} value={c.id}>{c.name || t("accCard")}</option>)}
                        </select>
                      )}
                      <span style={{ font: "700 14px 'Poppins',sans-serif", color: C.ink, flexShrink: 0 }}>{money(x.amount)}</span>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {cur === "orphans" && (
            <>
              <h2 style={{ font: "700 18px 'Commissioner',sans-serif", margin: "0 2px 6px" }}>{t("wzOrphans")}</h2>
              {hint("wzOrphansHint")}
              {orphans.map((x) => (
                <div key={x.id} style={box}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginBottom: 9 }}>
                    <span style={{ font: "600 14px 'Commissioner',sans-serif" }}>{dfmt(x.date)}{x.payee ? ` · ${x.payee}` : ""}</span>
                    <span style={{ font: "700 14px 'Poppins',sans-serif" }}>{money(x.amount)}</span>
                  </div>
                  <select value={orphanCat[x.id] || ""} onChange={(e) => setOrphanCat((m) => ({ ...m, [x.id]: e.target.value }))} aria-label={`${t("category")} ${money(x.amount)}`} style={selectStyle}>
                    <option value="">{t("uncategorised")}</option>
                    {state.groups.map((g) => (
                      <optgroup key={g.id} label={g.name}>
                        {state.categories.filter((c) => c.groupId === g.id).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </optgroup>
                    ))}
                  </select>
                </div>
              ))}
            </>
          )}

          {cur === "summary" && draft && (
            <>
              <h2 style={{ font: "700 18px 'Commissioner',sans-serif", margin: "0 2px 12px" }}>{t("wzSummary")}</h2>
              <div style={{ ...box, padding: 0, overflow: "hidden" }}>
                {draft.accounts.map((a, i) => (
                  <div key={a.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, padding: "12px 14px", borderTop: i ? `1px solid ${C.line}` : "none" }}>
                    <span>
                      <span style={{ display: "block", font: "600 15px 'Commissioner',sans-serif" }}>{a.name}</span>
                      <span style={{ display: "block", font: "500 12px 'Commissioner',sans-serif", color: C.muted, marginTop: 2 }}>{t(ACC_TYPE_KEY[a.type])} · {t(isOnBudget(a) ? "onBudget" : "tracking")}</span>
                    </span>
                    <span style={{ font: "700 15px 'Poppins',sans-serif", color: (draftCalc.balances[a.id] || 0) < 0 ? C.clay : C.ink }}>{money(draftCalc.balances[a.id])}</span>
                  </div>
                ))}
              </div>
              <div style={{ ...box, display: "flex", justifyContent: "space-between", gap: 10, alignItems: "baseline" }}>
                <span style={{ font: "500 13.5px/1.4 'Commissioner',sans-serif", color: C.muted }}>{t("wzStartAdded")}</span>
                <b style={{ font: "700 16px 'Poppins',sans-serif" }}>{money(startAdded)}</b>
              </div>
              <div style={{ ...box, display: "flex", justifyContent: "space-between", gap: 10, alignItems: "baseline", background: C.tealSoft, borderColor: C.tealSoft }}>
                <span style={{ font: "600 13.5px/1.4 'Commissioner',sans-serif", color: C.teal }}>{t("wzRtaNow")}</span>
                <b style={{ font: "700 20px 'Poppins',sans-serif", color: draftCalc.readyToAssign < 0 ? C.clay : C.teal }}>{money(draftCalc.readyToAssign)}</b>
              </div>
            </>
          )}
        </Ledger>

        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, display: "flex", justifyContent: "center", background: "rgba(245,241,232,.94)", backdropFilter: "blur(8px)", borderTop: `1px solid ${C.line}`, paddingBottom: "env(safe-area-inset-bottom)", zIndex: 20 }}>
          <div style={{ width: "100%", maxWidth: 480, display: "flex", gap: 9, padding: "12px 14px" }}>
            {step > 0 && <GhostBtn onClick={() => setStep(step - 1)}><ChevronLeft size={16} />{t("back")}</GhostBtn>}
            <div style={{ flex: 1 }}>
              <PrimaryBtn onClick={next} disabled={!canNext}>
                {cur === "summary" ? <><Check size={18} />{t("wzFinish")}</> : <>{t("wzNext")}<ChevronRight size={18} /></>}
              </PrimaryBtn>
            </div>
          </div>
        </div>
      </div>
    </div>
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
