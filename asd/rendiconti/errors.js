// Copyright [2024] [Banana.ch SA - Lugano Switzerland]
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


/* Update: 2023-12-19 */


var ID_ERR_VERSIONE = "ID_ERR_VERSIONE";
var ID_ERR_LICENZA_ADVANCED = "ID_ERR_LICENZA_ADVANCED";
var ID_ERR_LICENZA_PROFESSIONAL = "ID_ERR_LICENZA_PROFESSIONAL";
var ID_ERR_GRUPPO_MANCANTE = "ID_ERR_GRUPPO_MANCANTE";
var ID_ERR_GRUPPO_ERRATO = "ID_ERR_GRUPPO_ERRATO";
var ID_ERR_GRUPPO_ERRATO_CATEGORIA = "ID_ERR_GRUPPO_ERRATO_CATEGORIA";
var ID_ERR_ERRORE_QUADRATURA = "ID_ERR_ERRORE_QUADRATURA";
var ID_ERR_SALDO_APERTURA_SENZA_PRECEDENTE = "ID_ERR_SALDO_APERTURA_SENZA_PRECEDENTE";
var ID_ERR_SALDI_APERTURA_PRECEDENTE_DIFFERENTI = "ID_ERR_SALDI_APERTURA_PRECEDENTE_DIFFERENTI";
var ID_ERR_REGISTRAZIONE_NON_CORRETTA = "ID_ERR_REGISTRAZIONE_NON_CORRETTA";
var ID_ERR_ACCANTONAMENTO_5XMILLE = "ID_ERR_ACCANTONAMENTO_5XMILLE";
var ID_ERR_CODICI_GR1_5XMILLE = "ID_ERR_CODICI_GR1_5XMILLE";

/**
 * return the text error message according to error id
 */
function getErrorMessage(errorId) {
    switch (errorId) {
        case ID_ERR_VERSIONE:
            if (BAN_EXPM_VERSION) {
                return "L'estensione richiede come versione minima Banana Contabilità Plus " + BAN_VERSION + "." + BAN_EXPM_VERSION;
            }
            else {
                return "L'estensione richiede come versione minima Banana Contabilità Plus " + BAN_VERSION;
            }
        case ID_ERR_GRUPPO_ERRATO:
            return "colonna <%GRCOLUMN>, valore <%GR> Codice gruppo inserito errato. Modificare il codice gruppo nella tabella Conti.";

        case ID_ERR_GRUPPO_ERRATO_CATEGORIA:
            return "colonna <%GRCOLUMN>, valore <%GR> Codice gruppo inserito errato. Modificare il codice gruppo nella tabella Categorie.";    
    
        case ID_ERR_LICENZA_ADVANCED:
            return "L'estensione richiede il piano Advanced.";

        case ID_ERR_LICENZA_PROFESSIONAL:
            return "L'estensione richiede il piano Professional.";

        case ID_ERR_ERRORE_QUADRATURA:
            return "La somma della liquidità iniziale + avanzo/disavanzo non è uguale alla liquidità finale. Importo differenza = ";

        case ID_ERR_SALDO_APERTURA_SENZA_PRECEDENTE:
            return "Saldo colonna Precedente mancante. Il saldo della colonna Apertura deve essere riportato nella colonna Precedente.";

        case ID_ERR_SALDI_APERTURA_PRECEDENTE_DIFFERENTI:
            return "I saldi delle colonne Apertura e Precedente sono differenti. Modificare i saldi in modo che siano uguali.";

        case ID_ERR_REGISTRAZIONE_NON_CORRETTA:
            return "Per il Rendiconto di Cassa sono ammesse solo registrazioni con conti della liquidità (Banca e Cassa).";

        case ID_ERR_ACCANTONAMENTO_5XMILLE:
            return "L'accantonamento registrato è maggiore della differenza 'Importo percepito - Totale spese gruppi 1,2,3,4'";

        case ID_ERR_CODICI_GR1_5XMILLE:
            return "Il codice %CODEGR1 è stato inserito in più gruppi: %GROUPS. Nelle impostazioni ogni codice deve essere presente in un solo gruppo.";
    }
    return "";
}
