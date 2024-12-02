import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'src', 'db', 'estante.json');

const loadEstante = () => {
  try {
    console.log('Lendo o arquivo estante.json...');
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    console.error('Erro ao ler o arquivo estante.json:', error);
    return [];
  }
};

const saveEstante = (data: any) => {
  try {
    console.log('Salvando dados no arquivo estante.json...');
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Erro ao salvar o arquivo estante.json:', error);
  }
};

export async function POST(request: NextRequest) {
  try {
    console.log('Recebendo requisição POST...');
    const body = await request.json();
    const { id, text } = body;

    if (!id || !text) {
      console.log('ID ou texto ausente:', { id, text });
      return NextResponse.json({ message: 'ID e texto são obrigatórios.' }, { status: 400 });
    }

    const estante = loadEstante();
    const livroIndex = estante.findIndex((livro: { id: string }) => livro.id === id);

    if (livroIndex === -1) {
      console.log(`Livro com ID ${id} não encontrado.`);
      return NextResponse.json({ message: 'Livro não encontrado.' }, { status: 404 });
    }

    estante[livroIndex].text = text;
    saveEstante(estante);

    console.log('Texto salvo com sucesso para o livro:', estante[livroIndex]);
    return NextResponse.json({ message: 'Texto salvo com sucesso!' });
  } catch (error) {
    console.error('Erro no endpoint /api/atualizarTexto:', error);
    return NextResponse.json({ message: 'Erro interno no servidor.', error: error.message }, { status: 500 });
  }
}
