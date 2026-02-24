const Maintenance = () => {
  return (
    <div className="bg-gray-100">
      <div className="flex min-h-screen flex-col items-center justify-center">
        <img
          alt="Logo"
          className="mb-8 h-40"
          src="/img/home/cogs-settings.svg"
        />
        <h1 className="mb-4 text-center font-bold text-4xl text-gray-700 md:text-5xl lg:text-6xl">
          Site is under maintenance
        </h1>
        <p className="mb-8 text-center text-gray-500 text-lg md:text-xl lg:text-2xl">
          We&apos;re working hard to improve the user experience. Stay tuned!
        </p>
      </div>
    </div>
  );
};

export default Maintenance;
