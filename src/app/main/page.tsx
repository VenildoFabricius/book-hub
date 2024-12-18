"use client";

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
import { addLivroEstante } from "@/utils/crud-db";

//nessa interface, nós temos:
/*
    industryIdentifiers
        type: ISBN_13 ou ISBN_10
        identifier: é um id exclusivo daquele livro da própria API

 */
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
    const buscaParam = searchParams.get("busca") || "";     // Obtém o termo de busca da URL
    const [usuario, setUsuario] = useState<string>("");     // Estado para obter o email do usuario logado
    const [busca, setBusca] = useState(buscaParam);         // Declarar o estado de 'busca'
    const [livros, setLivros] = useState<Livro[]>([]);      // Estado com tipagem para os resultados da busca
    const [livroSelecionado, setLivroSelecionado] = useState<Livro | null>(null);  // Estado do livro selecionado
    const [lidos, setLidos] = useState<Livro[]>([]);        // Livros lidos
    const [lendo, setLendo] = useState<Livro[]>([]);        // Livros que estão sendo lidos
    const [queroLer, setQueroLer] = useState<Livro[]>([]);  // Livros que o usuário quer ler
    const [isLoading, setIsLoading] = useState(false);      // Estado para controlar a exibição do 'loading'
    const router = useRouter();

    // useEffect para realizar a pesquisa caso haja um parâmetro de busca na URL
    useEffect(() => {
        // Só faz a busca quando o parâmetro de busca mudar
        if (busca) {
            buscaLivros();
        }
    }, []);

    // Faz uma requisição à API Google Books com o termo inserido no input
    const buscaLivros = async () => {
        // Caso o input esteja vazio, não faz a busca
        if (busca.trim() === "") {
            return;
        }

        setIsLoading(true);  // Inicia o estado de carregamento, que é o h2 "carregando" 

        try {
            // Realiza a requisição à API usando o axios
            // O encodeURIComponent garante que os caracteres especiais sejam codificados corretamente, evitando problemas de formatação na URL
            const resposta = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(busca)}&maxResults=40`);

            setLivros(resposta.data.items || []);

        } catch (error) {
            console.error("Erro ao buscar livros:", error);
            alert("Não foi possível buscar os livros. Tente novamente mais tarde.");
        } finally {
            setIsLoading(false);  // Finaliza o estado de carregamento
        }
    }

    // Obtém o email do usuário logado
    useEffect(() => {
        async function buscaUsuario() {
            const session = await isSessionValid();             //Chama a função isSessionValid para ober os dados do usuário
            if (session && typeof session.email === 'string') { //Se o usuário estiver logado
                setUsuario(session.email);                      //Estado atualizado com o email do usuário
            }
        }

        buscaUsuario(); // Chama a função buscaUsuario. É chamada imediatamente para verificar a sessão do usuário assim que ele logar
    }, []); // [] Garante que o useEffect seja executado somente uma vez para evitar chamadas desnecessárias a 'isSessionValid'


    // Executa a função 'buscaLivros' ao pressionar a tecla 'Enter'
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            router.push(`/main?busca=${encodeURIComponent(busca)}`);
            buscaLivros();
        }
    }

    // Usa um useState para atribuir o livro selecionado à variável 'livroSelecionado'
    const selecionarLivro = (livro: Livro) => {
        setLivroSelecionado(livro);
    }

    //no JSON temos uma parte chamada "categoria" e nela, possuímos 3 tipos de categoria: Lidos, Lendo e Quero ler
    //Após o usuário logar e buscar por um livro, ele pode adicionar uma desses 3 tipos de categoria ao livro. Isso fica armazenado no JSON
    const addToLidos = (livro: Livro) => {
        //estamos nos certificando que o livro não está na categoria lidos
        if (!lidos.includes(livro)) {
            //estamos atualizando o estado da lista lidos para incluir o novo livro
            /*
            prev: Estado anterior (antes de adicionar o livro).
            [...prev, livro]: Cria uma nova lista contendo todos os elementos da lista anterior (prev) e adiciona o novo livro ao final
            */
            setLidos((prev) => [...prev, livro]); // Adiciona o livro a "Lidos"

            //estamos verificando se o usuário esta autenticado
            if (usuario) {
                // Adiciona o livro à estante com a categoria
                addLivroEstante(usuario, livro, "Lidos")
                    .then(() => alert("Livro adicionado à estante: 'Lidos'"))
                    .catch((error) => console.error("Erro ao adicionar livro à estante:", error));
            }
        }
    };

    // Adiciona o livro na estante, na categoria "Lendo"
    const addToLendo = (livro: Livro) => {
        if (!lendo.includes(livro)) {
            setLendo((prev) => [...prev, livro]);

            if (usuario) {
                // Adiciona o livro à estante com a categoria
                addLivroEstante(usuario, livro, "Lendo")
                    .then(() => alert("Livro adicionado à estante: 'Lendo'"))
                    .catch((error) => console.error("Erro ao adicionar livro à estante:", error));
            }
        }
    };

    // Adiciona o livro na estante, na categoria "Quero Ler"
    const addToQueroLer = (livro: Livro) => {
        if (!queroLer.includes(livro)) {
            setQueroLer((prev) => [...prev, livro]);

            if (usuario) {
                // Adiciona o livro à estante com a categoria
                addLivroEstante(usuario, livro, "Quero Ler")
                    .then(() => alert("Livro adicionado à estante: 'Quero Ler'"))
                    .catch((error) => console.error("Erro ao adicionar livro à estante:", error));
            }
        }
    };

    // Redireciona o usuário para a estante
    const minhaEstante = () => {
        router.push('/main/estante');
    }

    // Finaliza a sessão do usuário e o redireciona para a página inicial
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
                    <button className="search-btn" onClick={buscaLivros}><FontAwesomeIcon icon={faMagnifyingGlass} className="lupa" /></button>
                </div>

                <div>
                    <a href="#" className="link" onClick={minhaEstante}>Minha Estante</a>
                    <a href="#" className="link" onClick={finalizaSessao}>Sair</a>
                </div>
            </header>

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
                        livros.map((item, index) => (
                            <Card
                                key={
                                    item.volumeInfo.industryIdentifiers?.find(id => id.type === "ISBN_13")?.identifier ||
                                    item.volumeInfo.industryIdentifiers?.find(id => id.type === "ISBN_10")?.identifier ||
                                    `${item.volumeInfo.title}-${index}`
                                }
                                titulo={item.volumeInfo.title}
                                autor={item.volumeInfo.authors?.join(", ") || "Autor desconhecido"}
                                ano={item.volumeInfo.publishedDate || "Data desconhecida"}
                                imagem={item.volumeInfo.imageLinks?.thumbnail || "/SemCapa.png"}
                                descricao=''
                                onClick={() => selecionarLivro(item)}
                            />
                        ))
                    )}
                </section>
            )}
        </main>
    );
}