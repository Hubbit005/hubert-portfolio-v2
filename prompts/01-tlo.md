# Zadanie 01 – Żywe tło reagujące na scroll i mysz

Najważniejsze zadanie. Hubert chce, żeby przy przewijaniu w dół całe tło się przesuwało i żyło, a strona robiła efekt „wow”.

## Co zbudować

Jedno stałe tło na cały ekran (`position: fixed`, pod treścią, `pointer-events: none`), w WebGL (three.js z `vendor/three/`). Najprościej: jeden prostokąt na cały ekran z shaderem fragmentów. Nowy moduł `js/background.js`, start z `js/main.js`.

Tło ma trzy warstwy głębi, które przy scrollu przesuwają się z różną prędkością (paralaksa). Dzięki temu przewijanie wygląda jak ruch w przestrzeni:

1. **Daleka warstwa: plamy światła.** Miękkie, płynące pola w kolorze `--glow-rgb` na `--bg`. Na górze strony mają wyglądać jak obecna poświata `.glow` (te same miejsca i siła). Hero ma wyglądać tak samo jak teraz, tylko delikatnie żyć. Przesuwają się najwolniej.
2. **Środkowa warstwa: drobna siatka punktów** (albo cienkie linie siatki w perspektywie). Bardzo subtelna, jasność maks. ok. 6–8% `--ink`. Przesuwa się szybciej niż plamy.
3. **Bliska warstwa: kilkadziesiąt drobnych drobin** w kolorze akcentu i `--ink`, lekko rozmytych. Przesuwają się najszybciej.

Do tego delikatne ziarno (grain), żeby gradienty nie miały pasów.

## Reakcje

- **Pozycja scrolla** (uniform): warstwy przesuwają się w górę z paralaksą.
- **Prędkość scrolla** (z Lenis): przy szybkim przewijaniu siatka i drobiny lekko się rozciągają w pionie i rozjaśniają, potem płynnie wracają (wygaszanie ok. 0,6 s). Efekt ma być wyczuwalny, ale nie męczący.
- **Mysz:** miękkie światło w kolorze akcentu podąża za kursorem z opóźnieniem (lerp ok. 0,06). Tylko przy `pointer: fine`.
- **Nastroje sekcji:** ScrollTrigger ustawia cel, a shader płynnie do niego przechodzi:
  - hero: jak teraz,
  - `#work`: światło przesuwa się pod karuzelę,
  - `#ksk-pretor` (sekcja ciemna): tło ciemnieje, poświata staje się bardziej czerwona i niższa,
  - `#ai`, `#about`, `#cv`: spokojniej, mniej światła za tekstem,
  - `#contact`: poświata rośnie od dołu ekranu (pod nową stopkę z zadania 05).
- Gdy ruletka w hero jest otwarta, tło zwalnia i przygasa, żeby nie konkurowało z kołem.

## Czytelność

Tekst ma mieć taki sam kontrast jak teraz. Za blokami tekstu tło ma być spokojne. Sprawdź kontrast w każdej sekcji.

## Wydajność i zabezpieczenia

- Renderuj tło w 0,5 rozdzielczości i skaluj w górę (plamy i tak są rozmyte). Siatka może iść w pełnej rozdzielczości, jeśli inaczej wygląda źle.
- DPR maks. 1,5. Pauza przy `document.hidden`. Pętla przez ticker GSAP.
- Hero ma już własny canvas three.js. Nie twórz drugiej instancji biblioteki: importuj ten sam moduł. Sprawdź, czy dwa konteksty WebGL nie spowalniają strony na telefonie. Jeśli spowalniają, uprość tło na telefonie (np. tylko plamy, bez drobin).
- Brak WebGL, błąd shadera albo słabe urządzenie (`navigator.hardwareConcurrency <= 4` i ekran dotykowy): zostaje obecne `.glow` z CSS, bez zmian.
- `prefers-reduced-motion`: tło statyczne, wygląda jak obecne `.glow`. Bez reakcji na scroll i mysz.
- Na zmianę rozmiaru okna reaguj z debounce. Bez wycieków pamięci.

## Sprawdzenie

- Zrzut hero na samej górze: przed i po mają wyglądać prawie tak samo.
- Nagraj krótko Playwrightem przewijanie całej strony (desktop i telefon) i obejrzyj klatki.
- Lighthouse mobile ≥ 90. Konsola bez błędów.

Commit: `Żywe tło: warstwy z paralaksą, reakcja na scroll i mysz`
