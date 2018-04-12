// Copyright [2018] [Banana.ch SA - Lugano Switzerland]
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
// @id = ch.banana.script.italy_vat.report.librogiornale.js
// @description = Libro giornale...
// @doctype = 100.110;110.110;130.110;100.130
// @encoding = utf-8
// @includejs = ch.banana.script.italy_vat_2017.errors.js
// @includejs = ch.banana.script.italy_vat_2017.journal.js
// @includejs = ch.banana.script.italy_vat.daticontribuente.js
// @includejs = ch.banana.script.italy_vat_2017.xml.js
// @inputdatasource = none
// @pubdate = 2018-04-05
// @publisher = Banana.ch SA
// @task = app.command
// @timeout = -1

function exec(inData, options) {
  if (!Banana.document)
    return "@Cancel";

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

  var libroGiornale = new LibroGiornale(Banana.document);
  libroGiornale.setParam(param);
  libroGiornale.loadData();
  var report = Banana.Report.newReport("Libro giornale");
  var stylesheet = Banana.Report.newStyleSheet(); 
  libroGiornale.printDocument(report, stylesheet);
  Banana.Report.preview(report, stylesheet);

}

function settingsDialog() {
  var libroGiornale = new LibroGiornale(Banana.document);
  var savedParam = Banana.document.getScriptSettings();
  if (savedParam.length > 0) {
    libroGiornale.setParam(JSON.parse(savedParam));
  }
  
  var accountingData = {};
  accountingData = new Utils(Banana.document).readAccountingData(accountingData);
  libroGiornale.param.annoSelezionato = accountingData.openingYear;
  
  var dialog = Banana.Ui.createUi("ch.banana.script.italy_vat.report.librogiornale.dialog.ui");
  
  //Lettura dati
  //periodo
  if (libroGiornale.param.periodoSelezionato == 'q')
    dialog.periodoGroupBox.trimestreRadioButton.checked = true;
  else if (libroGiornale.param.periodoSelezionato == 'm')
    dialog.periodoGroupBox.meseRadioButton.checked = true;
  else if (libroGiornale.param.periodoSelezionato == 'c')
    dialog.periodoGroupBox.dataRadioButton.checked = true;
  else
    dialog.periodoGroupBox.annoRadioButton.checked = true;
  dialog.periodoGroupBox.annoLabel.text = libroGiornale.param.annoSelezionato;
  if (accountingData.openingYear != accountingData.closureYear)
    dialog.periodoGroupBox.annoLabel.text += "/" + accountingData.closureYear;
  dialog.periodoGroupBox.trimestreComboBox.currentIndex = parseInt(libroGiornale.param.periodoValoreTrimestre);
  dialog.periodoGroupBox.meseComboBox.currentIndex = parseInt(libroGiornale.param.periodoValoreMese);
  var fromDate = libroGiornale.param.periodoDataDal;
  var toDate = libroGiornale.param.periodoDataAl;
  if (!fromDate || !toDate) {
      fromDate = Banana.Converter.stringToDate(accountingData.accountingOpeningDate, "YYYY-MM-DD");
      toDate = Banana.Converter.stringToDate(accountingData.accountingClosureDate, "YYYY-MM-DD");
  }
  fromDate = Banana.Converter.toInternalDateFormat(fromDate, "dd/mm/yyyy");
  toDate = Banana.Converter.toInternalDateFormat(toDate, "dd/mm/yyyy");
  dialog.periodoGroupBox.dalDateEdit.setDate(fromDate);
  dialog.periodoGroupBox.alDateEdit.setDate(toDate);
  
  //opzioni
  var index = 0;
  if (libroGiornale.param.colonnaOrdinamento == 'DataDocumento')
    index = 1;
  dialog.opzioniGroupBox.ordinamentoComboBox.currentIndex = index;
  dialog.opzioniGroupBox.regsitrazioniAperturaCheckBox.checked = libroGiornale.param.aggiungiAperture;
  dialog.opzioniGroupBox.stampaOrizzontaleCheckBox.checked = libroGiornale.param.stampaOrizzontale;
  dialog.opzioniGroupBox.formattaMovStessaRegCheckBox.checked = libroGiornale.param.formattaMovStessaReg;
  var inizioNumerazione = parseInt(libroGiornale.param.inizioNumProgressiva);
  if (inizioNumerazione<=0)
    inizioNumerazione=1;
  dialog.opzioniGroupBox.nProgrSpinBox.value = inizioNumerazione;
  var righePerPagina = parseInt(libroGiornale.param.righePerPagina);
  if (righePerPagina<=0)
    righePerPagina=40;
  dialog.opzioniGroupBox.righePerPaginaSpinBox.value = righePerPagina;

  //Metodi del dialogo
  dialog.checkdata = function () {
    dialog.accept();
  }
  dialog.enableButtons = function () {
    if (dialog.periodoGroupBox.annoRadioButton.checked) {
        dialog.periodoGroupBox.trimestreComboBox.enabled = false;
        dialog.periodoGroupBox.trimestreComboBox.update();
        dialog.periodoGroupBox.meseComboBox.enabled = false;
        dialog.periodoGroupBox.meseComboBox.update();
        dialog.periodoGroupBox.dalDateEdit.enabled = false;
        dialog.periodoGroupBox.dalDateEdit.update();
        dialog.periodoGroupBox.alLabelText.enabled = false;
        dialog.periodoGroupBox.alLabelText.update();
        dialog.periodoGroupBox.alDateEdit.enabled = false;
        dialog.periodoGroupBox.alDateEdit.update();
    }
    else if (dialog.periodoGroupBox.trimestreRadioButton.checked) {
        dialog.periodoGroupBox.trimestreComboBox.enabled = true;
        dialog.periodoGroupBox.trimestreComboBox.update();
        dialog.periodoGroupBox.meseComboBox.enabled = false;
        dialog.periodoGroupBox.meseComboBox.update();
        dialog.periodoGroupBox.dalDateEdit.enabled = false;
        dialog.periodoGroupBox.dalDateEdit.update();
        dialog.periodoGroupBox.alLabelText.enabled = false;
        dialog.periodoGroupBox.alLabelText.update();
        dialog.periodoGroupBox.alDateEdit.enabled = false;
        dialog.periodoGroupBox.alDateEdit.update();
    }
    else if (dialog.periodoGroupBox.meseRadioButton.checked) {
        dialog.periodoGroupBox.trimestreComboBox.enabled = false;
        dialog.periodoGroupBox.trimestreComboBox.update();
        dialog.periodoGroupBox.meseComboBox.enabled = true;
        dialog.periodoGroupBox.meseComboBox.update();
        dialog.periodoGroupBox.dalDateEdit.enabled = false;
        dialog.periodoGroupBox.dalDateEdit.update();
        dialog.periodoGroupBox.alLabelText.enabled = false;
        dialog.periodoGroupBox.alLabelText.update();
        dialog.periodoGroupBox.alDateEdit.enabled = false;
        dialog.periodoGroupBox.alDateEdit.update();
    }
    else if (dialog.periodoGroupBox.dataRadioButton.checked) {
        dialog.periodoGroupBox.trimestreComboBox.enabled = false;
        dialog.periodoGroupBox.trimestreComboBox.update();
        dialog.periodoGroupBox.meseComboBox.enabled = false;
        dialog.periodoGroupBox.meseComboBox.update();
        dialog.periodoGroupBox.dalDateEdit.enabled = true;
        dialog.periodoGroupBox.dalDateEdit.update();
        dialog.periodoGroupBox.alLabelText.enabled = true;
        dialog.periodoGroupBox.alLabelText.update();
        dialog.periodoGroupBox.alDateEdit.enabled = true;
        dialog.periodoGroupBox.alDateEdit.update();
    }
  }
  dialog.showHelp = function () {
    Banana.Ui.showHelp("ch.banana.script.italy_vat_2017");
  }
  dialog.buttonBox.accepted.connect(dialog, dialog.checkdata);
  dialog.buttonBox.helpRequested.connect(dialog, dialog.showHelp);
  dialog.periodoGroupBox.annoRadioButton.clicked.connect(dialog.enableButtons);
  dialog.periodoGroupBox.trimestreRadioButton.clicked.connect(dialog.enableButtons);
  dialog.periodoGroupBox.meseRadioButton.clicked.connect(dialog.enableButtons);
  dialog.periodoGroupBox.dataRadioButton.clicked.connect(dialog.enableButtons);

  //Chiamata del dialogo
  Banana.application.progressBar.pause();
  dialog.enableButtons();
  var dlgResult = dialog.exec();
  Banana.application.progressBar.resume();
  if (dlgResult !== 1)
    return false;

  //Salvataggio dati
  //periodo
  if (dialog.periodoGroupBox.trimestreRadioButton.checked)
    libroGiornale.param.periodoSelezionato = 'q';
  else if (dialog.periodoGroupBox.meseRadioButton.checked)
    libroGiornale.param.periodoSelezionato = 'm';
  else if (dialog.periodoGroupBox.dataRadioButton.checked)
    libroGiornale.param.periodoSelezionato = 'c';
  else
    libroGiornale.param.periodoSelezionato = 'y';
  var index = parseInt(dialog.periodoGroupBox.trimestreComboBox.currentIndex.toString());
  libroGiornale.param.periodoValoreTrimestre = index.toString();
  index = parseInt(dialog.periodoGroupBox.meseComboBox.currentIndex.toString());
  libroGiornale.param.periodoValoreMese = index.toString();
  libroGiornale.param.periodoDataDal = dialog.periodoGroupBox.dalDateEdit.text < 10 ? "0" + dialog.periodoGroupBox.dalDateEdit.text : dialog.periodoGroupBox.dalDateEdit.text;
  libroGiornale.param.periodoDataAl = dialog.periodoGroupBox.alDateEdit.text < 10 ? "0" + dialog.periodoGroupBox.alDateEdit.text : dialog.periodoGroupBox.alDateEdit.text;
  //Reimposta l'anno per contabilità che non iniziano al 1. gennaio
  if (accountingData.openingYear != accountingData.closureYear &&
    (libroGiornale.param.periodoSelezionato == 'q' || libroGiornale.param.periodoSelezionato == 'm')) {
    libroGiornale.param.datiContribuente = {};
    libroGiornale.param.datiContribuente.liqTipoVersamento = -1;
    var periods = new Utils(Banana.document).createPeriods(libroGiornale.param);
    if (periods.length>0) {
      var accountingStartDate = Banana.Converter.toInternalDateFormat(accountingData.accountingOpeningDate,"yyyy-mm-dd");
      var periodStartDate = Banana.Converter.toInternalDateFormat(periods[0].startDate,"yyyymmdd");
      if (periodStartDate < accountingStartDate)
        libroGiornale.param.annoSelezionato = accountingData.closureYear;
    }
    /*var startDate = Banana.Converter.toInternalDateFormat(accountingData.accountingOpeningDate,"yyyy-mm-dd");
    var endDate =Banana.Converter.toInternalDateFormat(accountingData.accountingClosureDate,"yyyy-mm-dd");
    var newStartDate = Banana.Converter.stringToDate(accountingData.accountingOpeningDate, "YYYY-MM-DD");
    var days = 0;
    if (libroGiornale.param.periodoSelezionato == 'q')
      days = parseInt(libroGiornale.param.periodoValoreTrimestre)*90+1;
    else if (libroGiornale.param.periodoSelezionato == 'm')
      days = parseInt(libroGiornale.param.periodoValoreMese)*30+1;
    newStartDate.setDate(newStartDate.getDate() + days);
    console.log("new start date " + newStartDate.toString());
    if (newStartDate < startDate)
      libroGiornale.param.annoSelezionato = accountingData.closureYear*/
  }
  
  //opzioni
  libroGiornale.param.aggiungiAperture = dialog.opzioniGroupBox.regsitrazioniAperturaCheckBox.checked;
  libroGiornale.param.stampaOrizzontale = dialog.opzioniGroupBox.stampaOrizzontaleCheckBox.checked;
  libroGiornale.param.formattaMovStessaReg = dialog.opzioniGroupBox.formattaMovStessaRegCheckBox.checked;
  libroGiornale.param.inizioNumProgressiva = dialog.opzioniGroupBox.nProgrSpinBox.value.toString();
  if (parseInt(libroGiornale.param.inizioNumProgressiva)<=0)
    libroGiornale.param.inizioNumProgressiva='1';
  libroGiornale.param.righePerPagina = dialog.opzioniGroupBox.righePerPaginaSpinBox.value.toString();
  if (parseInt(libroGiornale.param.righePerPagina)<=0)
    libroGiornale.param.righePerPagina='40';

  index = parseInt(dialog.opzioniGroupBox.ordinamentoComboBox.currentIndex.toString());
  if (index == 0)
    libroGiornale.param.colonnaOrdinamento = '';
  else if (index == 1)
    libroGiornale.param.colonnaOrdinamento = 'DataDocumento';

  var paramToString = JSON.stringify(libroGiornale.param);
  Banana.document.setScriptSettings(paramToString);
  return true;
}

function LibroGiornale(banDocument) {
  this.banDocument = banDocument;
  if (this.banDocument === undefined)
    this.banDocument = Banana.document;
  this.init();
  this.initParam();
}

LibroGiornale.prototype.addPageFooter = function(report, stylesheet) {

  // Page footer
  if (report === undefined || stylesheet === undefined)
    return;

  var pageFooter = report.getFooter();

  //Tabella
  var table = pageFooter.addTable("footer_table");
  table.addColumn("footer_col_left");
  table.addColumn("footer_col_center");
  table.addColumn("footer_col_right");

  //cell_left
  var row = table.addRow();
  var cell_left = row.addCell("", "footer_cell_left");

  //cell_center
  var cell_center = row.addCell("", "footer_cell_center");
  var datestring = '';
  var d = new Date();
  var datestring = ("0" + d.getDate()).slice(-2) + "/" + ("0"+(d.getMonth()+1)).slice(-2) + "/" + d.getFullYear() + " " + ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2);  
  var pDate = cell_center.addParagraph(datestring, "center");
  pDate.excludeFromTest();

  //cell_right
  var row = table.addRow();
  var cell_right = row.addCell("", "footer_cell_right");

  //add style
  stylesheet.addStyle(".footer_table", "margin-top:1em; width:100%;");
  stylesheet.addStyle(".footer_col_left", "width:33%;");
  stylesheet.addStyle(".footer_col_center", "width:33%;");
  stylesheet.addStyle(".footer_col_right", "width:33%");
  stylesheet.addStyle(".footer_cell_left", "font-size:9px");
  stylesheet.addStyle(".footer_cell_center", "font-size:9px;padding-right:0;margin-right:0;");
  stylesheet.addStyle(".footer_cell_right", "font-size:9px;padding-left:0;margin-left:0;");
  stylesheet.addStyle(".center", "text-align: center;");
}

LibroGiornale.prototype.addPageHeader = function(report, stylesheet) {
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
  var periodo = Banana.Converter.toLocaleDateFormat(this.period.startDate);
  periodo +=" - " + Banana.Converter.toLocaleDateFormat(this.period.endDate);
  cell_center.addParagraph("Libro giornale", "title center");
  cell_center.addParagraph(periodo, "period center");

  //cell_right
  var period = this.param.annoSelezionato;
  if (period.length)
    period += "/";
  var cell_right = row.addCell("", "header_cell_right");
  cell_right.addParagraph(period + "pag.", "right").addFieldPageNr();
 
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

LibroGiornale.prototype.getFields = function() {
  var fields = [
    {'name' : 'NoProgr', 'title' : 'N.riga', 'type' : 'number'},
    {'name' : 'Date', 'title' : 'Data reg.', 'type' : 'date'},
    {'name' : 'DateDocument', 'title' : 'Data doc.', 'type' : 'date'},
    {'name' : 'JAccount', 'title' : 'Conto', 'type' : 'text'},
    {'name' : 'JAccountDescription', 'title' : 'Des. conto', 'type' : 'text'},
    {'name' : 'Description', 'title' : 'Des. movimento', 'type' : 'text'},
    {'name' : 'JDebitAmount', 'title' : 'Dare', 'type' : 'amount'},
    {'name' : 'JCreditAmount', 'title' : 'Avere', 'type' : 'amount'},
    {'name' : 'JBalance', 'title' : 'Saldo', 'type' : 'amount'},
    {'name' : 'JContraAccountGroup', 'title' : '_JContraAccountGroup', 'type' : 'text'},

  ];
  return fields;
}

LibroGiornale.prototype.getParam = function() {
  return this.param;
}

LibroGiornale.prototype.init = function() {
  this.journal = {};
  this.transactions = [];
  this.period = {};
  this.period.startDate="";
  this.period.endDate="";
}

LibroGiornale.prototype.initParam = function() {
  this.param = {};
  
  this.param.colonnaOrdinamento = '';
  this.param.aggiungiAperture = false;
  this.param.stampaOrizzontale = false;
  this.param.formattaMovStessaReg = true;

  this.param.inizioNumProgressiva = '1';
  this.param.righePerPagina = '40';

  /*periodoSelezionato y=anno, q=trimestre, m=mese, c=personalizzato*/
  this.param.annoSelezionato = '';
  this.param.periodoSelezionato = 'y';
  this.param.periodoValoreMese = '0';
  this.param.periodoValoreTrimestre = '0';
  this.param.periodoDataDal = '';
  this.param.periodoDataAl = '';

}

LibroGiornale.prototype.loadData = function() {
  this.init();

  //period
  this.param.datiContribuente = new DatiContribuente(this.banDocument).readParam();
  var utils = new Utils(this.banDocument);
  this.param = utils.readAccountingData(this.param);
  if (this.param.periodoSelezionato == 'c') {
    this.period.startDate = Banana.Converter.toInternalDateFormat(this.param.periodoDataDal, "dd/mm/yyyy");
    this.period.endDate = Banana.Converter.toInternalDateFormat(this.param.periodoDataAl, "dd/mm/yyyy"); 
  }
  else {
    //con datiContribuente.liqTipoVersamento=-1 crea un unico periodo in createPeriods()
    this.param.datiContribuente.liqTipoVersamento = -1;
    var periods = utils.createPeriods(this.param);
    //console.log(JSON.stringify(this.param));
    if (periods.length>0) {
      this.period.startDate = periods[0].startDate;
      this.period.endDate = periods[0].endDate; 
    }
  }
  if (!this.period.startDate || !this.period.endDate || this.period.startDate.length<=0 || this.period.endDate.length<=0)
    return;
  
  //lettura del giornale e caricamento dei dati in transactions
  this.journal = this.banDocument.journal(
    this.banDocument.ORIGINTYPE_CURRENT, this.banDocument.ACCOUNTTYPE_NONE);

  Banana.application.progressBar.start(this.journal.rowCount);
  var inizioNProgr = parseInt(this.param.inizioNumProgressiva);
  if (!inizioNProgr || inizioNProgr<=0)
    inizioNProgr=1;
  for (i=0; i<this.journal.rowCount; i++) {
    var tRow = this.journal.row(i);
    //include le aperture in base ai parametri
    var operationType = tRow.value('JOperationType');
    if (!this.param.aggiungiAperture && parseInt(operationType)==1) {
      if (!Banana.application.progressBar.step())
        break;
      continue;
    }
    //salva in transactions    
    var mappedTransaction = this.mapTransaction(tRow);
    if (mappedTransaction == null)
      continue;
    mappedTransaction['NoProgr'].value = inizioNProgr;
    this.transactions.push( mappedTransaction);
    //Versione 9.02 setText() non definito
    //Banana.application.progressBar.setText("row " + i + " " + mappedTransaction['Description'].value + " " + mappedTransaction['NoProgr'].value);
    inizioNProgr += 1;
    if (!Banana.application.progressBar.step())
      break;
  }
  Banana.application.progressBar.finish();

  //Sort per data
  if (this.param.colonnaOrdinamento == "DataDocumento")
    this.transactions.sort(this.sortByDateDocument);  
  else
    this.transactions.sort(this.sortByDate);
  
  //Reimposta il numero progressivo
  for (var i = 0; i < this.transactions.length; i++) {
    this.transactions[i]["NoProgr"].value = i+1;
  }
}

LibroGiornale.prototype.mapTransaction = function(element) {
  var mappedLine = {};

  var columns = this.getFields();

  var validValue=false;
  for (var i = 0; i < columns.length; i++) {
    var column = columns[i];
    mappedLine[column.name] = {};
    if (element.value(column.name) && element.value(column.name).length>0) {
      mappedLine[column.name].value = element.value(column.name);
      //controlla che ci sia almeno un contenuto data o importo per ritenere valida la riga
      if (column.type=="amount")
        validValue=true;
      else if (column.type=="date" && (!element.value("Description").startsWith("/*") || !element.value("Description").endsWith("*/"))) {
        validValue=true;
      }
    }
    else {
      mappedLine[column.name].value = "";
    }
    mappedLine[column.name].title = column.title;
    mappedLine[column.name].type = column.type;
  }
  
  //se non è stato ripreso nessun valore ritorna null
  if (!validValue)
    return null;

  //se la descrizione è vuota riprende la descrizione del giornale
  if (mappedLine['Description'].value.length<=0)
    mappedLine['Description'].value = element.value("JDescription");
  
  return mappedLine;
}

LibroGiornale.prototype.printDocument = function(report, stylesheet) {
  this.addPageHeader(report, stylesheet);
  this.addPageFooter(report, stylesheet);
  this.setStyle(report, stylesheet);
  
  //Print debug columns starting with _
  var excludeDebugColumns=true;
  
  //Intestazione tabella
  var headers = this.getFields();
  var table = report.addTable("tableJournal");
  var headerRow = table.getHeader().addRow();
  for (var i = 0; i < headers.length; i++) {
    var header = headers[i];
    if (header.title.startsWith("_") && excludeDebugColumns)
      continue;
    headerRow.addCell(header.title, header.type);
  }
  
  //Calcolo totale progressivo e riporto iniziale
  var carryForwardTotals={};
  var totalBalance = 0;
  var startDate = Banana.Converter.toInternalDateFormat(this.period.startDate,"yyyy-mm-dd");
  var endDate =Banana.Converter.toInternalDateFormat(this.period.endDate,"yyyy-mm-dd");
  //stampa la riga se è nel periodo altrimenti memorizza il totale inizio periodo
  for (var i = 0; i < this.transactions.length; i++) {
    var transaction = this.transactions[i];
    var date = Banana.Converter.toInternalDateFormat(transaction["Date"].value,"yyyymmdd");
    totalBalance = Banana.SDecimal.add(totalBalance, transaction["JDebitAmount"].value);
    totalBalance = Banana.SDecimal.subtract(totalBalance, transaction["JCreditAmount"].value);
    transaction["JBalance"].value = totalBalance;
    for (var column in transaction) {
      if (transaction[column].type == "amount" && column != "JBalance") {
        if (date < startDate) {
          carryForwardTotals[column] = Banana.SDecimal.add(transaction[column].value, carryForwardTotals[column]);
        }
      }
    }
  }
  
  //Stampa prima riga riporto saldi periodo precedente
  var printCarryForward=false;
  for (var column in carryForwardTotals) {
    if (!Banana.SDecimal.isZero(carryForwardTotals[column])) {
      printCarryForward=true;
      break;
    }
  }
  if (printCarryForward) {
    var row = table.addRow();
    for (var i = 0; i < headers.length; i++) {
      if (headers[i].title.startsWith("_") && excludeDebugColumns)
        continue;
      var text="";
      if (headers[i].name == "JAccountDescription")
        text = "Riporto precedente";
      if (headers[i].type == "amount") {
        var columnValue = Banana.Converter.toLocaleNumberFormat(carryForwardTotals[headers[i].name]);
        row.addCell(columnValue, headers[i].type + " total");
      }
      else {
        row.addCell(text, "text total");
      }
    }
  }

  //Stampa movimenti
  var probableIndexGroup=0;
  var previousProbableIndexGroup = 0;
  var nextProblableIndexGroup = 0;
  var className="even";
  var printedRow = 0;
  var pageTotals={};
  var nRighePerPagina = parseInt(this.param.righePerPagina);
  if (nRighePerPagina <=0)
    nRighePerPagina = 40;
  for (var i = 0; i < this.transactions.length; i++) {
    var transaction = this.transactions[i];
    probableIndexGroup = transaction["JContraAccountGroup"].value;
    nextProblableIndexGroup = probableIndexGroup;
    if (i+1 < this.transactions.length)
      nextProblableIndexGroup = this.transactions[i+1]["JContraAccountGroup"].value;
    var date = Banana.Converter.toInternalDateFormat(transaction["Date"].value,"yyyymmdd");
    if (date && date >= startDate  && date <= endDate) {
      if (printedRow>0 && parseInt(printedRow % nRighePerPagina) === 0) {
        this.printDocumentTotal(table, headers, pageTotals, "Totali pagina", excludeDebugColumns);
        this.printDocumentTotal(table, headers, carryForwardTotals, "Totali generali", excludeDebugColumns);
        table.addPageBreak();
        pageTotals = {};
      }
      printedRow++;
      for (var column in transaction) {
        if (transaction[column].type == "amount" && column != "JBalance") {
          pageTotals[column] = Banana.SDecimal.add(transaction[column].value, pageTotals[column]);
          carryForwardTotals[column] = Banana.SDecimal.add(transaction[column].value, carryForwardTotals[column]);
        }
      }
      var row = table.addRow();
      if (probableIndexGroup !== previousProbableIndexGroup) {
        if (className=="odd") {
          row.addClass("first");
          className="even";
        }
        else {
          row.addClass("first");
          className="odd";
        }
      }
      if (nextProblableIndexGroup !== probableIndexGroup) {
        row.addClass("last");
      }
      row.addClass(className);
      for (var j = 0; j < headers.length; j++) {
        if (headers[j].title.startsWith("_") && excludeDebugColumns)
           continue;
        var column = headers[j].name;
        var columnValue = transaction[column].value;
        var columnType = transaction[column].type;
        if (columnType == "amount") {
          columnValue = Banana.Converter.toLocaleNumberFormat(columnValue);
        }
        else if (columnType == "date") {
          columnValue = Banana.Converter.toLocaleDateFormat(columnValue);
        }
        else if (columnType == "text") {
         if (columnValue.length>30)
           columnValue = columnValue.substring(0,30) + "...";
        }
        row.addCell(columnValue, columnType);
      }
    }
    previousProbableIndexGroup = probableIndexGroup;
  }
  
  if (printedRow>0 && parseInt(printedRow % nRighePerPagina) !== 0) {
    this.printDocumentTotal(table, headers, pageTotals, "Totali pagina", excludeDebugColumns);
    this.printDocumentTotal(table, headers, carryForwardTotals, "Totali generali", excludeDebugColumns);
  }
  
}

LibroGiornale.prototype.printDocumentTotal = function(table, columns, totals, totalsText, excludeDebugColumns) {
  //Stampa riga di riporto o totale
  var print=false;
  for (var column in totals) {
    if (!Banana.SDecimal.isZero(totals[column])) {
      print=true;
      break;
    }
  }
  if (!print)
    return;
  var row = table.addRow();
  for (var i = 0; i < columns.length; i++) {
    if (columns[i].title.startsWith("_") && excludeDebugColumns)
      continue;
    var text="";
    if (columns[i].name == "JAccountDescription")
      text = totalsText;
    if (columns[i].type == "amount") {
      var columnValue = Banana.Converter.toLocaleNumberFormat(totals[columns[i].name]);
      if (columns[i].name == "JBalance") {
        columnValue = totals["JDebitAmount"];
        columnValue = Banana.SDecimal.subtract(columnValue, totals["JCreditAmount"]);
        columnValue = Banana.Converter.toLocaleNumberFormat(columnValue);
      }
      row.addCell(columnValue, columns[i].type + " total " + totalsText);
    }
    else {
      row.addCell(text, "text total " + totalsText);
    }
  }
}

LibroGiornale.prototype.setParam = function(param) {
  this.param = param;
  this.verifyParam();
}

LibroGiornale.prototype.setStyle = function(report, stylesheet) {
  if (!stylesheet) {
    stylesheet = report.newStyleSheet();
  }
  if (this.param.stampaOrizzontale)
    stylesheet.addStyle("@page").setAttribute("size", "landscape");
  stylesheet.addStyle("@page", "margin:2em;font-size: 8px; ");
  stylesheet.addStyle("phead", "font-weight: bold; margin-bottom: 1em");
  stylesheet.addStyle("thead", "font-weight: bold;background-color:#ddddddeeeeee;border-bottom:1px solid #333333");
  stylesheet.addStyle("td", "padding:2px;vertical-align:top;");

  stylesheet.addStyle(".amount", "text-align: right; ");
  stylesheet.addStyle(".center", "text-align: center;");
  stylesheet.addStyle(".error", "color:red;");
  stylesheet.addStyle(".notes", "padding: 2em;font-style:italic;");
  stylesheet.addStyle(".period", "background-color:#ffffff;border:1px solid #ffffff;");
  stylesheet.addStyle(".right", "text-align: right;");
  stylesheet.addStyle(".total", "font-weight: bold;");
  stylesheet.addStyle(".title", "background-color:#ffffff;border:1px solid #ffffff;font-size:10px;");
  stylesheet.addStyle(".warning", "color: red;font-size:8px;");

  /*tables*/
  stylesheet.addStyle(".tableJournal", "margin-top:1em;width:100%;border-top:1px solid #333333;");
  if (this.param.formattaMovStessaReg) {
    stylesheet.addStyle(".tableJournal tr.last td", "border-bottom: 1px dotted #333333;");
    stylesheet.addStyle(".tableJournal tr.last td", "border-bottom: 1px dotted #333333");
  }
  stylesheet.addStyle(".Totali.pagina", "border-top: 1px solid #333333;");
  stylesheet.addStyle(".Totali.generali", "border-bottom: 1px double #333333;");
}

LibroGiornale.prototype.sortByDate = function(a, b) {
  if (a["Date"].value > b["Date"].value) {
    return 1;
  } else if (a["Date"].value < b["Date"].value){
    return -1;
  } else {
    if (a["NoProgr"].value > b["NoProgr"].value) {
      return 1;
    } else if (a["NoProgr"].value < b["NoProgr"].value)
      return -1;
  }
  return 0;
}

LibroGiornale.prototype.sortByDateDocument = function(a, b) {
  if (a["DateDocument"].value > b["DateDocument"].value) {
    return 1;
  } else if (a["DateDocument"].value < b["DateDocument"].value){
    return -1;
  } else {
    if (a["NoProgr"].value > b["NoProgr"].value) {
      return 1;
    } else if (a["NoProgr"].value < b["NoProgr"].value)
      return -1;
  }
  return 0;
}

LibroGiornale.prototype.verifyParam = function() {

  if (!this.param.colonnaOrdinamento)
    this.param.colonnaOrdinamento = '';
  if (!this.param.aggiungiAperture)
    this.param.aggiungiAperture = false;
  if (!this.param.stampaOrizzontale)
    this.param.stampaOrizzontale = false;
  if (!this.param.formattaMovStessaReg)
    this.param.formattaMovStessaReg = false;
  if (!this.param.inizioNumProgressiva)
    this.param.inizioNumProgressiva = '1';
  if (!this.param.righePerPagina)
    this.param.righePerPagina = '40';

  if (!this.param.annoSelezionato)
    this.param.annoSelezionato = '';
  if (!this.param.periodoSelezionato)
    this.param.periodoSelezionato = 'y';
  if (!this.param.periodoValoreMese)
    this.param.periodoValoreMese = '0';
  if (!this.param.periodoValoreTrimestre)
    this.param.periodoValoreTrimestre = '0';
  if (!this.param.periodoDataDal)
    this.param.periodoDataDal = '';
  if (!this.param.periodoDataAl)
    this.param.periodoDataAl = '';
}

