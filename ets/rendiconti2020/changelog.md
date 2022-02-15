# Cronologia modifiche
 
## 2022-02-16

### Rendiconto cassa

 * Modifica messaggio di errore a fine report per il controllo quadratura.  
 * Aggiunta tabella riassuntiva per il controllo quadratura.  
 * Aggiunto controllo delle registrazioni.
 	* Le registrazioni senza un conto liquidità (Cassa, Banca) vengono segnalate come errore.  
 * Aggiunto controllo colonne Apertura e Precedente dei conti liquidità (Cassa, Banca).  
 	* Se esiste un saldo in Apertura, lo stesso deve anche essere inserito nella colonna Precedente, altrimenti viene segnalato un errore. 
 	* Se i saldi nelle colonna Apertura e Precedente sono diversi viene segnalato un errore.  

### 5 per mille

 * Aggiunto nuovo report tipo Accantonamento Mod.B.  
 * Implementazione nuovi schemi 5xMille per i report Mod.A e Mod.B, come da nuove disposizioni di settembre 2021.  
 * Modifica parametri dell’estensione:
 	* "Data di percezione" => diventa “Data di percezione (Mod.A)"
 	* Aggiunto "Calcolo automatico dell’accantonamento (Mod.A)".
 		* L'importo al punto "5. Accantonamento" può essere calcolato in automatico come differenza tra "Importo percepito - totale costi (gruppi 1,2,3,4)".
 		* Si usa quando non si inserisce l’accantonamento come registrazione contabile.
 	* Aggiunto controllo importo accantonamento.
	 	* Quando si inserisce l’accantonamento come registrazione viene eseguito un controllo dell’importo: se "Accantonamento > (Entrate - Uscite)" viene segnalato un errore.
 	* Aggiunto "Tipo rendiconto dell’accantonamento (Mod.B)".
 		* Si usa per poter creare il rendiconto Mod.B.
 	* Aggiunto "Importo accantonamento (Mod.B)"
 		* Si usa per aggiungere manualmente l’importo dell’accantonamento quando si crea il rendiconto Mod.B.

### Generale
 * Corretto controllo validità dei gruppi Gr1/Gr inseriti dall’utente per i rendiconti patrimoniale, gestionale e cassa.

