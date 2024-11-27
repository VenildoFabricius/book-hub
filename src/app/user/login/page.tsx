import Image from "next/image";
import Link from "next/link";
import "@/styles/create.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faEnvelope, faLock} from '@fortawesome/free-solid-svg-icons'

export default function Login() {
    return (
      <>
        <main>
            <Link href={'/'}>
                <Image src="/LogoBlack.png" alt='Logo do site BookHub' width={90} height={80}/>
                <h2 id='book-hub'>BookHub</h2>
            </Link>

            <form className='login-form' action="">

            <div className='user-container'>
                <input type="text" id='user-input' placeholder='Digite seu Email' />
                <FontAwesomeIcon icon={faEnvelope} id='user-icon'/>
            </div>

            <div className='psw-container'>
                <input type="password" id='psw-input' placeholder='Digite sua Senha' />
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