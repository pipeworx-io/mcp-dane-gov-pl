# mcp-dane-gov-pl

dane.gov.pl — Poland's national open data portal (Otwarte Dane).

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

## Tools

| Tool | Description |
|------|-------------|
| `search_datasets` | Search/list datasets on Poland's national open data portal (dane.gov.pl). Returns a JSON:API list of datasets with id, title, notes, slug, institution and resource count. Content is mostly Polish; q accepts Polish or English. Use the returned dataset id with dataset_details / list_resources. |
| `dataset_details` | Get full metadata for a single dataset by numeric id (from search_datasets). Returns the JSON:API dataset object: title, notes, license, keywords, regions, institution relationship and resource count. |
| `list_resources` | List the resources (files/tables) attached to a dataset. Returns JSON:API resource objects with id, title, format (csv/xlsx/...), media_type, link, openness_score and a tabular_data relationship. Resources whose relationships include tabular_data can be read row-by-row with resource_data. |
| `resource_data` | Read row-level data from a tabular resource (one with a tabular_data relationship). Returns JSON:API "row" objects whose attributes map column names (col1, col2, ...) to {repr, val} pairs. Supports paging and full-text row filtering via q. Use list_resources first to find a tabular resource id. |
| `search_institutions` | Search/list data-publishing institutions (ministries, agencies, municipalities, companies) on dane.gov.pl. Returns JSON:API institution objects with id, title, abbreviation, institution_type, website, regon and dataset count. Mostly Polish content; q accepts Polish or English. |

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "dane-gov-pl": {
      "url": "https://gateway.pipeworx.io/dane-gov-pl/mcp"
    }
  }
}
```

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Dane Gov Pl data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
