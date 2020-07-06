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
// @pubdate = 2020-06-23
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
// var param = {};
// var form = [];

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

   // 1. Create and load the parameters and the form
   //loadParam();
   //loadForm(Banana.document);

   // 2. Extract the data, calculate and load the balances
   //loadBalances(Banana.document);
   //preProcess(Banana.document);

   // 3. Calculate the totals
   //calcTotals(["amount"]);

   // 4. Do some operations before the format
   //postProcess();

   // 5. Format all the values
   //formatValues(["amount"]);

   // 6. Create and print the report
   // var report = printReport(Banana.document);
   // var stylesheet = createStyleSheet();

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



//NON USATO AL MOMENTO!!
function calculateCurrentBalance(banDoc, account, startDate, endDate) {

   var currentBal = banDoc.currentBalance(account, startDate, endDate);

   if (currentBal.bClass === "1") {
      return currentBal.balance;
   } else if (currentBal.bClass === "2") {
      return Banana.SDecimal.invert(currentBal.balance);
   } else if (currentBal.bClass === "3") {
      return currentBal.total;
   } else if (currentBal.bClass === "4") {
      return Banana.SDecimal.invert(currentBal.total);
   }
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

    var currentParam = {};
    currentParam.name = 'costi_proventi_figurativi';
    currentParam.title = 'Includi la stampa dei conti e proventi figurativi';
    currentParam.type = 'bool';
    currentParam.value = userParam.costi_proventi_figurativi ? true : false;
    currentParam.defaultvalue = false;
    currentParam.readValue = function() {
        userParam.costi_proventi_figurativi = this.value;
    }
    convertedParam.data.push(currentParam);

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












////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////


//Create the param object with some parameters
function loadParam() {
   param = {};
   param.grColumn = "Gr1";
   param.formatNumber = true;
   param.rounding = 2;
}


//The purpose of this function is to create and load the structure that will contains all the data used to create the report
function loadForm(banDoc) {

   form = [];
   var tipoAssociazione = "";
   try {
      tipoAssociazione = banDoc.table("TestiReport").findRowByValue("RowId", "RVENETO").value("Testo");
   } catch (e) {
      banDoc.addMessage('Tabella TestiReport "Tipo associazione" (Id "RVENETO") inesistente oppure nome non corretto.');
   }

   /** CONTO ECONOMICO **/
   //INCOME
   form.push({
      "id": "Rt",
      "description": "ENTRATE"
   });
   form.push({
      "id": "R1",
      "gr": "R1",
      "bClass": "4",
      "description": "QUOTE ASSOCIATIVE"
   });
   form.push({
      "id": "R2",
      "description": "CONTRIBUTI PER PROGETTI E/O ATTIVITÀ (art. 5 L. 266/91)",
      "sum": "R2.1;R2.2;R2.3;R2.4;R2.5;R2.6;R2.7;R2.8"
   });
   form.push({
      "id": "R2.1",
      "gr": "R2.1",
      "bClass": "4",
      "description": "da soci (specificare a quale titolo)"
   });
   form.push({
      "id": "R2.2",
      "gr": "R2.2",
      "bClass": "4",
      "description": "da non soci (specificare a quale titolo)"
   });
   form.push({
      "id": "R2.3",
      "gr": "R2.3",
      "bClass": "4",
      "description": "da CSV e Comitato di Gestione"
   });
   form.push({
      "id": "R2.4",
      "gr": "R2.4",
      "bClass": "4",
      "description": "da enti pubblici (comune, provincia, regione, stato)"
   });
   form.push({
      "id": "R2.5",
      "gr": "R2.5",
      "bClass": "4",
      "description": "da Comunità europea e da altri organismi internazionali"
   });
   form.push({
      "id": "R2.6",
      "gr": "R2.6",
      "bClass": "4",
      "description": "da altre Odv (specificare a quale titolo)"
   });
   form.push({
      "id": "R2.7",
      "gr": "R2.7",
      "bClass": "4",
      "description": "dal cinque per mille"
   });
   form.push({
      "id": "R2.8",
      "gr": "R2.8",
      "bClass": "4",
      "description": "altro (specificare)"
   });
   form.push({
      "id": "R3",
      "description": "DONAZIONI DEDUCIBILI E LASCITI TESTAMENTARI - art. 5 L.266/91",
      "sum": "R3.1;R3.2"
   });
   form.push({
      "id": "R3.1",
      "gr": "R3.1",
      "bClass": "4",
      "description": "da soci"
   });
   form.push({
      "id": "R3.2",
      "gr": "R3.2",
      "bClass": "4",
      "description": "da non soci"
   });
   form.push({
      "id": "R4",
      "gr": "R4",
      "bClass": "4",
      "description": "RIMBORSI DERIVANTI DA CONVENZIONI CON ENTI PUBBLICI - art. 5 L.266/91"
   });

   //We don't include "R5a" group if we are on the APS file
   if (tipoAssociazione !== "APS" && tipoAssociazione === "ODV") {
      form.push({
         "id": "R5a",
         "description": "ENTRATE DA ATTIVITÀ COMMERCIALI PRODUTTIVE MARGINALI(Raccolta fondi)",
         "sum": "R5.1;R5.2;R5.3"
      });
      form.push({
         "id": "R5.1",
         "gr": "R5.1",
         "bClass": "4",
         "description": "da attività di vendite occasionali o iniziative occasionali di solidarietà (D.M. 1995 lett.a) es.eventi, cassettina offerte, tombole, spettacoli"
      });
      form.push({
         "id": "R5.2",
         "gr": "R5.2",
         "bClass": "4",
         "description": "da attività di vendita di beni acquisiti da terzi a titolo gratuito a fini di sovvenzione  (D.M. 1995 lett.b)"
      });
      form.push({
         "id": "R5.3",
         "gr": "R5.3",
         "bClass": "4",
         "description": "da attività di somministrazione di alimenti e bevande in occasione di manifestazioni e simili a carattere occasionale  (D.M. 1995 lett.d)"
      });
   }

   form.push({
      "id": "R5b",
      "description": " ALTRE ENTRATE DA ATTIVITÀ COMMERCIALI MARGINALI",
      "sum": "R5.4;R5.5"
   });
   form.push({
      "id": "R5.4",
      "gr": "R5.4",
      "bClass": "4",
      "description": "cessione di beni prodotti dagli assistiti e dai volontari sempreché la vendita dei prodotti sia curata direttamente dall'organizzazione senza alcun intermediario (D.M. 1995 lett.c)"
   });
   form.push({
      "id": "R5.5",
      "gr": "R5.5",
      "bClass": "4",
      "description": "attività di prestazione di servizi rese in conformità alle finalità istituzionali, non riconducibili nell'ambito applicativo dell'art. 111, comma 3, del TUIR  verso pagamento di corrispettivi specifici che non eccedano del 50% i costi di diretta imputazione (D.M. 1995 lett. e)"
   });
   form.push({
      "id": "R6",
      "description": "ALTRE ENTRATE (comunque ammesse dalla L.266/91)",
      "sum": "R6.1;R6.2;R6.3"
   });
   form.push({
      "id": "R6.1",
      "gr": "R6.1",
      "bClass": "4",
      "description": "rendite patrimoniali (fitti,….)"
   });
   form.push({
      "id": "R6.2",
      "gr": "R6.2",
      "bClass": "4",
      "description": "rendite finanziarie (interessi, dividendi)"
   });
   form.push({
      "id": "R6.3",
      "gr": "R6.3",
      "bClass": "4",
      "description": "altro: specificare "
   });
   form.push({
      "id": "R7",
      "gr": "R7",
      "bClass": "4",
      "description": "ANTICIPAZIONI DI CASSA"
   });
   form.push({
      "id": "R8",
      "gr": "R8",
      "bClass": "4",
      "description": "PARTITE DI GIRO"
   });

   //We don't include "R5a" in the total group if we are on the APS file
   if (tipoAssociazione !== "APS" && tipoAssociazione === "ODV") {
      form.push({
         "id": "R",
         "description": "TOTALE ENTRATE",
         "sum": "R1;R2;R3;R4;R5a;R5b;R6;R7;R8"
      });
   } else {
      form.push({
         "id": "R",
         "description": "TOTALE ENTRATE",
         "sum": "R1;R2;R3;R4;R5b;R6;R7;R8"
      });
   }

   //EXPENSES
   form.push({
      "id": "Ct",
      "description": "USCITE"
   });
   form.push({
      "id": "C1",
      "gr": "C1",
      "bClass": "3",
      "description": "RIMBORSI SPESE AI VOLONTARI  (documentate ed effettivamente sostenute)"
   });
   form.push({
      "id": "C2",
      "description": "ASSICURAZIONI",
      "sum": "C2.1;C2.2"
   });
   form.push({
      "id": "C2.1",
      "gr": "C2.1",
      "bClass": "3",
      "description": "volontari (malattie, infortuni e resp. civile terzi) - art. 4 L.266/91"
   });
   form.push({
      "id": "C2.2",
      "gr": "C2.2",
      "bClass": "3",
      "description": "altre: es. veicoli, immobili,…."
   });
   form.push({
      "id": "C3",
      "description": "PERSONALE OCCORRENTE  A QUALIFICARE E SPECIALIZZARE L’ATTIVITÀ (art. 3 L. 266/91 e art. 3 L.R. 40/1993)",
      "sum": "C3.1;C3.2;C3.3"
   });
   form.push({
      "id": "C3.1",
      "gr": "C3.1",
      "bClass": "3",
      "description": "dipendenti "
   });
   form.push({
      "id": "C3.2",
      "gr": "C3.2",
      "bClass": "3",
      "description": "atipici e occasionali"
   });
   form.push({
      "id": "C3.3",
      "gr": "C3.3",
      "bClass": "3",
      "description": "consulenti (es. fisioterapista)"
   });
   form.push({
      "id": "C4",
      "gr": "C4",
      "bClass": "3",
      "description": "ACQUISTI DI SERVIZI  (es. manutenzione, trasporti, service, consulenza fiscale e del lavoro)"
   });
   form.push({
      "id": "C5",
      "gr": "C5",
      "bClass": "3",
      "description": "UTENZE (telefono, luce, riscaldamento,…)"
   });
   form.push({
      "id": "C6",
      "description": "MATERIALI DI CONSUMO (cancelleria, postali, materie prime, generi alimentari)",
      "sum": "C6.1;C6.2;C6.3"
   });
   form.push({
      "id": "C6.1",
      "gr": "C6.1",
      "bClass": "3",
      "description": "per struttura odv"
   });
   form.push({
      "id": "C6.2",
      "gr": "C6.2",
      "bClass": "3",
      "description": "per attività"
   });
   form.push({
      "id": "C6.3",
      "gr": "C6.3",
      "bClass": "3",
      "description": "per soggetti svantaggiati"
   });
   form.push({
      "id": "C7",
      "gr": "C7",
      "bClass": "3",
      "description": "GODIMENTO BENI DI TERZI (affitti, noleggio attrezzature, diritti Siae,....)"
   });
   form.push({
      "id": "C8",
      "gr": "C8",
      "bClass": "3",
      "description": "ONERI FINANZIARI E PATRIMONIALI (es. interessi passivi su mutui, prestiti, c/c bancario ..)"
   });
   form.push({
      "id": "C9",
      "gr": "C9",
      "bClass": "3",
      "description": "BENI DUREVOLI"
   });
   form.push({
      "id": "C10",
      "gr": "C10",
      "bClass": "3",
      "description": "IMPOSTE E TASSE"
   });
   form.push({
      "id": "C11",
      "gr": "C11",
      "bClass": "3",
      "description": "RACCOLTE FONDI (vedi allegati Nr. delle singole raccolte fondi di cui ai punti 5.1, 5.2 e 5.3 delle entrate)"
   });
   form.push({
      "id": "C12",
      "description": "ALTRE USCITE/COSTI",
      "sum": "C12.1;C12.2;C12.3;C12.4"
   });
   form.push({
      "id": "C12.1",
      "gr": "C12.1",
      "bClass": "3",
      "description": "Contributi a soggetti svantaggiati"
   });
   form.push({
      "id": "C12.2",
      "gr": "C12.2",
      "bClass": "3",
      "description": "Quote associative a odv collegate  (specificare)"
   });
   form.push({
      "id": "C12.3",
      "gr": "C12.3",
      "bClass": "3",
      "description": "versate ad altre odv (specificare)"
   });
   form.push({
      "id": "C12.4",
      "gr": "C12.4",
      "bClass": "3",
      "description": "Altro (specificare)"
   });
   form.push({
      "id": "C13",
      "gr": "C13",
      "bClass": "3",
      "description": "PARTITE DI GIRO"
   });
   form.push({
      "id": "C",
      "description": "TOTALE USCITE",
      "sum": "C1;C2;C3;C4;C5;C6;C7;C8;C9;C10;C11;C12;C13"
   });

   //RISULTATO D'ESERCIZIO
   form.push({
      "id": "UP",
      "description": "UTILE/PERDITA D'ESERCIZIO",
      "sum": "R;-C"
   });


   /** STATO PATRIMONIALE **/
   //ATTIVI
   form.push({
      "id": "A1",
      "gr": "A1",
      "bClass": "1",
      "description": "BENI DUREVOLI"
   });
   form.push({
      "id": "A2.1",
      "gr": "A2.1",
      "bClass": "1",
      "description": "CASSA"
   });
   form.push({
      "id": "A2.2",
      "gr": "A2.2",
      "bClass": "1",
      "description": "BANCA"
   });
   form.push({
      "id": "A2.3",
      "gr": "A2.3",
      "bClass": "1",
      "description": "TITOLI"
   });
   form.push({
      "id": "A3",
      "gr": "A3",
      "bClass": "1",
      "description": "CREDITI"
   });
   form.push({
      "id": "APG",
      "description": "PERDITA DI GESTIONE"
   });
   form.push({
      "id": "ATP",
      "description": "TOTALE A PAREGGIO",
      "sum": "A1;A2.1;A2.2;A3;APG"
   });

   //PASSIVI
   form.push({
      "id": "P1",
      "gr": "P1",
      "bClass": "2",
      "description": "DEBITI"
   });
   form.push({
      "id": "P2.1",
      "gr": "P2.1",
      "bClass": "2",
      "description": "FONDI DI AMMORTAMENTO BENI E ATTREZZATURE"
   });
   form.push({
      "id": "P2.2",
      "gr": "P2.2",
      "bClass": "2",
      "description": "FONDI DI ACCANTONAMENTO"
   });
   form.push({
      "id": "P3",
      "gr": "P3",
      "bClass": "2",
      "description": "NETTO"
   });
   form.push({
      "id": "PAG",
      "description": "AVANZO DI GESTIONE"
   });
   form.push({
      "id": "PTP",
      "description": "TOTALE A PAREGGIO",
      "sum": "P1;P2.1;P2.2;P3;PAG"
   });

   //LIQUIDITÀ INIZIALE/FINALE
   form.push({
      "id": "LI",
      "description": "LIQUIDITÀ INIZIALE (cassa+Banca+Titoli)",
      "sum": "A2.1;A2.2;A2.3"
   });
   form.push({
      "id": "LF",
      "description": "LIQUIDITÀ FINALE (Liquidità iniziale + totale entrate - totale uscite)",
      "sum": "LI;R;-C"
   });
}

//Get the liquidity group for the gr1 A2.1, A2.2 and A2.3
function getLiquidityGroup(banDoc) {
   var table = banDoc.table("Accounts");
   var textNotes = "";
   var liquidityGroup = "";
   for (var i = 0; i < table.rowCount; i++) {
      var tRow = table.row(i);
      var gr = tRow.value("Gr");
      var gr1 = tRow.value("Gr1");
      if (gr1 === "A2.1" || gr1 === "A2.2" || gr1 === "A2.3") {
         liquidityGroup = gr;
      }
   }
   return liquidityGroup;
}

//Calculate opening balance for the liquidity
function calcOpeningLiquidity(banDoc, param) {
   var gr = getLiquidityGroup(banDoc);
   var bal = banDoc.currentBalance("Gr=" + gr, param["startDate"], param["endDate"]);
   var opening = bal.opening;
   return opening;
}

//Calculate the ending balance for liquidity
function calcFinalBalanceLiquidity(banDoc, param) {
   var gr = getLiquidityGroup(banDoc);
   var opening = banDoc.currentBalance("Gr=" + gr, param["startDate"], param["endDate"]).opening;
   var debit = banDoc.currentBalance("Gr=" + gr, param["startDate"], param["endDate"]).debit;
   var credit = banDoc.currentBalance("Gr=" + gr, param["startDate"], param["endDate"]).credit;
   var total = 0;
   total = Banana.SDecimal.add(total, opening);
   total = Banana.SDecimal.add(total, debit);
   total = Banana.SDecimal.subtract(total, credit);
   return total;
}


//The purpose of this function is to do some operations before the calculation of the totals
function preProcess(banDoc) {

   //var balanceUP =  banDoc.currentBalance("Gr=UP-BIL", param.startDate, param.endDate).balance;
   var balanceUP = "";

   //Table Categories
   if (banDoc.table('Categories')) {
      var table = banDoc.table("Categories");
      for (var i = 0; i < table.rowCount; i++) {
         var tRow = table.row(i);
         if (tRow.value("Group") === "RIS") {
            balanceUP = tRow.value("Balance");
         }
      }

      for (var i = 0; i < form.length; i++) {
         //Attivo - Perdita di gestione (+)
         if (Banana.SDecimal.sign(balanceUP) > 0) {
            if (form[i]["id"] === "PAG") {
               form[i]["amount"] = balanceUP;
               getObject(form, "APG").amount = "";
            }
         }
         //Passivo - Avanzo di gestione (-)
         else if (Banana.SDecimal.sign(balanceUP) < 0) {
            if (form[i]["id"] === "APG") {
               form[i]["amount"] = Banana.SDecimal.invert(balanceUP);
               getObject(form, "PAG").amount = "";
            }
         }
      }
      getObject(form, "P3").amount = banDoc.table('Accounts').findRowByValue('Group', 'PN').value('Opening');
   }
   //Table Accounts
   else {
      var table = banDoc.table("Totals");
      for (var i = 0; i < table.rowCount; i++) {
         var tRow = table.row(i);
         if (tRow.value("Group") === "02") {
            balanceUP = tRow.value("Balance");
         }
      }

      for (var i = 0; i < form.length; i++) {
         //Attivo - Perdita di gestione (+)
         if (Banana.SDecimal.sign(balanceUP) > 0) {
            if (form[i]["id"] === "APG") {
               form[i]["amount"] = balanceUP;
               getObject(form, "PAG").amount = "";
            }
         }
         //Passivo - Avanzo di gestione (-)
         else if (Banana.SDecimal.sign(balanceUP) < 0) {
            if (form[i]["id"] === "PAG") {
               form[i]["amount"] = Banana.SDecimal.invert(balanceUP);
               getObject(form, "APG").amount = "";
            }
         }
      }
   }
}


//The purpose of this function is to do some operations before the values are converted
function postProcess() {

}




//The purpose of this function is to create and print the report
function printReport(banDoc) {

   var report = Banana.Report.newReport(param.reportName);
   var thisYear = Banana.Converter.toDate(banDoc.info("AccountingDataBase", "OpeningDate")).getFullYear();

   report.addParagraph(param.headerLeft + " - " + "STATO PATRIMONIALE (MOD. A) ANNO " + thisYear, "heading2");

   // Tabella	
   var table = report.addTable("table");
   tableRow = table.addRow();
   tableRow.addCell("Id/Gr1", "styleTableHeader", 1);
   tableRow.addCell("Id/Gr1", "styleTableHeader", 1);
   tableRow.addCell("Descrizione gruppo/conto", "styleTableHeader", 1);
   tableRow.addCell("  ", "styleTableHeader", 1);
   tableRow.addCell("  ", "styleTableHeader", 1);
   tableRow.addCell("Importi parziali", "styleTableHeader", 1);
   tableRow.addCell("Importi totali", "styleTableHeader", 1);

   // Liquidità iniziale
   var liqIniziale = getObject(form, "LI");
   tableRow = table.addRow();
   tableRow.addCell(liqIniziale["id"], "bold italic", 1);
   tableRow.addCell(liqIniziale["description"], "bold italic", 4);
   tableRow.addCell("", "", 1);
   tableRow.addCell(Banana.Converter.toLocaleNumberFormat(calcOpeningLiquidity(banDoc, param)), "alignRight bold italic", 1);
   //tableRow.addCell(getBalance(liqIniziale["id"]), "alignRight bold italic", 1);

   tableRow = table.addRow();
   tableRow.addCell(" ", "", 7);

   // Entrate/Uscite
   for (var k = 0; k < form.length; k++) {

      if (form[k]["id"].substring(0, 1) === "R" || form[k]["id"].substring(0, 1) === "C" || form[k]["id"].substring(0, 2) === "UP") {

         //Titles
         if (form[k]["id"] === "Rt" || form[k]["id"] === "Ct") {
            tableRow = table.addRow();
            tableRow.addCell(form[k]["description"], "styleTitleCell", 7);
         }
         //Totals
         else if (form[k]["id"] === "R" || form[k]["id"] === "C" || form[k]["id"] === "UP") {
            tableRow = table.addRow();
            tableRow.addCell(form[k]["id"], "valueTotal", 1);
            tableRow.addCell(form[k]["description"], "valueTotal", 4);
            tableRow.addCell(" ", "valueTotal", 1);
            tableRow.addCell(getBalance(form[k].id), "alignRight bold valueTotal", 1);
         }
         //Details
         else {
            if (form[k].id.indexOf(".") > 0) {
               tableRow = table.addRow();
               tableRow.addCell(" ", "", 1);
               tableRow.addCell(form[k]["id"], "", 1);
               tableRow.addCell(form[k]["description"], "", 3);
               tableRow.addCell(getBalance(form[k].id), "alignRight", 1);
               tableRow.addCell(" ", "", 1);
            } else {
               tableRow = table.addRow();
               tableRow.addCell(form[k]["id"], "bold italic", 1);
               //tableRow.addCell(form[k]["description"], "bold italic", 1);
               //tableRow.addCell(" ", "", 2);
               tableRow.addCell(form[k]["description"], "bold italic", 4);
               tableRow.addCell(" ", "", 1);
               tableRow.addCell(getBalance(form[k].id), "alignRight bold italic", 1);
            }
         }
      }
   }

   tableRow = table.addRow();
   tableRow.addCell(" ", "", 7);

   var liqFinale = getObject(form, "LF");
   tableRow = table.addRow();
   tableRow.addCell(liqFinale["id"], "bold italic", 1);
   tableRow.addCell(liqFinale["description"], "bold italic", 4);
   tableRow.addCell("", "", 1);
   //tableRow.addCell(getBalance(liqFinale["id"]), "alignRight bold italic", 1);
   tableRow.addCell(Banana.Converter.toLocaleNumberFormat(calcFinalBalanceLiquidity(banDoc, param)), "alignRight bold italic", 1);

   var valCassa = getObject(form, "A2.1");
   var valBanca = getObject(form, "A2.2");

   tableRow = table.addRow();
   tableRow.addCell("", "", 2);
   tableRow.addCell("di cui Valori in cassa", "", 3);
   tableRow.addCell(getBalance(valCassa["id"]), "alignRight", 1);
   tableRow.addCell("", "", 1);

   tableRow = table.addRow();
   tableRow.addCell("", "", 2);
   tableRow.addCell("di cui Valori presso depositi", "", 3);
   tableRow.addCell(getBalance(valBanca["id"]), "alignRight", 1);
   tableRow.addCell("", "", 1);


   report.addPageBreak();

   /** TABLE STATO PATRIMONIALE **/
   report.addParagraph(param.headerLeft + " - STATO PATRIMONIALE", "heading2");

   var table = report.addTable("table");

   tableRow = table.addRow();
   tableRow.addCell("Id/Gr1", "styleTableHeader", 1);
   //tableRow.addCell("Gr1", "styleTableHeader", 1)
   tableRow.addCell("Descrizione", "styleTableHeader", 1);
   tableRow.addCell("Importi totali", "styleTableHeader", 1);

   tableRow = table.addRow();
   tableRow.addCell("ATTIVO", "bold styleTitleCell", 3);

   tableRow = table.addRow();
   tableRow.addCell(getValue(form, "A1", "id"), "", 1);
   //tableRow.addCell(getValue(form, "A1", "gr"), "", 1);
   tableRow.addCell(getValue(form, "A1", "description"), "", 1);
   tableRow.addCell(getBalance("A1"), "alignRight", 1);

   tableRow = table.addRow();
   tableRow.addCell(getValue(form, "A2.1", "id"), "", 1);
   //tableRow.addCell(getValue(form, "A2.1", "gr"), "", 1);
   tableRow.addCell(getValue(form, "A2.1", "description"), "", 1);
   tableRow.addCell(getBalance("A2.1"), "alignRight", 1);

   tableRow = table.addRow();
   tableRow.addCell(getValue(form, "A2.2", "id"), "", 1);
   //tableRow.addCell(getValue(form, "A2.2", "gr"), "", 1);
   tableRow.addCell(getValue(form, "A2.2", "description"), "", 1);
   tableRow.addCell(getBalance("A2.2"), "alignRight", 1);

   tableRow = table.addRow();
   tableRow.addCell(getValue(form, "A2.3", "id"), "", 1);
   //tableRow.addCell(getValue(form, "A2.3", "gr"), "", 1);
   tableRow.addCell(getValue(form, "A2.3", "description"), "", 1);
   tableRow.addCell(getBalance("A2.3"), "alignRight", 1);

   tableRow = table.addRow();
   tableRow.addCell(getValue(form, "A3", "id"), "", 1);
   //tableRow.addCell(getValue(form, "A3", "gr"), "", 1);
   tableRow.addCell(getValue(form, "A3", "description"), "", 1);
   tableRow.addCell(getBalance("A3"), "alignRight", 1);

   tableRow = table.addRow();
   tableRow.addCell(getValue(form, "APG", "id"), "", 1);
   //tableRow.addCell(getValue(form, "APG", "gr"), "", 1);
   tableRow.addCell(getValue(form, "APG", "description"), "", 1);
   tableRow.addCell(getBalance("APG"), "alignRight", 1);

   tableRow = table.addRow();
   tableRow.addCell(getValue(form, "ATP", "id"), "bold valueTotal", 1);
   //tableRow.addCell(getValue(form, "ATP", "gr"), "", 1);
   tableRow.addCell(getValue(form, "ATP", "description"), "bold valueTotal", 1);
   tableRow.addCell(getBalance("ATP"), "alignRight bold valueTotal", 1);

   tableRow = table.addRow();
   tableRow.addCell("PASSIVO", "bold styleTitleCell", 3);

   tableRow = table.addRow();
   tableRow.addCell(getValue(form, "P1", "id"), "", 1);
   //tableRow.addCell(getValue(form, "P1", "gr"), "", 1);
   tableRow.addCell(getValue(form, "P1", "description"), "", 1);
   tableRow.addCell(getBalance("P1"), "alignRight", 1);

   tableRow = table.addRow();
   tableRow.addCell(getValue(form, "P2.1", "id"), "", 1);
   //tableRow.addCell(getValue(form, "P2.1", "gr"), "", 1);
   tableRow.addCell(getValue(form, "P2.1", "description"), "", 1);
   tableRow.addCell(getBalance("P2.1"), "alignRight", 1);

   tableRow = table.addRow();
   tableRow.addCell(getValue(form, "P2.2", "id"), "", 1);
   //tableRow.addCell(getValue(form, "P2.2", "gr"), "", 1);
   tableRow.addCell(getValue(form, "P2.2", "description"), "", 1);
   tableRow.addCell(getBalance("P2.2"), "alignRight", 1);

   tableRow = table.addRow();
   tableRow.addCell(getValue(form, "P3", "id"), "", 1);
   //tableRow.addCell(getValue(form, "P3", "gr"), "", 1);
   tableRow.addCell(getValue(form, "P3", "description"), "", 1);
   tableRow.addCell(getBalance("P3"), "alignRight", 1);

   tableRow = table.addRow();
   tableRow.addCell(getValue(form, "PAG", "id"), "", 1);
   //tableRow.addCell(getValue(form, "PAG", "gr"), "", 1);
   tableRow.addCell(getValue(form, "PAG", "description"), "", 1);
   tableRow.addCell(getBalance("PAG"), "alignRight", 1);

   tableRow = table.addRow();
   tableRow.addCell(getValue(form, "PTP", "id"), "bold valueTotal", 1);
   //tableRow.addCell(getValue(form, "PTP", "gr"), "", 1);
   tableRow.addCell(getValue(form, "PTP", "description"), "bold valueTotal", 1);
   tableRow.addCell(getBalance("PTP"), "alignRight bold valueTotal", 1);


   //Add a footer to the report
   addFooter(report);

   return report;
}


//The purpose of this function is to load all the balances and save the values into the form
function loadBalances(banDoc) {

   for (var i in form) {

      //Check if there are "vatClass" properties, then load VAT balances
      if (form[i]["vatClass"]) {
         if (form[i]["gr"]) {
            form[i]["amount"] = calculateVatGr1Balance(banDoc, form[i]["gr"], form[i]["vatClass"], param["grColumn"], param["startDate"], param["endDate"]);
         }
      }

      //Check if there are "bClass" properties, then load balances
      if (form[i]["bClass"]) {
         if (form[i]["gr"]) {
            form[i]["amount"] = calculateAccountGr1Balance(banDoc, form[i]["gr"], form[i]["bClass"], param["grColumn"], param["startDate"], param["endDate"]);
         }
      }
   }
}


//The purpose of this function is to calculate all the balances of the accounts belonging to the same group (grText)
function calculateAccountGr1Balance(banDoc, grText, bClass, grColumn, startDate, endDate) {

   var accounts = [];

   if (banDoc.table("Categories") && (bClass === "3" || bClass === "4")) {
      var categoryNumbers = getColumnListForGr(banDoc.table("Categories"), grText, "Category", grColumn);
      categoryNumbers = categoryNumbers.join("|");
      accounts.push(categoryNumbers);
   } else {
      var accountNumbers = getColumnListForGr(banDoc.table("Accounts"), grText, "Account", grColumn);
      accountNumbers = accountNumbers.join("|");
      accounts.push(accountNumbers);
   }

   //Banana.console.debug(accounts);

   //Sum the amounts of opening, debit, credit, total and balance for all transactions for this accounts
   var currentBal = banDoc.currentBalance(accounts, startDate, endDate);

   //The "bClass" decides which value to use
   if (bClass === "0") {
      return currentBal.amount;
   } else if (bClass === "1") {
      return currentBal.balance;
   } else if (bClass === "2") {
      return Banana.SDecimal.invert(currentBal.balance);
   } else if (bClass === "3") {
      if (!banDoc.table("Categories")) {
         return currentBal.total;
      } else {
         return Banana.SDecimal.invert(currentBal.total);
      }
   } else if (bClass === "4") {
      if (!banDoc.table("Categories")) {
         return Banana.SDecimal.invert(currentBal.total);
      } else {
         return currentBal.total;
      }
   }
}


//The main purpose of this function is to create an array with all the values of a given column of the table (codeColumn) belonging to the same group (grText)
function getColumnListForGr(table, grText, codeColumn, grColumn) {

   if (table === undefined || !table) {
      return str;
   }
   if (!grColumn) {
      grColumn = "Gr1";
   }

   var str = [];

   //Loop to take the values of each rows of the table
   for (var i = 0; i < table.rowCount; i++) {
      var tRow = table.row(i);
      var grRow = tRow.value(grColumn);

      //If Gr1 column contains other characters (in this case ";") we know there are more values
      //We have to split them and take all values separately
      //If there are only alphanumeric characters in Gr1 column we know there is only one value
      var codeString = grRow;
      var arrCodeString = codeString.split(";");
      for (var j = 0; j < arrCodeString.length; j++) {
         var codeString1 = arrCodeString[j];
         if (codeString1 === grText) {
            str.push(tRow.value(codeColumn));
         }
      }
   }

   //Removing duplicates
   for (var i = 0; i < str.length; i++) {
      for (var x = i + 1; x < str.length; x++) {
         if (str[x] === str[i]) {
            str.splice(x, 1);
            --x;
         }
      }
   }

   //Return the array
   return str;
}


//The purpose of this function is to return a specific whole object
function getObject(form, id) {
   for (var i = 0; i < form.length; i++) {
      if (form[i]["id"] === id) {
         return form[i];
      }
   }
   Banana.document.addMessage("Couldn't find object with id: " + id);
}


//The purpose of this function is to get a specific value from the object
function getValue(source, id, field) {
   var searchId = id.trim();
   for (var i = 0; i < source.length; i++) {
      if (source[i].id === searchId) {
         return source[i][field];
      }
   }
   Banana.document.addMessage("Couldn't find object with id: " + id);
}


//The purpose of this function is to get the Description from an object
function getDescription(id) {
   var searchId = id.trim();
   for (var i = 0; i < form.length; i++) {
      if (form[i]["id"] === searchId) {
         return form[i]["description"];
      }
   }
   Banana.document.addMessage("Couldn't find object with id: " + id);
}


//The purpose of this function is to get the Balance from an object
function getBalance(id) {
   var searchId = id.trim();
   for (var i = 0; i < form.length; i++) {
      if (form[i]["id"] === searchId) {
         return form[i]["amount"];
      }
   }
   Banana.document.addMessage("Couldn't find object with id: " + id);
}


//The purpose of this function is to convert all the values from the given list to local format
function formatValues(fields) {
   if (param["formatNumber"] === true) {
      for (i = 0; i < form.length; i++) {
         var valueObj = getObject(form, form[i].id);

         for (var j = 0; j < fields.length; j++) {
            valueObj[fields[j]] = Banana.Converter.toLocaleNumberFormat(valueObj[fields[j]]);
         }
      }
   }
}


//The purpose of this function is to calculate all totals of the form with one call of the function only
function calcTotals(fields) {
   for (var i = 0; i < form.length; i++) {
      calcTotal(form[i].id, fields);
   }
}


//Calculate a single total of the form
function calcTotal(id, fields) {

   var valueObj = getObject(form, id);

   if (valueObj[fields[0]]) { //first field is present
      return; //calc already done, return
   }

   if (valueObj.sum) {
      var sumElements = valueObj.sum.split(";");

      for (var k = 0; k < sumElements.length; k++) {
         var entry = sumElements[k].trim();
         if (entry.length <= 0) {
            return true;
         }

         var isNegative = false;
         if (entry.indexOf("-") >= 0) {
            isNegative = true;
            entry = entry.substring(1);
         }

         //Calulate recursively
         calcTotal(entry, fields);

         for (var j = 0; j < fields.length; j++) {
            var fieldName = fields[j];
            var fieldValue = getValue(form, entry, fieldName);
            if (fieldValue) {
               if (isNegative) {
                  //Invert sign
                  fieldValue = Banana.SDecimal.invert(fieldValue);
               }
               valueObj[fieldName] = Banana.SDecimal.add(valueObj[fieldName], fieldValue, {
                  'decimals': param.rounding
               });
            }
         }
      }
   } else if (valueObj.gr) {
      //Already calculated in loadBalances()
   }
}


//This function adds a Footer to the report
function addFooter(report) {
   report.getFooter().addClass("footer");
   report.getFooter().addText("- ", "");
   report.getFooter().addFieldPageNr();
   report.getFooter().addText(" -", "");
}




//The main purpose of this function is to create styles for the report print
function createStyleSheet() {
   var stylesheet = Banana.Report.newStyleSheet();

   var pageStyle = stylesheet.addStyle("@page");
   pageStyle.setAttribute("margin", "5mm 10mm 5mm 10mm");

   stylesheet.addStyle("body", "font-family : Helvetica");

   var style = stylesheet.addStyle(".description");
   style.setAttribute("padding-bottom", "5px");
   style.setAttribute("padding-top", "5px");
   style.setAttribute("font-size", "8px");

   // style = stylesheet.addStyle(".description1");
   // style.setAttribute("font-size", "7px");
   // style.setAttribute("text-align", "center");

   // style = stylesheet.addStyle(".descriptionBold");
   // style.setAttribute("font-size", "8px");
   // style.setAttribute("font-weight", "bold");

   style = stylesheet.addStyle(".footer");
   style.setAttribute("text-align", "right");
   style.setAttribute("font-size", "8px");
   style.setAttribute("font-family", "Courier New");

   style = stylesheet.addStyle(".heading1");
   style.setAttribute("font-size", "16px");
   style.setAttribute("font-weight", "bold");

   style = stylesheet.addStyle(".heading2");
   style.setAttribute("font-size", "12px");
   style.setAttribute("font-weight", "bold");

   style = stylesheet.addStyle(".heading3");
   style.setAttribute("font-size", "10px");
   style.setAttribute("font-weight", "bold");

   style = stylesheet.addStyle(".heading4");
   style.setAttribute("font-size", "9px");
   style.setAttribute("font-weight", "bold");

   style = stylesheet.addStyle(".header1");
   style.setAttribute("font-size", "10px");
   style.setAttribute("font-family", "Times New Roman");

   style = stylesheet.addStyle(".header2");
   style.setAttribute("font-size", "7px");
   style.setAttribute("font-family", "Times New Roman");

   style = stylesheet.addStyle(".horizontalLine");
   style.setAttribute("border-bottom", "thin solid black");

   // style = stylesheet.addStyle(".rowNumber");
   // style.setAttribute("font-size", "9px");

   // style = stylesheet.addStyle(".valueAmount");
   // style.setAttribute("font-size", "9px");
   // style.setAttribute("font-weight", "bold");
   // style.setAttribute("padding-bottom", "5px"); 
   // style.setAttribute("background-color", "#eeeeee"); 
   // style.setAttribute("text-align", "right");

   // style = stylesheet.addStyle(".valueDate");
   // style.setAttribute("font-size", "9px");
   // style.setAttribute("font-weight", "bold");
   // style.setAttribute("padding-bottom", "5px"); 
   // style.setAttribute("background-color", "#eeeeee"); 

   // style = stylesheet.addStyle(".valueText");
   // style.setAttribute("font-size", "9px");
   // style.setAttribute("font-weight", "bold");
   // style.setAttribute("padding-bottom", "5px");
   // style.setAttribute("padding-top", "5px");
   // style.setAttribute("background-color", "#eeeeee"); 

   // style = stylesheet.addStyle(".valueTitle");
   // style.setAttribute("font-size", "9px");
   // style.setAttribute("font-weight", "bold");
   // //style.setAttribute("padding-bottom", "5px"); 
   // //style.setAttribute("padding-top", "5px");
   // style.setAttribute("background-color", "#000000");
   // style.setAttribute("color", "#fff");

   // style = stylesheet.addStyle(".valueTitle1");
   // style.setAttribute("font-size", "9px");
   // style.setAttribute("font-weight", "bold");
   // style.setAttribute("padding-bottom", "5px"); 
   // style.setAttribute("padding-top", "5px");


   style = stylesheet.addStyle(".valueTotal");
   style.setAttribute("font-weight", "bold");
   style.setAttribute("background-color", "#eeeeee");

   style = stylesheet.addStyle(".valueTotal1");
   style.setAttribute("background-color", "#eeeeee");

   //Table
   style = stylesheet.addStyle("table");
   style.setAttribute("width", "100%");
   style.setAttribute("font-size", "8px");
   stylesheet.addStyle("table.table td", "border: thin solid #2C4068");

   style = stylesheet.addStyle(".styleTableHeader");
   //style.setAttribute("font-weight", "bold");
   style.setAttribute("background-color", "#2C4068");
   style.setAttribute("border-bottom", "1px double black");
   style.setAttribute("color", "#fff");

   style = stylesheet.addStyle(".styleTitleCell");
   style.setAttribute("font-weight", "bold");
   style.setAttribute("background-color", "#FFD100");
   style.setAttribute("border-bottom", "1px double black");
   style.setAttribute("color", "#2C4068");

   style = stylesheet.addStyle(".background");
   style.setAttribute("padding-bottom", "5px");
   style.setAttribute("padding-top", "5px");
   style.setAttribute("background-color", "#eeeeee");

   style = stylesheet.addStyle(".borderLeft");
   style.setAttribute("border-left", "thin solid black");

   style = stylesheet.addStyle(".borderBottom");
   style.setAttribute("border-bottom", "thin solid black");

   style = stylesheet.addStyle(".bold");
   style.setAttribute("font-weight", "bold");

   style = stylesheet.addStyle(".italic");
   style.setAttribute("font-style", "italic");

   style = stylesheet.addStyle(".alignRight");
   style.setAttribute("text-align", "right");

   style = stylesheet.addStyle(".alignCenter");
   style.setAttribute("text-align", "center");

   return stylesheet;
}