# LIQUIDAZIONE IVA 2017 

Informazioni per la programmazione.

# Riferimenti
* Liquidazione IVA periodica [Modulo PDF](http://www.agenziaentrate.gov.it/wps/wcm/connect/f8544907-3410-4ad0-a6c8-84a03f91868b/IVA+period_2017_mod_istr.pdf?MOD=AJPERES&CACHEID=f8544907-3410-4ad0-a6c8-84a03f91868b)
* [Comunicazioni Liquidazioni periodiche IVA](http://www.informazionefiscale.it/IMG/pdf/comunicazione_liquidazioni_iva_trimestrali_modello.pdf) 
Nella cartella [Specifiche tecniche](https://github.com/BananaAccounting/Italia/tree/master/Iva/2017/Specifiche) si trova la documentazione relativa.
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
* Dichiarazione di gruppo o appartenente a un gruppo
* Subfornitorie
* Eventi eccezionali
 
## Parametri applicativo 
A livello di parametri app si indica 
* Se la trasmissione è mensile o trimestrale
* Dichiarante partita iva
* Dichiarante codice fiscale
  
## Valori ripresi dalla contabilità
* Partita IVA (Proprietà indirizzo)
* Mese o trimestre (dialogo scelta periodo)
* Totale operazioni attive
  VatTaxable delle operazioni di vendita 
  Gruppi primo livello V e C
* Totale operazioni passive
  VaxTaxable delle operazioni di acquisto.
  Gruppi primo livello A
* IVA esigibile
  Il totale VatAmount delle operazioni di vendita
  (bisogna capire quali codici IVA includere o gruppi)
* IVA detratta
* IVA a debito o credito (Calcolata)
* IVA da versare o a credito (Calcolata)

## Valori immessi manualmente (dialogo??)
* Debito periodo precedente
* Credito periodo precedente
* Credito anno precedente
* Versamento auto UE
* Crediti d'imposta
* Interessi
* Acconto dovuto




