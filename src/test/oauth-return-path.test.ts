import { describe, expect, it } from 'vitest';
import { oauthReturnPath } from '@/lib/oauth-return-path';

describe('MCP OAuth return paths', () => {
  it('preserves the full local consent request', () => {
    expect(oauthReturnPath('/.lovable/oauth/consent?authorization_id=demo#review')).toBe('/.lovable/oauth/consent?authorization_id=demo#review');
  });
  it.each(['https://outside.example', '//outside.example', '/\\outside.example', '/bad\npath', undefined])('rejects unsafe return paths', value => {
    expect(oauthReturnPath(value)).toBe('/');
  });
});