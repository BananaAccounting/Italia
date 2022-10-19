// Copyright [2022] [Banana.ch SA - Lugano Switzerland]
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


/* Update: 2022-10-19 */


var BReportControllo = class JsClass {
   
   constructor(banDoc, paramReport) {
      this.banDoc = banDoc;
      this.paramReport = paramReport;
      this.userParam = paramReport.userParam;
      this.reportStructure = paramReport.reportStructure;
      this.printStructure = paramReport.printStructure;
      this.currentCardFields = paramReport.currentCardFields;
      this.currentCardTitles = paramReport.currentCardTitles;
      this.version = '1.0';

      // Banana.console.log(JSON.stringify(this.paramReport, "", " "));
      // Banana.console.log(JSON.stringify(this.userParam, "", " "));
      // Banana.console.log(JSON.stringify(this.reportStructure, "", " "));
      // Banana.console.log(JSON.stringify(this.printStructure, "", " "));
      // Banana.console.log(JSON.stringify(this.currentCardFields, "", " "));
      // Banana.console.log(JSON.stringify(this.currentCardTitles, "", " "));
   }

   /**
    * Load all the current/previous balances and save the values into the reportStructure
    */
   loadBalances() {
      for (var i in this.reportStructure) {
         if (this.reportStructure[i]["bclass"]) {
            if (this.reportStructure[i]["id"]) {

              // Load balances using custom columns "Balance_2021", "Balance_2022", ...
              if (this.userParam.balancecolumns) {
                this.reportStructure[i]["currentAmount"] = this.calculateColumnBalances(this.reportStructure[i]["id"], this.reportStructure[i]["bclass"], this.userParam.column, this.userParam.currentbalancecolumn);
                this.reportStructure[i]["previousAmount"] = this.calculateColumnBalances(this.reportStructure[i]["id"], this.reportStructure[i]["bclass"], this.userParam.column, this.userParam.previousbalancecolumn);
              }
              else {
                this.reportStructure[i]["currentAmount"] = this.calculateCurrentBalances(this.reportStructure[i]["id"], this.reportStructure[i]["bclass"], this.userParam.column, this.userParam.selectionStartDate, this.userParam.selectionEndDate);
                this.reportStructure[i]["currentCard"] = this.calculateCurrentCards(this.reportStructure[i]["id"], this.reportStructure[i]["bclass"], this.userParam.column, this.userParam.selectionStartDate, this.userParam.selectionEndDate);
                this.reportStructure[i]["previousAmount"] = this.calculatePreviousBalances(this.reportStructure[i]["id"], this.reportStructure[i]["bclass"], this.userParam.column);
              }

            }
         }
      }
   }

   /**
    * Calculate current account card of the accounts belonging to the same group (grText)
    */
   calculateCurrentCards(grText, bClass, grColumn, startDate, endDate) {

      // grText => testo nel campo "id" struttura dati
      // grColumn => Gr1 o Gr scelto nei parametri
      
      var accounts = [];

      if (this.banDoc.table("Categories") && (bClass === "3" || bClass === "4")) {
        var categoryNumbers = this.getColumnListForGr(this.banDoc.table("Categories"), grText, "Category", grColumn);
        categoryNumbers = categoryNumbers.join("|");
        accounts.push(categoryNumbers);
      }
      else {
        var accountNumbers = this.getColumnListForGr(this.banDoc.table("Accounts"), grText, "Account", grColumn);
        accountNumbers = accountNumbers.join("|");
        accounts.push(accountNumbers);
      }

      // Banana.console.log(accounts); // es. Banca|Banca2

      // get the account card table
      let accountCard = this.banDoc.currentCard(accounts, startDate, endDate);

      // convert the table to JSON string and parse it
      return JSON.parse(accountCard.toJSON());
   }

   /**
    * Calculate all the current balances of the accounts belonging to the same group (grText)
    */
   calculateCurrentBalances(grText, bClass, grColumn, startDate, endDate) {
      var accounts = [];

      if (this.banDoc.table("Categories") && (bClass === "3" || bClass === "4")) {
        var categoryNumbers = this.getColumnListForGr(this.banDoc.table("Categories"), grText, "Category", grColumn);
        categoryNumbers = categoryNumbers.join("|");
        accounts.push(categoryNumbers);
      }
      else {
        var accountNumbers = this.getColumnListForGr(this.banDoc.table("Accounts"), grText, "Account", grColumn);
        accountNumbers = accountNumbers.join("|");
        accounts.push(accountNumbers);
      }
      
      //Sum the amounts of opening, debit, credit, total and balance for all transactions for this accounts
      var currentBal = this.banDoc.currentBalance(accounts, startDate, endDate);
      
      //The bClass decides which value to use
      if (bClass === "1") {
         return currentBal.balance;
      }
      else if (bClass === "2") {
         return Banana.SDecimal.invert(currentBal.balance);
      }
      else if (bClass === "3") {
        if (!this.banDoc.table("Categories")) {
          return currentBal.total;
        }
        else {
          return Banana.SDecimal.invert(currentBal.total)
        }
      }
      else if (bClass === "4") {
        if (!this.banDoc.table("Categories")) {
          return Banana.SDecimal.invert(currentBal.total);
        }
        else {
          return currentBal.total;
        }
      }
   }

   /**
    * Calculate all the previous balances of the accounts belonging to the same group (grText)
    */ 
   calculatePreviousBalances(grText, bClass, grColumn) {
      if (!grColumn) {
        grColumn = "Gr";
      }
      var balance = "";

      if (this.banDoc.table("Categories") && (bClass === "3" || bClass === "4")) {
        for (var i = 0; i < this.banDoc.table('Categories').rowCount; i++) {
           var tRow = this.banDoc.table('Categories').row(i);
           var gr = tRow.value(grColumn);
           var prior = tRow.value("Prior");
           if (gr && gr === grText) {
              balance = Banana.SDecimal.add(balance, prior);
           }
        }
        //The bClass decides which value to use
        if (bClass === "3") {
           return Banana.SDecimal.invert(balance);
        }
        else if (bClass === "4") {
           return balance;
        }
      }
      else {
        for (var i = 0; i < this.banDoc.table('Accounts').rowCount; i++) {
           var tRow = this.banDoc.table('Accounts').row(i);
           var gr = tRow.value(grColumn);
           var prior = tRow.value("Prior");
           if (gr && gr === grText) {
              balance = Banana.SDecimal.add(balance, prior);
           }
        }
        //The bClass decides which value to use
        if (bClass === "1" || bClass === "3") {
           return balance;
        }
        else if (bClass === "2" || bClass === "4") {
           return Banana.SDecimal.invert(balance);
        }
      }
   }

   /**
    * Calculate the balances for the given column (column) of the accounts belonging to the same group (grText)
    */ 
   calculateColumnBalances(grText, bClass, grColumn, column) {
      if (!grColumn) {
        grColumn = "Gr";
      }
      var balance = "";

      if (this.banDoc.table("Categories") && (bClass === "3" || bClass === "4")) {
        for (var i = 0; i < this.banDoc.table('Categories').rowCount; i++) {
           var tRow = this.banDoc.table('Categories').row(i);
           var gr = tRow.value(grColumn);
           var col = tRow.value(column);
           if (gr && gr === grText) {
              balance = Banana.SDecimal.add(balance, col);
           }
        }
        //The bClass decides which value to use
        if (bClass === "3") {
           return Banana.SDecimal.invert(balance);
        }
        else if (bClass === "4") {
           return balance;
        }
      }
      else {
        for (var i = 0; i < this.banDoc.table('Accounts').rowCount; i++) {
           var tRow = this.banDoc.table('Accounts').row(i);
           var gr = tRow.value(grColumn);
           var col = tRow.value(column);
           if (gr && gr === grText) {
              balance = Banana.SDecimal.add(balance, col);
           }
        }
        //The bClass decides which value to use
        if (bClass === "1" || bClass === "3") {
           return balance;
        }
        else if (bClass === "2" || bClass === "4") {
           return Banana.SDecimal.invert(balance);
        }
      }
   }
   
   /**
    * Creates an array with all the values of a given column of the table (codeColumn)
    * belonging to the same group (grText)
    */ 
   getColumnListForGr(table, grText, codeColumn, grColumn) {

      if (!grColumn) {
        grColumn = "Gr";
      }

      //Set object excludes duplicates
      var columnList = new Set();

      //Loop to take the values of each rows of the table
      for (var i = 0; i < table.rowCount; i++) {
         var tRow = table.row(i);
         var grRow = tRow.value(grColumn);

         //If grColumn contains other characters (in this case ";") we know there are more values
         //We have to split them and take all values separately
         //If there are only alphanumeric characters in grColumn we know there is only one value
         var codeString = grRow;
         var arrCodeString = codeString.split(";");
         for (var j = 0; j < arrCodeString.length; j++) {
            var codeString1 = arrCodeString[j];
            if (codeString1 === grText) {
               columnList.add(tRow.value(codeColumn));
            }
         }
      }

      //Convert Set object to array
      var str = [];
      for (var i of columnList) {
         str.push(i);
      }

      //Return the array
      return str;
   }

   /**
    * Checks that user defined groups in the given grColumn are valid.
    * User can olny use groups ID defined in the data structure.
    * Checks Assets/Liabilties and Income/Expenses.
    * Used for "Rendiconto Patrimoniale"
    */
   validateGroups(grColumn) {
      
      var dataGroups = [];
      var columnList = new Set();

      var reportStructure = createReportStructureStatoPatrimoniale();
      for (var i in reportStructure) {
         if (reportStructure[i]["id"] && reportStructure[i]["type"] === "group") {
            columnList.add(reportStructure[i]["id"]);
         }
      }

      //Convert Set object to array
      for (var i of columnList) {
         dataGroups.push(i);
      }

      //Check if groups in Categories table are valid
      if (this.banDoc.table("Categories")) {
         for (var i = 0; i < this.banDoc.table('Accounts').rowCount; i++) {
            var tRow = this.banDoc.table('Accounts').row(i);
            var account = tRow.value('Account');
            var gr = tRow.value(grColumn);
            if (gr && account && !account.startsWith(":") && !account.startsWith(".") && !account.startsWith(",") && !account.startsWith(";")) {
               if (!dataGroups.includes(gr)) {
                  var msg = getErrorMessage(ID_ERR_GRUPPO_ERRATO);
                  msg = msg.replace("%GRCOLUMN", grColumn);
                  msg = msg.replace("%GR", gr);
                  tRow.addMessage(msg);
               }
            }
         }
         for (var i = 0; i < this.banDoc.table('Categories').rowCount; i++) {
            var tRow = this.banDoc.table('Categories').row(i);
            var category = tRow.value('Category');
            var gr = tRow.value(grColumn);
            if (gr && category && !category.startsWith(":") && !category.startsWith(".") && !category.startsWith(",") && !category.startsWith(";")) {
               if (!dataGroups.includes(gr)) {
                  var msg = getErrorMessage(ID_ERR_GRUPPO_ERRATO_CATEGORIA);
                  msg = msg.replace("%GRCOLUMN", grColumn);
                  msg = msg.replace("%GR", gr);
                  tRow.addMessage(msg);
               }
            }
         }
      }
      else {
         //Check if groups in Accounts table are valid
         for (var i = 0; i < this.banDoc.table('Accounts').rowCount; i++) {
            var tRow = this.banDoc.table('Accounts').row(i);
            var account = tRow.value('Account');
            var gr = tRow.value(grColumn);
            var bclass = tRow.value('BClass');
            if (gr && account && bclass && (bclass === '1' || bclass === '2' || bclass === '3' || bclass === '4') && !account.startsWith(":") && !account.startsWith(".") && !account.startsWith(",") && !account.startsWith(";")) {
               if (!dataGroups.includes(gr)) {
                  var msg = getErrorMessage(ID_ERR_GRUPPO_ERRATO);
                  msg = msg.replace("%GRCOLUMN", grColumn);
                  msg = msg.replace("%GR", gr);
                  tRow.addMessage(msg);
               }
            }
         } 
      }
   }

   /**
    * Checks that user defined groups in the given grColumn are valid.
    * User can olny use groups ID defined in the data structure.
    * Checks only Income and Expenses.
    * Used for "Rendiconto Cassa" e "Rendiconto Gestionale"
    */ 
   validateGroups_IncomeExpenses(grColumn, reportStructure) {
      
      var dataGroups = [];
      var columnList = new Set();

      for (var i in reportStructure) {
         if (reportStructure[i]["id"] && reportStructure[i]["type"] === "group") {
            columnList.add(reportStructure[i]["id"]);
         }
      }

      //Convert Set object to array
      for (var i of columnList) {
         dataGroups.push(i);
      }

      //Check if groups in Categories table are valid
      if (this.banDoc.table("Categories")) {
         for (var i = 0; i < this.banDoc.table('Categories').rowCount; i++) {
            var tRow = this.banDoc.table('Categories').row(i);
            var category = tRow.value('Category');
            var gr = tRow.value(grColumn);
            if (gr && category && !category.startsWith(":") && !category.startsWith(".") && !category.startsWith(",") && !category.startsWith(";")) {
               if (!dataGroups.includes(gr)) {
                  var msg = getErrorMessage(ID_ERR_GRUPPO_ERRATO_CATEGORIA);
                  msg = msg.replace("%GRCOLUMN", grColumn);
                  msg = msg.replace("%GR", gr);
                  tRow.addMessage(msg);
               }
            }
         }
      }
      else {
         //Check if groups in Accounts table are valid
         for (var i = 0; i < this.banDoc.table('Accounts').rowCount; i++) {
            var tRow = this.banDoc.table('Accounts').row(i);
            var account = tRow.value('Account');
            var gr = tRow.value(grColumn);
            var bclass = tRow.value('BClass');
            if (gr && account && bclass && (bclass === '3' || bclass === '4') && !account.startsWith(":") && !account.startsWith(".") && !account.startsWith(",") && !account.startsWith(";")) {
               if (!dataGroups.includes(gr)) {
                  var msg = getErrorMessage(ID_ERR_GRUPPO_ERRATO);
                  msg = msg.replace("%GRCOLUMN", grColumn);
                  msg = msg.replace("%GR", gr);
                  tRow.addMessage(msg);
               }
            }
         }
      }
   }

   /**
    * Entries preceded by Arabic numbers or lower case letters
    * with zero amounts for two consecutive exercises, can be excluded from the print
    */
   excludeEntries() {
      for (var i in this.reportStructure) {
          
         // Set all elements to false
         this.reportStructure[i]["exclude"] = false;
          
         // Check elements than can be excluded
         if (this.reportStructure[i]["description"].match(/^[a-z0-9]/)) { // a,b,c,... or 1,2,3...
            if ((!this.reportStructure[i]["currentAmount"] || this.reportStructure[i]["currentAmount"] == 0 || this.reportStructure[i]["currentAmount"] === "undefined") &&
               (!this.reportStructure[i]["previousAmount"] || this.reportStructure[i]["previousAmount"] == 0 || this.reportStructure[i]["previousAmount"] === "undefined")) {

               this.reportStructure[i]["exclude"] = true;
            }
         }
      }
   }

   /**
    * Returns a specific whole object for the given id value
    */  
   getObject(id) {
      for (var i = 0; i < this.reportStructure.length; i++) {
         if (this.reportStructure[i]["id"] === id) {
            return this.reportStructure[i];
         }
      }
      this.banDoc.addMessage("Couldn't find object with id: " + id);
   }

   /**
    * Gets a specific property value from the object for the given id value
    */
   getObjectValue(id, property) {
      var searchId = id.trim();
      for (var i = 0; i < this.reportStructure.length; i++) {
         if (this.reportStructure[i].id === searchId) {
            return this.reportStructure[i][property];
         }
      }
      this.banDoc.addMessage("Couldn't find object with id: " + id);
   }

   /**
    * Gets the indent value from the object for the given id value
    */
   getObjectIndent(id) {
      var searchId = id.trim();
      for (var i = 0; i < this.reportStructure.length; i++) {
         if (this.reportStructure[i]["id"] === searchId) {
            return this.reportStructure[i]["indent"];
         }
      }
      this.banDoc.addMessage("Couldn't find object with id: " + id);
   }

   /**
    * Gets the type value from the object for the given id value
    */
   getObjectType(id) {
      var searchId = id.trim();
      for (var i = 0; i < this.reportStructure.length; i++) {
         if (this.reportStructure[i]["id"] === searchId) {
            return this.reportStructure[i]["type"];
         }
      }
      this.banDoc.addMessage("Couldn't find object with id: " + id);
   }

   /**
    * Gets the Description from the object for the given id value
    */
   getObjectDescription(id) {
      var searchId = id.trim();
      for (var i = 0; i < this.reportStructure.length; i++) {
         if (this.reportStructure[i]["id"] === searchId) {
            return this.reportStructure[i]["description"];
         }
      }
      this.banDoc.addMessage("Couldn't find object with id: " + id);
   }

   /**
    * Gets the Description from the object for the given id value
    */
   getObjectId(id) {
      var searchId = id.trim();
      for (var i = 0; i < this.reportStructure.length; i++) {
         if (this.reportStructure[i]["id"] === searchId) {
            return this.reportStructure[i]["id"];
         }
      }
      this.banDoc.addMessage("Couldn't find object with id: " + id);
   }

   /**
    * Gets the current formatted balance from the object for the given id value
    */
   getObjectCurrentAmountFormatted(id) {
      var searchId = id.trim();
      for (var i = 0; i < this.reportStructure.length; i++) {
         if (this.reportStructure[i]["id"] === searchId) {
            return this.reportStructure[i]["currentAmountFormatted"];
         }
      }
      this.banDoc.addMessage("Couldn't find object with id: " + id);
   }

   /**
    * Gets the previous formatted balance from the object for the given id value
    */
   getObjectPreviousAmountFormatted(id) {
      var searchId = id.trim();
      for (var i = 0; i < this.reportStructure.length; i++) {
         if (this.reportStructure[i]["id"] === searchId) {
            return this.reportStructure[i]["previousAmountFormatted"];
         }
      }
      this.banDoc.addMessage("Couldn't find object with id: " + id);
   }
   
   /**
    * Converts all the amounts to local format for the given list of field
    */
   formatValues(fields) {
      for (var i = 0; i < this.reportStructure.length; i++) {
         var valueObj = this.getObject(this.reportStructure[i].id);

         for (var j = 0; j < fields.length; j++) {
            //Check amount value
            if (!valueObj[fields[j]] || valueObj[fields[j]] === "" || valueObj[fields[j]] === "undefined" || valueObj[fields[j]] == null) {
              valueObj[fields[j]] = "0";
            }
            valueObj[fields[j]+"Formatted"] = Banana.Converter.toLocaleNumberFormat(valueObj[fields[j]]);
         }
      }
   }

   /**
    * Calculates all totals of the reportStructure for the given list of fields
    */
   calculateTotals(fields) {
      for (var i = 0; i < this.reportStructure.length; i++) {
         this.calculateTotal(this.reportStructure[i].id, fields);
      }
   }

   /**
    * Calculates a single total of the reportStructure
    */
   calculateTotal(id, fields) {

      var valueObj = this.getObject(id);
      
      if (valueObj[fields[0]] || valueObj[fields[1]]) { //first field is present
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
            if (entry.startsWith("-")) {
               isNegative = true;
               entry = entry.substring(1);
            }
            
            //Calulate recursively
            this.calculateTotal(entry, fields);  
            
             for (var j = 0; j < fields.length; j++) {
               var fieldName = fields[j];
               var fieldValue = this.getObjectValue(entry, fieldName);
               if (fieldValue) {
                  if (isNegative) {
                     //Invert sign
                     fieldValue = Banana.SDecimal.invert(fieldValue);
                  }
                  valueObj[fieldName] = Banana.SDecimal.add(valueObj[fieldName], fieldValue);
               }
            }
         }
      } else if (valueObj.id) {
         //Already calculated in loadBalances()
      }
   }











   /**************************************************************************************
    * Functions to print the control report
    *
    * - prints only current year amounts column (previous year column is not printed)
    * - prints all the rows of the report, even if with zero amounts
    * - for each GR1 prints an account card:
    *   - with opening balace when exists
    *   - with transactions details of all the accounts that belongs to the GR1 group
    *   - in case of transactions or opening balance doesn't exist, the account card is not printed
    * 
    **************************************************************************************/
   printReportControllo() {

      var bReportControllo = new BReportControllo(this.banDoc, this.paramReport);

      let dialog = "";
      let title = "";
      for (let i = 0; i < this.printStructure.length; i++) {
         if (this.printStructure[i].dialogText) {
            dialog = this.printStructure[i].dialogText;
         }
         if (this.printStructure[i].titleText) {
            title = this.printStructure[i].titleText;
         }
      }

      //Banana.console.log(JSON.stringify(reportStructure, "", " "));

      let report = Banana.Report.newReport(dialog);
      let dateCurrent = this.userParam.selectionEndDate;
      let currentYear = Banana.Converter.toDate(this.userParam.selectionEndDate).getFullYear();
      
      report.addParagraph(title.replace("%1", currentYear),"bold");
      report.addParagraph(" ", "");

      let table = report.addTable("tableReportControllo");
      let tableRow;

      tableRow = table.addRow();
      tableRow.addCell("GR1", "bold", 1);
      tableRow.addCell("DESCRIZIONE", "bold", 5);
      tableRow.addCell(Banana.Converter.toLocaleDateFormat(dateCurrent), "bold align-right", 1);



      /**
       * Use the printStructure to print the data in the correct sequence
       * and also use additional printing setup like css styles etc.
       */
      for (let j = 0; j < this.printStructure.length; j++) {

         let id = this.printStructure[j].id; // id=gr1

         if (id) { // exclude the "texts" objects

            let isTitle = this.printStructure[j].isTitle; //exclude id (gr1) and amount for the title/description texts
            let obj = bReportControllo.getObject(id); //take the single object by ID from the reportStructure

            //Add the content on a new page
            if (this.printStructure[j].newpage) {
               
               tableRow = table.addRow();
               tableRow.addCell().addPageBreak();

               tableRow = table.addRow();
               tableRow.addCell("GR1", "bold", 1);
               tableRow.addCell("DESCRIZIONE", "bold", 5);
               tableRow.addCell(Banana.Converter.toLocaleDateFormat(dateCurrent), "bold align-right", 1);
            }


            tableRow = table.addRow();

            // ID (GR1) column
            // do not print ID (GR1) for title/descriptions
            if (isTitle) {
               tableRow.addCell("", "", 1);
            } else {
               tableRow.addCell(obj.id, "", 1);
            }

            // Description column
            let indent = ""; //"lvl" + obj.indent;
            tableRow.addCell(obj.description, indent, 5);

            // Current amount column
            // do not print the formatted amount for descriptions to avoid "0.00" when empty
            if (isTitle) {
               tableRow.addCell("", "", 1);
            } else {
               tableRow.addCell(obj.currentAmountFormatted, "align-right", 1);
            }

            /**
             * Prints the current card details 
             */

            //Adds the currentCard if not empty
            // Banana.console.log(JSON.stringify(obj, "", " "));
            let currentCard = obj.currentCard;
            
            //Function call that adds the account card
            this.printReportControllo_CurrentCard(table, currentCard, this.currentCardFields, this.currentCardTitles);
         }
      }

      report.getFooter().addClass("footer");
      report.getFooter().addText("- ", "");
      report.getFooter().addFieldPageNr();
      report.getFooter().addText(" -", "");

      return report;
   }

   /**
    * Function that prints the account card
    * 
    * table: the table of the report where to add the account card
    * currentCard: the object that contains the data of the account card for the GR1
    * currentCardFields: array with the name of the fields of the object currentCard that will be added to the report
    * currentCardTitles: array with the headers names of the account card
    */
   printReportControllo_CurrentCard(table, currentCard, currentCardFields, currentCardTitles) {

      let headerIsPrinted = false;
      let tableRow;

      if (currentCard && currentCard.length > 0) {

         //Banana.console.log(JSON.stringify(currentCard, "", " "));

         for (let j = 0; j < currentCard.length; j++) {

            //solo se ci sono movimenti e se Opening
            //esclude totali "Totali movimenti"
            if ( (currentCard[j].JDebitAmount || currentCard[j].JCreditAmount || currentCard[j].SysCod === "Opening") && currentCard[j].SysCod !== "Totals" ) {

               // "SysCod": "Opening" => opening balance, first row
               // "SysCod": "Totals"  => total line, last row

               // Prints the currentCard header columns, defined in the array currentCardTitles
               if (!headerIsPrinted) {

                  tableRow = table.addRow();
                  for (let k = 0; k < currentCardTitles.length; k++) {
                     tableRow.addCell(currentCardTitles[k],"bold details align-center", 1);
                  }

                  headerIsPrinted = true; //header printed the first time, so do not print columns headers anymore
               }

               // Prints the currentCard data using the fields defined in the array currentCardFields
               tableRow = table.addRow();
               for (let k = 0; k < currentCardFields.length; k++) {

                  if (currentCardFields[k] === "JDate") {
                     //format dates
                     tableRow.addCell(Banana.Converter.toLocaleDateFormat(currentCard[j][currentCardFields[k]]),"details", 1);
                  }
                  else if (currentCardFields[k].startsWith("JAmount") || currentCardFields[k].startsWith("JBalance") || currentCardFields[k].startsWith("JDebitAmount") || currentCardFields[k].startsWith("JCreditAmount")) {
                     //format amounts
                     //JAmount, JAmountAccountCurrency, JAmountTransactionCurrency, JDebitAmount, JCreditAmount, JDebitAmountAccountCurrency, JCreditAmountAccountCurrency, JBalance, JBalanceAccountCurrency
                     tableRow.addCell(Banana.Converter.toLocaleNumberFormat(currentCard[j][currentCardFields[k]]),"details align-right", 1);
                  }
                  else {
                     tableRow.addCell(currentCard[j][currentCardFields[k]],"details", 1);
                  }
               }
            }
         }
      }
   }


}
