# Security Architecture

This document describes the security architecture of the Sondage IA & Foi survey application.

## Overview

This is an **anonymous survey application** with GDPR compliance requirements. The security model is designed for:

- Anonymous data collection (no user authentication)
- Privacy-preserving duplicate detection
- GDPR rights (data access, data deletion)
- Protection against ballot stuffing
- Audit logging for compliance

## Security Model

### Two-Tier Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        PUBLIC TIER                               │
│                     (anon Supabase key)                          │
├─────────────────────────────────────────────────────────────────┤
│  Allowed Operations:                                             │
│  ✓ INSERT sessions (start survey)                               │
│  ✓ UPDATE own session (save progress)                           │
│  ✓ INSERT responses (submit survey with consent)                │
│  ✓ INSERT email_submissions (request PDF)                       │
│  ✓ CALL get_aggregated_results() (public stats)                 │
│  ✓ CALL get_participant_count() (public count)                  │
│  ✓ CALL check_submission_allowed() (duplicate check)            │
│                                                                  │
│  Blocked Operations:                                             │
│  ✗ SELECT any personal data                                     │
│  ✗ UPDATE/DELETE responses                                      │
│  ✗ Access other users' data                                     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                       PRIVATE TIER                               │
│                   (service_role key)                             │
├─────────────────────────────────────────────────────────────────┤
│  Used exclusively by API routes for:                            │
│  ✓ GDPR data access (GET /api/user/data)                        │
│  ✓ GDPR data deletion (DELETE /api/user/data)                   │
│  ✓ Admin operations (stats, exports)                            │
│  ✓ PDF email sending                                            │
│  ✓ Security audit log access                                    │
│                                                                  │
│  All operations are:                                            │
│  • Authenticated via API routes                                 │
│  • Rate limited                                                 │
│  • CSRF protected (for mutations)                               │
│  • Audit logged                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Row Level Security (RLS)

All tables have RLS **enabled and forced**:

```sql
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
ALTER TABLE table_name FORCE ROW LEVEL SECURITY;
```

#### Policy Summary

| Table | anon | service_role |
|-------|------|--------------|
| `sessions` | INSERT, UPDATE (own, recent) | ALL |
| `responses` | INSERT (with consent) | ALL |
| `email_submissions` | INSERT | ALL |
| `submission_tracking` | INSERT | ALL |
| `email_hashes` | INSERT | ALL |
| `security_audit_log` | - | ALL |

### SECURITY DEFINER Functions

All privileged functions use:

```sql
SECURITY DEFINER
SET search_path = ''
```

This prevents:
- Search path injection attacks
- Privilege escalation
- Unintended schema access

## Privacy Protection

### Anonymous ID

- Generated client-side (UUID v4)
- Stored in localStorage
- Acts as a "bearer token" for data ownership
- **Not cryptographically secure** - provides convenience, not security

### Email Handling

```
User Email → Keyed HMAC-SHA256 → email_hashes table (duplicate detection)
           → (transient, in-memory only) → sent via Resend for the optional PDF, never persisted
```

- Emails are **never stored in plaintext**
- The hash is keyed (HMAC with a secret, not a bare SHA-256) so it cannot be brute-forced from a list of candidate emails without the key
- Hash allows duplicate detection without storing the email
- The email used to send the optional PDF report is held in memory for the duration of the request only and is never written to the database
- Legacy `email_submissions` rows (hash + AES-256-GCM encrypted email) predate this design and are being phased out; they remain in scope for deletion requests until purged

### IP Address Handling

```
User IP → Keyed HMAC-SHA256 → ip_hash (anti-abuse tracking + audit logs)
```

- IPs are **never stored in plaintext**
- The hash is keyed (HMAC with a secret), not a bare salted SHA-256
- Used only for:
  - Rate limiting (5 submissions per IP per 30 days)
  - Abuse detection
  - GDPR compliance audits
- Anti-abuse tracking records are purged after 90 days

## Attack Mitigations

### 1. Data Enumeration

**Threat:** Attacker tries to read all survey responses.

**Mitigation:**
- RLS blocks all SELECT for anon role
- No way to list anonymous_ids
- API routes require the anonymous_id (acts as a secret)

### 2. Ballot Stuffing

**Threat:** One person submits multiple surveys.

**Mitigation:**
- Browser fingerprint tracking
- IP address limits (5 per 30 days)
- Anonymous ID uniqueness check
- All checks in SECURITY DEFINER function

### 3. CSRF Attacks

**Threat:** Malicious site tricks user into deleting their data.

**Mitigation:**
- CSRF token required for DELETE operations
- Token validated server-side
- SameSite cookie policy

### 4. Rate Limiting

**Threat:** Brute force or DoS attacks.

**Mitigation:**
- Rate limiting on all API routes
- Different limits for read vs write operations
- IP-based tracking

### 5. SQL Injection

**Threat:** Malicious input in queries.

**Mitigation:**
- Parameterized queries (Supabase client)
- Input validation with Zod schemas
- Database-level constraints

### 6. Search Path Injection

**Threat:** Attacker creates malicious function in search path.

**Mitigation:**
- All SECURITY DEFINER functions use `SET search_path = ''`
- Explicit schema references (`public.table_name`)

## GDPR Compliance

### Right to Access (Article 15)

```
GET /api/user/data?anonymousId=<uuid>
```

- Returns all data associated with anonymous_id
- Audit logged for compliance
- Rate limited to prevent abuse

### Right to Erasure (Article 17)

```
DELETE /api/user/data
Body: { "anonymousId": "<uuid>" }
Header: X-CSRF-Token: <token>
```

- Deletes all data: responses, sessions, email_hashes, email_submissions (legacy), anti-abuse tracking
- Security audit log entries referencing the anonymous ID are anonymized rather than deleted, to preserve audit trail integrity
- CSRF protected
- Audit logged with deletion counts

### Data Minimization

- Only collect necessary data
- Emails stored only as a keyed HMAC-SHA256 hash (legacy AES-256-GCM encrypted rows are being phased out)
- IPs stored only as a keyed HMAC-SHA256 hash, never plaintext
- No tracking cookies (only a functional `survey_submitted` cookie and cookieless analytics)

## Environment Variables

| Variable | Purpose | Required |
|----------|---------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase API URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Private service key | Yes |
| `EMAIL_ENCRYPTION_KEY` | AES-256 key for legacy `email_submissions` rows (being phased out) | Legacy only |
| `IP_HASH_SALT` | Secret key for keyed HMAC-SHA256 IP hashing | Yes |
| `CSRF_SECRET` | CSRF token signing | Yes |

## Audit Logging

All sensitive operations are logged to `security_audit_log`:

```sql
SELECT * FROM security_dashboard;
-- Returns hourly aggregates for monitoring
```

Logged operations:
- `gdpr_data_access` - User accessed their data
- `gdpr_data_deletion` - User deleted their data
- `submission` - Survey submitted
- `submission_blocked` - Duplicate detected

## Deployment Checklist

- [ ] All environment variables set
- [ ] Service role key **never exposed to client**
- [ ] HTTPS enforced
- [ ] CORS configured for your domain only
- [ ] Rate limits appropriate for expected traffic
- [ ] Monitoring/alerting on security_audit_log
- [ ] Regular backup of encrypted data
- [ ] Incident response plan documented

## Security Contacts

For security issues, contact: [your-security-email]

## Changelog

- **2026-07-08**: Consent, IP/email hashing, and retention accuracy pass
  - Fingerprinting and session/anonymous-ID creation now gated on explicit consent
  - IP addresses hashed with a keyed HMAC (never raw); legacy SHA-256+salt description corrected
  - Emails hashed with a keyed HMAC for dedup; legacy AES-256-GCM encrypted storage being phased out
  - Retention purge documented: abandoned sessions (90 days), anti-abuse tracking (90 days), audit log (365 days, then anonymized), responses (~3 years, then anonymized)
  - Data export/deletion scope extended to all tables; audit log entries anonymized rather than deleted

- **2026-01-26**: Initial security hardening migration (005_security_hardening.sql)
  - Dropped permissive RLS policies
  - Added FORCE RLS on all tables
  - Fixed SECURITY DEFINER functions
  - Added audit logging
  - Added secure GDPR functions
