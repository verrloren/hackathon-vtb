'use client';

import { useState, useCallback } from 'react';

interface CopyStatus {
  [key: string]: string;
}

export const useCopyCode = () => {
  const [copyStatuses, setCopyStatuses] = useState<CopyStatus>({});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const timeouts: { [key: string]: ReturnType<typeof setTimeout> } = {};

  const copyToClipboard = useCallback(async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      
      // Clear existing timeout if any
      if (timeouts[id]) {
        clearTimeout(timeouts[id]);
      }

      setCopyStatuses(prev => ({
        ...prev,
        [id]: 'Copied!'
      }));

      // Set new timeout
      timeouts[id] = setTimeout(() => {
        setCopyStatuses(prev => ({
          ...prev,
          [id]: 'Copy'
        }));
      }, 2000);

    } catch (error) {
      setCopyStatuses(prev => ({
        ...prev,
        [id]: `Failed to copy: ${error}`
      }));
    }
  }, [timeouts]);

  const getCopyStatus = (id: string) => copyStatuses[id] || 'Copy';

  return {
    copyToClipboard,
    getCopyStatus
  };
};