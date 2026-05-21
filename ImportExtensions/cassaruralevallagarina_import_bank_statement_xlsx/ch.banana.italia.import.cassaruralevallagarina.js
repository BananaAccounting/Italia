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

// @id = ch.banana.italia.import.cassaruralevallagarina
// @api = 1.0
// @pubdate = 2026-05-21
// @publisher = Banana.ch SA
// @description = Cassa Rurale Vallagarina - Import account statement .xls/.xlsx (Banana+ Advanced)
// @description.en = Cassa Rurale Vallagarina - Import account statement .xls/.xlsx (Banana+ Advanced)
// @description.de = Cassa Rurale Vallagarina - Bewegungen importieren .xls/.xlsx (Banana+ Advanced)
// @description.fr = Cassa Rurale Vallagarina - Importer mouvements .xls/.xlsx (Banana+ Advanced)
// @description.it = Cassa Rurale Vallagarina - Importa movimenti .xls/.xlsx (Banana+ Advanced)
// @doctype = *
// @docproperties =
// @task = import.transactions
// @outputformat = transactions.simple
// @inputdatasource = openfiledialog
// @inputencoding = utf8
// @inputfilefilter = Text and Excel files (*.txt *.csv *.xls *.xlsx);;All files (*.*)
// @inputfilefilter.de = Text und Excel (*.txt *.csv *.xls *.xlsx);;Alle Dateien (*.*)
// @inputfilefilter.fr = Texte et Excel (*.txt *.csv *.xls *.xlsx);;Tous (*.*)
// @inputfilefilter.it = Testo ed Excel (*.txt *.csv *.xls *.xlsx);;Tutti i files (*.*)
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

   var convertionParam = defineConversionParam(inData);
   var transactions = Banana.Converter.csvToArray(inData, convertionParam.separator, convertionParam.textDelim);

   var crvFormat1 = new CassaRuraleVallagarinaFormat1();
   var transactionsData = crvFormat1.getFormattedData(transactions, importUtilities);
   if (crvFormat1.match(transactionsData)) {
      transactions = crvFormat1.convert(transactionsData);
      return Banana.Converter.arrayToTsv(transactions);
   }

   importUtilities.getUnknownFormatError();
   return "";
}

/**
 * Cassa Rurale Vallagarina account movements.
 * In this format, movements needs to be ordered by date
 * as transactions may comes unordered. 
 *
 * DATA | VALUTA | DARE | AVERE | DIVISA | DESCRIZIONE_OPERAZIONE | CAUSALE_ABI
 * 08.10.2024 | 08.10.2024 | 90 |     | EUR | Test description | 26
 * 01.08.2024 | 01.08.2024 |    | 658 | EUR | Test description | 48
 */
function CassaRuraleVallagarinaFormat1() {
   this.decimalSeparator = ".";

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
      var headerIdx = this.getHeaderRowIndex(transactions);
      if (headerIdx < 0)
         return [];

      var columns = importUtilities.getHeaderData(transactions, headerIdx);
      var rows = importUtilities.getRowData(transactions, headerIdx + 1);
      var form = [];
      var convertedColumns = this.convertHeaderIt(columns);

      if (convertedColumns.length > 0) {
         importUtilities.loadForm(form, convertedColumns, rows);
         return form;
      }

      return [];
   }

   this.getHeaderRowIndex = function (transactions) {
      if (!transactions)
         return -1;

      for (var i = 0; i < transactions.length && i < 20; i++) {
         if (this.headersMatch(transactions[i]))
            return i;
      }
      return -1;
   }

   this.headersMatch = function (headers) {
      if (!headers)
         return false;

      var headerDataRef = ["DATA", "VALUTA", "DARE", "AVERE", "DIVISA", "DESCRIZIONE_OPERAZIONE", "CAUSALE_ABI"];

      if (headers[0] === "")
         headers = headers.slice(1);

      if (headers.length < headerDataRef.length)
         return false;

      for (var i = 0; i < headerDataRef.length; i++) {
         if (headers[i] !== headerDataRef[i])
            return false;
      }
      return true;
   }

   this.convertHeaderIt = function (columns) {
      var convertedColumns = [];

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
               convertedColumns[i] = "ReasonAbi";
               break;
            default:
               convertedColumns[i] = "_Column" + i.toString();
               break;
         }
      }

      if (convertedColumns.indexOf("Date") < 0 || convertedColumns.indexOf("Expenses") < 0 ||
         convertedColumns.indexOf("Income") < 0 || convertedColumns.indexOf("Description") < 0) {
         return [];
      }

      return convertedColumns;
   }

   this.convert = function (transactionsData) {
      var transactionsToImport = [];

      for (var i = 0; i < transactionsData.length; i++) {
         if (this.isTransactionRow(transactionsData[i])) {
            transactionsToImport.push({
               "line": this.mapTransaction(transactionsData[i]),
               "index": i
            });
         }
      }

      // Sort by date
      transactionsToImport.sort(function (row1, row2) {
         if (row1.line[0] > row2.line[0])
            return 1;
         else if (row1.line[0] < row2.line[0])
            return -1;
         return row1.index - row2.index;
      });

      var mappedTransactions = [];
      for (var j = 0; j < transactionsToImport.length; j++) {
         mappedTransactions.push(transactionsToImport[j].line);
      }

      var header = [["Date", "DateValue", "Doc", "ExternalReference", "Description", "Income", "Expenses"]];
      return header.concat(mappedTransactions);
   }

   this.isTransactionRow = function (transaction) {
      if (!transaction)
         return false;

      if (!transaction["Date"] || !transaction["Date"].match(/^\d{2}\.\d{2}\.\d{4}$/))
         return false;

      if (!transaction["DateValue"] || !transaction["DateValue"].match(/^\d{2}\.\d{2}\.\d{4}$/))
         return false;

      return !!(transaction["Income"] || transaction["Expenses"]);
   }

   this.mapTransaction = function (transaction) {
      var mappedLine = [];
      mappedLine.push(convertCassaRuraleVallagarinaDate(transaction["Date"]));
      mappedLine.push(convertCassaRuraleVallagarinaDate(transaction["DateValue"]));
      mappedLine.push("");
      mappedLine.push("");
      mappedLine.push(this.getCompleteDescription(transaction));
      mappedLine.push(this.convertAmount(transaction["Income"]));
      mappedLine.push(this.convertAmount(transaction["Expenses"]));

      return mappedLine;
   }

   this.getCompleteDescription = function (transaction) {
      if (!transaction)
         return "";

      var description = transaction["Description"] || "";
      var reasonAbi = transaction["ReasonAbi"] || "";
      var values = [];

      if (description && description.toString().trim() !== "")
         values.push(description.toString().replace(/\s+/g, " ").trim());
      if (reasonAbi && reasonAbi.toString().trim() !== "")
         values.push("Causale ABI " + reasonAbi.toString().trim());

      return values.join(", ");
   }

   this.convertAmount = function (value) {
      if (value === null || value === undefined || value === "")
         return "";

      var amount = Banana.Converter.toInternalNumberFormat(value, this.decimalSeparator);
      if (!amount)
         return "";

      if (amount.substring(0, 1) === "-")
         return Banana.SDecimal.invert(amount);

      return amount;
   }
}

function convertCassaRuraleVallagarinaDate(value) {
   if (!value)
      return "";

   return Banana.Converter.toInternalDateFormat(value, "dd.mm.yyyy");
}

function defineConversionParam(inData) {
   var convertionParam = {};
   convertionParam.format = "csv";
   convertionParam.textDelim = "\"";
   convertionParam.separator = findSeparator(inData);
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
      if (c === ",")
         commaCount++;
      else if (c === ";")
         semicolonCount++;
      else if (c === "\t")
         tabCount++;
   }

   if (tabCount > commaCount && tabCount > semicolonCount) {
      return "\t";
   }
   else if (semicolonCount > commaCount) {
      return ";";
   }

   return ",";
}
