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
// @id = ch.banana.it.extension.rendicontocassa.mod.d
// @api = 1.0
// @pubdate = 2021-11-30
// @publisher = Banana.ch SA
// @description = 3. Rendiconto per cassa
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

   Stampa del 'Rendiconto per cassa (MOD. D)' secondo nuovi schemi per il terzo settore.

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
   var reportStructure = createReportStructureRendicontoCassa();

   /**
    * 2. Calls methods to load balances, calculate totals, format amounts
    * and check entries that can be excluded
    */
   const bReport = new BReport(Banana.document, userParam, reportStructure);
   bReport.validateGroups(userParam.column);
   bReport.loadBalances();
   bReport.calculateTotals(["currentAmount", "previousAmount"]);
   bReport.formatValues(["currentAmount", "previousAmount"]);
   //Banana.console.log(JSON.stringify(reportStructure, "", " "));

   /**
    * 3. Set variables used for the CSS
    * Variables start with $
    */
   var variables = {};
   setVariables(variables, userParam);

   /**
    * 4. Creates the report
    */
   var stylesheet = Banana.Report.newStyleSheet();
   var report = printReport(Banana.document, userParam, bReport, stylesheet);
   setCss(Banana.document, stylesheet, variables, userParam);
   Banana.Report.preview(report, stylesheet);
}

// Funzione che stampa il report
function printReport(banDoc, userParam, bReport, stylesheet) {
	
   var report = Banana.Report.newReport("Rendiconto per cassa");

	printReport_Intestazione(report, banDoc, userParam, stylesheet);
	printReport_Rendiconto_Uscite_Entrate(report, banDoc, userParam, bReport);
   printReport_Rendiconto_Investimenti_Disinvestimenti(report, banDoc, userParam, bReport);
   printReport_Rendiconto_Avanzo_Disavanzo(report, banDoc, userParam, bReport);
   printReport_Rendiconto_Cassa_Banca(report, banDoc, userParam, bReport);
   printReport_Rendiconto_Figurativi(report, banDoc, userParam, bReport);

   checkLiquidity(report, banDoc, bReport);

   printReport_Note_Finali(report, userParam);

	return report;
}

function printReport_Intestazione(report, banDoc, userParam, stylesheet) {
   
   // INTESTAZIONE (LOGO, INDIRIZZO, TITOLO)
   
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
   // Title
   var currentYear = Banana.Converter.toDate(userParam.selectionStartDate).getFullYear(); 
   //Banana.Converter.toDate(banDoc.info("AccountingDataBase", "OpeningDate")).getFullYear();
   var title = "";
   if (userParam.title) {
      title = userParam.title;
   } else {
      title = banDoc.info("Base", "HeaderLeft") + " - " + "RENDICONTO PER CASSA ANNO " + currentYear;
   }
 
   if (userParam.printtitle) {
      report.addParagraph(" ", "");
      report.addParagraph(title, "heading2");
      report.addParagraph(" ", "");
   }
}

function printReport_Rendiconto_Uscite_Entrate(report, banDoc, userParam, bReport) {

   // SEZIONE "USCITE E ENTRATE"
   var dateCurrent = '';
   var datePrevious = '';

   var isColumnBalance = findBalanceColumns(banDoc);
   if (isColumnBalance) {
      //"Balance_2020", "Balance_2021"
      dateCurrent = "31.12." + userParam.currentbalancecolumn.slice(8, 12); 
      datePrevious = "31.12." + userParam.previousbalancecolumn.slice(8, 12);
   } 
   else {
      dateCurrent = Banana.Converter.toLocaleDateFormat(userParam.selectionEndDate);
      
      //Calculate date previous: start period - 1 day
      datePrevious = Banana.Converter.toDate(userParam.selectionStartDate);
      datePrevious.setDate(datePrevious.getDate() - 1);
      datePrevious = Banana.Converter.toLocaleDateFormat(datePrevious);
   }

   var table = report.addTable("table");
   if (userParam.printcolumn) {
      var column0 = table.addColumn("column00");
      var column1 = table.addColumn("column01");
      var column2 = table.addColumn("column02");
      var column3 = table.addColumn("column03");
      var column4 = table.addColumn("column04");
      var column5 = table.addColumn("column05");
      var column6 = table.addColumn("column06");
      var column7 = table.addColumn("column07");
      var column8 = table.addColumn("column08");
   }
   else {
      var column1 = table.addColumn("column1");
      var column2 = table.addColumn("column2");
      var column3 = table.addColumn("column3");
      var column4 = table.addColumn("column4");
      var column5 = table.addColumn("column5");
      var column6 = table.addColumn("column6");
      var column7 = table.addColumn("column7");
   }

   tableRow = table.addRow();
   if (userParam.printcolumn) {
      tableRow.addCell(userParam.column.toUpperCase(), "table-header", 1);
   }
   tableRow.addCell("USCITE", "table-header", 1);
   tableRow.addCell(dateCurrent, "table-header align-right", 1);
   tableRow.addCell(datePrevious, "table-header align-right", 1);
   tableRow.addCell("", "", 1);
   if (userParam.printcolumn) {
      tableRow.addCell(userParam.column.toUpperCase(), "table-header", 1);
   }
   tableRow.addCell("ENTRATE", "table-header", 1);
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
      tableRow.addCell(bReport.getObjectId("CA7"), "align-left", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("CA7"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CA7"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CA7"), "align-right", 1);
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
      tableRow.addCell("","",1);
   }
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
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
      tableRow.addCell("","",1);
   }
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
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
      tableRow.addCell("","",1);
   }
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
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
      tableRow.addCell("","",1);
   }
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
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
      tableRow.addCell("","",1);
   }
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectId("RA10"), "align-left", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("RA10"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RA10"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RA10"), "align-right", 1);

   /* Row 12, tot */
   tableRow = table.addRow();
   if (userParam.printcolumn) {
      tableRow.addCell("", "", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("CA"), "align-right", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CA"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CA"), "align-right", 1);
   tableRow.addCell("", "", 1);
   if (userParam.printcolumn) {
      tableRow.addCell("", "", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("RA"), "align-right", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RA"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RA"), "align-right", 1);

   /* Row 13 */
   tableRow = table.addRow();
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectDescription("RA-CA"), "align-right", 7);
   } else {
      tableRow.addCell(bReport.getObjectDescription("RA-CA"), "align-right", 5);
   }
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RA-CA"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RA-CA"), "align-right", 1);

   /* Row 14 */
   tableRow = table.addRow();
   if (userParam.printcolumn) {
      tableRow.addCell("","", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("dCB"), "align-left bold", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   if (userParam.printcolumn) {
      tableRow.addCell("","", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("dRB"), "align-left bold", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);

   /* Row 15 */
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

   /* Row 16 */
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

   /* Row 17 */
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

   /* Row 18 */
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

   /* Row 19 */
   tableRow = table.addRow();
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectId("CB7"), "align-left", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("CB7"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CB7"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CB7"), "align-right", 1);
   tableRow.addCell("", "", 1);
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectId("RB5"), "align-left", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("RB5"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RB5"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RB5"), "align-right", 1);

   /* Row 20 */
   tableRow = table.addRow();
   if (userParam.printcolumn) {
      tableRow.addCell("","", 1);
   }
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectId("RB6"), "align-left", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("RB6"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RB6"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RB6"), "align-right", 1);

   /* Row 21, tot */
   tableRow = table.addRow();
   if (userParam.printcolumn) {
      tableRow.addCell("","", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("CB"), "align-right", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CB"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CB"), "align-right", 1);
   tableRow.addCell("", "", 1);
   if (userParam.printcolumn) {
      tableRow.addCell("","", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("RB"), "align-right", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RB"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RB"), "align-right", 1);

   /* Row 22 */
   tableRow = table.addRow();
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectDescription("RB-CB"), "align-right", 7);
   } else {
      tableRow.addCell(bReport.getObjectDescription("RB-CB"), "align-right", 5);
   }
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RB-CB"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RB-CB"), "align-right", 1);

   /* Row 23 */
   tableRow = table.addRow();
   if (userParam.printcolumn) {
      tableRow.addCell("","", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("dCC"), "align-left bold", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   if (userParam.printcolumn) {
      tableRow.addCell("","", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("dRC"), "align-left bold", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);

   /* Row 24 */
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

   /* Row 25 */
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

   /* Row 26 */
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

   /* Row 27, tot */
   tableRow = table.addRow();
   if (userParam.printcolumn) {
      tableRow.addCell("","",1);
   }
   tableRow.addCell(bReport.getObjectDescription("CC"), "align-right", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CC"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CC"), "align-right", 1);
   tableRow.addCell("", "", 1);
   if (userParam.printcolumn) {
      tableRow.addCell("","",1);
   }
   tableRow.addCell(bReport.getObjectDescription("RC"), "align-right", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RC"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RC"), "align-right", 1);

   /* Row 28 */
   tableRow = table.addRow();
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectDescription("RC-CC"), "align-right", 7);
   } else {
      tableRow.addCell(bReport.getObjectDescription("RC-CC"), "align-right", 5);
   }
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RC-CC"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RC-CC"), "align-right", 1);

   /* Row 29 */
   tableRow = table.addRow();
   if (userParam.printcolumn) {
      tableRow.addCell("","", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("dCD"), "align-left bold", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   if (userParam.printcolumn) {
      tableRow.addCell("","", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("dRD"), "align-left bold", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);

   /* Row 30 */
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

   /* Row 31 */
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

   /* Row 32 */
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

   /* Row 33 */
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

   /* Row 34 */
   tableRow = table.addRow();
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectId("CD6"), "align-left", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("CD6"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CD6"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CD6"), "align-right", 1);
   tableRow.addCell("", "", 1);
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectId("RD5"), "align-left", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("RD5"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RD5"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RD5"), "align-right", 1);

   /* Row 35, tot */
   tableRow = table.addRow();
   if (userParam.printcolumn) {
      tableRow.addCell("","", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("CD"), "align-right", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CD"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CD"), "align-right", 1);
   tableRow.addCell("", "", 1);
   if (userParam.printcolumn) {
      tableRow.addCell("","",1);
   }
   tableRow.addCell(bReport.getObjectDescription("RD"), "align-right", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RD"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RD"), "align-right", 1);

   /* Row 36 */
   tableRow = table.addRow();
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectDescription("RD-CD"), "align-right", 7);
   } else {
      tableRow.addCell(bReport.getObjectDescription("RD-CD"), "align-right", 5);
   }
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RD-CD"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RD-CD"), "align-right", 1);

   /* Row 37 */
   tableRow = table.addRow();
   if (userParam.printcolumn) {
      tableRow.addCell("","",1);
   }
   tableRow.addCell(bReport.getObjectDescription("dCE"), "align-left bold", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   if (userParam.printcolumn) {
      tableRow.addCell("","", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("dRE"), "align-left bold", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);

   /* Row 38 */
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

   /* Row 39 */
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

   /* Row 40 */
   tableRow = table.addRow();
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectId("CE3"), "align-left", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("CE3"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CE3"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CE3"), "align-right", 1);
   tableRow.addCell("", "", 1);
   if (userParam.printcolumn) {
      tableRow.addCell("","",1);
   }
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);

   /* Row 41 */
   tableRow = table.addRow();
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectId("CE4"), "align-left", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("CE4"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CE4"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CE4"), "align-right", 1);
   tableRow.addCell("", "", 1);
   if (userParam.printcolumn) {
      tableRow.addCell("","", 1);
   }
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);

   /* Row 42 */
   tableRow = table.addRow();
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectId("CE7"), "align-left", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("CE7"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CE7"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CE7"), "align-right", 1);
   tableRow.addCell("", "", 1);
   if (userParam.printcolumn) {
      tableRow.addCell("","", 1);
   }
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);

   /* Row 43, tot */
   tableRow = table.addRow();
   if (userParam.printcolumn) {
      tableRow.addCell("","", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("CE"), "align-right", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CE"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CE"), "align-right", 1);
   tableRow.addCell("", "", 1);
   if (userParam.printcolumn) {
      tableRow.addCell("","", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("RE"), "align-right", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RE"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RE"), "align-right", 1);

   /* Row 44 */
   tableRow = table.addRow();
   if (userParam.printcolumn) {
      tableRow.addCell("","", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("C"), "align-right bold", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("C"), "align-right bold", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("C"), "align-right bold", 1);
   tableRow.addCell("", "", 1);
   if (userParam.printcolumn) {
      tableRow.addCell("","", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("R"), "align-right bold", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("R"), "align-right bold", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("R"), "align-right bold", 1);

   /* Row 45 */
   tableRow = table.addRow();
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectDescription("TADPI"), "align-right", 7);
   } else {
      tableRow.addCell(bReport.getObjectDescription("TADPI"), "align-right", 5);
   }
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("TADPI"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("TADPI"), "align-right", 1);

   /* Row 46 */
   tableRow = table.addRow();
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectId("IM"), "align-left", 1);
      tableRow.addCell(bReport.getObjectDescription("IM"), "align-right", 6);
   } else {
      tableRow.addCell(bReport.getObjectDescription("IM"), "align-right", 5);
   }
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("IM"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("IM"), "align-right", 1);

   /* Row 47 */
   tableRow = table.addRow();
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectDescription("TADES"), "align-right", 7);
   } else {
      tableRow.addCell(bReport.getObjectDescription("TADES"), "align-right", 5);
   }
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("TADES"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("TADES"), "align-right", 1);

   return report;
}

function printReport_Rendiconto_Investimenti_Disinvestimenti(report, banDoc, userParam, bReport) {

   // SEZIONE "Uscite da investimenti / Entrate da disinvestimenti"
   
   /**
    *  Nella contabilità doppia le registrazioni di disinvestimenti (entrate) vanno con il segno -, 
    *  mentre gli investimenti (uscite) con il segno +.
    *  Questo perché vengono trattati come ricavi e costi: le entrate sono con il segno - e le uscite con il segno +.
    *
    *  Nella contabilità entrate/uscite le registrazioni di disinvestimenti (entrate) vanno con il segno +,
    *  mentre gli investimenti con il segno -.
    *  Questo perché vengono trattati come entrate e uscite: nella contabilità le entrate sono con il segno +
    *  e le uscite con il segno -.
    */

   var dateCurrent = '';
   var datePrevious = '';

   var isColumnBalance = findBalanceColumns(banDoc);
   if (isColumnBalance) {
      //"Balance_2020", "Balance_2021"
      dateCurrent = "31.12." + userParam.currentbalancecolumn.slice(8, 12); 
      datePrevious = "31.12." + userParam.previousbalancecolumn.slice(8, 12);
   } 
   else {
      dateCurrent = Banana.Converter.toLocaleDateFormat(userParam.selectionEndDate);
      
      //Calculate date previous: start period - 1 day
      datePrevious = Banana.Converter.toDate(userParam.selectionStartDate);
      datePrevious.setDate(datePrevious.getDate() - 1);
      datePrevious = Banana.Converter.toLocaleDateFormat(datePrevious);
   }

   if (userParam.insertpagebreak) {
      report.addPageBreak();
   } else {
      report.addParagraph(" ", "");
   }

   var table = report.addTable("table");
   if (userParam.printcolumn) {
      var column0 = table.addColumn("column00");
      var column1 = table.addColumn("column01");
      var column2 = table.addColumn("column02");
      var column3 = table.addColumn("column03");
      var column4 = table.addColumn("column04");
      var column5 = table.addColumn("column05");
      var column6 = table.addColumn("column06");
      var column7 = table.addColumn("column07");
      var column8 = table.addColumn("column08");
   }
   else {
      var column1 = table.addColumn("column1");
      var column2 = table.addColumn("column2");
      var column3 = table.addColumn("column3");
      var column4 = table.addColumn("column4");
      var column5 = table.addColumn("column5");
      var column6 = table.addColumn("column6");
      var column7 = table.addColumn("column7");
   }

   tableRow = table.addRow();
   if (userParam.printcolumn) {
      tableRow.addCell(userParam.column.toUpperCase(),"table-header", 1);
   }
   tableRow.addCell("Uscite da investimenti in immobilizzazioni o da deflussi di capitale di terzi", "table-header", 1);
   tableRow.addCell(dateCurrent, "table-header align-center", 1);
   tableRow.addCell(datePrevious, "table-header align-center", 1);
   tableRow.addCell("", "", 1);
   if (userParam.printcolumn) {
      tableRow.addCell(userParam.column.toUpperCase(),"table-header", 1);
   }
   tableRow.addCell("Entrate da disinvestimenti in immobilizzazioni o da flussi di capitale di terzi", "table-header", 1);
   tableRow.addCell(dateCurrent, "table-header align-center", 1);
   tableRow.addCell(datePrevious, "table-header align-center", 1);

   /* Row 1 */
   tableRow = table.addRow();
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectId("CF1"), "align-left", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("CF1"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CF1"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CF1"), "align-right", 1);
   tableRow.addCell("", "", 1);
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectId("RF1"), "align-left", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("RF1"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RF1"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RF1"), "align-right", 1);

   /* Row 2 */
   tableRow = table.addRow();
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectId("CF2"), "align-left", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("CF2"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CF2"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CF2"), "align-right", 1);
   tableRow.addCell("", "", 1);
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectId("RF2"), "align-left", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("RF2"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RF2"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RF2"), "align-right", 1);

   /* Row 3 */
   tableRow = table.addRow();
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectId("CF3"), "align-left", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("CF3"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CF3"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CF3"), "align-right", 1);
   tableRow.addCell("", "", 1);
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectId("RF3"), "align-left", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("RF3"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RF3"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RF3"), "align-right", 1);

   /* Row 4 */
   tableRow = table.addRow();
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectId("CF4"), "align-left", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("CF4"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CF4"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CF4"), "align-right", 1);
   tableRow.addCell("", "", 1);
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectId("RF4"), "align-left", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("RF4"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RF4"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RF4"), "align-right", 1);

   /* Row 5, tot */
   tableRow = table.addRow();
   if (userParam.printcolumn) {
      tableRow.addCell("","", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("CF"), "align-right", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CF"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CF"), "align-right", 1);
   tableRow.addCell("", "", 1);
   if (userParam.printcolumn) {
      tableRow.addCell("","", 1);
   }
   tableRow.addCell(bReport.getObjectDescription("RF"), "align-right", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RF"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RF"), "align-right", 1);
   
   /* Row 6 */
   tableRow = table.addRow();
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectId("IMRC"), "align-left", 1);
      tableRow.addCell(bReport.getObjectDescription("IMRC"), "align-right", 6);
   } else {
      tableRow.addCell(bReport.getObjectDescription("IMRC"), "align-right", 5);
   }
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("IMRC"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("IMRC"), "align-right", 1);

   /* Row 7 */
   tableRow = table.addRow();
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectDescription("RF-CF"), "align-right", 7);
   } else {
      tableRow.addCell(bReport.getObjectDescription("RF-CF"), "align-right", 5);
   }
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RF-CF"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RF-CF"), "align-right", 1);

   return report;
}

function printReport_Rendiconto_Avanzo_Disavanzo(report, banDoc, userParam, bReport) {

   // SEZIONE "AVANZO E DISAVANZO"

   var dateCurrent = '';
   var datePrevious = '';

   var isColumnBalance = findBalanceColumns(banDoc);
   if (isColumnBalance) {
      //"Balance_2020", "Balance_2021"
      dateCurrent = "31.12." + userParam.currentbalancecolumn.slice(8, 12); 
      datePrevious = "31.12." + userParam.previousbalancecolumn.slice(8, 12);
   } 
   else {
      dateCurrent = Banana.Converter.toLocaleDateFormat(userParam.selectionEndDate);
      
      //Calculate date previous: start period - 1 day
      datePrevious = Banana.Converter.toDate(userParam.selectionStartDate);
      datePrevious.setDate(datePrevious.getDate() - 1);
      datePrevious = Banana.Converter.toLocaleDateFormat(datePrevious);
   }

   report.addParagraph(" ", "");

   var table = report.addTable("table");
   if (userParam.printcolumn) {
      var column0 = table.addColumn("column00");
      var column1 = table.addColumn("column01");
      var column2 = table.addColumn("column02");
      var column3 = table.addColumn("column03");
      var column4 = table.addColumn("column04");
      var column5 = table.addColumn("column05");
      var column6 = table.addColumn("column06");
      var column7 = table.addColumn("column07");
      var column8 = table.addColumn("column08");
   }
   else {
      var column1 = table.addColumn("column1");
      var column2 = table.addColumn("column2");
      var column3 = table.addColumn("column3");
      var column4 = table.addColumn("column4");
      var column5 = table.addColumn("column5");
      var column6 = table.addColumn("column6");
      var column7 = table.addColumn("column7");
   }
   
   tableRow = table.addRow();
   if (userParam.printcolumn) {
      tableRow.addCell("", "table-header", 7);
   } else {
      tableRow.addCell("", "table-header", 5);
   }
   tableRow.addCell(dateCurrent, "table-header align-center", 1);
   tableRow.addCell(datePrevious, "table-header align-center", 1);

   /* Row 1 */
   tableRow = table.addRow();
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectDescription("TADES"), "align-right", 7);
   } else {
      tableRow.addCell(bReport.getObjectDescription("TADES"), "align-right", 5);
   }
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("TADES"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("TADES"), "align-right", 1);

   /* Row 2 */
   tableRow = table.addRow();
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectDescription("RF-CF"), "align-right", 7);
   } else {
      tableRow.addCell(bReport.getObjectDescription("RF-CF"), "align-right", 5);
   }
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RF-CF"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RF-CF"), "align-right", 1);

   /* Row 3 */
   tableRow = table.addRow();
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectDescription("TADRC"), "align-right", 7);
   } else {
      tableRow.addCell(bReport.getObjectDescription("TADRC"), "align-right", 5);
   }
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("TADRC"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("TADRC"), "align-right", 1);

   return report;
}

function printReport_Rendiconto_Cassa_Banca(report, banDoc, userParam, bReport) {

   // SEZIONE "CASSA E BANCA"

   var dateCurrent = '';
   var datePrevious = '';

   var isColumnBalance = findBalanceColumns(banDoc);
   if (isColumnBalance) {
      //"Balance_2020", "Balance_2021"
      dateCurrent = "31.12." + userParam.currentbalancecolumn.slice(8, 12); 
      datePrevious = "31.12." + userParam.previousbalancecolumn.slice(8, 12);
   } 
   else {
      dateCurrent = Banana.Converter.toLocaleDateFormat(userParam.selectionEndDate);
      
      //Calculate date previous: start period - 1 day
      datePrevious = Banana.Converter.toDate(userParam.selectionStartDate);
      datePrevious.setDate(datePrevious.getDate() - 1);
      datePrevious = Banana.Converter.toLocaleDateFormat(datePrevious);
   }

   report.addParagraph(" ", "");

   var table = report.addTable("table");
   if (userParam.printcolumn) {
      var column0 = table.addColumn("column00");
      var column1 = table.addColumn("column01");
      var column2 = table.addColumn("column02");
      var column3 = table.addColumn("column03");
      var column4 = table.addColumn("column04");
      var column5 = table.addColumn("column05");
      var column6 = table.addColumn("column06");
      var column7 = table.addColumn("column07");
      var column8 = table.addColumn("column08");
   }
   else {
      var column1 = table.addColumn("column1");
      var column2 = table.addColumn("column2");
      var column3 = table.addColumn("column3");
      var column4 = table.addColumn("column4");
      var column5 = table.addColumn("column5");
      var column6 = table.addColumn("column6");
      var column7 = table.addColumn("column7");
   }

   tableRow = table.addRow();
   if (userParam.printcolumn) {
      tableRow.addCell(userParam.column.toUpperCase(), "table-header", 1);
      tableRow.addCell("Cassa e banca", "table-header", 6);
   } else {
      tableRow.addCell("Cassa e banca", "table-header", 5);
   }
   tableRow.addCell(dateCurrent, "table-header align-center", 1);
   tableRow.addCell(datePrevious, "table-header align-center", 1);

   /* Row 1 */
   tableRow = table.addRow();
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectId("ACIV3"), "align-left", 1);
      tableRow.addCell(bReport.getObjectDescription("ACIV3"), "align-left", 6);
   } else {
      tableRow.addCell(bReport.getObjectDescription("ACIV3"), "align-left", 5);
   }
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("ACIV3"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("ACIV3"), "align-right", 1);

   /* Row 2 */
   tableRow = table.addRow();
   if (userParam.printcolumn) {
      tableRow.addCell(bReport.getObjectId("ACIV1"), "align-left", 1);
      tableRow.addCell(bReport.getObjectDescription("ACIV1"), "align-left", 6);
   } else {
      tableRow.addCell(bReport.getObjectDescription("ACIV1"), "align-left", 5);
   }
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("ACIV1"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("ACIV1"), "align-right", 1);

   return report;
}

function printReport_Rendiconto_Figurativi(report, banDoc, userParam, bReport) {

   // SEZIONE "COSTI E PROVENTI FIGURATIVI"

   var dateCurrent = '';
   var datePrevious = '';

   var isColumnBalance = findBalanceColumns(banDoc);
   if (isColumnBalance) {
      //"Balance_2020", "Balance_2021"
      dateCurrent = "31.12." + userParam.currentbalancecolumn.slice(8, 12); 
      datePrevious = "31.12." + userParam.previousbalancecolumn.slice(8, 12);
   } 
   else {
      dateCurrent = Banana.Converter.toLocaleDateFormat(userParam.selectionEndDate);
      
      //Calculate date previous: start period - 1 day
      datePrevious = Banana.Converter.toDate(userParam.selectionStartDate);
      datePrevious.setDate(datePrevious.getDate() - 1);
      datePrevious = Banana.Converter.toLocaleDateFormat(datePrevious);
   }

   if (userParam.printcostifigurativi) {

      report.addParagraph(" ", "");

      var table = report.addTable("table");
      if (userParam.printcolumn) {
         var column0 = table.addColumn("column00");
         var column1 = table.addColumn("column01");
         var column2 = table.addColumn("column02");
         var column3 = table.addColumn("column03");
         var column4 = table.addColumn("column04");
         var column5 = table.addColumn("column05");
         var column6 = table.addColumn("column06");
         var column7 = table.addColumn("column07");
         var column8 = table.addColumn("column08");
      }
      else {
         var column1 = table.addColumn("column1");
         var column2 = table.addColumn("column2");
         var column3 = table.addColumn("column3");
         var column4 = table.addColumn("column4");
         var column5 = table.addColumn("column5");
         var column6 = table.addColumn("column6");
         var column7 = table.addColumn("column7");
      }

      tableRow = table.addRow();
      if (userParam.printcolumn) {
         tableRow.addCell(userParam.column.toUpperCase(), "table-header", 1);
      }
      tableRow.addCell("Costi figurativi", "table-header", 1);
      tableRow.addCell(dateCurrent, "table-header align-center", 1);
      tableRow.addCell(datePrevious, "table-header align-center", 1);
      tableRow.addCell("", "", 1);
      if (userParam.printcolumn) {
         tableRow.addCell(userParam.column.toUpperCase(), "table-header", 1);
      }
      tableRow.addCell("Proventi figurativi", "table-header", 1);
      tableRow.addCell(dateCurrent, "table-header align-center", 1);
      tableRow.addCell(datePrevious, "table-header align-center", 1);

      /* Row 1 */
      tableRow = table.addRow();
      if (userParam.printcolumn) {
         tableRow.addCell(bReport.getObjectId("CG1"), "align-left", 1);
      }
      tableRow.addCell(bReport.getObjectDescription("CG1"), "align-left", 1);
      tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CG1"), "align-right", 1);
      tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CG1"), "align-right", 1);
      tableRow.addCell("", "", 1);
      if (userParam.printcolumn) {
         tableRow.addCell(bReport.getObjectId("RG1"), "align-left", 1);
      }
      tableRow.addCell(bReport.getObjectDescription("RG1"), "align-left", 1);
      tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RG1"), "align-right", 1);
      tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RG1"), "align-right", 1);

      /* Row 2 */
      tableRow = table.addRow();
      if (userParam.printcolumn) {
         tableRow.addCell(bReport.getObjectId("CG2"), "align-left", 1);
      }
      tableRow.addCell(bReport.getObjectDescription("CG2"), "align-left", 1);
      tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CG2"), "align-right", 1);
      tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CG2"), "align-right", 1);
      tableRow.addCell("", "", 1);
      if (userParam.printcolumn) {
         tableRow.addCell(bReport.getObjectId("RG2"), "align-left", 1);
      }
      tableRow.addCell(bReport.getObjectDescription("RG2"), "align-left", 1);
      tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RG2"), "align-right", 1);
      tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RG2"), "align-right", 1);

      /* Row 3, tot */
      tableRow = table.addRow();
      if (userParam.printcolumn) {
         tableRow.addCell("","", 1);
      }
      tableRow.addCell(bReport.getObjectDescription("CG"), "align-right", 1);
      tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CG"), "align-right", 1);
      tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CG"), "align-right", 1);
      tableRow.addCell("", "", 1);
      if (userParam.printcolumn) {
         tableRow.addCell("","", 1);
      }
      tableRow.addCell(bReport.getObjectDescription("RG"), "align-right", 1);
      tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RG"), "align-right", 1);
      tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RG"), "align-right", 1);
   }

   return report;
}

function printReport_Note_Finali(report, userParam) {
   if (userParam.finalnotes) {
      report.addParagraph(" ", "");
      report.addParagraph(userParam.finalnotes, "text-notes");
   }
}

/**************************************************************************************
 * Functionalities
 **************************************************************************************/
function findBalanceColumns(banDoc) {

   var accTable = banDoc.table("Accounts");
   var tAccColumnNames = accTable.columnNames;
   var strAccColumnNames = tAccColumnNames.toString();

   if (banDoc.table("Categories")) {

      var catTable = banDoc.table("Categories");
      var tCatColumnNames = catTable.columnNames;
      var strCatColumnNames = tCatColumnNames.toString();

      if (strAccColumnNames.indexOf("Balance_") >= 0 && strCatColumnNames.indexOf("Balance_") >= 0) {
         return true;
      }
   }
   else {
      if (strAccColumnNames.indexOf("Balance_") >= 0) {
         return true;
      }
   }

   return false;
}

function formatValue(value) {
   if (!value || value === "0" || value == null) {
      value = "0";
   }
   return Banana.Converter.toLocaleNumberFormat(value);
}

function checkLiquidity(report, banDoc, bReport) {
   /**
    * previous(ACIV1 + ACIV3) + current(Avanzo/Disavanzo complessivo) == current(ACIV1 + ACIV3)
    */

   var preACIV1 = bReport.getObjectValue("ACIV1", "previousAmount"); // saldo precedente banca/posta
   var preACIV3 = bReport.getObjectValue("ACIV3", "previousAmount"); // saldo precedente cassa
   var curTADRC = bReport.getObjectValue("TADRC", "currentAmount"); // saldo corrente avanzo/disavanzo complessivo
   var curACIV1 = bReport.getObjectValue("ACIV1", "currentAmount"); // saldo corrente banca/posta
   var curACIV3 = bReport.getObjectValue("ACIV3", "currentAmount"); // saldo corrente cassa
   
   var totLiqPrec = Banana.SDecimal.add(preACIV1,preACIV3);
   var totLiqPrecAvanzo = Banana.SDecimal.add(totLiqPrec,curTADRC);
   var totLiqCurr = Banana.SDecimal.add(curACIV1,curACIV3);

   // Banana.console.log("ACIV1 precedente: " + preACIV1);
   // Banana.console.log("ACIV3 precedente: " + preACIV3);
   // Banana.console.log("->tot liquidità precedente: " + totLiqPrec);
   // Banana.console.log("TADRC corrente: " + curTADRC);
   // Banana.console.log("->tot liquidità precedente + TADRC corrente: " + totLiqPrecAvanzo);
   // Banana.console.log("ACIV1 corrente: " + curACIV1);
   // Banana.console.log("ACIV3 corrente: " + curACIV3);
   // Banana.console.log("->tot liquidità corrente: " + totLiqCurr);
   // Banana.console.log(">>>> " + totLiqPrecAvanzo + " ?= " + totLiqCurr);

   if (Banana.SDecimal.compare(totLiqPrecAvanzo,totLiqCurr) != 0) {
      report.addParagraph(" ", "");
      report.addParagraph("Somma tra 'Avanzo/Disavanzo complessivo e liquidità anno precedente' <" + formatValue(totLiqPrecAvanzo) + "> non corrisponde alla 'somma della liquidità anno corrente' <"+ formatValue(totLiqCurr) +">", "text-color-red");
   
      banDoc.addMessage("Somma tra 'Avanzo/Disavanzo complessivo e liquidità anno precedente' <" + formatValue(totLiqPrecAvanzo) + "> non corrisponde alla 'somma della liquidità anno corrente' <"+ formatValue(totLiqCurr) +">");
   }
}

function addFooter(report) {
   report.getFooter().addClass("footer");
   report.getFooter().addText("- ", "");
   report.getFooter().addFieldPageNr();
   report.getFooter().addText(" -", "");
}


/**************************************************************************************
 * Styles
 **************************************************************************************/
function setCss(banDoc, repStyleObj, variables, userParam) {
   var textCSS = "";
   var file = Banana.IO.getLocalFile("file:script/rendicontoModD.css");
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
   currentParam.title = 'Dettagli rendiconto cassa';
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
   currentParam.name = 'insertpagebreak';
   currentParam.parentObject = 'report_group';
   currentParam.title = 'Inserisci fine pagina prima di investimenti/disinvestimenti';
   currentParam.type = 'bool';
   currentParam.value = userParam.insertpagebreak ? true : false;
   currentParam.defaultvalue = false;
   currentParam.readValue = function() {
    userParam.insertpagebreak = this.value;
   }
   convertedParam.data.push(currentParam);

   var currentParam = {};
   currentParam.name = 'printcostifigurativi';
   currentParam.parentObject = 'report_group';
   currentParam.title = 'Stampa sezione costi e proventi figurativi';
   currentParam.type = 'bool';
   currentParam.value = userParam.printcostifigurativi ? true : false;
   currentParam.defaultvalue = false;
   currentParam.readValue = function() {
      userParam.printcostifigurativi = this.value;
   }
   convertedParam.data.push(currentParam);

   // Show custom balance columns parameters only when in Accounts/Categories tables there are 'Balance_YYYY' columns.
   // If not, the parameters are not visible
   var isColumnBalance = findBalanceColumns(Banana.document);
   if (isColumnBalance) {

      var currentParam = {};
      currentParam.name = 'balancecolumns';
      currentParam.title = 'Usa colonne importi inserimento manuale';
      currentParam.type = 'bool';
      currentParam.value = userParam.balancecolumns ? true : false;
      currentParam.editable = false;
      currentParam.readValue = function() {
         userParam.balancecolumns = this.value;
      }
      convertedParam.data.push(currentParam);

      var currentParam = {};
      currentParam.name = 'currentbalancecolumn';
      currentParam.parentObject = 'balancecolumns';
      currentParam.title = 'Colonna anno corrente (nome XML colonna)';
      currentParam.type = 'string';
      currentParam.value = userParam.currentbalancecolumn ? userParam.currentbalancecolumn : '';
      currentParam.defaultvalue = '';
      currentParam.readValue = function() {
        userParam.currentbalancecolumn = this.value;
      }
      convertedParam.data.push(currentParam);

      var currentParam = {};
      currentParam.name = 'previousbalancecolumn';
      currentParam.parentObject = 'balancecolumns';
      currentParam.title = 'Colonna anno precedente (nome XML colonna)';
      currentParam.type = 'string';
      currentParam.value = userParam.previousbalancecolumn ? userParam.previousbalancecolumn : '';
      currentParam.defaultvalue = '';
      currentParam.readValue = function() {
        userParam.previousbalancecolumn = this.value;
      }
      convertedParam.data.push(currentParam);
   }
   else {
      //reset to false in case the parmeter is not visible to avoid custom columns are still used
      userParam.balancecolumns = false;
   }

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

   var currentParam = {};
   currentParam.name = 'styles';
   currentParam.title = 'Stili';
   currentParam.type = 'string';
   currentParam.value = '';
   currentParam.editable = false;
   currentParam.readValue = function() {
    userParam.param_styles = this.value;
   }
   convertedParam.data.push(currentParam);

   var currentParam = {};
   currentParam.name = 'colorheadertable';
   currentParam.parentObject = 'styles';
   currentParam.title = 'Colore intestazioni tabelle';
   currentParam.type = 'string';
   currentParam.value = userParam.colorheadertable ? userParam.colorheadertable : '#337ab7';
   currentParam.defaultvalue = '#337ab7';
   currentParam.readValue = function() {
   userParam.colorheadertable = this.value;
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
   userParam.printcostifigurativi = false;
   userParam.balancecolumns = false;
   userParam.currentbalancecolumn = '';
   userParam.previousbalancecolumn = '';
   userParam.insertpagebreak = '';
   userParam.finalnotes = '';
   userParam.colorheadertable = '#337ab7';
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

   // Ask for period only when user wants to use default banana balances.
   // When using specific columns for balances the period is not asked.
   if (!userParam.balancecolumns) {

      //We take the accounting "starting date" and "ending date" from the document. These will be used as default dates
      var docStartDate = Banana.document.startPeriod();
      var docEndDate = Banana.document.endPeriod();

      //A dialog window is opened asking the user to insert the desired period. By default is the accounting period
      var selectedDates = Banana.Ui.getPeriod('', docStartDate, docEndDate, userParam.selectionStartDate, userParam.selectionEndDate, userParam.selectionChecked);

      //We take the values entered by the user and save them as "new default" values.
      //This because the next time the script will be executed, the dialog window will contains the new values.
      if (selectedDates) {
         userParam.selectionStartDate = selectedDates.startDate;
         userParam.selectionEndDate = selectedDates.endDate;
         userParam.selectionChecked = selectedDates.hasSelection;
      } else {
         //User clicked cancel
         return null;
      }
   }
   // Otherwise take the year from the column names (ex. "Balance_2021") and build the period
   else {
      userParam.selectionStartDate = userParam.currentbalancecolumn.substr(-4)+"-01-01";
      userParam.selectionEndDate = userParam.previousbalancecolumn.substr(-4)+"12-31";
   }

   return userParam;
}

function settingsDialog() {
   var userParam = initUserParam();
   var savedParam = Banana.document.getScriptSettings();
   if (savedParam && savedParam.length > 0) {
      userParam = JSON.parse(savedParam);
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
      // var fileTypeGroup = Banana.document.info("Base", "FileTypeGroup");
      // var fileTypeNumber = Banana.document.info("Base", "FileTypeNumber");
      // if (fileTypeGroup === "130" && fileTypeNumber === "100") { //cash manager free
      //    return true;
      // }
      if (Banana.application.license) {
         if (Banana.application.license.licenseType === "professional" || Banana.application.license.licenseType === "advanced") {
            return true;
         }
         else {
            Banana.application.showMessages();
            Banana.document.addMessage(getErrorMessage(ID_ERR_LICENZA_PROFESSIONAL));           
            return false;
         }
      }
   }
}

