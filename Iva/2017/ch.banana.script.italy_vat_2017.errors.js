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

var ID_ERR_VERSIONE = "ID_ERR_VERSIONE";
var ID_ERR_CODICI_ND = "ID_ERR_CODICI_ND";
var ID_ERR_TIPOVERSAMENTO = "ID_ERR_TIPOVERSAMENTO";
var ID_ERR_TABELLA_INDIRIZZI_MANCANTE = "ID_ERR_TABELLA_INDIRIZZI_MANCANTE";
var ID_ERR_TABELLA_INDIRIZZI_NONCOMPATIBILE = "ID_ERR_TABELLA_INDIRIZZI_NONCOMPATIBILE";
var ID_ERR_XML_ELEMENTO_NATURA_N6 = "ID_ERR_XML_ELEMENTO_NATURA_N6";
var ID_ERR_XML_ELEMENTO_NATURA_NONPRESENTE = "ID_ERR_XML_ELEMENTO_NATURA_NONPRESENTE";
var ID_ERR_XML_ELEMENTO_NATURA_PRESENTE = "ID_ERR_XML_ELEMENTO_NATURA_PRESENTE";
var ID_ERR_XML_LUNGHEZZA_NONVALIDA = "ID_ERR_XML_LUNGHEZZA_NONVALIDA";
var ID_ERR_XML_LUNGHEZZAMIN_NONVALIDA = "ID_ERR_XML_LUNGHEZZAMIN_NONVALIDA";
var ID_ERR_XML_LUNGHEZZAMAX_NONVALIDA = "ID_ERR_XML_LUNGHEZZAMAX_NONVALIDA";
var ID_ERR_LIQUIDAZIONE_INTERESSI_VERSAMENTO_MENSILE = "ID_ERR_LIQUIDAZIONE_INTERESSI_VERSAMENTO_MENSILE";
var ID_ERR_LIQUIDAZIONE_INTERESSI_DIFFERENTI = "ID_ERR_LIQUIDAZIONE_INTERESSI_DIFFERENTI";
var ID_ERR_DATIFATTURE_MANCA_CODICEFISCALE = "ID_ERR_DATIFATTURE_MANCA_CODICEFISCALE";
var ID_ERR_DATIFATTURE_TIPODOCUMENTO_NONAMMESSO = "ID_ERR_DATIFATTURE_TIPODOCUMENTO_NONAMMESSO";
var ID_ERR_REGISTRI_VENTILAZIONE_DIVERSA = "ID_ERR_REGISTRI_VENTILAZIONE_DIVERSA";
var ID_ERR_GRUPPO_CLIENTI_MANCANTE = "ID_ERR_GRUPPO_CLIENTI_MANCANTE";
var ID_ERR_GRUPPO_FORNITORI_MANCANTE = "ID_ERR_GRUPPO_FORNITORI_MANCANTE";

/**
* return the text error message according to error id
*/
function getErrorMessage(errorId) {
    switch (errorId) {
        case ID_ERR_VERSIONE:
            return "Metodo %1 non supportato. Aggiornare Banana ad una versione più recente.";
        case ID_ERR_CODICI_ND:
            return "Codici %1 non definiti";
        case ID_ERR_TIPOVERSAMENTO:
            return "Periodo non valido: invio di un unico mese con tipo versamento trimestrale";
        case ID_ERR_TABELLA_INDIRIZZI_MANCANTE:
            return "Le colonne indirizzi nella tabella Conti sono mancanti. Aggiornare con il comando Strumenti - Aggiungi nuove funzionalità";
        case ID_ERR_TABELLA_INDIRIZZI_NONCOMPATIBILE:
            return "Le colonne indirizzi nella tabella Conti sono di una versione non compatibile. Aggiornare con il comando Strumenti - Converti in nuovo file";
        case ID_ERR_XML_ELEMENTO_NATURA_N6:
            return "Natura N6 (reverse charge) vanno anche obbligatoriamente valorizzati i campi Imposta ed Aliquota";
        case ID_ERR_XML_ELEMENTO_NATURA_NONPRESENTE:
            return "<Natura> non presente a fronte di <Aliquota> e/o <Imposta> pari a zero";
        case ID_ERR_XML_ELEMENTO_NATURA_PRESENTE:
            return "<Natura> presente a fronte di <Aliquota> e/o <Imposta> diversa da zero";
        case ID_ERR_XML_LUNGHEZZA_NONVALIDA:
            return "Lunghezza stringa non valida per l'elemento %1: %2. Lunghezza richiesta: %3";
        case ID_ERR_XML_LUNGHEZZAMIN_NONVALIDA:
            return "Lunghezza stringa non valida per l'elemento %1: %2. Lunghezza minima: %3";
        case ID_ERR_XML_LUNGHEZZAMAX_NONVALIDA:
            return "Lunghezza stringa non valida per l'elemento %1: %2. Lunghezza massima: %3";
        case ID_ERR_LIQUIDAZIONE_INTERESSI_VERSAMENTO_MENSILE:
            return "Sono stati registrati degli interessi (L-INT) con tipo di versamento mensile";
        case ID_ERR_LIQUIDAZIONE_INTERESSI_DIFFERENTI:
            return "La registrazione degli interessi %1% EUR %2 manca o non è corretta.";
        case ID_ERR_DATIFATTURE_MANCA_CODICEFISCALE:
            return "Il codice fiscale è obbligatorio in assenza della partita iva. %1";
        case ID_ERR_DATIFATTURE_TIPODOCUMENTO_NONAMMESSO:
            return "TipoDocumento %1 non ammesso con IdPaese %2";
        case ID_ERR_REGISTRI_VENTILAZIONE_DIVERSA:
            return "Le registrazioni per la ventilazione dei corrispettivi mancano o non sono corrette. Calcolato (C-VEN): %1, registrato (C-REG): %2";
        case ID_ERR_GRUPPO_CLIENTI_MANCANTE:
            return "Gruppo Clienti non definito. Impostare il gruppo con il comando Conta2 - Clienti - Impostazioni";
        case ID_ERR_GRUPPO_FORNITORI_MANCANTE:
            return "Gruppo Fornitori non definito. Impostare il gruppo con il comando Conta2 - Fornitori - Impostazioni";
    }
    return "";
}
