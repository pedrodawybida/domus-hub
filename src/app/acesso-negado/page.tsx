import Link from "next/link";

export default function AcessoNegado() {
  return <main className="p-10"><h1>Acesso às apresentações restrito</h1><p>Seu administrador pode liberar o acesso no CRM.</p><Link href="/">Voltar ao hub</Link></main>;
}
