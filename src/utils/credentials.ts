'use server';

import * as bcrypt from 'bcrypt'; // Lib usada para armazenar a senha criptografada: npm i bcrypt
import crypto from 'crypto';
import ConexaoBD from "./conexao-bd";
import { createSessionToken } from "@/utils/auth";
import { redirect } from "next/navigation";

const arquivo = 'users.json'; // Variável com o nome do arquivo .json utilizado como "banco de dados" de usuários

// Define as credenciais necessárias para a autenticação
export interface LoginCredentials {
    email: string,
    password: string
}

// Cria um novo usuário no sistema
export async function createUser(data: LoginCredentials) {

    // Extrai as credenciais
    const email = (data.email as string).trim(); // Trim: usado para remover espaços em branco nas extremidades da string
    const password = data.password as string;

    // É feita a criptografia da senha fornecida, com o uso do bcrypt
    const passwordCrypt = await bcrypt.hash(password, 10);

    // Cria um novo objeto de usuário
    const novoUser = {
        id: crypto.randomUUID(), // Gera um ID único para cada usuário
        email,
        password: passwordCrypt,
        estante: []
    }

    // Consulta o banco de dados
    const usuariosBD = await ConexaoBD.retornaBD(arquivo);

    // Verifica se usuário já existe
    for (const user of usuariosBD) {
        if (user.email === email) {
            return { error: 'Usuário ou senha incorretos' }; // Frase genérica, para não expor e-mail do usuário
        }
    }

    // Nenhum user encontrado. Pode adicionar o novo usuário no banco de dados
    usuariosBD.push(novoUser);
    await ConexaoBD.armazenaBD(arquivo, usuariosBD);
    redirect('/user/login'); // Redireciona para a página de login
}

// Autentica o usuário com base em suas credenciais (email e senha)
export async function login(data: LoginCredentials) {

    // Extrai as credenciais
    const email = data.email;
    const password = data.password;

    // Consulta o banco de dados
    const usuariosBD = await ConexaoBD.retornaBD(arquivo);

    // Procura no banco de dados o usuário cujo email corresponde ao fornecido
    const user = usuariosBD.find(user => user.email === email);

    // Se o usuário não for encontrado
    if (!user) {
        return { error: 'Usuário não encontrado' }
    }

    // Compara a senha fornecida com a senha no banco de dados usando bcrypt
    const isMatch = await bcrypt.compare(password, user.password);

    // Se a autenticação for bem-sucedida
    if (isMatch) {
        await createSessionToken({ userID: user.id, email: user.email }); // Cria o token de sessão com os dados do usuário
        redirect('/main/estante'); // Redireciona o usuário pára a sua estante
    } else {
        return { error: 'Usuário ou senhas incorretos' }
    }
}
