---
title: The virtue of a small sync protocol
description: Keep storage, transport, and application policy as separate seams.
date: 2026-07-11
order: 3
---

A sync library becomes easier to reason about when it makes fewer decisions on your behalf. Storage owns durable local state. Transport owns moving operations. The application owns identity, authorization, and domain meaning.

Those seams are not ceremony. They let tests replace the network, let an application choose a persistence layer, and let operations carry enough context to be inspected when a retry gets stuck.

## Make failures visible

An adapter contract should preserve real errors, not turn them into an empty success. A blocked write is work that needs a decision; hiding it only makes the eventual recovery harder.

Read about [adapter boundaries](/docs/library/adapters) and [configuration options](/docs/library/configuration).
