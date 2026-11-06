# Zadanie 09 – Chromowane ikony i ruletka w hero, nowe tła projektów, sekcja z gitarą

Decyzje Huberta z 7.11.2026. Assety z Higgsfielda są już wygenerowane (lista niżej) i zapłacone. **Nie generuj niczego nowego w Higgsfieldzie bez pytania.**

Kolejność: 0 → 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8. Każdy punkt to osobny commit. Na końcu pull request do `main` i krótki raport po polsku.

## 0. Assety: pobierz i przygotuj

Pobierz pliki do `assets/higgsfield/raw/` (nie commituj ich) i przygotuj wersje na stronę.

| Plik docelowy | Źródło |
|---|---|
| `assets/hf/icons/guitar` | https://d8j0ntlcm91z4.cloudfront.net/user_3E4wjlRzfbqMlZMAqIWN6GaWkvD/hf_20261106_230857_ad12cb4c-08c2-4edd-bc4b-e8d516f35927.png |
| `assets/hf/icons/dumbbell` | https://d8j0ntlcm91z4.cloudfront.net/user_3E4wjlRzfbqMlZMAqIWN6GaWkvD/hf_20261106_230858_ce713d1b-a38a-41f7-a5ba-853efeb56c64.png |
| `assets/hf/icons/car` | https://d8j0ntlcm91z4.cloudfront.net/user_3E4wjlRzfbqMlZMAqIWN6GaWkvD/hf_20261106_230857_f2644eb9-c03d-42ac-b7ba-c244a19d7341.png |
| `assets/hf/icons/mustache` | https://d8j0ntlcm91z4.cloudfront.net/user_3E4wjlRzfbqMlZMAqIWN6GaWkvD/hf_20261106_230856_76b3ce64-0cf0-4d85-906f-90d509c004c9.png |
| `assets/hf/icons/cards` | https://d8j0ntlcm91z4.cloudfront.net/user_3E4wjlRzfbqMlZMAqIWN6GaWkvD/hf_20261106_230855_bda012af-17b7-4136-af8f-687ad506db1e.png |
| `assets/hf/icons/dollar` | https://d8j0ntlcm91z4.cloudfront.net/user_3E4wjlRzfbqMlZMAqIWN6GaWkvD/hf_20261106_230856_e3cbf470-7132-4927-869f-82ec157312e0.png |
| `assets/hf/icons/diamond` | https://d8j0ntlcm91z4.cloudfront.net/user_3E4wjlRzfbqMlZMAqIWN6GaWkvD/hf_20261106_230942_f3fc32c6-d7fd-4638-b5c0-7dfac925ae3e.png |
| `assets/hf/icons/galaxy` | https://d8j0ntlcm91z4.cloudfront.net/user_3E4wjlRzfbqMlZMAqIWN6GaWkvD/hf_20261106_230943_65157d00-2e0b-4031-b496-4ea760bb3b9c.png |
| `assets/hf/env-studio` (mapa odbić) | https://d8j0ntlcm91z4.cloudfront.net/user_3E4wjlRzfbqMlZMAqIWN6GaWkvD/hf_20261106_230942_2c9da051-3ac0-4f07-8a00-1880a374cd4d.png |
| `assets/hf/guitar` | https://d8j0ntlcm91z4.cloudfront.net/user_3E4wjlRzfbqMlZMAqIWN6GaWkvD/hf_20261106_230947_f20b9787-1970-4f7f-ad56-2055665723d3.png |
| `assets/hf/amp` | https://d8j0ntlcm91z4.cloudfront.net/user_3E4wjlRzfbqMlZMAqIWN6GaWkvD/hf_20261106_230946_f8828e63-f6f4-45b6-ac7c-13a39dec3160.png |
| plakaty teł projektów (pierwsza klatka) | basko: …230945_0cbd7101-9251-44be-81fd-0215dabac444.png, ksk: …230943_938932e9-8fa7-4596-a3f9-cd97f2630bd2.png, living: …230941_9b8f87de-a5c0-4647-8773-6daafd57ebf4.png, psy: …230948_6ec4efbd-f7fa-4dbd-ab26-196a259e2c70.png, gym: …230947_9d5621a3-d139-4710-bb5c-0f250b18eb3b.png, dym: …230948_6fb1f4f2-1ab4-4897-a23b-804b324a64f8.png (przedrostek jak wyżej: `https://d8j0ntlcm91z4.cloudfront.net/user_3E4wjlRzfbqMlZMAqIWN6GaWkvD/hf_20261106_`) |
| wideo teł projektów i dymu | lista w sekcji „Wideo” na końcu pliku |

Obróbka:
- **Ikony:** przytnij przezroczyste marginesy, WebP z kanałem alfa: 512 px i 256 px (dłuższy bok), każdy ≤ 60 kB.
- **Mapa odbić:** rozciągnij do 2048×1024 (equirectangular), WebP lub JPG ≤ 300 kB.
- **Gitara:** przytnij, WebP z alfą, wysokość 1600 px (≤ 250 kB) i 900 px. **Piec:** przytnij, 1200 px i 700 px.
- **Wideo:** jak w zadaniu 06: `-1280.webm`, `-1280.mp4`, `-640.mp4`, plakat `-poster.webp`. Sprawdź pętlę: pierwsza i ostatnia klatka mają być takie same, a przy skoku dodaj przenikanie 0,4 s.

## 1. CLAUDE.md i sprzątanie

- W `CLAUDE.md` zmień sekcję „Czego nie zmieniać”: hero jest odblokowane dla ikon i ruletki (decyzja Huberta z 7.11). Napis HUBERT 3D, jego kolory i poświata zostają.
- **Usuń wykres** „What I did in each project” (HTML, `js/chart.js`, import, CSS, klucze i18n wykresu).
- **Spis projektów** (`.case-index`): okładka ma się pojawiać przy kursorze (ok. 24 px na prawo i w dół od wskaźnika, podąża w obu osiach), a nie przy prawej krawędzi listy. Większa: ok. 280–320 px szerokości. Sprawdź na 1280, 1440 i 1920 px, że okładka nie wychodzi poza ekran (odbija się na lewą stronę kursora przy prawej krawędzi).

## 2. Chromowane ikony w hero

- 8 ikon unosi się wokół napisu HUBERT w sekcji hero: gitara, hantel, auto, wąsy, karty, dolar, diament, galaktyka.
- Fizyka z `js/physics.js` (zadanie 08), bez grawitacji: ikony powoli dryfują i lekko się kołyszą. Można je chwytać, rzucać i odbijać od siebie oraz od krawędzi hero. Napis HUBERT, przyciski i przycisk ruletki są przeszkodami, więc ikony ich nie zasłaniają.
- Po ok. 5 s bez dotykania ikony wracają płynnie na swoje orbity.
- Rozmiar 90–150 px na desktopie (różne, dla głębi; mniejsze lekko rozmyte i ciemniejsze jak dalej w tle). Delikatny cień w kolorze `--glow-rgb`.
- Kursor nad ikoną: stan „chwyć”. Ikony ładuj po starcie hero 3D, żeby nie spowalniały pierwszego wyświetlenia.
- Gdy ruletka jest otwarta, ikony odpływają na boki i przygasają.
- Telefon: 4 ikony (gitara, auto, diament, dolar), mniejsze. Dotknięcie ikony ją podrzuca, bez przeciągania, żeby nie blokować przewijania.
- `aria-hidden="true"`. `prefers-reduced-motion` i pauza ruchu: ikony stoją nieruchomo w swoich miejscach.

## 3. Chromowana ruletka z prawdziwą kulką

Dotyczy `js/hero.js` i `js/roulette.js`. Logika wyboru projektu i karta wyniku zostają.

- **Materiały:** koło, obręcz, przegródki i wskaźnik z chromu: `MeshStandardMaterial` / `MeshPhysicalMaterial`, `metalness` 1, `roughness` 0,08–0,2, `envMap` z `assets/hf/env-studio` przez `PMREMGenerator`. Pola z nazwami projektów zostają czytelne: na przemian ciemny chrom i akcent.
- **Kulka:** chromowana kula. Startuje po obręczy w kierunku przeciwnym do obrotu koła, zwalnia (tarcie), schodzi spiralą do środka, odbija się od przegródek z małymi losowymi impulsami i zatrzymuje w kieszeni.
- **Wynik wyznacza kieszeń, w której kulka naprawdę stanęła.** Karta wyniku i komunikat `aria-live` muszą się z tym zgadzać.
- **Dźwięk (Web Audio, w kodzie):** szum toczenia, którego głośność zależy od prędkości kulki, krótkie stuknięcia przy uderzeniach w przegródki i cichy „klik” przy zatrzymaniu. Dźwięk startuje dopiero po kliknięciu „Spin”. Mały przycisk wyciszenia przy ruletce: EN „Sound on/off”, PL „Dźwięk wł./wył.”.
- Przeciąganie koła działa jak dotąd.
- `prefers-reduced-motion`: bez animacji, od razu wynik.

## 4. Nowe tła nagłówków projektów

Zamień obecne filmy w nagłówkach Basko, KSK, Livingroom, psychologa i mniejszych projektów na chromowane obiekty (wideo z sekcji „Wideo”). Film z atramentem w stopce zostaje. Obiekt jest w prawej części kadru, więc tekst nagłówka ma zostać po lewej. Sprawdź kontrast AA. Zasady odtwarzania jak w zadaniu 06: tylko na ekranie, plakat dla reduced motion i Save-Data, plik 640 na telefon.

## 5. Sekcja z gitarą (nowa, po `#about`, przed `#cv`)

- `<section id="guitar">`, bez pozycji w menu. Tło: zapętlone wideo z dymem.
- **Teksty, EN + PL w `js/i18n.js`:**
  - nagłówek EN „Play something”, PL „Zagraj coś”,
  - przycisk EN „Play”, PL „Zagraj” (w trakcie grania „Stop”),
  - podpis dla czytników ekranu EN „Electric guitar and amplifier. Press Play to hear a short riff.”, PL „Gitara elektryczna i wzmacniacz. Naciśnij »Zagraj«, żeby usłyszeć krótki riff.”.
- **Lewitacja:** gitara (lewo lub środek) i piec (prawo) unoszą się niezależnie: ruch w pionie ±12 px, obrót ±2°, różne okresy. Pod nimi miękki cień na „podłodze”, który maleje, gdy przedmiot jest wyżej. Pomarańczowa poświata za nimi.
- **Hover nad gitarą:** poświata mocniej świeci (`drop-shadow` w akcencie), gitara lekko pochyla się w stronę kursora, przy kursorze pojawia się pastylka „▶ Zagraj”, a pierścień kursora pokazuje ikonę play.
- **Klik w gitarę albo w przycisk:** gitara gra sama **oryginalny** riff w klimacie rocka lat 80, ok. 12–16 s.
  - **Nie odtwarzaj żadnej istniejącej piosenki** ani jej rozpoznawalnego motywu, w szczególności „Money for Nothing”. Skomponuj własny riff: power chordy plus jednogłosowa fraza w e-moll pentatonicznej, ok. 118–124 BPM.
  - Synteza w Web Audio: struny Karplus-Strong → przester (WaveShaper) → chorus (modulowane opóźnienie) → prosty pogłos (opóźnienia ze sprzężeniem) → kompresor. Głośność umiarkowana, ok. −12 dB.
- **Animacja w trakcie grania:**
  - na zdjęcie gitary nałóż 6 linii SVG dokładnie na struny, od siodełka do mostka (skalibruj pozycje do obrazu). Linia drga (sinusoida), gdy gra jej struna, a amplituda zależy od siły dźwięku,
  - na piecu pulsuje lampka i lekko „oddycha” maskownica głośników w rytm głośności.
- Granie zatrzymuje się po wyjściu sekcji z ekranu, przy ukryciu karty i po kliknięciu „Stop”. Bez autoodtwarzania.
- **Dostępność:** prawdziwy `<button>`, klawiatura (Enter/Spacja), widoczny focus, `aria-pressed` w trakcie grania.
- **Telefon:** gitara i piec jeden pod drugim albo obok siebie mniejsze, dotknięcie gitary gra.
- `prefers-reduced-motion`: bez lewitacji i drgań, dźwięk dalej działa.

## 6. Wersjonowanie

Podbij wersję plików (`?v=…`) według zasady z `CLAUDE.md`.

## 7. Kontrola

Jak w `07-kontrola.md`. Dozwolone nowe teksty to tylko etykiety z punktów 3 i 5, a usunięte tylko teksty wykresu. Dodatkowo:
- ruletka: 10 losowań, za każdym razem karta zgadza się z kieszenią kulki,
- ikony: przeciąganie i rzut, nic nie zasłania napisu ani przycisków,
- gitara: odtworzenie, stop, wyjście z ekranu w trakcie grania, klawiatura,
- Lighthouse mobile: po zadaniu 08 wynik to 52–59, czyli dużo poniżej celu 90, głównie przez hero. To zadanie nie może go obniżyć. Spróbuj go podnieść: hero 3D, ikony i ruletkę na telefonie ładuj dopiero po pierwszym wyświetleniu albo po pierwszej interakcji, zmniejsz obrazy i JS na telefonie, wideo dopiero przy zbliżaniu się do ekranu. Zapisz wynik przed i po.

Niezależna recenzja z oceną „efekt wow” i „czy chce się w to klikać”. Cel ≥ 8, maks. 2 rundy poprawek.

## 8. Pull request i raport

PR do `main`. Raport po polsku, krótko: co zrobione, oceny, co Hubert ma sprawdzić.

## Wideo

Przedrostek: `https://d8j0ntlcm91z4.cloudfront.net/user_3E4wjlRzfbqMlZMAqIWN6GaWkvD/hf_20261106_231403_`

| Nazwa pliku na stronie | Koniec adresu |
|---|---|
| `assets/hf/bg-basko` | `5a9ccdd2-cb26-4a11-a77d-34460155b7ae.mp4` |
| `assets/hf/bg-ksk` | `7d31bf20-edc6-4ce2-b7a2-806b56c0880b.mp4` |
| `assets/hf/bg-living` | `ac11634d-5f2c-4988-9183-42fb08c74fad.mp4` |
| `assets/hf/bg-psy` | `299cf557-a98d-4371-80fb-9b494004917b.mp4` |
| `assets/hf/bg-gym` | `f437c0cc-f1bc-4d31-b526-30d8c67b064c.mp4` |
| `assets/hf/smoke` | `dc27ea87-e076-4004-b8ac-5267c72c795e.mp4` |

Stare filmy teł projektów (`assets/higgsfield/basko-*`, `ksk-*`, `living-*`, `psy-*`, `gym-*`) usuń z repo po podmianie. `ink-*` zostaje.
