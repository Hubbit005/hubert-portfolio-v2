# 14 – Brief: przebudowa kosmiczna (dla skilla scroll-craft)

Ten plik to gotowy brief. Skill `scroll-craft` wymaga pliku `BRIEF.md`: skopiuj ten brief do jego obszaru roboczego i **nie przeprowadzaj wywiadu z Hubertem**. Odpowiedzi poniżej to jego słowa z 10.11.2026 albo decyzje oznaczone [Z] (założenie do potwierdzenia przy odbiorze).

Zadanie wykonawcze jest w `prompts/15-kosmos-budowa.md`.

## 1. Klimat

Kosmos i galaktyka, chrome drip, „aura”. Ciemna przestrzeń, galaktyczny fiolet, chromowane obiekty, w których odbija się światło. Do tego odrobina zabawy: przycisk startu jak w centrum kontroli lotów i naklejki.

Odniesienia (co bierzemy, a czego nie):

| Źródło | Bierzemy | Nie bierzemy |
|---|---|---|
| Rolka referencyjna (strona agencji, czerwień/czerń/krem) | Jeden obiekt 3D, który leci przez całą stronę i obraca się ze scrollem. Wstążka rysowana scrollem, łącząca sekcje. Przypięte pełnoekranowe panele z dużym numerem i własnym obiektem. Zmiana koloru tła między panelami | Kolory, teksty, układ 1:1 |
| dorianlods.com | Hero: ogromny ozdobny napis i jeden opalizujący obiekt 3D na środku, który nachodzi na litery i reaguje na mysz. Ciemne tło z ledwo widoczną poświatą. Mały opis pod napisem | Jego krój pisma (komercyjny), kształt jego obiektu |
| grink2025.dviga.marketing | Pomysł, że stronę uruchamia jedna fizyczna akcja na wejściu (u nas przycisk LAUNCH). Naklejki z białym obrysem i odklejonym rogiem. Własny kursor. Lekko zaokrąglona „rama” strony | Monetę i dźwignię, kreskówkowe postacie, czerwono-żółtą paletę |
| moblinks.fr | Faliste przejścia między sekcjami w różnych kolorach. Bardzo duża, gruba typografia. Wielkie litery-naklejki pływające po bokach z paralaksą. Ściana powtórzonego napisu jako tło | Paleta wielokolorowa, układ sklepu |

Zasada: bierzemy mechanizmy, nie wygląd. Żadnego kopiowania grafik, tekstów ani krojów z tych stron.

## 2. Podróż, sekcja po sekcji

1. **Intro – wyrzutnia.** Ciemna przestrzeń. Na środku chromowana rakieta na ziemi. Pod nią jeden duży przycisk **LAUNCH**. Odwiedzający ma się poczuć jak właściciel firmy kosmicznej, który wydaje zgodę na start. Bez monety, bez dźwigni, bez startu scrollem.
2. **Start.** Kliknięcie LAUNCH odpala rakietę. Rakieta odrywa się powoli, dym zostaje w dole, kamera leci z nią w górę w kosmos. Wszystko dzieje się samo, z dźwiękiem startu.
3. **Dolot do hero.** Rakieta wlatuje w fioletową mgławicę. Z mgławicy wyłania się hero: napis HUBERT, obiekt 3D, latające ikony.
4. **Lot przez projekty.** Dalszy scroll to podróż przez przestrzeń: gwiazdy, mgławice i galaktyki mijają kamerę. Projekty to stacje po drodze. Rakieta leci obok treści i zostawia smugę.
5. **O mnie, narzędzia, CV.** Spokojniejszy odcinek na beżowym tle.
6. **Kontakt i stopka – lądowanie.** Rakieta dolatuje i siada. Koniec podróży.

## 3. Krzywa energii

Cisza (wyrzutnia) → szczyt (start i lot) → wydech (hero) → równy rytm (stacje projektów, na przemian ciemne i jasne) → spokój (o mnie, CV) → małe domknięcie (lądowanie).

## 4. Co ma czuć odwiedzający i jeden moment do zapamiętania

Ciekawość na wejściu, potem zaskoczenie. **Moment do zapamiętania: start rakiety, po którym strona sama niesie użytkownika do napisu HUBERT.** Dalej ma być poczucie, że ktoś tu zadbał o każdy szczegół.

## 5. Ruch, którego nie ma nigdzie indziej (signature move)

Jedna chromowana rakieta jest przewodnikiem całej strony: startuje w intro, leci przez wszystkie sekcje, rysuje smugę łączącą stacje i ląduje w stopce. To ten sam obiekt od pierwszej do ostatniej klatki.

## 6. Jak daleko od „premium-minimal”

Zabawowo i maksymalistycznie w ruchu, ale porządnie w treści. Treść projektów ma się czytać bez wysiłku.

## 7. Jeden świat czy osobne sceny

**Jeden ciągły świat (worldflight)** jako tło całej strony. Na nim stacje projektów jako przypięte panele. Intro i dolot do hero to jeden nieprzerwany lot.

## 8. Assety

Gotowe, opłacone pliki z Higgsfielda są w tabeli w `prompts/15-kosmos-budowa.md`. Nie generuj niczego samodzielnie i nie używaj `scripts/kie.mjs`.

W repo są już ujęcia tła w `assets/higgsfield/` (basko, ksk, living, psy, gym, ink) i `assets/hf/`. Mają pomarańczowe światło. Zostają, ale dostają fioletowe tonowanie w CSS, bez nowych generacji. [Z]

## Paleta

Ulubione kolory Huberta: galaktyczny fiolet, czerń, beż, biel. Pomarańcz i róż znikają ze strony.

| Rola | Wartość [Z] | Użycie |
|---|---|---|
| Czerń kosmosu | `#07060b` | tło ciemnych sekcji |
| Głęboki fiolet | `#2a0f5c` | mgławice, gradienty, panele |
| Galaktyczny fiolet (akcent) | `#7b3cff` | przyciski, smuga rakiety, poświata |
| Jasny fiolet | `#b89cff` | tekst akcentowy na ciemnym tle |
| Beż | `#e9dfcc` | tło jasnych sekcji |
| Biel | `#f7f5f0` | tekst na ciemnym, karty |

Wartości ustaw w `css/tokens.css`. Dobierz je tak, żeby każdy tekst miał kontrast WCAG AA; jeśli trzeba, zmień odcień i opisz to w raporcie.

## Hero – decyzja

Hubert dopuścił rezygnację z napisu 3D na rzecz hero w duchu dorianlods.com. Robimy tak:

- Napis **HUBERT** płaski, ogromny, ozdobnym krojem ekspozycyjnym (gotycko-kaligraficznym), w kolorze bieli z lekkim ziarnem.
- Na środku jeden **opalizujący obiekt 3D**: model GLB z Higgsfielda (tabela assetów w zadaniu 15), materiał chrom z fioletowo-niebieską iryzacją ustawiony w Three.js. Nachodzi na litery, obraca się powoli, reaguje na mysz i na scroll.
- Latające chromowane ikony i wejście do ruletki zostają.
- Zadanie 10 (napis jako chromowana bryła 3D) jest anulowane.

Krój pisma: tylko na wolnej licencji (SIL OFL), plik lokalnie w `vendor/fonts/` razem z plikiem licencji. Propozycja [Z]: **Grenze Gotisch** (zmienna grubość). Jeśli nie da się go pobrać albo słabo wygląda w napisie HUBERT, wybierz inny krój OFL o podobnym charakterze i pokaż w raporcie zrzut. Krój służy tylko do napisu w hero i dużych nagłówków stacji. Tekst ciągły zostaje w Inter.
