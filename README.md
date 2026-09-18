# Deskling

Deskling är en planerad lättviktig macOS-app för MacBook Pro. En 2D-varelse
lever på det riktiga skrivbordet och hjälper användaren att organisera filer.

**MVP-flöde:** observera filer → föreslå organisering → visa exakt förhandsvisning
→ användaren godkänner → genomför och animera flyttar → erbjud ångra.

MVP omfattar lösa filer på översta nivån av Desktop, nya destinationsmappar och
godkända filflyttar. Befintliga mappar flyttas inte. Grunden är lokala regler med
avgränsad AI-hjälp för förslag. Downloads/Documents, chatt, musik, väder,
avancerade agenter och lokala GPU-tunga modeller ingår inte.

## Status

Steg 2A är ett körbart tekniskt experiment: en tillfällig mintgrön figur nära
nedre vänstra hörnet på primärskärmen. Electron-fönstret har transparent bakgrund,
ligger på skrivbordsnivån, släpper igenom musinput och kan inte få tangentbordsfokus.
Figuren rör sig mjukt i 1,2 sekunder och vilar sedan i 12 sekunder. Rörelsen
pausas när renderern är dold eller macOS-inställningen för minskad rörelse gäller.

Normal start läser inga Desktop-objekt och utlöser inga Finder-behörighetsdialoger.
Det separata experimentet 2B nedan kan läsa ikonpositioner för valda syntetiska
testobjekt. Ingen filverkställighet, innehållsläsning eller AI finns. Ingen CI finns.

## Starta och avsluta

Kräver macOS och Node.js 22.12 eller senare med npm. Kör i repots rot:

```sh
npm install
npm start
```

Första installationen/starten behöver nätåtkomst för npm och Electrons officiella
runtime. Bygget skapas i `dist/`. Starta bara en instans; nästa start avslutas direkt.
Avsluta via **Deskling → Avsluta Deskling** i macOS-menyraden högst upp på
skärmen, på sidan där klockan finns. **Ctrl+C** i
startterminalen är en reservväg för att stoppa hela körningen.

## Ikontest 2B

**Status: positionsverifieringen är blockerad på den testade Macen.** Finder gav
ingen individuell position för synliga testikoner. Experimentet är körbart och
visar felstatus säkert, men rätt markörposition och följning efter ikonflytt är
inte verifierade. Se [TESTING.md](TESTING.md) för reproduktion och nästa beslut.

Förbered syntetiska filer med `npm run prepare:icons`. De skapas enbart i
`.deskling-local/icon-tests/`; befintliga mål nekas utan läsning eller ersättning.
Förberedelsen behövs bara en gång per arbetskatalog. Kopiera själv två eller tre av
`Deskling-2B-test-A.txt`, `Deskling-2B-test-B.txt`, `Deskling-2B-test-C.txt` till
skrivbordet. Använd inga verkliga filer med dessa namn. Appen kopierar eller städar
aldrig på Desktop.

Avsluta en tidigare instans och kör `npm run icons`. I Deskling-menyn:

1. Kryssa i två eller tre testobjekt. Inget läses när de kryssas i.
2. Välj **Läs / uppdatera valda testikoner…**, läs förklaringen och bekräfta.
   macOS kan begära **Automation → Finder** för Electron eller startprogrammet.
   Ingen Full diskåtkomst, skärminspelning eller Hjälpmedel ska behövas.
3. Jämför bokstavsmarkörerna med rätt ikoner. Flytta själv en testikon och uppdatera
   igen. Menyn visar status för varje valt test-ID; koordinater och råsvar loggas inte.

Varje läsning rensar gamla markörer först. Saknad/nekad/okänd position eller
uteblivet svar ger ingen markör. En läsning tar högst tio sekunder; om en första
behörighetsdialog tar längre tid, gör en ny uttrycklig uppdatering efter ditt beslut.
**Rensa markörer / avbryt läsning** stoppar testet, och **Avsluta Deskling** stoppar
hela appen. Samma teståtgärder finns i appens vanliga meny (kan heta Electron i
utvecklingskörningen), med endast test-ID/status i varelsens tillgänglighetsbeskrivning.
En normal omstart återgår till 2A. Ingen behörighet återställs automatiskt.

Markörer är ögonblicksbilder och följer inte ikonflyttar förrän du uppdaterar.
Skärmändringar rensar dem. Testa bara individuellt synliga ikoner på primärskärmen,
utan travar, dolda ikoner, Stage Manager eller fullskärm. Dessa lägen upptäcks inte
tillförlitligt och är inte stödda. Finder kan lämna lagrade positioner som inte
motsvarar en synlig ikon; den visuella jämförelsen är därför en del av experimentet.

## Begränsningar och nästa steg

Detta är en utvecklingskörning, inte en signerad eller paketerad app. Electron kan
synas som processnamn. Figuren är inte klickbar och har en fast position; skärmbyte,
Spaces, fullskärmsappar och Stage Manager är inte fullständigt verifierade.
macOS placerar menyobjektet; en trång menyrad kan göra det svårare att hitta.

Electron + TypeScript används för experimentet med vanlig HTML/CSS och en liten
lokal animation, utan React eller animationsmotor. Detta avgör inte hela produktens
arkitektur. Steg 2B prövar Finders `position`; resultatet och nästa beslut
står i [TESTING.md](TESTING.md). Någon allmän filobservatör har inte införts.

## Läsordning

- [AGENTS.md](AGENTS.md): korta arbetsregler och vidare hänvisningar.
- [WORKFLOW.md](WORKFLOW.md): avgränsade uppgifter och oberoende review.
- [PLANS.md](PLANS.md): sju steg och öppna verifieringsfrågor.
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md): ansvar, filskydd och datagränser.
- [TESTING.md](TESTING.md): isolerade tester och krav på verifiering.

`.deskling-local/` är en ignorerad katalog för lokal runtime och syntetiska
demofiler. Verklig användardata ska inte hamna i repot alls, inte heller där.
