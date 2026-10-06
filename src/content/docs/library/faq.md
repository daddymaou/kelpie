---
title: FAQ
description: Answers to common questions about Kelpie, data ownership, and offline behavior.
group: HELP
order: 12
---

## Does Kelpie require a Kelpie server?

No. Kelpie defines client-side storage and transport contracts. Your application can implement a compatible endpoint or use a service that speaks the same operation protocol.

## Is local data encrypted?

Encryption is the responsibility of the runtime and storage adapter you choose. Do not treat browser storage as a secure vault; protect sensitive data with an appropriate platform-backed design.

## Can two devices edit while offline?

Yes, each device can persist local operations independently. When they reconnect, the configured resolver handles overlapping changes. Choose policies that match the meaning of the data.

## Does a successful local write mean it is synced?

No. It means the operation was committed to the local store. Wait for a server acknowledgement before describing it as synced.

## Can Kelpie replace server validation?

No. Client rules are for predictability and user feedback. The server must authorize and validate every incoming operation.
