# RescueAI API

## Setup

1. Copy `.env.example` to `.env`.
2. Set `OPENAI_API_KEY` on the server only.
3. Start the full local application with `npm run dev`, or run only the API with `npm run dev:api`.

The default API URL is `http://localhost:5000`.
During frontend development, Vite proxies `/api` and `/socket.io` traffic to the API to avoid browser cross-origin errors.

## Routes

### `GET /health`

Returns service health and whether OpenAI configuration is present.

Routes are also available beneath the frontend-friendly `/api` prefix, for example `GET /api/health` is
served through the Vite proxy in development.

### `GET /incidents`

Returns current incident records and a dashboard summary.

Optional query filters:

- `severity`: `critical`, `high`, or `medium`
- `status`: `active` or `monitoring`

### `POST /analyze-incident`

Analyzes emergency incident text and returns structured, response-oriented triage fields.

```json
{
  "incidentText": "Flood water has reached homes near River Ward. Five residents are trapped on rooftops and the access road is submerged."
}
```

Example response shape:

```json
{
  "disasterType": "flood",
  "severity": "critical",
  "urgency": "life-threatening",
  "recommendedAction": "Dispatch water rescue and medical triage immediately, initiate evacuation warnings, and verify safe alternate access routes.",
  "affectedResources": [
    "trapped residents",
    "residential homes",
    "access road"
  ]
}
```

The analysis prompt is designed for conservative disaster triage: it prioritizes immediate life safety actions, avoids assuming resources are available, and flags uncertainty through operational verification steps.

### `POST /chat-assistant`

Sends an operations question to the RescueAI command assistant.

```json
{
  "message": "What resources should be prioritized for the active flood zone?",
  "context": {
    "incidentId": "INC-2401"
  }
}
```

The AI endpoints require `OPENAI_API_KEY` and use `OPENAI_MODEL` when supplied.

## Simulated Real-Time Alerts

The API server also starts a Socket.IO stream for development dashboard alerts. Connected clients receive an
`emergency-alert` event every few seconds with a simulated disaster notification:

```json
{
  "id": "SIM-0001",
  "severity": "Critical",
  "title": "Rapid river rise detected near occupied housing",
  "location": "River Ward Sector 3",
  "action": "Dispatch evacuation and water rescue teams",
  "createdAt": "2026-05-26T09:00:00.000Z",
  "simulated": true
}
```

Set `VITE_SOCKET_URL` in the frontend environment if the browser should connect to a non-default API host.
