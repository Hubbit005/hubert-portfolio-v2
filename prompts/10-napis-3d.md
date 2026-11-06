# Zadanie 10 – Napis HUBERT jako jedna skręcona bryła 3D

Robisz to po zadaniu 09, w tym samym stylu chromu co ikony i ruletka. Decyzja Huberta z 7.11.

## Co usunąć

- Pomarańczowy prostokąt za literą B (`.hero__bar`) i pomarańczowe „kołki” po bokach napisu.
- Obecny napis z osobnych segmentów walca (`#cyl`, siatka z `js/hero.js`). Statyczny napis z `.cyl__static` zostaje jako wersja bez JS.

## Co zrobić

- **Jedna bryła:** słowo HUBERT jako jedna wytłoczona bryła 3D (ExtrudeGeometry albo TextGeometry z fontu Archivo w najszerszym wariancie, tak jak teraz). Font przekonwertuj raz offline do formatu dla three.js i zapisz w `vendor/`. Fazowane krawędzie (bevel).
- **Skręt jak lody Twister:** bryła jest skręcona spiralnie wokół swojej długiej osi (poziomej), jak lody na patyku Twister. Skręt to deformacja wierzchołków: kąt obrotu przekroju rośnie wzdłuż osi X, łącznie ok. 90–140° na całej długości. Napis ma być czytelny z przodu, a skręt widoczny na końcach.
- **Ruch:** napis delikatnie i bez przerwy się kręci. Skręt powoli „faluje” (zmiana kąta w czasie) i cała bryła lekko obraca się wokół osi pionowej (±15°), do tego lekkie unoszenie.
- **Jak reszta elementów:** napis zachowuje się jak chromowane ikony. Można go chwycić myszą i zakręcić (obrót z bezwładnością, który wygasa), a ikony się od niego odbijają. Po puszczeniu wraca płynnie na środek i do spokojnego ruchu.
- **Materiał:** chrom jak ikony i ruletka (`metalness` 1, niski `roughness`, `envMap` z `assets/hf/env-studio`), z odbiciami w kolorach `--accent` i różu.
- **Ruletka:** przycisk „Spin my work” działa jak dotąd. Przy otwieraniu ruletki napis się rozkręca, odpływa albo zmienia w koło. Wybierz najładniejsze przejście, które działa płynnie.
- **Telefon:** prostsza geometria (mniej segmentów), bez przeciągania, dotknięcie daje krótki obrót. Jeśli wynik Lighthouse na telefonie spada, na telefonie pokaż wersję statyczną z lekkim obrotem.
- **`prefers-reduced-motion`:** bryła nieruchoma, skręt zatrzymany.
- Dostępność bez zmian: `<h1>` z tekstem „Hubert” dla czytników ekranu zostaje.

## Kontrola

Zrzuty hero na 1440×900 i 390×844. Napis czytelny, nic nie zasłania przycisków. Lighthouse przed i po. Commit `Hero: napis HUBERT jako skręcona bryła 3D`, potem pull request do `main` i krótki raport po polsku.
