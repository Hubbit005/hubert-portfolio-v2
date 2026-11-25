// Dwie wersje językowe (EN domyślnie, PL). Teksty polskie w słowniku: klucz = tekst angielski z HTML.
// Przełącznik EN / PL w lewym górnym rogu. Wybór zapamiętany w localStorage.
import { loadGlyphs, glyphSVG } from './glyphs.js?v=20261203';

const MAIL = '<a href="mailto:hubert.austria2025@gmail.com">';
const PL = {
  // napisy z glifów (font demo nie ma polskich liter, więc słowa bez ogonków)
  'SELECTED': 'WYBRANE', 'WORKS': 'PRACE', 'SERVICES': 'OFERTA', 'MY STORY': 'O MNIE', 'SOCIALS': 'KONTAKT', 'CLOSE': 'ZAMKNIJ',
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
  // opisy obrazów i wideo na stronie Casanovy (alt / aria-label)
  'Casanova Nº1 Barber perfume bottle on the product page': 'Flakon perfum Casanova Nº1 Barber na stronie produktu',
  'Casanova homepage hero scrolling into the salon picker': 'Hero strony głównej Casanovy przewijane do wyboru salonu',
  'Typography: Bodoni Moda and Inter': 'Typografia: Bodoni Moda i Inter',
  'Casanova perfume collection, three bottles on marble plinths': 'Kolekcja perfum Casanova, trzy flakony na marmurowych postumentach',
  'Fragrance notes for Nº1 Barber': 'Nuty zapachowe Nº1 Barber',
  'Gift voucher: haircut plus Nº1': 'Bon podarunkowy: strzyżenie i Nº1',
  'About page: Barbershop headline, salons and the barbers section': 'Strona O nas: nagłówek Barbershop, salony i sekcja barberów',
  'Casanova Nº2 Noir bottle above its plinth': 'Flakon Casanova Nº2 Noir nad postumentem',
  'Reviews page: layout draft with content placeholders next to the final version': 'Podstrona opinii: szkic układu z miejscami na treść obok wersji finalnej',
  'Barber illustrations used on the services page': 'Ilustracje barberów ze strony usług',
  'Salon picker with ratings and opening hours': 'Wybór salonu z ocenami i godzinami otwarcia',
  'Services page with illustrations appearing on hover': 'Strona usług z ilustracjami, które pojawiają się po najechaniu',
  'Casanova colour palette and wordmark': 'Paleta kolorów i logotyp Casanovy',
  'Hairstyle finder in three steps': 'Dobór fryzury w trzech krokach',
  // opisy obrazów i wideo na stronie Basko Clean
  'Basko Clean homepage hero with the free quote form': 'Hero strony głównej Basko Clean z formularzem darmowej wyceny',
  'Basko Clean promo reel': 'Rolka promocyjna Basko Clean',
  'Services carousel': 'Karuzela usług',
  'Basko Clean mascot logo': 'Logo Basko Clean z maskotką',
  'Instagram highlight icons': 'Ikony wyróżnionych relacji na Instagramie',
  'Before and after slider on the website': 'Suwak przed i po na stronie',
  'Instagram post: roof drain before and after': 'Post na Instagramie: odpływ dachowy przed i po',
  'Instagram highlight stories: services, before/after, quote steps': 'Wyróżnione relacje na Instagramie: usługi, przed/po, kroki wyceny',
  'Animated story: what the client gets': 'Animowana relacja: co dostaje klient',
  'Clients section with the foam mountain': 'Sekcja klientów z górą piany',
  'How we work, step by step': 'Jak pracujemy, krok po kroku',
  'Benefits and key numbers': 'Korzyści i najważniejsze liczby',
  'Mobile version, three screens': 'Wersja mobilna, trzy ekrany',
  'Story: quote in 24 hours': 'Relacja: kosztorys w 24 godziny',  // opisy obrazów i wideo na stronie KSK Pretor
  'KSK Pretor promo film for the German market': 'Film promocyjny KSK Pretor na rynek niemiecki',
  'Reel: how to get a firearms licence in five steps': 'Rolka: jak zdobyć pozwolenie na broń w pięciu krokach',
  'Shooting packages, German and Polish versions': 'Pakiety strzeleckie, wersja niemiecka i polska',
  'KSK Pretor logo': 'Logo KSK Pretor',
  'MG42 history carousel': 'Karuzela o historii MG42',
  'Instructor with a participant on the range': 'Instruktor z uczestnikiem na strzelnicy',
  'Instagram post: first time at a shooting range': 'Post na Instagramie: pierwszy raz na strzelnicy',
  'Four Instagram stories': 'Cztery relacje na Instagramie',
  'Vertical logo outro for reels': 'Pionowe zakończenie z logo do rolek',
  'German market entry plan, selected pages': 'Plan wejścia na rynek niemiecki, wybrane strony',
  'Event hall': 'Sala eventowa',
  'Pistol wall': 'Ściana z pistoletami',
  'Group briefing before shooting': 'Odprawa grupy przed strzelaniem',
  'Story: new week, pick your weapon': 'Relacja: nowy tydzień, wybierz broń',
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
  // opisy obrazów i wideo w panelach: ten sam słownik, tekst angielski zapamiętany w data-en
  for (const el of document.querySelectorAll('.card img, .card video[aria-label]')) {
    const a = el.tagName === 'IMG' ? 'alt' : 'aria-label';
    el.dataset.en ??= el.getAttribute(a);
    el.setAttribute(a, lang === 'pl' ? PL[el.dataset.en] ?? el.dataset.en : el.dataset.en);
  }
  for (const b of document.querySelectorAll('.lang button')) b.setAttribute('aria-pressed', b.dataset.l === lang);
}

// Wywołać przed renderGlyphs: ustawia teksty i dokłada przełącznik.
export function initLang(base = '') {
  const nav = document.createElement('nav'); // punkt orientacyjny: przełącznik nie wisi poza regionami (axe: region)
  nav.className = 'lang';
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
