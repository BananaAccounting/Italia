// Copyright [2023] [Banana.ch SA - Lugano Switzerland]
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
// @pubdate = 2023-09-29
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

	importUtilities.getUnknownFormatError();

	return "";
}

/**
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

	this.colCount = 10;

	/** Return true if the transactions match this format */
	this.match = function (transactions) {
		if (transactions.length === 0)
			return false;

		for (i = 0; i < transactions.length; i++) {
			var transaction = transactions[i];

			var formatMatched = false;

			/* array should have all columns */
			if (transaction.length === (this.colCount))
				formatMatched = true;
			else
				formatMatched = false;

			if (formatMatched && transaction[this.colDate] && transaction[this.colDate].match(/^[0-9]+\.[0-9]+\.[0-9]+$/))
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
			if (transaction[this.colDate] && transaction[this.colDate].match(/^[0-9]+\.[0-9]+\.[0-9]+$/)) {
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
		if (element[this.colAmount].length > 0) {
			if (element[this.colAmount].substring(0, 1) === '-') {
				mappedLine.push("");
				var amount;
				if (element[this.colAmount].length > 1)
					amount = element[this.colAmount].substring(1);
				mappedLine.push(Banana.Converter.toInternalNumberFormat(amount, '.'));
			} else {
				mappedLine.push(Banana.Converter.toInternalNumberFormat(element[this.colAmount], '.'));
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
