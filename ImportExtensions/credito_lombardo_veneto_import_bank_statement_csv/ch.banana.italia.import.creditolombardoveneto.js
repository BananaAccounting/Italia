// Copyright [2026] [Banana.ch SA - Lugano Switzerland]
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

// @id = ch.banana.italia.import.creditolombardoveneto
// @api = 1.0
// @pubdate = 2026-05-13
// @publisher = Banana.ch SA
// @description = Credito Lombardo Veneto - Import account statement .csv (Banana+ Advanced)
// @description.en = Credito Lombardo Veneto - Import account statement .csv (Banana+ Advanced)
// @description.de = Credito Lombardo Veneto - Bewegungen importieren .csv (Banana+ Advanced)
// @description.fr = Credito Lombardo Veneto - Importer mouvements .csv (Banana+ Advanced)
// @description.it = Credito Lombardo Veneto - Importa movimenti .csv (Banana+ Advanced)
// @doctype = *
// @docproperties =
// @task = import.transactions
// @outputformat = transactions.simple
// @inputdatasource = openfiledialog
// @inputencoding = utf8
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
	var CLVFormat1 = new CreditoLombardoVenetoFormat1();
	var transactionsData = CLVFormat1.getFormattedData(transactions, importUtilities);
	if (CLVFormat1.match(transactionsData)) {
		transactions = CLVFormat1.convert(transactionsData);
		return Banana.Converter.arrayToTsv(transactions);
	}

	importUtilities.getUnknownFormatError();

	return "";
}

/**
 * Credito Lombardo Veneto format 1
 * DATA;VALUTA;DARE;AVERE;DIVISA;DESCRIZIONE_OPERAZIONE;CAUSALE_ABI
 * 29/04/2026;27/04/2026;100,00;;EUR;PAGAMENTO;43
 * 04/05/2026;29/04/2026;41,05;;EUR;PAGAMENTO;43
 * 04/05/2026;prenotata;33,35;;EUR;PRE-ADDEBITO;
 * 04/05/2026;;;555,39;EUR;Saldo contabile;
 * 04/05/2026;;;555,39;EUR;Saldo liquido;
 * 04/05/2026;;;777,04;EUR;Disponibilità al;
 * 
 * This format contains, in addition to the transactions, balance information such as:
 * - Accounting balance
 * - Liquid balance
 * - Available balance
 * These entries are identified by the fact that the "VALUTA" field is empty and
 * are not imported.
 */
function CreditoLombardoVenetoFormat1() {
	/** Return true if the transactions match this format */
    this.match = function (transactionsData) {
		if (transactionsData.length === 0)
		   	return false;
  
		for (var i = 0; i < transactionsData.length; i++) {
			var transaction = transactionsData[i];
			var formatMatched = true;
		   
			if (formatMatched && transaction["Date"] && transaction["Date"].length >= 10 &&
				(transaction["Date"].match(/^\d{2}\/\d{2}\/\d{4}$/) || 
				transaction["Date"].match(/^\d{2}\.\d{2}\.\d{4}$/)))
				formatMatched = true;
			else
				formatMatched = false;
	
			if (formatMatched)
				return true;
		}
  
		return false;
	 }
 
	 this.getFormattedData = function (inData, importUtilities) {
		let headerLineStart = 0;
		let dataLineStart = 1;
		let transactionsCopy = JSON.parse(JSON.stringify(inData));
		if (transactionsCopy.length < dataLineStart)
			return [];
		var columns = importUtilities.getHeaderData(inData, headerLineStart); //array
		var rows = importUtilities.getRowData(inData, dataLineStart); //array of array
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
 
	this.convertHeaderIt = function (columns) {
		let convertedColumns = [];
		
		for (var i = 0; i < columns.length; i++) {
			switch (columns[i]) {
				case "DATA":
					convertedColumns[i] = "Date";
					break;
				case "VALUTA":
					convertedColumns[i] = "DateValue";
					break;
				case "DARE":
					convertedColumns[i] = "Expenses";
					break;
				case "AVERE":
					convertedColumns[i] = "Income";
					break;
				case "DIVISA":
					convertedColumns[i] = "Currency";
					break;
				case "DESCRIZIONE_OPERAZIONE":
					convertedColumns[i] = "Description";
					break;
				case "CAUSALE_ABI":
					convertedColumns[i] = "AbiCode";
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
  
	this.convert = function (transactionsData) {
		var transactionsToImport = [];
  
		for (var i = 0; i < transactionsData.length; i++) {
		   
			/** 
			 * Valid transactions have a date in format "dd/MM/yyyy"
			 * and a date values that could be too in format "dd/MM/yyyy".
			 * Entries with no value in DateValue field are not managed as transactions.
			 */
		   if (this.isValidDate(transactionsData[i]["Date"]) && transactionsData[i]["DateValue"]) {
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
	
		mappedLine.push(Banana.Converter.toInternalDateFormat(transaction["Date"], "dd/mm/yyyy"));
		if (this.isValidDate(transaction["DateValue"])){
			mappedLine.push(Banana.Converter.toInternalDateFormat(transaction["DateValue"], "dd/mm/yyyy"));
		} else {
			mappedLine.push("");
		}		
		mappedLine.push("");
		mappedLine.push("");
		mappedLine.push(transaction["Description"]);		
		mappedLine.push(Banana.Converter.toInternalNumberFormat(transaction["Income"], ','));		
		mappedLine.push(Banana.Converter.toInternalNumberFormat(transaction["Expenses"], ','));       
		

		return mappedLine;
	}

	this.isValidDate = function (date) {
		if (date && date.length >= 10 && date.match(/^\d{2}\/\d{2}\/\d{4}$/))
			return true;
		else
			return false;
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
