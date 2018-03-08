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
// @includejs = ch.banana.script.italy_vat_2017.journal.js
// @includejs = ch.banana.script.italy_vat.daticontribuente.js
// @includejs = ch.banana.script.italy_vat_2017.xml.js
// @inputdatasource = none
// @pubdate = 2018-03-07
// @publisher = Banana.ch SA
// @task = app.command
// @timeout = -1

function exec() {
  if (!Banana.document)
    return "@Cancel";

  var param = {};
  if (inData.length>0) {
    param = JSON.parse(inData);
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
  if (!libroGiornale.param.annoSelezionato || libroGiornale.param.annoSelezionato.length<=0)
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
  dialog.periodoGroupBox.trimestreComboBox.currentIndex = libroGiornale.param.periodoValoreTrimestre;
  dialog.periodoGroupBox.meseComboBox.currentIndex = libroGiornale.param.periodoValoreMese;
  var fromDate = libroGiornale.param.dataDal;
  var toDate = libroGiornale.param.dataAl;
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
  else if (libroGiornale.param.colonnaOrdinamento == 'DataValuta')
    index = 2;
  dialog.opzioniGroupBox.ordinamentoComboBox.currentIndex = index;
  dialog.opzioniGroupBox.regsitrazioniAperturaCheckBox.checked = libroGiornale.param.aggiungiAperture;

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
  libroGiornale.param.periodoValoreTrimestre = index;
  index = parseInt(dialog.periodoGroupBox.meseComboBox.currentIndex.toString());
  libroGiornale.param.periodoValoreMese = index;
  libroGiornale.param.dataDal = dialog.periodoGroupBox.dalDateEdit.text < 10 ? "0" + dialog.periodoGroupBox.dalDateEdit.text : dialog.periodoGroupBox.dalDateEdit.text;
  libroGiornale.param.dataAl = dialog.periodoGroupBox.alDateEdit.text < 10 ? "0" + dialog.periodoGroupBox.alDateEdit.text : dialog.periodoGroupBox.alDateEdit.text;
  
  //opzioni
  libroGiornale.param.aggiungiAperture = dialog.opzioniGroupBox.regsitrazioniAperturaCheckBox.checked;
  index = parseInt(dialog.opzioniGroupBox.ordinamentoComboBox.currentIndex.toString());
  if (index == 0)
    libroGiornale.param.colonnaOrdinamento = 'Data';
  else if (index == 1)
    libroGiornale.param.colonnaOrdinamento = 'DataDocumento';
  else if (index == 2)
    libroGiornale.param.colonnaOrdinamento = 'DataValuta';

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
  cell_center.addParagraph(datestring, "center");

  //cell_right
  var row = table.addRow();
  var cell_right = row.addCell("", "footer_cell_right");

  //add style
  stylesheet.addStyle(".footer_table", "margin-top:1em;width:100%;");
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
  var cell_right = row.addCell("", "header_cell_right");
  cell_right.addParagraph(Banana.Converter.toLocaleDateFormat(new Date()), "right");
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
*  Filtra i dati del giornale escludendo le registrazioni dei centri di costo
 */
LibroGiornale.prototype.filter = function(row, index, table) {
  if (!table.periodStart || !table.periodEnd)
    return false;
  var currentDate = Banana.Converter.stringToDate(row.value("JDate"), "YYYY-MM-DD");
  if (currentDate && currentDate >= table.periodStart && currentDate <= table.periodEnd) {
    return true;
  }
  return false;
}

LibroGiornale.prototype.getParam = function() {
  return this.param;
}

LibroGiornale.prototype.init = function() {
  this.journal = {};
  this.transactions = {};
  this.columns = {};
  this.period = {};
  this.period.startDate="";
  this.period.endDate="";
}

LibroGiornale.prototype.initParam = function() {
  this.param = {};
  
  this.param.colonnaOrdinamento = '';
  this.param.aggiungiAperture = false;

  /*periodoSelezionato y=anno, q=trimestre, m=mese, c=personalizzato*/
  this.param.annoSelezionato = '';
  this.param.periodoSelezionato = 'y';
  this.param.periodoValoreMese = '0';
  this.param.periodoValoreTrimestre = '0';
  this.param.periodoValoreDataDal = '';
  this.param.periodoValoreDataAl = '';

}

LibroGiornale.prototype.loadData = function() {
  this.init();
  this.param.datiContribuente = new DatiContribuente(this.banDocument).loadParam();
  var utils = new Utils(this.banDocument);
  this.param = utils.readAccountingData(this.param);
  //con datiContribuente.liqTipoVersamento=-1 crea un unico periodo in createPeriods()
  this.param.datiContribuente.liqTipoVersamento = -1;
  var periods = utils.createPeriods(this.param);
  if (periods.length>0) {
    this.period.startDate = periods[0].startDate;
    this.period.endDate = periods[0].endDate; 
  }
  
  if (this.period.startDate.length<=0 || this.period.endDate.length<=0)
    return;

  this.journal = this.banDocument.journal(
    this.banDocument.ORIGINTYPE_CURRENT, this.banDocument.ACCOUNTTYPE_NONE);
  this.journal.periodStart = Banana.Converter.toDate(this.period.startDate);
  this.journal.periodEnd =  Banana.Converter.toDate(this.period.endDate);
  this.transactions = this.journal.findRows(this.filter);
  this.setColumns();
}

LibroGiornale.prototype.printDocument = function(report, stylesheet) {
  this.addPageHeader(report, stylesheet);
  this.addPageFooter(report, stylesheet);
  this.setStyle(report, stylesheet);
  
  //Table
  var table = report.addTable("tableJournal");
  var headerRow = table.getHeader().addRow();
  for (var i in this.columns) {
    //console.log(JSON.stringify(this.columns[i]));
    var columnTitle = this.columns[i].title;
    headerRow.addCell(columnTitle);
  }

  // Print data
  for (var i in this.transactions) {
    var jsonObj = this.transactions[i];
    console.log(JSON.stringify(jsonObj));
    var row = table.addRow();
    for (var j in this.columns) {
      var columnName = this.columns[j].name;
      var columnType = this.columns[j].type;
      var content = jsonObj.value(columnName);
      if (columnType == "date")
        content = Banana.Converter.toLocaleDateFormat(content, "dd/mm/yy")
      row.addCell(content, columnType);
    }
  }
}

LibroGiornale.prototype.setColumns = function() {
  this.columns = [];
  var column = {};
  column.name = "IT_NoProgressivo";
  column.title = "N.Prog.";
  column.type = "description";
  this.columns.push(column);
  var column = {};
  column.name = "Date";
  column.title = "Data reg.";
  column.type = "date";
  this.columns.push(column);
  var column = {};
  column.name = "Doc";
  column.title = column.name;
  column.type = "description";
  this.columns.push(column);
  var column = {};
  column.name = "DateDocument";
  column.title = "Data Doc";
  column.type = "date";
  this.columns.push(column);
  var column = {};
  column.name = "JAccount";
  column.title = "N. conto";
  column.type = "description";
  this.columns.push(column);
  var column = {};
  column.name = "JAccountDescription";
  column.title = "Des. conto";
  column.type = "description";
  this.columns.push(column);
  var column = {};
  column.name = "JDebitAmount";
  column.title = "Importo dare";
  column.type = "amount";
  this.columns.push(column);
  var column = {};
  column.name = "JCreditAmount";
  column.title = "Importo avere";
  column.type = "amount";
  this.columns.push(column);
  var column = {};
  column.name = "Description";
  column.title = "Des. movimento";
  column.type = "description";
  this.columns.push(column);
  var column = {};
  column.name = "JBalance";
  column.title = "Saldo";
  column.type = "amount";
  this.columns.push(column);
  
}

LibroGiornale.prototype.setParam = function(param) {
  this.param = param;
  this.verifyParam();
}

LibroGiornale.prototype.setStyle = function(report, stylesheet) {
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
  stylesheet.addStyle(".period", "background-color:#ffffff;border:1px solid #ffffff;");
  stylesheet.addStyle(".right", "text-align: right;");
  stylesheet.addStyle(".row.amount", "border:0.5em solid black");
  stylesheet.addStyle(".rowName", "font-weight: bold;padding-top:5px;border-top:0.5em solid black");
  stylesheet.addStyle(".title", "background-color:#ffffff;border:1px solid #ffffff;font-size:10px;");
  stylesheet.addStyle(".warning", "color: red;font-size:8px;");

  /*tables*/
  stylesheet.addStyle(".tableJournal", "margin-top:1em;width:100%;");
  stylesheet.addStyle(".tableJournal td", "border:1px solid #333333");
  
}

LibroGiornale.prototype.verifyParam = function() {

  if (!this.param.colonnaOrdinamento)
    this.param.colonnaOrdinamento = '';
  if (!this.param.aggiungiAperture)
    this.param.aggiungiAperture = false;

  if (!this.param.annoSelezionato)
    this.param.annoSelezionato = '';
  if (!this.param.periodoSelezionato)
    this.param.periodoSelezionato = 'y';
  if (!this.param.periodoValoreMese)
    this.param.periodoValoreMese = '0';
  if (!this.param.periodoValoreTrimestre)
    this.param.periodoValoreTrimestre = '0';
  if (!this.param.periodoValoreDataDal)
    this.param.periodoValoreDataDal = '';
  if (!this.param.periodoValoreDataAl)
    this.param.periodoValoreDataAl = '';
}
