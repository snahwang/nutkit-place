-- Seed data for Zarketplace Postgres
-- Run: psql -h localhost -U zarketplace -d zarketplace -f scripts/seed-postgres.sql

-- Tag Groups
INSERT INTO tag_groups ("groupId", "groupName") VALUES
  ('TYPE', '타입'),
  ('TARGET_TOOL', '대상 도구'),
  ('USE_CASE', '용도/역할'),
  ('CATEGORY', '카테고리')
ON CONFLICT ("groupId") DO NOTHING;

-- Tags
INSERT INTO tags ("tagId", "label", "groupId", "order") VALUES
  ('mcp', 'MCP', 'TYPE', 1),
  ('skill', 'Skill', 'TYPE', 2),
  ('plugin', 'Plugin', 'TYPE', 3),
  ('prompt', 'Prompt', 'TYPE', 4),
  ('claude_code', 'Claude Code', 'TARGET_TOOL', 1),
  ('cursor', 'Cursor', 'TARGET_TOOL', 2),
  ('windsurf', 'Windsurf', 'TARGET_TOOL', 3),
  ('copilot', 'Copilot', 'TARGET_TOOL', 4),
  ('dev', '개발', 'USE_CASE', 1),
  ('search', '검색', 'USE_CASE', 2),
  ('po', 'PO', 'USE_CASE', 3),
  ('qa', 'QA', 'USE_CASE', 4),
  ('devops', 'DevOps', 'USE_CASE', 5),
  ('design', '디자인', 'USE_CASE', 6),
  ('payment', '결제', 'CATEGORY', 1),
  ('auth', '인증', 'CATEGORY', 2),
  ('db', 'DB', 'CATEGORY', 3),
  ('api', 'API', 'CATEGORY', 4),
  ('docs', '문서화', 'CATEGORY', 5),
  ('test', '테스트', 'CATEGORY', 6),
  ('deploy', '배포', 'CATEGORY', 7)
ON CONFLICT ("tagId") DO NOTHING;

-- Demo Items
INSERT INTO items ("itemId", "type", "name", "description", "detailDescription", "tags", "status", "installActions", "githubUrl", "authorId", "authorName", "authorEmail", "starCount", "viewCount", "icon") VALUES
  ('demo-001', 'MCP', 'payment-mcp', '결제/정산 도메인에서 자주 쓰는 조회·테스트 도구를 MCP로 묶어 1-Click으로 사용합니다.', '# payment-mcp

결제 MCP 서버 예제입니다.

## 주요 기능
- 결제 내역 조회
- 테스트 결제 생성
- 정산 리포트 조회', '["payment","dev","mcp","api"]', 'published', '{"claude_code":{"command":"claude mcp add zigbang-payment -- npx @zigbang/payment-mcp","notes":"Requires Claude Code CLI v1.0+"},"cursor":{"command":"npx @zigbang/payment-mcp","path":".cursor/mcp.json","notes":"Add to MCP settings in Cursor"}}', 'https://github.com/zigbang/payment-mcp', 'user-seed', 'ZIGBANG', 'dev@zigbang.com', 128, 0, '💳'),
  ('demo-002', 'Skill', 'log-inspector', '에러 로그를 빠르게 요약하고, 원인 후보와 확인 체크리스트를 생성하는 스킬입니다.', '# log-inspector

로그 분석 스킬입니다.', '["devops","docs","search"]', 'published', '{"claude_code":{"command":"claude skill add log-inspector","notes":"Claude Code 전용 스킬"}}', '', 'user-seed', 'Platform', 'platform@zigbang.com', 64, 0, '🧯'),
  ('demo-003', 'Plugin', 'telegram-alerts', '업무 리마인더/알림을 텔레그램으로 보내는 플러그인 템플릿.', '# telegram-alerts

텔레그램 알림 플러그인입니다.', '["deploy","devops","plugin"]', 'published', '{"cursor":{"command":"npx @zigbang/telegram-alerts init","url":"cursor://extensions/zigbang.telegram-alerts","notes":"Cursor extension으로도 설치 가능"}}', '', 'user-seed', 'Tools', 'tools@zigbang.com', 42, 0, '📣'),
  ('demo-004', 'Prompt', 'scrum-daily', '어제/오늘/블로커를 30초 내로 말할 수 있게 정리해주는 스크럼 프롬프트.', '# scrum-daily

스크럼 정리 프롬프트입니다.', '["docs","po","prompt"]', 'published', '{}', '', 'user-seed', 'Product', 'product@zigbang.com', 91, 0, '📝'),
  ('demo-005', 'MCP', 'notion-mcp', '노션 페이지/DB를 생성·업데이트하는 MCP 서버 예제.', '# notion-mcp

노션 연동 MCP 서버입니다.', '["docs","api","mcp"]', 'published', '{"claude_code":{"command":"claude mcp add notion -- npx @zigbang/notion-mcp"},"cursor":{"command":"npx @zigbang/notion-mcp","path":".cursor/mcp.json"}}', '', 'user-seed', 'Internal', 'internal@zigbang.com', 77, 0, '📚'),
  ('demo-006', 'Skill', 'security-healthcheck', '서버 상태, 권한 설정, 노출 위험을 점검하고 개선 액션을 제안합니다.', '# security-healthcheck

보안 점검 스킬입니다.', '["devops","auth"]', 'published', '{"claude_code":{"command":"claude skill add security-healthcheck","notes":"보안 점검에 필요한 권한이 자동으로 요청됩니다"}}', '', 'user-seed', 'Ops', 'ops@zigbang.com', 33, 0, '🛡️')
ON CONFLICT ("itemId") DO NOTHING;
