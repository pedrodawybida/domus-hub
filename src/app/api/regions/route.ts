import { getHubUser } from "@/lib/hub-access";
import { NextResponse } from "next/server";
import ibgeMock from "@/data/ibge-censo-2022.mock.json";
import fs from "node:fs";
import path from "node:path";

export const runtime = "nodejs";

type Municipality = (typeof ibgeMock.municipalities)[number];
type Neighborhood = (typeof ibgeMock.neighborhoods)[number];
type MarketRecord = {
  municipio: string;
  nome: string;
  periodo: string;
  preco: number | null;
  variacao12m: number | null;
  status: string;
  metodo: string;
  confianca: string;
};

function loadMarketRecords(): MarketRecord[] {
  const file = path.join(process.cwd(), "entregaveis", "base_imobiliaria_curitiba_rmc.csv");
  if (!fs.existsSync(file)) return [];
  const lines = fs.readFileSync(file, "utf8").replace(/^\uFEFF/, "").trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = lines[0].split(";");
  const index = (name: string) => headers.indexOf(name);
  const value = (row: string[], name: string) => row[index(name)] || "";
  return lines.slice(1).map((line) => {
    const row = line.split(";");
    const number = (name: string) => {
      const raw = value(row, name).replace(",", ".");
      const parsed = Number(raw);
      return Number.isFinite(parsed) ? parsed : null;
    };
    return {
      municipio: value(row, "municipio"), nome: value(row, "nome"), periodo: value(row, "periodo"),
      preco: number("preco_medio_anunciado_brl_m2"), variacao12m: number("variacao_fipezap_12m_pct"),
      status: value(row, "status_cobertura"), metodo: value(row, "metodo"), confianca: value(row, "nivel_confianca"),
    };
  });
}

const marketRecords = loadMarketRecords();
const latestMarket = (municipio: string, nome?: string) => {
  const matches = marketRecords.filter((item) => item.municipio === municipio && (!nome || normalize(item.nome) === normalize(nome)) && item.preco != null);
  return matches.sort((a, b) => b.periodo.localeCompare(a.periodo))[0] || null;
};

const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .toLocaleLowerCase("pt-BR");

const stateAbbreviations: Record<string, string> = {
  "11": "RO", "12": "AC", "13": "AM", "14": "RR", "15": "PA",
  "16": "AP", "17": "TO", "21": "MA", "22": "PI", "23": "CE",
  "24": "RN", "25": "PB", "26": "PE", "27": "AL", "28": "SE",
  "29": "BA", "31": "MG", "32": "ES", "33": "RJ", "35": "SP",
  "41": "PR", "42": "SC", "43": "RS", "50": "MS", "51": "MT",
  "52": "GO", "53": "DF",
};

export async function GET(request: Request) {
  const user = await getHubUser();
  if (!user?.canPresent) return new Response(null, { status: user ? 403 : 401 });
  const { searchParams } = new URL(request.url);
  const municipalityCode = searchParams.get("municipalityCode")?.trim();

  if (municipalityCode) {
    const municipality = ibgeMock.municipalities.find(
      (item) => item.code === municipalityCode,
    ) as Municipality | undefined;

    if (!municipality) {
      return NextResponse.json({ error: "Município não encontrado na base mockada do IBGE." }, { status: 404 });
    }

    const neighborhoods = (ibgeMock.neighborhoods as Neighborhood[])
      .filter((item) => item.municipalityCode === municipalityCode)
      .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));

    return NextResponse.json({
      municipality,
      neighborhoods,
      market: latestMarket(municipality.name),
      neighborhoodMarket: Object.fromEntries(neighborhoods.map((item) => [item.code, latestMarket(municipality.name, item.name)])),
      source: ibgeMock.metadata,
    });
  }

  const query = normalize(searchParams.get("search") || "");
  if (query.length < 2) {
    return NextResponse.json({ municipalities: [], source: ibgeMock.metadata });
  }

  const municipalities = (ibgeMock.municipalities as Municipality[])
    .filter((item) => {
      const searchable = normalize(
        `${item.name} ${item.state} ${item.stateCode} ${stateAbbreviations[item.stateCode] || ""}`,
      );
      return query.split(/\s+/).every((part) => searchable.includes(part));
    })
    .sort((a, b) => {
      const aStarts = normalize(a.name).startsWith(query) ? 0 : 1;
      const bStarts = normalize(b.name).startsWith(query) ? 0 : 1;
      return aStarts - bStarts || a.name.localeCompare(b.name, "pt-BR");
    })
    .slice(0, 25);

  return NextResponse.json({ municipalities, source: ibgeMock.metadata });
}
