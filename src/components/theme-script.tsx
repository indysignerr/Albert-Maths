/**
 * Applies the stored theme before first paint so the page never flashes.
 * Inlined in <head>; must stay dependency-free and synchronous.
 */
const script = `(function(){try{var s=localStorage.getItem("albert-theme");var d=s==="dark"||(!s&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d);document.documentElement.style.colorScheme=d?"dark":"light";}catch(e){}})();`;

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
