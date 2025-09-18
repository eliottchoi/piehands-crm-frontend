module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // 새로운 기능 추가
        'fix',      // 버그 수정
        'docs',     // 문서 업데이트
        'style',    // 코드 스타일링
        'refactor', // 코드 리팩토링
        'test',     // 테스트 코드
        'chore',    // 빌드/설정 변경
        'perf',     // 성능 개선
        'ci',       // CI/CD 설정
        'revert',   // 커밋 되돌리기
      ],
    ],
    'scope-enum': [
      2,
      'always',
      [
        'ui',            // UI 컴포넌트
        'pages',         // 페이지 컴포넌트
        'hooks',         // 커스텀 훅
        'utils',         // 유틸리티 함수
        'api',           // API 클라이언트
        'store',         // 상태 관리
        'router',        // 라우팅
        'forms',         // 폼 처리
        'auth',          // 인증
        'analytics',     // 분석 대시보드
        'campaigns',     // 캠페인 관리
        'templates',     // 템플릿 에디터
        'users',         // 사용자 관리
        'settings',      // 설정 페이지
        'canvas',        // 캔버스 에디터
        'deps',          // 의존성 관리
        'config',        // 설정
        'infra',         // 인프라/배포
        'docs',          // 문서
      ],
    ],
    'scope-case': [2, 'always', 'kebab-case'],
    'subject-case': [2, 'always', 'sentence-case'],
    'subject-full-stop': [2, 'never', '.'],
    'subject-max-length': [2, 'always', 72],
    'body-max-line-length': [2, 'always', 100],
  },
};
