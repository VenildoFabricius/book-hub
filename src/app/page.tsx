"use client";

import '@/app/page.css';
import '@/styles/Card.css';
import Image from "next/image";
import Link from 'next/link';
import axios from "axios";
import Card from '@/components/Card';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useState } from "react";


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

export default function Home() {
  const [busca, setBusca] = useState("");                                       // Estado para o input de busca
  const [livros, setLivros] = useState<Livro[]>([]);                            // Estado com tipagem para os resultados da busca
  const [livroSelecionado, setLivroSelecionado] = useState<Livro | null>(null); // Estado do livro selecionado
  const [isLoading, setIsLoading] = useState(false);                            // Estado para controlar a exibição do 'loading'

  // Faz uma requisição à API Google Books com o termo inserido no input
  const buscaLivros = async () => {
    if (busca.trim() === "") { // Caso o input esteja vazio                       
      alert("Por favor, insira o nome de um livro.");
      return;
    }

    setIsLoading(true);  // Inicia o estado de carregamento

    // Tenta fazer a requisição com o termo de busca
    try {
      const resposta = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=${busca}&maxResults=40`);
      setLivros(resposta.data.items || []); // Atribui o retorno da API à variável 'livros' através do useState

    } catch (error) { // Caso ocorra algum erro na requisição
      console.error("Erro ao buscar livros:", error);
      alert("Não foi possível buscar os livros. Tente novamente mais tarde."); // Alerta o usuário
    } finally {             // Ocorrendo erros ou não,
      setIsLoading(false);  // Finaliza o estado de carregamento
    }
  };

  // Executa a função 'buscaLivros' ao pressionar a tecla 'Enter'
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      buscaLivros();
    }
  }

  // Usa um useState para atribuir o livro selecionado à variável 'livroSelecionado'
  const selecionarLivro = (livro: Livro) => {
    setLivroSelecionado(livro);
  };


  return (
    <main>
      <header>
        <Image src="/LogoBlack.png" alt='Logo do site BookHub' width={40} height={40} />
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
        <img id='img-apres' src="/ilustracao.jpg" alt="Ilustração menina voando em livros" />
      </div>

      <div className='search-container'>
        <input type="text"
          className='search-bar'
          placeholder='Encontre sua próxima história...'
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button className='search-btn' onClick={buscaLivros}><FontAwesomeIcon icon={faMagnifyingGlass} className='lupa' /></button>
      </div>

      {isLoading ? ( 
        <h2 id='procurando'><FontAwesomeIcon icon={faMagnifyingGlass} className='lupa'/>   Procurando...</h2>
      ) : (
        <section id='search-results'>
          {livroSelecionado ? ( // Se um livro foi selecionado, exibe os seus detalhes
            <section id='detalhes'>

              <div id='voltar'>
                <button id='voltar-icone' onClick={() => setLivroSelecionado(null)}><FontAwesomeIcon icon={faArrowLeft} /></button>
                <p id="voltar-msg">Voltar para a pesquisa</p>
              </div>

              <div className="detalhes-livro">
                <img src={livroSelecionado.volumeInfo.imageLinks?.thumbnail || "/SemCapa.png"} alt={livroSelecionado.volumeInfo.title} />

                <div id='det-texto'>
                  <div id='det-dados'>
                    <h3>{livroSelecionado.volumeInfo.title}</h3>
                    <p>Autor(es): {livroSelecionado.volumeInfo.authors?.join(", ") || "Autor desconhecido"}</p>
                    <p>Data de Publicação: {livroSelecionado.volumeInfo.publishedDate || "Data desconhecida"}</p>
                  </div>
                  <p id='det-descr'>{livroSelecionado.volumeInfo.description || "Descrição não disponível"}</p>
                </div>

              </div>
            </section>

          ) : ( // Se não há livro selecionado, exibe os resultados da busca
            livros.map((item) => (
              <Card
                key={item.volumeInfo.industryIdentifiers?.find(id => id.type === "ISBN_13")?.identifier ||
                  item.volumeInfo.industryIdentifiers?.find(id => id.type === "ISBN_10")?.identifier} // Os livros são identificados pelo ISBN
                titulo={item.volumeInfo.title}
                autor={item.volumeInfo.authors?.join(", ") || "Autor desconhecido"}
                ano={item.volumeInfo.publishedDate || "Data desconhecida"}
                imagem={item.volumeInfo.imageLinks?.thumbnail || "/SemCapa.png"} // Se a API não retornar uma imagem de capa, exibe uma imagem padrão
                descricao=''
                onClick={() => selecionarLivro(item)} // Passa o livro para o estado
              />
            ))
          )}
        </section>
      )}
    </main>
  );
}
