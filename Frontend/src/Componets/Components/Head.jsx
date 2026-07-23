import React from "react";

const Head = ({ subtitle, title }) => {
  return (
    <section className='h-[45vh] md:h-[55vh] mt-18 bg-[url("/images/Head.jpg")] bg-cover bg-center w-full flex items-end justify-start'>
      <div className="p-6 md:p-12 text-left">
        <h1 className="text-2xl lg:text-4xl font-bold text-white drop-shadow-lg">
          {title}
        </h1>
        <p className="mt-2 text-base flex items-center lg:text-lg text-white/90">{subtitle}</p>
      </div>
    </section>
  );
};

export default Head;