import Anthropic from "@anthropic-ai/sdk";
import fs from "fs-extra";

const client = new Anthropic();

export async function runUX(task, projectName) {
  console.log("\n🎨 UX/UI Agent working...\n");

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 8192,
    messages: [{ role: "user", content: task }],
    system: `You are a senior UX/UI designer and frontend developer.
You produce clean, modern HTML/CSS designs.
When given a task, output a COMPLETE, FULLY WORKING index.html file with embedded CSS.
The file MUST include: <!DOCTYPE html>, <html>, <head>, <body>, and all closing tags.
IMPORTANT: Output ONLY raw HTML. No markdown, no code fences, no backticks, no explanation.
The HTML must be 100% complete from first to last line.`,
  });

  let html = response.content[0].text;
  html = html.replace(/```html/gi, "").replace(/```/g, "").trim();

  await fs.ensureDir(`output/${projectName}`);
  await fs.writeFile(`output/${projectName}/index.html`, html);
  
  const lines = html.split("\n").length;
  console.log(`✅ UX agent done → output/${projectName}/index.html (${lines} lines)`);
  return html;
}
