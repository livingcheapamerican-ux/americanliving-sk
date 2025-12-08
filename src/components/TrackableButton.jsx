import React from "react";
import { Button } from "@/components/ui/button";
import { trackEvent } from "./UserTracking";

export default function TrackableButton({ 
  children, 
  eventType = "button_click",
  eventData = {},
  onClick,
  ...props 
}) {
  const handleClick = (e) => {
    // Track the click
    trackEvent(eventType, {
      button_text: typeof children === 'string' ? children : 'button',
      ...eventData
    });

    // Call original onClick if provided
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <Button onClick={handleClick} {...props}>
      {children}
    </Button>
  );
}