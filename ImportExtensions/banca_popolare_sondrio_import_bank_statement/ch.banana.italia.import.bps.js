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
   if ( format1.match( transactions))
   {
      transactions = format1.convert(transactions);
      return Banana.Converter.arrayToTsv(transactions);
   }

   // Format 2
   var format2 = new BPSFormat2();
   let transactionsData = format2.getFormattedData(transactions, importUtilities);
   if (format2.match(transactionsData)) {
      transactions = format2.convert(transactionsData);
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
 * BPS Format 3
 * Example: bps.#20150227
 * Stampato il;Contratto;Utente;Tipo;Periodo;Posizione;IBAN;Data oper.;Data val.;Descrizione;Dettagli;Etichetta;Importo (CHF);Saldo
 * 27.02.2015 11:58;CONTRATTO9999 - XX;BPS999999;Estratto Conto;01.01.2015 - 27.02.2015;1234567/001.000.CHF CONTO CORRENTE;CH1234567890123456789;27.02.2015;27.02.2015;PAGAMENTO CCP GO-BANKING;TESTO;;-953.6;20918.83
 * 27.02.2015 11:58;CONTRATTO9999 - XX;BPS999999;Estratto Conto;01.01.2015 - 27.02.2015;1234567/001.000.CHF CONTO CORRENTE;CH1234567890123456789;27.02.2015;27.02.2015;PAGAMENTO CCP GO-BANKING;TESTO;;-586.75;21872.43
 * 27.02.2015 11:58;CONTRATTO9999 - XX;BPS999999;Estratto Conto;01.01.2015 - 27.02.2015;1234567/001.000.CHF CONTO CORRENTE;CH1234567890123456789;27.02.2015;27.02.2015;PAGAMENTO CCP GO-BANKING;TESTO;;-289.98;22459.18
 * 27.02.2015 11:58;CONTRATTO9999 - XX;BPS999999;Estratto Conto;01.01.2015 - 27.02.2015;1234567/001.000.CHF CONTO CORRENTE;CH1234567890123456789;27.02.2015;27.02.2015;PAGAMENTO CCP GO-BANKING;TESTO;;-2239.05;22749.16
**/
function BPSFormat1() {

   this.colDate     	  = 7;
   this.colDateValuta  = 8;
   this.colDescr    	  = 9;
   this.colDetails  	  = 10;
   this.colAmount      = 12;
   this.colBalance     = 13;

   /** Return true if the transactions match this format */
   this.match = function(transactions) {
      if ( transactions.length === 0)
         return false;

      for (i=0;i<transactions.length;i++)
      {
         var transaction = transactions[i];

         var formatMatched = false;
         if ( transaction.length  === (this.colBalance+1))
            formatMatched = true;
         else
            formatMatched = false;

         if ( formatMatched && transaction[this.colDate].match(/[0-9\.]+/g) &&
               transaction[this.colDate].length === 10)
            formatMatched = true;
         else
            formatMatched = false;

         if ( formatMatched && transaction[this.colDateValuta].match(/[0-9\.]+/g) &&
               transaction[this.colDateValuta].length === 10)
            formatMatched = true;
         else
            formatMatched = false;

         if (formatMatched)
            return true;
      }

      return false;
   }

   /** Convert the transaction to the format to be imported */
   this.convert = function(transactions) {
      var transactionsToImport = [];

      // Filter and map rows
      for (i=0;i<transactions.length;i++)
      {
         var transaction = transactions[i];
         if ( transaction.length  < (this.colBalance+1) )
            continue;
         if (transaction[this.colDate].match(/[0-9\.]+/g) && transaction[this.colDate].length==10 &&
               transaction[this.colDateValuta].match(/[0-9\.]+/g) && transaction[this.colDateValuta].length==10)
            transactionsToImport.push( this.mapTransaction(transaction));
      }

      // Sort rows by date (invert order, the last is the first)
      transactionsToImport = transactionsToImport.reverse();

      // Add header and return
      var header = [["Date","DateValue","Doc","Description","Income","Expenses"]];
      return header.concat(transactionsToImport);
   }


   this.mapTransaction = function(element) {
      var mappedLine = [];

      mappedLine.push( Banana.Converter.toInternalDateFormat(element[this.colDate]));
      mappedLine.push( Banana.Converter.toInternalDateFormat(element[this.colDateValuta]));
      mappedLine.push( ""); // Doc is empty for now

      var elDescr = element[this.colDescr];
      if (element[this.colDetails].length > 0) {
         elDescr = elDescr + ", " + element[this.colDetails];
      }
      mappedLine.push( Banana.Converter.stringToCamelCase( elDescr));

      var elAmount = element[this.colAmount];
      if (elAmount.length > 0) {
         if (elAmount === "-") {
            mappedLine.push("");
            mappedLine.push(elAmount.substr(1));
         } else {
            mappedLine.push(elAmount);
            mappedLine.push("");
         }
      } else {
         mappedLine.push("");
         mappedLine.push("");
      }

      return mappedLine;
   }
}
