import {
  JSONRPC_ERRORS,
  type JSONRPCRequest,
  type JSONRPCResponse,
  MCP_PROTOCOL_VERSION,
  SUPPORTED_PROTOCOL_VERSIONS,
} from '../../../lib/mcp/types.ts'
import { MCP_TOOLS, executeTool } from '../../../lib/mcp/tools.ts'
import { DeveloperDataConnector } from '../../../lib/mcp/data-connector.ts'

export const dynamic = 'force-dynamic'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept, x-mcp-version',
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  })
}

export async function GET(request: Request) {
  const acceptHeader = request.headers.get('accept') || ''

  // Streamable HTTP / Server-Sent Events (SSE) support
  if (acceptHeader.includes('text/event-stream')) {
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      start(controller) {
        const initPayload = JSON.stringify({
          type: 'connection_ready',
          protocolVersion: MCP_PROTOCOL_VERSION,
          serverInfo: { name: 'devpulse-mcp-server', version: '1.0.0' },
          toolsAvailable: MCP_TOOLS.length,
        })
        controller.enqueue(encoder.encode(`event: message\ndata: ${initPayload}\n\n`))
        controller.close()
      },
    })

    return new Response(stream, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        ...CORS_HEADERS,
      },
    })
  }

  // Standard JSON capability discovery
  return Response.json(
    {
      status: 'online',
      protocolVersion: MCP_PROTOCOL_VERSION,
      supportedProtocols: SUPPORTED_PROTOCOL_VERSIONS,
      serverInfo: {
        name: 'devpulse-mcp-server',
        version: '1.0.0',
        description: 'Official DevPulse MCP Server for the Amazon Alexa+ Track',
      },
      capabilities: {
        tools: {
          listChanged: false,
        },
      },
      toolsCount: MCP_TOOLS.length,
      tools: MCP_TOOLS,
      endpoint: '/api/mcp',
      transport: 'Streamable HTTP (JSON-RPC 2.0 & SSE)',
    },
    { headers: CORS_HEADERS }
  )
}

export async function POST(request: Request) {
  let rawBody: string
  try {
    rawBody = await request.text()
  } catch {
    return makeRpcError(null, JSONRPC_ERRORS.PARSE_ERROR, 'Failed to read request body.')
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(rawBody)
  } catch {
    return makeRpcError(null, JSONRPC_ERRORS.PARSE_ERROR, 'Parse error: Invalid JSON.')
  }

  // Support batch JSON-RPC requests
  if (Array.isArray(parsed)) {
    const responses: JSONRPCResponse[] = []
    for (const item of parsed) {
      const resp = await processRpcMessage(item)
      if (resp !== null) {
        responses.push(resp)
      }
    }
    return Response.json(responses, { headers: CORS_HEADERS })
  }

  const response = await processRpcMessage(parsed)
  // Notifications return 204 No Content
  if (response === null) {
    return new Response(null, { status: 204, headers: CORS_HEADERS })
  }

  return Response.json(response, { headers: CORS_HEADERS })
}

async function processRpcMessage(msg: unknown): Promise<JSONRPCResponse | null> {
  if (!msg || typeof msg !== 'object') {
    return {
      jsonrpc: '2.0',
      id: null,
      error: { code: JSONRPC_ERRORS.INVALID_REQUEST, message: 'Invalid Request: payload must be an object.' },
    }
  }

  const rpc = msg as Partial<JSONRPCRequest>
  const id = rpc.id !== undefined ? rpc.id : null

  if (rpc.jsonrpc !== '2.0' || typeof rpc.method !== 'string') {
    return {
      jsonrpc: '2.0',
      id,
      error: {
        code: JSONRPC_ERRORS.INVALID_REQUEST,
        message: 'Invalid Request: "jsonrpc" must be "2.0" and "method" must be a string.',
      },
    }
  }

  // Handle Notifications (no response expected)
  if (rpc.method.startsWith('notifications/')) {
    return null
  }

  const connector = new DeveloperDataConnector()

  try {
    switch (rpc.method) {
      case 'initialize': {
        const clientProto = (rpc.params?.protocolVersion as string) || MCP_PROTOCOL_VERSION
        const negotiated = SUPPORTED_PROTOCOL_VERSIONS.includes(clientProto)
          ? clientProto
          : MCP_PROTOCOL_VERSION

        return {
          jsonrpc: '2.0',
          id,
          result: {
            protocolVersion: negotiated,
            capabilities: {
              tools: { listChanged: false },
            },
            serverInfo: {
              name: 'devpulse-mcp-server',
              version: '1.0.0',
            },
          },
        }
      }

      case 'ping': {
        return {
          jsonrpc: '2.0',
          id,
          result: {},
        }
      }

      case 'tools/list': {
        return {
          jsonrpc: '2.0',
          id,
          result: {
            tools: MCP_TOOLS,
          },
        }
      }

      case 'tools/call': {
        const toolName = rpc.params?.name
        if (typeof toolName !== 'string') {
          return {
            jsonrpc: '2.0',
            id,
            error: {
              code: JSONRPC_ERRORS.INVALID_PARAMS,
              message: 'Invalid params: "name" must be a string naming the tool.',
            },
          }
        }

        const toolDef = MCP_TOOLS.find((t) => t.name === toolName)
        if (!toolDef) {
          return {
            jsonrpc: '2.0',
            id,
            error: {
              code: JSONRPC_ERRORS.METHOD_NOT_FOUND,
              message: `Tool "${toolName}" not found on this MCP server.`,
            },
          }
        }

        const toolArgs =
          rpc.params?.arguments && typeof rpc.params.arguments === 'object'
            ? (rpc.params.arguments as Record<string, unknown>)
            : {}

        // Validate required arguments
        if (toolDef.inputSchema.required) {
          for (const reqField of toolDef.inputSchema.required) {
            if (toolArgs[reqField] === undefined || toolArgs[reqField] === null || toolArgs[reqField] === '') {
              return {
                jsonrpc: '2.0',
                id,
                error: {
                  code: JSONRPC_ERRORS.INVALID_PARAMS,
                  message: `Invalid params: missing required parameter "${reqField}".`,
                },
              }
            }
          }
        }

        const { result, trace } = await executeTool(toolName, toolArgs, '', connector)
        return {
          jsonrpc: '2.0',
          id,
          result: {
            content: result.content,
            isError: result.isError ?? false,
            structuredData: result.structuredData,
            _trace: trace,
          },
        }
      }

      default: {
        return {
          jsonrpc: '2.0',
          id,
          error: {
            code: JSONRPC_ERRORS.METHOD_NOT_FOUND,
            message: `Method "${rpc.method}" is not implemented by this MCP server.`,
          },
        }
      }
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Internal error processing request.'
    return {
      jsonrpc: '2.0',
      id,
      error: {
        code: JSONRPC_ERRORS.INTERNAL_ERROR,
        message: errorMsg,
      },
    }
  }
}

function makeRpcError(id: string | number | null, code: number, message: string) {
  return Response.json(
    {
      jsonrpc: '2.0',
      id,
      error: { code, message },
    },
    { status: 200, headers: CORS_HEADERS }
  )
}
