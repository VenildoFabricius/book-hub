"use client";

import "@/styles/estante.css";
import "@/styles/Card.css";
import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { useState } from "react";
import Card from "@/components/Card";
import { useEffect } from "react"; // Adicionei o import para useEffect

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
  text?: string; // Adicionando um campo para o texto do livro
}

export default function Estante() {
  const [busca, setBusca] = useState(""); // Estado para o input de busca
  const [livros, setLivros] = useState<Livro[]>([]); // Estado com tipagem para os resultados da busca
  const [livroSelecionado, setLivroSelecionado] = useState<Livro | null>(null);
  const [exibindoEstante, setExibindoEstante] = useState(false); // Controla exibição da estante
  const [estante, setEstante] = useState<Livro[]>([]); // Armazena livros da estante.json
  const [usuarioAutenticado, setUsuarioAutenticado] = useState(false); // Estado para verificar se o usuário está autenticado

  const buscaLivros = async () => {
    if (busca.trim() === "") {
      alert("Por favor, insira o nome de um livro.");
      return;
    }

    try {
      const resposta = await axios.get(
        `https://www.googleapis.com/books/v1/volumes?q=${busca}&sortBy=relevance&maxResults=40`
      );
      setLivros(resposta.data.items || []);
    } catch (error) {
      console.error("Erro ao buscar livros:", error);
      alert("Não foi possível buscar os livros. Tente novamente mais tarde.");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      buscaLivros();
    }
  };

  const selecionarLivro = (livro: Livro) => {
    setLivroSelecionado(livro);
  };

   const handleTextChange = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
  const newText = e.target.value;

  if (livroSelecionado) {
    // Atualiza o estado local
    setLivroSelecionado({
      ...livroSelecionado,
      text: newText,
    });

    // Envia a atualização para o servidor para ser salva no arquivo JSON
    try {
      await axios.post('/api/atualizarTexto', {
        id: livroSelecionado.id,
        text: newText,
      })
       .then(response => console.log('Texto salvo:', response.data))
  .catch(error => console.error('Erro ao salvar o texto:', error));;
      console.log('Texto salvo com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar o texto:', error);
      alert('Erro ao salvar o texto. Tente novamente.');
    }
  }
};
  

  const adicionarEstante = async (livroSelecionado: Livro) => {
    try {
      const livroFormatado = {
        id: livroSelecionado.id,
        volumeInfo: {
          title: livroSelecionado.volumeInfo.title,
          authors: livroSelecionado.volumeInfo.authors || [],
          publishedDate:
            livroSelecionado.volumeInfo.publishedDate || "Data desconhecida",
          imageLinks: {
            thumbnail:
              livroSelecionado.volumeInfo.imageLinks?.thumbnail ||
              "/placeholder.jpg",
            medium:
              livroSelecionado.volumeInfo.imageLinks?.medium ||
              "/placeholder.jpg",
          },
          description:
            livroSelecionado.volumeInfo.description ||
            "Descrição não disponível",
        },
      };

      const response = await fetch("/api/estante", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(livroFormatado),
      });

      if (!response.ok) {
        throw new Error("Erro ao conectar à API.");
      }

      const data = await response.json();
      console.log("Resposta da API:", data.message);
    } catch (error) {
      console.error("Erro ao adicionar livro:", error);
    }
  };

  const removerDaEstante = async (id: string) => {
    try {
      const response = await fetch("/api/estante", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error("Erro ao conectar à API.");
      }

      const data = await response.json();
      console.log("Resposta da API:", data.message);
    } catch (error) {
      console.error("Erro ao remover livro:", error);
    }
  };




  const carregarEstante = async () => {
    try {
      const resposta = await fetch("/api/estante");
      if (!resposta.ok) {
        throw new Error("Erro ao carregar estante.");
      }

      const livrosEstante = await resposta.json();
      setEstante(livrosEstante);
    } catch (error) {
      console.error("Erro ao carregar a estante:", error);
    }
  };

  // Carrega a estante automaticamente ao montar o componente
  useEffect(() => {
    if (usuarioAutenticado) {
      carregarEstante();
    }
  }, [usuarioAutenticado]);

  const alternarEstante = () => {
    if (!exibindoEstante) {
      carregarEstante(); // Carrega os livros da estante
    }
    setExibindoEstante(!exibindoEstante); // Alterna a exibição
  };

  return (
    <main>
      <header>
        <div id="logo">
          <Image
            src="/LogoBlack.png"
            alt="Logo do site BookHub"
            width={30}
            height={30}
          />
          <p id="book-hub">BookHub</p>
        </div>

        <div className="search-container">
          <input
            type="text"
            className="search-bar"
            placeholder="Encontre sua próxima história..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button className="search-btn" onClick={buscaLivros}>
            <FontAwesomeIcon icon={faMagnifyingGlass} id="lupa" />
          </button>
        </div>

        <a href="#" id="link-sair" onClick={() => setUsuarioAutenticado(false)}>
          Sair
        </a>
      </header>

      <section id="user-section">
        <div id="img-conteiner">
          <img src="/avatar.jpg" alt="Foto de perfil do usuário" />
        </div>
        <div>
          <p id="username-display">Nome do Usuário</p>
          <div id="info-cards">
            <div
              className="info-card"
              onClick={alternarEstante}
              style={{ cursor: "pointer" }}
            >
              <p>Estante</p>
              <p className="num-cards">{estante.length}</p>
            </div>
          </div>
        </div>
      </section>

      <section id="estante">
        {livroSelecionado ? (
          <section id="detalhes">
            <div id="voltar">
              <button
                id="voltar-icone"
                onClick={() => setLivroSelecionado(null)}
              >
                <FontAwesomeIcon icon={faArrowLeft} />
              </button>
              <p id="voltar-msg">Voltar para a pesquisa</p>
            </div>

            <div className="detalhes-livro">
              <img
                src={
                  livroSelecionado.volumeInfo.imageLinks?.medium ||
                  livroSelecionado.volumeInfo.imageLinks?.thumbnail ||
                  "/SemCapa.png"
                }
                alt={livroSelecionado.volumeInfo.title}
              />

              <div id="det-texto">
                <div id="dados-botoes">
                  <div id="det-dados">
                    <h3>{livroSelecionado.volumeInfo.title}</h3>
                    <p>
                      Autor(es):{" "}
                      {livroSelecionado.volumeInfo.authors?.join(", ") ||
                        "Autor desconhecido"}
                    </p>
                    <p>
                      Data de Publicação:{" "}
                      {livroSelecionado.volumeInfo.publishedDate ||
                        "Data desconhecida"}
                    </p>
                    {/* Campo para escrever um texto sobre o livro */}
                    <textarea
  value={livroSelecionado?.text || ""}
  onChange={handleTextChange}
  placeholder="Escreva sobre o livro..."
  rows={4}
  cols={50}
/>
                  </div>
                  <div id="botoes">
                    <button
                      onClick={() =>
                        livroSelecionado && adicionarEstante(livroSelecionado)
                      }
                    >
                      Adicionar à Estante
                    </button>

                    <button
                      onClick={() =>
                        livroSelecionado &&
                        removerDaEstante(livroSelecionado.id)
                      }
                    >
                      Remover da Estante
                    </button>
                  </div>
                </div>
                <p id="det-descr">
                  {livroSelecionado?.volumeInfo?.description ||
                    "Descrição não disponível"}
                </p>
              </div>
            </div>
          </section>
        ) : exibindoEstante ? (
          estante.length > 0 ? (
            estante.map((livro) => (
              <Card
                key={livro.id}
                titulo={livro.volumeInfo?.title || "Título não disponível"}
                autor={
                  livro.volumeInfo?.authors?.join(", ") || "Autor desconhecido"
                }
                ano={livro.volumeInfo?.publishedDate || "Ano não informado"}
                imagem={livro.volumeInfo.imageLinks?.thumbnail || "/placeholder.jpg"
                }
                descricao={
                  livro.volumeInfo?.description || "Descrição não disponível"
                }
                onClick={() => selecionarLivro(livro)}
              />
            ))
          ) : (
            <p>Não há livros na estante.</p>
          )
        ) : (
          livros.map((item) => (
            <Card
              key={item.id}
              titulo={item?.volumeInfo?.title || "Título não disponível"} // Verifica se volumeInfo e title existem
              autor={
                item?.volumeInfo?.authors?.join(", ") || "Autor desconhecido"
              }
              ano={item?.volumeInfo?.publishedDate || "Data desconhecida"}
              imagem={item?.volumeInfo?.imageLinks?.thumbnail || "/SemCapa.png"}
              descricao={""} // A descrição não está sendo passada, mas pode ser configurada aqui se necessário
              onClick={() => selecionarLivro(item)}
            />
          ))
        )}
      </section>
    </main>
  );
}
