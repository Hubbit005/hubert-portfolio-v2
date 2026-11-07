# Zadanie 11 – Gitara w hero, kabel i kostka, stare tła projektów, porządki

Decyzje Huberta z 7.11.2026. **Kolejność: najpierw zadanie 10 (napis HUBERT 3D), potem to zadanie.** Oba zmieniają hero, więc robisz je w jednej sesji, jedno po drugim, i oddajesz w jednym pull requeście do `main`.

Kolejność punktów: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8. Każdy punkt to osobny commit z opisem po polsku.

**Higgsfield:** nie generuj niczego. Jedyny nowy obraz (kostka) jest już opłacony, adres w punkcie 4.

## 1. Spis projektów: bez okładki przy kursorze

W sekcji Case studies (`.case-index`, lista 01–06) usuń okienko z okładką, które pojawia się przy najechaniu kursorem.
- `js/cases-motion.js`: usuń `initIndexCover` i `COVERS` (oraz wszystko, czego używały tylko one).
- `css/main.css`: usuń style `.case-cover`.
- Linia, która wypełnia się akcentem, przesunięcie nazwy i strzałka przy najechaniu zostają.

## 2. „How I work with AI”: usuń dwie kolumny

Usuń cały blok `.split-panel` z kolumnami „Where AI speeds me up” i „What I decide” (`index.html`) oraz klucze `ai.20`–`ai.31` w `js/i18n.js`. Usuń style `.split-panel`, jeśli nic innego ich nie używa. To jedyne teksty, które wolno usunąć. Lista kroków nad blokiem i „Tools I use” pod nim zostają.

## 3. Gitara w hero: przesuwany panel

Sekcja `#guitar` znika z miejsca po `#about` i staje się drugim panelem hero.

**Układ**
- Hero dostaje poziomy tor z dwoma panelami o szerokości ekranu: panel 1 to obecne hero, panel 2 to scena z gitarą (nagłówek „Play something”, gitara, kostka, piec, przycisk Play, tło z dymem). Kotwica `#guitar` zostaje na panelu 2.
- Wysokość jak hero. Bez przewijania w poziomie paska przeglądarki (`overflow: hidden` na torze).

**Strzałka „do gitary” (panel 1)**
- Duży przycisk po prawej stronie hero, w pionie mniej więcej na środku: strzałka skierowana w lewo, ok. 88–104 px na desktopie, 56–64 px na telefonie. Kolor akcentu, delikatna poświata `--glow-rgb`, co kilka sekund lekkie „szturchnięcie” w lewo, żeby zachęcało do kliknięcia. `data-magnetic` jak inne przyciski.
- Pod strzałką mały podpis mono z istniejącego klucza `guitar.1` („Play something” / „Zagraj coś”). Ten sam tekst jest nazwą przycisku. **Bez nowych tekstów.**
- Strzałka jest przeszkodą dla ikon i nie może zasłaniać napisu HUBERT ani przycisków. Sprawdź na 1440×900 i 390×844.

**Przejście**
- Klik: cały tor płynnie przesuwa się w lewo (`transform: translateX`, ok. 0,8–0,9 s, `--ease-out`), z prawej wjeżdża panel z gitarą. Lekka paralaksa: tło z dymem jedzie trochę wolniej niż gitara i piec.
- Powrót: przycisk ze strzałką w prawo przy lewej krawędzi panelu 2, podpis z istniejącego klucza `roulette-back.1` („Back”). Klawisz `Esc` też wraca.
- Gdy panel 2 jest widoczny: hero 3D, ikony i ruletka nie renderują się (pauza w tickerze). Po powrocie: gitara przestaje grać, hero rusza dalej.
- Panel, którego nie widać, ma `inert`. Po przejściu fokus idzie na nagłówek panelu 2 (`tabindex="-1"`), po powrocie z powrotem na strzałkę.
- Adres z `#guitar` otwiera od razu panel 2. Przycisk strzałki ma `aria-controls` na panel 2 i `aria-expanded`.

**Telefon**
- Ta sama strzałka i przycisk powrotu. Dodatkowo przesunięcie palcem w poziomie (gdy ruch w poziomie jest wyraźnie większy niż w pionie, próg ok. 60 px). Przewijanie w pionie musi działać normalnie.
- Gitara, kostka i piec mieszczą się na 390×844 bez przewijania panelu.

**Bez JS i `prefers-reduced-motion`**
- Bez JS: panel z gitarą wyświetla się zwykłym blokiem pod hero, strzałki ukryte.
- Reduced motion: zmiana panelu bez przesuwania (krótkie przenikanie albo od razu).

**Wydajność (ważne)**
- Obrazy gitary, pieca i kostki, film z dymem i moduły `js/guitar.js` / `js/guitar-audio.js` ładuj dopiero przy pierwszym najechaniu, fokusie albo kliknięciu strzałki (dynamiczny `import()`), a nie przy starcie strony. Nic z panelu 2 nie może wpłynąć na pierwsze wyświetlenie hero.

## 4. Kabel, kostka z przesterem i ruszający się piec

**Kostka**
- Obraz: https://d8j0ntlcm91z4.cloudfront.net/user_3E4wjlRzfbqMlZMAqIWN6GaWkvD/hf_20261107_092522_e7f3b7e6-deeb-428c-91d9-644a9517f2af.png (opłacona, 2,75 kredytu)
- Pobierz do `assets/higgsfield/raw/` (nie commituj), przytnij, WebP z alfą: `assets/hf/pedal-400.webp` i `pedal-240.webp`, każdy ≤ 40 kB.
- Stoi na „podłodze” między gitarą a piecem, ok. 110–140 px szerokości na desktopie, ok. 72 px na telefonie. Nie lewituje (stoi na ziemi), ma miękki cień.
- W trakcie grania dioda na kostce świeci akcentem i lekko pulsuje z głośnością (element nałożony na obraz, skalibruj pozycję do diody).
- Przester w dźwięku już jest (WaveShaper w `js/guitar-audio.js`). Kostka to jego wizualna strona, bez nowego przełącznika.

**Kabel**
- Rysowany w SVG w kodzie, bez nowych obrazów. Dwa odcinki: gniazdo gitary (dolna część korpusu) → wejście kostki, wyjście kostki → wejście pieca (skalibruj punkty do obrazów).
- Ciemny kabel z delikatnym połyskiem, zwisa łukiem (krzywa Béziera z „ugięciem” w dół), na końcach małe wtyki jack.
- Kabel podąża za lewitacją gitary i pieca: końce przelicz w tickerze GSAP z pozycji elementów, tylko gdy panel 2 jest widoczny.
- W trakcie grania kabel lekko drga przy uderzeniach akordów.

**Piec w trakcie grania**
- Do analizy dźwięku użyj istniejącego `AnalyserNode` z `js/guitar-audio.js` (dołóż odczyt widma do pasma basu).
- Cały piec drga: przesunięcie ±1–2 px i obrót ±0,4°, siła zależna od głośności, szybkie drgania przy mocnych akordach.
- Głośniki (`.amp__cone`) wyraźnie pulsują: skala 1 → ok. 1,05 zależnie od basu, do tego ciemniejszy środek w momencie uderzenia. Lampka pulsuje jak dotąd.
- Po zatrzymaniu wszystko płynnie wraca do spoczynku.
- Animuj tylko `transform` i `opacity`. Reduced motion: bez drgań i pulsowania, dioda świeci statycznie.

## 5. Tła nagłówków projektów: powrót do filmów z zadania 06

Chromowane tła z zadania 09 (`assets/hf/bg-*`) wyłącz i wróć do poprzednich filmów: Basko – woda, KSK – dym i łuski, Livingroom – świece, psycholog – zasłona, mniejsze projekty – magnezja.

- Klon jest płytki. Pobierz historię: `git fetch --depth=50 origin main`.
- Odzyskaj pliki z commita `cfc74dc` (stan sprzed PR #3):
  `git checkout cfc74dc -- assets/higgsfield/basko-* assets/higgsfield/ksk-* assets/higgsfield/living-* assets/higgsfield/psy-* assets/higgsfield/gym-*`
  (jeśli powłoka nie rozwinie gwiazdek, podaj pełne nazwy: `-1280.mp4`, `-1280.webm`, `-640.mp4`, `-poster.webp` dla każdego).
- Odwróć zmiany z commita `7ce1bf1` w `index.html` i `css/main.css` (`git show 7ce1bf1 -- index.html css/main.css`): adresy `poster` i `data-ambient` z powrotem na `assets/higgsfield/…`, stare `object-position` na telefonie i stara reguła wysokości pasa KSK na telefonie.
- Usuń z repo `assets/hf/bg-*` (zostają w historii git). `assets/hf/smoke-*` zostaje, bo to tło gitary.
- Zasady odtwarzania bez zmian: tylko na ekranie, plakat przy reduced motion i Save-Data, plik 640 na telefon. Sprawdź kontrast AA tekstu nagłówków.

## 6. Ikony w hero bez rozmycia

W `.hero-icon` (`css/main.css`, sekcja „Hero chrome icons”) usuń `blur(...)` z `filter`. Wszystkie ikony są ostre. Głębię dają tylko wielkość i jasność (`brightness` zostaje). Sprawdź też `js/hero-icons.js`, czy nigdzie nie dokłada rozmycia.

## 7. Wersjonowanie

Podbij `?v=` według zasady z `CLAUDE.md` (jedna wartość w `index.html` i we wszystkich importach w `js/`).

## 8. Kontrola, PR i raport

Zasady oszczędne (patrz `CLAUDE.md`, „Sposób pracy”):
- Playwright tylko 1440×900 i 390×844, po angielsku. Polski: tylko sprawdź, że nie ma brakujących kluczy i usunięte klucze nie są nigdzie używane. Reduced motion sprawdź w kodzie, bez osobnych zrzutów.
- Konsola bez błędów.
- Panel z gitarą: przejście tam i z powrotem myszą, klawiaturą (Tab, Enter, Esc) i gestem na 390×844; granie, stop, powrót w trakcie grania zatrzymuje dźwięk; `#guitar` w adresie otwiera panel.
- Kabel trzyma się gniazd w trakcie lewitacji, piec drga i głośniki pulsują tylko w trakcie grania.
- Spis projektów bez okładki, sekcja AI bez dwóch kolumn, stare filmy w nagłówkach, ikony ostre.
- **Lighthouse mobile przed i po** (teraz 75–81). Wynik nie może spaść. Jeśli spada, najpierw sprawdź, czy coś z panelu 2 ładuje się przy starcie.
- Jedna runda niezależnej recenzji (ocena „efekt wow” i „czy chce się w to klikać”), jedna runda poprawek, bez kolejnych.

Pull request do `main` (zadania 10 i 11 razem). Raport po polsku, krótko: co zrobione, wynik Lighthouse przed i po, ocena z recenzji, co Hubert ma sprawdzić.
