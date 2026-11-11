# 16 – Brief: przebudowa w stylu dorianlods.com (wersja 3)

Decyzja Huberta z 11.11.2026. Strona zostaje przebudowana od zera według projektu w Figmie:
https://www.figma.com/design/UEURLSfj4cvncb5XM00UUb

Ten plik opisuje projekt z Figmy liczbami, więc Figma nie jest potrzebna do budowy. Jeśli w sesji masz dostęp do Figmy, użyj jej tylko do porównania wyglądu. Wymiary poniżej są źródłem prawdy.

Wzór ruchu i proporcji: https://dorianlods.com (hero z napisem i obiektem 3D, Selected Works, sekcja o autorze, Socials, strony projektów przewijane w bok).

Kopia poprzedniej wersji: gałąź `backup/przed-dorianem-2026-11-11`. Nie zmieniaj jej.

## 1. Co znika

Wszystko, czego nie ma w tym briefie: nawigacja, intro z rakietą, kosmos i stacje, ruletka, gitara, karuzela, kursor własny, przełącznik języka i `js/i18n.js`, stopka, długie opisy projektów na stronie głównej. Moduły, style i assety, których nowa strona nie używa, usuń z `main` (zostają na gałęzi kopii). Strona jest tylko po angielsku.

## 2. Paleta i typografia

| Rola | Wartość |
|---|---|
| Tło | `#0A0A0C` |
| Tekst | `#ECE6DC` (beż) |
| Tekst drugorzędny | `#9A94A8` |
| Poświata | `#6B4FD8` (galaktyczny fiolet) |

- **Napisy ekspozycyjne** (imię w hero, tytuły sekcji, tytuły projektów, „CLOSE”): font z próbki Huberta. Pliku fontu nie mamy. Kształty liter są odrysowane 1:1 z próbki i leżą w `assets/font/glyphs.json`: wysokość litery 155 jednostek, `tracking` 6, szerokość spacji 50, dla każdej wielkiej litery A–Z szerokość `w` i ścieżka SVG `d`. Napisz mały moduł `js/glyphs.js`, który składa słowo z liter w jeden inline `<svg>` (`fill: currentColor`, `role="img"`, `aria-label` z tekstem) i skaluje je do zadanej wysokości. Tylko wielkie litery; znaki spoza A–Z i spacji pomiń z ostrzeżeniem w konsoli. Prawdziwy tekst ma być w HTML (np. `<h1>` z ukrytym tekstem albo `aria-label`), żeby strona była czytelna dla wyszukiwarki i czytnika ekranu.
- **Tekst:** Manrope (OFL). Pobierz woff2 do `vendor/fonts/` z plikiem licencji, `@font-face` w `css/tokens.css`, `font-display: swap`. Grenze Gotisch, Archivo, Inter i JetBrains Mono usuń, jeśli nic ich nie używa.
- Teksty Manrope są wersalikami (`text-transform: uppercase`), `letter-spacing: 0.02em`, `line-height: 1.55`.

## 3. Skala i responsywność

- Desktop projektujemy na 1440 × 900. Wszystkie wymiary desktopu skalują się proporcjonalnie do szerokości okna: `--u: calc(100vw / 1440)`, a każdy wymiar to `calc(N * var(--u))`. Okno 1920 px pokazuje to samo co 1440, tylko większe; okno 1024 px to samo, tylko mniejsze.
- Poniżej 768 px działa układ telefonu z sekcji 8 (projekt na 390 × 844, skala `--m: calc(100vw / 390)`). Tekst Manrope na telefonie ma stałe rozmiary podane w sekcji 8, żeby dało się go czytać.

## 4. Scena WebGL (jedna dla całej strony)

Jedno płótno Three.js `position: fixed` pod treścią, jedna pętla na tickerze GSAP. W scenie:

1. **Tło „budyń”.** Czarna płaszczyzna na cały ekran, siatka ok. 120 × 70 wierzchołków. Kursor wgniata powierzchnię jak łyżeczka (promień ok. 140 px, głębokość ok. 30 px). Każdy wierzchołek wraca do spoczynku jak sprężyna z tłumieniem (powrót ok. 1,5 s, lekkie przeregulowanie i drganie). Fizyka w shaderze albo na CPU na rzadkiej siatce, wynik jako tekstura przemieszczeń.
2. **Napis w powierzchni.** Imię „HUBERT SKONIECZNY” z hero jest teksturą na tej samej płaszczyźnie, więc ugina się razem z budyniem. Pod kursorem napis rozmywa się z rozszczepieniem RGB (przesunięcie kanałów do ok. 12 px, rozmycie do ok. 6 px, w promieniu ok. 180 px), jak na dorianlods.com przy najechaniu na imię. Napis w DOM zostaje dla dostępności (ukryty wizualnie, gdy WebGL działa).
3. **Światło za kursorem.** Fioletowa poświata (`#6B4FD8`, średnica ok. 560 px, miękka) podąża za kursorem z opóźnieniem ok. 0,15 s. Poza nią tło zostaje czarne.
4. **Kryształ.** Szklany ośmiościan, opis w sekcji 5.

Telefon i dotyk: budyń reaguje na palec tylko podczas przesuwania, światło stoi w miejscu kryształu. Brak WebGL albo `prefers-reduced-motion`: czarne tło z jedną statyczną poświatą CSS, kryształ jako obrazek PNG, napisy jako SVG, bez ruchu.

## 5. Kryształ

- Model: `assets/crystal/crystal.glb` (adres do pobrania w zadaniu 17). Z modelu bierzemy **tylko kształt**. Materiał robi kod: `MeshPhysicalMaterial` z `transmission: 1`, `thickness` ok. 1,2, `ior` 1,5, `roughness` 0,05, `dispersion` ok. 5, lekka `iridescence`, mapa otoczenia z miękkimi fioletowymi i ciepłymi plamami światła. Ma przypominać zdjęcie referencyjne: przezroczyste szkło, tęczowe krawędzie, ciepłe światło w dolnych ścianach.
- Jeśli GLB jest zepsuty, krzywy albo ma więcej niż 8 wyraźnych ścian, użyj `THREE.OctahedronGeometry` i wpisz to do raportu.
- Stale obraca się wokół własnej osi, ok. 1 obrót na 12 s. Na desktopie lekko reaguje na kursor (pochylenie do ±6°).
- **Ściany i projekty:** ściana 1 to Basko Clean, 2 Livingroom, 3 Agata Patelka (strona psycholożki), 4 KSK Pretor, ściany 5–8 wolne.
- **Hover na projekcie w Selected Works:** kryształ przestaje się obracać i w 0,6 s (`ease-out`) obraca się do widza ścianą tego projektu. Za kryształem, w scenie, pojawia się płaszczyzna ze zdjęciem projektu (przenikanie 0,4 s), więc widać ją **tylko przez szkło**: załamaną, z tęczowymi krawędziami. Poza kryształem zdjęcia nie widać. Po zjechaniu kursorem zdjęcie gaśnie, a obrót wraca.
- Telefon: pierwsze tapnięcie w projekt obraca kryształ i pokazuje zdjęcie, drugie otwiera stronę projektu.

## 6. Ruch przy scrollu

- Płynny scroll z inercją (Lenis, już w `vendor/js/`) i ScrollTrigger.
- **Jedna sekcja na ekran.** Nigdy nie widać dwóch sekcji naraz.
- Przejście między sekcjami trwa ok. jeden ekran scrolla: 0–40% bieżąca sekcja gaśnie (`opacity` 1→0, przesunięcie w górę o ok. 40 px), 40–60% widać tylko kryształ na czarnym tle, 60–100% następna sekcja pojawia się (`opacity` 0→1, przesunięcie z dołu o ok. 40 px). Wszystko przypięte do scrolla (scrub), przy scrollu w górę ruch się cofa.
- **Tor kryształu** (współrzędne desktopu 1440 × 900, środek kryształu):
  - Hero: kryształ krąży po **niewidocznej** pochylonej elipsie wokół słowa „SKONIECZNY” i dolnej części „HUBERT”. Środek elipsy w środku słowa „SKONIECZNY”, promień poziomy ok. 480 px, pionowy ok. 70 px, nachylenie ok. 8° (prawy koniec wyżej). Jeden obieg ok. 10 s. Na tylnej połowie elipsy kryształ jest **za** płaszczyzną z napisem (w scenie 3D, nie przez `z-index`), na przedniej przed nią, więc chowa się za literami. Rozmiar ok. 140 px.
  - Hero → Selected Works: z bieżącego punktu orbity kryształ zjeżdża w dół łagodnym łukiem w prawo: przez punkt ok. (1090, 450) w połowie przejścia do (950, 430) w Selected Works, rosnąc do 300 px. Ten tor narysował Hubert w Figmie.
  - Selected Works → My Story: na środek, maleje do 120 px.
  - My Story → Socials: zostaje na środku, maleje do 90 px.
- Na stronie nie ma wskaźnika scrolla.

## 7. Sekcje desktop (1440 × 900, wymiary w px projektu)

### 01 Hero
- „HUBERT” i „SKONIECZNY” fontem z glifów, wysokość liter 96, wyśrodkowane w poziomie, góra pierwszej linii na y = 300, odstęp między liniami 18.
- Podpis pod imieniem, 34 px niżej, Manrope Bold 13, wyśrodkowany, dwie linie:
  „A Poland-based web designer building immersive, AI-powered websites / for brands that want to be remembered.”
- Kryształ na orbicie (sekcja 6). Poświata ok. 560 px w okolicy (780–1340, 260–820).

### 02 Selected Works
- „SELECTED” i „WORKS” fontem z glifów, wysokość 34, wyrównane do lewej na x = 330, y = 300 i 342.
- Lista od y = 420, wiersze co ok. 22 px: nazwa Manrope Bold 14, potem „// typ” Manrope Medium 14:
  - BASKO CLEAN // WEBSITE + MOTION
  - LIVINGROOM // RESTAURANT WEBSITE
  - AGATA PATELKA // BOOKING + PAYMENTS
  - KSK PRETOR // AI AGENT
- Każdy wiersz to link do strony projektu. Hover: kryształ (sekcja 5), wiersz w pełnym kolorze, pozostałe przygaszone do 50%.
- Kryształ 300 px, lewa krawędź ok. x = 800, góra ok. y = 280.

### 03 My Story
- Kryształ 120 px nad tytułem, ok. (660, 170).
- „MY STORY” fontem z glifów, wysokość 40, wyśrodkowane, y = 330.
- Pod spodem, 40 px niżej, akapity Manrope Medium 13, szerokość 720, wyśrodkowane, odstęp 14:
  1. I'm a web designer who designs and builds immersive websites and AI chat agents for small businesses.
  2. Every site I ship is designed, written and coded by me, from the first sketch to the live launch.
  3. Before the web, I spent years in athletics and coaching. I bring the same discipline to every project.
  4. If you want to work together, send me an email. I'm always open to new projects.
- W akapicie 4 słowa „send me an email” to link `mailto:` z adresem z obecnej stopki.

### 04 Socials
- Kryształ 90 px nad tytułem, ok. (675, 280).
- „SOCIALS” fontem z glifów, wysokość 34, wyśrodkowane, y = 410.
- Linki Manrope Bold 14, podkreślone, odstęp 28, y = 474: LINKEDIN, MAIL, GITHUB. Adresy weź z obecnego `index.html` (stopka i sekcja kontaktu). Jeśli którego brakuje, pomiń link i wpisz to do raportu.

## 8. Telefon (projekt 390 × 844)

Te same sekcje i ten sam ruch. Kryształ jest większy, wychodzi poza prawą krawędź ekranu i leży **pod** tekstem.

| Sekcja | Tytuł (wysokość liter, położenie) | Tekst | Kryształ |
|---|---|---|---|
| Hero | „HUBERT” i „SKONIECZNY” 36, wyśrodkowane, y = 330 i 372 | podpis Bold 12, szerokość 330, y = 430 | 200 px, x = 235, y = 255, za literami |
| Selected Works | 32, do lewej, x = 40, y = 90 i 128 | lista Bold/Medium 16, wyśrodkowana, od y = 230 co 28 | 420 px, x = 225, y = 150, pod listą, ucięty z prawej |
| My Story | 32, wyśrodkowane, y = 250 | Medium 14, szerokość 330, od y = 320 | 300 px, x = 240, y = 120 |
| Socials | 32, wyśrodkowane, y = 400 | linki Bold 16, y = 460 | 260 px, x = 240, y = 180 |

Ekrany przejść: sam kryształ 220–320 px, częściowo za prawą krawędzią.

## 9. Strony projektów (przewijane w bok)

Cztery strony: `work/basko-clean.html`, `work/livingroom.html`, `work/agata-patelka.html`, `work/ksk-pretor.html`. Wspólny CSS i JS, ta sama scena WebGL (budyń i światło; kryształ schowany).

Desktop 1440 × 900:
- **Lewy panel przypięty** (nie przesuwa się), x = 110, y = 150:
  - Tytuł fontem z glifów, wysokość 48, dwie linie (np. „BASKO” / „CLEAN”), odstęp 10.
  - 36 px niżej opis: Manrope Medium 18, szerokość 500, 2–3 zdania w pierwszej osobie. Weź treść z obecnego opisu projektu w `index.html` i skróć; bez nowych faktów, liczb i obietnic.
  - 36 px niżej metryka, wiersze Manrope 18: etykieta Bold w kolumnie 110 px, potem „// wartość” Medium. Wiersze: CLIENT, SCOPE, STACK, YEAR. Wartości tylko z obecnej treści strony. Jeśli wartości nie ma, pomiń wiersz.
  - 36 px niżej link „VISIT WEBSITE” (Bold 18) do działającej strony klienta, jeśli adres jest w obecnej treści. Inaczej bez linku.
- **„CLOSE”** fontem z glifów, wysokość 18, prawy górny róg (60 px od prawej, 40 px od góry). Wraca na stronę główną, do Selected Works, z tym projektem pod kursorem. `Esc` robi to samo.
- **Taśma zdjęć** z prawej: karty wysokości 720, y = 112, zaokrąglenie 24, odstęp 30, pierwsza karta od x = 725. Szerokości 460 (pionowe) albo 620 (poziome). Zdjęcia z `assets/img/` i `assets/cards/` danego projektu, plus plakat i wideo z `assets/higgsfield/` (wideo odtwarzane w karcie bez dźwięku, gdy karta jest na ekranie). Bez nowych generacji.
- **Scroll w dół przesuwa taśmę w prawo** (taśma jedzie w lewo, odsłaniając kolejne karty). Kółko, gładzik i klawisze strzałek. Na końcu taśmy strona się zatrzymuje.

Telefon [Z]: tytuł, opis i metryka u góry, pod spodem taśma przesuwana palcem w bok (`scroll-snap`), karty ok. 300 × 470. CLOSE w prawym górnym rogu.

## 10. Zasady, które zostają

- Bez nowych liczb i faktów o Hubercie. Teksty tylko z tego briefu albo z obecnej treści projektów.
- Dostępność: kolejność tabulacji, widoczny focus, `prefers-reduced-motion` (wszystko statyczne, sekcje jedna pod drugą bez przejść), działanie bez JS (zwykła strona z sekcjami pod sobą).
- Wydajność: Lighthouse mobile ≥ 90 i CLS < 0,1. `devicePixelRatio` maks. 1,5, pauza WebGL przy ukrytej karcie, GLB i zdjęcia projektów ładowane po pierwszym malowaniu, obrazy AVIF/WebP z `srcset`.
