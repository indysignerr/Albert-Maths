/**
 * The source of truth for every user-facing string, and the type every other
 * locale is checked against. A missing key in another language falls back here
 * rather than rendering blank.
 */
export const en = {
  common: {
    signIn: "Sign in",
    signOut: "Sign out",
    loading: "Loading…",
    back: "Back",
    save: "Save",
    cancel: "Cancel",
    continue: "Continue",
    language: "Language",
    theme: { toLight: "Switch to light theme", toDark: "Switch to dark theme" },
    disclaimer:
      "Albert Maths is a student project and is not affiliated with Albert School.",
  },

  nav: {
    howItWorks: "How it works",
    principles: "Principles",
    classes: "Classes",
  },

  landing: {
    badge:
      "Built for Albert School · Paris · Milan · Madrid · Geneva · Marseille",
    titleBefore: "Find out ",
    titleHighlight: "where",
    titleAfter: " you got it wrong.",
    lede: "Albert Maths does not do your homework. It takes the exercise you are stuck on, walks you to the answer one hint at a time, then reads your own working to show you the exact step that broke.",
    ctaPrimary: "Start with an exercise",
    ctaSecondary: "Why it refuses to just answer",
    reassurance:
      "Free for students · works in English and French · every campus, same programme",
    stepsTitle: "Three moves, in this order",
    steps: [
      {
        title: "Photograph the problem",
        body: "Snap the exercise from your sheet or screen. It is transcribed into clean notation you can check before anything else happens.",
      },
      {
        title: "Work it with guided hints",
        body: "Four levels, unlocked one at a time: what the question is really asking, which result applies, the first move, then the full solution.",
      },
      {
        title: "Show your own attempt",
        body: "Photograph your working. You get the line where it broke and why — not a clean answer that teaches you nothing.",
      },
    ],
    principlesTitle: "A homework machine would be easy to build.",
    principlesSubtitle: "This one is deliberately harder to cheat with.",
    principles: [
      {
        title: "The answer is never the first thing you see",
        body: "Solutions stay locked until you have made an attempt or worked through the hints. The tool is useless for copying and that is the point.",
      },
      {
        title: "It asks before it tells",
        body: "The tutor replies with questions that move you forward. When you get something wrong it hands you a similar exercise to prove the idea stuck.",
      },
      {
        title: "You still talk to each other",
        body: "Every campus shares the same programme. Class channels let you compare approaches with people sitting the same exam.",
      },
    ],
    classesTitle: "Your class, your campus, one programme",
    classesBody1:
      "Join with a class code and you land in a channel with the people sitting the same exercises. Compare approaches, post the step you cannot get past, and see how someone else framed it. Everyone appears under their first name — no anonymous pile-ons, and abusive messages are filtered on the way in.",
    classesBody2:
      "Milan, Paris, Madrid, Geneva and Marseille follow the same curriculum, so a question asked on one campus is worth reading on all of them.",
    ctaTitle: "Bring the exercise you have been avoiding.",
    ctaButton: "Sign in with your school email",
    privacy: "Privacy",
    terms: "Terms",
  },

  signIn: {
    title: "Sign in",
    subtitle: "Albert School students only.",
    emailLabel: "School email",
    submit: "Send me a sign-in link",
    sending: "Sending…",
    sentTitle: "Check your inbox",
    sentBody:
      "We sent a sign-in link to {email}. Open it on this device and you are in — no password to remember.",
    useAnother: "Use a different address",
    restricted: "Albert Maths is limited to @{domain} addresses.",
    expiredTitle: "That link has expired",
    expiredBody: "Sign-in links are single use and short lived.",
    requestNew: "Request a new one",
    signingIn: "Signing you in…",
  },

  onboarding: {
    title: "Set up your account",
    subtitle: "Classmates see your first name and one initial — nothing else.",
    firstName: "First name",
    initial: "Initial",
    campus: "Campus",
    year: "Year",
    track: "Track",
    trackHelp:
      "This sets the language of your explanations. You can change it any time in settings.",
    trackEnglish: "English track",
    trackFrench: "French track",
    incomplete: "Fill in your name, campus and track.",
    saving: "Saving…",
  },

  dashboard: {
    greeting: "Hello, {name}.",
    greetingAnonymous: "Hello.",
    prompt: "What are you stuck on?",
    newProblem: "Photograph an exercise",
    newProblemBody: "Transcribed, then worked through one hint at a time.",
    yourClass: "Your class",
    yourClassBody: "Compare approaches with people sitting the same exercises.",
    recent: "Recent exercises",
    empty: "Nothing here yet",
    emptyBody:
      "Once you start working through problems, the exercises you got wrong and then understood will collect here.",
    resume: "Open",
    progressTitle: "What you have understood",
    errorsUnderstood: "mistakes understood",
    consolidationsPassed: "follow-ups passed",
    progressNote:
      "This counts mistakes you found and fixed — never solutions you looked at.",
    quotaLeft: "{n} exercises left today",
    quotaNote:
      "The daily limit exists so this stays a place to think, not to scan a problem set.",
    settings: "Settings",
  },

  solve: {
    photoTitle: "Photograph the exercise",
    photoBody:
      "Include your own working if you have already started — that is how the tutor finds where it broke.",
    choosePhoto: "Choose or take a photo",
    reading: "Reading the photo…",
    photoNote: "The photo is read once and never stored.",
    exercise: "The exercise",
    fixTranscription: "Transcribed wrong? Fix it",
    yourWorking: "Your working",
    workingPlaceholder: "One step per line.",
    findMistake: "Find my mistake",
    reviewing: "Reading…",
    hints: "Hints",
    levels: [
      "What is actually being asked",
      "Which result applies",
      "The first step",
      "The full solution",
    ],
    unlock: "Unlock hint {n}",
    waiting: "Think about it for {n}s",
    needsAttempt: "Submit your working first",
    needsAttemptNote: "The solution costs one honest attempt.",
    outOfOrder:
      "Show your own working first — that is what unlocks the solution.",
    firstBadLine: "First line that breaks",
    allCorrect: "Every line holds up.",
    verifying: "Recomputing this independently…",
    verified: "Recomputed independently with SymPy — the final value agrees.",
    contradictedLead: "Do not trust this final value.",
    contradicted:
      " Recomputing it independently gave {value}. The reasoning above may still be sound — check the last step yourself.",
    unverified: "This one could not be checked automatically.",
    chatTitle: "Talk it through",
    chatEmpty:
      "Ask what you are actually stuck on. The tutor answers with questions — it will not hand you the step, but it will tell you straight away if something you wrote is false.",
    chatPlaceholder: "Why does this step not work?",
    chatSend: "Send",
    chatThinking: "Thinking…",
    consolidationTitle: "Check it actually stuck",
    consolidationBody:
      "One short exercise that breaks the same way if the idea has not landed.",
    consolidationGenerate: "Give me one",
    consolidationWriting: "Writing one…",
    consolidationNow: "Now this one",
    yourAnswer: "Your answer",
    check: "Check",
    answerHint: "Write it the way you would type it: {examples}.",
    onPaper:
      "Work this one on paper — it has no single value to check against.",
    passed: "That is right. The idea landed.",
    failedAgain:
      "Not yet — and it is the same idea as before. Go back to the line you got wrong and read it again.",
    unreadable: "Could not read that. Try SymPy notation, like {example}.",
    another: "Another one",
    quotaReached:
      "You have reached today's limit. Come back tomorrow — or keep working on an exercise you already started.",
  },

  classes: {
    title: "Classes",
    subtitle: "The people sitting the same exercises as you.",
    join: "Join a class",
    joinCode: "Class code",
    joinSubmit: "Join",
    joining: "Joining…",
    joinFailed: "No class matches that code.",
    create: "Create a class",
    createName: "Class name",
    createSubmit: "Create",
    created: "Created. Share this code with your class:",
    none: "You are not in a class yet",
    noneBody:
      "Join with a code from someone in your year, or create one and share the code.",
    members: "{n} members",
    memberList: "In this class",
    you: "you",
    founder: "created the class",
    shareToClass: "Ask my class about this",
    sharePrompt: "What are you stuck on?",
    shareSend: "Post to my class",
    shared: "Posted to your class.",
    sharedExercise: "Stuck on this",
    today: "Today",
    open: "Open",
    leave: "Leave",
    messagePlaceholder: "Ask the question you are stuck on…",
    send: "Send",
    empty: "No messages yet. Be the first to ask.",
    blocked:
      "That message was not sent. Keep it about the maths — insults and personal attacks are blocked.",
    report: "Report",
    reported: "Reported. Two reports hide a message.",
    reportFailed: "Could not report that message.",
    campusLabel: "Campus",
  },

  auth: {
    showPassword: "Show password",
    hidePassword: "Hide password",
    signInTitle: "Sign in",
    signInSubtitle: "Albert School students only.",
    email: "School email",
    password: "Password",
    signIn: "Sign in",
    signingIn: "Signing in…",
    wrongCredentials: "That email and password do not match.",
    noAccountYet: "First time here? Create your account",
    haveAccount: "Already have a password? Sign in",
    forgot: "Forgotten your password?",

    createTitle: "Create your account",
    createSubtitle:
      "We send one link. You will not have to check your email again after that.",
    sendLink: "Send me the link",
    sending: "Sending…",
    linkSentTitle: "Check your inbox",
    linkSentBody:
      "We sent a link to {email}. Open it and you will choose a password — after that you sign in straight from this page.",
    useAnother: "Use a different address",

    resetTitle: "Set a new password",
    resetSubtitle: "We send one link. It takes you straight to a new password.",

    setTitle: "Choose your password",
    setSubtitle:
      "Let your browser save it. That is the whole point — no more emails to sign in.",
    newPassword: "Password",
    confirmPassword: "Confirm password",
    tooShort: "At least 8 characters.",
    mismatch: "The two passwords do not match.",
    setSubmit: "Save and continue",
    saving: "Saving…",
  },

  notions: {
    title: "Refresh a notion",
    subtitle: "For when you have forgotten how something works.",
    openOnSolve: "Forgotten a notion?",
    placeholder: "How does integration by parts work again?",
    ask: "Explain it",
    thinking: "Looking it up…",
    empty:
      "Ask about a result, a theorem, a method — anything from the course you cannot remember. This does not know which exercise you are on and will not solve it.",
    deflected:
      "That looked like a specific exercise. Here is the notion behind it — take the exercise itself to the solver, where the hints open one at a time.",
    scope: "Explains notions only. It never sees your exercise.",
  },

  settings: {
    title: "Settings",
    profile: "Your profile",
    profileNote: "Classmates see your first name and one initial.",
    appearance: "Appearance",
    themeLabel: "Theme",
    themeLight: "Light",
    themeDark: "Dark",
    saved: "Saved",
    yourData: "Your data",
    exportTitle: "Download everything held about you",
    exportBody:
      "One JSON file with your profile, every exercise, every attempt, every message. Nothing is left out.",
    exportButton: "Download my data",
    exporting: "Preparing…",
    deleteTitle: "Delete your account",
    deleteBody:
      "This removes your profile, your exercises, your attempts, your progress and the messages you posted in class channels. It cannot be undone and there is no backup to restore from.",
    deleteButton: "Delete my account",
    deleteConfirmPrompt: "Type {word} to confirm.",
    deleteConfirmWord: "DELETE",
    deleteConfirmButton: "Delete permanently",
    deleting: "Deleting…",
    deleteFailed: "Could not delete the account. Try again, or write to us.",
  },

  legal: {
    privacyTitle: "Privacy",
    termsTitle: "Terms",
    lastUpdated: "Last updated {date}",
  },

  errors: {
    generic: "Something went wrong",
    sessionExpired: "Your session expired — sign in again",
    signInRequired: "Sign in to use the tutor",
    tooBusy:
      "The tutor is handling too many requests right now. Try again in a moment.",
    unreadablePhoto:
      "Nothing readable in that photo. Try better light or a closer crop.",
  },
} as const;

export type Dictionary = typeof en;
