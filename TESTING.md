# Verifiering

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
2A tillåter observation och manuell interaktion med skrivbordsfönstret, aldrig
läsning eller ändring av Desktop-filer. Framtida filtester kräver separat scope.

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
