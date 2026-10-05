import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useQuizStore } from '../store/quizStore';
import type { ExamResult } from '../types/question';
import { getExamTypeById } from '../data/examTypes';

const Container = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  margin-bottom: 2rem;
  text-align: center;
`;

const FilterSection = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
  padding: 1.5rem;
  margin-bottom: 2rem;
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
`;

const Select = styled.select`
  padding: 0.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 1rem;
  min-width: 200px;
`;

const DeleteAllButton = styled.button`
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background 0.2s;
  font-weight: 500;
  
  &:hover {
    background: #dc2626;
  }

  &:disabled {
    background: #fca5a5;
    cursor: not-allowed;
  }
`;

const ResultCard = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
  padding: 1.5rem;
  margin-bottom: 1rem;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 1rem;
  align-items: center;
  position: relative;
`;

const ExamIdLabel = styled.div`
  position: absolute;
  top: -8px;
  left: 12px;
  background: #3b82f6;
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  z-index: 1;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
`;

const ResultInfo = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
`;

const InfoItem = styled.div`
  h4 {
    font-size: 0.875rem;
    color: #6b7280;
    margin: 0 0 0.25rem 0;
  }
  p {
    font-size: 1rem;
    font-weight: 500;
    color: #1f2937;
    margin: 0;
  }
`;

const ScoreDisplay = styled.div<{ score: number }>`
  font-size: 2rem;
  font-weight: bold;
  color: ${props => 
    props.score >= 700 ? '#10b981' : 
    props.score >= 500 ? '#f59e0b' : '#ef4444'
  };
  text-align: center;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-direction: column;
`;

const Button = styled.button<{ variant?: 'danger' }>`
  background: ${props => props.variant === 'danger' ? '#ef4444' : '#3b82f6'};
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover {
    background: ${props => props.variant === 'danger' ? '#dc2626' : '#2563eb'};
  }
`;

const EmptyState = styled.div`
  text-align: center;
  color: #6b7280;
  padding: 3rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
`;

const ExamHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    examResults, 
    loadExamResults, 
    deleteExamResult, 
    examTypes,
    clearAllExamResults,
    deleteExamResultsByType 
  } = useQuizStore();
  const [selectedExamType, setSelectedExamType] = useState<string>('all');

  useEffect(() => {
    loadExamResults();
  }, [loadExamResults]);

  const filteredResults = selectedExamType === 'all' 
    ? examResults 
    : examResults.filter(result => result.examTypeId === selectedExamType);

  const sortedResults = [...filteredResults].sort((a, b) => 
    new Date(b.endTime).getTime() - new Date(a.endTime).getTime()
  );

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}시간 ${mins}분` : `${mins}분`;
  };

  const getPassStatus = (result: ExamResult): string => {
    const examType = getExamTypeById(result.examTypeId);
    const passingScore = examType?.passingScore || 700;
    
    if (result.score >= passingScore) return '합격';
    if (result.score >= passingScore * 0.7) return '아슬아슬'; // 70% 기준
    return '불합격';
  };

  const handleViewResult = (result: ExamResult) => {
    navigate(`/exam/${result.id}`);
  };

  const handleDeleteResult = (resultId: string) => {
    if (confirm('이 시험 결과를 삭제하시겠습니까?')) {
      deleteExamResult(resultId);
    }
  };

  const formatExamId = (id: string): string => {
    // 시험 ID를 축약해서 표시 (예: "aif-c01-1234567890" -> "AIF-C01-1234")
    const parts = id.split('-');
    if (parts.length >= 3) {
      const examType = parts.slice(0, 2).join('-').toUpperCase();
      const timestamp = parts[2].slice(-4); // 마지막 4자리만 사용
      return `${examType}-${timestamp}`;
    }
    return id.slice(0, 12).toUpperCase(); // 최대 12자까지만 표시
  };

  const handleDeleteAllResults = () => {
    if (selectedExamType === 'all') {
      if (confirm(`모든 시험 기록을 삭제하시겠습니까?\n총 ${examResults.length}개의 기록이 삭제됩니다.\n\n이 작업은 되돌릴 수 없습니다.`)) {
        clearAllExamResults();
      }
    } else {
      const selectedExam = examTypes.find(exam => exam.id === selectedExamType);
      const targetResults = examResults.filter(result => result.examTypeId === selectedExamType);
      
      if (confirm(`${selectedExam?.name} 시험의 모든 기록을 삭제하시겠습니까?\n총 ${targetResults.length}개의 기록이 삭제됩니다.\n\n이 작업은 되돌릴 수 없습니다.`)) {
        deleteExamResultsByType(selectedExamType);
      }
    }
  };

  return (
    <Container>
      <Title>시험 기록</Title>
      
      <FilterSection>
        <label>시험 종류:</label>
        <Select 
          value={selectedExamType} 
          onChange={(e) => setSelectedExamType(e.target.value)}
        >
          <option value="all">전체</option>
          {examTypes.map(examType => (
            <option key={examType.id} value={examType.id}>
              {examType.name} - {examType.description}
            </option>
          ))}
        </Select>
        <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>
          총 {filteredResults.length}개의 기록
        </span>
        <DeleteAllButton 
          onClick={handleDeleteAllResults}
          disabled={filteredResults.length === 0}
          title={
            selectedExamType === 'all' 
              ? '모든 시험 기록을 삭제합니다' 
              : `${examTypes.find(e => e.id === selectedExamType)?.name} 시험의 모든 기록을 삭제합니다`
          }
        >
          🗑️ {selectedExamType === 'all' ? '전체 기록 삭제' : '선택된 시험 기록 삭제'}
        </DeleteAllButton>
      </FilterSection>

      {sortedResults.length === 0 ? (
        <EmptyState>
          <h3>시험 기록이 없습니다</h3>
          <p>첫 번째 시험을 시작해보세요!</p>
        </EmptyState>
      ) : (
        sortedResults.map(result => (
          <ResultCard key={result.id}>
            <ExamIdLabel title={result.id}>
              {formatExamId(result.id)}
            </ExamIdLabel>
            <ResultInfo>
              <InfoItem>
                <h4>시험 종류</h4>
                <p>{result.examTypeName}</p>
              </InfoItem>
              <InfoItem>
                <h4>시험 모드</h4>
                <p>
                  {result.examMode === 'practice' && '실전 모드'}
                  {result.examMode === 'random' && '랜덤 모드'}
                  {result.examMode === 'range' && '범위 모드'}
                </p>
              </InfoItem>
              <InfoItem>
                <h4>정답률</h4>
                <p>{result.correctAnswers} / {result.totalQuestions} ({Math.round((result.correctAnswers / result.totalQuestions) * 100)}%)</p>
              </InfoItem>
              <InfoItem>
                <h4>소요 시간</h4>
                <p>{formatDuration(result.duration)}</p>
              </InfoItem>
              <InfoItem>
                <h4>완료 시간</h4>
                <p>{new Date(result.endTime).toLocaleString()}</p>
              </InfoItem>
              <InfoItem>
                <h4>결과</h4>
                <p style={{ 
                  color: (() => {
                    const examType = getExamTypeById(result.examTypeId);
                    const passingScore = examType?.passingScore || 700;
                    return result.score >= passingScore ? '#10b981' : 
                           result.score >= passingScore * 0.7 ? '#f59e0b' : '#ef4444';
                  })(),
                  fontWeight: 'bold'
                }}>
                  {getPassStatus(result)}
                </p>
              </InfoItem>
            </ResultInfo>
            
            <div style={{ textAlign: 'center' }}>
              <ScoreDisplay score={result.score}>
                {result.score}
              </ScoreDisplay>
              <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
                / 1000점
              </div>
              <ActionButtons>
                <Button onClick={() => handleViewResult(result)}>
                  상세 보기
                </Button>
                <Button 
                  variant="danger"
                  onClick={() => handleDeleteResult(result.id)}
                >
                  삭제
                </Button>
              </ActionButtons>
            </div>
          </ResultCard>
        ))
      )}
    </Container>
  );
};

export default ExamHistoryPage;
