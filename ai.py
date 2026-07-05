import os
from google import genai

API_KEY = os.environ.get("GEMINI_API_KEY")

if not API_KEY:
    raise ValueError("GEMINI_API_KEY environment variable is not set.")

client = genai.Client(api_key=API_KEY)
MODEL = "gemini-2.5-flash"


def ask_gemini(question, sales_context=None, language="en"):
    context_text = ""
    if sales_context:
        context_text = "Here is today's sales data:\n"
        for item in sales_context:
            context_text += f"- {item['product']}: {item['quantity']} units at ₹{item['price']} each\n"

    language_instruction = (
        "Answer entirely in Tamil (தமிழ்), in simple everyday words a shop owner would use."
        if language == "ta"
        else "Answer in simple, plain English — no technical jargon."
    )

    prompt = f"""You are a friendly business assistant helping a small shop owner in India
understand their sales. {language_instruction}
Keep it short (2-4 sentences).

{context_text}

Question: {question}
"""

    response = client.models.generate_content(model=MODEL, contents=prompt)
    return response.text