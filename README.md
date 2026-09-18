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

Ingen läsning av Desktop-filer, ikonpositionshämtning, filverkställighet eller AI
finns. Ingen ny filåtkomst- eller datorstyrningsbehörighet begärs. Ingen CI finns.

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

## Begränsningar och nästa steg

Detta är en utvecklingskörning, inte en signerad eller paketerad app. Electron kan
synas som processnamn. Figuren är inte klickbar och har en fast position; skärmbyte,
Spaces, fullskärmsappar och Stage Manager är inte fullständigt verifierade.
macOS placerar menyobjektet; en trång menyrad kan göra det svårare att hitta.

Electron + TypeScript används för experimentet med vanlig HTML/CSS och en liten
lokal animation, utan React eller animationsmotor. Detta avgör inte hela produktens
arkitektur. Nästa avgränsade steg 2B undersöker verkliga Finder-ikonpositioner och
vilka behörigheter det skulle kräva. Se [TESTING.md](TESTING.md) för faktisk evidens.

## Läsordning

- [AGENTS.md](AGENTS.md): korta arbetsregler och vidare hänvisningar.
- [WORKFLOW.md](WORKFLOW.md): avgränsade uppgifter och oberoende review.
- [PLANS.md](PLANS.md): sju steg och öppna verifieringsfrågor.
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md): ansvar, filskydd och datagränser.
- [TESTING.md](TESTING.md): isolerade tester och krav på verifiering.

`.deskling-local/` är en ignorerad katalog för lokal runtime och syntetiska
demofiler. Verklig användardata ska inte hamna i repot alls, inte heller där.
