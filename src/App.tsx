import React, { useState, useRef, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import GlobalStyle from './styles/GlobalStyle';
import { theme } from './styles/theme';
import QuizPage from './pages/QuizPage';
import ResultPage from './pages/ResultPage';
import ExamSettingPage from './pages/ExamSettingPage';
import ExamHistoryPage from './pages/ExamHistoryPage';
import ExamDetailPage from './pages/ExamDetailPage';
import { examTypes } from './data/examTypes';
import styled from 'styled-components';

const Nav = styled.nav`
  padding: 1rem;
  background: #fff;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
`;

const NavLink = styled(Link)`
  color: #4b5563;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  transition: all 0.2s;

  &:hover {
    background: #f3f4f6;
    color: #1f2937;
  }

  &.active {
    background: #e5e7eb;
    color: #1f2937;
    font-weight: 500;
  }
`;

const DropdownContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const DumpButton = styled.button`
  background: #64748b;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background: #475569;
  }

  &:disabled {
    background: #cbd5e1;
    cursor: not-allowed;
  }
`;

const DropdownMenu = styled.div<{ $isOpen: boolean }>`
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  min-width: 200px;
  z-index: 1000;
  opacity: ${props => props.$isOpen ? 1 : 0};
  visibility: ${props => props.$isOpen ? 'visible' : 'hidden'};
  transform: translateY(${props => props.$isOpen ? '0' : '-10px'});
  transition: all 0.2s ease;
`;

const DropdownItem = styled.button`
  width: 100%;
  padding: 0.75rem 1rem;
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
  font-size: 0.875rem;
  transition: background 0.2s;

  &:hover {
    background: #f3f4f6;
  }

  &:first-child {
    border-top-left-radius: 6px;
    border-top-right-radius: 6px;
  }

  &:last-child {
    border-bottom-left-radius: 6px;
    border-bottom-right-radius: 6px;
  }
`;

const ExamLevel = styled.span`
  display: block;
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
`;

const Navigation: React.FC = () => {
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDumpDownload = (examType: typeof examTypes[0]) => {
    if (!examType.dumpFileName) return;

    const confirmMessage = `${examType.name} (${examType.description}) 덤프 파일을 다운로드하시겠습니까?\n\n레벨: ${examType.level.toUpperCase()}\n합격 점수: ${examType.passingScore}점`;
    
    if (confirm(confirmMessage)) {
      const a = document.createElement('a');
      a.href = `/${examType.dumpFileName}`;
      a.download = examType.dumpFileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
    
    setIsDropdownOpen(false);
  };

  const getLevelDisplayName = (level: string) => {
    switch (level) {
      case 'practitioner': return 'Practitioner';
      case 'associate': return 'Associate';
      case 'professional': return 'Professional';
      case 'specialty': return 'Specialty';
      default: return level;
    }
  };

  return (
    <Nav>
      <NavLink to="/" className={location.pathname === '/' ? 'active' : ''}>
        시험 모드
      </NavLink>
      <NavLink to="/quiz" className={location.pathname === '/quiz' ? 'active' : ''}>
        퀴즈
      </NavLink>
      <NavLink to="/result" className={location.pathname === '/result' ? 'active' : ''}>
        결과
      </NavLink>
      <NavLink to="/history" className={location.pathname === '/history' ? 'active' : ''}>
        시험 기록
      </NavLink>
      <DropdownContainer ref={dropdownRef}>
        <DumpButton onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
          덤프 다운로드
          <span style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
            ▼
          </span>
        </DumpButton>
        <DropdownMenu $isOpen={isDropdownOpen}>
          {examTypes.filter(exam => exam.dumpFileName).map(examType => (
            <DropdownItem
              key={examType.id}
              onClick={() => handleDumpDownload(examType)}
            >
              <div>
                <strong>{examType.name}</strong>
                <ExamLevel>
                  {getLevelDisplayName(examType.level)} | 합격점수: {examType.passingScore}점
                </ExamLevel>
              </div>
            </DropdownItem>
          ))}
        </DropdownMenu>
      </DropdownContainer>
    </Nav>
  );
};

const App: React.FC = () => (
  <ThemeProvider theme={theme}>
    <GlobalStyle />
    <BrowserRouter>
      <Navigation />
      <Routes>
        <Route path="/" element={<ExamSettingPage />} />
        <Route path="/quiz" element={<QuizPage />} />
        <Route path="/result" element={<ResultPage />} />
        <Route path="/history" element={<ExamHistoryPage />} />
        <Route path="/exam/:examId" element={<ExamDetailPage />} />
      </Routes>
    </BrowserRouter>
  </ThemeProvider>
);

export default App;