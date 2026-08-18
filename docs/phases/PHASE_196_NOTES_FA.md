# Phase 196 — GA4 Delivery + Leave-aware Month Intelligence

- GA4 configured builds now default anonymous product analytics to on, with explicit opt-out and advertising signals disabled.
- Consent Mode keeps analytics storage denied by default in EEA/UK/CH until an explicit grant.
- Standalone leave entries are projected into derived daily records without mutating AppData records.
- Month stats, Month Intelligence, activity tooltip, and Recent 7 Days distinguish worked minutes from leave credit.
- Full/half/hourly leave credit prevents registered leave from appearing as work deficit.
- Schema, dependency set, and package lock remain unchanged.
