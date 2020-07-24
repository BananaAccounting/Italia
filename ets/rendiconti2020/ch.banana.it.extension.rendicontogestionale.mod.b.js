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
// @id = ch.banana.it.extension.rendicontogestionale.mod.b
// @api = 1.0
// @pubdate = 2020-07-24
// @publisher = Banana.ch SA
// @description = Rendiconto gestionale (MOD. B)
// @task = app.command
// @doctype = 100.100
// @docproperties = 
// @outputformat = none
// @inputdatasource = none
// @timeout = -1
// @includejs = breport.js
// @includejs = errors.js


/*

   Stampa del 'Rendiconto gestionale (MOD. B)' secondo nuovi schemi per il terzo settore.

*/


var BAN_VERSION = "9.1.0";
var BAN_EXPM_VERSION = "200615";



function loadDataStructure() {
   /*
      Data structure:
      - "id" used as GR/GR1 and to identify the object
      - "type" used to define the type of data (group, title or total)
      - "indent" used to define the indent level for the print
      - "bclass" used to define the bclass of the group
      - "description" used to define the description text used for the print
      - "sum" used to define how to calculate the total

      Indent levels:
      lvl0
         lvl1
            lvl2
               lvl3
                  lvl4

   */

   var dataStructure = [];
   
   /* COSTI */
   dataStructure.push({"id":"dCA", "type":"title", "indent":"", "description":"A) Costi e oneri da attività di interesse generale"});
   dataStructure.push({"id":"CA1", "type":"group", "indent":"", "bclass":"3", "description":"1) Materie prime, sussidiarie, di consumo e di merci"});
   dataStructure.push({"id":"CA2", "type":"group", "indent":"", "bclass":"3", "description":"2) Servizi"});
   dataStructure.push({"id":"CA3", "type":"group", "indent":"", "bclass":"3", "description":"3) Godimento beni di terzi"});
   dataStructure.push({"id":"CA4", "type":"group", "indent":"", "bclass":"3", "description":"4) Personale"});
   dataStructure.push({"id":"CA5", "type":"group", "indent":"", "bclass":"3", "description":"5) Ammortamenti"});
   dataStructure.push({"id":"CA6", "type":"group", "indent":"", "bclass":"3", "description":"6) Accantonamenti per rischi ed oneri"});
   dataStructure.push({"id":"CA7", "type":"group", "indent":"", "bclass":"3", "description":"7) Oneri diversi di gestione"});
   dataStructure.push({"id":"CA8", "type":"group", "indent":"", "bclass":"3", "description":"8) Rimanenze iniziali"});
   dataStructure.push({"id":"CA", "type":"total", "indent":"", "description":"Totale", "sum":"CA1;CA2;CA3;CA4;CA5;CA6;CA7;CA8"});
   dataStructure.push({"id":"dCB", "type":"title", "indent":"", "description":"B) Costi e oneri da attività diverse"});
   dataStructure.push({"id":"CB1", "type":"group", "indent":"", "bclass":"3", "description":"1) Materie prime, sussidiarie, di consumo e di merci"});
   dataStructure.push({"id":"CB2", "type":"group", "indent":"", "bclass":"3", "description":"2) Servizi"});
   dataStructure.push({"id":"CB3", "type":"group", "indent":"", "bclass":"3", "description":"3) Godimento beni di terzi"});
   dataStructure.push({"id":"CB4", "type":"group", "indent":"", "bclass":"3", "description":"4) Personale"});
   dataStructure.push({"id":"CB5", "type":"group", "indent":"", "bclass":"3", "description":"5) Ammortamenti"});
   dataStructure.push({"id":"CB6", "type":"group", "indent":"", "bclass":"3", "description":"6) Accantonamenti per rischi ed oneri"});
   dataStructure.push({"id":"CB7", "type":"group", "indent":"", "bclass":"3", "description":"7) Oneri diversi di gestione"});
   dataStructure.push({"id":"CB8", "type":"group", "indent":"", "bclass":"3", "description":"8) Rimanenze iniziali"});
   dataStructure.push({"id":"CB", "type":"total", "indent":"", "description":"Totale", "sum":"CB1;CB2;CB3;CB4;CB5;CB6;CB7;CB8"});
   dataStructure.push({"id":"dCC", "type":"title", "indent":"", "description":"C) Costi e oneri da attività di raccolta fondi"});
   dataStructure.push({"id":"CC1", "type":"group", "indent":"", "bclass":"3", "description":"1) Oneri per raccolte fondi abituali"});
   dataStructure.push({"id":"CC2", "type":"group", "indent":"", "bclass":"3", "description":"2) Oneri per raccolte fondi occasionali"});
   dataStructure.push({"id":"CC3", "type":"group", "indent":"", "bclass":"3", "description":"3) Altri oneri"});
   dataStructure.push({"id":"CC", "type":"total", "indent":"", "description":"Totale", "sum":"CC1;CC2;CC3"});
   dataStructure.push({"id":"dCD", "type":"title", "indent":"", "description":"D) Costi e oneri da attività finanziarie e patrimoniali"});
   dataStructure.push({"id":"CD1", "type":"group", "indent":"", "bclass":"3", "description":"1) Su rapporti bancari"});
   dataStructure.push({"id":"CD2", "type":"group", "indent":"", "bclass":"3", "description":"2) Su prestiti"});
   dataStructure.push({"id":"CD3", "type":"group", "indent":"", "bclass":"3", "description":"3) Da patrimonio edilizio"});
   dataStructure.push({"id":"CD4", "type":"group", "indent":"", "bclass":"3", "description":"4) Da altri beni patrimoniali"});
   dataStructure.push({"id":"CD5", "type":"group", "indent":"", "bclass":"3", "description":"5) Accantonamenti per rischi ed oneri"});
   dataStructure.push({"id":"CD6", "type":"group", "indent":"", "bclass":"3", "description":"6) Altri oneri"});
   dataStructure.push({"id":"CD", "type":"total", "indent":"", "description":"Totale", "sum":"CD1;CD2;CD3;CD4;CD5;CD6"});
   dataStructure.push({"id":"dCE", "type":"title", "indent":"", "description":"E) Costi e oneri di supporto generale"});
   dataStructure.push({"id":"CE1", "type":"group", "indent":"", "bclass":"3", "description":"1) Materie prime, sussidiarie, di consumo e di merci"});
   dataStructure.push({"id":"CE2", "type":"group", "indent":"", "bclass":"3", "description":"2) Servizi"});
   dataStructure.push({"id":"CE3", "type":"group", "indent":"", "bclass":"3", "description":"3) Godimento beni di terzi"});
   dataStructure.push({"id":"CE4", "type":"group", "indent":"", "bclass":"3", "description":"4) Personale"});
   dataStructure.push({"id":"CE5", "type":"group", "indent":"", "bclass":"3", "description":"5) Ammortamenti"});
   dataStructure.push({"id":"CE6", "type":"group", "indent":"", "bclass":"3", "description":"6) Accantonamenti per rischi ed oneri"});
   dataStructure.push({"id":"CE7", "type":"group", "indent":"", "bclass":"3", "description":"7) Altri oneri"});
   dataStructure.push({"id":"CE", "type":"total", "indent":"", "description":"Totale", "sum":"CE1;CE2;CE3;CE4;CE5;CE6;CE7"});
   dataStructure.push({"id":"C", "type":"total", "indent":"", "description":"TOTALE ONERI E COSTI", "sum":"CA;CB;CC;CD;CE"});
   dataStructure.push({"id":"IM", "type":"group", "indent":"", "bclass":"3", "description":"Imposte"});

   /* PROVENTI */
   dataStructure.push({"id":"dRA", "type":"title", "indent":"", "description":"A) Ricavi, rendite e proventi da attività di interesse generale"});
   dataStructure.push({"id":"RA1", "type":"group", "indent":"", "bclass":"4", "description":"1) Proventi da quote associative e apporti dei fondatori"});
   dataStructure.push({"id":"RA2", "type":"group", "indent":"", "bclass":"4", "description":"2) Proventi dagli associati per attività mutuali"});
   dataStructure.push({"id":"RA3", "type":"group", "indent":"", "bclass":"4", "description":"3) Ricavi per prestazioni e cessioni ad associati e fondatori"});
   dataStructure.push({"id":"RA4", "type":"group", "indent":"", "bclass":"4", "description":"4) Erogazioni liberali"});
   dataStructure.push({"id":"RA5", "type":"group", "indent":"", "bclass":"4", "description":"5) Proventi del 5 per mille"});
   dataStructure.push({"id":"RA6", "type":"group", "indent":"", "bclass":"4", "description":"6) Contributi da soggetti privati"});
   dataStructure.push({"id":"RA7", "type":"group", "indent":"", "bclass":"4", "description":"7) Ricavi per prestazioni e cessioni a terzi"});
   dataStructure.push({"id":"RA8", "type":"group", "indent":"", "bclass":"4", "description":"8) Contributi da enti pubblici"});
   dataStructure.push({"id":"RA9", "type":"group", "indent":"", "bclass":"4", "description":"9) Proventi da contratti con enti pubblici"});
   dataStructure.push({"id":"RA10", "type":"group", "indent":"", "bclass":"4", "description":"10) Altri ricavi, rendite e proventi"});
   dataStructure.push({"id":"RA11", "type":"group", "indent":"", "bclass":"4", "description":"11) Rimanenze finali"});
   dataStructure.push({"id":"RA", "type":"total", "indent":"", "description":"Totale", "sum":"RA1;RA2;RA3;RA4;RA5;RA6;RA7;RA8;RA9;RA10;RA11"});
   dataStructure.push({"id":"dRB", "type":"title", "indent":"", "description":"B) Ricavi, rendite e proventi da attività diverse"});
   dataStructure.push({"id":"RB1", "type":"group", "indent":"", "bclass":"4", "description":"1) Ricavi per prestazioni e cessioni ad associati e fondatori"});
   dataStructure.push({"id":"RB2", "type":"group", "indent":"", "bclass":"4", "description":"2) Contributi da soggetti privati"});
   dataStructure.push({"id":"RB3", "type":"group", "indent":"", "bclass":"4", "description":"3) Ricavi per prestazioni e cessioni a terzi"});
   dataStructure.push({"id":"RB4", "type":"group", "indent":"", "bclass":"4", "description":"4) Contributi da enti pubblici"});
   dataStructure.push({"id":"RB5", "type":"group", "indent":"", "bclass":"4", "description":"5) Proventi da contratti con enti pubblici"});
   dataStructure.push({"id":"RB6", "type":"group", "indent":"", "bclass":"4", "description":"6) Altri ricavi, rendite e proventi"});
   dataStructure.push({"id":"RB7", "type":"group", "indent":"", "bclass":"4", "description":"7) Rimanenze finali"});
   dataStructure.push({"id":"RB", "type":"total", "indent":"", "description":"Totale", "sum":"RB1;RB2;RB3;RB4;RB5;RB6;RB7"});
   dataStructure.push({"id":"dRC", "type":"title", "indent":"", "description":"C) Ricavi, rendite e proventi da attività di raccolta fondi"});
   dataStructure.push({"id":"RC1", "type":"group", "indent":"", "bclass":"4", "description":"1) Proventi da raccolte fondi abituali"});
   dataStructure.push({"id":"RC2", "type":"group", "indent":"", "bclass":"4", "description":"2) Proventi da raccolte fondi occasionali"});
   dataStructure.push({"id":"RC3", "type":"group", "indent":"", "bclass":"4", "description":"3) Altri proventi"});
   dataStructure.push({"id":"RC", "type":"total", "indent":"", "description":"Totale", "sum":"RC1;RC2;RC3"});
   dataStructure.push({"id":"dRD", "type":"title", "indent":"", "description":"D) Ricavi, rendite e proventi da attività finanziarie e patrimoniali"});
   dataStructure.push({"id":"RD1", "type":"group", "indent":"", "bclass":"4", "description":"1) Da rapporti bancari"});
   dataStructure.push({"id":"RD2", "type":"group", "indent":"", "bclass":"4", "description":"2) Da altri investimenti finanziari"});
   dataStructure.push({"id":"RD3", "type":"group", "indent":"", "bclass":"4", "description":"3) Da patrimonio edilizio"});
   dataStructure.push({"id":"RD4", "type":"group", "indent":"", "bclass":"4", "description":"4) Da altri beni patrimoniali"});
   dataStructure.push({"id":"RD5", "type":"group", "indent":"", "bclass":"4", "description":"5) Altri proventi"});
   dataStructure.push({"id":"RD", "type":"total", "indent":"", "description":"Totale", "sum":"RD1;RD2;RD3;RD4;RD5"});
   dataStructure.push({"id":"dRE", "type":"title", "indent":"", "description":"E) Proventi di supporto generale"});
   dataStructure.push({"id":"RE1", "type":"group", "indent":"", "bclass":"4", "description":"1) Proventi da distacco del personale"});
   dataStructure.push({"id":"RE2", "type":"group", "indent":"", "bclass":"4", "description":"2) Altri proventi di supporto generale"});
   dataStructure.push({"id":"RE", "type":"total", "indent":"", "description":"Totale", "sum":"RE1;RE2"});
   dataStructure.push({"id":"R", "type":"total", "indent":"", "description":"TOTALE PROVENTI E RICAVI", "sum":"RA;RB;RC;RD;RE"});

   /* AVANZO / DISAVANZO */
      // => ricavi-costi (es RA;-CA)
   dataStructure.push({"id":"RA-CA", "type":"total", "indent":"", "description":"Avanzo/disavanzo attività di interesse generale (+/-)", "sum":"RA;-CA"});
   dataStructure.push({"id":"RB-CB", "type":"total", "indent":"", "description":"Avanzo/disavanzo attività diverse (+/-)", "sum":"RB;-CB"});
   dataStructure.push({"id":"RC-CC", "type":"total", "indent":"", "description":"Avanzo/disavanzo attività di raccolta fondi", "sum":"RC;-CC"});
   dataStructure.push({"id":"RD-CD", "type":"total", "indent":"", "description":"Avanzo/disavanzo attività finanziarie e patrimoniali (+/-)", "sum":"RD;-CD"});
   dataStructure.push({"id":"RE-CE", "type":"total", "indent":"", "description":"Avanzo/disavanzo supporto generale (+/-)", "sum":"RE;-CE"});   
   dataStructure.push({"id":"TADPI", "type":"total", "indent":"", "description":"Avanzo/disavanzo d’esercizio prima delle imposte (+/-)", "sum":"RA-CA;RB-CB;RC-CC;RD-CD;RE-CE"});
   dataStructure.push({"id":"TADES", "type":"total", "indent":"", "description":"Avanzo/disavanzo d’esercizio (+/-)", "sum":"TADPI;IM"});
   dataStructure.push({"id":"PAIV", "type":"total", "indent":"", "description":"IV - Avanzo/disavanzo d'esercizio", "sum":"TADES"});

   /* COSTI FIGURATIVI */
   dataStructure.push({"id":"CG1", "type":"group", "indent":"", "bclass":"3", "description":"1) da attività di interesse generale"});
   dataStructure.push({"id":"CG2", "type":"group", "indent":"", "bclass":"3", "description":"2) da attività diverse"});
   dataStructure.push({"id":"CG", "type":"total", "indent":"", "description":"Totale", "sum":"CG1;CG2"});

   /* PROVENTI FIGURATIVI */
   dataStructure.push({"id":"RG1", "type":"group", "indent":"", "bclass":"4", "description":"1) da attività di interesse generale"});
   dataStructure.push({"id":"RG2", "type":"group", "indent":"", "bclass":"4", "description":"2) da attività diverse"});
   dataStructure.push({"id":"RG", "type":"total", "indent":"", "description":"Totale", "sum":"RG1;RG2"});

   return dataStructure;
}



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

   //Check that user entered the gr column in extension settings
   if (!userParam.column) {
      Banana.document.addMessage(getErrorMessage(ID_ERR_GRUPPO_MANCANTE));
      return "@Cancel";
   }

   /**
    * 1. Loads the data structure
    */
   var dataStructure = loadDataStructure();

   /**
    * 2. Calls methods to load balances, calculate totals, format amounts
    * and check entries that can be excluded
    */
   const bReport = new BReport(Banana.document, userParam, dataStructure);
   bReport.loadBalances();
   bReport.calculateTotals(["currentAmount", "previousAmount"]);
   bReport.formatValues(["currentAmount", "previousAmount"]);
   //Banana.console.log(JSON.stringify(dataStructure, "", " "));

   /**
    * 3. Creates the report
    */
   var stylesheet = Banana.Report.newStyleSheet();
   var report = printRendicontoModB(Banana.document, userParam, bReport, stylesheet);
   setCss(Banana.document, stylesheet, userParam);

   Banana.Report.preview(report, stylesheet);
}

function printRendicontoModB(banDoc, userParam, bReport, stylesheet) {

   var report = Banana.Report.newReport("Rendiconto gestionale (MOD. B)");
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
         headerParagraph.addParagraph(company, "");
      }
      if (address1) {
         headerParagraph.addParagraph(address1, "");
      }
      if (zip && city) {
         headerParagraph.addParagraph(zip + " " + city, "");
      }
      if (phone) {
         headerParagraph.addParagraph("Tel. " + phone, "");
      }
      if (web) {
         headerParagraph.addParagraph("Web: " + web, "");
      }
      if (email) {
         headerParagraph.addParagraph("Email: " + email, "");
      }
      headerParagraph.addParagraph(" ", "");
   }

   var title = "";
   if (userParam.title) {
      title = userParam.title;
   } else {
      title = banDoc.info("Base", "HeaderLeft") + " - " + "RENDICONTO GESTIONALE (MOD. B) ANNO " + currentYear;
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
   tableRow.addCell("ONERI E COSTI", "table-header", 1);
   tableRow.addCell(Banana.Converter.toLocaleDateFormat(endDate), "table-header align-right", 1);
   tableRow.addCell("31.12." + previousYear, "table-header align-right", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("PROVENTI E RICAVI", "table-header", 1);
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
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell(bReport.getObjectDescription("RA1"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RA1"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RA1"), "align-right", 1);

   /* Row 3 */
   tableRow = table.addRow();
   tableRow.addCell(bReport.getObjectDescription("CA1"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CA1"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CA1"), "align-right", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell(bReport.getObjectDescription("RA2"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RA2"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RA2"), "align-right", 1);

   /* Row 4 */
   tableRow = table.addRow();
   tableRow.addCell(bReport.getObjectDescription("CA2"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CA2"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CA2"), "align-right", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell(bReport.getObjectDescription("RA3"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RA3"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RA3"), "align-right", 1);

   /* Row 5 */
   tableRow = table.addRow();
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell(bReport.getObjectDescription("RA4"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RA4"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RA4"), "align-right", 1);

   /* Row 6 */
   tableRow = table.addRow();
   tableRow.addCell(bReport.getObjectDescription("CA3"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CA3"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CA3"), "align-right", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell(bReport.getObjectDescription("RA5"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RA5"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RA5"), "align-right", 1);

   /* Row 7 */
   tableRow = table.addRow();
   tableRow.addCell(bReport.getObjectDescription("CA4"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CA4"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CA4"), "align-right", 1);
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
   tableRow.addCell(bReport.getObjectDescription("CA5"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CA5"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CA5"), "align-right", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell(bReport.getObjectDescription("RA8"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RA8"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RA8"), "align-right", 1);

   /* Row 10 */
   tableRow = table.addRow();
   tableRow.addCell(bReport.getObjectDescription("CA6"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CA6"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CA6"), "align-right", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell(bReport.getObjectDescription("RA9"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RA9"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RA9"), "align-right", 1);

   /* Row 11 */
   tableRow = table.addRow();
   tableRow.addCell(bReport.getObjectDescription("CA7"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CA7"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CA7"), "align-right", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell(bReport.getObjectDescription("RA10"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RA10"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RA10"), "align-right", 1);

   /* Row 12 */
   tableRow = table.addRow();
   tableRow.addCell(bReport.getObjectDescription("CA8"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CA8"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CA8"), "align-right", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell(bReport.getObjectDescription("RA11"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RA11"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RA11"), "align-right", 1);

   /* Row 13, tot */
   tableRow = table.addRow();
   tableRow.addCell(bReport.getObjectDescription("CA"), "align-right", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CA"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CA"), "align-right", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell(bReport.getObjectDescription("RA"), "align-right", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RA"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RA"), "align-right", 1);

   /* Row 14, +/- */
   tableRow = table.addRow();
   tableRow.addCell(bReport.getObjectDescription("RA-CA"), "align-right", 5);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RA-CA"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RA-CA"), "align-right", 1);

   /* Row 15 */
   tableRow = table.addRow();
   tableRow.addCell(bReport.getObjectDescription("dCB"), "align-left bold", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell(bReport.getObjectDescription("dRB"), "align-left bold", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);

   /* Row 16 */
   tableRow = table.addRow();
   tableRow.addCell(bReport.getObjectDescription("CB1"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CB1"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CB1"), "align-right", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell(bReport.getObjectDescription("RB1"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RB1"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RB1"), "align-right", 1);

   /* Row 17 */
   tableRow = table.addRow();
   tableRow.addCell(bReport.getObjectDescription("CB2"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CB2"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CB2"), "align-right", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell(bReport.getObjectDescription("RB2"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RB2"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RB2"), "align-right", 1);

   /* Row 18 */
   tableRow = table.addRow();
   tableRow.addCell(bReport.getObjectDescription("CB3"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CB3"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CB3"), "align-right", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell(bReport.getObjectDescription("RB3"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RB3"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RB3"), "align-right", 1);

   /* Row 19 */
   tableRow = table.addRow();
   tableRow.addCell(bReport.getObjectDescription("CB4"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CB4"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CB4"), "align-right", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell(bReport.getObjectDescription("RB4"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RB4"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RB4"), "align-right", 1);

   /* Row 20 */
   tableRow = table.addRow();
   tableRow.addCell(bReport.getObjectDescription("CB5"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CB5"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CB5"), "align-right", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell(bReport.getObjectDescription("RB5"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RB5"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RB5"), "align-right", 1);

   /* Row 21 */
   tableRow = table.addRow();
   tableRow.addCell(bReport.getObjectDescription("CB6"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CB6"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CB6"), "align-right", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell(bReport.getObjectDescription("RB6"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RB6"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RB6"), "align-right", 1);

   /* Row 22 */
   tableRow = table.addRow();
   tableRow.addCell(bReport.getObjectDescription("CB7"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CB7"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CB7"), "align-right", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell(bReport.getObjectDescription("RB7"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RB7"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RB7"), "align-right", 1);

   /* Row 23 */
   tableRow = table.addRow();
   tableRow.addCell(bReport.getObjectDescription("CB8"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CB8"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CB8"), "align-right", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);

   /* Row 24, tot */
   tableRow = table.addRow();
   tableRow.addCell(bReport.getObjectDescription("CB"), "align-right", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CB"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CB"), "align-right", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell(bReport.getObjectDescription("RB"), "align-right", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RB"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RB"), "align-right", 1);

   /* Row 25, +/- */
   tableRow = table.addRow();
   tableRow.addCell(bReport.getObjectDescription("RB-CB"), "align-right", 5);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RB-CB"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RB-CB"), "align-right", 1);

   /* Row 26 */
   tableRow = table.addRow();
   tableRow.addCell(bReport.getObjectDescription("dCC"), "align-left bold", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell(bReport.getObjectDescription("dRC"), "align-left bold", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);

   /* Row 27 */
   tableRow = table.addRow();
   tableRow.addCell(bReport.getObjectDescription("CC1"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CC1"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CC1"), "align-right", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell(bReport.getObjectDescription("RC1"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RC1"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RC1"), "align-right", 1);

   /* Row 28 */
   tableRow = table.addRow();
   tableRow.addCell(bReport.getObjectDescription("CC2"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CC2"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CC2"), "align-right", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell(bReport.getObjectDescription("RC2"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RC2"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RC2"), "align-right", 1);

   /* Row 29 */
   tableRow = table.addRow();
   tableRow.addCell(bReport.getObjectDescription("CC3"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CC3"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CC3"), "align-right", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell(bReport.getObjectDescription("RC3"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RC3"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RC3"), "align-right", 1);

   /* Row 30, tot */
   tableRow = table.addRow();
   tableRow.addCell(bReport.getObjectDescription("CC"), "align-right", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CC"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CC"), "align-right", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell(bReport.getObjectDescription("RC"), "align-right", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RC"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RC"), "align-right", 1);

   /* Row 31, +/- */
   tableRow = table.addRow();
   tableRow.addCell(bReport.getObjectDescription("RC-CC"), "align-right", 5);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RC-CC"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RC-CC"), "align-right", 1);

   /* Row 32 */
   tableRow = table.addRow();
   tableRow.addCell(bReport.getObjectDescription("dCD"), "align-left bold", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell(bReport.getObjectDescription("dRD"), "align-left bold", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);

   /* Row 33 */
   tableRow = table.addRow();
   tableRow.addCell(bReport.getObjectDescription("CD1"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CD1"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CD1"), "align-right", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell(bReport.getObjectDescription("RD1"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RD1"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RD1"), "align-right", 1);

   /* Row 34 */
   tableRow = table.addRow();
   tableRow.addCell(bReport.getObjectDescription("CD2"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CD2"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CD2"), "align-right", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell(bReport.getObjectDescription("RD2"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RD2"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RD2"), "align-right", 1);

   /* Row 35 */
   tableRow = table.addRow();
   tableRow.addCell(bReport.getObjectDescription("CD3"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CD3"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CD3"), "align-right", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell(bReport.getObjectDescription("RD3"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RD3"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RD3"), "align-right", 1);

   /* Row 36 */
   tableRow = table.addRow();
   tableRow.addCell(bReport.getObjectDescription("CD4"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CD4"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CD4"), "align-right", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell(bReport.getObjectDescription("RD4"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RD4"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RD4"), "align-right", 1);

   /* Row 37 */
   tableRow = table.addRow();
   tableRow.addCell(bReport.getObjectDescription("CD5"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CD5"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CD5"), "align-right", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);

   /* Row 38 */
   tableRow = table.addRow();
   tableRow.addCell(bReport.getObjectDescription("CD6"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CD6"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CD6"), "align-right", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell(bReport.getObjectDescription("RD5"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RD5"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RD5"), "align-right", 1);

   /* Row 39, tot */
   tableRow = table.addRow();
   tableRow.addCell(bReport.getObjectDescription("CD"), "align-right", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CD"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CD"), "align-right", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell(bReport.getObjectDescription("RD"), "align-right", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RD"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RD"), "align-right", 1);

   /* Row 40, +/- */
   tableRow = table.addRow();
   tableRow.addCell(bReport.getObjectDescription("RD-CD"), "align-right", 5);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RD-CD"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RD-CD"), "align-right", 1);

   /* Row 41 */
   tableRow = table.addRow();
   tableRow.addCell(bReport.getObjectDescription("dCE"), "align-left bold", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell(bReport.getObjectDescription("dRE"), "align-left bold", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);

   /* Row 42 */
   tableRow = table.addRow();
   tableRow.addCell(bReport.getObjectDescription("CE1"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CE1"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CE1"), "align-right", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell(bReport.getObjectDescription("RE1"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RE1"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RE1"), "align-right", 1);

   /* Row 43 */
   tableRow = table.addRow();
   tableRow.addCell(bReport.getObjectDescription("CE2"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CE2"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CE2"), "align-right", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell(bReport.getObjectDescription("RE2"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RE2"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RE2"), "align-right", 1);

   /* Row 44 */
   tableRow = table.addRow();
   tableRow.addCell(bReport.getObjectDescription("CE3"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CE3"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CE3"), "align-right", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);

   /* Row 45 */
   tableRow = table.addRow();
   tableRow.addCell(bReport.getObjectDescription("CE4"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CE4"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CE4"), "align-right", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);

   /* Row 46 */
   tableRow = table.addRow();
   tableRow.addCell(bReport.getObjectDescription("CE5"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CE5"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CE5"), "align-right", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);

   /* Row 47 */
   tableRow = table.addRow();
   tableRow.addCell(bReport.getObjectDescription("CE6"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CE6"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CE6"), "align-right", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);

   /* Row 48 */
   tableRow = table.addRow();
   tableRow.addCell(bReport.getObjectDescription("CE7"), "align-left", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CE7"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CE7"), "align-right", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);

   /* Row 49 */
   tableRow = table.addRow();
   tableRow.addCell(bReport.getObjectDescription("CE"), "align-right", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("CE"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("CE"), "align-right", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell(bReport.getObjectDescription("RE"), "align-right", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("RE"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("RE"), "align-right", 1);

   /* Row 50 */
   tableRow = table.addRow();
   tableRow.addCell(bReport.getObjectDescription("C"), "align-right bold", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("C"), "align-right bold", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("C"), "align-right bold", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell(bReport.getObjectDescription("R"), "align-right bold", 1);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("R"), "align-right bold", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("R"), "align-right bold", 1);

   /* Row 51 */
   tableRow = table.addRow();
   tableRow.addCell(bReport.getObjectDescription("TADPI"), "align-right", 5);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("TADPI"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("TADPI"), "align-right", 1);

   /* Row 52 */
   tableRow = table.addRow();
   tableRow.addCell(bReport.getObjectDescription("IM"), "align-right", 5);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("IM"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("IM"), "align-right", 1);

   /* Row 53 */
   tableRow = table.addRow();
   tableRow.addCell(bReport.getObjectDescription("TADES"), "align-right", 5);
   tableRow.addCell(bReport.getObjectCurrentAmountFormatted("TADES"), "align-right", 1);
   tableRow.addCell(bReport.getObjectPreviousAmountFormatted("TADES"), "align-right", 1);




   /**************************************************************************************
   * COSTI E PROVENTI FIGURATIVI
   **************************************************************************************/

   report.addParagraph(" ", "");
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
   tableRow.addCell("Costi figurativi", "table-header align-center", 1);
   tableRow.addCell(Banana.Converter.toLocaleDateFormat(endDate), "table-header align-center", 1);
   tableRow.addCell("31.12." + previousYear, "table-header align-center", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("Proventi figurativi", "table-header align-center", 1);
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

function checkResults(banDoc, startDate, endDate) {
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
   var file = Banana.IO.getLocalFile("file:script/rendicontoModB.css");
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
   currentParam.value = userParam.column ? userParam.column : '';
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
   return true;
}

