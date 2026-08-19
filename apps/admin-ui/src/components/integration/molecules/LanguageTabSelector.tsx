import React from 'react';

export type SupportedLanguage = 'ts' | 'python' | 'kotlin' | 'go';

export interface LanguageTabSelectorProps {
  readonly selectedLanguage: SupportedLanguage;
  readonly onSelectLanguage: (lang: SupportedLanguage) => void;
}

const LANGUAGES: readonly { readonly id: SupportedLanguage; readonly label: string; readonly badge: string }[] = [
  { id: 'ts', label: 'TypeScript', badge: 'bg-purple-950 text-fuchsia-300' },
  { id: 'python', label: 'Python (Pydantic)', badge: 'bg-amber-950 text-amber-300' },
  { id: 'kotlin', label: 'Kotlin', badge: 'bg-sky-950 text-sky-300' },
  { id: 'go', label: 'Go', badge: 'bg-emerald-950 text-emerald-300' }
];

export function LanguageTabSelector({
  selectedLanguage,
  onSelectLanguage
}: LanguageTabSelectorProps): React.ReactElement {
  return (
    <div className="flex flex-wrap gap-2 p-1 bg-[#130a24] rounded-xl border border-purple-900/60 w-fit">
      {LANGUAGES.map((lang) => {
        const isSelected = selectedLanguage === lang.id;
        return (
          <button
            key={lang.id}
            type="button"
            onClick={() => onSelectLanguage(lang.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium font-mono transition-all ${
              isSelected
                ? 'bg-purple-600 text-white shadow-md shadow-purple-900/50'
                : 'text-purple-300 hover:text-white hover:bg-purple-900/30'
            }`}
          >
            {lang.label}
          </button>
        );
      })}
    </div>
  );
}
