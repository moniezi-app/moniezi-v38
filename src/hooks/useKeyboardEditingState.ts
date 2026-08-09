import { useEffect } from 'react';
import { isAppleMobileDevice, isTextEditingElement } from '../mobile/inputDetection';

type UseKeyboardEditingStateOptions = {
  onEditingChange: (next: boolean) => void;
};

const PINCH_ZOOM_EPSILON = 0.01;
const KEYBOARD_INSET_THRESHOLD = 120;

export function useKeyboardEditingState({ onEditingChange }: UseKeyboardEditingStateOptions) {
  useEffect(() => {
    const isAppleMobile = isAppleMobileDevice();

    // WebKit can incorrectly change window.innerHeight/window.innerWidth while pinch-zooming.
    // Keep a layout baseline captured only at normal scale, then freeze that baseline during zoom.
    let stableAppleLayoutHeight = 0;
    let stableAppleLayoutWidth = 0;
    let stableAppleOrientation = '';

    const getOrientationKey = () => {
      if (typeof window.matchMedia === 'function') {
        return window.matchMedia('(orientation: portrait)').matches ? 'portrait' : 'landscape';
      }
      return window.innerHeight >= window.innerWidth ? 'portrait' : 'landscape';
    };

    const getCurrentLayoutHeightCandidate = () => {
      const rootHeight = document.documentElement.clientHeight || 0;
      const innerHeight = window.innerHeight || 0;
      return Math.max(rootHeight, innerHeight);
    };

    const getCurrentLayoutWidthCandidate = () => {
      const rootWidth = document.documentElement.clientWidth || 0;
      const innerWidth = window.innerWidth || 0;
      return Math.max(rootWidth, innerWidth);
    };

    const updateViewportVars = () => {
      const vv = window.visualViewport;
      const scale = vv?.scale || 1;
      const visualHeight = vv?.height || window.innerHeight;
      const visualWidth = vv?.width || window.innerWidth;
      const offsetTop = vv?.offsetTop || 0;
      const activeElementIsEditable = isTextEditingElement(document.activeElement);
      const orientation = getOrientationKey();

      const scaleShowsPinch = Math.abs(scale - 1) > PINCH_ZOOM_EPSILON;

      if (!isAppleMobile) {
        // Chromium/Android: pinch zoom changes the Visual Viewport but leaves the layout
        // viewport intact. interactive-widget=resizes-content handles the keyboard by
        // resizing window.innerHeight, so the app shell can follow the layout viewport.
        const layoutHeight = window.innerHeight;
        const visualKeyboardInset = scaleShowsPinch
          ? 0
          : Math.max(0, Math.round(layoutHeight - (visualHeight + offsetTop)));

        document.documentElement.style.setProperty('--moniezi-app-vh', `${layoutHeight * 0.01}px`);
        document.documentElement.style.setProperty('--moniezi-layout-vh', `${layoutHeight * 0.01}px`);
        document.documentElement.style.setProperty('--moniezi-keyboard-inset', `${visualKeyboardInset}px`);
        document.documentElement.style.setProperty('--moniezi-ios-top-pad', '0px');

        onEditingChange(false);
        document.documentElement.classList.remove('moniezi-keyboard-editing');
        document.body.classList.remove('moniezi-keyboard-editing');
        return;
      }

      const currentLayoutHeight = getCurrentLayoutHeightCandidate();
      const currentLayoutWidth = getCurrentLayoutWidthCandidate();

      // Initialize the Apple baseline at normal scale. This happens on first launch before
      // a user can pinch zoom. It is intentionally not refreshed from WebKit dimensions
      // while zoomed because those dimensions are known to become scale-dependent.
      if (!stableAppleLayoutHeight || !stableAppleLayoutWidth) {
        stableAppleLayoutHeight = currentLayoutHeight;
        stableAppleLayoutWidth = currentLayoutWidth;
        stableAppleOrientation = orientation;
      }

      const orientationChanged = stableAppleOrientation && orientation !== stableAppleOrientation;

      // Some WebKit builds can report transient scale=1 values during a pinch sequence.
      // A visual viewport materially narrower than the last normal-scale layout width is
      // therefore also treated as zoom, except across a real orientation change.
      const widthShowsPinch = !orientationChanged
        && stableAppleLayoutWidth > 0
        && visualWidth < stableAppleLayoutWidth * 0.98;
      const isPinchZoomed = scaleShowsPinch || widthShowsPinch;

      // A real orientation change can produce a much shorter/longer viewport than the
      // previous baseline. Accept the new orientation immediately at normal scale so an
      // already-focused field is not mistaken for an enormous keyboard.
      if (orientationChanged && !isPinchZoomed) {
        stableAppleLayoutHeight = currentLayoutHeight;
        stableAppleLayoutWidth = currentLayoutWidth;
        stableAppleOrientation = orientation;
      }

      const baselineHeight = stableAppleLayoutHeight || currentLayoutHeight;
      const visualKeyboardInsetAgainstBaseline = isPinchZoomed
        ? 0
        : Math.max(0, Math.round(baselineHeight - (visualHeight + offsetTop)));
      const iosKeyboardVisible = activeElementIsEditable
        && !isPinchZoomed
        && visualKeyboardInsetAgainstBaseline > KEYBOARD_INSET_THRESHOLD;

      // Refresh the stable layout baseline only when WebKit is demonstrably not pinch-
      // zoomed and the keyboard is not occupying the visual viewport. This prevents a
      // pinch-induced innerHeight change from ever shrinking the MONIEZI shell.
      if (!isPinchZoomed && !iosKeyboardVisible) {
        if (orientationChanged || currentLayoutHeight >= stableAppleLayoutHeight * 0.75) {
          stableAppleLayoutHeight = currentLayoutHeight;
          stableAppleLayoutWidth = currentLayoutWidth;
          stableAppleOrientation = orientation;
        }
      }

      const appHeight = iosKeyboardVisible ? visualHeight : stableAppleLayoutHeight;
      const keyboardInset = iosKeyboardVisible
        ? Math.max(0, Math.round(stableAppleLayoutHeight - (visualHeight + offsetTop)))
        : 0;

      document.documentElement.style.setProperty('--moniezi-app-vh', `${appHeight * 0.01}px`);
      document.documentElement.style.setProperty('--moniezi-layout-vh', `${stableAppleLayoutHeight * 0.01}px`);
      document.documentElement.style.setProperty('--moniezi-keyboard-inset', `${keyboardInset}px`);
      document.documentElement.style.setProperty(
        '--moniezi-ios-top-pad',
        !isPinchZoomed ? `${Math.max(16, Math.round(offsetTop + 16))}px` : '16px',
      );

      onEditingChange(iosKeyboardVisible);
      document.documentElement.classList.toggle('moniezi-keyboard-editing', iosKeyboardVisible);
      document.body.classList.toggle('moniezi-keyboard-editing', iosKeyboardVisible);

      if (!isPinchZoomed) {
        document.documentElement.scrollLeft = 0;
        document.body.scrollLeft = 0;
      }
    };

    const handleFocusState = () => {
      window.setTimeout(updateViewportVars, 40);
    };

    const handleOrientationChange = () => {
      // Let WebKit finish laying out the new orientation before accepting a new baseline.
      window.setTimeout(updateViewportVars, 120);
      window.setTimeout(updateViewportVars, 320);
    };

    updateViewportVars();
    window.addEventListener('resize', updateViewportVars);
    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('focusin', handleFocusState);
    window.addEventListener('focusout', handleFocusState);
    window.visualViewport?.addEventListener('resize', updateViewportVars);

    return () => {
      window.removeEventListener('resize', updateViewportVars);
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('focusin', handleFocusState);
      window.removeEventListener('focusout', handleFocusState);
      window.visualViewport?.removeEventListener('resize', updateViewportVars);
      document.documentElement.classList.remove('moniezi-keyboard-editing');
      document.body.classList.remove('moniezi-keyboard-editing');
    };
  }, [onEditingChange]);
}
