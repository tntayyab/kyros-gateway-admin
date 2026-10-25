# 🚀 Writerify Gateway (KYROS Enterprise LLM Gateway)

> **Private Repository — 100% Owned by TN TAYYAB ([tntayyab/writerifygateway](https://github.com/tntayyab/writerifygateway))**  
> Custom high-performance LLM Gateway and Admin Control Suite for KYROS & Writerify.

---

## 🌟 Key Features
- **Super Admin Control Suite**: Real-time Neon PostgreSQL integration (`Overview`, `User Manage`, `Assets`) with adaptive light/dark UI.
- **Zero-Trust Gatekeeper**: Automatic database-level signup interception and instant privilege control for Boss (`itstasdidnur@gmail.com`).
- **Complete Tenant Isolation**: Multi-agent LLM routing, fallback orchestration, and cost tracking with zero billing cross-contamination.
- **Production URL**: [https://gateway.writerify.org](https://gateway.writerify.org)

---

## 📦 Architecture & Deployment
- **Frontend**: Vite + React + Tailwind CSS with adaptive theme engine.
- **Backend**: NestJS + Fastify + Prisma + Neon PostgreSQL.
- **Deployment**: Render Web Service (`kyros-gateway-admin` -> `writerifygateway`) via Docker.
- **Health Check**: `https://gateway.writerify.org/api/v1/health`
