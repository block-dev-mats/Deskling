# Verifiering

## Steg 2B: avgränsad verifiering

`npm test` kör sex fokuserade tester med syntetiska svar och mockad processstart:
urvalsgräns, ID/koordinater, uppdatering/saknat objekt, nekad åtkomst/timeout,
ogiltiga/sammanfallande/utanförliggande positioner och sanering av processfel.
De passerar utan Finder-frågor eller Desktop-åtkomst. TypeScript, renderer-JS och
AppleScript-kompilering passerar. Kompilering är inte körning mot Finder.

Förberedelseskriptet kontrollerades separat i en isolerad temporär katalog:
nygenerering fungerar, befintlig fil och symlänk nekas utan läsning eller ersättning.
Oberoende read-only review av åtkomstgränsen identifierade EEXIST-hanteringen;
den är rättad och återgranskad utan kvarvarande kodblockerare. Verkliga Finder-svar
eller skrivbordsbilder ingår aldrig i review.

**Faktiskt macOS-resultat 2026-09-18: blockerad positionsverifiering.**
På samma macOS 26.6.2/arm64/Electron 44.4.2 som 2A kördes `npm run icons`:

- Användaren placerade syntetiska A/B/C på skrivbordet och bekräftade individuellt
  synliga ikoner. Först prövades `desktop position`, därefter `position` på samma
  exakt valda objekt. Båda gav status **Finder gav ingen individuell ikonposition**.
  Inga markörer ritades. Initialt klassades detta som utanför skärmen; statusen
  för saknad individuell position förtydligades innan slutkontrollen.
- Efter separat uttryckligt tillstånd använde agenten Computer för skrivbordsvisning
  och endast syntetiska testobjektsflyttar. Computer bekräftade ikonerna och körde
  läsningen via Deskling-menyn och dess bekräftelsedialog, med samma felstatus.
  Ingen ny Automation-dialog visades under denna körning; attribution och flöde
  med helt färsk/nekad systembehörighet är inte verifierade.
- Computer-försöket att dra A direkt på Desktop stoppades av verktygets
  `noWindowsAvailable`. Ingen ikonförflyttning kunde verifieras på det sättet.
- B flyttades via Finder till en separat ignorerad testmapp. Uppdatering i Deskling
  gav **B: saknas**, utan markör. B återställdes via Finder till Desktop. Inga andra
  objekt flyttades och inga visningsinställningar ändrades.
- Varelsen fanns kvar efter felen. **Avsluta Deskling** via appmenyn avslutade
  körningen med kod 0. Inga råsvar, privata namn eller bilder har sparats i projektet
  eller skickats till den oberoende granskaren.
- Efter 2B-ändringarna passerade även `npm run smoke` för normal 2A-start:
  transparenta pixlar, icke fokuserbart fönster, rörelse/vila och automatisk avslutning.

**Kvarstår:** rätt markör vid rätt ikon, följning efter ikonflytt, rensning av en
tidigare verklig markör samt klickgenomsläpp/fokus med synliga testmarkörer.
Nekad åtkomst och timeout är bara simulerade. Återställ inte systembehörigheter
för tester. Travar, dolda ikoner, andra skärmar, Stage Manager och fullskärm är
inte stödda. Detta är inte ett godkänt resultat för tillförlitlig ikonlokalisering.

**Reproduktion:** förbered och placera de syntetiska objekten enligt README,
starta `npm run icons`, välj A+B och bekräfta läsningen. Statusen ovan är det
observerade utfallet; inga hårdkodade eller ersättande koordinater används.
Minsta nästa beslut: tillåt eller avstå från ett separat, avgränsat read-only
test av macOS Accessibility. Ingen alternativ integration har byggts i 2B.

## Steg 2A: kontroller och observerat resultat

Kör `npm run check` för TypeScript och `node --check src/creature.js` för renderer-JS.
Avsluta en eventuell Deskling-instans och kör `npm run smoke` för ett kort
macOS-test som startar och avslutar appen. Testet inspekterar bara appens egen
renderer, aldrig Desktop-filer eller andra appars innehåll. Ingen CI är införd.

Verifierat 2026-09-18 på macOS 26.6.2, arm64, Node 22.21.1, Electron 44.4.2:

- TypeScript-/JS-kontroller, bygge och `npm start` lyckades.
- Smoke-testet passerade: synligt native-fönster enligt Electron, ej fokuserbart,
  ej always-on-top, transparenta hörnpixlar, synliga figurpixlar, ingen Node-åtkomst
  i renderern, verklig schemalagd rörelse följd av vila samt befintligt menyobjekt.
- En kort vilomätning med `app.getAppMetrics()`, tre intervall om två sekunder,
  gav totalt 0,08 / 0,02 / 0,01 % CPU och 346 / 333 / 330 MiB working set för
  Electron-processerna. Detta är en ögonblicksbild, inte en energi- eller långtidsmätning.
  Omprovet efter CSS-rättningen passerade också och gav 0,06 / 0,03 / 0,02 % CPU
  med cirka 355 MiB working set i samtliga tre intervall.
- Agentens macOS-fönsterbilder visade både den första och den färdiga figuren.
  Användaren bekräftade separat att figuren syns med Visa skrivbordet, täcks av
  vanliga arbetsfönster, har transparent bakgrund och mjuk rörelse, släpper igenom
  klick/markeringsdrag och inte stör appbyte eller tar fokus.
  En bild av appens eget fönster bevisar inte skrivbordsplaceringen.
- Ctrl+C stoppade körningen. Efter smoke-testets automatiska avslut fanns inga
  kvarvarande Deskling-processer i processkontrollen.
- Användaren hittade Deskling i menyraden och bekräftade att **Avsluta Deskling**
  fungerade. Den startade körningen avslutades med kod 0.

Inga av de fyra begärda manuella kontrollerna återstår på denna maskin.
Spaces, fullskärm, skärmbyten och Stage Manager är inte fullständigt verifierade.
Oberoende read-only kodreview gav inga
blockerare; ett överflödigt CSS-tecken rättades och återkontrollerades.

## Dokumentation och repo

- Kontrollera att endast uppgiftens tillåtna filer tillkommer eller ändras.
- Granska diff, whitespace och interna filhänvisningar. Före första commit är
  filerna untracked och syns inte i vanlig git diff; granska även deras hela innehåll.
- Kontrollera ignore-regler med exempel för både ignorerade och synliga filer:
  miljöfiler, byggresultat och lokal runtime kontra .env.example, källkod,
  bildassets, JSON-fixtures och framtida lockfiler.

## Framtida funktions- och säkerhetstester

Använd bara syntetiska filer i isolerade testkataloger, exempelvis under
`.deskling-local/`. Ingen automatisk filtestning mot användarens riktiga Desktop.
2A tillåter observation och manuell interaktion med skrivbordsfönstret. 2B tillåter
endast uttryckligt vald positionsmetadata för fasta syntetiska testobjekt via appen.
Ingen automatisk läsning, flytt eller städning på Desktop. Framtida filtester kräver
separat scope och verkliga privata metadata får inte hamna i testunderlag.

- Observation och preview: inga filsystemändringar, även vid fel; befintliga
  mappar, dolda filer, apppaket och övriga ej stödda objekt undantas.
- Planer: exakta källor/destinationer, godkännande knutet till visad plan,
  avvisade ogodkända eller ändrade planer och ogiltiga AI-svar.
- Verkställighet: rotgräns, sökvägstraversering, symlänkar, namnkonflikter
  inklusive skiftläges-/Unicode-varianter, ändrade källor/destinationer och
  förändringar mellan kontroll och flytt. Ingen överskrivning eller radering.
- Fel och återhämtning: nekad åtkomst, misslyckad journalföring, delvis genomförd
  plan och avbrott vid varje journal-/flyttgräns. Återstart ska identifiera verkligt
  utfall och inte utföra en flytt två gånger.
- Undo efter omstart: säkra återflyttar, ändrade/försvunna filer och nytillkommet
  innehåll. Konflikter ska lämna användarinnehåll orört och förklaras i gränssnittet.
- AI-gräns: extern överföring kräver godkännande; modellens svar kan aldrig
  direkt starta shellkommandon eller filoperationer.

## macOS och prestanda

Verifiera steg 2 i [PLANS.md](PLANS.md) på angiven macOS-version och maskin.
Mät CPU, minne, animationsflyt och tid för observation/preview/flytt med beskriven
filmängd, både i vila och under arbete. Kontrollera att skanning och modellförfrågor
inte sker per animationsbildruta. Påstå inte verifierad prestanda utan mätdata.

Redovisa faktiskt utfall, miljö, begränsningar och uteblivna kontroller.
Säkerhetskritisk kod kräver även review enligt [WORKFLOW.md](WORKFLOW.md).
