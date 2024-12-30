// Copyright [2024] [Banana.ch SA - Lugano Switzerland]
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

// @id = ch.banana.italia.import.bancadelpiemonte
// @api = 1.0
// @pubdate = 2024-12-30
// @publisher = Banana.ch SA
// @description = Banca del Piemonte - Import movements .xls (Banana+ Advanced)
// @description.it = Banca del Piemonte - Importa movimenti .xls (Banana+ Advanced)
// @description.en = Banca del Piemonte - Import movements .xls (Banana+ Advanced)
// @description.de = Banca del Piemonte - Bewegungen importieren .xls (Banana+ Advanced)
// @description.fr = Banca del Piemonte - Importer mouvements .xls (Banana+ Advanced)
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
// @timeout = -1
// @includejs = import.utilities.js

/**
 * Parse the data and return the data to be imported as a tab separated file.
 */
function exec(inData, isTest) {

    if (!inData)
       return "";
 
    var importUtilities = new ImportUtilities(Banana.document);
 
    if (!isTest && !importUtilities.verifyBananaAdvancedVersion())
       return "";
 
    convertionParam = defineConversionParam(inData);
    let transactions = Banana.Converter.csvToArray(inData, convertionParam.separator, convertionParam.textDelim);
    let transactionsData = getFormattedData(transactions, convertionParam, importUtilities);
    
    // Banca del Piemonte, this format works with the header names.
 
    // Format 1
    var bancaDelPiemonteFormat1 = new BancaDelPiemonteFormat1();
    if (bancaDelPiemonteFormat1.match(transactionsData)) {
       transactions = bancaDelPiemonteFormat1.convert(transactionsData);
       return Banana.Converter.arrayToTsv(transactions);
    }
 
    // Format is unknow, return an error
    importUtilities.getUnknownFormatError();
 
    return "";
 }
 
 /**
  * Banca del Piemonte
  * Data contabile,Data Valuta,Dare,Avere,Divisa,Causale,Descrizione,
  * 20/12/2024,18/12/2024,-119.95,,USD,VH,Ferverem o in undabo *8474-38-87*MILIGNA COR ROTURES PORSIMILEI STO VOS,
  * 20/12/2024,18/12/2024,-56.30,,USD,VH,Depe OSTANGUS MALVE IPSIT ET INDESET SAL DEPE F.F.L. EXPER AERE 17283,
  * 03/12/2024,03/12/2024,,1000.00,USD,OC,Ferverem o in undabo *8474-78-30*MILIGNA COR ROTURES PORSIMILEI GAVA-2503065362 VI 711380140725 Pulo octituunta:Irum frumen:30/78/6236Vuudcbx matuunt caurbered:MILIGNA COR ROTURES MODUCCHOLOCunungere caurbered:DIT AMULAUXERAY SPULUMERI 86MJ_NXUGBGKV:3381438015653423Uriivfgedmn equerietho tet saervatem:*8474-78-30*MILIGNA COR ROTURES PORSIMILEI GAVA-2503065362 VI  711380140725,
  * 
  */
 function BancaDelPiemonteFormat1() {
    /** Return true if the transactions match this format */
    this.match = function (transactionsData) {
       if (transactionsData.length === 0)
          return false;
 
       for (var i = 0; i < transactionsData.length; i++) {
          var transaction = transactionsData[i];
          var formatMatched = false;
          
          if (transaction["Date"] && transaction["Date"].length >= 10 &&
             transaction["Date"].match(/^\d{2}\/\d{2}\/\d{4}$/))
             formatMatched = true;
          else
             formatMatched = false;
 
          if (formatMatched)
             return true;
       }
 
       return false;
    }
 
    this.convert = function (transactionsData) {
       var transactionsToImport = [];
 
       for (var i = 0; i < transactionsData.length; i++) {
          
          if (transactionsData[i]["Date"] && transactionsData[i]["Date"].length >= 10 &&
             transactionsData[i]["Date"].match(/^\d{2}\/\d{2}\/\d{4}$/)) {
             transactionsToImport.push(this.mapTransaction(transactionsData[i]));
          }
       }
 
       // Sort rows by date
       transactionsToImport = transactionsToImport.reverse();
 
       // Add header and return
       var header = [["Date", "DateValue", "Doc", "ExternalReference", "Description", "Income", "Expenses"]];
       
       return header.concat(transactionsToImport);
    }
 
    this.mapTransaction = function (transaction) {
        let mappedLine = [];
    
        mappedLine.push(Banana.Converter.toInternalDateFormat(transaction["Date"], "dd.mm.yyyy"));
        mappedLine.push(Banana.Converter.toInternalDateFormat("", "dd.mm.yyyy"));
        mappedLine.push("");
        mappedLine.push("");
        mappedLine.push(transaction["Description"]);
        mappedLine.push(Banana.Converter.toInternalNumberFormat(transaction["Income"], '.'));
        mappedLine.push(Banana.Converter.toInternalNumberFormat(transaction["Expenses"].substring(1), '.'));       
        
 
        return mappedLine;
    }
 }
 
 function defineConversionParam(inData) {
 
    var convertionParam = {};
    /** SPECIFY THE SEPARATOR AND THE TEXT DELIMITER USED IN THE CSV FILE */
    convertionParam.format = "csv"; // available formats are "csv", "html"
    //get text delimiter
    convertionParam.textDelim = '\"';
    // get separator
    convertionParam.separator = findSeparator(inData);
    
    convertionParam.headerLineStart = 0;
    convertionParam.dataLineStart = 1;
 
    /** SPECIFY THE COLUMN TO USE FOR SORTING
    If sortColums is empty the data are not sorted */
    convertionParam.sortColums = ["Date", "Description"];
    convertionParam.sortDescending = false;
 
    return convertionParam;
 }
 
 function getFormattedData(inData, convertionParam, importUtilities) {
    var columns = importUtilities.getHeaderData(inData, convertionParam.headerLineStart); //array
    var rows = importUtilities.getRowData(inData, convertionParam.dataLineStart); //array of array
    let form = [];
 
    let convertedColumns = [];
 
    convertedColumns = convertHeaderIt(columns);
 
    //Load the form with data taken from the array. Create objects
    if (convertedColumns.length > 0) {
       importUtilities.loadForm(form, convertedColumns, rows);
       return form;
    }
 
    return [];
 }
 
 function convertHeaderIt(columns) {
    let convertedColumns = [];
 
    for (var i = 0; i < columns.length; i++) {
       switch (columns[i]) {
          case "Data contabile":
             convertedColumns[i] = "Date";
             break;
          case "Dare":
                convertedColumns[i] = "Expenses";
                break;
          case "Avere":
             convertedColumns[i] = "Income";
             break;
          case "Descrizione":
             convertedColumns[i] = "Description";
             break;
          default:
             break;
       }
    }
 
    if (convertedColumns.indexOf("Date") < 0) {
       return [];
    }
 
    return convertedColumns;
 }
 
 /**
  * The function findSeparator is used to find the field separator.
  */
 function findSeparator(inData) {
 
    var commaCount = 0;
    var semicolonCount = 0;
    var tabCount = 0;
 
    for (var i = 0; i < 1000 && i < inData.length; i++) {
       var c = inData[i];
       if (c === ',')
          commaCount++;
       else if (c === ';')
          semicolonCount++;
       else if (c === '\t')
          tabCount++;
    }
 
    if (tabCount > commaCount && tabCount > semicolonCount) {
       return '\t';
    }
    else if (semicolonCount > commaCount) {
       return ';';
    }
 
    return ',';
 }
 
 