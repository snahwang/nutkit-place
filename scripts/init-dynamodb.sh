#!/bin/bash
# scripts/init-dynamodb.sh

ENDPOINT="http://localhost:8000"
TABLE="ZarketPlaces"

# 테이블 생성
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
  --region ap-northeast-2

echo "✓ Table '$TABLE' created"

# 태그 Seed 데이터
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
