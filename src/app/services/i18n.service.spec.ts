import { TestBed } from '@angular/core/testing';
import { I18nService } from './i18n.service';

describe('I18nService (Story 2.1-2.4)', () => {
  let service: I18nService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [I18nService],
    });
    service = TestBed.inject(I18nService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ============================================
  // Language State
  // ============================================
  describe('Language State', () => {
    it('should default to French', () => {
      expect(service.currentLanguage()).toBe('fr');
    });

    it('should set language to Malagasy', () => {
      service.setLanguage('mg');
      expect(service.currentLanguage()).toBe('mg');
    });

    it('should toggle language between FR and MG', () => {
      service.setLanguage('fr');
      expect(service.currentLanguage()).toBe('fr');

      service.toggleLanguage();
      expect(service.currentLanguage()).toBe('mg');

      service.toggleLanguage();
      expect(service.currentLanguage()).toBe('fr');
    });

    it('should be a signal', () => {
      expect(typeof service.currentLanguage()).toBe('string');
      service.setLanguage('mg');
      expect(service.currentLanguage()).toBe('mg');
    });
  });

  // ============================================
  // Translation Keys - Story 2.1
  // ============================================
  describe('Course Creation Translations (Story 2.1)', () => {
    it('should have French translation for course creation title', () => {
      service.setLanguage('fr');
      const translation = service.getTranslation('courses.create.title');
      expect(translation).toBe('Créer un cours');
    });

    it('should have Malagasy translation for course creation title', () => {
      service.setLanguage('mg');
      const translation = service.getTranslation('courses.create.title');
      expect(translation).toBe('Lumikha ny fianarana');
    });

    it('should have French form labels', () => {
      service.setLanguage('fr');
      expect(service.getTranslation('courses.create.form.title_label')).toBe(
        'Titre du cours'
      );
      expect(
        service.getTranslation('courses.create.form.description_label')
      ).toBe('Description (optionnel)');
      expect(service.getTranslation('courses.create.form.price_label')).toBe(
        'Prix (MGA)'
      );
    });

    it('should have Malagasy form labels', () => {
      service.setLanguage('mg');
      expect(service.getTranslation('courses.create.form.title_label')).toBe(
        'Lohateny ny fianarana'
      );
      expect(
        service.getTranslation('courses.create.form.description_label')
      ).toBe('Famaritana (optional)');
      expect(service.getTranslation('courses.create.form.price_label')).toBe(
        'Vilivili (MGA)'
      );
    });

    it('should have French validation error messages', () => {
      service.setLanguage('fr');
      expect(
        service.getTranslation('courses.create.form.title_required')
      ).toContain('requis');
      expect(
        service.getTranslation('courses.create.form.title_max')
      ).toContain('200');
      expect(service.getTranslation('courses.create.form.price_min')).toContain(
        '0'
      );
    });

    it('should have Malagasy validation error messages', () => {
      service.setLanguage('mg');
      expect(
        service.getTranslation('courses.create.form.title_required')
      ).toBeTruthy();
      expect(service.getTranslation('courses.create.form.price_min')).toBeTruthy();
    });

    it('should have French success/error messages', () => {
      service.setLanguage('fr');
      expect(
        service.getTranslation('courses.create.success_message')
      ).toContain('créé');
      expect(service.getTranslation('courses.create.error_message')).toBeTruthy();
    });
  });

  // ============================================
  // Translation Keys - Story 2.3
  // ============================================
  describe('Course Catalog Translations (Story 2.3)', () => {
    it('should have French catalog translations', () => {
      service.setLanguage('fr');
      expect(service.getTranslation('courses.catalog.title')).toBe(
        'Catalogue des cours'
      );
      expect(
        service.getTranslation('courses.catalog.search_placeholder')
      ).toContain('Rechercher');
      expect(service.getTranslation('courses.catalog.enroll_button')).toContain(
        'inscrire'
      );
    });

    it('should have Malagasy catalog translations', () => {
      service.setLanguage('mg');
      expect(service.getTranslation('courses.catalog.title')).toBe(
        'Katalogy ny fianarana'
      );
      expect(service.getTranslation('courses.catalog.enroll_button')).toBeTruthy();
    });
  });

  // ============================================
  // Translation Keys - Story 2.4
  // ============================================
  describe('Enrollment Translations (Story 2.4)', () => {
    it('should have French enrollment translations', () => {
      service.setLanguage('fr');
      expect(service.getTranslation('courses.enroll.free_label')).toBe(
        'Gratuit'
      );
      expect(service.getTranslation('courses.enroll.success')).toContain(
        'inscrit'
      );
    });

    it('should have Malagasy enrollment translations', () => {
      service.setLanguage('mg');
      expect(service.getTranslation('courses.enroll.free_label')).toBe(
        'Maimaimpoana'
      );
      expect(service.getTranslation('courses.enroll.success')).toBeTruthy();
    });
  });

  // ============================================
  // Common Translations
  // ============================================
  describe('Common Translations', () => {
    it('should have French loading message', () => {
      service.setLanguage('fr');
      expect(service.getTranslation('loading')).toBe('Chargement...');
    });

    it('should have Malagasy loading message', () => {
      service.setLanguage('mg');
      expect(service.getTranslation('loading')).toBe('Mijery...');
    });

    it('should have French error message', () => {
      service.setLanguage('fr');
      expect(service.getTranslation('error')).toBe('Erreur');
    });

    it('should have Malagasy error message', () => {
      service.setLanguage('mg');
      expect(service.getTranslation('error')).toBe('Diso');
    });
  });

  // ============================================
  // Missing Translation Handling
  // ============================================
  describe('Missing Translation Handling', () => {
    it('should return key if translation not found', () => {
      const result = service.getTranslation('non.existent.key');
      expect(result).toBe('non.existent.key');
    });

    it('should work across language changes', () => {
      service.setLanguage('fr');
      const frTranslation = service.getTranslation(
        'courses.create.form.title_label'
      );

      service.setLanguage('mg');
      const mgTranslation = service.getTranslation(
        'courses.create.form.title_label'
      );

      expect(frTranslation).not.toBe(mgTranslation);
    });
  });

  // ============================================
  // Integration
  // ============================================
  describe('Integration Tests', () => {
    it('should support rapid language switching', () => {
      for (let i = 0; i < 10; i++) {
        service.toggleLanguage();
        const translation = service.getTranslation('loading');
        expect(translation).toBeTruthy();
      }
    });

    it('should maintain consistent translations across multiple calls', () => {
      service.setLanguage('fr');
      const translation1 = service.getTranslation('loading');
      const translation2 = service.getTranslation('loading');
      expect(translation1).toBe(translation2);
    });

    it('should support switching all language-dependent texts', () => {
      const keys = [
        'courses.create.title',
        'courses.create.form.title_label',
        'courses.create.form.submit_button',
        'loading',
        'error',
      ];

      service.setLanguage('fr');
      const frTranslations = keys.map((k) => service.getTranslation(k));

      service.setLanguage('mg');
      const mgTranslations = keys.map((k) => service.getTranslation(k));

      // At least some translations should differ
      expect(
        frTranslations.some((ft, i) => ft !== mgTranslations[i])
      ).toBe(true);
    });
  });
});
