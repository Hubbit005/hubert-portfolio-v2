# Zadanie 06 – Prawdziwe ujęcia z Higgsfielda

Hubert chce, żeby strona miała oprócz cyfrowej animacji kilka ujęć, które wyglądają jak prawdziwy film: światło, woda, dym, kurz. Tak jak w dobrych stronach agencji. Generujesz je w Higgsfieldzie. To jedyne zadanie, w którym wolno wydawać kredyty.

## Budżet i zgoda (najpierw to)

- Twardy limit: **1000 kredytów** na całe zadanie, razem z poprawkami. Cel: zmieścić się w ok. 700, żeby zostało na poprawki.
- Zanim cokolwiek wygenerujesz: pobierz wycenę każdej generacji z listy niżej (narzędzie wyceny / `max_credits` / tryb podglądu, jeśli jest), zsumuj i wyślij Hubertowi jedną wiadomość: tabela „ujęcie → koszt zdjęcia → koszt wideo”, suma, saldo konta. Generuj dopiero po jego „tak”.
- Na każdą generację ustaw `max_credits` równe wycenie.
- Maksymalnie 1 poprawka na ujęcie. Jeśli poprawka przekroczyłaby limit, zapytaj.
- Jeśli w tej sesji nie ma narzędzi Higgsfielda: nie zgaduj. Zapisz pełną listę promptów i ustawień w raporcie dla Huberta. On wygeneruje pliki sam i wrzuci je do `assets/higgsfield/raw/`, a Ty przejdziesz do kroku „Obróbka”.

## Jak generować (pętla bez szwu)

1. **Zdjęcie startowe:** model `gpt_image_2_6`, jakość `high`, rozdzielczość `2k`, proporcje `16:9`, format `png`.
2. **Wideo z tego zdjęcia:** model `kling3_0`, tryb `std`, `duration` 5 s, `sound` `off`, proporcje `16:9`. **To samo zdjęcie jako `start_image` i `end_image`.** Dzięki temu pierwsza i ostatnia klatka są takie same i film zapętla się bez przeskoku.
3. W prompcie wideo: ruch powolny, kamera prawie nieruchoma (najwyżej bardzo wolny dolly), bez cięć.

Wspólne dla wszystkich zdjęć (dopisz do każdego promptu): `cinematic photograph, shallow depth of field, dark low-key lighting, deep blacks, warm orange accent light (#ff5a1f), subtle film grain, no text, no logos, no people, no faces, empty negative space in the center for overlaid text`.

## Lista ujęć

| # | Gdzie na stronie | Zdjęcie (prompt) | Ruch w wideo |
|---|---|---|---|
| 1 | Tło nagłówka Basko Clean (`#basko-clean .case__head`) | macro shot of a high-pressure water jet hitting dark wet concrete, thousands of droplets frozen in backlight | droplets and mist drift in slow motion, water sheet ripples |
| 2 | Tło nagłówka KSK Pretor (`#ksk-pretor .case__head`) | dark concrete floor of an indoor range, a few brass shell casings in the foreground, thin smoke and dust floating in a single beam of deep red-orange light | smoke curls slowly through the light beam, dust specks float |
| 3 | Tło nagłówka Livingroom (`#livingroom .case__head`) | dark wooden table at night, heavily blurred warm candle bokeh, soft steam rising from out-of-focus plate | steam rises and swirls, bokeh flickers gently |
| 4 | Tło nagłówka strony dla psychologa (`#psychologist-site .case__head`) | soft linen curtain backlit by warm early morning light, calm and quiet, muted beige and orange | curtain sways very gently in a light breeze |
| 5 | Tło „Mniejsze projekty” (`#smaller-projects .case__head`) | cloud of chalk dust hanging in a dark gym under a single warm spotlight | chalk dust drifts and slowly disperses |
| 6 | Tło stopki za napisem HUBERT (zadanie 05) | orange ink slowly blooming in dark water, macro, abstract | ink plumes unfold and rise slowly |

Bez broni, bez ludzi, bez rozpoznawalnych wnętrz klientów i bez napisów. Ujęcia to klimat, nie dokumentacja: nie mogą udawać prawdziwych zdjęć firm klientów.

## Obróbka (ffmpeg)

- Surowe pliki: `assets/higgsfield/raw/` tylko lokalnie, **nie commituj ich** (dodaj do `.gitignore`).
- Na stronę, do `assets/higgsfield/`, dla każdego ujęcia:
  - `nazwa-1280.webm` (VP9) i `nazwa-1280.mp4` (H.264, `-preset veryfast`, `-movflags +faststart`), 1280×720, 24 kl./s, bez dźwięku, cel ≤ 1,5 MB,
  - `nazwa-640.mp4`, 640×360, cel ≤ 400 kB (telefon),
  - plakat `nazwa-poster.webp` (pierwsza klatka, ≤ 60 kB).
- Sprawdź, czy pętla nie skacze: porównaj pierwszą i ostatnią klatkę. Jeśli lekko skacze, zrób przenikanie ostatnich 0,4 s z pierwszymi.

## Wstawienie na stronę

- `<video muted loop playsinline preload="none" aria-hidden="true" poster="...">` za treścią nagłówka, `object-fit: cover`.
- Na wideo nałóż gradient z `--bg` (od mocnego przy krawędziach do słabszego w środku), żeby tekst miał kontrast AA. Krycie wideo ok. 0,35–0,55, dobierz po zrzutach.
- Odtwarzaj tylko, gdy jest na ekranie (IntersectionObserver), poza ekranem pauza. Wideo ładuj dopiero przy zbliżaniu się do ekranu.
- Lekka paralaksa wideo przy scrollu (`yPercent` ±6), zgodnie z warstwami tła z zadania 01.
- Telefon: plik 640. `prefers-reduced-motion` albo `Save-Data`: tylko plakat, bez wideo.
- Wideo 6 w stopce ma być wyraźniejsze niż pozostałe, ale napis HUBERT i dane kontaktowe muszą być czytelne.
- Treść i etykiety bez zmian. Wideo jest dekoracją (`aria-hidden`), nie dodaje faktów.

## Sprawdzenie

Lighthouse mobile dalej ≥ 90 (wideo nie może blokować pierwszego wyświetlenia). Zrzuty każdego nagłówka z wideo: tekst czytelny.

W raporcie dla Huberta: ile kredytów poszło naprawdę (z historii transakcji) i saldo po zadaniu.

Commit: `Ujęcia z Higgsfielda w nagłówkach projektów i stopce`
