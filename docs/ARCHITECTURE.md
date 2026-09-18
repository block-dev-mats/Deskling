# Arkitektur och säkerhetsgränser

Produktens ansvarsfördelning nedan är fortfarande preliminär. Steg 2A använder
Electron + TypeScript med lokal HTML/CSS och en begränsad Web Animations-rörelse.
React och kontrollpanel har inte införts. Hela teknikvalet är fortsatt öppet.

## Levererat experiment 2A

Ett 180 × 180-fönster på primärskärmen använder Electrons
[`type: 'desktop'`](https://www.electronjs.org/docs/latest/api/base-window#new-basewindowoptions),
transparent bakgrund, `focusable: false`, `showInactive()` och
`setIgnoreMouseEvents(true)`. Inget always-on-top används. En separat tray-meny
avslutar appen. Ingen ikonpositions- eller filintegration finns.

Renderern har sandbox, context isolation och ingen Node-integration eller preload.
Inga IPC-anrop exponeras. CSP blockerar nätanslutningar; navigation, nya fönster
och behörighetsbegäranden nekas. Animationen är lokal och ändlig, med timer mellan
rörelser och paus vid dold renderer/minskad rörelse. Ingen skanning eller modell används.
Electrons egen profil/cache ligger i macOS Application Support under `Deskling-2A`,
utanför repot. Det är runtime-data, ingen läsning av användarens skrivbordsfiler.

Se [TESTING.md](../TESTING.md) för observerat beteende och kvarvarande kontroller.

## Ansvar

- **Observation:** läs metadata för stödda lösa filer på Desktop, översta nivån.
- **Förslag:** lokala regler och avgränsad AI producerar planförslag som valideras.
- **Preview och godkännande:** visa exakt källa, destination och varje ny mapp,
  plus undantag/konflikter. Bind godkännandet till den visade planens identitet.
- **Filverkställighet:** en separat, begränsad komponent validerar och genomför
  den godkända planen samt ansvarar för beständig journal och undo.
- **Varelseanimation:** presenterar faktiska händelser från verkställigheten.
  Animationens tillstånd eller avbrott får inte avgöra om en filflytt har lyckats.

AI-förslag, animation och filverkställighet är separata ansvar. AI får aldrig
direkt verkställa filoperationer eller shellkommandon. Eventuella framtida
IPC-kontrakt för filåtkomst behöver utformas och granskas separat.

## Filsäkerhet

- Endast uttryckligen godkänd plan får verkställas. Ändrad plan kräver ny preview
  och nytt godkännande. Preview får inte ändra filsystemet, inte ens skapa mappar.
- Tillåten produktrot är Desktop. Tester använder en separat syntetisk rot.
  Destinationer ska stanna inom tillåten rot; befintliga mappar flyttas aldrig.
- MVP undantar dolda filer, apppaket, symlänkar och andra osäkra/ej stödda objekt.
  Följ inte heller symlänkar i destinationsvägar utanför tillåtet område.
- Validera rotområde, källornas identitet/tillstånd, destinationer, åtkomst och
  ändrade förutsättningar före verkställighet och inför varje operation.
  Skydda även mot förändringar mellan kontroll och flytt; en förkontroll ensam
  räcker inte. Vid konflikt eller osäkerhet: stoppa berörd verkställighet och
  redovisa läget, utan att gissa ett nytt mål.
- Inga överskrivningar och ingen radering av användarfiler. Skapa enbart planerade
  destinationsmappar och flytta godkända filer med skydd mot namnkonflikter.

## Beständig journal och undo

Journalför plan, godkännande, källor/destinationer, identifierande metadata och
operationsstatus beständigt. Avsikt ska vara beständigt sparad före flytten;
utfallet sparas efteråt. Misslyckad journalföring hindrar fortsatt verkställighet.
Återhämtning måste kunna reda ut avbrott mellan flytt och sparat utfall.

Undo ska fungera efter omstart och endast återställa verifierat genomförda
flyttar när förutsättningarna fortfarande är säkra. Undo får aldrig skriva över
eller radera nytillkommet användarinnehåll. Konflikter lämnas orörda och visas.
MVP lämnar skapade mappar kvar vid undo; rensning är inget krav. Exakt lagring,
identitetskontroll och återhämtningsprotokoll beslutas och testas i steg 4.

## Data och resursåtgång

Metadata före filinnehåll; läs inte innehåll utan ett uttryckligt behov och mandat.
Även filnamn och sökvägar kan vara känsliga. Extern överföring kräver användarens
godkännande av mottagare, ändamål och vilka uppgifter som skickas. Minimera data
och validera modellens svar som opålitlig indata. Lokala regler ska fungera utan AI.
Verklig användardata, journaler från verkliga filer och hemligheter hör inte hemma
i repot. Produktjournalens lagringsplats utanför repot återstår att välja.

Ingen skanning eller modellförfrågan per animationsbildruta. Separera observation,
förslagsgenerering och rendering; mät resursåtgång enligt [TESTING.md](../TESTING.md).
Exakt Nebius/NVIDIA-modell, tävlingskrav, verkliga Finder-ikonpositioner och
macOS-behörigheter är öppna verifieringsfrågor.
