// Copyright [2015] [Banana.ch SA - Lugano Switzerland]
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
//     http://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// @id = it.banana.app.raccoltafondi
// @api = 1.0
// @pubdate = 2015-08-18
// @publisher = Banana.ch SA
// @description = Associazioni - Report raccolta fondi
// @task = app.command
// @doctype = 100.100;110.100
// @docproperties = associazioni
// @outputformat = none
// @inputdatasource = none
// @timeout = -1




//Main function
function exec(string) {
	
	//Check if we are on an opened document
	if (!Banana.document) {
		return;
	}
	
	//Check if the table "TestiReport" exists
	var tableNames = Banana.document.tableNames;
	if (tableNames.indexOf("TestiReport") < 0) {
		Banana.document.addMessage('Tabella "TestiReport" inesistente oppure nome maiuscolo/minuscolo non esatto.');
		return;
	}

	printReport();

}



//The purpose of this function is to create and print the report
function printReport() {

	var report = Banana.Report.newReport("Raccolta fondi Veneto");
	
	//Function call to create a list of "Raccolta fondi" accounts
	var accountsList = getAccountsList();

	//For each accounts we create a detailed card
	for (var j = 0; j < accountsList.length; j++) {

		//Take vale from table "Testi Report"
		var strAccount = accountsList[j];
		var startDate = Banana.document.table("TestiReport").findRowByValue("RowId", strAccount+"-DAL").value("Testo");
		var endDate = Banana.document.table("TestiReport").findRowByValue("RowId", strAccount+"-AL").value("Testo");
		var racFondi = Banana.document.table("TestiReport").findRowByValue("RowId", strAccount).value("Testo");
		var responsabile = Banana.document.table("TestiReport").findRowByValue("RowId",strAccount+"-RES").value("Testo");
		
		//Take info from Banana file and account properties
		var headerLeft = Banana.document.info("Base","HeaderLeft");
		var headerRight = Banana.document.info("Base","HeaderRight");

		var totExpenses = "";
		var totIncome = "";

		//Print the report
		report.addParagraph("RENDICONTO DELLA RACCOLTA FONDI:", "heading1");
		report.addParagraph(" ");
		report.addParagraph("'" + racFondi + "'" + " (" + strAccount +")" , "heading1 alignCenter");
		report.addParagraph(" ");
		report.addParagraph(" ");
		report.addParagraph("Associazione: " + headerLeft, "heading3");
		report.addParagraph(" ");
		report.addParagraph("Svolta dal " + startDate + " al " + endDate, "heading3");
		report.addParagraph(" ");
		report.addParagraph("Responsabile: " + responsabile, "heading3");
		report.addParagraph(" ");
		report.addParagraph(" ");
		
		//Create a table object with all transactions for the given account and period
		var transTab = Banana.document.currentCard(accountsList[j], startDate, endDate);

		//Create the table that will be printed on the report
		var table = report.addTable("table");

		//Add column titles to the table report
		var tableHeader = table.getHeader();
		tableRow = tableHeader.addRow();
		tableRow.addCell("Data", "heading3 bold");
		tableRow.addCell("Doc", "heading3 bold");
		tableRow.addCell("Descrizione", "heading3 bold");
		tableRow.addCell("Uscite", "heading3 bold");
		tableRow.addCell("Entrate", "heading3 bold");

		//Add the values taken from each row of the table (except the last one) to the respective cells of the table
		for (var i = 0; i < transTab.rowCount-1; i++) {	
			var tRow = transTab.row(i);
			tableRow = table.addRow();
			tableRow.addCell(Banana.Converter.toLocaleDateFormat(tRow.value("Date")), "heading3");
			tableRow.addCell(tRow.value("Doc"), "heading3");
			tableRow.addCell(tRow.value("JDescription"), "heading3");
			
			if (tRow.value('JDebitAmount')) {
				tableRow.addCell(Banana.Converter.toLocaleNumberFormat(tRow.value('JDebitAmount')), "heading3 alignRight");
			} else {
				tableRow.addCell("", "heading3 alignRight");
			}

			if (tRow.value('JCreditAmount')) {
				tableRow.addCell(Banana.Converter.toLocaleNumberFormat(tRow.value('JCreditAmount')), "heading3 alignRight");
			} else {
				tableRow.addCell("", "heading3 alignRight");
			}
		}

		//We add last row (totals) separately because we want to apply a different style only to this row
		for(var i = transTab.rowCount-1; i < transTab.rowCount; i++) {
			var tRow = transTab.row(i);

			tableRow = table.addRow();
			tableRow.addCell(tRow.value(" "), " ");
			tableRow.addCell(tRow.value("Doc"), "heading3");
			tableRow.addCell(tRow.value("JDescription"), "heading3 bold");
			
			if (tRow.value('JDebitAmount')) {
				tableRow.addCell(Banana.Converter.toLocaleNumberFormat(tRow.value('JDebitAmount')), "heading3 alignRight bold");
				totExpenses = tRow.value('JDebitAmount');
			} else {
				tableRow.addCell("", "heading3 alignRight");
			}

			if (tRow.value('JCreditAmount')) {
				tableRow.addCell(Banana.Converter.toLocaleNumberFormat(tRow.value('JCreditAmount')), "heading3 alignRight bold");
				totIncome = tRow.value('JCreditAmount');
			} else {
				tableRow.addCell("", "heading3 alignRight");
			}
		}

		//Calculate the difference between expenses and income amounts
		var res = Banana.SDecimal.subtract(totExpenses, totIncome);

		tableRow = table.addRow();
		tableRow.addCell("", "", 1);
		tableRow.addCell("", "", 1);

		//Print the final total, the difference between expenses and income amounts
		if (Banana.SDecimal.sign(res) == 1) { //It is an expense: amount > 0
			tableRow.addCell("DISAVANZO D'ESERCIZIO", "heading3 bold", 1);
			tableRow.addCell(Banana.Converter.toLocaleNumberFormat(res), "heading3 alignCenter bold", 2);
		} else if (Banana.SDecimal.sign(res) == -1) { //It is an income: amount < 0
			tableRow.addCell("AVANZO D'ESERCIZIO", "heading3 bold", 1);
			tableRow.addCell(Banana.Converter.toLocaleNumberFormat(Banana.SDecimal.invert(res)), "heading3 alignCenter bold", 2);
		} else { //The difference is = 0
			tableRow.addCell("AVANZO/DISAVANZO D'ESERCIZIO", "heading3 bold", 1);
			tableRow.addCell(Banana.Converter.toLocaleNumberFormat(res), "heading3 alignCenter bold", 2);
		}

		//Add all the texts taken from the "Testi Report" table
		//Each text is printed on a new line
		report.addParagraph(" ");
		report.addParagraph(" ");
		report.addParagraph("RELAZIONE ILLUSTRATIVA DELLA RACCOLTA FONDI:", "heading3");
		report.addParagraph(" ");
		var rel = loadRelazioni(strAccount);
		for (var k = 0; k < rel.length; k++) {
			report.addParagraph(rel[k], "heading3");
		}

		//Add the signatures
		report.addParagraph(" ");
		report.addParagraph(" ");
		report.addParagraph(" ");
		report.addParagraph(" ");
		var table1 = report.addTable("table1");
		tableRow = table1.addRow();
		tableRow.addCell("Firma del presidente", "alignCenter", 1);
		tableRow.addCell("Firma del tesoriere", "alignCenter", 1);
		tableRow = table1.addRow();
		tableRow.addCell(" ", "alignCenter", 1);
		tableRow.addCell(" ", "alignCenter", 1);
		tableRow = table1.addRow();
		tableRow.addCell("_____________________________", "alignCenter", 1);
		tableRow.addCell("_____________________________", "alignCenter", 1);

		//Add a page break after each account detail
		if (j !== accountsList.length-1) {
			report.addPageBreak();
		}
		
	}
	
	//Add a footer to the report
	addFooter(report);

	//Print the report
	var stylesheet = createStyleSheet();
	Banana.Report.preview(report, stylesheet);
}



//The purpose of this function is to get all the texts of the descriptions from the table "Testi Report"
function loadRelazioni(account) {
	var arrRelazione = [];
	var table = Banana.document.table("TestiReport");
	for (var i = 0; i < table.rowCount; i++) {
		var tRow = table.row(i);
	
		if (tRow.value("RowId") === account+"-REL") {

			//If there is text we use it
			if (tRow.value("Testo")) {
				arrRelazione.push(tRow.value("Testo"));
			}
			//If there is not a text (empty cell) we let a blank row
			else {
				arrRelazione.push(" ");
			}
		}
	}
	return arrRelazione;
}



//This function take from Banana table 'Accounts' all the account numbers of the segment 2 (Raccolta fondi)
function getAccountsList() {
	var arrList = [];

	if (!Banana.document.table("Categories")) {
		for (var i = 0; i < Banana.document.table('Accounts').rowCount; i++) {
			var tRow = Banana.document.table('Accounts').row(i);

			//We take only the account with segment 2 (accounts numbers that begin with "::")
			if (tRow.value("Account") && tRow.value("Account").indexOf("::") > -1 && tRow.value("Account").substring(2,3)) {
				arrList.push(tRow.value("Account"));
			}
		}
	}
	else {
		for (var i = 0; i < Banana.document.table('Categories').rowCount; i++) {
			var tRow = Banana.document.table('Categories').row(i);

			//We take only the account with segment 2 (accounts numbers that begin with "::")
			if (tRow.value("Category") && tRow.value("Category").indexOf("::") > -1 && tRow.value("Category").substring(2,3)) {
				arrList.push(tRow.value("Category"));
			}
		}
	}
	return arrList;
}



//This function adds a Footer to the report
function addFooter(report) {
   report.getFooter().addClass("footer");
   var versionLine = report.getFooter().addText("Banana Accounting - Pagina ", "description");
   report.getFooter().addFieldPageNr();
}



//The main purpose of this function is to create styles for the report print
function createStyleSheet() {
	var stylesheet = Banana.Report.newStyleSheet();

    var pageStyle = stylesheet.addStyle("@page");
    pageStyle.setAttribute("margin", "20mm 15mm 20mm 25mm");

    stylesheet.addStyle("body", "font-family : Times New Roman");

	style = stylesheet.addStyle(".footer");
	style.setAttribute("text-align", "right");
	style.setAttribute("font-size", "8px");
	style.setAttribute("font-family", "Courier New");

	style = stylesheet.addStyle(".heading1");
	style.setAttribute("font-size", "16px");
	style.setAttribute("font-weight", "bold");
	
	style = stylesheet.addStyle(".heading2");
	style.setAttribute("font-size", "14px");
	style.setAttribute("font-weight", "bold");

	style = stylesheet.addStyle(".heading3");
	style.setAttribute("font-size", "12px");

	style = stylesheet.addStyle("table");
	style.setAttribute("width", "100%");
	style.setAttribute("font-size", "12px");
	stylesheet.addStyle("table.table td", "border: thin solid black");

	style = stylesheet.addStyle(".background");
	style.setAttribute("padding-bottom", "5px");
	style.setAttribute("padding-top", "5px"); 
	style.setAttribute("background-color", "#eeeeee"); 

	style = stylesheet.addStyle(".borderLeft");
	style.setAttribute("border-left","thin solid black");

	style = stylesheet.addStyle(".borderBottom");
	style.setAttribute("border-bottom","thin solid black");

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