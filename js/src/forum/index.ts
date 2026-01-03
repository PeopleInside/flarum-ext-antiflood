import app from 'flarum/forum/app';

app.initializers.add('peopleinside/antiflood', () => {
  // Fix emoji rendering in multi-line code blocks
  // This ensures emojis are properly displayed in both single-line and multi-line code blocks
  
  // Initialize on page load
  fixEmojiInCodeBlocks();
  
  // Debounce function to limit mutation observer calls
  let timeoutId: number | null = null;
  const debouncedFix = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = window.setTimeout(() => {
      fixEmojiInCodeBlocks();
      timeoutId = null;
    }, 100);
  };
  
  // Watch for new content being added (e.g., new posts, live updates)
  const observer = new MutationObserver(debouncedFix);
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
});

function fixEmojiInCodeBlocks() {
  // Find all code blocks (both inline and multi-line)
  const codeBlocks = document.querySelectorAll('pre code, code');
  
  codeBlocks.forEach((block: HTMLElement) => {
    // Skip if already processed
    if (block.hasAttribute('data-emoji-fixed')) {
      return;
    }
    
    // Check if the content contains emojis
    if (needsEmojiFixing(block)) {
      applyEmojiRendering(block);
    }
  });
}

function needsEmojiFixing(element: HTMLElement): boolean {
  // Check if element contains emoji unicode ranges
  const text = element.textContent || '';
  // Comprehensive emoji unicode ranges including:
  // - Basic emoticons and symbols (2600-27BF)
  // - Miscellaneous Symbols and Pictographs (1F300-1F5FF)
  // - Emoticons (1F600-1F64F)
  // - Transport and Map Symbols (1F680-1F6FF)
  // - Supplemental Symbols and Pictographs (1F900-1F9FF)
  // - Skin tone modifiers (1F3FB-1F3FF)
  const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{27BF}]/gu;
  return emojiRegex.test(text);
}

function applyEmojiRendering(element: HTMLElement) {
  // Ensure emojis are rendered properly by adding emoji fonts to font stack
  const currentFont = window.getComputedStyle(element).fontFamily;
  
  // Always append emoji fonts to ensure proper rendering
  // This is safe and doesn't hurt even if some fonts are already in the stack
  element.style.fontFamily = `${currentFont}, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"`;
  
  // Ensure text rendering supports color emoji
  element.style.textRendering = 'optimizeLegibility';
  
  // Mark as processed to avoid repeated processing
  element.setAttribute('data-emoji-fixed', 'true');
}


