// Copyright [2019] [Banana.ch SA - Lugano Switzerland]
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
// @api = 1.0
// @id = ch.banana.script.italy_vat_2017.report.fatture.js
// @description = Comunicazione dati fatture (spesometro)...
// @doctype = 100.110;110.110;130.110;100.130
// @encoding = utf-8
// @includejs = ch.banana.script.italy_vat_2017.errors.js
// @includejs = ch.banana.script.italy_vat_2017.journal.js
// @includejs = ch.banana.script.italy_vat_2017.xml.js
// @includejs = ch.banana.script.italy_vat.daticontribuente.js
// @inputdatasource = none
// @pubdate = 2019-01-15
// @publisher = Banana.ch SA
// @task = app.command
// @timeout = -1

var debug = false;

function exec(inData, options) {

  if (!Banana.document)
    return "@Cancel";

  // Check version
  if (typeof (Banana.document.journalCustomersSuppliers) === 'undefined') {
    var msg = getErrorMessage(ID_ERR_VERSIONE);
    msg = msg.replace("%1", "Banana.document.journalCustomersSuppliers" );
    Banana.document.addMessage( msg, ID_ERR_VERSIONE);
    return "@Cancel";
  }
  if (typeof (Banana.IO) === 'undefined') {
    var msg = getErrorMessage(ID_ERR_VERSIONE);
    msg = msg.replace("%1", "Banana.IO" );
    Banana.document.addMessage( msg, ID_ERR_VERSIONE);
    return "@Cancel";
  }
  if (Banana.document.table('Accounts')) {
    var tColumnNames = Banana.document.table('Accounts').columnNames.join(";");
    if (tColumnNames.indexOf('Town')>0 || tColumnNames.indexOf('Company')>0) {
      //E necessario convertire il file con una tabella Conti/Indirizzi più recente
      var msg = getErrorMessage(ID_ERR_TABELLA_INDIRIZZI_NONCOMPATIBILE);
      Banana.document.addMessage( msg, ID_ERR_TABELLA_INDIRIZZI_NONCOMPATIBILE);
      return "@Cancel";
    }
    else if (tColumnNames.indexOf('OrganisationName')<=0) {
      var msg = getErrorMessage(ID_ERR_TABELLA_INDIRIZZI_MANCANTE);
      Banana.document.addMessage( msg, ID_ERR_TABELLA_INDIRIZZI_MANCANTE);
      return "@Cancel";
    }
  }

  var param = {};
  if (inData.length>0) {
    param = JSON.parse(inData);
  }
  else if (options && options.useLastSettings) {
    param = JSON.parse(Banana.document.getScriptSettings());
  }
  else {
    if (!settingsDialog())
      return "@Cancel";
    param = JSON.parse(Banana.document.getScriptSettings());
  }

  var datiFatture = new DatiFatture(Banana.document);
  datiFatture.setParam(param);
  datiFatture.loadData();
  if (datiFatture.param.outputScript==3) {
    //xml file di annullamento
    var output = datiFatture.createInstanceAnnullamento();
    output = formatXml(output);
    datiFatture.saveData(output);
    return;
  }

  var output = datiFatture.createInstance();
  
  if (datiFatture.param.outputScript==0 && output != "@Cancel") {
    var report = Banana.Report.newReport("Dati delle fatture emesse e ricevute");
    var stylesheet = Banana.Report.newStyleSheet(); 
    datiFatture.printDocument(report, stylesheet);
    if (debug) {
      var journal = new Journal(this.banDocument);
      journal.load();
      report.addPageBreak();
      journal._debugPrintJournal(report, stylesheet);
      report.addPageBreak();
      journal._debugPrintCustomersSuppliers(report, stylesheet);
    }
    Banana.Report.preview(report, stylesheet);
  }
  else if (datiFatture.param.outputScript==1 && output != "@Cancel") {
    //xml file
    output = formatXml(output);
    datiFatture.saveData(output);
    return;
  }

  //return xml content
  return output;
}

/*
 * Update script's parameters
*/
function settingsDialog() {

  var datiFatture = new DatiFatture(Banana.document);
  var savedParam = Banana.document.getScriptSettings();
  if (savedParam.length > 0) {
    datiFatture.setParam(JSON.parse(savedParam));
  }
  
  var accountingData = {};
  accountingData = new Utils(Banana.document).readAccountingData(accountingData);
  if (datiFatture.param.annoSelezionato.length<=0)
    datiFatture.param.annoSelezionato = accountingData.openingYear;
  
  var dialog = Banana.Ui.createUi("ch.banana.script.italy_vat_2017.report.fatture.dialog.ui");
  //Groupbox periodo
  var index = 0;
  if (datiFatture.param.periodoSelezionato == 'm')
    index = parseInt(datiFatture.param.periodoValoreMese);
  else if (datiFatture.param.periodoSelezionato == 'q')
    index = parseInt(datiFatture.param.periodoValoreTrimestre) + 13;
  else if (datiFatture.param.periodoSelezionato == 's')
    index = parseInt(datiFatture.param.periodoValoreSemestre) + 18;
  else if (datiFatture.param.periodoSelezionato == 'y')
    index = 21;
  dialog.periodoGroupBox.periodoComboBox.currentIndex = index;
  //Groupbox anni
  var elencoAnni = [];
  elencoAnni.push(accountingData.openingYear);
  if (accountingData.openingYear != accountingData.closureYear)
    elencoAnni.push(accountingData.closureYear);
  if (typeof (dialog.periodoGroupBox.annoComboBox.addItems) !== 'undefined') {
    dialog.periodoGroupBox.annoComboBox.addItems(elencoAnni);
  }
  index = 0;
  for (var i in elencoAnni) {
    if (elencoAnni[i].indexOf(datiFatture.param.annoSelezionato)>=0) {
      index = i;
      break;
    }
  }
  dialog.periodoGroupBox.annoComboBox.currentIndex = index;

  var progressivo = parseInt(datiFatture.param.progressivoInvio, 10);
  if (!progressivo)
    progressivo = 1;
  else if (datiFatture.param.outputScript==1 || datiFatture.param.outputScript==3)
    progressivo += 1;
  progressivo = new Utils(this.banDocument).zeroPad(progressivo, 5);
  dialog.datiFatturaHeaderGroupBox.progressivoInvioLineEdit.text = progressivo;
  dialog.datiFatturaHeaderGroupBox.cfDichiaranteLineEdit.text = datiFatture.param.codicefiscaleDichiarante;
  dialog.datiFatturaHeaderGroupBox.codiceCaricaComboBox.currentIndex = parseInt(datiFatture.param.codiceCarica);
  var bloccoId = 0;
  if (datiFatture.param.blocco == "DTR")
    bloccoId = 1;
  dialog.bloccoGroupBox.bloccoComboBox.currentIndex = bloccoId;

  //Groupbox opzioni
  dialog.opzioniGroupBox.esigibilitaIvaCheckBox.checked = datiFatture.param.esigibilitaIva;

  //Groupbox stampa
  if (datiFatture.param.outputScript==1)
    dialog.stampaGroupBox.stampaXmlRadioButton.checked = true;
  else if (datiFatture.param.outputScript==3)
    dialog.stampaGroupBox.annullamentoRadioButton.checked = true;
  else  
    dialog.stampaGroupBox.stampaReportRadioButton.checked = true;
  dialog.stampaGroupBox.idFileLineEdit.text = datiFatture.param.idFile;

  //dialog functions
  dialog.checkdata = function () {
    dialog.accept();
  }
  dialog.enableButtons = function () {
  }
  dialog.showHelp = function () {
    Banana.Ui.showHelp("ch.banana.script.italy_vat_2017.report.fatture.dialog.ui");
  }
  dialog.buttonBox.accepted.connect(dialog, dialog.checkdata);
  dialog.buttonBox.helpRequested.connect(dialog, dialog.showHelp);
  
  Banana.application.progressBar.pause();
  dialog.enableButtons();
  var dlgResult = dialog.exec();
  Banana.application.progressBar.resume();

  if (dlgResult !== 1)
    return false;

  //Salvataggio dati
  //Groupbox periodo
  var index = parseInt(dialog.periodoGroupBox.periodoComboBox.currentIndex.toString());
  if (index < 0 || index == 12 || index == 17 || index == 20)
    index = 0;
  if (index < 12) {
    datiFatture.param.periodoSelezionato = 'm';
    datiFatture.param.periodoValoreMese = index.toString();
  }
  else if (index > 12 && index < 17) {
    datiFatture.param.periodoSelezionato = 'q';
    datiFatture.param.periodoValoreTrimestre = (index-13).toString();
  }
  else if (index > 17 && index < 20) {
    datiFatture.param.periodoSelezionato = 's';
    datiFatture.param.periodoValoreSemestre = (index-18).toString();
  }
  else {
    datiFatture.param.periodoSelezionato = 'y';
  }
  //Groupbox anno
  var index = parseInt(dialog.periodoGroupBox.annoComboBox.currentIndex.toString());
  datiFatture.param.annoSelezionato = dialog.periodoGroupBox.annoComboBox.currentText;

  progressivo = dialog.datiFatturaHeaderGroupBox.progressivoInvioLineEdit.text;
  progressivo = parseInt(progressivo, 10);
  if (!progressivo)
    progressivo = 1;
  datiFatture.param.progressivoInvio = new Utils(this.banDocument).zeroPad(progressivo, 5);
  datiFatture.param.codicefiscaleDichiarante = dialog.datiFatturaHeaderGroupBox.cfDichiaranteLineEdit.text;
  datiFatture.param.codiceCarica = dialog.datiFatturaHeaderGroupBox.codiceCaricaComboBox.currentIndex.toString();
  var bloccoId = dialog.bloccoGroupBox.bloccoComboBox.currentIndex.toString();
  if (bloccoId == 1)
    datiFatture.param.blocco = "DTR";
  else
    datiFatture.param.blocco = "DTE";
  
  //Groupbox opzioni
  datiFatture.param.esigibilitaIva = dialog.opzioniGroupBox.esigibilitaIvaCheckBox.checked;

  //Groupbox stampa
  if (dialog.stampaGroupBox.stampaXmlRadioButton.checked)
    datiFatture.param.outputScript = 1;
  else if (dialog.stampaGroupBox.annullamentoRadioButton.checked)
    datiFatture.param.outputScript = 3;
  else
    datiFatture.param.outputScript = 0;
  datiFatture.param.idFile = dialog.stampaGroupBox.idFileLineEdit.text;

  var paramToString = JSON.stringify(datiFatture.param);
  Banana.document.setScriptSettings(paramToString);
  return true;
}

function DatiFatture(banDocument) {
  this.banDocument = banDocument;
  if (this.banDocument === undefined)
    this.banDocument = Banana.document;
  this.initParam();
}

DatiFatture.prototype.addPageHeader = function(report, stylesheet) {
  // Page header
  var pageHeader = report.getHeader();
  
  //Tabella
  var table = pageHeader.addTable("header_table");
  table.addColumn("header_col_left");
  table.addColumn("header_col_center");
  table.addColumn("header_col_right");
  
  //cell_left
  var row = table.addRow();
  var cell_left = row.addCell("", "header_cell_left");

  var line1 = this.param.datiContribuente.societa;
  if (line1.length)
    line1 += " ";
  if (this.param.datiContribuente.cognome.length)
    line1 += this.param.datiContribuente.cognome;
  if (this.param.datiContribuente.nome.length)
    line1 += this.param.datiContribuente.nome;
  if (line1.length)
    cell_left.addParagraph(line1);
  
  var line2 = '';
  if (this.param.datiContribuente.indirizzo.length)
    line2 = this.param.datiContribuente.indirizzo + " ";
  if (this.param.datiContribuente.ncivico.length)
    line2 += " " + this.param.datiContribuente.ncivico;
  if (line2.length)
    cell_left.addParagraph(line2);

  var line3 = '';
  if (this.param.datiContribuente.cap.length)
    line3 = this.param.datiContribuente.cap + " ";
  if (this.param.datiContribuente.comune.length)
    line3 += this.param.datiContribuente.comune + " ";
  if (this.param.datiContribuente.provincia.length)
    line3 += "(" +  this.param.datiContribuente.provincia + ")";
  if (line3.length)
    cell_left.addParagraph(line3);
  
  var line4 = '';
  if (this.param.datiContribuente.partitaIva.length)
    line4 = "P.IVA: " + this.param.datiContribuente.partitaIva;
  if (line4.length)
    cell_left.addParagraph(line4, "vatNumber");
  
  //cell_center
  var cell_center = row.addCell("", "header_cell_center");
  var periodo = Banana.Converter.toLocaleDateFormat(this.param.data.startDate);
  periodo +=" - " + Banana.Converter.toLocaleDateFormat(this.param.data.endDate);
  periodo += " blocco " + this.param.blocco;
  cell_center.addParagraph("Comunicazione dati fatture", "title center");
  cell_center.addParagraph(periodo, "period center");

  //cell_right
  var cell_right = row.addCell("", "header_cell_right");
  var pDate = cell_right.addParagraph(Banana.Converter.toLocaleDateFormat(new Date()), "right");
  pDate.excludeFromTest();
  cell_right.addParagraph(" Pagina ", "right").addFieldPageNr();
 
  //add style
  stylesheet.addStyle(".header_table", "margin-top:1em;width:100%;");
  stylesheet.addStyle(".header_col_left", "width:33%");
  stylesheet.addStyle(".header_col_center", "flexible-width:always");
  stylesheet.addStyle(".header_col_right", "width:33%");
  stylesheet.addStyle(".header_cell_left", "font-size:8px");
  stylesheet.addStyle(".header_cell_center", "font-size:8px");
  stylesheet.addStyle(".header_cell_right", "font-size:8px");
  stylesheet.addStyle(".center", "text-align: center;");
  stylesheet.addStyle(".period", "padding-bottom: 1em;");
  stylesheet.addStyle(".right", "text-align: right;");
}

/*
* metodo principale che genera il file xml
*/
DatiFatture.prototype.createInstance = function() {
  //<DatiFatturaHeader>
  var xbrlDatiFatturaHeader = this.createInstanceDatiFatturaHeader();

  var xbrlContent = '';
  if (this.param.blocco == "DTE")
    xbrlContent = this.createInstanceDTE();
  else if (this.param.blocco == "DTR")
    xbrlContent = this.createInstanceDTR();

  //<DatiFattura> root element
  xbrlContent = xbrlDatiFatturaHeader + xbrlContent;
  var attrsNamespaces = {};
  attrsNamespaces["versione"] = "DAT20";
  for (var j in this.param.namespaces) {
    var prefix = this.param.namespaces[j]['prefix'];
    var namespace = this.param.namespaces[j]['namespace'];
    if (prefix.length > 0)
      attrsNamespaces[prefix] = namespace;
  }
  for (var j in this.param.schemaRefs) {
    var schema = this.param.schemaRefs[j];
    if (schema.length > 0) {
      if (!attrsNamespaces["xsi:schemaLocation"])
        attrsNamespaces["xsi:schemaLocation"] = "";
      else if (attrsNamespaces["xsi:schemaLocation"].length>0)
        attrsNamespaces["xsi:schemaLocation"] += " ";
      attrsNamespaces["xsi:schemaLocation"] = attrsNamespaces["xsi:schemaLocation"] + schema;
    }
  }
  xbrlContent = xml_createElement("ns2:DatiFattura", xbrlContent, attrsNamespaces);

  //Output
  var results = [];
  results.push("<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>");
  results.push(xbrlContent);
  return results.join ('');

}

/*
* Dati relativi a fatture  EMESSE. Da valorizzare per trasmettere i dati delle fatture emesse.
* Non devono essere riportati in questo blocco i dati delle così dette autofatture, cioè fatture 
* emesse dall'acquirente nei casi in cui non le abbia ricevute oppure, pur avendole ricevute, 
* abbia rilevato in esse delle irregolarità. Tali dati devono essere riportati come dati delle fatture ricevute.
* Se questo blocco è valorizzato, non dovranno essere valorizzati i blocchi 3 <DTR> e 4 <ANN>
* Occorrenze: <0.1>
*/
DatiFatture.prototype.createInstanceDTE = function() {
  var xbrlContent = this.createInstanceBlocco1();
  
  for (var i in this.param.data.customers) {
    var customerObj = this.param.data.customers[i];
    if (customerObj)
      xbrlContent += this.createInstanceBlocco2(customerObj);
  }
  var xbrlDTE =  xml_createElement( "DTE", xbrlContent);
  return xbrlDTE;
}

DatiFatture.prototype.createInstanceDTR = function() {
  var xbrlContent = this.createInstanceBlocco1();
  
  for (var i in this.param.data.suppliers) {
    var supplierObj = this.param.data.suppliers[i];
    if (supplierObj)
      xbrlContent += this.createInstanceBlocco2(supplierObj);
  }
  var xbrlDTR =  xml_createElement("DTR", xbrlContent);
  return xbrlDTR;
}

/*
* Blocco 2.1 <CedentePrestatoreDTE> e 3.1 <CessionarioCommittenteDTR>
* Occorrenze: <1.1>
*/
DatiFatture.prototype.createInstanceBlocco1 = function() {
  var tag = ''
  if (this.param.blocco == 'DTE')
    tag = 'CedentePrestatoreDTE';
  else if (this.param.blocco == 'DTR')
    tag = 'CessionarioCommittenteDTR';

   if (tag.length<=0)
     return;

  var msgContext = '<' + tag + '>';
  
  //2.1.1   <IdentificativiFiscali>
  var xbrlContent = xml_createElementWithValidation("IdPaese", this.param.datiContribuente.nazione,1,'2',msgContext);
  xbrlContent += xml_createElementWithValidation("IdCodice", this.param.datiContribuente.partitaIva,1,'1...28',msgContext);
  xbrlContent = xml_createElementWithValidation("IdFiscaleIVA",xbrlContent,1);
  xbrlContent += xml_createElementWithValidation("CodiceFiscale", this.param.datiContribuente.codiceFiscale,0,'11...16',msgContext);
  xbrlContent =  xml_createElementWithValidation("IdentificativiFiscali",xbrlContent,1);
  
  //2.1.2   <AltriDatiIdentificativi>
  var xbrlContent2 = '';
  if (this.param.datiContribuente.tipoContribuente == 1) {
    xbrlContent2 = xml_createElementWithValidation("Denominazione", xml_escapeString(this.param.datiContribuente.societa),0,'1...80',msgContext);
  }
  else {
    xbrlContent2 = xml_createElementWithValidation("Nome", xml_escapeString(this.param.datiContribuente.nome),0,'1...60',msgContext);
    xbrlContent2 += xml_createElementWithValidation("Cognome", xml_escapeString(this.param.datiContribuente.cognome),0,'1...60',msgContext);
  }
  var xbrlContent3 = xml_createElementWithValidation("Indirizzo", xml_escapeString(this.param.datiContribuente.indirizzo),1,'1...60',msgContext);
  xbrlContent3 += xml_createElementWithValidation("NumeroCivico", xml_escapeString(this.param.datiContribuente.ncivico),0,'1...8',msgContext);
  xbrlContent3 += xml_createElementWithValidation("CAP", xml_escapeString(this.param.datiContribuente.cap),1,'5',msgContext);
  xbrlContent3 += xml_createElementWithValidation("Comune", xml_escapeString(this.param.datiContribuente.comune),1,'1...60',msgContext);
  xbrlContent3 += xml_createElementWithValidation("Provincia", this.param.datiContribuente.provincia,0,'2',msgContext);
  xbrlContent3 += xml_createElementWithValidation("Nazione", this.param.datiContribuente.nazione,1,'2',msgContext);
  xbrlContent2 += xml_createElementWithValidation("Sede", xbrlContent3,1);
  xbrlContent +=  xml_createElementWithValidation("AltriDatiIdentificativi",xbrlContent2,1);

  xbrlContent =  xml_createElementWithValidation(tag,xbrlContent,1);
  return xbrlContent;
}

/*
* Blocco contenente le informazioni relative al cessionario/committente (cliente) e ai dati fattura a lui riferiti.
* Può essere replicato per trasmettere dati di fatture relative a clienti diversi
* Occorrenze: <1.1000>
*/
/*
* Blocco 2.2 <CessionarioCommittenteDTE> e 3.2 <CedentePrestatoreDTR>
* Occorrenze: <1.1000>
*/
DatiFatture.prototype.createInstanceBlocco2 = function(accountObj) {
  var tag = ''
  if (this.param.blocco == 'DTE')
    tag = 'CessionarioCommittenteDTE';
  else if (this.param.blocco == 'DTR')
    tag = 'CedentePrestatoreDTR';

   if (tag.length<=0)
     return;

  var msgContext = '<' + tag + '> ' + accountObj["Account"] + ' ' + accountObj["Description"];
  var xbrlCessionarioCommittente = '';
  if (accountObj) {
    //2.2.1   <IdentificativiFiscali>
    var xbrlIdentificativiFiscali = '';
    //IDFiscaleIVA viene scritto solamente se c'è la partita iva
    var countryCode = new Utils(this.banDocument).getCountryCode(accountObj);
    if (accountObj["VatNumber"].length>0) {
      xbrlIdentificativiFiscali = xml_createElementWithValidation("IdPaese", countryCode,0,'2',msgContext);
      xbrlIdentificativiFiscali += xml_createElementWithValidation("IdCodice", accountObj["VatNumber"],0,'1...28',msgContext);
      xbrlIdentificativiFiscali = xml_createElementWithValidation("IdFiscaleIVA",xbrlIdentificativiFiscali,0);
    }
    xbrlIdentificativiFiscali += xml_createElementWithValidation("CodiceFiscale", accountObj["FiscalNumber"],0,'11...16',msgContext);
    xbrlCessionarioCommittente =  xml_createElementWithValidation("IdentificativiFiscali",xbrlIdentificativiFiscali,0);

    //Se non è presente la partita IVA (facoltativa) il codice fiscale è obbligatorio
    if (accountObj["VatNumber"].length<=0 && accountObj["FiscalNumber"].length<=0) {
      if (countryCode == "IT") {
        var msg = getErrorMessage(ID_ERR_DATIFATTURE_MANCA_CODICEFISCALE);
        msg = msg.replace("%1", msgContext );
        this.banDocument.addMessage( msg, ID_ERR_DATIFATTURE_MANCA_CODICEFISCALE);
      }
      else {
        //Per l'estero se non si conosce la partita IVA è necessario sostituirla con 11 nove: 99999999999
        var msg = getErrorMessage(ID_ERR_DATIFATTURE_MANCA_PARTITAIVA);
        msg = msg.replace("%1", msgContext );
        this.banDocument.addMessage( msg, ID_ERR_DATIFATTURE_MANCA_PARTITAIVA);
      }
    }

    //2.2.2   <AltriDatiIdentificativi>
    var xbrlAltriDati = '';
    if (accountObj["OrganisationName"] && accountObj["OrganisationName"].length) {
      xbrlAltriDati = xml_createElementWithValidation("Denominazione", accountObj["OrganisationName"],0,'1...80',msgContext);
    }
    else if (!accountObj["FirstName"] || accountObj["FirstName"].length<=0) {
      xbrlAltriDati = xml_createElementWithValidation("Denominazione", accountObj["FamilyName"],0,'1...80',msgContext);
    }
    else {
      xbrlAltriDati = xml_createElementWithValidation("Nome", accountObj["FirstName"],0,'1...60',msgContext);
      xbrlAltriDati += xml_createElementWithValidation("Cognome", accountObj["FamilyName"],0,'1...60',msgContext);
    }

    var address = accountObj["Street"];
    if (accountObj["AddressExtra"] && accountObj["AddressExtra"].length > 0) {
      if (address.length > 0)
        address += ' ';
      address += accountObj["AddressExtra"];
    }

    var xbrSede = xml_createElementWithValidation("Indirizzo", address,1,'1...60',msgContext);
    if (countryCode == "IT" || (accountObj["PostalCode"] && accountObj["PostalCode"].length==5))
      xbrSede += xml_createElementWithValidation("CAP", accountObj["PostalCode"],0,'5',msgContext);
    xbrSede += xml_createElementWithValidation("Comune", accountObj["Locality"],1,'1...60',msgContext);
    if (countryCode == "IT")
      xbrSede += xml_createElementWithValidation("Provincia", accountObj["Region"],0,'2',msgContext);
    xbrSede += xml_createElementWithValidation("Nazione", countryCode,1,'2',msgContext);
    xbrlAltriDati += xml_createElementWithValidation("Sede", xbrSede,1);
    xbrlCessionarioCommittente +=  xml_createElementWithValidation("AltriDatiIdentificativi", xbrlAltriDati,1);

    /*
    * Blocco obbligatorio. Può essere replicato per trasmettere dati di più fatture relative allo stesso cliente
    */
    //2.2.3 <DatiFatturaBodyDTE> o 3.2.3 <DatiFatturaBodyDTR>
    var xbrlDatiFatturaBody = '';
    var prevNoDoc = '';
    var prevDataDoc = '';
    for (var i in accountObj.transactions) {
      if (accountObj.transactions[i]) {
        msgContext = '[' + accountObj.transactions[i]["JTableOrigin"] + ': Riga ' + (parseInt(accountObj.transactions[i]["JRowOrigin"])+1).toString() +'] <DatiFatturaBody' + this.param.blocco + '>';
        var noDoc = accountObj.transactions[i]["IT_NoDoc"];
        var dataDoc =  accountObj.transactions[i]["IT_DataDoc"];
        if (prevNoDoc == noDoc && prevDataDoc == dataDoc) {
          continue;
        }
        //2.2.3.1  <DatiGenerali>
        var xbrlDatiGenerali = xml_createElementWithValidation("TipoDocumento", accountObj.transactions[i]["IT_TipoDoc"],1,'4',msgContext);
        xbrlDatiGenerali += xml_createElementWithValidation("Data", dataDoc,1,'10',msgContext);
        xbrlDatiGenerali += xml_createElementWithValidation("Numero", noDoc,1,'1...20',msgContext);
        if (this.param.blocco == 'DTR')
          xbrlDatiGenerali += xml_createElementWithValidation("DataRegistrazione", accountObj.transactions[i]["JDate"],1,'10',msgContext);
        var xbrlContent = xml_createElementWithValidation("DatiGenerali", xbrlDatiGenerali,1);
        //2.2.3.1  <DatiRiepilogo>
        var xbrlDatiRiepilogo = this.createInstanceBlocco2DatiRiepilogo(noDoc, dataDoc, accountObj.transactions);
        xbrlContent += xbrlDatiRiepilogo;
        xbrlDatiFatturaBody +=  xml_createElementWithValidation("DatiFatturaBody" + this.param.blocco, xbrlContent,1);
        prevNoDoc = noDoc;
        prevDataDoc = dataDoc;
      }
    }
    if (xbrlDatiFatturaBody.length>0) {
      xbrlCessionarioCommittente += xbrlDatiFatturaBody;
    }
  }
  var xbrlContent =  xml_createElement(tag, xbrlCessionarioCommittente);
  return xbrlContent;
}

/*
* Blocco 2.2.3.1  <DatiRiepilogo>
* Occorrenze: <1.1000>
* Per ogni aliquota iva contenuta nella fattura è necessario creare un tag <DatiRiepilogo>
* <DatiFatturaBodyDTE><DatiGenerali></DatiGenerali><DatiRiepilogo></DatiRiepilogo><DatiRiepilogo></DatiRiepilogo></DatiFatturaBodyDTE>
*/
DatiFatture.prototype.createInstanceBlocco2DatiRiepilogo = function(noDoc, dataDoc, rows) {
  var output = '';
  if (noDoc.length<=0 && dataDoc.length<=0)
    return output;
  for (var i in rows) {
    if (rows[i]) {
      var currentNoDoc = rows[i]["IT_NoDoc"];
      var currentDataDoc = rows[i]["IT_DataDoc"];
      if (currentNoDoc != noDoc || currentDataDoc != dataDoc )
        continue;
      var msgContext = '[' + rows[i]["JTableOrigin"] + ': Riga ' + (parseInt(rows[i]["JRowOrigin"])+1).toString() +'] <DatiRiepilogo> Documento No ' + noDoc;
      var itImponibile = rows[i]["IT_Imponibile"];
      //le note di credito sempre in positivo
      if (!Banana.SDecimal.isZero(itImponibile) && rows[i]["IT_TipoDoc"] == 'TD04')
        itImponibile = Banana.SDecimal.abs(itImponibile);
      var itImportoIva = rows[i]["IT_ImportoIva"];
      if (!Banana.SDecimal.isZero(itImportoIva) && rows[i]["IT_TipoDoc"] == 'TD04')
        itImportoIva = Banana.SDecimal.abs(itImportoIva);
      var xbrlDatiRiepilogo = xml_createElementWithValidation("ImponibileImporto", itImponibile,1,'4...15',msgContext);
      var xbrlDatiIVA = xml_createElementWithValidation("Imposta", itImportoIva,0,'4...15',msgContext);
      xbrlDatiIVA += xml_createElementWithValidation("Aliquota", rows[i]["IT_Aliquota"],0,'4...6',msgContext);
      xbrlDatiRiepilogo += xml_createElementWithValidation("DatiIVA",xbrlDatiIVA,1);
      if (rows[i]["IT_Natura"].length)
        xbrlDatiRiepilogo += xml_createElementWithValidation("Natura", rows[i]["IT_Natura"],0,'2...5');
      if (rows[i]["IT_Detraibile"].length)
        xbrlDatiRiepilogo += xml_createElementWithValidation("Detraibile", rows[i]["IT_Detraibile"],0,'4...6');
      if (rows[i]["IT_Deducibile"].length)
        xbrlDatiRiepilogo += xml_createElementWithValidation("Deducibile",rows[i]["IT_Deducibile"],0,'2');
      if (rows[i]["IT_EsigibilitaIva"].length && this.param.esigibilitaIva)
        xbrlDatiRiepilogo += xml_createElementWithValidation("EsigibilitaIVA",rows[i]["IT_EsigibilitaIva"],0,'1');
      output += xml_createElementWithValidation("DatiRiepilogo", xbrlDatiRiepilogo,1);
    }
  }
  return output;
}

/*
* Blocco da valorizzare solo se si intende identificare con un progressivo il file che si sta trasmettendo.
* L'elemento 1.3 <IdSistema> non va mai valorizzato in quanto riservato al sistema
* Occorrenze: <0.1>
*/
DatiFatture.prototype.createInstanceDatiFatturaHeader = function() {
  var msgContext = '<DatiFatturaHeader>';
  
  var xbrlProgressivo = '';
  if (this.param.progressivoInvio.length>0)
    xbrlProgressivo = xml_createElementWithValidation("ProgressivoInvio",xml_escapeString(this.param.progressivoInvio),0,'1...10', msgContext);
  
  var xbrlCFDichiarante = '';
  if (this.param.codicefiscaleDichiarante.length>0)
    xbrlCFDichiarante = xml_createElementWithValidation("CodiceFiscale", xml_escapeString(this.param.codicefiscaleDichiarante), 0, '11...16', msgContext);

  var xbrlCodiceCaricaDichiarante = '';
  if (parseInt(this.param.codiceCarica)>0)
    xbrlCodiceCaricaDichiarante = xml_createElementWithValidation("Carica", this.param.codiceCarica, 0, '1...2', msgContext);

  var xbrlDichiarante = '';
  if (xbrlCFDichiarante.length > 0 || xbrlCodiceCaricaDichiarante.length > 0) {
    xbrlDichiarante =  xml_createElement("Dichiarante", xbrlCFDichiarante + xbrlCodiceCaricaDichiarante);
  }

  var xbrlContent = xbrlProgressivo + xbrlDichiarante;
  var xbrlHeader =  xml_createElement("DatiFatturaHeader", xbrlContent);
  return xbrlHeader;
}

/*
* metodo che genera il file xml di annullamento
*/
DatiFatture.prototype.createInstanceAnnullamento = function() {
  //<DatiFatturaHeader>
  var xbrlContent = this.createInstanceDatiFatturaHeader();

  //<DatiFattura> root element
  var attrsNamespaces = {};
  attrsNamespaces["versione"] = "DAT20";
  for (var j in this.param.namespaces) {
    var prefix = this.param.namespaces[j]['prefix'];
    var namespace = this.param.namespaces[j]['namespace'];
    if (prefix.length > 0)
      attrsNamespaces[prefix] = namespace;
  }
  for (var j in this.param.schemaRefs) {
    var schema = this.param.schemaRefs[j];
    if (schema.length > 0) {
      if (!attrsNamespaces["xsi:schemaLocation"])
        attrsNamespaces["xsi:schemaLocation"] = "";
      else if (attrsNamespaces["xsi:schemaLocation"].length>0)
        attrsNamespaces["xsi:schemaLocation"] += " ";
      attrsNamespaces["xsi:schemaLocation"] = attrsNamespaces["xsi:schemaLocation"] + schema;
    }
  }
  
  //IdFile annullamento
  //Controlla se è vuoto
  if (!this.param.idFile || this.param.idFile.length<=0) {
    var msg = getErrorMessage(ID_ERR_DATIFATTURE_MANCA_IDFILE);
    this.banDocument.addMessage( msg, ID_ERR_DATIFATTURE_MANCA_IDFILE);
  }

  var xbrlIdFile = xml_createElement('IdFile', this.param.idFile);
  xbrlContent += xml_createElement('ANN', xbrlIdFile);
  
  //Chiusura
  xbrlContent = xml_createElement("ns2:DatiFattura", xbrlContent, attrsNamespaces);

  //Output
  var results = [];
  results.push("<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>");
  results.push(xbrlContent);
  return results.join ('');
}

DatiFatture.prototype.initParam = function() {
  this.param = {};
  
  this.param.codicefiscaleDichiarante = '';
  this.param.codiceCarica = '';
  this.param.blocco = 'DTE';
  this.param.progressivoInvio = '';
  this.param.esigibilitaIva = false;
  this.param.idFile = '';
  
  this.param.annoSelezionato = '';
  this.param.periodoSelezionato = 'm';
  this.param.periodoValoreMese = '';
  this.param.periodoValoreTrimestre = '';
  this.param.periodoValoreSemestre = '';

  /*
  0 = create print preview report
  1 = create file xml 
  2 = return xml string 
  3 = create file xml annullamento */
  this.param.outputScript = 0;
  
  this.param.schemaRefs = this.initSchemarefs();
  this.param.namespaces = this.initNamespaces();
}

DatiFatture.prototype.initNamespaces = function() {
  var ns = [
    {
      'namespace' : 'http://ivaservizi.agenziaentrate.gov.it/docs/xsd/fatture/v2.0',
      'prefix' : 'xmlns:ns2'
    },
  ];
  return ns;
}

DatiFatture.prototype.initSchemarefs = function() {
  var schemaRefs = [
    //'http://banana.ch schema_v1.xsd',
    //'http://banana.ch schema_v2.xsd'
  ];
  return schemaRefs;
};

/*
* controlla se la riga può essere stampata nello spesometro
* ad esempio righe con codice ESCL vengono escluse oppure scontrini fiscali
*/
DatiFatture.prototype.isValidRow = function(row) {
  //Per la comunicazione DTE (Dati fatture emesse tiene solamente le righe del registro Vendite e
  //Fatture corrispettivi, scontrini esclusi)
  //Per la comunicazine DTR (Dati fatture ricevute tiene solamente le righe del registro Acquisti)
  //In questo modo vengono escluse le autofatture
  
  var corrispettiviNormali = '';
  var corrispettiviScontrini = '';
  var ricevuteFiscali = '';
  if (this.param.datiContribuente && this.param.datiContribuente.contoCorrispettiviNormali)
    corrispettiviNormali = this.param.datiContribuente.contoCorrispettiviNormali;
  if (this.param.datiContribuente && this.param.datiContribuente.contoCorrispettiviScontrini)
    corrispettiviScontrini = this.param.datiContribuente.contoCorrispettiviScontrini;
  if (this.param.datiContribuente && this.param.datiContribuente.contoRicevuteFiscali)
    ricevuteFiscali = this.param.datiContribuente.contoRicevuteFiscali;

  if (this.param.blocco == 'DTE') {
    if (row["IT_Registro"]=="Acquisti")
      return false;
    else if (row["VatExtraInfo"]=="ESCL" || row["IT_Natura"]=="ESCL")
      return false;
    else if (corrispettiviNormali.length>0 && row["VatTwinAccount"]==corrispettiviNormali)
      return false;
    else if (corrispettiviScontrini.length>0 && row["VatTwinAccount"]==corrispettiviScontrini)
      return false;
    else if (ricevuteFiscali.length>0 && row["VatTwinAccount"]==ricevuteFiscali)
      return false;
    return true;
  }
  else if (this.param.blocco == 'DTR') {
    if (row["IT_Registro"]=="Vendite" || row["IT_Registro"]=="Corrispettivi")
      return false;
    else if (row["VatExtraInfo"]=="ESCL" || row["IT_Natura"]=="ESCL")
      return false;
    return true;
  }
  return false;
}

DatiFatture.prototype.loadData = function() {
  var progressBar = Banana.application.progressBar;
  progressBar.start(4);

  //per il momento c'è un unico periodo non controlla il tipo di versamento mensile o trimestrale
  var utils = new Utils(this.banDocument);
  this.param = utils.readAccountingData(this.param);
  this.param.datiContribuente = new DatiContribuente(this.banDocument).readParam();
  this.param.datiContribuente.liqTipoVersamento = -1;
  if (!progressBar.step())
     return;
  if (typeof(progressBar.setText) !== 'undefined')
    progressBar.setText("Giornale");
  var journal = new Journal(this.banDocument);
  journal.load();
  this.param.data = {};  
  if (!progressBar.step())
     return;
  if (typeof(progressBar.setText) !== 'undefined')
    progressBar.setText("Periodi");
  var periods = utils.createPeriods(this.param);
  if (periods.length>0)
    this.param.data = journal.getPeriod(periods[0].startDate, periods[0].endDate); 

  if (!progressBar.step())
    return;
  if (this.param.blocco == 'DTE') {
    //avvisa se il gruppo clienti non è impostato
    if (this.param.fileInfo["CustomersGroup"].length<=0) {
      var msg = getErrorMessage(ID_ERR_GRUPPO_CLIENTI_MANCANTE);
      this.banDocument.addMessage( msg, ID_ERR_GRUPPO_CLIENTI_MANCANTE);
    }
    var checkedCustomers = {};
    progressBar.start(this.param.data.customers.length);
    if (typeof(progressBar.setText) !== 'undefined')
      progressBar.setText("DTE");
    for (var i in this.param.data.customers) {
      var checkedRows = [];
      var accountObj = this.param.data.customers[i];
      if (accountObj && accountObj.transactions) {
        progressBar.start(accountObj.transactions.length + 1);
        for (var j=0; j<accountObj.transactions.length;j++) {
          if (!progressBar.step())
            return;
          var isValid = this.isValidRow(accountObj.transactions[j]);
          if (!isValid)
            continue;
          checkedRows.push(accountObj.transactions[j]);
        }
        progressBar.finish();
      }
      if (checkedRows.length>0) {
        accountObj.transactions = checkedRows;
        checkedCustomers[i] = accountObj;
      }
    }
    progressBar.finish();
    this.param.data.customers = checkedCustomers;

  }  else if (this.param.blocco == 'DTR') {
    //avvisa se il gruppo fornitori non è impostato
    if (this.param.fileInfo["SuppliersGroup"].length<=0) {
      var msg = getErrorMessage(ID_ERR_GRUPPO_FORNITORI_MANCANTE);
      this.banDocument.addMessage( msg, ID_ERR_GRUPPO_FORNITORI_MANCANTE);
    }
    var checkedSuppliers = {};
    progressBar.start(this.param.data.suppliers.length);
    if (typeof(progressBar.setText) !== 'undefined')
      progressBar.setText("DTR");
    for (var i in this.param.data.suppliers) {
      var checkedRows = [];
      var accountObj = this.param.data.suppliers[i];
      progressBar.start(accountObj.transactions.length + 1);
      for (var j in accountObj.transactions) {
        if (!progressBar.step())
          return;
        var isValid = this.isValidRow(accountObj.transactions[j]);
        if (!isValid)
          continue;
        checkedRows.push(accountObj.transactions[j]);
      }
      progressBar.finish();
      if (checkedRows.length>0) {
        accountObj.transactions = checkedRows;
        checkedSuppliers[i] = accountObj;
      }
      if (!progressBar.step())
        return;
    }
    progressBar.finish();
    this.param.data.suppliers = checkedSuppliers;
  }
  progressBar.finish();
}

DatiFatture.prototype.printDocument = function(report, stylesheet) {
  this.addPageHeader(report, stylesheet);
  this.setStyle(report, stylesheet);
  this.printVatReport(report, stylesheet);
  this.printVatCodesTotal(report, stylesheet);
  this.printExcludedRows(report, stylesheet);
}

/*
 * stampa tabella di controllo, visualizzando tutte le registrazioni con iva escluse
* ad esempio per registrazioni composte nelle quali il cliente/fornitore non appare nella prima riga 
*/
DatiFatture.prototype.printExcludedRows = function(report, stylesheet) {
  //Visualizza solamente se ci sono righe escluse per il registro corrente
  var registroCorrente = 'Vendite|Corrispettivi';
  if (this.param.blocco == 'DTR')
    registroCorrente = 'Acquisti';

  var found=false;
  for (var i=0; i < this.param.data.transactions.length;i++) {
    var jsonObj = this.param.data.transactions[i];
    var registrazioneValida = jsonObj['IT_RegistrazioneValida'];
    var registro = jsonObj['IT_Registro'];
    var isValid = this.isValidRow(jsonObj);
    if ((!registrazioneValida || registrazioneValida.length<=0 || !isValid) && registroCorrente.indexOf(registro)>=0) {
      found = true;
      break;
    }
  }
  if (!found)
    return;

  //Colonne da visualizzare del giornale
  var sortedColumns = [];
  sortedColumns.push(1016); //IT_DataDoc
  sortedColumns.push(1015); //IT_NoDoc
  sortedColumns.push(9); //Description
  sortedColumns.push(11); //VatCode
  sortedColumns.push(1001); //IT_Lordo
  sortedColumns.push(1002); //IT_ImportoIva
  sortedColumns.push(1004); //IT_Imponibile
  sortedColumns.push(1018); //IT_ClienteConto
  sortedColumns.push(1013); //IT_Registro
  sortedColumns.push(29); //JRowOrigin
  sortedColumns.push(31); //JTableOrigin

  //Title
  var table = report.addTable("tableJournal");
  for (var i =0; i<sortedColumns.length;i++) {
    table.addColumn("tableJournal_col" + i.toString());
  }
  
  //Header
  var headerRow = table.getHeader().addRow();
  headerRow.addCell("TABELLA DI CONTROLLO, REGISTRAZIONI ESCLUSE DALLA COMUNICAZIONE (" + new Utils(this.banDocument).getPeriodText(this.param.data) + ")", "title",  sortedColumns.length);
  var headerRow = table.getHeader().addRow();
  for (var i in sortedColumns) {
    var index = sortedColumns[i];
    //console.log("COLUMNS: " + JSON.stringify(this.param.data));
    for (var j in this.param.data.columns) {
      if (this.param.data.columns[j].index === index) {
        var columnTitle = this.param.data.columns[j].title;
        /*if (columnTitle.length>8)
          columnTitle = columnTitle.substring(0, 7) + ".";*/
        headerRow.addCell(columnTitle);
        break;
      }
    }
  }

  // Print data
  // Stampa solamente le registrazioni non valide IT_RegistrazioneValida = ''
  var tot1=0;
  var tot2=0;
  var tot3=0;
  var row = table.addRow();
  for (var i=0; i < this.param.data.transactions.length;i++) {
    var jsonObj = this.param.data.transactions[i];
    var registrazioneValida = jsonObj['IT_RegistrazioneValida'];
    var registro = jsonObj['IT_Registro'];
    var isValid = this.isValidRow(jsonObj);
    if ((!registrazioneValida || registrazioneValida.length<=0 || !isValid) && registroCorrente.indexOf(registro)>=0) {
      var row = table.addRow();
      for (var j in sortedColumns) {
        var index = sortedColumns[j];
        for (var k in this.param.data.columns) {
          if (this.param.data.columns[k].index == index) {
            var content = jsonObj[this.param.data.columns[k].name];
            row.addCell(content, this.param.data.columns[k].type);
            break;
          }
        }
      }
      tot1 = Banana.SDecimal.add(jsonObj['IT_Lordo'], tot1);
      tot2 = Banana.SDecimal.add(jsonObj['IT_ImportoIva'], tot2);
      tot3 = Banana.SDecimal.add(jsonObj['IT_Imponibile'], tot3);
    }
  }
  
  //Totale
  row = table.addRow();
  row.addCell("", "total", 4);
  row.addCell(Banana.Converter.toLocaleNumberFormat(tot1), "right total");
  row.addCell(Banana.Converter.toLocaleNumberFormat(tot2), "right total");
  row.addCell(Banana.Converter.toLocaleNumberFormat(tot3), "right total");
  row.addCell("", "", 4);

  //Style
  stylesheet.addStyle(".tableJournal", "width:100%;margin-top:20px;");
  stylesheet.addStyle(".tableJournal td", "border:0.5em solid black;");
  stylesheet.addStyle(".tableJournal td.header", "font-weight:bold;background-color:#dddddd");
  stylesheet.addStyle(".tableJournal td.title", "font-weight:bold;border:0px;background-color:#ffffff;");
  stylesheet.addStyle(".tableJournal_col03", "width:25%;");
  stylesheet.addStyle(".description", "text-align: right;border:0.5em solid black; ");
  stylesheet.addStyle(".total", "font-weight:bold;");

}

/*
 * stampa tabella di controllo, riassunto per codici iva 
*/
DatiFatture.prototype.printVatCodesTotal = function(report, stylesheet) {
  //Data
  if (this.param.data.customers.length<=0 && this.param.data.suppliers.length<=0)
    return;

  var totaliCodice = [];
  if (this.param.blocco == 'DTE') {
    totaliCodice = this.printVatCodesTotalRows(this.param.data.customers);
  }
  else if (this.param.blocco == 'DTR'){
    totaliCodice = this.printVatCodesTotalRows(this.param.data.suppliers);
  }
 
  //Column names
  var tot1=0;
  var tot2=0;
  var tot3=0;
  var columnCount = 7;
  if (this.param.esigibilitaIva)
    columnCount = 8;
  var table = report.addTable("vatcodes_table");
  headerRow = table.getHeader().addRow();
  headerRow.addCell("TOTALI DI PERIODO PER CODICE (" + new Utils(this.banDocument).getPeriodText(this.param.data) + ")", "title", columnCount); 
  headerRow = table.getHeader().addRow();
  headerRow.addCell("Cod.IVA", "header");
  headerRow.addCell("Gr.IVA", "header");
  if (this.param.esigibilitaIva)
    headerRow.addCell("Esigibilità", "header expand");
  headerRow.addCell("Aliquota", "right header");
  headerRow.addCell("Descrizione", "header");
  headerRow.addCell("Imponibile", "right header");
  headerRow.addCell("Imposta", "right header");
  headerRow.addCell("Imposta indetraibile", "right header");

  var sorted_keys = Object.keys(totaliCodice).sort();
  for (var i=0; i<sorted_keys.length;i++) {
    var vatCode = sorted_keys[i];
    row = table.addRow();
    row.addCell(vatCode, "");
    row.addCell(totaliCodice[vatCode].gr, "");
    if (this.param.esigibilitaIva)
      row.addCell(totaliCodice[vatCode].esigibilita, "");
    row.addCell(totaliCodice[vatCode].vatRate, "right");
    row.addCell(totaliCodice[vatCode].vatCodeDes, "expand");
    row.addCell(Banana.Converter.toLocaleNumberFormat(totaliCodice[vatCode].vatTaxable), "right");
    row.addCell(Banana.Converter.toLocaleNumberFormat(totaliCodice[vatCode].vatAmount), "right");
    row.addCell(Banana.Converter.toLocaleNumberFormat(totaliCodice[vatCode].vatNonDed), "right");
    tot1 = Banana.SDecimal.add(totaliCodice[vatCode].vatTaxable, tot1);
    tot2 = Banana.SDecimal.add(totaliCodice[vatCode].vatAmount, tot2);
    tot3 = Banana.SDecimal.add(totaliCodice[vatCode].vatNonDed, tot3);
  }

  //Totale
  row = table.addRow();
  row.addCell("", "", 2);
  if (this.param.esigibilitaIva)
    row.addCell("", "");
  row.addCell("", "");
  row.addCell("Totale", "total");
  row.addCell(Banana.Converter.toLocaleNumberFormat(tot1), "right total");
  row.addCell(Banana.Converter.toLocaleNumberFormat(tot2), "right total");
  row.addCell(Banana.Converter.toLocaleNumberFormat(tot3), "right total");
  
  //Add style
  stylesheet.addStyle(".vatcodes_table", "width:100%;margin-top:20px;");
  stylesheet.addStyle(".vatcodes_table td", "border:0.5em solid black;padding:3px;");
  stylesheet.addStyle(".expand", "width:250px;");
  stylesheet.addStyle(".vatcodes_table td.header", "font-weight:bold;background-color:#dddddd");
  stylesheet.addStyle(".vatcodes_table td.title", "font-weight:bold;border:0px;background-color:#ffffff;");
  stylesheet.addStyle(".vatcodes_table td.total", "font-weight:bold;");
}

DatiFatture.prototype.printVatCodesTotalRows = function(customers) {
  var totaliCodice = [];
  for (var id in customers) {
    for (var index in customers[id].transactions) {
      var vatCode = customers[id].transactions[index].JVatCodeWithoutSign;
      var vatRate = customers[id].transactions[index].IT_Aliquota;
      var esigibilita = customers[id].transactions[index].IT_EsigibilitaIva;
      var vatAmount = customers[id].transactions[index].IT_ImportoIva;
      var vatPosted = customers[id].transactions[index].IT_IvaContabilizzata;
      var vatNonDed = customers[id].transactions[index].VatNonDeductible;
      var vatTaxable = customers[id].transactions[index].IT_Imponibile;
      var vatTaxableDed = customers[id].transactions[index].IT_ImponibileDetraibile;
      var vatTaxableNonDed = customers[id].transactions[index].IT_ImponibileNonDetraibile;
      var vatPercNonDed = customers[id].transactions[index].VatPercentNonDeductible;
      var vatGross = customers[id].transactions[index].IT_Lordo;
      var gr = customers[id].transactions[index].IT_Gr_IVA;

      if (vatCode && vatCode.length>0) {
        if (totaliCodice[vatCode]) {
          totaliCodice[vatCode].vatAmount = Banana.SDecimal.add(totaliCodice[vatCode].vatAmount, vatAmount);
          totaliCodice[vatCode].vatPosted = Banana.SDecimal.add(totaliCodice[vatCode].vatPosted, vatPosted);
          totaliCodice[vatCode].vatNonDed = Banana.SDecimal.add(totaliCodice[vatCode].vatNonDed, vatNonDed);
          totaliCodice[vatCode].vatTaxable = Banana.SDecimal.add(totaliCodice[vatCode].vatTaxable, vatTaxable);
          totaliCodice[vatCode].vatTaxableDed = Banana.SDecimal.add(totaliCodice[vatCode].vatTaxableDed, vatTaxableDed);
          totaliCodice[vatCode].vatTaxableNonDed = Banana.SDecimal.add(totaliCodice[vatCode].vatTaxableNonDed, vatTaxableNonDed);
          totaliCodice[vatCode].vatGross = Banana.SDecimal.add(totaliCodice[vatCode].vatGross, vatGross);
        }
        else {
          totaliCodice[vatCode] = {};
          totaliCodice[vatCode].vatAmount = vatAmount;
          totaliCodice[vatCode].vatPosted = vatPosted;
          totaliCodice[vatCode].vatNonDed = vatNonDed;
          totaliCodice[vatCode].vatTaxable = vatTaxable;
          totaliCodice[vatCode].vatTaxableDed = vatTaxableDed;
          totaliCodice[vatCode].vatTaxableNonDed = vatTaxableNonDed;
          totaliCodice[vatCode].vatPercNonDed = vatPercNonDed;
          totaliCodice[vatCode].vatGross = vatGross;
          totaliCodice[vatCode].vatRate = vatRate;
          totaliCodice[vatCode].esigibilita = esigibilita;
          totaliCodice[vatCode].vatCodeDes = '';
          totaliCodice[vatCode].gr = gr;
          var tableVatCodes = this.banDocument.table("VatCodes");
          if (tableVatCodes) {
            var vatCodeRow = tableVatCodes.findRowByValue("VatCode", vatCode);
            if (vatCodeRow)
              totaliCodice[vatCode].vatCodeDes = vatCodeRow.value("Description");
          }
        }
      }
    }
  }

  return totaliCodice;
}

DatiFatture.prototype.printVatReport = function(report, stylesheet) {
  if (this.param.data.customers.length<=0 && this.param.data.suppliers.length<=0)
    return;

  //Print table
  var table = report.addTable("vatreport_table");
  table.addColumn("vatreport_table_col01");
  table.addColumn("vatreport_table_col02");
  table.addColumn("vatreport_table_col03");
  table.addColumn("vatreport_table_col04");
  table.addColumn("vatreport_table_col05");
  table.addColumn("vatreport_table_col06");
  table.addColumn("vatreport_table_col07");
  table.addColumn("vatreport_table_col08");
  table.addColumn("vatreport_table_col09");
  table.addColumn("vatreport_table_col10");
  table.addColumn("vatreport_table_col11");
  table.addColumn("vatreport_table_col12");
  table.addColumn("vatreport_table_col13");
  table.addColumn("vatreport_table_col14");
  table.addColumn("vatreport_table_col15");
  
  var headerRow = table.getHeader().addRow();

  //Column names
  headerRow = table.getHeader().addRow();
  headerRow.addCell("Soggetto", "", 1);
  headerRow.addCell("Nome", "", 4);
  headerRow.addCell("ID paese", "", 2);
  headerRow.addCell("Partita IVA", "", 2);
  headerRow.addCell("Codice fiscale", "", 6);

  headerRow = table.getHeader().addRow();
  headerRow.addCell("Tipo doc.");
  headerRow.addCell("Data doc.");
  headerRow.addCell("N. doc.");
  headerRow.addCell("Data reg.");
  headerRow.addCell("Descrizione");
  headerRow.addCell("Conto", "center");
  headerRow.addCell("Ctrpart.", "center");
  headerRow.addCell("Cod.IVA", "center");
  headerRow.addCell("Gr.IVA", "center");
  headerRow.addCell("Imponibile", "center");
  headerRow.addCell("Imposta", "center");
  headerRow.addCell("Aliquota", "center");
  headerRow.addCell("Natura", "center");
  headerRow.addCell("Detraibile", "center");
  headerRow.addCell("Deducibile", "center");

  // Print data
  if (this.param.blocco == 'DTE') {
    this.printVatReportRows(this.param.data.customers, table)
  }
  else if (this.param.blocco == 'DTR'){
    this.printVatReportRows(this.param.data.suppliers, table)
  }
  
}

DatiFatture.prototype.printVatReportRows = function(customers_suppliers, table) {
  for (var i in customers_suppliers) {
    var rowType = "cliente";
    if (this.param.blocco == "DTR")
      rowType = "creditore";
    var row = table.addRow();
    row.addCell(rowType, "rowName");
    var cell = row.addCell("","rowName",4);
    var description = '';
    if (customers_suppliers[i]["OrganisationName"] && customers_suppliers[i]["OrganisationName"].length>0) {
      description = customers_suppliers[i]["OrganisationName"];
    }
    else if (!customers_suppliers[i]["FirstName"] || customers_suppliers[i]["FirstName"].length<=0) {
      description = customers_suppliers[i]["FamilyName"];
    }
    else {
      description = customers_suppliers[i]["FirstName"] + " " + customers_suppliers[i]["FamilyName"];
    }
    if (description.length>0)
      cell.addParagraph(xml_unescapeString(description));
    else
      cell.addParagraph(getErrorMessage(ID_ERR_DATIFATTURE_NOMINATIVO_MANCANTE), "error");
    var address = "";
    var content = customers_suppliers[i]["Street"];
    if (content && content.length>0)
      address = xml_unescapeString(content) + " ";
    content = customers_suppliers[i]["AddressExtra"];
    if (content && content.length>0)
      address += xml_unescapeString(content) + " ";
    content = customers_suppliers[i]["POBox"];
    if (content && content.length>0)
      address += xml_unescapeString(content) + " ";
    content = customers_suppliers[i]["PostalCode"];
    if (content && content.length>0)
      address += xml_unescapeString(content) + " ";
    content = customers_suppliers[i]["Locality"];
    if (content && content.length>0)
      address += xml_unescapeString(content) + " ";
    content = customers_suppliers[i]["Region"];
    if (content && content.length>0)
      address += xml_unescapeString(content) + " ";
    content = customers_suppliers[i]["Country"];
    if (content && content.length>0)
      address += xml_unescapeString(content) + " ";
    cell.addParagraph(address);
    var countryCode = new Utils(this.banDocument).getCountryCode(customers_suppliers[i]);
    row.addCell(countryCode,"rowName",2);
    row.addCell(customers_suppliers[i]["VatNumber"],"rowName",2);
    row.addCell(customers_suppliers[i]["FiscalNumber"],"rowName",6);
    for (var j in customers_suppliers[i].transactions) {
      var jsonObj = customers_suppliers[i].transactions[j];
      var row = table.addRow();
      row.addCell(jsonObj["IT_TipoDoc"], "row");
      row.addCell(Banana.Converter.toLocaleDateFormat(jsonObj["IT_DataDoc"]), "row");
      row.addCell(jsonObj["IT_NoDoc"], "row");
      row.addCell(Banana.Converter.toLocaleDateFormat(jsonObj["JDate"]), "row");
      var descrizione = xml_unescapeString(jsonObj["JDescription"]);
      if (descrizione.startsWith("[IVA] ")>0)
        descrizione = descrizione.substr(6, descrizione.length);
      else if (descrizione.startsWith("[VAT/Sales tax] ")>0)
        descrizione = descrizione.substr(16, descrizione.length);
      row.addCell(descrizione, "row");
      row.addCell(jsonObj["JAccount"], "row amount");
      row.addCell(jsonObj["JContraAccount"], "row amount");
      row.addCell(jsonObj["JVatCodeWithoutSign"], "row amount");
      row.addCell(jsonObj["IT_Gr_IVA"], "row amount");
      var value = jsonObj["IT_Imponibile"];
      if (!Banana.SDecimal.isZero(value) && jsonObj["IT_TipoDoc"] == 'TD04')
        value = Banana.SDecimal.abs(value);
      row.addCell(Banana.Converter.toLocaleNumberFormat(value,2,false), "row amount");
      value = jsonObj["IT_ImportoIva"];
      if (!Banana.SDecimal.isZero(value) && jsonObj["IT_TipoDoc"] == 'TD04')
        value = Banana.SDecimal.abs(value);
      row.addCell(Banana.Converter.toLocaleNumberFormat(value,2,false), "row amount");
      row.addCell(Banana.Converter.toLocaleNumberFormat(jsonObj["IT_Aliquota"],2,false), "row amount");
      row.addCell(jsonObj["IT_Natura"], "row amount");
      row.addCell(Banana.Converter.toLocaleNumberFormat(jsonObj["IT_Detraibile"],2,false), "row amount");
      row.addCell(jsonObj["IT_Deducibile"], "row amount");
    }
  }
}

DatiFatture.prototype.saveData = function(output) {
  var codiceFiscale = this.param.datiContribuente.codiceFiscale;
  if (codiceFiscale.length<=0)
    codiceFiscale = "99999999999";
  var fileName = "IT" + codiceFiscale + "_DF_" + this.param.progressivoInvio + ".xml";
  fileName = Banana.IO.getSaveFileName("Save as", fileName, "XML file (*.xml);;All files (*)")
  if (fileName.length) {
    var file = Banana.IO.getLocalFile(fileName)
    file.codecName = "UTF-8";
    file.write(output);
    if (file.errorString) {
      Banana.Ui.showInformation("Write error", file.errorString);
    }
    else {
      //Commentato l'apertura perché molti utenti non hanno associato il file xml ad un'applicazione
      //Banana.IO.openUrl(fileName);
    }
  }
}

DatiFatture.prototype.setParam = function(param) {
  this.param = param;
  this.verifyParam();
}

DatiFatture.prototype.setStyle = function(report, stylesheet) {
  if (!stylesheet) {
    stylesheet = report.newStyleSheet();
  }
  stylesheet.addStyle("@page", "size:landscape;margin:2em;font-size: 8px; ");
  stylesheet.addStyle("phead", "font-weight: bold; margin-bottom: 1em");
  stylesheet.addStyle("thead", "font-weight: bold;background-color:#eeeeee;");
  stylesheet.addStyle("td", "padding:1px;vertical-align:top;");

  stylesheet.addStyle(".amount", "text-align: right;border:0.5em solid black; ");
  stylesheet.addStyle(".center", "text-align: center;");
  stylesheet.addStyle(".error", "color:red;");
  stylesheet.addStyle(".notes", "padding: 2em;font-style:italic;");
  stylesheet.addStyle(".right", "text-align: right;");
  stylesheet.addStyle(".row.amount", "border:0.5em solid black");
  stylesheet.addStyle(".rowName", "font-weight: bold;padding-top:5px;border-top:0.5em solid black");
  stylesheet.addStyle(".warning", "color: red;font-size:8px;");

  /*vatrepor_table*/
  stylesheet.addStyle(".vatreport_table", "margin-top:1em;width:100%;");
  stylesheet.addStyle(".vatreport_table_col05", "width:25%;");

}

DatiFatture.prototype.verifyParam = function() {
  if(!this.param.codicefiscaleDichiarante)
    this.param.codicefiscaleDichiarante = '';
  if(!this.param.codiceCarica)
    this.param.codiceCarica = '';
  if (!this.param.blocco)
    this.param.blocco = 'DTE';
  if(!this.param.progressivoInvio)
    this.param.progressivoInvio = '';
  if (!this.param.esigibilitaIva)
    this.param.esigibilitaIva = false;
  if (!this.param.idFile)
    this.param.idFile = '';

  if (!this.param.annoSelezionato)
    this.param.annoSelezionato = '';
  if (!this.param.periodoSelezionato)
    this.param.periodoSelezionato = 'm';
  if (!this.param.periodoValoreMese)
    this.param.periodoValoreMese = '';
  if (!this.param.periodoValoreTrimestre)
    this.param.periodoValoreTrimestre = '';
  if (!this.param.periodoValoreSemestre)
    this.param.periodoValoreSemestre = '';

  if (!this.param.outputScript)
    this.param.outputScript = 0;

  if (!this.param.schemaRefs)
    this.param.schemaRefs = this.initSchemarefs();
  if (!this.param.namespaces)
    this.param.namespaces = this.initNamespaces();
}
