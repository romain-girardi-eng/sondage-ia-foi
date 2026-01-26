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
User Email → SHA-256 Hash → email_hashes table (duplicate detection)
           → AES-256-GCM → email_submissions table (PDF delivery)
```

- Emails are **never stored in plaintext**
- Hash allows duplicate detection without storing email
- Encrypted email allows PDF delivery
- Encryption key stored in environment variable

### IP Address Handling

```
User IP → SHA-256 + Salt → ip_hash (audit logs only)
```

- IPs are **never stored in plaintext**
- Salted hash prevents rainbow table attacks
- Used only for:
  - Rate limiting patterns
  - Abuse detection
  - GDPR compliance audits

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

- Deletes all data: responses, sessions, email_submissions
- CSRF protected
- Audit logged with deletion counts

### Data Minimization

- Only collect necessary data
- Emails encrypted at rest
- IPs hashed, never stored plaintext
- No tracking cookies

## Environment Variables

| Variable | Purpose | Required |
|----------|---------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase API URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Private service key | Yes |
| `EMAIL_ENCRYPTION_KEY` | AES-256 key for emails | Yes |
| `IP_HASH_SALT` | Salt for IP hashing | Yes |
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

- **2026-01-26**: Initial security hardening migration (005_security_hardening.sql)
  - Dropped permissive RLS policies
  - Added FORCE RLS on all tables
  - Fixed SECURITY DEFINER functions
  - Added audit logging
  - Added secure GDPR functions
