/* Language switch EN / PL.
   English lives in index.html (it is the default and what search engines and no-JS visitors get).
   Polish lives in the dictionary below. Elements carry data-i18n="key" (their content) and
   data-i18n-attr="attr:key;attr:key" (alt, aria-label, data-cursor). Scripts use i18n.t('key').
   The choice is kept in localStorage; #pl and #en in the address open that language at once.
   Loaded as a classic script at the end of <body>, so Polish is in place before the first paint
   and before the modules (carousel, roulette) read the text. */
(function () {
  'use strict';

  /* ---------- Polish content for elements and attributes (keys from index.html) ---------- */
  var PL = {
    // EN: Skip to content
    "page.1": "Przejdź do treści",
    // EN: Hubert<span class="sr-only">, back to top</span>
    "nav.1": "Hubert<span class=\"sr-only\">, na początek strony</span>",
    // EN: <span class="nav__num">01</span>Work
    "nav-list.1": "Projekty",
    // EN: <span class="nav__num">03</span>AI workflow
    "nav-list.3": "Praca z AI",
    // EN: <span class="nav__num">04</span>About
    "nav-list.4": "O mnie",
    // EN: <span class="nav__num">06</span>Contact
    "nav-list.6": "Kontakt",
    // EN: Spin my work
    "roulette-open.1": "Wylosuj projekt",
    // EN: Spin
    "roulette-spin.1": "Losuj",
    // EN: Back
    "roulette-back.1": "Wróć",
    // EN: You landed on
    "roulette-card.1": "Wylosowany projekt",
    // EN: Open project
    "roulette-go.1": "Otwórz projekt",
    // EN: Spin again
    "roulette-again.1": "Losuj jeszcze raz",
    // EN: I design and build websites and clickable prototypes. I work with AI tools and make the design decisions myself.
    "home.2": "Projektuję i buduję strony internetowe oraz klikalne prototypy. Pracuję z narzędziami AI, a decyzje projektowe podejmuję sam.",
    // EN: View work
    "home.3": "Zobacz projekty",
    // EN: Contact
    "home.4": "Kontakt",
    // EN: Selected work
    "work-title.1": "Wybrane projekty",
    // EN: From a live client website to a 3D model in the browser. Drag the wheel, use the arrow keys, or pick a card to open the case study.
    "work.2": "Strony dla klientów, model 3D i wideo. Przeciągnij koło, użyj strzałek albo wybierz kartę, żeby otworzyć case study.",
    // EN: Website &amp; marketing
    "arc-track.2": "Strona i marketing",
    // EN: Marketing &amp; video
    "arc-track.5": "Marketing i wideo",
    // EN: 3D Model
    "arc-track.7": "Model 3D",
    // EN: Interactive 3D
    "arc-track.8": "Interaktywne 3D",
    // EN: Restaurant
    "arc-track.11": "Restauracja",
    // EN: Book<br>a&nbsp;session
    "arc-track.12": "Umów<br>wizytę",
    // EN: In progress
    "arc-track.13": "W budowie",
    // EN: Website for Agata Patelka
    "arc-track.15": "Strona dla Agaty Patelki",
    // EN: Psychologist
    "arc-track.16": "Psycholożka",
    // EN: Training plans
    "arc-track.18": "Plany treningowe",
    // EN: A page per client
    "arc-track.19": "Strona dla każdego klienta",
    // EN: <span class="mono">04</span> Website for Agata Patelka
    "cases.5": "Strona dla Agaty Patelki",
    // EN: <span class="mono">05</span> Smaller projects
    "cases.6": "Mniejsze projekty",
    // EN: <span class="mono">06</span> This portfolio
    "cases.7": "To portfolio",
    // EN: What I did in each project
    "chart.1": "Co robiłem w każdym projekcie",
    // EN: Design
    "chart.2": "Projekt",
    // EN: Code
    "chart.3": "Kod",
    // EN: Video
    "chart.4": "Wideo",
    // EN: Marketing
    "chart.5": "Marketing",
    // EN: 3D
    "chart.6": "3D",
    // EN: AI agent
    "chart.7": "Agent AI",
    // EN: Yes
    "chart.8": "Tak",
    // EN: No
    "chart.9": "Nie",
    // EN: Website, visual system and a motion ad for an industrial cleaning company from Szczecin.
    "basko-clean.2": "Strona, system wizualny i reklama motion dla firmy ze Szczecina, która zajmuje się czyszczeniem przemysłowym.",
    // EN: Client
    "basko-clean.3": "Klient",
    // EN: Basko Clean, B2B industrial cleaning
    "basko-clean.4": "Basko Clean, czyszczenie przemysłowe B2B",
    // EN: Role
    "basko-clean.5": "Rola",
    // EN: Design, code, video, social media
    "basko-clean.6": "Projekt, kod, wideo, social media",
    // EN: Live website, maintained by me
    "basko-clean.8": "Strona działa, utrzymuję ją",
    // EN: What I did
    "basko-clean.9": "Co zrobiłem",
    // EN: I designed and built the company website, and I keep it up to date.
    "basko-clean.10": "Zaprojektowałem i zbudowałem stronę firmy. Na bieżąco ją aktualizuję.",
    // EN: I created a visual system for marketing: colours, a vectorised logo with the cleaner figure, light and dark profile pictures, ready-to-use materials.
    "basko-clean.11": "Stworzyłem system wizualny do marketingu: kolory, zwektoryzowane logo z postacią sprzątacza, zdjęcia profilowe w wersji jasnej i ciemnej, gotowe materiały.",
    // EN: I made a motion-graphic ad for Instagram: flat 2D, kinetic type, the cleaner figure as the hero.
    "basko-clean.12": "Zrobiłem reklamę w stylu motion graphic na Instagram: płaska grafika 2D, kinetyczna typografia, w roli głównej postać sprzątacza.",
    // EN: I film on job sites and edit the reels for Instagram, LinkedIn and TikTok.
    "basko-clean.13": "Nagrywam materiał na realizacjach i montuję z niego rolki na Instagram, LinkedIn i TikTok.",
    // EN: Basko Clean · live site
    "basko-clean.14": "Basko Clean · działająca strona",
    // EN: Home page. The quote form is visible without scrolling.
    "basko-clean.15": "Strona główna. Formularz wyceny widać bez przewijania.",
    // EN: Before-and-after slider
    "basko-clean.16": "Suwak przed i po",
    // EN: Benefits and closing call to action
    "basko-clean.17": "Korzyści i końcowe wezwanie do działania",
    // EN: A shooting range and event venue in Racław near Gorzów. I work on its marketing, its growth in Germany and its digital tools.
    "ksk-pretor.2": "Strzelnica i obiekt eventowy w Racławiu pod Gorzowem. Zajmuję się jej marketingiem, wejściem na rynek niemiecki i narzędziami cyfrowymi.",
    // EN: KSK Pretor, shooting range and events
    "ksk-pretor.3": "KSK Pretor, strzelnica i eventy",
    // EN: Strategy, marketing, video, 3D, AI agent
    "ksk-pretor.4": "Strategia, marketing, wideo, 3D, agent AI",
    // EN: I prepared a marketing plan for growing the business in the German market.
    "ksk-pretor.5": "Przygotowałem plan marketingowy rozwoju firmy na rynku niemieckim.",
    // EN: I brought an event agency to the range.
    "ksk-pretor.6": "Przyciągnąłem do strzelnicy agencję eventową.",
    // EN: I ran the range&#8217;s social media for a period.
    "ksk-pretor.7": "Przez pewien czas prowadziłem social media strzelnicy.",
    // EN: I built AI agent prototypes in Botpress.
    "ksk-pretor.8": "Zbudowałem prototypy agenta AI w Botpressie.",
    // EN: I created promotional films and graphics.
    "ksk-pretor.9": "Stworzyłem filmy reklamowe i grafiki promocyjne.",
    // EN: KSK Pretor · 3D model
    "ksk-3d-model.1": "KSK Pretor · model 3D",
    // EN: Interactive 3D model of an AK-47
    "ksk-3d-title.1": "Interaktywny model 3D karabinka AK-47",
    // EN: I built it in code from simple shapes in three.js, with no ready-made models. Visitors rotate it, take it apart step by step and export a photo for Instagram. Live version: <a href="https://hubbit005.github.io/ksk-ak47-3d/" rel="noopener" target="_blank">hubbit005.github.io/ksk-ak47-3d<span class="sr-only"> (opens in a new tab)</span></a>.
    "ksk-3d-model.2": "Zbudowałem go w kodzie z prostych brył w three.js, bez gotowych modeli. Można go obracać, rozkładać krok po kroku i wyeksportować z niego zdjęcie na Instagram. Wersja na żywo: <a href=\"https://hubbit005.github.io/ksk-ak47-3d/\" rel=\"noopener\" target=\"_blank\">hubbit005.github.io/ksk-ak47-3d<span class=\"sr-only\"> (otwiera się w nowej karcie)</span></a>.",
    // EN: Load the 3D model
    "model-load.1": "Załaduj model 3D",
    // EN: Open full screen
    "model-embed.1": "Otwórz na pełnym ekranie",
    // EN:  (opens in a new tab)
    "model-embed.2": " (otwiera się w nowej karcie)",
    // EN: Part highlighted
    "ksk-3d-model.3": "Podświetlona część",
    // EN: Step 5 of 5, disassembled
    "ksk-3d-model.4": "Krok 5 z 5, model rozłożony",
    // EN: Photo mode, 1080×1350
    "ksk-3d-model.5": "Tryb zdjęcia, 1080×1350",
    // EN: Phone, reduced quality
    "ksk-3d-model.6": "Telefon, niższa jakość renderu",
    // EN: KSK Pretor · Video
    "ksk-video.1": "KSK Pretor · wideo",
    // EN: Promo film
    "ksk-video-title.1": "Film promocyjny",
    // EN: I created a 35-second promo film that shows every side of the range: the lanes, the weapons, the instructors and the offer.
    "ksk-video.2": "Stworzyłem 35-sekundowy film promocyjny, który pokazuje wszystkie strony strzelnicy: stanowiska, broń, instruktorów i ofertę.",
    // EN: Promo film in German, 35 seconds, 16:9.
    "ksk-film-desc.1": "Film promocyjny po niemiecku, 35 sekund, 16:9.",
    // EN: I designed and built a new website for the restaurant.
    "livingroom.2": "Zaprojektowałem i zbudowałem nową stronę restauracji.",
    // EN: Livingroom restaurant, Gorzów Wielkopolski
    "livingroom.3": "Restauracja Livingroom, Gorzów Wielkopolski",
    // EN: Idea, design, build
    "livingroom.4": "Pomysł, projekt, wykonanie",
    // EN: I designed and built the site: home page, menu with allergens, dish carousel, Polish and English versions.
    "livingroom.5": "Zaprojektowałem i zbudowałem całą stronę: stronę główną, menu z alergenami, karuzelę dań oraz wersję polską i angielską.",
    // EN: Home page
    "livingroom.6": "Strona główna",
    // EN: Menu categories
    "livingroom.7": "Kategorie menu",
    // EN: Dish list with allergens
    "livingroom.8": "Lista dań z alergenami",
    // EN: Dish carousel
    "livingroom.9": "Karuzela dań",
    // EN: A website for a psychologist with session packages, a cart and appointment booking. Client project in progress; the copy is still a draft.
    "psychologist-site.2": "Strona psycholożki z pakietami sesji, koszykiem i rezerwacją terminów. Projekt jest w budowie, a teksty są robocze.",
    // EN: Agata Patelka, psychologist
    "psychologist-site.3": "Agata Patelka, psycholożka",
    // EN: Design and build
    "psychologist-site.4": "Projekt i wykonanie",
    // EN: I designed the full purchase path: package, cart, payment step, thank-you page. It can be clicked through before the payment gateway is connected.
    "psychologist-site.5": "Zaprojektowałem całą ścieżkę zakupu: wybór pakietu, koszyk, płatność i stronę z podziękowaniem. Można ją przeklikać jeszcze przed podłączeniem bramki płatności.",
    // EN: I set up booking on an embedded Cal.com calendar, so the client manages her own time slots.
    "psychologist-site.6": "Rezerwację oparłem na osadzonym kalendarzu Cal.com, więc klientka sama zarządza terminami.",
    // EN: I am building the site in Claude Code with Astro and Tailwind.
    "psychologist-site.7": "Buduję stronę w Claude Code przy pomocy Astro i Tailwind.",
    // EN: Purchase path, clickable end to end before the gateway exists
    "psy-flow-title.1": "Ścieżka zakupu do przeklikania od początku do końca, jeszcze przed podłączeniem bramki płatności",
    // EN: Choose a package
    "psychologist-site.9": "Wybór pakietu",
    // EN: Cart
    "psychologist-site.11": "Koszyk",
    // EN: Payment <em class="mono">mock</em>
    "psychologist-site.13": "Płatność <em class=\"mono\">makieta</em>",
    // EN: Stripe later. Payment method badges built, switched off.
    "psychologist-site.14": "Stripe podłączę w kolejnym etapie. Plakietki metod płatności są gotowe, ale do tego czasu wyłączone.",
    // EN: Thank you
    "psychologist-site.16": "Podziękowanie",
    // EN: Book a time
    "psychologist-site.18": "Rezerwacja terminu",
    // EN: Embedded Cal.com. The client manages her own slots.
    "psychologist-site.19": "Osadzony Cal.com. Klientka sama zarządza terminami.",
    // EN: Smaller projects
    "smaller-title.1": "Mniejsze projekty",
    // EN: Training plans for clients.
    "smaller-projects.2": "Plany treningowe dla klientów.",
    // EN: 05 · Client work, anonymised
    "training-plans.1": "Projekty dla klientów, zanonimizowane",
    // EN: Training plans as web pages
    "training-title.1": "Plany treningowe w formie stron internetowych",
    // EN: I build web pages for clients&#8217; personal 8-week training plans, all from one template I designed.
    "training-plans.2": "Buduję strony z osobistymi 8-tygodniowymi planami treningowymi dla klientów. Wszystkie powstają z jednego szablonu, który zaprojektowałem.",
    // EN: Plan variants, progress tracking and day-by-day workouts.
    "training-plans.3": "Warianty planu, śledzenie postępów i treningi rozpisane na dni.",
    // EN: A calendar where the client picks the date of each workout.
    "training-plans.4": "Kalendarz, w którym klient wybiera datę każdego treningu.",
    // EN: Names and body data hidden in the screenshots.
    "training-plans.5": "Na zrzutach ukryłem imiona i pomiary klientów.",
    // EN: Plan overview
    "training-plans.6": "Przegląd planu",
    // EN: Workout day with calendar
    "training-plans.7": "Dzień treningowy z kalendarzem",
    // EN: How I work with AI
    "ai-title.1": "Jak pracuję z AI",
    // EN: I use AI tools in every project, mostly to research and build faster. Below: my steps and the tools.
    "ai.1": "Używam narzędzi AI w każdym projekcie, żeby szybciej zbierać informacje i budować.",
    // EN: Start on site
    "ai.2": "Start u klienta",
    // EN: At the client's job site, or as a guest in the restaurant.
    "ai.3": "Zaczynam tam, gdzie pracuje klient: na realizacji albo jako gość w restauracji.",
    // EN: Perplexity for sources, Gemini for comparisons, ChatGPT for structuring strategy, Manifold for marketing and social data.
    "ai.6": "Używam Perplexity do źródeł, Gemini do porównań, ChatGPT do porządkowania strategii, a Manifold do danych marketingowych i z social mediów.",
    // EN: Flow and states
    "ai.8": "Ścieżka i stany",
    // EN: I list the steps and the states before the build. Example: my brief for this portfolio.
    "ai.9": "Zanim zacznę budować, spisuję kroki i stany. Przykład: mój brief do tego portfolio.",
    // EN: Build
    "ai.11": "Wykonanie",
    // EN: Claude Code turns the list into a working page or prototype. Animations in GSAP and HyperFrames, rendered to MP4 with Playwright. 3D in three.js.
    "ai.12": "Na podstawie tej listy buduję stronę albo prototyp w Claude Code. Animacje robię w GSAP i HyperFrames i renderuję je do MP4 w Playwright, a 3D buduję w three.js.",
    // EN: Visuals
    "ai.14": "Grafika",
    // EN: Higgsfield and Leonardo AI for images and video, Canva for posts and materials.
    "ai.15": "Obrazy i wideo generuję w Higgsfield i Leonardo AI, a posty i materiały robię w Canvie.",
    // EN: Review
    "ai.17": "Kontrola",
    // EN: Before anything goes to the client, I check it against the brief and the brand.
    "ai.18": "Zanim cokolwiek trafi do klienta, sprawdzam, czy zgadza się z briefem i z marką.",
    // EN: Where AI speeds me up
    "ai.20": "Gdzie AI mnie przyspiesza",
    // EN: Code for pages, prototypes and animations.
    "ai.21": "Kod stron, prototypów i animacji.",
    // EN: Market and competitor data with sources.
    "ai.22": "Dane o rynku i konkurencji ze źródłami.",
    // EN: Drafts of long documents and their structure.
    "ai.23": "Szkice i struktura długich dokumentów.",
    // EN: Image and video variants to compare.
    "ai.24": "Warianty obrazów i wideo do porównania.",
    // EN: Dictation instead of typing.
    "ai.25": "Dyktowanie zamiast pisania.",
    // EN: What I decide
    "ai.26": "O czym decyduję",
    // EN: What the problem is and who the user is.
    "ai.27": "Jaki jest problem i kto jest użytkownikiem.",
    // EN: Which states and edge cases the product must handle.
    "ai.28": "Jakie stany i przypadki brzegowe produkt musi obsłużyć.",
    // EN: Whether a visual fits the brand. Basko's realistic 3D ad did not, so I dropped it.
    "ai.29": "Czy grafika pasuje do marki. Realistyczna reklama 3D dla Basko nie pasowała, więc ją odrzuciłem.",
    // EN: What a client's material may show: no client logos without consent, no personal data.
    "ai.30": "Co mogą pokazywać materiały klienta: logo jego klientów tylko za zgodą, żadnych danych osobowych.",
    // EN: Whether the result is ready for the client.
    "ai.31": "Czy wynik jest gotowy dla klienta.",
    // EN: Tools I use and what I made with them
    "ai.38": "Narzędzia, których używam",
    // EN: This portfolio
    "meta-title.1": "To portfolio",
    // EN: I designed and built this site from the ground up: the layout, the motion, the interactive 3D lettering with the roulette, and two language versions. I built it in Claude Code.
    "this-portfolio.2": "Zaprojektowałem i zbudowałem tę stronę od podstaw w Claude Code: układ, ruch, interaktywny napis 3D z ruletką i dwie wersje językowe.",
    // EN: About
    "about-title.1": "O mnie",
    // EN: I design and build websites and prototypes for companies, and I make their marketing and visual content: video, graphics, motion.
    "about.1": "Projektuję i buduję strony oraz prototypy dla firm, a do tego tworzę ich treści marketingowe i wizualne: wideo, grafiki, animacje.",
    // EN: The most satisfying part of my work is building something that works and looks good. I follow new AI tools closely and want to get much better at using them in design work.
    "about.2": "Najwięcej satysfakcji daje mi zbudowanie czegoś, co działa i dobrze wygląda. Na bieżąco śledzę nowe narzędzia AI i chcę coraz lepiej wykorzystywać je w projektowaniu.",
    // EN: I am looking for a team I can stay with for the long term and grow in. I am ready to put in long hours on work that shows results.
    "about.3": "Szukam zespołu, z którym zostanę na dłużej i w którym będę się rozwijać. Jestem gotów pracować bardzo dużo, jeśli praca daje efekt.",
    // EN: Background
    "about.4": "Doświadczenie",
    // EN: <span class="mono">Now</span>Freelance web design, marketing and visual content for companies
    "about.5": "<span class=\"mono\">Teraz</span>Freelance: projektowanie stron, marketing i treści wizualne dla firm",
    // EN: <span class="mono">Clients</span>Direct work with company owners, including filming on site
    "about.6": "<span class=\"mono\">Klienci</span>Bezpośrednia praca z właścicielami firm, także nagrania na miejscu",
    // EN: <span class="mono">Before</span>Certified personal trainer. One-to-one work with people, a plan adapted to each person
    "about.7": "<span class=\"mono\">Wcześniej</span>Trener personalny z certyfikatem. Praca jeden na jeden, plan dopasowany do każdej osoby",
    // EN: <span class="mono">Base</span>Near Gorzów Wielkopolski, Poland. Working remotely
    "about.8": "<span class=\"mono\">Region</span>Okolice Gorzowa Wielkopolskiego. Pracuję zdalnie",
    // EN: Experience
    "cv.3": "Doświadczenie",
    // EN: Freelance · <span class="pending-inline">dates pending</span>
    "cv.4": "Freelance",
    // EN: Web designer, marketing and visual content
    "cv.5": "Web designer, marketing i treści wizualne",
    // EN: <b>Basko Clean:</b> website design and code, motion-graphic ad, social media on three platforms, profile identity.
    "cv.6": "<b>Basko Clean:</b> projekt i kod strony, reklama motion graphic, social media na trzech platformach, identyfikacja profili.",
    // EN: <b>KSK Pretor:</b> German market entry plan (18 chapters, 59-page owner version), interactive 3D model, AI agent prototype, promo film, video branding in PL and DE.
    "cv.7": "<b>KSK Pretor:</b> plan marketingowy na rynek niemiecki, pozyskanie agencji eventowej, social media, prototypy agenta AI, interaktywny model 3D, film promocyjny.",
    // EN: <b>Livingroom:</b> new restaurant website, designed and built.
    "cv.8": "<b>Livingroom:</b> nowa strona restauracji, zaprojektowana i zbudowana.",
    // EN: <b>Psychologist website:</b> full purchase path (Astro, Tailwind, Cal.com).
    "cv.9": "<b>Strona psycholożki:</b> pełna ścieżka zakupu (Astro, Tailwind, Cal.com).",
    // EN: <b>Training plans:</b> personal plan pages from one template.
    "cv.10": "<b>Plany treningowe:</b> indywidualne strony z planami, wszystkie z jednego szablonu.",
    // EN: Earlier · <span class="pending-inline">dates pending</span>
    "cv.11": "Wcześniej",
    // EN: Personal trainer (certified)
    "cv.12": "Trener personalny (z certyfikatem)",
    // EN: One-to-one work with people.
    "cv.13": "Praca z ludźmi jeden na jeden.",
    // EN: Skills
    "cv.14": "Umiejętności",
    // EN: User flows, states and edge cases, personas, customer journeys, drop-off analysis
    "cv.16": "Ścieżki użytkownika, stany i przypadki brzegowe, persony, customer journey, analiza miejsc, w których klient odpada",
    // EN: Hierarchy, spacing, typography, motion, light and dark themes
    "cv.18": "Hierarchia, odstępy, typografia, ruch",
    // EN: HTML, CSS, JavaScript, React, Astro, Tailwind, three.js, GSAP (built with Claude Code)
    "cv.20": "HTML, CSS, JavaScript, React, Astro, Tailwind, three.js, GSAP (buduję w Claude Code)",
    // EN: Visual
    "cv.21": "Grafika i wideo",
    // EN: Video editing, motion graphics, graphics, social content
    "cv.22": "Montaż wideo, motion graphics, grafika, treści do social mediów",
    // EN: AI tools
    "cv.23": "Narzędzia AI",
    // EN: Languages
    "cv.25": "Języki",
    // EN: Polish (native). English: <span class="pending-inline">level pending</span>
    "cv.26": "Polski (ojczysty), angielski",
    // EN: The fastest way to reach me is e-mail.
    "contact.1": "Napisz albo zadzwoń.",
    // EN: Copy e-mail
    "copy-mail.1": "Kopiuj adres",
    // EN: Back to top ↑
    "contact.13": "Na górę ↑",
    // EN: Sections
    "a-nav.1": "Sekcje",
    // EN: Project roulette
    "a-roulette.1": "Ruletka projektów",
    // EN: Projects
    "a-arc-viewport.1": "Projekty",
    // EN: Open
    "a-arc-track.1": "Otwórz",
    // EN: Previous project
    "a-arc-prev.1": "Poprzedni projekt",
    // EN: Next project
    "a-arc-next.1": "Następny projekt",
    // EN: Basko Clean home page: headline about professional B2B cleaning, a free quote form with service, phone and postcode fields, and two cards linking to the process and the offer.
    "a-basko-clean.1": "Strona główna Basko Clean: nagłówek o profesjonalnym czyszczeniu B2B, formularz bezpłatnej wyceny z polami usługi, telefonu i kodu pocztowego oraz dwie karty z linkami do procesu i oferty.",
    // EN: A before-and-after slider showing a roof drain covered in dirt on the left and clean on the right, with three cards about experience, price and availability below.
    "a-basko-clean.2": "Suwak przed i po: rynna dachowa zarośnięta brudem po lewej i czysta po prawej, pod spodem trzy karty o doświadczeniu, cenie i dostępności.",
    // EN: Four benefit cards with icons, a row of key figures, and a closing call to action to order a free quote.
    "a-basko-clean.3": "Cztery karty korzyści z ikonami, rząd kluczowych liczb i końcowe wezwanie do zamówienia bezpłatnej wyceny.",
    // EN: The 3D model of the rifle on a dark stage with a red glow, the KSK Pretor label in the corner and a control panel with buttons to disassemble, assemble and enter photo mode.
    "a-model-embed.1": "Model 3D karabinka na ciemnej scenie z czerwoną poświatą, napis KSK Pretor w rogu i panel z przyciskami do rozkładania, składania i trybu zdjęcia.",
    // EN: Magazine highlighted in red with a tooltip showing its name and a short description.
    "a-ksk-3d-model.1": "Magazynek podświetlony na czerwono z dymkiem, który podaje nazwę części i krótki opis.",
    // EN: The rifle taken apart: magazine, receiver cover, recoil spring, carrier with bolt and gas tube floating apart with numbered labels.
    "a-ksk-3d-model.2": "Rozłożony karabinek: magazynek, pokrywa komory zamkowej, sprężyna powrotna, suwadło z zamkiem i rura gazowa rozsunięte z numerowanymi podpisami.",
    // EN: Photo mode with a portrait crop frame, preset shot buttons on top and format and export buttons at the bottom.
    "a-ksk-3d-model.3": "Tryb zdjęcia z pionową ramką kadru, przyciskami gotowych ujęć u góry oraz wyborem formatu i eksportem na dole.",
    // EN: The model on a phone screen with touch hints and the control panel at the bottom.
    "a-ksk-3d-model.4": "Model na ekranie telefonu z podpowiedziami gestów i panelem sterowania na dole.",
    // EN: Film frame: 45+ Waffen, 14 Kaliber, with a rifle silhouette.
    "a-ksk-video.1": "Klatka z filmu: 45+ Waffen, 14 Kaliber, z sylwetką karabinu.",
    // EN: Film frame: Bahnen bis 100 m with an aerial photo of the range.
    "a-ksk-video.2": "Klatka z filmu: Bahnen bis 100 m ze zdjęciem strzelnicy z lotu ptaka.",
    // EN: Film frame: a price comparison bar chart in red and grey.
    "a-ksk-video.3": "Klatka z filmu: wykres słupkowy z porównaniem cen w czerwieni i szarości.",
    // EN: Film frame: one instructor with every shooter, with a photo of an instructor at the range.
    "a-ksk-video.4": "Klatka z filmu: jeden instruktor przy każdym strzelcu, ze zdjęciem instruktora na strzelnicy.",
    // EN: Livingroom home page on a black background: italic serif headline welcoming guests, an illustrated arched storefront with warm lit windows, and two gold-outlined buttons to book a table and see the menu.
    "a-livingroom.1": "Strona główna Livingroom na czarnym tle: nagłówek pisany kursywą szeryfową, który wita gości, ilustracja witryny z łukami i ciepło oświetlonymi oknami oraz dwa złote przyciski do rezerwacji stolika i menu.",
    // EN: Menu page with six large serif categories, each numbered, offset in a staggered layout.
    "a-livingroom.2": "Strona menu z sześcioma dużymi, numerowanymi kategoriami w kroju szeryfowym, ułożonymi schodkowo.",
    // EN: Burger section of the menu with dish names, ingredients, allergens and prices in gold.
    "a-livingroom.3": "Sekcja burgerów w menu z nazwami dań, składnikami, alergenami i cenami w złocie.",
    // EN: An illustrated burger in the centre of a dish carousel with a drink and a steak on the sides and arrow buttons below.
    "a-livingroom.4": "Ilustrowany burger w środku karuzeli dań, po bokach napój i stek, pod spodem przyciski ze strzałkami.",
    // EN: Training plan on a phone: client shown as Client A, goal, level, 8-week duration, a progress ring and day cards for the first workouts.
    "a-training-plans.1": "Plan treningowy na telefonie: klient jako Client A, cel, poziom, czas trwania 8 tygodni, pierścień postępu i karty pierwszych treningów.",
    // EN: A workout day on a phone: a monthly calendar where the client picks the training date before the exercises appear.
    "a-training-plans.2": "Dzień treningowy na telefonie: kalendarz miesięczny, w którym klient wybiera datę treningu, zanim pojawią się ćwiczenia.",
  };

  /* ---------- Strings used by scripts ---------- */
  var STR = {
    en: {
      'meta.title': 'Hubert · Junior UX/UI Designer, AI-native · Portfolio',
      'meta.description': 'Hubert, Junior UX/UI Designer working with AI tools every day. Client websites, a visual system and motion ad, an interactive 3D model and promotional video.',
      'lang.group': 'Language',
      'theme.toDark': 'Switch to dark theme',
      'theme.toLight': 'Switch to light theme',
      'copy.ok': 'Copied to clipboard',
      'copy.fail': 'Copy failed. Select the address above.',
      'motion.pause': 'Pause motion',
      'motion.play': 'Play motion',
      'jar.shake': 'Shake',
      'jar.shakeLabel': 'Shake the tools jar',
      'letters.reset': 'Reset',
      'demo.label': 'Demo · sample data',
      'demo.kicker': 'Sample plan',
      'demo.client': 'Client A',
      'demo.goal': 'Goal: strength and mobility',
      'demo.level': 'Level', 'demo.levelV': 'Beginner',
      'demo.dur': 'Duration', 'demo.durV': '8 weeks',
      'demo.ofPlan': 'of plan',
      'demo.workouts': 'Workouts done',
      'demo.exercises': 'Exercises done',
      'demo.day': 'Day {n}',
      'demo.d1': 'Lower body', 'demo.d2': 'Upper body', 'demo.d3': 'Full body',
      'demo.count': '{n} exercises',
      'demo.doneBadge': 'done',
      'demo.back': 'Back',
      'demo.pick': 'Pick the workout date first',
      'demo.pickHint': 'The exercises appear after you pick a day.',
      'demo.prev': 'Previous month', 'demo.next': 'Next month',
      'demo.dayDone': 'Workout done. The day is marked on the plan.',
      'demo.toPlan': 'Back to plan',
      'demo.squat': 'Squat', 'demo.lunge': 'Lunges', 'demo.bridge': 'Glute bridge', 'demo.plank': 'Plank',
      'demo.pushup': 'Push-ups', 'demo.row': 'Dumbbell row', 'demo.press': 'Shoulder press',
      'jar.claude': 'I build the page or prototype in Claude Code.',
      'jar.chatgpt': 'ChatGPT to structure strategy.',
      'jar.gemini': 'Gemini for comparisons.',
      'jar.perplexity': 'Perplexity for sources.',
      'jar.visuals': 'I generate images and video in Higgsfield and Leonardo AI.',
      'jar.manifold': 'Manifold for marketing and social data.',
      'jar.botpress': 'I built AI agent prototypes in Botpress.',
      'jar.canva': 'I make posts and materials in Canva.',
      'jar.wispr': 'Dictation instead of typing.',
      'jar.motion': 'I make animations in GSAP and HyperFrames.',
      'jar.playwright': 'I render animations to MP4 with Playwright.',
      'jar.three': 'I build 3D in three.js.',
      'model.title': 'Interactive 3D model of an AK-47 for KSK Pretor. Drag to rotate. Keys: S trigger, Z charging handle, P selector.',
      'roulette.hintWheel': 'Drag the wheel or press Spin',
      'roulette.hintRandom': 'A random pick from my projects',
      'roulette.opened': 'Project roulette. Press Spin or drag the wheel. Escape goes back.',
      'roulette.spinning': 'Spinning',
      'roulette.result': 'Result: {name}. {cat}.',
      'roulette.typeCover': 'Book<br>a&nbsp;session',
      'p.basko.name': 'Basko Clean', 'p.basko.label': 'BASKO CLEAN', 'p.basko.cat': 'Website & marketing',
      'p.ksk.name': 'KSK Pretor', 'p.ksk.label': 'KSK PRETOR', 'p.ksk.cat': 'Marketing & video',
      'p.ak.name': '3D Model', 'p.ak.label': '3D MODEL', 'p.ak.cat': 'Interactive 3D',
      'p.living.name': 'Livingroom', 'p.living.label': 'LIVINGROOM', 'p.living.cat': 'Restaurant',
      'p.psy.name': 'Agata Patelka', 'p.psy.label': 'AGATA PATELKA', 'p.psy.cat': 'Psychologist · in progress',
      'p.training.name': 'Training plans', 'p.training.label': 'TRAINING PLANS', 'p.training.cat': 'A page per client',
    },
    pl: {
      'meta.title': 'Hubert · Junior UX/UI Designer, AI-native · Portfolio',
      'meta.description': 'Hubert, Junior UX/UI Designer, który na co dzień pracuje z narzędziami AI. Strony klientów, system wizualny i reklama motion, interaktywny model 3D i filmy promocyjne.',
      'lang.group': 'Język',
      'theme.toDark': 'Włącz ciemny motyw',
      'theme.toLight': 'Włącz jasny motyw',
      'copy.ok': 'Skopiowano do schowka',
      'copy.fail': 'Nie udało się skopiować. Zaznacz adres powyżej.',
      'motion.pause': 'Zatrzymaj ruch',
      'motion.play': 'Wznów ruch',
      'jar.shake': 'Potrząśnij',
      'jar.shakeLabel': 'Potrząśnij słoikiem z narzędziami',
      'letters.reset': 'Ułóż',
      'demo.label': 'Demo · dane przykładowe',
      'demo.kicker': 'Przykładowy plan',
      'demo.client': 'Klient A',
      'demo.goal': 'Cel: siła i mobilność',
      'demo.level': 'Poziom', 'demo.levelV': 'Początkujący',
      'demo.dur': 'Czas trwania', 'demo.durV': '8 tygodni',
      'demo.ofPlan': 'planu',
      'demo.workouts': 'Wykonane treningi',
      'demo.exercises': 'Wykonane ćwiczenia',
      'demo.day': 'Dzień {n}',
      'demo.d1': 'Dół ciała', 'demo.d2': 'Góra ciała', 'demo.d3': 'Całe ciało',
      'demo.count': '{n} ćwiczenia',
      'demo.doneBadge': 'zrobione',
      'demo.back': 'Wróć',
      'demo.pick': 'Najpierw wybierz datę treningu',
      'demo.pickHint': 'Ćwiczenia pojawią się po wybraniu dnia.',
      'demo.prev': 'Poprzedni miesiąc', 'demo.next': 'Następny miesiąc',
      'demo.dayDone': 'Trening zrobiony. Dzień jest zaznaczony w planie.',
      'demo.toPlan': 'Wróć do planu',
      'demo.squat': 'Przysiad', 'demo.lunge': 'Wykroki', 'demo.bridge': 'Unoszenie bioder', 'demo.plank': 'Deska',
      'demo.pushup': 'Pompki', 'demo.row': 'Wiosłowanie hantlem', 'demo.press': 'Wyciskanie nad głowę',
      'jar.claude': 'Buduję stronę albo prototyp w Claude Code.',
      'jar.chatgpt': 'ChatGPT do porządkowania strategii.',
      'jar.gemini': 'Gemini do porównań.',
      'jar.perplexity': 'Perplexity do źródeł.',
      'jar.visuals': 'Obrazy i wideo generuję w Higgsfield i Leonardo AI.',
      'jar.manifold': 'Manifold do danych marketingowych i z social mediów.',
      'jar.botpress': 'Zbudowałem prototypy agenta AI w Botpressie.',
      'jar.canva': 'Posty i materiały robię w Canvie.',
      'jar.wispr': 'Dyktowanie zamiast pisania.',
      'jar.motion': 'Animacje robię w GSAP i HyperFrames.',
      'jar.playwright': 'Animacje renderuję do MP4 w Playwright.',
      'jar.three': '3D buduję w three.js.',
      'model.title': 'Interaktywny model 3D karabinka AK-47 dla KSK Pretor. Przeciągnij, żeby obrócić. Klawisze: S spust, Z rączka zamka, P przełącznik trybów.',
      'roulette.hintWheel': 'Zakręć kołem albo naciśnij „Losuj”',
      'roulette.hintRandom': 'Losowy projekt z mojego portfolio',
      'roulette.opened': 'Ruletka projektów. Naciśnij „Losuj” albo zakręć kołem. Escape wraca.',
      'roulette.spinning': 'Koło się kręci',
      'roulette.result': 'Wynik: {name}. {cat}.',
      'roulette.typeCover': 'Umów<br>wizytę',
      'p.basko.name': 'Basko Clean', 'p.basko.label': 'BASKO CLEAN', 'p.basko.cat': 'Strona i marketing',
      'p.ksk.name': 'KSK Pretor', 'p.ksk.label': 'KSK PRETOR', 'p.ksk.cat': 'Marketing i wideo',
      'p.ak.name': 'Model 3D', 'p.ak.label': 'MODEL 3D', 'p.ak.cat': 'Interaktywne 3D',
      'p.living.name': 'Livingroom', 'p.living.label': 'LIVINGROOM', 'p.living.cat': 'Restauracja',
      'p.psy.name': 'Agata Patelka', 'p.psy.label': 'AGATA PATELKA', 'p.psy.cat': 'Psycholożka · w budowie',
      'p.training.name': 'Plany treningowe', 'p.training.label': 'PLANY TRENINGOWE', 'p.training.cat': 'Strona dla każdego klienta',
    },
  };

  var LANGS = ['en', 'pl'];
  var EN = {};            // English content, read from the HTML on first run
  var current = 'en';
  var doc = document.documentElement;

  function t(key, vars) {
    var s = (STR[current] && STR[current][key]) || STR.en[key] || key;
    if (vars) s = s.replace(/\{(\w+)\}/g, function (m, k) { return vars[k] != null ? vars[k] : m; });
    return s;
  }

  function parseAttr(spec) {
    return spec.split(';').map(function (p) { var i = p.indexOf(':'); return [p.slice(0, i), p.slice(i + 1)]; });
  }

  // Remember the English text the first time an element (or a clone with the same key) is seen.
  function collect(root) {
    (root || document).querySelectorAll('[data-i18n]').forEach(function (el) {
      var k = el.getAttribute('data-i18n');
      if (!(k in EN)) EN[k] = el.innerHTML;
    });
    (root || document).querySelectorAll('[data-i18n-attr]').forEach(function (el) {
      parseAttr(el.getAttribute('data-i18n-attr')).forEach(function (a) {
        if (!(('@' + a[1]) in EN)) EN['@' + a[1]] = el.getAttribute(a[0]) || '';
      });
    });
  }

  function apply(lang) {
    var src = lang === 'pl' ? PL : EN;
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var k = el.getAttribute('data-i18n');
      var v = src[k] != null ? src[k] : EN[k];
      if (v != null && el.innerHTML !== v) el.innerHTML = v;
    });
    document.querySelectorAll('[data-i18n-attr]').forEach(function (el) {
      parseAttr(el.getAttribute('data-i18n-attr')).forEach(function (a) {
        var v = lang === 'pl' ? PL[a[1]] : EN['@' + a[1]];
        if (v == null) v = EN['@' + a[1]];
        if (v != null) el.setAttribute(a[0], v);
      });
    });
    doc.lang = lang;
    document.title = t('meta.title');
    var md = document.querySelector('meta[name="description"]');
    if (md) md.setAttribute('content', t('meta.description'));
    document.querySelectorAll('[data-lang]').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-lang') === lang));
    });
    var group = document.getElementById('lang-switch');
    if (group) group.setAttribute('aria-label', t('lang.group'));
  }

  // Keep the same content under the nav while text lengths change above it:
  // the anchor is the first visible text block below the nav.
  function anchorBefore() {
    if (window.scrollY < 8) return null;
    var navH = (document.getElementById('nav') || {}).offsetHeight || 64;
    var els = document.querySelectorAll('#main h2, #main h3, #main h4, #main p, #main li, #main dt, #main figure, #main picture, #main video');
    for (var i = 0; i < els.length; i++) {
      var r = els[i].getBoundingClientRect();
      if (r.height > 0 && r.top >= navH - 1) return { el: els[i], top: r.top };
    }
    return null;
  }
  function anchorAfter(a) {
    if (!a || !a.el.isConnected) return;
    var d = a.el.getBoundingClientRect().top - a.top;
    if (Math.abs(d) < 1) return;
    var lenis = window.__lenis;
    if (lenis) lenis.scrollTo(window.scrollY + d, { immediate: true, force: true });
    else window.scrollTo(0, window.scrollY + d);
  }

  function setLang(lang, opts) {
    opts = opts || {};
    if (LANGS.indexOf(lang) < 0) lang = 'en';
    var changed = lang !== current;
    var a = changed && !opts.initial ? anchorBefore() : null;
    current = lang;
    apply(lang);
    if (opts.persist !== false) { try { localStorage.setItem('lang', lang); } catch (e) { /* storage blocked */ } }
    if (a) anchorAfter(a);
    if (changed || opts.initial) document.dispatchEvent(new CustomEvent('langchange', { detail: { lang: lang, initial: !!opts.initial } }));
    if (a) requestAnimationFrame(function () { anchorAfter(a); });
  }

  function fromHash() {
    var h = (location.hash || '').toLowerCase();
    return h === '#pl' || h === '#en' ? h.slice(1) : null;
  }
  function stored() {
    try { var s = localStorage.getItem('lang'); return LANGS.indexOf(s) >= 0 ? s : null; } catch (e) { return null; }
  }

  collect();
  var first = fromHash() || stored() || 'en';
  current = 'en';
  if (first !== 'en') { current = first; apply(first); } else apply('en');
  doc.classList.remove('lang-pending');

  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-lang]');
    if (!b) return;
    setLang(b.getAttribute('data-lang'));
    // An old #pl / #en in the address would override the choice on reload.
    if (fromHash()) history.replaceState(null, '', location.pathname + location.search);
  });
  window.addEventListener('hashchange', function () { var h = fromHash(); if (h) setLang(h); });

  window.i18n = {
    t: t,
    lang: function () { return current; },
    set: setLang,
    collect: collect,
    apply: function () { apply(current); },
  };
})();
