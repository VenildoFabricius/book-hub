import "@/styles/estante.css";
import Image from "next/image";
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faMagnifyingGlass} from '@fortawesome/free-solid-svg-icons'

export default function Estante() {
    return (
      <>
        <main>
            <header>
                <div id="logo">
                    <Image src="/LogoBlack.png" alt='Logo do site BookHub' width={30} height={30}/>
                    <p id='book-hub'>BookHub</p>
                </div>

                <div className='search-container'>
                    <input type="text" className='search-bar' placeholder='Encontre sua próxima história...' />
                    <button className='search-btn'><FontAwesomeIcon icon={faMagnifyingGlass} id='lupa'/></button>
                </div>  

                <a href="#" className="link">Sair</a>
            </header>

            <section id="user-section">
                <div id="img-conteiner">
                    <img src="/avatar.jpg" alt="Foto de perfil do usuário" />
                </div>
                <div>
                    <p id="username-display">Nome do Usuário</p>
                    <div id="info-cards">
                        <div className="info-card"><p>Todos</p><p className="num-cards">72</p></div>
                        <div className="info-card"><p>Lidos</p><p className="num-cards">58</p></div>
                        <div className="info-card"><p>Lendo</p><p className="num-cards">2</p></div>
                        <div className="info-card"><p>Quero Ler</p><p className="num-cards">12</p></div>
                    </div>
                </div>
            </section>

            <section id="estante">
                
            </section>

        </main>
        </>
    );
  }
