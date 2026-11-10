# Portfolio Huberta – wersja 2

Statyczna strona bez kroku budowania. GitHub Pages serwuje gałąź `main`, folder `/ (root)`.
Adres: https://hubbit005.github.io/hubert-portfolio-v2/

Wersja 2 to kopia strony z repo `Hubbit005/hubert-portfolio`. Stare repo zostaje bez zmian, nie ruszaj go.

Cel wersji 2: efekt „wow” przez ruch. Od 10.11.2026 (decyzja Huberta) strona staje się podróżą kosmiczną: intro ze startem rakiety, lot do hero, dalej lot przez przestrzeń między projektami. Brief jest w `prompts/14-kosmos-brief.md`, zadanie w `prompts/15-kosmos-budowa.md`. Zadania 00–13 są wykonane, a zadanie 10 anulowane.

Budujesz skillem **scroll-craft** (`.claude/skills/scroll-craft/`, Nate Herk, MIT). Jego wywiad zastępuje gotowy brief. Jego generatora assetów (`scripts/kie.mjs`, Kie.ai) nie używaj.

Kopia strony sprzed przebudowy: gałąź `backup/przed-kosmosem-2026-11-10`. Nie zmieniaj jej i nie usuwaj.

## Stos

- HTML, CSS, czysty JavaScript (moduły ES). Bez npm w działającej stronie, bez CDN.
- Biblioteki leżą lokalnie: `vendor/js/gsap.min.js`, `vendor/js/ScrollTrigger.min.js`, `vendor/js/lenis.min.js`, `vendor/three/three.module.min.js` (+ `vendor/three/addons`).
- Jedna pętla animacji: ticker GSAP (Lenis już jest do niego podpięty w `js/main.js`). Nie zakładaj osobnych `requestAnimationFrame`, jeśli da się użyć tickera.
- Nowe moduły dodawaj w `js/` (np. `background.js`, `cursor.js`, `cases-motion.js`, `footer.js`) i importuj w `js/main.js`.
- Style dopisuj do `css/main.css` w osobnych, opisanych sekcjach. Kolory i odstępy tylko z `css/tokens.css`.

## Czego nie zmieniać (zamrożone)

1. **Hero** (`#home`, `js/hero.js`, `js/roulette.js`): działanie ruletki, chromowanych ikon i sceny z gitarą (zadania 09, 11, 12, 13) zostaje. Od 10.11.2026 hero jest odblokowane dla: nowego napisu HUBERT krojem ekspozycyjnym, opalizującego obiektu 3D na środku i fioletowej poświaty (brief, sekcja „Hero – decyzja”). Przed hero dochodzi sekcja `#launch`. Ikony są ostre, bez rozmycia, i poruszają się tylko w elipsie wokół napisu; głębię dają tylko wielkość i jasność. Od zadania 12 ruletka to gra kasynowa na numery i monety, a nie losowanie projektów.
2. **Karuzela projektów** (`#work`, `js/carousel.js`): zostaje jak jest.
3. **Sekcje pod hero** są odblokowane dla nowego układu i ruchu (stacje, faliste przejścia, tło worldflight), ale ich treść nie.
4. **Treść.** Każde zdanie po angielsku w `index.html` i po polsku w `js/i18n.js` zostaje słowo w słowo. Kolejność sekcji i projektów też. Wyjątki tylko według promptów (np. zadanie 11 usuwa blok „Where AI speeds me up” / „What I decide” i przenosi `#guitar` do hero).
5. **Kotwice** (`#guitar`, `#basko-clean`, `#ksk-pretor`, `#ksk-3d-model`, `#ksk-video`, `#livingroom`, `#psychologist-site`, `#smaller-projects`, `#training-plans`, `#this-portfolio` i sekcje z menu). Używa ich karuzela, ruletka i menu.
6. **Paleta.** Od 10.11.2026: galaktyczny fiolet, czerń, beż, biel (tabela w briefie). Pomarańcz i róż znikają. Wartości tylko w `css/tokens.css`: akcent `--accent`, poświata `--glow-rgb`. Bez innych kolorów marki.

## Twarde zasady treści

- **Żadnych nowych liczb:** statystyk, procentów, liczników, „lat doświadczenia”, wyników. Hubert nie ma danych, a strona nie może zawierać nic nieprawdziwego. Wyjątek: liczby w grze w ruletkę (numery, monety, wygrane i przegrane gracza), bo to stan gry, a nie fakty o Hubercie.
- Nowy tekst tylko tam, gdzie wymaga go zadanie (np. etykiety i przyciski z promptu). Zawsze w parze EN w `index.html` i PL w `js/i18n.js`, w stylu istniejących kluczy.
- Elementy czysto dekoracyjne mają `aria-hidden="true"`.

## Dostępność i ruch

- `prefers-reduced-motion: reduce`: wszystkie nowe efekty mają wersję statyczną, a treść jest widoczna od razu. Wzór: `js/motion.js`.
- Strona działa i wszystko widać bez JS (klasy `no-js` / `js` w `<html>`).
- Kursor: od 10.11.2026 własny kursor tylko na desktopie (`hover: hover` i `pointer: fine`), opis w zadaniu 15. Na urządzeniach dotykowych kursor systemowy.
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
- Oszczędzaj limit Huberta: na start każdej sesji włącz skill **Ponytail** (`/ponytail`, najmniej kodu) i używaj grafu **Graphify** zbudowanego tylko z `js/`, `css/`, `index.html` zamiast czytania całych plików. Instalacja i szczegóły w `prompts/12-ruletka-kasyno-gitara.md`, punkt 0.
- Jedno zadanie z `prompts/` = jeden commit z opisem po polsku (albo commit na punkt, jeśli prompt tak mówi). Po każdym commicie push. Na końcu pull request do `main`.
- Przy każdej zmianie JS lub CSS podbij wersję `?v=RRRRMMDD` (jedna wartość w `index.html` i we wszystkich importach w `js/`; `vendor/` bez wersji).
- Przed pierwszym zadaniem zrób zrzuty ekranu obecnej strony (stan wyjściowy) Playwrightem i trzymaj je poza repo.
- Po każdym zadaniu sprawdź Playwrightem tylko 1440×900 i 390×844, po angielsku. Polski: tylko sprawdzenie kluczy w `js/i18n.js` (bez zrzutów). Reduced motion: sprawdzenie w kodzie. Konsola bez błędów.
- Recenzja: jedna runda niezależnej recenzji i jedna runda poprawek, bez kolejnych.
- Nie pytaj Huberta o rzeczy opisane w tym pliku albo w promptach. Pytaj tylko, gdy coś wymagałoby zmiany treści, dodania faktu albo wydania pieniędzy.

## Nigdy

- Nie wrzucaj do repo prywatnych materiałów Huberta (CV, przygotowania do rozmów, notatki, dane osobowe). Repo jest publiczne.
- W sesji Claude Code nie generuj niczego w Higgsfieldzie. Assety dostajesz jako gotowe, opłacone adresy w promptach. Nowe generacje zleca Hubert w osobnej rozmowie: najpierw wycena, potem jego zgoda. Twardy limit na cały projekt: 1000 kredytów Higgsfield. Inne płatne narzędzia: nie używaj.
- Nie commituj surowych plików z generatorów (`assets/higgsfield/raw/`), tylko skompresowane wersje na stronę.
- Bez `git push --force` i bez przepisywania historii.
- Nie zmieniaj repo `Hubbit005/hubert-portfolio`.

## Raportowanie

Hubert jest Polakiem i często słucha odpowiedzi zamiast je czytać. Raporty pisz po polsku, krótko i prostymi zdaniami: co zrobione, co sprawdzone, co zostało.
