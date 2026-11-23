"""Build the self-contained Curitiba/RMC timeline presentation."""
import base64
import pathlib

PROJECT_ROOT = pathlib.Path(__file__).resolve().parent.parent
ROOT = pathlib.Path(__file__).resolve().parent
OUTPUT = PROJECT_ROOT / "dist-vercel/slides"
OUTPUT.mkdir(parents=True, exist_ok=True)
html = (ROOT / "src/curitiba_template.html").read_text(encoding="utf-8")
logo = (ROOT / "ref/DOMUS_svg/LogoDomusColor_HEX-283970.svg").read_bytes()
html = html.replace("@@LOGO@@", "data:image/svg+xml;base64," + base64.b64encode(logo).decode("ascii"))
for token, filename in {
    "@@REG@@": "BarlowCondensed-Regular.ttf",
    "@@MED@@": "BarlowCondensed-Medium.ttf",
    "@@SEMI@@": "BarlowCondensed-SemiBold.ttf",
    "@@BOLD@@": "BarlowCondensed-Bold.ttf",
}.items():
    font = (ROOT / "src/fonts" / filename).read_bytes()
    html = html.replace(token, base64.b64encode(font).decode("ascii"))
for token, filename in {
    "@@IMG1943@@": "1940s_praca_tiradentes.jpg",
    "@@IMG1970@@": "1970s_expresso.jpg",
    "@@IMG1990@@": "1997_bacacheri.jpg",
    "@@IMG2000@@": "2005_skyline.jpg",
    "@@IMG2015@@": "2022_skyline.jpg",
}.items():
    image = (ROOT / "src/curitiba_images" / filename).read_bytes()
    html = html.replace(token, "data:image/jpeg;base64," + base64.b64encode(image).decode("ascii"))
out = OUTPUT / "Curitiba_RMC_Domus.html"
out.write_text(html, encoding="utf-8")
print(f"Created {out} ({len(html):,} chars)")
