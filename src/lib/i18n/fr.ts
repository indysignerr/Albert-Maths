import type { Dictionary } from "./en";

/**
 * `en` is declared `as const`, so every string there has a literal type. A
 * translation is a different string, so the dictionary type has to widen
 * literals back to `string` — and make every key optional, since an untranslated
 * key falls back to English at render time rather than blocking the release.
 */
type Widen<T> = T extends string
  ? string
  : T extends readonly (infer U)[]
    ? readonly Widen<U>[]
    : T extends object
      ? { [K in keyof T]?: Widen<T[K]> }
      : T;

export type PartialDictionary = Widen<Dictionary>;

export const fr: PartialDictionary = {
  common: {
    signIn: "Se connecter",
    signOut: "Se déconnecter",
    loading: "Chargement…",
    back: "Retour",
    save: "Enregistrer",
    cancel: "Annuler",
    continue: "Continuer",
    language: "Langue",
    theme: { toLight: "Passer au thème clair", toDark: "Passer au thème sombre" },
    disclaimer:
      "Albert Maths est un projet étudiant, sans lien avec Albert School.",
  },

  nav: {
    howItWorks: "Comment ça marche",
    principles: "Principes",
    classes: "Classes",
  },

  landing: {
    badge: "Conçu pour Albert School · Paris · Milan · Madrid · Genève · Marseille",
    titleBefore: "Trouve ",
    titleHighlight: "où",
    titleAfter: " tu t’es trompé.",
    lede: "Albert Maths ne fait pas tes devoirs. Il prend l’exercice qui te bloque, te conduit à la réponse un indice à la fois, puis lit ton propre brouillon pour te montrer l’étape exacte qui a cassé.",
    ctaPrimary: "Commencer par un exercice",
    ctaSecondary: "Pourquoi il refuse de répondre",
    reassurance:
      "Gratuit pour les étudiants · en français et en anglais · même programme sur tous les campus",
    stepsTitle: "Trois gestes, dans cet ordre",
    steps: [
      {
        title: "Photographie l’énoncé",
        body: "Prends l’exercice sur ta feuille ou ton écran. Il est transcrit en notation propre, que tu peux vérifier avant toute chose.",
      },
      {
        title: "Avance avec des indices",
        body: "Quatre niveaux, débloqués un par un : ce que la question demande vraiment, quel résultat s’applique, le premier pas, puis la solution complète.",
      },
      {
        title: "Montre ton brouillon",
        body: "Photographie ce que tu as écrit. Tu obtiens la ligne qui casse et pourquoi — pas une réponse propre qui ne t’apprend rien.",
      },
    ],
    principlesTitle: "Une machine à devoirs serait facile à construire.",
    principlesSubtitle: "Celle-ci est délibérément difficile à détourner.",
    principles: [
      {
        title: "La réponse n’est jamais la première chose que tu vois",
        body: "Les solutions restent verrouillées tant que tu n’as pas tenté ou parcouru les indices. L’outil est inutile pour copier, et c’est le but.",
      },
      {
        title: "Il questionne avant d’expliquer",
        body: "Le tuteur répond par des questions qui te font avancer. Quand tu te trompes, il te donne un exercice similaire pour vérifier que l’idée est passée.",
      },
      {
        title: "Vous continuez à vous parler",
        body: "Tous les campus suivent le même programme. Les canaux de classe permettent de comparer vos approches avec ceux qui passent le même contrôle.",
      },
    ],
    classesTitle: "Ta classe, ton campus, un seul programme",
    classesBody1:
      "Rejoins avec un code et tu arrives dans un canal avec ceux qui font les mêmes exercices. Comparez vos approches, poste l’étape qui te bloque, vois comment un autre l’a formulée. Chacun apparaît sous son prénom — pas de meute anonyme, et les messages abusifs sont filtrés à l’entrée.",
    classesBody2:
      "Milan, Paris, Madrid, Genève et Marseille suivent le même cursus : une question posée sur un campus mérite d’être lue sur tous les autres.",
    ctaTitle: "Apporte l’exercice que tu évites depuis une semaine.",
    ctaButton: "Se connecter avec l’adresse de l’école",
    privacy: "Confidentialité",
    terms: "Conditions",
  },

  signIn: {
    title: "Connexion",
    subtitle: "Réservé aux étudiants d’Albert School.",
    emailLabel: "Adresse de l’école",
    submit: "Envoyer un lien de connexion",
    sending: "Envoi…",
    sentTitle: "Vérifie ta boîte mail",
    sentBody:
      "Nous avons envoyé un lien de connexion à {email}. Ouvre-le sur cet appareil et c’est fait — aucun mot de passe à retenir.",
    useAnother: "Utiliser une autre adresse",
    restricted: "Albert Maths est réservé aux adresses @{domain}.",
    expiredTitle: "Ce lien a expiré",
    expiredBody: "Les liens de connexion sont à usage unique et de courte durée.",
    requestNew: "En demander un nouveau",
    signingIn: "Connexion en cours…",
  },

  onboarding: {
    title: "Configure ton compte",
    subtitle: "Tes camarades voient ton prénom et une initiale — rien d’autre.",
    firstName: "Prénom",
    initial: "Initiale",
    campus: "Campus",
    year: "Année",
    track: "Track",
    trackHelp:
      "Ce choix fixe la langue de tes explications. Modifiable à tout moment dans les paramètres.",
    trackEnglish: "Track anglais",
    trackFrench: "Track français",
    incomplete: "Renseigne ton prénom, ton campus et ton track.",
    saving: "Enregistrement…",
  },

  dashboard: {
    greeting: "Bonjour {name}.",
    greetingAnonymous: "Bonjour.",
    prompt: "Qu’est-ce qui te bloque ?",
    newProblem: "Photographier un exercice",
    newProblemBody: "Transcrit, puis travaillé un indice à la fois.",
    yourClass: "Ta classe",
    yourClassBody: "Compare tes approches avec ceux qui font les mêmes exercices.",
    recent: "Exercices récents",
    empty: "Rien pour l’instant",
    emptyBody:
      "Dès que tu commenceras à travailler des exercices, ceux que tu as ratés puis compris s’accumuleront ici.",
    resume: "Ouvrir",
    progressTitle: "Ce que tu as compris",
    errorsUnderstood: "erreurs comprises",
    consolidationsPassed: "exercices de contrôle réussis",
    progressNote:
      "On compte les erreurs que tu as trouvées et corrigées — jamais les solutions consultées.",
    quotaLeft: "{n} exercices restants aujourd’hui",
    quotaNote:
      "La limite quotidienne existe pour que ça reste un endroit où réfléchir, pas où scanner une feuille d’exercices.",
    settings: "Paramètres",
  },

  solve: {
    photoTitle: "Photographie l’exercice",
    photoBody:
      "Inclus ton brouillon si tu as déjà commencé — c’est comme ça que le tuteur trouve où ça a cassé.",
    choosePhoto: "Choisir ou prendre une photo",
    reading: "Lecture de la photo…",
    photoNote: "La photo est lue une fois et jamais conservée.",
    exercise: "L’énoncé",
    fixTranscription: "Mal transcrit ? Corrige-le",
    yourWorking: "Ton brouillon",
    workingPlaceholder: "Une étape par ligne.",
    findMistake: "Trouve mon erreur",
    reviewing: "Lecture…",
    hints: "Indices",
    levels: [
      "Ce qui est vraiment demandé",
      "Quel résultat s’applique",
      "La première étape",
      "La solution complète",
    ],
    unlock: "Débloquer l’indice {n}",
    waiting: "Réfléchis-y {n} s",
    needsAttempt: "Soumets d’abord ton brouillon",
    needsAttemptNote: "La solution coûte une tentative honnête.",
    outOfOrder:
      "Montre d’abord ton propre brouillon — c’est ce qui déverrouille la solution.",
    firstBadLine: "Première ligne qui casse",
    allCorrect: "Toutes les lignes tiennent.",
    verifying: "Recalcul indépendant en cours…",
    verified: "Recalculé indépendamment avec SymPy — la valeur finale concorde.",
    contradictedLead: "Ne fais pas confiance à cette valeur finale.",
    contradicted:
      " Le recalcul indépendant donne {value}. Le raisonnement ci-dessus peut rester valable — vérifie la dernière étape toi-même.",
    unverified: "Celui-ci n’a pas pu être vérifié automatiquement.",
    chatTitle: "En discuter",
    chatEmpty:
      "Demande ce qui te bloque vraiment. Le tuteur répond par des questions — il ne te donnera pas l’étape, mais il te dira immédiatement si ce que tu as écrit est faux.",
    chatPlaceholder: "Pourquoi cette étape ne marche pas ?",
    chatSend: "Envoyer",
    chatThinking: "Réflexion…",
    consolidationTitle: "Vérifie que c’est passé",
    consolidationBody:
      "Un exercice court qui casse de la même façon si l’idée n’est pas acquise.",
    consolidationGenerate: "Donne-m’en un",
    consolidationWriting: "Rédaction…",
    consolidationNow: "Maintenant celui-ci",
    yourAnswer: "Ta réponse",
    check: "Vérifier",
    answerHint: "Écris-la comme tu la taperais : {examples}.",
    onPaper:
      "Celui-ci se fait sur papier — il n’a pas de valeur unique à comparer.",
    passed: "C’est juste. L’idée est passée.",
    failedAgain:
      "Pas encore — et c’est la même idée qu’avant. Retourne à la ligne que tu avais ratée et relis-la.",
    unreadable: "Impossible à lire. Essaie la notation SymPy, comme {example}.",
    another: "Un autre",
    quotaReached:
      "Tu as atteint la limite du jour. Reviens demain — ou continue un exercice déjà commencé.",
  },

  classes: {
    title: "Classes",
    subtitle: "Ceux qui font les mêmes exercices que toi.",
    join: "Rejoindre une classe",
    joinCode: "Code de classe",
    joinSubmit: "Rejoindre",
    joining: "Connexion…",
    joinFailed: "Aucune classe ne correspond à ce code.",
    create: "Créer une classe",
    createName: "Nom de la classe",
    createSubmit: "Créer",
    created: "Créée. Partage ce code avec ta classe :",
    none: "Tu n’es dans aucune classe",
    noneBody:
      "Rejoins avec le code de quelqu’un de ta promo, ou crée-en une et partage le code.",
    members: "{n} membres",
    open: "Ouvrir",
    leave: "Quitter",
    messagePlaceholder: "Pose la question qui te bloque…",
    send: "Envoyer",
    empty: "Aucun message. Sois le premier à demander.",
    blocked:
      "Ce message n’a pas été envoyé. Reste sur les maths — les insultes et attaques personnelles sont bloquées.",
    campusLabel: "Campus",
  },

  legal: {
    privacyTitle: "Confidentialité",
    termsTitle: "Conditions d’utilisation",
    lastUpdated: "Dernière mise à jour : {date}",
  },

  errors: {
    generic: "Une erreur est survenue",
    sessionExpired: "Ta session a expiré — reconnecte-toi",
    signInRequired: "Connecte-toi pour utiliser le tuteur",
    tooBusy:
      "Le tuteur traite trop de demandes en ce moment. Réessaie dans un instant.",
    unreadablePhoto:
      "Rien de lisible sur cette photo. Essaie avec plus de lumière ou un cadrage plus serré.",
  },
};
