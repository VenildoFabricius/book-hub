"use client"

import "@/styles/estante.css";
import '@/styles/Card.css'
import Image from "next/image";
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import axios from "axios";
import { useState } from "react";
import Card from '@/components/Card';

interface Livro {
    id: string;
    volumeInfo: {
        title: string;
        authors?: string[];
        publishedDate?: string;
        imageLinks?: {
            thumbnail?: string;
            medium?: string;
        };
        description?: string;
    };
}

export default function Estante() {

    const [busca, setBusca] = useState(""); // Estado para o input de busca
    const [livros, setLivros] = useState<Livro[]>([]); // Estado com tipagem para os resultados da busca
    const [livroSelecionado, setLivroSelecionado] = useState<Livro | null>(null);

    const buscaLivros = async () => {
        //caso o input esteja vazio
        if (busca.trim() === "") {
            alert("Por favor, insira o nome de um livro.");
            return;
        }

        try {
            const resposta = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=${busca}&sortBy=relevance&maxResults=40`);
            setLivros(resposta.data.items || []);

        } catch (error) {
            console.error("Erro ao buscar livros:", error);
            alert("Não foi possível buscar os livros. Tente novamente mais tarde.");
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            buscaLivros();
        }
    }

    const selecionarLivro = (livro: Livro) => {
        setLivroSelecionado(livro);
    };

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

                <a href="#" id="link-sair">Sair</a>
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
                {livroSelecionado ? (
                    <section id='detalhes'>

                        <div id='voltar'>
                            <button id='voltar-icone' onClick={() => setLivroSelecionado(null)}><FontAwesomeIcon icon={faArrowLeft} /></button>
                            <p id="voltar-msg">Voltar para a pesquisa</p>
                        </div>

                        <div className="detalhes-livro">
                            <img src={livroSelecionado.volumeInfo.imageLinks?.medium ||
                                livroSelecionado.volumeInfo.imageLinks?.thumbnail ||
                                "/SemCapa.png"}
                                alt={livroSelecionado.volumeInfo.title}
                            />

                            <div id='det-texto'>
                                <div id="dados-botoes">
                                    <div id='det-dados'>
                                        <h3>{livroSelecionado.volumeInfo.title}</h3>
                                        <p>Autor(es): {livroSelecionado.volumeInfo.authors?.join(", ") || "Autor desconhecido"}</p>
                                        <p>Data de Publicação: {livroSelecionado.volumeInfo.publishedDate || "Data desconhecida"}</p>
                                    </div>
                                    <div id='botoes'>
                                        <button>Lido</button>
                                        <button>Lendo</button>
                                        <button>Quero Ler</button>
                                    </div>
                                </div>
                                <p id='det-descr'>{livroSelecionado.volumeInfo.description || "Descrição não disponível"}</p>
                            </div>

                        </div>
                    </section>

                ) : (
                    livros.map((item) => (
                        <Card
                            key={item.id}
                            titulo={item.volumeInfo.title}
                            autor={item.volumeInfo.authors?.join(", ") || "Autor desconhecido"}
                            ano={item.volumeInfo.publishedDate || "Data desconhecida"}
                            imagem={item.volumeInfo.imageLinks?.thumbnail || "/SemCapa.png"} // Exibe uma imagem padrão caso não exista
                            descricao=''
                            onClick={() => selecionarLivro(item)} // Passa o livro para o estado
                        />
                    ))
                )}
            </section>
        </main>
    );
}
