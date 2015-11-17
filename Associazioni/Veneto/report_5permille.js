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
// @id = it.banana.app.report5permille
// @api = 1.0
// @pubdate = 2015-08-18
// @publisher = Banana.ch SA
// @description = Italia - Report "5 per mille"
// @task = app.command
// @doctype = 100.100
// @docproperties = veneto
// @outputformat = none
// @inputdatasource = none
// @timeout = -1




/*
	5XM 	: R2.7
	5XM_RU	: C1, C3.1, C3.2, C3.3
	5XM_FUN	: C2.1, C2.2, C5, C6.1, C8, C10
	5XM_B&S : C4, C6.2, C6.3, C7, C9, C11
	5XM_ALT : C12.1, C12.4, C13
	5XM_ERO : C12.2, C12.3,
	5XM_ACC : P2.2 
*/

var totalExpenses = "";
var totalIncome = "";
var accountsMap = {};
var groups = [];
groups.push({"group":"0", "gr1":"R2.7"});
groups.push({"group":"1", "gr1":"C1;C3.1;C3.2;C3.3", "title":"Risorse umane", "text":"(dettagliare i costi a seconda della causale, per esempio: compensi per personale; rimborsi spesa a favore di volontari e/o del personale). N.B. nel caso in cui i compensi per il personale superano il 50% dell’importo percepito è obbligatorio per le associazioni allegare copia delle buste paga del personale imputato fino alla concorrenza dell’importo rendicontato"});
groups.push({"group":"2", "gr1":"C2.1;C2.2;C5;C6.1;C8;C10","title":"Costi di funzionamento", "text":"(dettagliare i costi a seconda della causale, per esempio: spese di acqua, gas, elettricità, pulizia; materiale di cancelleria; spese per affitto delle sedi; ecc…)"});
groups.push({"group":"3", "gr1":"C4;C6.2;C6.3;C7;C9;C11", "title":"Acquisto beni e servizi", "text":"(dettagliare i costi a seconda della causale, per esempio: acquisto e/o noleggio apparecchiature informatiche; acquisto beni immobili; prestazioni eseguite da soggetti esterni all’ente; affitto locali per eventi; ecc…)"});
groups.push({"group":"4", "gr1":"C12.2;C12.3", "title":"Erogazioni ai sensi della propria finalità istituzionale", "text":"N.B. in caso di erogazioni liberali ad altri enti/soggetti, anche esteri, è obbligatorio allegare copia del bonifico effettuato"});
groups.push({"group":"5", "gr1":"C12.1;C12.4;C13", "title":"Altre voci di spesa riconducibili al raggiungimento dello scopo sociale", "text":""});
groups.push({"group":"6", "gr1":"P2.2", "title":"Accantonamento", "text":"(è possibile accantonare in tutto o in parte l’importo percepito, fermo restando che l’Ente beneficiario deve specificare nella relazione allegata al presente documento le finalità dell’accantonamento effettuato ed allegare il verbale del Consiglio di Amministrazione in cui viene deliberato l’accantonamento. Si fa presente, comunque, l’obbligo di spendere tutte le somme accantonate e rinviare il presente modello entro 24 mesi dalla percezione del contributo)"});



//Main function
function exec(string) {
	
	//Check if we are on an opened document
	if (!Banana.document) {
		return;
	}

	//Function call to manage and save user settings about the period date
	var dateform = getPeriodSettings();
	if (dateform) {

		//Show the user a dialog asking to select a 5XM segment from a list
		var _5xmSegmentList = getSegmentList();
		var itemSelected = Banana.Ui.getItem('5 PER MILLE', 'Scegliere un segmento', _5xmSegmentList, 0, false);

		//If user has selected something and clicked "OK"
		if (itemSelected) {

			//Functin call to create all the account objects for the selected segment
			loadAccountsMap(itemSelected, dateform.selectionStartDate, dateform.selectionEndDate);
				
			//Function call to print the report
			printReport(itemSelected, dateform.selectionStartDate, dateform.selectionEndDate);
		}
	}
}


//This function creates and print the report
function printReport(itemSelected, startDate, endDate) {

	var report = Banana.Report.newReport("5 per mille - Veneto");

	/*
		PRINT TABLE "ANAGRAFICA"
	*/
	report.addParagraph("MODELLO PER IL RENDICONTO DELLE SOMME PERCEPITE IN VIRTÙ DEL BENEFICIO DEL 5 PER MILLE DELL'IRPEF DAGLI AVENTI DIRITTO", "heading3");
	report.addParagraph(" ");

	var tableAnagrafica = report.addTable("table");
	tableAnagrafica.getCaption().addText("ANAGRAFICA", "description bold");
	tableRow = tableAnagrafica.addRow();
	tableRow.addCell("Denominazione sociale", "", 1);
	tableRow.addCell(Banana.document.info("AccountingDataBase", "Company"), "", 1);
	
	tableRow = tableAnagrafica.addRow();
	tableRow.addCell("Scopi dell'attività sociale", "", 1);
	tableRow.addCell(Banana.document.table("TestiReport").findRowByValue("RowId", ":5XM-SCOPO").value("Testo"), "", 1);

	tableRow = tableAnagrafica.addRow();
	tableRow.addCell("C.F. del soggetto beneficiario", "", 1);
	tableRow.addCell(Banana.document.info("AccountingDataBase", "FiscalNumber"), "", 1);

	tableRow = tableAnagrafica.addRow();
	tableRow.addCell("Indirizzo", "", 1);
	tableRow.addCell(Banana.document.info("AccountingDataBase", "Address1"), "", 1);

	tableRow = tableAnagrafica.addRow();
	tableRow.addCell("Città", "", 1);
	tableRow.addCell(Banana.document.info("AccountingDataBase", "City"), "", 1);

	tableRow = tableAnagrafica.addRow();
	tableRow.addCell("N. Telefono", "", 1);
	tableRow.addCell(Banana.document.info("AccountingDataBase", "Phone"), "", 1);

	tableRow = tableAnagrafica.addRow();
	tableRow.addCell("N. Fax", "", 1);
	tableRow.addCell(Banana.document.info("AccountingDataBase", "Fax"), "", 1);

	tableRow = tableAnagrafica.addRow();
	tableRow.addCell("Indirizzo email", "", 1);
	tableRow.addCell(Banana.document.info("AccountingDataBase", "Email"), "", 1);

	tableRow = tableAnagrafica.addRow();
	tableRow.addCell("Nome del rappresentante legale", "", 1);
	tableRow.addCell(Banana.document.table("TestiReport").findRowByValue("RowId", ":5XM-RAPP").value("Testo"), "", 1);

	tableRow = tableAnagrafica.addRow();
	tableRow.addCell("C.F. del rappresentante legale", "", 1);
	tableRow.addCell(Banana.document.table("TestiReport").findRowByValue("RowId", ":5XM-RAPP-CF").value("Testo"), "", 1);

	report.addParagraph(" ");



	/* 
		PRINT TABLE "RENDICONTO DELLE SPESE SOSTENUTE" 
	*/

	var table = report.addTable("table");
	table.getCaption().addText("RENDICONTO DELLE SPESE SOSTENUTE", "description bold");
	tableRow = table.addRow();
	tableRow.addCell(getDescription(itemSelected), "alignRight bold", 2);
	tableRow.addCell(itemSelected, "alignCenter bold", 1);
	tableRow = table.addRow();
	tableRow.addCell("Anno finanziario", "alignRight bold", 2);
	tableRow.addCell(Banana.Converter.toDate(startDate).getFullYear(), "alignCenter bold", 1);
	tableRow = table.addRow();
	tableRow.addCell("Data di percezione", "alignRight bold", 2);
	tableRow.addCell(Banana.document.table("TestiReport").findRowByValue("RowId", ":5XM-DATA").value("Testo"), "alignCenter bold", 1);
	
	//Creation and print of the INCOME groups with all the details
	for (var i = 0; i < groups.length; i++) {
		var groupObj = getObject(groups, groups[i]["group"]);
		if (groupObj.gr1.substring(0,1) === "R" ) {
			createGroup(groupObj, table, itemSelected, startDate, endDate);
		}
	}

	tableRow = table.addRow();
	tableRow.addCell("IMPORTO PERCEPITO", "alignRight bold", 2);
	tableRow.addCell(Banana.Converter.toLocaleNumberFormat(Banana.SDecimal.invert(totalIncome)), "alignRight bold", 1);
	tableRow = table.addRow();
	tableRow.addCell(" ", "", 3);


	//Creation and print of the six EXPENSES groups with all the details
	for (var i = 0; i < groups.length; i++) {
		var groupObj = getObject(groups, groups[i]["group"]);
		if (groupObj.gr1.substring(0,1) !== "R" ) {
			createGroup(groupObj, table, itemSelected, startDate, endDate);
		}
	}
	
	//Add the final total
	tableRow = table.addRow();
	tableRow.addCell("TOTALE SPESE", "alignRight bold", 2);
	tableRow.addCell(Banana.Converter.toLocaleNumberFormat(totalExpenses), "alignRight bold", 1)

	//Add a footer
	addFooter(report);

	//Print the report
	var stylesheet = createStyleSheet();
	Banana.Report.preview(report, stylesheet);
}


//This function creates and print a whole group 
function createGroup(groupObj, table, itemSelected, startDate, endDate) {
	
	//Take the data from the given group
	var _group = groupObj.group;
	var _gr1 = groupObj.gr1;
	var _title = groupObj.title;
	var _text = groupObj.text;

	var arrGr = _gr1.split(";");
	
	var arrAcc = [];
	var arrDesc = [];
	var arrTot = [];
	var total = "";

	//Print group name and description
	if (_gr1.substring(0,1) === "R" ) {
		tableRow = table.addRow();
		tableRow.addCell(_group + ". " + "Entrate", "bold", 3);
	} else {
		tableRow = table.addRow();
		tableRow.addCell(_group + ". " + _title, "bold", 3);
	}

	//Check that the accountsMap is not empty, then use it to create the report
	if (Object.keys(accountsMap).length !== 0) {

		//We take the gr1 list of the principal group and, for each element, we check if it equals the gr1 of the account detalis
		//Do do that we need to pass all the "Accounts" table to get the account numbers and use them as key for the accountsMap
		//In the case the two gr1 are the same, we save the details values into the respective array

		for (var i = 0; i < arrGr.length; i++) {

			for (var j = 0; j < Banana.document.table('Accounts').rowCount; j++) {
				var tRow = Banana.document.table('Accounts').row(j);

				if (accountsMap[tRow.value("Account")] && accountsMap[tRow.value("Account")].gr1 === arrGr[i]) {
					arrAcc.push(tRow.value("Account"));
					arrDesc.push(accountsMap[tRow.value("Account")].description);
					arrTot.push(accountsMap[tRow.value("Account")].total);
				}
			}
		}

		//Print account details
		var str = "";
		for (var i = 0; i < arrAcc.length; i++) { //arrAcc, arrDesc, arrTot have the same length
			tableRow = table.addRow();
			tableRow.addCell(arrAcc[i], "alignCenter", 1);
			tableRow.addCell(arrDesc[i], "", 1);
			tableRow.addCell(Banana.Converter.toLocaleNumberFormat(arrTot[i]), "alignRight", 1);
			
			//Build the string with the accounts number divided by the "|" to use the currentBalance() function
			str += arrAcc[i] + "|";
		}

		//Calculate and print the total of the group
		if (str) {
			var currentBal = Banana.document.currentBalance(str + itemSelected, startDate, endDate);
			total = currentBal.total;
		}

		tableRow = table.addRow();
		tableRow.addCell("Totale gruppo " + _group, "bold alignRight italic", 2);

		if (_gr1.substring(0,1) === "R") {
			tableRow.addCell(Banana.Converter.toLocaleNumberFormat(Banana.SDecimal.invert(total)), "bold alignRight italic", 1);
		} else {
			tableRow.addCell(Banana.Converter.toLocaleNumberFormat(total), "bold alignRight italic", 1);
		}
	}
	//If the accountsMap is empty, then print the empty total group adding some spaces to adjust the alignment
	else {
		var total = "0";
		tableRow = table.addRow();
		tableRow.addCell("", "", 1);
		tableRow.addCell("                                          Totale gruppo " + _group, "bold alignRight italic", 1);
		tableRow.addCell(Banana.Converter.toLocaleNumberFormat(total), "bold alignRight italic", 1);
	}

	//Sum the total usind the SDecimal.add() function to obtain the final total
	if (_gr1.substring(0,1) === "R") {
		totalIncome = Banana.SDecimal.add(totalIncome, total);
	} else {
		totalExpenses = Banana.SDecimal.add(totalExpenses, total);
	}
}


//This function returns a specific object
function getObject(form, nr) {
	for (var i = 0; i < form.length; i++) {
		if (form[i]["group"] === nr) {
			return form[i];
		}
	}
	Banana.document.addMessage("Couldn't find object with nr: " + nr);
}


//This function, for the given segment and period, creates all the accounts objects
function loadAccountsMap(segment, startDate, endDate) {

	var arrList = [];
	for (var i = 0; i < Banana.document.table('Accounts').rowCount; i++) {
		var tRow = Banana.document.table('Accounts').row(i);
		if (tRow.value("Account") &&
			tRow.value("Account").indexOf(":") < 0 && 
			tRow.value("Account").indexOf(".") < 0 && 
			tRow.value("Account").indexOf(",") < 0 && 
			tRow.value("Account").indexOf(";") < 0) {

			var currentBal = Banana.document.currentBalance(tRow.value("Account") + segment, startDate, endDate);
			var total = currentBal.total;
			var amount = currentBal.amount;

			if (total) {
				accountsMap[tRow.value("Account")] = {
					"description":tRow.value("Description"), 
					"gr1":tRow.value("Gr1"), 
					"total" : amount
				};
				//Banana.console.log(tRow.value("Account") + ", " + tRow.value("Gr1") + ", " + total + ", " + amount);
				//Banana.console.log(JSON.stringify(accountsMap, "", ""));
			}
		}
	}
}


//This function take from Banana table 'Accounts' all the 5XM segments
function getSegmentList() {
	var arrList = [];
	for (var i = 0; i < Banana.document.table('Accounts').rowCount; i++) {
		var tRow = Banana.document.table('Accounts').row(i);
		if (tRow.value("Account").indexOf(":") == 0 && tRow.value("Account").indexOf("::") < 0) {
			arrList.push(tRow.value("Account"));
		}
	}
	return arrList;
}


//This function returns the description for a given segment
function getDescription(segment) {
	for (var i = 0; i < Banana.document.table('Accounts').rowCount; i++) {
		var tRow = Banana.document.table('Accounts').row(i);
		if (tRow.value("Account") === segment) {
			return tRow.value("Description");
		}
	}
}


//The main purpose of this function is to allow the user to enter the accounting period desired and saving it for the next time the script is run.
//Every time the user runs of the script he has the possibility to change the date of the accounting period.
function getPeriodSettings() {
	
	//The formeters of the period that we need
	var scriptform = {
	   "selectionStartDate": "",
	   "selectionEndDate": "",
	   "selectionChecked": "false"
	};

	//Read script settings
	var data = Banana.document.scriptReadSettings();
	
	//Check if there are previously saved settings and read them
	if (data.length > 0) {
		try {
			var readSettings = JSON.parse(data);
			
			//We check if "readSettings" is not null, then we fill the formeters with the values just read
			if (readSettings) {
				scriptform = readSettings;
			}
		} catch (e){}
	}
	
	//We take the accounting "starting date" and "ending date" from the document. These will be used as default dates
	var docStartDate = Banana.document.startPeriod();
	var docEndDate = Banana.document.endPeriod();	
	
	//A dialog window is opened asking the user to insert the desired period. By default is the accounting period
	var selectedDates = Banana.Ui.getPeriod("Periodo", docStartDate, docEndDate, 
		scriptform.selectionStartDate, scriptform.selectionEndDate, scriptform.selectionChecked);
		
	//We take the values entered by the user and save them as "new default" values.
	//This because the next time the script will be executed, the dialog window will contains the new values.
	if (selectedDates) {
		scriptform["selectionStartDate"] = selectedDates.startDate;
		scriptform["selectionEndDate"] = selectedDates.endDate;
		scriptform["selectionChecked"] = selectedDates.hasSelection;

		//Save script settings
		var formToString = JSON.stringify(scriptform);
		var value = Banana.document.scriptSaveSettings(formToString);		
    } else {
		//User clicked cancel
		return;
	}
	return scriptform;
}


//This function adds a Footer to the report
function addFooter(report) {
   report.getFooter().addClass("footer");
   var versionLine = report.getFooter().addText("Banana Accounting" + " - ", "description");
   report.getFooter().addText("Pagina ", "description");
   report.getFooter().addFieldPageNr();
}


//The main purpose of this function is to create styles for the report print
function createStyleSheet() {
	var stylesheet = Banana.Report.newStyleSheet();

    var pageStyle = stylesheet.addStyle("@page");
    pageStyle.setAttribute("margin", "20mm 15mm 15mm 25mm");

    var style = "";

    //Text style
    stylesheet.addStyle("body", "font-family : Times New Roman");

	style = stylesheet.addStyle(".footer");
	style.setAttribute("text-align", "right");
	style.setAttribute("font-size", "8px");
	style.setAttribute("font-family", "Courier New");

	style = stylesheet.addStyle(".description");
	style.setAttribute("padding-bottom", "5px");
	style.setAttribute("padding-top", "5px");
	style.setAttribute("font-size", "10px");

	style = stylesheet.addStyle(".heading3");
	style.setAttribute("font-size", "12px");
	style.setAttribute("font-weight", "bold");

	style = stylesheet.addStyle(".bold");
	style.setAttribute("font-weight", "bold");

	style = stylesheet.addStyle(".italic");
	style.setAttribute("font-style", "italic");

	style = stylesheet.addStyle(".alignRight");
	style.setAttribute("text-align", "right");

	style = stylesheet.addStyle(".alignCenter");
	style.setAttribute("text-align", "center");

	//Table style
	style = stylesheet.addStyle("table");
	style.setAttribute("width", "100%");
	style.setAttribute("font-size", "10px");
	stylesheet.addStyle("table.table td", "border: thin solid black");

	return stylesheet;
}
