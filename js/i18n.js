// Dwie wersje językowe (EN domyślnie, PL). Teksty polskie w słowniku: klucz = tekst angielski z HTML.
// Przełącznik EN / PL w lewym górnym rogu. Wybór zapamiętany w localStorage.
import { loadGlyphs, glyphNodes } from './glyphs.js?v=20261126';

const MAIL = '<a href="mailto:hubert.austria2025@gmail.com">';
const IG = '<a href="https://www.instagram.com/jzf_designe/" target="_blank" rel="noopener">';
const LI = '<a href="https://www.linkedin.com/in/hubert-j%C3%B3zef-skonieczny-50436544a/" target="_blank" rel="noopener">';
const PL = {
  // napisy z glifów (font demo nie ma polskich liter, więc słowa bez ogonków)
  'SELECTED': 'WYBRANE', 'WORKS': 'PRACE', 'SERVICES': 'OFERTA', 'My story': 'O mnie', 'SOCIALS': 'KONTAKT', 'CLOSE': 'ZAMKNIJ',
  // hero
  'A Poland-based web designer building immersive, AI-powered websites <br>for brands that want to be remembered.':
    'Web designer z Polski. Tworzę immersyjne strony z AI <br>dla marek, które chcą zostać zapamiętane.',
  // lista prac
  '// WEBSITE + MOTION': '// STRONA + ANIMACJE', '// RESTAURANT WEBSITE': '// STRONA RESTAURACJI',
  '// BOOKING + PAYMENTS': '// REZERWACJE + PŁATNOŚCI', '// AI AGENT': '// AGENT AI', '// BARBERSHOP WEBSITE': '// STRONA BARBERSHOPU',
  // usługi
  'WEBSITES': 'STRONY INTERNETOWE', 'Design and code, from the first sketch to launch.': 'Projekt i kod, od pierwszego szkicu do startu.',
  'AI CHAT AGENTS': 'AGENCI AI NA STRONĘ', 'An assistant on your site that answers clients day and night.': 'Asystent na stronie, który odpowiada klientom o każdej porze.',
  'BRAND IDENTITY': 'IDENTYFIKACJA WIZUALNA', 'Logo, colours and type that work everywhere.': 'Logo, kolory i fonty, które działają wszędzie.',
  'SOCIAL MEDIA': 'SOCIAL MEDIA', 'Instagram posts, reels and motion ads.': 'Posty na Instagram, rolki i reklamy z animacją.',
  'BUSINESS CARDS': 'WIZYTÓWKI', 'Print-ready cards that match your brand.': 'Wizytówki gotowe do druku, spójne z marką.',
  'BROCHURES': 'BROSZURY', 'Brochures and leaflets designed for print.': 'Broszury i ulotki zaprojektowane do druku.',
  // o mnie (nagłówek z glifów bez polskich liter)
  'WEB DESIGN, 3D WEBSITES, WEBGL, UI/UX, AI AGENTS, AI VIDEO, MOTION ADS, 3D MODELS, POSTERS, BUSINESS CARDS':
    'WEB DESIGN, STRONY 3D, WEBGL, UI/UX, AGENCI AI, WIDEO AI, REKLAMY MOTION, MODELE 3D, PLAKATY, WIZYTOWKI',
  "I'm a <b>web designer, creative developer and AI builder</b>. I design and build <b>immersive websites with 3D and motion</b> for <b>local businesses</b>, and I find the right idea for almost any brand.":
    'Jestem <b>web designerem, creative developerem i twórcą rozwiązań AI</b>. Projektuję i buduję <b>immersyjne strony z 3D i animacją</b> dla <b>lokalnych firm</b> i dla prawie każdej marki znajdę właściwy pomysł.',
  'Right now I work as a <b>freelancer</b> while studying. Besides websites, I create <b>AI chat agents, AI video, 3D models and marketing strategies</b>, as well as posters and business cards.':
    'Obecnie pracuję jako <b>freelancer</b> i studiuję. Poza stronami tworzę <b>agentów AI, wideo AI, modele 3D i strategie marketingowe</b>, a także plakaty i wizytówki.',
  "I've worked with <b>KSK Pretor, Basko Clean and Agata Patelka</b>, and created a concept for <b>Casanova Barbershop</b>. My daily tools: <b>Claude Code, Three.js, WebGL, GSAP, Higgsfield, Botpress, Figma and Penpot</b>.":
    'Współpracowałem z <b>KSK Pretor, Basko Clean i Agatą Patelką</b>, a dla <b>Casanova Barbershop</b> stworzyłem koncept. Na co dzień pracuję w <b>Claude Code, Three.js, WebGL, GSAP, Higgsfield, Botpress, Figmie i Penpocie</b>.',
  'What makes me different: <b>one person from the first sketch to launch</b>. Design, copy, code, AI agent and promo video. You get <b>agency-level 3D and motion on a small-business budget</b>, with one point of contact.':
    'Czym się wyróżniam: <b>jedna osoba od pierwszego szkicu do startu strony</b>. Projekt, teksty, kod, agent AI i film promocyjny. Dostajesz <b>efekty 3D i animacje na poziomie agencji w budżecie małej firmy</b> i jeden kontakt.',
  "What I love most is imagining something that doesn't exist yet and then building it. No fixed templates, just <b>creative problem solving</b> and <b>new AI tools</b> I test every week.":
    'Najbardziej lubię wymyślić coś, czego jeszcze nie ma, a potem to zbudować. Bez sztywnych szablonów: <b>kreatywne rozwiązywanie problemów</b> i <b>nowe narzędzia AI</b>, które testuję co tydzień.',
  'Before the web, I worked as a <b>personal trainer</b>. Powerlifting, skiing, water polo and climbing taught me the discipline I bring to every project.':
    'Zanim zająłem się stronami, pracowałem jako <b>trener personalny</b>. Trójbój, narciarstwo, piłka wodna i wspinaczka nauczyły mnie dyscypliny, którą wnoszę do każdego projektu.',
  [`If you want to work together, <b>send me an email</b> at ${MAIL}hubert.austria2025@gmail.com</a> or find me on ${IG}Instagram</a> and ${LI}LinkedIn</a>.`]:
    `Jeśli chcesz współpracować, <b>napisz do mnie</b> na ${MAIL}hubert.austria2025@gmail.com</a> albo znajdź mnie na ${IG}Instagramie</a> i ${LI}LinkedInie</a>.`,
  // strony projektów
  'I designed and built the website for an industrial cleaning company from Szczecin, and I keep it up to date. I also created its visual system and a motion-graphic ad for Instagram.':
    'Zaprojektowałem i zbudowałem stronę firmy sprzątania przemysłowego ze Szczecina i dbam o jej aktualność. Stworzyłem też jej system wizualny i animowaną reklamę na Instagram.',
  'I designed and built a new website for the Livingroom restaurant: a home page, a menu with allergens, a dish carousel, and Polish and English versions.':
    'Zaprojektowałem i zbudowałem nową stronę restauracji Livingroom: stronę główną, menu z alergenami, karuzelę dań oraz wersję polską i angielską.',
  'A website for a psychologist with session packages, a cart and appointment booking. I designed the full purchase path and set up booking on an embedded Cal.com calendar. The project is still in progress.':
    'Strona psycholożki z pakietami sesji, koszykiem i rezerwacją wizyt. Zaprojektowałem całą ścieżkę zakupu i ustawiłem rezerwacje w osadzonym kalendarzu Cal.com. Projekt jest w trakcie realizacji.',
  'A shooting range and event venue in Racław near Gorzów. I work on its marketing, its growth in Germany and its digital tools. I built AI agent prototypes in Botpress and created promotional films and graphics.':
    'Strzelnica i miejsce eventów w Racławiu pod Gorzowem. Odpowiadam za marketing, rozwój na rynku niemieckim i narzędzia cyfrowe. Zbudowałem prototypy agentów AI w Botpress oraz filmy i grafiki promocyjne.',
  'I designed and built a website concept for Casanova Barbershop in Gorzów Wielkopolski. The site takes visitors from the salon\'s atmosphere straight to Booksy booking and works on phone, tablet and desktop.':
    'Zaprojektowałem i zbudowałem koncept strony dla barbershopu Casanova w Gorzowie Wielkopolskim. Strona prowadzi klienta od klimatu salonu do rezerwacji przez Booksy i działa na telefonie, tablecie i komputerze.',
  '// Concept, design, code': '// Koncept, projekt, kod',
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
      if (el.querySelector('svg')) loadGlyphs(base).then((f) => el.replaceChildren(...glyphNodes(f, t.toUpperCase(), el)));
      else el.textContent = t;
    } else el.innerHTML = t;
  }
  for (const el of document.querySelectorAll('[data-i18n-label]')) {
    el.dataset.enLabel ??= el.getAttribute('aria-label');
    el.setAttribute('aria-label', lang === 'pl' ? PL[el.dataset.enLabel] ?? el.dataset.enLabel : el.dataset.enLabel);
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
