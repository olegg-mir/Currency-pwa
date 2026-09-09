# Currenzy

A mobile-first, installable currency converter for fiat and crypto. Currenzy uses public Coinbase rates, keeps the last successful snapshot on the device, and remains useful when the network is unavailable.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Folegg-mir%2FCurrency-pwa)

## Features

- Full searchable Coinbase fiat and crypto catalog
- Six-hour rate refresh window with manual offline mode
- Installable PWA with an offline application shell
- English and Russian interface
- System, light and dark themes
- Configurable result precision (0–10 decimal places)
- Touch drag-and-drop and keyboard-accessible currency ordering
- Local flags, common crypto logos and offline-safe monogram fallbacks

## Development

Requires Node.js 22.x. The pinned major version matches the Vercel runtime and prevents an automatic major upgrade.

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Checks

```bash
npm test
npm run typecheck
npm run lint
npm run build
```

## Offline behaviour

The application shell and local icons are precached by Serwist. A validated rates snapshot and user preferences are stored in IndexedDB. Currenzy never requests rates when manual offline mode is enabled or the browser reports no connection. A first-time offline visit needs one successful online refresh before conversions are available.

## Data source

Rates and currency metadata come from Coinbase public endpoints. Values are informational reference rates and do not include trading fees or banking spreads. No API key is required.

See [TECHNICAL.md](./TECHNICAL.md) for architecture, data contracts, caching, PWA assets, persistence and deployment details.
