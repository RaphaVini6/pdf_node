const express = require('express');
const bodyParser = require('body-parser');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const ejs = require('ejs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// Função para gerar HTML dinamicamente usando EJS
const generateHTML = async (data) => {
    const templatePath = path.join(__dirname, 'templates', 'description.ejs');
    const htmlContent = await ejs.renderFile(templatePath, data);
    return htmlContent;
};

// Rota para gerar o PDF a partir das informações fornecidas
app.post('/generate-pdf', async (req, res) => {
    try {
        const { nome, idade, profissao, descricao } = req.body;

        // Verificar se todas as informações foram fornecidas
        if (!nome || !idade || !profissao || !descricao) {
            return res.status(400).send('Todos os campos são obrigatórios');
        }

        // Gerar o HTML dinâmico
        const htmlContent = await generateHTML({ nome, idade, profissao, descricao });

        // Inicializar o Puppeteer
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        // Definir o conteúdo da página
        await page.setContent(htmlContent);

        // Gerar o PDF
        const pdfBuffer = await page.pdf({ format: 'A4' });

        // Fechar o navegador
        await browser.close();

        // Enviar o PDF gerado
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename=description.pdf',
        });

        res.send(pdfBuffer);
    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).send('An error occurred while generating the PDF');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
