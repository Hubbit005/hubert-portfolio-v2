# Zadanie 08 – Cztery interaktywne „zabawki”

Hubert chce, żeby odwiedzający mógł się czymś pobawić. Cztery elementy, każdy osobnym commitem. Zasady z `CLAUDE.md` obowiązują: hero, karuzela i treść bez zmian, żadnych nowych faktów o Hubercie, Higgsfield tylko według punktu H i po zgodzie Huberta.

Kolejność: H (wycena assetów z Higgsfielda i pytanie do Huberta, a w czasie czekania na odpowiedź dalsze kroki), A (silnik fizyki), B (słoik), C (litery w stopce), D (demo planu), E (pieczątka), F (wersjonowanie plików), G (kontrola).

## A. Wspólny silnik fizyki – `js/physics.js`

- Własny, lekki silnik dla kół i prostokątów (Verlet albo prosta integracja z kolizjami), bez zewnętrznych bibliotek. Jeśli po próbie wyjdzie zbyt zawodny, wolno dołożyć `matter-js` jako plik w `vendor/js/` (licencja MIT, plik `.min.js`, bez CDN).
- Grawitacja, odbicia od ścian i podłogi, tarcie, chwytanie wskaźnikiem i rzut z prędkością ruchu ręki.
- Symulacja działa tylko, gdy kontener jest na ekranie (IntersectionObserver) i nie jest uśpiona. Ciała w spoczynku zasypiają. Pętla w tickerze GSAP.
- Szanuje `window.__motionPaused` (przycisk „Zatrzymaj ruch”).

## B. Słoik z narzędziami AI (sekcja `#ai`, lista `.tool-grid`)

**Wygląd:** szklany słoik (SVG albo canvas, szkło lekko odbija `--accent`), w środku kulki z logo narzędzi z listy (pliki z `assets/logos/` i ikony z `.tool__mono`). Gdy sekcja wjeżdża na ekran, kulki wpadają do słoika jedna po drugiej.

**Interakcja:**
- kulki można chwytać, przerzucać i wyrzucać ponad krawędź (wracają do środka po kilku sekundach),
- przeciągnięcie samego słoika w bok potrząsa zawartością; jest też przycisk „Shake” / „Potrząśnij”,
- kliknięcie kulki (bez przeciągania) otwiera dymek z nazwą narzędzia i jednym zdaniem, do czego Hubert go używa.

**Teksty w dymkach: tylko to, co już jest na stronie** (sekcja „How I work with AI” i CV). Mapa:

| Narzędzie | Skąd tekst |
|---|---|
| Claude, Claude Code | „I build the page or prototype… in Claude Code” (`ai.12`) |
| ChatGPT | „ChatGPT to structure strategy” (`ai.6`) |
| Google Gemini | „Gemini for comparisons” (`ai.6`) |
| Perplexity | „Perplexity for sources” (`ai.6`) |
| Higgsfield, Leonardo AI | „I generate images and video in Higgsfield and Leonardo AI” (`ai.15`) |
| Manifold | „Manifold for marketing and social data” (`ai.6`) |
| Botpress | „I built AI agent prototypes in Botpress” (`ksk-pretor.8`) |
| Canva | „make posts and materials in Canva” (`ai.15`) |
| Wispr Flow | „Dictation instead of typing” (`ai.25`) |
| GSAP, HyperFrames | „I make animations in GSAP and HyperFrames” (`ai.12`) |
| Playwright | „render them to MP4 with Playwright” (`ai.12`) |
| three.js | „build 3D in three.js” (`ai.12`) |

Skrócone zdania w dymkach zapisz jako nowe klucze EN + PL (`js/i18n.js`), zgodne z istniejącym polskim tłumaczeniem tych fragmentów. Bez nowych informacji.

**Dostępność:** obecna lista `.tool-grid` zostaje w HTML jako wersja dla czytników ekranu, klawiatury, braku JS i `prefers-reduced-motion`. Słoik ma `aria-hidden="true"`. Na telefonie słoik jest mniejszy. Dotyk przechwytuje ruch tylko wtedy, gdy palec trafi w kulkę, żeby nie blokować przewijania strony.

## C. Litery w stopce do rzucania (napis HUBERT, `.wordmark`)

- Gdy stopka się odsłoni i animacja wypełnienia z zadania 05 się skończy, litery H-U-B-E-R-T stają się ciałami fizycznymi (prostokąty o kształcie litery).
- Można je chwytać, rzucać i przewracać. Odbijają się od krawędzi stopki i od siebie.
- Po ok. 6 s bez dotykania litery płynnie wracają na swoje miejsca. Dodatkowo mały przycisk „Reset” / „Ułóż” (EN + PL).
- Litery nie mogą zasłonić e-maila, telefonu ani przycisków stopki: te elementy leżą wyżej (`z-index`) i są „ścianami”, od których litery się odbijają.
- Telefon: dotknięcie litery podrzuca ją w górę (bez przeciągania, żeby nie blokować przewijania).
- `prefers-reduced-motion` i pauza ruchu: napis statyczny jak teraz.

## D. Klikalne demo planu treningowego (sekcja `#training-plans`)

Obecne dwa zrzuty telefonów i cały tekst zostają. Obok (albo zamiast jednego z unoszących się telefonów na desktopie, ale zrzut ma dalej istnieć w HTML) dodaj **działający mini-telefon**, w którym można przeklikać szablon.

- Najpierw obejrzyj `assets/img/training-plan-a-780.jpg` i `training-plan-b-calendar-780.jpg` i odtwórz ich wygląd w HTML/CSS (układ, kolory, typografia, karty dni, pierścień postępu, kalendarz).
- Ekrany i przejścia:
  1. przegląd planu: „Client A”, cel, poziom, czas trwania, pierścień postępu, karty dni,
  2. dotknięcie dnia → kalendarz miesiąca, wybór daty,
  3. po wyborze daty → lista ćwiczeń z polami do odhaczenia,
  4. odhaczanie ćwiczeń wypełnia pierścień postępu; ukończony dzień dostaje znacznik na przeglądzie,
  5. przycisk „Wróć” na każdym ekranie, płynne przejścia (przesunięcie + przenikanie).
- **Dane są przykładowe i tak oznaczone:** etykieta „Demo · sample data” / „Demo · dane przykładowe” nad telefonem. Ćwiczenia ogólne (np. przysiad, pompki, wiosłowanie hantlem, plank). Żadnych danych prawdziwych klientów ani wyników. Liczby w środku dema (np. serie, „3/5”) są tylko stanem interfejsu.
- Stan w pamięci strony (bez localStorage), reset przy przeładowaniu.
- Prawdziwe przyciski, obsługa klawiatury, widoczny focus, `aria-live` dla zmiany ekranu.
- Telefon: demo w pełnej szerokości kolumny, wygodne pola dotyku (min. 44 px).

## E. Pieczątka z logo (cała strona, tylko desktop)

- Kliknięcie w puste miejsce (tło, marginesy, przestrzeń między blokami) zostawia logo H z nawigacji jako pieczątkę: krótkie „wbicie” (skala 1,4 → 1, lekki losowy obrót ±12°, delikatny cień).
- Nie działa przy kliknięciu w: tekst, linki, przyciski, obrazy, wideo, formularze, hero 3D i ruletkę, karuzelę, słoik, demo, litery w stopce, model 3D.
- Maks. 12 pieczątek naraz, najstarsza znika. Każda blednie po ok. 10 s.
- Pieczątki przewijają się razem ze stroną (pozycja w dokumencie, nie na ekranie). `aria-hidden`, `pointer-events: none`.
- Tylko `pointer: fine`. `prefers-reduced-motion`: bez animacji wbicia (albo funkcja wyłączona).
- Moduł `js/stamp.js`.

## F. Wersjonowanie plików (żeby odwiedzający nie widział starej wersji)

Hubert widział nową stronę ze starym JavaScriptem z pamięci przeglądarki. Dodaj jedną stałą wersji (np. `?v=20261107`) do:
- `css/tokens.css`, `css/main.css`, `js/main.js`, `js/i18n.js` w `index.html`,
- wszystkich importów własnych modułów w `js/` (np. `import { initHero } from './hero.js?v=…'`). Ten sam moduł musi mieć wszędzie identyczny adres, żeby nie załadował się dwa razy.
- Bibliotek z `vendor/` nie wersjonuj. `three.module.min.js` musi mieć wszędzie ten sam adres.

Zapisz w `CLAUDE.md` jedną linię: przy każdej zmianie JS lub CSS podbij wersję.

## H. Assety z Higgsfielda (opcjonalnie, za zgodą)

Hubert pozwala użyć Higgsfielda, żeby zabawki wyglądały „prawdziwie”, a nie płasko. Propozycje (maks. 4 generacje plus 1 poprawka na każdą):

1. **Szklany słoik**: realistyczny render pustego szklanego słoika z boku, przezroczyste tło (PNG z kanałem alfa), delikatne odbicia, ciepłe pomarańczowe światło z boku. Warstwa przednia (szkło) i tylna osobno, jeśli model to umożliwia, żeby kulki były „w środku”.
2. **Faktura pieczątki**: odcisk tuszu (pomarańczowo-czerwony, `#ff5a1f`) z nierównymi krawędziami i ziarnem papieru, przezroczyste tło. Użyj go jako maski na logo H, żeby pieczątka wyglądała jak prawdziwy odcisk.
3. **Faktura liter w stopce**: szczotkowany metal albo matowa, ciepła ceramika, płaska próbka do nałożenia na litery HUBERT (jako `background-image` z `background-clip: text` albo tekstura w canvasie).
4. **Kulki narzędzi**: jedna realistyczna, matowa kula (szkło albo żywica) na przezroczystym tle jako baza, na którą nakładasz logo. Jedna generacja dla wszystkich kulek.

Zasady:
- Najpierw wycena wszystkich czterech (narzędzie wyceny / `max_credits`), jedna wiadomość do Huberta z tabelą i sumą oraz informacja, ile kredytów z limitu 1000 zużyło już zadanie 06. Generuj dopiero po jego „tak”.
- Model obrazu jak w zadaniu 06 (`gpt_image_2_6`) z `background: transparent`, jeśli wspiera. W razie problemu z przezroczystością usuń tło narzędziem `remove_background`, które też najpierw wyceń.
- Pliki na stronę: WebP lub PNG po kompresji, każdy ≤ 150 kB. Surowe pliki w `assets/higgsfield/raw/` (nie commitować).
- Jeśli Hubert powie „nie”, zrób wszystko w kodzie (SVG, gradienty, filtry). Zabawki mają działać tak samo.

## G. Kontrola

Jak w `07-kontrola.md`: porównanie treści (nowe dozwolone teksty to tylko etykiety z tego zadania), testy Playwright na desktopie i telefonie, EN i PL, z i bez reduced motion, konsola bez błędów, Lighthouse mobile ≥ 90. Do tego:
- słoik i litery: zrzuty klatek z przeciągania i rzutu,
- demo: przejście przez wszystkie ekrany myszą, klawiaturą i dotykiem,
- przewijanie palcem po słoiku i stopce na telefonie nie może się blokować.

Niezależna recenzja jak w 07, dodatkowa ocena „czy chce się w to klikać”. Cel ≥ 8, maks. 2 rundy poprawek.

Commity: `Fizyka: wspólny silnik`, `Słoik z narzędziami AI`, `Stopka: litery do rzucania`, `Demo planu treningowego`, `Pieczątka z logo`, `Wersjonowanie plików`, `Interakcje: poprawki po kontroli`.

Raport dla Huberta po polsku, krótko: co działa, oceny, co sprawdzić na telefonie.
