import { Request, Response } from 'express';
import { McpProxyRequestBody } from '@ax-analytics/shared';

export function handleMcpProxy() {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const { targetUrl, headers: customHeaders, payload } = (req.body || {}) as Partial<McpProxyRequestBody>;

      if (!targetUrl || typeof targetUrl !== 'string' || targetUrl.trim().length === 0) {
        res.status(400).json({
          jsonrpc: '2.0',
          error: {
            code: -32602,
            message: "Invalid or missing 'targetUrl' parameter",
          },
          id: payload?.id ?? null,
        });
        return;
      }

      if (!payload || typeof payload !== 'object') {
        res.status(400).json({
          jsonrpc: '2.0',
          error: {
            code: -32602,
            message: "Invalid or missing 'payload' parameter",
          },
          id: null,
        });
        return;
      }

      const requestHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        Accept: 'application/json;q=0.9, text/event-stream',
        ...(customHeaders || {}),
      };

      const upstreamResponse = await fetch(targetUrl, {
        method: 'POST',
        headers: requestHeaders,
        body: JSON.stringify(payload),
      });

      const contentType = upstreamResponse.headers.get('Content-Type') || 'application/json';

      if (contentType.includes('text/event-stream')) {
        const streamText = await upstreamResponse.text();
        res.status(upstreamResponse.status);
        res.setHeader('Content-Type', 'text/event-stream');
        res.send(streamText);
        return;
      }

      let responseData: unknown;
      try {
        responseData = await upstreamResponse.json();
      } catch (_jsonErr) {
        const textData = await upstreamResponse.text();
        responseData = {
          jsonrpc: '2.0',
          result: textData,
          id: payload.id ?? null,
        };
      }

      res.status(upstreamResponse.status).json(responseData);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Reverse Proxy Error';
      res.status(500).json({
        jsonrpc: '2.0',
        error: {
          code: -32603,
          message: `Upstream Remote Server Error (${message})`,
        },
        id: req.body?.payload?.id ?? null,
      });
    }
  };
}
