"use server";

import ConexaoBD from "@/utils/conexao-bd";
import CardEstante, { CardProps } from "@/components/card-estante";
import { error } from "console";

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

export async function addLivroEstante (usuario: string, livro: Livro) {   // CREATE
    const userData = await ConexaoBD.retornaBD(arquivo);
    const user = userData.find(user => user.email === usuario);

    if(!user) {
        throw new Error('Usuário não encontrado ou a estante não existe.');
    }

    const novoLivro = {
        ISBN: livro.volumeInfo.industryIdentifiers?.find(id => id.type === "ISBN_13")?.identifier || 
                livro.volumeInfo.industryIdentifiers?.find(id => id.type === "ISBN_10")?.identifier,
        capa: livro.volumeInfo.imageLinks?.thumbnail || "/SemCapa.png",
        titulo: livro.volumeInfo.title,
        autor: livro.volumeInfo.authors || "Autor Desconhecido",
        data: livro.volumeInfo.publishedDate || "Data Desconehcida",
        comentarios: ""
    }
    
    user.estante.push(novoLivro);

    await ConexaoBD.armazenaBD('users.json', userData);
}

export async function listarLivros (usuario: string) {    // READ
    const userData = await ConexaoBD.retornaBD(arquivo);
    const user = userData.find(user => user.email === usuario);
    
    const livrosEstante = user.estante.map((livro: CardProps) => {
        return livro;
    });

    return livrosEstante;
}