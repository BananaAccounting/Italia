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
// @id = ch.banana.it.extension.statopatrimoniale.mod.a
// @api = 1.0
// @pubdate = 2020-07-06
// @publisher = Banana.ch SA
// @description = Stato patrimoniale (MOD. A)
// @task = app.command
// @doctype = 100.100
// @docproperties = 
// @outputformat = none
// @inputdatasource = none
// @timeout = -1


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
   tableRow.addCell("", "", 1);
   tableRow.addCell(Banana.Converter.toLocaleDateFormat(startDate), "table-header", 1);
   tableRow.addCell("31.12." + previousYear, "table-header", 1);

   tableRow = table.addRow();
   tableRow.addCell("ATTIVO", "assetsTitle", 3);

   /* AA */
   obj = banDoc.currentBalance("Gr=AA", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "AA").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("A) Quote associative o apporti ancora dovuti", "description-groups-titles", 1);
   tableRow.addCell(formatValue(current), "amount-groups-titles", 1);
   tableRow.addCell(formatValue(previous), "amount-groups-titles", 1);

   tableRow = table.addRow();
   tableRow.addCell("B) Immobilizzazioni", "description-groups-titles", 1);
   tableRow.addCell("", "amount-groups-titles", 1);
   tableRow.addCell("", "amount-groups-titles", 1);

   tableRow = table.addRow();
   tableRow.addCell("    I - Immobilizzazioni immateriali", "description-groups", 1);
   tableRow.addCell("", "amount-groups", 1);
   tableRow.addCell("", "amount-groups", 1);

   /* ABI1 */
   obj = banDoc.currentBalance("Gr=ABI1", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "ABI1").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("        1) costi di impianto e di ampliamento", "description-groups", 1);
   tableRow.addCell(formatValue(current), "amount-groups", 1);
   tableRow.addCell(formatValue(previous), "amount-groups", 1);

   /* ABI2 */
   obj = banDoc.currentBalance("Gr=ABI2", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "ABI2").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("        2) costi di sviluppo", "description-groups", 1);
   tableRow.addCell(formatValue(current), "amount-groups", 1);
   tableRow.addCell(formatValue(previous), "amount-groups", 1);

   /* ABI3 */
   obj = banDoc.currentBalance("Gr=ABI3", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "ABI3").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("        3) diritti di brevetto industriale e diritti di utilizzazione delle opere dell'ingegno", "description-groups", 1);
   tableRow.addCell(formatValue(current), "amount-groups", 1);
   tableRow.addCell(formatValue(previous), "amount-groups", 1);

   /* ABI4 */
   obj = banDoc.currentBalance("Gr=ABI4", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "ABI4").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("        4) concessioni, licenze, marchi e diritti simili", "description-groups", 1);
   tableRow.addCell(formatValue(current), "amount-groups", 1);
   tableRow.addCell(formatValue(previous), "amount-groups", 1);

   /* ABI5 */
   obj = banDoc.currentBalance("Gr=ABI5", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "ABI5").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("        5) avviamento", "description-groups", 1);
   tableRow.addCell(formatValue(current), "amount-groups", 1);
   tableRow.addCell(formatValue(previous), "amount-groups", 1);

   /* ABI6 */
   obj = banDoc.currentBalance("Gr=ABI6", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "ABI6").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("        6) immobilizzazioni in corso e acconti", "description-groups", 1);
   tableRow.addCell(formatValue(current), "amount-groups", 1);
   tableRow.addCell(formatValue(previous), "amount-groups", 1);

   /* ABI7 */
   obj = banDoc.currentBalance("Gr=ABI7", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "ABI7").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("        7) altre Immobilizzazioni immateriali", "description-groups", 1);
   tableRow.addCell(formatValue(current), "amount-groups", 1);
   tableRow.addCell(formatValue(previous), "amount-groups", 1);

   /* tot ABI */
   obj = banDoc.currentBalance("Gr=ABI", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "ABI").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("    Totale immobilizzazioni immateriali", "description-groups-totals", 1);
   tableRow.addCell(formatValue(current), "amount-groups-totals", 1);
   tableRow.addCell(formatValue(previous), "amount-groups-totals", 1);

   tableRow = table.addRow();
   tableRow.addCell("    II - Immobilizzazioni materiali", "description-groups", 1);
   tableRow.addCell("", "amount-groups", 1);
   tableRow.addCell("", "amount-groups", 1);

   /* ABII1 */
   obj = banDoc.currentBalance("Gr=ABII1", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "ABII1").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("        1) terreni e fabbricati", "description-groups", 1);
   tableRow.addCell(formatValue(current), "amount-groups", 1);
   tableRow.addCell(formatValue(previous), "amount-groups", 1);

   /* ABII2 */
   obj = banDoc.currentBalance("Gr=ABII2", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "ABII2").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("        2) impianti e macchinari", "description-groups", 1);
   tableRow.addCell(formatValue(current), "amount-groups", 1);
   tableRow.addCell(formatValue(previous), "amount-groups", 1);

   /* ABII3 */
   obj = banDoc.currentBalance("Gr=ABII3", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "ABII3").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("        3) attrezzature", "description-groups", 1);
   tableRow.addCell(formatValue(current), "amount-groups", 1);
   tableRow.addCell(formatValue(previous), "amount-groups", 1);

   /* ABII4 */
   obj = banDoc.currentBalance("Gr=ABII4", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "ABII4").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("        4) altri beni", "description-groups", 1);
   tableRow.addCell(formatValue(current), "amount-groups", 1);
   tableRow.addCell(formatValue(previous), "amount-groups", 1);

   /* ABII5 */
   obj = banDoc.currentBalance("Gr=ABII5", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "ABII5").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("        5) immobilizzazioni in corso e acconti", "description-groups", 1);
   tableRow.addCell(formatValue(current), "amount-groups", 1);
   tableRow.addCell(formatValue(previous), "amount-groups", 1);

   /* tot ABII */
   obj = banDoc.currentBalance("Gr=ABII", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "ABII").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("    Totale immobilizzazioni materiali", "description-groups-totals", 1);
   tableRow.addCell(formatValue(current), "amount-groups-totals", 1);
   tableRow.addCell(formatValue(previous), "amount-groups-totals", 1);

   tableRow = table.addRow();
   tableRow.addCell("    III - Immobilizzazioni finanziarie", "description-groups", 1);
   tableRow.addCell("", "amount-groups", 1);
   tableRow.addCell("", "amount-groups", 1);

   /* ABIII1 */
   tableRow = table.addRow();
   tableRow.addCell("        1) Partecipazioni", "description-groups", 1);
   tableRow.addCell("", "amount-groups", 1);
   tableRow.addCell("", "amount-groups", 1);

   /* ABIII1a */
   obj = banDoc.currentBalance("Gr=ABIII1a", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "ABIII1a").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("            a) partecipazioni in imprese controllate", "description-groups", 1);
   tableRow.addCell(formatValue(current), "amount-groups", 1);
   tableRow.addCell(formatValue(previous), "amount-groups", 1);

   /* ABIII1b */
   obj = banDoc.currentBalance("Gr=ABIII1b", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "ABIII1b").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("            b) partecipazioni in imprese collegate", "description-groups", 1);
   tableRow.addCell(formatValue(current), "amount-groups", 1);
   tableRow.addCell(formatValue(previous), "amount-groups", 1);

   /* ABIII1c */
   obj = banDoc.currentBalance("Gr=ABIII1c", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "ABIII1c").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("            c) partecipazioni in altre imprese", "description-groups", 1);
   tableRow.addCell(formatValue(current), "amount-groups", 1);
   tableRow.addCell(formatValue(previous), "amount-groups", 1);

   /* ABIII2 */
   tableRow = table.addRow();
   tableRow.addCell("        2) Crediti", "description-groups", 1);
   tableRow.addCell("", "amount-groups", 1);
   tableRow.addCell("", "amount-groups", 1);

   /* ABIII2a */
   obj = banDoc.currentBalance("Gr=ABIII2a", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "ABIII2a").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("            a) crediti verso imprese controllate", "description-groups", 1);
   tableRow.addCell(formatValue(current), "amount-groups", 1);
   tableRow.addCell(formatValue(previous), "amount-groups", 1);

   /* ABIII2b */
   obj = banDoc.currentBalance("Gr=ABIII2b", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "ABIII2b").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("            b) crediti verso imprese collegate", "description-groups", 1);
   tableRow.addCell(formatValue(current), "amount-groups", 1);
   tableRow.addCell(formatValue(previous), "amount-groups", 1);

   /* ABIII2c */
   obj = banDoc.currentBalance("Gr=ABIII2c", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "ABIII2c").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("            c) crediti verso altri enti del Terzo settore", "description-groups", 1);
   tableRow.addCell(formatValue(current), "amount-groups", 1);
   tableRow.addCell(formatValue(previous), "amount-groups", 1);

   /* ABIII2d */
   obj = banDoc.currentBalance("Gr=ABIII2d", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "ABIII2d").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("            d) crediti verso altri", "description-groups", 1);
   tableRow.addCell(formatValue(current), "amount-groups", 1);
   tableRow.addCell(formatValue(previous), "amount-groups", 1);

   /* ABIII3 */
   obj = banDoc.currentBalance("Gr=ABIII3", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "ABIII3").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("        3) Altri titoli", "description-groups", 1);
   tableRow.addCell(formatValue(current), "amount-groups", 1);
   tableRow.addCell(formatValue(previous), "amount-groups", 1);

   /* tot ABIII */
   obj = banDoc.currentBalance("Gr=ABIII", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "ABIII").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("    Totale immobilizzazioni finanziarie", "description-groups-totals", 1);
   tableRow.addCell(formatValue(current), "amount-groups-totals", 1);
   tableRow.addCell(formatValue(previous), "amount-groups-totals", 1);

   /* tot AB */
   obj = banDoc.currentBalance("Gr=AB", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "AB").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("Totale immobilizzazioni B)", "description-totals", 1);
   tableRow.addCell(formatValue(current), "amount-totals", 1);
   tableRow.addCell(formatValue(previous), "amount-totals", 1);

   /* AC */
   tableRow = table.addRow();
   tableRow.addCell("C) Attivo circolante", "description-groups-titles", 1);
   tableRow.addCell("", "amount-groups-titles", 1);
   tableRow.addCell("", "amount-groups-titles", 1);

   /* ACI */
   tableRow = table.addRow();
   tableRow.addCell("    I - Rimanenze", "description-groups", 1);
   tableRow.addCell("", "amount-groups", 1);
   tableRow.addCell("", "amount-groups", 1);

   /* ACI1 */
   obj = banDoc.currentBalance("Gr=ACI1", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "ACI1").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("        1) Rimanenze materie prime, sussidiarie e di consumo", "description-groups" ,1);
   tableRow.addCell(formatValue(current), "amount-groups", 1);
   tableRow.addCell(formatValue(previous), "amount-groups", 1);

   /* ACI2 */
   obj = banDoc.currentBalance("Gr=ACI2", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "ACI2").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("        2) Rimanenze prodotti in corso di lavorazione e semilavorati", "description-groups" , 1);
   tableRow.addCell(formatValue(current), "amount-groups", 1);
   tableRow.addCell(formatValue(previous), "amount-groups", 1);

   /* ACI3 */
   obj = banDoc.currentBalance("Gr=ACI3", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "ACI3").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("        3) Rimanenze lavori in corso su ordinazione", "description-groups" , 1);
   tableRow.addCell(formatValue(current), "amount-groups", 1);
   tableRow.addCell(formatValue(previous), "amount-groups", 1);

   /* ACI4 */
   obj = banDoc.currentBalance("Gr=ACI4", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "ACI4").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("        4) Rimanenze prodotti finiti e merci", "description-groups" , 1);
   tableRow.addCell(formatValue(current), "amount-groups", 1);
   tableRow.addCell(formatValue(previous), "amount-groups", 1);

   /* ACI5 */
   obj = banDoc.currentBalance("Gr=ACI5", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "ACI5").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("        5) Rimanenze acconti", "description-groups" , 1);
   tableRow.addCell(formatValue(current), "amount-groups", 1);
   tableRow.addCell(formatValue(previous), "amount-groups", 1);

   /* tot ACI */
   obj = banDoc.currentBalance("Gr=ACI", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "ACI").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("    Totale rimanenze", "description-groups-totals", 1);
   tableRow.addCell(formatValue(current), "amount-groups-totals", 1);
   tableRow.addCell(formatValue(previous), "amount-groups-totals", 1);

   /* ACII */
   tableRow = table.addRow();
   tableRow.addCell("    II - Crediti", "description-groups", 1);
   tableRow.addCell("", "amount-groups", 1);
   tableRow.addCell("", "amount-groups", 1);

   /* ACII1 */
   obj = banDoc.currentBalance("Gr=ACII1", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "ACII1").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("        1) Crediti verso utenti e clienti", "description-groups", 1);
   tableRow.addCell(formatValue(current), "amount-groups", 1);
   tableRow.addCell(formatValue(previous), "amount-groups", 1);

   /* ACII2 */
   obj = banDoc.currentBalance("Gr=ACII2", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "ACII2").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("        2) Crediti verso associati e fondatori", "description-groups", 1);
   tableRow.addCell(formatValue(current), "amount-groups", 1);
   tableRow.addCell(formatValue(previous), "amount-groups", 1);

   /* ACII3 */
   obj = banDoc.currentBalance("Gr=ACII3", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "ACII3").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("        3) Crediti verso enti pubblici", "description-groups", 1);
   tableRow.addCell(formatValue(current), "amount-groups", 1);
   tableRow.addCell(formatValue(previous), "amount-groups", 1);

   /* ACII4 */
   obj = banDoc.currentBalance("Gr=ACII4", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "ACII4").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("        4) Crediti verso soggetti privati per contributi", "description-groups", 1);
   tableRow.addCell(formatValue(current), "amount-groups", 1);
   tableRow.addCell(formatValue(previous), "amount-groups", 1);

   /* ACII5 */
   obj = banDoc.currentBalance("Gr=ACII5", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "ACII5").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("        5) Crediti verso enti della stessa rete associativa", "description-groups", 1);
   tableRow.addCell(formatValue(current), "amount-groups", 1);
   tableRow.addCell(formatValue(previous), "amount-groups", 1);

   /* ACII6 */
   obj = banDoc.currentBalance("Gr=ACII6", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "ACII6").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("        6) Crediti verso altri enti del Terzo settore", "description-groups", 1);
   tableRow.addCell(formatValue(current), "amount-groups", 1);
   tableRow.addCell(formatValue(previous), "amount-groups", 1);

   /* ACII7 */
   obj = banDoc.currentBalance("Gr=ACII7", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "ACII7").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("        7) Crediti verso imprese controllate", "description-groups", 1);
   tableRow.addCell(formatValue(current), "amount-groups", 1);
   tableRow.addCell(formatValue(previous), "amount-groups", 1);

   /* ACII8 */
   obj = banDoc.currentBalance("Gr=ACII8", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "ACII8").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("        8) Crediti verso imprese collegate", "description-groups", 1);
   tableRow.addCell(formatValue(current), "amount-groups", 1);
   tableRow.addCell(formatValue(previous), "amount-groups", 1);

   /* ACII9 */
   obj = banDoc.currentBalance("Gr=ACII9", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "ACII9").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("        9) Crediti tributari", "description-groups", 1);
   tableRow.addCell(formatValue(current), "amount-groups", 1);
   tableRow.addCell(formatValue(previous), "amount-groups", 1);

   /* ACII10 */
   obj = banDoc.currentBalance("Gr=ACII10", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "ACII10").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("        10) Crediti da 5 per mille", "description-groups", 1);
   tableRow.addCell(formatValue(current), "amount-groups", 1);
   tableRow.addCell(formatValue(previous), "amount-groups", 1);

   /* ACII11 */
   obj = banDoc.currentBalance("Gr=ACII11", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "ACII11").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("        11) Crediti per imposte anticipate", "description-groups", 1);
   tableRow.addCell(formatValue(current), "amount-groups", 1);
   tableRow.addCell(formatValue(previous), "amount-groups", 1);

   /* ACII12 */
   obj = banDoc.currentBalance("Gr=ACII12", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "ACII12").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("        12) Crediti verso altri", "description-groups", 1);
   tableRow.addCell(formatValue(current), "amount-groups", 1);
   tableRow.addCell(formatValue(previous), "amount-groups", 1);

   /* tot ACII */
   obj = banDoc.currentBalance("Gr=ACII", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "ACII").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("    Totale crediti", "description-groups-totals", 1);
   tableRow.addCell(formatValue(current), "amount-groups-totals", 1);
   tableRow.addCell(formatValue(previous), "amount-groups-totals", 1);

   /* ACIII */
   tableRow = table.addRow();
   tableRow.addCell("    III - Attività finanziarie che non costituiscono immobilizzazioni", "description-groups", 1);
   tableRow.addCell("", "amount-groups", 1);
   tableRow.addCell("", "amount-groups", 1);

   /* ACIII1 */
   obj = banDoc.currentBalance("Gr=ACIII1", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "ACIII1").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("        1) Partecipazioni in imprese controllate", "description-groups", 1);
   tableRow.addCell(formatValue(current), "amount-groups", 1);
   tableRow.addCell(formatValue(previous), "amount-groups", 1);

   /* ACIII2 */
   obj = banDoc.currentBalance("Gr=ACIII2", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "ACIII2").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("        2) Partecipazioni in imprese collegate", "description-groups", 1);
   tableRow.addCell(formatValue(current), "amount-groups", 1);
   tableRow.addCell(formatValue(previous), "amount-groups", 1);

   /* ACIII3 */
   obj = banDoc.currentBalance("Gr=ACIII3", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "ACIII3").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("        3) Altri titoli", "description-groups", 1);
   tableRow.addCell(formatValue(current), "amount-groups", 1);
   tableRow.addCell(formatValue(previous), "amount-groups", 1);

   /* tot ACIII */
   obj = banDoc.currentBalance("Gr=ACIII", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "ACIII").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("    Totale attività finanziarie che non costituiscono immobilizzazioni", "description-groups-totals", 1);
   tableRow.addCell(formatValue(current), "amount-groups-totals", 1);
   tableRow.addCell(formatValue(previous), "amount-groups-totals", 1);

   /* ACIV */
   tableRow = table.addRow();
   tableRow.addCell("    IV - Disponibilità liquide", "description-groups", 1);
   tableRow.addCell("", "amount-groups", 1);
   tableRow.addCell("", "amount-groups", 1);

   /* ACIV1 */
   obj = banDoc.currentBalance("Gr=ACIV1", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "ACIV1").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("        1) Depositi bancari e postali", "description-groups", 1);
   tableRow.addCell(formatValue(current), "amount-groups", 1);
   tableRow.addCell(formatValue(previous), "amount-groups", 1);

   /* ACIV2 */
   obj = banDoc.currentBalance("Gr=ACIV2", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "ACIV2").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("        2) Assegni", "description-groups", 1);
   tableRow.addCell(formatValue(current), "amount-groups", 1);
   tableRow.addCell(formatValue(previous), "amount-groups", 1);

   /* ACIV3 */
   obj = banDoc.currentBalance("Gr=ACIV3", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "ACIV3").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("        3) Danaro e valori in cassa", "description-groups", 1);
   tableRow.addCell(formatValue(current), "amount-groups", 1);
   tableRow.addCell(formatValue(previous), "amount-groups", 1);

   /* tot ACIV */
   obj = banDoc.currentBalance("Gr=ACIV", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "ACIV").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("    Totale disponibilità liquide", "description-groups-totals", 1);
   tableRow.addCell(formatValue(current), "amount-groups-totals", 1);
   tableRow.addCell(formatValue(previous), "amount-groups-totals", 1);

   /* tot AC */
   obj = banDoc.currentBalance("Gr=AC", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "AC").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("Totale attivo circolante C)", "description-totals", 1);
   tableRow.addCell(formatValue(current), "amount-totals", 1);
   tableRow.addCell(formatValue(previous), "amount-totals", 1);

   /* AD */
   obj = banDoc.currentBalance("Gr=AD", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "AD").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("D) Ratei e risconti attivi", "description-groups-titles", 1);
   tableRow.addCell(formatValue(current), "amount-groups-titles", 1);
   tableRow.addCell(formatValue(previous), "amount-groups-titles", 1);

   report.addPageBreak();

   /**************************************************************************************
   * PASSIVO
   **************************************************************************************/
   report.addParagraph(title, "heading2");

   var table = report.addTable("table");
   var column1 = table.addColumn("column1");
   var column2 = table.addColumn("column2");
   var column3 = table.addColumn("column3");
   var column4 = table.addColumn("column4");

   tableRow = table.addRow();
   tableRow.addCell("", "", 1);
   tableRow.addCell(Banana.Converter.toLocaleDateFormat(startDate), "table-header", 1);
   tableRow.addCell("31.12." + previousYear, "table-header", 1);

   tableRow = table.addRow();
   tableRow.addCell("PASSIVO", "liabiltiesTitle", 3);

   tableRow = table.addRow();
   tableRow.addCell("A) Patrimonio netto", "description-groups-titles", 1);
   tableRow.addCell("", "amount-groups-titles", 1);
   tableRow.addCell("", "amount-groups-titles", 1);

   /* PAI */
   obj = banDoc.currentBalance("Gr=PAI", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "PAI").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("    I - Fondo di dotazione dell'ente", "description-groups", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(current)), "amount-groups", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previous)), "amount-groups", 1);

   /* PAII */
   tableRow = table.addRow();
   tableRow.addCell("    II - Patrimonio vincolato", "description-groups", 1);
   tableRow.addCell("", "amount-groups", 1);
   tableRow.addCell("", "amount-groups", 1);

   /* PAII1 */
   obj = banDoc.currentBalance("Gr=PAII1", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "PAII1").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("        1) Riserve statutarie", "description-groups", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(current)), "amount-groups", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previous)), "amount-groups", 1);

   /* PAII2 */
   obj = banDoc.currentBalance("Gr=PAII2", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "PAII2").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("        2) Riserve vincolate per decisione degli organi istituzionali", "description-groups", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(current)), "amount-groups", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previous)), "amount-groups", 1);

   /* PAII3 */
   obj = banDoc.currentBalance("Gr=PAII3", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "PAII3").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("        3) Riserve vincolate destinate da terzi", "description-groups", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(current)), "amount-groups", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previous)), "amount-groups", 1);

   /* tot PAII */
   obj = banDoc.currentBalance("Gr=PAII", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "PAII").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("    Totale patrimonio vincolato", "description-groups-totals", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(current)), "amount-groups-totals", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previous)), "amount-groups-totals", 1);

   /* PAIII */
   tableRow = table.addRow();
   tableRow.addCell("    III - Patrimonio libero", "description-groups", 1);
   tableRow.addCell("", "amount-groups", 1);
   tableRow.addCell("", "amount-groups", 1);

   /* PAIII1 */
   obj = banDoc.currentBalance("Gr=PAIII1", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "PAIII1").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("        1) Riserve di utili o avanzi di gestione", "description-groups", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(current)), "amount-groups", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previous)), "amount-groups", 1);

   /* PAIII2 */
   obj = banDoc.currentBalance("Gr=PAIII2", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "PAIII2").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("        2) Altre riserve", "description-groups", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(current)), "amount-groups", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previous)), "amount-groups", 1);

   /* tot PAIII */
   obj = banDoc.currentBalance("Gr=PAIII", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "PAIII").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("    Totale patrimonio libero", "description-groups-totals", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(current)), "amount-groups-totals", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previous)), "amount-groups-totals", 1);

   /* PAIV */
   obj = banDoc.currentBalance("Gr=PAIV", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "PAIV").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("    IV - Avanzo/disavanzo d'esercizio", "description-groups", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(current)), "amount-groups", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previous)), "amount-groups", 1);

   /* tot PA */
   obj = banDoc.currentBalance("Gr=PA", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "PA").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("Totale patrimonio netto A)", "description-totals", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(current)), "amount-totals", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previous)), "amount-totals", 1);

   /* PB */
   tableRow = table.addRow();
   tableRow.addCell("B) Fondi per rischi e oneri", "description-groups-titles", 1);
   tableRow.addCell("", "amount-groups-titles", 1);
   tableRow.addCell("", "amount-groups-titles", 1);

   /* PB1 */
   obj = banDoc.currentBalance("Gr=PB1", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "PB1").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("    1) Fondi per trattamento di quiescenza e obblighi simili", "description-groups", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(current)), "amount-groups", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previous)), "amount-groups", 1);

   /* PB2 */
   obj = banDoc.currentBalance("Gr=PB2", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "PB2").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("    2) Fondi per imposte, anche differite", "description-groups", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(current)), "amount-groups", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previous)), "amount-groups", 1);

   /* PB3 */
   obj = banDoc.currentBalance("Gr=PB3", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "PB3").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("    3) Fondi altri", "description-groups", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(current)), "amount-groups", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previous)), "amount-groups", 1);

   /* tot PB */
   obj = banDoc.currentBalance("Gr=PB", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "PB").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("Totale fondi per rischi e oneri B)", "description-totals", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(current)), "amount-totals", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previous)), "amount-totals", 1);

   /* PC */
   obj = banDoc.currentBalance("Gr=PC", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "PC").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("C) Fondi trattamento di fine rapporto di lavoro subordinato", "description-groups-titles", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(current)), "amount-groups-titles", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previous)), "amount-groups-titles", 1);

   /* PD */
   tableRow = table.addRow();
   tableRow.addCell("D) Debiti", "description-groups-titles", 1);
   tableRow.addCell("", "amount-groups-titles", 1);
   tableRow.addCell("", "amount-groups-titles", 1);

   /* PD1 */
   obj = banDoc.currentBalance("Gr=PD1", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "PD1").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("    1) Debiti verso banche", "description-groups", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(current)), "amount-groups", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previous)), "amount-groups", 1);

   /* PD2 */
   obj = banDoc.currentBalance("Gr=PD2", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "PD2").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("    2) Debiti verso altri finanziatori", "description-groups", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(current)), "amount-groups", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previous)), "amount-groups", 1);

   /* PD3 */
   obj = banDoc.currentBalance("Gr=PD3", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "PD3").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("    3) Debiti verso associati e fondatori per finanziamenti", "description-groups", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(current)), "amount-groups", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previous)), "amount-groups", 1);

   /* PD4 */
   obj = banDoc.currentBalance("Gr=PD4", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "PD4").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("    4) Debiti verso enti della stessa rete associativa", "description-groups", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(current)), "amount-groups", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previous)), "amount-groups", 1);

   /* PD5 */
   obj = banDoc.currentBalance("Gr=PD5", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "PD5").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("    5) Debiti per erogazioni liberali condizionate", "description-groups", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(current)), "amount-groups", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previous)), "amount-groups", 1);

   /* PD6 */
   obj = banDoc.currentBalance("Gr=PD6", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "PD6").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("    6) Acconti (Debiti)", "description-groups", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(current)), "amount-groups", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previous)), "amount-groups", 1);

   /* PD7 */
   obj = banDoc.currentBalance("Gr=PD7", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "PD7").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("    7) Debiti verso fornitori", "description-groups", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(current)), "amount-groups", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previous)), "amount-groups", 1);

   /* PD8 */
   obj = banDoc.currentBalance("Gr=PD8", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "PD8").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("    8) Debiti verso imprese controllate e collegate", "description-groups", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(current)), "amount-groups", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previous)), "amount-groups", 1);

   /* PD9 */
   obj = banDoc.currentBalance("Gr=PD9", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "PD9").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("    9) Debiti tributari", "description-groups", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(current)), "amount-groups", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previous)), "amount-groups", 1);

   /* PD10 */
   obj = banDoc.currentBalance("Gr=PD10", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "PD10").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("    10) Debiti verso istituti di previdenza e di sicurezza sociale", "description-groups", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(current)), "amount-groups", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previous)), "amount-groups", 1);

   /* PD11 */
   obj = banDoc.currentBalance("Gr=PD11", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "PD11").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("    11) Debiti verso dipendenti e collaboratori", "description-groups", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(current)), "amount-groups", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previous)), "amount-groups", 1);

   /* PD12 */
   obj = banDoc.currentBalance("Gr=PD12", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "PD12").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("    12) Altri debiti", "description-groups", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(current)), "amount-groups", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previous)), "amount-groups", 1);

   /* tot PD */
   obj = banDoc.currentBalance("Gr=PD", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "PD").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("Totale debiti C)", "description-totals", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(current)), "amount-totals", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previous)), "amount-totals", 1);

   /* PE */
   obj = banDoc.currentBalance("Gr=PE", startDate, endDate);
   current = obj.balance;
   previous = banDoc.table("Accounts").findRowByValue("Group", "PE").value("Prior");
   tableRow = table.addRow();
   tableRow.addCell("E) Ratei e risconti passivi", "description-groups-titles", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(current)), "amount-groups-titles", 1);
   tableRow.addCell(formatValue(Banana.SDecimal.invert(previous)), "amount-groups-titles", 1);


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

    // var currentParam = {};
    // currentParam.name = 'exclude_zero_amounts';
    // currentParam.title = 'Escludi voci con importi nulli per due esercizi consecutivi';
    // currentParam.type = 'bool';
    // currentParam.value = userParam.exclude_zero_amounts ? true : false;
    // currentParam.defaultvalue = false;
    // currentParam.readValue = function() {
    //     userParam.exclude_zero_amounts = this.value;
    // }
    // convertedParam.data.push(currentParam);

   return convertedParam;
}

function initUserParam() {
   var userParam = {};
   userParam.title = "";
   userParam.exclude_zero_amounts = false;
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








// NON UTILIZZATE AL MOMENTO
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

