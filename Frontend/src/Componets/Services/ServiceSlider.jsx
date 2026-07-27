import { useState } from "react";
import SliderLib from "react-slick";
const Slider = SliderLib.default ? SliderLib.default : SliderLib;

const PieceImage = ({ src, rows = 3, cols = 3, active }) => {
  const pieces = [];
  const pieceWidth = 100 / cols;
  const pieceHeight = 100 / rows;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const randomX = Math.random() * 100 - 50;
      const randomY = Math.random() * 100 - 50;
      const randomRotate = Math.random() * 90 - 45;

      pieces.push(
        <div
          key={`${row}-${col}-${active}`}
          className="absolute"
          style={{
            width: `${pieceWidth}%`,
            height: `${pieceHeight}%`,
            top: `${row * pieceHeight}%`,
            left: `${col * pieceWidth}%`,
            backgroundImage: `url(${src})`,
            backgroundSize: `${cols * 100}% ${rows * 100}%`,
            backgroundPosition: `${(col / (cols - 1)) * 100}% ${(row / (rows - 1)) * 100}%`,
          }}
        />
      );
    }
  }

  return (
    <div className="relative w-full h-[240px] md:h-[400px] overflow-hidden rounded-xl shadow-lg">
      {pieces}
    </div>
  );
};

const ServiceSlider = ({ images }) => {
  const [active, setActive] = useState(0);

  const settings = {
    dots: false,
    infinite: true,
    speed: 1000,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    fade: true,
    beforeChange: (oldIndex, newIndex) => setActive(newIndex), 
  };

  return (
    <Slider {...settings} className="w-full max-w-xl">
      {images.map((img, i) => (
        <PieceImage key={i} src={img} rows={4} cols={6} active={active} />
      ))}
    </Slider>
  );
};

export default ServiceSlider;