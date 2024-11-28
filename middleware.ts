//Esse arquivo precisa ter esse nome "middleware" e deve ficar no diretório "src/"
//Todas as requisições passam por aqui. Caso a session seja válida ou rota pública, o redirecionamento segue normalmente
//Caso a session seja inválida (buscamos no cookie) o user é redirecionado para a página de login

import { NextRequest, NextResponse } from "next/server";
import {isSessionValid} from "@/utils/auth";

//Esse "matcher" se encontra na própria documentação do next e serve para filtrar arquivos que não devem ser afetados
export const config = {
    matcher: '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)'
}

const publicRoutes = [
    '/',
    '/user/login',
    '/user/create'
];

export async function middleware(req: NextRequest){

    const pathname = req.nextUrl.pathname;

    if(publicRoutes.includes(pathname))
    {
        return NextResponse.next();
    }

    //validar a session no arquivo "auth.ts".
    const session = await isSessionValid();
    //Caso não exista session, redirecionar para a página de login
    if(!session){
        return NextResponse.redirect(new URL('/user/login', req.url));
    }
    return NextResponse.next();
}