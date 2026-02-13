import { Controller, Get, Query, Render } from '@nestjs/common';

type ItemType = 'MCP' | 'Skill' | 'Plugin' | 'Prompt';

interface ItemCardVm {
  itemId: string;
  type: ItemType;
  name: string;
  description: string;
  tags: string[];
  starCount: number;
  authorName: string;
  icon?: string;
}

@Controller()
export class AppController {
  @Get()
  @Render('index')
  getIndex(
    @Query('q') q?: string,
    @Query('tag') tag?: string,
    @Query('type') type?: ItemType,
    @Query('sort') sort?: string,
  ) {
    // Temporary mock data for UI development.
    const items: ItemCardVm[] = [
      {
        itemId: 'demo-001',
        type: 'MCP',
        name: 'payment-mcp',
        description: '결제/정산 도메인에서 자주 쓰는 조회·테스트 도구를 MCP로 묶어 1-Click으로 사용합니다.',
        tags: ['payment', 'dev', 'mcp', 'api'],
        starCount: 128,
        authorName: 'ZIGBANG',
        icon: '💳',
      },
      {
        itemId: 'demo-002',
        type: 'Skill',
        name: 'log-inspector',
        description: '에러 로그를 빠르게 요약하고, 원인 후보와 확인 체크리스트를 생성하는 스킬입니다.',
        tags: ['devops', 'docs', 'search'],
        starCount: 64,
        authorName: 'Platform',
        icon: '🧯',
      },
      {
        itemId: 'demo-003',
        type: 'Plugin',
        name: 'telegram-alerts',
        description: '업무 리마인더/알림을 텔레그램으로 보내는 플러그인 템플릿.',
        tags: ['deploy', 'devops', 'plugin'],
        starCount: 42,
        authorName: 'Tools',
        icon: '📣',
      },
      {
        itemId: 'demo-004',
        type: 'Prompt',
        name: 'scrum-daily',
        description: '어제/오늘/블로커를 30초 내로 말할 수 있게 정리해주는 스크럼 프롬프트.',
        tags: ['docs', 'po', 'prompt'],
        starCount: 91,
        authorName: 'Product',
        icon: '📝',
      },
      {
        itemId: 'demo-005',
        type: 'MCP',
        name: 'notion-mcp',
        description: '노션 페이지/DB를 생성·업데이트하는 MCP 서버 예제.',
        tags: ['docs', 'api', 'mcp'],
        starCount: 77,
        authorName: 'Internal',
        icon: '📚',
      },
      {
        itemId: 'demo-006',
        type: 'Skill',
        name: 'security-healthcheck',
        description: '서버 상태, 권한 설정, 노출 위험을 점검하고 개선 액션을 제안합니다.',
        tags: ['devops', 'auth', 'security'],
        starCount: 33,
        authorName: 'Ops',
        icon: '🛡️',
      },
    ];

    return {
      title: 'Zarket Places',
      q: q || '',
      tag: tag || '',
      type: type || '',
      sort: sort || 'latest',
      items,
    };
  }
}
