export interface Job {
    id: string;
    title: string;
    company: string;
    location: string;
    type: "Full-time" | "Part-time" | "Contract" | "Internship";
    salary: string;
    description: string;
    postedAt: string;
    userId: string | null;
    isClosed: boolean;
}