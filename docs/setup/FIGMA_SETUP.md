# Figma API Setup for Claude Code MCP Integration

This guide explains how to configure Figma API access for Claude Code's Model Context Protocol (MCP) integration, enabling direct asset extraction from Figma designs.

## Why Configure Figma API?

With proper Figma API access configured, Claude Code can:

- **Directly extract design data** from Figma files without manual downloads
- **Download images and icons** automatically to the correct project directories
- **Read exact measurements** for pixel-perfect implementations
- **Identify all visual assets** in a design frame
- **Generate accurate code** based on real Figma coordinates

## Prerequisites

1. **Figma Account**: You need a Figma account (free or paid)
2. **Project Access**: You must have access to the TindaGo Figma project
3. **Claude Code**: This setup is specific to Claude Code CLI

## Step-by-Step Setup

### 1. Get Your Figma Personal Access Token

1. **Login to Figma**:
   - Go to https://www.figma.com/
   - Sign in to your account

2. **Access Settings**:
   - Click on your profile icon (top-right)
   - Select "Settings" from the dropdown

3. **Navigate to Personal Access Tokens**:
   - Scroll down to the "Personal access tokens" section
   - Or go directly to: https://www.figma.com/developers/api#access-tokens

4. **Generate Token**:
   - Click "Create a new personal access token"
   - Give it a descriptive name: `Claude Code TindaGo`
   - Click "Generate token"

5. **Copy Token**:
   - **IMPORTANT**: Copy the token immediately - you won't be able to see it again!
   - It will look like: `figd_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - Store it somewhere safe temporarily

### 2. Update MCP Settings in Your Project

1. **Open MCP Configuration File**:
   - File location: `C:\CapsProj\TindaGo\.claude\mcp-settings.json`
   - Or navigate to: `.claude/mcp-settings.json` in your project root

2. **Replace Placeholder with Your Token**:

   **Before (current state):**
   ```json
   {
     "mcpServers": {
       "Framelink Figma MCP": {
         "command": "cmd",
         "args": ["/c", "npx", "-y", "figma-developer-mcp", "--figma-api-key=YOUR-KEY", "--stdio"]
       }
     }
   }
   ```

   **After (with your token):**
   ```json
   {
     "mcpServers": {
       "Framelink Figma MCP": {
         "command": "cmd",
         "args": ["/c", "npx", "-y", "figma-developer-mcp", "--figma-api-key=figd_YOUR_ACTUAL_TOKEN_HERE", "--stdio"]
       }
     }
   }
   ```

3. **Save the File**:
   - Make sure to save changes
   - The token will be stored locally in your project

### 3. Restart Claude Code

For the changes to take effect:

1. **Exit Claude Code completely**
2. **Reopen Claude Code**
3. **Verify MCP is loaded**: You should see MCP tools available like:
   - `mcp__Framelink_Figma_MCP__get_figma_data`
   - `mcp__Framelink_Figma_MCP__download_figma_images`

## Using Figma MCP Tools

### Extract Design Data

```
@Claude, extract all design data from this Figma screen:
https://www.figma.com/design/8I1Nr3vQZllDDknSevstvH/TindaGo-Share?node-id=1428-6206
```

Claude will automatically:
- Parse the Figma URL to extract `fileKey` (8I1Nr3vQZllDDknSevstvH) and `nodeId` (1428-6206)
- Fetch design data including coordinates, colors, fonts, and layout
- Save JSON data to appropriate assets directory

### Download Assets

```
@Claude, download all images and icons from the Customer Return History screen to the assets folder
```

Claude will:
- Identify all image nodes in the design
- Download them at correct resolution
- Save to `src/assets/images/[screen-name]/`
- Name files appropriately based on their purpose

## Troubleshooting

### Error: "Failed to make request to Figma API: 403 Forbidden"

**Cause**: Invalid or missing API token

**Solutions**:
1. Verify token is correctly copied (no extra spaces)
2. Ensure token starts with `figd_`
3. Check token hasn't been revoked in Figma settings
4. Generate a new token if necessary
5. Restart Claude Code after updating config

### Error: "Cannot access node-id"

**Cause**: Node ID format or access permission issue

**Solutions**:
1. Verify Figma URL format: `figma.com/design/{fileKey}?node-id={nodeId}`
2. Check you have view access to the Figma file
3. Try accessing the file directly in your browser first
4. Use both dash format (1234-5678) and colon format (1234:5678)

### MCP Tools Not Showing

**Cause**: MCP configuration not loaded

**Solutions**:
1. Check `.claude/mcp-settings.json` exists in project root
2. Verify JSON syntax is valid (no trailing commas, proper quotes)
3. Restart Claude Code completely
4. Check Claude Code console for MCP loading errors

## Security Best Practices

### Keep Your Token Safe

- ✅ **DO**: Keep token in local `.claude/mcp-settings.json`
- ✅ **DO**: Add `.claude/mcp-settings.json` to `.gitignore`
- ❌ **DON'T**: Commit token to version control
- ❌ **DON'T**: Share token in screenshots or documentation
- ❌ **DON'T**: Use production tokens in public repositories

### Recommended .gitignore Entry

Add to your `.gitignore`:

```gitignore
# Claude Code MCP Settings (contains API tokens)
.claude/mcp-settings.json

# Keep template version instead
!.claude/mcp-settings.example.json
```

### Create Template File

For team collaboration, create `.claude/mcp-settings.example.json`:

```json
{
  "mcpServers": {
    "Framelink Figma MCP": {
      "command": "cmd",
      "args": ["/c", "npx", "-y", "figma-developer-mcp", "--figma-api-key=YOUR-KEY", "--stdio"]
    }
  }
}
```

Team members can copy this to `mcp-settings.json` and add their own token.

## Token Management

### Viewing Your Tokens

1. Go to Figma Settings
2. Scroll to "Personal access tokens"
3. See all tokens you've created
4. View last used date and creation date

### Revoking Tokens

If token is compromised:

1. Go to Figma Settings → Personal access tokens
2. Find the token by name
3. Click "Delete" next to the token
4. Generate a new token
5. Update `.claude/mcp-settings.json` with new token

### Token Expiration

- Figma tokens **do not expire automatically**
- Remain valid until manually revoked
- Good practice: Rotate tokens every 6-12 months

## Verification Test

After setup, verify it works:

```
@Claude, please test Figma MCP connection by fetching data from:
https://www.figma.com/design/8I1Nr3vQZllDDknSevstvH/TindaGo-Share?node-id=903-5683
```

Expected response:
- Claude fetches node data successfully
- Returns frame name, dimensions, and structure
- No 403 or authentication errors

## Figma File Information

**TindaGo Design File**:
- **URL**: https://www.figma.com/design/8I1Nr3vQZllDDknSevstvH/TindaGo-Share
- **File Key**: `8I1Nr3vQZllDDknSevstvH`
- **Common Node IDs**:
  - Order History: 903-5683
  - Return History: 1428-6206
  - (Add more as discovered)

## Alternative: Manual Asset Extraction

If you prefer not to configure Figma API, you can still extract assets manually:

1. Open Figma file in browser
2. Select each icon/image
3. Right-click → Export → PNG (at 2x or 3x)
4. Save to `src/assets/images/[screen-name]/`
5. Reference in code using `require("path/to/asset.png")`

See: `docs/guides/RETURN_HISTORY_ASSETS_GUIDE.md` for detailed manual extraction guide.

## Benefits of Automation

**Without Figma API** (manual):
- 30-60 minutes per screen to extract assets
- Risk of missing icons or using wrong sizes
- Manual coordinate measurements prone to errors
- Tedious repetitive work

**With Figma API** (automated):
- 5-10 minutes per screen for complete extraction
- All assets identified automatically
- Exact coordinates from design file
- Consistent, repeatable process

## Support

If you encounter issues:

1. Check Figma API status: https://www.figmastatus.com/
2. Review Figma API documentation: https://www.figma.com/developers/api
3. Verify your Figma plan includes API access (all plans do)
4. Contact team lead if file access issues persist

## Summary Checklist

- [ ] Created Figma Personal Access Token
- [ ] Saved token securely
- [ ] Updated `.claude/mcp-settings.json` with token
- [ ] Added mcp-settings.json to .gitignore
- [ ] Restarted Claude Code
- [ ] Verified MCP tools are available
- [ ] Tested with simple Figma fetch
- [ ] Successfully extracted assets for a screen

Once complete, you can use commands like:
```
Extract all assets from Customer Return History Figma design with node-id 1428-6206
```

And Claude will handle the rest automatically!
