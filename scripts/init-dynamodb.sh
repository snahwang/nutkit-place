#!/bin/bash
# scripts/init-dynamodb.sh
# Initializes DynamoDB Local with table + seed data.
# No real AWS credentials required — local dummy values suffice.

export AWS_ACCESS_KEY_ID="${AWS_ACCESS_KEY_ID:-local}"
export AWS_SECRET_ACCESS_KEY="${AWS_SECRET_ACCESS_KEY:-local}"
export AWS_DEFAULT_REGION="ap-northeast-2"

ENDPOINT="http://localhost:8000"
TABLE="ZarketPlaces"

# Create table (ignore error if already exists)
aws dynamodb create-table \
  --endpoint-url $ENDPOINT \
  --table-name $TABLE \
  --attribute-definitions \
    AttributeName=PK,AttributeType=S \
    AttributeName=SK,AttributeType=S \
    AttributeName=GSI1PK,AttributeType=S \
    AttributeName=GSI1SK,AttributeType=S \
  --key-schema \
    AttributeName=PK,KeyType=HASH \
    AttributeName=SK,KeyType=RANGE \
  --global-secondary-indexes \
    '[{
      "IndexName": "GSI1",
      "KeySchema": [
        {"AttributeName": "GSI1PK", "KeyType": "HASH"},
        {"AttributeName": "GSI1SK", "KeyType": "RANGE"}
      ],
      "Projection": {"ProjectionType": "ALL"},
      "ProvisionedThroughput": {"ReadCapacityUnits": 5, "WriteCapacityUnits": 5}
    }]' \
  --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
  --region ap-northeast-2 2>/dev/null \
  && echo "✓ Table '$TABLE' created" \
  || echo "⊘ Table '$TABLE' already exists (skipped)"

# ---------- 태그 Seed 데이터 ----------
TAGS=(
  '{"PK":{"S":"TAG_GROUP#TYPE"},"SK":{"S":"TAG#mcp"},"tagId":{"S":"mcp"},"groupId":{"S":"TYPE"},"groupName":{"S":"타입"},"label":{"S":"MCP"},"order":{"N":"1"}}'
  '{"PK":{"S":"TAG_GROUP#TYPE"},"SK":{"S":"TAG#skill"},"tagId":{"S":"skill"},"groupId":{"S":"TYPE"},"groupName":{"S":"타입"},"label":{"S":"Skill"},"order":{"N":"2"}}'
  '{"PK":{"S":"TAG_GROUP#TYPE"},"SK":{"S":"TAG#plugin"},"tagId":{"S":"plugin"},"groupId":{"S":"TYPE"},"groupName":{"S":"타입"},"label":{"S":"Plugin"},"order":{"N":"3"}}'
  '{"PK":{"S":"TAG_GROUP#TYPE"},"SK":{"S":"TAG#prompt"},"tagId":{"S":"prompt"},"groupId":{"S":"TYPE"},"groupName":{"S":"타입"},"label":{"S":"Prompt"},"order":{"N":"4"}}'
  '{"PK":{"S":"TAG_GROUP#TARGET_TOOL"},"SK":{"S":"TAG#claude_code"},"tagId":{"S":"claude_code"},"groupId":{"S":"TARGET_TOOL"},"groupName":{"S":"대상 도구"},"label":{"S":"Claude Code"},"order":{"N":"1"}}'
  '{"PK":{"S":"TAG_GROUP#TARGET_TOOL"},"SK":{"S":"TAG#cursor"},"tagId":{"S":"cursor"},"groupId":{"S":"TARGET_TOOL"},"groupName":{"S":"대상 도구"},"label":{"S":"Cursor"},"order":{"N":"2"}}'
  '{"PK":{"S":"TAG_GROUP#TARGET_TOOL"},"SK":{"S":"TAG#windsurf"},"tagId":{"S":"windsurf"},"groupId":{"S":"TARGET_TOOL"},"groupName":{"S":"대상 도구"},"label":{"S":"Windsurf"},"order":{"N":"3"}}'
  '{"PK":{"S":"TAG_GROUP#TARGET_TOOL"},"SK":{"S":"TAG#copilot"},"tagId":{"S":"copilot"},"groupId":{"S":"TARGET_TOOL"},"groupName":{"S":"대상 도구"},"label":{"S":"Copilot"},"order":{"N":"4"}}'
  '{"PK":{"S":"TAG_GROUP#USE_CASE"},"SK":{"S":"TAG#dev"},"tagId":{"S":"dev"},"groupId":{"S":"USE_CASE"},"groupName":{"S":"용도/역할"},"label":{"S":"개발"},"order":{"N":"1"}}'
  '{"PK":{"S":"TAG_GROUP#USE_CASE"},"SK":{"S":"TAG#search"},"tagId":{"S":"search"},"groupId":{"S":"USE_CASE"},"groupName":{"S":"용도/역할"},"label":{"S":"검색"},"order":{"N":"2"}}'
  '{"PK":{"S":"TAG_GROUP#USE_CASE"},"SK":{"S":"TAG#po"},"tagId":{"S":"po"},"groupId":{"S":"USE_CASE"},"groupName":{"S":"용도/역할"},"label":{"S":"PO"},"order":{"N":"3"}}'
  '{"PK":{"S":"TAG_GROUP#USE_CASE"},"SK":{"S":"TAG#qa"},"tagId":{"S":"qa"},"groupId":{"S":"USE_CASE"},"groupName":{"S":"용도/역할"},"label":{"S":"QA"},"order":{"N":"4"}}'
  '{"PK":{"S":"TAG_GROUP#USE_CASE"},"SK":{"S":"TAG#devops"},"tagId":{"S":"devops"},"groupId":{"S":"USE_CASE"},"groupName":{"S":"용도/역할"},"label":{"S":"DevOps"},"order":{"N":"5"}}'
  '{"PK":{"S":"TAG_GROUP#USE_CASE"},"SK":{"S":"TAG#design"},"tagId":{"S":"design"},"groupId":{"S":"USE_CASE"},"groupName":{"S":"용도/역할"},"label":{"S":"디자인"},"order":{"N":"6"}}'
  '{"PK":{"S":"TAG_GROUP#CATEGORY"},"SK":{"S":"TAG#payment"},"tagId":{"S":"payment"},"groupId":{"S":"CATEGORY"},"groupName":{"S":"카테고리"},"label":{"S":"결제"},"order":{"N":"1"}}'
  '{"PK":{"S":"TAG_GROUP#CATEGORY"},"SK":{"S":"TAG#auth"},"tagId":{"S":"auth"},"groupId":{"S":"CATEGORY"},"groupName":{"S":"카테고리"},"label":{"S":"인증"},"order":{"N":"2"}}'
  '{"PK":{"S":"TAG_GROUP#CATEGORY"},"SK":{"S":"TAG#db"},"tagId":{"S":"db"},"groupId":{"S":"CATEGORY"},"groupName":{"S":"카테고리"},"label":{"S":"DB"},"order":{"N":"3"}}'
  '{"PK":{"S":"TAG_GROUP#CATEGORY"},"SK":{"S":"TAG#api"},"tagId":{"S":"api"},"groupId":{"S":"CATEGORY"},"groupName":{"S":"카테고리"},"label":{"S":"API"},"order":{"N":"4"}}'
  '{"PK":{"S":"TAG_GROUP#CATEGORY"},"SK":{"S":"TAG#docs"},"tagId":{"S":"docs"},"groupId":{"S":"CATEGORY"},"groupName":{"S":"카테고리"},"label":{"S":"문서화"},"order":{"N":"5"}}'
  '{"PK":{"S":"TAG_GROUP#CATEGORY"},"SK":{"S":"TAG#test"},"tagId":{"S":"test"},"groupId":{"S":"CATEGORY"},"groupName":{"S":"카테고리"},"label":{"S":"테스트"},"order":{"N":"6"}}'
  '{"PK":{"S":"TAG_GROUP#CATEGORY"},"SK":{"S":"TAG#deploy"},"tagId":{"S":"deploy"},"groupId":{"S":"CATEGORY"},"groupName":{"S":"카테고리"},"label":{"S":"배포"},"order":{"N":"7"}}'
)

for tag in "${TAGS[@]}"; do
  aws dynamodb put-item \
    --endpoint-url $ENDPOINT \
    --table-name $TABLE \
    --item "$tag" \
    --region ap-northeast-2
done

echo "✓ Seed tags inserted (${#TAGS[@]} items)"

# ---------- 아이템 Seed 데이터 (with per-tool installActions) ----------

ITEMS=(
  '{"PK":{"S":"ITEM#demo-001"},"SK":{"S":"METADATA"},"itemId":{"S":"demo-001"},"type":{"S":"MCP"},"name":{"S":"payment-mcp"},"description":{"S":"결제/정산 도메인에서 자주 쓰는 조회·테스트 도구를 MCP로 묶어 1-Click으로 사용합니다."},"detailDescription":{"S":"# payment-mcp\n\n결제 MCP 서버 예제입니다.\n\n## 주요 기능\n- 결제 내역 조회\n- 테스트 결제 생성\n- 정산 리포트 조회"},"tags":{"L":[{"S":"payment"},{"S":"dev"},{"S":"mcp"},{"S":"api"}]},"status":{"S":"published"},"installActions":{"M":{"claude_code":{"M":{"command":{"S":"claude mcp add zigbang-payment -- npx @zigbang/payment-mcp"},"notes":{"S":"Requires Claude Code CLI v1.0+"}}},"cursor":{"M":{"command":{"S":"npx @zigbang/payment-mcp"},"path":{"S":".cursor/mcp.json"},"notes":{"S":"Add to MCP settings in Cursor"}}}}},"githubUrl":{"S":"https://github.com/zigbang/payment-mcp"},"authorId":{"S":"user-seed"},"authorName":{"S":"ZIGBANG"},"authorEmail":{"S":"dev@zigbang.com"},"starCount":{"N":"128"},"viewCount":{"N":"340"},"icon":{"S":"💳"},"createdAt":{"S":"2026-02-01T09:00:00Z"},"updatedAt":{"S":"2026-02-01T09:00:00Z"}}'
  '{"PK":{"S":"ITEM#demo-002"},"SK":{"S":"METADATA"},"itemId":{"S":"demo-002"},"type":{"S":"Skill"},"name":{"S":"log-inspector"},"description":{"S":"에러 로그를 빠르게 요약하고, 원인 후보와 확인 체크리스트를 생성하는 스킬입니다."},"detailDescription":{"S":"# log-inspector\n\n로그 분석 스킬입니다.\n\n## 사용법\n1. 에러 로그를 붙여넣기\n2. 원인 분석 결과 확인\n3. 체크리스트 실행"},"tags":{"L":[{"S":"devops"},{"S":"docs"},{"S":"search"}]},"status":{"S":"published"},"installActions":{"M":{"claude_code":{"M":{"command":{"S":"claude skill add log-inspector"},"notes":{"S":"Claude Code 전용 스킬"}}}}},"authorId":{"S":"user-seed"},"authorName":{"S":"Platform"},"authorEmail":{"S":"platform@zigbang.com"},"starCount":{"N":"64"},"viewCount":{"N":"210"},"icon":{"S":"🧯"},"createdAt":{"S":"2026-02-03T10:00:00Z"},"updatedAt":{"S":"2026-02-03T10:00:00Z"}}'
  '{"PK":{"S":"ITEM#demo-003"},"SK":{"S":"METADATA"},"itemId":{"S":"demo-003"},"type":{"S":"Plugin"},"name":{"S":"telegram-alerts"},"description":{"S":"업무 리마인더/알림을 텔레그램으로 보내는 플러그인 템플릿."},"detailDescription":{"S":"# telegram-alerts\n\n텔레그램 알림 플러그인입니다."},"tags":{"L":[{"S":"deploy"},{"S":"devops"},{"S":"plugin"}]},"status":{"S":"published"},"installActions":{"M":{"cursor":{"M":{"command":{"S":"npx @zigbang/telegram-alerts init"},"url":{"S":"cursor://extensions/zigbang.telegram-alerts"},"notes":{"S":"Cursor extension으로도 설치 가능"}}}}},"authorId":{"S":"user-seed"},"authorName":{"S":"Tools"},"authorEmail":{"S":"tools@zigbang.com"},"starCount":{"N":"42"},"viewCount":{"N":"95"},"icon":{"S":"📣"},"createdAt":{"S":"2026-02-05T11:00:00Z"},"updatedAt":{"S":"2026-02-05T11:00:00Z"}}'
  '{"PK":{"S":"ITEM#demo-004"},"SK":{"S":"METADATA"},"itemId":{"S":"demo-004"},"type":{"S":"Prompt"},"name":{"S":"scrum-daily"},"description":{"S":"어제/오늘/블로커를 30초 내로 말할 수 있게 정리해주는 스크럼 프롬프트."},"detailDescription":{"S":"# scrum-daily\n\n스크럼 정리 프롬프트입니다.\n\n## 프롬프트 예시\n어제: ...\n오늘: ...\n블로커: ..."},"tags":{"L":[{"S":"docs"},{"S":"po"},{"S":"prompt"}]},"status":{"S":"published"},"installActions":{"M":{}},"authorId":{"S":"user-seed"},"authorName":{"S":"Product"},"authorEmail":{"S":"product@zigbang.com"},"starCount":{"N":"91"},"viewCount":{"N":"500"},"icon":{"S":"📝"},"createdAt":{"S":"2026-02-07T14:00:00Z"},"updatedAt":{"S":"2026-02-07T14:00:00Z"}}'
  '{"PK":{"S":"ITEM#demo-005"},"SK":{"S":"METADATA"},"itemId":{"S":"demo-005"},"type":{"S":"MCP"},"name":{"S":"notion-mcp"},"description":{"S":"노션 페이지/DB를 생성·업데이트하는 MCP 서버 예제."},"detailDescription":{"S":"# notion-mcp\n\n노션 연동 MCP 서버입니다."},"tags":{"L":[{"S":"docs"},{"S":"api"},{"S":"mcp"}]},"status":{"S":"published"},"installActions":{"M":{"claude_code":{"M":{"command":{"S":"claude mcp add notion -- npx @zigbang/notion-mcp"}}},"cursor":{"M":{"command":{"S":"npx @zigbang/notion-mcp"},"path":{"S":".cursor/mcp.json"}}}}},"authorId":{"S":"user-seed"},"authorName":{"S":"Internal"},"authorEmail":{"S":"internal@zigbang.com"},"starCount":{"N":"77"},"viewCount":{"N":"180"},"icon":{"S":"📚"},"createdAt":{"S":"2026-02-09T08:00:00Z"},"updatedAt":{"S":"2026-02-09T08:00:00Z"}}'
  '{"PK":{"S":"ITEM#demo-006"},"SK":{"S":"METADATA"},"itemId":{"S":"demo-006"},"type":{"S":"Skill"},"name":{"S":"security-healthcheck"},"description":{"S":"서버 상태, 권한 설정, 노출 위험을 점검하고 개선 액션을 제안합니다."},"detailDescription":{"S":"# security-healthcheck\n\n보안 점검 스킬입니다."},"tags":{"L":[{"S":"devops"},{"S":"auth"},{"S":"security"}]},"status":{"S":"published"},"installActions":{"M":{"claude_code":{"M":{"command":{"S":"claude skill add security-healthcheck"},"notes":{"S":"보안 점검에 필요한 권한이 자동으로 요청됩니다"}}}}},"authorId":{"S":"user-seed"},"authorName":{"S":"Ops"},"authorEmail":{"S":"ops@zigbang.com"},"starCount":{"N":"33"},"viewCount":{"N":"120"},"icon":{"S":"🛡️"},"createdAt":{"S":"2026-02-11T16:00:00Z"},"updatedAt":{"S":"2026-02-11T16:00:00Z"}}'
)

for item in "${ITEMS[@]}"; do
  aws dynamodb put-item \
    --endpoint-url $ENDPOINT \
    --table-name $TABLE \
    --item "$item" \
    --region ap-northeast-2
done

echo "✓ Seed items inserted (${#ITEMS[@]} items)"
