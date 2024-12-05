"use client"

import "@/styles/estante.css";
import Image from "next/image";
import axios from "axios";
import Card from '@/components/Card';
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { logout } from "@/utils/auth";


interface Livro {
    volumeInfo: {
        industryIdentifiers?: {
            type: string;
            identifier: string;
        }[];
        title: string;
        authors?: string[];
        publishedDate?: string;
        imageLinks?: {
            thumbnail?: string
        };
        description?: string;
    };
}


export default function Pesquisa() {
    const searchParams = useSearchParams();
    const buscaParam = searchParams.get("busca") || "";  // Obtém o termo de busca da URL
    const [busca, setBusca] = useState(buscaParam);  // Declarar o estado de 'busca'
    const [livros, setLivros] = useState<Livro[]>([]); // Estado com tipagem para os resultados da busca
    const [livroSelecionado, setLivroSelecionado] = useState<Livro | null>(null);
    const router = useRouter();
    
    // useEffect para realizar a pesquisa caso haja um parâmetro de busca na URL
    useEffect(() => {
        // Só faz a busca quando o parâmetro de busca mudar
        if (busca) {
            buscaLivros();
        }
    }, [busca]); // Executa a função sempre que 'busca' mudar

    const buscaLivros = async () => {
        //caso o input esteja vazio, não faz a busca
        if (busca.trim() === "") {
            return;
        }

        try {
            const resposta = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(busca)}&maxResults=40`);
            setLivros(resposta.data.items || []);

        } catch (error) {
            console.error("Erro ao buscar livros:", error);
            alert("Não foi possível buscar os livros. Tente novamente mais tarde.");
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            router.push(`/main?busca=${encodeURIComponent(busca)}`);
            buscaLivros();
        }
    }

    const selecionarLivro = (livro: Livro) => {
        setLivroSelecionado(livro);
    }

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
                    <p id="username-display">Nome do Usuário</p>
                    <div id="info-cards">
                        <div className="info-card"><p>Todos</p><p className="num-cards">72</p></div>
                        <div className="info-card"><p>Lidos</p><p className="num-cards">58</p></div>
                        <div className="info-card"><p>Lendo</p><p className="num-cards">2</p></div>
                        <div className="info-card"><p>Quero Ler</p><p className="num-cards">12</p></div>
                    </div>
                </div>
            </section>

            <section id="pesq-estante">
                {livroSelecionado ? (
                    <section id='detalhes'>

                        <div id='voltar'>
                            <button id='voltar-icone' onClick={() => setLivroSelecionado(null)}><FontAwesomeIcon icon={faArrowLeft} /></button>
                            <p id="voltar-msg">Voltar para a pesquisa</p>
                        </div>

                        <div className="detalhes-livro">
                            <img src={livroSelecionado.volumeInfo.imageLinks?.thumbnail?.replace("zoom=1", "zoom=2") ||
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
                            key={item.volumeInfo.industryIdentifiers?.find(id => id.type === "ISBN_13")?.identifier ||
                                item.volumeInfo.industryIdentifiers?.find(id => id.type === "ISBN_10")?.identifier}
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