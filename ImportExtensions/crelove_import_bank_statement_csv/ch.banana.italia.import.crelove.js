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

// @id = ch.banana.italia.import.crelove
// @api = 1.0
// @pubdate = 2026-05-07
// @publisher = Banana.ch SA
// @description = Banca CRELOVE SPA - Import account statement .csv (Banana+ Advanced)
// @description.en = Banca CRELOVE SPA - Import account statement .csv (Banana+ Advanced)
// @description.de = Banca CRELOVE SPA - Bewegungen importieren .csv (Banana+ Advanced)
// @description.fr = Banca CRELOVE SPA - Importer mouvements .csv (Banana+ Advanced)
// @description.it = Banca CRELOVE SPA - Importa movimenti .csv (Banana+ Advanced)
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

   var fieldSeparator = findSeparator(inData);
   var transactions = Banana.Converter.csvToArray(inData, fieldSeparator, '"');

   var format1 = new CRELOVEFormat1();
   var transactionsData = format1.getFormattedData(transactions, importUtilities);
   if (format1.match(transactionsData)) {
      Banana.console.log("Banca CRELOVE SPA - Format 1 matched");
      transactions = format1.convert(transactionsData);
      return Banana.Converter.arrayToTsv(transactions);
   }

   importUtilities.getUnknownFormatError();
   return "";
}

/**
 * Banca CRELOVE SPA format 1
 *
 * DATA;VALUTA;DARE;AVERE;DIVISA;DESCRIZIONE_OPERAZIONE;CAUSALE_ABI
 * 29/04/2026;27/04/2026;100,00;;EUR;PAGAMENTO;43
 * 04/05/2026;prenotata;33,35;;EUR;PRE-ADDEBITO;
 * 04/05/2026;;;555,39;EUR;Saldo contabile;
 */
function CRELOVEFormat1() {

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
               convertedColumns[i] = "ExternalReference";
               break;
            default:
               break;
         }
      }

      if (convertedColumns.indexOf("Date") < 0 ||
         convertedColumns.indexOf("DateValue") < 0 ||
         convertedColumns.indexOf("Expenses") < 0 ||
         convertedColumns.indexOf("Income") < 0 ||
         convertedColumns.indexOf("Description") < 0) {
         return [];
      }

      return convertedColumns;
   }

   this.getFormattedData = function (inData, importUtilities) {
      var columns = importUtilities.getHeaderData(inData, 0);
      var rows = importUtilities.getRowData(inData, 1);
      var form = [];

      var convertedColumns = this.convertHeaderIt(columns);
      if (convertedColumns.length > 0) {
         importUtilities.loadForm(form, convertedColumns, rows);
         return form;
      }

      return [];
   }

   /** Return true if the transactions match this format. */
   this.match = function (transactionsData) {
      if (transactionsData.length === 0)
         return false;

      for (var i = 0; i < transactionsData.length; i++) {
         var transaction = transactionsData[i];

         if (this.isTransactionRow(transaction))
            return true;
      }

      return false;
   }

   this.convert = function (transactionsData) {
      var transactionsToImport = [];

      for (var i = 0; i < transactionsData.length; i++) {
         if (this.isTransactionRow(transactionsData[i]))
            transactionsToImport.push(this.mapTransaction(transactionsData[i]));
      }

      var header = [["Date", "DateValue", "Doc", "ExternalReference", "Description", "Income", "Expenses"]];
      return header.concat(transactionsToImport);
   }

   this.mapTransaction = function (transaction) {
      var mappedLine = [];

      mappedLine.push(Banana.Converter.toInternalDateFormat(transaction["Date"], "dd/mm/yyyy"));
      if (this.isDate(transaction["DateValue"]))
         mappedLine.push(Banana.Converter.toInternalDateFormat(transaction["DateValue"], "dd/mm/yyyy"));
      else
         mappedLine.push("");
      mappedLine.push("");
      mappedLine.push(transaction["ExternalReference"] || "");
      mappedLine.push(transaction["Description"] || "");
      mappedLine.push(transaction["Income"] ? Banana.Converter.toInternalNumberFormat(transaction["Income"], ",") : "");
      mappedLine.push(transaction["Expenses"] ? Banana.Converter.toInternalNumberFormat(transaction["Expenses"], ",") : "");

      return mappedLine;
   }

   this.isTransactionRow = function (transaction) {
      if (!transaction || !this.isDate(transaction["Date"]))
         return false;

      if (!transaction["Expenses"] && !transaction["Income"])
         return false;

      return !this.isBalanceRow(transaction);
   }

   this.isBalanceRow = function (transaction) {
      var description = "";
      if (transaction["Description"])
         description = transaction["Description"].toLowerCase();

      return description.indexOf("saldo") >= 0 ||
         description.indexOf("disponibilit") >= 0;
   }

   this.isDate = function (date) {
      return date && date.match(/^\d{2}\/\d{2}\/\d{4}$/);
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

   if (tabCount > commaCount && tabCount > semicolonCount)
      return '\t';
   else if (semicolonCount > commaCount)
      return ';';

   return ',';
}
