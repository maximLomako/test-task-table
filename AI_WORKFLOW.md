# AI Workflow Documentation

## Tools Used
- ChatGPT (Codex CLI)
- ClaudeCode (ClaudeCode CLI)

## AI-Assisted Parts
- [x] Project setup / boilerplate
- [x] TypeScript types/interfaces
- [ ] Redux/state management logic
- [x] Mock WebSocket implementation
- [x] UI components
- [x] Tests
- [x] Theme configuration
- [x] Other: Mock data generation

## Example Prompts (2-3 examples)

### Prompt 1:
"Create a Vite + React 18 + TypeScript project structure with MUI, TanStack Query, and Vitest, matching the assignment file tree."

**What AI generated:** Initial folder structure and config files.

**What you modified:** Adjusted TypeScript strict settings and added Vitest setup.

### Prompt 2:
"Implement a mock WebSocket class that emits new orders or status updates every 3-5 seconds and supports reconnection logic with exponential backoff."

**What AI generated:** Base mock websocket class and hook wiring.

**What you modified:** Added cleanup logic, clarified connection status handling, and tuned drop timings.

### Prompt 3:
"Design an MUI orders table with sorting, filtering, search, and pagination."

**What AI generated:** Table layout and sorting/filtering logic.

**What you modified:** Added accessibility labels, tuned responsive layout, and adjusted formatting.

## AI Mistakes Caught
- Missing accessibility labels for select inputs; caught during test design and fixed by adding MUI `InputLabel`.
- Hook effect dependency initially recreated the socket on every status change; corrected to keep the connection stable.
- Virtualization layout initially broke table alignment; adjusted with fixed table layout and absolute row positioning.

## Time Breakdown
- Total time spent: 6 hours
- Time with AI assistance: 2 hours
- Time reviewing/fixing AI output: 1.5 hours
- Time writing code manually: 2.5 hours

## Reflection
- Where did AI help the most? Setting up project scaffolding and validating edge cases for realtime updates.
- Where did AI slow you down? Aligning the UI details (table virtualization and modal behaviors) with MUI constraints.
- What would you do differently? Start with a small test suite earlier to lock in the data flows.
