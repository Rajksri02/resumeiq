import { useEffect } from 'react';

/**
 * Custom hook to update document title per view.
 * Sets the format: "{title} | ResumeIQ"
 */
export default function useDocumentTitle(title) {
  useEffect(() => {
    if (title) {
      document.title = `${title} | ResumeIQ`;
    } else {
      document.title = 'ResumeIQ';
    }
  }, [title]);
}

