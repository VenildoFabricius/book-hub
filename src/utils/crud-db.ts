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
    const userData = await ConexaoBD.retornaBD(arquivo);
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

    if (livroExiste) {
        throw new Error('Este livro já está na estante.');
    }

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

    user.estante.push(novoLivro);

    await ConexaoBD.armazenaBD('users.json', userData);
}

// READ
export async function listarLivros(usuario: string) {    
    if (!usuario) {
        throw new Error("O e-mail do usuário não foi fornecido.");
    }

    const userData = await ConexaoBD.retornaBD(arquivo);
    
    // Verifica se o usuário foi encontrado
    const user = userData.find(user => user.email === usuario);
    
    if (!user) {
        throw new Error(`Usuário com email ${usuario} não encontrado.`);
    }

    // Verifica se a propriedade 'estante' existe no usuário
    if (!user.estante) {
        throw new Error(`A estante do usuário ${usuario} não foi encontrada.`);
    }

    const livrosEstante = user.estante.map((livro: CardProps) => {
        return livro;
    });

    return livrosEstante;
}

// DELETE
export async function excluirLivros (usuario: string, isbn: string) {
    const userData = await ConexaoBD.retornaBD(arquivo);
    const user = userData.find(user => user.email === usuario);

    //Procura o livro pelo ISBN
    const indexLivro = user.estante.findIndex((livro: any) => livro.ISBN === isbn);

    //Remove o Livro da estante
    user.estante.splice(indexLivro, 1);

    //Salva as alterações no json
    await ConexaoBD.armazenaBD(arquivo, userData)
}

// EDIT
export async function editarLivros(usuario: string, isbn: string, novoComentario: string) {
    try {
        
        const userData = await ConexaoBD.retornaBD(arquivo);

        const user = userData.find((u: any) => u.email === usuario);
        if (!user) {
            throw new Error(`Usuário com email ${usuario} não encontrado.`);
        }

        const livro = user.estante.find((l: any) => l.ISBN === isbn);
        if (!livro) {
            throw new Error(`Livro com ISBN ${isbn} não encontrado na estante do usuário.`);
        }

        livro.comentarios = novoComentario;

        await ConexaoBD.armazenaBD(arquivo, userData);
    } catch (error: any) {
        console.error("Erro ao editar livro:", error.message);
        throw new Error("Não foi possível editar o comentário.");
    }
}