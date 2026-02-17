import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Type definitions for store settings
export interface StoreLocation {
  name_en: string;
  name_ar: string;
  street_en: string;
  street_ar: string;
  building_en: string;
  building_ar: string;
  city_en: string;
  city_ar: string;
  country_en: string;
  country_ar: string;
  plus_code: string;
  latitude: number;
  longitude: number;
  google_maps_url: string;
  google_maps_embed: string;
}

export interface StoreContact {
  phone: string;
  phone_intl: string;
  whatsapp: string;
  email: string;
  website: string;
  vat_number?: string;
  license_number?: string;
  adcci_number?: string;
  company_name_en?: string;
  company_name_ar?: string;
}

export interface StoreHours {
  opening: string;
  closing: string;
  display_en: string;
  display_ar: string;
  friday_opening: string;
  friday_closing: string;
}

export interface StoreSocial {
  instagram: string;
  facebook: string;
  tiktok: string;
}

export interface StoreSettings {
  location: StoreLocation;
  contact: StoreContact;
  hours: StoreHours;
  social: StoreSocial;
}

// Default values (fallback if database is unavailable)
// Single source of truth: https://maps.app.goo.gl/9aWnaRme1t6AtXTp6
export const defaultStoreSettings: StoreSettings = {
  location: {
    name_en: "Al Saraya Butchery",
    name_ar: "ملحمة السرايا",
    street_en: "7 Ash Shoulah Street, Al Bateen W10",
    street_ar: "شارع الشولة 7 - البطين W10",
    building_en: "Al Hana Tower",
    building_ar: "برج الهناء",
    city_en: "Abu Dhabi",
    city_ar: "أبوظبي",
    country_en: "United Arab Emirates",
    country_ar: "الإمارات العربية المتحدة",
    plus_code: "F8CQ+CWH",
    latitude: 24.4574,
    longitude: 54.3364,
    google_maps_url: "https://maps.app.goo.gl/9aWnaRme1t6AtXTp6",
    google_maps_embed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3631.5!2d54.3344!3d24.4574!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e5e41278a6c89d5%3A0x6c13e4a1acf8cd8!2sAl%20Saraya%20butcher%20-%20%D9%85%D9%84%D8%AD%D9%85%D8%A9%20%D8%A7%D9%84%D8%B3%D8%B1%D8%A7%D9%8A%D8%A7!5e0!3m2!1sen!2sae!4v1"
  },
  contact: {
    phone: "023339111",
    phone_intl: "+971-2-333-9111",
    whatsapp: "971566808565",
    email: "info@alsarayabutcheryllc.com",
    website: "https://alsarayabutcheryllc.com"
  },
  hours: {
    opening: "08:00",
    closing: "23:00",
    display_en: "8 AM - 11 PM",
    display_ar: "8 ص - 11 م",
    friday_opening: "08:00",
    friday_closing: "23:00"
  },
  social: {
    instagram: "https://www.instagram.com/alsarayabutchery",
    facebook: "https://www.facebook.com/share/1FKCgTe4fD/",
    tiktok: "https://www.tiktok.com/@alsarayabutchery"
  }
};

export function useStoreSettings() {
  const query = useQuery({
    queryKey: ['store-settings'],
    queryFn: async (): Promise<StoreSettings> => {
      const { data, error } = await supabase
        .from('store_settings')
        .select('key, value');

      if (error) {
        console.warn('[useStoreSettings] Error fetching settings:', error);
        return defaultStoreSettings;
      }

      const settings: Partial<StoreSettings> = {};
      
      data?.forEach((row: { key: string; value: unknown }) => {
        switch (row.key) {
          case 'location':
            settings.location = row.value as StoreLocation;
            break;
          case 'contact':
            settings.contact = row.value as StoreContact;
            break;
          case 'hours':
            settings.hours = row.value as StoreHours;
            break;
          case 'social':
            settings.social = row.value as StoreSocial;
            break;
        }
      });

      return {
        location: settings.location || defaultStoreSettings.location,
        contact: settings.contact || defaultStoreSettings.contact,
        hours: settings.hours || defaultStoreSettings.hours,
        social: settings.social || defaultStoreSettings.social,
      };
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });

  return {
    settings: query.data || defaultStoreSettings,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

// Helper functions for common use cases
export function getFullAddress(location: StoreLocation, isRTL: boolean): string {
  if (isRTL) {
    return `${location.building_ar}، ${location.street_ar}، ${location.city_ar}`;
  }
  return `${location.building_en}, ${location.street_en}, ${location.city_en}`;
}

export function getWhatsAppUrl(contact: StoreContact, message?: string): string {
  const base = `https://wa.me/${contact.whatsapp}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export function getPhoneUrl(contact: StoreContact): string {
  return `tel:${contact.phone}`;
}

export function getEmailUrl(contact: StoreContact): string {
  return `mailto:${contact.email}`;
}
