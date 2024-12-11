"use client";

import "@/styles/estante.css";
import Image from "next/image";
import CardEstante, { CardProps } from "@/components/card-estante";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";
import { logout } from "@/utils/auth";
import { isSessionValid } from "@/utils/auth";
import { listarLivros } from "@/utils/crud-db";
import { excluirLivros } from "@/utils/crud-db";
import { editarLivros } from "@/utils/crud-db";

export default function Estante() {
  const [busca, setBusca] = useState("");                                                     // Estado para o input de busca
  const [usuario, setUsuario] = useState<string>("");                                         // Estado para pegar o email do usuario logado
  const [livros, setLivros] = useState<CardProps[]>([]);                                      // Estado para os livros da estante do usuário
  const [livroSelecionado, setLivroSelecionado] = useState<CardProps | null>(null);           // Estado do livro selecionado
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<string>("Todos");          // Categoria inicial: "Todos"
  const [editando, setEditando] = useState(false);                                            // Estado para definir a condição de edição dos comentários do livro
  const [novoComentario, setNovoComentario] = useState(livroSelecionado?.comentarios || "");  // Estado para atualizar o novo comentário do livro
  const router = useRouter();

  // Faz uma requisição à API Google Books com o termo inserido no input
  const buscaLivros = async () => {
    //caso o input esteja vazio, não realiza a busca
    if (busca.trim() === "") {
      return;
    }

    // Redireciona para a página de pesquisa com o termo como query param
    router.push(`/main?busca=${encodeURIComponent(busca)}`);
  };

  // Obtém o email do usuário logado
  useEffect(() => {
    async function buscaUsuario() {
      const session = await isSessionValid(); // Chama a função isSessionValid para ober os dados do usuário
      if (session && typeof session.email === "string") {
        // Se o usuáio estiver logado
        setUsuario(session.email); // Estado atualizado com o email do usuário
      }
    }
    buscaUsuario(); //Chama a função buscaUsuario. É chamada imediatamente para verificar a sessão do usuário assim que ele logar
  }, []); // [] Garante que o useEffect seja executado somente uma vez para evitar chamadas desnecessárias a isSessionValid()

  // Lista os livros que o usuário possui na estante
  useEffect(() => {
    const userBooks = async () => {
      if (!usuario)
        return; // Aguarda até que 'usuario' seja atribuído
      const livrosEstante = await listarLivros(usuario); // Obtém os livros da estante do usuário, armazenados no banco de dados
      setLivros(livrosEstante); // Atribui os livros retornados por 'listarLivros' à variável 'livros'
    };


    userBooks();
  }, [usuario]); // Executa o useEffect sempre que houver alteração na variável 'usuario'

  // Filtra os livros de acordo com a categoria selecionada
  // livros.filter: Cria uma nova lista contendo apenas os livros daquela categoria selecionada
  const livrosFiltrados = livros.filter((livro) => {
    //se a categoria selecionada for "Todos", todos os livros serão incluídos em livrosFiltrados.
    if (categoriaSelecionada === "Todos")
      return true;
    return livro.categoria === categoriaSelecionada;
  });

  // Exclui o livro selecionado da estante
  const ExcluirLivro = async (isbn: string) => {
    try {
      // Procura o livro na estante do usuário no banco de dados
      await excluirLivros(usuario, isbn);
      alert("Livro excluído com sucesso!");
      // Atualiza a lista de livros
      const livrosAtualizados = await listarLivros(usuario);
      // Atualiza o estado dos livros da estante
      setLivros(livrosAtualizados);
      // Volta para a estante ao definir que não há livro selecionado
      setLivroSelecionado(null);
    } catch (error) {
      alert("Não foi possível excluir o livro.");
    }
  };

  // Executa a função 'buscaLivros' ao pressionar a tecla 'Enter'
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      buscaLivros();
    }
  };

  // Usa um useState para atribuir o livro selecionado à variável 'livroSelecionado'
  const selecionarLivro = (livro: CardProps) => {
    setLivroSelecionado(livro);
  };

  // Redireciona o usuário para a estante
  const minhaEstante = () => {
    router.push("/main/estante");
  };

  // Finaliza a sessão do usuário e o redireciona para a página inicial
  const finalizaSessao = async () => {
    await logout();
    router.push("/");
  };

  // Edita o comentário do livro
  const salvarComentario = async () => {
    if (livroSelecionado && livroSelecionado.ISBN) {
      try {
        await editarLivros(usuario, livroSelecionado.ISBN, novoComentario);

        const livrosAtualizados = livros.map((livro) =>   // Mapeia os livros da estante
          livro.ISBN === livroSelecionado.ISBN            // Se o ISBN corresponder ao livro selecionado,
            ? { ...livro, comentarios: novoComentario }   // cria um novo objeto 'livro' com o comentário atualizado.
            : livro                                       // Caso contrário, mantém o objeto original
        );

        setLivros(livrosAtualizados);

        setLivroSelecionado({
          ...livroSelecionado,            // Copia todas as propriedades do livro selecionado
          comentarios: novoComentario,    // Atualiza a propriedade 'comentarios' com o novo comentário
        });

        setEditando(false);

      } catch (error) {
        console.error("Erro ao salvar o comentário:", error);
        alert("Não foi possível salvar o comentário. Tente novamente.");
      }
    } else {
      console.error("ISBN do livro não encontrado.");
      alert(
        "ISBN do livro não encontrado. Não foi possível salvar o comentário."
      );
    }
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
            <FontAwesomeIcon icon={faMagnifyingGlass} className="lupa" />
          </button>
        </div>

        <div>
          <a href="#" className="link" onClick={minhaEstante}>
            Minha Estante
          </a>
          <a href="#" className="link" onClick={finalizaSessao}>
            Sair
          </a>
        </div>
      </header>

      <section id="user-section">
        <div id="img-conteiner">
          <img src="/avatar.jpg" alt="Foto de perfil do usuário" />
        </div>
        <div>
          <p id="username-display">{usuario}</p>
          <div id="info-cards">
            <div
              className="info-card"
              onClick={() => setCategoriaSelecionada("Todos")}
            >
              <p>Todos</p>
              <p className="num-cards">{livros.length}</p>
            </div>
            <div
              className="info-card"
              onClick={() => setCategoriaSelecionada("Lidos")}
            >
              <p>Lidos</p>
              <p className="num-cards">
                {livros.filter((livro) => livro.categoria === "Lidos").length}
              </p>
            </div>
            <div
              className="info-card"
              onClick={() => setCategoriaSelecionada("Lendo")}
            >
              <p>Lendo</p>
              <p className="num-cards">
                {livros.filter((livro) => livro.categoria === "Lendo").length}
              </p>
            </div>
            <div
              className="info-card"
              onClick={() => setCategoriaSelecionada("Quero Ler")}
            >
              <p>Quero Ler</p>
              <p className="num-cards">
                {
                  livros.filter((livro) => livro.categoria === "Quero Ler")
                    .length
                }
              </p>
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
              <p id="voltar-msg">Voltar para a minha estante</p>
            </div>

            <div className="detalhes-livro">
              <img
                src={livroSelecionado.capa || "/SemCapa.png"}
                alt={livroSelecionado.titulo}
              />

              <div id="det-texto">
                <div id="dados-botoes">
                  <div id="det-dados">
                    <h3>{livroSelecionado.titulo}</h3>
                    <p>
                      Autor(es):{" "}
                      {livroSelecionado.autor || "Autor desconhecido"}
                    </p>
                    <p>
                      Data de Publicação:{" "}
                      {livroSelecionado.data || "Data desconhecida"}
                    </p>
                  </div>
                  <div id="botoes">
                    <button
                      onClick={() => {
                        setEditando(true);
                        setNovoComentario(livroSelecionado?.comentarios || ""); // Preenche o texto com o comentário atual
                      }}
                    >
                      Editar
                    </button>

                    <button
                      onClick={() => ExcluirLivro(livroSelecionado?.ISBN!)}
                    >
                      Excluir
                    </button>
                  </div>
                </div>
                <p id="det-descr">
                  {editando ? (
                    <>
                      <textarea
                        value={novoComentario}
                        onChange={(e) => setNovoComentario(e.target.value)}
                        rows={4}
                        style={{ width: "100%", padding: "10px" }}
                      />
                      <button className="salvar-btn" onClick={salvarComentario}>
                        Salvar
                      </button>
                      <button
                        className="cancelar-btn"
                        onClick={() => setEditando(false)}
                      >
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <>{livroSelecionado?.comentarios || "Nenhum comentário"}</>
                  )}
                </p>
              </div>
            </div>
          </section>
        ) : (
          livrosFiltrados.map((item) => (
            <CardEstante
              key={item.ISBN}
              titulo={item.titulo}
              capa={item.capa || "/SemCapa.png"} // Exibe uma imagem padrão caso não exista
              categoria={item.categoria}
              onClick={() => selecionarLivro(item)} // Passa o livro para o estado 'selecionado'
            />
          ))
        )}
      </section>
    </main>
  );
}
