import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const estantePath = path.join(process.cwd(), "src", "db", "estante.json");

export async function POST(req: Request) {
  try {
    const livro = await req.json();

    if (!fs.existsSync(estantePath)) {
      fs.writeFileSync(estantePath, JSON.stringify([]), "utf-8");
    }

    const fileContent = fs.readFileSync(estantePath, "utf-8");
    const estante = JSON.parse(fileContent);

    // Verificar duplicatas
    if (estante.some((item: any) => item.id === livro.id)) {
      return NextResponse.json({ message: "Livro já existe na estante!" });
    }

    estante.push(livro); // Salva o objeto inteiro
    fs.writeFileSync(estantePath, JSON.stringify(estante, null, 2), "utf-8");

    return NextResponse.json({ message: "Livro adicionado com sucesso!" });
  } catch (error) {
    console.error("Erro ao adicionar livro:", error);
    return NextResponse.json(
      { error: "Erro ao adicionar livro." },
      { status: 500 }
    );
  }
}


export async function GET() {
  try {
    const fileContent = fs.readFileSync(estantePath, "utf-8");
    const estante = JSON.parse(fileContent);
    return NextResponse.json(estante);
  } catch (error) {
    console.error("Erro ao carregar a estante:", error);
    return NextResponse.json({ error: "Erro ao carregar a estante." }, { status: 500 });
  }
}


export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();

    // Verificar se o arquivo existe
    if (!fs.existsSync(estantePath)) {
      return NextResponse.json(
        { message: "Estante vazia ou não encontrada." },
        { status: 404 }
      );
    }

    const fileContent = fs.readFileSync(estantePath, "utf-8");
    const estante = JSON.parse(fileContent);

    // Filtrar livros, excluindo o livro com o ID especificado
    const novaEstante = estante.filter((livro: any) => livro.id !== id);

    // Atualizar o arquivo JSON
    fs.writeFileSync(estantePath, JSON.stringify(novaEstante, null, 2), "utf-8");

    return NextResponse.json({ message: "Livro removido com sucesso!" });
  } catch (error) {
    console.error("Erro ao remover livro:", error);
    return NextResponse.json(
      { error: "Erro ao remover livro." },
      { status: 500 }
    );
  }
}
