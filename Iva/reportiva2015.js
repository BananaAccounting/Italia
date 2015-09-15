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
// @id = ch.banana.addon.reportIVA2015
// @api = 1.0
// @pubdate = 2015-09-15
// @publisher = Banana.ch SA
// @description = Report IVA 2015
// @task = app.command
// @doctype = 100.110;100.130
// @docproperties = italia
// @outputformat = none
// @inputdataform = none
// @timeout = -1





//Create the param object with some parameters
var param = {
	"reportName":"Report IVA Italia 2015",
	"bananaVersion":"Banana Accounting, v. " + Banana.document.info("Base", "ProgramVersion"),
	"scriptVersion":"script v. 2015-09-15 (TEST VERSION)",
	"headerLeft" : Banana.document.info("Base","HeaderLeft"),
	"headerRight" : Banana.document.info("Base","HeaderRight"),
	"startDate" : Banana.document.info("AccountingDataBase","OpeningDate"),
	"endDate" : Banana.document.info("AccountingDataBase","ClosureDate"),
	"year" : Banana.Converter.toDate(Banana.document.info("AccountingDataBase","OpeningDate")).getFullYear(),
	"basicCurrency" : Banana.document.info("AccountingDataBase","BasicCurrency"),
	"fiscalNumber":Banana.document.info("AccountingDataBase","FiscalNumber"),
	"company":Banana.document.info("AccountingDataBase","Company"),
	"address":Banana.document.info("AccountingDataBase","Address1"),
	"nation":Banana.document.info("AccountingDataBase","Country"),
	"telephone":Banana.document.info("AccountingDataBase","Phone"),
	"zip":Banana.document.info("AccountingDataBase","Zip"),
	"city":Banana.document.info("AccountingDataBase","City"),
	"grColumn" : "Gr1",
	"formatNumber" : true,
	"rounding" : 2,
	
	//Possibilità di aggiungere del testo proprio
	"title" : "STAMPA SCRIPT IVA 2015"
};



//The purpose of this function is to create and load the structure that will contains all the data used to create the report
var form = [];
function loadForm() {

	//Quadro VE
	form.push({"id":"VE1.1", "gr":"VE1", "vatClass":"2", "description":"Cifra d'affari imponibile 2%"});	
	form.push({"id":"VE1.2", "gr":"VE1", "vatClass":"4", "description":"Imposta IVA 2%"});	
	
	form.push({"id":"VE22.1", "gr":"VE22", "vatClass":"2", "description":"Cifra d'affari imponibile 20%"});
	form.push({"id":"VE22.2", "gr":"VE22", "vatClass":"4", "description":"Imposta IVA 20%"});

	form.push({"id":"VE23", "gr":"", "sum":"VE1.1;VE22.1", "description":"TOTALI (somma dei righi da VE1 a VE9 e da VE20 a VE22)"});
	
	form.push({"id":"VE24", "gr":"VE24", "vatClass":"", "description":"Variazioni e arrotondamenti d'imposta (indicare con il segno +/-)"});
	
	form.push({"id":"VE25", "gr":"", "sum":"VE23;VE24", "description":"TOTALE (VE23 +/- VE24)"});

	form.push({"id":"VE30.1", "gr":"VE30", "vatClass":"2", "description":"Operazioni che concorrono alla formazione del plafond"});
	form.push({"id":"VE30.2", "gr":"VE30.2", "vatClass":"2", "description":"Esportazioni"});
	form.push({"id":"VE30.3", "gr":"VE30.3", "vatClass":"2", "description":"Cessioni intercomunitari"});

	//Quadro VF
	form.push({"id":"VF11.1", "gr":"VF11", "vatClass":"4", "description":"Imponibile detrazioni 20%"});
	form.push({"id":"VF11.2", "gr":"VF11", "vatClass":"2", "description":"Imposta in detrazioni 20%"});

	//Quadro VL
	// form.push({"id":"VL1", "gr":"VL1", "sum":"VE25;VJ17", "description":"IVA debito (somma dei righi VE25 e VJ17)"});
	// form.push({"id":"VL2", "gr":"VL2", "sum":"", "description":"IVA detraibile (da riga VF57)"});
	// form.push({"id":"VL3", "gr":"VL3", "sum":"VL1;-VL2", "description":"IMPOSTA DOVUTA (VL1 - VL2)"});
	// form.push({"id":"VL4", "gr":"VL4", "sum":"-VL1;VL2", "description":"IMPOSTA A CREDITO (VL2 - VL1)"});
	
	//Altri quadri ...
}




//Main function
function exec(string) {
	
	//Check if we are on an opened document
	if (!Banana.document) {
		return;
	}

	Banana.document.clearMessages();

	// 1. Create and load the form
	loadForm();

	// 2. Extract the data, calculate and load the balances
	loadBalances();
	//loadVatBalances();

	// 3. Calculate the totals
	calcTotals(["amount"]);

	// 4. Format all the values
	formatValues(["amount"]);

	// 5. Create and print the report
	printReport();

}




//The purpose of this function is to create and print the report
function printReport() {

	var report = Banana.Report.newReport(param.reportName);

	report.addParagraph(param.title, "heading1");
	report.addParagraph(" ");
	report.addParagraph(param.headerLeft + " - " + param.headerRight, "heading3");
	report.addParagraph("Periodo contabile: " + Banana.Converter.toLocaleDateFormat(param.startDate) + " - " + Banana.Converter.toLocaleDateFormat(param.endDate), "heading4");
	report.addParagraph(" ");
	
	var table = report.addTable("table");
	tableRow = table.addRow();
	tableRow.addCell("ID", "bold", 1);
	tableRow.addCell("GRUPPO", "bold", 1)
	tableRow.addCell("DESCRIZIONE", "bold", 1);
	tableRow.addCell("IMPORTO", "bold", 1);

	for (var k = 0; k < form.length; k++) {
	
	if (form[k].sum) {
		tableRow = table.addRow();
		tableRow.addCell(form[k].id, "bold", 1);
		tableRow.addCell(form[k].gr, "bold", 1);
		tableRow.addCell(form[k].description, "bold", 1);
		tableRow.addCell(getBalance(form[k].gr), "alignRight bold", 1);
	} else {
		tableRow = table.addRow();
		tableRow.addCell(form[k].id, "", 1);
		tableRow.addCell(form[k].gr, "", 1);
		tableRow.addCell(form[k].description, "", 1);
		tableRow.addCell(getBalance(form[k].gr), "alignRight", 1);
		}
	}

	//Print the report
	var stylesheet = createStyleSheet();
	Banana.Report.preview(report, stylesheet);
}



//**************************************************************************************************************************

//The purpose of this function is to load all the balances and save the values into the form
function loadBalances() {
	for (var k = 0; k < form.length; k++) {
		if (form[k]["gr"]){
			form[k]["amount"] = calculateGr1Balance(form[k]["gr"], form[k]["vatClass"], param["grColumn"], param["startDate"], param["endDate"]);
		}
	}
}

//The purpose of this function is to calculate all the balances of the accounts belonging to the same group (Gr1)
function calculateGr1Balance(gr, vatClass, grColumn, startDate, endDate) {
	
		var grCodes = getAccountsListForGr(Banana.document.table("VatCodes"), gr, "VatCode", grColumn);
		grCodes = grCodes.join("|");

		var currentBal = Banana.document.vatCurrentBalance(grCodes, startDate, endDate);

		//vatClass decide the value to use:
		// 1 = Vorsteuer vatTaxable
		// 2 = Umsatzsteur vatTaxable  
		// 3 = Vorsteuer vatPosted  
		// 4 = Umsatzsteur vatPosted  
		if (vatClass === "1") {
			if (currentBal.vatTaxable != 0) {
				return currentBal.vatTaxable;
			}
		}
		else if (vatClass === "2") {
			if (currentBal.vatTaxable != 0) {
				return Banana.SDecimal.invert(currentBal.vatTaxable);
			}
		}
		else if (vatClass === "3") {
			if (currentBal.vatPosted != 0) {
				return currentBal.vatPosted;
			}
		}
		else if (vatClass === "4") {
			if (currentBal.vatPosted != 0) {
				return Banana.SDecimal.invert(currentBal.vatPosted);
			}
		}
}

//The purpose of this function is to get a list of the account belonging to the same "Gr1"
function getAccountsListForGr(table, grText, codeColumn, grColumn) {
	
	if (!grColumn) {
		grColumn = "Gr1";
	}
	
	var str = [];
	
	for (var i = 0; i < table.rowCount; i++) {
		var tRow = table.row(i);
		var grRow = tRow.value(grColumn);

		if (grRow === grText) {
			str.push(tRow.value(codeColumn));
		}
	}

	//Removing duplicates
	for (var i = 0; i < str.length; i++) {
		for (var x = i+1; x < str.length; x++) {
			if (str[x] === str[i]) {
				str.splice(x,1);
				--x;
			}
		}
	}

	//Return the final string
	return str;
}

//**************************************************************************************************************************






// //The main purpose of this function is to get all VAT codes of the same group and create a string with them, using the character "|" as separator
// function getVatCodes(vatCodesTable, codeStr) {

// 	var str = [];

// 	//Loop to take the values of each rows of the table
// 	for (var i = 0; i < vatCodesTable.rowCount; i++) {
// 		var tRow = vatCodesTable.row(i);
// 		var gr1 = tRow.value("Gr1");
// 		var vatCode = tRow.value("VatCode");

// 		//Check if there are Gr1 and VatCode values
// 		if (gr1 && vatCode) {

// 			//If Gr1 column contains other characters (in this case ";") we know there are more values.
// 			//We have to split them and take all values separately.
// 			//If there are only alphanumeric characters in Gr1 column we know there is only one value and we take it.
// 			var vatCodeString = gr1;
// 			var arrVatCodeString = vatCodeString.split(";");
// 			for (var j = 0; j < arrVatCodeString.length; j++) {
// 				var vatCodeString1 = arrVatCodeString[j];
// 				if (vatCodeString1 === codeStr) {
// 					str.push(vatCode);
// 				}
// 			}
// 		}
// 	}

// 	//Removing duplicates
// 	for (var i = 0; i < str.length; i++) {
// 		for (var x = i+1; x < str.length; x++) {
// 			if (str[x] === str[i]) {
// 				str.splice(x,1);
// 				--x;
// 			}
// 		}
// 	}


// 	// //We return the array adding a separator between elements
// 	return str;
// }


// //The purpose of this function is to calculate the vatTaxable and vatAmount balances, then load these values into the structure
// function loadVatBalances() {

// 	var vatCodes = Banana.document.table("VatCodes");
// 	if (vatCodes === undefined || !vatCodes) {
// 		Banana.document.addMessage("VatCodes table not found.");
// 		return;
// 	}

// 	for (var i in form) {
// 		var grCodes = getVatCodes(vatCodes, getObject(form, form[i]["id"]).gr);
// 		grCodes = grCodes.join("|");

// 		var currentBal = Banana.document.vatCurrentBalance(grCodes, param.startDate, param.endDate);

// 		//vatClass decide the value to use:
// 		// 1 = Vorsteuer vatTaxable
// 		// 2 = Umsatzsteur vatTaxable  
// 		// 3 = Vorsteuer vatPosted  
// 		// 4 = Umsatzsteur vatPosted  
// 		if (form[i]["vatClass"] === "1") {
// 			if (currentBal.vatTaxable != 0) {
// 				form[i]["amount"] = currentBal.vatTaxable;
// 			}
// 		}
// 		else if (form[i]["vatClass"] === "2") {
// 			if (currentBal.vatTaxable != 0) {
// 				form[i]["amount"] = Banana.SDecimal.invert(currentBal.vatTaxable);
// 			}
// 		}
// 		else if (form[i]["vatClass"] === "3") {
// 			if (currentBal.vatPosted != 0) {
// 				form[i]["amount"] = currentBal.vatPosted;
// 			}
// 		}
// 		else if (form[i]["vatClass"] === "4") {
// 			if (currentBal.vatPosted != 0) {
// 				form[i]["amount"] = Banana.SDecimal.invert(currentBal.vatPosted);
// 			}
// 		}
// 	}
// }

//****************************************************************************************************************************

















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
function getDescription(gr) {
	var searchGr = gr.trim();
	for (var i = 0; i < form.length; i++) {
		if (form[i]["gr"]) {
			if (form[i]["gr"] === searchGr) {
				return form[i]["description"];
			}
		} else {
			if (form[i]["id"] === searchGr) {
				return form[i]["description"];
			}
		}

	}
	throw "Couldn't find object with gr: " + gr;
}

//The purpose of this function is to get the Balance from an object
function getBalance(gr) {
	var searchGr = gr.trim();
	for (var i = 0; i < form.length; i++) {
		if (form[i]["gr"] === searchGr) {
			return form[i]["amount"];
		}
	}
	throw "Couldn't find object with gr: " + gr;
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
					valueObj[fieldName] = Banana.SDecimal.add(valueObj[fieldName], fieldValue, {'decimals' : param.rounding});
				}
			}
		}
	} else if (valueObj.gr) {
		//Already calculated in loadBalances()
	}
}

//The main purpose of this function is to create styles for the report print
function createStyleSheet() {
	var stylesheet = Banana.Report.newStyleSheet();

    var pageStyle = stylesheet.addStyle("@page");
    pageStyle.setAttribute("margin", "10mm 10mm 10mm 10mm");

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
	//style.setAttribute("font-family", "Courier New");

	style = stylesheet.addStyle(".heading1");
	style.setAttribute("font-size", "16px");
	style.setAttribute("font-weight", "bold");
	
	style = stylesheet.addStyle(".heading2");
	style.setAttribute("font-size", "14px");
	style.setAttribute("font-weight", "bold");

	style = stylesheet.addStyle(".heading3");
	style.setAttribute("font-size", "12px");
	style.setAttribute("font-weight", "bold");

	style = stylesheet.addStyle(".heading4");
	style.setAttribute("font-size", "9px");
	style.setAttribute("font-weight", "bold");

	// style = stylesheet.addStyle(".horizontalLine");
	// style.setAttribute("border-top", "1px solid black");

	// style = stylesheet.addStyle(".rowNumber");
	// style.setAttribute("font-size", "9px");

	style = stylesheet.addStyle(".valueAmount");
	style.setAttribute("font-size", "9px");
	style.setAttribute("font-weight", "bold");
	style.setAttribute("padding-bottom", "5px"); 
	style.setAttribute("background-color", "#eeeeee"); 
	style.setAttribute("text-align", "right");
	
	// style = stylesheet.addStyle(".valueDate");
	// style.setAttribute("font-size", "9px");
	// style.setAttribute("font-weight", "bold");
	// style.setAttribute("padding-bottom", "5px"); 
	// style.setAttribute("background-color", "#eeeeee"); 

	style = stylesheet.addStyle(".valueText");
	style.setAttribute("font-size", "9px");
	style.setAttribute("font-weight", "bold");
	style.setAttribute("padding-bottom", "5px");
	style.setAttribute("padding-top", "5px");
	style.setAttribute("background-color", "#eeeeee"); 
	
	style = stylesheet.addStyle(".valueTitle");
	style.setAttribute("font-size", "9px");
	style.setAttribute("font-weight", "bold");
	//style.setAttribute("padding-bottom", "5px"); 
	//style.setAttribute("padding-top", "5px");
	style.setAttribute("background-color", "#000000");
	style.setAttribute("color", "#fff");
	
	style = stylesheet.addStyle(".valueTitle1");
	style.setAttribute("font-size", "9px");
	style.setAttribute("font-weight", "bold");
	style.setAttribute("padding-bottom", "5px"); 
	style.setAttribute("padding-top", "5px");
	
	// style = stylesheet.addStyle(".valueTotal");
	// style.setAttribute("font-size", "9px");
	// style.setAttribute("font-weight", "bold");
	// style.setAttribute("padding-bottom", "5px"); 
	// style.setAttribute("background-color", "#eeeeee"); 
	// style.setAttribute("text-align", "right");
	// style.setAttribute("border-bottom", "1px double black");

	//Tables
	style = stylesheet.addStyle("tableInfo");
	style.setAttribute("width", "100%");
	style.setAttribute("font-size", "8px");
	//stylesheet.addStyle("table.tableInfo td", "border: thin solid black");

	style = stylesheet.addStyle("tableChoices");
	style.setAttribute("width", "100%");
	style.setAttribute("font-size", "8px");

	style = stylesheet.addStyle("table");
	style.setAttribute("width", "100%");
	style.setAttribute("font-size", "8px");
	stylesheet.addStyle("table.table td", "border: thin solid black");

	style = stylesheet.addStyle("table2");
	style.setAttribute("width", "100%");
	style.setAttribute("font-size", "8px");
	//stylesheet.addStyle("table.table2 td", "border: thin solid black");

	style = stylesheet.addStyle("table3");
	style.setAttribute("width", "100%");
	style.setAttribute("font-size", "8px");
	//stylesheet.addStyle("table.table3 td", "border: thin solid black");



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


	

	//Warning message.
	style = stylesheet.addStyle(".warningMsg");
	style.setAttribute("font-weight", "bold");
	style.setAttribute("color", "red");
	style.setAttribute("font-size", "10");



	return stylesheet;
}

