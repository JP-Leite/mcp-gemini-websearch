# mcp-gemini-websearch

MCP server that provides Google Search via Gemini CLI. Gemini refines your query, searches Google, reads the pages, and returns a synthesized answer with sources.

## Prerequisites

1. **Node.js 18+**

2. **Gemini CLI** installed and authenticated:
   ```bash
   npm install -g @google/gemini-cli
   gemini
   # Follow the auth flow to log in with your Google account
   ```

## Install

```bash
npm install -g mcp-gemini-websearch
```

## Connect to OpenCode

Add to your OpenCode config (`~/.config/opencode/opencode.json`):

```json
{
  "mcp": {
    "gemini-search": {
      "type": "local",
      "command": ["mcp-gemini-websearch"]
    }
  }
}
```

Restart OpenCode. The `web_search` tool is now available.

## Connect to Claude Desktop

Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "gemini-search": {
      "command": "mcp-gemini-websearch"
    }
  }
}
```

## Usage

The tool is automatically invoked when you ask questions requiring current information:

- "What's new in React 19?"
- "Find the latest Next.js documentation"
- "What are the best state management libraries in 2025?"

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `query` | string | required | What to search for |
| `num_sources` | number | 5 | Number of sources to cite |
| `urls_only` | boolean | false | Return only URLs without summary |

## How It Works

1. Your query is sent to Gemini CLI
2. Gemini refines the query into specific search terms
3. Google Search finds authoritative sources
4. Gemini reads the pages and extracts relevant information
5. Returns a synthesized answer with source URLs

## License

MIT
