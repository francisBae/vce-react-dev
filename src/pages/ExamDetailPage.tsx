import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useQuizStore } from '../store/quizStore';
import { QuestionCard } from '../components/QuestionCard';
import { Button } from '../components/common/Button';
import { getExamTypeById } from '../data/examTypes';
import type { ExamResult, Question } from '../types/question';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
`;

const Header = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
  padding: 2rem;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  margin-bottom: 1rem;
  color: #1f2937;
`;

const ExamInfo = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
`;

const InfoItem = styled.div`
  h4 {
    font-size: 0.875rem;
    color: #6b7280;
    margin: 0 0 0.25rem 0;
    font-weight: 500;
  }
  p {
    font-size: 1rem;
    font-weight: 600;
    color: #1f2937;
    margin: 0;
  }
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
    background: ${props => props.$isPassing ? '#10b981' : '#ef4444'};
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
  color: ${props => props.$isPassing === undefined ? '#1f2937' : props.$isPassing ? '#10b981' : '#ef4444'};
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
  border-radius: 8px;
  background: ${props => props.$isScored ? '#fef3c7' : '#f3f4f6'};
  border-left: 4px solid ${props => props.$isScored ? '#f59e0b' : '#9ca3af'};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  
  @media (max-width: 640px) {
    flex-direction: column;
  }
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: 3rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
  color: #ef4444;
`;

const QuestionsSection = styled.div`
  margin-top: 2rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #1f2937;
  padding: 1rem;
  background: white;
  border-radius: 12px 12px 0 0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
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

const ExamDetailPage: React.FC = () => {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const { examResults, loadExamResults } = useQuizStore();
  const [examResult, setExamResult] = useState<ExamResult | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [showTopButton, setShowTopButton] = useState(false);

  useEffect(() => {
    loadExamResults();
  }, [loadExamResults]);

  useEffect(() => {
    if (examId && examResults.length > 0) {
      const result = examResults.find(r => r.id === examId);
      if (result) {
        setExamResult(result);
        
        // 해당 시험의 문제들 로드
        const examType = getExamTypeById(result.examTypeId);
        if (examType) {
          // 시험에서 출제된 문제들만 필터링하고 순서 유지
          const examQuestions = result.questionNumbers
            .map(num => examType.questions.find(q => q.number === num))
            .filter((q): q is Question => q !== undefined);
          setQuestions(examQuestions);
        }
      }
    }
  }, [examId, examResults]);

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

  if (!examResult) {
    return (
      <Container>
        <ErrorMessage>
          <h2>시험 결과를 찾을 수 없습니다</h2>
          <p>요청하신 시험 결과가 존재하지 않거나 삭제되었습니다.</p>
          <Button onClick={() => navigate('/history')} style={{ marginTop: '1rem' }}>
            시험 기록으로 돌아가기
          </Button>
        </ErrorMessage>
      </Container>
    );
  }

  // 정답 계산
  const correctAnswers = questions.filter(q => {
    const userAnswer = examResult.answers[q.number];
    const correctAnswer = q.answer;

    if (!correctAnswer) return true;

    if (q.isMultipleChoice) {
      if (!userAnswer || !Array.isArray(userAnswer)) return false;
      const sortedUserAnswer = [...userAnswer].sort().join('');
      const sortedCorrectAnswer = [...correctAnswer].sort().join('');
      return sortedUserAnswer === sortedCorrectAnswer;
    }

    return userAnswer === correctAnswer;
  });

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}시간 ${mins}분` : `${mins}분`;
  };

  const formatDateTime = (date: Date): string => {
    return new Date(date).toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const scorePercentage = (examResult.score / 1000) * 100;
  // 동적 커트라인 적용
  const examType = getExamTypeById(examResult.examTypeId);
  const passingScore = examType?.passingScore || 700;
  const isPassing = examResult.score >= passingScore;
  
  const correctCount = correctAnswers.length;
  const wrongCount = questions.length - correctCount;
  const correctPercentage = Math.round((correctCount / questions.length) * 100);
  const wrongPercentage = 100 - correctPercentage;

  // 오답 문제들
  const wrongAnswers = questions
    .map((q, index) => ({ 
      ...q, 
      examOrder: index + 1,
      isCorrect: correctAnswers.includes(q)
    }))
    .filter(q => !q.isCorrect)
    .sort((a, b) => a.examOrder - b.examOrder);

  return (
    <Container>
      <Header>
        <Title>시험 결과 상세보기</Title>
        
        <ExamInfo>
          <InfoItem>
            <h4>시험 ID</h4>
            <p title={`URL 파라미터: ${examId}`}>
              {examResult.id}
              {examId !== examResult.id && (
                <span style={{ color: '#ef4444', fontSize: '0.875rem', display: 'block' }}>
                  ⚠️ URL ID와 불일치: {examId}
                </span>
              )}
            </p>
          </InfoItem>
          <InfoItem>
            <h4>시험 종류</h4>
            <p>{examResult.examTypeName}</p>
          </InfoItem>
          <InfoItem>
            <h4>시험 모드</h4>
            <p>
              {examResult.examMode === 'practice' && '실전 모드'}
              {examResult.examMode === 'random' && '랜덤 모드'}
              {examResult.examMode === 'range' && '범위 모드'}
            </p>
          </InfoItem>
          <InfoItem>
            <h4>시작 시간</h4>
            <p>{formatDateTime(examResult.startTime)}</p>
          </InfoItem>
          <InfoItem>
            <h4>완료 시간</h4>
            <p>{formatDateTime(examResult.endTime)}</p>
          </InfoItem>
          <InfoItem>
            <h4>소요 시간</h4>
            <p>{formatDuration(examResult.duration)}</p>
          </InfoItem>
        </ExamInfo>

        <ButtonGroup>
          <Button onClick={() => navigate('/history')}>
            시험 기록으로 돌아가기
          </Button>
          <Button onClick={() => navigate('/')} variant="secondary">
            새 시험 시작하기
          </Button>
        </ButtonGroup>
      </Header>

      <ScoreContainer>
        <h2>시험 점수</h2>
        <ScoreBar $score={scorePercentage} $isPassing={isPassing}>
        </ScoreBar>
        <ScoreInfo>
          <div>
            <strong>최종 점수</strong>
            <ScoreValue $isPassing={isPassing}>
              {examResult.score} / 1000점 ({scorePercentage.toFixed(1)}%)
            </ScoreValue>
          </div>
          <div>
            <strong>합격 여부</strong>
            <ScoreValue $isPassing={isPassing}>
              {isPassing ? '합격 🎉' : '불합격'}
            </ScoreValue>
          </div>
          <div>
            <strong>정답률</strong>
            <ScoreValue>
              {examResult.correctAnswers} / {examResult.totalQuestions} ({Math.round((examResult.correctAnswers / examResult.totalQuestions) * 100)}%)
            </ScoreValue>
          </div>
          <div>
            <strong>합격 기준</strong>
            <ScoreValue>
              {passingScore}점 이상
            </ScoreValue>
          </div>
        </ScoreInfo>
      </ScoreContainer>

      <StatsContainer>
        <StatsTitle>문제별 통계</StatsTitle>
        <StatsGrid>
          <StatsItem>
            <h3>정답</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981', margin: 0 }}>
              {correctCount}
            </p>
            <p style={{ color: '#6b7280', margin: 0 }}>
              {correctPercentage}%
            </p>
          </StatsItem>
          <StatsItem>
            <h3>오답</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ef4444', margin: 0 }}>
              {wrongCount}
            </p>
            <p style={{ color: '#6b7280', margin: 0 }}>
              {wrongPercentage}%
            </p>
          </StatsItem>
          {examResult.isPracticeMode && examResult.scoredQuestions && (
            <>
              <StatsItem $isScored>
                <h3>채점 대상 정답</h3>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b', margin: 0 }}>
                  {questions.filter(q => 
                    examResult.scoredQuestions!.includes(q.number) && 
                    correctAnswers.includes(q)
                  ).length}
                </p>
                <p style={{ color: '#6b7280', margin: 0 }}>
                  / {examResult.scoredQuestions.length}문제
                </p>
              </StatsItem>
              <StatsItem>
                <h3>연습 문제</h3>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#6b7280', margin: 0 }}>
                  {examResult.totalQuestions - examResult.scoredQuestions.length}
                </p>
                <p style={{ color: '#6b7280', margin: 0 }}>
                  점수 미반영
                </p>
              </StatsItem>
            </>
          )}
        </StatsGrid>
      </StatsContainer>

      {wrongAnswers.length > 0 && (
        <QuestionsSection>
          <SectionTitle>오답 문제 ({wrongAnswers.length}문제)</SectionTitle>
          {wrongAnswers.map((question, index) => (
            <QuestionCard
              key={`wrong-${question.number}`}
              question={question}
              questionNumber={`오답 ${index + 1}번 (시험 ${question.examOrder}번)`}
              userAnswer={examResult.answers[question.number]}
              showAnswer={true}
              onAnswerChange={() => {}}
              isReviewMode={true}
              examMode={examResult.examMode}
              scoredQuestions={examResult.scoredQuestions}
            />
          ))}
        </QuestionsSection>
      )}

      <TopButton 
        className={showTopButton ? 'visible' : ''}
        onClick={scrollToTop}
      >
        ↑
      </TopButton>
    </Container>
  );
};

export default ExamDetailPage;
