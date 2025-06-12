import { describe, it, expect, beforeEach } from 'vitest';
import { Text } from '../src/renderables/text.js';

describe('Text', () => {
  let text: Text;

  beforeEach(() => {
    text = new Text({
      text: 'Hello World'
    });
  });

  describe('Constructor and Initialization', () => {
    it('should initialize with basic text', () => {
      expect(text.text).toBe('Hello World');
      expect(text.fontSize).toBeUndefined();
      expect(text.fontFamily).toBeUndefined();
      expect(text.textAlign).toBeUndefined();
      expect(text.width).toBeUndefined();
      expect(text.height).toBeUndefined();
    });

    it('should initialize with all text properties', () => {
      const fullText = new Text({
        text: 'Sample Text',
        fontSize: 16,
        fontFamily: 'Arial',
        textAlign: 'center',
        textBaseline: 'middle',
        width: 200,
        height: 100,
        padding: 10
      });

      expect(fullText.text).toBe('Sample Text');
      expect(fullText.fontSize).toBe(16);
      expect(fullText.fontFamily).toBe('Arial');
      expect(fullText.textAlign).toBe('center');
      expect(fullText.textBaseline).toBe('middle');
      expect(fullText.width).toBe(200);
      expect(fullText.height).toBe(100);
      expect(fullText.padding).toBe(10);
    });

    it('should initialize with styling properties', () => {
      const styledText = new Text({
        text: 'Styled Text',
        textFill: 'red',
        textStroke: 'blue',
        textLineWidth: 2,
        fontWeight: 'bold',
        fontStyle: 'italic'
      });

      expect(styledText.textFill).toBe('red');
      expect(styledText.textStroke).toBe('blue');
      expect(styledText.textLineWidth).toBe(2);
      expect(styledText.fontWeight).toBe('bold');
      expect(styledText.fontStyle).toBe('italic');
    });
  });

  describe('Text Content', () => {
    it('should handle empty text', () => {
      const emptyText = new Text({ text: '' });
      expect(emptyText.text).toBe('');
    });

    it('should handle long text', () => {
      const longText = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.';
      text.text = longText;
      expect(text.text).toBe(longText);
    });

    it('should handle special characters', () => {
      const specialText = 'Special: !@#$%^&*()_+-=[]{}|;:,.<>?/~`';
      text.text = specialText;
      expect(text.text).toBe(specialText);
    });

    it('should handle unicode characters', () => {
      const unicodeText = 'Unicode: 🚀 αβγ 中文 العربية';
      text.text = unicodeText;
      expect(text.text).toBe(unicodeText);
    });

    it('should handle multiline text', () => {
      const multilineText = 'Line 1\nLine 2\nLine 3';
      text.text = multilineText;
      expect(text.text).toBe(multilineText);
    });

    it('should handle text with tabs and spaces', () => {
      const whitespaceText = 'Text\twith\ttabs and   spaces';
      text.text = whitespaceText;
      expect(text.text).toBe(whitespaceText);
    });
  });

  describe('Font Properties', () => {
    it('should handle font size', () => {
      text.fontSize = 24;
      expect(text.fontSize).toBe(24);

      text.fontSize = 8;
      expect(text.fontSize).toBe(8);

      text.fontSize = 72;
      expect(text.fontSize).toBe(72);
    });

    it('should handle font family', () => {
      text.fontFamily = 'Arial';
      expect(text.fontFamily).toBe('Arial');

      text.fontFamily = 'Times New Roman';
      expect(text.fontFamily).toBe('Times New Roman');

      text.fontFamily = 'monospace';
      expect(text.fontFamily).toBe('monospace');

      text.fontFamily = '"Custom Font", serif';
      expect(text.fontFamily).toBe('"Custom Font", serif');
    });

    it('should handle font weight', () => {
      text.fontWeight = 'normal';
      expect(text.fontWeight).toBe('normal');

      text.fontWeight = 'bold';
      expect(text.fontWeight).toBe('bold');

      text.fontWeight = '300';
      expect(text.fontWeight).toBe('300');

      text.fontWeight = '900';
      expect(text.fontWeight).toBe('900');
    });

    it('should handle font style', () => {
      text.fontStyle = 'normal';
      expect(text.fontStyle).toBe('normal');

      text.fontStyle = 'italic';
      expect(text.fontStyle).toBe('italic');

      text.fontStyle = 'oblique';
      expect(text.fontStyle).toBe('oblique');
    });

    it('should handle font variant', () => {
      text.fontVariant = 'normal';
      expect(text.fontVariant).toBe('normal');

      text.fontVariant = 'small-caps';
      expect(text.fontVariant).toBe('small-caps');
    });
  });

  describe('Text Alignment', () => {
    it('should handle horizontal alignment', () => {
      text.textAlign = 'left';
      expect(text.textAlign).toBe('left');

      text.textAlign = 'center';
      expect(text.textAlign).toBe('center');

      text.textAlign = 'right';
      expect(text.textAlign).toBe('right');

      text.textAlign = 'start';
      expect(text.textAlign).toBe('start');

      text.textAlign = 'end';
      expect(text.textAlign).toBe('end');
    });

    it('should handle vertical alignment', () => {
      text.textBaseline = 'top';
      expect(text.textBaseline).toBe('top');

      text.textBaseline = 'middle';
      expect(text.textBaseline).toBe('middle');

      text.textBaseline = 'bottom';
      expect(text.textBaseline).toBe('bottom');

      text.textBaseline = 'alphabetic';
      expect(text.textBaseline).toBe('alphabetic');

      text.textBaseline = 'hanging';
      expect(text.textBaseline).toBe('hanging');
    });

    it('should handle text direction', () => {
      text.direction = 'ltr';
      expect(text.direction).toBe('ltr');

      text.direction = 'rtl';
      expect(text.direction).toBe('rtl');

      text.direction = 'inherit';
      expect(text.direction).toBe('inherit');
    });

    it('should handle vertical alignment', () => {
      text.textVerticalAlign = 'top';
      expect(text.textVerticalAlign).toBe('top');

      text.textVerticalAlign = 'middle';
      expect(text.textVerticalAlign).toBe('middle');

      text.textVerticalAlign = 'bottom';
      expect(text.textVerticalAlign).toBe('bottom');
    });
  });

  describe('Layout Properties', () => {
    it('should handle width constraints', () => {
      text.width = 200;
      expect(text.width).toBe(200);

      text.width = 0;
      expect(text.width).toBe(0);

      text.width = undefined;
      expect(text.width).toBeUndefined();
    });

    it('should handle height constraints', () => {
      text.height = 100;
      expect(text.height).toBe(100);

      text.height = 0;
      expect(text.height).toBe(0);

      text.height = undefined;
      expect(text.height).toBeUndefined();
    });

    it('should handle padding', () => {
      text.padding = 10;
      expect(text.padding).toBe(10);

      text.padding = 0;
      expect(text.padding).toBe(0);

      text.padding = 25.5;
      expect(text.padding).toBe(25.5);
    });

    it('should handle line height', () => {
      text.lineHeight = 1.5;
      expect(text.lineHeight).toBe(1.5);

      text.lineHeight = 20;
      expect(text.lineHeight).toBe(20);

      text.lineHeight = 1;
      expect(text.lineHeight).toBe(1);
    });

  });

  describe('Text Styling', () => {
    it('should handle text fill color', () => {
      text.textFill = 'red';
      expect(text.textFill).toBe('red');

      text.textFill = '#ff0000';
      expect(text.textFill).toBe('#ff0000');

      text.textFill = 'rgb(255, 0, 0)';
      expect(text.textFill).toBe('rgb(255, 0, 0)');

      text.textFill = 'rgba(255, 0, 0, 0.5)';
      expect(text.textFill).toBe('rgba(255, 0, 0, 0.5)');
    });

    it('should handle text stroke', () => {
      text.textStroke = 'blue';
      expect(text.textStroke).toBe('blue');

      text.textLineWidth = 2;
      expect(text.textLineWidth).toBe(2);

      text.textLineWidth = 0;
      expect(text.textLineWidth).toBe(0);

      text.textLineWidth = 0.5;
      expect(text.textLineWidth).toBe(0.5);
    });

  });


  describe('Transform Integration', () => {
    it('should maintain text properties when transformed', () => {
      const originalText = text.text;
      const originalFontSize = text.fontSize;
      
      text.x = 100;
      text.y = 50;
      text.rotation = Math.PI / 4;
      text.scaleX = 2;
      
      expect(text.text).toBe(originalText);
      expect(text.fontSize).toBe(originalFontSize);
    });

    it('should update when transform changes', () => {
      const initialVersion = text.__version;
      
      text.x = 10;
      expect(text.__version).toBeGreaterThan(initialVersion);
    });

    it('should handle scaling with text', () => {
      text.fontSize = 16;
      text.scaleX = 2;
      text.scaleY = 0.5;
      
      expect(text.fontSize).toBe(16); // Font size should remain unchanged
      expect(text.scaleX).toBe(2);
      expect(text.scaleY).toBe(0.5);
    });
  });

  describe('Edge Cases', () => {
    it('should handle null and undefined text', () => {
      // @ts-ignore - Testing runtime behavior
      text.text = null;
      expect(text.text).toBeNull();

      // @ts-ignore - Testing runtime behavior
      text.text = undefined;
      expect(text.text).toBeUndefined();
    });

    it('should handle extreme font sizes', () => {
      text.fontSize = 0;
      expect(text.fontSize).toBe(0);

      text.fontSize = 1000;
      expect(text.fontSize).toBe(1000);

      text.fontSize = 0.1;
      expect(text.fontSize).toBe(0.1);
    });

    it('should handle negative dimensions', () => {
      text.width = -100;
      expect(text.width).toBe(-100);

      text.height = -50;
      expect(text.height).toBe(-50);

      text.padding = -10;
      expect(text.padding).toBe(-10);
    });

    it('should handle extreme line height values', () => {
      text.lineHeight = 0.1;
      expect(text.lineHeight).toBe(0.1);

      text.lineHeight = 10;
      expect(text.lineHeight).toBe(10);
    });

    it('should handle very long font family names', () => {
      const longFontFamily = 'A'.repeat(1000);
      text.fontFamily = longFontFamily;
      expect(text.fontFamily).toBe(longFontFamily);
    });

    it('should handle invalid color values', () => {
      text.textFill = 'invalidcolor';
      expect(text.textFill).toBe('invalidcolor');

      text.textStroke = '#gggggg';
      expect(text.textStroke).toBe('#gggggg');
    });
  });

  describe('Complex Text Scenarios', () => {
    it('should handle rich text simulation', () => {
      const richText = new Text({
        text: 'Rich Text Example',
        fontSize: 18,
        fontFamily: 'Arial, sans-serif',
        fontWeight: 'bold',
        fontStyle: 'italic',
        textFill: '#333333',
        textStroke: '#ffffff',
        textLineWidth: 1,
        textAlign: 'center',
        textBaseline: 'middle',
        width: 300,
        height: 100,
        padding: 20,
        lineHeight: 1.4
      });

      expect(richText.text).toBe('Rich Text Example');
      expect(richText.fontSize).toBe(18);
      expect(richText.fontWeight).toBe('bold');
      expect(richText.fontStyle).toBe('italic');
      expect(richText.textAlign).toBe('center');
      expect(richText.width).toBe(300);
      expect(richText.padding).toBe(20);
    });

    it('should handle text with constrained layout', () => {
      const constrainedText = new Text({
        text: 'This is a very long text that should wrap within the specified width constraints.',
        width: 200,
        height: 100,
        padding: 10,
        fontSize: 14,
        lineHeight: 1.5,
        textAlign: 'center'
      });

      expect(constrainedText.width).toBe(200);
      expect(constrainedText.height).toBe(100);
      expect(constrainedText.textAlign).toBe('center');
    });

    it('should handle multilingual text', () => {
      const multilingualText = new Text({
        text: 'English العربية 中文 日本語 한국어 Русский',
        fontFamily: 'Arial Unicode MS, sans-serif',
        direction: 'ltr',
        fontSize: 16
      });

      expect(multilingualText.direction).toBe('ltr');
      expect(multilingualText.fontFamily).toBe('Arial Unicode MS, sans-serif');
    });
  });

  describe('Text Methods', () => {
    it('should have getWidth method', () => {
      expect(typeof text.getWidth).toBe('function');
      
      // With explicit width
      text.width = 200;
      expect(text.getWidth()).toBe(200);
      
      // Without explicit width (should return natural width)
      text.width = undefined;
      expect(typeof text.getWidth()).toBe('number');
    });

    it('should have getHeight method', () => {
      expect(typeof text.getHeight).toBe('function');
      
      // With explicit height
      text.height = 100;
      expect(text.getHeight()).toBe(100);
      
      // Without explicit height (should calculate based on lines)
      text.height = undefined;
      expect(typeof text.getHeight()).toBe('number');
    });

    it('should have format method', () => {
      expect(typeof text.format).toBe('function');
      expect(() => text.format()).not.toThrow();
    });

    it('should have font property after formatting', () => {
      text.fontSize = 16;
      text.fontFamily = 'Arial';
      text.format();
      expect(typeof text.font).toBe('string');
    });

    it('should have lines property after formatting', () => {
      text.format();
      expect(Array.isArray(text.lines)).toBe(true);
    });

    it('should have naturalWidth and naturalHeight after formatting', () => {
      text.format();
      expect(typeof text.naturalWidth).toBe('number');
      expect(typeof text.naturalHeight).toBe('number');
    });
  });

  describe('Text Update', () => {
    it('should call format when dirty after update', () => {
      text.fontSize = 20; // This should mark as dirty
      text.update();
      
      // Font should be updated after format is called
      expect(text.font).toBeDefined();
    });

    it('should not call format when not dirty', () => {
      text.format(); // Ensure it's formatted
      text.__isDirty = false;
      
      const originalFont = text.font;
      text.update();
      
      expect(text.font).toBe(originalFont);
    });
  });
});