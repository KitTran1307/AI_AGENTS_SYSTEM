# CHANGELOG — TaskAPI

## [2026-03-22] — Bootstrap
**Session**: 001
**Feature Address**: system::bootstrap::initial
### Added
- Bootstrapped entire navigation file system via kitai-ai-agents-system-framework
- Created PROJECT_MAP.md reflecting Node.js/Express/PostgreSQL/Redis architecture
- Populated FEATURE_INDEX.md with auth and tasks domain entries
- Created src/auth/MODULE_MANIFEST.md
### Infrastructure
- No commands run (bootstrap is read-only analysis)

## [2026-03-22] — Add JWT refresh token rotation
**Session**: 002
**Feature Address**: auth::users::refresh_token::create
### Added
- POST /auth/refresh endpoint accepting refresh token in httpOnly cookie
- AuthService.refreshToken() — validates, rotates (old token blacklisted), issues new pair
- Redis-backed token blacklist with TTL matching token expiry
### Changed
- AuthService.login() now sets refresh token in httpOnly cookie in addition to returning access token
### Infrastructure
- redis-cli PING verified connection before deploying session-dependent change
### Decisions
- Chose httpOnly cookie over response body for refresh token: prevents XSS token theft.
  Reversal: easy — move token to response body. CEO approval: no (security detail, not policy).
