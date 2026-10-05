import React, { useEffect, useState } from 'react';
import { useQuizStore } from '../store/quizStore';
import { QuestionCard } from '../components/QuestionCard';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { getExamTypeById } from '../data/examTypes';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  margin-bottom: 1rem;
`;

const ScoreContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
  padding: 2rem;
  margin-bottom: 2rem;
`;

const ScoreBar = styled.div<{ $score: number; $isPassing: boolean }>`
  width: 100%;
  height: 24px;
  background: #e5e7eb;
  border-radius: 12px;
  margin: 1rem 0;
  overflow: hidden;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: ${props => props.$score}%;
    background: ${props => props.$isPassing ? '#3b82f6' : '#ef4444'};
    transition: width 0.5s ease-in-out;
  }
`;

const ScoreInfo = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin: 1rem 0;
  font-size: 1.1rem;
`;

const ScoreValue = styled.div<{ $isPassing?: boolean }>`
  color: ${props => props.$isPassing === undefined ? '#1f2937' : props.$isPassing ? '#3b82f6' : '#ef4444'};
  font-weight: 600;
`;

const StatsContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
  padding: 2rem;
  margin-bottom: 2rem;
`;

const StatsTitle = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #1f2937;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
`;

const StatsItem = styled.div<{ $isScored?: boolean }>`
  padding: 1rem;
  background: ${props => props.$isScored ? '#e0f2fe' : '#f9fafb'};
  border-radius: 8px;
  border: ${props => props.$isScored ? '1px solid #bae6fd' : 'none'};
`;

const StatsLabel = styled.div<{ $isScored?: boolean }>`
  color: ${props => props.$isScored ? '#0369a1' : '#4b5563'};
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  font-weight: ${props => props.$isScored ? '500' : 'normal'};
`;

const StatsValue = styled.div`
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;

  @media (max-width: 640px) {
    font-size: 1.2rem;
  }
`;

const StatsPercentage = styled.span`
  font-size: 1rem;
  color: #6b7280;
  font-weight: normal;

  @media (max-width: 640px) {
    font-size: 0.875rem;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
`;

const TopButton = styled.button`
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  background: #64748b;
  color: white;
  border: none;
  border-radius: 50%;
  width: 3rem;
  height: 3rem;
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: all 0.2s;
  opacity: 0;
  visibility: hidden;

  &:hover {
    background: #475569;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }

  &:active {
    transform: translateY(0);
  }

  &.visible {
    opacity: 1;
    visibility: visible;
  }

  @media (max-width: 640px) {
    bottom: 1.5rem;
    right: 1.5rem;
    width: 2.5rem;
    height: 2.5rem;
    font-size: 1.25rem;
  }
`;

const ResultPage: React.FC = () => {
  const { filtered, answers, reset, retryWrongAnswers, examMode, selectedExamType } = useQuizStore();
  const navigate = useNavigate();
  const [showTopButton, setShowTopButton] = useState(false);
  
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
    if (examMode?.mode === 'practice') {
      console.log('실전 모드 examMode:', examMode);
      console.log('채점 대상 문제:', examMode.scoredQuestions);
    }
  }, [examMode]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setShowTopButton(scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // 정답 계산
  const correctAnswers = filtered.filter(q => {
    const userAnswer = answers[q.number];
    const correctAnswer = q.answer;

    // 정답이 없는 문제는 자동으로 정답 처리
    if (!correctAnswer) {
      return true;
    }

    // 복수 선택 문제 처리
    if (q.isMultipleChoice) {
      if (!userAnswer || !Array.isArray(userAnswer)) return false;
      const sortedUserAnswer = [...userAnswer].sort().join('');
      const sortedCorrectAnswer = [...correctAnswer].sort().join('');
      return sortedUserAnswer === sortedCorrectAnswer;
    }

    // 단일 선택 문제 처리
    return userAnswer === correctAnswer;
  });

  // 점수 계산
  let score: number;
  let totalQuestions: number;
  let scorePercentage: number;

  if (examMode?.isPracticeMode) {
    // 실전 모드: 50문제만 점수에 반영 (각 20점)
    const scoredCorrectAnswers = correctAnswers.filter(q => 
      examMode.scoredQuestions?.includes(q.number)
    );
    score = scoredCorrectAnswers.length * 20;
    totalQuestions = 50;  // 점수에 반영되는 문제 수
    scorePercentage = (score / 1000) * 100;
  } else {
    // 일반 모드: 모든 문제가 동일한 배점
    totalQuestions = filtered.length;
    const pointsPerQuestion = 1000 / totalQuestions;
    score = Math.round(correctAnswers.length * pointsPerQuestion);
    scorePercentage = (score / 1000) * 100;
  }

  // 현재 시험의 합격 점수 가져오기
  const currentExamType = getExamTypeById(selectedExamType);
  const passingScore = currentExamType?.passingScore || 700;
  const isPassing = score >= passingScore;

  // 통계 계산
  const correctCount = correctAnswers.length;
  const wrongCount = filtered.length - correctCount;
  const correctPercentage = Math.round((correctCount / filtered.length) * 100);
  const wrongPercentage = 100 - correctPercentage;

  // 오답 문제 표시 (시험 순서 유지)
  const wrongAnswers = filtered
    .map((q, index) => ({ 
      ...q, 
      examOrder: index + 1,  // 시험에서의 순서
      isCorrect: correctAnswers.includes(q)  // 정답 여부
    }))
    .filter(q => !q.isCorrect)  // 오답만 필터링
    .sort((a, b) => a.examOrder - b.examOrder);  // 시험 순서대로 정렬

  // 채점 대상 문제의 정답 계산 (실전 모드용)
  const scoredCorrectAnswers = examMode?.mode === 'practice' && examMode.scoredQuestions
    ? filtered
        .filter(q => examMode.scoredQuestions?.includes(q.number))
        .filter(q => {
          const userAnswer = answers[q.number];
          const correctAnswer = q.answer;

          if (!correctAnswer) return true;

          if (q.isMultipleChoice) {
            if (!userAnswer || !Array.isArray(userAnswer)) return false;
            const sortedUserAnswer = [...userAnswer].sort().join('');
            const sortedCorrectAnswer = [...correctAnswer].sort().join('');
            return sortedUserAnswer === sortedCorrectAnswer;
          }

          return userAnswer === correctAnswer;
        })
    : [];

  const scoredCorrectCount = scoredCorrectAnswers.length;
  const scoredWrongCount = (examMode?.scoredQuestions?.length || 0) - scoredCorrectCount;
  const scoredCorrectPercentage = examMode?.scoredQuestions 
    ? Math.round((scoredCorrectCount / examMode.scoredQuestions.length) * 100)
    : 0;
  const scoredWrongPercentage = 100 - scoredCorrectPercentage;

  return (
    <Container>
      <Title>시험 결과</Title>
      
      <ScoreContainer>
        <ScoreBar $score={scorePercentage} $isPassing={isPassing} />
        <ScoreInfo>
          <span>Passing Score</span>
          <ScoreValue>{passingScore}/1000</ScoreValue>
          <span>Your Score</span>
          <ScoreValue $isPassing={isPassing}>{score}/1000</ScoreValue>
          <span>Grade</span>
          <ScoreValue $isPassing={isPassing}>{isPassing ? 'Pass' : 'Fail'}</ScoreValue>
          {examMode?.isPracticeMode && (
            <>
              <span>채점된 문제</span>
              <ScoreValue>{totalQuestions}문제 (각 20점)</ScoreValue>
            </>
          )}
        </ScoreInfo>
      </ScoreContainer>

      <StatsContainer>
        <StatsTitle>정답률</StatsTitle>
        <StatsGrid>
          <StatsItem>
            <StatsLabel>전체 정답</StatsLabel>
            <StatsValue>
              {correctCount} / {totalQuestions} 문제
              <StatsPercentage>({correctPercentage}%)</StatsPercentage>
            </StatsValue>
          </StatsItem>
          <StatsItem>
            <StatsLabel>전체 오답</StatsLabel>
            <StatsValue>
              {wrongCount} / {totalQuestions} 문제
              <StatsPercentage>({wrongPercentage}%)</StatsPercentage>
            </StatsValue>
          </StatsItem>
          {examMode?.mode === 'practice' && examMode.scoredQuestions && (
            <>
              <StatsItem $isScored>
                <StatsLabel $isScored>채점 대상 정답</StatsLabel>
                <StatsValue>
                  {scoredCorrectCount} / {examMode.scoredQuestions.length} 문제
                  <StatsPercentage>({scoredCorrectPercentage}%)</StatsPercentage>
                </StatsValue>
              </StatsItem>
              <StatsItem $isScored>
                <StatsLabel $isScored>채점 대상 오답</StatsLabel>
                <StatsValue>
                  {scoredWrongCount} / {examMode.scoredQuestions.length} 문제
                  <StatsPercentage>({scoredWrongPercentage}%)</StatsPercentage>
                </StatsValue>
              </StatsItem>
            </>
          )}
        </StatsGrid>
      </StatsContainer>

      {wrongCount > 0 && (
        <>
          <h2>오답 문제</h2>
          {wrongAnswers.map((q) => {
            const isScored = examMode?.mode === 'practice' && examMode.scoredQuestions?.includes(q.number);
            return (
              <QuestionCard
                key={q.number}
                question={q}
                selected={answers[q.number]}
                showAnswer={true}
                hideNumber={false}
                customNumber={
                  examMode?.mode === 'practice' 
                    ? `${isScored ? '[채점 포함]' : '[채점 제외]'} ${q.examOrder}번 - Examtopic ${q.number}번`
                    : `${q.examOrder}번 - Examtopic ${q.number}번`
                }
                hideAnswerButton={true}
              />
            );
          })}
        </>
      )}
      <ButtonGroup>
        {wrongCount > 0 && (
          <Button onClick={() => {
            retryWrongAnswers();
            navigate('/quiz');
          }}>
            틀린 문제만 다시 풀기
          </Button>
        )}
        <Button onClick={() => {
          reset();
          navigate('/');
        }} variant="secondary">
          새로운 시험 시작하기
        </Button>
      </ButtonGroup>
      <TopButton 
        onClick={scrollToTop}
        className={showTopButton ? 'visible' : ''}
        aria-label="맨 위로 이동"
      >
        ↑
      </TopButton>
    </Container>
  );
};

export default ResultPage; 