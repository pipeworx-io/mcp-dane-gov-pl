# mcp-dane-gov-pl

dane.gov.pl — Poland's national open data portal (Otwarte Dane).

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1476+ live data sources.

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

### What this endpoint actually serves

`tools/list` at `https://gateway.pipeworx.io/dane-gov-pl/mcp` returns the tools in the table
above **plus the shared Pipeworx meta-tools** — `ask_pipeworx`,
`discover_tools`, `search_within`, `remember`/`recall` and the rest of the
gateway-wide set. So the tool count you see is larger than this table: a
single-pack endpoint currently lists roughly 30 shared tools alongside the
pack's own. The connection's `initialize` response states its exact scope, and
is the authoritative answer for a given day.

This is deliberate, not multiplexing by accident. The meta-tools are what let a
scoped connection answer a question this pack does not cover — via
`ask_pipeworx`, which routes across the whole catalog — without you adding a
second MCP server. There is currently no way to mount a pack endpoint without
them; if the extra schemas cost you more context than the routing is worth,
connect to the full gateway once rather than to several pack endpoints.

Or connect to the full Pipeworx gateway to get every pack's tools listed
directly, instead of just this one's:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

Both URLs reach the same gateway and the same 1476+ data sources. The
only difference is which pack's tools are listed **directly**; `ask_pipeworx`
reaches all of them from either one.

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English —
this works on the pack endpoint above as well as on the full gateway:

```
ask_pipeworx({ question: "your question about Dane Gov Pl data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
