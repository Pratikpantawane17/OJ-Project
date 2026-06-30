<div align="center">

<img width="90" height="90" alt="AlgoArena logo" src="https://github.com/user-attachments/assets/1188822c-612a-4fae-8862-0c9784ae4cbb" />

# AlgoArena — Online Judge Platform

**A full-stack Online Judge with per-submission containerized code execution, deployed on a self-managed Kubernetes cluster with production-grade observability.**

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://algoarena-code.vercel.app)
![Node.js](https://img.shields.io/badge/Node.js-43853D?logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)
![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white)
![Kubernetes](https://img.shields.io/badge/Kubernetes-326CE5?logo=kubernetes&logoColor=white)
![AWS](https://img.shields.io/badge/AWS%20EC2-FF9900?logo=amazonaws&logoColor=white)
![Prometheus](https://img.shields.io/badge/Prometheus-E6522C?logo=prometheus&logoColor=white)
![Grafana](https://img.shields.io/badge/Grafana-F46800?logo=grafana&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white)

[Live Demo](https://algoarena-code.vercel.app) · [Report Bug](https://github.com/Pratikpantawane17/OJ-Project/issues) · [Request Feature](https://github.com/Pratikpantawane17/OJ-Project/issues)

</div>

---

## 📖 Overview

AlgoArena is a full-stack Online Judge platform where users solve coding problems, submit solutions in multiple languages, and get instant verdicts — similar in spirit to LeetCode or Codeforces. What sets this project apart is the infrastructure underneath it: every single code submission runs in its own **ephemeral, resource-capped Docker container**, and the entire backend + compiler stack is **orchestrated on a self-managed Kubernetes cluster on AWS EC2**, complete with autoscaling, self-healing, and a full **Prometheus + Loki + Grafana** observability stack.

This isn't a "deploy and forget" project — it's built to demonstrate real infrastructure engineering on top of a working product.

---

## 🏗️ Architecture

```
                              ┌──────────▼───────────┐
                              │   User (Browser)     │
                              └──────────┬───────────┘
                                         │
                              ┌──────────▼───────────┐
                              │  Frontend (React)    │
                              │  Hosted on Vercel    │
                              └──────────┬───────────┘
                                         │
        ┌──────────────────────────────────────────────────────── ┐
        │            AWS EC2 (t2.micro) — k3s Kubernetes Cluster  │
        │                  namespace: algoarena                   │
        │                                                         │
        │   ┌─────────────────────┐       ┌─────────────────────┐ │
        │   │  Backend Service    │       │  Compiler Service   │ │
        │   │  (NodePort :30500)  │       │  (NodePort :30800)  │ │
        │   └──────────┬──────────┘       └──────────┬──────────┘ │
        │              │                             │            │
        │   ┌──────────▼──────────┐       ┌──────────▼──────────┐ │
        │   │  Backend Deployment │       │ Compiler Deployment │ │
        │   │  Pod (auth, CRUD)   │       │ Pod (dockerode)     │ │
        │   └─────────────────────┘       └──────────┬──────────┘ │
        │                                            │            │
        │                                 ┌──────────▼──────────┐ │
        │                                 │ Per-Submission      │ │
        │                                 │ Docker Container    │ │
        │                                 │ 128MB RAM · No Network││ 
        │                                 │ AutoRemove: true    │ │
        │                                 └─────────────────────┘ │
        │                                                         │
        │   ┌──────────────────── monitoring namespace ──────────┐│
        │   │  Prometheus  ·  Loki + Promtail  ·  Grafana        ││
        │   └────────────────────────────────────────────────────┘│
        └─────────────────────────────────────────────────────────┘
                                         │
                              ┌──────────▼─────────────┐
                              │   MongoDB Atlas        │
                              │   (External, managed)  │
                              └────────────────────────┘
```

---

## ✨ Features

### 🔐 Authentication & Authorization
- JWT-based Sign-Up & Login
- Protected routes via custom auth middleware (soft & hard checks)
- Role-based access control for Admin-only operations

### 📋 Problem Management (Admin)
- Create, update, delete problems with test cases
- Admin-gated routes — `/problem-form`, `/problemlist`

### 👨‍💻 User Experience
- Conditional home page rendering based on auth state
- In-browser code editor with multi-language support
- Custom input execution + full test-case submission with verdicts

### 🛠️ Compiler Microservice — The Core Engineering Piece
- **Per-submission container isolation** — every `/run` and `/submit` call spins up a fresh Docker container via [`dockerode`](https://github.com/apocas/dockerode), executes the code, and destroys the container immediately after
- Hard resource limits per container: **128MB RAM, 50% CPU, no network access**
- Multi-language support: C++, Python, Java, JavaScript
- No two submissions ever share execution context — true sandboxing, not just process isolation

---

## ☸️ Infrastructure & DevOps

This is the layer that turns AlgoArena from "a project" into "a deployed system."

| Concern | How it's solved |
|---|---|
| **Container orchestration** | Self-managed **k3s** (lightweight Kubernetes) cluster on a single AWS EC2 instance |
| **Pod auto-healing** | Kubernetes `Deployment` controller — maintains desired replica count, restarts crashed pods automatically |
| **Container-level healing** | `kubelet` restarts crashed containers within a pod — zero manual intervention |
| **Liveness & readiness** | `/health` endpoints on both backend and compiler, probed by Kubernetes to detect frozen/zombie processes |
| **Horizontal autoscaling** | `HorizontalPodAutoscaler` (HPA) on the compiler deployment — scales pods up when CPU > 60% |
| **Load balancing** | Kubernetes `Service` (NodePort) — distributes traffic across pod replicas via `kube-proxy` |
| **Secrets management** | Kubernetes `Secret` objects — JWT keys, DB URIs injected via `envFrom`, never hardcoded |
| **Per-submission isolation** | `dockerode` + Docker socket mount (DooD pattern) — pods create sibling containers on the host for every submission |

### Why Kubernetes over a single EC2 instance?

A single EC2 instance gives you compute, but it has **no idea what's running on top of it**. If the Node.js compiler process crashes, nothing restarts it. Kubernetes adds a software intelligence layer — it understands "pods," enforces desired state, and reschedules workloads when they fail. EC2 + an Auto Scaling Group gives you VM-level scaling and healing; Kubernetes gives you **process-level** scaling and healing, which is what actually matters when the thing that crashes is a Node.js server, not the whole machine.

---

## 📊 Observability Stack

Deploying to Kubernetes without visibility into it is half a solution. AlgoArena ships with a full monitoring pipeline installed via **Helm**:

```
┌──────────────┐     scrapes      ┌──────────────┐     queried by      ┌───────────┐
│  Backend Pod │ ───────────────▶│  Prometheus   │ ─────────────────▶ │           │
│ Compiler Pod │                  └──────────────┘                     │  Grafana  │
└──────────────┘                                                       │           │
     │                                                                 │ Dashboards│
     │ logs                                                            │  + Logs   │
     ▼                                                                 └───────────┘
┌──────────────┐     ships to       ┌──────────────┐         queried by       ▲
│   Promtail   │ ─────────────────▶│     Loki      │ ────────────────────────┘
└──────────────┘                    └──────────────┘
```

| Tool | Role |
|---|---|
| **Helm** | Kubernetes package manager — installs the entire Prometheus + Grafana + Loki stack with a single `helm install` instead of dozens of hand-written manifests |
| **Prometheus** | Scrapes and stores time-series metrics (CPU, memory, pod restarts) from every pod in the cluster |
| **Promtail** | Lightweight agent running alongside pods that tails container logs and ships them to Loki |
| **Loki** | Log aggregation backend — stores logs from all pods, queryable by label (e.g. `{app="compiler"}`) |
| **Grafana** | Single pane of glass — visualizes both Prometheus metrics and Loki logs through dashboards, exposed on the cluster via NodePort |

This means I can watch CPU/memory pressure on the compiler pods in real time, and pull up live logs from any pod without SSH-ing into EC2 and grepping files manually.

---

## ⚙️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, TailwindCSS, Axios — deployed on Vercel |
| Backend | Node.js, Express.js, JWT |
| Compiler | Node.js microservice + `dockerode` for per-submission container orchestration |
| Database | MongoDB Atlas (external managed service) |
| Containerization | Docker |
| Orchestration | Kubernetes (k3s) on AWS EC2 |
| Observability | Prometheus, Loki, Promtail, Grafana — installed via Helm |
| Infra-as-config | Kubernetes manifests (Deployment, Service, Secret, HPA) |
| Version Control | Git, GitHub |

---

## 📂 Project Structure

```
OJ-Project/
├── backend/
│   ├── routes/
│   ├── models/
│   ├── middlewares/
│   ├── service/
│   ├── Dockerfile
│   └── index.js
├── compiler/
│   ├── codes/              # runtime-generated, gitignored
│   ├── inputs/              # runtime-generated, gitignored
│   ├── executeFile.js       # dockerode per-submission execution logic
│   ├── generateFile.js
│   ├── generateInputFile.js
│   ├── Dockerfile
│   └── index.js
├── frontend/
│   └── src/
│       └── components/
│           ├── Home.jsx
│           ├── Problem.jsx
│           ├── Dashboard.jsx
│           └── ...
├── k8s/
│   ├── namespace.yaml
│   ├── secret.yaml
│   ├── backend-deployment.yaml
│   ├── compiler-deployment.yaml
│   └── hpa.yaml
├── README.md
└── .env
```

---

## ☁️ Deployment Architecture

| Component | Where it runs |
|---|---|
| Frontend | Vercel (static hosting) |
| Backend | k3s pod on AWS EC2 |
| Compiler | k3s pod on AWS EC2 |
| Per-submission containers | Docker, spawned on EC2 host via DooD |
| Database | MongoDB Atlas (fully external, no infra to manage) |
| Monitoring | Prometheus + Loki + Grafana, same EC2 cluster, separate namespace |

---

## 🧭 Run Locally

### Prerequisites
- Node.js v18+
- Docker (required for per-submission container execution)
- MongoDB Atlas URI

### Setup

```bash
# Clone the repo
git clone https://github.com/Pratikpantawane17/OJ-Project.git
cd OJ-Project

# Install dependencies
cd backend && npm install
cd ../compiler && npm install
cd ../frontend && npm install

# Start each service
cd ../backend && npm run dev
cd ../compiler && npm run dev
cd ../frontend && npm start
```

### Deploy to Kubernetes

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/compiler-deployment.yaml
kubectl apply -f k8s/hpa.yaml

kubectl get pods -n algoarena
```

---

## 🚧 Roadmap / Future Improvements

- [ ] Migrate single-EC2 k3s to multi-node cluster with Auto Scaling Group for node-level healing
- [ ] Replace NodePort with an Ingress controller + domain name
- [ ] Add Karpenter for Kubernetes-aware node provisioning
- [ ] Leaderboard, streaks, and submission history
- [ ] CI/CD pipeline with GitHub Actions for automated image builds

---

## 🙋‍♂️ Maintainer

**Pratik Pantawane**
B.Tech CSE, Walchand College of Engineering, Sangli · ATF Fellow '24 · SWE Co-op @ AlgoUniversity

[GitHub](https://github.com/Pratikpantawane17) · [Email](mailto:pratikpantawane17@gmail.com)

---

## ⭐ Support

If this project was useful or interesting, consider starring the repo — it helps a lot.
