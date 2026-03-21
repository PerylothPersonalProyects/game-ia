# Skill Registry

**Orchestrator use only.** Read this registry once per session to resolve skill paths, then pass pre-resolved paths directly to each sub-agent's launch prompt. Sub-agents receive the path and load the skill directly — they do NOT read this registry.

## User Skills

| Trigger | Skill | Path |
|---------|-------|------|
| Build 2D games with Phaser 3 | phaser-gamedev | D:\QA_Automatiozacion\Laboratorio_IA\.opencode\skills\phaser-gamedev\SKILL.md |
| React renderer for json-render | react | D:\QA_Automatiozacion\Laboratorio_IA\.opencode\skills\react\SKILL.md |
| Build React components with TypeScript | react-dev | D:\QA_Automatiozacion\Laboratorio_IA\.opencode\skills\react-dev\SKILL.md |
| Converts Stitch designs into React | react:components | D:\QA_Automatiozacion\Laboratorio_IA\.opencode\skills\react-components\SKILL.md |
| Node.js backend patterns | nodejs-backend | D:\QA_Automatiozacion\Laboratorio_IA\.opencode\skills\nodejs-backend\SKILL.md |
| Node.js backend with Express/Fastify | nodejs-backend-patterns | D:\QA_Automatiozacion\Laboratorio_IA\.opencode\skills\nodejs-backend-patterns\SKILL.md |
| Game QA testing with Playwright | game-qa | D:\QA_Automatiozacion\Laboratorio_IA\.opencode\skills\game-qa\SKILL.md |
| Game UI/UX designer | game-designer | D:\QA_Automatiozacion\Laboratorio_IA\.opencode\skills\game-designer\SKILL.md |
| Game design theory | game-design-theory | D:\QA_Automatiozacion\Laboratorio_IA\.opencode\skills\game-design-theory\SKILL.md |
| Game audio with Web Audio API | game-audio | D:\QA_Automatiozacion\Laboratorio_IA\.opencode\skills\game-audio\SKILL.md |
| Game architecture patterns | game-architecture | D:\QA_Automatiozacion\Laboratorio_IA\.opencode\skills\game-architecture\SKILL.md |
| DDD, Clean Architecture, Hexagonal | clean-ddd-hexagonal | D:\QA_Automatiozacion\Laboratorio_IA\.opencode\skills\clean-ddd-hexagonal\SKILL.md |

## Project Conventions

| File | Path | Notes |
|------|------|-------|
| frontend agent | D:\QA_Automatiozacion\Laboratorio_IA\.opencode\agents\frontend.md | React + Phaser + TypeScript |
| backend agent | D:\QA_Automatiozacion\Laboratorio_IA\.opencode\agents\backend.md | Express + Socket.io |
| architect agent | D:\QA_Automatiozacion\Laboratorio_IA\.opencode\agents\architect.md | Architecture patterns |
| qa agent | D:\QA_Automatiozacion\Laboratorio_IA\.opencode\agents\qa.md | Testing |
| game_designer agent | D:\QA_Automatiozacion\Laboratorio_IA\.opencode\agents\game_designer.md | Game mechanics |
| gameplay_programmer agent | D:\QA_Automatiozacion\Laboratorio_IA\.opencode\agents\gameplay_programmer.md | Phaser implementation |
| economy_designer agent | D:\QA_Automatiozacion\Laboratorio_IA\.opencode\agents\economy_designer.md | Game economy |
| liveops_designer agent | D:\QA_Automatiozacion\Laboratorio_IA\.opencode\agents\liveops_designer.md | Live events |

Read the convention files listed above for project-specific patterns and rules. All referenced paths have been extracted — no need to read index files to discover more.
