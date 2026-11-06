# Zadanie 03 – Ładniej pokazane projekty (sekcja Case studies)

Karuzela w `#work` zostaje bez zmian. To zadanie dotyczy sekcji `#cases`: Basko Clean, KSK Pretor (z modelem 3D i filmem), Livingroom, strona dla Agaty Patelki, mniejsze projekty (plany treningowe). Treść, kolejność i kotwice bez zmian. Zmieniasz sposób pokazania i ruch. Nowy moduł `js/cases-motion.js`.

## 1. Spis projektów (`.case-index`)

Zamień zwykłą listę w duży, interaktywny spis:
- duże nazwy projektów (font display, szeroki), cienka linia pod każdą, numer porządkowy 01–06 w mono (to numeracja, nie statystyka),
- po najechaniu: linia wypełnia się akcentem od lewej, nazwa lekko przesuwa się w prawo, a obok kursora pojawia się okładka projektu (pliki z `assets/cards/`). Okładka płynnie podąża za myszą, przy zmianie pozycji obrazy się przenikają,
- „Strona dla Agaty Patelki” nie ma zdjęcia: użyj okładki typograficznej z karuzeli (`.type-cover--psy`),
- „Mniejsze projekty” → `assets/cards/training.*`, „To portfolio” → bez okładki, tylko linia,
- na dotyku: bez pływającej okładki, zwykła lista z dużymi nazwami.

## 2. Nagłówki projektów

- Tytuł (`.case__title`) wjeżdża literami z maski, z małym opóźnieniem między literami (tylko wersja wizualna, czytniki ekranu dostają cały tekst bez zmian).
- Lista faktów (`.facts`) i „Co zrobiłem” pojawiają się kaskadą.

## 3. Duże zrzuty w ramce przeglądarki (`.shot--browser`)

Przy wjeździe na ekran zrzut startuje lekko pochylony do tyłu w 3D (`rotateX` ok. 14°, skala 0,9, `perspective` na rodzicu) i prostuje się, gdy dochodzi do środka ekranu (scrub). Obecna paralaksa obrazu w środku zostaje.

## 4. Galerie (`.gallery`)

- Zdjęcia odsłaniają się przez `clip-path` od dołu, kaskadą.
- Po najechaniu: karta unosi się o kilka pikseli, obraz powiększa się do ok. 1,04, cień rośnie.

## 5. KSK Pretor (sekcja ciemna)

- Wejście w sekcję: łagodne przyciemnienie (zgrane z nastrojem tła z zadania 01).
- Zrzuty modelu 3D (`.state-shots`) pojawiają się jeden po drugim, z lekkim obrotem.
- Kadry filmu (`.film-strip`) jadą powoli w poziomie jak taśma filmowa, w nieskończonej pętli. Zatrzymanie po najechaniu i przy fokusie. Kopie obrazów potrzebne do pętli mają `aria-hidden` i puste `alt`.

## 6. Ścieżka zakupu w projekcie dla psychologa (`.flow`)

Linia łącząca kroki 1→4 rysuje się wraz ze scrollem (SVG albo `scaleX`). Każdy krok zapala się akcentem, gdy linia do niego dojdzie. Gałąź „Zarezerwuj termin” pojawia się na końcu.

## 7. Plany treningowe (`.phones`)

Dwa telefony unoszą się z przeciwną paralaksą (jeden w górę, drugi w dół) i są lekko obrócone, a przy dojściu do środka ekranu się prostują.

## Zasady

- Elementy, które już są na ekranie przy załadowaniu, nie znikają i nie migają (wzór: `js/motion.js`).
- Bez przesunięć układu (CLS). Wymiary obrazów bez zmian.
- `prefers-reduced-motion` i brak JS: wszystko widoczne od razu, bez ruchu.
- Telefon: efekty prostsze (bez 3D pochylenia, jeśli zacina).

Commit: `Projekty: interaktywny spis, odsłanianie zrzutów, taśma filmowa`
