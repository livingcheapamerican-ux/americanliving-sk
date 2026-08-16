# Project-Scoped Rules & Operational Standard (LongHorizon MEA Protocol)

## 1. Core Architecture & Sync Safeguards
- **Commit and push policy:** All intermediate edits, subtasks, and verification steps MUST be performed locally. Do NOT push frequently. Stage, commit, and push changes to GitHub ONLY ONCE at the end of the entire verified task to prevent Base44 sync throttling/rate-limiting.
- **Production Safety:** Do not introduce breaking schema or routing changes without backward compatibility.

## 2. LongHorizon MEA Protocol (Autonomous 3-Tier Workflow)
For all development and bug fixing tasks, strictly follow the MEA loop:
1. **Manager (Planner):** Break complex requirements into atomic, well-defined subtasks. Maintain project state in structure, not in conversational memory.
2. **Executor (Worker):** Execute subtasks using isolated fresh-context subagents (`invoke_subagent` / targeted tool executions) to avoid Context Rot and cognitive bias.
3. **Auditor (Verifier):** Before reporting completion, independently verify the ground-truth environment:
   - Run `npm run build` (zero syntax/type errors).
   - Probe backend/DB queries for live data.
   - Verify UI rendering and console logs via Playwright/DevTools (no red console errors).
