

__author__ = "minhhoangho99@gmail.com"
__date__ = "Oct 06, 2023 14:10"

from typing import Union

from src.Apps.base.constants import const
from django.utils.translation import gettext_lazy as _


class LanguageName(const):
    ENGLISH = _("English")
    SPANISH = _("Spanish (LATAM)")
    FRENCH = _("French")
    FRENCH_CANADA = _("French (Canadian)")
    GERMAN = _("German")
    ITALIAN = _("Italian")
    DUTCH = _("Dutch")
    BRAZILIAN_PORTUGUESE = _("Brazilian Portuguese")
    SIMPLIFIED_CHINESE = _("Simplified Chinese")
    CHINESE_TRADITIONAL = _("Chinese Traditional")
    TURKISH = _("Turkish")
    DUTCH = _("Dutch")
    HUNGARIAN = _("Hungarian")
    KOREAN = _("Korean")
    RUSSIAN = _("Russian")
    JAPANESE = _("Japanese")
    VIETNAMESE = _("Vietnamese")
    BOSNIAN = _("Bosnian")
    HEBREW = _("Hebrew")
    ARABIC = _("Arabic")
    BULGARIAN = _("Bulgarian")
    CROATIAN = _("Croatian")
    CZECH = _("Czech")
    GREEK = _("Greek")
    POLISH = _("Polish")
    SERBIAN_CYRILLIC = _("Serbian (Latin)")
    SLOVAK = _("Slovak")
    THAI = _("Thai")
    UKRAINIAN = _("Ukrainian")
    ROMANIAN = _("Romanian")
    SPANISH_MODERN = _("Spanish (Spain)")
    SPANISH_MEXICO = _("Spanish (Mexico)")
    PORTUGUESE = _("Portuguese (Portugal)")
    BRITISH_ENGLISH = _("English, United Kingdom")
    MALAY = _("Malay")
    DANISH = _("Danish")
    INDONESIAN = _("Indonesian")
    SWEDISH = _("Swedish")


class LanguageCode(const):
    ENGLISH = "en"
    SPANISH = "es"
    FRENCH = "fr"
    FRENCH_CANADA = "fr-ca"
    GERMAN = "de"
    ITALIAN = "it"
    DUTCH = "nl"
    BRAZILIAN_PORTUGUESE = "pt-br"
    SIMPLIFIED_CHINESE = "zh-cn"
    CHINESE_TRADITIONAL = "zh-tw"
    TURKISH = "tr"
    HUNGARIAN = "hu"
    KOREAN = "ko"
    RUSSIAN = "ru"
    JAPANESE = "ja"
    VIETNAMESE = "vi"
    BOSNIAN = "bs"
    HEBREW = "he"
    ARABIC = "ar"
    BULGARIAN = "bg"
    CROATIAN = "hr"
    CZECH = "cs"
    GREEK = "el"
    POLISH = "pl"
    SERBIAN_CYRILLIC = "sr"
    SLOVAK = "sk"
    THAI = "th"
    UKRAINIAN = "uk"
    ROMANIAN = "ro"
    SPANISH_MODERN = "es-em"
    SPANISH_MEXICO = "es-mx"
    PORTUGUESE = "pt"
    BRITISH_ENGLISH = "en-gb"
    MALAY = "ms"
    DANISH = "da"
    INDONESIAN = "id"
    SWEDISH = "sv"

    DEFAULT_LANGUAGE_CODE = ENGLISH

    @classmethod
    def get_all_language_codes(cls):
        return list(
            {
                language_code
                for language_code in cls.__dict__.values()
                if (isinstance(language_code, str) and not language_code.count("."))
            }
        )

    @classmethod
    def default_language_code(cls):
        return cls.DEFAULT_LANGUAGE_CODE

    @classmethod
    def is_default(cls, language):
        return language == cls.default_language_code()

    @classmethod
    def is_not_translated(cls, language_translated: str, language_switch: str) -> bool:
        return cls.is_default(language_translated) and not cls.is_default(language_switch)

    @classmethod
    def is_support_multilingual(cls, language_code: str) -> bool:
        if language_code:
            return language_code != cls.default_language_code() and cls.is_support(language_code)
        return False

    @classmethod
    def is_support(cls, language_code):
        return language_code in LanguageCode.__dict__.values()

    @classmethod
    def is_support_correct_language_name(cls, language_code):
        return language_code not in [cls.BRITISH_ENGLISH]

    @classmethod
    def should_rename_language(cls, language_code):
        return language_code in [cls.BRITISH_ENGLISH]

    @staticmethod
    def to_iso_hyphen(language_code):
        mapping_data = {
            "en": "en-US",
            "es": "es-ES",
            "fr": "fr-FR",
            "fr-ca": "fr-CA",
            "de": "de-DE",
            "it": "it-IT",
            "nl": "nl-NL",
            "pt": "pt-PT",
            "pt-br": "pt-BR",
            "zh-cn": "zh-CN",
            "zh-tw": "zh-TW",
            "tr": "tr-TR",
            "hu": "hu-HU",
            "ko": "ko-KR",
            "ru": "ru-RU",
            "ja": "ja-JP",
            "vi": "vi-VN",
            "bs": "bs-BA",
        }
        return mapping_data.get(language_code.lower(), language_code)

    @classmethod
    def to_iso(cls, language_code: str):
        try:
            import re
            language_code = language_code or ""
            chinese_language_codes = [cls.SIMPLIFIED_CHINESE, cls.CHINESE_TRADITIONAL]
            if language_code.lower() in chinese_language_codes:
                return language_code
            language_code = LanguageCode.transform_indonesian(language_code)
            return re.split("-|_", language_code).pop(0)
        except AttributeError:
            return ""

    @staticmethod
    def to_db_field(language_code):
        if language_code:
            if language_code == LanguageCode.INDONESIAN:
                return "idn"
            return "_".join(language_code.split("-")).lower()
        return None

    @staticmethod
    def to_language_name(language_code):
        code_to_name_dict = {
            LanguageCode.ENGLISH: LanguageName.ENGLISH,
            LanguageCode.SPANISH: LanguageName.SPANISH,
            LanguageCode.FRENCH: LanguageName.FRENCH,
            LanguageCode.FRENCH_CANADA: LanguageName.FRENCH_CANADA,
            LanguageCode.GERMAN: LanguageName.GERMAN,
            LanguageCode.ITALIAN: LanguageName.ITALIAN,
            LanguageCode.BRAZILIAN_PORTUGUESE: LanguageName.BRAZILIAN_PORTUGUESE,
            LanguageCode.SIMPLIFIED_CHINESE: LanguageName.SIMPLIFIED_CHINESE,
            LanguageCode.CHINESE_TRADITIONAL: LanguageName.CHINESE_TRADITIONAL,
            LanguageCode.TURKISH: LanguageName.TURKISH,
            LanguageCode.DUTCH: LanguageName.DUTCH,
            LanguageCode.HUNGARIAN: LanguageName.HUNGARIAN,
            LanguageCode.KOREAN: LanguageName.KOREAN,
            LanguageCode.RUSSIAN: LanguageName.RUSSIAN,
            LanguageCode.JAPANESE: LanguageName.JAPANESE,
            LanguageCode.VIETNAMESE: LanguageName.VIETNAMESE,
            LanguageCode.BOSNIAN: LanguageName.BOSNIAN,
            LanguageCode.HEBREW: LanguageName.HEBREW,
            LanguageCode.ARABIC: LanguageName.ARABIC,
            LanguageCode.BULGARIAN: LanguageName.BULGARIAN,
            LanguageCode.CROATIAN: LanguageName.CROATIAN,
            LanguageCode.CZECH: LanguageName.CZECH,
            LanguageCode.GREEK: LanguageName.GREEK,
            LanguageCode.POLISH: LanguageName.POLISH,
            LanguageCode.SERBIAN_CYRILLIC: LanguageName.SERBIAN_CYRILLIC,
            LanguageCode.SLOVAK: LanguageName.SLOVAK,
            LanguageCode.THAI: LanguageName.THAI,
            LanguageCode.UKRAINIAN: LanguageName.UKRAINIAN,
            LanguageCode.ROMANIAN: LanguageName.ROMANIAN,
            LanguageCode.SPANISH_MODERN: LanguageName.SPANISH_MODERN,
            LanguageCode.SPANISH_MEXICO: LanguageName.SPANISH_MEXICO,
            LanguageCode.PORTUGUESE: LanguageName.PORTUGUESE,
            LanguageCode.BRITISH_ENGLISH: LanguageName.BRITISH_ENGLISH,
            LanguageCode.MALAY: LanguageName.MALAY,
            LanguageCode.DANISH: LanguageName.DANISH,
            LanguageCode.INDONESIAN: LanguageName.INDONESIAN,
            LanguageCode.SWEDISH: LanguageName.SWEDISH,
        }
        return code_to_name_dict.get(language_code)

    @staticmethod
    def localization(language_code):
        return "-".join(language_code.split("_")).lower()

    @staticmethod
    def is_chinese_language(language_code):
        return language_code == "zh"

    @staticmethod
    def is_hebrew_language(language_code):
        return language_code == "iw"

    @staticmethod
    def is_simplified_chinese(language_code):
        return language_code in ["zh", "zh-CN", "zh-cn", "zh-hans"]

    @staticmethod
    def is_chinese_traditional(language_code):
        return language_code == "zh-TW"

    @staticmethod
    def is_japanese_language(language_code):
        return language_code == LanguageCode.JAPANESE

    @staticmethod
    def is_french_canada(language_code: str) -> bool:
        return language_code == LanguageCode.FRENCH_CANADA

    @staticmethod
    def is_korean_language(language_code: str) -> bool:
        return language_code.lower() in [LanguageCode.KOREAN, "ko-kr"]

    @classmethod
    def is_pictogram(cls, language_code):
        return language_code in ["zh-cn", "zh-tw", "ja", "he"]

    @classmethod
    def is_german(cls, language_code: str) -> bool:
        return language_code == cls.GERMAN

    @classmethod
    def is_spanish(cls, language_code: str) -> bool:
        return cls.to_iso(language_code=language_code) == cls.SPANISH

    @classmethod
    def is_english(cls, language_code: str) -> bool:
        return cls.to_iso(language_code=language_code) == cls.ENGLISH

    @classmethod
    def is_french(cls, language_code: str) -> bool:
        return cls.to_iso(language_code=language_code) == cls.FRENCH

    @classmethod
    def is_support_profanity_languages(cls, language_code: str) -> bool:
        return bool(cls.to_iso(language_code=language_code) in [cls.FRENCH, cls.SPANISH, cls.PORTUGUESE])

    @classmethod
    def is_supported_derivative_languages(cls, language_code: str):
        special_db_fields = [
            LanguageCode.BRAZILIAN_PORTUGUESE,
            LanguageCode.FRENCH_CANADA,
            LanguageCode.SPANISH_MODERN,
            LanguageCode.SPANISH_MEXICO,
            LanguageCode.BRITISH_ENGLISH,
        ]
        return language_code in special_db_fields

    @classmethod
    def get_family_language_codes(cls, language_code: str) -> list:
        portuguese_languages = [cls.PORTUGUESE, cls.BRAZILIAN_PORTUGUESE]
        french_languages = [cls.FRENCH, cls.FRENCH_CANADA]
        spanish_languages = [cls.SPANISH, cls.SPANISH_MEXICO, cls.SPANISH_MODERN]
        chinese_languages = [cls.SIMPLIFIED_CHINESE, cls.CHINESE_TRADITIONAL]
        family_language_mapping = {
            cls.PORTUGUESE: portuguese_languages,
            cls.FRENCH: french_languages,
            cls.SPANISH: spanish_languages,
            cls.SIMPLIFIED_CHINESE: chinese_languages,
            cls.CHINESE_TRADITIONAL: chinese_languages,
        }
        language_code = cls.to_iso(language_code)
        return family_language_mapping.get(language_code, []).copy()

    @classmethod
    def validate_kb_language(cls, detect_language: str) -> str:
        if not cls.is_supported_derivative_languages(detect_language):
            detect_language = cls.to_iso(detect_language)
        return detect_language

    @classmethod
    def validate_pictogram(cls, detect_language: str, text: str) -> str:
        from Apps.base.utils.main import Utils

        if cls.is_hebrew_language(detect_language):
            detect_language = LanguageCode.HEBREW
        elif cls.is_simplified_chinese(detect_language):
            detect_language = LanguageCode.SIMPLIFIED_CHINESE
        elif cls.is_chinese_traditional(detect_language):
            detect_language = LanguageCode.CHINESE_TRADITIONAL
        elif cls.is_korean_language(detect_language):
            detect_language = LanguageCode.KOREAN

        # ignore detect pictogram language if message contains only normal letters
        if cls.is_pictogram(detect_language) and Utils.is_normal_letters(text):
            detect_language = LanguageCode.ENGLISH
        return detect_language

    @classmethod
    def normalize(cls, language_code: str = "") -> Union[str, None]:
        if language_code:
            language_codes = [cls.localization(language_code), cls.to_iso(language_code)]
            for language_code in language_codes:
                language_code = next(
                    (lang_iter for lang_iter in cls.__dict__.values() if lang_iter == language_code), None
                )
                if language_code:
                    break
            if cls.is_support_multilingual(language_code):
                return language_code
        return None

    @classmethod
    def is_rtl_language(cls, language_code):
        return language_code in [cls.HEBREW, cls.ARABIC]

    @classmethod
    def transform_indonesian(cls, language_code):
        # in case language Indonesian, its iso_language_code = "id" -> need to replace by "idn"
        if language_code == "idn":
            return LanguageCode.INDONESIAN
        return language_code

    @classmethod
    def to_sap_language_code(cls, language_code):
        mapping_data = {
            cls.ENGLISH: "en_US",
            cls.SPANISH: "es_ES",
            cls.FRENCH: "fr_FR",
            cls.FRENCH_CANADA: "fr_CA",
            cls.GERMAN: "de_DE",
            cls.ITALIAN: "it_IT",
            cls.DUTCH: "nl_NL",
            cls.BRAZILIAN_PORTUGUESE: "pt_BR",
            cls.SIMPLIFIED_CHINESE: "zh_CN",
            cls.CHINESE_TRADITIONAL: "zh_TW",
            cls.TURKISH: "tr_TR",
            cls.HUNGARIAN: "hu_HU",
            cls.KOREAN: "ko_KR",
            cls.RUSSIAN: "ru_RU",
            cls.JAPANESE: "ja_JP",
            cls.VIETNAMESE: "vi_VN",
            cls.BOSNIAN: "en_US",
            cls.HEBREW: "he_IL",
            cls.ARABIC: "ar_SA",
            cls.BULGARIAN: "bg_BG",
            cls.CROATIAN: "hr_HR",
            cls.CZECH: "cs_CZ",
            cls.GREEK: "el_GR",
            cls.POLISH: "pl_PL",
            cls.SERBIAN_CYRILLIC: "sr_RS",
            cls.SLOVAK: "sk_SK",
            cls.THAI: "th_TH",
            cls.UKRAINIAN: "uk_UA",
            cls.ROMANIAN: "ro_RO",
            cls.SPANISH_MODERN: "es_ES",
            cls.SPANISH_MEXICO: "es_MX",
            cls.PORTUGUESE: "pt_PT",
            cls.BRITISH_ENGLISH: "en_GB",
            cls.MALAY: "bs_BS",
            cls.DANISH: "da_DK",
            cls.INDONESIAN: "bs_ID",
            cls.SWEDISH: "sv_SE",
        }
        return mapping_data.get(language_code, "en_US")

    @classmethod
    def twilio_language_code_mapping(cls, language_code: str) -> str:
        # whatsapp not support fr-ca template, so we use fr template instead
        language_mapping = {cls.FRENCH_CANADA: cls.FRENCH}

        return language_mapping.get(language_code, language_code)
