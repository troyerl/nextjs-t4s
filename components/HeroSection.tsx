interface HeroSectionProps {
  text?: string;
}

const HeroSection = ({
  children,
  header,
}: {
  children: React.ReactNode;
  header?: React.ReactNode;
}) => {
  return (
    <div className="screen-width-border flex w-screen flex-col items-center justify-items-center gap-4 bg-[url(/assets/svg/overlay.svg)] bg-cover bg-no-repeat p-4 py-20 text-center lg:items-start lg:pt-40 lg:text-left">
      {header}
      {children}
    </div>
  );
};

export const BaseHeroSubHeader = ({ text }: HeroSectionProps) => (
  <h2 className="animate-slide-in-from-bottom text-base text-white lg:max-w-1/2 lg:text-xl">
    {text}
  </h2>
);

interface StackedHeaderProps {
  main: string;
  subtext: string;
}

export const StackedHeader = ({ main, subtext }: StackedHeaderProps) => {
  const subTextArray = subtext.split(" ");
  return (
    <>
      <h1
        className="flex flex-col gap-1.5 text-4xl font-semibold lg:items-start lg:text-6xl"
        aria-label={`${main} ${subtext}`}
      >
        <span aria-hidden="true">
          <span className="text-primary animate-slide-in-from-right">
            {main}
          </span>
          <span className="flex justify-center gap-1.5 text-white lg:justify-start lg:gap-2.5">
            {subTextArray.map((text, idx) => (
              <span
                key={text}
                className={`animate-slide-in-from-bottom opacity-0`}
                style={{ animationDelay: `${idx * 0.2}s` }}
              >
                {text}
              </span>
            ))}
          </span>
        </span>
      </h1>
    </>
  );
};

export default HeroSection;
