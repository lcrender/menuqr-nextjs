import { useState, useRef, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../src/i18n/config';
import locationEs from '../src/locales/fragments/location.es.json';
import locationEn from '../src/locales/fragments/location.en.json';
import {
  COUNTRY_OPTIONS,
  findCountryOption,
  getCountryFlag,
  type CountryOption,
} from '../lib/countries';

i18n.addResourceBundle('es-ES', 'translation', { location: locationEs }, true, true);
i18n.addResourceBundle('en-US', 'translation', { location: locationEn }, true, true);

interface CountrySelectorProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  className?: string;
}

export default function CountrySelector({ value, onChange, required = false, className = '' }: CountrySelectorProps) {
  const { t, i18n: i18nInstance } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const localizeCountry = (country: CountryOption) =>
    t(`location.countries.${country.code}`, { defaultValue: country.name });

  const sortedCountries = useMemo(() => {
    return [...COUNTRY_OPTIONS].sort((a, b) =>
      localizeCountry(a).localeCompare(localizeCountry(b), i18nInstance.language),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-sort when language changes
  }, [i18nInstance.language, t]);

  const filteredCountries = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return sortedCountries;
    return sortedCountries.filter((country) => {
      const localized = localizeCountry(country).toLowerCase();
      return (
        localized.includes(term) ||
        country.name.toLowerCase().includes(term) ||
        country.code.toLowerCase().includes(term)
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, sortedCountries, i18nInstance.language, t]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const selectedCountry = findCountryOption(value);

  const handleSelect = (country: CountryOption) => {
    // Guardar nombre canónico (ES) para provincias/monedas/BD
    onChange(country.name);
    setSearchTerm('');
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    setIsOpen(true);

    if (!term) {
      onChange('');
    }
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const displayValue = selectedCountry ? localizeCountry(selectedCountry) : value || '';

  return (
    <div className={`position-relative ${className}`}>
      <input
        ref={inputRef}
        type="text"
        className="form-control"
        value={isOpen ? searchTerm : displayValue}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        placeholder={t('location.searchCountry')}
        required={required}
        autoComplete="off"
      />
      {isOpen && (
        <div
          ref={dropdownRef}
          className="admin-select-dropdown w-100"
          role="listbox"
          aria-label={t('location.countriesListAria')}
        >
          {filteredCountries.length > 0 ? (
            filteredCountries.map((country) => (
              <div
                key={country.code}
                role="option"
                aria-selected={selectedCountry?.code === country.code}
                className={`admin-select-dropdown__item ${
                  selectedCountry?.code === country.code ? 'admin-select-dropdown__item--selected' : ''
                }`}
                onClick={() => handleSelect(country)}
              >
                <div className="d-flex align-items-center gap-2">
                  <span aria-hidden style={{ fontSize: '1.25rem', lineHeight: 1 }}>
                    {getCountryFlag(country.code)}
                  </span>
                  <span>{localizeCountry(country)}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="admin-select-dropdown__empty">{t('location.noCountriesFound')}</div>
          )}
        </div>
      )}
    </div>
  );
}
