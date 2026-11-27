"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  COUNTRY_PHONE_LIST,
  DEFAULT_COUNTRY,
  CountryPhone,
  searchCountries,
  parsePhoneAndCountry,
} from "@/data/countryPhoneCodes";
import { ChevronDown, Search, Check, X, Phone } from "lucide-react";
import { useLang } from "@/lib/i18n";

interface CountryPhoneInputProps {
  value: string;
  onChange: (fullPhone: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  inputClassName?: string;
  id?: string;
  name?: string;
}

export default function CountryPhoneInput({
  value,
  onChange,
  placeholder,
  disabled = false,
  required = false,
  className = "",
  inputClassName = "",
  id = "phone-input",
  name = "phone",
}: CountryPhoneInputProps) {
  const { lang } = useLang();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Initialize country and local number from incoming value
  const initial = useMemo(() => parsePhoneAndCountry(value || ""), [value]);
  const [selectedCountry, setSelectedCountry] = useState<CountryPhone>(initial.country);
  const [localNumber, setLocalNumber] = useState<string>(initial.localNumber);

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Sync internal state if external value changes significantly
  useEffect(() => {
    const parsed = parsePhoneAndCountry(value || "");
    if (parsed.country.code !== selectedCountry.code) {
      setSelectedCountry(parsed.country);
    }
    // Only update localNumber if stripped digits differ
    const currentDigits = localNumber.replace(/\D/g, "");
    const incomingDigits = parsed.localNumber.replace(/\D/g, "");
    if (currentDigits !== incomingDigits && incomingDigits.length > 0) {
      setLocalNumber(parsed.localNumber);
    }
  }, [value]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (dropdownOpen) {
      setSearchQuery("");
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [dropdownOpen]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Filtered countries based on search query
  const filteredCountries = useMemo(() => {
    return searchCountries(searchQuery);
  }, [searchQuery]);

  const handleSelectCountry = (country: CountryPhone) => {
    setSelectedCountry(country);
    setDropdownOpen(false);
    setSearchQuery("");

    // Emit combined international phone
    const cleanedLocal = localNumber.trim();
    if (cleanedLocal) {
      onChange(`${country.dialCode} ${cleanedLocal}`);
    } else {
      onChange(`${country.dialCode} `);
    }
  };

  const handleLocalNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value;

    // If user pastes or types a number with leading 0 (e.g. 0661234567 in Morocco)
    if (raw.startsWith("0") && selectedCountry.code === "MA") {
      raw = raw.slice(1);
    }

    setLocalNumber(raw);

    const cleaned = raw.trim();
    if (cleaned) {
      onChange(`${selectedCountry.dialCode} ${cleaned}`);
    } else {
      onChange("");
    }
  };

  const getCountryName = (c: CountryPhone) => {
    if (lang === "ar") return c.nameAr;
    if (lang === "fr") return c.nameFr;
    return c.nameEn;
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${className}`}
      dir={lang === "ar" ? "rtl" : "ltr"}
    >
      <div className="flex items-center w-full rounded-xl bg-white/5 border border-white/10 focus-within:border-cyan transition-colors overflow-hidden">
        {/* Country Selector Button */}
        <button
          type="button"
          onClick={() => !disabled && setDropdownOpen(!dropdownOpen)}
          disabled={disabled}
          className="flex items-center gap-1.5 px-3 py-2.5 bg-white/[0.04] hover:bg-white/[0.08] text-white text-xs sm:text-sm font-semibold transition-colors border-r border-white/10 focus:outline-none shrink-0 cursor-pointer select-none"
          title={getCountryName(selectedCountry)}
        >
          <span className="text-base leading-none select-none">{selectedCountry.flag}</span>
          <span className="font-mono text-xs font-bold text-cyan tracking-tight">
            {selectedCountry.dialCode}
          </span>
          <ChevronDown
            className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
              dropdownOpen ? "rotate-180 text-cyan" : ""
            }`}
          />
        </button>

        {/* Local Phone Number Input */}
        <div className="relative flex-1">
          <input
            id={id}
            name={name}
            type="tel"
            disabled={disabled}
            required={required}
            value={localNumber}
            onChange={handleLocalNumberChange}
            placeholder={
              placeholder ||
              selectedCountry.formatPlaceholder ||
              (lang === "ar" ? "رقم الهاتف" : "Numéro de téléphone")
            }
            className={`w-full px-3 py-2.5 bg-transparent text-white placeholder:text-white/30 focus:outline-none text-xs sm:text-sm font-mono tracking-wide ${inputClassName}`}
          />
        </div>
      </div>

      {/* Floating Searchable Country Dropdown */}
      {dropdownOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-[#0c192e] border border-cyan/30 rounded-2xl shadow-2xl shadow-black/80 overflow-hidden backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-150">
          {/* Search Input Box */}
          <div className="p-2.5 border-b border-white/10 bg-white/[0.03]">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-cyan absolute left-3 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  lang === "ar"
                    ? "ابحث عن الدولة أو الرمز (مثال: المغرب، 212...)"
                    : "Rechercher pays ou indicatif (ex: Maroc, 212...)"
                }
                className="w-full pl-9 pr-8 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-400 text-xs focus:outline-none focus:border-cyan transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 text-slate-400 hover:text-white p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Countries Scrollable List */}
          <div className="max-h-56 overflow-y-auto scrollbar-thin divide-y divide-white/[0.04]">
            {filteredCountries.length > 0 ? (
              filteredCountries.map((c) => {
                const isSelected = c.code === selectedCountry.code;
                return (
                  <button
                    key={`${c.code}-${c.dialCode}`}
                    type="button"
                    onClick={() => handleSelectCountry(c)}
                    className={`w-full px-3.5 py-2.5 flex items-center justify-between gap-2 text-left hover:bg-white/10 transition-colors cursor-pointer ${
                      isSelected ? "bg-cyan/15 text-cyan font-bold" : "text-slate-200"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-lg leading-none shrink-0">{c.flag}</span>
                      <span className="text-xs truncate">{getCountryName(c)}</span>
                      <span className="text-[10px] text-slate-400 font-mono">({c.code})</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono text-xs font-bold text-cyan">
                        {c.dialCode}
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-cyan" />}
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="p-4 text-center text-xs text-slate-400">
                {lang === "ar"
                  ? "لا توجد نتائج مطابقة"
                  : "Aucun pays trouvé pour cette recherche"}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
