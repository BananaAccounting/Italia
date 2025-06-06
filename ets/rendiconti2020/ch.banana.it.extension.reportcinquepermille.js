// Copyright [2025] [Banana.ch SA - Lugano Switzerland]
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
// @pubdate = 2025-05-14
// @publisher = Banana.ch SA
// @description = 4. Report cinque per mille
// @task = app.command
// @doctype = 100.*;110.*;130.*
// @docproperties = 
// @outputformat = none
// @inputdatasource = none
// @timeout = -1
// @includejs = reportstructure.js
// @includejs = errors.js



/**
 *
 * Mod. A
 *  - MODELLO DI RENDICONTO RELATIVO AL CONTRIBUTO 5 PER MILLE DESTINATO AGLI ENTI DEL TERZO SETTORE (Mod. A)
 *  - https://www.lavoro.gov.it/temi-e-priorita/Terzo-settore-e-responsabilita-sociale-imprese/focus-on/Cinque-per-mille/Documents/Modello-rendiconto-5x1000-Mod-A.pdf
 * 
 * Mod. B
 * - MODELLO DI RENDICONTO DELL’ACCANTONAMENTO RELATIVO AL CONTRIBUTO 5 PER MILLE DESTINATO AGLI ENTI DEL TERZO SETTORE (Mod. B)
 * - https://www.lavoro.gov.it/temi-e-priorita/Terzo-settore-e-responsabilita-sociale-imprese/focus-on/Cinque-per-mille/Documents/Modello-rendiconto-accantonamento-5x1000-Mod-B.pdf
 * 
 */

let BAN_VERSION = "10.0.1";
let BAN_EXPM_VERSION = "";


//Main function
function exec(string) {
	
	//Check if we are on an opened document
	if (!Banana.document) {
		return;
	}

	//Check banana version
	let isCurrentBananaVersionSupported = bananaRequiredVersion(BAN_VERSION, BAN_EXPM_VERSION);
	if (!isCurrentBananaVersionSupported) {
		return "@Cancel";
	}


	/**
	 * Current year file.
	 * For double accounting, get the Accounts table of the current opened file.
	 * For simple accounting, get the Categories table of the current opened file.
	 * Retrieve all the 5XM segments from that table.
	 */
	let accounts = "";
	if (!Banana.document.table("Categories")) {
		accounts = Banana.document.table("Accounts");
	} else {
		accounts = Banana.document.table("Categories");
	}
	let segment5XMList = getSegmentList(accounts);


	/**
	 * User parameters
	 */
	let userParam = initUserParam();
	let savedParam = Banana.document.getScriptSettings();
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

		// 1. Create all the accounts objects for current year and last year.
		let accountsMap = {};
		loadAccountsMap(Banana.document, userParam, accountsMap);
		if (fileLastYear) {
			loadAccountsMap(fileLastYear, userParam, accountsMap);
		}
		//Banana.console.log(JSON.stringify(accountsMap, "", " "));

		//2. Load the report gorups with gr1 codes and texts.
		let reportGroups = createReportStructure5xMille(userParam);
		
		//3. Calculate all the balances and load them in the reportGroups
		loadBalances(Banana.document, userParam, reportGroups, accountsMap);

		//4. Create the report
        let report = printReport(Banana.document, fileLastYear, userParam, reportGroups, accountsMap);
		let stylesheet = Banana.Report.newStyleSheet();
		setCss(Banana.document, stylesheet);
		Banana.Report.preview(report, stylesheet);
	}
}

// Funzione che stampa il report.
function printReport(banDoc, fileLastYear, userParam, reportGroups, accountsMap) {
	
	//Controlla i codici GR1 inseriti nei parametri 
	checkCodesGroup4(banDoc, userParam, reportGroups);

	//Crea il report
	let report = Banana.Report.newReport("Rendiconto 5 per mille");

	printReport_Header(report, banDoc, userParam);

	if (userParam.tipoRendicontoModB) {
        printReport_RendicontoModB(report, banDoc, fileLastYear, userParam, reportGroups, accountsMap);
	} else {
        printReport_RendicontoModA(report, banDoc, fileLastYear, userParam, reportGroups, accountsMap);
	}

	printReport_Finale(report, banDoc, userParam);
	
	if (userParam.giustificativispese) {
		printReport_ListaGiustificativi(report, banDoc, fileLastYear, userParam, accountsMap);
	}
	
	printReport_Footer(report);

	return report;
}

// Funzione che stampa l'intestazione.
function printReport_Header(report, banDoc, userParam) {
	/*
		PRINT LOGO
	*/
	let headerParagraph = report.getHeader();
	headerParagraph.addImage("images/ministero_del_lavoro.png", "img alignCenter");
	headerParagraph.addParagraph(" ");
	headerParagraph.addParagraph(" ");


	/*
		PRINT TABLE "ANAGRAFICA"
	*/
	if (userParam.tipoRendicontoModB) {
		report.addParagraph("MODELLO DI RENDICONTO DELL'ACCANTONAMENTO RELATIVO AL CONTRIBUTO 5 PER MILLE DESTINATO AGLI ENTI DEL TERZO SETTORE (Mod. B)", "heading alignCenter");
	}
	else {
		report.addParagraph("MODELLO DI RENDICONTO RELATIVO AL CONTRIBUTO 5 PER MILLE DESTINATO AGLI ENTI DEL TERZO SETTORE (Mod. A)", "heading alignCenter");
	}
	report.addParagraph(" ");

	let tableAnagrafica = report.addTable("tableAnagrafica");
	let col1Anagrafica = tableAnagrafica.addColumn("col1Anagrafica");
	let col2Anagrafica = tableAnagrafica.addColumn("col2Anagrafica");
	let col3Anagrafica = tableAnagrafica.addColumn("col3Anagrafica");
	let col4Anagrafica = tableAnagrafica.addColumn("col4Anagrafica");
	let col5Anagrafica = tableAnagrafica.addColumn("col5Anagrafica");

	tableAnagrafica.getCaption().addText("ANAGRAFICA", "description bold");

	tableRow = tableAnagrafica.addRow();
	tableRow.addCell("Denominazione sociale","",1);
	tableRow.addCell(banDoc.info("AccountingDataBase", "Company"), "", 4);

	tableRow = tableAnagrafica.addRow();
	tableRow.addCell("C.F. dell'Ente", "", 1);
	tableRow.addCell(banDoc.info("AccountingDataBase", "FiscalNumber"), "", 1);
	tableRow.addCell("","",1);
	tableRow.addCell("Telefono", "", 1);
	tableRow.addCell(banDoc.info("AccountingDataBase", "Phone"), "", 1);

	tableRow = tableAnagrafica.addRow();
	tableRow.addCell("Comune", "", 1);
	tableRow.addCell(banDoc.info("AccountingDataBase", "City"), "", 1);
	tableRow.addCell("","",1);
	tableRow.addCell("Email", "", 1);
	tableRow.addCell(banDoc.info("AccountingDataBase", "Email"), "", 1);

	tableRow = tableAnagrafica.addRow();
	tableRow.addCell("Provincia", "", 1);
	tableRow.addCell(userParam.provincia, "", 1);
	tableRow.addCell("","",1);
	tableRow.addCell("PEC", "", 1);
	tableRow.addCell(userParam.pec, "", 1);

	tableRow = tableAnagrafica.addRow();
	tableRow.addCell("CAP", "", 1);
	tableRow.addCell(banDoc.info("AccountingDataBase", "Zip"), "", 1);
	tableRow.addCell("","",1);
	tableRow.addCell("Nome rappresentante legale", "", 1);
	tableRow.addCell(userParam.rappresentanteLegale, "", 1);

	tableRow = tableAnagrafica.addRow();
	tableRow.addCell("Via", "", 1);
	tableRow.addCell(banDoc.info("AccountingDataBase", "Address1"), "", 1);
	tableRow.addCell("","",1);
	tableRow.addCell("C.F. rappresentante legale", "", 1);
	tableRow.addCell(userParam.cfRappresentanteLegale, "", 1);

	report.addParagraph(" ");
}

// Funzione che stampa la parte delle entrate e delle uscite del rendiconto.
function printReport_RendicontoModA(report, banDoc, fileLastYear, userParam, reportGroups, accountsMap) {

	// Calcolo automatico accantonamento
	incomeAcc = "";
	expensesAcc = "";

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
	report.addParagraph("Rendiconto anno finanziario " + annofinanziario, "description bold");

	let table = report.addTable("table");
	let col1Table = table.addColumn("col1Table");
	let col2Table = table.addColumn("col2Table");
	let col3Table = table.addColumn("col3Table");
	let col4Table = table.addColumn("col4Table");
	
	tableRow = table.addRow();
	tableRow.addCell(getDescription(banDoc, userParam.segment5XM), "", 2);
	tableRow.addCell(userParam.segment5XM, "alignRight", 2);

	tableRow = table.addRow();
	tableRow.addCell("Data di percezione del contributo", "", 2);
	tableRow.addCell(userParam.dataPercezione, "alignRight", 2);

	// tableRow = table.addRow();
	// tableRow.addCell(" ", "", 4);

	tableRow = table.addRow();



	/**
	 * ENTRATE
	 * - gruppo 0, Importo percepito
	 * 
	 * USCITE
	 * - gruppo 1, Risorse umane
	 * - gruppo 2, Spese funzionamento
	 * - gruppo 3, Spese per acquisto beni e servizi
	 * - gruppo 4, Spese per attività di interesse generale dell'ente
	 * - gruppo 4.1, Acquisto beni o servizi strumentali oggetto di donazione
	 * - gruppo 4.2, Erogazioni a proprie articolazioni territoriali e a soggetti collegati o affiliati
	 * - gruppo 4.3, Erogazioni a enti terzi
	 * - gruppo 4.4, Erogazioni a persone fisiche
	 * - gruppo 4.5, Altre spese per attività di interesse generale
	 * - gruppo 5, Accantonamento
	 */
    for (let i = 0; i < reportGroups.length; i++) {
		
        let groupObj = getObject(reportGroups, reportGroups[i]["group"]);

		//ENTRATE
		if (groupObj.income) {
			tableRow = table.addRow();
			tableRow.addCell("IMPORTO PERCEPITO", "", 2);
			tableRow.addCell(Banana.Converter.toLocaleNumberFormat(groupObj.total), "alignRight total", 1);
			tableRow.addCell("EUR", "alignRight",1);

			// Per il calcolo automatico dell'accantonamento
            incomeAcc = groupObj.total;
		}

		//USCITE
		else {

			// gruppi 1, 2, 3
			if (groupObj.group === "1" || groupObj.group === "2" || groupObj.group === "3") {
				tableRow = table.addRow();
				tableRow.addCell(" ", "", 4);
				tableRow = table.addRow();
				tableRow.addCell(groupObj.group +".", "bold", 1);
				tableRow.addCell(groupObj.title, "bold", 1);
				tableRow.addCell(Banana.Converter.toLocaleNumberFormat(groupObj.total), "alignRight total", 1);
				tableRow.addCell("EUR", "alignRight",1);
				tableRow = table.addRow();
				tableRow.addCell(groupObj.text, "", 2);

				// Per il calcolo automatico dell'accantonamento
				expensesAcc = Banana.SDecimal.add(expensesAcc,groupObj.total);
			}

			// gruppo 4
			else if (groupObj.group === "4") {
				tableRow = table.addRow();
				tableRow.addCell(" ", "", 4);
				tableRow = table.addRow();
				tableRow.addCell(groupObj.group +".", "bold", 1);
				tableRow.addCell(groupObj.title, "bold", 1);
				tableRow.addCell("", "", 1);
				tableRow.addCell("", "",1);
				tableRow = table.addRow();
				tableRow.addCell(groupObj.text, "", 2);
				tableRow = table.addRow();
				tableRow.addCell(" ", "", 4);
			}

			// gruppi 4.1, 4.2, 4.3, 4.4, 4.5
			else if (groupObj.group === "4.1" || groupObj.group === "4.2" || groupObj.group === "4.3" || groupObj.group === "4.4" || groupObj.group === "4.5") {
				tableRow = table.addRow();
				tableRow.addCell("", "", 1);
				tableRow.addCell(groupObj.group + " " + groupObj.title, "", 1);
				tableRow.addCell(Banana.Converter.toLocaleNumberFormat(groupObj.total), "alignRight total", 1);
				tableRow.addCell("EUR", "alignRight",1);

				// Per il calcolo automatico dell'accantonamento
				expensesAcc = Banana.SDecimal.add(expensesAcc,groupObj.total);
			}

			// gruppo 5
			else if (groupObj.group === "5") {

				// importo da registrazione accantonamento
				if (!userParam.calcolaAccantonamento) {
					tableRow = table.addRow();
					tableRow.addCell(" ", "", 4);
					tableRow = table.addRow();
					tableRow.addCell(groupObj.group +".", "bold", 1);
					tableRow.addCell(groupObj.title, "bold", 1);
					tableRow.addCell(Banana.Converter.toLocaleNumberFormat(groupObj.total), "alignRight total", 1);
					tableRow.addCell("EUR", "alignRight",1);
					tableRow = table.addRow();
					tableRow.addCell(groupObj.text, "", 2);

					//controlla importo totale gruppo accantonamento
					controlloAccantonamento(banDoc, groupObj.total, incomeAcc, expensesAcc);
				}

				// importo calcolato come differenza
				// "Importo percepito" - "Totale costi (gruppi 1,2,3,4)"
				else {
                    var totAccantonamento = Banana.SDecimal.subtract(incomeAcc,expensesAcc);
					tableRow = table.addRow();
					tableRow.addCell(" ", "", 4);
					tableRow = table.addRow();
					tableRow.addCell(groupObj.group +".", "bold", 1);
					tableRow.addCell(groupObj.title, "bold", 1);
					tableRow.addCell(Banana.Converter.toLocaleNumberFormat(totAccantonamento), "alignRight total", 1);
					tableRow.addCell("EUR", "alignRight",1);
					tableRow = table.addRow();
					tableRow.addCell(groupObj.text, "", 2);
				}
			}
		}
	}

	/**
	 * Final total
	 */
	for (let i = 0; i < reportGroups.length; i++) {

		let groupObj = getObject(reportGroups, reportGroups[i]["group"]);

		if (groupObj.group === "total") {
			
			// quando l'accantonamento è calcolato come differenza, aggiunge l'importo calcolato al totale
			if (userParam.calcolaAccantonamento) {
				groupObj.totalExpenses = Banana.SDecimal.add(groupObj.totalExpenses,totAccantonamento);
			}

			tableRow = table.addRow();
			tableRow.addCell(" ", "", 4);
			tableRow = table.addRow();
			tableRow.addCell("TOTALE", "bold", 2);
			tableRow.addCell(Banana.Converter.toLocaleNumberFormat(groupObj.totalExpenses), "alignRight bold total", 1);
			tableRow.addCell("EUR", "bold alignRight",1);
		}
	}
}

// Funzione che stampa la parte dell'accantonamento e delle uscite del rendiconto.
function printReport_RendicontoModB(report, banDoc, fileLastYear, userParam, reportGroups, accountsMap) {

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
	report.addParagraph("Rendiconto dell'accantonamento anno finanziario " + annofinanziario, "description bold");

	let table = report.addTable("table");
	let col1Table = table.addColumn("col1Table");
	let col2Table = table.addColumn("col2Table");
	let col3Table = table.addColumn("col3Table");
	let col4Table = table.addColumn("col4Table");
	
	tableRow = table.addRow();
	tableRow.addCell(getDescription(banDoc, userParam.segment5XM), "", 2);
	tableRow.addCell(userParam.segment5XM, "alignRight", 2);

	tableRow = table.addRow();
	tableRow.addCell("IMPORTO ACCANTONATO", "", 2);
	tableRow.addCell(Banana.Converter.toLocaleNumberFormat(userParam.importoAccantonamento), "alignRight total", 1);
	tableRow.addCell("EUR", "alignRight",1);

	/**
	 * IMPORTO ACCANTONATO
	 * - inserito nei parametri
	 * 
	 * USCITE
	 * - gruppo 1, Risorse umane
	 * - gruppo 2, Spese funzionamento
	 * - gruppo 3, Spese per acquisto beni e servizi
	 * - gruppo 4, Spese per attività di interesse generale dell'ente
	 * - gruppo 4.1, Acquisto beni o servizi strumentali oggetto di donazione
	 * - gruppo 4.2, Erogazioni a proprie articolazioni territoriali e a soggetti collegati o affiliati
	 * - gruppo 4.3, Erogazioni a enti terzi
	 * - gruppo 4.4, Erogazioni a persone fisiche
	 * - gruppo 4.5, Altre spese per attività di interesse generale
	 */
    for (let i = 0; i < reportGroups.length; i++) {
		
        let groupObj = getObject(reportGroups, reportGroups[i]["group"]);
	
		// gruppi 1, 2, 3
		if (groupObj.group === "1" || groupObj.group === "2" || groupObj.group === "3") {
			tableRow = table.addRow();
			tableRow.addCell(" ", "", 4);
			tableRow = table.addRow();
			tableRow.addCell(groupObj.group +".", "bold", 1);
			tableRow.addCell(groupObj.title, "bold", 1);
			tableRow.addCell(Banana.Converter.toLocaleNumberFormat(groupObj.total), "alignRight total", 1);
			tableRow.addCell("EUR", "alignRight",1);
			tableRow = table.addRow();
			tableRow.addCell(groupObj.text, "", 2);
		}

		// gruppo 4
		else if (groupObj.group === "4") {
			tableRow = table.addRow();
			tableRow.addCell(" ", "", 4);
			tableRow = table.addRow();
			tableRow.addCell(groupObj.group +".", "bold", 1);
			tableRow.addCell(groupObj.title, "bold", 1);
			tableRow.addCell("", "", 1);
			tableRow.addCell("", "",1);
			tableRow = table.addRow();
			tableRow.addCell(groupObj.text, "", 2);
			tableRow = table.addRow();
			tableRow.addCell(" ", "", 4);
		}

		// gruppi 4.1, 4.2, 4.3, 4.4, 4.5
		else if (groupObj.group === "4.1" || groupObj.group === "4.2" || groupObj.group === "4.3" || groupObj.group === "4.4" || groupObj.group === "4.5") {
			tableRow = table.addRow();
			tableRow.addCell("", "", 1);
			tableRow.addCell(groupObj.group + " " + groupObj.title, "", 1);
			tableRow.addCell(Banana.Converter.toLocaleNumberFormat(groupObj.total), "alignRight total", 1);
			tableRow.addCell("EUR", "alignRight",1);
		}
	}

	/**
	 * Final total
	 */
	for (let i = 0; i < reportGroups.length; i++) {

		let groupObj = getObject(reportGroups, reportGroups[i]["group"]);

		if (groupObj.group === "total") {

			tableRow = table.addRow();
			tableRow.addCell(" ", "", 4);
			tableRow = table.addRow();
			tableRow.addCell("TOTALE", "bold", 2);
			tableRow.addCell(Banana.Converter.toLocaleNumberFormat(groupObj.totalExpenses), "alignRight bold total", 1);
			tableRow.addCell("EUR", "bold alignRight",1);
		}
	}
}

// Funzione che stampa la parte finale del report.
function printReport_Finale(report, banDoc, userParam) {

	if (userParam.tipoRendicontoModB) {
		report.addParagraph(" ");
		report.addParagraph(" ");
	}

	report.addParagraph(" ");
	report.addParagraph("I soggetti beneficiari sono tenuti a redigere, oltre al presente modello di rendiconto, una relazione che illustri in maniera esaustiva l’utilizzo del contributo percepito e un elenco dei giustificativi di spesa. Si rammenta che i giustificativi di spesa non dovranno essere trasmessi, bensì conservati presso la sede dell’ente ed esibiti qualora il Ministero ne faccia richiesta.", "bold alignJustify border");
	report.addParagraph(" ");

	let date = "";
	if (userParam.dataDocumento) {
		date = userParam.dataDocumento;
	} else {
		date = Banana.Converter.toLocaleDateFormat(new Date()); // current date (DD-MM-YYYY)
	}
	report.addParagraph(" ");
	let dataPara = report.addParagraph("Data: " + date);
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
	report.addParagraph("Il rappresentante legale, con la sottoscrizione del presente rendiconto:", "alignJustify");
	report.addParagraph("● Dichiara che le spese inserite non siano già state imputate ad altri contributi pubblici o privati (c.d. divieto di doppio finanziamento a valere sulla stessa spesa), se non per la parte residua;", "alignJustify");
	report.addParagraph("● Attesta l’autenticità delle informazioni contenute nel presente documento e la loro integrale rispondenza con quanto riportato nelle scritture contabili dell’organizzazione, consapevole che, ai sensi degli articoli 47 e 76 del d.P.R. n. 445/2000, chiunque rilasci dichiarazioni mendaci, formi atti falsi ovvero ne faccia uso è punito ai sensi del codice penale e dalle leggi speciali in materia.", "alignJustify");
	report.addParagraph(" ");
	report.addParagraph("Il presente rendiconto, inoltre, ai sensi dell’articolo 46 del citato d.P.R. n. 445/2000, deve essere corredato da copia semplice di un documento di identità in corso di validità del soggetto che lo abbia sottoscritto.", "alignJustify");

	//Add signature
	report.addParagraph(" ");
	report.addParagraph(" ");
	report.addParagraph(" ");
	report.addParagraph("________________________________________________", "alignCenter");
	report.addParagraph("Firma del rappresentante legale", "alignCenter");
}

// Funzione che stampa il numero di pagina come piè di pagina
function printReport_Footer(report) {
	report.getFooter().addClass("footer");
	report.getFooter().addText("-", "");
	report.getFooter().addFieldPageNr();
	report.getFooter().addText("-", "");
}

// Funzione che stampa l'elenco dei giustificativi di spesa
function printReport_ListaGiustificativi(report, banDoc, fileLastYear, userParam, accountsMap) {

	// Elenco delle spese del 5x1000 con il dettaglio delle registrazioni (Data, Importo, Descrizione),
	// ordinate in base al gruppo (da 1 a 4.5)

	let details = createDetailsTransactions(banDoc, fileLastYear, userParam, accountsMap);

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

	report.addPageBreak();
	report.addParagraph("ELENCO GIUSTIFICATIVI DI SPESA", "heading alignCenter");
	report.addParagraph(" ", "");
	report.addParagraph("(Allegato alla rendicontazione del contributo cinque per mille destinato agli Enti del Terzo settore)", "alignCenter italic");
	report.addParagraph(" ", "");
	report.addParagraph(" ", "");
	p = report.addParagraph("");
	p.addText("Denominazione ente: ", "") + p.addText(banDoc.info("AccountingDataBase", "Company"), "bold");
	report.addParagraph(" ", "");
	p = report.addParagraph("");
	p.addText("Codice fiscale ente: ", "") + p.addText(banDoc.info("AccountingDataBase", "FiscalNumber"), "bold");
	report.addParagraph(" ", "");
	p = report.addParagraph("");
	p.addText("Giustificativi di spesa associati alla rendicontazione del contributo anno finanziario ","") + p.addText(annofinanziario, "bold") + p.addText(" percepito il ", "") + p.addText(userParam.dataPercezione, "bold") + p.addText(".","");
	report.addParagraph(" ", "");
	report.addParagraph(" ", "");

	let tableDettagli = report.addTable("tableDettagli");
	let col1Dettagli = tableDettagli.addColumn("col1Dettagli");
	let col2Dettagli = tableDettagli.addColumn("col2Dettagli");
	let col3Dettagli = tableDettagli.addColumn("col3Dettagli");
	let col4Dettagli = tableDettagli.addColumn("col4Dettagli");

	var tableHeader = tableDettagli.getHeader();
	tableRow = tableHeader.addRow();
	tableRow.addCell("Voce di spesa", "headerTableDettagli alignCenter", 1);
	tableRow.addCell("Data di pagamento", "headerTableDettagli alignCenter", 1);
	tableRow.addCell("Importo imputato al 5x1000 (euro)", "headerTableDettagli alignCenter", 1);
	tableRow.addCell("Breve descrizione del giustificativo", "headerTableDettagli alignCenter", 1);

	for (let i = 0; i < details.length; i++) {
		tableRow = tableDettagli.addRow();
		tableRow.addCell(details[i].group, "alignCenter", 1);
		tableRow.addCell(Banana.Converter.toLocaleDateFormat(details[i].date), "alignCenter", 1);
		tableRow.addCell(Banana.SDecimal.abs(details[i].amount), "alignRight", 1);
		if (userParam.contogiustificativospesa) {
			tableRow.addCell("<" + details[i].account + "> " + details[i].description, "", 1);
		} else {
			tableRow.addCell(details[i].description, "", 1);
		}
	}

	report.addParagraph(" ", "");
	report.addParagraph(" ", "");
	report.addParagraph("Si rammenta che i giustificativi di spesa non dovranno essere trasmessi, bensì conservati presso la sede dell’ente ed esibiti solo qualora il Ministero ne faccia richiesta. Si evidenzia altresì che i soggetti beneficiari del contributo non sono obbligati alla pubblicazione del presente elenco dei giustificativi sul proprio sito web.","bold");
}

/**************************************************************************************
 * Calculation of balances
 **************************************************************************************/

// Funzione che carica i saldi dei gruppi
function loadBalances(banDoc, userParam, reportGroups, accountsMap) {

	if (userParam.tipoRendicontoModB) {
		calc_group_balances_modB(banDoc, reportGroups, accountsMap);
	} 
	else {
		calc_group_balances_modA(banDoc, reportGroups, accountsMap);
	}

	//Banana.console.log(JSON.stringify(reportGroups, "", " "));
}

// Funzione che calcola gli importi dei gruppi
function calc_group_balances_modA(banDoc, reportGroups, accountsMap) {

	//Controlla che accountsMap non sia vuoto
	//Fa passare la struttra dati
	//Per ogni gruppo della struttura dati prende la lista dei codici GR1 e crea un array
	//Fa passare l'array e per ogni elemento controlla se il GR1 esiste nel accountsMap
	//Se esiste prende l'importo del conto dal accountsMap e costruisce i saldi

	let finalIncome = "";
	let finalExpenses = "";

	for (let i = 0; i < reportGroups.length; i++) {
			
		let groupObj = getObject(reportGroups, reportGroups[i]["group"]);
		let arrGr = groupObj.gr1.split(";");
		let totalIncome = "";
		let totalExpenses = "";
		let total = "";

		if (Object.keys(accountsMap).length !== 0) {
			//accountsMap non è vuoto

			for (let j = 0; j < arrGr.length; j++) {

				for (const account in accountsMap) {

					if (accountsMap[account].gr1 === arrGr[j]) {

						let tmpAmount = accountsMap[account].total;
						
						if (groupObj.income) {
							//Inverte importo entrata se contabilità entrate/uscite
							if (!banDoc.table("Categories")) {
								tmpAmount = Banana.SDecimal.invert(tmpAmount);
							}
							totalIncome = Banana.SDecimal.add(totalIncome, tmpAmount);
						}
						else {
							//Inverte importo uscita se contabilità entrate/uscite
							if (banDoc.table("Categories")) {
								tmpAmount = Banana.SDecimal.invert(tmpAmount);
							}
							totalExpenses = Banana.SDecimal.add(totalExpenses, tmpAmount);
						}

						//importo totale del gruppo
						total = Banana.SDecimal.add(total, tmpAmount);
					}
				}
			}
		}
		else {
			//accountsMap è vuoto
			let tmpTotal = total;
			if (banDoc.table("Categories")) {
				tmpTotal = Banana.SDecimal.invert(tmpTotal);
			}
		}

		//aggiunge l'importo del gruppo nell'oggetto struttura dati
		//e costuisce totali finali di entrate e uscite
		groupObj.total = total;
		finalIncome = Banana.SDecimal.add(finalIncome, totalIncome);
		finalExpenses = Banana.SDecimal.add(finalExpenses, totalExpenses);
	}

	//aggiunge nella struttra datu un oggetto con i totali finali
	reportGroups.push({"group":"total", "totalIncome":finalIncome, "totalExpenses":finalExpenses});
}

// Funzione che calcola gli importi dei gruppi
function calc_group_balances_modB(banDoc, reportGroups, accountsMap) {

	//Controlla che accountsMap non sia vuoto
	//Fa passare la struttra dati
	//Per ogni gruppo della struttura dati prende la lista dei codici GR1 e crea un array
	//Fa passare l'array e per ogni elemento controlla se il GR1 esiste nel accountsMap
	//Se esiste prende l'importo del conto dal accountsMap e costruisce i saldi

	let finalExpenses = "";

	for (let i = 0; i < reportGroups.length; i++) {
		
		let groupObj = getObject(reportGroups, reportGroups[i]["group"]);
		let arrGr = groupObj.gr1.split(";");
		let totalExpenses = "";
		let total = "";

		if (Object.keys(accountsMap).length !== 0) {
			//accountsMap non è vuoto

			for (let j = 0; j < arrGr.length; j++) {

				for (const account in accountsMap) {

					if (accountsMap[account].gr1 === arrGr[j]) {

						let tmpAmount = accountsMap[account].total;

						if (!groupObj.income && groupObj.group !== "5") {
							//solo uscite, escluso gruppo 5 accantonamenti
							//Inverte importo se contabilità entrate/uscite
							if (banDoc.table("Categories")) {
								tmpAmount = Banana.SDecimal.invert(tmpAmount);
							}
							totalExpenses = Banana.SDecimal.add(totalExpenses, tmpAmount);
						}

						//importo totale del gruppo
						total = Banana.SDecimal.add(total, tmpAmount);
					}
				}
			}
		}
		else {
			//accountsMap è vuoto
			let tmpTotal = total;
			if (banDoc.table("Categories")) {
				tmpTotal = Banana.SDecimal.invert(tmpTotal);
			}
		}

		//aggiunge l'importo del gruppo nell'oggetto struttura dati
		//e costuisce totali finali di entrate e uscite
		groupObj.total = total;
		finalExpenses = Banana.SDecimal.add(finalExpenses, totalExpenses);
	}

	//aggiunge nella struttra datu un oggetto con i totali finali
	reportGroups.push({"group":"total", "totalExpenses":finalExpenses});
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

	// Fa passare la tabella Categorie,
	// per ogni conto normale (non segmento o un centro di costo),
	// calcola il currentBalance con il segmento selezionato dai parametri.
	// Se ritorna un importo diverso da zero, crea un oggetto di quel conto
	// con descrizione, gr1 e importo calcolato

	for (let i = 0; i < tabCategories.rowCount; i++) {
		let tRow = tabCategories.row(i);
		let account = tRow.value("Category");
		let gr = tRow.value(userParam.colonnaRaggruppamento);
		if (account &&
			!account.startsWith(":") && 
			!account.startsWith(".") && 
			!account.startsWith(",") && 
			!account.startsWith(";")) {

			let currentBal = banDoc.currentBalance(account + userParam.segment5XM, "", "");
			let total = currentBal.total;


            //sarebbe da calcolare il accountCard e aggiungerlo alla mappa


            if (total) {
                if (!accountsMap[account]) {
					//Se non c'è lo aggiunge la prima volta

					// //Split Gr groups
					// if (gr && gr.indexOf(";") > -1) {
					// 	gr = gr.split(";")[1]; // es. CE7;5XM42 => prendo 5XM42
					// }

					accountsMap[account] = {
						"account":account,
						"description":tRow.value("Description"), 
						"gr1":gr, 
                        "total" : total
                    };
				}
				else {
					//c'è già e quindi somma l'importo
					accountsMap[account].total = Banana.SDecimal.add(accountsMap[account].total, total); 
				}				
			}
		}
    }
}

// Funzione che crea l'oggetto per ogni conto della tabella Conti (contabilità doppia).
function loadAccountsMap_DoubleEntry(banDoc, userParam, tabAccounts, accountsMap) {

	// Fa passare la tabella Conti,
	// per ogni conto normale (non segmento o un centro di costo),
	// calcola il currentBalance con il segmento selezionato dai parametri.
	// Se ritorna un importo diverso da zero, crea un oggetto di quel conto
	// con descrizione, gr1 e importo calcolato

	for (let i = 0; i < tabAccounts.rowCount; i++) {
		let tRow = tabAccounts.row(i);
		let account = tRow.value("Account");
		let gr = tRow.value(userParam.colonnaRaggruppamento);
		if (account &&
			!account.startsWith(":") && 
			!account.startsWith(".") && 
			!account.startsWith(",") && 
			!account.startsWith(";")) {

			let currentBal = banDoc.currentBalance(account + userParam.segment5XM, "", "");
			let total = currentBal.total;
			//Segno degli importi come nelle entrate-uscite
			//let total = Banana.SDecimal.invert(currentBal.total);

			if (total) {
				if (!accountsMap[account]) {

					// //Split Gr groups
					// if (gr && gr.indexOf(";") > -1) {
					// 	gr = gr.split(";")[1]; // es. CE7;5XM42 => prendo 5XM42
					// }

					accountsMap[account] = {
						"account":account,
						"description":tRow.value("Description"), 
						"gr1":gr, 
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

// Funzione che crea l'oggetto con i dettagli delle registrazioni per ogni gruppo del 5x1000
function createDetailsTransactions(banDoc, fileLastYear, userParam, accountsMap) {

    let details = [];
    const groupMapping = {
        "CA4": "1", "CB4": "1", "CE4": "1",
        "CA1": "2", "CA3": "2", "CA7": "2", "CD1": "2", "CD2": "2",
        "CD3": "2", "CD4": "2", "CD6": "2", "IM": "2",
        "CA2": "3", "CA5": "3", "CB3": "3", "CB5": "3", "CE3": "3", 
        "CE5": "3", "CC1": "3", "CC2": "3", "CC3": "3"
    };

    // Funzione per recuperare il gruppo in base a gr1
    function getGroup(gr1) {
        return groupMapping[gr1] || (() => {
            if (gr1 === userParam.gruppo41) return "4.1";
            if (gr1 === userParam.gruppo42) return "4.2";
            if (gr1 === userParam.gruppo43) return "4.3";
            if (gr1 === userParam.gruppo44) return "4.4";
            if (gr1 === userParam.gruppo45) return "4.5";
            return "";
        })();
    }

    // Funzione che crea un oggetto con i dettagli delle registrazioni
    function processTransactions(transTab, account, group) {
        for (let j = 0; j < transTab.rowCount; j++) {
            let tRow = transTab.row(j);
            let trDate = tRow.value("Date");
            let trDescription = tRow.value("Description");
            let trCreditAccount = banDoc.table("Categories") ? tRow.value("Category") : tRow.value("AccountDebit");
            let trAmount = banDoc.table("Categories") ? tRow.value("Expenses") : tRow.value("Amount");
            let trSegment = tRow.value("Segment");

            if ((trCreditAccount === account + userParam.segment5XM && !trSegment) || 
                (":" + trSegment === userParam.segment5XM && trCreditAccount === account)) { // aggiunge due punti perché nella registrazione è senza
                details.push({
                    "group": group,
                    "date": trDate,
                    "amount": trAmount,
                    "description": trDescription,
                    "account": account
                });
            }
        }
    }

    // Itera sui conti
    for (const i in accountsMap) {
        let account = accountsMap[i].account;
        let gr1 = accountsMap[i].gr1;
        let group = getGroup(gr1);

        // Se il gruppo è valido (ovvero un gruppo di spesa)
        if (group) {
            // Processa registrazioni anno corrente
            let transTabCurrentYear = banDoc.table("Transactions");
            processTransactions(transTabCurrentYear, account, group);

            // Se esiste, processa registrazioni anno precedente
            if (fileLastYear) {
                let transTabLastYear = fileLastYear.table("Transactions");
                processTransactions(transTabLastYear, account, group);
            }
        }
    }

    // Ordina l'array di dettagli per gruppo, data e descrizione
    details.sort((a, b) => {
        return a.group.localeCompare(b.group) || a.date.localeCompare(b.date) || a.description.localeCompare(b.description);
    });

    return details;
}


/**************************************************************************************
 * Functionalities
 **************************************************************************************/

// Funzione che ritorna i codici di raggruppamento GR1 del gruppo indicato
function getObjectGr1CodesByGroup(reportStructure, group) {
    var searchGroup = group.trim();
    for (var i = 0; i < reportStructure.length; i++) {
		if (reportStructure[i].group === searchGroup) {
			//Banana.console.log("GET => Group: " + group + " ... codes: " + reportStructure[i].gr1);
			return reportStructure[i].gr1;
		}
	}
}

// Funzione che imposta i codici di raggruppamento GR1 del gruppo indicato
function setObjectGr1CodesByGroup(reportStructure, group, newCodes) {
    var searchGroup = group.trim();
    for (var i = 0; i < reportStructure.length; i++) {
		if (reportStructure[i].group === searchGroup) {
			reportStructure[i].gr1 = newCodes;
			//Banana.console.log("SET => Group: " + group + " ... codes: " + reportStructure[i].gr1);
		}
	}
}

// Funzione che controlla i codici GR1 inseriti nei parametri
function checkCodesGroup4(banDoc, userParam, reportGroups) {

	// Controlla i codici GR1 inseriti nei gruppi 4.1, 4.2, 4.3, 4.4, 4.5
	// Se ci sono codici già presenti nei gruppi 1,2,3,5 allora li rimuove da questi ultimi per evitare di averli in doppio

	let codesSection1 = getObjectGr1CodesByGroup(reportGroups, "1").split(";");
	let codesSection2 = getObjectGr1CodesByGroup(reportGroups, "2").split(";");
	let codesSection3 = getObjectGr1CodesByGroup(reportGroups, "3").split(";");
	let codesSection41 = userParam.gruppo41.split(";");
	let codesSection42 = userParam.gruppo42.split(";");
	let codesSection43 = userParam.gruppo43.split(";");
	let codesSection44 = userParam.gruppo44.split(";");
	let codesSection45 = userParam.gruppo45.split(";");
	let codesSection5 = getObjectGr1CodesByGroup(reportGroups, "5").split(";");

	// Crea un array con tutti i codici GR1 inseriti dall'utente
    let userCodes = [];

    for (let i = 0; i < codesSection41.length; i++) {
		userCodes.push(codesSection41[i]);
	}
    for (let i = 0; i < codesSection42.length; i++) {
		userCodes.push(codesSection42[i]);
	}
    for (let i = 0; i < codesSection43.length; i++) {
		userCodes.push(codesSection43[i]);
	}
    for (let i = 0; i < codesSection44.length; i++) {
		userCodes.push(codesSection44[i]);
	}
    for (let i = 0; i < codesSection45.length; i++) {
		userCodes.push(codesSection45[i]);
	}

    //Remove duplicates from array
    for (let i = 0; i < userCodes.length; i++) {
      for (let x = i+1; x < userCodes.length; x++) {
        if (userCodes[x] === userCodes[i]) {
          userCodes.splice(x,1);
          --x;
        }
      }
    }

    //Sort the array
    userCodes.sort();
	// Banana.console.log(userCodes);

	// Rimuove dai gruppi 1,2,3,5 i codici inseriti dall'utente nei gruppi 4.1, 4.2, 4.3, 4.4, 4.5
	// Per evitare che vengono conteggiati due volte
	for (let i = 0; i < userCodes.length; i++) {
		
		let groups = [];
		let index;

		if (codesSection1.includes(userCodes[i])) {
			index = codesSection1.indexOf(userCodes[i]);
			if (index !== -1) {
			  codesSection1.splice(index, 1);
			}
			//userParam.gruppo1 = codesSection1.join().replace(/,/g, ";");
			setObjectGr1CodesByGroup(reportGroups, "1", codesSection1.join().replace(/,/g, ";"));
		}
		if (codesSection2.includes(userCodes[i])) {
			index = codesSection2.indexOf(userCodes[i]);
			if (index !== -1) {
			  codesSection2.splice(index, 1);
			}
			// userParam.gruppo2 = codesSection2.join().replace(/,/g, ";");
			setObjectGr1CodesByGroup(reportGroups, "2", codesSection2.join().replace(/,/g, ";"));
		}
		if (codesSection3.includes(userCodes[i])) {
			index = codesSection3.indexOf(userCodes[i]);
			if (index !== -1) {
			  codesSection3.splice(index, 1);
			}
			// userParam.gruppo3 = codesSection3.join().replace(/,/g, ";");
			setObjectGr1CodesByGroup(reportGroups, "3", codesSection3.join().replace(/,/g, ";"));
		}
		if (codesSection5.includes(userCodes[i])) {
			index = codesSection5.indexOf(userCodes[i]);
			if (index !== -1) {
			  codesSection5.splice(index, 1);
			}
			// userParam.gruppo5 = codesSection5.join().replace(/,/g, ";");
			setObjectGr1CodesByGroup(reportGroups, "5", codesSection5.join().replace(/,/g, ";"));
		}

		if (codesSection41.includes(userCodes[i])) {
			groups.push("4.1");
		}
		if (codesSection42.includes(userCodes[i])) {
			groups.push("4.2");
		}
		if (codesSection43.includes(userCodes[i])) {
			groups.push("4.3");
		}
		if (codesSection44.includes(userCodes[i])) {
			groups.push("4.4");
		}
		if (codesSection45.includes(userCodes[i])) {
			groups.push("4.5");
		}

		// Mostra messaggio errore se il codice compare in più di un gruppo
		if (groups.length > 1) {
			let msg = getErrorMessage(ID_ERR_CODICI_GR1_5XMILLE);
			msg = msg.replace("%CODEGR1", userCodes[i]);
			msg = msg.replace("%GROUPS", groups);
			banDoc.addMessage(msg);
		}
	}
}

// Funzione che controlla l'importo dell'accantonamento
function controlloAccantonamento(banDoc, accantonamento, entrate, uscite) {
	
	// Se 'Accantonamento > (Entrate - Uscite (1,2,3,4) )' => segnala errore
	
    var diffEntrateUscite = Banana.SDecimal.subtract(entrate,uscite);
	if (Banana.SDecimal.compare(accantonamento,diffEntrateUscite) == 1) {
		banDoc.addMessage(getErrorMessage(ID_ERR_ACCANTONAMENTO_5XMILLE));
	}
}

// Funzione che ritorna un oggetto specifico.
function getObject(form, nr) {
	for (let i = 0; i < form.length; i++) {
		if (form[i]["group"] === nr) {
			return form[i];
		}
	}
	Banana.document.addMessage("Couldn't find object with nr: " + nr);
}

// Funzione che riprende dalle tabella Conti/Categorie tutti i segmenti 5XMille.
function getSegmentList(tabAccounts) {
	let arrList = [];
	if (Banana.document.table('Categories')) {
		for (let i = 0; i < Banana.document.table('Categories').rowCount; i++) {
			let tRow = Banana.document.table('Categories').row(i);
			if (tRow.value("Category").indexOf(":") == 0 && tRow.value("Category").indexOf("::") < 0 && tRow.value("Category").substring(1,2)) {
				arrList.push(tRow.value("Category"));
			}
		}
	}
	else {
		for (let i = 0; i < Banana.document.table('Accounts').rowCount; i++) {
			let tRow = Banana.document.table('Accounts').row(i);
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
		for (let i = 0; i < banDoc.table('Accounts').rowCount; i++) {
			let tRow = banDoc.table('Accounts').row(i);
			if (tRow.value("Account") === segment) {
				return tRow.value("Description");
			}
		}
	}
	else {
		for (let i = 0; i < banDoc.table('Categories').rowCount; i++) {
			let tRow = banDoc.table('Categories').row(i);
			if (tRow.value("Category") === segment) {
				return tRow.value("Description");
			}
		}
	}
}

// Funzione che crea imposta lo stile css per la stampa del report.
function setCss(banDoc, repStyleObj) {
   let textCSS = "";
   let file = Banana.IO.getLocalFile("file:script/rendiconto5xMille.css");
   let fileContent = file.read();
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

	let convertedParam = {};
	convertedParam.version = '1.0';
	convertedParam.data = [];

	/*
	* ANAGRAFICA
	*/
	let currentParam = {};
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

	currentParam = {};
	currentParam.name = 'provincia';
	currentParam.parentObject = 'anagrafica';
	currentParam.title = "Provincia";
	currentParam.type = 'string';
	currentParam.value = userParam.provincia ? userParam.provincia : '';
	currentParam.defaultvalue = "";
	currentParam.tooltip = "Inserisci la Provincia";
	currentParam.readValue = function() {
	  userParam.provincia = this.value;
	}
	convertedParam.data.push(currentParam);	

	currentParam = {};
	currentParam.name = 'pec';
	currentParam.parentObject = 'anagrafica';
	currentParam.title = "PEC";
	currentParam.type = 'string';
	currentParam.value = userParam.pec ? userParam.pec : '';
	currentParam.defaultvalue = "";
	currentParam.tooltip = "Inserisci il PEC";
	currentParam.readValue = function() {
	  userParam.pec = this.value;
	}
	convertedParam.data.push(currentParam);	

	currentParam = {};
	currentParam.name = 'rappresentanteLegale';
	currentParam.parentObject = 'anagrafica';
	currentParam.title = 'Nome del rappresentante legale';
	currentParam.type = 'string';
	currentParam.value = userParam.rappresentanteLegale ? userParam.rappresentanteLegale : '';
	currentParam.defaultvalue = 'Mario Rossi';
	currentParam.tooltip = "Inserisci il nome del rappresentante legale";
	currentParam.readValue = function() {
	  userParam.rappresentanteLegale = this.value;
	}
	convertedParam.data.push(currentParam);

	currentParam = {};
	currentParam.name = 'cfRappresentanteLegale';
	currentParam.parentObject = 'anagrafica';
	currentParam.title = 'Codice fiscale del rappresentante legale';
	currentParam.type = 'string';
	currentParam.value = userParam.cfRappresentanteLegale ? userParam.cfRappresentanteLegale : '';
	currentParam.defaultvalue = '';
	currentParam.tooltip = "Inserisci il codice fiscale del rappresentante legale";
	currentParam.readValue = function() {
	  userParam.cfRappresentanteLegale = this.value;
	}
	convertedParam.data.push(currentParam);

	currentParam = {};
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

	currentParam = {};
	currentParam.name = 'colonnaRaggruppamento';
	currentParam.parentObject = 'rendiconto';
	currentParam.title = "Colonna raggruppamento (nome XML colonna)";
	currentParam.type = 'string';
	currentParam.value = userParam.colonnaRaggruppamento ? userParam.colonnaRaggruppamento : 'Gr1';
	currentParam.defaultvalue = 'Gr1';
	currentParam.tooltip = "Inserisci il nome XML della colonna utilizzata per indicare i codici necessari da usare per ottenere il report";
	currentParam.readValue = function() {
	  userParam.colonnaRaggruppamento = this.value;
	}
	convertedParam.data.push(currentParam);

	currentParam = {};
	currentParam.name = 'fileAnnoPrecedente';
	currentParam.parentObject = 'rendiconto';
	currentParam.title = 'Includere file anno precedente';
	currentParam.type = 'bool';
	currentParam.value = userParam.fileAnnoPrecedente ? true : false;
	currentParam.defaultvalue = false;
	currentParam.tooltip = "Includi il file dell'anno precedente se le entrate o spese sono anche nel file contabile dell'anno precedente";
	currentParam.readValue = function() {
	  userParam.fileAnnoPrecedente = this.value;
	}
	convertedParam.data.push(currentParam);

	currentParam = {};
	currentParam.name = 'segment5XM';
	currentParam.parentObject = 'rendiconto';
	currentParam.title = "Segmento 5XM";
	currentParam.type = 'combobox';
	currentParam.items = segment5XMList;
	currentParam.value = userParam.segment5XM ? userParam.segment5XM : '';
	currentParam.tooltip = "Seleziona il segmento del 5 per mille";
	currentParam.readValue = function () {
		userParam.segment5XM = this.value;
	}
	convertedParam.data.push(currentParam);

	currentParam = {};
	currentParam.name = 'modA';
	currentParam.parentObject = 'rendiconto';
	currentParam.title = 'Rendiconto per il contributo Mod.A';
	currentParam.type = 'string';
	currentParam.value = '';
	currentParam.editable = false;
	currentParam.readValue = function() {
		userParam.anagrafica = this.value;
	}
	convertedParam.data.push(currentParam);

	currentParam = {};
	currentParam.name = 'dataPercezione';
	currentParam.parentObject = 'modA';
	currentParam.title = 'Data di percezione';
	currentParam.type = 'string';
	currentParam.value = userParam.dataPercezione ? userParam.dataPercezione : '';
	currentParam.defaultvalue = '31.12.2025';
	currentParam.tooltip = "Inserisci la data di percezione del contributo per il rendiconto Mod.A";
	currentParam.readValue = function() {
	  userParam.dataPercezione = this.value;
	}
	convertedParam.data.push(currentParam);

	currentParam = {};
	currentParam.name = 'calcolaAccantonamento';
	currentParam.parentObject = 'modA';
	currentParam.title = 'Calcolo automatico accantonamento';
	currentParam.type = 'bool';
	currentParam.value = userParam.calcolaAccantonamento ? true : false;
	currentParam.defaultvalue = false;
	currentParam.tooltip = "L’importo dell’accantonamento del Mod.A può essere calcolato automaticamente come differenza tra l’importo percepito e i costi totali, se non viene registrato contabilmente";
	currentParam.readValue = function() {
	  userParam.calcolaAccantonamento = this.value;
	}
	convertedParam.data.push(currentParam);

	currentParam = {};
	currentParam.name = 'modB';
	currentParam.parentObject = 'rendiconto';
	currentParam.title = "Rendiconto per l'accancontamento Mod.B";
	currentParam.type = 'string';
	currentParam.value = '';
	currentParam.editable = false;
	currentParam.readValue = function() {
		userParam.anagrafica = this.value;
	}
	convertedParam.data.push(currentParam);

	currentParam = {};
	currentParam.name = 'tipoRendicontoModB';
	currentParam.parentObject = 'modB';
	currentParam.title = "Tipo Rendiconto dell'accantonamento";
	currentParam.type = 'bool';
	currentParam.value = userParam.tipoRendicontoModB ? true : false;
	currentParam.defaultvalue = false;
	currentParam.tooltip = "Crea il rendiconto dell'accantonamento Mod.B";
	currentParam.readValue = function() {
	  userParam.tipoRendicontoModB = this.value;
	}
	convertedParam.data.push(currentParam);

	currentParam = {};
	currentParam.name = 'importoAccantonamento';
	currentParam.parentObject = 'modB';
	currentParam.title = 'Importo accantonamento';
	currentParam.type = 'string';
	currentParam.value = userParam.importoAccantonamento ? userParam.importoAccantonamento : '';
	currentParam.defaultvalue = '';
	currentParam.tooltip = "Inserisci l'importo accantonato per il rendiconto dell'accantonamento Mod.B";
	currentParam.readValue = function() {
	  userParam.importoAccantonamento = this.value;
	}
	convertedParam.data.push(currentParam);

	currentParam = {};
	currentParam.name = 'dataDocumento';
	currentParam.parentObject = 'rendiconto';
	currentParam.title = 'Data documento';
	currentParam.type = 'string';
	currentParam.value = userParam.dataDocumento ? userParam.dataDocumento : '';
	currentParam.defaultvalue = '';
	currentParam.tooltip = "Inserisci la data del documento";
	currentParam.readValue = function() {
	  userParam.dataDocumento = this.value;
	}
	convertedParam.data.push(currentParam);

	currentParam = {};
	currentParam.name = 'sezioniGruppi';
	currentParam.parentObject = '';
	currentParam.title = 'Raggruppamenti codici Gr1 del Gruppo 4';
	currentParam.type = 'string';
	currentParam.value = '';
	currentParam.editable = false;
	currentParam.readValue = function() {
		userParam.sezioniGruppi = this.value;
	}
	convertedParam.data.push(currentParam);

	currentParam = {};
	currentParam.name = 'gruppo41';
	currentParam.parentObject = 'sezioniGruppi';
	currentParam.title = '4.1 (predefiniti: CB1;CE1)';
	currentParam.type = 'string';
	currentParam.value = userParam.gruppo41 ? userParam.gruppo41 : '';
	currentParam.defaultvalue = 'CB1;CE1';
	currentParam.tooltip = "Inserisci i codici Gr1 da includere nel sottogruppo 4.1";
	currentParam.readValue = function() {
	  userParam.gruppo41 = this.value;
	}
	convertedParam.data.push(currentParam);

	currentParam = {};
	currentParam.name = 'gruppo42';
	currentParam.parentObject = 'sezioniGruppi';
	currentParam.title = '4.2 (predefiniti: CB2)';
	currentParam.type = 'string';
	currentParam.value = userParam.gruppo42 ? userParam.gruppo42 : '';
	currentParam.defaultvalue = 'CB2';
	currentParam.tooltip = "Inserisci i codici Gr1 da includere nel sottogruppo 4.2";
	currentParam.readValue = function() {
	  userParam.gruppo42 = this.value;
	}
	convertedParam.data.push(currentParam);

	currentParam = {};
	currentParam.name = 'gruppo43';
	currentParam.parentObject = 'sezioniGruppi';
	currentParam.title = '4.3 (predefiniti: CE2)';
	currentParam.type = 'string';
	currentParam.value = userParam.gruppo43 ? userParam.gruppo43 : '';
	currentParam.defaultvalue = 'CE2';
	currentParam.tooltip = "Inserisci i codici Gr1 da includere nel sottogruppo 4.3";
	currentParam.readValue = function() {
	  userParam.gruppo43 = this.value;
	}
	convertedParam.data.push(currentParam);

	currentParam = {};
	currentParam.name = 'gruppo44';
	currentParam.parentObject = 'sezioniGruppi';
	currentParam.title = '4.4 (predefiniti: CB7)';
	currentParam.type = 'string';
	currentParam.value = userParam.gruppo44 ? userParam.gruppo44 : '';
	currentParam.defaultvalue = 'CB7';
	currentParam.tooltip = "Inserisci i codici Gr1 da includere nel sottogruppo 4.4";
	currentParam.readValue = function() {
	  userParam.gruppo44 = this.value;
	}
	convertedParam.data.push(currentParam);

	currentParam = {};
	currentParam.name = 'gruppo45';
	currentParam.parentObject = 'sezioniGruppi';
	currentParam.title = '4.5 (predefiniti: CE7;CG1;CG2)';
	currentParam.type = 'string';
	currentParam.value = userParam.gruppo45 ? userParam.gruppo45 : '';
	currentParam.defaultvalue = 'CE7;CG1;CG2';
	currentParam.tooltip = "Inserisci i codici Gr1 da includere nel sottogruppo 4.5";
	currentParam.readValue = function() {
	  userParam.gruppo45 = this.value;
	}
	convertedParam.data.push(currentParam);

	currentParam = {};
	currentParam.name = 'elencogiustificativispese';
	currentParam.parentObject = '';
	currentParam.title = 'Elenco giustificativi di spese';
	currentParam.type = 'string';
	currentParam.value = '';
	currentParam.editable = false;
	currentParam.readValue = function() {
		userParam.anagrafica = this.value;
	}
	convertedParam.data.push(currentParam);

	currentParam = {};
	currentParam.name = 'giustificativispese';
	currentParam.parentObject = 'elencogiustificativispese';
	currentParam.title = "Includi elenco giustificativi spese";
	currentParam.type = 'bool';
	currentParam.value = userParam.giustificativispese ? true : false;
	currentParam.defaultvalue = true;
	currentParam.tooltip = "Includi l'elenco dei giustificativi di spesa con i dettagli delle registrazioni";
	currentParam.readValue = function() {
	  userParam.giustificativispese = this.value;
	}
	convertedParam.data.push(currentParam);

	currentParam = {};
	currentParam.name = 'contogiustificativospesa';
	currentParam.parentObject = 'elencogiustificativispese';
	currentParam.title = "Includi conto di spesa nella descrizione";
	currentParam.type = 'bool';
	currentParam.value = userParam.contogiustificativospesa ? true : false;
	currentParam.defaultvalue = false;
	currentParam.tooltip = "Includi il conto della spesa nel dettaglio della registrazione";
	currentParam.readValue = function() {
	  userParam.contogiustificativospesa = this.value;
	}
	convertedParam.data.push(currentParam);

	return convertedParam;
}

function initUserParam(segment5XMList) {
   let userParam = {};
   userParam.provincia = "";
   userParam.pec = "";
   userParam.rappresentanteLegale = "Mario Rossi";
   userParam.cfRappresentanteLegale = "1234567890";
   userParam.dataPercezione = "31.12.2025";
   userParam.colonnaRaggruppamento = "Gr1";
   userParam.fileAnnoPrecedente = false;
   userParam.segment5XM = segment5XMList;
   userParam.dataDocumento = "";
   userParam.calcolaAccantonamento = false;
   userParam.tipoRendicontoModB = false;
   userParam.importoAccantonamento = "";
   userParam.gruppo41 = "CB1;CE1";
   userParam.gruppo42 = "CB2";
   userParam.gruppo43 = "CE2";
   userParam.gruppo44 = "CB7";
   userParam.gruppo45 = "CE7;CG1;CG2";
   userParam.giustificativispese = true;
   userParam.contogiustificativospesa = false;
   return userParam;
}

function parametersDialog(userParam, segment5XMList) {
	if (typeof(Banana.Ui.openPropertyEditor) !== 'undefined') {
		let dialogTitle = "Parametri report 5 x mille";
		let convertedParam = convertParam(userParam, segment5XMList);
		let pageAnchor = 'dlgSettings';
		if (!Banana.Ui.openPropertyEditor(dialogTitle, convertedParam, pageAnchor)) {
	    	return null;
		}
		for (let i = 0; i < convertedParam.data.length; i++) {
	    	// Read values to userParam (through the readValue function)
	    	convertedParam.data[i].readValue();
		}
		//  Reset reset default values
		userParam.useDefaultTexts = false;
	}

	return userParam;
}

function settingsDialog(segment5XMList) {
	let userParam = initUserParam();
	let savedParam = Banana.document.getScriptSettings();
	if (savedParam && savedParam.length > 0) {
		userParam = JSON.parse(savedParam);
	}

   /**

   //We take the accounting "starting date" and "ending date" from the document. These will be used as default dates
   let docStartDate = Banana.document.startPeriod();
   let docEndDate = Banana.document.endPeriod();

   //A dialog window is opened asking the user to insert the desired period. By default is the accounting period
   let selectedDates = Banana.Ui.getPeriod('', docStartDate, docEndDate,
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
		let paramToString = JSON.stringify(userParam);
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

