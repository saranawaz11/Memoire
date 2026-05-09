export type Note = {
    id: number;
    title: string;
    content: string | null;
    tags: string[];
    updatedAt: string;
    wordCount: number;
    userId?: string;
    createdAt?: string;
};