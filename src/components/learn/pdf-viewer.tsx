import { useState, useEffect } from 'react';
import { useLessonProgress } from '@/lib/api/hooks/use-progress';
import { DocumentViewer } from './document-viewer';
import { Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { apiClient } from '@/lib/api/client';

interface PdfViewerProps {
    lessonId: string;
    assetId?: string; // Phase 10-FINAL-UI
}

interface DocumentMetadata {
    title: string;
    displayName?: string; // Phase 10-IMPROVEMENT
    pageCount: number;
    renderStatus: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
    isSecure: boolean;
}

export function PdfViewer({ lessonId, assetId }: PdfViewerProps) {
    const { mutate: updateProgress } = useLessonProgress();
    const [metadata, setMetadata] = useState<DocumentMetadata | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Governance Contract: Viewed = Done
        updateProgress({
            lessonId,
            lastPositionSeconds: 0,
            isVideoCompleted: true
        });

        const fetchMetadata = async () => {
            try {
                setLoading(true);
                // Phase 10: Metadata Endpoint (Cache Busted)
                // Phase 10: Metadata Endpoint (Cache Busted & Multi-Asset Key)
                const response = await apiClient.get<{ data: DocumentMetadata }>(`/lessons/assets/${assetId}/document/metadata?t=${Date.now()}`);
                // ApiClient response depends on interceptor. 
                // Usually returns full response object or data?
                // `client.ts` generic usage ` apiClient.get<{ data: ..., meta: ... }>` return `Promise<AxiosResponse<...>>`
                // But in `client.ts` there is no response unwrap interceptor shown (only error interceptor).
                // So it returns AxiosResponse.
                setMetadata(response.data.data);
            } catch (err) {
                console.error(err);
                setError('Failed to load document.'); 
            } finally {
                setLoading(false);
            }
        };

        fetchMetadata();
    }, [lessonId, assetId, updateProgress]);

    if (loading) {
        return (
            <div className="h-full bg-slate-900 rounded-3xl flex items-center justify-center text-white">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                    <p className="text-sm text-slate-400">Loading Document...</p>
                </div>
            </div>
        );
    }

    if (error || !metadata) {
        return (
            <div className="h-full bg-slate-900 rounded-3xl flex items-center justify-center text-white">
                <div className="flex flex-col items-center gap-2 text-red-400">
                    <AlertTriangle className="h-8 w-8" />
                    <p>{error || 'Document not found'}</p>
                </div>
            </div>
        );
    }

    if (metadata.renderStatus !== 'COMPLETED') {
         return (
            <div className="h-full bg-slate-900 rounded-3xl flex items-center justify-center text-white">
                <div className="flex flex-col items-center gap-4 max-w-md text-center p-6">
                    <Loader2 className="h-10 w-10 animate-spin text-yellow-500" />
                    <h3 className="font-bold text-lg">Document is Processing</h3>
                    <p className="text-slate-400 text-sm">
                        This document is currently being optimized for secure viewing. 
                        Please check back in a few moments.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full bg-slate-900 rounded-3xl overflow-hidden border border-slate-800">
            <DocumentViewer 
                key={lessonId}
                lessonId={lessonId}
                assetId={assetId}
                pageCount={metadata.pageCount}
                title={metadata.displayName || metadata.title} // Phase 10-IMPROVEMENT
                isSecure={metadata.isSecure}
             />
        </div>
    );
}
// RETRYING WITH SIMPLER LOGIC FOR THIS STEP to avoid breaking flow.
// I will fetch the PAGE 1 image. If it works, I display it.
// I will assume a default or probe for more pages? 
// No, I need the count.
// Implementation Plan Item 4.2: "Fetches pageCount". implied metadata endpoint.
// I will add `GET /lessons/:id/metadata` to the backend routes in the next step.

