# Orders Dashboard

Frontend Developer Test Assignment: mini dashboard for managing e-commerce orders with realtime updates, sorting, filtering, search, pagination, and editable order details.

## Live Demo (GitHub Pages)
- Built version: `https://maximLomako.github.io/test-task-table/`

## Setup

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Tests

```bash
npm run test
```

## Architecture Notes
- Orders data lives in TanStack Query cache with immutable updates for new orders and status changes.
- A `MockWebSocket` class simulates realtime events with randomized drops; reconnect logic sits in `useOrdersRealtime` to keep connection status separate from UI.
- UI is composed from MUI components with a custom theme, responsive layout, and a modal-based edit flow.

## Bonus Points Implemented
- Dark mode toggle.
- Optimistic UI updates for order status changes.
- Error boundary to avoid full app crashes.
- Accessibility: keyboard navigation for rows, aria labels, live status region.
- Additional tests beyond the required minimum.
- Performance: memoization and optional row virtualization (enabled for larger pages).

## Assumptions
- Mock data is sufficient for this assignment; server calls are simulated through query cache updates.
- Sorting, filtering, and pagination are handled client-side for the dataset size.
