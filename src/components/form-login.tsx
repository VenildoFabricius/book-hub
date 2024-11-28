"use client"

import Image from "next/image";
import Link from "next/link";
import "@/styles/create.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faEnvelope, faLock} from '@fortawesome/free-solid-svg-icons'
import {z} from "zod";
import toast from 'react-hot-toast';
import { LoginCredentials } from "@/utils/credentials";
import {login} from "@/utils/credentials";

//LoginSchema é utilizado para as regras de validação do zod, para os campos de login
const LoginSchema = z.object({
    email: z.string().trim().email('Email com formato incorreto'),
    password: z.string({message: 'Insira uma senha'}).trim().min(1, {message: 'Campo senha não pode estar vazio'})
})

export default function LoginForm() {
    //A função loginClientAction faz uma conexão entre um componente "client" e um "server". Ela está associada ao "form", em "action"
    const loginClientAction = async(formData: FormData) => {
        
        const loginData: LoginCredentials = {
            email: formData.get('email') as string, //pega o campo name do input do email dentro do form
            password: formData.get('password') as string //pega o campo name do input da senha dentro do form
        }
                
        const result = LoginSchema.safeParse(loginData);

        if(!result.success){
            let errorMsg = "";

            //Quando existe mais de um erro, acumulam-se todas as mensagens de erro para mostrar somente uma
            result.error.issues.forEach((issue) => {
                errorMsg = errorMsg + issue.message + '. ';
            })

            toast.error(errorMsg);
            return;
        }

        //Chama o Server Action
        const retorno = await login(loginData)
        if(retorno){
            toast.error(retorno.error);
            result;
        }
    }
    return (
      <>
        <main>
            <Link href={'/'}>
                <Image src="/LogoBlack.png" alt='Logo do site BookHub' width={90} height={80}/>
                <h2 id='book-hub'>BookHub</h2>
            </Link>

            <form className='login-form' action={loginClientAction}>

            <div className='user-container'>
                <input type="text" id='user-input' name="email" placeholder='Digite seu Email' />
                <FontAwesomeIcon icon={faEnvelope} id='user-icon'/>
            </div>

            <div className='psw-container'>
                <input type="password" id='psw-input' name="password" placeholder='Digite sua Senha' />
                <FontAwesomeIcon icon={faLock} id='psw-icon'/>
            </div>

            <button id="login-btn">Entrar</button>

            <div id="cadast-container">
                <p>Ainda não tem uma conta?</p>
                <Link id="cadast-link" href={'/user/create'}>Cadastrar</Link>
            </div>

            </form>
        </main>
      </>
    );
    }