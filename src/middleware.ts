//Esse arquivo precisa ter esse nome "middleware" e deve ficar no diretório "src/"
//Todas as requisições passam por aqui. Caso a session seja válida ou rota pública, o redirecionamento segue normalmente
//Caso a session seja inválida (buscamos no cookie) o user é redirecionado para a página de login

/*
Propósito do Middleware
Esse middleware é uma função que intercepta todas as requisições feitas ao servidor Next.js. Ele verifica se a requisição:

É para uma rota pública (como páginas de login ou recursos específicos). Se for, a requisição segue normalmente.
Está associada a uma sessão válida. Caso contrário, o usuário é redirecionado para a página de login.
*/


/*
NextRequest e NextResponse: São utilitários do Next.js para manipular requisições e respostas.
isSessionValid: Uma função que verifica se a sessão do usuário (obtida do cookie ou outra fonte) é válida. Essa função está implementada no arquivo auth.ts em utils.
*/
import { NextRequest, NextResponse } from "next/server";
import {isSessionValid} from "@/utils/auth";

//Esse "matcher" se encontra na própria documentação do next e serve para filtrar arquivos que não devem ser afetados
/*
matcher: Define quais rotas serão interceptadas pelo middleware.
O regexp utilizado aqui significa:
    Ignorar requisições que começam com /api, /favicon.ico, /robots.txt, etc., pois essas rotas geralmente não requerem autenticação (são recursos estáticos ou rotas internas).
    Todas as outras rotas serão verificadas.
*/
export const config = {
    matcher: '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)'
}

/*
publicRoutes: Lista de rotas que podem ser acessadas sem autenticação. Isso inclui:
    A página inicial (/).
    Página de login (/user/login).
    Página de criação de conta (/user/create).
    Um recurso específico (/ilustracao.jpg).
*/
const publicRoutes = [
    '/',
    '/user/login',
    '/user/create',
    '/ilustracao.jpg'
];

//req: Representa a requisição atual.
//req.nextUrl.pathname: Extrai a URL solicitada pelo cliente.
export async function middleware(req: NextRequest){

    const pathname = req.nextUrl.pathname;

    /*
     middleware verifica se a URL solicitada está em publicRoutes. Se estiver:
        NextResponse.next(): Permite que a requisição continue sem alterações.
    */
    if(publicRoutes.includes(pathname))
    {
        return NextResponse.next();
    }

    /*
    isSessionValid(): Verifica se a sessão do usuário é válida.
        Pode checar cookies ou tokens de autenticação no cliente.
        Se não for válida, o usuário é redirecionado para a página de login (/user/login).
    Caso a sessão seja válida, o fluxo segue normalmente (NextResponse.next()).
    */
    //validar a session no arquivo "auth.ts".
    const session = await isSessionValid();
    //Caso não exista session, redirecionar para a página de login
    if(!session){
        return NextResponse.redirect(new URL('/user/login', req.url));
    }
    return NextResponse.next();
}