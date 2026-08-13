import { GoogleGenerativeAI } from "@google/generative-ai";
import { cleansePatientName } from "../utils/stringUtils";

const apiKey = process.env.REACT_APP_GEMINI_API_KEY;

const toBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // The result is a data URL, we need to extract the Base64 part
      const base64String = reader.result.split(',')[1];
      resolve(base64String);
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

export async function runGemini({file}) {
  if (!apiKey) {
    throw new Error("REACT_APP_GEMINI_API_KEY is not configured");
  }

  const base64Data = await toBase64(file);
  const mimeType = file.type || "application/octet-stream";

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });

  const prompt = `Read as many details as you can from the given medical report and output strictly in JSON format.
    The JSON should have a list containing patient details and report data. 

    Each item in the list must have 3 main attributes: 'patientDetails', 'reportDate', and 'reportData'.

    1. The 'patientDetails' object should be populated exactly as follows with details extracted from the report:
      "patientDetails": {
          "patientName": "",
          "referringDoctor": "",
          "sex": "",
          "age": ""
      }

    2. The 'reportDate' attribute should be a string containing the "Report Date and Time" extracted from the report, formatted in strict ISO 8601 format (YYYY-MM-DD).

    3. The 'reportData' attribute must use the exact JSON structure provided below. Extract the result value, unit, and reference range (or biological reference interval) for each specified test.
      - If a test has an abnormal flag (like "H", "L", or "*"), remove the flag and extract only the result value.
      - For text-based or qualitative results (e.g., Smear Studies, RBC/WBC Morphology) where units and reference ranges do not exist, leave the unit and referenceRange attributes as empty strings ("").
      - If a test listed in the JSON structure is not found in the report, leave its fields as empty strings ("").

    Output exactly this JSON structure, filled with the extracted data:
    [
      {
        "patientDetails": {
          "patientName": "",
          "referringDoctor": "",
          "sex": "",
          "age": ""
        },
        "reportDate": "",
        "reportData": {
          "Haemoglobin": { "result": "", "unit": "", "referenceRange": "" },
          "RBC (Electrical Impedance)": { "result": "", "unit": "", "referenceRange": "" },
          "PCV(Calc)": { "result": "", "unit": "", "referenceRange": "" },
          "MCV (RBC histogram)": { "result": "", "unit": "", "referenceRange": "" },
          "MCH (Calc)": { "result": "", "unit": "", "referenceRange": "" },
          "MCHC (Calc)": { "result": "", "unit": "", "referenceRange": "" },
          "RDW (RBC histogram)": { "result": "", "unit": "", "referenceRange": "" },
          "Total WBC Count": { "result": "", "unit": "", "referenceRange": "" },
          "Neutrophil [%]": { "result": "", "unit": "", "referenceRange": "" },
          "Neutrophil [Abs]": { "result": "", "unit": "", "referenceRange": "" },
          "Lymphocyte [%]": { "result": "", "unit": "", "referenceRange": "" },
          "Lymphocyte [Abs]": { "result": "", "unit": "", "referenceRange": "" },
          "Eosinophil [%]": { "result": "", "unit": "", "referenceRange": "" },
          "Eosinophil [Abs]": { "result": "", "unit": "", "referenceRange": "" },
          "Monocytes [%]": { "result": "", "unit": "", "referenceRange": "" },
          "Monocytes [Abs]": { "result": "", "unit": "", "referenceRange": "" },
          "Basophil [%]": { "result": "", "unit": "", "referenceRange": "" },
          "Basophil [Abs]": { "result": "", "unit": "", "referenceRange": "" },
          "Neut/Lympho Ratio (NLR)": { "result": "", "unit": "", "referenceRange": "" },
          "Platelet Count": { "result": "", "unit": "", "referenceRange": "" },
          "MPV": { "result": "", "unit": "", "referenceRange": "" },
          "PDW": { "result": "", "unit": "", "referenceRange": "" },
          "RBC Morphology": { "result": "", "unit": "", "referenceRange": "" },
          "WBC Morphology": { "result": "", "unit": "", "referenceRange": "" },
          "Platelet": { "result": "", "unit": "", "referenceRange": "" },
          "Parasite": { "result": "", "unit": "", "referenceRange": "" },
          "Plasma Glucose - F": { "result": "", "unit": "", "referenceRange": "" },
          "Creatinine": { "result": "", "unit": "", "referenceRange": "" },
          "EGFR (MDRD) (Calc)": { "result": "", "unit": "", "referenceRange": "" },
          "ALT (SGPT)": { "result": "", "unit": "", "referenceRange": "" },
          "AST (SGOT)": { "result": "", "unit": "", "referenceRange": "" },
          "Alkaline Phosphatase": { "result": "", "unit": "", "referenceRange": "" },
          "Gamma Glutamyl Transferase": { "result": "", "unit": "", "referenceRange": "" },
          "Proteins (Total)": { "result": "", "unit": "", "referenceRange": "" },
          "Albumin": { "result": "", "unit": "", "referenceRange": "" },
          "Globulin": { "result": "", "unit": "", "referenceRange": "" },
          "A/G Ratio": { "result": "", "unit": "", "referenceRange": "" },
          "Bilirubin Total": { "result": "", "unit": "", "referenceRange": "" },
          "Bilirubin Conjugated": { "result": "", "unit": "", "referenceRange": "" },
          "Bilirubin Unconjugated": { "result": "", "unit": "", "referenceRange": "" },
          "Free T3": { "result": "", "unit": "", "referenceRange": "" },
          "Free T4": { "result": "", "unit": "", "referenceRange": "" },
          "Cortisol 8 AM": { "result": "", "unit": "", "referenceRange": "" },
          "TSH": { "result": "", "unit": "", "referenceRange": "" }
        }
      }
    ]`;

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }, { inlineData: { data: base64Data, mimeType } }] }],
    generationConfig: { response_mime_type: "application/json" },
  });

  const text = result.response.text();
  const parsed = JSON.parse(text);
  if (Array.isArray(parsed)) {
    parsed.forEach((item) => {
      if (item && item.patientDetails && typeof item.patientDetails.patientName !== "undefined") {
        item.patientDetails.patientName = cleansePatientName(item.patientDetails.patientName);
      }
    });
  }
  return parsed;
}
