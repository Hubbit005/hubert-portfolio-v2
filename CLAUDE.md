# Portfolio Huberta – wersja 3 (repo v2)

Statyczna strona bez kroku budowania. GitHub Pages serwuje gałąź `main`, folder `/ (root)`.
Adres: https://hubbit005.github.io/hubert-portfolio-v2/

Wersja 2 to kopia strony z repo `Hubbit005/hubert-portfolio`. Stare repo zostaje bez zmian, nie ruszaj go.

**Od 11.11.2026 (decyzja Huberta) obowiązuje wersja 3:** minimalistyczna strona w stylu dorianlods.com według projektu w Figmie. Brief: `prompts/16-dorian-brief.md`, zadanie: `prompts/17-dorian-budowa.md`. Brief zastępuje wszystkie wcześniejsze zadania (00–15) i reguły „Czego nie zmieniać” poniżej, jeśli są z nim sprzeczne. Kosmos, ruletka, gitara i karuzela znikają.

Kopie poprzednich wersji: gałęzie `backup/przed-kosmosem-2026-11-10` i `backup/przed-dorianem-2026-11-11`. Nie zmieniaj ich i nie usuwaj.

## Stos

- HTML, CSS, czysty JavaScript (moduły ES). Bez npm w działającej stronie, bez CDN.
- Biblioteki leżą lokalnie: `vendor/js/gsap.min.js`, `vendor/js/lenis.min.js`, `vendor/three/three.module.min.js` (+ `vendor/three/addons`).
- Jedna pętla animacji: ticker GSAP (Lenis już jest do niego podpięty w `js/main.js`). Nie zakładaj osobnych `requestAnimationFrame`, jeśli da się użyć tickera.
- Nowe moduły dodawaj w `js/` (np. `background.js`, `cursor.js`, `cases-motion.js`, `footer.js`) i importuj w `js/main.js`.
- Style dopisuj do `css/main.css` w osobnych, opisanych sekcjach. Kolory i odstępy tylko z `css/tokens.css`.

## Czego nie zmieniać (zamrożone)

1. **Projekt z briefu 16.** Układ, wymiary, teksty i ruch są zatwierdzone w Figmie. Zmiany tylko na prośbę Huberta.
2. **Paleta.** Czerń `#0A0A0C`, beż `#ECE6DC`, galaktyczny fiolet `#6B4FD8`, szary `#9A94A8`. Wszystkie akcenty świetlne w kolorach kryształu (tokeny `--light-*` w briefie 16, sekcja 2). Wartości tylko w `css/tokens.css`.
3. **Napisy ekspozycyjne** tylko z glifów `assets/font/glyphs.json` (odrysowane z próbki fontu Huberta). Nie podmieniaj ich na inny font.

## Twarde zasady treści

- **Żadnych nowych liczb:** statystyk, procentów, liczników, „lat doświadczenia”, wyników. Hubert nie ma danych, a strona nie może zawierać nic nieprawdziwego.
- Nowy tekst tylko tam, gdzie wymaga go zadanie. Od wersji 3 strona jest tylko po angielsku.
- Elementy czysto dekoracyjne mają `aria-hidden="true"`.

## Dostępność i ruch

- `prefers-reduced-motion: reduce`: wszystkie nowe efekty mają wersję statyczną, a treść jest widoczna od razu. Wzór: `js/motion.js`.
- Strona działa i wszystko widać bez JS (klasy `no-js` / `js` w `<html>`).
- Kursor: systemowy. Efekty kursora (budyń, rozmycie napisu, światło) tylko na desktopie (`hover: hover` i `pointer: fine`).
- Urządzenia dotykowe (`hover: none` / `pointer: coarse`): bez efektów zależnych od najechania myszą.
- Klawiatura: widoczny focus, nic nie łapie fokusu, kolejność tabulacji bez zmian.
- Kontrast tekstu nie może spaść przez nowe tło (WCAG AA).

## Wydajność (budżet)

- Lighthouse mobile: cel Performance ≥ 90, CLS < 0,1. Stan na 7.11.2026: 75–81. Żadna zmiana nie może obniżyć wyniku. Zmierz przed i po każdym zadaniu.
- Rzeczy spoza pierwszego ekranu (np. panel z gitarą) ładuj dopiero po interakcji albo przy zbliżaniu się do ekranu, nigdy przy starcie.
- Animuj tylko `transform`, `opacity`, `clip-path`, `stroke-dashoffset` i uniformy shaderów.
- Wideo przewijane scrollem: plakat jako pierwszy obraz, wideo dociągane po pierwszym malowaniu, osobny lżejszy plik na telefon.
- WebGL: `devicePixelRatio` maks. 1,5, tło renderowane w obniżonej rozdzielczości, pauza, gdy karta jest ukryta.
- Słabe urządzenie albo brak WebGL: zostaje obecne tło CSS (`.glow`).
- Obrazy: zostają `loading="lazy"`, wymiary i `srcset`. Bez nowych ciężkich plików bez potrzeby.

## Sposób pracy

- Nowa sesja Claude Code na każde zadanie (albo na parę zadań, jeśli prompt tak mówi).
- Oszczędzaj limit Huberta: na start każdej sesji włącz skill **Ponytail** (`/ponytail`, najmniej kodu) i używaj grafu **Graphify** zbudowanego tylko z `js/`, `css/`, `index.html` zamiast czytania całych plików. Instalacja i szczegóły w `prompts/17-dorian-budowa.md`, punkt 0.
- Jedno zadanie z `prompts/` = jeden commit z opisem po polsku (albo commit na punkt, jeśli prompt tak mówi). Po każdym commicie push. Na końcu pull request do `main`.
- Przy każdej zmianie JS lub CSS podbij wersję `?v=RRRRMMDD` (jedna wartość w `index.html` i we wszystkich importach w `js/`; `vendor/` bez wersji).
- Przed pierwszym zadaniem zrób zrzuty ekranu obecnej strony (stan wyjściowy) Playwrightem i trzymaj je poza repo.
- Po każdym zadaniu sprawdź Playwrightem tylko 1440×900 i 390×844, po angielsku. Reduced motion: sprawdzenie w kodzie. Konsola bez błędów.
- Recenzja: jedna runda niezależnej recenzji i jedna runda poprawek, bez kolejnych.
- Nie pytaj Huberta o rzeczy opisane w tym pliku albo w promptach. Pytaj tylko, gdy coś wymagałoby zmiany treści, dodania faktu albo wydania pieniędzy.

## Nigdy

- Nie wrzucaj do repo prywatnych materiałów Huberta (CV, przygotowania do rozmów, notatki, dane osobowe). Repo jest publiczne.
- W sesji Claude Code nie generuj niczego w Higgsfieldzie. Assety dostajesz jako gotowe, opłacone adresy w promptach. Nowe generacje zleca Hubert w osobnej rozmowie: najpierw wycena, potem jego zgoda.  Inne płatne narzędzia: nie używaj.
- Nie commituj surowych plików z generatorów (`assets/higgsfield/raw/`), tylko skompresowane wersje na stronę.
- Bez `git push --force` i bez przepisywania historii.
- Nie zmieniaj repo `Hubbit005/hubert-portfolio`.

## Raportowanie

Hubert jest Polakiem i często słucha odpowiedzi zamiast je czytać. Raporty pisz po polsku, krótko i prostymi zdaniami: co zrobione, co sprawdzone, co zostało.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- When graphify-out/graph.json exists, run `graphify query "<question>"` before your first grep, search or source-file read for a codebase question, and put this rule in every subagent prompt that explores code. Read raw files only for lines the graph or an earlier read already located. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
- A committed graphify-out/graph.json is rewritten whole on every build, so a large diff to it in a pull request is expected. Do not flag it as churn or suggest skipping the graph rebuild or its hooks.
