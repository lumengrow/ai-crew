import Anthropic from "@anthropic-ai/sdk";
import fs from "fs-extra";

const client = new Anthropic();

export async function orchestrate(task) {
  console.log("\n🎯 Orchestrator reading your task...\n");

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 2048,
    messages: [{ role: "user", content: task }],
    system: `You are the orchestrator of an AI development crew. 
You receive a project task from the team leader and break it into clear subtasks for each specialist:
- UX/UI agent: visual design, user flows, component layout
- Frontend agent: HTML, CSS, JavaScript, React components  
- Backend agent: APIs, database schema, server logic
- QA agent: test cases, edge cases, validation
- DevOps agent: deployment config, environment setup

Respond in this exact JSON format:
{
  "project": "short project name",
  "summary": "one sentence summary",
  "tasks": {
    "ux": "specific UX/UI task",
    "frontend": "specific frontend task",
    "backend": "specific backend task", 
    "qa": "specific QA task",
    "devops": "specific devops task"
  }
}`,
  });

  const raw = response.content[0].text;
  const json = raw.match(/\{[\s\S]*\}/)[0];
  return JSON.parse(json);
}
