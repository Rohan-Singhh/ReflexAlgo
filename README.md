# ReflexAlgo

**A full-stack algorithmic playground for writing, executing, and benchmarking optimized solutions — built from scratch.**

[![Commits](https://img.shields.io/github/commit-activity/m/Rohan-Singhh/ReflexAlgo?style=for-the-badge)](https://github.com/Rohan-Singhh/ReflexAlgo/commits/main)
[![Language](https://img.shields.io/github/languages/top/Rohan-Singhh/ReflexAlgo?style=for-the-badge&color=yellow)](https://github.com/Rohan-Singhh/ReflexAlgo)
[![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)](LICENSE)

---

## What is this?

Most people push DSA solutions to GitHub as raw `.cpp` or `.py` files. ReflexAlgo goes further — it's a platform where you can **write code, run it in the browser, and benchmark it**, all in one place.

The core idea: algorithmic thinking should be interactive, not static. Every solution here is meant to be explored, not just read.

---

## Features

- **In-browser code execution** — write and run solutions without leaving the page
- **Algorithm benchmarking** — compare time complexity across different approaches for the same problem
- **Curated problem set** — covers graphs, dynamic programming, trees, greedy, and competitive programming patterns
- **Contest solutions** — clean, annotated solutions from competitive programming problems
- **Shared utilities** — common data structures and helper logic extracted into a shared module

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js, Vite, Tailwind CSS |
| Backend | Node.js, Express |
| Code Execution | Custom execution engine (sandboxed via backend) |
| Shared | Common utilities and type definitions |

---

## Architecture

```
ReflexAlgo/
├── frontend/       # React + Vite UI — code editor, problem viewer, benchmark charts
├── backend/        # Express server — handles code execution requests securely
└── shared/         # Shared logic — problem schemas, utility functions
```

The backend exposes an execution API that receives code, runs it in a controlled environment, and returns stdout, stderr, and timing data. The frontend never executes untrusted code directly — everything goes through the backend.

---

## Why a custom execution engine?

Building a code execution service is a non-trivial backend problem. It involves:

- **Sandboxing** — ensuring submitted code can't access the host system
- **Timeout handling** — killing processes that run too long
- **Stdio capture** — streaming stdout/stderr back to the client
- **Concurrency** — handling multiple execution requests without blocking

This is the same core problem that LeetCode, HackerRank, and Codeforces solve at scale. ReflexAlgo is a ground-up implementation of that same concept.

---

## Problem Categories

| Category | Examples |
|----------|---------|
| Graph Algorithms | BFS, DFS, Dijkstra, Topological Sort |
| Dynamic Programming | 0/1 Knapsack, LCS, Matrix Chain, Bitmask DP |
| Trees | LCA, Segment Trees, Fenwick Trees |
| Greedy | Interval Scheduling, Activity Selection |
| Competitive Programming | Contest problems with editorial-style explanations |

---

## Getting Started

```bash
# Clone the repo
git clone https://github.com/Rohan-Singhh/ReflexAlgo.git
cd ReflexAlgo

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install

# Start backend
cd ../backend && npm run dev

# Start frontend (new terminal)
cd ../frontend && npm run dev
```

Frontend runs at `http://localhost:5173`  
Backend API runs at `http://localhost:5000`

---

## About the Author

Built by [Rohan Singh](https://github.com/Rohan-Singhh) — pre-final year CSE student at VIT.

ReflexAlgo is where I consolidate everything I learn across competitive programming and system design.

---

## License

MIT — use it, fork it, build on it.
