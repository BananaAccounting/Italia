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
// @pubdate = 2020-07-08
// @publisher = Banana.ch SA
// @description = Rendiconto per cassa (MOD. D)
// @task = app.command
// @doctype = 100.100
// @docproperties = 
// @outputformat = none
// @inputdatasource = none
// @timeout = -1


/*

   Stampa del 'Rendiconto per cassa (MOD. D)' secondo nuovi schemi per il terzo settore.

*/



var userParam = {};


//Main function
function exec(string) {

   //Check if we are on an opened document
   if (!Banana.document) {
      return;
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

   var report = printRendicontoModD(Banana.document, userParam);
   var stylesheet = Banana.Report.newStyleSheet();
   setCss(Banana.document, stylesheet, userParam);
   Banana.Report.preview(report, stylesheet);
}

function printRendicontoModD(banDoc, userParam) {

   var report = Banana.Report.newReport("Rendiconto per cassa (MOD. D)");
   var startDate = userParam.selectionStartDate;
   var endDate = userParam.selectionEndDate;
   var currentYear = Banana.Converter.toDate(banDoc.info("AccountingDataBase", "OpeningDate")).getFullYear();
   var previousYear = currentYear - 1;

   var title = "";
   if (userParam.title) {
      title = userParam.title;
   } else {
      title = banDoc.info("Base", "HeaderLeft") + " - " + "RENDICONTO PER CASSA (MOD. D) ANNO " + currentYear;
   }
 
   report.addParagraph(title, "heading2");

   var table = report.addTable("table");
   var column1 = table.addColumn("column1");
   var column2 = table.addColumn("column2");
   var column3 = table.addColumn("column3");
   var column4 = table.addColumn("column4");
   var column5 = table.addColumn("column5");
   var column6 = table.addColumn("column6");
   var column7 = table.addColumn("column7");
   
   var obj = "";
   var current = "";
   var previous = "";   
   var objC = "";
   var currentC = "";
   var previousC = "";
   var objR = "";
   var currentR = "";
   var previousR = "";
   var totCurrentC = "";
   var totPreviousC = "";
   var totCurrentR = "";
   var totPreviousR = "";


   /**************************************************************************************
   * COSTI E PROVENTI
   **************************************************************************************/
   tableRow = table.addRow();
   tableRow.addCell("USCITE", "styleTableHeader", 1);
   tableRow.addCell(Banana.Converter.toLocaleDateFormat(endDate), "styleTableHeader alignRight", 1);
   tableRow.addCell("31.12." + previousYear, "styleTableHeader alignRight", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("ENTRATE", "styleTableHeader", 1);
   tableRow.addCell(Banana.Converter.toLocaleDateFormat(endDate), "styleTableHeader alignRight", 1);
   tableRow.addCell("31.12." + previousYear, "styleTableHeader alignRight", 1);

   /* Row 1 */   
   tableRow = table.addRow();
   tableRow.addCell("A) Uscite da attività di interesse generale", "alignLeft bold", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("A) Entrate da attività di interesse generale", "alignLeft bold", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);

   /* Row 2*/
   objR = banDoc.currentBalance("Gr=RA1", startDate, endDate);
   currentR = objR.total;
   previousR = banDoc.table("Accounts").findRowByValue("Group", "RA1").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("1) Entrate da quote associative e apporti dei fondatori", "alignLeft", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(currentR)), "alignRight", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previousR)), "alignRight", 1);

   /* Row 3 */
   objC = banDoc.currentBalance("Gr=CA1", startDate, endDate);
   currentC = objC.total;
   previousC = banDoc.table("Accounts").findRowByValue("Group", "CA1").value("Prior");
   objR = banDoc.currentBalance("Gr=RA2", startDate, endDate);
   currentR = objR.total;
   previousR = banDoc.table("Accounts").findRowByValue("Group", "RA2").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("1) Materie prime, sussidiarie, di consumo e di merci", "alignLeft", 1);
   tableRow.addCell(formatValue(currentC), "alignRight", 1);
   tableRow.addCell(formatValue(previousC), "alignRight", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("2) Entrate dagli associati per attività mutuali", "alignLeft", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(currentR)), "alignRight", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previousR)), "alignRight", 1);

   /* Row 4 */
   objC = banDoc.currentBalance("Gr=CA2", startDate, endDate);
   currentC = objC.total;
   previousC = banDoc.table("Accounts").findRowByValue("Group", "CA2").value("Prior");
   objR = banDoc.currentBalance("Gr=RA3", startDate, endDate);
   currentR = objR.total;
   previousR = banDoc.table("Accounts").findRowByValue("Group", "RA3").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("2) Servizi", "alignLeft", 1);
   tableRow.addCell(formatValue(currentC), "alignRight", 1);
   tableRow.addCell(formatValue(previousC), "alignRight", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("3) Entrate per prestazioni e cessioni ad associati e fondatori", "alignLeft", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(currentR)), "alignRight", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previousR)), "alignRight", 1);

   /* Row 5 */
   objR = banDoc.currentBalance("Gr=RA4", startDate, endDate);
   currentR = objR.total;
   previousR = banDoc.table("Accounts").findRowByValue("Group", "RA4").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("4) Erogazioni liberali", "alignLeft", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(currentR)), "alignRight", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previousR)), "alignRight", 1);

   /* Row 6 */
   objC = banDoc.currentBalance("Gr=CA3", startDate, endDate);
   currentC = objC.total;
   previousC = banDoc.table("Accounts").findRowByValue("Group", "CA3").value("Prior");
   objR = banDoc.currentBalance("Gr=RA5", startDate, endDate);
   currentR = objR.total;
   previousR = banDoc.table("Accounts").findRowByValue("Group", "RA5").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("3) Godimento beni di terzi", "alignLeft", 1);
   tableRow.addCell(formatValue(currentC), "alignRight", 1);
   tableRow.addCell(formatValue(previousC), "alignRight", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("5) Entrate del 5 per mille", "alignLeft", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(currentR)), "alignRight", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previousR)), "alignRight", 1);

   /* Row 7 */
   objC = banDoc.currentBalance("Gr=CA4", startDate, endDate);
   currentC = objC.total;
   previousC = banDoc.table("Accounts").findRowByValue("Group", "CA4").value("Prior");
   objR = banDoc.currentBalance("Gr=RA6", startDate, endDate);
   currentR = objR.total;
   previousR = banDoc.table("Accounts").findRowByValue("Group", "RA6").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("4) Personale", "alignLeft", 1);
   tableRow.addCell(formatValue(currentC), "alignRight", 1);
   tableRow.addCell(formatValue(previousC), "alignRight", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("6) Contributi da soggetti privati", "alignLeft", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(currentR)), "alignRight", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previousR)), "alignRight", 1);

   /* Row 8 */
   objR = banDoc.currentBalance("Gr=RA7", startDate, endDate);
   currentR = objR.total;
   previousR = banDoc.table("Accounts").findRowByValue("Group", "RA7").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("7) Entrate per prestazioni e cessioni a terzi", "alignLeft", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(currentR)), "alignRight", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previousR)), "alignRight", 1);

   /* Row 9 */
   objC = banDoc.currentBalance("Gr=CA7", startDate, endDate);
   currentC = objC.total;
   previousC = banDoc.table("Accounts").findRowByValue("Group", "CA7").value("Prior");
   objR = banDoc.currentBalance("Gr=RA8", startDate, endDate);
   currentR = objR.total;
   previousR = banDoc.table("Accounts").findRowByValue("Group", "RA8").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("5) Uscite diverse di gestione", "alignLeft", 1);
   tableRow.addCell(formatValue(currentC), "alignRight", 1);
   tableRow.addCell(formatValue(previousC), "alignRight", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("8) Contributi da enti pubblici", "alignLeft", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(currentR)), "alignRight", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previousR)), "alignRight", 1);

   /* Row 10 */
   objR = banDoc.currentBalance("Gr=RA9", startDate, endDate);
   currentR = objR.total;
   previousR = banDoc.table("Accounts").findRowByValue("Group", "RA9").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("9) Entrate da contratti con enti pubblici", "alignLeft", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(currentR)), "alignRight", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previousR)), "alignRight", 1);

   /* Row 11 */
   objR = banDoc.currentBalance("Gr=RA10", startDate, endDate);
   currentR = objR.total;
   previousR = banDoc.table("Accounts").findRowByValue("Group", "RA10").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("10) Altre entrate", "alignLeft", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(currentR)), "alignRight", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previousR)), "alignRight", 1);

   /* Row 12, tot */
   objC = banDoc.currentBalance("Gr=CA", startDate, endDate);
   currentC = objC.total;
   previousC = banDoc.table("Accounts").findRowByValue("Group", "CA").value("Prior");
   objR = banDoc.currentBalance("Gr=RA", startDate, endDate);
   currentR = objR.total;
   previousR = banDoc.table("Accounts").findRowByValue("Group", "RA").value("Prior");
   totCurrentC = Banana.SDecimal.add(totCurrentC,currentC);
   totPreviousC = Banana.SDecimal.add(totPreviousC,previousC);
   totCurrentR = Banana.SDecimal.add(totCurrentR,currentR);
   totPreviousR = Banana.SDecimal.add(totPreviousR,previousR);
   tableRow = table.addRow();
   tableRow.addCell("Totale", "alignRight", 1);
   tableRow.addCell(formatValue(currentC), "alignRight", 1);
   tableRow.addCell(formatValue(previousC), "alignRight", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("Totale", "alignRight", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(currentR)), "alignRight", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previousR)), "alignRight", 1);

   /* Row 13 */
   objR = banDoc.currentBalance("Gr=RA-CA", startDate, endDate);
   current = objR.total;
   previous = banDoc.table("Accounts").findRowByValue("Group", "RA-CA").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("Avanzo/disavanzo attività di interesse generale (+/-)", "alignRight", 5);
   tableRow.addCell(formatValue(current), "alignRight", 1);
   tableRow.addCell(formatValue(previous), "alignRight", 1);

   /* Row 14 */
   tableRow = table.addRow();
   tableRow.addCell("B) Uscite da attività diverse", "alignLeft bold", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("B) Entrate da attività diverse", "alignLeft bold", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);

   /* Row 15 */
   tableRow = table.addRow();
   objC = banDoc.currentBalance("Gr=CB1", startDate, endDate);
   currentC = objC.total;
   previousC = banDoc.table("Accounts").findRowByValue("Group", "CB1").value("Prior");
   objR = banDoc.currentBalance("Gr=RB1", startDate, endDate);
   currentR = objR.total;
   previousR = banDoc.table("Accounts").findRowByValue("Group", "RB1").value("Prior");
   tableRow.addCell("1) Materie prime, sussidiarie, di consumo e di merci", "alignLeft", 1);
   tableRow.addCell(formatValue(currentC), "alignRight", 1);
   tableRow.addCell(formatValue(previousC), "alignRight", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("1) Entrate per prestazioni e cessioni ad associati e fondatori", "alignLeft", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(currentR)), "alignRight", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previousR)), "alignRight", 1);

   /* Row 16 */
   objC = banDoc.currentBalance("Gr=CB2", startDate, endDate);
   currentC = objC.total;
   previousC = banDoc.table("Accounts").findRowByValue("Group", "CB2").value("Prior");
   objR = banDoc.currentBalance("Gr=RB2", startDate, endDate);
   currentR = objR.total;
   previousR = banDoc.table("Accounts").findRowByValue("Group", "RB2").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("2) Servizi", "alignLeft", 1);
   tableRow.addCell(formatValue(currentC), "alignRight", 1);
   tableRow.addCell(formatValue(previousC), "alignRight", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("2) Contributi da soggetti privati", "alignLeft", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(currentR)), "alignRight", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previousR)), "alignRight", 1);

   /* Row 17 */
   objC = banDoc.currentBalance("Gr=CB3", startDate, endDate);
   currentC = objC.total;
   previousC = banDoc.table("Accounts").findRowByValue("Group", "CB3").value("Prior");
   objR = banDoc.currentBalance("Gr=RB3", startDate, endDate);
   currentR = objR.total;
   previousR = banDoc.table("Accounts").findRowByValue("Group", "RB3").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("3) Godimento beni di terzi", "alignLeft", 1);
   tableRow.addCell(formatValue(currentC), "alignRight", 1);
   tableRow.addCell(formatValue(previousC), "alignRight", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("3) Entrate per prestazioni e cessioni a terzi", "alignLeft", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(currentR)), "alignRight", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previousR)), "alignRight", 1);

   /* Row 18 */
   objC = banDoc.currentBalance("Gr=CB4", startDate, endDate);
   currentC = objC.total;
   previousC = banDoc.table("Accounts").findRowByValue("Group", "CB4").value("Prior");
   objR = banDoc.currentBalance("Gr=RB4", startDate, endDate);
   currentR = objR.total;
   previousR = banDoc.table("Accounts").findRowByValue("Group", "RB4").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("4) Personale", "alignLeft", 1);
   tableRow.addCell(formatValue(currentC), "alignRight", 1);
   tableRow.addCell(formatValue(previousC), "alignRight", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("4) Contributi da enti pubblici", "alignLeft", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(currentR)), "alignRight", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previousR)), "alignRight", 1);

   /* Row 19 */
   objC = banDoc.currentBalance("Gr=CB7", startDate, endDate);
   currentC = objC.total;
   previousC = banDoc.table("Accounts").findRowByValue("Group", "CB7").value("Prior");
   objR = banDoc.currentBalance("Gr=RB5", startDate, endDate);
   currentR = objR.total;
   previousR = banDoc.table("Accounts").findRowByValue("Group", "RB5").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("5) Uscite diverse di gestione", "alignLeft", 1);
   tableRow.addCell(formatValue(currentC), "alignRight", 1);
   tableRow.addCell(formatValue(previousC), "alignRight", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("5) Entrate da contratti con enti pubblici", "alignLeft", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(currentR)), "alignRight", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previousR)), "alignRight", 1);

   /* Row 20 */
   objR = banDoc.currentBalance("Gr=RB6", startDate, endDate);
   currentR = objR.total;
   previousR = banDoc.table("Accounts").findRowByValue("Group", "RB6").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("6) Altre entrate", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(currentR)), "alignRight", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previousR)), "alignRight", 1);

   /* Row 21, tot */
   objC = banDoc.currentBalance("Gr=CB", startDate, endDate);
   currentC = objC.total;
   previousC = banDoc.table("Accounts").findRowByValue("Group", "CB").value("Prior");
   objR = banDoc.currentBalance("Gr=RB", startDate, endDate);
   currentR = objR.total;
   previousR = banDoc.table("Accounts").findRowByValue("Group", "RB").value("Prior");
   totCurrentC = Banana.SDecimal.add(totCurrentC,currentC);
   totPreviousC = Banana.SDecimal.add(totPreviousC,previousC);
   totCurrentR = Banana.SDecimal.add(totCurrentR,currentR);
   totPreviousR = Banana.SDecimal.add(totPreviousR,previousR);
   tableRow = table.addRow();
   tableRow.addCell("Totale", "alignRight", 1);
   tableRow.addCell(formatValue(currentC), "alignRight", 1);
   tableRow.addCell(formatValue(previousC), "alignRight", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("Totale", "alignRight", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(currentR)), "alignRight", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previousR)), "alignRight", 1);

   /* Row 22 */
   obj = banDoc.currentBalance("Gr=RB-CB", startDate, endDate);
   current = obj.total;
   previous = banDoc.table("Accounts").findRowByValue("Group", "RB-CB").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("Avanzo/disavanzo attività diverse (+/-)", "alignRight", 5);
   tableRow.addCell(formatValue(current), "alignRight", 1);
   tableRow.addCell(formatValue(previous), "alignRight", 1);

   /* Row 23 */
   tableRow = table.addRow();
   tableRow.addCell("C) Uscite da attività di raccolta fondi", "alignLeft bold", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("C) Entrate da attività di raccolta fondi", "alignLeft bold", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);

   /* Row 24 */
   objC = banDoc.currentBalance("Gr=CC1", startDate, endDate);
   currentC = objC.total;
   previousC = banDoc.table("Accounts").findRowByValue("Group", "CC1").value("Prior");
   objR = banDoc.currentBalance("Gr=RC1", startDate, endDate);
   currentR = objR.total;
   previousR = banDoc.table("Accounts").findRowByValue("Group", "RC1").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("1) Uscite per raccolte fondi abituali", "alignLeft", 1);
   tableRow.addCell(formatValue(currentC), "alignRight", 1);
   tableRow.addCell(formatValue(previousC), "alignRight", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("1) Entrate da raccolte fondi abituali", "alignLeft", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(currentR)), "alignRight", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previousR)), "alignRight", 1);

   /* Row 25 */
   objC = banDoc.currentBalance("Gr=CC2", startDate, endDate);
   currentC = objC.total;
   previousC = banDoc.table("Accounts").findRowByValue("Group", "CC2").value("Prior");
   objR = banDoc.currentBalance("Gr=RC2", startDate, endDate);
   currentR = objR.total;
   previousR = banDoc.table("Accounts").findRowByValue("Group", "RC2").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("2) Uscite per raccolte fondi occasionali", "alignLeft", 1);
   tableRow.addCell(formatValue(currentC), "alignRight", 1);
   tableRow.addCell(formatValue(previousC), "alignRight", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("2) Entrate da raccolte fondi occasionali", "alignLeft", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(currentR)), "alignRight", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previousR)), "alignRight", 1);

   /* Row 26 */
   objC = banDoc.currentBalance("Gr=CC3", startDate, endDate);
   currentC = objC.total;
   previousC = banDoc.table("Accounts").findRowByValue("Group", "CC3").value("Prior");
   objR = banDoc.currentBalance("Gr=RC3", startDate, endDate);
   currentR = objR.total;
   previousR = banDoc.table("Accounts").findRowByValue("Group", "RC3").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("3) Altre uscite", "alignLeft", 1);
   tableRow.addCell(formatValue(currentC), "alignRight", 1);
   tableRow.addCell(formatValue(previousC), "alignRight", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("3) Altre entrate", "alignLeft", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(currentR)), "alignRight", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previousR)), "alignRight", 1);

   /* Row 27, tot */
   objC = banDoc.currentBalance("Gr=CC", startDate, endDate);
   currentC = objC.total;
   previousC = banDoc.table("Accounts").findRowByValue("Group", "CC").value("Prior");
   objR = banDoc.currentBalance("Gr=RC", startDate, endDate);
   currentR = objR.total;
   previousR = banDoc.table("Accounts").findRowByValue("Group", "RC").value("Prior");
   totCurrentC = Banana.SDecimal.add(totCurrentC,currentC);
   totPreviousC = Banana.SDecimal.add(totPreviousC,previousC);
   totCurrentR = Banana.SDecimal.add(totCurrentR,currentR);
   totPreviousR = Banana.SDecimal.add(totPreviousR,previousR);
   tableRow = table.addRow();
   tableRow.addCell("Totale", "alignRight", 1);
   tableRow.addCell(formatValue(currentC), "alignRight", 1);
   tableRow.addCell(formatValue(previousC), "alignRight", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("Totale", "alignRight", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(currentR)), "alignRight", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previousR)), "alignRight", 1);

   /* Row 28 */
   obj = banDoc.currentBalance("Gr=RC-CC", startDate, endDate);
   current = obj.total;
   previous = banDoc.table("Accounts").findRowByValue("Group", "RC-CC").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("Avanzo/disavanzo attività di raccolta fondi (+/-)", "alignRight", 5);
   tableRow.addCell(formatValue(current), "alignRight", 1);
   tableRow.addCell(formatValue(previous), "alignRight", 1);

   /* Row 29 */
   tableRow = table.addRow();
   tableRow.addCell("D) Uscite da attività finanziarie e patrimoniali", "alignLeft bold", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("D) Entrate da attività finanziarie e patrimoniali", "alignLeft bold", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);

   /* Row 30 */
   objC = banDoc.currentBalance("Gr=CD1", startDate, endDate);
   currentC = objC.total;
   previousC = banDoc.table("Accounts").findRowByValue("Group", "CD1").value("Prior");
   objR = banDoc.currentBalance("Gr=RD1", startDate, endDate);
   currentR = objR.total;
   previousR = banDoc.table("Accounts").findRowByValue("Group", "RD1").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("1) Su rapporti bancari", "alignLeft", 1);
   tableRow.addCell(formatValue(currentC), "alignRight", 1);
   tableRow.addCell(formatValue(previousC), "alignRight", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("1) Da rapporti bancari", "alignLeft", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(currentR)), "alignRight", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previousR)), "alignRight", 1);

   /* Row 31 */
   objC = banDoc.currentBalance("Gr=CD2", startDate, endDate);
   currentC = objC.total;
   previousC = banDoc.table("Accounts").findRowByValue("Group", "CD2").value("Prior");
   objR = banDoc.currentBalance("Gr=RD2", startDate, endDate);
   currentR = objR.total;
   previousR = banDoc.table("Accounts").findRowByValue("Group", "RD2").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("2) Su investimenti finanziari", "alignLeft", 1);
   tableRow.addCell(formatValue(currentC), "alignRight", 1);
   tableRow.addCell(formatValue(previousC), "alignRight", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("2) Da altri investimenti finanziari", "alignLeft", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(currentR)), "alignRight", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previousR)), "alignRight", 1);

   /* Row 32 */
   objC = banDoc.currentBalance("Gr=CD3", startDate, endDate);
   currentC = objC.total;
   previousC = banDoc.table("Accounts").findRowByValue("Group", "CD3").value("Prior");
   objR = banDoc.currentBalance("Gr=RD3", startDate, endDate);
   currentR = objR.total;
   previousR = banDoc.table("Accounts").findRowByValue("Group", "RD3").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("3) Su patrimonio edilizio", "alignLeft", 1);
   tableRow.addCell(formatValue(currentC), "alignRight", 1);
   tableRow.addCell(formatValue(previousC), "alignRight", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("3) Da patrimonio edilizio", "alignLeft", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(currentR)), "alignRight", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previousR)), "alignRight", 1);

   /* Row 33 */
   objC = banDoc.currentBalance("Gr=CD4", startDate, endDate);
   currentC = objC.total;
   previousC = banDoc.table("Accounts").findRowByValue("Group", "CD4").value("Prior");
   objR = banDoc.currentBalance("Gr=RD4", startDate, endDate);
   currentR = objR.total;
   previousR = banDoc.table("Accounts").findRowByValue("Group", "RD4").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("4) Su altri beni patrimoniali", "alignLeft", 1);
   tableRow.addCell(formatValue(currentC), "alignRight", 1);
   tableRow.addCell(formatValue(previousC), "alignRight", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("4) Da altri beni patrimoniali", "alignLeft", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(currentR)), "alignRight", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previousR)), "alignRight", 1);

   /* Row 34 */
   objC = banDoc.currentBalance("Gr=CD6", startDate, endDate);
   currentC = objC.total;
   previousC = banDoc.table("Accounts").findRowByValue("Group", "CD6").value("Prior");
   tableRow = table.addRow();
   objR = banDoc.currentBalance("Gr=RD5", startDate, endDate);
   currentR = objR.total;
   previousR = banDoc.table("Accounts").findRowByValue("Group", "RD5").value("Prior");
   tableRow.addCell("5) Altre uscite", "alignLeft", 1);
   tableRow.addCell(formatValue(currentC), "alignRight", 1);
   tableRow.addCell(formatValue(previousC), "alignRight", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("5) Altre entrate", "alignLeft", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(currentR)), "alignRight", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previousR)), "alignRight", 1);

   /* Row 35, tot */
   objC = banDoc.currentBalance("Gr=CD", startDate, endDate);
   currentC = objC.total;
   previousC = banDoc.table("Accounts").findRowByValue("Group", "CD").value("Prior");
   objR = banDoc.currentBalance("Gr=RD", startDate, endDate);
   currentR = objR.total;
   previousR = banDoc.table("Accounts").findRowByValue("Group", "RD").value("Prior");
   totCurrentC = Banana.SDecimal.add(totCurrentC,currentC);
   totPreviousC = Banana.SDecimal.add(totPreviousC,previousC);
   totCurrentR = Banana.SDecimal.add(totCurrentR,currentR);
   totPreviousR = Banana.SDecimal.add(totPreviousR,previousR);
   tableRow = table.addRow();
   tableRow.addCell("Totale", "alignRight", 1);
   tableRow.addCell(formatValue(currentC), "alignRight", 1);
   tableRow.addCell(formatValue(previousC), "alignRight", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("Totale", "alignRight", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(currentR)), "alignRight", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previousR)), "alignRight", 1);

   /* Row 36 */
   obj = banDoc.currentBalance("Gr=RD-CD", startDate, endDate);
   current = obj.total;
   previous = banDoc.table("Accounts").findRowByValue("Group", "RD-CD").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("Avanzo/disavanzo attività finanziarie e patrimoniali (+/-)", "alignRight", 5);
   tableRow.addCell(formatValue(current), "alignRight", 1);
   tableRow.addCell(formatValue(previous), "alignRight", 1);

   /* Row 37 */
   tableRow = table.addRow();
   tableRow.addCell("E) Uscite di supporto generale", "alignLeft bold", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("E) Entrate di supporto generale", "alignLeft bold", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);

   /* Row 38 */
   objC = banDoc.currentBalance("Gr=CE1", startDate, endDate);
   currentC = objC.total;
   previousC = banDoc.table("Accounts").findRowByValue("Group", "CE1").value("Prior");
   objR = banDoc.currentBalance("Gr=RE1", startDate, endDate);
   currentR = objR.total;
   previousR = banDoc.table("Accounts").findRowByValue("Group", "RE1").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("1) Materie prime, sussidiarie, di consumo e di merci", "alignLeft", 1);
   tableRow.addCell(formatValue(currentC), "alignRight", 1);
   tableRow.addCell(formatValue(previousC), "alignRight", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("1) Entrate da distacco del personale", "alignLeft", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(currentR)), "alignRight", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previousR)), "alignRight", 1);

   /* Row 39 */
   objC = banDoc.currentBalance("Gr=CE2", startDate, endDate);
   currentC = objC.total;
   previousC = banDoc.table("Accounts").findRowByValue("Group", "CE2").value("Prior");
   objR = banDoc.currentBalance("Gr=RE2", startDate, endDate);
   currentR = objR.total;
   previousR = banDoc.table("Accounts").findRowByValue("Group", "RE2").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("2) Servizi", "alignLeft", 1);
   tableRow.addCell(formatValue(currentC), "alignRight", 1);
   tableRow.addCell(formatValue(previousC), "alignRight", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("2) Altre entrate di supporto generale", "alignLeft", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(currentR)), "alignRight", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previousR)), "alignRight", 1);

   /* Row 40 */
   objC = banDoc.currentBalance("Gr=CE3", startDate, endDate);
   currentC = objC.total;
   previousC = banDoc.table("Accounts").findRowByValue("Group", "CE3").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("3) Godimento beni di terzi", "alignLeft", 1);
   tableRow.addCell(formatValue(currentC), "alignRight", 1);
   tableRow.addCell(formatValue(previousC), "alignRight", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);

   /* Row 41 */
   objC = banDoc.currentBalance("Gr=CE4", startDate, endDate);
   currentC = objC.total;
   previousC = banDoc.table("Accounts").findRowByValue("Group", "CE4").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("4) Personale", "alignLeft", 1);
   tableRow.addCell(formatValue(currentC), "alignRight", 1);
   tableRow.addCell(formatValue(previousC), "alignRight", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);

   /* Row 42 */
   objC = banDoc.currentBalance("Gr=CE7", startDate, endDate);
   currentC = objC.total;
   previousC = banDoc.table("Accounts").findRowByValue("Group", "CE7").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("5) Altre uscite", "alignLeft", 1);
   tableRow.addCell(formatValue(currentC), "alignRight", 1);
   tableRow.addCell(formatValue(previousC), "alignRight", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);

   /* Row 43, tot */
   objC = banDoc.currentBalance("Gr=CE", startDate, endDate);
   currentC = objC.total;
   previousC = banDoc.table("Accounts").findRowByValue("Group", "CE").value("Prior");
   objR = banDoc.currentBalance("Gr=RE", startDate, endDate);
   currentR = objR.total;
   previousR = banDoc.table("Accounts").findRowByValue("Group", "RE").value("Prior");
   totCurrentC = Banana.SDecimal.add(totCurrentC,currentC);
   totPreviousC = Banana.SDecimal.add(totPreviousC,previousC);
   totCurrentR = Banana.SDecimal.add(totCurrentR,currentR);
   totPreviousR = Banana.SDecimal.add(totPreviousR,previousR);
   tableRow = table.addRow();
   tableRow.addCell("Totale", "alignRight", 1);
   tableRow.addCell(formatValue(currentC), "alignRight", 1);
   tableRow.addCell(formatValue(previousC), "alignRight", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("Totale", "alignRight", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(currentR)), "alignRight", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previousR)), "alignRight", 1);

   /* Row 44 */
   tableRow = table.addRow();
   tableRow.addCell("Totale uscite della gestione", "alignRight bold", 1);
   tableRow.addCell(formatValue(totCurrentC), "alignRight bold", 1);
   tableRow.addCell(formatValue(totPreviousC), "alignRight bold", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("Totale entrate della gestione", "alignRight bold", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(totCurrentR)), "alignRight bold", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(totPreviousR)), "alignRight bold", 1);

   /* Row 45 */
   obj = banDoc.currentBalance("Gr=TADPI", startDate, endDate);
   current = obj.total;
   previous = banDoc.table("Accounts").findRowByValue("Group", "TADPI").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("Avanzo/disavanzo d’esercizio prima delle imposte (+/-)", "alignRight", 5);
   tableRow.addCell(formatValue(current), "alignRight", 1);
   tableRow.addCell(formatValue(previous), "alignRight", 1);

   /* Row 46 */
   obj = banDoc.currentBalance("Gr=IM", startDate, endDate);
   current = obj.total;
   previous = banDoc.table("Accounts").findRowByValue("Group", "IM").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("Imposte", "alignRight", 5);
   tableRow.addCell(formatValue(current), "alignRight", 1);
   tableRow.addCell(formatValue(previous), "alignRight", 1);

   /* Row 47 */
   obj = banDoc.currentBalance("Gr=TADES", startDate, endDate);
   current = obj.total;
   previous = banDoc.table("Accounts").findRowByValue("Group", "TADES").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("Avanzo/disavanzo d’esercizio prima di investimenti e disinvestimenti patrimoniali, e finanziamenti (+/-)", "alignRight", 5);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(currentR)), "alignRight", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previousR)), "alignRight", 1);




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
   
   var obj = "";
   var current = "";
   var previous = "";   
   var objC = "";
   var currentC = "";
   var previousC = "";
   var objR = "";
   var currentR = "";
   var previousR = "";
   var totCurrentC = "";
   var totPreviousC = "";
   var totCurrentR = "";
   var totPreviousR = "";

   tableRow = table.addRow();
   tableRow.addCell("Uscite da investimenti in immobilizzazioni o da deflussi di capitale di terzi", "styleTableHeader", 1);
   tableRow.addCell(Banana.Converter.toLocaleDateFormat(endDate), "styleTableHeader alignCenter", 1);
   tableRow.addCell("31.12." + previousYear, "styleTableHeader alignCenter", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("Entrate da disinvestimenti in immobilizzazioni o da flussi di capitale di terzi", "styleTableHeader", 1);
   tableRow.addCell(Banana.Converter.toLocaleDateFormat(endDate), "styleTableHeader alignCenter", 1);
   tableRow.addCell("31.12." + previousYear, "styleTableHeader alignCenter", 1);

   /* Row 1 */
   objC = banDoc.currentBalance("Gr=CF1", startDate, endDate);
   currentC = objC.total;
   previousC = banDoc.table("Accounts").findRowByValue("Group", "CF1").value("Prior");
   objR = banDoc.currentBalance("Gr=RF1", startDate, endDate);
   currentR = objR.total;
   previousR = banDoc.table("Accounts").findRowByValue("Group", "RF1").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("1) Investimenti in immobilizzazioni inerenti alle attività di interesse generale", "alignLeft", 1);
   tableRow.addCell(formatValue(currentC), "alignRight", 1);
   tableRow.addCell(formatValue(previousC), "alignRight", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("1) Disinvestimenti di immobilizzazioni inerenti alle attività di interesse generale", "alignLeft", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(currentR)), "alignRight", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previousR)), "alignRight", 1);

   /* Row 2 */
   objC = banDoc.currentBalance("Gr=CF2", startDate, endDate);
   currentC = objC.total;
   previousC = banDoc.table("Accounts").findRowByValue("Group", "CF2").value("Prior");
   objR = banDoc.currentBalance("Gr=RF2", startDate, endDate);
   currentR = objR.total;
   previousR = banDoc.table("Accounts").findRowByValue("Group", "RF2").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("2) Investimenti in immobilizzazioni inerenti alle attività diverse", "alignLeft", 1);
   tableRow.addCell(formatValue(currentC), "alignRight", 1);
   tableRow.addCell(formatValue(previousC), "alignRight", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("2) Disinvestimenti di immobilizzazioni inerenti alle attività diverse", "alignLeft", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(currentR)), "alignRight", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previousR)), "alignRight", 1);

   /* Row 3 */
   objC = banDoc.currentBalance("Gr=CF3", startDate, endDate);
   currentC = objC.total;
   previousC = banDoc.table("Accounts").findRowByValue("Group", "CF3").value("Prior");
   objR = banDoc.currentBalance("Gr=RF3", startDate, endDate);
   currentR = objR.total;
   previousR = banDoc.table("Accounts").findRowByValue("Group", "RF3").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("3) Investimenti in attività finanziarie e patrimoniali", "alignLeft", 1);
   tableRow.addCell(formatValue(currentC), "alignRight", 1);
   tableRow.addCell(formatValue(previousC), "alignRight", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("3) Disinvestimenti di attività finanziarie e patrimoniali", "alignLeft", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(currentR)), "alignRight", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previousR)), "alignRight", 1);

   /* Row 4 */
   objC = banDoc.currentBalance("Gr=CF4", startDate, endDate);
   currentC = objC.total;
   previousC = banDoc.table("Accounts").findRowByValue("Group", "CF4").value("Prior");
   objR = banDoc.currentBalance("Gr=RF4", startDate, endDate);
   currentR = objR.total;
   previousR = banDoc.table("Accounts").findRowByValue("Group", "RF4").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("4) Rimborso di finanziamenti per quota capitale e di prestiti", "alignLeft", 1);
   tableRow.addCell(formatValue(currentC), "alignRight", 1);
   tableRow.addCell(formatValue(previousC), "alignRight", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("4) Ricevimento di finanziamenti e di prestiti", "alignLeft", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(currentR)), "alignRight", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previousR)), "alignRight", 1);

   /* Row 5, tot */
   objC = banDoc.currentBalance("Gr=CF", startDate, endDate);
   currentC = objC.total;
   previousC = banDoc.table("Accounts").findRowByValue("Group", "CF").value("Prior");
   objR = banDoc.currentBalance("Gr=RF", startDate, endDate);
   currentR = objR.total;
   previousR = banDoc.table("Accounts").findRowByValue("Group", "RF").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("Totale", "alignRight", 1);
   tableRow.addCell(formatValue(currentC), "alignRight", 1);
   tableRow.addCell(formatValue(previousC), "alignRight", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("Totale", "alignRight", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(currentR)), "alignRight", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previousR)), "alignRight", 1);
   
   /* Row 6 */
   obj = banDoc.currentBalance("Gr=IMRC", startDate, endDate);
   current = obj.total;
   previous = banDoc.table("Accounts").findRowByValue("Group", "IMRC").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("Imposte", "alignRight", 5);
   tableRow.addCell(formatValue(current), "alignRight", 1);
   tableRow.addCell(formatValue(previous), "alignRight", 1);

   /* Row 7 */
   obj = banDoc.currentBalance("Gr=RF-CF", startDate, endDate);
   current = obj.total;
   previous = banDoc.table("Accounts").findRowByValue("Group", "RF-CF").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("Avanzo/disavanzo da entrate e uscite per investimenti e disinvestimenti patrimoniali e finanziamenti (+/-)", "alignRight", 5);
   tableRow.addCell(formatValue(current), "alignRight", 1);
   tableRow.addCell(formatValue(previous), "alignRight", 1);


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
   
   var obj = "";
   var current = "";
   var previous = "";


   tableRow = table.addRow();
   tableRow.addCell("", "styleTableHeader", 5);
   tableRow.addCell(Banana.Converter.toLocaleDateFormat(endDate), "styleTableHeader alignCenter", 1);
   tableRow.addCell("31.12." + previousYear, "styleTableHeader alignCenter", 1);

   /* Row 1 */
   obj = banDoc.currentBalance("Gr=TADES", startDate, endDate);
   current = obj.total;
   previous = banDoc.table("Accounts").findRowByValue("Group", "TADES").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("Avanzo/disavanzo d’esercizio prima di investimenti e disinvestimenti patrimoniali e finanziamenti (+/-)", "", 5);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(current)), "alignRight", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previous)), "alignRight", 1);

   /* Row 2 */
   obj = banDoc.currentBalance("Gr=RF-CF", startDate, endDate);
   current = obj.total;
   previous = banDoc.table("Accounts").findRowByValue("Group", "RF-CF").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("Avanzo/disavanzo da entrate e uscite per investimenti e disinvestimenti patrimoniali e finanziamenti (+/-)", "", 5);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(current)), "alignRight", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previous)), "alignRight", 1);

   /* Row 3 */
   obj = banDoc.currentBalance("Gr=TADRC", startDate, endDate);
   current = obj.total;
   previous = banDoc.table("Accounts").findRowByValue("Group", "TADRC").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("Avanzo/disavanzo complessivo (+/-)", "", 5);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(current)), "alignRight", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previous)), "alignRight", 1);



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
   
   var obj = "";
   var current = "";
   var previous = "";

   tableRow = table.addRow();
   tableRow.addCell("Cassa e banca", "styleTableHeader", 5);
   tableRow.addCell(Banana.Converter.toLocaleDateFormat(endDate), "styleTableHeader alignCenter", 1);
   tableRow.addCell("31.12." + previousYear, "styleTableHeader alignCenter", 1);

   /* Row 1 */
   obj = banDoc.currentBalance("Gr=ACIV3", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "ACIV3").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("Cassa", "", 5);
   tableRow.addCell(formatValue(current), "alignRight", 1);
   tableRow.addCell(formatValue(previous), "alignRight", 1);

   /* Row 2 */
   obj = banDoc.currentBalance("Gr=ACIV1", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "ACIV1").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("Depositi bancari e postali", "", 5);
   tableRow.addCell(formatValue(current), "alignRight", 1);
   tableRow.addCell(formatValue(previous), "alignRight", 1);



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
   
   var obj = "";
   var current = "";
   var previous = "";   
   var objC = "";
   var currentC = "";
   var previousC = "";
   var objR = "";
   var currentR = "";
   var previousR = "";
   var totCurrentC = "";
   var totPreviousC = "";
   var totCurrentR = "";
   var totPreviousR = "";

   tableRow = table.addRow();
   tableRow.addCell("Costi figurativi", "styleTableHeader", 1);
   tableRow.addCell(Banana.Converter.toLocaleDateFormat(endDate), "styleTableHeader alignCenter", 1);
   tableRow.addCell("31.12." + previousYear, "styleTableHeader alignCenter", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("Proventi figurativi", "styleTableHeader", 1);
   tableRow.addCell(Banana.Converter.toLocaleDateFormat(endDate), "styleTableHeader alignCenter", 1);
   tableRow.addCell("31.12." + previousYear, "styleTableHeader alignCenter", 1);

   /* Row 1 */
   objC = banDoc.currentBalance("Gr=CG1", startDate, endDate);
   currentC = objC.total;
   previousC = banDoc.table("Accounts").findRowByValue("Group", "CG1").value("Prior");
   objR = banDoc.currentBalance("Gr=RG1", startDate, endDate);
   currentR = objR.total;
   previousR = banDoc.table("Accounts").findRowByValue("Group", "RG1").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("1) da attività di interesse generale", "alignLeft", 1);
   tableRow.addCell(formatValue(currentC), "alignRight", 1);
   tableRow.addCell(formatValue(previousC), "alignRight", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("1) da attività di interesse generale", "alignLeft", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(currentR)), "alignRight", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previousR)), "alignRight", 1);

   /* Row 2 */
   objC = banDoc.currentBalance("Gr=CG2", startDate, endDate);
   currentC = objC.total;
   previousC = banDoc.table("Accounts").findRowByValue("Group", "CG2").value("Prior");
   objR = banDoc.currentBalance("Gr=RG2", startDate, endDate);
   currentR = objR.total;
   previousR = banDoc.table("Accounts").findRowByValue("Group", "RG2").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("2) da attività diverse", "alignLeft", 1);
   tableRow.addCell(formatValue(currentC), "alignRight", 1);
   tableRow.addCell(formatValue(previousC), "alignRight", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("2) da attività diverse", "alignLeft", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(currentR)), "alignRight", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previousR)), "alignRight", 1);

   /* Row 3, tot */
   objC = banDoc.currentBalance("Gr=CG", startDate, endDate);
   currentC = objC.total;
   previousC = banDoc.table("Accounts").findRowByValue("Group", "CG").value("Prior");
   objR = banDoc.currentBalance("Gr=RG", startDate, endDate);
   currentR = objR.total;
   previousR = banDoc.table("Accounts").findRowByValue("Group", "RG").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("Totale", "alignRight", 1);
   tableRow.addCell(formatValue(currentC), "alignRight", 1);
   tableRow.addCell(formatValue(previousC), "alignRight", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("Totale", "alignRight", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(currentR)), "alignRight", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previousR)), "alignRight", 1);



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
   currentParam.name = 'title';
   currentParam.title = 'Titolo';
   currentParam.type = 'string';
   currentParam.value = userParam.title ? userParam.title : '';
   currentParam.defaultvalue = '';
   currentParam.readValue = function() {
      userParam.title = this.value;
   }
   convertedParam.data.push(currentParam);

   return convertedParam;
}

function initUserParam() {
   var userParam = {};
   userParam.title = "";
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
   var scriptform = initUserParam();
   var savedParam = Banana.document.getScriptSettings();
   if (savedParam && savedParam.length > 0) {
      scriptform = JSON.parse(savedParam);
   }

   //We take the accounting "starting date" and "ending date" from the document. These will be used as default dates
   var docStartDate = Banana.document.startPeriod();
   var docEndDate = Banana.document.endPeriod();

   //A dialog window is opened asking the user to insert the desired period. By default is the accounting period
   var selectedDates = Banana.Ui.getPeriod('', docStartDate, docEndDate,
      scriptform.selectionStartDate, scriptform.selectionEndDate, scriptform.selectionChecked);

   //We take the values entered by the user and save them as "new default" values.
   //This because the next time the script will be executed, the dialog window will contains the new values.
   if (selectedDates) {
      scriptform["selectionStartDate"] = selectedDates.startDate;
      scriptform["selectionEndDate"] = selectedDates.endDate;
      scriptform["selectionChecked"] = selectedDates.hasSelection;
   } else {
      //User clicked cancel
      return null;
   }

   scriptform = parametersDialog(scriptform); // From propertiess
   if (scriptform) {
      var paramToString = JSON.stringify(scriptform);
      Banana.document.setScriptSettings(paramToString);
   }

   return scriptform;
}

