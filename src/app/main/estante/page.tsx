"use client"

import "@/styles/estante.css";
import Image from "next/image";
import CardEstante, { CardProps } from '@/components/card-estante';
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from "next/navigation";
import { logout } from "@/utils/auth";
import { isSessionValid } from "@/utils/auth";
import { listarLivros } from "@/utils/crud-db";


export default function Estante() {

    const [busca, setBusca] = useState(""); // Estado para o input de busca
    const [usuario, setUsuario] = useState<string>(""); //Estado para pegar o email do usuario logado
    const [livros, setLivros] = useState<CardProps[]>([]);
    const [livroSelecionado, setLivroSelecionado] = useState<CardProps | null>(null); // Estado do livro selecionado
    const router = useRouter();

    const buscaLivros = async () => {
        //caso o input esteja vazio
        if (busca.trim() === "") {
            return;
        }

        // Redireciona para a página de pesquisa com o termo como query param
        router.push(`/main?busca=${encodeURIComponent(busca)}`);
    }

    // Pegando o email do usuário logado
    useEffect(() => {
        async function fetchUsuario() {
            const session = await isSessionValid(); //Chama a função isSessionValid para ober os dados do usuário
            if (session && typeof session.email === 'string') { //Se o usuáio estiver logado
                setUsuario(session.email); //Estado atualizado com o email do usuário
            }
        }
        fetchUsuario(); //Chama a função fetchUsuario (acima). É chamada imediatamente para verificar a sessão do usuário assim que ele logar
    }, []);  // [] Garante que o useEffect seja executado somente uma vez para evitar chamadas desnecessárias a isSessionValid()

    useEffect(() => {
        const fetchLivros = async () => {
            const livrosEstante = await listarLivros(usuario);
            setLivros(livrosEstante);
        };

        fetchLivros();
    }, [usuario]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            buscaLivros();
        }
    }

    const selecionarLivro = (livro: CardProps) => {
        setLivroSelecionado(livro);
      };

    const minhaEstante = () => {
        router.push('/main/estante');
    }

    const finalizaSessao = async () => {
        await logout();
        router.push('/');
    }


    return (
        <main>
            <header>
                <div id="logo">
                    <Image src="/LogoBlack.png" alt='Logo do site BookHub' width={30} height={30} />
                    <p id='book-hub'>BookHub</p>
                </div>

                <div className='search-container'>
                    <input type="text"
                        className='search-bar'
                        placeholder='Encontre sua próxima história...'
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    <button className='search-btn' onClick={buscaLivros}><FontAwesomeIcon icon={faMagnifyingGlass} id='lupa' /></button>
                </div>

                <div>
                    <a href="#" className="link" onClick={minhaEstante}>Minha Estante</a>
                    <a href="#" className="link" onClick={finalizaSessao}>Sair</a>
                </div>
            </header>

            <section id="user-section">
                <div id="img-conteiner">
                    <img src="/avatar.jpg" alt="Foto de perfil do usuário" />
                </div>
                <div>
                    <p id="username-display">{usuario}</p>
                    <div id="info-cards">
                        <div className="info-card"><p>Todos</p><p className="num-cards">72</p></div>
                        <div className="info-card"><p>Lidos</p><p className="num-cards">58</p></div>
                        <div className="info-card"><p>Lendo</p><p className="num-cards">2</p></div>
                        <div className="info-card"><p>Quero Ler</p><p className="num-cards">12</p></div>
                    </div>
                </div>
            </section>

            <section id="estante">
                {livros.map((item) => (
                    <CardEstante
                        key={item.ISBN}
                        titulo={item.titulo}
                        capa={item.capa || "/SemCapa.png"} // Exibe uma imagem padrão caso não exista
                        onClick={() => selecionarLivro(item)} // Passa o livro para o estado
                    />
                ))}
            </section>
        </main>
    );
}