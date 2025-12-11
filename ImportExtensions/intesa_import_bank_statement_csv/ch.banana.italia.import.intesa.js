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

// @id = ch.banana.italia.import.intesa
// @api = 1.0
// @pubdate = 2025-12-11
// @publisher = Banana.ch SA
// @description = Banca Intesa - Import account statement .csv (Banana+ Advanced)
// @description.en = Banca Intesa - Import account statement .csv (Banana+ Advanced)
// @description.de = Banca Intesa - Bewegungen importieren .csv (Banana+ Advanced)
// @description.fr = Banca Intesa - Importer mouvements .csv (Banana+ Advanced)
// @description.it = Banca Intesa - Importa movimenti .csv (Banana+ Advanced)
// @doctype = *
// @docproperties =
// @task = import.transactions
// @outputformat = transactions.simple
// @inputdatasource = openfiledialog
// @inputencoding = latin1
// @inputfilefilter = Text files (*.txt *.csv);;All files (*.*)
// @inputfilefilter.de = Text (*.txt *.csv);;Alle Dateien (*.*)
// @inputfilefilter.fr = Texte (*.txt *.csv);;Tous (*.*)
// @inputfilefilter.it = Testo (*.txt *.csv);;Tutti i files (*.*)
// @includejs = import.utilities.js

/**
 * Parse the data and return the data to be imported as a tab separated file.
 */
function exec(inData, isTest) {

	var importUtilities = new ImportUtilities(Banana.document);

	if (isTest !== true && !importUtilities.verifyBananaAdvancedVersion())
		return "";

	convertionParam = defineConversionParam(inData);

	var transactions = Banana.Converter.csvToArray(inData, convertionParam.separator, convertionParam.textDelim);

	// Format 1
	var format1 = new Intesa_Format1();
	if (format1.match(transactions)) {
		transactions = format1.convert(transactions);
		return Banana.Converter.arrayToTsv(transactions);
	}

	// Format 2 (Lista Operazioni).
	let format2 = new Intesa_Format2();
	let transactionsData = format2.getFormattedData(transactions, importUtilities);
	if (format2.match(transactionsData)) {
		let convTr = format2.convert(transactionsData);
		return Banana.Converter.arrayToTsv(convTr);
	}

	// Format 3 (Lista Movimenti).
	let format3 = new Intesa_FormatCc1();
	transactionsData = format3.getFormattedData(transactions, importUtilities);
	if (format3.match(transactionsData)) {
		let convTr = format3.convert(transactionsData);
		return Banana.Converter.arrayToTsv(convTr);
	}

	importUtilities.getUnknownFormatError();

	return "";
}

/** Format Credit Card 1
 * ,,,,,,,,
 * ,,,,,,,,
 * ,,,,,,,,
 * ,,,,,,,,
 * ,,,,,,,,
 * ,,,N.B.: I dati esposti nella presente lista hanno carattere puramente informativo.,,,,,
 * ,,,,,,,,
 * ,,Intestatario carta:,HOMO SAPIENS SAPIENS,,,,,
 * ,,Numero carta,1234 **** **** 4321,,,,,
 * ,,Conto di riferimento:,00012345,,,,,
 * ,,,,,,,,
 * ,,Disponibilità residua al:,27.12.2024,998.01,,,,
 * ,,,,,,,,
 * ,,Sbilancio alla data:,27.12.2024,139.53,,,,
 * ,,,,,,,,
 * ,,Entrate/Uscite: ,Tutte,,,,,
 * ,,Tipologia movimenti selezionata: ,Tutti,,,,,
 * ,,Ricerca per:,-,,,,,
 * ,,Importo:,tutti,,,,,
 * ,,,,,,,,
 * ,,Periodo:,Da 01.09.2024 A 27.12.2024,,,,,
 * ,,Controvalore in:,Euro,,,,,
 * ,,I movimenti selezionati sono:,4,,,,,
 * ,,,,,,,,
 * ,,,,,,,,
 * ,,,,,,,,
 * ,,,,,,,,
 * Operazioni contabilizzate,,,,,,,,
 * ,,,,,,,,
 * Data contabile,Data operazione,Descrizione,Accrediti in valuta,Accrediti,Addebiti in valuta,Addebiti,,
 * 28/11/24,26/11/24,Krusty Krabs,,,,5.99,,
 * 28/10/24,26/10/24,Krusty Krabs,,,,5.99,,
 * 29/09/24,26/09/24,Krusty Krabs,,,,5.99,,
 * 27/09/24,25/09/24, ,,,,133.56,,
 * ,,,,,,,,
 * ,,,,,,,,
 * ,,,,,,,,
 * ,,,,,,,,
 * ,,,,,,,,
 * ,,,,,,,,
 * ,,,,,,,,
 * ,,,,,,,,
 * ,,,,,,,,
 * ,,,,,,,,
 * ,,,,,,,,
 * ,,,,,,,,
 * ,,,,,,,,
 * ,,,,,,,,
 * ,,,,,,,,
*/
function Intesa_FormatCc1() {
	/** Return true if the transactions match this format */
	this.match = function (transactionsData) {
		if (transactionsData.length === 0)
			return false;

		for (var i = 0; i < transactionsData.length; i++) {
			var transaction = transactionsData[i];
			var formatMatched = false;

			if (transaction["Date"] && transaction["Date"].length >= 8 &&
				(transactionsData[i]["Date"].match(/^\d{2}\/\d{2}\/\d{2}$/) ||
					transactionsData[i]["Date"].match(/^\d{2}\.\d{2}\.\d{2}$/)))
				formatMatched = true;
			else
				formatMatched = false;

			if (formatMatched)
				return true;
		}

		return false;
	}

	this.convertHeaderIt = function (columns) {
		let convertedColumns = [];

		for (var i = 0; i < columns.length; i++) {
			switch (columns[i]) {
				case "Data contabile":
					convertedColumns[i] = "Date";
					break;
				case "Data operazione":
					convertedColumns[i] = "DateValue";
					break;
				case "Descrizione":
					convertedColumns[i] = "Description";
					break;
				case "Accrediti":
					convertedColumns[i] = "Income";
					break;
				case "Addebiti":
					convertedColumns[i] = "Expenses";
					break;
				default:
					break;
			}
		}

		if (convertedColumns.indexOf("Date") < 0) {
			return [];
		}

		return convertedColumns;
	}

	this.getFormattedData = function (inData, importUtilities) {
		var columns = importUtilities.getHeaderData(inData, 29); //array
		var rows = importUtilities.getRowData(inData, 30); //array of array
		let form = [];

		let convertedColumns = [];

		convertedColumns = this.convertHeaderIt(columns);

		//Load the form with data taken from the array. Create objects
		if (convertedColumns.length > 0) {
			importUtilities.loadForm(form, convertedColumns, rows);
			return form;
		}

		return [];
	}

	this.convert = function (transactionsData) {
		var transactionsToImport = [];

		for (var i = 0; i < transactionsData.length; i++) {

			if (transactionsData[i]["Date"] && transactionsData[i]["Date"].length >= 8 &&
				(transactionsData[i]["Date"].match(/^\d{2}\/\d{2}\/\d{2}$/) ||
					transactionsData[i]["Date"].match(/^\d{2}\.\d{2}\.\d{2}$/))) {
				transactionsToImport.push(this.mapTransaction(transactionsData[i]));
			}
		}

		// Sort rows by date
		transactionsToImport = transactionsToImport.reverse();

		// Add header and return
		var header = [["Date", "DateValue", "Doc", "ExternalReference", "Description", "Income", "Expenses"]];

		return header.concat(transactionsToImport);
	}

	this.mapTransaction = function (transaction) {
		let mappedLine = [];

		mappedLine.push(Banana.Converter.toInternalDateFormat(transaction["Date"], "dd.mm.yyyy"));
		mappedLine.push(Banana.Converter.toInternalDateFormat(transaction["DateValue"], "dd.mm.yyyy"));
		mappedLine.push("");
		mappedLine.push("");
		mappedLine.push(transaction["Description"]);
		mappedLine.push(Banana.Converter.toInternalNumberFormat(transaction["Income"], '.'));
		mappedLine.push(Banana.Converter.toInternalNumberFormat(transaction["Expenses"], '.'));


		return mappedLine;
	}
}

/** Format 2
 * ;;;;;;;;
 * ;;;;;;;;
 * ;;;;;;;;
 * ;;;;;;;;
 * ;;;;;;;;
 * ;;;;;N.B.: I dati esposti nella presente lista hanno carattere puramente informativo.;;;
 * ;;Intestatario conto:;MY COMPANY;;;;;
 * ;;Numero conto:;1111111111111;;;;;
 * ;;Filiale:;Filiale xxx, MILANO (MI);;;;;
 * ;;;;;;;;
 * ;;Saldo contabile iniziale al:;17.04.2024;2'345;;;;
 * ;;Saldo contabile finale al:;17.05.2024;5'432;;;;
 * ;;;;;;;;
 * ;;Saldo disponibile  al (escluso Fido):;17.05.2024;5'432;;;;
 * ;;Importo Fido:;;-;;;;
 * ;;;;;;;;
 * ;;Entrate/Uscite:;Tutte;;;;;
 * ;;;;;;;;
 * ;;Ricerca Per:;-;;;;;
 * ;;Importo:;-;;;;;
 * ;;Tipologia movimenti selezionata:;Tutti;;;;;
 * ;;Controvalore in:;EUR;;;;;
 * ;;I movimenti selezionati sono:;44;;;;;
 * ;;;;;;;;
 * ;;;;;;;;
 * ;;;Operazioni contabilizzate;;;;;
 * ;;;;;;;;
 * Data contabile;Data valuta;Descrizione;Accrediti;Addebiti;Descrizione estesa;Effettuata tramite:;;
 * ;;Saldo contabile iniziale in Euro;;2'345;;;;
 * 18.04.24;18.04.24;ACCREDITO;640.00;;DESCR ESTESA;;;
 * 19.04.24;19.04.24;ACCREDITO;100.00;;DESCR ESTESA;;;
 * 19.04.24;19.04.24;ACCREDITO;600.00;;DESCR ESTESA;;;
 * 22.04.24;22.04.24;ACCREDITO;240.00;;DESCR ESTESA;;;
 * 24.04.24;24.04.24;ACCREDITO;127.60;;DESCR ESTESA;;;
 * 26.04.24;26.04.24;PAGAMENTO;;-22.88;DESCR ESTESA;;;
 * 
 * ......
 * 
 * ;;Saldo contabile finale in Euro;;5'432;;;;
 * ;;;;;;;;
 * ;;;Operazioni non contabilizzate;;;;;
 * ;;;;;;;;
 * ;Data;Descrizione;Accrediti;Addebiti;Descrizione estesa;;;
 * ;17.05.24;PRENOTAZIONE BOLLETTA CBILL;;-746.30;PAGAMENTO BOLLETTINO SU C-BILL;;;
 * ;;;;;;;;
 * ;;;;;;;;
 * ;;;;;;;;
 * ;;;;;;;;
 * ;;;;;;;;
 * 
 * In some cases the decimal separator could change, as we work with an Excel file, it detects the
 * regional setting. We define the separator used directly checking the amounts.
 * Amounts do not have thousands separator.
*/
function Intesa_Format2() {
	this.decimalSeparator = ".";

	this.getFormattedData = function (inData, importUtilities) {

		let columns = this.getHeaderData(inData, 27); //array
		let rows = importUtilities.getRowData(inData, 29); //array of array
		let form = [];

		let convertedColumns = [];

		convertedColumns = this.convertHeaderIt(columns);
		if (convertedColumns.length > 0) {
			importUtilities.loadForm(form, convertedColumns, rows);
			return form;
		}

		return [];
	}

	/**
	 * We are redefining the original method taken from the utilities file so that 
	 * does not insert index numbers in empty fields but an empty string.
	 */
	this.getHeaderData = function (inData, startLineNumber) {
		if (!startLineNumber) {
			startLineNumber = 0;
		}
		var headerData = inData[startLineNumber];
		for (var i = 0; i < headerData.length; i++) {

			headerData[i] = headerData[i].trim();

			if (!headerData[i]) {
				headerData[i] = "";
			}
		}
		return headerData;
	}

	/**
	 * The problem with the headers for this format is that once copied from excel it is copied formatted over several rows, inserting 
	 * the "Operaz" and "Valuta" columns last, but the way the data are arranged we then have to make sure that the new headings
	 * follow the correct order.
	 */
	this.convertHeaderIt = function (columns) {
		let convertedColumns = [];

		columns.indexOf("Data contabile") >= 0 ? convertedColumns[0] = "Date" : "";
		columns.indexOf("Data valuta") >= 0 ? convertedColumns[1] = "DateValue" : "";
		columns.indexOf("Descrizione") >= 0 ? convertedColumns[2] = "Description" : "";
		columns.indexOf("Accrediti") >= 0 ? convertedColumns[3] = "Income" : "";
		columns.indexOf("Addebiti") >= 0 ? convertedColumns[4] = "Expenses" : "";
		columns.indexOf("Descrizione estesa") >= 0 ? convertedColumns[5] = "Notes" : "";

		if (convertedColumns.indexOf("Date") < 0
			|| convertedColumns.indexOf("Description") < 0
			|| convertedColumns.indexOf("Income") < 0
			|| convertedColumns.indexOf("Expenses") < 0
			|| convertedColumns.indexOf("Notes") < 0) {
			return [];
		}
		return convertedColumns;
	}

	/** Return true if the transactions match this format */
	this.match = function (transactionsData) {

		if (transactionsData.length === 0)
			return false;

		for (var i = 0; i < transactionsData.length; i++) {
			var transaction = transactionsData[i];

			var formatMatched = false;

			if (transaction["Date"] && transaction["Date"].length >= 8 &&
				transaction["Date"].match(/^[0-9]+[\/\.]+[0-9]+[\/\.][0-9]+$/))
				formatMatched = true;
			else
				formatMatched = false;

			if (transaction["DateValue"] && transaction["DateValue"].length >= 8 &&
				transaction["DateValue"].match(/^[0-9]+[\/\.]+[0-9]+[\/\.][0-9]+$/))
				formatMatched = true;
			else
				formatMatched = false;

			if (formatMatched)
				return true;
		}
		return false;
	}

	/** Convert the transaction to the format to be imported */
	this.convert = function (rows) {
		var transactionsToImport = [];
		this.setDecimalSeparator(rows);

		for (const row of rows) {
			if (row["Date"] && row["Date"].length >= 8 &&
				row["Date"].match(/^[0-9]+[\/\.][0-9]+[\/\.][0-9]+$/))
				transactionsToImport.push(this.mapTransaction(row));
		}

		// Add header and return
		var header = [["Date", "DateValue", "Doc", "Description", "Income", "Expenses"]];
		return header.concat(transactionsToImport);
	}

	this.setDecimalSeparator = function (rows) {
		for (const row of rows) {
			if ((row["Income"] && row["Income"].indexOf(",") >= 0) ||
				(row["Expenses"] && row["Expenses"].indexOf(",") >= 0)) {
				this.decimalSeparator = ","
				return;
			}
		}
	}

	/** Return the transaction converted in the import format */
	this.mapTransaction = function (element) {
		var mappedLine = [];
		let date = element['Date'];
		if (date.indexOf(".") > -1) {
			mappedLine.push(Banana.Converter.toInternalDateFormat(element['Date'], "dd.mm.yy"));
			mappedLine.push(Banana.Converter.toInternalDateFormat(element['DateValue'], "dd.mm.yy"));
		} else {
			mappedLine.push(Banana.Converter.toInternalDateFormat(element['Date'], "dd/mm/yy"));
			mappedLine.push(Banana.Converter.toInternalDateFormat(element['DateValue'], "dd/mm/yy"));
		}
		mappedLine.push(""); // Doc is empty for now
		mappedLine.push(Banana.Converter.stringToCamelCase(this.getCompleteDescription(element)));
		mappedLine.push(Banana.Converter.toInternalNumberFormat(element['Income'], this.decimalSeparator));
		let expAmount = element['Expenses'].replace(/-/g, '');
		mappedLine.push(Banana.Converter.toInternalNumberFormat(expAmount, this.decimalSeparator));

		return mappedLine;
	}

	this.getCompleteDescription = function (element) {
		const tidyDescr = element['Description'].replace(/[\\"\r\n]/g, " ");
		const tidyNotes = element['Notes'].replace(/[\\"\r\n]/g, " ");
		let completeDescription = "";
		if (tidyDescr.length > 0)
			completeDescription = tidyDescr;
		if (tidyNotes.length > 0) {
			if (completeDescription.length > 0)
				completeDescription += ", ";
			completeDescription += tidyNotes;
		}
		return completeDescription;
	}
}

/**
 * Format 1
 *;Conti e Carte:;Conto 1000/12345678;;;;;;;
 * ;;XME CARD PLUS MC MAGAZZINO     ****1234;;;;;;;
 * ;;Debit Visa ****1234;;;;;;;
 * ;;Carta Credit Visa ****4321;;;;;;;
 * ;;;;;;;;;
 * ;Finanziamento:;-;;;;;;;
 * ;;;;;;;;;
 * ;Investimenti e previdenza:;Fondi Pensione 1234/87654321;;;;;;;
 * ;;;;;;;;;
 * ;I movimenti selezionati sono:;30;Tipo operazione: ;Tutti;;;;;
 * ;;;;;;;;;
 * ;;;;;;;;;
 * ;;;;;;;;;
 * ;;;;;;;;;
 * Data;Operazione;Dettagli;Conto o carta;Contabilizzazione;Categoria ;Valuta;Importo;;
 * 22.09.2023;Pagamento Tramite Pos;Dettaglio Pagamento;Conto 1234/12345678;NON CONTABILIZZATO;Altre uscite;EUR;-2.40;;
 * 22.09.2023;Pagamento Tramite Pos;Dettaglio Pagamento;Conto 1234/12345678;NON CONTABILIZZATO;Altre uscite;EUR;-20.00;;
 * 22.09.2023;Pagamento Tramite Pos;Dettaglio Pagamento;Conto 1234/12345678;NON CONTABILIZZATO;Altre uscite;EUR;-2.60;;
 * 
 */
function Intesa_Format1() {
	this.colDate = 0;
	this.colOperationType = 1;
	this.colOperationDetail = 2;
	this.colPaymentMethod = 3; //Conto o Carta
	this.colBooking = 4;
	this.colCategory = 5;
	this.colAmount = 7;

	this.csvColCount = 10; //When Excel converts the file in excel the columns are 10.
	this.excelColAmount = 8;
	this.decimalSeparator = '.';

	/** Return true if the transactions match this format */
	this.match = function (transactions) {
		if (transactions.length === 0)
			return false;

		for (i = 0; i < transactions.length; i++) {
			var transaction = transactions[i];

			var formatMatched = false;

			/* array should have all columns */
			if (transaction.length === (this.csvColCount) || transaction.length === (this.excelColAmount))
				formatMatched = true;
			else
				formatMatched = false;

			if (formatMatched && transaction[this.colDate] && transaction[this.colDate].match(/^[0-9]+[./][0-9]+[./][0-9]+$/))
				formatMatched = true;
			else
				formatMatched = false;

			if (formatMatched)
				return true;
		}

		return false;
	}

	/** Convert the transaction to the format to be imported */
	this.convert = function (transactions) {
		var transactionsToImport = [];

		// Filter and map rows
		for (i = 0; i < transactions.length; i++) {
			var transaction = transactions[i];
			if (transaction.length < (this.colNotes)) {
				continue;
			}
			if (transaction[this.colDate] && transaction[this.colDate].match(/^[0-9]+[./][0-9]+[./][0-9]+$/)) {
				transactionsToImport.push(this.mapTransaction(transaction));
			}
		}

		// Add header and return
		var header = [["Date", "Doc", "Description", "Notes", "Income", "Expenses"]];
		return header.concat(transactionsToImport);
	}

	this.mapTransaction = function (element) {
		var mappedLine = [];

		var dateText = element[this.colDate].substring(0, 10);
		if (dateText.indexOf(".") > -1)
			mappedLine.push(Banana.Converter.toInternalDateFormat(dateText, "dd.mm.yyyy"));
		else if (dateText.indexOf("/") > -1)
			mappedLine.push(Banana.Converter.toInternalDateFormat(dateText, "dd/mm/yyyy"));
		else
			mappedLine.push(Banana.Converter.toInternalDateFormat(dateText, "dd-mm-yyyy"));
		mappedLine.push(""); // Doc is empty for now
		let description = element[this.colOperationType] + ", " + element[this.colOperationDetail] + ", " + element[this.colPaymentMethod];
		mappedLine.push(description);
		mappedLine.push(element[this.colBooking]);
		let amount = element[this.colAmount];
		if (amount.indexOf(",") > 0)
			this.decimalSeparator = ",";
		if (amount.length > 0) {
			if (amount.substring(0, 1) === '-') {
				mappedLine.push("");
				if (amount.length > 1)
					amount = amount.substring(1);
				mappedLine.push(Banana.Converter.toInternalNumberFormat(amount, this.decimalSeparator));
			} else {
				mappedLine.push(Banana.Converter.toInternalNumberFormat(amount, this.decimalSeparator));
				mappedLine.push("");
			}
		} else {
			mappedLine.push("");
			mappedLine.push("");
		}

		return mappedLine;
	}
}

function defineConversionParam(inData) {
	var convertionParam = {};
	/** SPECIFY THE SEPARATOR AND THE TEXT DELIMITER USED IN THE CSV FILE */
	convertionParam.format = "csv"; // available formats are "csv", "html"
	//get text delimiter
	convertionParam.textDelim = "§";
	// get separator
	convertionParam.separator = findSeparator(inData);

	/** SPECIFY THE COLUMN TO USE FOR SORTING
	If sortColums is empty the data are not sorted */
	convertionParam.sortColums = ["Date", "Description"];
	convertionParam.sortDescending = false;

	return convertionParam;
}

function findSeparator(inData) {

	var commaCount = 0;
	var semicolonCount = 0;
	var tabCount = 0;

	for (var i = 0; i < 1000 && i < inData.length; i++) {
		var c = inData[i];
		if (c === ',')
			commaCount++;
		else if (c === ';')
			semicolonCount++;
		else if (c === '\t')
			tabCount++;
	}

	if (tabCount > commaCount && tabCount > semicolonCount) {
		return '\t';
	}
	else if (semicolonCount > commaCount) {
		return ';';
	}

	return ',';
}
