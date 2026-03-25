import sys
from html.parser import HTMLParser


class AppIdExtractor(HTMLParser):
    def __init__(self):
        super().__init__()
        self.app_ids = []

    def handle_starttag(self, tag, attrs):
        if tag == "a":
            for name, value in attrs:
                if name == "data-ds-appid" and value:
                    self.app_ids.append(value)


def main():
    if len(sys.argv) < 2:
        print(f"Usage: python {sys.argv[0]} <input.html>")
        sys.exit(1)

    with open(sys.argv[1], "r", encoding="utf-8") as f:
        html = f.read()

    parser = AppIdExtractor()
    parser.feed(html)

    for app_id in parser.app_ids:
        print(app_id)

    print(f"\nTotal: {len(parser.app_ids)} app IDs", file=sys.stderr)


if __name__ == "__main__":
    main()
