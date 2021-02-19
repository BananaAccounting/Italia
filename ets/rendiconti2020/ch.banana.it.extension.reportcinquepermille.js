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
//
// @id = it.banana.app.reportcinquepermille
// @api = 1.0
// @pubdate = 2021-02-19
// @publisher = Banana.ch SA
// @description = 4. Report cinque per mille
// @task = app.command
// @doctype = 100.*;110.*;130.*
// @docproperties = 
// @outputformat = none
// @inputdatasource = none
// @timeout = -1
// @includejs = errors.js



/*	OLD CODES
	=========
	5XM 	: R2.7
	5XM_RU	: C1, C3.1, C3.2, C3.3
	5XM_FUN	: C2.1, C2.2, C5, C6.1, C8, C10
	5XM_B&S : C4, C6.2, C6.3, C7, C9, C11
	5XM_ERO : C12.2, C12.3,
	5XM_ALT : C12.1, C12.4, C13
	5XM_ACC : P2.2


	NEW CODES (old template)
	=========
	gruppo 0 => 5XM : RA5
	gruppo 1 => 5XM_RU	: CA4
	gruppo 2 => 5XM_FUN	: CA7, CA1, CA3, CD1, CD2, CD6, IM
	gruppo 3 => 5XM_B&S : CA2, CA5, CC2
	gruppo 4 => 5XM_ERO : CB1
	gruppo 5 => 5XM_ALT : CB7, CE7
	gruppo 6 => 5XM_ACC : PB3


	
	NEW CODES (new template)
	=========
	gruppo 0, Entrate da 5xmille	   => 5XM 	  : RA5
	gruppo 1, Risorse umane			   => 5XM_RU  : CA4, CB4, CE4
	gruppo 2, Costi di funzionamento   => 5XM_FUN : CA1, CA3, CA7, CA8, CD1, CD2, CD3, CD4, CD6, IM, CG1
	gruppo 3, Acquisto beni e servizi  => 5XM_B&S : CA2, CA5, CB2, CB3, CB5, CE2, CE3, CE5, CC1, CC2, CC3
	gruppo 4, Erogazioni 			   => 5XM_ERO : CB1
	gruppo 5, Altre voci di spesa 	   => 5XM_ALT : CB7, CB8, CE1, CE7, CG2
	gruppo 6, Accantonamento           => 5XM_ACC : CA6, CB6, CD5, CE6

*/

var BAN_VERSION = "10.0.1";
var BAN_EXPM_VERSION = "";

var totalExpenses = "";
var totalIncome = "";
var accountsMap = {};
var groups = [];


//The purpose of this function is to create and load the structure that will contains all the data used to create the report
function loadGroups() {
	groups = [];
	groups.push({"group":"0", "gr1":"RA5"});
	groups.push({"group":"1", "gr1":"CA4;CB4;CE4", "title":"Risorse umane", "text":"(dettagliare i costi a seconda della causale, per esempio: compensi per personale; rimborsi spesa a favore di volontari e/o del personale). N.B. nel caso in cui i compensi per il personale superano il 50% dell’importo percepito è obbligatorio per le associazioni allegare copia delle buste paga del personale imputato fino alla concorrenza dell’importo rendicontato"});
	groups.push({"group":"2", "gr1":"CA1;CA3;CA7;CA8;CD1;CD2;CD3;CD4;CD6;IM;CG1","title":"Costi di funzionamento", "text":"(dettagliare i costi a seconda della causale, per esempio: spese di acqua, gas, elettricità, pulizia; materiale di cancelleria; spese per affitto delle sedi; ecc…)"});
	groups.push({"group":"3", "gr1":"CA2;CA5;CB2;CB3;CB5;CE2;CE3;CE5;CC1;CC2;CC3", "title":"Acquisto beni e servizi", "text":"(dettagliare i costi a seconda della causale, per esempio: acquisto e/o noleggio apparecchiature informatiche; acquisto beni immobili; prestazioni eseguite da soggetti esterni all’ente; affitto locali per eventi; ecc…)"});
	groups.push({"group":"4", "gr1":"CB1", "title":"Erogazioni ai sensi della propria finalità istituzionale", "text":"N.B. in caso di erogazioni liberali ad altri enti/soggetti, anche esteri, è obbligatorio allegare copia del bonifico effettuato"});
	groups.push({"group":"5", "gr1":"CB7;CB8;CE1;CE7;CG2", "title":"Altre voci di spesa riconducibili al raggiungimento dello scopo sociale", "text":""});
	groups.push({"group":"6", "gr1":"CA6;CB6;CD5;CE6", "title":"Accantonamento", "text":"(è possibile accantonare in tutto o in parte l’importo percepito, fermo restando che l’Ente beneficiario deve specificare nella relazione allegata al presente documento le finalità dell’accantonamento effettuato ed allegare il verbale del Consiglio di Amministrazione in cui viene deliberato l’accantonamento. Si fa presente, comunque, l’obbligo di spendere tutte le somme accantonate e rinviare il presente modello entro 24 mesi dalla percezione del contributo)"});
}

//Main function
function exec(string) {
	
	//Check if we are on an opened document
	if (!Banana.document) {
		return;
	}

	//Check banana version
	var isCurrentBananaVersionSupported = bananaRequiredVersion(BAN_VERSION, BAN_EXPM_VERSION);
	if (!isCurrentBananaVersionSupported) {
		return "@Cancel";
	}


	/**
	 * File 1, current year.
	 * For double accounting, get the Accounts table of the current opened file.
	 * For simple accounting, get the Categories table of the current opened file.
	 * Retrieve all the 5XM segments from that table.
	 */
	var accounts1 = "";
	if (!Banana.document.table("Categories")) {
		accounts1 = Banana.document.table("Accounts");
	} else {
		accounts1 = Banana.document.table("Categories");
	}
	var segment5XMList = getSegmentList(accounts1);


	/**
	 * User parameters
	 */
	var userParam = initUserParam();
	var savedParam = Banana.document.getScriptSettings();
	if (savedParam && savedParam.length > 0) {
		userParam = JSON.parse(savedParam);
	}
	// If needed show the settings dialog to the user
	if (!options || !options.useLastSettings) {
		userParam = settingsDialog(segment5XMList); // From properties
	}
	if (!userParam) {
		return "@Cancel";
	}


	/**
	 * File 2, previous year, selection.
	 * For double accounting, get the Accounts table of the previous file.
	 * For simple accounting, get the Categories table of the previous file.
	 */
	var accounts2 = "";
	var file2 = "";
	if (userParam.fileAnnoPrecedente) {
		file2 = Banana.application.openDocument("*.*");
		if (!file2) {
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


	/**
	 * Generate the report for the selected 5XM segment.
	 */
	if (userParam.segment5XM) {

		//Load the gorups
		loadGroups();

		//Create all the account objects for the selected segment
		loadAccountsMap(Banana.document, userParam, accounts1, accounts2, file2);
				
		//Create the report
		var report = printReport(Banana.document, userParam, accounts1, accounts2, file2);
		
		//Create the stylesheet using the css file
		var stylesheet = Banana.Report.newStyleSheet();
		setCss(Banana.document, stylesheet);

		//Create the report preview
		Banana.Report.preview(report, stylesheet);

	}
}

//This function creates and print the report
function printReport(banDoc, userParam, tabAccounts1, tabAccounts2, file2) {

	var report = Banana.Report.newReport("Rendiconto 5 per mille");
	totalExpenses = "";
	totalIncome = "";

	/*
		PRINT LOGO
	*/
	report.addImage("images/ministero_del_lavoro.png", "img alignCenter");
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
	tableRow.addCell(userParam.scopoAttivita, "", 1);

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
	tableRow.addCell(userParam.rappresentanteLegale, "", 1);

	tableRow = tableAnagrafica.addRow();
	tableRow.addCell("C.F. del rappresentante legale", "", 1);
	tableRow.addCell(userParam.cfRappresentanteLegale, "", 1);

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
	tableRow.addCell(getDescription(banDoc, userParam.segment5XM), "alignRight bold", 2);
	tableRow.addCell(userParam.segment5XM, "alignCenter bold", 1);
	tableRow = table.addRow();
	tableRow.addCell("Anno finanziario", "alignRight bold", 2);

	if (tabAccounts2) {
		tableRow.addCell(lastYear + "-" + thisYear, "alignCenter bold", 1);
	} else {
		tableRow.addCell(thisYear, "alignCenter bold", 1);
	}

	tableRow = table.addRow();
	tableRow.addCell("Data di percezione", "alignRight bold", 2);
	tableRow.addCell(userParam.dataPercezione, "alignCenter bold", 1);


	
	
	//Creation and print of the INCOME groups with all the details
	for (var i = 0; i < groups.length; i++) {
		var groupObj = getObject(groups, groups[i]["group"]);
		if (groupObj.gr1.substring(0,1) === "R" ) {
			createGroup(banDoc, userParam.segment5XM, tabAccounts1, tabAccounts2, groupObj, table, file2);
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
			createGroup(banDoc, userParam.segment5XM, tabAccounts1, tabAccounts2, groupObj, table, file2);
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
		//To do that we need to pass all the "Accounts" table to get the account numbers and use them as key for the accountsMap
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
function loadAccountsMap(banDoc, userParam, tabAccounts1, tabAccounts2, file2) {
	accountsMap = {};
	if (!banDoc.table("Categories")) {
		for (var i = 0; i < tabAccounts1.rowCount; i++) {
			var tRow = tabAccounts1.row(i);
			if (tRow.value("Account") &&
				!tRow.value("Account").startsWith(":") && 
				!tRow.value("Account").startsWith(".") && 
				!tRow.value("Account").startsWith(",") && 
				!tRow.value("Account").startsWith(";")) {

				var currentBal = banDoc.currentBalance(tRow.value("Account") + userParam.segment5XM, "", "");
				var total1 = currentBal.total;
				var amount1 = currentBal.amount;
			
				if (total1) {

					if (tabAccounts2) {

						for (var j = 0; j < tabAccounts2.rowCount; j++) {
							var tRow2 = tabAccounts2.row(j);
							if (tRow2.value("Account") === tRow.value("Account")) {

								var currentBal2 = file2.currentBalance(tRow2.value("Account") + userParam.segment5XM, "", "");
								var total2 = currentBal2.total;
								var amount2 = currentBal2.amount;

								accountsMap[tRow.value("Account")] = {
									"description":tRow.value("Description"), 
									"gr1":tRow.value(userParam.colonnaRaggruppamento), 
									"total" : Banana.SDecimal.add(amount1, amount2)
								};
								//Banana.console.log("Account: " + tRow.value("Account") + ", [" + amount1 + " - " + amount2 + "]");
							}
						}

					} else {
						accountsMap[tRow.value("Account")] = {
							"description":tRow.value("Description"), 
							"gr1":tRow.value(userParam.colonnaRaggruppamento), 
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
				!tRow.value("Category").startsWith(":") && 
				!tRow.value("Category").startsWith(".") && 
				!tRow.value("Category").startsWith(",") && 
				!tRow.value("Category").startsWith(";")) {

				var currentBal = banDoc.currentBalance(tRow.value("Category") + userParam.segment5XM, "", "");
				var total1 = currentBal.total;
				var amount1 = currentBal.amount;
			
				if (total1) {

					if (tabAccounts2) {

						for (var j = 0; j < tabAccounts2.rowCount; j++) {
							var tRow2 = tabAccounts2.row(j);
							if (tRow2.value("Category") === tRow.value("Category")) {

								var currentBal2 = file2.currentBalance(tRow2.value("Category") + userParam.segment5XM, "", "");
								var total2 = currentBal2.total;
								var amount2 = currentBal2.amount;

								accountsMap[tRow.value("Category")] = {
									"description":tRow.value("Description"), 
									"gr1":tRow.value(userParam.colonnaRaggruppamento), 
									"total" : Banana.SDecimal.add(amount1, amount2)
								};
								//Banana.console.log("Account: " + tRow.value("Account") + ", [" + amount1 + " - " + amount2 + "]");
							}
						}

					} else {
						accountsMap[tRow.value("Category")] = {
							"description":tRow.value("Description"), 
							"gr1":tRow.value(userParam.colonnaRaggruppamento), 
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

//The main purpose of this function is to create styles for the report print
function setCss(banDoc, repStyleObj) {
   var textCSS = "";
   var file = Banana.IO.getLocalFile("file:script/rendiconto5xMille.css");
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
function convertParam(userParam, segment5XMList) {

	var convertedParam = {};
	convertedParam.version = '1.0';
	convertedParam.data = [];


	var currentParam = {};
	currentParam.name = 'anagrafica';
	currentParam.parentObject = '';
	currentParam.title = 'Anagrafica';
	currentParam.type = 'string';
	currentParam.value = '';
	currentParam.editable = false;
	currentParam.readValue = function() {
		userParam.anagrafica = this.value;
	}
	convertedParam.data.push(currentParam);

	var currentParam = {};
	currentParam.name = 'scopoAttivita';
	currentParam.parentObject = 'anagrafica';
	currentParam.title = "Scopo dell'attività sociale";
	currentParam.type = 'string';
	currentParam.value = userParam.scopoAttivita ? userParam.scopoAttivita : '';
	currentParam.defaultvalue = "Sostenere e qualificare l'attività di volontariato";
	currentParam.readValue = function() {
	  userParam.scopoAttivita = this.value;
	}
	convertedParam.data.push(currentParam);

	var currentParam = {};
	currentParam.name = 'rappresentanteLegale';
	currentParam.parentObject = 'anagrafica';
	currentParam.title = 'Nome del rappresentante legale';
	currentParam.type = 'string';
	currentParam.value = userParam.rappresentanteLegale ? userParam.rappresentanteLegale : '';
	currentParam.defaultvalue = 'Sig. Mario Rossi';
	currentParam.readValue = function() {
	  userParam.rappresentanteLegale = this.value;
	}
	convertedParam.data.push(currentParam);

	var currentParam = {};
	currentParam.name = 'cfRappresentanteLegale';
	currentParam.parentObject = 'anagrafica';
	currentParam.title = 'Codice fiscale del rappresentante legale';
	currentParam.type = 'string';
	currentParam.value = userParam.cfRappresentanteLegale ? userParam.cfRappresentanteLegale : '';
	currentParam.defaultvalue = '123456789';
	currentParam.readValue = function() {
	  userParam.cfRappresentanteLegale = this.value;
	}
	convertedParam.data.push(currentParam);

	var currentParam = {};
	currentParam.name = 'rendiconto';
	currentParam.parentObject = '';
	currentParam.title = 'Rendiconto spese';
	currentParam.type = 'string';
	currentParam.value = '';
	currentParam.editable = false;
	currentParam.readValue = function() {
		userParam.rendiconto = this.value;
	}
	convertedParam.data.push(currentParam);

	var currentParam = {};
	currentParam.name = 'colonnaRaggruppamento';
	currentParam.parentObject = 'rendiconto';
	currentParam.title = "Colonna raggruppamento (nome XML colonna)";
	currentParam.type = 'string';
	currentParam.value = userParam.colonnaRaggruppamento ? userParam.colonnaRaggruppamento : 'Gr1';
	currentParam.defaultvalue = 'Gr1';
	currentParam.readValue = function() {
	  userParam.colonnaRaggruppamento = this.value;
	}
	convertedParam.data.push(currentParam);

	var currentParam = {};
	currentParam.name = 'fileAnnoPrecedente';
	currentParam.parentObject = 'rendiconto';
	currentParam.title = 'Includere file anno precedente';
	currentParam.type = 'bool';
	currentParam.value = userParam.fileAnnoPrecedente ? true : false;
	currentParam.defaultvalue = false;
	currentParam.readValue = function() {
	  userParam.fileAnnoPrecedente = this.value;
	}
	convertedParam.data.push(currentParam);

	var currentParam = {};
	currentParam.name = 'segment5XM';
	currentParam.parentObject = 'rendiconto';
	currentParam.title = "Segmento 5XM";
	currentParam.type = 'combobox';
	currentParam.items = segment5XMList;
	currentParam.value = userParam.segment5XM ? userParam.segment5XM : '';
	currentParam.readValue = function () {
		userParam.segment5XM = this.value;
	}
	convertedParam.data.push(currentParam);

	var currentParam = {};
	currentParam.name = 'dataPercezione';
	currentParam.parentObject = 'rendiconto';
	currentParam.title = 'Data di percezione';
	currentParam.type = 'string';
	currentParam.value = userParam.dataPercezione ? userParam.dataPercezione : '';
	currentParam.defaultvalue = '31.12.2020';
	currentParam.readValue = function() {
	  userParam.dataPercezione = this.value;
	}
	convertedParam.data.push(currentParam);

	return convertedParam;
}

function initUserParam(segment5XMList) {
   var userParam = {};
   userParam.scopoAttivita = "Sostenere e qualificare l'attività di volontariato";
   userParam.rappresentanteLegale = "Sig. Mario Rossi";
   userParam.cfRappresentanteLegale = "123456789";
   userParam.dataPercezione = "31.12.2020";
   userParam.colonnaRaggruppamento = "Gr1";
   userParam.fileAnnoPrecedente = false;
   userParam.segment5XM = segment5XMList;
   return userParam;
}

function parametersDialog(userParam, segment5XMList) {
	if (typeof(Banana.Ui.openPropertyEditor) !== 'undefined') {
		var dialogTitle = "Parametri report 5 x mille";
		var convertedParam = convertParam(userParam, segment5XMList);
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

function settingsDialog(segment5XMList) {
	var userParam = initUserParam();
	var savedParam = Banana.document.getScriptSettings();
	if (savedParam && savedParam.length > 0) {
		userParam = JSON.parse(savedParam);
	}

   /**

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
	*/

	userParam = parametersDialog(userParam,segment5XMList); // From propertiess
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
   else {
		if (Banana.application.license) {
			if (Banana.application.license.licenseType === "professional" || Banana.application.license.licenseType === "advanced") {
				return true;
			}
			else {
				Banana.application.showMessages();
				Banana.document.addMessage(getErrorMessage(ID_ERR_LICENZA_PROFESSIONAL));				
				return false;
			}
		}
   }
}
