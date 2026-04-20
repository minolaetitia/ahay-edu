import { Injectable, signal } from '@angular/core';

/**
 * I18nService
 * Localization support for French and Malagasy
 */
@Injectable({
  providedIn: 'root',
})
export class I18nService {
  currentLanguage = signal<'fr' | 'mg'>('fr');

  private translations: Record<string, Record<string, string>> = {
    fr: {
      // Course Creation
      'courses.create.title': 'Créer un cours',
      'courses.create.form.title_label': 'Titre du cours',
      'courses.create.form.title_required': 'Titre requis',
      'courses.create.form.title_max': 'Titre limité à 200 caractères',
      'courses.create.form.description_label': 'Description (optionnel)',
      'courses.create.form.description_max': 'Description limité à 2000 caractères',
      'courses.create.form.price_label': 'Prix (MGA)',
      'courses.create.form.price_min': 'Prix doit être ≥ 0 MGA',
      'courses.create.form.price_type': 'Prix doit être un nombre',
      'courses.create.form.submit_button': 'Enregistrer le brouillon',
      'courses.create.form.cancel_button': 'Annuler',
      'courses.create.success_message': 'Cours créé avec succès',
      'courses.create.error_message': 'Erreur lors de la création du cours',

      // Course Catalog
      'courses.catalog.title': 'Catalogue des cours',
      'courses.catalog.search_placeholder': 'Rechercher par titre...',
      'courses.catalog.filter_price_label': 'Filtre par prix',
      'courses.catalog.enroll_button': "S'inscrire",
      'courses.catalog.buy_button': 'Acheter',
      'courses.catalog.empty_state': 'Aucun cours trouvé',

      // My Courses Dashboard (Story 2.1)
      'courses.my_courses': 'Mes cours',
      'courses.create.button': '+ Créer un cours',
      'courses.no_courses': 'Vous n\'avez pas encore créé de cours',
      'courses.create_first_course': 'Créer mon premier cours',
      'courses.status.draft': 'Brouillons',
      'courses.status.published': 'Publiés',
      'courses.status.unknown': 'Inconnu',
      'courses.no_description': 'Pas de description',
      'courses.publish.button': 'Publier',
      'courses.publish.success': 'Cours publié avec succès',
      'courses.publish.error': 'Erreur lors de la publication',
      'courses.unpublish.button': 'Dépublier',
      'courses.unpublish.success': 'Cours dépublié avec succès',
      'courses.unpublish.error': 'Erreur lors de la dépublication',
      'courses.view': 'Voir',
      'courses.delete': 'Supprimer',
      'courses.delete_confirm': 'Êtes-vous sûr de vouloir supprimer ce cours?',
      'courses.load_error': 'Erreur lors du chargement des cours',
      'courses.already_published': 'Ce cours est déjà publié',
      'courses.not_published': 'Ce cours n\'est pas publié',

      // Course Enrollment
      'courses.enroll.enroll_button': "S'inscrire",
      'courses.enroll.already_enrolled': 'Déjà inscrit',
      'courses.enroll.free_label': 'Gratuit',
      'courses.enroll.success': 'Vous êtes inscrit au cours',
      'courses.enroll.error': 'Erreur lors de l\'inscription',

      // Common
      'common.loading': 'Chargement...',
      'loading': 'Chargement...',
      'error': 'Erreur',
      'success': 'Succès',
    },
    mg: {
      // Course Creation
      'courses.create.title': 'Lumikha ny fianarana',
      'courses.create.form.title_label': 'Lohateny ny fianarana',
      'courses.create.form.title_required': 'Lohateny ilaina',
      'courses.create.form.title_max': 'Lohateny voafetra hatramin\'ny 200 ataon-tsoratra',
      'courses.create.form.description_label': 'Famaritana (optional)',
      'courses.create.form.description_max': 'Famaritana voafetra hatramin\'ny 2000 ataon-tsoratra',
      'courses.create.form.price_label': 'Vilivili (MGA)',
      'courses.create.form.price_min': 'Vilivili tsy maintsy >= 0 MGA',
      'courses.create.form.price_type': 'Vilivili tsy maintsy isanisa',
      'courses.create.form.submit_button': 'Tehirizaha ny rasmina',
      'courses.create.form.cancel_button': 'Fampitsarana',
      'courses.create.success_message': 'Nilikiana ny fianarana',
      'courses.create.error_message': 'Diso teo am-pamaritahana ny fianarana',

      // Course Catalog
      'courses.catalog.title': 'Katalogy ny fianarana',
      'courses.catalog.search_placeholder': 'Mandinika amin\'ny lohateny...',
      'courses.catalog.filter_price_label': 'Sivana amin\'ny vilivili',
      'courses.catalog.enroll_button': 'Mitoby',
      'courses.catalog.buy_button': 'Vidio',
      'courses.catalog.empty_state': 'Tsy mahita ny fianarana',

      // My Courses Dashboard (Story 2.1)
      'courses.my_courses': 'Ny fianarana',
      'courses.create.button': '+ Lumikha ny fianarana',
      'courses.no_courses': 'Tsy namikro ny fianarana intsony',
      'courses.create_first_course': 'Lumikha ny fianarana voalohany',
      'courses.status.draft': 'Rasmina',
      'courses.status.published': 'Navoaka',
      'courses.status.unknown': 'Tsy fantatra',
      'courses.no_description': 'Tsy misy famaritana',
      'courses.publish.button': 'Navoaka',
      'courses.publish.success': 'Navoaka ny fianarana',
      'courses.publish.error': 'Diso teo am-pavoakana',
      'courses.unpublish.button': 'Fampitsarana',
      'courses.unpublish.success': 'Fampitsinjarana ny fianarana',
      'courses.unpublish.error': 'Diso teo am-fampitsinjara',
      'courses.view': 'Hijery',
      'courses.delete': 'Hamafa',
      'courses.delete_confirm': 'Azafady antoka ve hoe hamafay ity fianarana ity?',
      'courses.load_error': 'Diso teo am-pamarikiana ny fianarana',
      'courses.already_published': 'Ity fianarana ity dia navoaka na',
      'courses.not_published': 'Ity fianarana ity dia tsy navoaka',

      // Course Enrollment
      'courses.enroll.enroll_button': 'Mitoby',
      'courses.enroll.already_enrolled': 'Nitoby na',
      'courses.enroll.free_label': 'Maimaimpoana',
      'courses.enroll.success': 'Nakajobo ianao sa fianarana',
      'courses.enroll.error': 'Diso teo am-pamaritahana',

      // Common
      'common.loading': 'Mijery...',
      'loading': 'Mijery...',
      'error': 'Diso',
      'success': 'Mahay',
    },
  };

  /**
   * Get translation by key
   */
  getTranslation(key: string): string {
    const lang = this.currentLanguage();
    return this.translations[lang]?.[key] ?? key;
  }

  /**
   * Set language
   */
  setLanguage(lang: 'fr' | 'mg'): void {
    this.currentLanguage.set(lang);
  }

  /**
   * Toggle language FR ↔ MG
   */
  toggleLanguage(): void {
    const current = this.currentLanguage();
    this.currentLanguage.set(current === 'fr' ? 'mg' : 'fr');
  }
}
