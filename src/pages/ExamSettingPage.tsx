import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useQuizStore } from '../store/quizStore';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  margin-bottom: 2rem;
  text-align: center;
`;

const SettingCard = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
  padding: 2rem;
  margin-bottom: 2rem;
`;

const SettingTitle = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  color: #1f2937;
`;

const OptionGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #4b5563;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 1rem;
  margin-bottom: 1rem;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
  }
`;

const RangeInputs = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const Button = styled.button`
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
  width: 100%;
  
  &:hover {
    background: #2563eb;
  }

  &:disabled {
    background: #93c5fd;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.p`
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 0.5rem;
`;

const WarningText = styled.p`
  color: #ef4444;
  font-size: 0.9rem;
  margin-top: 0.5rem;
  line-height: 1.5;
`;

const ExamSettingPage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    questions, 
    setExamMode, 
    load, 
    selectedExamType, 
    setSelectedExamType, 
    examTypes,
    startExam,
    loadExamProgress,
    currentExamProgress,
    clearCurrentExamProgress
  } = useQuizStore();
  const [mode, setMode] = useState<'random' | 'range' | 'practice'>('random');
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [startNumber, setStartNumber] = useState<number>(1);
  const [endNumber, setEndNumber] = useState<number>(questions.length);
  const [isRandom, setIsRandom] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // 진행 중인 시험이 있는지 확인만 하고 자동 이동하지 않음
    loadExamProgress();
    load();
  }, [load, selectedExamType, loadExamProgress]);

  useEffect(() => {
    if (questions.length > 0) {
      setEndNumber(questions.length);
    }
  }, [questions.length]);

  const handleExamTypeChange = (examTypeId: string) => {
    setSelectedExamType(examTypeId);
  };

  const handleContinueExam = () => {
    navigate('/quiz');
  };

  const handleStartNewExam = () => {
    clearCurrentExamProgress();
    // 페이지 리로드하여 초기 상태로 복원
    window.location.reload();
  };

  const validateSettings = () => {
    if (mode === 'random') {
      if (questionCount < 1 || questionCount > questions.length) {
        setError(`문제 수는 1에서 ${questions.length} 사이여야 합니다.`);
        return false;
      }
    } else {
      if (startNumber < 1 || startNumber > questions.length) {
        setError(`시작 번호는 1에서 ${questions.length} 사이여야 합니다.`);
        return false;
      }
      if (endNumber < 1 || endNumber > questions.length) {
        setError(`종료 번호는 1에서 ${questions.length} 사이여야 합니다.`);
        return false;
      }
      if (startNumber > endNumber) {
        setError('시작 번호는 종료 번호보다 작아야 합니다.');
        return false;
      }
    }
    setError('');
    return true;
  };

  const handleStart = () => {
    if (!validateSettings()) return;

    setExamMode({
      mode,
      questionCount: mode === 'random' ? questionCount : endNumber - startNumber + 1,
      startNumber: mode === 'random' ? 1 : startNumber,
      endNumber: mode === 'random' ? questions.length : endNumber,
      isRandom: mode === 'range' ? isRandom : undefined
    });

    startExam();
    navigate('/quiz');
  };

  const selectedExam = examTypes.find(exam => exam.id === selectedExamType);

  return (
    <Container>
      <Title>AWS 자격증 시험 모드 설정</Title>
      
      {currentExamProgress && (
        <SettingCard style={{ background: '#fef3c7', border: '1px solid #f59e0b' }}>
          <SettingTitle style={{ color: '#d97706' }}>📋 진행 중인 시험이 있습니다</SettingTitle>
          <OptionGroup>
            <p style={{ color: '#4b5563', marginBottom: '1rem' }}>
              <strong>{currentExamProgress.examTypeName}</strong> 시험이 진행 중입니다.
              <br />
              진행률: {currentExamProgress.currentQuestion + 1} / {currentExamProgress.totalQuestions}
              <br />
              시작 시간: {currentExamProgress.startTime.toLocaleString()}
            </p>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <Button onClick={handleContinueExam} style={{ background: '#059669' }}>
                📖 시험 계속하기
              </Button>
              <Button 
                onClick={handleStartNewExam}
                style={{ background: '#ef4444' }}
              >
                🗑️ 진행 상태 삭제
              </Button>
            </div>
            <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              아래에서 새로운 시험을 설정할 수도 있습니다.
            </p>
          </OptionGroup>
        </SettingCard>
      )}
      
      <SettingCard>
        <SettingTitle>시험 과목 선택</SettingTitle>
        <OptionGroup>
          <Label>시험 종류</Label>
          <Input
            as="select"
            value={selectedExamType}
            onChange={(e) => handleExamTypeChange(e.target.value)}
          >
            {examTypes.map(exam => (
              <option key={exam.id} value={exam.id}>
                {exam.name} - {exam.description}
              </option>
            ))}
          </Input>
          {selectedExam && (
            <p style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '0.5rem' }}>
              총 {selectedExam.questions.length}문제
            </p>
          )}
        </OptionGroup>
      </SettingCard>
      
      <SettingCard>
        <SettingTitle>문제 선택 방식</SettingTitle>
        <OptionGroup>
          <Label>
            <input
              type="radio"
              checked={mode === 'random'}
              onChange={() => setMode('random')}
              style={{ marginRight: '0.5rem' }}
            />
            랜덤 문제 선택
          </Label>
          <Label>
            <input
              type="radio"
              checked={mode === 'range'}
              onChange={() => setMode('range')}
              style={{ marginRight: '0.5rem' }}
            />
            범위 지정
          </Label>
          <Label>
            <input
              type="radio"
              checked={mode === 'practice'}
              onChange={() => setMode('practice')}
              style={{ marginRight: '0.5rem' }}
            />
            실전 모드
          </Label>
          {mode === 'practice' && (
            <WarningText>
              ※ 시험 문제는 전체 중 총 65문제가 출제되며 그 중 50문제만 점수에 반영됩니다.
            </WarningText>
          )}
        </OptionGroup>

        {mode === 'random' ? (
          <OptionGroup>
            <Label>문제 수</Label>
            <Input
              type="number"
              min="1"
              max={questions.length}
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
              placeholder={`1-${questions.length} 사이의 숫자를 입력하세요`}
            />
          </OptionGroup>
        ) : mode === 'range' ? (
          <>
            <OptionGroup>
              <Label>문제 범위 (전체 {questions.length}문제 중)</Label>
              <RangeInputs>
                <Input
                  type="number"
                  min="1"
                  max={questions.length}
                  value={startNumber}
                  onChange={(e) => setStartNumber(Number(e.target.value))}
                  placeholder={`1-${questions.length} 사이의 숫자`}
                />
                <span>~</span>
                <Input
                  type="number"
                  min="1"
                  max={questions.length}
                  value={endNumber}
                  onChange={(e) => setEndNumber(Number(e.target.value))}
                  placeholder={`1-${questions.length} 사이의 숫자`}
                />
              </RangeInputs>
            </OptionGroup>
            <OptionGroup>
              <Label>문제 순서</Label>
              <Label>
                <input
                  type="radio"
                  checked={isRandom}
                  onChange={() => setIsRandom(true)}
                  style={{ marginRight: '0.5rem' }}
                />
                랜덤 순서
              </Label>
              <Label>
                <input
                  type="radio"
                  checked={!isRandom}
                  onChange={() => setIsRandom(false)}
                  style={{ marginRight: '0.5rem' }}
                />
                순서대로
              </Label>
            </OptionGroup>
          </>
        ) : (
          <OptionGroup>
            <Label>실전 모드 안내</Label>
            <WarningText>
              • 전체 문제 중 랜덤하게 65문제가 출제됩니다.<br />
              • 65문제 중 50문제만 점수에 반영됩니다.<br />
              • 각 문제당 20점씩 배점됩니다. (총 1000점 만점)
            </WarningText>
          </OptionGroup>
        )}

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <Button onClick={handleStart}>
          시험 시작하기
        </Button>
      </SettingCard>
    </Container>
  );
};

export default ExamSettingPage; 