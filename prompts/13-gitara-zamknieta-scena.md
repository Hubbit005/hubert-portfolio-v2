# Zadanie 13 – Zamknięta scena gitary, muzyka w tle, ruletka na środku

Decyzje Huberta z 7.11.2026. Jedna sesja, commit na punkt, na końcu jeden PR do `main`. Oszczędnie: Ponytail i Graphify jak w `CLAUDE.md`, testy tylko 1440×900 i 390×844 po angielsku, bez niezależnej recenzji.

## 1. Scena z gitarą jako zamknięta karta

- Po wejściu do sceny (zoom z małej gitary) reszta strony jest niedostępna: przewijanie strony zablokowane (Lenis `stop()`, `overflow: hidden` na `html`), wszystko poza sceną ma `inert`. Wyjście tylko przez „Back” albo `Esc`.
- **Przewinięcie w scenie uruchamia muzykę:** kółko myszy, gest palcem w górę/dół albo klawisze strzałek/PageDown w scenie nie przewijają strony, tylko włączają piosenkę (jeśli nie gra). Po każdym takim ruchu struny mocniej drgną (krótki impuls), jakby ktoś szarpnął.
- Fokus zostaje w scenie (Tab krąży między „Play/Pause” i „Back”).

## 2. Muzyka gra dalej po wyjściu

- „Back” wraca do hero, a **piosenka gra dalej**. Zatrzymuje się tylko przyciskiem pauzy albo po ukryciu karty przeglądarki (wtedy pauza, po powrocie nie wznawia sama).
- Przycisk w scenie: „Play” → w trakcie „Pause”, a po pauzie „Play” wznawia od miejsca zatrzymania (nie od początku). Pasek postępu zostaje.
- **Mała gitara w hero w trakcie grania:** leciutko się kołysze (obrót ±2–3°, unoszenie kilku px w rytm basu z analizatora), poświata pod nią pulsuje. Po pauzie wraca do spoczynku. Reduced motion: bez kołysania.
- **Przycisk pauzy przy małej gitarze:** mały okrągły przycisk z ikoną pauza/play obok małej sceny. Pojawia się po pierwszym uruchomieniu piosenki. Nowe teksty (aria-label):
  - EN „Pause music” / „Play music”
  - PL „Wstrzymaj muzykę” / „Włącz muzykę”
- Punkt startu piosenki ustawiany w jednym miejscu: atrybut `data-start` (sekundy) na elemencie audio. Wartość z punktu 4.

## 3. Ruletka na środku i przejście „Back” przez zanikanie

- Koło ruletki wyśrodkowane w poziomie w hero. Plansza zakładów i panel z monetami i wykresem po bokach, symetrycznie (desktop), albo pod kołem (telefon). Nic nie przesuwa koła ze środka.
- „Back” z ruletki: ruletka zanika (`opacity` do 0 i skala ok. 0,96, ok. 0,5 s), a napis HUBERT i ikony pojawiają się przez zanikanie. Bez obracania koła do poziomu.
- Otwieranie ruletki zostaje jak jest.

## 4. Piosenka

Plik: `assets/audio/song.webm` i `song.m4a` (nagranie Huberta, już w repo). `data-start`: **DO_UZUPELNIENIA** sekund.

Nie dodawaj żadnych nagrań z płyt ani utworów innych wykonawców.

## 5. Wersjonowanie, kontrola, PR

Podbij `?v=`. Sprawdź: blokada przewijania i `inert` w scenie, przewinięcie w scenie włącza muzykę, muzyka gra po „Back”, pauza/wznowienie z obu miejsc, kołysanie małej gitary, ruletka na środku na obu szerokościach, zanikanie po „Back”. Lighthouse mobile przed i po, wynik nie może spaść. PR do `main`, raport po polsku, krótko.
