interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * dane.gov.pl — Poland's national open data portal (Otwarte Dane).
 *
 * Keyless JSON:API at https://api.dane.gov.pl/1.4. All responses use the
 * JSON:API envelope: { data: [...] | {...}, links: {self,next,last}, meta }
 * where each item is { id, type, attributes: {...}, relationships: {...} }.
 *
 * Content is predominantly Polish. The `lang=en` query param is accepted but
 * only translates portal-level fields where English exists — most titles/notes
 * stay Polish. Search `q` accepts Polish or English text.
 */


const BASE = 'https://api.dane.gov.pl/1.4';
const UA = 'pipeworx-mcp-dane-gov-pl/1.0 (+https://pipeworx.io)';

const tools: McpToolExport['tools'] = [
  {
    name: 'search_datasets',
    description:
      "Search/list datasets on Poland's national open data portal (dane.gov.pl). Returns a JSON:API list of datasets with id, title, notes, slug, institution and resource count. Content is mostly Polish; q accepts Polish or English. Use the returned dataset id with dataset_details / list_resources.",
    inputSchema: {
      type: 'object',
      properties: {
        q: { type: 'string', description: 'Full-text query (Polish or English), e.g. "budżet", "health", "powietrze".' },
        page: { type: 'integer', description: 'Page number (default 1).' },
        per_page: { type: 'integer', description: 'Results per page, 1-100 (default 20).' },
        sort: { type: 'string', description: 'Sort field, e.g. "id", "-created", "title". Default "id".' },
        lang: { type: 'string', description: 'Language hint "en" or "pl"; only some portal fields are translated.' },
      },
    },
  },
  {
    name: 'dataset_details',
    description:
      'Get full metadata for a single dataset by numeric id (from search_datasets). Returns the JSON:API dataset object: title, notes, license, keywords, regions, institution relationship and resource count.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Dataset numeric id, e.g. "771".' },
        lang: { type: 'string', description: 'Language hint "en" or "pl".' },
      },
      required: ['id'],
    },
  },
  {
    name: 'list_resources',
    description:
      'List the resources (files/tables) attached to a dataset. Returns JSON:API resource objects with id, title, format (csv/xlsx/...), media_type, link, openness_score and a tabular_data relationship. Resources whose relationships include tabular_data can be read row-by-row with resource_data.',
    inputSchema: {
      type: 'object',
      properties: {
        dataset_id: { type: 'string', description: 'Dataset numeric id, e.g. "771".' },
        page: { type: 'integer', description: 'Page number (default 1).' },
        per_page: { type: 'integer', description: 'Results per page, 1-100 (default 20).' },
        lang: { type: 'string', description: 'Language hint "en" or "pl".' },
      },
      required: ['dataset_id'],
    },
  },
  {
    name: 'resource_data',
    description:
      'Read row-level data from a tabular resource (one with a tabular_data relationship). Returns JSON:API "row" objects whose attributes map column names (col1, col2, ...) to {repr, val} pairs. Supports paging and full-text row filtering via q. Use list_resources first to find a tabular resource id.',
    inputSchema: {
      type: 'object',
      properties: {
        resource_id: { type: 'string', description: 'Resource numeric id, e.g. "22509".' },
        q: { type: 'string', description: 'Full-text filter across row cells (Polish or English), e.g. "AUSTRIA".' },
        page: { type: 'integer', description: 'Page number (default 1).' },
        per_page: { type: 'integer', description: 'Rows per page, 1-100 (default 20).' },
      },
      required: ['resource_id'],
    },
  },
  {
    name: 'search_institutions',
    description:
      'Search/list data-publishing institutions (ministries, agencies, municipalities, companies) on dane.gov.pl. Returns JSON:API institution objects with id, title, abbreviation, institution_type, website, regon and dataset count. Mostly Polish content; q accepts Polish or English.',
    inputSchema: {
      type: 'object',
      properties: {
        q: { type: 'string', description: 'Full-text query (Polish or English), e.g. "ministerstwo".' },
        page: { type: 'integer', description: 'Page number (default 1).' },
        per_page: { type: 'integer', description: 'Results per page, 1-100 (default 20).' },
        lang: { type: 'string', description: 'Language hint "en" or "pl".' },
      },
    },
  },
];

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  switch (name) {
    case 'search_datasets':
      return get('/datasets', {
        q: str(args.q),
        page: num(args.page),
        per_page: num(args.per_page),
        sort: str(args.sort),
        lang: str(args.lang),
      });
    case 'dataset_details':
      return get(`/datasets/${encodeURIComponent(reqStr(args, 'id', '"771"'))}`, { lang: str(args.lang) });
    case 'list_resources':
      return get(`/datasets/${encodeURIComponent(reqStr(args, 'dataset_id', '"771"'))}/resources`, {
        page: num(args.page),
        per_page: num(args.per_page),
        lang: str(args.lang),
      });
    case 'resource_data':
      return get(`/resources/${encodeURIComponent(reqStr(args, 'resource_id', '"22509"'))}/data`, {
        q: str(args.q),
        page: num(args.page),
        per_page: num(args.per_page),
      });
    case 'search_institutions':
      return get('/institutions', {
        q: str(args.q),
        page: num(args.page),
        per_page: num(args.per_page),
        lang: str(args.lang),
      });
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

async function get(path: string, params: Record<string, string | undefined>): Promise<unknown> {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== '') qs.set(k, v);
  }
  const url = qs.toString() ? `${BASE}${path}?${qs}` : `${BASE}${path}`;
  const res = await fetch(url, { headers: { Accept: 'application/json', 'User-Agent': UA } });
  if (!res.ok) throw new Error(`dane.gov.pl: ${res.status} ${await res.text().then((t) => t.slice(0, 200))}`);
  return res.json();
}

function str(v: unknown): string | undefined {
  if (v === undefined || v === null) return undefined;
  return String(v);
}

function num(v: unknown): string | undefined {
  if (v === undefined || v === null || v === '') return undefined;
  return String(v);
}

function reqStr(args: Record<string, unknown>, key: string, example: string): string {
  const v = args[key];
  if (typeof v !== 'string' || !v.trim()) throw new Error(`Required argument "${key}" is missing. Pass a string like ${example}.`);
  return v;
}

export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;
