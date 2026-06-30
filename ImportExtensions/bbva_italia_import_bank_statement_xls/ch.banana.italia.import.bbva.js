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

// @id = ch.banana.italia.import.bbva
// @api = 1.0
// @pubdate = 2026-06-26
// @publisher = Banana.ch SA
// @description = BBVA Italia - Import account statement .xls/.xlsx (Banana+ Advanced)
// @description.en = BBVA Italia - Import account statement .xls/.xlsx (Banana+ Advanced)
// @description.de = BBVA Italia - Bewegungen importieren .xls/.xlsx (Banana+ Advanced)
// @description.fr = BBVA Italia - Importer mouvements .xls/.xlsx (Banana+ Advanced)
// @description.it = BBVA Italia - Importa movimenti .xls/.xlsx (Banana+ Advanced)
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

   var bbvaFormat1 = new BbvaFormat1();
   var transactionsData = bbvaFormat1.getFormattedData(transactions, importUtilities);
   if (bbvaFormat1.match(transactionsData)) {
      transactions = bbvaFormat1.convert(transactionsData);
      return Banana.Converter.arrayToTsv(transactions);
   }

   importUtilities.getUnknownFormatError();
   return "";
}

/**
 * BBVA Italia account movements.
 *
 * Data valuta | Data | Parola chiave | Movimento | Importo | Valuta | Disponibile | Valuta | Osservazioni
 * 27/01/2026 | 27/01/2026 | Test | Test | -1000 | EUR | 36926.47 | EUR | Test Osservazione
 * 01/01/2026 | 05/01/2026 | Test |      | 55.02 | EUR | 39296.47 | EUR | Test Osservazione
 */
function BbvaFormat1() {
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
      var normalizedHeaders = this.normalizeRow(headers);
      var headerDataRef = ["Data valuta", "Data", "Parola chiave", "Movimento", "Importo", "Valuta", "Disponibile", "Valuta", "Osservazioni"];

      if (normalizedHeaders.length < headerDataRef.length)
         return false;

      for (var i = 0; i < headerDataRef.length; i++) {
         if (normalizedHeaders[i] !== headerDataRef[i])
            return false;
      }
      return true;
   }

   this.convertHeaderIt = function (columns) {
      var convertedColumns = [];

      for (var i = 0; i < columns.length; i++) {
         switch (columns[i]) {
            case "Data valuta":
               convertedColumns[i] = "DateValue";
               break;
            case "Data":
               convertedColumns[i] = "Date";
               break;
            case "Parola chiave":
               convertedColumns[i] = "Keyword";
               break;
            case "Movimento":
               convertedColumns[i] = "Movement";
               break;
            case "Importo":
               convertedColumns[i] = "Amount";
               break;
            case "Osservazioni":
               convertedColumns[i] = "Notes";
               break;
            default:
               convertedColumns[i] = "_Column" + i.toString();
               break;
         }
      }

      if (convertedColumns.indexOf("DateValue") < 0 || convertedColumns.indexOf("Date") < 0 ||
         convertedColumns.indexOf("Amount") < 0) {
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

      // BBVA exports the newest movements first.
      transactionsToImport = transactionsToImport.reverse();

      var header = [["Date", "DateValue", "Doc", "ExternalReference", "Description", "Income", "Expenses"]];
      return header.concat(transactionsToImport);
   }

   this.isTransactionRow = function (transaction) {
      if (!transaction)
         return false;

      if (!transaction["Date"] || !transaction["Date"].match(/^\d{2}\/\d{2}\/\d{4}$/))
         return false;

      if (!transaction["DateValue"] || !transaction["DateValue"].match(/^\d{2}\/\d{2}\/\d{4}$/))
         return false;

      if (!transaction["Keyword"])
         return false;

      return transaction["Amount"] !== null && transaction["Amount"] !== undefined && transaction["Amount"] !== "";
   }

   this.mapTransaction = function (transaction) {
      var mappedLine = [];
      var amount = this.convertAmount(transaction["Amount"]);

      mappedLine.push(Banana.Converter.toInternalDateFormat(transaction["Date"], "dd/mm/yyyy"));
      mappedLine.push(Banana.Converter.toInternalDateFormat(transaction["DateValue"], "dd/mm/yyyy"));
      mappedLine.push("");
      mappedLine.push("");
      mappedLine.push(this.getCompleteDescription(transaction));
      mappedLine.push(this.isNegativeAmount(amount) ? "" : amount);
      mappedLine.push(this.isNegativeAmount(amount) ? Banana.SDecimal.invert(amount) : "");

      return mappedLine;
   }

   this.getCompleteDescription = function (transaction) {
      if (!transaction)
         return "";

      var keyword = transaction["Keyword"] || "";
      var movement = transaction["Movement"] || "";
      var notes = transaction["Notes"] || "";
      var values = [];

      if (keyword && keyword.toString().trim() !== "")
         values.push(keyword.toString().replace(/\s+/g, " ").trim());
      if (movement && movement.toString().trim() !== "")
         values.push(movement.toString().replace(/\s+/g, " ").trim());
      if (notes && notes.toString().trim() !== "")
         values.push(notes.toString().replace(/\s+/g, " ").trim());

      return values.join(", ");
   }

   this.convertAmount = function (value) {
      if (value === null || value === undefined || value === "")
         return "";

      return Banana.Converter.toInternalNumberFormat(value, this.decimalSeparator);
   }

   this.isNegativeAmount = function (amount) {
      return amount && amount.substring(0, 1) === "-";
   }

   this.normalizeRow = function (row) {
      if (!row)
         return [];

      var normalizedRow = row;
      if (normalizedRow.length > 0 && normalizedRow[0] === "")
         normalizedRow = normalizedRow.slice(1);

      while (normalizedRow.length > 0 && normalizedRow[normalizedRow.length - 1] === "")
         normalizedRow.pop();

      return normalizedRow;
   }
}

function defineConversionParam(inData) {
   var convertionParam = {};
   convertionParam.format = "csv";
   convertionParam.textDelim = "§";
   convertionParam.separator = findSeparator(inData);
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

   if (tabCount > commaCount && tabCount > semicolonCount)
      return "\t";
   else if (semicolonCount > commaCount)
      return ";";

   return ",";
}
