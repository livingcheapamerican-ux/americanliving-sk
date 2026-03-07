import { useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useLocation } from "react-router-dom";

const getSessionId = () => {
  let sessionId = sessionStorage.getItem('session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('session_id', sessionId);
  }
  return sessionId;
};

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

const getDeviceType = () => {
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) return "tablet";
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) return "mobile";
  return "desktop";
};

const getBrowser = () => {
  const ua = navigator.userAgent;
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Chrome")) return "Chrome";
  if (ua.includes("Safari")) return "Safari";
  if (ua.includes("Edge")) return "Edge";
  return "Other";
};

export const trackEvent = async (eventType, eventData = {}) => {
  try {
    const utmParams = getUtmParams(window.location.search);
    await base44.functions.invoke('trackUserEvent', {
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
    // Silently fail - tracking should not disrupt user experience
  }
};

export default function UserTracking() {
  const location = useLocation();
  const startTime = useRef(Date.now());

  useEffect(() => {
    trackEvent("page_view");

    return () => {
      const timeSpent = Math.round((Date.now() - startTime.current) / 1000);
      trackEvent("page_view", { time_spent: timeSpent });
    };
  }, [location.pathname, location.search]);

  return null;
}