// Sample Quran ayah data for key surahs (Al-Fatiha, Al-Ikhlas, Al-Falaq, An-Nas)
// In production, this would be loaded from a complete Quran database or API.
// Each ayah has: id, surahId, ayahNumber, text (Uthmani script), pageNumber, juzNumber

export const SAMPLE_AYAHS = {
  1: [ // Al-Fatiha
    { id: '1:1', surahId: 1, ayahNumber: 1, text: 'بِسۡمِ ٱللَّهِ ٱلرَّحۡمَـٰنِ ٱلرَّحِيمِ', pageNumber: 1, juzNumber: 1 },
    { id: '1:2', surahId: 1, ayahNumber: 2, text: 'ٱلۡحَمۡدُ لِلَّهِ رَبِّ ٱلۡعَـٰلَمِينَ', pageNumber: 1, juzNumber: 1 },
    { id: '1:3', surahId: 1, ayahNumber: 3, text: 'ٱلرَّحۡمَـٰنِ ٱلرَّحِيمِ', pageNumber: 1, juzNumber: 1 },
    { id: '1:4', surahId: 1, ayahNumber: 4, text: 'مَـٰلِكِ يَوۡمِ ٱلدِّينِ', pageNumber: 1, juzNumber: 1 },
    { id: '1:5', surahId: 1, ayahNumber: 5, text: 'إِيَّاكَ نَعۡبُدُ وَإِيَّاكَ نَسۡتَعِينُ', pageNumber: 1, juzNumber: 1 },
    { id: '1:6', surahId: 1, ayahNumber: 6, text: 'ٱهۡدِنَا ٱلصِّرَٰطَ ٱلۡمُسۡتَقِيمَ', pageNumber: 1, juzNumber: 1 },
    { id: '1:7', surahId: 1, ayahNumber: 7, text: 'صِرَٰطَ ٱلَّذِينَ أَنۡعَمۡتَ عَلَيۡهِمۡ غَيۡرِ ٱلۡمَغۡضُوبِ عَلَيۡهِمۡ وَلَا ٱلضَّآلِّينَ', pageNumber: 1, juzNumber: 1 },
  ],
  112: [ // Al-Ikhlas
    { id: '112:1', surahId: 112, ayahNumber: 1, text: 'قُلۡ هُوَ ٱللَّهُ أَحَدٌ', pageNumber: 604, juzNumber: 30 },
    { id: '112:2', surahId: 112, ayahNumber: 2, text: 'ٱللَّهُ ٱلصَّمَدُ', pageNumber: 604, juzNumber: 30 },
    { id: '112:3', surahId: 112, ayahNumber: 3, text: 'لَمۡ يَلِدۡ وَلَمۡ يُولَدۡ', pageNumber: 604, juzNumber: 30 },
    { id: '112:4', surahId: 112, ayahNumber: 4, text: 'وَلَمۡ يَكُن لَّهُۥ كُفُوًا أَحَدٌۢ', pageNumber: 604, juzNumber: 30 },
  ],
  113: [ // Al-Falaq
    { id: '113:1', surahId: 113, ayahNumber: 1, text: 'قُلۡ أَعُوذُ بِرَبِّ ٱلۡفَلَقِ', pageNumber: 604, juzNumber: 30 },
    { id: '113:2', surahId: 113, ayahNumber: 2, text: 'مِن شَرِّ مَا خَلَقَ', pageNumber: 604, juzNumber: 30 },
    { id: '113:3', surahId: 113, ayahNumber: 3, text: 'وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ', pageNumber: 604, juzNumber: 30 },
    { id: '113:4', surahId: 113, ayahNumber: 4, text: 'وَمِن شَرِّ ٱلنَّفَّـٰثَـٰتِ فِى ٱلۡعُقَدِ', pageNumber: 604, juzNumber: 30 },
    { id: '113:5', surahId: 113, ayahNumber: 5, text: 'وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ', pageNumber: 604, juzNumber: 30 },
  ],
  114: [ // An-Nas
    { id: '114:1', surahId: 114, ayahNumber: 1, text: 'قُلۡ أَعُوذُ بِرَبِّ ٱلنَّاسِ', pageNumber: 604, juzNumber: 30 },
    { id: '114:2', surahId: 114, ayahNumber: 2, text: 'مَلِكِ ٱلنَّاسِ', pageNumber: 604, juzNumber: 30 },
    { id: '114:3', surahId: 114, ayahNumber: 3, text: 'إِلَـٰهِ ٱلنَّاسِ', pageNumber: 604, juzNumber: 30 },
    { id: '114:4', surahId: 114, ayahNumber: 4, text: 'مِن شَرِّ ٱلۡوَسۡوَاسِ ٱلۡخَنَّاسِ', pageNumber: 604, juzNumber: 30 },
    { id: '114:5', surahId: 114, ayahNumber: 5, text: 'ٱلَّذِى يُوَسۡوِسُ فِى صُدُورِ ٱلنَّاسِ', pageNumber: 604, juzNumber: 30 },
    { id: '114:6', surahId: 114, ayahNumber: 6, text: 'مِنَ ٱلۡجِنَّةِ وَٱلنَّاسِ', pageNumber: 604, juzNumber: 30 },
  ],
  67: [ // Al-Mulk - sample
    { id: '67:1', surahId: 67, ayahNumber: 1, text: 'تَبَـٰرَكَ ٱلَّذِى بِيَدِهِ ٱلۡمُلۡكُ وَهُوَ عَلَىٰ كُلِّ شَىۡءٍ قَدِيرٌ', pageNumber: 562, juzNumber: 29 },
    { id: '67:2', surahId: 67, ayahNumber: 2, text: 'ٱلَّذِى خَلَقَ ٱلۡمَوۡتَ وَٱلۡحَيَوٰةَ لِيَبۡلُوَكُمۡ أَيُّكُمۡ أَحۡسَنُ عَمَلًۭا ۚ وَهُوَ ٱلۡعَزِيزُ ٱلۡغَفُورُ', pageNumber: 562, juzNumber: 29 },
    { id: '67:3', surahId: 67, ayahNumber: 3, text: 'ٱلَّذِى خَلَقَ سَبۡعَ سَمَـٰوَٰتٍ طِبَاقًۭا ۖ مَّا تَرَىٰ فِى خَلۡقِ ٱلرَّحۡمَـٰنِ مِن تَفَـٰوُتٍ ۖ فَٱرۡجِعِ ٱلۡبَصَرَ هَلۡ تَرَىٰ مِن فُطُورٍ', pageNumber: 562, juzNumber: 29 },
    { id: '67:4', surahId: 67, ayahNumber: 4, text: 'ثُمَّ ٱرۡجِعِ ٱلۡبَصَرَ كَرَّتَيۡنِ يَنقَلِبۡ إِلَيۡكَ ٱلۡبَصَرُ خَاسِئًۭا وَهُوَ حَسِيرٌ', pageNumber: 562, juzNumber: 29 },
    { id: '67:5', surahId: 67, ayahNumber: 5, text: 'وَلَقَدۡ زَيَّنَّا ٱلسَّمَآءَ ٱلدُّنۡيَا بِمَصَـٰبِيحَ وَجَعَلۡنَـٰهَا رُجُومًۭا لِّلشَّيَـٰطِينِ ۖ وَأَعۡتَدۡنَا لَهُمۡ عَذَابَ ٱلسَّعِيرِ', pageNumber: 562, juzNumber: 29 },
  ],
  36: [ // Ya-Sin - sample
    { id: '36:1', surahId: 36, ayahNumber: 1, text: 'يسٓ', pageNumber: 440, juzNumber: 22 },
    { id: '36:2', surahId: 36, ayahNumber: 2, text: 'وَٱلۡقُرۡءَانِ ٱلۡحَكِيمِ', pageNumber: 440, juzNumber: 22 },
    { id: '36:3', surahId: 36, ayahNumber: 3, text: 'إِنَّكَ لَمِنَ ٱلۡمُرۡسَلِينَ', pageNumber: 440, juzNumber: 22 },
    { id: '36:4', surahId: 36, ayahNumber: 4, text: 'عَلَىٰ صِرَٰطٍ مُّسۡتَقِيمٍ', pageNumber: 440, juzNumber: 22 },
    { id: '36:5', surahId: 36, ayahNumber: 5, text: 'تَنزِيلَ ٱلۡعَزِيزِ ٱلرَّحِيمِ', pageNumber: 440, juzNumber: 22 },
  ],
};

export const getAyahsBySurah = (surahId) => {
  return SAMPLE_AYAHS[surahId] || [];
};

export const BISMI = 'بِسۡمِ ٱللَّهِ ٱلرَّحۡمَـٰنِ ٱلرَّحِيمِ';

// Tajweed demo: marks specific characters with color categories
// In production, this uses a pre-tagged Tajweed Quran corpus
export const getTajweedStyle = (text, colors) => {
  // Demo: highlight specific patterns
  return text;
};
