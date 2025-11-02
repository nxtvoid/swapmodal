import { DialogContentProps, DialogProps } from '@radix-ui/react-dialog';
import * as React from 'react';
import { createContext, useContext, useLayoutEffect, useState } from 'react';

type WrapperProps = DialogProps;
type ContentProps = Omit<DialogContentProps, 'onAnimationEnd'> & {
  onAnimationEnd?: (...args: any[]) => void;
};
type Options = {
  mobile: {
    Wrapper: React.ComponentType<WrapperProps>;
    Content: React.ComponentType<ContentProps>;
  };
  desktop: {
    Wrapper: React.ComponentType<WrapperProps>;
    Content: React.ComponentType<ContentProps>;
  };
  breakpoint?: number;
};

export function createResponsiveWrapper({ mobile, desktop, breakpoint = 640 }: Options) {
  // Create a context to share the isMobile state between Wrapper and Content
  const ResponsiveContext = createContext<boolean | undefined>(undefined);

  function useIsMobile() {
    const [isMobile, setIsMobile] = useState<boolean>(() => {
      // Initialize with correct value to avoid hydration mismatch
      if (typeof window !== 'undefined') {
        return window.matchMedia(`(max-width: ${breakpoint}px)`).matches;
      }
      return false;
    });

    useLayoutEffect(() => {
      const checkDevice = (event: MediaQueryList | MediaQueryListEvent) => {
        setIsMobile(event.matches);
      };

      // Initial detection
      const mediaQueryList = window.matchMedia(`(max-width: ${breakpoint}px)`);
      checkDevice(mediaQueryList);

      // Listener for media query change
      mediaQueryList.addEventListener('change', checkDevice);

      // Cleanup listener
      return () => {
        mediaQueryList.removeEventListener('change', checkDevice);
      };
    }, []);

    return isMobile;
  }

  function Wrapper(props: WrapperProps) {
    const isMobile = useIsMobile();
    const WrapperComponent = isMobile ? mobile.Wrapper : desktop.Wrapper;
    
    return (
      <ResponsiveContext.Provider value={isMobile}>
        <WrapperComponent {...props} />
      </ResponsiveContext.Provider>
    );
  }
  
  function Content(props: ContentProps) {
    // Use the context value from Wrapper to ensure consistency
    const contextIsMobile = useContext(ResponsiveContext);
    // Fallback to hook if context is not available (shouldn't happen in normal usage)
    const hookIsMobile = useIsMobile();
    const isMobile = contextIsMobile !== undefined ? contextIsMobile : hookIsMobile;
    
    const ContentComponent = isMobile ? mobile.Content : desktop.Content;
    return <ContentComponent {...props} />;
  }

  return {
    Wrapper,
    Content,
  };
}
