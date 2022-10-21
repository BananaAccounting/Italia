// Copyright [2022] [Banana.ch SA - Lugano Switzerland]
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


/* Update: 2022-10-19 */


/**
 * Creates the report structure for each report type.
 * - "id" used as GR/GR1 and to identify the object
 * - "type" used to define the type of data (group, title or total)
 * - "indent" used to define the indent level for the print
 * - "bclass" used to define the bclass of the group
 * - "description" used to define the description text used for the print
 * - "sum" used to define how to calculate the total
 */

//==============
// Balance sheet
//==============
function createPrintStructureStatoPatrimoniale() {

	var printStructure = [];

	printStructure.push({"dialogText":"STATO PATRIMONIALE -- DETTAGLIO MOVIMENTI --", "titleText":"RENDICONTO STATO PATRIMONIALE ANNO %1 DETTAGLIO MOVIMENTI"});

	printStructure.push({"id":"dA", "isTitle":true, "newpage":false});
	printStructure.push({"id":"AA"});
	printStructure.push({"id":"dAB", "isTitle":true});
	printStructure.push({"id":"dABI", "isTitle":true});
	printStructure.push({"id":"ABI1"});
	printStructure.push({"id":"ABI2"});
	printStructure.push({"id":"ABI3"});
	printStructure.push({"id":"ABI4"});
	printStructure.push({"id":"ABI5"});
	printStructure.push({"id":"ABI6"});
	printStructure.push({"id":"ABI7"});
	printStructure.push({"id":"ABI"});
	printStructure.push({"id":"dABII", "isTitle":true});
	printStructure.push({"id":"ABII1"});
	printStructure.push({"id":"ABII2"});
	printStructure.push({"id":"ABII3"});
	printStructure.push({"id":"ABII4"});
	printStructure.push({"id":"ABII5"});
	printStructure.push({"id":"ABII"});
	printStructure.push({"id":"dABIII", "isTitle":true});
	printStructure.push({"id":"ABIII1", "isTitle":true});
	printStructure.push({"id":"ABIII1a"});
	printStructure.push({"id":"ABIII1b"});
	printStructure.push({"id":"ABIII1c"});
	printStructure.push({"id":"ABIII2", "isTitle":true});
	printStructure.push({"id":"ABIII2a", "isTitle":true});
	printStructure.push({"id":"ABIII2ae"});
	printStructure.push({"id":"ABIII2ao"});
	printStructure.push({"id":"ABIII2b", "isTitle":true});
	printStructure.push({"id":"ABIII2be"});
	printStructure.push({"id":"ABIII2bo"});
	printStructure.push({"id":"ABIII2c", "isTitle":true});
	printStructure.push({"id":"ABIII2ce"});
	printStructure.push({"id":"ABIII2co"});
	printStructure.push({"id":"ABIII2d", "isTitle":true});
	printStructure.push({"id":"ABIII2de"});
	printStructure.push({"id":"ABIII2do"});
	printStructure.push({"id":"ABIII3"});
	printStructure.push({"id":"ABIII"});
	printStructure.push({"id":"AB"});
	printStructure.push({"id":"dAC", "isTitle":true});
	printStructure.push({"id":"dACI", "isTitle":true});
	printStructure.push({"id":"ACI1"});
	printStructure.push({"id":"ACI2"});
	printStructure.push({"id":"ACI3"});
	printStructure.push({"id":"ACI4"});
	printStructure.push({"id":"ACI5"});
	printStructure.push({"id":"ACI"});
	printStructure.push({"id":"dACII", "isTitle":true});
	printStructure.push({"id":"ACII1", "isTitle":true});
	printStructure.push({"id":"ACII1e"});
	printStructure.push({"id":"ACII1o"});
	printStructure.push({"id":"ACII2", "isTitle":true});
	printStructure.push({"id":"ACII2e"});
	printStructure.push({"id":"ACII2o"});
	printStructure.push({"id":"ACII3", "isTitle":true});
	printStructure.push({"id":"ACII3e"});
	printStructure.push({"id":"ACII3o"});
	printStructure.push({"id":"ACII4", "isTitle":true});
	printStructure.push({"id":"ACII4e"});
	printStructure.push({"id":"ACII4o"});
	printStructure.push({"id":"ACII5", "isTitle":true});
	printStructure.push({"id":"ACII5e"});
	printStructure.push({"id":"ACII5o"});
	printStructure.push({"id":"ACII6", "isTitle":true});
	printStructure.push({"id":"ACII6e"});
	printStructure.push({"id":"ACII6o"});
	printStructure.push({"id":"ACII7", "isTitle":true});
	printStructure.push({"id":"ACII7e"});
	printStructure.push({"id":"ACII7o"});
	printStructure.push({"id":"ACII8", "isTitle":true});
	printStructure.push({"id":"ACII8e"});
	printStructure.push({"id":"ACII8o"});
	printStructure.push({"id":"ACII9", "isTitle":true});
	printStructure.push({"id":"ACII9e"});
	printStructure.push({"id":"ACII9o"});
	printStructure.push({"id":"ACII10", "isTitle":true});
	printStructure.push({"id":"ACII10e"});
	printStructure.push({"id":"ACII10o"});
	printStructure.push({"id":"ACII11", "isTitle":true});
	printStructure.push({"id":"ACII11e"});
	printStructure.push({"id":"ACII11o"});
	printStructure.push({"id":"ACII12", "isTitle":true});
	printStructure.push({"id":"ACII12e"});
	printStructure.push({"id":"ACII12o"});
	printStructure.push({"id":"ACII"});
	printStructure.push({"id":"dACIII", "isTitle":true});
	printStructure.push({"id":"ACIII1"});
	printStructure.push({"id":"ACIII2"});
	printStructure.push({"id":"ACIII3"});
	printStructure.push({"id":"ACIII"});
	printStructure.push({"id":"dACIV", "isTitle":true});
	printStructure.push({"id":"ACIV1"});
	printStructure.push({"id":"ACIV2"});
	printStructure.push({"id":"ACIV3"});
	printStructure.push({"id":"ACIV"});
	printStructure.push({"id":"AC"});
	printStructure.push({"id":"AD"});
	printStructure.push({"id":"A"});

	printStructure.push({"id":"dP", "isTitle":true, "newpage":true});
	printStructure.push({"id":"dPA", "isTitle":true});
	printStructure.push({"id":"PAI"});
	printStructure.push({"id":"dPAII", "isTitle":true});
	printStructure.push({"id":"PAII1"});
	printStructure.push({"id":"PAII2"});
	printStructure.push({"id":"PAII3"});
	printStructure.push({"id":"PAII"});
	printStructure.push({"id":"dPAIII", "isTitle":true});
	printStructure.push({"id":"PAIII1"});
	printStructure.push({"id":"PAIII2"});
	printStructure.push({"id":"PAIII"});
	printStructure.push({"id":"PAIV"});
	printStructure.push({"id":"PA"});
	printStructure.push({"id":"dPB", "isTitle":true});
	printStructure.push({"id":"PB1"});
	printStructure.push({"id":"PB2"});
	printStructure.push({"id":"PB3"});
	printStructure.push({"id":"PB"});
	printStructure.push({"id":"PC"});
	printStructure.push({"id":"dPD", "isTitle":true});
	printStructure.push({"id":"PD1", "isTitle":true});
	printStructure.push({"id":"PD1e"});
	printStructure.push({"id":"PD1o"});
	printStructure.push({"id":"PD2", "isTitle":true});
	printStructure.push({"id":"PD2e"});
	printStructure.push({"id":"PD2o"});
	printStructure.push({"id":"PD3", "isTitle":true});
	printStructure.push({"id":"PD3e"});
	printStructure.push({"id":"PD3o"});
	printStructure.push({"id":"PD4", "isTitle":true});
	printStructure.push({"id":"PD4e"});
	printStructure.push({"id":"PD4o"});
	printStructure.push({"id":"PD5", "isTitle":true});
	printStructure.push({"id":"PD5e"});
	printStructure.push({"id":"PD5o"});
	printStructure.push({"id":"PD6", "isTitle":true});
	printStructure.push({"id":"PD6e"});
	printStructure.push({"id":"PD6o"});
	printStructure.push({"id":"PD7", "isTitle":true});
	printStructure.push({"id":"PD7e"});
	printStructure.push({"id":"PD7o"});
	printStructure.push({"id":"PD8", "isTitle":true});
	printStructure.push({"id":"PD8e"});
	printStructure.push({"id":"PD8o"});
	printStructure.push({"id":"PD9", "isTitle":true});
	printStructure.push({"id":"PD9e"});
	printStructure.push({"id":"PD9o"});
	printStructure.push({"id":"PD10", "isTitle":true});
	printStructure.push({"id":"PD10e"});
	printStructure.push({"id":"PD10o"});
	printStructure.push({"id":"PD11", "isTitle":true});
	printStructure.push({"id":"PD11e"});
	printStructure.push({"id":"PD11o"});
	printStructure.push({"id":"PD12", "isTitle":true});
	printStructure.push({"id":"PD12e"});
	printStructure.push({"id":"PD12o"});
	printStructure.push({"id":"PD"});
	printStructure.push({"id":"PE"});
	printStructure.push({"id":"P"});

	return printStructure;
}

function createReportStructureStatoPatrimoniale() {

	var reportStructure = [];

	/* ATTIVO */
	reportStructure.push({"id":"dA", "description":"ATTIVO"});
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
	reportStructure.push({"id":"dP", "description":"PASSIVO"});
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
	reportStructure.push({"id":"CA5b", "type":"group", "indent":"", "bclass":"3", "description":"5 bis) svalutazioni delle immobilizzazioni materiali ed immateriali"}); //non usato
	reportStructure.push({"id":"CA6", "type":"group", "indent":"", "bclass":"3", "description":"6) Accantonamenti per rischi ed oneri"});
	reportStructure.push({"id":"CA7", "type":"group", "indent":"", "bclass":"3", "description":"7) Oneri diversi di gestione"});
	reportStructure.push({"id":"CA8", "type":"group", "indent":"", "bclass":"3", "description":"8) Rimanenze iniziali"});
	reportStructure.push({"id":"CA9", "type":"group", "indent":"", "bclass":"3", "description":"9) Accantonamento a riserva vincolata per decisione degli organi istituzionali"});  //non usato
	reportStructure.push({"id":"CA10", "type":"group", "indent":"", "bclass":"3", "description":"10) Utilizzo riserva vincolata per decisione degli organi istituzionali"});  //non usato
	reportStructure.push({"id":"CA", "type":"total", "indent":"", "description":"Totale", "sum":"CA1;CA2;CA3;CA4;CA5;CA6;CA7;CA8"});
	reportStructure.push({"id":"dCB", "type":"title", "indent":"", "description":"B) Costi e oneri da attività diverse"});
	reportStructure.push({"id":"CB1", "type":"group", "indent":"", "bclass":"3", "description":"1) Materie prime, sussidiarie, di consumo e di merci"});
	reportStructure.push({"id":"CB2", "type":"group", "indent":"", "bclass":"3", "description":"2) Servizi"});
	reportStructure.push({"id":"CB3", "type":"group", "indent":"", "bclass":"3", "description":"3) Godimento beni di terzi"});
	reportStructure.push({"id":"CB4", "type":"group", "indent":"", "bclass":"3", "description":"4) Personale"});
	reportStructure.push({"id":"CB5", "type":"group", "indent":"", "bclass":"3", "description":"5) Ammortamenti"});
	reportStructure.push({"id":"CB5b", "type":"group", "indent":"", "bclass":"3", "description":"5 bis) svalutazioni delle immobilizzazioni materiali ed immateriali"});  //non usato
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
	reportStructure.push({"id":"CE5b", "type":"group", "indent":"", "bclass":"3", "description":"5 bis) svalutazioni delle immobilizzazioni materiali ed immateriali"});  //non usato
	reportStructure.push({"id":"CE6", "type":"group", "indent":"", "bclass":"3", "description":"6) Accantonamenti per rischi ed oneri"});
	reportStructure.push({"id":"CE7", "type":"group", "indent":"", "bclass":"3", "description":"7) Altri oneri"});
	reportStructure.push({"id":"CE8", "type":"group", "indent":"", "bclass":"3", "description":"8) Accantonamento a riserva vincolata per decisione degli organi istituzionali"});  //non usato
	reportStructure.push({"id":"CE9", "type":"group", "indent":"", "bclass":"3", "description":"9) Utilizzo riserva vincolata per decisione degli organi istituzionali"});  //non usato
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
	reportStructure.push({"id":"PAIV", "type":"total", "indent":"0", "description":"IV - Avanzo/disavanzo d'esercizio", "sum":"TADES"});

	/* COSTI / PROVENTI FIGURATIVI */
	reportStructure.push({"id":"CG1", "type":"group", "indent":"", "bclass":"3", "description":"1) da attività di interesse generale"});
	reportStructure.push({"id":"CG2", "type":"group", "indent":"", "bclass":"3", "description":"2) da attività diverse"});
	reportStructure.push({"id":"CG", "type":"total", "indent":"", "description":"Totale", "sum":"CG1;CG2"});
	reportStructure.push({"id":"RG1", "type":"group", "indent":"", "bclass":"4", "description":"1) da attività di interesse generale"});
	reportStructure.push({"id":"RG2", "type":"group", "indent":"", "bclass":"4", "description":"2) da attività diverse"});
	reportStructure.push({"id":"RG", "type":"total", "indent":"", "description":"Totale", "sum":"RG1;RG2"});
	reportStructure.push({"id":"RG-CG", "type":"total", "indent":"", "description":"Totale", "sum":"RG;-CG"}); //not used

	/* USTI SOLO PER IL CONTROLLO CODICI */
	reportStructure.push({"id":"CF1", "type":"group", "description":""});
	reportStructure.push({"id":"CF2", "type":"group", "description":""});
	reportStructure.push({"id":"CF3", "type":"group", "description":""});
	reportStructure.push({"id":"CF4", "type":"group", "description":""});
	reportStructure.push({"id":"IMRC", "type":"group", "description":""});
	reportStructure.push({"id":"RF1", "type":"group", "description":""});
	reportStructure.push({"id":"RF2", "type":"group", "description":""});
	reportStructure.push({"id":"RF3", "type":"group", "description":""});
	reportStructure.push({"id":"RF4", "type":"group", "description":""});


	return reportStructure;
}

//========================
// Profit & Loss statement
//========================
function createPrintStructureRendicontoGestionale() {

	var printStructure = [];

	printStructure.push({"dialogText":"RENDICONTO GESTIONALE -- DETTAGLIO MOVIMENTI --", "titleText":"RENDICONTO GESTIONALE ANNO %1 DETTAGLIO MOVIMENTI"});

	printStructure.push({"id":"dC", "isTitle":true, "newpage":false});
	printStructure.push({"id":"dCA", "isTitle":true});
	printStructure.push({"id":"CA1"});
	printStructure.push({"id":"CA2"});
	printStructure.push({"id":"CA3"});
	printStructure.push({"id":"CA4"});
	printStructure.push({"id":"CA5"});
	printStructure.push({"id":"CA5b"});
	printStructure.push({"id":"CA6"});
	printStructure.push({"id":"CA7"});
	printStructure.push({"id":"CA8"});
	printStructure.push({"id":"CA9"});
	printStructure.push({"id":"CA10"});
	printStructure.push({"id":"CA"});
	printStructure.push({"id":"dCB", "isTitle":true});
	printStructure.push({"id":"CB1"});
	printStructure.push({"id":"CB2"});
	printStructure.push({"id":"CB3"});
	printStructure.push({"id":"CB4"});
	printStructure.push({"id":"CB5"});
	printStructure.push({"id":"CB5b"});
	printStructure.push({"id":"CB6"});
	printStructure.push({"id":"CB7"});
	printStructure.push({"id":"CB8"});
	printStructure.push({"id":"CB"});
	printStructure.push({"id":"dCC", "isTitle":true});
	printStructure.push({"id":"CC1"});
	printStructure.push({"id":"CC2"});
	printStructure.push({"id":"CC3"});
	printStructure.push({"id":"CC"});
	printStructure.push({"id":"dCD", "isTitle":true});
	printStructure.push({"id":"CD1"});
	printStructure.push({"id":"CD2"});
	printStructure.push({"id":"CD3"});
	printStructure.push({"id":"CD4"});
	printStructure.push({"id":"CD5"});
	printStructure.push({"id":"CD6"});
	printStructure.push({"id":"CD"});
	printStructure.push({"id":"dCE", "isTitle":true});
	printStructure.push({"id":"CE1"});
	printStructure.push({"id":"CE2"});
	printStructure.push({"id":"CE3"});
	printStructure.push({"id":"CE4"});
	printStructure.push({"id":"CE5"});
	printStructure.push({"id":"CE5b"});
	printStructure.push({"id":"CE6"});
	printStructure.push({"id":"CE7"});
	printStructure.push({"id":"CE8"});
	printStructure.push({"id":"CE9"});
	printStructure.push({"id":"CE"});
	printStructure.push({"id":"C"});

	printStructure.push({"id":"dR", "isTitle":true, "newpage":true});
	printStructure.push({"id":"dRA", "isTitle":true});
	printStructure.push({"id":"RA1"});
	printStructure.push({"id":"RA2"});
	printStructure.push({"id":"RA3"});
	printStructure.push({"id":"RA4"});
	printStructure.push({"id":"RA5"});
	printStructure.push({"id":"RA6"});
	printStructure.push({"id":"RA7"});
	printStructure.push({"id":"RA8"});
	printStructure.push({"id":"RA9"});
	printStructure.push({"id":"RA10"});
	printStructure.push({"id":"RA11"});
	printStructure.push({"id":"RA"});
	printStructure.push({"id":"dRB", "isTitle":true});
	printStructure.push({"id":"RB1"});
	printStructure.push({"id":"RB2"});
	printStructure.push({"id":"RB4"});
	printStructure.push({"id":"RB5"});
	printStructure.push({"id":"RB6"});
	printStructure.push({"id":"RB7"});
	printStructure.push({"id":"RB"});
	printStructure.push({"id":"dRC", "isTitle":true});
	printStructure.push({"id":"RC1"});
	printStructure.push({"id":"RC2"});
	printStructure.push({"id":"RC3"});
	printStructure.push({"id":"RC"});
	printStructure.push({"id":"dRD", "isTitle":true});
	printStructure.push({"id":"RD1"});
	printStructure.push({"id":"RD2"});
	printStructure.push({"id":"RD3"});
	printStructure.push({"id":"RD4"});
	printStructure.push({"id":"RD5"});
	printStructure.push({"id":"RD"});
	printStructure.push({"id":"dRE", "isTitle":true});
	printStructure.push({"id":"RE1"});
	printStructure.push({"id":"RE2"});
	printStructure.push({"id":"RE"});
	printStructure.push({"id":"R"});

	printStructure.push({"id":"dCG", "isTitle":true, "newpage":true});
	printStructure.push({"id":"CG1"});
	printStructure.push({"id":"CG2"});
	printStructure.push({"id":"CG"});
	printStructure.push({"id":"dRG", "isTitle":true});
	printStructure.push({"id":"RG1"});
	printStructure.push({"id":"RG2"});
	printStructure.push({"id":"RG"});


	return printStructure;
}

function createReportStructureRendicontoGestionale() {

	var reportStructure = [];

	/* COSTI */
	reportStructure.push({"id":"dC", "description":"ONERI E COSTI"});
	reportStructure.push({"id":"dCA", "type":"title", "indent":"", "description":"A) Costi e oneri da attività di interesse generale"});
	reportStructure.push({"id":"CA1", "type":"group", "indent":"", "bclass":"3", "description":"1) Materie prime, sussidiarie, di consumo e di merci"});
	reportStructure.push({"id":"CA2", "type":"group", "indent":"", "bclass":"3", "description":"2) Servizi"});
	reportStructure.push({"id":"CA3", "type":"group", "indent":"", "bclass":"3", "description":"3) Godimento beni di terzi"});
	reportStructure.push({"id":"CA4", "type":"group", "indent":"", "bclass":"3", "description":"4) Personale"});
	reportStructure.push({"id":"CA5", "type":"group", "indent":"", "bclass":"3", "description":"5) Ammortamenti"});
	reportStructure.push({"id":"CA5b", "type":"group", "indent":"", "bclass":"3", "description":"5 bis) svalutazioni delle immobilizzazioni materiali ed immateriali"});
	reportStructure.push({"id":"CA6", "type":"group", "indent":"", "bclass":"3", "description":"6) Accantonamenti per rischi ed oneri"});
	reportStructure.push({"id":"CA7", "type":"group", "indent":"", "bclass":"3", "description":"7) Oneri diversi di gestione"});
	reportStructure.push({"id":"CA8", "type":"group", "indent":"", "bclass":"3", "description":"8) Rimanenze iniziali"});
	reportStructure.push({"id":"CA9", "type":"group", "indent":"", "bclass":"3", "description":"9) Accantonamento a riserva vincolata per decisione degli organi istituzionali"});
	reportStructure.push({"id":"CA10", "type":"group", "indent":"", "bclass":"3", "description":"10) Utilizzo riserva vincolata per decisione degli organi istituzionali"});
	reportStructure.push({"id":"CA", "type":"total", "indent":"", "description":"Totale", "sum":"CA1;CA2;CA3;CA4;CA5;CA5b;CA6;CA7;CA8;CA9;CA10"});
	reportStructure.push({"id":"dCB", "type":"title", "indent":"", "description":"B) Costi e oneri da attività diverse"});
	reportStructure.push({"id":"CB1", "type":"group", "indent":"", "bclass":"3", "description":"1) Materie prime, sussidiarie, di consumo e di merci"});
	reportStructure.push({"id":"CB2", "type":"group", "indent":"", "bclass":"3", "description":"2) Servizi"});
	reportStructure.push({"id":"CB3", "type":"group", "indent":"", "bclass":"3", "description":"3) Godimento beni di terzi"});
	reportStructure.push({"id":"CB4", "type":"group", "indent":"", "bclass":"3", "description":"4) Personale"});
	reportStructure.push({"id":"CB5", "type":"group", "indent":"", "bclass":"3", "description":"5) Ammortamenti"});
	reportStructure.push({"id":"CB5b", "type":"group", "indent":"", "bclass":"3", "description":"5 bis) svalutazioni delle immobilizzazioni materiali ed immateriali"});
	reportStructure.push({"id":"CB6", "type":"group", "indent":"", "bclass":"3", "description":"6) Accantonamenti per rischi ed oneri"});
	reportStructure.push({"id":"CB7", "type":"group", "indent":"", "bclass":"3", "description":"7) Oneri diversi di gestione"});
	reportStructure.push({"id":"CB8", "type":"group", "indent":"", "bclass":"3", "description":"8) Rimanenze iniziali"});
	reportStructure.push({"id":"CB", "type":"total", "indent":"", "description":"Totale", "sum":"CB1;CB2;CB3;CB4;CB5;CB5b;CB6;CB7;CB8"});
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
	reportStructure.push({"id":"CE5b", "type":"group", "indent":"", "bclass":"3", "description":"5 bis) svalutazioni delle immobilizzazioni materiali ed immateriali"});
	reportStructure.push({"id":"CE6", "type":"group", "indent":"", "bclass":"3", "description":"6) Accantonamenti per rischi ed oneri"});
	reportStructure.push({"id":"CE7", "type":"group", "indent":"", "bclass":"3", "description":"7) Altri oneri"});
	reportStructure.push({"id":"CE8", "type":"group", "indent":"", "bclass":"3", "description":"8) Accantonamento a riserva vincolata per decisione degli organi istituzionali"});
	reportStructure.push({"id":"CE9", "type":"group", "indent":"", "bclass":"3", "description":"9) Utilizzo riserva vincolata per decisione degli organi istituzionali"});
	reportStructure.push({"id":"CE", "type":"total", "indent":"", "description":"Totale", "sum":"CE1;CE2;CE3;CE4;CE5;CE5b;CE6;CE7;CE8;CE9"});
	reportStructure.push({"id":"C", "type":"total", "indent":"", "description":"TOTALE ONERI E COSTI", "sum":"CA;CB;CC;CD;CE"});

	/* PROVENTI */
	reportStructure.push({"id":"dR", "description":"PROVENTI E RICAVI"});
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
	reportStructure.push({"id":"dCG", "description":"Costi figurativi"});
	reportStructure.push({"id":"CG1", "type":"group", "indent":"", "bclass":"3", "description":"1) da attività di interesse generale"});
	reportStructure.push({"id":"CG2", "type":"group", "indent":"", "bclass":"3", "description":"2) da attività diverse"});
	reportStructure.push({"id":"CG", "type":"total", "indent":"", "description":"Totale", "sum":"CG1;CG2"});
	reportStructure.push({"id":"dRG", "description":"Proventi figurativi"});
	reportStructure.push({"id":"RG1", "type":"group", "indent":"", "bclass":"4", "description":"1) da attività di interesse generale"});
	reportStructure.push({"id":"RG2", "type":"group", "indent":"", "bclass":"4", "description":"2) da attività diverse"});
	reportStructure.push({"id":"RG", "type":"total", "indent":"", "description":"Totale", "sum":"RG1;RG2"});
	reportStructure.push({"id":"RG-CG", "type":"total", "indent":"", "description":"Totale", "sum":"RG;-CG"}); //not used

	/* USTI SOLO PER IL CONTROLLO CODICI */
	reportStructure.push({"id":"CF1", "type":"group", "description":""});
	reportStructure.push({"id":"CF2", "type":"group", "description":""});
	reportStructure.push({"id":"CF3", "type":"group", "description":""});
	reportStructure.push({"id":"CF4", "type":"group", "description":""});
	reportStructure.push({"id":"IMRC", "type":"group", "description":""});
	reportStructure.push({"id":"RF1", "type":"group", "description":""});
	reportStructure.push({"id":"RF2", "type":"group", "description":""});
	reportStructure.push({"id":"RF3", "type":"group", "description":""});
	reportStructure.push({"id":"RF4", "type":"group", "description":""});

	return reportStructure;
}

//=================
// Rendiconto cassa
//=================
function createPrintStructureRendicontoCassa() {

	var printStructure = [];

	printStructure.push({"dialogText":"RENDICONTO PER CASSA -- DETTAGLIO MOVIMENTI --", "titleText":"RENDICONTO PER CASSA ANNO %1 CON DETTAGLIO MOVIMENTI"});

	printStructure.push({"id":"dC", "isTitle":true, "newpage":false});
	printStructure.push({"id":"dCA", "isTitle":true});
	printStructure.push({"id":"CA1"});
	printStructure.push({"id":"CA2"});
	printStructure.push({"id":"CA3"});
	printStructure.push({"id":"CA4"});
	printStructure.push({"id":"CA7"});
	printStructure.push({"id":"CA"});
	printStructure.push({"id":"dCB", "isTitle":true});
	printStructure.push({"id":"CB1"});
	printStructure.push({"id":"CB2"});
	printStructure.push({"id":"CB3"});
	printStructure.push({"id":"CB4"});
	printStructure.push({"id":"CB7"});
	printStructure.push({"id":"CB"});
	printStructure.push({"id":"dCC", "isTitle":true});
	printStructure.push({"id":"CC1"});
	printStructure.push({"id":"CC2"});
	printStructure.push({"id":"CC3"});
	printStructure.push({"id":"CC"});
	printStructure.push({"id":"dCD", "isTitle":true});
	printStructure.push({"id":"CD1"});
	printStructure.push({"id":"CD2"});
	printStructure.push({"id":"CD3"});
	printStructure.push({"id":"CD4"});
	printStructure.push({"id":"CD6"});
	printStructure.push({"id":"CD"});
	printStructure.push({"id":"dCE", "isTitle":true});
	printStructure.push({"id":"CE1"});
	printStructure.push({"id":"CE2"});
	printStructure.push({"id":"CE3"});
	printStructure.push({"id":"CE4"});
	printStructure.push({"id":"CE7"});
	printStructure.push({"id":"CE"});
	printStructure.push({"id":"C"});

	printStructure.push({"id":"dR", "isTitle":true, "newpage":true});
	printStructure.push({"id":"dRA", "isTitle":true});
	printStructure.push({"id":"RA1"});
	printStructure.push({"id":"RA2"});
	printStructure.push({"id":"RA3"});
	printStructure.push({"id":"RA4"});
	printStructure.push({"id":"RA5"});
	printStructure.push({"id":"RA6"});
	printStructure.push({"id":"RA7"});
	printStructure.push({"id":"RA8"});
	printStructure.push({"id":"RA9"});
	printStructure.push({"id":"RA10"});
	printStructure.push({"id":"RA"});
	printStructure.push({"id":"dRB", "isTitle":true});
	printStructure.push({"id":"RB1"});
	printStructure.push({"id":"RB2"});
	printStructure.push({"id":"RB4"});
	printStructure.push({"id":"RB5"});
	printStructure.push({"id":"RB6"});
	printStructure.push({"id":"RB"});
	printStructure.push({"id":"dRC", "isTitle":true});
	printStructure.push({"id":"RC1"});
	printStructure.push({"id":"RC2"});
	printStructure.push({"id":"RC3"});
	printStructure.push({"id":"RC"});
	printStructure.push({"id":"dRD", "isTitle":true});
	printStructure.push({"id":"RD1"});
	printStructure.push({"id":"RD2"});
	printStructure.push({"id":"RD3"});
	printStructure.push({"id":"RD4"});
	printStructure.push({"id":"RD5"});
	printStructure.push({"id":"RD"});
	printStructure.push({"id":"dRE", "isTitle":true});
	printStructure.push({"id":"RE1"});
	printStructure.push({"id":"RE2"});
	printStructure.push({"id":"RE"});
	printStructure.push({"id":"R"});
	//printStructure.push({"id":"IM"});

	printStructure.push({"id":"dCF", "isTitle":true, "newpage":true});
	printStructure.push({"id":"CF1"});
	printStructure.push({"id":"CF2"});
	printStructure.push({"id":"CF3"});
	printStructure.push({"id":"CF4"});
	printStructure.push({"id":"CF"});
	printStructure.push({"id":"dRF", "isTitle":true});
	printStructure.push({"id":"RF1"});
	printStructure.push({"id":"RF2"});
	printStructure.push({"id":"RF3"});
	printStructure.push({"id":"RF4"});
	printStructure.push({"id":"RF"});
	//printStructure.push({"id":"IMRC"});

	printStructure.push({"id":"dACIV", "isTitle":true, "newpage":true});
	printStructure.push({"id":"ACIV"});
	printStructure.push({"id":"ACIV3"});
	printStructure.push({"id":"ACIV1"});

	printStructure.push({"id":"dCG", "isTitle":true, "newpage":true});
	printStructure.push({"id":"RC1"});
	printStructure.push({"id":"RC2"});
	printStructure.push({"id":"RC"});
	printStructure.push({"id":"dRG", "isTitle":true});
	printStructure.push({"id":"RG1"});
	printStructure.push({"id":"RG2"});
	printStructure.push({"id":"RG"});



	return printStructure;
}

function createReportStructureRendicontoCassa() {

	var reportStructure = [];
	
	/* CASSA E BANCA */
	reportStructure.push({"id":"dACIV", "description":"CASSA E BANCA"});
	reportStructure.push({"id":"ACIV1", "type":"group", "indent":"", "bclass":"1", "description":"Depositi bancari e postali"});	
	reportStructure.push({"id":"ACIV3", "type":"group", "indent":"", "bclass":"1", "description":"Cassa"});
	reportStructure.push({"id":"ACIV", "type":"total", "indent":"", "description":"Cassa e banca", "sum":"ACIV1;ACIV3"});
	
	/* USCITE */
	reportStructure.push({"id":"dC", "description":"USCITE"});
	reportStructure.push({"id":"dCA", "type":"title", "indent":"", "description":"A) Uscite da attività di interesse generale"});
	reportStructure.push({"id":"CA1", "type":"group", "indent":"", "bclass":"3", "description":"1) Materie prime, sussidiarie, di consumo e di merci"});
	reportStructure.push({"id":"CA2", "type":"group", "indent":"", "bclass":"3", "description":"2) Servizi"});
	reportStructure.push({"id":"CA3", "type":"group", "indent":"", "bclass":"3", "description":"3) Godimento beni di terzi"});
	reportStructure.push({"id":"CA4", "type":"group", "indent":"", "bclass":"3", "description":"4) Personale"});
	reportStructure.push({"id":"CA7", "type":"group", "indent":"", "bclass":"3", "description":"5) Uscite diverse di gestione"});
	reportStructure.push({"id":"CA5", "type":"group", "indent":"", "bclass":"3", "description":"A) Ammortamenti"}); //non usato nel rendiconto cassa
	reportStructure.push({"id":"CA5b", "type":"group", "indent":"", "bclass":"3", "description":"5 bis) svalutazioni delle immobilizzazioni materiali ed immateriali"}); //non usato nel rendiconto cassa
	reportStructure.push({"id":"CA6", "type":"group", "indent":"", "bclass":"3", "description":"A) Accantonamenti per rischi ed oneri"}); //non usato nel rendiconto cassa
	reportStructure.push({"id":"CA8", "type":"group", "indent":"", "bclass":"3", "description":"A) Rimanenze iniziali"}); //non usato nel rendiconto cassa
	reportStructure.push({"id":"CA9", "type":"group", "indent":"", "bclass":"3", "description":"9) Accantonamento a riserva vincolata per decisione degli organi istituzionali"}); //non usato nel rendiconto cassa
	reportStructure.push({"id":"CA10", "type":"group", "indent":"", "bclass":"3", "description":"10) Utilizzo riserva vincolata per decisione degli organi istituzionali"}); //non usato nel rendiconto cassa
	reportStructure.push({"id":"CA", "type":"total", "indent":"", "description":"Totale", "sum":"CA1;CA2;CA3;CA4;CA7"});
	reportStructure.push({"id":"dCB", "type":"title", "indent":"", "description":"B) Uscite da attività diverse"});
	reportStructure.push({"id":"CB1", "type":"group", "indent":"", "bclass":"3", "description":"1) Materie prime, sussidiarie, di consumo e di merci"});
	reportStructure.push({"id":"CB2", "type":"group", "indent":"", "bclass":"3", "description":"2) Servizi"});
	reportStructure.push({"id":"CB3", "type":"group", "indent":"", "bclass":"3", "description":"3) Godimento beni di terzi"});
	reportStructure.push({"id":"CB4", "type":"group", "indent":"", "bclass":"3", "description":"4) Personale"});
	reportStructure.push({"id":"CB7", "type":"group", "indent":"", "bclass":"3", "description":"5) Uscite diverse di gestione"});
	reportStructure.push({"id":"CB5", "type":"group", "indent":"", "bclass":"3", "description":"B) Ammortamenti"}); //non usato nel rendiconto cassa
	reportStructure.push({"id":"CB5b", "type":"group", "indent":"", "bclass":"3", "description":"5 bis) svalutazioni delle immobilizzazioni materiali ed immateriali"}); //non usato nel rendiconto cassa
	reportStructure.push({"id":"CB6", "type":"group", "indent":"", "bclass":"3", "description":"B) Accantonamenti per rischi ed oneri"}); //non usato nel rendiconto cassa
	reportStructure.push({"id":"CB8", "type":"group", "indent":"", "bclass":"3", "description":"B) Rimanenze iniziali"}); //non usato nel rendiconto cassa
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
	reportStructure.push({"id":"CD5", "type":"group", "indent":"", "bclass":"3", "description":"C) Accantonamenti per rischi ed oneri"}); //non usato nel rendiconto cassa
	reportStructure.push({"id":"CD", "type":"total", "indent":"", "description":"Totale", "sum":"CD1;CD2;CD3;CD4;CD6"});
	reportStructure.push({"id":"dCE", "type":"title", "indent":"", "description":"E) Uscite di supporto generale"});
	reportStructure.push({"id":"CE1", "type":"group", "indent":"", "bclass":"3", "description":"1) Materie prime, sussidiarie, di consumo e di merci"});
	reportStructure.push({"id":"CE2", "type":"group", "indent":"", "bclass":"3", "description":"2) Servizi"});
	reportStructure.push({"id":"CE3", "type":"group", "indent":"", "bclass":"3", "description":"3) Godimento beni di terzi"});
	reportStructure.push({"id":"CE4", "type":"group", "indent":"", "bclass":"3", "description":"4) Personale"});
	reportStructure.push({"id":"CE7", "type":"group", "indent":"", "bclass":"3", "description":"5) Altre uscite"});
	reportStructure.push({"id":"CE5", "type":"group", "indent":"", "bclass":"3", "description":"E) Ammortamenti"}); //non usato nel rendiconto cassa
	reportStructure.push({"id":"CE5b", "type":"group", "indent":"", "bclass":"3", "description":"5 bis) svalutazioni delle immobilizzazioni materiali ed immateriali"}); //non usato nel rendiconto cassa
	reportStructure.push({"id":"CE6", "type":"group", "indent":"", "bclass":"3", "description":"E) Accantonamenti per rischi ed oneri"}); //non usato nel rendiconto cassa
	reportStructure.push({"id":"CE8", "type":"group", "indent":"", "bclass":"3", "description":"8) Accantonamento a riserva vincolata per decisione degli organi istituzionali"}); //non usato nel rendiconto cassa
	reportStructure.push({"id":"CE9", "type":"group", "indent":"", "bclass":"3", "description":"9) Utilizzo riserva vincolata per decisione degli organi istituzionali"}); //non usato nel rendiconto cassa
	reportStructure.push({"id":"CE", "type":"total", "indent":"", "description":"Totale", "sum":"CE1;CE2;CE3;CE4;CE7"});
	reportStructure.push({"id":"C", "type":"total", "indent":"", "description":"Totale uscite della gestione", "sum":"CA;CB;CC;CD;CE"});

	/* ENTRATE */
	reportStructure.push({"id":"dR", "description":"ENTRATE"});
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
	reportStructure.push({"id":"RA11", "type":"group", "indent":"", "bclass":"4", "description":"A) Rimanenze finali"}); //non usato nel rendiconto cassa 
	reportStructure.push({"id":"RA", "type":"total", "indent":"", "description":"Totale", "sum":"RA1;RA2;RA3;RA4;RA5;RA6;RA7;RA8;RA9;RA10"});
	reportStructure.push({"id":"dRB", "type":"title", "indent":"", "description":"B) Entrate da attività diverse"});
	reportStructure.push({"id":"RB1", "type":"group", "indent":"", "bclass":"4", "description":"1) Entrate per prestazioni e cessioni ad associati e fondatori"});
	reportStructure.push({"id":"RB2", "type":"group", "indent":"", "bclass":"4", "description":"2) Contributi da soggetti privati"});
	reportStructure.push({"id":"RB3", "type":"group", "indent":"", "bclass":"4", "description":"3) Entrate per prestazioni e cessioni a terzi"});
	reportStructure.push({"id":"RB4", "type":"group", "indent":"", "bclass":"4", "description":"4) Contributi da enti pubblici"});
	reportStructure.push({"id":"RB5", "type":"group", "indent":"", "bclass":"4", "description":"5) Entrate da contratti con enti pubblici"});
	reportStructure.push({"id":"RB6", "type":"group", "indent":"", "bclass":"4", "description":"6) Altre entrate"});
	reportStructure.push({"id":"RB7", "type":"group", "indent":"", "bclass":"4", "description":"B) Rimanenze finali"}); //non usato nel rendiconto cassa 
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
	reportStructure.push({"id":"dCF", "description":"Uscite da investimenti in immobilizzazioni o da deflussi di capitale di terzi"});
	reportStructure.push({"id":"CF1", "type":"group", "indent":"", "bclass":"3", "description":"1) Investimenti in immobilizzazioni inerenti alle attività di interesse generale"});
	reportStructure.push({"id":"CF2", "type":"group", "indent":"", "bclass":"3", "description":"2) Investimenti in immobilizzazioni inerenti alle attività diverse"});
	reportStructure.push({"id":"CF3", "type":"group", "indent":"", "bclass":"3", "description":"3) Investimenti in attività finanziarie e patrimoniali"});
	reportStructure.push({"id":"CF4", "type":"group", "indent":"", "bclass":"3", "description":"4) Rimborso di finanziamenti per quota capitale e di prestiti"});
	reportStructure.push({"id":"CF", "type":"total", "indent":"", "description":"Totale", "sum":"CF1;CF2;CF3;CF4"});
	reportStructure.push({"id":"IMRC", "type":"group", "indent":"", "bclass":"3", "description":"Imposte"});

	/* ENTRATE DA DISINVESTIMENTI */
	reportStructure.push({"id":"dRF", "description":"Entrate da disinvestimenti in immobilizzazioni o da flussi di capitale di terzi"});
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
	reportStructure.push({"id":"dCG", "description":"Costi figurativi"});
	reportStructure.push({"id":"CG1", "type":"group", "indent":"", "bclass":"3", "description":"1) da attività di interesse generale"});
	reportStructure.push({"id":"CG2", "type":"group", "indent":"", "bclass":"3", "description":"2) da attività diverse"});
	reportStructure.push({"id":"CG", "type":"total", "indent":"", "description":"Totale", "sum":"CG1;CG2"});
	reportStructure.push({"id":"dRG", "description":"Proventi figurativi"});
	reportStructure.push({"id":"RG1", "type":"group", "indent":"", "bclass":"4", "description":"1) da attività di interesse generale"});
	reportStructure.push({"id":"RG2", "type":"group", "indent":"", "bclass":"4", "description":"2) da attività diverse"});
	reportStructure.push({"id":"RG", "type":"total", "indent":"", "description":"Totale", "sum":"RG1;RG2"});
	reportStructure.push({"id":"RG-CG", "type":"total", "indent":"", "description":"Totale", "sum":"RG;-CG"}); //not used

	return reportStructure;
}

//=======
// 5x1000
//=======
function createReportStructure5xMille(userParam) {
	
	/**	
	 *  Gruppi modello vecchio:
	 * 
	 *	gruppo 0, Entrate da 5xmille		: RA5
	 *	gruppo 1, Risorse umane				: CA4, CB4, CE4
	 *	gruppo 2, Costi di funzionamento   	: CA1, CA3, CA7, CA8, CD1, CD2, CD3, CD4, CD6, IM, CG1
	 *	gruppo 3, Acquisto beni e servizi  	: CA2, CA5, CB2, CB3, CB5, CE2, CE3, CE5, CC1, CC2, CC3
	 *	gruppo 4, Erogazioni 			   	: CB1
	 *	gruppo 5, Altre voci di spesa 	   	: CB7, CB8, CE1, CE7, CG2
	 *	gruppo 6, Accantonamento           	: CA6, CB6, CD5, CE6
	 */

    /**
     * Gruppi modello nuovo:
     *
     * gruppo 0    : RA5
     * gruppo 1    : CA4;CB4;CE4
     * gruppo 2    : CA1;CA3;CA7;CD1;CD2;CD3;CD4;CD6;IM
     * gruppo 3    : CA2;CA5;CB3;CB5;CE3;CE5;CC1;CC2;CC3
     * gruppo 4.1  : CB1;CE1
     * gruppo 4.2  : CB2
     * gruppo 4.3  : CE2
     * gruppo 4.4  : CB7
     * gruppo 4.5  : CE7;CG1;CG2
     * gruppo 5    : CA6;CB6;CD5;CE6
     */
	
	let reportStructure = [];
	reportStructure.push({"group":"0", "income":true, "gr1":"RA5", "title":"Importo percepito", "text":""});
	reportStructure.push({"group":"1", "income":false, "gr1":"CA4;CB4;CE4", "title":"Risorse umane", "text":"(rappresentare le spese nella relazione illustrativa a seconda della causale, per esempio: compensi per personale; rimborsi spesa a favore di volontari e/o del personale)."});
	reportStructure.push({"group":"2", "income":false, "gr1":"CA1;CA3;CA7;CD1;CD2;CD3;CD4;CD6;IM", "title":"Spese di funzionamento", "text":"(rappresentare le spese nella relazione illustrativa a seconda della causale, per esempio: spese di acqua, gas, elettricità, pulizia; materiale di cancelleria; spese per affitto delle sedi; ecc.)"});
	reportStructure.push({"group":"3", "income":false, "gr1":"CA2;CA5;CB3;CB5;CE3;CE5;CC1;CC2;CC3", "title":"Spese per acquisto beni e servizi", "text":"(rappresentare le spese nella relazione illustrativa a seconda della causale, per esempio: acquisto e/o noleggio apparecchiature informatiche; acquisto beni immobili; prestazioni eseguite da soggetti esterni all’ente; affitto locali per eventi; ecc.)"});
    reportStructure.push({"group":"4", "income":false, "gr1":"", "title":"Spese per attività di interesse generale dell’ente", "text":"(rappresentare le spese nella relazione illustrativa a seconda della causale)"});
    reportStructure.push({"group":"4.1", "income":false, "gr1": userParam.gruppo41, "title":"Acquisto di beni o servizi strumentali oggetto di donazione", "text":""});
    reportStructure.push({"group":"4.2", "income":false, "gr1": userParam.gruppo42, "title":"Erogazioni a proprie articolazioni territoriali e a soggetti collegati o affiliati", "text":""});
    reportStructure.push({"group":"4.3", "income":false, "gr1": userParam.gruppo43, "title":"Erogazioni ad enti terzi", "text":""});
    reportStructure.push({"group":"4.4", "income":false, "gr1": userParam.gruppo44, "title":"Erogazioni a persone fisiche", "text":""});
    reportStructure.push({"group":"4.5", "income":false, "gr1": userParam.gruppo45, "title":"Altre spese per attività di interesse generale", "text":""});
    reportStructure.push({"group":"5", "income":false, "gr1":"CA6;CB6;CD5;CE6", "title":"Accantonamento", "text":"(è possibile accantonare in tutto o in parte l’importo percepito, fermo restando per il soggetto beneficiario l’obbligo di specificare nella relazione allegata al presente documento le finalità dell’accantonamento. Il soggetto beneficiario è tenuto ad utilizzare le somme accantonate e ad inviare il modello relativo all’accantonamento entro 36 mesi dalla percezione del contributo)"});

	return reportStructure;
}

