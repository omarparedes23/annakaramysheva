const cyrillicToLatinMap: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'yo', ж: 'zh', з: 'z', и: 'i',
  й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't',
  у: 'u', ф: 'f', х: 'kh', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'shch', ъ: '', ы: 'y',
  ь: '', э: 'e', ю: 'yu', я: 'ya',
  А: 'a', Б: 'b', В: 'v', Г: 'g', Д: 'd', Е: 'e', Ё: 'yo', Ж: 'zh', З: 'z', И: 'i',
  Й: 'y', К: 'k', Л: 'l', М: 'm', Н: 'n', О: 'o', П: 'p', Р: 'r', С: 's', Т: 't',
  У: 'u', Ф: 'f', Х: 'kh', Ц: 'ts', Ч: 'ch', Ш: 'sh', Щ: 'shch', Ъ: '', Ы: 'y',
  Ь: '', Э: 'e', Ю: 'yu', Я: 'ya'
}

export function slugify(str: string): string {
  if (!str) return ''

  // 1. Transliterate Cyrillic to Latin
  let transliterated = ''
  for (let i = 0; i < str.length; i++) {
    const char = str[i]
    transliterated += cyrillicToLatinMap[char] !== undefined ? cyrillicToLatinMap[char] : char
  }

  // 2. Perform standard slugification on the transliterated string
  return transliterated
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')    // remove non-alphanumeric except spaces and hyphens
    .trim()
    .replace(/\s+/g, '-')             // replace spaces with single hyphens
    .replace(/-+/g, '-')              // replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, '')          // trim leading/trailing hyphens
}
