"use client";

import React, { useState } from "react";
import { formatPhoneNumber } from "@/app/utils/formatPhoneNumber";
import { SpecialtiesCell } from "@/app/client-components/SpecialtiesCell";

type Advocate = {
    id: number;
    firstName: string;
    lastName: string;
    city: string;
    degree: string;
    specialties: string[];
    yearsOfExperience: string;
    phoneNumber: string;
};

interface ClientAdvocatesProps {
    initialData: Advocate[];
    initialPage: number;
    totalPages: number;
    limit: number;
}

/**
 * This client component manages:
 * - The current page
 * - The list of advocates
 * - Searching (optional)
 * - Fetching new pages from the /api/advocates endpoint
 */
export default function ClientAdvocates({
    initialData,
    initialPage,
    totalPages,
    limit,
}: ClientAdvocatesProps) {
    const [advocates, setAdvocates] = useState<Advocate[]>(initialData);
    const [currentPage, setCurrentPage] = useState<number>(initialPage);
    const [maxPages, setMaxPages] = useState<number>(totalPages);

    const [searchTerm, setSearchTerm] = useState("");

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const term = e.target.value;
        setSearchTerm(term);

        // Simple client-side filter. For robust searching or large data sets,
        // we could do server-side searching (fetch with query).
        const filtered = initialData.filter((adv) => {
            const combined = [
                adv.firstName,
                adv.lastName,
                adv.city,
                adv.degree,
                adv.specialties.join(" "),
                adv.yearsOfExperience,
            ]
            .join(" ")
            .toLowerCase();
            return combined.includes(term.toLowerCase());
        });
        setAdvocates(filtered);
    };

    /**
     * A helper to fetch advocates for a given page from the API
     */
    async function fetchAdvocatesForPage(pageNumber: number) {
        try {
            const res = await fetch(`/api/advocates?page=${pageNumber}&limit=${limit}`, {
                method: "GET",
            });
            if (!res.ok) {
                // Future iterations could use toasts to show backend errors
                console.error("Failed to fetch advocates");
            }
            const json = await res.json();
            // Update state with new data
            setAdvocates(json.data);
            setCurrentPage(json.pagination.currentPage);
            setMaxPages(json.pagination.totalPages);
            // Clear any existing searchTerm so we show the full page results
            setSearchTerm("");
        } catch (error) {
            console.error(error);
        }
    }

    const handleNextPage = async () => {
        if (currentPage < maxPages) {
            await fetchAdvocatesForPage(currentPage + 1);
        }
    };

    const handlePrevPage = async () => {
        if (currentPage > 1) {
           await fetchAdvocatesForPage(currentPage - 1);
        }
    };

    const handleReset = () => {
        setSearchTerm("");
        setAdvocates(initialData);
        setCurrentPage(initialPage);
        setMaxPages(totalPages);
    };

    return (
        <main className="p-6">
            <h1 className="text-2xl font-bold mb-6">Solace Advocates</h1>

            {/* --- SEARCH SECTION --- */}
            <div className="mb-6">
                <label htmlFor="search" className="block mb-2 font-semibold text-gray-700">
                    Search (Client-side filter on current data)
                </label>
                <input
                    id="search"
                    type="text"
                    placeholder="Search by name, city, etc."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="border border-gray-300 rounded px-3 py-2 w-full max-w-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <p className="mt-1 text-sm text-gray-600">
                    Searching for: <span className="font-semibold">{searchTerm || "—"}</span>
                </p>

                <button
                    onClick={handleReset}
                    className="mt-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
                >
                    Reset
                </button>
            </div>

            {/* --- TABLE --- */}
            <div className="overflow-x-auto mb-4">
                <table className="min-w-full border border-gray-200 divide-y divide-gray-200 shadow-sm">
                    <thead className="bg-gray-50">
                    <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">First Name</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Last Name</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">City</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Degree</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Specialties</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Yrs Experience</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Phone Number</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                    {advocates.map((adv) => (
                        <tr key={adv.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">{adv.firstName}</td>
                            <td className="px-4 py-3">{adv.lastName}</td>
                            <td className="px-4 py-3">{adv.city}</td>
                            <td className="px-4 py-3">{adv.degree}</td>
                            <td className="px-4 py-3">
                                <SpecialtiesCell specialties={adv.specialties} />
                            </td>
                            <td className="px-4 py-3">{adv.yearsOfExperience}</td>
                            <td className="px-4 py-3">{formatPhoneNumber(String(adv.phoneNumber))}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {/* --- PAGINATION CONTROLS --- */}
            <div className="flex items-center gap-2">
                <button
                    onClick={handlePrevPage}
                    disabled={currentPage <= 1}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded disabled:opacity-50"
                >
                    Previous
                </button>
                <span className="text-gray-700">
          Page <strong>{currentPage}</strong> of <strong>{maxPages}</strong>
        </span>
                <button
                    onClick={handleNextPage}
                    disabled={currentPage >= maxPages}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded disabled:opacity-50"
                >
                    Next
                </button>
            </div>
        </main>
    );
}
