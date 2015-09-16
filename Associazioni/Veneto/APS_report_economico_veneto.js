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
// @pubdate = 2015-08-18
// @publisher = Banana.ch SA
// @description = APS Report economico Veneto
// @task = app.command
// @doctype = 100.100
// @docproperties = italia
// @outputformat = none
// @inputdatasource = none
// @timeout = -1





//Create the param object with some parameters
var param = {};
var	form = [];

function loadParam() {
	param = {
		"headerLeft" : Banana.document.info("Base","HeaderLeft"),													// Get the info from File->File properties->Header left
		"headerRight" : Banana.document.info("Base","HeaderRight"),													// Get the info from File->File properties->Header right
		"startDate" : Banana.document.info("AccountingDataBase","OpeningDate"),										// Get the start date of the accounting period
		"endDate" : Banana.document.info("AccountingDataBase","ClosureDate"),										// Get the end date of the accounting period
		"year" : Banana.Converter.toDate(Banana.document.info("AccountingDataBase","OpeningDate")).getFullYear(),	// Get the year from the accounting period
		"basicCurrency" : Banana.document.info("AccountingDataBase","BasicCurrency"),								// Get the basic currency of the accounting
		"grColumn" : "Gr1",																							// Specify the column ("Gr1" or "Gr2")
		"formatNumber" : true,																						// Specify if convert all the values into the local format
		"rounding" : 2,																								// Specify the rounding of the sums
		"title" : "BILANCIO ECONOMICO (Modello 2) ANNO 2015",														// Specify a title that will be displayed on the report
		"columnTitle1" : "MPORTI PARZIALI",																			// Specify a column title
		"columnTitle2" : "IMPORTI TOTALI",																			// Specify another column title
		"cellTitle1" : "RICAVI",																					// Specify a cell title
		"cellTitle2" : "TOTALE RICAVI",																				// Specify a cell title
		"cellTitle3" : "COSTI",																						// Specify a cell title
		"cellTitle4" : "TOTALE COSTI",																				// Specify a cell title
		"cellTitle5" : "UTILE/PERDITA D'ESERCIZIO"																	// Specify a cell title
	};
}



//The purpose of this function is to create and load the structure that will contains all the data used to create the report
function loadForm() {

	//INCOME
	form.push({"id":"R1", "description":"QUOTE ASSOCIATIVE", "gr":"R1", "bClass":"4"});
	form.push({"id":"R2", "description":"CONTRIBUTI PER PROGETTI E/O ATTIVITÀ (art. 5 L. 266/91)", "gr":"R2", "sum":"R2.1;R2.2;R2.3;R2.4;R2.5;R2.6;R2.7;R2.8"});
	form.push({"id":"R2.1", "description":"da soci (specificare a quale titolo)", "gr":"R2.1", "bClass":"4"});
	form.push({"id":"R2.2", "description":"da non soci (specificare a quale titolo)", "gr":"R2.2", "bClass":"4"});
	form.push({"id":"R2.3", "description":"da CSV e Comitato di Gestione", "gr":"R2.3", "bClass":"4"});
	form.push({"id":"R2.4", "description":"da enti pubblici (comune, provincia, regione, stato)", "gr":"R2.4", "bClass":"4"});
	form.push({"id":"R2.5", "description":"da Comunità europea e da altri organismi internazionali", "gr":"R2.5", "bClass":"4"});
	form.push({"id":"R2.6", "description":"da altre Odv (specificare a quale titolo)", "gr":"R2.6", "bClass":"4"});
	form.push({"id":"R2.7", "description":"dal cinque per mille", "gr":"R2.7", "bClass":"4"});
	form.push({"id":"R2.8", "description":"altro (specificare)", "gr":"R2.8", "bClass":"4"});
	form.push({"id":"R3", "description":"DONAZIONI DEDUCIBILI E LASCITI TESTAMENTARI - art. 5 L.266/91", "gr":"R3", "sum":"R3.1;R3.2"});
	form.push({"id":"R3.1", "description":"da soci", "gr":"R3.1", "bClass":"4"});
	form.push({"id":"R3.2", "description":"da non soci", "gr":"R3.2", "bClass":"4"});
	form.push({"id":"R4", "description":"RIMBORSI DERIVANTI DA CONVENZIONI CON ENTI PUBBLICI - art. 5 L.266/91", "gr":"R4", "bClass":"4"});
	form.push({"id":"R5a", "description":"ENTRATE DA ATTIVITÀ COMMERCIALI PRODUTTIVE MARGINALI   (Raccolta fondi)", "gr":"R5a", "sum":"R5.1;R5.2;R5.3"});
	form.push({"id":"R5.1", "description":"da attività di vendite occasionali o iniziative occasionali di solidarietà (D.M. 1995 lett.a) es.eventi, cassettina offerte, tombole, spettacoli", "gr":"R5.1", "bClass":"4"});
	form.push({"id":"R5.2", "description":"da attività di vendita di beni acquisiti da terzi a titolo gratuito a fini di sovvenzione  (D.M. 1995 lett.b)", "gr":"R5.2", "bClass":"4"});
	form.push({"id":"R5.3", "description":"da attività di somministrazione di alimenti e bevande in occasione di manifestazioni e simili a carattere occasionale  (D.M. 1995 lett.d)", "gr":"R5.3", "bClass":"4"});
	form.push({"id":"R5b", "description":" ALTRE ENTRATE DA ATTIVITÀ COMMERCIALI MARGINALI", "gr":"R5b", "sum":"R5.4;R5.5"});
	form.push({"id":"R5.4", "description":"cessione di beni prodotti dagli assistiti e dai volontari sempreché la vendita dei prodotti sia curata direttamente dall'organizzazione senza alcun intermediario (D.M. 1995 lett.c)", "gr":"R5.4", "bClass":"4"});
	form.push({"id":"R5.5", "description":"attività di prestazione di servizi rese in conformità alle finalità istituzionali, non riconducibili nell'ambito applicativo dell'art. 111, comma 3, del TUIR  verso pagamento di corrispettivi specifici che non eccedano del 50% i costi di diretta imputazione (D.M. 1995 lett. e)", "gr":"R5.5", "bClass":"4"});
	form.push({"id":"R6", "description":"ALTRE ENTRATE (comunque ammesse dalla L.266/91)", "gr":"R6", "sum":"R6.1;R6.2;R6.3"});
	form.push({"id":"R6.1", "description":"rendite patrimoniali (fitti,….)", "gr":"R6.1", "bClass":"4"});
	form.push({"id":"R6.2", "description":"rendite finanziarie (interessi, dividendi)", "gr":"R6.2", "bClass":"4"});
	form.push({"id":"R6.3", "description":"altro: specificare ", "gr":"R6.3", "bClass":"4"});
	form.push({"id":"R7", "description":"ANTICIPAZIONI DI CASSA", "gr":"R7", "bClass":"4"});
	form.push({"id":"R8", "description":"PARTITE DI GIRO", "gr":"R8", "bClass":"4"});
	form.push({"id":"R", "description":"TOTALE RICAVI", "sum":"R1;R2;R3;R4;R5a;R5b;R6;R7;R8"});

	//EXPENSES
	form.push({"id":"C1", "description":"RIMBORSI SPESE AI VOLONTARI  (documentate ed effettivamente sostenute)", "gr":"C1", "bClass":"3"});
	form.push({"id":"C2", "description":"ASSICURAZIONI", "gr":"C2", "sum":"C2.1;C2.2"});
	form.push({"id":"C2.1", "description":"volontari (malattie, infortuni e resp. civile terzi) - art. 4 L.266/91", "gr":"C2.1", "bClass":"3"});
	form.push({"id":"C2.2", "description":"altre: es. veicoli, immobili,….", "gr":"C2.2", "bClass":"3"});
	form.push({"id":"C3", "description":"PERSONALE OCCORRENTE  A QUALIFICARE E SPECIALIZZARE L’ATTIVITÀ (art. 3 L. 266/91 e art. 3 L.R. 40/1993)", "gr":"C3", "sum":"C3.1;C3.2;C3.3"});
	form.push({"id":"C3.1", "description":"dipendenti ", "gr":"C3.1", "bClass":"3"});
	form.push({"id":"C3.2", "description":"atipici e occasionali", "gr":"C3.2", "bClass":"3"});
	form.push({"id":"C3.3", "description":"consulenti (es. fisioterapista)", "gr":"C3.3", "bClass":"3"});
	form.push({"id":"C4", "description":"ACQUISTI DI SERVIZI  (es. manutenzione, trasporti, service, consulenza fiscale e del lavoro)", "gr":"C4", "bClass":"3"});
	form.push({"id":"C5", "description":"UTENZE (telefono, luce, riscaldamento,…)", "gr":"C5", "bClass":"3"});
	form.push({"id":"C6", "description":"MATERIALI DI CONSUMO (cancelleria, postali, materie prime, generi alimentari)", "gr":"C6", "sum":"C6.1;C6.2;C6.3"});
	form.push({"id":"C6.1", "description":"per struttura odv", "gr":"C6.1", "bClass":"3"});
	form.push({"id":"C6.2", "description":"per attività", "gr":"C6.2", "bClass":"3"});
	form.push({"id":"C6.3", "description":"per soggetti svantaggiati", "gr":"C6.3", "bClass":"3"});
	form.push({"id":"C7", "description":"GODIMENTO BENI DI TERZI (affitti, noleggio attrezzature, diritti Siae,....)", "gr":"C7", "bClass":"3"});
	form.push({"id":"C8", "description":"ONERI FINANZIARI E PATRIMONIALI (es. interessi passivi su mutui, prestiti, c/c bancario ..)", "gr":"C8", "bClass":"3"});
	form.push({"id":"C9", "description":"AMMORTAMENTI", "gr":"C9", "bClass":"3"});
	form.push({"id":"C10", "description":"IMPOSTE E TASSE", "gr":"C10", "bClass":"3"});
	form.push({"id":"C11", "description":"RACCOLTE FONDI (vedi allegati Nr. delle singole raccolte fondi di cui ai punti 5.1, 5.2 e 5.3 delle entrate)", "gr":"C11", "bClass":"3"});
	form.push({"id":"C12", "description":"ALTRE USCITE/COSTI", "gr":"C12", "sum":"C12.1;C12.2;C12.3;C12.4"});
	form.push({"id":"C12.1", "description":"Contributi a soggetti svantaggiati", "gr":"C12.1", "bClass":"3"});
	form.push({"id":"C12.2", "description":"Quote associative a odv collegate  (specificare)", "gr":"C12.2", "bClass":"3"});
	form.push({"id":"C12.3", "description":"versate ad altre odv (specificare)", "gr":"C12.3", "bClass":"3"});
	form.push({"id":"C12.4", "description":"Altro (specificare)", "gr":"C12.4", "bClass":"3"});
	form.push({"id":"C13", "description":"PARTITE DI GIRO", "gr":"C13", "bClass":"3"});
	form.push({"id":"C", "description":"TOTALE COSTI", "sum":"C1;C2;C3;C4;C5;C6;C7;C8;C9;C10;C11;C12;C13"});

	//
	form.push({"id":"UP", "description":"UTILE/PERDITA D'ESERCIZIO", "sum":"R;-C"});
	
	//formPrint.push({"id":"R1", row: 1, "print":"description", "column":1});
	//formPrint.push({"id":"R1", row: 1, "print":"amount", "column":2, "style":"bold"});

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

	// 3. Calculate the totals
	calcTotals(["amount"]);

	//postProcess();
	
	// 4. Format all the values
	formatValues(["amount"]);

	// 5. Create and print the report
	printReport();

}


//The purpose of this function is to create and print the report
function printReport() {

	var report = Banana.Report.newReport("Script Italia, v3");

	report.addParagraph(param.headerLeft + " - " + param.headerRight);
	report.addParagraph(param.title + " (" + param.startDate + " - " + param.endDate + ")");
	report.addParagraph(param.cellTitle1);
	report.addParagraph(param.cellTitle2);
	report.addParagraph(param.cellTitle3);
	report.addParagraph(param.cellTitle4);

	report.addParagraph(" ");
	
	var table = report.addTable("table");
	tableRow = table.addRow();
	tableRow.addCell("id", "bold", 1);
	tableRow.addCell("gr", "bold", 1)
	tableRow.addCell("description", "bold", 1);
	tableRow.addCell(param.columnTitle1, "bold", 1);
	tableRow.addCell(param.columnTitle2, "bold", 1);

	for (var k = 0; k < form.length; k++) {
		if (form[k].gr) {
			tableRow = table.addRow();
			tableRow.addCell(form[k].id, "", 1);
			tableRow.addCell(form[k].gr, "", 1);
			tableRow.addCell(form[k].description, "", 1);

			if (form[k].gr.indexOf(".") > 0) {
				tableRow.addCell(getBalance(form[k].gr), "alignRight", 1);
				tableRow.addCell(" ");
			} else {
				tableRow.addCell(" ");
				tableRow.addCell(getBalance(form[k].gr), "alignRight", 1);
			}
		}
	}

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
function getDescription(gr) {
	var searchGr = gr.trim();
	for (var i = 0; i < form.length; i++) {
		if (form[i]["gr"]) {
			if (form[i]["gr"] === searchGr) {
				return form[i]["description"];
			}
		} else {
			if (form[i]["id"] === searchGr) {
				return form[i]["description"];
			}
		}

	}
	Banana.document.addMessage("Couldn't find object with gr: " + gr);
}


//The purpose of this function is to get the Balance from an object
function getBalance(gr) {
	var searchGr = gr.trim();
	for (var i = 0; i < form.length; i++) {
		if (form[i]["gr"] === searchGr) {
			return form[i]["amount"];
		}
	}
	Banana.document.addMessage("Couldn't find object with gr: " + gr);
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

//The main purpose of this function is to create styles for the report print
function createStyleSheet() {
	var stylesheet = Banana.Report.newStyleSheet();

    var pageStyle = stylesheet.addStyle("@page");
    pageStyle.setAttribute("margin", "10mm 10mm 10mm 10mm");

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
	//style.setAttribute("font-family", "Courier New");

	style = stylesheet.addStyle(".heading1");
	style.setAttribute("font-size", "16px");
	style.setAttribute("font-weight", "bold");
	
	style = stylesheet.addStyle(".heading2");
	style.setAttribute("font-size", "14px");
	style.setAttribute("font-weight", "bold");

	style = stylesheet.addStyle(".heading3");
	style.setAttribute("font-size", "12px");
	style.setAttribute("font-weight", "bold");

	style = stylesheet.addStyle(".heading4");
	style.setAttribute("font-size", "9px");
	style.setAttribute("font-weight", "bold");

	// style = stylesheet.addStyle(".horizontalLine");
	// style.setAttribute("border-top", "1px solid black");

	// style = stylesheet.addStyle(".rowNumber");
	// style.setAttribute("font-size", "9px");

	style = stylesheet.addStyle(".valueAmount");
	style.setAttribute("font-size", "9px");
	style.setAttribute("font-weight", "bold");
	style.setAttribute("padding-bottom", "5px"); 
	style.setAttribute("background-color", "#eeeeee"); 
	style.setAttribute("text-align", "right");
	
	// style = stylesheet.addStyle(".valueDate");
	// style.setAttribute("font-size", "9px");
	// style.setAttribute("font-weight", "bold");
	// style.setAttribute("padding-bottom", "5px"); 
	// style.setAttribute("background-color", "#eeeeee"); 

	style = stylesheet.addStyle(".valueText");
	style.setAttribute("font-size", "9px");
	style.setAttribute("font-weight", "bold");
	style.setAttribute("padding-bottom", "5px");
	style.setAttribute("padding-top", "5px");
	style.setAttribute("background-color", "#eeeeee"); 
	
	style = stylesheet.addStyle(".valueTitle");
	style.setAttribute("font-size", "9px");
	style.setAttribute("font-weight", "bold");
	//style.setAttribute("padding-bottom", "5px"); 
	//style.setAttribute("padding-top", "5px");
	style.setAttribute("background-color", "#000000");
	style.setAttribute("color", "#fff");
	
	style = stylesheet.addStyle(".valueTitle1");
	style.setAttribute("font-size", "9px");
	style.setAttribute("font-weight", "bold");
	style.setAttribute("padding-bottom", "5px"); 
	style.setAttribute("padding-top", "5px");
	
	// style = stylesheet.addStyle(".valueTotal");
	// style.setAttribute("font-size", "9px");
	// style.setAttribute("font-weight", "bold");
	// style.setAttribute("padding-bottom", "5px"); 
	// style.setAttribute("background-color", "#eeeeee"); 
	// style.setAttribute("text-align", "right");
	// style.setAttribute("border-bottom", "1px double black");

	//Tables
	style = stylesheet.addStyle("tableInfo");
	style.setAttribute("width", "100%");
	style.setAttribute("font-size", "8px");
	//stylesheet.addStyle("table.tableInfo td", "border: thin solid black");

	style = stylesheet.addStyle("tableChoices");
	style.setAttribute("width", "100%");
	style.setAttribute("font-size", "8px");

	style = stylesheet.addStyle("table");
	style.setAttribute("width", "100%");
	style.setAttribute("font-size", "8px");
	stylesheet.addStyle("table.table td", "border: thin solid black");

	style = stylesheet.addStyle("table2");
	style.setAttribute("width", "100%");
	style.setAttribute("font-size", "8px");
	//stylesheet.addStyle("table.table2 td", "border: thin solid black");

	style = stylesheet.addStyle("table3");
	style.setAttribute("width", "100%");
	style.setAttribute("font-size", "8px");
	//stylesheet.addStyle("table.table3 td", "border: thin solid black");



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


	

	//Warning message.
	style = stylesheet.addStyle(".warningMsg");
	style.setAttribute("font-weight", "bold");
	style.setAttribute("color", "red");
	style.setAttribute("font-size", "10");



	return stylesheet;
}