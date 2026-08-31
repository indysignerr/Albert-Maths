"use client";

import { LegalShell } from "@/components/legal/shell";
import { useT } from "@/lib/i18n";

const UPDATED = "31 August 2026";
const CONTACT = "indyfrancois6@gmail.com";

export default function TermsPage() {
  const { t, locale } = useT();
  return (
    <LegalShell title={t("legal.termsTitle")} updated={UPDATED}>
      {locale === "fr" ? <Fr /> : <En />}
    </LegalShell>
  );
}

function En() {
  return (
    <>
      <h2>What this is</h2>
      <p>
        Albert Maths is a free study tool built by a student, for students. It
        is not an official Albert School service, it is not endorsed by the
        school, and no mark you receive depends on it.
      </p>

      <h2>What it is for</h2>
      <p>
        Understanding where your reasoning broke. It is deliberately built to be
        bad at producing homework you can hand in: solutions stay locked until
        you have attempted the problem, hints unlock one at a time, and the
        tutor answers with questions.
      </p>
      <p>
        Whether using it on a given assignment is allowed is decided by your
        school and your teacher, not by this page. Under an academic integrity
        policy that forbids outside help, this tool is outside help. Ask first.
      </p>

      <h2>It gets things wrong</h2>
      <p>
        Everything the tutor writes is produced by a language model and{" "}
        <strong>may be wrong</strong>. Final values in full solutions are
        recomputed independently and labelled accordingly, but the reasoning
        around them is not verified and never will be entirely. Treat it as a
        classmate who is usually right, not as a correction key. If it
        contradicts your course, your course wins.
      </p>

      <h2>Class channels</h2>
      <p>
        You post under your first name and one initial. Insults and personal
        attacks are filtered automatically and the filter is not the limit of
        what is unacceptable — harassment gets an account removed. Do not post
        other people’s personal information. Do not post exam papers you have
        been told not to share.
      </p>

      <h2>Your account</h2>
      <p>
        Sign-in links are personal; do not forward them. Accounts are for Albert
        School students. You can ask for yours to be deleted at any time by
        writing to {CONTACT}.
      </p>

      <h2>Availability</h2>
      <p>
        This runs on free service tiers and may be slow, rate-limited or
        unavailable. There is no guarantee of uptime and no guarantee that your
        history is preserved. Keep your own notes.
      </p>

      <h2>Liability</h2>
      <p>
        The service is provided as is, without warranty. It is offered free of
        charge and the author accepts no liability for marks, missed deadlines
        or any other consequence of relying on it.
      </p>

      <h2>Contact</h2>
      <p>{CONTACT}</p>
    </>
  );
}

function Fr() {
  return (
    <>
      <h2>Ce que c’est</h2>
      <p>
        Albert Maths est un outil de révision gratuit, fait par un étudiant pour
        des étudiants. Ce n’est pas un service officiel d’Albert School, il
        n’est pas approuvé par l’école, et aucune note ne dépend de lui.
      </p>

      <h2>À quoi ça sert</h2>
      <p>
        À comprendre où ton raisonnement a cassé. L’outil est délibérément conçu
        pour être mauvais à produire un devoir rendable : les solutions restent
        verrouillées tant que tu n’as pas tenté, les indices s’ouvrent un par
        un, et le tuteur répond par des questions.
      </p>
      <p>
        Savoir si son usage est autorisé sur un devoir donné relève de ton école
        et de ton professeur, pas de cette page. Sous un règlement qui interdit
        toute aide extérieure, cet outil est une aide extérieure. Demande avant.
      </p>

      <h2>Il se trompe</h2>
      <p>
        Tout ce qu’écrit le tuteur est produit par un modèle de langage et{" "}
        <strong>peut être faux</strong>. Les valeurs finales des solutions
        complètes sont recalculées indépendamment et étiquetées en conséquence,
        mais le raisonnement autour n’est pas vérifié et ne le sera jamais
        entièrement. Traite-le comme un camarade souvent juste, pas comme un
        corrigé. S’il contredit ton cours, c’est ton cours qui a raison.
      </p>

      <h2>Canaux de classe</h2>
      <p>
        Tu postes sous ton prénom et une initiale. Les insultes et attaques
        personnelles sont filtrées automatiquement, et le filtre ne définit pas
        la limite de l’inacceptable : le harcèlement entraîne la suppression du
        compte. Ne publie pas les données personnelles d’autrui. Ne publie pas
        de sujets d’examen qu’on t’a demandé de ne pas diffuser.
      </p>

      <h2>Ton compte</h2>
      <p>
        Les liens de connexion sont personnels, ne les transfère pas. Les
        comptes sont réservés aux étudiants d’Albert School. Tu peux demander la
        suppression du tien à tout moment en écrivant à {CONTACT}.
      </p>

      <h2>Disponibilité</h2>
      <p>
        Le service tourne sur des offres gratuites : il peut être lent, limité
        ou indisponible. Aucune garantie de disponibilité, aucune garantie de
        conservation de ton historique. Garde tes propres notes.
      </p>

      <h2>Responsabilité</h2>
      <p>
        Le service est fourni en l’état, sans garantie. Il est offert
        gratuitement et l’auteur décline toute responsabilité quant aux notes,
        aux retards ou à toute autre conséquence de son usage.
      </p>

      <h2>Contact</h2>
      <p>{CONTACT}</p>
    </>
  );
}
