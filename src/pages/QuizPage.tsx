import React, { useEffect } from 'react';
import { useQuizStore } from '../store/quizStore';
import { QuestionCard } from '../components/QuestionCard';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
`;

const CompletionContainer = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
  margin: 2rem 0;
`;

const CompletionTitle = styled.h1`
  font-size: 2rem;
  color: #1f2937;
  margin-bottom: 1.5rem;
`;

const CompletionMessage = styled.p`
  font-size: 1.2rem;
  color: #4b5563;
  margin-bottom: 2rem;
`;

const ExamModeBanner = styled.div`
  background: #f3f4f6;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const ExamModeInfo = styled.div`
  font-weight: 500;
  color: #1f2937;
  font-size: 1rem;

  @media (max-width: 640px) {
    text-align: center;
    font-size: 0.9rem;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
  justify-content: center;
  width: 100%;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }

  @media (min-width: 769px) {
    & > button {
      flex: 1;
      min-width: 120px;
      max-width: 200px;
    }
  }
`;

const RestartButton = styled(Button).attrs({ variant: 'danger' })`
  @media (max-width: 640px) {
    font-size: 0.875rem;
    padding: 0.5rem 1rem;
  }
`;

const EndButton = styled(Button).attrs({ variant: 'primary' })`
  @media (max-width: 640px) {
    font-size: 0.875rem;
    padding: 0.5rem 1rem;
  }
`;

const Navigation = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding: 0.5rem;
  background: #f9fafb;
  border-radius: 8px;
  position: sticky;
  top: 0;
  z-index: 10;
`;

const Progress = styled.div`
  font-size: 1.2rem;
  font-weight: 500;
  color: #1f2937;
`;

const QuizPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    filtered,
    current,
    answers,
    setAnswer,
    next,
    prev,
    completed,
    showAnswer,
    examMode,
    setShowAnswer,
    load,
    save,
    clearExamMode,
    // reset,
    finishExam,
    saveExamProgress,
    // setCurrent,
    retryCurrentMode
  } = useQuizStore();

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (examMode) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [examMode]);

  useEffect(() => {
    if (examMode) {
      load();
    }
  }, [examMode, load]);

  useEffect(() => {
    save();
    // 시험 모드에서만 진행 상태 저장
    if (examMode) {
      saveExamProgress();
    }
  }, [current, answers, completed, showAnswer, examMode, save, saveExamProgress]);

  // 시험 완료 시 결과 저장 (useEffect는 컴포넌트 최상위에서만 사용)
  useEffect(() => {
    if (completed && examMode) {
      const result = finishExam();
      if (result) {
        console.log('Exam completed and saved:', result);
      }
    }
  }, [completed, examMode, finishExam]);

  // 핸들러 함수들을 먼저 정의
  const handleRestart = () => {
    if (window.confirm('시험을 다시 시작하시겠습니까? 모든 답안이 초기화되고 첫 문제로 돌아갑니다.')) {
      // 현재 시험 모드를 유지하면서 첫 문제로 돌아가고 답안만 초기화
      retryCurrentMode(false); // 답안 초기화 및 진행 상태 업데이트
    }
  };

  const handleExamEnd = () => {
    if (window.confirm('시험을 종료하시겠습니까?')) {
      if (examMode) {
        const result = finishExam();
        if (result) {
          console.log('Exam ended and saved:', result);
        }
      }
      navigate('/result');
    }
  };

  const handleNext = () => {
    if (current === filtered.length - 1) {
      if (window.confirm('시험을 종료하시겠습니까?')) {
        next();
      }
    } else {
      next();
    }
  };

  // 현재 모드로 다시 시작 (답안 유지)
  const handleRetryWithAnswers = () => {
    retryCurrentMode(true); // 답안 유지
  };

  // 현재 모드로 다시 시작 (답안 초기화)
  const handleRetryFresh = () => {
    if (window.confirm('모든 답안을 초기화하고 다시 시작하시겠습니까?')) {
      retryCurrentMode(false); // 답안 초기화
    }
  };

  // 시험 모드 선택 페이지로 이동
  const handleSelectExamMode = () => {
    clearExamMode();
    navigate('/');
  };

  const handleShowAnswer = () => {
    setShowAnswer(!showAnswer);
  };

  if (filtered.length === 0) return <div>문제가 없습니다.</div>;

  if (completed) {
    return (
      <Container>
        <CompletionContainer>
          <CompletionTitle>
            {examMode ? '시험이 완료되었습니다!' : '퀴즈가 완료되었습니다!'}
          </CompletionTitle>
          <CompletionMessage>
            {filtered.length}문제 중 {Object.keys(answers).length}문제를 풀었습니다.<br />
            결과를 확인해보세요.
          </CompletionMessage>
          <ButtonGroup>
            <Button onClick={() => navigate('/result')}>
              결과 보기
            </Button>
            <Button onClick={handleRetryWithAnswers} variant="secondary">
              다시 풀기 (답안 유지)
            </Button>
            <Button onClick={handleRetryFresh} variant="secondary">
              다시 풀기 (새로 시작)
            </Button>
            <Button onClick={handleSelectExamMode} variant="secondary">
              시험 모드 선택
            </Button>
          </ButtonGroup>
        </CompletionContainer>
      </Container>
    );
  }

  const q = filtered[current];

  return (
    <Container>
      {examMode && (
        <ExamModeBanner>
          <ExamModeInfo>
            {examMode.mode === 'random' 
              ? `${examMode.questionCount}문제 랜덤 시험 모드` 
              : examMode.mode === 'practice'
              ? '실전 모드 (65문제 중 50문제 채점)'
              : `${examMode.startNumber}번 ~ ${examMode.endNumber}번 문제 시험 모드`}
          </ExamModeInfo>
          <ButtonGroup>
            <RestartButton onClick={handleRestart}>
              시험 다시 시작
            </RestartButton>
            <EndButton onClick={handleExamEnd}>
              시험 종료
            </EndButton>
          </ButtonGroup>
        </ExamModeBanner>
      )}
      <Navigation>
        <Button 
          onClick={prev} 
          disabled={current === 0}
          variant="secondary"
        >
          이전 문제
        </Button>
        <Progress>
          {current + 1} / {filtered.length}
        </Progress>
        <Button 
          onClick={handleNext} 
          variant="secondary"
        >
          {current === filtered.length - 1 ? '완료' : '다음 문제'}
        </Button>
      </Navigation>
      <QuestionCard
        question={q}
        selected={answers[q.number]}
        onSelect={ans => {
          setAnswer(q.number, ans);
          setShowAnswer(false);
        }}
        showAnswer={showAnswer}
        onShowAnswer={handleShowAnswer}
        hideNumber={!!examMode && (examMode.mode === 'random' || examMode.isRandom || examMode.mode === 'practice')}
      />
    </Container>
  );
};

export default QuizPage; 