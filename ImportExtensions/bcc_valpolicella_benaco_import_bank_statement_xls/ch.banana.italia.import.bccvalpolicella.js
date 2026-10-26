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

// @id = ch.banana.italia.import.bccvalpolicella
// @api = 1.0
// @pubdate = 2026-10-23
// @publisher = Banana.ch SA
// @description = BCC Valpolicella Benaco - Import account statement .xls/.xlsx (Banana+ Advanced)
// @description.en = BCC Valpolicella Benaco - Import account statement .xls/.xlsx (Banana+ Advanced)
// @description.de = BCC Valpolicella Benaco - Bewegungen importieren .xls/.xlsx (Banana+ Advanced)
// @description.fr = BCC Valpolicella Benaco - Importer mouvements .xls/.xlsx (Banana+ Advanced)
// @description.it = BCC Valpolicella Benaco - Importa movimenti .xls/.xlsx (Banana+ Advanced)
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

   var bccFormat1 = new BccValpolicellaFormat1();
   var transactionsData = bccFormat1.getFormattedData(transactions, importUtilities);
   if (bccFormat1.match(transactionsData)) {
      transactions = bccFormat1.convert(transactionsData);
      return Banana.Converter.arrayToTsv(transactions);
   }

   importUtilities.getUnknownFormatError();
   return "";
}

/**
 * BCC Valpolicella Benaco account movements.
 *
 *  | Data contabile | Data valuta | Dare | Avere | Causale     | Descrizione | Note
 *  | 10.07.2026     | 10.07.2026  |      | 29,70 | Bonifico    | TEST        |
 *  | 03.07.2026     | 03.07.2026  | 5,57 |       | Commissioni | TEST        |
 */
function BccValpolicellaFormat1() {
   this.decimalSeparator = ",";

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
      var columns = importUtilities.getHeaderData(transactions, 0);
      var rows = importUtilities.getRowData(transactions, 1);
      var form = [];
      var convertedColumns = this.convertHeaderIt(columns);

      if (convertedColumns.length > 0) {
         importUtilities.loadForm(form, convertedColumns, rows);
         return form;
      }

      return [];
   }

   this.convertHeaderIt = function (columns) {
      var convertedColumns = [];

      for (var i = 0; i < columns.length; i++) {
         switch (columns[i]) {
            case "Data contabile":
               convertedColumns[i] = "Date";
               break;
            case "Data valuta":
               convertedColumns[i] = "DateValue";
               break;
            case "Dare":
               convertedColumns[i] = "Debit";
               break;
            case "Avere":
               convertedColumns[i] = "Credit";
               break;
            case "Causale":
               convertedColumns[i] = "Reason";
               break;
            case "Descrizione":
               convertedColumns[i] = "Description";
               break;
            case "Note":
               convertedColumns[i] = "Notes";
               break;
            default:
               convertedColumns[i] = "_Column" + i.toString();
               break;
         }
      }

      if (convertedColumns.indexOf("Date") < 0 || convertedColumns.indexOf("DateValue") < 0 ||
         convertedColumns.indexOf("Debit") < 0 || convertedColumns.indexOf("Credit") < 0) {
         return [];
      }

      return convertedColumns;
   }

   this.convert = function (transactionsData) {
      var transactionsToImport = [];

      for (var i = 0; i < transactionsData.length; i++) {
         if (this.isTransactionRow(transactionsData[i])){
            transactionsToImport.push(this.mapTransaction(transactionsData[i]));
         }
      }

      // BCC exports the newest movements first.
      transactionsToImport = transactionsToImport.reverse();

      var header = [["Date", "DateValue", "Doc", "Description", "Income", "Expenses", "Notes"]];
      return header.concat(transactionsToImport);
   }

   this.isTransactionRow = function (transaction) {
      if (!transaction)
         return false;

      // Also excludes the final "Totali dal ... al ..." row.
      if (!transaction["Date"] || !transaction["Date"].match(/^\d{2}\.\d{2}\.\d{4}$/))
         return false;

      if (!transaction["DateValue"] || !transaction["DateValue"].match(/^\d{2}\.\d{2}\.\d{4}$/))
         return false;

      return !!(transaction["Debit"] || transaction["Credit"]);
   }

   this.mapTransaction = function (transaction) {
      var mappedLine = [];

      mappedLine.push(Banana.Converter.toInternalDateFormat(transaction["Date"], "dd.mm.yyyy"));
      mappedLine.push(Banana.Converter.toInternalDateFormat(transaction["DateValue"], "dd.mm.yyyy"));
      mappedLine.push("");
      mappedLine.push(this.getCompleteDescription(transaction));
      mappedLine.push(this.convertAmount(transaction["Credit"]));
      mappedLine.push(this.convertAmount(transaction["Debit"]));
      mappedLine.push(this.cleanText(transaction["Notes"]));

      return mappedLine;
   }

   this.getCompleteDescription = function (transaction) {
      var values = [];
      var reason = this.cleanText(transaction["Reason"]);
      var description = this.cleanText(transaction["Description"]);

      if (reason)
         values.push(reason);
      if (description)
         values.push(description);

      return values.join(", ");
   }

   this.cleanText = function (value) {
      if (!value)
         return "";
      /**
       * Remove double quotes: some files contain unclosed quotes
       * in descriptions, which cause problems during import.
       */
      return value.toString().replace(/"/g, "").replace(/\s+/g, " ").trim();
   }

   this.convertAmount = function (value) {
      if (!value)
         return "";

      // Debit and credit are in separate columns: remove a possible sign.
      var amount = Banana.Converter.toInternalNumberFormat(value, this.decimalSeparator);
      if (amount.substring(0, 1) === "-")
         amount = Banana.SDecimal.invert(amount);
      return amount;
   }

   this.normalizeRow = function (row) {
      if (!row)
         return [];

      var normalizedRow = row.slice();
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
