import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Custom hook to handle Android back button
 * This syncs with Capacitor's App plugin for native Android back button
 */
function useAndroidBackButton(customAction) {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if we're running in a Capacitor environment (Android app)
    const isCapacitor = window.Capacitor !== undefined;

    if (isCapacitor) {
      // Import Capacitor App plugin dynamically
      import('@capacitor/app').then(({ App }) => {
        // Listen for the hardware back button
        const backButtonListener = App.addListener('backButton', ({ canGoBack }) => {
          if (customAction) {
            customAction();
          } else if (canGoBack) {
            navigate(-1);
          } else {
            // If can't go back, minimize the app
            App.minimizeApp();
          }
        });

        // Cleanup listener on unmount
        return () => {
          backButtonListener.then(listener => listener.remove());
        };
      }).catch(err => {
        console.log('Capacitor App plugin not available:', err);
      });
    } else {
      // Web environment - handle browser back button with popstate
      const handlePopState = (event) => {
        if (customAction) {
          event.preventDefault();
          customAction();
        }
      };

      window.addEventListener('popstate', handlePopState);

      return () => {
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [navigate, customAction]);
}

export default useAndroidBackButton;
