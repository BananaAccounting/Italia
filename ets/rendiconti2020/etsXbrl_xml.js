// Copyright [2023] [Banana.ch SA - Lugano Switzerland]
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



/* Update: 2023-02-21 */



function EtsXml(banDoc, paramReport) {
   this.banDoc = banDoc;
   this.paramReport = paramReport;
   this.userParam = paramReport.userParam;
   this.reportStructure = paramReport.reportStructure;
   this.printStructure = paramReport.printStructure;
   this.xmlStructure = paramReport.xmlStructure;
   this.currentCardFields = paramReport.currentCardFields;
   this.currentCardTitles = paramReport.currentCardTitles;
   this.version = '1.0';

   this.scriptVersion = "20230221";

   // this.ERROR_STRING_MIN_LENGTH = false;
   // this.ERROR_STRING_MAX_LENGTH = false;
   // this.ERROR_MISSING_VALUE = false;
   // this.ERROR_NOT_ALLOWED_VALUE = false;
}


EtsXml.prototype.creaRendicontoPerCassa = function (xml) {

   //Banana.console.log(JSON.stringify(this.printStructure, "", " "));
   //Banana.console.log(JSON.stringify(this.xmlStructure, "", " "));


   // Title of the report
   let titleText = "";
   for (let j = 0; j < this.xmlStructure.length; j++) {
      if (this.xmlStructure[j].titleText) {
         titleText = this.xmlStructure[j].titleText;
         break;
      }
   }
   var xmlNodoRoot = xml.addElement('ets-xbrl:'+titleText);


   // All data
   for (let j = 0; j < this.xmlStructure.length; j++) {

      let id = this.xmlStructure[j].id; // id=gr1
      let description = "";
      let current = "";
      let previous = "";
      let xmlNodoId = "";
      let xmlDescrizione = "";
      let xmlCorrente = "";
      let xmlPrecedente = "";

      if (id) { // exclude the "texts" objects

         let isTitle = this.xmlStructure[j].isTitle; //exclude id (gr1) and amount for the title/description texts
         let obj = this.getObject(id); //take the single object by ID from the reportStructure



         // // ONLY FOR "Rendiconto Stato Patrimoniale"
         // // Do not prints elements that can be excluded, when the "compattastampa" parameter in settings is TRUE.
         // // Elements that can be excluded have the "exclude" property in "reportStructure" obj set to TRUE. All the other are set to FALSE.
         // if (this.userParam.compattastampa && obj.exclude) {
         //    continue; // go directly to the next element of the object
         // }


         // ID (GR1)
         // do not add ID (GR1) for title/descriptions
         if (isTitle) {
            id = obj.id; //??? lasciare vuoto?
         } else {
            id = obj.id;
         }

         // Description
         description = obj.description;

         // Current amount column
         // do not print the formatted amount for descriptions to avoid "0.00" when empty
         if (isTitle) {
            current = "";
            previous = "";
         } else {
            current = obj.currentAmount; //currentAmountFormatted
            previous = obj.previousAmount; //previousAmountFormatted
         }

         xmlNodoId = xmlNodoRoot.addElement('ets-xbrl:'+id);
         xmlDescrizione = xmlNodoId.addElement('ets-xbrl:Descrizione').addTextNode(description);
         xmlCorrente = xmlNodoId.addElement('ets-xbrl:Corrente').addTextNode(current);
         xmlPrecedente = xmlNodoId.addElement('ets-xbrl:Precedente').addTextNode(previous);

      }
   }

   return xmlNodoRoot;
}









//============================
// NAMESPACEA E SCHEMA XML
//============================
EtsXml.prototype.addSchemaAndNamespaces = function (xmlDocument) {

   var ETSXbrlNode = xmlDocument.addElement("ets-xbrl:ETSXbrl");
   this.initSchemarefs();
   this.initNamespaces();

   var attrsSchemaLocation = '';
   for (var i in this.schemaRefs) {
      var schema = this.schemaRefs[i];
      if (schema.length > 0) {
         attrsSchemaLocation += schema;
      }
   }
   if (attrsSchemaLocation.length > 0) {
      ETSXbrlNode.setAttribute("xsi:schemaLocation", attrsSchemaLocation);
   }

   for (var i in this.namespaces) {
      var prefix = this.namespaces[i]['prefix'];
      var namespace = this.namespaces[i]['namespace'];
      ETSXbrlNode.setAttribute(prefix, namespace);
   }
   return ETSXbrlNode;
}

EtsXml.prototype.initNamespaces = function () {
   this.namespaces = [
      {
         'namespace': 'http://www.ech.ch/xmlns/eCH-0058/5',
         'prefix': 'xmlns:eCH-0058'
      },
      {
         'namespace': 'http://www.ech.ch/xmlns/eCH-0097/3',
         'prefix': 'xmlns:eCH-0097'
      },
      {
         'namespace': 'http://www.ech.ch/xmlns/ets-xbrl/1',
         'prefix': 'xmlns:ets-xbrl'
      },
      {
         'namespace': 'http://www.w3.org/2001/XMLSchema-instance',
         'prefix': 'xmlns:xsi'
      },
   ];
}

EtsXml.prototype.initSchemarefs = function () {
   this.schemaRefs = [
      'http://www.ech.ch/xmlns/ets-xbrl/1 ets-xbrl-1-0.xsd'
   ];
}






//============================
// CREA XML E SALVA FILE
//============================

/* Create the name of the xml file */
EtsXml.prototype.createFileName = function () {

   var fileName = "ets_xbrl_";
   var currentDateString = "";
   var startDate = "";
   var yearStartDate = "";
   var monthStartDate = "";
   var dayStartDate = "";
   var endDate = "";
   var yearEndDate = "";
   var monthEndDate = "";
   var dayEndDate = "";

   //Start date string
   startDate = Banana.Converter.toDate(this.userParam.selectionStartDate.match(/\d/g).join("")); 
   yearStartDate = startDate.getFullYear().toString();
   monthStartDate = (startDate.getMonth() + 1).toString();
   if (monthStartDate.length < 2) {
      monthStartDate = "0" + monthStartDate;
   }
   dayStartDate = startDate.getDate().toString();
   if (dayStartDate.length < 2) {
      dayStartDate = "0" + dayStartDate;
   }

   //End date string
   endDate = Banana.Converter.toDate(this.userParam.selectionEndDate.match(/\d/g).join(""));
   yearEndDate = endDate.getFullYear().toString();
   monthEndDate = (endDate.getMonth() + 1).toString();
   if (monthEndDate.length < 2) {
      monthEndDate = "0" + monthEndDate;
   }
   dayEndDate = endDate.getDate().toString();
   if (dayEndDate.length < 2) {
      dayEndDate = "0" + dayEndDate;
   }

   //Final date string
   currentDateString = yearStartDate + monthStartDate + dayStartDate + "_" + yearEndDate + monthEndDate + dayEndDate;

   //Return the xml file name
   fileName += currentDateString;
   return fileName;
}

/* Creates the XML document */
EtsXml.prototype.createXml = function () {

   /* Create XML */
   var xmlDocument = Banana.Xml.newDocument("root");


   var ETSXbrlNode = this.addSchemaAndNamespaces(xmlDocument);

   //Rendiconto cassa
   var xml = this.creaRendicontoPerCassa(ETSXbrlNode);




   var output = Banana.Xml.save(xmlDocument);
   //Banana.document.addMessage(output);

   //Check errors
   // if (this.ERROR_STRING_MIN_LENGTH || this.ERROR_STRING_MAX_LENGTH || this.ERROR_MISSING_VALUE || this.ERROR_NOT_ALLOWED_VALUE) {
   //    //return;
   // }


   // this.checkResults();

   return output;
}

/* Save the xml file */
EtsXml.prototype.saveData = function (output) {

   var fileName = this.createFileName();
   fileName = Banana.IO.getSaveFileName("Save as", fileName, "XML file (*.xml);;All files (*)");

   if (fileName.length) {
      var file = Banana.IO.getLocalFile(fileName);
      file.codecName = "UTF-8";
      file.write(output);
      if (file.errorString) {
         Banana.Ui.showInformation("Write error", file.errorString);
      }
      else {
         if (this.userParam.visualizzafilexml) {
            Banana.IO.openUrl(fileName);
         }
      }
   }
}













/**
 * Returns a specific whole object for the given id value
 */  
EtsXml.prototype.getObject = function (id) {
   for (var i = 0; i < this.reportStructure.length; i++) {
      if (this.reportStructure[i]["id"] === id) {
         return this.reportStructure[i];
      }
   }
   this.banDoc.addMessage("Couldn't find object with id: " + id);
}

/**
 * Gets the Description from the object for the given id value
 */
EtsXml.prototype.getObjectDescription = function (id) {
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
EtsXml.prototype.getObjectId = function (id) {
   var searchId = id.trim();
   for (var i = 0; i < this.reportStructure.length; i++) {
      if (this.reportStructure[i]["id"] === searchId) {
         return this.reportStructure[i]["id"];
      }
   }
   this.banDoc.addMessage("Couldn't find object with id: " + id);
}

/**
 * Gets the current balance from the object for the given id value
 */
EtsXml.prototype.getObjectCurrentAmount = function (id) {
   var searchId = id.trim();
   for (var i = 0; i < this.reportStructure.length; i++) {
      if (this.reportStructure[i]["id"] === searchId) {
         return this.reportStructure[i]["currentAmount"];
      }
   }
   this.banDoc.addMessage("Couldn't find object with id: " + id);
}

/**
 * Gets the previous balance from the object for the given id value
 */
EtsXml.prototype.getObjectPreviousAmount = function (id) {
   var searchId = id.trim();
   for (var i = 0; i < this.reportStructure.length; i++) {
      if (this.reportStructure[i]["id"] === searchId) {
         return this.reportStructure[i]["previousAmount"];
      }
   }
   this.banDoc.addMessage("Couldn't find object with id: " + id);
}

/**
 * Gets the current formatted balance from the object for the given id value
 */
EtsXml.prototype.getObjectCurrentAmountFormatted = function (id) {
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
EtsXml.prototype.getObjectPreviousAmountFormatted = function (id) {
   var searchId = id.trim();
   for (var i = 0; i < this.reportStructure.length; i++) {
      if (this.reportStructure[i]["id"] === searchId) {
         return this.reportStructure[i]["previousAmountFormatted"];
      }
   }
   this.banDoc.addMessage("Couldn't find object with id: " + id);
}


