export interface Location {
    city?: string | null;
    country?: string | null;
}

export interface PersonalData {
    first_name: string;
    last_name?: string | null;
    email?: string | null;
    phone?: string | null;
    linkedin?: string | null;
    portfolio?: string | null;
    location?: Location | null;
}

export interface Experience {
    job_title: string;
    company?: string | null;
    location?: string | null;
    start_date?: string | null;
    end_date?: string | null;
    description: string[];
    technologies_used?: string[];
}

export interface Project {
    project_name: string;
    description?: string | null;
    technologies_used?: string[];
    link?: string | null;
    start_date?: string | null;
    end_date?: string | null;
}

export interface Skill {
    category?: string | null;
    skill_name: string;
}

export interface ResearchWork {
    title?: string | null;
    publication?: string | null;
    date?: string | null;
    link?: string | null;
    description?: string | null;
}

export interface Education {
    institution?: string | null;
    degree?: string | null;
    field_of_study?: string | null;
    start_date?: string | null;
    end_date?: string | null;
    grade?: string | null;
    description?: string | null;
}

export interface Publication {
    title?: string | null;
    authors: string[];
    publication_venue?: string | null;
    date?: string | null;
    link?: string | null;
    description?: string | null;
}

export type ConferenceType = 'conference' | 'training' | 'workshop';

export interface ConferenceTrainingWorkshop {
    type?: ConferenceType | null;
    name?: string | null;
    organizer?: string | null;
    date?: string | null;
    location?: string | null;
    description?: string | null;
    certificate_link?: string | null;
}

export interface Award {
    title?: string | null;
    issuer?: string | null;
    date?: string | null;
    description?: string | null;
}

export interface ExtracurricularActivity {
    activity_name?: string | null;
    role?: string | null;
    organization?: string | null;
    start_date?: string | null;
    end_date?: string | null;
    description?: string | null;
}

export interface Language {
    language?: string | null;
    proficiency?: string | null;
}

export interface StructuredResume {
    displayName?: string | null;
    personal_data: PersonalData;
    experiences: Experience[];
    projects?: Project[];
    skills?: Skill[];
    research_work?: ResearchWork[];
    achievements?: string[];
    education: Education[];
    publications?: Publication[];
    conferences_trainings_workshops?: ConferenceTrainingWorkshop[];
    awards?: Award[];
    extracurricular_activities?: ExtracurricularActivity[];
    languages?: Language[];
    summary?: string | null;
    extracted_keywords: string[];
}

export interface GenerateResumeRequest {
    text: string;
}

export type GenerateResumeResponse = StructuredResume;
