'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Loader2, AlertTriangle, Maximize, Minimize, Plus, Minus } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { useAuth } from '@/lib/contexts/auth-context';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// WORKER CONFIGURATION
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface DocumentViewerProps {
    lessonId: string;
    assetId?: string; // Phase 10-FINAL-UI: Unique Asset ID
    pageCount: number; 
    title?: string;
    className?: string;
    isSecure: boolean;
}

/**
 * SECURITY: Secure Document Viewer
 * - Gets token from AuthContext (in-memory) - NO localStorage
 * - Passes token via Authorization header to react-pdf
 * - Cleans up resources on unmount
 */
export function DocumentViewer({ lessonId, assetId, pageCount: initialPageCount, title, className = '', isSecure }: DocumentViewerProps) {
    const [numPages, setNumPages] = useState<number | null>(initialPageCount || null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [scale, setScale] = useState(1.0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    
    // SECURITY: Get token from AuthContext (in-memory storage)
    const { getToken } = useAuth();
    const token = getToken();

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
        setIsLoading(false);
    }
    
    function onDocumentLoadError(err: Error) {
        console.error('PDF Load Error:', err);
        setError('Failed to load document.');
        setIsLoading(false);
    }

    const [cacheBuster] = useState(() => Date.now()); // Phase 10-UX: Stable Cache Key

    /**
     * SECURITY: File configuration with Authorization header
     * Token is passed in httpHeaders, NOT in URL query parameters
     */
    const file = useMemo(() => {
        if (!token || !assetId) return null;
        return {
            url: `${process.env.NEXT_PUBLIC_API_BASE_URL}/lessons/assets/${assetId}/document/stream?v=${cacheBuster}`,
            httpHeaders: {
                'Authorization': `Bearer ${token}`
            },
            withCredentials: true
        };
    }, [token, assetId, cacheBuster]);

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    const zoomIn = () => setScale(prev => Math.min(prev + 0.25, 3.0));
    const zoomOut = () => setScale(prev => Math.max(prev - 0.25, 0.5));

    /**
     * Lazy Load Wrapper for pages
     * Uses IntersectionObserver for performance
     */
    function LazyPage({ index, scale }: { index: number, scale: number }) {
        const [isVisible, setIsVisible] = useState(false);
        const ref = useRef<HTMLDivElement>(null);

        useEffect(() => {
            const observer = new IntersectionObserver(
                ([entry]) => {
                    if (entry.isIntersecting) {
                        setIsVisible(true);
                        observer.disconnect(); // Keep loaded once visible
                    }
                },
                { rootMargin: '200px' } // Preload when close
            );
            
            if (ref.current) observer.observe(ref.current);
            return () => observer.disconnect();
        }, []);

        // Calculate responsive width
        const getResponsiveWidth = () => {
            if (typeof window === 'undefined') return 800 * scale;
            return Math.min(800 * scale, window.innerWidth - 40);
        };

        return (
            <div ref={ref} className="shadow-lg bg-white relative mb-4 mx-auto" style={{ minHeight: '100px' }}>
                {isVisible ? (
                    <>
                        <Page 
                            pageNumber={index + 1} 
                            scale={scale}
                            renderTextLayer={false} 
                            renderAnnotationLayer={false}
                            loading={
                                <div className="bg-white animate-pulse" 
                                     style={{ 
                                         width: getResponsiveWidth(), 
                                         height: 800 * scale 
                                     }} 
                                />
                            }
                            width={getResponsiveWidth()}
                            className="block"
                        />
                         {/* Security Overlay (Watermark Backup) */}
                         <div className="absolute inset-0 z-10 pointer-events-none mix-blend-multiply opacity-10 bg-repeat space-x-4 space-y-4" />
                    </>
                ) : (
                    <div className="bg-slate-800/10 animate-pulse flex items-center justify-center text-slate-400 text-sm"
                         style={{ 
                             width: getResponsiveWidth(), 
                             height: 1100 * scale // Approx height of a page
                         }}
                    >
                        Reviewing Page {index + 1}...
                    </div>
                )}
            </div>
        );
    }

    return (
        <div id="doc-viewer-container" 
             className={`relative bg-slate-900 flex flex-col items-center justify-start select-none ${className} ${isFullscreen ? 'fixed inset-0 z-50 w-full h-full' : 'min-h-[500px]'}`}
             dir="ltr"> {/* Enforce LTR for Viewer internal layout to prevent RTL scroll bugs */}
             
             {/* Security Styles - Prevent printing */}
             <style jsx global>{`
                @media print {
                    .secure-pdf-viewer { display: none !important; }
                }
             `}</style>
             
             {/* Toolbar */}
             <div className="w-full bg-slate-800 p-2 flex items-center justify-between text-white text-sm sticky top-0 z-10 shadow-md shrink-0">
                <span className="font-medium px-4 truncate max-w-[200px]">{title || 'Document'}</span>
                
                <div className="flex items-center gap-2">
                    <button onClick={zoomOut} className="p-2 hover:bg-slate-700 rounded transition-colors" title="Zoom Out">
                        <Minus className="h-4 w-4" />
                    </button>
                    <span className="min-w-[3ch] text-center">{Math.round(scale * 100)}%</span>
                    <button onClick={zoomIn} className="p-2 hover:bg-slate-700 rounded transition-colors" title="Zoom In">
                        <Plus className="h-4 w-4" />
                    </button>
                    
                    <div className="h-4 w-px bg-slate-700 mx-2" />

                    <button onClick={toggleFullscreen} className="p-2 hover:bg-slate-700 rounded transition-colors" title="Toggle Fullscreen">
                        {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                    </button>
                </div>
             </div>

             {/* Content Area */}
             <div className="flex-1 w-full overflow-y-auto bg-slate-900/50 relative secure-pdf-viewer p-4 text-center">
                 
                 {/* Loading State */}
                 {isLoading && (
                     <div className="absolute inset-0 flex items-center justify-center z-20">
                         <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                     </div>
                 )}
                 
                 {error ? (
                     <div className="flex flex-col items-center justify-center text-red-400 gap-2 h-full">
                         <AlertTriangle className="h-8 w-8" />
                         <p>{error}</p>
                     </div>
                 ) : (
                     <div className="inline-block shadow-2xl">
                         {file ? (
                             <Document
                                file={file}
                                onLoadSuccess={onDocumentLoadSuccess}
                                onLoadError={onDocumentLoadError}
                                loading={null}
                                error={null}
                                className="flex flex-col gap-4 items-center"
                             >
                                {Array.from(new Array(numPages || 0), (_, index) => (
                                    <LazyPage key={`page_${index + 1}`} index={index} scale={scale} />
                                ))}
                             </Document>
                         ) : (
                             <p className="text-white">Authentication required</p>
                         )}
                     </div>
                 )}
             </div>
        </div>
    );
}
