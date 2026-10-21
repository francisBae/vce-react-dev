export interface TextSegment {
    text: string;
    highlighted: boolean;
}

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * 텍스트를 키워드 일치 구간 / 일반 구간으로 나눈다.
 * - 대소문자 구분 없음
 * - 키워드가 영숫자로 시작하면 단어 중간에서 시작하는 일치는 제외 (예: "CRI"가 "describe"에 걸리지 않도록)
 * - 긴 키워드를 먼저 매칭해 겹치는 키워드가 있어도 긴 쪽이 우선
 */
export const splitByKeywords = (text: string, keywords: string[]): TextSegment[] => {
    const terms = keywords.map((k) => k.trim()).filter(Boolean);
    if (!text || terms.length === 0) return [{ text, highlighted: false }];

    const pattern = [...terms]
        .sort((a, b) => b.length - a.length)
        .map((k) => (/^[A-Za-z0-9]/.test(k) ? `(?<![A-Za-z0-9])${escapeRegExp(k)}` : escapeRegExp(k)))
        .join('|');
    const re = new RegExp(pattern, 'gi');

    const segments: TextSegment[] = [];
    let last = 0;
    for (const m of text.matchAll(re)) {
        const start = m.index ?? 0;
        if (start > last) segments.push({ text: text.slice(last, start), highlighted: false });
        segments.push({ text: m[0], highlighted: true });
        last = start + m[0].length;
    }
    if (last < text.length) segments.push({ text: text.slice(last), highlighted: false });
    return segments;
};
