import Image from "next/image";
import PropTypes from "prop-types";

export interface CardProps {
  ISBN?: string;
  capa: string;
  titulo: string;
  autor?: string,
  data?: string,
  comentarios?: string
  onClick: () => void;
};

export default function CardEstante({ titulo, capa, onClick }: CardProps) {
  return (
    <div className="card" onClick={onClick}>
      <Image
        src={capa || "/SemCapa.png"} // Imagem padrão caso não tenha uma fornecida
        alt={`Capa do livro ${titulo}`}
        width={128}
        height={192}
      />
      <h3>{titulo}</h3>
    </div>
  )
}

CardEstante.propTypes = {
  ISBN: PropTypes.string,
  capa: PropTypes.string,
  titulo: PropTypes.string,
  autor: PropTypes.string,
  data: PropTypes.string
};