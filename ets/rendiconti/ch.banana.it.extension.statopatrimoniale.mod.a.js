// Copyright [2018] [Banana.ch SA - Lugano Switzerland]
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
// @pubdate = 2020-06-19
// @publisher = Banana.ch SA
// @description = Stato patrimoniale (MOD. A)
// @task = app.command
// @doctype = 100.100
// @docproperties = 
// @outputformat = none
// @inputdatasource = none
// @timeout = -1



//Global variables
var userParam = {};
var param = {};
var form = [];




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
   loadParam();
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

   var report = printRendicontoModA(Banana.document, userParam);
   var stylesheet = Banana.Report.newStyleSheet();
   setCss(Banana.document, stylesheet, userParam);

   Banana.Report.preview(report, stylesheet);
}

function printRendicontoModA(banDoc, userParam) {

   var report = Banana.Report.newReport("Stato patrimoniale (MOD. A)");
   var startDate = userParam.selectionStartDate;
   var endDate = userParam.selectionEndDate;
   var currentYear = Banana.Converter.toDate(banDoc.info("AccountingDataBase", "OpeningDate")).getFullYear();
   var previousYear = currentYear - 1;

   var title = "";
   if (userParam.title) {
      title = userParam.title;
   } else {
      title = banDoc.info("Base", "HeaderLeft") + " - " + "STATO PATRIMONIALE (MOD. A) ANNO " + currentYear;
   }
 
   var obj = "";
   var current = "";
   var previous = "";


   /**************************************************************************************
   * ATTIVO
   **************************************************************************************/
   report.addParagraph(title, "heading2");

   var table = report.addTable("table");
   var column1 = table.addColumn("column1");
   var column2 = table.addColumn("column2");
   var column3 = table.addColumn("column3");

   tableRow = table.addRow();
   tableRow.addCell("Attivo", "styleTableHeader alignLeft", 1);
   tableRow.addCell(Banana.Converter.toLocaleDateFormat(startDate), "styleTableHeader alignCenter", 1);
   tableRow.addCell("31.12." + previousYear, "styleTableHeader alignCenter", 1);

   /* AA */
   obj = banDoc.currentBalance("Gr=AA", startDate, endDate);
   //Banana.console.log(JSON.stringify(obj, "", " "));
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "AA").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("A) quote associative o apporti ancora dovuti", "alignLeft bold", 1);
   tableRow.addCell(formatValue(current), "alignRight", 1);
   tableRow.addCell(formatValue(previous), "alignRight", 1);

   tableRow = table.addRow();
   tableRow.addCell("B) immobilizzazioni", "alignLeft bold", 1);
   tableRow.addCell("", "alignRight", 1);
   tableRow.addCell("", "alignRight", 1);

   tableRow = table.addRow();
   tableRow.addCell("I - immobilizzazioni immateriali", "alignLeft bold", 1);
   tableRow.addCell("", "alignRight", 1);
   tableRow.addCell("", "alignRight", 1);

   /* ABI1 */
   obj = banDoc.currentBalance("Gr=ABI1", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "ABI1").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("1) costi di impianto e di ampliamento", "alignLeft", 1);
   tableRow.addCell(formatValue(current), "alignRight", 1);
   tableRow.addCell(formatValue(previous), "alignRight", 1);

   /* ABI2 */
   obj = banDoc.currentBalance("Gr=ABI2", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "ABI2").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("2) costi di sviluppo", "alignLeft", 1);
   tableRow.addCell(formatValue(current), "alignRight", 1);
   tableRow.addCell(formatValue(previous), "alignRight", 1);

   /* ABI3 */
   obj = banDoc.currentBalance("Gr=ABI3", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "ABI3").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("3) diritti di brevetto industriale e diritti di utilizzazione delle opere dell'ingegno", "alignLeft", 1);
   tableRow.addCell(formatValue(current), "alignRight", 1);
   tableRow.addCell(formatValue(previous), "alignRight", 1);

   /* ABI4 */
   obj = banDoc.currentBalance("Gr=ABI4", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "ABI4").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("4) concessioni, licenze, marchi e diritti simili", "alignLeft", 1);
   tableRow.addCell(formatValue(current), "alignRight", 1);
   tableRow.addCell(formatValue(previous), "alignRight", 1);

   /* ABI5 */
   obj = banDoc.currentBalance("Gr=ABI5", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "ABI5").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("5) avviamento", "alignLeft", 1);
   tableRow.addCell(formatValue(current), "alignRight", 1);
   tableRow.addCell(formatValue(previous), "alignRight", 1);

   /* ABI6 */
   obj = banDoc.currentBalance("Gr=ABI6", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "ABI6").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("6) immobilizzazioni in corso e acconti", "alignLeft", 1);
   tableRow.addCell(formatValue(current), "alignRight", 1);
   tableRow.addCell(formatValue(previous), "alignRight", 1);

   /* ABI7 */
   obj = banDoc.currentBalance("Gr=ABI7", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "ABI7").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("7) altre Immobilizzazioni immateriali", "alignLeft", 1);
   tableRow.addCell(formatValue(current), "alignRight", 1);
   tableRow.addCell(formatValue(previous), "alignRight", 1);

   /* tot ABI */
   obj = banDoc.currentBalance("Gr=ABI", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "ABI").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("Totale immobilizzazioni immateriali", "alignLeft bold", 1);
   tableRow.addCell(formatValue(current), "alignRight bold", 1);
   tableRow.addCell(formatValue(previous), "alignRight bold", 1);

   tableRow = table.addRow();
   tableRow.addCell("II - immobilizzazioni materiali", "alignLeft bold", 1);
   tableRow.addCell("", "alignRight", 1);
   tableRow.addCell("", "alignRight", 1);

   /* ABII1 */
   obj = banDoc.currentBalance("Gr=ABII1", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "ABII1").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("1) terreni e fabbricati", "alignLeft", 1);
   tableRow.addCell(formatValue(current), "alignRight", 1);
   tableRow.addCell(formatValue(previous), "alignRight", 1);

   /* ABII2 */
   obj = banDoc.currentBalance("Gr=ABII2", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "ABII2").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("2) impianti e macchinari", "alignLeft", 1);
   tableRow.addCell(formatValue(current), "alignRight", 1);
   tableRow.addCell(formatValue(previous), "alignRight", 1);

   /* ABII3 */
   obj = banDoc.currentBalance("Gr=ABII3", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "ABII3").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("3) attrezzature", "alignLeft", 1);
   tableRow.addCell(formatValue(current), "alignRight", 1);
   tableRow.addCell(formatValue(previous), "alignRight", 1);

   /* ABII4 */
   obj = banDoc.currentBalance("Gr=ABII4", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "ABII4").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("4) altri beni", "alignLeft", 1);
   tableRow.addCell(formatValue(current), "alignRight", 1);
   tableRow.addCell(formatValue(previous), "alignRight", 1);

   /* ABII5 */
   obj = banDoc.currentBalance("Gr=ABII5", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "ABII5").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("5) immobilizzazioni in corso e acconti", "alignLeft", 1);
   tableRow.addCell(formatValue(current), "alignRight", 1);
   tableRow.addCell(formatValue(previous), "alignRight", 1);

   /* tot ABII */
   obj = banDoc.currentBalance("Gr=ABII", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "ABII").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("Totale immobilizzazioni materiali", "alignLeft bold", 1);
   tableRow.addCell(formatValue(current), "alignRight bold", 1);
   tableRow.addCell(formatValue(previous), "alignRight bold", 1);

   tableRow = table.addRow();
   tableRow.addCell("III - immobilizzazioni finanziarie, con separata indicazione aggiuntiva, per ciascuna voce dei crediti, degli importi esigibili entro l'esercizio successivo", "alignLeft bold", 1);
   tableRow.addCell("", "alignRight", 1);
   tableRow.addCell("", "alignRight", 1);

   /* ABIII1 */
   tableRow = table.addRow();
   tableRow.addCell("1) partecipazioni", "alignLeft bold", 1);
   tableRow.addCell("", "alignRight", 1);
   tableRow.addCell("", "alignRight", 1);

   /* ABIII1a */
   obj = banDoc.currentBalance("Gr=ABIII1a", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "ABIII1a").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("a) partecipazioni in imprese controllate", "alignLeft", 1);
   tableRow.addCell(formatValue(current), "alignRight", 1);
   tableRow.addCell(formatValue(previous), "alignRight", 1);

   /* ABIII1b */
   obj = banDoc.currentBalance("Gr=ABIII1b", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "ABIII1b").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("b) partecipazioni in imprese collegate", "alignLeft", 1);
   tableRow.addCell(formatValue(current), "alignRight", 1);
   tableRow.addCell(formatValue(previous), "alignRight", 1);

   /* ABIII1c */
   obj = banDoc.currentBalance("Gr=ABIII1c", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "ABIII1c").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("c) partecipazioni in altre imprese", "alignLeft", 1);
   tableRow.addCell(formatValue(current), "alignRight", 1);
   tableRow.addCell(formatValue(previous), "alignRight", 1);

   /* ABIII2 */
   tableRow = table.addRow();
   tableRow.addCell("2) crediti", "alignLeft bold", 1);
   tableRow.addCell("", "alignRight", 1);
   tableRow.addCell("", "alignRight", 1);

   /* ABIII2a */
   obj = banDoc.currentBalance("Gr=ABIII2a", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "ABIII2a").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("a) crediti verso imprese controllate", "alignLeft", 1);
   tableRow.addCell(formatValue(current), "alignRight", 1);
   tableRow.addCell(formatValue(previous), "alignRight", 1);

   /* ABIII2b */
   obj = banDoc.currentBalance("Gr=ABIII2b", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "ABIII2b").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("b) crediti verso imprese collegate", "alignLeft", 1);
   tableRow.addCell(formatValue(current), "alignRight", 1);
   tableRow.addCell(formatValue(previous), "alignRight", 1);

   /* ABIII2c */
   obj = banDoc.currentBalance("Gr=ABIII2c", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "ABIII2c").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("c) crediti verso altri enti del Terzo settore", "alignLeft", 1);
   tableRow.addCell(formatValue(current), "alignRight", 1);
   tableRow.addCell(formatValue(previous), "alignRight", 1);

   /* ABIII2d */
   obj = banDoc.currentBalance("Gr=ABIII2d", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "ABIII2d").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("d) crediti verso altri", "alignLeft", 1);
   tableRow.addCell(formatValue(current), "alignRight", 1);
   tableRow.addCell(formatValue(previous), "alignRight", 1);

   /* ABIII3 */
   obj = banDoc.currentBalance("Gr=ABIII3", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "ABIII3").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("3) altri titoli", "alignLeft", 1);
   tableRow.addCell(formatValue(current), "alignRight", 1);
   tableRow.addCell(formatValue(previous), "alignRight", 1);

   /* tot ABIII */
   obj = banDoc.currentBalance("Gr=ABIII", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "ABIII").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("Totale immobilizzazioni finanziarie", "alignLeft bold", 1);
   tableRow.addCell(formatValue(current), "alignRight bold", 1);
   tableRow.addCell(formatValue(previous), "alignRight bold", 1);

   /* tot AB */
   obj = banDoc.currentBalance("Gr=AB", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "AB").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("Totale immobilizzazioni", "alignLeft bold", 1);
   tableRow.addCell(formatValue(current), "alignRight bold", 1);
   tableRow.addCell(formatValue(previous), "alignRight bold", 1);

   /* AC */
   tableRow = table.addRow();
   tableRow.addCell("C) attivo circolante", "alignLeft bold", 1);
   tableRow.addCell("", "alignRight", 1);
   tableRow.addCell("", "alignRight", 1);

   /* ACI */
   tableRow = table.addRow();
   tableRow.addCell("I - rimanenze", "alignLeft bold", 1);
   tableRow.addCell("", "alignRight", 1);
   tableRow.addCell("", "alignRight", 1);

   /* ACI1 */
   obj = banDoc.currentBalance("Gr=ACI1", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "ACI1").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("1) rimanenze materie prime, sussidiarie e di consumo", 1);
   tableRow.addCell(formatValue(current), "alignRight", 1);
   tableRow.addCell(formatValue(previous), "alignRight", 1);

   /* ACI2 */
   obj = banDoc.currentBalance("Gr=ACI2", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "ACI2").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("2) rimanenze prodotti in corso di lavorazione e semilavorati", 1);
   tableRow.addCell(formatValue(current), "alignRight", 1);
   tableRow.addCell(formatValue(previous), "alignRight", 1);

   /* ACI3 */
   obj = banDoc.currentBalance("Gr=ACI3", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "ACI3").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("3) rimanenze lavori in corso su ordinazione", 1);
   tableRow.addCell(formatValue(current), "alignRight", 1);
   tableRow.addCell(formatValue(previous), "alignRight", 1);

   /* ACI4 */
   obj = banDoc.currentBalance("Gr=ACI4", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "ACI4").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("4) rimanenze prodotti finiti e merci", 1);
   tableRow.addCell(formatValue(current), "alignRight", 1);
   tableRow.addCell(formatValue(previous), "alignRight", 1);

   /* ACI5 */
   obj = banDoc.currentBalance("Gr=ACI5", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "ACI5").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("5) rimanenze acconti", 1);
   tableRow.addCell(formatValue(current), "alignRight", 1);
   tableRow.addCell(formatValue(previous), "alignRight", 1);

   /* tot ACI */
   obj = banDoc.currentBalance("Gr=ACI", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "ACI").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("Totale rimanenze", "alignLeft bold", 1);
   tableRow.addCell(formatValue(current), "alignRight bold", 1);
   tableRow.addCell(formatValue(previous), "alignRight bold", 1);

   /* ACII */
   tableRow = table.addRow();
   tableRow.addCell("II - crediti, con separata indicazione aggiuntiva, per ciascuna voce, degli importi esigibili oltre l'esercizio successivo", "alignLeft bold", 1);
   tableRow.addCell("", "alignRight", 1);
   tableRow.addCell("", "alignRight", 1);

   /* ACII1 */
   obj = banDoc.currentBalance("Gr=ACII1", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "ACII1").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("1) crediti verso utenti e clienti", 1);
   tableRow.addCell(formatValue(current), "alignRight", 1);
   tableRow.addCell(formatValue(previous), "alignRight", 1);

   /* ACII2 */
   obj = banDoc.currentBalance("Gr=ACII2", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "ACII2").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("2) crediti verso associati e fondatori", 1);
   tableRow.addCell(formatValue(current), "alignRight", 1);
   tableRow.addCell(formatValue(previous), "alignRight", 1);

   /* ACII3 */
   obj = banDoc.currentBalance("Gr=ACII3", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "ACII3").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("3) crediti verso enti pubblici", 1);
   tableRow.addCell(formatValue(current), "alignRight", 1);
   tableRow.addCell(formatValue(previous), "alignRight", 1);

   /* ACII4 */
   obj = banDoc.currentBalance("Gr=ACII4", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "ACII4").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("4) crediti verso soggetti privati per contributi", 1);
   tableRow.addCell(formatValue(current), "alignRight", 1);
   tableRow.addCell(formatValue(previous), "alignRight", 1);

   /* ACII5 */
   obj = banDoc.currentBalance("Gr=ACII5", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "ACII5").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("5) Crediti verso enti della stessa rete associativa", 1);
   tableRow.addCell(formatValue(current), "alignRight", 1);
   tableRow.addCell(formatValue(previous), "alignRight", 1);

   /* ACII6 */
   obj = banDoc.currentBalance("Gr=ACII6", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "ACII6").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("6) crediti verso altri enti del Terzo settore", 1);
   tableRow.addCell(formatValue(current), "alignRight", 1);
   tableRow.addCell(formatValue(previous), "alignRight", 1);

   /* ACII7 */
   obj = banDoc.currentBalance("Gr=ACII7", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "ACII7").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("7) crediti verso imprese controllate", 1);
   tableRow.addCell(formatValue(current), "alignRight", 1);
   tableRow.addCell(formatValue(previous), "alignRight", 1);

   /* ACII8 */
   obj = banDoc.currentBalance("Gr=ACII8", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "ACII8").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("8) crediti verso imprese collegate", 1);
   tableRow.addCell(formatValue(current), "alignRight", 1);
   tableRow.addCell(formatValue(previous), "alignRight", 1);

   /* ACII9 */
   obj = banDoc.currentBalance("Gr=ACII9", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "ACII9").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("9) crediti tributari", 1);
   tableRow.addCell(formatValue(current), "alignRight", 1);
   tableRow.addCell(formatValue(previous), "alignRight", 1);

   /* ACII10 */
   obj = banDoc.currentBalance("Gr=ACII10", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "ACII10").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("10) crediti da 5 per mille", 1);
   tableRow.addCell(formatValue(current), "alignRight", 1);
   tableRow.addCell(formatValue(previous), "alignRight", 1);

   /* ACII11 */
   obj = banDoc.currentBalance("Gr=ACII11", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "ACII11").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("11) crediti per imposte anticipate", 1);
   tableRow.addCell(formatValue(current), "alignRight", 1);
   tableRow.addCell(formatValue(previous), "alignRight", 1);

   /* ACII12 */
   obj = banDoc.currentBalance("Gr=ACII12", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "ACII12").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("12) crediti verso altri", 1);
   tableRow.addCell(formatValue(current), "alignRight", 1);
   tableRow.addCell(formatValue(previous), "alignRight", 1);

   /* tot ACII */
   obj = banDoc.currentBalance("Gr=ACII", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "ACII").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("Totale crediti", "alignLeft bold", 1);
   tableRow.addCell(formatValue(current), "alignRight bold", 1);
   tableRow.addCell(formatValue(previous), "alignRight bold", 1);

   /* ACIII */
   tableRow = table.addRow();
   tableRow.addCell("III - attività finanziarie che non costituiscono immobilizzazioni", "alignLeft bold", 1);
   tableRow.addCell("", "alignRight", 1);
   tableRow.addCell("", "alignRight", 1);

   /* ACIII1 */
   obj = banDoc.currentBalance("Gr=ACIII1", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "ACIII1").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("1) partecipazioni in imprese controllate", 1);
   tableRow.addCell(formatValue(current), "alignRight", 1);
   tableRow.addCell(formatValue(previous), "alignRight", 1);

   /* ACIII2 */
   obj = banDoc.currentBalance("Gr=ACIII2", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "ACIII2").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("2) partecipazioni in imprese collegate", 1);
   tableRow.addCell(formatValue(current), "alignRight", 1);
   tableRow.addCell(formatValue(previous), "alignRight", 1);

   /* ACIII3 */
   obj = banDoc.currentBalance("Gr=ACIII3", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "ACIII3").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("3) altri titoli", 1);
   tableRow.addCell(formatValue(current), "alignRight", 1);
   tableRow.addCell(formatValue(previous), "alignRight", 1);

   /* tot ACIII */
   obj = banDoc.currentBalance("Gr=ACIII", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "ACIII").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("Totale attività finanziarie non immobilizzazioni", "alignLeft bold", 1);
   tableRow.addCell(formatValue(current), "alignRight bold", 1);
   tableRow.addCell(formatValue(previous), "alignRight bold", 1);

   /* ACIV */
   tableRow = table.addRow();
   tableRow.addCell("IV - disponibilità liquide", "alignLeft bold", 1);
   tableRow.addCell("", "alignRight", 1);
   tableRow.addCell("", "alignRight", 1);

   /* ACIV1 */
   obj = banDoc.currentBalance("Gr=ACIV1", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "ACIV1").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("1) depositi bancari e postali", 1);
   tableRow.addCell(formatValue(current), "alignRight", 1);
   tableRow.addCell(formatValue(previous), "alignRight", 1);

   /* ACIV2 */
   obj = banDoc.currentBalance("Gr=ACIV2", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "ACIV2").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("2) assegni", 1);
   tableRow.addCell(formatValue(current), "alignRight", 1);
   tableRow.addCell(formatValue(previous), "alignRight", 1);

   /* ACIV3 */
   obj = banDoc.currentBalance("Gr=ACIV3", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "ACIV3").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("3) danaro e valori in cassa", 1);
   tableRow.addCell(formatValue(current), "alignRight", 1);
   tableRow.addCell(formatValue(previous), "alignRight", 1);

   /* tot ACIV */
   obj = banDoc.currentBalance("Gr=ACIV", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "ACIV").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("Totale disponibilità liquide", "alignLeft bold", 1);
   tableRow.addCell(formatValue(current), "alignRight bold", 1);
   tableRow.addCell(formatValue(previous), "alignRight bold", 1);

   /* tot AC */
   obj = banDoc.currentBalance("Gr=AC", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "AC").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("Totale attivo circolante", "alignLeft bold", 1);
   tableRow.addCell(formatValue(current), "alignRight bold", 1);
   tableRow.addCell(formatValue(previous), "alignRight bold", 1);

   /* AD */
   obj = banDoc.currentBalance("Gr=AD", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "AD").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("D) Ratei e risconti attivi", "bold", 1);
   tableRow.addCell(formatValue(current), "alignRight", 1);
   tableRow.addCell(formatValue(previous), "alignRight", 1);

   report.addPageBreak();

   /**************************************************************************************
   * PASSIVO
   **************************************************************************************/
   report.addParagraph(title, "heading2");

   var table = report.addTable("table");
   var column1 = table.addColumn("column1");
   var column2 = table.addColumn("column2");
   var column3 = table.addColumn("column3");

   tableRow = table.addRow();
   tableRow.addCell("Passivo", "styleTableHeader alignLeft", 1);
   tableRow.addCell(Banana.Converter.toLocaleDateFormat(startDate), "styleTableHeader alignCenter", 1);
   tableRow.addCell("31.12." + previousYear, "styleTableHeader alignCenter", 1);

   tableRow = table.addRow();
   tableRow.addCell("A) patrimonio netto", "alignLeft bold", 1);
   tableRow.addCell("", "alignRight", 1);
   tableRow.addCell("", "alignRight", 1);

   /* PAI */
   obj = banDoc.currentBalance("Gr=PAI", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "PAI").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("I - fondo di dotazione dell'ente", "bold", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(current)), "alignRight", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previous)), "alignRight", 1);

   /* PAII */
   tableRow = table.addRow();
   tableRow.addCell("II - patrimonio vincolato", "alignLeft bold", 1);
   tableRow.addCell("", "alignRight", 1);
   tableRow.addCell("", "alignRight", 1);

   /* PAII1 */
   obj = banDoc.currentBalance("Gr=PAII1", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "PAII1").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("1) riserve statutarie", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(current)), "alignRight", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previous)), "alignRight", 1);

   /* PAII2 */
   obj = banDoc.currentBalance("Gr=PAII2", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "PAII2").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("2) riserve vincolate per decisione degli organi istituzionali", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(current)), "alignRight", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previous)), "alignRight", 1);

   /* PAII3 */
   obj = banDoc.currentBalance("Gr=PAII3", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "PAII3").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("3) riserve vincolate destinate da terzi", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(current)), "alignRight", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previous)), "alignRight", 1);

   /* tot PAII */
   obj = banDoc.currentBalance("Gr=PAII", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "PAII").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("Totale patrimonio vincolato", "alignLeft bold", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(current)), "alignRight bold", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previous)), "alignRight bold", 1);

   /* PAIII */
   tableRow = table.addRow();
   tableRow.addCell("III - patrimonio libero", "alignLeft bold", 1);
   tableRow.addCell("", "alignRight", 1);
   tableRow.addCell("", "alignRight", 1);

   /* PAIII1 */
   obj = banDoc.currentBalance("Gr=PAIII1", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "PAIII1").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("1) riserve di utili o avanzi di gestione", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(current)), "alignRight", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previous)), "alignRight", 1);

   /* PAIII2 */
   obj = banDoc.currentBalance("Gr=PAIII2", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "PAIII2").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("2) altre riserve", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(current)), "alignRight", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previous)), "alignRight", 1);

   /* tot PAIII */
   obj = banDoc.currentBalance("Gr=PAIII", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "PAIII").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("Totale patrimonio libero", "alignLeft bold", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(current)), "alignRight bold", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previous)), "alignRight bold", 1);

   /* PAIV */
   obj = banDoc.currentBalance("Gr=PAIV", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "PAIV").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("IV - avanzo/disavanzo d'esercizio", "bold", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(current)), "alignRight", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previous)), "alignRight", 1);

   /* tot PA */
   obj = banDoc.currentBalance("Gr=PA", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "PA").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("Totale patrimonio netto", "alignLeft bold", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(current)), "alignRight bold", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previous)), "alignRight bold", 1);

   /* PB */
   tableRow = table.addRow();
   tableRow.addCell("B) fondi per rischi e oneri", "alignLeft bold", 1);
   tableRow.addCell("", "alignRight", 1);
   tableRow.addCell("", "alignRight", 1);

   /* PB1 */
   obj = banDoc.currentBalance("Gr=PB1", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "PB1").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("1) fondi per trattamento di quiescenza e obblighi simili", "", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(current)), "alignRight", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previous)), "alignRight", 1);

   /* PB2 */
   obj = banDoc.currentBalance("Gr=PB2", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "PB2").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("2) fondi per imposte, anche differite", "", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(current)), "alignRight", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previous)), "alignRight", 1);

   /* PB3 */
   obj = banDoc.currentBalance("Gr=PB3", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "PB3").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("3) fondi altri", "", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(current)), "alignRight", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previous)), "alignRight", 1);

   /* tot PB */
   obj = banDoc.currentBalance("Gr=PB", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "PB").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("Totale fondi per rischi e oneri", "alignLeft bold", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(current)), "alignRight bold", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previous)), "alignRight bold", 1);

   /* PC */
   obj = banDoc.currentBalance("Gr=PC", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "PC").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("C) Fondi trattamento di fine rapporto di lavoro subordinato", "bold", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(current)), "alignRight", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previous)), "alignRight", 1);

   /* PD */
   tableRow = table.addRow();
   tableRow.addCell("D) debiti, con separata indicazione aggiuntiva, per ciascuna voce, degli importi esigibili oltre l'esercizio successivo", "alignLeft bold", 1);
   tableRow.addCell("", "alignRight", 1);
   tableRow.addCell("", "alignRight", 1);

   /* PD1 */
   obj = banDoc.currentBalance("Gr=PD1", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "PD1").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("1) debiti verso banche", "", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(current)), "alignRight", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previous)), "alignRight", 1);

   /* PD2 */
   obj = banDoc.currentBalance("Gr=PD2", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "PD2").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("2) debiti verso altri finanziatori", "", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(current)), "alignRight", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previous)), "alignRight", 1);

   /* PD3 */
   obj = banDoc.currentBalance("Gr=PD3", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "PD3").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("3) debiti verso associati e fondatori per finanziamenti", "", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(current)), "alignRight", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previous)), "alignRight", 1);

   /* PD4 */
   obj = banDoc.currentBalance("Gr=PD4", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "PD4").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("4) debiti verso enti della stessa rete associativa", "", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(current)), "alignRight", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previous)), "alignRight", 1);

   /* PD5 */
   obj = banDoc.currentBalance("Gr=PD5", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "PD5").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("5) debiti per erogazioni liberali condizionate", "", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(current)), "alignRight", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previous)), "alignRight", 1);

   /* PD6 */
   obj = banDoc.currentBalance("Gr=PD6", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "PD6").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("6) acconti (Debiti)", "", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(current)), "alignRight", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previous)), "alignRight", 1);

   /* PD7 */
   obj = banDoc.currentBalance("Gr=PD7", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "PD7").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("7) debiti verso fornitori", "", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(current)), "alignRight", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previous)), "alignRight", 1);

   /* PD8 */
   obj = banDoc.currentBalance("Gr=PD8", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "PD8").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("8) debiti verso imprese controllate e collegate", "", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(current)), "alignRight", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previous)), "alignRight", 1);

   /* PD9 */
   obj = banDoc.currentBalance("Gr=PD9", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "PD9").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("9) debiti tributari", "", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(current)), "alignRight", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previous)), "alignRight", 1);

   /* PD10 */
   obj = banDoc.currentBalance("Gr=PD10", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "PD10").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("10) debiti verso istituti di previdenza e di sicurezza sociale", "", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(current)), "alignRight", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previous)), "alignRight", 1);

   /* PD11 */
   obj = banDoc.currentBalance("Gr=PD11", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "PD11").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("11) debiti verso dipendenti e collaboratori", "", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(current)), "alignRight", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previous)), "alignRight", 1);

   /* PD12 */
   obj = banDoc.currentBalance("Gr=PD12", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "PD12").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("12) altri debiti", "", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(current)), "alignRight", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previous)), "alignRight", 1);

   /* tot PD */
   obj = banDoc.currentBalance("Gr=PD", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "PD").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("Totale debiti", "alignLeft bold", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(current)), "alignRight bold", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previous)), "alignRight bold", 1);

   /* PE */
   obj = banDoc.currentBalance("Gr=PE", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "PE").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("E) ratei e risconti passivi", "bold", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(current)), "alignRight", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previous)), "alignRight", 1);


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




// MANCANO I TOTALI "sum":"" PASSIVO
function loadForm() {

   var form = [];
   form.push({"id":"row1", "gr":"AA", "bClass":"1", "description":"A) quote associative o apporti ancora dovuti"});
   form.push({"id":"row2", "gr":"", "bClass":"", "description":"B) immobilizzazioni"});
   form.push({"id":"row3", "gr":"", "bClass":"", "description":"I - immobilizzazioni immateriali"});
   form.push({"id":"row4", "gr":"ABI1", "bClass":"1", "description":"1) costi di impianto e di ampliamento"});
   form.push({"id":"row5", "gr":"ABI2", "bClass":"1", "description":"2) costi di sviluppo"});
   form.push({"id":"row6", "gr":"ABI3", "bClass":"1", "description":"3) diritti di brevetto industriale e diritti di utilizzazione delle opere dell'ingegno"});
   form.push({"id":"row7", "gr":"ABI4", "bClass":"1", "description":"4) concessioni, licenze, marchi e diritti simili"});
   form.push({"id":"row8", "gr":"ABI5", "bClass":"1", "description":"5) avviamento"});
   form.push({"id":"row9", "gr":"ABI6", "bClass":"1", "description":"6) immobilizzazioni in corso e acconti"});
   form.push({"id":"row10", "gr":"ABI7", "bClass":"1", "description":"7) altre Immobilizzazioni immateriali"});
   form.push({"id":"row11", "gr":"ABI", "bClass":"1", "description":"Totale immobilizzazioni immateriali", "sum":"ABI1;ABI2;ABI3;ABI4;ABI5;ABI6;ABI7"});
   form.push({"id":"row12", "gr":"", "bClass":"", "description":"II - immobilizzazioni materiali"});
   form.push({"id":"row13", "gr":"ABII1", "bClass":"1", "description":"1) terreni e fabbricati"});
   form.push({"id":"row14", "gr":"ABII2", "bClass":"1", "description":"2) impianti e macchinari"});
   form.push({"id":"row15", "gr":"ABII3", "bClass":"1", "description":"3) attrezzature"});
   form.push({"id":"row16", "gr":"ABII4", "bClass":"1", "description":"4) altri beni"});
   form.push({"id":"row17", "gr":"ABII5", "bClass":"1", "description":"5) immobilizzazioni in corso e acconti"});
   form.push({"id":"row18", "gr":"ABII", "bClass":"1", "description":"Totale immobilizzazioni materiali", "sum":"ABII1;ABII2;ABII3;ABII4;ABII5"});
   form.push({"id":"row19", "gr":"", "bClass":"", "description":"III - immobilizzazioni finanziarie, con separata indicazione aggiuntiva, per ciascuna voce dei crediti, degli importi esigibili entro l'esercizio successivo"});
   form.push({"id":"row20", "gr":"ABIII1", "bClass":"1", "description":"1) partecipazioni"});
   form.push({"id":"row21", "gr":"ABIII1a", "bClass":"1", "description":"a) partecipazioni in imprese controllate"});
   form.push({"id":"row22", "gr":"ABIII1b", "bClass":"1", "description":"b) partecipazioni in imprese collegate"});
   form.push({"id":"row23", "gr":"ABIII1c", "bClass":"1", "description":"c) partecipazioni in altre imprese"});
   form.push({"id":"row24", "gr":"ABIII2", "bClass":"1", "description":"2) crediti"});
   form.push({"id":"row25", "gr":"ABIII2a", "bClass":"1", "description":"a) crediti verso imprese controllate"});
   form.push({"id":"row26", "gr":"ABIII2b", "bClass":"1", "description":"b) crediti verso imprese collegate"});
   form.push({"id":"row27", "gr":"ABIII2c", "bClass":"1", "description":"c) crediti verso altri enti del Terzo settore"});
   form.push({"id":"row28", "gr":"ABIII2d", "bClass":"1", "description":"d) crediti verso altri"});
   form.push({"id":"row29", "gr":"ABIII3", "bClass":"1", "description":"3) altri titoli"});
   form.push({"id":"row30", "gr":"ABIII", "bClass":"1", "description":"Totale immobilizzazioni finanziarie", "sum":"ABIII1;ABIII1a;ABIII1b;ABIII1c;ABIII2;ABIII2a;ABIII2b;ABIII2c;ABIII2d;ABIII3"});
   form.push({"id":"row31", "gr":"AB", "bClass":"1", "description":"Totale immobilizzazioni", "sum":"ABI;ABII;ABIII"});
   form.push({"id":"row32", "gr":"", "bClass":"", "description":"C) attivo circolante"});
   form.push({"id":"row33", "gr":"", "bClass":"", "description":"I - rimanenze"});
   form.push({"id":"row34", "gr":"ACI1", "bClass":"1", "description":"1) rimanenze materie prime, sussidiarie e di consumo"});
   form.push({"id":"row35", "gr":"ACI2", "bClass":"1", "description":"2) rimanenze prodotti in corso di lavorazione e semilavorati"});
   form.push({"id":"row36", "gr":"ACI3", "bClass":"1", "description":"3) rimanenze lavori in corso su ordinazione"});
   form.push({"id":"row37", "gr":"ACI4", "bClass":"1", "description":"4) rimanenze prodotti finiti e merci"});
   form.push({"id":"row38", "gr":"ACI5", "bClass":"1", "description":"5) rimanenze acconti"});
   form.push({"id":"row39", "gr":"ACI", "bClass":"1", "description":"Totale rimanenze", "sum":"ACI1;ACI2;ACI3;ACI4;ACI5"});
   form.push({"id":"row40", "gr":"", "bClass":"", "description":"II - crediti, con separata indicazione aggiuntiva, per ciascuna voce, degli importi esigibili oltre l'esercizio successivo"});
   form.push({"id":"row41", "gr":"ACII1", "bClass":"1", "description":"1) crediti verso utenti e clienti"});
   form.push({"id":"row42", "gr":"ACII2", "bClass":"1", "description":"2) crediti verso associati e fondatori"});
   form.push({"id":"row43", "gr":"ACII3", "bClass":"1", "description":"3) crediti verso enti pubblici"});
   form.push({"id":"row44", "gr":"ACII4", "bClass":"1", "description":"4) crediti verso soggetti privati per contributi"});
   form.push({"id":"row45", "gr":"ACII5", "bClass":"1", "description":"5) Crediti verso enti della stessa rete associativa"});
   form.push({"id":"row46", "gr":"ACII6", "bClass":"1", "description":"6) crediti verso altri enti del Terzo settore"});
   form.push({"id":"row47", "gr":"ACII7", "bClass":"1", "description":"7) crediti verso imprese controllate"});
   form.push({"id":"row48", "gr":"ACII8", "bClass":"1", "description":"8) crediti verso imprese collegate"});
   form.push({"id":"row49", "gr":"ACII9", "bClass":"1", "description":"9) crediti tributari"});
   form.push({"id":"row50", "gr":"ACII10", "bClass":"1", "description":"10) crediti da 5 per mille"});
   form.push({"id":"row51", "gr":"ACII11", "bClass":"1", "description":"11) crediti per imposte anticipate"});
   form.push({"id":"row52", "gr":"ACII12", "bClass":"1", "description":"12) crediti verso altri"});
   form.push({"id":"row53", "gr":"ACII", "bClass":"1", "description":"Totale crediti", "sum":"ACII1;ACII2;ACII3;ACII4;ACII5;ACII6;ACII7;ACII8;ACII9;ACII10;ACII11;ACII12"});
   form.push({"id":"row54", "gr":"", "bClass":"", "description":"III - attività finanziarie che non costituiscono immobilizzazioni"});
   form.push({"id":"row55", "gr":"ACIII1", "bClass":"1", "description":"1) partecipazioni in imprese controllate"});
   form.push({"id":"row56", "gr":"ACIII2", "bClass":"1", "description":"2) partecipazioni in imprese collegate"});
   form.push({"id":"row57", "gr":"ACIII3", "bClass":"1", "description":"3) altri titoli"});
   form.push({"id":"row58", "gr":"ACIII", "bClass":"1", "description":"Totale attività finanziarie non immobilizzazioni", "sum":"ACIII1;ACIII2;ACIII3"});
   form.push({"id":"row59", "gr":"", "bClass":"", "description":"IV - disponibilità liquide"});
   form.push({"id":"row60", "gr":"ACIV1", "bClass":"1", "description":"1) depositi bancari e postali"});
   form.push({"id":"row61", "gr":"ACIV2", "bClass":"1", "description":"2) assegni"});
   form.push({"id":"row62", "gr":"ACIV3", "bClass":"1", "description":"3) danaro e valori in cassa"});
   form.push({"id":"row63", "gr":"ACIV", "bClass":"1", "description":"Totale disponibilità liquide", "sum":"ACIV1;ACIV2;ACIV3"});
   form.push({"id":"row64", "gr":"AC", "bClass":"1", "description":"Totale attivo circolante", "sum":"ACI;ACII;ACIII;ACIV"});
   form.push({"id":"row65", "gr":"AD", "bClass":"1", "description":"D) Ratei e risconti attivi"});

   form.push({"id":"row66", "gr":"", "bClass":"", "description":"A) patrimonio netto"});
   form.push({"id":"row67", "gr":"PAI", "bClass":"2", "description":"I - fondo di dotazione dell'ente"});
   form.push({"id":"row68", "gr":"", "bClass":"", "description":"II - patrimonio vincolato"});
   form.push({"id":"row69", "gr":"PAII1", "bClass":"2", "description":"1) riserve statutarie"});
   form.push({"id":"row70", "gr":"PAII2", "bClass":"2", "description":"2) riserve vincolate per decisione degli organi istituzionali"});
   form.push({"id":"row71", "gr":"PAII3", "bClass":"2", "description":"3) riserve vincolate destinate da terzi"});
   form.push({"id":"row72", "gr":"PAII", "bClass":"2", "description":"Totale patrimonio vincolato"});
   form.push({"id":"row73", "gr":"", "bClass":"", "description":"III - patrimonio libero"});
   form.push({"id":"row74", "gr":"PAIII1", "bClass":"2", "description":"1) riserve di utili o avanzi di gestione"});
   form.push({"id":"row75", "gr":"PAIII2", "bClass":"2", "description":"2) altre riserve"});
   form.push({"id":"row76", "gr":"PAIII", "bClass":"2", "description":"Totale patrimonio libero"});
   form.push({"id":"row77", "gr":"PAIV", "bClass":"2", "description":"IV - avanzo/disavanzo d'esercizio"});
   form.push({"id":"row78", "gr":"PA", "bClass":"2", "description":"Totale patrimonio netto"});
   form.push({"id":"row79", "gr":"", "bClass":"", "description":"B) fondi per rischi e oneri"});
   form.push({"id":"row80", "gr":"PB1", "bClass":"2", "description":"1) fondi per trattamento di quiescenza e obblighi simili"});
   form.push({"id":"row81", "gr":"PB2", "bClass":"2", "description":"2) fondi per imposte, anche differite"});
   form.push({"id":"row82", "gr":"PB3", "bClass":"2", "description":"3) fondi altri"});
   form.push({"id":"row83", "gr":"PB", "bClass":"2", "description":"Totale fondi per rischi e oneri"});
   form.push({"id":"row84", "gr":"PC", "bClass":"2", "description":"C) Fondi trattamento di fine rapporto di lavoro subordinato"});
   form.push({"id":"row85", "gr":"", "bClass":"", "description":"D) debiti, con separata indicazione aggiuntiva, per ciascuna voce, degli importi esigibili oltre l'esercizio successivo"});
   form.push({"id":"row86", "gr":"PD1", "bClass":"2", "description":"1) debiti verso banche"});
   form.push({"id":"row87", "gr":"PD2", "bClass":"2", "description":"2) debiti verso altri finanziatori"});
   form.push({"id":"row88", "gr":"PD3", "bClass":"2", "description":"3) debiti verso associati e fondatori per finanziamenti"});
   form.push({"id":"row89", "gr":"PD4", "bClass":"2", "description":"4) debiti verso enti della stessa rete associativa"});
   form.push({"id":"row90", "gr":"PD5", "bClass":"2", "description":"5) debiti per erogazioni liberali condizionate"});
   form.push({"id":"row91", "gr":"PD6", "bClass":"2", "description":"6) acconti (Debiti)"});
   form.push({"id":"row92", "gr":"PD7", "bClass":"2", "description":"7) debiti verso fornitori"});
   form.push({"id":"row93", "gr":"PD8", "bClass":"2", "description":"8) debiti verso imprese controllate e collegate"});
   form.push({"id":"row94", "gr":"PD9", "bClass":"2", "description":"9) debiti tributari"});
   form.push({"id":"row95", "gr":"PD10", "bClass":"2", "description":"10) debiti verso istituti di previdenza e di sicurezza sociale"});
   form.push({"id":"row96", "gr":"PD11", "bClass":"2", "description":"11) debiti verso dipendenti e collaboratori"});
   form.push({"id":"row97", "gr":"PD12", "bClass":"2", "description":"12) altri debiti"});
   form.push({"id":"row98", "gr":"PD", "bClass":"2", "description":"Totale debiti"});
   form.push({"id":"row99", "gr":"PE", "bClass":"2", "description":"E) ratei e risconti passivi"});
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