// @id = ch.banana.italia.import.bancaannia
// @api = 1.0
// @pubdate = 2023-06-19
// @publisher = Banana.ch SA
// @description = Banca Annia - Import account statement .xls/.xlsx (Banana+ Advanced)
// @description.en = Banca Annia - Import account statement .xls/.xlsx (Banana+ Advanced)
// @description.de = Banca Annia - Bewegungen importieren .xls/.xlsx (Banana+ Advanced)
// @description.fr = Banca Annia - Importer mouvements .xls/.xlsx (Banana+ Advanced)
// @description.it = Banca Annia - Importa movimenti .xls/.xlsx (Banana+ Advanced)
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
	var BAFormat1 = new BancaAnniaFormat1();
	if (BAFormat1.match(transactions)) {
		transactions = BAFormat1.convert(transactions);
		return Banana.Converter.arrayToTsv(transactions);
	}

	importUtilities.getUnknownFormatError();

	return "";
}

/**
 * Banca Annia format 1
 * Data contabile	Data valuta	Importo	Descrizione	Note
 * 31.05.2023	31.05.2023	3.736,05	Descrizione Movimento	
 * 29.05.2023	29.05.2023	68,94	Descrizione  Movimento	
 * 15.05.2023	15.05.2023	-1,29	Descrizione movimento	
 * 
 * Dates could be in format: dd.mm.yyyy or dd-mm-yyyy or dd/mm/yyyy
 * 
 */
function BancaAnniaFormat1() {
	this.colDate = 0;
	this.colDateValuta = 1;
	this.colAmount = 2;
	this.colDescr = 3;
	this.colNotes = 4;

	this.colCount = 5;

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

			if (formatMatched && transaction[this.colDate] &&
				(transaction[this.colDate].match(/^[0-9]+\.[0-9]+\.[0-9]+$/) ||
					transaction[this.colDate].match(/^[0-9]+\-[0-9]+\-[0-9]+$/) ||
					transaction[this.colDate].match(/^[0-9]+\/[0-9]+\/[0-9]+$/)
				))
				formatMatched = true;
			else
				formatMatched = false;

			if (formatMatched && transaction[this.colDateValuta] &&
				(transaction[this.colDateValuta].match(/^[0-9]+\.[0-9]+\.[0-9]+$/) ||
					transaction[this.colDateValuta].match(/^[0-9]+\-[0-9]+\-[0-9]+$/) ||
					transaction[this.colDateValuta].match(/^[0-9]+\/[0-9]+\/[0-9]+$/)
				))
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
			if (transaction[this.colDate] &&
				transaction[this.colDate].match(/^[0-9]+\.[0-9]+\.[0-9]+$/) ||
				transaction[this.colDate].match(/^[0-9]+\-[0-9]+\-[0-9]+$/) ||
				transaction[this.colDate].match(/^[0-9]+\/[0-9]+\/[0-9]+$/)) {
				transactionsToImport.push(this.mapTransaction(transaction));
			}
		}

		// Add header and return
		var header = [["Date", "Doc", "Description", "Income", "Expenses"]];
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
		mappedLine.push(element[this.colDescr]);
		if (element[this.colAmount].length > 0) {
			if (element[this.colAmount].substring(0, 1) === '-') {
				mappedLine.push("");
				var amount;
				if (element[this.colAmount].length > 1)
					amount = element[this.colAmount].substring(1);
				mappedLine.push(Banana.Converter.toInternalNumberFormat(amount, ','));
			} else {
				mappedLine.push(Banana.Converter.toInternalNumberFormat(element[this.colAmount], ','));
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
