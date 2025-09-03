# MCP (Model Context Protocol) Setup for TindaGO

This project uses the [Figma-Context-MCP](https://github.com/GLips/Figma-Context-MCP) tool for design-to-code workflow.

## Figma Context MCP Setup

### Prerequisites
1. Node.js installed
2. Figma access token
3. Claude Code with MCP support

### Installation

1. **Install the Figma Context MCP package:**
   ```bash
   npm install figma-context-mcp
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env and add your Figma access token
   ```

3. **Configure Claude Code:**
   - The MCP settings are configured in `.claude/mcp-settings.json`
   - Configuration uses `npx` for better reliability
   - Restart Claude Code after any configuration changes

### Getting Figma Access Token

1. Go to Figma → Settings → Account
2. Scroll down to "Personal access tokens" 
3. Create a new token with appropriate permissions:
   - File content (read)
   - Library access (read)
4. Copy the token to your `.env` file

### Usage

Once configured, you should have access to Figma Context MCP tools like:
- `mcp__figma_get_file_content` - Get complete Figma file structure
- `mcp__figma_get_node_details` - Get specific node/component details
- `mcp__figma_export_images` - Export images and assets
- `mcp__figma_get_design_tokens` - Extract design tokens (colors, typography, etc.)

### Project Structure

```
.claude/
  mcp-settings.json     # MCP server configuration (uses npx)
.env                    # Environment variables (don't commit)
.env.example           # Template for environment variables
README-MCP.md          # This file
```

### MCP Configuration

The `.claude/mcp-settings.json` uses the recommended npx approach:

```json
{
  "mcpServers": {
    "figma-context": {
      "command": "npx",
      "args": [
        "figma-context-mcp",
        "--figma-api-key=${FIGMA_API_KEY}",
        "--stdio"
      ]
    }
  }
}
```

### Troubleshooting

- **Token Issues**: Test your token with `curl -H "X-FIGMA-TOKEN: YOUR_TOKEN" https://api.figma.com/v1/me`
- **MCP Server**: Test manually with `npx figma-context-mcp --figma-api-key=YOUR_TOKEN --stdio`
- **Configuration**: Restart Claude Code after any changes to `.claude/mcp-settings.json`
- **No Pro Plan Required**: Works with free Figma accounts that have API access