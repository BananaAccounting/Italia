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


/* Update: 2020-07-29 */


/**
 * Loads the data structure:
 * - "id" used as GR/GR1 and to identify the object
 * - "type" used to define the type of data (group, title or total)
 * - "indent" used to define the indent level for the print
 * - "bclass" used to define the bclass of the group
 * - "description" used to define the description text used for the print
 * - "sum" used to define how to calculate the total
 */
function loadDataStructure(reportType) {

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
	dataStructure.push({"id":"TPC", "type":"group", "indent":"", "bclass":"1", "description":"Crediti verso clienti"});
	dataStructure.push({"id":"ACII1P", "type":"total", "indent":"", "description":"Crediti verso utenti e clienti da partitario", "sum":"TPC"});
	dataStructure.push({"id":"ACII1", "type":"total", "indent":"lvl2", "description":"1) Crediti verso utenti e clienti", "sum":"ACII1o;ACII1e;TPC"});
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
	if (reportType === "REPORT_TYPE_MOD_A" || reportType === "REPORT_TYPE_MOD_B") {
		dataStructure.push({"id":"ACIV1", "type":"group", "indent":"lvl2", "bclass":"1", "description":"1) Depositi bancari e postali"});
	} else if (reportType === "REPORT_TYPE_MOD_D") {
		dataStructure.push({"id":"ACIV1", "type":"group", "indent":"", "bclass":"1", "description":"Depositi bancari e postali"});
	}
	dataStructure.push({"id":"ACIV2", "type":"group", "indent":"lvl2", "bclass":"1", "description":"2) Assegni"});
	if (reportType === "REPORT_TYPE_MOD_A" || reportType === "REPORT_TYPE_MOD_B") {
		dataStructure.push({"id":"ACIV3", "type":"group", "indent":"lvl2", "bclass":"1", "description":"3) Danaro e valori in cassa"});
	} else if (reportType === "REPORT_TYPE_MOD_D") {
		dataStructure.push({"id":"ACIV3", "type":"group", "indent":"", "bclass":"1", "description":"Cassa"});
	}
	dataStructure.push({"id":"ACIV", "type":"total", "indent":"lvl1", "description":"Totale disponibilità liquide", "sum":"ACIV1;ACIV2;ACIV3"});
	dataStructure.push({"id":"AC", "type":"total", "indent":"lvl0", "description":"Totale attivo circolante C)", "sum":"ACI;ACII;ACIII;ACIV"});
	dataStructure.push({"id":"AD", "type":"group", "indent":"lvl0", "bclass":"1", "description":"D) Ratei e risconti attivi"});
	dataStructure.push({"id":"A", "type":"total", "indent":"lvl0", "description":"TOTALE ATTIVO", "sum":"AA;AB;AC;AD"});


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
	dataStructure.push({"id":"TPF", "type":"group", "indent":"", "bclass":"2", "description":"Partitario fornitori"});
	dataStructure.push({"id":"PD7P", "type":"total", "indent":"", "description":"Debiti verso fornitori da partitario", "sum":"TPF"});
	dataStructure.push({"id":"PD7", "type":"total", "indent":"lvl1", "description":"7) Debiti verso fornitori", "sum":"PD7o;PD7e;PD7P"});
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
	dataStructure.push({"id":"PD", "type":"total", "indent":"lvl0", "description":"Totale debiti D)", "sum":"PD1;PD2;PD3;PD4;PD5;PD6;PD7;PD8;PD9;PD10;PD11;PD12"});
	dataStructure.push({"id":"PE", "type":"group", "indent":"lvl0", "bclass":"2", "description":"E) Ratei e risconti passivi"});
	dataStructure.push({"id":"P", "type":"total", "indent":"lvl0", "description":"TOTALE PASSIVO", "sum":"PA;PB;PC;PD;PE"});

	if (reportType === "REPORT_TYPE_MOD_A" || reportType === "REPORT_TYPE_MOD_B") { // costi/ricavi per bilancio e rendiconto gestionale

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
		dataStructure.push({"id":"IM", "type":"group", "indent":"", "bclass":"4", "description":"Imposte"});

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

		/* COSTI / PROVENTI FIGURATIVI */
		dataStructure.push({"id":"CG1", "type":"group", "indent":"", "bclass":"3", "description":"1) da attività di interesse generale"});
		dataStructure.push({"id":"CG2", "type":"group", "indent":"", "bclass":"3", "description":"2) da attività diverse"});
		dataStructure.push({"id":"CG", "type":"total", "indent":"", "description":"Totale", "sum":"CG1;CG2"});
		dataStructure.push({"id":"RG1", "type":"group", "indent":"", "bclass":"4", "description":"1) da attività di interesse generale"});
		dataStructure.push({"id":"RG2", "type":"group", "indent":"", "bclass":"4", "description":"2) da attività diverse"});
		dataStructure.push({"id":"RG", "type":"total", "indent":"", "description":"Totale", "sum":"RG1;RG2"});
		dataStructure.push({"id":"RG-CG", "type":"total", "indent":"", "description":"Totale", "sum":"RG;-CG"}); //not used
	}
	else if (reportType === "REPORT_TYPE_MOD_D") { // uscite/entrate per rendiconto cassa

		/* USCITE */
		dataStructure.push({"id":"dCA", "type":"title", "indent":"", "description":"A) Uscite da attività di interesse generale"});
		dataStructure.push({"id":"CA1", "type":"group", "indent":"", "bclass":"3", "description":"1) Materie prime, sussidiarie, di consumo e di merci"});
		dataStructure.push({"id":"CA2", "type":"group", "indent":"", "bclass":"3", "description":"2) Servizi"});
		dataStructure.push({"id":"CA3", "type":"group", "indent":"", "bclass":"3", "description":"3) Godimento beni di terzi"});
		dataStructure.push({"id":"CA4", "type":"group", "indent":"", "bclass":"3", "description":"4) Personale"});
		dataStructure.push({"id":"CA7", "type":"group", "indent":"", "bclass":"3", "description":"5) Uscite diverse di gestione"});
		dataStructure.push({"id":"CA5", "type":"group", "indent":"", "bclass":"3", "description":"A) Ammortamenti"});
		dataStructure.push({"id":"CA6", "type":"group", "indent":"", "bclass":"3", "description":"A) Accantonamenti per rischi ed oneri"});
		dataStructure.push({"id":"CA8", "type":"group", "indent":"", "bclass":"3", "description":"A) Rimanenze iniziali"});
		dataStructure.push({"id":"CA", "type":"total", "indent":"", "description":"Totale", "sum":"CA1;CA2;CA3;CA4;CA7"});
		dataStructure.push({"id":"dCB", "type":"title", "indent":"", "description":"B) Uscite da attività diverse"});
		dataStructure.push({"id":"CB1", "type":"group", "indent":"", "bclass":"3", "description":"1) Materie prime, sussidiarie, di consumo e di merci"});
		dataStructure.push({"id":"CB2", "type":"group", "indent":"", "bclass":"3", "description":"2) Servizi"});
		dataStructure.push({"id":"CB3", "type":"group", "indent":"", "bclass":"3", "description":"3) Godimento beni di terzi"});
		dataStructure.push({"id":"CB4", "type":"group", "indent":"", "bclass":"3", "description":"4) Personale"});
		dataStructure.push({"id":"CB7", "type":"group", "indent":"", "bclass":"3", "description":"5) Uscite diverse di gestione"});
		dataStructure.push({"id":"CB5", "type":"group", "indent":"", "bclass":"3", "description":"B) Ammortamenti"});
		dataStructure.push({"id":"CB6", "type":"group", "indent":"", "bclass":"3", "description":"B) Accantonamenti per rischi ed oneri"});
		dataStructure.push({"id":"CB8", "type":"group", "indent":"", "bclass":"3", "description":"B) Rimanenze iniziali"});
		dataStructure.push({"id":"CB", "type":"total", "indent":"", "description":"Totale", "sum":"CB1;CB2;CB3;CB4;CB7"});
		dataStructure.push({"id":"dCC", "type":"title", "indent":"", "description":"C) Uscite da attività di raccolta fondi"});
		dataStructure.push({"id":"CC1", "type":"group", "indent":"", "bclass":"3", "description":"1) Uscite per raccolte fondi abituali"});
		dataStructure.push({"id":"CC2", "type":"group", "indent":"", "bclass":"3", "description":"2) Uscite per raccolte fondi occasionali"});
		dataStructure.push({"id":"CC3", "type":"group", "indent":"", "bclass":"3", "description":"3) Altre uscite"});
		dataStructure.push({"id":"CC", "type":"total", "indent":"", "description":"Totale", "sum":"CC1;CC2;CC3"});
		dataStructure.push({"id":"dCD", "type":"title", "indent":"", "description":"D) Uscite da attività finanziarie e patrimoniali"});
		dataStructure.push({"id":"CD1", "type":"group", "indent":"", "bclass":"3", "description":"1) Su rapporti bancari"});
		dataStructure.push({"id":"CD2", "type":"group", "indent":"", "bclass":"3", "description":"2) Su investimenti finanziari"});
		dataStructure.push({"id":"CD3", "type":"group", "indent":"", "bclass":"3", "description":"3) Su patrimonio edilizio"});
		dataStructure.push({"id":"CD4", "type":"group", "indent":"", "bclass":"3", "description":"4) Su altri beni patrimoniali"});
		dataStructure.push({"id":"CD6", "type":"group", "indent":"", "bclass":"3", "description":"5) Altre uscite"});
		dataStructure.push({"id":"CD5", "type":"group", "indent":"", "bclass":"3", "description":"C) Accantonamenti per rischi ed oneri"});
		dataStructure.push({"id":"CD", "type":"total", "indent":"", "description":"Totale", "sum":"CD1;CD2;CD3;CD4;CD6"});
		dataStructure.push({"id":"dCE", "type":"title", "indent":"", "description":"E) Uscite di supporto generale"});
		dataStructure.push({"id":"CE1", "type":"group", "indent":"", "bclass":"3", "description":"1) Materie prime, sussidiarie, di consumo e di merci"});
		dataStructure.push({"id":"CE2", "type":"group", "indent":"", "bclass":"3", "description":"2) Servizi"});
		dataStructure.push({"id":"CE3", "type":"group", "indent":"", "bclass":"3", "description":"3) Godimento beni di terzi"});
		dataStructure.push({"id":"CE4", "type":"group", "indent":"", "bclass":"3", "description":"4) Personale"});
		dataStructure.push({"id":"CE7", "type":"group", "indent":"", "bclass":"3", "description":"5) Altre uscite"});
		dataStructure.push({"id":"CE5", "type":"group", "indent":"", "bclass":"3", "description":"E) Ammortamenti"});
		dataStructure.push({"id":"CE6", "type":"group", "indent":"", "bclass":"3", "description":"E) Accantonamenti per rischi ed oneri"});
		dataStructure.push({"id":"CE", "type":"total", "indent":"", "description":"Totale", "sum":"CE1;CE2;CE3;CE4;CE7"});
		dataStructure.push({"id":"C", "type":"total", "indent":"", "description":"TOTALE ONERI E COSTI", "sum":"CA;CB;CC;CD;CE"});

		/* ENTRATE */
		dataStructure.push({"id":"dRA", "type":"title", "indent":"", "description":"A) Entrate da attività di interesse generale"});
		dataStructure.push({"id":"RA1", "type":"group", "indent":"", "bclass":"4", "description":"1) Entrate da quote associative e apporti dei fondatori"});
		dataStructure.push({"id":"RA2", "type":"group", "indent":"", "bclass":"4", "description":"2) Entrate dagli associati per attività mutuali"});
		dataStructure.push({"id":"RA3", "type":"group", "indent":"", "bclass":"4", "description":"3) Entrate per prestazioni e cessioni ad associati e fondatori"});
		dataStructure.push({"id":"RA4", "type":"group", "indent":"", "bclass":"4", "description":"4) Erogazioni liberali"});
		dataStructure.push({"id":"RA5", "type":"group", "indent":"", "bclass":"4", "description":"5) Entrate del 5 per mille"});
		dataStructure.push({"id":"RA6", "type":"group", "indent":"", "bclass":"4", "description":"6) Contributi da soggetti privati"});
		dataStructure.push({"id":"RA7", "type":"group", "indent":"", "bclass":"4", "description":"7) Entrate per prestazioni e cessioni a terzi"});
		dataStructure.push({"id":"RA8", "type":"group", "indent":"", "bclass":"4", "description":"8) Contributi da enti pubblici"});
		dataStructure.push({"id":"RA9", "type":"group", "indent":"", "bclass":"4", "description":"9) Entrate da contratti con enti pubblici"});
		dataStructure.push({"id":"RA10", "type":"group", "indent":"", "bclass":"4", "description":"10) Altre entrate"});
		dataStructure.push({"id":"RA", "type":"total", "indent":"", "description":"Totale", "sum":"RA1;RA2;RA3;RA4;RA5;RA6;RA7;RA8;RA9;RA10"});
		dataStructure.push({"id":"dRB", "type":"title", "indent":"", "description":"B) Entrate da attività diverse"});
		dataStructure.push({"id":"RB1", "type":"group", "indent":"", "bclass":"4", "description":"1) Entrate per prestazioni e cessioni ad associati e fondatori"});
		dataStructure.push({"id":"RB2", "type":"group", "indent":"", "bclass":"4", "description":"2) Contributi da soggetti privati"});
		dataStructure.push({"id":"RB3", "type":"group", "indent":"", "bclass":"4", "description":"3) Entrate per prestazioni e cessioni a terzi"});
		dataStructure.push({"id":"RB4", "type":"group", "indent":"", "bclass":"4", "description":"4) Contributi da enti pubblici"});
		dataStructure.push({"id":"RB5", "type":"group", "indent":"", "bclass":"4", "description":"5) Entrate da contratti con enti pubblici"});
		dataStructure.push({"id":"RB6", "type":"group", "indent":"", "bclass":"4", "description":"6) Altre entrate"});
		dataStructure.push({"id":"RB", "type":"total", "indent":"", "description":"Totale", "sum":"RB1;RB2;RB3;RB4;RB5;RB6"});
		dataStructure.push({"id":"dRC", "type":"title", "indent":"", "description":"C) Entrate da attività di raccolta fondi"});
		dataStructure.push({"id":"RC1", "type":"group", "indent":"", "bclass":"4", "description":"1) Entrate da raccolte fondi abituali"});
		dataStructure.push({"id":"RC2", "type":"group", "indent":"", "bclass":"4", "description":"2) Entrate da raccolte fondi occasionali"});
		dataStructure.push({"id":"RC3", "type":"group", "indent":"", "bclass":"4", "description":"3) Altre entrate"});
		dataStructure.push({"id":"RC", "type":"total", "indent":"", "description":"Totale", "sum":"RC1;RC2;RC3"});
		dataStructure.push({"id":"dRD", "type":"title", "indent":"", "description":"D) Entrate da attività finanziarie e patrimoniali"});
		dataStructure.push({"id":"RD1", "type":"group", "indent":"", "bclass":"4", "description":"1) Da rapporti bancari"});
		dataStructure.push({"id":"RD2", "type":"group", "indent":"", "bclass":"4", "description":"2) Da altri investimenti finanziari"});
		dataStructure.push({"id":"RD3", "type":"group", "indent":"", "bclass":"4", "description":"3) Da patrimonio edilizio"});
		dataStructure.push({"id":"RD4", "type":"group", "indent":"", "bclass":"4", "description":"4) Da altri beni patrimoniali"});
		dataStructure.push({"id":"RD5", "type":"group", "indent":"", "bclass":"4", "description":"5) Altre entrate"});
		dataStructure.push({"id":"RD", "type":"total", "indent":"", "description":"Totale", "sum":"RD1;RD2;RD3;RD4;RD5"});
		dataStructure.push({"id":"dRE", "type":"title", "indent":"", "description":"E) Entrate di supporto generale"});
		dataStructure.push({"id":"RE1", "type":"group", "indent":"", "bclass":"4", "description":"1) Entrate da distacco del personale"});
		dataStructure.push({"id":"RE2", "type":"group", "indent":"", "bclass":"4", "description":"2) Altre entrate di supporto generale"});
		dataStructure.push({"id":"RE", "type":"total", "indent":"", "description":"Totale", "sum":"RE1;RE2"});
		dataStructure.push({"id":"R", "type":"total", "indent":"", "description":"Totale entrate della gestione", "sum":"RA;RB;RC;RD;RE"});
		dataStructure.push({"id":"IM", "type":"group", "indent":"", "bclass":"4", "description":"Imposte"});

		/* USCITE DA INVESTIMENTI */
		dataStructure.push({"id":"CF1", "type":"group", "indent":"", "bclass":"3", "description":"1) Investimenti in immobilizzazioni inerenti alle attività di interesse generale"});
		dataStructure.push({"id":"CF2", "type":"group", "indent":"", "bclass":"3", "description":"2) Investimenti in immobilizzazioni inerenti alle attività diverse"});
		dataStructure.push({"id":"CF3", "type":"group", "indent":"", "bclass":"3", "description":"3) Investimenti in attività finanziarie e patrimoniali"});
		dataStructure.push({"id":"CF4", "type":"group", "indent":"", "bclass":"3", "description":"4) Rimborso di finanziamenti per quota capitale e di prestiti"});
		dataStructure.push({"id":"CF", "type":"total", "indent":"", "description":"Totale", "sum":"CF1;CF2;CF3;CF4"});
		dataStructure.push({"id":"IMRC", "type":"group", "indent":"", "bclass":"3", "description":"Imposte"});

		/* ENTRATE DA DISINVESTIMENTI */
		dataStructure.push({"id":"RF1", "type":"group", "indent":"", "bclass":"4", "description":"1) Disinvestimenti di immobilizzazioni inerenti alle attività di interesse generale"});
		dataStructure.push({"id":"RF2", "type":"group", "indent":"", "bclass":"4", "description":"2) Disinvestimenti di immobilizzazioni inerenti alle attività diverse"});
		dataStructure.push({"id":"RF3", "type":"group", "indent":"", "bclass":"4", "description":"3) Disinvestimenti di attività finanziarie e patrimoniali"});
		dataStructure.push({"id":"RF4", "type":"group", "indent":"", "bclass":"4", "description":"4) Ricevimento di finanziamenti e di prestiti"});
		dataStructure.push({"id":"RF", "type":"total", "indent":"", "description":"Totale", "sum":"RF1;RF2;RF3;RF4"});

		/* AVANZO / DISAVANZO */
		  // => ricavi-costi (es RA;-CA)
		dataStructure.push({"id":"RA-CA", "type":"total", "indent":"", "description":"Avanzo/disavanzo attività di interesse generale (+/-)", "sum":"RA;-CA"});
		dataStructure.push({"id":"RB-CB", "type":"total", "indent":"", "description":"Avanzo/disavanzo attività diverse (+/-)", "sum":"RB;-CB"});
		dataStructure.push({"id":"RC-CC", "type":"total", "indent":"", "description":"Avanzo/disavanzo attività di raccolta fondi (+/-)", "sum":"RC;-CC"});
		dataStructure.push({"id":"RD-CD", "type":"total", "indent":"", "description":"Avanzo/disavanzo attività finanziarie e patrimoniali (+/-)", "sum":"RD;-CD"});
		dataStructure.push({"id":"RE-CE", "type":"total", "indent":"", "description":"Avanzo/disavanzo supporto generale (+/-)", "sum":"RE;-CE"});   
		dataStructure.push({"id":"RF-CF", "type":"total", "indent":"", "description":"Avanzo/disavanzo da entrate e uscite per investimenti e disinvestimenti patrimoniali e finanziamenti (+/-)", "sum":"RF;-CF"});
		dataStructure.push({"id":"TADPI", "type":"total", "indent":"", "description":"Avanzo/disavanzo d’esercizio prima delle imposte (+/-)", "sum":"RA-CA;RB-CB;RC-CC;RD-CD;RE-CE"});
		dataStructure.push({"id":"TADES", "type":"total", "indent":"", "description":"Avanzo/disavanzo d’esercizio prima di investimenti e disinvestimenti patrimoniali e finanziamenti (+/-)", "sum":"TADPI;IM"});
		dataStructure.push({"id":"TADRC", "type":"total", "indent":"", "description":"Avanzo/disavanzo complessivo (+/-)", "sum":"IMRC"});
		dataStructure.push({"id":"PAIV", "type":"total", "indent":"", "description":"Avanzo/disavanzo d'esercizio", "sum":"TADES"}); //not used

		/* COSTI / PROVENTI FIGURATIVI */
		dataStructure.push({"id":"CG1", "type":"group", "indent":"", "bclass":"3", "description":"1) da attività di interesse generale"});
		dataStructure.push({"id":"CG2", "type":"group", "indent":"", "bclass":"3", "description":"2) da attività diverse"});
		dataStructure.push({"id":"CG", "type":"total", "indent":"", "description":"Totale", "sum":"CG1;CG2"});
		dataStructure.push({"id":"RG1", "type":"group", "indent":"", "bclass":"4", "description":"1) da attività di interesse generale"});
		dataStructure.push({"id":"RG2", "type":"group", "indent":"", "bclass":"4", "description":"2) da attività diverse"});
		dataStructure.push({"id":"RG", "type":"total", "indent":"", "description":"Totale", "sum":"RG1;RG2"});
		dataStructure.push({"id":"RG-CG", "type":"total", "indent":"", "description":"Totale", "sum":"RG;-CG"}); //not used
	}

	return dataStructure;
}

