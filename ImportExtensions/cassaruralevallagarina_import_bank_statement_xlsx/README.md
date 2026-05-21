# Italia Cassa Rurale Vallagarina importazione estratto conto

## Updates

- Creazione filtro Cassa Rurale Vallagarina 21.05.2026

## Notes

- L'estensione importa il formato con colonne `DATA`, `VALUTA`, `DARE`, `AVERE`, `DIVISA`, `DESCRIZIONE_OPERAZIONE` e `CAUSALE_ABI`.
- Le date vengono gestite nel formato `dd.mm.yyyy`, come vengono passate a Banana dal file `.xlsx` di riferimento.
- Gli importi in `DARE` sono registrati come uscite, gli importi in `AVERE` come entrate.
