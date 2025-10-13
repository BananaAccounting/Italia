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
// @id = ch.banana.it.extension.reportraccoltafondi
// @api = 1.0
// @pubdate = 2025-10-13
// @publisher = Banana.ch SA
// @description = 5. Report raccolta fondi
// @task = app.command
// @doctype = 100.*;110.*;130.*
// @docproperties = 
// @outputformat = none
// @inputdatasource = none
// @timeout = -1
// @includejs = errors.js


/**
 * Report raccolta fondi.
 *
 * 1. Dalla tabella Conti/Categorie viene ripresa la lista di tutti i segmenti di liv 2 raccolta fondi (::RF01, ::RF02, ecc).
 * 2. Per ogni segmento viene creato un gruppo nei parametri dell'estensione.
 * 3. Ogni gruppo ha i seguenti campi da compilare:
 *      - Includi nella stampa:
 *          -> si seleziona/deseleziona per includere/escludere il segmento dalla stampa.
 *      - Descrizione:
 * 		    -> si inserisce la descrizione della raccolta fondi.
 *          -> di default prende la descrizione del conto dalla tabella Conti/Categorie.
 *      - Denominazione evento:
 *          -> si inserisce la denominazione dell'evento della raccolta fondi.
 *          -> di default prende la descrizione del conto dalla tabella Conti/Categorie.
 *      - Data inizio:
 *          -> si inserisce la data di inizio raccolta fondi.
 *          -> di default viene ripresa la data di apertura della contabilità.
 *      - Data fine:
 *          -> si inserisce la data di fine raccolta fondi.
 *          -> di default viene ripresa la data di chiusua della contabilità.
 *      - Relazione:
 *          -> si inserice una relazione illustrativa della raccolta fondi.
 *          -> si possono inserire più righe.
 *          -> di default viene inserito un testo di esempio.
 *
 * 4. Per ogni segmento raccolta fondi viene generato una pagina di report, contenente:
 * 		- Intestazione con titolo.
 * 		- Informazioni della raccolta fondi con dati ripresi dai rispettivi parametri.
 * 		- Tabella con i dettagli dei movimenti di entrate e uscite della raccolta fondi, e il risultato finale.
 * 		- Relazione finale ripresa dai rispettivi parametri.
 * 
 */


function exec(string) {
	
	if (!Banana.document) {
		return;
	}

	let isCurrentBananaVersionSupported = bananaRequiredVersion("10.0.1", "");
	if (!isCurrentBananaVersionSupported) {
		return "@Cancel";
	}

	let segments = getSegmentsLvl2(Banana.document);

	let userParam = initUserParam(segments);
	let savedParam = Banana.document.getScriptSettings();
	if (savedParam && savedParam.length > 0) {
		userParam = JSON.parse(savedParam);
	}
	// If needed show the settings dialog to the user
	if (!options || !options.useLastSettings) {
		userParam = settingsDialog(segments); // From properties
	}
	if (!userParam) {
		return "@Cancel";
	}

	// Filter to use only selected segments
	segments = segments.filter(seg => userParam[seg.account + '_includi'] !== false);

	// Creates an object with all the segments data
	let segmentDataList = buildSegmentDataList(Banana.document, userParam, segments);

	// Filter to get segments with movements only
	if (userParam.stampaSegmenti) {
		segmentDataList = segmentDataList.filter(sd => sd.transactions && sd.transactions.length > 0);
	}
	
	//Banana.console.log(JSON.stringify(segmentDataList, null, 3));

	//Print the report
	let stylesheet = Banana.Report.newStyleSheet();
	let report = printReport(Banana.document, userParam, segmentDataList, stylesheet);

	setCss(stylesheet);
	Banana.Report.preview(report, stylesheet);
}

function printReport(banDoc, userParam, segmentDataList, stylesheet) {

	let report = Banana.Report.newReport("Rendiconto raccolta fondi");

	printReport_header(report, banDoc, userParam, stylesheet);

	for (let i = 0; i < segmentDataList.length; i++) {
		let segmentData = segmentDataList[i];
		printReport_information(report, banDoc, userParam, segmentData);
		printReport_transactions(report, banDoc, userParam, segmentData);
		printReport_finalnotes(report, banDoc, userParam, segmentData);

		if (i !== segmentDataList.length-1) {
			report.addPageBreak(); //add page break after each account
		}
	}

	return report;
}

function printReport_header(report, banDoc, userParam, stylesheet) {
	if (!userParam.stampaLogo) {
		return;
	}
	let headerParagraph = report.getHeader().addSection();
	let logoFormat = Banana.Report.logoFormat(userParam.nomeLogo);
	if (logoFormat) {
		let logoElement = logoFormat.createDocNode(headerParagraph, stylesheet, "logo");
		report.getHeader().addChild(logoElement);
	}
}

function printReport_information(report, banDoc, userParam, segmentData) {

	let strAccount = "";
	let startDate = "";
	let endDate = "";
	let racFondi = "";
	let denEvento = "";
	let company = "";
	let address1 = "";
	let zip = "";
	let city = "";
	let fiscalnumber = "";
	let strSede = "";

	strAccount = segmentData.account;
	startDate = userParam[segmentData.account+'_dataInizio'];
	if (!startDate) {
		startDate = Banana.Converter.toLocaleDateFormat(banDoc.info("AccountingDataBase","OpeningDate")); 
	}
	endDate = userParam[segmentData.account+'_dataFine'];
	if (!endDate) {
		endDate = Banana.Converter.toLocaleDateFormat(banDoc.info("AccountingDataBase","ClosureDate"));
	}
	racFondi = userParam[segmentData.account+'_descrizione'];
	denEvento = userParam[segmentData.account+'_denominazione'];
	company = banDoc.info("AccountingDataBase","Company");
	address1 = banDoc.info("AccountingDataBase","Address1");
	zip = banDoc.info("AccountingDataBase","Zip");
	city = banDoc.info("AccountingDataBase","City");
	fiscalnumber = banDoc.info("AccountingDataBase","FiscalNumber");

	if (address1) {
		strSede += address1;
	}
	if (zip) {
		if (strSede) {
			strSede += ", ";
		}
		strSede += zip;
	}
	if (city) {
		if (zip) {
			strSede += " ";
		}
		else if (strSede) {
			strSede += ", ";
		}
		strSede += city;
	}

	if (userParam.stampaLogo) {
		report.addParagraph(" ", "");
		report.addParagraph(" ", "");
	}
	report.addParagraph("RENDICONTO DELLA SINGOLA RACCOLTA PUBBLICA DI FONDI OCCASIONALE REDATTO AI SENSI DELL’ARTICOLO 87, COMMA 6 E DELL’ ARTICOLO 79, COMMA 4, LETTERA A), DEL D.LGS. 3 AGOSTO 2017 N. 117", "heading2 alignCenter");
	report.addParagraph(" ");
	report.addParagraph(" ");
	report.addParagraph("Denominazione ETS: " + company, "alignCenter");
	report.addParagraph("CF: " + fiscalnumber, "alignCenter");
	report.addParagraph("Sede: " + strSede, "alignCenter");
	report.addParagraph("RENDICONTO DELLA SINGOLA RACCOLTA FONDI OCCASIONALE", "alignCenter");
	report.addParagraph("Descrizione della celebrazione, ricorrenza o campagna di sensibilizzazione: " + racFondi, "alignCenter");
	report.addParagraph("Eventuale denominazione dell’evento: " + denEvento, "alignCenter");
	report.addParagraph("Durata della raccolta fondi: dal " + startDate + " al " + endDate, "alignCenter");
	report.addParagraph(" ");
	report.addParagraph(" ");
}

function printReport_transactions(report, banDoc, userParam, segmentData) {
	
	/**
	 * 
	 * Prints transactions details contained in segmentData object.
	 * 
	 * Example segmentData.transactions:
	 * 
	 * segmentData.transactions: [
	 *     { 
	 *       date: "2025-03-10",
	 *       description: "Offerte",
	 *       income: "250.00",
	 *       expenses: "" 
	 *     },
	 *     { 
	 *       date: "2025-03-15",
	 *       description: "Acquisto volantini",
	 *       income: "",
	 *       expenses: "35.50"
	 *     }
	 *   ]
	 * 
	 * 
	 * Example segmentData.totals:
	 * 
	 * segmentData.totals: {
	 *     income: "250.00",
	 *     expenses: "35.50",
	 *     result: "214.50"
	 *   }
	 * }
	 * 
	 */

	let incomeRows = [];
	let expenseRows = [];

	for (let i = 0; i < segmentData.transactions.length; i++) {
		let t = segmentData.transactions[i];

		if (t.income && Banana.SDecimal.sign(t.income) !== 0) {
			incomeRows.push([t.date, t.description, t.income]);
		}
		if (t.expenses && Banana.SDecimal.sign(t.expenses) !== 0) {
			expenseRows.push([t.date, t.description, t.expenses]);
		}
	}

	let totIncome = segmentData.totals.income;
	let totExpenses = segmentData.totals.expenses;

	let table = report.addTable("table");

	//Income
	let tableRow = table.addRow();
	tableRow.addCell("a) Proventi/entrate della raccolta fondi occasionale","bold");
	tableRow.addCell("");
	for (let i = 0; i < incomeRows.length; i++) {
		tableRow = table.addRow();
		tableRow.addCell(Banana.Converter.toLocaleDateFormat(incomeRows[i][0]) + ", " + incomeRows[i][1], "");
		tableRow.addCell(Banana.Converter.toLocaleNumberFormat(incomeRows[i][2], 2, false), "alignRight");
	}
	tableRow = table.addRow();
	tableRow.addCell("Totale a)", "alignRight bold");
	tableRow.addCell("€ " + Banana.Converter.toLocaleNumberFormat(totIncome, 2, true), "alignRight bold");

	//Expenses
	tableRow = table.addRow();
	tableRow.addCell("b) Oneri/uscite per la raccolta fondi occasionale","bold");
	tableRow.addCell("");
	for (let i = 0; i < expenseRows.length; i++) {
		tableRow = table.addRow();
		tableRow.addCell(Banana.Converter.toLocaleDateFormat(expenseRows[i][0]) + ", " + expenseRows[i][1], "");
		tableRow.addCell(Banana.Converter.toLocaleNumberFormat(expenseRows[i][2], 2, false), "alignRight");
	}
	tableRow = table.addRow();
	tableRow.addCell("Totale b)", "alignRight bold");
	tableRow.addCell("€ " + Banana.Converter.toLocaleNumberFormat(totExpenses, 2, true), "alignRight bold");

	//Result (income - expenses)
	let res = segmentData.totals.result;
	tableRow = table.addRow();
	tableRow.addCell("Risultato della singola raccolta fondi (a-b)", "alignRight bold");
	tableRow.addCell("€ " + Banana.Converter.toLocaleNumberFormat(res, 2, true), "alignRight bold", 2);

	report.addParagraph(" ","");
	report.addParagraph("La tabella si conclude con una relazione illustrativa in cui sono evidenziati, a integrazione e completamente dei risultati numerici, le finalità e gli elementi caratterizzanti della singola raccolta fondi.", "italic");
}

function printReport_finalnotes(report, banDoc, userParam, segmentData) {
	report.addParagraph(" ");
	report.addParagraph(" ");
	report.addParagraph("RELAZIONE ILLUSTRATIVA DELLA SINGOLA INIZIATIVA DI RACCOLTA FONDI OCCASIONALE", "bold alignCenter");
	report.addParagraph(" ");
	let text = userParam[segmentData.account+'_relazione'];
	text = variablesToValues(banDoc, userParam, segmentData, text);
	report.addParagraph(text, "finalnotes");
}

function variablesToValues(banDoc, userParam, segmentData, text) {

	let startDate = userParam[segmentData.account+'_dataInizio'];
	let endDate = userParam[segmentData.account+'_dataFine'];
	let denominazioneEts = banDoc.info("AccountingDataBase","Company");
	let descrizione = userParam[segmentData.account+'_descrizione'];
	let denominazioneEvento = userParam[segmentData.account+'_denominazione'];
	let totIncome = Banana.Converter.toLocaleNumberFormat(segmentData.totals.income,2,true);
	let totExpenses = Banana.Converter.toLocaleNumberFormat(segmentData.totals.expenses,2,true);
	let totResult = Banana.Converter.toLocaleNumberFormat(segmentData.totals.result,2,true);
	let totIncomeBanca = Banana.Converter.toLocaleNumberFormat(segmentData.totals.incomebanca,2,true);;
	let totIncomeCassa = Banana.Converter.toLocaleNumberFormat(segmentData.totals.incomecassa,2,true);;
	let totIncomeAltro = Banana.Converter.toLocaleNumberFormat(segmentData.totals.incomealtro,2,true);;
	let totExpensesBanca = Banana.Converter.toLocaleNumberFormat(segmentData.totals.expensesbanca,2,true);;
	let totExpensesCassa = Banana.Converter.toLocaleNumberFormat(segmentData.totals.expensescassa,2,true);;
	let totExpensesAltro = Banana.Converter.toLocaleNumberFormat(segmentData.totals.expensesaltro,2,true);;

	if (startDate && text.indexOf("<DataInizio>") > -1) {
		text = text.replace(/<DataInizio>/g, startDate);
	}
	if (endDate && text.indexOf("<DataFine>") > -1) {
		text = text.replace(/<DataFine>/g, endDate);
	}
	if (denominazioneEts && text.indexOf("<DenominazioneEts>") > -1) {
		text = text.replace(/<DenominazioneEts>/g, denominazioneEts);
	}	
	if (descrizione && text.indexOf("<Descrizione>") > -1) {
		text = text.replace(/<Descrizione>/g, descrizione);
	}
	if (denominazioneEvento && text.indexOf("<DenominazioneEvento>") > -1) {
		text = text.replace(/<DenominazioneEvento>/g, denominazioneEvento);
	}
	if (totIncome && text.indexOf("<TotaleEntrate>") > -1) {
		text = text.replace(/<TotaleEntrate>/g, totIncome);
	}
	if (totExpenses && text.indexOf("<TotaleUscite>") > -1) {
		text = text.replace(/<TotaleUscite>/g, totExpenses);
	}
	if (totResult && text.indexOf("<TotaleRisultato>") > -1) {
		text = text.replace(/<TotaleRisultato>/g, totResult);
	}
	if (totIncomeBanca && text.indexOf("<TotaleEntrateBanca>") > -1) {
		text = text.replace(/<TotaleEntrateBanca>/g, totIncomeBanca);
	}
	if (totIncomeCassa && text.indexOf("<TotaleEntrateCassa>") > -1) {
		text = text.replace(/<TotaleEntrateCassa>/g, totIncomeCassa);
	}
	if (totIncomeAltro && text.indexOf("<TotaleEntrateAltro>") > -1) {
		text = text.replace(/<TotaleEntrateAltro>/g, totIncomeAltro);
	}
	if (totExpensesBanca && text.indexOf("<TotaleUsciteBanca>") > -1) {
		text = text.replace(/<TotaleUsciteBanca>/g, totExpensesBanca);
	}
	if (totExpensesCassa && text.indexOf("<TotaleUsciteCassa>") > -1) {
		text = text.replace(/<TotaleUsciteCassa>/g, totExpensesCassa);
	}
	if (totExpensesAltro && text.indexOf("<TotaleUsciteAltro>") > -1) {
		text = text.replace(/<TotaleUsciteAltro>/g, totExpensesAltro);
	}

	return text;
}

function getSegmentsLvl2(banDoc) {

	//Gets from tables Accounts/Categories all the lvl 2 segments (account + description)

	let segments = [];
	if (banDoc.table('Categories')) {
		for (let i = 0; i < banDoc.table('Categories').rowCount; i++) {
			let tRow = banDoc.table('Categories').row(i);
			let account = tRow.value("Category");
			let description = tRow.value("Description");
			if (account.indexOf("::") > -1 && account.indexOf(":::") < 0 && account.substring(2,3)) {
				segments.push({"account":account, "description":description});
			}
		}
	}
	else {
		for (let i = 0; i < banDoc.table('Accounts').rowCount; i++) {
			let tRow = banDoc.table('Accounts').row(i);
			let account = tRow.value("Account");
			let description = tRow.value("Description");
			if (account.indexOf("::") > -1 && account.indexOf(":::") < 0 && account.substring(2,3)) {
				segments.push({"account":account, "description":description});
			}
		}
	}
	//Banana.console.log(JSON.stringify(segments, "", " "));
	return segments;
}

function buildSegmentDataList(banDoc, userParam, segments) {

	/**
	 * Build unico: per ogni segmento legge i movimenti una sola volta,
	 * costruisce transactions e totals, pronti per la stampa o per un eventuale filtro.
	 * 
	 * 
	 *
	 * Regole di costruzione:
	 * - Legge la tabella scheda conto una sola volta per segmento.
	 * - Esclude:
	 *     - l’ultima riga di totali;
	 *     - la riga "Riporto" completamente vuota (senza Date, Doc, importi).
	 * - Mappatura entrate/uscite:
	 *     - se esiste la tabella "Categories": income = JDebitAmount, expenses = JCreditAmount
	 *     - altrimenti (solo tabella Conti): income = JCreditAmount, expenses = JDebitAmount
	 * - Inserisce in transactions solo righe con almeno un importo non zero.
	 *
	 *
	 * Esempio sintetico:
	 * segmentDataList = [
	 * {
	 *   account: "::RF01",
	 *   description: "Raccolta Primavera",
	 *   startDate: "2025-01-01",
	 *   endDate: "2025-12-31",
	 *   transactions: [
	 *     { 
	 *       date: "2025-03-10",
	 *       description: "Offerte",
	 *       income: "250.00",
	 *       expenses: ""
	 *     },
	 *     { 
	 *       date: "2025-03-15",
	 *       description: "Acquisto volantini",
	 *       income: "",
	 *       expenses: "35.50"
	 *     }
	 *   ],
	 *   totals: {
	 *     income: "250.00",
	 *     expenses: "35.50",
	 *     result: "214.50"
	 *   }
	 * },
	 * { ... ::RF02 ...},
	 * { ... ::RF03 ...}
	 * ];
	 */

	let segmentDataList = [];
	let isCategories = !!banDoc.table("Categories");

	for (let i = 0; i < segments.length; i++) {

		let segment = segments[i];
		let account = segment.account;

		let startDate = Banana.Converter.toInternalDateFormat(userParam[account + "_dataInizio"]) ||
		                Banana.Converter.toInternalDateFormat(banDoc.info("AccountingDataBase","OpeningDate"));

		let endDate = Banana.Converter.toInternalDateFormat(userParam[account + "_dataFine"]) ||
		              Banana.Converter.toInternalDateFormat(banDoc.info("AccountingDataBase","ClosureDate"));

		let transactions = [];
		let totalIncome = "0";
		let totalExpenses = "0";
		let totalIncomeCassa = "0";
		let totalIncomeBanca = "0";
		let totalIncomeAltro = "0";
		let totalExpensesCassa = "0";
		let totalExpensesBanca = "0";
		let totalExpensesAltro = "0";

		let transTab = banDoc.currentCard(account, startDate, endDate);

		if (transTab && transTab.rowCount > 0) {
			// esclude ultima riga (totali)
			for (let r = 0; r < transTab.rowCount - 1; r++) {
				let row = transTab.row(r);
				let jdebitamount  = row.value("JDebitAmount");
				let jcreditamount = row.value("JCreditAmount");

				// salta "Riporto" completamente vuoto
				if (row.value("JDescription") === "Riporto" && !row.value("JDate") && !row.value("Doc") && !jdebitamount && !jcreditamount) {
					continue;
				}

				let income = isCategories ? jdebitamount : jcreditamount;
				let expenses = isCategories ? jcreditamount : jdebitamount;

				let hasIncome = income && Banana.SDecimal.sign(income) !== 0;
				let hasExpenses = expenses && Banana.SDecimal.sign(expenses) !== 0;

				if (hasIncome || hasExpenses) {

					let gr1 = banDoc.table('Accounts').findRowByValue('Account', row.value("JContraAccount")).value('Gr1');
					let incomebanca = "";
					let incomecassa = "";
					let incomealtro = "";
					let expensesbanca = "";
					let expensescassa = "";
					let expensesaltro = "";

					if (gr1 === "ACIV1") {
						incomebanca = income;
						expensesbanca = expenses;
					} else if (gr1 === "ACIV3") {
						incomecassa = income;
						expensescassa = expenses;
					} else {
						incomealtro = income;
						expensesaltro = expenses;
					}

					transactions.push({
						date: row.value("JDate"),
						description: row.value("JDescription"),
						income: income || "",
						expenses: expenses || "",
						//contraaccount: row.value("JContraAccount"),
						//contraaccountgr1: banDoc.table('Accounts').findRowByValue('Account', row.value("JContraAccount")).value('Gr1'),
						incomebanca: incomebanca || "",
						incomecassa: incomecassa || "",
						incomealtro: incomealtro || "",
						expensesbanca: expensesbanca || "",
						expensescassa: expensescassa || "",
						expensesaltro: expensesaltro || ""
					});

					if (hasIncome) {
						totalIncome = Banana.SDecimal.add(totalIncome, income);
					}
					if (incomebanca && Banana.SDecimal.sign(incomebanca) !== 0) {
						totalIncomeBanca = Banana.SDecimal.add(totalIncomeBanca, incomebanca);
					}
					if (incomecassa && Banana.SDecimal.sign(incomecassa) !== 0) {
						totalIncomeCassa = Banana.SDecimal.add(totalIncomeCassa, incomecassa);
					}
					if (incomealtro && Banana.SDecimal.sign(incomealtro) !== 0) {
						totalIncomeAltro = Banana.SDecimal.add(totalIncomeAltro, incomealtro);
					}

					if (hasExpenses) {
						totalExpenses = Banana.SDecimal.add(totalExpenses, expenses);
					}
					if (expensesbanca && Banana.SDecimal.sign(expensesbanca) !== 0) {
						totalExpensesBanca = Banana.SDecimal.add(totalExpensesBanca, expensesbanca);
					}
					if (expensescassa && Banana.SDecimal.sign(expensescassa) !== 0) {
						totalExpensesCassa = Banana.SDecimal.add(totalExpensesCassa, expensescassa);
					}
					if (expensesaltro && Banana.SDecimal.sign(expensesaltro) !== 0) {
						totalExpensesAltro = Banana.SDecimal.add(totalExpensesAltro, expensesaltro);
					}
				}
			}
		}

		segmentDataList.push({
			account: account,
			description: segment.description,
			startDate: startDate,
			endDate: endDate,
			transactions: transactions,
			totals: {
				income: totalIncome,
				expenses: totalExpenses,
				result: Banana.SDecimal.subtract(totalIncome, totalExpenses),
				incomebanca: totalIncomeBanca,
				incomecassa: totalIncomeCassa,
				incomealtro: totalIncomeAltro,
				expensesbanca: totalExpensesBanca,
				expensescassa: totalExpensesCassa,
				expensesaltro: totalExpensesAltro
			}
		});
	}

	return segmentDataList;
}

function setCss(repStyleObj) {
	//Creates styles for the report print
	let css = "";
	let file = Banana.IO.getLocalFile("file:script/rendicontoRaccoltaFondi.css");
	if (!file.errorString) {
		//Banana.console.log(file.read);
		css = file.read();
	} else {
		Banana.console.log(file.errorString);
	}
	// Parse the css text
	repStyleObj.parse(css);
}


/**************************************************************************************
 * Functions to manage the parameters
 **************************************************************************************/
function convertParam(userParam, segments) {

	let convertedParam = {};
	convertedParam.version = '1.0';
	convertedParam.data = [];

	let currentParam = {};
	currentParam.name = 'stampaLogo';
	currentParam.title = 'Stampa logo';
	currentParam.type = 'bool';
	currentParam.value = userParam.stampaLogo ? true : false;
	currentParam.defaultvalue = false;
	currentParam.tooltip = "Stampa logo nell'intestazione";
	currentParam.readValue = function() {
		userParam.stampaLogo = this.value;
	}
	convertedParam.data.push(currentParam);

	currentParam = {};
	currentParam.name = 'nomeLogo';
	currentParam.title = 'Nome composizione logo';
	currentParam.type = 'string';
	currentParam.value = userParam.nomeLogo ? userParam.nomeLogo : '';
	currentParam.defaultvalue = "Logo";
	currentParam.tooltip = 'Inserire il nome della composizione da utilizzare';
	currentParam.readValue = function() {
		userParam.nomeLogo = this.value;
	}
	convertedParam.data.push(currentParam);

	currentParam = {};
	currentParam.name = 'stampaSegmenti';
	currentParam.title = 'Stampa solo raccolte fondi con movimenti in entrata/uscita';
	currentParam.type = 'bool';
	currentParam.value = userParam.stampaSegmenti ? true : false;
	currentParam.defaultvalue = false;
	currentParam.tooltip = "Stampa solo raccolte fondi dei segmenti con movimenti, escludi quelle senza movimenti";
	currentParam.readValue = function() {
		userParam.stampaSegmenti = this.value;
	}
	convertedParam.data.push(currentParam);


	// Crea un gruppo di parametri per ogni segmento raccolta fondi
	for (let i = 0; i < segments.length; i++) {

		let segment = segments[i].account;
		let segDesc = segments[i].description;

		currentParam = {};
		currentParam.name = segment;
		currentParam.title = segment;
		currentParam.type = 'string';
		currentParam.value = '';
		currentParam.editable = false;
		currentParam.readValue = function(segment) {
			userParam.segment = this.value;
		}
		convertedParam.data.push(currentParam);

		currentParam = {};
		currentParam.name = segment+'_includi';
		currentParam.parentObject = segment;
		currentParam.title = 'Includi nella stampa';
		currentParam.type = 'bool';
		currentParam.value = (typeof userParam[segment + '_includi'] === 'undefined') ? true : userParam[segment + '_includi'];
		currentParam.defaultvalue = true;
		currentParam.segment = segment;
		currentParam.tooltip = 'Selezionare per includere questa raccolta fondi nella stampa';
		currentParam.readValueSegment = function(segment) {
			userParam[segment+'_includi'] = this.value;
		}
		convertedParam.data.push(currentParam);

		currentParam = {};
		currentParam.name = segment+'_descrizione';
		currentParam.parentObject = segment;
		currentParam.title = 'Descrizione';
		currentParam.type = 'string';
		currentParam.value = userParam[segment+'_descrizione'] ? userParam[segment+'_descrizione'] : '';
		currentParam.defaultvalue = segDesc;
		currentParam.segment = segment;
		currentParam.tooltip = 'Inserire la descrizione della raccolta fondi';
		currentParam.readValueSegment = function(segment) {
			userParam[segment+'_descrizione'] = this.value;
		}
		convertedParam.data.push(currentParam);

		currentParam = {};
		currentParam.name = segment+'_denominazione';
		currentParam.parentObject = segment;
		currentParam.title = 'Denominazione evento';
		currentParam.type = 'string';
		currentParam.value = userParam[segment+'_denominazione'] ? userParam[segment+'_denominazione'] : '';
		currentParam.defaultvalue = segDesc;
		currentParam.segment = segment;
		currentParam.tooltip = "Inserire la denominazione dell'evento raccolta fondi";
		currentParam.readValueSegment = function(segment) {
			userParam[segment+'_denominazione'] = this.value;
		}
		convertedParam.data.push(currentParam);

		currentParam = {};
		currentParam.name = segment+'_dataInizio';
		currentParam.parentObject = segment;
		currentParam.title = "Data inizio";
		currentParam.type = 'string';
		currentParam.value = userParam[segment+'_dataInizio'] ? userParam[segment+'_dataInizio'] : Banana.Converter.toLocaleDateFormat(Banana.document.info("AccountingDataBase","OpeningDate"));
		currentParam.defaultvalue = Banana.Converter.toLocaleDateFormat(Banana.document.info("AccountingDataBase","OpeningDate"));
		currentParam.segment = segment;
		currentParam.tooltip = "Inserire la data di inizio periodo della raccolta fondi";
		currentParam.readValueSegment = function(segment) {
			userParam[segment+'_dataInizio'] = this.value;
		}
		convertedParam.data.push(currentParam);

		currentParam = {};
		currentParam.name = segment+'_dataFine';
		currentParam.parentObject = segment;
		currentParam.title = "Data fine";
		currentParam.type = 'string';
		currentParam.value = userParam[segment+'_dataFine'] ? userParam[segment+'_dataFine'] : Banana.Converter.toLocaleDateFormat(Banana.document.info("AccountingDataBase","ClosureDate"));
		currentParam.defaultvalue = Banana.Converter.toLocaleDateFormat(Banana.document.info("AccountingDataBase","ClosureDate"));
		currentParam.segment = segment;
		currentParam.tooltip = "Inserire la data di fine periodo della raccolta fondi";
		currentParam.readValueSegment = function(segment) {
			userParam[segment+'_dataFine'] = this.value;
		}
		convertedParam.data.push(currentParam);

		currentParam = {};
		currentParam.name = segment+'_relazione';
		currentParam.parentObject = segment;
		currentParam.title = 'Relazione';
		currentParam.type = 'multilinestring';
		currentParam.value = userParam[segment+'_relazione'] ? userParam[segment+'_relazione'] : '';
		currentParam.defaultvalue = "Descrizione dell’iniziativa\n\nL’ETS <DenominazioneEts> dal <DataInizio> al <DataFine> ha posto in essere un’iniziativa denominata <DenominazioneEvento>.\nSono stati raccolti fondi in denaro per un totale di Euro <TotaleEntrate> (riportare il totale di entrate in denaro).\nLe elargizioni in denaro sono state ricevute in contanti per un totale di Euro <TotaleEntrateCassa> su c/c bancario per un totale di Euro <TotaleEntrateBanca> altro______\n\ne/o\nSono stati raccolti beni materiali complessivi per un valore complessivo di Euro_______\nI costi sostenuti per la realizzazione dell’evento sono così dettagliati: ______________\nI fondi raccolti al netto del totale delle spese sostenute sono pari ad Euro <TotaleRisultato> e verranno impiegati per le seguenti attività di interesse generale*______________________\nE per le seguenti finalità:\n____________________________\n\nGli oneri sostenuti e/o le uscite sono risultati superiori ai proventi/entrate per le seguenti motivazioni (campo da compilare esclusivamente nell’ipotesi in cui i costi complessivamente sostenuti per la realizzazione dell’evento siano superiori ai ricavi)_________________\n\n*utilizzare la nomenclatura contenuta nell’art. 5 del D.lgs 117/17\n";
		currentParam.segment = segment;
		currentParam.tooltip = 'Inserire un testo';
		currentParam.readValueSegment = function(segment) {
			userParam[segment+'_relazione'] = this.value;
		}
		convertedParam.data.push(currentParam);
	}

	return convertedParam;
}

function initUserParam(segments) {

	let userParam = {};

	userParam.stampaLogo = false;
	userParam.nomeLogo = 'Logo';
	userParam.stampaSegmenti = false;

	for (let i = 0; i < segments.length; i++) {
		let segment = segments[i].account;
		let segDesc = segments[i].description;

		userParam[segment+'_includi'] = true;
		userParam[segment+'_descrizione'] = segDesc;
		userParam[segment+'_denominazione'] = segDesc;
		userParam[segment+'_dataInizio'] = Banana.Converter.toLocaleDateFormat(Banana.document.info("AccountingDataBase","OpeningDate"));
		userParam[segment+'_dataFine'] = Banana.Converter.toLocaleDateFormat(Banana.document.info("AccountingDataBase","ClosureDate"));
		userParam[segment+'_relazione'] = "Descrizione dell’iniziativa\n\nL’ETS <DenominazioneEts> dal <DataInizio> al <DataFine> ha posto in essere un’iniziativa denominata <DenominazioneEvento>.\nSono stati raccolti fondi in denaro per un totale di Euro <TotaleEntrate> (riportare il totale di entrate in denaro).\nLe elargizioni in denaro sono state ricevute in contanti per un totale di Euro <TotaleEntrateCassa> su c/c bancario per un totale di Euro <TotaleEntrateBanca> altro______\n\ne/o\nSono stati raccolti beni materiali complessivi per un valore complessivo di Euro_______\nI costi sostenuti per la realizzazione dell’evento sono così dettagliati: ______________\nI fondi raccolti al netto del totale delle spese sostenute sono pari ad Euro <TotaleRisultato> e verranno impiegati per le seguenti attività di interesse generale*______________________\nE per le seguenti finalità:\n____________________________\n\nGli oneri sostenuti e/o le uscite sono risultati superiori ai proventi/entrate per le seguenti motivazioni (campo da compilare esclusivamente nell’ipotesi in cui i costi complessivamente sostenuti per la realizzazione dell’evento siano superiori ai ricavi)_________________\n\n*utilizzare la nomenclatura contenuta nell’art. 5 del D.lgs 117/17\n";
	}

	return userParam;
}

function parametersDialog(userParam, segments) {
	if (typeof(Banana.Ui.openPropertyEditor) !== 'undefined') {
		let dialogTitle = "Parametri report raccolta fondi" ;
		let convertedParam = convertParam(userParam, segments);
		let pageAnchor = 'dlgSettings';
		if (!Banana.Ui.openPropertyEditor(dialogTitle, convertedParam, pageAnchor)) {
	    	return null;
		}
		for (let i = 0; i < convertedParam.data.length; i++) {
	    	// Read values to userParam (through the readValue function)
	        if (!convertedParam.data[i].segment) {
	          convertedParam.data[i].readValue();
	        }
	        else {
	          // For param with property "segment" pass this segment as parameter
	          convertedParam.data[i].readValueSegment(convertedParam.data[i].segment);
	        }
		}
		//  Reset reset default values
		userParam.useDefaultTexts = false;
	}

	return userParam;
}

function settingsDialog(segments) {
	let userParam = initUserParam(segments);
	let savedParam = Banana.document.getScriptSettings();
	if (savedParam && savedParam.length > 0) {
		userParam = JSON.parse(savedParam);
	}

	userParam = parametersDialog(userParam,segments); // From propertiess
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

