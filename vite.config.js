import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { lookupOnlinePrices } from './src/services/onlinePriceLookup.js';

function priceLookupApi() {
  return {
    name: 'price-lookup-api',
    configureServer(server) {
      server.middlewares.use('/api/price-lookup', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({ error: 'Only POST requests are supported.' }));
        }

        let body = '';
        for await (const chunk of req) body += chunk;
        try {
          const { productName } = JSON.parse(body || '{}');
          if (!productName?.trim()) throw new Error('A product name is required.');
          const prices = await lookupOnlinePrices(productName.trim());
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ prices }));
        } catch (error) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: error.message || 'Online price lookup failed.' }));
        }
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), priceLookupApi()],
  server: {
    host: '0.0.0.0',
    port: 3000
  }
});
