import { PatientCase } from '../types/case';
import { CLINIC_CONFIG, URINARY_BOWEL_SYMPTOMS, MODALITY_CARDS } from '../constants/case-form-data';

export function generatePrintableHtml(caseData: PatientCase): string {
  const selectedSymptomLabels = caseData.selectedSymptoms.map((id) => {
    const item = URINARY_BOWEL_SYMPTOMS.find((s) => s.id === id);
    const clarification = caseData.symptomClarifications?.[id];
    return {
      label: item?.label || id,
      clarification,
    };
  });

  const modalityRows = MODALITY_CARDS.map((card) => {
    const m = caseData.modalities[card.key as keyof typeof caseData.modalities];
    return `
      <tr>
        <td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: bold; background: #f8fafc;">${card.title}</td>
        <td style="padding: 8px; border: 1px solid #cbd5e1; color: #b91c1c;">${m?.aggravation || '—'}</td>
        <td style="padding: 8px; border: 1px solid #cbd5e1; color: #15803d;">${m?.amelioration || '—'}</td>
      </tr>
    `;
  }).join('');

  const symptomsHtml = selectedSymptomLabels.length > 0
    ? selectedSymptomLabels
        .map(
          (s) => `
      <div style="padding: 6px 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 13px;">
        <strong>• ${s.label}</strong>
        ${s.clarification ? `<span style="color: #0f766e; font-style: italic;"> (${s.clarification})</span>` : ''}
      </div>
    `
        )
        .join('')
    : '<p style="color: #94a3b8; font-size: 13px;">কোনো বিশেষ লক্ষণ চিহ্নিত করা হয়নি।</p>';

  const dateBangla = new Date(caseData.createdAt).toLocaleDateString('bn-BD');

  return `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <title>${CLINIC_CONFIG.nameBangla} - প্রেসক্রিপশন ও কেস ফাইল (${caseData.caseReference})</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;600;700&family=Noto+Sans+Bengali:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    @page {
      size: A4;
      margin: 12mm 15mm;
    }
    * {
      box-sizing: border-box;
    }
    body {
      font-family: 'Hind Siliguri', 'Noto Sans Bengali', system-ui, -apple-system, sans-serif;
      color: #1e293b;
      background: #ffffff;
      margin: 0;
      padding: 24px;
      font-size: 13.5px;
      line-height: 1.5;
    }
    .print-control-bar {
      margin-bottom: 24px;
      padding: 12px 18px;
      background: #0f766e;
      color: white;
      border-radius: 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 4px 12px rgba(15, 118, 110, 0.15);
    }
    .btn-print {
      padding: 8px 18px;
      background: #ffffff;
      color: #0f766e;
      font-weight: 700;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .header-box {
      border-bottom: 2px solid #0f766e;
      padding-bottom: 14px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 15px;
    }
    .clinic-title {
      font-size: 26px;
      font-weight: 800;
      color: #042f2e;
      margin: 0;
      line-height: 1.2;
    }
    .clinic-sub {
      font-size: 12px;
      font-weight: 700;
      color: #0f766e;
      letter-spacing: 0.5px;
      margin: 2px 0 0 0;
    }
    .meta-box {
      background: #faf7f0;
      border: 1px solid #e2d9cc;
      border-radius: 8px;
      padding: 12px 16px;
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 15px;
      font-size: 13px;
    }
    .section-title {
      font-size: 12px;
      font-weight: 800;
      text-transform: uppercase;
      color: #042f2e;
      border-bottom: 1.5px solid #cbd5e1;
      padding-bottom: 4px;
      margin-top: 14px;
      margin-bottom: 8px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
      margin-top: 4px;
    }
    .rx-box {
      border: 2px solid #0f766e;
      border-radius: 8px;
      padding: 14px 18px;
      background: #f0fdfa;
      margin-top: 18px;
    }
    .rx-title {
      font-size: 15px;
      font-weight: 800;
      color: #115e59;
      margin-bottom: 6px;
    }
    .rx-content {
      white-space: pre-line;
      font-size: 13.5px;
      color: #0f172a;
      font-weight: 600;
      line-height: 1.6;
    }
    @media print {
      .print-control-bar {
        display: none !important;
      }
      body {
        padding: 0 !important;
      }
    }
  </style>
  <script>
    window.addEventListener('load', function() {
      // Auto trigger print when opened directly
      setTimeout(function() {
        try {
          window.print();
        } catch(e) {
          console.error(e);
        }
      }, 400);
    });
  </script>
</head>
<body>
  <div class="print-control-bar">
    <div style="font-size: 13px;">
      <strong>${CLINIC_CONFIG.nameBangla}</strong> • অফিশিয়াল প্রেসক্রিপশন প্রিন্ট প্রিভিউ
    </div>
    <div>
      <button class="btn-print" onclick="window.print()">
        🖨️ প্রিন্ট করুন / PDF সেভ করুন
      </button>
    </div>
  </div>

  <div class="header-box">
    <div>
      <h1 class="clinic-title">${CLINIC_CONFIG.nameBangla}</h1>
      <p class="clinic-sub">${CLINIC_CONFIG.nameEnglish} • ক্লাসিক্যাল হোমিওপ্যাথি</p>
      <div style="margin-top: 6px; font-size: 12.5px; color: #1e293b;">
        <strong style="color: #042f2e; font-size: 13.5px;">${CLINIC_CONFIG.doctorNameBangla} (${CLINIC_CONFIG.doctorNameEnglish})</strong><br>
        <span style="font-size: 11px; color: #475569; font-weight: 600;">${CLINIC_CONFIG.doctorDesignationBangla}</span><br>
        <span style="font-size: 10px; color: #64748b; font-style: italic;">${CLINIC_CONFIG.doctorDesignationEnglish}</span>
      </div>
    </div>
    <div style="text-align: right; font-size: 12px; color: #475569;">
      <p style="margin: 0; font-weight: 700; color: #0f172a;">${CLINIC_CONFIG.address}</p>
      <p style="margin: 2px 0;">হটলাইন: <strong style="color: #0f766e;">${CLINIC_CONFIG.phone}</strong></p>
      <p style="margin: 0; font-size: 11px;">${CLINIC_CONFIG.consultationHours}</p>
    </div>
  </div>

  <div class="meta-box">
    <div>
      <span style="color: #64748b; display: block; font-size: 11px;">রোগীর নাম:</span>
      <strong style="font-size: 14px;">${caseData.fullName}</strong>
    </div>
    <div>
      <span style="color: #64748b; display: block; font-size: 11px;">রেফারেন্স কোড:</span>
      <strong style="font-family: monospace; color: #0f766e; font-size: 14px;">${caseData.caseReference}</strong>
    </div>
    <div>
      <span style="color: #64748b; display: block; font-size: 11px;">বয়স ও লিঙ্গ:</span>
      <strong>${caseData.age} বছর (${caseData.gender === 'female' ? 'মহিলা' : 'পুরুষ'})</strong>
    </div>
    <div>
      <span style="color: #64748b; display: block; font-size: 11px;">তারিখ ও জেলা:</span>
      <strong>${dateBangla} • ${caseData.district}</strong>
    </div>
  </div>

  <div class="section-title">১. প্রধান উপসর্গ ও রোগের ইতিহাস</div>
  <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px; margin-bottom: 6px;">
    <strong>প্রধান সমস্যা:</strong> ${caseData.primaryComplaint}
  </div>
  ${caseData.associatedComplaints ? `<div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px; font-size: 12.5px; margin-bottom: 6px;"><strong>আনুষঙ্গিক সমস্যা:</strong> ${caseData.associatedComplaints}</div>` : ''}
  <div style="font-size: 11.5px; color: #64748b; margin-bottom: 8px;">
    সময়কাল: ${caseData.onsetDuration || 'অনুল্লিখিত'} | সম্ভাব্য কারণ: ${caseData.suspectedCause || 'অনুল্লিখিত'}
  </div>

  <div class="section-title">২. প্রস্রাব ও পায়খানা সংক্রান্ত লক্ষণাবলী (${selectedSymptomLabels.length}টি চিহ্নিত)</div>
  <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px; margin-bottom: 10px;">
    ${symptomsHtml}
  </div>

  <div class="section-title">৩. রোগের হ্রাস-বৃদ্ধি বিবরণী (Modalities Matrix)</div>
  <table>
    <thead>
      <tr style="background: #f1f5f9; text-align: left;">
        <th style="padding: 7px; border: 1px solid #cbd5e1; width: 30%;">পরিস্থিতি</th>
        <th style="padding: 7px; border: 1px solid #cbd5e1; color: #b91c1c;">বাড়ে (Aggravation)</th>
        <th style="padding: 7px; border: 1px solid #cbd5e1; color: #15803d;">কমে (Amelioration)</th>
      </tr>
    </thead>
    <tbody>
      ${modalityRows}
    </tbody>
  </table>

  <div class="section-title">৪. ধাতুগত অবস্থা, খাদ্যাভ্যাস ও নিদ্রা</div>
  <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; font-size: 12px;">
    <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 6px 8px; border-radius: 6px;">
      <span style="color: #64748b; font-size: 10.5px; display: block;">খাবারের ঝোঁক:</span>
      <strong>${caseData.foodCravings || 'নেই'}</strong>
    </div>
    <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 6px 8px; border-radius: 6px;">
      <span style="color: #64748b; font-size: 10.5px; display: block;">খাবারে অরুচি:</span>
      <strong>${caseData.foodAversions || 'নেই'}</strong>
    </div>
    <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 6px 8px; border-radius: 6px;">
      <span style="color: #64748b; font-size: 10.5px; display: block;">মেজাজ ও স্বভাব:</span>
      <strong>${caseData.temperamentMood || 'স্বাভাবিক'}</strong>
    </div>
    <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 6px 8px; border-radius: 6px;">
      <span style="color: #64748b; font-size: 10.5px; display: block;">ঘুম ও ভীতি:</span>
      <strong>ঘুম: ${caseData.sleepPattern || 'স্বাভাবিক'} | ভয়: ${caseData.fears || 'নেই'}</strong>
    </div>
  </div>

  ${caseData.aiAnalysis ? `
    <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 6px; padding: 9px; margin-top: 12px; font-size: 12px;">
      <div style="font-weight: bold; color: #92400e; margin-bottom: 3px; display: flex; justify-content: space-between;">
        <span>এআই ক্লিনিক্যাল ড্রাফট সারসংক্ষেপ:</span>
        <span style="font-size: 10.5px;">${caseData.aiAnalysis.watermark}</span>
      </div>
      <p style="margin: 0; color: #334155; line-height: 1.5;">${caseData.aiAnalysis.chiefComplaintSummary}</p>
    </div>
  ` : ''}

  <div class="rx-box">
    <div class="rx-title">Rx — চিকিৎসকের প্রেসক্রিপশন ও পথ্য-নিষেধ</div>
    ${caseData.clinicalNotes?.doctorObservations ? `<p style="font-size: 12px; color: #475569; margin: 0 0 6px 0;"><strong>চিকিৎসকের পর্যবেক্ষণ:</strong> ${caseData.clinicalNotes.doctorObservations}</p>` : ''}
    <div class="rx-content">${caseData.clinicalNotes?.prescriptionPlan || 'ব্যবস্থাপত্র চেম্বারে সরাসরি সাক্ষাতের পর নির্ধারিত হবে।'}</div>
    ${caseData.clinicalNotes?.followUpDate ? `<p style="font-size: 12.5px; font-weight: bold; color: #0f766e; margin: 8px 0 0 0;">পরবর্তী ফলো-আপের তারিখ: ${caseData.clinicalNotes.followUpDate}</p>` : ''}
  </div>

  <div style="margin-top: 35px; display: flex; justify-content: space-between; align-items: flex-end; font-size: 11.5px; color: #64748b;">
    <div>
      রিপোর্ট প্রস্তুত: ${new Date().toLocaleString('bn-BD')}<br>
      শান্তি হোমিও কেয়ার ডিজিটাল সিস্টেম
    </div>
    <div style="text-align: right;">
      <div style="width: 220px; border-bottom: 1.5px solid #334155; margin-bottom: 4px; margin-left: auto;"></div>
      <strong style="color: #0f172a; font-size: 13.5px;">${CLINIC_CONFIG.doctorNameBangla}</strong><br>
      <span style="font-size: 11px; color: #0f766e; font-weight: 700;">${CLINIC_CONFIG.doctorNameEnglish}</span><br>
      <span style="font-size: 11px; color: #475569;">${CLINIC_CONFIG.doctorDesignationBangla}</span><br>
      <span style="font-size: 10px; color: #64748b; font-style: italic;">${CLINIC_CONFIG.doctorDesignationEnglish}</span><br>
      <span style="font-size: 10px; color: #0f766e; font-weight: bold;">${CLINIC_CONFIG.doctorRole}</span>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Creates an object URL that can be opened in a new tab via anchor tag.
 */
export function createPrintBlobUrl(caseData: PatientCase): string {
  const html = generatePrintableHtml(caseData);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  return URL.createObjectURL(blob);
}

/**
 * Print in-page via a temporary iframe.
 */
export function printViaHiddenIframe(caseData: PatientCase): boolean {
  try {
    const html = generatePrintableHtml(caseData);
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.zIndex = '-999';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(html);
      doc.close();
      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } catch (e) {
          console.warn('Iframe print blocked:', e);
        }
        setTimeout(() => {
          try {
            document.body.removeChild(iframe);
          } catch (_) {}
        }, 3000);
      }, 400);
      return true;
    }
    return false;
  } catch (err) {
    console.error('printViaHiddenIframe failed:', err);
    return false;
  }
}

export function downloadPrintableFile(caseData: PatientCase) {
  const html = generatePrintableHtml(caseData);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Shanti-Homeo-Care_${caseData.caseReference}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export function copyCaseSummaryText(caseData: PatientCase): Promise<boolean> {
  const text = `
=== ${CLINIC_CONFIG.nameBangla} (${CLINIC_CONFIG.nameEnglish}) ===
কনসালট্যান্ট: ${CLINIC_CONFIG.doctorNameBangla} (${CLINIC_CONFIG.doctorNameEnglish})
${CLINIC_CONFIG.doctorDesignationBangla} (${CLINIC_CONFIG.doctorDesignationEnglish})
কেস রেফারেন্স: ${caseData.caseReference}
রোগীর নাম: ${caseData.fullName}
বয়স: ${caseData.age} বছর | লিঙ্গ: ${caseData.gender === 'female' ? 'মহিলা' : 'পুরুষ'}
জেলা: ${caseData.district} | মোবাইল: ${caseData.contactNumber}
তারিখ: ${new Date(caseData.createdAt).toLocaleDateString('bn-BD')}

[১. প্রধান সমস্যা]
${caseData.primaryComplaint}
${caseData.associatedComplaints ? `আনুষঙ্গিক: ${caseData.associatedComplaints}` : ''}
সময়কাল: ${caseData.onsetDuration || 'অনুল্লিখিত'}

[২. নির্বাচিত লক্ষণসমূহ]
${caseData.selectedSymptoms.map((id) => {
  const item = URINARY_BOWEL_SYMPTOMS.find((s) => s.id === id);
  return `• ${item?.label || id}`;
}).join('\n')}

[৩. চিকিৎসকের ব্যবস্থাপত্র ও দিকনির্দেশনা (Rx)]
${caseData.clinicalNotes?.prescriptionPlan || 'প্রেসক্রিপশন চেম্বারে সরাসরি সাক্ষাতের পর নির্ধারিত হবে'}
${caseData.clinicalNotes?.followUpDate ? `ফলো-আপ তারিখ: ${caseData.clinicalNotes.followUpDate}` : ''}

চেম্বার: ${CLINIC_CONFIG.address} | হটলাইন: ${CLINIC_CONFIG.phone}
`.trim();

  return navigator.clipboard.writeText(text).then(() => true).catch(() => false);
}
