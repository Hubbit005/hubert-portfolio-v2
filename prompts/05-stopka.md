# Zadanie 05 – Nowa stopka

Teraz stopka to jedna linia na dole sekcji `#contact`. Ma być mocnym zakończeniem strony. Treść kontaktu i stopki bez zmian: „Write or call.”, e-mail, telefon, „Copy e-mail”, „Hubert · Portfolio 2026”, „Back to top ↑”. Moduł `js/footer.js`.

## Efekt kurtyny

Sekcja kontaktu ze stopką leży „pod” stroną: gdy dochodzisz do końca, treść nad nią odjeżdża w górę jak kurtyna i odsłania stopkę (np. stopka `position: sticky; bottom: 0` z niższym `z-index`, a sekcja nad nią z tłem i zaokrąglonymi dolnymi rogami). Sprawdź, czy kotwica `#contact` z menu nadal przewija we właściwe miejsce.

## Elementy

1. **Ogromny napis HUBERT** na całą szerokość ekranu (font display, maksymalna szerokość znaków, jak w hero). Dekoracyjny, `aria-hidden="true"`. Litery wyjeżdżają od dołu kaskadą, gdy stopka się odsłania. Najpierw sam kontur, a przy samym końcu strony wypełniają się akcentem.
2. **E-mail i telefon:** zostają duże. Po najechaniu tekst lekko przyciąga się do kursora (magnetycznie), a podkreślenie wypełnia się od lewej.
3. **„Back to top ↑”** jako okrągły przycisk z cienkim pierścieniem dookoła, który pokazuje postęp przewinięcia strony (sam pierścień, bez liczby). Kliknięcie przewija przez Lenis na górę.
4. **Tło:** poświata rośnie od dołu (nastrój `#contact` z zadania 01).

## Zasady

- `prefers-reduced-motion`: stopka zwykła, bez kurtyny, napis od razu wypełniony.
- Telefon: napis HUBERT mieści się w szerokości ekranu, bez poziomego scrolla. Kurtyna tylko wtedy, gdy działa płynnie.
- Bez JS: wszystko widoczne i klikalne.
- Kopiowanie e-maila działa jak dotąd (`#copy-mail`, `#copy-status`).

Commit: `Stopka: kurtyna, wielki napis i przycisk powrotu z postępem`
