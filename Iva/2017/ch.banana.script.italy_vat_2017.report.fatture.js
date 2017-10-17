// Copyright [2017] [Banana.ch SA - Lugano Switzerland]
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
// @description = IVA Italia 2017 / Comunicazione dati fatture (spesometro)...
// @doctype = *;110
// @encoding = utf-8
// @includejs = ch.banana.script.italy_vat_2017.report.fatture.createinstance.js
// @includejs = ch.banana.script.italy_vat_2017.errors.js
// @includejs = ch.banana.script.italy_vat_2017.journal.js
// @includejs = ch.banana.script.italy_vat_2017.xml.js
// @inputdatasource = none
// @pubdate = 2017-10-17
// @publisher = Banana.ch SA
// @task = app.command
// @timeout = -1

var debug = false;

/*
 * Update script's parameters
*/
function settingsDialog() {

  var param = initParam();
  var savedParam = Banana.document.getScriptSettings();
  if (savedParam.length > 0) {
    param = JSON.parse(savedParam);
  }
  param = verifyParam(param);
  
  var accountingData = {};
  accountingData = readAccountingData(accountingData);
  if (param.annoSelezionato.length<=0)
    param.annoSelezionato = accountingData.openingYear;
  
  var dialog = Banana.Ui.createUi("ch.banana.script.italy_vat_2017.report.fatture.dialog.ui");
  //Groupbox periodo
  var index = 0;
  if (param.periodoSelezionato == 'm')
    index = parseInt(param.periodoValoreMese);
  else if (param.periodoSelezionato == 'q')
    index = parseInt(param.periodoValoreTrimestre) + 13;
  else if (param.periodoSelezionato == 's')
    index = parseInt(param.periodoValoreSemestre) + 18;
  else if (param.periodoSelezionato == 'y')
    index = 21;
  dialog.periodoGroupBox.periodoComboBox.currentIndex = index;
  //Groupbox anno per il momento impostati fissi perché non è possibile caricare gli anni sul combobox
  var index = 0;
  if (param.annoSelezionato == '2017')
    index = 1;
  else if (param.annoSelezionato == '2018')
    index = 2;
  dialog.periodoGroupBox.annoComboBox.currentIndex = index;

  var progressivo = parseInt(param.progressivoInvio, 10);
  if (!progressivo)
    progressivo = 1;
  else if (param.outputScript==1 || param.outputScript==3)
    progressivo += 1;
  progressivo = zeroPad(progressivo, 5);
  dialog.datiFatturaHeaderGroupBox.progressivoInvioLineEdit.text = progressivo;
  dialog.datiFatturaHeaderGroupBox.cfDichiaranteLineEdit.text = param.codicefiscaleDichiarante;
  dialog.datiFatturaHeaderGroupBox.codiceCaricaComboBox.currentIndex = param.codiceCarica;
  var bloccoId = 0;
  if (param.blocco == "DTR")
    bloccoId = 1;
  dialog.bloccoGroupBox.bloccoComboBox.currentIndex = bloccoId;

  //Groupbox opzioni
  dialog.opzioniGroupBox.esigibilitaIvaCheckBox.checked = param.esigibilitaIva;

  //Groupbox stampa
  if (param.outputScript==1)
    dialog.stampaGroupBox.stampaXmlRadioButton.checked = true;
  else if (param.outputScript==3)
    dialog.stampaGroupBox.annullamentoRadioButton.checked = true;
  else  
    dialog.stampaGroupBox.stampaReportRadioButton.checked = true;
  dialog.stampaGroupBox.idFileLineEdit.text = param.idFile;

  //dialog functions
  dialog.checkdata = function () {
    dialog.accept();
  }
  dialog.enableButtons = function () {
  }
  dialog.showHelp = function () {
    Banana.Ui.showHelp("ch.banana.script.italy_vat_2017");
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
    param.periodoSelezionato = 'm';
    param.periodoValoreMese = index.toString();
  }
  else if (index > 12 && index < 17) {
    param.periodoSelezionato = 'q';
    param.periodoValoreTrimestre = (index-13).toString();
  }
  else if (index > 17 && index < 20) {
    param.periodoSelezionato = 's';
    param.periodoValoreSemestre = (index-18).toString();
  }
  else {
    param.periodoSelezionato = 'y';
  }
  //Groupbox anno
  var index = parseInt(dialog.periodoGroupBox.annoComboBox.currentIndex.toString());
  if (index <=0)
    param.annoSelezionato = '2016';
  else if (index ==1)
    param.annoSelezionato = '2017';
  else if (index ==2)
    param.annoSelezionato = '2018';

  progressivo = dialog.datiFatturaHeaderGroupBox.progressivoInvioLineEdit.text;
  progressivo = parseInt(progressivo, 10);
  if (!progressivo)
    progressivo = 1;
  param.progressivoInvio = zeroPad(progressivo, 5);
  param.codicefiscaleDichiarante = dialog.datiFatturaHeaderGroupBox.cfDichiaranteLineEdit.text;
  param.codiceCarica = dialog.datiFatturaHeaderGroupBox.codiceCaricaComboBox.currentIndex.toString();
  var bloccoId = dialog.bloccoGroupBox.bloccoComboBox.currentIndex.toString();
  if (bloccoId == 1)
    param.blocco = "DTR";
  else
    param.blocco = "DTE";
  
  //Groupbox opzioni
  param.esigibilitaIva = dialog.opzioniGroupBox.esigibilitaIvaCheckBox.checked;

  //Groupbox stampa
  if (dialog.stampaGroupBox.stampaXmlRadioButton.checked)
    param.outputScript = 1;
  else if (dialog.stampaGroupBox.annullamentoRadioButton.checked)
    param.outputScript = 3;
  else
    param.outputScript = 0;
  param.idFile = dialog.stampaGroupBox.idFileLineEdit.text;

  var paramToString = JSON.stringify(param);
  Banana.document.setScriptSettings(paramToString);
  return true;
}

function addPageHeader(report, stylesheet, param)
{
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

  var line1 = param.datiContribuente.societa;
  if (line1.length)
    line1 += " ";
  if (param.datiContribuente.cognome.length)
    line1 += param.datiContribuente.cognome;
  if (param.datiContribuente.nome.length)
    line1 += param.datiContribuente.nome;
  if (line1.length)
    cell_left.addParagraph(line1);
  
  var line2 = '';
  if (param.datiContribuente.indirizzo.length)
    line2 = param.datiContribuente.indirizzo + " ";
  if (param.datiContribuente.ncivico.length)
    line2 += " " + param.datiContribuente.ncivico;
  if (line2.length)
    cell_left.addParagraph(line2);

  var line3 = '';
  if (param.datiContribuente.cap.length)
    line3 = param.datiContribuente.cap + " ";
  if (param.datiContribuente.comune.length)
    line3 += param.datiContribuente.comune + " ";
  if (param.datiContribuente.provincia.length)
    line3 += "(" +  param.datiContribuente.provincia + ")";
  if (line3.length)
    cell_left.addParagraph(line3);
  
  var line4 = '';
  if (param.datiContribuente.partitaIva.length)
    line4 = "P.IVA: " + param.datiContribuente.partitaIva;
  if (line4.length)
    cell_left.addParagraph(line4, "vatNumber");
  
  //cell_center
  var cell_center = row.addCell("", "header_cell_center");
  var periodo = Banana.Converter.toLocaleDateFormat(param.data.startDate);
  periodo +=" - " + Banana.Converter.toLocaleDateFormat(param.data.endDate);
  periodo += " blocco " + param.blocco;
  cell_center.addParagraph("Comunicazione dati fatture", "title center");
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

function exec(inData) {

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
  else {
    if (!settingsDialog())
      return "@Cancel";
    param = JSON.parse(Banana.document.getScriptSettings());
  }

  //add accounting data and journal
  param = readAccountingData(param);
  param = loadJournalData(param);
  param.schemaRefs = init_schemarefs();
  param.namespaces = init_namespaces();

  if (param.outputScript==3 && output != "@Cancel") {
    //xml file di annullamento
    var output = createInstanceAnnullamento(param);
    output = formatXml(output);
    saveData(output, param);
    return;
  }
  
  var output = createInstance(param);
  
  if (param.outputScript==0 && output != "@Cancel") {
    var report = Banana.Report.newReport("Dati delle fatture emesse e ricevute");
    var stylesheet = Banana.Report.newStyleSheet(); 
    addPageHeader(report, stylesheet, param);
    setStyle(report, stylesheet);
    printVatReport(report, stylesheet, param);
    printVatCodesTotal(report, stylesheet, param);
    printExcludedRows(report, stylesheet, param);
    if (debug) {
      report.addPageBreak();
      _debug_printJournal(param.data, report, stylesheet);
    }
    Banana.Report.preview(report, stylesheet);
  }
  else if (param.outputScript==1 && output != "@Cancel") {
    //xml file
    output = formatXml(output);
    saveData(output, param);
    return;
  }

  //return xml content
  return output;
}

function initParam()
{
  var param = {};
  param.codicefiscaleDichiarante = '';
  param.codiceCarica = '';
  param.blocco = 'DTE';
  param.progressivoInvio = '';
  param.esigibilitaIva = false;
  param.idFile = '';
  
  param.annoSelezionato = '';
  param.periodoSelezionato = 'm';
  param.periodoValoreMese = '';
  param.periodoValoreTrimestre = '';
  param.periodoValoreSemestre = '';

  /*
  0 = create print preview report
  1 = create file xml 
  2 = return xml string 
  3 = create file xml annullamento */
  param.outputScript = 0;
  
  return param;
}

function init_namespaces()
{
  var ns = [
    {
      'namespace' : 'http://ivaservizi.agenziaentrate.gov.it/docs/xsd/fatture/v2.0',
      'prefix' : 'xmlns:ns2'
    },
  ];
  return ns;
}
function init_schemarefs()
{
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
function isValidRow(row, param) {

  //Per la comunicazione DTE (Dati fatture emesse tiene solamente le righe del registro Vendite e
  //Fatture corrispettivi, scontrini esclusi)
  //Per la comunicazine DTR (Dati fatture ricevute tiene solamente le righe del registro Acquisti)
  //In questo modo vengono escluse le autofatture
  
  var corrispettiviNormali = '';
  var corrispettiviScontrini = '';
  var ricevuteFiscali = '';
  if (param.datiContribuente && param.datiContribuente.contoCorrispettiviNormali)
    corrispettiviNormali = param.datiContribuente.contoCorrispettiviNormali;
  if (param.datiContribuente && param.datiContribuente.contoCorrispettiviScontrini)
    corrispettiviScontrini = param.datiContribuente.contoCorrispettiviScontrini;
  if (param.datiContribuente && param.datiContribuente.contoRicevuteFiscali)
    ricevuteFiscali = param.datiContribuente.contoRicevuteFiscali;

  if (param.blocco == 'DTE') {
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
  else if (param.blocco == 'DTR') {
    if (row["IT_Registro"]=="Vendite" || row["IT_Registro"]=="Corrispettivi")
      return false;
    else if (row["VatExtraInfo"]=="ESCL" || row["IT_Natura"]=="ESCL")
      return false;
    return true;
  }
  return false;
}

function loadJournalData(param) {

  //per il momento c'è un unico periodo non controlla il tipo di versamento mensile o trimestrale
  param.data = {};  
  param.datiContribuente.liqTipoVersamento = -1;
  var periods = createPeriods(param);
  if (periods.length>0) {
    param.data.startDate = periods[0].startDate;
    param.data.endDate = periods[0].endDate;
    param.data = loadJournal(param.data);
  }

  if (param.blocco == 'DTE') {
    //avvisa se il gruppo clienti non è impostato
    if (param.fileInfo["CustomersGroup"].length<=0) {
      var msg = getErrorMessage(ID_ERR_GRUPPO_CLIENTI_MANCANTE);
      Banana.document.addMessage( msg, ID_ERR_GRUPPO_CLIENTI_MANCANTE);
    }
    var checkedCustomers = {};
    for (var i in param.data.customers) {
      var checkedRows = [];
      var accountObj = param.data.customers[i];
      if (accountObj && accountObj.rows) {
      for (var j=0; j<accountObj.rows.length;j++) {
        var isValid = isValidRow(accountObj.rows[j], param);
        if (!isValid)
          continue;
        checkedRows.push(accountObj.rows[j]);
      }
      }
      if (checkedRows.length>0) {
        accountObj.rows = checkedRows;
        checkedCustomers[i] = accountObj;
      }
    }
    param.data.customers = checkedCustomers;
  }
  else if (param.blocco == 'DTR') {
    //avvisa se il gruppo fornitori non è impostato
    if (param.fileInfo["SuppliersGroup"].length<=0) {
      var msg = getErrorMessage(ID_ERR_GRUPPO_FORNITORI_MANCANTE);
      Banana.document.addMessage( msg, ID_ERR_GRUPPO_FORNITORI_MANCANTE);
    }
    var checkedSuppliers = {};
    for (var i in param.data.suppliers) {
      var checkedRows = [];
      var accountObj = param.data.suppliers[i];
      for (var j in accountObj.rows) {
        var isValid = isValidRow(accountObj.rows[j], param);
        if (!isValid)
          continue;
        checkedRows.push(accountObj.rows[j]);
      }
      if (checkedRows.length>0) {
        accountObj.rows = checkedRows;
        checkedSuppliers[i] = accountObj;
      }
    }
    param.data.suppliers = checkedSuppliers;
  }

  return param;
}

/*
 * stampa tabella di controllo, visualizzando tutte le registrazioni con iva escluse
* ad esempio per registrazioni composte nelle quali il cliente/fornitore non appare nella prima riga 
*/
function printExcludedRows(report, stylesheet, param) {

  //Visualizza solamente se ci sono righe escluse per il registro corrente
  var registroCorrente = 'Vendite|Corrispettivi';
  if (param.blocco == 'DTR')
    registroCorrente = 'Acquisti';

  var found=false;
  for (var i=0; i < param.data.journal.rows.length;i++) {
    var jsonObj = param.data.journal.rows[i];
    var registrazioneValida = jsonObj['IT_RegistrazioneValida'];
    var registro = jsonObj['IT_Registro'];
    var isValid = isValidRow(jsonObj, param);
    if ((!registrazioneValida || registrazioneValida.length<=0 || !isValid) && registroCorrente.indexOf(registro)>=0) {
      found = true;
      break;
    }
  }
  if (!found)
    return;

  //Colonne da visualizzare del giornale
  var sortedColumns = [];
  sortedColumns.push(1015); //IT_DataDoc
  sortedColumns.push(1014); //IT_NoDoc
  sortedColumns.push(4); //Description
  sortedColumns.push(5); //VatCode
  sortedColumns.push(1001); //IT_Lordo
  sortedColumns.push(1002); //IT_ImportoIva
  sortedColumns.push(1004); //IT_Imponibile
  sortedColumns.push(1017); //IT_ClienteConto
  sortedColumns.push(1013); //IT_Registro
  sortedColumns.push(14); //JRowOrigin
  sortedColumns.push(15); //JTableOrigin

  //Title
  var table = report.addTable("tableJournal");
  for (var i =0; i<14;i++) {
    table.addColumn("tableJournal_col" + i.toString());
  }
  
  //Header
  var headerRow = table.getHeader().addRow();
  headerRow.addCell("TABELLA DI CONTROLLO, REGISTRAZIONI ESCLUSE DALLA COMUNICAZIONE (" + getPeriodText(param.data) + ")", "title",  sortedColumns.length);
  var headerRow = table.getHeader().addRow();
  for (var i in sortedColumns) {
    var index = sortedColumns[i];
    for (var j in param.data.journal.columns) {
      if (param.data.journal.columns[j].index == index) {
        var columnTitle = param.data.journal.columns[j].title;
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
  for (var i=0; i < param.data.journal.rows.length;i++) {
    var jsonObj = param.data.journal.rows[i];
    var registrazioneValida = jsonObj['IT_RegistrazioneValida'];
    var registro = jsonObj['IT_Registro'];
    var isValid = isValidRow(jsonObj, param);
    if ((!registrazioneValida || registrazioneValida.length<=0 || !isValid) && registroCorrente.indexOf(registro)>=0) {
      var row = table.addRow();
      for (var j in sortedColumns) {
        var index = sortedColumns[j];
        for (var k in param.data.journal.columns) {
          if (param.data.journal.columns[k].index == index) {
            var content = jsonObj[param.data.journal.columns[k].name];
            row.addCell(content, param.data.journal.columns[k].type);
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
function printVatCodesTotal(report, stylesheet, param) {
  //Data
  if (param.data.customers.length<=0 && param.data.suppliers.length<=0)
    return;

  var totaliCodice = [];
  if (param.blocco == 'DTE') {
    totaliCodice = printVatCodesTotal_rows(param.data.customers);
  }
  else if (param.blocco == 'DTR'){
    totaliCodice = printVatCodesTotal_rows(param.data.suppliers);
  }
 
  //Column names
  var tot1=0;
  var tot2=0;
  var tot3=0;
  var table = report.addTable("vatcodes_table");
  headerRow = table.getHeader().addRow();
  headerRow.addCell("TOTALI DI PERIODO PER CODICE (" + getPeriodText(param.data) + ")", "title", 7); 
  headerRow = table.getHeader().addRow();
  headerRow.addCell("Cod.IVA", "header");
  headerRow.addCell("Gr.IVA", "header");
  headerRow.addCell("Aliquota", "right header");
  headerRow.addCell("Descrizione", "header expand");
  headerRow.addCell("Imponibile", "right header");
  headerRow.addCell("Imposta", "right header");
  headerRow.addCell("Imposta indetraibile", "right header");

  var sorted_keys = Object.keys(totaliCodice).sort();
  for (var i=0; i<sorted_keys.length;i++) {
    var vatCode = sorted_keys[i];
    row = table.addRow();
    row.addCell(vatCode, "");
    row.addCell(totaliCodice[vatCode].gr, "");
    row.addCell(totaliCodice[vatCode].vatRate, "right");
    row.addCell(totaliCodice[vatCode].vatCodeDes);
    row.addCell(Banana.Converter.toLocaleNumberFormat(totaliCodice[vatCode].vatTaxable), "right");
    row.addCell(Banana.Converter.toLocaleNumberFormat(totaliCodice[vatCode].vatAmount), "right");
    row.addCell(Banana.Converter.toLocaleNumberFormat(totaliCodice[vatCode].vatNonDed), "right");
    tot1 = Banana.SDecimal.add(totaliCodice[vatCode].vatTaxable, tot1);
    tot2 = Banana.SDecimal.add(totaliCodice[vatCode].vatAmount, tot2);
    tot3 = Banana.SDecimal.add(totaliCodice[vatCode].vatNonDed, tot3);
  }

  //Totale
  row = table.addRow();
  row.addCell("", "", 3);
  row.addCell("Totale", "total");
  row.addCell(Banana.Converter.toLocaleNumberFormat(tot1), "right total");
  row.addCell(Banana.Converter.toLocaleNumberFormat(tot2), "right total");
  row.addCell(Banana.Converter.toLocaleNumberFormat(tot3), "right total");
  
  //Add style
  stylesheet.addStyle(".vatcodes_table", "width:100%;margin-top:20px;");
  stylesheet.addStyle(".vatcodes_table td", "border:0.5em solid black;padding:3px;");
  stylesheet.addStyle(".vatcodes_table td.header", "font-weight:bold;background-color:#dddddd");
  stylesheet.addStyle(".vatcodes_table td.title", "font-weight:bold;border:0px;background-color:#ffffff;");
  stylesheet.addStyle(".vatcodes_table td.total", "font-weight:bold;");
}

function printVatCodesTotal_rows(customers) {
  var totaliCodice = [];
  for (var id in customers) {
    for (var index in customers[id].rows) {
      var vatCode = customers[id].rows[index].JVatCodeWithoutSign;
      var vatRate = customers[id].rows[index].IT_Aliquota;
      var vatAmount = customers[id].rows[index].IT_ImportoIva;
      var vatPosted = customers[id].rows[index].IT_IvaContabilizzata;
      var vatNonDed = customers[id].rows[index].VatNonDeductible;
      var vatTaxable = customers[id].rows[index].IT_Imponibile;
      var vatTaxableDed = customers[id].rows[index].IT_ImponibileDetraibile;
      var vatTaxableNonDed = customers[id].rows[index].IT_ImponibileNonDetraibile;
      var vatPercNonDed = customers[id].rows[index].VatPercentNonDeductible;
      var vatGross = customers[id].rows[index].IT_Lordo;
      var gr = customers[id].rows[index].IT_Gr_IVA;

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
          totaliCodice[vatCode].vatCodeDes = '';
          totaliCodice[vatCode].gr = gr;
          var tableVatCodes = Banana.document.table("VatCodes");
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

function printVatReport(report, stylesheet, param) {

  if (param.data.customers.length<=0 && param.data.suppliers.length<=0)
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
  if (param.blocco == 'DTE') {
    printVatReport_rows(param.data.customers, table, param)
  }
  else if (param.blocco == 'DTR'){
    printVatReport_rows(param.data.suppliers, table, param)
  }
  
}

function printVatReport_rows(customers_suppliers, table, param) {
  for (var i in customers_suppliers) {
	var rowType = "cliente";
	if (param.blocco == "DTR")
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
    row.addCell(getCountryCode(customers_suppliers[i]),"rowName",2);
    row.addCell(customers_suppliers[i]["VatNumber"],"rowName",2);
    row.addCell(customers_suppliers[i]["FiscalNumber"],"rowName",6);
    for (var j in customers_suppliers[i].rows) {
      var jsonObj = customers_suppliers[i].rows[j];
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
      if (!Banana.SDecimal.isZero(value))
        value = Banana.SDecimal.abs(value);
      row.addCell(Banana.Converter.toLocaleNumberFormat(value,2,false), "row amount");
      value = jsonObj["IT_ImportoIva"];
      if (!Banana.SDecimal.isZero(value))
        value = Banana.SDecimal.abs(value);
      row.addCell(Banana.Converter.toLocaleNumberFormat(value,2,false), "row amount");
      row.addCell(Banana.Converter.toLocaleNumberFormat(jsonObj["IT_Aliquota"],2,false), "row amount");
      row.addCell(jsonObj["IT_Natura"], "row amount");
      row.addCell(Banana.Converter.toLocaleNumberFormat(jsonObj["IT_Detraibile"],2,false), "row amount");
      row.addCell(jsonObj["IT_Deducibile"], "row amount");
    }
  }
}

function saveData(output, param) {
  var codiceFiscale = param.datiContribuente.codiceFiscale;
  if (codiceFiscale.length<=0)
    codiceFiscale = "99999999999";
  var fileName = "IT" + codiceFiscale + "_DF_" + param.progressivoInvio + ".xml";
  fileName = Banana.IO.getSaveFileName("Save as", fileName, "XML file (*.xml);;All files (*)")
  if (fileName.length) {
    var file = Banana.IO.getLocalFile(fileName)
    file.write(output);
    if (file.errorString) {
      Banana.Ui.showInformation("Write error", file.errorString);
    }
    else {
      Banana.IO.openUrl(fileName);
    }
  }
}

function setStyle(report, stylesheet) {
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

function verifyParam(param) {
  if(!param.codicefiscaleDichiarante)
    param.codicefiscaleDichiarante = '';
  if(!param.codiceCarica)
    param.codiceCarica = '';
  if (!param.blocco)
    param.blocco = 'DTE';
  if(!param.progressivoInvio)
    param.progressivoInvio = '';
  if (!param.esigibilitaIva)
    param.esigibilitaIva = false;
  if (!param.idFile)
    param.idFile = '';

  if (!param.annoSelezionato)
    param.annoSelezionato = '';
  if (!param.periodoSelezionato)
    param.periodoSelezionato = 'm';
  if (!param.periodoValoreMese)
    param.periodoValoreMese = '';
  if (!param.periodoValoreTrimestre)
    param.periodoValoreTrimestre = '';
  if (!param.periodoValoreSemestre)
    param.periodoValoreSemestre = '';

  if (!param.outputScript)
    param.outputScript = 0;
  return param;
}

/**
* output integers with leading zeros
*/
function zeroPad(num, places) {
    if (num.toString().length > places)
        num = 0;
    var zero = places - num.toString().length + 1;
    return Array(+(zero > 0 && zero)).join("0") + num;
}
