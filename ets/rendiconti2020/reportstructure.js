// Copyright [2020] [Banana.ch SA - Lugano Switzerland]
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.


/* Update: 2020-11-11 */


/**
 * Creates the report structure for each report type.
 * - "id" used as GR/GR1 and to identify the object
 * - "type" used to define the type of data (group, title or total)
 * - "indent" used to define the indent level for the print
 * - "bclass" used to define the bclass of the group
 * - "description" used to define the description text used for the print
 * - "sum" used to define how to calculate the total
 */

//Balance sheet
function createReportStructureStatoPatrimoniale() {

	var reportStructure = [];

	/* ATTIVO */
	reportStructure.push({"id":"AA", "type":"group", "indent":"0", "bclass":"1", "description":"A) Quote associative o apporti ancora dovuti"});
	reportStructure.push({"id":"dAB", "type":"title", "indent":"0", "description":"B) Immobilizzazioni"});
	reportStructure.push({"id":"dABI", "type":"title", "indent":"1", "description":"I - Immobilizzazioni immateriali"});
	reportStructure.push({"id":"ABI1", "type":"group", "indent":"2", "bclass":"1", "description":"1) costi di impianto e di ampliamento"});
	reportStructure.push({"id":"ABI2", "type":"group", "indent":"2", "bclass":"1", "description":"2) costi di sviluppo"});
	reportStructure.push({"id":"ABI3", "type":"group", "indent":"2", "bclass":"1", "description":"3) diritti di brevetto industriale e diritti di utilizzazione delle opere dell'ingegno"});
	reportStructure.push({"id":"ABI4", "type":"group", "indent":"2", "bclass":"1", "description":"4) concessioni, licenze, marchi e diritti simili"});
	reportStructure.push({"id":"ABI5", "type":"group", "indent":"2", "bclass":"1", "description":"5) avviamento"});
	reportStructure.push({"id":"ABI6", "type":"group", "indent":"2", "bclass":"1", "description":"6) immobilizzazioni in corso e acconti"});
	reportStructure.push({"id":"ABI7", "type":"group", "indent":"2", "bclass":"1", "description":"7) altre Immobilizzazioni immateriali"});
	reportStructure.push({"id":"ABI", "type":"total", "indent":"1", "description":"Totale immobilizzazioni immateriali", "sum":"ABI1;ABI2;ABI3;ABI4;ABI5;ABI6;ABI7"});
	reportStructure.push({"id":"dABII", "type":"title", "indent":"1", "description":"II - Immobilizzazioni materiali"});
	reportStructure.push({"id":"ABII1", "type":"group", "indent":"2", "bclass":"1", "description":"1) terreni e fabbricati"});
	reportStructure.push({"id":"ABII2", "type":"group", "indent":"2", "bclass":"1", "description":"2) impianti e macchinari"});
	reportStructure.push({"id":"ABII3", "type":"group", "indent":"2", "bclass":"1", "description":"3) attrezzature"});
	reportStructure.push({"id":"ABII4", "type":"group", "indent":"2", "bclass":"1", "description":"4) altri beni"});
	reportStructure.push({"id":"ABII5", "type":"group", "indent":"2", "bclass":"1", "description":"5) immobilizzazioni in corso e acconti"});
	reportStructure.push({"id":"ABII", "type":"total", "indent":"1", "description":"Totale immobilizzazioni materiali", "sum":"ABII1;ABII2;ABII3;ABII4;ABII5"});
	reportStructure.push({"id":"dABIII", "type":"title", "indent":"1", "description":"III - Immobilizzazioni finanziarie"});
	reportStructure.push({"id":"ABIII1a", "type":"group", "indent":"3", "bclass":"1", "description":"a) partecipazioni in imprese controllate"});
	reportStructure.push({"id":"ABIII1b", "type":"group", "indent":"3", "bclass":"1", "description":"b) partecipazioni in imprese collegate"});
	reportStructure.push({"id":"ABIII1c", "type":"group", "indent":"3", "bclass":"1", "description":"c) partecipazioni in altre imprese"});
	reportStructure.push({"id":"ABIII1", "type":"title", "indent":"2", "description":"1) Partecipazioni", "sum":"ABIII1a;ABIII1b;ABIII1c"});
	reportStructure.push({"id":"ABIII2ao", "type":"group", "indent":"4", "bclass":"1", "description":"esigibili oltre l'anno successivo"});
	reportStructure.push({"id":"ABIII2ae", "type":"group", "indent":"4", "bclass":"1", "description":"esigibili entro l'anno successivo"});
	reportStructure.push({"id":"ABIII2a", "type":"total", "indent":"3", "description":"a) crediti verso imprese controllate", "sum":"ABIII2ao;ABIII2ae", "excludeamount":true});
	reportStructure.push({"id":"ABIII2bo", "type":"group", "indent":"4", "bclass":"1", "description":"esigibili oltre l'anno successivo"});
	reportStructure.push({"id":"ABIII2be", "type":"group", "indent":"4", "bclass":"1", "description":"esigibili entro l'anno successivo"});
	reportStructure.push({"id":"ABIII2b", "type":"total", "indent":"3", "description":"b) crediti verso imprese collegate", "sum":"ABIII2bo;ABIII2be", "excludeamount":true});
	reportStructure.push({"id":"ABIII2co", "type":"group", "indent":"4", "bclass":"1", "description":"esigibili oltre l'anno successivo"});
	reportStructure.push({"id":"ABIII2ce", "type":"group", "indent":"4", "bclass":"1", "description":"esigibili entro l'anno successivo"});
	reportStructure.push({"id":"ABIII2c", "type":"total", "indent":"3", "description":"c) crediti verso altri enti del Terzo settore", "sum":"ABIII2co;ABIII2ce", "excludeamount":true});
	reportStructure.push({"id":"ABIII2do", "type":"group", "indent":"4", "bclass":"1", "description":"esigibili oltre l'anno successivo"});
	reportStructure.push({"id":"ABIII2de", "type":"group", "indent":"4", "bclass":"1", "description":"esigibili entro l'anno successivo"});
	reportStructure.push({"id":"ABIII2d", "type":"total", "indent":"3", "description":"d) crediti verso altri", "sum":"ABIII2do;ABIII2de", "excludeamount":true});
	reportStructure.push({"id":"ABIII2", "type":"title", "indent":"2", "description":"2) Crediti", "sum":"ABIII2a;ABIII2b;ABIII2c;ABIII2d"});
	reportStructure.push({"id":"ABIII3", "type":"group", "indent":"2", "bclass":"1", "description":"3) Altri titoli"});
	reportStructure.push({"id":"ABIII", "type":"total", "indent":"1", "description":"Totale immobilizzazioni finanziarie", "sum":"ABIII1;ABIII2;ABIII3"});
	reportStructure.push({"id":"AB", "type":"total", "indent":"0", "description":"Totale immobilizzazioni B)", "sum":"ABI;ABII;ABIII"});
	reportStructure.push({"id":"dAC", "type":"title", "indent":"0", "description":"C) Attivo circolante"});
	reportStructure.push({"id":"dACI", "type":"title", "indent":"1", "description":"I - Rimanenze"});
	reportStructure.push({"id":"ACI1", "type":"group", "indent":"2", "bclass":"1", "description":"1) Rimanenze materie prime, sussidiarie e di consumo"});
	reportStructure.push({"id":"ACI2", "type":"group", "indent":"2", "bclass":"1", "description":"2) Rimanenze prodotti in corso di lavorazione e semilavorati"});
	reportStructure.push({"id":"ACI3", "type":"group", "indent":"2", "bclass":"1", "description":"3) Rimanenze lavori in corso su ordinazione"});
	reportStructure.push({"id":"ACI4", "type":"group", "indent":"2", "bclass":"1", "description":"4) Rimanenze prodotti finiti e merci"});
	reportStructure.push({"id":"ACI5", "type":"group", "indent":"2", "bclass":"1", "description":"5) Rimanenze acconti"});
	reportStructure.push({"id":"ACI", "type":"total", "indent":"1", "description":"Totale rimanenze", "sum":"ACI1;ACI2;ACI3;ACI4;ACI5"});
	reportStructure.push({"id":"dACII", "type":"title", "indent":"1", "description":"II - Crediti"});
	reportStructure.push({"id":"ACII1o", "type":"group", "indent":"3", "bclass":"1", "description":"esigibili oltre l'anno successivo"});
	reportStructure.push({"id":"ACII1e", "type":"group", "indent":"3", "bclass":"1", "description":"esigibili entro l'anno successivo"});
	reportStructure.push({"id":"TPC", "type":"group", "indent":"", "bclass":"1", "description":"Crediti verso clienti"});
	reportStructure.push({"id":"ACII1P", "type":"total", "indent":"", "description":"Crediti verso utenti e clienti da partitario", "sum":"TPC"});
	reportStructure.push({"id":"ACII1", "type":"total", "indent":"2", "description":"1) Crediti verso utenti e clienti", "sum":"ACII1o;ACII1e;TPC", "excludeamount":true});
	reportStructure.push({"id":"ACII2o", "type":"group", "indent":"3", "bclass":"1", "description":"esigibili oltre l'anno successivo"});
	reportStructure.push({"id":"ACII2e", "type":"group", "indent":"3", "bclass":"1", "description":"esigibili entro l'anno successivo"});
	reportStructure.push({"id":"ACII2", "type":"total", "indent":"2", "description":"2) Crediti verso associati e fondatori", "sum":"ACII2o;ACII2e", "excludeamount":true});
	reportStructure.push({"id":"ACII3o", "type":"group", "indent":"3", "bclass":"1", "description":"esigibili oltre l'anno successivo"});
	reportStructure.push({"id":"ACII3e", "type":"group", "indent":"3", "bclass":"1", "description":"esigibili entro l'anno successivo"});
	reportStructure.push({"id":"ACII3", "type":"total", "indent":"2", "description":"3) Crediti verso enti pubblici", "sum":"ACII3o;ACII3e", "excludeamount":true});
	reportStructure.push({"id":"ACII4o", "type":"group", "indent":"3", "bclass":"1", "description":"esigibili oltre l'anno successivo"});
	reportStructure.push({"id":"ACII4e", "type":"group", "indent":"3", "bclass":"1", "description":"esigibili entro l'anno successivo"});
	reportStructure.push({"id":"ACII4", "type":"total", "indent":"2", "description":"4) Crediti verso soggetti privati per contributi", "sum":"ACII4o;ACII4e", "excludeamount":true});
	reportStructure.push({"id":"ACII5o", "type":"group", "indent":"3", "bclass":"1", "description":"esigibili oltre l'anno successivo"});
	reportStructure.push({"id":"ACII5e", "type":"group", "indent":"3", "bclass":"1", "description":"esigibili entro l'anno successivo"});
	reportStructure.push({"id":"ACII5", "type":"total", "indent":"2", "description":"5) Crediti verso enti della stessa rete associativa", "sum":"ACII5o;ACII5e", "excludeamount":true});
	reportStructure.push({"id":"ACII6o", "type":"group", "indent":"3", "bclass":"1", "description":"esigibili oltre l'anno successivo"});
	reportStructure.push({"id":"ACII6e", "type":"group", "indent":"3", "bclass":"1", "description":"esigibili entro l'anno successivo"});
	reportStructure.push({"id":"ACII6", "type":"total", "indent":"2", "description":"6) Crediti verso altri enti del Terzo settore", "sum":"ACII6o;ACII6e", "excludeamount":true});
	reportStructure.push({"id":"ACII7o", "type":"group", "indent":"3", "bclass":"1", "description":"esigibili oltre l'anno successivo"});
	reportStructure.push({"id":"ACII7e", "type":"group", "indent":"3", "bclass":"1", "description":"esigibili entro l'anno successivo"});
	reportStructure.push({"id":"ACII7", "type":"total", "indent":"2", "description":"7) Crediti verso imprese controllate", "sum":"ACII7o;ACII7e", "excludeamount":true});
	reportStructure.push({"id":"ACII8o", "type":"group", "indent":"3", "bclass":"1", "description":"esigibili oltre l'anno successivo"});
	reportStructure.push({"id":"ACII8e", "type":"group", "indent":"3", "bclass":"1", "description":"esigibili entro l'anno successivo"});
	reportStructure.push({"id":"ACII8", "type":"total", "indent":"2", "description":"8) Crediti verso imprese collegate", "sum":"ACII8o;ACII8e", "excludeamount":true});
	reportStructure.push({"id":"ACII9o", "type":"group", "indent":"3", "bclass":"1", "description":"esigibili oltre l'anno successivo"});
	reportStructure.push({"id":"ACII9e", "type":"group", "indent":"3", "bclass":"1", "description":"esigibili entro l'anno successivo"});
	reportStructure.push({"id":"ACII9", "type":"total", "indent":"2", "description":"9) Crediti tributari", "sum":"ACII9o;ACII9e", "excludeamount":true});
	reportStructure.push({"id":"ACII10o", "type":"group", "indent":"3", "bclass":"1", "description":"esigibili oltre l'anno successivo"});
	reportStructure.push({"id":"ACII10e", "type":"group", "indent":"3", "bclass":"1", "description":"esigibili entro l'anno successivo"});
	reportStructure.push({"id":"ACII10", "type":"total", "indent":"2", "description":"10) Crediti da 5 per mille", "sum":"ACII10o;ACII10e", "excludeamount":true});
	reportStructure.push({"id":"ACII11o", "type":"group", "indent":"3", "bclass":"1", "description":"esigibili oltre l'anno successivo"});
	reportStructure.push({"id":"ACII11e", "type":"group", "indent":"3", "bclass":"1", "description":"esigibili entro l'anno successivo"});
	reportStructure.push({"id":"ACII11", "type":"total", "indent":"2", "description":"11) Crediti per imposte anticipate", "sum":"ACII11o;ACII11e", "excludeamount":true});
	reportStructure.push({"id":"ACII12o", "type":"group", "indent":"3", "bclass":"1", "description":"esigibili oltre l'anno successivo"});
	reportStructure.push({"id":"ACII12e", "type":"group", "indent":"3", "bclass":"1", "description":"esigibili entro l'anno successivo"});
	reportStructure.push({"id":"ACII12", "type":"total", "indent":"2", "description":"12) Crediti verso altri", "sum":"ACII12o;ACII12e", "excludeamount":true});
	reportStructure.push({"id":"ACII", "type":"total", "indent":"1", "description":"Totale crediti", "sum":"ACII1;ACII2;ACII3;ACII4;ACII5;ACII6;ACII7;ACII8;ACII9;ACII10;ACII11;ACII12"});
	reportStructure.push({"id":"dACIII", "type":"title", "indent":"1", "description":"III - Attività finanziarie che non costituiscono immobilizzazioni"});
	reportStructure.push({"id":"ACIII1", "type":"group", "indent":"2", "bclass":"1", "description":"1) Partecipazioni in imprese controllate"});
	reportStructure.push({"id":"ACIII2", "type":"group", "indent":"2", "bclass":"1", "description":"2) Partecipazioni in imprese collegate"});
	reportStructure.push({"id":"ACIII3", "type":"group", "indent":"2", "bclass":"1", "description":"3) Altri titoli"});
	reportStructure.push({"id":"ACIII", "type":"total", "indent":"1", "description":"Totale attività finanziarie che non costituiscono immobilizzazioni", "sum":"ACIII1;ACIII2;ACIII3"});
	reportStructure.push({"id":"dACIV", "type":"title", "indent":"1", "description":"IV - Disponibilità liquide"});
	reportStructure.push({"id":"ACIV1", "type":"group", "indent":"2", "bclass":"1", "description":"1) Depositi bancari e postali"});
	reportStructure.push({"id":"ACIV2", "type":"group", "indent":"2", "bclass":"1", "description":"2) Assegni"});
	reportStructure.push({"id":"ACIV3", "type":"group", "indent":"2", "bclass":"1", "description":"3) Danaro e valori in cassa"});
	reportStructure.push({"id":"ACIV", "type":"total", "indent":"1", "description":"Totale disponibilità liquide", "sum":"ACIV1;ACIV2;ACIV3"});
	reportStructure.push({"id":"AC", "type":"total", "indent":"0", "description":"Totale attivo circolante C)", "sum":"ACI;ACII;ACIII;ACIV"});
	reportStructure.push({"id":"AD", "type":"group", "indent":"0", "bclass":"1", "description":"D) Ratei e risconti attivi"});
	reportStructure.push({"id":"A", "type":"total", "indent":"0", "description":"TOTALE ATTIVO", "sum":"AA;AB;AC;AD"});

	/* PASSIVO */
	reportStructure.push({"id":"dPA", "type":"title", "indent":"0", "description":"A) Patrimonio netto"});
	reportStructure.push({"id":"PAI", "type":"group", "indent":"1", "bclass":"2", "description":"I - Fondo di dotazione dell'ente"});
	reportStructure.push({"id":"dPAII", "type":"title", "indent":"1", "description":"II - Patrimonio vincolato"});
	reportStructure.push({"id":"PAII1", "type":"group", "indent":"2", "bclass":"2", "description":"1) Riserve statutarie"});
	reportStructure.push({"id":"PAII2", "type":"group", "indent":"2", "bclass":"2", "description":"2) Riserve vincolate per decisione degli organi istituzionali"});
	reportStructure.push({"id":"PAII3", "type":"group", "indent":"2", "bclass":"2", "description":"3) Riserve vincolate destinate da terzi"});
	reportStructure.push({"id":"PAII", "type":"total", "indent":"1", "description":"Totale patrimonio vincolato", "sum":"PAII1;PAII2;PAII3"});
	reportStructure.push({"id":"dPAIII", "type":"title", "indent":"1", "description":"III - Patrimonio libero"});
	reportStructure.push({"id":"PAIII1", "type":"group", "indent":"2", "bclass":"2", "description":"1) Riserve di utili o avanzi di gestione"});
	reportStructure.push({"id":"PAIII2", "type":"group", "indent":"2", "bclass":"2", "description":"2) Altre riserve"});
	reportStructure.push({"id":"PAIII", "type":"total", "indent":"1", "description":"Totale patrimonio libero", "sum":"PAIII1;PAIII2"});
	reportStructure.push({"id":"PA", "type":"total", "indent":"0", "description":"Totale patrimonio netto A)", "sum":"PAI;PAII;PAIII;PAIV"});
	reportStructure.push({"id":"dPB", "type":"title", "indent":"0", "description":"B) Fondi per rischi e oneri"});
	reportStructure.push({"id":"PB1", "type":"group", "indent":"1", "bclass":"2", "description":"1) Fondi per trattamento di quiescenza e obblighi simili"});
	reportStructure.push({"id":"PB2", "type":"group", "indent":"1", "bclass":"2", "description":"2) Fondi per imposte, anche differite"});
	reportStructure.push({"id":"PB3", "type":"group", "indent":"1", "bclass":"2", "description":"3) Fondi altri"});
	reportStructure.push({"id":"PB", "type":"total", "indent":"0", "description":"Totale fondi per rischi e oneri B)", "sum":"PB1;PB2;PB3"});
	reportStructure.push({"id":"PC", "type":"group", "indent":"0", "bclass":"2", "description":"C) Fondi trattamento di fine rapporto di lavoro subordinato"});
	reportStructure.push({"id":"dPD", "type":"title", "indent":"0", "description":"D) Debiti"});
	reportStructure.push({"id":"PD1o", "type":"group", "indent":"2", "bclass":"2", "description":"esigibili oltre l'anno successivo"});
	reportStructure.push({"id":"PD1e", "type":"group", "indent":"2", "bclass":"2", "description":"esigibili entro l'anno successivo"});
	reportStructure.push({"id":"PD1", "type":"total", "indent":"1", "description":"1) Debiti verso banche", "sum":"PD1o;PD1e", "excludeamount":true});
	reportStructure.push({"id":"PD2o", "type":"group", "indent":"2", "bclass":"2", "description":"esigibili oltre l'anno successivo"});
	reportStructure.push({"id":"PD2e", "type":"group", "indent":"2", "bclass":"2", "description":"esigibili entro l'anno successivo"});
	reportStructure.push({"id":"PD2", "type":"total", "indent":"1", "description":"2) Debiti verso altri finanziatori", "sum":"PD2o;PD2e", "excludeamount":true});
	reportStructure.push({"id":"PD3o", "type":"group", "indent":"2", "bclass":"2", "description":"esigibili oltre l'anno successivo"});
	reportStructure.push({"id":"PD3e", "type":"group", "indent":"2", "bclass":"2", "description":"esigibili entro l'anno successivo"});
	reportStructure.push({"id":"PD3", "type":"total", "indent":"1", "description":"3) Debiti verso associati e fondatori per finanziamenti", "sum":"PD3o;PD3e", "excludeamount":true});
	reportStructure.push({"id":"PD4o", "type":"group", "indent":"2", "bclass":"2", "description":"esigibili oltre l'anno successivo"});
	reportStructure.push({"id":"PD4e", "type":"group", "indent":"2", "bclass":"2", "description":"esigibili entro l'anno successivo"});
	reportStructure.push({"id":"PD4", "type":"total", "indent":"1", "description":"4) Debiti verso enti della stessa rete associativa", "sum":"PD4o;PD4e", "excludeamount":true});
	reportStructure.push({"id":"PD5o", "type":"group", "indent":"2", "bclass":"2", "description":"esigibili oltre l'anno successivo"});
	reportStructure.push({"id":"PD5e", "type":"group", "indent":"2", "bclass":"2", "description":"esigibili entro l'anno successivo"});
	reportStructure.push({"id":"PD5", "type":"total", "indent":"1", "description":"5) Debiti per erogazioni liberali condizionate", "sum":"PD5o;PD5e", "excludeamount":true});
	reportStructure.push({"id":"PD6o", "type":"group", "indent":"2", "bclass":"2", "description":"esigibili oltre l'anno successivo"});
	reportStructure.push({"id":"PD6e", "type":"group", "indent":"2", "bclass":"2", "description":"esigibili entro l'anno successivo"});
	reportStructure.push({"id":"PD6", "type":"total", "indent":"1", "description":"6) Acconti (Debiti)", "sum":"PD6o;PD6e", "excludeamount":true});
	reportStructure.push({"id":"PD7o", "type":"group", "indent":"2", "bclass":"2", "description":"esigibili oltre l'anno successivo"});
	reportStructure.push({"id":"PD7e", "type":"group", "indent":"2", "bclass":"2", "description":"esigibili entro l'anno successivo"});
	reportStructure.push({"id":"TPF", "type":"group", "indent":"", "bclass":"2", "description":"Partitario fornitori"});
	reportStructure.push({"id":"PD7P", "type":"total", "indent":"", "description":"Debiti verso fornitori da partitario", "sum":"TPF"});
	reportStructure.push({"id":"PD7", "type":"total", "indent":"1", "description":"7) Debiti verso fornitori", "sum":"PD7o;PD7e;PD7P", "excludeamount":true});
	reportStructure.push({"id":"PD8o", "type":"group", "indent":"2", "bclass":"2", "description":"esigibili oltre l'anno successivo"});
	reportStructure.push({"id":"PD8e", "type":"group", "indent":"2", "bclass":"2", "description":"esigibili entro l'anno successivo"});
	reportStructure.push({"id":"PD8", "type":"total", "indent":"1", "description":"8) Debiti verso imprese controllate e collegate", "sum":"PD8o;PD8e", "excludeamount":true});
	reportStructure.push({"id":"PD9o", "type":"group", "indent":"2", "bclass":"2", "description":"esigibili oltre l'anno successivo"});
	reportStructure.push({"id":"PD9e", "type":"group", "indent":"2", "bclass":"2", "description":"esigibili entro l'anno successivo"});
	reportStructure.push({"id":"PD9", "type":"total", "indent":"1", "description":"9) Debiti tributari", "sum":"PD9o;PD9e", "excludeamount":true});
	reportStructure.push({"id":"PD10o", "type":"group", "indent":"2", "bclass":"2", "description":"esigibili oltre l'anno successivo"});
	reportStructure.push({"id":"PD10e", "type":"group", "indent":"2", "bclass":"2", "description":"esigibili entro l'anno successivo"});
	reportStructure.push({"id":"PD10", "type":"total", "indent":"1", "description":"10) Debiti verso istituti di previdenza e di sicurezza sociale", "sum":"PD10o;PD10e", "excludeamount":true});
	reportStructure.push({"id":"PD11o", "type":"group", "indent":"2", "bclass":"2", "description":"esigibili oltre l'anno successivo"});
	reportStructure.push({"id":"PD11e", "type":"group", "indent":"2", "bclass":"2", "description":"esigibili entro l'anno successivo"});
	reportStructure.push({"id":"PD11", "type":"total", "indent":"1", "description":"11) Debiti verso dipendenti e collaboratori", "sum":"PD11o;PD11e", "excludeamount":true});
	reportStructure.push({"id":"PD12o", "type":"group", "indent":"2", "bclass":"2", "description":"esigibili oltre l'anno successivo"});
	reportStructure.push({"id":"PD12e", "type":"group", "indent":"2", "bclass":"2", "description":"esigibili entro l'anno successivo"});
	reportStructure.push({"id":"PD12", "type":"total", "indent":"1", "description":"12) Altri debiti", "sum":"PD12o;PD12e", "excludeamount":true});
	reportStructure.push({"id":"PD", "type":"total", "indent":"0", "description":"Totale debiti D)", "sum":"PD1;PD2;PD3;PD4;PD5;PD6;PD7;PD8;PD9;PD10;PD11;PD12"});
	reportStructure.push({"id":"PE", "type":"group", "indent":"0", "bclass":"2", "description":"E) Ratei e risconti passivi"});
	reportStructure.push({"id":"P", "type":"total", "indent":"0", "description":"TOTALE PASSIVO", "sum":"PA;PB;PC;PD;PE"});

	/* COSTI */
	reportStructure.push({"id":"dCA", "type":"title", "indent":"", "description":"A) Costi e oneri da attività di interesse generale"});
	reportStructure.push({"id":"CA1", "type":"group", "indent":"", "bclass":"3", "description":"1) Materie prime, sussidiarie, di consumo e di merci"});
	reportStructure.push({"id":"CA2", "type":"group", "indent":"", "bclass":"3", "description":"2) Servizi"});
	reportStructure.push({"id":"CA3", "type":"group", "indent":"", "bclass":"3", "description":"3) Godimento beni di terzi"});
	reportStructure.push({"id":"CA4", "type":"group", "indent":"", "bclass":"3", "description":"4) Personale"});
	reportStructure.push({"id":"CA5", "type":"group", "indent":"", "bclass":"3", "description":"5) Ammortamenti"});
	reportStructure.push({"id":"CA6", "type":"group", "indent":"", "bclass":"3", "description":"6) Accantonamenti per rischi ed oneri"});
	reportStructure.push({"id":"CA7", "type":"group", "indent":"", "bclass":"3", "description":"7) Oneri diversi di gestione"});
	reportStructure.push({"id":"CA8", "type":"group", "indent":"", "bclass":"3", "description":"8) Rimanenze iniziali"});
	reportStructure.push({"id":"CA", "type":"total", "indent":"", "description":"Totale", "sum":"CA1;CA2;CA3;CA4;CA5;CA6;CA7;CA8"});
	reportStructure.push({"id":"dCB", "type":"title", "indent":"", "description":"B) Costi e oneri da attività diverse"});
	reportStructure.push({"id":"CB1", "type":"group", "indent":"", "bclass":"3", "description":"1) Materie prime, sussidiarie, di consumo e di merci"});
	reportStructure.push({"id":"CB2", "type":"group", "indent":"", "bclass":"3", "description":"2) Servizi"});
	reportStructure.push({"id":"CB3", "type":"group", "indent":"", "bclass":"3", "description":"3) Godimento beni di terzi"});
	reportStructure.push({"id":"CB4", "type":"group", "indent":"", "bclass":"3", "description":"4) Personale"});
	reportStructure.push({"id":"CB5", "type":"group", "indent":"", "bclass":"3", "description":"5) Ammortamenti"});
	reportStructure.push({"id":"CB6", "type":"group", "indent":"", "bclass":"3", "description":"6) Accantonamenti per rischi ed oneri"});
	reportStructure.push({"id":"CB7", "type":"group", "indent":"", "bclass":"3", "description":"7) Oneri diversi di gestione"});
	reportStructure.push({"id":"CB8", "type":"group", "indent":"", "bclass":"3", "description":"8) Rimanenze iniziali"});
	reportStructure.push({"id":"CB", "type":"total", "indent":"", "description":"Totale", "sum":"CB1;CB2;CB3;CB4;CB5;CB6;CB7;CB8"});
	reportStructure.push({"id":"dCC", "type":"title", "indent":"", "description":"C) Costi e oneri da attività di raccolta fondi"});
	reportStructure.push({"id":"CC1", "type":"group", "indent":"", "bclass":"3", "description":"1) Oneri per raccolte fondi abituali"});
	reportStructure.push({"id":"CC2", "type":"group", "indent":"", "bclass":"3", "description":"2) Oneri per raccolte fondi occasionali"});
	reportStructure.push({"id":"CC3", "type":"group", "indent":"", "bclass":"3", "description":"3) Altri oneri"});
	reportStructure.push({"id":"CC", "type":"total", "indent":"", "description":"Totale", "sum":"CC1;CC2;CC3"});
	reportStructure.push({"id":"dCD", "type":"title", "indent":"", "description":"D) Costi e oneri da attività finanziarie e patrimoniali"});
	reportStructure.push({"id":"CD1", "type":"group", "indent":"", "bclass":"3", "description":"1) Su rapporti bancari"});
	reportStructure.push({"id":"CD2", "type":"group", "indent":"", "bclass":"3", "description":"2) Su prestiti"});
	reportStructure.push({"id":"CD3", "type":"group", "indent":"", "bclass":"3", "description":"3) Da patrimonio edilizio"});
	reportStructure.push({"id":"CD4", "type":"group", "indent":"", "bclass":"3", "description":"4) Da altri beni patrimoniali"});
	reportStructure.push({"id":"CD5", "type":"group", "indent":"", "bclass":"3", "description":"5) Accantonamenti per rischi ed oneri"});
	reportStructure.push({"id":"CD6", "type":"group", "indent":"", "bclass":"3", "description":"6) Altri oneri"});
	reportStructure.push({"id":"CD", "type":"total", "indent":"", "description":"Totale", "sum":"CD1;CD2;CD3;CD4;CD5;CD6"});
	reportStructure.push({"id":"dCE", "type":"title", "indent":"", "description":"E) Costi e oneri di supporto generale"});
	reportStructure.push({"id":"CE1", "type":"group", "indent":"", "bclass":"3", "description":"1) Materie prime, sussidiarie, di consumo e di merci"});
	reportStructure.push({"id":"CE2", "type":"group", "indent":"", "bclass":"3", "description":"2) Servizi"});
	reportStructure.push({"id":"CE3", "type":"group", "indent":"", "bclass":"3", "description":"3) Godimento beni di terzi"});
	reportStructure.push({"id":"CE4", "type":"group", "indent":"", "bclass":"3", "description":"4) Personale"});
	reportStructure.push({"id":"CE5", "type":"group", "indent":"", "bclass":"3", "description":"5) Ammortamenti"});
	reportStructure.push({"id":"CE6", "type":"group", "indent":"", "bclass":"3", "description":"6) Accantonamenti per rischi ed oneri"});
	reportStructure.push({"id":"CE7", "type":"group", "indent":"", "bclass":"3", "description":"7) Altri oneri"});
	reportStructure.push({"id":"CE", "type":"total", "indent":"", "description":"Totale", "sum":"CE1;CE2;CE3;CE4;CE5;CE6;CE7"});
	reportStructure.push({"id":"C", "type":"total", "indent":"", "description":"TOTALE ONERI E COSTI", "sum":"CA;CB;CC;CD;CE"});

	/* PROVENTI */
	reportStructure.push({"id":"dRA", "type":"title", "indent":"", "description":"A) Ricavi, rendite e proventi da attività di interesse generale"});
	reportStructure.push({"id":"RA1", "type":"group", "indent":"", "bclass":"4", "description":"1) Proventi da quote associative e apporti dei fondatori"});
	reportStructure.push({"id":"RA2", "type":"group", "indent":"", "bclass":"4", "description":"2) Proventi dagli associati per attività mutuali"});
	reportStructure.push({"id":"RA3", "type":"group", "indent":"", "bclass":"4", "description":"3) Ricavi per prestazioni e cessioni ad associati e fondatori"});
	reportStructure.push({"id":"RA4", "type":"group", "indent":"", "bclass":"4", "description":"4) Erogazioni liberali"});
	reportStructure.push({"id":"RA5", "type":"group", "indent":"", "bclass":"4", "description":"5) Proventi del 5 per mille"});
	reportStructure.push({"id":"RA6", "type":"group", "indent":"", "bclass":"4", "description":"6) Contributi da soggetti privati"});
	reportStructure.push({"id":"RA7", "type":"group", "indent":"", "bclass":"4", "description":"7) Ricavi per prestazioni e cessioni a terzi"});
	reportStructure.push({"id":"RA8", "type":"group", "indent":"", "bclass":"4", "description":"8) Contributi da enti pubblici"});
	reportStructure.push({"id":"RA9", "type":"group", "indent":"", "bclass":"4", "description":"9) Proventi da contratti con enti pubblici"});
	reportStructure.push({"id":"RA10", "type":"group", "indent":"", "bclass":"4", "description":"10) Altri ricavi, rendite e proventi"});
	reportStructure.push({"id":"RA11", "type":"group", "indent":"", "bclass":"4", "description":"11) Rimanenze finali"});
	reportStructure.push({"id":"RA", "type":"total", "indent":"", "description":"Totale", "sum":"RA1;RA2;RA3;RA4;RA5;RA6;RA7;RA8;RA9;RA10;RA11"});
	reportStructure.push({"id":"dRB", "type":"title", "indent":"", "description":"B) Ricavi, rendite e proventi da attività diverse"});
	reportStructure.push({"id":"RB1", "type":"group", "indent":"", "bclass":"4", "description":"1) Ricavi per prestazioni e cessioni ad associati e fondatori"});
	reportStructure.push({"id":"RB2", "type":"group", "indent":"", "bclass":"4", "description":"2) Contributi da soggetti privati"});
	reportStructure.push({"id":"RB3", "type":"group", "indent":"", "bclass":"4", "description":"3) Ricavi per prestazioni e cessioni a terzi"});
	reportStructure.push({"id":"RB4", "type":"group", "indent":"", "bclass":"4", "description":"4) Contributi da enti pubblici"});
	reportStructure.push({"id":"RB5", "type":"group", "indent":"", "bclass":"4", "description":"5) Proventi da contratti con enti pubblici"});
	reportStructure.push({"id":"RB6", "type":"group", "indent":"", "bclass":"4", "description":"6) Altri ricavi, rendite e proventi"});
	reportStructure.push({"id":"RB7", "type":"group", "indent":"", "bclass":"4", "description":"7) Rimanenze finali"});
	reportStructure.push({"id":"RB", "type":"total", "indent":"", "description":"Totale", "sum":"RB1;RB2;RB3;RB4;RB5;RB6;RB7"});
	reportStructure.push({"id":"dRC", "type":"title", "indent":"", "description":"C) Ricavi, rendite e proventi da attività di raccolta fondi"});
	reportStructure.push({"id":"RC1", "type":"group", "indent":"", "bclass":"4", "description":"1) Proventi da raccolte fondi abituali"});
	reportStructure.push({"id":"RC2", "type":"group", "indent":"", "bclass":"4", "description":"2) Proventi da raccolte fondi occasionali"});
	reportStructure.push({"id":"RC3", "type":"group", "indent":"", "bclass":"4", "description":"3) Altri proventi"});
	reportStructure.push({"id":"RC", "type":"total", "indent":"", "description":"Totale", "sum":"RC1;RC2;RC3"});
	reportStructure.push({"id":"dRD", "type":"title", "indent":"", "description":"D) Ricavi, rendite e proventi da attività finanziarie e patrimoniali"});
	reportStructure.push({"id":"RD1", "type":"group", "indent":"", "bclass":"4", "description":"1) Da rapporti bancari"});
	reportStructure.push({"id":"RD2", "type":"group", "indent":"", "bclass":"4", "description":"2) Da altri investimenti finanziari"});
	reportStructure.push({"id":"RD3", "type":"group", "indent":"", "bclass":"4", "description":"3) Da patrimonio edilizio"});
	reportStructure.push({"id":"RD4", "type":"group", "indent":"", "bclass":"4", "description":"4) Da altri beni patrimoniali"});
	reportStructure.push({"id":"RD5", "type":"group", "indent":"", "bclass":"4", "description":"5) Altri proventi"});
	reportStructure.push({"id":"RD", "type":"total", "indent":"", "description":"Totale", "sum":"RD1;RD2;RD3;RD4;RD5"});
	reportStructure.push({"id":"dRE", "type":"title", "indent":"", "description":"E) Proventi di supporto generale"});
	reportStructure.push({"id":"RE1", "type":"group", "indent":"", "bclass":"4", "description":"1) Proventi da distacco del personale"});
	reportStructure.push({"id":"RE2", "type":"group", "indent":"", "bclass":"4", "description":"2) Altri proventi di supporto generale"});
	reportStructure.push({"id":"RE", "type":"total", "indent":"", "description":"Totale", "sum":"RE1;RE2"});
	reportStructure.push({"id":"R", "type":"total", "indent":"", "description":"TOTALE PROVENTI E RICAVI", "sum":"RA;RB;RC;RD;RE"});
	reportStructure.push({"id":"IM", "type":"group", "indent":"", "bclass":"4", "description":"Imposte"});

	/* AVANZO / DISAVANZO */
	  // => ricavi-costi (es RA;-CA)
	reportStructure.push({"id":"RA-CA", "type":"total", "indent":"", "description":"Avanzo/disavanzo attività di interesse generale (+/-)", "sum":"RA;-CA"});
	reportStructure.push({"id":"RB-CB", "type":"total", "indent":"", "description":"Avanzo/disavanzo attività diverse (+/-)", "sum":"RB;-CB"});
	reportStructure.push({"id":"RC-CC", "type":"total", "indent":"", "description":"Avanzo/disavanzo attività di raccolta fondi", "sum":"RC;-CC"});
	reportStructure.push({"id":"RD-CD", "type":"total", "indent":"", "description":"Avanzo/disavanzo attività finanziarie e patrimoniali (+/-)", "sum":"RD;-CD"});
	reportStructure.push({"id":"RE-CE", "type":"total", "indent":"", "description":"Avanzo/disavanzo supporto generale (+/-)", "sum":"RE;-CE"});   
	reportStructure.push({"id":"TADPI", "type":"total", "indent":"", "description":"Avanzo/disavanzo d’esercizio prima delle imposte (+/-)", "sum":"RA-CA;RB-CB;RC-CC;RD-CD;RE-CE"});
	reportStructure.push({"id":"TADES", "type":"total", "indent":"", "description":"Avanzo/disavanzo d’esercizio (+/-)", "sum":"TADPI;IM"});
	reportStructure.push({"id":"PAIV", "type":"total", "indent":"", "description":"IV - Avanzo/disavanzo d'esercizio", "sum":"TADES"});

	/* COSTI / PROVENTI FIGURATIVI */
	reportStructure.push({"id":"CG1", "type":"group", "indent":"", "bclass":"3", "description":"1) da attività di interesse generale"});
	reportStructure.push({"id":"CG2", "type":"group", "indent":"", "bclass":"3", "description":"2) da attività diverse"});
	reportStructure.push({"id":"CG", "type":"total", "indent":"", "description":"Totale", "sum":"CG1;CG2"});
	reportStructure.push({"id":"RG1", "type":"group", "indent":"", "bclass":"4", "description":"1) da attività di interesse generale"});
	reportStructure.push({"id":"RG2", "type":"group", "indent":"", "bclass":"4", "description":"2) da attività diverse"});
	reportStructure.push({"id":"RG", "type":"total", "indent":"", "description":"Totale", "sum":"RG1;RG2"});
	reportStructure.push({"id":"RG-CG", "type":"total", "indent":"", "description":"Totale", "sum":"RG;-CG"}); //not used

	return reportStructure;
}

//Profit & Loss statement
function createReportStructureRendicontoGestionale() {

	var reportStructure = [];

	/* COSTI */
	reportStructure.push({"id":"dCA", "type":"title", "indent":"", "description":"A) Costi e oneri da attività di interesse generale"});
	reportStructure.push({"id":"CA1", "type":"group", "indent":"", "bclass":"3", "description":"1) Materie prime, sussidiarie, di consumo e di merci"});
	reportStructure.push({"id":"CA2", "type":"group", "indent":"", "bclass":"3", "description":"2) Servizi"});
	reportStructure.push({"id":"CA3", "type":"group", "indent":"", "bclass":"3", "description":"3) Godimento beni di terzi"});
	reportStructure.push({"id":"CA4", "type":"group", "indent":"", "bclass":"3", "description":"4) Personale"});
	reportStructure.push({"id":"CA5", "type":"group", "indent":"", "bclass":"3", "description":"5) Ammortamenti"});
	reportStructure.push({"id":"CA6", "type":"group", "indent":"", "bclass":"3", "description":"6) Accantonamenti per rischi ed oneri"});
	reportStructure.push({"id":"CA7", "type":"group", "indent":"", "bclass":"3", "description":"7) Oneri diversi di gestione"});
	reportStructure.push({"id":"CA8", "type":"group", "indent":"", "bclass":"3", "description":"8) Rimanenze iniziali"});
	reportStructure.push({"id":"CA", "type":"total", "indent":"", "description":"Totale", "sum":"CA1;CA2;CA3;CA4;CA5;CA6;CA7;CA8"});
	reportStructure.push({"id":"dCB", "type":"title", "indent":"", "description":"B) Costi e oneri da attività diverse"});
	reportStructure.push({"id":"CB1", "type":"group", "indent":"", "bclass":"3", "description":"1) Materie prime, sussidiarie, di consumo e di merci"});
	reportStructure.push({"id":"CB2", "type":"group", "indent":"", "bclass":"3", "description":"2) Servizi"});
	reportStructure.push({"id":"CB3", "type":"group", "indent":"", "bclass":"3", "description":"3) Godimento beni di terzi"});
	reportStructure.push({"id":"CB4", "type":"group", "indent":"", "bclass":"3", "description":"4) Personale"});
	reportStructure.push({"id":"CB5", "type":"group", "indent":"", "bclass":"3", "description":"5) Ammortamenti"});
	reportStructure.push({"id":"CB6", "type":"group", "indent":"", "bclass":"3", "description":"6) Accantonamenti per rischi ed oneri"});
	reportStructure.push({"id":"CB7", "type":"group", "indent":"", "bclass":"3", "description":"7) Oneri diversi di gestione"});
	reportStructure.push({"id":"CB8", "type":"group", "indent":"", "bclass":"3", "description":"8) Rimanenze iniziali"});
	reportStructure.push({"id":"CB", "type":"total", "indent":"", "description":"Totale", "sum":"CB1;CB2;CB3;CB4;CB5;CB6;CB7;CB8"});
	reportStructure.push({"id":"dCC", "type":"title", "indent":"", "description":"C) Costi e oneri da attività di raccolta fondi"});
	reportStructure.push({"id":"CC1", "type":"group", "indent":"", "bclass":"3", "description":"1) Oneri per raccolte fondi abituali"});
	reportStructure.push({"id":"CC2", "type":"group", "indent":"", "bclass":"3", "description":"2) Oneri per raccolte fondi occasionali"});
	reportStructure.push({"id":"CC3", "type":"group", "indent":"", "bclass":"3", "description":"3) Altri oneri"});
	reportStructure.push({"id":"CC", "type":"total", "indent":"", "description":"Totale", "sum":"CC1;CC2;CC3"});
	reportStructure.push({"id":"dCD", "type":"title", "indent":"", "description":"D) Costi e oneri da attività finanziarie e patrimoniali"});
	reportStructure.push({"id":"CD1", "type":"group", "indent":"", "bclass":"3", "description":"1) Su rapporti bancari"});
	reportStructure.push({"id":"CD2", "type":"group", "indent":"", "bclass":"3", "description":"2) Su prestiti"});
	reportStructure.push({"id":"CD3", "type":"group", "indent":"", "bclass":"3", "description":"3) Da patrimonio edilizio"});
	reportStructure.push({"id":"CD4", "type":"group", "indent":"", "bclass":"3", "description":"4) Da altri beni patrimoniali"});
	reportStructure.push({"id":"CD5", "type":"group", "indent":"", "bclass":"3", "description":"5) Accantonamenti per rischi ed oneri"});
	reportStructure.push({"id":"CD6", "type":"group", "indent":"", "bclass":"3", "description":"6) Altri oneri"});
	reportStructure.push({"id":"CD", "type":"total", "indent":"", "description":"Totale", "sum":"CD1;CD2;CD3;CD4;CD5;CD6"});
	reportStructure.push({"id":"dCE", "type":"title", "indent":"", "description":"E) Costi e oneri di supporto generale"});
	reportStructure.push({"id":"CE1", "type":"group", "indent":"", "bclass":"3", "description":"1) Materie prime, sussidiarie, di consumo e di merci"});
	reportStructure.push({"id":"CE2", "type":"group", "indent":"", "bclass":"3", "description":"2) Servizi"});
	reportStructure.push({"id":"CE3", "type":"group", "indent":"", "bclass":"3", "description":"3) Godimento beni di terzi"});
	reportStructure.push({"id":"CE4", "type":"group", "indent":"", "bclass":"3", "description":"4) Personale"});
	reportStructure.push({"id":"CE5", "type":"group", "indent":"", "bclass":"3", "description":"5) Ammortamenti"});
	reportStructure.push({"id":"CE6", "type":"group", "indent":"", "bclass":"3", "description":"6) Accantonamenti per rischi ed oneri"});
	reportStructure.push({"id":"CE7", "type":"group", "indent":"", "bclass":"3", "description":"7) Altri oneri"});
	reportStructure.push({"id":"CE", "type":"total", "indent":"", "description":"Totale", "sum":"CE1;CE2;CE3;CE4;CE5;CE6;CE7"});
	reportStructure.push({"id":"C", "type":"total", "indent":"", "description":"TOTALE ONERI E COSTI", "sum":"CA;CB;CC;CD;CE"});

	/* PROVENTI */
	reportStructure.push({"id":"dRA", "type":"title", "indent":"", "description":"A) Ricavi, rendite e proventi da attività di interesse generale"});
	reportStructure.push({"id":"RA1", "type":"group", "indent":"", "bclass":"4", "description":"1) Proventi da quote associative e apporti dei fondatori"});
	reportStructure.push({"id":"RA2", "type":"group", "indent":"", "bclass":"4", "description":"2) Proventi dagli associati per attività mutuali"});
	reportStructure.push({"id":"RA3", "type":"group", "indent":"", "bclass":"4", "description":"3) Ricavi per prestazioni e cessioni ad associati e fondatori"});
	reportStructure.push({"id":"RA4", "type":"group", "indent":"", "bclass":"4", "description":"4) Erogazioni liberali"});
	reportStructure.push({"id":"RA5", "type":"group", "indent":"", "bclass":"4", "description":"5) Proventi del 5 per mille"});
	reportStructure.push({"id":"RA6", "type":"group", "indent":"", "bclass":"4", "description":"6) Contributi da soggetti privati"});
	reportStructure.push({"id":"RA7", "type":"group", "indent":"", "bclass":"4", "description":"7) Ricavi per prestazioni e cessioni a terzi"});
	reportStructure.push({"id":"RA8", "type":"group", "indent":"", "bclass":"4", "description":"8) Contributi da enti pubblici"});
	reportStructure.push({"id":"RA9", "type":"group", "indent":"", "bclass":"4", "description":"9) Proventi da contratti con enti pubblici"});
	reportStructure.push({"id":"RA10", "type":"group", "indent":"", "bclass":"4", "description":"10) Altri ricavi, rendite e proventi"});
	reportStructure.push({"id":"RA11", "type":"group", "indent":"", "bclass":"4", "description":"11) Rimanenze finali"});
	reportStructure.push({"id":"RA", "type":"total", "indent":"", "description":"Totale", "sum":"RA1;RA2;RA3;RA4;RA5;RA6;RA7;RA8;RA9;RA10;RA11"});
	reportStructure.push({"id":"dRB", "type":"title", "indent":"", "description":"B) Ricavi, rendite e proventi da attività diverse"});
	reportStructure.push({"id":"RB1", "type":"group", "indent":"", "bclass":"4", "description":"1) Ricavi per prestazioni e cessioni ad associati e fondatori"});
	reportStructure.push({"id":"RB2", "type":"group", "indent":"", "bclass":"4", "description":"2) Contributi da soggetti privati"});
	reportStructure.push({"id":"RB3", "type":"group", "indent":"", "bclass":"4", "description":"3) Ricavi per prestazioni e cessioni a terzi"});
	reportStructure.push({"id":"RB4", "type":"group", "indent":"", "bclass":"4", "description":"4) Contributi da enti pubblici"});
	reportStructure.push({"id":"RB5", "type":"group", "indent":"", "bclass":"4", "description":"5) Proventi da contratti con enti pubblici"});
	reportStructure.push({"id":"RB6", "type":"group", "indent":"", "bclass":"4", "description":"6) Altri ricavi, rendite e proventi"});
	reportStructure.push({"id":"RB7", "type":"group", "indent":"", "bclass":"4", "description":"7) Rimanenze finali"});
	reportStructure.push({"id":"RB", "type":"total", "indent":"", "description":"Totale", "sum":"RB1;RB2;RB3;RB4;RB5;RB6;RB7"});
	reportStructure.push({"id":"dRC", "type":"title", "indent":"", "description":"C) Ricavi, rendite e proventi da attività di raccolta fondi"});
	reportStructure.push({"id":"RC1", "type":"group", "indent":"", "bclass":"4", "description":"1) Proventi da raccolte fondi abituali"});
	reportStructure.push({"id":"RC2", "type":"group", "indent":"", "bclass":"4", "description":"2) Proventi da raccolte fondi occasionali"});
	reportStructure.push({"id":"RC3", "type":"group", "indent":"", "bclass":"4", "description":"3) Altri proventi"});
	reportStructure.push({"id":"RC", "type":"total", "indent":"", "description":"Totale", "sum":"RC1;RC2;RC3"});
	reportStructure.push({"id":"dRD", "type":"title", "indent":"", "description":"D) Ricavi, rendite e proventi da attività finanziarie e patrimoniali"});
	reportStructure.push({"id":"RD1", "type":"group", "indent":"", "bclass":"4", "description":"1) Da rapporti bancari"});
	reportStructure.push({"id":"RD2", "type":"group", "indent":"", "bclass":"4", "description":"2) Da altri investimenti finanziari"});
	reportStructure.push({"id":"RD3", "type":"group", "indent":"", "bclass":"4", "description":"3) Da patrimonio edilizio"});
	reportStructure.push({"id":"RD4", "type":"group", "indent":"", "bclass":"4", "description":"4) Da altri beni patrimoniali"});
	reportStructure.push({"id":"RD5", "type":"group", "indent":"", "bclass":"4", "description":"5) Altri proventi"});
	reportStructure.push({"id":"RD", "type":"total", "indent":"", "description":"Totale", "sum":"RD1;RD2;RD3;RD4;RD5"});
	reportStructure.push({"id":"dRE", "type":"title", "indent":"", "description":"E) Proventi di supporto generale"});
	reportStructure.push({"id":"RE1", "type":"group", "indent":"", "bclass":"4", "description":"1) Proventi da distacco del personale"});
	reportStructure.push({"id":"RE2", "type":"group", "indent":"", "bclass":"4", "description":"2) Altri proventi di supporto generale"});
	reportStructure.push({"id":"RE", "type":"total", "indent":"", "description":"Totale", "sum":"RE1;RE2"});
	reportStructure.push({"id":"R", "type":"total", "indent":"", "description":"TOTALE PROVENTI E RICAVI", "sum":"RA;RB;RC;RD;RE"});
	reportStructure.push({"id":"IM", "type":"group", "indent":"", "bclass":"4", "description":"Imposte"});

	/* AVANZO / DISAVANZO */
	  // => ricavi-costi (es RA;-CA)
	reportStructure.push({"id":"RA-CA", "type":"total", "indent":"", "description":"Avanzo/disavanzo attività di interesse generale (+/-)", "sum":"RA;-CA"});
	reportStructure.push({"id":"RB-CB", "type":"total", "indent":"", "description":"Avanzo/disavanzo attività diverse (+/-)", "sum":"RB;-CB"});
	reportStructure.push({"id":"RC-CC", "type":"total", "indent":"", "description":"Avanzo/disavanzo attività di raccolta fondi", "sum":"RC;-CC"});
	reportStructure.push({"id":"RD-CD", "type":"total", "indent":"", "description":"Avanzo/disavanzo attività finanziarie e patrimoniali (+/-)", "sum":"RD;-CD"});
	reportStructure.push({"id":"RE-CE", "type":"total", "indent":"", "description":"Avanzo/disavanzo supporto generale (+/-)", "sum":"RE;-CE"});   
	reportStructure.push({"id":"TADPI", "type":"total", "indent":"", "description":"Avanzo/disavanzo d’esercizio prima delle imposte (+/-)", "sum":"RA-CA;RB-CB;RC-CC;RD-CD;RE-CE"});
	reportStructure.push({"id":"TADES", "type":"total", "indent":"", "description":"Avanzo/disavanzo d’esercizio (+/-)", "sum":"TADPI;IM"});
	reportStructure.push({"id":"PAIV", "type":"total", "indent":"", "description":"IV - Avanzo/disavanzo d'esercizio", "sum":"TADES"});

	/* COSTI / PROVENTI FIGURATIVI */
	reportStructure.push({"id":"CG1", "type":"group", "indent":"", "bclass":"3", "description":"1) da attività di interesse generale"});
	reportStructure.push({"id":"CG2", "type":"group", "indent":"", "bclass":"3", "description":"2) da attività diverse"});
	reportStructure.push({"id":"CG", "type":"total", "indent":"", "description":"Totale", "sum":"CG1;CG2"});
	reportStructure.push({"id":"RG1", "type":"group", "indent":"", "bclass":"4", "description":"1) da attività di interesse generale"});
	reportStructure.push({"id":"RG2", "type":"group", "indent":"", "bclass":"4", "description":"2) da attività diverse"});
	reportStructure.push({"id":"RG", "type":"total", "indent":"", "description":"Totale", "sum":"RG1;RG2"});
	reportStructure.push({"id":"RG-CG", "type":"total", "indent":"", "description":"Totale", "sum":"RG;-CG"}); //not used

	return reportStructure;
}

function createReportStructureRendicontoCassa() {

	var reportStructure = [];
	
	/* CASSA E BANCA */
	reportStructure.push({"id":"ACIV1", "type":"group", "indent":"", "bclass":"1", "description":"Depositi bancari e postali"});	
	reportStructure.push({"id":"ACIV3", "type":"group", "indent":"", "bclass":"1", "description":"Cassa"});
	
	/* USCITE */
	reportStructure.push({"id":"dCA", "type":"title", "indent":"", "description":"A) Uscite da attività di interesse generale"});
	reportStructure.push({"id":"CA1", "type":"group", "indent":"", "bclass":"3", "description":"1) Materie prime, sussidiarie, di consumo e di merci"});
	reportStructure.push({"id":"CA2", "type":"group", "indent":"", "bclass":"3", "description":"2) Servizi"});
	reportStructure.push({"id":"CA3", "type":"group", "indent":"", "bclass":"3", "description":"3) Godimento beni di terzi"});
	reportStructure.push({"id":"CA4", "type":"group", "indent":"", "bclass":"3", "description":"4) Personale"});
	reportStructure.push({"id":"CA7", "type":"group", "indent":"", "bclass":"3", "description":"5) Uscite diverse di gestione"});
	reportStructure.push({"id":"CA5", "type":"group", "indent":"", "bclass":"3", "description":"A) Ammortamenti"});
	reportStructure.push({"id":"CA6", "type":"group", "indent":"", "bclass":"3", "description":"A) Accantonamenti per rischi ed oneri"});
	reportStructure.push({"id":"CA8", "type":"group", "indent":"", "bclass":"3", "description":"A) Rimanenze iniziali"});
	reportStructure.push({"id":"CA", "type":"total", "indent":"", "description":"Totale", "sum":"CA1;CA2;CA3;CA4;CA7"});
	reportStructure.push({"id":"dCB", "type":"title", "indent":"", "description":"B) Uscite da attività diverse"});
	reportStructure.push({"id":"CB1", "type":"group", "indent":"", "bclass":"3", "description":"1) Materie prime, sussidiarie, di consumo e di merci"});
	reportStructure.push({"id":"CB2", "type":"group", "indent":"", "bclass":"3", "description":"2) Servizi"});
	reportStructure.push({"id":"CB3", "type":"group", "indent":"", "bclass":"3", "description":"3) Godimento beni di terzi"});
	reportStructure.push({"id":"CB4", "type":"group", "indent":"", "bclass":"3", "description":"4) Personale"});
	reportStructure.push({"id":"CB7", "type":"group", "indent":"", "bclass":"3", "description":"5) Uscite diverse di gestione"});
	reportStructure.push({"id":"CB5", "type":"group", "indent":"", "bclass":"3", "description":"B) Ammortamenti"});
	reportStructure.push({"id":"CB6", "type":"group", "indent":"", "bclass":"3", "description":"B) Accantonamenti per rischi ed oneri"});
	reportStructure.push({"id":"CB8", "type":"group", "indent":"", "bclass":"3", "description":"B) Rimanenze iniziali"});
	reportStructure.push({"id":"CB", "type":"total", "indent":"", "description":"Totale", "sum":"CB1;CB2;CB3;CB4;CB7"});
	reportStructure.push({"id":"dCC", "type":"title", "indent":"", "description":"C) Uscite da attività di raccolta fondi"});
	reportStructure.push({"id":"CC1", "type":"group", "indent":"", "bclass":"3", "description":"1) Uscite per raccolte fondi abituali"});
	reportStructure.push({"id":"CC2", "type":"group", "indent":"", "bclass":"3", "description":"2) Uscite per raccolte fondi occasionali"});
	reportStructure.push({"id":"CC3", "type":"group", "indent":"", "bclass":"3", "description":"3) Altre uscite"});
	reportStructure.push({"id":"CC", "type":"total", "indent":"", "description":"Totale", "sum":"CC1;CC2;CC3"});
	reportStructure.push({"id":"dCD", "type":"title", "indent":"", "description":"D) Uscite da attività finanziarie e patrimoniali"});
	reportStructure.push({"id":"CD1", "type":"group", "indent":"", "bclass":"3", "description":"1) Su rapporti bancari"});
	reportStructure.push({"id":"CD2", "type":"group", "indent":"", "bclass":"3", "description":"2) Su investimenti finanziari"});
	reportStructure.push({"id":"CD3", "type":"group", "indent":"", "bclass":"3", "description":"3) Su patrimonio edilizio"});
	reportStructure.push({"id":"CD4", "type":"group", "indent":"", "bclass":"3", "description":"4) Su altri beni patrimoniali"});
	reportStructure.push({"id":"CD6", "type":"group", "indent":"", "bclass":"3", "description":"5) Altre uscite"});
	reportStructure.push({"id":"CD5", "type":"group", "indent":"", "bclass":"3", "description":"C) Accantonamenti per rischi ed oneri"});
	reportStructure.push({"id":"CD", "type":"total", "indent":"", "description":"Totale", "sum":"CD1;CD2;CD3;CD4;CD6"});
	reportStructure.push({"id":"dCE", "type":"title", "indent":"", "description":"E) Uscite di supporto generale"});
	reportStructure.push({"id":"CE1", "type":"group", "indent":"", "bclass":"3", "description":"1) Materie prime, sussidiarie, di consumo e di merci"});
	reportStructure.push({"id":"CE2", "type":"group", "indent":"", "bclass":"3", "description":"2) Servizi"});
	reportStructure.push({"id":"CE3", "type":"group", "indent":"", "bclass":"3", "description":"3) Godimento beni di terzi"});
	reportStructure.push({"id":"CE4", "type":"group", "indent":"", "bclass":"3", "description":"4) Personale"});
	reportStructure.push({"id":"CE7", "type":"group", "indent":"", "bclass":"3", "description":"5) Altre uscite"});
	reportStructure.push({"id":"CE5", "type":"group", "indent":"", "bclass":"3", "description":"E) Ammortamenti"});
	reportStructure.push({"id":"CE6", "type":"group", "indent":"", "bclass":"3", "description":"E) Accantonamenti per rischi ed oneri"});
	reportStructure.push({"id":"CE", "type":"total", "indent":"", "description":"Totale", "sum":"CE1;CE2;CE3;CE4;CE7"});
	reportStructure.push({"id":"C", "type":"total", "indent":"", "description":"TOTALE ONERI E COSTI", "sum":"CA;CB;CC;CD;CE"});

	/* ENTRATE */
	reportStructure.push({"id":"dRA", "type":"title", "indent":"", "description":"A) Entrate da attività di interesse generale"});
	reportStructure.push({"id":"RA1", "type":"group", "indent":"", "bclass":"4", "description":"1) Entrate da quote associative e apporti dei fondatori"});
	reportStructure.push({"id":"RA2", "type":"group", "indent":"", "bclass":"4", "description":"2) Entrate dagli associati per attività mutuali"});
	reportStructure.push({"id":"RA3", "type":"group", "indent":"", "bclass":"4", "description":"3) Entrate per prestazioni e cessioni ad associati e fondatori"});
	reportStructure.push({"id":"RA4", "type":"group", "indent":"", "bclass":"4", "description":"4) Erogazioni liberali"});
	reportStructure.push({"id":"RA5", "type":"group", "indent":"", "bclass":"4", "description":"5) Entrate del 5 per mille"});
	reportStructure.push({"id":"RA6", "type":"group", "indent":"", "bclass":"4", "description":"6) Contributi da soggetti privati"});
	reportStructure.push({"id":"RA7", "type":"group", "indent":"", "bclass":"4", "description":"7) Entrate per prestazioni e cessioni a terzi"});
	reportStructure.push({"id":"RA8", "type":"group", "indent":"", "bclass":"4", "description":"8) Contributi da enti pubblici"});
	reportStructure.push({"id":"RA9", "type":"group", "indent":"", "bclass":"4", "description":"9) Entrate da contratti con enti pubblici"});
	reportStructure.push({"id":"RA10", "type":"group", "indent":"", "bclass":"4", "description":"10) Altre entrate"});
	reportStructure.push({"id":"RA", "type":"total", "indent":"", "description":"Totale", "sum":"RA1;RA2;RA3;RA4;RA5;RA6;RA7;RA8;RA9;RA10"});
	reportStructure.push({"id":"dRB", "type":"title", "indent":"", "description":"B) Entrate da attività diverse"});
	reportStructure.push({"id":"RB1", "type":"group", "indent":"", "bclass":"4", "description":"1) Entrate per prestazioni e cessioni ad associati e fondatori"});
	reportStructure.push({"id":"RB2", "type":"group", "indent":"", "bclass":"4", "description":"2) Contributi da soggetti privati"});
	reportStructure.push({"id":"RB3", "type":"group", "indent":"", "bclass":"4", "description":"3) Entrate per prestazioni e cessioni a terzi"});
	reportStructure.push({"id":"RB4", "type":"group", "indent":"", "bclass":"4", "description":"4) Contributi da enti pubblici"});
	reportStructure.push({"id":"RB5", "type":"group", "indent":"", "bclass":"4", "description":"5) Entrate da contratti con enti pubblici"});
	reportStructure.push({"id":"RB6", "type":"group", "indent":"", "bclass":"4", "description":"6) Altre entrate"});
	reportStructure.push({"id":"RB", "type":"total", "indent":"", "description":"Totale", "sum":"RB1;RB2;RB3;RB4;RB5;RB6"});
	reportStructure.push({"id":"dRC", "type":"title", "indent":"", "description":"C) Entrate da attività di raccolta fondi"});
	reportStructure.push({"id":"RC1", "type":"group", "indent":"", "bclass":"4", "description":"1) Entrate da raccolte fondi abituali"});
	reportStructure.push({"id":"RC2", "type":"group", "indent":"", "bclass":"4", "description":"2) Entrate da raccolte fondi occasionali"});
	reportStructure.push({"id":"RC3", "type":"group", "indent":"", "bclass":"4", "description":"3) Altre entrate"});
	reportStructure.push({"id":"RC", "type":"total", "indent":"", "description":"Totale", "sum":"RC1;RC2;RC3"});
	reportStructure.push({"id":"dRD", "type":"title", "indent":"", "description":"D) Entrate da attività finanziarie e patrimoniali"});
	reportStructure.push({"id":"RD1", "type":"group", "indent":"", "bclass":"4", "description":"1) Da rapporti bancari"});
	reportStructure.push({"id":"RD2", "type":"group", "indent":"", "bclass":"4", "description":"2) Da altri investimenti finanziari"});
	reportStructure.push({"id":"RD3", "type":"group", "indent":"", "bclass":"4", "description":"3) Da patrimonio edilizio"});
	reportStructure.push({"id":"RD4", "type":"group", "indent":"", "bclass":"4", "description":"4) Da altri beni patrimoniali"});
	reportStructure.push({"id":"RD5", "type":"group", "indent":"", "bclass":"4", "description":"5) Altre entrate"});
	reportStructure.push({"id":"RD", "type":"total", "indent":"", "description":"Totale", "sum":"RD1;RD2;RD3;RD4;RD5"});
	reportStructure.push({"id":"dRE", "type":"title", "indent":"", "description":"E) Entrate di supporto generale"});
	reportStructure.push({"id":"RE1", "type":"group", "indent":"", "bclass":"4", "description":"1) Entrate da distacco del personale"});
	reportStructure.push({"id":"RE2", "type":"group", "indent":"", "bclass":"4", "description":"2) Altre entrate di supporto generale"});
	reportStructure.push({"id":"RE", "type":"total", "indent":"", "description":"Totale", "sum":"RE1;RE2"});
	reportStructure.push({"id":"R", "type":"total", "indent":"", "description":"Totale entrate della gestione", "sum":"RA;RB;RC;RD;RE"});
	reportStructure.push({"id":"IM", "type":"group", "indent":"", "bclass":"4", "description":"Imposte"});

	/* USCITE DA INVESTIMENTI */
	reportStructure.push({"id":"CF1", "type":"group", "indent":"", "bclass":"3", "description":"1) Investimenti in immobilizzazioni inerenti alle attività di interesse generale"});
	reportStructure.push({"id":"CF2", "type":"group", "indent":"", "bclass":"3", "description":"2) Investimenti in immobilizzazioni inerenti alle attività diverse"});
	reportStructure.push({"id":"CF3", "type":"group", "indent":"", "bclass":"3", "description":"3) Investimenti in attività finanziarie e patrimoniali"});
	reportStructure.push({"id":"CF4", "type":"group", "indent":"", "bclass":"3", "description":"4) Rimborso di finanziamenti per quota capitale e di prestiti"});
	reportStructure.push({"id":"CF", "type":"total", "indent":"", "description":"Totale", "sum":"CF1;CF2;CF3;CF4"});
	reportStructure.push({"id":"IMRC", "type":"group", "indent":"", "bclass":"3", "description":"Imposte"});

	/* ENTRATE DA DISINVESTIMENTI */
	reportStructure.push({"id":"RF1", "type":"group", "indent":"", "bclass":"4", "description":"1) Disinvestimenti di immobilizzazioni inerenti alle attività di interesse generale"});
	reportStructure.push({"id":"RF2", "type":"group", "indent":"", "bclass":"4", "description":"2) Disinvestimenti di immobilizzazioni inerenti alle attività diverse"});
	reportStructure.push({"id":"RF3", "type":"group", "indent":"", "bclass":"4", "description":"3) Disinvestimenti di attività finanziarie e patrimoniali"});
	reportStructure.push({"id":"RF4", "type":"group", "indent":"", "bclass":"4", "description":"4) Ricevimento di finanziamenti e di prestiti"});
	reportStructure.push({"id":"RF", "type":"total", "indent":"", "description":"Totale", "sum":"RF1;RF2;RF3;RF4"});

	/* AVANZO / DISAVANZO */
	  // => ricavi-costi (es RA;-CA)
	reportStructure.push({"id":"RA-CA", "type":"total", "indent":"", "description":"Avanzo/disavanzo attività di interesse generale (+/-)", "sum":"RA;-CA"});
	reportStructure.push({"id":"RB-CB", "type":"total", "indent":"", "description":"Avanzo/disavanzo attività diverse (+/-)", "sum":"RB;-CB"});
	reportStructure.push({"id":"RC-CC", "type":"total", "indent":"", "description":"Avanzo/disavanzo attività di raccolta fondi (+/-)", "sum":"RC;-CC"});
	reportStructure.push({"id":"RD-CD", "type":"total", "indent":"", "description":"Avanzo/disavanzo attività finanziarie e patrimoniali (+/-)", "sum":"RD;-CD"});
	reportStructure.push({"id":"RE-CE", "type":"total", "indent":"", "description":"Avanzo/disavanzo supporto generale (+/-)", "sum":"RE;-CE"});   
	reportStructure.push({"id":"RF-CF", "type":"total", "indent":"", "description":"Avanzo/disavanzo da entrate e uscite per investimenti e disinvestimenti patrimoniali e finanziamenti (+/-)", "sum":"RF;-CF"});
	reportStructure.push({"id":"TADPI", "type":"total", "indent":"", "description":"Avanzo/disavanzo d’esercizio prima delle imposte (+/-)", "sum":"RA-CA;RB-CB;RC-CC;RD-CD;RE-CE"});
	reportStructure.push({"id":"TADES", "type":"total", "indent":"", "description":"Avanzo/disavanzo d’esercizio prima di investimenti e disinvestimenti patrimoniali e finanziamenti (+/-)", "sum":"TADPI;IM"});
	reportStructure.push({"id":"TADRC", "type":"total", "indent":"", "description":"Avanzo/disavanzo complessivo (+/-)", "sum":"-IMRC;TADES;RF;-CF"}); // prima solo "IMRC"
	reportStructure.push({"id":"PAIV", "type":"total", "indent":"", "description":"Avanzo/disavanzo d'esercizio", "sum":"TADES"}); //not used

	/* COSTI / PROVENTI FIGURATIVI */
	reportStructure.push({"id":"CG1", "type":"group", "indent":"", "bclass":"3", "description":"1) da attività di interesse generale"});
	reportStructure.push({"id":"CG2", "type":"group", "indent":"", "bclass":"3", "description":"2) da attività diverse"});
	reportStructure.push({"id":"CG", "type":"total", "indent":"", "description":"Totale", "sum":"CG1;CG2"});
	reportStructure.push({"id":"RG1", "type":"group", "indent":"", "bclass":"4", "description":"1) da attività di interesse generale"});
	reportStructure.push({"id":"RG2", "type":"group", "indent":"", "bclass":"4", "description":"2) da attività diverse"});
	reportStructure.push({"id":"RG", "type":"total", "indent":"", "description":"Totale", "sum":"RG1;RG2"});
	reportStructure.push({"id":"RG-CG", "type":"total", "indent":"", "description":"Totale", "sum":"RG;-CG"}); //not used

	return reportStructure;
}

