import { aipKeywords } from './aip-c01';

/** 보기 글자 → 키워드 목록 */
export type AnswerKeywords = Record<string, string[]>;

// 시험 종류별 키워드 데이터. 키워드가 없는 시험은 키워드 모드를 표시하지 않는다.
const keywordsByExam: Record<string, Record<number, AnswerKeywords>> = {
    'aip-c01': aipKeywords,
};

export const getAnswerKeywords = (examTypeId: string | undefined, questionNumber: number): AnswerKeywords | undefined =>
    examTypeId ? keywordsByExam[examTypeId]?.[questionNumber] : undefined;
