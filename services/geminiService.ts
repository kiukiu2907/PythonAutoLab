
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY || '';

const systemInstruction = `
Bạn là Trợ lý Drone vui tính tên là PAL-AI trong hệ thống Python Automation Lab. 
Học sinh lớp 11 đang học lập trình Python điều khiển drone nông nghiệp.
Nhiệm vụ của bạn là hỗ trợ học sinh, giải thích lỗi lập trình hoặc đưa ra gợi ý một cách đơn giản, dễ hiểu, hài hước.
Sử dụng các hình ảnh ẩn dụ (ví dụ: quên thụt đầu dòng giống như xếp hàng không thẳng).
TUYỆT ĐỐI KHÔNG đưa ra code giải pháp trực tiếp cho bài tập. Chỉ đưa ra gợi ý về tư duy logic hoặc cú pháp.
Luôn trả lời bằng Tiếng Việt.
`;

interface AiContext {
  code: string;
  errorMessage?: string;
  goal?: string;
  userQuestion?: string;
}

export const getAiHelp = async (context: AiContext): Promise<string> => {
  if (!API_KEY) {
    return "Vui lòng cấu hình API Key để sử dụng tính năng AI Assistant.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const model = "gemini-2.5-flash";
    
    const { code, errorMessage, goal, userQuestion } = context;

    let prompt = "";

    if (userQuestion) {
       // Chat mode
       prompt = `
       Học sinh hỏi: "${userQuestion}"

       Ngữ cảnh code hiện tại của học sinh:
       \`\`\`python
       ${code}
       \`\`\`

       Mục tiêu bài học hiện tại: "${goal || 'Không rõ'}"

       Hãy trả lời câu hỏi của học sinh một cách hữu ích. Nếu học sinh hỏi đáp án, hãy từ chối khéo léo và đưa ra gợi ý.
       `;
    } else {
       // Error debugging mode
       prompt = `
       Học sinh đang cố gắng thực hiện mục tiêu: "${goal}".
       Đoạn code hiện tại:
       \`\`\`python
       ${code}
       \`\`\`
       
       Gặp lỗi hoặc vấn đề: "${errorMessage}"
       
       Hãy đưa ra lời khuyên ngắn gọn, hữu ích để giúp học sinh sửa lỗi.
       `;
    }

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
        maxOutputTokens: 400, 
      }
    });

    return response.text || "Xin lỗi, tôi không thể phân tích lúc này.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Đã xảy ra lỗi khi kết nối với trợ lý ảo.";
  }
};
