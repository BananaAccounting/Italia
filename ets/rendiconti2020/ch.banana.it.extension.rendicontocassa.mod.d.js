// Copyright [2020] [Banana.ch SA - Lugano Switzerland]
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
// @pubdate = 2020-10-23
// @publisher = Banana.ch SA
// @description = 3. Rendiconto per cassa (MOD. D)
// @task = app.command
// @doctype = 100.100;110.100;130.100
// @docproperties = 
// @outputformat = none
// @inputdatasource = none
// @timeout = -1
// @includejs = datastructure.js
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
    * 1. Loads the data structure
    */
   var dataStructure = loadDataStructure("REPORT_TYPE_MOD_D");

   /**
    * 2. Calls methods to load balances, calculate totals, format amounts
    * and check entries that can be excluded
    */
   const bReport = new BReport(Banana.document, userParam, dataStructure);
   bReport.validateGroups(userParam.column);
   bReport.loadBalances();
   bReport.calculateTotals(["currentAmount", "previousAmount"]);
   bReport.formatValues(["currentAmount", "previousAmount"]);
   //Banana.console.log(JSON.stringify(dataStructure, "", " "));

   /**
    * 3. Creates the report
    */
   var stylesheet = Banana.Report.newStyleSheet();
   var report = printRendicontoModD(Banana.document, userParam, bReport, stylesheet);
   setCss(Banana.document, stylesheet, userParam);
   Banana.Report.preview(report, stylesheet);
}

function printRendicontoModD(banDoc, userParam, bReport, stylesheet) {

   var report = Banana.Report.newReport("Rendiconto per cassa (MOD. D)");
   var startDate = userParam.selectionStartDate;
   var endDate = userParam.selectionEndDate;
   var currentYear = Banana.Converter.toDate(banDoc.info("AccountingDataBase", "OpeningDate")).getFullYear();
   var previousYear = currentYear - 1;

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

   var title = "";
   if (userParam.title) {
      title = userParam.title;
   } else {
      title = banDoc.info("Base", "HeaderLeft") + " - " + "RENDICONTO PER CASSA (MOD. D) ANNO " + currentYear;
   }
 
   if (userParam.printtitle) {
      report.addParagraph(" ", "");
      report.addParagraph(title, "heading2");
      report.addParagraph(" ", "");
   }

   var table = report.addTable("table");
   var column1 = table.addColumn("column1");
   var column2 = table.addColumn("column2");
   var column3 = table.addColumn("column3");
   var column4 = table.addColumn("column4");
   var column5 = table.addColumn("column5");
   var column6 = table.addColumn("column6");
   var column7 = table.addColumn("column7");
   
   /**************************************************************************************
   * COSTI E PROVENTI
   **************************************************************************************/
   tableRow = table.addRow();
   tableRow.addCell("USCITE", "table-header", 1);
   tableRow.addCell(Banana.Converter.toLocaleDateFormat(endDate), "table-header align-right", 1);
   tableRow.addCell("31.12." + previousYear, "table-header align-right", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("ENTRATE", "table-header", 1);
   tableRow.addCell(Banana.Converter.toLocaleDateFormat(endDate), "table-header align-right", 1);
   tableRow.addCell("31.12." + previousYear, "table-header align-right", 1);

   /* Row 1 */   
   tableRow = table.addRow();
   tableRow.addCell(bReport.getObjectDescription("dCA"), "align-left bold", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell(bReport.getObjectDescription("dRA"), "align-left bold", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);

   /* Row 2*/
   tableRow = table.addRow();
   tableRow.addCell(bReport.getObjectDescription("CA1"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CA1"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CA1"), "align-right", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell(bReport.getObjectDescription("RA1"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RA1"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RA1"), "align-right", 1);

   /* Row 3 */
   tableRow = table.addRow();
   tableRow.addCell(bReport.getObjectDescription("CA2"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CA2"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CA2"), "align-right", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell(bReport.getObjectDescription("RA2"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RA2"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RA2"), "align-right", 1);

   /* Row 4 */
   tableRow = table.addRow();
   tableRow.addCell(bReport.getObjectDescription("CA3"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CA3"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CA3"), "align-right", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell(bReport.getObjectDescription("RA3"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RA3"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RA3"), "align-right", 1);

   /* Row 5 */
   tableRow = table.addRow();
   tableRow.addCell(bReport.getObjectDescription("CA4"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CA4"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CA4"), "align-right", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell(bReport.getObjectDescription("RA4"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RA4"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RA4"), "align-right", 1);

   /* Row 6 */
   tableRow = table.addRow();
   tableRow.addCell(bReport.getObjectDescription("CA7"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CA7"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CA7"), "align-right", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell(bReport.getObjectDescription("RA5"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RA5"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RA5"), "align-right", 1);

   /* Row 7 */
   tableRow = table.addRow();
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell(bReport.getObjectDescription("RA6"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RA6"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RA6"), "align-right", 1);

   /* Row 8 */
   tableRow = table.addRow();
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell(bReport.getObjectDescription("RA7"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RA7"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RA7"), "align-right", 1);

   /* Row 9 */
   tableRow = table.addRow();
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell(bReport.getObjectDescription("RA8"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RA8"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RA8"), "align-right", 1);

   /* Row 10 */
   tableRow = table.addRow();
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell(bReport.getObjectDescription("RA9"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RA9"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RA9"), "align-right", 1);

   /* Row 11 */
   tableRow = table.addRow();
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell(bReport.getObjectDescription("RA10"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RA10"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RA10"), "align-right", 1);

   /* Row 12, tot */
   tableRow = table.addRow();
   tableRow.addCell(bReport.getObjectDescription("CA"), "align-right", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CA"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CA"), "align-right", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell(bReport.getObjectDescription("RA"), "align-right", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RA"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RA"), "align-right", 1);

   /* Row 13 */
   tableRow = table.addRow();
   tableRow.addCell(bReport.getObjectDescription("RA-CA"), "align-right", 5);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RA-CA"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RA-CA"), "align-right", 1);

   /* Row 14 */
   tableRow = table.addRow();
   tableRow.addCell(bReport.getObjectDescription("dCB"), "align-left bold", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell(bReport.getObjectDescription("dRB"), "align-left bold", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);

   /* Row 15 */
   tableRow = table.addRow();
   tableRow.addCell(bReport.getObjectDescription("CB1"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CB1"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CB1"), "align-right", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell(bReport.getObjectDescription("RB1"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RB1"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RB1"), "align-right", 1);

   /* Row 16 */
   tableRow = table.addRow();
   tableRow.addCell(bReport.getObjectDescription("CB2"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CB2"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CB2"), "align-right", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell(bReport.getObjectDescription("RB2"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RB2"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RB2"), "align-right", 1);

   /* Row 17 */
   tableRow = table.addRow();
   tableRow.addCell(bReport.getObjectDescription("CB3"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CB3"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CB3"), "align-right", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell(bReport.getObjectDescription("RB3"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RB3"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RB3"), "align-right", 1);

   /* Row 18 */
   tableRow = table.addRow();
   tableRow.addCell(bReport.getObjectDescription("CB4"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CB4"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CB4"), "align-right", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell(bReport.getObjectDescription("RB4"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RB4"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RB4"), "align-right", 1);

   /* Row 19 */
   tableRow = table.addRow();
   tableRow.addCell(bReport.getObjectDescription("CB7"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CB7"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CB7"), "align-right", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell(bReport.getObjectDescription("RB5"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RB5"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RB5"), "align-right", 1);

   /* Row 20 */
   tableRow = table.addRow();
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell(bReport.getObjectDescription("RB6"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RB6"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RB6"), "align-right", 1);

   /* Row 21, tot */
   tableRow = table.addRow();
   tableRow.addCell(bReport.getObjectDescription("CB"), "align-right", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CB"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CB"), "align-right", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell(bReport.getObjectDescription("RB"), "align-right", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RB"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RB"), "align-right", 1);

   /* Row 22 */
   tableRow = table.addRow();
   tableRow.addCell(bReport.getObjectDescription("RB-CB"), "align-right", 5);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RB-CB"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RB-CB"), "align-right", 1);

   /* Row 23 */
   tableRow = table.addRow();
   tableRow.addCell(bReport.getObjectDescription("dCC"), "align-left bold", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell(bReport.getObjectDescription("dRC"), "align-left bold", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);

   /* Row 24 */
   tableRow = table.addRow();
   tableRow.addCell(bReport.getObjectDescription("CC1"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CC1"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CC1"), "align-right", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell(bReport.getObjectDescription("RC1"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RC1"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RC1"), "align-right", 1);

   /* Row 25 */
   tableRow = table.addRow();
   tableRow.addCell(bReport.getObjectDescription("CC2"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CC2"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CC2"), "align-right", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell(bReport.getObjectDescription("RC2"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RC2"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RC2"), "align-right", 1);

   /* Row 26 */
   tableRow = table.addRow();
   tableRow.addCell(bReport.getObjectDescription("CC3"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CC3"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CC3"), "align-right", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell(bReport.getObjectDescription("RC3"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RC3"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RC3"), "align-right", 1);

   /* Row 27, tot */
   tableRow = table.addRow();
   tableRow.addCell(bReport.getObjectDescription("CC"), "align-right", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CC"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CC"), "align-right", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell(bReport.getObjectDescription("RC"), "align-right", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RC"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RC"), "align-right", 1);

   /* Row 28 */
   tableRow = table.addRow();
   tableRow.addCell(bReport.getObjectDescription("RC-CC"), "align-right", 5);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RC-CC"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RC-CC"), "align-right", 1);

   /* Row 29 */
   tableRow = table.addRow();
   tableRow.addCell(bReport.getObjectDescription("dCD"), "align-left bold", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell(bReport.getObjectDescription("dRD"), "align-left bold", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);

   /* Row 30 */
   tableRow = table.addRow();
   tableRow.addCell(bReport.getObjectDescription("CD1"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CD1"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CD1"), "align-right", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell(bReport.getObjectDescription("RD1"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RD1"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RD1"), "align-right", 1);

   /* Row 31 */
   tableRow = table.addRow();
   tableRow.addCell(bReport.getObjectDescription("CD2"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CD2"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CD2"), "align-right", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell(bReport.getObjectDescription("RD2"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RD2"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RD2"), "align-right", 1);

   /* Row 32 */
   tableRow = table.addRow();
   tableRow.addCell(bReport.getObjectDescription("CD3"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CD3"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CD3"), "align-right", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell(bReport.getObjectDescription("RD3"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RD3"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RD3"), "align-right", 1);

   /* Row 33 */
   tableRow = table.addRow();
   tableRow.addCell(bReport.getObjectDescription("CD4"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CD4"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CD4"), "align-right", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell(bReport.getObjectDescription("RD4"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RD4"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RD4"), "align-right", 1);

   /* Row 34 */
   tableRow = table.addRow();
   tableRow.addCell(bReport.getObjectDescription("CD6"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CD6"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CD6"), "align-right", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell(bReport.getObjectDescription("RD5"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RD5"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RD5"), "align-right", 1);

   /* Row 35, tot */
   tableRow = table.addRow();
   tableRow.addCell(bReport.getObjectDescription("CD"), "align-right", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CD"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CD"), "align-right", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell(bReport.getObjectDescription("RD"), "align-right", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RD"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RD"), "align-right", 1);

   /* Row 36 */
   tableRow = table.addRow();
   tableRow.addCell(bReport.getObjectDescription("RD-CD"), "align-right", 5);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RD-CD"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RD-CD"), "align-right", 1);

   /* Row 37 */
   tableRow = table.addRow();
   tableRow.addCell(bReport.getObjectDescription("dCE"), "align-left bold", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell(bReport.getObjectDescription("dRE"), "align-left bold", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);

   /* Row 38 */
   tableRow = table.addRow();
   tableRow.addCell(bReport.getObjectDescription("CE1"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CE1"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CE1"), "align-right", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell(bReport.getObjectDescription("RE1"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RE1"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RE1"), "align-right", 1);

   /* Row 39 */
   tableRow = table.addRow();
   tableRow.addCell(bReport.getObjectDescription("CE2"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CE2"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CE2"), "align-right", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell(bReport.getObjectDescription("RE2"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RE2"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RE2"), "align-right", 1);

   /* Row 40 */
   tableRow = table.addRow();
   tableRow.addCell(bReport.getObjectDescription("CE3"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CE3"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CE3"), "align-right", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);

   /* Row 41 */
   tableRow = table.addRow();
   tableRow.addCell(bReport.getObjectDescription("CE4"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CE4"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CE4"), "align-right", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);

   /* Row 42 */
   tableRow = table.addRow();
   tableRow.addCell(bReport.getObjectDescription("CE7"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CE7"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CE7"), "align-right", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);

   /* Row 43, tot */
   tableRow = table.addRow();
   tableRow.addCell(bReport.getObjectDescription("CE"), "align-right", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CE"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CE"), "align-right", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell(bReport.getObjectDescription("RE"), "align-right", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RE"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RE"), "align-right", 1);

   /* Row 44 */
   tableRow = table.addRow();
   tableRow.addCell(bReport.getObjectDescription("C"), "align-right bold", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("C"), "align-right bold", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("C"), "align-right bold", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell(bReport.getObjectDescription("R"), "align-right bold", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("R"), "align-right bold", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("R"), "align-right bold", 1);

   /* Row 45 */
   tableRow = table.addRow();
   tableRow.addCell(bReport.getObjectDescription("TADPI"), "align-right", 5);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("TADPI"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("TADPI"), "align-right", 1);

   /* Row 46 */
   tableRow = table.addRow();
   tableRow.addCell(bReport.getObjectDescription("IM"), "align-right", 5);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("IM"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("IM"), "align-right", 1);

   /* Row 47 */
   tableRow = table.addRow();
   tableRow.addCell(bReport.getObjectDescription("TADES"), "align-right", 5);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("TADES"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("TADES"), "align-right", 1);




   /**************************************************************************************
   * Uscite da investimenti / Entrate da disinvestimenti
   **************************************************************************************/

   report.addParagraph(" ", "");

   var table = report.addTable("table");
   var column1 = table.addColumn("column1");
   var column2 = table.addColumn("column2");
   var column3 = table.addColumn("column3");
   var column4 = table.addColumn("column4");
   var column5 = table.addColumn("column5");
   var column6 = table.addColumn("column6");
   var column7 = table.addColumn("column7");

   tableRow = table.addRow();
   tableRow.addCell("Uscite da investimenti in immobilizzazioni o da deflussi di capitale di terzi", "table-header", 1);
   tableRow.addCell(Banana.Converter.toLocaleDateFormat(endDate), "table-header align-center", 1);
   tableRow.addCell("31.12." + previousYear, "table-header align-center", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("Entrate da disinvestimenti in immobilizzazioni o da flussi di capitale di terzi", "table-header", 1);
   tableRow.addCell(Banana.Converter.toLocaleDateFormat(endDate), "table-header align-center", 1);
   tableRow.addCell("31.12." + previousYear, "table-header align-center", 1);

   /* Row 1 */
   tableRow = table.addRow();
   tableRow.addCell(bReport.getObjectDescription("CF1"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CF1"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CF1"), "align-right", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell(bReport.getObjectDescription("RF1"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RF1"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RF1"), "align-right", 1);

   /* Row 2 */
   tableRow = table.addRow();
   tableRow.addCell(bReport.getObjectDescription("CF2"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CF2"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CF2"), "align-right", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell(bReport.getObjectDescription("RF2"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RF2"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RF2"), "align-right", 1);

   /* Row 3 */
   tableRow = table.addRow();
   tableRow.addCell(bReport.getObjectDescription("CF3"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CF3"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CF3"), "align-right", 1);
   tableRow.addCell("", "", 1);
    tableRow.addCell(bReport.getObjectDescription("RF3"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RF3"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RF3"), "align-right", 1);

   /* Row 4 */
   tableRow = table.addRow();
   tableRow.addCell(bReport.getObjectDescription("CF4"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CF4"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CF4"), "align-right", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell(bReport.getObjectDescription("RF4"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RF4"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RF4"), "align-right", 1);

   /* Row 5, tot */
   tableRow = table.addRow();
   tableRow.addCell(bReport.getObjectDescription("CF"), "align-right", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CF"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CF"), "align-right", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell(bReport.getObjectDescription("RF"), "align-right", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RF"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RF"), "align-right", 1);
   
   /* Row 6 */
   tableRow = table.addRow();
   tableRow.addCell(bReport.getObjectDescription("IMRC"), "align-right", 5);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("IMRC"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("IMRC"), "align-right", 1);

   /* Row 7 */
   tableRow = table.addRow();
   tableRow.addCell(bReport.getObjectDescription("RF-CF"), "align-right", 5);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RF-CF"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RF-CF"), "align-right", 1);


   /**************************************************************************************
   * Avanzo/disavanzo
   **************************************************************************************/

   report.addParagraph(" ", "");

   var table = report.addTable("table");
   var column1 = table.addColumn("column1");
   var column2 = table.addColumn("column2");
   var column3 = table.addColumn("column3");
   var column4 = table.addColumn("column4");
   var column5 = table.addColumn("column5");
   var column6 = table.addColumn("column6");
   var column7 = table.addColumn("column7");
   
   tableRow = table.addRow();
   tableRow.addCell("", "table-header", 5);
   tableRow.addCell(Banana.Converter.toLocaleDateFormat(endDate), "table-header align-center", 1);
   tableRow.addCell("31.12." + previousYear, "table-header align-center", 1);

   /* Row 1 */
   tableRow = table.addRow();
   tableRow.addCell(bReport.getObjectDescription("TADES"), "align-right", 5);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("TADES"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("TADES"), "align-right", 1);

   /* Row 2 */
   tableRow = table.addRow();
   tableRow.addCell(bReport.getObjectDescription("RF-CF"), "align-right", 5);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RF-CF"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RF-CF"), "align-right", 1);

   /* Row 3 */
   tableRow = table.addRow();
   tableRow.addCell(bReport.getObjectDescription("TADRC"), "align-right", 5);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("TADRC"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("TADRC"), "align-right", 1);



   /**************************************************************************************
   * Cassa e Banca
   **************************************************************************************/

   report.addParagraph(" ", "");

   var table = report.addTable("table");
   var column1 = table.addColumn("column1");
   var column2 = table.addColumn("column2");
   var column3 = table.addColumn("column3");
   var column4 = table.addColumn("column4");
   var column5 = table.addColumn("column5");
   var column6 = table.addColumn("column6");
   var column7 = table.addColumn("column7");

   tableRow = table.addRow();
   tableRow.addCell("Cassa e banca", "table-header", 5);
   tableRow.addCell(Banana.Converter.toLocaleDateFormat(endDate), "table-header align-center", 1);
   tableRow.addCell("31.12." + previousYear, "table-header align-center", 1);

   /* Row 1 */
   tableRow = table.addRow();
   tableRow.addCell(bReport.getObjectDescription("ACIV3"), "align-left", 5);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("ACIV3"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("ACIV3"), "align-right", 1);

   /* Row 2 */
   tableRow = table.addRow();
   tableRow.addCell(bReport.getObjectDescription("ACIV1"), "align-left", 5);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("ACIV1"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("ACIV1"), "align-right", 1);



   /**************************************************************************************
   * COSTI E PROVENTI FIGURATIVI
   **************************************************************************************/

   report.addParagraph(" ", "");

   var table = report.addTable("table");
   var column1 = table.addColumn("column1");
   var column2 = table.addColumn("column2");
   var column3 = table.addColumn("column3");
   var column4 = table.addColumn("column4");
   var column5 = table.addColumn("column5");
   var column6 = table.addColumn("column6");
   var column7 = table.addColumn("column7");

   tableRow = table.addRow();
   tableRow.addCell("Costi figurativi", "table-header", 1);
   tableRow.addCell(Banana.Converter.toLocaleDateFormat(endDate), "table-header align-center", 1);
   tableRow.addCell("31.12." + previousYear, "table-header align-center", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("Proventi figurativi", "table-header", 1);
   tableRow.addCell(Banana.Converter.toLocaleDateFormat(endDate), "table-header align-center", 1);
   tableRow.addCell("31.12." + previousYear, "table-header align-center", 1);

   /* Row 1 */
   tableRow = table.addRow();
   tableRow.addCell(bReport.getObjectDescription("CG1"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CG1"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CG1"), "align-right", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell(bReport.getObjectDescription("RG1"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RG1"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RG1"), "align-right", 1);

   /* Row 2 */
   tableRow = table.addRow();
   tableRow.addCell(bReport.getObjectDescription("CG2"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CG2"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CG2"), "align-right", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell(bReport.getObjectDescription("RG2"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RG2"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RG2"), "align-right", 1);

   /* Row 3, tot */
   tableRow = table.addRow();
   tableRow.addCell(bReport.getObjectDescription("CG"), "align-right", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CG"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CG"), "align-right", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell(bReport.getObjectDescription("RG"), "align-right", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RG"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RG"), "align-right", 1);



   //checkResults(banDoc, startDate, endDate);


   addFooter(report);
   return report;
}

function formatValue(value) {
   if (!value || value === "0" || value == null) {
      value = "0";
   }
   return Banana.Converter.toLocaleNumberFormat(value);
}

function checkResults(banDoc, startDate, endDate) {

   /* tot A */
   var objA = banDoc.currentBalance("Gr=A", startDate, endDate);
   currentA = objA.balance;

   /* tot P */
   var objP = banDoc.currentBalance("Gr=P", startDate, endDate);
   currentP = objP.balance;

   var res0 = Banana.SDecimal.add(currentA, currentP);
   if (res0 !== "0") {
      Banana.document.addMessage("Differenza Attivo e Passivo.");
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
function setCss(banDoc, repStyleObj, userParam) {
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
   currentParam.name = 'logo';
   currentParam.title = 'Stampa logo intestazione pagina';
   currentParam.type = 'bool';
   currentParam.value = userParam.logo ? true : false;
   currentParam.defaultvalue = false;
   currentParam.readValue = function() {
      userParam.logo = this.value;
   }
   convertedParam.data.push(currentParam);

   var currentParam = {};
   currentParam.name = 'logoname';
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
   currentParam.title = 'Stampa testo intestazione pagina (Proprietà file -> Indirizzo)';
   currentParam.type = 'bool';
   currentParam.value = userParam.printheader ? true : false;
   currentParam.defaultvalue = false;
   currentParam.readValue = function() {
    userParam.printheader = this.value;
   }
   convertedParam.data.push(currentParam);

   currentParam = {};
   currentParam.name = 'printtitle';
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
   currentParam.title = 'Testo titolo (vuoto = testo predefinito)';
   currentParam.type = 'string';
   currentParam.value = userParam.title ? userParam.title : '';
   currentParam.defaultvalue = '';
   currentParam.readValue = function() {
      userParam.title = this.value;
   }
   convertedParam.data.push(currentParam);

   var currentParam = {};
   currentParam.name = 'column';
   currentParam.title = "Colonna raggruppamento (nome XML colonna)";
   currentParam.type = 'string';
   currentParam.value = userParam.column ? userParam.column : 'Gr';
   currentParam.defaultvalue = 'Gr';
   currentParam.readValue = function() {
      userParam.column = this.value;
   }
   convertedParam.data.push(currentParam);

   return convertedParam;
}

function initUserParam() {
   var userParam = {};
   userParam.logo = false;
   userParam.logoname = 'Logo';
   userParam.printheader = false;
   userParam.printtitle = true;
   userParam.title = '';
   userParam.column = 'Gr';
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
      var fileTypeGroup = Banana.document.info("Base", "FileTypeGroup");
      var fileTypeNumber = Banana.document.info("Base", "FileTypeNumber");
      if (fileTypeGroup === "130" && fileTypeNumber === "100") { //cash manager free
         return true;
      }
      else if (Banana.application.license) {
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

