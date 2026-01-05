import { useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useLocation } from "react-router-dom";

// Generate session ID (stored in sessionStorage)
const getSessionId = () => {
  let sessionId = sessionStorage.getItem('session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('session_id', sessionId);
  }
  return sessionId;
};

// Parse UTM parameters from URL
const getUtmParams = (search) => {
  const params = new URLSearchParams(search);
  return {
    utm_source: params.get('utm_source') || undefined,
    utm_medium: params.get('utm_medium') || undefined,
    utm_campaign: params.get('utm_campaign') || undefined,
    utm_term: params.get('utm_term') || undefined,
    utm_content: params.get('utm_content') || undefined,
  };
};

// Detect device type
const getDeviceType = () => {
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return "tablet";
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return "mobile";
  }
  return "desktop";
};

// Get browser name
const getBrowser = () => {
  const ua = navigator.userAgent;
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Chrome")) return "Chrome";
  if (ua.includes("Safari")) return "Safari";
  if (ua.includes("Edge")) return "Edge";
  return "Other";
};

// Track event
export const trackEvent = async (eventType, eventData = {}) => {
  try {
    const utmParams = getUtmParams(window.location.search);
    
    await base44.entities.UserEvent.create({
      event_type: eventType,
      page_url: window.location.pathname + window.location.search,
      page_title: document.title,
      referrer: document.referrer || undefined,
      ...utmParams,
      event_data: eventData,
      session_id: getSessionId(),
      user_agent: navigator.userAgent,
      device_type: getDeviceType(),
      browser: getBrowser(),
      language: navigator.language
    });
  } catch (error) {
    console.error("Failed to track event:", error);
  }
};

// Hook for automatic page view tracking
export default function UserTracking() {
  const location = useLocation();
  const startTime = useRef(Date.now());

  useEffect(() => {
    // Track page view once per pathname change (without search params to avoid duplicates)
    trackEvent("page_view");
    startTime.current = Date.now();
  }, [location.pathname]);

  return null;
}