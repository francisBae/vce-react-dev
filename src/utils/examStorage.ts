import type { ExamResult, ExamProgress } from '../types/question';

const EXAM_RESULTS_KEY = 'exam-results';
const EXAM_PROGRESS_KEY = 'exam-progress-v2';

// 시험 결과 저장
export const saveExamResult = (result: ExamResult): void => {
  try {
    const existingResults = getExamResults();
    
    // 중복 ID 체크 - 기존 결과가 있으면 업데이트, 없으면 추가
    const existingIndex = existingResults.findIndex(r => r.id === result.id);
    const resultToSave = {
      ...result,
      startTime: new Date(result.startTime),
      endTime: new Date(result.endTime)
    };
    
    if (existingIndex >= 0) {
      console.log(`Updating existing exam result with ID: ${result.id}`);
      existingResults[existingIndex] = resultToSave;
    } else {
      console.log(`Adding new exam result with ID: ${result.id}`);
      existingResults.push(resultToSave);
    }
    
    localStorage.setItem(EXAM_RESULTS_KEY, JSON.stringify(existingResults));
  } catch (error) {
    console.error('Failed to save exam result:', error);
  }
};

// 시험 결과 불러오기
export const getExamResults = (): ExamResult[] => {
  try {
    const stored = localStorage.getItem(EXAM_RESULTS_KEY);
    if (!stored) return [];
    
    const results = JSON.parse(stored);
    return results.map((result: any) => ({
      ...result,
      startTime: new Date(result.startTime),
      endTime: new Date(result.endTime)
    }));
  } catch (error) {
    console.error('Failed to load exam results:', error);
    return [];
  }
};

// 시험 진행 상태 저장
export const saveExamProgress = (progress: ExamProgress): void => {
  try {
    const progressToSave = {
      ...progress,
      startTime: new Date(progress.startTime)
    };
    localStorage.setItem(EXAM_PROGRESS_KEY, JSON.stringify(progressToSave));
  } catch (error) {
    console.error('Failed to save exam progress:', error);
  }
};

// 시험 진행 상태 불러오기
export const getExamProgress = (): ExamProgress | null => {
  try {
    const stored = localStorage.getItem(EXAM_PROGRESS_KEY);
    if (!stored) return null;
    
    const progress = JSON.parse(stored);
    return {
      ...progress,
      startTime: new Date(progress.startTime)
    };
  } catch (error) {
    console.error('Failed to load exam progress:', error);
    return null;
  }
};

// 시험 진행 상태 삭제
export const clearExamProgress = (): void => {
  try {
    localStorage.removeItem(EXAM_PROGRESS_KEY);
  } catch (error) {
    console.error('Failed to clear exam progress:', error);
  }
};

// 특정 시험 종류의 결과만 가져오기
export const getExamResultsByType = (examTypeId: string): ExamResult[] => {
  return getExamResults().filter(result => result.examTypeId === examTypeId);
};

// 시험 결과 삭제
export const deleteExamResult = (resultId: string): void => {
  try {
    const results = getExamResults().filter(result => result.id !== resultId);
    localStorage.setItem(EXAM_RESULTS_KEY, JSON.stringify(results));
  } catch (error) {
    console.error('Failed to delete exam result:', error);
  }
};

// 모든 시험 결과 삭제
export const clearAllExamResults = (): void => {
  try {
    localStorage.removeItem(EXAM_RESULTS_KEY);
  } catch (error) {
    console.error('Failed to clear all exam results:', error);
  }
};

// 특정 시험 타입의 모든 결과 삭제
export const deleteExamResultsByType = (examTypeId: string): void => {
  try {
    const results = getExamResults().filter(result => result.examTypeId !== examTypeId);
    localStorage.setItem(EXAM_RESULTS_KEY, JSON.stringify(results));
  } catch (error) {
    console.error('Failed to delete exam results by type:', error);
  }
};
