import express from 'express';
import fetch from 'node-fetch';
import  { parseDocument }  from 'htmlparser2';
import  {selectOne}  from 'css-select';

const app = express()
const port = 3000

// Criando a funcao de scrap do site para fazer scraps
async function scrapeQuote() {
  try {
    const response = await fetch('https://quotes.toscrape.com/');
    const html = await response.text();
    const root = parseDocument(html);
    
    const quoteElement = selectOne('.quote', root);
    const quote = selectOne('.text', quoteElement)?.children[0].data.trim();
    const author = selectOne('.author', quoteElement)?.children[0].data.trim();
    
    return { quote:quote, author:author };
  } catch (error) {
    console.error('Error scraping quote:', error);
    throw error;
  }
}

// Email sending function
async function sendEmail(quote, author) {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: 'onboarding@resend.dev',
      to: 'figueiroaedson@hotmail.com', // Botar o email que quer enviar aqui
      subject: 'Scraping de Itens',
      html: `<h1>Essse aqui é o email para mostrar que o email esta funcionando e o scraping também</h1>
             <p>${quote}</p>
             <p>- ${author}</p>`,
    }),
  });

  const data = await res.json();
  return data;
}

// API endpoint para para o scrap
app.get('/send-quote', async (req, res) => {
  try {
    const { quote, author } = await scrapeQuote();
    const emailResult = await sendEmail(quote, author);
    res.json({ message: 'Quote scraped e o email enviado', quote, author, emailResult });
  } catch (error) {
    res.status(500).json({ error: 'Ocorreu um Erro' });
  }
});

app.listen(port, () => {
  console.log(`Servidor no http://localhost:${port}`);
});