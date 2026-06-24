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

// @id = ch.banana.italia.import.bper
// @api = 1.0
// @pubdate = 2026-06-24
// @publisher = Banana.ch SA
// @description = BPER Banca - Import account statement .xls/.xlsx (Banana+ Advanced)
// @description.en = BPER Banca - Import account statement .xls/.xlsx (Banana+ Advanced)
// @description.de = BPER Banca - Bewegungen importieren .xls/.xlsx (Banana+ Advanced)
// @description.fr = BPER Banca - Importer mouvements .xls/.xlsx (Banana+ Advanced)
// @description.it = BPER Banca - Importa movimenti .xls/.xlsx (Banana+ Advanced)
// @doctype = *
// @docproperties =
// @task = import.transactions
// @outputformat = transactions.simple
// @inputdatasource = openfiledialog
// @inputencoding = latin1
// @inputfilefilter = Text and Excel files (*.txt *.csv *.xls);;All files (*.*)
// @inputfilefilter.de = Text und Excel (*.txt *.csv *.xls);;Alle Dateien (*.*)
// @inputfilefilter.fr = Texte et Excel (*.txt *.csv *.xls);;Tous (*.*)
// @inputfilefilter.it = Testo ed Excel (*.txt *.csv *.xls);;Tutti i files (*.*)
// @includejs = import.utilities.js

/**
 * Parse the data and return the data to be imported as a tab separated file.
 */
function exec(inData, isTest) {

   if (!inData)
      return "";

   var importUtilities = new ImportUtilities(Banana.document);

   if (isTest !== true && !importUtilities.verifyBananaAdvancedVersion())
      return "";

   convertionParam = defineConversionParam(inData);

	var transactions = Banana.Converter.csvToArray(inData, convertionParam.separator, convertionParam.textDelim);

   var bperFormat1 = new BperFormat1();
   var transactionsData = bperFormat1.getFormattedData(transactions, importUtilities);
   if (bperFormat1.match(transactionsData)) {
      var transactions = bperFormat1.convert(transactionsData);
      return Banana.Converter.arrayToTsv(transactions);
   }

   importUtilities.getUnknownFormatError();
   return "";
}

/**
 * BPER Banca account movements.
 *
 * Data operazione | Data valuta | Descrizione | Entrate | Uscite | Categoria | Stato
 * 30 aprile 2026 | 30 aprile 2026 | ADDEBITO |         | -28.16 | ADDEBITO SDD/RID | Contabilizzato
 * 30 aprile 2026 | 30 aprile 2026 | BONIFICO | 2633.24 |        | BONIFICO         | Contabilizzato
 */
function BperFormat1() {

   this.match = function (transactionsData) {
      if (!transactionsData || transactionsData.length === 0)
         return false;

      for (var i = 0; i < transactionsData.length; i++) {
         if (this.isTransactionRow(transactionsData[i]))
            return true;
      }
      return false;
   }

   this.getFormattedData = function (transactions, importUtilities) {
      const headerIdx = this.getHeaderRowIndex(transactions);
      const dataIdx = headerIdx + 1;
      var columns = importUtilities.getHeaderData(transactions, headerIdx); //array
      var rows = importUtilities.getRowData(transactions, dataIdx); //array of array
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
    * Returns the index of the row wwhere the header data are found.
    * Currently there are two options:
    * - Data copied in clipboard from Excel: index = 17
    * - Data imported from the converted csv: index = 11
    * The index changes as coping directly data from Excel, in the clipboard are
    * saved also some empty rows, meanwhile exporting the file in csv from excel clean
    * and filter a bit the data.
    */
   this.getHeaderRowIndex = function (transactions) {
      if (!transactions)
         return -1;
      const csvIdx = 11;
      const excelIdx = 17;

      excelRef = transactions[excelIdx];
      csvRef = transactions[csvIdx];

      if (this.headersMatch(excelRef))
         return excelIdx;
      else if(this.headersMatch(csvRef))
         return csvIdx;

      return -1;
   }

   this.headersMatch = function (headers) {
      if (!headers)
         return false;
      const  headerDataRef = ["Data operazione","Data valuta","Descrizione","Entrate","Uscite","Categoria","Stato"];
      // If first element is empty we remove it (happens with data imported from clipboard (Excel))
      if (headers[0] === "")
         headers = headers.slice(1);

      if (headers.length !== headerDataRef.length)
         return false;

      for (let i = 0; i < headerDataRef.length; i++) {
         if (headers[i] !== headerDataRef[i])
            return false;
      }
      return true;
   }

   this.convertHeaderIt = function (columns) {
      var convertedColumns = [];
      for (var i = 0; i < columns.length; i++) {
         switch (columns[i]) {
            case "Data operazione":
               convertedColumns[i] = "Date";
               break;
            case "Data valuta":
               convertedColumns[i] = "DateValue";
               break;
            case "Descrizione":
               convertedColumns[i] = "Description";
               break;
            case "Entrate":
               convertedColumns[i] = "Income";
               break;
            case "Uscite":
               convertedColumns[i] = "Expenses";
               break;
            case "Categoria":
               convertedColumns[i] = "Category";
               break;
            case "Stato":
               convertedColumns[i] = "Status";
               break;
            default:
               convertedColumns[i] = "_Column" + i.toString();
               break;
         }
      }

      if (convertedColumns.indexOf("Date") < 0 || convertedColumns.indexOf("DateValue") < 0 ||
         convertedColumns.indexOf("Description") < 0 || convertedColumns.indexOf("Income") < 0 ||
         convertedColumns.indexOf("Expenses") < 0) {
         return [];
      }

      return convertedColumns;
   }

   this.convert = function (transactionsData) {
      var transactionsToImport = [];

      for (var i = 0; i < transactionsData.length; i++) {
         if (this.isTransactionRow(transactionsData[i]))
            transactionsToImport.push(this.mapTransaction(transactionsData[i]));
      }

      // BPER exports the newest movements first.
      transactionsToImport = transactionsToImport.reverse();

      var header = [["Date", "DateValue", "Doc", "ExternalReference", "Description", "Income", "Expenses"]];
      return header.concat(transactionsToImport);
   }

   this.isTransactionRow = function (transaction) {
      if (!transaction)
         return false;

      var date = convertBperDate(transaction["Date"]);
      if (!date)
         return false;

      return !!(transaction["Income"] || transaction["Expenses"]);
   }

   this.mapTransaction = function (transaction) {
      var mappedLine = [];
      mappedLine.push(convertBperDate(transaction["Date"]));
      mappedLine.push(convertBperDate(transaction["DateValue"]));
      mappedLine.push("");
      mappedLine.push("");
      mappedLine.push(this.getCompleteDescription(transaction));
      mappedLine.push(this.convertAmount(transaction["Income"], false));
      mappedLine.push(this.convertAmount(transaction["Expenses"], true));

      return mappedLine;
   }

   this.getCompleteDescription = function (transaction){
      if (!transaction) 
         return "";
      const { "Description": description, "Category": category} = transaction;
      return [description, category]
         .filter(value => value && typeof value === "string" && value.trim() !== "")
         .join(", ").replace(/\s+/g, " ").trim();
   }

   this.convertAmount = function (value, forcePositive) {
      if (value === null || value === undefined)
         return "";

      var amount = Banana.Converter.toInternalNumberFormat(value, this.getDecimalSeparator(value));
      if (!amount)
         return "";

      if (forcePositive && amount.substring(0, 1) === "-")
         return Banana.SDecimal.invert(amount);

      return amount;
   }

   /**
    * Returns the decimal separator based on what is found in the 
    * given amount. This method works for this format as transactions amounts
    * does not have the thousands.
    * It is a necessary method as the excel file provided by the bank, set amounts decimal
    * separator based on the local machine settings.
    */
   this.getDecimalSeparator = function (value){
      if (value.indexOf(",") >= 0){
         return ",";
      } else {
         return ".";
      }
   }
}

function convertBperDate(value) {
   if (value === null || value === undefined)
      return "";

   var namedDate = value.match(/^(\d{1,2})\s+([a-z]+)\s+(\d{4})$/);
   if (namedDate) {
      var month = monthNumber(namedDate[2]);
      if (!month)
         return "";
      return Banana.Converter.toInternalDateFormat(namedDate[1] + "." + month + "." + namedDate[3], "dd.mm.yyyy");
   }

   return "";
}

function monthNumber(monthName) {
   var months = {
      "gennaio": 1,
      "febbraio": 2,
      "marzo": 3,
      "aprile": 4,
      "maggio": 5,
      "giugno": 6,
      "luglio": 7,
      "agosto": 8,
      "settembre": 9,
      "ottobre": 10,
      "novembre": 11,
      "dicembre": 12
   };
   return months[monthName.toLowerCase().replace(".", "")] || "";
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
