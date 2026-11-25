# Raport testów i optymalizacji – listopad 2026

Data: 25.11.2026. Gałąź: `claude/optymalizacja`. Zakres: `index.html` i pięć stron projektów w `work/`.

## Wnioski

- Cel osiągnięty: każda strona ma co najmniej 99 punktów we wszystkich czterech kategoriach Lighthouse, na telefonie i na komputerze.
- Wygląd, animacje, fizyka kursora, kryształ i scroll są bez zmian. Wszystkie poprawki działają pod loaderem albo poza pierwszym ekranem.
- Dwa punkty z listy nie dają się zrobić bez zmiany wyglądu: obszar klikalny linków w „Selected Works” i blokujący CSS. Opis i propozycje są niżej.

## Metodyka

- Lokalny serwer Node z kompresją gzip, ścieżka `/hubert-portfolio-v2/`, strona 404 jak na GitHub Pages, cache 10 min.
- Lighthouse 12.8.2 (Chrome 158 headless), profil mobilny i desktopowy, każda strona dwa razy, po kolei. W tabeli: gorszy z dwóch wyników punktowych i gorsza wartość LCP, CLS, TBT i wagi.
- „Przed” to kopia gałęzi `main` z 25.11.2026 (commit `4de1171`), „po” to ta gałąź.
- Playwright 1.63, axe-core 4.14, html-validate 11.22. Testy w 1440×900 i 390×844, zrzuty w 360, 390, 768, 1280 i 1920 px (poza repo).

**Zastrzeżenie dla strony głównej.** Środowisko testowe nie ma karty graficznej. Strona celowo wyłącza wtedy scenę WebGL (`js/scene.js`, WebGL programowy = słabe urządzenie) i zostaje tło CSS. Wyniki Lighthouse dla `index.html` opisują więc wersję bez sceny, choć z pobraniem three.js. Pomiar ze sceną na prawdziwej karcie graficznej trzeba zrobić na komputerze Huberta (sekcja „Do sprawdzenia ręcznie”).

## Wyniki Lighthouse

P = Performance, A = Accessibility, BP = Best Practices, SEO.

### Telefon

| Strona | Przed (P / A / BP / SEO) | Po (P / A / BP / SEO) | LCP | CLS | TBT | Waga strony |
|---|---|---|---|---|---|---|
| index.html | 97 / 100 / 100 / 100 | 99 / 100 / 100 / 100 | 1,81 s → 1,81 s | 0,028 → 0,028 | 166 → 61 ms | 292 → 292 KB |
| work/casanova.html | 99 / 100 / 100 / 100 | 99 / 100 / 100 / 100 | 1,81 s → 1,81 s | 0,010 → 0,010 | 0 → 0 ms | 406 → 329 KB |
| work/basko-clean.html | 100 / 100 / 100 / 100 | 100 / 100 / 100 / 100 | 1,73 s → 1,78 s | 0 → 0 | 0 → 0 ms | 438 → 438 KB |
| work/ksk-pretor.html | 99 / 100 / 100 / 100 | 100 / 100 / 100 / 100 | 1,81 s → 1,65 s | 0 → 0 | 0 → 0 ms | 849 → 837 KB |
| work/livingroom.html | 100 / 100 / 100 / 100 | 100 / 100 / 100 / 100 | 1,73 s → 1,73 s | 0,006 → 0,006 | 0 → 0 ms | 167 → 168 KB |
| work/agata-patelka.html | 100 / 100 / 100 / 100 | 100 / 100 / 100 / 100 | 1,50 s → 1,50 s | 0 → 0 | 0 → 0 ms | 97 → 98 KB |

### Komputer

| Strona | Przed (P / A / BP / SEO) | Po (P / A / BP / SEO) | LCP | CLS | TBT | Waga strony |
|---|---|---|---|---|---|---|
| index.html | 99 / 100 / 100 / 100 | 100 / 100 / 100 / 100 | 0,42 s → 0,42 s | 0,065 → 0 | 0 → 0 ms | 292 → 292 KB |
| work/casanova.html | 100 / 100 / 100 / 100 | 100 / 100 / 100 / 100 | 0,40 s → 0,40 s | 0 → 0 | 0 → 0 ms | 196 → 197 KB |
| work/basko-clean.html | 100 / 100 / 100 / 100 | 100 / 100 / 100 / 100 | 0,46 s → 0,44 s | 0 → 0 | 0 → 0 ms | 219 → 219 KB |
| work/ksk-pretor.html | 100 / 100 / 100 / 100 | 100 / 100 / 100 / 100 | 0,40 s → 0,37 s | 0 → 0 | 0 → 0 ms | 1592 → 1592 KB |
| work/livingroom.html | 100 / 100 / 100 / 100 | 100 / 100 / 100 / 100 | 0,38 s → 0,38 s | 0 → 0 | 0 → 0 ms | 138 → 138 KB |
| work/agata-patelka.html | 100 / 100 / 100 / 100 | 100 / 100 / 100 / 100 | 0,37 s → 0,36 s | 0 → 0 | 0 → 0 ms | 118 → 118 KB |

Spadek TBT na stronie głównej (166 → 61 ms) mieści się w rozrzucie między przebiegami; nie przypisujemy go poprawkom.

## Znalezione problemy

### Naprawione

| # | Problem | Poprawka |
|---|---|---|
| 1 | CLS 0,065 na stronie głównej (komputer): tekst zastępczy napisu przeskakuje, gdy podmienia się na glify. | Tekst zastępczy jest niewidoczny, dopóki trwa loader i glify się nie wczytały (`css/main.css`, sekcja „Napisy z glifów”). Bez JS i przy błędzie glifów tekst jest widoczny jak wcześniej. |
| 2 | Wideo na podstronach dostawało `src` przy starcie strony i pierwszy film konkurował o łącze z obrazami pierwszego ekranu. | `src` ustawiany dopiero przy wejściu wideo na ekran i po zejściu loadera (`js/work.js`). `preload="none"` bez zmian. |
| 3 | Komputer pobierał duży plik wideo także tam, gdzie wystarcza mały. | Rozmiar pliku wybierany według faktycznej szerokości panelu na ekranie. Pionowe rolki na torze poziomym biorą wersję 520 zamiast 720 (np. rolka KSK przy zwykłej gęstości ekranu: 728 KB zamiast 1,12 MB; na ekranach Retina zostaje 720). |
| 4 | Plakaty wideo 1850 px ładowane na telefonie. | Nowe plakaty 960 px w WebP i `srcset` (Casanova ×3, KSK ×1). Casanova na telefonie: 406 → 329 KB. |
| 5 | Element LCP bez `fetchpriority="high"` (Livingroom) albo z `loading="lazy"` (plakat Agaty Patelki na pierwszym ekranie). | Dodane `fetchpriority="high"`, plakat Agaty bez leniwego ładowania. Audyt „LCP request discovery” przechodzi. |
| 6 | Plakaty drugiego panelu (Basko, KSK) ładowane od razu, choć są poza ekranem na telefonie i komputerze. | `loading="lazy"`. |
| 7 | Scena WebGL renderowała także przy ukrytej karcie, jeśli przeglądarka nie wstrzymała `requestAnimationFrame`. | Warunek `document.hidden` w pętli sceny (`js/main.js`). Test: 32 wywołania rysowania na sekundę przed, 0 po. |
| 8 | axe „region”: przełącznik EN / PL poza punktami orientacyjnymi strony. | Przełącznik jest elementem `<nav aria-label="Language">` (`js/i18n.js`). Wygląd bez zmian. |
| 9 | Brak `og:description` na pięciu podstronach. | Dodane, z istniejącego opisu `meta description`. Bez nowego tekstu. |
| 10 | `sitemap.xml` bez strony Casanova. | Dodana; daty `lastmod` zaktualizowane. |
| 11 | `vendor/js/lenis.min.js` wskazywał na nieistniejący plik mapy źródeł (404 w narzędziach deweloperskich). | Usunięty komentarz `sourceMappingURL`. |
| 12 | Wersja plików CSS i JS. | Podbita do `?v=20261203` we wszystkich HTML i importach (także w `404.html`, który miał starą). |

### Nienaprawione i powody

| # | Problem | Dlaczego nie | Propozycja |
|---|---|---|---|
| 1 | **Target size** w „Selected Works” (komputer). Linki mają 22 px wysokości przy 1440 px (19,6 px przy 1280). Wiersze stoją co 22 px. | Wymóg to 24 px albo 24 px odstępu między środkami. Każde powiększenie obszaru (padding, `::after`) nachodzi na sąsiedni link i axe dalej zgłasza błąd. Problem znika dopiero od ok. 1570 px szerokości okna. Bez zmiany odstępu wierszy nie da się tego spełnić. Lighthouse nie łapie tego przy starcie, bo sekcja jest wtedy niewidoczna; axe po przewinięciu do sekcji tak. | `line-height: max(24px, calc(22 * var(--u)))` w `.works__list`. Lista urośnie o 8 px przy 1440 px. Wymaga zgody Huberta. |
| 2 | **Render-blocking CSS** (ok. 150 ms na telefonie). | Blokują tylko `tokens.css` i `main.css`. Skrypty już są `defer` lub `type="module"`, fonty mają `preload` i `font-display: swap`. Lighthouse szacuje zysk na 0 ms na telefonie i 40 ms na komputerze, bo pierwszy ekran i tak czeka na glify. Wstawienie całego CSS do HTML powieliłoby 15 KB w 7 plikach i złamało zasadę jednego źródła tokenów. Asynchroniczny CSS pod loaderem dałby przeskoki układu (CLS). | Bez zmian. |
| 3 | **KSK na komputerze waży 1,6 MB.** 1,38 MB to pierwszy film (`01-film-de-1850.mp4`). | Panel z filmem ma ok. 1450–1520 px szerokości na komputerze, więc wersja 960 byłaby wyraźnie rozmyta. Desktop nie pobiera już wersji większej, niż potrzeba (punkt 3 wyżej). | Ponowne kodowanie filmu z wyższą kompresją albo w AV1 z MP4 jako zapasem. To zmiana jakości obrazu, więc decyzja Huberta. |
| 4 | CLS 0,028 na stronie głównej (telefon). | Przesunięcie powstaje, gdy włącza się tryb przewijania sekcji (`html.motion`) pod zasłoną loadera. Wynik jest daleko od progu 0,1. Zmiana wymagałaby przebudowy startu animacji. | Bez zmian. |
| 5 | three.js bez mapy źródeł i z nieużywanym kodem (ok. 115 KB). | Plik z `vendor/` w wersji zminifikowanej. Audyt jest informacyjny i nie obniża wyniku. | Ewentualnie własna, przycięta kompilacja three.js. |
| 6 | Tytuł i opis strony zostają po angielsku w wersji PL. | Przełącznik zmienia `lang` i teksty, ale nie `<title>` i `meta description`. Wyszukiwarki indeksują wersję EN. Polski tytuł i opis to nowy tekst, a zadanie go nie przewiduje. | Jeśli wersja PL ma być w Google, potrzebne osobne adresy PL i tłumaczenie `title` i `description`. |
| 7 | `robots.txt` w repozytorium nie działa dla wyszukiwarek. | Roboty czytają tylko `hubbit005.github.io/robots.txt`, a strona leży w podkatalogu. Plik jest poprawny, ale wpis `Sitemap` nie zostanie odczytany. | Zgłosić `sitemap.xml` w Google Search Console. |
| 8 | `devicePixelRatio` sceny do 3, a `CLAUDE.md` mówi o maks. 1,5. | Komentarz w `js/scene.js` opisuje to jako świadomą decyzję (rozmyte napisy przy 1,5). Zadanie zabrania zmian w krysztale. | Ujednolicić zapis w `CLAUDE.md` albo w kodzie. |

## Pozostałe testy

| Obszar | Wynik |
|---|---|
| Błędy konsoli i błędy sieci (4xx/5xx) | 0 na 6 stronach, EN i PL, 1440 i 390 px, po przewinięciu całej strony. |
| Linki wewnętrzne | Wszystkie działają (5 projektów, 5 linków CLOSE z parametrem `?w=`, mail). Na stronach nie ma linków do stron klientów. |
| Linki zewnętrzne | Instagram `jzf_designe` i LinkedIn mają poprawne adresy, ale sieć środowiska testowego blokuje te domeny (oraz github.io). Do sprawdzenia ręcznie. |
| Walidacja HTML (html-validate) | Brak błędów składni. Dwie uwagi stylistyczne: `<!doctype html>` małymi literami (poprawne w HTML5) i `aria-label` na `<video>` (dozwolone, reguła tylko odradza). Bez zmian. |
| Duplikaty `id`, brak `alt` | Brak. Obrazy dekoracyjne mają `alt=""`. |
| Wymiary i ładowanie obrazów | Wszystkie `<img>` mają `width` i `height`. Poza pierwszym ekranem `loading="lazy"`. `fetchpriority="high"` tylko na pierwszym obrazie strony. Na stronie głównej to kryształ, na który czeka loader; staje się elementem LCP, gdy scena WebGL jest wyłączona. |
| SEO | Unikalne `<title>` i `meta description` na każdej stronie, `canonical` z pełnym adresem, `og:image` 1200×630, `lang` zmienia się z wersją językową, `sitemap.xml` z pełnymi adresami github.io, strona 404 zwraca kod 404 i ma `noindex`. |
| axe-core | 0 naruszeń na 6 stronach i stronie 404 (po poprawce przełącznika języka). |
| Klawiatura | Kolejność: linki treści, potem EN / PL; na podstronach CLOSE, EN, PL. Każdy element ma widoczny wskaźnik focusu (tęczowa linia albo obrys). Nic nie łapie fokusu. |
| `prefers-reduced-motion` | Bez Lenisa i bezwładnego scrolla, bez toru poziomego, bez sceny WebGL, loader bez obrotu, wideo zatrzymane z kontrolkami i plakatem. Treść widoczna od razu. |
| Responsywność | Zrzuty 360, 390, 768, 1280 i 1920 px dla strony głównej i KSK: brak poziomego scrolla. Na telefonie kryształ leży częściowo pod tekstem; to zamierzony układ z cieniem tekstu dla kontrastu. |
| Płynność scrolla (komputer, 5 s kółkiem, trace) | Strona główna z tłem CSS: 60 kl./s, 0 długich zadań. KSK, tor poziomy: 60 kl./s, 0 długich zadań. Scena WebGL liczona programowo (bez karty graficznej): ok. 3 kl./s i zadania po ok. 340 ms. Ten wynik nie mówi nic o prawdziwym sprzęcie i dlatego strona w takich warunkach wyłącza scenę. |
| Pauza sceny | Karta w tle: 0 klatek. Poza ekranem: nie dotyczy, bo płótno sceny jest przypięte do całego okna i zawsze widoczne. Podstrony nie mają WebGL. |

## Znane ograniczenia GitHub Pages

- Cache plików ustawiony na 10 minut (`max-age=600`) bez możliwości zmiany. Lighthouse zgłasza to jako „uses-long-cache-ttl”. Wersjonowanie `?v=` zapewnia świeże pliki po wdrożeniu.
- Brak własnych nagłówków HTTP: Content-Security-Policy, X-Frame-Options, Strict-Transport-Security. Domena github.io jest na liście HSTS preload przeglądarek, więc HTTPS i tak jest wymuszony, ale strona nie ustawi własnej polityki.
- Nie obchodzimy tych ograniczeń (np. przez `<meta http-equiv>`), zgodnie z założeniem zadania.

## Do sprawdzenia ręcznie

1. Kliknąć linki Instagram i LinkedIn na opublikowanej stronie.
2. Na komputerze z kartą graficzną: Chrome DevTools, zakładka Performance, 5 s scrolla na stronie głównej ze sceną. Oczekiwane: blisko 60 kl./s i brak długich zadań w trakcie przewijania.
3. Decyzja w sprawie punktów 1 i 3 z tabeli „Nienaprawione”.
