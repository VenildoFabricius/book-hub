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

    // Verifica se o livro já existe na estante para a categoria específica ou para "Todos"
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
    const userData = await ConexaoBD.retornaBD(arquivo);
    const user = userData.find(user => user.email === usuario);

    const livrosEstante = user.estante.map((livro: CardProps) => {
        return livro;
    });

    return livrosEstante;
}