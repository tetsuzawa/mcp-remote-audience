import { describe, it, expect } from 'vitest'
import { parseCommandLineArgs } from './utils'

// All sanitizeUrl tests have been moved to the strict-url-sanitise package

describe('parseCommandLineArgs', () => {
  it('should parse server URL correctly', async () => {
    const args = ['https://example.com/sse']
    const usage = 'test usage'
    
    const result = await parseCommandLineArgs(args, usage)
    
    expect(result.serverUrl).toBe('https://example.com/sse')
    expect(typeof result.serverUrl).toBe('string')
  })

  it('should parse server URL with additional parameters', async () => {
    const args = ['https://example.com/sse', '3000']
    const usage = 'test usage'
    
    const result = await parseCommandLineArgs(args, usage)
    
    expect(result.serverUrl).toBe('https://example.com/sse')
    expect(result.callbackPort).toBe(3000)
  })

  it('should handle localhost URLs with http protocol', async () => {
    const args = ['http://localhost:8080/sse']
    const usage = 'test usage'
    
    const result = await parseCommandLineArgs(args, usage)
    
    expect(result.serverUrl).toBe('http://localhost:8080/sse')
  })

  it('should handle 127.0.0.1 URLs with http protocol', async () => {
    const args = ['http://127.0.0.1:8080/sse']
    const usage = 'test usage'
    
    const result = await parseCommandLineArgs(args, usage)
    
    expect(result.serverUrl).toBe('http://127.0.0.1:8080/sse')
  })

  it('should parse custom headers correctly', async () => {
    const args = ['https://example.com/sse', '--header', 'foo: taz']
    const usage = 'test usage'
    
    const result = await parseCommandLineArgs(args, usage)
    
    expect(result.serverUrl).toBe('https://example.com/sse')
    expect(result.headers).toEqual({ foo: ' taz' })
  })

  it('should parse multiple custom headers correctly', async () => {
    const args = ['https://example.com/sse', '--header', 'Authorization: Bearer token123', '--header', 'Content-Type: application/json']
    const usage = 'test usage'
    
    const result = await parseCommandLineArgs(args, usage)
    
    expect(result.serverUrl).toBe('https://example.com/sse')
    expect(result.headers).toEqual({ 
      Authorization: ' Bearer token123',
      'Content-Type': ' application/json'
    })
  })

  it('should ignore invalid header format', async () => {
    const args = ['https://example.com/sse', '--header', 'invalid-header-format']
    const usage = 'test usage'
    
    const result = await parseCommandLineArgs(args, usage)
    
    expect(result.serverUrl).toBe('https://example.com/sse')
    expect(result.headers).toEqual({})
  })

  it('should handle --allow-http flag for non-localhost URLs', async () => {
    const args = ['http://example.com/sse', '--allow-http']
    const usage = 'test usage'
    
    const result = await parseCommandLineArgs(args, usage)
    
    expect(result.serverUrl).toBe('http://example.com/sse')
  })

  it('should work without --allow-http for https URLs', async () => {
    const args = ['https://example.com/sse']
    const usage = 'test usage'
    
    const result = await parseCommandLineArgs(args, usage)
    
    expect(result.serverUrl).toBe('https://example.com/sse')
  })

  it('should handle --allow-http with other arguments', async () => {
    const args = ['http://example.com/sse', '4000', '--allow-http', '--header', 'Authorization: Bearer abc123']
    const usage = 'test usage'
    
    const result = await parseCommandLineArgs(args, usage)
    
    expect(result.serverUrl).toBe('http://example.com/sse')
    expect(result.callbackPort).toBe(4000)
    expect(result.headers).toEqual({ Authorization: ' Bearer abc123' })
  })

  it('should use default transport strategy when not specified', async () => {
    const args = ['https://example.com/sse']
    const usage = 'test usage'
    
    const result = await parseCommandLineArgs(args, usage)
    
    expect(result.transportStrategy).toBe('http-first')
  })

  it('should parse transport strategy sse-only correctly', async () => {
    const args = ['https://example.com/sse', '--transport', 'sse-only']
    const usage = 'test usage'
    
    const result = await parseCommandLineArgs(args, usage)
    
    expect(result.transportStrategy).toBe('sse-only')
  })

  it('should parse transport strategy http-only correctly', async () => {
    const args = ['https://example.com/sse', '--transport', 'http-only']
    const usage = 'test usage'
    
    const result = await parseCommandLineArgs(args, usage)
    
    expect(result.transportStrategy).toBe('http-only')
  })

  it('should parse transport strategy sse-first correctly', async () => {
    const args = ['https://example.com/sse', '--transport', 'sse-first']
    const usage = 'test usage'
    
    const result = await parseCommandLineArgs(args, usage)
    
    expect(result.transportStrategy).toBe('sse-first')
  })

  it('should parse transport strategy http-first correctly', async () => {
    const args = ['https://example.com/sse', '--transport', 'http-first']
    const usage = 'test usage'
    
    const result = await parseCommandLineArgs(args, usage)
    
    expect(result.transportStrategy).toBe('http-first')
  })

  it('should ignore invalid transport strategy and use default', async () => {
    const args = ['https://example.com/sse', '--transport', 'invalid-strategy']
    const usage = 'test usage'
    
    const result = await parseCommandLineArgs(args, usage)
    
    expect(result.transportStrategy).toBe('http-first') // Should fallback to default
  })

  it('should use default host when not specified', async () => {
    const args = ['https://example.com/sse']
    const usage = 'test usage'
    
    const result = await parseCommandLineArgs(args, usage)
    
    expect(result.host).toBe('localhost')
  })

  it('should parse custom host correctly', async () => {
    const args = ['https://example.com/sse', '--host', '127.0.0.1']
    const usage = 'test usage'
    
    const result = await parseCommandLineArgs(args, usage)
    
    expect(result.host).toBe('127.0.0.1')
  })

  it('should parse custom domain host correctly', async () => {
    const args = ['https://example.com/sse', '--host', 'myserver.local']
    const usage = 'test usage'
    
    const result = await parseCommandLineArgs(args, usage)
    
    expect(result.host).toBe('myserver.local')
  })

  it('should handle host with other arguments', async () => {
    const args = ['https://example.com/sse', '3000', '--host', 'custom.host.com', '--transport', 'sse-only']
    const usage = 'test usage'
    
    const result = await parseCommandLineArgs(args, usage)
    
    expect(result.serverUrl).toBe('https://example.com/sse')
    expect(result.callbackPort).toBe(3000)
    expect(result.host).toBe('custom.host.com')
    expect(result.transportStrategy).toBe('sse-only')
  })
})
