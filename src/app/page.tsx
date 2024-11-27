import '@/app/page.css'
import Image from "next/image";
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faMagnifyingGlass} from '@fortawesome/free-solid-svg-icons'

export default function Home() {
  return (
    <>
      <main>
        <header>
        <Image src="/LogoBlack.png" alt='Logo do site BookHub' width={40} height={40}/>
        <div id='login-cadast'>
          <Link href={'/user/create'}>Cadastrar</Link>
          <Link href={'/user/login'}>Entrar</Link>
        </div>
        </header>

        <div id='apresentacao'>
          <div id='titulo'>
              <h2 id='book-hub'>BookHub</h2>
              <p>Sua estante digital, pensada para quem <span className='fundo-verde'>ama ler!</span></p>
          </div>
            <Image id= 'img-apres' src="/ilustracao.jpg" alt='Ilustração menina voando em livros' width={232} height={200}/>
        </div>
        <div className='search-container'>
          <input type="text" className='search-bar' placeholder='Encontre sua próxima história...' />
          <button className='search-btn'><FontAwesomeIcon icon={faMagnifyingGlass} id='lupa'/></button>
        </div>

        <p id='search-title'></p>
        <section id='search-results'>

        </section>
      </main>
    </>
  );
}