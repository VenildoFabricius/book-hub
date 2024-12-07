"use client"

import "@/styles/home.css";
import Image from "next/image";
import axios from "axios";
import Card from '@/components/Card';
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { logout } from "@/utils/auth";
import { isSessionValid } from "@/utils/auth";
import { addLivroEstante } from "@/utils/crud-db"


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
    const [usuario, setUsuario] = useState<string>(""); //Estado para pegar o email do usuario logado
    const [busca, setBusca] = useState(buscaParam);  // Declarar o estado de 'busca'
    const [livros, setLivros] = useState<Livro[]>([]); // Estado com tipagem para os resultados da busca
    const [livroSelecionado, setLivroSelecionado] = useState<Livro | null>(null);

    const [categoriaSelecionada, setCategoriaSelecionada] = useState("Todos"); // Estado para a categoria selecionada

    const [todos, setTodos] = useState<Livro[]>([]); // Todos os livros
    const [lidos, setLidos] = useState<Livro[]>([]); // Livros lidos
    const [lendo, setLendo] = useState<Livro[]>([]); // Livros que estão sendo lidos
    const [queroLer, setQueroLer] = useState<Livro[]>([]); // Livros que o usuário quer ler
    const [isLoading, setIsLoading] = useState(false); // Estado para controlar a exibição do 'loading'
    const router = useRouter();

    // useEffect para realizar a pesquisa caso haja um parâmetro de busca na URL
    useEffect(() => {
        // Só faz a busca quando o parâmetro de busca mudar
        if (busca) {
            buscaLivros();
        }
    }, []);

    const buscaLivros = async () => {
        //caso o input esteja vazio, não faz a busca
        if (busca.trim() === "") {
            return;
        }

        setIsLoading(true);  // Inicia o estado de carregamento

        try {
            const resposta = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(busca)}&maxResults=40`);
            setLivros(resposta.data.items || []);

        } catch (error) {
            console.error("Erro ao buscar livros:", error);
            alert("Não foi possível buscar os livros. Tente novamente mais tarde.");
        } finally {
            setIsLoading(false);  // Finaliza o estado de carregamento
        }
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
    }, []); //[] Garante que o useEffect seja executado somente uma vez para evitar chamadas desnecessárias a isSessionValid()

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            router.push(`/main?busca=${encodeURIComponent(busca)}`);
            buscaLivros();
        }
    }

    const selecionarLivro = (livro: Livro) => {
        setLivroSelecionado(livro);
    }

    const addToLidos = (livro: Livro) => {
        if (!lidos.includes(livro)) {
            setLidos((prev) => [...prev, livro]); // Adiciona o livro a "Lidos"

            if (usuario) {
                // Adiciona o livro à estante com as duas categorias, mas verifica se ele já está na estante
                addLivroEstante(usuario, livro, "Lidos")
                    .then(() => alert("Livro adicionado à estante: 'Lidos'"))
                    .catch((error) => console.error("Erro ao adicionar livro à estante:", error));
            }
        }
    };

    const addToLendo = (livro: Livro) => {
        if (!lendo.includes(livro)) {
            setLendo((prev) => [...prev, livro]); // Adiciona o livro a "Lendo"

            if (usuario) {
                // Adiciona o livro à estante com as duas categorias, mas verifica se ele já está na estante
                addLivroEstante(usuario, livro, "Lendo")
                    .then(() => alert("Livro adicionado à estante: 'Lendo'"))
                    .catch((error) => console.error("Erro ao adicionar livro à estante:", error));
            }
        }
    };

    const addToQueroLer = (livro: Livro) => {
        if (!queroLer.includes(livro)) {
            setQueroLer((prev) => [...prev, livro]); // Adiciona o livro a "Quero Ler"

            if (usuario) {
                // Adiciona o livro à estante com as duas categorias, mas verifica se ele já está na estante
                addLivroEstante(usuario, livro, "Quero Ler")
                    .then(() => alert("Livro adicionado à estante: 'Quero Ler'"))
                    .catch((error) => console.error("Erro ao adicionar livro à estante:", error));
            }
        }
    };

    //const addLivro = (usuario: string, livroSelecionado: Livro) => {
    //    addLivroEstante(usuario, livroSelecionado);
    //    alert('Livro adicionado à estante com sucesso!');
    //}

    const filtrarLivrosPorCategoria = () => {
        switch (categoriaSelecionada) {
            case "Lidos":
                return lidos;
            case "Lendo":
                return lendo;
            case "Quero Ler":
                return queroLer;
            default:
                return livros; // Mostra todos os livros se nenhuma categoria for selecionada
        }
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
                        <div className="info-card" onClick={() => setCategoriaSelecionada("Lidos")}>
                            <p>Lidos</p>
                            <p className="num-cards">{lidos.length}</p>
                        </div>
                        <div className="info-card" onClick={() => setCategoriaSelecionada("Lendo")}>
                            <p>Lendo</p>
                            <p className="num-cards">{lendo.length}</p>
                        </div>
                        <div className="info-card" onClick={() => setCategoriaSelecionada("Quero Ler")}>
                            <p>Quero Ler</p>
                            <p className="num-cards">{queroLer.length}</p>
                        </div>
                    </div>
                </div>
            </section>

            {isLoading ? (
                <h2 id='procurando'><FontAwesomeIcon icon={faMagnifyingGlass} id='lupa' />   Procurando...</h2>
            ) : (
                <section id="pesq-estante">
                    {livroSelecionado ? (
                        <section id='detalhes'>

                            <div id='voltar'>
                                <button id='voltar-icone' onClick={() => setLivroSelecionado(null)}><FontAwesomeIcon icon={faArrowLeft} /></button>
                                <p id="voltar-msg">Voltar para a pesquisa</p>
                            </div>

                            <div className="detalhes-livro">
                                <img src={livroSelecionado.volumeInfo.imageLinks?.thumbnail ||
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
                                            <button onClick={() => { addToLidos(livroSelecionado!); }}>Lido</button>
                                            <button onClick={() => { addToLendo(livroSelecionado!); }}>Lendo</button>
                                            <button onClick={() => { addToQueroLer(livroSelecionado!); }}>Quero Ler</button>
                                        </div>
                                    </div>
                                    <p id='det-descr'>{livroSelecionado.volumeInfo.description || "Descrição não disponível"}</p>
                                </div>

                            </div>
                        </section>

                    ) : (
                        livros.map((item) => (
                            <Card
                                key={item.volumeInfo.industryIdentifiers?.find(id => id.type === "ISBN_13")?.identifier || // Identificador único: ISBN ou titulo do livro
                                    item.volumeInfo.industryIdentifiers?.find(id => id.type === "ISBN_10")?.identifier}
                                titulo={item.volumeInfo.title}
                                autor={item.volumeInfo.authors?.join(", ") || "Autor desconhecido"}
                                ano={item.volumeInfo.publishedDate || "Data desconhecida"}
                                imagem={item.volumeInfo.imageLinks?.thumbnail || "/SemCapa.png"} // Exibe uma imagem padrão caso não exista capa na API
                                descricao=''
                                onClick={() => selecionarLivro(item)} // Passa o livro para o estado 'selecionado'
                            />
                        ))
                    )}
                </section>
            )}
        </main>
    );
}