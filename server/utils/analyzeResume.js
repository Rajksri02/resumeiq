const model = require('./geminiClient');

const buildPrompt = (resumeText, jobDescription) => {
  let prompt = `You are an expert technical recruiter and an advanced ATS (Applicant Tracking System). 
Analyze the following resume text. `;

  if (jobDescription) {
    prompt += `Score and comment on the candidate's fit specifically against the provided job description. 
- "missingSkills" should reflect skills explicitly required or implied by the job description that are NOT found in the resume. 
- "matchedSkills" should reflect skills present in BOTH the job description and the resume.

Job Description:
"""
${jobDescription}
"""
`;
  } else {
    prompt += `Provide a general ATS and quality evaluation. 
- "missingSkills" and "matchedSkills" should reflect general resume best practices for the candidate's apparent industry (e.g., missing quantifiable metrics, missing a dedicated skills section, lacking action verbs, etc.).
`;
  }

  prompt += `
Resume Text:
"""
${resumeText}
"""

You MUST respond ONLY with valid JSON. Do not include markdown formatting (like \`\`\`json), do not include any preamble, and match exactly this JSON shape:
{
  "atsScore": number (0-100),
  "overallSummary": "string",
  "strengths": ["string"],
  "weaknesses": ["string"],
  "matchedSkills": ["string"],
  "missingSkills": ["string"],
  "sectionFeedback": {
    "summary": "string",
    "experience": "string",
    "education": "string",
    "skills": "string",
    "formatting": "string"
  },
  "suggestions": ["string"]
}
`;
  return prompt;
};

const analyzeResumeText = async (resumeText, jobDescription = null, isRetry = false) => {
  let prompt = buildPrompt(resumeText, jobDescription);
  
  if (isRetry) {
    prompt += `\n\nIMPORTANT: Your previous response was not valid JSON. Please ensure your response is STRICTLY valid JSON with no markdown fences, comments, or extra text.`;
  }

  try {
    const result = await model.generateContent(prompt);
    let textResult = result.response.text();
    
    // Strip accidental markdown code fences if present
    textResult = textResult.replace(/^```(json)?/i, '').replace(/```$/i, '').trim();

    return JSON.parse(textResult);
  } catch (error) {
    if (!isRetry) {
      console.warn("Gemini returned malformed JSON or failed, retrying once...");
      return await analyzeResumeText(resumeText, jobDescription, true);
    } else {
      throw new Error("Failed to parse Gemini analysis as JSON after retry.");
    }
  }
};

module.exports = { analyzeResumeText, buildPrompt };
