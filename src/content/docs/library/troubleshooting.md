---
title: Troubleshooting
description: Diagnose a stalled queue, migration failure, or adapter that behaves differently offline.
group: HELP
order: 11
---

Start with the operation state and adapter logs. A useful diagnostic record includes the operation ID, collection, retry count, and error category. Avoid logging record contents or credentials.

## The queue never drains

Check connectivity, authentication, and server status separately. Inspect whether operations are `pending` or `blocked`; a validation rejection will not clear by retrying. Confirm that the transport acknowledges every accepted operation.

## Changes appear twice

The server should treat operation IDs idempotently. Verify that a retry uses the original ID and that the local adapter commits acknowledgements in the same transaction as the queue update.

## A migration restarts repeatedly

Check that each migration advances the stored schema version only after its batch commits. Ensure transforms are deterministic and that a failed batch does not leave a partial record.

## Browser storage is unavailable

Private browsing settings, quota limits, and embedded webviews can restrict persistent storage. Surface adapter initialization errors and offer an export or read-only mode instead of silently falling back to volatile memory.
