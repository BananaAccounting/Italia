# TRASMISSIONE DATI FATTURE  2017 

Informazioni per la programmazione.

## Riferimenti
* [Spiegazioni codici e gruppi IVA](https://github.com/BananaAccounting/Italia/blob/master/Iva/2017/codiciIVA.md)

## Domande preliminari
Si tratta di capire se generiamo un documento XML 
* Completo di tutti i dati. 
  Quindi si deve dare la possibilità all'utente di inserire dei dati che non sono presenti nella contabilità.
* Solo con elementi relativi all'IVA e quei dati presenti nel file della contabilità.
  I dati dell'XML sono importati in un applicativo  (commercialista o software agenzia delle entrate) e i dati mancanti sono completati nell'applicativo che serve alla trasmissione dei dati.
* Misto, dati presenti nella contabilità e dialogo per immissione dati imnportanti. 
  I dati dell'XML sono importati in un applicativo  (commercialista o software agenzia delle entrate) e i dati mancanti sono completati nell'applicativo che serve alla trasmissione dei dati.

## Funzionalità non supportate o da chiarire
* Registrazioni IVA che non appartengono ai clienti e fornitori (senza fattura) sono da includere nella trasmissione?
* Manca l'informazione iva detraibile (percentuale)
 
## Parametri applicativo 
  
## Valori ripresi dalla contabilità

## Valori immessi manualmente (dialogo??)

## Tools
* [www.utilities-online: validazione file xml](http://www.utilities-online.info/)
* [ww.corefiling.com: validazione file xml](https://www.corefiling.com/opensource/schemaValidate.html)
