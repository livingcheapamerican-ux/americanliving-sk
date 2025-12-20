import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ReactPixel from 'react-facebook-pixel';

export default function MetaPixel({ pixelId }) {
  const location = useLocation();

  // Initialize pixel once on mount
  useEffect(() => {
    if (!pixelId) return;

    const options = {
      autoConfig: true,
      debug: true, // Enable debug mode to see logs
    };

    ReactPixel.init(pixelId, undefined, options);
    ReactPixel.pageView();
    
    console.log(`✅ Meta Pixel initialized with ID: ${pixelId}`);
  }, [pixelId]);

  // Track page views on route change
  useEffect(() => {
    if (!pixelId) return;
    
    ReactPixel.pageView();
    console.log(`📊 PageView tracked: ${location.pathname}`);
  }, [location.pathname, pixelId]);

  return null;
}