# Cronologia modifiche
 
## 2022-02-16

### Rendiconto cassa

 * Controllo quadratura a fine report:
    * Modifica messaggio di errore.  
    * Aggiunta tabella riassuntiva con dettagli.  
 * Aggiunto controllo delle registrazioni.
 	* Le registrazioni senza un conto liquidità (Cassa, Banca) vengono segnalate come errore.  
 * Aggiunto controllo colonne Apertura e Precedente dei conti liquidità (Cassa, Banca).  
 	* Se esiste un saldo in Apertura lo stesso saldo deve anche essere inserito nella colonna Precedente.  
 	* I saldi delle colonne Apertura e Precedente devono essere uguali.  

### 5 per mille

 * Modello rendiconto Mod.A:
    * Implementazione nuovo schema 5xMille per il report Mod.A come da nuove disposizioni.  
    * Modifica e aggiunte parametri dell’estensione:  
        * **Data di percezione (Mod.A)**  
            * Si usa solo nel rendiconto Mod.A.  
        * **Calcolo automatico dell’accantonamento (Mod.A)**  
            * L'importo al punto "5. Accantonamento" può essere calcolato in automatico come differenza tra "Importo percepito - totale costi (gruppi 1,2,3,4)".  
            * Si usa quando non si inserisce l’accantonamento come registrazione contabile.  
    * Aggiunto controllo importo accantonamento.
        * Quando si inserisce l’accantonamento come registrazione viene eseguito un controllo dell’importo: se "Accantonamento > (Importo percepito - Totale spese gruppi 1,2,3,4)" viene segnalato un errore.


 * Modello rendiconto dell'accantonamento Mod.B:
    * Aggiunto modello di rendiconto dell'accantonamento Mod.B.
    * Implementazione nuovo schema 5xMille per il report Mod.B come da nuove disposizioni.  
    * Modifica e aggiunte parametri dell’estensione:  
        * **Tipo rendiconto dell’accantonamento (Mod.B)**  
            * Si usa per creare il rendiconto dell'accantonamento Mod.B.  
        * **Importo accantonamento (Mod.B)**  
            * Si usa per aggiungere manualmente l’importo accantonato quando si crea il rendiconto dell'accantonamento Mod.B.  

### Generale
 * Corretto controllo validità dei gruppi Gr1/Gr inseriti dall’utente per i rendiconti patrimoniale, gestionale e cassa.  
 