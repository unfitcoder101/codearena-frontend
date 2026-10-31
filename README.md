# CodeArena — Personal Interview Prep OS

> Replace your Excel sheet and Google Doc. One system for everything.

🔗 **Live Demo**: https://codearena-frontend-lovat.vercel.app                                                            
📦 **Backend**: https://github.com/unfitcoder101/codearena-backend                                                          
🎨 **Frontend**: https://github.com/unfitcoder101/codearena-frontend
                        
---

## The Problem I Built This To Solve

Every serious interview candidate has the same mess — an Excel sheet tracking problems, a Google Doc with notes, browser bookmarks across LeetCode and Codeforces, and zero visibility into whether they're actually improving.

CodeArena replaces all of that with one intelligent system.

---

## What Makes This Different From LeetCode

LeetCode tests you. CodeArena teaches you.

| | LeetCode | CodeArena |
|---|---|---|
| Feedback | Pass or fail | Why you failed, what pattern you repeat |
| Memory | None | Every solution + notes saved permanently |
| Cross-platform | No | Save problems from any platform |
| Progress | None | Heatmap, radar chart, score trend |
| AI | None | Verdict-aware code review + interview simulation |

---

## Core Features

**🐳 Sandboxed Code Execution — Built From Scratch**

User code runs in Docker containers with hard isolation:
- `--network none` — zero internet access
- `--memory=256m` — memory cap prevents memory bombs
- `--cpus=0.5` — CPU cap prevents CPU exhaustion
- `--ulimit nproc` (50–100 per language) — limits process count against fork bombs
- Per-language timeout (JS 5s, Java 8s, C++ 10s) — the container process is killed when time runs out
- 64KB output cap prevents output flooding

Built entirely from scratch in Node.js. No third-party judge locally. Production uses Judge0 API because the backend runs on Vercel (serverless), which can't run Docker — this was a deliberate infrastructure tradeoff, not a limitation of the engine itself.

**🤖 Async AI Pipeline With Self-Correction**

Every submission triggers a background AI analysis using Groq's Groq (openai/gpt-oss-120b):

1. Submission saved → verdict returned to user immediately
2. Analysis job fires async — user never waits
3. Prompt builder creates a verdict-aware prompt
4. Response validated with Zod schema
5. If validation fails → error sent back to model for self-correction
6. Frontend polls every 3 seconds until complete

**Verdict-aware prompts** — the AI gets different instructions based on what happened:
- `AC` → optimize further, find hidden edge cases
- `WA` → identify the logical bug, don't give full solution
- `TLE` → identify bottleneck, suggest better algorithm
- `CE` → explain the compilation error in plain English

**🎤 AI Interviewer Mode**

After any submission, click "Start AI Interview." Groq acts as a senior FAANG interviewer:
- "Walk me through your approach."
- "What's the time complexity?"
- "Can you optimize the space?"
- "What edge cases did you consider?"

Full conversation saved permanently. Re-read before real interviews.

**📦 Personal Vault**

Save problems from LeetCode, Codeforces, anywhere:
- Paste link + your solution code
- Write markdown notes — approach, key insight, mistakes
- Get AI-generated progressive hints (3 levels, cached after first call)
- Track solved status and attempt count
- Search by title, filter by platform, tag, difficulty

**📊 Progress Dashboard**

- GitHub-style activity heatmap — 15 weeks of solving history
- Topic radar chart — accuracy across Arrays, DP, Graphs, Trees, etc — computed from real submission data
- Code quality trend line — AI score over last 20 submissions
- Streak counter — current and longest streak
- Difficulty progression — visual of Easy → Medium → Hard over time

---

## Architecture

```
User submits code
       │
       ▼
  Auth Middleware (JWT verify)
       │
       ▼
  Rate Limiter (100 req/15min global, 10/15min on auth)
       │
       ▼
  Submission Controller
  ├── Save submission (PENDING)
  ├── Create Analysis placeholder
  ├──   ├── Fire AI analyzer (async, not awaited)
  └── Run Judge
           │
           ▼
     runCode() — routes by language
     ├── Local: Docker container (isolated)
     └── Production: Judge0 API
           │
           ▼
     Multi test case loop (fail-fast)
           │
           ▼
     Verdict saved → User gets response
           │
     (background)
           ▼
     AI Analyzer Pipeline
     ├── Fetch submission + problem
     ├── Build verdict-aware prompt
     ├── Call Groq (openai/gpt-oss-120b)
     ├── Validate with Zod schema
     ├── Self-correct if invalid
     └── Save to Analysis collection
```

---

## Security Model

| Threat | Defense |
|---|---|
| Fork bomb | `--ulimit nproc` (50–100 per language) |
| Memory exhaustion | `--memory=256m` |
| CPU exhaustion | `--cpus=0.5` |
| Network access | `--network none` |
| Infinite loops | Per-language timeout kills the container process (JS 5s, Java 8s, C++ 10s) |
| Output flooding | 64KB output cap |
| Brute force login | Rate limiter 10 req/15min on auth routes |
| Mass API abuse | Helmet + global rate limiter |

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Frontend | React + Vite | Fast dev, modern build |
| Code Editor | Monaco Editor | Same as VS Code |
| Backend | Node.js + Express | Async-first, perfect for concurrent executions |
| Database | MongoDB Atlas | Document model fits submission/analysis structure |
| Auth | JWT + bcrypt | Stateless, scales horizontally |
| AI | Groq (openai/gpt-oss-120b) | Fast inference, free tier sufficient |
| Validation | Zod | Runtime schema validation on AI responses |
| Local execution | Docker | Full isolation, built from scratch |
| Production execution | Judge0 | Vercel (serverless) can't run Docker |
| Frontend deploy | Vercel | Auto-deploy on push |
| Backend deploy | Vercel (serverless) | Auto-deploy on push, no server to maintain |

---

## Running Locally

```bash
# Prerequisites: Node.js, MongoDB, Docker Desktop running

# Backend
git clone https://github.com/unfitcoder101/codearena-backend
cd codearena-backend
npm install
cp .env.example .env  # fill in your values
npm run dev

# Frontend
git clone https://github.com/unfitcoder101/codearena-frontend
cd codearena-frontend
npm install
npm run dev
```

**.env values needed:**
```
PORT=4000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/codearena
JWT_SECRET=your_long_secret
GROQ_API_KEY=get_free_at_console.groq.com
FRONTEND_URL=http://localhost:5173
```

---

## What I'd Build Next

- **WebSocket real-time AI push** — replace polling with instant push when analysis completes
- **AWS EC2 deployment** — run Docker sandbox in production instead of Judge0
- **Spaced repetition** — surface problems due for revision based on forgetting curve
- **Weak pattern detection** — find recurring mistakes across submissions
- **Mock interview sessions** — timed full interview simulations with scoring

---

## Author

Built by **Harshvardhan Kasliwal**
[LinkedIn](https://www.linkedin.com/in/harshvardhan-kasliwal-675207229/)     · [GitHub](https://github.com/unfitcoder101)  · [X](https://x.com/unfitcoder) 
