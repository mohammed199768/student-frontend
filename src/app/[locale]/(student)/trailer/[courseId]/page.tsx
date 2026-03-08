'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/auth-context';
import apiClient from '@/lib/api/client';

interface TrailerData {
  course: {
    id: string;
    title: string;
    description?: string;
    thumbnail?: string;
    price: number;
    university?: { name: string; logo?: string };
  };
  trailerLectures: Array<{
    id: string;
    title: string;
    order: number;
    parts: Array<{
      id: string;
      title: string;
      lessons: Array<{
        id: string;
        title: string;
        video: string;
      }>;
      files: Array<{
        id: string;
        title: string;
        type: 'PDF' | 'PPTX';
        storageKey: string;
      }>;
    }>;
  }>;
  courseOutline: Array<{
    id: string;
    title: string;
    order: number;
    _count: { parts: number };
  }>;
}

export default function TrailerPage() {
  const params = useParams();
  const router = useRouter();
  const { user, status } = useAuth();
  const courseId = params.courseId as string;
  const locale = (params.locale as string) || 'en';

  const [trailer, setTrailer] = useState<TrailerData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'initializing') return;

    if (status === 'guest') {
      router.push(`/${locale}/login?redirect=/trailer/${courseId}`);
      return;
    }

    if (user && !user.isEmailVerified) {
      router.push(`/${locale}/verify-email`);
      return;
    }

    const fetchTrailer = async () => {
      try {
        const { data } = await apiClient.get(`/courses/${courseId}/trailer`);
        setTrailer(data.data);
      } catch {
        setError('This course does not have a trailer yet.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrailer();
  }, [user, status, courseId, router, locale]);

  if (status === 'initializing' || isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error || !trailer) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">{error || 'Trailer not found'}</p>
        <button
          className="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition"
          onClick={() => router.push(`/${locale}/courses/${courseId}`)}
        >
          Back to Course
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10 py-8 px-4">

      {/* Course Header */}
      <div className="flex gap-6 items-start">
        {trailer.course.thumbnail && (
          <img
            src={trailer.course.thumbnail}
            alt={trailer.course.title}
            className="w-48 h-32 object-cover rounded-lg hidden md:block"
          />
        )}
        <div className="flex-1">
          {trailer.course.university && (
            <p className="text-sm text-gray-500 mb-1">{trailer.course.university.name}</p>
          )}
          <h1 className="text-3xl font-bold mb-2">{trailer.course.title}</h1>
          {trailer.course.description && (
            <p className="text-gray-500">{trailer.course.description}</p>
          )}
          <span className="inline-block mt-3 px-3 py-1 text-sm font-medium bg-green-100 text-green-700 rounded-full">
            Free Preview
          </span>
        </div>
      </div>

      {/* Trailer Lectures */}
      <div className="space-y-8">
        <h2 className="text-xl font-semibold border-b pb-2">Preview Content</h2>
        {trailer.trailerLectures.map((lecture) => (
          <div key={lecture.id} className="space-y-4">
            <h3 className="text-lg font-semibold text-primary">{lecture.title}</h3>
            {lecture.parts.map(part => (
              <div key={part.id} className="ml-4 space-y-2">
                <p className="font-medium text-sm">{part.title}</p>

                {/* Video assets */}
                {part.lessons.map(lesson => (
                  <div
                    key={lesson.id}
                    className="flex items-center gap-3 p-3 border rounded-lg bg-white dark:bg-gray-900 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    onClick={() => router.push(`/${locale}/learn/${courseId}`)}
                  >
                    <svg className="h-4 w-4 text-purple-500 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                    <span className="text-sm">{lesson.title}</span>
                    <span className="ml-auto text-xs px-2 py-0.5 border rounded text-gray-500">VIDEO</span>
                  </div>
                ))}

                {/* File assets */}
                {part.files.map(file => (
                  <div
                    key={file.id}
                    className="flex items-center gap-3 p-3 border rounded-lg bg-white dark:bg-gray-900 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <svg className="h-4 w-4 text-blue-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm">{file.title}</span>
                    <span className="ml-auto text-xs px-2 py-0.5 border rounded text-gray-500">{file.type}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Course Outline Teaser */}
      <div className="space-y-4 border rounded-xl p-6 bg-gray-50 dark:bg-gray-900/50">
        <h2 className="text-xl font-semibold">Full Course Content</h2>
        <p className="text-sm text-gray-500">
          {trailer.courseOutline.length} lectures — enroll to unlock everything
        </p>
        <div className="space-y-2">
          {trailer.courseOutline.map(lecture => (
            <div
              key={lecture.id}
              className="flex items-center justify-between p-3 border rounded-lg bg-white dark:bg-gray-900 opacity-70"
            >
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className="text-sm font-medium">{lecture.title}</span>
              </div>
              <span className="text-xs text-gray-500">{lecture._count.parts} parts</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="sticky bottom-4">
        <div className="bg-white dark:bg-gray-900 border rounded-xl p-4 shadow-lg flex items-center justify-between gap-4">
          <div>
            <p className="font-semibold">{trailer.course.title}</p>
            <p className="text-2xl font-bold text-primary">{trailer.course.price} SAR</p>
          </div>
          <button
            className="px-8 py-3 text-lg font-semibold bg-primary text-white rounded-lg hover:opacity-90 transition flex items-center gap-2"
            onClick={() => router.push(`/${locale}/enroll/${courseId}`)}
          >
            Enroll Now
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

    </div>
  );
}
