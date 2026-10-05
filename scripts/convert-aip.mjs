/**
 * AIP-C01 원문 덤프(PDF 복사본)를 프로젝트 양식으로 변환한다.
 *
 * 입력:  public/aip-c01-raw.txt
 * 출력:  src/data/questions/q-aip-c01.ts  (문제 데이터)
 *        public/aip-c01.txt               (다운로드용 덤프, 기존 양식 + 해설)
 *
 * 실행:  node scripts/convert-aip.mjs [입력경로]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const inputPath = path.resolve(root, process.argv[2] ?? 'public/aip-c01-raw.txt');
const tsOutPath = path.join(root, 'src/data/questions/q-aip-c01.ts');
const dumpOutPath = path.join(root, 'public/aip-c01.txt');

// 해설 문단 구분 기준: 마침표 등으로 끝나는 줄이 이 길이보다 짧으면 문단 끝으로 본다.
// (원문 줄바꿈 폭은 약 92~104자)
const PARAGRAPH_LINE_MAX = 85;

const FOOTER_RE = /^IT Certification Guaranteed, The Easy Way!\s*$/;
const PAGE_NUM_RE = /^\d+\s*$/;
const QUESTION_RE = /^NO\.(\d+)\s+(.*)$/;
const OPTION_RE = /^([A-Z])\.\s+(.*)$/;
const ANSWER_RE = /^Answer:\s*(.*)$/;
const EXPLANATION_RE = /^Explanation:\s*(.*)$/;

/** 푸터와 바로 뒤 페이지 번호 줄을 제거한다. */
function stripNoise(lines) {
    const out = [];
    for (let i = 0; i < lines.length; i++) {
        if (FOOTER_RE.test(lines[i])) {
            if (i + 1 < lines.length && PAGE_NUM_RE.test(lines[i + 1])) i++;
            continue;
        }
        out.push(lines[i]);
    }
    return out;
}

/** PDF 줄바꿈으로 끊긴 줄들을 한 문장으로 잇는다. */
function joinLines(lines) {
    let s = '';
    for (const raw of lines) {
        const line = raw.trim();
        if (!line) continue;
        if (!s) s = line;
        else if (/[A-Za-z0-9]-$/.test(s))
            s += line; // "3-" + "retry" → "3-retry"
        else s += ' ' + line;
    }
    return cleanup(s);
}

function cleanup(s) {
    return s
        .replace(/\s+([.,;:?!])(?=\s|$)/g, '$1') // "datasets . Configure" → "datasets. Configure"
        .replace(/([A-Za-z0-9])- (?=[a-z0-9])/g, '$1-') // "eu- central-1" → "eu-central-1"
        .replace(/(\w) ' (?=s\b)/g, "$1'") // "company ' s" → "company's"
        .replace(/\s{2,}/g, ' ')
        .trim();
}

/** 해설은 문단 단위로 묶어 '\n\n'으로 연결한다. */
function joinParagraphs(lines) {
    const paragraphs = [];
    let buf = [];
    for (const raw of lines) {
        const line = raw.trim();
        if (!line) continue;
        buf.push(line);
        if (/[.!?:]["')]?$/.test(line) && line.length < PARAGRAPH_LINE_MAX) {
            paragraphs.push(joinLines(buf));
            buf = [];
        }
    }
    if (buf.length) paragraphs.push(joinLines(buf));
    return paragraphs.filter(Boolean).join('\n\n');
}

function parse(text) {
    const lines = stripNoise(text.replace(/\r\n?/g, '\n').split('\n'));
    const questions = [];
    let q = null;
    let section = null; // 'text' | 'option' | 'explanation'

    const finish = () => {
        if (!q) return;
        const answer = q.answerRaw.replace(/[^A-Z]/g, '');
        questions.push({
            number: q.number,
            text: joinLines(q.textLines),
            options: q.optionLines.map(joinLines),
            answer,
            link: '',
            isMultipleChoice: answer.length > 1,
            explanation: q.explanationLines.length ? joinParagraphs(q.explanationLines) : undefined,
        });
    };

    for (const line of lines) {
        const mq = line.match(QUESTION_RE);
        if (mq) {
            finish();
            q = { number: Number(mq[1]), textLines: [mq[2]], optionLines: [], answerRaw: '', explanationLines: [] };
            section = 'text';
            continue;
        }
        if (!q) continue; // "AIP C01" 같은 머리글

        const ma = line.match(ANSWER_RE);
        if (ma && section !== 'explanation') {
            q.answerRaw = ma[1];
            section = 'answer';
            continue;
        }
        const me = line.match(EXPLANATION_RE);
        if (me && section === 'answer') {
            if (me[1]) q.explanationLines.push(me[1]);
            section = 'explanation';
            continue;
        }

        if (section === 'text' || section === 'option') {
            const mo = line.match(OPTION_RE);
            // 보기 글자가 순서대로(A, B, C...) 나올 때만 새 보기로 인정
            if (mo && mo[1] === String.fromCharCode(65 + q.optionLines.length)) {
                q.optionLines.push([mo[2]]);
                section = 'option';
                continue;
            }
            if (section === 'text') q.textLines.push(line);
            else q.optionLines[q.optionLines.length - 1].push(line);
        } else if (section === 'explanation') {
            q.explanationLines.push(line);
        }
    }
    finish();
    return questions;
}

const quote = (s) => "'" + s.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n') + "'";

function toTs(questions) {
    const body = questions
        .map((q) => {
            const lines = [
                `        number: ${q.number},`,
                `        text: ${quote(q.text)},`,
                `        options: [`,
                ...q.options.map((o) => `            ${quote(o)},`),
                `        ],`,
                `        answer: ${quote(q.answer)},`,
                `        link: ${quote(q.link)},`,
                `        isMultipleChoice: ${q.isMultipleChoice},`,
            ];
            if (q.explanation) lines.push(`        explanation: ${quote(q.explanation)},`);
            return `    {\n${lines.join('\n')}\n    },`;
        })
        .join('\n');
    return `// 이 파일은 scripts/convert-aip.mjs 로 생성됩니다. 직접 수정하지 마세요.\nimport type { Question } from '../../types/question';\n\nexport const questions: Question[] = [\n${body}\n];\n`;
}

function toDump(questions) {
    const sep = '------------------------------------------------------------';
    return (
        questions
            .map((q) => {
                const parts = [
                    `${q.number}.`,
                    q.text,
                    q.options.map((o, i) => `${String.fromCharCode(65 + i)}.${o}`).join('\n'),
                    `정답: ${q.answer}`,
                ];
                if (q.explanation) parts.push(`해설:\n${q.explanation}`);
                return parts.join('\n\n') + `\n\n${sep}\n`;
            })
            .join('\n') + '\n'
    );
}

const questions = parse(fs.readFileSync(inputPath, 'utf8'));

// 간단한 검증: 보기가 없거나 정답 글자가 보기 범위를 벗어나는 문제를 경고
for (const q of questions) {
    const maxLetter = String.fromCharCode(64 + q.options.length);
    if (q.options.length < 2) console.warn(`[경고] NO.${q.number}: 보기 ${q.options.length}개`);
    if (!q.answer) console.warn(`[경고] NO.${q.number}: 정답 없음`);
    if ([...q.answer].some((c) => c > maxLetter))
        console.warn(`[경고] NO.${q.number}: 정답 ${q.answer}가 보기 범위 밖`);
    if (!q.explanation) console.warn(`[참고] NO.${q.number}: 해설 없음`);
}

fs.writeFileSync(tsOutPath, toTs(questions));
fs.writeFileSync(dumpOutPath, toDump(questions));
console.log(
    `변환 완료: ${questions.length}문제 → ${path.relative(root, tsOutPath)}, ${path.relative(root, dumpOutPath)}`,
);
