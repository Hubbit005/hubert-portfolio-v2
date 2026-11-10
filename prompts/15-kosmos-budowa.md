# 15 – Budowa: przebudowa kosmiczna

Przeczytaj najpierw `CLAUDE.md` i `prompts/14-kosmos-brief.md`. Brief jest zamknięty: nie pytaj Huberta o rzeczy, które tam są.

## 0. Start sesji

1. Włącz `/ponytail`. Zbuduj graf Graphify tylko z `js/`, `css/`, `index.html` (jak w `prompts/12-ruletka-kasyno-gitara.md`, punkt 0).
2. Wczytaj skill **scroll-craft** (`.claude/skills/scroll-craft/SKILL.md`) i pliki, do których odsyła: `references/worldflight.md`, `references/hero-depth.md`, `references/devices.md`, `references/verify.md`. Brief skopiuj z `prompts/14-kosmos-brief.md`. Kroki skilla dotyczące wywiadu i generowania assetów pomiń.
3. Skill ma własny silnik (`engine/scrollcraft.js` i `.css`). Użyj z niego tego, co potrzebne, ale strona zostaje przy zasadach z `CLAUDE.md`: bez npm i bez CDN w działającej stronie, jedna pętla animacji na tickerze GSAP, Lenis już podpięty w `js/main.js`.
4. Kopia stanu sprzed przebudowy jest na gałęzi `backup/przed-kosmosem-2026-11-10`. Nie zmieniaj jej.
5. Zrób Playwrightem zrzuty obecnej strony (1440×900 i 390×844) i zmierz Lighthouse mobile. Trzymaj poza repo.

## Assety (gotowe, opłacone)

Pobierz z adresów poniżej, skompresuj i zapisz w `assets/space/`. Surowe pliki tylko lokalnie.

| # | Asset | Adres | Uwagi |
|---|---|---|---|
| 1 | Rakieta 3D, GLB | [DO UZUPEŁNIENIA] | materiał chrom ustaw w Three.js; cel ≤ 600 kB po kompresji |
| 2 | Start rakiety, 16:9, 10 s | [DO UZUPEŁNIENIA] | przewijany scrollem; kodowanie z gęstymi klatkami kluczowymi według `references/assets.md` |
| 3 | Start rakiety, 9:16, 10 s | [DO UZUPEŁNIENIA] | wersja na telefon |
| 4 | Dolot do fioletowej mgławicy, 16:9, 10 s | [DO UZUPEŁNIENIA] | przejście do hero |
| 5 | 4 tła 2K: mgławice i galaktyki | [DO UZUPEŁNIENIA] | warstwy paralaksy, WebP/AVIF |
| 6 | 4 chromowane obiekty „drip” | [DO UZUPEŁNIENIA] | po jednym na stację, z przezroczystym tłem |

**Jeśli w tabeli zostało choć jedno [DO UZUPEŁNIENIA], zatrzymaj się i napisz o tym Hubertowi.** Nie zastępuj brakujących plików własnymi generacjami.

Reszta powstaje w kodzie, bez assetów: gwiazdy i pył (shader albo punkty Three.js), obiekt 3D w hero, moneta, konsola z dźwignią, naklejki, faliste przejścia, smuga rakiety.

## 1. Paleta i krój (commit 1)

- Nowe wartości w `css/tokens.css` według tabeli w briefie, dla motywu ciemnego i jasnego. `--accent` i `--glow-rgb` stają się fioletowe. Znajdź i usuń wszystkie pomarańczowe i różowe wartości wpisane na sztywno w `css/main.css` i w `js/`.
- Ujęcia z `assets/higgsfield/` i `assets/hf/`: fioletowe tonowanie w CSS (nakładka albo `filter`), bez podmiany plików.
- Krój ekspozycyjny do `vendor/fonts/` z plikiem licencji, `@font-face` w `tokens.css`, `font-display: swap`, podzbiór znaków łacińskich.

## 2. Intro: wyrzutnia i start (commit 2)

Nowa sekcja `#launch` przed `#home`.

- Ekran startowy: ciemna przestrzeń, rakieta na ziemi (plakat z pierwszej klatki wideo), strzałka w dół z lekkim ruchem, naklejka z monetą i mała konsola ze szczeliną i dźwignią.
- **Trzy równorzędne sposoby startu:** pierwszy ruch kółkiem, gest palcem albo klawisz strzałki; przeciągnięcie lub kliknięcie monety i dźwigni; przycisk dostępny z klawiatury.
- Po starcie strona jedzie sama do hero: `lenis.scrollTo` z czasem ok. 3,5–4 s, wideo startu i dolotu przewijane pozycją scrolla. W trakcie lotu dalsze kręcenie nie przyspiesza ani nie cofa. `Esc` i przycisk „Pomiń” kończą lot od razu w hero.
- Intro odtwarza się raz na sesję (`sessionStorage` w `try/catch`). Przy kolejnym wejściu, przy wejściu z kotwicą w adresie (np. `#basko-clean`) i przy `prefers-reduced-motion` strona zaczyna się od hero.
- Bez JS sekcji `#launch` nie widać.
- Wideo ładuj po pierwszym malowaniu. Pierwszy ekran to lekki plakat, żeby nie pogorszyć LCP.

Nowe teksty (EN w `index.html`, PL w `js/i18n.js`):

| EN | PL |
|---|---|
| Insert coin | Wrzuć monetę |
| Pull the lever | Pociągnij dźwignię |
| Scroll to launch | Przewiń, aby wystartować |
| Skip intro | Pomiń intro |

## 3. Hero (commit 3)

Według sekcji „Hero – decyzja” w briefie.

- Napis HUBERT nowym krojem, obiekt 3D na środku, ikony na elipsie i przycisk ruletki bez zmian w działaniu.
- Usuń kod bryły 3D napisu z zadania 10, jeśli jakiś został. `js/roulette.js`, `js/hero-panel.js` i scena z gitarą działają jak dotąd.
- Głębia według `references/hero-depth.md`: tło, napis, obiekt i ikony to osobne plany z różną prędkością ruchu. Na telefonie osobna kompozycja, nie pomniejszony desktop.
- Hero wyłania się z mgławicy na końcu lotu: bez twardego cięcia.

## 4. Świat i rakieta-przewodnik (commit 4)

- Jedno stałe tło na całą stronę w trybie worldflight: gwiazdy i pył z głębią, cztery tła z tabeli jako dalekie plany z paralaksą. Zastępuje obecne `js/background.js`. Zasady WebGL z `CLAUDE.md` obowiązują (DPR ≤ 1,5, pauza przy ukrytej karcie, wersja CSS dla słabych urządzeń).
- Rakieta GLB leci przez całą stronę: zmienia stronę ekranu między stacjami, obraca się zgodnie z kierunkiem i prędkością scrolla, zostawia fioletową smugę rysowaną scrollem (SVG `stroke-dashoffset`). W stopce ląduje.
- Na telefonie rakieta jest mniejsza i nie zasłania tekstu. Smuga może być uproszczona.

## 5. Stacje projektów i reszta sekcji (commit 5)

- Każdy projekt w `#cases` to stacja: przypięty pełnoekranowy nagłówek z dużym numerem porządkowym, nazwą projektu nowym krojem i własnym chromowanym obiektem z tabeli. Numer to numer kolejny stacji, nie statystyka.
- Między stacjami strona „dojeżdża” sama: jedno pociągnięcie kółkiem przenosi do nagłówka następnej stacji (snap ScrollTrigger, ok. 0,8–1,2 s). **W treści stacji scroll jest wolny**, bez snapu, żeby dało się spokojnie czytać.
- Tło stacji na przemian: ciemne (kosmos) i beżowe. Przejścia faliste (SVG), fala lekko reaguje na prędkość scrolla.
- Co najmniej cztery różne rodziny urządzeń scrollowych na stronie i nigdy to samo dwa razy z rzędu (zasada skilla, `references/devices.md`).
- Duże litery napisu HUBERT jako naklejki z białym obrysem pływają po bokach jasnych sekcji z paralaksą. Dekoracja, `aria-hidden="true"`.
- Etykiety i znaczniki w stylu naklejki: biały obrys, lekki obrót, odklejony róg przy najechaniu.
- Karuzela `#work`, treść, kolejność sekcji i kotwice bez zmian.
- Własny kursor na desktopie (`hover: hover` i `pointer: fine`): mały pierścień, który powiększa się nad elementami klikalnymi. Na dotyku kursor systemowy.
- Stopka: lądowanie rakiety, napis HUBERT nowym krojem.

## 6. Kontrola i PR (commit 6)

- Podbij `?v=` we wszystkich miejscach.
- Weryfikacja według `references/verify.md` skilla: pasek zrzutów z całej długości scrolla na 1440×900 i 390×844. Każdy stan czytelny, brak martwego scrolla, brak pustych ekranów, tekst nigdy nie niknie pod efektem.
- Sprawdź osobno: start trzema sposobami, „Pomiń”, drugie wejście w tej samej sesji, wejście z kotwicą, reduced motion, brak JS, klawiatura (focus widoczny, nic nie łapie fokusu), ruletka i scena z gitarą.
- Kontrast AA dla każdego tekstu na nowych tłach.
- Lighthouse mobile przed i po. Wynik nie może spaść. Jeśli spada, odchudź wersję mobilną (krótsze wideo, mniej warstw) i opisz, co wycięto.
- Jedna runda niezależnej recenzji (`/ponytail-review`) i jedna runda poprawek.
- PR do `main`. Raport po polsku, krótko: co zrobione, co sprawdzone, co zostało, wynik Lighthouse przed i po, lista decyzji [Z], które podjąłeś.
