// User text is data. Only explicit, allowlisted actions can select server operations.
export class RequestError extends Error {
 status: number;
 constructor(message: string, status = 400) { super(message); this.status = status; }
}
const record = (value: unknown): value is Record<string, any> =>
 value !== null && typeof value === 'object' && !Array.isArray(value);

export async function readCommand(request: Request, allowed: ReadonlySet<string>, maxBytes = 12000) {
 if (request.headers.get('Content-Type')?.split(';')[0].trim().toLowerCase() !== 'application/json')
  throw new RequestError('Envia um pedido JSON.', 415);
 const reader = request.body?.getReader();
 if (!reader) throw new RequestError('Pedido inválido.');
 let size = 0;
 const chunks: Uint8Array[] = [];
 try {
  while (true) {
   const {done, value} = await reader.read();
   if (done) break;
   size += value.byteLength;
   if (size > maxBytes) { await reader.cancel(); throw new RequestError('Pedido demasiado grande.', 413); }
   chunks.push(value);
  }
 } finally { reader.releaseLock(); }
 const bytes = new Uint8Array(size);
 let offset = 0;
 for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
 let body: unknown;
 try { body = JSON.parse(new TextDecoder('utf-8', {fatal: true}).decode(bytes)); }
 catch { throw new RequestError('JSON inválido.'); }
 if (!record(body) || typeof body.action !== 'string' || !allowed.has(body.action))
  throw new RequestError('Ação inválida.');
 if (Object.keys(body).some(key => key !== 'action' && key !== 'input'))
  throw new RequestError('Campos do pedido inválidos.');
 const input = body.input === undefined ? {} : body.input;
 if (!record(input)) throw new RequestError('Dados inválidos.');
 // Reject structural keys, not words in comments, names or recommendations.
 const check = (value: unknown, depth = 0): void => {
  if (depth > 12) throw new RequestError('Dados demasiado complexos.');
  if (value && typeof value === 'object') {
   for (const [key, child] of Object.entries(value)) {
    if (['__proto__', 'prototype', 'constructor'].includes(key)) throw new RequestError('Campo inválido.');
    check(child, depth + 1);
   }
  }
 };
 check(input);
 return {action: body.action, input};
}
