import Image from "next/image";
import PropTypes from "prop-types";

type CardProps = {
    titulo: string;
    autor: string;
    ano: string;
    imagem: string;
    descricao: string;
    onClick: () => void; 
  };

  export default function Card({ titulo, autor, ano, imagem, onClick }: CardProps) {
    return (
      <div className="card" onClick={onClick}>
        <Image
          src={imagem || "/placeholder.jpg"}
          alt={`Capa do livro ${titulo || "Desconhecido"}`}
          width={128}
          height={192}
        />
        <h3>{titulo || "Título não disponível"}</h3>
        <p>{autor || "Autor desconhecido"}</p>
        <p>{ano || "Ano não informado"}</p>
      </div>
    );
  }
  

Card.propTypes = {
    titulo: PropTypes.string,
    autor: PropTypes.string,
    ano: PropTypes.string,
    imagem: PropTypes.string,
    descricao: PropTypes.string
  };