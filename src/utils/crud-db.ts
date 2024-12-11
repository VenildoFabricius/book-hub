"use server";

import ConexaoBD from "@/utils/conexao-bd";
import { CardProps } from "@/components/card-estante";

const arquivo = 'users.json';

interface Livro {
    volumeInfo: {
        industryIdentifiers?: {
            type: string;
            identifier: string;
        }[];
        title: string;
        authors?: string[];
        publishedDate?: string;
        imageLinks?: {
            thumbnail?: string
        };
        description?: string;
    };
}

// CREATE
export async function addLivroEstante(usuario: string, livro: Livro, categoria: "Lidos" | "Lendo" | "Quero Ler" | "Todos") {
    // Consulta o banco de dados
    const userData = await ConexaoBD.retornaBD(arquivo);

    // Procura pelo usuário passado como parâmetro
    const user = userData.find(user => user.email === usuario);

    if (!user) {
        throw new Error('Usuário não encontrado ou a estante não existe.');
    }

    // Obtém o ISBN do livro
    const isbn = livro.volumeInfo.industryIdentifiers?.find(id => id.type === "ISBN_13")?.identifier ||
        livro.volumeInfo.industryIdentifiers?.find(id => id.type === "ISBN_10")?.identifier;

    if (!isbn) {
        throw new Error('Livro sem ISBN não pode ser adicionado.');
    }

    // Verifica se o livro já existe na estante
    const livroExiste = user.estante.some((livroExistente: any) =>
        livroExistente.ISBN === isbn
    );

    // Se sim, impede que o mesmo livro seja adicionado novamente
    if (livroExiste) {
        throw new Error('Este livro já está na estante.');
    }

    // Define o objeto 'novoLivro'
    const novoLivro = {
        ISBN: livro.volumeInfo.industryIdentifiers?.find(id => id.type === "ISBN_13")?.identifier ||
            livro.volumeInfo.industryIdentifiers?.find(id => id.type === "ISBN_10")?.identifier,
        capa: livro.volumeInfo.imageLinks?.thumbnail || "/SemCapa.png",
        titulo: livro.volumeInfo.title,
        autor: livro.volumeInfo.authors || "Autor Desconhecido",
        data: livro.volumeInfo.publishedDate || "Data Desconehcida",
        comentarios: "",
        categoria: categoria === "Todos" ? undefined : categoria // Se for "todos", categoria será indefinida
    }

    // Armazena o novo livro na estante do usuário
    user.estante.push(novoLivro);

    // Salva as alterações no banco de dados
    await ConexaoBD.armazenaBD(arquivo, userData);
}

// READ
export async function listarLivros(usuario: string) {
    const userData = await ConexaoBD.retornaBD(arquivo);

    // Procura pelo usuário passado como parâmetro
    const user = userData.find(user => user.email === usuario);

    if (!user) {
        throw new Error(`Usuário com email ${usuario} não encontrado.`);
    }

    // Verifica se a propriedade 'estante' existe no usuário
    if (!user.estante) {
        throw new Error(`A estante do usuário ${usuario} não foi encontrada.`);
    }

    // Mapoeia os livros da estante do usuário, armazenando na variável 'livrosEstante'
    const livrosEstante = user.estante.map((livro: CardProps) => {
        return livro;
    });

    // Retorna os livros da estante do usuário
    return livrosEstante;
}

// UPDATE
export async function editarLivros(usuario: string, isbn: string, novoComentario: string) {
    try {
        // Consulta o banco de dados
        const userData = await ConexaoBD.retornaBD(arquivo);

        // Procura pelo usuário passado como parâmetro
        const user = userData.find((u: any) => u.email === usuario);
        if (!user) {
            throw new Error(`Usuário com email ${usuario} não encontrado.`);
        }

        // Procura pelo livro, através do ISBN passado como parâmetro
        const livro = user.estante.find((l: any) => l.ISBN === isbn);
        if (!livro) {
            throw new Error(`Livro com ISBN ${isbn} não encontrado na estante do usuário.`);
        }

        // Atualiza o campo 'comentarios' do livro com o 'novoComentario'
        livro.comentarios = novoComentario;

        // Atualiza o banco de dados
        await ConexaoBD.armazenaBD(arquivo, userData);
    } catch (error: any) {
        console.error("Erro ao editar livro:", error.message);
        throw new Error("Não foi possível editar o comentário.");
    }
}

// DELETE
export async function excluirLivros(usuario: string, isbn: string) {
    // Consulta o banco de dados
    const userData = await ConexaoBD.retornaBD(arquivo);

    // Procura pelo usuário fornecido como parâmetro
    const user = userData.find(user => user.email === usuario);

    // Procura o livro na estante do usuário usando o ISBN
    const indexLivro = user.estante.findIndex((livro: any) => livro.ISBN === isbn);

    // Remove o Livro da estante
    user.estante.splice(indexLivro, 1);

    // Salva as alterações no banco de dados
    await ConexaoBD.armazenaBD(arquivo, userData)
}
