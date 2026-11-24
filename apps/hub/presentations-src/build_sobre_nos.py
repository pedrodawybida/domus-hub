"""Build the standalone Domus Sobre Nós presentation without touching Jornada."""
import base64
import pathlib

PROJECT_ROOT = pathlib.Path(__file__).resolve().parent.parent
ROOT = pathlib.Path(__file__).resolve().parent
OUTPUT = PROJECT_ROOT / "dist-vercel/slides"
OUTPUT.mkdir(parents=True, exist_ok=True)
template = (ROOT / "src/sobre_nos_template.html").read_text(encoding="utf-8")
svg = (ROOT / "ref/DOMUS_svg/LogoDomusColor_HEX-283970.svg").read_bytes()
replacements = {
    "@@LOGO@@": "data:image/svg+xml;base64," + base64.b64encode(svg).decode("ascii"),
    "@@CURITIBA_COVER@@": "data:image/png;base64," + base64.b64encode((ROOT / "src/curitiba_capa.png").read_bytes()).decode("ascii"),
    "@@REG@@": base64.b64encode((ROOT / "src/fonts/BarlowCondensed-Regular.ttf").read_bytes()).decode("ascii"),
    "@@MED@@": base64.b64encode((ROOT / "src/fonts/BarlowCondensed-Medium.ttf").read_bytes()).decode("ascii"),
    "@@SEMI@@": base64.b64encode((ROOT / "src/fonts/BarlowCondensed-SemiBold.ttf").read_bytes()).decode("ascii"),
    "@@BOLD@@": base64.b64encode((ROOT / "src/fonts/BarlowCondensed-Bold.ttf").read_bytes()).decode("ascii"),
}
for token, value in replacements.items():
    template = template.replace(token, value)
out = OUTPUT / "Sobre_nos_Domus.html"
out.write_text(template, encoding="utf-8")
print(f"Created {out} ({len(template):,} chars)")
