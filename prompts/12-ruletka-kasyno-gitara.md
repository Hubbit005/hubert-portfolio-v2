# Zadanie 12 – Ruletka jak w kasynie, zwykły kursor, układ hero, mała gitara z zoomem, piosenka Huberta

Decyzje Huberta z 7.11.2026. Jedna sesja, punkty po kolei, commit na punkt, na końcu jeden PR do `main`.

**Hubertowi zostało mało limitu Claude. Rób jak najwięcej przy jak najmniejszym zużyciu:** czytaj tylko potrzebne fragmenty plików, pisz najkrótszy kod, który działa, bez nowych bibliotek, bez niezależnej recenzji (tylko własna kontrola z punktu 8).

## 0. Skille Ponytail i Graphify (obowiązkowe)

Hubert zainstalował te dwa skille i chce, żebyś ich użył.
- **Ponytail** (DietrichGebert/ponytail) każe pisać najmniej kodu i używać tego, co już jest (natywne elementy HTML, istniejące moduły). Włącz go na całą sesję (`/ponytail`). Jeśli go nie ma: `npx -y skills add DietrichGebert/ponytail --agent claude-code` (instaluje się do `.claude/skills/` w repo; skommituj ten folder, żeby kolejne sesje miały go od razu).
- **Graphify** robi z kodu graf, żebyś nie czytał całych plików. Jeśli go nie ma: `pip install graphifyy && graphify install`. Zbuduj graf **tylko z kodu**: `js/`, `css/`, `index.html` (bez `prompts/`, `assets/`, `vendor/`, `proto/`, bo dokumenty kosztują tokeny). Do szukania w kodzie używaj grafu zamiast grep/czytania całych plików. Dopisz `graphify-out/` do `.gitignore`.
- Jeśli instalacja się nie uda (sieć), pracuj dalej bez nich i napisz to w raporcie.

## 1. Zwykły kursor

Usuń własny kursor: `js/cursor.js`, jego import w `js/main.js`, style w `css/main.css` (w tym każde `cursor: none`) i atrybuty `data-cursor-*`. Zostaje kursor systemowy bez opóźnienia. Zwykłe `cursor: pointer` / `grab` na elementach klikalnych zostają.

## 2. Układ hero

- **Napis „Junior UX/UI Designer · AI-native”** (`.hero__role`) przenieś bezpośrednio nad akapit „I design and build websites…”, wyrównany do jego lewej krawędzi. Rola, akapit i przyciski tworzą jeden blok w lewym dolnym rogu hero.
- **Ikony chromowane tylko w elipsie wokół napisu HUBERT.** Granica fizyki to elipsa, nie prostokąt hero: środek ok. 50% szerokości i 41% wysokości hero, promienie ok. 47% szerokości i 36% wysokości. Ikony odbijają się od niej i od niej liczą powrót na orbity. Orbity też w elipsie (diament i karty, które teraz są na dole, przenieś do środka). Nic nie wchodzi na blok z rolą, akapitem i przyciskami ani pod menu. Telefon: ta sama zasada, elipsa nad blokiem tekstu.
- **Strzałka po prawej (`.hero-arrow`) znika.** Zastępuje ją mała gitara z punktu 3.

## 3. Mała gitara z piecem i zoom do sceny

- **Mała scena:** po prawej stronie dolnej części hero, symetrycznie do lewego bloku (rola, akapit, przyciski), na tej samej linii bazowej co przyciski. Gitara (ok. 170–200 px wysokości) oparta o piec (ok. 130–150 px), z obrazów, które już są (`assets/hf/guitar-900.webp`, `amp-700.webp`). Bez nowych grafik.
- **Podświetlenie:** całość lekko podświetlona od dołu: ciepła poświata `--glow-rgb` pod spodem i delikatne światło na dolnych krawędziach przedmiotów. Lekkie unoszenie w spoczynku.
- To jeden `<button>` z nazwą z istniejącego klucza `guitar.1` („Play something”), pod spodem mały podpis mono z tym samym kluczem. Hover/fokus: mocniejsza poświata i lekkie powiększenie.
- **Klik: zoom do środka.** Mała scena płynnie rośnie do pełnej sceny z gitarą (`#guitar`), a reszta hero oddala się i znika: `transform` + `clip-path` (technika FLIP od prostokąta małej sceny do pełnego ekranu), ok. 0,9 s, `--ease-out`. Przycisk „Back” i `Esc` robią zoom z powrotem do małej sceny. Poziomy tor z zadania 11 zastąp tym zoomem (usuń kod przesuwania, który przestaje być potrzebny). Reszta zasad z zadania 11 zostaje: `inert` na niewidocznej części, fokus, `#guitar` w adresie, pauza hero 3D w trakcie, reduced motion bez zoomu (przenikanie), bez JS zwykły blok.
- **Telefon:** mała scena ok. 110–130 px wysokości po prawej, przy przyciskach, bez zasłaniania tekstu. Gest przesunięcia z zadania 11 usuń, zostaje tap.
- Obrazy dużej sceny, kostka, dym i JS gitary ładują się dopiero przy pierwszym najechaniu, fokusie albo tapnięciu małej sceny.

## 4. Piosenka Huberta zamiast syntezy

- Pliki są już w repo: `assets/audio/song.webm` (Opus) i `assets/audio/song.m4a` (AAC), 2:29. Nagranie Huberta, wyczyszczone. Ładuj dopiero po kliknięciu „Play” (`preload="none"`).
- „Play” odtwarza piosenkę od początku, „Stop” zatrzymuje. Na przycisku cienki pasek postępu (bez nowego tekstu). Zatrzymanie jak dotąd: wyjście ze sceny, ukryta karta, „Stop”.
- Dźwięk przez Web Audio: `MediaElementAudioSourceNode` → istniejący `AnalyserNode` → wyjście. Animacje z zadania 11 dalej z analizatora: 6 strun drga według pasm częstotliwości (od basu do góry), piec drga, głośniki pulsują z basem, dioda kostki świeci.
- Usuń kod syntezy riffu (Karplus-Strong, nuty, przester), który przestaje być używany.
- Zmień podpis dla czytników ekranu `guitar.2`:
  - EN: „Electric guitar and amplifier. Press Play to hear a song I recorded on guitar.”
  - PL: „Gitara elektryczna i wzmacniacz. Naciśnij »Zagraj«, żeby usłyszeć utwór, który nagrałem na gitarze.”

## 5. Ruletka jak w kasynie, z monetami i statystyką

Zamiast losowania projektów: prawdziwa ruletka europejska. Wygląd chromu, kulka z fizyką i dźwięk z zadania 09 zostają.

- **Koło:** 37 kieszeni, numery 0–36 w kolejności koła europejskiego. Kolory: czerwone pola w `--accent`, czarne w ciemnym chromie, 0 w stonowanej zieleni (jedyny dodatkowy kolor, tylko na zero). Numery czytelne.
- **Zakład:** przed „Spin” gracz wybiera:
  - typ: jeden numer (wypłata 35:1) albo kolor czerwony/czarny (1:1),
  - stawkę: 10, 50 albo 100 monet.
  Numery jako mała plansza jak na stole w kasynie (0 + siatka 3×12), kolory jako dwa pola obok. Natywne `<input type="radio">` w `<fieldset>` (jeden przystanek tabulacji, strzałki zmieniają wybór).
- **Wynik wyznacza kieszeń, w której kulka naprawdę stanęła.** Karta wyniku zamiast „You landed on / Open project”: numer i kolor, „You win +X” albo „You lose −X”, przyciski „Spin again” i „Back”. To samo w `aria-live`.
- **Licznik monet** obok koła: start 1000, saldo animowane (odliczanie przy zmianie). Zapis w `localStorage` (w `try/catch`). Przy 0 monet przycisk „Get 1000 coins” zeruje grę.
- **Mały interaktywny wykres** obok licznika: dwa słupki SVG „Wins” i „Losses” (liczba wygranych i przegranych losowań gracza). Najechanie, fokus albo tapnięcie słupka pokazuje dymek z liczbą. Słupki rosną płynnie po każdym losowaniu. Bez bibliotek.
- **Przycisk w hero:** „Spin my work” zmień na „Play roulette”.
- Przeciąganie koła działa jak dotąd. Reduced motion: od razu wynik, bez animacji.
- Telefon: plansza zakładów, licznik i wykres pod kołem, wszystko klikalne palcem (cele ≥ 44 px, plansza może się przewijać w poziomie).
- Usuń kod, który przestaje być używany (wybór projektu, okładki, link do projektu, klucze i18n tylko od starej karty).

**Nowe teksty (EN w `index.html`, PL w `js/i18n.js`), tylko te:**

| EN | PL |
|---|---|
| Play roulette | Zagraj w ruletkę |
| Roulette (aria-label regionu) | Ruletka |
| Place your bet and press Spin (podpowiedź zamiast „Drag the wheel or press Spin”) | Postaw zakład i naciśnij Spin |
| Number | Numer |
| Red | Czerwone |
| Black | Czarne |
| Stake | Stawka |
| Coins | Monety |
| Wins | Wygrane |
| Losses | Przegrane |
| You win | Wygrywasz |
| You lose | Przegrywasz |
| Get 1000 coins | Weź 1000 monet |

„Spin”, „Spin again” i „Back” mają już klucze, użyj ich.

## 6. CLAUDE.md

Jest już zaktualizowany (ruletka jako gra, kursor systemowy, liczby w grze dozwolone, skille). Nic nie zmieniaj.

## 7. Wersjonowanie

Podbij `?v=` według `CLAUDE.md`.

## 8. Kontrola, PR, raport

Tanio: Playwright tylko 1440×900 i 390×844 po angielsku, PL tylko sprawdzenie kluczy, reduced motion w kodzie. Bez niezależnej recenzji.
- Kursor systemowy, w konsoli brak błędów.
- Ikony nie wychodzą z elipsy (sprawdź pozycje w JS, też po rzucie).
- Rola nad akapitem, mała gitara po prawej, zoom tam i z powrotem (mysz, Enter, Esc, tap).
- Piosenka: play, stop, postęp, struny i piec reagują, zatrzymanie przy wyjściu.
- Ruletka: 10 losowań, za każdym razem wynik = kieszeń kulki, saldo i wykres się zgadzają, saldo zostaje po odświeżeniu, „Get 1000 coins” przy zerze.
- Lighthouse mobile przed i po: wynik nie może spaść (usunięcie kursora i syntezy powinno pomóc).

PR do `main`. Raport po polsku, krótko: co zrobione, czy Ponytail i Graphify zadziałały, Lighthouse przed i po, co Hubert ma sprawdzić.
