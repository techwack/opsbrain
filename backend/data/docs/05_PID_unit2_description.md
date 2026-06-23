# P&ID Description — Unit-2 Crude Transfer Loop (PID-U2-001)

The crude transfer loop moves feed from Tank TK-21 through the preheat train to the
Unit-2 column. Key tagged equipment and instrumentation:

- TK-21 — Crude feed storage tank.
- P-204 — Primary crude transfer pump (duty). Suction from TK-21 via valve V-204A,
  discharge through V-204B to heat exchanger HX-301. Motor M-204 fed from MCC-2.
- P-205 — Standby crude transfer pump (auto-start on P-204 low discharge pressure).
- HX-301 — Crude/product preheat exchanger. Crude on tube side.
- C-101 — Recycle gas compressor with anti-surge valve PV-101.
- Instrumentation on P-204: PT-204 (discharge pressure), TT-204 (bearing temp),
  VT-204 (vibration), TT-205 (seal chamber temp), FT-204 (flow).

## Control & Protection
- Low suction pressure (PT-203 < 2.0 bar) interlocks P-204 to prevent cavitation.
- High bearing temp (TT-204 > 95 °C) trips M-204.
- High vibration (VT-204 > 7.1 mm/s) trips M-204.
- Loss of P-204 discharge pressure auto-starts standby P-205.

## Isolation Philosophy
P-204 is isolated by closing V-204A (suction) and V-204B (discharge). Note V-204B history
of passing (WO-2024-0512); per OISD-STD-105 Clause 6.3, confirm positive isolation before
LOTO and use double block and bleed if isolation integrity is in doubt.
