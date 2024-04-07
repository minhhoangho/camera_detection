import sys

from django.conf import settings
from django.utils import translation
from src.Apps.base.constants import const
from src.Apps.base.constants.languages import LanguageCode


class Translator(const):
    MODULE_ID = 0
    COMPANY_ID = 0
    COLLATION = None
    LANG_CODE = LanguageCode.ENGLISH
    KEEP_LAZY = False
    INCLUDE_ENGLISH = False
    COMMUNICATION_TYPE = None

    def __init__(self, language_code=LanguageCode.ENGLISH, company_id=0, keep_lazy=False, comm_type=None):
        # Reset to default language (en) if we do not support this kind of language
        convo_langs = list(LanguageCode.__dict__.values())
        default_langs = [l[0] for l in settings.LANGUAGES]
        suported_langs = list(set(convo_langs + default_langs))
        if language_code not in suported_langs:
            language_code = LanguageCode.ENGLISH
        self.LANG_CODE = language_code
        self.COMPANY_ID = company_id
        self.KEEP_LAZY = keep_lazy
        self.COMMUNICATION_TYPE = comm_type

    def __getattr__(self, key):
        # keep translate text lazy
        if self.KEEP_LAZY:
            msgid = getattr(self.COLLATION, key, "")
            if not isinstance(msgid, (dict, tuple, list)):
                return msgid

        return self._gettext(key)

    def _gettext(self, key, count=1):
        try:
            translated = ""
            with translation.override(self.LANG_CODE):
                translated = getattr(self.COLLATION, key, "")
                if hasattr(translated, "_delegate_text"):
                    if getattr(translated, "_delegate_text"):
                        # 1. Normal text translated
                        translated = str(translated)
                    else:
                        # get singular or plural translate
                        translated = str(translated % count)
                elif isinstance(translated, dict):
                    # 2. Return translated message inside dict(code, message)
                    #    Using for return message with error code
                    translated.update(message=str(translated.get("message")))
                elif isinstance(translated, list):
                    # 3. List of texts translated
                    if self.LANG_CODE != LanguageCode.ENGLISH:
                        force_translated = [translation.gettext(item) for item in translated]
                        if self.INCLUDE_ENGLISH:
                            force_translated += translated
                        translated = force_translated
                else:
                    # 4. Translate text no-op
                    translated = translation.gettext(translated)
        except Exception as e:
            from src.Apps.base.logging.application_log import AppLog
            AppLog.error_exception(e)
        return translated


    def _get_msg_order(self, key, messages):
        return 1

    def _formatted_str(self, *args, **kwargs):
        # Get parent method name that is Request Language Key
        # Then get language string by this key and format the string
        _key = sys._getframe(1).f_code.co_name
        _code = kwargs.get("response_code")
        _str = self._gettext(_key)
        if args:
            try:
                _str = _str.format(*args)
            except KeyError:
                pass
        if _code:
            return dict(code=_code, message=_str)
        return _str

    def _ngettext(self, key, count, **kwargs):
        # Get parent method name that is Request Language Key
        # Then get language string by this key with singular or plural
        from django.utils.encoding import force_str

        _str = force_str(self._gettext(key, count))
        return _str

    @classmethod
    def need_translation(cls, language_code, detect_language_code):
        """
        language_code: it's main language (en, es, fr, fr-CA, de, it)
        detect_language_code: any language
        """
        translate_by_detect_language_code = detect_language_code and (
            detect_language_code != LanguageCode.ENGLISH or language_code != LanguageCode.ENGLISH
        )
        translate_by_language_code = language_code and language_code != LanguageCode.ENGLISH
        if translate_by_detect_language_code or translate_by_language_code:
            return True
        return False
