'use client'; //Para usar a lib "toast", é necessário marcar o componente como "client"

import Image from "next/image";
import Link from "next/link";
import "@/styles/login.css";
import {z} from "zod"; //utilizado para apoio nas validações do front (npm i zod)
import toast from 'react-hot-toast'; //(npm i react-hot-toast)
import {createUser, LoginCredentials} from "@/utils/credentials";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faEnvelope, faLock} from '@fortawesome/free-solid-svg-icons'

//CreateUserSchema é utilizado para as regras de validação do zod, para os campos de createUser
const CreateUserSchema = z.object({
    email: z.string().trim().email('Formato de email incorreto'),
    confEmail: z.string().trim().email('Formato de email incorreto'),
    password: z.string({message: 'Campo senha não pode estar vazio'}).trim().min(4, {message: 'Senha precisa ter 4 caracteres no mínimo'}),
    confPassword: z.string({message: 'Insira uma confirmação de senha'}).trim().min(1, {message: 'Campo confirmação de senha não pode estar vazio'}),
}).refine((data) => data.password === data.confPassword, {
    message: "Senhas não coincidem",
    path: ["confPassword"]
}).refine((data) => data.email === data.confEmail, {
    message: "Emails não coincidem",
    path: ["confEmail"]
});

export default function CreateUserForm() {
    //A função createUserClient faz uma conexão entre um componente "client" e um "server". Ela está associada ao "form", em "action"
    const createUserClient = async (formData: FormData) => {
        const createUserData = {
            email: formData.get('email') as string,
            confEmail: formData.get('conf-email') as string,
            password: formData.get('password') as string,
            confPassword: formData.get('conf-password') as string
        }

        const result = CreateUserSchema.safeParse(createUserData);

        if(!result.success){
            let errorMsg = "";

            //Quando existe mais de um erro, acumulam-se todas as mensagens de erro para mostrar somente uma
            result.error.issues.forEach((issue) => {
                errorMsg = errorMsg + issue.message + '. ';
            })
            //Mensagem de erro sendo passada para o "toast" mostrar para o usuário. Para isso, foi necessário adicionar o componente <Toaster /> em "layout.tsx"
            toast.error(errorMsg);
            return;
        }

        //Chama o Server Action
        const retorno = await createUser(createUserData as LoginCredentials);

        if(retorno){
            toast.error(retorno.error);
            return;
        }

    }

    return (
      <>
        <main>
            <Link href={'/'}>
                <Image src="/LogoBlack.png" alt='Logo do site BookHub' width={90} height={80}/>
                <h2 id='book-hub'>BookHub</h2>
            </Link>

            <form className='login-form' action={createUserClient}>

            <div className='user-container'>
                <input type="text" id='user-input' name='email' placeholder='Digite o seu Email' required/>
                <FontAwesomeIcon icon={faEnvelope} id='user-icon'/>
            </div>

            <div className='user-container'>
                <input type="text" id='user-input' name='conf-email' placeholder='Confirme o seu Email' required/>
                <FontAwesomeIcon icon={faEnvelope} id='user-icon'/>
            </div>

            <div className='psw-container'>
                <input type="password" id='psw-input' name='password' placeholder='Digite a sua Senha' required/>
                <FontAwesomeIcon icon={faLock} id='psw-icon'/>
            </div>

            <div className='psw-container'>
                <input type="password" id='psw-input' name='conf-password' placeholder='Confirme a sua Senha' required/>
                <FontAwesomeIcon icon={faLock} id='psw-icon'/>
            </div>

            <button id="login-btn">Cadastrar</button>

            <div id="cadast-container">
                <p>Já tem uma conta?</p>
                <Link id="cadast-link" href={'/user/login'}>Entrar</Link>
            </div>

            </form>
        </main>
      </>
    );
  }