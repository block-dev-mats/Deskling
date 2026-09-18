# Instruktioner för arbete i Deskling

- Kontrollera arbetskatalog, git-status, branch, HEAD, remote och relevanta
  projektinstruktioner före varje uppgift. Avsaknad av första commit är normalt.
- Bevara befintligt arbete. Gör inga destruktiva git-operationer.
- En skrivande agent åt gången. Inga subagenter som standard.
- Avgränsa varje uppgift med mål, tillåtna ändringar och acceptanskriterier.
- Följ [WORKFLOW.md](WORKFLOW.md) för arbetsgång och oberoende read-only review
  av säkerhetskritisk kod före integration.
- Följ säkerhetsgränserna i [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) och
  testreglerna i [TESTING.md](TESTING.md). Läs [PLANS.md](PLANS.md) inför nästa steg.
- Aktuellt steg 2B tillåter enbart läsande Finder-frågor om uttryckligen valda,
  namngivna syntetiska testobjekt efter användarhandling i separat testläge.
  Ingen inventering, filinnehållsläsning, AI eller filverkställighet ingår.
  Skriv aldrig på verkligt Desktop. Privata namn/sökvägar, råa Finder-svar och
  skrivbordsbilder får inte nå loggar, agentkontext, review, fixtures eller Git.
  Utöka inte scope utan en ny uppgift. Commit och push följer uppgiftens mandat.

## Webbläsare

Kontrollera befintliga flikar/fönster och återanvänd relevant app eller lokal
server. Föredra Codex inbyggda webbläsare. Öppna en separat Chrome-kontext
endast för isolerade tester, ren session, kompatibilitetskontroll eller på
uttrycklig begäran. Stäng tillfälliga ytor efter arbetet.
