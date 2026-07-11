import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// JSON parser with generous limit for PDF uploads
app.use(express.json({ limit: "25mb" }));

// Initialize Gemini SDK with telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API endpoint to parse department notices (PDF or Text) via Gemini
app.post("/api/gemini/parse-notice", async (req, res) => {
  try {
    const { fileData, mimeType, textContent, residentName, residentYear } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ 
        error: "GEMINI_API_KEY environment variable is not configured on the server." 
      });
    }

    const parts: any[] = [];

    // Add text prompt context
    const textPrompt = `You are an expert clinical education program coordinator. Analyze this medical department circular or roster and extract personalized, individual reminders for:
Resident Name: "${residentName}"
Resident Year Level: "${residentYear}"

Instructions:
1. Carefully scan the notice for any dates, duties, presentations, rotations, or assignments.
2. Determine if each item applies to this resident individually (by name match, e.g. "Rohan", "Mehta", "Pair", "Aahan", "Priya" or general names), or by year level (e.g. if the resident is "Junior Resident (Y2)", then any assignments for "Y2", "Junior Residents", "Junior", or "PGY-2" apply).
3. General department notices (e.g., Grand Rounds, Guest Lectures, mandatory administrative deadlines) apply to all residents, so include them.
4. If there are no specific tasks for this resident, output a welcome general reminder to review the document and stay updated.
5. Create a clean JSON array of reminders. Each reminder MUST follow this JSON schema:
{
  "title": "String (Short, clear title of the duty or event)",
  "date": "String (YYYY-MM-DD format of the task/event, or fallback to '2026-06-20')",
  "time": "String (Time, e.g. '08:00 AM' or 'All Day')",
  "category": "String (Must be one of: 'Duty', 'Academic', 'Deadline', 'Event', 'General')",
  "description": "String (Clear summary of what they need to do or attend)",
  "priority": "String (Must be 'High', 'Medium', or 'Low')"
}`;

    parts.push({ text: textPrompt });

    // Handle base64 file data if present (e.g., a PDF)
    if (fileData && mimeType) {
      // Remove any data:mime;base64, prefix if sent
      const cleanBase64 = fileData.replace(/^data:.*;base64,/, "");
      parts.push({
        inlineData: {
          mimeType: mimeType,
          data: cleanBase64
        }
      });
    } else if (textContent) {
      // Handle plain text notice pasted or read
      parts.push({ text: `Notice Content:\n\n${textContent}` });
    } else {
      return res.status(400).json({ error: "No circular file data or text content provided." });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          description: "List of personalized extracted reminders",
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "Title of the task or duty" },
              date: { type: Type.STRING, description: "Target date in YYYY-MM-DD format" },
              time: { type: Type.STRING, description: "Time of the event" },
              category: { type: Type.STRING, description: "Must be Duty, Academic, Deadline, Event, or General" },
              description: { type: Type.STRING, description: "Detailed directive or description" },
              priority: { type: Type.STRING, description: "Must be High, Medium, or Low" }
            },
            required: ["title", "date", "time", "category", "description", "priority"]
          }
        }
      }
    });

    const resultText = response.text || "[]";
    const parsedReminders = JSON.parse(resultText.trim());

    res.json({ 
      success: true, 
      reminders: parsedReminders 
    });

  } catch (error: any) {
    console.error("Gemini Parse Notice Error:", error);
    res.status(500).json({ 
      error: "Failed to parse notice via Gemini API. Please make sure the circular format is readable.",
      details: error.message 
    });
  }
});

// API endpoint to parse messy clinical operative notes via Gemini (AI Case-Sieve)
app.post("/api/gemini/parse-clinical-note", async (req, res) => {
  try {
    const { clinicalNote, residentTier } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ 
        error: "GEMINI_API_KEY environment variable is not configured on the server." 
      });
    }

    if (!clinicalNote || !clinicalNote.trim()) {
      return res.status(400).json({ error: "No clinical note content provided to parse." });
    }

    const textPrompt = `You are a world-class MedTech clinical parsing engine. Your job is to parse unstructured clinical surgical operative reports or notes written by residents and map them to standard surgical logs.

Resident Tier: "${residentTier || 'Senior Resident (Retina)'}"

Instructions:
1. Identify the primary surgery performed (e.g., Pars Plana Vitrectomy (PPV), Cataract Surgery, Trabeculectomy, MIGS, Penetrating Keratoplasty (PKP), etc.).
2. Extract the supervisor or attending physician mentioned (e.g., Dr. Nair, Dr. Mehta, Dr. Sharma, Dr. Sengupta, Dr. Rao). If none is mentioned, fallback to a likely ophthalmic supervisor or leave empty.
3. Identify and extract any intraoperative or post-operative complications (e.g., "Vitreous Loss", "Zonular Laxity", "Hypotony", "Bleb Leak", "Graft rejection", or "None"). Be highly precise.
4. Calculate appropriate surgical experience points (XP) to award based on case complexity (typically 15 to 50 XP).
5. Categorize the difficulty: "Mild", "Moderate", or "Complex".
6. Generate a fully de-identified (HIPAA-compliant, no patient names, no real DOBs, no patient specific IDs) clinical summary. If the note contains any real names or initials, strip them and replace with generic clinical references.
7. Generate a random Patient pseudonym identifier in the format "Patient-####A" (where #### are 4 random digits and A is a random letter).`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: { parts: [{ text: textPrompt }, { text: `Clinical Note:\n\n${clinicalNote}` }] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          description: "Parsed surgical log information",
          properties: {
            procedureName: { type: Type.STRING, description: "Normalized name of the surgical procedure" },
            supervisor: { type: Type.STRING, description: "Extracted supervisor or attending doctor name" },
            complications: { type: Type.STRING, description: "Complications identified, or 'None'" },
            points: { type: Type.INTEGER, description: "Recommended XP points for this level of surgery (15-50)" },
            difficulty: { type: Type.STRING, description: "Difficulty level: Mild, Moderate, or Complex" },
            summary: { type: Type.STRING, description: "HIPAA-compliant professional clinical summary of the case" },
            patientId: { type: Type.STRING, description: "Anonymized Patient pseudonym, e.g., Patient-1982X" }
          },
          required: ["procedureName", "supervisor", "complications", "points", "difficulty", "summary", "patientId"]
        }
      }
    });

    const resultText = response.text || "{}";
    const parsedData = JSON.parse(resultText.trim());

    res.json({
      success: true,
      data: parsedData
    });

  } catch (error: any) {
    console.error("Gemini Parse Clinical Note Error:", error);
    res.status(500).json({
      error: "Failed to parse operative clinical note via Gemini.",
      details: error.message
    });
  }
});

// Vite & Static file handler setup
async function setupViteServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development middleware mounted.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Production static files mounted from dist/.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ResiTrend Server running on http://0.0.0.0:${PORT}`);
  });
}

setupViteServer();
