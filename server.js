const express = require('express');
const { MercadoPagoConfig, Preference } = require('mercadopago');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // serve os arquivos do site

// ── Configure suas credenciais aqui ──
const client = new MercadoPagoConfig({
    accessToken: 'SEU_ACCESS_TOKEN_AQUI', // substitua pelo seu token do Mercado Pago
});

app.post('/criar-preferencia', async (req, res) => {
    const { items } = req.body;

    try {
        const preference = new Preference(client);
        const result = await preference.create({
            body: {
                items: items.map(item => ({
                    title: item.title,
                    quantity: item.quantity,
                    unit_price: item.unit_price,
                    currency_id: 'BRL',
                })),
                back_urls: {
                    success: 'http://localhost:3000/obrigado.html',
                    failure: 'http://localhost:3000/index.html',
                    pending: 'http://localhost:3000/obrigado.html',
                },
                auto_return: 'approved',
                // payment_methods: {} — configure formas de pagamento no painel do MP
            }
        });

        res.json({ init_point: result.init_point });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao criar preferência' });
    }
});

app.listen(3000, () => {
    console.log('Servidor rodando em http://localhost:3000');
});
