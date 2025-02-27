// Copyright [2025] [Banana.ch SA - Lugano Switzerland]
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

// @id = ch.banana.italia.import.unicredit
// @api = 1.0
// @pubdate = 2024-05-27
// @publisher = Banana.ch SA
// @description = Banca Unicredit Italia - Importa movimenti .xls /.xlsx (Banana+ Advanced)
// @doctype = *
// @docproperties =
// @task = import.transactions
// @outputformat = transactions.simple
// @inputdatasource = openfiledialog
// @inputencoding = latin1
// @inputfilefilter = Text files (*.txt *.csv *.xls);;All files (*.*)
// @inputfilefilter.de = Text (*.txt *.csv *.xls);;Alle Dateien (*.*)
// @inputfilefilter.fr = Texte (*.txt *.csv *.xls);;Tous (*.*)
// @inputfilefilter.it = Testo (*.txt *.csv *.xls);;Tutti i files (*.*)
// @includejs = import.utilities.js
// @includejs = ch.banana.italia.import.unicredit.js

/**
 * Parse the data and return the data to be imported as a tab separated file.
 */
function exec(inData, isTest) {

	var importUtilities = new ImportUtilities(Banana.document);

	if (isTest !== true && !importUtilities.verifyBananaAdvancedVersion())
		return "";

	let fieldSeparator = findSeparator(inData);
	let transactions = Banana.Converter.csvToArray(inData, fieldSeparator, '"');
	let transactionsData = [];

	//Banana.Ui.showText(JSON.stringify(transactions));

	// Format 1
	let format1 = new UnicreditFormat1();
	transactionsData = format1.getFormattedData(transactions, importUtilities);
	if (format1.match(transactionsData)) {
		transactions = format1.convert(transactionsData);
		return Banana.Converter.arrayToTsv(transactions);
	}

	// Format 2
	let format2 = new UnicreditFormat2();
	transactionsData = format2.getFormattedData(transactions, importUtilities);
	if (format2.match(transactionsData)) {
		transactions = format2.convert(transactionsData);
		return Banana.Converter.arrayToTsv(transactions);
	}

	importUtilities.getUnknownFormatError();

	return "";
}