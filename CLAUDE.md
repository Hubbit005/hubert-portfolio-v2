# Portfolio Huberta – wersja 2

Statyczna strona bez kroku budowania. GitHub Pages serwuje gałąź `main`, folder `/ (root)`.
Adres: https://hubbit005.github.io/hubert-portfolio-v2/

Wersja 2 to kopia strony z repo `Hubbit005/hubert-portfolio`. Stare repo zostaje bez zmian, nie ruszaj go.

Cel wersji 2: efekt „wow” przez ruch: żywe tło reagujące na scroll i mysz, nowy kursor, ładniej pokazane projekty, nowa stopka i kilka realistycznych ujęć wideo z Higgsfielda. Zadania są w folderze `prompts/`, wykonuj je po kolei.

## Stos

- HTML, CSS, czysty JavaScript (moduły ES). Bez npm w działającej stronie, bez CDN.
- Biblioteki leżą lokalnie: `vendor/js/gsap.min.js`, `vendor/js/ScrollTrigger.min.js`, `vendor/js/lenis.min.js`, `vendor/three/three.module.min.js` (+ `vendor/three/addons`).
- Jedna pętla animacji: ticker GSAP (Lenis już jest do niego podpięty w `js/main.js`). Nie zakładaj osobnych `requestAnimationFrame`, jeśli da się użyć tickera.
- Nowe moduły dodawaj w `js/` (np. `background.js`, `cursor.js`, `cases-motion.js`, `footer.js`) i importuj w `js/main.js`.
- Style dopisuj do `css/main.css` w osobnych, opisanych sekcjach. Kolory i odstępy tylko z `css/tokens.css`.

## Czego nie zmieniać (zamrożone)

1. **Hero** (`#home`, `js/hero.js`, `js/roulette.js`): napis HUBERT w 3D, jego kolory i pomarańczowo-różowa poświata zostają bez zmian. Hubert to lubi. Od 7.11.2026 (decyzja Huberta, zadanie 09) hero jest odblokowane dla chromowanych ikon wokół napisu i dla wyglądu oraz fizyki ruletki (chrom, kulka, dźwięk). Logika wyboru projektu i karta wyniku zostają.
2. **Karuzela projektów** (`#work`, `js/carousel.js`): zostaje jak jest.
3. **Treść.** Każde zdanie po angielsku w `index.html` i po polsku w `js/i18n.js` zostaje słowo w słowo. Kolejność sekcji i projektów też.
4. **Kotwice** (`#basko-clean`, `#ksk-pretor`, `#ksk-3d-model`, `#ksk-video`, `#livingroom`, `#psychologist-site`, `#smaller-projects`, `#training-plans`, `#this-portfolio` i sekcje z menu). Używa ich karuzela, ruletka i menu.
5. **Paleta.** Ciemny motyw jest domyślny. Akcent `--accent`, poświata `--glow-rgb`. Bez nowych kolorów marki.

## Twarde zasady treści

- **Żadnych nowych liczb:** statystyk, procentów, liczników, „lat doświadczenia”, wyników. Hubert nie ma danych, a strona nie może zawierać nic nieprawdziwego.
- Nowy tekst tylko tam, gdzie wymaga go zadanie (np. etykiety i przyciski z promptu). Zawsze w parze EN w `index.html` i PL w `js/i18n.js`, w stylu istniejących kluczy.
- Elementy czysto dekoracyjne mają `aria-hidden="true"`.

## Dostępność i ruch

- `prefers-reduced-motion: reduce`: wszystkie nowe efekty mają wersję statyczną, a treść jest widoczna od razu. Wzór: `js/motion.js`.
- Strona działa i wszystko widać bez JS (klasy `no-js` / `js` w `<html>`).
- Urządzenia dotykowe (`hover: none` / `pointer: coarse`): bez własnego kursora i bez efektów zależnych od najechania myszą.
- Klawiatura: widoczny focus, nic nie łapie fokusu, kolejność tabulacji bez zmian.
- Kontrast tekstu nie może spaść przez nowe tło (WCAG AA).

## Wydajność (budżet)

- Lighthouse mobile: Performance ≥ 90, CLS < 0,1. Zmierz przed i po każdym zadaniu.
- Animuj tylko `transform`, `opacity`, `clip-path` i uniformy shaderów.
- WebGL: `devicePixelRatio` maks. 1,5, tło renderowane w obniżonej rozdzielczości, pauza, gdy karta jest ukryta.
- Słabe urządzenie albo brak WebGL: zostaje obecne tło CSS (`.glow`).
- Obrazy: zostają `loading="lazy"`, wymiary i `srcset`. Bez nowych ciężkich plików bez potrzeby.

## Sposób pracy

- Jedno zadanie z `prompts/` = jeden commit z opisem po polsku. Po każdym commicie push.
- Przy każdej zmianie JS lub CSS podbij wersję `?v=RRRRMMDD` (jedna wartość w `index.html` i we wszystkich importach w `js/`; `vendor/` bez wersji).
- Przed pierwszym zadaniem zrób zrzuty ekranu obecnej strony (stan wyjściowy) Playwrightem i trzymaj je poza repo.
- Po każdym zadaniu sprawdź Playwrightem: 1440×900 i 390×844, EN i PL (`#pl`), z i bez reduced motion. Konsola bez błędów.
- Nie pytaj Huberta o rzeczy opisane w tym pliku albo w promptach. Pytaj tylko, gdy coś wymagałoby zmiany treści, dodania faktu albo wydania pieniędzy.

## Nigdy

- Nie wrzucaj do repo prywatnych materiałów Huberta (CV, przygotowania do rozmów, notatki, dane osobowe). Repo jest publiczne.
- Płatne generacje (Higgsfield) tylko w zadaniu `prompts/06-higgsfield.md` i tylko według jego listy. Najpierw wycena wszystkich generacji, potem jedna zgoda Huberta, dopiero potem generowanie. Twardy limit na cały projekt: 1000 kredytów Higgsfield. Inne płatne narzędzia: nie używaj.
- Nie commituj surowych plików z generatorów (`assets/higgsfield/raw/`), tylko skompresowane wersje na stronę.
- Bez `git push --force` i bez przepisywania historii.
- Nie zmieniaj repo `Hubbit005/hubert-portfolio`.

## Raportowanie

Hubert jest Polakiem i często słucha odpowiedzi zamiast je czytać. Raporty pisz po polsku, krótko i prostymi zdaniami: co zrobione, co sprawdzone, co zostało.
