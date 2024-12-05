'use server';

import { redirect } from "next/navigation";
import * as bcrypt from 'bcrypt'; // Lib usada para armazenar a senha criptografada: npm i bcrypt
import crypto from 'crypto';
import ConexaoBD from "./conexao-bd";
import { createSessionToken } from "@/utils/auth";
import { boolean } from "zod";

const arquivo = 'users.json'; // Variável com o nome do arquivo .json utilizado como "banco de dados" de usuários

export interface LoginCredentials {
    email: string,
    password: string
}

export async function createUser(data: LoginCredentials) {

    const email = (data.email as string).trim();
    const password = data.password as string;

    const passwordCrypt = await bcrypt.hash(password, 10);

    const novoUser = {
        id: crypto.randomUUID(),
        email,
        password: passwordCrypt,
        estante: []
    }

    // Busca a base de usuários
    const usuariosBD = await ConexaoBD.retornaBD(arquivo);

    //Verifica se usuário já existe
    for (const user of usuariosBD) {
        if (user.email === email) {
            return { error: 'Usuário ou senha incorretos' };
        }
    }

    // Nenhum user encontrado. Pode adicionar o novo no banco
    usuariosBD.push(novoUser);
    await ConexaoBD.armazenaBD(arquivo, usuariosBD);
    redirect('/user/login'); // Redireciona para a página de login
}

export async function login(data: LoginCredentials) {

    const email = data.email;
    const password = data.password;

    //Manipula BD
    const usuariosBD = await ConexaoBD.retornaBD(arquivo);

    const user = usuariosBD.find(user => user.email === email);

    if (!user) {
        return { error: 'Usuário não encontrado' }
    }
    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
        await createSessionToken({ userID: user.id, email: user.email });
        redirect('/main/estante');
    } else {
        return { error: 'Usuário ou senhas incorretos' }
    }
}
