"""Prepara fonte sanitizada; não altera a aplicação nem exporta banco.

Uso: python3 scripts/preparar-entrega.py /tmp/destino-inexistente
"""
from pathlib import Path
import shutil
import sys

ROOT = Path(__file__).resolve().parents[1]
EXCLUDE = {".git", ".jj", ".lovable", ".workspace", "node_modules", "dist", "dist-ssr",
           ".output", ".tanstack", ".nitro", ".wrangler", ".vinxi", "__pycache__"}
ROOT_FILES = {"README.md", "AGENTS.md", "package.json", "bun.lock", "bunfig.toml",
              "components.json", "tsconfig.json", "vite.config.ts", "drizzle.config.ts",
              "eslint.config.js", ".prettierrc", ".prettierignore", ".env.example"}


def prepare(target: Path):
    target = target.resolve()
    if target == ROOT or ROOT in target.parents or target.exists():
        raise SystemExit("Use um destino inexistente fora do projeto.")
    target.mkdir(parents=True)
    for name in ROOT_FILES:
        source = ROOT / name
        if source.is_file():
            shutil.copy2(source, target / name)
    for folder in ("src", "public", "docs", "scripts", "drizzle"):
        for source in (ROOT / folder).rglob("*"):
            relative = source.relative_to(ROOT)
            if any(part in EXCLUDE for part in relative.parts) or not source.is_file():
                continue
            if source.name.startswith(".env") or source.suffix in {".log", ".pyc"}:
                continue
            if source.name in {"routeTree.gen.ts", "0000_admin_conta_provisoria.sql"}:
                continue
            if "meta" in relative.parts and "migrations" in relative.parts:
                continue
            destination = target / relative
            destination.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(source, destination)

    login = target / "src/components/TelaLogin.tsx"
    content = login.read_text()
    begin = content.index("  // PROVISÓRIO: login suspenso")
    end = content.index("  useEffect(() => {", content.index("  }, []);", begin))
    content = content[:begin] + "  // Cópia de transferência: acesso individual obrigatório.\n\n" + content[end:]
    login.write_text(content)

    trigger = target / "drizzle/migrations/0001_gatilhos_novo_usuario.sql"
    content = trigger.read_text()
    trigger.write_text(content.split("CREATE TRIGGER on_auth_user_admin_autorizado")[0].rstrip() + "\n")

    (target / ".gitignore").write_text("node_modules/\ndist/\ndist-ssr/\n.output/\n.tanstack/\n.nitro/\n.wrangler/\n.env\n.env.*\n!.env.example\n*.log\n*.tsbuildinfo\n")
    (target / "MANIFESTO_ENTREGA.md").write_text(
        "# Manifesto de transferência — SEFAZ/CE\n\n"
        "Código organizado a partir do projeto em 06/11/2026. Não é instalação completa nem release de produção.\n\n"
        "Diferenças deliberadas: login automático compartilhado removido de TelaLogin.tsx; "
        "migração de concessão provisória de admin excluída e gatilho correspondente retirado "
        "da migração 0001. A aplicação de origem e seu backend não foram modificados por esta preparação.\n\n"
        "Excluídos: .env, config.toml da plataforma, metadados de repositório/plataforma, "
        "dependências, build, snapshots Drizzle incompletos, rota gerada e logs. "
        "Sem dados exportados, contas, senhas ou segredos. Configurar .env.example no destino.\n\n"
        "Banco: migrações restantes são incrementais; obter exportação oficial separada. "
        "Não aplicar a banco vazio nem importar conta compartilhada como administrador institucional.\n"
    )
    print(f"Pacote preparado em {target}; inspecione todas as entradas antes de distribuir.")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit("Informe o diretório de destino inexistente.")
    prepare(Path(sys.argv[1]))