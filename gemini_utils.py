import google.generativeai as genai
import os
from typing import Optional, Dict, Any
import json

# Configure Gemini API
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-pro')
else:
    model = None
    print("⚠️  No Gemini API key found. AI features will use fallback logic.")

def call_gemini(prompt: str, context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Call Gemini API with a prompt and optional context.
    Returns response with confidence score.
    """
    if not model:
        return {
            "response": "AI service is currently unavailable. Please try again later.",
            "confidence": 0.0,
            "error": "No API key configured"
        }
    
    try:
        # Build full prompt with context
        full_prompt = prompt
        if context:
            full_prompt = f"Context: {json.dumps(context)}\n\n{prompt}"
        
        # Generate response
        response = model.generate_content(full_prompt)
        
        return {
            "response": response.text,
            "confidence": 0.85,  # Gemini doesn't provide confidence, using default
            "success": True
        }
    except Exception as e:
        print(f"Gemini API Error: {e}")
        return {
            "response": f"Error: {str(e)}",
            "confidence": 0.0,
            "error": str(e),
            "success": False
        }

def generate_size_recommendation(height: float, weight: float, body_type: str, fit_preference: str) -> Dict[str, Any]:
    """
    Generate size recommendation using Gemini AI with rule-based fallback.
    """
    # Rule-based fallback logic
    bmi = weight / ((height / 100) ** 2)
    
    # Basic size calculation
    if bmi < 18.5:
        base_size = "S"
    elif bmi < 25:
        base_size = "M"
    elif bmi < 30:
        base_size = "L"
    else:
        base_size = "XL"
    
    # Adjust for body type
    size_map = {"S": 0, "M": 1, "L": 2, "XL": 3, "XXL": 4}
    sizes = ["XS", "S", "M", "L", "XL", "XXL"]
    
    current_index = size_map.get(base_size, 1)
    
    if body_type == "broad":
        current_index = min(current_index + 1, len(sizes) - 1)
    elif body_type == "slim":
        current_index = max(current_index - 1, 0)
    
    # Adjust for fit preference
    if fit_preference == "relaxed":
        current_index = min(current_index + 1, len(sizes) - 1)
    elif fit_preference == "slim":
        current_index = max(current_index - 1, 0)
    
    recommended_size = sizes[current_index]
    alternative_sizes = []
    
    if current_index > 0:
        alternative_sizes.append(sizes[current_index - 1])
    if current_index < len(sizes) - 1:
        alternative_sizes.append(sizes[current_index + 1])
    
    # Try to get AI reasoning
    if model:
        prompt = f"""You are a fashion sizing expert for VERSE, a premium shirt brand.

Given the following customer details:
- Height: {height} cm
- Weight: {weight} kg
- Body Type: {body_type}
- Fit Preference: {fit_preference}

The rule-based system suggests size {recommended_size}.

Please provide:
1. A brief explanation (2-3 sentences) of why this size is recommended
2. Any styling tips for this fit preference
3. Confidence level (high/medium/low)

Keep your response natural and friendly, as if you're a personal stylist."""

        ai_response = call_gemini(prompt)
        
        if ai_response.get("success"):
            reasoning = ai_response["response"]
            confidence = 0.9
        else:
            reasoning = f"Based on your measurements and {fit_preference} fit preference, size {recommended_size} should provide the perfect balance of comfort and style."
            confidence = 0.75
    else:
        reasoning = f"Based on your measurements and {fit_preference} fit preference, size {recommended_size} should provide the perfect balance of comfort and style."
        confidence = 0.75
    
    return {
        "size": recommended_size,
        "alternatives": alternative_sizes,
        "confidence": confidence,
        "reasoning": reasoning,
        "bmi": round(bmi, 1)
    }

def generate_style_advice(question: str, product_context: Optional[Dict[str, Any]] = None) -> str:
    """
    Generate style advice using Gemini AI.
    """
    if not model:
        return "I'm here to help with styling advice! Unfortunately, the AI service is temporarily unavailable. Please try again later."
    
    context_str = ""
    if product_context:
        context_str = f"\n\nCurrent Product Context:\n"
        if product_context.get("title"):
            context_str += f"- Product: {product_context['title']}\n"
        if product_context.get("color"):
            context_str += f"- Color: {product_context['color']}\n"
        if product_context.get("fabric"):
            context_str += f"- Fabric: {product_context['fabric']}\n"
        if product_context.get("pattern"):
            context_str += f"- Pattern: {product_context['pattern']}\n"
    
    prompt = f"""You are a professional fashion stylist for VERSE, a premium shirt brand.

Customer Question: {question}{context_str}

Provide helpful, concise styling advice (2-4 sentences). Be friendly, professional, and specific. Focus on:
- How to style the item
- Suitable occasions
- Color matching tips
- Fabric care if relevant

Keep your response conversational and helpful."""

    response = call_gemini(prompt, product_context)
    
    if response.get("success"):
        return response["response"]
    else:
        return "I'd love to help with your styling question! Could you please try asking again?"

def generate_tracking_update(order_id: str, status: str, timeline: list) -> str:
    """
    Generate natural language order tracking update using Gemini AI.
    """
    if not model:
        status_messages = {
            "processing": f"Your order {order_id} is being processed. We'll notify you once it ships!",
            "shipped": f"Great news! Your order {order_id} has been shipped and is on its way to you.",
            "out_for_delivery": f"Your order {order_id} is out for delivery today. Get ready to receive it!",
            "delivered": f"Your order {order_id} has been delivered. We hope you love your VERSE purchase!"
        }
        return status_messages.get(status, f"Order {order_id} status: {status}")
    
    timeline_str = "\n".join([f"- {item['status']}: {item['date']} {item.get('location', '')}" for item in timeline])
    
    prompt = f"""You are a customer service representative for VERSE, a premium fashion brand.

Order ID: {order_id}
Current Status: {status}

Timeline:
{timeline_str}

Generate a friendly, natural language update about this order (2-3 sentences). Be warm, professional, and reassuring. Include:
- Current status in friendly terms
- What the customer can expect next
- Estimated delivery if status is "shipped" or "out_for_delivery"

Keep it conversational and positive."""

    response = call_gemini(prompt)
    
    if response.get("success"):
        return response["response"]
    else:
        return f"Your order {order_id} is currently {status}. We'll keep you updated on its progress!"
