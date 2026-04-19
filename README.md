# Math Fun! — Basic Math Trainer for Kids

A web-based addition and subtraction trainer designed for 5-year-olds. Big buttons, colorful feedback, emoji rewards, and streak tracking make practice feel like play.

![screenshot placeholder](https://placehold.co/600x400/fef9ee/9333ea?text=Math+Fun!+%F0%9F%8E%89)

---

## Features

- **Addition and subtraction** with operands 1–9 (answers can exceed 9)
- **On-screen number pad** — big keys that work equally well on a tablet, phone, or desktop
- **Physical keyboard** support — type digits and press Enter to submit
- **Instant feedback** — correct answers trigger a random celebration emoji; wrong answers reveal the correct answer then let the child retry
- **Score, streak, and best-streak** counters
- **Motivation banner** appears after 3+ correct in a row
- No accounts, no login, no cookies, no tracking — pure client-side app

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite 5 |
| Styling | Tailwind CSS 3 |
| Font | Nunito (Google Fonts) |
| Server | nginx:alpine (static file serving) |
| Container | Docker + Docker Compose |

The app is entirely static — no backend, no database, no API calls beyond loading the Google Font on first visit.

---

## Running with Docker (recommended)

```bash
git clone https://github.com/kay1922/math-for-kids.git
cd math-for-kids
docker compose up -d
```

Open **http://localhost:4444** in your browser.

### Requirements
- Docker 24+ with Docker Compose v2

---

## Running locally (development)

```bash
npm install
npm run dev
```

Open **http://localhost:5173**.

### Requirements
- Node.js 20+

---

## Project Structure

```
.
├── src/
│   ├── App.jsx        # Main component — question logic, score, number pad
│   ├── main.jsx       # React entry point
│   └── index.css      # Tailwind base + custom keyframe animations
├── index.html
├── nginx.conf         # nginx server block (security headers, routing)
├── nginx-main.conf    # nginx main config (non-root pid path)
├── Dockerfile         # Multi-stage build: Node builder → nginx:alpine
├── docker-compose.yml
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

---

## Security

The Docker container is hardened beyond the defaults:

| Measure | Detail |
|---------|--------|
| Non-root process | nginx runs as the `nginx` user (UID 101) |
| Read-only filesystem | `read_only: true` in Compose — nothing can be written to the container image layer |
| tmpfs mounts | `/tmp`, `/run`, `/var/cache/nginx`, `/var/run` are in-memory only |
| Dropped capabilities | `cap_drop: ALL` — no Linux capabilities retained |
| No privilege escalation | `no-new-privileges: true` |
| HTTP security headers | See table below |

### HTTP Response Headers

| Header | Value |
|--------|-------|
| `X-Frame-Options` | `DENY` |
| `X-Content-Type-Options` | `nosniff` |
| `X-XSS-Protection` | `1; mode=block` |
| `Referrer-Policy` | `no-referrer` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` |
| `Content-Security-Policy` | `default-src 'self'`; fonts from Google Fonts only; no inline scripts |
| `Server` | version hidden (`server_tokens off`) |

---

## Game Logic

Questions are generated fresh after each answer:

```
operand A  = random integer in [1, 9]
operand B  = random integer in [1, 9]
operator   = + or − with equal probability
```

For subtraction, operands are swapped if needed so the result is always ≥ 1 (no negative answers, no zero).

The answer input is capped at 2 digits. Correct answers advance automatically after 1.2 s; wrong answers show the correct value then clear for a retry.

---

## Customisation

| What | Where |
|------|-------|
| Change the number range | `randomInt` calls in `src/App.jsx` |
| Add multiplication / division | Extend `generateQuestion()` in `src/App.jsx` |
| Change port | `ports` in `docker-compose.yml` |
| Add sounds | Import an audio file and call `.play()` in the correct/wrong handlers |

---

## License

MIT
