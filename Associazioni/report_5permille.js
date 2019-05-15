// Copyright [2018] [Banana.ch SA - Lugano Switzerland]
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
// @pubdate = 2018-12-17
// @publisher = Banana.ch SA
// @description = Associazioni - Report "5 per mille"
// @task = app.command
// @doctype = *.*
// @docproperties = associazioni
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


//The purpose of this function is to create and load the structure that will contains all the data used to create the report
function loadGroups() {
	groups = [];
	groups.push({"group":"0", "gr1":"R2.7"});
	groups.push({"group":"1", "gr1":"C1;C3.1;C3.2;C3.3", "title":"Risorse umane", "text":"(dettagliare i costi a seconda della causale, per esempio: compensi per personale; rimborsi spesa a favore di volontari e/o del personale). N.B. nel caso in cui i compensi per il personale superano il 50% dell’importo percepito è obbligatorio per le associazioni allegare copia delle buste paga del personale imputato fino alla concorrenza dell’importo rendicontato"});
	groups.push({"group":"2", "gr1":"C2.1;C2.2;C5;C6.1;C8;C10","title":"Costi di funzionamento", "text":"(dettagliare i costi a seconda della causale, per esempio: spese di acqua, gas, elettricità, pulizia; materiale di cancelleria; spese per affitto delle sedi; ecc…)"});
	groups.push({"group":"3", "gr1":"C4;C6.2;C6.3;C7;C9;C11", "title":"Acquisto beni e servizi", "text":"(dettagliare i costi a seconda della causale, per esempio: acquisto e/o noleggio apparecchiature informatiche; acquisto beni immobili; prestazioni eseguite da soggetti esterni all’ente; affitto locali per eventi; ecc…)"});
	groups.push({"group":"4", "gr1":"C12.2;C12.3", "title":"Erogazioni ai sensi della propria finalità istituzionale", "text":"N.B. in caso di erogazioni liberali ad altri enti/soggetti, anche esteri, è obbligatorio allegare copia del bonifico effettuato"});
	groups.push({"group":"5", "gr1":"C12.1;C12.4;C13", "title":"Altre voci di spesa riconducibili al raggiungimento dello scopo sociale", "text":""});
	groups.push({"group":"6", "gr1":"P2.2", "title":"Accantonamento", "text":"(è possibile accantonare in tutto o in parte l’importo percepito, fermo restando che l’Ente beneficiario deve specificare nella relazione allegata al presente documento le finalità dell’accantonamento effettuato ed allegare il verbale del Consiglio di Amministrazione in cui viene deliberato l’accantonamento. Si fa presente, comunque, l’obbligo di spendere tutte le somme accantonate e rinviare il presente modello entro 24 mesi dalla percezione del contributo)"});
}


//Main function
function exec(string) {
	
	//Check if we are on an opened document
	if (!Banana.document) {
		return;
	}

	//Check if the table "TestiReport" exists
	var tableNames = Banana.document.tableNames;
	if (tableNames.indexOf("TestiReport") < 0) {
		Banana.document.addMessage('Tabella "TestiReport" inesistente oppure nome maiuscolo/minuscolo non esatto.');
		return;
	}

	//Show the user a dialog window asking if include or not a second file
	var answer = Banana.Ui.showQuestion("title", "Si desidera includere il file dell'anno precedente?");

	/** FILE 1 **/
	if (!Banana.document.table("Categories")) {
		var accounts1 = Banana.document.table("Accounts");
		var segment5XMList = getSegmentList(accounts1);
		var accounts2 = "";
		var file2 = "";
	}
	else {
		var accounts1 = Banana.document.table("Categories");
		var segment5XMList = getSegmentList(accounts1);
		var accounts2 = "";
		var file2 = "";
	}

	if (answer) { //Answer YES: open a dialog window for the file selection

		/** FILE 2 **/
		file2 = Banana.application.openDocument("*.*");
		
		if (!file2) { //If user clic cancel and doesn't select a 
			return;
		} else {
			if (!Banana.document.table("Categories")) {
				accounts2 = file2.table("Accounts");
			}
			else {
				accounts2 = file2.table("Categories");
			}
		}
	}

	//Show the user a dialog asking to select a 5XM segment from a list
	var itemSelected = Banana.Ui.getItem("5 PER MILLE", "Scegliere un segmento", segment5XMList, 0, false);

	//If user has selected something and clicked "OK"
	if (itemSelected) {

		//Function call to load the gorups
		loadGroups();

		//Functin call to create all the account objects for the selected segment
		loadAccountsMap(Banana.document, itemSelected, accounts1, accounts2, file2);
				
		//Function call to print the report
		var report = printReport(Banana.document, itemSelected, accounts1, accounts2, file2);
		var stylesheet = createStyleSheet();
		Banana.Report.preview(report, stylesheet);
	}
}


//This function creates and print the report
function printReport(banDoc, itemSelected, tabAccounts1, tabAccounts2, file2) {

	var report = Banana.Report.newReport("5 per mille - Veneto");
	totalExpenses = "";
	totalIncome = "";

	/*
		PRINT LOGO
	*/
	report.addImage("Immagini/ministero_del_lavoro.png", "img alignCenter");
	report.addParagraph("Ministero del Lavoro e delle Politiche Sociali", "heading1 alignCenter italic bold");
	report.addParagraph("Direzione Generale per il Terzo Settore e le Formazioni Sociali", "heading2 alignCenter italic");
	report.addParagraph(" ");
	report.addParagraph(" ");


	/*
		PRINT TABLE "ANAGRAFICA"
	*/
	report.addParagraph("MODELLO PER IL RENDICONTO DELLE SOMME PERCEPITE IN VIRTÙ DEL BENEFICIO DEL 5 PER MILLE DELL'IRPEF DAGLI AVENTI DIRITTO", "heading3");
	report.addParagraph(" ");

	var tableAnagrafica = report.addTable("table");
	tableAnagrafica.getCaption().addText("ANAGRAFICA", "description bold");
	tableRow = tableAnagrafica.addRow();
	tableRow.addCell("Denominazione sociale", "", 1);
	tableRow.addCell(banDoc.info("AccountingDataBase", "Company"), "", 1);
	
	tableRow = tableAnagrafica.addRow();
	tableRow.addCell("Scopi dell'attività sociale", "", 1);
	var scopoAttivita = "";
	try {
		scopoAttivita = banDoc.table("TestiReport").findRowByValue("RowId", ":5XM-SCOPO").value("Testo");
	} catch(e) {
		banDoc.addMessage('Tabella TestiReport "Scopo attività sociale" (Id ":5XM-SCOPO") inesistente oppure nome non corretto.');
	}
	tableRow.addCell(scopoAttivita, "", 1);

	tableRow = tableAnagrafica.addRow();
	tableRow.addCell("C.F. del soggetto beneficiario", "", 1);
	tableRow.addCell(banDoc.info("AccountingDataBase", "FiscalNumber"), "", 1);

	tableRow = tableAnagrafica.addRow();
	tableRow.addCell("Indirizzo", "", 1);
	tableRow.addCell(banDoc.info("AccountingDataBase", "Address1"), "", 1);

	tableRow = tableAnagrafica.addRow();
	tableRow.addCell("Città", "", 1);
	tableRow.addCell(banDoc.info("AccountingDataBase", "City"), "", 1);

	tableRow = tableAnagrafica.addRow();
	tableRow.addCell("N. Telefono", "", 1);
	tableRow.addCell(banDoc.info("AccountingDataBase", "Phone"), "", 1);

	tableRow = tableAnagrafica.addRow();
	tableRow.addCell("N. Fax", "", 1);
	tableRow.addCell(banDoc.info("AccountingDataBase", "Fax"), "", 1);

	tableRow = tableAnagrafica.addRow();
	tableRow.addCell("Indirizzo email", "", 1);
	tableRow.addCell(banDoc.info("AccountingDataBase", "Email"), "", 1);

	tableRow = tableAnagrafica.addRow();
	tableRow.addCell("Nome del rappresentante legale", "", 1);
	var rappresentanteLegale = "";
	try {
		rappresentanteLegale = banDoc.table("TestiReport").findRowByValue("RowId", ":5XM-RAPP").value("Testo");
	} catch(e) {
		banDoc.addMessage('Tabella TestiReport "Nome rappresentante legale" (Id ":5XM-RAPP") inesistente oppure nome non corretto.');
	}
	tableRow.addCell(rappresentanteLegale, "", 1);

	tableRow = tableAnagrafica.addRow();
	tableRow.addCell("C.F. del rappresentante legale", "", 1);
	var cfRappresentanteLegale = "";
	try {
		cfRappresentanteLegale = banDoc.table("TestiReport").findRowByValue("RowId", ":5XM-RAPP-CF").value("Testo");
	} catch(e) {
		banDoc.addMessage('Tabella TestiReport "C.F. del rappresentante legale" (Id ":5XM-RAPP-CF") inesistente oppure nome non corretto.');
	}
	tableRow.addCell(cfRappresentanteLegale, "", 1);

	report.addParagraph(" ");



	/* 
		PRINT TABLE "RENDICONTO DELLE SPESE SOSTENUTE" 
	*/

	var thisYear = Banana.Converter.toDate(banDoc.info("AccountingDataBase","OpeningDate")).getFullYear();

	if (tabAccounts2) {
		var lastYear = Banana.Converter.toDate(file2.info("AccountingDataBase","OpeningDate")).getFullYear();
	}

	var table = report.addTable("table");
	table.getCaption().addText("RENDICONTO DELLE SPESE SOSTENUTE (" + banDoc.info("AccountingDataBase","BasicCurrency") +")", "description bold");
	tableRow = table.addRow();
	tableRow.addCell(getDescription(banDoc, itemSelected), "alignRight bold", 2);
	tableRow.addCell(itemSelected, "alignCenter bold", 1);
	tableRow = table.addRow();
	tableRow.addCell("Anno finanziario", "alignRight bold", 2);

	if (tabAccounts2) {
		tableRow.addCell(lastYear + "-" + thisYear, "alignCenter bold", 1);
	} else {
		tableRow.addCell(thisYear, "alignCenter bold", 1);
	}

	tableRow = table.addRow();
	tableRow.addCell("Data di percezione", "alignRight bold", 2);
	var dataPercezione = "";
	try {
		dataPercezione = banDoc.table("TestiReport").findRowByValue("RowId", ":5XM-DATA").value("Testo");
	} catch(e) {
		banDoc.addMessage('Tabella TestiReport "Data di percezione" (Id ":5XM-DATA") inesistente oppure nome non corretto.');
	}
	tableRow.addCell(dataPercezione, "alignCenter bold", 1);


	
	
	//Creation and print of the INCOME groups with all the details
	for (var i = 0; i < groups.length; i++) {
		var groupObj = getObject(groups, groups[i]["group"]);
		if (groupObj.gr1.substring(0,1) === "R" ) {
			createGroup(banDoc, itemSelected, tabAccounts1, tabAccounts2, groupObj, table, file2);
		}
	}

	tableRow = table.addRow();
	tableRow.addCell("IMPORTO PERCEPITO", "alignRight bold", 2);
	if (!banDoc.table("Categories")) {
		tableRow.addCell(Banana.Converter.toLocaleNumberFormat(Banana.SDecimal.invert(totalIncome)), "alignRight bold", 1);
	}
	else {
		tableRow.addCell(Banana.Converter.toLocaleNumberFormat(totalIncome), "alignRight bold", 1);
	}
	tableRow = table.addRow();
	tableRow.addCell(" ", "", 3);


	//Creation and print of the six EXPENSES groups with all the details
	for (var i = 0; i < groups.length; i++) {
		var groupObj = getObject(groups, groups[i]["group"]);
		if (groupObj.gr1.substring(0,1) !== "R" ) {
			createGroup(banDoc, itemSelected, tabAccounts1, tabAccounts2, groupObj, table, file2);
		}
	}
	
	//Add the final total
	tableRow = table.addRow();
	tableRow.addCell("TOTALE SPESE", "alignRight bold", 2);
	if (!banDoc.table("Categories")) {
		tableRow.addCell(Banana.Converter.toLocaleNumberFormat(totalExpenses), "alignRight bold", 1);
	}
	else {
		tableRow.addCell(Banana.Converter.toLocaleNumberFormat(Banana.SDecimal.invert(totalExpenses)), "alignRight bold", 1);
	}

	//Add the current date (DD-MM-YYYY)
	var date = new Date();
	report.addParagraph(" ");
   var dataPara = report.addParagraph("Data: " + Banana.Converter.toLocaleDateFormat(date));
   dataPara.excludeFromTest();

	//Add signature
	report.addParagraph(" ");
	report.addParagraph(" ");
	report.addParagraph("Firma del rappresentante legale", "alignCenter");

	//Add observations
	report.addParagraph(" ");
	report.addParagraph(" ");
	report.addParagraph(" ");
	report.addParagraph(" ");
	report.addParagraph("Il rappresentante legale, sottoscrittore del rendiconto, certifica che le informazioni contenute nel presente documento sono autentiche e veritiere, nella consapevolezza che, ai sensi degli artt. 47 e 76 del DPR 445/2000, chiunque rilasci dichiarazioni mendaci, formi atti falsi o ne faccia uso è punito ai sensi del codice penale e dalle leggi speciali in materia. Il rendiconto, inoltre, ai sensi dell’art. 46 del DPR 445/2000, deve essere corredato da copia semplice di un documento di identità in corso di validità del sottoscrittore.", "italic");

	//Add signature
	report.addParagraph(" ");
	report.addParagraph(" ");
	report.addParagraph("Firma del rappresentante legale", "alignCenter");

	report.addParagraph(" ");
	report.addParagraph(" ");
	report.addParagraph(" ");
	report.addParagraph(" ");
	report.addParagraph("Si precisa che il trattamento di dati personali è eseguito senza il consenso dell’interessato  in quanto trattasi di consenso obbligatorio previsto da norma di legge.", "italic");

	report.addParagraph(" ");
	report.addParagraph(" ");
	report.addParagraph("N.B. Si fa presente che è obbligatoria, per gli enti beneficiari del contributo, la redazione di una relazione in cui venga descritto in maniera analitica ed esaustiva l’utilizzo dei contributi percepiti. In particolar modo per le spese di personale eventualmente imputate, è necessario specificare per ciascun soggetto: il numero di ore imputate ed il costo orario di riferimento come indicato dalle relative tabelle ministeriali.", "bold underline");


	//Add a footer
	addFooter(report);

	return report;
}


//This function creates and print a whole group 
function createGroup(banDoc, itemSelected, tabAccounts1, tabAccounts2, groupObj, table, file2) {
	
	//Take the data from the given group
	var _group = groupObj.group;
	var _gr1 = groupObj.gr1;
	var _title = groupObj.title;
	var _text = groupObj.text;

	var arrGr = _gr1.split(";");
	
	var arrAcc = [];
	var arrAcc2 = [];
	var arrDesc = [];
	var arrTot = [];
	var total1 = "";
	var total2 = "";

	//Print group name and description
	if (_gr1.substring(0,1) === "R" ) {
		tableRow = table.addRow();
		tableRow.addCell(_group + ". " + "Entrate", "bold", 3);
	} else {
		tableRow = table.addRow();
		//tableRow.addCell(_group + ". " + _title, "bold", 3);

		var descriptionCell = tableRow.addCell("", "", 2);
		descriptionCell.addParagraph(_group + ". " + _title, "bold");
		descriptionCell.addParagraph(_text);
		tableRow.addCell("","",1);
	}

	//Check that the accountsMap is not empty, then use it to create the report
	if (Object.keys(accountsMap).length !== 0) {

		//We take the gr1 list of the principal group and, for each element, we check if it equals the gr1 of the account detalis
		//Do do that we need to pass all the "Accounts" table to get the account numbers and use them as key for the accountsMap
		//In the case the two gr1 are the same, we save the details values into the respective array

		for (var i = 0; i < arrGr.length; i++) {

			//File1 - We take accounts, description and total
			for (var j = 0; j < tabAccounts1.rowCount; j++) {
				var tRow = tabAccounts1.row(j);

				if (!banDoc.table("Categories")) {
					if (accountsMap[tRow.value("Account")] && accountsMap[tRow.value("Account")].gr1 === arrGr[i]) {
						arrAcc.push(tRow.value("Account"));
						arrDesc.push(accountsMap[tRow.value("Account")].description);
						arrTot.push(accountsMap[tRow.value("Account")].total);
					}
				} 
				else {
					if (accountsMap[tRow.value("Category")] && accountsMap[tRow.value("Category")].gr1 === arrGr[i]) {
						arrAcc.push(tRow.value("Category"));
						arrDesc.push(accountsMap[tRow.value("Category")].description);
						arrTot.push(accountsMap[tRow.value("Category")].total);
					}
				}
			}

			if (tabAccounts2) {
				//File2 - We take only accounts
				for (var j = 0; j < tabAccounts2.rowCount; j++) {
					var tRow = tabAccounts2.row(j);

					if (!banDoc.table("Categories")) {
						if (accountsMap[tRow.value("Account")] && accountsMap[tRow.value("Account")].gr1 === arrGr[i]) {
							arrAcc2.push(tRow.value("Account"));
						}
					}
					else {
						if (accountsMap[tRow.value("Category")] && accountsMap[tRow.value("Category")].gr1 === arrGr[i]) {
							arrAcc2.push(tRow.value("Category"));
						}
					}
				}
			}
		}



		//File1 - Print account details
		var str = "";
		for (var i = 0; i < arrAcc.length; i++) { //arrAcc, arrDesc, arrTot have the same length
			tableRow = table.addRow();
			tableRow.addCell(arrAcc[i], "alignCenter", 1);
			tableRow.addCell(arrDesc[i], "", 1);

			if (!banDoc.table("Categories")) {
				tableRow.addCell(Banana.Converter.toLocaleNumberFormat(arrTot[i]), "alignRight", 1);
			}
			else {
				tableRow.addCell(Banana.Converter.toLocaleNumberFormat(Banana.SDecimal.invert(arrTot[i])), "alignRight", 1);
			}
			
			//Build the string with the accounts number divided by the "|" to use the currentBalance() function
			str += arrAcc[i] + "|";
		}

		//File2 - Build the string with the accounts number divided by the "|" to use the currentBalance() function
		if (tabAccounts2) {
			var str2 = "";
			for (var i = 0; i < arrAcc2.length; i++) {
				str2 += arrAcc2[i] + "|";
			}
		}


		/** 
			Calculate the total of segments for both files
		**/
		//File1
		if (str) {
			var currentBal = banDoc.currentBalance(str + itemSelected, "", "");
			total1 = currentBal.total;
		}

		if (tabAccounts2) {
			//File2
			if (str2) {
				var currentBal2 = file2.currentBalance(str2 + itemSelected, "", "");
				total2 = currentBal2.total;
			}
		}


		/**
			Calculate and print the final total of a group using the values of the File1 and File2
		**/	
		tableRow = table.addRow();
		tableRow.addCell("Totale gruppo " + _group, "bold alignRight italic", 2);

		if (tabAccounts2) {
			var totF1F2 = Banana.SDecimal.add(total1, total2);
		} else {
			var totF1F2 = total1;
		}

		if (!banDoc.table("Categories")) {
			if (_gr1.substring(0,1) === "R") { //For INCOME values we invert the sign
				tableRow.addCell(Banana.Converter.toLocaleNumberFormat(Banana.SDecimal.invert(totF1F2)), "bold alignRight italic", 1);
			} else {
				tableRow.addCell(Banana.Converter.toLocaleNumberFormat(totF1F2), "bold alignRight italic", 1);
			}
		}
		else {
			if (_gr1.substring(0,1) === "R") { //For INCOME values we invert the sign
				tableRow.addCell(Banana.Converter.toLocaleNumberFormat(totF1F2), "bold alignRight italic", 1);
			} else {
				tableRow.addCell(Banana.Converter.toLocaleNumberFormat(Banana.SDecimal.invert(totF1F2)), "bold alignRight italic", 1);
			}
		}
	}

	//If the accountsMap is empty, then print the empty total group adding some spaces to adjust the alignment
	else {
		var total = "0";
		tableRow = table.addRow();
		tableRow.addCell("", "", 1);
		tableRow.addCell("                                          Totale gruppo " + _group, "bold alignRight italic", 1);

		if (!banDoc.table("Categories")) {
			tableRow.addCell(Banana.Converter.toLocaleNumberFormat(total1), "bold alignRight italic", 1);
		}
		else {
			tableRow.addCell(Banana.Converter.toLocaleNumberFormat(Banana.SDecimal.invert(total1)), "bold alignRight italic", 1);
		}
	}

	//Calculate the final Income and Expenses totals
	if (_gr1.substring(0,1) === "R") {
		totalIncome = Banana.SDecimal.add(totalIncome, totF1F2);
	} else {
		totalExpenses = Banana.SDecimal.add(totalExpenses, totF1F2);
	}
}


//This function, for the given segment and period, creates all the accounts objects
function loadAccountsMap(banDoc, segment, tabAccounts1, tabAccounts2, file2) {
	accountsMap = {};
	if (!banDoc.table("Categories")) {
		for (var i = 0; i < tabAccounts1.rowCount; i++) {
			var tRow = tabAccounts1.row(i);
			if (tRow.value("Account") &&
				tRow.value("Account").indexOf(":") < 0 && 
				tRow.value("Account").indexOf(".") < 0 && 
				tRow.value("Account").indexOf(",") < 0 && 
				tRow.value("Account").indexOf(";") < 0) {

				var currentBal = banDoc.currentBalance(tRow.value("Account") + segment, "", "");
				var total1 = currentBal.total;
				var amount1 = currentBal.amount;
			
				if (total1) {

					if (tabAccounts2) {

						for (var j = 0; j < tabAccounts2.rowCount; j++) {
							var tRow2 = tabAccounts2.row(j);
							if (tRow2.value("Account") === tRow.value("Account")) {

								var currentBal2 = file2.currentBalance(tRow2.value("Account") + segment, "", "");
								var total2 = currentBal2.total;
								var amount2 = currentBal2.amount;

								accountsMap[tRow.value("Account")] = {
									"description":tRow.value("Description"), 
									"gr1":tRow.value("Gr1"), 
									"total" : Banana.SDecimal.add(amount1, amount2)
								};
								//Banana.console.log("Account: " + tRow.value("Account") + ", [" + amount1 + " - " + amount2 + "]");
							}
						}

					} else {
						accountsMap[tRow.value("Account")] = {
							"description":tRow.value("Description"), 
							"gr1":tRow.value("Gr1"), 
							"total" : amount1
						};
					}
				}
			}
		}
	}
	else {
		for (var i = 0; i < tabAccounts1.rowCount; i++) {
			var tRow = tabAccounts1.row(i);
			if (tRow.value("Category") &&
				tRow.value("Category").indexOf(":") < 0 && 
				tRow.value("Category").indexOf(".") < 0 && 
				tRow.value("Category").indexOf(",") < 0 && 
				tRow.value("Category").indexOf(";") < 0) {

				var currentBal = banDoc.currentBalance(tRow.value("Category") + segment, "", "");
				var total1 = currentBal.total;
				var amount1 = currentBal.amount;
			
				if (total1) {

					if (tabAccounts2) {

						for (var j = 0; j < tabAccounts2.rowCount; j++) {
							var tRow2 = tabAccounts2.row(j);
							if (tRow2.value("Category") === tRow.value("Category")) {

								var currentBal2 = file2.currentBalance(tRow2.value("Category") + segment, "", "");
								var total2 = currentBal2.total;
								var amount2 = currentBal2.amount;

								accountsMap[tRow.value("Category")] = {
									"description":tRow.value("Description"), 
									"gr1":tRow.value("Gr1"), 
									"total" : Banana.SDecimal.add(amount1, amount2)
								};
								//Banana.console.log("Account: " + tRow.value("Account") + ", [" + amount1 + " - " + amount2 + "]");
							}
						}

					} else {
						accountsMap[tRow.value("Category")] = {
							"description":tRow.value("Description"), 
							"gr1":tRow.value("Gr1"), 
							"total" : amount1
						};
					}
				}
			}
		}
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


//This function take from Banana table 'Accounts/Categories'  all the 5XM segments
function getSegmentList(tabAccounts) {
	var arrList = [];
	if (Banana.document.table('Categories')) {
		for (var i = 0; i < Banana.document.table('Categories').rowCount; i++) {
			var tRow = Banana.document.table('Categories').row(i);
			if (tRow.value("Category").indexOf(":") == 0 && tRow.value("Category").indexOf("::") < 0 && tRow.value("Category").substring(1,2)) {
				arrList.push(tRow.value("Category"));
			}
		}
	}
	else {
		for (var i = 0; i < Banana.document.table('Accounts').rowCount; i++) {
			var tRow = Banana.document.table('Accounts').row(i);
			if (tRow.value("Account").indexOf(":") == 0 && tRow.value("Account").indexOf("::") < 0 && tRow.value("Account").substring(1,2)) {
				arrList.push(tRow.value("Account"));
			}
		}
	}
	return arrList;
}


//This function returns the description for a given segment
function getDescription(banDoc, segment) {
	if (!banDoc.table('Categories')) {
		for (var i = 0; i < banDoc.table('Accounts').rowCount; i++) {
			var tRow = banDoc.table('Accounts').row(i);
			if (tRow.value("Account") === segment) {
				return tRow.value("Description");
			}
		}
	}
	else {
		for (var i = 0; i < banDoc.table('Categories').rowCount; i++) {
			var tRow = banDoc.table('Categories').row(i);
			if (tRow.value("Category") === segment) {
				return tRow.value("Description");
			}
		}
	}
}


//This function adds a Footer to the report
function addFooter(report) {
   report.getFooter().addClass("footer");
   var versionLine = report.getFooter().addText("Banana Accounting 8" + " - ", "description");
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

	style = stylesheet.addStyle(".heading1");
	style.setAttribute("font-size", "20px");

	style = stylesheet.addStyle(".heading2");
	style.setAttribute("font-size", "16px");

	style = stylesheet.addStyle(".heading3");
	style.setAttribute("font-size", "11px");
	style.setAttribute("font-weight", "bold");

	style = stylesheet.addStyle(".bold");
	style.setAttribute("font-weight", "bold");

	style = stylesheet.addStyle(".italic");
	style.setAttribute("font-style", "italic");

	style = stylesheet.addStyle(".alignRight");
	style.setAttribute("text-align", "right");

	style = stylesheet.addStyle(".alignCenter");
	style.setAttribute("text-align", "center");

	style = stylesheet.addStyle(".underline");
	style.setAttribute("text-decoration", "underline");

	//Image style
	style = stylesheet.addStyle(".img");
	style.setAttribute("height", "60");
	style.setAttribute("width", "60");

	//Table style
	style = stylesheet.addStyle("table");
	style.setAttribute("width", "100%");
	style.setAttribute("font-size", "10px");
	stylesheet.addStyle("table.table td", "border: thin solid black");

	return stylesheet;
}
