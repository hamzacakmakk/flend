# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Flend** is a B2B SaaS platform for e-commerce marketplace sellers (Trendyol, Hepsiburada, Amazon, etc.) that provides automated competitor tracking and profit optimization. The system scrapes competitor prices 24/7 and adjusts the seller's prices via marketplace APIs based on user-defined rules (e.g., "undercut competitor by 1 TL but never go below cost").

**Team:** Roseware (5 members: Tufan Akbaş, Mehmet Taşcı, M. Hamza Çakmak, Kadir Cihan Kığılcım, Nurullah Turgut)

## Current State

This repository is in the **specification and planning phase** — no source code has been written yet. It contains:
- Requirements analysis (`Gereksinim-Analizi.md`)
- API design (`API-Tasarimi.md`, `flend_api_updated.yaml` — OpenAPI 3.0.3)
- Task distribution docs (`Rest-API.md`, `WebFrontEnd.md`, `MobilFrontEnd.md`, `MobilBackEnd.md`)
- Per-member requirement/design/task docs in named directories

All documentation is written in **Turkish**.

## API Specification

The complete API is defined in `flend_api_updated.yaml` (OpenAPI 3.0.3). Key details:
- **Auth:** JWT Bearer token
- **Base URLs:** `https://api.flend.com/v1` (prod), `https://staging-api.flend.com/v1` (staging), `http://localhost:3000/v1` (dev)
- **Modules:** Auth, Users/Subscriptions, Integrations, Inventory, Competitors, Pricing Rules, Analytics, Notifications

## Team Responsibility Map

| Member | Domain | API Prefix |
|---|---|---|
| Tufan Akbaş | Auth, Users, Subscriptions | `/auth`, `/users` |
| Mehmet Taşcı | Marketplace Integrations, Inventory | `/integrations`, `/inventory` |
| M. Hamza Çakmak | Competitor Tracking | `/competitors` |
| Kadir Cihan Kığılcım | Dynamic Pricing Rules | `/api/pricing-rules` |
| Nurullah Turgut | Analytics, Notifications | `/analytics`, `/notifications` |

## Repository Structure

- `<MemberName>/` — Each member has a directory with 5 markdown files: requirements, API design, REST tasks, web frontend tasks, mobile tasks
- Root markdown files — Project-wide docs (requirements analysis, API design, task distribution)
- `flend_api_updated.yaml` — Single source of truth for the API contract
