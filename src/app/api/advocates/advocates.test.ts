import { GET } from "./route"; // Adjust the import path accordingly
import db from "../../../db";
import { advocates } from "../../../db/schema";

// We will need to mock the entire db object methods used in GET.
jest.mock("../../../db", () => ({
    __esModule: true,
    default: {
        select: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        offset: jest.fn().mockReturnThis(),
    },
}));

describe("GET /api/advocates", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should return 500 if db is not available", async () => {
        // Mock the db to be undefined (simulate a failed import or connection)
        (db as unknown) = undefined;

        const req = new Request("http://localhost:3000/api/advocates");
        const res = await GET(req);

        expect(res.status).toBe(500);
        const body = await res.json();
        expect(body).toEqual({ error: "Database connection failed" });
    });

    it("should return 400 for invalid page or limit parameters", async () => {
        // Restore db object for subsequent tests
        (db as unknown) = {
            select: jest.fn().mockReturnThis(),
            from: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            offset: jest.fn().mockReturnThis(),
        };

        // Example of providing invalid query params ?page=abc
        const req = new Request("http://localhost:3000/api/advocates?page=abc&limit=10");
        const res = await GET(req);

        expect(res.status).toBe(400);
        const body = await res.json();
        expect(body).toEqual({ error: "Invalid page or limit parameter" });
    });

    it("should return 200 and valid data for correct pagination params", async () => {
        const mockData = [{ id: 1, name: "Test Advocate" }];
        const mockCountResult = [{ count: 20 }];

        // Mock chain for db calls
        //
        // FIRST CALL: db.select().from(advocates).limit(limit).offset(offset)
        //
        (db.select as jest.Mock).mockImplementationOnce(() => {
            return {
                from: jest.fn().mockImplementationOnce(() => {
                    return {
                        limit: jest.fn().mockImplementationOnce(() => {
                            return {
                                offset: jest.fn().mockResolvedValueOnce(mockData),
                            };
                        }),
                    };
                }),
            };
        });

        //
        // SECOND CALL: db.select({ count: count() }).from(advocates)
        //
        (db.select as jest.Mock).mockImplementationOnce(() => {
            return {
                from: jest.fn().mockResolvedValueOnce(mockCountResult),
            };
        });

        const req = new Request("http://localhost:3000/api/advocates?page=2&limit=10");
        const res = await GET(req);

        expect(res.status).toBe(200);
        const json = await res.json();

        // We expect the data to match mockData
        expect(json.data).toEqual(mockData);
        // totalCount should be 20 as per mockCountResult
        expect(json.pagination.totalCount).toBe(20);
        // For page=2 & limit=10, totalPages would be 2 (20/10), currentPage=2
        expect(json.pagination.totalPages).toBe(2);
        expect(json.pagination.currentPage).toBe(2);
        expect(json.pagination.limit).toBe(10);
    });

    it("should return 500 if an error occurs during data fetch", async () => {
        // Force an error from db.select() to simulate an exception
        (db.select as jest.Mock).mockImplementation(() => {
            throw new Error("Simulated DB Error");
        });

        const req = new Request("http://localhost:3000/api/advocates");
        const res = await GET(req);

        expect(res.status).toBe(500);
        const body = await res.json();
        expect(body).toEqual({ error: "Internal server error" });
    });
});
