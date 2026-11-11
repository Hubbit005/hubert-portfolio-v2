# Zadanie 18: wersja 3.1 – kontrola 1:1 i pull request

Hubert zatwierdził wygląd i zachowanie strony w prototypie z 11.11.2026. Kod prototypu to już gotowa strona: gałąź `claude/prototyp-v3-1`. **Nie przebudowuj strony i nie zmieniaj projektu.** Twoje zadanie to sprawdzić, że prawdziwa strona działa 1:1 jak prototyp, naprawić tylko błędy i otworzyć pull request do `main`.

Ten plik ma pierwszeństwo przed `prompts/16-dorian-brief.md` i `prompts/17-dorian-budowa.md` tam, gdzie są sprzeczne.

## 0. Oszczędzanie limitu (najpierw)

1. Graphify: `pip install graphifyy` (jeśli trzeba, z `--break-system-packages`), potem `graphify install --platform claude`.
2. Zbuduj graf samego kodu: `graphify update .` (bez API, tylko AST). Plik `.graphifyignore` wyklucza `vendor/`, `assets/`, `prompts/`, `work/`, `.claude/`. Graf ma ok. 35–40 węzłów.
3. Przed każdym szukaniem w kodzie używaj `graphify query`, `graphify explain`, `graphify path`. Całe pliki czytaj tylko, gdy graf wskaże konkretne miejsce.
4. Włącz `/ponytail` (najmniej kodu).

## 1. Stan zatwierdzony przez Huberta (nie zmieniać)

| Element | Wartość |
|---|---|
| Tło | `--bg: #050506`, prawie czarne |
| Światło | rozlane na cały ekran, słabe (`g * .05`, druga poświata `.028`); tylko fiolet, niebieski (`--light-blue: #4D6BFF`), czerwień (`--light-red: #FF2D3F`); bez zieleni, turkusu i bursztynu |
| Budyń | fala między sąsiadami + „palec” z bezwładnością (`K 30, C 2.4, WAVE 190, FK 55, FC 6.5`). Hubertowi bardzo się podoba: nie ruszać |
| Rozmycie napisu | narasta ok. 0,55 s, litery wracają ok. 4 s; czerwona podszewka z przodu, niebieska z tyłu |
| Font tytułów | Candle Shlop (glify w `assets/font/glyphs.json`, wersja demo) |
| Kryształ w hero | owal wokół całego „HUBERT SKONIECZNY”, 14 s na okrążenie, pochylenie −6°, zawsze przed literami, wielkość ±10% |
| Sekcje | Hero, Selected Works, Services, My Story, Socials (5 sekcji, `main` 700vh) |
| Services | 6 usług bez numeracji, siatka 3 × 2, cienka linia nad każdą |
| Socials | LinkedIn, Instagram `jzf_designe`, Mail |
| Języki | EN domyślnie, PL przełącznikiem „EN / PL” w lewym górnym rogu (`js/i18n.js`), wybór w localStorage |
| Strony projektów | proporcje Doriana: tekst x 63, y 232, szer. 300; taśma od x 420, y 79, wys. 737; karta 1075 × 737; zdjęcie i wideo w całości (`object-fit: contain`), nic nie ucięte |

## 2. Kontrola (Playwright, desktop 1440 × 900 i telefon 390 × 844)

Sprawdź i zrób zrzuty:
1. Hero: imię fontem Candle Shlop, kryształ płynie po owalu, rozmycie pod kursorem z powrotem ok. 4 s, światło bez zieleni.
2. Przewijanie przez 5 sekcji: przejścia, kryształ zatrzymuje się przy Selected Works, Services, My Story, Socials.
3. Hover na projekcie: kryształ obraca ścianę, zdjęcie widać przez szkło.
4. Wszystkie 4 strony projektów: karty nieucięte, **filmy** w kartach grają i mieszczą się w całości (w prototypie były zastąpione kadrami), kryształ z modelu `crystal.glb` (w prototypie był ośmiościan zastępczy).
5. EN/PL na stronie głównej i na 4 stronach projektów; po przełączeniu imię w hero dalej widoczne w scenie WebGL.
6. Fallback: `prefers-reduced-motion` i brak WebGL (statyczna poświata CSS, obrazek kryształu).
7. Konsola bez błędów. Lighthouse mobile: zapisz wynik przed i po.

Naprawiaj tylko błędy. Każdą decyzję spoza tego pliku oznacz [Z] w raporcie.

## 3. Pull request

1. Zaktualizuj `CLAUDE.md`: obowiązuje wersja 3.1 według tego pliku.
2. Commit po każdym punkcie, push na `claude/prototyp-v3-1`, bez force-push.
3. Otwórz jeden PR `claude/prototyp-v3-1` → `main` z opisem po polsku i zrzutami.
4. **Nie scalaj PR.** W opisie PR na górze: „Nie scalać przed zakupem licencji komercyjnej fontu Candle Shlop (alitdesign). Scalenie publikuje stronę na GitHub Pages.”

## 4. Raport dla Huberta (po polsku, krótko)

Link do PR, co sprawdzone, co naprawione, Lighthouse mobile przed i po, decyzje [Z], czego nie udało się zrobić.
