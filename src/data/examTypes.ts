import type { ExamType } from '../types/question';
import { questions as aifQuestions } from './questions/q-aif-c01';
import { questions as ansQuestions } from './questions/q-ans-c01';
import { questions as aipQuestions } from './questions/q-aip-c01';

export const examTypes: ExamType[] = [
    {
        id: 'aif-c01',
        name: 'AIF-C01',
        description: 'AWS Certified AI Practitioner',
        questions: aifQuestions,
        level: 'practitioner',
        passingScore: 700,
        dumpFileName: 'aif-c01.txt',
    },
    {
        id: 'ans-c01',
        name: 'ANS-C01',
        description: 'AWS Certified Advanced Networking - Specialty',
        questions: ansQuestions,
        level: 'specialty',
        passingScore: 750,
        dumpFileName: 'ans-c01.txt',
    },
    {
        id: 'aip-c01',
        name: 'AIP-C01',
        description: 'AWS Certified Generative AI Developer - Professional',
        questions: aipQuestions,
        level: 'professional',
        passingScore: 750,
        dumpFileName: 'aip-c01.txt',
    },
];

export const getExamTypeById = (id: string): ExamType | undefined => {
    return examTypes.find((exam) => exam.id === id);
};
