# naosu

**naosu** is a modern customer support and ticket management platform designed to help teams handle customer issues, conversations, and support workflows in a structured and efficient way.

It centralizes customer requests, internal collaboration, and ticket lifecycle management into a single system so support teams can respond faster, stay organized, and maintain high service quality.

naosu enables teams to track every support interaction from creation to resolution while providing the tools needed for automation, collaboration, and reporting.

---

## Overview

Customer support often involves managing requests coming from multiple sources such as email, forms, and internal reports. Without a structured system, requests can easily be lost, duplicated, or delayed.

naosu solves this by converting every request into a **ticket**, which acts as a structured record containing:

- The customer's issue
- The conversation history
- Assigned support agents
- Priority and status
- Internal notes and collaboration
- Attachments and related activity

Tickets move through a defined lifecycle and allow teams to manage issues from start to resolution in a transparent and scalable way.

---

## Core Concepts

### Tickets

A **ticket** represents a single customer issue or support request.

Each ticket stores important metadata such as:

- Subject
- Description
- Requester
- Priority
- Status
- Assigned agent or team
- Tags and categorization
- Conversation history
- Attachments

Tickets provide a single place where all communication and actions related to an issue are recorded.

---

## Conversations

Every ticket contains a chronological conversation thread.

Conversation messages can include:

- Customer replies
- Agent responses
- Internal notes
- System-generated events

Internal notes allow agents to collaborate privately without exposing messages to the customer.

---

## Ticket Lifecycle

Tickets move through several states during their lifetime:

This lifecycle allows teams to track progress and ensure no request is forgotten.

Typical workflow:

1. A ticket is created
2. It is assigned to an agent or team
3. The agent responds to the customer
4. The issue is resolved
5. The ticket is closed

---

## Assignment & Ownership

Tickets can be assigned to:

- Individual agents
- Support teams
- Groups based on expertise

Assignment ensures accountability and prevents multiple agents from handling the same issue simultaneously.

---

## Collaboration

Support often requires teamwork. naosu allows agents to:

- Leave internal notes
- Mention other team members
- Share context without exposing it to the requester
- Track all activity on a ticket

This keeps communication organized and transparent.

---

## Automation

Automation rules help reduce repetitive manual work by automatically performing actions when specific conditions are met.

Examples include:

- Assigning tickets to a specific team based on tags
- Setting priority based on keywords
- Updating ticket status automatically
- Triggering notifications

Automation helps support teams scale efficiently.

---

## Notifications

naosu keeps agents informed about important activity through notifications.

Common notification triggers include:

- Ticket assignment
- New customer replies
- Status updates
- Mentions in internal notes

Notifications ensure agents stay aware of updates without constantly monitoring tickets.

---

## Search & Organization

As support volumes grow, finding information quickly becomes critical.

naosu provides tools to organize tickets through:

- Tags
- Filters
- Sorting
- Search

Agents can easily find relevant tickets and track ongoing issues.

---

## Architecture

naosu is built using a modern full-stack TypeScript architecture that prioritizes type safety, performance, and developer productivity.

The system uses a monorepo structure to keep backend, frontend, and shared code tightly integrated.

---

## Tech Stack

### Language

**TypeScript**  
Provides strong type safety across the entire application, improving maintainability and developer confidence.

---

### Frontend

**TanStack Router**  
File-based routing with full type safety.

**TailwindCSS**  
Utility-first CSS framework for building consistent interfaces quickly.

**shadcn/ui**  
Accessible and reusable UI component system built on top of Tailwind.

---

### Backend

**Node.js**  
Runtime environment for running the server and APIs.

**Fastify**  
High-performance web framework designed for speed and low overhead.

**tRPC**  
End-to-end type-safe APIs allowing the frontend and backend to share types seamlessly.

---

### Database

**PostgreSQL**  
Reliable relational database engine for storing tickets, users, and conversations.

**Drizzle ORM**  
TypeScript-first ORM that provides a fully typed database layer.

---

### Authentication

**Better-Auth**  
Authentication solution used to manage user accounts, sessions, and access control.

---

### Tooling

**Biome**  
Linting and formatting for consistent code quality.

**Husky**  
Git hooks used to enforce checks before commits.

**Turborepo**  
Optimized monorepo build system for managing multiple packages efficiently.

---

## Goals

naosu is built with the following goals in mind:

- Provide a structured ticket management workflow
- Enable efficient collaboration between support agents
- Maintain a complete history of customer interactions
- Reduce repetitive tasks through automation
- Deliver a fast and responsive user experience
- Maintain full type safety across the stack

---

## Monorepo Structure

The project is organized as a monorepo to keep shared code centralized and maintain strong type safety across services.
