# RescueAI API

## Setup

1. Copy `.env.example` to `.env`.
2. Set `OPENAI_API_KEY` on the server only.
3. Start the API with `npm run dev:api` for development or `npm run start:api`.

The default API URL is `http://localhost:5000`.

## Routes

### `GET /health`

Returns service health and whether OpenAI configuration is present.

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
