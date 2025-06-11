// @id = ch.banana.italia.import.bps
// @api = 1.0
// @pubdate = 2025-06-10
// @publisher = Banana.ch SA
// @description = Banca Popolare di Sondrio - Import account statement .csv (Banana+ Advanced)
// @description.en = Banca Popolare di Sondrio - Import account statement .csv (Banana+ Advanced)
// @description.de = Banca Popolare di Sondrio - Bewegungen importieren .csv (Banana+ Advanced)
// @description.fr = Banca Popolare di Sondrio - Importer mouvements .csv (Banana+ Advanced)
// @description.it = Banca Popolare di Sondrio - Importa movimenti .csv (Banana+ Advanced)
// @doctype = *
// @docproperties =
// @task = import.transactions
// @outputformat = transactions.simple
// @inputdatasource = openfiledialog
// @inputencoding = latin1
// @inputfilefilter = Text files (*.txt *.csv);;All files (*.*)
// @inputfilefilter.de = Text (*.txt *.csv);;Alle Dateien (*.*)
// @inputfilefilter.fr = Texte (*.txt *.csv);;Tous (*.*)
// @inputfilefilter.it = Testo (*.txt *.csv);;Tutti i files (*.*)
// @includejs = import.utilities.js

/**
 * Parse the data and return the data to be imported as a tab separated file.
 */
function exec(string, isTest) {

   var importUtilities = new ImportUtilities(Banana.document);

   if (isTest !== true && !importUtilities.verifyBananaAdvancedVersion())
		return "";

   var fieldSeparator = findSeparator(string);
   var transactions = Banana.Converter.csvToArray(string, fieldSeparator);

   // Format 1
   var format1 = new BPSFormat1();
   let transactionsDataFormat1 = format1.getFormattedData(transactions, importUtilities);
   if ( format1.match( transactionsDataFormat1))
   {
      Banana.console.log("Banca Popolare di Sondrio - Format 1 matched");
      transactions = format1.convert(transactionsDataFormat1);
      return Banana.Converter.arrayToTsv(transactions);
   }

   // Format 2
   var format2 = new BPSFormat2();
   let transactionsDataFormat2 = format2.getFormattedData(transactions, importUtilities);
   if (format2.match(transactionsDataFormat2)) {
      Banana.console.log("Banca Popolare di Sondrio - Format 2 matched");
      transactions = format2.convert(transactionsDataFormat2);
      return Banana.Converter.arrayToTsv(transactions);
   }
   // Format is unknow, return an error
   return "@Error: Unknow format";
}

/**
 * The function findSeparator is used to find the field separator.
 */
function findSeparator( string) {

   var commaCount=0;
   var semicolonCount=0;
   var tabCount=0;

   for(var i = 0; i < 1000 && i < string.length; i++) {
      var c = string[i];
      if (c === ',')
         commaCount++;
      else if (c === ';')
         semicolonCount++;
      else if (c === '\t')
         tabCount++;
   }

   if (tabCount > commaCount && tabCount > semicolonCount)
   {
      return '\t';
   }
   else if (semicolonCount > commaCount)
   {
      return ';';
   }

   return ',';
}

/**
 * BPS Format 2
 * Example: bps.#20150227
 * "Data";"Valuta";"Causale";"Descrizione";"Importo";"Divisa"
 * "27/02/2015";"27/02/2015";"PAGAMENTO CCP GO-BANKING";"TESTO";"-953.6";"EUR"
 * "27/02/2015";"27/02/2015";"PAGAMENTO CCP GO-BANKING";"TESTO";"-586.75";"EUR"
 * "27/02/2015";"27/02/2015";"PAGAMENTO CCP GO-BANKING";"TESTO";"+289.98";"EUR"
 * "27/02/2015";"27/02/2015";"PAGAMENTO CCP GO-BANKING";"TESTO";"+2239.05";"EUR"
 * "27/02/2015";"27/02/2015";"PAGAMENTO CCP GO-BANKING";"TESTO";"-2239.05";"EUR"
 **/
function BPSFormat2() {

   /** Return true if the transactions match this format */
   this.match = function (transactionsData) {

		if (transactionsData.length === 0)
			return false;

		for (var i = 0; i < transactionsData.length; i++) {
			var transaction = transactionsData[i];

			var formatMatched = false;

			if (transaction["Date"] && transaction["Date"].length >= 10 &&
				transaction["Date"].match(/^[0-9]+[\/\.]+[0-9]+[\/\.][0-9]+$/))
				formatMatched = true;
			else
				formatMatched = false;

			if (transaction["DateValue"] && transaction["DateValue"].length >= 10 &&
				transaction["DateValue"].match(/^[0-9]+[\/\.]+[0-9]+[\/\.][0-9]+$/))
				formatMatched = true;
			else
				formatMatched = false;

			if (formatMatched)
				return true;
		}
		return false;
	}

   this.convertHeaderIt = function (columns) {
      let convertedColumns = [];
   
      for (var i = 0; i < columns.length; i++) {
         switch (columns[i]) {
            case "Data":
               convertedColumns[i] = "Date";
               break;
            case "Valuta":
               convertedColumns[i] = "DateValue";
               break;
            case "Causale":
               convertedColumns[i] = "Reason";
               break;
            case "Descrizione":
               convertedColumns[i] = "Description";
               break;
            case "Importo":
               convertedColumns[i] = "Amount";
               break;
            case "Divisa":
               convertedColumns[i] = "Currency";
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

   this.getFormattedData = function (inData, importUtilities) {
      var columns = importUtilities.getHeaderData(inData, 0); //array
      var rows = importUtilities.getRowData(inData, 1); //array of array
      let form = [];
   
      let convertedColumns = [];
   
      convertedColumns = this.convertHeaderIt(columns);
   
      //Load the form with data taken from the array. Create objects
      if (convertedColumns.length > 0) {
         importUtilities.loadForm(form, convertedColumns, rows);
         return form;
      }
   
      return [];
   }

   this.convert = function (transactionsData) {
      var transactionsToImport = [];

      for (var i = 0; i < transactionsData.length; i++) {
         
         if (transactionsData[i]["Date"] && transactionsData[i]["Date"].length >= 10 &&
            (transactionsData[i]["Date"].match(/^\d{2}\/\d{2}\/\d{4}$/) || 
            transactionsData[i]["Date"].match(/^\d{2}\.\d{2}\.\d{4}$/))) {
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
      mappedLine.push(Banana.Converter.toInternalDateFormat(transaction["DateValue"], "dd.mm.yyyy"));
      mappedLine.push("");
      mappedLine.push("");
      mappedLine.push(this.getDescription(transaction));
      if (transaction["Amount"].substring(0, 1) === "-") {
         mappedLine.push("");
         mappedLine.push(Banana.Converter.toInternalNumberFormat(transaction["Amount"].substring(1), '.'));
      } else if (transaction["Amount"].substring(0, 1) === "+") {
         mappedLine.push(Banana.Converter.toInternalNumberFormat(transaction["Amount"].substring(1), '.'));
         mappedLine.push("");
      }     
       

       return mappedLine;
   }

   this.getDescription = function (transaction) {
      const description = transaction["Description"] + '; ' + transaction["Reason"];
      return description;
   }
}

/**
 * BPS Format 1
 * Example: bps.#20150227
 * Stampato il;Contratto;Utente;Tipo;Periodo;Posizione;IBAN;Data oper.;Data val.;Descrizione;Dettagli;Etichetta;Importo (CHF);Saldo
 * 27.02.2015 11:58;CONTRATTO9999 - XX;BPS999999;Estratto Conto;01.01.2015 - 27.02.2015;1234567/001.000.CHF CONTO CORRENTE;CH1234567890123456789;27.02.2015;27.02.2015;PAGAMENTO CCP GO-BANKING;TESTO;;-953.6;20918.83
 * 27.02.2015 11:58;CONTRATTO9999 - XX;BPS999999;Estratto Conto;01.01.2015 - 27.02.2015;1234567/001.000.CHF CONTO CORRENTE;CH1234567890123456789;27.02.2015;27.02.2015;PAGAMENTO CCP GO-BANKING;TESTO;;-586.75;21872.43
 * 27.02.2015 11:58;CONTRATTO9999 - XX;BPS999999;Estratto Conto;01.01.2015 - 27.02.2015;1234567/001.000.CHF CONTO CORRENTE;CH1234567890123456789;27.02.2015;27.02.2015;PAGAMENTO CCP GO-BANKING;TESTO;;-289.98;22459.18
 * 27.02.2015 11:58;CONTRATTO9999 - XX;BPS999999;Estratto Conto;01.01.2015 - 27.02.2015;1234567/001.000.CHF CONTO CORRENTE;CH1234567890123456789;27.02.2015;27.02.2015;PAGAMENTO CCP GO-BANKING;TESTO;;-2239.05;22749.16
**/
function BPSFormat1() {
   /** Return true if the transactions match this format */
   this.match = function (transactionsData) {

		if (transactionsData.length === 0)
			return false;

		for (var i = 0; i < transactionsData.length; i++) {
			var transaction = transactionsData[i];

			var formatMatched = false;

			if (transaction["Date"] && transaction["Date"].length >= 10 &&
				transaction["Date"].match(/^\d{2}\.\d{2}\.\d{4}$/))
				formatMatched = true;
			else
				formatMatched = false;

			if (transaction["DateValue"] && transaction["DateValue"].length >= 10 &&
				transaction["DateValue"].match(/^\d{2}\.\d{2}\.\d{4}$/))
				formatMatched = true;
			else
				formatMatched = false;

			if (formatMatched)
				return true;
		}
		return false;
	}

   this.convertHeaderIt = function (columns) {
      let convertedColumns = [];
   
      for (var i = 0; i < columns.length; i++) {
         switch (columns[i]) {
            case "Data oper.":
               convertedColumns[i] = "Date";
               break;
            case "Data val.":
               convertedColumns[i] = "DateValue";
               break;
            case "Dettagli":
               convertedColumns[i] = "Details";
               break;
            case "Descrizione":
               convertedColumns[i] = "Description";
               break;
            case "Importo (CHF)":
               convertedColumns[i] = "Amount";
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

   this.getFormattedData = function (inData, importUtilities) {
      var columns = importUtilities.getHeaderData(inData, 0); //array
      var rows = importUtilities.getRowData(inData, 1); //array of array
      let form = [];
   
      let convertedColumns = [];
   
      convertedColumns = this.convertHeaderIt(columns);
   
      //Load the form with data taken from the array. Create objects
      if (convertedColumns.length > 0) {
         importUtilities.loadForm(form, convertedColumns, rows);
         return form;
      }
   
      return [];
   }

   this.convert = function (transactionsData) {
      var transactionsToImport = [];

      for (var i = 0; i < transactionsData.length; i++) {
         
         if (transactionsData[i]["Date"] && transactionsData[i]["Date"].length >= 10 &&
            (transactionsData[i]["Date"].match(/^\d{2}\/\d{2}\/\d{4}$/) || 
            transactionsData[i]["Date"].match(/^\d{2}\.\d{2}\.\d{4}$/))) {
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
      mappedLine.push(Banana.Converter.toInternalDateFormat(transaction["DateValue"], "dd.mm.yyyy"));
      mappedLine.push("");
      mappedLine.push("");
      mappedLine.push(this.getDescription(transaction));
      if (transaction["Amount"].substring(0, 1) === "-") {
         mappedLine.push("");
         mappedLine.push(Banana.Converter.toInternalNumberFormat(transaction["Amount"].substring(1), '.'));
      } else {
         mappedLine.push(Banana.Converter.toInternalNumberFormat(transaction["Amount"].substring(1), '.'));
         mappedLine.push("");
      }     
       

       return mappedLine;
   }

   this.getDescription = function (transaction) {
      const description = transaction["Description"] + '; ' + transaction["Details"];
      return description;
   }
}
