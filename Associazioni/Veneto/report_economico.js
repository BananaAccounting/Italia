// Copyright [2015] [Banana.ch SA - Lugano Switzerland]
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
//
// @id = it.banana.app.report_economico_veneto
// @api = 1.0
// @pubdate = 2015-11-11
// @publisher = Banana.ch SA
// @description = Italia - Report economico
// @task = app.command
// @doctype = 100.100
// @docproperties = veneto
// @outputformat = none
// @inputdatasource = none
// @timeout = -1



//Global variables
var param = {};
var	form = [];

//Create the param object with some parameters
function loadParam() {
	var openingDate = Banana.Converter.toDate(Banana.document.info("AccountingDataBase","OpeningDate"))
	var year = "";
	if (openingDate) {
		openingDate.getFullYear();
	}
	param = {
		"reportName":"Report economico - Veneto",										// Save the report's name
		"headerLeft" : Banana.document.info("Base","HeaderLeft"),						// Get the info from File->File properties->Header left
		"headerRight" : Banana.document.info("Base","HeaderRight"),						// Get the info from File->File properties->Header right
		"startDate" : Banana.document.info("AccountingDataBase","OpeningDate"),			// Get the start date of the accounting period
		"endDate" : Banana.document.info("AccountingDataBase","ClosureDate"),			// Get the end date of the accounting period
		"year" : year,																	// Get the year from the accounting period
		"basicCurrency" : Banana.document.info("AccountingDataBase","BasicCurrency"),	// Get the basic currency of the accounting
		"grColumn" : "Gr1",																// Specify the column ("Gr1" or "Gr2")
		"formatNumber" : true,															// Specify if convert all the values into the local format
		"rounding" : 2																	// Specify the rounding of the sums
	};
}


//The purpose of this function is to create and load the structure that will contains all the data used to create the report
function loadForm() {

	/** CONTO ECONOMICO **/
	//INCOME
	form.push({"id":"Rt", "description":"RICAVI"});
	form.push({"id":"R1", "gr":"R1", "bClass":"4", "description":"QUOTE ASSOCIATIVE"});
	form.push({"id":"R2", "description":"CONTRIBUTI PER PROGETTI E/O ATTIVITÀ (art. 5 L. 266/91)", "sum":"R2.1;R2.2;R2.3;R2.4;R2.5;R2.6;R2.7;R2.8"});
	form.push({"id":"R2.1", "gr":"R2.1", "bClass":"4", "description":"da soci (specificare a quale titolo)"});
	form.push({"id":"R2.2", "gr":"R2.2", "bClass":"4", "description":"da non soci (specificare a quale titolo)"});
	form.push({"id":"R2.3", "gr":"R2.3", "bClass":"4", "description":"da CSV e Comitato di Gestione"});
	form.push({"id":"R2.4", "gr":"R2.4", "bClass":"4", "description":"da enti pubblici (comune, provincia, regione, stato)"});
	form.push({"id":"R2.5", "gr":"R2.5", "bClass":"4", "description":"da Comunità europea e da altri organismi internazionali"});
	form.push({"id":"R2.6", "gr":"R2.6", "bClass":"4", "description":"da altre Odv (specificare a quale titolo)"});
	form.push({"id":"R2.7", "gr":"R2.7", "bClass":"4", "description":"dal cinque per mille"});
	form.push({"id":"R2.8", "gr":"R2.8", "bClass":"4", "description":"altro (specificare)"});
	form.push({"id":"R3", "description":"DONAZIONI DEDUCIBILI E LASCITI TESTAMENTARI - art. 5 L.266/91", "sum":"R3.1;R3.2"});
	form.push({"id":"R3.1", "gr":"R3.1", "bClass":"4", "description":"da soci"});
	form.push({"id":"R3.2", "gr":"R3.2", "bClass":"4", "description":"da non soci"});
	form.push({"id":"R4", "gr":"R4", "bClass":"4", "description":"RIMBORSI DERIVANTI DA CONVENZIONI CON ENTI PUBBLICI - art. 5 L.266/91"});
	
	//We don't include "R5a" group if we are on the APS file
	if (Banana.document.table("TestiReport").findRowByValue("RowId", "RVENETO").value("Testo") !== "APS") {
		form.push({"id":"R5a", "description":"ENTRATE DA ATTIVITÀ COMMERCIALI PRODUTTIVE MARGINALI   (Raccolta fondi)", "sum":"R5.1;R5.2;R5.3"});
		form.push({"id":"R5.1", "gr":"R5.1", "bClass":"4", "description":"da attività di vendite occasionali o iniziative occasionali di solidarietà (D.M. 1995 lett.a) es.eventi, cassettina offerte, tombole, spettacoli"});
		form.push({"id":"R5.2", "gr":"R5.2", "bClass":"4", "description":"da attività di vendita di beni acquisiti da terzi a titolo gratuito a fini di sovvenzione  (D.M. 1995 lett.b)"});
		form.push({"id":"R5.3", "gr":"R5.3", "bClass":"4", "description":"da attività di somministrazione di alimenti e bevande in occasione di manifestazioni e simili a carattere occasionale  (D.M. 1995 lett.d)"});
	}

	form.push({"id":"R5b", "description":" ALTRE ENTRATE DA ATTIVITÀ COMMERCIALI MARGINALI", "sum":"R5.4;R5.5"});
	form.push({"id":"R5.4", "gr":"R5.4", "bClass":"4", "description":"cessione di beni prodotti dagli assistiti e dai volontari sempreché la vendita dei prodotti sia curata direttamente dall'organizzazione senza alcun intermediario (D.M. 1995 lett.c)"});
	form.push({"id":"R5.5", "gr":"R5.5", "bClass":"4", "description":"attività di prestazione di servizi rese in conformità alle finalità istituzionali, non riconducibili nell'ambito applicativo dell'art. 111, comma 3, del TUIR  verso pagamento di corrispettivi specifici che non eccedano del 50% i costi di diretta imputazione (D.M. 1995 lett. e)"});
	form.push({"id":"R6", "description":"ALTRE ENTRATE (comunque ammesse dalla L.266/91)", "sum":"R6.1;R6.2;R6.3"});
	form.push({"id":"R6.1", "gr":"R6.1", "bClass":"4", "description":"rendite patrimoniali (fitti,….)"});
	form.push({"id":"R6.2", "gr":"R6.2", "bClass":"4", "description":"rendite finanziarie (interessi, dividendi)"});
	form.push({"id":"R6.3", "gr":"R6.3", "bClass":"4", "description":"altro: specificare "});
	form.push({"id":"R7", "gr":"R7", "bClass":"4", "description":"ANTICIPAZIONI DI CASSA"});
	form.push({"id":"R8", "gr":"R8", "bClass":"4", "description":"PARTITE DI GIRO"});

	//We don't include "R5a" in the total group if we are on the APS file
	if (Banana.document.table("TestiReport").findRowByValue("RowId", "RVENETO").value("Testo") !== "APS") {
		form.push({"id":"R", "description":"TOTALE RICAVI", "sum":"R1;R2;R3;R4;R5a;R5b;R6;R7;R8"});
	} else {
		form.push({"id":"R", "description":"TOTALE RICAVI", "sum":"R1;R2;R3;R4;R5b;R6;R7;R8"});
	}

	//EXPENSES
	form.push({"id":"Ct", "description":"COSTI"});
	form.push({"id":"C1", "gr":"C1", "bClass":"3", "description":"RIMBORSI SPESE AI VOLONTARI  (documentate ed effettivamente sostenute)"});
	form.push({"id":"C2", "description":"ASSICURAZIONI", "sum":"C2.1;C2.2"});
	form.push({"id":"C2.1", "gr":"C2.1", "bClass":"3", "description":"volontari (malattie, infortuni e resp. civile terzi) - art. 4 L.266/91"});
	form.push({"id":"C2.2", "gr":"C2.2", "bClass":"3", "description":"altre: es. veicoli, immobili,…."});
	form.push({"id":"C3", "description":"PERSONALE OCCORRENTE  A QUALIFICARE E SPECIALIZZARE L’ATTIVITÀ (art. 3 L. 266/91 e art. 3 L.R. 40/1993)", "sum":"C3.1;C3.2;C3.3"});
	form.push({"id":"C3.1", "gr":"C3.1", "bClass":"3", "description":"dipendenti "});
	form.push({"id":"C3.2", "gr":"C3.2", "bClass":"3", "description":"atipici e occasionali"});
	form.push({"id":"C3.3", "gr":"C3.3", "bClass":"3", "description":"consulenti (es. fisioterapista)"});
	form.push({"id":"C4", "gr":"C4", "bClass":"3", "description":"ACQUISTI DI SERVIZI  (es. manutenzione, trasporti, service, consulenza fiscale e del lavoro)"});
	form.push({"id":"C5", "gr":"C5", "bClass":"3", "description":"UTENZE (telefono, luce, riscaldamento,…)"});
	form.push({"id":"C6", "description":"MATERIALI DI CONSUMO (cancelleria, postali, materie prime, generi alimentari)", "sum":"C6.1;C6.2;C6.3"});
	form.push({"id":"C6.1", "gr":"C6.1", "bClass":"3", "description":"per struttura odv"});
	form.push({"id":"C6.2", "gr":"C6.2", "bClass":"3", "description":"per attività"});
	form.push({"id":"C6.3", "gr":"C6.3", "bClass":"3", "description":"per soggetti svantaggiati"});
	form.push({"id":"C7", "gr":"C7", "bClass":"3", "description":"GODIMENTO BENI DI TERZI (affitti, noleggio attrezzature, diritti Siae,....)"});
	form.push({"id":"C8", "gr":"C8", "bClass":"3", "description":"ONERI FINANZIARI E PATRIMONIALI (es. interessi passivi su mutui, prestiti, c/c bancario ..)"});
	form.push({"id":"C9", "gr":"C9", "bClass":"3", "description":"AMMORTAMENTI"});
	form.push({"id":"C10", "gr":"C10", "bClass":"3", "description":"IMPOSTE E TASSE"});
	form.push({"id":"C11", "gr":"C11", "bClass":"3", "description":"RACCOLTE FONDI (vedi allegati Nr. delle singole raccolte fondi di cui ai punti 5.1, 5.2 e 5.3 delle entrate)"});
	form.push({"id":"C12", "description":"ALTRE USCITE/COSTI", "sum":"C12.1;C12.2;C12.3;C12.4"});
	form.push({"id":"C12.1", "gr":"C12.1", "bClass":"3", "description":"Contributi a soggetti svantaggiati"});
	form.push({"id":"C12.2", "gr":"C12.2", "bClass":"3", "description":"Quote associative a odv collegate  (specificare)"});
	form.push({"id":"C12.3", "gr":"C12.3", "bClass":"3", "description":"versate ad altre odv (specificare)"});
	form.push({"id":"C12.4", "gr":"C12.4", "bClass":"3", "description":"Altro (specificare)"});
	form.push({"id":"C13", "gr":"C13", "bClass":"3", "description":"PARTITE DI GIRO"});
	form.push({"id":"C", "description":"TOTALE COSTI", "sum":"C1;C2;C3;C4;C5;C6;C7;C8;C9;C10;C11;C12;C13"});

	//RISULTATO D'ESERCIZIO
	form.push({"id":"UP", "description":"UTILE/PERDITA D'ESERCIZIO", "sum":"R;-C"});
	

	/** STATO PATRIMONIALE **/
	//ATTIVI
	form.push({"id":"A1", "gr":"A1", "bClass":"1", "description":"BENI DUREVOLI"});
	form.push({"id":"A2.1", "gr":"A2.1", "bClass":"1", "description":"CASSA"});
	form.push({"id":"A2.2", "gr":"A2.2", "bClass":"1", "description":"BANCA"});
	form.push({"id":"A2.3", "gr":"A2.3", "bClass":"1", "description":"TITOLI"});
	form.push({"id":"A3", "gr":"A3", "bClass":"1", "description":"CREDITI"});
	form.push({"id":"APG", "description":"PERDITA DI GESTIONE"});
	form.push({"id":"ATP", "description":"TOTALE A PAREGGIO", "sum":"A1;A2.1;A2.2;A3;APG"});

	//PASSIVI
	form.push({"id":"P1", "gr":"P1", "bClass":"2", "description":"DEBITI"});
	form.push({"id":"P2.1", "gr":"P2.1", "bClass":"2", "description":"FONDI DI AMMORTAMENTO BENI E ATTREZZATURE"});
	form.push({"id":"P2.2", "gr":"P2.2", "bClass":"2", "description":"FONDI DI ACCANTONAMENTO"});
	form.push({"id":"P3", "gr":"P3", "bClass":"2", "description":"NETTO"});
	form.push({"id":"PAG", "description":"AVANZO DI GESTIONE"});
	form.push({"id":"PTP", "description":"TOTALE A PAREGGIO", "sum":"P1;P2.1;P2.2;P3;PAG"});

}



//Main function
function exec(string) {
	
	//Check if we are on an opened document
	if (!Banana.document) {
		return;
	}

	// 1. Create and load the parameters and the form
	loadParam();
	loadForm();

	// 2. Extract the data, calculate and load the balances
	loadBalances();
	preProcess();

	// 3. Calculate the totals
	calcTotals(["amount"]);

	// 4. Do some operations before the format
	//postProcess();
	
	// 5. Format all the values
	formatValues(["amount"]);

	// 6. Create and print the report
	printReport();

}



//The purpose of this function is to do some operations before the calculation of the totals
function preProcess() {

	//var balanceUP =  Banana.document.currentBalance("Gr=UP-BIL", param.startDate, param.endDate).balance;
	var balanceUP = "";
	var table = Banana.document.table("Totals");
	for (var i = 0; i < table.rowCount; i++) {
		var tRow = table.row(i);
		if (tRow.value("Group") === "02") {
			balanceUP = tRow.value("Balance");
		}
	}

	for (var i = 0; i < form.length; i++) {

		//Attivo - Perdita di gestione (+)
		if (Banana.SDecimal.sign(balanceUP) > 0) {
			if (form[i]["id"] === "APG") {
				form[i]["amount"] = balanceUP;
		    	getObject(form,"PAG").amount = "";
			}
		}
		//Passivo - Avanzo di gestione (-)
		else if (Banana.SDecimal.sign(balanceUP) < 0) {
			if (form[i]["id"] === "PAG") {
				form[i]["amount"] = Banana.SDecimal.invert(balanceUP);
				getObject(form,"APG").amount = "";
			}
		}
	}
}


//The purpose of this function is to do some operations before the values are converted
function postProcess() {
	
}



//The purpose of this function is to create and print the report
function printReport() {

	var report = Banana.Report.newReport(param.reportName);

	/** TABLE CONTO ECONOMICO **/
	report.addParagraph(param.headerLeft + " - " + "BILANCIO ECONOMICO (Modello 2) ANNO 2015", "heading2");
		
	var table = report.addTable("table");
	tableRow = table.addRow();
	tableRow.addCell("Id/Gr1", "styleTableHeader", 1);
	tableRow.addCell("Id/Gr1", "styleTableHeader", 1);
	tableRow.addCell("Descrizione gruppo/conto", "styleTableHeader", 1);
    tableRow.addCell("                                                              ", "styleTableHeader", 1);
	tableRow.addCell("                                                              ", "styleTableHeader", 1);	
	tableRow.addCell("Importi parziali", "styleTableHeader", 1);
	tableRow.addCell("Importi totali", "styleTableHeader", 1);

	for (var k = 0; k < form.length; k++) {

		if (form[k]["id"].substring(0,1) === "R" || form[k]["id"].substring(0,1) === "C" || form[k]["id"].substring(0,2) === "UP") {

			//Titles
			if (form[k]["id"] === "Rt" || form[k]["id"] === "Ct") {
				tableRow = table.addRow();
				tableRow.addCell(form[k]["description"], "styleTitleCell", 7);
			}
			//Totals
			else if (form[k]["id"] === "R" || form[k]["id"] === "C" || form[k]["id"] === "UP") {
				tableRow = table.addRow();
				tableRow.addCell(form[k]["id"], "valueTotal", 1);
				tableRow.addCell(form[k]["description"], "valueTotal", 4);
				tableRow.addCell(" ", "valueTotal", 1);
				tableRow.addCell(getBalance(form[k].id), "alignRight bold valueTotal", 1);
			}
			//Details
			else {
				if (form[k].id.indexOf(".") > 0) {
					tableRow = table.addRow();
					tableRow.addCell(" ", "", 1);
					tableRow.addCell(form[k]["id"], "", 1);
					tableRow.addCell(form[k]["description"], "", 3);
					tableRow.addCell(getBalance(form[k].id), "alignRight", 1);
					tableRow.addCell(" ", "", 1);
				} else {
					tableRow = table.addRow();
					tableRow.addCell(form[k]["id"], "bold italic", 1);
					//tableRow.addCell(form[k]["description"], "bold italic", 1);
					//tableRow.addCell(" ", "", 2);
					tableRow.addCell(form[k]["description"], "bold italic", 4);
					tableRow.addCell(" ", "", 1);
					tableRow.addCell(getBalance(form[k].id), "alignRight bold italic", 1);
				}
			}
		}
	}

	report.addPageBreak();

	/** TABLE STATO PATRIMONIALE **/
	report.addParagraph(param.headerLeft + " - STATO PATRIMONIALE", "heading2");

	var table = report.addTable("table");
	
	tableRow = table.addRow();
	tableRow.addCell("Id/Gr1", "styleTableHeader", 1);
	//tableRow.addCell("Gr1", "styleTableHeader", 1)
	tableRow.addCell("Descrizione", "styleTableHeader", 1);
	tableRow.addCell("Importi totali", "styleTableHeader", 1);

	tableRow = table.addRow();
	tableRow.addCell("ATTIVO", "bold styleTitleCell", 3);

	tableRow = table.addRow();
	tableRow.addCell(getValue(form, "A1", "id"), "", 1);
	//tableRow.addCell(getValue(form, "A1", "gr"), "", 1);
	tableRow.addCell(getValue(form, "A1", "description"), "", 1);
	tableRow.addCell(getBalance("A1"), "alignRight", 1);

	tableRow = table.addRow();
	tableRow.addCell(getValue(form, "A2.1", "id"), "", 1);
	//tableRow.addCell(getValue(form, "A2.1", "gr"), "", 1);
	tableRow.addCell(getValue(form, "A2.1", "description"), "", 1);
	tableRow.addCell(getBalance("A2.1"), "alignRight", 1);

	tableRow = table.addRow();
	tableRow.addCell(getValue(form, "A2.2", "id"), "", 1);
	//tableRow.addCell(getValue(form, "A2.2", "gr"), "", 1);
	tableRow.addCell(getValue(form, "A2.2", "description"), "", 1);
	tableRow.addCell(getBalance("A2.2"), "alignRight", 1);

	tableRow = table.addRow();
	tableRow.addCell(getValue(form, "A2.3", "id"), "", 1);
	//tableRow.addCell(getValue(form, "A2.3", "gr"), "", 1);
	tableRow.addCell(getValue(form, "A2.3", "description"), "", 1);
	tableRow.addCell(getBalance("A2.3"), "alignRight", 1);

	tableRow = table.addRow();
	tableRow.addCell(getValue(form, "A3", "id"), "", 1);
	//tableRow.addCell(getValue(form, "A3", "gr"), "", 1);
	tableRow.addCell(getValue(form, "A3", "description"), "", 1);
	tableRow.addCell(getBalance("A3"), "alignRight", 1);

	tableRow = table.addRow();
	tableRow.addCell(getValue(form, "APG", "id"), "", 1);
	//tableRow.addCell(getValue(form, "APG", "gr"), "", 1);
	tableRow.addCell(getValue(form, "APG", "description"), "", 1);
	tableRow.addCell(getBalance("APG"), "alignRight", 1);

	tableRow = table.addRow();
	tableRow.addCell(getValue(form, "ATP", "id"), "bold valueTotal", 1);
	//tableRow.addCell(getValue(form, "ATP", "gr"), "", 1);
	tableRow.addCell(getValue(form, "ATP", "description"), "bold valueTotal", 1);
	tableRow.addCell(getBalance("ATP"), "alignRight bold valueTotal", 1);

	tableRow = table.addRow();
	tableRow.addCell("PASSIVO", "bold styleTitleCell", 3);

	tableRow = table.addRow();
	tableRow.addCell(getValue(form, "P1", "id"), "", 1);
	//tableRow.addCell(getValue(form, "P1", "gr"), "", 1);
	tableRow.addCell(getValue(form, "P1", "description"), "", 1);
	tableRow.addCell(getBalance("P1"), "alignRight", 1);

	tableRow = table.addRow();	
	tableRow.addCell(getValue(form, "P2.1", "id"), "", 1);
	//tableRow.addCell(getValue(form, "P2.1", "gr"), "", 1);
	tableRow.addCell(getValue(form, "P2.1", "description"), "", 1);
	tableRow.addCell(getBalance("P2.1"), "alignRight", 1);

	tableRow = table.addRow();
	tableRow.addCell(getValue(form, "P2.2", "id"), "", 1);
	//tableRow.addCell(getValue(form, "P2.2", "gr"), "", 1);
	tableRow.addCell(getValue(form, "P2.2", "description"), "", 1);
	tableRow.addCell(getBalance("P2.2"), "alignRight", 1);

	tableRow = table.addRow();
	tableRow.addCell(getValue(form, "P3", "id"), "", 1);
	//tableRow.addCell(getValue(form, "P3", "gr"), "", 1);
	tableRow.addCell(getValue(form, "P3", "description"), "", 1);
	tableRow.addCell(getBalance("P3"), "alignRight", 1);

	tableRow = table.addRow();
	tableRow.addCell(getValue(form, "PAG", "id"), "", 1);
	//tableRow.addCell(getValue(form, "PAG", "gr"), "", 1);
	tableRow.addCell(getValue(form, "PAG", "description"), "", 1);
	tableRow.addCell(getBalance("PAG"), "alignRight", 1);

	tableRow = table.addRow();
	tableRow.addCell(getValue(form, "PTP", "id"), "bold valueTotal", 1);
	//tableRow.addCell(getValue(form, "PTP", "gr"), "", 1);
	tableRow.addCell(getValue(form, "PTP", "description"), "bold valueTotal", 1);
	tableRow.addCell(getBalance("PTP"), "alignRight bold valueTotal", 1);


	//Add a footer to the report
	addHeader(report);
	addFooter(report);

	//Print the report
	var stylesheet = createStyleSheet();
	Banana.Report.preview(report, stylesheet);
}


//The purpose of this function is to load all the balances and save the values into the form
function loadBalances() {

	for (var i in form) {

		//Check if there are "vatClass" properties, then load VAT balances
		if (form[i]["vatClass"]) {
			if (form[i]["gr"]) {
				form[i]["amount"] = calculateVatGr1Balance(form[i]["gr"], form[i]["vatClass"], param["grColumn"], param["startDate"], param["endDate"]);
			}
		}

		//Check if there are "bClass" properties, then load balances
		if (form[i]["bClass"]) {
			if (form[i]["gr"]) {
				form[i]["amount"] = calculateAccountGr1Balance(form[i]["gr"], form[i]["bClass"], param["grColumn"], param["startDate"], param["endDate"]);
			}
		}
	}
}


//The purpose of this function is to calculate all the balances of the accounts belonging to the same group (grText)
function calculateAccountGr1Balance(grText, bClass, grColumn, startDate, endDate) {
	
	var accounts = getColumnListForGr(Banana.document.table("Accounts"), grText, "Account", grColumn);
	accounts = accounts.join("|");
	
	//Sum the amounts of opening, debit, credit, total and balance for all transactions for this accounts
	var currentBal = Banana.document.currentBalance(accounts, startDate, endDate);
	
	//The "bClass" decides which value to use
	if (bClass === "0") {
		return currentBal.amount;
	}
	else if (bClass === "1") {
		return currentBal.balance;
	}
	else if (bClass === "2") {
		return Banana.SDecimal.invert(currentBal.balance);
	}
	else if (bClass === "3") {
		return currentBal.total;
	}
	else if (bClass === "4") {
		return Banana.SDecimal.invert(currentBal.total);
	}
}


//The main purpose of this function is to create an array with all the values of a given column of the table (codeColumn) belonging to the same group (grText)
function getColumnListForGr(table, grText, codeColumn, grColumn) {

	if (table === undefined || !table) {
		return str;
	}

	if (!grColumn) {
		grColumn = "Gr1";
	}

	var str = [];

	//Loop to take the values of each rows of the table
	for (var i = 0; i < table.rowCount; i++) {
		var tRow = table.row(i);
		var grRow = tRow.value(grColumn);

		//If Gr1 column contains other characters (in this case ";") we know there are more values
		//We have to split them and take all values separately
		//If there are only alphanumeric characters in Gr1 column we know there is only one value
		var codeString = grRow;
		var arrCodeString = codeString.split(";");
		for (var j = 0; j < arrCodeString.length; j++) {
			var codeString1 = arrCodeString[j];
			if (codeString1 === grText) {
				str.push(tRow.value(codeColumn));
			}
		}
	}

	//Removing duplicates
	for (var i = 0; i < str.length; i++) {
		for (var x = i+1; x < str.length; x++) {
			if (str[x] === str[i]) {
				str.splice(x,1);
				--x;
			}
		}
	}

	//Return the array
	return str;
}


//The purpose of this function is to return a specific whole object
function getObject(form, id) {
	for (var i = 0; i < form.length; i++) {
		if (form[i]["id"] === id) {
			return form[i];
		}
	}
	Banana.document.addMessage("Couldn't find object with id: " + id);
}


//The purpose of this function is to get a specific value from the object
function getValue(source, id, field) {
	var searchId = id.trim();
	for (var i = 0; i < source.length; i++) {
		if (source[i].id === searchId) {
			return source[i][field];
		}
	}
	Banana.document.addMessage("Couldn't find object with id: " + id);
}


//The purpose of this function is to get the Description from an object
function getDescription(id) {
	var searchId = id.trim();
	for (var i = 0; i < form.length; i++) {
		if (form[i]["id"] === searchId) {
			return form[i]["description"];
		}
	}
	Banana.document.addMessage("Couldn't find object with id: " + id);
}


//The purpose of this function is to get the Balance from an object
function getBalance(id) {
	var searchId = id.trim();
	for (var i = 0; i < form.length; i++) {
		if (form[i]["id"] === searchId) {
			return form[i]["amount"];
		}
	}
	Banana.document.addMessage("Couldn't find object with id: " + id);
}


//The purpose of this function is to convert all the values from the given list to local format
function formatValues(fields) {
	if (param["formatNumber"] === true) {
		for (i = 0; i < form.length; i++) {
			var valueObj = getObject(form, form[i].id);

			for (var j = 0; j < fields.length; j++) {
				valueObj[fields[j]] = Banana.Converter.toLocaleNumberFormat(valueObj[fields[j]]);
			}
		}
	}
}


//The purpose of this function is to calculate all totals of the form with one call of the function only
function calcTotals(fields) {
	for (var i = 0; i < form.length; i++) {
		calcTotal(form[i].id, fields);
	}
}


//Calculate a single total of the form
function calcTotal(id, fields) {
	
	var valueObj = getObject(form, id);
	
	if (valueObj[fields[0]]) { //first field is present
		return; //calc already done, return
	}
	
	if (valueObj.sum) {
		var sumElements = valueObj.sum.split(";");	
		
		for (var k = 0; k < sumElements.length; k++) {
			var entry = sumElements[k].trim();
			if (entry.length <= 0) {
				return true;
			}
			
			var isNegative = false;
			if (entry.indexOf("-") >= 0) {
				isNegative = true;
				entry = entry.substring(1);
			}
			
			//Calulate recursively
			calcTotal(entry, fields);  
			
		    for (var j = 0; j < fields.length; j++) {
				var fieldName = fields[j];
				var fieldValue = getValue(form, entry, fieldName);
				if (fieldValue) {
					if (isNegative) {
						//Invert sign
						fieldValue = Banana.SDecimal.invert(fieldValue);
					}
					valueObj[fieldName] = Banana.SDecimal.add(valueObj[fieldName], fieldValue, {'decimals' : param.rounding});
				}
			}
		}
	} else if (valueObj.gr) {
		//Already calculated in loadBalances()
	}
}


//This function adds a Footer to the report
function addFooter(report) {
   report.getFooter().addClass("footer");
   var versionLine = report.getFooter().addText("Banana Accounting - ", "description");
   report.getFooter().addText("Pagina ", "description");
   report.getFooter().addFieldPageNr();
}


function addHeader(report) {
	var pageHeader = report.getHeader();
	pageHeader.addClass("header");
	pageHeader.addImage("logo_regione_vento.png", " img");
	pageHeader.addParagraph("                  giunta regionale – 8^ legislatura", "header2");
	pageHeader.addParagraph(" ");
	pageHeader.addParagraph("ALLEGATO _A_ Dgr n.    4314  del   29/12/2009          pag.", "header1 bold").addFieldPageNr();
	pageHeader.addParagraph(" ", "horizontalLine");
	pageHeader.addParagraph(" ");
	pageHeader.addParagraph(" ");
}


//The main purpose of this function is to create styles for the report print
function createStyleSheet() {
	var stylesheet = Banana.Report.newStyleSheet();

    var pageStyle = stylesheet.addStyle("@page");
    pageStyle.setAttribute("margin", "5mm 10mm 5mm 10mm");

    stylesheet.addStyle("body", "font-family : Helvetica");

	var style = stylesheet.addStyle(".description");
	style.setAttribute("padding-bottom", "5px");
	style.setAttribute("padding-top", "5px");
	style.setAttribute("font-size", "8px");
	
	// style = stylesheet.addStyle(".description1");
	// style.setAttribute("font-size", "7px");
	// style.setAttribute("text-align", "center");

	// style = stylesheet.addStyle(".descriptionBold");
	// style.setAttribute("font-size", "8px");
	// style.setAttribute("font-weight", "bold");

	style = stylesheet.addStyle(".footer");
	style.setAttribute("text-align", "right");
	style.setAttribute("font-size", "8px");
	style.setAttribute("font-family", "Courier New");

	style = stylesheet.addStyle(".heading1");
	style.setAttribute("font-size", "16px");
	style.setAttribute("font-weight", "bold");
	
	style = stylesheet.addStyle(".heading2");
	style.setAttribute("font-size", "12px");
	style.setAttribute("font-weight", "bold");

	style = stylesheet.addStyle(".heading3");
	style.setAttribute("font-size", "10px");
	style.setAttribute("font-weight", "bold");

	style = stylesheet.addStyle(".heading4");
	style.setAttribute("font-size", "9px");
	style.setAttribute("font-weight", "bold");

	style = stylesheet.addStyle(".header1");
	style.setAttribute("font-size", "10px");
	style.setAttribute("font-family", "Times New Roman");

	style = stylesheet.addStyle(".header2");
	style.setAttribute("font-size", "7px");
	style.setAttribute("font-family", "Times New Roman");

	style = stylesheet.addStyle(".horizontalLine");
	style.setAttribute("border-bottom", "thin solid black");

	// style = stylesheet.addStyle(".rowNumber");
	// style.setAttribute("font-size", "9px");

	// style = stylesheet.addStyle(".valueAmount");
	// style.setAttribute("font-size", "9px");
	// style.setAttribute("font-weight", "bold");
	// style.setAttribute("padding-bottom", "5px"); 
	// style.setAttribute("background-color", "#eeeeee"); 
	// style.setAttribute("text-align", "right");
	
	// style = stylesheet.addStyle(".valueDate");
	// style.setAttribute("font-size", "9px");
	// style.setAttribute("font-weight", "bold");
	// style.setAttribute("padding-bottom", "5px"); 
	// style.setAttribute("background-color", "#eeeeee"); 

	// style = stylesheet.addStyle(".valueText");
	// style.setAttribute("font-size", "9px");
	// style.setAttribute("font-weight", "bold");
	// style.setAttribute("padding-bottom", "5px");
	// style.setAttribute("padding-top", "5px");
	// style.setAttribute("background-color", "#eeeeee"); 
	
	// style = stylesheet.addStyle(".valueTitle");
	// style.setAttribute("font-size", "9px");
	// style.setAttribute("font-weight", "bold");
	// //style.setAttribute("padding-bottom", "5px"); 
	// //style.setAttribute("padding-top", "5px");
	// style.setAttribute("background-color", "#000000");
	// style.setAttribute("color", "#fff");
	
	// style = stylesheet.addStyle(".valueTitle1");
	// style.setAttribute("font-size", "9px");
	// style.setAttribute("font-weight", "bold");
	// style.setAttribute("padding-bottom", "5px"); 
	// style.setAttribute("padding-top", "5px");
	

	style = stylesheet.addStyle(".valueTotal");
	style.setAttribute("font-weight", "bold");
	style.setAttribute("background-color", "#eeeeee");

	style = stylesheet.addStyle(".valueTotal1");
	style.setAttribute("background-color", "#eeeeee");

	//Table
	style = stylesheet.addStyle("table");
	style.setAttribute("width", "100%");
	style.setAttribute("font-size", "8px");
	stylesheet.addStyle("table.table td", "border: thin solid #2C4068");

	style = stylesheet.addStyle(".styleTableHeader");
	//style.setAttribute("font-weight", "bold");
	style.setAttribute("background-color", "#2C4068"); 
	style.setAttribute("border-bottom", "1px double black");
	style.setAttribute("color", "#fff");

	style = stylesheet.addStyle(".styleTitleCell");
	style.setAttribute("font-weight", "bold");
	style.setAttribute("background-color", "#FFD100"); 
	style.setAttribute("border-bottom", "1px double black");
	style.setAttribute("color", "#2C4068");

	style = stylesheet.addStyle(".background");
	style.setAttribute("padding-bottom", "5px");
	style.setAttribute("padding-top", "5px"); 
	style.setAttribute("background-color", "#eeeeee"); 

	style = stylesheet.addStyle(".borderLeft");
	style.setAttribute("border-left","thin solid black");

	style = stylesheet.addStyle(".borderBottom");
	style.setAttribute("border-bottom","thin solid black");

	style = stylesheet.addStyle(".bold");
	style.setAttribute("font-weight", "bold");

	style = stylesheet.addStyle(".italic");
	style.setAttribute("font-style", "italic");

	style = stylesheet.addStyle(".alignRight");
	style.setAttribute("text-align", "right");

	style = stylesheet.addStyle(".alignCenter");
	style.setAttribute("text-align", "center");

	//Image style
	style = stylesheet.addStyle(".img");
	style.setAttribute("height", "170");
	style.setAttribute("width", "170");

	return stylesheet;
}