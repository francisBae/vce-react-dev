export interface Question {
    number: number;
    text: string;
    options: string[];
    answer: string; // 단일 정답 (예: "A") 또는 복수 정답 (예: "AD")
    link: string;
    images?: {
        question?: string[]; // 문제 텍스트 내 이미지 URL 배열
        answer?: string[]; // 정답 영역 이미지 URL 배열
    };
    isMultipleChoice?: boolean; // 복수 정답 여부 (answer 길이가 1보다 크면 true)
    explanation?: string; // 해설 (문단은 '\n\n'으로 구분). 없으면 해설 UI를 표시하지 않음
}

export interface ExamType {
    id: string;
    name: string;
    description: string;
    questions: Question[];
    level: 'practitioner' | 'associate' | 'professional' | 'specialty';
    passingScore: number;
    dumpFileName?: string;
}

export interface ExamResult {
    id: string;
    examTypeId: string;
    examTypeName: string;
    startTime: Date;
    endTime: Date;
    duration: number; // 시간 (분 단위)
    totalQuestions: number;
    correctAnswers: number;
    score: number; // 점수 (0-1000)
    examMode: string; // 'random' | 'range' | 'practice'
    answers: Record<number, string | string[]>;
    questionNumbers: number[]; // 출제된 문제 번호들
    isPracticeMode?: boolean;
    scoredQuestions?: number[]; // 실전 모드에서 점수에 반영되는 문제들
}

export interface ExamProgress {
    id: string;
    examTypeId: string;
    examTypeName: string;
    startTime: Date;
    currentQuestion: number;
    totalQuestions: number;
    answers: Record<number, string | string[]>;
    examMode: string;
    questionNumbers: number[];
    isPracticeMode?: boolean;
    scoredQuestions?: number[];
}
