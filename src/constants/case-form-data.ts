export const CLINIC_CONFIG = {
  nameBangla: 'শান্তি হোমিও কেয়ার',
  nameEnglish: 'Shanti Homeo Care',
  doctorNameBangla: 'ডাঃ মোঃ ওয়ালিউল বারী',
  doctorNameEnglish: 'Dr. Md. Waliul Bari',
  doctorDesignationBangla: 'পরীক্ষা নিয়ন্ত্রক (ভারপ্রাপ্ত), আশা ইউনিভার্সিটি বাংলাদেশ',
  doctorDesignationEnglish: 'Controller in-charge of Exams, ASA University Bangladesh',
  doctorRole: 'প্রধান হোমিওপ্যাথিক কনসালট্যান্ট',
  address: 'ডি৬, বসতী প্রভাতী, ১২ রিং রোড, শ্যামলী, ঢাকা - ১২০৭।',
  phone: '০১৫৫২৪০৬৭০৭',
  phoneRaw: '+8801552406707',
  whatsappUrl: 'https://wa.me/8801552406707',
  consultationHours: 'শনিবার - বৃহস্পতিবার: বিকাল ৪টা হতে রাত ৯টা (শুক্রবার বন্ধ)',
  disclaimerBengali:
    'আপনার স্বাস্থ্যসংক্রান্ত তথ্য যতটা সম্ভব সঠিক ও সম্পূর্ণভাবে প্রদান করুন। এতে চিকিৎসক আপনার সমস্যা, উপসর্গ ও রোগের ইতিহাস ভালোভাবে বুঝতে পারবেন, ইন শা আল্লাহ।',
};

// Bangladesh 64 Districts in Bengali
export const BD_DISTRICTS = [
  'ঢাকা', 'চট্টগ্রাম', 'রাজশাহী', 'খুলনা', 'বরিশাল', 'সিলেট', 'রংপুর', 'ময়মনসিংহ',
  'কুমিল্লা', 'গাজীপুর', 'নারায়ণগঞ্জ', 'বগুড়া', 'দিনাজপুর', 'টাঙ্গাইল', 'পাবনা',
  'নোয়াখালী', 'ফরিদপুর', 'কক্সবাজার', 'যশোর', 'ব্রাহ্মণবাড়িয়া', 'কুষ্টিয়া',
  'বাগেরহাট', 'বান্দরবান', 'বরগুনা', 'ভোলা', 'চাঁদপুর', 'চাঁপাইনবাবগঞ্জ', 'চুয়াডাঙ্গা',
  'ফেনী', 'গাইবান্ধা', 'গোপালগঞ্জ', 'হবিগঞ্জ', 'জামালপুর', 'জয়পুরহাট', 'ঝালকাঠি',
  'ঝিনাইদহ', 'খাগড়াছড়ি', 'কিশোরগঞ্জ', 'কুড়িগ্রাম',
  'লক্ষ্মীপুর', 'লালমনিরহাট', 'মাদারীপুর', 'মাগুরা', 'মানিকগঞ্জ', 'মেহেরপুর',
  'মৌলভীবাজার', 'মুন্সীগঞ্জ', 'নওগাঁ', 'নড়াইল', 'নাটোর', 'নেত্রকোণা', 'নীলফামারী',
  'পঞ্চগড়', 'পটুয়াখালী', 'পিরোজপুর', 'রাজবাড়ী', 'রাঙামাটি', 'শরীয়তপুর', 'সাতক্ষীরা',
  'সিরাজগঞ্জ', 'সুনামগঞ্জ', 'ঠাকুরগাঁও'
] as const;

export interface SymptomItem {
  id: string;
  label: string;
  category: 'urinary' | 'bowel' | 'rectal';
  isUrgentRisk?: boolean;
  descriptionHint?: string;
}

// Complete 31 items for Section 3 (Question 12)
export const URINARY_BOWEL_SYMPTOMS: SymptomItem[] = [
  { id: 'symptom_01', label: 'ঘনঘন প্রস্রাব হয়', category: 'urinary', descriptionHint: 'স্বাভাবিকের চেয়ে বারবার প্রস্রাবের বেগ হওয়া' },
  { id: 'symptom_02', label: 'প্রস্রাব খুবই কম বা বন্ধপ্রায়', category: 'urinary', isUrgentRisk: true, descriptionHint: '২৪ ঘণ্টায় প্রস্রাবের পরিমাণ আশঙ্কাজনকভাবে কমে যাওয়া' },
  { id: 'symptom_03', label: 'প্রস্রাবের গতি দুর্বল', category: 'urinary', descriptionHint: 'ধার কম থাকা বা ফোঁটা ফোঁটা পড়া' },
  { id: 'symptom_04', label: 'প্রস্রাব শুরু হতে সময় নেয়', category: 'urinary', descriptionHint: 'বেগ থাকলেও প্রস্রাব নামতে দীর্ঘক্ষণ অপেক্ষা করা' },
  { id: 'symptom_05', label: 'প্রস্রাবের গন্ধ কড়া/ঝাঝালো', category: 'urinary', descriptionHint: 'অতিরিক্ত ঝাঁঝাল অথবা অস্বাভাবিক দুর্গন্ধ' },
  { id: 'symptom_06', label: 'প্রস্রাব শীতল/ঠান্ডা অনুভূত হয়', category: 'urinary', descriptionHint: 'প্রস্রাব ত্যাগের সময় স্বাভাবিকের চেয়ে ঠান্ডা লাগা' },
  { id: 'symptom_07', label: 'পায়খানা শক্ত/কোষ্ঠকাঠিন্য', category: 'bowel', descriptionHint: 'নিয়মিত শক্ত মল নির্গমন' },
  { id: 'symptom_08', label: 'কোষ্ঠবদ্ধতা (পায়খানা ক্লিয়ার হয় না)', category: 'bowel', descriptionHint: 'টয়লেটের পরও মনে হয় কিছু রয়ে গেছে' },
  { id: 'symptom_09', label: 'কোন বেগ ছাড়াই পায়খানা দীর্ঘসময় (কয়েকদিন) পেটে জমে থাকে', category: 'bowel', descriptionHint: 'টয়লেটের অনুভূতি ছাড়াই ২-৪ দিন কেটে যায়' },
  { id: 'symptom_10', label: 'পায়খানা প্রথমে শক্ত পরে নরম', category: 'bowel', descriptionHint: 'প্রথম অংশ অত্যন্ত শক্ত, পরবর্তী অংশ পাতলা' },
  { id: 'symptom_11', label: 'পায়খানা নরম কিন্তু সহজে বের হতে চায় না', category: 'bowel', descriptionHint: 'মল নরম থাকা সত্ত্বেও প্রচণ্ড কুন্থন বা বেগ দিতে হয়' },
  { id: 'symptom_12', label: 'পায়খানা ছাগল/ভেড়ার লেদির মত গোল গোল', category: 'bowel', descriptionHint: 'ছোট ছোট শুষ্ক গুলির মতো খণ্ড খণ্ড মল' },
  { id: 'symptom_13', label: 'পায়খানা এত শুষ্ক/শক্ত যে আঙ্গুল বা কোন কিছুর সাহায্যে বের করতে হয়', category: 'bowel', descriptionHint: 'চরম কাঠিন্যের কারণে যান্ত্রিক সহায়তা নিতে হয়' },
  { id: 'symptom_14', label: 'কিছুদিন কোষ্ঠবদ্ধতা আবার কিছুদিন ডায়রিয়া', category: 'bowel', descriptionHint: 'পর্যায়ক্রমিক কোষ্ঠকাঠিন্য ও পাতলা পায়খানা (IBS লক্ষণ)' },
  { id: 'symptom_15', label: 'পায়খানার সাথে আম যায়', category: 'bowel', descriptionHint: 'পিচ্ছিল মিউকাস বা আমাশয় নির্গমন' },
  { id: 'symptom_16', label: 'খাওয়ার সাথে সাথেই টয়লেটে যেতে হয়', category: 'bowel', descriptionHint: 'খাবার গ্রহণের পর পরই পেটে মোচড় দিয়ে বেগ আসা' },
  { id: 'symptom_17', label: 'পায়খানায় ভীষণ দুর্গন্ধ', category: 'bowel', descriptionHint: 'অসহনীয় কটু গন্ধ' },
  { id: 'symptom_18', label: 'এনাল ফিসার (মলদ্বার চিরে যাওয়া)', category: 'rectal', descriptionHint: 'মলদ্বারে চিড় ধরা বা ক্ষতজনিত তীব্র জ্বালাপোড়া' },
  { id: 'symptom_19', label: 'ফিস্টুলা (ভগন্দর)', category: 'rectal', descriptionHint: 'মলদ্বারের পাশে নালী বা পুঁজ-পানি ঝরা' },
  { id: 'symptom_20', label: 'অর্শ/পাইলস', category: 'rectal', descriptionHint: 'মলদ্বারে শিরাপোলা বা বলি' },
  { id: 'symptom_21', label: 'মলদ্বারে রক্ত যায়', category: 'rectal', isUrgentRisk: true, descriptionHint: 'টাটকা লাল রক্ত অথবা কালো রক্ত নির্গমন' },
  { id: 'symptom_22', label: 'রক্ত যায় পায়খানার সময়', category: 'rectal', isUrgentRisk: true, descriptionHint: 'মলত্যাগের সাথে ফোঁটা ফোঁটা রক্ত পড়া' },
  { id: 'symptom_23', label: 'রক্ত যায় পায়খানার পরে', category: 'rectal', isUrgentRisk: true, descriptionHint: 'মলত্যাগ শেষ হওয়ার পর পিচকারির মতো রক্ত আসা' },
  { id: 'symptom_24', label: 'পায়খানা শক্ত হলে রক্ত যাওয়া বৃদ্ধি পায়', category: 'rectal', descriptionHint: 'কোষ্ঠকাঠিন্যের সময়ে রক্তপাতের তীব্রতা বাড়ে' },
  { id: 'symptom_25', label: 'মলদ্বারে চুলকায়', category: 'rectal', descriptionHint: 'মলদ্বারে তীব্র অস্বস্তিকর চুলকানি' },
  { id: 'symptom_26', label: 'চুলকানিমুক্ত পাইলস', category: 'rectal', descriptionHint: 'পাইলস আছে কিন্তু কোনো চুলকানি নেই' },
  { id: 'symptom_27', label: 'পাইলসে ব্যথা করে', category: 'rectal', descriptionHint: 'বসা, হাঁটা বা শোওয়ার সময়ে সার্বক্ষণিক টনটন ব্যথা' },
  { id: 'symptom_28', label: 'পাইলসের বলি মলদ্বারের ভিতর দিকে', category: 'rectal', descriptionHint: 'অভ্যন্তরীণ বা ইন্টারনাল অর্শ' },
  { id: 'symptom_29', label: 'পাইলসের বলি মলদ্বারের বাহিরে', category: 'rectal', descriptionHint: 'বাহ্যিক বা এক্সটারনাল অর্শবলি' },
  { id: 'symptom_30', label: 'পায়খানার সময় অর্শবলি বের হয়ে যায়', category: 'rectal', descriptionHint: 'মলত্যাগের সময় বলি নেমে আসে এবং পরে চেপে ঢোকাতে হয় বা আপনাআপনি ঢোকে' },
  { id: 'symptom_31', label: 'পাইলস আঙ্গুরের থোকার ন্যায়', category: 'rectal', descriptionHint: 'মলদ্বারে একাধিক স্ফীত নীলাভ-লাল মাংসপিণ্ডের গুচ্ছ' },
];

export const CATEGORY_LABELS: Record<string, string> = {
  urinary: '💧 প্রস্রাব সংক্রান্ত লক্ষণসমূহ (১-৬)',
  bowel: '🌿 পায়খানা ও পরিপাক সংক্রান্ত লক্ষণসমূহ (৭-১৭)',
  rectal: '🩺 মলদ্বার, ফিসার ও পাইলস সংক্রান্ত লক্ষণসমূহ (১৮-৩১)',
};

// Section 4: Aggravation & Amelioration Cards (হ্রাস-বৃদ্ধি)
export const MODALITY_CARDS = [
  {
    key: 'time_of_day',
    title: '১. দিনের বিভিন্ন সময় (Time of day)',
    icon: 'Clock',
    prompt: 'কোন সমস্যা কখন বাড়ে বা কমে? সকাল, দুপুর, বিকাল, সন্ধ্যা, রাত, দিন, মধ্যরাতের পূর্বে বা পরে—সমস্যার নামসহ লিখুন।',
    placeholderAgg: 'উদাহরণ: ভোর ৪টায় পেটের মোচড় বাড়ে, রাতে শুলে কাশি বাড়ে...',
    placeholderAme: 'উদাহরণ: সন্ধ্যার পর বা সকালে ঘুম থেকে উঠলে আরাম লাগে...',
  },
  {
    key: 'movement_posture',
    title: '২. শারীরিক অবস্থা, নড়াচড়া ও ভঙ্গিমা (Movement & Posture)',
    icon: 'Activity',
    prompt: 'কোন সমস্যা বসলে, দাঁড়ালে, হাঁটলে, শয়ন করলে, নড়াচড়া করলে, পরিশ্রমে বা বিশ্রামে বাড়ে অথবা কমে? বিস্তারিত লিখুন।',
    placeholderAgg: 'উদাহরণ: একটানা দাঁড়িয়ে থাকলে মলদ্বারে চাপ ও ব্যথা বাড়ে...',
    placeholderAme: 'উদাহরণ: স্থির হয়ে শুয়ে থাকলে বা বিশ্রাম নিলে স্বস্তি মেলে...',
  },
  {
    key: 'food_drinks',
    title: '৩. খাবার ও পানীয় (Food & Drinks)',
    icon: 'Coffee',
    prompt: 'কোন সমস্যা কোন খাবার বা পানীয় খেলে বাড়ে অথবা কমে? কী খাবার, কখন এবং কী ধরনের পরিবর্তন হয়, লিখুন।',
    placeholderAgg: 'উদাহরণ: গরুর মাংস, তৈলাক্ত খাবার বা চা খেলে অ্যাসিডিটি ও রক্তপাত বাড়ে...',
    placeholderAme: 'উদাহরণ: কুসুম গরম পানি বা শরবত খেলে পেটের অস্বস্তি কমে...',
  },
  {
    key: 'weather_season',
    title: '৪. আবহাওয়া ও ঋতু (Weather & Seasons)',
    icon: 'CloudRain',
    prompt: 'কোন সমস্যা কোন আবহাওয়া বা ঋতুতে বাড়ে অথবা কমে? বিস্তারিত লিখুন।',
    placeholderAgg: 'উদাহরণ: বর্ষাকালে আর্দ্রতায় চুলকানি ও গ্যাস বৃদ্ধি পায়...',
    placeholderAme: 'উদাহরণ: শীতের শুষ্ক আবহাওয়ায় শরীর হালকা লাগে...',
  },
  {
    key: 'warmth',
    title: '৫. তাপ বা গরমের প্রভাব (Warmth)',
    icon: 'Sun',
    prompt: 'গরম প্রয়োগ করলে আপনার কোন সমস্যা বাড়ে বা কমে? কীভাবে আরাম বা অস্বস্তি হয়, লিখুন।',
    placeholderAgg: 'উদাহরণ: গরম আবহাওয়ায় বা রোদে গেলে মাথা ঘোরা ও পাইলসের চুলকানি বাড়ে...',
    placeholderAme: 'উদাহরণ: গরম পানির সেঁক দিলে মলদ্বারের ব্যথা অনেক কমে...',
  },
  {
    key: 'cold',
    title: '৬. ঠান্ডা বা শীতলতার প্রভাব (Cold)',
    icon: 'Snowflake',
    prompt: 'ঠান্ডা প্রয়োগ করলে আপনার কোন সমস্যা বাড়ে বা কমে? কীভাবে আরাম বা অস্বস্তি হয়, লিখুন।',
    placeholderAgg: 'উদাহরণ: ঠান্ডা বাতাসে শ্বাসকষ্ট বাড়ে, ঠান্ডা পানি খেলে কাশি হয়...',
    placeholderAme: 'উদাহরণ: বরফ বা ঠান্ডা পানি দিলে মলদ্বারের জ্বালাপোড়া শান্ত হয়...',
  },
] as const;

export const CLINICAL_SAFETY_RULES = {
  warningTitle: 'জরুরি স্বাস্থ্য সতর্কবার্তা (Emergency Notice)',
  warningMessageBengali:
    'আপনার নির্বাচিত তথ্যে কিছু উপসর্গ (যেমন: প্রস্রাবের চরম সংকট বা মলদ্বারে রক্তপাত) জরুরি স্বাস্থ্য সমস্যার লক্ষণ হতে পারে। শান্তি হোমিও কেয়ারের অনলাইন কেস পর্যালোচনার অপেক্ষা না করে অবিলম্বে নিকটস্থ হাসপাতালের জরুরি বিভাগ বা সরাসরি বিশেষজ্ঞ চিকিৎসকের শরণাপন্ন হওয়ার পরামর্শ দেওয়া হচ্ছে।',
};
