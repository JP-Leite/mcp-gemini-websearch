#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { spawnSync } from "child_process";

const server = new McpServer({
  name: "Gemini Search",
  version: "0.1.0",
});

server.tool(
  "web_search",
  {
    query: z.string().describe("What to search for (can be general - will be refined automatically)"),
    num_sources: z.number().default(5).describe("Number of source URLs to cite"),
    urls_only: z.boolean().default(false).describe("If true, return only URLs without summarizing"),
  },
  async ({ query, num_sources = 5, urls_only = false }) => {
    let prompt;

    if (urls_only) {
      prompt = `Use Google Search to find ${num_sources} URLs about ${query}. Output ONLY the raw URLs, one per line. No markdown, no numbering, no explanation.`;
    } else {
      prompt = `User wants to know: ${query}

STEP 1: Analyze this query and determine what specific information they need.
STEP 2: Use Google Search with refined, specific search terms to find authoritative sources.
STEP 3: Read the sources thoroughly and extract the exact information needed.
STEP 4: Provide a comprehensive, accurate answer.

Cite up to ${num_sources} sources with URLs.
Format: Direct answer first, then sources.`;
    }

    try {
      const result = spawnSync("gemini", ["--yolo", "-p", prompt], {
        encoding: "utf-8",
        timeout: 60000,
      });

      if (result.error) {
        return { content: [{ type: "text", text: `## Search Error\n\nGemini CLI failed: ${result.error.message}` }] };
      }

      if (result.status !== 0) {
        return { content: [{ type: "text", text: `## Search Error\n\nGemini CLI exited with code ${result.status}: ${result.stderr}` }] };
      }

      const output = result.stdout.trim();

      if (urls_only) {
        const urls = output.match(/https?:\/\/[^\s\)"'>,]+/g) || [];
        if (urls.length === 0) {
          return { content: [{ type: "text", text: "## No Results\n\nNo URLs found. Try a different query." }] };
        }
        const formatted = "## Sources\n\n" + urls.slice(0, num_sources).map(u => `- ${u}`).join("\n");
        return { content: [{ type: "text", text: formatted }] };
      }

      return { content: [{ type: "text", text: `## Search Results\n\n${output}` }] };
    } catch (error) {
      return { content: [{ type: "text", text: `## Search Error\n\nGemini CLI failed: ${error.message}\n\nTry again or check your Gemini CLI auth.` }] };
    }
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
