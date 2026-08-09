import { useEffect } from 'react';
import { isAppleMobileDevice, isTextEditingElement } from '../mobile/inputDetection';

type UseKeyboardEditingStateOptions = {
  onEditingChange: (next: boolean) => void;
};

const PINCH_ZOOM_EPSILON = 0.01;

export function useKeyboardEditingState({ onEditingChange }: UseKeyboardEditingStateOptions) {
  useEffect(() => {
    const isAppleMobile = isAppleMobileDevice();

    const updateViewportVars = () => {
      const vv = window.visualViewport;
      const layoutHeight = window.innerHeight;
      const visualHeight = vv?.height || layoutHeight;
      const scale = vv?.scale || 1;
      const isPinchZoomed = Math.abs(scale - 1) > PINCH_ZOOM_EPSILON;
      const offsetTop = vv?.offsetTop || 0;
      const activeElementIsEditable = isTextEditingElement(document.activeElement);

      // Pinch zoom changes the Visual Viewport, but it must not resize the app shell.
      // On Android, interactive-widget=resizes-content already shrinks window.innerHeight
      // for the on-screen keyboard. On iOS, the layout viewport stays full-height, so use
      // the Visual Viewport only while a text field is actively editing at normal scale.
      const visualKeyboardInset = isPinchZoomed
        ? 0
        : Math.max(0, Math.round(layoutHeight - (visualHeight + offsetTop)));
      const iosKeyboardVisible = isAppleMobile && activeElementIsEditable && visualKeyboardInset > 120;
      const appHeight = iosKeyboardVisible ? visualHeight : layoutHeight;

      document.documentElement.style.setProperty('--moniezi-app-vh', `${appHeight * 0.01}px`);
      document.documentElement.style.setProperty('--moniezi-layout-vh', `${layoutHeight * 0.01}px`);
      document.documentElement.style.setProperty('--moniezi-keyboard-inset', `${visualKeyboardInset}px`);
      document.documentElement.style.setProperty(
        '--moniezi-ios-top-pad',
        isAppleMobile && !isPinchZoomed ? `${Math.max(16, Math.round(offsetTop + 16))}px` : (isAppleMobile ? '16px' : '0px'),
      );

      const editing = iosKeyboardVisible;
      onEditingChange(editing);
      document.documentElement.classList.toggle('moniezi-keyboard-editing', editing);
      document.body.classList.toggle('moniezi-keyboard-editing', editing);

      if (isAppleMobile && !isPinchZoomed) {
        document.documentElement.scrollLeft = 0;
        document.body.scrollLeft = 0;
      }
    };

    const handleFocusState = () => {
      window.setTimeout(updateViewportVars, 40);
    };

    updateViewportVars();
    window.addEventListener('resize', updateViewportVars);
    window.addEventListener('orientationchange', updateViewportVars);
    window.addEventListener('focusin', handleFocusState);
    window.addEventListener('focusout', handleFocusState);
    window.visualViewport?.addEventListener('resize', updateViewportVars);

    return () => {
      window.removeEventListener('resize', updateViewportVars);
      window.removeEventListener('orientationchange', updateViewportVars);
      window.removeEventListener('focusin', handleFocusState);
      window.removeEventListener('focusout', handleFocusState);
      window.visualViewport?.removeEventListener('resize', updateViewportVars);
      document.documentElement.classList.remove('moniezi-keyboard-editing');
      document.body.classList.remove('moniezi-keyboard-editing');
    };
  }, [onEditingChange]);
}
