# Zadanie 04 – Jeden wykres: mapa projektów (bez liczb)

Hubert chce jeden wykres, ale bez liczb, bo nie ma danych. Wykres pokazuje tylko to, co już jest napisane na stronie w polu „Rola” każdego projektu. Nie dodawaj żadnych innych faktów.

## Co to jest

Macierz kropek: wiersze to projekty, kolumny to obszary pracy. Kropka oznacza, że obszar był częścią projektu.

Miejsce: w sekcji `#cases`, zaraz pod spisem projektów (`.case-index`). Moduł `js/chart.js`.

## Dane (tylko z istniejącego tekstu)

| Projekt | Projekt / Design | Kod / Code | Wideo / Video | Marketing | 3D | Agent AI / AI agent |
|---|---|---|---|---|---|---|
| Basko Clean | ● | ● | ● | ● | | |
| KSK Pretor | | | ● | ● | ● | ● |
| Livingroom | ● | ● | | | | |
| Strona dla Agaty Patelki | ● | ● | | | | |
| Plany treningowe | ● | ● | | | | |

Źródła: Basko – „Design, code, video, social media”; KSK – „Strategy, marketing, video, 3D, AI agent”; Livingroom – „Idea, design, build”; Agata – „Design and build”; plany treningowe – „one template I designed”, strony www. Jeśli któryś punkt nie zgadza się z tekstem na stronie, popraw tabelę według tekstu i napisz o tym w raporcie.

## Wygląd

- Kropki w akcencie, puste pola jako cienkie kółka w `--line`. Bez liczb, procentów, sum i podpisów z ilością.
- Nazwy projektów po lewej są linkami do kotwic projektów.
- Przy wjeździe na ekran kropki pojawiają się kolumna po kolumnie (krótka kaskada, „pop” ze skali 0).
- Najechanie na wiersz: wiersz się rozjaśnia, reszta przygasa. Najechanie na kolumnę: to samo dla kolumny.
- Telefon: tabela przewijana w poziomie albo zamieniona na listę projektów z „pigułkami” obszarów. Wybierz to, co czytelniejsze.

## Dostępność i tłumaczenia

- Prawdziwa `<table>` z `<caption>`, nagłówkami `th scope`. W komórce z kropką tekst dla czytników „Tak” / „Yes” (`sr-only`), puste komórki „Nie” / „No”.
- Tytuł wykresu: EN „What I did in each project”, PL „Co robiłem w każdym projekcie”.
- Etykiety kolumn EN: Design, Code, Video, Marketing, 3D, AI agent. PL: Projekt, Kod, Wideo, Marketing, 3D, Agent AI.
- Nazwy projektów: użyj istniejących kluczy i18n tam, gdzie są (np. `arc-track.15`, `training-title.1` albo `arc-track.18`).
- Nowe klucze dodaj do `js/i18n.js` w tym samym stylu (komentarz `// EN: ...` nad kluczem).
- `prefers-reduced-motion`: kropki widoczne od razu.

Commit: `Wykres: mapa obszarów pracy w projektach`
