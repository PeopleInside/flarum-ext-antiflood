import app from 'flarum/forum/app';

app.initializers.add('peopleinside/antiflood', () => {
  // Fix emoji rendering in multi-line code blocks
  // This ensures emojis are properly displayed in both single-line and multi-line code blocks
  
  // Initialize on page load
  fixEmojiInCodeBlocks();
  
  // Watch for new content being added (e.g., new posts, live updates)
  const observer = new MutationObserver(() => {
    fixEmojiInCodeBlocks();
  });
  
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
  // Comprehensive emoji unicode ranges
  const emojiRegex = /[\u{1F300}-\u{1F9FF}|\u{2600}-\u{26FF}|\u{2700}-\u{27BF}]/gu;
  return emojiRegex.test(text);
}

function applyEmojiRendering(element: HTMLElement) {
  // Ensure emojis are rendered properly by adding emoji fonts to font stack
  const currentFont = window.getComputedStyle(element).fontFamily;
  
  // Add emoji fonts to the font stack if not already present
  if (!currentFont.includes('emoji')) {
    element.style.fontFamily = `${currentFont}, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"`;
  }
  
  // Ensure text rendering supports color emoji
  element.style.textRendering = 'optimizeLegibility';
  
  // Mark as processed to avoid repeated processing
  element.setAttribute('data-emoji-fixed', 'true');
}

