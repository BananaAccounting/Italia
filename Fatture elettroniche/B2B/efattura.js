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

function EFattura(banDocument)
{
      this.banDocument = banDocument;
      if (this.banDocument === undefined)
            this.banDocument = Banana.document;
      this.initParam();
      this.invoiceObj = null;
      this.name = "Banana Accounting EFattura";
      this.version = "V1.0";

      /* errors id*/
      this.ID_ERR_ACCOUNTING_TYPE_NOTVALID = "ID_ERR_ACCOUNTING_TYPE_NOTVALID";
      this.ID_ERR_DATICONTRIBUENTE_NOTFOUND = "ID_ERR_DATICONTRIBUENTE_NOTFOUND";
      this.ID_ERR_TABLE_ADDRESS_MISSING = "ID_ERR_TABLE_ADDRESS_MISSING";
      this.ID_ERR_TABLE_ADDRESS_NOT_UPDATED = "ID_ERR_TABLE_ADDRESS_NOT_UPDATED";
      this.ID_ERR_VERSION = "ID_ERR_VERSION";

}

/*
* xml instance file
*/
EFattura.prototype.createInstance = function (xmlDocument, jsonInvoice)
{

      if (this.banDocument.table('Accounts'))
      {
            var tColumnNames = this.banDocument.table('Accounts').columnNames.join(";");
            if (tColumnNames.indexOf('Town') > 0 || tColumnNames.indexOf('Company') > 0)
            {
                  //The address columns are not updated
                  var msg = this.getErrorMessage(this.ID_ERR_TABLE_ADDRESS_NOT_UPDATED);
                  this.banDocument.addMessage(msg, this.ID_ERR_TABLE_ADDRESS_NOT_UPDATED);
                  return;
            }
            else if (tColumnNames.indexOf('OrganisationName') <= 0)
            {
                  var msg = this.getErrorMessage(this.ID_ERR_TABLE_ADDRESS_MISSING);
                  this.banDocument.addMessage(msg, this.ID_ERR_TABLE_ADDRESS_MISSING);
                  return;
            }
      }
      else
      {
            var msg = this.getErrorMessage(this.ID_ERR_ACCOUNTING_TYPE_NOTVALID);
            this.banDocument.addMessage(msg, this.ID_ERR_ACCOUNTING_TYPE_NOTVALID);
            return;
      }

      this.invoiceObj = null;
      if (typeof (jsonInvoice) === 'object')
      {
            this.invoiceObj = jsonInvoice;
      } else if (typeof (jsonInvoice) === 'string')
      {
            this.invoiceObj = JSON.parse(jsonInvoice)
      }
      if (!xmlDocument || this.isEmpty(this.datiContribuente))
            return;

      //<Document>

      var trasmissionFormat = "FPA12";
      var nodeRoot = xmlDocument.addElement("p:EFattura");
      nodeRoot.setAttribute("versione", trasmissionFormat);


      this.initSchemarefs();
      this.initNamespaces();
      for (var j in this.param.namespaces)
      {
            var prefix = this.param.namespaces[j]['prefix'];
            var namespace = this.param.namespaces[j]['namespace'];
            nodeRoot.setAttribute(prefix, namespace);
      }
      var attrsSchemaLocation = ''
      for (var j in this.param.schemaRefs)
      {
            var schema = this.param.schemaRefs[j];
            if (schema.length > 0)
            {
                  attrsSchemaLocation += " " + schema;
            }
      }
      if (attrsSchemaLocation.length > 0)
            nodeRoot.setAttribute("xsi:schemaLocation", attrsSchemaLocation);

      //Header

      var nodeFatturaElettronicaHeader = nodeRoot.addElement("FatturaElettronicaHeader");

      var nodeDatiTrasmissione = nodeFatturaElettronicaHeader.addElement("DatiTrasmissione");
      var nodeIdTrasmittente = nodeDatiTrasmissione.addElement("IdTrasmittente");
      var nodeIdPaese = nodeIdTrasmittente.addElement("IdPaese");
      nodeIdPaese.addTextNode(this.datiContribuente.nazione);
      var nodeIdCodice = nodeIdTrasmittente.addElement("IdCodice");
      nodeIdCodice.addTextNode((this.datiContribuente.nazione == 'IT' ? this.datiContribuente.codiceFiscale.substring(2) : this.datiContribuente.codiceFiscale));
      var nodeProgressivoInvio = nodeDatiTrasmissione.addElement("ProgressivoInvio");
      nodeProgressivoInvio.addTextNode(JSON.parse(this.banDocument.getScriptSettings()).progressive);

      nodeProgressivoInvio.addTextNode(this.param.incremental);
      var nodeFormatoTrasmissione = nodeDatiTrasmissione.addElement("FormatoTrasmissione");
      nodeFormatoTrasmissione.addTextNode(trasmissionFormat);
      var nodeCodiceDestinatario = nodeDatiTrasmissione.addElement("CodiceDestinatario");
      //var x = new Registr
      //var utils = new Utils(this.banDocument);
      //nodeCodiceDestinatario.addTextNode(JSON.stringify(this.invoiceObj));

      //nodeCodiceDestinatario.addTextNode('9999999');

      // nodeCodiceDestinatario.addTextNode(info);

      // var nodeContattiTrasmittente = nodeDatiTrasmissione.addElement("ContattiTrasmittente");
      //   var nodeTelefono = nodeContattiTrasmittente.addElement("Telefono");
      //   var nodeEmail = nodeContattiTrasmittente.addElement("Email");
      var nodePECDestinatario = nodeDatiTrasmissione.addElement("PECDestinatario");
      nodePECDestinatario.addTextNode(this.invoiceObj.customer_info.email);


      var nodeCedentePrestatore = nodeFatturaElettronicaHeader.addElement("CedentePrestatore");
      var nodeDatiAnagrafici = nodeCedentePrestatore.addElement("DatiAnagrafici");
      var nodeIdFiscaleIVA = nodeDatiAnagrafici.addElement("IdFiscaleIVA");
      var nodeIdPaese = nodeIdFiscaleIVA.addElement("IdPaese");
      nodeIdPaese.addTextNode(this.datiContribuente.nazione);
      var nodeIdCodice = nodeIdFiscaleIVA.addElement("IdCodice");
      nodeIdCodice.addTextNode((this.datiContribuente.nazione == 'IT' ? this.datiContribuente.codiceFiscale.substring(2) : this.datiContribuente.codiceFiscale));
      // var nodeCodiceFiscale = nodeDatiAnagrafici.addElement("CodiceFiscale");
      var nodeAnagrafica = nodeDatiAnagrafici.addElement("Anagrafica");
      if (this.datiContribuente.tipoContribuente === 0)
      {
            var nodeNome = nodeAnagrafica.addElement("Nome");
            var nodeCognome = nodeAnagrafica.addElement("Cognome");

            nodeNome.addTextNode(this.datiContribuente.nome);
            nodeCognome.addTextNode(this.datiContribuente.cognome);

      }
      else if (this.datiContribuente.tipoContribuente === 1)
      {
            var nodeDenominazione = nodeAnagrafica.addElement("Denominazione");
            nodeDenominazione.addTextNode(this.datiContribuente.societa);
      }





      //   var nodeTitolo = nodeAnagrafica.addElement("Titolo");
      //   var nodCodEORI = nodeAnagrafica.addElement("CodEORI");
      // var nodeAlboProfessionale = nodeDatiAnagrafici.addElement("AlboProfessionale");
      // var nodeProvinciaAlbo = nodeDatiAnagrafici.addElement("ProvinciaAlbo");
      // var nodeNumeroIscrizioneAlbo = nodeDatiAnagrafici.addElement("NumeroIscrizioneAlbo");
      // var nodeDataiscrizioneAlbo = nodeDatiAnagrafici.addElement("DataIscrizioneAlbo");
      var nodeRegimeFiscale = nodeDatiAnagrafici.addElement("RegimeFiscale");
      var regFis = 'RF';
      if (this.datiContribuente.tipoRegimeFiscale + 1 < 10)
            regFis += '0';
      regFis += this.datiContribuente.tipoRegimeFiscale + 1;
      nodeRegimeFiscale.addTextNode(regFis);
      var nodeSede = nodeCedentePrestatore.addElement("Sede");
      var nodeIndirizzo = nodeSede.addElement("Indirizzo");
      nodeIndirizzo.addTextNode(this.datiContribuente.indirizzo);
      var nodeNumeroCivico = nodeSede.addElement("NumeroCivico");
      nodeNumeroCivico.addTextNode(this.datiContribuente.ncivico);
      var nodeCAP = nodeSede.addElement("CAP");
      nodeCAP.addTextNode(this.datiContribuente.cap);
      var nodeComune = nodeSede.addElement("Comune");
      nodeComune.addTextNode(this.datiContribuente.comune);
      var nodeProvincia = nodeSede.addElement("Provincia");
      nodeProvincia.addTextNode(this.datiContribuente.provincia);
      var nodeNazione = nodeSede.addElement("Nazione");
      nodeNazione.addTextNode(this.datiContribuente.nazione);

      // var nodeStabileOrganizzazione = nodeCedentePrestatore.addElement("StabileOrganizzazione");
      // var nodeNumeroCivico = nodeStabileOrganizzazione.addElement("NumeroCivico");
      // var nodeCAP = nodeStabileOrganizzazione.addElement("CAP");
      // var nodeComune = nodeStabileOrganizzazione.addElement("Comune");
      // var nodeProvincia = nodeStabileOrganizzazione.addElement("Provincia");
      // var nodeNazione = nodeStabileOrganizzazione.addElement("Nazione");
      // var nodeIscrizioneREA = nodeCedentePrestatore.addElement("IscrizioneREA")
      //   var nodeUfficio = nodeIscrizioneREA.addElement("Ufficio");
      //   var nodeNumeroREA = nodeIscrizioneREA.addElement("NumeroREA");
      //   var nodeCapitaleSociale = nodeIscrizioneREA.addElement("SocioUnico");
      //   var nodeStatoLiquidazione = nodeIscrizioneREA.addElement("StatoLiquidazione");
      // var nodeContatti = nodeCedentePrestatore.addElement("Contatti");
      //   var nodeTelefono = nodeContatti.addElement("Telefono");
      //   var nodeFax = nodeContatti.addElement("Fax");
      //   var nodeEmail = nodeContatti.addElement("Email");
      // var nodeRiferimentoAmministrazione = nodeCedentePrestatore.addElement("RiferimentoAmministrazione");
      // var nodeRappresentanteFiscale = nodeFatturaElettronicaHeader.addElement("RappresentanteFiscale");
      //   var nodeDatiAnagrafici = nodeRappresentanteFiscale.addElement("DatiAnagrafici");
      //     var nodeIdFiscaleIVA = nodeDatiAnagrafici.addElement("IdFiscaleIVA");
      //     var nodeIdPaese = nodeIdFiscaleIVA.addElement("IdPaese");
      //     var nodeIdCodice = nodeIdFiscaleIVA.addElement("IdCodice");
      //   var nodeCodiceFiscale = nodeDatiAnagrafici.addElement("CodiceFiscale");
      //   var nodeAnagrafica = nodeDatiAnagrafici.addElement("Anagrafica");
      //     var nodeDenominazione = nodeAnagrafica.addElement("Denominazione");
      //     var nodeDenominazione = nodeAnagrafica.addElement("Nome");
      //     var nodeCognome = nodeAnagrafica.addElement("Cognome");
      //     var nodeTitolo = nodeAnagrafica.addElement("Titolo");
      //     var nodCodEORI = nodeAnagrafica.addElement("CodEORI");     
      var nodeCessionarioCommittente = nodeFatturaElettronicaHeader.addElement("CessionarioCommittente");
      var nodeDatiAnagrafici = nodeCessionarioCommittente.addElement("DatiAnagrafici")
      // var nodeIdFiscaleIVA = nodeDatiAnagrafici.addElement("IdFiscaleIVA");
      //   var nodeIdPaese = nodeIdFiscaleIVA.addElement("IdPaese");
      //   var nodeIdCodice = nodeIdFiscaleIVA.addElement("IdCodice");
      // var nodeCodiceFiscale = nodeDatiAnagrafici.addElement("CodiceFiscale");
      var nodeAnagrafica = nodeDatiAnagrafici.addElement("Anagrafica");
      // nodeAnagrafica.addTextNode(JSON.stringify(this.invoiceObj));
      if (this.invoiceObj.customer_info.business_name)
      {
            var nodeDenominazione = nodeAnagrafica.addElement("Denominazione");
            nodeDenominazione.addTextNode(this.invoiceObj.customer_info.business_name)
      }
      else if (this.invoiceObj.customer_info.first_name && this.invoiceObj.customer_info.last_name)
      {
            var nodeNome = nodeAnagrafica.addElement("Nome");
            var nodeCognome = nodeAnagrafica.addElement("Cognome");

            nodeNome.addTextNode(this.invoiceObj.customer_info.first_name)
            nodeCognome.addTextNode(this.invoiceObj.customer_info.last_name)
      }
      // var nodeTitolo = nodeAnagrafica.addElement("Titolo");
      // var nodCodEORI = nodeAnagrafica.addElement("CodEORI");



      var nodeSede = nodeCessionarioCommittente.addElement("Sede");
      var nodeIndirizzo = nodeSede.addElement("Indirizzo");
      nodeIndirizzo.addTextNode(this.invoiceObj.customer_info.address1);
      //   var nodeNumeroCivico = nodeSede.addElement("NumeroCivico");

      var nodeCAP = nodeSede.addElement("CAP");
      nodeCAP.addTextNode(this.invoiceObj.customer_info.postal_code);
      var nodeComune = nodeSede.addElement("Comune");
      nodeComune.addTextNode(this.invoiceObj.customer_info.city);
      if (this.invoiceObj.customer_info.country === 'IT')
      {
            var nodeProvincia = nodeSede.addElement("Provincia");
            nodeProvincia.addTextNode(nodeComune.addTextNode(this.invoiceObj.customer_info.state));
      }
      var nodeNazione = nodeSede.addElement("Nazione");
      nodeNazione.addTextNode(this.invoiceObj.customer_info.country);



      // var nodeStabileOrganizzazione = nodeCessionarioCommittente.addElement("StabileOrganizzazione");
      //   var nodeNumeroCivico = nodeStabileOrganizzazione.addElement("NumeroCivico");
      //   var nodeCAP = nodeStabileOrganizzazione.addElement("CAP");
      //   var nodeComune = nodeStabileOrganizzazione.addElement("Comune");
      //   var nodeProvincia = nodeStabileOrganizzazione.addElement("Provincia");
      //   var nodeNazione = nodeStabileOrganizzazione.addElement("Nazione");
      // var nodeRappresentanteFiscale = nodeCessionarioCommittente.addElement("RappresentanteFiscale");
      //   var nodeIdFiscaleIVA = nodeCessionarioCommittente.addElement("IdFiscaleIVA");
      //     var nodeIdPaese = nodeIdFiscaleIVA.addElement("IdPaese");
      //     var nodeIdCodice = nodeIdFiscaleIVA.addElement("IdCodice");
      //   var nodeDenominazione = nodeRappresentanteFiscale.addElement("Denominazione");
      //   var nodeNome = nodeRappresentanteFiscale.addElement("Nome");
      //   var nodeCognome = nodeRappresentanteFiscale.addElement("Cognome");
      // var nodeTerzoIntermediarioOSogettoEmittente = nodeFatturaElettronicaHeader.addElement("TerzoIntermediarioOSoggettoEmittente");
      //   var nodeDatiAnagrafici = nodeTerzoIntermediarioOSogettoEmittente.addElement("DatiAnagrafici");
      //     var nodeIdFiscaleIVA = nodeDatiAnagrafici.addElement("IdFiscaleIVA");
      //       var nodeIdPaese = nodeIdFiscaleIVA.addElement("IdPaese");
      //       var nodeIdCodice = nodeIdFiscaleIVA.addElement("IdCodice");
      //     var nodeCodiceFiscale = nodeDatiAnagrafici.addElement("CodiceFiscale");
      //     var nodeAnagrafica = nodeDatiAnagrafici.addElement("Anagrafica");
      //       var nodeDenominazione = nodeAnagrafica.addElement("Denominazione");
      //       var nodeDenominazione = nodeAnagrafica.addElement("Nome");
      //       var nodeCognome = nodeAnagrafica.addElement("Cognome");
      //       var nodeTitolo = nodeAnagrafica.addElement("Titolo");
      //       var nodCodEORI = nodeAnagrafica.addElement("CodEORI");
      // var nodeSoggettoEmittente = nodeFatturaElettronicaHeader.addElement("SoggettoEmittente");

      // Body
      var nodeFatturaElettronicaBody = nodeRoot.addElement("FatturaElettronicaBody");
      var nodeDatiGenerali = nodeFatturaElettronicaBody.addElement("DatiGenerali");
      var nodeDatiGeneraliDocumento = nodeDatiGenerali.addElement("DatiGeneraliDocumento");
      var nodeTipoDocumento = nodeDatiGeneraliDocumento.addElement("TipoDocumento");
      docType = '';
      if (!this.invoiceObj.document_info.doc_type || this.invoiceObj.document_info.doc_type == '10')
            docType = 'TD01';
      if (this.invoiceObj.document_info.doc_type == '12')
            docType = 'TD04'
      nodeTipoDocumento.addTextNode(docType);
      var nodeDivisa = nodeDatiGeneraliDocumento.addElement("Divisa");
      nodeDivisa.addTextNode(this.invoiceObj.document_info.currency);
      var nodeData = nodeDatiGeneraliDocumento.addElement("Data");
      nodeData.addTextNode(this.invoiceObj.document_info.date);
      var nodeNumero = nodeDatiGeneraliDocumento.addElement("Numero");
      nodeNumero.addTextNode(this.invoiceObj.document_info.number);
      // var nodeDatiRitenuta = nodeDatiGeneraliDocumento.addElement("DatiRitenuta");
      //   var nodeTipoRitenuta = nodeDatiRitenuta.addElement("TipoRitenuta");
      //   var nodeImportoRitenuta = nodeDatiRitenuta.addElement("ImportoRitenuta");
      //   var nodeAliquotaRitenuta = nodeDatiRitenuta.addElement("AliquotaRitenuta");
      //   var nodeCausalePagamento = nodeDatiRitenuta.addElement("CausalePagamento");
      // var nodeDatiBollo = nodeDatiGeneraliDocumento.addElement("DatiBollo");
      //   var nodeBolloVirtuale = nodeDatiBollo.addElement("BolloVirtuale");
      //   var nodeImportoBollo = nodeDatiBollo.addElement("ImportoBollo");
      // var nodeDatiCassaPrevidenziale = nodeDatiGeneraliDocumento.addElement("DatiCassaPrevidenziale");
      //   var nodeTipoCassa = nodeDatiCassaPrevidenziale.addElement("TipoCassa");
      //   var nodeAlCassa = nodeDatiCassaPrevidenziale.addElement("AlCassa");
      //   var nodeImportoContributoCassa = nodeDatiCassaPrevidenziale.addElement("ImportoContributoCassa");
      //   var nodeImponibileCassa = nodeDatiCassaPrevidenziale.addElement("ImponibileCassa");
      //   var nodeAliquotaIVA = nodeDatiCassaPrevidenziale.addElement("AliquotaIVA");
      //   var nodeRitenuta = nodeDatiCassaPrevidenziale.addElement("Ritenuta");
      //   var nodeNatura = nodeDatiCassaPrevidenziale.addElement("Natura");
      //   var nodeRiferimentoAmministrazione = nodeDatiCassaPrevidenziale.addElement("RiferimentoAmministrazione");
      // var nodeScontoMaggiorazione = nodeDatiGeneraliDocumento.addElement("ScontoMaggiorazione")
      //   var nodeTipo = nodeScontoMaggiorazione.addElement("Tipo");
      //   var nodePercentuale = nodeScontoMaggiorazione.addElement("Percentuale");
      //   var nodeImporto = nodeScontoMaggiorazione.addElement("Importo");
      // var nodeImportoTotaleDocumento = nodeDatiGeneraliDocumento.addElement("ImportoTotaleDocumento");
      // var nodeArrotondamento = nodeDatiGeneraliDocumento.addElement("Arrotondamento");
      //   var nodeCausale = nodeDatiGeneraliDocumento.addElement("Causale");
      //   var nodeArt73 = nodeDatiGeneraliDocumento.addElement("Art73");
      // var nodeDatiOrdineAcquisto = nodeDatiGenerali.addElement("DatiOrdineAcquisto");
      //   var nodeRiferimentoNumeroLinea = nodeDatiOrdineAcquisto.addElement("RiferimentoNumeroLinea");
      //   var nodeIdDocumento = nodeDatiOrdineAcquisto.addElement("IdDocumento");
      //   var nodeData = nodeDatiOrdineAcquisto.addElement("Data");
      //   var nodeNumItem = nodeDatiOrdineAcquisto.addElement("NumItem");
      //   var nodeCodiceCommessaConvenzione = nodeDatiOrdineAcquisto.addElement("CodiceCommessaConvenzione");
      //   var nodeCodiceCUP = nodeDatiOrdineAcquisto.addElement("CodiceCUP");
      //   var nodeCodiceCIG = nodeDatiOrdineAcquisto.addElement("CodiceCIG");
      // var nodeDatiContratto = nodeDatiGenerali.addElement("DatiContratto");
      // var nodeDatiConvenzione = nodeDatiGenerali.addElement("DatiConvenzione");
      // var nodeDatiRicezione = nodeDatiGenerali.addElement("DatiRicezione");
      // var nodeDatiFattureCollegate = nodeDatiGenerali.addElement("DatiFattureCollegate");
      // var nodeDatiSAL = nodeDatiGenerali.addElement("DatiSAL");
      //   var nodeRiferimentoFase = nodeDatiSAL.addElement("RiferimentoFase");
      // var nodeDatiDDT = nodeDatiGenerali.addElement("DatiDDT");
      //   var nodeNumeroDDT = nodeDatiDDT.addElement("NumeroDDT");
      //   var nodeDataDDT = nodeDatiDDT.addElement("DataDDT");
      //   var nodeRiferimentoNumeroLinea = nodeDatiDDT.addElement("RiferimentoNumeroLinea");
      // var nodeDatiTrasporto = nodeDatiGenerali.addElement("DatiTrasporto");
      //   var nodeDatiAnagraficiVettore = nodeDatiTrasporto.addElement("DatiAnagraficiVettore");
      //     var nodeIdFiscaleIVA = nodeDatiAnagraficiVettore.addElement("IdFiscaleIVA");
      //       var nodeIdPaese = nodeIdFiscaleIVA.addElement("IdPaese");
      //       var nodeIdCodice = nodeIdFiscaleIVA.addElement("IdCodice");
      //     var nodeCodiceFiscale = nodeDatiAnagraficiVettore.addElement("CodiceFiscale");
      //     var nodeAnagrafica = nodeDatiAnagraficiVettore.addElement("Anagrafica");
      //       var nodeDenominazione = nodeAnagrafica.addElement("Denominazione");
      //       var nodeDenominazione = nodeAnagrafica.addElement("Nome");
      //       var nodeCognome = nodeAnagrafica.addElement("Cognome");
      //       var nodeTitolo = nodeAnagrafica.addElement("Titolo");
      //       var nodCodEORI = nodeAnagrafica.addElement("CodEORI");
      //     var nodeNumeroLicenzaGuida = nodeDatiAnagraficiVettore.addElement("NumeroLicenzaGuida");
      //   var nodeMezzoTrasporto = nodeDatiTrasporto.addElement("MezzoTrasporto");
      //   var nodeCausaleTrasporto = nodeDatiTrasporto.addElement("CausaleTrasporto");
      //   var nodeNumeroColli = nodeDatiTrasporto.addElement("NumeroColli");
      // var nodeDescrizione = nodeDatiTrasporto.addElement("Descrizione");
      // var nodeUnitaMisuraPeso = nodeDatiTrasporto.addElement("UnitaMisuraPeso");
      // var nodePesoLordo = nodeDatiTrasporto.addElement("PesoLordo");
      // var nodePesoNetto = nodeDatiTrasporto.addElement("PesoNetto");
      // var nodeDataOraRitiro = nodeDatiTrasporto.addElement("DataOraRitiro");
      // var nodeDataInizioTrasporto = nodeDatiTrasporto.addElement("DataInizioTrasporto");
      // var nodeTipoResa = nodeDatiTrasporto.addElement("TipoResa");
      // var nodeIndirizzoResa = nodeDatiTrasporto.addElement("IndirizzoResa");
      //   var nodeIndirizzo = nodeIndirizzoResa.addElement("Indirizzo");
      //   var nodeNumeroCivico = nodeIndirizzoResa.addElement("NumeroCivico");
      //   var nodeCAP = nodeIndirizzoResa.addElement("CAP");
      //   var nodeComune = nodeIndirizzoResa.addElement("Comune");
      //   var nodeProvincia = nodeIndirizzoResa.addElement("Provincia");
      //   var nodeNazione = nodeIndirizzoResa.addElement("Nazione");
      // var nodeDataOraConsegna = nodeDatiTrasporto.addElement("DataOraConsegna");
      // var nodeFatturaPrincipale = nodeDatiGenerali.addElement("FatturaPrincipale");
      //   var nodeNumeroFatturaPrincipale = nodeFatturaPrincipale.addElement("NumeroFatturaPrincipale");
      //   var nodeDataFatturaPrincipale = nodeFatturaPrincipale.addElement("DataFatturaPrincipale");
      var nodeDatiBeniServizi = nodeFatturaElettronicaBody.addElement("DatiBeniServizi");
      for (var i = 0; i < this.invoiceObj.items.length; i++)
      {
            var nodeDettaglioLinee = nodeDatiBeniServizi.addElement("DettaglioLinee");
            var nodeNumeroLinea = nodeDettaglioLinee.addElement("NumeroLinea");
            nodeNumeroLinea.addTextNode(i + 1);
            // var nodeTipoCessionePrestazione = nodeDettaglioLinee.addElement("TipoCessionePrestazione");
            // var nodeCodiceArticolo = nodeDettaglioLinee.addElement("CodiceArticolo");
            // var nodeCodiceTipo = nodeCodiceArticolo.addElement("CodiceTipo");
            // var nodeCodiceValore = nodeCodiceArticolo.addElement("CodiceValore");
            var nodeDescrizione = nodeDettaglioLinee.addElement("Descrizione");
            nodeDescrizione.addTextNode(this.invoiceObj.items[i].description);
            var nodeQuantita = nodeDettaglioLinee.addElement("Quantita");
            nodeQuantita.addTextNode(this.invoiceObj.items[i].quantity);
            // var nodeUnitaMisura = nodeDettaglioLinee.addElement("UnitaMisura");
            // var nodeDataInizioPeriodo = nodeDettaglioLinee.addElement("DataInizioPeriodo");
            // var nodeDataFinePeriodo = nodeDettaglioLinee.addElement("DataFinePeriodo");
            var nodePrezzoUnitario = nodeDettaglioLinee.addElement("PrezzoUnitario");
            nodePrezzoUnitario.addTextNode(this.invoiceObj.items[i].unit_price.amount_vat_inclusive)
            // var nodeScontoMaggiorazione = nodeDettaglioLinee.addElement("ScontoMaggiorazione");
            //   var nodeTipo = nodeScontoMaggiorazione.addElement("Tipo")
            //   var nodePercentuale = nodeScontoMaggiorazione.addElement("Percentuale")
            //   var nodeImporto = nodeScontoMaggiorazione.addElement("Importo")
            var nodePrezzoTotale = nodeDettaglioLinee.addElement("PrezzoTotale");
            nodePrezzoTotale.addTextNode(this.invoiceObj.items[i].total_amount_vat_inclusive);
            var nodeAliquotaIVA = nodeDettaglioLinee.addElement("AliquotaIVA");
            nodeAliquotaIVA.addTextNode(this.invoiceObj.items[i].unit_price.vat_rate);
            // var nodeRitenuta = nodeDettaglioLinee.addElement("Ritenuta");
            // var nodeNatura = nodeDettaglioLinee.addElement("Natura");
            // var nodeRiferimentoAmministrazione = nodeDettaglioLinee.addElement("RiferimentoAmministrazione");
            // var nodeAltriDatiGestionali = nodeDettaglioLinee.addElement("AltriDatiGestionali");
            //   var nodeTipoDato = nodeAltriDatiGestionali.addElement("TipoDato");
            //   var nodeRiferimentoTesto = nodeAltriDatiGestionali.addElement("RiferimentoTesto");
            //   var nodeRiferimentoNumero = nodeAltriDatiGestionali.addElement("RiferimentoNumero");
            //   var nodeRiferimentoData = nodeAltriDatiGestionali.addElement("RiferimentoData");
      }
      var nodeDatiRiepilogo = nodeDatiBeniServizi.addElement("DatiRiepilogo")
      var nodeAliquotaIVA = nodeDatiRiepilogo.addElement("AliquotaIVA");
      // nodeAliquotaIVA.addTextNode(this.invoiceObj.billing_info.total_vat_rates.vat_rate);

      nodeAliquotaIVA.addTextNode(this.invoiceObj.billing_info.total_vat_rates[0].vat_rate);

      //nodeAliquotaIVA.addTextNode('22');
      // var nodeNatura = nodeDatiRiepilogo.addElement("Natura");
      // var nodeSpeseAccessorie = nodeDatiRiepilogo.addElement("SpeseAccessorie");
      // var nodeArrotondamento = nodeDatiRiepilogo.addElement("Arrotondamento");
      var nodeImponibileImporto = nodeDatiRiepilogo.addElement("ImponibileImporto");
      nodeImponibileImporto.addTextNode(this.invoiceObj.billing_info.total_vat_rates[0].total_amount_vat_inclusive);

      var nodeImposta = nodeDatiRiepilogo.addElement("Imposta");
      nodeImposta.addTextNode(this.invoiceObj.billing_info.total_vat_rates[0].total_vat_amount);
      // var nodeEsigibilitaIVA = nodeDatiRiepilogo.addElement("EsigibilitaIVA");
      // var nodeRiferimentoNormativo = nodeDatiRiepilogo.addElement("RiferimentoNormativo");
      // var nodeDatiVeicoli = nodeFatturaElettronicaBody.addElement("DatiVeicoli");
      //   var nodeData = nodeDatiVeicoli.addElement("Data");
      //   var nodeTotalePercorso = nodeDatiVeicoli.addElement("TotalePercorso");
      // var nodeDatiPagamento = nodeFatturaElettronicaBody.addElement("DatiPagamento");
      //   var nodeCondizioniPagamento = nodeDatiPagamento.addElement("CondizioniPagamento");
      //   var nodeDettaglioPagamento = nodeDatiPagamento.addElement("DettaglioPagamento");
      //     var nodeBeneficiario = nodeDettaglioPagamento.addElement("Beneficiario");
      //     var nodeModalitaPagamento = nodeDettaglioPagamento.addElement("ModalitaPagamento");
      //     var nodeDataRiferimentoTerminiPagamento = nodeDettaglioPagamento.addElement("DataRiferimentoTerminiPagamento");
      //     var nodeGiorniTerminiPagamento = nodeDettaglioPagamento.addElement("GiorniTerminiPagamento");
      //     var nodeDataScadenzaPagamento = nodeDettaglioPagamento.addElement("DataScadenzaPagamento");
      //     var nodeImportoPagamento = nodeDettaglioPagamento.addElement("ImportoPagamento");
      //     var nodeCodUfficioPostale = nodeDettaglioPagamento.addElement("CodUfficioPostale");
      //     var nodeCognomeQuietanzante = nodeDettaglioPagamento.addElement("CognomeQuietanzante");
      //     var nodeNomeQuitanzante = nodeDettaglioPagamento.addElement("NomeQuitanzante");
      //     var nodeCFQuietanzante = nodeDettaglioPagamento.addElement("CFQuietanzante");
      // var nodeTitoloQuietanzante = nodeDettaglioPagamento.addElement("TitoloQuietanzante");
      // var nodeIstitutoFinanziario = nodeDettaglioPagamento.addElement("IstitutoFinanziario");
      // var nodeIBAN = nodeDettaglioPagamento.addElement("IBAN");
      // var nodeABI = nodeDettaglioPagamento.addElement("ABI");
      // var nodeCAB = nodeDettaglioPagamento.addElement("CAB");
      // var nodeBIC = nodeDettaglioPagamento.addElement("BIC");
      // var nodeScontoPagamentoAnticipato = nodeDettaglioPagamento.addElement("ScontoPagamentoAnticipato");
      // var nodeDataLimitePagamentoAnticipato = nodeDettaglioPagamento.addElement("DataLimitePagamentoAnticipato");
      // var nodePenalitaPagamentiRitardati = nodeDettaglioPagamento.addElement("PenalitaPagamentiRitardati");
      // var nodeDataDecorrenzaPenale = nodeDettaglioPagamento.addElement("DataDecorrenzaPenale");
      // var nodeCodicePagamento = nodeDettaglioPagamento.addElement("CodicePagamento");
      // var nodeAllegati = nodeFatturaElettronicaBody.addElement("Allegati");
      //   var nodeNomeAttachment = nodeAllegati.addElement("NomeAttachment");
      //   var nodeAlgoritmoCompressione = nodeAllegati.addElement("AlgoritmoCompressione");
      //   var nodeFormatoAttachment = nodeAllegati.addElement("FormatoAttachment");
      //   var nodeDescrizioneAttachment = nodeAllegati.addElement("DescrizioneAttachment");
      //   var nodeAttachment = nodeAllegati.addElement("Attachment");   
}

EFattura.prototype.getErrorMessage = function (errorId)
{
      //Document language
      var lang = this.banDocument.locale;
      if (lang.length > 2)
            lang = lang.substr(0, 2);
      var rtnMsg = '';
      if (errorId == this.ID_ERR_ACCOUNTING_TYPE_NOTVALID)
      {
            if (lang == 'it')
                  rtnMsg = "Il tipo di contabilità non è valido. Manca la tabella Conti";
            else
                  rtnMsg = "The file is not valid. The table Accounts is missing";
      }
      if (errorId == this.ID_ERR_DATICONTRIBUENTE_NOTFOUND)
      {
            if (lang == 'it')
                  rtnMsg = "Dati contribuente non trovati. Installare l'app Iva Italia";
            else
                  rtnMsg = "Dati contribuente not found. Please install the app Iva Italia";
      }
      if (errorId == this.ID_ERR_TABLE_ADDRESS_MISSING)
      {
            if (lang == 'it')
                  rtnMsg = "Le colonne indirizzi nella tabella Conti sono mancanti. Aggiornare con il comando Strumenti - Aggiungi nuove funzionalità";
            else
                  rtnMsg = "Address columns of table Accounts are missing. Please update table Accounts with the command Toos - Add new functionalities";
      }
      if (errorId == this.ID_ERR_TABLE_ADDRESS_NOT_UPDATED)
      {
            if (lang == 'it')
                  rtnMsg = "Le colonne indirizzi nella tabella Conti sono di una versione non compatibile. Aggiornare con il comando Strumenti - Converti in nuovo file";
            else
                  rtnMsg = "Address columns are outdated. Please update them with the command Tools - Convert to new file";
      }
      if (errorId == this.ID_ERR_VERSION)
      {
            if (lang == 'it')
                  rtnMsg = "Metodo %1 non supportato. Aggiornare Banana alla versione più recente";
            else
                  rtnMsg = "The function %1 is not supported. Please install the latest version of Banana Accounting";
      }
      return rtnMsg + " [" + errorId + "] ";
}

EFattura.prototype.initParam = function ()
{
      this.param = {};
}

EFattura.prototype.initDatiContribuente = function ()
{
      this.datiContribuente = {};
      var savedParam = this.banDocument.getScriptSettings("ch.banana.script.italy_vat.daticontribuente.js");
      if (savedParam.length > 0)
      {
            this.datiContribuente = JSON.parse(savedParam);
            return true;
      }
      else
      {
            var msg = this.getErrorMessage(this.ID_ERR_DATICONTRIBUENTE_NOTFOUND);
            this.banDocument.addMessage(msg, this.ID_ERR_DATICONTRIBUENTE_NOTFOUND);
      }
      return false;
}

EFattura.prototype.initNamespaces = function ()
{
      this.param.namespaces = [
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

EFattura.prototype.initSchemarefs = function ()
{
      this.param.schemaRefs = [
            'http://ivaservizi.agenziaentrate.gov.it/docs/xsd/fatture/v1.2 http://www.fatturapa.gov.it/export/fatturazione/sdi/fatturapa/v1.2/Schema_del_file_xml_FatturaPA_versione_1.2.xsd'
      ];
};

EFattura.prototype.isEmpty = function (obj)
{
      for (var key in obj)
      {
            if (obj.hasOwnProperty(key))
                  return false;
      }
      return true;
}

EFattura.prototype.saveData = function (output)
{
      var fileName = '';
      var nazione = '';
      var codiceFiscale = '';
      if (!this.isEmpty(this.datiContribuente))
      {
            nazione = this.datiContribuente.nazione;
            codiceFiscale = this.datiContribuente.codiceFiscale;
      }

      //???
      if (nazione === 'IT')
            fileName += codiceFiscale;
      else
            fileName += codiceFiscale;

      fileName += '_'


      var param = JSON.parse(this.banDocument.getScriptSettings());

      var numeroInvio = parseInt(param.progressive).toString(36).toUpperCase();

      for (var i = 5; i > numeroInvio.length; i--)
            fileName += '0'

      fileName += numeroInvio;
      // Names the file to 'test.xml', easier to reload each time on browser, for testing purposes
      //fileName = 'test';

      fileName = Banana.IO.getSaveFileName("Save as", fileName, "XML file (*.xml);;All files (*)")
      if (fileName.length)
      {
            var file = Banana.IO.getLocalFile(fileName)
            file.codecName = "UTF-8";
            file.write(output);
            if (file.errorString)
                  Banana.Ui.showInformation("Write error", file.errorString);
            else
            {
                  Banana.IO.openUrl(fileName);
                  param.progressive++;
                  this.banDocument.setScriptSettings(JSON.stringify(param))
            }
      }
      

}

EFattura.prototype.saveDataWithName = function (output, fileName)
{
      fileName = Banana.IO.getSaveFileName("Save as", fileName, "XML file (*.xml);;All files (*)")
      if (fileName.length)
      {
            var file = Banana.IO.getLocalFile(fileName)
            file.codecName = "UTF-8";
            file.write(output);
            if (file.errorString)
            {
                  Banana.Ui.showInformation("Write error", file.errorString);
            }
            else
            {
                  Banana.IO.openUrl(fileName);
            }
      }
}

EFattura.prototype.setDatiContribuente = function (newDatiContribuenti)
{
      this.datiContribuente = newDatiContribuenti;
}

EFattura.prototype.setParam = function (param)
{
      this.param = param;
      this.verifyParam();
}

EFattura.prototype.verifyParam = function ()
{
      if (!this.name)
            this.name = '';
      if (!this.param)
            this.param = {};
      if (!this.version)
            this.version = '';
}
