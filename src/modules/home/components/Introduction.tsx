const Introduction = () => {
  return (
    <section className="bg-cover bg-no-repeat ">
      <div className="space-y-3">
        <div className="flex gap-2 text-2xl lg:text-3xl font-medium font-sora">
          <h1>Hi, I&apos;m Fiqri</h1>{" "}
          <div className="ml-1 animate-waving-hand">👋</div>
        </div>
        <div className="space-y-4">
          <ul className="flex flex-col lg:flex-row gap-1 lg:gap-10 ml-5 list-disc text-neutral-700 dark:text-neutral-400 font-sora">
            <li>Working Remotely</li>
            <li>
              Based in Makassar, Indonesia <span className="ml-1">🇮🇩</span>
            </li>
          </ul>
        </div>
      </div>

      <p className="leading-[1.8] md:leading-loose mt-6 text-neutral-800 dark:text-neutral-300 font-sora">
        I am a recent graduate in the field of informatics engineering with work
        experience in several academic and projects personal. I have extensive
        knowledge in web and mobile application development. I am very  
        interested in starting a career as a programmer and I am ready to learn
        more about software development and the latest technologies. I have High
        enthusiasm, desire to learn, and also the ability to work in a strong
        team.
      </p>
    </section>
  );
};

export default Introduction;
