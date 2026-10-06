---
title: Conflicts have a shape
description: A timestamp is a tie-breaker, not a universal theory of what a user meant.
date: 2026-08-27
order: 2
---

“Last write wins” sounds neutral because it is easy to say. It quietly assumes that clocks are comparable and that the latest timestamp represents the most valuable intention.

For a display preference, that can be a fair trade. For a shared checklist, a counter, or a reservation, it may erase useful work or violate an invariant.

## Model the meaning first

Before selecting a merge rule, ask what two independent edits should mean together. A field merge, an operation-based counter, and a human review queue are all valid answers for different data.

Make resolvers deterministic, keep server-side constraints authoritative, and make unresolved work visible. The [conflict resolution guide](/docs/library/conflict-resolution) explores those choices.
