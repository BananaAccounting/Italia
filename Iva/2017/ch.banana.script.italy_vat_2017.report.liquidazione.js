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
// @id = ch.banana.script.italy_vat_2017.report.liquidazione.js
// @description = Comunicazione periodica IVA...
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

function exec(inData, options) {

  if (!Banana.document)
    return "@Cancel";
  
  // Check version
  if (typeof (Banana.IO) === 'undefined') {
    var msg = getErrorMessage(ID_ERR_VERSIONE);
    msg = msg.replace("%1", "Banana.IO" );
    Banana.document.addMessage( msg, ID_ERR_VERSIONE);
    return "@Cancel";
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

  var liquidazionePeriodica = new LiquidazionePeriodica(Banana.document);
  liquidazionePeriodica.setParam(param);
  liquidazionePeriodica.loadData();
  
  var output = liquidazionePeriodica.createInstance();

  if (liquidazionePeriodica.param.outputScript==0 && output != "@Cancel"){
    var report = Banana.Report.newReport("Liquidazione periodica IVA");
    var stylesheet = Banana.Report.newStyleSheet();
    liquidazionePeriodica.printDocument(report, stylesheet);
    Banana.Report.preview(report, stylesheet);
    return;
  }
  else if (liquidazionePeriodica.param.outputScript==1 && output != "@Cancel") {
    //xml file
    output = formatXml(output);
    liquidazionePeriodica.saveData(output);
    return;
  }

  //return xml content
  return output;
}

/*
 * Update script's parameters
*/
function settingsDialog() {

  var liquidazione = new LiquidazionePeriodica(Banana.document);
  var savedParam = Banana.document.getScriptSettings();
  if (savedParam.length > 0) {
    liquidazione.setParam(JSON.parse(savedParam));
  }
  var accountingData = {};
  accountingData.datiContribuente = new DatiContribuente(Banana.document).readParam();
  accountingData = new Utils(Banana.document).readAccountingData(accountingData);
  if (liquidazione.param.annoSelezionato.length<=0)
    liquidazione.param.annoSelezionato = accountingData.openingYear;

  var dialog = Banana.Ui.createUi("ch.banana.script.italy_vat_2017.report.liquidazione.dialog.ui");
  //Groupbox periodo
  var index = 0;
  if (liquidazione.param.periodoSelezionato == 'm')
    index = parseInt(liquidazione.param.periodoValoreMese);
  else if (liquidazione.param.periodoSelezionato == 'q')
    index = parseInt(liquidazione.param.periodoValoreTrimestre) + 13;
  else if (liquidazione.param.periodoSelezionato == 's')
    index = parseInt(liquidazione.param.periodoValoreSemestre) + 19;
  else if (liquidazione.param.periodoSelezionato == 'y')
    index = 22;
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
    if (elencoAnni[i].indexOf(liquidazione.param.annoSelezionato)>=0) {
      index = i;
      break;
    }
  }
  dialog.periodoGroupBox.annoComboBox.currentIndex = index;
  
  
  //Groupbox comunicazione
  dialog.intestazioneGroupBox.cfLabel_2.text = accountingData.datiContribuente.codiceFiscale;
  dialog.intestazioneGroupBox.partitaIvaLabel_2.text = accountingData.datiContribuente.partitaIva;
  var accountingYear = accountingData.openingYear;
  if (accountingYear != accountingData.closureYear)
    accountingYear +=  "-" + accountingData.closureYear;
  dialog.intestazioneGroupBox.annoImpostaLabel_2.text = accountingYear;

  var progressivo = parseInt(liquidazione.param.comunicazioneProgressivo, 10);
  if (!progressivo)
    progressivo = 1;
  else if (liquidazione.param.outputScript==1)
    progressivo += 1;
  progressivo = new Utils(this.banDocument).zeroPad(progressivo, 5);
  dialog.intestazioneGroupBox.progressivoInvioLineEdit.text = progressivo;
  dialog.intestazioneGroupBox.cfDichiaranteLineEdit.text = liquidazione.param.comunicazioneCFDichiarante;
  dialog.intestazioneGroupBox.codiceCaricaComboBox.currentIndex = liquidazione.param.comunicazioneCodiceCaricaDichiarante;
  dialog.intestazioneGroupBox.cfIntermediarioLineEdit.text = liquidazione.param.comunicazioneCFIntermediario;
  dialog.intestazioneGroupBox.impegnoComboBox.currentIndex = liquidazione.param.comunicazioneImpegno;
  dialog.intestazioneGroupBox.firmaDichiarazioneCheckBox.checked = liquidazione.param.comunicazioneFirmaDichiarazione;
  dialog.intestazioneGroupBox.firmaIntermediarioCheckBox.checked = liquidazione.param.comunicazioneFirmaIntermediario;
  var dataImpegno = Banana.Converter.stringToDate(liquidazione.param.comunicazioneImpegnoData, "YYYY-MM-DD");
  dialog.intestazioneGroupBox.dataImpegnoDateEdit.setDate(dataImpegno);
  var ultimoMese = liquidazione.param.comunicazioneUltimoMese;
  if (ultimoMese == '13')
    ultimoMese = '12';
  else if (ultimoMese == '99')
    ultimoMese = '13';
  dialog.intestazioneGroupBox.ultimoMeseComboBox.currentIndex = ultimoMese;
  
  //Groupbox stampa
  if (liquidazione.param.outputScript==1)
    dialog.stampaGroupBox.stampaXmlRadioButton.checked = true;
  else  
    dialog.stampaGroupBox.stampaReportRadioButton.checked = true;

  //dialog functions
  dialog.checkdata = function () {
    dialog.accept();
  }
  dialog.enableButtons = function () {
  }
  dialog.showHelp = function () {
    Banana.Ui.showHelp("ch.banana.script.italy_vat_2017.report.liquidazione.dialog.ui");
  }
  var index='';
  dialog.buttonBox.accepted.connect(dialog, dialog.checkdata);
  dialog.buttonBox.helpRequested.connect(dialog, dialog.showHelp);
  //dialog.liquidazioneGroupBox.tipoVersamentoComboBox['currentIndexChanged(QString)'].connect(dialog, dialog.enableButtons);
  //dialog.periodoGroupBox.trimestreRadioButton.clicked.connect(dialog, dialog.enableButtons);
  //dialog.periodoGroupBox.meseRadioButton.clicked.connect(dialog, dialog.enableButtons);
  
  //Visualizzazione dialogo
  Banana.application.progressBar.pause();
  dialog.enableButtons();
  var dlgResult = dialog.exec();
  Banana.application.progressBar.resume();
  if (dlgResult !== 1)
    return false;

  //Salvataggio dati
  //Groupbox periodo
  var index = parseInt(dialog.periodoGroupBox.periodoComboBox.currentIndex.toString());
  if (index < 0 || index == 12 || index == 18 || index == 21)
    index = 0;
  if (index < 12) {
    liquidazione.param.periodoSelezionato = 'm';
    liquidazione.param.periodoValoreMese = index.toString();
  }
  else if (index > 12 && index < 18) {
    liquidazione.param.periodoSelezionato = 'q';
    liquidazione.param.periodoValoreTrimestre = (index-13).toString();
  }
  else if (index > 18 && index < 21) {
    liquidazione.param.periodoSelezionato = 's';
    liquidazione.param.periodoValoreSemestre = (index-19).toString();
  }
  else {
    liquidazione.param.periodoSelezionato = 'y';
  }
  //Groupbox anno
  var index = parseInt(dialog.periodoGroupBox.annoComboBox.currentIndex.toString());
  liquidazione.param.annoSelezionato = dialog.periodoGroupBox.annoComboBox.currentText;;
  
  //Groupbox comunicazione
  progressivo = dialog.intestazioneGroupBox.progressivoInvioLineEdit.text;
  progressivo = parseInt(progressivo, 10);
  if (!progressivo)
    progressivo = 1;
  liquidazione.param.comunicazioneProgressivo = new Utils(this.banDocument).zeroPad(progressivo, 5);
  liquidazione.param.comunicazioneCFDichiarante = dialog.intestazioneGroupBox.cfDichiaranteLineEdit.text;
  liquidazione.param.comunicazioneCodiceCaricaDichiarante = dialog.intestazioneGroupBox.codiceCaricaComboBox.currentIndex.toString();
  liquidazione.param.comunicazioneCFIntermediario = dialog.intestazioneGroupBox.cfIntermediarioLineEdit.text;
  liquidazione.param.comunicazioneImpegno = dialog.intestazioneGroupBox.impegnoComboBox.currentIndex.toString();
  dataImpegno = dialog.intestazioneGroupBox.dataImpegnoDateEdit.text;
  liquidazione.param.comunicazioneImpegnoData = Banana.Converter.toInternalDateFormat(dataImpegno);
  liquidazione.param.comunicazioneFirmaDichiarazione = dialog.intestazioneGroupBox.firmaDichiarazioneCheckBox.checked;
  liquidazione.param.comunicazioneFirmaIntermediario = dialog.intestazioneGroupBox.firmaIntermediarioCheckBox.checked;
  liquidazione.param.comunicazioneUltimoMese = dialog.intestazioneGroupBox.ultimoMeseComboBox.currentIndex.toString();
  if (liquidazione.param.comunicazioneUltimoMese == '12')
    liquidazione.param.comunicazioneUltimoMese = '13';
  else if (liquidazione.param.comunicazioneUltimoMese == '13')
    liquidazione.param.comunicazioneUltimoMese = '99';

  //Groupbox stampa
  if (dialog.stampaGroupBox.stampaXmlRadioButton.checked)
    liquidazione.param.outputScript = 1;
  else
    liquidazione.param.outputScript = 0;

  var paramToString = JSON.stringify(liquidazione.param);
  Banana.document.setScriptSettings(paramToString);
  return true;
}

function LiquidazionePeriodica(banDocument) {
  this.banDocument = banDocument;
  if (this.banDocument === undefined)
    this.banDocument = Banana.document;
  this.initParam();
}

LiquidazionePeriodica.prototype.addPageHeader = function(report, stylesheet) {
  // Page header
  var pageHeader = report.getHeader();

  //Tabella
  var table = pageHeader.addTable("header_table");
  table.addColumn("header_col_left");
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
  
  //cell_right
  var cell_right = row.addCell("", "header_cell_right");
  cell_right.addParagraph("Comunicazione periodica IVA", "right");
  var pDate = cell_right.addParagraph(Banana.Converter.toLocaleDateFormat(new Date()), "right");
  pDate.excludeFromTest();
  cell_right.addParagraph(" Pagina ", "right").addFieldPageNr();
 
  //add style
  stylesheet.addStyle(".header_table", "margin-top:1em;width:100%;");
  stylesheet.addStyle(".header_col_left", "width:50%");
  stylesheet.addStyle(".header_col_right", "width:49%");
  stylesheet.addStyle(".header_cell_left", "font-size:8px");
  stylesheet.addStyle(".header_cell_right", "font-size:8px");
  stylesheet.addStyle(".period", "padding-bottom: 1em;");
  stylesheet.addStyle(".right", "text-align: right;");
}

/*
*  Avvisa se l'interesse calcolato dal progrogramma è diverso dagli interessi registrati
*  creaPeriodi = false, riprende gli interessi del periodo
*  creaPeriodi = true, crea i periodi per l'anno e somma gli interessi
*/
LiquidazionePeriodica.prototype.calculateInterestAmount = function(period) {
 /*inizio test
    //controlla se il periodo è maggiore ad un trimestre
    var millisecondsPerDay = 24 * 60 * 60 * 1000;
    var startDate = Banana.Converter.stringToDate(period.startDate, "YYYY-MM-DD");
    var endDate = Banana.Converter.stringToDate(period.endDate, "YYYY-MM-DD");
    var totDays = (endDate - startDate)/millisecondsPerDay;
  fine test*/
  return this.calculateInterestAmount(period, false);
}

LiquidazionePeriodica.prototype.calculateInterestAmount = function(period, createPeriods) {
  var message = {};
  message.text = "";
  message.id = "";
  var amountInterestsCalculated = 0;
  var amountInterests = Banana.SDecimal.abs(period["L-INT"].vatPosted);
  var liqTipoVersamento = parseInt(period.datiContribuente.liqTipoVersamento);
  if (!liqTipoVersamento)
    liqTipoVersamento = 0;

  //interessi solo per iva trimestrale
  if (liqTipoVersamento == 1) {

     var totalWithoutInterests = period["TotalWithoutInterests"].vatPosted;
     var percInterest = Banana.SDecimal.round(period.datiContribuente.liqPercInteressi, {'decimals':2});

    //se periodo annuale gli interessi vengono suddivisi in quattro trimestri e sommati
    if (this.param.periodoSelezionato && this.param.periodoSelezionato == "y" && createPeriods) {
      var utils = new Utils(this.banDocument);
      var periods = utils.createPeriods(this.param);
      for (var i=0; i<periods.length; i++) {
        var vatAmounts = this.loadVatCodes(periods[i].startDate, periods[i].endDate);
        totalWithoutInterests = vatAmounts["TotalWithoutInterests"].vatPosted;
        if (Banana.SDecimal.sign(totalWithoutInterests)<=0) {
          var calculated = Banana.SDecimal.abs(totalWithoutInterests) * percInterest /100;
          calculated = Banana.SDecimal.roundNearest(calculated, '0.01');
          amountInterestsCalculated = Banana.SDecimal.add(calculated, amountInterestsCalculated);
        }
     }
    }
    else {
      if (Banana.SDecimal.sign(totalWithoutInterests)<=0) {
        amountInterestsCalculated = Banana.SDecimal.abs(totalWithoutInterests) * percInterest /100;
        amountInterestsCalculated = Banana.SDecimal.roundNearest(amountInterestsCalculated, '0.01');
      }
    }
  }

  if (liqTipoVersamento == 1 && amountInterests != amountInterestsCalculated) {
    message.id = ID_ERR_LIQUIDAZIONE_INTERESSI_DIFFERENTI;
    message.text = getErrorMessage(message.id);
    message.text = message.text.replace("%1", amountInterestsCalculated );
    message.text = message.text.replace("%2", Banana.SDecimal.round(period.datiContribuente.liqPercInteressi, {'decimals':2}) );
    message.text = message.text.replace("%3", amountInterests );
  }
  else if (liqTipoVersamento == 0 && !Banana.SDecimal.isZero(amountInterests)) {
    message.id = ID_ERR_LIQUIDAZIONE_INTERESSI_VERSAMENTO_MENSILE;
    message.text = getErrorMessage(message.id);
  }

  return message;
}

LiquidazionePeriodica.prototype.createInstance = function() {
  //<Intestazione>
  var xbrlIntestazione = this.createInstanceIntestazione();

  //<Comunicazione>
  var xbrlComunicazione = this.createInstanceComunicazione();

  if (xbrlIntestazione.length<=0 || xbrlComunicazione.length<=0)
    return "@Cancel";

  //<Fornitura> root element
  var xbrlContent = xbrlIntestazione + xbrlComunicazione;
  var attrsNamespaces = {};
  for (var j in this.param.namespaces) {
    var prefix = this.param.namespaces[j]['prefix'];
    var namespace = this.param.namespaces[j]['namespace'];
    if (prefix.length > 0)
      attrsNamespaces[prefix] = namespace;
  }
  for (var j in this.param.schemaRefs) {
    var schema = this.param.schemaRefs[j];
    if (schema.length > 0) {
      if (!attrsNamespaces['xsi:schemaLocation'])
        attrsNamespaces['xsi:schemaLocation'] = '';
      else if (attrsNamespaces['xsi:schemaLocation'].length>0)
        attrsNamespaces['xsi:schemaLocation'] += " ";
      attrsNamespaces['xsi:schemaLocation'] = attrsNamespaces['xsi:schemaLocation'] + schema;
    }
  }
  xbrlContent = xml_createElement("iv:Fornitura", xbrlContent, attrsNamespaces);

  //Output
  var results = [];
  results.push("<?xml version=\"1.0\" encoding=\"UTF-8\"?>");
  results.push(xbrlContent);
  return results.join ('');

}

LiquidazionePeriodica.prototype.createInstanceComunicazione = function() {
  var msgContext = '<iv:Frontespizio>';

  var codiceFiscale = this.param.datiContribuente.codiceFiscale;
  var partitaIva = this.param.datiContribuente.partitaIva;
  var xbrlCodiceFiscale = xml_createElementWithValidation("iv:CodiceFiscale", codiceFiscale,1,'11...16',msgContext);
  
  var xbrlAnnoImposta = xml_createElementWithValidation("iv:AnnoImposta", this.param.annoSelezionato,1,'4',msgContext);
  var xbrlPartitaIva = xml_createElementWithValidation("iv:PartitaIVA", partitaIva,1,'11',msgContext);

  var xbrlUltimoMese = '';
  if (parseInt(this.param.comunicazioneUltimoMese)>0) {
    xbrlUltimoMese = xml_createElementWithValidation("iv:UltimoMese", this.param.comunicazioneUltimoMese, 0, '1...2', msgContext);
  }
  
  var xbrlCFDichiarante = '';
  if (this.param.comunicazioneCFDichiarante.length>0)
    xbrlCFDichiarante = xml_createElementWithValidation("iv:CFDichiarante", xml_escapeString(this.param.comunicazioneCFDichiarante), 0, '16', msgContext);

  var xbrlCodiceCaricaDichiarante = '';
  if (parseInt(this.param.comunicazioneCodiceCaricaDichiarante)>0)
    xbrlCodiceCaricaDichiarante = xml_createElementWithValidation("iv:CodiceCaricaDichiarante", this.param.comunicazioneCodiceCaricaDichiarante, 0, '1...2', msgContext);

  var xbrlCFIntermediario = '';
  if (this.param.comunicazioneCFIntermediario.length>0)
    xbrlCFIntermediario = xml_createElementWithValidation("iv:CFIntermediario", xml_escapeString(this.param.comunicazioneCFIntermediario), 0, '11...16', msgContext);

  var xbrlImpegno = '';
  var xbrlDataImpegno = '';
  if (this.param.comunicazioneImpegno.length>0) {
    xbrlImpegno = xml_createElementWithValidation("iv:ImpegnoPresentazione", xml_escapeString(this.param.comunicazioneImpegno), 0, '1', msgContext);
    if (this.param.comunicazioneImpegnoData.length==10) {
      var anno = this.param.comunicazioneImpegnoData.substr(0,4);
      var mese = this.param.comunicazioneImpegnoData.substr(5,2);
      var giorno = this.param.comunicazioneImpegnoData.substr(8,2);
      var dataImpegno = giorno+mese+anno;
      xbrlDataImpegno = xml_createElementWithValidation("iv:DataImpegno", dataImpegno, 0, '8', msgContext);
    }
  }

  var firmaDichiarazione = "0";
  if (this.param.comunicazioneFirmaDichiarazione)
    firmaDichiarazione = "1";
  var xbrlFirmaDichiarazione = xml_createElement("iv:FirmaDichiarazione", firmaDichiarazione);

  var firmaIntermediario = "0";
  if (this.param.comunicazioneFirmaIntermediario)
    firmaIntermediario = "1";
  var xbrlFirmaIntermediario = xml_createElement("iv:FirmaIntermediario", firmaIntermediario);

  var xbrlContent = xbrlCodiceFiscale + xbrlAnnoImposta + xbrlPartitaIva + xbrlUltimoMese + xbrlCFDichiarante + xbrlCodiceCaricaDichiarante + xbrlFirmaDichiarazione + 
    xbrlCFIntermediario + xbrlImpegno + xbrlDataImpegno + xbrlFirmaIntermediario;
  
  var xbrlFrontespizio = xml_createElement("iv:Frontespizio", xbrlContent);
  
  if (this.param.vatPeriods.length>5) {
    //messaggio errore max 5 moduli
  }

  var xbrlModulo = '';
  for (var index=0; index<this.param.vatPeriods.length; index++) {
    xbrlModulo += this.createInstanceModulo(this.param.vatPeriods[index], index);
  }

  var xbrlDatiContabili =  xml_createElement("iv:DatiContabili", xbrlModulo);
  
  xbrlContent = xbrlFrontespizio + xbrlDatiContabili;

  var xbrlComunicazione =  xml_createElement("iv:Comunicazione", xbrlContent, {'identificativo':this.param.comunicazioneProgressivo});
  return xbrlComunicazione;

}

LiquidazionePeriodica.prototype.createInstanceIntestazione = function() {
  var msgContext = '<Intestazione>';
  
  var annoFornitura = this.param.annoSelezionato;
  if (!annoFornitura || annoFornitura.length < 4)
    annoFornitura = "";
  if (annoFornitura.length>2)
    annoFornitura = annoFornitura.substring(2);
  var xbrlCodiceFornitura = xml_createElement("iv:CodiceFornitura", "IVP" + annoFornitura);

  var xbrlCodiceFiscaleDichiarante = '';
  if (this.param.comunicazioneCFDichiarante.length>0)
    xbrlCodiceFiscaleDichiarante = xml_createElementWithValidation("iv:CodiceFiscaleDichiarante", xml_escapeString(this.param.comunicazioneCFDichiarante), 0, '16', msgContext);

  var xbrlCodiceCarica = '';
  if (parseInt(this.param.comunicazioneCodiceCaricaDichiarante)>0)
    xbrlCodiceCarica = xml_createElementWithValidation("iv:CodiceCarica", this.param.comunicazioneCodiceCaricaDichiarante, 0, '1...2', msgContext);

  var xbrlContent =  xbrlCodiceFornitura + xbrlCodiceFiscaleDichiarante + xbrlCodiceCarica;
  
  var xbrlIntestazione =  xml_createElement("iv:Intestazione", xbrlContent);
  return xbrlIntestazione;
}

LiquidazionePeriodica.prototype.createInstanceModulo = function(period, index) {
  var msgContext = '<iv:Modulo>';

  //NumeroModulo vale da 1 a 5 solo a partire dal 2018,nel 2017 il campo non era presente
  //Ogni Comunicazione può contenere più moduli, sempre partendo da 1
  //Es. comunicazione del primo trimestre: mese 1 su modulo 1, mese 2 su modulo 2 e mese 3 su modulo 3.
  //Comunicazione secondo trimestre: mese 4 su modulo 1, mese 5 su modulo 2, mese 6 su modulo 3.
  var xbrlNumeroModulo = '';
  if (this.param.annoSelezionato && this.param.annoSelezionato >= 2018) {
    var numeroModulo = index+1;
    if (!numeroModulo || numeroModulo<=0)
      numeroModulo = 1;
    if (numeroModulo>5)
      numeroModulo = 5;
    xbrlNumeroModulo = xml_createElementWithValidation("iv:NumeroModulo", numeroModulo,1,'1',msgContext);
  }
  
  var xbrlMese = '';
  var xbrlTrimestre = '';
  if (period.datiContribuente.liqTipoVersamento == 0)
    xbrlMese = xml_createElementWithValidation("iv:Mese", this.getPeriod("m", period),0,'1...2',msgContext);
  else
    xbrlTrimestre = xml_createElementWithValidation("iv:Trimestre", this.getPeriod("q", period),0,'1',msgContext);

  var xbrlTotaleOperazioniAttive = xml_createElementWithValidation("iv:TotaleOperazioniAttive", this.createInstanceModuloGetVatAmount("OPATTIVE", "vatTaxable", period),0,'4...16',msgContext);

  var xbrlTotaleOperazioniPassive = xml_createElementWithValidation("iv:TotaleOperazioniPassive", this.createInstanceModuloGetVatAmount("OPPASSIVE", "vatTaxable", period),0,'4...16',msgContext);

  var xbrlIvaEsigibile = xml_createElementWithValidation("iv:IvaEsigibile", this.createInstanceModuloGetVatAmount("OPATTIVE", "vatPosted", period),0,'4...16',msgContext);

  var xbrlIvaDetratta = xml_createElementWithValidation("iv:IvaDetratta", this.createInstanceModuloGetVatAmount("OPPASSIVE", "vatPosted", period),0,'4...16',msgContext);

  var xbrlIvaDovuta = '';
  var xbrlIvaCredito = '';
  if (Banana.SDecimal.sign(period["OPDIFFERENZA"].vatPosted)<0)
    xbrlIvaDovuta = xml_createElementWithValidation("iv:IvaDovuta", this.createInstanceModuloGetVatAmount("OPDIFFERENZA", "vatPosted", period),0,'4...16',msgContext);
  else
    xbrlIvaCredito = xml_createElementWithValidation("iv:IvaCredito", this.createInstanceModuloGetVatAmount("OPDIFFERENZA", "vatPosted", period),0,'4...16',msgContext);

  var xbrlDebitoPeriodoPrecedente = '';
  var xbrlCreditoPeriodoPrecedente = '';
  if (Banana.SDecimal.sign(period["L-CI"].vatPosted)<0)
    xbrlDebitoPeriodoPrecedente = xml_createElementWithValidation("iv:DebitoPrecedente", this.createInstanceModuloGetVatAmount("L-CI", "vatPosted", period),0,'4...16',msgContext);
  else
    xbrlCreditoPeriodoPrecedente = xml_createElementWithValidation("iv:CreditoPeriodoPrecedente", this.createInstanceModuloGetVatAmount("L-CI", "vatPosted", period),0,'4...16',msgContext);

  var xbrlCreditoAnnoPrecedente = xml_createElementWithValidation("iv:CreditoAnnoPrecedente", this.createInstanceModuloGetVatAmount("L-CIA", "vatPosted", period),0,'4...16',msgContext);

  //disabilita controllo interessi nel periodo iv trimestre iva speciali
  if (this.getPeriod("q", period)!="4") {
    var msg = this.calculateInterestAmount(period);
    if (msg.id.length>0)
      this.banDocument.addMessage( msg.text, msg.id);
  }
  
  //Riprende interessi con importo formattato
  var amountInteressi = this.createInstanceModuloGetVatAmount("L-INT", "vatPosted", period);
  var xbrlInteressiDovuti = xml_createElementWithValidation("iv:InteressiDovuti", amountInteressi,0,'4...16',msgContext);

  var xbrlAcconto = xml_createElementWithValidation("iv:Acconto", this.createInstanceModuloGetVatAmount("L-AC", "vatPosted", period),0,'4...16',msgContext);

  var xbrlImportoDaVersare = '';
  var xbrlImportoACredito = '';
  if (Banana.SDecimal.sign(period["Total"].vatPosted)<0)
    xbrlImportoDaVersare = xml_createElementWithValidation("iv:ImportoDaVersare", this.createInstanceModuloGetVatAmount("Total", "vatPosted", period),0,'4...16',msgContext);
  else
    xbrlImportoACredito = xml_createElementWithValidation("iv:ImportoACredito", this.createInstanceModuloGetVatAmount("Total", "vatPosted", period),0,'4...16',msgContext);

  xbrlContent = xbrlNumeroModulo + xbrlMese + xbrlTrimestre + xbrlTotaleOperazioniAttive + xbrlTotaleOperazioniPassive + xbrlIvaEsigibile + xbrlIvaDetratta + xbrlIvaDovuta + xbrlIvaCredito;
  xbrlContent += xbrlDebitoPeriodoPrecedente + xbrlCreditoPeriodoPrecedente + xbrlCreditoAnnoPrecedente + xbrlInteressiDovuti + xbrlAcconto + xbrlImportoDaVersare + xbrlImportoACredito;
  var xbrlModulo = xml_createElement("iv:Modulo", xbrlContent);
  return xbrlModulo;
}

LiquidazionePeriodica.prototype.createInstanceModuloGetVatAmount = function(vatCode, column, period) {
  if (vatCode.length<=0)
    return "";
  var amount = "";
  if (column == "vatTaxable")
    amount = period[vatCode].vatTaxable;
  else if (column == "vatAmount")
    amount = period[vatCode].vatAmount;
  else if (column == "vatPosted")
    amount = period[vatCode].vatPosted;
  else if (column == "vatNotDeductible")
    amount = period[vatCode].vatNotDeductible;
  if (Banana.SDecimal.isZero(amount))
    return "";
  amount = Banana.SDecimal.abs(amount);
  //amount = Banana.SDecimal.roundNearest(amount, '1');
  amount = amount.replace(".",",");
  return amount;
}

LiquidazionePeriodica.prototype.findVatCodes = function(table, column, code) {
  var vatCodes = [];
  for (var rowNr=0; rowNr < table.rowCount; rowNr++) {
    //var rowValue = table.value(rowNr, column).split(";");
    var rowValue = table.value(rowNr, column);
    if (rowValue.startsWith(code)) {
      var vatCode = table.value(rowNr, "VatCode");
      vatCodes.push(vatCode);
    }
  }
  return vatCodes;
}

LiquidazionePeriodica.prototype.getPeriod = function(format, period) {
  var fromDate = Banana.Converter.toDate(period.startDate);
  var toDate = Banana.Converter.toDate(period.endDate);
  var firstDayOfPeriod = 1;
  var lastDayOfPeriod = new Date(toDate.getFullYear(),toDate.getMonth()+1,0).getDate().toString();
  if (fromDate.getDate() != firstDayOfPeriod)
    return "";
  if (toDate.getDate() != lastDayOfPeriod)
    return "";
  if (format === "y") {
    if (fromDate.getFullYear() === toDate.getFullYear())
      return fromDate.getFullYear();
  }
  else if (format === "m") {
    if (fromDate.getMonth() === toDate.getMonth())
      return (fromDate.getMonth()+1).toString();
  }
  else if (format === "q") {
    var q = [1,2,3,4];
    var q1 = q[Math.floor(fromDate.getMonth() / 3)];  
    var q2 = q[Math.floor(toDate.getMonth() / 3)];  
    if (q1 === q2 && fromDate.getMonth() != toDate.getMonth()) {
      if (q1 == 4) {
       //La codifica export nel xml del IV trimestre è 5  
       //La codifica export nel xml del IV trimestre IVA speciali è 4
       //in periodoValoreTrimestre il primo trimestre è 0, il quarto è 3, il quarto speciale è 4
       //se è selezionato l'anno e il periodo corrisponde al 4. trimestre si ritorna 5
       if (this.param.periodoSelezionato == "q" && this.param.periodoValoreTrimestre == "3")
         return "5";
       else if (this.param.periodoSelezionato == "y")
         return "5";
      }
      return q1.toString();
    }
  }
  return "";
}

LiquidazionePeriodica.prototype.getVatTotalFromBanana = function(startDate, endDate) {
  var total =  {
  vatAmount : "",
  vatTaxable : "",
  vatNotDeductible : "",
  vatPosted : ""
  };

  var tableVatReport = this.banDocument.vatReport(startDate, endDate);
  var totalRow = tableVatReport.findRowByValue("Group", "_tot_");
  total.vatAmount = totalRow.value("VatAmount");
  total.vatTaxable = totalRow.value("VatTaxable");
  total.vatNotDeductible = totalRow.value("VatNonDeductible");
  total.vatPosted = totalRow.value("VatPosted");

  return total;
}

LiquidazionePeriodica.prototype.initNamespaces = function() {
  var ns = [
    {
      'namespace' : 'urn:www.agenziaentrate.gov.it:specificheTecniche:sco:ivp',
      'prefix' : 'xmlns:iv'
    },
    {
      'namespace' : 'http://www.w3.org/2000/09/xmldsig#',
      'prefix' : 'xmlns:ds'
    },
  ];
  return ns;
}

LiquidazionePeriodica.prototype.initParam = function() {
  this.param = {};

  this.param.comunicazioneProgressivo = '';
  this.param.comunicazioneCFDichiarante = '';
  this.param.comunicazioneCodiceCaricaDichiarante = '';
  this.param.comunicazioneCFIntermediario = '';
  this.param.comunicazioneImpegno = '';
  this.param.comunicazioneImpegnoData = '';
  this.param.comunicazioneFirmaDichiarazione = true;
  this.param.comunicazioneFirmaIntermediario = true;
  this.param.comunicazioneUltimoMese = '';

  this.param.annoSelezionato = '';
  this.param.periodoSelezionato = 'm';
  this.param.periodoValoreMese = '';
  this.param.periodoValoreTrimestre = '';
  this.param.periodoValoreSemestre = '';
  
  /*
  0 = create print preview report
  1 = create file xml 
  2 = return xml string */
  this.param.outputScript = 0;
  
  this.param.schemaRefs = this.initSchemarefs();
  this.param.namespaces = this.initNamespaces();
}

LiquidazionePeriodica.prototype.initSchemarefs = function() {
  var schemaRefs = [
    //'http://ivaservizi.agenziaentrate.gov.it/docs/xsd/fatture/v2.0 fornituraIvp_2017_v1.xsd',
   ];
  return schemaRefs;
};

LiquidazionePeriodica.prototype.loadData = function() {
  var utils = new Utils(this.banDocument);
  this.param = utils.readAccountingData(this.param);
  this.param.datiContribuente = new DatiContribuente(this.banDocument).readParam();
  this.param.vatPeriods = [];
  var periods = utils.createPeriods(this.param);
  for (var i=0; i<periods.length; i++) {
    var vatAmounts = this.loadVatCodes(periods[i].startDate, periods[i].endDate);
    this.param.vatPeriods.push(vatAmounts);
  }
}

LiquidazionePeriodica.prototype.loadVatCodes = function(_startDate, _endDate) {
  var vatAmounts = {};

  // V = Vendite
  var tableVatCodes = this.banDocument.table("VatCodes");
  var vatCodes = this.findVatCodes(tableVatCodes, "Gr", "V-IM-BA");
  vatAmounts["V-IM-BA"] = this.banDocument.vatCurrentBalance(vatCodes.join("|"), _startDate, _endDate);
  vatCodes = this.findVatCodes(tableVatCodes, "Gr", "V-IM-REV");
  vatAmounts["V-IM-REV"] = this.banDocument.vatCurrentBalance(vatCodes.join("|"), _startDate, _endDate);
  vatCodes = this.findVatCodes(tableVatCodes, "Gr", "V-IM-EU");
  vatAmounts["V-IM-EU"] = this.banDocument.vatCurrentBalance(vatCodes.join("|"), _startDate, _endDate);
  vatCodes = this.findVatCodes(tableVatCodes, "Gr", "V-IM-ES");
  vatAmounts["V-IM-ES"] = this.banDocument.vatCurrentBalance(vatCodes.join("|"), _startDate, _endDate);
  vatCodes = this.findVatCodes(tableVatCodes, "Gr", "V-IM");
  vatAmounts["V-IM"] = this.banDocument.vatCurrentBalance(vatCodes.join("|"), _startDate, _endDate);
  vatCodes = this.findVatCodes(tableVatCodes, "Gr", "V-NI-EU");
  vatAmounts["V-NI-EU"] = this.banDocument.vatCurrentBalance(vatCodes.join("|"), _startDate, _endDate);
  vatCodes = this.findVatCodes(tableVatCodes, "Gr", "V-NI");
  vatAmounts["V-NI"] = this.banDocument.vatCurrentBalance(vatCodes.join("|"), _startDate, _endDate);
  vatCodes = this.findVatCodes(tableVatCodes, "Gr", "V-ES");
  vatAmounts["V-ES"] = this.banDocument.vatCurrentBalance(vatCodes.join("|"), _startDate, _endDate);
  vatCodes = this.findVatCodes(tableVatCodes, "Gr", "V-NE");
  vatAmounts["V-NE"] = this.banDocument.vatCurrentBalance(vatCodes.join("|"), _startDate, _endDate);
  vatCodes = this.findVatCodes(tableVatCodes, "Gr", "V-ED");
  vatAmounts["V-ED"] = this.banDocument.vatCurrentBalance(vatCodes.join("|"), _startDate, _endDate);

  var vatAmountsTemp = {};
  vatCodes = this.findVatCodes(tableVatCodes, "Gr", "V-FC");
  vatAmountsTemp["V-FC"] = this.banDocument.vatCurrentBalance(vatCodes.join("|"), _startDate, _endDate);
  
  //Nel totale vendite i fuori campo vanno esclusi
  vatCodes = this.findVatCodes(tableVatCodes, "Gr", "V");
  vatAmounts["V"] = this.banDocument.vatCurrentBalance(vatCodes.join("|"), _startDate, _endDate);
  vatAmounts["V"] = this.substractVatAmounts(vatAmounts["V"], vatAmountsTemp["V-FC"], this.banDocument);

  // C = Corrispettivi
  vatCodes = this.findVatCodes(tableVatCodes, "Gr", "C-NVE");
  vatAmounts["C-NVE"] = this.banDocument.vatCurrentBalance(vatCodes.join("|"), _startDate, _endDate);
  vatCodes = this.findVatCodes(tableVatCodes, "Gr", "C-VEN");
  vatAmounts["C-VEN"] = this.banDocument.vatCurrentBalance(vatCodes.join("|"), _startDate, _endDate);
  vatCodes = this.findVatCodes(tableVatCodes, "Gr", "C-REG");
  vatAmounts["C-REG"] = this.banDocument.vatCurrentBalance(vatCodes.join("|"), _startDate, _endDate);
  //C-VEN non vengono sommati IN C perché devono essere registrati con il gruppo C-REG
  vatAmounts["C"] = this.sumVatAmounts(vatAmounts, ["C-NVE","C-REG"], this.banDocument);
  
  // A = Acquisti
  vatCodes = this.findVatCodes(tableVatCodes, "Gr", "A-IM-BA");
  vatAmounts["A-IM-BA"] = this.banDocument.vatCurrentBalance(vatCodes.join("|"), _startDate, _endDate);
  vatCodes = this.findVatCodes(tableVatCodes, "Gr", "A-IM-BN");
  vatAmounts["A-IM-BN"] = this.banDocument.vatCurrentBalance(vatCodes.join("|"), _startDate, _endDate);
  vatCodes = this.findVatCodes(tableVatCodes, "Gr", "A-IM-AL");
  vatAmounts["A-IM-AL"] = this.banDocument.vatCurrentBalance(vatCodes.join("|"), _startDate, _endDate);
  vatCodes = this.findVatCodes(tableVatCodes, "Gr", "A-IM-RI-REV-S");
  vatAmounts["A-IM-RI-REV-S"] = this.banDocument.vatCurrentBalance(vatCodes.join("|"), _startDate, _endDate);
  vatCodes = this.findVatCodes(tableVatCodes, "Gr", "A-IM-RI-REV");
  vatAmounts["A-IM-RI-REV"] = this.banDocument.vatCurrentBalance(vatCodes.join("|"), _startDate, _endDate);
  vatCodes = this.findVatCodes(tableVatCodes, "Gr", "A-IM-RI-EU-S");
  vatAmounts["A-IM-RI-EU-S"] = this.banDocument.vatCurrentBalance(vatCodes.join("|"), _startDate, _endDate);
  vatCodes = this.findVatCodes(tableVatCodes, "Gr", "A-IM-RI-EU");
  vatAmounts["A-IM-RI-EU"] = this.banDocument.vatCurrentBalance(vatCodes.join("|"), _startDate, _endDate);
  vatCodes = this.findVatCodes(tableVatCodes, "Gr", "A-IM-RI");
  vatAmounts["A-IM-RI"] = this.banDocument.vatCurrentBalance(vatCodes.join("|"), _startDate, _endDate);
  vatCodes = this.findVatCodes(tableVatCodes, "Gr", "A-IM");
  vatAmounts["A-IM"] = this.banDocument.vatCurrentBalance(vatCodes.join("|"), _startDate, _endDate);
  vatCodes = this.findVatCodes(tableVatCodes, "Gr", "A-NI-X");
  vatAmounts["A-NI-X"] = this.banDocument.vatCurrentBalance(vatCodes.join("|"), _startDate, _endDate);
  vatCodes = this.findVatCodes(tableVatCodes, "Gr", "A-NI");
  vatAmounts["A-NI"] = this.banDocument.vatCurrentBalance(vatCodes.join("|"), _startDate, _endDate);
  vatCodes = this.findVatCodes(tableVatCodes, "Gr", "A-ES");
  vatAmounts["A-ES"] = this.banDocument.vatCurrentBalance(vatCodes.join("|"), _startDate, _endDate);
  vatCodes = this.findVatCodes(tableVatCodes, "Gr", "A-NE");
  vatAmounts["A-NE"] = this.banDocument.vatCurrentBalance(vatCodes.join("|"), _startDate, _endDate);
  vatCodes = this.findVatCodes(tableVatCodes, "Gr", "A-ED");
  vatAmounts["A-ED"] = this.banDocument.vatCurrentBalance(vatCodes.join("|"), _startDate, _endDate);

  vatCodes = this.findVatCodes(tableVatCodes, "Gr", "A-FC");
  vatAmountsTemp["A-FC"] = this.banDocument.vatCurrentBalance(vatCodes.join("|"), _startDate, _endDate);
  
  //Nel totale acquisti i fuori campo vanno esclusi
  vatCodes = this.findVatCodes(tableVatCodes, "Gr", "A");
  vatAmounts["A"] = this.banDocument.vatCurrentBalance(vatCodes.join("|"), _startDate, _endDate);
  vatAmounts["A"] = this.substractVatAmounts(vatAmounts["A"], vatAmountsTemp["A-FC"], this.banDocument);
  
  //Calcola la liquidazione prorata sugli acquisti se presente
  /* i soggetti che esercitano un’attività che dà luogo sia ad operazioni imponibili, per le quali è previsto il diritto alla detrazione dell’IVA sugli acquisti, 
  * sia ad operazioni esenti, per le quali, invece, *  non è previsto il diritto alla detrazione dell’IVA sugli acquisti, devono determinare, ai sensi del 
  * successivo art. 19-bis, il cosiddetto pro-rata generale di detraibilità. 
  * Esso rappresenta una percentuale da applicare al totale dell’IVA sugli acquisti,
  * che, determina l’ammontare di imposta detraibile
  */
  if (!Banana.SDecimal.isZero(this.param.datiContribuente.liqPercProrata)) {
    var percProrata = Banana.SDecimal.round(this.param.datiContribuente.liqPercProrata, {'decimals':2});
    var amountProrata = Banana.SDecimal.abs(vatAmounts["A"].vatPosted) * percProrata /100;
    amountProrata = Banana.SDecimal.roundNearest(amountProrata, '0.01');
    vatAmounts["A"].vatPosted = amountProrata;
  }

  //Liquidazione
  vatAmounts["L-AC"] = this.banDocument.vatCurrentBalance("L-AC", _startDate, _endDate);
  vatAmounts["L-CI"] = this.banDocument.vatCurrentBalance("L-CI", _startDate, _endDate);
  vatAmounts["L-CIA"] = this.banDocument.vatCurrentBalance("L-CIA", _startDate, _endDate);
  vatAmounts["L-CO"] = this.banDocument.vatCurrentBalance("L-CO", this.param.accountingOpeningDate, _endDate);
  vatAmounts["L-INT"] = this.banDocument.vatCurrentBalance("L-INT", _startDate, _endDate);
  vatAmounts["L-RI"] = this.banDocument.vatCurrentBalance("L-RI", _startDate, _endDate);
  vatAmounts["L-SP"] = this.banDocument.vatCurrentBalance("L-SP", _startDate, _endDate);

  //se periodo liquidazione corrisponde all'intero anno i crediti periodo precedente non vengono inclusi
  //il credito anno precedente viene considerato solamente quello del primo periodo, alcuni utenti riportano il credito anno precedente ad ogni periodo
  var isYear = false;
  if (this.param.accountingOpeningDate == _startDate && this.param.accountingClosureDate == _endDate)
    isYear = true;

  var emptyAmount = {
  vatAmount : 0,
  vatTaxable : 0,
  vatNotDeductible : 0,
  vatPosted : 0
  };
  if (isYear) {
    //L-CI
    vatAmounts["L-CI"] = emptyAmount;
    //L-CIA
    //liqTipoVersamento == 0 mensile ==1 trimestrale
    //Se liquidazione annuale tiene conto solo delle registrazioni L-CIA del primo periodo
    var endDate = Banana.Converter.stringToDate(this.param.accountingOpeningDate, "YYYY-MM-DD");
    if (!Banana.SDecimal.isZero(this.param.datiContribuente.liqTipoVersamento)) {
      endDate.setDate(endDate.getDate() + 90);
    }
    else {
      endDate.setDate(endDate.getDate() + 30);
    }
    vatAmounts["L-CIA"] = this.banDocument.vatCurrentBalance("L-CIA", this.param.accountingOpeningDate, endDate);
  }

  // Get vat total for report
  vatAmounts["L"] = this.sumVatAmounts(vatAmounts, ["L-AC","L-CI","L-CIA","L-CO","L-INT","L-RI","L-SP"], this.banDocument);
  vatAmounts["Total"] = this.sumVatAmounts(vatAmounts, ["V","C","A","L"], this.banDocument);
  vatAmounts["TotalWithoutInterests"] = this.substractVatAmounts(vatAmounts["Total"], vatAmounts["L-INT"], this.banDocument);
  
  // Get vat total from Banana
  vatAmounts["BananaTotal"] = this.getVatTotalFromBanana(_startDate, _endDate, this.banDocument);
  
  // Calculate difference in totals between report and Banana
  vatAmounts["difference"] = this.substractVatAmounts(vatAmounts["Total"], vatAmounts["BananaTotal"]);

  //Operazioni attive
  vatAmounts["OPATTIVE"] = this.sumVatAmounts(vatAmounts, ["V","C","L-CO","L-RI","L-SP"], this.banDocument);

  //Operazioni passive
  vatAmounts["OPPASSIVE"] = this.sumVatAmounts(vatAmounts, ["A"], this.banDocument);
  
  //Differenza operazioni
  vatAmounts["OPDIFFERENZA"] = this.sumVatAmounts(vatAmounts, ["OPATTIVE","OPPASSIVE"], this.banDocument);
  
  /* just for printing */
  vatAmounts["V-IM-BA"].style = "total4";
  vatAmounts["V-IM-REV"].style = "total4";
  vatAmounts["V-IM-EU"].style = "total4";
  vatAmounts["V-IM-ES"].style = "total4";
  vatAmounts["V-IM"].style = "total3";
  vatAmounts["V-NI-EU"].style = "total4";
  vatAmounts["V-NI"].style = "total3";
  vatAmounts["V-ES"].style = "total4";
  vatAmounts["V-NE"].style = "total4";
  vatAmounts["V-ED"].style = "total4";
  vatAmounts["V"].style = "total2";

  vatAmounts["C-NVE"].style = "total3";
  vatAmounts["C-VEN"].style = "total3";
  vatAmounts["C-REG"].style = "total3";
  vatAmounts["C"].style = "total2";
  
  vatAmounts["A-IM-RI"].style = "total4";
  vatAmounts["A-IM-BA"].style = "total4";
  vatAmounts["A-IM-BN"].style = "total4";
  vatAmounts["A-IM-AL"].style = "total4";
  vatAmounts["A-IM-RI-REV"].style = "total4";
  vatAmounts["A-IM-RI-REV-S"].style = "total4";
  vatAmounts["A-IM-RI-EU"].style = "total4";
  vatAmounts["A-IM-RI-EU-S"].style = "total4";
  vatAmounts["A-IM"].style = "total3";
  vatAmounts["A-NI-X"].style = "total4";
  vatAmounts["A-NI"].style = "total3";
  vatAmounts["A-ES"].style = "total4";
  vatAmounts["A-NE"].style = "total4";
  vatAmounts["A-ED"].style = "total4";
  vatAmounts["A"].style = "total2";

  vatAmounts["L-AC"].style = "total3";
  vatAmounts["L-CI"].style = "total3";
  vatAmounts["L-CIA"].style = "total3";
  vatAmounts["L-INT"].style = "total3";
  vatAmounts["L"].style = "total2";

  vatAmounts["Total"].style = "total1";
  //vatAmounts["TotalDue"].style = "total1";
  vatAmounts["BananaTotal"].style = "total1";
  vatAmounts["difference"].style = "total4";

  vatAmounts.startDate = _startDate;
  vatAmounts.endDate = _endDate;
  vatAmounts.datiContribuente = {};
  vatAmounts.datiContribuente.liqTipoVersamento = this.param.datiContribuente.liqTipoVersamento;
  vatAmounts.datiContribuente.liqPercInteressi = this.param.datiContribuente.liqPercInteressi;
  vatAmounts.datiContribuente.liqPercProrata = this.param.datiContribuente.liqPercProrata;
  
  return vatAmounts;
}

LiquidazionePeriodica.prototype.printDocument = function(report, stylesheet) {
  //print preview
  this.addPageHeader(report, stylesheet);
  this.setStyle(report, stylesheet);

  //Data
  for (var index=0; index<this.param.vatPeriods.length; index++) {
    this.printVatReport1(report, stylesheet, this.param.vatPeriods[index]);
    this.printVatReport2(report, stylesheet, this.param.vatPeriods[index]);
    if (index+1<this.param.vatPeriods.length)
      report.addPageBreak();
  }
}

LiquidazionePeriodica.prototype.printVatReport1 = function(report, stylesheet, period) {
  //Period
  var periodText = "";
  if (this.getPeriod("q", period)=="4")
    periodText = " (IV trimestre IVA speciali)";
  report.addParagraph("Periodo: " + Banana.Converter.toLocaleDateFormat(period.startDate) + " - " + Banana.Converter.toLocaleDateFormat(period.endDate) + periodText, "period");
  
  //Print table
  var table = report.addTable("table1");
  var headerRow = table.getHeader().addRow();
  headerRow.addCell("Cod. IVA");
  headerRow.addCell("Imponibile", "amount");
  headerRow.addCell("Importo IVA", "amount");
  headerRow.addCell("IVA non deducibile", "amount");
  headerRow.addCell("IVA contabilizzata", "amount");

  //Print vat amounts
  for (var vatCode in period) {
    if (typeof period[vatCode] !== "object")
      continue;
    var sum = '';
    sum = Banana.SDecimal.add(sum, period[vatCode].vatTaxable);
    sum = Banana.SDecimal.add(sum, period[vatCode].vatAmount);
    sum = Banana.SDecimal.add(sum, period[vatCode].vatNotDeductible);
    sum = Banana.SDecimal.add(sum, period[vatCode].vatPosted);
    if (Banana.SDecimal.isZero(sum) || !period[vatCode].style)
      continue;
    var row = table.addRow();
    var description = vatCode;
    if (description == "A" && !Banana.SDecimal.isZero(period.datiContribuente.liqPercProrata))
      description += " (Prorata: " + Banana.SDecimal.round(period.datiContribuente.liqPercProrata, {'decimals':2}).toString() + "%)";
    row.addCell(description, "description " + period[vatCode].style);
    if (vatCode == "difference" || vatCode == "BananaTotal")
      row.addCell("","amount " + period[vatCode].style);
    else
      row.addCell(Banana.Converter.toLocaleNumberFormat(Banana.SDecimal.invert(period[vatCode].vatTaxable)), "amount " + period[vatCode].style);
    row.addCell(Banana.Converter.toLocaleNumberFormat(Banana.SDecimal.invert(period[vatCode].vatAmount)), "amount " + period[vatCode].style);
    row.addCell(Banana.Converter.toLocaleNumberFormat(Banana.SDecimal.invert(period[vatCode].vatNotDeductible)), "amount " + period[vatCode].style);
    row.addCell(Banana.Converter.toLocaleNumberFormat(Banana.SDecimal.invert(period[vatCode].vatPosted)), "amount " + period[vatCode].style);
  }
}

LiquidazionePeriodica.prototype.printVatReport2 = function(report, stylesheet, period) {
  //Period
  var periodText = "";
  if (this.getPeriod("q", period)=="4")
    periodText = " (IV trimestre IVA speciali)";
  report.addParagraph("Periodo: " + Banana.Converter.toLocaleDateFormat(period.startDate) + " - " + Banana.Converter.toLocaleDateFormat(period.endDate) + periodText, "period");

  //Print table
  var table = report.addTable("table2");
  /*var headerRow = table.getHeader().addRow();
  headerRow.addCell("");
  headerRow.addCell("");
  headerRow.addCell("");
  headerRow.addCell("");*/

  //Print vat amounts
  var row = table.addRow();
  row.addCell("VP2");
  row.addCell("Totale operazioni attive (al netto dell'IVA)", "description");
  row.addCell(Banana.Converter.toLocaleNumberFormat(Banana.SDecimal.abs(period["OPATTIVE"].vatTaxable)), "amount");
  row.addCell("");

  row = table.addRow();
  row.addCell("VP3");
  row.addCell("Totale operazioni passive (al netto dell'IVA)", "description");
  row.addCell(Banana.Converter.toLocaleNumberFormat(Banana.SDecimal.abs(period["OPPASSIVE"].vatTaxable)), "amount");
  row.addCell("");

  row = table.addRow();
  row.addCell("VP4");
  row.addCell("IVA esigibile", "description");
  row.addCell(Banana.Converter.toLocaleNumberFormat(Banana.SDecimal.abs(period["OPATTIVE"].vatPosted)), "amount");
  row.addCell("");
  
  row = table.addRow();
  row.addCell("VP5");
  var description = "IVA detratta";
  if (!Banana.SDecimal.isZero(period.datiContribuente.liqPercProrata))
    description = "IVA detratta (Prorata: " + Banana.SDecimal.round(period.datiContribuente.liqPercProrata, {'decimals':2}).toString() + "%)";
  row.addCell(description, "description");
  row.addCell(Banana.Converter.toLocaleNumberFormat(Banana.SDecimal.abs(period["OPPASSIVE"].vatPosted)), "amount");
  row.addCell("");

  row = table.addRow();
  row.addCell("VP6");
  if (Banana.SDecimal.sign(period["OPDIFFERENZA"].vatPosted)<=0)
    row.addCell("IVA dovuta", "description");
  else
    row.addCell("IVA a credito", "description");
  row.addCell(Banana.Converter.toLocaleNumberFormat(Banana.SDecimal.abs(period["OPDIFFERENZA"].vatPosted)), "amount");
  row.addCell("");
  
  row = table.addRow();
  row.addCell("VP7");
  row.addCell("Debito periodo precedente", "description");
  if (Banana.SDecimal.sign(period["L-CI"].vatPosted)<=0)
    row.addCell(Banana.Converter.toLocaleNumberFormat(Banana.SDecimal.abs(period["L-CI"].vatPosted)), "amount");
  else
    row.addCell("", "amount");
  row.addCell("");

  row = table.addRow();
  row.addCell("VP8");
  row.addCell("Credito periodo precedente", "description");
  if (Banana.SDecimal.sign(period["L-CI"].vatPosted)>=0)
    row.addCell(Banana.Converter.toLocaleNumberFormat(Banana.SDecimal.abs(period["L-CI"].vatPosted)), "amount");
  else
    row.addCell("", "amount");
  row.addCell("");

  row = table.addRow();
  row.addCell("VP9");
  row.addCell("Credito anno precedente", "description");
  row.addCell(Banana.Converter.toLocaleNumberFormat(Banana.SDecimal.abs(period["L-CIA"].vatPosted)), "amount");
  row.addCell("");

  row = table.addRow();
  row.addCell("VP10");
  row.addCell("Versamenti auto UE", "description");
  row.addCell("", "amount");
  row.addCell("");

  row = table.addRow();
  row.addCell("VP11");
  row.addCell("Crediti d'imposta", "description");
  row.addCell("", "amount");
  row.addCell("");

  row = table.addRow();
  row.addCell("VP12");
  row.addCell("Interessi dovuti per liquidazioni trimestrali", "description");
  row.addCell(Banana.Converter.toLocaleNumberFormat(Banana.SDecimal.abs(period["L-INT"].vatPosted)), "amount");
  
  //propone interessi trimestrali se importo è diverso da quello visualizzato
  //disabilita controllo interessi nel periodo iv trimestre iva speciali
  if (this.getPeriod("q", period)!="4") {
    var msg = this.calculateInterestAmount(period);
    if (msg.id.length>0) {
      row.addCell(msg.text, "amount warning");
    }
    else {
      row.addCell("");
    }
  }
  else {
    row.addCell("");
  }
  
  row = table.addRow();
  row.addCell("VP13");
  row.addCell("Acconto dovuto", "description");
  row.addCell(Banana.Converter.toLocaleNumberFormat(Banana.SDecimal.abs(period["L-AC"].vatPosted)), "amount");
  row.addCell("");

  row = table.addRow();
  row.addCell("VP14");
  if (Banana.SDecimal.sign(period["Total"].vatPosted)<=0)
    row.addCell("IVA da versare", "description");
  else
    row.addCell("IVA a credito", "description");
  row.addCell(Banana.Converter.toLocaleNumberFormat(Banana.SDecimal.abs(period["Total"].vatPosted)), "amount");
  row.addCell("");

}

LiquidazionePeriodica.prototype.saveData = function(output) {
  var codiceFiscale = this.param.datiContribuente.codiceFiscale;
  if (codiceFiscale.length<=0)
    codiceFiscale = "99999999999";
  var fileName = "IT" + codiceFiscale + "_LI_" + this.param.comunicazioneProgressivo + ".xml";
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

LiquidazionePeriodica.prototype.setParam = function(param) {
  this.param = param;
  this.verifyParam();
}

LiquidazionePeriodica.prototype.setStyle = function(report, stylesheet) {
  if (!stylesheet) {
    stylesheet = report.newStyleSheet();
  }
  stylesheet.addStyle("@page", "size:portrait;margin:2em;margin-left:4em;font-size:12px; ");
  stylesheet.addStyle("phead", "font-weight: bold; margin-bottom: 1em");
  stylesheet.addStyle("thead", "font-weight: bold");
  stylesheet.addStyle("td", "padding-right: 1em;vertical-align:top;");
  
  stylesheet.addStyle(".amount", "text-align: right");
  stylesheet.addStyle(".center", "text-align: center");
  stylesheet.addStyle(".period", "font-size: 12px;font-weight: bold;padding-top: 2em;");
  stylesheet.addStyle(".warning", "color: red;font-size:8px;");
  stylesheet.addStyle(".total1", "border-bottom:1px double black;font-weight:bold;padding-top:10px;");
  stylesheet.addStyle(".total2", "border-bottom:1px double black;font-weight:bold;padding-top:10px;");
  stylesheet.addStyle(".total3", "border-bottom:1px solid black;padding-top:10px");
  stylesheet.addStyle(".total4", "padding-top:10px");
  stylesheet.addStyle("table.table1", "");
  stylesheet.addStyle("table.table2", "");
}

LiquidazionePeriodica.prototype.substractVatAmounts = function(vatAmounts1, vatAmounts2) {
  var sum = {
  vatAmount : "",
  vatTaxable : "",
  vatNotDeductible : "",
  vatPosted : ""
  };

  sum.vatAmount = (+vatAmounts1.vatAmount - +vatAmounts2.vatAmount).toFixed(2);
  sum.vatTaxable = (+vatAmounts1.vatTaxable - +vatAmounts2.vatTaxable).toFixed(2);
  sum.vatNotDeductible = (+vatAmounts1.vatNotDeductible - +vatAmounts2.vatNotDeductible).toFixed(2);
  sum.vatPosted = (+vatAmounts1.vatPosted - +vatAmounts2.vatPosted).toFixed(2);

  return sum;
}

LiquidazionePeriodica.prototype.sumVatAmounts = function(vatAmounts, codesToSum) {
  var sum = {
  vatAmount : "",
  vatTaxable : "",
  vatNotDeductible : "",
  vatPosted : ""
  };

  for (var i=0; i<codesToSum.length; i++) {
  codeAmounts = vatAmounts[codesToSum[i]];
  if (codeAmounts === undefined) {
    var msg = getErrorMessage(ID_ERR_CODICI_ND);
    msg = msg.replace("%1", codesToSum );
    this.banDocument.addMessage( msg, ID_ERR_CODICI_ND);
    continue;
  }
  // Javascript note: the sign '+' in '+codeAmounts.vatAmount' is used to convert a string in a number
  sum.vatAmount = (+sum.vatAmount + +codeAmounts.vatAmount).toFixed(2);
  sum.vatTaxable = (+sum.vatTaxable + +codeAmounts.vatTaxable).toFixed(2);
  sum.vatNotDeductible = (+sum.vatNotDeductible + +codeAmounts.vatNotDeductible).toFixed(2);
  sum.vatPosted = (+sum.vatPosted + +codeAmounts.vatPosted).toFixed(2);
  }

  return sum;
}

LiquidazionePeriodica.prototype.verifyParam = function() {
  if (!this.param.comunicazioneProgressivo)
    this.param.comunicazioneProgressivo = '';
  if (!this.param.comunicazioneCFDichiarante)
    this.param.comunicazioneCFDichiarante = '';
  if (!this.param.comunicazioneCodiceCaricaDichiarante)
    this.param.comunicazioneCodiceCaricaDichiarante = '';
  if (!this.param.comunicazioneCFIntermediario)
    this.param.comunicazioneCFIntermediario = '';
  if (!this.param.comunicazioneImpegno)
    this.param.comunicazioneImpegno = '';
  if (!this.param.comunicazioneImpegnoData)
    this.param.comunicazioneImpegnoData = '';
  if (!this.param.comunicazioneFirmaDichiarazione)
    this.param.comunicazioneFirmaDichiarazione = false;
  if (!this.param.comunicazioneFirmaIntermediario)
    this.param.comunicazioneFirmaIntermediario = false;
  if (!this.param.comunicazioneUltimoMese)
    this.param.comunicazioneUltimoMese = '';

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

