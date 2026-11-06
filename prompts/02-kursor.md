# Zadanie 02 – Nowy kursor

Obecny kursor (`#cursor` w `index.html`, kod w `js/main.js` w sekcji „Custom cursor”) pokazuje się tylko nad kartami. Przenieś go do `js/cursor.js` i rozbuduj.

## Wygląd i zachowanie

- **Kropka** (ok. 6 px), idzie dokładnie za myszą.
- **Pierścień** (ok. 36 px, cienka linia w `--ink`), dogania kropkę z opóźnieniem (lerp ok. 0,15). `mix-blend-mode: difference`, jeśli dobrze wygląda na ciemnym i jasnym tle.
- **Nad linkami i przyciskami:** pierścień rośnie do ok. 56 px i wypełnia się akcentem z przezroczystością, kropka znika.
- **Nad kartami z `data-cursor`:** zostaje obecne zachowanie: duże koło z etykietą („Open” / polska wersja z i18n). Etykiety bez zmian.
- **Nad hero w trybie 3D i nad kołem ruletki:** pierścień pokazuje dwie małe strzałki ← → (ikona SVG, bez tekstu), bo tam się przeciąga.
- **Nad tekstem akapitów:** pierścień zmienia się w cienką pionową kreskę (jak kursor tekstowy).
- **Wciśnięcie przycisku myszy:** pierścień na chwilę się zmniejsza.
- **Nad osadzonym modelem 3D (`#model-embed` po załadowaniu) i nad wideo z kontrolkami:** własny kursor znika, wraca systemowy.
- Wyjście myszy z okna: kursor znika. Powrót: pojawia się bez skoku.
- Przyciski z `data-magnetic` działają jak dotąd. Pierścień ma się do nich lekko „przyklejać”.

## Zasady

- Tylko `pointer: fine` i `hover: hover`. Na dotyku nic się nie zmienia.
- Systemowy kursor ukryj (`cursor: none`) dopiero wtedy, gdy moduł wystartował. Bez JS zostaje zwykły kursor.
- `prefers-reduced-motion`: kursor bez opóźnienia i bez animacji skali, tylko zmiana stanu.
- Focus z klawiatury wygląda jak dotąd.
- Ruch tylko przez `transform`, w tickerze GSAP.

Commit: `Nowy kursor: kropka, pierścień i stany`
