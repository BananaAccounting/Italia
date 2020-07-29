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


/* Update: 2020-07-29 */


var BReport = class JsClass {
   
   constructor(banDoc, userParam, dataStructure) {
      this.banDoc = banDoc;
      this.userParam = userParam;
      this.dataStructure = dataStructure;
      this.version = '1.0';
   }

   /**
    * Load all the current/previous balances and save the values into the dataStructure
    */
   loadBalances() {
      for (var i in this.dataStructure) {
         if (this.dataStructure[i]["bclass"]) {
            if (this.dataStructure[i]["id"]) {
               this.dataStructure[i]["currentAmount"] = this.calculateCurrentBalances(this.dataStructure[i]["id"], this.dataStructure[i]["bclass"], this.userParam.column, this.userParam.selectionStartDate, this.userParam.selectionEndDate);
               this.dataStructure[i]["previousAmount"] = this.calculatePreviousBalances(this.dataStructure[i]["id"], this.dataStructure[i]["bclass"], this.userParam.column);
            }
         }
      }
   }

   /**
    * Calculate all the current balances of the accounts belonging to the same group (grText)
    */
   calculateCurrentBalances(grText, bClass, grColumn, startDate, endDate) {
      var accounts = [];
      var accountNumbers = this.getColumnListForGr(this.banDoc.table("Accounts"), grText, "Account", grColumn);
      accountNumbers = accountNumbers.join("|");
      accounts.push(accountNumbers);
      
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
         return currentBal.total;
      }
      else if (bClass === "4") {
         return Banana.SDecimal.invert(currentBal.total);
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
    * Checks that user defined groups in the given grColumn are valid
    */
   validateGroups(grColumn) {
      //Get valid groups from the data structure
      var dataGroups = [];
      var columnList = new Set();
      for (var i in this.dataStructure) {
         if (this.dataStructure[i]["id"] && !this.dataStructure[i]["id"].startsWith('d')) {
            columnList.add(this.dataStructure[i]["id"]);
         }
      }
      for (var i of columnList) { //Convert Set object to array
         dataGroups.push(i);
      }

      //Check if groups in Accounts table are valid
      for (var i = 0; i < this.banDoc.table('Accounts').rowCount; i++) {
         var tRow = this.banDoc.table('Accounts').row(i);
         var account = tRow.value('Account');
         var group = tRow.value(grColumn);

         if (grColumn === "Gr") {
            if (group && group !== "ACII1P" && group !== "PD7P" && group !== "00" && group !== "TPC" && group !== "TPF" && account.indexOf(":") < 0 && account.indexOf(".") < 0 && account.indexOf(";") < 0) {
               if (!dataGroups.includes(group)) {
                  Banana.document.addMessage(getErrorMessage(ID_ERR_GRUPPO_ERRATO, group));
               }
            }
         } else {
            if (group) {
               if (!dataGroups.includes(group)) {
                  Banana.document.addMessage(getErrorMessage(ID_ERR_GRUPPO_ERRATO, group));
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
      for (var i in this.dataStructure) {
          
         // Set all elements to false
         this.dataStructure[i]["exclude"] = false;
          
         // Check elements than can be excluded
         if (this.dataStructure[i]["description"].match(/^[a-z0-9]/)) { // a,b,c,... or 1,2,3...
            if ((!this.dataStructure[i]["currentAmount"] || this.dataStructure[i]["currentAmount"] == 0 || this.dataStructure[i]["currentAmount"] === "undefined") &&
               (!this.dataStructure[i]["previousAmount"] || this.dataStructure[i]["previousAmount"] == 0 || this.dataStructure[i]["previousAmount"] === "undefined")) {

               this.dataStructure[i]["exclude"] = true;
            }
         }
      }
   }

   /**
    * Returns a specific whole object for the given id value
    */  
   getObject(id) {
      for (var i = 0; i < this.dataStructure.length; i++) {
         if (this.dataStructure[i]["id"] === id) {
            return this.dataStructure[i];
         }
      }
      this.banDoc.addMessage("Couldn't find object with id: " + id);
   }

   /**
    * Gets a specific property value from the object for the given id value
    */
   getObjectValue(id, property) {
      var searchId = id.trim();
      for (var i = 0; i < this.dataStructure.length; i++) {
         if (this.dataStructure[i].id === searchId) {
            return this.dataStructure[i][property];
         }
      }
      this.banDoc.addMessage("Couldn't find object with id: " + id);
   }

   /**
    * Gets the indent value from the object for the given id value
    */
   getObjectIndent(id) {
      var searchId = id.trim();
      for (var i = 0; i < this.dataStructure.length; i++) {
         if (this.dataStructure[i]["id"] === searchId) {
            return this.dataStructure[i]["indent"];
         }
      }
      this.banDoc.addMessage("Couldn't find object with id: " + id);
   }

   /**
    * Gets the type value from the object for the given id value
    */
   getObjectType(id) {
      var searchId = id.trim();
      for (var i = 0; i < this.dataStructure.length; i++) {
         if (this.dataStructure[i]["id"] === searchId) {
            return this.dataStructure[i]["type"];
         }
      }
      this.banDoc.addMessage("Couldn't find object with id: " + id);
   }

   /**
    * Gets the Description from the object for the given id value
    */
   getObjectDescription(id) {
      var searchId = id.trim();
      for (var i = 0; i < this.dataStructure.length; i++) {
         if (this.dataStructure[i]["id"] === searchId) {
            return this.dataStructure[i]["description"];
         }
      }
      this.banDoc.addMessage("Couldn't find object with id: " + id);
   }

   /**
    * Gets the current formatted balance from the object for the given id value
    */
   getObjectCurrentAmountFormatted(id) {
      var searchId = id.trim();
      for (var i = 0; i < this.dataStructure.length; i++) {
         if (this.dataStructure[i]["id"] === searchId) {
            return this.dataStructure[i]["currentAmountFormatted"];
         }
      }
      this.banDoc.addMessage("Couldn't find object with id: " + id);
   }

   /**
    * Gets the previous formatted balance from the object for the given id value
    */
   getObjectPreviousAmountFormatted(id) {
      var searchId = id.trim();
      for (var i = 0; i < this.dataStructure.length; i++) {
         if (this.dataStructure[i]["id"] === searchId) {
            return this.dataStructure[i]["previousAmountFormatted"];
         }
      }
      this.banDoc.addMessage("Couldn't find object with id: " + id);
   }
   
   /**
    * Converts all the amounts to local format for the given list of field
    */
   formatValues(fields) {
      for (var i = 0; i < this.dataStructure.length; i++) {
         var valueObj = this.getObject(this.dataStructure[i].id);

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
    * Calculates all totals of the dataStructure for the given list of fields
    */
   calculateTotals(fields) {
      for (var i = 0; i < this.dataStructure.length; i++) {
         this.calculateTotal(this.dataStructure[i].id, fields);
      }
   }

   /**
    * Calculates a single total of the dataStructure
    */
   calculateTotal(id, fields) {

      var valueObj = this.getObject(id);
      
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
