import React, { createContext, useContext, useState, type ReactNode } from 'react';

type LegalTab = 'terms' | 'privacy';

interface LegalHelpContextType {
  faqOpen: boolean;
  legalOpen: boolean;
  legalTab: LegalTab;
  cookieOpen: boolean;
  openFaq: () => void;
  closeFaq: () => void;
  openTerms: () => void;
  openPrivacy: () => void;
  closeLegal: () => void;
  setLegalTab: (tab: LegalTab) => void;
  openCookieSettings: () => void;
  closeCookieSettings: () => void;
}

const LegalHelpContext = createContext<LegalHelpContextType | undefined>(undefined);

export const LegalHelpProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [faqOpen, setFaqOpen] = useState(false);
  const [legalOpen, setLegalOpen] = useState(false);
  const [legalTab, setLegalTab] = useState<LegalTab>('terms');
  const [cookieOpen, setCookieOpen] = useState(false);

  const openFaq = () => setFaqOpen(true);
  const closeFaq = () => setFaqOpen(false);

  const openTerms = () => {
    setLegalTab('terms');
    setLegalOpen(true);
  };

  const openPrivacy = () => {
    setLegalTab('privacy');
    setLegalOpen(true);
  };

  const closeLegal = () => setLegalOpen(false);

  const openCookieSettings = () => setCookieOpen(true);
  const closeCookieSettings = () => setCookieOpen(false);

  return (
    <LegalHelpContext.Provider
      value={{
        faqOpen,
        legalOpen,
        legalTab,
        cookieOpen,
        openFaq,
        closeFaq,
        openTerms,
        openPrivacy,
        closeLegal,
        setLegalTab,
        openCookieSettings,
        closeCookieSettings,
      }}
    >
      {children}
    </LegalHelpContext.Provider>
  );
};

export const useLegalHelp = (): LegalHelpContextType => {
  const context = useContext(LegalHelpContext);
  if (!context) {
    throw new Error('useLegalHelp must be used within a LegalHelpProvider');
  }
  return context;
};
