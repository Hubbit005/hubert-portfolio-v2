# Zadanie 06 – Kontrola i poprawki

## 1. Treść bez zmian

Napisz skrypt (poza repo albo w folderze, którego strona nie używa), który wyciąga cały widoczny tekst strony po angielsku i po polsku (`#pl`) z pierwszego commita tego repo i z obecnej wersji, a potem je porównuje. Jedyne dozwolone różnice to nowe etykiety wykresu z zadania 04. Każdą inną różnicę cofnij.

Sprawdź też: wszystkie kotwice działają, ruletka po wylosowaniu prowadzi do właściwego projektu, karuzela działa myszą, klawiaturą i dotykiem, model 3D się ładuje, filmy się odtwarzają.

## 2. Testy techniczne

Playwright, dla 1440×900 i 390×844, EN i PL, z i bez `prefers-reduced-motion`:
- zrzuty każdej sekcji,
- zero błędów w konsoli,
- brak poziomego scrolla na telefonie,
- kontrast tekstu AA w każdej sekcji (na tle z zadania 01),
- nawigacja samą klawiaturą od góry do dołu.

Lighthouse mobile i desktop: Performance ≥ 90, Accessibility ≥ 95, CLS < 0,1. Porównaj z wynikami sprzed zadania 01.

## 3. Niezależna recenzja

Uruchom osobnego agenta, który nie widział pracy. Daj mu tylko adres strony lokalnie, zrzuty i ten opis celu: „portfolio junior UX/UI designera; ma robić wrażenie »wow« ruchem, ale zostać czytelne i szybkie”. Niech oceni od 1 do 10:
1. efekt „wow” (tło, kursor, projekty, stopka),
2. czytelność i kontrast,
3. płynność (brak zacięć, sensowne tempo animacji),
4. spójność z hero i karuzelą,
5. telefon,
6. dostępność.

Cel: każda ocena ≥ 8. Popraw to, co jest niżej, i powtórz recenzję. Maksymalnie 3 rundy. Oceny zapisz w raporcie dla Huberta, nie w repo.

## 4. Raport dla Huberta

Po polsku, krótko:
- co zrobione (po jednym zdaniu na zadanie),
- oceny z ostatniej recenzji i wyniki Lighthouse przed i po,
- co ma sprawdzić sam na swoim telefonie,
- przypomnienie: włączyć GitHub Pages w Settings → Pages (gałąź main, folder root), jeśli jeszcze nie jest włączone.

Commit: `Kontrola: poprawki po recenzji`
