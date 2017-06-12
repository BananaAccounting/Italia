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
        attrsNamespaces['xsi:schemaLocation'] += " ";
      attrsNamespaces['xsi:schemaLocation'] = attrsNamespaces['xsi:schemaLocation'] + schema;
    }
  }
  xbrlContent = xml_createElement("iv:Fornitura", xbrlContent, attrsNamespaces);

  //Output
  var results = [];
  results.push("<?xml version='1.0' encoding='UTF-8'?>");
  results.push(xbrlContent);
  return results.join ('\n');

}

function createInstance_Comunicazione(param) 
{
  var msgContext = '<iv:Frontespizio>';

  var codiceFiscale = param.fileInfo["Address"]["FiscalNumber"];
  var partitaIva = param.fileInfo["Address"]["VatNumber"];
  var xbrlCodiceFiscale = xml_createElementWithValidation("iv:CodiceFiscale", codiceFiscale,1,'11...16',msgContext) + '\n';
  var xbrlAnnoImposta = xml_createElementWithValidation("iv:AnnoImposta", param.accountingYear,1,'4',msgContext) + '\n';
  var xbrlPartitaIva = xml_createElementWithValidation("iv:PartitaIVA", partitaIva,1,'11',msgContext) + '\n';

  var xbrlUltimoMese = '';
  if (parseInt(param.comunicazioneUltimoMese)>0) {
    xbrlUltimoMese = xml_createElementWithValidation("iv:UltimoMese", param.comunicazioneUltimoMese, 0, '1...2', msgContext) + '\n';
  }
  
  var xbrlCFDichiarante = '';
  if (param.comunicazioneCFDichiarante.length>0)
    xbrlCFDichiarante = xml_createElementWithValidation("iv:CFDichiarante", xml_escapeString(param.comunicazioneCFDichiarante), 0, '16', msgContext) + '\n';

  var xbrlCodiceCaricaDichiarante = '';
  if (parseInt(param.comunicazioneCodiceCaricaDichiarante)>0)
    xbrlCodiceCaricaDichiarante = xml_createElementWithValidation("iv:CodiceCaricaDichiarante", param.comunicazioneCodiceCaricaDichiarante, 0, '1...2', msgContext) + '\n';

  var xbrlCFIntermediario = '';
  if (param.comunicazioneCFIntermediario.length>0)
    xbrlCFIntermediario = xml_createElementWithValidation("iv:CFIntermediario", xml_escapeString(param.comunicazioneCFIntermediario), 0, '16', msgContext) + '\n';

  var xbrlImpegno = '';
  var xbrlDataImpegno = '';
  if (param.comunicazioneImpegno.length>0) {
    xbrlImpegno = xml_createElementWithValidation("iv:ImpegnoPresentazione", xml_escapeString(param.comunicazioneImpegno), 0, '1', msgContext) + '\n';
    if (param.comunicazioneImpegnoData.length==10) {
      var anno = param.comunicazioneImpegnoData.substr(0,4);
      var mese = param.comunicazioneImpegnoData.substr(5,2);
      var giorno = param.comunicazioneImpegnoData.substr(8,2);
      var dataImpegno = giorno+mese+anno;
      xbrlDataImpegno = xml_createElementWithValidation("iv:DataImpegno", dataImpegno, 0, '8', msgContext) + '\n';
    }
  }

  var firmaDichiarazione = "0";
  if (param.comunicazioneFirmaDichiarazione)
    firmaDichiarazione = "1";
  var xbrlFirmaDichiarazione = xml_createElement("iv:FirmaDichiarazione", firmaDichiarazione) + '\n';

  var firmaIntermediario = "0";
  if (param.comunicazioneFirmaIntermediario)
    firmaIntermediario = "1";
  var xbrlFirmaIntermediario = xml_createElement("iv:FirmaIntermediario", firmaIntermediario) + '\n';

  var xbrlContent = '\n' + xbrlCodiceFiscale + xbrlAnnoImposta + xbrlPartitaIva + xbrlUltimoMese + xbrlFirmaDichiarazione + xbrlCFDichiarante + xbrlCodiceCaricaDichiarante + 
    xbrlCFIntermediario + xbrlImpegno + xbrlDataImpegno + xbrlFirmaIntermediario;
  
  var xbrlFrontespizio = '\n' + xml_createElement("iv:Frontespizio", xbrlContent) + '\n';
  
  if (param.vatPeriods.length>5) {
    //messaggio errore max 5 moduli
  }

  var xbrlModulo = '';
  for (var index=0; index<param.vatPeriods.length; index++) {
    xbrlModulo += createInstance_Modulo(param.vatPeriods[index]);
  }

  var xbrlDatiContabili =  xml_createElement("iv:DatiContabili", xbrlModulo) + '\n';
  
  xbrlContent = xbrlFrontespizio + xbrlDatiContabili;

  var xbrlComunicazione =  xml_createElement("iv:Comunicazione", xbrlContent, {'identificativo':param.comunicazioneProgressivo}) + '\n';
  return xbrlComunicazione;

}

function createInstance_Intestazione(param) 
{
  var msgContext = '<Intestazione>';
  
  var xbrlCodiceFornitura = xml_createElement("iv:CodiceFornitura", "IVP17") + '\n';

  var xbrlCodiceFiscaleDichiarante = '';
  if (param.comunicazioneCFDichiarante.length>0)
    xbrlCodiceFiscaleDichiarante = xml_createElementWithValidation("iv:CodiceFiscaleDichiarante", xml_escapeString(param.comunicazioneCFDichiarante), 0, '16', msgContext) + '\n';

  var xbrlCodiceCarica = '';
  if (parseInt(param.comunicazioneCodiceCaricaDichiarante)>0)
    xbrlCodiceCarica = xml_createElementWithValidation("iv:CodiceCarica", param.comunicazioneCodiceCaricaDichiarante, 0, '1...2', msgContext) + '\n';

  var xbrlContent =  '\n' + xbrlCodiceFornitura + xbrlCodiceFiscaleDichiarante + xbrlCodiceCarica;
  
  var xbrlIntestazione =  xml_createElement("iv:Intestazione", xbrlContent) + '\n';
  return xbrlIntestazione;
}

function createInstance_Modulo(param) 
{
  var msgContext = '<iv:Modulo>';

  var xbrlMese = '';
  var xbrlTrimestre = '';
  if (param.tipoVersamento == 0)
    xbrlMese = xml_createElementWithValidation("iv:Mese", getPeriod("m", param),0,'1...2',msgContext) + '\n';
  else
    xbrlTrimestre = xml_createElementWithValidation("iv:Trimestre", getPeriod("q", param),0,'1',msgContext) + '\n';
  
  var xbrlTotaleOperazioniAttive = xml_createElementWithValidation("iv:TotaleOperazioniAttive", createInstance_Modulo_GetVatAmount("OPATTIVE", "vatTaxable", param),0,'4...16',msgContext);
  if (xbrlTotaleOperazioniAttive.length>0)
    xbrlTotaleOperazioniAttive += '\n';

  var xbrlTotaleOperazioniPassive = xml_createElementWithValidation("iv:TotaleOperazioniPassive", createInstance_Modulo_GetVatAmount("OPPASSIVE", "vatTaxable", param),0,'4...16',msgContext);
  if (xbrlTotaleOperazioniPassive.length>0)
    xbrlTotaleOperazioniPassive += '\n';

  var xbrlIvaEsigibile = xml_createElementWithValidation("iv:IvaEsigibile", createInstance_Modulo_GetVatAmount("OPATTIVE", "vatPosted", param),0,'4...16',msgContext);
  if (xbrlIvaEsigibile.length>0)
    xbrlIvaEsigibile += '\n';

  var xbrlIvaDetratta = xml_createElementWithValidation("iv:IvaDetratta", createInstance_Modulo_GetVatAmount("OPPASSIVE", "vatPosted", param),0,'4...16',msgContext);
  if (xbrlIvaDetratta.length>0)
    xbrlIvaDetratta += '\n';

  var xbrlIvaDovuta = '';
  var xbrlIvaCredito = '';
  if (Banana.SDecimal.sign(param["OPDIFFERENZA"].vatPosted)<0)
    xbrlIvaDovuta = xml_createElementWithValidation("iv:IvaDovuta", createInstance_Modulo_GetVatAmount("OPDIFFERENZA", "vatPosted", param),0,'4...16',msgContext);
  else
    xbrlIvaCredito = xml_createElementWithValidation("iv:IvaCredito", createInstance_Modulo_GetVatAmount("OPDIFFERENZA", "vatPosted", param),0,'4...16',msgContext);
  if (xbrlIvaDovuta.length>0)
    xbrlIvaDovuta += '\n';
  if (xbrlIvaCredito.length>0)
    xbrlIvaCredito += '\n';

  var xbrlDebitoPeriodoPrecedente = '';
  var xbrlCreditoPeriodoPrecedente = '';
  if (Banana.SDecimal.sign(param["L-CI"].vatPosted)<0)
    xbrlDebitoPeriodoPrecedente = xml_createElementWithValidation("iv:DebitoPrecedente", createInstance_Modulo_GetVatAmount("L-CI", "vatPosted", param),0,'4...16',msgContext);
  else
    xbrlCreditoPeriodoPrecedente = xml_createElementWithValidation("iv:CreditoPeriodoPrecedente", createInstance_Modulo_GetVatAmount("L-CI", "vatPosted", param),0,'4...16',msgContext);
  if (xbrlDebitoPeriodoPrecedente.length>0)
    xbrlDebitoPeriodoPrecedente += '\n';
  if (xbrlCreditoPeriodoPrecedente.length>0)
    xbrlCreditoPeriodoPrecedente += '\n';

  var xbrlCreditoAnnoPrecedente = xml_createElementWithValidation("iv:CreditoAnnoPrecedente", createInstance_Modulo_GetVatAmount("L-CIA", "vatPosted", param),0,'4...16',msgContext);
  if (xbrlCreditoAnnoPrecedente.length>0)
    xbrlCreditoAnnoPrecedente += '\n';

  var xbrlInteressiDovuti = xml_createElementWithValidation("iv:InteressiDovuti", createInstance_Modulo_GetVatAmount("L-INT", "vatPosted", param),0,'4...16',msgContext);
  if (xbrlInteressiDovuti.length>0)
    xbrlInteressiDovuti += '\n';

  var xbrlAcconto = xml_createElementWithValidation("iv:Acconto", createInstance_Modulo_GetVatAmount("L-AC", "vatPosted", param),0,'4...16',msgContext);
  if (xbrlAcconto.length>0)
    xbrlAcconto += '\n';

  var xbrlImportoDaVersare = '';
  var xbrlImportoACredito = '';
  if (Banana.SDecimal.sign(param["Total"].vatPosted)<0)
    xbrlImportoDaVersare = xml_createElementWithValidation("iv:ImportoDaVersare", createInstance_Modulo_GetVatAmount("Total", "vatPosted", param),0,'4...16',msgContext);
  else
    xbrlImportoACredito = xml_createElementWithValidation("iv:ImportoACredito", createInstance_Modulo_GetVatAmount("Total", "vatPosted", param),0,'4...16',msgContext);
  if (xbrlImportoDaVersare.length>0)
    xbrlImportoDaVersare += '\n';
  if (xbrlImportoACredito.length>0)
    xbrlImportoACredito += '\n';

  xbrlContent = '\n' + xbrlMese + xbrlTrimestre + xbrlTotaleOperazioniAttive + xbrlTotaleOperazioniPassive + xbrlIvaEsigibile + xbrlIvaDetratta + xbrlIvaDovuta + xbrlIvaCredito;
  xbrlContent += xbrlDebitoPeriodoPrecedente + xbrlCreditoPeriodoPrecedente + xbrlCreditoAnnoPrecedente + xbrlInteressiDovuti + xbrlAcconto + xbrlImportoDaVersare + xbrlImportoACredito;
  var xbrlModulo = '\n' + xml_createElement("iv:Modulo", xbrlContent);
  return xbrlModulo;
}

function createInstance_Modulo_GetVatAmount(vatCode, column, param) {
  if (vatCode.length<=0)
    return "";
  var amount = "";
  if (column == "vatTaxable")
    amount = param[vatCode].vatTaxable;
  else if (column == "vatAmount")
    amount = param[vatCode].vatAmount;
  else if (column == "vatPosted")
    amount = param[vatCode].vatPosted;
  else if (column == "vatNotDeductible")
    amount = param[vatCode].vatNotDeductible;
  if (Banana.SDecimal.isZero(amount))
    return "";
  amount = Banana.SDecimal.abs(amount);
  //amount = Banana.SDecimal.roundNearest(amount, '1');
  amount = amount.replace(".",",");
  return amount;
}

