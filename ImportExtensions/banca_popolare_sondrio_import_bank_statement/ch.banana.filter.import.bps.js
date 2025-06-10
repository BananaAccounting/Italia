// @id = ch.banana.filter.import.bps
// @api = 1.0
// @pubdate = 2020-06-30
// @publisher = Banana.ch SA
// @description = Banca Popolare di Sondrio (*.csv)
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

/**
 * Parse the data and return the data to be imported as a tab separated file.
 */
function exec( string) {

    var applicationSupportIsDetail = Banana.compareVersion &&
            (Banana.compareVersion(Banana.application.version, "8.0.5") >= 0)

   var fieldSeparator = findSeparator(string);
   var transactions = Banana.Converter.csvToArray(string, fieldSeparator);

   // Format 1
   var format1 = new BPSFormat1();
   if ( format1.match( transactions))
   {
      transactions = format1.convert(transactions);
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
