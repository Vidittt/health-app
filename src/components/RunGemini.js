import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("AIzaSyDUaD_jNoYI7Z_ZFqg_oM0nx5iJSk8vOHI"); // use .env in production

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
  const base64Data = await toBase64(file);
  const mimeType = file.type || "application/octet-stream";

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `Read as many details as you can from the given medical report and output only JSON in this format:
  {
    patientDetails: {
      patientName: "",
      referringDoctor: "",
      sex: "",
      age: ""
    },
    lipidProfileData: {
      Cholesterol: { result: "", unit: "mg/dL", referenceRange: "110-200" },
      "HDL Cholesterol": { result: "", unit: "mg/dL", referenceRange: "40-60" },
      Triglyceride : {result: "", unit: "mg/dL", referenceRange: "0-150"},
      VLDL : {result: "", unit: "mg/dL", referenceRange: "10-40"},
      "Chol/HDL": { result: "", unit: "", referenceRange: "0-4.1" },
      "LDL Cholesterol": { result: "", unit: "mg/dL", referenceRange: "0-100" },
    }
  }`;

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }, { inlineData: { data: base64Data, mimeType } }] }],
    generationConfig: { response_mime_type: "application/json" },
  });

  const text = result.response.text();
  return JSON.parse(text); 
}
