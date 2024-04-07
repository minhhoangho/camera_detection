
from markdown.postprocessors import Postprocessor


class UnescapePostprocessor(Postprocessor):
    """Restore character &, <, >"""

    def unescape(self, text):
        """Unescape code."""
        if "&amp;" in text:
            text = text.replace("&amp;", "&")
        if "&lt;" in text:
            text = text.replace("&lt;", "<")
        if "&gt;" in text:
            text = text.replace("&gt;", ">")
        return text

    def run(self, text):
        return self.unescape(text)


def markdown(text, **kwargs):
    from markdown import Markdown

    md = Markdown(**kwargs)
    md.postprocessors.register(UnescapePostprocessor(), "unescape", 10)
    return md.convert(text)
