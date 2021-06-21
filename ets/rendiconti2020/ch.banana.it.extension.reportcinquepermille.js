// Copyright [2021] [Banana.ch SA - Lugano Switzerland]
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
// @pubdate = 2021-06-02
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


	Info:
	https://www.agenziaentrate.gov.it/portale/area-tematica-5x1000
	https://www.lavoro.gov.it/temi-e-priorita/Terzo-settore-e-responsabilita-sociale-imprese/Pagine/Modulistica.aspx

	Modello fac-simile 2021:
	https://www.lavoro.gov.it/strumenti-e-servizi/Modulistica/Documents/5%20per%20mille,%20richiesta%20di%20reiscrizione/Modello-rendiconto-5-per-mille.pdf



*/

let BAN_VERSION = "10.0.1";
let BAN_EXPM_VERSION = "";

let totalIncome = "";
let totalExpenses = "";

//The purpose of this function is to create and load the structure that will contains all the data used to create the report
function loadReportGroups() {
	let reportGroups = [];
	reportGroups.push({"group":"0", "income":true, "gr1":"RA5"});
	reportGroups.push({"group":"1", "income":false, "gr1":"CA4;CB4;CE4", "title":"Risorse umane", "text":"(dettagliare i costi a seconda della causale, per esempio: compensi per personale; rimborsi spesa a favore di volontari e/o del personale). N.B. nel caso in cui i compensi per il personale superano il 50% dell’importo percepito è obbligatorio per le associazioni allegare copia delle buste paga del personale imputato fino alla concorrenza dell’importo rendicontato."});
	reportGroups.push({"group":"2", "income":false, "gr1":"CA1;CA3;CA7;CA8;CD1;CD2;CD3;CD4;CD6;IM;CG1","title":"Costi di funzionamento", "text":"(dettagliare i costi a seconda della causale, per esempio: spese di acqua, gas, elettricità, pulizia; materiale di cancelleria; spese per affitto delle sedi; ecc...)"});
	reportGroups.push({"group":"3", "income":false, "gr1":"CA2;CA5;CB2;CB3;CB5;CE2;CE3;CE5;CC1;CC2;CC3", "title":"Acquisto beni e servizi", "text":"(dettagliare i costi a seconda della causale, per esempio: acquisto e/o noleggio apparecchiature informatiche; acquisto beni immobili; prestazioni eseguite da soggetti esterni all’ente; affitto locali per eventi; ecc...)"});
	reportGroups.push({"group":"4", "income":false, "gr1":"CB1", "title":"Erogazioni ai sensi della propria finalità istituzionale", "text":"(N.B. In caso di erogazioni liberali in favore di altri enti/soggetti è obbligatorio allegare copia del bonifico effettuato)"});
	reportGroups.push({"group":"5", "income":false, "gr1":"CB7;CB8;CE1;CE7;CG2", "title":"Altre voci di spesa connesse alla realizzazione di attività direttamente riconducibili alle finalità e agli scopi istituzionali del soggetto beneficiario", "text":""});
	reportGroups.push({"group":"6", "income":false, "gr1":"CA6;CB6;CD5;CE6", "title":"Accantonamento", "text":"(è possibile accantonare in tutto o in parte l’importo percepito, fermo restando per il soggetto beneficiario l’obbligo di specificare nella relazione allegata al presente documento le finalità dell’accantonamento allegando il verbale dell’organo direttivo che abbia deliberato l’accantonamento. Il soggetto beneficiario è tenuto ad utilizzare le somme accantonate e a rinviare il presente modello entro 24 mesi dalla percezione del contributo)"});
	return reportGroups;
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
	 * Current year file.
	 * For double accounting, get the Accounts table of the current opened file.
	 * For simple accounting, get the Categories table of the current opened file.
	 * Retrieve all the 5XM segments from that table.
	 */
	var accounts = "";
	if (!Banana.document.table("Categories")) {
		accounts = Banana.document.table("Accounts");
	} else {
		accounts = Banana.document.table("Categories");
	}
	var segment5XMList = getSegmentList(accounts);


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
	 * Last year file selection.
	 */
	let fileLastYear = "";
	if (userParam.fileAnnoPrecedente) {
		fileLastYear = Banana.application.openDocument("*.*");
		if (!fileLastYear) {
			return;
		}
	}


	/**
	 * Generate the report for the selected 5XM segment.
	 */
	if (userParam.segment5XM) {

		//Load the report gorups with gr1 codes and texts.
		let reportGroups = loadReportGroups();

		//Create all the accounts objects for current year and last year.
		let accountsMap = {};
		loadAccountsMap(Banana.document, userParam, accountsMap);
		if (fileLastYear) {
			loadAccountsMap(fileLastYear, userParam, accountsMap);
		}
				
		//Create the report
		let report = printReport(Banana.document, fileLastYear, userParam, reportGroups, accountsMap);
		
		//Create the stylesheet using the css file
		let stylesheet = Banana.Report.newStyleSheet();
		setCss(Banana.document, stylesheet);

		//Create the report preview
		Banana.Report.preview(report, stylesheet);
	}
}

// Funzione che stampa il report.
function printReport(banDoc, fileLastYear, userParam, reportGroups, accountsMap) {
	let report = Banana.Report.newReport("Rendiconto 5 per mille");

	printReport_Header(report, banDoc, userParam);
	printReport_Rendiconto(report, banDoc, fileLastYear, userParam, reportGroups, accountsMap);
	printReport_Finale(report, banDoc, userParam);
	printReport_Footer(report);

	return report;
}

// Funzione che stampa l'intestazione.
function printReport_Header(report, banDoc, userParam) {
	/*
		PRINT LOGO
	*/
	var headerParagraph = report.getHeader();
	headerParagraph.addImage("images/ministero_del_lavoro.png", "img alignCenter");
	headerParagraph.addParagraph(" ");
	headerParagraph.addParagraph(" ");


	/*
		PRINT TABLE "ANAGRAFICA"
	*/
	report.addParagraph("RENDICONTO DEGLI IMPORTI DEL “5 PER MILLE DELL’IRPEF” PERCEPITI DAGLI AVENTI DIRITTO", "heading alignCenter");
	report.addParagraph(" ");

	var tableAnagrafica = report.addTable("tableAnagrafica");
	var col1Anagrafica = tableAnagrafica.addColumn("col1Anagrafica");
	var col2Anagrafica = tableAnagrafica.addColumn("col2Anagrafica");

	tableAnagrafica.getCaption().addText("ANAGRAFICA", "description bold");

	tableRow = tableAnagrafica.addRow();
	tableRow.addCell("Denominazione sociale", "", 1);
	tableRow.addCell(banDoc.info("AccountingDataBase", "Company"), "", 1);
	
	tableRow = tableAnagrafica.addRow();
	tableRow.addCell("Scopi dell'attività sociale", "", 1);
	tableRow.addCell(userParam.scopoAttivita, "", 1);

	tableRow = tableAnagrafica.addRow();
	tableRow.addCell("C.F. dell'Ente", "", 1);
	tableRow.addCell(banDoc.info("AccountingDataBase", "FiscalNumber"), "", 1);

	tableRow = tableAnagrafica.addRow();
	tableRow.addCell("Città", "", 1);
	tableRow.addCell(banDoc.info("AccountingDataBase", "City"), "", 1);

	tableRow = tableAnagrafica.addRow();
	tableRow.addCell("Provincia", "", 1);
	tableRow.addCell(userParam.provincia, "", 1);

	tableRow = tableAnagrafica.addRow();
	tableRow.addCell("CAP", "", 1);
	tableRow.addCell(banDoc.info("AccountingDataBase", "Zip"), "", 1);

	tableRow = tableAnagrafica.addRow();
	tableRow.addCell("Via", "", 1);
	tableRow.addCell(banDoc.info("AccountingDataBase", "Address1"), "", 1);

	tableRow = tableAnagrafica.addRow();
	tableRow.addCell("Telefono", "", 1);
	tableRow.addCell(banDoc.info("AccountingDataBase", "Phone"), "", 1);

	tableRow = tableAnagrafica.addRow();
	tableRow.addCell("Fax", "", 1);
	tableRow.addCell(userParam.fax, "", 1);

	tableRow = tableAnagrafica.addRow();
	tableRow.addCell("Email", "", 1);
	tableRow.addCell(banDoc.info("AccountingDataBase", "Email"), "", 1);

	tableRow = tableAnagrafica.addRow();
	tableRow.addCell("PEC", "", 1);
	tableRow.addCell(userParam.pec, "", 1);

	tableRow = tableAnagrafica.addRow();
	tableRow.addCell("Nome del rappresentante legale", "", 1);
	tableRow.addCell(userParam.rappresentanteLegale, "", 1);

	tableRow = tableAnagrafica.addRow();
	tableRow.addCell("C.F. del rappresentante legale", "", 1);
	tableRow.addCell(userParam.cfRappresentanteLegale, "", 1);

	report.addParagraph(" ");
}

// Funzione che stampa il rendiconto.
function printReport_Rendiconto(report, banDoc, fileLastYear, userParam, reportGroups, accountsMap) {
	/* 
		PRINT TABLE "RENDICONTO DELLE SPESE SOSTENUTE" 
	*/

	totalIncome = "";
	totalExpenses = "";

	let thisYear = Banana.Converter.toDate(banDoc.info("AccountingDataBase","OpeningDate")).getFullYear();
	let lastYear = "";
	if (fileLastYear) {
		lastYear = Banana.Converter.toDate(fileLastYear.info("AccountingDataBase","OpeningDate")).getFullYear();
	}

	let annofinanziario = "";
	if (fileLastYear) {
		annofinanziario = lastYear + "-" + thisYear;
	} else {
		annofinanziario = thisYear;
	}
	report.addParagraph("RENDICONTO ANNO FINANZIARIO " + annofinanziario, "description bold");

	let table = report.addTable("table");
	let col1Table = table.addColumn("col1Table");
	let col2Table = table.addColumn("col2Table");
	let col3Table = table.addColumn("col3Table");
	let col4Table = table.addColumn("col4Table");
	
	tableRow = table.addRow();
	tableRow.addCell(getDescription(banDoc, userParam.segment5XM), "", 3);
	tableRow.addCell(userParam.segment5XM, "alignRight bold", 1);

	tableRow = table.addRow();
	tableRow.addCell("Data di percezione del contributo", "", 3);
	tableRow.addCell(userParam.dataPercezione, "alignRight bold", 1);

	tableRow = table.addRow();
	tableRow.addCell(" ", "", 4);

	tableRow = table.addRow();

	//Creation and print of the INCOME groups with all the details
	for (var i = 0; i < reportGroups.length; i++) {
		var groupObj = getObject(reportGroups, reportGroups[i]["group"]);
		if (groupObj.income) {
			printReport_Rendiconto_createGroup(banDoc, groupObj, table, accountsMap);
		}
	}

	tableRow = table.addRow();
	tableRow.addCell("IMPORTO PERCEPITO", "alignRight bold total", 3);
	tableRow.addCell("€ " + Banana.Converter.toLocaleNumberFormat(totalIncome), "alignRight bold total", 1);
	// tableRow = table.addRow();
	// tableRow.addCell(" ", "", 4);


	//Creation and print of the six EXPENSES groups with all the details
	for (var i = 0; i < reportGroups.length; i++) {
		var groupObj = getObject(reportGroups, reportGroups[i]["group"]);
		if (!groupObj.income) {
			printReport_Rendiconto_createGroup(banDoc, groupObj, table, accountsMap);
		}
	}
	
	//Add the final total
	tableRow = table.addRow();
	tableRow.addCell("TOTALE SPESE", "alignRight bold total", 3);
	tableRow.addCell("€ " + Banana.Converter.toLocaleNumberFormat(totalExpenses), "alignRight bold total", 1);
}

// Funzione che stampa la parte finale del report.
function printReport_Finale(report, banDoc, userParam) {

	report.addParagraph(" ");
	report.addParagraph(" ");
	report.addParagraph("I soggetti beneficiari sono tenuti a redigere, oltre al presente rendiconto, una relazione che dettagli i costi inseriti e sostenuti ed illustri in maniera analitica ed esaustiva l’utilizzo del contributo percepito.", "bold alignJustify border");
	report.addParagraph(" ");

	var date = "";
	if (userParam.dataDocumento) {
		date = userParam.dataDocumento;
	} else {
		date = Banana.Converter.toLocaleDateFormat(new Date()); // current date (DD-MM-YYYY)
	}
	report.addParagraph(" ");
	var dataPara = report.addParagraph("Data: " + date);
	dataPara.excludeFromTest();


	//Add signature
	report.addParagraph(" ");
	report.addParagraph("________________________________________________", "alignCenter");
	report.addParagraph("Firma del rappresentante legale", "alignCenter");

	//Add observations
	report.addParagraph(" ");
	report.addParagraph(" ");
	report.addParagraph(" ");
	report.addParagraph(" ");
	report.addParagraph("Il rappresentante legale, con la sottoscrizione del presente rendiconto, attesta l’autenticità delle informazioni contenute nel presente documento e la loro integrale rispondenza con quanto riportato nelle scritture contabili dell’organizzazione, consapevole che, ai sensi degli articoli 47 e 76 del d.P.R. n. 445/2000, chiunque rilasci dichiarazioni mendaci, formi atti falsi ovvero ne faccia uso è punito ai sensi del codice penale e dalle leggi speciali in materia.", "alignJustify");
	report.addParagraph("Il presente rendiconto, inoltre, ai sensi dell’articolo 46 del citato d.P.R. n. 445/2000, deve essere corredato da copia semplice di un documento di identità in corso di validità del soggetto che lo abbia sottoscritto.", "alignJustify");

	//Add signature
	report.addParagraph(" ");
	report.addParagraph(" ");
	report.addParagraph(" ");
	report.addParagraph("________________________________________________", "alignCenter");
	report.addParagraph("Firma del rappresentante legale", "alignCenter");

}

function printReport_Footer(report) {
	report.getFooter().addClass("footer");
	report.getFooter().addText("-", "");
	report.getFooter().addFieldPageNr();
	report.getFooter().addText("-", "");
}

// Funzione che crea e stampa il gruppo e tutte le categorie/conti che appartengono al gruppo.
function printReport_Rendiconto_createGroup(banDoc, groupObj, table, accountsMap) {
	
	//Take the data from the given group
	var _group = groupObj.group;
	var _title = groupObj.title;
	var _text = groupObj.text;

	var arrGr = groupObj.gr1.split(";");
	
	var arrAcc = [];
	var arrDesc = [];
	var arrTot = [];
	let total = "";

	//Print group name and description
	if (groupObj.income) {
		tableRow = table.addRow();
		tableRow.addCell(_group + ". " + "Entrate", "bold borderTop", 4);
	} else {
		tableRow = table.addRow();
		var descriptionCell = tableRow.addCell("", "borderTop", 3);
		descriptionCell.addParagraph(_group + ". " + _title, "bold");
		descriptionCell.addParagraph(_text);
		tableRow.addCell("","borderTop",1);
	}

	//Check that the accountsMap is not empty, then use it to create the report
	if (Object.keys(accountsMap).length !== 0) {
		
		//We take the gr1 list of the principal group and, for each element, we check if it equals the gr1 of the account detalis
		//To do that we need to pass all the "Accounts" table to get the account numbers and use them as key for the accountsMap
		//In the case the two gr1 are the same, we save the details values into the respective array

		for (var i = 0; i < arrGr.length; i++) {

			for (const account in accountsMap) {
				
				if (accountsMap[account].gr1 === arrGr[i]) {
					arrAcc.push(account);
					arrDesc.push(accountsMap[account].description);
					arrTot.push(accountsMap[account].total);
					// Banana.console.log(account + "; " + accountsMap[account].total);	
				}
			}
		}

		//Print account details
		for (let i = 0; i < arrAcc.length; i++) { //arrAcc, arrDesc, arrTot have the same length
			
			let tmpAmount = arrTot[i];
			if (groupObj.income) {
				if (!banDoc.table("Categories")) {
					tmpAmount = Banana.SDecimal.invert(tmpAmount);
				}
				totalIncome = Banana.SDecimal.add(totalIncome, tmpAmount);
			}
			else {
				if (banDoc.table("Categories")) {
					tmpAmount = Banana.SDecimal.invert(tmpAmount);
				}
				totalExpenses = Banana.SDecimal.add(totalExpenses, tmpAmount);
			}

			total = Banana.SDecimal.add(total, tmpAmount);

			tableRow = table.addRow();
			tableRow.addCell(" ","",1);
			tableRow.addCell(arrAcc[i], "details", 1);
			tableRow.addCell(arrDesc[i], "details", 1);
			tableRow.addCell("€ " + Banana.Converter.toLocaleNumberFormat(tmpAmount), "alignRight details", 1);
		}

		/**
			Calculate and print the final total of a group using the values of the File1 and File2
		**/	
		tableRow = table.addRow();
		tableRow.addCell("Totale gruppo " + _group, "bold alignRight italic", 3);
		tableRow.addCell("€ " + Banana.Converter.toLocaleNumberFormat(total), "bold alignRight italic", 1);
	}

	//If the accountsMap is empty, then print the empty total group adding some spaces to adjust the alignment
	else {

		let tmpTotal = total;
		if (banDoc.table("Categories")) {
			tmpTotal = Banana.SDecimal.invert(tmpTotal);
		}
		tableRow = table.addRow();
		tableRow.addCell("", "", 2);
		tableRow.addCell("                                          Totale gruppo " + _group, "bold alignRight italic", 1);
		tableRow.addCell("€ " + Banana.Converter.toLocaleNumberFormat(tmpTotal), "bold alignRight italic", 1);
	}
}

// Funzione che crea l'oggetto del conto/categoria.
// Ogni oggetto contine descrizione, codice gr1 e importo.
function loadAccountsMap(banDoc, userParam, accountsMap) {
	
	tabAccounts = banDoc.table("Accounts");
	tabCategories = banDoc.table("Categories");

	if (!tabCategories) {
		loadAccountsMap_DoubleEntry(banDoc, userParam, tabAccounts, accountsMap);
	}
	else {
		loadAccountsMap_IncomeAndExpenses(banDoc, userParam, tabCategories, accountsMap);
	}
}

// Funzione che crea l'oggetto per ogni conto della tabella Cagegorie (contabilità entrate-uscite).
function loadAccountsMap_IncomeAndExpenses(banDoc, userParam, tabCategories, accountsMap) {
	for (var i = 0; i < tabCategories.rowCount; i++) {
		var tRow = tabCategories.row(i);
		let account = tRow.value("Category");
		if (account &&
			!account.startsWith(":") && 
			!account.startsWith(".") && 
			!account.startsWith(",") && 
			!account.startsWith(";")) {

			var currentBal = banDoc.currentBalance(account + userParam.segment5XM, "", "");
			var total = currentBal.total;

			if (total) {
				if (!accountsMap[account]) {
					accountsMap[account] = {
						"description":tRow.value("Description"), 
						"gr1":tRow.value(userParam.colonnaRaggruppamento), 
						"total" : total
					};
				}
				else {
					accountsMap[account].total = Banana.SDecimal.add(accountsMap[account].total, total); 
				}				
			}
		}
	}
}

// Funzione che crea l'oggetto per ogni conto della tabella Conti (contabilità doppia).
function loadAccountsMap_DoubleEntry(banDoc, userParam, tabAccounts, accountsMap) {
	for (var i = 0; i < tabAccounts.rowCount; i++) {
		var tRow = tabAccounts.row(i);
		let account = tRow.value("Account");
		if (account &&
			!account.startsWith(":") && 
			!account.startsWith(".") && 
			!account.startsWith(",") && 
			!account.startsWith(";")) {

			var currentBal = banDoc.currentBalance(account + userParam.segment5XM, "", "");
			var total = currentBal.total;
			//Segno degli importi come nelle entrate-uscite
			//var total = Banana.SDecimal.invert(currentBal.total);

			if (total) {
				if (!accountsMap[account]) {
					accountsMap[account] = {
						"description":tRow.value("Description"), 
						"gr1":tRow.value(userParam.colonnaRaggruppamento), 
						"total" : total
					};
				}
				else {
					accountsMap[account].total = Banana.SDecimal.add(accountsMap[account].total, total); 
				}				
			}
		}
	}
}

// Funzione che ritorna un oggetto specifico.
function getObject(form, nr) {
	for (var i = 0; i < form.length; i++) {
		if (form[i]["group"] === nr) {
			return form[i];
		}
	}
	Banana.document.addMessage("Couldn't find object with nr: " + nr);
}

// Funzione che riprende dalle tabella Conti/Categorie tutti i segmenti 5XMille.
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

// Funzione che ritorna la descrizione di un segmento.
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

// Funzione che crea imposta lo stile css per la stampa del report.
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

	/*
	* ANAGRAFICA
	*/
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
	currentParam.name = 'provincia';
	currentParam.parentObject = 'anagrafica';
	currentParam.title = "Provincia";
	currentParam.type = 'string';
	currentParam.value = userParam.provincia ? userParam.provincia : '';
	currentParam.defaultvalue = "";
	currentParam.readValue = function() {
	  userParam.provincia = this.value;
	}
	convertedParam.data.push(currentParam);	

	var currentParam = {};
	currentParam.name = 'fax';
	currentParam.parentObject = 'anagrafica';
	currentParam.title = "Fax";
	currentParam.type = 'string';
	currentParam.value = userParam.fax ? userParam.fax : '';
	currentParam.defaultvalue = "";
	currentParam.readValue = function() {
	  userParam.fax = this.value;
	}
	convertedParam.data.push(currentParam);	

	var currentParam = {};
	currentParam.name = 'pec';
	currentParam.parentObject = 'anagrafica';
	currentParam.title = "PEC";
	currentParam.type = 'string';
	currentParam.value = userParam.pec ? userParam.pec : '';
	currentParam.defaultvalue = "";
	currentParam.readValue = function() {
	  userParam.pec = this.value;
	}
	convertedParam.data.push(currentParam);	

	var currentParam = {};
	currentParam.name = 'rappresentanteLegale';
	currentParam.parentObject = 'anagrafica';
	currentParam.title = 'Nome del rappresentante legale';
	currentParam.type = 'string';
	currentParam.value = userParam.rappresentanteLegale ? userParam.rappresentanteLegale : '';
	currentParam.defaultvalue = 'Mario Rossi';
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
	currentParam.defaultvalue = '';
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
	currentParam.defaultvalue = '31.12.2021';
	currentParam.readValue = function() {
	  userParam.dataPercezione = this.value;
	}
	convertedParam.data.push(currentParam);

	var currentParam = {};
	currentParam.name = 'dataDocumento';
	currentParam.parentObject = 'rendiconto';
	currentParam.title = 'Data documento';
	currentParam.type = 'string';
	currentParam.value = userParam.dataDocumento ? userParam.dataDocumento : '';
	currentParam.defaultvalue = '';
	currentParam.readValue = function() {
	  userParam.dataDocumento = this.value;
	}
	convertedParam.data.push(currentParam);

	return convertedParam;
}

function initUserParam(segment5XMList) {
   var userParam = {};
   userParam.scopoAttivita = "Sostenere e qualificare l'attività di volontariato";
   userParam.provincia = "";
   userParam.fax = "";
   userParam.pec = "";
   userParam.rappresentanteLegale = "Mario Rossi";
   userParam.cfRappresentanteLegale = "1234567890";
   userParam.dataPercezione = "31.12.2021";
   userParam.colonnaRaggruppamento = "Gr1";
   userParam.fileAnnoPrecedente = false;
   userParam.segment5XM = segment5XMList;
   userParam.dataDocumento = "";
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
