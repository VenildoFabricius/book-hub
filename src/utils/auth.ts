'use server'

import * as jose from 'jose'; //npm i jose. A lib é um wrapper do JWT. Também é necessário instala, npm i jsonwebtoken
import { cookies } from 'next/headers';

//Essa função retorna o token descriptografado. A função "jwtVerify"
export async function openSessionToken(token: string) {
    //Para que isso funcione é necessário criar o arquivo oculto ".env"
    //Coloque uma chave "TOKEN" e gera um valor aleatório para ela
    //Por exemplo pode usar o próprio node para isso diretamente no terminal. require('crypto').randomBytes(64).toString('hex').
    //Para acessar o terminal "node", digite "node".
    //Para retornar ao terminal bash, digite ".exit"
    const secret = new TextEncoder().encode(process.env.TOKEN);
    //Aqui a lib "jose" irá verificar se há um token válido e extrair o payload (carga útil)
    const { payload } = await jose.jwtVerify(token, secret);
    return payload;
}

export async function createSessionToken(payload = {}) {
    const secret = new TextEncoder().encode(process.env.TOKEN);

    //Cria  session. 
    const session = await new jose.SignJWT(payload)  // É feita uma "assinatura" do payload
        .setProtectedHeader({alg: 'HS256'})          // Define o algoritmo de criptografia
        .setExpirationTime('1h')                     // Define um tempo para expirar
        .sign(secret);                               //Assina o token

    //Assim que o token é criado, já iremos "abrir" para pegar o tempo de expiração.
    const { exp } = await openSessionToken(session);

    //Seguindo a documentação do next, precisamos primeiro criar o cookieStore, pois é async
    const cookieStore = await cookies();

    //Através da cookieStore conseguimos buscar (get) e salvar (set) cookies no navegador.
    cookieStore.set('session', session, {
        expires: (exp as number) * 1000,
        path: '/',
        httpOnly: true
    });
}

// Modificações feitas para retornar o payload, fazendo com que seja possível extrair o email do usuário e exibir após o login
export async function isSessionValid() {
    const sessionCookie = (await cookies()).get('session');

    if (sessionCookie) {
        const { value } = sessionCookie;
        try {
            const payload  = await openSessionToken(value);
            const currentDate = new Date().getTime();

            if ((payload.exp as number) * 1000 > currentDate) {
                return payload; //Retorna o payload completo
            }
        } catch (error) {
            console.error('Erro ao validar o token: ', error);
        }

    }
    return false; //False para sessão inválida
}

export async function logout() {
    const cookieStore = await cookies();
    cookieStore.set('session', '', { expires: new Date(0), path: '/' });
}