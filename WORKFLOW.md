# Arbetsgång

1. Kontrollera katalog, git-status, branch, HEAD och remote. Läs AGENTS.md och
   instruktioner som gäller de berörda filerna. Inventera befintligt arbete.
2. Beskriv uppgiftens mål, tillåtna ändringar och acceptanskriterier. Håll en
   skrivande agent aktiv; använd inte subagenter som standard.
3. Gör minsta sammanhängande ändring. Ändra inte orelaterade filer och installera
   inte beroenden som ligger utanför uppgiften.
4. Kontrollera diff, interna filhänvisningar och relevanta ignore-regler.
   Verifiera enligt [TESTING.md](TESTING.md); skilj utförda kontroller från planerade.
5. Begär oberoende read-only review av säkerhetskritisk kod före integration:
   filåtkomst, planvalidering, verkställighet, journal, undo och AI-gränser.
   Granskaren ska vara en annan person eller en separat granskande agent som
   uttryckligen anlitats för uppgiften, utan skrivmandat. Åtgärder görs av den
   skrivande agenten och relevanta ändringar granskas igen. Olösta blockerare
   hindrar integration.
6. Avsluta med ändrade filer, utförda kontroller, antaganden, öppna frågor,
   git-status och rekommenderad nästa uppgift. Commit och push kräver mandat
   i uppgiften; steg 2B har uttryckligt mandat för granskad commit och push.

## Uppgiftsmall

- **Mål:** ett avgränsat resultat.
- **Tillåtna ändringar:** namngivna filer eller tydligt avgränsade komponenter.
- **Acceptanskriterier:** observerbara resultat och nödvändiga kontroller.
- **Utanför scope:** sådant som lämnas till nästa uppgift.

Prioritering och beslutspunkter finns i [PLANS.md](PLANS.md). Produktens
ansvars- och säkerhetsgränser finns i [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).
