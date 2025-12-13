import { useEffect } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

export const useDashboardTour = () => {
  useEffect(() => {
    const hasSeenTour = localStorage.getItem('hasSeenMobileDashboardTour');
    
    if (!hasSeenTour) {
      const driverObj = driver({
        showProgress: true,
        animate: true,
        steps: [
          { 
            element: '#mobile-portfolio-card', 
            popover: { 
              title: 'Portfolio Value', 
              description: 'Your total investment value and daily gains are shown here.',
              side: 'bottom', 
              align: 'center' 
            } 
          },
          { 
            element: '#mobile-quick-stats', 
            popover: { 
              title: 'Quick Stats', 
              description: 'See your active listings and completed trades count.',
              side: 'bottom', 
              align: 'center' 
            } 
          },
          { 
            element: '#mobile-quick-actions', 
            popover: { 
              title: 'Quick Actions', 
              description: 'Create a new post or browse the marketplace instantly.',
              side: 'top', 
              align: 'center' 
            } 
          },
          { 
            element: '#mobile-activity-grid', 
            popover: { 
              title: 'My Activity', 
              description: 'Manage your posts, bids, and received offers from here.',
              side: 'top', 
              align: 'center' 
            } 
          }
        ],
        onDestroyStarted: () => {
          if (!driverObj.hasNextStep() || confirm("Skip the tour?")) {
            driverObj.destroy();
            localStorage.setItem('hasSeenMobileDashboardTour', 'true');
          }
        },
      });

      // Small delay to ensure elements are rendered
      setTimeout(() => {
        driverObj.drive();
      }, 1500);
    }
  }, []);
};
