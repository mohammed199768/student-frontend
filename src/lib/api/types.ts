export interface University {
    id: string;
    name: string;
    logo?: string;
    logoUrl?: string;
}

export interface Major {
    id: string;
    name: string;
    universityId: string;
}

export interface Subject {
    id: string;
    name: string;
    majorId: string;
}

export interface Course {
    id: string;
    title: string;
    slug: string;
    thumbnail?: string;
    description?: string;
    price: number;
    salePrice?: number;
    isFree: boolean;
    isFeatured: boolean;
    instructorId: string;
    universityId?: string;
    majorId?: string;
    subjectId?: string;
    level?: string;
    duration?: string;
    totalLessons?: number;
    totalStudents?: number;
    rating?: number;
    updatedAt: string;
    enrollmentStatus?: 'NONE' | 'PENDING' | 'ACTIVE';
}

export interface Section {
    id: string;
    title: string;
    order: number;
    lessons: Lesson[];
}

export interface Lesson {
    id: string;
    title: string;
    slug: string;
    order: number;
    durationSeconds?: number;
    isFreePreview: boolean;
    assets: Asset[];
    // Progress fields (merged from backend response if available)
    lastPositionSeconds?: number;

    isCompleted?: boolean;
    isLockedForStudent?: boolean;
}

export interface Asset {
    id: string;
    type: 'VIDEO' | 'PDF' | 'QUIZ' | 'PPTX';
    title: string;
    isLocked: boolean;
    metadata?: unknown;
    // Helper for flattened lists
    lessonId?: string;
}

export interface User {
    id: string;
    email: string;
    fullName: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    role: 'STUDENT' | 'ADMIN';
}

export interface Comment {
    id: string;
    content: string;
    userId: string;
    userName: string;
    createdAt: string;
    parentId?: string;
}

export interface QnAQuestion {
    id: string;
    content: string;
    userId: string;
    userName: string;
    lessonId?: string;
    createdAt: string;
    answers: QnAAnswer[];
}

export interface QnAAnswer {
    id: string;
    content: string;
    userId: string;
    userName: string;
    createdAt: string;
}

export interface Quiz {
    id: string;
    title: string;
    questions: QuizQuestion[];
}

export interface QuizQuestion {
    id: string;
    text: string;
    options: QuizOption[];
}

export interface QuizOption {
    id: string;
    text: string;
}



export interface Progress {
    courseId: string;
    lastLessonId?: string;
    completedLessonIds: string[];
    totalLessons: number;
    percentage: number;
}
