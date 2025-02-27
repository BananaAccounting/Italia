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

/**
 * Format 2
 * The format is as follows:
 * Data Registrazione;Data valuta;Descrizione;Importo (EUR);
 * 19.02.2025;19.02.2025;ADDEBITO      Incasso 105XXX6018                                SDD da ITXXXXXX000093026890017                    VODAFONE                                   mandato nr. XXXXXXX                      Vodafone Italy;-14,49;
 * 10.02.2025;10.02.2025;PAGAMENTO           ESTRATTO 01/2025 CARTA 5XXXXXXXXXXX7710;-810,85;
 * 10.02.2025;10.02.2025;ADDEBITO          Incasso 01605XXXX1423534438                       SDD da ITXXXXXX100000488410010                    TELECOMITALIA                                 mandato nr. XXXXX0;-42,90;
 */
function UnicreditFormat2() {
	this.decimalSeparator = ",";

	this.getFormattedData = function (inData, importUtilities) {
		var columns = importUtilities.getHeaderData(inData, 0); //array
		var rows = importUtilities.getRowData(inData, 1); //array of array
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
				case "Data Registrazione":
					convertedColumns[i] = "Date";
					break;
				case "Data valuta":
					convertedColumns[i] = "DateValue";
					break;
				case "Descrizione":
					convertedColumns[i] = "Description";
					break;
				case "Importo (EUR)":
				case "Importo (CHF)":
				case "Importo (USD)":
				case "Importo (GBP)":
					convertedColumns[i] = "Amount";
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

	/** Return true if the transactions match this format */
	this.match = function (transactionsData) {

		if (transactionsData.length === 0)
			return false;

		for (var i = 0; i < transactionsData.length; i++) {
			var transaction = transactionsData[i];

			var formatMatched = false;

			if (transaction["Date"] && transaction["Date"].length >= 10 &&
				transaction["Date"].match(/^[0-9]+[\/\.]+[0-9]+[\/\.][0-9]+$/))
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

		for (var i = 0; i < rows.length; i++) {
			if (rows[i]["Date"] && rows[i]["Date"].length >= 10 &&
				rows[i]["Date"].match(/^[0-9]+[\/\.][0-9]+[\/\.][0-9]+$/))
				transactionsToImport.push(this.mapTransaction(rows[i]));
		}

		transactionsToImport = transactionsToImport.reverse();

		// Add header and return
		var header = [["Date", "DateValue", "Doc", "Description", "Income", "Expenses"]];
		return header.concat(transactionsToImport);
	}

	/** Return the transaction converted in the import format */
	this.mapTransaction = function (element) {
		var mappedLine = [];
		let date = element['Date'];

		if (date.indexOf(".") > -1) {
			mappedLine.push(Banana.Converter.toInternalDateFormat(element['Date'], "dd.mm.yyyy"));
			mappedLine.push(Banana.Converter.toInternalDateFormat(element['DateValue'], "dd.mm.yyyy"));
		} else {
			mappedLine.push(Banana.Converter.toInternalDateFormat(element['Date'], "dd/mm/yyyy"));
			mappedLine.push(Banana.Converter.toInternalDateFormat(element['DateValue'], "dd/mm/yyyy"));
		}
		mappedLine.push(""); // Doc is empty for now
		let cleanDescription = this.removeMultipleSpaces(element['Description']);
		mappedLine.push(cleanDescription);
		let amount = element['Amount'];
		if (amount.indexOf("-") < 0) {
			mappedLine.push(Banana.Converter.toInternalNumberFormat(amount, this.decimalSeparator));
			mappedLine.push("");
		}
		else {
			amount = amount.replace(/-/g, ''); //remove minus sign
			mappedLine.push("");
			mappedLine.push(Banana.Converter.toInternalNumberFormat(amount, this.decimalSeparator));
		}

		return mappedLine;
	}

	/**
	 * Clean the description from unwanted characters.
	 * Use a regex to find blocks of spaces of variable length up to 20 characters.
	 */
	this.removeMultipleSpaces = function (description) {
		if (!description)
			return "";
		else
			return description.replace(/ {2,20}/g, " ");
	}

}

/**
 * Currently, Unicredit provides only .xls format but excel allows to convert the file in .csv format , the csv looks as follows:
 * Rapporto IT XX X XXXXX XXXXX XXXXXXXXXX - MY COMPANY;;;;
 * ;;;;
 * Data;;Descrizione;EUR;Caus.
 * Operaz.;Valuta;;;
 * 01.11.2023;01.11.2023;Descrizione;-12.41;198
 * 02.11.2023;01.11.2023;Descrizione;-66.98;280
 * 02.11.2023;01.11.2023;Descrizione;-13.11;280
 * 10.11.2023;07.11.2023;Descrizione;043
 * 
 * Dates could also be in the following format:
 * 02/01/2024;01/01/2024;DESCRIZIONE;-6,86;198
 * 02/01/2024;02/01/2024;DESCRIZIONE;-1.438,74;208
 * 02/01/2024;02/01/2024;DESCRIZIONE;-1.171,74;208
 * 
 * Both formats (.xls and .csv) are valid.
 */
function UnicreditFormat1() {
	this.decimalSeparator = ".";

	this.getFormattedData = function (inData, importUtilities) {
		/**
		 * The header is splitted on two different rows-> 2 and 3
		 */
		let columnsFirst = this.getHeaderData(inData, 2); //array
		let columnsSecond = this.getHeaderData(inData, 3); //array
		let columns = columnsFirst.concat(columnsSecond);
		let filteredColumns = columns.filter(element => element !== "" && element !== undefined);
		let rows = importUtilities.getRowData(inData, 4); //array of array
		let form = [];

		let convertedColumns = [];

		convertedColumns = this.convertHeaderIt(filteredColumns);
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

			//Avoid duplicate headers -> Not useful in this case.
			/**var headerPos = headerData.indexOf(headerData[i]);
			if (headerPos >= 0 && headerPos < i) { // Header already exist
				var postfixIndex = 2;
				while (headerData.indexOf(headerData[i] + postfixIndex.toString()) !== -1 && postfixIndex <= 99)
					postfixIndex++; // Append an incremental index
				headerData[i] = headerData[i] + postfixIndex.toString()
			}*/

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

		columns.indexOf("Data") >= 0 ? convertedColumns[0] = "Date" : "";
		columns.indexOf("Valuta") >= 0 ? convertedColumns[1] = "DateValue" : "";
		columns.indexOf("Descrizione") >= 0 ? convertedColumns[2] = "Description" : "";
		columns.indexOf("EUR") >= 0 ? convertedColumns[3] = "Amount" : "";
		columns.indexOf("Operaz.") >= 0 ? convertedColumns[4] = "Notes" : "";

		if (convertedColumns.indexOf("Date") < 0
			|| convertedColumns.indexOf("Description") < 0
			|| convertedColumns.indexOf("Amount") < 0) {
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

			if (transaction["Date"] && transaction["Date"].length >= 10 &&
				transaction["Date"].match(/^[0-9]+[\/\.]+[0-9]+[\/\.][0-9]+$/))
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

		for (var i = 0; i < rows.length; i++) {
			if (rows[i]["Date"] && rows[i]["Date"].length >= 10 &&
				rows[i]["Date"].match(/^[0-9]+[\/\.][0-9]+[\/\.][0-9]+$/))
				transactionsToImport.push(this.mapTransaction(rows[i]));
		}

		transactionsToImport = transactionsToImport.reverse();

		// Add header and return
		var header = [["Date", "DateValue", "Doc", "Description", "Income", "Expenses", "Notes"]];
		return header.concat(transactionsToImport);
	}

	/** Return the transaction converted in the import format */
	this.mapTransaction = function (element) {
		var mappedLine = [];
		let date = element['Date'].substring(0, 10);

		if (date.indexOf(".") > -1) {
			mappedLine.push(Banana.Converter.toInternalDateFormat(element['Date'], "dd.mm.yyyy"));
			mappedLine.push(Banana.Converter.toInternalDateFormat(element['DateValue'], "dd.mm.yyyy"));
		} else {
			mappedLine.push(Banana.Converter.toInternalDateFormat(element['Date'], "dd/mm/yyyy"));
			mappedLine.push(Banana.Converter.toInternalDateFormat(element['DateValue'], "dd/mm/yyyy"));
		}
		mappedLine.push(""); // Doc is empty for now
		var tidyDescr = element['Description'].replace(/\r\n/g, " "); //remove new line && new row characters
		mappedLine.push(Banana.Converter.stringToCamelCase(tidyDescr));
		let amount = element['Amount'];
		if (amount.indexOf(",") > 0)
			this.decimalSeparator = ",";
		if (amount.indexOf("-") < 0) {
			mappedLine.push(Banana.Converter.toInternalNumberFormat(amount, this.decimalSeparator));
			mappedLine.push("");
		}
		else {
			amount = amount.replace(/-/g, ''); //remove minus sign
			mappedLine.push("");
			mappedLine.push(Banana.Converter.toInternalNumberFormat(amount, this.decimalSeparator));
		}

		mappedLine.push(element['Notes']);

		return mappedLine;
	}

}

/**
 * The function findSeparator is used to find the field separator.
 */
function findSeparator(string) {

	var commaCount = 0;
	var semicolonCount = 0;
	var tabCount = 0;

	for (var i = 0; i < 1000 && i < string.length; i++) {
		var c = string[i];
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