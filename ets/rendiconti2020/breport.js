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


/* Update: 2021-06-18 */




/**
 * Report structure:
 * - "id" used as GR/GR1 and to identify the object
 * - "type" used to define the type of data ("title", "group" and "total")
 *     - title:
 *        - Normally used when a title or a description text without amount must be displayed.
 *        - The "id" group starts with a "d" (description).
 *        - Example:
 *          {"id":"dABI", "type":"title", "indent":"1", "description":"I - Immobilizzazioni immateriali"}
 *     - group:
 *        - Used when a group with text and amount must be displayed.
 *        - Examples:
 *          {"id":"ABI1", "type":"group", "indent":"2", "bclass":"1", "description":"1) costi di impianto e di ampliamento"}
 *          {"id":"ABI2", "type":"group", "indent":"2", "bclass":"1", "description":"2) costi di sviluppo"}
 *     - total:
 *        - Used for the total of a group with and amount.
 *        - The amount is the sum groups amounts.
 *        - Use the property "sum" to indicate the list of all "id" groups that must be summed together, separated by a semicolon ";".
 *        - To subtract amounts use the minus sign "-" before the group "id".
 *        - Examples:
 *          {"id":"ABI", "type":"total", "indent":"1", "description":"Totale immobilizzazioni immateriali", "sum":"ABI1;ABI2"}      => sum = ABI1 + ABI2
 *          {"id":"ABI", "type":"total", "indent":"1", "description":"Totale immobilizzazioni immateriali", "sum":"ABI1;-ABI2"}     => sum = ABI1 - ABI2
 *
 * - "indent" used to define the indent level for the print
 * - "bclass" used to define the bclass of the group
 * - "description" used to define the description text used for the print
 * - "sum" used to define how to calculate the total
 */


var BReport = class JsClass {
   
   constructor(banDoc, userParam, reportStructure) {
      this.banDoc = banDoc;
      this.userParam = userParam;
      this.reportStructure = reportStructure;
      this.version = '1.0';
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
                this.reportStructure[i]["previousAmount"] = this.calculatePreviousBalances(this.reportStructure[i]["id"], this.reportStructure[i]["bclass"], this.userParam.column);
              }

            }
         }
      }
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
    */
   validateGroups(grColumn) {
      
      var dataGroups = [];
      var columnList = new Set();

      //Get valid groups from each data structure type
      var groupsModA = createReportStructureStatoPatrimoniale();
      for (var i in groupsModA) {
         if (groupsModA[i]["id"] && !groupsModA[i]["id"].startsWith('d')) {
            columnList.add(groupsModA[i]["id"]);
         }
      }

      var groupsModB = createReportStructureRendicontoGestionale();
      for (var i in groupsModB) {
         if (groupsModB[i]["id"] && !groupsModB[i]["id"].startsWith('d')) {
            columnList.add(groupsModB[i]["id"]);
         }
      }

      var groupsModD = createReportStructureRendicontoCassa();
      for (var i in groupsModD) {
         if (groupsModD[i]["id"] && !groupsModD[i]["id"].startsWith('d')) {
            columnList.add(groupsModD[i]["id"]);
         }
      }

      //Convert Set object to array
      for (var i of columnList) {
         dataGroups.push(i);
      }

      //Banana.console.log(dataGroups);

      //Check if groups in Accounts table are valid
      for (var i = 0; i < this.banDoc.table('Accounts').rowCount; i++) {
         var tRow = this.banDoc.table('Accounts').row(i);
         var account = tRow.value('Account');
         var group = tRow.value(grColumn);

         if (grColumn === "Gr") {
            if (group && group !== "00" && account.indexOf(":") < 0 && account.indexOf(".") < 0 && account.indexOf(";") < 0) {
               if (!dataGroups.includes(group)) {
                  tRow.addMessage(getErrorMessage(ID_ERR_GRUPPO_ERRATO, grColumn, group));
               }
            }
         } else {
            if (group) {
               if (!dataGroups.includes(group)) {
                  tRow.addMessage(getErrorMessage(ID_ERR_GRUPPO_ERRATO, grColumn, group));
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

}
