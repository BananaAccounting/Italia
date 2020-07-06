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
// @pubdate = 2020-07-06
// @publisher = Banana.ch SA
// @description = Rendiconto gestionale (MOD. B)
// @task = app.command
// @doctype = 100.100
// @docproperties = 
// @outputformat = none
// @inputdatasource = none
// @timeout = -1


/*

   Stampa del 'Rendiconto gestionale (MOD. B)' secondo nuovi schemi per il terzo settore.

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


   var report = printRendicontoModB(Banana.document, userParam);
   var stylesheet = Banana.Report.newStyleSheet();
   setCss(Banana.document, stylesheet, userParam);

   Banana.Report.preview(report, stylesheet);
}

function printRendicontoModB(banDoc, userParam) {

   var report = Banana.Report.newReport("Rendiconto gestionale (MOD. B)");
   var startDate = userParam.selectionStartDate;
   var endDate = userParam.selectionEndDate;
   var currentYear = Banana.Converter.toDate(banDoc.info("AccountingDataBase", "OpeningDate")).getFullYear();
   var previousYear = currentYear - 1;

   var title = "";
   if (userParam.title) {
      title = userParam.title;
   } else {
      title = banDoc.info("Base", "HeaderLeft") + " - " + "RENDICONTO GESTIONALE (MOD. B) ANNO " + currentYear;
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
   tableRow.addCell("ONERI E COSTI", "styleTableHeader", 1);
   tableRow.addCell(Banana.Converter.toLocaleDateFormat(startDate), "styleTableHeader alignRight", 1);
   tableRow.addCell("31.12." + previousYear, "styleTableHeader alignRight", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("PROVENTI E RICAVI", "styleTableHeader", 1);
   tableRow.addCell(Banana.Converter.toLocaleDateFormat(startDate), "styleTableHeader alignRight", 1);
   tableRow.addCell("31.12." + previousYear, "styleTableHeader alignRight", 1);

   /* Row 1 */   
   tableRow = table.addRow();
   tableRow.addCell("A) Costi e oneri da attività di interesse generale", "alignLeft bold", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("A) Ricavi, rendite e proventi da attività di interesse generale", "alignLeft bold", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);

   /* Row 2*/
   objR = banDoc.currentBalance("Gr=RA1", startDate, endDate);
   currentR = objR.balance;
   previousR = banDoc.table("Accounts").findRowByValue("Group", "RA1").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("1) Proventi da quote associative e apporti dei fondatori", "alignLeft", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(currentR)), "alignRight", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previousR)), "alignRight", 1);

   /* Row 3 */
   objC = banDoc.currentBalance("Gr=CA1", startDate, endDate);
   currentC = objC.balance;
   previousC = banDoc.table("Accounts").findRowByValue("Group", "CA1").value("Prior");
   objR = banDoc.currentBalance("Gr=RA2", startDate, endDate);
   currentR = objR.balance;
   previousR = banDoc.table("Accounts").findRowByValue("Group", "RA2").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("1) Materie prime, sussidiarie, di consumo e di merci", "alignLeft", 1);
   tableRow.addCell(formatValue(currentC), "alignRight", 1);
   tableRow.addCell(formatValue(previousC), "alignRight", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("2) Proventi dagli associati per attività mutuali", "alignLeft", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(currentR)), "alignRight", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previousR)), "alignRight", 1);

   /* Row 4 */
   objC = banDoc.currentBalance("Gr=CA2", startDate, endDate);
   currentC = objC.balance;
   previousC = banDoc.table("Accounts").findRowByValue("Group", "CA2").value("Prior");
   objR = banDoc.currentBalance("Gr=RA3", startDate, endDate);
   currentR = objR.balance;
   previousR = banDoc.table("Accounts").findRowByValue("Group", "RA3").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("2) Servizi", "alignLeft", 1);
   tableRow.addCell(formatValue(currentC), "alignRight", 1);
   tableRow.addCell(formatValue(previousC), "alignRight", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("3) Ricavi per prestazioni e cessioni ad associati e fondatori", "alignLeft", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(currentR)), "alignRight", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previousR)), "alignRight", 1);

   /* Row 5 */
   objR = banDoc.currentBalance("Gr=RA4", startDate, endDate);
   currentR = objR.balance;
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
   currentC = objC.balance;
   previousC = banDoc.table("Accounts").findRowByValue("Group", "CA3").value("Prior");
   objR = banDoc.currentBalance("Gr=RA5", startDate, endDate);
   currentR = objR.balance;
   previousR = banDoc.table("Accounts").findRowByValue("Group", "RA5").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("3) Godimento beni di terzi", "alignLeft", 1);
   tableRow.addCell(formatValue(currentC), "alignRight", 1);
   tableRow.addCell(formatValue(previousC), "alignRight", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("5) Proventi del 5 per mille", "alignLeft", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(currentR)), "alignRight", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previousR)), "alignRight", 1);

   /* Row 7 */
   objC = banDoc.currentBalance("Gr=CA4", startDate, endDate);
   currentC = objC.balance;
   previousC = banDoc.table("Accounts").findRowByValue("Group", "CA4").value("Prior");
   objR = banDoc.currentBalance("Gr=RA6", startDate, endDate);
   currentR = objR.balance;
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
   currentR = objR.balance;
   previousR = banDoc.table("Accounts").findRowByValue("Group", "RA7").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("7) Ricavi per prestazioni e cessioni a terzi", "alignLeft", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(currentR)), "alignRight", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previousR)), "alignRight", 1);

   /* Row 9 */
   objC = banDoc.currentBalance("Gr=CA5", startDate, endDate);
   currentC = objC.balance;
   previousC = banDoc.table("Accounts").findRowByValue("Group", "CA5").value("Prior");
   objR = banDoc.currentBalance("Gr=RA8", startDate, endDate);
   currentR = objR.balance;
   previousR = banDoc.table("Accounts").findRowByValue("Group", "RA8").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("5) Ammortamenti", "alignLeft", 1);
   tableRow.addCell(formatValue(currentC), "alignRight", 1);
   tableRow.addCell(formatValue(previousC), "alignRight", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("8) Contributi da enti pubblici", "alignLeft", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(currentR)), "alignRight", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previousR)), "alignRight", 1);

   /* Row 10 */
   objC = banDoc.currentBalance("Gr=CA6", startDate, endDate);
   currentC = objC.balance;
   previousC = banDoc.table("Accounts").findRowByValue("Group", "CA6").value("Prior");
   objR = banDoc.currentBalance("Gr=RA9", startDate, endDate);
   currentR = objR.balance;
   previousR = banDoc.table("Accounts").findRowByValue("Group", "RA9").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("6) Accantonamenti per rischi ed oneri", "alignLeft", 1);
   tableRow.addCell(formatValue(currentC), "alignRight", 1);
   tableRow.addCell(formatValue(previousC), "alignRight", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("9) Proventi da contratti con enti pubblici", "alignLeft", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(currentR)), "alignRight", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previousR)), "alignRight", 1);

   /* Row 11 */
   objC = banDoc.currentBalance("Gr=CA7", startDate, endDate);
   currentC = objC.balance;
   previousC = banDoc.table("Accounts").findRowByValue("Group", "CA7").value("Prior");
   objR = banDoc.currentBalance("Gr=RA10", startDate, endDate);
   currentR = objR.balance;
   previousR = banDoc.table("Accounts").findRowByValue("Group", "RA10").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("7) Oneri diversi di gestione", "alignLeft", 1);
   tableRow.addCell(formatValue(currentC), "alignRight", 1);
   tableRow.addCell(formatValue(previousC), "alignRight", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("10) Altri ricavi, rendite e proventi", "alignLeft", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(currentR)), "alignRight", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previousR)), "alignRight", 1);

   /* Row 12 */
   objC = banDoc.currentBalance("Gr=CA8", startDate, endDate);
   currentC = objC.balance;
   previousC = banDoc.table("Accounts").findRowByValue("Group", "CA8").value("Prior");
   objR = banDoc.currentBalance("Gr=RA11", startDate, endDate);
   currentR = objR.balance;
   previousR = banDoc.table("Accounts").findRowByValue("Group", "RA11").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("8) Rimanenze iniziali", "alignLeft", 1);
   tableRow.addCell(formatValue(currentC), "alignRight", 1);
   tableRow.addCell(formatValue(previousC), "alignRight", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("11) Rimanenze finali", "alignLeft", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(currentR)), "alignRight", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previousR)), "alignRight", 1);

   /* Row 13, tot */
   objC = banDoc.currentBalance("Gr=CA", startDate, endDate);
   currentC = objC.balance;
   previousC = banDoc.table("Accounts").findRowByValue("Group", "CA").value("Prior");
   objR = banDoc.currentBalance("Gr=RA", startDate, endDate);
   currentR = objR.balance;
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

   /* Row 14, +/- */
   obj = banDoc.currentBalance("Gr=RA-CA", startDate, endDate);
   current = objR.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "RA-CA").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("Avanzo/disavanzo attività di interesse generale (+/-)", "alignRight", 1);
   tableRow.addCell(formatValue(current), "alignRight", 1);
   tableRow.addCell(formatValue(previous), "alignRight", 1);

   /* Row 15 */
   tableRow = table.addRow();
   tableRow.addCell("B) Costi e oneri da attività diverse", "alignLeft bold", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("B) Ricavi, rendite e proventi da attività diverse", "alignLeft bold", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);

   /* Row 16 */
   tableRow = table.addRow();
   objC = banDoc.currentBalance("Gr=CB1", startDate, endDate);
   currentC = objC.balance;
   previousC = banDoc.table("Accounts").findRowByValue("Group", "CB1").value("Prior");
   objR = banDoc.currentBalance("Gr=RB1", startDate, endDate);
   currentR = objR.balance;
   previousR = banDoc.table("Accounts").findRowByValue("Group", "RB1").value("Prior");
   tableRow.addCell("1) Materie prime, sussidiarie, di consumo e di merci", "alignLeft", 1);
   tableRow.addCell(formatValue(currentC), "alignRight", 1);
   tableRow.addCell(formatValue(previousC), "alignRight", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("1) Ricavi per prestazioni e cessioni ad associati e fondatori", "alignLeft", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(currentR)), "alignRight", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previousR)), "alignRight", 1);

   /* Row 17 */
   objC = banDoc.currentBalance("Gr=CB2", startDate, endDate);
   currentC = objC.balance;
   previousC = banDoc.table("Accounts").findRowByValue("Group", "CB2").value("Prior");
   objR = banDoc.currentBalance("Gr=RB2", startDate, endDate);
   currentR = objR.balance;
   previousR = banDoc.table("Accounts").findRowByValue("Group", "RB2").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("2) Servizi", "alignLeft", 1);
   tableRow.addCell(formatValue(currentC), "alignRight", 1);
   tableRow.addCell(formatValue(previousC), "alignRight", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("2) Contributi da soggetti privati", "alignLeft", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(currentR)), "alignRight", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previousR)), "alignRight", 1);

   /* Row 18 */
   objC = banDoc.currentBalance("Gr=CB3", startDate, endDate);
   currentC = objC.balance;
   previousC = banDoc.table("Accounts").findRowByValue("Group", "CB3").value("Prior");
   objR = banDoc.currentBalance("Gr=RB3", startDate, endDate);
   currentR = objR.balance;
   previousR = banDoc.table("Accounts").findRowByValue("Group", "RB3").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("3) Godimento beni di terzi", "alignLeft", 1);
   tableRow.addCell(formatValue(currentC), "alignRight", 1);
   tableRow.addCell(formatValue(previousC), "alignRight", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("3) Ricavi per prestazioni e cessioni a terzi", "alignLeft", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(currentR)), "alignRight", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previousR)), "alignRight", 1);

   /* Row 19 */
   objC = banDoc.currentBalance("Gr=CB4", startDate, endDate);
   currentC = objC.balance;
   previousC = banDoc.table("Accounts").findRowByValue("Group", "CB4").value("Prior");
   objR = banDoc.currentBalance("Gr=RB4", startDate, endDate);
   currentR = objR.balance;
   previousR = banDoc.table("Accounts").findRowByValue("Group", "RB4").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("4) Personale", "alignLeft", 1);
   tableRow.addCell(formatValue(currentC), "alignRight", 1);
   tableRow.addCell(formatValue(previousC), "alignRight", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("4) Contributi da enti pubblici", "alignLeft", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(currentR)), "alignRight", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previousR)), "alignRight", 1);

   /* Row 20 */
   objC = banDoc.currentBalance("Gr=CB5", startDate, endDate);
   currentC = objC.balance;
   previousC = banDoc.table("Accounts").findRowByValue("Group", "CB5").value("Prior");
   objR = banDoc.currentBalance("Gr=RB5", startDate, endDate);
   currentR = objR.balance;
   previousR = banDoc.table("Accounts").findRowByValue("Group", "RB5").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("5) Ammortamenti", "alignLeft", 1);
   tableRow.addCell(formatValue(currentC), "alignRight", 1);
   tableRow.addCell(formatValue(previousC), "alignRight", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("5) Proventi da contratti con enti pubblici", "alignLeft", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(currentR)), "alignRight", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previousR)), "alignRight", 1);

   /* Row 21 */
   objC = banDoc.currentBalance("Gr=CB6", startDate, endDate);
   currentC = objC.balance;
   previousC = banDoc.table("Accounts").findRowByValue("Group", "CB6").value("Prior");
   objR = banDoc.currentBalance("Gr=RB6", startDate, endDate);
   currentR = objR.balance;
   previousR = banDoc.table("Accounts").findRowByValue("Group", "RB6").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("6) Accantonamenti per rischi ed oneri", "alignLeft", 1);
   tableRow.addCell(formatValue(currentC), "alignRight", 1);
   tableRow.addCell(formatValue(previousC), "alignRight", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("6) Altri ricavi, rendite e proventi", "alignLeft", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(currentR)), "alignRight", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previousR)), "alignRight", 1);

   /* Row 22 */
   objC = banDoc.currentBalance("Gr=CB7", startDate, endDate);
   currentC = objC.balance;
   previousC = banDoc.table("Accounts").findRowByValue("Group", "CB7").value("Prior");
   objR = banDoc.currentBalance("Gr=RB7", startDate, endDate);
   currentR = objR.balance;
   previousR = banDoc.table("Accounts").findRowByValue("Group", "RB7").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("7) Oneri diversi di gestione", "alignLeft", 1);
   tableRow.addCell(formatValue(currentC), "alignRight", 1);
   tableRow.addCell(formatValue(previousC), "alignRight", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("7) Rimanenze finali", "alignLeft", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(currentR)), "alignRight", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previousR)), "alignRight", 1);

   /* Row 23 */
   objC = banDoc.currentBalance("Gr=CB8", startDate, endDate);
   currentC = objC.balance;
   previousC = banDoc.table("Accounts").findRowByValue("Group", "CB8").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("8) Rimanenze iniziali", "alignLeft", 1);
   tableRow.addCell(formatValue(currentC), "alignRight", 1);
   tableRow.addCell(formatValue(previousC), "alignRight", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);

   /* Row 24, tot */
   objC = banDoc.currentBalance("Gr=CB", startDate, endDate);
   currentC = objC.balance;
   previousC = banDoc.table("Accounts").findRowByValue("Group", "CB").value("Prior");
   objR = banDoc.currentBalance("Gr=RB", startDate, endDate);
   currentR = objR.balance;
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

   /* Row 25, +/- */
   obj = banDoc.currentBalance("Gr=RB-CB", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "RB-CB").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("Avanzo/disavanzo attività diverse (+/-)", "alignRight", 1);
   tableRow.addCell(formatValue(current), "alignRight", 1);
   tableRow.addCell(formatValue(previous), "alignRight", 1);

   /* Row 26 */
   tableRow = table.addRow();
   tableRow.addCell("C) Costi e oneri da attività di raccolta fondi", "alignLeft bold", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("C) Ricavi, rendite e proventi da attività di raccolta fondi", "alignLeft bold", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);

   /* Row 27 */
   objC = banDoc.currentBalance("Gr=CC1", startDate, endDate);
   currentC = objC.balance;
   previousC = banDoc.table("Accounts").findRowByValue("Group", "CC1").value("Prior");
   objR = banDoc.currentBalance("Gr=RC1", startDate, endDate);
   currentR = objR.balance;
   previousR = banDoc.table("Accounts").findRowByValue("Group", "RC1").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("1) Oneri per raccolte fondi abituali", "alignLeft", 1);
   tableRow.addCell(formatValue(currentC), "alignRight", 1);
   tableRow.addCell(formatValue(previousC), "alignRight", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("1) Proventi da raccolte fondi abituali", "alignLeft", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(currentR)), "alignRight", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previousR)), "alignRight", 1);

   /* Row 28 */
   objC = banDoc.currentBalance("Gr=CC2", startDate, endDate);
   currentC = objC.balance;
   previousC = banDoc.table("Accounts").findRowByValue("Group", "CC2").value("Prior");
   objR = banDoc.currentBalance("Gr=RC2", startDate, endDate);
   currentR = objR.balance;
   previousR = banDoc.table("Accounts").findRowByValue("Group", "RC2").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("2) Oneri per raccolte fondi occasionali", "alignLeft", 1);
   tableRow.addCell(formatValue(currentC), "alignRight", 1);
   tableRow.addCell(formatValue(previousC), "alignRight", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("2) Proventi da raccolte fondi occasionali", "alignLeft", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(currentR)), "alignRight", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previousR)), "alignRight", 1);

   /* Row 29 */
   objC = banDoc.currentBalance("Gr=CC3", startDate, endDate);
   currentC = objC.balance;
   previousC = banDoc.table("Accounts").findRowByValue("Group", "CC3").value("Prior");
   objR = banDoc.currentBalance("Gr=RC3", startDate, endDate);
   currentR = objR.balance;
   previousR = banDoc.table("Accounts").findRowByValue("Group", "RC3").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("3) Altri oneri", "alignLeft", 1);
   tableRow.addCell(formatValue(currentC), "alignRight", 1);
   tableRow.addCell(formatValue(previousC), "alignRight", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("3) Altri proventi", "alignLeft", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(currentR)), "alignRight", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previousR)), "alignRight", 1);

   /* Row 30, tot */
   objC = banDoc.currentBalance("Gr=CC", startDate, endDate);
   currentC = objC.balance;
   previousC = banDoc.table("Accounts").findRowByValue("Group", "CC").value("Prior");
   objR = banDoc.currentBalance("Gr=RC", startDate, endDate);
   currentR = objR.balance;
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

   /* Row 31, +/- */
   obj = banDoc.currentBalance("Gr=RC-CC", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "RC-CC").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("Avanzo/disavanzo attività di raccolta fondi", "alignRight", 1);
   tableRow.addCell(formatValue(current), "alignRight", 1);
   tableRow.addCell(formatValue(previous), "alignRight", 1);

   /* Row 32 */
   tableRow = table.addRow();
   tableRow.addCell("D) Costi e oneri da attività finanziarie e patrimoniali", "alignLeft bold", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("D) Ricavi, rendite e proventi da attività finanziarie e patrimoniali", "alignLeft bold", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);

   /* Row 33 */
   objC = banDoc.currentBalance("Gr=CD1", startDate, endDate);
   currentC = objC.balance;
   previousC = banDoc.table("Accounts").findRowByValue("Group", "CD1").value("Prior");
   objR = banDoc.currentBalance("Gr=RD1", startDate, endDate);
   currentR = objR.balance;
   previousR = banDoc.table("Accounts").findRowByValue("Group", "RD1").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("1) Su rapporti bancari", "alignLeft", 1);
   tableRow.addCell(formatValue(currentC), "alignRight", 1);
   tableRow.addCell(formatValue(previousC), "alignRight", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("1) Da rapporti bancari", "alignLeft", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(currentR)), "alignRight", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previousR)), "alignRight", 1);

   /* Row 34 */
   objC = banDoc.currentBalance("Gr=CD2", startDate, endDate);
   currentC = objC.balance;
   previousC = banDoc.table("Accounts").findRowByValue("Group", "CD2").value("Prior");
   objR = banDoc.currentBalance("Gr=RD2", startDate, endDate);
   currentR = objR.balance;
   previousR = banDoc.table("Accounts").findRowByValue("Group", "RD2").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("2) Su prestiti", "alignLeft", 1);
   tableRow.addCell(formatValue(currentC), "alignRight", 1);
   tableRow.addCell(formatValue(previousC), "alignRight", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("2) Da altri investimenti finanziari", "alignLeft", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(currentR)), "alignRight", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previousR)), "alignRight", 1);

   /* Row 35 */
   objC = banDoc.currentBalance("Gr=CD3", startDate, endDate);
   currentC = objC.balance;
   previousC = banDoc.table("Accounts").findRowByValue("Group", "CD3").value("Prior");
   objR = banDoc.currentBalance("Gr=RD3", startDate, endDate);
   currentR = objR.balance;
   previousR = banDoc.table("Accounts").findRowByValue("Group", "RD3").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("3) Da patrimonio edilizio", "alignLeft", 1);
   tableRow.addCell(formatValue(currentC), "alignRight", 1);
   tableRow.addCell(formatValue(previousC), "alignRight", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("3) Da patrimonio edilizio", "alignLeft", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(currentR)), "alignRight", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previousR)), "alignRight", 1);

   /* Row 36 */
   objC = banDoc.currentBalance("Gr=CD4", startDate, endDate);
   currentC = objC.balance;
   previousC = banDoc.table("Accounts").findRowByValue("Group", "CD4").value("Prior");
   objR = banDoc.currentBalance("Gr=RD4", startDate, endDate);
   currentR = objR.balance;
   previousR = banDoc.table("Accounts").findRowByValue("Group", "RD4").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("4) Da altri beni patrimoniali", "alignLeft", 1);
   tableRow.addCell(formatValue(currentC), "alignRight", 1);
   tableRow.addCell(formatValue(previousC), "alignRight", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("4) Da altri beni patrimoniali", "alignLeft", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(currentR)), "alignRight", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previousR)), "alignRight", 1);

   /* Row 37 */
   objC = banDoc.currentBalance("Gr=CD5", startDate, endDate);
   currentC = objC.balance;
   previousC = banDoc.table("Accounts").findRowByValue("Group", "CD5").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("5) Accantonamenti per rischi ed oneri", "alignLeft", 1);
   tableRow.addCell(formatValue(currentC), "alignRight", 1);
   tableRow.addCell(formatValue(previousC), "alignRight", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);

   /* Row 38 */
   objC = banDoc.currentBalance("Gr=CD6", startDate, endDate);
   currentC = objC.balance;
   previousC = banDoc.table("Accounts").findRowByValue("Group", "CD6").value("Prior");
   objR = banDoc.currentBalance("Gr=RD5", startDate, endDate);
   currentR = objR.balance;
   previousR = banDoc.table("Accounts").findRowByValue("Group", "RD5").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("6) Altri oneri", "alignLeft", 1);
   tableRow.addCell(formatValue(currentC), "alignRight", 1);
   tableRow.addCell(formatValue(previousC), "alignRight", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("5) Altri proventi", "alignLeft", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(currentR)), "alignRight", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previousR)), "alignRight", 1);

   /* Row 39, tot */
   objC = banDoc.currentBalance("Gr=CD", startDate, endDate);
   currentC = objC.balance;
   previousC = banDoc.table("Accounts").findRowByValue("Group", "CD").value("Prior");
   objR = banDoc.currentBalance("Gr=RD", startDate, endDate);
   currentR = objR.balance;
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

   /* Row 40, +/- */
   obj = banDoc.currentBalance("Gr=RD-CD", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "RD-CD").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("Avanzo/disavanzo attività finanziarie e patrimoniali (+/-)", "alignRight", 1);
   tableRow.addCell(formatValue(current), "alignRight", 1);
   tableRow.addCell(formatValue(previous), "alignRight", 1);

   /* Row 41 */
   tableRow = table.addRow();
   tableRow.addCell("E) Costi e oneri di supporto generale", "alignLeft bold", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("E) Proventi di supporto generale", "alignLeft bold", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);

   /* Row 42 */
   objC = banDoc.currentBalance("Gr=CE1", startDate, endDate);
   currentC = objC.balance;
   previousC = banDoc.table("Accounts").findRowByValue("Group", "CE1").value("Prior");
   objR = banDoc.currentBalance("Gr=RE1", startDate, endDate);
   currentR = objR.balance;
   previousR = banDoc.table("Accounts").findRowByValue("Group", "RE1").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("1) Materie prime, sussidiarie, di consumo e di merci", "alignLeft", 1);
   tableRow.addCell(formatValue(currentC), "alignRight", 1);
   tableRow.addCell(formatValue(previousC), "alignRight", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("1) Proventi da distacco del personale", "alignLeft", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(currentR)), "alignRight", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previousR)), "alignRight", 1);

   /* Row 43 */
   objC = banDoc.currentBalance("Gr=CE2", startDate, endDate);
   currentC = objC.balance;
   previousC = banDoc.table("Accounts").findRowByValue("Group", "CE2").value("Prior");
   objR = banDoc.currentBalance("Gr=RE2", startDate, endDate);
   currentR = objR.balance;
   previousR = banDoc.table("Accounts").findRowByValue("Group", "RE2").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("2) Servizi", "alignLeft", 1);
   tableRow.addCell(formatValue(currentC), "alignRight", 1);
   tableRow.addCell(formatValue(previousC), "alignRight", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("2) Altri proventi di supporto generale", "alignLeft", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(currentR)), "alignRight", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previousR)), "alignRight", 1);

   /* Row 44 */
   objC = banDoc.currentBalance("Gr=CE3", startDate, endDate);
   currentC = objC.balance;
   previousC = banDoc.table("Accounts").findRowByValue("Group", "CE3").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("3) Godimento beni di terzi", "alignLeft", 1);
   tableRow.addCell(formatValue(currentC), "alignRight", 1);
   tableRow.addCell(formatValue(previousC), "alignRight", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);

   /* Row 45 */
   objC = banDoc.currentBalance("Gr=CE4", startDate, endDate);
   currentC = objC.balance;
   previousC = banDoc.table("Accounts").findRowByValue("Group", "CE4").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("4) Personale", "alignLeft", 1);
   tableRow.addCell(formatValue(currentC), "alignRight", 1);
   tableRow.addCell(formatValue(previousC), "alignRight", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);

   /* Row 46 */
   objC = banDoc.currentBalance("Gr=CE5", startDate, endDate);
   currentC = objC.balance;
   previousC = banDoc.table("Accounts").findRowByValue("Group", "CE5").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("5) Ammortamenti", "alignLeft", 1);
   tableRow.addCell(formatValue(currentC), "alignRight", 1);
   tableRow.addCell(formatValue(previousC), "alignRight", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);

   /* Row 47 */
   objC = banDoc.currentBalance("Gr=CE6", startDate, endDate);
   currentC = objC.balance;
   previousC = banDoc.table("Accounts").findRowByValue("Group", "CE6").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("6) Accantonamenti per rischi ed oneri", "alignLeft", 1);
   tableRow.addCell(formatValue(currentC), "alignRight", 1);
   tableRow.addCell(formatValue(previousC), "alignRight", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);

   /* Row 48 */
   objC = banDoc.currentBalance("Gr=CE7", startDate, endDate);
   currentC = objC.balance;
   previousC = banDoc.table("Accounts").findRowByValue("Group", "CE7").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("7) Altri oneri", "alignLeft", 1);
   tableRow.addCell(formatValue(currentC), "alignRight", 1);
   tableRow.addCell(formatValue(previousC), "alignRight", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);

   /* Row 49 */
   objC = banDoc.currentBalance("Gr=CE", startDate, endDate);
   currentC = objC.balance;
   previousC = banDoc.table("Accounts").findRowByValue("Group", "CE").value("Prior");
   objR = banDoc.currentBalance("Gr=RE", startDate, endDate);
   currentR = objR.balance;
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

   /* Row 50 */
   tableRow = table.addRow();
   tableRow.addCell("TOTALE ONERI E COSTI", "alignRight bold", 1);
   tableRow.addCell(formatValue(totCurrentC), "alignRight bold", 1);
   tableRow.addCell(formatValue(totPreviousC), "alignRight bold", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("TOTALE PROVENTI E RICAVI", "alignRight bold", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(totCurrentR)), "alignRight bold", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(totPreviousR)), "alignRight bold", 1);

   /* Row 51 */
   obj = banDoc.currentBalance("Gr=TADPI", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "TADPI").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("Avanzo/disavanzo d’esercizio prima delle imposte (+/-)", "alignRight", 1);
   tableRow.addCell(formatValue(current), "alignRight", 1);
   tableRow.addCell(formatValue(previous), "alignRight", 1);

   /* Row 52 */
   obj = banDoc.currentBalance("Gr=IM", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "IM").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("Imposte", "alignRight", 1);
   tableRow.addCell(formatValue(current), "alignRight", 1);
   tableRow.addCell(formatValue(previous), "alignRight", 1);

   /* Row 53 */
   obj = banDoc.currentBalance("Gr=TADES", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "TADES").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("", "", 1);
   tableRow.addCell("Avanzo/disavanzo d’esercizio (+/-)", "alignRight", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(currentR)), "alignRight", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previousR)), "alignRight", 1);




   /**************************************************************************************
   * COSTI E PROVENTI FIGURATIVI
   **************************************************************************************/

   if (userParam.costi_proventi_figurativi) {

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
      tableRow.addCell("Costi figurativi", "styleTableHeader alignCenter", 1);
      tableRow.addCell(Banana.Converter.toLocaleDateFormat(startDate), "styleTableHeader alignCenter", 1);
      tableRow.addCell("31.12." + previousYear, "styleTableHeader alignCenter", 1);
      tableRow.addCell("", "", 1);
      tableRow.addCell("Proventi figurativi", "styleTableHeader alignCenter", 1);
      tableRow.addCell(Banana.Converter.toLocaleDateFormat(startDate), "styleTableHeader alignCenter", 1);
      tableRow.addCell("31.12." + previousYear, "styleTableHeader alignCenter", 1);

      /* Row 1 */
      objC = banDoc.currentBalance("Gr=CG1", startDate, endDate);
      currentC = objC.balance;
      previousC = banDoc.table("Accounts").findRowByValue("Group", "CG1").value("Prior");
      objR = banDoc.currentBalance("Gr=RG1", startDate, endDate);
      currentR = objR.balance;
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
      currentC = objC.balance;
      previousC = banDoc.table("Accounts").findRowByValue("Group", "CG2").value("Prior");
      objR = banDoc.currentBalance("Gr=RG2", startDate, endDate);
      currentR = objR.balance;
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
      currentC = objC.balance;
      previousC = banDoc.table("Accounts").findRowByValue("Group", "CG").value("Prior");
      objR = banDoc.currentBalance("Gr=RG", startDate, endDate);
      currentR = objR.balance;
      previousR = banDoc.table("Accounts").findRowByValue("Group", "RG").value("Prior");
      tableRow = table.addRow();
      tableRow.addCell("Totale", "alignRight", 1);
      tableRow.addCell(formatValue(currentC), "alignRight", 1);
      tableRow.addCell(formatValue(previousC), "alignRight", 1);
      tableRow.addCell("", "", 1);
      tableRow.addCell("Totale", "alignRight", 1);
      tableRow.addCell(formatValue(Banana.SDecimal.invert(currentR)), "alignRight", 1);
      tableRow.addCell(formatValue(Banana.SDecimal.invert(previousR)), "alignRight", 1);

   }


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
   currentParam.name = 'title';
   currentParam.title = 'Titolo';
   currentParam.type = 'string';
   currentParam.value = userParam.title ? userParam.title : '';
   currentParam.defaultvalue = '';
   currentParam.readValue = function() {
      userParam.title = this.value;
   }
   convertedParam.data.push(currentParam);

   // var currentParam = {};
   // currentParam.name = 'costi_proventi_figurativi';
   // currentParam.title = 'Includi la stampa dei conti e proventi figurativi';
   // currentParam.type = 'bool';
   // currentParam.value = userParam.costi_proventi_figurativi ? true : false;
   // currentParam.defaultvalue = false;
   // currentParam.readValue = function() {
   //   userParam.costi_proventi_figurativi = this.value;
   // }
   // convertedParam.data.push(currentParam);

   return convertedParam;
}

function initUserParam() {
   var userParam = {};
   userParam.title = "";
   userParam.costi_proventi_figurativi = false;
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

