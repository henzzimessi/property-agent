# PURE Home River – Take‑Home Project

Full stack solution for the L3 Senior Full Stack Engineer take‑home.

**Author:** Ian

## Contents

- `docs/erd.md` — relational data model (ERD)
- `docs/postman_collection.json` — Postman collection
- `backend/` — Fastify + TypeScript REST API
- `web/` — Vue 3 + Vite client

## Run

### Backend

```bash
cd backend
npm install
npm run dev
```

API: `http://localhost:3001`

### Frontend

```bash
cd web
npm install
npm run dev
```

UI: `http://localhost:3000`

## Tests

### Backend

```bash
cd backend
npm test
```

### Frontend (unit)

```bash
cd web
npm test
```

### Frontend (E2E)

```bash
cd web
npm run test:e2e
```

## REST API

- `GET /agents`
- `GET /agents/:id`
- `POST /agents`
- `PUT /agents/:id`
- `DELETE /agents/:id`

### curl

```bash
curl -X POST http://localhost:3001/agents \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Alex","lastName":"Rivera","email":"alex@purehr.com","mobileNumber":"555-123-4567"}'

curl http://localhost:3001/agents

curl http://localhost:3001/agents/<id>

curl -X PUT http://localhost:3001/agents/<id> \
  -H "Content-Type: application/json" \
  -d '{"mobileNumber":"555-999-0000"}'

curl -X DELETE http://localhost:3001/agents/<id>
```

## Postman

1. Import `docs/postman_collection.json`
2. Run **Create Agent** first (sets `agentId`)
3. Run **Get/Update/Delete**

## Validation

- Zod validation
- Consistent error response: `error` + optional `details`
- Email uniqueness enforced (409)

## Submission checklist

- [ ] Start backend and frontend
- [ ] Run all tests
- [ ] Verify ERD renders
- [ ] Commit and push
