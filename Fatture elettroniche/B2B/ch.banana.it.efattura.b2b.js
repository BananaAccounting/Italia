// Copyright [2021] [Banana.ch SA - Lugano Switzerland]
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
// @id = ch.banana.it.efattura.b2b
// @api = 1.0
// @pubdate = 2021-06-24
// @publisher = Banana.ch SA
// @description = Esporta e-fatture ordinarie v1.2 (*.xml)...
// @description.it = Esporta e-fatture ordinarie v1.2 (*.xml)...
// @doctype = *
// @task = app.command
// @inputdatasource = none
// @timeout = -1
// @includejs = ch.banana.it.efattura.b2b.xml.js

function exec(inData, options) {

   if (!Banana.document) {
      return "@Cancel";
   }

   var eFattura = new EFattura(Banana.document);
   if (!eFattura.verifyBananaVersion())
      return "@Cancel";

   var param = {};
   if (inData.length > 0) {
      param = JSON.parse(inData);
   }
   else if (options && options.useLastSettings) {
      param = JSON.parse(Banana.document.getScriptSettings("efatturaXMLItalia"));
   }
   else {
      if (!settingsDialog())
         return "@Cancel";
      param = JSON.parse(Banana.document.getScriptSettings("efatturaXMLItalia"));
   }

   eFattura.setParam(param);
   var jsonCustomerList = eFattura.loadData();

   if (jsonCustomerList.length <= 0) {
      return;
   }

   //output xml

   var progressBar = Banana.application.progressBar;
   if (typeof (progressBar.setText) !== 'undefined')
      progressBar.setText("Esporta fatture in XML...");
   progressBar.start(jsonCustomerList.length + 1);

   for (var i in jsonCustomerList) {
      if (!progressBar.step())
         return;
      if (typeof(progressBar.setText) !== 'undefined')
         progressBar.setText("creazione file XML in corso..." + i.toString());

      var jsonInvoices = jsonCustomerList[i];
      var xmlDocument = Banana.Xml.newDocument("root");
      eFattura.clearErrorList();
      var xmlContent = eFattura.createXml(jsonInvoices, xmlDocument, true);
      if (xmlContent == "@Cancel")
         break;

      // add stylesheet xslt
      if (eFattura.param.xml.xslt_filename) {
         var escapedString = xml_escapeString(eFattura.param.xml.xslt_filename);
         var xslt = "<?xml-stylesheet type='text/xsl' href='" + escapedString + "'?>";
         xmlContent = xmlContent.slice(0, 39) + xslt + xmlContent.slice(39);
      }
      // validate data
      if (eFattura.param.xml.validate_file && eFattura.param.xml.xsd_filename) {
         if (typeof (progressBar.setText) !== 'undefined')
            progressBar.setText("validazione file XML in corso..." + i.toString());
         var xsdFileName = eFattura.getXsdFileName();
         if (xsdFileName.length) {
            let noFattura = eFattura.readNoFattura(xmlContent);
            var result = Banana.Xml.validate(Banana.Xml.parse(xmlContent), xsdFileName);
            if (!result) {
               var msg = eFattura.getErrorMessage(eFattura.ID_ERR_XML_FILE_NONVALIDO);
               msg = msg.replace("%1", noFattura);
               msg = msg.replace("%2", Banana.Xml.errorString);
               Banana.document.addMessage(msg, eFattura.ID_ERR_XML_FILE_NONVALIDO);
            }
            else {
               var msg = eFattura.getErrorMessage(eFattura.ID_ERR_XML_FILE_VALIDO);
               msg = msg.replace("%1", noFattura);
               Banana.console.log(msg);
            }
         }
      }
      // save data
      if (!eFattura.saveFile(xmlContent, "xml"))
         break;
   }

   progressBar.finish();
}

/*function onCurrentIndexChanged_selection(index, value, params) {
   Banana.console.debug(index + " value: " +value);
   var enabled = true;
   if (value == 'Tutto')
      enabled = false;
   for (var i = 0; i < params.data.length; i++) {
      if (params.data[i].name === 'selection_invoice') {
          params.data[i].enabled = enabled;
      }
      if (params.data[i].name === 'selection_customer') {
         params.data[i].enabled = enabled;
     }
  }
  return params;
}*/

/*Update script's parameters*/
function settingsDialog() {
   var eFattura = new EFattura(Banana.document);
   if (!eFattura.verifyBananaVersion())
      return false;

   var savedParam = Banana.document.getScriptSettings("efatturaXMLItalia");
   if (savedParam.length > 0) {
      eFattura.setParam(JSON.parse(savedParam));
   }

   var dialogTitle = 'Settings';
   var pageAnchor = 'dlgSettings';
   var convertedParam = eFattura.convertParam(eFattura.param, true);
   if (!Banana.Ui.openPropertyEditor(dialogTitle, convertedParam, pageAnchor))
      return false;
   for (var i = 0; i < convertedParam.data.length; i++) {
      // Read values to param (through the readValue function)
      if (typeof (convertedParam.data[i].readValue) !== 'undefined')
         convertedParam.data[i].readValue();
   }
   var paramToString = JSON.stringify(eFattura.param);
   Banana.document.setScriptSettings("efatturaXMLItalia", paramToString);
   return true;
}

function EFattura(banDocument) {
   this.banDocument = banDocument;
   if (this.banDocument === undefined)
      this.banDocument = Banana.document;
   this.name = "Banana Accounting EFattura";
   this.version = "V1.0";
   this.helpId = "ch.banana.it.efattura.js";
   this.errorList = [];

   /* errors id*/
   this.ID_ERR_ACCOUNTING_TYPE_NOTVALID = "ID_ERR_ACCOUNTING_TYPE_NOTVALID";
   this.ID_ERR_INVOICENUMBER_MISSING = "ID_ERR_INVOICENUMBER_MISSING";
   this.ID_ERR_LICENSE_NOTVALID = "ID_ERR_LICENSE_NOTVALID";
   this.ID_ERR_NOINVOICE = "ID_ERR_NOINVOICE";
   this.ID_ERR_TABLE_ADDRESS_MISSING = "ID_ERR_TABLE_ADDRESS_MISSING";
   this.ID_ERR_TABLE_ADDRESS_NOT_UPDATED = "ID_ERR_TABLE_ADDRESS_NOT_UPDATED";
   this.ID_ERR_VERSION = "ID_ERR_VERSION";
   this.ID_ERR_VERSION_NOTSUPPORTED = "ID_ERR_VERSION_NOTSUPPORTED";
   this.ID_ERR_XML_FILE_NONVALIDO = "ID_ERR_XML_FILE_NONVALIDO";
   this.ID_ERR_XML_FILE_VALIDO = "ID_ERR_XML_FILE_VALIDO";
   this.ID_ERR_XML_FORMATO_NONVALIDO = "ID_ERR_XML_FORMATO_NONVALIDO";
   this.ID_ERR_XML_LUNGHEZZA_NONVALIDA = "ID_ERR_XML_LUNGHEZZA_NONVALIDA";
   this.ID_ERR_XML_LUNGHEZZAMIN_NONVALIDA = "ID_ERR_XML_LUNGHEZZAMIN_NONVALIDA";
   this.ID_ERR_XML_LUNGHEZZAMAX_NONVALIDA = "ID_ERR_XML_LUNGHEZZAMAX_NONVALIDA";
   this.ID_ERR_DOCTYPE_NOTVALID = "ID_ERR_DOCTYPE_NOTVALID";
   this.ID_ERR_NATURA_NOTVALID = "ID_ERR_NATURA_NOTVALID";

   this.initParam();
   this.initNamespaces();
   this.initSchemarefs();
}

EFattura.prototype.addMessage = function (msg, idMsg) {
   this.errorList.push(msg + " idMsg:[" + this.helpId + "::" + idMsg + "]");
   this.banDocument.addMessage(msg, this.helpId + "::" + idMsg);
}

//Aggiunge il testo al nodo controllando la stringa
//len: una sola cifra lunghezza fissa, due cifre separate da ... lunghezza min e max, nessuna cifra non controlla
//context: dà ulteriori informazioni nella stringa del messaggio d'errrore
EFattura.prototype.addTextNode = function (parentNode, text, len, context) {
   if (!parentNode)
      return;

   if (!text)
      text = '';

   var fixedLen = 0;
   var minLen = 0;
   var maxLen = 0;
   var msg = '';
   if (len && len.indexOf("...") > 0) {
      var lenArray = len.split("...");
      if (lenArray.length > 1) {
         minLen = parseInt(lenArray[0]);
         maxLen = parseInt(lenArray[1]);
      }
   }
   else if (len && len.length > 0) {
      fixedLen = parseInt(len);
   }
   if (fixedLen > 0 && text.length != fixedLen) {
      var msg = this.getErrorMessage(this.ID_ERR_XML_LUNGHEZZA_NONVALIDA);
      msg = msg.replace("%1", context);
      msg = msg.replace("%2", text);
      msg = msg.replace("%3", fixedLen);
      this.addMessage(msg, this.ID_ERR_XML_LUNGHEZZA_NONVALIDA);
   }
   else if (maxLen && text.length > maxLen) {
      var msg = this.getErrorMessage(this.ID_ERR_XML_LUNGHEZZAMAX_NONVALIDA);
      msg = msg.replace("%1", context);
      msg = msg.replace("%2", text);
      msg = msg.replace("%3", maxLen);
      this.addMessage(msg, this.ID_ERR_XML_LUNGHEZZAMAX_NONVALIDA);
   }
   else if (minLen && text.length < minLen) {
      var msg = this.getErrorMessage(this.ID_ERR_XML_LUNGHEZZAMIN_NONVALIDA);
      msg = msg.replace("%1", context);
      msg = msg.replace("%2", text);
      msg = msg.replace("%3", minLen);
      this.addMessage(msg, this.ID_ERR_XML_LUNGHEZZAMIN_NONVALIDA);
   }
   parentNode.addTextNode(text);
}

EFattura.prototype.formatAmount = function (amount) {

   var amountFormatted = amount;
   /*if (amountFormatted)
     amountFormatted = Banana.Converter.toLocaleNumberFormat(Banana.SDecimal.abs(amountFormatted))
   else
       amountFormatted = "";*/
   if (Banana.SDecimal.isZero(amountFormatted))
      return "0.00";
   return amountFormatted;
}

EFattura.prototype.clearErrorList = function () {
   this.errorList = [];
}

EFattura.prototype.convertParam = function (param, includiOpzioniStampa) {
   var convertedParam = {};
   convertedParam.version = '1.0';
   /* array of script's parameters */
   convertedParam.data = [];

   /*******************************************************************************************
   * STAMPA
   *******************************************************************************************/
   if (includiOpzioniStampa) {
      var currentParam = {};
      currentParam.name = 'selection';
      currentParam.title = 'Filtra';
      currentParam.type = 'bool';
      currentParam.value = param.selection ? param.selection : false;
      currentParam.defaultvalue = false;
      currentParam.readValue = function () {
         param.selection = this.value;
      }
      convertedParam.data.push(currentParam);

      currentParam = {};
      currentParam.name = 'selection_invoice';
      currentParam.title = 'Numero fattura';
      currentParam.type = 'string';
      currentParam.parentObject = 'selection';
      currentParam.value = param.selection_invoice ? param.selection_invoice : '';
      currentParam.defaultvalue = '';
      currentParam.readValue = function () {
         param.selection_invoice = this.value;
      }
      convertedParam.data.push(currentParam);

      currentParam = {};
      currentParam.name = 'selection_customer';
      currentParam.title = 'Numero cliente';
      currentParam.type = 'string';
      currentParam.parentObject = 'selection';
      currentParam.value = param.selection_customer ? param.selection_customer : '';
      currentParam.defaultvalue = '';
      currentParam.readValue = function () {
         param.selection_customer = this.value;
      }
      convertedParam.data.push(currentParam);

      currentParam = {};
      currentParam.name = 'period';
      currentParam.title = 'Periodo';
      currentParam.type = 'bool';
      currentParam.value = param.period ? param.period : false;
      currentParam.defaultvalue = false;
      currentParam.readValue = function () {
         param.period = this.value;
      }
      convertedParam.data.push(currentParam);

      currentParam = {};
      currentParam.name = 'periodStartDate';
      currentParam.title = 'Dalla data';
      currentParam.type = 'date';
      currentParam.parentObject = 'period';
      currentParam.value = param.periodStartDate ? param.periodStartDate : '';
      currentParam.defaultvalue = '';
      currentParam.readValue = function () {
         var startDate = Banana.Converter.toInternalDateFormat(this.value, "dd.mm.yyyy");
         startDate = startDate.replace(new RegExp("-", 'g'), "");
         param.periodStartDate = startDate;
      }
      convertedParam.data.push(currentParam);

      currentParam = {};
      currentParam.name = 'periodEndDate';
      currentParam.title = 'Alla data';
      currentParam.type = 'date';
      currentParam.parentObject = 'period';
      currentParam.value = param.periodEndDate ? param.periodEndDate : '';
      currentParam.defaultvalue = '';
      currentParam.readValue = function () {
         var endDate = Banana.Converter.toInternalDateFormat(this.value, "dd.mm.yyyy");
         endDate = endDate.replace(new RegExp("-", 'g'), "");
         param.periodEndDate = endDate;
      }
      convertedParam.data.push(currentParam);
   }
   /*******************************************************************************************
   * DATI CONTRIBUENTE
   *******************************************************************************************/
   var currentParam = {};
   currentParam.name = 'contribuente';
   currentParam.title = 'Dati contribuente';
   currentParam.editable = false;
   if (includiOpzioniStampa)
      currentParam.collapse = true;
   convertedParam.data.push(currentParam);

   currentParam = {};
   currentParam.name = 'codiceFiscale';
   currentParam.title = 'Codice Fiscale';
   currentParam.type = 'string';
   currentParam.parentObject = 'contribuente';
   currentParam.value = param.contribuente.codiceFiscale ? param.contribuente.codiceFiscale : '';
   currentParam.readValue = function () {
      param.contribuente.codiceFiscale = this.value;
   }
   convertedParam.data.push(currentParam);

   currentParam = {};
   currentParam.name = 'partitaIva';
   currentParam.title = 'Partita Iva';
   currentParam.type = 'string';
   currentParam.parentObject = 'contribuente';
   currentParam.value = param.contribuente.partitaIva ? param.contribuente.partitaIva : '';
   currentParam.readValue = function () {
      param.contribuente.partitaIva = this.value;
   }
   convertedParam.data.push(currentParam);

   currentParam = {};
   currentParam.name = 'tipoContribuente';
   currentParam.title = 'Tipo';
   currentParam.type = 'combobox';
   currentParam.parentObject = 'contribuente';
   currentParam.value = param.contribuente.tipoContribuente ? param.contribuente.tipoContribuente : 'persona fisica';
   currentParam.items = ['persona fisica', 'persona giuridica'];
   currentParam.readValue = function () {
      param.contribuente.tipoContribuente = this.value;
   }
   convertedParam.data.push(currentParam);

   currentParam = {};
   currentParam.name = 'societa';
   currentParam.title = 'Società';
   currentParam.type = 'string';
   currentParam.parentObject = 'contribuente';
   currentParam.value = param.contribuente.societa ? param.contribuente.societa : '';
   currentParam.readValue = function () {
      param.contribuente.societa = this.value;
   }
   convertedParam.data.push(currentParam);

   currentParam = {};
   currentParam.name = 'cognome';
   currentParam.title = 'Cognome';
   currentParam.type = 'string';
   currentParam.parentObject = 'contribuente';
   currentParam.value = param.contribuente.cognome ? param.contribuente.cognome : '';
   currentParam.readValue = function () {
      param.contribuente.cognome = this.value;
   }
   convertedParam.data.push(currentParam);

   currentParam = {};
   currentParam.name = 'nome';
   currentParam.title = 'Nome';
   currentParam.type = 'string';
   currentParam.parentObject = 'contribuente';
   currentParam.value = param.contribuente.nome ? param.contribuente.nome : '';
   currentParam.readValue = function () {
      param.contribuente.nome = this.value;
   }
   convertedParam.data.push(currentParam);

   currentParam = {};
   currentParam.name = 'indirizzo';
   currentParam.title = 'Indirizzo';
   currentParam.type = 'string';
   currentParam.parentObject = 'contribuente';
   currentParam.value = param.contribuente.indirizzo ? param.contribuente.indirizzo : '';
   currentParam.readValue = function () {
      param.contribuente.indirizzo = this.value;
   }
   convertedParam.data.push(currentParam);

   currentParam = {};
   currentParam.name = 'ncivico';
   currentParam.title = 'N. civico';
   currentParam.type = 'string';
   currentParam.parentObject = 'contribuente';
   currentParam.value = param.contribuente.ncivico ? param.contribuente.ncivico : '';
   currentParam.readValue = function () {
      param.contribuente.ncivico = this.value;
   }
   convertedParam.data.push(currentParam);

   currentParam = {};
   currentParam.name = 'cap';
   currentParam.title = 'Cap';
   currentParam.type = 'string';
   currentParam.parentObject = 'contribuente';
   currentParam.value = param.contribuente.cap ? param.contribuente.cap : '';
   currentParam.readValue = function () {
      param.contribuente.cap = this.value;
   }
   convertedParam.data.push(currentParam);

   currentParam = {};
   currentParam.name = 'comune';
   currentParam.title = 'Comune';
   currentParam.type = 'string';
   currentParam.parentObject = 'contribuente';
   currentParam.value = param.contribuente.comune ? param.contribuente.comune : '';
   currentParam.readValue = function () {
      param.contribuente.comune = this.value;
   }
   convertedParam.data.push(currentParam);

   currentParam = {};
   currentParam.name = 'provincia';
   currentParam.title = 'Provincia';
   currentParam.type = 'string';
   currentParam.parentObject = 'contribuente';
   currentParam.value = param.contribuente.provincia ? param.contribuente.provincia : '';
   currentParam.readValue = function () {
      param.contribuente.provincia = this.value;
   }
   convertedParam.data.push(currentParam);

   currentParam = {};
   currentParam.name = 'nazione';
   currentParam.title = 'Nazione';
   currentParam.type = 'string';
   currentParam.parentObject = 'contribuente';
   currentParam.value = param.contribuente.nazione ? param.contribuente.nazione : '';
   currentParam.readValue = function () {
      param.contribuente.nazione = this.value;
   }
   convertedParam.data.push(currentParam);

   currentParam = {};
   currentParam.name = 'tipoRegimeFiscale';
   currentParam.title = 'Tipo regime fiscale';
   currentParam.type = 'combobox';
   currentParam.parentObject = 'contribuente';
   currentParam.value = param.contribuente.tipoRegimeFiscale ? param.contribuente.tipoRegimeFiscale : '';
   currentParam.items = ['RF01', 'RF02', 'RF03', 'RF04', 'RF05', 'RF06', 'RF07', 'RF08', 'RF09', 'RF10', 'RF11', 'RF12', 'RF13', 'RF14', 'RF15', 'RF16', 'RF17', 'RF18', 'RF19'];
   currentParam.readValue = function () {
      param.contribuente.tipoRegimeFiscale = this.value;
   }
   convertedParam.data.push(currentParam);

   /*******************************************************************************************
   * OPZIONI XML
   *******************************************************************************************/
   currentParam = {};
   currentParam.name = 'xml';
   currentParam.title = 'Opzioni XML';
   currentParam.editable = false;
   if (includiOpzioniStampa)
      currentParam.collapse = true;
   convertedParam.data.push(currentParam);

   currentParam = {};
   currentParam.name = 'progressive';
   currentParam.title = 'Numero progressivo invio';
   currentParam.type = 'string';
   currentParam.parentObject = 'xml';
   currentParam.value = param.xml.progressive ? param.xml.progressive : '';
   currentParam.readValue = function () {
      param.xml.progressive = this.value;
   }
   convertedParam.data.push(currentParam);

   currentParam = {};
   currentParam.name = 'destination_folder';
   currentParam.title = 'Cartella di destinazione';
   currentParam.type = 'string';
   currentParam.parentObject = 'xml';
   currentParam.value = param.xml.destination_folder ? param.xml.destination_folder : '';
   currentParam.readValue = function () {
      param.xml.destination_folder = this.value;
   }
   convertedParam.data.push(currentParam);

   currentParam = {};
   currentParam.name = 'validate_file';
   currentParam.title = 'Convalida file';
   currentParam.type = 'bool';
   currentParam.parentObject = 'xml';
   currentParam.value = param.xml.validate_file ? param.xml.validate_file : false;
   currentParam.readValue = function () {
      param.xml.validate_file = this.value;
   }
   convertedParam.data.push(currentParam);

   currentParam = {};
   currentParam.name = 'xsd_filename';
   currentParam.title = 'Schema di validazione';
   currentParam.type = 'string';
   currentParam.defaultvalue = '';
   currentParam.parentObject = 'xml';
   currentParam.value = param.xml.xsd_filename ? param.xml.xsd_filename : '';
   currentParam.readValue = function () {
      param.xml.xsd_filename = this.value;
   }
   convertedParam.data.push(currentParam);

   currentParam = {};
   currentParam.name = 'xslt_filename';
   currentParam.title = 'Foglio di stile';
   currentParam.type = 'string';
   currentParam.parentObject = 'xml';
   currentParam.value = param.xml.xslt_filename ? param.xml.xslt_filename : '';
   currentParam.readValue = function () {
      param.xml.xslt_filename = this.value;
   }
   convertedParam.data.push(currentParam);

   currentParam = {};
   currentParam.name = 'open_file';
   currentParam.title = 'Visualizza file immediatamente';
   currentParam.type = 'bool';
   currentParam.parentObject = 'xml';
   currentParam.value = param.xml.open_file ? param.xml.open_file : true;
   currentParam.readValue = function () {
      param.xml.open_file = this.value;
   }
   convertedParam.data.push(currentParam);

   return convertedParam;
}

EFattura.prototype.createXml = function (jsonInvoiceList, xmlDocument, indent) {

   if (!xmlDocument || jsonInvoiceList.length <= 0)
      return "@Cancel";

   var nodeRoot = this.createXmlHeader(jsonInvoiceList[0], xmlDocument);
   if (!nodeRoot || this.isEmpty(nodeRoot))
      return "@Cancel";
   for (var i = 0; i < jsonInvoiceList.length; i++) {
      this.createXmlBody(jsonInvoiceList[i], nodeRoot);
   }
   return Banana.Xml.save(xmlDocument, indent);
}
/*
* xml instance file <FatturaElettronicaBody>
*/
EFattura.prototype.createXmlBody = function (jsonInvoice, nodeRoot) {

   var invoiceObj = null;
   if (typeof (jsonInvoice) === 'object') {
      invoiceObj = jsonInvoice;
   } else if (typeof (jsonInvoice) === 'string') {
      invoiceObj = JSON.parse(jsonInvoice)
   }

   if (!nodeRoot || !invoiceObj)
      return;

   //Numero fattura da visualizzare in eventuali messaggi d'errore per facilitare l'individuazione dell'errore
   var msgHelpNoFattura = " (No fattura " + invoiceObj.document_info.number + ")";

   // Body
   var nodeFatturaElettronicaBody = nodeRoot.addElement("FatturaElettronicaBody");
   var nodeDatiGenerali = nodeFatturaElettronicaBody.addElement("DatiGenerali");
   var nodeDatiGeneraliDocumento = nodeDatiGenerali.addElement("DatiGeneraliDocumento");
   var nodeTipoDocumento = nodeDatiGeneraliDocumento.addElement("TipoDocumento");

   //tipodocumento
   var docType = 'TD01';
   for (var key in invoiceObj.parameters) {
      if (key.startsWith('TD') && key.length == 4) {
         docType = key;
      }
   }

   //nel caso il tipodocumento non sia un tipo ammesso, segnala l'errore
   if (!['TD01', 'TD02', 'TD03', 'TD04', 'TD05', 'TD06', 'TD16', 'TD17', 'TD18', 'TD19', 'TD20', 'TD21', 'TD22', 'TD23', 'TD24', 'TD25', 'TD26', 'TD27'].includes(docType)) {
      var msg = this.getErrorMessage(this.ID_ERR_DOCTYPE_NOTVALID);
      msg = msg.replace("%1", docType);
      this.addMessage(msg, this.ID_ERR_DOCTYPE_NOTVALID);
   }


   this.addTextNode(nodeTipoDocumento, docType, '4', 'DatiGeneraliDocumento/TipoDocumento ' + msgHelpNoFattura);
   var nodeDivisa = nodeDatiGeneraliDocumento.addElement("Divisa");
   this.addTextNode(nodeDivisa, invoiceObj.document_info.currency, '3', 'DatiGeneraliDocumento/Divisa ' + msgHelpNoFattura);
   var nodeData = nodeDatiGeneraliDocumento.addElement("Data");
   this.addTextNode(nodeData, invoiceObj.document_info.date, '10', 'DatiGeneraliDocumento/Data ' + msgHelpNoFattura);
   var nodeNumero = nodeDatiGeneraliDocumento.addElement("Numero");
   this.addTextNode(nodeNumero, invoiceObj.document_info.number, '1...20', 'DatiGeneraliDocumento/Numero ' + msgHelpNoFattura);

   //2.1.1.9 <ImportoTotaleDocumento> Importo totale del documento al netto dell'eventuale sconto e comprensivo di imposta a debito del cessionario / committente
   //Elemento non obbligatorio, però se non specificato risultano fatture con totale 0 nel nostro sistema di interscambio
   var nodeTotaleDocumento = nodeDatiGeneraliDocumento.addElement("ImportoTotaleDocumento");
   var totaleDaPagare = Banana.SDecimal.round(invoiceObj.billing_info.total_to_pay, { 'decimals': 2 });
   this.addTextNode(nodeTotaleDocumento, this.formatAmount(totaleDaPagare), '4...15', 'DatiGeneraliDocumento/ImportoTotaleDocumento ' + msgHelpNoFattura);

   //In total_vat_rates[] non sono presenti imponibile/imposta per aliquota allo 0%, da correggere in Banana
   //imponibili con aliquota allo 0% vengono raggruppati per codice natura perché nel riepilogo la natura dev'essere specificata
   var imponibileAliquota0List = [];
   var nodeDatiBeniServizi = nodeFatturaElettronicaBody.addElement("DatiBeniServizi");
   for (var i = 0; i < invoiceObj.items.length; i++) {
      if (invoiceObj.items[i].item_type !== "item" && invoiceObj.items[i].item_type !== "note")
         continue;
      var nodeDettaglioLinee = nodeDatiBeniServizi.addElement("DettaglioLinee");
      var nodeNumeroLinea = nodeDettaglioLinee.addElement("NumeroLinea");
      this.addTextNode(nodeNumeroLinea, parseInt(i + 1).toString(), '1...4', 'DettaglioLinee/NumeroLinea ' + msgHelpNoFattura);
      var nodeDescrizione = nodeDettaglioLinee.addElement("Descrizione");
      this.addTextNode(nodeDescrizione, invoiceObj.items[i].description, '1...1000', 'DettaglioLinee/Descrizione ' + msgHelpNoFattura);
      var stampaQuantita = false;
      if (!Banana.SDecimal.isZero(invoiceObj.items[i].quantity))
         stampaQuantita = true;
      if (stampaQuantita && parseInt(invoiceObj.items[i].quantity) === 1 && invoiceObj.items[i].mesure_unit.length <= 0)
         stampaQuantita = false;
      if (stampaQuantita) {
         var quantita = Banana.SDecimal.round(invoiceObj.items[i].quantity, { 'decimals': 4 });
         var nodeQuantita = nodeDettaglioLinee.addElement("Quantita");
         this.addTextNode(nodeQuantita, quantita, '4...21', 'DettaglioLinee/Quantita ' + msgHelpNoFattura);
         var nodeUnitaMisura = nodeDettaglioLinee.addElement("UnitaMisura");
         this.addTextNode(nodeUnitaMisura, invoiceObj.items[i].mesure_unit, '1...10', 'DettaglioLinee/UnitaMisura ' + msgHelpNoFattura);
      }
      var nodePrezzoUnitario = nodeDettaglioLinee.addElement("PrezzoUnitario");
      var prezzoUnitario = invoiceObj.items[i].unit_price.calculated_amount_vat_exclusive;
      this.addTextNode(nodePrezzoUnitario, this.formatAmount(prezzoUnitario), '4...21', 'DettaglioLinee/PrezzoUnitario ' + msgHelpNoFattura);
      var nodePrezzoTotale = nodeDettaglioLinee.addElement("PrezzoTotale");
      var prezzoTotale = invoiceObj.items[i].total_amount_vat_exclusive;
      this.addTextNode(nodePrezzoTotale, this.formatAmount(prezzoTotale), '4...21', 'DettaglioLinee/PrezzoTotale ' + msgHelpNoFattura);
      var nodeAliquotaIVA = nodeDettaglioLinee.addElement("AliquotaIVA");
      var aliquotaIva = Banana.SDecimal.round(invoiceObj.items[i].unit_price.vat_rate, { 'decimals': 2 });

      //Aliquota IVA: nel caso di non applicabilità, il campo deve essere valorizzato a zero
      //if (invoiceObj.items[i].unit_price.vat_code.length>0) {
      this.addTextNode(nodeAliquotaIVA, aliquotaIva, '4...6', 'DettaglioLinee/AliquotaIVA ' + msgHelpNoFattura);

      if (Banana.SDecimal.isZero(aliquotaIva) && this.banDocument.table("VatCodes")) {
         //riprende il codice natura dalla tabella codici iva, colonna Gr1
         var natura = this.getCodiceNatura(invoiceObj.items[i].unit_price.vat_code);
         if (natura.length) {
            if (!['N1', 'N2.1', 'N2.2', 'N3.1', 'N3.2', 'N3.3', 'N3.4', 'N3.5', 'N3.6', 'N4', 'N5', 'N6.1', 'N6.2', 'N6.3', 'N6.4', 'N6.5', 'N6.6', 'N6.7', 'N6.8', 'N6.9', 'N7'].includes(natura)) {
               var msg = this.getErrorMessage(this.ID_ERR_NATURA_NOTVALID);
               msg = msg.replace("%1", natura);
               this.addMessage(msg, this.ID_ERR_NATURA_NOTVALID);
            }
            var nodeNatura = nodeDettaglioLinee.addElement("Natura");
            this.addTextNode(nodeNatura, natura, '2...4', 'DettaglioLinee/Natura ' + msgHelpNoFattura);
         }
         else {
            natura = "void";
         }
         if (!imponibileAliquota0List[natura])
            imponibileAliquota0List[natura] = 0;
         var imponibileAliquota0 = invoiceObj.items[i].total_amount_vat_exclusive;
         imponibileAliquota0List[natura] = Banana.SDecimal.add(imponibileAliquota0, imponibileAliquota0List[natura]);
      }
      //}
   }

   //Dati Riepilogo <1.N> blocco sempre obbligatorio contenente i dati di riepilogo per ogni aliquota IVA o natura
   for (var i = 0; i < invoiceObj.billing_info.total_vat_rates.length; i++) {
      var aliquotaIva = Banana.SDecimal.round(invoiceObj.billing_info.total_vat_rates[i].vat_rate, { 'decimals': 2 });
      if (Banana.SDecimal.isZero(aliquotaIva))
         continue;
      var nodeDatiRiepilogo = nodeDatiBeniServizi.addElement("DatiRiepilogo")
      var nodeAliquotaIVA = nodeDatiRiepilogo.addElement("AliquotaIVA");
      this.addTextNode(nodeAliquotaIVA, aliquotaIva, '4...6', 'DatiRiepilogo/AliquotaIVA ' + msgHelpNoFattura);

      var imponibileImporto = invoiceObj.billing_info.total_vat_rates[i].total_amount_vat_exclusive;
      var nodeImponibileImporto = nodeDatiRiepilogo.addElement("ImponibileImporto");
      this.addTextNode(nodeImponibileImporto, this.formatAmount(imponibileImporto), '4...15', 'DatiRiepilogo/ImponibileImporto ' + msgHelpNoFattura);

      var imposta = invoiceObj.billing_info.total_vat_rates[i].total_vat_amount;
      var nodeImposta = nodeDatiRiepilogo.addElement("Imposta");
      this.addTextNode(nodeImposta, this.formatAmount(imposta), '4...15', 'DatiRiepilogo/Imposta ' + msgHelpNoFattura);
   }
   for (var codNatura in imponibileAliquota0List) {
      var imponibileAliquota0 = imponibileAliquota0List[codNatura];
      var nodeDatiRiepilogo = nodeDatiBeniServizi.addElement("DatiRiepilogo")
      var nodeAliquotaIVA = nodeDatiRiepilogo.addElement("AliquotaIVA");
      this.addTextNode(nodeAliquotaIVA, "0.00", '4...6', 'DatiRiepilogo/AliquotaIVA ' + msgHelpNoFattura);

      if (codNatura !== "void") {
         var nodeNatura = nodeDatiRiepilogo.addElement("Natura");
         this.addTextNode(nodeNatura, codNatura, '2...4', 'DettaglioLinee/Natura ' + msgHelpNoFattura);
      }

      var nodeImponibileImporto = nodeDatiRiepilogo.addElement("ImponibileImporto");
      this.addTextNode(nodeImponibileImporto, imponibileAliquota0, '4...15', 'DatiRiepilogo/ImponibileImporto ' + msgHelpNoFattura);

      var nodeImposta = nodeDatiRiepilogo.addElement("Imposta");
      this.addTextNode(nodeImposta, "0.00", '4...15', 'DatiRiepilogo/Imposta ' + msgHelpNoFattura);

   }
}

/*
* xml instance file <FatturaElettronicaHeader>
*/
EFattura.prototype.createXmlHeader = function (jsonInvoice, xmlDocument) {
   var invoiceObj = null;
   if (typeof (jsonInvoice) === 'object') {
      invoiceObj = jsonInvoice;
   } else if (typeof (jsonInvoice) === 'string') {
      invoiceObj = JSON.parse(jsonInvoice)
   }

   if (!xmlDocument || !invoiceObj)
      return null;

   //<Document>

   //Versione
   var formatoTrasmissione = "";
   var codiceDestinatario = "";
   var pecDestinatario = "";
   var accountObj = this.getAccount(invoiceObj.customer_info.number);
   if (accountObj && accountObj["Code1"]) {
      var value = accountObj["Code1"];
      if (value && value.length > 0) {
         var values = value.split(":");
         if (values.length > 0)
            formatoTrasmissione = values[0];
         if (values.length > 1)
            codiceDestinatario = values[1];
         if (values.length > 2)
            pecDestinatario = values[2];
      }
   }
   if (formatoTrasmissione !== "FPA12" && formatoTrasmissione !== "FPR12") {
      var msg = this.getErrorMessage(this.ID_ERR_XML_FORMATO_NONVALIDO);
      this.addMessage(msg, this.ID_ERR_XML_FORMATO_NONVALIDO);
      return null;
   }

   var nodeRoot = xmlDocument.addElement("p:FatturaElettronica");
   nodeRoot.setAttribute("versione", formatoTrasmissione);

   for (var j in this.namespaces) {
      var prefix = this.namespaces[j]['prefix'];
      var namespace = this.namespaces[j]['namespace'];
      nodeRoot.setAttribute(prefix, namespace);
   }
   var attrsSchemaLocation = ''
   for (var j in this.schemaRefs) {
      var schema = this.schemaRefs[j];
      if (schema.length > 0) {
         attrsSchemaLocation += " " + schema;
      }
   }
   if (attrsSchemaLocation.length > 0)
      nodeRoot.setAttribute("xsi:schemaLocation", attrsSchemaLocation);

   //Numero fattura da visualizzare in eventuali messaggi d'errore per facilitare l'individuazione dell'errore
   var msgHelpNoFattura = " (No fattura " + invoiceObj.document_info.number + ")";

   //Header

   var nodeFatturaElettronicaHeader = nodeRoot.addElement("FatturaElettronicaHeader");

   //[1.1] DatiTrasmissione 
   var nodeDatiTrasmissione = nodeFatturaElettronicaHeader.addElement("DatiTrasmissione");
   //[1.1.1] IdTrasmittente 
   var nodeIdTrasmittente = nodeDatiTrasmissione.addElement("IdTrasmittente");
   //[1.1.1.1] IdPaese 
   var nodeIdPaese = nodeIdTrasmittente.addElement("IdPaese");
   this.addTextNode(nodeIdPaese, this.param.contribuente.nazione, '2', 'IdTrasmittente/IdPaese' + msgHelpNoFattura);
   //[1.1.1.2] IdCodice 
   var nodeIdCodice = nodeIdTrasmittente.addElement("IdCodice");
   this.addTextNode(nodeIdCodice, this.param.contribuente.codiceFiscale, '1...28', 'IdTrasmittente/IdCodice' + msgHelpNoFattura);
   //[1.1.2] ProgressivoInvio 
   var nodeProgressivoInvio = nodeDatiTrasmissione.addElement("ProgressivoInvio");
   this.addTextNode(nodeProgressivoInvio, this.getProgressiveNumber(), '1...10', 'DatiTrasmissione/ProgressivoInvio' + msgHelpNoFattura);
   //[1.1.3] FormatoTrasmissione 
   var nodeFormatoTrasmissione = nodeDatiTrasmissione.addElement("FormatoTrasmissione");
   this.addTextNode(nodeFormatoTrasmissione, formatoTrasmissione, '5', 'DatiTrasmissione/FormatoTrasmissione' + msgHelpNoFattura);

   /*   
Come precisato nel provvedimento Agenzia delle Entrate 30 aprile 2018 n. 89757, nella sezione relativa ai dati per la trasmissione della e-fattura il fornitore deve riportare, nel campo “CodiceDestinatario”:
– il codice a 7 cifre eventualmente comunicato dal cliente, che indica il canale telematico da questi prescelto per la ricezione (web service o FTP);
– il codice “0000000” e, nel campo “PECDestinatario”, l’indirizzo di posta elettronica certificata, se il cliente richiede che le e-fatture gli siano recapitate a una casella PEC;
– il codice “0000000”, senza compilare il campo “PECDestinatario”, nell’ipotesi in cui non disponga dell’indirizzo telematico del proprio cliente.
*/

   var nodeCodiceDestinatario = nodeDatiTrasmissione.addElement("CodiceDestinatario");
   if (codiceDestinatario === "0000000") {
      this.addTextNode(nodeCodiceDestinatario, codiceDestinatario, '7', 'DatiTrasmissione/CodiceDestinatario' + msgHelpNoFattura);
      if (pecDestinatario.length > 0) {
         var nodePECDestinatario = nodeDatiTrasmissione.addElement("PECDestinatario");
         this.addTextNode(nodePECDestinatario, pecDestinatario, '7...256', 'DatiTrasmissione/PECDestinatario' + msgHelpNoFattura);
      }
   }
   else {
      this.addTextNode(nodeCodiceDestinatario, codiceDestinatario, '6...7', 'DatiTrasmissione/CodiceDestinatario' + msgHelpNoFattura);
   }
   //[1.2] CedentePrestatore 
   var nodeCedentePrestatore = nodeFatturaElettronicaHeader.addElement("CedentePrestatore");
   //[1.2.1] DatiAnagrafici 
   var nodeDatiAnagrafici = nodeCedentePrestatore.addElement("DatiAnagrafici");
   //[1.2.1.1] IdFiscaleIVA 
   var nodeIdFiscaleIVA = nodeDatiAnagrafici.addElement("IdFiscaleIVA");
   //[1.2.1.1.1] IdPaese 
   var nodeIdPaese = nodeIdFiscaleIVA.addElement("IdPaese");
   this.addTextNode(nodeIdPaese, this.param.contribuente.nazione, '2', 'CedentePrestatore/DatiAnagrafici/IdFiscaleIVA/IdPaese' + msgHelpNoFattura);
   //[1.2.1.1.2] IdCodice 
   var nodeIdCodice = nodeIdFiscaleIVA.addElement("IdCodice");
   this.addTextNode(nodeIdCodice, this.param.contribuente.partitaIva, '1...28', 'CedentePrestatore/DatiAnagrafici/IdFiscaleIVA/IdCodice' + msgHelpNoFattura);
   //[1.2.1.2] CodiceFiscale 
   if (this.param.contribuente.codiceFiscale.length > 0) {
      var nodeCodiceFiscale = nodeDatiAnagrafici.addElement("CodiceFiscale");
      this.addTextNode(nodeCodiceFiscale, this.param.contribuente.codiceFiscale, '11...16', 'CedentePrestatore/DatiAnagrafici/CodiceFiscale' + msgHelpNoFattura);
   }
   //[1.2.1.3] Anagrafica 
   var nodeAnagrafica = nodeDatiAnagrafici.addElement("Anagrafica");
   if (this.param.contribuente.tipoContribuente === 'persona fisica') {
      var nodeNome = nodeAnagrafica.addElement("Nome");
      var nodeCognome = nodeAnagrafica.addElement("Cognome");

      this.addTextNode(nodeNome, this.param.contribuente.nome, '1...60', '<CedentePrestatore><DatiAnagrafici><Anagrafica><Nome>' + msgHelpNoFattura);
      this.addTextNode(nodeCognome, this.param.contribuente.cognome, '1...60', '<CedentePrestatore><DatiAnagrafici><Anagrafica><Cognome>' + msgHelpNoFattura);

   }
   else if (this.param.contribuente.tipoContribuente === 'persona giuridica') {
      var nodeDenominazione = nodeAnagrafica.addElement("Denominazione");
      this.addTextNode(nodeDenominazione, this.param.contribuente.societa, '1...80', '<CedentePrestatore><DatiAnagrafici><Anagrafica><Denominazione>' + msgHelpNoFattura);
   }

   var nodeRegimeFiscale = nodeDatiAnagrafici.addElement("RegimeFiscale");
   var regFis = this.param.contribuente.tipoRegimeFiscale;
   this.addTextNode(nodeRegimeFiscale, regFis, '4', '<CedentePrestatore><DatiAnagrafici><RegimeFiscale>' + msgHelpNoFattura);
   var nodeSede = nodeCedentePrestatore.addElement("Sede");
   var nodeIndirizzo = nodeSede.addElement("Indirizzo");
   this.addTextNode(nodeIndirizzo, this.param.contribuente.indirizzo, '1...60', '<CedentePrestatore><Sede><Indirizzo>' + msgHelpNoFattura);
   if (this.param.contribuente.ncivico.length > 0) {
      var nodeNumeroCivico = nodeSede.addElement("NumeroCivico");
      this.addTextNode(nodeNumeroCivico, this.param.contribuente.ncivico, '1...8', '<CedentePrestatore><Sede><NumeroCivico>' + msgHelpNoFattura);
   }
   var nodeCAP = nodeSede.addElement("CAP");
   this.addTextNode(nodeCAP, this.param.contribuente.cap, '5', '<CedentePrestatore><Sede><CAP>' + msgHelpNoFattura);
   var nodeComune = nodeSede.addElement("Comune");
   this.addTextNode(nodeComune, this.param.contribuente.comune, '1...60', '<CedentePrestatore><Sede><Comune>' + msgHelpNoFattura);
   if (this.param.contribuente.nazione === 'IT') {
      var nodeProvincia = nodeSede.addElement("Provincia");
      this.addTextNode(nodeProvincia, this.param.contribuente.provincia, '2', '<CedentePrestatore><Sede><Provincia>' + msgHelpNoFattura);
   }
   var nodeNazione = nodeSede.addElement("Nazione");
   this.addTextNode(nodeNazione, this.param.contribuente.nazione, '2', '<CedentePrestatore><Sede><Nazione>' + msgHelpNoFattura);

   var nodeCessionarioCommittente = nodeFatturaElettronicaHeader.addElement("CessionarioCommittente");
   var nodeDatiAnagrafici = nodeCessionarioCommittente.addElement("DatiAnagrafici");
   if (invoiceObj.customer_info.vat_number) {
      var nodeIdFiscaleIVA = nodeDatiAnagrafici.addElement("IdFiscaleIVA");
      var nodeIdPaese = nodeIdFiscaleIVA.addElement("IdPaese");
      var countryCode = invoiceObj.customer_info.country_code;
      if (!countryCode || countryCode.length <= 0) {
         countryCode = this.getCountryCode(invoiceObj.customer_info.country);
      }
      this.addTextNode(nodeIdPaese, countryCode, '2', '<CessionarioCommittente><DatiAnagrafici><IdFiscaleIVA><IdPaese>' + msgHelpNoFattura);
      var nodeIdCodice = nodeIdFiscaleIVA.addElement("IdCodice");
      this.addTextNode(nodeIdCodice, invoiceObj.customer_info.vat_number, '1...28', '<CessionarioCommittente><DatiAnagrafici><IdFiscaleIVA><IdCodice>' + msgHelpNoFattura);
   }
   else {
      var nodeCodiceFiscale = nodeDatiAnagrafici.addElement("CodiceFiscale");
      this.addTextNode(nodeCodiceFiscale, invoiceObj.customer_info.fiscal_number, '11...16', '<CessionarioCommittente><DatiAnagrafici><CodiceFiscale>' + msgHelpNoFattura);
   }
   var nodeAnagrafica = nodeDatiAnagrafici.addElement("Anagrafica");
   // nodeAnagrafica.addTextNode(JSON.stringify(invoiceObj));
   if (invoiceObj.customer_info.business_name) {
      var nodeDenominazione = nodeAnagrafica.addElement("Denominazione");
      this.addTextNode(nodeDenominazione, invoiceObj.customer_info.business_name, '1...80', '<CessionarioCommittente><DatiAnagrafici><Anagrafica><Denominazione>' + msgHelpNoFattura);
   }
   else {
      var nodeNome = nodeAnagrafica.addElement("Nome");
      var nodeCognome = nodeAnagrafica.addElement("Cognome");

      this.addTextNode(nodeNome, invoiceObj.customer_info.first_name, '1...60', '<CessionarioCommittente><DatiAnagrafici><Anagrafica><Nome>' + msgHelpNoFattura);
      this.addTextNode(nodeCognome, invoiceObj.customer_info.last_name, '1...60', '<CessionarioCommittente><DatiAnagrafici><Anagrafica><Cognome>' + msgHelpNoFattura);
   }

   var nodeSede = nodeCessionarioCommittente.addElement("Sede");
   var nodeIndirizzo = nodeSede.addElement("Indirizzo");
   this.addTextNode(nodeIndirizzo, invoiceObj.customer_info.address1, '1...60', '<CessionarioCommittente><Sede><Indirizzo>' + msgHelpNoFattura);

   var nodeCAP = nodeSede.addElement("CAP");
   this.addTextNode(nodeCAP, invoiceObj.customer_info.postal_code, '5', '<CessionarioCommittente><Sede><CAP>' + msgHelpNoFattura);
   var nodeComune = nodeSede.addElement("Comune");
   this.addTextNode(nodeComune, invoiceObj.customer_info.city, '1...60', '<CessionarioCommittente><Sede><Comune>' + msgHelpNoFattura);
   var countryCode = invoiceObj.customer_info.country_code;
   if (!countryCode || countryCode.length <= 0) {
      countryCode = this.getCountryCode(invoiceObj.customer_info.country);
   }
   if (countryCode === 'IT') {
      var nodeProvincia = nodeSede.addElement("Provincia");
      this.addTextNode(nodeProvincia, invoiceObj.customer_info.state, '2', '<CessionarioCommittente><Sede><Provincia>' + msgHelpNoFattura);
   }
   var nodeNazione = nodeSede.addElement("Nazione");
   this.addTextNode(nodeNazione, countryCode, '2', '<CessionarioCommittente><Sede><Nazione>' + msgHelpNoFattura);

   return nodeRoot;
}

/*
 * Ritorna un oggetto json con i dati del cliente o fornitore ripresi dalla tabella conti(indirizzo, saldo, ...)
 * @accountId	conto id presente nella tabella conti
 */
EFattura.prototype.getAccount = function (_accountId) {
   var jsonObj = {};
   if (!_accountId || _accountId.length <= 0)
      return jsonObj;
   if (!this.banDocument)
      return jsonObj;

   var tableAccounts = this.banDocument.table('Accounts');
   if (tableAccounts) {
      var row = tableAccounts.findRowByValue('Account', _accountId);
      if (row) {
         var jsonString = row.toJSON();
         jsonObj = JSON.parse(jsonString);
         for (var key in jsonObj) {
            if (jsonObj[key].length > 0)
               jsonObj[key] = xml_escapeString(jsonObj[key]);
         }
      }
   }
   return jsonObj;
}

EFattura.prototype.getCodiceNatura = function (vatCode) {
   //N1 esclusa ex art. 15 (bollo, spese anticipate in nome e per conto della controparte, omaggi, interessi moratori, ecc.)
   //N2 non soggetta (Fuori campo IVA/Escluso IVA, codice da utilizzare per i contribuenti minimi e forfettari)
   //N3 non imponibile (esportazione, cessione di beni intra UE)
   //N4 esente (esente art. 10 D.P.R. 633/72) 
   //N5 regime del margine / IVA non esposta in fattura ex art. 74-ter
   //N6 inversione contabile (reverse charge)
   //N7 IVA assolta in altro stato UE, vendite a distanza o prestazioni di servizi di telecomunicazioni
   //Il codice natura viene ripreso dalla tabella codici iva colonna Gr1
   //Se presente ESCL, la registrazione viene esclusa
   //Se presente NONE, il codice natura resta vuoto
   var codNatura = '';
   if (vatCode.length <= 0) {
      return codNatura;
   }
   if (this.banDocument.table("VatCodes")) {
      var rowVatCodes = this.banDocument.table("VatCodes").findRowByValue('VatCode', vatCode);
      if (rowVatCodes) {
         var vatGr = rowVatCodes.value("Gr");
         var vatGr1 = rowVatCodes.value("Gr1");
         var vatRate = rowVatCodes.value("VatRate");
         vatGr1 = vatGr1.toUpperCase();
         var rowVatDescription = rowVatCodes.value("Description");
         if (!rowVatDescription)
            rowVatDescription = "";
         rowVatDescription = rowVatDescription.toLowerCase();
         rowVatDescription = rowVatDescription.replace(" ", "");
         if (vatGr1.length > 0 && vatGr1.startsWith("N")) {
            codNatura = vatGr1;
         }
         else if (vatGr1 == "ESCL") {
            codNatura = vatGr1;
         }
         else if (vatGr1 == "NONE") {
            codNatura = '';
         }
         else if (rowVatDescription.indexOf("art.15") > 0) {
            codNatura = 'N1';
         }
         else if (rowVatDescription.indexOf("art.3") > 0) {
            codNatura = 'N1';
         }
         else if (vatGr.indexOf("-FC") >= 0) {
            codNatura = 'N2.1';
         }
         else if (rowVatDescription.indexOf("art.7") > 0) {
            codNatura = 'N3.1';
         }
         else if (vatGr.startsWith("V-NI") || vatGr.startsWith("A-NI")) {
            codNatura = 'N3.1';
         }
         else if (vatGr.startsWith("V-ES") || vatGr.startsWith("A-ES")) {
            codNatura = 'N4';
         }
         else if (rowVatDescription.indexOf("art.74") > 0) {
            codNatura = 'N5';
         }
         else if (vatGr.startsWith("V-NE") || vatGr.startsWith("A-NE")) {
            codNatura = 'N5';
         }
         else if (vatGr.indexOf("-REV") >= 0 && Banana.SDecimal.isZero(vatRate)) {
            codNatura = 'N6.1';
         }
      }
   }
   return codNatura;
}

EFattura.prototype.getCountryCode = function (countryName) {
   var countryCode = 'it';
   if (!countryName || countryName.length <= 0)
      return countryCode.toUpperCase();
   countryCode = countryName.toLowerCase();
   if (countryCode == 'italy' || countryCode == 'italia') {
      countryCode = 'it';
   }
   if (countryCode == 'germany' || countryCode == 'germania' || countryCode == 'deutschland') {
      countryCode = 'de';
   }
   if (countryCode == 'france' || countryCode == 'francia') {
      countryCode = 'fr';
   }
   if (countryCode == 'switzerland' || countryCode == 'schweiz' || countryCode == 'suisse' || countryCode == 'svizzera') {
      countryCode = 'ch';
   }
   if (countryCode == 'japan' || countryCode == 'jpn') {
      countryCode = 'jp';
   }
   return countryCode.toUpperCase();
}

/*riprende il numero conto cliente dalla stringa utilizzata dal dialogo dello script*/
EFattura.prototype.getCustomerId = function (customerDescription) {
   var customerId = customerDescription;
   if (customerId.length <= 0)
      return customerId;

   var posStart = 0;
   var posEnd = customerId.indexOf("   ");
   if (posEnd <= posStart)
      return customerId;

   customerId = customerId.substring(posStart, posEnd).trim();

   return customerId;
}

/*ritorna l'elenco dei conti clienti*/
EFattura.prototype.getCustomerList = function () {
   var customersList = [];

   if (!this.journalInvoices) {
      this.journalInvoices = this.banDocument.invoicesCustomers();
   }

   /*tiene solamente i clienti che hanno delle fatture*/
   var customerIdList = [];
   for (var i = 0; i < this.journalInvoices.rowCount; i++) {
      var tRow = this.journalInvoices.row(i);
      if (tRow.value('ObjectType') === 'InvoiceDocument' && tRow.value('CounterpartyId').length > 0) {
         var customerId = tRow.value('CounterpartyId').toString();
         if (customerIdList.indexOf(customerId) < 0) {
            customerIdList.push(customerId);
         }
      }
   }

   for (var i = 0; i < this.journalInvoices.rowCount; i++) {
      var tRow = this.journalInvoices.row(i);
      if (tRow.value('ObjectType') === 'Counterparty' && tRow.value('CounterpartyId').length > 0) {
         var customerId = tRow.value('CounterpartyId').toString();
         if (customerIdList.indexOf(customerId) < 0)
            continue;
         var jsonData = JSON.parse(tRow.value('ObjectJSonData'));
         if (jsonData && jsonData.Counterparty && jsonData.Counterparty.customer_info) {
            if (jsonData.Counterparty.customer_info.business_name)
               customerId += "   " + jsonData.Counterparty.customer_info.business_name;
            else if (jsonData.Counterparty.customer_info.last_name)
               customerId += "   " + jsonData.Counterparty.customer_info.last_name + " " + jsonData.Counterparty.customer_info.first_name;
         }
         customersList.push(customerId);
      }
   }

   return customersList;
}

EFattura.prototype.getErrorMessage = function (errorId) {
   //Document language
   var lang = 'en';
   if (this.banDocument)
      lang = this.banDocument.locale;
   if (lang.length > 2)
      lang = lang.substr(0, 2);
   var rtnMsg = '';
   if (errorId == this.ID_ERR_ACCOUNTING_TYPE_NOTVALID) {
      if (lang == 'it')
         rtnMsg = "Il tipo di contabilità non è valido. Manca la tabella Conti";
      else
         rtnMsg = "The file is not valid. The table Accounts is missing";
   }
   else if (errorId == this.ID_ERR_INVOICENUMBER_MISSING) {
      if (lang == 'it')
         rtnMsg = "Indicare il numero fattura";
      else
         rtnMsg = "Please indicate the invoice number";
   }
   else if (errorId == this.ID_ERR_LICENSE_NOTVALID) {
      if (lang == 'it')
         rtnMsg = "Questa estensione richiede Banana Contabilità+ Advanced";
      else
         rtnMsg = "This extension requires Banana Accounting+ Advanced";
   }
   else if (errorId == this.ID_ERR_NOINVOICE) {
      if (lang == 'it')
         rtnMsg = "Nessuna fattura trovata. Controllare se i conti appartengono al gruppo clienti e il periodo impostato è corretto";
      else
         rtnMsg = "No invoice found. Please check if accounts belong to customer's group and if the period is correct";
   }
   else if (errorId == this.ID_ERR_TABLE_ADDRESS_MISSING) {
      if (lang == 'it')
         rtnMsg = "Le colonne indirizzi nella tabella Conti sono mancanti. Aggiornare con il comando Strumenti - Aggiungi nuove funzionalità";
      else
         rtnMsg = "Address columns of table Accounts are missing. Please update table Accounts with the command Toos - Add new functionalities";
   }
   else if (errorId == this.ID_ERR_TABLE_ADDRESS_NOT_UPDATED) {
      if (lang == 'it')
         rtnMsg = "Le colonne indirizzi nella tabella Conti sono di una versione non compatibile. Aggiornare con il comando Strumenti - Converti in nuovo file";
      else
         rtnMsg = "Address columns are outdated. Please update them with the command Tools - Convert to new file";
   }
   else if (errorId == this.ID_ERR_VERSION) {
      if (lang == 'it')
         rtnMsg = "Metodo %1 non supportato. Aggiornare Banana alla versione più recente";
      else
         rtnMsg = "The function %1 is not supported. Please install the latest version of Banana Accounting";
   }
   else if (errorId == this.ID_ERR_VERSION_NOTSUPPORTED) {
      if (lang == 'it')
         rtnMsg = "Lo script non funziona con la vostra attuale versione di Banana Contabilità.\nVersione minimina richiesta: %1.\nPer aggiornare o per maggiori informazioni cliccare su Aiuto";
      else
         rtnMsg = "This script does not run with your current version of Banana Accounting.\nMinimum version required: %1.\nTo update or for more information click on Help";
   }
   else if (errorId == this.ID_ERR_XML_FILE_NONVALIDO) {
      if (lang == 'it')
         rtnMsg = "Errore nella validazione della fattura numero %1.\n%2";
      else
         rtnMsg = "Error validating invoice number %1.\n%2";
   }
   else if (errorId == this.ID_ERR_XML_FILE_VALIDO) {
      if (lang == 'it')
         rtnMsg = "Validazione fattura numero %1 eseguita con successo";
      else
         rtnMsg = "Validation of invoice number %1 was successful";
   }
   else if (errorId == this.ID_ERR_XML_FORMATO_NONVALIDO) {
      if (lang == 'it')
         rtnMsg = "Formato trasmissione non valido";
      else
         rtnMsg = "Not valid transmission format";
   }
   else if (errorId == this.ID_ERR_XML_LUNGHEZZA_NONVALIDA) {
      if (lang == 'it')
         rtnMsg = "Lunghezza campo non valida: %1, valore inserito: %2, lunghezza richiesta: %3";
      else
         rtnMsg = "Invalid element size. Node: %1, current value: %2, required size: %3";
   }
   else if (errorId == this.ID_ERR_XML_LUNGHEZZAMIN_NONVALIDA) {
      if (lang == 'it')
         rtnMsg = "Lunghezza campo non valida: %1, valore inserito: %2, lunghezza minima: %3";
      else
         rtnMsg = "Invalid element size. Node: %1, current value: %2, minimum size: %3";
   }
   else if (errorId == this.ID_ERR_XML_LUNGHEZZAMAX_NONVALIDA) {
      if (lang == 'it')
         rtnMsg = "Lunghezza campo non valida: %1, valore inserito: %2, lunghezza massima: %3";
      else
         rtnMsg = "Invalid element size. Node: %1, current value: %2, maximum size: %3";
   }
   else if (errorId == this.ID_ERR_DOCTYPE_NOTVALID) {
      if (lang == 'it')
         rtnMsg = "Il campo TipoDocumento %1 non è valido. Verificare il valore inserito o forzarlo utilizzando il campo IT_TipoDoc_FatturaElettronica";
      else
         rtnMsg = "Document type %1 not valid. Please check the value or force it by using the field IT_TipoDoc_FatturaElettronica";
   }
   else if (errorId == this.ID_ERR_NATURA_NOTVALID) {
      if (lang == 'it')
         rtnMsg = "Il campo Natura %1 non è valido. Verificare il valore inserito nella tabella Codici IVA in corrispondenza della colonna Gr1";
      else
         rtnMsg = "The value of the field Natura %1 is not valid. Please check the column Gr1 of the table VatCodes";
   }

   return rtnMsg + " [" + errorId + "] ";
}

EFattura.prototype.getProgressiveNumber = function () {
   var numeroInvio = 0;
   if (this.param.xml && this.param.xml.progressive)
      numeroInvio = parseInt(this.param.xml.progressive);

   //base-36 [0-9a-z]
   numeroInvio = numeroInvio.toString(36).toUpperCase();

   var stringaNumeroInvio = '';
   for (var i = 5; i > numeroInvio.length; i--)
      stringaNumeroInvio += '0'
   stringaNumeroInvio += numeroInvio;
   return stringaNumeroInvio;
}

EFattura.prototype.getXsdFileName = function () {
   
   var xsdFileName = "";
   if (this.banDocument && this.param && this.param.xml.xsd_filename.length) {
      xsdFileName = xml_escapeString(this.param.xml.xsd_filename);
   }

   if (!xsdFileName.length) {
      Banana.console.info("Impossible to open Schema file for validation");
      return xsdFileName;
   }

   //se il nome del file xsd non contiene il percorso, aggiunge il percorso dove è salvato il file contabile
   if (xsdFileName.indexOf("/") < 0) {
      var filePath = this.banDocument.info("Base", "FileName");
      var pos = filePath.lastIndexOf("/");
      if (filePath.length - 1 == pos)
         pos = filePath.lastIndexOf("/", filePath.length - 1);
      filePath = filePath.substr(0, pos + 1);
      xsdFileName = filePath + xsdFileName;
   }

   var xsdFile = Banana.IO.getLocalFile(xsdFileName);
   if (xsdFile && xsdFile.errorString) {
      Banana.console.info(xsdFile.errorString);
      return "";
   }

   return xsdFileName;
}

EFattura.prototype.initNamespaces = function () {
   this.namespaces = [
      {
         'namespace': 'http://www.w3.org/2001/XMLSchema-instance',
         'prefix': 'xmlns:xsi'
      },
      {
         'namespace': 'http://www.w3.org/2000/09/xmldsig#',
         'prefix': 'xmlns:ds'
      },
      {
         'namespace': 'http://ivaservizi.agenziaentrate.gov.it/docs/xsd/fatture/v1.2',
         'prefix': 'xmlns:p'
      },
   ];
}

EFattura.prototype.initParam = function () {
   this.param = {};

   /*filter*/
   this.param.selection = false;
   this.param.selection_invoice = '';
   this.param.selection_customer = '';

   /*period*/
   this.param.period = false;
   this.param.periodStartDate = '';
   this.param.periodEndDate = '';

   /* dati contribuente */
   this.param.contribuente = {};
   this.param.contribuente.tipoContribuente = 'persona fisica';
   this.param.contribuente.codiceFiscale = '';
   this.param.contribuente.partitaIva = '';
   this.param.contribuente.societa = '';
   this.param.contribuente.cognome = '';
   this.param.contribuente.nome = '';
   this.param.contribuente.indirizzo = '';
   this.param.contribuente.ncivico = '';
   this.param.contribuente.cap = '';
   this.param.contribuente.comune = '';
   this.param.contribuente.provincia = '';
   this.param.contribuente.nazione = 'IT';
   this.param.contribuente.tipoRegimeFiscale = 0;

   /* xml file */
   this.param.xml = {};
   this.param.xml.progressive = '1';
   this.param.xml.destination_folder = '';
   this.param.xml.open_file = false;
   this.param.xml.validate_file = false;
   this.param.xml.xslt_filename = '';
   this.param.xml.xsd_filename = 'Schema_del_file_xml_FatturaPA_versione_1.2.1.xsd';
}

EFattura.prototype.initSchemarefs = function () {
   this.schemaRefs = [
      'http://ivaservizi.agenziaentrate.gov.it/docs/xsd/fatture/v1.2 http://www.fatturapa.gov.it/export/fatturazione/sdi/fatturapa/v1.2/Schema_del_file_xml_FatturaPA_versione_1.2.xsd'
   ];
};

EFattura.prototype.isEmpty = function (obj) {
   for (var key in obj) {
      if (obj.hasOwnProperty(key))
         return false;
   }
   return true;
}

EFattura.prototype.loadData = function () {

   if (!this.journalInvoices) {
      this.journalInvoices = this.banDocument.invoicesCustomers();
   }
   /* Per invoice & Estimate 
       let invoicesTable = Banana.document.table("Invoices");
       for (let i = 0; i < invoicesTable.rowCount; i++) {
        let row = invoicesTable.row(i);
        if (!row.isEmpty) {
            try {
                let invoiceFieldObj = JSON.parse(row.value("InvoiceData"));
                let invoiceObj = JSON.parse(invoiceFieldObj.invoice_json);
   */

   var isPeriodSelected = this.param.period;
   var startDate = new Date();
   if (this.param.periodStartDate.length > 0)
      startDate = Banana.Converter.stringToDate(this.param.periodStartDate, "YYYYMMDD");
   var endDate = new Date();
   if (this.param.periodEndDate.length > 0)
      endDate = Banana.Converter.stringToDate(this.param.periodEndDate, "YYYYMMDD");
   if (this.param.periodStartDate.length <= 0 && this.param.periodEndDate.length <= 0)
      isPeriodSelected = false;

   var isFilterSelected = this.param.selection;
   var invoiceIdList = [];
   var customerIdList = [];
   if (this.param.selection_invoice.length > 0) {
      var tmpList = this.param.selection_invoice.split(";");
      for (var i in tmpList) {
         if (tmpList[i].trim().length > 0)
            invoiceIdList.push(tmpList[i].trim());
      }
   }
   if (this.param.selection_customer.length > 0) {
      var tmpList = this.param.selection_customer.split(";");
      for (var i in tmpList) {
         if (tmpList[i].trim().length > 0)
            customerIdList.push(tmpList[i].trim());
      }
   }
   if (invoiceIdList.length < 0 && customerIdList.length < 0)
      isFilterSelected = false;

   var jsonInvoiceList = [];
   // var rows = this.journalInvoices.findRows(this.loadDataFilterInvoiceDocument);
   for (var i = 0; i < this.journalInvoices.rowCount; i++) {
      if (this.journalInvoices.row(i).value("ObjectType") !== "InvoiceDocument")
        continue;
      if (isFilterSelected && invoiceIdList.length > 0) {
         var invoiceId = this.journalInvoices.row(i).value("Invoice");
         if (invoiceIdList.indexOf(invoiceId) < 0)
            continue;
      }
      if (isFilterSelected && customerIdList.length > 0) {
         var customerId = this.journalInvoices.row(i).value("CounterpartyId");
         if (customerIdList.indexOf(customerId) < 0)
            continue;
      }
      if (isPeriodSelected) {
         var valueDate = Banana.Converter.stringToDate(this.journalInvoices.row(i).value("TransactionDate"), "YYYY-MM-DD");
         if (!valueDate)
            valueDate = Banana.Converter.stringToDate(this.journalInvoices.row(i).value("Date"), "YYYY-MM-DD");
         if (valueDate < startDate || valueDate > endDate) {
            continue;
         }
      }
      var jsonData = JSON.parse(this.journalInvoices.row(i).value("ObjectJSonData"));
      jsonInvoiceList.push(jsonData.InvoiceDocument);
   }

   if (jsonInvoiceList.length <= 0) {
      var msg = this.getErrorMessage(this.ID_ERR_NOINVOICE);
      this.addMessage(msg, this.ID_ERR_NOINVOICE);
   }

   //raggruppa per cliente perché il file xml può contenere un solo cliente
   //se ci sono più clienti verranno creati più files xml
   var jsonCustomerList = {};
   for (var i = 0; i < jsonInvoiceList.length; i++) {
      var jsonInvoice = jsonInvoiceList[i];
      if (jsonInvoice.customer_info) {
         var accountId = jsonInvoice.customer_info.number;
         if (!jsonCustomerList[accountId])
            jsonCustomerList[accountId] = [];
         jsonCustomerList[accountId].push(jsonInvoice);
      }
   }

   return jsonCustomerList;
}

EFattura.prototype.loadDataFilterInvoiceDocument = function(rowObj,rowNr,table) {
   return rowObj.value('ObjectType') === "InvoiceDocument";
}

EFattura.prototype.readAccountingData = function (param) {
   if (!param || !this.banDocument)
      return;
   //Table FileInfo
   param.fileInfo = {};
   param.fileInfo["BasicCurrency"] = "";
   param.fileInfo["OpeningDate"] = "";
   param.fileInfo["ClosureDate"] = "";
   param.fileInfo["CustomersGroup"] = "";
   param.fileInfo["SuppliersGroup"] = "";
   param.fileInfo["Address"] = {};
   param.fileInfo["Address"]["Company"] = "";
   param.fileInfo["Address"]["Courtesy"] = "";
   param.fileInfo["Address"]["Name"] = "";
   param.fileInfo["Address"]["FamilyName"] = "";
   param.fileInfo["Address"]["Address1"] = "";
   param.fileInfo["Address"]["Address2"] = "";
   param.fileInfo["Address"]["Zip"] = "";
   param.fileInfo["Address"]["City"] = "";
   param.fileInfo["Address"]["State"] = "";
   param.fileInfo["Address"]["Country"] = "";
   param.fileInfo["Address"]["Web"] = "";
   param.fileInfo["Address"]["Email"] = "";
   param.fileInfo["Address"]["Phone"] = "";
   param.fileInfo["Address"]["Mobile"] = "";
   param.fileInfo["Address"]["Fax"] = "";
   param.fileInfo["Address"]["FiscalNumber"] = "";
   param.fileInfo["Address"]["VatNumber"] = "";

   if (this.banDocument.info) {
      param.fileInfo["BasicCurrency"] = this.banDocument.info("AccountingDataBase", "BasicCurrency");
      param.fileInfo["OpeningDate"] = this.banDocument.info("AccountingDataBase", "OpeningDate");
      param.fileInfo["ClosureDate"] = this.banDocument.info("AccountingDataBase", "ClosureDate");
      if (this.banDocument.info("AccountingDataBase", "CustomersGroup"))
         param.fileInfo["CustomersGroup"] = this.banDocument.info("AccountingDataBase", "CustomersGroup");
      if (this.banDocument.info("AccountingDataBase", "SuppliersGroup"))
         param.fileInfo["SuppliersGroup"] = this.banDocument.info("AccountingDataBase", "SuppliersGroup");
      param.fileInfo["Address"]["Company"] = this.banDocument.info("AccountingDataBase", "Company");
      param.fileInfo["Address"]["Courtesy"] = this.banDocument.info("AccountingDataBase", "Courtesy");
      param.fileInfo["Address"]["Name"] = this.banDocument.info("AccountingDataBase", "Name");
      param.fileInfo["Address"]["FamilyName"] = this.banDocument.info("AccountingDataBase", "FamilyName");
      param.fileInfo["Address"]["Address1"] = this.banDocument.info("AccountingDataBase", "Address1");
      param.fileInfo["Address"]["Address2"] = this.banDocument.info("AccountingDataBase", "Address2");
      param.fileInfo["Address"]["Zip"] = this.banDocument.info("AccountingDataBase", "Zip");
      param.fileInfo["Address"]["City"] = this.banDocument.info("AccountingDataBase", "City");
      param.fileInfo["Address"]["State"] = this.banDocument.info("AccountingDataBase", "State");
      param.fileInfo["Address"]["Country"] = this.banDocument.info("AccountingDataBase", "Country");
      param.fileInfo["Address"]["Web"] = this.banDocument.info("AccountingDataBase", "Web");
      param.fileInfo["Address"]["Email"] = this.banDocument.info("AccountingDataBase", "Email");
      param.fileInfo["Address"]["Phone"] = this.banDocument.info("AccountingDataBase", "Phone");
      param.fileInfo["Address"]["Mobile"] = this.banDocument.info("AccountingDataBase", "Mobile");
      param.fileInfo["Address"]["Fax"] = this.banDocument.info("AccountingDataBase", "Fax");
      param.fileInfo["Address"]["FiscalNumber"] = this.banDocument.info("AccountingDataBase", "FiscalNumber");
      param.fileInfo["Address"]["VatNumber"] = this.banDocument.info("AccountingDataBase", "VatNumber");
   }

   param.accountingOpeningDate = '';
   param.accountingClosureDate = '';
   if (param.fileInfo["OpeningDate"])
      param.accountingOpeningDate = param.fileInfo["OpeningDate"];
   if (param.fileInfo["ClosureDate"])
      param.accountingClosureDate = param.fileInfo["ClosureDate"];

   param.openingYear = '';
   param.closureYear = '';
   if (param.accountingOpeningDate.length >= 10)
      param.openingYear = param.accountingOpeningDate.substring(0, 4);
   if (param.accountingClosureDate.length >= 10)
      param.closureYear = param.accountingClosureDate.substring(0, 4);

   return param;
}

EFattura.prototype.readNoFattura = function (xmlSource) {
   let noFattura = '';
   let xml = Banana.Xml.parse(xmlSource);
   if (!xml)
      return noFattura;
   let xmlRoot = xml.firstChildElement();
   if (!xmlRoot)
      return noFattura;
   let invoiceNode = xmlRoot.firstChildElement('FatturaElettronicaBody');
   if (invoiceNode) {
      let datiGeneraliDocumento = invoiceNode.firstChildElement('DatiGenerali').firstChildElement('DatiGeneraliDocumento');
      if (datiGeneraliDocumento)
         noFattura = datiGeneraliDocumento.firstChildElement('Numero').text;
   }
   return noFattura;
}

EFattura.prototype.saveFile = function (output, fileExtension) {
   //nomenclatura nome file
   //Codice PaeseIdentificativo univoco del Trasmittente  _  Progressivo univoco del file
   var nazione = this.param.contribuente.nazione;
   var codiceFiscale = this.param.contribuente.codiceFiscale;

   var fileName = nazione + codiceFiscale + "_";
   fileName += this.getProgressiveNumber();
   // Names the file to 'test.xml', easier to reload each time on browser, for testing purposes
   //fileName = 'test';

   // estensione xml o hmtl
   fileName += "." + fileExtension;

   if (this.param.xml.destination_folder.length > 0) {
      var destination_folder = this.param.xml.destination_folder;
      var lastIndex = destination_folder.lastIndexOf("/");
      if (lastIndex === -1 || lastIndex < destination_folder.length - 1)
         destination_folder += "/";
      fileName = destination_folder + fileName;
   }

   fileName = Banana.IO.getSaveFileName("Save as", fileName, fileExtension.toUpperCase() + " file (*." + fileExtension + ");;All files (*)");
   if (fileName.length) {
      var file = Banana.IO.getLocalFile(fileName);
      file.codecName = "UTF-8";
      file.write(output);
      if (file.errorString) {
         Banana.Ui.showInformation("Write error", file.errorString);
         return false;
      }
      else {
         if (this.param.xml.open_file)
            Banana.IO.openUrl(fileName);
         this.param.xml.progressive++;
         this.banDocument.setScriptSettings("efatturaXMLItalia", JSON.stringify(this.param))
         return true;
      }
   }
   return false;
}

EFattura.prototype.setParam = function (param) {
   this.param = param;
   this.verifyParam();
}

EFattura.prototype.verifyBananaVersion = function () {
   if (!this.banDocument)
      return false;

   //Banana+ is required
   var requiredVersion = "10.0.9";
   if (Banana.compareVersion && Banana.compareVersion(Banana.application.version, requiredVersion) < 0) {
      var msg = this.getErrorMessage(this.ID_ERR_VERSION_NOTSUPPORTED);
      msg = msg.replace("%1", requiredVersion);
      this.banDocument.addMessage(msg, this.ID_ERR_VERSION_NOTSUPPORTED);
      return false;
   }
   /*if (!Banana.application.isExperimental) {
   var msg = "The Experimental version is required";
   this.banDocument.addMessage(msg, "ID_ERR_EXPERIMENTAL_REQUIRED");
   return false;
   }*/
   if (!Banana.application.license || Banana.application.license.licenseType !== "advanced") {
      var msg = this.getErrorMessage(this.ID_ERR_LICENSE_NOTVALID);
      this.banDocument.addMessage(msg, this.ID_ERR_LICENSE_NOTVALID);
      return false;
   }

   //controlla se gli indirizzi sono stati impostati
   if (this.banDocument.table('Accounts')) {
      var tColumnNames = this.banDocument.table('Accounts').columnNames.join(";");
      if (tColumnNames.indexOf('Town') > 0 || tColumnNames.indexOf('Company') > 0) {
         //The address columns are not updated
         var msg = this.getErrorMessage(this.ID_ERR_TABLE_ADDRESS_NOT_UPDATED);
         this.addMessage(msg, this.ID_ERR_TABLE_ADDRESS_NOT_UPDATED);
         return false;
      }
      else if (tColumnNames.indexOf('OrganisationName') <= 0) {
         var msg = this.getErrorMessage(this.ID_ERR_TABLE_ADDRESS_MISSING);
         this.addMessage(msg, this.ID_ERR_TABLE_ADDRESS_MISSING);
         return false;
      }
   }
   else {
      var msg = this.getErrorMessage(this.ID_ERR_ACCOUNTING_TYPE_NOTVALID);
      this.addMessage(msg, this.ID_ERR_ACCOUNTING_TYPE_NOTVALID);
      return false;
   }
   return true;
}

EFattura.prototype.verifyParam = function () {
   if (!this.param)
      this.param = {};

   if (!this.param.selection)
      this.param.selection = false;
   if (!this.param.selection_invoice)
      this.param.selection_invoice = '';
   if (!this.param.selection_customer)
      this.param.selection_customer = '';

   if (!this.param.period)
      this.param.period = false;
   if (!this.param.periodStartDate)
      this.param.periodStartDate = '';
   if (!this.param.periodEndDate)
      this.param.periodEndDate = '';
   if (!this.param.period) {
      this.param.periodStartDate = '';
      this.param.periodEndDate = '';
   }
   if (!this.param.contribuente)
      this.param.contribuente = {};
   if (!this.param.contribuente.tipoContribuente)
      this.param.contribuente.tipoContribuente = 'persona fisica';
   if (!this.param.contribuente.codiceFiscale)
      this.param.contribuente.codiceFiscale = '';
   if (!this.param.contribuente.partitaIva)
      this.param.contribuente.partitaIva = '';
   if (!this.param.contribuente.societa)
      this.param.contribuente.societa = '';
   if (!this.param.contribuente.cognome)
      this.param.contribuente.cognome = '';
   if (!this.param.contribuente.nome)
      this.param.contribuente.nome = '';
   if (!this.param.contribuente.indirizzo)
      this.param.contribuente.indirizzo = '';
   if (!this.param.contribuente.ncivico)
      this.param.contribuente.ncivico = '';
   if (!this.param.contribuente.cap)
      this.param.contribuente.cap = '';
   if (!this.param.contribuente.comune)
      this.param.contribuente.comune = '';
   if (!this.param.contribuente.provincia)
      this.param.contribuente.provincia = '';
   if (!this.param.contribuente.nazione)
      this.param.contribuente.nazione = 'IT';
   if (!this.param.contribuente.tipoRegimeFiscale)
      this.param.contribuente.tipoRegimeFiscale = 0;

   if (!this.param.xml)
      this.param.xml = {};
   if (!this.param.xml.progressive)
      this.param.xml.progressive = '1';
   if (!this.param.xml.destination_folder)
      this.param.xml.destination_folder = '';
   if (!this.param.xml.open_file)
      this.param.xml.open_file = false;
   if (!this.param.xml.validate_file)
      this.param.xml.validate_file = false;
   if (!this.param.xml.xslt_filename)
      this.param.xml.xslt_filename = '';
   if (!this.param.xml.xsd_filename)
      this.param.xml.xsd_filename = '';

}