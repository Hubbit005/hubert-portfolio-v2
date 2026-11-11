// Dwie wersje językowe (EN domyślnie, PL). Teksty polskie w słowniku: klucz = tekst angielski z HTML.
// Przełącznik EN / PL w lewym górnym rogu. Wybór zapamiętany w localStorage.
import { loadGlyphs, glyphSVG } from './glyphs.js?v=20261111';

const MAIL = '<a href="mailto:hubert.austria2025@gmail.com">';
const PL = {
  // napisy z glifów (font demo nie ma polskich liter, więc słowa bez ogonków)
  'SELECTED': 'WYBRANE', 'WORKS': 'PRACE', 'SERVICES': 'OFERTA', 'MY STORY': 'O MNIE', 'SOCIALS': 'KONTAKT', 'CLOSE': 'ZAMKNIJ',
  // hero
  'A Poland-based web designer building immersive, AI-powered websites <br>for brands that want to be remembered.':
    'Web designer z Polski. Tworzę immersyjne strony z AI <br>dla marek, które chcą zostać zapamiętane.',
  // lista prac
  '// WEBSITE + MOTION': '// STRONA + ANIMACJE', '// RESTAURANT WEBSITE': '// STRONA RESTAURACJI',
  '// BOOKING + PAYMENTS': '// REZERWACJE + PŁATNOŚCI', '// AI AGENT': '// AGENT AI',
  // usługi
  'WEBSITES': 'STRONY INTERNETOWE', 'Design and code, from the first sketch to launch.': 'Projekt i kod, od pierwszego szkicu do startu.',
  'AI CHAT AGENTS': 'AGENCI AI NA STRONĘ', 'An assistant on your site that answers clients day and night.': 'Asystent na stronie, który odpowiada klientom o każdej porze.',
  'BRAND IDENTITY': 'IDENTYFIKACJA WIZUALNA', 'Logo, colours and type that work everywhere.': 'Logo, kolory i fonty, które działają wszędzie.',
  'SOCIAL MEDIA': 'SOCIAL MEDIA', 'Instagram posts, reels and motion ads.': 'Posty na Instagram, rolki i reklamy z animacją.',
  'BUSINESS CARDS': 'WIZYTÓWKI', 'Print-ready cards that match your brand.': 'Wizytówki gotowe do druku, spójne z marką.',
  'BROCHURES': 'BROSZURY', 'Brochures and leaflets designed for print.': 'Broszury i ulotki zaprojektowane do druku.',
  // o mnie
  "I'm a web designer who designs and builds immersive websites and AI chat agents for small businesses.":
    'Jestem web designerem. Projektuję i buduję immersyjne strony oraz czatboty AI dla małych firm.',
  'Every site I ship is designed, written and coded by me, from the first sketch to the live launch.':
    'Każdą stronę sam projektuję, piszę i koduję, od pierwszego szkicu po start.',
  'Before the web, I spent years in athletics and coaching. I bring the same discipline to every project.':
    'Zanim zająłem się stronami, przez lata trenowałem lekkoatletykę i pracowałem jako trener. Tę samą dyscyplinę wnoszę do każdego projektu.',
  [`If you want to work together, ${MAIL}send me an email</a>. I'm always open to new projects.`]:
    `Jeśli chcesz współpracować, ${MAIL}napisz do mnie</a>. Chętnie podejmuję nowe projekty.`,
  // strony projektów
  'I designed and built the website for an industrial cleaning company from Szczecin, and I keep it up to date. I also created its visual system and a motion-graphic ad for Instagram.':
    'Zaprojektowałem i zbudowałem stronę firmy sprzątania przemysłowego ze Szczecina i dbam o jej aktualność. Stworzyłem też jej system wizualny i animowaną reklamę na Instagram.',
  'I designed and built a new website for the Livingroom restaurant: a home page, a menu with allergens, a dish carousel, and Polish and English versions.':
    'Zaprojektowałem i zbudowałem nową stronę restauracji Livingroom: stronę główną, menu z alergenami, karuzelę dań oraz wersję polską i angielską.',
  'A website for a psychologist with session packages, a cart and appointment booking. I designed the full purchase path and set up booking on an embedded Cal.com calendar. The project is still in progress.':
    'Strona psycholożki z pakietami sesji, koszykiem i rezerwacją wizyt. Zaprojektowałem całą ścieżkę zakupu i ustawiłem rezerwacje w osadzonym kalendarzu Cal.com. Projekt jest w trakcie realizacji.',
  'A shooting range and event venue in Racław near Gorzów. I work on its marketing, its growth in Germany and its digital tools. I built AI agent prototypes in Botpress and created promotional films and graphics.':
    'Strzelnica i miejsce eventów w Racławiu pod Gorzowem. Odpowiadam za marketing, rozwój na rynku niemieckim i narzędzia cyfrowe. Zbudowałem prototypy agentów AI w Botpress oraz filmy i grafiki promocyjne.',
  'CLIENT': 'KLIENT', 'SCOPE': 'ZAKRES', 'STACK': 'NARZĘDZIA',
  '// Agata Patelka, psychologist': '// Agata Patelka, psycholożka',
  '// Basko Clean, B2B industrial cleaning': '// Basko Clean, sprzątanie przemysłowe B2B',
  '// KSK Pretor, shooting range and events': '// KSK Pretor, strzelnica i eventy',
  '// Livingroom restaurant, Gorzów Wielkopolski': '// Restauracja Livingroom, Gorzów Wielkopolski',
  '// Design and build': '// Projekt i wdrożenie', '// Design, code, video, social media': '// Projekt, kod, wideo, social media',
  '// Idea, design, build': '// Pomysł, projekt, wdrożenie', '// Strategy, marketing, video, 3D, AI agent': '// Strategia, marketing, wideo, 3D, agent AI',
};

const SEL = '.hero__sub, .works__list span, .services__list b, .services__list span, .story__text p, .panel__desc, .panel__meta dt, .panel__meta dd, [data-glyph]';
const store = { get: () => { try { return localStorage.getItem('lang'); } catch { return null; } }, set: (v) => { try { localStorage.setItem('lang', v); } catch {} } };
let lang = store.get() || 'en';

function apply(base) {
  document.documentElement.lang = lang;
  for (const el of document.querySelectorAll(SEL)) {
    if (el.dataset.en === undefined) el.dataset.en = el.hasAttribute('data-glyph') ? el.textContent.trim() : el.innerHTML.trim();
    const t = lang === 'pl' ? PL[el.dataset.en] ?? el.dataset.en : el.dataset.en;
    if (el.dataset.cur === t) continue; // bez zmiany (np. imię w hero, które żyje też w scenie WebGL)
    el.dataset.cur = t;
    if (el.hasAttribute('data-glyph')) {
      if (el.querySelector('svg')) loadGlyphs(base).then((f) => el.replaceChildren(glyphSVG(f, t.toUpperCase())));
      else el.textContent = t;
    } else el.innerHTML = t;
  }
  for (const b of document.querySelectorAll('.lang button')) b.setAttribute('aria-pressed', b.dataset.l === lang);
}

// Wywołać przed renderGlyphs: ustawia teksty i dokłada przełącznik.
export function initLang(base = '') {
  const nav = document.createElement('div');
  nav.className = 'lang';
  nav.setAttribute('role', 'group');
  nav.setAttribute('aria-label', 'Language');
  nav.innerHTML = '<button type="button" data-l="en">EN</button><span aria-hidden="true">/</span><button type="button" data-l="pl">PL</button>';
  nav.addEventListener('click', (e) => {
    const l = e.target.closest('button')?.dataset.l;
    if (!l || l === lang) return;
    lang = l; store.set(l); apply(base);
  });
  document.body.append(nav);
  apply(base);
}
