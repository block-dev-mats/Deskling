# Stegvis plan

Varje steg får en egen avgränsad uppgift enligt [WORKFLOW.md](WORKFLOW.md).
Steg 1 och 2A är levererade. Steg 2B är ett körbart ikontest med blockerad
positionsverifiering; se [TESTING.md](TESTING.md). Övriga steg återstår.

1. **Repo-grund.** Skapa de åtta dokumentations- och konfigurationsfilerna.
   Kontrollera omfattning, hänvisningar och ignore-regler. Ingen implementation.
2. **Teknisk macOS-verifiering.** 2A prövar en verklig transparent skrivbordsfigur,
   klickgenomsläpp, fokus/fönsterordning, vila/rörelse och avslutning utan filåtkomst.
   Manuell kontroll av detta fönster på verkligt Desktop ingår i 2A.
   **2B** undersöker separat Finders `position` för två eller tre exakt
   valda syntetiska objekt, via appens uttryckliga behörighets- och uppdateringsflöde.
   Ingen inventering, innehållsläsning eller Desktop-skrivning. Avgör tillförlitlighet
   och kvarvarande begränsningar innan fortsatt bygge. Den prövade vägen gav
   ingen individuell position för synliga ikoner. Nästa beslut är om en separat,
   liten read-only Accessibility-verifiering ska tillåtas; ingen sådan kod ingår här.
3. **Read-only filobservation och förhandsvisning.** Lista stödda lösa filer på
   översta nivån i en isolerad testrot. Ta fram lokala regelförslag och en exakt
   plan med källor, destinationer och nya mappar. Visa undantag och konflikter.
   Kontrollera att observation och preview inte ändrar filsystemet.
4. **Säker verkställighet, journal och undo.** Verkställ endast godkänd,
   återvaliderad plan. Verifiera kollisioner, ändrade förutsättningar, avbrott,
   beständig journal, återhämtning och undo efter omstart enligt TESTING.md.
   Oberoende read-only review krävs före integration.
5. **Varelseanimation och sammanhängande användarflöde.** Koppla observation,
   förslag, exakt preview, godkännande, flyttar, animation och undo. Animationen
   följer verkställighetens faktiska resultat. Kontrollera fokus och interaktion.
6. **Nebius/NVIDIA-integration för validerade AI-förslag.** Verifiera tjänst,
   exakt modell, API, kostnader och eventuella tävlingskrav först. Begär godkännande
   för extern dataöverföring, validera svar mot ett begränsat schema och samma
   säkerhetsregler som lokala förslag. Behåll lokal regelbaserad funktion vid
   fel eller avböjd överföring. Ingen lokal GPU-tung modell.
7. **Oberoende review, prestandakontroll och demo.** Granska säkerhetskritiska
   delar och hela flödet, mät resursåtgång och visa en demo med syntetiska filer.
   Redovisa resultat, miljö och kvarvarande begränsningar utan obelagda påståenden.

## Öppna verifieringsfrågor

- Är Electron + TypeScript, React och enkel 2D-animation lämpligt på målmaskinen?
- Kan verkliga Finder-ikonpositioner hämtas tillförlitligt, och med vilka API:er?
  Hur hanteras otillgängliga positioner? Gissade koordinater är inte verifiering.
- Vilka macOS-behörigheter, distributionsval och eventuella sandboxkrav behövs?
- Vilken Nebius/NVIDIA-tjänst och exakt modell passar, och vilka tävlingskrav gäller?

2A ger evidens för fönsterbeteendet. 2B är ingen garanti för ikonpositioner i alla
Finder-lägen. Framtida filbehörigheter, modellval och tävlingskrav återstår.
