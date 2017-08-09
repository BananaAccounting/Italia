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

/*
* metodo principale che genera il file xml
*/
function createInstance(param)
{
  //<DatiFatturaHeader>
  var xbrlDatiFatturaHeader = createInstance_DatiFatturaHeader(param);

  var xbrlContent = '';
  if (param.blocco == "DTE")
    xbrlContent = createInstance_DTE(param);
  else if (param.blocco == "DTR")
    xbrlContent = createInstance_DTR(param);

  //<DatiFattura> root element
  xbrlContent = xbrlDatiFatturaHeader + xbrlContent;
  var attrsNamespaces = {};
  attrsNamespaces["versione"] = "DAT20";
  for (var j in param.namespaces) {
    var prefix = param.namespaces[j]['prefix'];
    var namespace = param.namespaces[j]['namespace'];
    if (prefix.length > 0)
      attrsNamespaces[prefix] = namespace;
  }
  for (var j in param.schemaRefs) {
    var schema = param.schemaRefs[j];
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
function createInstance_DTE(param) 
{
  var xbrlContent = createInstance_Blocco1(param);
  
  for (var i in param.data.customers) {
    var customerObj = param.data.customers[i];
    if (customerObj)
      xbrlContent += createInstance_Blocco2(customerObj, param);
  }
  var xbrlDTE =  xml_createElement( "DTE", xbrlContent);
  return xbrlDTE;
}

function createInstance_DTR(param) 
{
  var xbrlContent = createInstance_Blocco1(param);
  
  for (var i in param.data.suppliers) {
    var supplierObj = param.data.suppliers[i];
    if (supplierObj)
      xbrlContent += createInstance_Blocco2(supplierObj, param);
  }
  var xbrlDTR =  xml_createElement("DTR", xbrlContent);
  return xbrlDTR;
}

/*
* Blocco 2.1 <CedentePrestatoreDTE> e 3.1 <CessionarioCommittenteDTR>
* Occorrenze: <1.1>
*/
function createInstance_Blocco1(param) 
{
  var tag = ''
  if (param.blocco == 'DTE')
    tag = 'CedentePrestatoreDTE';
  else if (param.blocco == 'DTR')
    tag = 'CessionarioCommittenteDTR';

   if (tag.length<=0)
     return;

  var msgContext = '<' + tag + '>';
  
  //2.1.1   <IdentificativiFiscali>
  var xbrlContent = xml_createElementWithValidation("IdPaese", param.datiContribuente.nazione,1,'2',msgContext);
  xbrlContent += xml_createElementWithValidation("IdCodice", param.datiContribuente.partitaIva,1,'1...28',msgContext);
  xbrlContent = xml_createElementWithValidation("IdFiscaleIVA",xbrlContent,1);
  xbrlContent += xml_createElementWithValidation("CodiceFiscale", param.datiContribuente.codiceFiscale,0,'11...16',msgContext);
  xbrlContent =  xml_createElementWithValidation("IdentificativiFiscali",xbrlContent,1);
  
  //2.1.2   <AltriDatiIdentificativi>
  var xbrlContent2 = '';
  if (param.datiContribuente.tipoContribuente == 1) {
    xbrlContent2 = xml_createElementWithValidation("Denominazione", xml_escapeString(param.datiContribuente.societa),0,'1...80',msgContext);
  }
  else {
    xbrlContent2 = xml_createElementWithValidation("Nome", xml_escapeString(param.datiContribuente.nome),0,'1...60',msgContext);
    xbrlContent2 += xml_createElementWithValidation("Cognome", xml_escapeString(param.datiContribuente.cognome),0,'1...60',msgContext);
  }
  var xbrlContent3 = xml_createElementWithValidation("Indirizzo", xml_escapeString(param.datiContribuente.indirizzo),1,'1...60',msgContext);
  xbrlContent3 += xml_createElementWithValidation("NumeroCivico", xml_escapeString(param.datiContribuente.ncivico),0,'1...8',msgContext);
  xbrlContent3 += xml_createElementWithValidation("CAP", xml_escapeString(param.datiContribuente.cap),1,'5',msgContext);
  xbrlContent3 += xml_createElementWithValidation("Comune", xml_escapeString(param.datiContribuente.comune),1,'1...60',msgContext);
  xbrlContent3 += xml_createElementWithValidation("Provincia", param.datiContribuente.provincia,0,'2',msgContext);
  xbrlContent3 += xml_createElementWithValidation("Nazione", param.datiContribuente.nazione,1,'2',msgContext);
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
function createInstance_Blocco2(accountObj, param) 
{
  var tag = ''
  if (param.blocco == 'DTE')
    tag = 'CessionarioCommittenteDTE';
  else if (param.blocco == 'DTR')
    tag = 'CedentePrestatoreDTR';

   if (tag.length<=0)
     return;

  var msgContext = '<' + tag + '> ' + accountObj["Account"] + ' ' + accountObj["Description"];
  var xbrlCessionarioCommittente = '';
  if (accountObj) {
    //2.2.1   <IdentificativiFiscali>
    var xbrlIdentificativiFiscali = xml_createElementWithValidation("IdPaese", getCountryCode(accountObj),1,'2',msgContext);
    xbrlIdentificativiFiscali += xml_createElementWithValidation("IdCodice", accountObj["VatNumber"],1,'1...28',msgContext);
    xbrlIdentificativiFiscali = xml_createElementWithValidation("IdFiscaleIVA",xbrlIdentificativiFiscali,1);
    xbrlIdentificativiFiscali += xml_createElementWithValidation("CodiceFiscale", accountObj["FiscalNumber"],0,'11...16',msgContext);
    xbrlCessionarioCommittente =  xml_createElementWithValidation("IdentificativiFiscali",xbrlIdentificativiFiscali,1);

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
    xbrSede += xml_createElementWithValidation("CAP", accountObj["PostalCode"],1,'5',msgContext);
    xbrSede += xml_createElementWithValidation("Comune", accountObj["Locality"],1,'1...60',msgContext);
    xbrSede += xml_createElementWithValidation("Provincia", accountObj["Region"],0,'2',msgContext);
    xbrSede += xml_createElementWithValidation("Nazione", getCountryCode(accountObj),1,'2',msgContext);
    xbrlAltriDati += xml_createElementWithValidation("Sede", xbrSede,1);
    xbrlCessionarioCommittente +=  xml_createElementWithValidation("AltriDatiIdentificativi", xbrlAltriDati,1);

    /*
    * Blocco obbligatorio. Può essere replicato per trasmettere dati di più fatture relative allo stesso cliente
    */
    //2.2.3 <DatiFatturaBodyDTE> o 3.2.3 <DatiFatturaBodyDTR>
    var xbrlDatiFatturaBody = '';
    for (var i in accountObj.rows) {
      if (accountObj.rows[i]) {
        msgContext = '[' + accountObj.rows[i]["JTableOrigin"] + ': Riga ' + (parseInt(accountObj.rows[i]["JRowOrigin"])+1).toString() +'] <DatiFatturaBody' + param.blocco + '>';
        //2.2.3.1  <DatiGenerali>
        var xbrlDatiGenerali = xml_createElementWithValidation("TipoDocumento", accountObj.rows[i]["IT_TipoDoc"],1,'4',msgContext);
        xbrlDatiGenerali += xml_createElementWithValidation("Data", accountObj.rows[i]["JInvoiceIssueDate"],1,'10',msgContext);
        xbrlDatiGenerali += xml_createElementWithValidation("Numero", accountObj.rows[i]["DocInvoice"],1,'1...20',msgContext);
        if (param.blocco == 'DTR')
          xbrlDatiGenerali += xml_createElementWithValidation("DataRegistrazione", accountObj.rows[i]["JDate"],1,'10',msgContext);
        var xbrlContent = xml_createElementWithValidation("DatiGenerali", xbrlDatiGenerali,1);
        //2.2.3.1  <DatiRiepilogo>
        var xbrlDatiRiepilogo = xml_createElementWithValidation("ImponibileImporto", accountObj.rows[i]["IT_Imponibile"],1,'4...15',msgContext);
        var xbrlContent4 = xml_createElementWithValidation("Imposta", accountObj.rows[i]["IT_Imposta"],0,'4...15',msgContext);
        xbrlContent4 += xml_createElementWithValidation("Aliquota", accountObj.rows[i]["IT_Aliquota"],0,'4...6',msgContext);
        xbrlDatiRiepilogo += xml_createElementWithValidation("DatiIVA",xbrlContent4,1);
        if (accountObj.rows[i]["IT_Natura"].length)
          xbrlDatiRiepilogo += xml_createElementWithValidation("Natura", accountObj.rows[i]["IT_Natura"],0,'2');
        if (accountObj.rows[i]["IT_Detraibile"].length)
          xbrlDatiRiepilogo += xml_createElementWithValidation("Detraibile", accountObj.rows[i]["IT_Detraibile"],0,'4...6');
        if (accountObj.rows[i]["IT_Deducibile"].length)
          xbrlDatiRiepilogo += xml_createElementWithValidation("Deducibile",accountObj.rows[i]["IT_Deducibile"],0,'2');
        xbrlContent += xml_createElementWithValidation("DatiRiepilogo", xbrlDatiRiepilogo,1);
        xbrlDatiFatturaBody +=  xml_createElementWithValidation("DatiFatturaBody" + param.blocco, xbrlContent,1);
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
* Blocco da valorizzare solo se si intende identificare con un progressivo il file che si sta trasmettendo.
* L'elemento 1.3 <IdSistema> non va mai valorizzato in quanto riservato al sistema
* Occorrenze: <0.1>
*/
function createInstance_DatiFatturaHeader(param) 
{
  var msgContext = '<DatiFatturaHeader>';
  
  var xbrlProgressivo = '';
  if (param.progressivoInvio.length>0)
    xbrlProgressivo = xml_createElementWithValidation("ProgressivoInvio",xml_escapeString(param.progressivoInvio),0,'1...10', msgContext);
  
  var xbrlCFDichiarante = '';
  if (param.codicefiscaleDichiarante.length>0)
    xbrlCFDichiarante = xml_createElementWithValidation("CodiceFiscale", xml_escapeString(param.codicefiscaleDichiarante), 0, '11...16', msgContext);

  var xbrlCodiceCaricaDichiarante = '';
  if (parseInt(param.codiceCarica)>0)
    xbrlCodiceCaricaDichiarante = xml_createElementWithValidation("Carica", param.codiceCarica, 0, '1...2', msgContext);

  var xbrlDichiarante = '';
  if (xbrlCFDichiarante.length > 0 || xbrlCodiceCaricaDichiarante.length > 0) {
    xbrlDichiarante =  xml_createElement("Dichiarante", xbrlCFDichiarante + xbrlCodiceCaricaDichiarante);
  }

  var xbrlContent = xbrlProgressivo + xbrlDichiarante;
  var xbrlHeader =  xml_createElement("DatiFatturaHeader", xbrlContent);
  return xbrlHeader;
}
