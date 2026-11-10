# 15 – Budowa: przebudowa kosmiczna

Przeczytaj najpierw `CLAUDE.md` i `prompts/14-kosmos-brief.md`. Brief jest zamknięty: nie pytaj Huberta o rzeczy, które tam są.

## 0. Start sesji

1. Włącz `/ponytail`. Zbuduj graf Graphify tylko z `js/`, `css/`, `index.html` (jak w `prompts/12-ruletka-kasyno-gitara.md`, punkt 0).
2. Wczytaj skill **scroll-craft** (`.claude/skills/scroll-craft/SKILL.md`) i pliki, do których odsyła: `references/worldflight.md`, `references/hero-depth.md`, `references/devices.md`, `references/verify.md`. Brief skopiuj z `prompts/14-kosmos-brief.md`. Kroki skilla dotyczące wywiadu i generowania assetów pomiń.
3. Skill ma własny silnik (`engine/scrollcraft.js` i `.css`). Użyj z niego tego, co potrzebne, ale strona zostaje przy zasadach z `CLAUDE.md`: bez npm i bez CDN w działającej stronie, jedna pętla animacji na tickerze GSAP, Lenis już podpięty w `js/main.js`.
4. Kopia stanu sprzed przebudowy jest na gałęzi `backup/przed-kosmosem-2026-11-10`. Nie zmieniaj jej.
5. Zrób Playwrightem zrzuty obecnej strony (1440×900 i 390×844) i zmierz Lighthouse mobile. Trzymaj poza repo.

## Assety (gotowe, opłacone 10.11.2026)

Pobierz z adresów poniżej, skompresuj i zapisz w `assets/space/`. Surowe pliki tylko lokalnie, poza repo. Jeśli któregoś adresu nie da się pobrać z tej sesji, zatrzymaj się i napisz o tym Hubertowi. Nie zastępuj plików własnymi generacjami.

### Wideo intro (Kling 3.0 pro)

| Plik | Adres | Uwagi |
|---|---|---|
| Start, 16:9, 10 s, **z dźwiękiem** | https://d8j0ntlcm91z4.cloudfront.net/user_3E4wjlRzfbqMlZMAqIWN6GaWkvD/hf_20261110_171119_7ac468d9-65f6-42d0-954c-1a90377ff74a.mp4 | Rakieta znika w mgławicy ok. 5–6 s; resztę przytnij. Dźwięk startu weź z tej ścieżki także dla wersji 9:16 |
| Start, 9:16, 10 s, bez dźwięku | https://d8j0ntlcm91z4.cloudfront.net/user_3E4wjlRzfbqMlZMAqIWN6GaWkvD/hf_20261110_171119_cac36b4b-e184-466b-a741-375bc8a55426.mp4 | Telefon |
| Dolot przez mgławicę do spokojnej przestrzeni, 16:9, 5 s | https://d8j0ntlcm91z4.cloudfront.net/user_3E4wjlRzfbqMlZMAqIWN6GaWkvD/hf_20261110_171119_0142be77-0c34-49cc-90b8-e7d317bf7afe.mp4 | Zaczyna się klatką, którą kończy się start. Kończy się tłem hero |
| Dolot, 9:16, 5 s | https://d8j0ntlcm91z4.cloudfront.net/user_3E4wjlRzfbqMlZMAqIWN6GaWkvD/hf_20261110_171119_0b1c4707-af8e-41e4-9d3d-b4f5cb36086f.mp4 | Telefon |

Kodowanie: MP4 H.264 + WebM VP9, desktop 1920×1080 (cel ≤ 4 MB za start, ≤ 2 MB za dolot), telefon 720×1280 (cel o połowę mniej), `-movflags +faststart`. Dźwięk AAC 128 kb/s.

### Zdjęcia (GPT Image 2.6, 2K)

| Plik | Adres | Użycie |
|---|---|---|
| Rakieta na wyrzutni, 16:9 | https://d8j0ntlcm91z4.cloudfront.net/user_3E4wjlRzfbqMlZMAqIWN6GaWkvD/hf_20261110_170736_64ce6a46-d771-4b65-8063-f9f076f16e5c.png | Plakat intro (pierwsza klatka wideo startu) |
| Rakieta na wyrzutni, 9:16 | https://d8j0ntlcm91z4.cloudfront.net/user_3E4wjlRzfbqMlZMAqIWN6GaWkvD/hf_20261110_170737_99b402a2-c442-4bb3-a8a3-bc04b394003c.png | Plakat intro, telefon |
| Mgławica, 16:9 | https://d8j0ntlcm91z4.cloudfront.net/user_3E4wjlRzfbqMlZMAqIWN6GaWkvD/hf_20261110_170738_5efee97b-8c55-407e-bdc6-8270d1f56efb.png | Wspólna klatka start/dolot; daleki plan |
| Mgławica, 9:16 | https://d8j0ntlcm91z4.cloudfront.net/user_3E4wjlRzfbqMlZMAqIWN6GaWkvD/hf_20261110_170736_627ee8dd-4a43-4205-90a7-ed8e02073a72.png | Telefon |
| Spokojna przestrzeń, 16:9 | https://d8j0ntlcm91z4.cloudfront.net/user_3E4wjlRzfbqMlZMAqIWN6GaWkvD/hf_20261110_170739_8a9c0f7a-42ca-490d-9a8d-f4f393249479.png | Tło hero (ostatnia klatka dolotu) |
| Spokojna przestrzeń, 9:16 | https://d8j0ntlcm91z4.cloudfront.net/user_3E4wjlRzfbqMlZMAqIWN6GaWkvD/hf_20261110_170736_fdf59dc4-d624-4f13-a13e-82c99fe3fc19.png | Tło hero, telefon |
| Galaktyka spiralna | https://d8j0ntlcm91z4.cloudfront.net/user_3E4wjlRzfbqMlZMAqIWN6GaWkvD/hf_20261110_170737_5fe40d05-279d-428c-9664-9abf3e4c3d7d.png | Daleki plan worldflight |
| Obłoki gazu, fiolet i beż | https://d8j0ntlcm91z4.cloudfront.net/user_3E4wjlRzfbqMlZMAqIWN6GaWkvD/hf_20261110_170736_d6a65238-a018-4d91-9a80-5aaa3c3840e7.png | Daleki plan worldflight |
| Chromowana planeta z pierścieniem | https://d8j0ntlcm91z4.cloudfront.net/user_3E4wjlRzfbqMlZMAqIWN6GaWkvD/hf_20261110_170737_d0690c7c-48ed-45a3-9f3e-6892e2ab4980.png | Daleki plan worldflight |
| Pole gwiazd z pasem galaktyki | https://d8j0ntlcm91z4.cloudfront.net/user_3E4wjlRzfbqMlZMAqIWN6GaWkvD/hf_20261110_170738_1eec0362-3af9-4c22-8a33-01aecb3da1d8.png | Daleki plan worldflight, najdalsza warstwa |

Na stronę: AVIF + WebP, szerokości 2560 i 1280, cel ≤ 250 kB za większy plik.

### Modele 3D (Meshy 7, GLB) i wycięte PNG tych samych obiektów

Modele bez tekstur mają dostać w Three.js materiał chromowy z fioletowo-niebieską iryzacją i mapą otoczenia (mgławica). PNG z przezroczystym tłem to wersja zastępcza: telefon, brak WebGL, reduced motion.

| Obiekt | GLB | PNG (przezroczyste tło) | Użycie |
|---|---|---|---|
| Rakieta (z teksturą PBR) | https://d8j0ntlcm91z4.cloudfront.net/user_3E4wjlRzfbqMlZMAqIWN6GaWkvD/hf_20261110_171231_378ca1ca-1dd1-471e-9adb-40fde18ab5dd.glb | https://d8j0ntlcm91z4.cloudfront.net/user_3E4wjlRzfbqMlZMAqIWN6GaWkvD/hf_20261110_171257_39f5a7b0-b226-4b08-b08b-7137a3f83d01.png | Przewodnik przez całą stronę |
| Planeta z pierścieniem, kapiący chrom | https://d8j0ntlcm91z4.cloudfront.net/user_3E4wjlRzfbqMlZMAqIWN6GaWkvD/hf_20261110_171140_65f2e8f5-7819-4195-a9d2-5392788be6ba.glb | https://d8j0ntlcm91z4.cloudfront.net/user_3E4wjlRzfbqMlZMAqIWN6GaWkvD/hf_20261110_171232_b0eb55ff-b0f1-4d6e-8ac9-519795816da6.png | **Obiekt hero** (domyślny) |
| Gwiazda czteroramienna, kapiący chrom | https://d8j0ntlcm91z4.cloudfront.net/user_3E4wjlRzfbqMlZMAqIWN6GaWkvD/hf_20261110_171143_5840527e-b9a1-48e7-a8da-f7b2d35f1b84.glb | https://d8j0ntlcm91z4.cloudfront.net/user_3E4wjlRzfbqMlZMAqIWN6GaWkvD/hf_20261110_171250_381e9d1d-a0d6-4163-a5ab-726becd822d4.png | Zapasowy obiekt hero; podmiana ma być jedną stałą w kodzie. Poza tym stacja |
| Asteroida | https://d8j0ntlcm91z4.cloudfront.net/user_3E4wjlRzfbqMlZMAqIWN6GaWkvD/hf_20261110_171145_17b9360f-c5bf-4cb3-93e3-8fb480454039.glb | https://d8j0ntlcm91z4.cloudfront.net/user_3E4wjlRzfbqMlZMAqIWN6GaWkvD/hf_20261110_171251_9f43ec16-17a0-4de5-af3b-f6dac43faf8b.png | Stacja |
| Satelita | https://d8j0ntlcm91z4.cloudfront.net/user_3E4wjlRzfbqMlZMAqIWN6GaWkvD/hf_20261110_171148_950ec126-9070-4ca2-a563-e10760bfd160.glb | https://d8j0ntlcm91z4.cloudfront.net/user_3E4wjlRzfbqMlZMAqIWN6GaWkvD/hf_20261110_171253_205eb947-4b86-4068-a055-2170e65884a3.png | Stacja |
| Księżyc | https://d8j0ntlcm91z4.cloudfront.net/user_3E4wjlRzfbqMlZMAqIWN6GaWkvD/hf_20261110_171151_9890cec6-ed31-46d8-a854-9955b0b1e958.glb | https://d8j0ntlcm91z4.cloudfront.net/user_3E4wjlRzfbqMlZMAqIWN6GaWkvD/hf_20261110_171254_c164a6d1-a5ea-4944-adaf-404e736435e3.png | Stacja |
| UFO | https://d8j0ntlcm91z4.cloudfront.net/user_3E4wjlRzfbqMlZMAqIWN6GaWkvD/hf_20261110_171153_f130d03f-17d0-4209-bf56-72f9f79cb2ad.glb | https://d8j0ntlcm91z4.cloudfront.net/user_3E4wjlRzfbqMlZMAqIWN6GaWkvD/hf_20261110_171256_23f3d136-e023-4d36-8e86-9c2003bbeaa4.png | Stacja |
| Hełm astronauty (tylko zdjęcie, bez GLB) | – | https://d8j0ntlcm91z4.cloudfront.net/user_3E4wjlRzfbqMlZMAqIWN6GaWkvD/hf_20261110_170745_fb6f5817-f7bd-4edf-80c3-26d5591aa6e5.png | Sekcja „O mnie” albo stopka; tło wytnij sam |

Modele GLB nie były oglądane w 3D, tylko ich zdjęcia źródłowe. Otwórz każdy i sprawdź siatkę. Jeśli model jest zepsuty (dziury, zlane krople), użyj PNG tego obiektu i wpisz to do raportu. GLB skompresuj (meshopt albo Draco, dekoder lokalnie w `vendor/`), cel ≤ 500 kB za model. Ładuj je dopiero przy zbliżaniu się do stacji, a rakietę i obiekt hero po pierwszym malowaniu.

Przydział obiektów do stacji: po jednym na projekt w kolejności z `index.html`, bez powtórzeń obok siebie.

Reszta powstaje w kodzie, bez assetów: gwiazdy i pył (shader albo punkty Three.js), przycisk LAUNCH, naklejki, faliste przejścia, smuga rakiety.

## 1. Paleta i krój (commit 1)

- Nowe wartości w `css/tokens.css` według tabeli w briefie, dla motywu ciemnego i jasnego. `--accent` i `--glow-rgb` stają się fioletowe. Znajdź i usuń wszystkie pomarańczowe i różowe wartości wpisane na sztywno w `css/main.css` i w `js/`.
- Ujęcia z `assets/higgsfield/` i `assets/hf/`: fioletowe tonowanie w CSS (nakładka albo `filter`), bez podmiany plików.
- Krój ekspozycyjny do `vendor/fonts/` z plikiem licencji, `@font-face` w `tokens.css`, `font-display: swap`, podzbiór znaków łacińskich.

## 2. Intro: wyrzutnia i start (commit 2)

Intro to pełnoekranowa nakładka `#launch` nad stroną, a nie odcinek scrolla. Dopóki trwa, strona pod spodem się nie przewija (Lenis `stop()`, reszta ma `inert`).

- Ekran startowy: plakat z rakietą na wyrzutni i jeden duży przycisk **LAUNCH** w stylu centrum kontroli lotów. Fokus klawiatury od razu na przycisku.
- **Start tylko przyciskiem** (klik, dotyk, Enter, spacja). Scroll, kółko i gesty niczego nie uruchamiają.
- Po kliknięciu: krótkie odliczanie 3–2–1 na przycisku, potem odtwarza się wideo startu z dźwiękiem, płynnie przechodzi w wideo dolotu do mgławicy, a to w hero. Łączny czas od kliknięcia do hero: ok. 7–9 s. Przejścia przez zanikanie na wspólnej klatce, bez twardych cięć.
- Dźwięk: ścieżka z wideo startu. Start następuje po kliknięciu, więc przeglądarka pozwoli odtworzyć dźwięk. Mały przycisk wyciszenia w rogu.
- Przycisk **Skip intro** widoczny od początku, a `Esc` robi to samo: od razu hero.
- Intro pokazuje się raz na sesję (`sessionStorage` w `try/catch`). Przy kolejnym wejściu, przy wejściu z kotwicą w adresie (np. `#basko-clean`) i przy `prefers-reduced-motion` strona zaczyna się od hero.
- Bez JS nakładki nie ma.
- Wydajność: pierwszy ekran to lekki plakat. Wideo zaczyna się pobierać po pierwszym malowaniu, żeby było gotowe do kliknięcia. Na telefonie pliki 9:16.

Nowe teksty (EN w `index.html`, PL w `js/i18n.js`):

| EN | PL |
|---|---|
| Launch | Start |
| Skip intro | Pomiń intro |
| Mute sound / Unmute sound | Wycisz dźwięk / Włącz dźwięk |

Napis na samym przycisku zostaje **LAUNCH** w obu językach (decyzja Huberta); polskie „Start” to etykieta dla czytników ekranu.

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

- Każdy projekt w `#cases` to stacja: przypięty pełnoekranowy nagłówek z dużym numerem porządkowym, nazwą projektu nowym krojem i własnym chromowanym obiektem 3D z tabeli, który obraca się ze scrollem. Numer to numer kolejny stacji, nie statystyka.
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
- Sprawdź osobno: start przyciskiem (mysz, dotyk, klawiatura), brak startu ze scrolla, „Skip intro”, wyciszenie, drugie wejście w tej samej sesji, wejście z kotwicą, reduced motion, brak JS, klawiatura (focus widoczny, nic nie łapie fokusu), ruletka i scena z gitarą.
- Kontrast AA dla każdego tekstu na nowych tłach.
- Lighthouse mobile przed i po. Wynik nie może spaść. Jeśli spada, odchudź wersję mobilną (krótsze wideo, mniej warstw) i opisz, co wycięto.
- Jedna runda niezależnej recenzji (`/ponytail-review`) i jedna runda poprawek.
- PR do `main`. Raport po polsku, krótko: co zrobione, co sprawdzone, co zostało, wynik Lighthouse przed i po, lista decyzji [Z], które podjąłeś.
