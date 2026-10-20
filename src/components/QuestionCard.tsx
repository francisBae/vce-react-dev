import React, { useEffect, useId, useState } from 'react';
import styled from 'styled-components';
import type { Question } from '../types/question';

const Card = styled.div`
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.07);
    padding: 2rem;
    margin: 1rem 0;
`;

const CustomNumber = styled.span`
    font-size: 1.1rem;
    font-weight: 600;
    color: #1f2937;
    background: #f3f4f6;
    padding: 0.25rem 0.75rem;
    border-radius: 6px;
    margin-right: 0.75rem;
    display: inline-block;

    @media (max-width: 640px) {
        font-size: 1rem;
        padding: 0.2rem 0.6rem;
    }
`;

const ScoreButton = styled.span<{ $isScored: boolean }>`
    display: inline-block;
    padding: 0.25rem 0.75rem;
    border-radius: 6px;
    font-size: 0.875rem;
    font-weight: 500;
    margin-right: 0.75rem;
    background-color: ${(props) => (props.$isScored ? '#dcfce7' : '#fee2e2')};
    color: ${(props) => (props.$isScored ? '#166534' : '#991b1b')};
    border: 1px solid ${(props) => (props.$isScored ? '#86efac' : '#fecaca')};
`;

const Title = styled.h2`
    font-size: 1.2rem;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.5rem;

    @media (max-width: 640px) {
        font-size: 1rem;
        font-weight: 500;
    }
`;

const QuestionImage = styled.div`
    margin: 1rem 0;
`;

const AnswerSection = styled.div`
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #e5e7eb;

    strong {
        font-size: 1rem;
        font-weight: 600;

        @media (max-width: 640px) {
            font-size: 0.9rem;
            font-weight: 500;
        }
    }
`;

const OptionList = styled.ul`
    list-style: none;
    padding: 0;
`;

const Option = styled.li<{
    $selected: boolean;
    $correct: boolean;
    $wrong: boolean;
    $disabled: boolean;
}>`
    background: ${({ $selected, $correct, $wrong, $disabled }) => {
        if ($disabled) {
            if ($correct) return '#d1fae5'; // 정답일 때 초록색
            if ($wrong) return '#fee2e2'; // 오답일 때 빨간색
            if ($selected) return '#e5e7eb'; // 선택된 답변 회색
            return '#f9fafb'; // 기본 배경색
        }
        return $selected ? '#eff6ff' : '#f9fafb'; // 선택된 답변은 연한 파란색
    }};
    /* 선택된 옵션은 테두리로 표시 (hover와 구분). 정답 공개 후에는 정/오답 색상으로 테두리 표시 */
    border: 1px solid
        ${({ $selected, $correct, $wrong }) => {
            if (!$selected) return '#e5e7eb';
            if ($correct) return '#22c55e';
            if ($wrong) return '#ef4444';
            return '#2563eb';
        }};
    /* inset shadow로 테두리를 2px처럼 보이게 해서 레이아웃이 밀리지 않도록 함 */
    box-shadow: ${({ $selected, $correct, $wrong }) => {
        if (!$selected) return 'none';
        if ($correct) return 'inset 0 0 0 1px #22c55e';
        if ($wrong) return 'inset 0 0 0 1px #ef4444';
        return 'inset 0 0 0 1px #2563eb';
    }};
    border-radius: 8px;
    margin-bottom: 0.5rem;
    padding: 0.75rem 1rem;
    cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
    transition: all 0.2s ease;
    font-size: 1rem;
    -webkit-tap-highlight-color: transparent;

    @media (max-width: 640px) {
        font-size: 0.9rem;
        padding: 0.6rem 0.8rem;
        margin-bottom: 0.4rem;
    }

    /* 터치 기기에서는 탭 후 hover가 남아 선택처럼 보이므로, 실제 hover 가능한 기기에서만 적용 */
    @media (hover: hover) {
        &:hover {
            ${({ $disabled, $selected }) => (!$disabled && !$selected ? 'background: #e5e7eb;' : '')}
        }
    }

    b {
        font-weight: 600;
        margin-right: 0.5rem;

        @media (max-width: 640px) {
            font-weight: 500;
        }
    }
`;

const Button = styled.button`
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 6px;
    padding: 0.5rem 1rem;
    cursor: pointer;
    transition: background 0.2s;

    &:hover {
        background: #2563eb;
    }

    &:disabled {
        background: #93c5fd;
        cursor: not-allowed;
    }
`;

const AnswerButton = styled(Button)`
    background: #10b981; // 초록색으로 변경
    width: 100%;
    margin-top: 1rem;

    &:hover {
        background: #059669;
    }
`;

const ExplanationToggle = styled.button`
    display: block;
    margin-top: 0.75rem;
    background: none;
    border: 1px solid #3b82f6;
    color: #1d4ed8;
    border-radius: 6px;
    padding: 0.4rem 0.9rem;
    font-size: 0.9rem;
    cursor: pointer;
    transition: background 0.2s;

    &:hover {
        background: #eff6ff;
    }

    &:focus-visible {
        outline: 2px solid #1d4ed8;
        outline-offset: 2px;
    }
`;

const ExplanationBox = styled.div`
    margin-top: 0.75rem;
    padding: 1rem;
    background: #f8fafc;
    border-left: 4px solid #3b82f6;
    border-radius: 6px;
    white-space: pre-line;
    line-height: 1.6;
    font-size: 0.95rem;
    color: #1f2937;

    @media (max-width: 640px) {
        font-size: 0.875rem;
        padding: 0.75rem;
    }
`;

const Img = styled.img`
    max-width: 100%;
    margin: 0.5rem 0;
`;

interface Props {
    question: Question;
    selected?: string | string[];
    onSelect?: (answer: string | string[]) => void;
    showAnswer?: boolean;
    onShowAnswer?: () => void;
    hideNumber?: boolean;
    customNumber?: string;
    hideAnswerButton?: boolean;
    questionNumber?: string;
    userAnswer?: string | string[];
    onAnswerChange?: (answer: string | string[]) => void;
    isReviewMode?: boolean;
    examMode?: string;
    scoredQuestions?: number[];
}

export const QuestionCard: React.FC<Props> = ({
    question,
    selected,
    onSelect,
    showAnswer = false,
    onShowAnswer,
    hideNumber = false,
    customNumber,
    hideAnswerButton = false,
    questionNumber,
    userAnswer,
    // onAnswerChange,
    isReviewMode = false,
    examMode,
    scoredQuestions,
}) => {
    const [showExplanation, setShowExplanation] = useState(false);
    const explanationId = useId();

    // 문제가 바뀌거나 정답을 숨기면 해설은 다시 접힌 상태로
    useEffect(() => {
        setShowExplanation(false);
    }, [question.number, showAnswer]);

    const isAnswerCorrect = (letter: string) => {
        if (!showAnswer) return false;
        if (question.isMultipleChoice) {
            return question.answer.includes(letter);
        }
        return letter === question.answer;
    };

    const isAnswerWrong = (letter: string) => {
        if (!showAnswer || !selected) return false;
        if (question.isMultipleChoice) {
            return Array.isArray(selected) && selected.includes(letter) && !question.answer.includes(letter);
        }
        return selected === letter && !isAnswerCorrect(letter);
    };

    const isSelected = (letter: string) => {
        // 리뷰 모드에서는 userAnswer 사용, 아니면 selected 사용
        const currentAnswer = isReviewMode ? userAnswer : selected;
        if (!currentAnswer) return false;
        if (question.isMultipleChoice) {
            return Array.isArray(currentAnswer) && currentAnswer.includes(letter);
        }
        return currentAnswer === letter;
    };

    const handleSelect = (letter: string) => {
        if (showAnswer || !onSelect) return;

        if (question.isMultipleChoice) {
            const currentSelected = Array.isArray(selected) ? selected : [];
            const newSelected = currentSelected.includes(letter)
                ? currentSelected.filter((l) => l !== letter)
                : [...currentSelected, letter].sort();
            onSelect(newSelected);
        } else {
            onSelect(letter);
        }
    };

    const handleShowAnswer = () => {
        if (onShowAnswer) {
            onShowAnswer();
        }
    };

    // 리뷰 모드에서 채점 포함/제외 여부 계산
    const isScored = examMode === 'practice' && scoredQuestions ? scoredQuestions.includes(question.number) : true;

    return (
        <Card>
            <Title>
                {questionNumber ? (
                    <>
                        {examMode === 'practice' && (
                            <ScoreButton $isScored={isScored}>{isScored ? '채점 포함' : '채점 제외'}</ScoreButton>
                        )}
                        <CustomNumber>{questionNumber}</CustomNumber>
                    </>
                ) : customNumber ? (
                    <>
                        {customNumber.includes('[채점 포함]') && <ScoreButton $isScored={true}>채점 포함</ScoreButton>}
                        {customNumber.includes('[채점 제외]') && <ScoreButton $isScored={false}>채점 제외</ScoreButton>}
                        <CustomNumber>{customNumber.replace(/\[채점 (포함|제외)\] /g, '')}</CustomNumber>
                    </>
                ) : (
                    !hideNumber && <span>문제 {question.number}</span>
                )}
                {question.text}
            </Title>
            {question.images?.question && (
                <QuestionImage>
                    {question.images.question.map((src, i) => (
                        <Img key={'question' + i} src={src} alt="문제 이미지" />
                    ))}
                </QuestionImage>
            )}
            <OptionList>
                {question.options.map((opt, idx) => {
                    const letter = String.fromCharCode(65 + idx);
                    const correct = isAnswerCorrect(letter);
                    const wrong = isAnswerWrong(letter);
                    return (
                        <Option
                            key={letter}
                            $selected={isSelected(letter)}
                            $correct={correct}
                            $wrong={wrong}
                            $disabled={showAnswer}
                            onClick={() => handleSelect(letter)}
                        >
                            <b>{letter}.</b> {opt}
                        </Option>
                    );
                })}
            </OptionList>

            {!hideAnswerButton && !isReviewMode && (selected || question.images?.answer) && (
                <AnswerButton onClick={handleShowAnswer}>{showAnswer ? '정답 숨기기' : '정답 확인'}</AnswerButton>
            )}

            {showAnswer && (
                <AnswerSection>
                    <strong>정답: {question.answer}</strong>
                    {question.images?.answer && (
                        <div>
                            {question.images.answer.map((src, i) => (
                                <Img key={'answer' + i} src={src} alt="정답 이미지" />
                            ))}
                        </div>
                    )}
                    {question.explanation && (
                        <>
                            <ExplanationToggle
                                type="button"
                                aria-expanded={showExplanation}
                                aria-controls={explanationId}
                                onClick={() => setShowExplanation((prev) => !prev)}
                            >
                                {showExplanation ? '해설 접기' : '해설 보기'}
                            </ExplanationToggle>
                            {showExplanation && (
                                <ExplanationBox id={explanationId}>{question.explanation}</ExplanationBox>
                            )}
                        </>
                    )}
                </AnswerSection>
            )}
            {question.link && (
                <a
                    href={question.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: 'block', marginTop: '1rem' }}
                >
                    원문보기
                </a>
            )}
        </Card>
    );
};
