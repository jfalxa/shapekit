import { describe, it, expect, beforeEach, vi } from "vitest";
import { Image } from "../src/renderables/image.js";

// @ts-ignore
globalThis.VideoFrame = class {};
// @ts-ignore
globalThis.SVGImageElement = class {};

// Mock HTMLImageElement for testing
const createMockImage = (width = 100, height = 50) => {
  const mockImage = {
    width,
    height,
    complete: true,
    src: "",
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  } as unknown as HTMLImageElement;
  return mockImage;
};

describe("Image", () => {
  let image: Image;
  let mockImageElement: HTMLImageElement;

  beforeEach(() => {
    mockImageElement = createMockImage();
    image = new Image({
      image: mockImageElement,
    });
  });

  describe("Constructor and Initialization", () => {
    it("should initialize with image element", () => {
      expect(image.image).toBe(mockImageElement);
      expect(image.width).toBeUndefined();
      expect(image.height).toBeUndefined();
    });

    it("should initialize with explicit dimensions", () => {
      const imageWithDimensions = new Image({
        image: mockImageElement,
        width: 200,
        height: 100,
      });

      expect(imageWithDimensions.image).toBe(mockImageElement);
      expect(imageWithDimensions.width).toBe(200);
      expect(imageWithDimensions.height).toBe(100);
    });

    it("should initialize with transform properties", () => {
      const transformedImage = new Image({
        image: mockImageElement,
        x: 50,
        y: 25,
        rotation: Math.PI / 4,
        scaleX: 2,
      });

      expect(transformedImage.x).toBe(50);
      expect(transformedImage.y).toBe(25);
      expect(transformedImage.rotation).toBe(Math.PI / 4);
      expect(transformedImage.scaleX).toBe(2);
    });
  });

  describe("Image Element", () => {
    it("should handle different image elements", () => {
      const image1 = createMockImage(200, 100);
      const image2 = createMockImage(50, 75);

      image.image = image1;
      expect(image.image).toBe(image1);

      image.image = image2;
      expect(image.image).toBe(image2);
    });

    it("should handle undefined image", () => {
      // @ts-ignore - Testing runtime behavior
      image.image = undefined;
      expect(image.image).toBeUndefined();
    });

    it("should handle null image", () => {
      // @ts-ignore - Testing runtime behavior
      image.image = null;
      expect(image.image).toBeNull();
    });
  });

  describe("Dimensions", () => {
    it("should use natural dimensions when not specified", () => {
      const naturalImage = new Image({
        image: createMockImage(150, 75),
      });

      expect(naturalImage.width).toBeUndefined();
      expect(naturalImage.height).toBeUndefined();
      // Natural dimensions would be used during rendering
    });

    it("should override with explicit width", () => {
      image.width = 300;
      expect(image.width).toBe(300);
      expect(image.height).toBeUndefined();
    });

    it("should override with explicit height", () => {
      image.height = 150;
      expect(image.height).toBe(150);
      expect(image.width).toBeUndefined();
    });

    it("should handle both width and height", () => {
      image.width = 400;
      image.height = 200;

      expect(image.width).toBe(400);
      expect(image.height).toBe(200);
    });

    it("should handle zero dimensions", () => {
      image.width = 0;
      image.height = 0;

      expect(image.width).toBe(0);
      expect(image.height).toBe(0);
    });

    it("should handle negative dimensions", () => {
      image.width = -100;
      image.height = -50;

      expect(image.width).toBe(-100);
      expect(image.height).toBe(-50);
    });

    it("should handle fractional dimensions", () => {
      image.width = 100.5;
      image.height = 50.7;

      expect(image.width).toBe(100.5);
      expect(image.height).toBe(50.7);
    });
  });

  describe("Aspect Ratio", () => {
    it("should maintain aspect ratio with natural dimensions", () => {
      const aspectImage = new Image({
        image: createMockImage(200, 100), // 2:1 aspect ratio
      });

      // Natural aspect ratio should be preserved when only one dimension is set
      // This would be handled in rendering logic
      expect(aspectImage.image.width).toBe(200);
      expect(aspectImage.image.height).toBe(100);
    });

    it("should allow aspect ratio distortion with explicit dimensions", () => {
      const distortedImage = new Image({
        image: createMockImage(200, 100),
        width: 100, // Different aspect ratio
        height: 200,
      });

      expect(distortedImage.width).toBe(100);
      expect(distortedImage.height).toBe(200);
      // Original aspect ratio: 2:1, new aspect ratio: 1:2
    });
  });

  describe("Image Loading States", () => {
    it("should handle loaded image", () => {
      const loadedImage = createMockImage(100, 50);
      loadedImage.complete = true;

      const img = new Image({ image: loadedImage });
      expect(img.image.complete).toBe(true);
    });

    it("should handle loading image", () => {
      const loadingImage = createMockImage(100, 50);
      loadingImage.complete = false;

      const img = new Image({ image: loadingImage });
      expect(img.image.complete).toBe(false);
    });

    it("should handle image with source URL", () => {
      const imageWithSrc = createMockImage(100, 50);
      imageWithSrc.src = "https://example.com/image.jpg";

      const img = new Image({ image: imageWithSrc });
      expect(img.image.src).toBe("https://example.com/image.jpg");
    });
  });

  describe("Static Load Method", () => {
    it("should have static load method", () => {
      expect(typeof Image.load).toBe("function");
    });

    // Note: Testing actual image loading would require mocking browser APIs
    // or using a more complex test environment. For now, we just verify the method exists.
  });

  describe("Transform Integration", () => {
    it("should maintain image properties when transformed", () => {
      const originalImage = image.image;
      const originalWidth = image.width;

      image.x = 100;
      image.y = 50;
      image.rotation = Math.PI / 4;
      image.scaleX = 2;

      expect(image.image).toBe(originalImage);
      expect(image.width).toBe(originalWidth);
    });

    it("should update when transform changes", () => {
      const initialVersion = image.__version;

      image.x = 10;
      expect(image.__version).toBeGreaterThan(initialVersion);
    });

    it("should handle scaling with images", () => {
      image.width = 100;
      image.height = 50;
      image.scaleX = 2;
      image.scaleY = 0.5;

      expect(image.width).toBe(100); // Explicit size should remain
      expect(image.height).toBe(50);
      expect(image.scaleX).toBe(2);
      expect(image.scaleY).toBe(0.5);
    });

    it("should handle rotation", () => {
      image.rotation = Math.PI / 2; // 90 degrees

      expect(image.rotation).toBe(Math.PI / 2);
      // Image should maintain its properties
      expect(image.image).toBe(mockImageElement);
    });
  });

  describe("Edge Cases", () => {
    it("should handle very large images", () => {
      const largeImage = createMockImage(5000, 3000);
      const img = new Image({
        image: largeImage,
        width: 5000,
        height: 3000,
      });

      expect(img.width).toBe(5000);
      expect(img.height).toBe(3000);
      expect(img.image).toBe(largeImage);
    });

    it("should handle very small images", () => {
      const tinyImage = createMockImage(1, 1);
      const img = new Image({
        image: tinyImage,
        width: 0.1,
        height: 0.1,
      });

      expect(img.width).toBe(0.1);
      expect(img.height).toBe(0.1);
      expect(img.image).toBe(tinyImage);
    });

    it("should handle extreme scaling", () => {
      image.scaleX = 100;
      image.scaleY = 0.01;

      expect(image.scaleX).toBe(100);
      expect(image.scaleY).toBe(0.01);
    });

    it("should handle extreme rotation", () => {
      image.rotation = 10 * Math.PI; // Many full rotations

      expect(image.rotation).toBe(10 * Math.PI);
    });

    it("should handle NaN dimensions", () => {
      image.width = NaN;
      image.height = NaN;

      expect(image.width).toBeNaN();
      expect(image.height).toBeNaN();
    });

    it("should handle Infinity dimensions", () => {
      image.width = Infinity;
      image.height = -Infinity;

      expect(image.width).toBe(Infinity);
      expect(image.height).toBe(-Infinity);
    });
  });

  describe("Image Formats and Types", () => {
    it("should handle different image formats conceptually", () => {
      // Test different mock images representing different formats
      const jpegImage = createMockImage(800, 600);
      jpegImage.src = "image.jpg";

      const pngImage = createMockImage(512, 512);
      pngImage.src = "image.png";

      const svgImage = createMockImage(100, 100);
      svgImage.src = "image.svg";

      const img1 = new Image({ image: jpegImage });
      const img2 = new Image({ image: pngImage });
      const img3 = new Image({ image: svgImage });

      expect(img1.image.src).toContain(".jpg");
      expect(img2.image.src).toContain(".png");
      expect(img3.image.src).toContain(".svg");
    });
  });

  describe("Memory and Performance", () => {
    it("should handle many image instances", () => {
      const images: Image[] = [];

      for (let i = 0; i < 100; i++) {
        const mockImg = createMockImage(50 + i, 25 + i);
        images.push(
          new Image({
            image: mockImg,
            x: i * 10,
            y: i * 5,
          })
        );
      }

      expect(images.length).toBe(100);
      expect(images[50].x).toBe(500);
      expect(images[99].image.width).toBe(149);
    });

    it("should handle rapid image swapping", () => {
      const image1 = createMockImage(100, 100);
      const image2 = createMockImage(200, 200);
      const image3 = createMockImage(300, 300);

      image.image = image1;
      expect(image.image).toBe(image1);

      image.image = image2;
      expect(image.image).toBe(image2);

      image.image = image3;
      expect(image.image).toBe(image3);

      // Should not retain references to old images
      image.image = image1;
      expect(image.image).toBe(image1);
    });
  });

  describe("Integration Scenarios", () => {
    it("should work in complex transform scenarios", () => {
      const complexImage = new Image({
        image: createMockImage(400, 300),
        x: 100,
        y: 50,
        width: 200,
        height: 150,
        scaleX: 1.5,
        scaleY: 0.8,
        rotation: Math.PI / 6,
        skewX: 0.1,
      });

      expect(complexImage.x).toBe(100);
      expect(complexImage.y).toBe(50);
      expect(complexImage.width).toBe(200);
      expect(complexImage.height).toBe(150);
      expect(complexImage.scaleX).toBe(1.5);
      expect(complexImage.scaleY).toBe(0.8);
      expect(complexImage.rotation).toBe(Math.PI / 6);
      expect(complexImage.skewX).toBe(0.1);
    });

    it("should handle dynamic resizing", () => {
      image.width = 100;
      image.height = 100;

      // Simulate responsive resizing
      image.width = 200;
      expect(image.width).toBe(200);
      expect(image.height).toBe(100);

      image.height = 200;
      expect(image.height).toBe(200);

      // Reset to natural size
      image.width = undefined;
      image.height = undefined;
      expect(image.width).toBeUndefined();
      expect(image.height).toBeUndefined();
    });
  });
});
