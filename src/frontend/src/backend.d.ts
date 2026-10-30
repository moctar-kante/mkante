import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface LocalizedText {
    en: string;
    es: string;
    fr: string;
}
export interface OngoingProject {
    id: bigint;
    title: LocalizedText;
    workplan: LocalizedText;
    displayOrder: bigint;
    objectiveStatuses: Array<ObjectiveWithStatus>;
    createdAt: bigint;
    updatedAt: bigint;
    fundingSource: LocalizedText;
    objectives: LocalizedText;
    gallery: Array<string>;
}
export interface Education {
    id: bigint;
    field: LocalizedText;
    startYear: bigint;
    endYear: bigint;
    displayOrder: bigint;
    institution: string;
    degree: LocalizedText;
    thesisHost?: string;
    notes: LocalizedText;
    location: string;
}
export interface SocialLink {
    id: bigint;
    url: string;
    displayOrder: bigint;
    platform: string;
}
export interface Language {
    id: bigint;
    displayOrder: bigint;
    name: LocalizedText;
    level: LocalizedText;
}
export interface RelevantLinkInput {
    url: string;
    title: LocalizedText;
    displayOrder: bigint;
    description?: LocalizedText;
}
export interface Profile {
    bio: LocalizedText;
    title: string;
    headline: LocalizedText;
    fullName: string;
    githubUrl?: string;
    bioShort: LocalizedText;
    email: string;
    cvDownloadUrl?: string;
    avatarUrl: string;
    orcidUrl: string;
    orcidId: string;
    location: string;
    linkedinUrl?: string;
}
export interface OngoingProjectInput {
    title: LocalizedText;
    workplan: LocalizedText;
    displayOrder: bigint;
    objectiveStatuses: Array<ObjectiveWithStatus>;
    fundingSource: LocalizedText;
    objectives: LocalizedText;
    gallery: Array<string>;
}
export interface Experience {
    id: bigint;
    title: LocalizedText;
    endDate?: string;
    displayOrder: bigint;
    tags: Array<string>;
    description: LocalizedText;
    organization: string;
    location: string;
    startDate: string;
}
export interface RelevantLink {
    id: bigint;
    url: string;
    title: LocalizedText;
    displayOrder: bigint;
    createdAt: bigint;
    description?: LocalizedText;
    updatedAt: bigint;
}
export interface Publication {
    id: bigint;
    doi: string;
    url: string;
    title: string;
    featured: boolean;
    isPreprint: boolean;
    venue: string;
    displayOrder: bigint;
    year: bigint;
    authors: string;
}
export interface ObjectiveWithStatus {
    status: ObjectiveStatus;
    objective: string;
}
export interface UserProfile {
    name: string;
}
export enum ObjectiveStatus {
    InProgress = "InProgress",
    Completed = "Completed",
    NotStarted = "NotStarted"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addGalleryImage(projectId: bigint, imageUrl: string): Promise<OngoingProject | null>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createEducation(input: Education): Promise<bigint>;
    createExperience(input: Experience): Promise<bigint>;
    createLanguage(input: Language): Promise<bigint>;
    createOngoingProject(input: OngoingProjectInput): Promise<OngoingProject>;
    createPublication(input: Publication): Promise<bigint>;
    createRelevantLink(input: RelevantLinkInput): Promise<RelevantLink>;
    createSocialLink(input: SocialLink): Promise<bigint>;
    deleteEducation(id: bigint): Promise<void>;
    deleteExperience(id: bigint): Promise<void>;
    deleteLanguage(id: bigint): Promise<void>;
    deleteOngoingProject(id: bigint): Promise<boolean>;
    deletePublication(id: bigint): Promise<void>;
    deleteRelevantLink(id: bigint): Promise<boolean>;
    deleteSocialLink(id: bigint): Promise<void>;
    getAllEducation(): Promise<Array<Education>>;
    getAllExperiences(): Promise<Array<Experience>>;
    getAllLanguages(): Promise<Array<Language>>;
    getAllOngoingProjects(): Promise<Array<OngoingProject>>;
    getAllPublications(): Promise<Array<Publication>>;
    getAllRelevantLinks(): Promise<Array<RelevantLink>>;
    getAllSocialLinks(): Promise<Array<SocialLink>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getEducationById(id: bigint): Promise<Education | null>;
    getExperienceById(id: bigint): Promise<Experience | null>;
    getLanguageById(id: bigint): Promise<Language | null>;
    getOngoingProjectById(id: bigint): Promise<OngoingProject | null>;
    getProfile(): Promise<Profile | null>;
    getPublicationById(id: bigint): Promise<Publication | null>;
    getRelevantLinkById(id: bigint): Promise<RelevantLink | null>;
    getSocialLinkById(id: bigint): Promise<SocialLink | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    removeGalleryImage(projectId: bigint, imageUrl: string): Promise<OngoingProject | null>;
    saveCallerUserProfile(userProfile: UserProfile): Promise<void>;
    seedInitialData(): Promise<void>;
    updateEducation(id: bigint, education: Education): Promise<void>;
    updateEducationOrder(order: Array<[bigint, bigint]>): Promise<void>;
    updateExperience(id: bigint, experience: Experience): Promise<void>;
    updateExperienceOrder(order: Array<[bigint, bigint]>): Promise<void>;
    updateLanguage(id: bigint, language: Language): Promise<void>;
    updateLanguageOrder(order: Array<[bigint, bigint]>): Promise<void>;
    updateOngoingProject(id: bigint, input: OngoingProjectInput): Promise<OngoingProject | null>;
    updateOngoingProjectOrder(ids: Array<bigint>): Promise<void>;
    updateProfile(newProfile: Profile): Promise<void>;
    updatePublication(id: bigint, publication: Publication): Promise<void>;
    updatePublicationOrder(order: Array<[bigint, bigint]>): Promise<void>;
    updateRelevantLink(id: bigint, input: RelevantLinkInput): Promise<RelevantLink | null>;
    updateRelevantLinksOrder(ids: Array<bigint>): Promise<boolean>;
    updateSocialLink(id: bigint, link: SocialLink): Promise<void>;
    updateSocialLinksOrder(order: Array<[bigint, bigint]>): Promise<void>;
}
