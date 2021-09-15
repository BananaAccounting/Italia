// Copyright [2021] [Banana.ch SA - Lugano Switzerland]
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
//  http://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// @id = ch.banana.it.extension.statopatrimoniale.mod.a
// @api = 1.0
// @pubdate = 2021-09-14
// @publisher = Banana.ch SA
// @description = 1. Stato patrimoniale
// @task = app.command
// @doctype = 100.*;110.*;130.*
// @docproperties = 
// @outputformat = none
// @inputdatasource = none
// @timeout = -1
// @includejs = reportstructure.js
// @includejs = breport.js
// @includejs = errors.js


/*
   Stampa del rendiconto 'Stato patrimoniale (MOD. A)' secondo nuovi schemi di bilancio per il terzo settore.
   
   
   I modelli devono essere considerati come schemi “fissi”.
   È possibile suddividere le voci precedute da numeri arabi o da lettere minuscole dell'alfabeto,
   senza eliminare la voce complessiva e l'importo corrispondente.
   Gli enti che presentano voci precedute da numeri arabi o da lettere minuscole con importi nulli
   per due esercizi consecutivi possono eliminare dette voci.
   Possono aggiungere voci precedute da numeri arabi o da lettere minuscole dell'alfabeto.
   Eventuali raggruppamenti o eliminazioni delle voci di bilancio devono risultare esplicitati
   nella relazione di missione

*/

var BAN_VERSION = "10.0.1";
var BAN_EXPM_VERSION = "";


//Main function
function exec(string) {

   //Check if we are on an opened document
   if (!Banana.document) {
      return;
   }

   //Check the banana version
   var isCurrentBananaVersionSupported = bananaRequiredVersion(BAN_VERSION, BAN_EXPM_VERSION);
   if (!isCurrentBananaVersionSupported) {
      return "@Cancel";
   }

   var userParam = initUserParam();
   var savedParam = Banana.document.getScriptSettings();
   if (savedParam && savedParam.length > 0) {
      userParam = JSON.parse(savedParam);
   }
   // If needed show the settings dialog to the user
   if (!options || !options.useLastSettings) {
      userParam = settingsDialog(); // From properties
   }
   if (!userParam) {
      return "@Cancel";
   }

   /**
    * 1. Loads the report structure
    */
   var reportStructure = createReportStructureStatoPatrimoniale();

   /**
    * 2. Calls methods to load balances, calculate totals, format amounts
    * and check entries that can be excluded
    */
   const bReport = new BReport(Banana.document, userParam, reportStructure);
   bReport.validateGroups(userParam.column);
   bReport.loadBalances();
   bReport.calculateTotals(["currentAmount", "previousAmount"]);
   bReport.formatValues(["currentAmount", "previousAmount"]);
   bReport.excludeEntries();
   //Banana.console.log(JSON.stringify(reportStructure, "", " "));

   /**
    * 3. Creates the report
    */
   var stylesheet = Banana.Report.newStyleSheet();
   var report = printRendicontoModA(Banana.document, userParam, bReport, stylesheet);
   setCss(Banana.document, stylesheet, userParam);
   Banana.Report.preview(report, stylesheet);
}

function printRow(userParam, bReport, table, gr, styleColumnDescription, styleColumnAmount) {
   var styleIndentLevel = "";
   var indentLevel = "lvl"+bReport.getObjectIndent(gr);
   if (indentLevel) {
      styleIndentLevel = indentLevel;
   }
   if (userParam.compattastampa) {
      // Prints only elements cannot be excluded
      if (!bReport.getObjectValue(gr, "exclude")) { // false = cannot be excluded
         tableRow = table.addRow();
         if (userParam.printcolumn) {
            if (!bReport.getObjectId(gr).startsWith("d")) {
               tableRow.addCell(bReport.getObjectId(gr), "", 1);
            } else {
               tableRow.addCell("", "", 1);
            }
         }
         tableRow.addCell(bReport.getObjectDescription(gr), styleColumnDescription + " " + styleIndentLevel, 1);
         
         // print amounts only for type 'group', 'total' and when 'excludeamount'=false
         if (bReport.getObjectType(gr) !== 'title' && !bReport.getObjectValue(gr, "excludeamount")) {
            if (userParam.printpreviousyear) {
               tableRow.addCell(bReport.getObjectCurrentAmountFormatted(gr), styleColumnAmount, 1);
               tableRow.addCell(bReport.getObjectPreviousAmountFormatted(gr), styleColumnAmount, 1);
            } else {
               tableRow.addCell("", "", 1);
               tableRow.addCell(bReport.getObjectCurrentAmountFormatted(gr), styleColumnAmount, 1);
            }
         }
         else {
            tableRow.addCell("", "" ,1);
            tableRow.addCell("", "" ,1);
         }
      }
   }
   else {
      // Prints all elements
      tableRow = table.addRow();
      if (userParam.printcolumn) {
         if (!bReport.getObjectId(gr).startsWith("d")) {
            tableRow.addCell(bReport.getObjectId(gr), "", 1);
         } else {
            tableRow.addCell("", "", 1);
         }
      }
      tableRow.addCell(bReport.getObjectDescription(gr), styleColumnDescription + " " + styleIndentLevel, 1);
      
      // print amounts only for type 'group', 'total' and when 'excludeamount'=false
      if (bReport.getObjectType(gr) !== 'title' && !bReport.getObjectValue(gr, "excludeamount")) {
         if (userParam.printpreviousyear) {
            tableRow.addCell(bReport.getObjectCurrentAmountFormatted(gr), styleColumnAmount, 1);
            tableRow.addCell(bReport.getObjectPreviousAmountFormatted(gr), styleColumnAmount, 1);
         } else {
            tableRow.addCell("", "", 1);
            tableRow.addCell(bReport.getObjectCurrentAmountFormatted(gr), styleColumnAmount, 1);
         }
      }
      else {
         tableRow.addCell("", "" ,1);
         tableRow.addCell("", "" ,1);
      }
   }
}

function printSubRow(userParam, bReport, table, gr, styleColumnDescription, styleColumnAmount) {
   var styleIndentLevel = "";
   var indentLevel = "lvl"+bReport.getObjectIndent(gr);
   if (indentLevel) {
      styleIndentLevel = indentLevel;
   }
   if (userParam.compattastampa) {
      // Prints only elements cannot be excluded
      if (!bReport.getObjectValue(gr, "exclude")) { // false = cannot be excluded
         tableRow = table.addRow();
         if (userParam.printcolumn) {
            if (!bReport.getObjectId(gr).startsWith("d")) {
               tableRow.addCell(bReport.getObjectId(gr), "", 1);
            } else {
               tableRow.addCell("", "", 1);
            }
         }
         if (userParam.printpreviousyear) {
            tableRow.addCell(bReport.getObjectDescription(gr), styleColumnDescription + " " + styleIndentLevel, 1);
            tableRow.addCell(bReport.getObjectCurrentAmountFormatted(gr), styleColumnAmount, 1);
            tableRow.addCell(bReport.getObjectPreviousAmountFormatted(gr), styleColumnAmount, 1);
         }
         else {
            tableRow.addCell(bReport.getObjectDescription(gr), styleColumnDescription + " " + styleIndentLevel, 1);
            tableRow.addCell("", "", 1);
            tableRow.addCell(bReport.getObjectCurrentAmountFormatted(gr), styleColumnAmount, 1);
         }
      }
   }
   else {
      // Prints all elements
      tableRow = table.addRow();
      if (userParam.printcolumn) {
         if (!bReport.getObjectId(gr).startsWith("d")) {
            tableRow.addCell(bReport.getObjectId(gr), "", 1);
         } else {
            tableRow.addCell("", "", 1);
         }
      }

      if (userParam.printpreviousyear) {
         tableRow.addCell(bReport.getObjectDescription(gr), styleColumnDescription + " " + styleIndentLevel, 1);
         tableRow.addCell(bReport.getObjectCurrentAmountFormatted(gr), styleColumnAmount, 1);
         tableRow.addCell(bReport.getObjectPreviousAmountFormatted(gr), styleColumnAmount, 1);
      }
      else {
         tableRow.addCell(bReport.getObjectDescription(gr), styleColumnDescription + " " + styleIndentLevel, 1);
         tableRow.addCell("", "", 1);
         tableRow.addCell(bReport.getObjectCurrentAmountFormatted(gr), styleColumnAmount, 1);
      }
   }
}

function printRendicontoModA(banDoc, userParam, bReport, stylesheet) {
   
   var report = Banana.Report.newReport("Stato patrimoniale");

   printRendicontoModA_Header(banDoc, report, userParam, stylesheet);
   printRendicontoModA_Attivo(banDoc, report, userParam, bReport);
   printRendicontoModA_Passivo(banDoc, report, userParam, bReport);
   printRendicontoModA_Footer(report);
   checkResults(banDoc, report, bReport);
   printRendicontoModA_Note_Finali(report, userParam);

   return report;
}

function printRendicontoModA_Header(banDoc, report, userParam, stylesheet) {

   // Logo
   var headerParagraph = report.getHeader().addSection();
   if (userParam.logo) {
      headerParagraph = report.addSection("");
      var logoFormat = Banana.Report.logoFormat(userParam.logoname);
      if (logoFormat) {
         var logoElement = logoFormat.createDocNode(headerParagraph, stylesheet, "logo");
         report.getHeader().addChild(logoElement);
      }
      report.addParagraph(" ", "");
   }

   if (userParam.printheader) {
      if (userParam.headertext.length <= 0) {
         var company = banDoc.info("AccountingDataBase","Company");
         var address1 = banDoc.info("AccountingDataBase","Address1");
         var zip = banDoc.info("AccountingDataBase","Zip");
         var city = banDoc.info("AccountingDataBase","City");
         var phone = banDoc.info("AccountingDataBase","Phone");
         var web = banDoc.info("AccountingDataBase","Web");
         var email = banDoc.info("AccountingDataBase","Email");
         if (company) {
            headerParagraph.addParagraph(company, "address-header");
         }
         if (address1) {
            headerParagraph.addParagraph(address1, "address-header");
         }
         if (zip && city) {
            headerParagraph.addParagraph(zip + " " + city, "address-header");
         }
         if (phone) {
            headerParagraph.addParagraph(phone, "address-header");
         }
         if (web) {
            headerParagraph.addParagraph(web, "address-header");
         }
         if (email) {
            headerParagraph.addParagraph(email, "address-header");
         }
         headerParagraph.addParagraph(" ", "address-header");
      }
      else {
         var text = userParam.headertext.split("\n");
         for (var i = 0; i < text.length; i++) {
            if (text[i]) {
               headerParagraph.addParagraph(text[i], "address-header");
            } else {
               headerParagraph.addParagraph(" ", "address-header");
            }
         }
      }
   }
}

function printRendicontoModA_Attivo(banDoc, report, userParam, bReport) {

   var endDate = userParam.selectionEndDate;
   var currentYear = Banana.Converter.toDate(banDoc.info("AccountingDataBase", "OpeningDate")).getFullYear();
   var previousYear = currentYear - 1;

   var title = "";
   if (userParam.title) {
      title = userParam.title;
   } else {
      title = banDoc.info("Base", "HeaderLeft") + " - " + "STATO PATRIMONIALE ANNO " + currentYear;
   }
   if (userParam.printtitle) {
      report.addParagraph(" ", "");
      report.addParagraph(title, "heading2");
      report.addParagraph(" ", "");
   }

   // Tabella Attivo
   var table = report.addTable("table");
   if (userParam.printcolumn) {
      var column1 = table.addColumn("column01");
      var column2 = table.addColumn("column02");
      var column3 = table.addColumn("column03");
      var column4 = table.addColumn("column04");
   }
   else {
      var column1 = table.addColumn("column1");
      var column2 = table.addColumn("column2");
      var column3 = table.addColumn("column3");
   }


   var tableIntestazione = table.getHeader();
   tableRow = tableIntestazione.addRow(); 
   if (userParam.printcolumn) {
      tableRow.addCell("", "", 1);
   }
   tableRow.addCell("", "", 1);
   if (userParam.printpreviousyear) {
      tableRow.addCell(Banana.Converter.toLocaleDateFormat(endDate), "table-header", 1);
      tableRow.addCell("31.12." + previousYear, "table-header", 1);
   } else {
      tableRow.addCell("", "", 1);
      tableRow.addCell(Banana.Converter.toLocaleDateFormat(endDate), "table-header", 1);
   }

   tableRow = table.addRow();
   if (userParam.printcolumn) {
      tableRow.addCell(userParam.column, "assets-title lvl0", 1);
   }
   tableRow.addCell("ATTIVO", "assets-title lvl0", 3);

   /* AA */
   printRow(userParam, bReport, table, "AA", "description-groups", "amount-groups");
   /* dAB */
   printRow(userParam, bReport, table, "dAB", "description-groups", "amount-groups");
   /* dABI */
   printRow(userParam, bReport, table, "dABI", "description-groups", "amount-groups");
   /* ABI1 */
   printRow(userParam, bReport, table, "ABI1", "description-groups", "amount-groups");
   /* ABI2 */
   printRow(userParam, bReport, table, "ABI2", "description-groups", "amount-groups");
   /* ABI3 */
   printRow(userParam, bReport, table, "ABI3", "description-groups", "amount-groups");
   /* ABI4 */
   printRow(userParam, bReport, table, "ABI4", "description-groups", "amount-groups");
   /* ABI5 */
   printRow(userParam, bReport, table, "ABI5", "description-groups", "amount-groups");
   /* ABI6 */
   printRow(userParam, bReport, table, "ABI6", "description-groups", "amount-groups");
   /* ABI7 */
   printRow(userParam, bReport, table, "ABI7", "description-groups", "amount-groups");
   /* tot ABI */
   printRow(userParam, bReport, table, "ABI", "description-groups", "amount-groups-totals");
   /* dABII */
   printRow(userParam, bReport, table, "dABII", "description-groups", "amount-groups");
   /* ABII1 */
   printRow(userParam, bReport, table, "ABII1", "description-groups", "amount-groups");
   /* ABII2 */
   printRow(userParam, bReport, table, "ABII2", "description-groups", "amount-groups");
   /* ABII3 */
   printRow(userParam, bReport, table, "ABII3", "description-groups", "amount-groups");
   /* ABII4 */
   printRow(userParam, bReport, table, "ABII4", "description-groups", "amount-groups");
   /* ABII5 */
   printRow(userParam, bReport, table, "ABII5", "description-groups", "amount-groups");
   /* tot ABII */
   printRow(userParam, bReport, table, "ABII", "description-groups", "amount-groups-totals");
   /* dABIII */
   printRow(userParam, bReport, table, "dABIII", "description-groups", "amount-groups");
   /* ABIII1 */
   printRow(userParam, bReport, table, "ABIII1", "description-groups", "amount-groups");
   /* ABIII1a */
   printRow(userParam, bReport, table, "ABIII1a", "description-groups", "amount-groups");
   /* ABIII1b */
   printRow(userParam, bReport, table, "ABIII1b", "description-groups", "amount-groups");
   /* ABIII1c */
   printRow(userParam, bReport, table, "ABIII1c", "description-groups", "amount-groups");
   /* ABIII2 */
   printRow(userParam, bReport, table, "ABIII2", "description-groups", "amount-groups");
   /* ABIII2a */
   printRow(userParam, bReport, table, "ABIII2a", "description-groups", "amount-groups");
   if (bReport.getObjectCurrentAmountFormatted("ABIII2a") || bReport.getObjectPreviousAmountFormatted("ABIII2a")) {
      printSubRow(userParam, bReport, table, "ABIII2ae", "description-groups", "amount-groups");
      printSubRow(userParam, bReport, table, "ABIII2ao", "description-groups", "amount-groups");
   }
   /* ABIII2b */
   printRow(userParam, bReport, table, "ABIII2b", "description-groups", "amount-groups");
   if (bReport.getObjectCurrentAmountFormatted("ABIII2b") || bReport.getObjectPreviousAmountFormatted("ABIII2b")) {
      printSubRow(userParam, bReport, table, "ABIII2be", "description-groups", "amount-groups");
      printSubRow(userParam, bReport, table, "ABIII2bo", "description-groups", "amount-groups");
   }
   /* ABIII2c */
   printRow(userParam, bReport, table, "ABIII2c", "description-groups", "amount-groups");
   if (bReport.getObjectCurrentAmountFormatted("ABIII2c") || bReport.getObjectPreviousAmountFormatted("ABIII2c")) {
      printSubRow(userParam, bReport, table, "ABIII2ce", "description-groups", "amount-groups");
      printSubRow(userParam, bReport, table, "ABIII2co", "description-groups", "amount-groups");
   }
   /* ABIII2d */
   printRow(userParam, bReport, table, "ABIII2d", "description-groups", "amount-groups");
   if (bReport.getObjectCurrentAmountFormatted("ABIII2d") || bReport.getObjectPreviousAmountFormatted("ABIII2d")) {
      printSubRow(userParam, bReport, table, "ABIII2de", "description-groups", "amount-groups");
      printSubRow(userParam, bReport, table, "ABIII2do", "description-groups", "amount-groups");
   }
   /* ABIII3 */
   printRow(userParam, bReport, table, "ABIII3", "description-groups", "amount-groups");
   /* tot ABIII */
   printRow(userParam, bReport, table, "ABIII", "description-groups", "amount-groups-totals");
   /* tot AB */
   printRow(userParam, bReport, table, "AB", "description-groups", "amount-totals");
   /* dAC */
   printRow(userParam, bReport, table, "dAC", "description-groups", "amount-groups");
   /* dACI */
   printRow(userParam, bReport, table, "dACI", "description-groups", "amount-groups");
   /* ACI1 */
   printRow(userParam, bReport, table, "ACI1", "description-groups", "amount-groups");
   /* ACI2 */
   printRow(userParam, bReport, table, "ACI2", "description-groups", "amount-groups");
   /* ACI3 */
   printRow(userParam, bReport, table, "ACI3", "description-groups", "amount-groups");
   /* ACI4 */
   printRow(userParam, bReport, table, "ACI4", "description-groups", "amount-groups");
   /* ACI5 */
   printRow(userParam, bReport, table, "ACI5", "description-groups", "amount-groups");
   /* tot ACI */
   printRow(userParam, bReport, table, "ACI", "description-groups", "amount-groups-totals");
   /* dACII */
   printRow(userParam, bReport, table, "dACII", "description-groups", "amount-groups");
   /* ACII1 */
   printRow(userParam, bReport, table, "ACII1", "description-groups", "amount-groups");
   if (bReport.getObjectCurrentAmountFormatted("ACII1") || bReport.getObjectPreviousAmountFormatted("ACII1")) {
      printSubRow(userParam, bReport, table, "ACII1e", "description-groups", "amount-groups");
      printSubRow(userParam, bReport, table, "ACII1o", "description-groups", "amount-groups");
   }
   /* ACII2 */
   printRow(userParam, bReport, table, "ACII2", "description-groups", "amount-groups");
   if (bReport.getObjectCurrentAmountFormatted("ACII2") || bReport.getObjectPreviousAmountFormatted("ACII2")) {
      printSubRow(userParam, bReport, table, "ACII2e", "description-groups", "amount-groups");
      printSubRow(userParam, bReport, table, "ACII2o", "description-groups", "amount-groups");
   }
   /* ACII3 */
   printRow(userParam, bReport, table, "ACII3", "description-groups", "amount-groups");
   if (bReport.getObjectCurrentAmountFormatted("ACII3") || bReport.getObjectPreviousAmountFormatted("ACII3")) {
      printSubRow(userParam, bReport, table, "ACII3e", "description-groups", "amount-groups");
      printSubRow(userParam, bReport, table, "ACII3o", "description-groups", "amount-groups");
   }
   /* ACII4 */
   printRow(userParam, bReport, table, "ACII4", "description-groups", "amount-groups");
   if (bReport.getObjectCurrentAmountFormatted("ACII4") || bReport.getObjectPreviousAmountFormatted("ACII4")) {
      printSubRow(userParam, bReport, table, "ACII4e", "description-groups", "amount-groups");
      printSubRow(userParam, bReport, table, "ACII4o", "description-groups", "amount-groups");
   }
   /* ACII5 */
   printRow(userParam, bReport, table, "ACII5", "description-groups", "amount-groups");
   if (bReport.getObjectCurrentAmountFormatted("ACII5") || bReport.getObjectPreviousAmountFormatted("ACII5")) {
      printSubRow(userParam, bReport, table, "ACII5e", "description-groups", "amount-groups");
      printSubRow(userParam, bReport, table, "ACII5o", "description-groups", "amount-groups");
   }
   /* ACII6 */
   printRow(userParam, bReport, table, "ACII6", "description-groups", "amount-groups");
   if (bReport.getObjectCurrentAmountFormatted("ACII6") || bReport.getObjectPreviousAmountFormatted("ACII6")) {
      printSubRow(userParam, bReport, table, "ACII6e", "description-groups", "amount-groups");
      printSubRow(userParam, bReport, table, "ACII6o", "description-groups", "amount-groups");
   }
   /* ACII7 */
   printRow(userParam, bReport, table, "ACII7", "description-groups", "amount-groups");
   if (bReport.getObjectCurrentAmountFormatted("ACII7") || bReport.getObjectPreviousAmountFormatted("ACII7")) {
      printSubRow(userParam, bReport, table, "ACII7e", "description-groups", "amount-groups");
      printSubRow(userParam, bReport, table, "ACII7o", "description-groups", "amount-groups");
   }
   /* ACII8 */
   printRow(userParam, bReport, table, "ACII8", "description-groups", "amount-groups");
   if (bReport.getObjectCurrentAmountFormatted("ACII8") || bReport.getObjectPreviousAmountFormatted("ACII8")) {
      printSubRow(userParam, bReport, table, "ACII8e", "description-groups", "amount-groups");
      printSubRow(userParam, bReport, table, "ACII8o", "description-groups", "amount-groups");
   }
   /* ACII9 */
   printRow(userParam, bReport, table, "ACII9", "description-groups", "amount-groups");
   if (bReport.getObjectCurrentAmountFormatted("ACII9") || bReport.getObjectPreviousAmountFormatted("ACII9")) {
      printSubRow(userParam, bReport, table, "ACII9e", "description-groups", "amount-groups");
      printSubRow(userParam, bReport, table, "ACII9o", "description-groups", "amount-groups");
   }
   /* ACII10 */
   printRow(userParam, bReport, table, "ACII10", "description-groups", "amount-groups");
   if (bReport.getObjectCurrentAmountFormatted("ACII10") || bReport.getObjectPreviousAmountFormatted("ACII10")) {
      printSubRow(userParam, bReport, table, "ACII10e", "description-groups", "amount-groups");
      printSubRow(userParam, bReport, table, "ACII10o", "description-groups", "amount-groups");
   }
   /* ACII11 */
   printRow(userParam, bReport, table, "ACII11", "description-groups", "amount-groups");
   if (bReport.getObjectCurrentAmountFormatted("ACII11") || bReport.getObjectPreviousAmountFormatted("ACII11")) {
      printSubRow(userParam, bReport, table, "ACII11e", "description-groups", "amount-groups");
      printSubRow(userParam, bReport, table, "ACII11o", "description-groups", "amount-groups");
   }
   /* ACII12 */
   printRow(userParam, bReport, table, "ACII12", "description-groups", "amount-groups");
   if (bReport.getObjectCurrentAmountFormatted("ACII12") || bReport.getObjectPreviousAmountFormatted("ACII12")) {
      printSubRow(userParam, bReport, table, "ACII12e", "description-groups", "amount-groups");
      printSubRow(userParam, bReport, table, "ACII12o", "description-groups", "amount-groups");
   }
   /* tot ACII */
   printRow(userParam, bReport, table, "ACII", "description-groups", "amount-groups-totals");
   /* dACIII */
   printRow(userParam, bReport, table, "dACIII", "description-groups", "amount-groups");
   /* ACIII1 */
   printRow(userParam, bReport, table, "ACIII1", "description-groups", "amount-groups");
   /* ACIII2 */
   printRow(userParam, bReport, table, "ACIII2", "description-groups", "amount-groups");
   /* ACIII3 */
   printRow(userParam, bReport, table, "ACIII3", "description-groups", "amount-groups");
   /* tot ACIII */
   printRow(userParam, bReport, table, "ACIII", "description-groups", "amount-groups-totals");
   /* dACIV */
   printRow(userParam, bReport, table, "dACIV", "description-groups", "amount-groups");
   /* ACIV1 */
   printRow(userParam, bReport, table, "ACIV1", "description-groups", "amount-groups");
   /* ACIV2 */
   printRow(userParam, bReport, table, "ACIV2", "description-groups", "amount-groups");
   /* ACIV3 */
   printRow(userParam, bReport, table, "ACIV3", "description-groups", "amount-groups");
   /* tot ACIV */
   printRow(userParam, bReport, table, "ACIV", "description-groups", "amount-groups-totals");
   /* tot AC */
   printRow(userParam, bReport, table, "AC", "description-groups", "amount-groups-totals");
   /* AD */
   printRow(userParam, bReport, table, "AD", "description-groups", "amount-groups");
   /* tot A */
   printRow(userParam, bReport, table, "A", "description-groups", "amount-groups-totals");

   if (userParam.stampa) {
      report.addPageBreak();

      if (userParam.printtitle) {
         report.addParagraph(" ", "");
         report.addParagraph(title, "heading2");
         report.addParagraph(" ", "");
      }
   } else {
      report.addParagraph(" ", "");
      report.addParagraph(" ", "");      
   }
}

function printRendicontoModA_Passivo(banDoc, report, userParam, bReport) {

   var endDate = userParam.selectionEndDate;
   var currentYear = Banana.Converter.toDate(banDoc.info("AccountingDataBase", "OpeningDate")).getFullYear();
   var previousYear = currentYear - 1;

   // tabella Passivo
   var table = report.addTable("table");
   if (userParam.printcolumn) {
      var column1 = table.addColumn("column01");
      var column2 = table.addColumn("column02");
      var column3 = table.addColumn("column03");
      var column4 = table.addColumn("column04");
   }
   else {
      var column1 = table.addColumn("column1");
      var column2 = table.addColumn("column2");
      var column3 = table.addColumn("column3");
   }

   var tableIntestazione = table.getHeader();
   tableRow = tableIntestazione.addRow();
   if (userParam.printcolumn) {
      tableRow.addCell("", "", 1);
   }
   tableRow.addCell("", "", 1);
   if (userParam.printpreviousyear) {
      tableRow.addCell(Banana.Converter.toLocaleDateFormat(endDate), "table-header", 1);
      tableRow.addCell("31.12." + previousYear, "table-header", 1);
   } else {
      tableRow.addCell("", "", 1);
      tableRow.addCell(Banana.Converter.toLocaleDateFormat(endDate), "table-header", 1);
   }

   tableRow = table.addRow();
   if (userParam.printcolumn) {
      tableRow.addCell(userParam.column, "liabilties-title lvl0", 1);
   }
   tableRow.addCell("PASSIVO", "liabilties-title lvl0", 3);

   /* dPA */
   printRow(userParam, bReport, table, "dPA", "description-groups", "amount-groups");
   /* PAI */
   printRow(userParam, bReport, table, "PAI", "description-groups", "amount-groups");
   /* dPAII */
   printRow(userParam, bReport, table, "dPAII", "description-groups", "amount-groups");
   /* PAII1 */
   printRow(userParam, bReport, table, "PAII1", "description-groups", "amount-groups");
   /* PAII2 */
   printRow(userParam, bReport, table, "PAII2", "description-groups", "amount-groups");
   /* PAII3 */
   printRow(userParam, bReport, table, "PAII3", "description-groups", "amount-groups");
   /* tot PAII */
   printRow(userParam, bReport, table, "PAII", "description-groups", "amount-groups-totals");
   /* dPAIII */
   printRow(userParam, bReport, table, "dPAIII", "description-groups", "amount-groups");
   /* PAIII1 */
   printRow(userParam, bReport, table, "PAIII1", "description-groups", "amount-groups");
   /* PAIII2 */
   printRow(userParam, bReport, table, "PAIII2", "description-groups", "amount-groups");
   /* tot PAIII */
   printRow(userParam, bReport, table, "PAIII", "description-groups", "amount-groups-totals");
   /* PAIV */
   printRow(userParam, bReport, table, "PAIV", "description-groups", "amount-groups");
   /* tot PA */
   printRow(userParam, bReport, table, "PA", "description-groups", "amount-totals");
   /* dPB */
   printRow(userParam, bReport, table, "dPB", "description-groups", "amount-groups");
   /* PB1 */
   printRow(userParam, bReport, table, "PB1", "description-groups", "amount-groups");
   /* PB2 */
   printRow(userParam, bReport, table, "PB2", "description-groups", "amount-groups");
   /* PB3 */
   printRow(userParam, bReport, table, "PB3", "description-groups", "amount-groups");
   /* tot PB */
   printRow(userParam, bReport, table, "PB", "description-groups", "amount-totals");
   /* PC */
   printRow(userParam, bReport, table, "PC", "description-groups", "amount-groups");
   /* dPD */
   printRow(userParam, bReport, table, "dPD", "description-groups", "amount-groups");
   /* PD1 */
   printRow(userParam, bReport, table, "PD1", "description-groups", "amount-groups");
   if (bReport.getObjectCurrentAmountFormatted("PD1") || bReport.getObjectPreviousAmountFormatted("PD1")) {
      printSubRow(userParam, bReport, table, "PD1e", "description-groups", "amount-groups");
      printSubRow(userParam, bReport, table, "PD1o", "description-groups", "amount-groups");
   }
   /* PD2 */
   printRow(userParam, bReport, table, "PD2", "description-groups", "amount-groups");
   if (bReport.getObjectCurrentAmountFormatted("PD2") || bReport.getObjectPreviousAmountFormatted("PD2")) {
      printSubRow(userParam, bReport, table, "PD2e", "description-groups", "amount-groups");
      printSubRow(userParam, bReport, table, "PD2o", "description-groups", "amount-groups");
   }
   /* PD3 */
   printRow(userParam, bReport, table, "PD3", "description-groups", "amount-groups");
   if (bReport.getObjectCurrentAmountFormatted("PD3") || bReport.getObjectPreviousAmountFormatted("PD1")) {
      printSubRow(userParam, bReport, table, "PD3e", "description-groups", "amount-groups");
      printSubRow(userParam, bReport, table, "PD3o", "description-groups", "amount-groups");
   }
   /* PD4 */
   printRow(userParam, bReport, table, "PD4", "description-groups", "amount-groups");
   if (bReport.getObjectCurrentAmountFormatted("PD4") || bReport.getObjectPreviousAmountFormatted("PD4")) {
      printSubRow(userParam, bReport, table, "PD4e", "description-groups", "amount-groups");
      printSubRow(userParam, bReport, table, "PD4o", "description-groups", "amount-groups");
   }
   /* PD5 */
   printRow(userParam, bReport, table, "PD5", "description-groups", "amount-groups");
   if (bReport.getObjectCurrentAmountFormatted("PD5") || bReport.getObjectPreviousAmountFormatted("PD5")) {
      printSubRow(userParam, bReport, table, "PD5e", "description-groups", "amount-groups");
      printSubRow(userParam, bReport, table, "PD5o", "description-groups", "amount-groups");
   }
   /* PD6 */
   printRow(userParam, bReport, table, "PD6", "description-groups", "amount-groups");
   if (bReport.getObjectCurrentAmountFormatted("PD6") || bReport.getObjectPreviousAmountFormatted("PD6")) {
      printSubRow(userParam, bReport, table, "PD6e", "description-groups", "amount-groups");
      printSubRow(userParam, bReport, table, "PD6o", "description-groups", "amount-groups");
   }
   /* PD7 */
   printRow(userParam, bReport, table, "PD7", "description-groups", "amount-groups");
   if (bReport.getObjectCurrentAmountFormatted("PD7") || bReport.getObjectPreviousAmountFormatted("PD7")) {
      printSubRow(userParam, bReport, table, "PD7e", "description-groups", "amount-groups");
      printSubRow(userParam, bReport, table, "PD7o", "description-groups", "amount-groups");
   }
   /* PD8 */
   printRow(userParam, bReport, table, "PD8", "description-groups", "amount-groups");
   if (bReport.getObjectCurrentAmountFormatted("PD8") || bReport.getObjectPreviousAmountFormatted("PD8")) {
      printSubRow(userParam, bReport, table, "PD8e", "description-groups", "amount-groups");
      printSubRow(userParam, bReport, table, "PD8o", "description-groups", "amount-groups");
   }
   /* PD9 */
   printRow(userParam, bReport, table, "PD9", "description-groups", "amount-groups");
   if (bReport.getObjectCurrentAmountFormatted("PD9") || bReport.getObjectPreviousAmountFormatted("PD9")) {
      printSubRow(userParam, bReport, table, "PD9e", "description-groups", "amount-groups");
      printSubRow(userParam, bReport, table, "PD9o", "description-groups", "amount-groups");
   }
   /* PD10 */
   printRow(userParam, bReport, table, "PD10", "description-groups", "amount-groups");
   if (bReport.getObjectCurrentAmountFormatted("PD10") || bReport.getObjectPreviousAmountFormatted("PD10")) {
      printSubRow(userParam, bReport, table, "PD10e", "description-groups", "amount-groups");
      printSubRow(userParam, bReport, table, "PD10o", "description-groups", "amount-groups");
   }
   /* PD11 */
   printRow(userParam, bReport, table, "PD11", "description-groups", "amount-groups");
   if (bReport.getObjectCurrentAmountFormatted("PD11") || bReport.getObjectPreviousAmountFormatted("PD11")) {
      printSubRow(userParam, bReport, table, "PD11e", "description-groups", "amount-groups");
      printSubRow(userParam, bReport, table, "PD11o", "description-groups", "amount-groups");
   }
   /* PD12 */
   printRow(userParam, bReport, table, "PD12", "description-groups", "amount-groups");
   if (bReport.getObjectCurrentAmountFormatted("PD12") || bReport.getObjectPreviousAmountFormatted("PD12")) {
      printSubRow(userParam, bReport, table, "PD12e", "description-groups", "amount-groups");
      printSubRow(userParam, bReport, table, "PD12o", "description-groups", "amount-groups");
   }
   /* tot PD */
   printRow(userParam, bReport, table, "PD", "description-groups", "amount-totals");
   /* PE */
   printRow(userParam, bReport, table, "PE", "description-groups", "amount-groups");
   /* tot P */
   printRow(userParam, bReport, table, "P", "description-groups", "amount-groups-totals");
}

function printRendicontoModA_Note_Finali(report, userParam) {
   if (userParam.finalnotes) {
      report.addParagraph(" ", "");
      report.addParagraph(userParam.finalnotes, "text-notes");
   }
}

function printRendicontoModA_Footer(report) {
   report.getFooter().addClass("footer");
   report.getFooter().addText("- ", "");
   report.getFooter().addFieldPageNr();
   report.getFooter().addText(" -", "");
}

function checkResults(banDoc, report, bReport) {

   /* totale Attivo */
   var currentA_report = bReport.getObjectValue("A","currentAmount");

   /* totale Passivo */
   var currentP_report = bReport.getObjectValue("P","currentAmount");

   //Banana.console.log("REPORT: " + currentA_report + "  ?=  " + currentP_report);
   if (currentA_report !== currentP_report) {
      // banDoc.addMessage("Differenza tra Attivo <"+Banana.Converter.toLocaleNumberFormat(currentA_report)+"> e Passivo <"+Banana.Converter.toLocaleNumberFormat(currentP_report)+"> da report");
      report.addParagraph(" ", "");
      report.addParagraph(" ", "");
      report.addParagraph("Attenzione: differenza tra totale Attivo <"+Banana.Converter.toLocaleNumberFormat(currentA_report)+"> e totale Passivo <"+Banana.Converter.toLocaleNumberFormat(currentP_report)+">", "alert-message");
   }
}

function setCss(banDoc, repStyleObj, userParam) {
   var textCSS = "";
   var file = Banana.IO.getLocalFile("file:script/rendicontoModA.css");
   var fileContent = file.read();
   if (!file.errorString) {
      Banana.IO.openPath(fileContent);
      //Banana.console.log(fileContent);
      textCSS = fileContent;
   } else {
      Banana.console.log(file.errorString);
   }
   // Parse the CSS text
   repStyleObj.parse(textCSS);
}




/**************************************************************************************
 * Functions to manage the parameters
 **************************************************************************************/
function convertParam(userParam) {

   var convertedParam = {};
   convertedParam.version = '1.0';
   convertedParam.data = [];

   var currentParam = {};
   currentParam.name = 'header_group';
   currentParam.title = 'Intestazione pagina';
   currentParam.type = 'string';
   currentParam.value = '';
   currentParam.editable = false;
   currentParam.readValue = function() {
      userParam.header_group = this.value;
   }
   convertedParam.data.push(currentParam);

   var currentParam = {};
   currentParam.name = 'logo';
   currentParam.parentObject = 'header_group';
   currentParam.title = 'Stampa logo';
   currentParam.type = 'bool';
   currentParam.value = userParam.logo ? true : false;
   currentParam.defaultvalue = false;
   currentParam.readValue = function() {
      userParam.logo = this.value;
   }
   convertedParam.data.push(currentParam);

   var currentParam = {};
   currentParam.name = 'logoname';
   currentParam.parentObject = 'header_group';
   currentParam.title = 'Nome logo (Imposta Logo -> Personalizzazione)';
   currentParam.type = 'string';
   currentParam.value = userParam.logoname ? userParam.logoname : 'Logo';
   currentParam.defaultvalue = 'Logo';
   currentParam.readValue = function() {
     userParam.logoname = this.value;
   }
   convertedParam.data.push(currentParam);

   currentParam = {};
   currentParam.name = 'printheader';
   currentParam.parentObject = 'header_group';
   currentParam.title = 'Stampa testo indirizzo';
   currentParam.type = 'bool';
   currentParam.value = userParam.printheader ? true : false;
   currentParam.defaultvalue = false;
   currentParam.readValue = function() {
    userParam.printheader = this.value;
   }
   convertedParam.data.push(currentParam);

   var currentParam = {};
   currentParam.name = 'headertext';
   currentParam.parentObject = 'header_group';
   currentParam.title = 'Testo indirizzo alternativo (su più righe)';
   currentParam.type = 'multilinestring';
   currentParam.value = userParam.headertext ? userParam.headertext : '';
   currentParam.defaultvalue = '';
   currentParam.readValue = function() {
     userParam.headertext = this.value;
   }
   convertedParam.data.push(currentParam);

   var currentParam = {};
   currentParam.name = 'title_group';
   currentParam.title = 'Titolo';
   currentParam.type = 'string';
   currentParam.value = '';
   currentParam.editable = false;
   currentParam.readValue = function() {
      userParam.title_group = this.value;
   }
   convertedParam.data.push(currentParam);

   currentParam = {};
   currentParam.name = 'printtitle';
   currentParam.parentObject = 'title_group';
   currentParam.title = 'Stampa titolo';
   currentParam.type = 'bool';
   currentParam.value = userParam.printtitle ? true : false;
   currentParam.defaultvalue = true;
   currentParam.readValue = function() {
    userParam.printtitle = this.value;
   }
   convertedParam.data.push(currentParam);

   var currentParam = {};
   currentParam.name = 'title';
   currentParam.parentObject = 'title_group';
   currentParam.title = 'Testo titolo alternativo (vuoto = testo predefinito)';
   currentParam.type = 'string';
   currentParam.value = userParam.title ? userParam.title : '';
   currentParam.defaultvalue = '';
   currentParam.readValue = function() {
      userParam.title = this.value;
   }
   convertedParam.data.push(currentParam);

   var currentParam = {};
   currentParam.name = 'report_group';
   currentParam.title = 'Dettagli stato patrimoniale';
   currentParam.type = 'string';
   currentParam.value = '';
   currentParam.editable = false;
   currentParam.readValue = function() {
      userParam.report_group = this.value;
   }
   convertedParam.data.push(currentParam);

   var currentParam = {};
   currentParam.name = 'column';
   currentParam.parentObject = 'report_group';
   currentParam.title = "Colonna raggruppamento (nome XML colonna)";
   currentParam.type = 'string';
   currentParam.value = userParam.column ? userParam.column : 'Gr1';
   currentParam.defaultvalue = 'Gr1';
   currentParam.readValue = function() {
      userParam.column = this.value;
   }
   convertedParam.data.push(currentParam);

   var currentParam = {};
   currentParam.name = 'printcolumn';
   currentParam.parentObject = 'report_group';
   currentParam.title = 'Stampa colonna raggruppamento';
   currentParam.type = 'bool';
   currentParam.value = userParam.printcolumn ? true : false;
   currentParam.defaultvalue = true;
   currentParam.readValue = function() {
      userParam.printcolumn = this.value;
   }
   convertedParam.data.push(currentParam);

   var currentParam = {};
   currentParam.name = 'printpreviousyear';
   currentParam.parentObject = 'report_group';
   currentParam.title = 'Stampa colonna anno precedente';
   currentParam.type = 'bool';
   currentParam.value = userParam.printpreviousyear ? true : false;
   currentParam.defaultvalue = true;
   currentParam.readValue = function() {
      userParam.printpreviousyear = this.value;
   }
   convertedParam.data.push(currentParam);

   var currentParam = {};
   currentParam.name = 'compattastampa';
   currentParam.parentObject = 'report_group';
   currentParam.title = 'Escludi voci con importi nulli per due esercizi consecutivi';
   currentParam.type = 'bool';
   currentParam.value = userParam.compattastampa ? true : false;
   currentParam.defaultvalue = false;
   currentParam.readValue = function() {
      userParam.compattastampa = this.value;
   }
   convertedParam.data.push(currentParam);

   var currentParam = {};
   currentParam.name = 'stampa';
   currentParam.parentObject = 'report_group';
   currentParam.title = 'Stampa Attivi e Passivi su pagine separate';
   currentParam.type = 'bool';
   currentParam.value = userParam.stampa ? true : false;
   currentParam.defaultvalue = true;
   currentParam.readValue = function() {
      userParam.stampa = this.value;
   }
   convertedParam.data.push(currentParam);

   var currentParam = {};
   currentParam.name = 'finalnotes';
   currentParam.parentObject = 'report_group';
   currentParam.title = 'Note finali';
   currentParam.type = 'multilinestring';
   currentParam.value = userParam.finalnotes ? userParam.finalnotes : '';
   currentParam.defaultvalue = '';
   currentParam.readValue = function() {
      userParam.finalnotes = this.value;
   }
   convertedParam.data.push(currentParam);

   return convertedParam;
}

function initUserParam() {
   var userParam = {};
   userParam.logo = false;
   userParam.logoname = 'Logo';
   userParam.printheader = false;
   userParam.headertext = '';
   userParam.printtitle = true;
   userParam.title = '';
   userParam.column = 'Gr1';
   userParam.printcolumn = true;
   userParam.printpreviousyear = true;
   userParam.compattastampa = false;
   userParam.stampa = true;
   userParam.finalnotes = '';
   return userParam;
}

function parametersDialog(userParam) {
   if (typeof(Banana.Ui.openPropertyEditor) !== 'undefined') {
      var dialogTitle = "Parametri";
      var convertedParam = convertParam(userParam);
      var pageAnchor = 'dlgSettings';
      if (!Banana.Ui.openPropertyEditor(dialogTitle, convertedParam, pageAnchor)) {
         return null;
      }
      for (var i = 0; i < convertedParam.data.length; i++) {
         // Read values to userParam (through the readValue function)
         convertedParam.data[i].readValue();
      }
      //  Reset reset default values
      userParam.useDefaultTexts = false;
   }

   return userParam;
}

function settingsDialog() {
   var userParam = initUserParam();
   var savedParam = Banana.document.getScriptSettings();
   if (savedParam && savedParam.length > 0) {
      userParam = JSON.parse(savedParam);
   }

   //We take the accounting "starting date" and "ending date" from the document. These will be used as default dates
   var docStartDate = Banana.document.startPeriod();
   var docEndDate = Banana.document.endPeriod();

   //A dialog window is opened asking the user to insert the desired period. By default is the accounting period
   var selectedDates = Banana.Ui.getPeriod('', docStartDate, docEndDate,
      userParam.selectionStartDate, userParam.selectionEndDate, userParam.selectionChecked);

   //We take the values entered by the user and save them as "new default" values.
   //This because the next time the script will be executed, the dialog window will contains the new values.
   if (selectedDates) {
      userParam["selectionStartDate"] = selectedDates.startDate;
      userParam["selectionEndDate"] = selectedDates.endDate;
      userParam["selectionChecked"] = selectedDates.hasSelection;
   } else {
      //User clicked cancel
      return null;
   }

   userParam = parametersDialog(userParam); // From propertiess
   if (userParam) {
      var paramToString = JSON.stringify(userParam);
      Banana.document.setScriptSettings(paramToString);
   }

   return userParam;
}





/**************************************************************************************
 * Check the banana version
 **************************************************************************************/
function bananaRequiredVersion(requiredVersion, expmVersion) {
   if (expmVersion) {
      requiredVersion = requiredVersion + "." + expmVersion;
   }
   if (Banana.compareVersion && Banana.compareVersion(Banana.application.version, requiredVersion) < 0) {
      Banana.application.showMessages();
      Banana.document.addMessage(getErrorMessage(ID_ERR_VERSIONE));
      return false;
   }
   else {
      if (Banana.application.license) {
         if (Banana.application.license.licenseType === "professional" || Banana.application.license.licenseType === "advanced") {
            return true;
         }
         else {
            Banana.application.showMessages();
            Banana.document.addMessage(getErrorMessage(ID_ERR_LICENZA_ADVANCED));           
            return false;
         }
      }
   }
}

