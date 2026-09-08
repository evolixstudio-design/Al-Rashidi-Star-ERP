export const translateEnglishToArabic = async (text: string): Promise<string> => {
  if (!text || !text.trim()) return '';
  
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ar&dt=t&q=${encodeURIComponent(text.trim())}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Translation failed');
    }
    const data = await response.json();
    if (data && data[0] && data[0][0] && data[0][0][0]) {
      return data[0][0][0];
    }
    return '';
  } catch (error) {
    console.error('Translation error:', error);
    return '';
  }
};
