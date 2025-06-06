// Copyright [2025] [Banana.ch SA - Lugano Switzerland]
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
// @id = ch.banana.it.extension.asd.rendicontogestionale
// @api = 1.0
// @pubdate = 2025-05-13
// @publisher = Banana.ch SA
// @description = 2. Rendiconto gestionale ASD
// @task = app.command
// @doctype = 100.*
// @docproperties = associazioniasd
// @outputformat = none
// @inputdatasource = none
// @timeout = -1
// @includejs = reportstructure.js
// @includejs = breport.js
// @includejs = breportcontrollo.js
// @includejs = errors.js


/*

   Stampa del 'Rendiconto gestionale' secondo nuovi schemi per ASD.

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

   // Set variables used for the CSS. Variables start with $
   var variables = {};
   setVariables(variables, userParam);

   // Creates the report stylesheet
   var stylesheet = Banana.Report.newStyleSheet();

   // Create the param report object
   var paramReport = setParamReport(Banana.document, userParam);

   // Print the report (normal or with transactions movements)
   var report;
   if (userParam.stampareportcontrollo) {
      report = stampaReportControllo(Banana.document, paramReport);
   } else {
      report = stampaReportNormale(Banana.document, paramReport, stylesheet);
   }

   setCss(Banana.document, stylesheet, variables, userParam);
   Banana.Report.preview(report, stylesheet);
}

function stampaReportNormale(banDoc, paramReport, stylesheet) {

   // Prints the normal report

   var bReport = new BReport(banDoc, paramReport);
   bReport.validateGroups_IncomeExpenses(paramReport.userParam.column, paramReport.reportStructure);
   bReport.loadBalances();
   bReport.calculateTotals(["currentAmount", "previousAmount"]);
   bReport.formatValues(["currentAmount", "previousAmount"], paramReport.userParam.excludedecimals);

   var report = printRendicontoModB(banDoc, paramReport.userParam, bReport, stylesheet);

   return report;
}

function stampaReportControllo(banDoc, paramReport) {
   
   // Print the report with transactions movements
   
   var bReportControllo = new BReportControllo(banDoc, paramReport);
   bReportControllo.validateGroups_IncomeExpenses(paramReport.userParam.column, paramReport.reportStructure);
   bReportControllo.loadBalances();
   bReportControllo.calculateTotals(["currentAmount", "previousAmount"]);
   bReportControllo.formatValues(["currentAmount", "previousAmount"]);

   var report = bReportControllo.printReportControllo();

   return report;
}

function setParamReport(banDoc, userParam) {

   let paramReport = {};
   // paramReport.userParam;
   // paramReport.reportStructure;
   // paramReport.printStructure;
   // paramReport.currentCardFields;
   // paramReport.currentCardTitles;
   
   // User parameters from script settings
   paramReport.userParam = userParam;

   // Report structure
   let reportStructure = createReportStructureRendicontoGestionale();
   paramReport.reportStructure = reportStructure;

   // Print report structure
   let printStructure = createPrintStructureRendicontoGestionale();
   paramReport.printStructure = printStructure;

   // CurrentCard fields names
   let currentCardFields = ["JDate","Doc","JDescription","JAccount","JDebitAmount","JCreditAmount","JBalance"];
   paramReport.currentCardFields = currentCardFields;
   
   // CurrentCard columns headers texts
   let currentCardTitles = [];
   if (banDoc.table("Categories")) {
      currentCardTitles = ["Data","Doc","Descrizione","Conto","Entrate","Uscite","Saldo"];
   } else {
      currentCardTitles = ["Data","Doc","Descrizione","Conto","Dare","Avere","Saldo"];
   }
   paramReport.currentCardTitles = currentCardTitles;
   
   return paramReport;
}









function printRendicontoModB(banDoc, userParam, bReport, stylesheet) {

   var report = Banana.Report.newReport("Rendiconto gestionale");

   printRendicontoModB_Header(report, banDoc, userParam, stylesheet);
   printRendicontoModB_Title(report, banDoc, userParam);
   printRendicontoModB_Testo_Iniziale(report, banDoc, userParam);
   printRendicontoModB_Costi_Proventi(report, banDoc, userParam, bReport);
   printRendicontoModB_Note_Finali(report, userParam);

   return report;
}

function printRendicontoModB_Header(report, banDoc, userParam, stylesheet) {

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

   // Address
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
         // if (phone) {
         //    headerParagraph.addParagraph(phone, "address-header");
         // }
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

   return report;
}

function printRendicontoModB_Title(report, banDoc, userParam) {

   var currentYear = Banana.Converter.toDate(userParam.selectionEndDate).getFullYear();

   var title = banDoc.info("Base", "HeaderLeft") + " - " + "RENDICONTO GESTIONALE ANNO " + currentYear;;
   if (userParam.title) {
      title = userParam.title;
   }

   if (userParam.printtitle) {
      report.addParagraph(" ", "");
      report.addParagraph(title, "heading2");
      report.addParagraph(" ", "");
   }

   return report;
}

function printRendicontoModB_Testo_Iniziale(report, banDoc, userParam) {

   var textbegin = "";
   if (userParam.textbegin) {
      textbegin = userParam.textbegin.trim();
   }
   if (textbegin) {
      report.addParagraph(textbegin, "text-begin");
      report.addParagraph(" ", "");
   }

   return report;
}

function printRendicontoModB_Costi_Proventi(report, banDoc, userParam, bReport) {

   // Costi e Proventi

   var dateCurrent = Banana.Converter.toLocaleDateFormat(userParam.selectionEndDate);

   //Calculate date previous: start period - 1 day
   var datePrevious = Banana.Converter.toDate(userParam.selectionStartDate);
   datePrevious.setDate(datePrevious.getDate() - 1);
   datePrevious = Banana.Converter.toLocaleDateFormat(datePrevious);
   
   report.addParagraph("(Importi in " + banDoc.info("AccountingDataBase", "BasicCurrency") + ")", "text-currency");

   var table = report.addTable("table");
   var column0,column1,column2,column3,column4,column5,column6,column7,column8;
   if (userParam.printcolumn) {
      column0 = table.addColumn("column00");
      column1 = table.addColumn("column01");
      column2 = table.addColumn("column02");
      column3 = table.addColumn("column03");
      column4 = table.addColumn("column04");
      column5 = table.addColumn("column05");
      column6 = table.addColumn("column06");
      column7 = table.addColumn("column07");
      column8 = table.addColumn("column08");
   }
   else {
      column1 = table.addColumn("column1");
      column2 = table.addColumn("column2");
      column3 = table.addColumn("column3");
      column4 = table.addColumn("column4");
      column5 = table.addColumn("column5");
      column6 = table.addColumn("column6");
      column7 = table.addColumn("column7");
   }

   tableRow = table.addRow();
   if (userParam.printcolumn) {
      tableRow.addCell(userParam.column.toUpperCase(), "table-header", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("dC"), "table-header", 1);
   tableRow.addCell(dateCurrent, "table-header align-right", 1);
   tableRow.addCell(datePrevious, "table-header align-right", 1);
   tableRow.addCell("", "", 1);
   if (userParam.printcolumn) {
      tableRow.addCell(userParam.column.toUpperCase(), "table-header", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("dR"), "table-header", 1);
   tableRow.addCell(dateCurrent, "table-header align-right", 1);
   tableRow.addCell(datePrevious, "table-header align-right", 1);

   /* Row 1 */   
   tableRow = table.addRow();
   if (userParam.printcolumn) {
      tableRow.addCell("", "", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("dCA"), "align-left bold", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   if (userParam.printcolumn) {
      tableRow.addCell("", "", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("dRA"), "align-left bold", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);

   /* Row 2*/
   tableRow = table.addRow();
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectId("CA1"), "align-left", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("CA1"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CA1"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CA1"), "align-right", 1);
   tableRow.addCell("", "", 1);
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectId("RA1"), "align-left", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("RA1"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RA1"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RA1"), "align-right", 1);

   /* Row 3 */
   tableRow = table.addRow();
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectId("CA2"), "align-left", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("CA2"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CA2"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CA2"), "align-right", 1);
   tableRow.addCell("", "", 1);
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectId("RA2"), "align-left", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("RA2"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RA2"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RA2"), "align-right", 1);

   /* Row 4 */
   tableRow = table.addRow();
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectId("CA3"), "align-left", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("CA3"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CA3"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CA3"), "align-right", 1);
   tableRow.addCell("", "", 1);
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectId("RA3"), "align-left", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("RA3"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RA3"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RA3"), "align-right", 1);

   /* Row 5 */
   tableRow = table.addRow();
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectId("CA4"), "align-left", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("CA4"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CA4"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CA4"), "align-right", 1);
   tableRow.addCell("", "", 1);
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectId("RA4"), "align-left", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("RA4"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RA4"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RA4"), "align-right", 1);

   /* Row 6 */
   tableRow = table.addRow();
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectId("CA5"), "align-left", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("CA5"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CA5"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CA5"), "align-right", 1);
   tableRow.addCell("", "", 1);
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectId("RA5"), "align-left", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("RA5"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RA5"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RA5"), "align-right", 1);

   /* Row 7 */
   tableRow = table.addRow();
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectId("CA6"), "align-left", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("CA6"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CA6"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CA6"), "align-right", 1);
   tableRow.addCell("", "", 1);
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectId("RA6"), "align-left", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("RA6"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RA6"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RA6"), "align-right", 1);

   /* Row 8 */
   tableRow = table.addRow();
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectId("CA7"), "align-left", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("CA7"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CA7"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CA7"), "align-right", 1);
   tableRow.addCell("", "", 1);
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectId("RA7"), "align-left", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("RA7"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RA7"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RA7"), "align-right", 1);

   /* Row 9 */
   tableRow = table.addRow();
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectId("CA8"), "align-left", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("CA8"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CA8"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CA8"), "align-right", 1);
   tableRow.addCell("", "", 1);
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectId("RA8"), "align-left", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("RA8"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RA8"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RA8"), "align-right", 1);

   /* Row 10 */
   tableRow = table.addRow();
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectId("CA9"), "align-left", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("CA9"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CA9"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CA9"), "align-right", 1);
   tableRow.addCell("", "", 1);
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectId("RA9"), "align-left", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("RA9"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RA9"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RA9"), "align-right", 1);

   /* Row 11 */
   tableRow = table.addRow();
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectId("CA10"), "align-left", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("CA10"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CA10"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CA10"), "align-right", 1);
   tableRow.addCell("", "", 1);
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectId("RA10"), "align-left", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("RA10"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RA10"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RA10"), "align-right", 1);

   /* Row 11 */
   tableRow = table.addRow();
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectId("CA11"), "align-left", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("CA11"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CA11"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CA11"), "align-right", 1);
   tableRow.addCell("", "", 1);
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectId("RA11"), "align-left", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("RA11"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RA11"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RA11"), "align-right", 1);

   /* Row 11 */
   tableRow = table.addRow();
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectId("CA12"), "align-left", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("CA12"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CA12"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CA12"), "align-right", 1);
   tableRow.addCell("", "", 1);
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectId("RA12"), "align-left", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("RA12"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RA12"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RA12"), "align-right", 1);

   /* Row 12 */
   tableRow = table.addRow();
   if (userParam.printcolumn) {
      tableRow.addCell("", "", 1);
   }
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectId("RA13"), "align-left", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("RA13"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RA13"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RA13"), "align-right", 1);

   /* Row 13, tot */
   tableRow = table.addRow();
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectId("CA"), "align-left", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("CA"), "align-right", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CA"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CA"), "align-right", 1);
   tableRow.addCell("", "", 1);
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectId("RA"), "align-left", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("RA"), "align-right", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RA"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RA"), "align-right", 1);

   /* Row 14, +/- */
   tableRow = table.addRow();
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectId("RA-CA"), "align-left", 1);
      tableRow.addCell(bReport.getObjectDescription("RA-CA"), "align-right", 6);
   }
   else {
      tableRow.addCell(bReport.getObjectDescription("RA-CA"), "align-right", 5);
   }
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RA-CA"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RA-CA"), "align-right", 1);

   /* Row 15 */
   tableRow = table.addRow();
   if (userParam.printcolumn) {
      tableRow.addCell("", "", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("dCB"), "align-left bold", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   if (userParam.printcolumn) {
      tableRow.addCell("", "", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("dRB"), "align-left bold", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);

   /* Row 16 */
   tableRow = table.addRow();
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectId("CB1"), "align-left", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("CB1"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CB1"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CB1"), "align-right", 1);
   tableRow.addCell("", "", 1);
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectId("RB1"), "align-left", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("RB1"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RB1"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RB1"), "align-right", 1);

   /* Row 17 */
   tableRow = table.addRow();
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectId("CB2"), "align-left", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("CB2"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CB2"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CB2"), "align-right", 1);
   tableRow.addCell("", "", 1);
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectId("RB2"), "align-left", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("RB2"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RB2"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RB2"), "align-right", 1);

   /* Row 18 */
   tableRow = table.addRow();
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectId("CB3"), "align-left", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("CB3"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CB3"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CB3"), "align-right", 1);
   tableRow.addCell("", "", 1);
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectId("RB3"), "align-left", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("RB3"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RB3"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RB3"), "align-right", 1);

   /* Row 19 */
   tableRow = table.addRow();
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectId("CB4"), "align-left", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("CB4"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CB4"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CB4"), "align-right", 1);
   tableRow.addCell("", "", 1);
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectId("RB4"), "align-left", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("RB4"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RB4"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RB4"), "align-right", 1);

   /* Row 20 */
   tableRow = table.addRow();
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectId("CB5"), "align-left", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("CB5"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CB5"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CB5"), "align-right", 1);
   tableRow.addCell("", "", 1);
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectId("RB5"), "align-left", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("RB5"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RB5"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RB5"), "align-right", 1);

   /* Row 21 */
   tableRow = table.addRow();
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectId("CB6"), "align-left", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("CB6"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CB6"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CB6"), "align-right", 1);
   tableRow.addCell("", "", 1);
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectId("RB6"), "align-left", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("RB6"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RB6"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RB6"), "align-right", 1);

   /* Row 22 */
   tableRow = table.addRow();
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectId("CB7"), "align-left", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("CB7"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CB7"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CB7"), "align-right", 1);
   tableRow.addCell("", "", 1);
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectId("RB7"), "align-left", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("RB7"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RB7"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RB7"), "align-right", 1);

   /* Row 23 */
   tableRow = table.addRow();
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectId("CB8"), "align-left", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("CB8"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CB8"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CB8"), "align-right", 1);
   tableRow.addCell("", "", 1);
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectId("RBS1"), "align-left", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("RBS1"), "align-right", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RBS1"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RBS1"), "align-right", 1);

   /* Row 23 */
   tableRow = table.addRow();
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectId("CB9"), "align-left", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("CB9"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CB9"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CB9"), "align-right", 1);
   tableRow.addCell("", "", 1);
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectId("RB8"), "align-left", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("RB8"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RB8"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RB8"), "align-right", 1);

   /* Row 23 */
   tableRow = table.addRow();
   if (userParam.printcolumn) {
      tableRow.addCell("", "align-left", 1);
   }
   tableRow.addCell("", "align-left", 1);
   tableRow.addCell("", "align-right", 1);
   tableRow.addCell("", "align-right", 1);
   tableRow.addCell("", "", 1);
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectId("RB9"), "align-left", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("RB9"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RB9"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RB9"), "align-right", 1);

   /* Row 23 */
   tableRow = table.addRow();
   if (userParam.printcolumn) {
      tableRow.addCell("", "align-left", 1);
   }
   tableRow.addCell("", "align-left", 1);
   tableRow.addCell("", "align-right", 1);
   tableRow.addCell("", "align-right", 1);
   tableRow.addCell("", "", 1);
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectId("RB10"), "align-left", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("RB10"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RB10"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RB10"), "align-right", 1);

   /* Row 23 */
   tableRow = table.addRow();
   if (userParam.printcolumn) {
      tableRow.addCell("", "align-left", 1);
   }
   tableRow.addCell("", "align-left", 1);
   tableRow.addCell("", "align-right", 1);
   tableRow.addCell("", "align-right", 1);
   tableRow.addCell("", "", 1);
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectId("RB11"), "align-left", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("RB11"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RB11"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RB11"), "align-right", 1);

   /* Row 23 */
   tableRow = table.addRow();
   if (userParam.printcolumn) {
      tableRow.addCell("", "align-left", 1);
   }
   tableRow.addCell("", "align-left", 1);
   tableRow.addCell("", "align-right", 1);
   tableRow.addCell("", "align-right", 1);
   tableRow.addCell("", "", 1);
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectId("RBS2"), "align-left", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("RBS2"), "align-right", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RBS2"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RBS2"), "align-right", 1);

   /* Row 24, tot */
   tableRow = table.addRow();
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectId("CB"), "align-left", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("CB"), "align-right", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CB"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CB"), "align-right", 1);
   tableRow.addCell("", "", 1);
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectId("RB"), "align-left", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("RB"), "align-right", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RB"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RB"), "align-right", 1);

   /* Row 25, +/- */
   tableRow = table.addRow();
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectId("RB-CB"), "align-left", 1);
      tableRow.addCell(bReport.getObjectDescription("RB-CB"), "align-right", 6);
   }
   else {
      tableRow.addCell(bReport.getObjectDescription("RB-CB"), "align-right", 5);
   }
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RB-CB"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RB-CB"), "align-right", 1);

   /* Row 26 */
   tableRow = table.addRow();
   if (userParam.printcolumn) {
      tableRow.addCell("", "", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("dCC"), "align-left bold", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   if (userParam.printcolumn) {
      tableRow.addCell("", "", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("dRC"), "align-left bold", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);

   /* Row 27 */
   tableRow = table.addRow();
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectId("CC1"), "align-left", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("CC1"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CC1"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CC1"), "align-right", 1);
   tableRow.addCell("", "", 1);
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectId("RC1"), "align-left", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("RC1"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RC1"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RC1"), "align-right", 1);

   /* Row 28 */
   tableRow = table.addRow();
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectId("CC2"), "align-left", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("CC2"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CC2"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CC2"), "align-right", 1);
   tableRow.addCell("", "", 1);
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectId("RC2"), "align-left", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("RC2"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RC2"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RC2"), "align-right", 1);

   /* Row 29 */
   tableRow = table.addRow();
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectId("CC3"), "align-left", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("CC3"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CC3"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CC3"), "align-right", 1);
   tableRow.addCell("", "", 1);
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectId("RC3"), "align-left", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("RC3"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RC3"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RC3"), "align-right", 1);

   /* Row 30, tot */
   tableRow = table.addRow();
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectId("CC"), "align-left", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("CC"), "align-right", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CC"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CC"), "align-right", 1);
   tableRow.addCell("", "", 1);
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectId("RC"), "align-left", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("RC"), "align-right", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RC"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RC"), "align-right", 1);

   /* Row 31, +/- */
   tableRow = table.addRow();
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectId("RC-CC"), "align-left", 1);
      tableRow.addCell(bReport.getObjectDescription("RC-CC"), "align-right", 6);
   } else {
      tableRow.addCell(bReport.getObjectDescription("RC-CC"), "align-right", 5);
   }
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RC-CC"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RC-CC"), "align-right", 1);

   /* Row 32 */
   tableRow = table.addRow();
   if (userParam.printcolumn) {
      tableRow.addCell("", "", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("dCD"), "align-left bold", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   if (userParam.printcolumn) {
      tableRow.addCell("", "", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("dRD"), "align-left bold", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);

   /* Row 33 */
   tableRow = table.addRow();
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectId("CD1"), "align-left", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("CD1"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CD1"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CD1"), "align-right", 1);
   tableRow.addCell("", "", 1);
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectId("RD1"), "align-left", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("RD1"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RD1"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RD1"), "align-right", 1);

   /* Row 34 */
   tableRow = table.addRow();
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectId("CD2"), "align-left", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("CD2"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CD2"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CD2"), "align-right", 1);
   tableRow.addCell("", "", 1);
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectId("RD2"), "align-left", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("RD2"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RD2"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RD2"), "align-right", 1);

   /* Row 35 */
   tableRow = table.addRow();
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectId("CD3"), "align-left", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("CD3"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CD3"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CD3"), "align-right", 1);
   tableRow.addCell("", "", 1);
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectId("RD3"), "align-left", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("RD3"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RD3"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RD3"), "align-right", 1);

   /* Row 36 */
   tableRow = table.addRow();
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectId("CD4"), "align-left", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("CD4"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CD4"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CD4"), "align-right", 1);
   tableRow.addCell("", "", 1);
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectId("RD4"), "align-left", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("RD4"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RD4"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RD4"), "align-right", 1);

   /* Row 37 */
   tableRow = table.addRow();
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectId("CD5"), "align-left", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("CD5"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CD5"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CD5"), "align-right", 1);
   tableRow.addCell("", "", 1);
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectId("RD5"), "align-left", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("RD5"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RD5"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RD5"), "align-right", 1);

   /* Row 39, tot */
   tableRow = table.addRow();
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectId("CD"), "align-left", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("CD"), "align-right", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CD"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CD"), "align-right", 1);
   tableRow.addCell("", "", 1);
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectId("RD"), "align-left", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("RD"), "align-right", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RD"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RD"), "align-right", 1);

   /* Row 40, +/- */
   tableRow = table.addRow();
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectId("RD-CD"), "align-left", 1);
      tableRow.addCell(bReport.getObjectDescription("RD-CD"), "align-right", 6);
   }
   else {
      tableRow.addCell(bReport.getObjectDescription("RD-CD"), "align-right", 5);
   }
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RD-CD"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RD-CD"), "align-right", 1);

   /* Row 41 */
   tableRow = table.addRow();
   if (userParam.printcolumn) {
      tableRow.addCell("", "", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("dCE"), "align-left bold", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   if (userParam.printcolumn) {
      tableRow.addCell("", "", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("dRE"), "align-left bold", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);

   /* Row 42 */
   tableRow = table.addRow();
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectId("CE1"), "align-left", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("CE1"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CE1"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CE1"), "align-right", 1);
   tableRow.addCell("", "", 1);
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectId("RE1"), "align-left", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("RE1"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RE1"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RE1"), "align-right", 1);

   /* Row 43 */
   tableRow = table.addRow();
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectId("CE2"), "align-left", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("CE2"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CE2"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CE2"), "align-right", 1);
   tableRow.addCell("", "", 1);
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectId("RE2"), "align-left", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("RE2"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RE2"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RE2"), "align-right", 1);

   /* Row 44 */
   tableRow = table.addRow();
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectId("CE3"), "align-left", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("CE3"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CE3"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CE3"), "align-right", 1);
   tableRow.addCell("", "", 1);
   if (userParam.printcolumn) {
      tableRow.addCell("", "", 1);
   }
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);

   /* Row 45 */
   tableRow = table.addRow();
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectId("CE4"), "align-left", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("CE4"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CE4"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CE4"), "align-right", 1);
   tableRow.addCell("", "", 1);
   if (userParam.printcolumn) {
      tableRow.addCell("", "", 1);
   }
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);

   /* Row 46 */
   tableRow = table.addRow();
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectId("CE5"), "align-left", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("CE5"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CE5"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CE5"), "align-right", 1);
   tableRow.addCell("", "", 1);
   if (userParam.printcolumn) {
      tableRow.addCell("", "", 1);
   }
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);

   /* Row 47 */
   tableRow = table.addRow();
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectId("CE6"), "align-left", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("CE6"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CE6"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CE6"), "align-right", 1);
   tableRow.addCell("", "", 1);
   if (userParam.printcolumn) {
      tableRow.addCell("", "", 1);
   }
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);

   /* Row 48 */
   tableRow = table.addRow();
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectId("CE7"), "align-left", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("CE7"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CE7"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CE7"), "align-right", 1);
   tableRow.addCell("", "", 1);
   if (userParam.printcolumn) {
      tableRow.addCell("", "", 1);
   }
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);

   /* Row CE8 */
   tableRow = table.addRow();
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectId("CE8"), "align-left", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("CE8"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CE8"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CE8"), "align-right", 1);
   tableRow.addCell("", "", 1);
   if (userParam.printcolumn) {
      tableRow.addCell("", "", 1);
   }
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);

   /* Row CE9 */
   tableRow = table.addRow();
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectId("CE9"), "align-left", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("CE9"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CE9"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CE9"), "align-right", 1);
   tableRow.addCell("", "", 1);
   if (userParam.printcolumn) {
      tableRow.addCell("", "", 1);
   }
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);

   /* Row CE9 */
   tableRow = table.addRow();
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectId("CE10"), "align-left", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("CE10"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CE10"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CE10"), "align-right", 1);
   tableRow.addCell("", "", 1);
   if (userParam.printcolumn) {
      tableRow.addCell("", "", 1);
   }
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);

   /* Row 49 */
   tableRow = table.addRow();
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectId("CE"), "align-left", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("CE"), "align-right", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CE"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CE"), "align-right", 1);
   tableRow.addCell("", "", 1);
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectId("RE"), "align-left", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("RE"), "align-right", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RE"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RE"), "align-right", 1);

   /* Row 40, +/- */
   tableRow = table.addRow();
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectId("RE-CE"), "align-left", 1);
      tableRow.addCell(bReport.getObjectDescription("RE-CE"), "align-right", 6);
   }
   else {
      tableRow.addCell(bReport.getObjectDescription("RE-CE"), "align-right", 5);
   }
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RE-CE"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RE-CE"), "align-right", 1);

   /* Row 50 */
   tableRow = table.addRow();
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectId("C"), "align-left", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("C"), "align-right bold", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("C"), "align-right bold", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("C"), "align-right bold", 1);
   tableRow.addCell("", "", 1);
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectId("R"), "align-left", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("R"), "align-right bold", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("R"), "align-right bold", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("R"), "align-right bold", 1);

   /* Row 51 */
   tableRow = table.addRow();
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectId("TADPI"), "align-left", 1);
      tableRow.addCell(bReport.getObjectDescription("TADPI"), "align-right", 6);
   }
   else {
      tableRow.addCell(bReport.getObjectDescription("TADPI"), "align-right", 5);
   }
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("TADPI"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("TADPI"), "align-right", 1);

   /* Row 52 */
   tableRow = table.addRow();
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectId("IM"), "align-left", 1);
      tableRow.addCell(bReport.getObjectDescription("IM"), "align-right", 6);
   }
   else {
      tableRow.addCell(bReport.getObjectDescription("IM"), "align-right", 5);
   }
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("IM"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("IM"), "align-right", 1);

   /* Row 53 */
   tableRow = table.addRow();
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectId("TADES"), "align-left", 1);
      tableRow.addCell(bReport.getObjectDescription("TADES"), "align-right", 6);
   }
   else {
      tableRow.addCell(bReport.getObjectDescription("TADES"), "align-right", 5);
   }
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("TADES"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("TADES"), "align-right", 1);

   return report;
}

function printRendicontoModB_Note_Finali(report, userParam) {
   if (userParam.finalnotes) {
      report.addParagraph(" ", "");
      report.addParagraph(userParam.finalnotes, "text-notes");
   }
}


/**************************************************************************************
 * Styles
 **************************************************************************************/
function setCss(banDoc, repStyleObj, variables, userParam) {
   var textCSS = "";
   var file = "";
   if (userParam.stampareportcontrollo) {
      file = Banana.IO.getLocalFile("file:script/ch.banana.it.extension.asd.reportcontrollo.css");
   } else {
      file = Banana.IO.getLocalFile("file:script/ch.banana.it.extension.asd.rendicontogestionale.css");
   }
   var fileContent = file.read();
   if (!file.errorString) {
      Banana.IO.openPath(fileContent);
      //Banana.console.log(fileContent);
      textCSS = fileContent;
   } else {
      Banana.console.log(file.errorString);
   }
   // Replace all the "$xxx" variables with the real value
   textCSS = replaceVariables(textCSS, variables);
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

   currentParam = {};
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

   currentParam = {};
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

   currentParam = {};
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

   currentParam = {};
   currentParam.name = 'texts_group';
   currentParam.title = 'Testi';
   currentParam.type = 'string';
   currentParam.value = '';
   currentParam.editable = false;
   currentParam.readValue = function() {
      userParam.texts_group = this.value;
   }
   convertedParam.data.push(currentParam);

   currentParam = {};
   currentParam.name = 'printtitle';
   currentParam.parentObject = 'texts_group';
   currentParam.title = 'Stampa titolo';
   currentParam.type = 'bool';
   currentParam.value = userParam.printtitle ? true : false;
   currentParam.defaultvalue = true;
   currentParam.readValue = function() {
    userParam.printtitle = this.value;
   }
   convertedParam.data.push(currentParam);

   currentParam = {};
   currentParam.name = 'title';
   currentParam.parentObject = 'texts_group';
   currentParam.title = 'Testo titolo alternativo (vuoto = testo predefinito)';
   currentParam.type = 'string';
   currentParam.value = userParam.title ? userParam.title : '';
   currentParam.defaultvalue = '';
   currentParam.readValue = function() {
      userParam.title = this.value;
   }
   convertedParam.data.push(currentParam);

   currentParam = {};
   currentParam.name = 'textbegin';
   currentParam.parentObject = 'texts_group';
   currentParam.title = 'Testo iniziale';
   currentParam.type = 'multilinestring';
   currentParam.value = userParam.textbegin ? userParam.textbegin : '';
   currentParam.defaultvalue = '';
   currentParam.readValue = function() {
      userParam.textbegin = this.value;
   }
   convertedParam.data.push(currentParam);

   currentParam = {};
   currentParam.name = 'finalnotes';
   currentParam.parentObject = 'texts_group';
   currentParam.title = 'Note finali';
   currentParam.type = 'multilinestring';
   currentParam.value = userParam.finalnotes ? userParam.finalnotes : '';
   currentParam.defaultvalue = '';
   currentParam.readValue = function() {
      userParam.finalnotes = this.value;
   }
   convertedParam.data.push(currentParam);

   currentParam = {};
   currentParam.name = 'report_group';
   currentParam.title = 'Dettagli gestionale';
   currentParam.type = 'string';
   currentParam.value = '';
   currentParam.editable = false;
   currentParam.readValue = function() {
      userParam.report_group = this.value;
   }
   convertedParam.data.push(currentParam);

   // currentParam = {};
   // currentParam.name = 'column';
   // currentParam.parentObject = 'report_group';
   // currentParam.title = "Colonna raggruppamento (nome XML colonna)";
   // currentParam.type = 'string';
   // currentParam.value = userParam.column ? userParam.column : 'Gr';
   // currentParam.defaultvalue = 'Gr1';
   // currentParam.readValue = function() {
   //    userParam.column = this.value;
   // }
   // convertedParam.data.push(currentParam);

   currentParam = {};
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

   currentParam = {};
   currentParam.name = 'excludedecimals';
   currentParam.parentObject = 'report_group';
   currentParam.title = 'Arrotonda gli importi all’intero (senza cifre decimali)';
   currentParam.type = 'bool';
   currentParam.value = userParam.excludedecimals ? true : false;
   currentParam.defaultvalue = false;
   currentParam.readValue = function() {
    userParam.excludedecimals = this.value;
   }
   convertedParam.data.push(currentParam);

   currentParam = {};
   currentParam.name = 'styles';
   currentParam.title = 'Stili';
   currentParam.type = 'string';
   currentParam.value = '';
   currentParam.editable = false;
   currentParam.readValue = function() {
    userParam.param_styles = this.value;
   }
   convertedParam.data.push(currentParam);

   currentParam = {};
   currentParam.name = 'colorheadertable';
   currentParam.parentObject = 'styles';
   currentParam.title = 'Colore intestazioni tabelle';
   currentParam.type = 'color';
   currentParam.value = userParam.colorheadertable ? userParam.colorheadertable : '#337ab7';
   currentParam.defaultvalue = '#337ab7';
   currentParam.readValue = function() {
   userParam.colorheadertable = this.value;
   }
   convertedParam.data.push(currentParam);

   currentParam = {};
   currentParam.name = 'reportcontrollo';
   currentParam.title = 'Dettagli movimenti';
   currentParam.type = 'string';
   currentParam.value = '';
   currentParam.editable = false;
   currentParam.readValue = function() {
      userParam.reportcontrollo = this.value;
   }
   convertedParam.data.push(currentParam);

   currentParam = {};
   currentParam.name = 'stampareportcontrollo';
   currentParam.parentObject = 'reportcontrollo';
   currentParam.title = 'Stampa report con dettagli movimenti anno corrente';
   currentParam.type = 'bool';
   currentParam.value = userParam.stampareportcontrollo ? true : false;
   currentParam.defaultvalue = false;
   currentParam.readValue = function() {
      userParam.stampareportcontrollo = this.value;
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
   userParam.textbegin = '';
   userParam.column = 'Gr1'; //per il raggruppamento si usa sempre la colonna Gr1
   userParam.printcolumn = true;
   userParam.excludedecimals = false;
   userParam.finalnotes = '';
   userParam.colorheadertable = '#337ab7';
   userParam.stampareportcontrollo = false;
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
 * Manage variables for the CSS
 **************************************************************************************/
function setVariables(variables, userParam) {
   
   if (!userParam.colorheadertable) {
      userParam.colorheadertable = '#337ab7';
   }

   //background color of header table
   variables.$colorheadertable = userParam.colorheadertable;

   //text color of header table.
   //black (#000000) or white (#FFFFFF) depending of the background color contrast
   //works only if the user enter an HEX color
   variables.$colortextheadertable = getContrast(userParam.colorheadertable);
}

function replaceVariables(cssText, variables) {

  /* 
    Function that replaces all the css variables inside of the given cssText with their values.
    All the css variables start with "$" (i.e. $colorheadertable)
  */

  var result = "";
  var varName = "";
  var insideVariable = false;
  var variablesNotFound = [];

  for (var i = 0; i < cssText.length; i++) {
    var currentChar = cssText[i];
    if (currentChar === "$") {
      insideVariable = true;
      varName = currentChar;
    }
    else if (insideVariable) {
      if (currentChar.match(/^[0-9a-z]+$/) || currentChar === "_" || currentChar === "-") {
        // still a variable name
        varName += currentChar;
      } 
      else {
        // end variable, any other charcter
        if (!(varName in variables)) {
          variablesNotFound.push(varName);
          result += varName;
        }
        else {
          result += variables[varName];
        }
        result += currentChar;
        insideVariable = false;
        varName = "";
      }
    }
    else {
      result += currentChar;
    }
  }

  if (insideVariable) {
    // end of text, end of variable
    if (!(varName in variables)) {
      variablesNotFound.push(varName);
      result += varName;
    }
    else {
      result += variables[varName];
    }
    insideVariable = false;
  }

  if (variablesNotFound.length > 0) {
    //Banana.console.log(">>Variables not found: " + variablesNotFound);
  }
  return result;
}

function getContrast(hexcolor) {
   /**
    * https://24ways.org/2010/calculating-color-contrast
    *
    * In base al contrasto del colore dello sfondo dell'intestazione tabella,
    * determina se impostare il colore del testo bianco o nero.
    * Questo per migliorare la leggibilità.
    */
    hexcolor = hexcolor.replace("#", "");
    var r = parseInt(hexcolor.substr(0,2),16);
    var g = parseInt(hexcolor.substr(2,2),16);
    var b = parseInt(hexcolor.substr(4,2),16);
    var yiq = ((r*299)+(g*587)+(b*114))/1000;
    return (yiq >= 128) ? '#000000' : '#FFFFFF';
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
         if (Banana.application.license.licenseType === "advanced") {
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

