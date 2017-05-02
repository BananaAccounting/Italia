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

var ID_ERR_VERSIONE = "ID_ERR_VERSIONE";
var ID_ERR_CODICI_ND = "ID_ERR_CODICI_ND";
var ID_ERR_PERIODO_NONVALIDO = "ID_ERR_PERIODO_NONVALIDO";
var ID_ERR_XML_ELEMENTO_NATURA_NONPRESENTE = "ID_ERR_XML_ELEMENTO_NATURA_NONPRESENTE";
var ID_ERR_XML_ELEMENTO_NATURA_PRESENTE = "ID_ERR_XML_ELEMENTO_NATURA_PRESENTE";
var ID_ERR_XML_LUNGHEZZA_NONVALIDA = "ID_ERR_XML_LUNGHEZZA_NONVALIDA";
var ID_ERR_XML_LUNGHEZZAMIN_NONVALIDA = "ID_ERR_XML_LUNGHEZZAMIN_NONVALIDA";
var ID_ERR_XML_LUNGHEZZAMAX_NONVALIDA = "ID_ERR_XML_LUNGHEZZAMAX_NONVALIDA";

/**
* return the text error message according to error id
*/
function getErrorMessage(errorId) {
    switch (errorId) {
        case ID_ERR_VERSIONE:
            return "Lo script non è supportato. Aggiornare Banana ad una versione più recente.";
        case ID_ERR_CODICI_ND:
            return "Codici %1 non definiti";
        case ID_ERR_PERIODO_NONVALIDO:
            return "Periodo non valido. Selezionare un mese oppure un trimestre.";
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
    }
    return "";
}
