// Copyright [2020] [Banana.ch SA - Lugano Switzerland]
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
// @id = ch.banana.it.extension.reportraccoltafondi
// @api = 1.0
// @pubdate = 2020-10-23
// @publisher = Banana.ch SA
// @description = 5. Report raccolta fondi
// @task = app.command
// @doctype = 100.100;110.100;130.100
// @docproperties = 
// @outputformat = none
// @inputdatasource = none
// @timeout = -1
// @includejs = errors.js


var BAN_VERSION = "10.0.1";
var BAN_EXPM_VERSION = "";



/**
 * Report raccolta fondi.
 *
 * 1. Prende dalla tabella Conti/Categorie la lista di tutti i segmenti di liv 2 raccolta fondi (::RF01, ::RF02, ecc).
 * 2. Per ogni segmento aggiunge un gruppo nei parametri dell'estensione.
 * 3. Ogni gruppo ha 5 campi da compilare:
 *		- Descrizione: si inserisce la descrizione della raccolta fondi. Di default prende la descrizione del conto dalla tabella Conti/Categorie.
 *		- Data inizio: si inserisce la data di inizio raccolta fondi.
 *		- Data fine: si inserisce la data di fine raccolta fondi.
 *		- Responsabile: si inserisce il nome del responsabile.
 *		- Relazione: si inserice una relazione illustrativa della raccolta fondi. Si possono inserire più righe.  
 *
 * 4. Per ogni conto raccolta fondi viene generato una pagina di report, contantente i rispettivi dati dei parametri.
 *
 * La tabella "TestiReport" non è più necessaria, viene fatto tutto con i parametri. 
 */


//Main function
function exec(string) {
	
	// Check if we are on an opened document
	if (!Banana.document) {
		return;
	}

	// Check banana version
	var isCurrentBananaVersionSupported = bananaRequiredVersion(BAN_VERSION, BAN_EXPM_VERSION);
	if (!isCurrentBananaVersionSupported) {
		return "@Cancel";
	}

	var segmentList = getSegmentList();

	// User parameters
	var userParam = initUserParam(segmentList);
	var savedParam = Banana.document.getScriptSettings();
	if (savedParam && savedParam.length > 0) {
		userParam = JSON.parse(savedParam);
	}
	// If needed show the settings dialog to the user
	if (!options || !options.useLastSettings) {
		userParam = settingsDialog(segmentList); // From properties
	}
	if (!userParam) {
		return "@Cancel";
	}
	
	//Create the stylesheet using the css file
	var stylesheet = Banana.Report.newStyleSheet();

	//Create the report
	var report = printReport(Banana.document, userParam, segmentList, stylesheet);

	//Set styles
	setCss(Banana.document, stylesheet);
	
	//Create the report preview
	Banana.Report.preview(report, stylesheet);
}

//The purpose of this function is to create and print the report
function printReport(banDoc, userParam, segmentList, stylesheet) {

	var report = Banana.Report.newReport("Rendiconto raccolta fondi");

	// Logo
	var headerParagraph = report.getHeader().addSection();
	if (userParam.stampaLogo) {
		headerParagraph = report.addSection("");
		var logoFormat = Banana.Report.logoFormat(userParam.nomeLogo);
		if (logoFormat) {
			var logoElement = logoFormat.createDocNode(headerParagraph, stylesheet, "logo");
			report.getHeader().addChild(logoElement);
		}
	}

	
	for (var j = 0; j < segmentList.length; j++) {

		//Take vale from table "Testi Report"
		var strAccount = segmentList[j].account;
		var startDate = "";
		var endDate = "";
		var racFondi = "";
		var responsabile = "";

		startDate = userParam[segmentList[j].account+'_dataInizio'];
		endDate = userParam[segmentList[j].account+'_dataFine'];
		racFondi = userParam[segmentList[j].account+'_descrizione'];
		responsabile = userParam[segmentList[j].account+'_responsabile'];

		//Take info from Banana file and account properties
		var headerLeft = banDoc.info("Base","HeaderLeft");
		var headerRight = banDoc.info("Base","HeaderRight");

		var totExpenses = "";
		var totIncome = "";

		//Print the report
		if (userParam.stampaLogo) {
			report.addParagraph(" ", "");
			report.addParagraph(" ", "");
		}
		report.addParagraph("RENDICONTO DELLA RACCOLTA FONDI", "heading1 alignCenter");
		report.addParagraph('"' + racFondi + '"', "heading1 alignCenter");
		//report.addParagraph("(" + strAccount +")" , "heading1 alignCenter");
		report.addParagraph(" ");
		report.addParagraph(" ");
		report.addParagraph("Ente: " + headerLeft, "heading3");
		report.addParagraph(" ");
		report.addParagraph("Raccolta fondi svolta dal " + startDate + " al " + endDate, "heading3");
		report.addParagraph(" ");
		report.addParagraph("Responsabile: " + responsabile, "heading3");
		report.addParagraph(" ");
		report.addParagraph(" ");
		
		//Create a table object with all transactions for the given account and period
		var transTab = banDoc.currentCard(segmentList[j].account, startDate, endDate);

		//Create the table that will be printed on the report
		var table = report.addTable("table");

		//Add column titles to the table report
		var tableHeader = table.getHeader();
		tableRow = tableHeader.addRow();
		tableRow.addCell("Data", "heading3 bold");
		tableRow.addCell("Doc", "heading3 bold");
		tableRow.addCell("Descrizione", "heading3 bold");
		tableRow.addCell("Entrate €", "heading3 bold");
		tableRow.addCell("Uscite €", "heading3 bold");

		//Add the values taken from each row of the table (except the last one) to the respective cells of the table
		for (var i = 0; i < transTab.rowCount-1; i++) {	
			var tRow = transTab.row(i);
			tableRow = table.addRow();
			tableRow.addCell(Banana.Converter.toLocaleDateFormat(tRow.value("Date")), "heading3");
			tableRow.addCell(tRow.value("Doc"), "heading3");
			tableRow.addCell(tRow.value("JDescription"), "heading3");


			if (banDoc.table("Categories")) {
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
			else {
				if (tRow.value('JCreditAmount')) {
					tableRow.addCell(Banana.Converter.toLocaleNumberFormat(tRow.value('JCreditAmount')), "heading3 alignRight");
				} else {
					tableRow.addCell("", "heading3 alignRight");
				}

				if (tRow.value('JDebitAmount')) {
					tableRow.addCell(Banana.Converter.toLocaleNumberFormat(tRow.value('JDebitAmount')), "heading3 alignRight");
				} else {
					tableRow.addCell("", "heading3 alignRight");
				}
			}
		}

		//We add last row (totals) separately because we want to apply a different style only to this row
		for(var i = transTab.rowCount-1; i < transTab.rowCount; i++) {
			var tRow = transTab.row(i);

			tableRow = table.addRow();
			tableRow.addCell("", "", 2);
			tableRow.addCell("Totali movimenti", "heading3 bold");

			if (banDoc.table("Categories")) {
				if (tRow.value('JDebitAmount')) {
					tableRow.addCell(Banana.Converter.toLocaleNumberFormat(tRow.value('JDebitAmount')), "heading3 alignRight bold");
				} else {
					tableRow.addCell("", "heading3 alignRight");
				}

				if (tRow.value('JCreditAmount')) {
					tableRow.addCell(Banana.Converter.toLocaleNumberFormat(tRow.value('JCreditAmount')), "heading3 alignRight bold");
				} else {
					tableRow.addCell("", "heading3 alignRight");
				}

				totIncome = tRow.value('JDebitAmount');
				totExpenses = tRow.value('JCreditAmount');
			}
			else {
				if (tRow.value('JCreditAmount')) {
					tableRow.addCell(Banana.Converter.toLocaleNumberFormat(tRow.value('JCreditAmount')), "heading3 alignRight bold");
				} else {
					tableRow.addCell("", "heading3 alignRight");
				}

				if (tRow.value('JDebitAmount')) {
					tableRow.addCell(Banana.Converter.toLocaleNumberFormat(tRow.value('JDebitAmount')), "heading3 alignRight bold");
				} else {
					tableRow.addCell("", "heading3 alignRight");
				}

				totIncome = tRow.value('JCreditAmount');
				totExpenses = tRow.value('JDebitAmount');
			}
		}

		//Calculate the difference between expenses and income amounts
		var res = Banana.SDecimal.subtract(totExpenses, totIncome);

		tableRow = table.addRow();
		tableRow.addCell("", "", 2);

		//Print the final total, the difference between expenses and income amounts
		if (Banana.SDecimal.sign(res) == 1) { //It is an expense: amount > 0
			tableRow.addCell("DISAVANZO D'ESERCIZIO", "heading3 bold", 1);
			tableRow.addCell("€ "+ Banana.Converter.toLocaleNumberFormat(res), "heading3 alignCenter bold", 2);
		} else if (Banana.SDecimal.sign(res) == -1) { //It is an income: amount < 0
			tableRow.addCell("AVANZO D'ESERCIZIO", "heading3 bold", 1);
			tableRow.addCell("€ "+ Banana.Converter.toLocaleNumberFormat(Banana.SDecimal.invert(res)), "heading3 alignCenter bold", 2);
		} else { //The difference is = 0
			tableRow.addCell("AVANZO/DISAVANZO D'ESERCIZIO", "heading3 bold", 1);
			tableRow.addCell("€ "+ Banana.Converter.toLocaleNumberFormat(res), "heading3 alignCenter bold", 2);
		}

		//Add all the texts taken from the "Testi Report" table
		//Each text is printed on a new line
		report.addParagraph(" ");
		report.addParagraph(" ");
		report.addParagraph("RELAZIONE ILLUSTRATIVA DELLA RACCOLTA FONDI:", "bold heading3");
		report.addParagraph(" ");
		report.addParagraph(userParam[segmentList[j].account+'_relazione'], "heading3");

		//Add the signatures
		report.addParagraph(" ");
		report.addParagraph(" ");
		report.addParagraph(" ");
		report.addParagraph(" ");
		var table1 = report.addTable("table1");
		tableRow = table1.addRow();
		tableRow.addCell("Firma del Rappresentante Legale", "alignCenter", 1);
		tableRow.addCell("Firma del Responsabile", "alignCenter", 1);
		tableRow = table1.addRow();
		tableRow.addCell(" ", "alignCenter", 1);
		tableRow.addCell(" ", "alignCenter", 1);
		tableRow = table1.addRow();
		tableRow.addCell("_____________________________", "alignCenter", 1);
		tableRow.addCell("_____________________________", "alignCenter", 1);

		//Add a page break after each account detail
		if (j !== segmentList.length-1) {
			report.addPageBreak();
		}
	}

	return report;
}

//This function take from Banana table 'Accounts/Categories'  all the lvl 2 segments
function getSegmentList() {
	var segmentObj = [];

 //    for (var i = 0; userParam['segments'].length; ++i) {
	// 	segmentObj.push({"account":userParam['segments'][i].account, "description":userParam['segments'][i].description});	  	
	// }

	if (Banana.document.table('Categories')) {
		for (var i = 0; i < Banana.document.table('Categories').rowCount; i++) {
			var tRow = Banana.document.table('Categories').row(i);
			if (tRow.value("Category").indexOf("::") > -1 && tRow.value("Category").indexOf(":::") < 0 && tRow.value("Category").substring(2,3)) {
				segmentObj.push({"account":tRow.value("Category"), "description":tRow.value("Description")});
				//segmentObj.push(tRow.value("Category"));
			}
		}
	}
	else {
		for (var i = 0; i < Banana.document.table('Accounts').rowCount; i++) {
			var tRow = Banana.document.table('Accounts').row(i);
			if (tRow.value("Account").indexOf("::") > -1 && tRow.value("Account").indexOf(":::") < 0 && tRow.value("Account").substring(2,3)) {
				segmentObj.push({"account":tRow.value("Account"), "description":tRow.value("Description")});
				//segmentObj.push(tRow.value("Account"));
			}
		}
	}
	//Banana.console.log(JSON.stringify(segmentObj, "", " "));
	return segmentObj;
}

//The main purpose of this function is to create styles for the report print
function setCss(banDoc, repStyleObj) {
   var textCSS = "";
   var file = Banana.IO.getLocalFile("file:script/rendicontoRaccoltaFondi.css");
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
function convertParam(userParam, segmentList) {

	var convertedParam = {};
	convertedParam.version = '1.0';
	convertedParam.data = [];

	var currentParam = {};
	currentParam.name = 'stampaLogo';
	currentParam.title = 'Stampa logo';
	currentParam.type = 'bool';
	currentParam.value = userParam.stampaLogo ? true : false;
	currentParam.defaultvalue = false;
	currentParam.tooltip = "Stampa logo nell'intestazione";
	currentParam.readValue = function() {
	userParam.stampaLogo = this.value;
	}
	convertedParam.data.push(currentParam);

	var currentParam = {};
	currentParam.name = 'nomeLogo';
	currentParam.title = 'Nome composizione logo';
	currentParam.type = 'string';
	currentParam.value = userParam.nomeLogo ? userParam.nomeLogo : '';
	currentParam.defaultvalue = "Logo";
	currentParam.tooltip = 'Inserire il nome della composizione da utilizzare';
	currentParam.readValue = function() {
	userParam.nomeLogo = this.value;
	}
	convertedParam.data.push(currentParam);


	// Crea un gruppo di parametri per ogni segmento raccolta fondi
	for (var i = 0; i < segmentList.length; i++) {

		var segment = segmentList[i].account;
		var segDesc = segmentList[i].description;

		var currentParam = {};
		currentParam.name = segment;
		currentParam.title = segment;
		currentParam.type = 'string';
		currentParam.value = '';
		currentParam.editable = false;
		currentParam.readValue = function(segment) {
			userParam.segment = this.value;
		}
		convertedParam.data.push(currentParam);

		var currentParam = {};
		currentParam.name = segment+'_descrizione';
		currentParam.parentObject = segment;
		currentParam.title = 'Descrizione';
		currentParam.type = 'string';
		currentParam.value = userParam[segment+'_descrizione'] ? userParam[segment+'_descrizione'] : '';
		currentParam.defaultvalue = segDesc;
		currentParam.segment = segment;
		currentParam.tooltip = 'Inserire la descrizione della raccolta fondi';
		currentParam.readValueSegment = function(segment) {
		  userParam[segment+'_descrizione'] = this.value;
		  // userParam['segments'][segment] = this.value;
		}
		convertedParam.data.push(currentParam);

		var currentParam = {};
		currentParam.name = segment+'_dataInizio';
		currentParam.parentObject = segment;
		currentParam.title = "Data inizio";
		currentParam.type = 'string';
		currentParam.value = userParam[segment+'_dataInizio'] ? userParam[segment+'_dataInizio'] : '';
		currentParam.defaultvalue = Banana.Converter.toLocaleDateFormat(Banana.document.info("AccountingDataBase","OpeningDate"));
		currentParam.segment = segment;
		currentParam.tooltip = "Inserire la data di inizio periodo della raccolta fondi";
		currentParam.readValueSegment = function(segment) {
		  userParam[segment+'_dataInizio'] = this.value;
		}
		convertedParam.data.push(currentParam);

		var currentParam = {};
		currentParam.name = segment+'_dataFine';
		currentParam.parentObject = segment;
		currentParam.title = "Data fine";
		currentParam.type = 'string';
		currentParam.value = userParam[segment+'_dataFine'] ? userParam[segment+'_dataFine'] : '';
		currentParam.defaultvalue = Banana.Converter.toLocaleDateFormat(Banana.document.info("AccountingDataBase","ClosureDate"));
		currentParam.segment = segment;
		currentParam.tooltip = "Inserire la data di fine periodo della raccolta fondi";
		currentParam.readValueSegment = function(segment) {
		  userParam[segment+'_dataFine'] = this.value;
		}
		convertedParam.data.push(currentParam);

		var currentParam = {};
		currentParam.name = segment+'_responsabile';
		currentParam.parentObject = segment;
		currentParam.title = 'Responsabile';
		currentParam.type = 'string';
		currentParam.value = userParam[segment+'_responsabile'] ? userParam[segment+'_responsabile'] : '';
		currentParam.defaultvalue = 'Sig. Mario Rossi';
		currentParam.segment = segment;
		currentParam.tooltip = 'Inserire il nome del repsonabile';
		currentParam.readValueSegment = function(segment) {
		  userParam[segment+'_responsabile'] = this.value;
		}
		convertedParam.data.push(currentParam);

		var currentParam = {};
		currentParam.name = segment+'_relazione';
		currentParam.parentObject = segment;
		currentParam.title = 'Relazione';
		currentParam.type = 'multilinestring';
		currentParam.value = userParam[segment+'_relazione'] ? userParam[segment+'_relazione'] : '';
		currentParam.defaultvalue = 'Testo raccolta fondi\nsu più righe.\n';
		currentParam.segment = segment;
		currentParam.tooltip = 'Inserire un testo';
		currentParam.readValueSegment = function(segment) {
		  userParam[segment+'_relazione'] = this.value;
		}
		convertedParam.data.push(currentParam);

		// var currentParam = {};
		// currentParam.name = segment+'_cancella';
		// currentParam.parentObject = segment;
		// currentParam.title = 'Cancella';
		// currentParam.type = 'bool';
		// currentParam.value = userParam[segment+'_cancella'] ? true : false;
		// currentParam.defaultvalue = false;
		// currentParam.segment = segment;
		// currentParam.tooltip = 'Cancellare i dati del segmento selezionato';
		// currentParam.readValueSegment = function(segment) {
		//   userParam[segment+'_cancella'] = this.value;
		// }
		// convertedParam.data.push(currentParam);

	}

	return convertedParam;
}

function initUserParam(segmentList) {

	var userParam = {};

	userParam.stampaLogo = false;
	userParam.nomeLogo = 'Logo';

	for (var i = 0; i < segmentList.length; i++) {
		var segment = segmentList[i].account;
		var segDesc = segmentList[i].description;

		userParam[segment+'_descrizione'] = segDesc;
		userParam[segment+'_dataInizio'] = Banana.Converter.toLocaleDateFormat(Banana.document.info("AccountingDataBase","OpeningDate"));
		userParam[segment+'_dataFine'] = Banana.Converter.toLocaleDateFormat(Banana.document.info("AccountingDataBase","ClosureDate"));
		userParam[segment+'_responsabile'] = "Sig. Mario Rossi";
		userParam[segment+'_relazione'] = "Testo raccolta fondi\nsu più righe.\n";
		// userParam[segment+'_cancella'] = false;
	}

	return userParam;
}

function parametersDialog(userParam, segmentList) {
	if (typeof(Banana.Ui.openPropertyEditor) !== 'undefined') {
		var dialogTitle = "Parametri report raccolta fondi" ;
		var convertedParam = convertParam(userParam, segmentList);
		var pageAnchor = 'dlgSettings';
		if (!Banana.Ui.openPropertyEditor(dialogTitle, convertedParam, pageAnchor)) {
	    	return null;
		}
		for (var i = 0; i < convertedParam.data.length; i++) {
	    	// Read values to userParam (through the readValue function)
	        if (!convertedParam.data[i].segment) {
	          convertedParam.data[i].readValue();
	        }
	        else {
	          // For param with property "segment" pass this segment as parameter
	          convertedParam.data[i].readValueSegment(convertedParam.data[i].segment);
	        }
		}
		//  Reset reset default values
		userParam.useDefaultTexts = false;
	}

	return userParam;
}

function settingsDialog(segmentList) {
	var userParam = initUserParam(segmentList);
	var savedParam = Banana.document.getScriptSettings();
	if (savedParam && savedParam.length > 0) {
		userParam = JSON.parse(savedParam);
	}

	var userParam = parametersDialog(userParam,segmentList); // From propertiess
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

