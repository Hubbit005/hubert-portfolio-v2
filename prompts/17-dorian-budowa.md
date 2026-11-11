# 17 – Budowa: wersja 3 w stylu dorianlods.com

Przeczytaj `CLAUDE.md` i `prompts/16-dorian-brief.md`. Brief jest zamknięty i zatwierdzony przez Huberta w Figmie: nie pytaj go o rzeczy, które tam są. Pracujesz bez Huberta przy komputerze, więc decyzje, których brief nie rozstrzyga, podejmij sam, oznacz w raporcie jako [Z] i idź dalej.

## 0. Start sesji (obowiązkowo, w tej kolejności)

1. **Graphify, żeby oszczędzać limit.** Jeśli go nie ma: `pip install graphifyy && graphify install`. Zbuduj graf **tylko z kodu**: `js/`, `css/`, `index.html` (bez `prompts/`, `assets/`, `vendor/`, `proto/`). Uruchom `graphify claude install`, żeby przed każdym szukaniem używać grafu. Dopisz `graphify-out/` do `.gitignore`. Do ustalenia, co usunąć i co z czym jest połączone, używaj grafu i `GRAPH_REPORT.md` zamiast czytania całych plików. Po dużych zmianach (punkt 2) przebuduj graf raz.
2. **Ponytail** (`/ponytail`, poziom full) na całą sesję: najmniej kodu, natywne rozwiązania.
3. Wczytaj skill **scroll-craft** (`.claude/skills/scroll-craft/SKILL.md`) tylko w części o ruchu przy scrollu, przejściach i weryfikacji (`references/verify.md`). Wywiad i generowanie assetów pomiń.
4. Zrób Playwrightem zrzuty obecnej strony (1440×900, 390×844) i zmierz Lighthouse mobile. Trzymaj poza repo.
5. Kopia jest już zrobiona: gałąź `backup/przed-dorianem-2026-11-11`. Nie zmieniaj jej.

## Asset: kryształ (gotowy, opłacony 11.11.2026)

| Plik | Adres |
|---|---|
| Model GLB (Meshy 7, bez tekstury) | https://d8j0ntlcm91z4.cloudfront.net/user_3E4wjlRzfbqMlZMAqIWN6GaWkvD/hf_20261111_001506_40cc4395-0458-4401-bb8f-70a107cbd078.glb |
| Render referencyjny (wygląd szkła, nie do strony) | https://d8j0ntlcm91z4.cloudfront.net/user_3E4wjlRzfbqMlZMAqIWN6GaWkvD/hf_20261111_001315_0b19c745-a280-4934-976d-444e5e606776.png |

- GLB pobierz, obejrzyj siatkę, uprość do ośmiu ścian, jeśli trzeba, skompresuj (meshopt, dekoder już jest w `vendor/three/addons/libs/`) i zapisz jako `assets/crystal/crystal.glb`, cel ≤ 60 kB.
- Z renderu zrób wersję zastępczą `assets/crystal/crystal.webp` i `.avif` (512 px, czarne tło zamień na przezroczyste) dla braku WebGL i reduced motion.
- Jeśli któregoś adresu nie da się pobrać, użyj `THREE.OctahedronGeometry` i wpisz to do raportu. Nie generuj niczego sam.

## Commity (po każdym push, jeden pull request do `main` na końcu)

1. **Porządek.** Usuń z `main` to, czego nowa strona nie używa (brief, sekcja 1): moduły w `js/`, style, `proto/`, assety i fonty. Nowy, prosty `index.html` z czterema sekcjami jako zwykłą treścią HTML (działa bez JS). `css/tokens.css` z paletą, Manrope i zmiennymi `--u` i `--m`.
2. **Glify.** `js/glyphs.js` według briefu, sekcja 2. Wszystkie napisy ekspozycyjne przez ten moduł.
3. **Scena WebGL.** Budyń, napis w powierzchni z rozmyciem i RGB, światło za kursorem (brief, sekcja 4). Wersja zastępcza bez WebGL i dla reduced motion.
4. **Kryształ.** Materiał szklany, orbita w hero z chowaniem się za literami, obrót, tor przy scrollu, hover na projektach z obrotem do ściany i zdjęciem widocznym tylko przez szkło (brief, sekcje 5 i 6).
5. **Sekcje i przejścia.** Układ desktop i telefon dokładnie według wymiarów z briefu (sekcje 3, 7, 8), jedna sekcja na ekran, przejścia z samym kryształem pomiędzy.
6. **Strony projektów.** Cztery strony z poziomą taśmą (brief, sekcja 9).
7. **Kontrola.** Playwright: 1440×900, 1920×1080, 1024×768 (skalowanie 1:1), 390×844. Dla każdego ekranu zrzut sekcji i zrzut ekranu przejścia (ma być widać tylko kryształ). Hover na każdym z 4 projektów. Strona projektu: scroll w dół przesuwa taśmę. Reduced motion i brak JS: treść widoczna. Konsola bez błędów. Lighthouse mobile przed i po. Jedna runda niezależnej recenzji (`/ponytail-review`) i jedna runda poprawek.

## Raport dla Huberta (po polsku, krótko)

Co zrobione, adres podglądu, wynik Lighthouse przed i po, lista decyzji [Z], czego nie dało się zrobić i dlaczego.
