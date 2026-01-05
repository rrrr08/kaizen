// Experience Types
export interface ExperienceCategory {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  image: string;
  whoFor: string;
  problemsSolved: string[];
  gamesFormats: string[];
  imageGallery: string[];
  testimonials: ExperienceTestimonial[];
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExperienceTestimonial {
  id: string;
  author: string;
  text: string;
  occasion?: string;
  image?: string;
}

export interface ExperienceEnquiry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  categoryId: string;
  categoryName: string;
  occasionDetails: string;
  audienceSize: string;
  preferredDateRange: string;
  budgetRange: string;
  specialRequirements?: string;
  message?: string;
  status: EnquiryStatus;
  internalNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type EnquiryStatus =
  | 'new'
  | 'contacted'
  | 'in_discussion'
  | 'confirmed'
  | 'completed'
  | 'archived';

export interface ExperienceCaseStudy {
  id: string;
  enquiryId: string;
  categoryId: string;
  title: string;
  description: string;
  photos: string[];
  testimonial: ExperienceTestimonial;
  published: boolean;
  createdAt: Date;
}