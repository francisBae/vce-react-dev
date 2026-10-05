import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  body {
    /* ChatGPT 스타일 파스텔 그라데이션 배경 */
    background: linear-gradient(135deg, 
      #f3e8ff 0%,     /* 매우 연한 보라 */
      #fdf2f8 20%,    /* 매우 연한 핑크 */
      #fefce8 40%,    /* 매우 연한 노랑 */
      #f0f9ff 60%,    /* 매우 연한 파랑 */
      #f0f9ff 80%,    /* 매우 연한 파랑 */
      #f8fafc 100%    /* 거의 흰색 */
    );
    background-attachment: fixed;
    min-height: 100vh;
    font-family: 'Pretendard', 'Noto Sans KR', sans-serif;
    margin: 0;
    color: #222;
  }
  
  /* 글래스모피즘 효과를 위한 글로벌 스타일 */
  * {
    box-sizing: border-box;
  }
  
  /* 모든 흰색 배경을 반투명으로 변경 */
  div[style*="background: white"],
  div[style*="background: #fff"],
  div[style*="background:#fff"],
  div[style*="background-color: white"],
  div[style*="background-color: #fff"],
  div[style*="background-color:#fff"] {
    background: rgba(255, 255, 255, 0.85) !important;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.3);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  }
  
  /* 네비게이션 바 스타일 */
  nav {
    background: rgba(255, 255, 255, 0.9) !important;
    backdrop-filter: blur(15px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.3) !important;
    box-shadow: 0 1px 10px rgba(0, 0, 0, 0.05);
  }
  
  a {
    color: #2563eb;
    text-decoration: none;
  }
`;

export default GlobalStyle; 