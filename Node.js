const express = require("express");
const { google } = require("googleapis");
const bodyParser = require("body-parser");
const app = express();
app.use(bodyParser.json());

const auth = new google.auth.GoogleAuth({
  keyFile: "credenciais.json", // arquivo da service account
  scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
});

const sheets = google.sheets({ version: "v4", auth });

app.post("/webhook", async (req, res) => {
  const intentName = req.body.queryResult.intent.displayName;

  if (intentName === "ConsultarProduto") {
    const nome = req.body.queryResult.parameters["produto"];

    const spreadsheetId = "SEU_ID_DA_PLANILHA";
    const range = "Produtos!A:B"; // Exemplo de aba e intervalo

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const linhas = response.data.values;
    const produto = linhas.find((linha) => linha[0].toLowerCase() === nome.toLowerCase());

    let resposta = "Produto não encontrado.";
    if (produto) {
      resposta = `O preço do ${produto[0]} é R$${produto[1]}.`;
    }

    return res.json({
      fulfillmentText: resposta,
    });
  }

  res.json({ fulfillmentText: "Intent não reconhecida." });
});

app.listen(3000, () => console.log("Webhook rodando na porta 3000"));
