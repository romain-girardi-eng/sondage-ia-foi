import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Rule of 29/10/2026: a site PRAGMA operates names PRAGMA (operator) and Hetzner (host) in its legal notice, and PRAGMA as processor in its privacy policy.
const read = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf8');

describe('hosting disclosures', () => {
  it('legal notice names Hetzner as host and PRAGMA as operator', () => {
    const legal = read('src/app/legal/page.tsx');
    expect(legal).toMatch(/Hébergeur\s:<\/strong> Hetzner Online/);
    expect(legal).toMatch(/Exploitation du serveur\s:<\/strong> PRAGMA/);
  });

  it('privacy policy lists PRAGMA as processor in both languages', () => {
    const privacy = read('src/app/[lang]/privacy/page.tsx');
    expect(privacy).toContain('{ name: "PRAGMA (Monaco)", role: "Operation of the application server');
    expect(privacy).toContain('{ name: "PRAGMA (Monaco)", role: "Exploitation du serveur');
  });
});
