import { z } from 'zod';

// Phone Number Regex for Bangladesh (013, 014, 015, 016, 017, 018, 019)
const bdPhoneRegex = /^(?:\+88|88)?(01[3-9]\d{8})$/;

export const CaseTakingFormSchema = z.object({
  // Section 1: Patient Information (রোগীর ব্যক্তিগত তথ্য)
  fullName: z
    .string()
    .min(2, { message: 'রোগীর নাম কমপক্ষে ২ অক্ষরের হতে হবে।' })
    .max(100, { message: 'রোগীর নাম অতিরিক্ত দীর্ঘ হতে পারবে না।' }),
  gender: z.enum(['male', 'female', 'other'] as const),
  occupation: z.string().optional(),
  age: z.coerce
    .number()
    .int({ message: 'বয়স পূর্ণসংখ্যা হতে হবে।' })
    .min(0, { message: 'বয়স ০ এর কম হতে পারে না।' })
    .max(125, { message: 'অনুগ্রহ করে সঠিক বয়স লিখুন।' }),
  address: z.string().min(4, { message: 'অনুগ্রহ করে পূর্ণাঙ্গ ঠিকানা প্রদান করুন।' }),
  district: z.string().min(2, { message: 'অনুগ্রহ করে আপনার জেলা নির্বাচন করুন।' }),
  contactNumber: z.string().regex(bdPhoneRegex, {
    message: 'সঠিক বাংলাদেশি মোবাইল নম্বর দিন (যেমন: 01712345678 বা 01552406707)।',
  }),

  // Section 2: General Questionnaire (সাধারণ প্রশ্নাবলি)
  primaryComplaint: z
    .string()
    .min(4, { message: 'আপনার প্রধান সমস্যাটি অনুগ্রহ করে বিস্তারিত লিখুন।' }),
  associatedComplaints: z.string().optional(),
  onsetDuration: z.string().optional(),
  diseaseWorries: z.string().optional(),
  dailyThoughts: z.string().optional(),
  suspectedCause: z.string().optional(),
  foodCravings: z.string().optional(),
  foodAversions: z.string().optional(),
  temperamentMood: z.string().optional(),
  sleepPattern: z.string().optional(),
  fears: z.string().optional(),

  // Section 3: Checkboxes (লক্ষণসমূহ - ৩১টি আইটেম)
  selectedSymptoms: z.array(z.string()).default([]),
  symptomClarifications: z.record(z.string(), z.string()).optional(),

  // Section 4: Modality Cards (হ্রাস-বৃদ্ধি)
  modalities: z.object({
    time_of_day: z.object({
      aggravation: z.string().optional(),
      amelioration: z.string().optional(),
    }),
    movement_posture: z.object({
      aggravation: z.string().optional(),
      amelioration: z.string().optional(),
    }),
    food_drinks: z.object({
      aggravation: z.string().optional(),
      amelioration: z.string().optional(),
    }),
    weather_season: z.object({
      aggravation: z.string().optional(),
      amelioration: z.string().optional(),
    }),
    warmth: z.object({
      aggravation: z.string().optional(),
      amelioration: z.string().optional(),
    }),
    cold: z.object({
      aggravation: z.string().optional(),
      amelioration: z.string().optional(),
    }),
  }),

  // Section 5: Additional Info (অতিরিক্ত তথ্য ও ডিজিটাল সম্মতি)
  additionalNotes: z.string().optional(),
  consentGiven: z.boolean().refine((val) => val === true, {
    message: 'কেস হিস্ট্রি জমা দিতে হলে চিকিৎসকের নীতিমালা ও তথ্যের সত্যতায় সম্মতি আবশ্যক।',
  }),
});

export type CaseTakingFormData = z.infer<typeof CaseTakingFormSchema>;
