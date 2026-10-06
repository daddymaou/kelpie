---
title: A write should not wait for the weather
description: Why local-first interaction changes the shape of a dependable application.
date: 2026-09-18
order: 1
---

Most interfaces still ask a distant server for permission to feel responsive. That works until the train enters a tunnel, a laptop wakes without Wi-Fi, or the API has a bad afternoon.

Local-first changes the sequence. Save the user's intent locally, acknowledge it honestly, and let synchronization catch up. The difficult work is not making the network disappear; it is making its absence legible.

## A useful promise

“Saved on this device” is a promise an app can keep immediately. “Available everywhere” is a different promise, and it should wait for acknowledgement. Clear language is part of the data model.

The [offline queue guide](/docs/library/offline-queue) describes how to keep those states distinct.
