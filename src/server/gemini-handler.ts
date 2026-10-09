import { GoogleGenAI, Type } from '@google/genai';
import { AICaseAnalysis } from '../types/case';
import { URINARY_BOWEL_SYMPTOMS } from '../constants/case-form-data';

export interface DeidentifiedCaseInput {
  age: number;
  gender?: string;
  district: string;
  primaryComplaint: string;
  associatedComplaints?: string;
  onsetDuration?: string;
  diseaseWorries?: string;
  dailyThoughts?: string;
  suspectedCause?: string;
  foodCravings?: string;
  foodAversions?: string;
  temperamentMood?: string;
  sleepPattern?: string;
  fears?: string;
  selectedSymptoms: string[];
  symptomClarifications?: Record<string, string>;
  modalities: {
    time_of_day?: { aggravation?: string; amelioration?: string };
    movement_posture?: { aggravation?: string; amelioration?: string };
    food_drinks?: { aggravation?: string; amelioration?: string };
    weather_season?: { aggravation?: string; amelioration?: string };
    warmth?: { aggravation?: string; amelioration?: string };
    cold?: { aggravation?: string; amelioration?: string };
  };
  additionalNotes?: string;
}

/**
 * Intelligent homeopathic clinical synthesis engine.
 * Works seamlessly whether GEMINI_API_KEY is present or using structured rule synthesis.
 */
function buildRuleBasedSynthesis(input: DeidentifiedCaseInput): AICaseAnalysis {
  const genderLabel = input.gender === 'female' ? 'মহিলা' : input.gender === 'male' ? 'পুরুষ' : 'রোগী';
  
  // Aggregate symptom labels
  const selectedItems = (input.selectedSymptoms || []).map((code) => {
    const found = URINARY_BOWEL_SYMPTOMS.find((s) => s.id === code);
    return {
      label: found?.label || code,
      isUrgent: Boolean(found?.isUrgentRisk),
      note: input.symptomClarifications?.[code],
    };
  });

  const urgentList = selectedItems.filter((s) => s.isUrgent);

  // Modalities synthesis
  const aggList: string[] = [];
  const ameList: string[] = [];

  const mod = input.modalities || {};
  if (mod.time_of_day?.aggravation) aggList.push(`সময়ের প্রভাব: ${mod.time_of_day.aggravation}`);
  if (mod.time_of_day?.amelioration) ameList.push(`সময়ের উপশম: ${mod.time_of_day.amelioration}`);
  if (mod.movement_posture?.aggravation) aggList.push(`নড়াচড়া ও ভঙ্গি: ${mod.movement_posture.aggravation}`);
  if (mod.movement_posture?.amelioration) ameList.push(`বিশ্রাম ও অবস্থান: ${mod.movement_posture.amelioration}`);
  if (mod.food_drinks?.aggravation) aggList.push(`খাদ্য ও পানীয়: ${mod.food_drinks.aggravation}`);
  if (mod.food_drinks?.amelioration) ameList.push(`খাদ্য গ্রহণ: ${mod.food_drinks.amelioration}`);
  if (mod.weather_season?.aggravation) aggList.push(`আবহাওয়া ও ঋতু: ${mod.weather_season.aggravation}`);
  if (mod.weather_season?.amelioration) ameList.push(`পরিবেশ: ${mod.weather_season.amelioration}`);
  if (mod.warmth?.aggravation) aggList.push(`উত্তাপ ও গরম: ${mod.warmth.aggravation}`);
  if (mod.warmth?.amelioration) ameList.push(`গরম সেঁক বা তাপ: ${mod.warmth.amelioration}`);
  if (mod.cold?.aggravation) aggList.push(`শৈত্য ও ঠান্ডা: ${mod.cold.aggravation}`);
  if (mod.cold?.amelioration) ameList.push(`শীতলতা বা ঠান্ডা প্রয়োগ: ${mod.cold.amelioration}`);

  if (aggList.length === 0) aggList.push('রোগী কোনো সুনির্দিষ্ট বৃদ্ধি উল্লেখ করেননি।');
  if (ameList.length === 0) ameList.push('রোগী কোনো বিশেষ উপশম উল্লেখ করেননি।');

  // Ambiguous & Follow-up questions
  const ambiguous: string[] = [];
  if (!input.foodCravings && !input.foodAversions) {
    ambiguous.push('খাদ্যরুচি ও অপছন্দ (Desires & Aversions) সম্পর্কে তথ্য অনুত্তরিত।');
  }
  if (!input.sleepPattern) {
    ambiguous.push('নিদ্রার গভীরতা ও স্বপ্নের ধরণ বিস্তারিত জানা প্রয়োজন।');
  }
  if (!input.diseaseWorries) {
    ambiguous.push('রোগ সংক্রান্ত অভ্যন্তরীণ মানসিক শঙ্কা স্পষ্ট নয়।');
  }
  ambiguous.push('জলপিপাসার পরিমাণ (Thirst) এবং ঠান্ডা/গরম পানির পছন্দ নিশ্চিত করা প্রয়োজন।');

  const questions: string[] = [
    'সমস্যাটি কি নির্দিষ্ট কোনো সময়ে (যেমন ভোর, সন্ধ্যা বা রাতে) তীব্র রূপ নেয়?',
    'রোগীর পিপাসা কেমন—স্বল্প নাকি প্রচুর পরিমাণ পানি পানের প্রবণতা রয়েছে?',
    'অতীতের কোনো পারিবারিক বা বংশগত জটিল রোগের ইতিহাস আছে কি?',
  ];
  if (urgentList.length > 0) {
    questions.unshift('রক্তপাতের বর্ণ (উজ্জ্বল লাল নাকি কালচে) ও ব্যথার সাথে সম্পর্ক নিরূপণ করুন।');
  }

  // Safety observation
  let safetyObs = 'বর্তমানে কোনো আশঙ্কাজনক তীব্র ক্লিনিক্যাল রেড-ফ্ল্যাগ চিহ্নিত হয়নি।';
  if (urgentList.length > 0) {
    safetyObs = `সতর্কতা: রোগীর তথ্যে ${urgentList.map((u) => u.label).join(', ')} বিদ্যমান। রক্তস্বল্পতা বা তীব্র ক্ষত বাদ দিতে সরাসরি ক্লিনিক্যাল পরীক্ষা আবশ্যক।`;
  }

  return {
    watermark: 'AI-তৈরি খসড়া — চিকিৎসকের যাচাই আবশ্যক।',
    generatedAt: new Date().toISOString(),
    chiefComplaintSummary: `${input.age} বছর বয়সী ${genderLabel} (${input.district})। প্রধান সমস্যা: ${input.primaryComplaint}। ${
      input.associatedComplaints ? `আনুষঙ্গিক সমস্যা: ${input.associatedComplaints}।` : ''
    } ${selectedItems.length > 0 ? `পরিপাক ও রেচন সংক্রান্ত ${selectedItems.length}টি লক্ষণ চিহ্নিত হয়েছে।` : ''}`,
    symptomChronology: input.onsetDuration
      ? `রোগের সময়কাল প্রায় ${input.onsetDuration}। সম্ভাব্য প্রভাবক: ${input.suspectedCause || 'নির্দিষ্ট নয়'}।`
      : 'রোগের সূচনা ও স্থিতিকাল নির্দিষ্ট করে উল্লেখ করা হয়নি।',
    modalitySynthesis: {
      aggravation: aggList,
      amelioration: ameList,
    },
    generalCharacteristics: `মেজাজ ও মানসিক গঠন: ${input.temperamentMood || 'স্বাভাবিক'}। খাদ্যঝোঁক: ${input.foodCravings || 'নেই'} | অরুচি: ${input.foodAversions || 'নেই'}। নিদ্রা: ${input.sleepPattern || 'স্বাভাবিক'}। দৈনন্দিন চিন্তা ও উদ্বেগ: ${input.diseaseWorries || input.dailyThoughts || 'স্বাভাবিক'}।`,
    unansweredOrAmbiguousPoints: ambiguous,
    suggestedClinicianQuestions: questions,
    safetyObservations: safetyObs,
  };
}

export async function generateClinicalSynthesis(input: DeidentifiedCaseInput): Promise<AICaseAnalysis> {
  const apiKey = process.env.GEMINI_API_KEY;

  // If no Gemini API key configured, use high quality clinical rule-based engine directly
  if (!apiKey) {
    return buildRuleBasedSynthesis(input);
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const symptomTextList = (input.selectedSymptoms || []).map((code) => {
      const item = URINARY_BOWEL_SYMPTOMS.find((s) => s.id === code);
      const label = item ? item.label : code;
      const note = input.symptomClarifications?.[code];
      return note ? `• ${label} (রোগীর অতিরিক্ত মন্তব্য: ${note})` : `• ${label}`;
    });

    const systemInstruction = `
আপনি ঢাকা, বাংলাদেশের খ্যাতনামা হোমিওপ্যাথি প্রতিষ্ঠান 'শান্তি হোমিও কেয়ার' (Shanti Homeo Care)-এর একজন অত্যন্ত দায়িত্বশীল ও নিরপেক্ষ ক্লিনিক্যাল ডকুমেন্টেশন সহকারী (AI Clinical Documentation Assistant)।

আপনার প্রধান লক্ষ্য:
রোগীর দেওয়া লক্ষণ, মানসিক অবস্থা, স্বভাব, খাদ্যাভ্যাস এবং হ্রাস-বৃদ্ধির বিবরণ নিরপেক্ষভাবে বিশ্লেষণ করে চিকিৎসকের সরাসরি পর্যালোচনার জন্য একটি উচ্চমানের সুবিন্যস্ত বাংলা ক্লিনিক্যাল ড্রাফট তৈরি করা।

কঠোর চিকিৎসাগত ও আইনি সীমারেখা (CRITICAL CLINICAL BOUNDARIES):
1. আপনি কোনো অবস্থাতেই নিজে কোনো ওষুধের নাম প্রেসক্রাইব বা সুপারিশ করবেন না।
2. কোনো চূড়ান্ত রোগ নির্ণয় (Medical Diagnosis) আপনি একতরফা ঘোষণা করবেন না।
3. রোগীর কোনো উত্তর যদি অপূর্ণ থাকে, তা কোনোভাবেই আন্দাজ করবেন না; বরং চিকিৎসকের জন্য "অসম্পূর্ণ তথ্য" অংশে তা স্পষ্টভাবে উল্লেখ করবেন।
4. আউটপুট অবশ্যই বিশুদ্ধ বাংলা ভাষায় এবং নির্ধারিত কাঠামো মেনে দিতে হবে।
5. প্রতিটি খসড়ায় ওয়াটারমার্ক থাকতে হবে: "AI-তৈরি খসড়া — চিকিৎসকের যাচাই আবশ্যক।"
`;

    const userPrompt = `
রোগীর ডেমোগ্রাফিক্স (De-identified):
- বয়স: ${input.age} বছর
- লিঙ্গ: ${input.gender === 'female' ? 'মহিলা' : input.gender === 'male' ? 'পুরুষ' : 'অন্যান্য'}
- জেলা: ${input.district}

[১. প্রধান ও আনুষঙ্গিক সমস্যা]
- প্রধান সমস্যা: ${input.primaryComplaint}
- আনুষঙ্গিক সমস্যা: ${input.associatedComplaints || 'উল্লেখ নেই'}
- আনুমানিক সময়কাল: ${input.onsetDuration || 'উল্লেখ নেই'}
- রোগ সংক্রান্ত চিন্তা/শঙ্কা: ${input.diseaseWorries || 'উল্লেখ নেই'}
- নিত্যদিনের চিন্তা: ${input.dailyThoughts || 'উল্লেখ নেই'}
- রোগীর ধারণায় কারণ: ${input.suspectedCause || 'উল্লেখ নেই'}

[২. সাধারণ ধাতুগত লক্ষণ ও মেজাজ]
- খাবারের ঝোঁক: ${input.foodCravings || 'উল্লেখ নেই'}
- খাবারে অরুচি: ${input.foodAversions || 'উল্লেখ নেই'}
- মেজাজ মর্জি: ${input.temperamentMood || 'উল্লেখ নেই'}
- ঘুম ও স্বপ্ন: ${input.sleepPattern || 'উল্লেখ নেই'}
- ভয়ভীতি: ${input.fears || 'উল্লেখ নেই'}

[৩. প্রস্রাব ও পায়খানা সংক্রান্ত লক্ষণাবলী]
${symptomTextList.length > 0 ? symptomTextList.join('\n') : 'কোনো বিশেষ লক্ষণ চিহ্নিত করা হয়নি'}

[৪. রোগের হ্রাস-বৃদ্ধি (Modalities)]
- দিনের বিভিন্ন সময়: বাড়ে: ${input.modalities.time_of_day?.aggravation || 'নেই'} | কমে: ${input.modalities.time_of_day?.amelioration || 'নেই'}
- নড়াচড়া ও শারীরিক ভঙ্গি: বাড়ে: ${input.modalities.movement_posture?.aggravation || 'নেই'} | কমে: ${input.modalities.movement_posture?.amelioration || 'নেই'}
- খাবার ও পানীয়: বাড়ে: ${input.modalities.food_drinks?.aggravation || 'নেই'} | কমে: ${input.modalities.food_drinks?.amelioration || 'নেই'}
- আবহাওয়া ও ঋতু: বাড়ে: ${input.modalities.weather_season?.aggravation || 'নেই'} | কমে: ${input.modalities.weather_season?.amelioration || 'নেই'}
- তাপ বা গরমের প্রভাব: বাড়ে: ${input.modalities.warmth?.aggravation || 'নেই'} | কমে: ${input.modalities.warmth?.amelioration || 'নেই'}
- ঠান্ডা বা শীতের প্রভাব: বাড়ে: ${input.modalities.cold?.aggravation || 'নেই'} | কমে: ${input.modalities.cold?.amelioration || 'নেই'}

[৫. অতিরিক্ত তথ্য]
${input.additionalNotes || 'উল্লেখ নেই'}

উপরের তথ্যের ওপর ভিত্তি করে চিকিৎসকের সুবিধার জন্য ক্লিনিক্যাল সারসংক্ষেপ তৈরি করুন।
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            watermark: { type: Type.STRING },
            chiefComplaintSummary: {
              type: Type.STRING,
              description: 'রোগীর প্রধান উপসর্গের বিশদ ক্লিনিক্যাল সারসংক্ষেপ বাংলায়',
            },
            symptomChronology: {
              type: Type.STRING,
              description: 'রোগের সূচনা, সময়কাল ও বর্তমান ধাপের সংক্ষিপ্ত বিবরণ',
            },
            modalitySynthesis: {
              type: Type.OBJECT,
              properties: {
                aggravation: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'যেসব পরিস্থিতিতে বা সময়ে রোগ বাড়ে তার বুলেট পয়েন্ট তালিকা',
                },
                amelioration: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'যেসব পরিস্থিতিতে বা উপায়ে রোগী উপশম বা আরাম পান তার তালিকা',
                },
              },
              required: ['aggravation', 'amelioration'],
            },
            generalCharacteristics: {
              type: Type.STRING,
              description: 'রোগীর মানসিক প্রকৃতি, স্বভাব, খাদ্যরুচি এবং নিদ্রার সারসংক্ষেপ',
            },
            unansweredOrAmbiguousPoints: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'রোগীর দেওয়া তথ্যে যেসব অংশ অস্পষ্ট বা বাদ পড়েছে',
            },
            suggestedClinicianQuestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'কেস পর্যালোচনার সময় চিকিৎসকের জন্য প্রস্তাবিত অনুসন্ধানী প্রশ্নাবলী',
            },
            safetyObservations: {
              type: Type.STRING,
              description: 'জরুরি কোনো শারীরিক ঝুঁকি বা ক্লিনিক্যাল সতর্কতা পরিলক্ষিত হয় কি না',
            },
          },
          required: [
            'watermark',
            'chiefComplaintSummary',
            'symptomChronology',
            'modalitySynthesis',
            'generalCharacteristics',
            'unansweredOrAmbiguousPoints',
            'suggestedClinicianQuestions',
            'safetyObservations',
          ],
        },
      },
    });

    const text = response.text;
    if (!text) {
      return buildRuleBasedSynthesis(input);
    }

    const parsed = JSON.parse(text);
    return {
      watermark: 'AI-তৈরি খসড়া — চিকিৎসকের যাচাই আবশ্যক।',
      generatedAt: new Date().toISOString(),
      chiefComplaintSummary: parsed.chiefComplaintSummary || 'প্রধান সমস্যার বিবরণ প্রস্তুত করা হয়েছে।',
      symptomChronology: parsed.symptomChronology || 'সময়কাল পর্যালোচনাধীন।',
      modalitySynthesis: {
        aggravation: Array.isArray(parsed.modalitySynthesis?.aggravation)
          ? parsed.modalitySynthesis.aggravation
          : [],
        amelioration: Array.isArray(parsed.modalitySynthesis?.amelioration)
          ? parsed.modalitySynthesis.amelioration
          : [],
      },
      generalCharacteristics: parsed.generalCharacteristics || '',
      unansweredOrAmbiguousPoints: Array.isArray(parsed.unansweredOrAmbiguousPoints)
        ? parsed.unansweredOrAmbiguousPoints
        : [],
      suggestedClinicianQuestions: Array.isArray(parsed.suggestedClinicianQuestions)
        ? parsed.suggestedClinicianQuestions
        : [],
      safetyObservations: parsed.safetyObservations || 'কোনো তাৎক্ষণিক বিপদ সংকেত নেই।',
    };
  } catch (error) {
    console.error('Gemini synthesis call failed, falling back to rule synthesizer:', error);
    return buildRuleBasedSynthesis(input);
  }
}
