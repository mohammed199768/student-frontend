import { notFound } from 'next/navigation';
import { UniversityDetails } from '@/components/universities/university-details';
import { Navbar } from '@/components/common/navbar';

interface UniversityPageProps {
    params: Promise<{
        id: string;
        locale: string;
    }>;
}

export default async function UniversityPage({ params }: UniversityPageProps) {
    const { id } = await params;

    // Fetch university metadata serverside
    let university;
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/catalog/universities/${id}`, {
            next: { revalidate: 60 }
        });

        if (!res.ok) {
            if (res.status === 404) notFound();
            throw new Error('Failed to fetch university');
        }

        const json = await res.json();
        university = json.data;
    } catch (error) {
        console.error("Error fetching university:", error);
        notFound();
    }

    return (
        <div className="min-h-screen bg-slate-950">
            <Navbar />
            <div className="pb-24 pt-12 md:pb-20">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <UniversityDetails
                        universityId={id}
                        initialUniversity={university}
                    />
                </div>
            </div>
        </div>
    );
}
