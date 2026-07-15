# Grocery Price Tracker

A React + Vite grocery price comparison app with pages for home, login, registration, dashboard, add price, compare, profile, and admin.

## Scripts

- `npm install`
- `npm run dev`

## Notes

The app includes an approval-time online price lookup during local development. Sign in as
`market@markertracker.com` with password `demo123`, then select **Verify & approve** for a
submission. The development server queries the official Carrefour, Naivas, and Quickmart
search pages, saves only matching price results, and shows the source link in Compare.

Use an exact product name with brand and pack size (for example, `Bella Toilet Paper 4 Pack`).
Some stores require a selected delivery branch or may block automated requests; unmatched stores
are intentionally omitted rather than being assigned an estimated price.

For a production deployment, move the `/api/price-lookup` handler from `vite.config.js` into a
serverless function or backend service. GitHub Pages cannot run this server-side lookup.
