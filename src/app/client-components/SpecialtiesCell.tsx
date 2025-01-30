import { useState } from "react";

type SpecialtiesCellProps = {
    specialties: string[];
};

export function SpecialtiesCell({ specialties }: SpecialtiesCellProps) {
    const [showMore, setShowMore] = useState(false);

    // If there are 3 or fewer specialties, just show them all
    if (specialties.length <= 3) {
        return (
            <div>
                {specialties.map((spec, i) => (
                    <div key={i}>• {spec}</div>
                ))}
            </div>
        );
    }

    // Otherwise, show first 3 plus a "show more" toggle
    const firstThree = specialties.slice(0, 3);
    const remaining = specialties.slice(3);

    return (
        <div className="relative">
            {/* Always show the first 3 specialties */}
            {firstThree.map((spec, i) => (
                <div key={i}>• {spec}</div>
            ))}

            {!showMore && (
                <button
                    onClick={() => setShowMore(true)}
                    className="text-blue-600 hover:underline mt-1"
                >
                    + {remaining.length} more
                </button>
            )}

            {showMore && (
                <div className="mt-2 p-2 border border-gray-300 bg-white shadow rounded">
                    {remaining.map((spec, i) => (
                        <div key={i}>• {spec}</div>
                    ))}
                    {/* Optionally include "Show less" to collapse again */}
                    <button
                        onClick={() => setShowMore(false)}
                        className="mt-2 text-sm text-blue-600 hover:underline"
                    >
                        Show less
                    </button>
                </div>
            )}
        </div>
    );
}
