import * as jose from 'jose'; //npm i jose. A lib é um wrapper do JWT. Também é necessário instala, npm i jsonwebtoken
import { cookies } from 'next/headers';

//Essa função retorna o token descriptografado. A função "jwtVerify"
async function openSessionToken(token: string){
    //Para que isso funcione é necessário criar o arquivo oculto ".env"
    //Coloque uma chave "TOKEN" e gera um valor aleatório para ela
    //Por exemplo pode usar o próprio node para isso diretamente no terminal. require('crypto').randomBytes(64).toString('hex').
    //Para acessar o terminal "node", digite "node".
    //Para retornar ao terminal bash, digite ".exit"
    const secret = new TextEncoder().encode(process.env.TOKEN);
    //Aqui a lib "jose" irá verificar se há um token válido e extrair o payload (carga útil)
    const {payload} = await jose.jwtVerify(token, secret);
    return payload;
}

export async function createSessionToken(payload = {}){
    const secret = new TextEncoder().encode(process.env.TOKEN); 

    //Cria  session. É feita uma "assinatura" do payload
    //Aqui também espeficifamos o algoritmo de criptografia como HS256
    const session = await new jose.SignJWT(payload).setProtectedHeader({
        alg: 'HS256'
    })
    .setExpirationTime('1h') //Define um tempo para expirar
    .sign(secret); //Assina o token
    //Assim que o token é criado, já iremos "abrir" para pegar o tempo de expiração.
    const {exp} = await openSessionToken(session);

    //Seguindo a documentação do next, precisamos primeiro criar o cookieStore, pois é async
    const cookieStore = await cookies();
    
    //Através da cookieStore conseguimos buscar (get) e salvar (set) cookies no navegador.
    cookieStore.set('session', session, {
        expires: (exp as number) * 1000,
        path: '/',
        httpOnly: true
    });
}

export async function isSessionValid(){
    const sessionCookie = (await cookies()).get('session');

    if(sessionCookie)
    {
        const {value} = sessionCookie;
        const {exp} = await openSessionToken(value);
        const currentDate = new Date().getTime();

        return ((exp as number) * 1000) > currentDate;
    }

    return false;
}