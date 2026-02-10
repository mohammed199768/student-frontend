'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { Quiz, QuizQuestion } from '@/lib/api/types';
import { useState } from 'react';
import { CheckCircle2, AlertCircle, Loader2, ArrowRight, ArrowLeft, Trophy } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

interface QuizPlayerProps {
    assetId: string;
}

export function QuizPlayer({ assetId }: QuizPlayerProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [score, setScore] = useState<number | null>(null);

    const { data: quiz, isLoading } = useQuery({
        queryKey: ['quiz', assetId],
        queryFn: async () => {
            const { data } = await apiClient.get(`/courses/assets/${assetId}/quiz`);
            return data.data as Quiz;
        },
    });

    const submitMutation = useMutation({
        mutationFn: async (payload: { answers: { questionId: string; answerId: string }[] }) => {
            const { data } = await apiClient.post(`/courses/assets/${assetId}/quiz/submit`, payload);
            return data;
        },
        onSuccess: (data) => {
            setScore(data.data.score);
            setIsSubmitted(true);
            toast.success('تم تسليم الاختبار بنجاح!');
        },
        onError: () => {
            toast.error('حدث خطأ أثناء تسليم الاختبار');
        },
    });

    const handleOptionSelect = (questionId: string, optionId: string) => {
        setAnswers(prev => ({ ...prev, [questionId]: optionId }));
    };

    const handleNext = () => {
        if (currentStep < (quiz?.questions.length || 0) - 1) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleSubmit = () => {
        if (!quiz) return;
        const payload = {
            answers: quiz.questions.map(q => ({
                questionId: q.id,
                answerId: answers[q.id] || '',
            })),
        };
        submitMutation.mutate(payload);
    };

    if (isLoading) return <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin" /></div>;
    if (!quiz) return <div className="p-8 text-center text-red-500">لا يوجد بيانات اختبار متوفرة</div>;

    if (isSubmitted) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-12 text-center bg-slate-900 text-white rounded-3xl">
                <div className="h-24 w-24 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center mb-8">
                    <Trophy className="h-12 w-12 text-green-500" />
                </div>
                <h2 className="text-4xl font-extrabold mb-4">انتهى الاختبار!</h2>
                <div className="text-6xl font-black text-indigo-400 mb-8">{score}%</div>
                <p className="text-slate-400 mb-12 max-w-md">لقد أكملت اختبار "{quiz.title}". درجتك هي {score}%. يمكنك متابعة الدورة الآن.</p>
                <button
                    onClick={() => window.location.reload()}
                    className="rounded-2xl bg-white px-10 py-4 font-bold text-slate-900 hover:bg-slate-100"
                >
                    إعادة الاختبار
                </button>
            </div>
        );
    }

    const currentQuestion = quiz.questions[currentStep];

    return (
        <div className="flex flex-col h-full bg-slate-800 text-white rounded-3xl overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-700 flex items-center justify-between">
                <div>
                    <h3 className="font-bold text-lg">{quiz.title}</h3>
                    <p className="text-xs text-slate-400">سؤال {currentStep + 1} من {quiz.questions.length}</p>
                </div>
                <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-indigo-500 transition-all"
                        style={{ width: `${((currentStep + 1) / quiz.questions.length) * 100}%` }}
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-12">
                <h4 className="text-2xl font-bold mb-12">{currentQuestion.text}</h4>
                <div className="grid grid-cols-1 gap-4">
                    {currentQuestion.options.map(option => (
                        <button
                            key={option.id}
                            onClick={() => handleOptionSelect(currentQuestion.id, option.id)}
                            className={cn(
                                "flex items-center gap-4 px-6 py-5 rounded-2xl text-right transition-all border-2",
                                answers[currentQuestion.id] === option.id
                                    ? "bg-indigo-600/20 border-indigo-500 font-bold"
                                    : "bg-slate-700/50 border-transparent hover:border-slate-600"
                            )}
                        >
                            <div className={cn(
                                "h-5 w-5 rounded-full border-2 flex items-center justify-center",
                                answers[currentQuestion.id] === option.id ? "border-indigo-400 bg-indigo-400" : "border-slate-500"
                            )}>
                                {answers[currentQuestion.id] === option.id && <div className="h-2 w-2 rounded-full bg-white" />}
                            </div>
                            <span>{option.text}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="px-8 py-6 bg-slate-900/50 border-t border-slate-700 flex items-center justify-between">
                <button
                    onClick={handlePrev}
                    disabled={currentStep === 0}
                    className="flex items-center gap-2 text-sm font-bold text-slate-400 disabled:opacity-30"
                >
                    <ArrowRight className="h-4 w-4" /> السابق
                </button>

                {currentStep === quiz.questions.length - 1 ? (
                    <button
                        onClick={handleSubmit}
                        disabled={submitMutation.isPending || !answers[currentQuestion.id]}
                        className="rounded-xl bg-indigo-600 px-10 py-3 font-bold text-white shadow-lg hover:bg-indigo-700 disabled:opacity-50"
                    >
                        {submitMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'تسليم الاختبار'}
                    </button>
                ) : (
                    <button
                        onClick={handleNext}
                        disabled={!answers[currentQuestion.id]}
                        className="flex items-center gap-2 rounded-xl bg-slate-700 px-8 py-3 text-sm font-bold text-white hover:bg-slate-600 disabled:opacity-50"
                    >
                        التالي <ArrowLeft className="h-4 w-4" />
                    </button>
                )}
            </div>
        </div>
    );
}
