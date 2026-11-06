<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture rules
- Business rules of Decreto 36.773/2025 (deadlines, grade scale, status transitions, appeals) live as pure TypeScript in `src/domain/` (DDD aggregates/value objects) with no React, database or framework imports; why: legal rules stay auditable, testable and changeable in one place.
- Legal deadlines in business days are centralized in `PRAZOS_LEGAIS` (`src/domain/prazos/PrazoDiasUteis.ts`); why: a decree change must touch a single constant.
- The technical specification for the IT team lives in `docs/ESPECIFICACAO_TECNICA.md` and must be updated when features or rules change; why: it is the hand-off document for state implementation.
- Assessment selectors and management read the same `servidores` database records; imported assessment dates are preserved as source data, not inferred legal deadlines, so both modules stay consistent without an external spreadsheet dependency.
- FAPEP assessment-number selection resolves imported dates through the shared `servidores` helper; why: both evaluator forms must use identical source-date mapping without recalculation.
- Transfer packages are produced by `scripts/preparar-entrega.py` with credentials, generated output and provisional shared-admin access excluded; why: institutional handoff must not redistribute the source environment's temporary access mechanism or imply a complete database bootstrap.
