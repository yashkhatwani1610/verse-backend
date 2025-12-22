/**
 * Gemini API utility functions for VERSE AI features
 */

const API_BASE_URL = 'http://localhost:7860/api';

export interface SizeRecommendation {
    size: string;
    alternatives: string[];
    confidence: number;
    reasoning: string;
    bmi: number;
}

export interface OrderTrackingResult {
    found: boolean;
    orderId?: string;
    status?: string;
    estimatedDelivery?: string;
    timeline?: Array<{
        status: string;
        date: string;
        location: string;
    }>;
    naturalLanguageUpdate?: string;
    message?: string;
    suggestion?: string;
}

/**
 * Get AI-powered size recommendation
 */
export async function getSizeRecommendation(
    height: number,
    weight: number,
    bodyType: string,
    fitPreference: string
): Promise<SizeRecommendation> {
    const response = await fetch(`${API_BASE_URL}/size-recommend`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            height,
            weight,
            bodyType,
            fitPreference,
        }),
    });

    if (!response.ok) {
        throw new Error('Failed to get size recommendation');
    }

    return response.json();
}

/**
 * Get AI style advice
 */
export async function getStyleAdvice(
    question: string,
    productContext?: any
): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/style-chat`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            question,
            productContext,
        }),
    });

    if (!response.ok) {
        throw new Error('Failed to get style advice');
    }

    const data = await response.json();
    return data.response;
}

/**
 * Track order by ID or phone
 */
export async function trackOrder(
    orderId: string,
    phone?: string
): Promise<OrderTrackingResult> {
    const response = await fetch(`${API_BASE_URL}/track-order`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            orderId,
            phone,
        }),
    });

    const data = await response.json();

    if (!response.ok && response.status !== 404) {
        throw new Error(data.error || 'Failed to track order');
    }

    return data;
}

/**
 * General Gemini chat
 */
export async function chatWithGemini(
    prompt: string,
    context?: any
): Promise<{ response: string; confidence: number; success: boolean }> {
    const response = await fetch(`${API_BASE_URL}/gemini-chat`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            prompt,
            context,
        }),
    });

    if (!response.ok) {
        throw new Error('Failed to chat with AI');
    }

    return response.json();
}

/**
 * Save user size profile to localStorage
 */
export function saveUserSizeProfile(profile: {
    height: number;
    weight: number;
    bodyType: string;
    fitPreference: string;
    recommendedSize: string;
}) {
    localStorage.setItem('verse_size_profile', JSON.stringify(profile));
}

/**
 * Get user size profile from localStorage
 */
export function getUserSizeProfile(): any | null {
    const profile = localStorage.getItem('verse_size_profile');
    return profile ? JSON.parse(profile) : null;
}
