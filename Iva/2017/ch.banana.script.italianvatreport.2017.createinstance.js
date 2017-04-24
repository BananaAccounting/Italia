// Copyright [2016] [Banana.ch SA - Lugano Switzerland]
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

function createInstance(param)
{
  //<Intestazione>
  var xbrlIntestazione = createInstance_Intestazione(param);

  //<Comunicazione>
  var xbrlComunicazione = createInstance_Comunicazione(param);

  if (xbrlIntestazione.length<=0 || xbrlComunicazione.length<=0)
    return "@Cancel";

  //<Fornitura> root element
  var xbrlContent = '\n' + xbrlIntestazione + xbrlComunicazione;
  var attrsNamespaces = {};
  for (var j in param.namespaces) {
    var prefix = param.namespaces[j]['prefix'];
    var namespace = param.namespaces[j]['namespace'];
    if (prefix.length > 0)
      attrsNamespaces[prefix] = namespace;
  }
  for (var j in param.schemaRefs) {
    var schema = param.schemaRefs[j];
    if (schema.length > 0) {
      if (!attrsNamespaces['xsi:schemaLocation'])
        attrsNamespaces['xsi:schemaLocation'] = '';
      if (attrsNamespaces['xsi:schemaLocation'].length>0)
        attrsNamespaces['xsi:schemaLocation'] =+ " ";
      attrsNamespaces['xsi:schemaLocation'] = attrsNamespaces['xsi:schemaLocation'] + schema;
    }
  }
  xbrlContent = xml_createElement("Fornitura", xbrlContent, attrsNamespaces);

  //Output
  var results = [];
  results.push("<?xml version='1.0' encoding='UTF-8'?>");
  results.push(xbrlContent);
  return results.join ('\n');

}

function createInstance_Comunicazione(param) 
{
  var xbrlCodiceFiscale = xml_createElement("iv:CodiceFiscale", createInstance_GetValueFromTableInfo("AccountingDataBase", "FiscalNumber")) + '\n';
  var xbrlAnnoImposta = xml_createElement("iv:AnnoImposta", getPeriod("y", param)) + '\n';
  var xbrlPartitaIva = xml_createElement("iv:PartitaIva", createInstance_GetValueFromTableInfo("AccountingDataBase", "VatNumber")) + '\n';
  var xbrlContent = '\n' + xbrlCodiceFiscale + xbrlAnnoImposta + xbrlPartitaIva;
  var xbrlFrontespizio = '\n' + xml_createElement("iv:Frontespizio", xbrlContent) + '\n';
  
  var xbrlMese = '';
  var xbrlTrimestre = '';
  if (getPeriod("m", param).length>0)
    xbrlMese = xml_createElement("iv:Mese", getPeriod("m", param)) + '\n';
  if (getPeriod("q", param).length>0 && xbrlMese.length<=0)
    xbrlTrimestre = xml_createElement("iv:Trimestre", getPeriod("q", param)) + '\n';
  if (xbrlMese.length<=0 && xbrlTrimestre.length<=0){
      Banana.document.addMessage( "Periodo non valido. Selezionare un mese oppure un trimestre.", "Errore");
      return '';
  }
  var xbrlTotaleOperazioniAttive = xml_createElement("iv:TotaleOperazioniAttive", createInstance_GetVatAmount("OPATTIVE", "vatTaxable", param)) + '\n';
  var xbrlTotaleOperazioniPassive = xml_createElement("iv:TotaleOperazioniPassive", createInstance_GetVatAmount("OPPASSIVE", "vatTaxable", param)) + '\n';
  var xbrlIvaEsigibile = xml_createElement("iv:IvaEsigibile", createInstance_GetVatAmount("OPATTIVE", "vatPosted", param)) + '\n';
  var xbrlIvaDetratta = xml_createElement("iv:IvaDetratta", createInstance_GetVatAmount("OPPASSIVE", "vatPosted", param)) + '\n';
  var xbrlIvaDovuta = '';
  var xbrlIvaCredito = '';
  if (Banana.SDecimal.sign(param.vatAmounts["OPDIFFERENZA"].vatPosted)<0)
    xbrlIvaDovuta = xml_createElement("iv:IvaDovuta", createInstance_GetVatAmount("OPDIFFERENZA", "vatPosted", param)) + '\n';
  else
    xbrlIvaCredito = xml_createElement("iv:IvaCredito", createInstance_GetVatAmount("OPDIFFERENZA", "vatPosted", param)) + '\n';
  var xbrlDebitoPeriodoPrecedente = '';
  var xbrlCreditoPeriodoPrecedente = '';
  if (Banana.SDecimal.sign(param.vatAmounts["L-CI"].vatPosted)<0)
    xbrlDebitoPeriodoPrecedente = xml_createElement("iv:DebitoPrecedente", createInstance_GetVatAmount("L-CI", "vatPosted", param)) + '\n';
  else
    xbrlCreditoPeriodoPrecedente = xml_createElement("iv:CreditoPeriodoPrecedente", createInstance_GetVatAmount("L-CI", "vatPosted", param)) + '\n';
  var xbrlCreditoAnnoPrecedente = xml_createElement("iv:CreditoAnnoPrecedente", createInstance_GetVatAmount("L-CIA", "vatPosted", param)) + '\n';
  var xbrlInteressiDovuti = xml_createElement("iv:InteressiDovuti", createInstance_GetVatAmount("L-INT", "vatPosted", param)) + '\n';
  var xbrlAcconto = xml_createElement("iv:Acconto", createInstance_GetVatAmount("L-AC", "vatPosted", param)) + '\n';
  var xbrlImportoDaVersare = '';
  var xbrlImportoACredito = '';
  if (Banana.SDecimal.sign(param.vatAmounts["Total"].vatPosted)<0)
    xbrlImportoDaVersare = xml_createElement("iv:ImportoDaVersare", createInstance_GetVatAmount("Total", "vatPosted", param)) + '\n';
  else
    xbrlImportoACredito = xml_createElement("iv:ImportoACredito", createInstance_GetVatAmount("Total", "vatPosted", param)) + '\n';


  xbrlContent = '\n' + xbrlMese + xbrlTrimestre + xbrlTotaleOperazioniAttive + xbrlTotaleOperazioniPassive + xbrlIvaEsigibile + xbrlIvaDetratta + xbrlIvaDovuta + xbrlIvaCredito;
  xbrlContent += xbrlDebitoPeriodoPrecedente + xbrlCreditoPeriodoPrecedente + xbrlCreditoAnnoPrecedente + xbrlInteressiDovuti + xbrlAcconto + xbrlImportoDaVersare + xbrlImportoACredito;
  var xbrlModulo = '\n' + xml_createElement("iv:Modulo", xbrlContent) + '\n';
  var xbrlDatiContabili =  xml_createElement("iv:DatiContabili", xbrlModulo) + '\n';
  
  xbrlContent = xbrlFrontespizio + xbrlDatiContabili;

  var xbrlComunicazione =  xml_createElement("iv:Comunicazione", xbrlContent, {'identificativo':'1'}) + '\n';
  return xbrlComunicazione;
}

function createInstance_Intestazione(param) 
{
  var xbrlContent =  '\n' + xml_createElement("iv:CodiceFornitura", "IVP17") + '\n';
  var xbrlIntestazione =  xml_createElement("iv:Intestazione", xbrlContent) + '\n';
  return xbrlIntestazione;
}

function createInstance_GetValueFromTableInfo(xmlSection, xmlId, param) {
  if (!Banana.document)
    return '';
  var xmlValue = Banana.document.info(xmlSection,xmlId);
  if (xmlValue === undefined)
    xmlValue = '';
  return xmlValue;
}

function createInstance_GetVatAmount(vatCode, column, param) {
  if (vatCode.length<=0)
    return "";
  var amount = "";
  if (column == "vatTaxable")
    amount = param.vatAmounts[vatCode].vatTaxable;
  else if (column == "vatAmount")
    amount = param.vatAmounts[vatCode].vatAmount;
  else if (column == "vatPosted")
    amount = param.vatAmounts[vatCode].vatPosted;
  else if (column == "vatNotDeductible")
    amount = param.vatAmounts[vatCode].vatNotDeductible;
  if (Banana.SDecimal.isZero(amount))
    return "";
  amount = Banana.SDecimal.abs(amount);
  //amount = Banana.SDecimal.roundNearest(amount, '1');
  amount = amount.replace(".",",");
  return amount;
}