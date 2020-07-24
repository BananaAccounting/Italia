// Copyright [2020] [Banana.ch SA - Lugano Switzerland]
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
//  http://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// @id = ch.banana.it.extension.statopatrimoniale.mod.a
// @api = 1.0
// @pubdate = 2020-07-24
// @publisher = Banana.ch SA
// @description = Stato patrimoniale (MOD. A)
// @task = app.command
// @doctype = 100.100
// @docproperties = 
// @outputformat = none
// @inputdatasource = none
// @timeout = -1
// @includejs = breport.js
// @includejs = errors.js


/*
   Stampa del rendiconto 'Stato patrimoniale (MOD. A)' secondo nuovi schemi di bilancio per il terzo settore.
   
   
   I modelli devono essere considerati come schemi “fissi”.
   È possibile suddividere le voci precedute da numeri arabi o da lettere minuscole dell'alfabeto,
   senza eliminare la voce complessiva e l'importo corrispondente.
   Gli enti che presentano voci precedute da numeri arabi o da lettere minuscole con importi nulli
   per due esercizi consecutivi possono eliminare dette voci.
   Possono aggiungere voci precedute da numeri arabi o da lettere minuscole dell'alfabeto.
   Eventuali raggruppamenti o eliminazioni delle voci di bilancio devono risultare esplicitati
   nella relazione di missione

*/

var BAN_VERSION = "9.1.0";
var BAN_EXPM_VERSION = "200615";




function loadDataStructure() {
   /*
      Data structure:
      - "id" used as GR/GR1 and to identify the object
      - "type" used to define the type of data (group, title or total)
      - "indent" used to define the indent level for the print
      - "bclass" used to define the bclass of the group
      - "description" used to define the description text used for the print
      - "sum" used to define how to calculate the total

      Indent levels:
      lvl0
         lvl1
            lvl2
               lvl3
                  lvl4

   */

   var dataStructure = [];
   
   /* ATTIVO */
   dataStructure.push({"id":"AA", "type":"group", "indent":"lvl0", "bclass":"1", "description":"A) Quote associative o apporti ancora dovuti"});
   dataStructure.push({"id":"dAB", "type":"title", "indent":"lvl0", "description":"B) Immobilizzazioni"});
   dataStructure.push({"id":"dABI", "type":"title", "indent":"lvl1", "description":"I - Immobilizzazioni immateriali"});
   dataStructure.push({"id":"ABI1", "type":"group", "indent":"lvl2", "bclass":"1", "description":"1) costi di impianto e di ampliamento"});
   dataStructure.push({"id":"ABI2", "type":"group", "indent":"lvl2", "bclass":"1", "description":"2) costi di sviluppo"});
   dataStructure.push({"id":"ABI3", "type":"group", "indent":"lvl2", "bclass":"1", "description":"3) diritti di brevetto industriale e diritti di utilizzazione delle opere dell'ingegno"});
   dataStructure.push({"id":"ABI4", "type":"group", "indent":"lvl2", "bclass":"1", "description":"4) concessioni, licenze, marchi e diritti simili"});
   dataStructure.push({"id":"ABI5", "type":"group", "indent":"lvl2", "bclass":"1", "description":"5) avviamento"});
   dataStructure.push({"id":"ABI6", "type":"group", "indent":"lvl2", "bclass":"1", "description":"6) immobilizzazioni in corso e acconti"});
   dataStructure.push({"id":"ABI7", "type":"group", "indent":"lvl2", "bclass":"1", "description":"7) altre Immobilizzazioni immateriali"});
   dataStructure.push({"id":"ABI", "type":"total", "indent":"lvl1", "description":"Totale immobilizzazioni immateriali", "sum":"ABI1;ABI2;ABI3;ABI4;ABI5;ABI6;ABI7"});
   dataStructure.push({"id":"dABII", "type":"title", "indent":"lvl1", "description":"II - Immobilizzazioni materiali"});
   dataStructure.push({"id":"ABII1", "type":"group", "indent":"lvl2", "bclass":"1", "description":"1) terreni e fabbricati"});
   dataStructure.push({"id":"ABII2", "type":"group", "indent":"lvl2", "bclass":"1", "description":"2) impianti e macchinari"});
   dataStructure.push({"id":"ABII3", "type":"group", "indent":"lvl2", "bclass":"1", "description":"3) attrezzature"});
   dataStructure.push({"id":"ABII4", "type":"group", "indent":"lvl2", "bclass":"1", "description":"4) altri beni"});
   dataStructure.push({"id":"ABII5", "type":"group", "indent":"lvl2", "bclass":"1", "description":"5) immobilizzazioni in corso e acconti"});
   dataStructure.push({"id":"ABII", "type":"total", "indent":"lvl1", "description":"Totale immobilizzazioni materiali", "sum":"ABII1;ABII2;ABII3;ABII4;ABII5"});
   dataStructure.push({"id":"dABIII", "type":"title", "indent":"lvl1", "description":"III - Immobilizzazioni finanziarie"});
   dataStructure.push({"id":"ABIII1a", "type":"group", "indent":"lvl3", "bclass":"1", "description":"a) partecipazioni in imprese controllate"});
   dataStructure.push({"id":"ABIII1b", "type":"group", "indent":"lvl3", "bclass":"1", "description":"b) partecipazioni in imprese collegate"});
   dataStructure.push({"id":"ABIII1c", "type":"group", "indent":"lvl3", "bclass":"1", "description":"c) partecipazioni in altre imprese"});
   dataStructure.push({"id":"ABIII1", "type":"title", "indent":"lvl2", "description":"1) Partecipazioni", "sum":"ABIII1a;ABIII1b;ABIII1c"});
   dataStructure.push({"id":"ABIII2ao", "type":"group", "indent":"lvl4", "bclass":"1", "description":"di cui esigibili oltre l'anno successivo"});
   dataStructure.push({"id":"ABIII2ae", "type":"group", "indent":"lvl4", "bclass":"1", "description":"di cui esigibili entro l'anno successivo"});
   dataStructure.push({"id":"ABIII2a", "type":"total", "indent":"lvl3", "description":"a) crediti verso imprese controllate", "sum":"ABIII2ao;ABIII2ae"});
   dataStructure.push({"id":"ABIII2bo", "type":"group", "indent":"lvl4", "bclass":"1", "description":"di cui esigibili oltre l'anno successivo"});
   dataStructure.push({"id":"ABIII2be", "type":"group", "indent":"lvl4", "bclass":"1", "description":"di cui esigibili entro l'anno successivo"});
   dataStructure.push({"id":"ABIII2b", "type":"total", "indent":"lvl3", "description":"b) crediti verso imprese collegate", "sum":"ABIII2bo;ABIII2be"});
   dataStructure.push({"id":"ABIII2co", "type":"group", "indent":"lvl4", "bclass":"1", "description":"di cui esigibili oltre l'anno successivo"});
   dataStructure.push({"id":"ABIII2ce", "type":"group", "indent":"lvl4", "bclass":"1", "description":"di cui esigibili entro l'anno successivo"});
   dataStructure.push({"id":"ABIII2c", "type":"total", "indent":"lvl3", "description":"c) crediti verso altri enti del Terzo settore", "sum":"ABIII2co;ABIII2ce"});
   dataStructure.push({"id":"ABIII2do", "type":"group", "indent":"lvl4", "bclass":"1", "description":"di cui esigibili oltre l'anno successivo"});
   dataStructure.push({"id":"ABIII2de", "type":"group", "indent":"lvl4", "bclass":"1", "description":"di cui esigibili entro l'anno successivo"});
   dataStructure.push({"id":"ABIII2d", "type":"total", "indent":"lvl3", "description":"d) crediti verso altri", "sum":"ABIII2do;ABIII2de"});
   dataStructure.push({"id":"ABIII2", "type":"title", "indent":"lvl2", "description":"2) Crediti", "sum":"ABIII2a;ABIII2b;ABIII2c;ABIII2d"});
   dataStructure.push({"id":"ABIII3", "type":"group", "indent":"lvl2", "bclass":"1", "description":"3) Altri titoli"});
   dataStructure.push({"id":"ABIII", "type":"total", "indent":"lvl1", "description":"Totale immobilizzazioni finanziarie", "sum":"ABIII1;ABIII2;ABIII3"});
   dataStructure.push({"id":"AB", "type":"total", "indent":"lvl0", "description":"Totale immobilizzazioni B)", "sum":"ABI;ABII;ABIII"});
   dataStructure.push({"id":"dAC", "type":"title", "indent":"lvl0", "description":"C) Attivo circolante"});
   dataStructure.push({"id":"dACI", "type":"title", "indent":"lvl1", "description":"I - Rimanenze"});
   dataStructure.push({"id":"ACI1", "type":"group", "indent":"lvl2", "bclass":"1", "description":"1) Rimanenze materie prime, sussidiarie e di consumo"});
   dataStructure.push({"id":"ACI2", "type":"group", "indent":"lvl2", "bclass":"1", "description":"2) Rimanenze prodotti in corso di lavorazione e semilavorati"});
   dataStructure.push({"id":"ACI3", "type":"group", "indent":"lvl2", "bclass":"1", "description":"3) Rimanenze lavori in corso su ordinazione"});
   dataStructure.push({"id":"ACI4", "type":"group", "indent":"lvl2", "bclass":"1", "description":"4) Rimanenze prodotti finiti e merci"});
   dataStructure.push({"id":"ACI5", "type":"group", "indent":"lvl2", "bclass":"1", "description":"5) Rimanenze acconti"});
   dataStructure.push({"id":"ACI", "type":"total", "indent":"lvl1", "description":"Totale rimanenze", "sum":"ACI1;ACI2;ACI3;ACI4;ACI5"});
   dataStructure.push({"id":"dACII", "type":"title", "indent":"lvl1", "description":"II - Crediti"});
   dataStructure.push({"id":"ACII1o", "type":"group", "indent":"lvl3", "bclass":"1", "description":"di cui esigibili oltre l'anno successivo"});
   dataStructure.push({"id":"ACII1e", "type":"group", "indent":"lvl3", "bclass":"1", "description":"di cui esigibili entro l'anno successivo"});
   dataStructure.push({"id":"ACII1", "type":"total", "indent":"lvl2", "description":"1) Crediti verso utenti e clienti", "sum":"ACII1o;ACII1e"});
   dataStructure.push({"id":"ACII2o", "type":"group", "indent":"lvl3", "bclass":"1", "description":"di cui esigibili oltre l'anno successivo"});
   dataStructure.push({"id":"ACII2e", "type":"group", "indent":"lvl3", "bclass":"1", "description":"di cui esigibili entro l'anno successivo"});
   dataStructure.push({"id":"ACII2", "type":"total", "indent":"lvl2", "description":"2) Crediti verso associati e fondatori", "sum":"ACII2o;ACII2e"});
   dataStructure.push({"id":"ACII3o", "type":"group", "indent":"lvl3", "bclass":"1", "description":"di cui esigibili oltre l'anno successivo"});
   dataStructure.push({"id":"ACII3e", "type":"group", "indent":"lvl3", "bclass":"1", "description":"di cui esigibili entro l'anno successivo"});
   dataStructure.push({"id":"ACII3", "type":"total", "indent":"lvl2", "description":"3) Crediti verso enti pubblici", "sum":"ACII3o;ACII3e"});
   dataStructure.push({"id":"ACII4o", "type":"group", "indent":"lvl3", "bclass":"1", "description":"di cui esigibili oltre l'anno successivo"});
   dataStructure.push({"id":"ACII4e", "type":"group", "indent":"lvl3", "bclass":"1", "description":"di cui esigibili entro l'anno successivo"});
   dataStructure.push({"id":"ACII4", "type":"total", "indent":"lvl2", "description":"4) Crediti verso soggetti privati per contributi", "sum":"ACII4o;ACII4e"});
   dataStructure.push({"id":"ACII5o", "type":"group", "indent":"lvl3", "bclass":"1", "description":"di cui esigibili oltre l'anno successivo"});
   dataStructure.push({"id":"ACII5e", "type":"group", "indent":"lvl3", "bclass":"1", "description":"di cui esigibili entro l'anno successivo"});
   dataStructure.push({"id":"ACII5", "type":"total", "indent":"lvl2", "description":"5) Crediti verso enti della stessa rete associativa", "sum":"ACII5o;ACII5e"});
   dataStructure.push({"id":"ACII6o", "type":"group", "indent":"lvl3", "bclass":"1", "description":"di cui esigibili oltre l'anno successivo"});
   dataStructure.push({"id":"ACII6e", "type":"group", "indent":"lvl3", "bclass":"1", "description":"di cui esigibili entro l'anno successivo"});
   dataStructure.push({"id":"ACII6", "type":"total", "indent":"lvl2", "description":"6) Crediti verso altri enti del Terzo settore", "sum":"ACII6o;ACII6e"});
   dataStructure.push({"id":"ACII7o", "type":"group", "indent":"lvl3", "bclass":"1", "description":"di cui esigibili oltre l'anno successivo"});
   dataStructure.push({"id":"ACII7e", "type":"group", "indent":"lvl3", "bclass":"1", "description":"di cui esigibili entro l'anno successivo"});
   dataStructure.push({"id":"ACII7", "type":"total", "indent":"lvl2", "description":"7) Crediti verso imprese controllate", "sum":"ACII7o;ACII7e"});
   dataStructure.push({"id":"ACII8o", "type":"group", "indent":"lvl3", "bclass":"1", "description":"di cui esigibili oltre l'anno successivo"});
   dataStructure.push({"id":"ACII8e", "type":"group", "indent":"lvl3", "bclass":"1", "description":"di cui esigibili entro l'anno successivo"});
   dataStructure.push({"id":"ACII8", "type":"total", "indent":"lvl2", "description":"8) Crediti verso imprese collegate", "sum":"ACII8o;ACII8e"});
   dataStructure.push({"id":"ACII9o", "type":"group", "indent":"lvl3", "bclass":"1", "description":"di cui esigibili oltre l'anno successivo"});
   dataStructure.push({"id":"ACII9e", "type":"group", "indent":"lvl3", "bclass":"1", "description":"di cui esigibili entro l'anno successivo"});
   dataStructure.push({"id":"ACII9", "type":"total", "indent":"lvl2", "description":"9) Crediti tributari", "sum":"ACII9o;ACII9e"});
   dataStructure.push({"id":"ACII10o", "type":"group", "indent":"lvl3", "bclass":"1", "description":"di cui esigibili oltre l'anno successivo"});
   dataStructure.push({"id":"ACII10e", "type":"group", "indent":"lvl3", "bclass":"1", "description":"di cui esigibili entro l'anno successivo"});
   dataStructure.push({"id":"ACII10", "type":"total", "indent":"lvl2", "description":"10) Crediti da 5 per mille", "sum":"ACII10o;ACII10e"});
   dataStructure.push({"id":"ACII11o", "type":"group", "indent":"lvl3", "bclass":"1", "description":"di cui esigibili oltre l'anno successivo"});
   dataStructure.push({"id":"ACII11e", "type":"group", "indent":"lvl3", "bclass":"1", "description":"di cui esigibili entro l'anno successivo"});
   dataStructure.push({"id":"ACII11", "type":"total", "indent":"lvl2", "description":"11) Crediti per imposte anticipate", "sum":"ACII11o;ACII11e"});
   dataStructure.push({"id":"ACII12o", "type":"group", "indent":"lvl3", "bclass":"1", "description":"di cui esigibili oltre l'anno successivo"});
   dataStructure.push({"id":"ACII12e", "type":"group", "indent":"lvl3", "bclass":"1", "description":"di cui esigibili entro l'anno successivo"});
   dataStructure.push({"id":"ACII12", "type":"total", "indent":"lvl2", "description":"12) Crediti verso altri", "sum":"ACII12o;ACII12e"});
   dataStructure.push({"id":"ACII", "type":"total", "indent":"lvl1", "description":"Totale crediti", "sum":"ACII1;ACII2;ACII3;ACII4;ACII5;ACII6;ACII7;ACII8;ACII9;ACII10;ACII11;ACII12"});
   dataStructure.push({"id":"dACIII", "type":"title", "indent":"lvl1", "description":"III - Attività finanziarie che non costituiscono immobilizzazioni"});
   dataStructure.push({"id":"ACIII1", "type":"group", "indent":"lvl2", "bclass":"1", "description":"1) Partecipazioni in imprese controllate"});
   dataStructure.push({"id":"ACIII2", "type":"group", "indent":"lvl2", "bclass":"1", "description":"2) Partecipazioni in imprese collegate"});
   dataStructure.push({"id":"ACIII3", "type":"group", "indent":"lvl2", "bclass":"1", "description":"3) Altri titoli"});
   dataStructure.push({"id":"ACIII", "type":"total", "indent":"lvl1", "description":"Totale attività finanziarie che non costituiscono immobilizzazioni", "sum":"ACIII1;ACIII2;ACIII3"});
   dataStructure.push({"id":"dACIV", "type":"title", "indent":"lvl1", "description":"IV - Disponibilità liquide"});
   dataStructure.push({"id":"ACIV1", "type":"group", "indent":"lvl2", "bclass":"1", "description":"1) Depositi bancari e postali"});
   dataStructure.push({"id":"ACIV2", "type":"group", "indent":"lvl2", "bclass":"1", "description":"2) Assegni"});
   dataStructure.push({"id":"ACIV3", "type":"group", "indent":"lvl2", "bclass":"1", "description":"3) Danaro e valori in cassa"});
   dataStructure.push({"id":"ACIV", "type":"total", "indent":"lvl1", "description":"Totale disponibilità liquide", "sum":"ACIV1;ACIV2;ACIV3"});
   dataStructure.push({"id":"AC", "type":"total", "indent":"lvl0", "description":"Totale attivo circolante C)", "sum":"ACI;ACII;ACIII;ACIV"});
   dataStructure.push({"id":"AD", "type":"group", "indent":"lvl0", "bclass":"1", "description":"D) Ratei e risconti attivi"});

   /* PASSIVO */
   dataStructure.push({"id":"dPA", "type":"title", "indent":"lvl0", "description":"A) Patrimonio netto"});
   dataStructure.push({"id":"PAI", "type":"group", "indent":"lvl1", "bclass":"2", "description":"I - Fondo di dotazione dell'ente"});
   dataStructure.push({"id":"dPAII", "type":"title", "indent":"lvl1", "description":"II - Patrimonio vincolato"});
   dataStructure.push({"id":"PAII1", "type":"group", "indent":"lvl2", "bclass":"2", "description":"1) Riserve statutarie"});
   dataStructure.push({"id":"PAII2", "type":"group", "indent":"lvl2", "bclass":"2", "description":"2) Riserve vincolate per decisione degli organi istituzionali"});
   dataStructure.push({"id":"PAII3", "type":"group", "indent":"lvl2", "bclass":"2", "description":"3) Riserve vincolate destinate da terzi"});
   dataStructure.push({"id":"PAII", "type":"total", "indent":"lvl1", "description":"Totale patrimonio vincolato", "sum":"PAII1;PAII2;PAII3"});
   dataStructure.push({"id":"dPAIII", "type":"title", "indent":"lvl1", "description":"III - Patrimonio libero"});
   dataStructure.push({"id":"PAIII1", "type":"group", "indent":"lvl2", "bclass":"2", "description":"1) Riserve di utili o avanzi di gestione"});
   dataStructure.push({"id":"PAIII2", "type":"group", "indent":"lvl2", "bclass":"2", "description":"2) Altre riserve"});
   dataStructure.push({"id":"PAIII", "type":"total", "indent":"lvl1", "description":"Totale patrimonio libero", "sum":"PAIII1;PAIII2"});
   dataStructure.push({"id":"PA", "type":"total", "indent":"lvl0", "description":"Totale patrimonio netto A)", "sum":"PAI;PAII;PAIII;PAIV"});
   dataStructure.push({"id":"dPB", "type":"title", "indent":"lvl0", "description":"B) Fondi per rischi e oneri"});
   dataStructure.push({"id":"PB1", "type":"group", "indent":"lvl1", "bclass":"2", "description":"1) Fondi per trattamento di quiescenza e obblighi simili"});
   dataStructure.push({"id":"PB2", "type":"group", "indent":"lvl1", "bclass":"2", "description":"2) Fondi per imposte, anche differite"});
   dataStructure.push({"id":"PB3", "type":"group", "indent":"lvl1", "bclass":"2", "description":"3) Fondi altri"});
   dataStructure.push({"id":"PB", "type":"total", "indent":"lvl0", "description":"Totale fondi per rischi e oneri B)", "sum":"PB1;PB2;PB3"});
   dataStructure.push({"id":"PC", "type":"group", "indent":"lvl0", "bclass":"2", "description":"C) Fondi trattamento di fine rapporto di lavoro subordinato"});
   dataStructure.push({"id":"dPD", "type":"title", "indent":"lvl0", "description":"D) Debiti"});
   dataStructure.push({"id":"PD1o", "type":"group", "indent":"lvl2", "bclass":"2", "description":"di cui esigibili oltre l'anno successivo"});
   dataStructure.push({"id":"PD1e", "type":"group", "indent":"lvl2", "bclass":"2", "description":"di cui esigibili entro l'anno successivo"});
   dataStructure.push({"id":"PD1", "type":"total", "indent":"lvl1", "description":"1) Debiti verso banche", "sum":"PD1o;PD1e"});
   dataStructure.push({"id":"PD2o", "type":"group", "indent":"lvl2", "bclass":"2", "description":"di cui esigibili oltre l'anno successivo"});
   dataStructure.push({"id":"PD2e", "type":"group", "indent":"lvl2", "bclass":"2", "description":"di cui esigibili entro l'anno successivo"});
   dataStructure.push({"id":"PD2", "type":"total", "indent":"lvl1", "description":"2) Debiti verso altri finanziatori", "sum":"PD2o;PD2e"});
   dataStructure.push({"id":"PD3o", "type":"group", "indent":"lvl2", "bclass":"2", "description":"di cui esigibili oltre l'anno successivo"});
   dataStructure.push({"id":"PD3e", "type":"group", "indent":"lvl2", "bclass":"2", "description":"di cui esigibili entro l'anno successivo"});
   dataStructure.push({"id":"PD3", "type":"total", "indent":"lvl1", "description":"3) Debiti verso associati e fondatori per finanziamenti", "sum":"PD3o;PD3e"});
   dataStructure.push({"id":"PD4o", "type":"group", "indent":"lvl2", "bclass":"2", "description":"di cui esigibili oltre l'anno successivo"});
   dataStructure.push({"id":"PD4e", "type":"group", "indent":"lvl2", "bclass":"2", "description":"di cui esigibili entro l'anno successivo"});
   dataStructure.push({"id":"PD4", "type":"total", "indent":"lvl1", "description":"4) Debiti verso enti della stessa rete associativa", "sum":"PD4o;PD4e"});
   dataStructure.push({"id":"PD5o", "type":"group", "indent":"lvl2", "bclass":"2", "description":"di cui esigibili oltre l'anno successivo"});
   dataStructure.push({"id":"PD5e", "type":"group", "indent":"lvl2", "bclass":"2", "description":"di cui esigibili entro l'anno successivo"});
   dataStructure.push({"id":"PD5", "type":"total", "indent":"lvl1", "description":"5) Debiti per erogazioni liberali condizionate", "sum":"PD5o;PD5e"});
   dataStructure.push({"id":"PD6o", "type":"group", "indent":"lvl2", "bclass":"2", "description":"di cui esigibili oltre l'anno successivo"});
   dataStructure.push({"id":"PD6e", "type":"group", "indent":"lvl2", "bclass":"2", "description":"di cui esigibili entro l'anno successivo"});
   dataStructure.push({"id":"PD6", "type":"total", "indent":"lvl1", "description":"6) Acconti (Debiti)", "sum":"PD6o;PD6e"});
   dataStructure.push({"id":"PD7o", "type":"group", "indent":"lvl2", "bclass":"2", "description":"di cui esigibili oltre l'anno successivo"});
   dataStructure.push({"id":"PD7e", "type":"group", "indent":"lvl2", "bclass":"2", "description":"di cui esigibili entro l'anno successivo"});
   dataStructure.push({"id":"PD7", "type":"total", "indent":"lvl1", "description":"7) Debiti verso fornitori", "sum":"PD7o;PD7e"});
   dataStructure.push({"id":"PD8o", "type":"group", "indent":"lvl2", "bclass":"2", "description":"di cui esigibili oltre l'anno successivo"});
   dataStructure.push({"id":"PD8e", "type":"group", "indent":"lvl2", "bclass":"2", "description":"di cui esigibili entro l'anno successivo"});
   dataStructure.push({"id":"PD8", "type":"total", "indent":"lvl1", "description":"8) Debiti verso imprese controllate e collegate", "sum":"PD8o;PD8e"});
   dataStructure.push({"id":"PD9o", "type":"group", "indent":"lvl2", "bclass":"2", "description":"di cui esigibili oltre l'anno successivo"});
   dataStructure.push({"id":"PD9e", "type":"group", "indent":"lvl2", "bclass":"2", "description":"di cui esigibili entro l'anno successivo"});
   dataStructure.push({"id":"PD9", "type":"total", "indent":"lvl1", "description":"9) Debiti tributari", "sum":"PD9o;PD9e"});
   dataStructure.push({"id":"PD10o", "type":"group", "indent":"lvl2", "bclass":"2", "description":"di cui esigibili oltre l'anno successivo"});
   dataStructure.push({"id":"PD10e", "type":"group", "indent":"lvl2", "bclass":"2", "description":"di cui esigibili entro l'anno successivo"});
   dataStructure.push({"id":"PD10", "type":"total", "indent":"lvl1", "description":"10) Debiti verso istituti di previdenza e di sicurezza sociale", "sum":"PD10o;PD10e"});
   dataStructure.push({"id":"PD11o", "type":"group", "indent":"lvl2", "bclass":"2", "description":"di cui esigibili oltre l'anno successivo"});
   dataStructure.push({"id":"PD11e", "type":"group", "indent":"lvl2", "bclass":"2", "description":"di cui esigibili entro l'anno successivo"});
   dataStructure.push({"id":"PD11", "type":"total", "indent":"lvl1", "description":"11) Debiti verso dipendenti e collaboratori", "sum":"PD11o;PD11e"});
   dataStructure.push({"id":"PD12o", "type":"group", "indent":"lvl2", "bclass":"2", "description":"di cui esigibili oltre l'anno successivo"});
   dataStructure.push({"id":"PD12e", "type":"group", "indent":"lvl2", "bclass":"2", "description":"di cui esigibili entro l'anno successivo"});
   dataStructure.push({"id":"PD12", "type":"total", "indent":"lvl1", "description":"12) Altri debiti", "sum":"PD12o;PD12e"});
   dataStructure.push({"id":"PD", "type":"total", "indent":"lvl0", "description":"Totale debiti C)", "sum":"PD1;PD2;PD3;PD4;PD5;PD6;PD7;PD8;PD9;PD10;PD11;PD12"});
   dataStructure.push({"id":"PE", "type":"group", "indent":"lvl0", "bclass":"2", "description":"E) Ratei e risconti passivi"});

   /* COSTI */
   dataStructure.push({"id":"dCA", "type":"title", "indent":"", "description":"A) Costi e oneri da attività di interesse generale"});
   dataStructure.push({"id":"CA1", "type":"group", "indent":"", "bclass":"3", "description":"1) Materie prime, sussidiarie, di consumo e di merci"});
   dataStructure.push({"id":"CA2", "type":"group", "indent":"", "bclass":"3", "description":"2) Servizi"});
   dataStructure.push({"id":"CA3", "type":"group", "indent":"", "bclass":"3", "description":"3) Godimento beni di terzi"});
   dataStructure.push({"id":"CA4", "type":"group", "indent":"", "bclass":"3", "description":"4) Personale"});
   dataStructure.push({"id":"CA5", "type":"group", "indent":"", "bclass":"3", "description":"5) Ammortamenti"});
   dataStructure.push({"id":"CA6", "type":"group", "indent":"", "bclass":"3", "description":"6) Accantonamenti per rischi ed oneri"});
   dataStructure.push({"id":"CA7", "type":"group", "indent":"", "bclass":"3", "description":"7) Oneri diversi di gestione"});
   dataStructure.push({"id":"CA8", "type":"group", "indent":"", "bclass":"3", "description":"8) Rimanenze iniziali"});
   dataStructure.push({"id":"CA", "type":"total", "indent":"", "description":"Totale", "sum":"CA1;CA2;CA3;CA4;CA5;CA6;CA7;CA8"});
   dataStructure.push({"id":"dCB", "type":"title", "indent":"", "description":"B) Costi e oneri da attività diverse"});
   dataStructure.push({"id":"CB1", "type":"group", "indent":"", "bclass":"3", "description":"1) Materie prime, sussidiarie, di consumo e di merci"});
   dataStructure.push({"id":"CB2", "type":"group", "indent":"", "bclass":"3", "description":"2) Servizi"});
   dataStructure.push({"id":"CB3", "type":"group", "indent":"", "bclass":"3", "description":"3) Godimento beni di terzi"});
   dataStructure.push({"id":"CB4", "type":"group", "indent":"", "bclass":"3", "description":"4) Personale"});
   dataStructure.push({"id":"CB5", "type":"group", "indent":"", "bclass":"3", "description":"5) Ammortamenti"});
   dataStructure.push({"id":"CB6", "type":"group", "indent":"", "bclass":"3", "description":"6) Accantonamenti per rischi ed oneri"});
   dataStructure.push({"id":"CB7", "type":"group", "indent":"", "bclass":"3", "description":"7) Oneri diversi di gestione"});
   dataStructure.push({"id":"CB8", "type":"group", "indent":"", "bclass":"3", "description":"8) Rimanenze iniziali"});
   dataStructure.push({"id":"CB", "type":"total", "indent":"", "description":"Totale", "sum":"CB1;CB2;CB3;CB4;CB5;CB6;CB7;CB8"});
   dataStructure.push({"id":"dCC", "type":"title", "indent":"", "description":"C) Costi e oneri da attività di raccolta fondi"});
   dataStructure.push({"id":"CC1", "type":"group", "indent":"", "bclass":"3", "description":"1) Oneri per raccolte fondi abituali"});
   dataStructure.push({"id":"CC2", "type":"group", "indent":"", "bclass":"3", "description":"2) Oneri per raccolte fondi occasionali"});
   dataStructure.push({"id":"CC3", "type":"group", "indent":"", "bclass":"3", "description":"3) Altri oneri"});
   dataStructure.push({"id":"CC", "type":"total", "indent":"", "description":"Totale", "sum":"CC1;CC2;CC3"});
   dataStructure.push({"id":"dCD", "type":"title", "indent":"", "description":"D) Costi e oneri da attività finanziarie e patrimoniali"});
   dataStructure.push({"id":"CD1", "type":"group", "indent":"", "bclass":"3", "description":"1) Su rapporti bancari"});
   dataStructure.push({"id":"CD2", "type":"group", "indent":"", "bclass":"3", "description":"2) Su prestiti"});
   dataStructure.push({"id":"CD3", "type":"group", "indent":"", "bclass":"3", "description":"3) Da patrimonio edilizio"});
   dataStructure.push({"id":"CD4", "type":"group", "indent":"", "bclass":"3", "description":"4) Da altri beni patrimoniali"});
   dataStructure.push({"id":"CD5", "type":"group", "indent":"", "bclass":"3", "description":"5) Accantonamenti per rischi ed oneri"});
   dataStructure.push({"id":"CD6", "type":"group", "indent":"", "bclass":"3", "description":"6) Altri oneri"});
   dataStructure.push({"id":"CD", "type":"total", "indent":"", "description":"Totale", "sum":"CD1;CD2;CD3;CD4;CD5;CD6"});
   dataStructure.push({"id":"dCE", "type":"title", "indent":"", "description":"E) Costi e oneri di supporto generale"});
   dataStructure.push({"id":"CE1", "type":"group", "indent":"", "bclass":"3", "description":"1) Materie prime, sussidiarie, di consumo e di merci"});
   dataStructure.push({"id":"CE2", "type":"group", "indent":"", "bclass":"3", "description":"2) Servizi"});
   dataStructure.push({"id":"CE3", "type":"group", "indent":"", "bclass":"3", "description":"3) Godimento beni di terzi"});
   dataStructure.push({"id":"CE4", "type":"group", "indent":"", "bclass":"3", "description":"4) Personale"});
   dataStructure.push({"id":"CE5", "type":"group", "indent":"", "bclass":"3", "description":"5) Ammortamenti"});
   dataStructure.push({"id":"CE6", "type":"group", "indent":"", "bclass":"3", "description":"6) Accantonamenti per rischi ed oneri"});
   dataStructure.push({"id":"CE7", "type":"group", "indent":"", "bclass":"3", "description":"7) Altri oneri"});
   dataStructure.push({"id":"CE", "type":"total", "indent":"", "description":"Totale", "sum":"CE1;CE2;CE3;CE4;CE5;CE6;CE7"});
   dataStructure.push({"id":"C", "type":"total", "indent":"", "description":"TOTALE ONERI E COSTI", "sum":"CA;CB;CC;CD;CE"});
   dataStructure.push({"id":"IM", "type":"group", "indent":"", "bclass":"3", "description":"Imposte"});

   /* PROVENTI */
   dataStructure.push({"id":"dRA", "type":"title", "indent":"", "description":"A) Ricavi, rendite e proventi da attività di interesse generale"});
   dataStructure.push({"id":"RA1", "type":"group", "indent":"", "bclass":"4", "description":"1) Proventi da quote associative e apporti dei fondatori"});
   dataStructure.push({"id":"RA2", "type":"group", "indent":"", "bclass":"4", "description":"2) Proventi dagli associati per attività mutuali"});
   dataStructure.push({"id":"RA3", "type":"group", "indent":"", "bclass":"4", "description":"3) Ricavi per prestazioni e cessioni ad associati e fondatori"});
   dataStructure.push({"id":"RA4", "type":"group", "indent":"", "bclass":"4", "description":"4) Erogazioni liberali"});
   dataStructure.push({"id":"RA5", "type":"group", "indent":"", "bclass":"4", "description":"5) Proventi del 5 per mille"});
   dataStructure.push({"id":"RA6", "type":"group", "indent":"", "bclass":"4", "description":"6) Contributi da soggetti privati"});
   dataStructure.push({"id":"RA7", "type":"group", "indent":"", "bclass":"4", "description":"7) Ricavi per prestazioni e cessioni a terzi"});
   dataStructure.push({"id":"RA8", "type":"group", "indent":"", "bclass":"4", "description":"8) Contributi da enti pubblici"});
   dataStructure.push({"id":"RA9", "type":"group", "indent":"", "bclass":"4", "description":"9) Proventi da contratti con enti pubblici"});
   dataStructure.push({"id":"RA10", "type":"group", "indent":"", "bclass":"4", "description":"10) Altri ricavi, rendite e proventi"});
   dataStructure.push({"id":"RA11", "type":"group", "indent":"", "bclass":"4", "description":"11) Rimanenze finali"});
   dataStructure.push({"id":"RA", "type":"total", "indent":"", "description":"Totale", "sum":"RA1;RA2;RA3;RA4;RA5;RA6;RA7;RA8;RA9;RA10;RA11"});
   dataStructure.push({"id":"dRB", "type":"title", "indent":"", "description":"B) Ricavi, rendite e proventi da attività diverse"});
   dataStructure.push({"id":"RB1", "type":"group", "indent":"", "bclass":"4", "description":"1) Ricavi per prestazioni e cessioni ad associati e fondatori"});
   dataStructure.push({"id":"RB2", "type":"group", "indent":"", "bclass":"4", "description":"2) Contributi da soggetti privati"});
   dataStructure.push({"id":"RB3", "type":"group", "indent":"", "bclass":"4", "description":"3) Ricavi per prestazioni e cessioni a terzi"});
   dataStructure.push({"id":"RB4", "type":"group", "indent":"", "bclass":"4", "description":"4) Contributi da enti pubblici"});
   dataStructure.push({"id":"RB5", "type":"group", "indent":"", "bclass":"4", "description":"5) Proventi da contratti con enti pubblici"});
   dataStructure.push({"id":"RB6", "type":"group", "indent":"", "bclass":"4", "description":"6) Altri ricavi, rendite e proventi"});
   dataStructure.push({"id":"RB7", "type":"group", "indent":"", "bclass":"4", "description":"7) Rimanenze finali"});
   dataStructure.push({"id":"RB", "type":"total", "indent":"", "description":"Totale", "sum":"RB1;RB2;RB3;RB4;RB5;RB6;RB7"});
   dataStructure.push({"id":"dRC", "type":"title", "indent":"", "description":"C) Ricavi, rendite e proventi da attività di raccolta fondi"});
   dataStructure.push({"id":"RC1", "type":"group", "indent":"", "bclass":"4", "description":"1) Proventi da raccolte fondi abituali"});
   dataStructure.push({"id":"RC2", "type":"group", "indent":"", "bclass":"4", "description":"2) Proventi da raccolte fondi occasionali"});
   dataStructure.push({"id":"RC3", "type":"group", "indent":"", "bclass":"4", "description":"3) Altri proventi"});
   dataStructure.push({"id":"RC", "type":"total", "indent":"", "description":"Totale", "sum":"RC1;RC2;RC3"});
   dataStructure.push({"id":"dRD", "type":"title", "indent":"", "description":"D) Ricavi, rendite e proventi da attività finanziarie e patrimoniali"});
   dataStructure.push({"id":"RD1", "type":"group", "indent":"", "bclass":"4", "description":"1) Da rapporti bancari"});
   dataStructure.push({"id":"RD2", "type":"group", "indent":"", "bclass":"4", "description":"2) Da altri investimenti finanziari"});
   dataStructure.push({"id":"RD3", "type":"group", "indent":"", "bclass":"4", "description":"3) Da patrimonio edilizio"});
   dataStructure.push({"id":"RD4", "type":"group", "indent":"", "bclass":"4", "description":"4) Da altri beni patrimoniali"});
   dataStructure.push({"id":"RD5", "type":"group", "indent":"", "bclass":"4", "description":"5) Altri proventi"});
   dataStructure.push({"id":"RD", "type":"total", "indent":"", "description":"Totale", "sum":"RD1;RD2;RD3;RD4;RD5"});
   dataStructure.push({"id":"dRE", "type":"title", "indent":"", "description":"E) Proventi di supporto generale"});
   dataStructure.push({"id":"RE1", "type":"group", "indent":"", "bclass":"4", "description":"1) Proventi da distacco del personale"});
   dataStructure.push({"id":"RE2", "type":"group", "indent":"", "bclass":"4", "description":"2) Altri proventi di supporto generale"});
   dataStructure.push({"id":"RE", "type":"total", "indent":"", "description":"Totale", "sum":"RE1;RE2"});
   dataStructure.push({"id":"R", "type":"total", "indent":"", "description":"TOTALE PROVENTI E RICAVI", "sum":"RA;RB;RC;RD;RE"});

   /* AVANZO / DISAVANZO */
      // => ricavi-costi (es RA;-CA)
   dataStructure.push({"id":"RA-CA", "type":"total", "indent":"", "description":"Avanzo/disavanzo attività di interesse generale (+/-)", "sum":"RA;-CA"});
   dataStructure.push({"id":"RB-CB", "type":"total", "indent":"", "description":"Avanzo/disavanzo attività diverse (+/-)", "sum":"RB;-CB"});
   dataStructure.push({"id":"RC-CC", "type":"total", "indent":"", "description":"Avanzo/disavanzo attività di raccolta fondi", "sum":"RC;-CC"});
   dataStructure.push({"id":"RD-CD", "type":"total", "indent":"", "description":"Avanzo/disavanzo attività finanziarie e patrimoniali (+/-)", "sum":"RD;-CD"});
   dataStructure.push({"id":"RE-CE", "type":"total", "indent":"", "description":"Avanzo/disavanzo supporto generale (+/-)", "sum":"RE;-CE"});   
   dataStructure.push({"id":"TADPI", "type":"total", "indent":"", "description":"Avanzo/disavanzo d’esercizio prima delle imposte (+/-)", "sum":"RA-CA;RB-CB;RC-CC;RD-CD;RE-CE"});
   dataStructure.push({"id":"TADES", "type":"total", "indent":"", "description":"Avanzo/disavanzo d’esercizio (+/-)", "sum":"TADPI;IM"});
   dataStructure.push({"id":"PAIV", "type":"total", "indent":"", "description":"IV - Avanzo/disavanzo d'esercizio", "sum":"TADES"});

   /* COSTI FIGURATIVI */
   dataStructure.push({"id":"CG1", "type":"group", "indent":"", "bclass":"3", "description":"1) da attività di interesse generale"});
   dataStructure.push({"id":"CG2", "type":"group", "indent":"", "bclass":"3", "description":"2) da attività diverse"});
   dataStructure.push({"id":"CG", "type":"total", "indent":"", "description":"Totale", "sum":"CG1;CG2"});

   /* PROVENTI FIGURATIVI */
   dataStructure.push({"id":"RG1", "type":"group", "indent":"", "bclass":"4", "description":"1) da attività di interesse generale"});
   dataStructure.push({"id":"RG2", "type":"group", "indent":"", "bclass":"4", "description":"2) da attività diverse"});
   dataStructure.push({"id":"RG", "type":"total", "indent":"", "description":"Totale", "sum":"RG1;RG2"});

   return dataStructure;
}

//Main function
function exec(string) {

   //Check if we are on an opened document
   if (!Banana.document) {
      return;
   }

   //Check the banana version
   var isCurrentBananaVersionSupported = bananaRequiredVersion(BAN_VERSION, BAN_EXPM_VERSION);
   if (!isCurrentBananaVersionSupported) {
      return "@Cancel";
   }

   var userParam = initUserParam();
   var savedParam = Banana.document.getScriptSettings();
   if (savedParam && savedParam.length > 0) {
      userParam = JSON.parse(savedParam);
   }
   // If needed show the settings dialog to the user
   if (!options || !options.useLastSettings) {
      userParam = settingsDialog(); // From properties
   }
   if (!userParam) {
      return "@Cancel";
   }

   //Check that user entered the gr column in extension settings
   if (!userParam.column) {
      Banana.document.addMessage(getErrorMessage(ID_ERR_GRUPPO_MANCANTE));
      return "@Cancel";
   }

   /**
    * 1. Loads the data structure
    */
   var dataStructure = loadDataStructure();

   /**
    * 2. Calls methods to load balances, calculate totals, format amounts
    * and check entries that can be excluded
    */
   const bReport = new BReport(Banana.document, userParam, dataStructure);
   bReport.loadBalances();
   bReport.calculateTotals(["currentAmount", "previousAmount"]);
   bReport.formatValues(["currentAmount", "previousAmount"]);
   bReport.excludeEntries();
   //Banana.console.log(JSON.stringify(dataStructure, "", " "));

   /**
    * 3. Creates the report
    */
   var stylesheet = Banana.Report.newStyleSheet();
   var report = printRendicontoModA(Banana.document, userParam, bReport, stylesheet);
   setCss(Banana.document, stylesheet, userParam);
   Banana.Report.preview(report, stylesheet);
}

function printRow(userParam, bReport, table, gr, styleColumnDescription, styleColumnAmount) {
   var styleIndentLevel = "";
   var indentLevel = bReport.getObjectIndent(gr);
   if (indentLevel) {
      styleIndentLevel = indentLevel;
   }
   if (userParam.compattastampa) {
      // Prints only elements cannot be excluded
      if (!bReport.getObjectValue(gr, "exclude")) { // false = cannot be excluded
         tableRow = table.addRow();
         tableRow.addCell(bReport.getObjectDescription(gr), styleColumnDescription + " " + styleIndentLevel, 1);
         if (bReport.getObjectType(gr) === 'group' || bReport.getObjectType(gr) === 'total') { //do not print amounts for title types
            tableRow.addCell(bReport.getObjectCurrentAmountFormatted(gr), styleColumnAmount, 1);
            tableRow.addCell(bReport.getObjectPreviousAmountFormatted(gr), styleColumnAmount, 1);   
         }
      }
   }
   else {
      // Prints all elements
      tableRow = table.addRow();
      tableRow.addCell(bReport.getObjectDescription(gr), styleColumnDescription + " " + styleIndentLevel, 1);
      if (bReport.getObjectType(gr) === 'group' || bReport.getObjectType(gr) === 'total') { //do not print amounts for title types
         tableRow.addCell(bReport.getObjectCurrentAmountFormatted(gr), styleColumnAmount, 1);
         tableRow.addCell(bReport.getObjectPreviousAmountFormatted(gr), styleColumnAmount, 1);   
      } 
   }
}

function printSubRow(userParam, bReport, table, gr, styleColumnDescription, styleColumnAmount) {
   var styleIndentLevel = "";
   var indentLevel = bReport.getObjectIndent(gr);
   if (indentLevel) {
      styleIndentLevel = indentLevel;
   }
   if (userParam.compattastampa) {
      // Prints only elements cannot be excluded
      if (!bReport.getObjectValue(gr, "exclude")) { // false = cannot be excluded
         tableRow = table.addRow();
         tableRow.addCell("("+bReport.getObjectDescription(gr) + ": saldo anno corrente " + bReport.getObjectCurrentAmountFormatted(gr) + " ; saldo anno precedente " + bReport.getObjectPreviousAmountFormatted(gr) + ")", styleColumnDescription + " " + styleIndentLevel, 1);  
      }
   }
   else {
      // Prints all elements
      tableRow = table.addRow();
      tableRow.addCell("("+bReport.getObjectDescription(gr) + ": saldo anno corrente " + bReport.getObjectCurrentAmountFormatted(gr) + " ; saldo anno precedente " + bReport.getObjectPreviousAmountFormatted(gr) + ")", styleColumnDescription + " " + styleIndentLevel, 1);
   }
}

function printRendicontoModA(banDoc, userParam, bReport, stylesheet) {

   var report = Banana.Report.newReport("Stato patrimoniale (MOD. A)");
   var startDate = userParam.selectionStartDate;
   var endDate = userParam.selectionEndDate;
   var currentYear = Banana.Converter.toDate(banDoc.info("AccountingDataBase", "OpeningDate")).getFullYear();
   var previousYear = currentYear - 1;

   // Logo
   var headerParagraph = report.getHeader().addSection();
   if (userParam.logo) {
      headerParagraph = report.addSection("");
      var logoFormat = Banana.Report.logoFormat(userParam.logoname);
      if (logoFormat) {
         var logoElement = logoFormat.createDocNode(headerParagraph, stylesheet, "logo");
         report.getHeader().addChild(logoElement);
      }
      report.addParagraph(" ", "");
   }

   if (userParam.printheader) {
      var company = banDoc.info("AccountingDataBase","Company");
      var address1 = banDoc.info("AccountingDataBase","Address1");
      var zip = banDoc.info("AccountingDataBase","Zip");
      var city = banDoc.info("AccountingDataBase","City");
      var phone = banDoc.info("AccountingDataBase","Phone");
      var web = banDoc.info("AccountingDataBase","Web");
      var email = banDoc.info("AccountingDataBase","Email");
      if (company) {
         headerParagraph.addParagraph(company, "");
      }
      if (address1) {
         headerParagraph.addParagraph(address1, "");
      }
      if (zip && city) {
         headerParagraph.addParagraph(zip + " " + city, "");
      }
      if (phone) {
         headerParagraph.addParagraph("Tel. " + phone, "");
      }
      if (web) {
         headerParagraph.addParagraph("Web: " + web, "");
      }
      if (email) {
         headerParagraph.addParagraph("Email: " + email, "");
      }
      headerParagraph.addParagraph(" ", "");
   }

   var title = "";
   if (userParam.title) {
      title = userParam.title;
   } else {
      title = "STATO PATRIMONIALE (MOD. A) ANNO " + currentYear;
   }
   if (userParam.printtitle) {
      report.addParagraph(" ", "");
      report.addParagraph(title, "heading2");
      report.addParagraph(" ", "");
   }
 

   /**************************************************************************************
   * ATTIVO
   **************************************************************************************/

   var table = report.addTable("table");
   var column1 = table.addColumn("column1");
   var column2 = table.addColumn("column2");
   var column3 = table.addColumn("column3");


   var tableIntestazione = table.getHeader();
   tableRow = tableIntestazione.addRow(); 
   tableRow.addCell("", "", 1);
   tableRow.addCell(Banana.Converter.toLocaleDateFormat(endDate), "table-header", 1);
   tableRow.addCell("31.12." + previousYear, "table-header", 1);

   // tableRow = table.addRow();
   // tableRow.addCell("", "", 1);
   // tableRow.addCell(Banana.Converter.toLocaleDateFormat(endDate), "table-header", 1);
   // tableRow.addCell("31.12." + previousYear, "table-header", 1);

   tableRow = table.addRow();
   tableRow.addCell("ATTIVO", "assets-title lvl0", 3);

   /* AA */
   printRow(userParam, bReport, table, "AA", "description-groups", "amount-groups");
   /* dAB */
   printRow(userParam, bReport, table, "dAB", "description-groups", "amount-groups");
   /* dABI */
   printRow(userParam, bReport, table, "dABI", "description-groups", "amount-groups");
   /* ABI1 */
   printRow(userParam, bReport, table, "ABI1", "description-groups", "amount-groups");
   /* ABI2 */
   printRow(userParam, bReport, table, "ABI2", "description-groups", "amount-groups");
   /* ABI3 */
   printRow(userParam, bReport, table, "ABI3", "description-groups", "amount-groups");
   /* ABI4 */
   printRow(userParam, bReport, table, "ABI4", "description-groups", "amount-groups");
   /* ABI5 */
   printRow(userParam, bReport, table, "ABI5", "description-groups", "amount-groups");
   /* ABI6 */
   printRow(userParam, bReport, table, "ABI6", "description-groups", "amount-groups");
   /* ABI7 */
   printRow(userParam, bReport, table, "ABI7", "description-groups", "amount-groups");
   /* tot ABI */
   printRow(userParam, bReport, table, "ABI", "description-groups", "amount-groups-totals");
   /* dABII */
   printRow(userParam, bReport, table, "dABII", "description-groups", "amount-groups");
   /* ABII1 */
   printRow(userParam, bReport, table, "ABII1", "description-groups", "amount-groups");
   /* ABII2 */
   printRow(userParam, bReport, table, "ABII2", "description-groups", "amount-groups");
   /* ABII3 */
   printRow(userParam, bReport, table, "ABII3", "description-groups", "amount-groups");
   /* ABII4 */
   printRow(userParam, bReport, table, "ABII4", "description-groups", "amount-groups");
   /* ABII5 */
   printRow(userParam, bReport, table, "ABII5", "description-groups", "amount-groups");
   /* tot ABII */
   printRow(userParam, bReport, table, "ABII", "description-groups", "amount-groups-totals");
   /* dABIII */
   printRow(userParam, bReport, table, "dABIII", "description-groups", "amount-groups");
   /* ABIII1 */
   printRow(userParam, bReport, table, "ABIII1", "description-groups", "amount-groups");
   /* ABIII1a */
   printRow(userParam, bReport, table, "ABIII1a", "description-groups", "amount-groups");
   /* ABIII1b */
   printRow(userParam, bReport, table, "ABIII1b", "description-groups", "amount-groups");
   /* ABIII1c */
   printRow(userParam, bReport, table, "ABIII1c", "description-groups", "amount-groups");
   /* ABIII2 */
   printRow(userParam, bReport, table, "ABIII2", "description-groups", "amount-groups");
   /* ABIII2a */
   printRow(userParam, bReport, table, "ABIII2a", "description-groups", "amount-groups");
   if (bReport.getObjectCurrentAmountFormatted("ABIII2a") || bReport.getObjectPreviousAmountFormatted("ABIII2a")) {
      printSubRow(userParam, bReport, table, "ABIII2ao", "description-groups", "amount-groups");
   }
   /* ABIII2b */
   printRow(userParam, bReport, table, "ABIII2b", "description-groups", "amount-groups");
   if (bReport.getObjectCurrentAmountFormatted("ABIII2b") || bReport.getObjectPreviousAmountFormatted("ABIII2b")) {
      printSubRow(userParam, bReport, table, "ABIII2bo", "description-groups", "amount-groups");
   }
   /* ABIII2c */
   printRow(userParam, bReport, table, "ABIII2c", "description-groups", "amount-groups");
   if (bReport.getObjectCurrentAmountFormatted("ABIII2c") || bReport.getObjectPreviousAmountFormatted("ABIII2c")) {
      printSubRow(userParam, bReport, table, "ABIII2co", "description-groups", "amount-groups");
   }
   /* ABIII2d */
   printRow(userParam, bReport, table, "ABIII2d", "description-groups", "amount-groups");
   if (bReport.getObjectCurrentAmountFormatted("ABIII2d") || bReport.getObjectPreviousAmountFormatted("ABIII2d")) {
      printSubRow(userParam, bReport, table, "ABIII2do", "description-groups", "amount-groups");
   }
   /* ABIII3 */
   printRow(userParam, bReport, table, "ABIII3", "description-groups", "amount-groups");
   /* tot ABIII */
   printRow(userParam, bReport, table, "ABIII", "description-groups", "amount-groups-totals");
   /* tot AB */
   printRow(userParam, bReport, table, "AB", "description-groups", "amount-totals");
   /* dAC */
   printRow(userParam, bReport, table, "dAC", "description-groups", "amount-groups");
   /* dACI */
   printRow(userParam, bReport, table, "dACI", "description-groups", "amount-groups");
   /* ACI1 */
   printRow(userParam, bReport, table, "ACI1", "description-groups", "amount-groups");
   /* ACI2 */
   printRow(userParam, bReport, table, "ACI2", "description-groups", "amount-groups");
   /* ACI3 */
   printRow(userParam, bReport, table, "ACI3", "description-groups", "amount-groups");
   /* ACI4 */
   printRow(userParam, bReport, table, "ACI4", "description-groups", "amount-groups");
   /* ACI5 */
   printRow(userParam, bReport, table, "ACI5", "description-groups", "amount-groups");
   /* tot ACI */
   printRow(userParam, bReport, table, "ACI", "description-groups", "amount-groups-totals");
   /* dACII */
   printRow(userParam, bReport, table, "dACII", "description-groups", "amount-groups");
   /* ACII1 */
   printRow(userParam, bReport, table, "ACII1", "description-groups", "amount-groups");
   if (bReport.getObjectCurrentAmountFormatted("ACII1") || bReport.getObjectPreviousAmountFormatted("ACII1")) {
      printSubRow(userParam, bReport, table, "ACII1e", "description-groups", "amount-groups");
   }
   /* ACII2 */
   printRow(userParam, bReport, table, "ACII2", "description-groups", "amount-groups");
   if (bReport.getObjectCurrentAmountFormatted("ACII2") || bReport.getObjectPreviousAmountFormatted("ACII2")) {
      printSubRow(userParam, bReport, table, "ACII2e", "description-groups", "amount-groups");
   }
   /* ACII3 */
   printRow(userParam, bReport, table, "ACII3", "description-groups", "amount-groups");
   if (bReport.getObjectCurrentAmountFormatted("ACII3") || bReport.getObjectPreviousAmountFormatted("ACII3")) {
      printSubRow(userParam, bReport, table, "ACII3e", "description-groups", "amount-groups");
   }
   /* ACII4 */
   printRow(userParam, bReport, table, "ACII4", "description-groups", "amount-groups");
   if (bReport.getObjectCurrentAmountFormatted("ACII4") || bReport.getObjectPreviousAmountFormatted("ACII4")) {
      printSubRow(userParam, bReport, table, "ACII4e", "description-groups", "amount-groups");
   }
   /* ACII5 */
   printRow(userParam, bReport, table, "ACII5", "description-groups", "amount-groups");
   if (bReport.getObjectCurrentAmountFormatted("ACII5") || bReport.getObjectPreviousAmountFormatted("ACII5")) {
      printSubRow(userParam, bReport, table, "ACII5e", "description-groups", "amount-groups");
   }
   /* ACII6 */
   printRow(userParam, bReport, table, "ACII6", "description-groups", "amount-groups");
   if (bReport.getObjectCurrentAmountFormatted("ACII6") || bReport.getObjectPreviousAmountFormatted("ACII6")) {
      printSubRow(userParam, bReport, table, "ACII6e", "description-groups", "amount-groups");
   }
   /* ACII7 */
   printRow(userParam, bReport, table, "ACII7", "description-groups", "amount-groups");
   if (bReport.getObjectCurrentAmountFormatted("ACII7") || bReport.getObjectPreviousAmountFormatted("ACII7")) {
      printSubRow(userParam, bReport, table, "ACII7e", "description-groups", "amount-groups");
   }
   /* ACII8 */
   printRow(userParam, bReport, table, "ACII8", "description-groups", "amount-groups");
   if (bReport.getObjectCurrentAmountFormatted("ACII8") || bReport.getObjectPreviousAmountFormatted("ACII8")) {
      printSubRow(userParam, bReport, table, "ACII8e", "description-groups", "amount-groups");
   }
   /* ACII9 */
   printRow(userParam, bReport, table, "ACII9", "description-groups", "amount-groups");
   if (bReport.getObjectCurrentAmountFormatted("ACII9") || bReport.getObjectPreviousAmountFormatted("ACII9")) {
      printSubRow(userParam, bReport, table, "ACII9e", "description-groups", "amount-groups");
   }
   /* ACII10 */
   printRow(userParam, bReport, table, "ACII10", "description-groups", "amount-groups");
   if (bReport.getObjectCurrentAmountFormatted("ACII10") || bReport.getObjectPreviousAmountFormatted("ACII10")) {
      printSubRow(userParam, bReport, table, "ACII10e", "description-groups", "amount-groups");
   }
   /* ACII11 */
   printRow(userParam, bReport, table, "ACII11", "description-groups", "amount-groups");
   if (bReport.getObjectCurrentAmountFormatted("ACII11") || bReport.getObjectPreviousAmountFormatted("ACII11")) {
      printSubRow(userParam, bReport, table, "ACII11e", "description-groups", "amount-groups");
   }
   /* ACII12 */
   printRow(userParam, bReport, table, "ACII12", "description-groups", "amount-groups");
   if (bReport.getObjectCurrentAmountFormatted("ACII12") || bReport.getObjectPreviousAmountFormatted("ACII12")) {
      printSubRow(userParam, bReport, table, "ACII12e", "description-groups", "amount-groups");
   }
   /* tot ACII */
   printRow(userParam, bReport, table, "ACII", "description-groups", "amount-groups-totals");
   /* dACIII */
   printRow(userParam, bReport, table, "dACIII", "description-groups", "amount-groups");
   /* ACIII1 */
   printRow(userParam, bReport, table, "ACIII1", "description-groups", "amount-groups");
   /* ACIII2 */
   printRow(userParam, bReport, table, "ACIII2", "description-groups", "amount-groups");
   /* ACIII3 */
   printRow(userParam, bReport, table, "ACIII3", "description-groups", "amount-groups");
   /* tot ACIII */
   printRow(userParam, bReport, table, "ACIII", "description-groups", "amount-groups-totals");
   /* dACIV */
   printRow(userParam, bReport, table, "dACIV", "description-groups", "amount-groups");
   /* ACIV1 */
   printRow(userParam, bReport, table, "ACIV1", "description-groups", "amount-groups");
   /* ACIV2 */
   printRow(userParam, bReport, table, "ACIV2", "description-groups", "amount-groups");
   /* ACIV3 */
   printRow(userParam, bReport, table, "ACIV3", "description-groups", "amount-groups");
   /* tot ACIV */
   printRow(userParam, bReport, table, "ACIV", "description-groups", "amount-groups-totals");
   /* tot AC */
   printRow(userParam, bReport, table, "AC", "description-groups", "amount-groups-totals");
   /* AD */
   printRow(userParam, bReport, table, "AD", "description-groups", "amount-groups");

   report.addPageBreak();

   /**************************************************************************************
   * PASSIVO
   **************************************************************************************/

   if (userParam.printtitle) {
      report.addParagraph(" ", "");
      report.addParagraph(title, "heading2");
      report.addParagraph(" ", "");
   }

   var table = report.addTable("table");
   var column1 = table.addColumn("column1");
   var column2 = table.addColumn("column2");
   var column3 = table.addColumn("column3");

   var tableIntestazione = table.getHeader();
   tableRow = tableIntestazione.addRow(); 
   tableRow.addCell("", "", 1);
   tableRow.addCell(Banana.Converter.toLocaleDateFormat(endDate), "table-header", 1);
   tableRow.addCell("31.12." + previousYear, "table-header", 1);

   tableRow = table.addRow();
   tableRow.addCell("PASSIVO", "liabilties-title lvl0", 3);

   /* dPA */
   printRow(userParam, bReport, table, "dPA", "description-groups", "amount-groups");
   /* PAI */
   printRow(userParam, bReport, table, "PAI", "description-groups", "amount-groups");
   /* dPAII */
   printRow(userParam, bReport, table, "dPAII", "description-groups", "amount-groups");
   /* PAII1 */
   printRow(userParam, bReport, table, "PAII1", "description-groups", "amount-groups");
   /* PAII2 */
   printRow(userParam, bReport, table, "PAII2", "description-groups", "amount-groups");
   /* PAII3 */
   printRow(userParam, bReport, table, "PAII3", "description-groups", "amount-groups");
   /* tot PAII */
   printRow(userParam, bReport, table, "PAII", "description-groups", "amount-groups-totals");
   /* dPAIII */
   printRow(userParam, bReport, table, "dPAIII", "description-groups", "amount-groups");
   /* PAIII1 */
   printRow(userParam, bReport, table, "PAIII1", "description-groups", "amount-groups");
   /* PAIII2 */
   printRow(userParam, bReport, table, "PAIII2", "description-groups", "amount-groups");
   /* tot PAIII */
   printRow(userParam, bReport, table, "PAIII", "description-groups", "amount-groups-totals");
   /* PAIV */
   printRow(userParam, bReport, table, "PAIV", "description-groups", "amount-groups");
   /* tot PA */
   printRow(userParam, bReport, table, "PA", "description-groups", "amount-totals");
   /* dPB */
   printRow(userParam, bReport, table, "dPB", "description-groups", "amount-groups");
   /* PB1 */
   printRow(userParam, bReport, table, "PB1", "description-groups", "amount-groups");
   /* PB2 */
   printRow(userParam, bReport, table, "PB2", "description-groups", "amount-groups");
   /* PB3 */
   printRow(userParam, bReport, table, "PB3", "description-groups", "amount-groups");
   /* tot PB */
   printRow(userParam, bReport, table, "PB", "description-groups", "amount-totals");
   /* PC */
   printRow(userParam, bReport, table, "PC", "description-groups", "amount-groups");
   /* dPD */
   printRow(userParam, bReport, table, "dPD", "description-groups", "amount-groups");
   /* PD1 */
   printRow(userParam, bReport, table, "PD1", "description-groups", "amount-groups");
   if (bReport.getObjectCurrentAmountFormatted("PD1") || bReport.getObjectPreviousAmountFormatted("PD1")) {
      printSubRow(userParam, bReport, table, "PD1e", "description-groups", "amount-groups");
   }
   /* PD2 */
   printRow(userParam, bReport, table, "PD2", "description-groups", "amount-groups");
   if (bReport.getObjectCurrentAmountFormatted("PD2") || bReport.getObjectPreviousAmountFormatted("PD2")) {
      printSubRow(userParam, bReport, table, "PD2e", "description-groups", "amount-groups");
   }
   /* PD3 */
   printRow(userParam, bReport, table, "PD3", "description-groups", "amount-groups");
   if (bReport.getObjectCurrentAmountFormatted("PD3") || bReport.getObjectPreviousAmountFormatted("PD1")) {
      printSubRow(userParam, bReport, table, "PD3e", "description-groups", "amount-groups");
   }
   /* PD4 */
   printRow(userParam, bReport, table, "PD4", "description-groups", "amount-groups");
   if (bReport.getObjectCurrentAmountFormatted("PD4") || bReport.getObjectPreviousAmountFormatted("PD4")) {
      printSubRow(userParam, bReport, table, "PD4e", "description-groups", "amount-groups");
   }
   /* PD5 */
   printRow(userParam, bReport, table, "PD5", "description-groups", "amount-groups");
   if (bReport.getObjectCurrentAmountFormatted("PD5") || bReport.getObjectPreviousAmountFormatted("PD5")) {
      printSubRow(userParam, bReport, table, "PD5e", "description-groups", "amount-groups");
   }
   /* PD6 */
   printRow(userParam, bReport, table, "PD6", "description-groups", "amount-groups");
   if (bReport.getObjectCurrentAmountFormatted("PD6") || bReport.getObjectPreviousAmountFormatted("PD6")) {
      printSubRow(userParam, bReport, table, "PD6e", "description-groups", "amount-groups");
   }
   /* PD7 */
   printRow(userParam, bReport, table, "PD7", "description-groups", "amount-groups");
   if (bReport.getObjectCurrentAmountFormatted("PD7") || bReport.getObjectPreviousAmountFormatted("PD7")) {
      printSubRow(userParam, bReport, table, "PD7e", "description-groups", "amount-groups");
   }
   /* PD8 */
   printRow(userParam, bReport, table, "PD8", "description-groups", "amount-groups");
   if (bReport.getObjectCurrentAmountFormatted("PD8") || bReport.getObjectPreviousAmountFormatted("PD8")) {
      printSubRow(userParam, bReport, table, "PD8e", "description-groups", "amount-groups");
   }
   /* PD9 */
   printRow(userParam, bReport, table, "PD9", "description-groups", "amount-groups");
   if (bReport.getObjectCurrentAmountFormatted("PD9") || bReport.getObjectPreviousAmountFormatted("PD9")) {
      printSubRow(userParam, bReport, table, "PD9e", "description-groups", "amount-groups");
   }
   /* PD10 */
   printRow(userParam, bReport, table, "PD10", "description-groups", "amount-groups");
   if (bReport.getObjectCurrentAmountFormatted("PD10") || bReport.getObjectPreviousAmountFormatted("PD10")) {
      printSubRow(userParam, bReport, table, "PD10e", "description-groups", "amount-groups");
   }
   /* PD11 */
   printRow(userParam, bReport, table, "PD11", "description-groups", "amount-groups");
   if (bReport.getObjectCurrentAmountFormatted("PD11") || bReport.getObjectPreviousAmountFormatted("PD11")) {
      printSubRow(userParam, bReport, table, "PD11e", "description-groups", "amount-groups");
   }
   /* PD12 */
   printRow(userParam, bReport, table, "PD12", "description-groups", "amount-groups");
   if (bReport.getObjectCurrentAmountFormatted("PD12") || bReport.getObjectPreviousAmountFormatted("PD12")) {
      printSubRow(userParam, bReport, table, "PD12e", "description-groups", "amount-groups");
   }
   /* tot PD */
   printRow(userParam, bReport, table, "PD", "description-groups", "amount-totals");
   /* PE */
   printRow(userParam, bReport, table, "PE", "description-groups", "amount-groups");



   //checkResults(banDoc, startDate, endDate);



   addFooter(report);
   return report;
}

function checkResults(banDoc, startDate, endDate) {

   /* tot A */
   var objA = banDoc.currentBalance("Gr=A", startDate, endDate);
   currentA = objA.balance;

   /* tot P */
   var objP = banDoc.currentBalance("Gr=P", startDate, endDate);
   currentP = objP.balance;

   var res0 = Banana.SDecimal.add(currentA, currentP);
   if (res0 !== "0") {
      Banana.document.addMessage("Differenza Attivo e Passivo.");
   }
}

function addFooter(report) {
   report.getFooter().addClass("footer");
   report.getFooter().addText("- ", "");
   report.getFooter().addFieldPageNr();
   report.getFooter().addText(" -", "");
}

function setCss(banDoc, repStyleObj, userParam) {
   var textCSS = "";
   var file = Banana.IO.getLocalFile("file:script/rendicontoModA.css");
   var fileContent = file.read();
   if (!file.errorString) {
      Banana.IO.openPath(fileContent);
      //Banana.console.log(fileContent);
      textCSS = fileContent;
   } else {
      Banana.console.log(file.errorString);
   }
   // Parse the CSS text
   repStyleObj.parse(textCSS);
}




/**************************************************************************************
 * Functions to manage the parameters
 **************************************************************************************/
function convertParam(userParam) {

   var convertedParam = {};
   convertedParam.version = '1.0';
   convertedParam.data = [];

   var currentParam = {};
   currentParam.name = 'logo';
   currentParam.title = 'Stampa logo intestazione pagina';
   currentParam.type = 'bool';
   currentParam.value = userParam.logo ? true : false;
   currentParam.defaultvalue = false;
   currentParam.readValue = function() {
      userParam.logo = this.value;
   }
   convertedParam.data.push(currentParam);

   var currentParam = {};
   currentParam.name = 'logoname';
   currentParam.title = 'Nome logo (Imposta Logo -> Personalizzazione)';
   currentParam.type = 'string';
   currentParam.value = userParam.logoname ? userParam.logoname : 'Logo';
   currentParam.defaultvalue = 'Logo';
   currentParam.readValue = function() {
     userParam.logoname = this.value;
   }
   convertedParam.data.push(currentParam);

   currentParam = {};
   currentParam.name = 'printheader';
   currentParam.title = 'Stampa testo intestazione pagina (Proprietà file -> Indirizzo)';
   currentParam.type = 'bool';
   currentParam.value = userParam.printheader ? true : false;
   currentParam.defaultvalue = false;
   currentParam.readValue = function() {
    userParam.printheader = this.value;
   }
   convertedParam.data.push(currentParam);

   currentParam = {};
   currentParam.name = 'printtitle';
   currentParam.title = 'Stampa titolo';
   currentParam.type = 'bool';
   currentParam.value = userParam.printtitle ? true : false;
   currentParam.defaultvalue = true;
   currentParam.readValue = function() {
    userParam.printtitle = this.value;
   }
   convertedParam.data.push(currentParam);

   var currentParam = {};
   currentParam.name = 'title';
   currentParam.title = 'Testo titolo (vuoto = testo predefinito)';
   currentParam.type = 'string';
   currentParam.value = userParam.title ? userParam.title : '';
   currentParam.defaultvalue = '';
   currentParam.readValue = function() {
      userParam.title = this.value;
   }
   convertedParam.data.push(currentParam);

   var currentParam = {};
   currentParam.name = 'column';
   currentParam.title = "Colonna raggruppamento (nome XML colonna)";
   currentParam.type = 'string';
   currentParam.value = userParam.column ? userParam.column : '';
   currentParam.defaultvalue = 'Gr';
   currentParam.readValue = function() {
      userParam.column = this.value;
   }
   convertedParam.data.push(currentParam);

   var currentParam = {};
   currentParam.name = 'compattastampa';
   currentParam.title = 'Escludi voci con importi nulli per due esercizi consecutivi';
   currentParam.type = 'bool';
   currentParam.value = userParam.compattastampa ? true : false;
   currentParam.defaultvalue = false;
   currentParam.readValue = function() {
      userParam.compattastampa = this.value;
   }
   convertedParam.data.push(currentParam);

   return convertedParam;
}

function initUserParam() {
   var userParam = {};
   userParam.logo = false;
   userParam.logoname = 'Logo';
   userParam.printheader = false;
   userParam.printtitle = true;
   userParam.title = '';
   userParam.column = 'Gr';
   userParam.compattastampa = false;
   return userParam;
}

function parametersDialog(userParam) {
   if (typeof(Banana.Ui.openPropertyEditor) !== 'undefined') {
      var dialogTitle = "Parametri";
      var convertedParam = convertParam(userParam);
      var pageAnchor = 'dlgSettings';
      if (!Banana.Ui.openPropertyEditor(dialogTitle, convertedParam, pageAnchor)) {
         return null;
      }
      for (var i = 0; i < convertedParam.data.length; i++) {
         // Read values to userParam (through the readValue function)
         convertedParam.data[i].readValue();
      }
      //  Reset reset default values
      userParam.useDefaultTexts = false;
   }

   return userParam;
}

function settingsDialog() {
   var userParam = initUserParam();
   var savedParam = Banana.document.getScriptSettings();
   if (savedParam && savedParam.length > 0) {
      userParam = JSON.parse(savedParam);
   }

   //We take the accounting "starting date" and "ending date" from the document. These will be used as default dates
   var docStartDate = Banana.document.startPeriod();
   var docEndDate = Banana.document.endPeriod();

   //A dialog window is opened asking the user to insert the desired period. By default is the accounting period
   var selectedDates = Banana.Ui.getPeriod('', docStartDate, docEndDate,
      userParam.selectionStartDate, userParam.selectionEndDate, userParam.selectionChecked);

   //We take the values entered by the user and save them as "new default" values.
   //This because the next time the script will be executed, the dialog window will contains the new values.
   if (selectedDates) {
      userParam["selectionStartDate"] = selectedDates.startDate;
      userParam["selectionEndDate"] = selectedDates.endDate;
      userParam["selectionChecked"] = selectedDates.hasSelection;
   } else {
      //User clicked cancel
      return null;
   }

   userParam = parametersDialog(userParam); // From propertiess
   if (userParam) {
      var paramToString = JSON.stringify(userParam);
      Banana.document.setScriptSettings(paramToString);
   }

   return userParam;
}





/**************************************************************************************
 * Check the banana version
 **************************************************************************************/
function bananaRequiredVersion(requiredVersion, expmVersion) {
   if (expmVersion) {
      requiredVersion = requiredVersion + "." + expmVersion;
   }
   if (Banana.compareVersion && Banana.compareVersion(Banana.application.version, requiredVersion) < 0) {
      Banana.application.showMessages();
      Banana.document.addMessage(getErrorMessage(ID_ERR_VERSIONE));
      return false;
   }
   return true;
}

