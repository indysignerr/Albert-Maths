"use client";

import { LegalShell } from "@/components/legal/shell";
import { useT } from "@/lib/i18n";

const UPDATED = "31 August 2026";
const CONTACT = "indyfrancois6@gmail.com";

export default function PrivacyPage() {
  const { t, locale } = useT();
  return (
    <LegalShell title={t("legal.privacyTitle")} updated={UPDATED}>
      {locale === "fr" ? <Fr /> : <En />}
    </LegalShell>
  );
}

function En() {
  return (
    <>
      <p>
        Albert Maths is a student project. It is not an official Albert School
        service and Albert School has no access to anything described here.
      </p>

      <h2>What is collected</h2>
      <table>
        <thead>
          <tr>
            <th>Data</th>
            <th>Why</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Email address</td>
            <td>To sign you in. No password is ever stored.</td>
          </tr>
          <tr>
            <td>First name and one initial</td>
            <td>
              So classmates can tell who wrote a message. Your full surname is
              never asked for.
            </td>
          </tr>
          <tr>
            <td>Campus, year, track, language</td>
            <td>To match you to a class and answer in the right language.</td>
          </tr>
          <tr>
            <td>
              Exercises, your working, hints unlocked, tutor conversations
            </td>
            <td>To show you your own history and find your mistakes.</td>
          </tr>
          <tr>
            <td>Class messages</td>
            <td>Visible to the members of that class, and to nobody else.</td>
          </tr>
        </tbody>
      </table>

      <h2>Photographs</h2>
      <p>
        A photograph you take of an exercise is sent once for transcription and{" "}
        <strong>is never stored</strong> — not by this service, and not in your
        account. Only the resulting text is kept. If the photograph happens to
        contain your name or handwriting, that text may be transcribed along
        with the exercise; crop it out before taking the picture if you would
        rather it were not.
      </p>

      <h2>Who processes it</h2>
      <ul>
        <li>
          <strong>Supabase Inc.</strong> — database and sign-in.
        </li>
        <li>
          <strong>Mistral AI</strong> (Paris, France) — reads the photograph and
          writes the hints. Mistral states that data submitted through its API
          is not used to train its models.
        </li>
        <li>
          <strong>Cloudflare</strong> — serves the site and runs the code that
          talks to Mistral.
        </li>
      </ul>
      <p>
        Nothing is sold, and nothing is shared with advertisers. There is no
        analytics, no tracking pixel and no third-party cookie. The only thing
        stored in your browser is your session, your chosen language and your
        light or dark preference.
      </p>

      <h2>How long it is kept</h2>
      <p>
        Until you ask for it to be deleted. Write to {CONTACT} from your school
        address and your account and everything attached to it is removed. Class
        messages you posted are removed with it.
      </p>

      <h2>Your rights</h2>
      <p>
        Under the GDPR you may ask for a copy of your data, ask for it to be
        corrected, ask for it to be deleted, or object to its processing. Write
        to {CONTACT}. If you are not satisfied with the answer, you may complain
        to the CNIL (France) or to the supervisory authority of the country you
        live in.
      </p>

      <h2>If you are under 15</h2>
      <p>
        Some first-year students are minors. If you are below the age of digital
        consent where you live — 15 in France, 14 in Italy and Spain — a parent
        or guardian must agree before you use Albert Maths. Ask them to write to{" "}
        {CONTACT}.
      </p>

      <h2>Changes</h2>
      <p>
        If this page changes in a way that affects you, the new version is dated
        at the top and you will be told the next time you sign in.
      </p>
    </>
  );
}

function Fr() {
  return (
    <>
      <p>
        Albert Maths est un projet étudiant. Ce n’est pas un service officiel
        d’Albert School, et Albert School n’a accès à rien de ce qui est décrit
        ici.
      </p>

      <h2>Ce qui est collecté</h2>
      <table>
        <thead>
          <tr>
            <th>Donnée</th>
            <th>Pourquoi</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Adresse email</td>
            <td>Pour te connecter. Aucun mot de passe n’est conservé.</td>
          </tr>
          <tr>
            <td>Prénom et une initiale</td>
            <td>
              Pour que tes camarades sachent qui a écrit un message. Ton nom
              complet n’est jamais demandé.
            </td>
          </tr>
          <tr>
            <td>Campus, année, track, langue</td>
            <td>
              Pour te rattacher à une classe et te répondre dans la bonne
              langue.
            </td>
          </tr>
          <tr>
            <td>
              Exercices, ton brouillon, indices débloqués, conversations avec le
              tuteur
            </td>
            <td>Pour te montrer ton historique et localiser tes erreurs.</td>
          </tr>
          <tr>
            <td>Messages de classe</td>
            <td>
              Visibles par les membres de cette classe, et par personne d’autre.
            </td>
          </tr>
        </tbody>
      </table>

      <h2>Les photos</h2>
      <p>
        Une photo d’exercice est envoyée une fois pour transcription et{" "}
        <strong>n’est jamais conservée</strong> — ni par ce service, ni dans ton
        compte. Seul le texte obtenu est gardé. Si la photo contient ton nom ou
        ton écriture, ce texte peut être transcrit avec l’exercice : recadre
        avant de photographier si tu préfères l’éviter.
      </p>

      <h2>Qui traite ces données</h2>
      <ul>
        <li>
          <strong>Supabase Inc.</strong> — base de données et connexion.
        </li>
        <li>
          <strong>Mistral AI</strong> (Paris, France) — lit la photo et rédige
          les indices. Mistral indique que les données envoyées via son API ne
          servent pas à entraîner ses modèles.
        </li>
        <li>
          <strong>Cloudflare</strong> — héberge le site et exécute le code qui
          dialogue avec Mistral.
        </li>
      </ul>
      <p>
        Rien n’est vendu, rien n’est transmis à des annonceurs. Aucune mesure
        d’audience, aucun pixel de suivi, aucun cookie tiers. Ton navigateur ne
        conserve que ta session, ta langue et ta préférence clair ou sombre.
      </p>

      <h2>Durée de conservation</h2>
      <p>
        Jusqu’à ce que tu demandes la suppression. Écris à {CONTACT} depuis ton
        adresse de l’école : ton compte et tout ce qui y est rattaché sont
        supprimés, y compris les messages que tu as postés.
      </p>

      <h2>Tes droits</h2>
      <p>
        Le RGPD te permet de demander une copie de tes données, leur
        rectification, leur suppression, ou de t’opposer à leur traitement.
        Écris à {CONTACT}. Si la réponse ne te satisfait pas, tu peux saisir la
        CNIL, ou l’autorité de contrôle du pays où tu résides.
      </p>

      <h2>Si tu as moins de 15 ans</h2>
      <p>
        Certains étudiants de première année sont mineurs. Si tu es en dessous
        de l’âge du consentement numérique de ton pays — 15 ans en France, 14 en
        Italie et en Espagne — un parent ou tuteur doit donner son accord avant
        que tu utilises Albert Maths. Demande-lui d’écrire à {CONTACT}.
      </p>

      <h2>Modifications</h2>
      <p>
        Si cette page change d’une manière qui te concerne, la nouvelle version
        est datée en haut et tu en seras informé à ta prochaine connexion.
      </p>
    </>
  );
}
