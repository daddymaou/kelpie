---
title: Rules
description: Keep client sync policy separate from authorization and server-side invariants.
group: CUSTOMIZE
order: 8
---

Rules describe how a client queues and reconciles changes. They improve user experience; they are not a security boundary. A modified client can bypass any local rule, so the server must still authorize every operation.

## Scope policies narrowly

Assign merge and retry behavior by collection or operation type. A transient connection error can retry; an expired credential needs re-authentication; a schema violation needs correction. Treating all three as “offline” hides the reason a write is stuck.

## Keep policy deterministic

Resolvers should depend only on their explicit input. Do not branch on local time or browser identity unless that value is itself part of the operation metadata.

## Reject with context

When a rule blocks an operation, retain a structured reason and the operation identifier. The UI can then offer a repair, sign-in, or export action without exposing private transport details.

## Server remains authoritative

Validate ownership, access, and cross-record invariants at the server boundary. A local rule can prevent a confusing edit, but it cannot grant permission or reserve a shared resource.
